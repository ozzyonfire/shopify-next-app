import shopify from "@/lib/initialize-context";
import { loadSession } from "@/lib/session-storage";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
	const url = new URL(req.url);
	const shop = url.searchParams.get('shop');
	const sanitizedShop = shopify.utils.sanitizeShop(shop as string);

	if (!sanitizedShop) {
		throw new Error("Invalid shop provided");
	}

	const offlineSessionId = shopify.session.getOfflineId(sanitizedShop);
	const offlineSession = await loadSession(offlineSessionId);

	if (!offlineSession) {
		return beginAuth(sanitizedShop, req, false);
	}

	if (!shopify.config.scopes.equals(offlineSession.scope)) {
		return beginAuth(sanitizedShop, req, false);
	}

	return beginAuth(sanitizedShop, req, true);
}

export function beginAuth(shop: string, req: Request, isOnline: boolean) {
	return shopify.auth.begin({
		shop,
		callbackPath: '/api/auth/callback',
		isOnline,
		rawRequest: req,
		// rawResponse: new NextResponse()
	});
}