/* ============================================================
   球場體驗館：打擊、投球、主審、線審、壘審
   每個遊戲是一張 800×450 的 canvas。速度與動畫為示意，規則依一般棒球規則簡化。
   ============================================================ */
const GW = 800, GH = 450;
const FIELD_CAMERA={cx:400,horizon:146,focal:709,height:2.24,behindPlate:6};
// 公尺座標：本壘後尖點為原點，z 軸朝向二壘；所有地面標線共用此投影。
function fieldPoint(x,z,height=0){
  const scale=FIELD_CAMERA.focal/(z+FIELD_CAMERA.behindPlate);
  return {x:FIELD_CAMERA.cx+x*scale,y:FIELD_CAMERA.horizon+(FIELD_CAMERA.height-height)*scale};
}
const BOX_WORLD={inner:.2159+.1524,outer:.2159+.1524+1.2192,back:.2159-.9144,front:.2159+.9144};
const BATTER_BOXES=[-1,1].map(side=>[[side*BOX_WORLD.inner,BOX_WORLD.back],[side*BOX_WORLD.outer,BOX_WORLD.back],[side*BOX_WORLD.outer,BOX_WORLD.front],[side*BOX_WORLD.inner,BOX_WORLD.front]].map(([x,z])=>fieldPoint(x,z)));
const plateFront=fieldPoint(0,.4318),plateLeft=fieldPoint(-.2159,.2159),plateRight=fieldPoint(.2159,.2159);
const zoneTop=fieldPoint(0,.2159,1.02),zoneBottom=fieldPoint(0,.2159,.45);
const ZONE = {x:plateLeft.x,y:zoneTop.y,w:plateRight.x-plateLeft.x,h:zoneBottom.y-zoneTop.y};
const BALL_R = 5.3;
const PITCHES = {
  fb:{name:'四縫線直球', en:'FOUR-SEAM', color:'#e4bd79', kmh:[140,152], bx:0, by:14, err:9, desc:'用速度壓縮打者的反應時間，球路最接近直線。'},
  sl:{name:'滑球', en:'SLIDER', color:'#86b9d3', kmh:[125,136], bx:-170, by:65, err:13, desc:'向投手手套側橫移，伴隨下沉，讓打者追著偏離的球路揮棒。'},
  cb:{name:'曲球', en:'CURVEBALL', color:'#c4a3dd', kmh:[108,120], bx:-28, by:230, err:15, desc:'弧線較大、下墜明顯，用高低差打亂打者的判斷。'},
  ch:{name:'變速球', en:'CHANGEUP', color:'#8dc5af', kmh:[120,130], bx:95, by:110, err:11, desc:'以近似直球的出手搭配較慢球速，往投手臂側偏移並下沉。'},
  si:{name:'伸卡球',en:'SINKER',color:'#d9a779',kmh:[135,147],bx:120,by:80,err:11,desc:'速球系的臂側尾勁，帶有下沉；觀察它與四縫線直球的差異。'},
  ct:{name:'卡特球',en:'CUTTER',color:'#eaa4a1',kmh:[134,146],bx:-85,by:25,err:10,late:true,desc:'球速接近直球，後段往手套側小幅切動，橫移比滑球短。'},
  fs:{name:'指叉球',en:'SPLITTER',color:'#a8b9e6',kmh:[125,138],bx:12,by:205,err:15,late:true,desc:'此處採快速指叉球的示意：前段像直球，靠近本壘時明顯下墜。'},
  sv:{name:'滑曲球',en:'SLURVE',color:'#d4a6cb',kmh:[117,129],bx:-140,by:155,err:14,desc:'介於滑球與曲球之間，往手套側斜向下墜，兼具橫移與高低差。'}
};
const PITCH_GUIDE = {
  fb:{grip:'食指與中指分開，橫跨馬蹄形縫線；拇指托在球的下方。', focus:'兩指橫跨縫線', spin:'以後旋為主', read:'看球速與出手節奏。高位置的直球容易讓揮棒跟不上。', source:'https://www.mlb.com/glossary/pitch-types/four-seam-fastball'},
  sl:{grip:'此處示範常見雙指握法：食指與中指靠攏、偏向球的一側，中指沿著縫線，拇指在下方支撐。', focus:'雙指靠攏、偏側握球', spin:'側向與陀螺旋轉的比例依投手而異', read:'留意後段的橫向偏移；不要只追著出手時的方向揮棒。', source:'https://drivelinebaseball.com/blogs/blog/how-to-throw-a-slider'},
  cb:{grip:'此處示範傳統雙指曲球：中指沿縫線，食指靠在旁邊輔助，拇指在球的下方支撐。', focus:'中指沿縫線施力', spin:'以前旋產生明顯下墜', read:'球速較慢、弧線較高。多等一下，觀察它掉進好球帶的位置。', source:'https://help.drivelinebaseball.com/portal/en/kb/articles/pitch-grips-curveballs-27-1-2022'},
  ch:{grip:'此處示範圈指變速球：拇指和食指圍成圈，中指與無名指放在球上，小指輔助支撐，握球較深。', focus:'拇指、食指成圈', spin:'旋轉與尾勁依握法而異', read:'不要被像直球的出手騙到。利用球速落差，練習把揮棒時間延後。', source:'https://drivelinebaseball.com/blogs/blog/how-to-throw-a-changeup'},
  si:{grip:'示範常見二縫線握法：食指與中指順著相鄰的兩條縫線，拇指在下方支撐。球路也受出手方式影響，並非只有一種握法。',focus:'兩指沿著相鄰縫線',spin:'帶臂側位移的速球旋轉；下沉與橫移幅度依投手而異',read:'與四縫線直球相比，多留意往投手臂側跑、並向下沉的尾勁。',source:'https://drivelinebaseball.com/blogs/blog/how-to-throw-a-sinker-or-two-seam-fastball'},
  ct:{grip:'以四縫線握法為基礎，食指與中指靠攏，握球略偏向小指側；拇指在下方，無名指輕靠球側。',focus:'兩指靠攏、略偏一側',spin:'以後旋搭配偏轉的旋轉軸，產生短距離的手套側位移',read:'它比滑球快、切動較短。留意接近本壘時才出現的小幅橫移。',source:'https://drivelinebaseball.com/blogs/blog/how-to-throw-a-cutter'},
  fs:{grip:'示範快速指叉球：食指與中指張開，讓球置於兩指之間，拇指在下方托住。各投手的指距與握球深度不同。',focus:'食指、中指分開夾住球',spin:'旋轉通常比速球少，主要特徵是下墜；也可能帶有側向位移',read:'先看它是否沿直球軌道進壘，再觀察後段的下墜，別急著追低球。',source:'https://help.drivelinebaseball.com/portal/en/kb/articles/pitch-grips-splitters'},
  sv:{grip:'滑曲球沒有單一標準握法。圖中示範曲球／滑球系的一種握法：中指沿縫線，食指靠旁輔助，拇指托在另一側下方。',focus:'滑球與曲球之間的一種握法',spin:'旋轉軸介於滑球與曲球之間，形成斜向下墜',read:'與橫移較強的滑球、縱向落差較大的曲球比較，觀察介於兩者之間的斜向球路。',source:'https://www.mlb.com/glossary/pitch-types/slurve'}
};
const rnd = (a, b) => a + Math.random() * (b - a);
const clamp01 = v => Math.max(0, Math.min(1, v));
const gameRun = {raf:0, cleanup:[]};
const CONTACT_MS = 140;
const WINDUP_MS = 720;
const RELEASE = {x:376, y:145};
const PLAYER_LAYOUT = {
  pitcher:{columns:6,rows:4,count:24,anchor:[144,248],scale:.25,base:{x:400,y:205},releaseFrame:13,
    order:[0,1,2,3,4,4,4,3,9,10,11,12,13,15,14,16,17,18,18,21,21,22,23,23]},
  batter:{columns:4,rows:3,count:12,anchor:[192,354],scale:.78,base:{x:255,y:442},
    anchors:[[192,354],[192,354],[192,354],[182,354],[170,354],[176,354],[164,354],[164,354],[164,354],[174,354],[174,354],[174,354]]}
};
const PLAYER_ART = Object.fromEntries(Object.entries({batter:'{{PLAYER:batter-v3}}',pitcher:'{{PLAYER:pitcher-front}}'}).map(([id,src])=>{const image=new Image();image.src=src;return [id,image];}));
const BAT_HANDS=[[168,90],[164,100],[158,104],[165,118],[220,132],[230,140],[236,147],[132,91],[161,59],[160,60],[158,60],[194,54]];
const BAT_ANGLES=[-115,-115,-115,-110,-105,-55,25,205,210,210,210,210];

function stopGame(){
  cancelAnimationFrame(gameRun.raf);
  gameRun.cleanup.forEach(f => f());
  gameRun.cleanup = [];
}
function gameLoop(draw){
  cancelAnimationFrame(gameRun.raf);
  const step = now => { draw(now); gameRun.raf = requestAnimationFrame(step); };
  gameRun.raf = requestAnimationFrame(step);
}
function gameKeys(fn){
  const h = e => { if (e.target.closest('input, textarea, select, dialog.sheet, .pitch-book') || $('#sheet').open || document.querySelector('.pitch-book[open]')) return; fn(e); };
  document.addEventListener('keydown', h);
  gameRun.cleanup.push(() => document.removeEventListener('keydown', h));
}

function pitchPickerHTML(batting=false){
  const entries=Object.entries(PITCHES),pages=[];
  for(let page=0;page<Math.ceil(entries.length/4);page++){
    const buttons=entries.slice(page*4,page*4+4).map(([id,p],i)=>`<button type="button" class="chip" ${batting?'data-bat-type':'data-pt'}="${id}" aria-pressed="${!batting&&id==='fb'}">${batting?'':`<b>${page*4+i+1}</b> `}${p.name}<small>${p.en}</small></button>`).join('');
    pages.push(`<div class="pitch-types" data-pitch-set="${page}" role="group" aria-label="${batting?'練習':'投球'}球種第 ${page+1} 頁"${page?' hidden':''}>${batting?'<button type="button" class="chip" data-bat-type="mix" aria-pressed="true">隨機配球<small>MIX · 全部球種</small></button>':''}${buttons}</div>`);
  }
  return `<div class="pitch-picker" data-pitch-page="0"><div class="pitch-picker-head"><p class="lab-eyebrow">${batting?'練習球種':'選擇球種'}</p><div class="pitch-picker-pages"><button type="button" data-pitch-step="-1" aria-label="上一頁球種" disabled>‹</button><span class="pitch-picker-count">1 / ${pages.length}</span><button type="button" data-pitch-step="1" aria-label="下一頁球種">›</button></div></div>${pages.join('')}</div>`;
}
function showPitchPage(picker,page){
  const sets=$$('[data-pitch-set]',picker);page=Math.max(0,Math.min(page,sets.length-1));
  picker.dataset.pitchPage=page;
  sets.forEach((set,i)=>set.hidden=i!==page);
  $('.pitch-picker-count',picker).textContent=`${page+1} / ${sets.length}`;
  $('[data-pitch-step="-1"]',picker).disabled=page===0;
  $('[data-pitch-step="1"]',picker).disabled=page===sets.length-1;
}

function gameUI(host, {aria, learn}){
  host.innerHTML = `<div class="game">
    <div class="game-workspace"><div class="game-field">
    <div class="game-top"><div class="game-hud" id="g-hud"></div><div class="game-tip" id="g-tip" role="status"></div></div>
    <div class="game-stage"><canvas id="g-canvas" aria-label="${aria}"></canvas></div>
    <div class="game-flash" id="g-flash" aria-live="polite"></div></div>
    <aside class="game-sidebar" aria-label="體驗操作"><div class="game-controls" id="g-controls"></div><div class="game-reader"></div></aside></div></div>`;
  const canvas = $('#g-canvas', host), ctx = canvas.getContext('2d');
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = GW * dpr; canvas.height = GH * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  let flashTimer;
  $('.game',host).addEventListener('click',e=>{
    const step=e.target.closest('[data-pitch-step]');if(!step)return;
    const picker=step.closest('.pitch-picker');showPitchPage(picker,Number(picker.dataset.pitchPage)+Number(step.dataset.pitchStep));
  });
  gameRun.cleanup.push(() => clearTimeout(flashTimer));
  const stage=canvas.parentElement;
  const fitCanvas=()=>{
    const width=Math.max(1,Math.min(stage.clientWidth,stage.clientHeight*GW/GH));
    canvas.style.width=width+'px';canvas.style.height=width*GH/GW+'px';
  };
  const sizeObserver=new ResizeObserver(fitCanvas);sizeObserver.observe(stage);
  gameRun.cleanup.push(()=>sizeObserver.disconnect());
  // Wait until the mode has installed its controls, then collect secondary content.
  let disposed=false;
  queueMicrotask(()=>{if(!disposed)installGameSidebar(host,learn);});
  gameRun.cleanup.push(()=>{disposed=true;});
  return {
    canvas, ctx,
    hud: $('#g-hud', host), tip: $('#g-tip', host), controls: $('#g-controls', host),
    flash(text, kind = '', ms = 1400){
      const f = $('#g-flash', host);
      f.className = 'game-flash show ' + kind;
      f.textContent = text;
      clearTimeout(flashTimer);
      if (ms) flashTimer = setTimeout(() => f.classList.remove('show'), ms);
    },
    // 把滑鼠／觸控座標換算成 800×450 的畫面座標
    point(e){ const r = canvas.getBoundingClientRect(); return {x:(e.clientX - r.left) / r.width * GW, y:(e.clientY - r.top) / r.height * GH}; }
  };
}

// A fixed reading area with measured text pages; long copy never extends the game.
function gameReader(root, sections){
  root.innerHTML='<nav class="game-reader-tabs" aria-label="切換說明"></nav><div class="game-reader-content"></div><div class="game-reader-pages"><button type="button" data-read-step="-1" aria-label="上一頁">‹</button><span></span><button type="button" data-read-step="1" aria-label="下一頁">›</button></div>';
  const tabs=$('.game-reader-tabs',root),box=$('.game-reader-content',root),nav=$('.game-reader-pages',root);
  tabs.innerHTML=sections.map(s=>`<button type="button" data-read-tab="${s.id}" aria-pressed="false">${s.label}</button>`).join('');
  let active=sections[0].id,index=0;
  const render=()=>{
    const section=sections.find(s=>s.id===active);
    const pages=[];
    for(const item of section.read()){
      if(item.text){
        const probe=document.createElement('p');probe.className='game-reader-copy';box.replaceChildren(probe);
        const chunks=eraTextPages(item.text,text=>{probe.textContent=text;return probe.scrollHeight<=Math.max(1,box.clientHeight);});
        pages.push(...chunks.map(text=>({text})));
      }else pages.push(item);
    }
    if(!pages.length)pages.push({text:'完成判決後，這裡會顯示結果與解析。'});
    index=Math.max(0,Math.min(index,pages.length-1));
    const page=pages[index];box.replaceChildren();
    if(page.text){const p=document.createElement('p');p.className='game-reader-copy';p.textContent=page.text;box.append(p);}
    else box.innerHTML=page.html;
    $$('[data-read-tab]',root).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.readTab===active)));
    $('span',nav).textContent=`${index+1} / ${pages.length}`;
    $('[data-read-step="-1"]',nav).disabled=index===0;
    $('[data-read-step="1"]',nav).disabled=index===pages.length-1;
  };
  root.addEventListener('click',e=>{
    const tab=e.target.closest('[data-read-tab]'),step=e.target.closest('[data-read-step]');
    if(tab){active=tab.dataset.readTab;index=0;render();}
    if(step){index+=Number(step.dataset.readStep);render();}
  });
  const observer=new ResizeObserver(render);observer.observe(box);
  gameRun.cleanup.push(()=>observer.disconnect());
  render();
  return {render,destroy(){observer.disconnect();},select(id){active=id;index=0;render();}};
}
function gameReadableText(node){
  const copy=node.cloneNode(true);
  $$('br',copy).forEach(br=>br.replaceWith('\n'));
  $$('p,h3,h4,dt,dd,strong,.base-eyebrow,div>span',copy).forEach(el=>el.append('\n'));
  return copy.textContent.trim();
}
function installGameSidebar(host,learn){
  const sidebar=$('.game-sidebar',host),controls=$('.game-controls',host);
  const store=document.createElement('div');store.hidden=true;sidebar.append(store);
  const intro=$('.base-brief',controls),desc=$('.pitch-desc',controls),route=$('.pitch-path-preview',controls),result=$('.base-result',controls);
  const help=document.createElement('div');help.innerHTML=learn;
  [intro,desc,route,result].filter(Boolean).forEach(el=>store.append(el));
  const sections=[{id:'help',label:'玩法',read:()=>[{text:[intro&&gameReadableText(intro),gameReadableText(help)].filter(Boolean).join('\n\n')}]}];
  if(desc)sections.push({id:'route',label:'球路',read:()=>[{text:desc.textContent},{html:route.innerHTML}]});
  if(result)sections.push({id:'result',label:'判定詳情',read:()=>result.hidden?[]:[{text:gameReadableText(result)}]});
  const reader=gameReader($('.game-reader',host),sections);
  let wasVisible=false;
  const observer=new MutationObserver(()=>{
    const visible=result&&!result.hidden;
    if(visible&&!wasVisible)reader.select('result');else reader.render();
    wasVisible=visible;
  });
  observer.observe(store,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['hidden']});
  gameRun.cleanup.push(()=>observer.disconnect());
}

/* 握法示意：球面上的半透明指位與下方拇指；不同握法使用不同位置。 */
function pitchRouteSVG(type){
  const pt = {type,tx:400,ty:323,bx:PITCHES[type].bx,by:PITCHES[type].by};
  const points = Array.from({length:41},(_,i)=>{const b=pitchPos(pt,i/40);return `${(b.x-290)*1.15},${18+(b.y-RELEASE.y)*.65}`;}).join(' ');
  return `<svg viewBox="0 0 270 160" role="img" aria-label="捕手視角下的${PITCHES[type].name}球路"><path d="M125 23 126 138" stroke="#a6b6ac" stroke-dasharray="3 5"/><rect x="72" y="89" width="111" height="69" fill="none" stroke="#8f9e93"/><polyline points="${points}" fill="none" stroke="${PITCHES[type].color}" stroke-width="3"/><circle cx="126.5" cy="137.7" r="5" fill="#faf7ed"/><text x="12" y="17" fill="#b8c7bd" font-size="10">出手</text><text x="204" y="148" fill="#b8c7bd" font-size="10">本壘</text></svg>`;
}
const GRIP_ART = {fb:'{{GRIP:fb}}',sl:'{{GRIP:sl}}',cb:'{{GRIP:cb}}',ch:'{{GRIP:ch}}',si:'{{GRIP:si}}',ct:'{{GRIP:ct}}',fs:'{{GRIP:fs}}',sv:'{{GRIP:sv}}'};
const GRIP_REFERENCE = {fb:'Four-seam_fastball_1.JPG',sl:'Slider_1.JPG',cb:'Curve_1.JPG',ch:'Circle_change_1_(cropped).JPG'};
function installPitchGuide(ui, getType, canOpen = () => true){
  const card = document.createElement('div'); card.className='pitch-guide';
  card.innerHTML='<button type="button" class="pitch-guide-open" aria-haspopup="dialog"></button>';
  const book=document.createElement('dialog');book.className='pitch-book';book.setAttribute('aria-labelledby','pitch-book-title');
  book.innerHTML=`<header class="pitch-book-head"><p>THE PITCHER’S NOTEBOOK <span>球種圖鑑</span></p><button type="button" class="pitch-book-close" aria-label="關閉球種圖鑑">✕</button></header><nav class="pitch-book-tabs" aria-label="瀏覽球種">${Object.entries(PITCHES).map(([id,p])=>`<button type="button" data-book-pitch="${id}" aria-pressed="false">${p.name}</button>`).join('')}</nav><div class="pitch-book-content"></div>`;
  ui.controls.after(card,book);
  let browsing=getType(),bookReader=null;
  const renderBook=()=>{
    const type=browsing,p=PITCHES[type],g=PITCH_GUIDE[type];
    $$('[data-book-pitch]',book).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.bookPitch===type)));
    bookReader?.destroy();
    $('.pitch-book-content',book).innerHTML=`<figure class="pitch-book-art"><img src="${GRIP_ART[type]}" width="1122" height="1402" alt="${p.name}右手握球姿勢示意插畫"><figcaption>右手握法 · ${GRIP_REFERENCE[type]?'參考實拍重繪':'其中一種握法示意'}</figcaption></figure><div class="pitch-book-copy"><p class="lab-eyebrow">${p.en}</p><h2 id="pitch-book-title">${p.name}</h2><div class="game-reader"></div></div>`;
    bookReader=gameReader($('.game-reader',book),[
      {id:'grip',label:'握法',read:()=>[{text:`${g.focus}\n\n${g.grip}\n\n圖示為其中一種握法，實際球路因投手而異。`}]},
      {id:'route',label:'球路',read:()=>[{text:`${p.desc}\n\n旋轉特性：${g.spin}`},{html:`${pitchRouteSVG(type)}<small>右投手・捕手視角，變化幅度放大示意</small>`}]},
      {id:'read',label:'觀察',read:()=>[{text:g.read}]},
      {id:'source',label:'來源',read:()=>[{html:`<p><a href="${g.source}" target="_blank" rel="noopener noreferrer">閱讀更多球種知識 ↗</a></p><p class="grip-credit">${GRIP_REFERENCE[type]?`插畫以 imagegen 參考 <a href="https://commons.wikimedia.org/wiki/File:${GRIP_REFERENCE[type]}" target="_blank" rel="noopener noreferrer">Toto-artist 照片</a>重繪 · <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 3.0</a>`:'握法為 imagegen 示意插畫；球種說明來源見上方連結。滑曲球的握法與命名會因投手而異。'}</p>`}]}
    ]);
  };
  $('.pitch-guide-open',card).addEventListener('click',()=>{if(!canOpen())return;browsing=getType();renderBook();book.showModal();});
  $('.pitch-book-close',book).addEventListener('click',()=>book.close());
  book.addEventListener('click',e=>{const tab=e.target.closest('[data-book-pitch]');if(tab){browsing=tab.dataset.bookPitch;renderBook();}});
  gameRun.cleanup.push(()=>{bookReader?.destroy();if(book.open)book.close();book.remove();});
  const update = () => {
    const type=getType();
    $('.pitch-guide-open',card).innerHTML=`<img src="${GRIP_ART[type]}" width="80" height="100" alt=""><span><small>PITCH GUIDE</small><b>握法與球路圖鑑</b><span>查看${PITCHES[type].name} ↗</span></span>`;
    update.busy();
  };
  update.busy=()=>{$('.pitch-guide-open',card).disabled=!canOpen();};
  update(); return update;
}

/* ---------- 共用畫面：捕手視角 ---------- */
const crowdDots = (() => { const r = mulberry32(7), a = []; for (let i = 0; i < 560; i++) a.push([r() * GW, 58 + r() * 62, r()]); return a; })();
const CROWD = ['#e3b341','#d1553b','#f6efe0','#4f8fd1','#5bbf8a','#c0392b','#2c7a62'];
function ell(c, x, y, rx, ry, fill){ c.fillStyle = fill; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fill(); }
function rrect(c, x, y, w, h, r, fill){ c.fillStyle = fill; c.beginPath(); c.roundRect(x, y, w, h, r); c.fill(); }

function drawLights(c){
  for (const x of [90, 710]){
    const g = c.createRadialGradient(x, 36, 4, x, 36, 70); g.addColorStop(0, 'rgba(255,246,208,.5)'); g.addColorStop(1, 'rgba(255,246,208,0)');
    c.fillStyle = g; c.fillRect(x - 70, 0, 140, 110);
    c.fillStyle = '#0a1713'; c.fillRect(x - 3, 40, 6, 84); c.fillRect(x - 28, 20, 56, 26);
    c.fillStyle = '#fff7d6';
    for (let i = 0; i < 5; i++) for (let j = 0; j < 2; j++){ c.beginPath(); c.arc(x - 20 + i * 10, 28 + j * 10, 3.2, 0, 7); c.fill(); }
  }
}

/* 固定鏡位；打者腳部落點獨立鎖定，球棒只由程式畫一次。 */
function drawPlayerFrame(c, kind, frame){
  const art=PLAYER_ART[kind];if(!art.complete||!art.naturalWidth)return;
  const layout=PLAYER_LAYOUT[kind],f=Math.max(0,Math.min(layout.count-1,Math.floor(frame)));
  const source=layout.order?.[f]??f;
  const width=art.naturalWidth/layout.columns,height=art.naturalHeight/layout.rows;
  const sx=(source%layout.columns)*width,sy=Math.floor(source/layout.columns)*height;
  const {scale,base}=layout,[ax,ay]=layout.anchors?.[f]??layout.anchor;
  const dx=base.x-ax*scale,dy=base.y-ay*scale;
  c.save();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
  if(kind==='batter'&&f<=6){
    const hip=175,blend=30;
    // 同一張站姿腿部貫穿蓄力、落腳及接觸；不使用外踢膝蓋的圖格。
    c.drawImage(art,0,hip,width,height-hip,base.x-layout.anchor[0]*scale,base.y-layout.anchor[1]*scale+hip*scale,width*scale,(height-hip)*scale);
    c.drawImage(art,sx,sy,width,hip,dx,dy,width*scale,hip*scale);
    // 腰部以窄帶漸層接合，避免上下半身裁切產生硬邊。
    for(let row=0;row<10;row++){
      const top=hip+row*blend/10;c.globalAlpha=1-(row+.5)/10;
      c.drawImage(art,sx,sy+top,width,blend/10,dx,dy+top*scale,width*scale,blend/10*scale);
    }
  }else c.drawImage(art,sx,sy,width,height,dx,dy,width*scale,height*scale);
  c.restore();
}
function drawBatterBat(c,frame){
  const f=Math.max(0,Math.min(11,Math.floor(frame))),layout=PLAYER_LAYOUT.batter;
  const [ax,ay]=layout.anchors[f],[hx,hy]=BAT_HANDS[f];
  c.save();c.translate(layout.base.x+(hx-ax)*layout.scale,layout.base.y+(hy-ay)*layout.scale);c.rotate(BAT_ANGLES[f]*Math.PI/180);
  const wood=c.createLinearGradient(0,-5,0,5);wood.addColorStop(0,'#e3c28e');wood.addColorStop(.45,'#b78a4e');wood.addColorStop(1,'#79522f');
  c.fillStyle=wood;c.beginPath();c.moveTo(-11,-2);c.lineTo(27,-2.2);c.quadraticCurveTo(46,-5.5,94,-5.5);c.quadraticCurveTo(102,0,94,5.5);c.quadraticCurveTo(46,5.5,27,2.2);c.lineTo(-11,2);c.closePath();c.fill();
  rrect(c,-13,-3.2,4,6.4,1.5,'#79522f');rrect(c,-7,-2.5,17,5,1,'#263733');c.restore();
}
function pitcherFrame(S,now,windup){
  const release=PLAYER_LAYOUT.pitcher.releaseFrame;
  if(S.phase==='windup')return Math.min(release-1,Math.floor(clamp01(windup)*release));
  if(S.phase==='pitch')return Math.min(23,release+Math.floor(Math.max(0,now-S.t0)/45));
  return ['result','call','reveal','over'].includes(S.phase)?23:0;
}
function batterFrame(S,now,windup){
  const swung=S.swung||S.swingT>0;
  if(swung&&S.phase!=='idle'){
    const ms=now-S.swingT;
    if(ms<CONTACT_MS)return 4+Math.min(1,Math.floor(Math.max(0,ms)/CONTACT_MS*2));
    return Math.min(11,6+Math.floor((ms-CONTACT_MS)/65));
  }
  if(S.phase==='windup')return windup>.7?1:0;
  if(S.phase==='pitch'&&S.p)return (now-S.t0)/S.p.dur<.45?2:3;
  return 0;
}

function fieldPath(c,points,fill,stroke){
  c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();
  if(fill){c.fillStyle=fill;c.fill();}
  if(stroke){c.strokeStyle=stroke;c.stroke();}
}
function groundPath(c,points,fill,stroke,height=0){fieldPath(c,points.map(([x,z])=>fieldPoint(x,z,height)),fill,stroke);}
function groundCircle(c,x,z,r,fill,height=0){
  groundPath(c,Array.from({length:96},(_,i)=>{const a=i*Math.PI*2/96;return[x+Math.cos(a)*r,z+Math.sin(a)*r];}),fill,null,height);
}
function drawFieldGround(c){
  const turf=c.createLinearGradient(0,158,0,GH);turf.addColorStop(0,'#496e4c');turf.addColorStop(1,'#294b34');
  c.fillStyle=turf;c.fillRect(0,158,GW,GH-158);
  // 以實際距離排列的割草條紋：遠處收窄，近處展開。
  for(let z=4;z<120;z+=8){
    const near=fieldPoint(0,z).y,far=fieldPoint(0,z+8).y;
    c.fillStyle=(z-4)%16===0?'rgba(223,236,186,.035)':'rgba(12,37,21,.035)';c.fillRect(0,far,GW,near-far);
  }
  // 紅土沿一、三壘方向展開，外緣繞過二壘；中央保留草皮。
  groundPath(c,[[0,0],[-21,21],[-26,29],[-24,38],[-16,45],[0,48],[16,45],[24,38],[26,29],[21,21]],'#a9825f');
  groundPath(c,[[0,0],[-17.8,19.4],[0,36.8],[17.8,19.4]],'#426847');
  // 本壘紅土圓與投手丘各自獨立，兩者之間沒有土路。
  groundCircle(c,0,0,3.96,'#b18a67');
  groundCircle(c,0,18.44,2.7432,'#ba9672',.12);
  groundCircle(c,0,18.44,1.3,'#c4a27e',.22);
  groundPath(c,[[-.3048,18.44],[.3048,18.44],[.3048,18.5924],[-.3048,18.5924]],'#eee8d7',null,.254);
  // 二壘及兩側壘包；一、三壘在此鏡位接近畫面外緣。
  const baseDistance=27.432/Math.sqrt(2);
  for(const [x,z] of [[-baseDistance,baseDistance],[0,baseDistance*2],[baseDistance,baseDistance]]){
    const h=.2286;groundPath(c,[[x-h,z-h],[x+h,z-h],[x+h,z+h],[x-h,z+h]],'#eee9dc');
  }
  c.lineWidth=1.6;c.strokeStyle='rgba(249,246,229,.8)';
  for(const side of [-1,1]){
    const a=fieldPoint(side*1.25,1.25),b=fieldPoint(side*90,90);
    c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();
  }
  c.lineWidth=1.7;
  BATTER_BOXES.forEach(box=>fieldPath(c,box,null,'rgba(250,245,226,.86)'));
  groundPath(c,[[0,0],[.2159,.2159],[.2159,.4318],[-.2159,.4318],[-.2159,.2159]],'#f4efe0');
}

function drawCatcherScene(c, o = {}){
  let g = c.createLinearGradient(0, 0, 0, 150); g.addColorStop(0, '#101f26'); g.addColorStop(1, '#31464a');
  c.fillStyle = g; c.fillRect(0, 0, GW, 150);
  drawLights(c);
  c.globalAlpha = .3;
  for(let row=0;row<5;row++){
    c.strokeStyle='#81918c';c.lineWidth=1;c.beginPath();c.moveTo(0,69+row*11);c.lineTo(GW,69+row*11);c.stroke();
  }
  crowdDots.forEach(([x, y, u]) => { c.fillStyle = u>.6?'#a9b4a5':'#647a76'; ell(c,x,y+8,1.6,2.2,c.fillStyle); });
  c.globalAlpha = 1;
  c.fillStyle = '#233b38'; c.fillRect(0, 125, GW, 33); c.fillStyle = '#a8ad8d'; c.fillRect(0, 125, GW, 2);
  c.font='10px sans-serif';c.textAlign='center';c.fillStyle='#b1bab0';c.fillText('CENTER FIELD  /  122 M',400,142);
  drawFieldGround(c);
  drawPlayerFrame(c, 'pitcher', o.pitcherFrame || 0);
  if (o.zone) drawZone(c, o.zone === 'grid');
  if (o.batter !== false){drawBatterBat(c,o.batterFrame||0);drawPlayerFrame(c, 'batter', o.batterFrame || 0);}
  c.font='10px sans-serif';c.fillStyle='rgba(235,239,227,.6)';c.textAlign='left';c.fillText('CATCHER VIEW  /  捕手視角',22,25);
  c.textAlign='right';c.fillText('18.44 M',778,25);
}

// Pitching mode has its own camera, actors and ball projection.
const PITCH_BACK_ART=new Image();PITCH_BACK_ART.src='{{PLAYER:pitcher-back-v1}}';
const BROADCAST_BATTER_ART=new Image();BROADCAST_BATTER_ART.src='{{PLAYER:batter-broadcast-v1}}';
const BROADCAST_BATTER_FINISH_ART=new Image();BROADCAST_BATTER_FINISH_ART.src='{{PLAYER:batter-broadcast-v2}}';
const BROADCAST_BATTER_STEPS_ART=new Image();BROADCAST_BATTER_STEPS_ART.src='{{PLAYER:batter-broadcast-steps-v1}}';
const BROADCAST_BATTER_HIP_ART=new Image();BROADCAST_BATTER_HIP_ART.src='{{PLAYER:batter-broadcast-steps-v2}}';
const PITCH_BACK_STADIUM=new Image();PITCH_BACK_STADIUM.src='{{PLAYER:pitching-stadium-v2}}';
function pitchingGroundPoint(x,z,height=0){
  const s=950/(z+8);
  return {x:458+950*((x-2.2)/(z+8)+2.2/26.44),y:140+(2.4-height)*s};
}
// Home plate is far from this camera. First/third base are closer to it,
// so the foul rays decrease z as they travel away from the plate.
const PITCHING_FOUL_LINES=[-1,1].map(side=>[1.25,27.432/Math.SQRT2].map(distance=>[side*distance,18.6559-distance]));
const backZoneLeft=pitchingGroundPoint(-.2159,18.2241,1.02),backZoneRight=pitchingGroundPoint(.2159,18.2241,.45);
const PITCH_VIEW={zone:{x:backZoneLeft.x,y:backZoneLeft.y,w:backZoneRight.x-backZoneLeft.x,h:backZoneRight.y-backZoneLeft.y},release:{x:361,y:171},aim:{x:640,y:112,w:108,h:142}};
function pitchingTarget(pt,zone=PITCH_VIEW.zone){return {x:zone.x+(pt.tx-ZONE.x)/ZONE.w*zone.w,y:zone.y+(pt.ty-ZONE.y)/ZONE.h*zone.h};}
function pitchingPitchPos(pt,p){
  const t=clamp01(p),f=t+.2*t*(1-t),end=pitchingTarget(pt);
  // Use one convex arc in travel progress. Multiplying a hump by t² made
  // an S-curve: the splitter climbed again before dropping. Cubic sag keeps
  // its curvature downward throughout, with a later peak than quadratic sag.
  const bend=PITCHES[pt.type]?.late?Math.sqrt(27)/2*(f-f*f*f):4*f*(1-f);
  return {x:PITCH_VIEW.release.x+(end.x-PITCH_VIEW.release.x)*f-pt.bx*.08*bend,
    y:PITCH_VIEW.release.y+(end.y-PITCH_VIEW.release.y)*f-pt.by*.12*bend,r:6.2*8/(8+18.44*t)};
}
function pitchingRouteSVG(type){
  const pt={type,tx:400,ty:323,bx:PITCHES[type].bx,by:PITCHES[type].by};
  const points=Array.from({length:61},(_,i)=>{const b=pitchingPitchPos(pt,i/60);return `${16+(b.x-PITCH_VIEW.release.x)*2.1},${10+(b.y-125)*1.25}`;}).join(' ');
  const end=pitchingPitchPos(pt,1),ex=16+(end.x-PITCH_VIEW.release.x)*2.1,ey=10+(end.y-125)*1.25;
  return `<svg viewBox="0 0 270 136" role="img" aria-label="${PITCHES[type].name}投手後方視角球路示意"><path d="M16 67.5 ${ex} ${ey}" fill="none" stroke="#8c9b89" stroke-dasharray="3 5" opacity=".45"/><polyline points="${points}" fill="none" stroke="${PITCHES[type].color}" stroke-width="3"/><circle cx="16" cy="67.5" r="3" fill="#e9e3cb"/><circle cx="${ex}" cy="${ey}" r="3" fill="#e9e3cb"/><text x="10" y="89" fill="#aebba9" font-size="10">出手</text><text x="${ex-10}" y="${ey+20}" fill="#aebba9" font-size="10">進壘</text></svg>`;
}
function pitchingAimAt(point){
  const a=PITCH_VIEW.aim,z=point.x>592&&point.y<310?a:PITCH_VIEW.zone;
  return {x:ZONE.x+(point.x-z.x)/z.w*ZONE.w,y:ZONE.y+(point.y-z.y)/z.h*ZONE.h};
}
function pitcherBackFrame(S,now,windup){
  if(S.phase==='windup')return Math.min(8,Math.floor(clamp01(windup)*9));
  if(S.phase==='pitch')return Math.min(11,9+Math.floor((now-S.t0)/95));
  return S.phase==='result'||S.phase==='over'?11:0;
}
const BROADCAST_BATTER={base:pitchingGroundPoint(1.05,18.44),scale:.17,poses:[
  {source:'ready',cell:0,anchor:[315,498]},
  {source:'ready',cell:1,anchor:[284,490]},
  {source:'steps',cell:0,anchor:[325,504]},
  {source:'hip',cell:1,anchor:[239,504]},
  {source:'steps',cell:2,anchor:[380,493]},
  {source:'finish',cell:2,anchor:[340,484]},
  {source:'steps',cell:3,anchor:[324,493]},
  {source:'finish',cell:3,anchor:[295,485]}
]};
function broadcastBatterFrame(S,now){
  if(S.phase==='idle'||S.phase==='windup')return 0;
  if(!S.swingT)return S.phase==='pitch'&&S.p&&(now-S.t0)/S.p.dur>.6?1:0;
  const elapsed=now-S.swingT;
  return elapsed<CONTACT_MS?1+Math.floor(clamp01(elapsed/CONTACT_MS)*4):elapsed<CONTACT_MS+45?5:elapsed<CONTACT_MS+105?6:7;
}
function drawBroadcastBatter(c,frame=0){
  // Preserve the four existing poses; insert four separately painted poses.
  const l=BROADCAST_BATTER,pose=l.poses[frame],art={ready:BROADCAST_BATTER_ART,finish:BROADCAST_BATTER_FINISH_ART,steps:BROADCAST_BATTER_STEPS_ART,hip:BROADCAST_BATTER_HIP_ART}[pose.source];
  if(!art.complete||!art.naturalWidth)return;
  const w=art.naturalWidth/2,h=art.naturalHeight/2,s=l.scale,anchor=pose.anchor,cell=pose.cell;
  c.drawImage(art,(cell%2)*w,Math.floor(cell/2)*h,w,h,l.base.x-anchor[0]*s,l.base.y-anchor[1]*s,512*s,512*s);
}
function drawBackActor(c,frame,x,y,scale){
  if(!PITCH_BACK_ART.complete||!PITCH_BACK_ART.naturalWidth)return;
  const w=PITCH_BACK_ART.naturalWidth/4,h=PITCH_BACK_ART.naturalHeight/4;
  const extra=frame===12?16:0,trim=frame===11?12:0;
  c.save();
  c.drawImage(PITCH_BACK_ART,(frame%4)*w+trim,Math.floor(frame/4)*h-extra,w-trim,h+extra,x-(181-trim/w*362)*scale,y-(352+extra/h*362)*scale,(362-trim/w*362)*scale,(362+extra/h*362)*scale);
  c.restore();
}
function drawPitchingScene(c,o={}){
  if(PITCH_BACK_STADIUM.complete&&PITCH_BACK_STADIUM.naturalWidth)c.drawImage(PITCH_BACK_STADIUM,0,0,PITCH_BACK_STADIUM.naturalWidth,PITCH_BACK_STADIUM.naturalHeight,0,0,GW,GH);
  else{c.fillStyle='#2f5140';c.fillRect(0,0,GW,GH);c.fillStyle='#203937';c.fillRect(0,0,GW,180);ell(c,458,226,95,25,'#9d7959');ell(c,270,398,125,27,'#aa8460');}
  const path=(points,fill,stroke)=>fieldPath(c,points.map(([x,z,h])=>pitchingGroundPoint(x,z,h||0)),fill,stroke);
  // Distant home plate faces the mound; the mound is separated by grass.
  path([[-.2159,18.2241],[.2159,18.2241],[.2159,18.44],[0,18.6559],[-.2159,18.44]],'#f3ead6');
  for(const line of PITCHING_FOUL_LINES)path(line,null,'rgba(243,234,214,.65)');
  for(const side of [-1,1])path([[side*BOX_WORLD.inner,17.5256],[side*BOX_WORLD.outer,17.5256],[side*BOX_WORLD.outer,19.3544],[side*BOX_WORLD.inner,19.3544]],null,'rgba(243,234,214,.6)');
  path([[-.3048,-.0762,.254],[.3048,-.0762,.254],[.3048,.0762,.254],[-.3048,.0762,.254]],'#e4dcc5');
  drawBackActor(c,15,459,219,.18);
  drawBroadcastBatter(c,o.batterFrame||0);
  drawBackActor(c,14,459,227,.20);
  const z=PITCH_VIEW.zone;
  c.strokeStyle='rgba(247,241,221,.8)';c.lineWidth=.8;c.strokeRect(z.x,z.y,z.w,z.h);
  // Source 6 has an extra ball/incorrect glove. The held-ball release pose is
  // the final windup image; flight starts with the empty-hand followthrough.
  const order=[0,1,2,3,4,5,7,8,9,10,11,11];
  drawBackActor(c,order[o.pitcherFrame||0],270,401,.68);
  c.textAlign='left';c.font='600 10px sans-serif';c.fillStyle='#eee5cd';
  rrect(c,18,16,263,31,4,'rgba(14,31,32,.82)');c.fillStyle='#eee5cd';c.fillText('PITCHER VIEW / 投手後方 → 本壘',31,36);
  // Enlarged targeting panel maps to the small physical zone at home plate.
  const a=PITCH_VIEW.aim;
  rrect(c,609,69,168,228,6,'rgba(14,31,32,.88)');c.fillStyle='#cbbc95';c.font='600 11px sans-serif';c.fillText('進壘瞄準區',627,91);
  c.fillStyle='rgba(236,237,215,.06)';c.fillRect(a.x,a.y,a.w,a.h);
  c.strokeStyle='#b9c9b8';c.lineWidth=1;c.strokeRect(a.x,a.y,a.w,a.h);
  c.strokeStyle='rgba(185,201,184,.22)';
  for(let i=1;i<3;i++){c.beginPath();c.moveTo(a.x+a.w*i/3,a.y);c.lineTo(a.x+a.w*i/3,a.y+a.h);c.moveTo(a.x,a.y+a.h*i/3);c.lineTo(a.x+a.w,a.y+a.h*i/3);c.stroke();}
  if(o.aim){
    const target={tx:o.aim.x,ty:o.aim.y};
    for(const [box,r] of [[a,7],[z,3]]){const p=pitchingTarget(target,box);c.strokeStyle='#edc58f';c.lineWidth=1.5;c.beginPath();c.arc(p.x,p.y,r,0,Math.PI*2);c.moveTo(p.x-r-4,p.y);c.lineTo(p.x+r+4,p.y);c.moveTo(p.x,p.y-r-4);c.lineTo(p.x,p.y+r+4);c.stroke();}
  }
  c.font='10px sans-serif';c.fillStyle='#c8d1bf';c.fillText('點選此框設定位置',627,278);
}
function drawPitchingBall(c,pt,p,showBall=true){
  c.save();c.lineWidth=2;c.strokeStyle=PITCHES[pt.type].color;
  c.globalAlpha=.8;c.beginPath();
  for(let i=0;i<=48;i++){const b=pitchingPitchPos(pt,clamp01(p)*i/48);c[i?'lineTo':'moveTo'](b.x,b.y);}c.stroke();
  for(let i=0;i<10;i++){
    const t=Math.max(0,clamp01(p)-.15+i*.015),a=pitchingPitchPos(pt,t),b=pitchingPitchPos(pt,Math.min(clamp01(p),t+.015));
    c.globalAlpha=.05+i*.03;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();
  }
  c.restore();if(showBall){const b=pitchingPitchPos(pt,p);drawBall(c,b.x,b.y,b.r);}
}

function drawZone(c, grid){
  c.save();
  c.strokeStyle = 'rgba(237,240,224,.72)'; c.lineWidth = 1.5; c.setLineDash(grid ? [] : [5, 5]);
  c.strokeRect(ZONE.x, ZONE.y, ZONE.w, ZONE.h);
  if (grid){
    c.strokeStyle = 'rgba(237,240,224,.2)'; c.lineWidth = 1;
    for (let i = 1; i < 3; i++){
      c.beginPath(); c.moveTo(ZONE.x + ZONE.w * i / 3, ZONE.y); c.lineTo(ZONE.x + ZONE.w * i / 3, ZONE.y + ZONE.h); c.stroke();
      c.beginPath(); c.moveTo(ZONE.x, ZONE.y + ZONE.h * i / 3); c.lineTo(ZONE.x + ZONE.w, ZONE.y + ZONE.h * i / 3); c.stroke();
    }
  }
  c.restore();
}

function drawBall(c, x, y, r){
  c.fillStyle = '#fbf8f1'; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
  if (r > 4){
    c.strokeStyle = '#c0392b'; c.lineWidth = Math.max(1, r / 6);
    c.beginPath(); c.arc(x - r * .9, y, r * .7, -0.9, 0.9); c.stroke();
    c.beginPath(); c.arc(x + r * .9, y, r * .7, Math.PI - 0.9, Math.PI + 0.9); c.stroke();
  }
}
function drawMitt(c, x, y){ ell(c, x, y + 2, 17, 15, '#7a4a22'); ell(c, x, y + 2, 10, 8, '#5d3517'); }

/* 投球軌跡：遠小近大，變化球在最後才轉彎 */
function newPitch(type, target){
  const P = PITCHES[type], kmh = Math.round(rnd(P.kmh[0], P.kmh[1]));
  return {type, kmh, tx:target.x, ty:target.y, bx:P.bx, by:P.by, dur:18.44 / (kmh / 3.6) * 2000};
}
function pitchPos(pt, p){
  const t=clamp01(p), f=.45*t/(1-.55*t);
  const bend=PITCHES[pt.type]?.late?Math.sqrt(27)/8*(f*f*f-f):f*f-f;
  // 曲率在整段飛行都可見；最後仍精準抵達判定使用的落點。
  return {x:RELEASE.x+(pt.tx-RELEASE.x)*f+pt.bx*bend, y:RELEASE.y+(pt.ty-RELEASE.y)*f+pt.by*bend, r:1.5+(BALL_R-1.5)*f};
}
function drawPitch(c, pt, p){
  const end=clamp01(p), color=PITCHES[pt.type].color;
  c.save();c.lineCap='round';
  for(let i=0;i<12;i++){
    const a=Math.max(0,end-.22+i*.22/12),b=Math.min(end,a+.22/12);
    const p0=pitchPos(pt,a),p1=pitchPos(pt,b);
    c.globalAlpha=.06+i*.025;c.strokeStyle=color;c.lineWidth=1+i*.22;
    c.beginPath();c.moveTo(p0.x,p0.y);c.lineTo(p1.x,p1.y);c.stroke();
  }
  c.restore();const b=pitchPos(pt,end);
  c.save();c.shadowColor=color;c.shadowBlur=9;drawBall(c,b.x,b.y,b.r);c.restore();
}
function touchesZone(x, y, r = BALL_R){
  const cx = Math.max(ZONE.x, Math.min(x, ZONE.x + ZONE.w)), cy = Math.max(ZONE.y, Math.min(y, ZONE.y + ZONE.h));
  return Math.hypot(x - cx, y - cy) <= r;
}
function randomTarget(pIn, edgeShare = 0){
  const roll = Math.random();
  if (roll < edgeShare){
    // 邊角球：球心落在好球帶邊線內外一顆球的距離
    const side = Math.floor(Math.random() * 4), off = rnd(-BALL_R + 2, BALL_R * 2 - 1);
    const along = (a, len) => a + rnd(0.15, 0.85) * len;
    return side === 0 ? {x:ZONE.x - off, y:along(ZONE.y, ZONE.h)} : side === 1 ? {x:ZONE.x + ZONE.w + off, y:along(ZONE.y, ZONE.h)}
      : side === 2 ? {x:along(ZONE.x, ZONE.w), y:ZONE.y - off} : {x:along(ZONE.x, ZONE.w), y:ZONE.y + ZONE.h + off};
  }
  if (roll < edgeShare + pIn) return {x:rnd(ZONE.x + 14, ZONE.x + ZONE.w - 14), y:rnd(ZONE.y + 14, ZONE.y + ZONE.h - 14)};
  const side = Math.floor(Math.random() * 4), d = rnd(BALL_R + 10, BALL_R + 44);
  return side === 0 ? {x:ZONE.x - d, y:rnd(ZONE.y, ZONE.y + ZONE.h)} : side === 1 ? {x:ZONE.x + ZONE.w + d, y:rnd(ZONE.y, ZONE.y + ZONE.h)}
    : side === 2 ? {x:rnd(ZONE.x, ZONE.x + ZONE.w), y:ZONE.y - d} : {x:rnd(ZONE.x, ZONE.x + ZONE.w), y:ZONE.y + ZONE.h + d};
}
const pickType = () => { const r=Math.random();let sum=0;for(const [type,weight] of [['fb',.32],['sl',.14],['cb',.10],['ch',.10],['si',.12],['ct',.10],['fs',.08],['sv',.04]]){sum+=weight;if(r<sum)return type;}return 'sv'; };
const dots = (n, max, cls) => Array.from({length:max}, (_, i) => `<i class="${i < n ? 'on ' + cls : ''}"></i>`).join('');
const countHUD = s => `<span class="cnt"><b>B</b>${dots(s.b, 3, 'b')}</span><span class="cnt"><b>S</b>${dots(s.s, 2, 's')}</span><span class="cnt"><b>O</b>${dots(s.o, 2, 'o')}</span>`;

/* 擊球結果與動畫共用同一種類，避免滾地出局套用飛球弧線。 */
const battedOutKind=()=>Math.random()<.5?'groundout':'flyout';
const battedOutText=kind=>kind==='groundout'?'滾地球，出局！':'高飛球，接殺出局！';
function flight(from, kind, camera='catcher'){
  if(kind==='groundout'||kind==='flyout'){
    return {from,kind,camera,t0:performance.now(),dur:kind==='groundout'?1250:1350,
      distance:camera==='pitcher'?rnd(12,16):kind==='groundout'?rnd(18,26):rnd(32,48),
      side:rnd(-1,1)*(camera==='pitcher'?4:kind==='groundout'?9:16)};
  }
  if(camera==='pitcher')return {from,to:{x:rnd(100,700),y:rnd(320,440)},kind,camera,t0:performance.now(),dur:900,peak:45};
  const to = kind === 'hr' ? {x:rnd(180, 620), y:40} : kind === 'hit' ? {x:rnd(120, 680), y:rnd(160, 200)}
    : kind === 'foul' ? {x:Math.random() < .5 ? -30 : GW + 30, y:rnd(80, 200)} : {x:rnd(300, 500), y:rnd(170, 200)};
  return {from, to, kind, t0:performance.now(), dur:kind === 'hr' ? 1300 : 1000, peak:kind === 'hr' ? 230 : kind === 'out' ? 260 : 110};
}
function battedBallPose(f,progress){
  const p=clamp01(progress),ground=f.kind==='groundout';
  const back=f.camera==='pitcher',project=back?pitchingGroundPoint:fieldPoint;
  const startZ=back?18.44:.2159,travel=ground?2*p-p*p:p;
  const z=startZ+(back?-1:1)*f.distance*travel,x=f.side*travel;
  let height;
  if(!ground)height=.72*(1-p)+4*(back?3.8:5)*p*(1-p)+1.2*p;
  else if(p<.12)height=.72*(1-p/.12)**2;
  else{
    const bounce=(p-.12)/.16,index=Math.floor(bounce);
    height=index<3?[.24,.12,.055][index]*Math.sin((bounce-index)*Math.PI):0;
  }
  const floor=project(x,z),ball=project(x,z,height),start=project(0,startZ,.72);
  const r=back?1.9*(startZ+8)/(z+8):Math.max(1.8,5.3*(startZ+6)/(z+6));
  const startR=back?1.9:5.3,anchor=ground?Math.max(0,1-p/.12):(1-p)**2;
  return {x:ball.x+(f.from.x-start.x)*anchor,
    y:ball.y-r+(f.from.y-start.y+startR)*anchor,
    groundX:floor.x,groundY:floor.y,height,r,phase:ground?(p<.12?'drop':p<.60?'bounce':'roll'):'air'};
}
function drawFlight(c, f, now){
  const p = clamp01((now - f.t0) / f.dur);
  if(f.kind==='groundout'||f.kind==='flyout'){
    const ball=battedBallPose(f,p);
    ell(c,ball.groundX,ball.groundY,Math.max(2,ball.r*1.35),Math.max(.7,ball.r*.35),`rgba(8,22,14,${.28/(1+ball.height)})`);
    drawBall(c,ball.x,ball.y,ball.r);
    return p>=1;
  }
  const x = f.from.x + (f.to.x - f.from.x) * p, y = f.from.y + (f.to.y - f.from.y) * p - Math.sin(p * Math.PI) * f.peak;
  drawBall(c, x, y, f.camera==='pitcher'?1.9+4*p:Math.max(2,10-8*p));
  return p >= 1;
}

/* ===================== 1. 打擊練習 ===================== */
function battingGame(host){
  const ui = gameUI(host, {aria:'打擊練習：從捕手後方看投手投球，看準時機揮棒',
    learn:'<b>怎麼玩</b>：按「投球」，等球快到本壘時按「揮棒」（或空白鍵、點畫面）。好球帶外的球可以不揮，四個壞球就保送；兩好球後打成界外不會三振。打到三出局結束。<br><b>小知識</b>：時速 150 公里的直球，從投手手中到本壘不到 0.45 秒；這裡放慢了約兩倍。'});
  const S = {phase:'idle', type:'mix', b:0, s:0, o:0, hits:0, hr:0, bb:0, k:0, p:null, t0:0, swingT:0, swung:false, pendingSwing:false, fly:null, mitt:null, until:0};
  ui.controls.innerHTML=pitchPickerHTML(true);
  const btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'btn btn-gold big-action';
  ui.controls.append(btn);
  const updateGuide=installPitchGuide(ui,()=>S.type==='mix' ? S.p?.type||'fb' : S.type,()=>!['windup','pitch'].includes(S.phase));
  ui.controls.addEventListener('click',e=>{const b=e.target.closest('[data-bat-type]');if(!b)return;S.type=b.dataset.batType;$$('[data-bat-type]',ui.controls).forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.batType===S.type)));updateGuide();});
  const hud = () => {
    ui.hud.innerHTML = countHUD(S) + `<span class="stat">安打 <b>${S.hits}</b></span><span class="stat">全壘打 <b>${S.hr}</b></span><span class="stat">保送 <b>${S.bb}</b></span>`;
    btn.textContent = S.phase === 'over' ? '再打一局 ↗' : S.phase === 'pitch' ? (S.swung?'已揮棒':'揮棒！ SPACE') : S.phase === 'windup' ? '投手準備中…' : S.phase === 'result' ? '下一球準備中…' : '開始投球 →';
    btn.disabled=S.phase==='windup'||S.phase==='result'||(S.phase==='pitch'&&S.swung);
    updateGuide.busy();
  };
  const endPA = (text, kind) => { S.b = 0; S.s = 0; ui.flash(text, kind); };
  const out = text => {
    S.o++; S.b = 0; S.s = 0;
    if (S.o >= 3){
      S.phase = 'over';
      ui.flash(`三出局！安打 ${S.hits}、全壘打 ${S.hr}、保送 ${S.bb}`, 'big', 0);
      stamp('bat');
    } else ui.flash(text, 'bad');
  };
  const settle = () => { if (S.phase !== 'over'){ S.phase = 'result'; S.until = performance.now() + 1500; } hud(); };
  const take = () => {
    const end = pitchPos(S.p, 1);
    S.mitt = end;
    if (touchesZone(end.x, end.y)){ S.s++; if (S.s >= 3){ S.k++; out('站著被三振！'); } else ui.flash('好球！'); }
    else { S.b++; if (S.b >= 4){ S.bb++; endPA('四壞球，保送上壘', 'good'); } else ui.flash('壞球'); }
    settle();
  };
  const swing = () => {
    if (S.swung) return;
    S.swung = true; S.pendingSwing=true; S.swingT = performance.now();hud();
  };
  const resolveSwing = () => {
    S.pendingSwing=false;
    if(!S.p)return;
    const p = (S.swingT + CONTACT_MS - S.t0) / S.p.dur, end = pitchPos(S.p, 1);
    let diff = Math.abs(p - 0.975) * (S.p.type === 'ch' || S.p.type === 'cb' ? 1.25 : 1);
    if (!touchesZone(end.x, end.y, BALL_R + 18)) diff += 0.05;
    const result = diff < 0.012 && touchesZone(end.x, end.y) ? 'hr' : diff < 0.028 ? 'hit' : diff < 0.045 ? 'out' : diff < 0.065 ? 'foul' : 'whiff';
    if (result === 'whiff'){ S.whiff = true; return; }
    const pos = pitchPos(S.p, Math.min(p, 1));
    S.fly = flight(pos, result==='out'?battedOutKind():result);
    if (result === 'hr'){ S.hits++; S.hr++; endPA(`全壘打！！飛了 ${Math.round(rnd(112, 135))} 公尺`, 'big'); celebrateGame(ui); }
    else if (result === 'hit'){ S.hits++; endPA('安打！', 'good'); }
    else if (result === 'out') out(battedOutText(S.fly.kind));
    else { if (S.s < 2) S.s++; ui.flash('界外球'); }
    S.p = null;
    settle();
  };
  const act = () => {
    if (S.phase === 'over'){ Object.assign(S, {phase:'idle', b:0, s:0, o:0, hits:0, hr:0, bb:0, k:0}); ui.flash('新的一局！'); hud(); return; }
    if (S.phase === 'idle'){
      S.phase = 'windup'; S.t0 = performance.now(); S.mitt = null; S.fly = null; S.swung = false; S.pendingSwing=false; S.swingT=0; S.whiff = false;
      S.p = newPitch(S.type==='mix'?pickType():S.type, randomTarget(.6));
      updateGuide();
      hud(); return;
    }
    if (S.phase === 'windup' || S.phase === 'pitch'){ if (S.phase === 'pitch') swing(); }
  };
  btn.addEventListener('click', act);
  ui.canvas.addEventListener('pointerdown', act);
  gameKeys(e => { if (e.key === ' ' && !e.target.closest('button')){ e.preventDefault(); if (!e.repeat) act(); } });
  hud();
  gameLoop(now => {
    const c = ui.ctx;
    let windup = 0;
    if (S.phase === 'windup'){ windup = (now - S.t0) / WINDUP_MS; if (windup >= 1){ S.phase = 'pitch'; S.t0 = now; ui.tip.textContent = `${S.p.kmh} km/h · ${PITCHES[S.p.type].name}`;hud(); } }
    if (S.phase === 'result' && now > S.until){ S.phase = 'idle'; hud(); }
    if(S.pendingSwing&&now-S.swingT>=CONTACT_MS)resolveSwing();
    drawCatcherScene(c, {pitcherFrame:pitcherFrame(S,now,windup), batterFrame:batterFrame(S,now,windup), zone:'dash'});
    if (S.phase === 'pitch' && S.p){
      const p = (now - S.t0) / S.p.dur;
      if (p > 1.12){ if (S.whiff){ S.mitt = pitchPos(S.p, 1); S.s++; if (S.s >= 3){ S.k++; out('揮棒落空，三振！'); } else ui.flash('揮空！'); settle(); } else take(); S.p = null; }
      else { const b = pitchPos(S.p, Math.min(p, 1)); if (p >= 1) drawMitt(c, b.x, b.y); drawPitch(c, S.p, p); }
    }
    if (S.mitt){ drawMitt(c, S.mitt.x, S.mitt.y); drawBall(c, S.mitt.x, S.mitt.y, BALL_R); }
    if (S.fly && drawFlight(c, S.fly, now)) S.fly = null;
  });
}

/* ===================== 2. 投球挑戰 ===================== */
function pitchingGame(host){
  const ui = gameUI(host, {aria:'投球挑戰：從投手後方看向本壘，在放大瞄準區設定進壘位置',
    learn:'<b>怎麼玩</b>：先選球種，點畫面右上的放大瞄準區設定進壘位置，再按「投出去」。鍵盤：1–8 選球種、方向鍵瞄準、空白鍵投球。取得 3 個出局前，避免被打出 4 支安打。<br><b>球路觀察</b>：投手後方視角、右投手；球從近處投向遠處的捕手。動畫放慢約兩倍，變化幅度放大以便觀察。'});
  const S = {phase:'idle', type:'fb', aim:{x:400, y:323}, b:0, s:0, o:0, k:0, h:0, bb:0, last:null, p:null, trace:null, t0:0, plan:null, swingT:0, fly:null, mitt:null, until:0};
  ui.controls.innerHTML = pitchPickerHTML()+`<p class="aim-instruction"><span>02</span> 點右上瞄準區設定進壘位置<br><span>03</span> 確認目標，投出這一球</p><button type="button" class="btn btn-gold big-action" id="g-throw">投出去 →</button>`;
  const desc = document.createElement('p'); desc.className = 'pitch-desc'; ui.controls.append(desc);
  const routePreview=document.createElement('div');routePreview.className='pitch-path-preview';ui.controls.append(routePreview);
  const updateGuide=installPitchGuide(ui,()=>S.type,()=>!['windup','pitch'].includes(S.phase));
  const hud = () => {
    ui.hud.innerHTML = countHUD(S) + `<span class="stat">三振 <b>${S.k}</b></span><span class="stat">被安打 <b>${S.h}</b></span><span class="stat">保送 <b>${S.bb}</b></span>`;
    $$('[data-pt]', ui.controls).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.pt === S.type)));
    desc.textContent = `${PITCHES[S.type].name}：${PITCHES[S.type].desc}`;
    routePreview.innerHTML=`<span>投手視角 · 同一落點比較</span>${pitchingRouteSVG(S.type)}<small>變化幅度放大示意</small>`;
    $('#g-throw').textContent = S.phase === 'over' ? '再投一局 ↗' : S.phase==='idle' ? '投出去 →' : '投球進行中…';
    $('#g-throw').disabled=!['idle','over'].includes(S.phase);
    updateGuide.busy();
  };
  const resetCount = () => { S.b = 0; S.s = 0; };
  const over = text => { S.phase = 'over'; ui.flash(text, 'big', 0); stamp('pitch'); hud(); };
  const out = (text, kind = 'good') => { S.o++; resetCount(); if (S.o >= 3) over(`三上三下！三振 ${S.k}、被安打 ${S.h}`); else ui.flash(text, kind); };
  const settle = () => { if (S.phase !== 'over'){ S.phase = 'result'; S.until = performance.now() + 1400; } hud(); };
  const throwIt = () => {
    if (S.phase === 'over'){ Object.assign(S, {phase:'idle', b:0, s:0, o:0, k:0, h:0, bb:0, last:null,p:null,trace:null,plan:null,swingT:0,fly:null,mitt:null,until:0}); ui.flash('新的一局！'); hud(); return; }
    if (S.phase !== 'idle') return;
    const P = PITCHES[S.type];
    const target = {x:S.aim.x + rnd(-P.err, P.err), y:S.aim.y + rnd(-P.err, P.err)};
    S.p = newPitch(S.type, target);
    const inZ = touchesZone(target.x, target.y);
    const cx=ZONE.x+ZONE.w/2,cy=ZONE.y+ZONE.h/2;
    const heart = Math.abs(target.x-cx)<ZONE.w*.23&&Math.abs(target.y-cy)<ZONE.h*.24;
    const corner = inZ&&!heart&&(Math.abs(target.x-cx)>ZONE.w*.34||Math.abs(target.y-cy)>ZONE.h*.34);
    let swingP = inZ ? 0.66 + (heart ? .12 : 0) : 0.22 + ((S.type === 'cb' || S.type === 'sl') ? .14 : 0);
    if (S.s === 2) swingP += .14;
    const swing = Math.random() < swingP;
    let contactP = 0.78 - (corner ? .22 : 0) - (inZ ? 0 : .36) - (S.type === 'ch' && S.last === 'fb' ? .22 : 0) - (S.p.kmh >= 148 ? .1 : 0) - (S.type === 'cb' && target.y > ZONE.y + ZONE.h * .66 ? .14 : 0);
    const contact = swing && Math.random() < contactP;
    const r = Math.random();
    S.plan = {swing, contact, inZ, kind:!contact ? null : heart ? (r < .4 ? 'hit' : r < .7 ? 'foul' : 'out') : (r < .2 ? 'hit' : r < .6 ? 'foul' : 'out')};
    S.last = S.type;
    S.phase = 'windup'; S.t0 = performance.now(); S.mitt = null; S.fly = null; S.swingT = 0;S.trace=null;
    ui.tip.textContent = `${PITCHES[S.type].name} · ${S.p.kmh} km/h`;
    hud();
  };
  const resolve = () => {
    const end = pitchingPitchPos(S.p, 1), plan = S.plan;
    S.trace={...S.p};
    if (plan.contact){
      S.fly=flight(pitchingPitchPos(S.p,.97),plan.kind==='out'?battedOutKind():plan.kind,'pitcher');
      if (plan.kind === 'hit'){ S.h++; resetCount(); if (S.h >= 4) over('被打了 4 支安打，教練上來換投了'); else ui.flash('被打出安打', 'bad'); }
      else if (plan.kind === 'out') out(battedOutText(S.fly.kind));
      else { if (S.s < 2) S.s++; ui.flash('界外球'); }
    } else {
      S.mitt = end;
      if (plan.swing || plan.inZ){ S.s++; if (S.s >= 3){ S.k++; out(plan.swing ? '揮棒落空，三振！' : '站著不動，三振！', 'big'); if (S.phase !== 'over') celebrateGame(ui); } else ui.flash(plan.swing ? '揮空！好球' : '好球！'); }
      else { S.b++; if (S.b >= 4){ S.bb++; resetCount(); ui.flash('四壞球保送', 'bad'); } else ui.flash('壞球'); }
    }
    S.p = null;
    settle();
  };
  ui.controls.addEventListener('click', e => { const b = e.target.closest('[data-pt]'); if (b){ S.type = b.dataset.pt; hud(); updateGuide(); } });
  $('#g-throw').addEventListener('click', throwIt);
  const boundAim=()=>{S.aim.x=Math.max(ZONE.x-65,Math.min(ZONE.x+ZONE.w+65,S.aim.x));S.aim.y=Math.max(ZONE.y-55,Math.min(ZONE.y+ZONE.h+42,S.aim.y));};
  ui.canvas.addEventListener('pointerdown', e => { if (S.phase === 'idle'){ S.aim = pitchingAimAt(ui.point(e));boundAim();ui.tip.textContent='目標已設定 · 按「投出去」確認'; } });
  gameKeys(e => {
    if (e.target.closest('button') && e.key === ' ') return;
    const step = 8, k = e.key;
    if (/^[1-8]$/.test(k)){ S.type = Object.keys(PITCHES)[+k - 1]; showPitchPage($('.pitch-picker',ui.controls),Math.floor((+k-1)/4));hud(); updateGuide(); }
    else if(S.phase!=='idle' && k.startsWith('Arrow'))return;
    else if (k === 'ArrowLeft'){ S.aim.x -= step; e.preventDefault(); }
    else if (k === 'ArrowRight'){ S.aim.x += step; e.preventDefault(); }
    else if (k === 'ArrowUp'){ S.aim.y -= step; e.preventDefault(); }
    else if (k === 'ArrowDown'){ S.aim.y += step; e.preventDefault(); }
    else if (k === ' ' || k === 'Enter'){ e.preventDefault(); throwIt(); }
    boundAim();
  });
  hud();
  gameLoop(now => {
    const c = ui.ctx;
    let windup = 0;
    if (S.phase === 'windup'){ windup = (now - S.t0) / WINDUP_MS; if (windup >= 1){ S.phase = 'pitch'; S.t0 = now; } }
    if (S.phase === 'result' && now > S.until){ S.phase = 'idle'; hud(); }
    if(S.phase==='pitch'&&S.p&&S.plan.swing&&!S.swingT&&(now-S.t0)/S.p.dur>=.975-CONTACT_MS/S.p.dur)S.swingT=now;
    drawPitchingScene(c, {pitcherFrame:pitcherBackFrame(S,now,windup),batterFrame:broadcastBatterFrame(S,now),aim:S.phase==='idle'?S.aim:null});
    if (S.phase === 'pitch' && S.p){
      const p = (now - S.t0) / S.p.dur;
      if ((S.plan.contact && S.swingT && now-S.swingT>=CONTACT_MS) || p >= 1.05) resolve();
      else drawPitchingBall(c, S.p, p);
    }
    if (S.mitt) drawBall(c, S.mitt.x, S.mitt.y, 1.9);
    if(S.trace&&S.phase!=='pitch'&&S.phase!=='windup'){
      drawPitchingBall(c,S.trace,1,false);
      c.textAlign='left';c.font='10px sans-serif';c.fillStyle=PITCHES[S.trace.type].color;c.fillText(`上一球軌跡 · ${PITCHES[S.trace.type].name}`,22,65);
    }
    if(S.fly&&drawFlight(c,S.fly,now))S.fly=null;
  });
}

/* ===================== 3. 主審體驗 ===================== */
function umpireGame(host){
  const TOTAL = 10;
  const ui = gameUI(host, {aria:'主審體驗：看球進壘，判好球或壞球',
    learn:'<b>好球帶</b>：本壘板正上方，上緣約在打者肩膀與腰帶的中間，下緣在膝蓋下方。<b>球只要有任何一部分擦過好球帶，就是好球。</b><br><b>怎麼玩</b>：按「下一球」，球進手套後 3 秒內判決：好球（← 或 S）、壞球（→ 或 B）。'});
  const S = {phase:'idle', n:0, right:0, p:null, t0:0, end:null, deadline:0, call:null, truth:null};
  ui.controls.innerHTML = `<button type="button" class="btn btn-gold big-action" id="g-next">下一球 ▶</button>
    <div class="call-btns"><button type="button" class="call strike" id="g-strike" disabled>好球 STRIKE<small>← / S</small></button><button type="button" class="call ball" id="g-ball" disabled>壞球 BALL<small>→ / B</small></button></div>`;
  const hud = () => {
    ui.hud.innerHTML = `<span class="stat">第 <b>${Math.min(S.n + (S.phase === 'idle' ? 1 : 0), TOTAL)}</b> / ${TOTAL} 球</span><span class="stat">判對 <b>${S.right}</b></span>`;
    $('#g-strike').disabled = $('#g-ball').disabled = S.phase !== 'call';
    $('#g-next').textContent = S.phase === 'over' ? '再當一次主審' : '下一球 ▶';
    $('#g-next').disabled = S.phase === 'windup' || S.phase === 'pitch' || S.phase === 'call';
  };
  const next = () => {
    if (S.phase === 'over'){ Object.assign(S, {phase:'idle', n:0, right:0}); ui.flash('準備好了嗎？'); hud(); return; }
    if (S.phase !== 'idle' && S.phase !== 'reveal') return;
    S.p = newPitch(pickType(), randomTarget(.33, .37));
    S.end = pitchPos(S.p, 1);
    S.truth = touchesZone(S.end.x, S.end.y) ? 'strike' : 'ball';
    S.phase = 'windup'; S.t0 = performance.now(); S.call = null;
    ui.tip.textContent = `${PITCHES[S.p.type].name} · ${S.p.kmh} km/h`;
    hud();
  };
  const judge = call => {
    if (S.phase !== 'call') return;
    S.call = call; S.n++;
    const ok = call === S.truth;
    if (ok) S.right++;
    // 判斷是不是擦邊球
    const cx = Math.max(ZONE.x, Math.min(S.end.x, ZONE.x + ZONE.w)), cy = Math.max(ZONE.y, Math.min(S.end.y, ZONE.y + ZONE.h));
    const edge = Math.abs(Math.hypot(S.end.x - cx, S.end.y - cy) - BALL_R) < BALL_R && !(S.end.x > ZONE.x + BALL_R && S.end.x < ZONE.x + ZONE.w - BALL_R && S.end.y > ZONE.y + BALL_R && S.end.y < ZONE.y + ZONE.h - BALL_R);
    const why = call === null ? '猶豫太久了！主審要果斷。' : S.truth === 'strike' ? (edge ? '球擦到好球帶邊緣，算好球。' : '球通過好球帶。') : (edge ? '差一點點，球完全在好球帶外，是壞球。' : '球在好球帶外。');
    ui.flash(`${ok ? '✓ 判對了' : '✗ 判錯了'}｜正確：${S.truth === 'strike' ? '好球' : '壞球'}。${why}`, ok ? 'good' : 'bad', 2600);
    S.phase = S.n >= TOTAL ? 'over' : 'reveal';
    if (S.phase === 'over'){
      const pct = Math.round(S.right / TOTAL * 100);
      setTimeout(() => ui.flash(`判對 ${S.right}/${TOTAL}（${pct}%）。${pct >= 90 ? '正式主審就是你！' : pct >= 70 ? '很穩，可以去二軍執法了。' : '主審不好當吧？再試一次。'}`, 'big', 0), 2700);
      stamp('ump');
    }
    hud();
  };
  $('#g-next').addEventListener('click', next);
  $('#g-strike').addEventListener('click', () => judge('strike'));
  $('#g-ball').addEventListener('click', () => judge('ball'));
  gameKeys(e => {
    const k = e.key.toLowerCase();
    if (k === 'arrowleft' || k === 's'){ e.preventDefault(); judge('strike'); }
    else if (k === 'arrowright' || k === 'b'){ e.preventDefault(); judge('ball'); }
    else if ((k === ' ' || k === 'enter') && !e.target.closest('button')){ e.preventDefault(); next(); }
  });
  hud();
  gameLoop(now => {
    const c = ui.ctx;
    let windup = 0;
    if (S.phase === 'windup'){ windup = (now - S.t0) / WINDUP_MS; if (windup >= 1){ S.phase = 'pitch'; S.t0 = now; } }
    drawCatcherScene(c, {pitcherFrame:pitcherFrame(S,now,windup), batterFrame:batterFrame(S,now,windup), zone:S.phase === 'reveal' || S.phase === 'over' ? 'grid' : false});
    if (S.phase === 'pitch'){
      const p = (now - S.t0) / S.p.dur;
      if (p >= 1){ S.phase = 'call'; S.deadline = now + 3000; hud(); }
      const b = pitchPos(S.p, Math.min(p, 1)); drawBall(c, b.x, b.y, b.r);
    }
    if (S.phase === 'call' || S.phase === 'reveal' || (S.phase === 'over' && S.end)){
      drawMitt(c, S.end.x, S.end.y); drawBall(c, S.end.x, S.end.y, BALL_R);
    }
    if (S.phase === 'call'){
      const left = clamp01((S.deadline - now) / 3000);
      c.fillStyle = 'rgba(0,0,0,.4)'; c.fillRect(250, 20, 300, 10);
      c.fillStyle = left > .3 ? '#f3c969' : '#ff9d84'; c.fillRect(250, 20, 300 * left, 10);
      if (left <= 0) judge(null);
    }
    if ((S.phase === 'reveal' || S.phase === 'over') && S.end){
      // 放大鏡：看清楚球和好球帶邊線
      const mx = 680, my = 330, R = 70, k = 3;
      c.save(); c.beginPath(); c.arc(mx, my, R, 0, 7); c.clip();
      c.fillStyle = '#2a6e49'; c.fillRect(mx - R, my - R, R * 2, R * 2);
      c.translate(mx - S.end.x * k, my - S.end.y * k); c.scale(k, k);
      c.fillStyle = 'rgba(243,201,105,.18)'; c.fillRect(ZONE.x, ZONE.y, ZONE.w, ZONE.h);
      c.strokeStyle = '#f3c969'; c.lineWidth = 1; c.strokeRect(ZONE.x, ZONE.y, ZONE.w, ZONE.h);
      drawBall(c, S.end.x, S.end.y, BALL_R);
      c.restore();
      c.strokeStyle = '#f6efe0'; c.lineWidth = 3; c.beginPath(); c.arc(mx, my, R, 0, 7); c.stroke();
      c.fillStyle = '#f6efe0'; c.font = '700 13px sans-serif'; c.textAlign = 'center'; c.fillText('放大 3 倍', mx, my + R + 16);
    }
  });
}

/* ===================== 4. 線審體驗 ===================== */
const LINE_VIEW={x:400,half:4,radius:6,flyMs:1450,rollMs:700,callMs:3000};
const LINE_SCENE_ART=new Image();LINE_SCENE_ART.src='{{PLAYER:line-judge-stadium-v1}}';
const LINE_UMPIRE_ART=new Image();LINE_UMPIRE_ART.src='{{PLAYER:line-umpire-v1}}';
function classifyLineLanding(x){return x<=LINE_VIEW.x+LINE_VIEW.half+LINE_VIEW.radius?'fair':'foul';}
function lineBallPose(state,elapsed){
  const v=LINE_VIEW;
  if(elapsed<v.flyMs){
    const p=clamp01(elapsed/v.flyMs),h=Math.sin(p*Math.PI)*110;
    return {x:state.start.x+(state.land.x-state.start.x)*p,y:state.start.y+(state.land.y-state.start.y)*p,h,r:v.radius+h/45};
  }
  const p=clamp01((elapsed-v.flyMs)/v.rollMs);
  return {x:state.land.x+(state.roll.x-state.land.x)*p,y:state.land.y+(state.roll.y-state.land.y)*p,h:Math.sin(p*Math.PI)*17*(1-p),r:v.radius};
}
function drawLineBackdrop(c){
  if(LINE_SCENE_ART.complete&&LINE_SCENE_ART.naturalWidth)c.drawImage(LINE_SCENE_ART,0,0,LINE_SCENE_ART.naturalWidth,LINE_SCENE_ART.naturalHeight,0,0,GW,GH);
  else{const g=c.createLinearGradient(0,100,0,450);g.addColorStop(0,'#526e49');g.addColorStop(1,'#264b3a');c.fillStyle=g;c.fillRect(0,0,GW,GH);c.fillStyle='#213c38';c.fillRect(0,0,GW,81);c.fillStyle='#9d7957';c.fillRect(0,81,GW,19);}
  c.fillStyle='#ece6cf';c.fillRect(LINE_VIEW.x-LINE_VIEW.half,82,LINE_VIEW.half*2,GH-82);
  for(let y=100;y<GH;y+=13){c.fillStyle='rgba(255,253,235,.2)';c.fillRect(397,y,2,5);}
  c.fillStyle='#c5a257';c.fillRect(397,15,6,68);c.fillStyle='#e8c76c';c.fillRect(398,15,2,68);
  if(LINE_UMPIRE_ART.complete&&LINE_UMPIRE_ART.naturalWidth){
    ell(c,707,365,43,5,'rgba(20,38,22,.22)');
    c.drawImage(LINE_UMPIRE_ART,0,0,LINE_UMPIRE_ART.naturalWidth,LINE_UMPIRE_ART.naturalHeight,650,207,112,168);
  }
  rrect(c,19,17,239,49,4,'rgba(13,31,30,.86)');c.textAlign='left';c.font='600 9px sans-serif';c.fillStyle='#c2b18c';c.fillText('FIELD EXPERIENCE / 04',32,35);c.font='600 17px sans-serif';c.fillStyle='#f1ebd8';c.fillText('界線上的一瞬間',32,55);
  c.font='11px sans-serif';c.fillStyle='rgba(241,235,216,.7)';c.fillText('界外標竿',416,31);
  c.textAlign='right';c.font='600 11px sans-serif';c.fillStyle='#c8d2be';c.fillText('FAIR / 界內',365,378);c.textAlign='left';c.fillText('FOUL / 界外',435,378);
}
function drawLineZoom(c,land){
  const x=22,y=236,w=235,h=147,k=Math.min(6,88/(Math.abs(land.x-LINE_VIEW.x)+LINE_VIEW.radius+LINE_VIEW.half)),cx=(land.x+LINE_VIEW.x)/2;
  rrect(c,x,y,w,h,5,'rgba(12,30,29,.94)');c.font='600 10px sans-serif';c.textAlign='left';c.fillStyle='#d4c49b';c.fillText(`第一落地點 / ${k.toFixed(1)}×`,x+13,y+21);
  const bx=x+12,by=y+33,bw=w-24,bh=90,sw=bw/k,sh=bh/k;
  if(LINE_SCENE_ART.complete&&LINE_SCENE_ART.naturalWidth){const aw=LINE_SCENE_ART.naturalWidth/GW,ah=LINE_SCENE_ART.naturalHeight/GH;c.drawImage(LINE_SCENE_ART,(cx-sw/2)*aw,(land.y-sh/2)*ah,sw*aw,sh*ah,bx,by,bw,bh);}
  else{c.fillStyle='#496a45';c.fillRect(bx,by,bw,bh);}
  const lineX=bx+bw/2+(LINE_VIEW.x-cx)*k,ballX=bx+bw/2+(land.x-cx)*k;
  c.fillStyle='#ede5cb';c.fillRect(lineX-LINE_VIEW.half*k,by,LINE_VIEW.half*2*k,bh);
  drawBall(c,ballX,by+bh/2,LINE_VIEW.radius*k);
  c.fillStyle='#ced5bd';c.font='10px sans-serif';c.fillText('以球第一次接觸地面的位置判斷',x+13,y+h-10);
}
function drawLineScene(c,state,elapsed=0){
  drawLineBackdrop(c);
  const review=state.phase==='reveal'||state.phase==='over';
  if(state.land){
    const p=lineBallPose(state,elapsed);
    ell(c,p.x,p.y,7+p.h*.045,3+p.h*.012,'rgba(13,26,20,.3)');
    drawBall(c,p.x,p.y-p.h,p.r);
    if(elapsed>=LINE_VIEW.flyMs){
      ell(c,state.land.x,state.land.y,5,2,'rgba(31,45,24,.36)');
      if(review&&!state.replaying){c.strokeStyle='#e7c98e';c.lineWidth=1.5;c.beginPath();c.arc(state.land.x,state.land.y,14,0,Math.PI*2);c.stroke();}
    }
  }
  if(review)drawLineZoom(c,state.land);
  rrect(c,22,398,756,36,4,'rgba(12,30,29,.9)');c.textAlign='left';c.fillStyle='#e9e4d1';c.font='12px sans-serif';
  const message=state.replaying?'慢動作回看 · 0.35×':{idle:'先看第一落地點，再做出你的判決。',fly:'觀察第一次觸地；落地後的滾動不改變判決。',call:'界內，還是界外？請做出你的判決。',reveal:'落點已標示。可以回看這一球，或繼續挑戰。',over:'八球判決完成。回看最後一球，或再挑戰一次。'}[state.phase];
  c.fillText(message,35,421);
  if(state.phase==='call'){
    c.fillStyle='#4c5c50';c.fillRect(552,414,205,3);c.fillStyle=state.remaining<.3?'#dcab87':'#d5c08e';c.fillRect(552,414,205*state.remaining,3);
  }
}
function lineGame(host){
  const TOTAL=8,v=LINE_VIEW;
  const ui=gameUI(host,{aria:'線審體驗：沿右外野界線俯瞰，觀察棒球第一次落地的位置',learn:'<b>規則</b>：這個練習的落點都在一壘以外。界線本身屬於界內；球第一次落地時只要碰到線，就是界內，後續滾動不影響判決。<br><b>操作</b>：落地後 3 秒內按界內（← / F）或界外（→ / J）。判決後可放大觀察落點，並以慢動作回看。'});
  const S={phase:'idle',n:0,right:0,land:null,start:null,roll:null,t0:0,deadline:0,truth:null,call:null,remaining:1,replaying:false,replayStart:0};
  ui.controls.classList.add('base-desk','line-desk');
  ui.controls.innerHTML=`<div class="base-brief"><span class="base-eyebrow">ON THE LINE</span><h3>落點，決定這一球</h3><p>界內與界外，有時只差一道粉線。<br>盯住第一次觸地的瞬間。</p></div><button type="button" class="btn btn-gold big-action" id="g-next">開始第一球 →</button><p class="base-phase" id="g-line-phase" role="status"></p><div class="call-btns"><button type="button" class="call strike" id="g-fair" disabled><span>FAIR</span>界內<small>← / F</small></button><button type="button" class="call ball" id="g-foul" disabled><span>FOUL</span>界外<small>→ / J</small></button></div><div class="base-result" id="g-line-result" hidden></div><button type="button" class="line-review" id="g-review" disabled>↺ 慢動作回看</button>`;
  const hud=()=>{
    const current=Math.min(S.n+(['idle','fly','call'].includes(S.phase)?1:0),TOTAL);
    ui.hud.innerHTML=`<span class="stat">第 <b>${current}</b> / ${TOTAL} 球</span><span class="stat">判對 <b>${S.right}</b></span>`;
    $('#g-fair').disabled=$('#g-foul').disabled=S.phase!=='call';
    $('#g-next').disabled=['fly','call'].includes(S.phase)||S.replaying;
    $('#g-next').textContent=S.phase==='over'?'再挑戰一次 →':S.phase==='idle'?'開始第一球 →':'下一球 →';
    $('#g-review').disabled=!['reveal','over'].includes(S.phase)||S.replaying;
    $('#g-line-phase').textContent=S.replaying?'正在慢動作回看':{idle:'準備好後，開始觀察。',fly:'球在飛行中',call:'現在，輪到你判決。',reveal:'判決完成，可回看或繼續。',over:'八球挑戰完成'}[S.phase];
    ui.tip.textContent=S.replaying?'慢動作 · 0.35×':S.phase==='call'?'3 秒判決時間':'右外野 · 第一落地點';
    const result=$('#g-line-result');result.hidden=!['reveal','over'].includes(S.phase);
    if(!result.hidden){const touching=Math.abs(S.land.x-v.x)<=v.half+v.radius;result.innerHTML=`<span class="base-eyebrow">${S.call===S.truth?'CORRECT CALL':S.call===null?'TIME EXPIRED':'REVIEW THE LANDING'}</span><strong>${S.truth==='fair'?'界內 FAIR':'界外 FOUL'}</strong><p>${touching?'球碰到了白線，界線屬於界內。':S.truth==='fair'?'第一次落地在界內側。':'球第一次落地時完全在線外。'}</p>`;}
  };
  const next=()=>{
    if(S.replaying)return;
    if(S.phase==='over'){Object.assign(S,{phase:'idle',n:0,right:0,land:null,start:null,roll:null,truth:null,call:null,replaying:false});ui.flash('','',0);hud();return;}
    if(!['idle','reveal'].includes(S.phase))return;
    const dx=Math.random()<.6?rnd(-(v.half+v.radius)-9,v.half+v.radius+9):(Math.random()<.5?-1:1)*rnd(26,130);
    S.land={x:v.x+dx,y:rnd(175,295)};S.start={x:v.x+rnd(-155,60),y:467};S.truth=classifyLineLanding(S.land.x);
    const angle=Math.atan2(S.land.y-S.start.y,S.land.x-S.start.x)+rnd(-.5,.5);
    S.roll={x:S.land.x+Math.cos(angle)*rnd(50,100),y:S.land.y+Math.sin(angle)*rnd(50,100)};
    Object.assign(S,{phase:'fly',t0:performance.now(),remaining:1,call:null});ui.flash('','',0);hud();
  };
  const judge=call=>{
    if(S.phase!=='call')return;
    S.n++;S.call=call;const ok=call===S.truth;if(ok)S.right++;
    S.phase=S.n>=TOTAL?'over':'reveal';
    ui.flash(S.phase==='over'?`八球完成，判對 ${S.right}/${TOTAL}。`:`${ok?'判對了':'這次再看清楚'} · ${S.truth==='fair'?'界內':'界外'}`,ok?'good':'bad',S.phase==='over'?0:2400);
    if(S.phase==='over')stamp('line');hud();
  };
  const replay=()=>{if(!['reveal','over'].includes(S.phase)||S.replaying)return;S.replaying=true;S.replayStart=performance.now();hud();};
  $('#g-next').addEventListener('click',next);$('#g-fair').addEventListener('click',()=>judge('fair'));$('#g-foul').addEventListener('click',()=>judge('foul'));$('#g-review').addEventListener('click',replay);
  gameKeys(e=>{const k=e.key.toLowerCase();if(k==='arrowleft'||k==='f'){e.preventDefault();judge('fair');}else if(k==='arrowright'||k==='j'){e.preventDefault();judge('foul');}else if(k==='r'){e.preventDefault();replay();}else if((k===' '||k==='enter')&&!e.target.closest('button')){e.preventDefault();next();}});
  hud();
  gameLoop(now=>{
    let elapsed=now-S.t0;
    if(S.replaying){elapsed=v.flyMs-600+(now-S.replayStart)*.35;if(elapsed>=v.flyMs+v.rollMs){S.replaying=false;hud();}}
    if(S.phase==='fly'&&elapsed>=v.flyMs+v.rollMs){S.phase='call';S.deadline=now+v.callMs;hud();}
    if(S.phase==='call'){S.remaining=clamp01((S.deadline-now)/v.callMs);if(S.remaining<=0)judge(null);}
    drawLineScene(ui.ctx,S,elapsed);
  });
}


/* ===================== 5. 壘審體驗 ===================== */
const BASE_ART=new Image();BASE_ART.src='{{PLAYER:first-base-v1}}';
const BASE_STADIUM=new Image();BASE_STADIUM.src='{{PLAYER:first-base-stadium-v1}}';
const BASE_VIEW={bagX:560,ground:361,scale:.65,runnerStart:214};
function basePose(t,tr,tb){
  const contact=Math.abs(t-tr)<.055;
  return {
    runnerFrame:contact?3:((Math.floor((t-tr)*9)+3)%8+8)%8,
    runnerFoot:BASE_VIEW.runnerStart+(BASE_VIEW.bagX-BASE_VIEW.runnerStart)*Math.min(t/tr,1.23),
    fielderFrame:t>=tb?11:t>tb-.22?10:t>tb-.5?9:8,
    caught:t>=tb,touched:t>=tr,
    ballProgress:clamp01((t-(tb-.58))/.58)
  };
}
function drawBaseBackdrop(c){
  if(BASE_STADIUM.complete&&BASE_STADIUM.naturalWidth){
    c.drawImage(BASE_STADIUM,0,0,BASE_STADIUM.naturalWidth,BASE_STADIUM.naturalHeight,0,0,GW,GH);
  }else{
  let g=c.createLinearGradient(0,0,0,285);g.addColorStop(0,'#101e27');g.addColorStop(1,'#43534c');
  c.fillStyle=g;c.fillRect(0,0,GW,GH);
  // Layered grandstand, aisle lighting and restrained spectator silhouettes.
  fieldPath(c,[{x:0,y:92},{x:800,y:64},{x:800,y:203},{x:0,y:226}],'#1c3035');
  for(let row=0;row<7;row++){
    const y=103+row*15;
    c.strokeStyle='rgba(165,188,180,.14)';c.lineWidth=1;c.beginPath();c.moveTo(0,y+20);c.lineTo(800,y-8);c.stroke();
    for(let seat=0;seat<65;seat++){
      const u=((seat*31+row*19)%97)/97,x=seat*12.8+(row%2)*5,sy=y+17-x*.035;
      c.fillStyle=['#84948a','#b3afa0','#566e70','#968c75'][Math.floor(u*4)];c.globalAlpha=.25+u*.27;
      c.fillRect(x,sy,3,4);c.fillStyle='#1b2c31';c.fillRect(x-1,sy+4,5,4);
    }
  }
  c.globalAlpha=1;
  for(const x of [100,338,600,772]){
    c.fillStyle='rgba(9,22,26,.65)';c.fillRect(x,80,6,133);
    c.fillStyle='rgba(211,211,173,.12)';c.fillRect(x-8,96,2,111);
  }
  for(const x of [62,720]){
    const light=c.createRadialGradient(x,43,4,x,43,100);light.addColorStop(0,'rgba(247,236,193,.32)');light.addColorStop(1,'rgba(247,236,193,0)');
    c.fillStyle=light;c.fillRect(x-100,0,200,143);c.fillStyle='#15272c';c.fillRect(x-29,30,61,23);
    for(let j=0;j<6;j++){c.fillStyle='#e6e1bc';c.fillRect(x-23+j*10,35,6,11);}
  }
  fieldPath(c,[{x:0,y:216},{x:800,y:188},{x:800,y:251},{x:0,y:272}],'#24423d');
  c.strokeStyle='#c4b892';c.lineWidth=3;c.beginPath();c.moveTo(0,216);c.lineTo(800,188);c.stroke();
  for(let x=0;x<800;x+=100){c.strokeStyle='rgba(9,25,26,.4)';c.lineWidth=2;c.beginPath();c.moveTo(x,216-x*.035);c.lineTo(x,272-x*.026);c.stroke();}
  c.fillStyle='rgba(219,222,205,.42)';c.font='600 11px sans-serif';c.textAlign='center';c.fillText('TAIWAN  /  BASEBALL',650,229);
  g=c.createLinearGradient(0,250,0,380);g.addColorStop(0,'#50684d');g.addColorStop(1,'#344f40');c.fillStyle=g;c.fillRect(0,272,800,178);
  for(let stripe=0;stripe<8;stripe++)fieldPath(c,[{x:stripe*130-240,y:261},{x:stripe*130-185,y:261},{x:stripe*180-70,y:450},{x:stripe*180-160,y:450}],'rgba(159,176,122,.045)');
  g=c.createLinearGradient(0,308,0,450);g.addColorStop(0,'#96734e');g.addColorStop(1,'#b6946e');
  c.beginPath();c.moveTo(0,333);c.quadraticCurveTo(270,278,800,303);c.lineTo(800,450);c.lineTo(0,450);c.closePath();c.fillStyle=g;c.fill();
  for(let i=0;i<700;i++){
    const x=(i*127.37)%800,y=312+(i*71.13)%138;
    if(y<334-x*.035)continue;
    c.fillStyle=i%2?'rgba(58,39,22,.09)':'rgba(243,217,173,.12)';c.fillRect(x,y,i%3+1,.7);
  }
  }
  c.strokeStyle='rgba(251,242,218,.78)';c.lineWidth=2.2;c.beginPath();c.moveTo(0,358);c.lineTo(800,358);c.stroke();
  // A raised bag with a top face, stitched edges and a short ground shadow.
  ell(c,563,359,29,4,'rgba(41,30,23,.2)');
  fieldPath(c,[{x:539,y:349},{x:566,y:344},{x:582,y:352},{x:553,y:358}],'#f6f1df','#e2dac3');
  fieldPath(c,[{x:553,y:358},{x:582,y:352},{x:582,y:357},{x:553,y:363}],'#cec7b0');
  fieldPath(c,[{x:539,y:349},{x:553,y:358},{x:553,y:363},{x:539,y:354}],'#e4ddc8');
}
function drawBaseActor(c,frame,anchor,x,y,scale=BASE_VIEW.scale){
  if(!BASE_ART.complete||!BASE_ART.naturalWidth)return;
  // Individually measured bounds preserve the glove and cleats that cross an
  // atlas cell edge. Coordinates below use the delivered 1448×1086 artwork.
  const crops=[[0,0,380,360],[405,0,280,360],[735,0,320,360],[1090,0,358,360],
    [0,362,380,362],[400,362,310,362],[735,362,340,362],[1090,362,358,362],
    [80,725,220,315],[380,738,315,306],[682,780,396,264],[1080,780,368,264]];
  const [sx,sy,w,h]=crops[frame],ox=(frame%4)*362,oy=Math.floor(frame/4)*362,s=scale;
  c.save();
  if(frame===9||frame===10){
    // Exclude a neighbouring pose's glove/heel at the crop's opposite corner.
    c.beginPath();
    const points=frame===9?[[0,0],[300,0],[300,168],[315,168],[315,h],[0,h]]:[[0,0],[w,0],[w,h],[35,h],[35,210],[0,210]];
    points.forEach(([px,py],i)=>c[i?'lineTo':'moveTo'](x+(sx-ox-anchor[0]+px)*s,y+(sy-oy-anchor[1]+py)*s));c.closePath();c.clip();
  }
  c.drawImage(BASE_ART,sx,sy,w,h,x+(sx-ox-anchor[0])*s,y+(sy-oy-anchor[1])*s,w*s,h*s);
  c.restore();
}
function drawBaseScene(c,{t=0,tr=1.35,tb=1.43,phase='idle'}={}){
  drawBaseBackdrop(c);
  const pose=basePose(t,tr,tb),idle=phase==='idle';
  const foot=idle?BASE_VIEW.runnerStart:pose.runnerFoot;
  ell(c,foot-42,366,39,5,'rgba(33,28,20,.2)');ell(c,514,353,62,5,'rgba(33,28,20,.22)');
  const ff=idle?8:pose.fielderFrame,anchors={8:[260,306],9:[298,300],10:[330,303],11:[338,303]};
  drawBaseActor(c,ff,anchors[ff],565,349,.60);
  drawBaseActor(c,idle?3:pose.runnerFrame,[325,337],foot,BASE_VIEW.ground);
  if(!idle&&t>tb-.58&&!pose.caught){
    const p=pose.ballProgress;
    drawBall(c,56+(362-56)*p,156+(234-156)*p-Math.sin(p*Math.PI)*21,4.2);
  }
  rrect(c,20,18,218,53,5,'rgba(12,29,32,.82)');
  c.textAlign='left';c.fillStyle='#c8b78d';c.font='600 10px sans-serif';c.fillText('FIELD EXPERIENCE / 05',34,37);
  c.fillStyle='#f2eee0';c.font='600 18px sans-serif';c.fillText('一壘的瞬間',34,58);
  const replay=['replay','reveal','over'].includes(phase);
  rrect(c,664,22,116,27,4,replay?'#b69764':'rgba(12,29,32,.8)');c.textAlign='center';c.font='600 11px sans-serif';c.fillStyle=replay?'#162e2b':'#e3ddca';c.fillText(replay?'REPLAY · 0.2×':phase==='call'?'等待判決':'FIRST BASE',722,40);
  rrect(c,20,394,760,40,5,'rgba(15,32,34,.9)');
  c.textAlign='left';c.font='12px sans-serif';c.fillStyle='#e6dfca';
  if(replay){
    const end=Math.max(tr,tb)+.3,elapsed=Math.min(t,end),x0=236,x1=743;
    c.fillText(`慢動作重播  ${elapsed.toFixed(2)} s`,34,419);
    c.strokeStyle='#52635d';c.lineWidth=2;c.beginPath();c.moveTo(x0,415);c.lineTo(x1,415);c.stroke();
    c.strokeStyle='#c8b78d';c.beginPath();c.moveTo(x0,415);c.lineTo(x0+(x1-x0)*elapsed/end,415);c.stroke();
    for(const [event,color] of [[tr,'#b4dcc3'],[tb,'#e7b98d']])ell(c,x0+(x1-x0)*event/end,415,4,4,color);
    if(pose.touched)ell(c,560,353,24,10,'rgba(180,220,195,.22)');
    if(pose.caught)ell(c,374,234,19,19,'rgba(231,185,141,.23)');
  }else c.fillText(idle?'觀察重點：跑者的腳與一壘手的手套。':phase==='call'?'這一次，球先到，還是腳先到？請按下你的判決。':'留意壘包與手套；先後可能只差一瞬間。',34,419);
}
function baseGame(host){
  const TOTAL = 6;
  const ui = gameUI(host, {aria:'壘審體驗：一壘前的跑者與傳球，判斷安全上壘或出局',
    learn:'<b>規則</b>：滾地球傳一壘的封殺，<b>球先進一壘手的手套</b>（一壘手腳踩著壘包）就是出局；<b>跑者先踩到壘包</b>，就是安全上壘。<br><b>怎麼玩</b>：看完這一跑，判決：安全上壘（← 或 S）、出局（→ 或 O）。判完會用慢動作重播。'});
  const S = {phase:'idle', n:0, right:0, tr:0, tb:0, t0:0, speed:1, truth:null, call:null};
  ui.controls.classList.add('base-desk');
  ui.controls.innerHTML = `<div class="base-brief"><span class="base-eyebrow">THE CLOSE CALL</span><h3>你的一瞬間判決</h3><p>看腳，也看手套。<br>在極短的時間差裡，做出你的判斷。</p></div>
    <button type="button" class="btn btn-gold big-action" id="g-next">開始這一跑 ▶</button>
    <p class="base-phase" id="g-base-phase" role="status"></p>
    <div class="call-btns"><button type="button" class="call strike" id="g-safe" disabled><span>SAFE</span>安全上壘<small>← / S</small></button><button type="button" class="call ball" id="g-out" disabled><span>OUT</span>出局<small>→ / O</small></button></div>
    <div class="base-result" id="g-base-result" hidden></div>`;
  const hud = () => {
    ui.hud.innerHTML = `<span class="stat">第 <b>${Math.min(S.n + (S.phase === 'idle' ? 1 : 0), TOTAL)}</b> / ${TOTAL} 次</span><span class="stat">判對 <b>${S.right}</b></span>`;
    $('#g-safe').disabled = $('#g-out').disabled = S.phase !== 'call';
    $('#g-next').textContent = S.phase === 'over' ? '再當一次壘審' : '開始這一跑 ▶';
    $('#g-next').disabled = S.phase === 'run' || S.phase === 'call' || S.phase === 'replay';
    $('#g-base-phase').textContent = {idle:'準備好後，開始觀察這一跑。',run:'觀察中 · 請留意壘包與手套',call:'輪到你判決',replay:'重播中 · 以 0.2 倍速確認先後',reveal:'已完成這次判決，可以開始下一跑。',over:'六次判決完成'}[S.phase];
    ui.tip.textContent = S.phase==='replay'?'慢動作回看':S.phase==='call'?'請做出判決':'一壘封殺判讀';
    const result=$('#g-base-result');result.hidden=!['replay','reveal','over'].includes(S.phase);
    if(!result.hidden)result.innerHTML=`<span class="base-eyebrow">${S.call===S.truth?'CORRECT CALL':'REVIEW THE PLAY'}</span><strong>${S.truth==='safe'?'安全上壘':'出局'}</strong><p>${S.truth==='safe'?'腳先到壘包':'球先進手套'}，相差 <b>${Math.round(Math.abs(S.tb-S.tr)*1000)} ms</b></p><div><span>腳踩壘包 <b>${S.tr.toFixed(3)} s</b></span><span>球進手套 <b>${S.tb.toFixed(3)} s</b></span></div>`;
  };
  const next = () => {
    if (S.phase === 'over'){ Object.assign(S, {phase:'idle', n:0, right:0,tr:0,tb:0,call:null,truth:null}); ui.flash('','',0); hud(); return; }
    if (S.phase !== 'idle' && S.phase !== 'reveal') return;
    S.tr = rnd(1.25, 1.45);
    const delta = (Math.random() < .5 ? -1 : 1) * rnd(.035, .2);
    S.tb = S.tr + delta;
    S.truth = S.tr < S.tb ? 'safe' : 'out';
    S.phase = 'run'; S.t0 = performance.now(); S.speed = 1;
    ui.flash('','',0);
    hud();
  };
  const judge = call => {
    if (S.phase !== 'call') return;
    S.n++; S.call = call;
    const ok = call === S.truth;
    if (ok) S.right++;
    ui.flash(`${ok ? '✓ 判對了' : '✗ 判錯了'}｜${S.truth === 'safe' ? '安全上壘' : '出局'}：${S.truth === 'safe' ? '跑者' : '球'}早了 ${Math.round(Math.abs(S.tb - S.tr) * 1000)} 毫秒。慢動作重播中……`, ok ? 'good' : 'bad', 3200);
    S.phase = 'replay'; S.t0 = performance.now(); S.speed = .2;
    hud();
  };
  $('#g-next').addEventListener('click', next);
  $('#g-safe').addEventListener('click', () => judge('safe'));
  $('#g-out').addEventListener('click', () => judge('out'));
  gameKeys(e => {
    const k = e.key.toLowerCase();
    if (k === 'arrowleft' || k === 's'){ e.preventDefault(); judge('safe'); }
    else if (k === 'arrowright' || k === 'o'){ e.preventDefault(); judge('out'); }
    else if ((k === ' ' || k === 'enter') && !e.target.closest('button')){ e.preventDefault(); next(); }
  });
  hud();
  gameLoop(now => {
    const t = S.phase === 'idle' && !S.tr ? 0 : S.phase === 'run' || S.phase === 'replay'
      ? (now-S.t0)/1000*S.speed : Math.max(S.tr,S.tb)+.3;
    drawBaseScene(ui.ctx,{t,tr:S.tr||1.35,tb:S.tb||1.43,phase:S.phase});
    if (S.phase === 'run' && t > Math.max(S.tr, S.tb) + .3){ S.phase = 'call'; hud(); }
    if (S.phase === 'replay' && t > Math.max(S.tr, S.tb) + .3){
      S.phase = S.n >= TOTAL ? 'over' : 'reveal';
      if (S.phase === 'over'){ ui.flash(`判對 ${S.right}/${TOTAL}。${S.right >= 5 ? '眼明手快，壘審就是你！' : '差 0.1 秒的球，連職業壘審都要重播。'}`, 'big', 0); stamp('base'); }
      hud();
    }
  });
}

function celebrateGame(ui){
  if (reduceMotion.matches) return;
  const stage = ui.canvas.parentElement;
  const colors = ['#f3c969','#d1553b','#f6efe0','#4f8fd1','#5bbf8a'];
  for (let i = 0; i < 28; i++){
    const p = document.createElement('i');
    p.className = 'confetti';
    const a = Math.random() * Math.PI * 2, d = 60 + Math.random() * 120;
    p.style.cssText = `left:${30 + Math.random() * 40}%;top:${20 + Math.random() * 20}%;--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d}px;background:${colors[i % 5]}`;
    stage.append(p);
    setTimeout(() => p.remove(), 1400);
  }
}

const GAMES = {
  bat:{title:'打擊練習', kicker:'球場體驗館 · BATTING', run:battingGame},
  pitch:{title:'投球挑戰', kicker:'球場體驗館 · PITCHING', run:pitchingGame},
  ump:{title:'主審體驗：好球還是壞球？', kicker:'球場體驗館 · HOME PLATE UMPIRE', run:umpireGame},
  line:{title:'線審體驗：界內還是界外？', kicker:'球場體驗館 · LINE JUDGE', run:lineGame},
  base:{title:'壘審體驗：安全還是出局？', kicker:'球場體驗館 · BASE UMPIRE', run:baseGame}
};
