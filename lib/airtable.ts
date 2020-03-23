import fetch from 'node-fetch';

const { AIRTABLE_API_KEY, AIRTABLE_ENDPOINT } = process.env;

interface AirtableRecord {
  fields: {
    id: string;
  };
}

interface AirtableRecordSet {
  records: Array<AirtableRecord>;
}

const fetchJson = async (...fetchArgs: Parameters<typeof fetch>) => {
  const response = await fetch(...fetchArgs);
  return response.json();
};

export const airtablePut = async (table: string, body: {}) =>
  fetchJson(`${AIRTABLE_ENDPOINT}/${table}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields: body }),
  });

export const airtableList = (table: string): Promise<AirtableRecordSet> =>
  fetchJson(`${AIRTABLE_ENDPOINT}/${table}?api_key=${AIRTABLE_API_KEY}`);

export const airtableShow = (table: string, id: string) =>
  fetchJson(`${AIRTABLE_ENDPOINT}/${table}/${id}`, {
    headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
  });
