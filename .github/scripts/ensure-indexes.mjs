// Creates the Firestore indexes the app's queries need (safe to run again: an existing index is left alone).
import {GoogleAuth} from 'google-auth-library';

const BASE = 'https://firestore.googleapis.com/v1/projects/dojo-bucks/databases/(default)/collectionGroups';
const INDEXES = [
  // Parents' history: log entries of the public kinds (no penalties), newest first.
  {group: 'log', fields: [{fieldPath: 'kind', order: 'ASCENDING'}, {fieldPath: 'at', order: 'DESCENDING'}]},
];

const client = await new GoogleAuth({scopes: ['https://www.googleapis.com/auth/cloud-platform']}).getClient();
for (const ix of INDEXES) {
  try {
    await client.request({method: 'POST', url: `${BASE}/${ix.group}/indexes`, data: {queryScope: 'COLLECTION', fields: ix.fields}});
    console.log(`Index on ${ix.group} (${ix.fields.map(f => f.fieldPath).join(', ')}) is being built.`);
  } catch (e) {
    const err = e.response?.data?.error;
    if (err?.status === 'ALREADY_EXISTS' || e.response?.status === 409) { console.log(`Index on ${ix.group} already exists.`); continue; }
    throw new Error(`Could not create the index on ${ix.group}: ${err?.message || e.message}`);
  }
}
