/* Browser-only API credential settings.
   Keys are stored only in this browser's localStorage and are NOT written to GitHub.
   Do not use this UI for secrets that must remain server-side: GitHub Pages is public. */
(function(){
  const STORAGE='sor_api_settings_v1';
  const saved=(()=>{try{return JSON.parse(localStorage.getItem(STORAGE)||'{}')}catch(e){return {}}})();

  const style=document.createElement('style');
  style.textContent=`
    .sor-api-btn{margin-left:10px;padding:9px 13px;border:1px solid rgba(255,255,255,.14);border-radius:10px;background:#17191f;color:#fff;font:700 13px/1 Noto Sans KR,Inter,sans-serif;cursor:pointer}
    .sor-api-btn:hover{transform:translateY(-1px);background:#20232b}
    .sor-api-overlay{position:fixed;inset:0;z-index:3000;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.68)}
    .sor-api-overlay.show{display:flex}
    .sor-api-card{width:min(680px,100%);max-height:90vh;overflow:auto;border:1px solid rgba(255,255,255,.12);border-radius:20px;background:#111318;color:#fff;box-shadow:0 30px 80px rgba(0,0,0,.45);padding:24px}
    .sor-api-head{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:18px}
    .sor-api-head h2{margin:0;font-size:22px}.sor-api-close{border:0;background:transparent;color:#aaa;font-size:28px;cursor:pointer}
    .sor-api-note{padding:12px 14px;margin:0 0 18px;border-radius:12px;background:rgba(255,193,7,.09);border:1px solid rgba(255,193,7,.2);color:#ddd;font-size:13px;line-height:1.6}
    .sor-api-section{margin-top:18px;padding-top:18px;border-top:1px solid rgba(255,255,255,.08)}
    .sor-api-section h3{margin:0 0 12px;font-size:15px}.sor-api-field{display:grid;gap:7px;margin:11px 0}.sor-api-field label{font-size:12px;color:#aaa;font-weight:700}.sor-api-field input{width:100%;box-sizing:border-box;padding:11px 12px;border:1px solid rgba(255,255,255,.13);border-radius:10px;background:#0b0d11;color:#fff;outline:none}.sor-api-field input:focus{border-color:rgba(255,255,255,.35)}
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
      <div class="sor-api-note"><b>중요:</b> GitHub Pages는 공개 사이트라 브라우저에 입력한 API 키는 완전한 비밀로 보호되지 않습니다. 이 창의 키는 GitHub에 저장하지 않고 <b>현재 브라우저의 localStorage</b>에만 저장합니다. 실제 서비스용 비밀키는 나중에 서버/환경변수 방식으로 옮기는 게 안전합니다.</div>
      <div class="sor-api-section">
        <h3>RapidAPI</h3>
        <div class="sor-api-field"><label>RapidAPI Key</label><input id="sorRapidKey" type="password" autocomplete="off" placeholder="X-RapidAPI-Key 값"></div>
        <div class="sor-api-field"><label>RapidAPI Host</label><input id="sorRapidHost" type="text" autocomplete="off" placeholder="예: example-api.p.rapidapi.com"></div>
      </div>
      <div class="sor-api-section">
        <h3>일반 API · 필요할 때만</h3>
        <div class="sor-api-field"><label>API Base URL</label><input id="sorCustomBase" type="url" autocomplete="off" placeholder="https://api.example.com"></div>
        <div class="sor-api-field"><label>API Key</label><input id="sorCustomKey" type="password" autocomplete="off" placeholder="API 키"></div>
        <div class="sor-api-field"><label>Key Header 이름</label><input id="sorCustomHeader" type="text" autocomplete="off" placeholder="예: X-API-Key"></div>
      </div>
      <div class="sor-api-actions"><button class="sor-api-clear" id="sorApiClear" type="button">저장값 삭제</button><button class="sor-api-save" id="sorApiSave" type="button">저장하기</button></div>
      <div class="sor-api-status" id="sorApiStatus"></div>
    </div>`;
  document.body.appendChild(overlay);

  const $=id=>document.getElementById(id);
  $('sorRapidKey').value=saved.rapidApiKey||'';
  $('sorRapidHost').value=saved.rapidApiHost||'';
  $('sorCustomBase').value=saved.customBaseUrl||'';
  $('sorCustomKey').value=saved.customApiKey||'';
  $('sorCustomHeader').value=saved.customHeader||'X-API-Key';

  function open(){overlay.classList.add('show');$('sorRapidKey').focus()}
  function close(){overlay.classList.remove('show')}
  btn.addEventListener('click',open);
  overlay.querySelector('.sor-api-close').addEventListener('click',close);
  overlay.addEventListener('click',e=>{if(e.target===overlay)close()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});

  $('sorApiSave').addEventListener('click',()=>{
    const value={
      rapidApiKey:$('sorRapidKey').value.trim(),
      rapidApiHost:$('sorRapidHost').value.trim(),
      customBaseUrl:$('sorCustomBase').value.trim(),
      customApiKey:$('sorCustomKey').value.trim(),
      customHeader:$('sorCustomHeader').value.trim()||'X-API-Key'
    };
    localStorage.setItem(STORAGE,JSON.stringify(value));
    window.SOR_API_SETTINGS=value;
    $('sorApiStatus').textContent='저장 완료 · 이 브라우저에서만 사용됩니다.';
    setTimeout(close,700);
  });

  $('sorApiClear').addEventListener('click',()=>{
    localStorage.removeItem(STORAGE);
    window.SOR_API_SETTINGS={};
    ['sorRapidKey','sorRapidHost','sorCustomBase','sorCustomKey'].forEach(id=>$(id).value='');
    $('sorCustomHeader').value='X-API-Key';
    $('sorApiStatus').textContent='저장된 API 설정을 삭제했습니다.';
  });

  window.SOR_API_SETTINGS=saved;
})();
