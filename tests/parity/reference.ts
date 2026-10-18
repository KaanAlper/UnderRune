// Loads locally recorded reference runs (npm run oracle) and restores them into the remake runtime.
// The recordings and the sprite table come from the maintainer's own game install and never leave this machine.
import fs from 'node:fs';
import {GML_RENAMED,GmRuntime,STRUCT_ID,type GmObjectDef,type GmInstance} from '../../src/remake/gm/runtime';
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
  // An unset global is null in the recording.
  const a=JSON.stringify(rt.globals[g]??null),b=JSON.stringify(line.g[g]??null);
  if(a!==b&&!(typeof line.g[g]==='number'&&Math.abs(rt.globals[g]-line.g[g])<1e-9))return {frame:line.f,what:`global.${g} ${a} vs ${b}`};
 }
 return undefined;
}

/** PARITY_TRAP=object,frame,field: logs who writes the field of that object's instances from the Draw before that
 * frame through its step. */
function trapField(rt:GmRuntime,frame:number,spec:string){
 const [name,at,field]=spec.split(',');if(Number(at)!==frame)return;
 for(const i of rt.instances.filter(i=>i.live&&i.object.name===name)){
  const proto=Object.getPrototypeOf(i),desc=Object.getOwnPropertyDescriptor(proto,field);let own=(i as any)[field];
  Object.defineProperty(i,field,{configurable:true,get:()=>desc?.get?desc.get.call(i):own,set:v=>{console.log('TRAP',name,field,'=',v,new Error().stack?.split(String.fromCharCode(10)).slice(2,7).join(' | '));if(desc?.set)desc.set.call(i,v);else own=v;}});
 }
}
/** Runs the remake from `start` (a snapshot frame: after its step, before its draw) to `end`, stopping at the first mismatch. */
/** afterFrame: runs after each matching frame (for checks that need more than the trace, like full dumps); a
 * mismatch it returns stops the run there. */
export function runParity(rt:GmRuntime,trace:Map<number,TraceLine>,start:number,end:number,tracked:Set<string>,globals:string[],skippedIds=new Set<number>(),replay?:Replay,afterFrame?:(frame:number)=>Mismatch|undefined){
 if(replay){for(let n=0;n<start;n++)replayInput(rt,replay,n);rt.input.pressed.clear();rt.input.released.clear();}
 let frame=start;
 for(;frame<end;frame++){
  // obj_time (a world object, not restored) counts global.time in its Begin Step.
  // The trap covers the previous frame's Draw and this frame's step.
  if(process.env.PARITY_TRAP)trapField(rt,frame+1,process.env.PARITY_TRAP);
  rt.draw();if(replay)replayInput(rt,replay,frame);rt.globals.time=(rt.globals.time??0)+1;
  rt.step();
  if(process.env.PARITY_DEBUG){const watch=process.env.PARITY_DEBUG.split(','),m=rt.instances.filter(i=>i.live&&watch.includes(i.object.name));console.log(frame+1,'mnfight',rt.globals.mnfight,'myfight',rt.globals.myfight,'pressed',[...rt.input.pressed].join(),m.map(i=>i.object.name+':'+JSON.stringify(Object.fromEntries((process.env.PARITY_VARS??'').split(',').filter(k=>k in i).map(k=>[k,i[k]])))).join(' '));}
  const line=trace.get(frame+1);if(!line)return {matched:frame-start,mismatch:{frame:frame+1,what:'Missing reference frame '+(frame+1)}};
  // scr_endcombat: the game hands over to obj_endbattle (the walk back to the room); the remake ends the battle there.
  if(rt.pendingRoom==='battle_end')return line.o.some(o=>o[1]==='obj_endbattle')?{matched:frame+1-start,mismatch:undefined,room:rt.pendingRoom}:{matched:frame-start,mismatch:{frame:frame+1,what:'the battle ended early'}};
  const bad=compareFrame(rt,line,tracked,globals,skippedIds)??afterFrame?.(frame+1);
  if(bad)return {matched:frame-start,mismatch:bad};
  if(rt.pendingRoom)return {matched:frame+1-start,mismatch:undefined,room:rt.pendingRoom};
 }
 return {matched:frame-start,mismatch:undefined};
}

/** The resource numbers the original keeps where the remake keeps names (sprites, sounds, fonts, objects, and
 * functions in the reference runtime's numbering: tools/extract-script-index.mjs). */
export type ResourceIndex={sprites:string[];sounds:string[];fonts:string[];objects:string[];functions:string[]};
export function loadResources(chapter:number):ResourceIndex{
 const i=JSON.parse(fs.readFileSync(`extracted/chapter${chapter}_windows/index.json`,'utf8'));
 const names=(a:any[])=>a.map(x=>typeof x==='string'?x:x.name as string);
 const functions=`extracted/chapter${chapter}_windows/functions.json`;
 return {sprites:names(i.sprites),sounds:names(i.sounds),fonts:names(i.fonts),objects:names(i.objects),functions:fs.existsSync(functions)?JSON.parse(fs.readFileSync(functions,'utf8')):[]};
}
/** The runtime's own fields on an instance (its built-ins are stored under names starting with $); every other own
 * property is a GML instance variable. */
const RUNTIME_FIELDS=new Set(['path_index','path_speed','path_position','path_positionprevious','path_scale','path_orientation','path_endaction','path_xstart','path_ystart','outsideRoom','xprevious','yprevious','xstart','ystart','imageAngle','imageBlend','mask','visible','live','frameCount','layerEntry','alarm','id','object']);
/** Whether a remake value stands for the reference's value: numbers within GML's tolerance, booleans as 0/1,
 * resource names as their numbers, objects and instances as their indices and ids, arrays element by element. */
function sameValue(ours:unknown,ref:unknown,res:ResourceIndex,gone:(id:number)=>boolean=()=>false):boolean{
 if(Array.isArray(ref)){const a=ours;return Array.isArray(a)&&a.length===ref.length&&ref.every((v,k)=>sameValue(a[k],v,res,gone));}
 // The reference runtime turns a variable holding a self/other reference into noone (-4) when that instance is
 // destroyed; the remake keeps the number of the instance that is gone.
 if(ref===-4&&typeof ours==='number'&&ours>=100000&&gone(ours))return true;
 if(typeof ref==='number'){
  if(typeof ours==='boolean')ours=ours?1:0;
  if(typeof ours==='number')return ours===ref||Math.abs(ours-ref)<=1e-5*Math.max(1,Math.abs(ref));
  if(typeof ours==='string'){
   // Sprites made from surfaces are named after the sprite number they take (host/surfaces.ts).
   const made=/^__newsprite(\d+)$/.exec(ours);if(made)return Number(made[1])===ref;
   return [res.sprites,res.sounds,res.fonts,res.objects,res.functions].some(list=>list.indexOf(ours as string)===ref);
  }
  // A delayed script is kept as the function standing for that GML script.
  if(typeof ours==='function'){const name=(ours as {gmlName?:string}).gmlName;return name!==undefined&&res.functions.indexOf(name)===ref;}
  if(ours&&typeof ours==='object'){const o=ours as {index?:number;id?:number};return o.index===ref||o.id===ref;}
  return false;
 }
 if(ref===null||ref===undefined)return ours===null||ours===undefined;
 // A struct is dumped by its number only.
 if(typeof ref==='string'){const m=/^<struct:(\d+)>$/.exec(ref);if(m)return !!ours&&typeof ours==='object'&&(ours as {[STRUCT_ID]?:number})[STRUCT_ID]===Number(m[1]);}
 // GML booleans are the numbers 0 and 1 (the reference runtime keeps the bool type, so its dumps say true/false).
 if(typeof ref==='boolean')return ours===ref||ours===(ref?1:0);
 return ours===ref;
}
const show=(v:unknown)=>{const s=v&&typeof v==='object'&&!Array.isArray(v)?STRUCT_ID in v?`<struct:${(v as any)[STRUCT_ID]}>`:`<${(v as any).name??(v as any).id??'object'}>`:JSON.stringify(v);return (s??String(v)).slice(0,80);};
/** Compares every variable of the checked objects' instances with a full reference dump (taken after the same frame's
 * step): built-ins, alarms and instance variables, missing and extra ones included. Instances are paired in creation
 * order per object, as in compareFrame. Returns one line per difference. */
export function compareState(rt:GmRuntime,dump:Dump,checked:Set<string>,res:ResourceIndex,skippedIds=new Set<number>(),ignore:Readonly<Record<string,readonly string[]>>={}):string[]{
 // A missing number is not automatically an instance reference: only integer ids in the allocated range can
 // represent a destroyed instance. Future ids and fractional values must still report a mismatch.
 const problems:string[]=[],gone=(id:number)=>Number.isSafeInteger(id)&&id>=100000&&id<rt.nextId&&!rt.byId(id);
 for(const name of checked){
  const ref=dump.instances.filter(d=>d.objectName===name&&!skippedIds.has(d.instanceId)),ours=rt.instances.filter(i=>i.live&&i.object.name===name);
  if(ref.length!==ours.length){problems.push(`${name}: ${ours.length} instances, reference has ${ref.length}`);continue;}
  ref.forEach((d,k)=>{
   const o=ours[k],at=`${name} ${d.instanceId}`,diff=(what:string,a:unknown,b:unknown)=>{if(!sameValue(a,b,res,gone))problems.push(`${at} ${what}: ${show(a)} vs ${show(b)}`);};
   if(o.id!==d.instanceId)problems.push(`${at}: id ${o.id}`);
   diff('depth',o.depth,d.depth);diff('sprite',o.sprite??null,d.sprite.name);diff('image_index',o.imageIndex,d.sprite.imageIndex);diff('image_speed',o.imageSpeed,d.sprite.imageSpeed);
   diff('image_xscale',o.imageXscale,d.scale.x);diff('image_yscale',o.imageYscale,d.scale.y);diff('image_angle',o.imageAngle,d.angle);
   diff('image_alpha',o.imageAlpha,d.alpha);diff('image_blend',o.imageBlend,d.blend);diff('visible',o.visible,d.visible);
   for(let a=0;a<12;a++)diff(`alarm[${a}]`,o.alarm[a]<0?-1:o.alarm[a],d.alarms[a]??-1); // The dumps leave out stopped (negative) alarms.
   for(const [key,value] of Object.entries(d.selfVariables)){
    if(typeof value==='string'&&value.startsWith('<method:'))continue;
    // The reference runtime writes creator (the calling instance) on every instance_create; GameMaker does not, and
    // the game sets it itself where it reads it. Only compared where the remake sets it.
    if(key==='creator'&&!('creator' in o))continue;
    if(ignore[name]?.includes(key))continue;
    const field=GML_RENAMED[key]??key;
    if(!(field in o))problems.push(`${at} ${key}: unset, reference has ${show(value)}`);else diff(key,o[field],value);
   }
   const renamedBack=Object.fromEntries(Object.entries(GML_RENAMED).map(([g,r])=>[r,g]));
   for(const key of Object.keys(o))if(!RUNTIME_FIELDS.has(key)&&!key.startsWith('$')&&!((renamedBack[key]??key) in d.selfVariables))problems.push(`${at} ${key}: ${show(o[key])}, not set in the reference`);
  });
 }
 return problems;
}
