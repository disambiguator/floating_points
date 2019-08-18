import { airtableList } from '../lib/airtable'

module.exports = async (_req, res) => {
  const data = await airtableList('preset')
  res.json({ presets: data.records.map((r) => r.fields) })
}
