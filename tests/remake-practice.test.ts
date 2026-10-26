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

it('does not offer Jevil attacks for unsupported encounters',()=>{
 expect(practicePatterns('missing-encounter')).toEqual([]);
 expect(()=>createPracticeBattle(bank,source,defaultLoadout(),'missing-encounter')).toThrow('Choose a practice pattern.');
});

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
 it('completes GIGA Queen soul-box practice after skipping the boxing intro',()=>{
  setSourceText(JSON.parse(fs.readFileSync('public/generated/remake/ch2/bundle.json','utf8')).text);
  const sprites=loadSprites(2);
  for(const index of [5,7]){
   const p=createPracticeBattle(sprites,source,defaultLoadout(),'ch2-84',index,11,{development:true,chapterHost:installChapter2BossHost});
   for(let f=0;f<800&&!p.outcome;f++){p.rt.globals.inv=999999;p.step();p.rt.draw();}
   expect(p.outcome,p.patternName).toBe('survived');
  }
 });

 it('keeps Werewerewire volleys on the selected source attack for the whole turn',()=>{
  setSourceText(JSON.parse(fs.readFileSync('public/generated/remake/ch2/bundle.json','utf8')).text);
  const sprites=loadSprites(2);
  expect(practicePatterns('ch2-81')).toHaveLength(3);
  expect(practicePatterns('ch2-94')).toEqual([]);
  for(const [index,expected,excluded] of [[1,'obj_werewire_bullet_lasercircle','spr_bullet_werewire_spark'],[2,'spr_bullet_werewire_spark','obj_werewire_bullet_lasercircle']] as const){
   const p=createPracticeBattle(sprites,source,defaultLoadout(),'ch2-81',index,11,{chapterHost:installChapter2BossHost});
   const seen=new Set<string>();
   for(let f=0;f<220&&!p.outcome;f++){
    p.rt.globals.inv=999999;p.step();p.rt.draw();
    for(const o of p.rt.instances)if(o.live){seen.add(o.object.name);if(o.sprite)seen.add(o.sprite);}
   }
   expect(seen.has(expected),practicePatterns('ch2-81')[index].name).toBe(true);
   expect(seen.has(excluded),practicePatterns('ch2-81')[index].name).toBe(false);
  }
 });

 it('exposes all 16 naturally reachable Roaring Knight attack patterns and enters each directly',()=>{
  setSourceText(JSON.parse(fs.readFileSync('public/generated/remake/ch3/bundle.json','utf8')).text);
  const ch3Sprites=loadSprites(3);
  const expected:readonly (readonly [number,number])[]=[
   [1,0],[11,0],[2,0],[13,0],[5,0],
   [1,1],[2,1],[13,3],[15,0],[5,1],
   [1,2],[2,3],[14,0],[13,4],[5,2],
   [9,0],
  ];
  expect(practicePatterns('ch3-115')).toHaveLength(expected.length);
  for(const [index,[type,difficulty]] of expected.entries()){
   const p=createPracticeBattle(ch3Sprites,source,defaultLoadout(),'ch3-115',index,11,{chapterHost:installChapter3BossHost});
   for(let f=0;f<35;f++){p.step();p.rt.draw();}
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
    for(let f=0;f<35;f++){p.step();p.rt.draw();}
    expect(p.rt.globals.mnfight,`${id} pattern ${i} (${patterns[i].name})`).toBe(2);
    const live=p.rt.instances.filter(o=>o.live),enemy=p.rt.byId(p.rt.globals.monsterinstance?.[0]);
    if(id==='ch1-8')expect(live.find(o=>o.object.name==='obj_dbulletcontroller')?.type,patterns[i].name).toBe([2,4][i]);
    if(id==='ch1-12'||id==='ch1-27')expect(live.find(o=>o.object.name==='obj_checkers_leap')?.leapmode,patterns[i].name).toBe([0,3,1,2][i]);
    if(id==='ch1-20'){
     const dc=live.find(o=>o.object.name==='obj_dbulletcontroller');
     expect(dc?.type,patterns[i].name).toBe([20,21,24,24,24,24][i]);
     if(i>=2)expect(dc?.difficulty,patterns[i].name).toBe([6,10,30,90][i-2]);
    }
    if(id==='ch1-40')expect(enemy?.attack,patterns[i].name).toBe([1,2,3,4,5,6,7,8,9,10,11,6][i]);
   }
  }
  setSourceText(ch2Text);
  for(const id of ['ch2-57','ch2-58','ch2-59','ch2-60','ch2-61','ch2-62','ch2-63','ch2-81','ch2-82','ch2-83','ch2-84','ch2-89']){
   const patterns=practicePatterns(id);
   expect(patterns.length).toBeGreaterThan(0);
   for(let i=0;i<patterns.length;i++){
    const p=createPracticeBattle(ch2Sprites,source,defaultLoadout(),id,i,11,{
     development:true,
     neoHost:id==='ch2-61'?installNeoHost:undefined,
     chapterHost:id!=='ch2-61'?installChapter2BossHost:undefined,
    });
    for(let f=0;f<(id==='ch2-63'?60:45);f++){p.step();p.rt.draw();}
    expect(p.rt.globals.mnfight,`${id} pattern ${i} (${patterns[i].name})`).toBe(2);
    const live=p.rt.instances.filter(o=>o.live),enemy=p.rt.byId(p.rt.globals.monsterinstance?.[0]);
    const controller=(enemy&&'dc' in enemy?p.rt.byId(enemy.dc):undefined)??live.find(o=>o.object.name==='obj_dbulletcontroller');
    if(id==='ch2-57'||id==='ch2-89'){
     const manager=live.find(o=>o.object.name==='obj_tasque_manager_enemy')!,dc=p.rt.byId(manager.dc);
     expect(dc?.type,patterns[i].name).toBe(id==='ch2-57'?(i<3?20:32):i===1?20:32);
     if(dc?.type===32)expect(dc.difficulty,patterns[i].name).toBe(id==='ch2-57'?i-3:i===0?4:i-2);
    }
    if(id==='ch2-58')expect(controller?.type,patterns[i].name).toBe([8,10,9,8][i]);
    if(id==='ch2-59')expect(controller?.type,patterns[i].name).toBe([112,3,6,100,106,110,2,2.1,2.2,113,6.1,107,111,115,116,5,1][i]);
    if(id==='ch2-61'){
     if([3,11,14].includes(i))expect(controller?.object.name,patterns[i].name).toBe('obj_sneo_phonecall');
     else expect(controller?.type,patterns[i].name).toBe([0,6,1.5,0,8.5,12,1.5,0,12,8.5,8.5,0,6,1.5,0,9][i]);
     expect(enemy?.difficulty,patterns[i].name).toBe([1,0,0,0,0,0,2,3,0,1,2,1,1,1,3,0][i]);
    }
    if(id==='ch2-62')expect(live.find(o=>o.object.name==='obj_musicalbullet_controller')?.enemy_count,patterns[i].name).toBe([3,2,1][i]);
    if(id==='ch2-63')expect(controller?.type,patterns[i].name).toBe([26,26,27,28][i]);
    if(id==='ch2-82')expect(controller?.type,patterns[i].name).toBe([8,10,9,9][i]);
    if(id==='ch2-83')expect(enemy?.cursor_count,patterns[i].name).toBe([1,1,2][i]);
   }
  }
 });
});
