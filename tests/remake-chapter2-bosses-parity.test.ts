import {describe,it,expect} from 'vitest';
import fs from 'node:fs';
import {START,chapter2RecordingReady,runChapter2Recording} from './parity/chapter2-runner';
import {installChapter2BossHost} from '../src/remake/host/chapter2-bosses';
import type {GmRuntime} from '../src/remake/gm/runtime';
import {GmRandom} from '../src/remake/gm/random';
import {MUSICAL_SCORE} from '../src/remake/bosses/chapter2-rivals/musical-score-data';

// The other Chapter 2 bosses against the original game, frame by frame and (where the recording has full dumps)
// variable by variable, like NEO's test: every local recording .tools/oracle/ch2-<encounter>-s11-god* of an
// encounter the Chapter 2 boss host knows. Recorded with tools/oracle-record.mjs (party HP raised for the recording).
/** The snapshots record no xstart/ystart: Queen starts where scr_encountersetup made her, her Berdly bobs around the
 * place he keeps in savey, and the coaster heroes bob around theirs. */
function restoreStarts(rt:GmRuntime){
 const g=rt.globals;
 for(const q of rt.instances.filter(i=>i.live&&i.object.name==='obj_queen_enemy')){q.xstart=g.monstermakex[q.myself];q.ystart=g.monstermakey[q.myself];}
 for(const p of rt.instances.filter(i=>i.live&&i.object.name==='obj_berdlyplug_enemy'))p.ystart=p.savey;
 // The coaster heroes bob around their start: x = xstart + sin(siner / 6) * 3 while waiting (con 0).
 for(const h of rt.instances.filter(i=>i.live&&i.object.name==='o_coaster_hero'&&i.con===0))h.xstart=Math.round(h.x-Math.sin(h.siner/6)*3);
 for(const b of rt.instances.filter(i=>i.live&&i.object.name==='o_coaster_berdly'&&i.damagecon===0))b.xstart=Math.round(b.x-Math.sin(b.siner/6)*3);
 // Nor masks: the coaster's riders collide by the masks their Create events set.
 for(const [name,mask] of [['o_coaster_hero','spr_coaster_hero'],['o_coaster_berdly','spr_coaster_berdly']])for(const i of rt.instances.filter(i=>i.live&&i.object.name===name))i.mask=mask;
}
/** Sweet's solo position (audio_sound_get_track_position). The original reads the audio clock, which runs about 1%
 * fast against the frames and moves in uneven steps (sometimes none, sometimes three), so a beat of the song can fire a
 * frame early or late, or not at all. The full snapshots (every 20 frames) give the solo exactly; between them it is
 * spread evenly, then corrected where the recording's random draws show a beat the remake missed (ours behind) or one
 * the original did not play there (ours ahead), each time running again from the last snapshot with no song playing
 * (with one playing, bullets keep state the snapshots lack). The table is cached beside the recording (<run>.solo.json); SOLO_CALIBRATE=1
 * goes on correcting from the cached table. */
const SOLO=3225,BEATS=new Set(MUSICAL_SCORE.flatMap(([beats])=>beats));
type Clock=(frame:number)=>number;
type Play=(clock:Clock,start:number)=>{mismatch?:{frame:number};random:number[]};
function soloClock(run:string,play:Play):Clock{
 const cache=run+'.solo.json';
 const cached=fs.existsSync(cache)?JSON.parse(fs.readFileSync(cache,'utf8')) as Record<number,number>:undefined;
 /** After the last snapshot the solo goes on a frame at a time. */
 const extend=(table:Record<number,number>)=>{const last=Math.max(...Object.keys(table).map(Number));for(let f=last+1;f<=last+60;f++)table[f]=(table[f-1]+1)%SOLO;return table;};
 if(cached&&process.env.SOLO_CALIBRATE!=='1'){extend(cached);return f=>cached[f]??0;}
 const name=run.split('/').pop()!,known=new Map<number,number>();
 const snapshots=fs.readdirSync('.tools/oracle').filter(n=>n.startsWith(name+'-f')).map(n=>Number(n.match(/-f(\d+)\.json$/)?.[1])).filter(Number.isFinite).sort((a,b)=>a-b);
 for(const f of snapshots){
  const d=JSON.parse(fs.readFileSync(`${run}-f${f}.json`,'utf8')),s=d.instances.find((i:{objectName:string})=>i.objectName==='obj_sweet_enemy');
  if(s)known.set(f,s.selfVariables.solotimer);
 }
 const table:Record<number,number>=cached??{},frames=[...known.keys()];
 if(!cached)for(let i=0;i+1<frames.length;i++){
  const f0=frames[i],f1=frames[i+1],s0=known.get(f0)!,s1=known.get(f1)!,s1u=s1<s0?s1+SOLO:s1;
  for(let f=f0;f<=f1;f++){const v=s0+Math.round((f-f0)*(s1u-s0)/(f1-f0));table[f]=v>=SOLO?v-SOLO:v;}
 }
 extend(table);
 const lines=fs.readFileSync(run+'.ndjson','utf8').trim().split(String.fromCharCode(10)).map(l=>JSON.parse(l) as {f:number;rng:number[];o:[number,string][]});
 const trace=new Map<number,number[]>(lines.map(x=>[x.f,x.rng]));
 // Snapshots with no song playing are safe to run again from (with one playing, bullets keep state the snapshot lacks).
 const SONG=new Set(['obj_musicalbullet_controller','obj_musical_note_bullet','obj_musical_note_bullet_segment','obj_musicenemy_dancer','obj_musicenemy_boombox']);
 const quiet=new Set(lines.filter(x=>known.has(x.f)&&!x.o.some(o=>SONG.has(o[1]))).map(x=>x.f));
 const clock:Clock=f=>table[f]??0;
 /** How many draws the remake's random state is ahead of the reference's at a frame (negative: behind). */
 const drift=(ours:number[],frame:number)=>{
  const same=(a:number[],b:number[])=>a.every((v,k)=>v===b[k]);
  for(let k=0;k<=12;k++){const r=GmRandom.restore(trace.get(frame)!);for(let n=0;n<k;n++)r.next();if(same(r.snapshot(),ours))return k;}
  for(let k=1;k<=12;k++){const r=GmRandom.restore(ours);for(let n=0;n<k;n++)r.next();if(same(r.snapshot(),trace.get(frame)!))return -k;}
  return undefined;
 };
 /** The beat the song plays: the solo, or one less after a step of exactly two (the controller's catch-up). */
 const beatOf=(prev:number,cur:number)=>cur-(cur-prev===2?1:0);
 const settle=(m:number,want:number|undefined)=>{
  const cur=table[m],prev=table[m-1],plays=(p:number,c:number)=>want===undefined?!BEATS.has(beatOf(p,c)):beatOf(p,c)===want;
  const near=(v:number,fixed:boolean)=>fixed?[v]:[v,v-1,v+1,v-2,v+2,v-3,v+3];
  // The frame before is changed only when this frame alone cannot do it (a beat can also play twice: no step).
  for(const p of near(prev,known.has(m-1)))for(const c of near(cur,known.has(m)))
   if(plays(p,c)&&(p===prev||!BEATS.has(beatOf(table[m-2],p)))){table[m]=c;table[m-1]=p;return true;}
  return false;
 };
 let from=frames[0];
 for(let n=0;n<2000;n++){
  const {mismatch,random}=play(clock,from);if(!mismatch)break;
  const m=mismatch.frame,k=drift(random,m);
  if(process.env.SOLO_DEBUG)console.log('solo',from,m,k,table[m-2],table[m-1],table[m],(mismatch as {what?:string}).what?.slice(0,90));
  // A difference the clock did not make: from a later snapshot it may be the restart's; from the first, it is real.
  if(!k){if(from===frames[0])break;from=frames[0];continue;}
  // A beat the original played here (ours behind: the nearest one) or did not (ours ahead): the closest solo values
  // for this frame and the one before that give it, keeping snapshot values and adding no beat the frame before.
  const want=k<0?[...BEATS].sort((a,b)=>Math.abs(a-table[m])-Math.abs(b-table[m]))[0]:undefined;
  if(!settle(m,want))break;
  from=[...quiet].filter(f=>f<m-1).pop()??frames[0];
  if(n%10===9)fs.writeFileSync(cache,JSON.stringify(table));
 }
 fs.writeFileSync(cache,JSON.stringify(table));
 return clock;
}
/** Sound handles the bosses keep (the remake plays no sound in tests). */
const SOUND_HANDLES:Record<string,string[]>={obj_queen_explodinghead:['laughsound']};
const BOSS_ENCOUNTERS=new Set(['57','58','59','60','62','81','82','83','89','94']);
// The long recordings (-zlong, -menulong, -actlong: to each battle's end) take minutes; they run with LONG_PARITY=1.
const LONG=process.env.LONG_PARITY==='1';
const runs=fs.existsSync('.tools/oracle')?fs.readdirSync('.tools/oracle').filter(f=>/^ch2-(\d+)-s11-god[a-z-]*\.ndjson$/.test(f)&&(LONG||!/long\.ndjson$/.test(f)))
 .map(f=>f.replace(/\.ndjson$/,'')).filter(f=>BOSS_ENCOUNTERS.has(f.split('-')[1])):[];
for(const name of runs){
 const RUN='.tools/oracle/'+name;
 describe.skipIf(!chapter2RecordingReady(RUN))(`Chapter 2 encounter ${name.split('-')[1]} against the original (local recording ${name})`,()=>{
  it('matches every recorded frame',()=>{
   const install=(rt:GmRuntime)=>installChapter2BossHost(rt,{room:'room_battletest'});
   const restoring=(clock:Clock|undefined,start:number)=>(rt:GmRuntime)=>{restoreStarts(rt);if(clock)rt.soundTrackPosition=()=>clock(rt.frame+start)/30;};
   const clock=name.startsWith('ch2-62-')?soloClock(RUN,(c,start)=>{
    let last:GmRuntime|undefined;
    const r=runChapter2Recording(RUN,install,SOUND_HANDLES,2,rt=>{last=rt;restoring(c,start)(rt);},{start,quiet:true});
    return {mismatch:r.mismatch,random:last!.random.snapshot()};
   }):undefined;
   expect(runChapter2Recording(RUN,install,SOUND_HANDLES,2,restoring(clock,START)).mismatch).toBeUndefined();
  },LONG?3600000:300000);
 });
}
