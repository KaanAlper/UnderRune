// K.Round (obj_checkers_enemy, encounters 12 and 27): the standard enemy (deltarune/enemy.ts) with its own steps. He
// does not talk: his turn goes straight to the attack. Below 1000 HP (600 after the first time) he drinks milk instead
// of attacking. The ACTs bow (adding to his crown points), and in the second fight Susie throws Ralsei at his crown;
// at 100 crown points the battle ends with his transformation.
import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {gt,le} from '../../gm/math';
import {battleController,darkMarker,darkener,dmgWriter,growtangle,heart,heroKris,heroRalsei,heroSusie,moveHeart,moveHeartIn,sndFreeAll} from '../../deltarune/battle';
import {attackPhase,inputName,randomTarget} from '../../deltarune/controller';
import {defineEnemy} from '../../deltarune/enemy';
import {healAnim,oflashOf} from '../../deltarune/party';
import {battleText,battleTextDefault,destroyWriters,msgFace,writer} from '../../deltarune/writer';
import {sourceText} from '../../host/text';
import {bowCrown,checkersAfterimage,startCheckersAttack} from './attacks';
import {throwTarget,throwRalsei} from './throw';
import {checkerTransform} from './transform';

const lang=(line:number,variant=0)=>sourceText(`obj_checkers_enemy_slash_Step_0_gml_${line}_${variant}`);
const msg=(rt:GmRuntime,line:number,index=0)=>{rt.globals.msg[index]=lang(line);};
const kill=(rt:GmRuntime,...ids:number[])=>{for(const id of ids){const a=rt.byId(id);if(a)rt.destroy(a);}};
/** A hero bows: hidden, replaced by a flashing bowing marker that leaves an afterimage. */
function heroBow(rt:GmRuntime,s:GmInstance,def:GmObjectDef,sprite:string,slot:number){
 const g=rt.globals,actor=rt.first(def)!;actor.visible=false;g.faceaction[slot]=0;g.charaction[slot]=0;
 const b=darkMarker(rt,s,actor.x,actor.y,sprite);oflashOf(b,rt);const a=checkersAfterimage(b,rt);a.hspeed=5;a.depth=b.depth+1;return b.id;
}

function create(s:GmInstance){
 Object.assign(s,{bikeflip:0,becomeflash:0,turnt:0,turns:0,talktimer:0,talkmax:5,state:0,flash:0,siner:0,fsiner:0,talked:0,attacked:0,hurt:0,hurttimer:0,hurtshake:0,shakex:0,
  mywriter:343249823,acting:0,actcon:0,acttimer:0,mercymod:0,maxmercy:9999,warned:0,compliment:0,tired:0,attacks:0,dodgetimer:0,candodge:0,con:0,battlecancel:0,nexttry:0,
  mytarget:3,imageSpeed:0,imageXscale:2,imageYscale:2,checked:0,crown:0,attacktype:0,thrown:0,thissprite:'spr_checkers_idle',scon:0,secondtime:0,bowcounter:0,ralsei_lecture:0,
  milk_counter:0});
}
/** No words: a target, the darkness, the box and soul (unless he is about to drink milk), and the enemy turn. */
function startTalk(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;
 randomTarget(s,rt);
 if(!rt.exists(darkener))rt.create(darkener,0,0);
 s.milkmax=s.milk_counter>0?600:1000;
 if(gt(g.monsterhp[s.myself],s.milkmax)){
  if(!rt.exists(moveHeart)&&!rt.exists(heart))moveHeartIn(rt);
  if(!rt.exists(growtangle))rt.create(growtangle,rt.view.x+320,rt.view.y+170);
 }
 g.mnfight=2;s.rtimer=0;g.typer=50;s.talked=2;s.attacked=0;s.talktimer=0;
}
/** His leaps, or the milk when his HP is low (he counts the turn only when he attacks). */
function attack(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;
 s.talked=0;s.milkmax=s.milk_counter>0?600:1000;
 if(le(g.monsterhp[s.myself],s.milkmax)){if(s.scon===0)s.scon=1;}
 else{const a=startCheckersAttack(s,rt);if(a)s.dc=a.id;}
 g.turntimer=999;
}
function statusLine(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,me=s.myself;
 s.rr=rt.random.choose(0);
 g.battlemsg[0]=lang(77);if(g.monsterstatus[me]===1)g.battlemsg[0]=lang(79);
 if(le(g.monsterhp[me],g.monstermaxhp[me]/3))g.battlemsg[0]=lang(80);
 if(s.crown>0)g.battlemsg[0]=lang(82).replaceAll('~1',String(s.crown));
}
function afterAttack(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;
 if(g.mnfight===2&&le(g.turntimer,1)){
  if(s.battlecancel===1)g.mercymod[s.myself]=999;
  if(s.battlecancel===2){for(const c of rt.all(battleController))c.noreturn=1;s.con=1;s.battlecancel=3;}
 }
}
/** The milk: a carton appears, shrinks into him, and he heals 300 (700 later); Ralsei and Susie comment the first time. */
function milk(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;
 if(s.scon===1){if(s.milk_counter>0)s.scon=1.5;else{destroyWriters(rt);msg(rt,119);battleTextDefault(rt,s);s.scon=1.5;}}
 if(s.scon===1.5&&!rt.exists(writer)){
  rt.sound?.('snd_magicsprinkle');destroyWriters(rt);msg(rt,129);g.turntimer=999;battleTextDefault(rt,s);
  const m=darkMarker(rt,s,s.x-100,s.y+60,'spr_checkers_milk');s.milk=m.id;m.imageSpeed=0;m.imageXscale=4;m.imageYscale=4;m.imageAlpha=0;m.depth=s.depth-1;s.scon=2;s.milktimer=0;
 }
 if(s.scon===2){const m=rt.byId(s.milk)!;m.imageXscale-=.2;m.imageYscale-=.2;m.imageAlpha+=.1;s.milktimer+=1;if(s.milktimer>=10){s.scon=3;s.milktimer=0;m.imageAlpha=1.4;}}
 if(s.scon===3){s.milktimer+=1;if(s.milktimer>=25){s.scon=4;s.milktimer=0;}}
 if(s.scon===4){
  const m=rt.byId(s.milk)!;m.hspeed+=2;m.imageAlpha-=.1;s.milktimer+=1;
  if(s.milktimer===10){
   if(g.monsterat[s.myself]<10)g.monsterat[s.myself]+=.5;rt.sound?.('snd_power');s.milkheal=s.milk_counter===0?300:700;g.monsterhp[s.myself]+=s.milkheal;
   const w=rt.create(dmgWriter,g.monsterx[s.myself],g.monstery[s.myself]);s.healamt=w.id;w.delay=8;w.type=3;w.damage=s.milkheal;
   rt.create(healAnim,s.x,s.y).target=s.id;
  }
  if(s.milktimer>=15){kill(rt,s.milk);s.scon=5;s.milktimer=0;}
 }
 if(s.scon===5){s.milktimer+=1;if(s.milktimer>=30){
  destroyWriters(rt);
  if(s.milk_counter>0){s.scon=0;s.milktimer=0;g.turntimer=0;}
  else{s.scon=6;msg(rt,226);msgFace(rt,1,'ralsei',3);msg(rt,228,2);msgFace(rt,3,'susie',3);msg(rt,230,4);battleTextDefault(rt,s);}
  s.milk_counter+=1;
 }}
 if(s.scon===6){if(!rt.exists(writer)){g.fc=0;s.scon=0;s.milktimer=0;g.turntimer=0;}else g.turntimer=999;}
}
/** Ralsei's lecture on bowing, after the first bow (and after the double bow). */
function lecture(s:GmInstance,rt:GmRuntime){
 const d=s.actcon===30;
 msg(rt,d?445:330);msgFace(rt,1,'ralsei',0);msg(rt,d?447:332,2);msg(rt,d?448:333,3);msg(rt,d?449:334,4);msgFace(rt,5,'susie',0);msg(rt,d?451:336,6);msg(rt,d?452:337,7);
 msgFace(rt,8,'ralsei',1);msg(rt,d?454:339,9);s.ralsei_lecture=1;
}
/** Check, bow (Kris), bow together (Kris and Ralsei) or the Ralsei throw (second fight), and the warning. The end of
 * an ACT is checked between them, as in the original. */
function acts(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;
 s.xx=rt.view.x;s.yy=rt.view.y;
 if(s.acting===1&&s.actcon===0){
  s.actcon=1;
  if(s.secondtime===0){msg(rt,s.checked===1?268:263);g.actname[s.myself][0]=lang(264);g.flag[246]=1;s.checked=1;}
  else{msg(rt,g.flag[246]===1?277:282);msg(rt,g.flag[246]===1?278:283,1);s.checked=1;}
  battleTextDefault(rt,s);
 }
 if(s.acting===2&&s.actcon===0){bowCrown(s,false);msg(rt,296);s.bowkris=heroBow(rt,s,heroKris,'spr_krisb_bow',0);rt.sound?.('snd_item');battleTextDefault(rt,s);s.actcon=20;}
 if(s.actcon===20&&!rt.exists(writer)){
  s.visible=false;const b=darkMarker(rt,s,s.x,s.y,'spr_checkers_bow');s.bowcheck=b.id;b.imageSpeed=.334;g.fc=0;g.typer=4;msg(rt,327);
  if(s.ralsei_lecture===0&&s.secondtime===0)lecture(s,rt);
  if(s.thrown===0&&s.secondtime===1&&s.bowcounter>=0&&s.bowcounter<=2){
   g.fc=2;g.fe=s.bowcounter===2?8:3;g.typer=45;
   const lines=[[349,350,352],[359,360,362],[369,370,372]][s.bowcounter];msg(rt,lines[0]);msg(rt,lines[1],1);msgFace(rt,2,'susie',s.bowcounter===2?7:s.bowcounter+1);msg(rt,lines[2],3);
  }
  s.bowcounter+=1;battleText(rt,s);s.actcon=21;
 }
 if(s.actcon===21&&!rt.exists(writer)){kill(rt,s.bowkris,s.bowcheck);s.visible=true;for(const k of rt.all(heroKris))k.visible=true;s.actcon=1;}
 if(s.secondtime===0&&s.acting===3&&s.actcon===0){
  bowCrown(s,true);msg(rt,398);s.bowkris=heroBow(rt,s,heroKris,'spr_krisb_bow',0);s.bowral=heroBow(rt,s,heroRalsei,'spr_ralseib_bow',1);rt.sound?.('snd_item');battleTextDefault(rt,s);s.actcon=30;
 }
 if(s.actcon===30&&!rt.exists(writer)){
  s.visible=false;const b=darkMarker(rt,s,s.x,s.y,'spr_checkers_bow');s.bowcheck=b.id;b.imageSpeed=.5;msg(rt,442);if(s.ralsei_lecture===0&&s.secondtime===0)lecture(s,rt);battleTextDefault(rt,s);s.actcon=31;
 }
 if(s.actcon===31&&!rt.exists(writer)){kill(rt,s.bowral,s.bowkris,s.bowcheck);s.visible=true;for(const k of rt.all(heroKris))k.visible=true;for(const r of rt.all(heroRalsei))r.visible=true;s.actcon=1;}
 if(s.secondtime===1&&s.acting===3&&s.actcon===0){
  if(s.thrown===1){kill(rt,s.trsus);s.thrown=2;}
  if(s.thrown>0){
   g.actname[s.myself][2]=lang(487);g.msg[0]=lang(489)+inputName(6)+lang(489,1);s.flash=0;s.becomeflash=0;battleTextDefault(rt,s);s.actcon=90;
   rt.create(throwTarget,s.x,s.y);const sus=rt.first(heroSusie)!;s.throwsus=rt.create(throwRalsei,sus.x,sus.y).id;s.visible=false;g.faceaction[1]=0;g.charaction[1]=0;g.faceaction[2]=0;g.charaction[2]=0;
   for(const h of rt.all(heroSusie))h.visible=false;for(const h of rt.all(heroRalsei))h.visible=false;rt.sound?.('snd_grab');
  }else{
   g.typer=31;g.fc=2;g.fe=6;msg(rt,510);msgFace(rt,1,'susie',0);msg(rt,512,2);msg(rt,513,3);msgFace(rt,4,'ralsei',8);msg(rt,515,5);msg(rt,516,6);msgFace(rt,7,'susie',2);msg(rt,518,8);
   s.actcon=10;battleText(rt,s);
  }
 }
 if(s.acting===4&&s.actcon===0){s.actcon=1;msg(rt,531);msg(rt,532,1);if(s.warned===1){msg(rt,535);msg(rt,536,1);}if(s.warned===2){msg(rt,540);msg(rt,541,1);msg(rt,542,2);g.battleat[2]*=1.5;}s.warned+=1;battleTextDefault(rt,s);}
 if(s.actcon===1&&!rt.exists(writer)){s.actcon=0;if(s.crown>=100){g.mercymod[s.myself]=999;s.actcon=50;}else attackPhase(rt);}
 if(s.actcon===10&&!rt.exists(writer)){
  s.actcon=11;s.alarm[4]=30;for(const h of rt.all(heroSusie))h.visible=false;for(const h of rt.all(heroRalsei))h.visible=false;
  s.thrown=1;const sus=rt.first(heroSusie)!;s.trsus=darkMarker(rt,s,sus.x,sus.y,'spr_susieb_throwralseiready').id;rt.sound?.('snd_grab');
 }
 if(s.actcon===12){g.fe=7;msg(rt,578);msg(rt,579,1);battleText(rt,s);s.actcon=13;}
 if(s.actcon===13&&!rt.exists(writer))s.actcon=0;
 if(s.actcon===50){s.visible=false;sndFreeAll(rt);const anim=rt.create(checkerTransform,s.x,s.y);s.animtest=anim.id;anim.sprite='spr_smallchecker_transform3';anim.imageXscale=2;anim.imageYscale=2;anim.type=1;s.actcon=51;}
}
function draw(s:GmInstance,rt:GmRuntime){
 if(s.state===3){s.hurttimer-=1;if(s.hurttimer<0)s.state=0;else{
  if(rt.globals.monster?.[s.myself]===0){s.hspeed=12;s.turnt-=8;s.vspeed=-4;}
  s.hurtshake+=1;if(s.hurtshake>1){if(s.shakex>0)s.shakex-=1;if(s.shakex<0)s.shakex+=1;s.shakex=-s.shakex;s.hurtshake=0;}
  s.siner=0;rt.drawSprite('spr_checkers_idle',0,s.x+s.shakex,s.y,2,2,0,s.imageBlend,1);
 }}
 if(s.state===0){s.siner+=1;s.thissprite='spr_checkers_idle';rt.drawSprite(s.thissprite,s.siner/3,s.x,s.y,2,2,0,s.imageBlend,1);
  if(s.flash===1){s.fsiner+=1;rt.drawSpriteFog(s.thissprite,s.siner/3,s.x,s.y,2,2,0,0xffffff,-Math.cos(s.fsiner/5)*.4+.6);}
 }
 if(s.becomeflash===0)s.flash=0;s.becomeflash=0;s.sprite=s.thissprite;s.imageIndex=s.siner/3;
}

export const checkersEnemy:GmObjectDef=defineEnemy({name:'obj_checkers_enemy',index:261,depth:90,sprite:'spr_checkers_idle'},{
 create,
 beforeStep:(s,rt)=>{if(rt.globals.monstertype[s.myself]===21)s.secondtime=1;},
 beforeTalk:(s,rt)=>{rt.globals.flag[51+s.myself]=4;if(s.secondtime===1){s.milk_counter=99;s.ralsei_lecture=99;}},
 startTalk,
 endTalk:(s,rt)=>{if(s.talked===2)rt.globals.mnfight=2;},
 attack,countTurn:false,statusLine,
 attackWait:(_s,rt)=>{rt.globals.turntimer=120;},
 afterAttack,afterEnemyTurn:milk,
 acts,actsDone:()=>{},
 afterStep:(s,rt)=>{if(rt.globals.myfight===7)s.hspeed=15;},
 monsterPosition:(s,rt)=>[s.x+rt.spriteWidth(s)/4,s.y+rt.spriteHeight(s)/4],
 events:{
  alarm4:s=>{s.actcon+=1;},
  // Event 11: story flags for the overworld fields where small checkers are fought.
  user11:(_s,rt)=>{const room=rt.room.name;if(room==='room_field1')rt.globals.flag[500]+=1;if(room==='room_field2'&&rt.globals.flag[50]!==0)rt.globals.flag[501]=rt.globals.flag[50];},
  draw,
 },
});
