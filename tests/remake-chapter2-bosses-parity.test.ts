import {describe,it,expect} from 'vitest';
import fs from 'node:fs';
import {chapter2RecordingReady,runChapter2Recording} from './parity/chapter2-runner';
import {installChapter2BossHost} from '../src/remake/host/chapter2-bosses';
import type {GmRuntime} from '../src/remake/gm/runtime';

// The other Chapter 2 bosses against the original game, frame by frame and (where the recording has full dumps)
// variable by variable, like NEO's test: every local recording .tools/oracle/ch2-<encounter>-s11-god* of an
// encounter the Chapter 2 boss host knows. Recorded with tools/oracle-record.mjs (party HP raised for the recording).
// 89 (the Dojo's Tasque Manager) joins once its quiz ending matches: its recordings part at frames 637-724, where
// the original ends the battle and the remake does not yet.
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
/** Sound handles the bosses keep (the remake plays no sound in tests). */
const SOUND_HANDLES:Record<string,string[]>={obj_queen_explodinghead:['laughsound']};
const BOSS_ENCOUNTERS=new Set(['57','58','59','81','82','83','94']);
// The long recordings (-zlong, -menulong, -actlong: to each battle's end) take minutes; they run with LONG_PARITY=1.
const LONG=process.env.LONG_PARITY==='1';
const runs=fs.existsSync('.tools/oracle')?fs.readdirSync('.tools/oracle').filter(f=>/^ch2-(\d+)-s11-god[a-z-]*\.ndjson$/.test(f)&&(LONG||!/long\.ndjson$/.test(f)))
 .map(f=>f.replace(/\.ndjson$/,'')).filter(f=>BOSS_ENCOUNTERS.has(f.split('-')[1])):[];
for(const name of runs){
 const RUN='.tools/oracle/'+name;
 describe.skipIf(!chapter2RecordingReady(RUN))(`Chapter 2 encounter ${name.split('-')[1]} against the original (local recording ${name})`,()=>{
  it('matches every recorded frame',()=>{
   expect(runChapter2Recording(RUN,rt=>installChapter2BossHost(rt,{room:'room_battletest'}),SOUND_HANDLES,2,restoreStarts).mismatch).toBeUndefined();
  },LONG?3600000:300000);
 });
}
