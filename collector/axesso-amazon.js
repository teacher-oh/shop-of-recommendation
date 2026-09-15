// Axesso Amazon Data Service collector.
// Direct Axesso mode is the default; RapidAPI mode remains optional for compatibility.

const fs = require('node:fs');
const path = require('node:path');

const MODE = String(process.env.AXESSO_MODE || 'direct').toLowerCase();
const HOST = process.env.AXESSO_API_HOST || '';
const BASE = (process.env.AXESSO_API_BASE || (HOST ? `https://${HOST}` : '')).replace(/\/$/, '');
const KEY = process.env.AXESSO_API_KEY || process.env.AXESSO_RAPIDAPI_KEY || '';
const COUNTRY = process.env.AXESSO_COUNTRY || 'US';
const DOMAIN = process.env.AXESSO_DOMAIN || (COUNTRY === 'US' ? 'com' : COUNTRY.toLowerCase());
const QUERIES = String(process.env.AXESSO_BETA_QUERIES || 'wireless headphones,wireless earbuds,laptop,smartphone,monitor,keyboard,mouse,air fryer,vacuum cleaner,running shoes,backpack,coffee maker')
  .split(',').map(s => s.trim()).filter(Boolean);
const PAGES = Math.max(1, Number(process.env.AXESSO_BETA_PAGES || 2));
const MAX_PRODUCTS = Math.max(1, Number(process.env.AXESSO_BETA_MAX_PRODUCTS || 100));
const DETAIL_LIMIT = Math.max(0, Number(process.env.AXESSO_BETA_DETAILS || 50));
const DELAY_MS = Math.max(250, Number(process.env.AXESSO_BETA_DELAY_MS || 750));

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const first = (...values) => values.find(v => v !== undefined && v !== null && v !== '');

function number(value) {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(String(value).replace(/[^0-9.\-]/g, ''));
  return Number.isFinite(n) ? n : null;
}

function rating5(value) {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const match = String(value).match(/\d+(?:\.\d+)?/);
  if (!match) return null;
  const n = Number(match[0]);
  return Number.isFinite(n) && n >= 0 && n <= 5 ? n : null;
}

function findAsin(value) {
  if (!value) return null;
  if (typeof value === 'object') {
    for (const key of ['asin', 'ASIN', 'productAsin', 'productASIN']) {
      const direct = String(value[key] || '').match(/\b[A-Z0-9]{10}\b/i);
      if (direct) return direct[0].toUpperCase();
    }
    for (const child of Object.values(value)) {
      const nested = findAsin(child);
      if (nested) return nested;
    }
  }
  const text = String(value);
  const match = text.match(/(?:dp\/|gp\/product\/|asin\/|ASIN[:=]\s*)([A-Z0-9]{10})/i) || text.match(/\b[A-Z0-9]{10}\b/);
  return match ? (match[1] || match[0]).toUpperCase() : null;
}

function authHeaders() {
  const headers = { Accept: 'application/json' };
  if (MODE === 'rapidapi') {
    headers['X-RapidAPI-Key'] = process.env.AXESSO_RAPIDAPI_KEY || '';
    if (HOST) headers['X-RapidAPI-Host'] = HOST;
    return headers;
  }
  // Direct Axesso is normally provisioned from its own developer portal.
  // Keep the header configurable so we never hard-code an undocumented scheme.
  const headerName = process.env.AXESSO_API_KEY_HEADER || 'Ocp-Apim-Subscription-Key';
  if (KEY) headers[headerName] = KEY;
  return headers;
}

async function getJson(endpoint, params, attempts = 2) {
  if (!BASE) throw new Error('AXESSO_API_BASE is required in direct mode.');
  const url = new URL(`${BASE}${endpoint}`);
  for (const [key, value] of Object.entries(params || {})) {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
  }

  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, { headers: authHeaders() });
      const text = await response.text();
      let json = null;
      try { json = text ? JSON.parse(text) : null; } catch { json = { raw: text }; }
      if (response.ok) return json;
      const error = new Error(`Axesso ${response.status} ${response.statusText}`);
      error.status = response.status;
      error.body = json;
      throw error;
    } catch (error) {
      lastError = error;
      if (attempt < attempts && [429, 500, 502, 503, 504].includes(error.status)) {
        await sleep(1500 * attempt);
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

function normalizeDetail(detail, asin, query) {
  const rating = rating5(first(detail.productRating, detail.product_rating, detail.rating));
  const reviewCount = number(first(detail.countReview, detail.reviewCount, detail.review_count));
  const price = number(first(detail.price, detail.currentPrice, detail.retailPrice));
  const title = first(detail.productTitle, detail.product_title, detail.title, `Amazon product ${asin}`);
  const url = first(detail.url, detail.productUrl, `https://www.amazon.${DOMAIN}/dp/${asin}`);

  return {
    id: `amazon:${asin}`,
    source: 'amazon-axesso',
    sourceId: asin,
    asin,
    brand: first(detail.manufacturer, detail.brand, ''),
    name: title,
    image: first(detail.image, detail.imageUrl, detail.productImage, detail.product_photo, ''),
    price,
    currency: COUNTRY === 'US' ? 'USD' : first(detail.currency, null),
    rating,
    ratingCount: reviewCount,
    reviewCount,
    reviews: reviewCount,
    url,
    description: first(detail.description, detail.productDescription, Array.isArray(detail.features) ? detail.features.join(' ') : '', ''),
    category: first(detail.category, detail.categoryName, 'etc'),
    country: COUNTRY,
    isPrime: Boolean(detail.prime),
    delivery: first(detail.priceShippingInformation, detail.delivery, ''),
    seller: first(detail.soldBy, detail.seller, ''),
    fulfilledBy: first(detail.fulfilledBy, ''),
    availability: first(detail.warehouseAvailability, detail.availability, ''),
    evidence: {
      source: MODE === 'rapidapi' ? 'Axesso Amazon Data Service via RapidAPI' : 'Axesso Amazon Data Service direct API',
      retrievedAt: new Date().toISOString(),
      marketplace: COUNTRY,
      query,
      asin
    },
    amazonDetails: {
      features: Array.isArray(detail.features) ? detail.features : [],
      priceSaving: first(detail.priceSaving, ''),
      retailPrice: number(detail.retailPrice),
      answeredQuestions: number(detail.answeredQuestions),
      sizeSelection: Array.isArray(detail.sizeSelection) ? detail.sizeSelection : [],
      prime: Boolean(detail.prime),
      soldBy: first(detail.soldBy, ''),
      fulfilledBy: first(detail.fulfilledBy, ''),
      warehouseAvailability: first(detail.warehouseAvailability, ''),
      raw: detail
    }
  };
}

function extractSearchItems(json) {
  const data = json?.data ?? json;
  return Array.isArray(data?.foundProducts) ? data.foundProducts :
    Array.isArray(json?.foundProducts) ? json.foundProducts :
    Array.isArray(data) ? data : [];
}

async function main() {
  if (!KEY) {
    console.log('Axesso API key is not configured; leaving existing catalog unchanged.');
    return;
  }
  if (!BASE) {
    throw new Error('AXESSO_API_BASE is not configured for direct Axesso mode.');
  }

  const startedAt = new Date().toISOString();
  const stats = { searchCalls: 0, detailCalls: 0, productsFound: 0, errors: [] };
  const candidates = new Map();

  for (const query of QUERIES) {
    for (let page = 1; page <= PAGES && candidates.size < MAX_PRODUCTS; page += 1) {
      try {
        const json = await getJson('/amz/amazon-search-by-keyword-asin', {
          keyword: query,
          domainCode: DOMAIN,
          page,
          numberOfProducts: 20,
          sortBy: 'relevanceblender'
        });
        stats.searchCalls += 1;
        const items = extractSearchItems(json);
        for (const item of items) {
          const asin = findAsin(item);
          if (asin) candidates.set(asin, { asin, query });
          if (candidates.size >= MAX_PRODUCTS) break;
        }
        if (!items.length) break;
      } catch (error) {
        stats.errors.push({ endpoint: 'search', query, page, status: error.status || null, message: error.message });
      }
      await sleep(DELAY_MS);
    }
  }

  const products = [];
  for (const { asin, query } of candidates.values()) {
    if (products.length >= DETAIL_LIMIT || products.length >= MAX_PRODUCTS) break;
    try {
      const json = await getJson('/amz/amazon-lookup-product', {
        url: `https://www.amazon.${DOMAIN}/dp/${asin}`
      });
      stats.detailCalls += 1;
      const detail = json?.data ?? json;
      products.push(normalizeDetail(detail, asin, query));
    } catch (error) {
      stats.errors.push({ endpoint: 'product-detail', asin, status: error.status || null, message: error.message });
    }
    await sleep(DELAY_MS);
  }

  stats.productsFound = products.length;
  const retrievedAt = new Date().toISOString();
  const file = path.join(process.cwd(), 'data', 'products.json');
  const existing = JSON.parse(fs.readFileSync(file, 'utf8'));
  const list = Array.isArray(existing) ? existing : (Array.isArray(existing.products) ? existing.products : []);
  const map = new Map(list.map(p => [p.id, p]));
  for (const product of products) map.set(product.id, product);
  const output = Array.isArray(existing)
    ? [...map.values()]
    : { ...existing, generatedAt: retrievedAt, updatedAt: retrievedAt, count: map.size, products: [...map.values()] };
  fs.writeFileSync(file, JSON.stringify(output, null, 2) + '\n');

  fs.writeFileSync(path.join(process.cwd(), 'data', 'amazon-beta.json'), JSON.stringify({
    provider: 'axesso-amazon-data-service', mode: MODE, generatedAt: retrievedAt, startedAt,
    marketplace: COUNTRY, domain: DOMAIN, queries: QUERIES,
    config: { pages: PAGES, maxProducts: MAX_PRODUCTS, detailLimit: DETAIL_LIMIT, delayMs: DELAY_MS },
    stats, products
  }, null, 2) + '\n');
  console.log(JSON.stringify({ ok: true, provider: 'axesso-amazon-data-service', mode: MODE, productsImported: products.length, totalCatalog: map.size, ...stats }, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
