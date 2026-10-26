import {expect,it} from 'vitest';
import {chapter2RecordingReady,runChapter2Recording} from './parity/chapter2-runner';
import {installChapter3BossHost} from '../src/remake/host/chapter3-bosses';

// Backend-allocated stream/playback handles have different representations; gameplay fields remain compared.
const AUDIO_HANDLES={obj_elnina_lanino_controller:['_mystream','_xsndinstance'],obj_astream:['mystream']};
for(const suffix of ['','-menu','-ending']){
const run='.tools/oracle/ch3-113-s11-god'+suffix;
it.skipIf(!chapter2RecordingReady(run,3))(`weather ${suffix||'fight'} follows the native recording without battle-state exemptions`,()=>{
 // The native dump omits built-in motion. Actor Step stores its exact components in these source fields.
 expect(runChapter2Recording(run,rt=>installChapter3BossHost(rt,{room:'room_battletest'}),AUDIO_HANDLES,3,rt=>{
  for(const i of rt.instances)if(i.object.name==='obj_actor_tenna'){i.hspeed=i.v_hspeed;i.vspeed=i.v_vspeed;}
 }).mismatch).toBeUndefined();
},240000);
}
