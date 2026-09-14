/* Stable score display + inspectable evidence panel. */
(function(){
  let scheduled=false,running=false,lastProductSignature='';
  function schedule(){if(scheduled||running)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;calc();});}
  function signature(list){return list.map(p=>`${p.id||''}:${p.price||''}:${p.rating||p.score||''}:${p.reviews||p.reviewCount||''}:${p.categoryPath?.join('>')||p.category||''}`).join('|');}
  function calc(){
    if(running||!window.ProductScoring||typeof products==='undefined'||!Array.isArray(products)||!products.length)return;
    const sig=signature(products);if(sig===lastProductSignature){paintCards();paintModal();return;}
    running=true;
    try{
      const groups=new Map();
      for(const p of products){
        const category=typeof compareCategory==='function'?compareCategory(p):(p.categoryPath?.join('>')||p.category||'');
        const key=`${category}|${p.currency||''}`;(groups.get(key)||groups.set(key,[]).get(key)).push(p);
      }
      for(const p of products){
        const category=typeof compareCategory==='function'?compareCategory(p):(p.categoryPath?.join('>')||p.category||'');
        const key=`${category}|${p.currency||''}`;
        p.scoreParts=ProductScoring.scoreProduct(p,groups.get(key)||[]);p.totalScore=p.scoreParts.total;
      }
      lastProductSignature=sig;paintCards();paintModal();
    }finally{running=false;}
  }
  function fmt(v){return Number.isFinite(Number(v))?Number(v).toFixed(1):'—';}
  function getProductFromCard(card,list){
    const title=card.querySelector('h3,h2,.product-name,.name')?.textContent?.trim();
    return list.find(p=>p.name===title)||list.find(p=>title&&String(p.name||'').includes(title))||null;
  }
  function evidenceData(p){
    const s=p.scoreParts||{};
    const rating=Number(p.rating??p.reviewRating??p.score),count=Number(p.ratingCount??p.reviewCount??p.reviews??0);
    const price=Number(p.price??p.salePrice);
    const performance=Number(p.performanceScore??p.scores?.performance??p.performance);
    const source=p.source||p.seller||'카탈로그';
    return [
      {key:'review',title:'리뷰 점수',available:Number.isFinite(rating)&&rating>0,score:s.review,detail:Number.isFinite(rating)?`${rating.toFixed(1)} / 5 · 리뷰 ${Number.isFinite(count)?count.toLocaleString():'—'}개`:'평점 데이터 없음',source:`원본: ${source}`},
      {key:'price',title:'가격 점수',available:Number.isFinite(price)&&price>0,score:s.price,detail:Number.isFinite(price)?`${price.toLocaleString()} ${p.currency||''} · 같은 비교군의 가격으로 상대 평가`:'가격 데이터 없음',source:`비교군: ${getCohortSize(p)}개 상품`},
      {key:'performance',title:'성능 점수',available:Number.isFinite(performance),score:s.performance,detail:Number.isFinite(performance)?`성능 근거값 ${performance.toFixed(1)} / 100`:'독립 성능 측정값 없음',source:Number.isFinite(performance)?'상품 성능 데이터':'이 항목은 현재 총점에서 제외'}
    ];
  }
  function getCohortSize(p){
    if(typeof products==='undefined'||!Array.isArray(products))return 0;
    const c=typeof compareCategory==='function'?compareCategory(p):(p.categoryPath?.join('>')||p.category||'');
    return products.filter(x=>(typeof compareCategory==='function'?compareCategory(x):(x.categoryPath?.join('>')||x.category||''))===c&&(x.currency||'')===(p.currency||'')).length;
  }
  function openEvidence(p){
    const old=document.getElementById('scoreEvidenceModal');if(old)old.remove();
    const rows=evidenceData(p);const available=rows.filter(x=>x.available).length;
    const wrap=document.createElement('div');wrap.id='scoreEvidenceModal';wrap.className='score-evidence-modal';
    wrap.innerHTML=`<div class="score-evidence-backdrop" data-evidence-close></div><article class="score-evidence-card"><button class="score-evidence-close" data-evidence-close>×</button><div class="eyebrow">SCORE EVIDENCE</div><h2>${escapeHtml(p.name||'상품')} · 근거 ${available}/3</h2><p class="evidence-intro">총점은 아래의 확인 가능한 항목만 사용합니다. 근거가 없는 항목은 0점으로 만들지 않고 제외합니다.</p><div class="evidence-rows">${rows.map(r=>`<section class="evidence-row ${r.available?'available':'missing'}"><div><b>${r.title}</b><span>${r.available?fmt(r.score):'미확인'}</span></div><p>${escapeHtml(r.detail)}</p><small>${escapeHtml(r.source)}</small></section>`).join('')}</div><div class="evidence-foot">계산 방식: 리뷰 · 가격 · 성능의 사용 가능한 점수를 산술평균. 현재 데이터에서는 리뷰/가격만 확인되어 2/3입니다.</div></article>`;
    document.body.appendChild(wrap);
    wrap.querySelectorAll('[data-evidence-close]').forEach(x=>x.addEventListener('click',()=>wrap.remove()));
  }
  function escapeHtml(v){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
  function paintCards(){
    const cards=document.querySelectorAll('.product');if(!cards.length)return;
    const list=typeof filtered==='function'?filtered():products;
    cards.forEach(card=>{
      const p=getProductFromCard(card,list);if(!p?.scoreParts)return;
      const pill=card.querySelector('.score-pill');
      if(pill){
        pill.textContent=`총점 ${fmt(p.totalScore)} · 근거 ${p.scoreParts.evidenceCoverage}`;
        pill.classList.add('score-evidence-button');pill.setAttribute('role','button');pill.setAttribute('tabindex','0');pill.title='점수의 근거 보기';
        if(!pill.dataset.evidenceBound){const open=()=>openEvidence(p);pill.addEventListener('click',open);pill.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')open();});pill.dataset.evidenceBound='1';}
      }
      let x=card.querySelector('.score-breakdown');if(!x){x=document.createElement('div');x.className='score-breakdown';const reason=card.querySelector('.reason');if(reason)reason.before(x);else card.querySelector('.product-info')?.appendChild(x);}
      const html=`<span>리뷰 ${fmt(p.scoreParts.review)}</span><span>가격 ${fmt(p.scoreParts.price)}</span><span>성능 ${fmt(p.scoreParts.performance)}</span>`;if(x.innerHTML!==html)x.innerHTML=html;
    });
  }
  function paintModal(){
    const modal=document.querySelector('#modalContent');if(!modal||typeof products==='undefined')return;
    const title=modal.querySelector('h2');if(!title)return;const name=title.textContent.split(' · ')[0].trim();const p=products.find(x=>x.name===name);if(!p?.scoreParts)return;
    let panel=modal.querySelector('.total-score-panel');if(!panel){panel=document.createElement('div');panel.className='total-score-panel';title.after(panel);}
    panel.innerHTML=`<div><strong>${fmt(p.totalScore)}</strong><span> / 100 총점</span></div><small>리뷰 ${fmt(p.scoreParts.review)} · 가격 ${fmt(p.scoreParts.price)} · 성능 ${fmt(p.scoreParts.performance)} · 근거 ${p.scoreParts.evidenceCoverage}</small><button class="modal-evidence-button">근거 자세히 보기</button>`;
    const b=panel.querySelector('.modal-evidence-button');if(b&&!b.dataset.bound){b.onclick=()=>openEvidence(p);b.dataset.bound='1';}
  }
  const style=document.createElement('style');style.textContent=`.score-breakdown{display:flex;gap:7px;flex-wrap:wrap;margin:8px 0;font-size:11px;color:#777}.score-breakdown span{padding:3px 7px;border:1px solid rgba(128,128,128,.18);border-radius:999px}.score-evidence-button{cursor:pointer}.score-evidence-button:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(0,0,0,.08)}.total-score-panel{margin:14px 0;padding:14px 16px;border:1px solid rgba(128,128,128,.18);border-radius:14px}.total-score-panel strong{font-size:30px;letter-spacing:-1px}.total-score-panel span{opacity:.6}.total-score-panel small{display:block;margin-top:6px;opacity:.65}.modal-evidence-button{margin-top:10px;border:1px solid rgba(128,128,128,.25);background:transparent;border-radius:999px;padding:7px 10px;cursor:pointer}.score-evidence-modal{position:fixed;inset:0;z-index:3000;display:grid;place-items:center;padding:20px}.score-evidence-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.45)}.score-evidence-card{position:relative;width:min(560px,calc(100vw - 32px));max-height:min(720px,calc(100vh - 32px));overflow:auto;background:#fff;border-radius:22px;padding:24px;box-shadow:0 24px 80px rgba(0,0,0,.28)}.score-evidence-close{position:absolute;right:16px;top:12px;border:0;background:transparent;font-size:28px;cursor:pointer}.score-evidence-card h2{margin:6px 0 8px}.evidence-intro{color:#666;font-size:13px;line-height:1.6}.evidence-row{padding:13px 0;border-top:1px solid rgba(0,0,0,.08)}.evidence-row>div{display:flex;justify-content:space-between;gap:12px}.evidence-row>div span{font-weight:800}.evidence-row p{margin:5px 0 2px;font-size:13px}.evidence-row small{color:#777}.evidence-row.missing{opacity:.62}.evidence-foot{margin-top:14px;padding:12px;border-radius:12px;background:#f6f6f4;color:#666;font-size:12px;line-height:1.5}`;document.head.appendChild(style);
  window.addEventListener('load',schedule,{once:true});setTimeout(schedule,500);setTimeout(schedule,1500);window.__sorRefreshScores=schedule;
})();
