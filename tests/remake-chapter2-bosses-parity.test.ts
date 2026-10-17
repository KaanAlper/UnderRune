import {describe,it,expect} from 'vitest';
import fs from 'node:fs';
import {chapter2RecordingReady,runChapter2Recording} from './parity/chapter2-runner';
import {installChapter2BossHost} from '../src/remake/host/chapter2-bosses';

// The other Chapter 2 bosses against the original game, frame by frame and (where the recording has full dumps)
// variable by variable, like NEO's test: every local recording .tools/oracle/ch2-<encounter>-s11-god* of an
// encounter the Chapter 2 boss host knows. Recorded with tools/oracle-record.mjs (party HP raised for the recording).
// 89 (the Dojo's Tasque Manager) joins once its quiz ending matches: its recordings part at frames 637-724, where
// the original ends the battle and the remake does not yet.
const BOSS_ENCOUNTERS=new Set(['57','81','83','94']);
const runs=fs.existsSync('.tools/oracle')?fs.readdirSync('.tools/oracle').filter(f=>/^ch2-(\d+)-s11-god[a-z-]*\.ndjson$/.test(f))
 .map(f=>f.replace(/\.ndjson$/,'')).filter(f=>BOSS_ENCOUNTERS.has(f.split('-')[1])):[];
for(const name of runs){
 const RUN='.tools/oracle/'+name;
 describe.skipIf(!chapter2RecordingReady(RUN))(`Chapter 2 encounter ${name.split('-')[1]} against the original (local recording ${name})`,()=>{
  it('matches every recorded frame',()=>{
   expect(runChapter2Recording(RUN,rt=>installChapter2BossHost(rt,{room:'room_battletest'})).mismatch).toBeUndefined();
  },300000);
 });
}
