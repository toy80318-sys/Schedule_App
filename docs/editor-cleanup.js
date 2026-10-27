(()=>{'use strict';const E=window.jejuEditor;if(!E)return;E.ready.then(()=>{
 const old=document.getElementById('whole62-scenes');if(old){const parent=old.closest('details');if(parent)parent.hidden=true;else old.hidden=true;}
 const bar=document.querySelector('.palbar');for(const tab of ['latest','flowers','decor','atmosphere85']){const button=bar.querySelector('[data-tab="'+tab+'"]');if(button)bar.append(button);}const more=bar.querySelector('a[href^="atmosphere-loops"]');if(more)more.hidden=true;document.getElementById('openFinalCatalog').textContent='PNG 원본 보기';
 const toolbar=document.getElementById('sourceDownloadToolbar'),archive=[...toolbar.querySelectorAll('button')].find(b=>b.textContent.startsWith('전체 원본'));if(archive){const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent='이전 원본';details.append(summary,archive);toolbar.append(details);}
 });})();
