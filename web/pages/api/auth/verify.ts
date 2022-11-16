import Shopify from "@shopify/shopify-api";
import { verify } from "crypto";
import { NextApiRequest, NextApiResponse } from "next";
import withShopifyContext from "../../../api-helpers/withShopifyContext";
import { setupGDPRWebHooks } from "../../../helpers/gdpr";
import verifyRequest from "../../../helpers/verify-request";
import { AppInstallations } from "../../../utils/app_installations";

const TEST_GRAPHQL_QUERY = `
{
  shop {
    name
  }
}`;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // check for offline token
    const offlineSession = await verifyRequest(req, res, false);
    // check for online token
    const onlineSession = await verifyRequest(req, res, true);

    // check for scope mismatch
    if (!Shopify.Context.SCOPES.equals(offlineSession.scope)) {
      console.log('scope mismatch', Shopify.Context.SCOPES);
      throw new Error('Scope mismatch - offline token');
    }

    if (!Shopify.Context.SCOPES.equals(onlineSession.scope)) {
      console.log('scope mismatch', Shopify.Context.SCOPES);
      throw new Error('Scope mismatch - online token');
    }

    // do a test query to make sure the session is still active
    const client = new Shopify.Clients.Graphql(onlineSession.shop, onlineSession.accessToken);
    await client.query({ data: TEST_GRAPHQL_QUERY });

    // register any webhooks here
    setupGDPRWebHooks('/api/webhooks');
    Shopify.Webhooks.Registry.addHandler("APP_UNINSTALLED", {
      path: "/api/webhooks",
      webhookHandler: async (_topic, shop, _body) => {
        await AppInstallations.delete(shop);
      },
    });

    return res.json({
      status: 'success',
    });

  } catch (err) {
    const error = err as Error;
    return res.json({
      status: "error",
      message: error.message,
    });
  }
}

export default withShopifyContext(handler);