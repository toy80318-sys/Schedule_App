const assert=require('node:assert/strict'),{harness,project,flower,object}=require('./game-interaction.test.cjs');
(async()=>{
 const h=harness(),rock={id:'fixed-rock',category:'basalt',src:'https://example.test/fixed-rock.png'},objects=[object('east-flower',flower.id),object('west-flower',flower.id,600),object('rock',rock.id,800)],p=project([flower,rock],objects),before=JSON.stringify(p);
 await h.api.load(p);h.api.setActive(true);const buttons=h.get('flowers').children,rockMatrix=h.ctx.draws.find(d=>d.source===rock.src).matrix,angles=[];
 for(let i=0;i<12;i++){h.step(1000);angles.push(buttons.map(b=>Number(b.dataset.sway)));assert.equal(h.api.state().activeBlooms,0);assert.equal(h.api.state().petals,0);assert.deepEqual(h.ctx.draws.find(d=>d.source===rock.src).matrix,rockMatrix);
  for(const d of h.ctx.draws.filter(d=>d.source===flower.preview)){const root=[d.matrix[4]+d.matrix[2]*40,d.matrix[5]+d.matrix[3]*40],o=objects[root[0]<550?0:1],angle=o.r*Math.PI/180;assert(Math.abs(root[0]-(o.x+50-Math.sin(angle)*40))<1e-8);assert(Math.abs(root[1]-(o.y+50+Math.cos(angle)*40))<1e-8);assert(Math.abs(Math.hypot(d.matrix[0],d.matrix[1])-1)<1e-8,'idle sway never scales or pulses the flower');}
 }
 assert(Math.max(...angles.flat().map(Math.abs))>2,'default idle sway is visible in the wide garden');assert(Math.max(...angles.flat().map(Math.abs))<4.5,'default breeze stays gentle');assert(angles.some(a=>Math.abs(a[0]-a[1])>.1),'different flowers use individual phases');assert.notDeepEqual(angles[0],angles[1],'motion starts before any hover or click');assert.equal(JSON.stringify(p),before);
 h.get('atmosphereWind').value='0';h.get('atmosphereWind').listeners.input();h.step(1000);assert(buttons.every(b=>Number(b.dataset.sway)===0));h.api.setActive(false);assert.equal(h.hasFrame(),false);
 const reduced=harness(true);await reduced.api.load(p);reduced.api.setActive(true);reduced.step(1000);assert(reduced.get('flowers').children.every(b=>b.dataset.sway==='0'));
 console.log('PASS:visible gentle default sway without touching,individual phases,fixed roots,no zoom,unchanged rocks/layout,wind stop,pause and reduced motion.');
})().catch(e=>{console.error(e);process.exitCode=1});
