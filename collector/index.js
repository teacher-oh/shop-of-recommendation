const fs=require('fs');
const path=require('path');
const {sources}=require('./sources');
const {normalizeProduct,dedupe}=require('./normalize');
const config=require('./config');

async function safeFetch(url,options={}){
  const r=await fetch(url,{...options,headers:{'User-Agent':'Shop-of-Recommendation/1.0',...(options.headers||{})}});
  if(!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
}

async function collectEbay(keyword){
  const id=process.env.EBAY_CLIENT_ID, secret=process.env.EBAY_CLIENT_SECRET;
  if(!id||!secret)return [];
  const basic=Buffer.from(`${id}:${secret}`).toString('base64');
  const token=await fetch('https://api.ebay.com/identity/v1/oauth2/token',{method:'POST',headers:{Authorization:`Basic ${basic}`,'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope'});
  if(!token.ok)throw new Error(`eBay token ${token.status}`);
  const auth=await token.json();
  const data=await safeFetch(`https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(keyword)}&limit=${config.limits.perKeyword}&filter=buyingOptions:{FIXED_PRICE}`,{headers:{Authorization:`Bearer ${auth.access_token}`,'X-EBAY-C-MARKETPLACE-ID':'EBAY_US'}});
  return (data.itemSummaries||[]).map(x=>normalizeProduct({id:x.itemId,title:x.title,price:x.price?.value,currency:x.price?.currency,image:x.image?.imageUrl,url:x.itemWebUrl,seller:x.seller?.username,category:x.categories?.[0]?.categoryName,rating:x.reviews?.averageRating,reviewCount:x.reviews?.reviewCount,brand:x.brand},'ebay'));
}

async function collectBestBuy(keyword){
  const key=process.env.BESTBUY_API_KEY;if(!key)return [];
  const url=`https://api.bestbuy.com/v1/products(search=${encodeURIComponent(keyword)})?apiKey=${encodeURIComponent(key)}&format=json&pageSize=${config.limits.perKeyword}&show=sku,name,brand,salePrice,regularPrice,image,thumbnailImage,productUrl,customerReviewAverage,customerReviewCount,categoryPath.name,modelNumber,upc`;
  const data=await safeFetch(url);
  return (data.products||[]).map(x=>normalizeProduct({id:x.sku,title:x.name,brand:x.brand,price:x.salePrice??x.regularPrice,currency:'USD',image:x.image||x.thumbnailImage,url:x.productUrl,rating:x.customerReviewAverage,reviewCount:x.customerReviewCount,category:x.categoryPath?.at(-1)?.name,model:x.modelNumber,gtin:x.upc},'bestbuy'));
}

async function collectAmazon(keyword){
  const access=process.env.AMAZON_ACCESS_KEY,secret=process.env.AMAZON_SECRET_KEY;
  if(!access||!secret)return [];
  console.warn('[amazon] credentials detected; current Creators API account setup is required before collection is enabled.');
  return [];
}

async function collectEtsy(keyword){
  const key=process.env.ETSY_API_KEY,token=process.env.ETSY_ACCESS_TOKEN;
  if(!key||!token)return [];
  const data=await safeFetch(`https://api.etsy.com/v3/application/listings/active?limit=${config.limits.perKeyword}&keywords=${encodeURIComponent(keyword)}`,{headers:{'x-api-key':key,Authorization:`Bearer ${token}`}});
  return (data.results||[]).map(x=>normalizeProduct({id:x.listing_id,title:x.title,price:x.price?.amount&&x.price?.divisor?x.price.amount/x.price.divisor:x.price?.amount,currency:x.price?.currency_code,image:x.images?.[0]?.url_570xN,url:x.url,seller:x.shop_section_id,category:x.taxonomy_id,description:x.description},'etsy'));
}

async function collectKeyword(keyword){
  const out=[];
  for(const [name,fn] of [['ebay',collectEbay],['bestbuy',collectBestBuy],['amazon',collectAmazon],['etsy',collectEtsy]]){
    try{out.push(...await fn(keyword));}catch(e){console.warn(`[${name}] ${keyword}: ${e.message}`);}
  }
  return out;
}

function writeDatabase(products,run){
  const dbPath=path.join(__dirname,'..','data','catalog.db.json');
  const previous=fs.existsSync(dbPath)?JSON.parse(fs.readFileSync(dbPath,'utf8')):null;
  const oldMap=new Map((previous?.tables?.products||[]).map(p=>[p.id,p]));
  const priceHistory=[...(previous?.tables?.price_history||[])];
  for(const p of products){const old=oldMap.get(p.id);if(old&&old.price!==p.price)priceHistory.push({productId:p.id,source:p.source,price:old.price,at:old.updatedAt});}
  const db={schemaVersion:1,updatedAt:new Date().toISOString(),tables:{products,price_history:priceHistory.slice(-20000),sources,collection_runs:[...(previous?.tables?.collection_runs||[]),run].slice(-200)}};
  fs.writeFileSync(dbPath,JSON.stringify(db,null,2));
}

const keywordGroups={
  electronics:['laptop','desktop computer','monitor','tablet','smartphone','smartwatch','headphones','earbuds','bluetooth speaker','camera','mirrorless camera','drone','gaming console','gaming headset','television','projector'],
  home:['robot vacuum','vacuum cleaner','air purifier','air fryer','coffee maker','espresso machine','blender','microwave','rice cooker','desk','office chair','bookshelf','sofa','bedding','lamp','led light'],
  lifestyle:['backpack','travel luggage','running shoes','sports equipment','camping gear','yoga mat','water bottle','stationery','mechanical pencil','art supplies','board game','collectibles','pet supplies','car accessories','tools','home improvement'],
  fashion:['t shirt','hoodie','jacket','jeans','sneakers','dress','handbag','wallet','watch','sunglasses'],
  beauty:['skincare','facial cleanser','moisturizer','shampoo','hair dryer','makeup brush']
};
const keywords=[...new Set(Object.values(keywordGroups).flat())];

async function main(){
  const started=Date.now();let products=[];
  for(const keyword of keywords){
    console.log(`Collecting: ${keyword}`);
    products.push(...await collectKeyword(keyword));
  }
  products=dedupe(products).filter(p=>p.name&&p.price!==null&&p.price!==undefined);
  const run={id:`run-${Date.now()}`,startedAt:new Date(started).toISOString(),finishedAt:new Date().toISOString(),count:products.length,keywords:keywords.length};
  const output={generatedAt:run.finishedAt,sources,count:products.length,products};
  const dir=path.join(__dirname,'..','data');fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,'products.json'),JSON.stringify(output,null,2));
  writeDatabase(products,run);
  console.log(`Collected ${products.length} products from ${keywords.length} keywords in ${Date.now()-started}ms`);
}
main().catch(e=>{console.error(e);process.exit(1)});
