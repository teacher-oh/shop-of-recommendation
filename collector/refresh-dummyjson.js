const fs=require('fs');
const path=require('path');

async function getJson(url, options={}){
  const r=await fetch(url,options);
  if(!r.ok) throw new Error(`${url} HTTP ${r.status}`);
  return r.json();
}

function normalize(p, source, i, overrides={}){
  return {
    id:`${source}-${p.id??i}`,
    source,
    sourceId:String(p.id??i),
    brand:p.brand||overrides.brand||'상품',
    name:p.title||p.name||'상품',
    category:String(p.category||overrides.category||'').toLowerCase(),
    country:overrides.country||'GLOBAL',
    price:p.price??null,
    currency:p.currency||overrides.currency||'USD',
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

  // Free public/demo product catalogs.
  const productSources=[
    ['dummyjson','https://dummyjson.com/products?limit=0'],
    ['fakestore','https://fakestoreapi.com/products'],
    ['escuelajs','https://api.escuelajs.co/api/v1/products?offset=0&limit=200']
  ];
  for(const [id,url] of productSources){
    try{
      const d=await getJson(url);
      const rows=(Array.isArray(d)?d:(d.products||[])).map((p,i)=>normalize(p,id,i));
      all.push(...rows); sources.push({id,count:rows.length,status:'ok'});
    }catch(e){sources.push({id,count:0,status:'error',error:e.message});}
  }

  // Open Library: public book catalog, no API key.
  const subjects=['fiction','science','technology','history','business','children'];
  for(const subject of subjects){
    try{
      const d=await getJson(`https://openlibrary.org/subjects/${subject}.json?limit=100`);
      const rows=(d.works||[]).map((p,i)=>normalize({
        id:p.key,
        title:p.title,
        authors:p.authors,
        image:p.cover_id?`https://covers.openlibrary.org/b/id/${p.cover_id}-M.jpg`:null,
        url:p.key?`https://openlibrary.org${p.key}`:'#',
        description:'',
        tags:[subject]
      },'openlibrary',`${subject}-${i}`,{category:'book',country:'GLOBAL'}));
      all.push(...rows); sources.push({id:`openlibrary-${subject}`,count:rows.length,status:'ok'});
    }catch(e){sources.push({id:`openlibrary-${subject}`,count:0,status:'error',error:e.message});}
  }

  // Optional Kakao/Daum book search. Add KAKAO_REST_API_KEY in GitHub Actions Secrets to enable it.
  if(process.env.KAKAO_REST_API_KEY){
    const queries=['소설','자기계발','경제','과학','역사','컴퓨터'];
    for(const query of queries){
      try{
        const d=await getJson(`https://dapi.kakao.com/v3/search/book?query=${encodeURIComponent(query)}&size=50`,{
          headers:{Authorization:`KakaoAK ${process.env.KAKAO_REST_API_KEY}`}
        });
        const rows=(d.documents||[]).map((p,i)=>normalize({
          id:p.isbn||`${query}-${i}`,
          title:p.title,
          image:p.thumbnail,
          url:p.url,
          description:p.contents,
          tags:['book','kakao'],
          price:p.sale_price>0?p.sale_price:p.price,
          currency:'KRW'
        },'kakao',i,{brand:p.publisher||'도서',category:'book',country:'KR'}));
        all.push(...rows); sources.push({id:`kakao-${query}`,count:rows.length,status:'ok'});
      }catch(e){sources.push({id:`kakao-${query}`,count:0,status:'error',error:e.message});}
    }
  }else{
    sources.push({id:'kakao',count:0,status:'skipped',note:'Set KAKAO_REST_API_KEY to enable Daum book search'});
  }

  // Remove exact duplicates while keeping the first source record.
  const seen=new Set();
  const products=all.filter(p=>{
    const key=[p.brand,p.name].join(' ').toLowerCase().normalize('NFKC').replace(/[^a-z0-9가-힣]+/g,'');
    if(!key||seen.has(key)) return false;
    seen.add(key); return true;
  });

  const out={
    generatedAt:new Date().toISOString(),
    target:1000,
    count:products.length,
    sources,
    note:'Aggregated free public/demo catalogs plus optional Kakao Daum book search. Verify availability, price and purchase eligibility at the source.',
    products
  };
  fs.mkdirSync(path.join(process.cwd(),'data'),{recursive:true});
  fs.writeFileSync(path.join(process.cwd(),'data/products.json'),JSON.stringify(out,null,2)+'\n');
  console.log(`Merged catalogs: ${products.length} products`);
}
main().catch(err=>{console.error(err);process.exit(1)});
