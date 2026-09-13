/* Stable score display layer. The scoring engine remains evaluation/score.js. */
(function(){
  let scheduled=false;
  let running=false;
  let observer=null;
  let lastProductSignature='';

  function schedule(){
    if(scheduled||running)return;
    scheduled=true;
    requestAnimationFrame(()=>{
      scheduled=false;
      calc();
    });
  }

  function signature(list){
    return list.map(p=>`${p.id||''}:${p.price||''}:${p.rating||p.score||''}:${p.reviews||p.reviewCount||''}`).join('|');
  }

  function calc(){
    if(running||!window.ProductScoring||typeof products==='undefined'||!Array.isArray(products)||!products.length)return;
    const sig=signature(products);
    if(sig===lastProductSignature){paintCards();paintModal();return;}
    running=true;
    try{
      const groups=new Map();
      for(const p of products){
        const category=typeof compareCategory==='function'?compareCategory(p):(p.categoryPath?.join('>')||p.category||'');
        const key=`${category}|${p.currency||''}`;
        let group=groups.get(key);
        if(!group){group=[];groups.set(key,group);}
        group.push(p);
      }
      for(const p of products){
        const category=typeof compareCategory==='function'?compareCategory(p):(p.categoryPath?.join('>')||p.category||'');
        const key=`${category}|${p.currency||''}`;
        const s=ProductScoring.scoreProduct(p,groups.get(key)||[]);
        p.totalScore=s.total;
        p.scoreParts=s;
      }
      lastProductSignature=sig;
      paintCards();
      paintModal();
    }finally{
      running=false;
    }
  }

  function fmt(v){return Number.isFinite(Number(v))?Number(v).toFixed(1):'—';}

  function paintCards(){
    const cards=document.querySelectorAll('.product');
    if(!cards.length)return;
    const list=typeof filtered==='function'?filtered():products;
    cards.forEach((card,i)=>{
      const p=list[i];
      if(!p?.scoreParts)return;
      const pill=card.querySelector('.score-pill');
      if(pill){
        const text=`총점 ${fmt(p.totalScore)} · 근거 ${p.scoreParts.evidenceCoverage}`;
        if(pill.textContent!==text)pill.textContent=text;
      }
      let x=card.querySelector('.score-breakdown');
      if(!x){
        x=document.createElement('div');
        x.className='score-breakdown';
        const reason=card.querySelector('.reason');
        if(reason)reason.before(x);else card.querySelector('.product-info')?.appendChild(x);
      }
      const html=`<span>리뷰 ${fmt(p.scoreParts.review)}</span><span>가격 ${fmt(p.scoreParts.price)}</span><span>성능 ${fmt(p.scoreParts.performance)}</span>`;
      if(x.innerHTML!==html)x.innerHTML=html;
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
    if(!panel){panel=document.createElement('div');panel.className='total-score-panel';title.after(panel);}
    const html=`<div><strong>${fmt(p.totalScore)}</strong><span> / 100 총점</span></div><small>리뷰 ${fmt(p.scoreParts.review)} · 가격 ${fmt(p.scoreParts.price)} · 성능 ${fmt(p.scoreParts.performance)} · 근거 ${p.scoreParts.evidenceCoverage}</small>`;
    if(panel.innerHTML!==html)panel.innerHTML=html;
  }

  const style=document.createElement('style');
  style.textContent='.score-breakdown{display:flex;gap:7px;flex-wrap:wrap;margin:8px 0;font-size:11px;color:#777}.score-breakdown span{padding:3px 7px;border:1px solid rgba(128,128,128,.18);border-radius:999px}.total-score-panel{margin:14px 0;padding:14px 16px;border:1px solid rgba(128,128,128,.18);border-radius:14px}.total-score-panel strong{font-size:30px;letter-spacing:-1px}.total-score-panel span{opacity:.6}.total-score-panel small{display:block;margin-top:6px;opacity:.65}';
  document.head.appendChild(style);

  // Do not observe the entire document. Rendering 804 cards creates many DOM mutations;
  // a body-wide observer can repeatedly wake the score layer and freeze the browser.
  window.addEventListener('load',schedule,{once:true});
  setTimeout(schedule,500);
  setTimeout(schedule,1500);
  window.__sorRefreshScores=schedule;
})();
