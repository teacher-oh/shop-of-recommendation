/* Category audit v2: applies strong product-name signals after the catalog loads. */
(function(){
  const RULES=[
    {root:'food',group:'fresh',leaf:'fruit',label:'식품 · 신선식품 · 과일',re:/\bkiwi\b|키위|\bbanana\b|바나나|\bapple\b|사과|\borange\b|오렌지|\bgrape\b|포도|\bmango\b|망고|\bstrawberr(?:y|ies)\b|딸기|\bwatermelon\b|수박|\bmelon\b|멜론|\bpear\b|배|\bpeach\b|복숭아|\bfruit\b|과일/i},
    {root:'food',group:'fresh',leaf:'vegetables',label:'식품 · 신선식품 · 채소',re:/\bpotato(?:es)?\b|감자|\btomato(?:es)?\b|토마토|\bonion\b|양파|\bgarlic\b|마늘|\bcarrot\b|당근|\blettuce\b|상추|\bcabbage\b|양배추|\bspinach\b|시금치|\bvegetable\b|채소/i},
    {root:'food',group:'fresh',leaf:'meat',label:'식품 · 신선식품 · 육류',re:/\bbeef\b|소고기|\bpork\b|돼지고기|\bchicken\b|닭고기|\blamb\b|양고기|\bmeat\b|육류/i},
    {root:'food',group:'fresh',leaf:'seafood',label:'식품 · 신선식품 · 수산물',re:/\bsalmon\b|연어|\btuna\b|참치|\bshrimp\b|새우|\bfish\b|생선|\bseafood\b|수산물/i},
    {root:'food',group:'fresh',leaf:'dairy',label:'식품 · 신선식품 · 유제품',re:/\bmilk\b|우유|\bcheese\b|치즈|\byogurt\b|요거트|\bbutter\b|버터|\bdairy\b|유제품/i},
    {root:'food',group:'meal',leaf:'ramen',label:'식품 · 식사·간편식 · 라면·봉지면',re:/\bramen\b|라면|instant noodle|인스턴트면/i},
    {root:'food',group:'meal',leaf:'noodles',label:'식품 · 식사·간편식 · 면류',re:/\bnoodle\b|국수|우동|파스타|\bpasta\b|면류/i},
    {root:'food',group:'meal',leaf:'instantMeals',label:'식품 · 식사·간편식 · 간편식',re:/instant meal|즉석식|간편식|ready meal/i},
    {root:'food',group:'meal',leaf:'rice',label:'식품 · 식사·간편식 · 밥·곡물',re:/\brice\b|쌀|\bcereal\b|시리얼|곡물/i},
    {root:'food',group:'snack',leaf:'chips',label:'식품 · 과자·간식 · 스낵·칩',re:/\bchips\b|\bcrisps\b|감자칩|스낵/i},
    {root:'food',group:'snack',leaf:'cookies',label:'식품 · 과자·간식 · 쿠키·비스킷',re:/\bcookie\b|쿠키|비스킷|\bbiscuit\b/i},
    {root:'food',group:'snack',leaf:'chocolate',label:'식품 · 과자·간식 · 초콜릿',re:/\bchocolate\b|초콜릿/i},
    {root:'food',group:'snack',leaf:'candy',label:'식품 · 과자·간식 · 사탕·젤리',re:/\bcandy\b|사탕|젤리|\bgummy\b/i},
    {root:'food',group:'snack',leaf:'nuts',label:'식품 · 과자·간식 · 견과류',re:/\bnuts\b|견과|아몬드|호두|캐슈/i},
    {root:'food',group:'beverage',leaf:'juice',label:'식품 · 음료 · 주스',re:/\bjuice\b|주스/i},
    {root:'food',group:'beverage',leaf:'water',label:'식품 · 음료 · 생수',re:/\bbottled water\b|생수/i},
    {root:'food',group:'coffeeBeans',leaf:'beans',label:'식품 · 커피·차 재료 · 원두',re:/coffee beans|원두|roasted coffee|espresso beans/i},

    {root:'beauty',group:'body',leaf:'lotion',label:'뷰티·퍼스널케어 · 바디케어 · 바디로션',re:/\bvaseline\b|petroleum jelly|바세린|body lotion|바디로션/i},
    {root:'beauty',group:'grooming',leaf:'nailCare',label:'뷰티·퍼스널케어 · 그루밍·면도 · 네일케어',re:/nail polish|네일폴리쉬|매니큐어|\bmanicure\b|\bpedicure\b|네일케어|nail care/i},
    {root:'beauty',group:'makeup',leaf:'lip',label:'뷰티·퍼스널케어 · 메이크업 · 립 메이크업',re:/lipstick|립스틱|lip gloss|립글로스/i},
    {root:'beauty',group:'makeup',leaf:'eye',label:'뷰티·퍼스널케어 · 메이크업 · 아이 메이크업',re:/mascara|마스카라|eyeliner|아이라이너|eye shadow|아이섀도/i},
    {root:'beauty',group:'hair',leaf:'shampoo',label:'뷰티·퍼스널케어 · 헤어케어 · 샴푸',re:/\bshampoo\b|샴푸/i},
    {root:'beauty',group:'hair',leaf:'conditioner',label:'뷰티·퍼스널케어 · 헤어케어 · 컨디셔너',re:/\bconditioner\b|컨디셔너/i},
    {root:'beauty',group:'body',leaf:'bodyWash',label:'뷰티·퍼스널케어 · 바디케어 · 바디워시',re:/body wash|바디워시/i},
    {root:'beauty',group:'skincare',leaf:'cleanser',label:'뷰티·퍼스널케어 · 스킨케어 · 클렌저',re:/cleanser|클렌저|face wash|세안/i},
    {root:'beauty',group:'skincare',leaf:'serum',label:'뷰티·퍼스널케어 · 스킨케어 · 세럼·에센스',re:/serum|에센스|세럼/i},
    {root:'beauty',group:'skincare',leaf:'moisturizer',label:'뷰티·퍼스널케어 · 스킨케어 · 크림·로션',re:/moisturizer|moisturising cream|보습크림/i},
    {root:'beauty',group:'skincare',leaf:'sunscreen',label:'뷰티·퍼스널케어 · 스킨케어 · 선크림',re:/sunscreen|sun cream|선크림|자외선차단/i},

    {root:'automotive',group:'electronics',leaf:'electronics',label:'자동차·모빌리티 · 차량 전자기기',re:/dash cam|블랙박스|car charger|차량용 충전기|car electronics|차량 전자/i},
    {root:'automotive',group:'carCare',leaf:'carWash',label:'자동차·모빌리티 · 세차·관리',re:/car shampoo|car wash|자동차 세차|세차용품|car wax|car polish|차량 광택/i},
    {root:'automotive',group:'interior',leaf:'general',label:'자동차·모빌리티 · 차량용품',re:/car mat|차량매트|car cover|차량커버|car interior|차량 인테리어|car air freshener|차량용 방향제/i},
    {root:'automotive',group:'bike',leaf:'bikes',label:'자동차·모빌리티 · 자전거·모빌리티',re:/motorcycle|오토바이|모터사이클/i},
    {root:'automotive',group:'interior',leaf:'general',label:'자동차·모빌리티 · 차량용품',re:/\bautomotive\b|\bvehicle\b|\bcar\b|자동차|차량/i},

    {root:'home',group:'cleaning',leaf:'mops',label:'생활·홈 · 청소·세탁 · 걸레·밀대',re:/\bmop\b|걸레|밀대|floor mop/i},
    {root:'home',group:'cleaning',leaf:'brooms',label:'생활·홈 · 청소·세탁 · 빗자루·쓰레받기',re:/\bbroom\b|빗자루|쓰레받기/i},
    {root:'home',group:'cleaning',leaf:'detergent',label:'생활·홈 · 청소·세탁 · 세제',re:/laundry detergent|세탁세제|\bdetergent\b|세제/i},
    {root:'home',group:'appliances',leaf:'washing',label:'생활·홈 · 생활가전 · 세탁기·건조기',re:/washing machine|세탁기|dryer|건조기/i},
    {root:'home',group:'appliances',leaf:'vacuum',label:'생활·홈 · 생활가전 · 청소기',re:/vacuum cleaner|\bvacuum\b|청소기/i},
    {root:'home',group:'appliances',leaf:'airPurifier',label:'생활·홈 · 생활가전 · 공기청정기',re:/air purifier|공기청정기/i},
    {root:'home',group:'kitchen',leaf:'airFryer',label:'생활·홈 · 주방가전 · 에어프라이어',re:/air fryer|에어프라이어/i},
    {root:'home',group:'kitchen',leaf:'microwave',label:'생활·홈 · 주방가전 · 전자레인지',re:/microwave|전자레인지/i},
    {root:'home',group:'kitchen',leaf:'riceCooker',label:'생활·홈 · 주방가전 · 전기밥솥',re:/rice cooker|전기밥솥/i},
    {root:'home',group:'kitchen',leaf:'blender',label:'생활·홈 · 주방가전 · 블렌더·믹서',re:/blender|믹서|블렌더/i},
    {root:'home',group:'cookware',leaf:'pots',label:'생활·홈 · 주방용품 · 냄비·팬',re:/frying pan|프라이팬|\bpot\b|냄비/i},
    {root:'home',group:'cookware',leaf:'knives',label:'생활·홈 · 주방용품 · 칼·도마',re:/knife|칼|cutting board|도마/i},
    {root:'home',group:'coffee',leaf:'coffeeMachines',label:'생활·홈 · 커피·음료 · 커피머신',re:/coffee maker|espresso machine|커피머신|drip coffee|v60/i},

    {root:'electronics',group:'computers',leaf:'laptops',label:'전자제품 · 컴퓨터 · 노트북',re:/macbook|laptop|notebook|노트북/i},
    {root:'electronics',group:'computers',leaf:'desktops',label:'전자제품 · 컴퓨터 · 데스크탑',re:/desktop pc|desktop computer|데스크탑|tower pc/i},
    {root:'electronics',group:'computers',leaf:'monitors',label:'전자제품 · 컴퓨터 · 모니터',re:/\bmonitor\b|모니터/i},
    {root:'electronics',group:'mobile',leaf:'smartphones',label:'전자제품 · 모바일 · 스마트폰',re:/iphone|galaxy|smartphone|스마트폰|휴대폰/i},
    {root:'electronics',group:'mobile',leaf:'tablets',label:'전자제품 · 모바일 · 태블릿',re:/ipad|\btablet\b|태블릿/i},
    {root:'electronics',group:'mobile',leaf:'chargers',label:'전자제품 · 모바일 · 충전기·케이블',re:/charger|충전기|charging cable|케이블/i},
    {root:'electronics',group:'audio',leaf:'earbuds',label:'전자제품 · 오디오 · 무선 이어버드',re:/wireless earbuds|airpods|earbuds|무선 이어폰|이어버드/i},
    {root:'electronics',group:'audio',leaf:'overEar',label:'전자제품 · 오디오 · 헤드폰',re:/over-ear|over ear|headphone|헤드폰/i},
    {root:'electronics',group:'audio',leaf:'speakers',label:'전자제품 · 오디오 · 블루투스 스피커',re:/bluetooth speaker|블루투스 스피커/i},
    {root:'electronics',group:'camera',leaf:'mirrorless',label:'전자제품 · 카메라 · 미러리스',re:/mirrorless|미러리스/i},
    {root:'electronics',group:'camera',leaf:'dslr',label:'전자제품 · 카메라 · DSLR',re:/\bdslr\b/i},
    {root:'electronics',group:'gaming',leaf:'consoles',label:'전자제품 · 게임·콘솔 · 게임 콘솔',re:/playstation|ps5|ps6|xbox|nintendo switch|switch 2|game console|게임 콘솔/i},

    {root:'shoes',group:'running',leaf:'road',label:'신발 · 러닝화 · 로드 러닝화',re:/running shoe|running shoes|러닝화|pegasus/i},
    {root:'shoes',group:'casualShoes',leaf:'sneakers',label:'신발 · 캐주얼화 · 스니커즈',re:/\bsneaker(?:s)?\b|스니커즈/i},
    {root:'bags',group:'backpack',leaf:'daypacks',label:'가방·지갑 · 백팩 · 데일리 백팩',re:/\bbackpack\b|\bdaypack\b|백팩/i},
    {root:'bags',group:'luggage',leaf:'suitcases',label:'가방·지갑 · 여행가방 · 캐리어',re:/\bluggage\b|\bsuitcase\b|carry-on|캐리어/i},
    {root:'fashion',group:'tops',leaf:'tshirts',label:'패션 · 상의 · 티셔츠',re:/t-shirt|tshirt|티셔츠/i},
    {root:'fashion',group:'bottoms',leaf:'pants',label:'패션 · 하의 · 바지',re:/\bjeans\b|\bpants\b|trousers|바지|청바지/i}
  ];

  function productText(p){return [p.brand,p.name,p.title,p.description,Array.isArray(p.tags)?p.tags.join(' '):p.tags,p.category,p.subcategory].filter(Boolean).join(' ');}
  function findRule(text){for(const r of RULES){if(r.re.test(text))return r;}return null;}
  function apply(){
    if(typeof products==='undefined'||!Array.isArray(products)||!products.length)return false;
    let changed=0;
    for(const p of products){
      const r=findRule(productText(p));
      if(!r)continue;
      const before=`${p.category}|${p.subcategory}|${(p.categoryPath||[]).join('>')}`;
      p.category=r.root;
      p.subcategory=r.group;
      p.categoryPath=[r.root,r.group,r.leaf];
      p.categoryLabel=r.label;
      p.categoryAudit={source:'title-description-rule',confidence:'high',rule:r.label};
      if(before!==`${p.category}|${p.subcategory}|${p.categoryPath.join('>')}`)changed++;
    }
    window.__sorCategoryAuditApplied=true;
    window.__sorCategoryAuditCount=changed;
    patchCards();
    if(typeof window.__sorRefreshScores==='function')window.__sorRefreshScores();
    return true;
  }
  function patchCards(){
    const grid=document.getElementById('productGrid');if(!grid)return;
    grid.querySelectorAll('.product').forEach(card=>{
      const title=card.querySelector('h3,h2,.product-name,.name');
      const r=findRule(title?.textContent||'');if(!r)return;
      const reason=card.querySelector('.reason');if(!reason)return;
      let label=reason.querySelector('.category-audit-label');
      if(!label){label=document.createElement('div');label.className='category-audit-label';reason.prepend(label);}
      label.textContent=r.label;
    });
  }
  const style=document.createElement('style');style.textContent='.category-audit-label{font-weight:800;color:#ff5a3c;margin-bottom:5px}.category-audit-label+*{margin-top:0}';document.head.appendChild(style);
  let tries=0;const timer=setInterval(()=>{tries++;if(apply()||tries>100)clearInterval(timer);},100);
  window.addEventListener('load',()=>{apply();setTimeout(patchCards,300);setTimeout(patchCards,1200);},{once:true});
  const grid=document.getElementById('productGrid');if(grid)new MutationObserver(()=>patchCards()).observe(grid,{childList:true,subtree:true});
  window.__sorAuditProducts=apply;
})();
