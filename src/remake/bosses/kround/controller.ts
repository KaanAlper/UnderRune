import type {GmInstance,GmRuntime,GmObjectDef} from '../../gm/runtime';
import {le,gt} from '../../gm/math';
import {heart,moveHeart,growtangle,darkener,heroKris,heroRalsei,heroSusie,battleController,darkMarker,dmgWriter} from '../../deltarune/battle';
import {checkersEnemy,checkersLeap,startCheckersAttack,bowCrown,checkersAfterimage} from './attacks';
import {throwTarget,throwRalsei} from './throw';
export interface KRoundHost{
 lang:(id:string)=>string;
 writerExists:()=>boolean;
 clearWriters:()=>void;
 battleText:(useDefault:boolean)=>void;
 face:(slot:number,hero:'ralsei'|'susie',emotion:number)=>void;
 inputName:()=>string;
 attackPhase:()=>void;
 flash:(actor:GmInstance)=>void;
 healAnimation:GmObjectDef;
 checkerTransform:GmObjectDef;
 monsterSetup:(enemy:GmInstance)=>void;
 roomName:()=>string;
}
export function requireKRoundHost(rt:GmRuntime):KRoundHost{
 const host=rt.globals.kroundHost as KRoundHost|undefined;if(!host)throw Error('K.Round enemy event requires kroundHost source callbacks');return host;
}
/** Enemy Step: independent if blocks are intentionally ordered as in the native
 * event. A transition can run the following state's first frame immediately. */
export function checkersStep(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;
 const host=()=>requireKRoundHost(rt),writer=()=>host().writerExists();
 const lang=(line:number,variant=0)=>host().lang(`obj_checkers_enemy_slash_Step_0_gml_${line}_${variant}`);
 const msg=(line:number,index=0)=>{g.msg[index]=lang(line);};
 const text=(def=true)=>{if(def){g.fc=0;g.typer=4;}host().battleText(def);};
 const face=(slot:number,hero:'ralsei'|'susie',emotion:number)=>host().face(slot,hero,emotion);
 const by=(id:number)=>rt.byId(id);
 const kill=(...ids:number[])=>{for(const id of ids){const a=by(id);if(a)rt.destroy(a);}};
 const heroBow=(def:GmObjectDef,sprite:string,slot:number)=>{
  const actor=rt.first(def)!;actor.visible=false;g.faceaction[slot]=0;g.charaction[slot]=0;
  const b=darkMarker(rt,actor.x,actor.y,sprite);host().flash(b);const a=checkersAfterimage(b,rt);a.hspeed=5;a.depth=b.depth+1;return b.id;
 };
 if(g.monstertype[s.myself]===21)s.secondtime=1;
 if(g.monster[s.myself]===1){
  g.flag[51+s.myself]=4;if(s.secondtime===1){s.milk_counter=99;s.ralsei_lecture=99;}
  if(g.mnfight===1&&s.talked===0){
   s.abletotarget=g.charcantarget.every((v:number)=>v===0)?0:1;s.mytarget=rt.random.choose(0,1,2);
   if(s.abletotarget===1)while(g.charcantarget[s.mytarget]===0)s.mytarget=rt.random.choose(0,1,2);else s.mytarget=3;g.targeted[s.mytarget]=1;
   if(!rt.exists(darkener))rt.create(darkener,0,0);s.milkmax=s.milk_counter>0?600:1000;
   if(gt(g.monsterhp[s.myself],s.milkmax)){
    if(!rt.exists(moveHeart)&&!rt.exists(heart)){const k=rt.first(heroKris)!;rt.create(moveHeart,k.x+10,k.y+40);}
    if(!rt.exists(growtangle))rt.create(growtangle,rt.view.x+320,rt.view.y+170);
   }
   g.mnfight=2;s.rtimer=0;g.typer=50;s.talked=2;s.attacked=0;s.talktimer=0;
  }
  if(s.talked===2)g.mnfight=2;
  if(g.mnfight===2&&s.attacked===0){s.rtimer+=1;if(s.rtimer===12){
   s.talked=0;s.milkmax=s.milk_counter>0?600:1000;
   if(le(g.monsterhp[s.myself],s.milkmax)){if(s.scon===0)s.scon=1;}
   else{const attack=startCheckersAttack(s,rt);if(attack)s.dc=attack.id;else s.turns+=1;s.siner=0;s.visible=false;}
   g.turntimer=999;s.attacked=1;g.typer=6;g.fc=0;s.rr=rt.random.choose(0);
   g.battlemsg[0]=lang(77);if(g.monsterstatus[s.myself]===1)g.battlemsg[0]=lang(79);
   if(le(g.monsterhp[s.myself],g.monstermaxhp[s.myself]/3))g.battlemsg[0]=lang(80);
   if(s.crown>0)g.battlemsg[0]=lang(82).replaceAll('~1',String(s.crown));
  }else g.turntimer=120;}
  if(g.mnfight===2&&le(g.turntimer,1)){
   if(s.battlecancel===1)g.mercymod[s.myself]=999;
   if(s.battlecancel===2){for(const c of rt.all(battleController))c.noreturn=1;s.con=1;s.battlecancel=3;}
  }
 }
 if(s.scon===1){if(s.milk_counter>0)s.scon=1.5;else{host().clearWriters();msg(119);text();s.scon=1.5;}}
 if(s.scon===1.5&&!writer()){
  rt.sound?.('snd_magicsprinkle');host().clearWriters();msg(129);g.turntimer=999;text();
  const milk=darkMarker(rt,s.x-100,s.y+60,'spr_checkers_milk');s.milk=milk.id;milk.imageSpeed=0;milk.imageXscale=4;milk.imageYscale=4;milk.imageAlpha=0;milk.depth=s.depth-1;s.scon=2;s.milktimer=0;
 }
 if(s.scon===2){const milk=by(s.milk)!;milk.imageXscale-=.2;milk.imageYscale-=.2;milk.imageAlpha+=.1;s.milktimer+=1;if(s.milktimer>=10){s.scon=3;s.milktimer=0;milk.imageAlpha=1.4;}}
 if(s.scon===3){s.milktimer+=1;if(s.milktimer>=25){s.scon=4;s.milktimer=0;}}
 if(s.scon===4){const milk=by(s.milk)!;milk.hspeed+=2;milk.imageAlpha-=.1;s.milktimer+=1;
  if(s.milktimer===10){if(g.monsterat[s.myself]<10)g.monsterat[s.myself]+=.5;rt.sound?.('snd_power');s.milkheal=s.milk_counter===0?300:700;g.monsterhp[s.myself]+=s.milkheal;
   const w=rt.create(dmgWriter,g.monsterx[s.myself],g.monstery[s.myself]);s.healamt=w.id;w.delay=8;w.type=3;w.damage=s.milkheal;
   rt.create(host().healAnimation,s.x,s.y).target=s.id;
  }
  if(s.milktimer>=15){kill(s.milk);s.scon=5;s.milktimer=0;}
 }
 if(s.scon===5){s.milktimer+=1;if(s.milktimer>=30){
  host().clearWriters();if(s.milk_counter>0){s.scon=0;s.milktimer=0;g.turntimer=0;}
  else{s.scon=6;msg(226);face(1,'ralsei',3);msg(228,2);face(3,'susie',3);msg(230,4);text();}s.milk_counter+=1;
 }}
 if(s.scon===6){if(!writer()){g.fc=0;s.scon=0;s.milktimer=0;g.turntimer=0;}else g.turntimer=999;}
 if(g.myfight===3){
  s.xx=rt.view.x;s.yy=rt.view.y;
  if(s.acting===1&&s.actcon===0){s.actcon=1;
   if(s.secondtime===0){msg(s.checked===1?268:263);g.actname[s.myself][0]=lang(264);g.flag[246]=1;s.checked=1;}
   else{msg(g.flag[246]===1?277:282);msg(g.flag[246]===1?278:283,1);s.checked=1;}text();
  }
  if(s.acting===2&&s.actcon===0){bowCrown(s,false);msg(296);s.bowkris=heroBow(heroKris,'spr_krisb_bow',0);rt.sound?.('snd_item');text();s.actcon=20;}
  if(s.actcon===20&&!writer()){
   s.visible=false;const b=darkMarker(rt,s.x,s.y,'spr_checkers_bow');s.bowcheck=b.id;b.imageSpeed=.334;g.fc=0;g.typer=4;msg(327);
   if(s.ralsei_lecture===0&&s.secondtime===0)lecture();
   if(s.thrown===0&&s.secondtime===1){
    if(s.bowcounter>=0&&s.bowcounter<=2){g.fc=2;g.fe=s.bowcounter===2?8:3;g.typer=45;
     const lines=[[349,350,352],[359,360,362],[369,370,372]][s.bowcounter];msg(lines[0]);msg(lines[1],1);face(2,'susie',s.bowcounter===2?7:s.bowcounter+1);msg(lines[2],3);
    }
   }s.bowcounter+=1;text(false);s.actcon=21;
  }
  if(s.actcon===21&&!writer()){kill(s.bowkris,s.bowcheck);s.visible=true;for(const k of rt.all(heroKris))k.visible=true;s.actcon=1;}
  if(s.secondtime===0&&s.acting===3&&s.actcon===0){bowCrown(s,true);msg(398);s.bowkris=heroBow(heroKris,'spr_krisb_bow',0);s.bowral=heroBow(heroRalsei,'spr_ralseib_bow',1);rt.sound?.('snd_item');text();s.actcon=30;}
  if(s.actcon===30&&!writer()){
   s.visible=false;const b=darkMarker(rt,s.x,s.y,'spr_checkers_bow');s.bowcheck=b.id;b.imageSpeed=.5;msg(442);if(s.ralsei_lecture===0&&s.secondtime===0)lecture();text();s.actcon=31;
  }
  if(s.actcon===31&&!writer()){kill(s.bowral,s.bowkris,s.bowcheck);s.visible=true;for(const k of rt.all(heroKris))k.visible=true;for(const r of rt.all(heroRalsei))r.visible=true;s.actcon=1;}
  if(s.secondtime===1&&s.acting===3&&s.actcon===0){
   if(s.thrown===1){kill(s.trsus);s.thrown=2;}
   if(s.thrown>0){g.actname[s.myself][2]=lang(487);g.msg[0]=lang(489)+host().inputName()+lang(489,1);s.flash=0;s.becomeflash=0;text();s.actcon=90;
    rt.create(throwTarget,s.x,s.y);const sus=rt.first(heroSusie)!;s.throwsus=rt.create(throwRalsei,sus.x,sus.y).id;s.visible=false;g.faceaction[1]=0;g.charaction[1]=0;g.faceaction[2]=0;g.charaction[2]=0;
    for(const h of rt.all(heroSusie))h.visible=false;for(const h of rt.all(heroRalsei))h.visible=false;rt.sound?.('snd_grab');
   }else{g.typer=31;g.fc=2;g.fe=6;msg(510);face(1,'susie',0);msg(512,2);msg(513,3);face(4,'ralsei',8);msg(515,5);msg(516,6);face(7,'susie',2);msg(518,8);s.actcon=10;text(false);}
  }
  if(s.acting===4&&s.actcon===0){s.actcon=1;msg(531);msg(532,1);if(s.warned===1){msg(535);msg(536,1);}if(s.warned===2){msg(540);msg(541,1);msg(542,2);g.battleat[2]*=1.5;}s.warned+=1;text();}
  if(s.actcon===1&&!writer()){s.actcon=0;if(s.crown>=100){g.mercymod[s.myself]=999;s.actcon=50;}else host().attackPhase();}
  if(s.actcon===10&&!writer()){s.actcon=11;s.alarm[4]=30;for(const h of rt.all(heroSusie))h.visible=false;for(const h of rt.all(heroRalsei))h.visible=false;
   s.thrown=1;const sus=rt.first(heroSusie)!;s.trsus=darkMarker(rt,sus.x,sus.y,'spr_susieb_throwralseiready').id;rt.sound?.('snd_grab');
  }
  if(s.actcon===12){g.fe=7;msg(578);msg(579,1);text(false);s.actcon=13;}
  if(s.actcon===13&&!writer())s.actcon=0;
  if(s.actcon===50){s.visible=false;rt.stopAllSounds?.();const anim=rt.create(host().checkerTransform,s.x,s.y);s.animtest=anim.id;anim.sprite='spr_smallchecker_transform3';anim.imageXscale=2;anim.imageYscale=2;anim.type=1;s.actcon=51;}
 }
 if(g.myfight===7)s.hspeed=15;
 function lecture(){msg(s.actcon===30?445:330);face(1,'ralsei',0);msg(s.actcon===30?447:332,2);msg(s.actcon===30?448:333,3);msg(s.actcon===30?449:334,4);face(5,'susie',0);msg(s.actcon===30?451:336,6);msg(s.actcon===30?452:337,7);face(8,'ralsei',1);msg(s.actcon===30?454:339,9);s.ralsei_lecture=1;}
}
