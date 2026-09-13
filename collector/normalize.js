function normalizeProduct(raw, source) {
  return {
    id: `${source}:${raw.id || raw.sku || raw.gtin || raw.title}`,
    source,
    sourceId: raw.id || raw.sku || raw.gtin || null,
    brand: raw.brand || '',
    name: raw.name || raw.title || 'Unnamed product',
    category: raw.category || 'all',
    country: raw.country || '',
    price: Number(raw.price || 0),
    currency: raw.currency || 'USD',
    image: raw.image || '',
    rating: Number(raw.rating || 0),
    reviewCount: Number(raw.reviewCount || 0),
    url: raw.url || '',
    seller: raw.seller || source,
    updatedAt: new Date().toISOString()
  };
}

function dedupe(products) {
  const map = new Map();
  for (const product of products) {
    const key = String(product.gtin || product.sourceId || `${product.brand}|${product.name}`)
      .toLowerCase().replace(/[^a-z0-9가-힣]+/g, '');
    if (!map.has(key)) map.set(key, product);
  }
  return [...map.values()];
}

module.exports = { normalizeProduct, dedupe };
