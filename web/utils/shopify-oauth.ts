import Shopify from "@shopify/shopify-api";
import { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next";
import { AppInstallations } from "./app_installations";
import initializeContext from "./initialize-context";

const TEST_GRAPHQL_QUERY = `
{
  shop {
    name
  }
}`;

export function clientSideRedirect(context: GetServerSidePropsContext, shop: string) {
  const redirectUriParams = new URLSearchParams({
    shop,
    host: context.query.host as string,
  }).toString();
  const queryParams = new URLSearchParams({
    ...context.query,
    shop,
    redirectUri: `https://${Shopify.Context.HOST_NAME}/api/auth?${redirectUriParams}`,
  }).toString();

  return `/exitiframe?${queryParams}`;
}

export function redirectToAuth(context: GetServerSidePropsContext) {
  const { shop, embedded } = context.query;
  console.log(shop, embedded);

  const sanitizedShop = Shopify.Utils.sanitizeShop(shop as string);
  if (!sanitizedShop) {
    throw new Error('Invalid shop provided');
  }
  if (embedded === "1") {
    return clientSideRedirect(context, sanitizedShop);
  } else {
    return `/api/auth?shop=${shop}`;
  }
}

export async function checkInstallation(shop: string) {
  const sanitizedShop = Shopify.Utils.sanitizeShop(shop);
  if (!sanitizedShop) {
    return false;
  }
  const appInstalled = await AppInstallations.includes(sanitizedShop);
  return appInstalled;
}

export async function verify(context: GetServerSidePropsContext) {
  const { shop } = context.query;

  const sanitizedShop = Shopify.Utils.sanitizeShop(shop as string);
  if (!sanitizedShop) {
    console.log('Invalid shop provided');
    return false;
  }

  // Check for active session
  console.log("Checking for offline token");
  const session = await Shopify.Utils.loadOfflineSession(sanitizedShop);
  if (!session) {
    return false;
  }

  // Check for scope mismatch
  if (!Shopify.Context.SCOPES.equals(session.scope)) {
    console.log('scope mismatch', Shopify.Context.SCOPES);
    return false;
  }

  // Make a request to ensure the access token is still valid.
  const client = new Shopify.Clients.Graphql(
    session.shop,
    session.accessToken
  );
  try {
    await client.query({ data: TEST_GRAPHQL_QUERY });
  } catch (err) {
    console.log('error', err);
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
export async function performChecks(context: GetServerSidePropsContext) {
  initializeContext();
  const { shop, host, session } = context.query;
  context.res.setHeader(
    "Content-Security-Policy",
    `frame-ancestors https://${encodeURIComponent(
      shop as string
    )} https://admin.shopify.com;`
  );
  const isInstalled = await checkInstallation(shop as string);
  console.log('isInstalled', isInstalled);

  if (!isInstalled) {
    return {
      redirect: {
        destination: redirectToAuth(context),
        permanent: false,
      }
    }
  }

  // Don't even need to do this anymore since it happens in _app.tsx
  const verified = await verify(context);
  if (!verified) {
    return {
      redirect: {
        destination: redirectToAuth(context),
        permanent: false,
      }
    }
  }

  return {
    props: {
      shop: shop as string,
      host: host as string,
      session: session as string,
    }
  }
}