/* ============================================================
   臺灣職棒時光機 · 資料層
   所有歷史敘述都對應 sources 內的出處；查核截止日見 CHECKED。
   ============================================================ */
const CHECKED = '2026-10-16';

const sources = {
  cpbl:{org:'中華職棒',title:'球隊沿革',url:'https://cpbl.com.tw/teamhistory'},
  start:{org:'國史館臺灣文獻館',title:'逢中華職棒開幕戰談職棒成立經過',url:'https://www.th.gov.tw/Epaper_Content/238/7969/'},
  venues:{org:'中央通訊社',title:'統一獅移師亞太成棒主球場 回顧中職元年5座球場故事（2026-03-20）',url:'https://www.cna.com.tw/news/aspt/202603205003.aspx'},
  changes:{org:'自由時報',title:'中職球隊異動大事紀（2019-07-04）',url:'https://sports.ltn.com.tw/news/paper/1300579'},
  blackEagle:{org:'報導者',title:'三振不死陳慶國──強打少年的墜落與奮起（2019-03-17）',url:'https://www.twreporter.org/a/baseball-cpbl-30years-eagles-ching-kuo-chen'},
  merge:{org:'中華職棒',title:'陳總統到場祝賀　四球團與那魯灣簽署協議書（2003-01-13）',url:'https://cpbl.com.tw/xmdoc/cont?sid=0L132508602326693275'},
  policy:{org:'國家發展委員會典藏',title:'振興棒球運動總計畫效益評估',url:'https://ws.ndc.gov.tw/001/administrator/10/relfile/0/1284/cb7bb039-b7fb-4d83-827c-9219ab53b3ac.pdf'},
  tml:{org:'淡江大學台灣棒球維基館',title:'台灣大聯盟歷年戰績',url:'https://twbsball.dils.tku.edu.tw/wiki/index.php?title=台灣大聯盟歷年戰績'},
  tmlnames:{org:'棒球時光機史料整理',title:'1997–2002 年台灣職棒大聯盟四支球隊贊助企業',url:'https://baseball-time-machine.blogspot.com/2020/08/1997-2002.html'},
  sunnews:{org:'民生報（PTT 保存舊聞）',title:'聲寶退出 誠泰太陽露臉啦（2001-03-16）',url:'https://www.ptt.cc/bbs/Cobras/M.1067754347.A.44E.html'},
  sun:{org:'中華職棒言舊苑',title:'龍「蛇」雜處的眼鏡蛇－話說誠泰蛇球員卡',url:'https://jackli7751.pixnet.net/blog/posts/4030078222'},
  bull:{org:'淡江大學台灣棒球維基館',title:'興農牛隊',url:'https://twbsball.dils.tku.edu.tw/wiki/index.php/興農牛隊'},
  bullstudy:{org:'朝陽科技大學典藏／陳建佑',title:'團隊組成與運作對於團隊績效之影響：中華職棒之實證',url:'https://ir.lib.cyut.edu.tw/bitstream/310901800/32741/1/104CYUT0121017-002.pdf'},
  kong:{org:'維基百科',title:'臺中金剛：隊名沿革',url:'https://zh.wikipedia.org/wiki/臺中金剛'},
  whale:{org:'淡江大學台灣棒球維基館',title:'中信鯨隊',url:'https://twbsball.dils.tku.edu.tw/wiki/index.php/中信鯨隊'},
  monkey:{org:'Taipei Times',title:'La New Bears become the Lamigo Monkeys（2011-01-07）',url:'https://www.taipeitimes.com/News/sport/archives/2011/01/07/2003492888'},
  rakuten:{org:'中職《職業棒球》',title:'樂天新紀猿・454 期',url:'https://pb.cpbl.com.tw/xmdoc/cont?sid=0L123748240636883592'},
  newdragon:{org:'中華職棒',title:'正式加盟中華職棒 味全龍成為第五隊（2019-06-25）',url:'https://cpbl.com.tw/xmdoc/cont?sid=0L132506947326460907'},
  dragons:{org:'味全龍球團',title:'關於味全龍',url:'https://www.wdragons.com/about/'},
  title2023:{org:'中央通訊社',title:'台灣大賽味全龍6比3擊敗樂天桃猿 睽違24年奪總冠軍（2023-11-12）',url:'https://www.cna.com.tw/news/aspt/202311125002.aspx'},
  tsg:{org:'中職《職業棒球》',title:'中職35終極觀戰指南（2024）',url:'https://pb.cpbl.com.tw/xmdoc/cont?sid=0O086584666062429071&xsmsid=0L113391521954478024'},
  season2026:{org:'中華職棒',title:'2026 年一軍例行賽賽程公告（2026-02-24）',url:'https://cpbl.com.tw/xmdoc/cont?sid=0Q055689330649348741'},
  attendance:{org:'阿忠的中華職棒紀錄網站',title:'中華職棒歷年觀眾平均人數（非官方逐年彙整）',url:'https://zxc22.idv.tw/history.asp?clickflag=999'},
  champions:{org:'阿忠的中華職棒紀錄網站',title:'中華職棒歷年季冠軍／總冠軍資料',url:'https://www.zxc22.idv.tw/champ.asp?clickflag=999'},
  wbc2013:{org:'中央通訊社',title:'中職34年盼複製經典賽效應 雄鷹加盟盛況可期（2023-03-29）',url:'https://www.cna.com.tw/news/aspt/202303290031.aspx'},
  crowdCna:{org:'中央通訊社',title:'中職票房大事件回顧（2025-07-04）',url:'https://www.cna.com.tw/news/aspt/202507045002.aspx'},
  hr300:{org:'中央通訊社',title:'林智勝代打3分砲 中職第一人達成生涯300轟（2023-04-16）',url:'https://www.cna.com.tw/video/news/4341350'},
  title24:{org:'中職《職業棒球》',title:'十冠黃潮・512 期（2024）',url:'https://pb.cpbl.com.tw/xmdoc/cont?sid=0O306578514032833587&xsmsid=0L113391521954478024'},
  premier:{org:'日本職業棒球機構 NPB',title:'第3回WBSCプレミア12・決勝結果',url:'https://npb.jp/premier/'},
  title25:{org:'總統府',title:'總統接見2025年中華職棒總冠軍樂天桃猿',url:'https://www.president.gov.tw/News/39924'},
  chen:{org:'台灣中油《石油通訊》',title:'不被擊倒的台灣巨砲：陳金鋒（2016）',url:'https://ws.cpc.com.tw/Download.ashx?n=MjAxNjkxNDE1NDIyOV8wOTEw5Lit5rK55pyI5YiKMjfmnJ%2FngI%2Fopr3mqpQucGRm&u=LzAwMS9VcGxvYWQvT2xkRmlsZS9GaWxlcy9FcGFwZXIvMjAxNjkxNDE1NDIyOV8wOTEw5Lit5rK55pyI5YiKMjfmnJ%2FngI%2Fopr3mqpQucGRm'}
};
Object.values(sources).forEach(s => s.checked = CHECKED);

const leagues = [
  {id:'cpbl', name:'中華職棒', short:'CPBL', from:1990, to:2026},
  {id:'tml',  name:'台灣大聯盟', short:'TML', from:1997, to:2002}
];

/* ---------- 球隊階段 ----------
   group：同一支球隊的連續經營／冠名階段；跨 group 的承接一律寫在 teamRelations。 */
const teamStages = [];
function stage(id, group, name, league, start, end, color, description, sourceIds = ['cpbl'], period){
  teamStages.push({id, group, name, league, start, end, color, description, sourceIds,
    period: period || (start === end ? `${start}` : `${start}–${end === 2026 ? '今（2026 查核）' : end}`)});
}
stage('elephants','brothers','兄弟象','cpbl',1990,2013,'#c99a1e','職棒元年的創始四隊之一，黃色球衣與象迷是 90 年代最大的看台風景。2013 球季後經營權轉手，2014 年起以中信兄弟出賽。');
stage('brothers','brothers','中信兄弟','cpbl',2014,2026,'#c99a1e','承接兄弟象，2014 球季起出賽。名字裡有「中信」，但它接的是象隊的棒子，和已解散的中信鯨是兩條不同的路。');
stage('lions','lions','統一獅','cpbl',1990,2007,'#d0672a','創始四隊之一，在 1990 年 3 月 17 日的開幕戰對上兄弟象。2008 球季起改名統一7-ELEVEn獅。',['cpbl','start']);
stage('sevenlions','lions','統一7-ELEVEn獅','cpbl',2008,2026,'#d0672a','由統一獅更名而來，同一個球團持續經營。是中職唯一從元年至今都沒換過經營者的球隊。');
stage('dragons-old','dragon-old','味全龍（初代）','cpbl',1990,1999,'#c0392b','創始四隊之一，1990 年就拿下年度總冠軍，1997–1999 更完成三連霸。1999 球季後宣布解散。',['cpbl','newdragon','champions']);
stage('dragons-new','dragon-new','味全龍（重新加盟）','cpbl',2021,2026,'#c0392b','2019 年重新加盟，2020 先打二軍，2021 回到一軍。和初代之間隔了二十多年空白，是「解散後重新成立」，不是一路連續參賽。',['newdragon','dragons']);
stage('tigers','tigers','三商虎','cpbl',1990,1999,'#2f5f95','創始四隊之一，1999 球季後宣布解散。此後沒有任何球隊承接三商虎。',['cpbl','changes']);
stage('eagles','eagles','時報鷹','cpbl',1993,1997,'#3b5aa0','1993 年加入，讓中職成為六隊。1997 年球員涉入簽賭案（「黑鷹事件」）後重創，1997 年是最後一季，1998 年宣布解散。與台鋼雄鷹沒有承接關係。',['cpbl','changes','blackEagle']);
stage('bears','guardians','俊國熊','cpbl',1993,1995,'#2e8a64','1993 年與時報鷹一同加入。1995 球季後由興農取得部分股權，改名興農熊。',['cpbl','bullstudy']);
stage('sinon-bear','guardians','興農熊','cpbl',1996,1996,'#2e7d4a','由俊國熊轉手後的新名字，只用了半個球季。1996 年 6 月 7 日興農取得全部股權，改名興農牛。',['cpbl','bullstudy'],'1996 上半季');
stage('bulls','guardians','興農牛','cpbl',1996,2012,'#2e7d4a','1996 年 6 月 7 日由興農熊更名，從下半季開始以牛的名字出賽，2004、2005 連續拿下總冠軍。2012 球季後轉賣，2013 年改為義大犀牛。',['cpbl','bull','bullstudy','champions'],'1996 下半季–2012');
stage('rhinos','guardians','義大犀牛','cpbl',2013,2016,'#7a4f8f','承接興農牛，2013–2016 年出賽，並在 2016 年拿下總冠軍。之後轉由富邦經營。',['cpbl','champions']);
stage('guardians','guardians','富邦悍將','cpbl',2017,2026,'#2d6aa0','承接義大犀牛，2017 球季起出賽。往回追，能一路連到 1993 年的俊國熊。');
stage('whalex','whales','和信鯨','cpbl',1997,2001,'#23788f','1997 年加入中職，讓中職當季達到七隊。2002 年改名中信鯨。',['cpbl','whale']);
stage('whales','whales','中信鯨','cpbl',2002,2008,'#23788f','和信鯨更名而來，2008 球季後解散。和後來的中信兄弟沒有直接承接關係。',['cpbl','whale']);
stage('first','monkeys','第一金剛','cpbl',2003,2003,'#454c8a','2003 年兩聯盟整合時，由 TML 的臺北太陽與高屏雷公整併而成。名字有「金剛」，前身卻不是臺中金剛。',['cpbl','policy']);
stage('lanew','monkeys','La New熊','cpbl',2004,2010,'#8a6430','2004 年 La New 接手第一金剛，改名 La New熊，2006 年迎來旅美返臺的陳金鋒，同年拿下總冠軍。',['cpbl','monkey','chen','champions']);
stage('lamigo','monkeys','Lamigo桃猿','cpbl',2011,2019,'#2f5c86','2011 年移師桃園並改名 Lamigo桃猿，2017–2019 年完成總冠軍三連霸。2019 球季後轉賣樂天。',['cpbl','monkey','rakuten','champions']);
stage('rakuten','monkeys','樂天桃猿','cpbl',2020,2026,'#9b2f4b','樂天接手後 2020 年起出賽，2025 年拿下年度總冠軍。往回追可連到 TML 的太陽與雷公。',['cpbl','rakuten','title25']);
stage('naluwan','cobras','那魯灣太陽','cpbl',2003,2003,'#bf6a2b','2003 年由 TML 的臺中金剛與嘉南勇士整併而成。開季不久，3 月 14 日受誠泰冠名改為誠泰太陽。名字有「太陽」，前身卻不是臺北太陽。',['policy','sun'],'2003 開季–03-14');
stage('macoto-sun','cobras','誠泰太陽','cpbl',2003,2003,'#bf6a2b','2003 年 3 月 14 日由那魯灣太陽改名。誠泰季後取得經營權，2004 年改為誠泰COBRAS。',['cpbl','sun'],'2003-03-14–2003 季末');
stage('cobras','cobras','誠泰COBRAS','cpbl',2004,2007,'#b2502b','誠泰取得經營權後以眼鏡蛇為識別，2008 年經營權轉手給米迪亞。',['cpbl','sun']);
stage('dmedia','cobras','米迪亞暴龍','cpbl',2008,2008,'#8f3b33','接手誠泰COBRAS 的球隊。2008 年因球團涉入職棒簽賭事件，遭聯盟除名。',['cpbl','sun']);
stage('tsg','tsg','台鋼雄鷹','cpbl',2024,2026,'#2c7a62','2022 年加盟、2023 年先打二軍，2024 年首度登上一軍，讓中職回到六隊。是全新球隊，不是時報鷹復活。',['cpbl','tsg']);
// TML：冠名企業幾乎年年變，但仍是同一支地區球隊。
stage('sun-sampo','tmlsun','臺北聲寶太陽','tml',1997,2000,'#c4462f','TML 的臺北球隊，1997 年首季出賽，由聲寶冠名。',['tml','sunnews','tmlnames']);
stage('sun-macoto','tmlsun','臺北誠泰太陽','tml',2001,2002,'#c4462f','2001 年起改由誠泰冠名。2003 年與高屏雷公整併為第一金剛。',['tml','sunnews','policy']);
stage('kong97','tmlkong','臺中金剛','tml',1997,1997,'#4a6aa0','TML 的中部球隊，1997 年首季出賽。',['tml','tmlnames']);
stage('kong98','tmlkong','臺中中纖金剛','tml',1998,1998,'#4a6aa0','1998 年由中纖冠名。',['tml','tmlnames']);
stage('kong99','tmlkong','臺中金剛','tml',1999,2000,'#4a6aa0','1999 年回到地區隊名，2000 年 5 月起接受媚登峯冠名（確切日期待補）。',['tml','tmlnames','kong'],'1999–2000 年 5 月前');
stage('kong00','tmlkong','臺中媚登峯金剛','tml',2000,2001,'#4a6aa0','2000 年 5 月起由媚登峯冠名，2001 年延續。',['tml','tmlnames','kong'],'2000 年 5 月–2001');
stage('kong02','tmlkong','臺中宏碁金剛','tml',2002,2002,'#4a6aa0','2002 年由宏碁冠名，是 TML 最後一季。2003 年與嘉南勇士整併為那魯灣太陽。',['tml','tmlnames','policy']);
stage('warrior97','tmlwarrior','嘉南年代勇士','tml',1997,1999,'#3a8060','TML 的嘉義、臺南球隊，由年代冠名。',['tml','tmlnames']);
stage('warrior00','tmlwarrior','嘉南遠傳勇士','tml',2000,2000,'#3a8060','2000 年由遠傳冠名。',['tml','tmlnames']);
stage('warrior01','tmlwarrior','嘉南網客勇士','tml',2001,2001,'#3a8060','2001 年以網客品牌冠名。',['tml','tmlnames']);
stage('warrior02','tmlwarrior','嘉南勇士','tml',2002,2002,'#3a8060','TML 最後一季回到嘉南勇士之名。2003 年與臺中金剛整併為那魯灣太陽。',['tml','tmlnames','policy']);
stage('thunder97','tmlthunder','高屏生活雷公','tml',1997,1999,'#85584f','TML 的高雄、屏東球隊，前三季由生活企業冠名。',['tml','tmlnames']);
stage('thunder00','tmlthunder','高屏年代雷公','tml',2000,2002,'#85584f','2000 年起改由年代冠名。2003 年與臺北太陽整併為第一金剛。',['tml','tmlnames','policy']);
const byStage = Object.fromEntries(teamStages.map(t => [t.id, t]));

/* ---------- 沿革關係（允許多對一） ---------- */
const teamRelations = [];
function relation(from, to, type, date, description, sourceIds = ['cpbl']){
  teamRelations.push({from, to, type, date, description, sourceIds});
}
relation('elephants','brothers','轉賣・更名','2013 季後 → 2014','中信接手兄弟象。');
relation('lions','sevenlions','更名','2008','統一獅改名統一7-ELEVEn獅。');
relation('dragons-old','dragons-new','解散後重新成立','1999 解散／2019 加盟／2021 一軍','中間空白二十多年，不是連續經營。',['newdragon','dragons']);
relation('bears','sinon-bear','轉賣・更名','1995-11-05','興農取得部分股權。',['bullstudy']);
relation('sinon-bear','bulls','取得全部股權・更名','1996-06-07','同一球季兩個名字，只算一隊。',['bullstudy']);
relation('bulls','rhinos','轉賣・更名','2012 季後 → 2013','義大接手興農牛。');
relation('rhinos','guardians','轉賣・更名','2016 季後 → 2017','富邦接手義大犀牛。');
relation('whalex','whales','更名','2002','和信鯨改名中信鯨。',['cpbl','whale']);
relation('first','lanew','轉賣・更名','2004','La New 接手第一金剛。',['cpbl','monkey']);
relation('lanew','lamigo','更名・遷移','2011','移師桃園，改名 Lamigo桃猿。',['monkey']);
relation('lamigo','rakuten','轉賣・更名','2019 季後 → 2020','樂天接手桃猿。',['rakuten','cpbl']);
relation('naluwan','macoto-sun','冠名','2003-03-14','受誠泰冠名，仍是同一隊。',['sun']);
relation('macoto-sun','cobras','取得經營權・更名','2003 季後 → 2004','誠泰從冠名企業變成經營者。',['sun']);
relation('cobras','dmedia','轉賣・更名','2008','米迪亞接手，同年遭聯盟除名。',['cpbl','sun']);
[['sun-sampo','sun-macoto'],['kong97','kong98'],['kong98','kong99'],['kong99','kong00'],['kong00','kong02'],
 ['warrior97','warrior00'],['warrior00','warrior01'],['warrior01','warrior02'],['thunder97','thunder00']]
 .forEach(([a,b]) => relation(a, b, '冠名變更', byStage[b].period, '同一支 TML 球隊換了冠名企業。', ['tml','tmlnames']));
relation('sun-macoto','first','整併（多對一）','2003','臺北太陽 ＋ 高屏雷公 → 第一金剛',['policy','merge']);
relation('thunder00','first','整併（多對一）','2003','高屏雷公 ＋ 臺北太陽 → 第一金剛',['policy','merge']);
relation('kong02','naluwan','整併（多對一）','2003','臺中金剛 ＋ 嘉南勇士 → 那魯灣太陽',['policy','merge']);
relation('warrior02','naluwan','整併（多對一）','2003','嘉南勇士 ＋ 臺中金剛 → 那魯灣太陽',['policy','merge']);

/* ---------- 年度一軍名錄 ----------
   每列是一支球隊；季中更名放在 stageIds，計數只算一次。 */
const seasonTeams = [];
for (let y = 1990; y <= 2026; y++){
  const ids = [y < 2014 ? 'elephants' : 'brothers', y < 2008 ? 'lions' : 'sevenlions'];
  if (y <= 1999) ids.push('dragons-old', 'tigers');
  if (y >= 2021) ids.push('dragons-new');
  if (y >= 1993 && y <= 1997) ids.push('eagles');
  if (y >= 1993) ids.push(y <= 1995 ? 'bears' : y <= 2012 ? 'bulls' : y <= 2016 ? 'rhinos' : 'guardians');
  if (y >= 1997 && y <= 2008) ids.push(y <= 2001 ? 'whalex' : 'whales');
  if (y >= 2003) ids.push(y === 2003 ? 'first' : y <= 2010 ? 'lanew' : y <= 2019 ? 'lamigo' : 'rakuten');
  if (y >= 2003 && y <= 2008) ids.push(y === 2003 ? 'macoto-sun' : y <= 2007 ? 'cobras' : 'dmedia');
  if (y >= 2024) ids.push('tsg');
  const members = ids.map(id => ({id, stageIds: y === 1996 && id === 'bulls' ? ['sinon-bear','bulls'] : y === 2003 && id === 'macoto-sun' ? ['naluwan','macoto-sun'] : [id]}));
  seasonTeams.push({year:y, league:'cpbl', members,
    sourceIds:['cpbl', ...(y === 1996 ? ['bullstudy'] : []), ...(y === 2003 ? ['sun'] : []), ...(y === 2026 ? ['season2026'] : [])],
    notes: y === 1996 ? '6 月 7 日興農熊更名興農牛，同一隊只算一次。'
         : y === 2003 ? '3 月 14 日那魯灣太陽更名誠泰太陽，同一隊只算一次。'
         : y === 2019 || y === 2020 ? '味全已重新加盟，但還沒打一軍，不列入一軍隊數。'
         : y === 2022 || y === 2023 ? '台鋼已加盟，但還沒打一軍，不列入一軍隊數。'
         : y === 2026 ? '本季進行中：只確認六隊名錄，未收錄未查核的賽果與冠軍。' : ''});
  const tmlIds = y >= 1997 && y <= 2002 ? [
    y <= 2000 ? 'sun-sampo' : 'sun-macoto',
    y === 1997 ? 'kong97' : y === 1998 ? 'kong98' : y === 1999 ? 'kong99' : y <= 2001 ? 'kong00' : 'kong02',
    y <= 1999 ? 'warrior97' : y === 2000 ? 'warrior00' : y === 2001 ? 'warrior01' : 'warrior02',
    y <= 1999 ? 'thunder97' : 'thunder00'] : [];
  seasonTeams.push({year:y, league:'tml',
    members: tmlIds.map(id => ({id, stageIds: y === 2000 && id === 'kong00' ? ['kong99','kong00'] : [id]})),
    sourceIds:['tml','tmlnames', ...(y === 2000 ? ['kong'] : [])],
    notes: y === 2000 ? '臺中金剛 5 月起冠名媚登峯，同一隊只算一次（確切日期待補）。' : ''});
}

/* ---------- 歷史球票（事件） ---------- */
const events = [];
function event(id, year, date, title, category, leagueIds, summary, background, impact, teamIds, sourceIds){
  events.push({id, year, date, title, category, leagueIds, summary, background, impact, teamIds, sourceIds});
}
event('opening',1990,'1990-03-17','第一聲「Play Ball」','聯盟發展',['cpbl'],
 '1990 年 3 月 17 日，臺北市立棒球場湧進 1 萬 4350 人。統一獅對兄弟象，臺灣第一場職業棒球比賽開打。',
 '中華職業棒球聯盟在 1989 年 10 月 23 日成立，隔年春天才迎來第一個球季。開幕戰在臺北市立棒球場舉行，旅日名將王貞治為第一場比賽揮棒，捕手是聯盟會長唐盼盼。兄弟象、統一獅、味全龍、三商虎四支創始球隊，讓棒球從偶爾才有的國際賽與業餘賽，變成每週都能進場的日常。',
 '元年全年 180 場例行賽，累計約 90 萬人次進場；年度總冠軍由味全龍拿下。四個創始隊名後來走上完全不同的路，有的延續至今，有的解散，有的二十多年後重新出發。',
 ['elephants','lions','dragons-old','tigers'],['start','venues','attendance','champions']);
event('expansion',1993,'1993','六隊時代來了','球隊變遷',['cpbl'],
 '俊國熊與時報鷹加入，四隊擴張為六隊。新球隊帶來新球迷，也各自寫下截然不同的結局。',
 '職棒元年的四隊規模維持了三個球季。1993 年俊國熊與時報鷹加入一軍，對戰組合一下子變多，全年場次從 180 場增加到 270 場，總進場人數也首次突破 160 萬。中職在 90 年代中期迎來第一波高峰。',
 '俊國熊後來一路轉手為興農、義大，到今天的富邦悍將；時報鷹則在 1997 年的簽賭風暴中受創最深，1998 年解散。同一年加入的兩支球隊，命運天差地別。',
 ['bears','eagles'],['changes','cpbl','attendance']);
event('bear-bull',1996,'1996-06-07','一個球季，從熊變成牛','球隊變遷',['cpbl'],
 '興農接手俊國後，球隊先叫興農熊；1996 年 6 月 7 日再改名興農牛。同一年兩個名字，卻只是一支球隊。',
 '1995 球季後，興農取得俊國球隊部分股權，球隊改叫興農熊。1996 年 6 月 7 日，興農取得剩餘股權，隊名改為興農牛，官方沿革也分列上半季興農熊、下半季興農牛。這是經營權與名稱同時變動的例子。',
 '1996 年的名錄裡，熊與牛合併成同一張卡，當季仍是六隊。這支牛隊後來在 2004、2005 年連續奪冠。',
 ['sinon-bear','bulls'],['bullstudy','bull','cpbl']);
event('black-eagle',1997,'1997','黑鷹事件：看台空了一半','聯盟發展',['cpbl'],
 '時報鷹多名球員涉入簽賭放水，遭移送偵辦，史稱「黑鷹事件」。中職總進場人數從 136 萬掉到 69 萬，幾乎腰斬。',
 '這是中華職棒史上第一宗涉賭放水案。1997 年，時報鷹多名球員因涉賭被移送偵辦，相關球員從此離開職棒。案件審理拖了好幾年，2004 年底高等法院判決，球員被判七個月到一年十個月不等的刑期，並宣告緩刑。球迷對比賽真實性的信任，在這一年受到重創。',
 '1997 年平均每場觀眾從前一年約 4,500 人跌到約 2,000 人。時報鷹在 1997 年後停止出賽，1998 年宣布解散。同一年，另一個職業聯盟也正好成立，臺灣職棒進入最混亂的時期。',
 ['eagles'],['blackEagle','attendance','changes']);
event('two-leagues',1997,'1997','一座島，兩個聯盟','聯盟發展',['cpbl','tml'],
 '台灣大聯盟首季開打，臺北太陽、臺中金剛、嘉南勇士、高屏雷公四支地區球隊登場；同年和信鯨加入中職。中職七隊、TML 四隊，合計十一隊。',
 '1997 年，台灣大聯盟以地區為名組成四支球隊，展開獨立於中職的另一套賽事。它不是中職的下層聯盟，而是另一個職業聯盟，球員、賽程與經營方式都各自分開。同一年，和信鯨加入中職，中職也來到七隊。',
 '兩個聯盟並存了六個球季（1997–2002）。在「時光機」切換全部模式，可以看到兩欄並列的球隊。理解這段並存，才看得懂 2003 年的整合。',
 ['whalex','sun-sampo','kong97','warrior97','thunder97'],['changes','tml','policy']);
event('farewell',1999,'1999 季後','告別虎與龍','球隊變遷',['cpbl'],
 '三商虎與初代味全龍在 1999 球季後相繼解散。味全才剛完成三連霸。2000 年，中職只剩四支球隊。',
 '三商虎與味全龍都是 1990 年的創始球隊，卻在第十個球季後離開。味全龍在 1997、1998、1999 年連續拿下總冠軍，最輝煌的時候畫下句點。加上前一年解散的時報鷹，中職版圖快速縮小。',
 '2000 年一軍只剩兄弟象、統一獅、興農牛與和信鯨。這一年全年進場約 30 萬人次，是中職史上最低。味全要等到 2019 年才重新加盟、2021 年重回一軍。',
 ['tigers','dragons-old','eagles'],['changes','newdragon','attendance','champions']);
event('whale-name',2002,'2002','和信鯨換上中信隊名','球隊變遷',['cpbl'],
 '1997 年加入中職的和信鯨，在 2002 年改名中信鯨。名字裡也有「中信」，但它和後來的中信兄弟是兩支不同的球隊。',
 '和信鯨在 1997 年加入中職，2002 年起改名中信鯨。後來 2014 年中信接手的是兄弟象，所以「中信」這兩個字出現在兩條不同的球隊路線上。看球隊沿革，要看是誰接手誰，不能只比對名字。',
 '中信鯨在 2008 球季後解散。在「球隊族譜」裡，鯨隊與兄弟是兩條各自獨立的線。',
 ['whalex','whales'],['whale','cpbl']);
event('integration',2003,'2003-01-13','合流：四隊變兩隊','聯盟發展',['cpbl','tml'],
 '1 月 13 日簽署協議，兩聯盟走向整合。TML 四支球隊整併成兩隊加入中職：「太陽」與「金剛」的名字交換了位置。',
 '中職官方新聞記載，這一天四球團與那魯灣簽署協議，台灣大聯盟依協議解散並出讓球隊。整併方式是：臺北太陽 ＋ 高屏雷公 → 第一金剛；臺中金剛 ＋ 嘉南勇士 → 那魯灣太陽，後者在 3 月 14 日改名誠泰太陽。也就是說，叫「金剛」的那隊前身沒有臺中金剛，叫「太陽」的那隊前身也沒有臺北太陽。',
 '2003 年中職以六隊出賽。從此，臺灣只剩一個職棒聯盟。今天的樂天桃猿，往回追就能連到 TML 的太陽與雷公。',
 ['first','naluwan','macoto-sun','sun-macoto','kong02','warrior02','thunder00'],['merge','policy','sun']);
event('new-owners',2004,'2004','熊與眼鏡蛇','球隊變遷',['cpbl'],
 '第一金剛由 La New 接手，變成 La New熊；誠泰從冠名企業變成經營者，太陽改名誠泰COBRAS。',
 '2003 年加入中職的兩支整併球隊，隔年都換了名字。La New 接手第一金剛，以熊為新識別；誠泰則從「贊助冠名」進一步「取得經營權」，在 2004 年採用 COBRAS 隊名。冠名和經營是不同層次的關係。',
 '之後，一條路線經 Lamigo 走向樂天；另一條則在 2008 年轉給米迪亞，最後走到終點。',
 ['first','lanew','macoto-sun','cobras'],['cpbl','sun','monkey']);
event('chen-return',2006,'2006','陳金鋒回來了','賽事與紀錄',['cpbl'],
 '旅美返臺的陳金鋒在 2006 年加入 La New熊，把國際賽累積的人氣帶進中職。同一年，La New熊拿下總冠軍。',
 '陳金鋒是臺灣早期在美國職棒發展的代表人物之一。2006 年他回臺加入 La New熊，成為球隊中心打者，被球迷稱為「台灣巨砲」。他的生涯與這支球隊從 La New 到 Lamigo 的變化緊緊相連，直到 2016 年引退。',
 '本站的照片攝於 2016 年桃園球場的「陳金鋒日」活動，不是 2006 年加盟當天。',
 ['lanew','lamigo'],['chen','champions']);
event('contraction',2008,'2008','又一次風暴','聯盟發展',['cpbl'],
 '米迪亞暴龍因球團涉入簽賭事件，被聯盟除名；中信鯨也在季後解散。2009 年，中職再度只剩四隊。',
 '2008 年米迪亞接手誠泰COBRAS，同一季爆發職棒簽賭事件，球團遭聯盟除名。中信鯨則在季後結束經營。這一年的全年進場約 57 萬人次。聯盟處分的是球團，不能把所有成員都概括為涉案，個人的刑事責任也要另看司法結果。',
 '名錄保留 2008 年實際出賽的六隊，2009 年起剩四隊。從 1997 年到 2008 年，中職兩度從谷底爬起，信任的重建，用了好多年。',
 ['dmedia','whales'],['cpbl','sun','whale','attendance']);
event('lamigo-era',2011,'2011','從 La New熊到桃園桃猿','球隊變遷',['cpbl'],
 'La New熊改名 Lamigo桃猿，移師桃園。新城市、新主場，也帶來全新的應援風格。',
 '2011 年 1 月，La New 宣布球隊改名 Lamigo Monkeys，在新球季以桃猿出賽。球隊識別、主場城市與球迷社群一起改變，但它是同一支球隊，不是新增一隊。',
 'Lamigo桃猿在 2017–2019 年完成總冠軍三連霸。2020 年起，球隊由樂天接手。',
 ['lanew','lamigo'],['monkey','cpbl','champions']);
event('wbc-2013',2013,'2013','經典賽之後，球迷回來了','賽事與紀錄',['cpbl'],
 '2013 年季前，世界棒球經典賽在臺灣開打。臺灣隊的表現點燃全島熱情，中職全年進場人數從 58 萬翻倍到 146 萬。',
 '中央社的回顧寫道，2013 年季前經典賽在臺灣開打，臺灣隊打出動人比賽，「拯救了中職因假球事件流失的球迷信心和票房」。2012 年中職總進場人數為 58 萬 3805 人，2013 年達到 145 萬 9072 人。國際賽的熱度，把許多人重新帶回球場。',
 '同一年，興農牛轉手為義大犀牛。中職從谷底反彈後，觀眾數在接下來十年持續維持在百萬人次以上。',
 ['rhinos','lamigo'],['wbc2013','attendance']);
event('rhino-era',2013,'2013','義大犀牛接棒','球隊變遷',['cpbl'],
 '興農結束經營，由義大接手，2013 年以義大犀牛出賽。這條從 1993 年俊國熊開始的線，又換了一次名字。',
 '從牛到犀牛，是企業接手後的身分變化。2012 年名錄仍是興農牛，2013 年才是義大犀牛。交易常在季後完成，所以前一季的隊名不會被改寫。',
 '義大犀牛在 2016 年拿下總冠軍，同年季後轉給富邦。從俊國、興農、義大到富邦，四個企業接力經營同一支球隊。',
 ['bulls','rhinos'],['cpbl','bull','champions']);
event('brothers-era',2014,'2014','黃衫接續：中信兄弟','球隊變遷',['cpbl'],
 '兄弟象在 2013 球季後轉手，2014 年起以中信兄弟出賽。黃色的看台還在，名字換了。',
 '兄弟象從職棒元年參賽了 24 個球季，是 90 年代最具人氣的球隊之一。2014 年中信接手後改名中信兄弟。名字裡的「中信」，容易讓人聯想到中信鯨，但兩者沒有承接關係。',
 '兄弟象與中信兄弟在族譜上是同一條線；和信鯨、中信鯨則是另一條，已在 2008 年結束。',
 ['elephants','brothers'],['cpbl','changes','title24']);
event('fubon-era',2017,'2017','富邦悍將登場','球隊變遷',['cpbl'],
 '富邦接手義大犀牛，2017 年以富邦悍將出賽。中職仍是四隊，但其中一支換上了第四個企業名字。',
 '2016 年名錄仍是義大犀牛，2017 年才是富邦悍將。往回追，這支球隊的根源是 1993 年加入的俊國熊。企業接手的那一年，不等於整支球隊歷史的起點。',
 '2017 年四隊為中信兄弟、統一7-ELEVEn獅、Lamigo桃猿與富邦悍將。這個四隊格局還要再撐四年。',
 ['rhinos','guardians'],['cpbl']);
event('dragon-return',2019,'2019-06-24','龍，要回來了','聯盟發展',['cpbl'],
 '中職會員大會通過味全加盟案。距離初代味全龍解散整整二十年，龍以全新球隊重返聯盟，先從二軍出發。',
 '聯盟在 5 月通過常務理事會審查，6 月 24 日會員大會正式通過味全加盟案。新球隊需要選秀、組隊與養成，所以 2020 年先打二軍，2021 年才進入一軍。加盟、二軍、一軍是三個不同的時間點。',
 '2019 與 2020 年的一軍名錄仍是四隊。很多老龍迷說，他們等了二十年。',
 ['dragons-old','dragons-new'],['newdragon']);
event('rakuten-era',2020,'2020','桃猿換上樂天隊名','球隊變遷',['cpbl'],
 '樂天接手 Lamigo，2020 年以樂天桃猿出賽。這支球隊往回追，可以連回 2003 年整合與 TML 時代。',
 '2019 球季之後，桃猿的經營權轉給樂天，2020 年以樂天桃猿出賽。前一季的 Lamigo 與下一季的樂天是接續的同一支球隊，不是同一年多了一隊。',
 '在「球隊族譜」點樂天桃猿，可以一路回溯：Lamigo → La New熊 → 第一金剛 → 臺北太陽＋高屏雷公。',
 ['lamigo','rakuten'],['rakuten','cpbl']);
event('five-teams',2021,'2021','龍回到一軍，五隊交手','聯盟發展',['cpbl'],
 '味全龍在 2021 年重返一軍。從 2009 年起維持了十二年的四隊格局，終於變成五隊。',
 '味全的回歸分成三步：2019 加盟、2020 二軍、2021 一軍。球團官方隊史確認 2021 年起重返一軍，年度名錄因此從四隊變成五隊。初代與重新加盟兩張球隊卡，在族譜上以「解散後重新成立」連起來。',
 '比較 2020 與 2021 年，就能看見隊數變化。新球隊加入，也讓更多年輕選手有了一軍舞台。',
 ['dragons-new'],['dragons','newdragon']);
event('lin-300',2023,'2023-04-16','林智勝，第 300 轟','賽事與紀錄',['cpbl'],
 '味全龍林智勝在八局上代打，擊出三分全壘打，成為中職史上第一位生涯 300 轟的打者。',
 '2023 年 4 月 16 日，林智勝沒有先發，卻在八局上代打時把球送出全壘打牆。這支三分砲讓他的中職生涯全壘打累計達到 300 支，紀錄跨越他在不同球隊效力的年份。',
 '300 是達成當下的里程碑數字。同一年，他所在的味全龍也拿下總冠軍。',
 ['dragons-new'],['hr300']);
event('dragon-title',2023,'2023-11-12','2023 年度總冠軍：味全龍','賽事與紀錄',['cpbl'],
 '台灣大賽第七戰，味全龍 6 比 3 擊敗樂天桃猿，四勝三敗封王。重新加盟後第三個一軍球季，就拿下總冠軍。',
 '2023 年台灣大賽打滿七場，最後一戰在天母棒球場舉行。味全以 6 比 3 獲勝，拿下重新加盟後的第一座總冠軍。中央社標題寫著「睽違 24 年奪總冠軍」：上一次味全奪冠，是 1999 年初代味全龍的三連霸。',
 '球團官方把初代與重新加盟合計為隊史第五冠。從 1999 解散、2019 加盟、2021 一軍到 2023 奪冠，這是中職最戲劇化的回歸故事之一。',
 ['dragons-new','rakuten'],['title2023','dragons']);
event('six-teams',2024,'2024','台鋼雄鷹登場，六隊時代','聯盟發展',['cpbl'],
 '台鋼雄鷹首度登上一軍，中職回到六隊，全年例行賽增加到 360 場。',
 '台鋼在 2022 年加盟，2023 年先打二軍，2024 年才成為一軍第六隊。隊名裡有「鷹」，但它是全新成立的球隊，不是時報鷹的延續。中職官方 2024 觀戰指南介紹了台鋼首次加入一軍的賽季。',
 '六隊、360 場、新球場與新球迷：2024 年全年進場人數衝上 276 萬人次，創下當時新高。',
 ['tsg'],['tsg','cpbl','attendance']);
event('brothers-ten',2024,'2024-10-25','2024 年度總冠軍：中信兄弟','賽事與紀錄',['cpbl'],
 '中信兄弟在台灣大賽以四勝一敗擊敗統一7-ELEVEn獅，拿下含兄弟象時期的隊史第十座總冠軍。',
 '2024 年台灣大賽，中信兄弟在 10 月 25 日封王。「十冠」包含兄弟象時期的冠軍，不是 2014 年改名後拿了十座。年度冠軍資料仍以當年實際的隊名記錄。',
 '這也是中信兄弟四年內的第三座冠軍（2021、2022、2024）。',
 ['brothers','sevenlions'],['title24','champions']);
event('premier12',2024,'2024-11-24','東京巨蛋的 4：0','賽事與紀錄',['cpbl'],
 '臺灣代表隊在東京巨蛋以 4 比 0 擊敗日本，拿下世界 12 強棒球賽冠軍。這是國際賽，不是中職賽事，但許多中職球員都在場上。',
 '2024 年 11 月 24 日，世界 12 強冠軍戰在東京巨蛋進行，臺灣隊以 4 比 0 完封地主日本，首度拿下這項賽事冠軍。國家隊與職業球團的組成不同，所以本站把它放在「背景事件」。',
 '冠軍熱潮延續到下一季：2025 年中職全年進場突破 373 萬人次，再創新高。',
 [],['premier','attendance']);
event('rakuten-title25',2025,'2025-10-27','2025 年度總冠軍：樂天桃猿','賽事與紀錄',['cpbl'],
 '樂天桃猿在 2025 台灣大賽以四勝一敗擊敗中信兄弟，拿下樂天接手後的第一座總冠軍。',
 '2025 年樂天桃猿先闖過季後挑戰賽，再於台灣大賽四勝一敗封王。這是樂天接手後首冠；若把 La New 與 Lamigo 時期算進去，則是這條球隊沿革的第八冠。',
 '這是本站收錄的最後一個完整球季。2026 年球季仍在進行，本站不預測冠軍。',
 ['rakuten','brothers'],['title25','champions']);
events.sort((a,b) => a.year - b.year || a.date.localeCompare(b.date));
const byEvent = Object.fromEntries(events.map(e => [e.id, e]));

/* ---------- 年度數據（1990–2025 一軍例行賽，不含 TML、季後賽） ---------- */
const attendanceRows = [
 [180,899995],[180,1050405],[180,1238063],[270,1600549],[270,1607677],[300,1646361],[300,1364424],[336,685832],[315,690089],[278,496433],
 [180,301671],[180,337707],[180,532304],[300,958594],[300,1051602],[301,1019687],[300,679205],[300,612887],[298,572692],[240,898323],
 [240,645648],[240,719972],[240,583805],[240,1459072],[240,1225142],[240,1327639],[240,1409312],[240,1318275],[240,1309879],[240,1398243],
 [240,857435],[300,954087],[300,1471197],[300,1800130],[360,2766386],[360,3734429]
];
const championIds = ['dragons-old','lions','elephants','elephants','elephants','lions','lions','dragons-old','dragons-old','dragons-old','lions','elephants','elephants','elephants','bulls','bulls','lanew','lions','sevenlions','sevenlions','elephants','sevenlions','lamigo','sevenlions','lamigo','lamigo','rhinos','lamigo','lamigo','lamigo','sevenlions','brothers','brothers','dragons-new','brothers','rakuten'];
const seasonRecords = attendanceRows.map(([games, attendance], i) => ({
  year:1990 + i, games, attendance, average:Math.round(attendance / games), championId:championIds[i],
  note: i === 30 || i === 31 ? '受疫情影響有閉門賽，場均以全部場次計算。'
      : i === 9 ? '九二一地震影響，原訂 300 場，實際 278 場。'
      : i === 18 ? '受米迪亞事件影響，實際 298 場。'
      : [2,4,5].includes(i) ? '該年直接產生年度冠軍，未舉行總冠軍賽。' : ''
}));
const recordByYear = Object.fromEntries(seasonRecords.map(r => [r.year, r]));

/* ---------- 照片（CC BY 2.0，總統府） ---------- */
const photos = {
  chen2016:{title:'陳金鋒與桃園球場',caption:'桃園球場「陳金鋒日」開球活動。攝於 2016-06-11，不是 2006 年加盟當日。',author:'總統府',page:'https://commons.wikimedia.org/wiki/File:%E7%B8%BD%E7%B5%B1%E5%87%BA%E5%B8%AD%E9%99%B3%E9%87%91%E9%8B%92%E6%97%A5%E9%96%8B%E7%90%83%E5%8F%8A%E8%A7%80%E8%B3%9E%E7%90%83%E8%B3%BD_(26988598243).jpg',src:'{{PHOTO:chen2016}}'},
  lin2024:{title:'龍隊的跨世代陣容',caption:'2023 年總冠軍味全龍，於 2024-03-21 接見活動合影，非比賽照片。',author:'王育慶／總統府',page:'https://commons.wikimedia.org/wiki/File:03.21_%E7%B8%BD%E7%B5%B1%E5%81%95%E5%90%8C%E5%89%AF%E7%B8%BD%E7%B5%B1%E6%8E%A5%E8%A6%8B%E3%80%8C2023%E5%B9%B4%E4%B8%AD%E8%8F%AF%E8%81%B7%E6%A3%92%E7%B8%BD%E5%86%A0%E8%BB%8D%E5%91%B3%E5%85%A8%E9%BE%8D_%E3%80%8D_-_53601413670.jpg',src:'{{PHOTO:lin2024}}'},
  taiwan2024:{title:'臺灣隊長，冠軍之後',caption:'12 強奪冠後的接見活動，隊長陳傑憲致詞。攝於 2024 年 11 月，非冠軍戰當日。',author:'王育慶／總統府',page:'https://commons.wikimedia.org/wiki/File:2024.11.26_%E4%B8%AD%E8%8F%AF%E6%B0%91%E5%9C%8B%E7%B8%BD%E7%B5%B1%E6%8E%A5%E8%A6%8B%E3%80%8C2024%E5%B9%B4%E4%B8%96%E7%95%8C%E6%A3%92%E7%90%8312%E5%BC%B7%E8%B3%BD%E4%BB%A3%E8%A1%A8%E9%9A%8A%E3%80%8D_(54165913678).jpg',src:'{{PHOTO:taiwan2024}}'}
};

/* ---------- 九局故事 ----------
   每局任務完成後依序顯示的故事段落；顯示時球場切換到 step.year。 */
const innings = [
 {n:1, years:'1990', title:'開球', tagline:'一切從一萬四千人開始', steps:[
   {year:1990, focus:['lions','elephants'], html:`<p class="lede">1990 年 3 月 17 日，臺北市立棒球場。</p><p>看台上擠進了 <strong>1 萬 4350</strong> 人。旅日名將王貞治走上打擊區，為臺灣第一場職業棒球比賽揮下開幕的那一棒，蹲在本壘後方接球的，是聯盟會長唐盼盼。</p><p>那天的對手是統一獅與兄弟象。在那之前，臺灣人看棒球，多半是半夜守著電視看少棒、是國際賽；從那天起，棒球成了每個週末都能進場的日常。</p>`, event:'opening'},
   {year:1990, focus:['dragons-old','tigers'], html:`<p>第一年，只有四支球隊：<b>兄弟象</b>、<b>統一獅</b>、<b>味全龍</b>、<b>三商虎</b>。</p><p>他們打了 180 場例行賽，累計約 <strong>90 萬</strong>人次進場；元年的總冠軍，由味全龍拿下。</p><p class="aside">記住這四個名字。三十多年後，其中一支仍在、一支換了主人、一支解散後又回來，還有一支再也沒有回來。</p>`}
 ]},
 {n:2, years:'1993–1996', title:'擴張', tagline:'六隊時代與第一波高峰', steps:[
   {year:1993, focus:['bears','eagles'], html:`<p class="lede">1993 年，兩支新球隊走進球場：俊國熊與時報鷹。</p><p>中職從四隊變成六隊，全年場次從 180 場增加到 270 場。看台跟著熱起來，總進場人數第一次突破 <strong>160 萬</strong>。</p><p>1995 年，全年進場 164 萬 6361 人次。這個紀錄，要等到 <strong>28 年後</strong>的 2023 年才被打破。</p>`, event:'expansion'},
   {year:1996, focus:['bulls'], html:`<p>1996 年球季打到一半，俊國熊已經換成興農熊，6 月 7 日又改名 <b>興農牛</b>。</p><p>同一年、同一支球隊、兩個名字。年度名錄裡，它只算一隊。</p><p class="aside">這是第一次，球迷發現「我支持的球隊」可能會換名字、換老闆，卻還是同一支球隊。後面還會有很多次。</p>`, event:'bear-bull'}
 ]},
 {n:3, years:'1997', title:'風暴', tagline:'信任崩塌，聯盟分裂', steps:[
   {year:1997, focus:['eagles'], tone:'dark', html:`<p class="lede">1997 年，時報鷹多名球員因涉入簽賭放水，被移送偵辦。</p><p>史稱「<b>黑鷹事件</b>」，中華職棒史上第一宗涉賭放水案。球迷開始懷疑：眼前的比賽，是真的嗎？</p><p>看台空了。全年進場人數從 136 萬掉到 <strong>69 萬</strong>，平均每場不到 2,100 人。時報鷹在這一季後停止出賽，隔年解散。</p>`, event:'black-eagle'},
   {year:1997, focus:['sun-sampo','kong97','warrior97','thunder97','whalex'], html:`<p>同一年，另一個聯盟誕生了。</p><p><b>台灣大聯盟（TML）</b>以城市為名組成四支球隊：臺北太陽、臺中金剛、嘉南勇士、高屏雷公。中職也迎來新成員和信鯨。</p><p>一座島，兩個聯盟，<strong>十一支</strong>球隊。球員分散、球迷分散，資源也分散了。</p>`, event:'two-leagues'}
 ]},
 {n:4, years:'1999–2002', title:'寒冬', tagline:'只剩四隊的年代', steps:[
   {year:1999, focus:['dragons-old','tigers'], html:`<p class="lede">1999 年，味全龍完成總冠軍三連霸。</p><p>然後，它解散了。</p><p>同一個冬天，三商虎也宣布解散。兩支元年創始球隊，在第十個球季後一起離開。</p>`, event:'farewell'},
   {year:2000, focus:[], tone:'dark', html:`<p>2000 年，中職只剩四支球隊：兄弟象、統一獅、興農牛、和信鯨。</p><p>全年進場人數約 <strong>30 萬</strong>人次，平均每場不到 1,700 人，是中職史上最低的一年。</p><p>隔壁的 TML 也不好過。臺中的球隊六年內用過四個隊名：臺中金剛、中纖金剛、媚登峯金剛、宏碁金剛。</p>`},
   {year:2002, focus:['whales'], html:`<p>2002 年，和信鯨改名 <b>中信鯨</b>。</p><p class="aside">先記住這件事：十二年後會出現「中信兄弟」，但它和中信鯨不是同一支球隊。名字相似，不代表血緣相同。</p>`, event:'whale-name'}
 ]},
 {n:5, years:'2003–2004', title:'合流', tagline:'兩個聯盟，終於變回一個', steps:[
   {year:2003, focus:['first','macoto-sun'], merge:true, html:`<p class="lede">2003 年 1 月 13 日，兩聯盟簽下整合協議。</p><p>TML 解散，四支球隊兩兩整併，加入中職。剛剛那道題，連老球迷都常答錯。</p><p>名字會騙人：叫「金剛」的那隊，前身沒有臺中金剛；叫「太陽」的那隊，前身也沒有臺北太陽。太陽和金剛的名字，交換了位置。</p>`, event:'integration'},
   {year:2004, focus:['lanew','cobras'], html:`<p>隔年，兩支整併球隊都換上新面孔。</p><p>La New 接手第一金剛，變成 <b>La New熊</b>；誠泰從冠名企業變成經營者，太陽改名 <b>誠泰COBRAS</b>。</p><p>中職以六隊重新出發，全年進場人數重回百萬。</p>`, event:'new-owners'}
 ]},
 {n:6, years:'2006–2009', title:'再跌倒', tagline:'巨砲歸來，風暴又起', steps:[
   {year:2006, focus:['lanew'], photo:'chen2016', html:`<p class="lede">2006 年，陳金鋒回來了。</p><p>旅美返臺的「台灣巨砲」加入 La New熊，同一年球隊就拿下總冠軍。他在這支球隊一路打到 2016 年引退。</p>`, event:'chen-return'},
   {year:2008, focus:['dmedia','whales'], tone:'dark', html:`<p class="lede">2008 年，風暴再起。</p><p>接手誠泰的 <b>米迪亞暴龍</b>，因球團涉入簽賭事件，被聯盟除名。中信鯨也在季後解散。</p><p>2009 年，中職又回到四隊。從 1997 到 2008，十一年間兩度重傷，球迷一次又一次離開。</p>`, event:'contraction'}
 ]},
 {n:7, years:'2011–2013', title:'重新出發', tagline:'幸運第七局', stretch:true, steps:[
   {year:2011, focus:['lamigo'], html:`<p class="lede">2011 年，La New熊搬到桃園，改名 <b>Lamigo桃猿</b>。</p><p>新的城市、新的主場、新的應援方式。很多人第一次覺得：看棒球，可以像參加一場派對。</p>`, event:'lamigo-era'},
   {year:2013, focus:['rhinos'], html:`<p class="lede">2013 年季前，世界棒球經典賽在臺灣開打。</p><p>臺灣隊打出一場又一場動人的比賽，全島守在電視前。中央社後來回顧：這屆經典賽「拯救了中職因假球事件流失的球迷信心和票房」。</p><p>中職全年進場人數，從前一年的 58 萬，跳到 <strong>146 萬</strong>。</p>`, event:'wbc-2013'}
 ]},
 {n:8, years:'2014–2021', title:'換手', tagline:'球衣換了，看台上的人還在', steps:[
   {year:2014, focus:['brothers'], html:`<p class="lede">接下來幾年，老球隊一支一支換了主人。</p><p>2014 年，兄弟象變成 <b>中信兄弟</b>。2017 年，義大犀牛變成 <b>富邦悍將</b>。2020 年，Lamigo 變成 <b>樂天桃猿</b>。</p><p>名字變了，看台上揮著加油棒的人沒變。</p>`, event:'brothers-era'},
   {year:2021, focus:['dragons-new'], html:`<p class="lede">2021 年，龍回到一軍。</p><p>距離 1999 年解散整整 22 年。味全在 2019 年重新加盟，2020 年先打二軍，2021 年回到一軍舞台。</p><p>維持十二年的四隊格局，終於變成五隊。</p>`, event:'five-teams'}
 ]},
 {n:9, years:'2023–2026', title:'滿場', tagline:'比賽還在進行', steps:[
   {year:2023, focus:['dragons-new'], photo:'lin2024', html:`<p class="lede">2023 年 11 月 12 日，天母棒球場，台灣大賽第七戰。</p><p>味全龍 6 比 3 擊敗樂天桃猿，四勝三敗封王。重新加盟後的第三個一軍球季，龍拿下了總冠軍。上一次味全奪冠，是 24 年前。</p><p>同年 4 月，龍隊的林智勝敲出中職史上第一支生涯第 <strong>300</strong> 號全壘打。</p>`, event:'dragon-title'},
   {year:2024, focus:['tsg'], photo:'taiwan2024', html:`<p class="lede">2024 年，一切都變大了。</p><p><b>台鋼雄鷹</b>加入一軍，中職回到六隊，例行賽增加到 360 場，全年進場衝上 <strong>276 萬</strong>人次。</p><p>11 月 24 日，臺灣代表隊在東京巨蛋 4 比 0 擊敗日本，拿下 12 強冠軍。場上的球員來自每一支球隊。</p>`, event:'premier12'},
   {year:2025, focus:[], html:`<p class="lede">2025 年，中職全年進場 <strong>373 萬</strong>人次。</p><p>是 1990 年元年的四倍多，是 2000 年谷底的十二倍。</p><p>從一萬四千人的開幕戰，到一年三百多萬人次；從四支球隊、兩個聯盟，再到六支球隊——這座島和它的棒球，一起長大了。</p>`, event:'six-teams'},
   {year:2026, focus:[], html:`<p class="lede">2026 年，比賽還在進行。</p><p>六支球隊、六個主場，新的故事每天都在發生。這一頁，本站不預測結局。</p><p>九局打完了。接下來，換你自由探索：轉動年份，看看每一年的球場長什麼樣子。</p>`}
 ]}
];

/* ---------- 歷史挑戰題庫（每題對應一張球票） ---------- */
const quizQuestions = [
 {id:'q1',prompt:'中華職棒的第一個球季在哪一年開打？',options:['1989 年','1990 年','1993 年','1997 年'],answer:1,eventId:'opening',explanation:'聯盟在 1989 年 10 月成立，第一個球季則在 1990 年 3 月 17 日開打。'},
 {id:'q2',prompt:'1990 年開幕戰在哪座球場舉行？',options:['臺北市立棒球場','天母棒球場','桃園國際棒球場','臺北大巨蛋'],answer:0,eventId:'opening',explanation:'開幕戰在臺北市立棒球場舉行，湧進 1 萬 4350 名觀眾。'},
 {id:'q3',prompt:'1993 年加入中職的是哪兩隊？',options:['和信鯨、台鋼雄鷹','第一金剛、誠泰太陽','俊國熊、時報鷹','興農牛、義大犀牛'],answer:2,eventId:'expansion',explanation:'俊國熊與時報鷹加入，讓一軍從四隊變成六隊。'},
 {id:'q4',prompt:'1997 年重創中職人氣的「黑鷹事件」，主要涉案球員來自哪一隊？',options:['三商虎','時報鷹','味全龍','和信鯨'],answer:1,eventId:'black-eagle',explanation:'時報鷹多名球員涉入簽賭放水，被移送偵辦，球隊在 1998 年解散。'},
 {id:'q5',prompt:'1997 年中職與 TML 合計有幾支球隊？',options:['六隊','七隊','十隊','十一隊'],answer:3,eventId:'two-leagues',explanation:'中職七隊加上 TML 四隊，兩個獨立聯盟合計十一隊。'},
 {id:'q6',prompt:'2003 年整併後的「第一金剛」，前身是哪兩隊？',options:['臺中金剛與嘉南勇士','臺北太陽與高屏雷公','臺北太陽與臺中金剛','高屏雷公與嘉南勇士'],answer:1,eventId:'integration',explanation:'名字會騙人：臺北太陽與高屏雷公整併為第一金剛，臺中金剛反而併進了那魯灣太陽。'},
 {id:'q7',prompt:'中信兄弟直接承接的是哪支球隊？',options:['中信鯨','和信鯨','兄弟象','時報鷹'],answer:2,eventId:'brothers-era',explanation:'2014 年中信兄弟承接兄弟象；中信鯨是另一支在 2008 年解散的球隊。'},
 {id:'q8',prompt:'2013 年中職全年進場人數，和 2012 年相比大約如何？',options:['少了一半','差不多','大約翻倍','多了十倍'],answer:2,eventId:'wbc-2013',explanation:'從約 58 萬人次增加到約 146 萬人次，大約翻倍，經典賽熱潮是重要背景。'},
 {id:'q9',prompt:'味全龍 2019 年重新加盟後，哪一年重返一軍？',options:['2019 年','2020 年','2021 年','2024 年'],answer:2,eventId:'five-teams',explanation:'2019 加盟、2020 二軍、2021 一軍，是三個不同的時間點。'},
 {id:'q10',prompt:'2011 年 La New熊改成什麼隊名？',options:['樂天桃猿','Lamigo桃猿','義大犀牛','第一金剛'],answer:1,eventId:'lamigo-era',explanation:'2011 年改名 Lamigo桃猿並移師桃園；樂天的名字要到 2020 年才出現。'},
 {id:'q11',prompt:'2023 年台灣大賽總冠軍是哪支球隊？',options:['味全龍','樂天桃猿','富邦悍將','台鋼雄鷹'],answer:0,eventId:'dragon-title',explanation:'味全龍在第七戰以 6 比 3 獲勝，四勝三敗封王。'},
 {id:'q12',prompt:'2000 年中職一軍有幾支球隊？',options:['三隊','四隊','六隊','七隊'],answer:1,eventId:'farewell',explanation:'虎、龍在 1999 年季後解散，2000 年只剩兄弟、統一、興農、和信四隊。'},
 {id:'q13',prompt:'富邦悍將在 2017 年直接承接哪支球隊？',options:['俊國熊','興農牛','兄弟象','義大犀牛'],answer:3,eventId:'fubon-era',explanation:'義大犀牛在 2016 年季後轉由富邦經營。再往前追，則是興農牛與俊國熊。'},
 {id:'q14',prompt:'台鋼雄鷹首度參加一軍是哪一年？',options:['2022 年','2023 年','2024 年','2026 年'],answer:2,eventId:'six-teams',explanation:'2022 加盟、2023 二軍，2024 年首度登上一軍。'}
];
