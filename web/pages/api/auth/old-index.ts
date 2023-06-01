import shopify from '../../../utils/initialize-context';
import { NextApiRequest, NextApiResponse } from "next";
import { loadSession } from '../../../utils/session-storage';

export async function getOfflineToken(shop: string, req: NextApiRequest, res: NextApiResponse) {
  console.log('getting offline token');
  await shopify.auth.begin({
    shop,
    callbackPath: '/api/auth/callback',
    isOnline: false,
    rawRequest: req,
    rawResponse: res
  });
}

export async function getOnlineToken(shop: string, req: NextApiRequest, res: NextApiResponse) {
  console.log('getting online token');
  await shopify.auth.begin({
    shop,
    callbackPath: '/api/auth/callback',
    isOnline: true,
    rawRequest: req,
    rawResponse: res
  });
}

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
    const offlineSession = await loadSession(offlineSessionId);

    // check for scope mismatch
    if (offlineSession && !shopify.config.scopes.equals(offlineSession.scope)) {
      console.log('scope mismatch', shopify.config.scopes);
      return getOfflineToken(sanitizedShop, req, res);
    }

    if (offlineSession) {
      // if offline session exists, get an online token
      return getOnlineToken(sanitizedShop, req, res);
    } else {
      return getOfflineToken(sanitizedShop, req, res);
    }
  }
}

export default Auth;