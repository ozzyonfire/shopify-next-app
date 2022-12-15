// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import verifyRequest from '../../helpers/verify-request';

export type APIResponse<DataType> = {
  status: 'success' | 'error';
  data?: DataType;
  message?: string;
}

type Data = {
  name: string,
  height: string
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIResponse<Data>>
) {
  try {
    const isValid = await verifyRequest(req, res, true);
    console.log('isValid', isValid);
    res.status(200).json({
      status: 'success',
      data: {
        name: 'Luke Skywalker',
        height: '172'
      }
    });
  } catch (err) {
    return res.json({
      status: 'error',
      message: 'Invalid request'
    })
  }
}

export default handler;
