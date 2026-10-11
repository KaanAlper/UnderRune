import {describe,it,expect} from 'vitest';
import fs from 'node:fs';
import {loadSprites,restoreScene,runParity,type TraceLine} from './parity/reference';
import * as b from '../src/remake/deltarune/battle';
import {lancerBike,lancerBoss} from '../src/remake/bosses/lancer/bike';
const run='ch1-2-s11-god',starts=[167,423,735,967];
const ready=fs.existsSync(`.tools/oracle/${run}-f167.json`)&&fs.existsSync('extracted/chapter1_windows/sprites.json');
describe.skipIf(!ready)('Lancer race and spade lap match recorded source frames',()=>{
 const trace=ready?new Map<number,TraceLine>(fs.readFileSync(`.tools/oracle/${run}.ndjson`,'utf8').trim().split('\n').map(l=>{const x=JSON.parse(l);return [x.f,x];})):new Map<number,TraceLine>();
 const objects=[b.mainchara,b.astream,b.eventManager,b.heroKris,b.heroSusie,b.battleController,b.darkener,b.heart,b.grazebox,b.growtangle,b.afterimage,b.afterimageGrow,b.regularBullet,b.moveHeart,b.returnHeart,b.heartBurst,b.dmgWriter,b.shake,lancerBike,lancerBoss];
 const tracked=new Set(['obj_lancerbike','obj_regularbullet','obj_afterimage_grow']);
 for(const start of starts)it(`bike from ${start}`,()=>{
  const dump=JSON.parse(fs.readFileSync(`.tools/oracle/${run}-f${start}.json`,'utf8'));let end=start+1;while(trace.get(end)?.o.some(x=>x[1]==='obj_lancerbike'))end++;
  const {rt,skippedIds}=restoreScene(loadSprites(1),dump,trace.get(start)!,objects);
  const result=runParity(rt,trace,start,end,tracked,['hp','tension','turntimer','inv'],skippedIds);expect(result.mismatch).toBeUndefined();
 });
});
