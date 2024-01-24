import shopify from "@/lib/shopify/initialize-context";
import { addHandlers } from "@/lib/shopify/register-webhooks";
import { headers } from "next/headers";

export async function POST(req: Request) {
  const topic = headers().get("x-shopify-topic") as string;

  // Seems like there is some weird behaviour where the shopify api doesn't have the handlers registered - possibly due to some serverless behaviour
  const handlers = shopify.webhooks.getHandlers(topic);
  if (handlers.length === 0) {
    console.log(`No handlers found for topic: ${topic}`);
    addHandlers();
  }

  const rawBody = await req.text();

  await shopify.webhooks.process({
    rawBody,
    rawRequest: req,
  });

  console.log(`Webhook processed, returned status code 200`);
  return new Response(null, { status: 200 });
}
