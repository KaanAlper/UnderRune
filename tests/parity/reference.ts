// Loads locally recorded reference runs (npm run oracle) and restores them into the remake runtime.
// The recordings and the sprite table come from the maintainer's own game install and never leave this machine.
import fs from 'node:fs';
import {GmRuntime,type GmObjectDef,type GmInstance} from '../../src/remake/gm/runtime';
import {spriteBank,type SpriteBank} from '../../src/remake/gm/sprites';

export type TraceObject=[id:number,object:string,x:number,y:number,imageIndex:number,sprite:string,visible:boolean];
export type TraceLine={f:number;room:string;rng:number[];g:Record<string,any>;o:TraceObject[]};
type DumpInstance={instanceId:number;objectName:string;x:number;y:number;depth:number;sprite:{name:string|null;imageIndex:number;imageSpeed:number};
 scale:{x:number;y:number};angle:number;alpha:number;blend:number;visible:boolean;alarms:Record<string,number>;selfVariables:Record<string,unknown>};
export type Dump={frame:number;room:{name:string};instances:DumpInstance[];globalVariables:Record<string,any>};

const oracle=(name:string)=>`.tools/oracle/${name}`;
export function hasReference(id:string,seed:number,frame:number,chapter:number){
 return fs.existsSync(oracle(`${id}-s${seed}.ndjson`))&&fs.existsSync(oracle(`${id}-s${seed}-f${frame}.json`))&&fs.existsSync(`extracted/chapter${chapter}_windows/sprites.json`);
}
export function loadTrace(id:string,seed:number){
 return new Map<number,TraceLine>(fs.readFileSync(oracle(`${id}-s${seed}.ndjson`),'utf8').trim().split('\n').map(l=>{const x=JSON.parse(l) as TraceLine;return [x.f,x];}));
}
export const loadDump=(id:string,seed:number,frame:number)=>JSON.parse(fs.readFileSync(oracle(`${id}-s${seed}-f${frame}.json`),'utf8')) as Dump;
export const loadSprites=(chapter:number):SpriteBank=>spriteBank(JSON.parse(fs.readFileSync(`extracted/chapter${chapter}_windows/sprites.json`,'utf8')));

/** A runtime holding the snapshot's instances of the given objects, its globals and the trace's random state. */
export function restoreScene(bank:SpriteBank,dump:Dump,line:TraceLine,objects:GmObjectDef[]){
 const byName=new Map(objects.map(o=>[o.name,o]));
 const rt=new GmRuntime(bank,{rng:line.rng});
 rt.globals=structuredClone(dump.globalVariables);
 const skipped=new Set<string>(),skippedIds=new Set<number>();
 for(const d of dump.instances){
  const def=byName.get(d.objectName);if(!def){skipped.add(d.objectName);skippedIds.add(d.instanceId);continue;}
  const i=rt.restore(def,d.instanceId,d.x,d.y,d.selfVariables);
  i.depth=d.depth;i.sprite=d.sprite.name;i.imageIndex=d.sprite.imageIndex;i.imageSpeed=d.sprite.imageSpeed;
  i.imageXscale=d.scale.x;i.imageYscale=d.scale.y;i.imageAngle=d.angle;i.imageAlpha=d.alpha;i.imageBlend=d.blend;i.visible=d.visible;
  for(const [a,v] of Object.entries(d.alarms))i.alarm[Number(a)]=v;
 }
 rt.nextId=Math.max(...dump.instances.map(d=>d.instanceId))+1;
 return {rt,skipped,skippedIds};
}

export type Mismatch={frame:number;what:string};
export type Replay=Record<number,{keysPressed:number[];keysReleased:number[]}>;
/** Replay indices are sampled before Runner_step; index N produces traced frame N+1. */
export function replayInput(rt:GmRuntime,replay:Replay,frame:number){
 const entry=replay[frame];if(!entry)return;
 for(const key of entry.keysPressed){if(!rt.input.held.has(key))rt.input.pressed.add(key);rt.input.held.add(key);}
 for(const key of entry.keysReleased){if(rt.input.held.has(key))rt.input.released.add(key);rt.input.held.delete(key);}
}
/** Compares the remake with the reference after a frame: tracked objects in creation order, random state, globals. */
export function compareFrame(rt:GmRuntime,line:TraceLine,tracked:Set<string>,globals:string[],skippedIds=new Set<number>()):Mismatch|undefined{
 // Instances the snapshot had but the remake did not restore (scene objects outside the battle) are not compared.
 const ref=line.o.filter(o=>tracked.has(o[1])&&!skippedIds.has(o[0]));
 const ours=rt.instances.filter(i=>i.live&&tracked.has(i.object.name));
 for(const name of tracked){
  const r=ref.filter(o=>o[1]===name),m=ours.filter(i=>i.object.name===name);
  if(r.length!==m.length)return {frame:line.f,what:`${name}: ${m.length} instances, reference has ${r.length}`};
  for(let k=0;k<r.length;k++){
   const [id,,x,y,img,sprite,visible]=r[k],o:GmInstance=m[k];
   if(Math.abs(o.x-x)>=0.01||Math.abs(o.y-y)>=0.01)return {frame:line.f,what:`${name} #${k} (ref id ${id}): position ${o.x},${o.y} vs ${x},${y}`};
   if(Math.abs(o.imageIndex-img)>=1e-4)return {frame:line.f,what:`${name} #${k} (ref id ${id}): image ${o.imageIndex} vs ${img}`};
   if((o.sprite??'')!==(sprite??''))return {frame:line.f,what:`${name} #${k} (ref id ${id}): sprite ${o.sprite} vs ${sprite}`};
   if(o.visible!==visible)return {frame:line.f,what:`${name} #${k} (ref id ${id}): visible ${o.visible} vs ${visible}`};
  }
 }
 const rng=rt.random.snapshot();
 if(rng.some((v,k)=>v!==line.rng[k]))return {frame:line.f,what:`random state differs (index ${rng[0]} vs ${line.rng[0]})`};
 for(const g of globals){
  const a=JSON.stringify(rt.globals[g]),b=JSON.stringify(line.g[g]);
  if(a!==b&&!(typeof line.g[g]==='number'&&Math.abs(rt.globals[g]-line.g[g])<1e-9))return {frame:line.f,what:`global.${g} ${a} vs ${b}`};
 }
 return undefined;
}

/** Runs the remake from `start` (a snapshot frame: after its step, before its draw) to `end`, stopping at the first mismatch. */
export function runParity(rt:GmRuntime,trace:Map<number,TraceLine>,start:number,end:number,tracked:Set<string>,globals:string[],skippedIds=new Set<number>(),replay?:Replay){
 if(replay){for(let n=0;n<start;n++)replayInput(rt,replay,n);rt.input.pressed.clear();rt.input.released.clear();}
 let frame=start;
 for(;frame<end;frame++){
  rt.draw();if(replay)replayInput(rt,replay,frame);rt.step();
  const line=trace.get(frame+1);if(!line)return {matched:frame-start,mismatch:{frame:frame+1,what:'Missing reference frame '+(frame+1)}};
  const bad=compareFrame(rt,line,tracked,globals,skippedIds);
  if(bad)return {matched:frame-start,mismatch:bad};
  if(rt.pendingRoom)return {matched:frame+1-start,mismatch:undefined,room:rt.pendingRoom};
 }
 return {matched:frame-start,mismatch:undefined};
}
