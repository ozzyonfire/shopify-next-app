import type { NextApiRequest, NextApiResponse } from 'next'
import withShopifyContext from '../../api-helpers/withShopifyContext';
import Shopify from '@shopify/shopify-api';

const graphQl = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method == 'POST') {
    const response = await Shopify.Utils.graphqlProxy(req, res);
    return res.json(response.body);
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default withShopifyContext(graphQl);