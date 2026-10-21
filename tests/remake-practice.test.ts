import {it,expect,describe} from 'vitest';
import fs from 'node:fs';
import {spriteBank} from '../src/remake/gm/sprites';
import {defaultLoadout,type EquipmentSource} from '../src/game/loadout';
import {createJevilPractice,createPracticeBattle,practicePatterns,ROARING_KNIGHT_PATTERNS} from '../src/remake/host/practice';
import {damage,heart,KEY} from '../src/remake/deltarune/battle';
import {setSourceText} from '../src/remake/host/text';
import {installChapter3BossHost} from '../src/remake/host/chapter3-bosses';
import {installChapter2BossHost} from '../src/remake/host/chapter2-bosses';
import {installNeoHost} from '../src/remake/host/neo';
import {loadSprites} from './parity/reference';

const empty={id:0,name:'',description:'',attack:0,defense:0,magic:0,allowed:[1,2,3]};
const source:EquipmentSource={weapons:[empty],armors:[empty,{...empty,id:2,name:'Dice Brace',defense:2}],items:[],bagCapacity:12};
const bank=spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]});

it('equipped armor changes actual contact damage and survives restarting a practice',()=>{
 const loadout=defaultLoadout();loadout.characters[1].armor=[2,0];
 const p=createJevilPractice(bank,source,loadout,0);
 const bullet=p.rt.create({name:'test-contact',index:999},0,0);bullet.target=0;bullet.damage=50;
 damage(bullet,p.rt);expect(p.rt.globals.hp[1]).toBe(52); // 50 - (base DF 2 + armor DF 2) * 3 = 38
 const fresh=createJevilPractice(bank,source,loadout,0);expect(fresh.rt.globals.hp[1]).toBe(90);expect(fresh.rt.globals.battledf[0]).toBe(4);
});

it('slow movement, pause and one-shot completion work without the original engine',()=>{
 const p=createJevilPractice(bank,source,defaultLoadout(),0),s=p.rt.first(heart)!;
 p.rt.input.held.add(KEY.right);p.rt.input.held.add(KEY.shift);const x=s.x;p.step();expect(s.x-x).toBe(2);
 p.paused=true;const frame=p.rt.frame;p.step();expect(p.rt.frame).toBe(frame);
 p.paused=false;p.rt.globals.turntimer=1;p.step();expect(p.outcome).toBe('survived');
 const end=p.rt.frame;p.step();expect(p.rt.frame).toBe(end);
});

describe('Roaring Knight & multi-boss practice patterns',()=>{
 it('exposes all 18 Roaring Knight attack patterns and enters each bullet pattern directly',()=>{
  setSourceText(JSON.parse(fs.readFileSync('public/generated/remake/ch3/bundle.json','utf8')).text);
  const ch3Sprites=loadSprites(3);
  const expected:readonly (readonly [number,number])[]=[
   [1,0],[11,0],[2,0],[13,0],[5,0],
   [1,1],[2,1],[13,3],[15,0],[5,1],
   [1,2],[2,3],[14,0],[13,4],[5,2],
   [16,0],[17,0],[9,0],
  ];
  expect(practicePatterns('ch3-115')).toHaveLength(expected.length);
  for(const [index,[type,difficulty]] of expected.entries()){
   const p=createPracticeBattle(ch3Sprites,source,defaultLoadout(),'ch3-115',index,11,{chapterHost:installChapter3BossHost});
   for(let f=0;f<35;f++)p.step();
   expect(p.rt.globals.mnfight).toBe(2);
   const knight=p.rt.instances.find(i=>i.live&&i.object.name==='obj_knight_enemy');
   const dc=p.rt.instances.find(i=>i.live&&i.object.name==='obj_dbulletcontroller');
   expect(dc,ROARING_KNIGHT_PATTERNS[index].name).toBeDefined();
   expect(knight?.myattackchoice,ROARING_KNIGHT_PATTERNS[index].name).toBe(type);
   expect(knight?.difficulty,ROARING_KNIGHT_PATTERNS[index].name).toBe(difficulty);
  }
 });

 it('initializes and enters enemy attack phase for all Chapter 1 and Chapter 2 encounters',()=>{
  const ch1Text=JSON.parse(fs.readFileSync('public/generated/remake/ch1/bundle.json','utf8')).text;
  const ch2Text=JSON.parse(fs.readFileSync('public/generated/remake/ch2/bundle.json','utf8')).text;
  const ch1Sprites=loadSprites(1),ch2Sprites=loadSprites(2);
  setSourceText(ch1Text);
  for(const id of ['ch1-2','ch1-8','ch1-12','ch1-20','ch1-25','ch1-27','ch1-31','ch1-40']){
   const patterns=practicePatterns(id);
   expect(patterns.length).toBeGreaterThan(0);
   for(let i=0;i<patterns.length;i++){
    const p=createPracticeBattle(ch1Sprites,source,defaultLoadout(),id,i,11,{development:true});
    for(let f=0;f<35;f++)p.step();
    expect(p.rt.globals.mnfight,`${id} pattern ${i} (${patterns[i].name})`).toBe(2);
   }
  }
  setSourceText(ch2Text);
  for(const id of ['ch2-57','ch2-59','ch2-60','ch2-61','ch2-62','ch2-63','ch2-81','ch2-83','ch2-89','ch2-94']){
   const patterns=practicePatterns(id);
   expect(patterns.length).toBeGreaterThan(0);
   for(let i=0;i<patterns.length;i++){
    const p=createPracticeBattle(ch2Sprites,source,defaultLoadout(),id,i,11,{
     development:true,
     neoHost:id==='ch2-61'?installNeoHost:undefined,
     chapterHost:id!=='ch2-61'?installChapter2BossHost:undefined,
    });
    for(let f=0;f<45;f++)p.step();
    expect(p.rt.globals.mnfight,`${id} pattern ${i} (${patterns[i].name})`).toBe(2);
   }
  }
 });
});
