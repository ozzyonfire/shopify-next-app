import { NextApiRequest, NextApiResponse } from "next";
import shopify from "../../utils/initialize-context";
import getRawBody from "raw-body";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const rawBody = await getRawBody(req);
    await shopify.webhooks.process({
      rawBody: rawBody.toString(),
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