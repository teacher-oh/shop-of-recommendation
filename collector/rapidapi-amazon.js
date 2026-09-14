// RapidAPI Real-Time Amazon Data collector.
// Secrets are supplied by GitHub Actions; never hard-code API keys here.
// The current provider exposes Product Search at /search and returns ASIN, title,
// price, rating, review count, image and product URL fields.

const fs = require('node:fs');
const path = require('node:path');

const HOST = process.env.AMAZON_API_HOST || 'real-time-amazon-data.p.rapidapi.com';
const BASE = (process.env.AMAZON_API_BASE || `https://${HOST}`).replace(/\/$/, '');
const KEY = process.env.AMAZON_RAPIDAPI_KEY || '';
const COUNTRY = process.env.AMAZON_COUNTRY || 'US';
const QUERY = process.env.AMAZON_SEARCH_QUERY || 'wireless headphones';
const PAGE = process.env.AMAZON_SEARCH_PAGE || '1';
const LIMIT = Number(process.env.AMAZON_SEARCH_LIMIT || 10);

if (!KEY) {
  console.log('RapidAPI key not configured; leaving existing catalog unchanged.');
  process.exit(0);
}

function first(...values) {
  return values.find(v => v !== undefined && v !== null && v !== '');
}

function number(value) {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(String(value).replace(/[^0-9.\-]/g, ''));
  return Number.isFinite(n) ? n : null;
}

function productsFromResponse(json) {
  const data = json?.data ?? json;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(json?.products)) return json.products;
  if (Array.isArray(json?.results)) return json.results;
  return [];
}

function normalize(item) {
  const asin = first(item.asin, item.ASIN, item.product_asin, item.id);
  const name = first(item.product_title, item.title, item.name, item.productTitle);
  const price = number(first(item.product_price, item.price, item.current_price, item.buybox_price));
  const rating = number(first(item.product_star_rating, item.rating, item.stars, item.product_rating));
  const ratingCount = number(first(item.product_num_ratings, item.reviews_count, item.rating_count, item.review_count)) || 0;
  const image = first(item.product_photo, item.product_photo_url, item.image, item.image_url, item.thumbnail);
  const url = first(item.product_url, item.url, item.link) || (asin ? `https://www.amazon.com/dp/${asin}` : '');
  if (!asin && !name) return null;

  return {
    id: `amazon:${asin || name}`,
    source: 'amazon-rapidapi',
    sourceId: asin || null,
    brand: first(item.brand, item.manufacturer, '') || '',
    name: name || 'Amazon product',
    image: image || '',
    price,
    currency: first(item.currency, 'USD'),
    rating,
    ratingCount,
    url,
    description: first(item.product_description, item.description, '') || '',
    category: first(item.category, item.category_name, 'etc') || 'etc',
    country: COUNTRY,
    offers: Array.isArray(item.offers) ? item.offers : [],
    evidence: {
      source: 'RapidAPI / Real-Time Amazon Data',
      retrievedAt: new Date().toISOString(),
      marketplace: COUNTRY,
      query: QUERY,
      asin
    }
  };
}

async function main() {
  const url = new URL(`${BASE}/search`);
  url.searchParams.set('query', QUERY);
  url.searchParams.set('page', PAGE);
  url.searchParams.set('country', COUNTRY);

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'X-RapidAPI-Key': KEY,
      'X-RapidAPI-Host': HOST
    }
  });

  if (!response.ok) throw new Error(`RapidAPI ${response.status} ${response.statusText}`);
  const json = await response.json();
  const incoming = productsFromResponse(json).slice(0, LIMIT).map(normalize).filter(Boolean);

  if (!incoming.length) {
    console.log('RapidAPI returned no normalized products; leaving existing catalog unchanged.');
    return;
  }

  const file = path.join(process.cwd(), 'data', 'products.json');
  const existing = JSON.parse(fs.readFileSync(file, 'utf8'));
  const list = Array.isArray(existing) ? existing : (Array.isArray(existing.products) ? existing.products : []);
  const map = new Map(list.map(p => [p.id, p]));
  for (const product of incoming) map.set(product.id, product);

  const output = {
    updatedAt: new Date().toISOString(),
    count: map.size,
    products: [...map.values()]
  };
  fs.writeFileSync(file, JSON.stringify(output, null, 2) + '\n');
  console.log(`RapidAPI catalog refresh: ${incoming.length} Amazon products merged; total ${map.size}.`);
}

main().catch(error => {
  console.error(error.stack || error.message || error);
  process.exit(1);
});
