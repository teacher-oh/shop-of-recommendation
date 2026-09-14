/* API configuration UI.
   Browser-entered credentials stay in localStorage and are NOT committed to GitHub.
   GitHub Actions reads the real secret from repository Actions Secrets. */
(function(){
  const STORAGE='sor_api_settings_v2';
  const saved=(()=>{try{return JSON.parse(localStorage.getItem(STORAGE)||'{}')}catch(e){return {}}})();

  const style=document.createElement('style');
  style.textContent=`
    .sor-api-btn{margin-left:10px;padding:9px 13px;border:1px solid rgba(255,255,255,.14);border-radius:10px;background:#17191f;color:#fff;font:700 13px/1 Noto Sans KR,Inter,sans-serif;cursor:pointer}
    .sor-api-btn:hover{transform:translateY(-1px);background:#20232b}
    .sor-api-overlay{position:fixed;inset:0;z-index:3000;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.68)}
    .sor-api-overlay.show{display:flex}
    .sor-api-card{width:min(700px,100%);max-height:90vh;overflow:auto;border:1px solid rgba(255,255,255,.12);border-radius:20px;background:#111318;color:#fff;box-shadow:0 30px 80px rgba(0,0,0,.45);padding:24px}
    .sor-api-head{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:18px}
    .sor-api-head h2{margin:0;font-size:22px}.sor-api-close{border:0;background:transparent;color:#aaa;font-size:28px;cursor:pointer}
    .sor-api-note{padding:12px 14px;margin:0 0 18px;border-radius:12px;background:rgba(255,193,7,.09);border:1px solid rgba(255,193,7,.2);color:#ddd;font-size:13px;line-height:1.6}
    .sor-api-section{margin-top:18px;padding-top:18px;border-top:1px solid rgba(255,255,255,.08)}
    .sor-api-section h3{margin:0 0 12px;font-size:15px}.sor-api-field{display:grid;gap:7px;margin:11px 0}.sor-api-field label{font-size:12px;color:#aaa;font-weight:700}.sor-api-field input{width:100%;box-sizing:border-box;padding:11px 12px;border:1px solid rgba(255,255,255,.13);border-radius:10px;background:#0b0d11;color:#fff;outline:none}.sor-api-field input:focus{border-color:rgba(255,255,255,.35)}
    .sor-api-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}@media(max-width:620px){.sor-api-grid{grid-template-columns:1fr}}
    .sor-api-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:20px}.sor-api-actions button{padding:11px 15px;border-radius:10px;border:1px solid rgba(255,255,255,.12);cursor:pointer;font-weight:800}.sor-api-save{background:#fff;color:#111}.sor-api-clear{background:#191b21;color:#fff}.sor-api-status{margin-top:10px;color:#8fd3a8;font-size:12px;min-height:18px}
  `;
  document.head.appendChild(style);

  const btn=document.createElement('button');
  btn.className='sor-api-btn';
  btn.type='button';
  btn.textContent='⚙ API 설정';
  const nav=document.querySelector('.topbar nav');
  (nav||document.querySelector('.topbar'))?.appendChild(btn);

  const overlay=document.createElement('div');
  overlay.className='sor-api-overlay';
  overlay.innerHTML=`
    <div class="sor-api-card" role="dialog" aria-modal="true" aria-label="API 설정">
      <div class="sor-api-head"><h2>API 연결 설정</h2><button class="sor-api-close" type="button" aria-label="닫기">×</button></div>
      <div class="sor-api-note"><b>구조:</b> 이 창은 브라우저 설정을 저장하고, GitHub Actions가 사용할 검색 조건을 관리합니다. <b>RapidAPI Key는 GitHub Actions Secrets의 AMAZON_RAPIDAPI_KEY에 넣어야 합니다.</b> 공개 GitHub Pages 코드에는 키를 넣지 않습니다.</div>
      <div class="sor-api-section">
        <h3>RapidAPI · Amazon</h3>
        <div class="sor-api-field"><label>RapidAPI Key · 로컬 테스트용</label><input id="sorRapidKey" type="password" autocomplete="off" placeholder="X-RapidAPI-Key 값"></div>
        <div class="sor-api-field"><label>RapidAPI Host</label><input id="sorRapidHost" type="text" autocomplete="off" placeholder="real-time-amazon-data.p.rapidapi.com"></div>
        <div class="sor-api-grid">
          <div class="sor-api-field"><label>Amazon 검색어</label><input id="sorAmazonQuery" type="text" placeholder="예: wireless headphones"></div>
          <div class="sor-api-field"><label>마켓 국가</label><input id="sorAmazonCountry" type="text" maxlength="2" placeholder="US"></div>
        </div>
        <div class="sor-api-field"><label>가져올 상품 수</label><input id="sorAmazonLimit" type="number" min="1" max="50" placeholder="10"></div>
      </div>
      <div class="sor-api-section">
        <h3>일반 API · 필요할 때만</h3>
        <div class="sor-api-field"><label>API Base URL</label><input id="sorCustomBase" type="url" autocomplete="off" placeholder="https://api.example.com"></div>
        <div class="sor-api-field"><label>API Key</label><input id="sorCustomKey" type="password" autocomplete="off" placeholder="API 키"></div>
        <div class="sor-api-field"><label>Key Header 이름</label><input id="sorCustomHeader" type="text" autocomplete="off" placeholder="예: X-API-Key"></div>
      </div>
      <div class="sor-api-actions"><button class="sor-api-clear" id="sorApiClear" type="button">저장값 삭제</button><button class="sor-api-save" id="sorApiSave" type="button">설정 저장</button></div>
      <div class="sor-api-status" id="sorApiStatus"></div>
    </div>`;
  document.body.appendChild(overlay);

  const $=id=>document.getElementById(id);
  $('sorRapidKey').value=saved.rapidApiKey||'';
  $('sorRapidHost').value=saved.rapidApiHost||'real-time-amazon-data.p.rapidapi.com';
  $('sorAmazonQuery').value=saved.amazonSearchQuery||'wireless headphones';
  $('sorAmazonCountry').value=saved.amazonCountry||'US';
  $('sorAmazonLimit').value=saved.amazonLimit||'10';
  $('sorCustomBase').value=saved.customBaseUrl||'';
  $('sorCustomKey').value=saved.customApiKey||'';
  $('sorCustomHeader').value=saved.customHeader||'X-API-Key';

  function open(){overlay.classList.add('show');$('sorAmazonQuery').focus()}
  function close(){overlay.classList.remove('show')}
  btn.addEventListener('click',open);
  overlay.querySelector('.sor-api-close').addEventListener('click',close);
  overlay.addEventListener('click',e=>{if(e.target===overlay)close()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});

  $('sorApiSave').addEventListener('click',()=>{
    const value={
      rapidApiKey:$('sorRapidKey').value.trim(),
      rapidApiHost:$('sorRapidHost').value.trim()||'real-time-amazon-data.p.rapidapi.com',
      amazonSearchQuery:$('sorAmazonQuery').value.trim()||'wireless headphones',
      amazonCountry:$('sorAmazonCountry').value.trim().toUpperCase()||'US',
      amazonLimit:Math.max(1,Math.min(50,Number($('sorAmazonLimit').value)||10)),
      customBaseUrl:$('sorCustomBase').value.trim(),
      customApiKey:$('sorCustomKey').value.trim(),
      customHeader:$('sorCustomHeader').value.trim()||'X-API-Key'
    };
    localStorage.setItem(STORAGE,JSON.stringify(value));
    window.SOR_API_SETTINGS=value;
    $('sorApiStatus').textContent='설정 저장 완료 · 검색 조건은 GitHub Actions와 같은 기준으로 사용할 수 있습니다.';
    setTimeout(close,900);
  });

  $('sorApiClear').addEventListener('click',()=>{
    localStorage.removeItem(STORAGE);
    window.SOR_API_SETTINGS={};
    ['sorRapidKey','sorRapidHost','sorAmazonQuery','sorAmazonCountry','sorAmazonLimit','sorCustomBase','sorCustomKey'].forEach(id=>$(id).value='');
    $('sorCustomHeader').value='X-API-Key';
    $('sorApiStatus').textContent='저장된 API 설정을 삭제했습니다.';
  });

  window.SOR_API_SETTINGS=saved;
})();
