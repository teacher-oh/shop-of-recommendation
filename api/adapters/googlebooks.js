// Google Books public-volume adapter. Public volume endpoints can be queried without authentication.
const BASE = 'https://www.googleapis.com/books/v1/volumes';

async function run({ query = '', limit = 20, fetchImpl = fetch } = {}) {
  if (!query) return [];
  const params = new URLSearchParams({ q: query, maxResults: String(Math.min(Math.max(limit, 1), 40)) });
  if (process.env.GOOGLE_BOOKS_API_KEY) params.set('key', process.env.GOOGLE_BOOKS_API_KEY);
  const res = await fetchImpl(`${BASE}?${params}`);
  if (!res.ok) throw new Error(`Google Books ${res.status} ${res.statusText}`);
  const data = await res.json();
  return (data.items || []).map(item => {
    const v = item.volumeInfo || {};
    const ids = Object.fromEntries((v.industryIdentifiers || []).map(x => [x.type, x.identifier]));
    return {
      id: `googlebooks:${item.id}`,
      source: 'googlebooks',
      sourceId: item.id,
      brand: v.publisher || '',
      name: v.title || '',
      image: v.imageLinks?.thumbnail || v.imageLinks?.smallThumbnail || '',
      price: item.saleInfo?.retailPrice?.amount ?? null,
      currency: item.saleInfo?.retailPrice?.currencyCode || null,
      rating: v.averageRating ?? null,
      ratingCount: v.ratingsCount ?? null,
      url: v.infoLink || '',
      description: v.description || '',
      category: 'books',
      country: v.country || '',
      offers: [],
      identifiers: { isbn10: ids.ISBN_10 || null, isbn13: ids.ISBN_13 || null },
      dataQuality: 'public-catalog',
      evidence: { source: 'googlebooks', observedAt: new Date().toISOString() }
    };
  });
}

module.exports = { run };
