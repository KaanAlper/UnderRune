import {describe,it,expect} from 'vitest';
import fs from 'node:fs';
import {loadSprites,restoreScene,runParity,type TraceLine,type Replay} from './parity/reference';
import * as battle from '../src/remake/deltarune/battle';
import {spadeRing} from '../src/remake/bosses/jevil/spadering';
import {bulletController} from '../src/remake/bosses/jevil/controller';
import {jevilBullets} from '../src/remake/bosses/jevil/bullets';
import {jokerBody} from '../src/remake/bosses/jevil/body';
const run='ch1-25-s11-moving',base='.tools/oracle/'+run,ready=fs.existsSync(base+'-f683.json')&&fs.existsSync(base+'.inputs.json');
const objects=[battle.mainchara,battle.astream,battle.afterimage,battle.shake,battle.dmgWriter,battle.growtangle,battle.collideBullet,battle.regularBullet,
 battle.regularBulletPermanent,battle.marker,battle.heart,battle.grazebox,battle.battleController,battle.heroKris,battle.heroSusie,battle.heroRalsei,
 battle.darkener,battle.eventManager,battle.returnHeart,battle.heartBurst,spadeRing,bulletController,jokerBody,...jevilBullets];
const tracked=new Set(objects.filter(o=>!['obj_mainchara','obj_battlecontroller','obj_herokris','obj_herosusie','obj_heroralsei','obj_darkener','obj_event_manager','obj_astream','obj_joker_body'].includes(o.name)).map(o=>o.name));
describe.skipIf(!ready)('parity with movement and damage enabled',()=>{
 it('matches soul movement, slowing, diagonal input, collision, damage, TP and invincibility',()=>{
  const trace=new Map<number,TraceLine>(fs.readFileSync(base+'.ndjson','utf8').trim().split('\n').map(l=>{const x=JSON.parse(l) as TraceLine;return [x.f,x];}));
  const replay=JSON.parse(fs.readFileSync(base+'.inputs.json','utf8')) as Replay;
  const dump=JSON.parse(fs.readFileSync(base+'-f683.json','utf8'));
  const {rt,skippedIds}=restoreScene(loadSprites(1),dump,trace.get(683)!,objects.filter(o=>o!==battle.marker));
  const result=runParity(rt,trace,683,855,tracked,['hp','tension','turntimer','inv'],skippedIds,replay);
  console.log('movement parity',result);
  expect(result.mismatch).toBeUndefined();expect(result.matched).toBe(172);
 });
});
