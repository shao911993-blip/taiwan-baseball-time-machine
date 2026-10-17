/* Download openly licensed grip photographs and retain their attribution. */
const fs = require('node:fs/promises');
const path = require('node:path');
const files = {fb:'Four-seam fastball 1.JPG', sl:'Slider 1.JPG', cb:'Curve 1.JPG', ch:'Circle change 1 (cropped).JPG'};
async function main(){
  const dir = path.join(__dirname,'assets','grips');
  await fs.mkdir(dir,{recursive:true});
  const titles=Object.values(files).map(f=>'File:'+f).join('|');
  const api=new URL('https://commons.wikimedia.org/w/api.php');
  api.search=new URLSearchParams({action:'query',format:'json',prop:'imageinfo',iiprop:'url|extmetadata',iiurlwidth:'800',titles});
  const response=await fetch(api,{signal:AbortSignal.timeout(20000)});
  if(!response.ok)throw Error('Commons metadata HTTP '+response.status);
  const pages=Object.values((await response.json()).query.pages);
  const credits={};
  for(const [id,file] of Object.entries(files)){
    const info=pages.find(p=>p.title==='File:'+file)?.imageinfo?.[0];
    if(!info)throw Error('Missing image '+file);
    const url=info.thumburl||info.url;
    const res=await fetch(url,{signal:AbortSignal.timeout(20000)});
    if(!res.ok || !res.headers.get('content-type')?.startsWith('image/'))throw Error('Photo HTTP '+res.status+' '+file);
    const bytes=Buffer.from(await res.arrayBuffer());
    await fs.writeFile(path.join(dir,id+'.jpg'),bytes);
    const meta=info.extmetadata;
    credits[id]={title:file,author:meta.Artist?.value.replace(/<[^>]*>/g,'').trim(),license:meta.LicenseShortName?.value,licenseUrl:meta.LicenseUrl?.value,source:info.descriptionurl,changes:'Downloaded Wikimedia thumbnail; displayed with CSS only.'};
    console.log(id+': '+bytes.length+' bytes, '+credits[id].license);
  }
  await fs.writeFile(path.join(dir,'credits.json'),JSON.stringify(credits,null,2));
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
