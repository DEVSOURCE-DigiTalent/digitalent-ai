/* Readability pass for all twelve Employee prototype screens. */
(function(){
 const original=render;
 render=function(){
  original();
  document.querySelectorAll('main button,main a,main select,main input,main textarea').forEach(element=>{
   if(parseFloat(getComputedStyle(element).fontSize)<12)element.classList.add('qu-small-control');
  });
  document.querySelectorAll('main p,main small,main span,main strong,main b,main label,main li,main th,main em').forEach(element=>{
   if(!element.getClientRects().length||![...element.childNodes].some(node=>node.nodeType===3&&node.textContent.trim()))return;
   if(parseFloat(getComputedStyle(element).fontSize)<12)element.classList.add(element.tagName==='P'?'qu-small-paragraph':'qu-small-text');
  });
 };
 render();
})();
