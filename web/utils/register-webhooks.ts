import { DeliveryMethod, Session } from "@shopify/shopify-api";
import { setupGDPRWebHooks } from "../helpers/gdpr";
import shopify from "./initialize-context";
import { AppInstallations } from "./app_installations";

let webhooksInitialized = false;

export async function registerWebhooks(session: Session) {
  if (!webhooksInitialized) {
    await setupGDPRWebHooks('/api/webhooks');
    await shopify.webhooks.addHandlers({
      "APP_UNINSTALLED": {
        deliveryMethod: DeliveryMethod.Http,
        callbackUrl: "/api/webhooks",
        callback: async (_topic, shop, _body) => {
          console.log("Uninstalled app from shop: " + shop);
          await AppInstallations.delete(shop);
        },
      }
    });
    console.log('Setup webhooks');
    webhooksInitialized = true;
  }
  const responses = await shopify.webhooks.register({ session });
  console.log('Webhooks registered', responses);
}