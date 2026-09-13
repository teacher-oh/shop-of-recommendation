/* Runtime score layer: applies the agreed 0-100 Review / Price / Performance model to the live catalog.
   Missing evidence is never converted to zero. Total is the mean of available components,
   with coverage shown separately so incomplete data cannot masquerade as certainty. */
(function(){
  const PRIOR=4.6, K=100;
  const clamp=(n,a=0,b=100)=>Math.max(a,Math.min(b,n));
  const num=v=>Number.isFinite(Number(v))?Number(v):null;
  function reviewScore(p){
    const r=num(p.rating), n=num(p.reviewCount??p.reviews);
    if(r==null||r<=0)return null;
    const count=Math.max(0,n||0);
    const raw=clamp(r/5*100);
    const w=count/(count+K);
    return w*raw+(1-w)*(PRIOR/5*100);
  }
  function priceScore(p, cohort){
    const price=num(p.price);
    if(price==null||price<=0)return null;
    const prices=cohort.map(x=>num(x.price)).filter(x=>x!=null&&x>0).sort((a,b)=>a-b);
    if(prices.length<2)return 50;
    const lo=prices[0], hi=prices[prices.length-1];
    if(hi===lo)return 100;
    // Percentile-based, bounded and robust to extreme prices.
    const rank=prices.filter(x=>x<=price).length/(prices.length-1);
    return clamp(100*(1-rank));
  }
  function performanceScore(p){
    const direct=p.performanceScore ?? p.scores?.performance ?? p.performance?.score;
    const n=num(direct);
    return n==null?null:clamp(n<=5?n*20:n);
  }
  function evaluate(p, cohort){
    const review=reviewScore(p), price=priceScore(p,cohort), performance=performanceScore(p);
    const parts=[review,price,performance].filter(x=>x!=null);
    const total=parts.length?parts.reduce((a,b)=>a+b,0)/parts.length:null;
    return {review,price,performance,total,coverage:parts.length/3};
  }
  async function apply(){
    try{
      const d=await fetch('./data/products.json',{cache:'no-store'}).then(r=>r.json());
      const all=Array.isArray(d.products)?d.products:[];
      const groups=new Map();
      all.forEach(p=>{const k=String(p.categoryKey||p.categoryPath?.join('>')||p.category||'uncategorized');if(!groups.has(k))groups.set(k,[]);groups.get(k).push(p);});
      const scores=new Map();
      all.forEach(p=>scores.set(String(p.id),evaluate(p,groups.get(String(p.categoryKey||p.categoryPath?.join('>')||p.category||'uncategorized'))||[])));
      window.SOR_RUNTIME_SCORES=scores;
      document.querySelectorAll('.product').forEach(card=>{
        const title=card.querySelector('h3')?.textContent?.trim();
        const p=all.find(x=>x.name===title);
        if(!p)return;
        const s=scores.get(String(p.id));
        const pill=card.querySelector('.score-pill');
        if(pill){pill.textContent=s.total==null?'총점 —':`총점 ${s.total.toFixed(1)}`;pill.title=`리뷰 ${s.review==null?'—':s.review.toFixed(1)} · 가격 ${s.price==null?'—':s.price.toFixed(1)} · 성능 ${s.performance==null?'미측정':s.performance.toFixed(1)} · 데이터 커버리지 ${Math.round(s.coverage*100)}%`}
      });
      const count=document.getElementById('liveProductCount');
      if(count)count.title=`총 ${all.length.toLocaleString('ko-KR')}개 상품에 동일 계산틀 적용`;
    }catch(e){console.warn('[SOR] score layer failed',e)}
  }
  window.SORScoreEngine={evaluate,reviewScore,priceScore,performanceScore,apply};
  const observer=new MutationObserver(()=>{clearTimeout(window.__sorScoreTimer);window.__sorScoreTimer=setTimeout(apply,80)});
  observer.observe(document.getElementById('productGrid')||document.body,{childList:true,subtree:true});
  window.addEventListener('load',apply);
})();