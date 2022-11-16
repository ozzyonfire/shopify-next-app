import Shopify from "@shopify/shopify-api";
import { NextApiRequest, NextApiResponse } from "next";
import withShopifyContext from "../../api-helpers/withShopifyContext";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await Shopify.Webhooks.Registry.process(req, res);
    console.log(`Webhook processed, returned status code 200`);
  } catch (e) {
    const error = e as Error;
    console.log(`Failed to process webhook: ${error.message}`);
    if (!res.headersSent) {
      res.status(500).send(error.message);
    }
  }
}

export default withShopifyContext(handler);