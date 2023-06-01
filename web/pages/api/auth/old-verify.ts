import shopify from "../../../lib/initialize-context";
import { NextApiRequest, NextApiResponse } from "next";
import verifyRequest from "../../../helpers/verify-request";
import { AppInstallations } from "../../../lib/app-installations";
import { registerWebhooks } from "../../../lib/register-webhooks";
import { GraphqlQueryError } from "@shopify/shopify-api";

const TEST_GRAPHQL_QUERY = `
{
  shop {
    name
  }
}`;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	try {
		// check to see if the app is installed
		const sanitizedShop = shopify.utils.sanitizeShop(req.query.shop as string);
		if (!sanitizedShop) {
			throw new Error('Invalid shop provided');
		}
		const appInstalled = await AppInstallations.includes(sanitizedShop);
		if (!appInstalled) {
			return res.json({
				status: "error",
				type: "token",
				message: "App not installed",
			});
		}

		// check for offline token
		const offlineSession = await verifyRequest(req, res, false);
		// check for online token
		const onlineSession = await verifyRequest(req, res, true);

		// check for scope mismatch
		if (!shopify.config.scopes.equals(offlineSession.scope)) {
			console.log('scope mismatch - verify (offline)', offlineSession);
			return res.json({
				status: "error",
				type: "scope",
				sessionType: "offline",
				message: "Scope mismatch - offline token",
				accountOwner: onlineSession.onlineAccessInfo?.associated_user.account_owner,
			});
		}

		if (!shopify.config.scopes.equals(onlineSession.scope)) {
			console.log('scope mismatch - verify (online)', onlineSession);
			return res.json({
				status: "error",
				type: "scope",
				sessionType: "online",
				message: "Scope mismatch - online token",
				accountOwner: onlineSession.onlineAccessInfo?.associated_user.account_owner,
			});
		}

		// do a test query to make sure the session is still active
		const client = new shopify.clients.Graphql({
			session: onlineSession,
		});

		try {
			await client.query({ data: TEST_GRAPHQL_QUERY });
		} catch (err) {
			return res.json({
				status: "error",
				type: "token",
				message: "Access token is invalid",
				accountOwner: onlineSession.onlineAccessInfo?.associated_user.account_owner,
			});
		}

		// make sure the webhooks are registered
		try {
			await registerWebhooks(offlineSession);
		} catch (err) {
			console.log('Error registering webhooks - will be retried', err);
		}

		return res.json({
			status: 'success',
		});
	} catch (err: any) {
		if (err instanceof GraphqlQueryError) {
			const error = err as GraphqlQueryError;
			console.log('Error in Verify', error.response?.errors);
			return res.json({
				status: "error",
				message: error.response?.errors,
				type: 'token'
			});
		} else {
			return res.json({
				status: "error",
				message: err.message,
				type: 'token'
			});
		}
	}
}

export default handler;