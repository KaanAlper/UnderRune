import {describe,it,expect} from 'vitest';
import fs from 'node:fs';
import {compareState,loadResources,loadSprites,runParity,type Dump,type TraceLine,type Replay} from './parity/reference';
import {GmRuntime} from '../src/remake/gm/runtime';
import {installNeoHost} from '../src/remake/host/neo';
import {setSourceText} from '../src/remake/host/text';
import {localizationDefaults} from '../tools/source-localization.mjs';
import {setHudMeasure} from '../src/remake/deltarune/controller';

// Spamton NEO (Chapter 2, encounter 61) against the original game, frame by frame, from the battle's first frames
// to the end of a long local recording (party HP raised for the recording only, so it runs through many turns).
// Two runs: FIGHT every turn with tapped shots (z), and the menu script (ACTs, spells, charged BIG SHOTs; see
// tools/oracle-scripts.mjs). Where the recording has full dumps (every 20 frames), every variable of the hand-written
// objects is compared too (PARITY_STATE=all: every restored object, archived ones included).
const START=40;
for(const RUN of ['.tools/oracle/ch2-61-s11-god','.tools/oracle/ch2-61-s11-god-menu']){
const ready=fs.existsSync(`${RUN}-f${START}.json`)&&fs.existsSync(RUN+'.ndjson')&&fs.existsSync('extracted/chapter2_windows/sprites.json')&&fs.existsSync('extracted/chapter2_windows/code');
describe.skipIf(!ready)(`Spamton NEO against the original (local recording ${RUN.split('/').pop()})`,()=>{
 it('matches every recorded frame',()=>{
  const code='extracted/chapter2_windows/code/';
  setSourceText(Object.assign({},...fs.readdirSync(code).filter(f=>f.endsWith('.gml')).map(f=>localizationDefaults(fs.readFileSync(code+f,'utf8')))));
  const trace=new Map<number,TraceLine>(fs.readFileSync(RUN+'.ndjson','utf8').trim().split('\n').map(l=>{const x=JSON.parse(l) as TraceLine;return [x.f,x];}));
  const replay=JSON.parse(fs.readFileSync(RUN+'.inputs.json','utf8')) as Replay,dump=JSON.parse(fs.readFileSync(`${RUN}-f${START}.json`,'utf8')) as Dump;
  const SPRITES:string[]=JSON.parse(fs.readFileSync('extracted/chapter2_windows/index.json','utf8')).sprites.map((s:{name:string})=>s.name);
  const mainFont=JSON.parse(fs.readFileSync('extracted/chapter2_windows/index.json','utf8')).fonts.find((f:{name:string})=>f.name==='fnt_mainbig');
  const advances=new Map<number,number>(mainFont.glyphs.map((g:{charCode:number;shift:number})=>[g.charCode,g.shift]));
  setHudMeasure(text=>Math.max(0,...text.split('\n').map(line=>[...line].reduce((n,ch)=>n+(advances.get(ch.charCodeAt(0))??0),0))));
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
  // PARITY_LIFE=obj_name: every creation and destruction of that object, with the calling code.
  if(process.env.PARITY_LIFE){
   const name=process.env.PARITY_LIFE,where=()=>new Error().stack!.split('\n').slice(3,6).map(l=>l.trim().replace(/\(.*[\/]/,'(')).join(' < ');
   const create=rt.create.bind(rt),destroy=rt.destroy.bind(rt);
   rt.create=(o,x,y,id)=>{const i=create(o,x,y,id);if(i.object.name===name)console.log('create@',rt.frame+START,i.id,i.live,where());return i;};
   rt.destroy=i=>{if(i.object.name===name)console.log('destroy@',rt.frame+START,i.id,where());destroy(i);};
  }
  // PARITY_RNG=from,to: who calls the random generator in those frames (stack excerpts).
  if(process.env.PARITY_RNG){
   const [from,to]=process.env.PARITY_RNG.split(',').map(Number),next=rt.random.next.bind(rt.random);
   rt.random.next=()=>{if(rt.frame>=from-START&&rt.frame<=to-START)console.log('rng@',rt.frame+START,new Error().stack!.split('\n').slice(2,5).map(l=>l.trim().replace(/\(.*[\\/]/,'(')).join(' < '));return next();};
  }
  const res=loadResources(2);
  // Sound instance numbers come from the reference runtime's audio backend (100000 plus two per sound played); the
  // remake's audio hooks do not number sounds that way, so variables holding them are not compared.
  const SOUND_HANDLES={obj_heart:['chargeshot_sound'],obj_spamton_neo_enemy:['chargeshot_sound'],obj_herokris:['ls'],obj_herosusie:['ls'],obj_heroralsei:['ls']};
  // Objects not yet matched variable for variable (none at the moment).
  const STATE_PENDING=new Set<string>();
  // PARITY_STATE_ONLY=obj_a,obj_b: compare only these objects (archived ones included).
  const only=process.env.PARITY_STATE_ONLY?.split(',');
  const stateChecked=new Set([...tracked].filter(n=>only?only.includes(n):process.env.PARITY_STATE==='all'||!(objects[n] as {archived?:boolean}).archived&&(process.env.PARITY_SURVEY||!STATE_PENDING.has(n))));
  const afterFrame=(f:number)=>{
   const file=`${RUN}-f${f}.json`;if(!fs.existsSync(file))return undefined;
   const problems=compareState(rt,JSON.parse(fs.readFileSync(file,'utf8')) as Dump,stateChecked,res,skippedIds,SOUND_HANDLES);
   // PARITY_SURVEY=1: run on, listing each differing object variable once with the frame it first differs at.
   if(process.env.PARITY_SURVEY){for(const p of problems){const key=p.replace(/ \d+ /,' ').split(':')[0];if(!survey.has(key))survey.set(key,`${f}: ${p}`);}return undefined;}
   const shown=problems.slice(0,40).join('\n ')+(problems.length>40?`\n (${problems.length-40} more)`:'');
   return problems.length?{frame:f,what:'state differs:\n '+shown}:undefined;
  };
  const survey=new Map<string,string>();
  const result=runParity(rt,trace,START,end,tracked,['hp','tension','turntimer','myfight','mnfight','inv'],skippedIds,replay,afterFrame);
  console.log(`${RUN.split('/').pop()} ${START}-${end}`,result,'not restored:',[...skipped].join(' '));
  if(survey.size)console.log(`state survey (${survey.size}):\n`+[...survey.values()].join('\n'));
  expect(result.mismatch).toBeUndefined();
 },300000);
});
}
