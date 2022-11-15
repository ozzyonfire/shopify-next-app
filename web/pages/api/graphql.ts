import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios';

async function graphQl(req: NextApiRequest, res: NextApiResponse) {
  if (req.method == 'POST') {
    const { version, appName } = req.query;

    const response = await axios.post(`${process.env.API_URL}/graphql/${version}/${appName}`, req.body, {
      headers: {
        'authorization': req.headers.authorization
      }
    });
    return res.json(response.data);
  } else {
    return res.status(401).end();
  }
}

export default graphQl;