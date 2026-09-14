// Safe RapidAPI beta connectivity/quota diagnostic.
// Never prints the API key. It records only response status + rate-limit headers.
const KEY = process.env.AMAZON_RAPIDAPI_KEY || '';
const HOST = process.env.AMAZON_API_HOST || 'real-time-amazon-data.p.rapidapi.com';
const BASE = (process.env.AMAZON_API_BASE || `https://${HOST}`).replace(/\/$/, '');
const COUNTRY = process.env.AMAZON_COUNTRY || 'US';

if (!KEY) {
  console.error('DIAGNOSE: AMAZON_RAPIDAPI_KEY is missing.');
  process.exit(2);
}

const url = new URL(`${BASE}/search`);
url.searchParams.set('query', 'wireless headphones');
url.searchParams.set('page', '1');
url.searchParams.set('country', COUNTRY);

const response = await fetch(url, {
  headers: {
    Accept: 'application/json',
    'X-RapidAPI-Key': KEY,
    'X-RapidAPI-Host': HOST
  }
});

const headers = {};
for (const name of [
  'x-ratelimit-requests-limit',
  'x-ratelimit-requests-remaining',
  'x-ratelimit-requests-reset',
  'x-ratelimit-limit',
  'x-ratelimit-remaining',
  'x-ratelimit-reset',
  'x-rate-limit-rapid-free-plans-hard-limit-limit',
  'x-rate-limit-rapid-free-plans-hard-limit-remaining',
  'x-rate-limit-rapid-free-plans-hard-limit-reset',
  'x-rapidapi-proxy-response',
  'x-rapidapi-version'
]) {
  const value = response.headers.get(name);
  if (value !== null) headers[name] = value;
}

const body = await response.text();
let parsed = null;
try { parsed = body ? JSON.parse(body) : null; } catch { parsed = null; }

console.log(JSON.stringify({
  endpoint: '/search',
  status: response.status,
  statusText: response.statusText,
  host: HOST,
  country: COUNTRY,
  headers,
  body: parsed || String(body).slice(0, 500)
}, null, 2));

// Do not fail the whole catalog workflow: this is diagnostic only.
process.exit(0);
