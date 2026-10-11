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
 const skipped=new Set<string>();
 for(const d of dump.instances){
  const def=byName.get(d.objectName);if(!def){skipped.add(d.objectName);continue;}
  const i=rt.restore(def,d.instanceId,d.x,d.y,d.selfVariables);
  i.depth=d.depth;i.sprite=d.sprite.name;i.imageIndex=d.sprite.imageIndex;i.imageSpeed=d.sprite.imageSpeed;
  i.imageXscale=d.scale.x;i.imageYscale=d.scale.y;i.imageAngle=d.angle;i.imageAlpha=d.alpha;i.imageBlend=d.blend;i.visible=d.visible;
  for(const [a,v] of Object.entries(d.alarms))i.alarm[Number(a)]=v;
 }
 rt.nextId=Math.max(...dump.instances.map(d=>d.instanceId))+1;
 return {rt,skipped};
}

export type Mismatch={frame:number;what:string};
/** Compares the remake with the reference after a frame: tracked objects in creation order, random state, globals. */
export function compareFrame(rt:GmRuntime,line:TraceLine,tracked:Set<string>,globals:string[]):Mismatch|undefined{
 const ref=line.o.filter(o=>tracked.has(o[1]));
 const ours=rt.instances.filter(i=>i.live&&tracked.has(i.object.name));
 for(const name of tracked){
  const r=ref.filter(o=>o[1]===name),m=ours.filter(i=>i.object.name===name);
  if(r.length!==m.length)return {frame:line.f,what:`${name}: ${m.length} instances, reference has ${r.length}`};
  for(let k=0;k<r.length;k++){
   const [id,,x,y,img]=r[k],o:GmInstance=m[k];
   if(Math.abs(o.x-x)>=0.01||Math.abs(o.y-y)>=0.01)return {frame:line.f,what:`${name} #${k} (ref id ${id}): position ${o.x},${o.y} vs ${x},${y}`};
   if(Math.abs(o.imageIndex-img)>=1e-4)return {frame:line.f,what:`${name} #${k} (ref id ${id}): image ${o.imageIndex} vs ${img}`};
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
export function runParity(rt:GmRuntime,trace:Map<number,TraceLine>,start:number,end:number,tracked:Set<string>,globals:string[]){
 let frame=start;
 for(;frame<end;frame++){
  rt.draw();rt.step();
  const line=trace.get(frame+1);if(!line)break;
  const bad=compareFrame(rt,line,tracked,globals);
  if(bad)return {matched:frame-start,mismatch:bad};
  if(rt.pendingRoom)return {matched:frame+1-start,mismatch:undefined,room:rt.pendingRoom};
 }
 return {matched:frame-start,mismatch:undefined};
}
