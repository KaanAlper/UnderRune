import {it,expect} from 'vitest';
import {EngineBattle} from '../src/remake/host/engine';
import {installChapter3BossHost} from '../src/remake/host/chapter3-bosses';
import {defaultLoadout,type EquipmentSource} from '../src/game/loadout';
import {loadSprites} from './parity/reference';
import fs from 'node:fs';
import {setSourceText} from '../src/remake/host/text';
const gear={id:0,name:'Default',description:'',attack:0,defense:0,magic:0,allowed:[1,2,3]};
const equipment:EquipmentSource={weapons:[gear],armors:[gear],items:[],bagCapacity:12};
it('starts a fresh Chapter 3 battle and reaches commands without a restored reference snapshot',()=>{
 setSourceText(JSON.parse(fs.readFileSync('public/generated/remake/ch3/bundle.json','utf8')).text);
 const b=new EngineBattle(loadSprites(3),equipment,defaultLoadout(),'ch3-115',11,{development:true,chapterHost:installChapter3BossHost});
 for(let i=0;i<45;i++){b.step();b.rt.draw();}
 expect(b.phase).toBe('command');expect(b.party).toEqual([1,2,3]);expect(b.enemy?.object.name).toBe('obj_knight_enemy');
});
