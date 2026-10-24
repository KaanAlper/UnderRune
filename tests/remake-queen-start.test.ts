import {it,expect} from 'vitest';
import fs from 'node:fs';
import {EngineBattle} from '../src/remake/host/engine';
import {installChapter2BossHost} from '../src/remake/host/chapter2-bosses';
import {defaultLoadout,type EquipmentSource} from '../src/game/loadout';
import {loadSprites} from './parity/reference';
import {setSourceText} from '../src/remake/host/text';
const gear={id:0,name:'Default',description:'',attack:0,defense:0,magic:0,allowed:[1,2,3]};
const equipment:EquipmentSource={weapons:[gear],armors:[gear],items:[],bagCapacity:12};
it.skipIf(!fs.existsSync('public/generated/remake/ch2/bundle.json'))('starts the Queen battle, runs a full turn, and completes the victory ending',()=>{
 setSourceText(JSON.parse(fs.readFileSync('public/generated/remake/ch2/bundle.json','utf8')).text);
 try{
  const b=new EngineBattle(loadSprites(2),equipment,defaultLoadout(),'ch2-59',11,{chapter2Host:installChapter2BossHost});
  for(let i=0;i<60;i++){b.step();b.rt.draw();}
  expect(b.phase).toBe('command');expect(b.enemy?.object.name).toBe('obj_queen_enemy');
  const rt=b.rt,g=rt.globals;
  g.hp=[0,10000,10000,10000];g.maxhp=[...g.hp];let enemyStarted=false;
  for(let i=0;i<1500;i++){
   if(g.myfight===0&&g.mnfight===0)g.bmenucoord[0][g.charturn]=4;
   if(i%4===0){rt.input.pressed.add(90);rt.input.held.add(90);}else{rt.input.held.delete(90);rt.input.released.add(90);}
   b.step();rt.draw();if(g.mnfight===2)enemyStarted=true;if(enemyStarted&&g.mnfight===0&&g.myfight===0)break;
  }
  expect(enemyStarted).toBe(true);expect(b.turn).toBe(1);expect(b.phase).toBe('command');
  // Trigger Queen defeat and verify victory outcome
  g.monsterhp[0]=0;g.myfight=-1;g.mnfight=1;
  for(let i=0;i<400&&!b.outcome;i++){
   if(i%4===0){rt.input.pressed.add(90);rt.input.held.add(90);}else{rt.input.held.delete(90);rt.input.released.add(90);}
   b.step();rt.draw();
  }
  expect(b.outcome).toBe('victory');
 }finally{setSourceText(JSON.parse(fs.readFileSync('public/generated/remake/ch1/bundle.json','utf8')).text);}
});

it.skipIf(!fs.existsSync('public/generated/remake/ch2/bundle.json'))("starts Sweet & K_K & Cap'n, runs a full turn, and completes the victory ending",()=>{
 setSourceText(JSON.parse(fs.readFileSync('public/generated/remake/ch2/bundle.json','utf8')).text);
 try{
  const b=new EngineBattle(loadSprites(2),equipment,defaultLoadout(),'ch2-62',11,{development:true,chapter2Host:installChapter2BossHost});
  for(let i=0;i<60;i++){b.step();b.rt.draw();}
  expect(b.phase).toBe('command');expect(b.enemy?.object.name).toBe('obj_sweet_enemy');
  const rt=b.rt,g=rt.globals;
  g.hp=[0,10000,10000,10000];g.maxhp=[...g.hp];let enemyStarted=false;
  for(let i=0;i<1500;i++){
   if(g.myfight===0&&g.mnfight===0)g.bmenucoord[0][g.charturn]=4;
   if(i%4===0){rt.input.pressed.add(90);rt.input.held.add(90);}else{rt.input.held.delete(90);rt.input.released.add(90);}
   b.step();rt.draw();if(g.mnfight===2)enemyStarted=true;if(enemyStarted&&g.mnfight===0&&g.myfight===0)break;
  }
  expect(enemyStarted).toBe(true);expect(b.turn).toBe(1);expect(b.phase).toBe('command');
  b.enemy!.endcon=1;
  // The native music video runs for 642 Draw frames, after the 150-frame lead-in.
  for(let i=0;i<1000&&!b.outcome;i++){
   if(i%2===0){rt.input.pressed.add(90);rt.input.held.add(90);}else{rt.input.held.delete(90);rt.input.released.add(90);}
   b.step();rt.draw();
  }
  expect(b.outcome).toBe('victory');
 }finally{setSourceText(JSON.parse(fs.readFileSync('public/generated/remake/ch1/bundle.json','utf8')).text);}
});

it.skipIf(!fs.existsSync('public/generated/remake/ch2/bundle.json'))('starts public Berdly battles and verifies GIGA Queen development ending boundary',()=>{
 setSourceText(JSON.parse(fs.readFileSync('public/generated/remake/ch2/bundle.json','utf8')).text);
 try{
  for(const [id,enemyName] of [['ch2-58','obj_berdlyb_enemy'],['ch2-82','obj_berdlyb2_enemy']] as const){
   const b=new EngineBattle(loadSprites(2),equipment,defaultLoadout(),id,11,{chapter2Host:installChapter2BossHost});
   for(let i=0;i<60;i++){b.step();b.rt.draw();}
   expect(b.phase).toBe('command');expect(b.enemy?.object.name).toBe(enemyName);
   const rt=b.rt,g=rt.globals;
   g.hp=[0,10000,10000,10000,10000];g.maxhp=[...g.hp];let enemyStarted=false;
   for(let i=0;i<1500;i++){
    if(g.myfight===0&&g.mnfight===0)g.bmenucoord[0][g.charturn]=4;
    if(i%4===0){rt.input.pressed.add(90);rt.input.held.add(90);}else{rt.input.held.delete(90);rt.input.released.add(90);}
    b.step();rt.draw();if(g.mnfight===2)enemyStarted=true;if(enemyStarted&&g.mnfight===0&&g.myfight===0)break;
   }
   expect(enemyStarted).toBe(true);expect(b.turn).toBe(1);expect(b.phase).toBe('command');
   if(id==='ch2-58')b.enemy!.endcon=1;
   else{g.monster[0]=0;b.enemy!.state=3;}
   for(let i=0;i<300&&!b.outcome;i++){
    if(i%2===0){rt.input.pressed.add(90);rt.input.held.add(90);}else{rt.input.held.delete(90);rt.input.released.add(90);}
    b.step();rt.draw();
   }
   expect(b.outcome).toBe('victory');
  }
  let gigaHost!:ReturnType<typeof installChapter2BossHost>;
  const giga=new EngineBattle(loadSprites(2),equipment,defaultLoadout(),'ch2-84',11,{development:true,chapter2Host:(rt,options)=>{gigaHost=installChapter2BossHost(rt,options);return gigaHost;}});
  for(let i=0;i<60;i++){giga.step();giga.rt.draw();}
  expect(giga.enemy?.object.name).toBe('obj_gigaqueen_enemy');
  const q=giga.rt.instances.find(i=>i.live&&i.object.name==='o_boxingqueen')!;
  q.final_sequence_red_state=1;
  giga.rt.input.pressed.add(90);giga.step();
  expect(giga.outcome).toBeNull();
  // The final cutscene has begun; victory commits only after the player's rocket punch finishes.
  const proxy=giga.enemy!,hook=(proxy.object as import('../src/remake/deltarune/rules').HookedDef).hooks!;
  expect(hook.battleOutcome?.(proxy,giga.rt)).toBeUndefined();
  const rocketDef=gigaHost.objects.obj_rocketpunch_bhero;
  const rocket=giga.rt.create(rocketDef,0,0);rocket.$rocketPunchComplete=1;
  expect(hook.battleOutcome?.(proxy,giga.rt)).toBe('victory');
  giga.step();
  expect(giga.outcome).toBe('victory');
 }finally{setSourceText(JSON.parse(fs.readFileSync('public/generated/remake/ch1/bundle.json','utf8')).text);}
});
