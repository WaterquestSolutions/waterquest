/* Carry the page and requested action into the existing verified Zoho review form. */
(function(){
 'use strict';
 const form=document.getElementById('engineering-review');
 if(!form)return;
 const q=new URLSearchParams(location.search),interest=q.get('interest'),from=q.get('from'),source=q.get('source');
 const message=document.getElementById('er-message');
 if(interest&&message&&!message.value){
  const clean=s=>String(s||'').replace(/[\r\n]/g,' ').slice(0,300);
  message.value='Enquiry: '+clean(interest)+'\n'+(from?'Source page: '+clean(from)+'\n':'')+(source?'Section: '+clean(source)+'\n':'')+'\nOperating requirements: ';
  message.dispatchEvent(new Event('input',{bubbles:true}));
 }
})();
