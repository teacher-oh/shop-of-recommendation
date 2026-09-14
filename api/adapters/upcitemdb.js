// UPCitemdb free trial adapter.
// No API key or signup is required for the /prod/trial endpoint.
// Free tier is rate-limited, so callers should cache barcode lookups.
const BASE = 'https://api.upcitemdb.com/prod/trial/lookup';

async function run({ query = '', limit = 10, fetchImpl = fetch } = {}) {
  const term = String(query).trim();
  if (!term) return [];
  // The trial endpoint is intended for UPC/EAN lookups, not unrestricted catalog search.
  if (!/^\d{8,14}$/.test(term)) return [];
  const res = await fetchImpl(`${BASE}?upc=${encodeURIComponent(term)}`, {
    headers: { Accept: 'application/json' }
  });
  if (!res.ok) throw new Error(`UPCitemdb ${res.status} ${res.statusText}`);
  const data = await res.json();
  return (data.items || []).slice(0, Math.min(Math.max(limit, 1), 20)).map(item => ({
    id: `upcitemdb:${item.ean || item.upc || item.title}`,
    source: 'upcitemdb',
    sourceId: item.ean || item.upc || null,
    brand: item.brand || '',
    name: item.title || '',
    image: item.images?.[0] || '',
    price: item.offers?.[0]?.price ?? null,
    currency: item.offers?.[0]?.currency || null,
    rating: null,
    ratingCount: null,
    url: item.offers?.[0]?.link || '',
    description: item.description || '',
    category: item.category || '',
    country: '',
    offers: item.offers || [],
    identifiers: {
      upc: item.upc || null,
      ean: item.ean || null,
      gtin: item.gtin || item.ean || item.upc || null,
      mpn: item.mpn || null
    },
    dataQuality: 'barcode-catalog',
    evidence: { source: 'upcitemdb', observedAt: new Date().toISOString() }
  }));
}

module.exports = { run };
