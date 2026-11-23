/* Retain table semantics and labels as calculator/graph results change. */
(()=>{
 const clean=s=>(s||'').replace(/\s+/g,' ').trim();
 const put=(e,k,v)=>{if(e.getAttribute(k)!==String(v))e.setAttribute(k,v)};
 const observed=new WeakSet();let queued=false;
 const schedule=()=>{if(!queued){queued=true;requestAnimationFrame(()=>{queued=false;fit()})}};
 const resize=new ResizeObserver(schedule);
 function tableFit(table){
  const rows=[...table.rows],heads=rows.filter(r=>r.parentElement.tagName==='THEAD');
  const cols=Math.max(2,...rows.map(r=>[...r.cells].reduce((n,c)=>n+c.colSpan,0)));
  const labels=Array(cols).fill('');
  heads.forEach(r=>{let at=0;[...r.cells].forEach(c=>{for(let j=at;j<at+c.colSpan;j++)labels[j]=[labels[j],clean(c.textContent)].filter(Boolean).join(' / ');at+=c.colSpan})});
  put(table,'data-wq-table-columns',cols);put(table,'role','table');
  rows.forEach(row=>{put(row,'role','row');let at=0;const cells=[...row.cells];cells.forEach((cell,index)=>{
   const span=cell.colSpan,label=[...new Set(labels.slice(at,at+span).filter(Boolean))].join(' / ');at+=span;
   put(cell,'role',heads.includes(row)?'columnheader':cell.tagName==='TH'?'rowheader':'cell');
   if(heads.includes(row))return;
   if(cells.length===1&&span>=cols){put(row,'data-wq-table-section','true');return}
   if(label&&!(cols===2&&index===0))put(cell,'data-wq-column-label',label);
  })});
  const parent=table.parentElement;
  if(!['BODY','MAIN','SECTION','ARTICLE'].includes(parent.tagName))put(parent,'data-wq-table-container','true');
  table.classList.toggle('wq-fit-stack',window.innerWidth<=780||parent.clientWidth<cols*145);
  if(!observed.has(parent)){observed.add(parent);resize.observe(parent)}
 }
 function navFit(){
  document.querySelectorAll('.wq-model-nav-inner').forEach(inner=>{
   if(inner.querySelector('.wq-fit-nav-menu'))return;
   const links=inner.querySelector('.wq-model-links');if(!links)return;
   const menu=document.createElement('details');menu.className='wq-fit-nav-menu';
   const summary=document.createElement('summary');summary.textContent=inner.closest('.wq-industry-nav')?'Browse industries':'Browse models';menu.append(summary);links.before(menu);menu.append(links);links.removeAttribute('tabindex');
  });
  document.querySelectorAll('.wq-fit-nav-menu').forEach(menu=>{
   if(window.innerWidth>780&&!menu.open){menu.open=true;menu.dataset.desktopOpen='true'}
   if(window.innerWidth<=780&&menu.dataset.desktopOpen){menu.open=false;delete menu.dataset.desktopOpen}
  });
 }
 function fit(){document.querySelectorAll('table').forEach(tableFit);navFit()}
 function start(){fit();new MutationObserver(mutations=>{if(mutations.some(m=>m.target.closest?.('table')||[...m.addedNodes].some(n=>n.nodeType===1&&(n.matches('table,.wq-model-nav')||n.querySelector('table,.wq-model-nav')))))schedule()}).observe(document.body,{childList:true,subtree:true});window.addEventListener('resize',schedule,{passive:true});document.fonts?.ready.then(schedule)}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
