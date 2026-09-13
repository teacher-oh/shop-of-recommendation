// Fake Store API adapter. Public sample ecommerce data; useful for development/validation only.
const BASE = 'https://fakestoreapi.com';

async function run({ query = '', limit = 20, fetchImpl = fetch } = {}) {
  const res = await fetchImpl(`${BASE}/products`);
  if (!res.ok) throw new Error(`FakeStore ${res.status} ${res.statusText}`);
  const data = await res.json();
  const q = String(query).trim().toLowerCase();
  const filtered = q
    ? data.filter(item => `${item.title} ${item.description} ${item.category}`.toLowerCase().includes(q))
    : data;
  return filtered.slice(0, Math.min(Math.max(limit, 1), 100)).map(item => ({
    id: `fakestore:${item.id}`,
    source: 'fakestore',
    sourceId: String(item.id),
    brand: '',
    name: item.title || '',
    image: item.image || '',
    price: item.price ?? null,
    currency: 'USD',
    rating: item.rating?.rate ?? null,
    ratingCount: item.rating?.count ?? null,
    url: `${BASE}/products/${item.id}`,
    description: item.description || '',
    category: item.category || '',
    country: '',
    offers: [],
    dataQuality: 'synthetic',
    evidence: { source: 'fakestore', observedAt: new Date().toISOString() }
  }));
}

module.exports = { run };
