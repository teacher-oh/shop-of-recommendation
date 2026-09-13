/* Keep detailed taxonomy, but make category labels short and scannable. */
(function(){
  if(typeof CATEGORY_TREE==='undefined') return;
  Object.values(CATEGORY_TREE).forEach(root=>{
    Object.entries(root.children||{}).forEach(([key,node])=>{
      if(node && typeof node==='object'){
        const details=Object.values(node.children||{}).map(String);
        node._detailLabels=details;
        // Show only the middle category in the main card.
        // Detailed leaf names stay in the classification data used for comparison.
        root.children[key]=node.label;
      }
    });
  });
  if(typeof renderCategories==='function') renderCategories();
})();
