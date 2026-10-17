const fs=require('node:fs');let h=fs.readFileSync('index.html','utf8');
const controls=`
<section id="data-film" class="data-film" aria-label="球場數據動畫" hidden>
 <div class="film-controls"><button id="film-play" class="film-play">▶ 播放歷史動畫</button><button id="film-reset" aria-label="回到本片段起點">↺ 重看</button><label class="film-scrubber" for="film-seek"><span id="film-year-label">1990</span><input type="range" id="film-seek" min="1990" max="2026" value="1990" aria-label="動畫年份"></label><label class="film-speed-label">節奏 <select id="film-speed"><option value="2600">正常</option><option value="1500">快速</option><option value="4200">慢看</option></select></label><label class="film-chapter-toggle"><input type="checkbox" id="film-chapters" checked> 大事暫停</label><button id="film-continue" hidden>繼續下一幕 →</button></div>
 <div class="film-status-row"><span id="film-status" role="status" aria-live="polite">按播放，讓數據走進球場。</span><button class="film-text" id="film-full">完整 1990–2026</button></div>
 <div class="film-clips" aria-label="主題動畫"><span>先看一段：</span><button data-film-route="merger">1996–2003 · 兩聯盟到整合</button><button data-film-route="crisis">2008–2009 · 看台散去</button><button data-film-route="return">2023–2025 · 觀眾回來</button></div>
 <div class="film-trend-heading"><strong>中職歷年平均進場人次</strong><span id="film-comparison">1990–2025 · 點曲線上的年份可跳轉</span></div>
 <div class="film-trend-scroll" tabindex="0" role="region" aria-label="歷年平均觀眾曲線，可左右捲動"><div class="film-trend" id="film-trend"></div></div>
 <p class="film-data-note">每個人影約代表 50 人次，是中職全聯盟年度平均的視覺換算，並非老球場容量、實際上座率或當年比賽現場；隊伍圖案為年度名錄示意。觀眾資料不含 TML，2026 未收錄完整年度數據。<button class="film-text" data-walk-archive="records">數據來源與統計口徑 ↗</button></p>
</section>`;
const overlay=`
<div id="film-world" class="film-world" hidden><svg id="film-crowd" class="film-crowd" viewBox="0 0 1672 941" aria-hidden="true"></svg><div id="film-lineup" class="film-lineup" aria-label="當年球隊進退場"></div></div>
`;
const hud=`
<div id="film-hud" class="film-hud" hidden><span>SEASON IN MOTION</span><strong id="film-hud-year">1990</strong><div><b id="film-hud-average">—</b><small>中職平均進場人次</small></div><p id="film-hud-teams">中職 4 隊</p></div>
<aside id="film-chapter" class="film-chapter" hidden aria-label="歷史動畫章節"><span id="film-chapter-label">HISTORY CHAPTER</span><h3 id="film-chapter-title"></h3><p id="film-chapter-copy"></p><div id="film-chapter-actions"></div></aside>
`;
h=h.replace('<div class="walk-route">',controls+'\n<div class="walk-route">');
h=h.replace('<div class="walk-board-face walk-inside"',overlay+'\n<div class="walk-board-face walk-inside"');
h=h.replace('<div class="walk-lightwash"',hud+'\n<div class="walk-lightwash"');
h=h.replace('data-walk-room="stands" style="left:41%;top:65%"','data-walk-room="stands" style="left:24%;top:83%"');
const css=`
.data-film{padding:18px 24px 16px;background:#102f27;border-top:1px solid #7d8d68;color:#f3e9c8}.data-film[hidden],.film-world[hidden],.film-hud[hidden],.film-chapter[hidden],#film-continue[hidden]{display:none}.film-controls{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.film-controls button,.film-clips button{border:1px solid #8a9a77;border-radius:4px;background:transparent;color:#ece6c8;padding:8px 12px;font-size:12px;min-height:38px}.film-controls .film-play{background:#e9ca87;color:#193c2c;border-color:#e9ca87;font-weight:750;min-width:150px}.film-controls #film-continue{background:#ead7ac;color:#193e2b;font-weight:700}.film-scrubber{display:flex;gap:12px;align-items:center;flex:1;min-width:200px}.film-scrubber span{font:700 25px Georgia,serif;min-width:65px;color:#efd997}.film-scrubber input{accent-color:#e7c987;width:100%;min-width:70px}.film-speed-label,.film-chapter-toggle{font-size:11px;display:flex;align-items:center;gap:4px}.film-speed-label select{background:#214535;color:#efe9ce;border:1px solid #6d8664;padding:5px;border-radius:3px;font:inherit}.film-status-row{display:flex;justify-content:space-between;gap:16px;margin:10px 0;font-size:12px;color:#c9d4b7;min-height:22px}.film-text{font-size:11px;color:inherit;border:0;background:transparent;text-decoration:underline;text-underline-offset:3px;padding:0}.film-clips{display:flex;gap:7px;flex-wrap:wrap;align-items:center;padding:9px 0 14px;border-bottom:1px solid #536c50}.film-clips>span{font-size:11px;color:#cbd3b6}.film-clips button{font-size:11px;min-height:30px;padding:5px 10px}.film-clips button[aria-pressed="true"]{background:#ece0bd;color:#20402d}.film-trend-heading{display:flex;justify-content:space-between;gap:15px;font-size:11px;padding:12px 0 0}.film-trend-heading strong{font-weight:500}.film-trend-heading span{color:#becbae}.film-trend-scroll{overflow-x:auto;overscroll-behavior-x:contain}.film-trend{position:relative;min-width:720px;height:140px}.film-trend svg{width:100%;height:140px;display:block}.trend-hit{position:absolute;width:24px;height:28px;transform:translate(-50%,-50%);border:0;background:transparent;border-radius:50%;padding:0;color:#eee6c4}.trend-hit:after{content:'';display:block;width:5px;height:5px;border-radius:50%;background:#afc49b;margin:auto;border:1px solid #e2d69d}.trend-hit[aria-current="true"]:after{width:10px;height:10px;background:#efc774;box-shadow:0 0 0 5px #efd79722}.trend-hit span{display:none;position:absolute;bottom:28px;left:50%;transform:translateX(-50%);padding:4px 7px;background:#f6e9c8;color:#24412e;border-radius:3px;font:11px monospace;white-space:nowrap;z-index:2}.trend-hit:hover span,.trend-hit:focus-visible span{display:block}.film-data-note{font-size:10px;line-height:1.8;color:#bac7a8;margin:9px 0 0;max-width:110ch}.film-data-note button{margin-left:10px}.film-world{position:absolute;inset:0;pointer-events:none;z-index:1}.film-crowd{position:absolute;width:100%;height:100%;inset:0;overflow:visible}.fan-person{transition:opacity .65s,transform .65s;transform-box:fill-box;transform-origin:center bottom;opacity:0}.film-lineup{position:absolute;inset:0;pointer-events:none}.film-team{position:absolute;left:var(--team-x);top:var(--team-y);pointer-events:auto;transform:translate(-50%,-50%);border:0;background:transparent;padding:0;text-align:center;white-space:nowrap;min-width:50px}.film-team .field-shirt{display:grid;place-items:center;background:var(--shirt);width:25px;height:28px;margin:auto;color:#fff7df;font:700 12px Georgia,serif;clip-path:polygon(25% 0,40% 7%,60% 7%,75% 0,100% 22%,85% 42%,75% 37%,75% 100%,25% 100%,25% 37%,15% 42%,0 22%);filter:drop-shadow(0 2px 2px #0004)}.film-team .field-name{display:block;font-size:8px;font-weight:600;line-height:1.4;color:#fff7dc;background:#183d30db;border-radius:2px;padding:2px 4px;margin-top:3px}.film-team .field-change{display:block;background:#ead49b;color:#25462e;border-radius:2px;font-size:8px;padding:1px 3px;margin-top:2px}.film-team.added{animation:field-team-enter .9s cubic-bezier(.2,.7,.2,1) both;animation-delay:var(--team-delay)}.film-team.departing{animation:field-team-exit .75s both;pointer-events:none}.film-team.renamed .field-shirt{animation:field-shirt-turn .75s}.film-hud{position:absolute;left:3%;top:4%;z-index:3;padding:13px 18px;background:#123e31e8;color:#f7ecc7;border-left:3px solid #ddbd72;pointer-events:none;min-width:175px;box-shadow:0 5px 20px #0002}.film-hud>span{font-size:8px;letter-spacing:2px;color:#c5cfac}.film-hud>strong{display:block;font:700 clamp(32px,5vw,60px)/1.1 Georgia,serif;color:#f0d89c;margin:4px 0 8px}.film-hud>div b{display:block;font:700 clamp(21px,3vw,35px)/1.2 Georgia,serif;font-variant-numeric:tabular-nums}.film-hud>div small{font-size:10px;color:#d5dbbe}.film-hud>p{font-size:10px;margin:9px 0 0;color:#e4debc}.film-chapter{position:absolute;top:5%;right:3%;width:min(290px,32%);padding:16px 18px;background:#f8edcfeF;border-top:3px solid #b96442;z-index:3;box-shadow:0 8px 24px #0003;color:#22432f;animation:ticket-unfold .4s both}.film-chapter>span{font-size:8px;letter-spacing:2px;color:#925139}.film-chapter h3{font:700 21px/1.4 Georgia,"PMingLiU",serif;margin:7px 0}.film-chapter p{font-size:11px;margin:8px 0;line-height:1.8}.film-chapter button{background:#254a35;color:#fff2ce;border:0;border-radius:3px;padding:6px 9px;font-size:10px;margin-right:6px;margin-top:6px}.walk-shell[data-film="true"] .walk-inside{filter:none}.film-world .film-team:hover .field-shirt{transform:translateY(-4px)}.film-legend-pill{position:absolute;left:36%;top:46%;background:#173c2dd9;color:#eee3bc;padding:3px 8px;border-radius:3px;font-size:8px;letter-spacing:1px;pointer-events:none}.film-scene-year{font:700 14px monospace;fill:#e4d6a5}.film-trend .trend-cursor{transition:x .55s,opacity .2s;stroke:#f2cf7e;stroke-width:1;stroke-dasharray:3 4}.walk-shell[data-room="scoreboard"] .film-hud{top:4%;left:3%}.walk-shell[data-room="scoreboard"] .film-world{opacity:.95}
@keyframes field-team-enter{from{left:83%;top:78%;opacity:0;transform:translate(-50%,-50%) scale(.4)}to{left:var(--team-x);top:var(--team-y);opacity:1;transform:translate(-50%,-50%) scale(1)}}@keyframes field-team-exit{from{opacity:.7;left:var(--team-x);top:var(--team-y)}to{opacity:0;left:83%;top:78%}}@keyframes field-shirt-turn{50%{transform:rotateY(90deg) translateY(-5px)}}
@media(max-width:800px){.film-controls{gap:8px}.film-scrubber{order:3;flex-basis:100%}.film-trend-heading{display:block}.film-trend-heading span{display:block;margin-top:4px}.film-status-row{font-size:11px}.film-hud{min-width:130px;padding:9px 12px}.film-hud>strong{font-size:35px}.film-hud>div b{font-size:24px}.film-chapter{width:32%;padding:10px 12px}.film-chapter h3{font-size:16px}.film-chapter p{font-size:10px}}
@media(max-width:600px){.data-film{padding:14px 13px}.film-controls .film-play{min-width:128px;font-size:11px;padding:8px}.film-controls>button{font-size:11px;padding:7px}.film-speed-label,.film-chapter-toggle{font-size:10px}.film-clips button{font-size:10px;padding:5px 7px}.film-hud{min-width:92px;padding:6px 8px;left:2%;top:3%;border-left-width:2px}.film-hud>span{font-size:5px;letter-spacing:1px}.film-hud>strong{font-size:27px;margin:2px 0 3px}.film-hud>div b{font-size:19px}.film-hud>div small{font-size:7px}.film-hud>p{font-size:7px;margin-top:3px}.film-team{min-width:30px}.film-team .field-shirt{width:17px;height:20px;font-size:9px}.film-team .field-name{font-size:6px;padding:1px 2px}.film-team .field-change{font-size:5px}.film-chapter{top:3%;right:2%;width:45%;padding:7px 9px}.film-chapter>span{font-size:6px;letter-spacing:1px}.film-chapter h3{font-size:14px;margin:4px 0}.film-chapter p{display:none}.film-chapter button{font-size:9px;padding:5px 7px;margin:3px 3px 0 0}.film-legend-pill{font-size:6px;padding:2px 4px;left:35%;top:44%}.film-data-note{font-size:9px}}
@media(prefers-reduced-motion:reduce){.fan-person,.film-trend .trend-cursor{transition:none!important}.film-team.added,.film-team.departing,.film-team.renamed .field-shirt{animation:none!important}.film-team.departing{display:none}}
`;
h=h.replace('</style>',css+'\n</style>');
const js=`
// Data film: checked annual records drive the crowd, parade, chart and chapters.
const filmClips={merger:{start:1996,end:2003,label:'兩聯盟到整合'},crisis:{start:2008,end:2009,label:'看台散去'},return:{start:2023,end:2025,label:'觀眾回來'}};
const filmChapterYears=new Set([1990,1997,2003,2009,2020,2024,2025]);
const film={playing:false,waiting:false,timer:null,delay:2600,pauseAt:true,driving:false,engaged:false,range:{start:1990,end:2026,label:'完整歷史'},lastYear:null,roster:[],displayed:null,target:null,frame:null,countStart:0};
function rosterForFilm(year){return leagues.flatMap(l=>seasonFor(year,l.id).members.map(m=>({key:l.id+':'+byStage[m.id].group,id:m.id,ids:m.stageIds,league:l.id,name:m.stageIds.map(id=>byStage[id].name.replace(/（.*$/,'')).join(' → '),color:byStage[m.id].color})));}
function filmChapter(year){return filmChapterYears.has(year)?events.find(e=>e.year===year):null;}
function settleFilmCounter(){
 if(film.frame!==null&&typeof cancelAnimationFrame==='function')cancelAnimationFrame(film.frame);
 film.frame=null;if(film.target!==null){film.displayed=film.target;$('#film-hud-average').textContent=numberText(film.target);}
}
function updateFilmCounter(value){
 if(value===film.target)return;
 if(film.frame!==null&&typeof cancelAnimationFrame==='function')cancelAnimationFrame(film.frame);film.frame=null;
 const from=film.displayed;film.target=value;
 if(value===null){film.displayed=null;$('#film-hud-average').textContent='—';return;}
 $('#film-hud-average').setAttribute('aria-label','年度平均進場 '+numberText(value)+' 人次');
 if(from===null||motionQuery?.matches||typeof requestAnimationFrame!=='function'||walk.room==='gate'||walk.room==='cinema'){
  film.displayed=value;$('#film-hud-average').textContent=numberText(value);return;
 }
 const start=performance.now();
 function frame(now){const t=Math.max(0,Math.min(1,(now-start)/650)),ease=1-Math.pow(1-t,3);film.displayed=Math.round(from+(value-from)*ease);$('#film-hud-average').textContent=numberText(film.displayed);film.frame=t<1?requestAnimationFrame(frame):null;}
 film.frame=requestAnimationFrame(frame);
}
function pauseFilm(reason='',clearWait=true){
 clearTimeout(film.timer);film.timer=null;film.playing=false;if(clearWait)film.waiting=false;
 settleFilmCounter();if(reason)film.reason=reason;renderFilmControls();
}
function scheduleFilm(){clearTimeout(film.timer);film.timer=null;if(film.playing)film.timer=setTimeout(advanceFilm,film.delay);}
function startFilm(){
 if(walk.room!=='stands')setWalkRoom('stands');pauseTour();stopPitch();
 if(state.year<film.range.start||state.year>film.range.end)film.range={start:1990,end:2026,label:'完整歷史'};
 if(state.year>=film.range.end)setYear(film.range.start);
 film.engaged=true;film.waiting=false;film.playing=true;film.reason='';renderDataFilm();scheduleFilm();
}
function toggleFilm(){if(film.playing){pauseFilm('已暫停，可以拖動年份再繼續。');return;}startFilm();}
function advanceFilm(){
 clearTimeout(film.timer);film.timer=null;if(!film.playing)return;
 const next=Math.min(film.range.end,state.year+1);film.driving=true;setYear(next,{automatic:true});film.driving=false;
 if(next>=film.range.end){film.playing=false;film.waiting=false;film.reason='本段已播完；按重播可從起點再看。';renderDataFilm();return;}
 if(film.pauseAt&&filmChapter(next)){film.playing=false;film.waiting=true;film.reason='';renderDataFilm();return;}
 scheduleFilm();
}
function playFilmClip(id){const clip=filmClips[id];if(!clip)return;pauseFilm();setWalkRoom('stands');setYear(clip.start);film.range={...clip};startFilm();}
function resetFilm(){const range={...film.range};pauseFilm();setYear(range.start);film.range=range;film.engaged=true;renderDataFilm();}
function initDataFilm(){
 const people=Array.from({length:224},(_,i)=>{const row=Math.floor(i/32),col=i%32,t=(col+.5)/32,x=40+t*1150,y=387+row*9+52*Math.pow(2*t-1,2);return '<g transform="translate('+x.toFixed(1)+' '+y.toFixed(1)+')"><g id="film-fan-'+i+'" class="fan-person"><circle r="2.4" cy="-4" fill="#dfc8a2"/><path d="M-3.5 3L-2.4-1.5Q0-3 2.4-1.5L3.5 3Z" fill="currentColor"/></g></g>';}).join('');
 $('#film-crowd').innerHTML=people;
 const max=Math.max(...seasonRecords.map(r=>r.average)),points=seasonRecords.map((r,i)=>({r,x:20+i*860/35,y:107-r.average/max*82}));
 $('#film-trend').innerHTML='<svg viewBox="0 0 900 140" preserveAspectRatio="none" aria-hidden="true"><path d="M20 107H880 M20 66H880 M20 25H880" stroke="#63805b" stroke-width=".6" opacity=".5"/><polyline fill="none" stroke="#9eba81" stroke-width="2" points="'+points.map(p=>p.x.toFixed(2)+','+p.y.toFixed(2)).join(' ')+'"/><line id="film-trend-cursor" class="trend-cursor" x1="20" x2="20" y1="15" y2="112"/><text x="20" y="135" fill="#b5c7a2" font-size="10">1990</text><text x="855" y="135" fill="#b5c7a2" font-size="10">2025</text><text x="26" y="20" fill="#a8bb96" font-size="9">'+numberText(max)+' 人次</text></svg>'+points.map(p=>'<button class="trend-hit" id="film-point-'+p.r.year+'" data-film-year="'+p.r.year+'" style="left:'+p.x/9+'%;top:'+p.y/1.4+'%" aria-label="'+p.r.year+' 年平均進場 '+numberText(p.r.average)+' 人次"><span>'+p.r.year+' · '+numberText(p.r.average)+'</span></button>').join('');
 renderDataFilm();
}
function renderFilmControls(){
 $('#film-play').textContent=film.playing?'Ⅱ 暫停動畫':film.waiting?'▶ 繼續播放':state.year>=film.range.end?'↺ 重播本段':'▶ 播放歷史動畫';
 $('#film-play').setAttribute('aria-pressed',film.playing);$('#film-continue').hidden=!film.waiting;
 $('#film-year-label').textContent=state.year;$('#film-seek').value=state.year;$('#film-speed').value=film.delay;$('#film-chapters').checked=film.pauseAt;
 $('#film-status').textContent=film.waiting?'停在 '+state.year+' 年大事；讀完後按「繼續下一幕」。':film.playing?film.range.label+' · '+state.year+' / '+film.range.end+' · '+(motionQuery?.matches?'減少動態：逐年切換':'人群與球隊隨資料變化'):film.reason||'按播放，讓數據走進球場。';
 document.querySelectorAll('[data-film-route]').forEach(b=>b.setAttribute('aria-pressed',film.range.label===filmClips[b.dataset.filmRoute]?.label));
 $('#walk-shell').dataset.film=String(film.playing||film.waiting);
 $('#walk-hotspots').hidden=walk.room!=='stands'||film.playing||film.waiting;
}
function renderDataFilm(){
 const inside=walk.room!=='gate'&&walk.room!=='cinema',record=recordFor(state.year),avg=record?.average??null,previous=recordFor(state.year-1);
 $('#data-film').hidden=!inside;$('#film-world').hidden=!inside;$('#film-hud').hidden=!inside;
 $('#film-lineup').hidden=walk.room!=='stands';$('#walk-step-status').hidden=inside;
 $('#film-hud-year').textContent=state.year;
 const roster=rosterForFilm(state.year),cp=roster.filter(t=>t.league==='cpbl').length,tm=roster.length-cp;
 $('#film-hud-teams').textContent='中職 '+cp+' 隊'+(tm?' / TML '+tm+' 隊':'')+(avg===null?' · 全年數據未收錄':'');
 updateFilmCounter(avg);
 const fanCount=avg===null?0:Math.min(224,Math.round(avg/50)),colors=roster.filter(t=>t.league==='cpbl').map(t=>t.color);
 for(let i=0;i<224;i++){const fan=$('#film-fan-'+i);fan.style.opacity=i<fanCount?'1':'0';fan.style.transform=i<fanCount?'translateY(0) scale(1)':'translateY(6px) scale(.4)';fan.style.transitionDelay=(i%32)*9+'ms';fan.style.color=colors[i%colors.length]||'#56724a';}
 if(film.lastYear!==state.year){
  const old=new Map(film.roster.map(t=>[t.key,t]));const now=new Set(roster.map(t=>t.key));
  function token(t,i,departing=false){const oldTeam=old.get(t.key),status=departing?'departing':!oldTeam?'added':oldTeam.name!==t.name?'renamed':'steady';const leagueIndex=roster.filter(r=>r.league===t.league).findIndex(r=>r.key===t.key),index=departing?i:leagueIndex,x=t.league==='tml'?23+(index%4)*11:18+(index%7)*7.6,y=t.league==='tml'?72:57;const tag=status==='added'?'入場':status==='renamed'?oldTeam.name+' → '+t.name:status==='departing'?'離開此年名錄':'';const body='<span class="field-shirt">'+escapeHTML(t.name.slice(0,1))+'</span><span class="field-name">'+escapeHTML(t.name)+'</span>'+(tag?'<span class="field-change">'+escapeHTML(tag)+'</span>':'');return '<'+(departing?'span':'button')+' class="film-team '+status+'" '+(departing?'aria-hidden="true"':'data-team="'+t.id+'" aria-label="'+escapeHTML(t.name)+'，查看球隊沿革"')+' style="--team-x:'+x+'%;--team-y:'+y+'%;--shirt:'+t.color+';--team-delay:'+(i%7)*65+'ms">'+body+'</'+(departing?'span':'button')+'>';}
  $('#film-lineup').innerHTML=roster.map((t,i)=>token(t,i)).join('')+film.roster.filter(t=>!now.has(t.key)).map((t,i)=>token(t,i,true)).join('');
  film.roster=roster;film.lastYear=state.year;
 }
 const cursor=$('#film-trend-cursor');cursor.setAttribute('x1',20+(state.year-1990)*860/35);cursor.setAttribute('x2',20+(state.year-1990)*860/35);cursor.style.opacity=avg===null?'0':'1';
 document.querySelectorAll('[data-film-year]').forEach(b=>b.setAttribute('aria-current',Number(b.dataset.filmYear)===state.year));
 $('#film-comparison').textContent=avg===null?'2026 尚未收錄完整年度觀眾數據':previous?state.year+' 較 '+(state.year-1)+' 平均進場 '+(avg>=previous.average?'增加 ':'減少 ')+numberText(Math.abs(avg-previous.average))+' 人次':'1990–2025 · 點曲線年份跳轉';
 const chapter=film.engaged&&inside?filmChapter(state.year):null;
 $('#film-chapter').hidden=!chapter;
 if(chapter){$('#film-chapter-label').textContent=(film.waiting?'PAUSED / ':'CHAPTER / ')+state.year;$('#film-chapter-title').textContent=chapter.title;$('#film-chapter-copy').textContent=chapter.summary;$('#film-chapter-actions').innerHTML='<button data-walk-event="'+chapter.id+'">讀故事與來源 ↗</button>'+(film.waiting?'<button id="film-chapter-continue">繼續下一幕 →</button>':'');}
 renderFilmControls();
}
$('#film-seek').addEventListener('input',e=>{film.engaged=true;setYear(e.target.value);});
$('#film-speed').addEventListener('change',e=>{const speed=Number(e.target.value);if(![1500,2600,4200].includes(speed))return;film.delay=speed;if(film.playing)scheduleFilm();renderFilmControls();});
$('#film-chapters').addEventListener('change',e=>{film.pauseAt=!!e.target.checked;if(!film.pauseAt&&film.waiting)startFilm();else renderFilmControls();});
`;
const boot='renderExplore();renderHistory();renderQuiz();renderPhotos();renderHighlights();renderArchive();renderBatting();renderVideoList();renderWalk();';
if(!h.includes(boot))throw Error('Missing initialization');
h=h.replace(boot,js+'\n'+boot+'initDataFilm();');
h=h.replace('paintWalkCamera();\n}', 'paintWalkCamera();renderDataFilm();\n}');
// A single film scheduler owns playback; other interactions explicitly pause it.
h=h.replace("function setYear(year,{automatic=false}={}){if(!automatic){", "function setYear(year,{automatic=false}={}){if(!automatic){pauseFilm('已手動選年，按播放可從這裡繼續。');");
h=h.replace("function setWalkRoom(room){\n if(!walkRooms[room])return;", "function setWalkRoom(room){\n if(!walkRooms[room])return;pauseFilm();");
h=h.replace("function showDialog(title,meta,body,trigger){", "function showDialog(title,meta,body,trigger){\n pauseFilm('正在閱讀故事，動畫已暫停。',false);");
h=h.replace('function startQuiz(){pauseTour();','function startQuiz(){pauseFilm();pauseTour();');
h=h.replace('function toggleTour(){stopPitch();','function toggleTour(){pauseFilm();stopPitch();');
h=h.replace("function pitchBall(){\n if(batting.phase==='pitching')return;", "function pitchBall(){\n if(batting.phase==='pitching')return;pauseFilm();");
h=h.replace("pauseTour();stopPitch();cancelWalkEntry();if(selectedVideo)closeVideo();", "pauseFilm();pauseTour();stopPitch();cancelWalkEntry();if(selectedVideo)closeVideo();");
h=h.replace("if(document.hidden){pauseTour();stopPitch();cancelWalkEntry();}","if(document.hidden){pauseFilm('切到背景，動畫已暫停。');pauseTour();stopPitch();cancelWalkEntry();}");
h=h.replace("if(e.key==='Escape'){if(state.playing)","if(e.key==='Escape'){pauseFilm('動畫已暫停。');if(state.playing)");
h=h.replace(" const b=e.target.closest('button');if(!b||b.disabled)return;",` const b=e.target.closest('button');if(!b||b.disabled)return;
 if(b.id==='film-play'){toggleFilm();return;}
 if(b.id==='film-continue'||b.id==='film-chapter-continue'){startFilm();return;}
 if(b.id==='film-reset'){resetFilm();return;}
 if(b.id==='film-full'){pauseFilm();setWalkRoom('stands');setYear(1990);film.range={start:1990,end:2026,label:'完整歷史'};startFilm();return;}
 if(b.dataset.filmRoute){playFilmClip(b.dataset.filmRoute);return;}
 if(b.dataset.filmYear){film.engaged=true;setYear(b.dataset.filmYear);return;}`);
fs.writeFileSync('index.html',h);
