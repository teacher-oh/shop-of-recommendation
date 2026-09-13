const fs = require('fs');
const path = require('path');
const { sources } = require('./sources');
const { normalizeProduct, dedupe } = require('./normalize');

async function safeFetch(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

async function collectEbay(keyword) {
  const clientId = process.env.EBAY_CLIENT_ID;
  const clientSecret = process.env.EBAY_CLIENT_SECRET;
  if (!clientId || !clientSecret) return [];
  const token = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const tokenResponse = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope'
  });
  if (!tokenResponse.ok) throw new Error(`eBay token ${tokenResponse.status}`);
  const auth = await tokenResponse.json();
  const data = await safeFetch(`https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(keyword)}&limit=50`, {
    headers: { Authorization: `Bearer ${auth.access_token}` }
  });
  return (data.itemSummaries || []).map(item => normalizeProduct({
    id: item.itemId,
    title: item.title,
    price: item.price?.value,
    currency: item.price?.currency,
    image: item.image?.imageUrl,
    url: item.itemWebUrl,
    seller: item.seller?.username,
    category: item.categories?.[0]?.categoryName
  }, 'ebay'));
}

async function collectBestBuy(keyword) {
  const key = process.env.BESTBUY_API_KEY;
  if (!key) return [];
  const url = `https://api.bestbuy.com/v1/products(search=${encodeURIComponent(keyword)})?apiKey=${encodeURIComponent(key)}&format=json&pageSize=50&show=sku,name,brand,salePrice,regularPrice,image,productUrl,customerReviewAverage,customerReviewCount,categoryPath.name`;
  const data = await safeFetch(url);
  return (data.products || []).map(item => normalizeProduct({
    id: item.sku,
    title: item.name,
    brand: item.brand,
    price: item.salePrice ?? item.regularPrice,
    currency: 'USD',
    image: item.image,
    url: item.productUrl,
    rating: item.customerReviewAverage,
    reviewCount: item.customerReviewCount,
    category: item.categoryPath?.at(-1)?.name
  }, 'bestbuy'));
}

async function collectKeyword(keyword) {
  const results = [];
  for (const [name, fn] of [['ebay', collectEbay], ['bestbuy', collectBestBuy]]) {
    try { results.push(...await fn(keyword)); }
    catch (error) { console.warn(`[${name}] ${error.message}`); }
  }
  return results;
}

async function main() {
  const keywords = [
    'laptop', 'smartphone', 'headphones', 'camera', 'gaming console',
    'television', 'smart home', 'kitchen appliance', 'coffee', 'furniture',
    'beauty', 'fashion', 'shoes', 'backpack', 'travel', 'sports',
    'outdoor', 'stationery', 'hobby', 'pet supplies', 'car accessories',
    'home improvement', 'lighting'
  ];
  let products = [];
  for (const keyword of keywords) products.push(...await collectKeyword(keyword));
  products = dedupe(products);
  const output = { generatedAt: new Date().toISOString(), sources, count: products.length, products };
  const outputPath = path.join(__dirname, '..', 'data', 'products.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`Collected ${products.length} products`);
}

main().catch(error => { console.error(error); process.exit(1); });
