// obj_lancerboss2 as the battle engine runs it (encounter 20): Lancer fights Kris and Ralsei while Susie, on his side,
// talks each turn. Kris's turn is always a talk with Susie; Lancer attacks with falling spades (bullet controller
// types 20, 21 and 24) and loses heart as his HP drops. The seventh talk ends the battle in the game's cutscene.
import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {C} from '../../gm/graphics';
import {darkMarker,darkener,growtangle,heroKris,heroSusie,monsterParent,moveHeart,sndFreeAll} from '../../deltarune/battle';
import {attackPhase,randomTarget} from '../../deltarune/controller';
import {defineEnemy} from '../../deltarune/enemy';
import {defeatRun} from '../../deltarune/party';
import {destroyWriters,enemyBalloon,face,writer} from '../../deltarune/writer';
import {optionalSourceText as lang} from '../../host/text';
import {bulletController} from '../jevil/controller';

const L=(n:number|string)=>lang(`obj_lancerboss2_slash_Step_0_gml_${n}${typeof n==='number'?'_0':''}`);
function create(s:GmInstance){
 Object.assign(s,{bikeflip:0,becomeflash:0,turnt:0,turns:0,talktimer:0,talkmax:90,state:0,flash:0,siner:0,fsiner:0,talked:0,attacked:0,hurt:0,hurttimer:0,hurtshake:0,
  mywriter:343249823,acting:0,actcon:0,acttimer:0,mercymod:0,maxmercy:9999,warned:0,compliment:0,tired:0,attacks:0,dodgetimer:0,candodge:0,con:0,battlecancel:0,nexttry:0,
  mytarget:3,imageSpeed:0,imageXscale:2,imageYscale:2,idlesprite:'spr_lancer_battle',hurtsprite:'spr_lancer_battle_hurt',sparedsprite:'spr_lancer_battle',hurtlevel:0,hmake:0,firstskip:1,shakesine:0,shakex:0});
}
/** Kris has no choice on this battle's first turn: the talk with Susie starts at once. */
function firstTurn(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;
 if(s.firstskip!==1)return;
 g.acting[0]=1;s.acting=1;destroyWriters(rt);for(const f of rt.all(face))rt.destroy(f);
 if(g.charaction[0]===1)g.attacking=1;
 g.charturn=3;g.myfight=3;
}
/** He does not talk: Susie does, through Kris's ACT. The soul comes in once her words are gone (scr_blconskip(-1)). */
function endTalk(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;
 if(s.talked!==1||g.mnfight!==1)return;
 s.rtimer=0;
 if(!rt.exists(writer))g.mnfight=2;
 if(g.mnfight===2){
  if(!rt.exists(moveHeart)&&s.hmake===0){const k=rt.first(heroKris);if(k)rt.create(moveHeart,k.x+10,k.y+40);s.hmake=1;}
  if(!rt.exists(growtangle))rt.create(growtangle,rt.view.x+320,rt.view.y+170);
 }
}
/** Falling spades (types 20 and 21), then the spade rain (type 24) harder each turn; weaker on a weak Kris. */
function attack(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,me=s.myself;
 g.turntimer=140;
 const weak=g.hp[g.char[0]]<=70;
 if(s.turns===0||s.turns===2||s.turns===1){
  const dc=rt.create(bulletController,s.x,s.y);s.dc=dc.id;dc.type=s.turns===1?21:20;dc.target=s.mytarget;dc.damage=g.monsterat[me]*(weak?3:5);g.turntimer=180;
 }
 if(s.turns>=3){
  const dc=rt.create(bulletController,s.x,s.y);s.dc=dc.id;dc.difficulty=s.turns*2;if(s.turns===6)dc.difficulty=30;if(s.turns===7)dc.difficulty=90;
  dc.type=24;dc.target=s.mytarget;dc.damage=g.monsterat[me]*5;
 }
}
/** Kris's turn is always the talk with Susie; the seventh one ends the battle. */
function acts(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,me=s.myself;
 if(s.acting===1&&s.actcon===0){
  s.firstskip=0;g.typer=53;s.rr=rt.random.choose(0,1,2,3);s.actcon=1;
  if(s.turns===0)g.msg[0]=L(120);
  if(s.turns===1)g.msg[0]=L(121);
  if(s.turns===2){g.msg[0]=L(122);g.msg[1]=L('122_1');}
  if(s.turns===3)g.msg[0]=L(123);
  if(s.turns===4)g.msg[0]=L(124);
  if(s.turns===5){g.msg[0]=L(127);for(const h of rt.all(heroSusie)){h.idlesprite='spr_susieb_idle_serious';h.attacksprite='spr_susieb_attack_serious';}}
  if(s.turns===6){g.msg[0]=L(135);g.msg[1]=L(136);g.msg[2]=L(137);for(const h of rt.all(heroSusie)){h.idlesprite='spr_susieb_idle';h.attacksprite='spr_susieb_attack';}}
  if(s.turns===7){g.typer=54;g.msg[0]=L('145_0');g.msg[1]=L('145_1');g.msg[2]=L('145_2');s.actcon=2;}
  g.monsterdf[me]-=5;
  // Susie is not in the party here: the runner reads her position as 0.
  const sus=rt.first(heroSusie);enemyBalloon(rt,(sus?.x??0)+100,sus?.y??0,7);
  for(const w of rt.all(writer))w.skippable=0;
 }
}
function actsDone(s:GmInstance,rt:GmRuntime){
 if(s.actcon===1&&!rt.exists(writer)){s.actcon=0;attackPhase(rt);}
 if(s.actcon===2&&!rt.exists(writer)){
  sndFreeAll(rt);rt.sound?.('snd_laz_c');
  const black=darkMarker(rt,rt.view.x-20,rt.view.y-20,'spr_pixel_white');black.imageBlend=C.black;black.depth=-10000;black.imageXscale=900;black.imageYscale=900;
  s.actcon=3;s.acttimer=0;
  // The game hands over to obj_lancerbattle2_event's scene; the remake ends the battle here.
  rt.pendingRoom='battle_end';
 }
}
function draw(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,me=s.myself as number;
 if(s.state===3){
  s.shakesine=0;s.siner=0;s.hurttimer-=1;
  if(s.hurttimer<0)s.state=0;
  else{
   if(g.monster[me]===0){defeatRun(s,rt);return;}
   s.hurtshake+=1;if(s.hurtshake>1){if(s.shakex>0)s.shakex-=1;if(s.shakex<0)s.shakex+=1;s.shakex=-s.shakex;s.hurtshake=0;}
   if(g.monsterhp[me]/g.monstermaxhp[me]<=0.65)s.hurtlevel=1;
   if(g.monsterhp[me]/g.monstermaxhp[me]<=0.2)s.hurtlevel=2;
   rt.drawSprite(s.hurtsprite,0,s.x+s.shakex*2,s.y,2,2,0,s.imageBlend,1);
  }
 }
 if(s.state===0){
  s.shakesine+=1;s.siner+=1;
  s.shx=rt.random.random(Math.sin(s.shakesine/6)*s.hurtlevel/1.5);
  s.thissprite=g.mercymod[me]>=g.mercymax[me]?s.sparedsprite:s.idlesprite;
  rt.drawSprite(s.thissprite,s.hurtlevel,s.x+s.shx,s.y,2,2,0,s.imageBlend,1);
  if(s.flash===1){s.fsiner+=1;rt.drawSpriteFog(s.thissprite,s.hurtlevel,s.x,s.y,2,2,0,C.white,-Math.cos(s.fsiner/5)*0.4+0.6);}
 }
 if(s.becomeflash===0)s.flash=0;
 s.becomeflash=0;
}
/** The engine's second Lancer: the standard enemy (deltarune/enemy.ts) with these steps of his own. */
export const lancerEnemy2:GmObjectDef=defineEnemy({name:'obj_lancerboss2',index:287,depth:90,sprite:'spr_lancer_battle'},{
 create:s=>create(s),
 beforeStep:firstTurn,
 beforeTalk:(s,rt)=>{const g=rt.globals;g.flag[51+s.myself]=4;g.acting[0]=1;s.acting=1;},
 talk:s=>{s.actcon=0;},
 endTalk,attack,
 attackWait:(_s,rt)=>{rt.globals.turntimer=150;},
 statusLine:(_s,rt)=>{rt.globals.battlemsg[0]=L(88);},
 afterAttack:(s,rt)=>{if(rt.globals.mnfight===2&&rt.globals.turntimer<=10)s.hmake=0;},
 acts,actsDone,
 events:{draw},
});
