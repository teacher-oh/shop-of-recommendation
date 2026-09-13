/* Production score display: calculates every loaded product after normalization and shows 0-100 total. */
(function(){
  let busy=false;
  let scheduled=false;
  let observer=null;

  function schedule(){
    if(scheduled||busy)return;
    scheduled=true;
    requestAnimationFrame(()=>{
      scheduled=false;
      calc();
    });
  }

  function calc(){
    if(busy||!window.ProductScoring||typeof products==='undefined'||!Array.isArray(products))return;
    busy=true;
    if(observer)observer.disconnect();
    try{
      const groups=new Map();
      products.forEach(p=>{
        const category=typeof compareCategory==='function'
          ?compareCategory(p)
          :(p.categoryPath?.join('>')||p.category||'');
        const key=`${category}|${p.currency||''}`;
        if(!groups.has(key))groups.set(key,[]);
        groups.get(key).push(p);
      });
      products.forEach(p=>{
        const category=typeof compareCategory==='function'
          ?compareCategory(p)
          :(p.categoryPath?.join('>')||p.category||'');
        const key=`${category}|${p.currency||''}`;
        const s=ProductScoring.scoreProduct(p,groups.get(key)||[]);
        p.totalScore=s.total;
        p.scoreParts=s;
        // Keep the original 5-point rating in p.score. Total score is separate.
      });
      paintCards();
      paintModal();
    }finally{
      busy=false;
      if(observer)observer.observe(document.body,{childList:true,subtree:true});
    }
  }

  function fmt(v){return Number.isFinite(Number(v))?Number(v).toFixed(1):'—';}

  function paintCards(){
    const cards=[...document.querySelectorAll('.product')];
    const list=typeof filtered==='function'?filtered():products;
    cards.forEach((card,i)=>{
      const p=list[i];
      if(!p||!p.scoreParts)return;
      const pill=card.querySelector('.score-pill');
      if(pill)pill.textContent=`총점 ${fmt(p.totalScore)} · 근거 ${p.scoreParts.evidenceCoverage}`;
      let x=card.querySelector('.score-breakdown');
      if(!x){
        x=document.createElement('div');
        x.className='score-breakdown';
        const reason=card.querySelector('.reason');
        if(reason)reason.before(x);
        else card.querySelector('.product-info')?.appendChild(x);
      }
      x.innerHTML=`<span>리뷰 ${fmt(p.scoreParts.review)}</span><span>가격 ${fmt(p.scoreParts.price)}</span><span>성능 ${fmt(p.scoreParts.performance)}</span>`;
    });
  }

  function paintModal(){
    const modal=document.querySelector('#modalContent');
    if(!modal||typeof products==='undefined')return;
    const title=modal.querySelector('h2');
    if(!title)return;
    const name=title.textContent.split(' · ')[0].trim();
    const p=products.find(x=>x.name===name);
    if(!p?.scoreParts)return;
    let panel=modal.querySelector('.total-score-panel');
    if(!panel){
      panel=document.createElement('div');
      panel.className='total-score-panel';
      title.after(panel);
    }
    panel.innerHTML=`<div><strong>${fmt(p.totalScore)}</strong><span> / 100 총점</span></div><small>리뷰 ${fmt(p.scoreParts.review)} · 가격 ${fmt(p.scoreParts.price)} · 성능 ${fmt(p.scoreParts.performance)} · 근거 ${p.scoreParts.evidenceCoverage}</small>`;
  }

  const style=document.createElement('style');
  style.textContent='.score-breakdown{display:flex;gap:7px;flex-wrap:wrap;margin:8px 0;font-size:11px;color:#777}.score-breakdown span{padding:3px 7px;border:1px solid rgba(128,128,128,.18);border-radius:999px}.total-score-panel{margin:14px 0;padding:14px 16px;border:1px solid rgba(128,128,128,.18);border-radius:14px}.total-score-panel strong{font-size:30px;letter-spacing:-1px}.total-score-panel span{opacity:.6}.total-score-panel small{display:block;margin-top:6px;opacity:.65}';
  document.head.appendChild(style);

  observer=new MutationObserver(schedule);
  observer.observe(document.body,{childList:true,subtree:true});
  window.addEventListener('load',schedule);
  setTimeout(schedule,300);
  setTimeout(schedule,1200);
  setTimeout(schedule,3000);
})();
