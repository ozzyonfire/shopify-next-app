import { GetServerSidePropsContext } from "next";
import { AppInstallations } from "./app-installations";
import shopify from "./initialize-context";
import { loadSession } from "./session-storage";
import { redirect } from "next/navigation";
import { verifyAuth } from "./verify";

const TEST_GRAPHQL_QUERY = `
{
  shop {
    name
  }
}`;

export function serverSideRedirect(shop: string, host: string, embedded: string) {
	const sanitizedShop = shopify.utils.sanitizeShop(shop as string);
	if (!sanitizedShop) {
		throw new Error('Invalid shop provided');
	}
	if (embedded === "1") {
		return exitIFrame(shop, host);
	} else {
		const redirectUri = `${process.env.HOST}/api/auth?shop=${shop}&host=${host}`;
		redirect(redirectUri);
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
		console.log('Invalid shop provided');
		return false;
	}

	// Check for active session
	console.log("Checking for offline token");
	const sessionId = shopify.session.getOfflineId(sanitizedShop);
	const session = await loadSession(sessionId);
	if (!session) {
		return false;
	}

	// Check for scope mismatch
	if (!shopify.config.scopes.equals(session.scope)) {
		console.log('scope mismatch', shopify.config.scopes);
		return false;
	}

	// Make a request to ensure the access token is still valid.
	const client = new shopify.clients.Graphql({ session });

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
export async function performChecks(shop: string, host: string, embedded: string) {
	const isInstalled = await checkInstallation(shop);
	console.log('isInstalled', isInstalled);
	if (!isInstalled) {
		return serverSideRedirect(shop, host, embedded);
	}

	// verify the session
	try {
		await verifyAuth(shop);
	} catch (err) {
		return serverSideRedirect(shop, host, embedded);
	}
}

export function exitIFrame(shop: string, host: string) {
	const hostUrl = process.env.HOST;
	const queryParams = new URLSearchParams({
		shop,
		host
	});
	const redirectUri = `${hostUrl}/api/auth?${queryParams.toString()}`;
	queryParams.append('redirectUri', encodeURI(redirectUri));
	redirect(`/exitiframe?${queryParams.toString()}`);
}