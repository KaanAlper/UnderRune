import {describe,it,expect} from 'vitest';
import {EngineBattle} from '../src/remake/host/engine';
import {spriteBank} from '../src/remake/gm/sprites';
import {defaultLoadout,type EquipmentSource} from '../src/game/loadout';
import {KEY,gameOver,marker} from '../src/remake/deltarune/battle';
import {findController} from '../src/remake/deltarune/controller';
import {endBattle,deviceFailure,gotoGameOverRoom} from '../src/remake/deltarune/battle-end';
import {scriptDelayedOn,setVar} from '../src/remake/deltarune/chapter2-battle';
import {writer} from '../src/remake/deltarune/writer';
import {hasSourceText} from '../src/remake/host/text';
import type {HookedDef} from '../src/remake/deltarune/rules';
import type {GmObjectDef} from '../src/remake/gm/runtime';
import {gigaMenuHooks} from '../src/remake/bosses/giga-queen/menu';

const gear={id:0,name:'',description:'',attack:0,defense:0,magic:0,allowed:[1,2,3]};
const equipment:EquipmentSource={armors:[gear],weapons:[gear],items:[],bagCapacity:12};
function battle(){
 const b=new EngineBattle(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]}),equipment,defaultLoadout(),'ch1-8',11,{scoring:true});
 for(let i=0;i<3;i++){b.step();b.rt.draw();}
 return b;
}
const press=(b:EngineBattle,key:number)=>{b.rt.input.pressed.add(key);b.step();b.rt.draw();};

describe.skipIf(!hasSourceText())('battle ending confirmation',()=>{
 for(const key of [KEY.z,KEY.enter]){
  it(`processes source victory rewards before skipping with ${key}`,()=>{
   const b=battle(),g=b.rt.globals,c=findController(b.rt)!;
   const gold=g.gold??0,xp=g.xp??0;g.monstergold[3]=20;g.monsterexp[3]=7;g.tension=0;
   g.hp[1]=-10;c.victory=1;
   press(b,key);
   expect(g.gold).toBe(gold+20);expect(g.xp).toBe(xp+7);expect(g.hp[1]).toBeGreaterThan(0);
   expect(b.outcome).toBe('victory');expect(b.rt.exists(endBattle)).toBe(false);
   const result=b.result;expect(result).not.toBeNull();const elapsed=g.time;press(b,key);
   expect(b.result).toBe(result);expect(g.time).toBe(elapsed);
  });
  it(`skips an already scored victory fade with ${key}`,()=>{
   const b=battle();b.rt.create(endBattle,0,0);b.rt.pendingRoom='battle_end';b.step();
   const result=b.result;expect(result).not.toBeNull();expect(b.outcome).toBeNull();
   press(b,key);expect(b.outcome).toBe('victory');expect(b.result).toBe(result);
  });
 }
 for(const fields of [{endcon:1},{sparecon:1},{kris_cutscene:1},{talked:-1}]){
  it(`does not erase active combat text because an object has ${Object.keys(fields)[0]}`,()=>{
   const b=battle();b.rt.destroy(b.enemy!);b.rt.globals.mnfight=2;b.rt.globals.turntimer=100;
   b.rt.create({name:'attack_cleanup',index:90000,events:{create:s=>Object.assign(s,fields)}},0,0);
   const text=b.rt.first(writer)!;expect(text).toBeDefined();
   press(b,KEY.z);expect(text.live).toBe(true);expect(b.ending).toBeNull();expect(b.outcome).toBeNull();
  });
 }
 it('does not declare Giga Queen victory merely because a rocket actor exists',()=>{
  const b=battle();b.rt.destroy(b.enemy!);b.rt.globals.mnfight=2;b.rt.globals.turntimer=100;
  b.rt.create({name:'obj_rocketpunch_bhero',index:90000,events:{create:s=>{s.done=0;}}},0,0);
  press(b,KEY.enter);expect(b.result).toBeNull();expect(b.outcome).toBeNull();
 });
 it('dismisses text through an enemy ending hook without inventing a victory',()=>{
  const b=battle();b.rt.destroy(b.enemy!);b.rt.globals.mnfight=2;b.rt.globals.turntimer=100;
  const ending:HookedDef={name:'ending_owner',index:90000,hooks:{canSkipEndingText:()=>true}};
  b.rt.create(ending,0,0);const text=b.rt.first(writer)!;
  press(b,KEY.enter);expect(text.live).toBe(false);expect(b.result).toBeNull();expect(b.outcome).toBeNull();
 });
 it('reads Giga ending text permission from the boxing opponent rather than the enemy proxy',()=>{
  const b=battle(),defs:Record<string,GmObjectDef>={};
  const object=(name:string)=>defs[name]??(defs[name]={name,index:91000+Object.keys(defs).length});
  const hook=gigaMenuHooks(object).canSkipEndingText!;
  const proxy=b.rt.create(object('obj_gigaqueen_enemy'),0,0);
  expect(hook(proxy,b.rt)).toBe(false);
  const queen=b.rt.restore(object('o_boxingqueen'),999999,0,0,{final_sequence_red_state:0});
  expect(hook(proxy,b.rt)).toBe(false);queen.final_sequence_red_state=1;expect(hook(proxy,b.rt)).toBe(true);
 });
 it('keeps the source victory delay and fade when confirm is absent',()=>{
  const b=battle(),c=findController(b.rt)!;c.victory=1;b.step();
  expect(c.victoried).toBe(1);expect(b.ending).toBeNull();expect(b.outcome).toBeNull();
 });
 it('stops scoring at committed victory, independently of ending dialogue wait',()=>{
  const quick=battle(),waiting=battle();
  findController(quick.rt)!.victory=1;findController(waiting.rt)!.victory=1;
  press(quick,KEY.z);waiting.step();
  expect(waiting.outcome).toBeNull();expect(waiting.result).not.toBeNull();
  const result=waiting.result!;expect(result.duration_ms).toBe(quick.result!.duration_ms);
  for(let i=0;i<30;i++){waiting.rt.globals.hp[1]--;waiting.step();waiting.rt.draw();}
  press(waiting,KEY.enter);expect(waiting.result).toBe(result);
  expect(waiting.result!.damage).toBe(quick.result!.damage);
 });
 for(const key of [KEY.z,KEY.enter])it(`hurries the initial defeat screen with ${key} while keeping the retry choice`,()=>{
  const b=battle();gameOver(b.rt);b.step();b.step();press(b,key);press(b,key);
  expect(b.rt.room.name).toBe('PLACE_FAILURE');expect(b.outcome).toBeNull();expect(b.afterDefeat).toBeNull();
 });
 it('only hurries delayed scripts owned by the failure dialogue',()=>{
  const b=battle();gotoGameOverRoom(b.rt,'PLACE_FAILURE');
  const failure=b.rt.first(deviceFailure)!,foreign=b.rt.create(marker,0,0);
  const owned=scriptDelayedOn(failure,b.rt,setVar,30,'EVENT',10);
  const other=scriptDelayedOn(foreign,b.rt,setVar,30,'x',50);
  press(b,KEY.z);expect(owned.alarm[0]).toBe(1);expect(other.alarm[0]).toBe(29);
 });
 for(const chapter of [1,2,3])it(`retains the source gamepad button order in chapter ${chapter}'s failure screen`,()=>{
  const b=battle();b.rt.globals.chapter=chapter;gotoGameOverRoom(b.rt,'PLACE_FAILURE');
  expect(b.rt.first(deviceFailure)!.gamepad_controls).toEqual([32769,32770,32771,32772,32773,32775,32774,32776,32777,32778,32779,32780,32781,32782,32783,32784]);
 });
 for(const chapter of [1,2,3])it(`returns chapter ${chapter}'s committed give-up to the menu without waiting for the closing voice`,()=>{
  const b=battle();gameOver(b.rt);b.step();
  b.rt.globals.chapter=chapter;gotoGameOverRoom(b.rt,'PLACE_FAILURE');
  const failure=b.rt.first(deviceFailure)!;failure.EVENT=5;b.rt.globals.choice=1;
  const result=b.result;b.rt.globals.flag[1045]=4;
  b.step();
  expect(b.afterDefeat).toBe('menu');expect(b.outcome).toBe('defeat');
  expect(b.result).toBe(result);expect(b.result).toBeNull();
  expect(b.session().flags[1045]).toBe(4);
  expect(failure.EVENT).toBe(27);expect(b.rt.exists(writer)).toBe(true);
 });
 it('returns the Knight GO FORWARD choice to the menu after applying its source side effects',()=>{
  const b=battle();gameOver(b.rt);b.step();
  const g=b.rt.globals;g.chapter=3;g.tempflag[93]=1;g.secretbossattempts=1;
  gotoGameOverRoom(b.rt,'PLACE_FAILURE');
  const failure=b.rt.first(deviceFailure)!;failure.knight_mode_con=52;g.choice=1;
  b.step();
  expect(b.afterDefeat).toBe('menu');expect(b.outcome).toBe('defeat');
  expect(failure.knight_mode_con).toBe(56);expect(g.tempflag[90]).toBe(1);expect(g.flag[1047]).toBe(2);
  expect(b.session().globals.knight_battle_losses).toBe(1);
 });
 for(const state of [{chapter:1,event:1,choice:1},{chapter:2,event:3,choice:1},{chapter:3,event:5,choice:0},{chapter:3,event:-1,choice:1,knight:51},{chapter:3,event:-1,choice:0,knight:52}]){
  it(`keeps the failure screen for an uncommitted or retry choice ${JSON.stringify(state)}`,()=>{
   const b=battle();gameOver(b.rt);b.step();
   const g=b.rt.globals;g.chapter=state.chapter;
   if(state.knight!==undefined){g.tempflag[93]=1;g.secretbossattempts=1;}
   gotoGameOverRoom(b.rt,'PLACE_FAILURE');
   const failure=b.rt.first(deviceFailure)!;failure.EVENT=state.event;
   if(state.knight!==undefined)failure.knight_mode_con=state.knight;
   g.choice=state.choice;b.step();
   expect(b.outcome).toBeNull();expect(b.afterDefeat).toBeNull();
  });
 }
});
