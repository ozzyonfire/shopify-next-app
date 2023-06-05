// import '@shopify/shopify-api/adapters/node';
import '@shopify/shopify-api/adapters/cf-worker';
import { shopifyApi, LATEST_API_VERSION } from "@shopify/shopify-api";

const shopify = shopifyApi({
	apiKey: process.env.SHOPIFY_API_KEY || '',
	apiSecretKey: process.env.SHOPIFY_API_SECRET || '',
	scopes: process.env.SCOPES?.split(",") || ['write_products'],
	hostName: process.env.HOST?.replace(/https?:\/\//, "") || '',
	hostScheme: 'https',
	isEmbeddedApp: true,
	apiVersion: LATEST_API_VERSION,
});

export default shopify;