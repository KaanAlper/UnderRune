import {describe,it,expect} from 'vitest';
import {chapter2RecordingReady,runChapter2Recording} from './parity/chapter2-runner';
import {installNeoHost} from '../src/remake/host/neo';

// Spamton NEO (Chapter 2, encounter 61) against the original game, frame by frame, from the battle's first frames
// to the end of a long local recording (party HP raised for the recording only, so it runs through many turns).
// Three runs: FIGHT every turn with tapped shots (z), the menu script (ACTs, spells, charged BIG SHOTs; see
// tools/oracle-scripts.mjs), and a longer FIGHT recording through the finale. Where the recording has full dumps
// (every 20 frames), every variable of the hand-written objects is compared too (tests/parity/chapter2-runner.ts).
for(const RUN of ['.tools/oracle/ch2-61-s11-god','.tools/oracle/ch2-61-s11-god-menu','.tools/oracle/ch2-61-s11-god-zlong']){
 describe.skipIf(!chapter2RecordingReady(RUN))(`Spamton NEO against the original (local recording ${RUN.split('/').pop()})`,()=>{
  it('matches every recorded frame',()=>{
   expect(runChapter2Recording(RUN,rt=>installNeoHost(rt)).mismatch).toBeUndefined();
  },300000);
 });
}
