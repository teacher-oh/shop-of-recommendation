// Open Food Facts family adapter.
// Public read requests do not require an API key; use a descriptive User-Agent.
// Supports food, beauty, pet food and other products through the sibling databases.

const BASES = {
  food: 'https://world.openfoodfacts.org',
  beauty: 'https://world.openbeautyfacts.org',
  petfood: 'https://world.openpetfoodfacts.org',
  product: 'https://world.openproductsfacts.org'
};

async function run({ query = '', limit = 20, type = 'all', fetchImpl = fetch } = {}) {
  const term = String(query).trim();
  if (!term) return [];
  const capped = Math.min(Math.max(limit, 1), 50);
  const types = type === 'all' ? Object.keys(BASES) : [type].filter(x => BASES[x]);
  const headers = {
    Accept: 'application/json',
    'User-Agent': process.env.OPENFACTS_USER_AGENT || 'shop-of-recommendation/1.0 (public catalog integration)'
  };
  const out = [];
  for (const kind of types) {
    const base = BASES[kind];
    const params = new URLSearchParams({
      categories_tags: term,
      page_size: String(capped),
      fields: 'code,product_name,brands,image_front_url,categories_tags,nutriscore_grade,ecoscore_grade,nutrition_grades'
    });
    const res = await fetchImpl(`${base}/api/v2/search?${params}`, { headers });
    if (!res.ok) continue;
    const data = await res.json();
    for (const item of data.products || []) {
      const code = item.code || item._id;
      out.push({
        id: `openfacts:${kind}:${code || item.product_name}`,
        source: `open${kind === 'petfood' ? 'petfoodfacts' : kind === 'product' ? 'productsfacts' : kind === 'beauty' ? 'beautyfacts' : 'foodfacts'}`,
        sourceId: code || null,
        brand: item.brands || '',
        name: item.product_name || '',
        image: item.image_front_url || '',
        price: null,
        currency: null,
        rating: null,
        ratingCount: null,
        url: code ? `${base}/product/${encodeURIComponent(code)}` : base,
        description: '',
        category: item.categories_tags?.[0] || kind,
        country: '',
        offers: [],
        identifiers: { gtin: code || null },
        nutrition: {
          nutriscore: item.nutriscore_grade || null,
          ecoscore: item.ecoscore_grade || null
        },
        dataQuality: 'open-crowdsourced-catalog',
        evidence: { source: base, observedAt: new Date().toISOString() }
      });
    }
  }
  return out.slice(0, capped);
}

module.exports = { run };
