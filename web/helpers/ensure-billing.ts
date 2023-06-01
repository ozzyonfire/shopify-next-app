import { Session } from "@shopify/shopify-api";
import { GraphqlClient } from "@shopify/shopify-api/lib/clients/graphql/graphql_client";
import shopify from "../lib/initialize-context";

export const BillingInterval = {
	OneTime: "ONE_TIME",
	Every30Days: "EVERY_30_DAYS",
	Annual: "ANNUAL",
};

const RECURRING_INTERVALS = [
	BillingInterval.Every30Days,
	BillingInterval.Annual,
];

let isProd: boolean;

// Todo: Grab the GraphQl types from the Shopify API

export interface IBillingOptions {
	chargeName: string;
	amount: number;
	currencyCode: string;
	interval?: string;
}

/**
 * You may want to charge merchants for using your app. This helper provides that function by checking if the current
 * merchant has an active one-time payment or subscription named `chargeName`. If no payment is found,
 * this helper requests it and returns a confirmation URL so that the merchant can approve the purchase.
 *
 * Learn more about billing in our documentation: https://shopify.dev/apps/billing
 */
export default async function ensureBilling(
	session: Session,
	billingOptions: IBillingOptions,
	isProdOverride = process.env.NODE_ENV === "production"
) {
	const { chargeName, amount, currencyCode, interval } = billingOptions;
	if (interval && !Object.values(BillingInterval).includes(interval)) {
		throw `Unrecognized billing interval '${interval}'`;
	}

	isProd = isProdOverride;

	let hasPayment;
	let confirmationUrl = null;

	if (await hasActivePayment(session, billingOptions)) {
		hasPayment = true;
	} else {
		hasPayment = false;
		confirmationUrl = await requestPayment(session, {
			chargeName,
			amount,
			currencyCode,
			interval,
		});
	}

	return [hasPayment, confirmationUrl];
}

async function hasActivePayment(session: Session, { chargeName, interval }: IBillingOptions) {
	const client = new shopify.clients.Graphql({ session });

	if (isRecurring(interval)) {
		const currentInstallations = await client.query<any>({
			data: RECURRING_PURCHASES_QUERY,
		});
		const subscriptions =
			currentInstallations.body.data.currentAppInstallation.activeSubscriptions;

		for (let i = 0, len = subscriptions.length; i < len; i++) {
			if (
				subscriptions[i].name === chargeName &&
				(!isProd || !subscriptions[i].test)
			) {
				return true;
			}
		}
	} else {
		let purchases;
		let endCursor = null;
		do {
			const oneTimePurchaseResponse = await client.query<any>({
				data: {
					query: ONE_TIME_PURCHASES_QUERY,
					variables: { endCursor },
				},
			}) as any;
			purchases =
				oneTimePurchaseResponse.body.data.currentAppInstallation.oneTimePurchases;

			for (let i = 0, len = purchases.edges.length; i < len; i++) {
				const node = purchases.edges[i].node;
				if (
					node.name === chargeName &&
					(!isProd || !node.test) &&
					node.status === "ACTIVE"
				) {
					return true;
				}
			}

			endCursor = purchases.pageInfo.endCursor;
		} while (purchases.pageInfo.hasNextPage);
	}

	return false;
}

async function requestPayment(
	session: Session,
	{ chargeName, amount, currencyCode, interval }: IBillingOptions
) {
	const client = new shopify.clients.Graphql({ session });
	const returnUrl = `https://${shopify.config.hostName}?shop=${session.shop
		}&host=${Buffer.from(`${session.shop}/admin`).toString('base64')}`;

	let data;
	if (isRecurring(interval)) {
		const mutationResponse = await requestRecurringPayment(client, returnUrl, {
			chargeName,
			amount,
			currencyCode,
			interval,
		});
		data = mutationResponse.body.data.appSubscriptionCreate;
	} else {
		const mutationResponse = await requestSinglePayment(client, returnUrl, {
			chargeName,
			amount,
			currencyCode,
		});
		data = mutationResponse.body.data.appPurchaseOneTimeCreate;
	}

	if (data.userErrors.length) {
		throw new ShopifyBillingError(
			"Error while billing the store",
			data.userErrors
		);
	}

	return data.confirmationUrl;
}

async function requestRecurringPayment(
	client: GraphqlClient,
	returnUrl: string,
	{ chargeName, amount, currencyCode, interval }: IBillingOptions
) {
	const mutationResponse = await client.query<any>({
		data: {
			query: RECURRING_PURCHASE_MUTATION,
			variables: {
				name: chargeName,
				lineItems: [
					{
						plan: {
							appRecurringPricingDetails: {
								interval,
								price: { amount, currencyCode },
							},
						},
					},
				],
				returnUrl,
				test: !isProd,
			},
		},
	});

	if (mutationResponse.body.errors && mutationResponse.body.errors.length) {
		throw new ShopifyBillingError(
			"Error while billing the store",
			mutationResponse.body.errors
		);
	}

	return mutationResponse;
}

async function requestSinglePayment(
	client: GraphqlClient,
	returnUrl: string,
	{ chargeName, amount, currencyCode }: IBillingOptions
) {
	const mutationResponse = await client.query<any>({
		data: {
			query: ONE_TIME_PURCHASE_MUTATION,
			variables: {
				name: chargeName,
				price: { amount, currencyCode },
				returnUrl,
				test: process.env.NODE_ENV !== "production",
			},
		},
	});

	if (mutationResponse.body.errors && mutationResponse.body.errors.length) {
		throw new ShopifyBillingError(
			"Error while billing the store",
			mutationResponse.body.errors
		);
	}

	return mutationResponse;
}

function isRecurring(interval: string | undefined) {
	if (!interval) return false;
	return RECURRING_INTERVALS.includes(interval);
}

export class ShopifyBillingError extends Error {
	name: string;
	stack: string | undefined;
	message: string;
	errorData: any;

	constructor(message: string, errorData: any) {
		super(message);
		this.name = "ShopifyBillingError";
		this.stack = new Error().stack;

		this.message = message;
		this.errorData = errorData;
	}
}

const RECURRING_PURCHASES_QUERY = `
  query appSubscription {
    currentAppInstallation {
      activeSubscriptions {
        name, test
      }
    }
  }
`;

const ONE_TIME_PURCHASES_QUERY = `
  query appPurchases($endCursor: String) {
    currentAppInstallation {
      oneTimePurchases(first: 250, sortKey: CREATED_AT, after: $endCursor) {
        edges {
          node {
            name, test, status
          }
        }
        pageInfo {
          hasNextPage, endCursor
        }
      }
    }
  }
`;

const RECURRING_PURCHASE_MUTATION = `
  mutation test(
    $name: String!
    $lineItems: [AppSubscriptionLineItemInput!]!
    $returnUrl: URL!
    $test: Boolean
  ) {
    appSubscriptionCreate(
      name: $name
      lineItems: $lineItems
      returnUrl: $returnUrl
      test: $test
    ) {
      confirmationUrl
      userErrors {
        field
        message
      }
    }
  }
`;

const ONE_TIME_PURCHASE_MUTATION = `
  mutation test(
    $name: String!
    $price: MoneyInput!
    $returnUrl: URL!
    $test: Boolean
  ) {
    appPurchaseOneTimeCreate(
      name: $name
      price: $price
      returnUrl: $returnUrl
      test: $test
    ) {
      confirmationUrl
      userErrors {
        field
        message
      }
    }
  }
`;
