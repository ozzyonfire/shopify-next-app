import { redirect } from "next/navigation";
import { AppInstallations } from "../db/app-installations";
import { loadSession } from "../db/session-storage";
import shopify from "./initialize-context";
import { verifyAuth } from "./verify";

const TEST_GRAPHQL_QUERY = `
{
  shop {
    name
  }
}`;

/**
 * @description Redirects the user to the OAuth page. We used to check if the shop was embedded here, but I don't think it matters anymore. Redirect to this page if the app is not installed.
 * @param shop
 * @param host
 * @returns
 */
export function serverSideRedirect(
  shop: string,
  host: string,
  embedded: string,
) {
  const sanitizedShop = shopify.utils.sanitizeShop(shop as string);
  if (!sanitizedShop) {
    throw new Error("Invalid shop provided");
  }

  const queryParams = new URLSearchParams({
    shop: sanitizedShop,
    host,
  });
  if (embedded === "1") {
    return `${process.env.HOST}/api/auth?${queryParams.toString()}`;
  } else {
    // maybe we should try this: https://github.com/Shopify/shopify-api-js/blob/main/packages/shopify-api/docs/reference/auth/getEmbeddedAppUrl.md
    redirect(`${process.env.HOST}/api/auth?${queryParams.toString()}`);
  }
}

export async function checkInstallation(shop: string) {
  const sanitizedShop = shopify.utils.sanitizeShop(shop);
  if (!sanitizedShop) {
    return false;
  }
  const appInstalled = await AppInstallations.includes(sanitizedShop);
  return appInstalled;
}

export async function verify(shop: string) {
  const sanitizedShop = shopify.utils.sanitizeShop(shop);
  if (!sanitizedShop) {
    console.log("Invalid shop provided");
    return false;
  }

  // Check for active session
  console.log("Checking for offline token");
  const sessionId = shopify.session.getOfflineId(sanitizedShop);
  try {
    const session = await loadSession(sessionId);

    // we used to check for a scope mismatch here, but if we deploy our app with shopify it will take care of this for us

    // Make a request to ensure the access token is still valid.
    const client = new shopify.clients.Graphql({ session });
    client.request(TEST_GRAPHQL_QUERY);
  } catch (err) {
    return false;
  }

  return true;
}

/**
 * We need to get a couple things ready before the page loads
 * 1. Get the shop, host and session from the query string
 * 2. Get the API key from the environment
 * 3. Check to see if the app is installed
 * 4. Check to see if the app needs to be authorized
 * 5. If the app needs to be authorized, redirect to the OAuth page
 * 6. If the app is authorized, check to see if there is a subscription / billing
 */
export async function performChecks(
  shop: string,
  host: string,
  embedded: string,
) {
  const isInstalled = await checkInstallation(shop);
  if (!isInstalled) {
    return serverSideRedirect(shop, host, embedded);
  }

  // // verify the session
  // try {
  //   await verifyAuth(shop);
  //   return false;
  // } catch (err) {
  //   return serverSideRedirect(shop, host, embedded);
  // }
}
