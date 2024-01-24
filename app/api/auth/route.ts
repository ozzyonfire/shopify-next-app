import shopify from "@/lib/shopify/initialize-context";
import { loadSession } from "@/lib/db/session-storage";
import { NextResponse } from "next/server";
import { SessionNotFoundError } from "@/lib/db/session-storage";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const shop = url.searchParams.get("shop");
  const sanitizedShop = shopify.utils.sanitizeShop(shop as string);

  if (!sanitizedShop) {
    throw new Error("Invalid shop provided");
  }

  const offlineSessionId = shopify.session.getOfflineId(sanitizedShop);
  try {
    const offlineSession = await loadSession(offlineSessionId);
    if (!shopify.config.scopes.equals(offlineSession.scope)) {
      console.log("scopes do not match");
      return beginAuth(sanitizedShop, req, false);
    }
  } catch (err) {
    if (err instanceof SessionNotFoundError) {
      return beginAuth(sanitizedShop, req, false);
    }
  }

  return beginAuth(sanitizedShop, req, true);
}

export function beginAuth(shop: string, req: Request, isOnline: boolean) {
  return shopify.auth.begin({
    shop,
    callbackPath: "/api/auth/callback",
    isOnline,
    rawRequest: req,
    rawResponse: new NextResponse(),
  });
}
