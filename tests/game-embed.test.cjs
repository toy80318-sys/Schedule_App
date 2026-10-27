const assert=require('node:assert/strict'),fs=require('node:fs'),{spawnSync}=require('node:child_process');
const player=fs.readFileSync('docs/player.html','utf8'),embed=fs.readFileSync('docs/player-embed.txt','utf8'),app=fs.readFileSync('docs/app.js','utf8');
assert(embed.includes('data-jeju-embedded="true"'));assert(embed.includes('class="embedded"'));assert(!embed.includes('src="site-nav.js'),'embedded game has no second site navigation');
const scripts=html=>[...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(m=>m[1]).filter(s=>!s.startsWith('site-nav.js'));
assert.deepEqual(scripts(embed),scripts(player),'editor and standalone game use identical dependency versions');
assert(embed.includes('player.js?v=game81'));assert(app.includes('player-embed.txt?v=game81'));
for(const script of ['ambient-policy.js','garden-space.js','flower-hue.js','set-review-catalog.js','set-review-elements.js'])assert(embed.includes(script),script+' is available to current PNG projects');
const result=spawnSync('python',['build_player_embed.py','--check'],{encoding:'utf8'});assert.equal(result.status,0,result.stderr||result.stdout);
console.log('PASS: current game runtime/helper parity, embedded layout and current PNG catalog, cache renewal and reproducible template.');
