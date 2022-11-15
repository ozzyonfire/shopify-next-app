import { Shopify } from "@shopify/shopify-api";

export const AppInstallations = {
  includes: async function (shopDomain: string) {
    if (!Shopify.Context.SESSION_STORAGE.findSessionsByShop) {
      throw new Error("Session storage does not support finding sessions by shop");
    }
    const shopSessions = await Shopify.Context.SESSION_STORAGE.findSessionsByShop(shopDomain);

    if (shopSessions.length > 0) {
      for (const session of shopSessions) {
        if (session.accessToken) return true;
      }
    }

    return false;
  },

  delete: async function (shopDomain: string) {
    if (!Shopify.Context.SESSION_STORAGE.findSessionsByShop) {
      throw new Error("Session storage does not support finding sessions by shop");
    }
    const shopSessions = await Shopify.Context.SESSION_STORAGE.findSessionsByShop(shopDomain);
    if (!Shopify.Context.SESSION_STORAGE.deleteSessions) {
      throw new Error("Session storage does not support deleting sessions");
    }
    if (shopSessions.length > 0) {
      await Shopify.Context.SESSION_STORAGE.deleteSessions(shopSessions.map((session) => session.id));
    }
  },
};
