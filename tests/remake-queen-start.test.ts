import {it,expect} from 'vitest';
import fs from 'node:fs';
import {EngineBattle} from '../src/remake/host/engine';
import {installChapter2BossHost} from '../src/remake/host/chapter2-bosses';
import {defaultLoadout,type EquipmentSource} from '../src/game/loadout';
import {loadSprites} from './parity/reference';
import {setSourceText} from '../src/remake/host/text';
const gear={id:0,name:'Default',description:'',attack:0,defense:0,magic:0,allowed:[1,2,3]};
const equipment:EquipmentSource={weapons:[gear],armors:[gear],items:[],bagCapacity:12};
it.skipIf(!fs.existsSync('public/generated/remake/ch2/bundle.json'))('starts the Queen battle and reaches commands',()=>{
 setSourceText(JSON.parse(fs.readFileSync('public/generated/remake/ch2/bundle.json','utf8')).text);
 try{
  const b=new EngineBattle(loadSprites(2),equipment,defaultLoadout(),'ch2-59',11,{development:true,chapter2Host:installChapter2BossHost});
  for(let i=0;i<60;i++){b.step();b.rt.draw();}
  expect(b.phase).toBe('command');expect(b.enemy?.object.name).toBe('obj_queen_enemy');
 }finally{setSourceText(JSON.parse(fs.readFileSync('public/generated/remake/ch1/bundle.json','utf8')).text);}
});
