// obj_lancerboss as the battle engine runs it (encounter 2): his speech and target, the bike attack, the battle
// line it leaves, the Check / Warning / Compliment ACTs, and after the fourth attack his last words and exit.
// The bike itself is obj_lancerbike (bike.ts).
import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {C} from '../../gm/graphics';
import {findController,mercyAdd,monsterDefeat} from '../../deltarune/controller';
import {actsDoneAttackPhase,defineEnemy,endTalkAfter} from '../../deltarune/enemy';
import {battleTextDefault,enemyBalloon,writer} from '../../deltarune/writer';
import {optionalSourceText} from '../../host/text';
import {lancerBike,lancerBoss} from './bike';

const L=(n:number)=>optionalSourceText(`obj_lancerboss_slash_Step_0_gml_${n}_0`);
function create(s:GmInstance){
 Object.assign(s,{bikeflip:0,becomeflash:0,turnt:0,turns:0,talktimer:0,talkmax:90,state:0,flash:0,siner:0,fsiner:0,talked:0,attacked:0,hurt:0,hurttimer:0,hurtshake:0,
  mywriter:343249823,acting:0,actcon:0,acttimer:0,mercymod:0,maxmercy:9999,warned:0,compliment:0,compliment_just:0,attacks:0,dodgetimer:0,candodge:1,con:0,shakex:0,imageSpeed:0});
}
/** His line: one per turn, or his reaction to the last compliment. */
function talk(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,me=s.myself as number;
 g.flag[51+me]=4;g.targeted[s.mytarget]=1;
 g.typer=50;
 if(s.turns===0)g.msg[0]=L(17);if(s.turns===1)g.msg[0]=L(18);if(s.turns===2)g.msg[0]=L(19);if(s.turns>=3)g.msg[0]=L(20);
 if(s.compliment_just===1){if(s.compliment===1)g.msg[0]=L(26);if(s.compliment===2)g.msg[0]=L(30);if(s.compliment===3)g.msg[0]=L(34);s.compliment_just=0;}
 enemyBalloon(rt,s.x-235,s.y-65,3);
}
/** His bike: the race, then the laps, in turn. */
function attack(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,me=s.myself as number;
 const bike=rt.create(lancerBike,s.x,s.y);s.bike=bike.id;s.visible=false;
 if(s.attacks===0){bike.racecon=1;s.attacks=1;}else{bike.lcon=1;s.attacks=0;}
 bike.target=s.mytarget;bike.damage=g.monsterat[me]*5;
 g.turntimer=999;
}
function statusLine(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;
 s.rr=Math.floor(rt.random.random(5));
 g.battlemsg[0]=L([90,91,92,93,94][s.rr]);
 if(s.turns===1){g.typer=47;g.fc=1;g.fe=2;g.battlemsg[0]=L(100);}
}
function acts(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,me=s.myself as number;
 if(s.acting===1&&s.actcon===0){s.actcon=1;g.msg[0]=L(118);g.msg[1]=L(119);battleTextDefault(rt,s);}
 if(s.acting===2&&s.actcon===0){
  s.actcon=1;
  if(g.automiss[me]===0){g.msg[0]=L(130);g.automiss[me]=1;}else g.msg[0]=L(135);
  battleTextDefault(rt,s);
 }
 if(s.acting===3&&s.actcon===0){
  if(s.compliment>=3)g.msg[0]=L(145);
  if(s.compliment===2){g.msg[0]=L(150);g.msg[1]=L(151);mercyAdd(s,rt,me,20);}
  if(s.compliment===1){g.msg[0]=L(157);g.msg[1]=L(158);mercyAdd(s,rt,me,20);g.monsterat[me]+=1;}
  if(s.compliment===0){g.msg[0]=L(164);g.msg[1]=L(165);mercyAdd(s,rt,me,20);g.monsterat[me]-=1;}
  s.compliment_just=1;s.compliment+=1;battleTextDefault(rt,s);s.actcon=1;
 }
}
/** Spared: his parting lines, then he rides off. */
function leave(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,me=s.myself as number;
 if(s.con===1){s.alarm[4]=5;s.con=2;}
 if(s.con===3){
  g.typer=50;for(let i=0;i<7;i++)g.msg[i]=L(196+i);
  s.con=4;enemyBalloon(rt,s.x-235,s.y-65,3);
 }
 if(s.con===4&&!rt.exists(writer)){
  s.hspeed=20;s.con=5;s.alarm[4]=15;
  const c=findController(rt);if(c){c.noreturn=0;c.alarm[2]=17;}
 }
 if(s.con===6){
  g.monstergold[me]+=10;if((g.plot??0)<22)g.plot=22;
  monsterDefeat(s,rt);rt.destroy(s);s.con=7;
 }
}
function draw(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;
 if(s.state===3){
  s.hurttimer-=1;
  if(s.hurttimer<0)s.state=0;
  else{
   if(g.monster[s.myself]===0){if((g.plot??0)<22)g.plot=22;s.hspeed=12;s.turnt-=8;s.vspeed=-4;}
   s.hurtshake+=1;
   if(s.hurtshake>1){if(s.shakex>0)s.shakex-=1;if(s.shakex<0)s.shakex+=1;s.shakex=-s.shakex;s.hurtshake=0;}
   rt.drawSprite('spr_lancerbike_hurt',s.hurttimer/2,s.x+s.shakex,s.y,2,2,0,s.imageBlend,1);
  }
 }
 if(s.state===4){
  s.dodgetimer+=1;const amt=Math.cos(s.dodgetimer*2*Math.PI/15)*2;
  rt.drawSprite('spr_lancerbike_l',0,s.x,s.y,amt,2,0,s.imageBlend,1);
  if(s.dodgetimer>=15)s.state=0;
 }
 if(s.state===0){
  s.siner+=1;
  rt.drawSprite('spr_lancerbike',s.siner/5,s.x,s.y,2,2,0,s.imageBlend,1);
  if(s.flash===1){s.fsiner+=1;rt.drawSpriteFog('spr_lancerbike',s.siner/5,s.x,s.y,2,2,0,C.white,-Math.cos(s.fsiner/5)*0.4+0.6);}
 }
 if(s.becomeflash===0)s.flash=0;
 s.becomeflash=0;
}
/** The engine's Lancer: obj_lancerboss with its own events, under the shared enemy parent. */
/** The first Lancer fight: the standard enemy (deltarune/enemy.ts) with these steps of his own. He attacks as soon
 * as the enemy turn starts. */
export const lancerEnemy:GmObjectDef=defineEnemy({name:lancerBoss.name,index:lancerBoss.index,depth:90,sprite:lancerBoss.sprite,parent:lancerBoss},{
 create:s=>create(s),
 talk,endTalk:endTalkAfter(15),
 attackDelay:0,attack,statusLine,
 acts,actsDone:actsDoneAttackPhase,afterStep:leave,
 // Event 12: where damage numbers appear.
 monsterPosition:(s,rt)=>[s.x,s.y-rt.spriteHeight(s)/2-30],
 events:{draw},
});
