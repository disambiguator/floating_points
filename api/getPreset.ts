import { airtableShow } from '../lib/airtable'
import { NowRequest, NowResponse } from '@now/node'

type AirtableResponse = {
  fields: Record<string, any>;
}

interface GetPresetRequest extends NowRequest {
  query: {
    ids: string;
  }
}

module.exports = async (req: GetPresetRequest, res: NowResponse) => {
  const ids: Array<string> = JSON.parse(req.query.ids)

  const airtableResponses = await Promise.all(
    ids.map(id => airtableShow('preset', id)),
  )
  const fields = airtableResponses.map((r: AirtableResponse) => r.fields)

  res.json(fields)
}
