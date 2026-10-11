import {describe,it,expect} from 'vitest';
import fs from 'node:fs';
import {loadSprites,restoreScene,runParity,type TraceLine} from './parity/reference';
import * as b from '../src/remake/deltarune/battle';
import * as k from '../src/remake/bosses/king';
import {moveTowardsPoint} from '../src/remake/gm/runtime';
const run='ch1-40-s11-god',starts=[211,587,1019];
const ready=starts.every(f=>fs.existsSync(`.tools/oracle/${run}-f${f}.json`))&&fs.existsSync(`.tools/oracle/${run}.ndjson`)&&fs.existsSync('extracted/chapter1_windows/sprites.json');
// Local reference files are ignored, never bundled. Missing evidence skips these tests and cannot unlock King.
describe.skipIf(!ready)('King three recorded source attack windows',()=>{
 const trace=ready?new Map<number,TraceLine>(fs.readFileSync(`.tools/oracle/${run}.ndjson`,'utf8').trim().split('\n').map(l=>{const x=JSON.parse(l);return [x.f,x];})):new Map<number,TraceLine>();
 const objects=[b.mainchara,b.astream,b.eventManager,b.heroKris,b.heroSusie,b.heroRalsei,b.battleController,b.darkener,b.heart,b.grazebox,b.growtangle,b.afterimage,b.afterimageGrow,b.regularBullet,b.regularBulletPermanent,b.moveHeart,b.returnHeart,b.heartBurst,b.dmgWriter,b.shake,k.kingBoss,k.kingBulletController,k.chainKing,k.chainPiece,k.fadeChain,k.skyChain,k.finalChain,k.waveChain,k.growtangleBouncer,k.nonsolidGrowtangle];
 const tracked=new Set(objects.filter(o=>!['obj_mainchara','obj_astream','obj_event_manager','obj_herokris','obj_herosusie','obj_heroralsei','obj_battlecontroller','obj_darkener'].includes(o.name)).map(o=>o.name));
 for(const start of starts)it(`source attack starting frame ${start}`,()=>{
  const dump=JSON.parse(fs.readFileSync(`.tools/oracle/${run}-f${start}.json`,'utf8'));
  let end=start+1;while(trace.get(end)?.o.some(x=>x[1]==='obj_dbulletcontroller'||x[1]==='obj_chainking'))end++;
  const {rt,skippedIds}=restoreScene(loadSprites(1),dump,trace.get(start)!,objects);
  // Native dumps omit built-in motion. These first-frame moving souls have their original
  // destinations, distance and duration in source variables, enough to recover the flight.
  for(const h of rt.all(b.moveHeart))moveTowardsPoint(h,h.distx,h.disty,h.dist/h.flytime);
  const result=runParity(rt,trace,start,end,tracked,['hp','tension','turntimer','inv'],skippedIds);
  console.log(`King @${start}: ${result.matched}/${end-start} frames`,result.mismatch?.what??'');
  expect(result.mismatch).toBeUndefined();
 });
});
