import {NextApiRequest, NextApiResponse} from 'next';
import {getFlow, runFlow} from 'genkit';
import * as flows from 'ai/dev';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {slug} = req.query;

  if (
    !slug ||
    !Array.isArray(slug) ||
    slug.length < 2 ||
    slug[0] !== 'genkit' ||
    slug[1] !== 'flow'
  ) {
    return res.status(404).send('Not Found');
  }
  const flowId = slug[2];

  // You may want to add some auth checking here.
  const flow = getFlow(flowId);
  if (!flow) {
    return res.status(404).send('Not Found');
  }

  try {
    const output = await runFlow(flow, req.body);
    return res.status(200).json(output);
  } catch (err: any) {
    return res.status(500).json({error: err.message});
  }
}
