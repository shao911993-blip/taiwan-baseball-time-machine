/* 把 src/ 的樣式、外殼、資料、程式與照片內嵌成單一 index.html。用法：node build.cjs */
const fs = require('node:fs');
const path = require('node:path');
const read = f => fs.readFileSync(path.join(__dirname, f), 'utf8');

const data = read('src/data.js').replace(/\{\{PHOTO:([\w-]+)\}\}/g, (_, id) => {
  const file = path.join(__dirname, 'assets/photos', id + '.jpg');
  return 'data:image/jpeg;base64,' + fs.readFileSync(file).toString('base64');
});
// app（球場模型、時光劇場、族譜、問答）→ eras（歷史長廊動畫）→ games（體驗館）→ museum（地圖與啟動），共用同一個作用域
const app = `(() => {\n'use strict';\n${['app', 'eras', 'games', 'museum'].map(f => read(`src/${f}.js`)).join('\n')}\n})();`
  .replace(/\{\{EMBLEM:ct\}\}/g, () => 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, 'assets/branding/ct-baseball-cutout.png')).toString('base64'))
  .replace(/\{\{VIDEO:cpbl21\}\}/g, () => 'data:video/mp4;base64,' + fs.readFileSync(path.join(__dirname, 'assets/videos/cpbl21-peng.mp4')).toString('base64'))
  .replace(/\{\{VIDEO_POSTER:cpbl21\}\}/g, () => 'data:image/jpeg;base64,' + fs.readFileSync(path.join(__dirname, 'assets/videos/cpbl21-poster.jpg')).toString('base64'))
  .replace(/\{\{GRIP:(fb|sl|cb|ch|si|ct|fs|sv)\}\}/g, (_, id) => 'data:image/jpeg;base64,' + fs.readFileSync(path.join(__dirname, 'assets/grips/illustrations', id + '.jpg')).toString('base64'))
  .replace(/\{\{PLAYER:(batter-v3|pitcher-front|first-base-v1|first-base-stadium-v1|pitcher-back-v1|batter-broadcast-v1|batter-broadcast-v2|batter-broadcast-steps-v1|batter-broadcast-steps-v2|pitching-stadium-v2|line-judge-stadium-v1|line-umpire-v1)\}\}/g, (_, id) => 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, 'assets/players', id + '.png')).toString('base64'));
const html = read('src/template.html')
  .replace('/*STYLES*/', () => read('src/styles.css') + '\n' + read('src/museum.css'))
  .replace('/*SHELL*/', () => read('src/shell.html'))
  .replace('/*DATA*/', () => data)
  .replace('/*APP*/', () => app);
fs.writeFileSync(path.join(__dirname, 'index.html'), html);
console.log('index.html 已產生：' + (Buffer.byteLength(html) / 1024).toFixed(0) + ' KB');
