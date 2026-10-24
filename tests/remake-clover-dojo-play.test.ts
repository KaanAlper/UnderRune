import {describe,it,expect} from 'vitest';
import fs from 'node:fs';
import {EngineBattle} from '../src/remake/host/engine';
import {installChapter2BossHost} from '../src/remake/host/chapter2-bosses';
import {defaultLoadout,type EquipmentSource} from '../src/game/loadout';
import {loadSprites} from './parity/reference';
import {chapterText} from './parity/chapter2-runner';
import {setSourceText} from '../src/remake/host/text';
import {KEY} from '../src/remake/deltarune/keys';
import {createPracticeBattle,practicePatterns} from '../src/remake/host/practice';
const gear={id:0,name:'Default',description:'',attack:0,defense:0,magic:0,allowed:[1,2,3]};
const equipment:EquipmentSource={weapons:[gear],armors:[gear],items:[],bagCapacity:12};
const start=()=>{setSourceText(chapterText(2));return new EngineBattle(loadSprites(2),equipment,defaultLoadout(),'ch2-71',11,{development:true,chapter2Host:installChapter2BossHost});};
export const frame=(b:EngineBattle,...keys:number[])=>{for(const k of keys)b.rt.input.pressed.add(k);b.step();b.rt.draw();};
describe.skipIf(!fs.existsSync('extracted/chapter2_windows/sprites.json')||!fs.existsSync('extracted/chapter2_windows/code'))('Clover Dojo fresh battle',()=>{
 it('exposes the three native attack selections in practice with their exact controller parameters',()=>{
  setSourceText(chapterText(2));expect(practicePatterns('ch2-71')).toHaveLength(3);
  for(const [pattern,type,ratio,timepoints] of [[0,30,.7,2],[1,31,.7,1],[2,33,1,2]]){
   const p=createPracticeBattle(loadSprites(2),equipment,defaultLoadout(),'ch2-71',pattern,11,{development:true,chapterHost:installChapter2BossHost});let seen=false;
   for(let f=0;f<400&&!p.outcome;f++){p.rt.globals.inv=999999;p.step();p.rt.draw();const dc=p.rt.instances.find(i=>i.live&&i.object.name==='obj_dbulletcontroller');if(dc){seen=true;expect([dc.type,dc.ratio,dc.grazepoints,dc.timepoints,dc.damage]).toEqual([type,ratio,5,timepoints,55]);}}
   expect(seen).toBe(true);expect(p.outcome).toBe('survived');
  }
 });
 it('takes legal Topic answers to MERCY and victory',()=>{
  const b=start(),g=b.rt.globals;let answered=0;
  for(let f=0;f<16000&&!b.outcome;f++){
   for(const c of [1,2,3])g.hp[c]=g.maxhp[c];
   const s=b.enemy,choice=b.rt.instances.find(i=>i.live&&i.object.name==='obj_choicer_neo');
   if(s&&choice&&choice.canchoose===1&&f%4===0){const key=[KEY.left,KEY.right,KEY.up][s.right_answer];b.rt.input.held.add(key);frame(b,key);b.rt.input.held.delete(key);frame(b,KEY.z);answered++;continue;}
   if(g.myfight===0&&f%2===0){const t=g.charturn;
    if(g.bmenuno===0){const target=t===0?(g.mercymod[0]>=100?3:1):4;frame(b,g.bmenucoord[0][t]===target?KEY.z:KEY.right);continue;}
    if([11,6,7].includes(g.bmenuno)){frame(b,KEY.z);continue;}
    if(g.bmenuno===9){frame(b,g.bmenucoord[9][t]===1?KEY.z:KEY.right);continue;}
   }
   if(f%8===0)frame(b,KEY.z);else frame(b);
  }
  expect(answered).toBeGreaterThan(0);expect(b.outcome).toBe('victory');
 },120000);
});
