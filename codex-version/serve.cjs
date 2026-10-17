/* No dependencies. Serves only the single-file website on the local computer. */
const http=require('node:http');
const fs=require('node:fs/promises');
const path=require('node:path');
const {spawn}=require('node:child_process');
const APP_ID='taiwan-baseball-time-machine';

function createSiteServer(){
 return http.createServer(async(req,res)=>{
  const port=res.socket.localPort;
  const hosts=new Set(['127.0.0.1:'+port,'localhost:'+port]);
  const headers={'Referrer-Policy':'strict-origin-when-cross-origin','X-Content-Type-Options':'nosniff','Cache-Control':'no-store'};
  const reply=(status,type,body)=>{const data=Buffer.from(body);res.writeHead(status,{...headers,'Content-Type':type,'Content-Length':data.length});res.end(req.method==='HEAD'?undefined:data);};
  if(!hosts.has(req.headers.host)){reply(403,'text/plain; charset=utf-8','Local access only.');return;}
  if(!['GET','HEAD'].includes(req.method)){res.setHeader('Allow','GET, HEAD');reply(405,'text/plain; charset=utf-8','Method not allowed.');return;}
  // Explicit routes avoid exposing project files, directories or credentials.
  const route=req.url.split('?')[0];
  if(route==='/__baseball_health'){reply(200,'application/json; charset=utf-8',JSON.stringify({app:APP_ID,url:'http://127.0.0.1:'+port+'/'}));return;}
  if(route!=='/'&&route!=='/index.html'){reply(404,'text/plain; charset=utf-8','Not found.');return;}
  try{const html=await fs.readFile(path.join(__dirname,'index.html'));reply(200,'text/html; charset=utf-8',html);}
  catch{reply(500,'text/plain; charset=utf-8','Could not read index.html.');}
 });
}

async function startSiteServer({port=4173,open=false}={}){
 if(!Number.isInteger(port)||port<1024||port>65535)throw new Error('Port must be an integer from 1024 to 65535.');
 let server;
 for(let attempt=0;attempt<10;attempt++){
  const candidate=port+attempt;if(candidate>65535)break;
  server=createSiteServer();
  try{await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(candidate,'127.0.0.1',()=>{server.removeListener('error',reject);resolve();});});break;}
  catch(error){server=null;if(error.code!=='EADDRINUSE')throw error;}
 }
 if(!server)throw new Error('No available local port. Close an earlier website window and retry.');
 const url='http://127.0.0.1:'+server.address().port+'/#ballpark';
 console.log('\n臺灣職棒時光機已啟動\n'+url+'\n\n請保留此視窗；按 Ctrl+C 關閉。影片需要網路，網站未公開到網際網路。\n');
 if(open&&process.platform==='win32'){
  const browser=spawn('rundll32.exe',['url.dll,FileProtocolHandler',url],{windowsHide:true,detached:true,stdio:'ignore'});
  browser.on('error',()=>console.log('請複製上方網址至瀏覽器開啟。'));browser.unref();
 }
 return server;
}

module.exports={createSiteServer,startSiteServer};
if(require.main===module){
 const at=process.argv.indexOf('--port');
 startSiteServer({port:at<0?4173:Number(process.argv[at+1]),open:process.argv.includes('--open')})
 .then(server=>{process.once('SIGINT',()=>server.close(()=>process.exit(0)));})
 .catch(error=>{console.error(error.message);process.exitCode=1;});
}
