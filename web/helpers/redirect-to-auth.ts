import { Shopify } from "@shopify/shopify-api";
import { NextApiRequest, NextApiResponse } from "next";
import config from '../config.json';

export default async function redirectToAuth(req: NextApiRequest, res: NextApiResponse) {
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
  const shop = Shopify.Utils.sanitizeShop(req.query.shop as string);

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
    redirectUri: `https://${Shopify.Context.HOST_NAME}/api/auth?${redirectUriParams}`,
  }).toString();

  return res.redirect(`/exitiframe?${queryParams}`);
}

async function serverSideRedirect(req: NextApiRequest, res: NextApiResponse) {
  const redirectUrl = await Shopify.Auth.beginAuth(
    req,
    res,
    req.query.shop as string,
    "/api/auth/callback",
    config.onlineTokens
  );

  return res.redirect(redirectUrl);
}
