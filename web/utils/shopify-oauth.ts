import Shopify from "@shopify/shopify-api";
import { AppInstallations } from "./app_installations";
import initializeContext from "./initialize-context";

export async function checkInstallation(shop: string) {
  initializeContext();
  const sanitizedShop = Shopify.Utils.sanitizeShop(shop);
  const appInstalled = await AppInstallations.includes(shop);
  return appInstalled;
}

export async function performChecks() {

}