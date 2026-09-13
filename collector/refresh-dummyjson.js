const fs=require('fs');
const path=require('path');

async function getJson(url, options={}){
  const r=await fetch(url,options);
  if(!r.ok) throw new Error(`${url} HTTP ${r.status}`);
  return r.json();
}

function normalize(p, source, i){
  return {
    id:`${source}-${p.id??i}`,
    source,
    sourceId:String(p.id??i),
    brand:p.brand||'상품',
    name:p.title||p.name||'상품',
    category:String(p.category||'').toLowerCase(),
    country:'GLOBAL',
    price:p.price??null,
    currency:p.currency||'USD',
    image:p.thumbnail||p.image||p.images?.[0]||null,
    rating:p.rating??p.rate??null,
    reviewCount:Array.isArray(p.reviews)?p.reviews.length:(p.rating?.count||p.rating_count||0),
    url:p.url||p.link||'#',
    seller:p.seller||source,
    description:p.description||'',
    tags:p.tags||[],
    stock:p.stock??null,
    updatedAt:p.meta?.updatedAt||new Date().toISOString()
  };
}

async function main(){
  const all=[];
  const sources=[];

  // DummyJSON: broad demo catalog, no API key.
  try{
    const d=await getJson('https://dummyjson.com/products?limit=0');
    const rows=(d.products||[]).map((p,i)=>normalize(p,'dummyjson',i));
    all.push(...rows); sources.push({id:'dummyjson',count:rows.length,status:'ok'});
  }catch(e){sources.push({id:'dummyjson',count:0,status:'error',error:e.message});}

  // Fake Store API: free public demo catalog, no API key.
  try{
    const d=await getJson('https://fakestoreapi.com/products');
    const rows=(Array.isArray(d)?d:[]).map((p,i)=>normalize(p,'fakestore',i));
    all.push(...rows); sources.push({id:'fakestore',count:rows.length,status:'ok'});
  }catch(e){sources.push({id:'fakestore',count:0,status:'error',error:e.message});}

  // Remove exact/near duplicate demo records by normalized name + brand.
  const seen=new Set();
  const products=all.filter(p=>{
    const key=[p.brand,p.name].join(' ').toLowerCase().normalize('NFKC').replace(/[^a-z0-9가-힣]+/g,'');
    if(seen.has(key)) return false;
    seen.add(key); return true;
  });

  const out={
    generatedAt:new Date().toISOString(),
    target:1000,
    count:products.length,
    sources,
    note:'Free public/demo catalogs. Availability, price and purchase eligibility must be verified at the source.',
    products
  };
  fs.mkdirSync(path.join(process.cwd(),'data'),{recursive:true});
  fs.writeFileSync(path.join(process.cwd(),'data/products.json'),JSON.stringify(out,null,2)+'\n');
  console.log(`Merged free catalogs: ${products.length} products`);
}
main().catch(err=>{console.error(err);process.exit(1)});
