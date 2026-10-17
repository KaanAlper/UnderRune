import fs from 'node:fs';
import {beforeAll,describe,it,expect} from 'vitest';
import {EngineBattle} from '../src/remake/host/engine';
import {installChapter2BossHost} from '../src/remake/host/chapter2-bosses';
import {defaultLoadout,type EquipmentSource} from '../src/game/loadout';
import {setSourceText} from '../src/remake/host/text';
import {loadSprites} from './parity/reference';
import {localizationDefaults} from '../tools/source-localization.mjs';
const dir='extracted/chapter2_windows/code/';
const gear={id:0,name:'Default',description:'',attack:0,defense:0,magic:0,allowed:[1,2,3]};
const equipment:EquipmentSource={weapons:[gear],armors:[gear],items:[],bagCapacity:12};
describe.skipIf(!fs.existsSync(dir))('field lifecycle in the canonical Chapter2 host',()=>{
 beforeAll(()=>setSourceText(Object.assign({},...fs.readdirSync(dir).filter(f=>f.endsWith('.gml')).map(f=>localizationDefaults(fs.readFileSync(dir+f,'utf8'))))));
 it('removes every Mauswheel cursor before the soul returns at the end of its turn',()=>{
  const battle=new EngineBattle(loadSprites(2),equipment,defaultLoadout(),'ch2-83',11,{development:true,chapter2Host:installChapter2BossHost}),rt=battle.rt,g=rt.globals;
  g.hp=[0,10000,10000,10000];g.maxhp=[...g.hp];let started=false;
  for(let frame=0;frame<1200;frame++){
   if(g.myfight===0&&g.mnfight===0)g.bmenucoord[0][g.charturn]=4;
   if(frame%4===0){rt.input.pressed.add(90);rt.input.held.add(90);}else{rt.input.held.delete(90);rt.input.released.add(90);}
   battle.step();rt.draw();
   if(g.mnfight===2)started=true;if(started&&g.mnfight===0&&g.myfight===0)break;
  }
  expect(started).toBe(true);expect(battle.turn).toBe(1);expect(rt.instances.filter(i=>i.live&&i.object.name==='obj_maus_cursor_follow')).toHaveLength(0);
 });
});
