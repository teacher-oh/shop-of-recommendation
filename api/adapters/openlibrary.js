// Open Library adapter. Public, low-volume book discovery API; follow its usage guidelines.
const BASE = 'https://openlibrary.org';

async function run({ query = '', limit = 20, fetchImpl = fetch } = {}) {
  if (!query) return [];
  const params = new URLSearchParams({ q: query, limit: String(Math.min(Math.max(limit, 1), 100)) });
  const headers = { Accept: 'application/json', 'User-Agent': process.env.OPENLIBRARY_USER_AGENT || 'shop-of-recommendation/1.0' };
  const res = await fetchImpl(`${BASE}/search.json?${params}`, { headers });
  if (!res.ok) throw new Error(`Open Library ${res.status} ${res.statusText}`);
  const data = await res.json();
  return (data.docs || []).map(item => {
    const isbn = item.isbn?.[0] || null;
    const key = item.key || '';
    const workId = key.split('/').pop() || null;
    return {
      id: `openlibrary:${workId || isbn || item.title}`,
      source: 'openlibrary',
      sourceId: workId || isbn,
      brand: '',
      name: item.title || '',
      image: item.cover_i ? `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg` : '',
      price: null,
      currency: null,
      rating: item.ratings_average ?? null,
      ratingCount: item.ratings_count ?? null,
      url: key ? `${BASE}${key}` : '',
      description: '',
      category: 'books',
      country: '',
      offers: [],
      identifiers: { isbn, isbn13: item.isbn?.find(x => String(x).length === 13) || null },
      dataQuality: 'public-catalog',
      evidence: { source: 'openlibrary', observedAt: new Date().toISOString() }
    };
  });
}

module.exports = { run };
