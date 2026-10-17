const fs=require('node:fs');let h=fs.readFileSync('index.html','utf8');
h=h.replace("$('#film-lineup').innerHTML=roster.map((t,i)=>token(t,i)).join('')+", "$('#film-lineup').innerHTML='<span class=\"film-league-label cpbl-field-label\">CPBL</span>'+(tm?'<span class=\"film-league-label tml-field-label\">TML · 獨立聯盟</span>':'')+roster.map((t,i)=>token(t,i)).join('')+");
h=h.replace("'1990–2025 · 點曲線年份跳轉';\n const chapter=", "'1990–2025 · 點曲線年份跳轉';if(record?.note)$('#film-comparison').textContent+=' · '+record.note;\n const chapter=");
h=h.replace('</style>','.film-league-label{position:absolute;font:8px monospace;letter-spacing:1px;color:#f5e6bc;background:#193b2ebf;padding:2px 5px;border-radius:2px}.cpbl-field-label{left:15%;top:50%}.tml-field-label{left:20%;top:65%}@media(max-width:600px){.film-league-label{font-size:5px;padding:1px 3px}}\n</style>');
fs.writeFileSync('index.html',h);
