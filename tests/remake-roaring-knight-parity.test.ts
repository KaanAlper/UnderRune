import {describe,it,expect} from 'vitest';
import fs from 'node:fs';
import {chapter2RecordingReady,runChapter2Recording} from './parity/chapter2-runner';
import {installChapter3BossHost} from '../src/remake/host/chapter3-bosses';

// The Roaring Knight (Chapter 3, encounter 115) against the original, frame by frame and variable by variable:
// every local recording .tools/oracle/ch3-115-s11-god* (tools/oracle-record.mjs, party HP raised for the recording).
// The port is in progress (docs/superpowers/plans/2026-10-17-roaring-knight.md): run it with KNIGHT_PARITY=1 until it
// matches, then drop the switch.
const ON=process.env.KNIGHT_PARITY==='1';
const runs=fs.existsSync('.tools/oracle')?fs.readdirSync('.tools/oracle').filter(f=>/^ch3-115-s11-god[a-z-]*\.ndjson$/.test(f)).map(f=>f.replace(/\.ndjson$/,'')):[];
for(const name of runs){
 const RUN='.tools/oracle/'+name;
 describe.skipIf(!ON||!chapter2RecordingReady(RUN,3))(`Roaring Knight against the original (local recording ${name})`,()=>{
  it('matches every recorded frame',()=>{
   expect(runChapter2Recording(RUN,rt=>installChapter3BossHost(rt,{room:'room_battletest'}),{},3).mismatch).toBeUndefined();
  },300000);
 });
}
