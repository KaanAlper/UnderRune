import {describe,it,expect} from 'vitest';
import {spriteBank} from '../src/remake/gm/sprites';
import {defaultLoadout,type EquipmentSource} from '../src/game/loadout';
import {EngineBattle} from '../src/remake/host/engine';
import {KEY,heart,heroParent,returnHeart} from '../src/remake/deltarune/battle';
import {findController} from '../src/remake/deltarune/controller';
import {writer} from '../src/remake/deltarune/writer';
import {attackPress,spellPhase} from '../src/remake/deltarune/party';
import {hasSourceText} from '../src/remake/host/text';
import fs from 'node:fs';
import {loadSprites} from './parity/reference';
import {throwRalsei,ralseiThrown} from '../src/remake/bosses/kround';
// Battles run by the game's own controller, driven by key presses. Clover's lines come from the locally built bundle.
const gear={id:0,name:'',description:'',attack:0,defense:0,magic:0,allowed:[1,2,3]};
const equipment:EquipmentSource={armors:[gear],weapons:[gear],items:[{id:9,name:'ChocDiamond',description:'',usable:true,target:1}],bagCapacity:12};
const bank=spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]});
const create=(id='ch1-8',items:number[]=[])=>new EngineBattle(bank,equipment,{...defaultLoadout(),items},id,11,{development:true});
/** One game frame: Step, then Draw (writers and the FIGHT bar read keys in their Draw). */
const frame=(b:EngineBattle,n=1)=>{for(let i=0;i<n;i++){b.step();b.rt.draw();}};
/** A key press, then a few idle frames: the controller ignores Z and X for up to two frames after a choice. */
const press=(b:EngineBattle,key:number)=>{b.rt.input.pressed.add(key);frame(b,4);};
const until=(b:EngineBattle,done:()=>boolean,max=3000)=>{for(let i=0;i<max&&!done();i++)frame(b);expect(done()).toBe(true);};
const text=(b:EngineBattle)=>b.rt.all(writer).map(w=>w.nstring[0] as string);

describe.skipIf(!hasSourceText())('the battle engine (Clover)',()=>{
 it('opens with the battle line in the box, Kris choosing, and the TP bar',()=>{
  const b=create();frame(b,2);const g=b.rt.globals;
  expect(b.rt.count(heroParent)).toBe(2);expect([g.myfight,g.mnfight,g.bmenuno,g.charturn]).toEqual([0,0,0,0]);
  expect(text(b)[0]).toContain('Clover');expect(b.rt.instances.some(i=>i.live&&i.object.name==='obj_tensionbar')).toBe(true);
 });
 it('walks the menus with keys: FIGHT target, back with X, Ralsei spells and DEFEND',()=>{
  const b=create();frame(b,2);const g=b.rt.globals;
  press(b,KEY.z);expect(g.bmenuno).toBe(1);
  press(b,KEY.x);expect(g.bmenuno).toBe(0);
  press(b,KEY.z);frame(b);press(b,KEY.z);expect(g.charturn).toBe(1);expect(g.charaction[0]).toBe(1);
  press(b,KEY.right);press(b,KEY.z);expect(g.bmenuno).toBe(2);
  // Pacify costs 40 TP: with none, Z does nothing.
  press(b,KEY.z);expect(g.bmenuno).toBe(2);
  press(b,KEY.x);expect(g.bmenuno).toBe(0);
  press(b,KEY.x);expect(g.charturn).toBe(0);expect(g.charaction[0]).toBe(0);
 });
 it('runs a whole turn: DEFEND twice, Clover talks and attacks, and the menus come back',()=>{
  const b=create();frame(b,2);const g=b.rt.globals;
  for(let i=0;i<4;i++)press(b,KEY.right);press(b,KEY.z);frame(b);
  for(let i=0;i<4;i++)press(b,KEY.right);press(b,KEY.z);
  expect(g.tension).toBe(80);
  until(b,()=>g.mnfight===1);
  until(b,()=>g.mnfight===2,400);
  until(b,()=>b.rt.exists(heart),60);
  until(b,()=>g.myfight===0&&g.mnfight===0,1500);
  expect(b.turn).toBe(1);expect(text(b)[0]).toBeTruthy();
 });
 it('casts Heal Prayer through the spell phase',()=>{
  const b=create();frame(b,2);const g=b.rt.globals;g.tension=250;
  press(b,KEY.right);press(b,KEY.right);press(b,KEY.right);press(b,KEY.right);press(b,KEY.z);frame(b);
  g.hp[3]=20;
  press(b,KEY.right);press(b,KEY.z);press(b,KEY.right);press(b,KEY.z);expect(g.bmenuno).toBe(8);press(b,KEY.down);press(b,KEY.z);expect(g.chartarget[1]).toBe(1);
  expect(g.charaction[1]).toBe(2);expect(g.charspecial[1]).toBe(2);
  until(b,()=>b.rt.exists(spellPhase),20);
  until(b,()=>g.hp[3]>20,200);expect(g.hp[3]).toBe(20+7*5);
  // The spell line waits for Z, as in the game; then the (empty) FIGHT bar passes and Clover's turn begins.
  until(b,()=>b.rt.all(writer).some(w=>w.halt!==0),200);press(b,KEY.z);
  until(b,()=>!b.rt.exists(spellPhase)&&!b.rt.exists(attackPress),400);expect(g.mnfight).toBe(1);
 });
});

describe.skipIf(!hasSourceText())('the battle engine (K.Round)',()=>{
 for(const id of ['ch1-12','ch1-27'])it(`${id}: three heroes DEFEND, K.Round takes its turn, and the menus come back`,()=>{
  const b=create(id);frame(b,2);const g=b.rt.globals;
  expect(b.rt.count(heroParent)).toBe(3);expect(text(b)[0]).toBeTruthy();
  for(let slot=0;slot<3;slot++){for(let i=0;i<4;i++)press(b,KEY.right);press(b,KEY.z);}
  expect(g.charaction).toEqual([10,10,10]);
  until(b,()=>g.mnfight===2,600);
  until(b,()=>g.myfight===0&&g.mnfight===0,3000);
  expect(b.turn).toBe(1);expect(b.outcome).toBeNull();
 });
});

// Crown removal depends on sprite dimensions and throw collisions on the original masks.
describe.skipIf(!hasSourceText()||!fs.existsSync('extracted/chapter1_windows/sprites.json'))('K.Round keyboard ACTs and victory',()=>{
 const make=(id:string)=>new EngineBattle(loadSprites(1),equipment,defaultLoadout(),id,11);
 const defend=(b:EngineBattle)=>{press(b,KEY.left);press(b,KEY.z);};
 const act=(b:EngineBattle,choice:number)=>{
  const g=b.rt.globals;
  // The previous turn's menu position is retained; navigate from that position.
  for(let i=0;i<5&&g.bmenucoord[0][0]!==1;i++)press(b,KEY.right);
  expect(g.bmenucoord[0][0]).toBe(1);
  press(b,KEY.z);press(b,KEY.z);expect(g.bmenuno).toBe(9);
  for(let i=0;i<3&&g.bmenucoord[9][0]>=2;i++)press(b,KEY.up);
  if(g.bmenucoord[9][0]%2===1)press(b,KEY.left);
  if(choice>=2)press(b,KEY.down);if(choice%2===1)press(b,KEY.right);
  expect(g.bmenucoord[9][0]).toBe(choice);press(b,KEY.z);
  expect(g.bmenuno).toBe(0);
  for(let i=0;i<3&&g.myfight===0&&g.charturn<3;i++)defend(b);
  expect(g.myfight).toBe(3);
 };
 const advance=(b:EngineBattle,done:()=>boolean,max=6000)=>{
  for(let i=0;i<max&&!done()&&!b.outcome;i++){
   if(b.rt.all(writer).some(w=>w.halt!==0))b.rt.input.pressed.add(KEY.z);
   // Move the soul into the upper left during enemy attacks; no HP or controller state is patched.
   if(b.rt.exists(heart)){b.rt.input.held.add(KEY.up);b.rt.input.held.add(KEY.left);}
   else b.rt.input.held.clear();
   frame(b);
  }
  b.rt.input.held.clear();expect(done()).toBe(true);expect(b.outcome).not.toBe('defeat');
 };
 it('ch1-12: Bow and Deep Bow progress the crown through ACT menus and remove it for victory',()=>{
  const b=make('ch1-12');frame(b,2);const enemy=b.enemy!,g=b.rt.globals;
  const progress:number[]=[];
  for(const choice of [1,2,2,2,2,2]){
   act(b,choice);progress.push(enemy.crown);
   advance(b,()=>b.outcome==='victory'||(g.myfight===0&&g.mnfight===0));
  }
  expect(progress).toEqual([15,35,55,75,95,115]);expect(b.outcome).toBe('victory');expect(g.monster).toEqual([0,0,0]);
  expect(b.turn).toBe(5);
 });
 it('ch1-27: Bow progresses the crown by 18 through its ACT menu',()=>{
  const b=make('ch1-27');frame(b,2);act(b,1);expect(b.enemy!.crown).toBe(18);
  advance(b,()=>b.rt.globals.myfight===0&&b.rt.globals.mnfight===0);expect(b.turn).toBe(1);
 });
 it('ch1-27: Susie’s Idea unlocks the keyboard throw, crown hits progress it and win',()=>{
  const b=make('ch1-27');frame(b,2);const enemy=b.enemy!,g=b.rt.globals;
  const progress:number[]=[];
  for(let n=0;n<3;n++){
   act(b,2);advance(b,()=>b.rt.exists(throwRalsei));
   const t=b.rt.first(throwRalsei)!;expect(enemy.thrown).toBe(2);
   // C locks the angle, then locks power. Use a reproducible rising trajectory toward the crown.
   until(b,()=>t.angle===30);press(b,KEY.c);
   until(b,()=>t.mypower>=25&&t.throwalpha>=.9);press(b,KEY.c);
   expect(b.rt.exists(ralseiThrown)).toBe(true);
   advance(b,()=>b.outcome==='victory'||(g.myfight===0&&g.mnfight===0));progress.push(enemy.crown);
  }
  expect(progress).toEqual([35,70,105]);expect(b.outcome).toBe('victory');expect(g.monster).toEqual([0,0,0]);expect(b.turn).toBe(2);
 });
});

describe.skipIf(!hasSourceText())('the battle engine (Lancer)',()=>{
 it('Susie attacks on her own; after the fourth bike attack Lancer says goodbye and the battle is won',()=>{
  const b=create('ch1-2');frame(b,2);const g=b.rt.globals;
  expect(g.char).toEqual([1,2,0]);expect(g.charauto[2]).toBe(1);
  for(let turn=0;turn<4;turn++){
   until(b,()=>g.myfight===0&&g.mnfight===0,3000);
   for(let i=0;i<4;i++)press(b,KEY.right);press(b,KEY.z);
   expect(g.charaction[0]).toBe(10);
   until(b,()=>g.mnfight===1,400);
   until(b,()=>g.mnfight===2,400);
   if(turn<3)until(b,()=>g.mnfight===0,3000);
  }
  // His last words wait for Z, page by page.
  for(let i=0;i<4000&&!b.outcome;i++){if(b.rt.all(writer).some(w=>w.halt!==0))b.rt.input.pressed.add(KEY.z);frame(b);}
  // Lancer marks his own outcome (4) each time he talks; scr_monsterdefeat keeps it.
  expect(b.outcome).toBe('victory');expect(g.flag[51]).toBe(4);
 });
});

describe.skipIf(!hasSourceText())('the battle engine (Jevil)',()=>{
 it.each([[2.1316282072803006e-13,true],[.00002,false]])('ends an enemy turn at the original comparison tolerance (%s)',(remainder,ended)=>{
  const b=create('ch1-25'),g=b.rt.globals,c=findController(b.rt)!;
  g.myfight=-1;g.mnfight=2;g.turntimer=1+remainder;c.reset=0;c.timeron=1;
  b.enemy!.talked=1;b.enemy!.attacked=1;b.rt.create(heart,310,160);
  b.step();expect(c.reset).toBe(ended?1:0);expect(b.rt.exists(heart)).toBe(!ended);expect(b.rt.exists(returnHeart)).toBe(ended);
 });
 it('three DEFENDs, Jevil talks, attacks with his first pattern, and the menus come back',()=>{
  const b=create('ch1-25');frame(b,2);const g=b.rt.globals;
  expect(b.rt.count(heroParent)).toBe(3);expect(g.monstername[0]).toBeTruthy();
  for(let slot=0;slot<3;slot++){for(let i=0;i<4;i++)press(b,KEY.right);press(b,KEY.z);}
  until(b,()=>g.mnfight===1,400);
  until(b,()=>g.mnfight===2,400);
  until(b,()=>b.rt.instances.some(i=>i.live&&i.object.name==='obj_dbulletcontroller'),60);
  until(b,()=>g.myfight===0&&g.mnfight===0,3000);
  expect(b.turn).toBe(1);expect(b.outcome).toBeNull();
 });
});
