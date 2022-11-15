import { Shopify } from "@shopify/shopify-api";
import ensureBilling, {
  IBillingOptions,
  ShopifyBillingError,
} from "../helpers/ensure-billing";
import redirectToAuth from "../helpers/redirect-to-auth";

import returnTopLevelRedirection from "../helpers/return-top-level-redirection";
import config from '../config.json';
import { NextApiRequest, NextApiResponse } from "next";
const USE_ONLINE_TOKENS = config.onlineTokens;

const TEST_GRAPHQL_QUERY = `
{
  shop {
    name
  }
}`;

export interface IVerifyRequestOptions {
  billing?: {
    required: boolean;
    options?: IBillingOptions;
  }
}

export default function verifyRequest(billingOptions: IVerifyRequestOptions) {
  const {
    billing,
  } = billingOptions;
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await Shopify.Utils.loadCurrentSession(
      req,
      res,
      USE_ONLINE_TOKENS
    );

    console.log('session', session);

    let shop = Shopify.Utils.sanitizeShop(req.query.shop as string);

    if (session && shop && session.shop !== shop) {
      // The current request is for a different shop. Redirect gracefully.
      return redirectToAuth(req, res);
    }

    if (session?.isActive()) {
      try {
        if (billing?.required && billing.options) {
          // The request to check billing status serves to validate that the access token is still valid.
          const [hasPayment, confirmationUrl] = await ensureBilling(
            session,
            billing.options
          );

          if (!hasPayment) {
            returnTopLevelRedirection(req, res, confirmationUrl);
            return;
          }
        } else {
          // Make a request to ensure the access token is still valid. Otherwise, re-authenticate the user.
          const client = new Shopify.Clients.Graphql(
            session.shop,
            session.accessToken
          );
          await client.query({ data: TEST_GRAPHQL_QUERY });
        }
        return;
      } catch (e) {
        if (
          e instanceof Shopify.Errors.HttpResponseError &&
          e.response.code === 401
        ) {
          // Re-authenticate if we get a 401 response
        } else if (e instanceof ShopifyBillingError) {
          console.error(e.message, e.errorData[0]);
          res.status(500).end();
          return;
        } else {
          throw e;
        }
      }
    }

    const bearerPresent = req.headers.authorization?.match(/Bearer (.*)/);
    if (bearerPresent) {
      if (!shop) {
        if (session) {
          shop = session.shop;
        } else if (Shopify.Context.IS_EMBEDDED_APP) {
          if (bearerPresent) {
            const payload = Shopify.Utils.decodeSessionToken(bearerPresent[1]);
            shop = payload.dest.replace("https://", "");
          }
        }
      }
    }

    if (!shop) {
      console.log('No shop found in session or query');
      return redirectToAuth(req, res);
    }

    returnTopLevelRedirection(
      req,
      res,
      `/api/auth?shop=${encodeURIComponent(shop)}`
    );
  };
}
