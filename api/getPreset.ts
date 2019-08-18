import { airtableShow } from '../lib/airtable'

type AirtableResponse = {
  fields: Object
}

module.exports = async (req, res) => {
  const ids = JSON.parse(req.query.ids)

  const airtableResponses = await Promise.all(ids.map((id) => airtableShow('preset', id)))
  const fields = airtableResponses.map((r : AirtableResponse) => r.fields)

  res.json(fields)
}
