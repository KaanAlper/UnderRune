// Reproducible render/logic timings at dense points in every current Knight attack variant.
// Requires local reference snapshots and the development server on port 5173.
// The exact-frame replay helper includes a presentation readback in its Draw timing.
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const cases=[
 ['stars-0',340,400],['tracking-0',660,720],['flurry-0',1120,1180],['tunnel-0',1680,1740],
 ['rotating-0',1880,2140,2080],['stars-1',2500,2560],['flurry-1',3020,3080],['tunnel-3',3580,3640],
 ['vortex-tracking',4060,4120],['rotating-1',4400,4640,4580],['stars-2',5060,5120],['flurry-3',5540,5600],
 ['tracking-3',5940,6000],['tunnel-4',6420,6480],['rotating-2',6680,7040,6980],['roaring-charge',13420,13660,13600],['roaring-burst',13420,14140,14080],
];
const wanted=process.argv.slice(2),results=[];
for(const [name,start,end,measureFrom=start] of cases){
 if(wanted.length&&!wanted.includes(name))continue;
 const r=spawnSync(process.execPath,['tools/remake-frames.mjs','ch3-115-s11-god-zlong',String(end),`--start=${start}`,`--measure-from=${measureFrom}`,'--timing',`--out=.tools/knight-performance/${name}`],{cwd:root,encoding:'utf8',maxBuffer:4*1024*1024});
 const output=(r.stdout??'')+(r.stderr??'');
 if(r.status!==0){console.error(output);throw Error(`Knight profile ${name} failed (${r.status})`);}
 const lines=output.split(/\r?\n/).filter(l=>l.includes('frames, draw'));
 if(!lines.length||output.includes('page errors:'))throw Error(`Knight profile ${name} did not produce a clean measurement:\n${output}`);
 results.push({name,start,end,timing:lines});console.log(name+': '+lines.join(' | '));
}
fs.mkdirSync(path.join(root,'.tools/knight-performance'),{recursive:true});
fs.writeFileSync(path.join(root,'.tools/knight-performance',`summary-${Date.now()}.json`),JSON.stringify({date:new Date().toISOString(),cases:results},null,2));
