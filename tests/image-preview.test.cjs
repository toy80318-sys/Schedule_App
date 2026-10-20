const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const script = fs.readFileSync(require('node:path').join(__dirname, '../docs/image-preview.js'), 'utf8');
const listeners = {};
function element(tag, attrs = {}) {
  return {tagName:tag, attrs, style:{}, dataset:{}, hidden:false,
    getAttribute(key){return this.attrs[key] || null},
    setAttribute(key,value){this.attrs[key]=value},
    removeAttribute(key){delete this[key]},
    addEventListener(key,fn){this.events ||= {};this.events[key]=fn},
    closest(selector){return selector==='a' ? this.link : this.dataset.imagePreview!==undefined ? this : null},
    matches(){return this.dataset.imagePreview!==undefined},
    getBoundingClientRect(){return {width:160,height:160}}
  };
}
const imageTarget=element('IMG',{alt:'아침 봉오리'});
imageTarget.currentSrc='https://example.test/preview.webp';
imageTarget.link={protocol:'https:',href:'https://example.test/original.png'};
const tile=element('DIV',{'aria-label':'코발트 수국 만개'});
const title=element('H2'), image=element('IMG'), sprite=element('DIV'), button=element('BUTTON');
let dialog;
const document={head:{append(){}},body:{style:{overflow:'auto'},append(value){dialog=value}},
  getElementById(){return dialog},
  createElement(tag){
    const value=element(tag.toUpperCase());
    if(tag==='dialog') Object.assign(value,{
      querySelector(selector){return {h2:title,img:image,'.preview-sprite':sprite,button}[selector]},
      showModal(){this.open=true},close(){this.open=false;this.events.close()}
    });
    return value;
  },
  querySelectorAll(){return [imageTarget,tile]},
  addEventListener(type,handler){listeners[type]=handler}
};
const css={backgroundImage:'url("flower-sheet.webp")',backgroundPosition:'100% 0%',backgroundSize:'200% 200%',backgroundColor:'transparent',filter:'saturate(1.2)'};
const context={document,getComputedStyle(){return css}};
vm.runInNewContext(script,context);
function click(target,extras={}) {
  let prevented=false;
  listeners.click({target,preventDefault(){prevented=true},...extras});
  return prevented;
}
assert.equal(imageTarget.tabIndex,0);
assert.equal(click(imageTarget),true);
assert.equal(dialog.open,true);
assert.equal(image.src,imageTarget.link.href);
assert.equal(title.textContent,'아침 봉오리');
assert.equal(document.body.style.overflow,'hidden');
button.events.click();
assert.equal(dialog.open,false);
assert.equal(document.body.style.overflow,'auto');
assert.equal(image.src,undefined);
click(tile);
assert.equal(sprite.hidden,false);
assert.equal(image.hidden,true);
assert.equal(sprite.style.backgroundPosition,'100% 0%');
assert.equal(sprite.style.backgroundSize,'200% 200%');
assert.equal(sprite.style.filter,'saturate(1.2)');
dialog.events.click({target:dialog});
assert.equal(dialog.open,false);
assert.equal(click(imageTarget,{ctrlKey:true}),false);
assert.equal(dialog.open,false);
assert.equal(click({closest(){return null}}),false); // Separate download text keeps its normal action.
let keyPrevented=false;
listeners.keydown({key:'Enter',target:tile,preventDefault(){keyPrevented=true}});
assert.equal(keyPrevented,true);
assert.equal(dialog.open,true);
const previous=dialog;
vm.runInNewContext(script,context);
assert.equal(dialog,previous);
console.log('PASS: PNG original, sprite quadrant/filter, keyboard, close/scroll restore, download text, modified clicks, single dialog');
