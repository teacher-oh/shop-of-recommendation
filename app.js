const categories=[
['all','전체','ALL PRODUCTS','✦'],['electronics','전자제품','ELECTRONICS','◉'],['computers','컴퓨터','COMPUTERS','⌨'],['mobile','모바일','MOBILE','▯'],['audio','오디오','AUDIO','♫'],['camera','카메라','CAMERA','◎'],['gaming','게임·콘솔','GAMING','◈'],['tv','TV·디스플레이','TV & DISPLAY','▣'],['smart-home','스마트홈','SMART HOME','⌂'],['home-appliances','생활가전','HOME APPLIANCES','◇'],['furniture','가구','FURNITURE','▱'],['kitchen','주방','KITCHEN','♨'],['coffee','커피·음료','COFFEE & DRINK','☕'],['food','식품','FOOD','◍'],['beauty','뷰티','BEAUTY','✿'],['fashion','패션','FASHION','◈'],['shoes','신발','SHOES','⌁'],['bags','가방·잡화','BAGS & ACCESSORIES','▤'],['travel','여행','TRAVEL','✈'],['sports','스포츠·운동','SPORTS','○'],['outdoor','아웃도어','OUTDOOR','△'],['stationery','문구·오피스','STATIONERY','✎'],['hobby','취미·컬렉션','HOBBY','✦'],['kids','키즈','KIDS','♡'],['pet','반려동물','PET','🐾'],['automotive','자동차·모빌리티','AUTOMOTIVE','▰'],['diy','DIY·생활용품','DIY & HOME','▱'],['lighting','조명','LIGHTING','☼']
].map(([id,name,en,icon])=>({id,name,en,icon}));
const names=[
['SONY','WH-1000XM5','audio','🇯🇵 일본',389000,4.8,1842,'best','노이즈 캔슬링과 음질, 착용감의 균형이 뛰어난 무선 헤드폰','◉'],
['APPLE','MacBook Air','computers','🇺🇸 미국',1490000,4.8,2780,'best','휴대성과 배터리, 일상 작업의 균형을 원하는 사용자에게 추천','▱'],
['APPLE','iPhone 17','mobile','🇺🇸 미국',1290000,4.7,3120,'new','카메라와 성능, 생태계 편의성을 함께 원하는 사용자에게 추천','▯'],
['SAMSUNG','Galaxy S26','mobile','🇰🇷 한국',1199000,4.7,2860,'best','디스플레이와 멀티태스킹을 중요하게 보는 사용자에게 추천','▯'],
['FUJIFILM','X100VI','camera','🇯🇵 일본',2390000,4.9,632,'best','휴대성과 사진 결과물의 만족도가 높은 프리미엄 컴팩트 카메라','◎'],
['NINTENDO','Switch 2','gaming','🇯🇵 일본',64800,4.8,4021,'new','가정과 휴대 모드 모두에서 게임을 즐기고 싶은 사용자에게 추천','◈'],
['SONY','BRAVIA XR','tv','🇯🇵 일본',2190000,4.7,1104,'best','영화와 게임을 큰 화면에서 즐기려는 사용자에게 추천','▣'],
['GOOGLE','Nest Hub','smart-home','🇺🇸 미국',129000,4.4,1080,'value','음악과 타이머, 스마트홈 제어를 한곳에서 쓰고 싶은 사용자에게 추천','⌂'],
['PHILIPS','Airfryer','home-appliances','🇳🇱 네덜란드',179000,4.5,2140,'value','간편한 조리를 원하는 집에 활용도가 높은 주방가전','◇'],
['IKEA','POÄNG Chair','furniture','🇸🇪 스웨덴',99000,4.4,3441,'value','합리적인 가격으로 편안한 휴식 공간을 만들기 좋은 의자','⌂'],
['LE CREUSET','Round Cocotte 24cm','kitchen','🇫🇷 프랑스',329000,4.6,418,'best','오래 쓰는 주방용품을 찾는다면 만족도가 높은 클래식 제품','◇'],
['HARIO','V60 Drip Kettle','coffee','🇯🇵 일본',89000,4.5,1108,'value','커피를 직접 내려 마시는 사람에게 정교한 물줄기 제어를 제공','☕'],
['LOCKNLOCK','Glass Food Container Set','food','🇰🇷 한국',39000,4.6,2490,'value','식재료와 남은 음식을 깔끔하게 보관하고 싶은 주방에 추천','◍'],
['DYSON','Airwrap','beauty','🇬🇧 영국',699000,4.5,5170,'best','여러 스타일링을 하나의 기기로 해결하고 싶은 사람에게 추천','✦'],
['NEW BALANCE','990v6','shoes','🇺🇸 미국',219000,4.6,1204,'value','편안함과 데일리 활용성을 함께 원하는 사람에게 추천','N'],
['UNIQLO','AIRism T-Shirt','fashion','🇯🇵 일본',29900,4.4,3280,'value','매일 편하게 입을 기본 아이템을 찾을 때 추천','◆'],
['TUMI','Alpha 3 Backpack','bags','🇺🇸 미국',590000,4.6,820,'best','노트북과 업무용품을 체계적으로 들고 다니려는 사람에게 추천','▤'],
['RIMOWA','Essential Cabin','travel','🇩🇪 독일',980000,4.6,740,'best','여행을 자주 하고 오래 쓸 캐리어를 찾는 사람에게 추천','▱'],
['NIKE','Pegasus','sports','🇺🇸 미국',159000,4.5,1780,'value','일상 운동과 가벼운 러닝을 시작하려는 사람에게 무난한 선택','○'],
['PATAGONIA','Black Hole Pack','outdoor','🇺🇸 미국',199000,4.6,880,'best','일상과 여행, 가벼운 야외활동을 하나의 가방으로 해결할 때 추천','△'],
['PARKER','Jotter','stationery','🇬🇧 영국',22000,4.4,892,'value','매일 쓰기 좋은 깔끔한 필기구를 찾는 사람에게 추천','✎'],
['LEGO','Creator Set','hobby','🇩🇰 덴마크',89000,4.7,1540,'best','만들기 과정과 완성 후 전시까지 즐기고 싶은 사람에게 추천','✦'],
['LEGO','City Set','kids','🇩🇰 덴마크',59000,4.7,1810,'best','만들기와 역할놀이를 함께 즐길 수 있는 어린이용 취미 제품','♡'],
['FURBO','Pet Camera','pet','🇺🇸 미국',199000,4.4,870,'new','집을 비운 동안 반려동물 상태를 확인하고 싶은 보호자에게 추천','🐾'],
['TESLA','Model 3 Accessories','automotive','🇺🇸 미국',99000,4.2,610,'new','차량 내부 정리와 일상 편의를 높이고 싶은 사용자에게 추천','▰'],
['BOSCH','Home Tool Set','diy','🇩🇪 독일',129000,4.5,760,'value','집에서 간단한 조립과 생활 보수를 위한 기본 구성','▱'],
['PHILIPS HUE','White Smart Lamp','lighting','🇳🇱 네덜란드',69000,4.5,1340,'value','앱으로 조명을 간단하게 관리하고 싶은 공간에 추천','☼'],
['BOSE','QuietComfort Ultra','audio','🇺🇸 미국',549000,4.7,1490,'best','강한 소음 차단과 편안한 장시간 착용을 원하는 사람에게 추천','♫'],
['LOGITECH','MX Master 3S','computers','🇨🇭 스위스',139000,4.5,788,'value','업무와 공부용으로 기능 대비 만족도가 높은 생산성 마우스','⌁'],
['SAMSUNG','Bespoke Jet','home-appliances','🇰🇷 한국',799000,4.6,1320,'best','무선 청소와 깔끔한 보관을 함께 원하는 집에 추천','◇'],
['SONOS','Era 100','smart-home','🇺🇸 미국',399000,4.6,1260,'best','집 안에서 간편하게 음악을 즐기고 싶은 사용자에게 추천','♫'],
['LG','OLED C Series','tv','🇰🇷 한국',1890000,4.8,1890,'best','영화와 게임을 위한 높은 명암비의 화면을 원하는 사용자에게 추천','▣'],
['BREVILLE','Barista Express','coffee','🇦🇺 호주',890000,4.6,1640,'best','집에서 직접 에스프레소를 만들고 싶은 커피 입문자에게 추천','☕'],
['CROCS','Classic Clog','shoes','🇺🇸 미국',69000,4.4,4810,'value','편하게 신고 벗는 일상용 신발을 찾을 때 실용적인 선택','⌁'],
['Moleskine','Classic Notebook','stationery','🇮🇹 이탈리아',25000,4.5,2120,'value','생각과 일정, 아이디어를 오래 기록하고 싶은 사람에게 추천','✎'],
['Aesop','Hand Care Set','beauty','🇦🇺 호주',89000,4.4,1430,'new','깔끔한 향과 패키지의 데일리 케어 제품을 찾을 때 추천','✿'],
['KODAK','PIXPRO FZ55','camera','🇺🇸 미국',179000,4.2,486,'value','가볍게 들고 다니며 간단한 사진을 즐기기 좋은 입문용 카메라','▣'],
['IKEA','KALLAX Shelf','furniture','🇸🇪 스웨덴',99000,4.5,3020,'value','책과 소품을 깔끔하게 정리하고 싶은 공간에 활용도가 높음','▱'],
['LULULEMON','Everywhere Belt Bag','bags','🇨🇦 캐나다',69000,4.5,1940,'value','가볍게 소지품을 챙기는 데일리 스타일에 추천','▤'],
['THE NORTH FACE','Base Camp Duffel','outdoor','🇺🇸 미국',169000,4.6,1260,'best','여행과 야외활동에서 튼튼한 수납 공간이 필요한 사람에게 추천','△'],
['HOT WHEELS','Die-Cast Collection','kids','🇺🇸 미국',19000,4.5,1320,'value','작은 크기로 수집과 놀이를 함께 즐기기 좋은 제품','▰'],
['ANOVA','Precision Cooker','kitchen','🇺🇸 미국',249000,4.4,680,'new','정확한 온도로 요리하는 새로운 조리법을 즐기고 싶은 사용자에게 추천','♨']
];
const products=names.map((x,i)=>{const [brand,name,category,country,price,score,reviews,tag,reason,icon]=x;return{id:i+1,brand,name,category,country,price,score,reviews,tags:[tag],icon,reason,description:`${reason}. 제품의 핵심 특징과 실제 구매 전 확인할 포인트를 한눈에 볼 수 있도록 정리했습니다.`,pros:['주요 장점','사용 편의성','활용도'],cons:['가격대 확인 필요','개인 취향에 따른 차이'],scores:{quality:Math.min(5,score+.1),value:Math.max(3.8,score-.2),design:Math.min(5,score),use:Math.min(5,score+.1)},sellers:[['공식 판매처','브랜드 공식 스토어','#'],['Amazon','글로벌 구매처','https://www.amazon.com/'],['쿠팡','국내 구매처','https://www.coupang.com/']]}});
let activeCategory='all',activeFilter='all',query='',saved=new Set(JSON.parse(localStorage.getItem('sor-saved')||'[]'));
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const won=n=>new Intl.NumberFormat('ko-KR').format(n)+'원';
const stars=v=>'★★★★★'.split('').map((s,i)=>i<v?'★':'☆').join('');
const categoryName=id=>categories.find(c=>c.id===id)?.name||id;
function renderCategories(){const wrap=$('#categoryGrid');if(!wrap)return;wrap.innerHTML=categories.map(c=>`<button class="category ${c.id===activeCategory?'active':''}" data-category="${c.id}"><span>${c.icon}</span><b>${c.name}</b><small>${c.en}</small></button>`).join('');$$('.category').forEach(b=>b.addEventListener('click',()=>{activeCategory=b.dataset.category;renderCategories();render()}))}
function filtered(){let list=products.filter(p=>(activeCategory==='all'||p.category===activeCategory)&&(activeFilter==='all'||p.tags.includes(activeFilter))&&(query===''||`${p.brand} ${p.name} ${p.country} ${p.reason} ${categoryName(p.category)}`.toLowerCase().includes(query.toLowerCase())));const sort=$('#sortSelect')?.value||'recommend';if(sort==='rating')list.sort((a,b)=>b.score-a.score);if(sort==='price-low')list.sort((a,b)=>a.price-b.price);if(sort==='price-high')list.sort((a,b)=>b.price-a.price);return list}
function render(){const list=filtered();$('#productGrid').innerHTML=list.map(p=>`<article class="product" data-id="${p.id}"><div class="product-visual product-${p.category}"><span class="flag">${p.country}</span><button class="save ${saved.has(p.id)?'saved':''}" data-save="${p.id}" aria-label="저장">${saved.has(p.id)?'♥':'♡'}</button><span>${p.icon}</span><small>${categoryName(p.category)}</small></div><div class="product-info"><span class="product-brand">${p.brand}</span><h3>${p.name}</h3><div class="rating"><span class="stars">${stars(p.score)}</span><b>${p.score}</b><small>(${p.reviews.toLocaleString()})</small></div><div class="price"><strong>${won(p.price)}</strong><span>데모 기준가</span></div><div class="reason"><b>추천 이유</b><br>${p.reason}</div></div></article>`).join('');$('#emptyState').hidden=list.length>0;$('#resultCount').textContent=`${list.length}개 상품`;$(`#savedCount`).textContent=saved.size;$('#liveProductCount').textContent=products.length;$$('.product').forEach(el=>el.addEventListener('click',e=>{if(e.target.closest('[data-save]'))return;openModal(+el.dataset.id)}));$$('[data-save]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();toggleSave(+b.dataset.save)}))}
function toggleSave(id){saved.has(id)?saved.delete(id):saved.add(id);localStorage.setItem('sor-saved',JSON.stringify([...saved]));render()}
function openModal(id){const p=products.find(x=>x.id===id);if(!p)return;const rows=Object.entries({품질:p.scores.quality,가성비:p.scores.value,디자인:p.scores.design,사용성:p.scores.use}).map(([k,v])=>`<div class="score-line"><label>${k}</label><div class="bar"><i style="width:${v*20}%"></i></div><b>${v.toFixed(1)}</b></div>`).join('');$('#modalContent').innerHTML=`<div class="modal-art product-${p.category}"><span>${p.icon}</span></div><div class="modal-body"><span class="product-brand">${p.brand} · ${p.country}</span><h2>${p.name}</h2><div class="rating"><span class="stars">${stars(p.score)}</span><b>${p.score}</b><small>${p.reviews.toLocaleString()} reviews</small></div><p>${p.description}</p><h4>추천 이유</h4><p>${p.reason}</p><div class="score-box">${rows}</div><div class="proscons"><div><b>좋은 점</b>${p.pros.map(x=>`<span>✓ ${x}</span>`).join('')}</div><div><b>아쉬운 점</b>${p.cons.map(x=>`<span>− ${x}</span>`).join('')}</div></div><h4>구매처</h4><div class="seller-list">${p.sellers.map(s=>`<a href="${s[2]}" target="_blank" rel="noopener"><b>${s[0]}</b><span>${s[1]}</span>↗</a>`).join('')}</div></div>`;$('#productModal').classList.add('open');$('#productModal').setAttribute('aria-hidden','false')}
function closeModal(){$('#productModal').classList.remove('open');$('#productModal').setAttribute('aria-hidden','true')}
$('#searchInput')?.addEventListener('input',e=>{query=e.target.value.trim();render()});$('#searchBtn')?.addEventListener('click',()=>{query=$('#searchInput').value.trim();$('#discover').scrollIntoView({behavior:'smooth'});render()});$$('.quick-tags button').forEach(b=>b.addEventListener('click',()=>{$('#searchInput').value=b.dataset.query;query=b.dataset.query;$('#discover').scrollIntoView({behavior:'smooth'});render()}));$$('.filter').forEach(b=>b.addEventListener('click',()=>{activeFilter=b.dataset.filter;$$('.filter').forEach(x=>x.classList.toggle('active',x===b));render()}));$('#sortSelect')?.addEventListener('change',render);$('#resetBtn')?.addEventListener('click',()=>{activeCategory='all';activeFilter='all';query='';$('#searchInput').value='';$$('.filter').forEach(x=>x.classList.toggle('active',x.dataset.filter==='all'));renderCategories();render()});$$('[data-close]').forEach(x=>x.addEventListener('click',closeModal));document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
renderCategories();render();
