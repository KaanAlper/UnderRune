import {describe,it,expect} from 'vitest';
import {hasReference,loadDump,loadSprites,loadTrace,restoreScene,runParity} from './parity/reference';
import * as battle from '../src/remake/deltarune/battle';
import {spadeRing} from '../src/remake/bosses/jevil/spadering';
import {bulletController} from '../src/remake/bosses/jevil/controller';

// Jevil, seed 11: the spade-ring attack starts at frame 683 and ends in a game over at frame 855.
// Reference recorded locally with: node tools/oracle-record.mjs ch1-25 --seed=11 --frames=900 --dumps=683
const ready=hasReference('ch1-25',11,683,1);
const objects=[battle.mainchara,battle.astream,battle.afterimage,battle.shake,battle.dmgWriter,battle.growtangle,battle.collideBullet,battle.regularBullet,
 battle.heart,battle.grazebox,battle.battleController,battle.heroKris,battle.heroSusie,battle.heroRalsei,battle.darkener,battle.eventManager,spadeRing,bulletController];
const tracked=new Set(['obj_collidebullet','obj_spadering','obj_heart','obj_grazebox','obj_growtangle','obj_afterimage','obj_shake','obj_dmgwriter','obj_dbulletcontroller']);

describe('parity: Jevil spade ring',()=>{
 it.skipIf(!ready)('matches the original frame by frame through the attack',()=>{
  const trace=loadTrace('ch1-25',11);
  const {rt,skipped}=restoreScene(loadSprites(1),loadDump('ch1-25',11,683),trace.get(683)!,objects);
  const result=runParity(rt,trace,683,855,tracked,['hp','tension','turntimer','inv']);
  console.log(`spade ring: ${result.matched} frames identical`,result.mismatch??'',result.room??'');
  console.log('not simulated:',[...skipped].join(' '));
  expect(result.mismatch).toBeUndefined();
 });
});
