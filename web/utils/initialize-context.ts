import Shopify, { LATEST_API_VERSION } from "@shopify/shopify-api";
import { deleteSession, loadSession, storeSession, findSessionsByShop, deleteSessions } from "./session-storage";

export default function initializeContext() {
  Shopify.Context.initialize({
    API_KEY: process.env.SHOPIFY_API_KEY || '',
    API_SECRET_KEY: process.env.SHOPIFY_API_SECRET || '',
    SCOPES: process.env.SCOPES?.split(",") || ['write_products'],
    HOST_NAME: process.env.HOST?.replace(/https?:\/\//, "") || '',
    HOST_SCHEME: process.env.HOST?.split("://")[0] || '',
    API_VERSION: LATEST_API_VERSION,
    IS_EMBEDDED_APP: true,
    // This should be replaced with your preferred storage strategy
    SESSION_STORAGE: {
      storeSession,
      loadSession,
      deleteSession,
      deleteSessions,
      findSessionsByShop,
    }
  });
}