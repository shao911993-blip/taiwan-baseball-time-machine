const fs=require('node:fs/promises');
const path=require('node:path');
async function main(){
  const dir=path.join(__dirname,'.tools');await fs.mkdir(dir,{recursive:true});
  const response=await fetch('https://registry.npmjs.org/@ffmpeg-installer/win32-x64/latest');
  if(!response.ok)throw Error('Registry HTTP '+response.status);
  const meta=await response.json();
  const url=new URL(meta.dist.tarball);
  if(url.hostname!=='registry.npmjs.org')throw Error('Unexpected registry host');
  const archive=await fetch(url);if(!archive.ok)throw Error('Archive HTTP '+archive.status);
  await fs.writeFile(path.join(dir,'ffmpeg-win32-x64.tgz'),Buffer.from(await archive.arrayBuffer()));
  console.log('Downloaded @ffmpeg-installer/win32-x64 '+meta.version);
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
