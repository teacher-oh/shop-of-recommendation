/* Adapt the existing category-card renderer to the detailed taxonomy. */
(function(){
  if(typeof CATEGORY_TREE==='undefined') return;
  Object.values(CATEGORY_TREE).forEach(root=>{
    Object.entries(root.children||{}).forEach(([key,node])=>{
      if(node && typeof node==='object'){
        const details=Object.values(node.children||{});
        node._detailLabels=details;
        root.children[key]=node.label + (details.length ? ' · '+details.join(' · ') : '');
      }
    });
  });
  if(typeof renderCategories==='function') renderCategories();
})();
