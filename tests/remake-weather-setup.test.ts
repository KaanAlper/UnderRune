import {beforeAll,expect,it} from 'vitest';
import {GmRuntime} from '../src/remake/gm/runtime';
import {partyGlobals,encounterSetup,monsterSetup} from '../src/remake/deltarune/encounter';
import {setSourceText,sourceText} from '../src/remake/host/text';
import {chapterText} from './parity/chapter2-runner';
import {setupWeatherEncounter,setupWeatherMonster} from '../src/remake/bosses/lanino-elnina/setup';
import {sourceEncounter} from '../src/remake/host/encounters';
import {loadSprites} from './parity/reference';
import {chapter3StartStats} from '../src/remake/deltarune/chapter3';

beforeAll(()=>setSourceText(chapterText(3)));
it('unlocks only the verified first weather battle, with the rematch still gated',()=>{
 expect(sourceEncounter('ch3-113')).toMatchObject({party:[1,2,3],hp:8880,attack:12,defense:0,practice:false});
 expect(sourceEncounter('ch3-141')).toBeUndefined();
});
it('uses the original two enemy slots, party positions, ACTs and rank thresholds',()=>{
 const rt=new GmRuntime(loadSprites(3));rt.globals.chapter=3;
 partyGlobals(rt,{char:[1,2,3],...chapter3StartStats(),equipped:{},items:[]});rt.view.x=120;rt.view.y=40;
 const enemies={obj_lanino_enemy:{name:'obj_lanino_enemy',index:380},obj_elnina_enemy:{name:'obj_elnina_enemy',index:947}};
 rt.battleSetup={encounter:setupWeatherEncounter,monster:setupWeatherMonster};
 encounterSetup(rt,113,enemies);
 const g=rt.globals;
 for(const key of ['monstername','monstermaxhp','monsterhp','monsterat','monsterdf','monsterexp','monstergold','sparepoint','mercymod','mercymax'])g[key]=[];
 for(const suffix of ['','sus','ral','noe'])for(const key of ['canact','actname','actdesc','actcost','actsimul'])g[key+suffix]=Array.from({length:3},()=>[]);
 g.actactor=Array.from({length:3},()=>[]);
 expect(g.heromakex.slice(0,3)).toEqual([214,200,192]);expect(g.heromakey.slice(0,3)).toEqual([90,162,240]);
 expect(g.monstertype).toEqual([61,60,0]);expect(g.monsterinstancetype.slice(0,2)).toEqual([enemies.obj_lanino_enemy,enemies.obj_elnina_enemy]);
 expect([g.monstermakex[0],g.monstermakey[0],g.monstermakex[1],g.monstermakey[1]]).toEqual([600,86,630,220]);
 expect([g.rank1time,g.rank1turns,g.rank1tp,g.rank1hurtcount]).toEqual([124,7,200,2]);
 for(let slot=0;slot<2;slot++){
  const enemy=rt.create({name:'setup_fixture',index:99999},0,0);enemy.myself=slot;monsterSetup(enemy,rt);
  expect([g.monsterhp[slot],g.monsterat[slot],g.monsterdf[slot],g.monstergold[slot]]).toEqual([8880,12,0,160]);
  expect(g.canact[slot].slice(0,3)).toEqual([1,1,1]);expect(g.actactor[slot][2]).toBe(4);
  expect(g.actsimulsus[slot][0]).toBe(1);expect(g.actsimulral[slot][0]).toBe(1);
 }
 expect(g.monstername[0]).toBe(sourceText('scr_monstersetup_slash_scr_monstersetup_gml_2054_0'));
 expect(g.monstername[1]).toBe(sourceText('scr_monstersetup_slash_scr_monstersetup_gml_2018_0'));
});
