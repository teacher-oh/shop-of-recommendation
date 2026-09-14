/* Keep detailed taxonomy, make the UI readable, and repair the loading/category/score pipeline. */
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

  if(typeof window.productCard==='function'){
    const originalProductCard=window.productCard;
    window.productCard=function(p){
      return originalProductCard(p).replace(/loading=["']eager["']/i,'loading="lazy"');
    };
  }

  // v2 is deliberately loaded after app.js so it can audit the actual loaded catalog.
  if(!document.querySelector('script[data-sor-category-audit]')){
    const s=document.createElement('script');
    s.src='category-audit-v2.js';
    s.dataset.sorCategoryAudit='1';
    document.body.appendChild(s);
  }

  if(!document.querySelector('script[data-sor-score-ui]')){
    const s=document.createElement('script');
    s.src='score-ui.js';
    s.dataset.sorScoreUi='1';
    document.body.appendChild(s);
  }

  if(!document.querySelector('script[data-sor-api-settings]')){
    const s=document.createElement('script');
    s.src='api-settings.js';
    s.dataset.sorApiSettings='1';
    document.body.appendChild(s);
  }
})();
