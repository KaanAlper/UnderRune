import type {GmInstance,GmRuntime} from '../../gm/runtime';
import {dmgWriter} from '../../deltarune/battle';
import {inputName,nextAct} from '../../deltarune/controller';
import {anyFaceNext,simulText,smallFace,speaker} from '../../deltarune/chapter2-enemy';
import {moveToPointOverTime,moveToRememberXY,msgNext,msgSet,snd} from '../../deltarune/chapter2-battle';
import {battleText,battleTextDefault,writer} from '../../deltarune/writer';
import {oflashOf} from '../../deltarune/party';
import {sourceText} from '../../host/text';
import {type QueenObject,queenInstance} from './context';
const text=(n:number)=>sourceText(`obj_queen_enemy_slash_Step_0_gml_${n}_0`);

/** ACTs use Berdly's private mercy, not Queen's public mercymod. */
export function queenActs(s:GmInstance,rt:GmRuntime,object:QueenObject){
 const g=rt.globals,shield=()=>rt.first(object('obj_queenshield_enemy')),plug=()=>queenInstance(rt,object,'obj_berdlyplug_enemy');
 const xx=rt.view.x;s.yy=rt.view.y;
 const say=(n:number)=>{msgSet(rt,0,text(n));battleTextDefault(rt,s);};
 const loosen=(amount:number)=>{
  amount=Math.min(amount,100-s.bardlymercy);s.bardlymercy+=amount;const b=plug(),w=rt.create(dmgWriter,b.x+20,b.y+20-g.hittarget[0]*20);s.__mercydmgwriter=w.id;w.damage=amount;w.type=5;
  for(const bird of rt.withInstances(object('obj_berdlyplug_enemy')))rt.userEvent(bird,0);
  for(const damage of rt.withInstances(dmgWriter)){damage.x=b.x;damage.y=b.y+20;}
  const first=rt.first(dmgWriter);if(first)first.depth=s.depth-1;s.actcon=1;
 };
 const sh=shield();if(!sh||sh.shieldhurt===2){if(s.acting===4)s.acting=5;else if(s.acting===5)s.acting=6;}else if(s.acting===3)s.acting=5;else if(s.acting===4)s.acting=6;
 if(s.acting===1&&s.actcon===0&&!rt.exists(object('obj_berdlyplug_enemy'))){s.actcon=1;say(338);}
 if(s.acting===1&&s.actcon===0&&rt.exists(object('obj_berdlyplug_enemy'))){
  if(!shield()){say(346);loosen(g.hp[2]<=0&&g.hp[3]<=0?8:5);}
  else{
   s.shield_damage_buffer+=1;if(g.hp[2]<=0&&g.hp[3]<=0)s.shield_damage_buffer+=1.5;
   if(s.krisflattercount===0){
    speaker(s,rt,'no_name');msgSet(rt,0,text(764));anyFaceNext(s,rt,'queen','1');smallFace(s,rt,0,'susie',6,s.jp===0?338:458,46,text(766));msgNext(rt,text(768));battleTextDefault(rt,s);
    s.waitnextactsusie=1;s.waitnextactralsei=1;
    if(s.actingsus===1&&s.susieflattercount>0&&s.actingral===1&&s.ralseiflattercount>0)s.changesimulorder=1;
    if(s.actingsus===1&&s.susieflattercount===0&&s.actingral===1&&s.ralseiflattercount>0)s.changesimulorder=2;
    if(s.actingsus===0&&s.actingral===1&&s.ralseiflattercount>0)s.changesimulorder=2;
    if(s.actingral===0&&s.actingsus===1&&s.susieflattercount>0)s.changesimulorder=5;
   }else{
    let aa=0;if(s.actingsus===1&&s.susieflattercount===0&&s.actingral===1&&s.ralseiflattercount===0)aa=1;
    if(s.actingral!==1&&s.actingsus===1&&s.susieflattercount===0)aa=1;if(s.actingsus!==1&&s.actingral===1&&s.ralseiflattercount===0)aa=1;
    if(s.simultotal===1||aa===1)say(788);
    else{msgSet(rt,0,text(803));simulText(s,rt,'kris');}
    if(s.actingsus===1&&s.susieflattercount===0)s.waitnextactsusie=1;if(s.actingral===1&&s.ralseiflattercount===0)s.waitnextactralsei=1;
    if(s.actingsus===1&&s.susieflattercount===0&&s.actingral===1&&s.ralseiflattercount>0)s.changesimulorder=3;
   }
   s.krisflattercount++;s.acting=100;
  }
 }
 if(s.acting===2&&s.actcon===0){
  if(!shield()){say(371);loosen(15);}else{
   s.shield_damage_buffer+=3;if(s.groupflattercount===0){speaker(s,rt,'ralsei');msgSet(rt,0,text(840));anyFaceNext(s,rt,'susie','1');msgNext(rt,text(842));anyFaceNext(s,rt,'queen','1');msgNext(rt,text(844));battleText(rt,s);}else say(384);
   s.groupflattercount++;s.acting=100;
  }
 }
 if((s.acting===3||s.acting===4)&&s.actcon===0){
  s.throwX=s.acting===3?0:1;s.actcon=32;s.acting=0;s.alarm[4]=15;s.___myrememberx=s.xstart;s.___myremembery=s.ystart;s.siner=0;
  if(!shield()){plug().con=1;rt.create(object('obj_queen_throw_controller'),rt.view.x+380,rt.view.y+50);moveToPointOverTime(s,rt,s.x-40,rt.view.y+195,8);}
 }
 if(s.acting===5&&s.actcon===0){g.msg[0]=text(410);s.actcon=10;battleTextDefault(rt,s);s.acttimer=0;}
 if(s.acting===6&&s.actcon===0){g.msg[0]=text(419);battleTextDefault(rt,s);s.actcon=20;s.acttimer=0;}
 if(s.actingsus===1&&s.actconsus===1&&!(s.waitnextactsusie===1&&rt.exists(writer))){
  if(!shield()){say(429);loosen(g.hp[1]<=0&&g.hp[3]<=0?8:5);}else{
   s.shield_damage_buffer++;if(g.hp[1]<=0&&g.hp[3]<=0)s.shield_damage_buffer+=1.5;
   if(s.susieflattercount===0){speaker(s,rt,'no_name');msgSet(rt,0,text(928));anyFaceNext(s,rt,'susie','1');msgNext(rt,text(930));anyFaceNext(s,rt,'queen','1');msgNext(rt,text(932));battleTextDefault(rt,s);s.waitnextactralsei=1;if(s.actingral===1)s.changesimulorder=2;}
   else if(s.simultotal===1||s.changesimulorder===5){s.waitnextactralsei=1;if(s.changesimulorder===5){s.simulordersus=0;s.changesimulorder=0;}say(946);}
   else{
    if(s.changesimulorder===1){s.simulordersus=0;s.simulorderral=1;s.changesimulorder=0;}
    if(s.actingral===1&&s.ralseiflattercount===0)s.waitnextactralsei=1;if(s.actingral===1&&s.ralseiflattercount>0)s.waitnextactralsei=0;
    msgSet(rt,0,text(955));simulText(s,rt,'susie');
   }
   s.susieflattercount++;s.acting=100;
  }
  s.actconsus=0;s.actingsus=0;
 }
 if(s.actingral===1&&s.actconral===1&&!(s.waitnextactralsei===1&&rt.exists(writer))){
  if(!shield()){say(457);loosen(g.hp[1]<=0&&g.hp[2]<=0?8:5);}else{
   s.shield_damage_buffer++;if(g.hp[1]<=0&&g.hp[2]<=0)s.shield_damage_buffer+=1.5;
   if(s.ralseiflattercount===0){speaker(s,rt,'no_name');msgSet(rt,0,text(1003));anyFaceNext(s,rt,'ralsei','1');msgNext(rt,text(1005));anyFaceNext(s,rt,'queen','1');msgNext(rt,text(1007));battleTextDefault(rt,s);}
   else if(s.simultotal===1||s.changesimulorder===2){if(s.changesimulorder===2){s.simulorderral=0;s.changesimulorder=0;}say(1015);}
   else{if(s.changesimulorder===3){s.simulorderral=1;s.changesimulorder=0;}if(s.changesimulorder===4){s.simulorderral=0;s.changesimulorder=0;}msgSet(rt,0,text(472));simulText(s,rt,'ralsei');}
   s.ralseiflattercount++;s.acting=100;
  }
  s.actconral=0;s.actingral=0;
 }
 if(s.actingral===2&&s.actconral===1){say(483);s.aimact=2;s.actconral=0;s.actingral=0;s.actcon=1;}
 if(s.acting===100&&!rt.exists(writer)){
  s.acting=0;s.actcon=1;s.drunk=1;s.wineglasscon=10;s.drink=1;s.winetimer=0;s.shieldhp-=s.shieldmaxhp*s.shield_damage_buffer/s.shieldactmaxhp;s.shield_damage_buffer=0;
  for(const shield of rt.withInstances(object('obj_queenshield_enemy')))rt.userEvent(shield,0);
  if(s.shieldacthp<=0){msgSet(rt,0,text(504));msgNext(rt,text(505));battleTextDefault(rt,s);}else say(510);
 }
 if(s.actcon===33){
  msgSet(rt,0,s.aimact===0?text(519).replace('~1',inputName(6)):text(520));battleTextDefault(rt,s);
  for(const n of ['obj_herokris','obj_herosusie'])for(const h of rt.withInstances(object(n)))h.visible=false;
  const sus=queenInstance(rt,object,'obj_herosusie'),t=rt.create(object('obj_queen_throwkris'),sus.x,sus.y);s.throwsus=t.id;
  if(s.throwX===1){t.throwXcon=1;for(const h of rt.withInstances(object('obj_heroralsei')))h.visible=false;}s.actcon=34;
 }
 if(s.actcon===35){for(const c of rt.withInstances(object('obj_queen_throw_controller'))){c.con=2;c.lerpintimer=0;}moveToRememberXY(s,rt,8);if(shield())s.actcon=1;else{s.actcon=36;s.alarm[4]=25;}}
 if(s.actcon===37)s.actcon=1;
 if(s.actcon===10){s.acttimer++;if(s.acttimer>=10||!rt.exists(writer)){s.acttimer=0;s.actcon=11;}}
 if(s.actcon===11){
  g.faceaction[1]=2;g.charaction[1]=2;g.charspecial[1]=5;g.chartarget[1]=0;g.acting[1]=0;snd(rt,'snd_boost');soulShine(s,rt,object);
  for(const n of ['obj_herokris','obj_herosusie'])for(const h of rt.withInstances(object(n)))oflashOf(h,rt);s.actcon=12;
 }
 if(s.actcon===12){s.acttimer++;if(s.acttimer>=20){s.actcon=1;for(const h of rt.withInstances(object('obj_herosusie')))h.state=0;}}
 if(s.actcon===20){s.acttimer++;if(s.acttimer>=10||!rt.exists(writer)){s.acttimer=0;s.actcon=21;}}
 if(s.actcon===21){
  g.faceaction[2]=2;g.charaction[2]=2;g.charspecial[2]=6;g.chartarget[2]=0;g.acting[2]=0;snd(rt,'snd_boost');soulShine(s,rt,object);
  for(const n of ['obj_heroralsei','obj_herokris'])for(const h of rt.withInstances(object(n)))oflashOf(h,rt);s.actcon=22;
 }
 if(s.actcon===22){s.acttimer++;if(s.acttimer>=20){s.actcon=1;for(const h of rt.withInstances(object('obj_heroralsei')))h.state=0;}}
 if(s.actcon===1&&!rt.exists(writer)&&!rt.exists(object('obj_queen_drink_droplet'))){s.waitnextactsusie=0;s.waitnextactralsei=0;s.changesimulorder=0;nextAct(rt,s);}
}
function soulShine(s:GmInstance,rt:GmRuntime,object:QueenObject){
 const k=queenInstance(rt,object,'obj_herokris'),a=rt.create(object('obj_animation'),k.x+30,k.y+50);s.heartanim=a.id;
 Object.assign(a,{depth:-20,imageIndex:0,imageXscale:2,imageYscale:2,imageSpeed:1,sprite:'spr_soulshining'});
}
