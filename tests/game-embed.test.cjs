const assert=require('node:assert/strict'),fs=require('node:fs'),{spawnSync}=require('node:child_process');
const player=fs.readFileSync('docs/player.html','utf8'),embed=fs.readFileSync('docs/player-embed.txt','utf8'),app=fs.readFileSync('docs/app.js','utf8');
assert(embed.includes('data-jeju-embedded="true"'));assert(embed.includes('class="embedded"'));assert(!embed.includes('src="site-nav.js'),'embedded game has no second site navigation');
const scripts=html=>[...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(m=>m[1]).filter(s=>!s.startsWith('site-nav.js'));
assert.deepEqual(scripts(embed),scripts(player),'editor and standalone game use identical dependency versions');
assert(embed.includes('player.js?v=game82r1'));assert(app.includes('player-embed.txt?v=separated89r1'));
for(const script of ['ambient-policy.js','garden-space.js','flower-hue.js','set-review-catalog.js','set-review-elements.js'])assert(embed.includes(script),script+' is available to current PNG projects');
for(const html of [player,embed]){
  const stack=[],voidTags=new Set(['meta','link','input','img','br','hr','source','wbr']);let controlsPath;
  for(const match of html.matchAll(/<(\/?)([a-z][a-z0-9]*)\b([^>]*)>/gi)){
    const [,closing,tag,attributes]=match,id=attributes.match(/\bid="([^"]+)"/)?.[1];
    if(closing){if(stack.at(-1)?.tag===tag)stack.pop();continue;}
    if(id==='atmosphereControls')controlsPath=[...stack];
    if(!voidTags.has(tag))stack.push({tag,id});
  }
  assert(controlsPath?.some(a=>a.id==='viewport'),'atmosphere controls remain inside the game viewport');
  assert(!controlsPath.some(a=>a.id==='stage'||a.tag==='header'),'controls stay outside flower touch coordinates and hidden embedded headers');
  assert(html.includes('<details id="atmosphereControls" class="atmosphere-controls">'),'controls are collapsed by default');assert(html.includes('<summary>분위기 조절</summary>'));assert(html.includes('게임 화면에 바로 적용됩니다.'));
  for(const [id,max,value,label]of [['atmosphereRichness',150,100,'입자 풍성함'],['atmosphereFocus',100,65,'입자 포커스 깊이'],['atmosphereWind',100,50,'바람·구름']]){
    const input=html.match(new RegExp('<input id="'+id+'"[^>]+>'))?.[0];assert(input,id+' range exists');
    for(const [name,expected]of [['type','range'],['min',0],['max',max],['value',value],['aria-describedby','atmosphereHint']])assert(input.includes(name+'="'+expected+'"'),id+' '+name);
    assert(html.includes('<label for="'+id+'">'+label+'</label>'));assert(html.includes('<output id="'+id+'Value" for="'+id+'">'+value+'%</output>'));
  }
  assert(html.includes('.atmosphere-controls summary:focus-visible'));assert(html.includes('@media(max-width:680px){.atmosphere-controls'));
}
const result=spawnSync('python',['build_player_embed.py','--check'],{encoding:'utf8'});assert.equal(result.status,0,result.stderr||result.stdout);
console.log('PASS: current game runtime/helper parity, embedded catalog, accessible collapsed atmosphere controls outside stage/header, matching range bounds/defaults and responsive styling, cache renewal and reproducible template.');
