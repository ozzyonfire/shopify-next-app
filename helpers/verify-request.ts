import shopify from "../lib/shopify/initialize-context";
import { NextApiRequest, NextApiResponse } from "next";
import { loadSession } from "../lib/db/session-storage";

export default async function verifyRequest(
  req: NextApiRequest,
  res: NextApiResponse,
  online: boolean,
) {
  const sessionId = await shopify.session.getCurrentId({
    rawRequest: req,
    rawResponse: res,
    isOnline: online,
  });

  if (!sessionId) {
    throw new Error("No session id found.");
  }

  const session = await loadSession(sessionId);

  let shop = shopify.utils.sanitizeShop(req.query.shop as string);

  if (session && shop && session.shop !== shop) {
    // The current request is for a different shop. Redirect gracefully.
    throw new Error(
      "The current request is for a different shop. Redirect gracefully.",
    );
  }

  const bearerPresent = req.headers.authorization?.match(/Bearer (.*)/);
  if (bearerPresent) {
    if (!shop) {
      if (session) {
        shop = session.shop;
      } else if (shopify.config.isEmbeddedApp) {
        if (bearerPresent) {
          const payload = await shopify.session.decodeSessionToken(
            bearerPresent[1],
          );
          shop = payload.dest.replace("https://", "");
        }
      }
    }
  }

  if (!shop) {
    throw new Error("No shop found in session or query");
  }
  return session;
}
