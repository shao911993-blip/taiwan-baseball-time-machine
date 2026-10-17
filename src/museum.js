/* ============================================================
   臺灣職棒博物館：可以走動的館內地圖
   地圖以格子（1 格 = 32 px）繪製；靜態部分先畫到離屏 canvas，每格畫面只疊上人物與提示。
   ============================================================ */
const T = 32, MW = 56, MH = 38, SS = 2;
const ROOMS = [
  {id:'team', name:'隊史廳', x:1, y:1, w:26, h:13, floor:'wood'},
  {id:'field', name:'球場體驗館', x:28, y:1, w:27, h:13, floor:'grass'},
  {id:'hall', name:'歷史長廊', x:1, y:15, w:54, h:8, floor:'hall'},
  {id:'theater', name:'時光劇場', x:1, y:24, w:17, h:13, floor:'theater'},
  {id:'lobby', name:'入口大廳', x:19, y:24, w:18, h:13, floor:'marble'},
  {id:'archive', name:'資料室', x:38, y:24, w:17, h:13, floor:'archive'}
];
const DOORS = [[12,14],[13,14],[40,14],[41,14],[8,23],[9,23],[27,23],[28,23],[46,23],[47,23],[27,6],[27,7],[18,29],[18,30],[37,29],[37,30]];
const ERA_X = [3, 8, 16, 21, 26, 31, 36, 44, 49];
const ERA_ICON = ['🎟️','🚩','⛈️','❄️','🤝','💥','📣','👕','🏟️'];

/* 展品：位置（格）、是否擋路、對應的展品視窗 */
const OBJECTS = [
  ...innings.map((inn, i) => ({id:'era-' + inn.n, kind:'case', x:ERA_X[i], y:15, w:2, h:1.5, label:`第${ZH[inn.n]}局`, sub:inn.years.split('–')[0], icon:ERA_ICON[i], name:`第${ZH[inn.n]}局展櫃：${inn.title}（${inn.years}）`})),
  {id:'theater', kind:'model', x:5, y:28, w:8, h:4, label:'球場模型', sub:'時光劇場', name:'時光劇場：會隨年份改變的球場模型'},
  {id:'guide', kind:'desk', x:24, y:27, w:8, h:1.2, label:'服務台', sub:'館長', name:'服務台：館長與集章護照'},
  {id:'map', kind:'kiosk', x:33.4, y:31.6, w:1.4, h:1.4, label:'館內地圖', name:'館內地圖看板'},
  {id:'sources', kind:'shelf', x:39, y:24, w:15, h:1.4, label:'資料室書架', name:'資料室：所有故事的出處'},
  {id:'quiz', kind:'desk', x:43, y:29, w:6, h:1.2, label:'問答館長', sub:'五局挑戰', name:'問答館長：五局歷史挑戰'},
  {id:'lineage', kind:'table', x:8, y:6, w:10, h:3, label:'球隊族譜大桌', name:'球隊族譜：37 個隊名的身世'},
  {id:'trophies', kind:'cabinet', x:2, y:3, w:1.6, h:8, label:'冠軍獎盃牆', name:'冠軍獎盃牆：1990–2025 年度總冠軍'},
  {id:'bat', kind:'cage', x:29, y:1.6, w:4, h:3.4, label:'打擊練習', name:'球場體驗館：打擊練習'},
  {id:'pitch', kind:'mound', x:40.3, y:7.1, w:1.4, h:1, label:'投手丘', sub:'投球挑戰', name:'球場體驗館：投球挑戰'},
  {id:'ump', kind:'plate', x:40.1, y:11.1, w:1.8, h:1, label:'本壘', sub:'主審體驗', name:'球場體驗館：主審體驗'},
  {id:'line', kind:'pole', x:52.4, y:1.4, w:1, h:1.6, label:'界外標竿', sub:'線審體驗', name:'球場體驗館：線審體驗'},
  {id:'base', kind:'bag', x:46.6, y:8.4, w:1, h:1, label:'一壘', sub:'壘審體驗', name:'球場體驗館：壘審體驗'},
  // 裝飾（擋路但不能互動）
  {kind:'bench', x:5, y:21.3, w:2.4, h:.6}, {kind:'bench', x:23, y:21.3, w:2.4, h:.6}, {kind:'bench', x:33, y:21.3, w:2.4, h:.6}, {kind:'bench', x:51, y:21.3, w:2.4, h:.6},
  {kind:'seats', x:3, y:33.4, w:5.5, h:.7}, {kind:'seats', x:9.5, y:33.4, w:5.5, h:.7}, {kind:'seats', x:3, y:35, w:5.5, h:.7}, {kind:'seats', x:9.5, y:35, w:5.5, h:.7},
  {kind:'readtable', x:40, y:33, w:3, h:1.4}, {kind:'readtable', x:50, y:33, w:3, h:1.4},
  {kind:'plant', x:1.2, y:15.2, w:.8, h:.8}, {kind:'plant', x:54, y:15.2, w:.8, h:.8}, {kind:'plant', x:19.2, y:35.6, w:.8, h:.8}, {kind:'plant', x:35, y:35.6, w:.8, h:.8},
  {kind:'plant', x:25.2, y:12.2, w:.8, h:.8}, {kind:'plant', x:16.2, y:35.6, w:.8, h:.8}, {kind:'plant', x:53.8, y:35.6, w:.8, h:.8}
];
const exhibitObjs = OBJECTS.filter(o => o.id);
const objById = Object.fromEntries(exhibitObjs.map(o => [o.id, o]));

const STAMPS = [
  ...innings.map((inn, i) => ({id:'era-' + inn.n, label:`${inn.years.split('–')[0]} ${inn.title}`, icon:ERA_ICON[i]})),
  {id:'theater', label:'時光劇場', icon:'🎬'}, {id:'lineage', label:'球隊族譜', icon:'🌳'}, {id:'trophies', label:'冠軍獎盃牆', icon:'🏆'},
  {id:'bat', label:'打擊', icon:'⚾'}, {id:'pitch', label:'投球', icon:'🎯'}, {id:'ump', label:'主審', icon:'🧑‍⚖️'}, {id:'line', label:'線審', icon:'📏'}, {id:'base', label:'壘審', icon:'🏃'},
  {id:'quiz', label:'問答館長', icon:'❓'}, {id:'sources', label:'資料室', icon:'📚'}
];
const stamps = new Set();
const JERSEYS = [['#f6efe0','米白'],['#1f4d3a','墨綠'],['#b2432f','磚紅'],['#2f5f95','海藍'],['#c9982a','金黃'],['#2a2a2a','碳黑']];
// 歷代球隊色：顏色取自球隊資料（與族譜、旗幟同一套代表色），依加入年份排列；同一色系的隊名合併成一格。
const TEAM_JERSEYS = [
  ['elephants','兄弟'],['lions','統一獅'],['dragons-old','味全龍'],['tigers','三商虎'],['eagles','時報鷹'],['bears','俊國熊'],
  ['bulls','興農牛'],['whalex','鯨隊'],['sun-sampo','臺北太陽'],['kong97','臺中金剛'],['warrior97','嘉南勇士'],['thunder97','高屏雷公'],
  ['first','第一金剛'],['naluwan','那魯灣／誠泰太陽'],['lanew','La New熊'],['cobras','誠泰COBRAS'],['dmedia','米迪亞暴龍'],
  ['lamigo','Lamigo桃猿'],['rhinos','義大犀牛'],['guardians','富邦悍將'],['rakuten','樂天桃猿'],['tsg','台鋼雄鷹']
].map(([id, n]) => [byStage[id].color, n, byStage[id]]);
const swatchBtn = ([c, n, st]) => `<button type="button" class="swatch${st ? ' team' : ''}" role="radio" aria-checked="${world.player.jersey === n}" data-jersey="${esc(n)}" data-color="${c}" style="--c:${c}"${st ? ` title="${esc(n)}（${st.league === 'tml' ? '台灣大聯盟' : '中職'}）"` : ''}><i></i>${esc(n)}</button>`;
const jerseyPicker = () => `<p class="swatch-group">基本色</p><div class="swatches" role="radiogroup" aria-label="基本色球衣">${JERSEYS.map(swatchBtn).join('')}</div>
  <p class="swatch-group">歷代球隊色 <small>中職與台灣大聯盟 ${TEAM_JERSEYS.length} 色，依加入年份</small></p><div class="swatches team-swatches" role="radiogroup" aria-label="歷代球隊色球衣">${TEAM_JERSEYS.map(swatchBtn).join('')}</div>`;
const FACTS = [
  '1990 年開幕戰，臺北市立棒球場湧進了 1 萬 4350 人。',
  '1997 年，臺灣同時有兩個職棒聯盟，一共 11 支球隊。',
  '1996 年，同一支球隊在季中從「興農熊」改名「興農牛」。',
  '名字會騙人：「第一金剛」的前身是臺北太陽和高屏雷公。',
  '2000 年是中職觀眾最少的一年，平均每場不到 1,700 人。',
  '2013 年經典賽之後，中職全年進場人數一口氣翻倍。',
  '台鋼雄鷹 2022 年加盟，2024 年才第一次打一軍。',
  '2025 年，中職全年進場突破 373 萬人次。',
  '線審小知識：界線本身算界內喔！',
  '主審小知識：球只要擦到好球帶的一點點，就是好球。',
  '統一獅是唯一從元年到現在沒換過經營者的球隊。',
  '1999 年味全龍三連霸後解散，2021 年才回到一軍。'
];

const world = {player:{x:28, y:34.2, dir:'up', moving:false, step:0, color:'#f6efe0', jersey:'米白'}, keys:{}, path:[], pending:null, near:null, room:null, zoom:1.6, cam:{x:0, y:0}, npcs:[], grid:[], blocked:[], last:0, paused:true};

/* ---------- 地圖格子 ---------- */
function buildGrid(){
  world.grid = Array.from({length:MH}, () => Array(MW).fill(null));
  ROOMS.forEach(r => { for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) world.grid[y][x] = r.floor; });
  DOORS.forEach(([x, y]) => { world.grid[y][x] = 'door'; });
  // 尋路用：牆或被展品覆蓋的格子不能走
  world.blocked = Array.from({length:MH}, (_, y) => Array.from({length:MW}, (_, x) => !world.grid[y][x] || OBJECTS.some(o => x + .5 > o.x - .25 && x + .5 < o.x + o.w + .25 && y + .5 > o.y - .25 && y + .5 < o.y + o.h + .25)));
}
const isWall = (x, y) => { const tx = Math.floor(x), ty = Math.floor(y); return tx < 0 || ty < 0 || tx >= MW || ty >= MH || !world.grid[ty][tx]; };
const inObj = (x, y) => OBJECTS.some(o => x > o.x && x < o.x + o.w && y > o.y && y < o.y + o.h);
const solidAt = (x, y) => isWall(x, y) || inObj(x, y);
const boxFree = (x, y) => [[-.3, -.32], [.3, -.32], [-.3, 0], [.3, 0]].every(([dx, dy]) => !solidAt(x + dx, y + dy));
const roomAt = (x, y) => ROOMS.find(r => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h);

function rectDist(o, x, y){
  const dx = Math.max(o.x - x, 0, x - (o.x + o.w)), dy = Math.max(o.y - y, 0, y - (o.y + o.h));
  return Math.hypot(dx, dy);
}
/* 站在展品旁邊的哪一點：挑能走、且離玩家最近的一側 */
function approachPoint(o){
  const cx = o.x + o.w / 2, cy = o.y + o.h / 2;
  const cands = [[cx, o.y + o.h + .6], [cx, o.y - .2], [o.x - .55, cy + .3], [o.x + o.w + .55, cy + .3]].filter(([x, y]) => boxFree(x, y));
  const p = world.player;
  cands.sort((a, b) => Math.hypot(a[0] - p.x, a[1] - p.y) - Math.hypot(b[0] - p.x, b[1] - p.y));
  return cands[0] || [cx, o.y + o.h + .6];
}

/* BFS 尋路（可斜走，但不切牆角） */
function findPath(tx, ty){
  const p = world.player, sx = Math.floor(p.x), sy = Math.floor(p.y - .1);
  const ex = Math.floor(tx), ey = Math.floor(ty);
  if (ex < 0 || ey < 0 || ex >= MW || ey >= MH) return [];
  const key = (x, y) => y * MW + x, prev = new Map([[key(sx, sy), -1]]), q = [[sx, sy]];
  const free = (x, y) => x >= 0 && y >= 0 && x < MW && y < MH && !world.blocked[y][x];
  while (q.length){
    const [x, y] = q.shift();
    if (x === ex && y === ey) break;
    for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){
      const nx = x + dx, ny = y + dy, k = key(nx, ny);
      if (prev.has(k) || !free(nx, ny)) continue;
      if (dx && dy && (!free(x + dx, y) || !free(x, y + dy))) continue;
      prev.set(k, key(x, y)); q.push([nx, ny]);
    }
  }
  if (!prev.has(key(ex, ey))) return [];
  const path = [];
  for (let k = key(ex, ey); k !== -1 && k !== key(sx, sy); k = prev.get(k)) path.unshift([k % MW + .5, Math.floor(k / MW) + .7]);
  if (path.length) path[path.length - 1] = [tx, ty];
  else path.push([tx, ty]);
  return path;
}

/* ---------- 靜態地圖（只畫一次） ---------- */
let staticCanvas;
function drawStatic(){
  staticCanvas = document.createElement('canvas');
  staticCanvas.width = MW * T * SS; staticCanvas.height = MH * T * SS;
  const c = staticCanvas.getContext('2d');
  c.scale(SS, SS);
  c.fillStyle = '#0c1a15'; c.fillRect(0, 0, MW * T, MH * T);
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++){
    const f = world.grid[y][x], px = x * T, py = y * T;
    if (!f){
      const front = y + 1 < MH && world.grid[y + 1][x];
      c.fillStyle = '#13291f'; c.fillRect(px, py, T, T);
      if (front){ c.fillStyle = '#24543f'; c.fillRect(px, py + T * .35, T, T * .65); c.fillStyle = '#c9982a'; c.fillRect(px, py + T * .35, T, 2); c.fillStyle = '#173a2c'; c.fillRect(px, py + T - 4, T, 4); }
      continue;
    }
    if (f === 'wood' || f === 'hall' || f === 'archive' || f === 'door'){
      c.fillStyle = f === 'archive' ? '#a0723f' : f === 'door' ? '#7a5a3a' : '#b98a55'; c.fillRect(px, py, T, T);
      c.fillStyle = 'rgba(0,0,0,.08)';
      for (let i = 0; i < 4; i++){ c.fillRect(px, py + i * 8, T, 1); c.fillRect(px + ((x * 7 + i * 13) % T), py + i * 8, 1, 8); }
    } else if (f === 'marble'){
      c.fillStyle = (x + y) % 2 ? '#e8ddc4' : '#f2ead8'; c.fillRect(px, py, T, T);
      c.strokeStyle = 'rgba(160,140,110,.18)'; c.beginPath(); c.moveTo(px, py + T); c.lineTo(px + T, py); c.stroke();
    } else if (f === 'grass'){
      c.fillStyle = x % 4 < 2 ? '#3d8a57' : '#367f4f'; c.fillRect(px, py, T, T);
    } else if (f === 'theater'){
      c.fillStyle = '#2b3350'; c.fillRect(px, py, T, T);
      c.fillStyle = 'rgba(243,201,105,.12)'; c.fillRect(px + 8, py + 8, 3, 3); c.fillRect(px + 24, py + 22, 3, 3);
    }
  }
  // 歷史長廊：紅地毯與時間軸
  c.fillStyle = '#8f2f25'; c.fillRect(1 * T, 17.4 * T, 54 * T, 3.2 * T);
  c.fillStyle = '#c9982a'; c.fillRect(1 * T, 17.4 * T, 54 * T, 3); c.fillRect(1 * T, 20.6 * T - 3, 54 * T, 3);
  c.fillStyle = '#f3c969'; c.fillRect(2 * T, 19 * T, 52 * T, 3);
  ERA_X.forEach((x, i) => {
    const cx = (x + 1) * T;
    c.fillStyle = '#f3c969'; c.beginPath(); c.arc(cx, 19 * T + 1.5, 6, 0, 7); c.fill();
    c.fillStyle = '#f6efe0'; c.font = '700 12px "Bahnschrift", sans-serif'; c.textAlign = 'center';
    c.fillText(innings[i].years.split('–')[0], cx, 20.1 * T);
  });
  // 地板標語
  const floorText = (text, x, y, size, color) => { c.font = `700 ${size}px "Noto Serif TC", "Songti TC", "PMingLiU", serif`; c.fillStyle = color; c.textAlign = 'center'; c.fillText(text, x * T, y * T); };
  floorText('臺灣職棒時光機', 28, 30.6, 26, 'rgba(31,77,58,.55)');
  floorText('博 物 館', 28, 31.6, 16, 'rgba(31,77,58,.45)');
  c.strokeStyle = 'rgba(178,67,47,.35)'; c.lineWidth = 3; c.beginPath(); c.arc(28 * T, 30.9 * T, 64, 0, 7); c.stroke();
  c.fillStyle = '#7a3324'; c.fillRect(25.5 * T, 35.6 * T, 5 * T, 1.2 * T);
  c.fillStyle = '#f3c969'; c.font = '700 13px sans-serif'; c.fillText('入口 ENTRANCE', 28 * T, 36.35 * T);
  ROOMS.forEach(r => { c.font = '700 15px "Noto Sans TC", sans-serif'; c.fillStyle = r.floor === 'grass' || r.floor === 'theater' ? 'rgba(246,239,224,.35)' : 'rgba(29,40,35,.35)'; c.textAlign = 'left'; c.fillText(r.name, (r.x + .4) * T, (r.y + r.h - .4) * T); });
  // 球場體驗館：內野、壘包、界外線、全壘打牆警戒區
  c.fillStyle = '#9c6a43'; c.fillRect(28 * T, 1 * T, 27 * T, .5 * T);
  const P = (x, y) => [x * T, y * T];
  c.fillStyle = '#a8693f'; c.beginPath(); c.moveTo(...P(41, 13.2)); c.lineTo(...P(47.6, 7.8)); c.quadraticCurveTo(...P(41, -.2), ...P(34.4, 7.8)); c.closePath(); c.fill();
  c.fillStyle = '#2f7a4c'; c.beginPath(); c.moveTo(...P(41, 11.6)); c.lineTo(...P(45.4, 7.8)); c.lineTo(...P(41, 4)); c.lineTo(...P(36.6, 7.8)); c.closePath(); c.fill();
  c.strokeStyle = '#f6efe0'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(...P(41, 12.4)); c.lineTo(...P(53.4, 1.5)); c.moveTo(...P(41, 12.4)); c.lineTo(...P(28.6, 1.5)); c.stroke();
  [[41, 3.4], [36.2, 7.8]].forEach(([x, y]) => { c.fillStyle = '#f6efe0'; c.fillRect(x * T - 6, y * T - 6, 12, 12); });
  // 隊史廳：牆上的 37 面隊旗
  teamStages.forEach((st, i) => {
    const x = (1.3 + i * .68) * T, y = 1 * T;
    c.fillStyle = st.color; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 18, y); c.lineTo(x + 18, y + 22); c.lineTo(x + 9, y + 17); c.lineTo(x, y + 22); c.closePath(); c.fill();
    if (st.league === 'tml'){ c.strokeStyle = 'rgba(255,255,255,.4)'; c.lineWidth = 1; for (let k = 0; k < 4; k++){ c.beginPath(); c.moveTo(x + k * 5, y); c.lineTo(x + k * 5 - 6, y + 12); c.stroke(); } }
  });
  // 劇場螢幕
  c.fillStyle = '#0b1915'; c.fillRect(4 * T, 23.4 * T, 10 * T, .6 * T); c.fillStyle = '#f3c969'; c.font = '700 12px sans-serif'; c.textAlign = 'center'; c.fillText('1990 ── 2026', 9 * T, 23.85 * T);
  // 物件
  OBJECTS.forEach(o => drawObject(c, o));
}

function drawObject(c, o){
  const x = o.x * T, y = o.y * T, w = o.w * T, h = o.h * T;
  const label = (text, sub, dy = 0) => {
    c.textAlign = 'center';
    c.font = '700 12px "Noto Sans TC", sans-serif';
    const tw = Math.max(c.measureText(text).width, sub ? c.measureText(sub).width : 0) + 12;
    const ly = y + h + 8 + dy;
    c.fillStyle = 'rgba(12,26,21,.82)'; c.beginPath(); c.roundRect(x + w / 2 - tw / 2, ly, tw, sub ? 32 : 18, 4); c.fill();
    c.fillStyle = '#f3c969'; c.fillText(text, x + w / 2, ly + 13);
    if (sub){ c.fillStyle = '#f6efe0'; c.font = '600 11px "Noto Sans TC", sans-serif'; c.fillText(sub, x + w / 2, ly + 27); }
  };
  switch (o.kind){
    case 'case':
      c.fillStyle = '#6b4a2a'; c.fillRect(x, y + h * .55, w, h * .45);
      c.fillStyle = 'rgba(190,225,235,.35)'; c.fillRect(x + 3, y, w - 6, h * .6);
      c.strokeStyle = '#c9982a'; c.lineWidth = 2; c.strokeRect(x + 3, y, w - 6, h * .6);
      c.font = '26px "Segoe UI Emoji", "Apple Color Emoji", sans-serif'; c.textAlign = 'center'; c.fillText(o.icon, x + w / 2, y + h * .5);
      label(o.label, o.sub, 4);
      break;
    case 'model':
      c.fillStyle = '#4a3220'; c.beginPath(); c.roundRect(x, y, w, h, 8); c.fill();
      c.fillStyle = '#2c7650'; c.beginPath(); c.moveTo(x + w / 2, y + h - 10); c.arc(x + w / 2, y + h - 10, h - 22, Math.PI * 1.2, Math.PI * 1.8); c.closePath(); c.fill();
      c.fillStyle = '#13291f'; c.beginPath(); c.arc(x + w / 2, y + h - 10, h - 14, Math.PI * 1.2, Math.PI * 1.8); c.arc(x + w / 2, y + h - 10, h - 22, Math.PI * 1.8, Math.PI * 1.2, true); c.fill();
      for (let i = 0; i < 40; i++){ const a = Math.PI * (1.22 + i * .0145), r = h - 18; c.fillStyle = ['#e3b341','#d1553b','#4f8fd1','#f6efe0'][i % 4]; c.fillRect(x + w / 2 + Math.cos(a) * r, y + h - 10 + Math.sin(a) * r, 3, 3); }
      c.fillStyle = '#a8693f'; c.beginPath(); c.moveTo(x + w / 2, y + h - 8); c.lineTo(x + w / 2 + 22, y + h - 30); c.lineTo(x + w / 2, y + h - 52); c.lineTo(x + w / 2 - 22, y + h - 30); c.closePath(); c.fill();
      label(o.label, o.sub);
      break;
    case 'desk':
      c.fillStyle = '#6b4a2a'; c.beginPath(); c.roundRect(x, y, w, h, 6); c.fill();
      c.fillStyle = '#8a6438'; c.fillRect(x + 4, y + 4, w - 8, h * .4);
      label(o.label, o.sub);
      break;
    case 'kiosk':
      c.fillStyle = '#1f4d3a'; c.fillRect(x, y, w, h); c.fillStyle = '#f6efe0'; c.fillRect(x + 6, y + 6, w - 12, h - 18);
      c.fillStyle = '#b2432f'; c.fillRect(x + 10, y + 12, 8, 6); c.fillRect(x + 22, y + 20, 10, 6);
      label(o.label);
      break;
    case 'shelf':
      c.fillStyle = '#5a3c22'; c.fillRect(x, y, w, h);
      for (let i = 0; i < o.w * 4; i++){ c.fillStyle = ['#b2432f','#1f4d3a','#c9982a','#2f5f95','#e8dcc0'][i % 5]; c.fillRect(x + 4 + i * 7.8, y + 6, 6, h * .45 + (i % 3) * 3); }
      label(o.label);
      break;
    case 'table':
      c.fillStyle = '#5a3c22'; c.beginPath(); c.roundRect(x, y, w, h, 6); c.fill();
      c.fillStyle = '#f6efe0'; c.fillRect(x + 8, y + 8, w - 16, h - 16);
      lanes.forEach((ln, i) => ln.ids.forEach(id => { const st = byStage[id], [s, e] = spanOf(st); c.fillStyle = st.color; c.fillRect(x + 12 + (s - 1990) / 37 * (w - 24), y + 12 + i * 6, Math.max(2, (e - s) / 37 * (w - 24) - 1), 4); }));
      label(o.label);
      break;
    case 'cabinet':
      c.fillStyle = '#4a3220'; c.fillRect(x, y, w, h);
      c.fillStyle = 'rgba(190,225,235,.3)'; c.fillRect(x + 4, y + 4, w - 8, h - 8);
      for (let i = 0; i < 9; i++){ c.fillStyle = '#f3c969'; c.beginPath(); c.moveTo(x + 14, y + 16 + i * 27); c.lineTo(x + 36, y + 16 + i * 27); c.lineTo(x + 30, y + 30 + i * 27); c.lineTo(x + 20, y + 30 + i * 27); c.closePath(); c.fill(); }
      c.save(); c.translate(x + w + 16, y + h / 2); c.fillStyle = 'rgba(12,26,21,.82)'; c.beginPath(); c.roundRect(-10, -50, 20, 100, 4); c.fill(); c.fillStyle = '#f3c969'; c.font = '700 12px sans-serif'; c.textAlign = 'center'; [...'冠軍獎盃牆'].forEach((ch, i) => c.fillText(ch, 0, -32 + i * 17)); c.restore();
      break;
    case 'cage':
      c.fillStyle = '#c9a66b'; c.fillRect(x, y, w, h);
      c.strokeStyle = 'rgba(20,20,20,.45)'; c.lineWidth = 1;
      for (let i = 0; i <= w; i += 8){ c.beginPath(); c.moveTo(x + i, y); c.lineTo(x + i, y + h); c.stroke(); }
      for (let j = 0; j <= h; j += 8){ c.beginPath(); c.moveTo(x, y + j); c.lineTo(x + w, y + j); c.stroke(); }
      c.strokeStyle = '#2a2a2a'; c.lineWidth = 3; c.strokeRect(x, y, w, h);
      c.fillStyle = '#f6efe0'; c.fillRect(x + w / 2 - 6, y + h - 16, 12, 10);
      label(o.label);
      break;
    case 'mound':
      c.fillStyle = '#b9784b'; c.beginPath(); c.ellipse(x + w / 2, y + h / 2, w / 2 + 4, h / 2 + 4, 0, 0, 7); c.fill();
      c.fillStyle = '#f6efe0'; c.fillRect(x + w / 2 - 8, y + h / 2 - 2, 16, 4);
      label(o.label, o.sub);
      break;
    case 'plate':
      c.fillStyle = '#a8693f'; c.beginPath(); c.ellipse(x + w / 2, y + h / 2, w / 2 + 6, h / 2 + 6, 0, 0, 7); c.fill();
      c.fillStyle = '#f6efe0'; c.beginPath(); c.moveTo(x + w / 2 - 9, y + h / 2 - 6); c.lineTo(x + w / 2 + 9, y + h / 2 - 6); c.lineTo(x + w / 2 + 9, y + h / 2 + 2); c.lineTo(x + w / 2, y + h / 2 + 8); c.lineTo(x + w / 2 - 9, y + h / 2 + 2); c.closePath(); c.fill();
      label(o.label, o.sub, -2);
      break;
    case 'pole':
      c.fillStyle = '#f3c969'; c.fillRect(x + w / 2 - 3, y - 6, 6, h + 6);
      c.fillStyle = 'rgba(243,201,105,.5)'; c.fillRect(x + w / 2 + 3, y, 8, h * .6);
      label(o.label, o.sub);
      break;
    case 'bag':
      c.fillStyle = '#f6efe0'; c.save(); c.translate(x + w / 2, y + h / 2); c.rotate(Math.PI / 4); c.fillRect(-9, -9, 18, 18); c.restore();
      label(o.label, o.sub);
      break;
    case 'bench':
      c.fillStyle = '#6b4a2a'; c.fillRect(x, y, w, h); c.fillStyle = '#8a6438'; c.fillRect(x, y, w, h * .5);
      break;
    case 'seats':
      for (let i = 0; i < o.w * 2; i++){ c.fillStyle = '#9b2f2f'; c.beginPath(); c.roundRect(x + i * 16 + 1, y, 14, h, 3); c.fill(); }
      break;
    case 'readtable':
      c.fillStyle = '#6b4a2a'; c.beginPath(); c.roundRect(x, y, w, h, 6); c.fill(); c.fillStyle = '#f6efe0'; c.fillRect(x + 14, y + 10, 18, 14); c.fillRect(x + 56, y + 14, 16, 12);
      break;
    case 'plant':
      c.fillStyle = '#7a4a22'; c.fillRect(x + 6, y + 14, 14, 12);
      c.fillStyle = '#2f7a4c'; c.beginPath(); c.arc(x + 13, y + 10, 12, 0, 7); c.fill(); c.fillStyle = '#3d9a60'; c.beginPath(); c.arc(x + 9, y + 7, 7, 0, 7); c.fill();
      break;
  }
}

/* ---------- 人物 ---------- */
function drawPerson(c, px, py, o){
  // px, py：腳底中心（世界座標 px）
  const {color = '#f6efe0', cap = '#1f4d3a', dir = 'down', step = 0, moving = false, skin = '#e0b48a', num = ''} = o;
  const bob = moving ? Math.abs(Math.sin(step * 2)) * 1.5 : 0;
  const leg = moving ? Math.sin(step * 2) * 4 : 0;
  c.fillStyle = 'rgba(0,0,0,.28)'; c.beginPath(); c.ellipse(px, py, 10, 4, 0, 0, 7); c.fill();
  c.fillStyle = '#2b2b2b'; c.fillRect(px - 6, py - 10 + Math.max(0, leg) * .5, 5, 10 - Math.max(0, leg) * .5); c.fillRect(px + 1, py - 10 + Math.max(0, -leg) * .5, 5, 10 - Math.max(0, -leg) * .5);
  const by = py - 10 - bob;
  c.fillStyle = color; c.beginPath(); c.roundRect(px - 9, by - 15, 18, 16, 5); c.fill();
  c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 1; c.stroke();
  if (num && dir === 'up'){ c.fillStyle = color === '#f6efe0' || color === '#c9982a' ? '#1f4d3a' : '#f6efe0'; c.font = '700 9px sans-serif'; c.textAlign = 'center'; c.fillText(num, px, by - 4); }
  c.fillStyle = skin;
  const armSwing = moving ? Math.sin(step * 2) * 3 : 0;
  c.fillRect(px - 12, by - 13 + armSwing, 4, 10); c.fillRect(px + 8, by - 13 - armSwing, 4, 10);
  c.beginPath(); c.arc(px, by - 22, 8, 0, 7); c.fill();
  c.fillStyle = cap; c.beginPath(); c.arc(px, by - 24, 8.5, Math.PI, 0); c.fill();
  const brim = dir === 'left' ? [-14, -3] : dir === 'right' ? [3, 14] : dir === 'up' ? null : [-7, 7];
  if (brim){ c.fillRect(px + brim[0], by - 25, brim[1] - brim[0], 3); }
  if (dir !== 'up'){
    c.fillStyle = '#1d2823';
    const ex = dir === 'left' ? -3 : dir === 'right' ? 3 : 0;
    c.fillRect(px - 3.5 + ex, by - 22, 2, 2.5); c.fillRect(px + 1.5 + ex, by - 22, 2, 2.5);
  }
}

function makeNPCs(){
  const colors = [['#c0392b','#1d2823'],['#2f5f95','#f6efe0'],['#e3b341','#1d2823'],['#2c7a62','#f6efe0'],['#7a4f8f','#f6efe0'],['#d0672a','#1d2823'],['#f6efe0','#b2432f'],['#38424f','#c9982a']];
  const homes = ['lobby','hall','hall','team','field','theater','archive','hall'];
  world.npcs = homes.map((room, i) => {
    const r = ROOMS.find(x => x.id === room);
    let x, y;
    do { x = r.x + 1 + Math.random() * (r.w - 2); y = r.y + 1.5 + Math.random() * (r.h - 2.5); } while (!boxFree(x, y));
    return {kind:'npc', x, y, room:r, color:colors[i][0], cap:colors[i][1], dir:'down', step:0, moving:false, target:null, wait:Math.random() * 2, fact:i % FACTS.length, talk:null, name:'參觀的球迷'};
  });
  world.staff = [
    {x:28, y:26.6, color:'#1f4d3a', cap:'#c9982a', dir:'down', obj:'guide'},
    {x:46, y:28.6, color:'#b2432f', cap:'#1f4d3a', dir:'down', obj:'quiz'}
  ];
}

function updateNPCs(dt, now){
  world.npcs.forEach(n => {
    if (n.talk && now > n.talk.until) n.talk = null;
    if (n.talk){ n.moving = false; return; }
    if (n.wait > 0){ n.wait -= dt; n.moving = false; return; }
    if (!n.target){
      const r = n.room;
      for (let k = 0; k < 10; k++){ const x = r.x + 1 + Math.random() * (r.w - 2), y = r.y + 1.5 + Math.random() * (r.h - 2.5); if (boxFree(x, y)){ n.target = [x, y]; break; } }
      if (!n.target){ n.wait = 1; return; }
    }
    const [tx, ty] = n.target, dx = tx - n.x, dy = ty - n.y, d = Math.hypot(dx, dy);
    if (d < .1){ n.target = null; n.wait = 1 + Math.random() * 3; n.moving = false; return; }
    const sp = 1.2 * dt, nx = n.x + dx / d * sp, ny = n.y + dy / d * sp;
    const p = world.player;
    if (!boxFree(nx, ny) || Math.hypot(nx - p.x, ny - p.y) < .7){ n.target = null; n.wait = .6; n.moving = false; return; }
    n.x = nx; n.y = ny; n.moving = true; n.step += dt * 5;
    n.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
  });
}

/* ---------- 玩家移動 ---------- */
function updatePlayer(dt){
  const p = world.player, k = world.keys;
  let vx = (k.right ? 1 : 0) - (k.left ? 1 : 0), vy = (k.down ? 1 : 0) - (k.up ? 1 : 0);
  if (vx || vy){ world.path = []; world.pending = null; }
  else if (world.path.length){
    const [tx, ty] = world.path[0], dx = tx - p.x, dy = ty - p.y, d = Math.hypot(dx, dy);
    if (d < .12){ world.path.shift(); if (!world.path.length) arrive(); return; }
    vx = dx / d; vy = dy / d;
  }
  if (!vx && !vy){ p.moving = false; return; }
  const len = Math.hypot(vx, vy), sp = 4.6 * dt;
  const mx = vx / len * sp, my = vy / len * sp;
  let moved = false;
  if (boxFree(p.x + mx, p.y)){ p.x += mx; moved = true; }
  if (boxFree(p.x, p.y + my)){ p.y += my; moved = true; }
  if (!moved && world.path.length){ world.path = []; arrive(); }
  p.moving = moved;
  p.step += dt * 6;
  p.dir = Math.abs(vx) > Math.abs(vy) ? (vx > 0 ? 'right' : 'left') : (vy > 0 ? 'down' : 'up');
}
function arrive(){
  const id = world.pending;
  world.pending = null;
  if (!id) return;
  const o = objById[id];
  const p = world.player;
  if (o){ if (rectDist(o, p.x, p.y) < 1.4){ p.dir = o.y + o.h / 2 < p.y ? 'up' : 'down'; interactWith(id); } }
  else { const n = world.npcs[+id.slice(4)]; if (n && Math.hypot(n.x - p.x, n.y - p.y) < 1.8) talkTo(n); }
}

function walkTo(x, y, pending = null){
  world.path = findPath(x, y);
  world.pending = pending;
  if (!world.path.length && pending) arrive();
}

/* 附近可以互動的東西 */
function nearest(){
  const p = world.player;
  let best = null, bd = 1.15;
  exhibitObjs.forEach(o => { const d = rectDist(o, p.x, p.y - .15); if (d < bd){ bd = d; best = {type:'obj', id:o.id, name:o.name}; } });
  world.npcs.forEach((n, i) => { const d = Math.hypot(n.x - p.x, n.y - p.y) - .3; if (d < bd){ bd = d; best = {type:'npc', id:'npc-' + i, name:'和參觀的球迷聊聊', npc:n}; } });
  return best;
}

function interact(){
  const n = world.near;
  if (!n) return;
  if (n.type === 'npc') talkTo(n.npc);
  else interactWith(n.id);
}
function talkTo(n){
  const p = world.player;
  n.talk = {text:FACTS[n.fact], until:performance.now() + 5200};
  n.fact = (n.fact + 3) % FACTS.length;
  n.dir = Math.abs(p.x - n.x) > Math.abs(p.y - n.y) ? (p.x > n.x ? 'right' : 'left') : (p.y > n.y ? 'down' : 'up');
  $('#near-status').textContent = '球迷說：' + n.talk.text;
}
function interactWith(id){
  if (id === 'map') return openMap();
  openExhibit(id);
}

/* ---------- 畫面 ---------- */
const wc = () => $('#world');
function resizeWorld(){
  const cv = wc(), dpr = Math.min(2, window.devicePixelRatio || 1);
  const width=cv.clientWidth,height=cv.clientHeight;if(!width||!height)return;
  const pixelWidth=Math.max(1,Math.round(width*dpr)),pixelHeight=Math.max(1,Math.round(height*dpr));
  // iOS may deliver resize before rotation has finished layout. Keep the
  // backing bitmap and CSS dimensions in sync, without resetting every frame.
  if(cv.width!==pixelWidth||cv.height!==pixelHeight){cv.width=pixelWidth;cv.height=pixelHeight;}
  world.dpr = dpr;
  world.zoom = Math.max(.8, Math.min(2.3, Math.min(width / (22 * T), height / (13 * T))));
  const mm = $('#minimap');
  const mw=Math.round(MW*3*dpr),mh=Math.round(MH*3*dpr);
  if(mm.width!==mw||mm.height!==mh){mm.width=mw;mm.height=mh;}
}

function wrapText(c, text, maxW){
  const lines = []; let line = '';
  for (const ch of text){ if (c.measureText(line + ch).width > maxW && line){ lines.push(line); line = ch; } else line += ch; }
  if (line) lines.push(line);
  return lines;
}

function render(now){
  resizeWorld();
  const cv = wc(), c = cv.getContext('2d'), dpr = world.dpr, z = world.zoom;
  const vw = cv.clientWidth, vh = cv.clientHeight, p = world.player;
  const camX = Math.max(0, Math.min(MW * T - vw / z, p.x * T - vw / z / 2));
  const camY = Math.max(0, Math.min(MH * T - vh / z, p.y * T - vh / z / 2));
  world.cam = {x:camX, y:camY};
  // Clear the entire physical bitmap, not just the latest CSS-sized portion.
  // Otherwise a late orientation resize can leave an old strip of the map.
  c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,cv.width,cv.height);
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.fillStyle = '#0c1a15'; c.fillRect(0, 0, vw, vh);
  c.imageSmoothingEnabled = true;
  c.drawImage(staticCanvas, camX * SS, camY * SS, vw / z * SS, vh / z * SS, 0, 0, vw, vh);
  c.setTransform(dpr * z, 0, 0, dpr * z, -camX * dpr * z, -camY * dpr * z);
  // 展品提示：沒去過的閃金色驚嘆號，去過的打勾
  exhibitObjs.forEach(o => {
    const x = (o.x + o.w / 2) * T, y = o.y * T - 10 + Math.sin(now / 300 + o.x) * 3;
    if (world.near && world.near.id === o.id){
      c.strokeStyle = 'rgba(243,201,105,.9)'; c.lineWidth = 3; c.setLineDash([6, 4]); c.lineDashOffset = -now / 40;
      c.strokeRect(o.x * T - 4, o.y * T - 4, o.w * T + 8, o.h * T + 8); c.setLineDash([]);
    }
    if (o.id === 'map') return;
    const done = stamps.has(o.id);
    c.fillStyle = done ? '#2c7a62' : '#f3c969'; c.beginPath(); c.arc(x, y, 8, 0, 7); c.fill();
    c.fillStyle = done ? '#fff' : '#1e1503'; c.font = '700 11px sans-serif'; c.textAlign = 'center'; c.fillText(done ? '✓' : '!', x, y + 4);
  });
  // 人物依 y 排序，前面的蓋住後面的
  const people = [
    ...world.staff.map(s => ({...s, moving:false, step:0, kind:'staff'})),
    ...world.npcs,
    {...p, cap:'#1d2823', num:'1', kind:'me'}
  ].sort((a, b) => a.y - b.y);
  people.forEach(o => {
    drawPerson(c, o.x * T, o.y * T, o);
    if (o.kind === 'staff'){ c.fillStyle = '#f3c969'; c.font = '700 10px sans-serif'; c.textAlign = 'center'; c.fillText(o.obj === 'guide' ? '館長' : '問答館長', o.x * T, o.y * T - 44); }
  });
  // 對話泡泡（螢幕座標，手機上才看得清楚）
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  world.npcs.forEach(n => {
    const sx = (n.x * T - camX) * z, sy = (n.y * T - camY) * z;
    if (n.talk){
      c.font = '600 13px "Noto Sans TC", "Microsoft JhengHei", sans-serif';
      const lines = wrapText(c, n.talk.text, 190), bw = Math.max(...lines.map(l => c.measureText(l).width)) + 20, bh = lines.length * 18 + 14;
      const bx = Math.max(6, Math.min(vw - bw - 6, sx - bw / 2)), byy = Math.max(6, sy - 46 * z - bh);
      c.fillStyle = '#fbf7ec'; c.strokeStyle = '#1f4d3a'; c.lineWidth = 2;
      c.beginPath(); c.roundRect(bx, byy, bw, bh, 8); c.fill(); c.stroke();
      c.fillStyle = '#1d2823'; c.textAlign = 'left'; lines.forEach((l, i) => c.fillText(l, bx + 10, byy + 20 + i * 18));
    } else if (world.near && world.near.npc === n){
      c.fillStyle = '#fbf7ec'; c.beginPath(); c.roundRect(sx - 14, sy - 46 * z - 22, 28, 18, 6); c.fill();
      c.fillStyle = '#1d2823'; c.font = '700 12px sans-serif'; c.textAlign = 'center'; c.fillText('…', sx, sy - 46 * z - 9);
    }
  });
  // 點擊移動的目的地標記
  if (world.path.length){
    const [tx, ty] = world.path[world.path.length - 1];
    c.strokeStyle = 'rgba(243,201,105,.9)'; c.lineWidth = 2;
    c.beginPath(); c.ellipse((tx * T - camX) * z, (ty * T - camY) * z, 10 * z * .6, 4 * z * .6, 0, 0, 7); c.stroke();
  }
  renderMinimap();
}

function renderMinimap(){
  const mm = $('#minimap');
  if (!mm.offsetParent) return;
  const c = mm.getContext('2d'), s = 3 * world.dpr;
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.fillStyle = 'rgba(12,26,21,.9)'; c.fillRect(0, 0, mm.width, mm.height);
  const col = {wood:'#b98a55', hall:'#8f2f25', grass:'#3d8a57', theater:'#2b3350', marble:'#e8ddc4', archive:'#a0723f'};
  ROOMS.forEach(r => { c.fillStyle = col[r.floor]; c.fillRect(r.x * s, r.y * s, r.w * s, r.h * s); });
  DOORS.forEach(([x, y]) => { c.fillStyle = '#7a5a3a'; c.fillRect(x * s, y * s, s, s); });
  exhibitObjs.forEach(o => { c.fillStyle = stamps.has(o.id) ? '#5bbf8a' : '#f3c969'; c.fillRect((o.x + o.w / 2) * s - s, (o.y + o.h / 2) * s - s, s * 2, s * 2); });
  const p = world.player;
  c.fillStyle = '#ff5a3c'; c.beginPath(); c.arc(p.x * s, p.y * s, s * 1.6, 0, 7); c.fill();
  c.strokeStyle = '#fff'; c.lineWidth = world.dpr; c.stroke();
}

function updateHUD(){
  const n = nearest();
  const changed = (n && n.id) !== (world.near && world.near.id);
  world.near = n;
  const prompt = $('#prompt');
  if (changed){
    prompt.hidden = !n;
    if (n){
      $('#prompt-text').textContent = n.name;
      $('#act-btn').textContent = n.type === 'npc' ? '聊聊' : n.id === 'map' ? '看地圖' : '參觀';
      $('#near-status').textContent = `附近：${n.name}。按 E 或 Enter ${n.type === 'npc' ? '聊天' : '參觀'}。`;
    }
  }
  const r = roomAt(world.player.x, world.player.y);
  if (r && r !== world.room){
    world.room = r;
    $('#nav-room').textContent = r.name;
    const t = $('#room-toast');
    t.textContent = r.name;
    t.classList.remove('show'); void t.offsetWidth; t.classList.add('show');
  }
}

function tick(now){
  const dt = Math.min(.05, (now - (world.last || now)) / 1000);
  world.last = now;
  if (!world.paused){
    updatePlayer(dt);
    updateNPCs(dt, now);
    updateHUD();
  }
  render(now);
  requestAnimationFrame(tick);
}

/* ---------- 展品視窗 ---------- */
const exDialog = () => $('#exhibit');
let currentEx = null;
const EXHIBITS = {
  theater:{kicker:'時光劇場 · 1990–2026', title:'會變的球場：轉動年份，看整座球場跟著變', open(){
    mount('ballpark', 'machine'); $('#ex-body').classList.add('mode-theater');
    setMode('free', false); renderParkYear(state.year); renderMachine(); stamp('theater');
  }},
  lineage:{kicker:'隊史廳 · 球隊族譜', title:'37 個隊名，各自的身世', open(){ mount('lineage'); updateCursor(); stamp('lineage'); }},
  trophies:{kicker:'隊史廳 · 冠軍獎盃牆', title:'1990–2025 年度總冠軍', open(){ mount('trophies'); renderTrophies(); stamp('trophies'); }},
  quiz:{kicker:'資料室 · 問答館長', title:'五局歷史挑戰', open(){ mount('challenge'); }},
  sources:{kicker:'資料室 · 書架', title:'每個故事，都有出處', open(){ mount('sources'); stamp('sources'); }},
  guide:{kicker:'入口大廳 · 服務台', title:'館長：歡迎光臨！', open(){ renderGuide(); }}
};
innings.forEach(inn => {
  EXHIBITS['era-' + inn.n] = {kicker:`歷史長廊 · 第${ZH[inn.n]}局展櫃 · ${inn.years}`, title:`${inn.title}：${inn.tagline}`, open(){
    mount('ballpark'); $('#ex-body').classList.add('mode-era'); setMode('era', false); playEra(inn.n);
  }};
});
Object.entries(GAMES).forEach(([id, g]) => {
  EXHIBITS[id] = {kicker:g.kicker, title:g.title, open(){ const host = $('#game-host'); $('#ex-body').classList.add('mode-game'); $('#ex-body').append(host); g.run(host); }, close(){ stopGame(); }};
});

function mount(...ids){ ids.forEach(id => $('#ex-body').append($('#' + id))); }
function unmount(){
  if (!currentEx) return;
  EXHIBITS[currentEx].close?.();
  stopTask(); stopAutoplay(); stopGame(); era.n = 0;
  const body = $('#ex-body'), store = $('#store');
  [...body.children].forEach(el => { if (el.id) store.append(el); else el.remove(); });
  $('#game-host').innerHTML = '';
  body.className = 'ex-body';
  body.innerHTML = '';
  currentEx = null;
}

function openExhibit(id){
  const def = EXHIBITS[id];
  if (!def) return;
  if (sheet.open) sheet.close();
  unmount();
  const dlg = exDialog();
  $('#ex-kicker').textContent = def.kicker;
  $('#ex-title').textContent = def.title;
  if (!dlg.open){ world.paused = true; world.keys = {}; dlg.showModal(); }
  currentEx = id;
  def.open();
  $('#ex-body').scrollTop = 0;
  // 讓玩家站到這個展品旁邊，關掉視窗後就在原地
  const o = objById[id];
  if (o && rectDist(o, world.player.x, world.player.y) > 1.5){ const [x, y] = approachPoint(o); world.player.x = x; world.player.y = y; world.player.dir = 'up'; }
  if (!$('#ex-body').contains(document.activeElement)) $('#ex-title').focus();
}
function closeExhibit(){ if (exDialog().open) exDialog().close(); }

function stamp(id){
  if (stamps.has(id)) return;
  stamps.add(id);
  $('#stamp-count').textContent = `${stamps.size}/${STAMPS.length}`;
  const s = STAMPS.find(x => x.id === id);
  if (!s || !exDialog().open) return;
  const fx = $('#stamp-fx');
  fx.innerHTML = `<div class="stamp-ink"><span>${s.icon}</span><b>${esc(s.label)}</b><small>已蓋章 ${stamps.size}/${STAMPS.length}</small></div>`;
  fx.classList.remove('show'); void fx.offsetWidth; fx.classList.add('show');
  if (stamps.size === STAMPS.length) setTimeout(() => { fx.innerHTML = '<div class="stamp-ink all"><span>🏅</span><b>集滿 19 章！</b><small>你是榮譽館員了</small></div>'; fx.classList.remove('show'); void fx.offsetWidth; fx.classList.add('show'); }, 2200);
}

function renderTrophies(){
  $('#trophy-wall').innerHTML = seasonRecords.map((r, i) => {
    const st = byStage[r.championId];
    return `<button type="button" class="trophy" data-stage="${st.id}" style="--c:${st.color};--d:${i * 35}ms" aria-label="${r.year} 年度總冠軍：${esc(st.name)}">
      <svg viewBox="0 0 40 46" aria-hidden="true"><path d="M10 4h20v9a10 10 0 0 1-20 0z" fill="#f3c969"/><path d="M10 7H4a6 6 0 0 0 7 9M30 7h6a6 6 0 0 1-7 9" fill="none" stroke="#f3c969" stroke-width="2.5"/><path d="M17 23h6v7h5v4H12v-4h5z" fill="#d9a93a"/><rect x="8" y="34" width="24" height="9" rx="2" fill="var(--c)"/></svg>
      <b>${r.year}</b><span>${esc(st.name)}</span></button>`;
  }).join('') + `<div class="trophy pending"><svg viewBox="0 0 40 46" aria-hidden="true"><path d="M10 4h20v9a10 10 0 0 1-20 0z" fill="none" stroke="#c7b58f" stroke-width="2" stroke-dasharray="3 3"/></svg><b>2026</b><span>進行中</span></div>`;
}

function renderGuide(){
  const body = $('#ex-body');
  body.innerHTML = `<div class="guide">
    <div class="guide-talk"><div class="guide-face" aria-hidden="true">🧢</div><p><b>館長：</b>歡迎光臨！這座館不偏袒任何一支球隊——三十六年來，每支球隊、每個名字都在這裡。往北走是<b>歷史長廊</b>的九個年代展櫃；再往裡面，左邊是<b>隊史廳</b>，右邊是<b>球場體驗館</b>，可以打擊、投球，還能當一次主審、線審和壘審。西邊的<b>時光劇場</b>有一座會變的球場模型，東邊<b>資料室</b>的問答館長會考考你。</p></div>
    <h3>集章護照 <span class="pp-count">${stamps.size}/${STAMPS.length}</span></h3>
    <p class="pp-hint">點任何一格，直接前往那個展區。</p>
    <div class="passport">${STAMPS.map(s => `<button type="button" class="pp${stamps.has(s.id) ? ' done' : ''}" data-goto="${s.id}"><span class="pp-icon" aria-hidden="true">${s.icon}</span><span>${esc(s.label)}</span><small>${stamps.has(s.id) ? '已蓋章' : '未造訪'}</small></button>`).join('')}</div>
    <h3>換一件球衣</h3>
    ${jerseyPicker()}
    <h3>操作方式</h3>
    <ul class="controls-list"><li><kbd>↑↓←→</kbd> 或 <kbd>WASD</kbd> 走動，靠近展品按 <kbd>E</kbd> 或 <kbd>Enter</kbd></li><li>滑鼠／手機：點地板走過去，點展品自動走過去打開</li><li><kbd>Esc</kbd> 關閉展品，回到展廳</li></ul>
  </div>`;
}

function openMap(){
  world.paused = true; world.keys = {};
  const groups = ROOMS.map(r => {
    const items = exhibitObjs.filter(o => o.id !== 'map' && roomAt(o.x + o.w / 2, o.y + o.h / 2) === r);
    return `<section class="map-room"><h3>${r.name}</h3><div>${items.map(o => `<button type="button" class="map-item${stamps.has(o.id) ? ' done' : ''}" data-goto="${o.id}"><span>${esc(o.name)}</span><small>${stamps.has(o.id) ? '✓ 已蓋章' : '前往 →'}</small></button>`).join('')}</div></section>`;
  }).join('');
  $('#map-body').innerHTML = `<canvas id="map-canvas" aria-hidden="true"></canvas><div class="map-list">${groups}</div>`;
  const mc = $('#map-canvas'), s = 8;
  mc.width = MW * s; mc.height = MH * s;
  const c = mc.getContext('2d');
  c.drawImage(staticCanvas, 0, 0, mc.width, mc.height);
  const p = world.player;
  c.fillStyle = '#ff5a3c'; c.beginPath(); c.arc(p.x * s, p.y * s, 6, 0, 7); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 2; c.stroke();
  $('#map-dialog').showModal();
}

/* ---------- 入館、輸入、啟動 ---------- */
function teleportTo(id){
  const o = objById[id];
  if (!o) return;
  const [x, y] = approachPoint(o);
  world.player.x = x; world.player.y = y; world.player.dir = 'up';
  world.path = []; world.pending = null;
}

function bindMuseum(){
  const keyMap = {arrowup:'up', w:'up', arrowdown:'down', s:'down', arrowleft:'left', a:'left', arrowright:'right', d:'right'};
  const anyDialog = () => $$('dialog').some(d => d.open);
  document.addEventListener('keydown', e => {
    if (anyDialog() || e.target.closest('input, textarea, select')) return;
    const k = e.key.toLowerCase();
    if (keyMap[k]){ world.keys[keyMap[k]] = true; e.preventDefault(); return; }
    if ((k === 'e' || k === 'enter' || k === ' ') && !e.target.closest('button, a')){ e.preventDefault(); interact(); }
  });
  document.addEventListener('keyup', e => { const k = keyMap[e.key.toLowerCase()]; if (k) world.keys[k] = false; });
  window.addEventListener('blur', () => { world.keys = {}; });

  const cv = wc();
  cv.addEventListener('pointerdown', e => {
    cv.focus({preventScroll:true});
    const r = cv.getBoundingClientRect();
    const x = (world.cam.x + (e.clientX - r.left) / world.zoom) / T, y = (world.cam.y + (e.clientY - r.top) / world.zoom) / T;
    const o = exhibitObjs.find(o => x > o.x - .3 && x < o.x + o.w + .3 && y > o.y - .6 && y < o.y + o.h + (o.kind === 'case' ? 1.4 : .9));
    if (o){
      if (rectDist(o, world.player.x, world.player.y) < 1.2) return interactWith(o.id);
      const [ax, ay] = approachPoint(o); return walkTo(ax, ay, o.id);
    }
    const ni = world.npcs.findIndex(n => Math.hypot(n.x - x, n.y - .5 - y) < .8);
    if (ni >= 0){ const n = world.npcs[ni]; if (Math.hypot(n.x - world.player.x, n.y - world.player.y) < 1.8) return talkTo(n); return walkTo(n.x, n.y + .9, 'npc-' + ni); }
    if (!solidAt(x, y)) walkTo(x, y);
  });
  $('#act-btn').addEventListener('click', interact);
  $('#minimap').addEventListener('click', openMap);
  $('#map-btn').addEventListener('click', openMap);
  $('#help-btn').addEventListener('click', () => openExhibit('guide'));
  $('#stamp-btn').addEventListener('click', () => openExhibit('guide'));
  $('#map-close').addEventListener('click', () => $('#map-dialog').close());
  $('#map-dialog').addEventListener('close', () => { if (!exDialog().open){ world.paused = false; wc().focus({preventScroll:true}); } });
  $('#ex-close').addEventListener('click', closeExhibit);
  exDialog().addEventListener('close', () => { unmount(); world.paused = false; world.near = null; world.last = 0; wc().focus({preventScroll:true}); });
  // 地圖、護照上的「前往」
  document.addEventListener('click', e => {
    const g = e.target.closest('[data-goto]');
    if (!g) return;
    if ($('#map-dialog').open) $('#map-dialog').close();
    teleportTo(g.dataset.goto);
    if (g.dataset.goto === 'map') return;
    openExhibit(g.dataset.goto);
  });
  document.addEventListener('click', e => {
    const j = e.target.closest('[data-jersey]');
    if (!j) return;
    world.player.color = j.dataset.color; world.player.jersey = j.dataset.jersey;
    $$('[data-jersey]').forEach(b => b.setAttribute('aria-checked', String(b.dataset.jersey === world.player.jersey)));
    $('#intro-choice').textContent='目前球衣：'+world.player.jersey;
    $('#intro-choice').style.setProperty('--choice',world.player.color);
  });
  window.addEventListener('resize', resizeWorld);

  // 入館畫面
  let introTab='basic',introPage=0;
  const introGuide=[
    {title:'先挑一件球衣',text:$('.intro-text').textContent},
    {title:'鍵盤走逛',text:'↑↓←→ 或 WASD 走動。靠近展品後，按 E 開啟參觀。'},
    {title:'滑鼠與手機',text:'點地板就能走過去；點展品，角色會自動走到展品旁並打開。'},
    {title:'直接前往展區',text:'不想走路？右上角「館內地圖」可以直接前往任何展區。入館後，也可以到服務台更換球衣。'}
  ];
  const renderIntro=()=>{
    const options=$('#swatches'),items=introTab==='teams'?TEAM_JERSEYS:JERSEYS;
    const pages=introTab==='guide'?introGuide.length:Math.ceil(items.length/6);
    introPage=Math.max(0,Math.min(introPage,pages-1));
    $$('[data-intro-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.introTab===introTab)));
    if(introTab==='guide'){
      const item=introGuide[introPage];
      options.innerHTML=`<div class="intro-guide-page"><h2>${esc(item.title)}</h2><p>${esc(item.text)}</p></div>`;
    }else{
      options.innerHTML=`<p class="intro-options-label">${introTab==='teams'?`中職與台灣大聯盟 · ${TEAM_JERSEYS.length} 色，依加入年份`:'挑一個喜歡的顏色，穿上就出發。'}</p><div class="swatches intro-swatch-grid" role="radiogroup" aria-label="${introTab==='teams'?'歷代球隊色':'基本色'}球衣">${items.slice(introPage*6,introPage*6+6).map(swatchBtn).join('')}</div>`;
    }
    $('#intro-page-count').textContent=`${introPage+1} / ${pages}`;
    $('[data-intro-step="-1"]').disabled=introPage===0;
    $('[data-intro-step="1"]').disabled=introPage===pages-1;
  };
  $('#intro').addEventListener('click',e=>{
    const tab=e.target.closest('[data-intro-tab]'),step=e.target.closest('[data-intro-step]');
    if(tab){introTab=tab.dataset.introTab;introPage=0;renderIntro();}
    else if(step){introPage+=Number(step.dataset.introStep);renderIntro();}
  });
  renderIntro();
  const enter = () => {
    $('#intro-ticket').classList.add('torn');
    later(() => {
      $('#intro').close();
      world.paused = false;
      wc().focus({preventScroll:true});
      const t = $('#room-toast'); t.textContent = '往上走，就是歷史長廊'; t.classList.remove('show'); void t.offsetWidth; t.classList.add('show');
    }, 500);
  };
  $('#enter-btn').addEventListener('click', enter);
  $('#intro-ticket').addEventListener('click', enter);
  $('#find-team').addEventListener('click', () => { $('#intro').close(); world.paused = false; teleportTo('lineage'); openExhibit('lineage'); setTimeout(() => $('#team-search').focus(), 60); });
  $('#intro').addEventListener('cancel', e => e.preventDefault());
}

/* ---------- 啟動 ---------- */
// Safari's browser bars change the visible height without entering standalone
// mode. Fit the current visual viewport, including changes after rotation.
let viewportFitFrame=0;
function fitVisibleViewport(){
  cancelAnimationFrame(viewportFitFrame);viewportFitFrame=requestAnimationFrame(()=>{
    const v=window.visualViewport;if(v&&v.scale!==1)return;
    const height=Math.round(Math.min(window.innerHeight,v?.height??window.innerHeight)),width=v?.width??window.innerWidth;
    document.documentElement.style.setProperty('--visible-height',height+'px');
    document.documentElement.style.setProperty('--visible-top',(v?.offsetTop??0)+'px');
    document.documentElement.classList.toggle('compact-landscape',width>600&&height<=500&&width>height);
    resizeWorld();
  });
}
window.addEventListener('resize',fitVisibleViewport);window.visualViewport?.addEventListener('resize',fitVisibleViewport);window.visualViewport?.addEventListener('scroll',fitVisibleViewport);fitVisibleViewport();
const worldSizeObserver=new ResizeObserver(resizeWorld);worldSizeObserver.observe(wc());
buildPark();
buildLineage();
renderIndex();
renderQuiz();
renderSources();
bind();
renderMachine();
renderParkYear(state.year);
buildGrid();
drawStatic();
makeNPCs();
bindMuseum();
resizeWorld();
requestAnimationFrame(tick);
$('#intro').showModal();
