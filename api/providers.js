// Server-side marketplace adapters. Keep credentials in deployment environment variables.
// This module normalizes provider payloads into one product shape.

const fetchJson = async (url, options = {}) => {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
};

const normalize = (item, source) => ({
  id: `${source}:${item.id || item.asin || item.productId || item.sku || Math.random().toString(36).slice(2)}`,
  source,
  sourceId: item.id || item.asin || item.productId || item.sku || null,
  brand: item.brand || item.manufacturer || '',
  name: item.name || item.title || '',
  image: item.image || item.imageUrl || item.thumbnail || '',
  price: item.price ?? null,
  currency: item.currency || 'USD',
  rating: item.rating ?? null,
  ratingCount: item.ratingCount ?? item.reviewCount ?? 0,
  url: item.url || item.link || '',
  description: item.description || '',
  category: item.category || 'etc',
  country: item.country || '',
  offers: item.offers || []
});

async function amazon() {
  if (!process.env.AMAZON_API_URL || !process.env.AMAZON_API_KEY) return [];
  const data = await fetchJson(`${process.env.AMAZON_API_URL}?keywords=${encodeURIComponent(process.env.SEARCH_QUERY || 'best products')}`, {
    headers: { Authorization: `Bearer ${process.env.AMAZON_API_KEY}` }
  });
  return (data.items || data.products || []).map(x => normalize(x, 'amazon'));
}

async function aliexpress() {
  if (!process.env.ALIEXPRESS_API_URL || !process.env.ALIEXPRESS_API_KEY) return [];
  const data = await fetchJson(`${process.env.ALIEXPRESS_API_URL}?keywords=${encodeURIComponent(process.env.SEARCH_QUERY || 'best products')}`, {
    headers: { Authorization: `Bearer ${process.env.ALIEXPRESS_API_KEY}` }
  });
  return (data.items || data.products || []).map(x => normalize(x, 'aliexpress'));
}

async function coupang() {
  if (!process.env.COUPANG_API_URL || !process.env.COUPANG_ACCESS_KEY || !process.env.COUPANG_SECRET_KEY) return [];
  // Coupang uses HMAC authentication. The deployment should generate the exact
  // signature required by the current Coupang API contract before calling this adapter.
  const data = await fetchJson(`${process.env.COUPANG_API_URL}?keyword=${encodeURIComponent(process.env.SEARCH_QUERY || 'best products')}`, {
    headers: {
      'Authorization': process.env.COUPANG_AUTHORIZATION || '',
      'X-Requested-With': 'XMLHttpRequest'
    }
  });
  return (data.items || data.products || data.data || []).map(x => normalize(x, 'coupang'));
}

async function runProviders() {
  const results = await Promise.allSettled([amazon(), aliexpress(), coupang()]);
  return results.flatMap((r, i) => r.status === 'fulfilled' ? r.value : []);
}

module.exports = { runProviders, normalize };
