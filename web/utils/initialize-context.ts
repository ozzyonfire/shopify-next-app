import Shopify, { LATEST_API_VERSION } from "@shopify/shopify-api";

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
    // See note below regarding using CustomSessionStorage with this template.
    SESSION_STORAGE: new Shopify.Session.SQLiteSessionStorage(DB_PATH),
    ...(process.env.SHOP_CUSTOM_DOMAIN && { CUSTOM_SHOP_DOMAINS: [process.env.SHOP_CUSTOM_DOMAIN] }),
  });
}