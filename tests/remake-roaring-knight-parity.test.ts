import {describe,it,expect} from 'vitest';
import fs from 'node:fs';
import {chapter2RecordingReady,runChapter2Recording} from './parity/chapter2-runner';
import {installChapter3BossHost} from '../src/remake/host/chapter3-bosses';
import type {GmRuntime} from '../src/remake/gm/runtime';

// The Roaring Knight (Chapter 3, encounter 115) against the original, frame by frame and variable by variable:
// every local recording .tools/oracle/ch3-115-s11-god* (tools/oracle-record.mjs, party HP raised for the recording).
// The port is in progress (docs/superpowers/plans/2026-10-17-roaring-knight.md): run it with KNIGHT_PARITY=1 until it
// matches, then drop the switch.
const ON=process.env.KNIGHT_PARITY==='1';
/** Variables holding the reference runtime's resource handles (surfaces and sounds are numbered by its renderer and
 * audio backend), not compared. */
const RESOURCE_HANDLES:Record<string,string[]>={obj_knight_pointing_cone:['surf','starsurf'],obj_tracking_swords_manager:['hell_surface'],obj_roaringknight_boxsplitter_attack:['hell_surface'],obj_knight_split_growtangle:['source_surf','half_box_a','half_box_b'],obj_knight_split_growtangle_effect:['surf'],obj_dbulletcontroller:['starsound']};
/** What the snapshots leave out: the Knight bobs around ystart, where the encounter placed him, and his afterimages
 * (fadeSpeed 0.02) drift right at 2 pixels a frame. */
function restoreMotion(rt:GmRuntime){
 for(const i of rt.instances){
  if(i.object.name==='obj_knight_enemy')i.ystart=rt.globals.monstermakey[i.myself];
  if(i.object.name==='obj_afterimage'&&i.fadeSpeed===0.02)i.hspeed=2;
 }
}
const runs=fs.existsSync('.tools/oracle')?fs.readdirSync('.tools/oracle').filter(f=>/^ch3-115-s11-god[a-z-]*\.ndjson$/.test(f)).map(f=>f.replace(/\.ndjson$/,'')):[];
for(const name of runs){
 const RUN='.tools/oracle/'+name;
 describe.skipIf(!ON||!chapter2RecordingReady(RUN,3))(`Roaring Knight against the original (local recording ${name})`,()=>{
  it('matches every recorded frame',()=>{
   expect(runChapter2Recording(RUN,rt=>installChapter3BossHost(rt,{room:'room_battletest'}),RESOURCE_HANDLES,3,restoreMotion).mismatch).toBeUndefined();
  },300000);
 });
}
