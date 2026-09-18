(() => {
  const input = document.getElementById('searchInput');
  const button = document.getElementById('searchBtn');
  const grid = document.getElementById('productGrid');
  const empty = document.getElementById('emptyState');
  const resultCount = document.getElementById('resultCount');
  if (!input || !grid) return;

  let query = '';
  const normalize = value => String(value || '').toLocaleLowerCase('ko-KR').replace(/\s+/g, ' ').trim();
  const aliases = {
    '헤드폰':'headphone headphones audio', '이어폰':'earbud earbuds earphone audio',
    '노트북':'laptop notebook computer', '컴퓨터':'computer laptop desktop',
    '카메라':'camera cameras', '커피':'coffee', '가방':'bag backpack bags',
    '신발':'shoe shoes sneaker', '자동차':'car automotive vehicle', '청소기':'vacuum cleaner',
    '화장품':'beauty cosmetics skincare', '식품':'food groceries', '운동':'sports fitness'
  };
  const terms = value => {
    const q = normalize(value);
    return q ? `${q} ${aliases[q] || ''}`.trim().split(/\s+/).filter(Boolean) : [];
  };
  const apply = () => {
    const wanted = terms(query);
    const cards = [...grid.querySelectorAll('.product, article')];
    let visible = 0;
    cards.forEach(card => {
      const text = normalize(card.textContent);
      const match = !wanted.length || wanted.some(term => text.includes(term));
      card.hidden = !match;
      if (match) visible++;
    });
    if (resultCount) resultCount.textContent = query ? `· ${visible}개` : `· ${cards.length}개`;
    if (empty) empty.hidden = visible !== 0 || !query;
  };
  const run = value => { query = String(value ?? input.value ?? '').trim(); apply(); };
  input.addEventListener('input', () => run(input.value));
  input.addEventListener('search', () => run(input.value));
  button?.addEventListener('click', () => run(input.value));
  document.querySelectorAll('[data-query]').forEach(chip => chip.addEventListener('click', () => {
    input.value = chip.getAttribute('data-query') || '';
    run(input.value);
    document.getElementById('discover')?.scrollIntoView({behavior:'smooth', block:'start'});
  }));
  document.getElementById('resetBtn')?.addEventListener('click', () => { input.value = ''; run(''); });
  new MutationObserver(() => apply()).observe(grid, {childList:true, subtree:true});
  apply();
})();
