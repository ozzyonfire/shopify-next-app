import Shopify, { LATEST_API_VERSION } from "@shopify/shopify-api";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import initializeContext from "../utils/initialize-context";

const withShopifyContext = (handler: NextApiHandler) => async (req: NextApiRequest, res: NextApiResponse) => {
  initializeContext();
  return handler(req, res);
}

export default withShopifyContext;