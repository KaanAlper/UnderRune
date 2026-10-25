import {describe,it,expect} from 'vitest';
import {chapter2RecordingReady,runChapter2Recording} from './parity/chapter2-runner';
import {installNeoHost} from '../src/remake/host/neo';

for(const run of ['.tools/oracle/ch2-61-s11-god-weird-solo','.tools/oracle/ch2-61-s11-god-weird-solo-ending']){
describe.skipIf(!chapter2RecordingReady(run))('solo NEO against the original runner',()=>{
 it('matches the complete continuous recording '+run,()=>{
  expect(runChapter2Recording(run,rt=>installNeoHost(rt,{weird:true}),{obj_astream:['mystream','bstream'],obj_spamton_neo_enemy:['chargeshot_sound','_mystream','_xsndinstance','_xstream']}).mismatch).toBeUndefined();
 },300000);
});
}
