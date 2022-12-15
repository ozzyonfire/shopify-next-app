import { NextApiRequest, NextApiResponse } from "next";
import shopify from "../../utils/initialize-context";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log('got a webhook', req.body);
  try {
    await shopify.webhooks.process({
      rawBody: req.body,
      rawRequest: req,
      rawResponse: res,
    });
    console.log(`Webhook processed, returned status code 200`);
  } catch (e) {
    const error = e as Error;
    console.log(`Failed to process webhook: ${error.message}`);
    if (!res.headersSent) {
      res.status(500).send(error.message);
    }
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;