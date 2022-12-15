import shopify from '../../../utils/initialize-context';
import { NextApiRequest, NextApiResponse } from "next";
import { loadSession } from '../../../utils/session-storage';

const Auth = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method == 'GET') {
    // check if offline session exists
    const {
      shop
    } = req.query;
    const sanitizedShop = shopify.utils.sanitizeShop(shop as string);
    if (!sanitizedShop) {
      res.status(500);
      return res.send("Invalid shop provided");
    }

    const offlineSessionId = shopify.session.getOfflineId(sanitizedShop);
    const offlineSession = await loadSession(offlineSessionId, process.env.SHOPIFY_API_KEY || '');

    if (offlineSession) {
      // if offline session exists, get an online token
      console.log('getting online token');
      await shopify.auth.begin({
        shop: sanitizedShop,
        callbackPath: '/api/auth/callback',
        isOnline: true,
        rawRequest: req,
        rawResponse: res
      });
    } else {
      console.log('getting offline token');
      await shopify.auth.begin({
        shop: sanitizedShop,
        callbackPath: '/api/auth/callback',
        isOnline: false,
        rawRequest: req,
        rawResponse: res
      });
    }
  }
}

export default Auth;