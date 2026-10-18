import {describe,it,expect} from 'vitest';
import fs from 'node:fs';
import {EngineBattle} from '../src/remake/host/engine';
import {installChapter2BossHost} from '../src/remake/host/chapter2-bosses';
import {defaultLoadout,type EquipmentSource} from '../src/game/loadout';
import {loadSprites} from './parity/reference';
import {setSourceText} from '../src/remake/host/text';
import {KEY} from '../src/remake/deltarune/keys';

// Spamton (encounter 60) as a player meets him: F1's helpers, and his DEALs answered to the end of the battle. The
// recordings check each frame against the game; these check that the paths a player takes run through.
const BUNDLE='public/generated/remake/ch2/bundle.json';
const gear={id:0,name:'Default',description:'',attack:0,defense:0,magic:0,allowed:[1,2,3]};
const equipment:EquipmentSource={weapons:[gear],armors:[gear],items:[],bagCapacity:12};
function start(){
 setSourceText(JSON.parse(fs.readFileSync(BUNDLE,'utf8')).text);
 const b=new EngineBattle(loadSprites(2),equipment,defaultLoadout(),'ch2-60',11,{development:true,chapter2Host:installChapter2BossHost});
 return b;
}
const frame=(b:EngineBattle,...keys:number[])=>{for(const k of keys)b.rt.input.pressed.add(k);b.step();b.rt.draw();};
describe.skipIf(!fs.existsSync(BUNDLE))('Spamton',()=>{
 it('F1 in the menu sends a helper that heals Kris half his HP, once a battle',()=>{
  const b=start(),g=b.rt.globals;
  for(let i=0;i<60;i++)frame(b);
  expect(b.phase).toBe('command');expect(b.enemy?.object.name).toBe('obj_spamton_enemy');
  g.hp[1]=10;frame(b,KEY.f1);
  expect(b.rt.instances.filter(i=>i.live&&i.object.name==='obj_spamton_cherub')).toHaveLength(1);
  for(let i=0;i<70;i++)frame(b);
  expect(g.hp[1]).toBe(10+Math.ceil(g.maxhp[1]/2));
  frame(b,KEY.f1);
  expect(b.rt.instances.some(i=>i.live&&i.object.name==='obj_spamton_cherub')).toBe(false);
 });
 it('takes the DEALs to the final one and ends the battle',()=>{
  const b=start(),g=b.rt.globals;let wrong=0;
  for(let f=0;f<30000&&!b.outcome;f++){
   g.hp[1]=g.maxhp[1];
   const s=b.enemy!,choicer=b.rt.instances.find(i=>i.live&&i.object.name==='obj_choicer_neo');
   // The first answer of each new deal is wrong once, to see his reply; then the right one.
   if(choicer&&choicer.canchoose===1&&f%4===0){
    const right=s.correct_answer===0?KEY.left:KEY.right,answer=wrong<s.deal_counter+1&&s.actcon===10?(wrong++,right===KEY.left?KEY.right:KEY.left):right;
    b.rt.input.held.add(answer);frame(b,answer);b.rt.input.held.delete(answer);frame(b,KEY.z);continue;
   }
   // ACT, Spamton, Deal, by the menu's own cursors (a key every other frame).
   const t=g.charturn;
   if(g.myfight===0&&f%2===0){
    if(g.bmenuno===0){frame(b,g.bmenucoord[0][t]===1?KEY.z:KEY.right);continue;}
    if(g.bmenuno===11){frame(b,KEY.z);continue;}
    if(g.bmenuno===9){frame(b,g.bmenucoord[9][t]===1?KEY.z:KEY.right);continue;}
   }
   if(f%8===0)frame(b,KEY.z);else frame(b);
  }
  expect(g.flag[309],JSON.stringify({deal:b.enemy?.deal_counter,actcon:b.enemy?.actcon,wrong,mercy:g.mercymod})).toBe(1);expect(b.outcome).toBe('victory');
 },300000);
});
