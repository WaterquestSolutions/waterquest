(() => {'use strict';
// A disclosure stays under the reader's control even after resize.
for(const menu of document.querySelectorAll('.wq-fit-nav-menu')) {menu.open=false;delete menu.dataset.desktopOpen;}
for(const button of document.querySelectorAll('[data-eq-download]'))button.addEventListener('click',()=>{const record=document.getElementById(button.dataset.eqDownload);const url=URL.createObjectURL(new Blob([record.innerText],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='WaterQuest-'+location.pathname.split('/').filter(Boolean).pop()+'-worked-record.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
})();
