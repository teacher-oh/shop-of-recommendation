// RapidAPI Real-Time Amazon Data beta collector.
// Beta goal: put a large, real Amazon dataset into the site for evaluation.
// The API key is supplied only by GitHub Actions.

const fs = require('node:fs');
const path = require('node:path');

const HOST = process.env.AMAZON_API_HOST || 'real-time-amazon-data.p.rapidapi.com';
const BASE = (process.env.AMAZON_API_BASE || `https://${HOST}`).replace(/\/$/, '');
const KEY = process.env.AMAZON_RAPIDAPI_KEY || '';
const COUNTRY = process.env.AMAZON_COUNTRY || 'US';
const QUERIES = String(process.env.AMAZON_BETA_QUERIES || process.env.AMAZON_SEARCH_QUERY || 'wireless headphones')
  .split(',').map(s => s.trim()).filter(Boolean);
const PAGES = Math.max(1, Number(process.env.AMAZON_BETA_PAGES || 2));
const MAX_PRODUCTS = Math.max(1, Number(process.env.AMAZON_BETA_MAX_PRODUCTS || 200));
const DETAIL_LIMIT = Math.max(0, Number(process.env.AMAZON_BETA_DETAILS || 60));
const REVIEW_LIMIT = Math.max(0, Number(process.env.AMAZON_BETA_REVIEWS || 20));
const REVIEW_PAGES = Math.max(1, Number(process.env.AMAZON_BETA_REVIEW_PAGES || 1));
const OFFER_LIMIT = Math.max(0, Number(process.env.AMAZON_BETA_OFFERS || 20));
const OFFER_PAGE_LIMIT = Math.max(1, Number(process.env.AMAZON_BETA_OFFER_PAGE_LIMIT || 50));
const DELAY_MS = Math.max(0, Number(process.env.AMAZON_BETA_DELAY_MS || 250));

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

if (!KEY) {
  console.log('RapidAPI key not configured; leaving existing catalog unchanged.');
  process.exit(0);
}

function first(...values) {
  return values.find(v => v !== undefined && v !== null && v !== '');
}

function number(value) {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(String(value).replace(/[^0-9.\-]/g, ''));
  return Number.isFinite(n) ? n : null;
}

function arrayFrom(json, keys = ['products', 'results', 'reviews', 'offers']) {
  const data = json?.data ?? json;
  for (const key of keys) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.[key])) return data[key];
    if (Array.isArray(json?.[key])) return json[key];
  }
  return [];
}

async function getJson(endpoint, params, attempts = 3) {
  const url = new URL(`${BASE}${endpoint}`);
  for (const [key, value] of Object.entries(params || {})) {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
  }

  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'X-RapidAPI-Key': KEY,
          'X-RapidAPI-Host': HOST
        }
      });
      const text = await response.text();
      let json = null;
      try { json = text ? JSON.parse(text) : null; } catch { json = { raw: text }; }
      if (response.ok) return json;
      const error = new Error(`RapidAPI ${response.status} ${response.statusText}`);
      error.status = response.status;
      error.body = json;
      throw error;
    } catch (error) {
      lastError = error;
      if (attempt < attempts && [429, 500, 502, 503, 504].includes(error.status)) {
        await sleep(1000 * attempt);
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

function normalizeSearch(item) {
  const asin = first(item.asin, item.ASIN, item.product_asin, item.id);
  const name = first(item.product_title, item.title, item.name, item.productTitle);
  if (!asin && !name) return null;
  const rating = number(first(item.product_star_rating, item.rating, item.stars, item.product_rating));
  const reviewCount = number(first(item.product_num_ratings, item.reviews_count, item.rating_count, item.review_count)) || 0;
  const price = number(first(item.product_price, item.price, item.current_price, item.buybox_price));
  const image = first(item.product_photo, item.product_photo_url, item.image, item.image_url, item.thumbnail) || '';
  const url = first(item.product_url, item.url, item.link) || (asin ? `https://www.amazon.com/dp/${asin}` : '');
  const offerCount = number(first(item.product_num_offers, item.offer_count, item.offers_count));
  const minOfferPrice = first(item.product_minimum_offer_price, item.minimum_offer_price, item.min_offer_price) || null;

  return {
    id: `amazon:${asin || name}`,
    source: 'amazon-rapidapi',
    sourceId: asin || null,
    asin: asin || null,
    brand: first(item.product_brand, item.brand, item.manufacturer, '') || '',
    name: name || 'Amazon product',
    image,
    price,
    currency: first(item.currency, 'USD'),
    rating,
    ratingCount: reviewCount,
    reviewCount,
    reviews: reviewCount,
    offerCount,
    minOfferPrice,
    url,
    description: first(item.product_description, item.description, item.about_product?.join?.(' '), '') || '',
    category: first(item.category, item.category_name, 'etc') || 'etc',
    country: COUNTRY,
    isPrime: Boolean(item.is_prime),
    isBestSeller: Boolean(item.is_best_seller),
    isAmazonChoice: Boolean(item.is_amazon_choice),
    salesVolume: first(item.sales_volume, '') || '',
    delivery: first(item.delivery, '') || '',
    evidence: {
      source: 'RapidAPI / Real-Time Amazon Data',
      retrievedAt: new Date().toISOString(),
      marketplace: COUNTRY,
      queries: QUERIES,
      asin
    }
  };
}

function extractDetails(json) {
  const data = json?.data ?? json;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.products)) return data.products;
  if (data && (data.asin || data.product_title)) return [data];
  return [];
}

function extractReviews(json) {
  return arrayFrom(json, ['reviews']).map(review => ({
    id: first(review.review_id, review.id),
    asin: first(review.reviewed_product_asin, review.asin),
    title: first(review.review_title, review.title, ''),
    text: first(review.review_comment, review.comment, review.text, ''),
    rating: number(first(review.review_star_rating, review.rating)),
    author: first(review.review_author, review.author, ''),
    date: first(review.review_date, review.date, ''),
    verified: Boolean(first(review.is_verified_purchase, review.is_verified, false)),
    helpful: first(review.helpful_vote_statement, review.helpful_votes, ''),
    url: first(review.review_link, review.url, '')
  })).filter(r => r.text || r.title || r.id);
}

function extractOffers(json) {
  const data = json?.data ?? json;
  const offers = Array.isArray(data?.offers) ? data.offers : arrayFrom(json, ['offers']);
  return offers.map(offer => ({
    price: number(first(offer.product_price, offer.price, offer.current_price)),
    priceRaw: first(offer.product_price, offer.price, ''),
    currency: first(offer.currency, 'USD'),
    condition: first(offer.product_condition, offer.condition, ''),
    seller: first(offer.seller, offer.sold_by, ''),
    sellerId: first(offer.seller_id, ''),
    sellerUrl: first(offer.seller_link, offer.seller_url, ''),
    sellerRating: number(first(offer.seller_star_rating, offer.seller_rating)),
    sellerRatingInfo: first(offer.seller_star_rating_info, ''),
    shipsFrom: first(offer.ships_from, ''),
    deliveryPrice: first(offer.delivery_price, ''),
    deliveryTime: first(offer.delivery_time, '')
  }));
}

async function main() {
  const startedAt = new Date().toISOString();
  const stats = { searchCalls: 0, productsFound: 0, detailsCalls: 0, reviewCalls: 0, offerCalls: 0, errors: [] };
  const productMap = new Map();

  // 1) Product Search: many real products, multiple queries and pages.
  for (const query of QUERIES) {
    for (let page = 1; page <= PAGES && productMap.size < MAX_PRODUCTS; page += 1) {
      try {
        const json = await getJson('/search', {
          query, page, country: COUNTRY,
          sort_by: 'RELEVANCE', product_condition: 'ALL',
          deals_and_discounts: 'NONE'
        });
        stats.searchCalls += 1;
        for (const item of arrayFrom(json)) {
          const product = normalizeSearch(item);
          if (product?.asin) productMap.set(product.asin, product);
          if (productMap.size >= MAX_PRODUCTS) break;
        }
        if (!arrayFrom(json).length) break;
      } catch (error) {
        stats.errors.push({ endpoint: 'search', query, page, message: error.message });
      }
      await sleep(DELAY_MS);
    }
  }

  const products = [...productMap.values()].slice(0, MAX_PRODUCTS);
  stats.productsFound = products.length;
  console.log(`Amazon beta search: ${products.length} unique products from ${stats.searchCalls} calls.`);

  // 2) Product Details: batch up to 10 ASINs per request.
  for (let i = 0; i < Math.min(DETAIL_LIMIT, products.length); i += 10) {
    const batch = products.slice(i, i + 10);
    try {
      const json = await getJson('/product-details', { asin: batch.map(p => p.asin).join(','), country: COUNTRY });
      stats.detailsCalls += 1;
      for (const detail of extractDetails(json)) {
        const asin = first(detail.asin, detail.ASIN);
        const product = products.find(p => p.asin === asin);
        if (!product) continue;
        product.amazonDetails = {
          highlights: detail.about_product || [],
          information: detail.product_information || {},
          details: detail.product_details || {},
          photos: detail.product_photos || [],
          availability: detail.product_availability || null,
          bsr: detail.product_information?.['Best Sellers Rank'] || null,
          variations: detail.product_variations || {},
          rawDescription: detail.product_description || ''
        };
        if (detail.product_num_offers != null) product.offerCount = number(detail.product_num_offers);
        if (detail.product_price != null) product.price = number(detail.product_price);
        if (detail.product_star_rating != null) product.rating = number(detail.product_star_rating);
        if (detail.product_num_ratings != null) {
          product.ratingCount = number(detail.product_num_ratings) || 0;
          product.reviewCount = product.ratingCount;
          product.reviews = product.ratingCount;
        }
      }
    } catch (error) {
      stats.errors.push({ endpoint: 'product-details', batch: batch.map(p => p.asin), message: error.message });
    }
    await sleep(DELAY_MS);
  }

  // 3) Reviews: collect a real sample for a smaller set so the beta remains affordable.
  for (const product of products.slice(0, REVIEW_LIMIT)) {
    const samples = [];
    for (let page = 1; page <= REVIEW_PAGES; page += 1) {
      try {
        const json = await getJson('/product-reviews', {
          asin: product.asin,
          country: COUNTRY,
          page,
          sort_by: page === 1 ? 'TOP_REVIEWS' : 'MOST_RECENT',
          star_rating: 'ALL',
          verified_purchases_only: false,
          images_or_videos_only: false,
          current_format_only: false
        });
        stats.reviewCalls += 1;
        samples.push(...extractReviews(json));
      } catch (error) {
        stats.errors.push({ endpoint: 'product-reviews', asin: product.asin, page, message: error.message });
      }
      await sleep(DELAY_MS);
    }
    product.amazonReviews = samples.slice(0, REVIEW_PAGES * 10);
  }

  // 4) Offers: batch up to 10 ASINs per request. This endpoint returns seller/price/delivery data.
  for (let i = 0; i < Math.min(OFFER_LIMIT, products.length); i += 10) {
    const batch = products.slice(i, i + 10);
    try {
      const json = await getJson('/product-offers', {
        asin: batch.map(p => p.asin).join(','),
        country: COUNTRY,
        page: 1,
        limit: OFFER_PAGE_LIMIT
      });
      stats.offerCalls += 1;
      const data = json?.data ?? json;
      const entries = Array.isArray(data) ? data : [data];
      for (const entry of entries) {
        if (!entry) continue;
        const asin = first(entry.asin, entry.requested_asin);
        const product = products.find(p => p.asin === asin);
        if (!product) continue;
        product.amazonOffers = extractOffers({ data: entry });
        product.offerCount = product.amazonOffers.length || product.offerCount || 0;
        const numericPrices = product.amazonOffers.map(o => o.price).filter(Number.isFinite);
        if (numericPrices.length) product.minOfferPrice = Math.min(...numericPrices);
      }
    } catch (error) {
      // Keep beta collection alive if this plan/provider version does not expose offers.
      stats.errors.push({ endpoint: 'product-offers', batch: batch.map(p => p.asin), message: error.message });
    }
    await sleep(DELAY_MS);
  }

  const retrievedAt = new Date().toISOString();
  for (const product of products) {
    product.amazonBeta = {
      retrievedAt,
      marketplace: COUNTRY,
      hasDetails: Boolean(product.amazonDetails),
      reviewSampleCount: Array.isArray(product.amazonReviews) ? product.amazonReviews.length : 0,
      offerSampleCount: Array.isArray(product.amazonOffers) ? product.amazonOffers.length : 0
    };
  }

  const file = path.join(process.cwd(), 'data', 'products.json');
  const existing = JSON.parse(fs.readFileSync(file, 'utf8'));
  const list = Array.isArray(existing) ? existing : (Array.isArray(existing.products) ? existing.products : []);
  const map = new Map(list.map(p => [p.id, p]));
  for (const product of products) map.set(product.id, product);

  const output = Array.isArray(existing)
    ? [...map.values()]
    : {
        ...existing,
        generatedAt: retrievedAt,
        updatedAt: retrievedAt,
        count: map.size,
        products: [...map.values()]
      };
  fs.writeFileSync(file, JSON.stringify(output, null, 2) + '\n');

  const betaFile = path.join(process.cwd(), 'data', 'amazon-beta.json');
  fs.writeFileSync(betaFile, JSON.stringify({
    generatedAt: retrievedAt,
    startedAt,
    marketplace: COUNTRY,
    queries: QUERIES,
    config: { pages: PAGES, maxProducts: MAX_PRODUCTS, details: DETAIL_LIMIT, reviews: REVIEW_LIMIT, reviewPages: REVIEW_PAGES, offers: OFFER_LIMIT, offerPageLimit: OFFER_PAGE_LIMIT },
    stats,
    products
  }, null, 2) + '\n');

  console.log(JSON.stringify({
    ok: true,
    mode: 'beta',
    productsImported: products.length,
    totalCatalog: map.size,
    searchCalls: stats.searchCalls,
    detailsCalls: stats.detailsCalls,
    reviewCalls: stats.reviewCalls,
    offerCalls: stats.offerCalls,
    errors: stats.errors.length
  }, null, 2));
}

main().catch(error => {
  console.error(error.stack || error.message || error);
  process.exit(1);
});
