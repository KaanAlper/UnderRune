// Runs a Chapter 2 reference recording on the remake: restores the snapshot at START, replays the inputs, and
// compares every frame with the trace and, at each full dump (every 20 frames), every variable of the hand-written
// objects. Shared by the NEO test and the other Chapter 2 bosses' tests; `install` sets up the battle's host.
import fs from 'node:fs';
import {compareState,loadResources,loadSprites,runParity,type Dump,type TraceLine,type Replay} from './reference';
import {GmRuntime,type GmObjectDef} from '../../src/remake/gm/runtime';
import {setSourceText} from '../../src/remake/host/text';
import {localizationDefaults} from '../../tools/source-localization.mjs';
import {setHudMeasure} from '../../src/remake/deltarune/controller';

/** Debug switches (environment): PARITY_START (a later full snapshot), PARITY_NEXT_ID (its id counter), PARITY_END,
 * PARITY_DEBUG=obj,... with PARITY_VARS, PARITY_LIFE=obj (creations and destructions), PARITY_RNG=from,to (RNG callers),
 * PARITY_SURVEY=1 (list every differing variable once), PARITY_STATE=all (archived objects too),
 * PARITY_STATE_ONLY=obj,... (compare only these). */
export const START=process.env.PARITY_START?Number(process.env.PARITY_START):40;
/** Objects outside the battle the snapshot has; they are not restored. */
const WORLD=['obj_mainchara','obj_darkcontroller','obj_overworldheart','obj_caterpillarchara','obj_gamecontroller','obj_time','obj_event_manager','obj_event_manager_debug','obj_jean_debug','obj_debugProfiler'];
/** Sound instance numbers come from the reference runtime's audio backend (100000 plus two per sound played); the
 * remake's audio hooks do not number sounds that way, so variables holding them are not compared. */
const SOUND_HANDLES:Record<string,string[]>={obj_heart:['chargeshot_sound'],obj_spamton_neo_enemy:['chargeshot_sound'],obj_herokris:['ls'],obj_herosusie:['ls'],obj_heroralsei:['ls'],obj_heronoelle:['ls'],
 obj_sneo_rotatingwall_bomb:['bomsfallsfx'],obj_sneo_pipis_bomb:['bomsfallsfx'],obj_sneo_phonecall:['sndphone']};

export const chapter2RecordingReady=(run:string)=>fs.existsSync(`${run}-f${START}.json`)&&fs.existsSync(run+'.ndjson')&&
 fs.existsSync('extracted/chapter2_windows/sprites.json')&&fs.existsSync('extracted/chapter2_windows/code');

export function runChapter2Recording(run:string,install:(rt:GmRuntime)=>{objects:Record<string,GmObjectDef>},extraSoundHandles:Record<string,string[]>={}){
 const code='extracted/chapter2_windows/code/';
 setSourceText(Object.assign({},...fs.readdirSync(code).filter(f=>f.endsWith('.gml')).map(f=>localizationDefaults(fs.readFileSync(code+f,'utf8')))));
 const trace=new Map<number,TraceLine>(fs.readFileSync(run+'.ndjson','utf8').trim().split('\n').map(l=>{const x=JSON.parse(l) as TraceLine;return [x.f,x];}));
 const replay=JSON.parse(fs.readFileSync(run+'.inputs.json','utf8')) as Replay,dump=JSON.parse(fs.readFileSync(`${run}-f${START}.json`,'utf8')) as Dump;
 const index=JSON.parse(fs.readFileSync('extracted/chapter2_windows/index.json','utf8'));
 const SPRITES:string[]=index.sprites.map((s:{name:string})=>s.name);
 const mainFont=index.fonts.find((f:{name:string})=>f.name==='fnt_mainbig');
 const advances=new Map<number,number>(mainFont.glyphs.map((g:{charCode:number;shift:number})=>[g.charCode,g.shift]));
 setHudMeasure(text=>Math.max(0,...text.split('\n').map(line=>[...line].reduce((n,ch)=>n+(advances.get(ch.charCodeAt(0))??0),0))));
 const line=trace.get(START)!,rt=new GmRuntime(loadSprites(2),{rng:line.rng});
 rt.globals=structuredClone(dump.globalVariables);
 const {objects}=install(rt);
 const skipped=new Set<string>(),skippedIds=new Set<number>();
 for(const d of dump.instances){
  const def=objects[d.objectName];
  if(!def||WORLD.includes(d.objectName)){skipped.add(d.objectName);skippedIds.add(d.instanceId);continue;}
  const i=rt.restore(def,d.instanceId,d.x,d.y,d.selfVariables);
  i.depth=d.depth;i.sprite=d.sprite.name;i.imageIndex=d.sprite.imageIndex;i.imageSpeed=d.sprite.imageSpeed;
  i.imageXscale=d.scale.x;i.imageYscale=d.scale.y;i.imageAngle=d.angle;i.imageAlpha=d.alpha;i.imageBlend=d.blend;i.visible=d.visible;
  for(const [a,v] of Object.entries(d.alarms))i.alarm[Number(a)]=v;
 }
 rt.nextId=Math.max(...dump.instances.map(d=>d.instanceId))+1;
 // Later snapshots omit the allocation counter (destroyed IDs still consume it). Diagnostic restarts must supply it.
 if(process.env.PARITY_NEXT_ID)rt.nextId=Number(process.env.PARITY_NEXT_ID);
 // The snapshot keeps sprite variables (single or arrays) as sprite numbers; the remake uses names.
 const name=(v:unknown)=>typeof v==='number'&&SPRITES[v]?SPRITES[v]:v;
 for(const i of rt.instances)for(const k of Object.keys(i))if(/sprite/.test(k)&&k!=='sprite')i[k]=Array.isArray(i[k])?i[k].map(name):name(i[k]);
 const tracked=new Set(Object.keys(objects).filter(n=>!skipped.has(n)));
 const end=process.env.PARITY_END?Number(process.env.PARITY_END):Math.max(...trace.keys());
 if(process.env.PARITY_DEBUG)(globalThis as any).__parityRt=rt;
 if(process.env.PARITY_LIFE){
  const watched=process.env.PARITY_LIFE,where=()=>new Error().stack!.split('\n').slice(3,6).map(l=>l.trim().replace(/\(.*[\/]/,'(')).join(' < ');
  const create=rt.create.bind(rt),destroy=rt.destroy.bind(rt);
  rt.create=(o,x,y,id)=>{const i=create(o,x,y,id);if(i.object.name===watched)console.log('create@',rt.frame+START,i.id,i.live,where());return i;};
  rt.destroy=i=>{if(i.object.name===watched)console.log('destroy@',rt.frame+START,i.id,where());destroy(i);};
 }
 if(process.env.PARITY_RNG){
  const [from,to]=process.env.PARITY_RNG.split(',').map(Number),next=rt.random.next.bind(rt.random);
  rt.random.next=()=>{if(rt.frame>=from-START&&rt.frame<=to-START)console.log('rng@',rt.frame+START,new Error().stack!.split('\n').slice(2,5).map(l=>l.trim().replace(/\(.*[\\/]/,'(')).join(' < '));return next();};
 }
 const res=loadResources(2),sounds={...SOUND_HANDLES,...extraSoundHandles};
 const only=process.env.PARITY_STATE_ONLY?.split(',');
 const stateChecked=new Set([...tracked].filter(n=>only?only.includes(n):process.env.PARITY_STATE==='all'||!(objects[n] as {archived?:boolean}).archived));
 const survey=new Map<string,string>();
 const afterFrame=(f:number)=>{
  const file=`${run}-f${f}.json`;if(!fs.existsSync(file))return undefined;
  const problems=compareState(rt,JSON.parse(fs.readFileSync(file,'utf8')) as Dump,stateChecked,res,skippedIds,sounds);
  if(process.env.PARITY_SURVEY){for(const p of problems){const key=p.replace(/ \d+ /,' ').split(':')[0];if(!survey.has(key))survey.set(key,`${f}: ${p}`);}return undefined;}
  const shown=problems.slice(0,40).join('\n ')+(problems.length>40?`\n (${problems.length-40} more)`:'');
  return problems.length?{frame:f,what:'state differs:\n '+shown}:undefined;
 };
 const result=runParity(rt,trace,START,end,tracked,['hp','tension','turntimer','myfight','mnfight','inv'],skippedIds,replay,afterFrame);
 console.log(`${run.split('/').pop()} ${START}-${end}`,result,'not restored:',[...skipped].join(' '));
 if(survey.size)console.log(`state survey (${survey.size}):\n`+[...survey.values()].join('\n'));
 return result;
}
