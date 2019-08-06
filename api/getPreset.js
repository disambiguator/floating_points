import { airtableShow } from '../lib/airtable'

module.exports = (req, res) => {
  const ids = JSON.parse(req.query.ids)

  Promise.all(ids.map((id) => (
    airtableShow('preset', id)
      .then((response) => response.fields)
  )))
    .then((responses) => res.json(responses))
}
