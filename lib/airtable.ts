import fetch from 'node-fetch'

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
const AIRTABLE_ENDPOINT = process.env.AIRTABLE_ENDPOINT

interface AirtableRecord {
  fields: {
    id: string,
  }
}

const fetchJson = async (...fetchArgs) => {
  const response = await fetch(fetchArgs)
  return response.json()
}

export const airtablePut = async (table, body: any) =>
  fetchJson(`${AIRTABLE_ENDPOINT}/${table}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fields: body })
  })

export const airtableList = (table) => fetchJson(`${AIRTABLE_ENDPOINT}/${table}?api_key=${AIRTABLE_API_KEY}`)

export const airtableShow = (table, id) => fetchJson(`${AIRTABLE_ENDPOINT}/${table}/${id}`, {
  headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` }
})
