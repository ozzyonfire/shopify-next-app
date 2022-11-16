import Shopify from "@shopify/shopify-api";
import { NextApiRequest, NextApiResponse } from "next";
import withShopifyContext from "../../../api-helpers/withShopifyContext";

const Auth = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method == 'GET') {
    // check if offline session exists
    const {
      shop
    } = req.query;
    const sanitizedShop = Shopify.Utils.sanitizeShop(shop as string);
    if (!sanitizedShop) {
      res.status(500);
      return res.send("Invalid shop provided");
    }

    const offlineSession = await Shopify.Utils.loadOfflineSession(sanitizedShop);
    let redirectUrl = '';
    if (offlineSession) {
      // if offline session exists, get an online token
      console.log('getting online token');
      redirectUrl = await Shopify.Auth.beginAuth(req, res, shop as string, "/api/auth/callback", true);
    } else {
      console.log('getting offline token');
      redirectUrl = await Shopify.Auth.beginAuth(req, res, shop as string, "/api/auth/callback", false);
    }
    return res.redirect(redirectUrl);
  }
}

export default withShopifyContext(Auth);