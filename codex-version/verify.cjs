/* No packages or browser required. Runs the real inline script with a minimal
 * DOM test double. This checks data, rendering and handlers, not browser layout. */
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const elements=new Map();
const eventHandlers={};
let document;
function element(selector){
 if(!elements.has(selector))elements.set(selector,{innerHTML:'',textContent:'',value:'',disabled:false,hidden:false,open:false,isConnected:true,dataset:{},style:{},attributes:{},handlers:{},classList:{toggle(){}},setAttribute(k,v){this.attributes[k]=String(v);},addEventListener(k,f){this.handlers[k]=f;},focus(){document.activeElement=this;},scrollIntoView(){this.scrolled=true;},showModal(){this.open=true;},close(){this.open=false;this.handlers.close?.();},getClientRects(){return [1];},querySelectorAll(){return []}});
 return elements.get(selector);
}
document={activeElement:element('initial'),querySelector:element,querySelectorAll(selector){const attr=selector.slice(1,-1);return [...html.matchAll(new RegExp(`<button[^>]*${attr}="([^"]+)"[^>]*>`, 'g'))].map((m,i)=>{const e=element(selector+i);e.dataset[attr.slice(5)]=m[1];return e;});},addEventListener(k,f){eventHandlers[k]=f;}};
let timerCounter=0;const timers=new Map();let gameClock=0,frameCounter=0;const frames=new Map();
const context=vm.createContext({document,console,Math,Set,Object,Number,String,location:{protocol:'http:',origin:'http://127.0.0.1:4173'},performance:{now:()=>gameClock},requestAnimationFrame(fn){frames.set(++frameCounter,fn);return frameCounter;},cancelAnimationFrame(id){frames.delete(id);},setTimeout(callback,delay){const id=++timerCounter;timers.set(id,{callback,delay});return id;},clearTimeout(id){timers.delete(id);}});
vm.runInContext(script,context,{filename:'index.html:inline'});
let checks=0;
const run=code=>vm.runInContext(code,context);
function check(code,label){assert.ok(run(code),label);checks++;}
function click(dataset={},id=''){const b={dataset,id,disabled:false,hasAttribute(k){return Object.hasOwn(dataset,k.replace(/^data-/,''));}};eventHandlers.click({target:{closest(){return b;}}});}
check('events.length===24','24 curated events');
check('quizQuestions.length>=10','question bank');
check('seasonTeams.length===74','all 37 seasons x 2 leagues');
check('new Set(events.map(e=>e.id)).size===events.length','unique event IDs');
check('new Set(teamStages.map(t=>t.id)).size===teamStages.length','unique stage IDs');
check('state.year===1990 && $("#prev-year").disabled','initial earliest year');
for(let year=1990;year<=2026;year++){
 run(`setYear(${year})`);
 check(`Number($("#year-output").value)===${year} && Number($("#year-range").value)===${year}`,'year output synchronized '+year);
 const expected=year<=1992?4:year<=1996?6:year===1997?7:year<=1999?6:year<=2002?4:year<=2008?6:year<=2020?4:year<=2023?5:6;
 check(`countTeams(seasonFor(${year},'cpbl'))===${expected}`,'CPBL count '+year);
 check(`countTeams(seasonFor(${year},'tml'))===${year>=1997&&year<=2002?4:0}`,'TML count '+year);
 check(`seasonTeams.filter(s=>s.year===${year}).every(s=>s.members.every(m=>m.stageIds.every(id=>byStage[id] && byStage[id].league===s.league && byStage[id].start<=s.year && byStage[id].end>=s.year)))`,'valid annual stages '+year);
 for(const league of ['all','cpbl','tml'])for(const category of ['all','聯盟發展','球隊變遷','賽事與紀錄']){
  run(`state.league='${league}';state.category='${category}';renderExplore()`);
  check(`filteredEvents().every(e=>e.year===${year} && ('${league}'==='all'||e.leagueIds.includes('${league}')) && ('${category}'==='all'||e.category==='${category}'))`,'combined filter '+year+league+category);
  check('filteredEvents().length>0 || $("#event-grid").innerHTML.includes("此條件下尚未收錄事件")','honest empty message');
 }
}
click({},'next-year');check('state.year===2026 && $("#next-year").disabled','upper boundary');
run('setYear(1990)');click({},'prev-year');check('state.year===1990','lower boundary');
click({},'next-year');check('state.year===1991','next year');click({},'prev-year');check('state.year===1990','previous year');
for(const year of [1990,2000,2010,2020]){click({year:String(year)});check(`state.year===${year}`,'decade '+year);}
element('#year-range').handlers.input({target:{value:'1997'}});check('state.year===1997','range handler');
run("state.league='tml';state.category='球隊變遷'");click({},'clear-filters');check("state.year===1997 && state.league==='all' && state.category==='all'",'clear keeps year');
check("seasonFor(1996,'cpbl').members.find(m=>m.id==='bulls').stageIds.length===2",'1996 rename stages');
check("seasonFor(2003,'cpbl').members.find(m=>m.id==='macoto-sun').stageIds.length===2",'2003 rename stages');
check("seasonFor(2000,'tml').members.find(m=>m.id==='kong00').stageIds.length===2",'2000 sponsor stages');
check("teamRelations.filter(r=>r.to==='first'&&r.type.includes('整併')).length===2",'first merger keeps both parents');
check("teamRelations.filter(r=>r.to==='naluwan'&&r.type.includes('整併')).length===2",'sun merger keeps both parents');
check("relatedStages('first').some(t=>t.group==='tmlsun')&&relatedStages('first').some(t=>t.group==='tmlthunder')&&!relatedStages('first').some(t=>t.group==='tmlkong')",'no name-based false merger');
check("!relatedStages('brothers').some(t=>t.group==='whales')",'whales separate from brothers');
for(const t of run('teamStages.map(t=>({id:t.id,name:t.name}))')){
 run(`openTeam('${t.id}')`);
 check(`$("#dialog-title").textContent===${JSON.stringify(t.name)} && $("#detail-dialog").open`,'team opens '+t.id);
 check('$("#dialog-body").innerHTML.includes("本階段來源")','stage sources rendered');
}
run("openTeam('first');openTeam('thunder00')");check('$("#dialog-title").textContent.includes("雷公")','node switches story');
run("state.search='台北';renderHistory()");check('$("#history-count").textContent.includes("2 個")','台/臺 normalized');
run("state.search='不存在xyz';renderHistory()");check('$("#history-grid").innerHTML.includes("沒有符合")','search empty');
check('events.every(e=>e.teamIds.every(id=>byStage[id])&&e.sourceIds.every(id=>sources[id]))','event references');
check('teamRelations.every(r=>byStage[r.from]&&byStage[r.to]&&r.sourceIds.every(id=>sources[id]))','relation references');
check('teamStages.every(t=>t.sourceIds.length&&t.sourceIds.every(id=>sources[id]))','stage provenance');
check('seasonTeams.every(s=>s.sourceIds.length&&s.sourceIds.every(id=>sources[id]))','annual provenance');
check('quizQuestions.every(q=>q.options.length===4&&q.answer>=0&&q.answer<4&&byEvent[q.eventId])','quiz provenance');
for(let trial=0;trial<100;trial++){run('startQuiz()');check('state.quiz.ids.length===5 && new Set(state.quiz.ids).size===5','no repeated questions '+trial);}
run('closeDialog();startQuiz();submitQuiz()');check('Object.keys(state.quiz.answers).length===0 && quizScore()===0','cannot submit unselected');
check('$("#quiz-board").innerHTML.includes("disabled")','submit starts disabled');
run('state.quiz.selected=currentQuestion().answer;submitQuiz();submitQuiz()');check('quizScore()===20 && Object.keys(state.quiz.answers).length===1','one score per question');
const before=run('JSON.stringify(state.quiz)');run("reviewEvent(currentQuestion().eventId)");check(`state.league==='all'&&state.category==='all'&&state.year===byEvent[currentQuestion().eventId].year&&$('#detail-dialog').open`,'review reveals event');
run('returnToQuiz()');check(`JSON.stringify(state.quiz)===${JSON.stringify(before)} && !state.reviewing`,'quiz state survives review');
for(let i=1;i<5;i++)run('nextQuestion();state.quiz.selected=currentQuestion().answer;submitQuiz()');
run('nextQuestion()');check('state.quiz.finished && quizScore()===100','five correct = 100');
run('startQuiz()');check('!state.quiz.finished&&state.quiz.index===0&&Object.keys(state.quiz.answers).length===0&&quizScore()===0&&state.quiz.selected===null','replay resets');
for(let i=0;i<5;i++){run('state.quiz.selected=(currentQuestion().answer+1)%4;submitQuiz();nextQuestion()');}
check('state.quiz.finished && quizScore()===0','five incorrect = 0');
for(const e of run('events.map(e=>({id:e.id,title:e.title}))')){run(`openEvent('${e.id}')`);check(`$("#dialog-title").textContent===${JSON.stringify(e.title)} && $("#dialog-body").innerHTML.includes('史料來源')`,'event detail '+e.id);}
const ids=[...html.split('<script>')[0].matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);assert.equal(new Set(ids).size,ids.length,'unique static IDs');checks++;
assert.ok(!/<(?:script|link|img)[^>]+(?:src|href)="https?:/i.test(html),'no external runtime assets');checks++;
assert.ok(html.includes('prefers-reduced-motion')&&html.includes('@media(max-width:700px)'),'responsive / reduced motion CSS');checks++;
for(const s of run('Object.values(sources)'))assert.equal(new URL(s.url).protocol,'https:');checks++;
assert.ok(!/\?{3,}/.test(html),'no question-mark encoding corruption');checks++;
assert.ok(html.includes('<h2 id="ballpark-heading">臺北市立棒球場</h2>'),'Chinese hero heading is real UTF-8 HTML');checks++;
const heroData=html.match(/href="data:image\/png;base64,([A-Za-z0-9+/=]+)"/);
assert.ok(heroData && Buffer.from(heroData[1],'base64').subarray(1,4).toString()==='PNG','hero image is embedded and decodes as PNG');checks++;
// Exercise the new season desk through real delegated button handlers and
// deterministic timers; no waiting and no automatic playback in the test host.
function tick(){const entry=timers.entries().next().value;assert.ok(entry,'scheduled playback timer');const [id,timer]=entry;timers.delete(id);timer.callback();}
run("closeDialog();clearFilters();state.eventOnly=false;state.trail.clear();setYear(1990)");
check('!state.playing','playback never starts automatically');
check('($("#season-rail").innerHTML.match(/data-season=/g)||[]).length===37','37 clickable season bars');
click({season:'1997'});check('state.year===1997 && document.activeElement===$("#season-stop-1997")','rail click updates year and preserves keyboard focus');
check('comparison(1996,1997).filter(c=>c.type===\'new\').length===5','1997 introduces whale and four TML teams');
check('comparison(1999,2000).filter(c=>c.type===\'left\').length===2','1999 to 2000 shows two departures');
check('comparison(2013,2014).some(c=>c.type===\'renamed\'&&c.text.includes("中信兄弟"))','rename shown separately from new team');
check('comparison(1990,1991).length===0','unchanged roster has no invented changes');
check('$("#change-list").innerHTML.includes("和信鯨")','change feed renders season differences');
click({},'tour-play');check('state.playing && $("#tour-play").attributes["aria-pressed"]===\'true\'','play is active and labelled');
assert.equal(timers.size,1,'exactly one timer');checks++;
tick();check('state.year===1998 && state.playing','play advances exactly one season');
click({},'tour-play');check('!state.playing','pause button');assert.equal(timers.size,0,'pause clears timer');checks++;
click({},'tour-play');click({season:'2003'});check('state.year===2003&&!state.playing','manual navigation pauses playback');assert.equal(timers.size,0);checks++;
click({},'tour-mode');check('state.eventOnly','event-only mode toggles');
run('setYear(1997)');click({},'tour-play');tick();check('state.year===1999','event-only playback skips 1998 without a curated event');
click({league:'tml'});check('!state.playing','league filter pauses playback');
run("state.category='賽事與紀錄';renderExplore()");click({},'tour-play');check('!state.playing && $("#tour-status").textContent.includes("尚未收錄")','empty event filter cannot start playback');
run("clearFilters();state.eventOnly=false;setYear(2025)");click({},'tour-play');tick();check('state.year===2026&&!state.playing','play stops at upper bound');assert.equal(timers.size,0);checks++;
click({},'tour-play');check('state.year===1990&&state.playing','replay from end resets to first season');
element('#tour-speed').handlers.change({target:{value:'1500'}});check('state.speed===1500','speed change');assert.equal(timers.size,1,'speed change replaces timer');checks++;
assert.equal([...timers.values()][0].delay,1500);checks++;
eventHandlers.keydown({key:'Escape'});check('!state.playing','Escape pauses');
click({},'tour-play');document.hidden=true;eventHandlers.visibilitychange();document.hidden=false;check('!state.playing','background tab pauses');
click({},'tour-play');run("openTeam('first')");check('!state.playing && $("#detail-dialog").open','reading a team pauses tour');
run("closeDialog();state.trail.clear();renderTrail()");
click({},'open-trail');check('$("#dialog-body").innerHTML.includes("第一張球票")','empty reading trail');
run('closeDialog()');
for(let i=0;i<24;i++){
 click({},'random-ticket');
 check(`state.trail.size===${i+1}`,'random draws unread ticket '+i);
 check('state.league===\'all\'&&state.category===\'all\'&&$("#detail-dialog").open','random ticket reveals matching history');
 run('closeDialog()');
}
click({},'random-ticket');check('state.trail.size===24','draw after all read still works without duplicate progress');
run('closeDialog()');click({},'open-trail');check('($("#dialog-body").innerHTML.match(/class="trail-item"/g)||[]).length===24','all read tickets can be reopened');
check('$("#trail-fill").style.width===\'100%\'','reading progress reaches 100 percent');
run('closeDialog()');click({arrive:'integration'});check('state.year===2003&&state.league===\'all\'&&state.category===\'all\'','guided route reveals its year');
run('startQuiz();state.quiz.selected=currentQuestion().answer;submitQuiz()');const quizBeforeRoute=run('JSON.stringify(state.quiz)');
click({arrive:'two-leagues'});check(`JSON.stringify(state.quiz)===${JSON.stringify(quizBeforeRoute)}`,'exploration route preserves quiz progress');
check('seasonRecords.length===36&&new Set(seasonRecords.map(r=>r.year)).size===36','36 complete annual statistical records');
check('recordFor(2026)===undefined','no unverified 2026 season results');
for(let year=1990;year<=2025;year++){
 run(`setYear(${year})`);
 check(`recordFor(${year}).games>0&&recordFor(${year}).attendance>0&&recordFor(${year}).average===Math.round(recordFor(${year}).attendance/recordFor(${year}).games)`,'annual arithmetic '+year);
 check(`seasonFor(${year},'cpbl').members.some(m=>m.id===recordFor(${year}).championId)`,'champion played in that season '+year);
 check(`$("#record-year").textContent.includes('${year}')&&$("#season-stat-cards").innerHTML.includes(numberText(recordFor(${year}).attendance))`,'season record render '+year);
}
check('recordFor(2024).attendance===2766386&&recordFor(2024).average===7684','2024 final totals, not partial-season figures');
check('recordFor(2025).championId===\'rakuten\'&&recordFor(2025).average===10373','2025 full season');
check('recordFor(2020).games===240&&recordFor(2021).games===300&&recordFor(2021).note.includes("閉門")','closed-door denominator is explicit');
check('seasonRecords.every(r=>r.sources.every(id=>sources[id]))','statistical provenance');
click({metric:'games'});check('state.metric===\'games\'&&$("#record-chart-title").textContent.includes("場次")','metric switches to actual games');
click({metric:'attendance'});check('state.metric===\'attendance\'&&$("#records-chart").innerHTML.includes("3,734,429")','attendance metric');
click({recordYear:'1992'});check('state.year===1992&&$("#record-comparison").innerHTML.includes("未舉行")','record chart/table year navigation');
element('#record-compare').handlers.change({target:{value:'2000'}});check('state.compareYear===2000&&$("#record-comparison").innerHTML.includes("2000")','comparison selector');
run('setYear(2026)');check('$("#season-stat-cards").innerHTML.includes("尚未")&&!$("#season-stat-cards").innerHTML.includes("樂天桃猿")','2026 does not reuse last champion');
check('archiveEvents().length===24&&($("#all-events-grid").innerHTML.match(/class="archive-event"/g)||[]).length===24','all events visible independently of selected year');
click({archiveCategory:'賽事與紀錄'});check('archiveEvents().every(e=>e.category===\'賽事與紀錄\')&&archiveEvents().some(e=>e.id===\'lin-300\')','cross-era category filter includes real milestones');
element('#archive-decade').handlers.change({target:{value:'2020'}});check('archiveEvents().every(e=>e.year>=2020&&e.year<2030)','cross-era decade filter');
click({archiveOpen:'lin-300'});check('state.year===2023&&$("#dialog-title").textContent.includes("300")&&$("#dialog-body").innerHTML.includes("不是單季")','milestone opens correct sourced detail');
run('closeDialog()');const yearBeforePhoto=run('state.year');click({photo:'lin2024'});
check(`state.year===${yearBeforePhoto}&&$("#dialog-body").innerHTML.includes('photo-modal')&&$("#dialog-body").innerHTML.includes('CC BY 2.0')`,'photo enlargement and attribution preserve year');
check('archivePhotos.length===3&&archivePhotos.every(p=>p.license===\'CC BY 2.0\'&&p.caption&&byEvent[p.eventId])','three licensed and contextual photographs');
for(const p of run('archivePhotos')){assert.equal(Buffer.from(p.src.split(',')[1],'base64').subarray(0,2).toString('hex'),'ffd8','embedded JPEG '+p.id);checks++;assert.equal(new URL(p.page).protocol,'https:');checks++;}
// Inactive leagues are a compact historical entry, never an empty roster panel.
for(let year=1990;year<=2026;year++){
 run(`state.league='all';setYear(${year})`);
 check(`($('#league-grid').innerHTML.match(/class="league-panel /g)||[]).length===${year>=1997&&year<=2002?2:1}`,'only participating leagues get full panels '+year);
 check(`$('#league-grid').innerHTML.includes('inactive-league')===${!(year>=1997&&year<=2002)}`,'inactive TML reduced to a short entry '+year);
 check("!$('#year-summary').innerHTML.includes('台灣大聯盟 0 隊')",'summary omits zero-team TML '+year);
}
run("state.league='tml';setYear(2025)");
check("$('#league-grid').innerHTML.includes('inactive-league')&&!$('#league-grid').innerHTML.includes('league-events')&&!$('#league-grid').innerHTML.includes('<b>0</b>')",'explicit inactive league filter has no empty roster or events');
click({season:'1997'});check("$('#league-grid').innerHTML.includes('<b>4</b>')",'short entry returns to first TML season');
click({archiveOpen:'integration'});check("state.year===2003&&$('#detail-dialog').open",'short entry opens merger story');run('closeDialog()');
// Videos remain unrequested until selected. A single player is replaced on switch.
check("storyVideos.length===3&&new Set(storyVideos.map(v=>v.id)).size===3",'three curated verified episodes');
check("selectedVideo===null&&!$('#video-player').innerHTML.includes('<iframe')",'no player or video request on boot');
for(const id of ['JGF6c3aegWk','2o5ul2Iyj2o','yZrzE59h-z4']){
 click({video:id});
 check(`selectedVideo==='${id}'&&$('#video-player').innerHTML.includes('https://www.youtube-nocookie.com/embed/${id}')`,'correct privacy-enhanced embed '+id);
 check("!$('#video-player').innerHTML.includes('autoplay=1')&&$('#video-player').innerHTML.includes('title=')&&$('#video-player').innerHTML.includes('allowfullscreen')",'named manually played fullscreen iframe');
 check(`$('#video-caption').innerHTML.includes('https://www.youtube.com/watch?v=${id}')`,'original official video fallback '+id);
 check("($('#video-player').innerHTML.match(/<iframe/g)||[]).length===1",'only one loaded player');
 check(`document.activeElement===$('#video-choice-${id}')`,'episode selection restores keyboard focus');
}
const playerBeforeInvalid=element('#video-player').innerHTML;click({video:'arbitrary'});
assert.equal(element('#video-player').innerHTML,playerBeforeInvalid);checks++;
click({},'video-close');check("selectedVideo===null&&!$('#video-player').innerHTML.includes('<iframe')&&$('#video-caption').innerHTML===''",'closing player removes frame and stops playback');
check("document.activeElement===$('#video-choice-JGF6c3aegWk')",'close restores focus to first episode');
context.location={protocol:'file:',origin:'null'};
check('!canEmbedVideo()','local file cannot provide an HTTP origin');
click({video:'2o5ul2Iyj2o'});
check("!$('#video-player').innerHTML.includes('<iframe')&&$('#video-player').innerHTML.includes('啟動網站.cmd')",'file mode shows actionable launch instructions instead of broken iframe');
check("$('#video-player').innerHTML.includes('https://www.youtube.com/watch?v=2o5ul2Iyj2o')",'file mode keeps the selected official video link');
click({},'video-close');
context.location={protocol:'https:',origin:'https://example.test'};
check('canEmbedVideo()','hosted HTTPS video embedding supported');click({video:'yZrzE59h-z4'});
check("$('#video-player').innerHTML.includes('<iframe')&&$('#video-player').innerHTML.includes('referrerpolicy=\"strict-origin-when-cross-origin\"')",'HTTPS player retains recommended referrer policy');
click({},'video-close');context.location={protocol:'http:',origin:'http://127.0.0.1:4173'};
assert.ok(html.includes('<meta name="referrer" content="strict-origin-when-cross-origin">'));checks++;
run("state.league='all'");
// The batting clock and timeout are controlled; no wall-clock sleeps.
run('closeDialog();pauseTour();state.trail=new Set()');
check("batting.phase==='ready'&&batting.hits===0",'batting initially idle');
click({},'pitch-start');
check("batting.phase==='pitching'&&batting.attempts===1&&$('#pitch-start').disabled&&!$('#pitch-swing').disabled",'pitch starts and enables swing');
check('!state.playing','batting pauses season tour');
click({},'pitch-start');check('batting.attempts===1','double start cannot add pitch');
gameClock=400;click({},'pitch-swing');
check("batting.phase==='miss'&&batting.hits===0&&$('#game-status').textContent.includes('太早')",'early swing feedback');
check('batting.timer===null','early swing cancels timeout');
gameClock=2000;click({},'pitch-start');gameClock=3350;click({},'pitch-swing');
check("batting.phase==='hit'&&batting.hits===1&&$('#game-burst').textContent==='PERFECT HIT!'",'sweet spot hit');
check("!$('#earned-ticket').hidden&&batting.ticket&&$('#earned-ticket').innerHTML.includes('pitch-read')",'hit reveals readable ticket');
click({},'pitch-swing');check('batting.hits===1','repeated swing cannot score again');
const wonTicket=run('batting.ticket');click({},'pitch-read');
check(`state.year===byEvent['${wonTicket}'].year&&state.trail.has('${wonTicket}')&&$('#detail-dialog').open`,'won ticket opens sourced event and records visit');
run('closeDialog()');
gameClock=4000;click({},'pitch-start');gameClock=5600;click({},'pitch-swing');
check("batting.phase==='hit'&&batting.hits===2&&batting.ticket!=="+JSON.stringify(wonTicket),'ordinary hit draws unread story');
gameClock=6000;click({},'pitch-start');gameClock=7800;
const pitchTimer=timers.get(run('batting.timer'));pitchTimer.callback();
check("batting.phase==='miss'&&$('#game-status').textContent.includes('手套')",'missed pitch finishes automatically');
gameClock=8000;click({},'pitch-start');eventHandlers.keydown({key:'Escape'});
check("batting.phase==='ready'&&batting.timer===null",'escape cancels active pitch');
click({},'pitch-start');document.hidden=true;eventHandlers.visibilitychange();document.hidden=false;
check("batting.phase==='ready'&&batting.timer===null",'hidden tab cancels pitch');
click({},'pitch-start');run('setYear(1997)');check("batting.phase==='ready'",'manual year navigation cancels pitch');
click({},'pitch-start');run("openTeam('first')");check("batting.phase==='ready'",'reading story cancels pitch');run('closeDialog()');
click({},'pitch-start');element('#pitch-still').checked=true;element('#pitch-still').handlers.change();
check("batting.phase==='ready'",'switching static mode cancels moving ball');
const attemptsBeforeStatic=run('batting.attempts');click({},'pitch-start');
check(`batting.phase==='ready'&&batting.attempts===${attemptsBeforeStatic}&&!$('#earned-ticket').hidden`,'static mode draws without timing or score');
element('#pitch-still').checked=false;
click({},'pitch-start');let prevented=false;
element('#batting-game').handlers.keydown({code:'Space',repeat:false,target:{id:'pitch-start'},preventDefault(){prevented=true;}});
check("batting.phase==='pitching'",'space on another control does not swing');
gameClock+=1350;element('#batting-game').handlers.keydown({code:'Space',repeat:false,target:{id:'pitch-swing'},preventDefault(){prevented=true;}});
check("batting.phase==='hit'",'scoped space handler hits');assert.ok(prevented);checks++;
click({},'pitch-start');const beforeFree=run('batting.hits');click({},'pitch-draw');
check(`batting.phase==='ready'&&batting.hits===${beforeFree}&&batting.timer===null&&!$('#earned-ticket').hidden`,'free draw cancels pitch without scoring');
check("motionQuery===null",'missing matchMedia remains supported');
click({},'pitch-start');click({},'tour-play');
check("batting.phase==='ready'&&batting.timer===null&&state.playing",'starting season playback cancels pitch');
click({},'pitch-draw');check('!state.playing','free ticket draw pauses season playback');
assert.ok(html.includes('@media(prefers-reduced-motion:reduce)')&&html.includes('animation:none!important'));checks++;
// Walk into the stadium, then explore its rooms using the same history state.
run("setWalkRoom('gate');setYear(1990);walk.visited=new Set();renderWalk()");
check("walk.room==='gate'&&!walk.moving&&walk.visited.size===0",'walk starts at exterior');
check("$('#walk-hotspots').hidden&&$('#walk-year-controls').hidden&&$('#walk-cinema').hidden",'unentered scene has no hidden interactive hotspots');
click({},'walk-next');
check("walk.moving&&walk.room==='gate'&&$('#walk-next').disabled&&$('#walk-enter-marker').disabled&&$('#walk-shell').dataset.moving==='true'",'entrance begins gate-to-stand transition');
const entryId=run('walk.timer');click({walkEnter:''});
check(`walk.timer===${entryId}`,'double entry cannot create duplicate transitions');
assert.equal(timers.get(entryId).delay,900);checks++;
const entryCallback=timers.get(entryId).callback;timers.delete(entryId);entryCallback();
check("walk.room==='stands'&&walk.visited.has('stands')&&!$('#walk-hotspots').hidden",'arrival reveals interior and spatial markers');
check("$('#walk-exhibit').innerHTML.includes('MEMORY TICKET / 1990')&&walkCurrentEvents().every(e=>e.year===1990)",'stand ticket belongs to selected year');
const ticket=run('walkCurrentEvents()[0].id');click({walkEvent:ticket});
check(`state.trail.has('${ticket}')&&$('#detail-dialog').open&&walk.room==='stands'`,'memory ticket opens sourced history without leaving stadium');run('closeDialog()');
click({walkRoom:'scoreboard'});
check("walk.room==='scoreboard'&&$('#walk-camera').style.transform.includes('scale(2.2)')&&$('#walk-hotspots').hidden",'scoreboard moves camera and hides out-of-view hotspots');
element('#walk-year-range').handlers.input({target:{value:'1997'}});
check("state.year===1997&&Number($('#year-range').value)===1997&&Number($('#walk-year-range').value)===1997",'scene slider and archive share one year');
check("$('#walk-board-count').textContent==='CPBL 7 / TML 4'&&$('#walk-exhibit').innerHTML.includes('台灣大聯盟 4 隊')",'physical and full scoreboards show both 1997 leagues');
click({walkRoom:'tunnel'});
check("($('#walk-exhibit').innerHTML.match(/class=\"walk-jersey\"/g)||[]).length===11",'1997 tunnel displays eleven distinct teams');
check("$('#walk-exhibit').innerHTML.includes('獨立聯盟')",'TML jerseys retain league separation');
for(let year=1990;year<=2026;year++){
 click({walkYear:String(year)});
 const expected=run(`countTeams(seasonFor(${year},'cpbl'))+countTeams(seasonFor(${year},'tml'))`);
 check(`Number($('#walk-year-value').value)===${year}&&$('#walk-board-year').textContent===${JSON.stringify(year)}`,'year synchronized inside scene '+year);
 check(`($('#walk-exhibit').innerHTML.match(/class="walk-jersey"/g)||[]).length===${expected}`,'scene jerseys use checked annual roster '+year);
}
click({walkYear:'1996'});check("$('#walk-exhibit').innerHTML.includes('興農熊 → 興農牛')",'tunnel preserves same-season naming without extra jersey');
click({walkYear:'2003'});check("$('#walk-exhibit').innerHTML.includes('那魯灣太陽 → 誠泰太陽')&&!$('#walk-exhibit').innerHTML.includes('TML · 0')",'integration jersey includes verified rename and no zero-team league');
click({team:'first'});check("$('#dialog-body').innerHTML.includes('臺北太陽')&&$('#dialog-body').innerHTML.includes('高屏雷公')&&walk.room==='tunnel'",'jersey opens full multi-parent lineage in place');run('closeDialog()');
click({walkRoom:'scoreboard'});click({walkYear:'2026'});
check("$('#walk-exhibit').innerHTML.includes('未填入未查核')&&!$('#walk-exhibit').innerHTML.includes('平均進場')",'scene does not fabricate 2026 full-season stats');
click({},'walk-next-year');check('state.year===2026','scene upper year boundary');
click({walkYear:'1990'});click({},'walk-prev-year');check('state.year===1990','scene lower year boundary');
click({},'walk-next-year');check('state.year===1991','scene year stepping');
const beforeLightYear=run('state.year');click({},'walk-lights');
check(`walk.night&&$('#walk-shell').dataset.night==='true'&&state.year===${beforeLightYear}`,'floodlights change atmosphere without changing data');click({},'walk-lights');
click({},'walk-zoom-in');check("$('#walk-camera').style.transform.includes('scale(2.4')",'camera moves closer');
for(let i=0;i<15;i++)click({},'walk-zoom-in');check("walkRooms[walk.room].scale+walk.zoom===3&&$('#walk-zoom-in').disabled",'zoom has upper boundary');
for(let i=0;i<20;i++)click({},'walk-zoom-out');check("Math.abs(walkRooms[walk.room].scale+walk.zoom-1)<.00001&&$('#walk-zoom-out').disabled",'zoom has lower boundary');
click({walkRoom:'stands'});check("walk.zoom===0&&walk.look===0",'station changes reset view offsets');
click({walkRoom:'cinema'});check("!$('#walk-cinema').hidden&&$('#walk-exhibit').hidden",'projection room reveals embedded cinema in the tour');
click({video:'JGF6c3aegWk'});check("selectedVideo==='JGF6c3aegWk'",'the projection room can load an official episode');
click({walkRoom:'stands'});check("selectedVideo===null&&!$('#video-player').innerHTML.includes('<iframe')&&$('#walk-cinema').hidden",'leaving projection room removes playing frame');
check("walk.visited.size===4&&$('#walk-passport').textContent.includes('4 / 4')",'room passport records four unique visits');
const visitCount=run('walk.visited.size');click({walkRoom:'stands'});check(`walk.visited.size===${visitCount}`,'revisit does not duplicate stamps');
click({walkRoom:'unknown'});check("walk.room==='stands'",'invalid room cannot change scene');
click({walkArchive:'records'});check("$('#archive-vault').open&&$('#records').scrolled&&document.activeElement===$('#records')",'complete archive expands and focuses requested data');
run("$('#archive-vault').open=false");click({walkArchive:'arbitrary'});check("!$('#archive-vault').open",'unknown archive target ignored');
click({},'walk-gate');click({},'walk-next');eventHandlers.keydown({key:'Escape'});
check("!walk.moving&&walk.room==='gate'&&walk.timer===null",'escape cancels gate movement');
click({},'walk-next');document.hidden=true;eventHandlers.visibilitychange();document.hidden=false;
check("!walk.moving&&walk.room==='gate'",'background tab cancels gate movement');
click({},'walk-next');click({walkRoom:'tunnel'});
check("walk.room==='tunnel'&&!walk.moving&&walk.timer===null",'station shortcut interrupts gate transition safely');
let roomKeyPrevented=false;
element('#walk-scene').handlers.keydown({target:{id:'walk-scene'},key:'ArrowRight',preventDefault(){roomKeyPrevented=true;}});
check("walk.room==='cinema'",'right arrow navigates next station');assert.ok(roomKeyPrevented);checks++;
element('#walk-scene').handlers.keydown({target:{id:'walk-year-range'},key:'ArrowRight',preventDefault(){throw Error('must not intercept slider');}});
check("walk.room==='cinema'",'scene shortcuts do not consume form keys');
element('#walk-scene').handlers.keydown({target:{id:'walk-scene'},key:'ArrowRight',preventDefault(){}});check("walk.room==='stands'",'last station wraps to stand');
click({},'walk-gate');element('#walk-scene').handlers.keydown({target:{id:'walk-scene'},key:'ArrowLeft',preventDefault(){}});check("walk.room==='cinema'",'left from entrance reaches last station');
click({video:'2o5ul2Iyj2o'});click({walkArchive:'stories'});check("selectedVideo===null&&!$('#video-player').innerHTML.includes('<iframe')",'opening archive also stops projected video');
run('startQuiz()');const quizBeforeWalk=JSON.stringify(run('state.quiz'));click({walkRoom:'stands'});click({walkRoom:'tunnel'});assert.equal(JSON.stringify(run('state.quiz')),quizBeforeWalk,'walking preserves quiz progress');checks++;
const interiorData=html.match(/id="walk-interior"[^>]+src="data:image\/png;base64,([A-Za-z0-9+/=]+)"/);
assert.ok(interiorData);assert.deepEqual(Buffer.from(interiorData[1],'base64'),fs.readFileSync('assets/taipei-stadium-interior.png'));checks++;
assert.ok(html.indexOf('id="walk-shell"')<html.indexOf('id="archive-vault"')&&html.includes('<details class="archive-vault wrap" id="archive-vault">'));checks++;
// Annual statistics animate in the same stadium, driven by one scheduler.
run("closeDialog();pauseTour();stopPitch();setWalkRoom('stands');film.range={start:1990,end:2026,label:'完整歷史'};film.engaged=false;film.pauseAt=true;setYear(1996)");
click({},'film-play');
check("film.playing&&!state.playing&&batting.phase!=='pitching'&&film.timer!==null",'film starts independently and pauses competing playback');
const firstFilmTimer=run('film.timer');
check('!$("#data-film").hidden&&!$("#film-world").hidden&&$("#walk-hotspots").hidden','film makes data visible and clears hotspot clutter');
assert.equal(timers.get(firstFilmTimer).delay,2600);checks++;
tick();
check("state.year===1997&&film.waiting&&!film.playing&&film.timer===null&&!$('#film-continue').hidden",'1997 checkpoint holds playback and offers explicit continue');
check("$('#film-chapter-title').textContent===byEvent['two-leagues'].title&&!$('#film-chapter').hidden",'checkpoint uses checked event title');
check("rosterForFilm(1997).filter(t=>t.league==='tml').length===4",'parade data contains four independent TML teams');
check("($('#film-lineup').innerHTML.match(/class=\"film-team added\"/g)||[]).length===5",'1997 adds whale and four TML teams');
click({walkEvent:'two-leagues'});check("$('#detail-dialog').open&&film.waiting&&film.timer===null",'reading sources keeps chapter held');run('closeDialog()');
click({},'film-continue');check("film.playing&&!film.waiting&&film.timer!==null",'continue resumes after checkpoint');tick();check('state.year===1998&&film.playing','resume advances rather than replaying checkpoint');
element('#film-seek').handlers.input({target:{value:'2003'}});
check("state.year===2003&&!film.playing&&!film.waiting&&film.timer===null",'scrubbing updates shared year and cancels playback');
check("$('#film-lineup').innerHTML.includes('departing')&&rosterForFilm(2003).every(t=>t.league==='cpbl')",'integration visually removes TML roster without retaining ghost teams');
for(let year=1990;year<=2026;year++){
 run(`setYear(${year});settleFilmCounter()`);
 const record=run(`recordFor(${year})`),expected=record?Math.round(record.average/50):0;
 check(`Array.from({length:224},(_,i)=>$('#film-fan-'+i).style.opacity).filter(x=>x==='1').length===${expected}`,'crowd glyph count derives from average '+year);
 check(`rosterForFilm(${year}).length===countTeams(seasonFor(${year},'cpbl'))+countTeams(seasonFor(${year},'tml'))`,'animated lineup agrees with annual catalog '+year);
 if(record)check(`$('#film-champion').innerHTML.includes('data-team="${record.championId}"')&&!$('#film-champion').hidden`,'annual champion flag '+year);
 else check("$('#film-champion').hidden&&$('#film-hud-average').textContent==='—'&&$('#film-trend-cursor').style.opacity==='0'",'no 2026 crowd value or champion invented');
}
run('setYear(2001)');run('setYear(2002)');
check("$('#film-lineup').innerHTML.includes('renamed')&&$('#film-lineup').innerHTML.includes('和信鯨 → 中信鯨')",'team rename flips existing family rather than adding team');
click({filmRoute:'crisis'});check('film.range.start===2009&&film.range.end===2010&&state.year===2009&&film.playing','decline clip uses actual declining years');
tick();check("state.year===2010&&!film.playing&&film.timer===null&&$('#film-comparison').textContent.includes('減少 1,053')",'short decline clip ends with correct difference');
click({},'film-play');check('state.year===2009&&film.playing','replay returns only on explicit play');click({},'film-play');
check('!film.playing&&film.timer===null','pause removes scheduled frame advance');
click({filmRoute:'return'});tick();check('state.year===2024&&film.waiting','return clip pauses at 2024 chapter');
element('#film-chapters').handlers.change({target:{checked:false}});check('!film.pauseAt&&film.playing&&!film.waiting','disabling chapter holds resumes');tick();
check('state.year===2025&&!film.playing&&film.range.end===2025','2025 clip finishes without looping');
click({filmRoute:'merger'});element('#film-speed').handlers.change({target:{value:'1500'}});
check('film.delay===1500&&film.playing','speed control reschedules active film');assert.equal(timers.get(run('film.timer')).delay,1500);checks++;
element('#film-speed').handlers.change({target:{value:'1'}});check('film.delay===1500','invalid speed ignored');
click({filmYear:'1992'});check('state.year===1992&&!film.playing&&film.timer===null','curve point seeks and pauses');
click({},'film-full');check('film.playing&&state.year===1990&&film.range.end===2026','full-film action resets clip range deliberately');
click({walkRoom:'tunnel'});check('!film.playing&&film.timer===null','station navigation pauses film');
click({},'film-play');check("film.playing&&walk.room==='stands'",'play returns to overview before animation');
run("openTeam('first')");check('!film.playing&&film.timer===null','team dialog pauses film');run('closeDialog()');
click({},'film-play');document.hidden=true;eventHandlers.visibilitychange();document.hidden=false;check('!film.playing&&film.timer===null','background pause clears film timer');
click({},'film-play');eventHandlers.keydown({key:'Escape'});check('!film.playing&&film.timer===null','escape pauses film');
click({},'film-play');click({},'tour-play');check('!film.playing&&state.playing','archive playback takes ownership');run('pauseTour()');
click({},'film-play');click({},'pitch-start');check("!film.playing&&batting.phase==='pitching'",'batting takes ownership');run('stopPitch()');
click({},'film-play');run('startQuiz()');check('!film.playing','starting quiz pauses film');
gameClock=20000;run("setWalkRoom('stands');setYear(2023);settleFilmCounter();setYear(2024)");
check('film.frame!==null&&film.target===7684','number interpolation schedules real animation frames');
function stepFrame(time){const [id,fn]=frames.entries().next().value;frames.delete(id);fn(time);}
stepFrame(20325);check('film.displayed>6000&&film.displayed<7684','counter interpolates between recorded values');
stepFrame(20650);check("film.displayed===7684&&film.frame===null&&$('#film-hud-average').textContent==='7,684'",'counter settles exactly at target');
run('setYear(2025);pauseFilm()');check('film.frame===null&&film.displayed===10373','pause settles counter without retaining wrong intermediate value');
click({},'film-reset');check('!film.playing&&state.year===film.range.start','reset returns to range start without autoplay');
run('setYear(2025);film.pauseAt=false;startFilm()');assert.equal(timers.size,1);checks++;tick();
check("state.year===2026&&!film.playing&&film.timer===null&&$('#film-hud-average').textContent==='—'",'full film stops at 2026 without inventing stats or automatically restarting');
assert.equal(timers.size,0);checks++;
check("$('#film-trend-cursor').style.transform.includes('translateX(')",'curve cursor uses an animatable SVG transform');
assert.ok(html.includes('每個人影約代表 50 人次')&&html.includes('並非老球場容量')&&html.includes('觀眾資料不含 TML'));checks++;
assert.ok(html.indexOf('initDataFilm();renderExplore();')>0,'real SVG glyphs exist before first data update');checks++;
// A second boot verifies the OS preference selects the static path by default.
const savedReduced=element('#pitch-still').checked;
const reducedContext=vm.createContext({...context,matchMedia:()=>({matches:true,addEventListener(){}})});
vm.runInContext(script,reducedContext);
assert.equal(element('#pitch-still').checked,true);checks++;
vm.runInContext('enterBallpark()',reducedContext);
assert.equal(vm.runInContext('walk.room',reducedContext),'stands');checks++;
assert.equal(vm.runInContext('walk.moving',reducedContext),false);checks++;
vm.runInContext('setYear(2024)',reducedContext);assert.equal(vm.runInContext('film.displayed',reducedContext),7684);checks++;
assert.equal(vm.runInContext('film.frame',reducedContext),null);checks++;
const deepLinkContext=vm.createContext({...context,location:{protocol:'http:',origin:'http://127.0.0.1:4173',hash:'#screening'}});
vm.runInContext(script,deepLinkContext);
assert.equal(vm.runInContext('walk.room',deepLinkContext),'cinema');checks++;
assert.equal(element('#walk-cinema').hidden,false);checks++;
element('#pitch-still').checked=savedReduced;
console.log(`PASS: ${checks} assertions. ${run('teamStages.length')} team stages, ${run('events.length')} events, 74 league-season records, 12 questions.`);
console.log('Executed actual inline JS with a DOM test double. Browser layout, keyboard behavior and live link availability are NOT covered.');
