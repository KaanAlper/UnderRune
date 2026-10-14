import {describe,it,expect} from 'vitest';
import fs from 'node:fs';
import {loadSprites,runParity,type Dump,type TraceLine,type Replay} from './parity/reference';
import {GmRuntime} from '../src/remake/gm/runtime';
import {installNeoHost} from '../src/remake/host/neo';
import {setSourceText} from '../src/remake/host/text';
import {localizationDefaults} from '../tools/source-localization.mjs';

// Spamton NEO (Chapter 2, encounter 61) against the original game, frame by frame, from the battle's first frames
// to the end of a long local recording (party HP raised for the recording only, so it runs through many turns).
const RUN='.tools/oracle/ch2-61-s11-god',START=40;
const ready=fs.existsSync(`${RUN}-f${START}.json`)&&fs.existsSync(RUN+'.ndjson')&&fs.existsSync('extracted/chapter2_windows/sprites.json')&&fs.existsSync('extracted/chapter2_windows/code');
describe.skipIf(!ready)('Spamton NEO against the original (local recording)',()=>{
 it('matches every recorded frame',()=>{
  const code='extracted/chapter2_windows/code/';
  setSourceText(Object.assign({},...fs.readdirSync(code).filter(f=>f.endsWith('.gml')).map(f=>localizationDefaults(fs.readFileSync(code+f,'utf8')))));
  const trace=new Map<number,TraceLine>(fs.readFileSync(RUN+'.ndjson','utf8').trim().split('\n').map(l=>{const x=JSON.parse(l) as TraceLine;return [x.f,x];}));
  const replay=JSON.parse(fs.readFileSync(RUN+'.inputs.json','utf8')) as Replay,dump=JSON.parse(fs.readFileSync(`${RUN}-f${START}.json`,'utf8')) as Dump;
  const SPRITES:string[]=JSON.parse(fs.readFileSync('extracted/chapter2_windows/index.json','utf8')).sprites.map((s:{name:string})=>s.name);
  const line=trace.get(START)!,rt=new GmRuntime(loadSprites(2),{rng:line.rng});
  rt.globals=structuredClone(dump.globalVariables);
  const {objects}=installNeoHost(rt);
  const skipped=new Set<string>(),skippedIds=new Set<number>();
  for(const d of dump.instances){
   const def=objects[d.objectName];
   if(!def||['obj_mainchara','obj_darkcontroller','obj_overworldheart','obj_caterpillarchara','obj_gamecontroller','obj_time','obj_event_manager','obj_event_manager_debug','obj_jean_debug','obj_debugProfiler'].includes(d.objectName)){skipped.add(d.objectName);skippedIds.add(d.instanceId);continue;}
   const i=rt.restore(def,d.instanceId,d.x,d.y,d.selfVariables);
   i.depth=d.depth;i.sprite=d.sprite.name;i.imageIndex=d.sprite.imageIndex;i.imageSpeed=d.sprite.imageSpeed;
   i.imageXscale=d.scale.x;i.imageYscale=d.scale.y;i.imageAngle=d.angle;i.imageAlpha=d.alpha;i.imageBlend=d.blend;i.visible=d.visible;
   for(const [a,v] of Object.entries(d.alarms))i.alarm[Number(a)]=v;
  }
  rt.nextId=Math.max(...dump.instances.map(d=>d.instanceId))+1;
  // The snapshot keeps sprite variables (single or arrays, like NEO's partsprite) as sprite numbers; the remake uses names.
  const name=(v:unknown)=>typeof v==='number'&&SPRITES[v]?SPRITES[v]:v;
  for(const i of rt.instances)for(const k of Object.keys(i))if(/sprite/.test(k)&&k!=='sprite')i[k]=Array.isArray(i[k])?i[k].map(name):name(i[k]);
  const tracked=new Set(Object.keys(objects).filter(n=>!skipped.has(n)));
  const end=process.env.PARITY_END?Number(process.env.PARITY_END):Math.max(...trace.keys());
  if(process.env.PARITY_DEBUG)(globalThis as any).__parityRt=rt;
  // PARITY_RNG=from,to: who calls the random generator in those frames (stack excerpts).
  if(process.env.PARITY_RNG){
   const [from,to]=process.env.PARITY_RNG.split(',').map(Number),next=rt.random.next.bind(rt.random);
   rt.random.next=()=>{if(rt.frame>=from-START&&rt.frame<=to-START)console.log('rng@',rt.frame+START,new Error().stack!.split('\n').slice(2,5).map(l=>l.trim().replace(/\(.*[\\/]/,'(')).join(' < '));return next();};
  }
  const result=runParity(rt,trace,START,end,tracked,['hp','tension','turntimer','myfight','mnfight','inv'],skippedIds,replay);
  console.log(`ch2-61 ${START}-${end}`,result,'not restored:',[...skipped].join(' '));
  expect(result.mismatch).toBeUndefined();
 },300000);
});
