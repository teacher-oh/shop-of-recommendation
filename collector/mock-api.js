const fs = require('fs');
const path = require('path');

// Training-only mock supplier. Every product/review here is synthetic and must stay
// visibly labeled as MOCK in the UI. This lets us practice the same catalog pipeline
// we will later use with real providers.

const catalog = [
  ['food.ramen', 'Mock Kitchen', ['Spicy Ramen 5-Pack', 'Garlic Ramen 5-Pack', 'Mild Curry Ramen 5-Pack', 'Seaweed Ramen 5-Pack']],
  ['food.snack', 'Mock Snack Lab', ['Crispy Potato Chips', 'Honey Corn Snack', 'Chocolate Cookie Box', 'Cheese Crackers']],
  ['food.coffee', 'Mock Coffee Works', ['House Blend Beans 500g', 'Dark Roast Beans 500g', 'Decaf Beans 500g', 'Cold Brew Concentrate']],
  ['household.cleaning', 'Mock Home', ['Multi-Surface Cleaner', 'Laundry Detergent 2L', 'Dish Soap 750ml', 'Microfiber Cleaning Set']],
  ['household.kitchen', 'Mock Kitchenware', ['Glass Storage Set', 'Nonstick Pan 24cm', 'Stainless Water Bottle', 'Silicone Spatula Set']],
  ['electronics.audio', 'Mock Audio', ['Everyday Wireless Headphones', 'Compact Bluetooth Speaker', 'USB-C Earphones', 'Desk Soundbar']],
  ['electronics.computing', 'Mock Tech', ['Slim Wireless Keyboard', 'Silent Wireless Mouse', 'USB-C Hub 6-in-1', '1080p Webcam']],
  ['electronics.home', 'Mock Home Tech', ['Mini Air Purifier', 'Desk Fan', 'Smart Plug 2-Pack', 'LED Desk Lamp']],
  ['lifestyle.bag', 'Mock Carry', ['Daily Backpack', 'Compact Crossbody Bag', 'Laptop Sleeve 15-inch', 'Travel Organizer']],
  ['lifestyle.stationery', 'Mock Stationery', ['Gel Pen Set', 'Grid Notebook 3-Pack', 'Desk Planner', 'Mechanical Pencil Set']]
];

const brands = [
  { id: 'mock-kitchen', name: 'Mock Kitchen', country: 'KR' },
  { id: 'mock-snack-lab', name: 'Mock Snack Lab', country: 'KR' },
  { id: 'mock-coffee-works', name: 'Mock Coffee Works', country: 'KR' },
  { id: 'mock-home', name: 'Mock Home', country: 'KR' },
  { id: 'mock-kitchenware', name: 'Mock Kitchenware', country: 'KR' },
  { id: 'mock-audio', name: 'Mock Audio', country: 'GLOBAL' },
  { id: 'mock-tech', name: 'Mock Tech', country: 'GLOBAL' },
  { id: 'mock-home-tech', name: 'Mock Home Tech', country: 'GLOBAL' },
  { id: 'mock-carry', name: 'Mock Carry', country: 'KR' },
  { id: 'mock-stationery', name: 'Mock Stationery', country: 'KR' }
];

const categoryNames = {
  food: '식품',
  'food.ramen': '식품 > 라면',
  'food.snack': '식품 > 과자',
  'food.coffee': '식품 > 커피',
  household: '생활용품',
  'household.cleaning': '생활용품 > 청소/세탁',
  'household.kitchen': '생활용품 > 주방',
  electronics: '가전/전자',
  'electronics.audio': '가전/전자 > 음향',
  'electronics.computing': '가전/전자 > 컴퓨터 주변기기',
  'electronics.home': '가전/전자 > 생활가전',
  lifestyle: '생활/문구',
  'lifestyle.bag': '생활/문구 > 가방',
  'lifestyle.stationery': '생활/문구 > 문구'
};

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9가-힣]+/g, '-').replace(/^-|-$/g, '');
}

function seeded(seed) {
  let x = seed >>> 0;
  return () => {
    x = (x * 1664525 + 1013904223) >>> 0;
    return x / 4294967296;
  };
}

function makeProducts() {
  const products = [];
  let id = 1;
  for (const [category, brand, names] of catalog) {
    for (const name of names) {
      const r = seeded(id * 97);
      products.push({
        id: `mock-${String(id).padStart(4, '0')}`,
        source: 'mock-supplier',
        sourceType: 'mock',
        brand,
        brandId: slug(brand),
        name,
        category,
        categoryPath: categoryNames[category],
        price: Math.round((5000 + r() * 95000) / 100) * 100,
        currency: 'KRW',
        rating: Math.round((3.2 + r() * 1.7) * 10) / 10,
        reviewCount: 0,
        image: null,
        url: '#mock',
        stock: Math.floor(10 + r() * 190),
        mock: true,
        updatedAt: new Date().toISOString()
      });
      id += 1;
    }
  }
  return products;
}

function makeReviews(products) {
  const templates = [
    ['배송이 빨라서 편했습니다.', 5],
    ['가격과 품질이 무난해서 만족합니다.', 4],
    ['사용하기 편하고 설명과 비슷합니다.', 4],
    ['기대보다는 평범했습니다.', 3],
    ['다음에는 다른 제품도 비교해 보려고 합니다.', 3]
  ];
  const reviews = [];
  let id = 1;
  for (const product of products) {
    const r = seeded(id * 131);
    const count = 5;
    for (let i = 0; i < count; i++) {
      const [text, baseRating] = templates[Math.floor(r() * templates.length)];
      const rating = Math.max(1, Math.min(5, baseRating + (r() > 0.82 ? 1 : 0) - (r() < 0.12 ? 1 : 0)));
      reviews.push({
        id: `mock-review-${String(id).padStart(5, '0')}`,
        productId: product.id,
        source: 'mock-supplier',
        sourceType: 'mock',
        rating,
        title: `가상 리뷰 ${i + 1}`,
        text,
        author: `mock-user-${String(i + 1).padStart(2, '0')}`,
        verifiedPurchase: false,
        mock: true,
        createdAt: `2026-${String((i % 9) + 1).padStart(2, '0')}-${String((i % 20) + 1).padStart(2, '0')}`
      });
      id += 1;
    }
  }
  return reviews;
}

function writeJson(file, value) {
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
}

function main() {
  const root = path.join(process.cwd(), 'data', 'mock-api');
  fs.mkdirSync(root, { recursive: true });

  const products = makeProducts();
  const reviews = makeReviews(products);
  products.forEach(p => {
    const rows = reviews.filter(r => r.productId === p.id);
    p.reviewCount = rows.length;
    p.rating = Math.round((rows.reduce((sum, r) => sum + r.rating, 0) / rows.length) * 10) / 10;
  });

  const categoryIndex = Object.entries(categoryNames)
    .filter(([id]) => id.includes('.'))
    .map(([id, name]) => ({
      id,
      name,
      productCount: products.filter(p => p.category === id).length
    }));

  const brandIndex = brands.map(brand => ({
    ...brand,
    productCount: products.filter(p => p.brandId === brand.id).length
  }));

  writeJson(path.join(root, 'products.json'), {
    apiVersion: 'mock-v1',
    source: 'mock-supplier',
    mock: true,
    count: products.length,
    products
  });

  writeJson(path.join(root, 'reviews.json'), {
    apiVersion: 'mock-v1',
    source: 'mock-supplier',
    mock: true,
    count: reviews.length,
    reviews
  });

  writeJson(path.join(root, 'categories.json'), {
    apiVersion: 'mock-v1',
    mock: true,
    categories: categoryIndex
  });

  writeJson(path.join(root, 'brands.json'), {
    apiVersion: 'mock-v1',
    mock: true,
    brands: brandIndex
  });

  writeJson(path.join(root, 'index.json'), {
    apiVersion: 'mock-v1',
    mock: true,
    generatedAt: new Date().toISOString(),
    endpoints: {
      products: './products.json',
      reviews: './reviews.json',
      categories: './categories.json',
      brands: './brands.json',
      productByCategory: './products.json?category=<categoryId>',
      productByBrand: './products.json?brand=<brandId>',
      reviewsByProduct: './reviews.json?productId=<productId>'
    },
    counts: {
      products: products.length,
      reviews: reviews.length,
      categories: categoryIndex.length,
      brands: brandIndex.length
    }
  });

  console.log(`Mock supplier generated: ${products.length} products, ${reviews.length} reviews`);
}

main();
