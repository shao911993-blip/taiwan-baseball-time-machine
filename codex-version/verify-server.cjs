const assert=require('node:assert/strict');
const {once}=require('node:events');
const fs=require('node:fs/promises');
const http=require('node:http');
const {createSiteServer,startSiteServer}=require('./serve.cjs');
let checks=0;
function equal(a,b,label){assert.deepEqual(a,b,label);checks++;}
async function request(port,route='/',{method='GET',host='127.0.0.1:'+port}={}){
 return new Promise((resolve,reject)=>{
  const req=http.request({hostname:'127.0.0.1',port,path:route,method,headers:{Host:host},timeout:5000},res=>{const chunks=[];res.on('data',c=>chunks.push(c));res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,body:Buffer.concat(chunks)}));});
  req.on('error',reject);req.on('timeout',()=>req.destroy(new Error('HTTP test timed out')));req.end();
 });
}
async function close(server){if(server)await new Promise(resolve=>{server.close(resolve);server.closeAllConnections();});}
(async()=>{
 const server=createSiteServer();let fallback;
 try{
  server.listen(0,'127.0.0.1');await once(server,'listening');const port=server.address().port;
  equal(server.address().address,'127.0.0.1','server listens only on loopback');
  const home=await request(port);equal(home.status,200,'homepage available');
  equal(home.body,await fs.readFile('index.html'),'HTTP serves exact current HTML bytes');
  equal(home.headers['content-type'],'text/html; charset=utf-8','correct HTML encoding');
  equal(home.headers['referrer-policy'],'strict-origin-when-cross-origin','server preserves cross-origin referrer');
  equal(home.headers['cache-control'],'no-store','reload uses current source');
  const head=await request(port,'/index.html',{method:'HEAD'});
  equal(head.status,200,'HEAD supported');equal(head.body.length,0,'HEAD has no body');equal(Number(head.headers['content-length']),home.body.length,'HEAD length matches GET');
  equal((await request(port,'/?from=test')).status,200,'query string on homepage supported');
  equal((await request(port,'/index.html',{host:'localhost:'+port})).status,200,'localhost Host supported');
  const health=JSON.parse((await request(port,'/__baseball_health')).body.toString());
  equal(health.app,'taiwan-baseball-time-machine','health identifies this app');
  equal(health.url,'http://127.0.0.1:'+port+'/','health reports actual port');
  for(const route of ['/README.md','/SPECIFICATION.md','/.git/config','/../index.html','/%2e%2e/index.html','/assets/photos/metadata.json','/missing'])equal((await request(port,route)).status,404,'does not expose project route '+route);
  equal((await request(port,'/',{method:'POST'})).status,405,'no write methods');
  equal((await request(port,'/',{host:'example.com'})).status,403,'foreign Host rejected');
  fallback=await startSiteServer({port});equal(fallback.address().port>port,true,'occupied port falls back');
  equal((await request(fallback.address().port)).status,200,'fallback actually serves website');
  for(const invalid of [0,-1,80,65536,NaN,4173.5]){await assert.rejects(()=>startSiteServer({port:invalid}));checks++;}
  console.log('PASS: '+checks+' real HTTP server checks. Browser-to-YouTube playback is not simulated.');
 }finally{await close(fallback);await close(server);}
})().catch(error=>{console.error(error);process.exitCode=1;});
