import {describe,it,expect} from 'vitest';
import {spriteBank} from '../src/remake/gm/sprites';
import {defaultLoadout,type EquipmentSource} from '../src/game/loadout';
import {EngineBattle} from '../src/remake/host/engine';
import {KEY,heart,heroParent} from '../src/remake/deltarune/battle';
import {writer} from '../src/remake/deltarune/writer';
import {attackPress,spellPhase} from '../src/remake/deltarune/party';
import {hasSourceText} from '../src/remake/host/text';
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
