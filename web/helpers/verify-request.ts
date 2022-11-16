import { Shopify } from "@shopify/shopify-api";
import config from '../config.json';
import { NextApiRequest, NextApiResponse } from "next";

export default async function verifyRequest(req: NextApiRequest, res: NextApiResponse, online: boolean) {
  const session = await Shopify.Utils.loadCurrentSession(
    req,
    res,
    online
  );

  if (!session) {
    throw new Error("No sesssion found.");
  }

  let shop = Shopify.Utils.sanitizeShop(req.query.shop as string);

  if (session && shop && session.shop !== shop) {
    // The current request is for a different shop. Redirect gracefully.
    throw new Error('The current request is for a different shop. Redirect gracefully.');
  }

  const bearerPresent = req.headers.authorization?.match(/Bearer (.*)/);
  if (bearerPresent) {
    if (!shop) {
      if (session) {
        shop = session.shop;
      } else if (Shopify.Context.IS_EMBEDDED_APP) {
        if (bearerPresent) {
          const payload = Shopify.Utils.decodeSessionToken(bearerPresent[1]);
          shop = payload.dest.replace("https://", "");
        }
      }
    }
  }

  if (!shop) {
    throw new Error('No shop found in session or query');
  }
  return session;
};
