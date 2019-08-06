import { airtableList } from '../lib/airtable'

module.exports = (_req, res) => {
  airtableList('preset')
    .then(data => res.json({ presets: data.records.map((r) => r.fields) }))
}
