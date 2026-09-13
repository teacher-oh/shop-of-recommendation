// eBay Browse API adapter.
// Production access is subject to eBay approval.
// Required env: EBAY_CLIENT_ID, EBAY_CLIENT_SECRET.
// Optional env: EBAY_API_BASE_URL, EBAY_MARKETPLACE_ID.

const DEFAULT_BASE = 'https://api.ebay.com';

async function getToken({ baseUrl = DEFAULT_BASE, clientId, clientSecret, fetchImpl = fetch }) {
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const res = await fetchImpl(`${baseUrl}/identity/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Language': 'en-US'
    },
    body: 'grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope'
  });
  if (!res.ok) throw new Error(`eBay token ${res.status} ${res.statusText}`);
  return res.json();
}

function normalizeItem(item) {
  const image = item.image?.imageUrl || item.thumbnailImages?.[0]?.imageUrl || '';
  const price = item.price?.value == null ? null : Number(item.price.value);
  return {
    id: `ebay:${item.itemId || item.legacyItemId}`,
    source: 'ebay',
    sourceId: item.itemId || item.legacyItemId || null,
    brand: item.brand || '',
    name: item.title || '',
    image,
    price,
    currency: item.price?.currency || null,
    sellerRating: item.seller?.feedbackPercentage == null ? null : Number(item.seller.feedbackPercentage),
    sellerRatingCount: item.seller?.feedbackScore == null ? 0 : Number(item.seller.feedbackScore),
    url: item.itemWebUrl || '',
    description: '',
    category: item.categories?.[0]?.categoryName || '',
    categoryId: item.categories?.[0]?.categoryId || null,
    country: item.itemLocation?.country || '',
    offers: [],
    evidence: {
      source: 'ebay',
      observedAt: new Date().toISOString(),
      gtin: item.gtin || null,
      epid: item.epid || null,
      condition: item.condition || null
    }
  };
}

async function search({ query, limit = 20, marketplaceId = 'EBAY_US', baseUrl = DEFAULT_BASE, clientId, clientSecret, fetchImpl = fetch }) {
  if (!query) return [];
  if (!clientId || !clientSecret) return [];
  const token = await getToken({ baseUrl, clientId, clientSecret, fetchImpl });
  const url = new URL('/buy/browse/v1/item_summary/search', baseUrl);
  url.searchParams.set('q', query);
  url.searchParams.set('limit', String(Math.min(Math.max(limit, 1), 200)));
  const res = await fetchImpl(url, {
    headers: {
      Authorization: `Bearer ${token.access_token}`,
      'X-EBAY-C-MARKETPLACE-ID': marketplaceId,
      'Accept-Language': 'en-US'
    }
  });
  if (!res.ok) throw new Error(`eBay Browse ${res.status} ${res.statusText}`);
  const data = await res.json();
  return (data.itemSummaries || []).map(normalizeItem);
}

async function run({ query = process.env.SEARCH_QUERY || '', limit = Number(process.env.EBAY_LIMIT || 20), fetchImpl = fetch } = {}) {
  return search({
    query,
    limit,
    marketplaceId: process.env.EBAY_MARKETPLACE_ID || 'EBAY_US',
    baseUrl: process.env.EBAY_API_BASE_URL || DEFAULT_BASE,
    clientId: process.env.EBAY_CLIENT_ID,
    clientSecret: process.env.EBAY_CLIENT_SECRET,
    fetchImpl
  });
}

module.exports = { getToken, search, run, normalizeItem };
