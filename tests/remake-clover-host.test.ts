import {describe,it,expect} from 'vitest';
import {GmRuntime} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
import {battleController,heroKris,heroRalsei,heart,growtangle,moveHeart} from '../src/remake/deltarune/battle';
import {cloverBulletController} from '../src/remake/bosses/clover';
import {CloverHost,cloverDefeat} from '../src/remake/host/clover';
const bank=spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]});
function scene(){
 const rt=new GmRuntime(bank,{seed:11});Object.assign(rt.globals,{char:[1,3,0],hp:[0,90,110,70],maxhp:[0,90,110,70],charcantarget:[1,1,0],charmove:[1,1,0],chardead:[0,0,0],charauto:[0,0,0,0],charaction:[0,0,0],charspecial:[0,0,0],targeted:[0,0,0],acting:[0,0,0],faceaction:[0,0,0],tension:0,maxtension:250,inv:-1,invc:1,flag:new Array(1000).fill(0),turntimer:0,chemg_god_mode:true});
 const kris=rt.create(heroKris,80,100),ralsei=rt.create(heroRalsei,80,180);Object.assign(kris,{myheight:40});Object.assign(ralsei,{myheight:40});rt.globals.charinstance=[kris.id,ralsei.id,0];
 const control=rt.create(battleController,0,0);Object.assign(control,{timeron:0,reset:0,noreturn:0,onebuffer:0,twobuffer:0,lbuffer:0,rbuffer:0,grazenoise:0,damagenoise:0});
 const phases:string[]=[],actions:number[]=[];const host=new CloverHost(rt,control,{onPhase:p=>phases.push(p),onActionComplete:()=>actions.push(rt.frame)});
 const tick=(n=1)=>{for(let i=0;i<n;i++){rt.step();host.afterStep();}};
 const finishAct=()=>{for(let n=0;n<15&&rt.globals.myfight===3;n++){host.confirm();tick();}};
 return {rt,host,control,phases,actions,tick,finishAct};
}
describe('standalone native Clover host adapter',()=>{
 it('sets encounter 8/type 16 facts and consumes the unused source setup choice',()=>{
  const {rt,host}=scene(),expected=new GmRuntime(bank,{seed:11}).random;const myact=expected.choose(0,1,2);
  expect([host.body.x,host.body.y,host.body.myself,host.body.myact]).toEqual([400,120,0,myact]);
  expect([rt.globals.monsterhp[0],rt.globals.monstermaxhp[0],rt.globals.monsterat[0],rt.globals.monsterdf[0],rt.globals.monstergold[0]]).toEqual([270,270,6,1,80]);
  expect(rt.globals.battlemsg[0]).toBe('* Clover grew close!');expect(rt.random.snapshot()).toEqual(expected.snapshot());
  expect(host.choices.map(c=>[c.name,c.actor,c.participants])).toEqual([['Check',1,[0]],['TalkBday',3,[0,1]],['TalkBoys',3,[0,1]],['TalkSports',3,[0,1]],['TalkAnimals',1,[0]],['TalkTrees',1,[0]]]);
 });
 it('disables Ralsei joint ACTs when Ralsei is absent or down, without disabling Kris topics',()=>{
  const {rt,host}=scene();rt.globals.hp[3]=0;expect(host.choices.map(c=>c.disabled)).toEqual([false,true,true,true,false,false]);expect(()=>host.beginAct(2)).toThrow(/unavailable/i);
 });
 it('waits for the native Check writer to disappear before dispatching action completion',()=>{
  const {rt,host,tick,actions}=scene();host.beginAct(0);tick();expect(host.dialogue[0].pages[0]).toContain('CLOVER - AT 8 DF 2');expect(actions).toEqual([]);
  expect([host.dialogue[0].typer,host.dialogue[0].fc]).toEqual([4,0]);tick(5);expect(actions).toEqual([]);
  host.confirm();tick();expect(actions).toHaveLength(1);expect(rt.globals.myfight).toBe(1);expect(host.body.argue).toBe(0);
 });
 it('stages TalkBoys as Ralsei, three mouths, then result before applying action completion',()=>{
  const {rt,host,tick,actions}=scene();host.beginAct(2);tick();expect(host.dialogue[0].pages[0]).toContain('What kind of "Boys"');expect([host.dialogue[0].typer,host.dialogue[0].fc]).toEqual([45,2]);
  expect(rt.globals.acting).toEqual([1,1,0]);expect(rt.globals.charaction).toEqual([9,9,0]);expect(rt.globals.mercymod[0]).toBe(0);
  host.confirm();tick();expect(host.dialogue.map(w=>w.face)).toEqual([4,5,6]);expect(host.dialogue.map(w=>[w.x,w.y])).toEqual([[290,110],[275,190],[525,110]]);expect(rt.globals.mercymod[0]).toBe(40);expect(actions).toEqual([]);
  host.confirm();tick();expect(host.dialogue).toHaveLength(1);expect(host.dialogue[0].pages[0]).toContain('enjoyed talking');host.confirm();tick();expect(actions).toHaveLength(1);
 });
 it('keeps Animals two pages and preserves one-shot topic mercy across turns',()=>{
  const {rt,host,tick,finishAct}=scene();host.beginAct(4);tick();expect(host.dialogue[0].pages).toEqual(['* You brought up the topic of Animals.','* Clover didn\'t seem to care...']);
  host.confirm();tick();expect(host.dialogue[0].page).toBe(1);expect(rt.globals.myfight).toBe(3);host.confirm();tick();expect(host.body.argue).toBe(1);
  for(const topic of [2,3,5,5]){host.returnToCommands();host.beginAct(topic);tick();finishAct();}
  expect(rt.globals.mercymod[0]).toBe(120);expect(rt.globals.monsterstatus[0]).toBe(1);expect(host.body.argue).toBe(5);expect(host.body.acted).toEqual([0,0,1,1,0,1]);
 });
 it('lets the native Step own its 210-frame speech and frame-12 controller spawn',()=>{
  const {rt,host,tick,phases}=scene();host.beginEnemyTurn();tick();expect(host.dialogue).toHaveLength(3);expect(rt.count(cloverBulletController)).toBe(0);expect(rt.globals.mnfight).toBe(1);
  tick(208);expect(rt.globals.mnfight).toBe(1);tick();expect(rt.globals.mnfight).toBe(2);expect(rt.count(moveHeart)).toBe(1);expect(rt.count(growtangle)).toBe(1);expect(host.body.rtimer).toBe(1);
  tick(10);expect(rt.count(cloverBulletController)).toBe(0);expect(rt.count(heart)).toBe(1);tick();expect(rt.count(cloverBulletController)).toBe(1);expect(rt.first(cloverBulletController)?.damage).toBe(30);expect(phases).toEqual(['speech','transition','attack']);
 });
 it('honors the native minimum skip delay and resets state for a second original enemy turn',()=>{
  const {rt,host,tick}=scene();host.beginEnemyTurn();tick();host.confirm();tick();expect(rt.globals.mnfight).toBe(1);
  tick(15);host.confirm();tick();expect(rt.globals.mnfight).toBe(2);tick(11);expect(host.body.turns).toBe(1);
  host.returnToCommands();expect([host.body.talked,host.body.attacked,host.body.acting]).toEqual([0,0,0]);host.beginEnemyTurn();tick(17);host.confirm();tick(12);expect(host.body.turns).toBe(2);
 });
 it('invalidates completed text tickets so stale UI completion cannot finish a newer message',()=>{
  const {host,tick}=scene();host.beginAct(2);tick();const old=host.dialogue[0].id;host.completeDialogue(old);tick();expect(host.dialogue).toHaveLength(3);host.completeDialogue(old);expect(host.dialogue).toHaveLength(3);
 });
 it('synchronizes shared combat stats and runs the source hurt/defeat state once',()=>{
  const {rt,host}=scene();expect(host.initialText).toBe('* Clover grew close!');host.syncEnemyStats(200,7,2);
  expect([host.hp,rt.globals.monsterat[0],rt.globals.monsterdf[0]]).toEqual([200,7,2]);
  host.receiveHit(170,30);expect([host.body.shakex,host.body.state,host.body.hurttimer,host.body.hurtamt]).toEqual([9,3,30,30]);
  host.receiveHit(0,170);expect([rt.globals.monster[0],rt.globals.monstergold[3],rt.globals.flag[40],rt.globals.flag[50],rt.globals.flag[51]]).toEqual([0,80,1,1,1]);
  rt.draw();expect(host.body.live).toBe(false);expect(rt.count(cloverDefeat)).toBe(1);expect(rt.first(cloverDefeat)?.sprite).toBe('spr_clubs_hurt');expect(rt.globals.flag[522]).toBe(1);
  host.receiveHit(0,170);rt.draw();expect(rt.globals.monstergold[3]).toBe(80);expect(rt.globals.flag[40]).toBe(1);
 });
});
