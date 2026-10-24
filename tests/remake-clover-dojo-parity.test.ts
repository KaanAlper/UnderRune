import fs from 'node:fs';
import {describe,it,expect} from 'vitest';
import {chapter2RecordingReady,runChapter2Recording} from './parity/chapter2-runner';
import {installChapter2BossHost} from '../src/remake/host/chapter2-bosses';
import type {GmRuntime} from '../src/remake/gm/runtime';

import {restoreCloverTopicLists,restoreCloverDrawSlots} from './parity/clover-dojo';
const runs=fs.existsSync('.tools/oracle')?fs.readdirSync('.tools/oracle').filter(f=>/^ch2-71-s11-god(?:-[a-z-]+)?\.ndjson$/.test(f)).map(f=>'.tools/oracle/'+f.replace(/\.ndjson$/,'')):[];
for(const run of runs)describe.skipIf(!chapter2RecordingReady(run))('Clover Dojo native recording '+run,()=>{
 it('matches every frame and every recorded instance variable',()=>{
  expect(runChapter2Recording(run,rt=>installChapter2BossHost(rt,{room:'room_battletest'}),{},2,rt=>{restoreCloverTopicLists(rt);restoreCloverDrawSlots(rt,run);}).mismatch).toBeUndefined();
 },300000);
});
