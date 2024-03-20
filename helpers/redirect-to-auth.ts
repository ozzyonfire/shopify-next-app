// don't think this is used anymore

import { NextApiRequest, NextApiResponse } from "next";
import shopify from "../lib/shopify/initialize-context";

export default async function redirectToAuth(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!req.query.shop) {
    res.status(500);
    return res.send("No shop provided");
  }

  if (req.query.embedded === "1") {
    return clientSideRedirect(req, res);
  }

  return await serverSideRedirect(req, res);
}

function clientSideRedirect(req: NextApiRequest, res: NextApiResponse) {
  const shop = shopify.utils.sanitizeShop(req.query.shop as string);

  if (!shop) {
    res.status(500);
    return res.send("Invalid shop provided");
  }

  const redirectUriParams = new URLSearchParams({
    shop,
    host: req.query.host as string,
  }).toString();
  const queryParams = new URLSearchParams({
    ...req.query,
    shop,
    redirectUri: `https://${shopify.config.hostName}/api/auth?${redirectUriParams}`,
  }).toString();

  return res.redirect(`/exitiframe?${queryParams}`);
}

async function serverSideRedirect(req: NextApiRequest, res: NextApiResponse) {
  await shopify.auth.begin({
    callbackPath: "/api/auth/callback",
    shop: req.query.shop as string,
    isOnline: true,
    rawRequest: req,
    rawResponse: res,
  });
}
