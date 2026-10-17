/* Strict ID smoke check; unlike verify.cjs, unknown DOM IDs return null.
 * This is not a browser, layout engine, or animation renderer. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8'),script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const nodes=new Map(),timers=new Map();let timer=0,document;
function register(markup){for(const m of markup.matchAll(/\bid="([^"]+)"/g))if(!nodes.has(m[1]))nodes.set(m[1],makeNode(m[1]));}
function makeNode(id){let content='';return {id,value:'',textContent:'',dataset:{},style:{},hidden:false,open:false,disabled:false,isConnected:true,attributes:{},handlers:{},classList:{toggle(){}},get innerHTML(){return content;},set innerHTML(v){content=String(v);register(content);},setAttribute(k,v){this.attributes[k]=String(v);},addEventListener(k,f){this.handlers[k]=f;},getClientRects(){return[1];},scrollIntoView(){},focus(){document.activeElement=this;},showModal(){this.open=true;},close(){this.open=false;this.handlers.close?.();},querySelectorAll(){return[];}};}
register(html.split('<script>')[0]);
document={activeElement:null,querySelector(selector){if(!selector.startsWith('#'))throw Error('Unsupported strict selector: '+selector);return nodes.get(selector.slice(1))||null;},querySelectorAll(){return[];},addEventListener(){}};
const context=vm.createContext({document,console,performance:{now:()=>0},location:{protocol:'http:',origin:'http://127.0.0.1:4173'},setTimeout(fn){timers.set(++timer,fn);return timer;},clearTimeout(id){timers.delete(id);}});
vm.runInContext(script,context);
assert.equal([...nodes.keys()].filter(id=>/^film-fan-\d+$/.test(id)).length,224);
assert.equal([...nodes.keys()].filter(id=>/^film-point-\d+$/.test(id)).length,36);
vm.runInContext("setWalkRoom('stands');setYear(1997);setWalkRoom('scoreboard');startFilm();pauseFilm();setYear(2026);setWalkRoom('cinema');selectVideo('JGF6c3aegWk');setWalkRoom('stands')",context);
assert.ok(nodes.get('film-hud-average').textContent==='—');
assert.equal(vm.runInContext('selectedVideo',context),null);
console.log('PASS: strict DOM ID bootstrap and scene / data-film smoke checks. Browser layout is not covered.');
