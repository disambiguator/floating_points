import fetch from 'node-fetch'

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
const AIRTABLE_ENDPOINT = process.env.AIRTABLE_ENDPOINT

export const airtablePut = (table, body) => (
  fetch(`${AIRTABLE_ENDPOINT}/${table}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({fields: body})
  }).then((response) => response.json())
)

export const airtableList = (table) => (
  fetch(`${AIRTABLE_ENDPOINT}/${table}?api_key=${AIRTABLE_API_KEY}`)
    .then((resp) => resp.json())
)

export const airtableShow = (table, id) => (
  fetch(`${AIRTABLE_ENDPOINT}/${table}/${id}`, {
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
    },
  }).then((resp) => resp.json())
)