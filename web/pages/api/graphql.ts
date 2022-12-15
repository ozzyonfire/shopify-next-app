import { GraphqlQueryError } from '@shopify/shopify-api';
import type { NextApiRequest, NextApiResponse } from 'next'
import shopify from '../../utils/initialize-context';
import { loadSession } from '../../utils/session-storage';

const graphQl = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method == 'POST') {
    const sessionId = await shopify.session.getCurrentId({
      rawRequest: req,
      rawResponse: res,
      isOnline: true
    });

    if (!sessionId) {
      throw new Error("No session id found.");
    }

    const session = await loadSession(sessionId, process.env.SHOPIFY_API_KEY || '');

    if (!session) {
      throw new Error("No sesssion found.");
    }
    try {
      // const rawBody = await buffer(req);
      const response = await shopify.clients.graphqlProxy({
        rawBody: req.body,
        session
      });
      return res.json(response.body);
    } catch (error) {
      if (error instanceof GraphqlQueryError) {
        console.log(error.response);
        return res.status(500).json({ error: error.response });
      }
      console.log(error);
      return res.status(500).send(error);
    }
  }
}

export default graphQl;