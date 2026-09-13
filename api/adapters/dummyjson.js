// DummyJSON adapter. Public sample ecommerce data; useful for development/validation only.
const BASE = 'https://dummyjson.com';

async function run({ query = '', limit = 20, fetchImpl = fetch } = {}) {
  const url = query
    ? `${BASE}/products/search?q=${encodeURIComponent(query)}&limit=${Math.min(Math.max(limit, 1), 100)}`
    : `${BASE}/products?limit=${Math.min(Math.max(limit, 1), 100)}`;
  const res = await fetchImpl(url);
  if (!res.ok) throw new Error(`DummyJSON ${res.status} ${res.statusText}`);
  const data = await res.json();
  return (data.products || []).map(item => ({
    id: `dummyjson:${item.id}`,
    source: 'dummyjson',
    sourceId: String(item.id),
    brand: item.brand || '',
    name: item.title || '',
    image: item.thumbnail || item.images?.[0] || '',
    price: item.price ?? null,
    currency: 'USD',
    rating: item.rating ?? null,
    ratingCount: item.reviewCount ?? null,
    url: `https://dummyjson.com/products/${item.id}`,
    description: item.description || '',
    category: item.category || '',
    country: '',
    offers: [],
    dataQuality: 'synthetic',
    evidence: { source: 'dummyjson', observedAt: new Date().toISOString() }
  }));
}

module.exports = { run };
