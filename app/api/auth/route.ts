import { SessionNotFoundError, loadSession } from "@/lib/db/session-storage";
import shopify from "@/lib/shopify/initialize-context";
import { beginAuth } from "./auth";

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
