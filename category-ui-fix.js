/* Keep detailed taxonomy, make the UI readable, and repair the loading/score pipeline. */
(function(){
  if(typeof CATEGORY_TREE==='undefined') return;

  Object.values(CATEGORY_TREE).forEach(root=>{
    Object.entries(root.children||{}).forEach(([key,node])=>{
      if(node && typeof node==='object'){
        const details=Object.values(node.children||{}).map(String);
        node._detailLabels=details;
        root.children[key]=node.label;
      }
    });
  });

  if(typeof renderCategories==='function') renderCategories();

  // The catalog renderer originally requested every product image eagerly.
  // 804 products can therefore create hundreds of simultaneous image requests.
  // Keep all products, but make their images lazy so the catalog itself becomes usable first.
  if(typeof window.productCard==='function'){
    const originalProductCard=window.productCard;
    window.productCard=function(p){
      return originalProductCard(p).replace(/loading=["']eager["']/i,'loading="lazy"');
    };
  }

  // score.js is the calculation engine; score-ui.js only paints its result.
  // Restore the display layer without bringing back the body-wide MutationObserver.
  if(!document.querySelector('script[data-sor-score-ui]')){
    const s=document.createElement('script');
    s.src='score-ui.js';
    s.dataset.sorScoreUi='1';
    document.body.appendChild(s);
  }

  // Add the browser-only API credential/settings panel.
  if(!document.querySelector('script[data-sor-api-settings]')){
    const s=document.createElement('script');
    s.src='api-settings.js';
    s.dataset.sorApiSettings='1';
    document.body.appendChild(s);
  }
})();
