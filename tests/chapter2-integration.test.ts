import {beforeAll,describe,it,expect} from 'vitest';
import fs from 'node:fs';
import {EngineBattle} from '../src/remake/host/engine';
import {installChapter2BossHost} from '../src/remake/host/chapter2-bosses';
import {defaultLoadout,type EquipmentSource} from '../src/game/loadout';
import {setSourceText} from '../src/remake/host/text';
import {loadSprites} from './parity/reference';
import {localizationDefaults} from '../tools/source-localization.mjs';
const gear={id:0,name:'Default',description:'',attack:0,defense:0,magic:0,allowed:[1,2,3]};
const equipment:EquipmentSource={weapons:[gear],armors:[gear],items:[],bagCapacity:12};
beforeAll(()=>{const dir='extracted/chapter2_windows/code/';setSourceText(Object.assign({},...fs.readdirSync(dir).filter(f=>f.endsWith('.gml')).map(f=>localizationDefaults(fs.readFileSync(dir+f,'utf8')))));});
describe('Chapter 2 complete host integration',()=>{
 it.each([['ch2-57',[240,1367,240]],['ch2-81',[1753,0,0]],['ch2-83',[1753,0,0]]] as const)('starts %s with native stats, party and resource identities',(id,hp)=>{
  const battle=new EngineBattle(loadSprites(2),equipment,defaultLoadout(),id,11,{development:true,chapter2Host:installChapter2BossHost});
  expect(battle.rt.globals.monsterhp).toEqual(hp);expect(battle.party).toEqual([1,2,3]);expect(battle.rt.globals.hp).toEqual([0,120,140,100]);
  for(let i=0;i<30;i++){battle.step();battle.rt.draw();}
  expect(battle.phase).toBe('command');
 });
 it.each(['ch2-57','ch2-81','ch2-83'])('runs a full enemy turn and returns to command in %s',id=>{
  const battle=new EngineBattle(loadSprites(2),equipment,defaultLoadout(),id,11,{development:true,chapter2Host:installChapter2BossHost}),rt=battle.rt,g=rt.globals;
  g.hp=[0,10000,10000,10000];g.maxhp=[...g.hp];let enemyStarted=false;
  for(let i=0;i<1200;i++){
   if(g.myfight===0&&g.mnfight===0)g.bmenucoord[0][g.charturn]=4;
   if(i%4===0){rt.input.pressed.add(90);rt.input.held.add(90);}else{rt.input.held.delete(90);rt.input.released.add(90);}
   battle.step();rt.draw();if(g.mnfight===2)enemyStarted=true;if(enemyStarted&&g.mnfight===0&&g.myfight===0)break;
  }
  expect(enemyStarted).toBe(true);expect(g.mnfight).toBe(0);expect(g.myfight).toBe(0);expect(battle.turn).toBe(1);
 });
});
