import {describe,it,expect} from 'vitest';
import fs from 'node:fs';
import {loadSprites,restoreScene,runParity,type TraceLine,type Replay} from './parity/reference';
import * as b from '../src/remake/deltarune/battle';
import {cloverAttackObjects,cloverEnemy} from '../src/remake/bosses/clover';
const run='ch1-8-s11-god',base='.tools/oracle/'+run,starts=[154,434,714,994];
const ready=starts.every(f=>fs.existsSync(`${base}-f${f}.json`))&&fs.existsSync(base+'.ndjson')&&fs.existsSync('extracted/chapter1_windows/sprites.json');
const enemy=cloverEnemy;
const objects=[b.mainchara,b.astream,b.eventManager,b.heroKris,b.heroSusie,b.heroRalsei,b.battleController,b.darkener,b.heart,b.grazebox,b.growtangle,b.afterimage,b.afterimageGrow,b.regularBullet,b.moveHeart,b.returnHeart,b.heartBurst,b.dmgWriter,b.shake,enemy,...cloverAttackObjects];
const tracked=new Set(['obj_clubsenemy','obj_dbulletcontroller','obj_clubsbullet','obj_clubsbullet_dark','obj_regularbullet','obj_afterimage','obj_growtangle','obj_heart','obj_grazebox']);
describe.skipIf(!ready)('Clover original attack frame parity (local recordings)',()=>{
 const trace=ready?new Map<number,TraceLine>(fs.readFileSync(base+'.ndjson','utf8').trim().split('\n').map(l=>{const x=JSON.parse(l) as TraceLine;return [x.f,x];})):new Map<number,TraceLine>();
 const replay=ready?JSON.parse(fs.readFileSync(base+'.inputs.json','utf8')) as Replay:{};
 for(const start of starts){
  let end=start+1;while(trace.get(end)?.o.some(o=>o[1]==='obj_dbulletcontroller'))end++;
  const complete=trace.has(end);
  it.skipIf(!complete)(`matches the complete recorded controller window ${start}-${end} (incomplete references stay unverified)`,()=>{
  const dump=JSON.parse(fs.readFileSync(`${base}-f${start}.json`,'utf8'));
  expect(end-start).toBeGreaterThan(100);
  const {rt,skippedIds}=restoreScene(loadSprites(1),dump,trace.get(start)!,objects);
  const result=runParity(rt,trace,start,end,tracked,['hp','tension','turntimer','inv'],skippedIds,replay);
  console.log(`Clover ${start}-${end}`,result);
  expect(result.mismatch).toBeUndefined();expect(result.matched).toBe(end-start);
  });
 }
});
