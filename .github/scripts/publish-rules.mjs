// Publishes firestore.rules to the dojo-bucks Firebase project through the Firebase Rules API.
// Credentials come from GOOGLE_APPLICATION_CREDENTIALS (the service account key written by the workflow).
import {readFileSync} from 'node:fs';
import {GoogleAuth} from 'google-auth-library';

const PROJECT = 'dojo-bucks';
const API = `https://firebaserules.googleapis.com/v1/projects/${PROJECT}`;
const RELEASE = `projects/${PROJECT}/releases/cloud.firestore`;

const client = await new GoogleAuth({scopes: ['https://www.googleapis.com/auth/cloud-platform']}).getClient();
const call = async (method, url, data) => {
  try { return (await client.request({method, url, data})).data; }
  catch (e) { throw new Error(`${method} ${url}: ${e.response?.data?.error?.message || e.message}`); }
};

const content = readFileSync('firestore.rules', 'utf8');
const ruleset = await call('POST', `${API}/rulesets`, {source: {files: [{name: 'firestore.rules', content}]}});
console.log('Created ruleset', ruleset.name);
await call('PATCH', `https://firebaserules.googleapis.com/v1/${RELEASE}`, {release: {name: RELEASE, rulesetName: ruleset.name}});
console.log('Published to', RELEASE);
