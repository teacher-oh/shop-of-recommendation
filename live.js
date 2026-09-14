(() => {
  const grid = document.querySelector('#productGrid');
  const banner = document.querySelector('#dataBanner');
  const count = document.querySelector('#liveProductCount');
  const status = document.querySelector('#liveStatus');
  if (!grid) return;

  const esc = value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const money = (value, currency='USD') => {
    if (value == null || value === '') return '가격 확인';
    try { return new Intl.NumberFormat('ko-KR', {style:'currency', currency}).format(Number(value)); }
    catch { return `${value} ${currency}`; }
  };
  const card = p => `<article class="product live-product"><a class="live-product-link" href="${esc(p.url || '#')}" target="_blank" rel="noopener noreferrer">
    <div class="product-visual live-visual">${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">` : '<span>NO IMAGE</span>'}<span class="live-source">${esc(p.source || 'LIVE')}</span></div>
    <div class="product-info"><span class="product-brand">${esc(p.brand || 'BRAND')}</span><h3>${esc(p.name || '상품')}</h3>
    <div class="rating">${p.rating != null ? `<span class="stars">★★★★★</span><b>${esc(p.rating)}</b><small>(${Number(p.ratingCount || 0).toLocaleString()})</small>` : '<small>평점 데이터 없음</small>'}</div>
    <div class="price"><strong>${money(p.price,p.currency)}</strong><span>${esc(p.source || '판매처')}</span></div>
    ${p.description ? `<div class="reason"><b>상품 요약</b><br>${esc(p.description).slice(0,180)}</div>` : ''}</div>
  </a></article>`;

  const apply = data => {
    const products = Array.isArray(data) ? data : data?.products;
    if (!Array.isArray(products) || !products.length) throw new Error('No products');
    grid.innerHTML = products.map(card).join('');
    if (count) count.textContent = products.length;
    if (status) status.textContent = 'LIVE';
    if (banner) banner.innerHTML = '<b>실시간 상품 데이터</b><span>GitHub Actions가 수집·갱신한 상품 데이터에서 이미지·가격·평점·구매 링크를 표시합니다. 가격과 재고는 판매처에서 최종 확인하세요.</span>';
  };

  // GitHub Pages is static, so the committed catalog is the primary source.
  fetch('data/products.json', {headers:{Accept:'application/json'}, cache:'no-store'})
    .then(r => r.ok ? r.json() : Promise.reject(new Error('catalog unavailable')))
    .then(apply)
    .catch(() => fetch('/api/products', {headers:{Accept:'application/json'}}))
    .then(r => r ? (r.ok ? r.json() : Promise.reject(new Error('API unavailable'))) : Promise.reject(new Error('API unavailable')))
    .then(apply)
    .catch(() => {
      if (status) status.textContent = '데모';
    });
})();
