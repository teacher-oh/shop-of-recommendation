/* High-precision catalog category audit.
   Strong product-title signals override weak/bad source categories.
   This is intentionally conservative: only clear matches are reassigned. */
(function(){
  const RULES = [
    // FOOD — fresh produce / grocery
    {root:'food',group:'fresh',leaf:'fruit',re:/\bkiwi\b|키위|banana|바나나|apple|사과|orange|오렌지|grape|포도|mango|망고|strawberr(?:y|ies)|딸기|watermelon|수박|melon|멜론|pear|배|peach|복숭아|fruit|과일/i},
    {root:'food',group:'fresh',leaf:'vegetables',re:/\bpotato(?:es)?\b|감자|tomato|토마토|onion|양파|garlic|마늘|carrot|당근|lettuce|상추|cabbage|양배추|spinach|시금치|vegetable|채소/i},
    {root:'food',group:'fresh',leaf:'meat',re:/beef|소고기|pork|돼지고기|chicken|닭고기|lamb|양고기|meat|육류/i},
    {root:'food',group:'fresh',leaf:'seafood',re:/salmon|연어|tuna|참치|shrimp|새우|fish|생선|seafood|수산물/i},
    {root:'food',group:'fresh',leaf:'dairy',re:/milk|우유|cheese|치즈|yogurt|요거트|butter|버터|dairy|유제품/i},
    {root:'food',group:'meal',leaf:'ramen',re:/ramen|라면|instant noodle|인스턴트면/i},
    {root:'food',group:'meal',leaf:'noodles',re:/noodle|국수|우동|파스타|pasta|면류/i},
    {root:'food',group:'meal',leaf:'instantMeals',re:/instant meal|즉석식|간편식|ready meal/i},
    {root:'food',group:'meal',leaf:'rice',re:/\brice\b|쌀|밥|곡물|cereal|시리얼/i},
    {root:'food',group:'meal',leaf:'soups',re:/soup|국|탕|찌개|stew/i},
    {root:'food',group:'snack',leaf:'chips',re:/chips|crisps|감자칩|스낵/i},
    {root:'food',group:'snack',leaf:'cookies',re:/cookie|쿠키|비스킷|biscuit/i},
    {root:'food',group:'snack',leaf:'chocolate',re:/chocolate|초콜릿/i},
    {root:'food',group:'snack',leaf:'candy',re:/candy|사탕|젤리|gummy/i},
    {root:'food',group:'snack',leaf:'nuts',re:/nuts|견과|아몬드|호두|캐슈/i},
    {root:'food',group:'beverage',leaf:'water',re:/\bbottled water\b|생수/i},
    {root:'food',group:'beverage',leaf:'juice',re:/juice|주스/i},
    {root:'food',group:'beverage',leaf:'sportsDrinks',re:/sports drink|이온음료|스포츠음료/i},
    {root:'food',group:'beverage',leaf:'teaDrinks',re:/tea drink|아이스티|차음료/i},
    {root:'food',group:'coffeeBeans',leaf:'beans',re:/coffee beans|원두|roasted coffee|espresso beans/i},
    {root:'food',group:'coffeeBeans',leaf:'ground',re:/ground coffee|분쇄커피/i},
    {root:'food',group:'coffeeBeans',leaf:'teaLeaves',re:/tea leaves|tea bag|차잎|티백/i},

    // BEAUTY / PERSONAL CARE — never let generic source categories win
    {root:'beauty',group:'body',leaf:'lotion',re:/\bvaseline\b|petroleum jelly|바세린|body lotion|바디로션/i},
    {root:'beauty',group:'grooming',leaf:'nailCare',re:/nail polish|네일폴리쉬|매니큐어|manicure|pedicure|네일케어|nail care/i},
    {root:'beauty',group:'makeup',leaf:'lip',re:/lipstick|립스틱|lip gloss|립글로스|lip makeup/i},
    {root:'beauty',group:'makeup',leaf:'foundation',re:/foundation|파운데이션|concealer|컨실러|base makeup/i},
    {root:'beauty',group:'makeup',leaf:'eye',re:/mascara|마스카라|eyeliner|아이라이너|eye shadow|아이섀도/i},
    {root:'beauty',group:'makeup',leaf:'cheek',re:/blush|blusher|블러셔|cheek makeup/i},
    {root:'beauty',group:'makeup',leaf:'tools',re:/makeup brush|메이크업 브러시|makeup sponge|화장퍼프/i},
    {root:'beauty',group:'hair',leaf:'shampoo',re:/shampoo|샴푸/i},
    {root:'beauty',group:'hair',leaf:'conditioner',re:/conditioner|컨디셔너/i},
    {root:'beauty',group:'hair',leaf:'treatment',re:/hair treatment|트리트먼트|헤어팩/i},
    {root:'beauty',group:'hair',leaf:'dryers',re:/hair dryer|드라이어|hair straightener|고데기|curling iron/i},
    {root:'beauty',group:'body',leaf:'bodyWash',re:/body wash|바디워시/i},
    {root:'beauty',group:'body',leaf:'handCare',re:/hand cream|핸드크림|hand care/i},
    {root:'beauty',group:'body',leaf:'footCare',re:/foot cream|풋크림|foot care/i},
    {root:'beauty',group:'skincare',leaf:'cleanser',re:/cleanser|클렌저|face wash|세안/i},
    {root:'beauty',group:'skincare',leaf:'toner',re:/toner|토너/i},
    {root:'beauty',group:'skincare',leaf:'serum',re:/serum|에센스|세럼/i},
    {root:'beauty',group:'skincare',leaf:'moisturizer',re:/moisturizer|moisturising cream|보습크림/i},
    {root:'beauty',group:'skincare',leaf:'sunscreen',re:/sunscreen|sun cream|선크림|자외선차단/i},
    {root:'beauty',group:'skincare',leaf:'masks',re:/face mask|sheet mask|마스크팩/i},
    {root:'beauty',group:'grooming',leaf:'shaving',re:/shaving|면도기|razor|shaver/i},
    {root:'beauty',group:'grooming',leaf:'beardCare',re:/beard|수염/i},
    {root:'beauty',group:'grooming',leaf:'trimmers',re:/trimmer|트리머/i},
    {root:'beauty',group:'grooming',leaf:'oralCare',re:/toothbrush|치약|toothpaste|oral care|구강/i},

    // AUTOMOTIVE — only explicit vehicle signals; no bare substring "car"
    {root:'automotive',group:'electronics',leaf:'electronics',re:/dash cam|블랙박스|car charger|차량용 충전기|car electronics|차량 전자/i},
    {root:'automotive',group:'carCare',leaf:'carWash',re:/car shampoo|car wash|자동차 세차|세차용품|car wax|car polish|차량 광택/i},
    {root:'automotive',group:'interior',leaf:'general',re:/car mat|차량매트|car cover|차량커버|seat cover|차량용품|car interior|차량 인테리어|car air freshener|차량용 방향제/i},
    {root:'automotive',group:'bike',leaf:'bikes',re:/motorcycle|오토바이|모터사이클/i},
    {root:'automotive',group:'interior',leaf:'general',re:/\bautomotive\b|\bvehicle\b|\bcar\b|자동차|차량/i},

    // HOME / CLEANING
    {root:'home',group:'cleaning',leaf:'mops',re:/\bmop\b|걸레|밀대|floor mop/i},
    {root:'home',group:'cleaning',leaf:'brooms',re:/\bbroom\b|빗자루|쓰레받기/i},
    {root:'home',group:'cleaning',leaf:'brushes',re:/cleaning brush|청소브러시|scrub brush/i},
    {root:'home',group:'cleaning',leaf:'detergent',re:/laundry detergent|세탁세제|detergent|세제/i},
    {root:'home',group:'appliances',leaf:'washing',re:/washing machine|세탁기|dryer|건조기/i},
    {root:'home',group:'appliances',leaf:'vacuum',re:/vacuum cleaner|\bvacuum\b|청소기/i},
    {root:'home',group:'appliances',leaf:'airPurifier',re:/air purifier|공기청정기/i},
    {root:'home',group:'appliances',leaf:'humidifier',re:/humidifier|가습기/i},
    {root:'home',group:'appliances',leaf:'dehumidifier',re:/dehumidifier|제습기/i},
    {root:'home',group:'kitchen',leaf:'airFryer',re:/air fryer|에어프라이어/i},
    {root:'home',group:'kitchen',leaf:'microwave',re:/microwave|전자레인지/i},
    {root:'home',group:'kitchen',leaf:'riceCooker',re:/rice cooker|전기밥솥/i},
    {root:'home',group:'kitchen',leaf:'blender',re:/blender|믹서|블렌더/i},
    {root:'home',group:'kitchen',leaf:'toaster',re:/toaster|토스터/i},
    {root:'home',group:'kitchen',leaf:'dishwasher',re:/dishwasher|식기세척기/i},
    {root:'home',group:'kitchen',leaf:'cookers',re:/induction|인덕션|electric range/i},
    {root:'home',group:'cookware',leaf:'pots',re:/frying pan|프라이팬|\bpot\b|냄비/i},
    {root:'home',group:'cookware',leaf:'knives',re:/knife|칼|cutting board|도마/i},
    {root:'home',group:'cookware',leaf:'tableware',re:/plate|dish|bowl|그릇|식기/i},
    {root:'home',group:'cookware',leaf:'cutlery',re:/fork|spoon|chopstick|수저|커트러리/i},
    {root:'home',group:'cookware',leaf:'containers',re:/food container|밀폐용기|storage container/i},
    {root:'home',group:'coffee',leaf:'coffeeMachines',re:/coffee maker|espresso machine|커피머신|drip coffee|v60/i},
    {root:'home',group:'coffee',leaf:'grinders',re:/coffee grinder|그라인더/i},
    {root:'home',group:'coffee',leaf:'kettles',re:/kettle|전기포트|주전자/i},
    {root:'home',group:'coffee',leaf:'drippers',re:/coffee filter|dripper|드리퍼|필터/i},

    // ELECTRONICS
    {root:'electronics',group:'computers',leaf:'laptops',re:/macbook|laptop|notebook|노트북/i},
    {root:'electronics',group:'computers',leaf:'desktops',re:/desktop pc|desktop computer|데스크탑|tower pc/i},
    {root:'electronics',group:'computers',leaf:'monitors',re:/\bmonitor\b|모니터/i},
    {root:'electronics',group:'computers',leaf:'keyboards',re:/\bkeyboard\b|키보드/i},
    {root:'electronics',group:'computers',leaf:'mice',re:/\bmouse\b|마우스/i},
    {root:'electronics',group:'mobile',leaf:'smartphones',re:/iphone|galaxy|smartphone|스마트폰|휴대폰/i},
    {root:'electronics',group:'mobile',leaf:'tablets',re:/ipad|\btablet\b|태블릿/i},
    {root:'electronics',group:'mobile',leaf:'chargers',re:/charger|충전기|charging cable|케이블/i},
    {root:'electronics',group:'mobile',leaf:'powerBanks',re:/power bank|보조배터리/i},
    {root:'electronics',group:'audio',leaf:'earbuds',re:/wireless earbuds|airpods|earbuds|무선 이어폰|이어버드/i},
    {root:'electronics',group:'audio',leaf:'overEar',re:/over-ear|over ear|headphone|헤드폰/i},
    {root:'electronics',group:'audio',leaf:'speakers',re:/bluetooth speaker|블루투스 스피커/i},
    {root:'electronics',group:'camera',leaf:'mirrorless',re:/mirrorless|미러리스/i},
    {root:'electronics',group:'camera',leaf:'dslr',re:/\bdslr\b/i},
    {root:'electronics',group:'camera',leaf:'action',re:/gopro|action cam|액션캠/i},
    {root:'electronics',group:'camera',leaf:'lenses',re:/camera lens|\blens\b|렌즈/i},
    {root:'electronics',group:'camera',leaf:'tripods',re:/tripod|삼각대/i},
    {root:'electronics',group:'gaming',leaf:'consoles',re:/playstation|ps5|ps6|xbox|nintendo switch|switch 2|game console|게임 콘솔/i},
    {root:'electronics',group:'gaming',leaf:'handhelds',re:/steam deck|rog ally|handheld console|휴대용 게임기/i},
    {root:'electronics',group:'gaming',leaf:'controllers',re:/gaming controller|gamepad|controller|컨트롤러/i},

    // FASHION / SHOES / BAGS
    {root:'fashion',group:'tops',leaf:'tshirts',re:/t-shirt|tee|티셔츠/i},
    {root:'fashion',group:'tops',leaf:'shirts',re:/shirt|blouse|셔츠|블라우스/i},
    {root:'fashion',group:'tops',leaf:'hoodies',re:/hoodie|sweatshirt|후드|맨투맨/i},
    {root:'fashion',group:'bottoms',leaf:'jeans',re:/jeans|청바지/i},
    {root:'fashion',group:'bottoms',leaf:'shorts',re:/shorts|반바지/i},
    {root:'fashion',group:'bottoms',leaf:'leggings',re:/leggings|레깅스/i},
    {root:'fashion',group:'bottoms',leaf:'skirts',re:/skirt|스커트/i},
    {root:'fashion',group:'outer',leaf:'jackets',re:/jacket|재킷|blazer/i},
    {root:'fashion',group:'outer',leaf:'coats',re:/coat|코트/i},
    {root:'fashion',group:'outer',leaf:'parkas',re:/parka|puffer|패딩|파카/i},
    {root:'shoes',group:'running',leaf:'daily',re:/running shoe|running shoes|pegasus|러닝화/i},
    {root:'shoes',group:'sportsShoes',leaf:'training',re:/sports shoe|training shoe|basketball shoe|football shoe/i},
    {root:'shoes',group:'casualShoes',leaf:'sneakers',re:/sneaker|sneakers|스니커즈/i},
    {root:'shoes',group:'boots',leaf:'work',re:/\bboot\b|\bboots\b|부츠/i},
    {root:'bags',group:'backpack',leaf:'daypacks',re:/backpack|daypack|백팩/i},
    {root:'bags',group:'shoulder',leaf:'crossbody',re:/shoulder bag|crossbody|cross-body|숄더백|크로스백/i},
    {root:'bags',group:'tote',leaf:'tote',re:/tote bag|tote|토트백/i},
    {root:'bags',group:'luggage',leaf:'suitcases',re:/luggage|suitcase|carry-on|캐리어/i},
    {root:'bags',group:'wallet',leaf:'wallets',re:/wallet|card holder|지갑|카드지갑/i},

    // OFFICE / HOBBY / PET
    {root:'office',group:'writing',leaf:'writing',re:/pencil|pen|mechanical pencil|marker|볼펜|연필/i},
    {root:'hobby',group:'books',leaf:'books',re:/\bbook\b|novel|fiction|history|science book|도서|책/i},
    {root:'hobby',group:'games',leaf:'games',re:/board game|puzzle|card game|보드게임/i},
    {root:'pet',group:'food',leaf:'food',re:/pet food|dog food|cat food|반려동물 사료/i},
    {root:'pet',group:'toys',leaf:'toys',re:/pet toy|dog toy|cat toy|반려동물 장난감/i},
    {root:'pet',group:'supplies',leaf:'supplies',re:/pet supplies|pet bed|litter|반려동물 용품/i},

    // DIY
    {root:'diy',group:'tools',leaf:'tools',re:/\btool\b|drill|saw|hammer|wrench|screwdriver|공구|드라이버|망치/i},
    {root:'diy',group:'repair',leaf:'repairKits',re:/repair|adhesive|sealant|patch|fixing|수리|접착제|실리콘/i},
    {root:'diy',group:'hardware',leaf:'screws',re:/hardware|bracket|hook|fastener|screw|철물|나사|볼트/i},
    {root:'diy',group:'garden',leaf:'pots',re:/garden|gardening|plant pot|planter|원예|화분/i}
  ];

  function audit(p){
    if(!p || typeof p!=='object') return p;
    const text=[p.name,p.brand,p.description,p.title,Array.isArray(p.tags)?p.tags.join(' '):'',p.rawCategory,p.category].filter(Boolean).join(' ');
    for(const r of RULES){
      if(r.re.test(text)){
        p.category=r.root;
        p.categoryGroup=r.group;
        p.categoryLeaf=r.leaf;
        p.compareCategory=`${r.root}/${r.group}/${r.leaf}`;
        p.categoryPath=[r.root,r.group,r.leaf];
        p.categoryAudit='high-confidence-title-rule';
        return p;
      }
    }
    return p;
  }

  function auditArray(arr){ if(Array.isArray(arr)) arr.forEach(audit); }
  function run(){
    // Common catalog globals used by the app/data loader.
    ['products','PRODUCTS','allProducts','catalog','CATALOG','productData'].forEach(k=>auditArray(window[k]));
    if(Array.isArray(window.FALLBACK)) auditArray(window.FALLBACK);
  }

  // Also audit every product immediately before it is rendered.
  if(typeof window.productCard==='function'){
    const original=window.productCard;
    window.productCard=function(p){ audit(p); return original(p); };
  }

  run();
  window.addEventListener('load',run,{once:false});
  setTimeout(run,250);
  setTimeout(run,1000);
  setTimeout(run,2500);
})();
