import {describe,it,expect} from 'vitest';
import fs from 'node:fs';
import {loadSprites,restoreScene,runParity,type TraceLine} from './parity/reference';
import * as battle from '../src/remake/deltarune/battle';
import {spadeRing} from '../src/remake/bosses/jevil/spadering';
import {bulletController} from '../src/remake/bosses/jevil/controller';
import {jevilBullets} from '../src/remake/bosses/jevil/bullets';
import {jokerBody} from '../src/remake/bosses/jevil/body';

// Every attack of a long no-damage reference run (the game's debug switch keeps the party alive), recorded locally with
// node tools/oracle-record.mjs ch1-25 --seed=11 --frames=9000 --god --dumps=<attack start frames>

const objects=[battle.mainchara,battle.astream,battle.afterimage,battle.shake,battle.dmgWriter,battle.growtangle,battle.collideBullet,battle.regularBullet,
 battle.regularBulletPermanent,battle.marker,battle.heart,battle.grazebox,battle.battleController,battle.heroKris,battle.heroSusie,battle.heroRalsei,
 battle.darkener,battle.eventManager,battle.returnHeart,battle.heartBurst,spadeRing,bulletController,jokerBody,...jevilBullets];
const tracked=new Set(objects.filter(o=>!['obj_mainchara','obj_battlecontroller','obj_herokris','obj_herosusie','obj_heroralsei','obj_darkener','obj_event_manager','obj_astream','obj_joker_body'].includes(o.name)).map(o=>o.name));

for(const run of ['ch1-25-s11-god','ch1-25-s11-god-j15']){
const starts=fs.existsSync('.tools/oracle')?fs.readdirSync('.tools/oracle').map(f=>f.startsWith(run+'-f')?f.match(/-f(\d+)\.json$/)?.[1]:null).filter(Boolean).map(Number).sort((a,b)=>a-b):[];
const ready=starts.length>0&&fs.existsSync(`.tools/oracle/${run}.ndjson`)&&fs.existsSync('extracted/chapter1_windows/sprites.json');
describe.skipIf(!ready)(`parity: recorded Jevil attacks ${run}`,()=>{
 const god=ready?new Map<number,TraceLine>(fs.readFileSync(`.tools/oracle/${run}.ndjson`,'utf8').trim().split('\n').map(l=>{const x=JSON.parse(l) as TraceLine;return [x.f,x];})):new Map<number,TraceLine>();
 const bank=ready?loadSprites(1):undefined;const lastFrame=Math.max(...god.keys());
 for(const start of starts){
  const dump=JSON.parse(fs.readFileSync(`.tools/oracle/${run}-f${start}.json`,'utf8'));
  const type=dump.instances.find((i:any)=>i.objectName==='obj_dbulletcontroller')?.selfVariables.type;
  it(`attack type ${type} from frame ${start}`,()=>{
   let end=start+1;while(end<lastFrame&&god.get(end)?.o.some(o=>o[1]==='obj_dbulletcontroller'))end++;
   // Room markers (left by the intro event) stay out of the restore; markers the attack creates are compared.
   const {rt,skippedIds}=restoreScene(bank!,dump,god.get(start)!,objects.filter(o=>o!==battle.marker));
   const result=runParity(rt,god,start,end,tracked,['hp','tension','turntimer','inv'],skippedIds);
   console.log(`type ${type} @${start}: ${result.matched}/${end-start} frames`,result.mismatch?.what??'');
   expect(result.mismatch).toBeUndefined();
  });
 }
});
}
