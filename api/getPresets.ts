import { NowRequest, NowResponse } from '@vercel/node';
import { airtableList } from '../lib/airtable';

module.exports = async (_req: NowRequest, res: NowResponse) => {
  const data = await airtableList('preset');
  res.json({ presets: data.records.map((r) => r.fields) });
};
