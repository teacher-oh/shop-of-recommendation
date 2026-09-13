const fs=require('fs');
const path=require('path');

async function main(){
  const r=await fetch('https://dummyjson.com/products?limit=0');
  if(!r.ok) throw new Error(`DummyJSON HTTP ${r.status}`);
  const d=await r.json();
  const products=(d.products||[]).map(p=>({
    id:`dummyjson-${p.id}`,
    source:'dummyjson',
    sourceId:String(p.id),
    brand:p.brand||'상품',
    name:p.title,
    category:p.category||'',
    country:'GLOBAL',
    price:p.price,
    currency:'USD',
    image:p.thumbnail||p.images?.[0]||null,
    rating:p.rating??null,
    reviewCount:Array.isArray(p.reviews)?p.reviews.length:0,
    url:`https://dummyjson.com/products/${p.id}`,
    seller:'DummyJSON demo catalog',
    description:p.description||'',
    tags:p.tags||[],
    stock:p.stock??null,
    updatedAt:p.meta?.updatedAt||new Date().toISOString()
  }));
  const out={generatedAt:new Date().toISOString(),source:'DummyJSON',count:products.length,products};
  fs.mkdirSync(path.join(process.cwd(),'data'),{recursive:true});
  fs.writeFileSync(path.join(process.cwd(),'data/products.json'),JSON.stringify(out,null,2)+'\n');
  console.log(`DummyJSON catalog refreshed: ${products.length} products`);
}
main().catch(err=>{console.error(err);process.exit(1)});
