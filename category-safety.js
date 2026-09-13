/* High-precision category correction layer.
   Runs after category-overrides.js and fixes obvious/ambiguous misclassification
   using product title + raw source category. Comparison is leaf-level only. */
(function(){
  const RULES = [
    [/\bkiwi\b|키위|banana|바나나|apple|사과|orange|오렌지|grape|포도|mango|망고|strawberr|딸기|watermelon|수박|melon|멜론|fruit|과일/, ['food','fresh','fruit']],
    [/tomato|토마토|potato|감자|onion|양파|garlic|마늘|carrot|당근|lettuce|상추|vegetable|채소/, ['food','fresh','vegetables']],
    [/beef|소고기|pork|돼지고기|chicken|닭고기|lamb|양고기|meat|육류/, ['food','fresh','meat']],
    [/salmon|연어|tuna|참치|shrimp|새우|fish|생선|seafood|수산물/, ['food','fresh','seafood']],
    [/milk|우유|cheese|치즈|yogurt|요거트|butter|버터|dairy|유제품/, ['food','fresh','dairy']],
    [/ramen|라면|instant noodle|인스턴트면/, ['food','meal','ramen']],
    [/noodle|국수|우동|파스타|pasta|면류/, ['food','meal','noodles']],
    [/instant meal|즉석식|간편식|ready meal/, ['food','meal','instantMeals']],
    [/rice|쌀|밥|곡물|cereal|시리얼/, ['food','meal','rice']],
    [/soup|국|탕|찌개|stew/, ['food','meal','soups']],
    [/chips|crisps|감자칩|스낵|snack/, ['food','snack','chips']],
    [/cookie|쿠키|비스킷|biscuit/, ['food','snack','cookies']],
    [/chocolate|초콜릿/, ['food','snack','chocolate']],
    [/candy|사탕|젤리|gummy/, ['food','snack','candy']],
    [/nuts|견과|아몬드|호두|캐슈/, ['food','snack','nuts']],
    [/water|생수|bottled water/, ['food','beverage','water']],
    [/juice|주스/, ['food','beverage','juice']],
    [/sports drink|이온음료|스포츠음료/, ['food','beverage','sportsDrinks']],
    [/tea drink|아이스티|차음료/, ['food','beverage','teaDrinks']],
    [/coffee beans|원두|roasted coffee|espresso beans/, ['food','coffeeBeans','beans']],
    [/ground coffee|분쇄커피/, ['food','coffeeBeans','ground']],
    [/tea leaves|tea bag|차잎|티백/, ['food','coffeeBeans','teaLeaves']],

    [/nail polish|네일폴리쉬|매니큐어|manicure|pedicure|네일케어|nail care/, ['beauty','grooming','nailCare']],
    [/lipstick|립스틱|lip gloss|립글로스|lip makeup/, ['beauty','makeup','lip']],
    [/foundation|파운데이션|concealer|컨실러|base makeup/, ['beauty','makeup','foundation']],
    [/mascara|마스카라|eyeliner|아이라이너|eye shadow|아이섀도/, ['beauty','makeup','eye']],
    [/blush|blusher|블러셔|cheek makeup/, ['beauty','makeup','cheek']],
    [/makeup brush|메이크업 브러시|makeup sponge|화장퍼프/, ['beauty','makeup','tools']],
    [/shampoo|샴푸/, ['beauty','hair','shampoo']],
    [/conditioner|컨디셔너/, ['beauty','hair','conditioner']],
    [/hair treatment|트리트먼트|헤어팩/, ['beauty','hair','treatment']],
    [/hair dryer|드라이어|hair straightener|고데기|curling iron/, ['beauty','hair','dryers']],
    [/body wash|바디워시/, ['beauty','body','bodyWash']],
    [/body lotion|바디로션/, ['beauty','body','lotion']],
    [/hand cream|핸드크림|hand care/, ['beauty','body','handCare']],
    [/foot cream|풋크림|foot care/, ['beauty','body','footCare']],
    [/cleanser|클렌저|face wash|세안/, ['beauty','skincare','cleanser']],
    [/toner|토너/, ['beauty','skincare','toner']],
    [/serum|에센스|세럼/, ['beauty','skincare','serum']],
    [/moisturizer|moisturising cream|보습크림/, ['beauty','skincare','moisturizer']],
    [/sunscreen|sun cream|선크림|자외선차단/, ['beauty','skincare','sunscreen']],
    [/face mask|sheet mask|마스크팩/, ['beauty','skincare','masks']],
    [/shaving|면도기|razor|shaver/, ['beauty','grooming','shaving']],
    [/beard|수염/, ['beauty','grooming','beardCare']],
    [/trimmer|트리머/, ['beauty','grooming','trimmers']],
    [/toothbrush|치약|toothpaste|oral care|구강/, ['beauty','grooming','oralCare']],

    [/dash cam|블랙박스|car charger|차량용 충전기|car electronics/, ['automotive','electronics','electronics']],
    [/car shampoo|car wash|자동차 세차|세차용품|car wax|car polish|차량 광택/, ['automotive','carCare','carWash']],
    [/car mat|차량매트|car cover|차량커버|seat cover|차량용품|car interior/, ['automotive','interior','general']],
    [/car air freshener|차량용 방향제|차량 방향제/, ['automotive','interior','general']],
    [/motorcycle|오토바이|모터사이클/, ['automotive','bike','bikes']],
    [/car|vehicle|automotive|자동차|차량/, ['automotive','interior','general']],

    [/mop|걸레|밀대|floor mop/, ['home','cleaning','mops']],
    [/broom|빗자루|쓰레받기/, ['home','cleaning','brooms']],
    [/cleaning brush|청소브러시|scrub brush/, ['home','cleaning','brushes']],
    [/laundry detergent|세탁세제|detergent|세제/, ['home','cleaning','detergent']],
    [/washing machine|세탁기|dryer|건조기/, ['home','appliances','washing']],
    [/vacuum cleaner|vacuum|청소기/, ['home','appliances','vacuum']],
    [/air purifier|공기청정기/, ['home','appliances','airPurifier']],
    [/humidifier|가습기/, ['home','appliances','humidifier']],
    [/dehumidifier|제습기/, ['home','appliances','dehumidifier']],
    [/air fryer|에어프라이어/, ['home','kitchen','airFryer']],
    [/microwave|전자레인지/, ['home','kitchen','microwave']],
    [/rice cooker|전기밥솥/, ['home','kitchen','riceCooker']],
    [/blender|믹서|블렌더/, ['home','kitchen','blender']],
    [/toaster|토스터/, ['home','kitchen','toaster']],
    [/dishwasher|식기세척기/, ['home','kitchen','dishwasher']],
    [/induction|인덕션|electric range/, ['home','kitchen','cookers']],
    [/pot|냄비|frying pan|프라이팬|pan/, ['home','cookware','pots']],
    [/knife|칼|cutting board|도마/, ['home','cookware','knives']],
    [/plate|dish|bowl|그릇|식기/, ['home','cookware','tableware']],
    [/fork|spoon|chopstick|수저|커트러리/, ['home','cookware','cutlery']],
    [/food container|밀폐용기|storage container/, ['home','cookware','containers']],
    [/coffee maker|espresso machine|커피머신|drip coffee|v60/, ['home','coffee','coffeeMachines']],
    [/coffee grinder|그라인더/, ['home','coffee','grinders']],
    [/kettle|전기포트|주전자/, ['home','coffee','kettles']],
    [/coffee filter|dripper|드리퍼|필터/, ['home','coffee','drippers']],
    [/desk lamp|table lamp|스탠드|데스크 조명/, ['home','lighting','deskLamps']],
    [/ceiling light|천장등/, ['home','lighting','ceiling']],
    [/floor lamp|플로어 램프/, ['home','lighting','floorLamps']],
    [/led bulb|light bulb|전구/, ['home','lighting','bulbs']],
    [/desk|writing desk|computer desk|책상/, ['home','furniture','desks']],
    [/office chair|desk chair|사무용 의자|의자/, ['home','furniture','chairs']],
    [/sofa|couch|소파/, ['home','furniture','sofas']],
    [/mattress|매트리스/, ['home','furniture','mattresses']],
    [/bed|침대/, ['home','furniture','beds']],
    [/bookshelf|bookcase|책장|선반/, ['home','furniture','shelves']],
    [/cabinet|수납장/, ['home','furniture','cabinets']],
    [/storage box|수납함|수납박스/, ['home','storage','boxes']],
    [/organizer|정리함|오거나이저/, ['home','storage','organizers']],

    [/macbook|laptop|notebook|노트북/, ['electronics','computers','laptops']],
    [/desktop pc|desktop computer|데스크탑|tower pc/, ['electronics','computers','desktops']],
    [/all-in-one|all in one pc|일체형 pc/, ['electronics','computers','allInOne']],
    [/mini pc|미니 pc/, ['electronics','computers','miniPc']],
    [/workstation|워크스테이션/, ['electronics','computers','workstations']],
    [/monitor|모니터/, ['electronics','computers','monitors']],
    [/keyboard|키보드/, ['electronics','computers','keyboards']],
    [/mouse|마우스/, ['electronics','computers','mice']],
    [/webcam|웹캠/, ['electronics','computers','webcams']],
    [/iphone|galaxy|smartphone|스마트폰|휴대폰/, ['electronics','mobile','smartphones']],
    [/ipad|tablet|태블릿/, ['electronics','mobile','tablets']],
    [/kindle|e-reader|전자책 리더/, ['electronics','mobile','eReaders']],
    [/phone case|휴대폰 케이스/, ['electronics','mobile','phoneCases']],
    [/charger|충전기|charging cable|케이블/, ['electronics','mobile','chargers']],
    [/power bank|보조배터리/, ['electronics','mobile','powerBanks']],
    [/wireless earbuds|airpods|earbuds|무선 이어폰|이어버드/, ['electronics','audio','earbuds']],
    [/over-ear|over ear|headphone|헤드폰/, ['electronics','audio','overEar']],
    [/on-ear|온이어/, ['electronics','audio','onEar']],
    [/wired earphone|유선 이어폰/, ['electronics','audio','wiredEarphones']],
    [/soundbar|사운드바/, ['electronics','audio','soundbars']],
    [/bluetooth speaker|블루투스 스피커|speaker/, ['electronics','audio','speakers']],
    [/microphone|마이크/, ['electronics','audio','microphones']],
    [/mirrorless|미러리스/, ['electronics','camera','mirrorless']],
    [/dslr/, ['electronics','camera','dslr']],
    [/gopro|action cam|액션캠/, ['electronics','camera','action']],
    [/camera lens|lens|렌즈/, ['electronics','camera','lenses']],
    [/tripod|삼각대/, ['electronics','camera','tripods']],
    [/camera bag|카메라 가방/, ['electronics','camera','cameraBags']],
    [/playstation|ps5|ps6|xbox|nintendo switch|switch 2|game console|게임 콘솔/, ['electronics','gaming','consoles']],
    [/steam deck|rog ally|handheld console|휴대용 게임기/, ['electronics','gaming','handhelds']],
    [/gaming controller|gamepad|controller|컨트롤러/, ['electronics','gaming','controllers']],
    [/gaming headset|게이밍 헤드셋/, ['electronics','gaming','gamingHeadsets']],
    [/video game|game title|게임 타이틀/, ['electronics','gaming','games']],

    [/t-shirt|tee|티셔츠/, ['fashion','tops','tshirts']],
    [/shirt|blouse|셔츠|블라우스/, ['fashion','tops','shirts']],
    [/hoodie|sweatshirt|후드|맨투맨/, ['fashion','tops','hoodies']],
    [/sweater|knit|니트/, ['fashion','tops','sweaters']],
    [/jeans|청바지/, ['fashion','bottoms','jeans']],
    [/shorts|반바지/, ['fashion','bottoms','shorts']],
    [/leggings|레깅스/, ['fashion','bottoms','leggings']],
    [/skirt|스커트/, ['fashion','bottoms','skirts']],
    [/jacket|재킷|blazer/, ['fashion','outer','jackets']],
    [/coat|코트/, ['fashion','outer','coats']],
    [/parka|puffer|패딩|파카/, ['fashion','outer','parkas']],
    [/cardigan|가디건/, ['fashion','outer','cardigans']],
    [/dress|원피스/, ['fashion','dress','dresses']],
    [/suit|정장/, ['fashion','dress','suits']],
    [/hat|cap|모자|캡/, ['fashion','accessories','hats']],
    [/belt|벨트/, ['fashion','accessories','belts']],
    [/scarf|스카프/, ['fashion','accessories','scarves']],
    [/sunglasses|선글라스/, ['fashion','accessories','sunglasses']],
    [/smartwatch|스마트워치/, ['fashion','watch','smartwatches']],
    [/watch|wristwatch|시계/, ['fashion','watch','analog']],
    [/running shoe|running shoes|러닝화|pegasus/, ['shoes','running','daily']],
    [/basketball shoe|농구화/, ['shoes','sportsShoes','basketball']],
    [/football shoe|soccer shoe|축구화/, ['shoes','sportsShoes','football']],
    [/tennis shoe|테니스화/, ['shoes','sportsShoes','tennis']],
    [/sneaker|스니커즈/, ['shoes','casualShoes','sneakers']],
    [/sandals|샌들|slippers|슬리퍼/, ['shoes','casualShoes','sandals']],
    [/ankle boot|앵클부츠/, ['shoes','boots','ankle']],
    [/chelsea boot|첼시부츠/, ['shoes','boots','chelsea']],
    [/work boot|워크부츠/, ['shoes','boots','work']],
    [/winter boot|방한부츠/, ['shoes','boots','winter']],
    [/loafer|로퍼/, ['shoes','formalShoes','loafers']],
    [/oxford shoe|옥스퍼드/, ['shoes','formalShoes','oxford']],
    [/backpack|백팩/, ['bags','backpack','daypacks']],
    [/crossbody|cross-body|크로스백/, ['bags','shoulder','crossbody']],
    [/shoulder bag|숄더백/, ['bags','shoulder','shoulder']],
    [/tote bag|토트백/, ['bags','tote','tote']],
    [/handbag|핸드백/, ['bags','tote','handbags']],
    [/suitcase|캐리어/, ['bags','luggage','suitcases']],
    [/duffel|더플백/, ['bags','luggage','duffels']],
    [/wallet|지갑/, ['bags','wallet','wallets']],
    [/card holder|cardholder|카드지갑/, ['bags','wallet','cardholders']],

    [/running watch|러닝워치/, ['sports','running','watches']],
    [/running wear|running shirt|러닝웨어/, ['sports','running','clothing']],
    [/dumbbell|덤벨|weight plate|웨이트/, ['sports','fitness','dumbbells']],
    [/resistance band|exercise band|밴드|튜빙/, ['sports','fitness','bands']],
    [/yoga mat|요가매트|pilates mat/, ['sports','yoga','mats']],
    [/yoga block|요가블록|필라테스 링/, ['sports','yoga','blocks']],
    [/bicycle|bike|자전거/, ['sports','cycling','bikes']],
    [/hiking|trekking|등산|하이킹/, ['outdoor','hiking','boots']],
    [/tent|camping|캠핑|sleeping bag|침낭/, ['outdoor','camping','gear']],
    [/climbing|클라이밍/, ['outdoor','climbing','gear']],
    [/fishing|낚시/, ['outdoor','fishing','gear']],
    [/pen|pencil|볼펜|연필|샤프/, ['office','writing','pens']],
    [/notebook|다이어리|수첩/, ['office','stationery','notebooks']],
    [/printer|프린터|scanner|스캐너/, ['office','printer','printers']],
    [/board game|보드게임|puzzle|퍼즐|card game/, ['hobby','games','boardGames']],
    [/book|novel|소설|도서/, ['hobby','books','books']],
    [/craft|공예|art supplies|미술용품|model kit/, ['hobby','craft','crafts']],
    [/dog food|cat food|pet food|반려동물 사료/, ['pet','food','food']],
    [/dog toy|cat toy|pet toy|반려동물 장난감/, ['pet','toys','toys']],
    [/pet bed|litter|반려동물 용품/, ['pet','supplies','supplies']],
    [/toy|장난감|lego|doll|인형/, ['kids','toys','toys']],
    [/kids clothing|children clothing|아동복|키즈패션/, ['kids','kidsFashion','clothing']],

    [/hammer|망치/, ['diy','handTools','hammers']],
    [/screwdriver|드라이버/, ['diy','handTools','screwdrivers']],
    [/wrench|spanner|렌치|스패너/, ['diy','handTools','wrenches']],
    [/pliers|펜치|플라이어/, ['diy','handTools','pliers']],
    [/drill|전동드릴/, ['diy','powerTools','drills']],
    [/impact driver|임팩트/, ['diy','powerTools','impact']],
    [/circular saw|jigsaw|전동톱/, ['diy','powerTools','saws']],
    [/grinder|그라인더/, ['diy','powerTools','grinders']],
    [/sander|샌더|연마기/, ['diy','powerTools','sanders']],
    [/screw|bolt|나사|볼트/, ['diy','hardware','screws']],
    [/bracket|브라켓/, ['diy','hardware','brackets']],
    [/hinge|경첩/, ['diy','hardware','hinges']],
    [/adhesive|glue|접착제|본드/, ['diy','repair','adhesives']],
    [/sealant|silicone|실리콘|실란트/, ['diy','repair','sealants']],
    [/paint|페인트/, ['diy','painting','paint']],
    [/paint brush|roller|붓|롤러/, ['diy','painting','brushes']],
    [/plant pot|planter|화분/, ['diy','garden','pots']],
    [/soil|potting mix|배양토|흙/, ['diy','garden','soil']],
    [/seed|씨앗/, ['diy','garden','seeds']],
    [/fertilizer|비료/, ['diy','garden','fertilizer']]
  ];

  const RAW = {
    laptops:['electronics','computers','laptops'], smartphones:['electronics','mobile','smartphones'], tablets:['electronics','mobile','tablets'],
    computers:['electronics','computers','desktops'], 'mobile-accessories':['electronics','mobile','chargers'], headphones:['electronics','audio','overEar'],
    audio:['electronics','audio','speakers'], cameras:['electronics','camera','compact'], 'camera-accessories':['electronics','camera','accessories'],
    'home-appliances':['home','appliances','vacuum'], 'kitchen-accessories':['home','cookware','tableware'], furniture:['home','furniture','tables'],
    'home-decoration':['home','lighting','ambient'], groceries:['food','fresh','fruit'], food:['food','fresh','fruit'], beauty:['beauty','skincare','cleanser'],
    fragrances:['beauty','body','bath'], 'skin-care':['beauty','skincare','cleanser'], cosmetics:['beauty','makeup','tools'], tops:['fashion','tops','tshirts'],
    'mens-shirts':['fashion','tops','shirts'], 'womens-dresses':['fashion','dress','dresses'], 'mens-shoes':['shoes','casualShoes','sneakers'],
    'womens-shoes':['shoes','casualShoes','sneakers'], 'mens-watches':['fashion','watch','analog'], 'womens-jewellery':['fashion','accessories','jewelry'],
    'womens-bags':['bags','tote','handbags'], sports:['sports','fitness','accessories'], 'sports-accessories':['sports','fitness','accessories'],
    outdoor:['outdoor','outdoorGear','gear'], pet:['pet','supplies','supplies'], pets:['pet','supplies','supplies'], toys:['kids','toys','toys'],
    kids:['kids','toys','toys'], stationery:['office','stationery','notebooks'], books:['hobby','books','books'], automotive:['automotive','interior','general'],
    vehicle:['automotive','interior','general'], motorcycle:['automotive','bike','bikes']
  };

  function normalizePath(path){
    if(!Array.isArray(path)||path.length<3) return ['home','storage','organizers'];
    const [root,child,leaf]=path;
    const tree=(typeof CATEGORY_TREE!=='undefined')?CATEGORY_TREE:null;
    const node=tree?.[root]?.children?.[child];
    if(node && typeof node==='object' && node.children){
      if(Object.prototype.hasOwnProperty.call(node.children,leaf)) return [root,child,leaf];
      const first=Object.keys(node.children)[0];
      if(first) return [root,child,first];
    }
    return path;
  }

  function classify(p){
    const name=String(p?.name||p?.title||'');
    const desc=String(p?.description||p?.reason||'');
    const raw=String(p?.category||p?.categoryPath?.join(' ')||'').toLowerCase().trim();
    const text=name+' '+desc;
    for(const [rx,path] of RULES){ if(rx.test(text)) return path; }
    if(RAW[raw]) return RAW[raw];
    if(Array.isArray(p?.categoryPath) && p.categoryPath.length>=3) return p.categoryPath.slice(-3);
    return ['home','storage','organizers'];
  }

  function apply(){
    if(!Array.isArray(products)) return;
    for(const p of products){
      const path=normalizePath(classify(p));
      p.categoryPath=path; p.categoryRoot=path[0]; p.subcategory=path[1]; p.categoryKey=path.join('::'); p.categoryLeaf=path[2];
    }
    window.__sorLeafCategory=true;
    window.compareCategory=function(p){return p?.categoryKey||'';};
    window.canCompareWith=function(p){
      if(typeof compare==='undefined' || compare.size===0) return true;
      const first=products.find(x=>compare.has(x.id));
      return !!first && window.compareCategory(first)===window.compareCategory(p);
    };
    if(typeof renderCategories==='function') renderCategories();
    if(typeof renderProducts==='function') renderProducts();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',apply); else apply();
})();
