const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const dimensions={};
const files={batter:'batter-v3',pitcher:'pitcher-front'};
for(const kind of ['batter','pitcher']){
  const data=fs.readFileSync(`assets/players/${files[kind]}.png`);
  assert.equal(data.subarray(1,4).toString(),'PNG');
  dimensions[kind]=[data.readUInt32BE(16),data.readUInt32BE(20)];
}
const sandbox={Image:class{
  set src(value){this.kind=value.includes('batter')?'batter':'pitcher';[this.naturalWidth,this.naturalHeight]=dimensions[this.kind];this.complete=true;}
},mulberry32:()=>()=>.5};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('src/games.js','utf8')+'\nthis.motion={pitcherFrame,batterFrame,drawPlayerFrame,drawBatterBat,pitchPos,RELEASE,PLAYER_LAYOUT,CONTACT_MS,WINDUP_MS,fieldPoint,BOX_WORLD,BATTER_BOXES,ZONE};',sandbox);
const m=sandbox.motion;
const frames=[];
for(let now=0;now<m.WINDUP_MS;now+=5)frames.push(m.pitcherFrame({phase:'windup'},now,now/m.WINDUP_MS));
for(let delta=0;delta<500;delta+=5)frames.push(m.pitcherFrame({phase:'pitch',t0:m.WINDUP_MS},m.WINDUP_MS+delta,0));
assert.deepEqual([...new Set(frames)],Array.from({length:24},(_,i)=>i),'Every delivery pose must be shown in sequence');
assert.equal(m.pitcherFrame({phase:'pitch',t0:1000},1000,0),m.PLAYER_LAYOUT.pitcher.releaseFrame,'Release frame must coincide with ball launch');
assert.equal(m.pitcherFrame({phase:'result'},2000,0),23,'Hold finish after release');
assert.equal(m.pitcherFrame({phase:'idle'},2000,0),0,'Reset before next delivery');
assert.equal(m.batterFrame({phase:'pitch',swung:true,swingT:1000},1000+m.CONTACT_MS-1,0),5);
assert.equal(m.batterFrame({phase:'pitch',swung:true,swingT:1000},1000+m.CONTACT_MS,0),6,'Contact picture must coincide with contact calculation');
const plantedLegs=[];
for(const [kind,layout] of Object.entries(m.PLAYER_LAYOUT)){
  for(let frame=0;frame<layout.count;frame++){
    const calls=[];const c={save(){},restore(){},beginPath(){},rect(){},clip(){},drawImage(...args){calls.push(args);}};
    m.drawPlayerFrame(c,kind,frame);
    assert.equal(calls.length,kind==='batter'&&frame<=6?12:1);
    if(kind==='batter'&&frame<=6)plantedLegs.push(calls[0].slice(1));
    for(const [art,x,y,w,h] of calls)assert(x>=0&&y>=0&&x+w<=art.naturalWidth&&y+h<=art.naturalHeight,'Crop must stay in atlas');
  }
}
for(const legs of plantedLegs)assert.deepEqual(legs,plantedLegs[0],'Feet must remain at exactly the same position during load and contact');
// Shoe sole extremities measured in the ready sprite; this lower body is held
// through contact. Compare them against the projected ground rectangle.
const layout=m.PLAYER_LAYOUT.batter;
for(const [sx,sy] of [[126,344],[187,350],[177,307],[220,312]]){
  const x=layout.base.x+(sx-layout.anchor[0])*layout.scale;
  const y=layout.base.y+(sy-layout.anchor[1])*layout.scale;
  const polygon=m.BATTER_BOXES[0];
  const sides=polygon.map((a,i)=>{const b=polygon[(i+1)%polygon.length];return (b.x-a.x)*(y-a.y)-(b.y-a.y)*(x-a.x);});
  assert(sides.every(v=>v>=0)||sides.every(v=>v<=0),'Both shoe soles must be inside the batter box through contact');
}
assert(Math.abs((m.BOX_WORLD.outer-m.BOX_WORLD.inner)-1.2192)<1e-9);
assert(Math.abs((m.BOX_WORLD.front-m.BOX_WORLD.back)-1.8288)<1e-9);
const plateL=m.fieldPoint(-.2159,.2159),plateR=m.fieldPoint(.2159,.2159);
assert.equal(m.ZONE.x,plateL.x);
assert.equal(m.ZONE.w,plateR.x-plateL.x,'Strike zone must align with plate width in the same camera');
assert(m.PLAYER_LAYOUT.pitcher.order.every(frame=>![5,6,7,8,19,20].includes(frame)),'Reject side-camera source poses');
const target={tx:400,ty:323,bx:0,by:14};
const start=m.pitchPos(target,0),end=m.pitchPos(target,1);
assert(Math.abs(start.x-m.RELEASE.x)<1e-8&&Math.abs(start.y-m.RELEASE.y)<1e-8);
assert(Math.abs(end.x-target.tx)<1e-8&&Math.abs(end.y-target.ty)<1e-8);
console.log('PASS: shoe soles inside projected batter box, plate/zone alignment, planted batting feet, excluded profile poses, release/contact timing, 24 timeline steps, all atlas crops, pitch endpoints.');
