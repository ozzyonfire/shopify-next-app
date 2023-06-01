import shopify from "@/lib/initialize-context";
import { storeSession } from "@/lib/session-storage";
import { CookieNotFound, InvalidOAuthError, InvalidSession, Session } from "@shopify/shopify-api";
import { NextResponse } from "next/server";
import { beginAuth } from "../route";

export async function POST(req: Request) {
	const url = new URL(req.url);
	const shop = url.searchParams.get('shop');
	const host = url.searchParams.get('host');

	console.log('in the route callback', shop, host);

	if (!shop) {
		throw new Error("No shop provided");
	}

	try {

		const callbackResponse = await shopify.auth.callback<Session>({
			rawRequest: req,
			rawResponse: new NextResponse()
		});

		const { session } = callbackResponse;

		if (!session || !session.accessToken) {
			throw new Error("Could not validate auth callback");
		}

		await storeSession(session);

		const responses = await shopify.webhooks.register({ session });
		console.log(responses);

		const sanitizedHost = shopify.utils.sanitizeHost(host || '');
		if (!host || host == null) {
			return new NextResponse("Missing host parameter", { status: 400 });
		}

		let redirectUrl = `/?shop=${session.shop}&host=${encodeURIComponent(sanitizedHost!)}`;
		if (shopify.config.isEmbeddedApp) {
			redirectUrl = await shopify.auth.getEmbeddedAppUrl({
				rawRequest: req,
				rawResponse: new NextResponse(),
			});
		}
		NextResponse.redirect(redirectUrl);
	} catch (e: any) {
		console.warn(e);
		switch (true) {
			case e instanceof InvalidOAuthError:
				return new NextResponse(e.message, { status: 403 });
			case e instanceof CookieNotFound:
			case e instanceof InvalidSession:
				// This is likely because the OAuth session cookie expired before the merchant approved the request
				return beginAuth(shop!, req, false);
			default:
				return new NextResponse('An error occurred', { status: 500 });
		}
	}
}