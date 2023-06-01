import { NextApiRequest, NextApiResponse } from "next";
import shopify from "../../lib/initialize-context";
import getRawBody from "raw-body";
import { addHandlers } from "../../lib/register-webhooks";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	try {
		const rawBody = await getRawBody(req);
		const topic = req.headers["x-shopify-topic"] as string;

		// Seems like there is some weird behaviour where the shopify api doesn't have the handlers registered - possibly due to some serverless behaviour
		const handlers = shopify.webhooks.getHandlers(topic);
		if (handlers.length === 0) {
			console.log(`No handlers found for topic: ${topic}`);
			await addHandlers();
		}

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