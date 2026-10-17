import fs from 'node:fs';
import {describe,it,expect} from 'vitest';
import {spriteBank} from '../src/remake/gm/sprites';
import {defaultLoadout,type EquipmentSource} from '../src/game/loadout';
import {EngineBattle} from '../src/remake/host/engine';
import {installChapter2BossHost} from '../src/remake/host/chapter2-bosses';
import {KEY,battleBack,gameOver} from '../src/remake/deltarune/battle';
import {deviceChoice,endBattle,gameOverBg} from '../src/remake/deltarune/battle-end';
import {writer} from '../src/remake/deltarune/writer';
import {hasSourceText,setSourceText,sourceText} from '../src/remake/host/text';
import {loadSprites} from './parity/reference';

// How battles end: the win's fade-out (obj_endbattle), and the game over (room_gameover, then PLACE_FAILURE's
// failure screen) up to the player's choice, which the host turns into a retry or the menu.
const gear={id:0,name:'',description:'',attack:0,defense:0,magic:0,allowed:[1,2,3]};
const equipment:EquipmentSource={armors:[gear],weapons:[gear],items:[],bagCapacity:12};
const step=(b:EngineBattle,n=1)=>{for(let i=0;i<n&&!b.outcome;i++){b.step();b.rt.draw();}};
const press=(b:EngineBattle,key:number)=>{b.rt.input.pressed.add(key);step(b);};
/** Frames until `done`, pressing Z every few frames (texts wait for it). */
const until=(b:EngineBattle,done:()=>boolean,max=2000)=>{for(let i=0;i<max&&!done()&&!b.outcome;i++){if(i%6===0)b.rt.input.pressed.add(KEY.z);step(b);}expect(done()).toBe(true);};
const live=(b:EngineBattle,name:string)=>b.rt.instances.filter(i=>i.live&&i.object.name===name);

describe.skipIf(!hasSourceText())('the end of a Chapter 1 battle',()=>{
 const bank=spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]});
 const battle=()=>{const b=new EngineBattle(bank,equipment,defaultLoadout(),'ch1-8',11,{development:true});step(b,5);return b;};

 it('fades the battle out before the win is shown',()=>{
  const b=battle(),rt=b.rt;
  rt.create(endBattle,0,0);rt.pendingRoom='battle_end';
  step(b);
  expect(b.ending).toBe('victory');expect(b.outcome).toBeNull();
  expect(rt.all(battleBack).every(i=>i.destroy===1)).toBe(true);
  step(b,20);
  expect(b.outcome).toBe('victory');
 });

 it('breaks the soul, then asks whether to try again; YES starts the battle again',()=>{
  const b=battle(),rt=b.rt,g=rt.globals;
  g.heartx=300;g.hearty=200;gameOver(rt);step(b);
  expect(b.ending).toBe('defeat');expect(rt.room.name).toBe('room_gameover');
  const init=live(b,'obj_gameover_init')[0];
  step(b,30);expect(init.visible).toBe(true);expect([init.x,init.y]).toEqual([300,200]);
  step(b,20);expect(init.sprite).toBe('spr_heartbreak');
  step(b,40);expect(live(b,'obj_marker').filter(m=>m.sprite==='spr_heartshards')).toHaveLength(6);
  // Without Z presses here: four of them while the soul breaks would skip to the retry.
  step(b,60);expect(rt.room.name).toBe('PLACE_FAILURE');
  expect(rt.view.width).toBe(320);
  until(b,()=>rt.exists(deviceChoice));
  const choice=rt.first(deviceChoice)!;expect(choice.NAME.map((n:string[])=>n[0])).toEqual(['DEVICE_CHOICE_slash_Create_0_gml_22_0','DEVICE_CHOICE_slash_Create_0_gml_23_0'].map(sourceText));
  step(b,12);press(b,KEY.left);press(b,KEY.z);
  until(b,()=>!!b.outcome,600);
  expect(b.outcome).toBe('defeat');expect(b.afterDefeat).toBe('retry');expect(g.tempflag[3]).toBe(1);
 });

 it('NO says the world was covered in darkness and leaves for the menu',()=>{
  const b=battle(),rt=b.rt;
  gameOver(rt);step(b,151);
  until(b,()=>rt.exists(deviceChoice),2500);
  step(b,12);press(b,KEY.right);press(b,KEY.z);
  until(b,()=>rt.exists(writer));
  until(b,()=>!!b.outcome,600);
  expect(b.afterDefeat).toBe('menu');
 });

 it('four presses of Z while the soul breaks retry at once',()=>{
  const b=battle(),rt=b.rt;
  gameOver(rt);step(b,85);
  for(let i=0;i<4;i++)press(b,KEY.z);
  expect(b.afterDefeat).toBe('retry');
 });
});

const ch2='extracted/chapter2_windows/code/';
describe.skipIf(!fs.existsSync(ch2)||!fs.existsSync('public/generated/remake/ch2/bundle.json'))('the end of a Chapter 2 battle',()=>{
 it('shows GAME OVER, lets Susie or Ralsei call Kris back, and offers to continue or give up',()=>{
  setSourceText(JSON.parse(fs.readFileSync('public/generated/remake/ch2/bundle.json','utf8')).text);
  try{
   const b=new EngineBattle(loadSprites(2),equipment,defaultLoadout(),'ch2-57',11,{development:true,chapter2Host:installChapter2BossHost}),rt=b.rt,g=rt.globals;
   step(b,5);gameOver(rt);step(b,151);
   expect(rt.room.name).toBe('PLACE_FAILURE');
   expect(rt.exists(gameOverBg)).toBe(true);
   for(let i=0;i<40&&!rt.exists(writer);i++)step(b);
   expect([60,61]).toContain(g.typer);
   until(b,()=>rt.exists(deviceChoice));
   expect(rt.first(deviceChoice)!.NAME.map((n:string[])=>n[0])).toEqual(['DEVICE_FAILURE_slash_Step_0_gml_103_0_b','DEVICE_FAILURE_slash_Step_0_gml_104_0'].map(sourceText));
   step(b,12);press(b,KEY.right);press(b,KEY.z);
   until(b,()=>!rt.exists(gameOverBg),60);
   until(b,()=>!!b.outcome,800);
   expect(b.afterDefeat).toBe('menu');
  }finally{setSourceText(JSON.parse(fs.readFileSync('public/generated/remake/ch1/bundle.json','utf8')).text);}
 });
});
