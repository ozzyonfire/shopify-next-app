import shopify from "../../../utils/initialize-context";
import { NextApiRequest, NextApiResponse } from "next";
import verifyRequest from "../../../helpers/verify-request";
import { AppInstallations } from "../../../utils/app_installations";
import { registerWebhooks } from "../../../utils/register-webhooks";

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
      throw new Error('App not installed');
    }

    // check for offline token
    const offlineSession = await verifyRequest(req, res, false);
    // check for online token
    const onlineSession = await verifyRequest(req, res, true);

    // check for scope mismatch
    if (!shopify.config.scopes.equals(offlineSession.scope)) {
      console.log('scope mismatch', shopify.config.scopes);
      throw new Error('Scope mismatch - offline token');
    }

    if (!shopify.config.scopes.equals(onlineSession.scope)) {
      console.log('scope mismatch', shopify.config.scopes);
      throw new Error('Scope mismatch - online token');
    }

    // do a test query to make sure the session is still active
    const client = new shopify.clients.Graphql({
      session: onlineSession,
    });
    await client.query({ data: TEST_GRAPHQL_QUERY });

    // setup webhooks
    await registerWebhooks(offlineSession);

    return res.json({
      status: 'success',
    });

  } catch (err) {
    const error = err as Error;
    console.log('Error in Verify', error);
    return res.json({
      status: "error",
      message: error.message,
    });
  }
}

export default handler;