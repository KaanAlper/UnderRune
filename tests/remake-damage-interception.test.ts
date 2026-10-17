import {it,expect} from 'vitest';
import {EngineBattle} from '../src/remake/host/engine';
import {defaultLoadout,type EquipmentSource} from '../src/game/loadout';
import {HERO_DEFS,rudeBusterBolt} from '../src/remake/deltarune/party';
import {basicAttack} from '../src/remake/deltarune/player-effects';
import type {HookedDef} from '../src/remake/deltarune/rules';
import {loadSprites} from './parity/reference';
const gear={id:0,name:'Default',description:'',attack:0,defense:0,magic:0,allowed:[1,2,3]};
const equipment:EquipmentSource={weapons:[gear],armors:[gear],items:[],bagCapacity:12};
it('lets a shield consume FIGHT damage while preserving numbers, TP and the impact, without enemy recoil',()=>{
 const b=new EngineBattle(loadSprites(1),equipment,defaultLoadout(),'ch1-40'),rt=b.rt,g=rt.globals;
 b.step();b.step();const enemy=b.enemy!,hero=rt.byId(g.charinstance[0])!,hp=g.monsterhp[0];let absorbed=0,impact=0;
 const object:HookedDef={...enemy.object,hooks:{defeatedByDamage:false,
  interceptFightDamage:(_e,_h,_rt,_target,amount,number)=>{absorbed=amount;number.x=400;return true;},
  onFightImpact:(_e,_h,_a,_rt)=>{impact++;return true;},
 }};enemy.object=object;hero.points=150;hero.state=0;g.chartarget[0]=0;const before=g.tension;
 HERO_DEFS[0].events!.alarm1!(hero,rt);expect(g.monsterhp[0]).toBe(hp);expect(absorbed).toBeGreaterThan(0);expect(impact).toBe(1);expect(g.tension).toBeGreaterThan(before);
 expect(rt.byId(hero.dm)!.x).toBe(400);expect(rt.all(basicAttack)).toHaveLength(1);expect(enemy.state).toBe(0);expect(enemy.hurtamt).toBe(absorbed);
});
it('allows a spell interception before creating an HP damage writer',()=>{
 const b=new EngineBattle(loadSprites(1),equipment,defaultLoadout(),'ch1-40'),rt=b.rt,g=rt.globals;b.step();b.step();
 const enemy=b.enemy!,hp=g.monsterhp[0];let damage=0;
 const object:HookedDef={...enemy.object,hooks:{interceptSpellDamage:(_e,_spell,_rt,target,amount,id)=>{expect([target,id]).toEqual([0,4]);damage+=amount;return true;}}};enemy.object=object;
 const bolt=rt.create(rudeBusterBolt,0,0);Object.assign(bolt,{explode:1,t:1,chosen_bolt:0,red:0,damage:100,star:0,caster:1,target:enemy.id,cx:enemy.x,cy:enemy.y});
 rudeBusterBolt.events!.step!(bolt,rt);expect(g.monsterhp[0]).toBe(hp);expect(damage).toBe(100);expect('dm' in bolt).toBe(false);
});
