/* ============================================================
   臺灣職棒時光機 · 互動
   1 工具 → 2 衍生資料 → 3 球場模型 → 4（動畫展櫃在 eras.js）→ 5 自由探索／這一年
   → 6 族譜 → 7 彈出視窗 → 8 歷史挑戰 → 9 出處 → 10 事件綁定
   （博物館地圖與體驗遊戲在 museum.js、games.js）
   ============================================================ */

/* ---------- 1. 工具 ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = n => Math.round(n).toLocaleString('zh-TW');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const smooth = () => reduceMotion.matches ? 'auto' : 'smooth';
const later = (fn, ms) => setTimeout(fn, reduceMotion.matches ? Math.min(ms, 150) : ms);
const shuffle = list => { const a = [...list]; for (let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const MIN_YEAR = 1990, MAX_YEAR = 2026;
const ZH = ['零','一','二','三','四','五','六','七','八','九'];
const CAT_ICON = {'聯盟發展':'◆','球隊變遷':'●','賽事與紀錄':'★'};

/* ---------- 2. 衍生資料 ---------- */
const leagueName = id => leagues.find(l => l.id === id).name;
const leagueShort = id => leagues.find(l => l.id === id).short;
const teamsIn = (year, league) => seasonTeams.find(s => s.year === year && s.league === league)?.members || [];
const seasonNote = (year, league) => seasonTeams.find(s => s.year === year && s.league === league)?.notes || '';
const lastStage = m => m.stageIds[m.stageIds.length - 1];
const memberName = m => m.stageIds.map(id => byStage[id].name).join(' → ');
const EMBLEM = {elephants:'象',brothers:'兄',lions:'獅',sevenlions:'獅','dragons-old':'龍','dragons-new':'龍',tigers:'虎',eagles:'鷹',bears:'熊','sinon-bear':'熊',bulls:'牛',rhinos:'犀',guardians:'悍',whalex:'鯨',whales:'鯨',first:'剛',lanew:'熊',lamigo:'猿',rakuten:'猿',naluwan:'陽','macoto-sun':'陽',cobras:'蛇',dmedia:'暴',tsg:'鷹'};
const emblem = id => EMBLEM[id] || ({tmlsun:'陽',tmlkong:'剛',tmlwarrior:'勇',tmlthunder:'雷'})[byStage[id].group] || byStage[id].name.slice(-1);
// 外野旗子上的短隊名（直書）
const BANNER = {elephants:'兄弟象',brothers:'中信兄弟',lions:'統一獅',sevenlions:'統一獅','dragons-old':'味全龍','dragons-new':'味全龍',tigers:'三商虎',eagles:'時報鷹',bears:'俊國熊','sinon-bear':'興農熊',bulls:'興農牛',rhinos:'義大犀牛',guardians:'富邦悍將',whalex:'和信鯨',whales:'中信鯨',first:'第一金剛',lanew:'LaNew熊',lamigo:'Lamigo',rakuten:'樂天桃猿',naluwan:'那魯灣',
  'macoto-sun':'誠泰太陽',cobras:'誠泰蛇',dmedia:'米迪亞',tsg:'台鋼雄鷹','sun-sampo':'聲寶太陽','sun-macoto':'誠泰太陽'};
const bannerLabel = id => BANNER[id] || ({tmlkong:'金剛',tmlwarrior:'勇士',tmlthunder:'雷公'})[byStage[id].group] || byStage[id].name;
const PHOTO_FOR_EVENT = {'chen-return':'chen2016','dragon-title':'lin2024','premier12':'taiwan2024'};
const avgOf = y => recordByYear[y]?.average;

function memberTag(year, league, m){
  const st = byStage[lastStage(m)];
  const same = list => list.find(x => byStage[lastStage(x)].group === st.group);
  const prev = same(teamsIn(year - 1, league)), next = same(teamsIn(year + 1, league));
  if (year === 1990) return '創始球隊';
  if (st.id === 'dragons-new' && year === 2021) return '重返一軍';
  if (!prev) return league === 'cpbl' && year === 2003 ? '整併加入' : '新加入';
  if (!next && year < MAX_YEAR) return '最後一季';
  if (m.stageIds.length > 1) return '季中改名';
  if (lastStage(prev) !== st.id) return '新隊名';
  return '';
}

const SPAN = {'sinon-bear':[1996,1996.45], bulls:[1996.45,2013], naluwan:[2003,2003.25], 'macoto-sun':[2003.25,2004], kong99:[1999,2000.4], kong00:[2000.4,2002]};
const spanOf = st => SPAN[st.id] || [st.start, st.end + 1];
const lanes = [
  {label:'兄弟', ids:['elephants','brothers']},
  {label:'統一', ids:['lions','sevenlions']},
  {label:'味全', ids:['dragons-old','dragons-new'], gap:[2000, 2021, '1999 解散 · 2019 重新加盟 · 2021 回到一軍']},
  {label:'三商', ids:['tigers']},
  {label:'時報', ids:['eagles']},
  {label:'俊國 → 富邦', ids:['bears','sinon-bear','bulls','rhinos','guardians']},
  {label:'和信／中信鯨', ids:['whalex','whales']},
  {label:'太陽 → 桃猿', ids:['sun-sampo','sun-macoto','first','lanew','lamigo','rakuten'], junction:2003},
  {label:'TML 雷公', ids:['thunder97','thunder00'], mergeUp:true},
  {label:'金剛 → 暴龍', ids:['kong97','kong98','kong99','kong00','kong02','naluwan','macoto-sun','cobras','dmedia'], junction:2003},
  {label:'TML 勇士', ids:['warrior97','warrior00','warrior01','warrior02'], mergeUp:true},
  {label:'台鋼', ids:['tsg']}
];
const laneOf = id => lanes.findIndex(l => l.ids.includes(id));
const CHART_LABEL = {'sun-sampo':'聲寶太陽','sun-macoto':'誠泰太陽',kong97:'金剛',kong98:'中纖',kong99:'金剛',kong00:'媚登峯',kong02:'宏碁',warrior97:'年代勇士',warrior00:'遠傳',warrior01:'網客',warrior02:'勇士',thunder97:'生活雷公',thunder00:'年代雷公',cobras:'COBRAS',dmedia:'暴龍','dragons-old':'味全龍','dragons-new':'味全龍'};

function lineageOf(id){
  const seen = new Set([id]), queue = [id];
  while (queue.length){
    const cur = queue.shift();
    teamRelations.forEach(r => {
      const other = r.from === cur ? r.to : r.to === cur ? r.from : null;
      if (other && !seen.has(other)){ seen.add(other); queue.push(other); }
    });
  }
  return [...seen].map(s => byStage[s]).sort((a, b) => spanOf(a)[0] - spanOf(b)[0] || laneOf(a.id) - laneOf(b.id));
}

/* ---------- 3. 互動球場 ----------
   球場以 1000×560 座標繪製：看台座位依「平均每場觀眾」亮起，外野旗子是當年的球隊。 */
const W = 1000, H = 560, CX = 500, CY = 720, R_WALL = 392, MAX_AVG = 10500;
const rad = d => d * Math.PI / 180;
const pt = (r, th) => [CX + r * Math.sin(th), CY - r * Math.cos(th)];
const park = {flags:[], seats:[]};

function mulberry32(a){ return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

function sector(r1, r2, a1, a2){
  const [x1, y1] = pt(r2, a1), [x2, y2] = pt(r2, a2), [x3, y3] = pt(r1, a2), [x4, y4] = pt(r1, a1);
  return `M${x1} ${y1}A${r2} ${r2} 0 0 1 ${x2} ${y2}L${x3} ${y3}A${r1} ${r1} 0 0 0 ${x4} ${y4}Z`;
}

function buildPark(){
  const rnd = mulberry32(19);
  const seats = [];
  for (let k = 0; k < 16; k++){
    const r = 404 + k * 12;
    const tmax = Math.min(Math.asin(Math.min(1, 488 / r)), Math.acos(Math.min(1, (CY - 532) / r)));
    const n = Math.floor(2 * tmax * r / 13);
    for (let i = 0; i < n; i++){
      const [x, y] = pt(r, -tmax + (i + 0.5) * (2 * tmax / n));
      seats.push({x, y, u:rnd(), order:rnd()});
    }
  }
  [...seats].sort((a, b) => a.order - b.order).forEach((s, i) => { s.rank = i; });
  park.seats = seats;

  // 界外線：從本壘往一、三壘延伸到全壘打牆
  const foul = dir => { let x = 500, y = 548; while (Math.hypot(x - CX, y - CY) < 366){ x += dir * 0.83; y -= 0.56; } return `${x.toFixed(1)} ${y.toFixed(1)}`; };
  const towerDefs = [-40, -16, 16, 40].map((deg, i) => { const [x, y] = pt(600, rad(deg)); return {x, base:y, top:Math.abs(deg) > 20 ? 64 : 40, i}; });
  const towers = towerDefs.map(({x, base, top, i}) => `<g class="tower" data-i="${i}"><rect x="${x - 3}" y="${top}" width="6" height="${base - top}" fill="#0a1713"/>
    <circle class="halo" cx="${x}" cy="${top - 4}" r="62" fill="url(#p-glow)"/>
    <rect x="${x - 40}" y="${top - 28}" width="80" height="34" rx="3" fill="#0a1713"/>
    ${[0,1].map(row => [0,1,2,3,4].map(c => `<circle class="lamp" cx="${x - 30 + c * 15}" cy="${top - 19 + row * 15}" r="4.6"/>`).join('')).join('')}</g>`).join('');
  const beams = towerDefs.map(({x, top, i}) => `<polygon class="beam" data-i="${i}" points="${x},${top} ${x - 150 + (500 - x) * 0.6},${H} ${x + 150 + (500 - x) * 0.6},${H}" fill="url(#p-beam)"/>`).join('');
  const fieldPath = `M${pt(366, rad(-64)).join(' ')}A366 366 0 0 1 ${pt(366, rad(64)).join(' ')}L${W} ${H}L0 ${H}Z`;

  $('#park-svg-wrap').innerHTML = `<svg id="park-svg" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="park-svg-title">
  <title id="park-svg-title">互動球場：看台觀眾、外野球隊旗、記分板與冠軍看板會隨年份改變</title>
  <defs>
    <linearGradient id="p-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1c17"/><stop offset="1" stop-color="#1d4337"/></linearGradient>
    <radialGradient id="p-glow"><stop offset="0" stop-color="#fff6d0" stop-opacity=".9"/><stop offset=".4" stop-color="#ffe7a0" stop-opacity=".3"/><stop offset="1" stop-color="#ffe7a0" stop-opacity="0"/></radialGradient>
    <linearGradient id="p-beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3c4" stop-opacity=".16"/><stop offset="1" stop-color="#fff3c4" stop-opacity="0"/></linearGradient>
    <linearGradient id="p-grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c7650"/><stop offset="1" stop-color="#1f5a3c"/></linearGradient>
    <pattern id="p-mow" width="60" height="60" patternUnits="userSpaceOnUse" patternTransform="rotate(20)"><rect width="30" height="60" fill="#fff" opacity=".05"/></pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#p-sky)"/>
  <g fill="#f6efe0" opacity=".7"><circle cx="90" cy="40" r="1.3"/><circle cx="240" cy="22" r="1"/><circle cx="780" cy="30" r="1.2"/><circle cx="930" cy="80" r="1"/><circle cx="660" cy="12" r="1"/></g>
  <g class="beams">${beams}</g>
  <path d="${sector(392, 604, rad(-68), rad(68))}" fill="#13291f"/>
  <g class="stands" id="stands" role="button" tabindex="0" aria-label="看台：查看這一年的觀眾人數">
    <path d="${sector(398, 600, rad(-66), rad(66))}" fill="transparent"/>
    <g id="seats">${seats.map(s => `<circle class="seat" cx="${s.x.toFixed(1)}" cy="${s.y.toFixed(1)}" r="4.4" style="transition-delay:${(s.rank % 40) * 9}ms"/>`).join('')}</g>
  </g>
  ${towers}
  <g class="park-sb" id="scoreboard" role="button" tabindex="0" aria-label="記分板：查看這一年的歷史球票">
    <rect x="404" y="10" width="192" height="104" rx="5" fill="#07130f" stroke="#c9982a" stroke-opacity=".7" stroke-width="2"/>
    <rect x="492" y="114" width="16" height="16" fill="#07130f"/>
    <text id="sb-year" x="500" y="48" text-anchor="middle">1990</text>
    <text id="sb-l1" x="500" y="70" text-anchor="middle"></text>
    <text id="sb-l2" x="500" y="88" text-anchor="middle"></text>
    <text id="sb-msg" x="500" y="106" text-anchor="middle"></text>
  </g>
  <path d="${fieldPath}" fill="url(#p-grass)"/>
  <path d="${fieldPath}" fill="url(#p-mow)"/>
  <path d="${sector(366, R_WALL, rad(-64), rad(64))}" fill="#174a37" stroke="#0d2b20"/>
  <path d="M${pt(R_WALL, rad(-64)).join(' ')}A${R_WALL} ${R_WALL} 0 0 1 ${pt(R_WALL, rad(64)).join(' ')}" fill="none" stroke="#f3c969" stroke-width="3"/>
  <path d="M500 562 L616 482 Q500 398 384 482 Z" fill="#a8693f"/>
  <path d="M500 538 L574 486 L500 446 L426 486 Z" fill="#2a6e49"/>
  <path d="M500 548 L${foul(1)} M500 548 L${foul(-1)}" stroke="#f6efe0" stroke-width="2" opacity=".75"/>
  <ellipse cx="500" cy="484" rx="16" ry="6" fill="#b9784b"/>
  <g fill="#f6efe0"><rect x="585" y="481" width="8" height="8" transform="rotate(45 589 485)"/><rect x="496" y="439" width="8" height="8" transform="rotate(45 500 443)"/><rect x="407" y="481" width="8" height="8" transform="rotate(45 411 485)"/><path d="M494 544h12v4l-6 5-6-5z"/></g>
  <g id="batting" class="batting-layer">
    <g fill="#0b1915"><circle cx="500" cy="462" r="6"/><rect x="495" y="467" width="10" height="16" rx="3"/></g>
    <g fill="#0b1915"><circle cx="472" cy="524" r="7"/><rect x="466" y="530" width="12" height="20" rx="3"/><line id="bat" x1="478" y1="532" x2="456" y2="508" stroke="#c9a46a" stroke-width="4" stroke-linecap="round"/></g>
    <circle id="ball" cx="500" cy="466" r="3" fill="#fff"/>
  </g>
  <g class="plaque" id="plaque" role="button" tabindex="0" aria-label="冠軍看板：查看年度總冠軍">
    <rect x="852" y="470" width="140" height="80" rx="6" fill="#07130f" stroke="#c9982a" stroke-width="2"/>
    <path d="M876 486h22v8a11 11 0 0 1-22 0zM882 506h10v6h5v4h-20v-4h5z M876 489h-5a5 5 0 0 0 6 9 M898 489h5a5 5 0 0 1-6 9" fill="#f3c969" stroke="#f3c969" stroke-width="1.5" stroke-linejoin="round"/>
    <text id="pl-year" x="908" y="496">年度冠軍</text>
    <text id="pl-name" x="922" y="534" text-anchor="middle"></text>
  </g>
</svg>`;
  park.seatEls = $$('#seats .seat');
  const stage = $('#park-stage');
  const resize = () => stage.style.setProperty('--u', (stage.clientWidth / W) + 'px');
  new ResizeObserver(resize).observe(stage);
  resize();
}

/* 看台：avg 決定亮起的座位數，顏色取當年各隊代表色 */
function setCrowd(avg, colors, {instant = false, unknown = false} = {}){
  const svg = $('#park-svg');
  svg.classList.toggle('instant', instant);
  svg.classList.toggle('unknown', unknown);
  const count = Math.round(Math.min(1, Math.max(0, avg / MAX_AVG)) * park.seats.length);
  const palette = colors.length ? colors : ['#f6efe0'];
  park.seats.forEach((s, i) => {
    const el = park.seatEls[i], on = s.rank < count;
    el.classList.toggle('on', on);
    el.style.fill = on ? palette[Math.floor(s.u * palette.length)] : '';
  });
}

function setLights(n, dim = false){
  $$('#park-svg .tower, #park-svg .beam').forEach(t => t.classList.toggle('lit', +t.dataset.i < n));
  $('#park-svg').classList.toggle('dim', dim);
}

function setBoard(year, l1, l2, msg){
  $('#sb-year').textContent = year;
  $('#sb-l1').textContent = l1;
  $('#sb-l2').textContent = l2;
  $('#sb-msg').textContent = msg || '';
}

function setPlaque(year){
  const rec = recordByYear[year];
  $('#pl-year').textContent = `${year} 冠軍`;
  $('#pl-name').textContent = rec ? bannerLabel(rec.championId) : '進行中';
}

/* 外野旗子：以 key（球隊家族）辨識，改名時原地翻面，新隊從天而降，離開的倒下 */
function setFlags(list, {merge = false} = {}){
  park.flags = list;
  const layer = $('#park-overlay');
  const existing = new Map($$('.banner:not(.leave)', layer).map(b => [b.dataset.key, b]));
  const nC = list.filter(f => f.league === 'cpbl').length, nT = list.length - nC;
  const slots = list.length + (nT && nC ? 0.8 : 0);
  const step = Math.min(10, 100 / Math.max(slots, 1));
  const start = -(slots * step) / 2;
  const keep = new Set();
  list.forEach((f, i) => {
    const st = byStage[f.stageId];
    const slot = i + (f.league === 'tml' && nC ? 0.8 : 0);
    const [x, y] = pt(R_WALL, rad(start + (slot + 0.5) * step));
    keep.add(f.key);
    let b = existing.get(f.key);
    if (!b){
      b = document.createElement('button');
      b.type = 'button';
      b.className = 'banner' + (reduceMotion.matches ? '' : ' enter');
      b.innerHTML = '<span class="cloth"><span class="txt"></span></span><span class="pole"></span>';
      b.addEventListener('animationend', () => b.classList.remove('enter', 'flip', 'shake'));
      layer.append(b);
    } else if (b.dataset.stage !== f.stageId){
      b.classList.remove('flip'); void b.offsetWidth; b.classList.add('flip');
    }
    b.dataset.key = f.key;
    b.dataset.stage = f.stageId;
    b.classList.toggle('tml', st.league === 'tml');
    b.style.opacity = '';
    b.style.setProperty('--c', st.color);
    b.style.left = (x / W * 100) + '%';
    b.style.top = (y / H * 100) + '%';
    $('.txt', b).textContent = bannerLabel(f.stageId);
    b.setAttribute('aria-label', `${st.name}（${leagueName(st.league)}）`);
    b.title = st.name;
  });
  existing.forEach((b, key) => {
    if (keep.has(key)) return;
    b.classList.remove('enter', 'flip');
    b.classList.add('leave');
    if (merge && b.classList.contains('tml')) b.classList.add('merge');
    b.disabled = true;
    later(() => b.remove(), 600);
  });
}

const flagOf = sid => ({key:byStage[sid].group, stageId:sid, league:byStage[sid].league});

function flagsFor(year, league = 'all', override = {}){
  const members = [...(league !== 'tml' ? teamsIn(year, 'cpbl') : []), ...(league !== 'cpbl' ? teamsIn(year, 'tml') : [])];
  return members.map(m => { const sid = lastStage(m); return flagOf(override[sid] || sid); });
}

const yearColors = year => [...teamsIn(year, 'cpbl'), ...teamsIn(year, 'tml')].map(m => byStage[lastStage(m)].color).concat('#f6efe0');

function renderParkYear(year, {league, override = {}, merge = false} = {}){
  const lg = league || (game.mode === 'free' ? state.league : 'all');
  setFlags(flagsFor(year, lg, override), {merge});
  const rec = recordByYear[year];
  setCrowd(rec ? rec.average : avgOf(2025), yearColors(year), {unknown:!rec});
  const cp = teamsIn(year, 'cpbl').length, tm = teamsIn(year, 'tml').length;
  setBoard(year, `中職 ${cp} 隊${tm ? ` · TML ${tm} 隊` : ''}`, rec ? `場均 ${fmt(rec.average)} 人` : '球季進行中', lg === 'tml' && !tm ? 'TML 本年無比賽' : '');
  setPlaque(year);
  setLights(4, !!rec && rec.average < 2100);
}

/* 球場換年份時，同步下方「這一年」與族譜游標 */
function showYear(year, opts){
  state.year = year;
  renderMachine();
  renderParkYear(year, opts);
}

let toastTimer;
function toast(text, ms = 2400){
  const t = $('#park-toast');
  t.textContent = text;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), ms);
}

function celebrate(){
  if (reduceMotion.matches) return;
  const fx = $('#park-fx');
  const colors = ['#f3c969','#d1553b','#f6efe0','#4f8fd1','#5bbf8a'];
  for (let b = 0; b < 3; b++){
    const cx = 20 + Math.random() * 60, cy = 8 + Math.random() * 22;
    for (let i = 0; i < 18; i++){
      const p = document.createElement('i');
      const a = (i / 18) * Math.PI * 2, d = 40 + Math.random() * 50;
      p.style.cssText = `left:${cx}%;top:${cy}%;--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d}px;background:${colors[i % colors.length]};animation-delay:${b * 180}ms`;
      fx.append(p);
      setTimeout(() => p.remove(), 1500 + b * 180);
    }
  }
}

/* ---------- 4. 歷史長廊動畫展櫃：見 eras.js ---------- */

/* ---------- 5. 自由探索／這一年 ---------- */
const state = {year:MIN_YEAR, league:'all', category:'all'};

function eraText(y){
  if (y <= 1992) return '職棒元年的四支創始球隊，每一場都是「第一次」。';
  if (y <= 1996) return '六隊時代，中職迎來第一波人氣高峰。';
  if (y === 1997) return '黑鷹事件重創人氣，同年台灣大聯盟開打，兩聯盟並存。';
  if (y <= 2002) return '中職與台灣大聯盟並存：兩個獨立聯盟，各自比賽。';
  if (y === 2003) return '兩聯盟整合：TML 四隊整併為兩隊，加入中職。';
  if (y <= 2008) return '整合後的六隊時代，2008 年再度遭遇簽賭風暴。';
  if (y === 2013) return '經典賽熱潮之後，球迷回到球場，全年進場人數翻倍。';
  if (y <= 2020) return '四隊時代：球隊陸續換手，看台慢慢回溫。';
  if (y <= 2023) return '味全回到一軍，五隊交手。';
  return '台鋼加入一軍，中職回到六隊。';
}

function renderFreePanel(){
  if (game.mode !== 'free') return;
  const y = state.year, rec = recordByYear[y];
  panel().innerHTML = `<div class="mp-head"><span class="mp-inning">自由探索</span><span class="mp-years">${y}</span><h3 id="mp-title" tabindex="-1">轉動年份，整座球場跟著變。</h3></div>
    <p class="mp-intro">${eraText(y)}</p>
    <ul class="free-tips">
      <li><b>外野旗子</b>：點一下看球隊身世</li>
      <li><b>看台</b>：亮起的座位 ≈ 當年平均每場觀眾（滿場約 10,500 人）${rec ? `；今年 ${fmt(rec.average)} 人` : ''}</li>
      <li><b>記分板</b>：跳到這一年的歷史球票</li>
      <li><b>冠軍看板</b>：看年度總冠軍</li>
    </ul>
    <p class="mp-hint">試試看：1996 → 1997、2012 → 2013，看台會發生什麼事？或按「自動播放 36 年」。</p>`;
}

/* 球場模型有兩種用法：歷史長廊播動畫（era）、時光劇場自己轉年份（free） */
function setMode(mode, focus = true){
  game.mode = mode;
  $('#desk').hidden = mode !== 'free';
  if (mode === 'free'){
    stopTask();
    renderParkYear(state.year);
    renderMachine();
    if (focus) $('#year-range').focus({preventScroll:true});
  } else stopAutoplay();
}

function renderYearBoard(){
  const y = state.year, cp = teamsIn(y, 'cpbl').length, tm = teamsIn(y, 'tml').length, rec = recordByYear[y];
  const notes = [seasonNote(y, 'cpbl'), seasonNote(y, 'tml'), rec?.note].filter(Boolean);
  const champ = rec ? byStage[rec.championId].name : null;
  $('#year-board').innerHTML = `
    <div class="year-status">
      <h3>${y} 年：${tm ? `兩個聯盟，共 ${cp + tm} 支球隊` : `中華職棒 ${cp} 隊`}</h3>
      <p>${eraText(y)}</p>
      ${notes.map(n => `<p class="note">※ ${esc(n)}</p>`).join('')}
    </div>
    <div class="stat-tiles" aria-label="${y} 年中職一軍例行賽數據">
      <div class="tile"><span>全年進場</span><b>${rec ? fmt(rec.attendance) : '進行中'}</b><small>${rec ? '人次' : '未收錄'}</small></div>
      <div class="tile"><span>平均每場</span><b>${rec ? fmt(rec.average) : '—'}</b><small>${rec ? '人' : '未收錄'}</small></div>
      <div class="tile"><span>例行賽</span><b>${rec ? rec.games : '—'}</b><small>${rec ? '場' : '未收錄'}</small></div>
      <div class="tile"><span>年度總冠軍</span><b class="champ">${champ ? esc(champ) : '尚未產生'}</b><small>${champ ? '中職' : '不預測'}</small></div>
    </div>`;
}

function teamCard(m, year, league){
  const sid = lastStage(m), st = byStage[sid], tag = memberTag(year, league, m);
  return `<button type="button" class="team-card" data-stage="${sid}" style="--c:${st.color}" aria-label="${esc(memberName(m))}，${leagueName(league)}，查看球隊身世">
    <span class="band"><span class="league-tag">${leagueShort(league)}</span></span>
    <span class="crest" aria-hidden="true">${emblem(sid)}</span>
    <span class="body"><span class="name">${esc(memberName(m))}</span><span class="sub">${esc(st.period)}</span>
      ${tag ? `<span class="badge">${tag}</span>` : ''}<span class="more">看身世 →</span></span></button>`;
}

function leagueOffHTML(y){
  return y < 1997
    ? `<div class="league-off"><h3>台灣大聯盟：尚未成立</h3><p>${y} 年還沒有台灣大聯盟。它在 1997 年才開打第一季，到 2002 年共比賽六季。</p><button type="button" class="btn btn-line" data-goyear="1997">跳到 1997 年 →</button></div>`
    : `<div class="league-off"><h3>台灣大聯盟：已整合</h3><p>台灣大聯盟最後一季是 2002 年。2003 年兩聯盟整合，四支球隊整併成兩隊加入中職，${y} 年沒有 TML 比賽。</p><button type="button" class="btn btn-line" data-event="integration">讀整合的故事 →</button></div>`;
}

function renderRosters(){
  const y = state.year, box = $('#rosters'), tm = teamsIn(y, 'tml');
  const showCp = state.league !== 'tml', showTml = state.league !== 'cpbl';
  const roster = lg => {
    const members = teamsIn(y, lg), note = seasonNote(y, lg);
    return `<div class="roster"><div class="roster-head"><h3>${leagueName(lg)}</h3><span class="count">${members.length} 隊</span></div>
      ${note ? `<p class="roster-note">※ ${esc(note)}</p>` : ''}<div class="cards">${members.map(m => teamCard(m, y, lg)).join('')}</div></div>`;
  };
  let html = '';
  if (showCp) html += roster('cpbl');
  if (showTml) html += tm.length ? roster('tml') : leagueOffHTML(y);
  box.innerHTML = html;
  box.classList.toggle('two', showCp && showTml && tm.length > 0);
}

const dateLabel = e => /^\d{4}-\d{2}-\d{2}$/.test(e.date) ? e.date.slice(5).replace('-', '.') : e.date.replace(/^\d{4}\s*/, '') || '全年';
function ticketHTML(e){
  return `<button type="button" class="ev-ticket" id="ticket-${e.id}" data-event="${e.id}">
    <span class="ev-stub"><b>${e.year}</b><small>${esc(dateLabel(e))}</small><small>${e.leagueIds.map(leagueShort).join('・')}</small></span>
    <span class="ev-body"><span class="ev-cat"><span aria-hidden="true">${CAT_ICON[e.category]}</span>${e.category}</span>
      <span class="t">${esc(e.title)}</span><span class="s">${esc(e.summary)}</span><span class="tear">撕開看完整故事 →</span></span></button>`;
}
const matchesFilters = e => (state.league === 'all' || e.leagueIds.includes(state.league)) && (state.category === 'all' || e.category === state.category);

function renderTickets(){
  const y = state.year, list = events.filter(e => e.year === y && matchesFilters(e));
  const lgLabel = state.league === 'all' ? '全部聯盟' : leagueName(state.league);
  const catLabel = state.category === 'all' ? '全部類別' : state.category;
  $('#tickets-title').textContent = `${y} 年的歷史球票`;
  $('#filter-status').textContent = `目前條件：${y} 年 · ${lgLabel} · ${catLabel}，共 ${list.length} 張球票。`;
  if (list.length){ $('#tickets').innerHTML = list.map(ticketHTML).join(''); return; }
  const filtered = state.league !== 'all' || state.category !== 'all';
  const prev = [...events].reverse().find(e => e.year < y && matchesFilters(e));
  const next = events.find(e => e.year > y && matchesFilters(e));
  $('#tickets').innerHTML = `<div class="empty"><p><b>此條件下尚未收錄事件。</b><br>這不代表 ${y} 年沒有發生大事，只是本站精選的球票裡還沒有這一年${filtered ? '符合這些條件' : ''}的故事。</p>
    <div class="row">${filtered ? '<button type="button" class="btn btn-primary" data-clear-filters>清除篩選</button>' : ''}
    ${prev ? `<button type="button" class="btn btn-line" data-goyear="${prev.year}" data-stay>← 上一張：${prev.year}</button>` : ''}
    ${next ? `<button type="button" class="btn btn-line" data-goyear="${next.year}" data-stay>下一張：${next.year} →</button>` : ''}</div></div>`;
}

function renderMachine(){
  const y = state.year;
  $('#machine-year').textContent = y;
  const range = $('#year-range');
  range.value = y;
  range.setAttribute('aria-valuetext', `${y} 年`);
  $('#prev-year').disabled = y <= MIN_YEAR;
  $('#next-year').disabled = y >= MAX_YEAR;
  $$('#decade-chips .chip').forEach(b => b.setAttribute('aria-pressed', String(Math.floor(y / 10) * 10 === +b.dataset.decade)));
  $$('#league-chips .chip').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.league === state.league)));
  $$('#category-chips .chip').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.category === state.category)));
  renderYearBoard();
  renderRosters();
  renderTickets();
  updateCursor();
  renderFreePanel();
}

/* 使用者主動換年份：切到自由探索，球場與下方同步 */
function setYear(y){
  state.year = Math.min(MAX_YEAR, Math.max(MIN_YEAR, y));
  if (game.mode !== 'free') setMode('free', false);
  renderMachine();
  renderParkYear(state.year);
}

let autoTimer = null;
function stopAutoplay(){
  if (!autoTimer) return;
  clearInterval(autoTimer);
  autoTimer = null;
  $('#autoplay').textContent = '▶ 自動播放 36 年';
  $('#autoplay').setAttribute('aria-pressed', 'false');
}
function toggleAutoplay(){
  if (autoTimer) return stopAutoplay();
  if (state.year >= MAX_YEAR) setYear(MIN_YEAR);
  $('#autoplay').textContent = '❚❚ 暫停播放';
  $('#autoplay').setAttribute('aria-pressed', 'true');
  autoTimer = setInterval(() => {
    if (state.year >= MAX_YEAR) return stopAutoplay();
    setYear(state.year + 1);
  }, reduceMotion.matches ? 1400 : 900);
}

/* ---------- 6. 球隊族譜 ---------- */
const X0 = 118, YW = 30, TOP = 46, LH = 40, BAR = 26;
const lx = y => X0 + (y - MIN_YEAR) * YW;
const laneY = i => TOP + i * LH;
const CH_W = lx(MAX_YEAR + 1) + 14, CH_H = TOP + lanes.length * LH + 22;
const textWidth = s => [...s].reduce((w, c) => w + (/[\u0000-ÿ]/.test(c) ? 6.6 : 11.5), 0);

function buildLineage(){
  let svg = `<svg viewBox="0 0 ${CH_W} ${CH_H}" role="group" aria-label="1990 到 2026 年各球隊沿革圖">
  <defs>
    <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="3" height="6" fill="rgba(255,255,255,.32)"/></pattern>
    <marker id="arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="#b2432f"/></marker>
  </defs>
  <g class="lin-era"><rect x="${lx(1997)}" y="${TOP - 10}" width="${lx(2003) - lx(1997)}" height="${CH_H - TOP + 10}"/><text x="${lx(1997) + 6}" y="${CH_H - 8}">兩聯盟並存 1997–2002</text></g>
  <g class="lin-axis">`;
  for (let y = MIN_YEAR; y <= MAX_YEAR; y++){
    const major = y % 5 === 0 || y === MAX_YEAR;
    svg += `<line x1="${lx(y)}" x2="${lx(y)}" y1="${major ? 24 : 30}" y2="${major ? CH_H - 22 : 34}"${major ? ' stroke-dasharray="2 4"' : ''}/>`;
    if (major) svg += `<text x="${lx(y) + YW / 2}" y="18" text-anchor="middle">${y}</text>`;
  }
  svg += `<line x1="${lx(2003)}" x2="${lx(2003)}" y1="24" y2="${CH_H - 22}" stroke="#b2432f" stroke-width="1.5"/><text x="${lx(2003) + 4}" y="32" style="fill:#b2432f;font-weight:700">2003 整合</text></g>`;
  lanes.forEach((lane, i) => {
    const y0 = laneY(i);
    svg += `<text class="lin-lane-label" x="10" y="${y0 + BAR / 2 + 4}">${esc(lane.label)}</text>`;
    if (lane.gap){
      const [a, b, note] = lane.gap;
      svg += `<line class="lin-gap" x1="${lx(a) + 4}" x2="${lx(b) - 4}" y1="${y0 + BAR / 2}" y2="${y0 + BAR / 2}"/><text class="lin-note" x="${(lx(a) + lx(b)) / 2}" y="${y0 + BAR / 2 - 5}" text-anchor="middle">${note}</text>`;
    }
    lane.ids.forEach(id => {
      const st = byStage[id], [s, e] = spanOf(st);
      const x = lx(s) + 1, w = Math.max(4, lx(e) - lx(s) - 2);
      const label = CHART_LABEL[id] || st.name;
      const fits = textWidth(label) <= w - 4;
      svg += `<g class="seg" data-stage="${id}" tabindex="0" role="button" aria-label="${esc(st.name)}，${leagueName(st.league)}，${esc(st.period)}">
        <title>${esc(st.name)}（${esc(st.period)}）</title>
        <rect class="base" x="${x}" y="${y0}" width="${w}" height="${BAR}" rx="6" fill="${st.color}"/>
        ${st.league === 'tml' ? `<rect x="${x}" y="${y0}" width="${w}" height="${BAR}" rx="6" fill="url(#hatch)" pointer-events="none"/>` : ''}
        ${fits ? `<text x="${x + w / 2}" y="${y0 + BAR / 2 + 4}" text-anchor="middle">${esc(label)}</text>` : ''}</g>`;
    });
    if (lane.junction) svg += `<circle cx="${lx(lane.junction)}" cy="${y0 + BAR / 2}" r="5" fill="#b2432f" stroke="#fff" stroke-width="2"/>`;
    if (lane.mergeUp){
      const x0 = lx(2003), yc = y0 + BAR / 2, target = laneY(i - 1) + BAR + 2;
      svg += `<path class="lin-merge" d="M${x0 - 4} ${yc} C${x0 + 12} ${yc} ${x0 + 12} ${yc - 6} ${x0 + 12} ${target + 4}" marker-end="url(#arrow)"/><text class="lin-note" x="${x0 + 18}" y="${yc + 4}" style="fill:#b2432f;font-weight:700">整併</text>`;
    }
  });
  svg += `<g class="lin-cursor" id="lin-cursor" pointer-events="none"><line y1="${TOP - 14}" y2="${CH_H - 18}"/><rect x="-21" y="${CH_H - 20}" width="42" height="16" rx="3"/><text y="${CH_H - 8}" text-anchor="middle"></text></g></svg>`;
  $('#lineage-chart').innerHTML = svg;
}

function updateCursor(){
  const c = $('#lin-cursor');
  if (!c) return;
  c.setAttribute('transform', `translate(${lx(state.year) + YW / 2} 0)`);
  $('text', c).textContent = state.year;
}

const normalize = s => s.toLowerCase().replace(/台/g, '臺').replace(/[\s・·\-]/g, '');
function renderIndex(){
  $('#team-index').innerHTML = `<div class="index-groups">${lanes.map(l => `
    <div class="index-group"><h4>${esc(l.label)}</h4><div>${l.ids.map(id => {
      const st = byStage[id];
      return `<button type="button" class="name-chip" data-stage="${id}" data-name="${esc(normalize(st.name))}" style="--c:${st.color}">${esc(st.name)} <small>${st.start}${st.end !== st.start ? '–' + (st.end === MAX_YEAR ? '今' : st.end) : ''}</small></button>`;
    }).join('')}</div></div>`).join('')}</div>`;
  $('#team-search-status').textContent = `共 ${teamStages.length} 個隊名，依球隊家族分組。`;
}

function filterIndex(q){
  const n = normalize(q);
  let count = 0;
  $$('.index-group').forEach(g => {
    let any = false;
    $$('.name-chip', g).forEach(c => { const hit = !n || c.dataset.name.includes(n); c.hidden = !hit; if (hit){ any = true; count++; } });
    g.hidden = !any;
  });
  $$('.seg').forEach(s => s.classList.toggle('dim', !!n && !normalize(byStage[s.dataset.stage].name).includes(n)));
  $('#team-search-status').textContent = !n ? `共 ${teamStages.length} 個隊名，依球隊家族分組。`
    : count ? `找到 ${count} 個符合「${q}」的隊名，族譜圖上也已標示。` : `沒有找到「${q}」。試試「熊」、「太陽」或「兄弟」。`;
}

/* ---------- 7. 彈出視窗 ---------- */
const sheet = $('#sheet');
let sheetTrigger = null;

function photoFigure(id){
  const p = photos[id];
  return `<figure><img src="${p.src}" alt="${esc(p.title)}" loading="lazy" data-photo="${id}" tabindex="0" role="button" aria-label="放大照片：${esc(p.title)}"><figcaption>${esc(p.caption)} 攝影：${esc(p.author)}（<a href="${p.page}" target="_blank" rel="noopener noreferrer">CC BY 2.0</a>）</figcaption></figure>`;
}

function openSheet(html, trigger){
  $('#sheet-body').innerHTML = html;
  if (!sheet.open){
    sheetTrigger = trigger || document.activeElement;
    sheet.showModal();
  }
  $('.sheet-inner', sheet).scrollTop = 0;
  $('#sheet-close').focus();
}

function sourceList(ids){
  return `<ul class="src-mini">${[...new Set(ids)].map(id => {
    const s = sources[id];
    return `<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)}</a><br><small>${esc(s.org)} · 查閱 ${s.checked}</small></li>`;
  }).join('')}</ul>`;
}

function openEvent(id, trigger){
  const e = byEvent[id], photo = PHOTO_FOR_EVENT[id];
  openSheet(`
    <header class="sheet-head">
      <div class="meta"><span>${esc(e.date)}</span><span>${CAT_ICON[e.category]} ${e.category}</span><span>${e.leagueIds.map(leagueName).join('・')}</span></div>
      <h2 id="sheet-title">${esc(e.title)}</h2>
      <p class="lede-s">${esc(e.summary)}</p>
    </header>
    <div class="sheet-body">
      ${photo ? photoFigure(photo) : ''}
      <h3>背景</h3><p>${esc(e.background)}</p>
      <h3>影響</h3><p>${esc(e.impact)}</p>
      ${e.teamIds.length ? `<h3>相關球隊</h3><div class="related">${e.teamIds.map(t => `<button type="button" class="name-chip" data-stage="${t}" style="--c:${byStage[t].color}">${esc(byStage[t].name)}</button>`).join('')}</div>` : ''}
      <h3>資料來源</h3>${sourceList(e.sourceIds)}
      <div class="btn-row"><button type="button" class="btn btn-primary" data-goyear="${e.year}">在球場看 ${e.year} 年</button></div>
    </div>`, trigger);
}

function openTeam(id, trigger){
  const st = byStage[id], chain = lineageOf(id);
  const related = events.filter(e => e.teamIds.includes(id));
  $$('.seg.selected').forEach(s => s.classList.remove('selected'));
  $(`.seg[data-stage="${id}"]`)?.classList.add('selected');
  openSheet(`
    <header class="sheet-head team" style="--c:${st.color}">
      <div class="meta"><span>${leagueName(st.league)}</span><span>${esc(st.period)}</span></div>
      <h2 id="sheet-title">${esc(st.name)}</h2>
      <p class="lede-s">${esc(st.description)}</p>
    </header>
    <div class="sheet-body">
      <h3>身世線 · ${chain.length} 個名字</h3>
      ${chain.length === 1 ? '<p>這支球隊只用過這一個名字，沒有前身，也沒有後續球隊承接。</p>' : ''}
      <ol class="chain">${chain.map(c => {
        const incoming = teamRelations.filter(r => r.to === c.id);
        return `<li class="${c.id === id ? 'current' : ''}" style="--c:${c.color}"><button type="button" data-stage="${c.id}"${c.id === id ? ' aria-current="true"' : ''}>
          <span class="nm">${esc(c.name)}</span><span class="pd">${esc(c.period)}</span><span class="lt">${leagueShort(c.league)}</span>
          ${incoming.map(r => `<span class="rel">↳ 來自「${esc(byStage[r.from].name)}」：${esc(r.type)}（${esc(r.date)}）</span>`).join('')}
        </button></li>`;
      }).join('')}</ol>
      ${related.length ? `<h3>相關球票</h3><div class="related">${related.map(e => `<button type="button" class="name-chip" data-event="${e.id}" style="--c:var(--brick)">${e.year} ${esc(e.title)}</button>`).join('')}</div>` : ''}
      <h3>資料來源</h3>${sourceList([...st.sourceIds, ...teamRelations.filter(r => r.to === id || r.from === id).flatMap(r => r.sourceIds)])}
      <div class="btn-row"><button type="button" class="btn btn-primary" data-goyear="${st.start}">在球場看 ${st.start} 年</button></div>
    </div>`, trigger);
}

function openPhoto(id, trigger){
  const p = photos[id];
  openSheet(`<header class="sheet-head"><div class="meta"><span>照片 · CC BY 2.0</span></div><h2 id="sheet-title">${esc(p.title)}</h2></header>
    <div class="sheet-body"><figure><img src="${p.src}" alt="${esc(p.title)}"><figcaption>${esc(p.caption)} 攝影：${esc(p.author)}（<a href="${p.page}" target="_blank" rel="noopener noreferrer">原始檔案與授權</a>）</figcaption></figure></div>`, trigger);
}

sheet.addEventListener('close', () => {
  $$('.seg.selected').forEach(s => s.classList.remove('selected'));
  const t = sheetTrigger;
  sheetTrigger = null;
  if (t && document.contains(t)) t.focus({preventScroll:true});
});
sheet.addEventListener('click', e => { if (e.target === sheet) sheet.close(); });
$('#sheet-close').addEventListener('click', () => sheet.close());

/* ---------- 8. 歷史挑戰 ---------- */
const quiz = {status:'idle', ids:[], i:0, picks:{}, results:{}, selected:null};
const qById = Object.fromEntries(quizQuestions.map(q => [q.id, q]));
const quizScore = () => Object.values(quiz.results).filter(Boolean).length * 20;

function startQuiz(){
  Object.assign(quiz, {status:'playing', ids:shuffle(quizQuestions.map(q => q.id)).slice(0, 5), i:0, picks:{}, results:{}, selected:null});
  $('#return-quiz').hidden = true;
  renderQuiz();
  $('#q-title')?.focus();
}

function linescoreHTML(){
  const cells = Array.from({length:5}, (_, k) => {
    const id = quiz.ids[k];
    if (id && id in quiz.results) return quiz.results[id] ? '<td aria-label="得分">1</td>' : '<td class="miss" aria-label="未得分">0</td>';
    if (quiz.status === 'playing' && k === quiz.i) return '<td class="cur" aria-label="進行中"></td>';
    return '<td aria-label="未進行"></td>';
  }).join('');
  const runs = Object.values(quiz.results).filter(Boolean).length;
  return `<table class="linescore"><caption class="sr-only">挑戰賽記分板：每局一題，答對得 1 分</caption>
    <thead><tr><th scope="col"><span class="sr-only">隊伍</span></th>${[1,2,3,4,5].map(n => `<th scope="col">${n}</th>`).join('')}<th scope="col">R</th></tr></thead>
    <tbody><tr><td class="team">你的打線</td>${cells}<td class="r">${runs}</td></tr></tbody></table>`;
}

function renderQuiz(){
  const box = $('#quiz');
  if (quiz.status === 'idle'){
    box.innerHTML = linescoreHTML() + `<div class="q-start"><h3 class="final-title">準備好上場了嗎？</h3>
      <p>從 ${quizQuestions.length} 題題庫抽出 5 題，不會重複。每題答對得 20 分，滿分 100。</p>
      <button type="button" class="btn btn-gold" data-quiz="start">開始挑戰賽</button></div>`;
    return;
  }
  if (quiz.status === 'done'){
    const score = quizScore();
    const title = score === 100 ? '完全打擊！你就是一座行走的中職史料館。' : score >= 80 ? '漂亮！這是一場安打大爆發。'
      : score >= 60 ? '穩穩上壘，及格過關。' : score >= 40 ? '有打有跑，還有進步空間。' : '這局被三振了，回球場再打一次九局吧！';
    box.innerHTML = linescoreHTML() + `<div class="q-final">
      <div class="final-score" aria-label="最終得分 ${score} 分">${score}<small>分</small></div>
      <h3 class="final-title" id="q-title" tabindex="-1">${title}</h3>
      <ul class="review">${quiz.ids.map((id, k) => {
        const q = qById[id], ok = quiz.results[id];
        return `<li><span class="${ok ? 'ok' : 'no'}">${ok ? '✓ 答對' : '✗ 答錯'}</span><span>第 ${k + 1} 局：${esc(q.prompt)}<br><small>正解：${esc(q.options[q.answer])}</small></span></li>`;
      }).join('')}</ul>
      <button type="button" class="btn btn-gold" data-quiz="start">再挑戰一次</button></div>`;
    return;
  }
  const id = quiz.ids[quiz.i], q = qById[id], done = id in quiz.results, pick = done ? quiz.picks[id] : quiz.selected;
  const options = q.options.map((o, k) => {
    const cls = done ? (k === q.answer ? ' is-answer' : k === pick ? ' is-wrong' : '') : '';
    const mark = done ? (k === q.answer ? '<span class="mark">✓ 正解</span>' : k === pick ? '<span class="mark">✗ 你的答案</span>' : '') : '';
    return `<label class="q-opt${cls}"><input type="radio" name="q-opt" value="${k}"${pick === k ? ' checked' : ''}${done ? ' disabled' : ''}><span class="letter">${'ABCD'[k]}</span><span>${esc(o)}</span>${mark}</label>`;
  }).join('');
  const ev = byEvent[q.eventId], ok = quiz.results[id];
  box.innerHTML = linescoreHTML() + `<div class="q-card">
    <div class="q-meta">第 ${quiz.i + 1} 局 / 共 5 局 · 目前 ${quizScore()} 分</div>
    <h3 id="q-title" tabindex="-1">${esc(q.prompt)}</h3>
    <fieldset><legend class="sr-only">選擇一個答案</legend>${options}</fieldset>
    ${done ? `<div class="q-feedback${ok ? '' : ' bad'}" role="status"><h4 id="q-feedback" tabindex="-1">${ok ? '✓ 答對了！拿下 1 分（+20）' : `✗ 可惜，出局。正解是「${esc(q.options[q.answer])}」`}</h4><p>${esc(q.explanation)}</p></div>
      <div class="q-actions"><button type="button" class="btn btn-line" data-quiz="history">回看歷史：${esc(ev.title)}</button>
      <button type="button" class="btn btn-primary" data-quiz="next">${quiz.i < 4 ? '下一局 →' : '看最終比分 →'}</button></div>`
    : `<div class="q-actions"><button type="button" class="btn btn-primary" data-quiz="submit"${quiz.selected === null ? ' disabled' : ''}>送出答案</button><span class="q-hint" id="q-hint">${quiz.selected === null ? '先選一個答案，才能送出。' : '確定了嗎？'}</span></div>`}
  </div>`;
}

function quizAction(action){
  if (action === 'start') return startQuiz();
  const id = quiz.ids[quiz.i], q = qById[id];
  if (action === 'submit'){
    if (quiz.selected === null || id in quiz.results) return;
    quiz.picks[id] = quiz.selected;
    quiz.results[id] = quiz.selected === q.answer;
    renderQuiz();
    $('#q-feedback')?.focus();
  } else if (action === 'next'){
    quiz.i++;
    quiz.selected = null;
    if (quiz.i >= 5){ quiz.status = 'done'; stamp('quiz'); }
    renderQuiz();
    $('#q-title')?.focus();
  } else if (action === 'history'){
    goHistory(q.eventId);
  }
}

/* 回看歷史：球場切到事件年份、解除會遮住它的篩選、展開球票 */
function goHistory(eventId){
  const e = byEvent[eventId];
  if (state.league !== 'all' && !e.leagueIds.includes(state.league)) state.league = 'all';
  if (state.category !== 'all' && state.category !== e.category) state.category = 'all';
  state.year = e.year;
  openExhibit('theater');
  setYear(e.year);
  const btn = $('#return-quiz');
  btn.hidden = false;
  btn.textContent = quiz.status === 'done' ? '↩ 回到挑戰賽成績' : `↩ 回到挑戰賽（第 ${quiz.i + 1} 局）`;
  const ticket = $('#ticket-' + eventId);
  ticket.scrollIntoView({behavior:'auto', block:'center'});
  openEvent(eventId, ticket);
}

function returnToQuiz(){
  if (sheet.open) sheet.close();
  $('#return-quiz').hidden = true;
  openExhibit('quiz');
  later(() => ($('#q-feedback') || $('#q-title') || $('#quiz')).focus(), 100);
}

/* ---------- 9. 出處 ---------- */
function renderSources(){
  $('#checked-date').textContent = CHECKED;
  $('#footer-date').textContent = CHECKED;
  $('#source-list').innerHTML = Object.values(sources).map(s =>
    `<div class="src"><span class="org">${esc(s.org)}</span><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)}</a></div>`).join('') +
    `<div class="src"><span class="org">Wikimedia Commons</span><span>照片：總統府 Flickr，CC BY 2.0（詳見各張圖說）</span></div>`;
}

/* ---------- 10. 啟動與事件綁定 ---------- */
function scrollToEl(el, focusEl){
  el.scrollIntoView({behavior:smooth(), block:'start'});
  if (focusEl) later(() => focusEl.focus({preventScroll:true}), 600);
}

function bind(){
  // 動畫展櫃的播放控制
  panel().addEventListener('click', eraControl);
  $('.park-notes').addEventListener('click', eraControl);

  // 球場上的旗子、看台、記分板、冠軍看板
  $('#park-overlay').addEventListener('click', e => {
    const b = e.target.closest('.banner');
    if (!b || b.disabled) return;
    openTeam(b.dataset.stage, b);
  });
  const hotspot = (sel, fn) => {
    const el = $(sel);
    el.addEventListener('click', fn);
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); fn(); } });
  };
  hotspot('#stands', () => {
    const rec = recordByYear[state.year];
    toast(rec ? `${state.year} 年：平均每場 ${fmt(rec.average)} 人，全年 ${fmt(rec.attendance)} 人次` : `${state.year} 年球季進行中，觀眾數未收錄`, 3200);
  });
  hotspot('#scoreboard', () => { if ($('#ex-body').contains($('.tickets-area'))) scrollToEl($('.tickets-area'), $('#tickets button')); else toast('到「時光劇場」可以看這一年的歷史球票。', 3000); });
  hotspot('#plaque', () => { const rec = recordByYear[state.year]; if (rec) openTeam(rec.championId, $('#plaque')); else toast('2026 球季進行中，本站不預測冠軍。'); });

  // 年份控制台（自由探索）
  $('#year-range').addEventListener('input', e => { stopAutoplay(); setYear(+e.target.value); });
  $('#prev-year').addEventListener('click', () => { stopAutoplay(); setYear(state.year - 1); });
  $('#next-year').addEventListener('click', () => { stopAutoplay(); setYear(state.year + 1); });
  $('#decade-chips').addEventListener('click', e => { const b = e.target.closest('[data-decade]'); if (b){ stopAutoplay(); setYear(Math.max(MIN_YEAR, +b.dataset.decade)); } });
  $('#league-chips').addEventListener('click', e => { const b = e.target.closest('[data-league]'); if (b){ state.league = b.dataset.league; setYear(state.year); } });
  $('#autoplay').addEventListener('click', toggleAutoplay);
  $('#category-chips').addEventListener('click', e => { const b = e.target.closest('[data-category]'); if (b){ state.category = b.dataset.category; renderMachine(); } });
  $('#tickets').addEventListener('click', e => {
    if (e.target.closest('[data-clear-filters]')){ state.league = 'all'; state.category = 'all'; setYear(state.year); $('#tickets button')?.focus(); }
  });

  $('#team-search').addEventListener('input', e => filterIndex(e.target.value.trim()));
  $('#lineage-chart').addEventListener('keydown', e => {
    const seg = e.target.closest('.seg');
    if (seg && (e.key === 'Enter' || e.key === ' ')){ e.preventDefault(); openTeam(seg.dataset.stage, seg); }
  });

  // 全站共用：球票、球隊、照片、跳年份
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-event],[data-stage],[data-goyear],[data-photo]');
    if (!t || t.closest('#park-overlay') || t.classList.contains('token')) return;
    if (t.dataset.photo){ if (!t.closest('#sheet')) openPhoto(t.dataset.photo, t); return; }
    if (t.dataset.event) return openEvent(t.dataset.event, t);
    if (t.dataset.stage) return openTeam(t.dataset.stage, t);
    if (t.dataset.goyear){
      if (sheet.open){ sheetTrigger = null; sheet.close(); }
      setYear(+t.dataset.goyear);
      if (!('stay' in t.dataset)){ openExhibit('theater'); later(() => $('#year-range').focus(), 50); }
      else $('#tickets button')?.focus();
    }
  });
  document.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches?.('img[data-photo]')){ e.preventDefault(); if (!e.target.closest('#sheet')) openPhoto(e.target.dataset.photo, e.target); }
  });

  const quizBox = $('#quiz');
  quizBox.addEventListener('click', e => { const b = e.target.closest('[data-quiz]'); if (b) quizAction(b.dataset.quiz); });
  quizBox.addEventListener('change', e => {
    if (e.target.name !== 'q-opt') return;
    quiz.selected = +e.target.value;
    const submit = $('[data-quiz="submit"]', quizBox);
    if (submit) submit.disabled = false;
    const hint = $('#q-hint');
    if (hint) hint.textContent = '確定了嗎？';
  });
  $('#return-quiz').addEventListener('click', returnToQuiz);
}

