const FALLBACK_IMAGES=[
'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85','https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=85','https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=85','https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=85','https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=900&q=85','https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=900&q=85','https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=85','https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=85','https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85','https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85','https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=900&q=85','https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=85'
];
const FALLBACK=[['SONY','WH-1000XM5','audio',389000,4.8,1842,'best','노이즈 캔슬링과 음질의 균형이 뛰어난 무선 헤드폰'],['APPLE','MacBook Air','computers',1490000,4.8,2780,'best','휴대성과 배터리, 일상 작업의 균형을 원하는 사용자에게 추천'],['SAMSUNG','Galaxy S26','mobile',1199000,4.7,2860,'best','디스플레이와 멀티태스킹을 중요하게 보는 사용자에게 추천'],['FUJIFILM','X100VI','camera',2390000,4.9,632,'best','휴대성과 사진 결과물의 만족도가 높은 프리미엄 카메라'],['NINTENDO','Switch 2','gaming',64800,4.8,4021,'new','가정과 휴대 모드 모두에서 게임을 즐기고 싶은 사용자에게 추천'],['PHILIPS','Airfryer','home-appliances',179000,4.5,2140,'value','간편한 조리를 원하는 집에 활용도가 높은 주방가전'],['HARIO','V60 Drip Kettle','coffee',89000,4.5,1108,'value','커피를 직접 내려 마시는 사람에게 정교한 물줄기 제어를 제공'],['DYSON','Airwrap','beauty',699000,4.5,5170,'best','여러 스타일링을 하나의 기기로 해결하고 싶은 사람에게 추천'],['NEW BALANCE','990v6','shoes',219000,4.6,1204,'value','편안함과 데일리 활용성을 함께 원하는 사람에게 추천'],['TUMI','Alpha 3 Backpack','bags',590000,4.6,820,'best','노트북과 업무용품을 체계적으로 들고 다니려는 사람에게 추천'],['NIKE','Pegasus','sports',159000,4.5,1780,'value','일상 운동과 가벼운 러닝을 시작하려는 사람에게 무난한 선택'],['PATAGONIA','Black Hole Pack','outdoor',199000,4.6,880,'best','일상과 여행, 가벼운 야외활동을 하나의 가방으로 해결할 때 추천']].map((x,i)=>({id:`demo-${i}`,source:'demo',brand:x[0],name:x[1],category:x[2],price:x[3],score:x[4],reviews:x[5],tag:x[6],reason:x[7],image:FALLBACK_IMAGES[i],currency:'KRW',url:'#',seller:'데모',scores:{quality:x[4],value:Math.max(3.8,x[4]-.15),design:x[4],use:Math.min(5,x[4]+.1)}}));

const CATEGORY_TREE={
 electronics:{label:'전자제품',icon:'◉',children:{computers:'컴퓨터',mobile:'모바일',audio:'오디오',camera:'카메라',tv:'TV·디스플레이',gaming:'게임·콘솔',smartHome:'스마트홈'}},
 home:{label:'생활·홈',icon:'⌂',children:{appliances:'생활가전',kitchen:'주방가전',coffee:'커피·음료',furniture:'가구·책상',lighting:'조명',cleaning:'청소·생활용품',storage:'수납·정리'}},
 food:{label:'식품',icon:'◍',children:{meal:'간편식·식사',snack:'과자·간식',beverage:'음료',coffeeBeans:'원두·커피재료',healthFood:'건강식품'}},
 beauty:{label:'뷰티·퍼스널케어',icon:'✿',children:{skincare:'스킨케어',makeup:'메이크업',hair:'헤어케어',body:'바디케어',grooming:'그루밍'}},
 fashion:{label:'패션',icon:'◈',children:{tops:'상의',bottoms:'하의',outer:'아우터',dress:'원피스·정장',accessories:'패션잡화',watch:'시계'}},
 shoes:{label:'신발',icon:'⌁',children:{running:'러닝화',sportsShoes:'스포츠화',casualShoes:'캐주얼화',boots:'부츠',formalShoes:'구두'}},
 bags:{label:'가방·잡화',icon:'▤',children:{backpack:'백팩',shoulder:'숄더·크로스백',tote:'토트백',luggage:'여행가방',wallet:'지갑·소품'}},
 travel:{label:'여행',icon:'✈',children:{luggage:'캐리어·여행가방',travelGear:'여행용품',organizer:'여행 정리용품',camping:'캠핑·차박'}},
 sports:{label:'스포츠·운동',icon:'○',children:{running:'러닝',fitness:'헬스·피트니스',yoga:'요가·필라테스',cycling:'자전거',ballSports:'구기스포츠'}},
 outdoor:{label:'아웃도어',icon:'△',children:{hiking:'등산·하이킹',camping:'캠핑',climbing:'클라이밍',fishing:'낚시',outdoorGear:'야외용품'}},
 office:{label:'문구·오피스',icon:'✎',children:{stationery:'문구',writing:'필기구',desk:'데스크용품',printer:'프린터·출력',officeFurniture:'오피스 가구'}},
 hobby:{label:'취미·컬렉션',icon:'✦',children:{books:'도서',craft:'공예·DIY',music:'음반·악기',games:'보드게임',collectibles:'컬렉션'}},
 kids:{label:'키즈',icon:'♡',children:{toys:'완구',kidsFashion:'키즈패션',kidsFurniture:'키즈가구',education:'교육·학습',baby:'육아용품'}},
 pet:{label:'반려동물',icon:'🐾',children:{food:'반려동물 식품',supplies:'생활용품',grooming:'미용·위생',toys:'장난감',walk:'산책용품'}},
 automotive:{label:'자동차·모빌리티',icon:'▰',children:{carCare:'세차·관리',interior:'차량용품',electronics:'차량 전자기기',bike:'자전거·모빌리티',travel:'차량 여행용품'}},
 diy:{label:'DIY·생활용품',icon:'▱',children:{deskFurniture:'책상·작업가구',storage:'수납·정리',tools:'공구·작업용품',repair:'보수·수리용품',hardware:'철물·설치용품',garden:'원예·정원',cleaning:'청소·생활용품'}},
};
const CATEGORY_RULES=[
[['electronics','computers'],['laptop','notebook','desktop computer','computer','pc','macbook','monitor','keyboard','mouse','printer']],
[['electronics','mobile'],['smartphone','phone','iphone','galaxy s','tablet','ipad','smartwatch','wearable']],
[['electronics','audio'],['headphone','earbud','earphone','speaker','soundbar','audio','wh-1000']],
[['electronics','camera'],['camera','mirrorless','dslr','lens','fujifilm','canon','nikon','gopro']],
[['electronics','tv'],['television','tv ','display','projector','oled','qled']],
[['electronics','gaming'],['gaming console','game console','playstation','xbox','nintendo','switch','gaming headset']],
[['electronics','smartHome'],['smart home','smart speaker','smart bulb','smart plug','robot vacuum','smart device']],
[['home','appliances'],['air purifier','vacuum cleaner','air fryer','microwave','rice cooker','washing machine','refrigerator','dryer','appliance']],
[['home','kitchen'],['blender','toaster','oven','cookware','frying pan','pot','kitchen']],
[['home','coffee'],['coffee maker','espresso','drip kettle','coffee grinder','coffee brewer','v60','coffee']],
[['home','furniture'],['desk','table','office chair','chair','bookshelf','sofa','bed','mattress','furniture']],
[['home','lighting'],['lamp','lighting','led light','ceiling light']],
[['home','cleaning'],['cleaning','detergent','mop','broom','laundry']],
[['home','storage'],['storage','organizer','drawer','shelf','rack']],
[['food','meal'],['ramen','noodle','meal','rice','soup','ready meal']],
[['food','snack'],['snack','cookie','chocolate','candy','chips']],
[['food','beverage'],['beverage','drink','juice','tea','water']],
[['food','coffeeBeans'],['coffee beans','roasted beans','ground coffee']],
[['beauty','skincare'],['skincare','cleanser','moisturizer','serum','sunscreen']],
[['beauty','makeup'],['makeup','foundation','lipstick','mascara','cosmetic']],
[['beauty','hair'],['shampoo','conditioner','hair dryer','haircare','airwrap']],
[['beauty','body'],['body wash','body lotion','body care']],
[['fashion','tops'],['t-shirt','shirt','hoodie','sweater','top']],
[['fashion','bottoms'],['jeans','pants','trousers','shorts','skirt']],
[['fashion','outer'],['jacket','coat','parka','cardigan','outerwear']],
[['fashion','dress'],['dress','suit','formalwear']],
[['fashion','accessories'],['sunglasses','hat','cap','belt','scarf']],
[['fashion','watch'],['watch','wristwatch']],
[['shoes','running'],['running shoe','running shoes','pegasus']],
[['shoes','sportsShoes'],['sports shoe','training shoe','basketball shoe','football shoe']],
[['shoes','casualShoes'],['sneaker','sneakers','casual shoe']],
[['shoes','boots'],['boot','boots']],
[['shoes','formalShoes'],['dress shoe','loafer','oxford']],
[['bags','backpack'],['backpack','daypack']],
[['bags','shoulder'],['shoulder bag','crossbody','cross-body']],
[['bags','tote'],['tote bag','tote']],
[['bags','luggage'],['luggage','suitcase','carry-on','travel bag']],
[['bags','wallet'],['wallet','card holder','pouch']],
[['travel','luggage'],['luggage','suitcase','carry-on']],
[['travel','travelGear'],['travel gear','travel adapter','neck pillow','passport holder']],
[['sports','running'],['running','jogging']],
[['sports','fitness'],['fitness','gym','dumbbell','workout','exercise']],
[['sports','yoga'],['yoga','pilates']],
[['sports','cycling'],['cycling','bike','bicycle']],
[['outdoor','hiking'],['hiking','trekking','backpacking']],
[['outdoor','camping'],['camping','tent','sleeping bag']],
[['outdoor','climbing'],['climbing']],
[['office','stationery'],['stationery','notebook','paper']],
[['office','writing'],['pencil','pen','mechanical pencil','marker']],
[['office','desk'],['desk organizer','desk mat','mouse pad','desk accessory']],
[['hobby','books'],['book','novel','fiction','history','science book']],
[['hobby','craft'],['craft','art supplies','diy kit','model kit']],
[['hobby','games'],['board game','puzzle','card game']],
[['kids','toys'],['toy','lego','doll','kids game']],
[['pet','food'],['pet food','dog food','cat food']],
[['pet','supplies'],['pet supplies','pet bed','litter']],
[['pet','toys'],['pet toy','dog toy','cat toy']],
[['automotive','carCare'],['car care','car wash','wax','polish']],
[['automotive','interior'],['car accessory','car mat','car cover','car interior']],
[['automotive','electronics'],['dash cam','car charger','car electronics']],
[['diy','deskFurniture'],['desk','workbench','work table','office furniture']],
[['diy','storage'],['storage box','storage rack','shelving','organizer']],
[['diy','tools'],['tool','drill','saw','hammer','wrench','screwdriver']],
[['diy','repair'],['repair','adhesive','sealant','patch','fixing']],
[['diy','hardware'],['hardware','bracket','hook','fastener','screw']],
[['diy','garden'],['garden','gardening','plant pot','planter']],
[['diy','cleaning'],['cleaning','mop','broom','brush']]
];
function classifyCategory(rawCategory='',name=''){
 const text=`${rawCategory} ${name}`.toLowerCase();
 for(const [[root,child],words] of CATEGORY_RULES){if(words.some(w=>text.includes(w)))return {root,child,path:[root,child]};}
 const c=text;
 if(c.includes('computer')||c.includes('laptop'))return {root:'electronics',child:'computers',path:['electronics','computers']};
 if(c.includes('phone')||c.includes('mobile'))return {root:'electronics',child:'mobile',path:['electronics','mobile']};
 if(c.includes('home')||c.includes('house'))return {root:'home',child:'cleaning',path:['home','cleaning']};
 if(c.includes('fashion')||c.includes('clothing'))return {root:'fashion',child:'tops',path:['fashion','tops']};
 if(c.includes('shoe'))return {root:'shoes',child:'casualShoes',path:['shoes','casualShoes']};
 if(c.includes('bag'))return {root:'bags',child:'backpack',path:['bags','backpack']};
 if(c.includes('sport'))return {root:'sports',child:'fitness',path:['sports','fitness']};
 if(c.includes('book'))return {root:'hobby',child:'books',path:['hobby','books']};
 if(c.includes('pet'))return {root:'pet',child:'supplies',path:['pet','supplies']};
 if(c.includes('auto')||c.includes('car'))return {root:'automotive',child:'interior',path:['automotive','interior']};
 if(c.includes('diy'))return {root:'diy',child:'repair',path:['diy','repair']};
 return {root:'home',child:'cleaning',path:['home','cleaning']};
}
const CAT=[['all','전체','ALL','✦'],...Object.entries(CATEGORY_TREE).map(([id,v])=>[id,v.label,id.toUpperCase(),v.icon])];
let products=[...FALLBACK],activeCategory='all',activeSubcategory='all',activeFilter='all',query='',sort='recommend',compare=new Set(),recent=JSON.parse(localStorage.getItem('sor-recent')||'[]'),saved=new Set(JSON.parse(localStorage.getItem('sor-saved')||'[]'));
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const won=n=>n==null?'가격 확인':new Intl.NumberFormat('ko-KR').format(Number(n))+'원';
const stars=v=>{const n=Math.round(Number(v)||0);return '★'.repeat(Math.min(5,n))+'☆'.repeat(Math.max(0,5-n))};
function score(p){return Number(p.recommendScore||p.score||0)}
function normalize(p,i){const cls=p.categoryPath?.length?{root:p.categoryPath[0],child:p.categoryPath.at(-1),path:p.categoryPath}:classifyCategory(p.category||'',p.name||p.title||'');const n={...p,id:p.id||`${p.source||'live'}-${i}`,name:p.name||p.title||'이름 없음',brand:p.brand||'상품',price:p.price??null,score:Number(p.score||p.rating||0),reviews:Number(p.reviews||p.reviewCount||0),image:p.image||null,url:p.url||'#',seller:p.seller||p.source||'',category:String(p.category||'').toLowerCase(),categoryRoot:cls.root,subcategory:cls.child,categoryPath:cls.path,reason:p.reason||'가격·평점·정보 완성도를 종합해 확인할 만한 상품입니다.',tag:p.tag||'live',currency:p.currency||'USD'};n.recommendScore=Math.round(((n.score||0)*14+Math.min(5,Math.log10((n.reviews||0)+10))*5+(n.price?2:0))*10)/10;n.scores=n.scores||{quality:Math.min(5,n.score||0),value:Math.min(5,(n.score||0)+.1),design:Math.min(5,n.score||0),use:Math.min(5,(n.score||0)+.1)};return n}
async function loadLive(){try{const r=await fetch('./data/products.json',{cache:'no-store'});if(!r.ok)throw 0;const d=await r.json();if(Array.isArray(d.products)&&d.products.length){products=d.products.map(normalize);$('#liveProductCount').textContent=d.count.toLocaleString('ko-KR');$('#liveStatus').textContent=`LIVE · ${new Date(d.generatedAt).toLocaleString('ko-KR')}`;$('#dataBanner').innerHTML='<b>LIVE CATALOG</b><span>API에서 수집·정규화된 상품 데이터입니다. 가격과 재고는 구매처에서 최종 확인하세요.</span>';render();}else throw 0}catch(e){$('#liveProductCount').textContent='48+';$('#liveStatus').textContent='DEMO DATA';render()}}
function renderCategories(){const wrap=$('#categoryGrid');let html=CAT.map(c=>`<button class="category ${activeCategory===c[0]?'active':''}" data-cat="${c[0]}"><span>${c[3]}</span><b>${c[1]}</b><small>${c[2]}</small></button>`).join('');if(activeCategory!=='all'&&CATEGORY_TREE[activeCategory]){html+=`<div class="subcategory-row"><button class="subcategory ${activeSubcategory==='all'?'active':''}" data-subcat="all">전체</button>${Object.entries(CATEGORY_TREE[activeCategory].children).map(([id,label])=>`<button class="subcategory ${activeSubcategory===id?'active':''}" data-subcat="${id}">${label}</button>`).join('')}</div>`}wrap.innerHTML=html;$$('.category').forEach(b=>b.onclick=()=>{activeCategory=b.dataset.cat;activeSubcategory='all';renderCategories();render()});$$('.subcategory').forEach(b=>b.onclick=()=>{activeSubcategory=b.dataset.subcat;renderCategories();render()})}
function matchesCategory(p){if(activeCategory==='all')return true;if(p.categoryRoot!==activeCategory)return false;return activeSubcategory==='all'||p.subcategory===activeSubcategory}
function compareCategory(p){return String(p.categoryPath?.join('>')||`${p.categoryRoot||''}>${p.subcategory||''}`||p.category||'').toLowerCase().trim()}
function canCompareWith(p){if(!p||!compare.size)return true;const first=[...compare].map(id=>products.find(x=>String(x.id)===id)).find(Boolean);return !!first&&compareCategory(first)===compareCategory(p)}
function filtered(){let a=products.filter(p=>matchesCategory(p));if(activeFilter==='saved')a=a.filter(p=>saved.has(String(p.id)));else if(activeFilter!=='all')a=a.filter(p=>String(p.tag).includes(activeFilter));if(query){const q=query.toLowerCase();a=a.filter(p=>[p.name,p.brand,p.category,p.subcategory,p.reason,p.seller].join(' ').toLowerCase().includes(q))}return a.sort((a,b)=>sort==='rating'?b.score-a.score:sort==='price-low'?(a.price??Infinity)-(b.price??Infinity):sort==='price-high'?(b.price??0)-(a.price??0):sort==='value'?((b.scores?.value||b.score)-(a.scores?.value||a.score)):score(b)-score(a))}
function productCard(p){const sid=String(p.id),isSaved=saved.has(sid),isComp=compare.has(sid);return `<article class="product"><div class="product-visual"><span class="badge">${p.tag==='best'?'BEST':p.tag==='value'?'VALUE':p.source==='demo'?'DEMO':'LIVE'}</span><button class="save-card ${isSaved?'saved':''}" data-save="${sid}">${isSaved?'♥':'♡'}</button>${p.image?`<img loading="eager" src="${p.image}" alt="${p.name}" onerror="this.style.display='none';this.nextElementSibling.hidden=false"><span class="image-fallback" hidden>상품 이미지</span>`:`<span class="image-fallback">상품 이미지</span>`}<label class="compare-check"><input type="checkbox" data-compare="${sid}" ${isComp?'checked':''}> 비교</label></div><div class="product-info"><div class="product-brand">${p.brand}</div><h3>${p.name}</h3><div class="meta"><span class="stars">${stars(p.score)}</span><b>${p.score?p.score.toFixed(1):'—'}</b><span>(${(p.reviews||0).toLocaleString()})</span><span class="score-pill">추천 ${score(p)}</span></div><div class="price"><strong>${won(p.price)}</strong><small>${p.currency||''}</small></div><div class="reason"><b>${CATEGORY_TREE[p.categoryRoot]?.label||'카테고리'} · ${CATEGORY_TREE[p.categoryRoot]?.children?.[p.subcategory]||p.subcategory||'세부'}</b><br>${p.reason}</div></div></article>`}
function render(){const a=filtered();$('#resultCount').textContent=`${a.length.toLocaleString('ko-KR')}개`;$('#productGrid').innerHTML=a.map(productCard).join('');$('#emptyState').hidden=!!a.length;$('#savedCount').textContent=saved.size;$('#compareCount').textContent=compare.size;$('#compareBtn').disabled=compare.size<2;$$('[data-save]').forEach(b=>b.onclick=()=>{const id=b.dataset.save;saved.has(id)?saved.delete(id):saved.add(id);localStorage.setItem('sor-saved',JSON.stringify([...saved]));render()});$$('[data-compare]').forEach(c=>c.onchange=()=>{const p=products.find(x=>String(x.id)===c.dataset.compare);if(c.checked&&compare.size>=3){c.checked=false;return}if(c.checked&&!canCompareWith(p)){c.checked=false;alert('큰 카테고리와 세부 카테고리가 모두 같은 상품만 비교할 수 있습니다.');return}c.checked?compare.add(c.dataset.compare):compare.delete(c.dataset.compare);render()});$$('.product').forEach((el,i)=>el.onclick=e=>{if(e.target.closest('button,input,label'))return;openProduct(a[i])})}
function openProduct(p){recent=[String(p.id),...recent.filter(x=>x!==String(p.id))].slice(0,12);localStorage.setItem('sor-recent',JSON.stringify(recent));const buy=p.url&&p.url!=='#'?`<div class="buy-list"><div class="buy-row"><span><b>${p.seller||p.source||'구매처'}</b><small>상품 페이지</small></span><a href="${p.url}" target="_blank" rel="noopener noreferrer">보러가기 ↗</a></div></div>`:'';$('#modalContent').innerHTML=`<div class="detail"><div class="detail-img">${p.image?`<img src="${p.image}" alt="${p.name}">`:`<span class="image-fallback">상품 이미지</span>`}</div><div><div class="product-brand">${p.brand} · ${p.source||'catalog'}</div><h2>${p.name}</h2><div class="meta"><span class="stars">${stars(p.score)}</span><b>${p.score||'—'}</b><span>${(p.reviews||0).toLocaleString()} reviews</span></div><p>${p.reason}</p><div class="detail-score">${Object.entries(p.scores||{}).slice(0,4).map(([k,v])=>`<div class="score-row"><label>${({quality:'품질',value:'가치',design:'디자인',use:'사용성'})[k]||k}</label><div class="bar"><i style="width:${Math.min(100,(Number(v)||0)*20)}%"></i></div><b>${Number(v||0).toFixed(1)}</b></div>`).join('')}</div>${buy}</div></div>`;$('#modal').classList.add('open');$('#modal').setAttribute('aria-hidden','false')}
function openCompare(){const a=[...compare].map(id=>products.find(p=>String(p.id)===id)).filter(Boolean);if(a.length<2)return;const category=compareCategory(a[0]);if(a.some(p=>compareCategory(p)!==category)){compare=new Set();render();alert('서로 다른 대·세부 카테고리의 상품은 비교할 수 없습니다.');return}$('#modalContent').innerHTML=`<h2>상품 비교 · ${CATEGORY_TREE[a[0].categoryRoot]?.label||'동일 카테고리'} / ${CATEGORY_TREE[a[0].categoryRoot]?.children?.[a[0].subcategory]||a[0].subcategory||'세부'}</h2><div class="compare-grid">${a.map(p=>`<div class="compare-card"><div class="product-brand">${p.brand}</div><h3>${p.name}</h3><small>${CATEGORY_TREE[p.categoryRoot]?.children?.[p.subcategory]||p.subcategory||''}</small><p><b>${won(p.price)}</b></p><p>평점 ${p.score||'—'} · 리뷰 ${(p.reviews||0).toLocaleString()}</p><p>추천점수 <b>${score(p)}</b></p><p>${p.reason}</p></div>`).join('')}</div>`;$('#modal').classList.add('open')}
function showRecent(){const a=recent.map(id=>products.find(p=>String(p.id)===id)).filter(Boolean);if(!a.length){query='';activeFilter='all';render();return}$('#productGrid').innerHTML=a.map(productCard).join('');$('#resultCount').textContent=`최근 본 ${a.length}개`;$$('[data-save]').forEach(b=>b.onclick=()=>{const id=b.dataset.save;saved.has(id)?saved.delete(id):saved.add(id);localStorage.setItem('sor-saved',JSON.stringify([...saved]));showRecent()})}
$('#searchBtn').onclick=()=>{query=$('#searchInput').value.trim();$('#discover').scrollIntoView({behavior:'smooth'});render()};$('#searchInput').oninput=e=>{query=e.target.value.trim();render()};$$('[data-query]').forEach(b=>b.onclick=()=>{$('#searchInput').value=b.dataset.query;query=b.dataset.query;$('#discover').scrollIntoView({behavior:'smooth'});render()});$('#sortSelect').onchange=e=>{sort=e.target.value;render()};$$('.filter').forEach(b=>b.onclick=()=>{activeFilter=b.dataset.filter;$$('.filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');render()});$('#compareBtn').onclick=openCompare;$('#recentBtn').onclick=showRecent;$('#surpriseBtn').onclick=()=>{const a=filtered();if(a.length){openProduct(a[Math.floor(Math.random()*a.length)])}};document.querySelectorAll('[data-close]').forEach(x=>x.onclick=()=>{$('#modal').classList.remove('open');$('#modal').setAttribute('aria-hidden','true')});renderCategories();render();loadLive();
