// Publish an explicit asset allowlist; native game packages and extraction dumps never enter this build.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url))),out=path.join(root,'dist-pages'),app=path.join(out,'play');
const manifest=JSON.parse(await fs.readFile(path.join(root,'public/generated/manifest.json'),'utf8'));
const records=JSON.parse(await fs.readFile(path.join(root,'src/bosses/catalog.json'),'utf8'));
const theater=['0:spr_maincharad','0:ut_wordmark','1:IMAGE_LOGO','1:spr_krisd_dark','2:spr_cutscene_16_remote_control','3:spr_dw_tv_curtain','3:spr_tenna_spotlight'];
const names=new Set([...theater,...records.flatMap(r=>r.enemies.map(e=>r.chapter+':'+e.sprite)),...['spr_krisb_idle','spr_susieb_idle','spr_ralseib_idle'].map(n=>'1:'+n),'2:spr_noelleb_idle']);
const sprites=Object.fromEntries(Object.entries(manifest.sprites).filter(([key])=>names.has(key)).map(([key,s])=>[key,theater.includes(key)?s:{...s,frames:s.frames.slice(0,1)}]));
const published={version:1,sprites,font:manifest.font,utFont:manifest.utFont,music:['joker','lancerfight','battle','checkers','kingboss','spamton_neo_mix_ex_wip','spamton_neo_meeting','spamton_happy'],sourcePackages:[]};
const urls=new Set([...Object.values(sprites).flatMap(s=>s.frames.map(f=>f.url)),published.font.url,...(published.utFont?[published.utFont.url]:[]),...published.music.map(n=>'/generated/music/'+n+'.ogg')]);
for(const url of urls){
 const rel=url.replace(/^\//,''),source=path.resolve(root,'public',rel),target=path.resolve(app,rel);
 if(!source.startsWith(path.join(root,'public')+path.sep)||!target.startsWith(app+path.sep))throw Error('Asset escapes build root: '+url);
 await fs.mkdir(path.dirname(target),{recursive:true});await fs.copyFile(source,target);
}
await fs.copyFile(path.join(root,'public/generated/equipment.json'),path.join(app,'generated/equipment.json'));
await fs.writeFile(path.join(app,'generated/manifest.json'),JSON.stringify(published));
await fs.cp(path.join(root,'public/generated/remake/ch1'),path.join(app,'generated/remake/ch1'),{recursive:true});
await fs.cp(path.join(root,'public/generated/remake/ch2'),path.join(app,'generated/remake/ch2'),{recursive:true});
await fs.copyFile(path.join(root,'public/favicon.svg'),path.join(app,'favicon.svg'));
await fs.copyFile(path.join(root,'site/index.html'),path.join(out,'index.html'));await fs.writeFile(path.join(out,'.nojekyll'),'');
console.log(`Pages: theater, ${Object.keys(sprites).length} menu sprites, equipment catalog, Chapter 1's Lancer (both), Clover, K.Round (both), Jevil and King, and normal Spamton NEO. Native files excluded.`);
