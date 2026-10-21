// Screenshots of the remake at chosen frames of a reference recording, for comparing its drawing with the original's
// (tools/native-frames.mjs takes the same frames from the original engine). The battle runs in the app's own canvas
// backend: it is opened from the menu (which loads its assets), then a separate runtime restores the recording's
// full snapshot and replays its inputs as the parity tests do (tests/parity/chapter2-runner.ts), drawing each frame.
// Requires the app dev server (npm run dev). Output: <out>/<run>-remake-f<frame>.png (default test-results/remake).
// --log=N prints frame N's drawing calls, each with the instance and event drawing it; --timing prints the time each
// attack's frames take to step and draw (average, 95th percentile, worst).
// Usage: node tools/remake-frames.mjs ch3-115-s11-god-zlong 1910,2110 [--start=1880] [--out=DIR] [--log=N]
import {chromium} from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const [run,frameList,...rest]=process.argv.slice(2);
if(!run||!frameList)throw Error('Usage: node tools/remake-frames.mjs <recording> <frame,frame,...> [--start=N] [--out=DIR]');
const option=name=>rest.find(a=>a.startsWith(`--${name}=`))?.split('=')[1];
const frames=frameList.split(',').map(Number).sort((a,b)=>a-b);
if(!frames.every(f=>Number.isInteger(f)&&f>0))throw Error('Frames must be positive whole numbers');
const match=/^ch(\d)-(\d+)-s(\d+)/.exec(run);if(!match)throw Error('Recording names start with ch<chapter>-<encounter>-s<seed>');
const [,chapterText,encounter]=match,chapter=Number(chapterText),id=`ch${chapter}-${encounter}`;
const oracle=path.join(root,'.tools','oracle',run);
// The latest full snapshot (every 20 frames) at or before the first frame, unless --start names one.
const snapshots=fs.readdirSync(path.dirname(oracle)).map(f=>new RegExp(`^${run}-f(\\d+)\\.json$`).exec(f)).filter(Boolean).map(m=>Number(m[1]));
const start=Number(option('start')??Math.max(...snapshots.filter(f=>f<=frames[0])));
if(!snapshots.includes(start))throw Error(`No snapshot ${run}-f${start}.json`);
const logFrame=Number(option('log')??-1),timing=rest.includes('--timing');
const measureFrom=Number(option('measure-from')??start);
const out=path.resolve(root,option('out')??path.join('test-results','remake'));fs.mkdirSync(out,{recursive:true});
const dump=JSON.parse(fs.readFileSync(`${oracle}-f${start}.json`,'utf8'));
const replay=JSON.parse(fs.readFileSync(`${oracle}.inputs.json`,'utf8'));
const trace=fs.readFileSync(`${oracle}.ndjson`,'utf8').split('\n').find(l=>l.startsWith(`{"f":${start},`));
if(!trace)throw Error(`The trace has no frame ${start}`);
const rng=JSON.parse(trace).rng;
const sprites=JSON.parse(fs.readFileSync(path.join(root,'extracted',`chapter${chapter}_windows`,'index.json'),'utf8')).sprites.map(s=>s.name);

const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH??'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',args:['--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1280,height:800}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:5173/?demo=1&dev=1&seed=11${rest.includes('--nostrict')?'&nostrict':''}`);
 await page.getByRole('button',{name:'DELTARUNE remote'}).click();await page.getByRole('button',{name:'Connect DELTARUNE'}).click();
 await page.getByRole('button',{name:'Connect device'}).click();await page.getByRole('button',{name:`Chapter ${chapter}`,exact:true}).click();
 await page.locator('#boss-select').selectOption(id);await page.getByRole('button',{name:new RegExp(`^Battle .* ${id}$`)}).click();
 await page.getByRole('button',{name:'START BATTLE'}).click();
 await page.waitForFunction(()=>window.__underrune?.inspect()?.rt?.gfx,null,{timeout:30000});
 const {shots,log,times}=await page.evaluate(async({chapter,dump,replay,rng,sprites,start,frames,logFrame,timing,measureFrom})=>{
  const app=window.__underrune.inspect();
  const {GmRuntime}=await import('/src/remake/gm/runtime.ts');
  const host=chapter===3?(await import('/src/remake/host/chapter3-bosses.ts')).installChapter3BossHost:(await import('/src/remake/host/chapter2-bosses.ts')).installChapter2BossHost;
  const rt=new GmRuntime(app.rt.bank,{rng});
  for(const k of ['textMetrics','sound','soundLoop','soundStop','soundPitch','soundGetPitch'])if(app.rt[k])rt[k]=app.rt[k];
  rt.globals=structuredClone(dump.globalVariables);
  const {objects}=host(rt,{room:app.rt.room.name});
  const canvas=document.createElement('canvas');canvas.width=640;canvas.height=480;
  const ctx=canvas.getContext('2d',{alpha:false});
  rt.gfx=new app.rt.gfx.constructor(ctx,app.rt.gfx.assets,rt.view);
  // As in the parity runner: the battle's own objects come back; the overworld's stay out.
  const WORLD=['obj_mainchara','obj_darkcontroller','obj_overworldheart','obj_caterpillarchara','obj_gamecontroller','obj_time','obj_event_manager','obj_event_manager_debug','obj_jean_debug','obj_debugProfiler'];
  for(const d of dump.instances){
   const def=objects[d.objectName];if(!def||WORLD.includes(d.objectName))continue;
   const i=rt.restore(def,d.instanceId,d.x,d.y,d.selfVariables);
   i.depth=d.depth;i.sprite=d.sprite.name;i.imageIndex=d.sprite.imageIndex;i.imageSpeed=d.sprite.imageSpeed;
   i.imageXscale=d.scale.x;i.imageYscale=d.scale.y;i.imageAngle=d.angle;i.imageAlpha=d.alpha;i.imageBlend=d.blend;i.visible=d.visible;
   for(const [a,v] of Object.entries(d.alarms))i.alarm[Number(a)]=v;
  }
  rt.nextId=Math.max(...dump.instances.map(d=>d.instanceId))+1;
  const name=v=>typeof v==='number'&&sprites[v]?sprites[v]:v,NOT_SPRITES=new Set(['dontshowherosprite','userealsprite']);
  for(const i of rt.instances)for(const k of Object.keys(i))if(/sprite/.test(k)&&k!=='sprite'&&!NOT_SPRITES.has(k))i[k]=Array.isArray(i[k])?i[k].map(name):name(i[k]);
  // What the snapshots leave out (the Knight's test restores the same): he bobs around his encounter place.
  for(const i of rt.instances){
   if(i.object.name==='obj_knight_enemy')i.ystart=rt.globals.monstermakey[i.myself];
   if(i.object.name==='obj_afterimage'&&i.fadeSpeed===0.02)i.hspeed=2;
  }
  const input=n=>{const e=replay[n];if(!e)return;for(const k of e.keysPressed){if(!rt.input.held.has(k))rt.input.pressed.add(k);rt.input.held.add(k);}for(const k of e.keysReleased){if(rt.input.held.has(k))rt.input.released.add(k);rt.input.held.delete(k);}};
  for(let n=0;n<start;n++)input(n);rt.input.pressed.clear();rt.input.released.clear();
  const times={},attack=()=>(rt.globals.mnfight===2?rt.globals.monsterattackname?.[0]:'menu')||'?',shots=[],log=[],last=Math.max(frames[frames.length-1],logFrame);let logging=false,drawing='';
  const run=rt.run.bind(rt);rt.run=(inst,event,...more)=>{const was=drawing;drawing=inst.object.name+' '+inst.id+' '+event;try{return run(inst,event,...more);}finally{drawing=was;}};
  const gfx=rt.gfx;for(const key of Object.getOwnPropertyNames(Object.getPrototypeOf(gfx)))if(key!=='constructor'&&typeof gfx[key]==='function'){const f=gfx[key].bind(gfx);gfx[key]=(...args)=>{if(logging)log.push(drawing+': '+key+' '+gfx.mode+(gfx.targetSurface===null?'':' surface '+gfx.targetSurface)+' '+JSON.stringify(args.map(a=>typeof a==='number'?Math.round(a*100)/100:typeof a==='function'?'fn':a)).slice(0,160));return f(...args);};}
  for(let frame=start;frame<=last;frame++){
   // The screen as the original shows it after this frame's Draw (main.ts renderRemakeFrame).
   ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#000';ctx.fillRect(0,0,640,480);
   const scale=640/rt.view.width;ctx.setTransform(scale,0,0,scale,0,0);logging=frame===logFrame;let t=performance.now();rt.draw();if(timing)ctx.getImageData(0,0,1,1);const drawn=performance.now()-t;logging=false;ctx.setTransform(1,0,0,1,0,0);
   if(frames.includes(frame))shots.push([frame,canvas.toDataURL('image/png')]);
   if(frame===last)break;
   input(frame);rt.globals.time=(rt.globals.time??0)+1;t=performance.now();rt.step();
   if(timing&&frame>=measureFrom)((times[attack()]??={draw:[],step:[]}).draw.push(drawn),times[attack()].step.push(performance.now()-t));
  }
  return {shots,log,times};
 },{chapter,dump,replay,rng,sprites,start,frames,logFrame,timing,measureFrom});
 const stat=list=>{const v=[...list].sort((a,b)=>a-b),avg=v.reduce((a,b)=>a+b,0)/v.length;return `avg ${avg.toFixed(2)} p95 ${v[Math.floor(v.length*0.95)].toFixed(1)} max ${v[v.length-1].toFixed(1)}`;};
 for(const [name,t] of Object.entries(times))console.log(`${name}: ${t.draw.length} frames, draw ${stat(t.draw)} ms, step ${stat(t.step)} ms`);
 if(log.length)console.log(log.join('\n'));
 for(const [frame,url] of shots){
  const file=path.join(out,`${run}-remake-f${frame}.png`);fs.writeFileSync(file,Buffer.from(url.split(',')[1],'base64'));console.log(file);
 }
 if(errors.length)console.log('page errors:',errors.join(' | '));
}finally{await browser.close();}
