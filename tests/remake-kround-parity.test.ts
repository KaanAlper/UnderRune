import {describe,it,expect} from 'vitest';
import fs from 'node:fs';
import {loadSprites,restoreScene,runParity,type TraceLine} from './parity/reference';
import * as b from '../src/remake/deltarune/battle';
import {checkersLeap} from '../src/remake/bosses/kround/attacks';
import {checkersEnemy} from '../src/remake/bosses/kround/enemy';
import {setSourceText} from '../src/remake/host/text';

// Maintainer-local oracle data never ships with the browser build. A skipped
// local replay is no evidence for public encounter availability.
const runs=[{name:'ch1-12-s11-god',starts:[174,494,814,1623,1894,2214]},{name:'ch1-27-s11-god',starts:[173,493,805,1134,1421,1733,2037]}];
for(const run of runs){
 const ready=fs.existsSync(`.tools/oracle/${run.name}.ndjson`)&&run.starts.every(f=>fs.existsSync(`.tools/oracle/${run.name}-f${f}.json`))&&fs.existsSync('extracted/chapter1_windows/sprites.json');
 describe.skipIf(!ready)(`K.Round attack-window native parity (${run.name})`,()=>{
  const trace=ready?new Map<number,TraceLine>(fs.readFileSync(`.tools/oracle/${run.name}.ndjson`,'utf8').trim().split('\n').map(l=>{const x=JSON.parse(l);return [x.f,x];})):new Map<number,TraceLine>();
  const objects=[b.mainchara,b.astream,b.eventManager,b.heroKris,b.heroSusie,b.heroRalsei,b.battleController,b.darkener,b.heart,b.grazebox,b.growtangle,b.afterimage,b.afterimageGrow,b.regularBullet,b.moveHeart,b.returnHeart,b.heartBurst,b.dmgWriter,b.shake,checkersEnemy,checkersLeap];
  // Only the source's already-fading attackpress tail is reachable in these
  // snapshots. Its Draw repeats enemy-turn entry until its final fade frame.
  objects.push({name:'obj_attackpress',index:210,events:{draw:(s,rt)=>{
   if(s.fade!==1||s.posttimer<=s.timermax)throw Error('Snapshot requires the unported attackpress command phase');
   rt.globals.mnfight=1;rt.globals.myfight=-1;s.fadeamt+=.08;if(s.fadeamt>1)rt.destroy(s);
  }}});
  const tracked=new Set(['obj_checkers_enemy','obj_checkers_leap','obj_regularbullet','obj_afterimage','obj_shake']);
  for(const start of run.starts)it(`source attack from frame ${start} until its source destruction`,()=>{
   const dump=JSON.parse(fs.readFileSync(`.tools/oracle/${run.name}-f${start}.json`,'utf8'));
   let end=start+1;while(trace.get(end)?.o.some(x=>x[1]==='obj_checkers_leap'))end++;
   expect(trace.has(end)).toBe(true);
   const {rt,skippedIds}=restoreScene(loadSprites(1),dump,trace.get(start)!,objects);
   // Text is outside attack-window parity coverage: each line reads as its own key.
   setSourceText(new Proxy({},{get:(_t,key)=>String(key)}) as Record<string,string>);
   const result=runParity(rt,trace,start,end,tracked,['hp','tension','turntimer','inv'],skippedIds);
   expect(result.mismatch).toBeUndefined();expect(result.matched).toBe(end-start);
  });
 });
}
