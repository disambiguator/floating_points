import { airtableList } from '../lib/airtable';
import { NowRequest, NowResponse } from '@vercel/node';

module.exports = async (_req: NowRequest, res: NowResponse) => {
  const data = await airtableList('preset');
  res.json({ presets: data.records.map((r) => r.fields) });
};
