/* ============================================================
   歷史長廊：九個年代的動畫展櫃
   每個展櫃是幾「幕」動畫，在球場模型上自動播放：燈亮、旗子落下、
   交棒時旗子翻面、整併時兩面旗合成一面、觀眾增減、字幕與「傳承鏈」。
   不需要先認識中職，看就懂；可以暫停、上一幕、下一幕。
   ============================================================ */
const game = {mode:'era'};
const panel = () => $('#mp-body');
const era = {n:0, scene:0, token:0, paused:false, done:false};
const CANCEL = Symbol('cancel');
const nameOf = id => byStage[id].name;

/* 可暫停、可中止的等待 */
function waitFor(ms, tok){
  const total = reduceMotion.matches ? Math.min(ms, 450) : ms;
  return new Promise((res, rej) => {
    let acc = 0, last = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      if (tok !== era.token){ clearInterval(id); rej(CANCEL); return; }
      if (!era.paused) acc += now - last;
      last = now;
      if (acc >= total){ clearInterval(id); res(); }
    }, 40);
  });
}

function stopTask(){
  era.token++;
  closeEraFilm();
  era.paused = false;
  $('#park-stage')?.classList.remove('paused');
  clearStageFx();
}

/* ---------- 球場上的動畫圖層：字幕、大數字、傳承鏈 ---------- */
function fxLayer(id, cls){
  let el = document.getElementById(id);
  if (!el){ el = document.createElement('div'); el.id = id; el.className = cls; (id === 'park-sub' ? $('.park-notes') : $('#park-stage')).append(el); }
  return el;
}
function clearStageFx(){
  ['park-sub', 'park-counter', 'park-ribbon'].forEach(id => { const el = document.getElementById(id); if (el){ el.className = el.className.replace(/\s*show/g, ''); el.innerHTML = ''; } });
  $('#park-overlay')?.classList.remove('spotting');
  $$('.banner.spot, .banner.lowered').forEach(b => b.classList.remove('spot', 'lowered'));
}

function chipHTML(item){
  if (typeof item === 'string'){
    const st = byStage[item];
    return `<span class="rb-chip" style="--c:${st.color}"><i></i><b>${esc(st.name)}</b><small>${esc(st.period)}</small></span>`;
  }
  if (Array.isArray(item)) return `<span class="rb-group">${item.map(chipHTML).join('<span class="rb-plus">＋</span>')}</span>`;
  if (item.gap) return `<span class="rb-gap"><em>${esc(item.gap)}</em></span>`;
  if (item.end) return `<span class="rb-end">${esc(item.end)}</span>`;
  if (item.text) return `<span class="rb-sep">${esc(item.text)}</span>`;
  return '';
}

/* 每一幕可以用的動作 */
function stageKit(tok){
  const S = {
    wait: ms => waitFor(ms, tok),
    reset(){ clearStageFx(); },
    year(y, opts){ showYear(y, opts); },
    flags(ids, opts){ setFlags(ids.map(flagOf), opts); },
    add(id){ setFlags([...park.flags.filter(f => f.key !== byStage[id].group), flagOf(id)]); },
    crowd(avg, colors){ setCrowd(avg, colors || yearColors(state.year)); },
    lights(n, dim){ setLights(n, dim); },
    board(y, l1, l2, msg){ setBoard(y, l1, l2, msg); },
    plaque(a, b){ $('#pl-year').textContent = a; $('#pl-name').textContent = b; },
    sub(text){
      const el = fxLayer('park-sub', 'park-sub');
      el.classList.remove('show'); void el.offsetWidth;
      el.textContent = text; el.classList.add('show');
      eraReader.lines.push(text);eraReader.positions.guide=0;eraReader.subtitle=text;eraReader.subtitlePage=0;
      renderEraReading();renderEraSubtitle();
    },
    counter(html){
      const el = fxLayer('park-counter', 'park-counter');
      if (!html){ el.classList.remove('show'); return; }
      el.innerHTML = html;el.classList.toggle('wide',($('b',el)?.textContent.length||0)>9);
      el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
    },
    async count(from, to, ms, label, unit = '人'){
      const steps = 30;
      for (let i = 0; i <= steps; i++){
        const v = from + (to - from) * (i / steps);
        S.counter(`<small>${esc(label)}</small><b>${fmt(v)}</b><small>${unit}</small>`);
        if (i < steps) await S.wait(ms / steps);
      }
    },
    async tweenCrowd(from, to, ms, colors){
      const steps = 24;
      for (let i = 1; i <= steps; i++){ setCrowd(from + (to - from) * i / steps, colors || yearColors(state.year), {instant:true}); await S.wait(ms / steps); }
    },
    spot(ids){
      const ov = $('#park-overlay');
      ov.classList.toggle('spotting', !!ids && ids.length > 0);
      $$('.banner', ov).forEach(b => b.classList.toggle('spot', !!ids && ids.includes(b.dataset.stage)));
    },
    flip(from, to){ setFlags(park.flags.map(f => f.stageId === from ? flagOf(to) : f)); S.spot([to]); },
    async lower(id){
      const b = $(`.banner[data-stage="${id}"]`);
      if (b) b.classList.add('lowered');
      await S.wait(1100);
      setFlags(park.flags.filter(f => f.stageId !== id));
    },
    /* 兩面旗飛到一起，合成一面新的旗 */
    async merge(ids, to){
      const els = ids.map(id => $(`.banner[data-stage="${id}"]`)).filter(Boolean);
      if (els.length){
        const x = els.reduce((s, e) => s + parseFloat(e.style.left), 0) / els.length;
        const y = els.reduce((s, e) => s + parseFloat(e.style.top), 0) / els.length;
        els.forEach(e => { e.classList.add('merging'); e.style.left = x + '%'; e.style.top = y + '%'; });
      }
      await S.wait(1000);
      const list = [...park.flags], idx = list.findIndex(f => f.stageId === ids[0]);
      const next = list.filter(f => !ids.includes(f.stageId));
      next.splice(Math.max(0, Math.min(idx, next.length)), 0, flagOf(to));
      setFlags(next);
      S.spot([to]);
    },
    /* 球隊沿革：依序呈現改名、接手與解散等歷程。 */
    async ribbon(chain){
      const el = fxLayer('park-ribbon', 'park-ribbon');
      const markup = chain.flatMap((item, i) => [
        ...(i ? [`<span class="rb-arrow${item && item.gap ? ' dashed' : ''}" aria-hidden="true"></span>`] : []),
        chipHTML(item)
      ]);
      if (!el.children.length) el.innerHTML = `<span class="rb-title">沿革</span>`;
      const existing = [...el.children].slice(1);
      let keep = 0;
      while (keep < existing.length && existing[keep].dataset.ribbonKey === markup[keep]) keep++;
      existing.slice(keep).forEach(part => part.remove());
      const parts = [];
      for (const html of markup.slice(keep)){
        el.insertAdjacentHTML('beforeend', html);
        const part = el.lastElementChild;
        part.dataset.ribbonKey = html;
        parts.push(part);
      }
      el.classList.add('show');
      void el.offsetWidth;
      for (const p of parts){ p.classList.add('on'); await S.wait(p.classList.contains('rb-arrow') ? 180 : 500); }
    },
    boom(){ celebrate(); }
  };
  return S;
}

/* ---------- 九個展櫃的劇本 ---------- */
const ALL_CPBL = y => teamsIn(y, 'cpbl').map(lastStage);
const ERA_FILMS={cpbl21:{id:'L8C5dGnhiTo',title:'彭政閔：請球迷再給我們一次機會！',year:2010,url:'https://www.youtube.com/watch?v=L8C5dGnhiTo',src:'{{VIDEO:cpbl21}}',poster:'{{VIDEO_POSTER:cpbl21}}'}};
let eraFilmSession=null;
function clearEraFilmPlayer(){
  const player=$('#era-film-player video');
  if(player){player.pause();player.removeAttribute('src');player.load();}
  $('#era-film-player').replaceChildren();
}
function closeEraFilm(){
  const session=eraFilmSession;if(!session)return;
  eraFilmSession=null;
  clearEraFilmPlayer();$('#era-film').hidden=true;
  museumMusic.release('era-film');
  if(session.token===era.token){
    era.paused=session.paused;
    $('#era-toggle').textContent=session.paused?'▶ 繼續':'❚❚ 暫停';
    $('#park-stage').classList.toggle('paused',session.paused);
  }
  session.resolve();
}
function openEraFilm(key,{automatic=false}={}){
  const video=ERA_FILMS[key],screen=document.getElementById('era-film');
  if(!video||!screen)return Promise.resolve();
  if(eraFilmSession)return eraFilmSession.promise;
  const paused=era.paused,token=era.token;
  let resolve;const promise=new Promise(done=>{resolve=done;});
  eraFilmSession={paused,token,promise,resolve};
  museumMusic.hold('era-film');
  era.paused=true;
  $('#era-toggle').textContent='▶ 繼續';$('#park-stage').classList.add('paused');
  $('#era-film-title').textContent=video.title;
  $('#era-film-year').textContent=`歷史影像 · ${video.year}`;
  $('#era-film-source').href=video.url;
  const player=document.createElement('video');
  player.setAttribute('aria-label',video.title);player.src=video.src;player.poster=video.poster;
  player.controls=true;player.playsInline=true;player.preload='metadata';
  $('#era-film-player').replaceChildren(player);
  player.addEventListener('ended',closeEraFilm,{once:true});
  player.addEventListener('play',()=>{if(eraFilmSession?.promise===promise)$('#era-toggle').textContent='❚❚ 暫停影片';});
  player.addEventListener('pause',()=>{if(eraFilmSession?.promise===promise)$('#era-toggle').textContent='▶ 繼續影片';});
  $('#era-film-close').textContent=automatic?'略過影片 ›':'回到球場 ✕';
  $('#era-film-close').onclick=closeEraFilm;
  screen.hidden=false;
  player.play().catch(()=>{/* 瀏覽器若限制自動播放，可直接按原生播放鍵。 */});
  return promise;
}
const ERAS = [
  {n:1, scenes:[
    {title:'聯盟成立', event:'opening', async run(S){
      S.flags([]); S.crowd(0, []); S.lights(0); S.board(1989, '中華職業棒球聯盟', '10 月 23 日成立', ''); S.plaque('開幕前', '？');
      S.sub('1989 年 10 月 23 日，中華職業棒球聯盟成立。'); await S.wait(2600);
      S.sub('球場還暗著，外野也還空著。第一個球季，要等到隔年春天。'); await S.wait(2600);
    }},
    {title:'燈亮了，四隊入場', event:'opening', async run(S){
      S.flags([]); S.crowd(0, []); S.lights(0); S.board(1990, '臺北市立棒球場', '1990.03.17', ''); S.plaque('開幕前', '？');
      S.sub('1990 年 3 月 17 日，臺北市立棒球場。'); await S.wait(1600);
      for (let i = 1; i <= 4; i++){ S.lights(i); await S.wait(450); }
      S.sub('燈亮了。四支創始球隊，一隊一隊走進球場——'); await S.wait(1200);
      for (const id of ['elephants', 'lions', 'dragons-old', 'tigers']){
        S.add(id); S.spot([id]); S.counter(`<b>${esc(nameOf(id))}</b><small>創始球隊</small>`); await S.wait(1300);
      }
      S.spot(null); S.counter(null);
    }},
    {title:'一萬四千人', event:'opening', async run(S){
      S.flags(['elephants', 'lions', 'dragons-old', 'tigers']); S.crowd(0, []); S.lights(4); S.board(1990, '臺北市立棒球場', '1990.03.17', ''); S.plaque('開幕前', '？');
      S.sub('看台開始坐滿。');
      await Promise.all([S.count(0, 14350, 2600, '開幕戰'), S.tweenCrowd(0, MAX_AVG, 2600, yearColors(1990))]);
      S.sub('那天湧進 1 萬 4350 人。旅日名將王貞治為第一場比賽揮下開幕的那一棒。'); S.board(1990, '中職 4 隊', '統一獅 vs 兄弟象', 'PLAY BALL!'); S.boom();
      await S.wait(3200);
      S.year(1990); S.counter(null);
      S.sub('這一年打了 180 場，全年約 90 萬人次進場。臺灣職棒開始了。'); await S.wait(2400);
    }}
  ]},
  {n:2, scenes:[
    {title:'六隊時代', event:'expansion', async run(S){
      S.year(1992);
      S.sub('職棒元年之後，四支球隊打了三個球季。'); await S.wait(2200);
      S.sub('1993 年，兩支新球隊走進球場。'); await S.wait(1400);
      for (const id of ['bears', 'eagles']){ S.add(id); S.spot([id]); S.counter(`<b>${esc(nameOf(id))}</b><small>新加入</small>`); await S.wait(1400); }
      S.spot(null); S.year(1993);
      S.sub('六支球隊、270 場比賽，全年進場第一次突破 160 萬人次。');
      await S.count(1238063, 1600549, 2000, '全年進場', '人次');
      await S.wait(1800);
    }},
    {title:'熊變成了牛', event:'bear-bull', async run(S){
      S.year(1995); S.spot(['bears']);
      S.sub('1995 球季後，興農接手了俊國熊。'); await S.wait(1600);
      await S.ribbon(['bears']);
      S.board(1996, '中職 6 隊', '上半季', ''); S.flip('bears', 'sinon-bear');
      S.sub('球隊先改名「興農熊」……'); await S.ribbon(['bears', 'sinon-bear']); await S.wait(1200);
      S.board(1996, '中職 6 隊', '6 月 7 日', ''); S.flip('sinon-bear', 'bulls');
      S.sub('1996 年 6 月 7 日，再改名「興農牛」。'); await S.ribbon(['bears', 'sinon-bear', 'bulls']); await S.wait(1200);
      S.sub('名字換了兩次，看台上的球迷還是同一群人。這就是「傳承」：球隊換了主人，故事接著寫下去。'); await S.wait(3400);
    }}
  ]},
  {n:3, scenes:[
    {title:'看台空了一半', event:'black-eagle', async run(S){
      S.year(1996, {league:'cpbl'});
      S.sub('1996 年，中職六隊，平均每場約 4,500 人。'); await S.wait(2200);
      S.spot(['eagles']);
      S.sub('1997 年，時報鷹多名球員涉入簽賭放水，被移送偵辦——史稱「黑鷹事件」。'); await S.wait(2600);
      S.lights(4, true);
      S.sub('球迷開始懷疑比賽的真假。');
      await Promise.all([S.count(avgOf(1996), avgOf(1997), 2600, '平均每場'), S.tweenCrowd(avgOf(1996), avgOf(1997), 2600)]);
      S.year(1997, {league:'cpbl'}); S.spot(['eagles']);
      S.sub('看台空了一半。'); await S.wait(2400); S.counter(null);
    }},
    {title:'一座島，兩個聯盟', event:'two-leagues', async run(S){
      S.year(1997, {league:'cpbl'});
      S.sub('同一年，另一個職業聯盟開打了。'); await S.wait(1800);
      S.year(1997); S.spot(['sun-sampo', 'kong97', 'warrior97', 'thunder97']);
      S.counter('<small>一座島</small><b>2 個聯盟 · 11 隊</b>');
      S.sub('台灣大聯盟以城市為名：臺北太陽、臺中金剛、嘉南勇士、高屏雷公（斜紋旗）。'); await S.wait(3200);
      S.spot(['whalex']);
      S.sub('中職這邊，也迎來新成員和信鯨。球員、球迷和資源，從此分成兩邊。'); await S.wait(3000);
      S.counter(null);
    }},
    {title:'時報鷹離開', event:'farewell', async run(S){
      S.year(1997); S.spot(['eagles']);
      S.sub('時報鷹在 1997 年後停止出賽，1998 年宣布解散。'); await S.wait(1600);
      await S.ribbon(['eagles', {end:'解散'}]);
      await S.lower('eagles');
      S.year(1998); S.sub('1993 年一起加入的兩支球隊，一支繼續往下傳，一支在這裡畫下句點。'); await S.wait(3000);
    }}
  ]},
  {n:4, scenes:[
    {title:'三連霸之後', event:'farewell', async run(S){
      S.year(1999); S.spot(['dragons-old']);
      S.sub('1999 年，味全龍完成總冠軍三連霸。'); await S.wait(2400);
      S.sub('然後，它解散了。同一個冬天，三商虎也宣布解散。'); await S.wait(1600);
      S.spot(['dragons-old', 'tigers']);
      await Promise.all([S.lower('dragons-old'), S.lower('tigers')]);
      S.counter('<small>兩支創始球隊</small><b>1990–1999</b>'); await S.wait(2600); S.counter(null);
    }},
    {title:'最冷清的一年', event:'farewell', async run(S){
      S.year(1995);
      S.sub('還記得 1995 年嗎？那年全年有 164 萬人次進場。'); await S.wait(2000);
      S.year(2000); S.lights(4, true);
      await Promise.all([S.count(1646361, 301671, 2600, '全年進場', '人次'), S.tweenCrowd(avgOf(1995), avgOf(2000), 2600, yearColors(2000))]);
      S.sub('2000 年，中職只剩四隊，全年約 30 萬人次，是史上最低。'); await S.wait(3000); S.counter(null);
    }},
    {title:'鯨換了名字', event:'whale-name', async run(S){
      S.year(2001); S.spot(['whalex']);
      S.sub('2002 年，和信鯨改名中信鯨。'); await S.wait(1200);
      S.board(2002, '中職 4 隊 · TML 4 隊', '', ''); S.flip('whalex', 'whales');
      await S.ribbon(['whalex', 'whales']);
      S.sub('隔壁的台灣大聯盟也撐得很辛苦，球隊的冠名企業幾乎年年更換。'); S.year(2002); S.spot(['whales']); await S.wait(3000);
    }}
  ]},
  {n:5, scenes:[
    {title:'簽下協議', event:'integration', async run(S){
      S.year(2002); S.spot(['sun-macoto', 'kong02', 'warrior02', 'thunder00']);
      S.sub('2003 年 1 月 13 日，兩個聯盟簽下整合協議。'); S.counter('<small>2003.01.13</small><b>2 個聯盟 → 1 個</b>'); await S.wait(3000);
      S.counter(null);
    }},
    {title:'兩隊併成一隊', event:'integration', async run(S){
      S.year(2002);
      S.sub('台灣大聯盟的四支球隊，兩兩整併，加入中職。'); await S.wait(1800);
      S.spot(['sun-macoto', 'thunder00']); await S.wait(600);
      await S.merge(['sun-macoto', 'thunder00'], 'first');
      S.sub('臺北太陽 ＋ 高屏雷公 → 第一金剛'); await S.ribbon([['sun-macoto', 'thunder00'], 'first']); await S.wait(1600);
      S.spot(['kong02', 'warrior02']); await S.wait(600);
      await S.merge(['kong02', 'warrior02'], 'naluwan');
      S.sub('臺中金剛 ＋ 嘉南勇士 → 那魯灣太陽'); await S.ribbon([['kong02', 'warrior02'], 'naluwan']); await S.wait(1600);
      S.board(2003, '中職 6 隊', '兩聯盟合一', '');
      S.sub('名字會騙人：叫「金剛」的那隊，前身是太陽和雷公；叫「太陽」的那隊，前身是金剛和勇士。'); await S.wait(3600);
    }},
    {title:'又換了新名字', event:'new-owners', async run(S){
      S.year(2003, {override:{'macoto-sun':'naluwan'}}); S.spot(['naluwan']);
      S.sub('3 月 14 日，那魯灣太陽受誠泰冠名，改叫誠泰太陽。'); await S.wait(1000);
      S.flip('naluwan', 'macoto-sun'); await S.ribbon(['naluwan', 'macoto-sun']); await S.wait(1400);
      S.board(2004, '中職 6 隊', '', ''); S.spot(['first']);
      S.sub('2004 年，La New 接手第一金剛，變成 La New熊。'); await S.wait(800);
      S.flip('first', 'lanew'); await S.ribbon([['sun-macoto', 'thunder00'], 'first', 'lanew']); await S.wait(1400);
      S.spot(['macoto-sun']);
      S.sub('誠泰從冠名企業變成經營者，球隊改名誠泰COBRAS。'); await S.wait(800);
      S.flip('macoto-sun', 'cobras'); await S.ribbon([['kong02', 'warrior02'], 'naluwan', 'macoto-sun', 'cobras']); await S.wait(2400);
    }}
  ]},
  {n:6, scenes:[
    {title:'巨砲歸來', event:'chen-return', photo:'chen2016', async run(S){
      S.year(2006); S.spot(['lanew']);
      S.sub('2006 年，旅美的陳金鋒回到臺灣，加入 La New熊。'); await S.wait(2600);
      S.sub('同一年，La New熊拿下年度總冠軍（右下角冠軍看板）。'); await S.wait(2800);
    }},
    {title:'又一次風暴', event:'contraction', async run(S){
      S.year(2008); S.spot(['dmedia']);
      S.sub('2008 年，接手誠泰的米迪亞暴龍，因球團涉入簽賭事件，被聯盟除名。'); await S.wait(1200);
      await S.ribbon(['naluwan', 'macoto-sun', 'cobras', 'dmedia', {end:'除名'}]);
      await S.lower('dmedia');
      S.spot(['whales']);
      S.sub('中信鯨也在這一季後解散。'); await S.ribbon(['whalex', 'whales', {end:'解散'}]);
      await S.lower('whales');
      S.year(2009); S.sub('2009 年，中職又只剩四隊。'); await S.wait(2600);
    }},
    {title:'職棒 21 年',video:'cpbl21',async run(S){
      S.year(2010);
      S.sub('2010 年，職棒 21 年。透過這段當年的影像，回看球場與球迷之間的連結。');
      await S.wait(5200);
    }}
  ]},
  {n:7, scenes:[
    {title:'搬到桃園', event:'lamigo-era', async run(S){
      S.year(2010); S.spot(['lanew']);
      S.sub('2011 年，La New熊搬到桃園，改名 Lamigo桃猿。'); await S.wait(1000);
      S.board(2011, '中職 4 隊', '', ''); S.flip('lanew', 'lamigo');
      await S.ribbon(['first', 'lanew', 'lamigo']);
      S.sub('新的城市、新的主場、新的應援，同一支球隊繼續往下傳。'); await S.wait(2800);
    }},
    {title:'經典賽之後', event:'wbc-2013', async run(S){
      S.year(2012);
      S.sub('走過兩次谷底，2012 年平均每場只剩約 2,400 人。'); await S.wait(2400);
      S.sub('2013 年季前，世界棒球經典賽在臺灣開打，全島守在電視前。'); await S.wait(1600);
      await Promise.all([S.count(583805, 1459072, 2800, '全年進場', '人次'), S.tweenCrowd(avgOf(2012), avgOf(2013), 2800, yearColors(2013))]);
      S.year(2013); S.boom();
      S.sub('球迷回來了：全年進場人數翻倍。'); await S.wait(2800); S.counter(null);
    }},
    {title:'牛交棒犀牛', event:'rhino-era', async run(S){
      S.year(2012); S.spot(['bulls']);
      S.sub('同一年，興農結束經營，球隊交給義大。'); await S.wait(1000);
      S.board(2013, '中職 4 隊', '', ''); S.flip('bulls', 'rhinos');
      await S.ribbon(['bears', 'sinon-bear', 'bulls', 'rhinos']);
      S.sub('從俊國熊到義大犀牛，這面旗已經換到第四個名字。'); await S.wait(2800);
    }}
  ]},
  {n:8, scenes:[
    {title:'兄弟交棒', event:'brothers-era', async run(S){
      S.year(2013); S.spot(['elephants']);
      S.sub('2014 年，兄弟象交棒，球隊改名中信兄弟。'); await S.wait(1000);
      S.board(2014, '中職 4 隊', '', ''); S.flip('elephants', 'brothers');
      await S.ribbon(['elephants', 'brothers']);
      S.sub('名字裡也有「中信」，但它接的是象隊的棒子，和已解散的中信鯨是兩條不同的路。'); await S.wait(3400);
    }},
    {title:'四個企業接力', event:'fubon-era', async run(S){
      S.year(2016); S.spot(['rhinos']);
      S.sub('2017 年，義大犀牛交給富邦，變成富邦悍將。'); await S.wait(1000);
      S.board(2017, '中職 4 隊', '', ''); S.flip('rhinos', 'guardians');
      await S.ribbon(['bears', 'sinon-bear', 'bulls', 'rhinos', 'guardians']);
      S.sub('往回看：1993 年的俊國熊，一路傳了四個企業、五個名字，才變成今天的樣子。'); await S.wait(3600);
    }},
    {title:'從兩個聯盟傳下來', event:'rakuten-era', async run(S){
      S.year(2019); S.spot(['lamigo']);
      S.sub('2020 年，Lamigo桃猿交給樂天，變成樂天桃猿。'); await S.wait(1000);
      S.board(2020, '中職 4 隊', '', ''); S.flip('lamigo', 'rakuten');
      await S.ribbon([['sun-macoto', 'thunder00'], 'first', 'lanew', 'lamigo', 'rakuten']);
      S.sub('這條線往回追，會一路追到台灣大聯盟的太陽和雷公。兩個聯盟的歷史，都傳到了今天。'); await S.wait(3600);
    }},
    {title:'龍回來了', event:'five-teams', async run(S){
      S.year(2020);
      S.sub('1999 年解散的味全龍，2019 年重新加盟，先打二軍。'); await S.wait(2400);
      S.year(2021); S.spot(['dragons-new']);
      S.sub('2021 年，龍回到一軍。維持了十二年的四隊格局，變成五隊。');
      await S.ribbon(['dragons-old', {gap:'中間空白 21 個球季'}, 'dragons-new']);
      await S.wait(3000);
    }}
  ]},
  {n:9, scenes:[
    {title:'第六支球隊', event:'six-teams', async run(S){
      S.year(2023);
      S.sub('2024 年，台鋼雄鷹加入一軍，中職回到六隊。'); await S.wait(1600);
      S.year(2024); S.spot(['tsg']); await S.wait(1200);
      await S.ribbon(['eagles', {text:'沒有承接關係'}, 'tsg']);
      S.sub('名字裡有「鷹」，但它是全新的球隊，不是時報鷹復活。'); await S.wait(3000);
    }},
    {title:'所有人的冠軍', event:'premier12', photo:'taiwan2024',emblem:'ct',async run(S){
      S.year(2024); S.spot(ALL_CPBL(2024));
      S.sub('2024 年 11 月 24 日，臺灣代表隊在東京巨蛋 4 比 0 擊敗日本，拿下世界 12 強冠軍。');
      S.counter('<small>WBSC 世界 12 強</small><b>冠軍</b>'); S.boom(); await S.wait(3000);
      S.sub('穿上國家隊球衣時，大家支持的是同一支球隊。');
      S.counter('<img class="ct-crest" src="{{EMBLEM:ct}}" width="190" height="190" alt="臺灣棒球代表隊 CT 標誌">');
      S.boom(); await S.wait(4200); S.counter(null);
    }},
    {title:'三十六年快轉', async run(S){
      S.year(1990);
      S.sub('最後，把三十六年一口氣快轉一次：看旗子怎麼換、看台怎麼起伏。'); await S.wait(2400);
      for (let y = 1990; y <= 2025; y++){
        S.year(y);
        S.counter(`<small>${y}</small><b>${fmt(recordByYear[y].attendance)}</b><small>人次</small>`);
        await S.wait(y === 1997 || y === 2000 || y === 2003 || y === 2013 ? 900 : 420);
      }
      S.boom();
      S.sub('2025 年，全年進場突破 373 萬人次，是 1990 年的四倍多。'); await S.wait(3200); S.counter(null);
    }},
    {title:'比賽還在進行', async run(S){
      S.year(2026); S.spot(ALL_CPBL(2026));
      S.sub('2026 年，六支球隊、新的故事每天都在發生。這一頁，本館不預測結局。'); await S.wait(3200);
      S.sub('每一面旗子背後，都有好幾個名字、好幾代球迷。看台上的人換了一批又一批，棒子一直傳下去。'); await S.wait(3600);
      S.sub('謝謝你，願意把一點時間留給臺灣棒球。'); await S.wait(3000);
      S.sub('不論你是一路相伴的老球迷、剛開始看球的新朋友，還是今天第一次認識棒球，都歡迎你。'); await S.wait(5600);
      S.sub('每一份關注、每一聲加油，都讓臺灣棒球多一份走下去的力量。'); await S.wait(4400);
      S.sub('謝謝你，成為這段故事的一部分。比賽還在繼續，看台上，永遠有你的位置。'); await S.wait(4600);
    }}
  ]}
];

/* ---------- 播放器 ---------- */
const eraReader={tab:'guide',lines:[],positions:{guide:0,text:0,extra:0},subtitle:'',subtitlePage:0,observer:null,raf:0};
function eraTextPages(text,fits){
  const chars=Array.from(text),pages=[];let start=0;
  while(start<chars.length){
    let low=1,high=chars.length-start,best=1;
    while(low<=high){const mid=Math.floor((low+high)/2);if(fits(chars.slice(start,start+mid).join(''))){best=mid;low=mid+1;}else high=mid-1;}
    pages.push(chars.slice(start,start+best).join(''));start+=best;
  }
  return pages.length?pages:[''];
}
function fitEraCopy(box,text){
  const probe=document.createElement('p');probe.className='era-copy-probe';box.replaceChildren(probe);
  const available=box.clientHeight;
  const pages=eraTextPages(text,value=>{probe.textContent=value;return available>0?probe.scrollHeight<=available:Array.from(value).length<=48;});
  return pages;
}
function renderEraSubtitle(){
  const box=$('#park-sub');if(!box||!eraReader.subtitle)return;
  let pager=$('#era-sub-pages');
  if(!pager){pager=document.createElement('div');pager.id='era-sub-pages';pager.className='era-sub-pages';$('.park-notes').append(pager);}
  pager.hidden=true;let pages=fitEraCopy(box,eraReader.subtitle);
  if(pages.length>1){pager.hidden=false;pager.innerHTML='<button type="button" data-subpage="prev" aria-label="上一段字幕">‹</button><span></span><button type="button" data-subpage="next" aria-label="下一段字幕">›</button>';pages=fitEraCopy(box,eraReader.subtitle);}
  const index=Math.min(eraReader.subtitlePage,pages.length-1);eraReader.subtitlePage=index;box.textContent=pages[index];
  if(!pager.hidden){$('span',pager).textContent=`${index+1} / ${pages.length}`;$('[data-subpage="prev"]',pager).disabled=index===0;$('[data-subpage="next"]',pager).disabled=index===pages.length-1;}
}
function renderEraReading(){
  const box=$('#era-page-content');if(!box||!era.n)return;
  const s=ERAS[era.n-1].scenes[era.scene],tab=eraReader.tab;
  $$('[data-era-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.eraTab===tab)));
  $('#era-page-title').textContent=era.done?(era.n===9?'故事還在繼續':'本局完成'):`第 ${era.scene+1} 幕 · ${s.title}`;
  if(era.done&&tab==='guide'){
    const next=era.n<9?era.n+1:null;
    box.innerHTML=`<div class="era-finish" id="era-end"><h4>${era.n===9?'謝謝你，讓故事繼續。':`第${ZH[era.n]}局看完了`}</h4><button type="button" class="btn btn-gold" data-mp="close">回到展廳</button>${next?`<button type="button" class="btn btn-line" data-goto="era-${next}">前往第${ZH[next]}局 →</button>`:'<button type="button" class="btn btn-line" data-goto="theater">前往時光劇場 →</button>'}<button type="button" class="link-btn" data-era="replay">從頭再看一次</button></div>`;
    $('#era-page-nav').hidden=true;return;
  }
  let pages;
  if(tab==='extra'){
    pages=[];
    if(s.video)pages.push(...fitEraCopy(box,`${ERA_FILMS[s.video].year} · ${ERA_FILMS[s.video].title}\n點上方的影片按鈕，即可開啟內嵌播放器。`).map(text=>({text})));
    if(s.photo){const p=photos[s.photo];pages.push({photo:s.photo});pages.push(...fitEraCopy(box,`${p.title}\n${p.caption}\n攝影：${p.author} · CC BY 2.0`).map(text=>({text,source:p.page})));}
    if(s.event)pages.push({event:s.event});
    if(s.emblem==='ct')pages.push(...fitEraCopy(box,'CT 標誌圖檔：miang123／Vectors Arena。點此查看圖檔來源。').map(text=>({text,source:'https://vectorsarena.com/photo/2186/chinese-taipei-national-baseball-team-logo-download-free-vector-logo'})));
    if(!pages.length)pages=[{text:'這一幕的重點都在球場動畫中。點旗幟可以查看球隊身世。'}];
  }else{
    const text=tab==='text'?eraReader.lines.join('\n\n'):eraReader.lines.at(-1)||'動畫即將開始。可使用上方控制切換場景或暫停。';
    pages=fitEraCopy(box,text).map(text=>({text}));
  }
  const index=Math.max(0,Math.min(eraReader.positions[tab]||0,pages.length-1));eraReader.positions[tab]=index;
  const page=pages[index];
  if(page.photo){const p=photos[page.photo];box.innerHTML=`<img class="era-page-photo" src="${p.src}" alt="${esc(p.title)}" data-photo="${page.photo}" tabindex="0" role="button" aria-label="放大照片：${esc(p.title)}">`;}
  else if(page.event){const e=byEvent[page.event];box.innerHTML=`<div class="era-event-card"><span>本幕歷史球票</span><h4>${esc(e.title)}</h4><button type="button" class="read-ticket" data-event="${page.event}">打開這張球票 →</button></div>`;}
  else{box.replaceChildren();const p=document.createElement('p');p.className='era-page-copy';
    if(page.source){const a=document.createElement('a');a.href=page.source;a.target='_blank';a.rel='noopener noreferrer';a.textContent=page.text;p.append(a);}else p.textContent=page.text;
    box.append(p);}
  $('#era-page-nav').hidden=false;$('#era-page-count').textContent=`${index+1} / ${pages.length}`;
  $('[data-era-page="prev"]').disabled=index===0;$('[data-era-page="next"]').disabled=index===pages.length-1;
}
function renderEraShell(n){
  eraReader.observer?.disconnect();Object.assign(eraReader,{tab:'guide',lines:[],positions:{guide:0,text:0,extra:0},subtitle:'',subtitlePage:0});
  const inn = innings[n - 1], scenes = ERAS[n - 1].scenes;
  const video=scenes.find(s=>s.video)?.video;
  panel().innerHTML = `<div class="mp-head"><span class="mp-inning">第 ${ZH[n]} 局</span><span class="mp-years">${inn.years}</span><h3 id="mp-title" tabindex="-1">${esc(inn.title)}</h3><p class="mp-tag">${esc(inn.tagline)}</p></div>
    <label class="era-scene-picker">選擇場景<select id="era-scene-select">${scenes.map((s,i)=>`<option value="${i}">${i+1}. ${esc(s.title)}</option>`).join('')}</select></label>
    <div class="player-ctl" role="group" aria-label="動畫播放控制">
      <button type="button" data-era="prev" aria-label="上一幕">⏮</button>
      <button type="button" data-era="toggle" id="era-toggle">❚❚ 暫停</button>
      <button type="button" data-era="next" aria-label="下一幕">⏭</button>
    </div>
    ${video?`<button type="button" class="era-video-open" data-era-video="${video}" aria-controls="era-film"><span>▶</span> 職棒 21 年 · 2010 影像</button>`:''}
    <div class="era-reading-tabs" role="group" aria-label="展櫃內容"><button type="button" data-era-tab="guide" aria-pressed="true">導讀</button><button type="button" data-era-tab="text" aria-pressed="false">文字</button><button type="button" data-era-tab="extra" aria-pressed="false">延伸</button></div>
    <section class="era-reading"><h4 id="era-page-title"></h4><div id="era-page-content"></div><div class="era-page-nav" id="era-page-nav"><button type="button" data-era-page="prev" aria-label="上一頁內容">‹ 上一頁</button><span id="era-page-count"></span><button type="button" data-era-page="next" aria-label="下一頁內容">下一頁 ›</button></div></section>`;
  $('#era-scene-select').addEventListener('change',e=>playEra(era.n,+e.target.value));
  eraReader.observer=new ResizeObserver(()=>{cancelAnimationFrame(eraReader.raf);eraReader.raf=requestAnimationFrame(()=>{renderEraReading();renderEraSubtitle();});});
  eraReader.observer.observe($('#era-page-content'));eraReader.observer.observe($('#park-sub'));
}

function renderSceneInfo(){
  const s = ERAS[era.n - 1].scenes[era.scene];
  $$('.scene-list button').forEach((b, i) => { b.classList.toggle('cur', i === era.scene); b.classList.toggle('seen', i < era.scene || era.done); if (i === era.scene) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
  $('#era-scene-select').value=String(era.scene);
  eraReader.lines=[];eraReader.tab='guide';eraReader.positions={guide:0,text:0,extra:0};eraReader.subtitle='';$('#era-sub-pages')?.remove();renderEraReading();
  $('#era-toggle').textContent = '❚❚ 暫停';
}

async function playEra(n, from = 0){
  stopTask();
  const tok = era.token;
  era.done=false;
  if (era.n !== n)renderEraShell(n);
  era.n = n;
  $('#era-end')?.remove();
  const scenes = ERAS[n - 1].scenes;
  for (let i = from; i < scenes.length; i++){
    era.scene = i;
    renderSceneInfo();
    const S = stageKit(tok);
    S.reset();
    try {
      await scenes[i].run(S);
      if(tok!==era.token)return;
      if(scenes[i].video)await openEraFilm(scenes[i].video,{automatic:true});
      else await S.wait(1200);
    }
    catch (e){ if (e === CANCEL) return; throw e; }
    if (tok !== era.token) return;
  }
  finishEra(n);
}

function finishEra(n){
  era.done = true;
  stamp('era-' + n);
  $$('.scene-list button').forEach(b => b.classList.add('seen'));
  renderEraReading();
}

function eraControl(e){
  const video=e.target.closest('[data-era-video]');if(video){openEraFilm(video.dataset.eraVideo);return;}
  const tab=e.target.closest('[data-era-tab]');if(tab){eraReader.tab=tab.dataset.eraTab;renderEraReading();return;}
  const page=e.target.closest('[data-era-page]');if(page){eraReader.positions[eraReader.tab]=Math.max(0,(eraReader.positions[eraReader.tab]||0)+(page.dataset.eraPage==='next'?1:-1));renderEraReading();return;}
  const sub=e.target.closest('[data-subpage]');if(sub){eraReader.subtitlePage=Math.max(0,eraReader.subtitlePage+(sub.dataset.subpage==='next'?1:-1));renderEraSubtitle();return;}
  const s = e.target.closest('[data-scene]');
  if (s) return playEra(era.n, +s.dataset.scene);
  const b = e.target.closest('[data-era]');
  if (b){
    const act = b.dataset.era, last = ERAS[era.n - 1].scenes.length - 1;
    if (act === 'toggle'){
      const film=$('#era-film-player video');
      if(eraFilmSession&&film){if(film.paused)film.play().catch(()=>{});else film.pause();return;}
      era.paused = !era.paused; b.textContent = era.paused ? '▶ 繼續' : '❚❚ 暫停'; $('#park-stage').classList.toggle('paused', era.paused);
    }
    else if (act === 'prev') playEra(era.n, Math.max(0, era.scene - 1));
    else if (act === 'next'){ if (era.scene < last) playEra(era.n, era.scene + 1); }
    else if (act === 'replay') playEra(era.n, 0);
    return;
  }
  if (e.target.closest('[data-mp="close"]')) closeExhibit();
}
