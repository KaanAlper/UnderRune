// obj_lancerboss as the battle engine runs it (encounter 2): his speech and target, the bike attack, the battle
// line it leaves, the Check / Warning / Compliment ACTs, and after the fourth attack his last words and exit.
// The bike itself is obj_lancerbike (bike.ts).
import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {C} from '../../gm/graphics';
import {darkener,growtangle,heroKris,moveHeart} from '../../deltarune/battle';
import {attackPhase,button1_p,findController,mercyAdd,monsterDefeat,randomTarget} from '../../deltarune/controller';
import {monsterSetup} from '../../deltarune/encounter';
import {battleTextDefault,enemyBalloon,writer} from '../../deltarune/writer';
import {optionalSourceText} from '../../host/text';
import {lancerBike,lancerBoss} from './bike';

const L=(n:number)=>optionalSourceText(`obj_lancerboss_slash_Step_0_gml_${n}_0`);
function create(s:GmInstance){
 Object.assign(s,{bikeflip:0,becomeflash:0,turnt:0,turns:0,talktimer:0,talkmax:90,state:0,flash:0,siner:0,fsiner:0,talked:0,attacked:0,hurt:0,hurttimer:0,hurtshake:0,
  mywriter:343249823,acting:0,actcon:0,acttimer:0,mercymod:0,maxmercy:9999,warned:0,compliment:0,compliment_just:0,attacks:0,dodgetimer:0,candodge:1,con:0,shakex:0,imageSpeed:0});
}
function step(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,me=s.myself as number;
 if(g.monster[me]===1){
  if(g.mnfight===1&&s.talked===0){
   randomTarget(s,rt);g.flag[51+me]=4;g.targeted[s.mytarget]=1;
   if(!rt.exists(darkener))rt.create(darkener,0,0);
   g.typer=50;
   if(s.turns===0)g.msg[0]=L(17);if(s.turns===1)g.msg[0]=L(18);if(s.turns===2)g.msg[0]=L(19);if(s.turns>=3)g.msg[0]=L(20);
   if(s.compliment_just===1){if(s.compliment===1)g.msg[0]=L(26);if(s.compliment===2)g.msg[0]=L(30);if(s.compliment===3)g.msg[0]=L(34);s.compliment_just=0;}
   enemyBalloon(rt,s.x-235,s.y-65,3);s.talked=1;s.talktimer=0;
  }
  if(s.talked===1&&g.mnfight===1){
   if(button1_p(rt)&&s.talktimer>15)s.talktimer=s.talkmax;
   s.talktimer+=1;
   if(s.talktimer>=s.talkmax){
    // scr_moveheart: the soul leaves Kris.
    if(!rt.exists(moveHeart)){const k=rt.first(heroKris);if(k)rt.create(moveHeart,k.x+10,k.y+40);}
    if(!rt.exists(growtangle))rt.create(growtangle,rt.view.x+320,rt.view.y+170);
    for(const w of rt.all(writer))rt.destroy(w);
    g.mnfight=2;
   }
  }
  if(g.mnfight===2&&s.attacked===0){
   const bike=rt.create(lancerBike,s.x,s.y);s.bike=bike.id;s.visible=false;
   if(s.attacks===0){bike.racecon=1;s.attacks=1;}else{bike.lcon=1;s.attacks=0;}
   bike.target=s.mytarget;bike.damage=g.monsterat[me]*5;
   s.turns+=1;g.turntimer=999;s.attacked=1;
   s.rr=Math.floor(rt.random.random(5));g.typer=6;g.fc=0;
   g.battlemsg[0]=L([90,91,92,93,94][s.rr]);
   if(s.turns===1){g.typer=47;g.fc=1;g.fe=2;g.battlemsg[0]=L(100);}
  }
 }
 if(g.myfight===3){
  if(s.acting===1&&s.actcon===0){s.actcon=1;g.msg[0]=L(118);g.msg[1]=L(119);battleTextDefault(rt);}
  if(s.acting===2&&s.actcon===0){
   s.actcon=1;
   if(g.automiss[me]===0){g.msg[0]=L(130);g.automiss[me]=1;}else g.msg[0]=L(135);
   battleTextDefault(rt);
  }
  if(s.acting===3&&s.actcon===0){
   if(s.compliment>=3)g.msg[0]=L(145);
   if(s.compliment===2){g.msg[0]=L(150);g.msg[1]=L(151);mercyAdd(rt,me,20);}
   if(s.compliment===1){g.msg[0]=L(157);g.msg[1]=L(158);mercyAdd(rt,me,20);g.monsterat[me]+=1;}
   if(s.compliment===0){g.msg[0]=L(164);g.msg[1]=L(165);mercyAdd(rt,me,20);g.monsterat[me]-=1;}
   s.compliment_just=1;s.compliment+=1;battleTextDefault(rt);s.actcon=1;
  }
  if(s.actcon===1&&!rt.exists(writer)){s.actcon=0;attackPhase(rt);}
 }
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
export const lancerEnemy:GmObjectDef={...lancerBoss,parent:lancerBoss,events:{
 create:(s)=>create(s),step,draw,
 alarm4:s=>{s.con+=1;},
 // Event 12: where damage numbers appear, then scr_monstersetup.
 user12:(s,rt)=>{rt.globals.monsterx[s.myself]=s.x;rt.globals.monstery[s.myself]=s.y-rt.spriteHeight(s)/2-30;monsterSetup(s,rt);},
}};
