const fs=require('node:fs');let h=fs.readFileSync('index.html','utf8');
h=h.replace("const row=Math.floor(i/32),col=i%32,t=(col+.5)/32", "const seat=(i*97)%224,row=Math.floor(seat/32),col=seat%32,t=(col+.5)/32");
h=h.replace("stopPitch();if(e.matches&&walk.moving)","stopPitch();if(e.matches)settleFilmCounter();if(e.matches&&walk.moving)");
h=h.replace("cursor.setAttribute('x1',20+(state.year-1990)*860/35);cursor.setAttribute('x2',20+(state.year-1990)*860/35);", "cursor.style.transform='translateX('+((state.year-1990)*860/35)+'px)';");
h=h.replace('隊伍圖案為年度名錄示意。觀眾資料不含 TML','隊伍進退場比較前一幕名錄，不代表精確加盟或解散日期。觀眾資料不含 TML');
h=h.replace('</style>','.film-trend .trend-cursor{transition:transform .65s ease,opacity .2s;transform-box:view-box}\n</style>');
fs.writeFileSync('index.html',h);
