import { airtableShow } from '../lib/airtable';
import { NowRequest, NowResponse } from '@vercel/node';

type AirtableResponse = {
  fields: Record<string, unknown>;
};

interface GetPresetRequest extends NowRequest {
  query: {
    ids: string;
  };
}

module.exports = async (req: GetPresetRequest, res: NowResponse) => {
  const ids: Array<string> = JSON.parse(req.query.ids);

  const airtableResponses: AirtableResponse[] = await Promise.all(
    ids.map((id) => airtableShow('preset', id)),
  );
  const fields = airtableResponses.map((r) => r.fields);

  res.json(fields);
};
