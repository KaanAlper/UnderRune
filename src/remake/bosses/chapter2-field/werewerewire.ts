// Werewerewire's source event state machines. Independent if blocks intentionally allow same-frame transitions.
import {gmArray,type GmInstance,type GmObjectDef,type GmRuntime} from '../../gm/runtime';
import {pointDirection,pointDistance,le,ge,lt,eq} from '../../gm/math';
import {bulletInit,darkener,growtangle,moveHeart,moveHeartIn} from '../../deltarune/battle';
import {defineEnemy} from '../../deltarune/enemy';
import {nextAct} from '../../deltarune/controller';
import {randomTarget} from '../../deltarune/controller';
import {isPhase,mercyAdd2,msgSet,msgNext,drawBodyPart,turnTimer,snd} from '../../deltarune/chapter2-battle';
import {enemyObjectInit,enemyHurtTiredAfterDamage,enemyDrawHurtGeneric,monsterPop,simulText,actCharSpriteEnd,terminateWriter,speaker} from '../../deltarune/chapter2-enemy';
import {battleTextDefault,writer} from '../../deltarune/writer';
import {button1_p} from '../../deltarune/keys';
import {sourceText} from '../../host/text';
const text=(key:string)=>sourceText('obj_werewerewire_enemy_slash_Step_0_gml_'+key);
const towards=(v:number,t:number,n:number)=>v===t?v:v>t?Math.max(v-n,t):Math.min(v+n,t);
const required=(rt:GmRuntime,def:GmObjectDef)=>{const s=rt.first(def);if(!s)throw Error(`${def.name} required by Werewerewire`);return s;};

export function createWerewerewire(object:(name:string)=>GmObjectDef):GmObjectDef[]{
 const laser=(vertical:boolean):GmObjectDef=>({...object(vertical?'obj_werewerewire_laserbullet_v':'obj_werewerewire_laserbullet'),events:{
  create:s=>{bulletInit(s);Object.assign(s,{tailx:s.x,taily:s.y,targetx:s.x,targety:s.y,init:0,attackdirection:0,laserwidth:10,finalpoint:3,nextpoint:1,lasertimer:0,active:0,imageXscale:5,imageYscale:0.8,destroyonhit:0,laserspeed:20,grazepoints:4});},
  step:(s,rt)=>{
   const box=required(rt,object('obj_growtangle')),heart=required(rt,object('obj_heart'));
   if(s.init===0){s.active=1;s.init=1;
    if(vertical){
     if(s.attackdirection===1){s.targetx=box.x+rt.random.randomRange(-70,70);if(s.targetx===s.x)s.finalpoint=2;s.direction=90;}
     else{s.targetx=box.x+100*(s.attackdirection-1);s.direction=s.attackdirection===0?180:0;}s.imageAngle=s.direction;
    }else{
     if(s.attackdirection===1)s.targety=box.y+rt.random.randomRange(-70,70);
     else{s.targety=box.y+100*(s.attackdirection-1);s.direction=s.attackdirection===0?90:270;s.imageAngle=s.direction;}
     if(s.targety===s.y)s.finalpoint=2;
    }
   }
   const distance=pointDistance(s.x,s.y,s.tailx,s.taily);
   if(s.lasertimer>0||distance>=100){
    s.tailx=towards(s.tailx,s.x,s.laserspeed);s.taily=towards(s.taily,s.y,s.laserspeed);s.lasertimer--;
    if(s.lasertimer<=0&&distance<=s.laserspeed){
     if(vertical&&s.finalpoint===1)s.targety=rt.view.y+560;s.nextpoint++;
     if(s.attackdirection===1){if(vertical){if(s.nextpoint===s.finalpoint)s.targety=rt.view.y+560;else if(s.nextpoint===2)s.targety=box.y-100;}
      else{if(s.finalpoint===s.nextpoint)s.targetx=rt.view.x-80;else if(s.nextpoint===2)s.targetx=box.x+100;}}
    }
   }
   if(s.lasertimer<=0){
    if(s.nextpoint===2&&s.attackdirection!==1){
     if(vertical){if(s.y+s.laserspeed>=heart.y+8){s.y=heart.y+8;s.targety=s.y;s.targetx=s.attackdirection===2?rt.view.x-80:rt.view.x+700;s.lasertimer=15;}else s.y+=s.laserspeed;}
     else{if(s.x-s.laserspeed<=heart.x+8){s.x=heart.x+8;s.targetx=s.x;s.targety=s.attackdirection===2?rt.view.y-80:rt.view.y+500;s.lasertimer=15;}else s.x-=s.laserspeed;}
    }else if(s.lasertimer<=0||(!vertical&&s.attackdirection===1&&s.finalpoint!==s.nextpoint)){
     s.x=towards(s.x,s.targetx,s.laserspeed);s.y=towards(s.y,s.targety,s.laserspeed);
     if(le(pointDistance(s.x,s.y,s.targetx,s.targety),0))s.lasertimer=s.attackdirection===1?15:5;
    }
   }
   if(s.grazed===1){if(s.grazetimer===0)s.grazetimer=5;else{s.grazetimer--;if(s.grazetimer===0)s.grazed=0;}}
  },
  draw:(s,rt)=>{
   if(s.nextpoint>s.finalpoint&&pointDistance(s.x,s.y,s.tailx,s.taily)<=0)rt.destroy(s);
   s.imageYscale=Math.max((s.laserwidth-4)/10,0);const color=rt.drawState.color;
   rt.drawState.color=0xff8080;rt.drawCircle(s.x,s.y,s.lasertimer>0?s.laserwidth+(s.lasertimer%4>1?5:4):s.laserwidth/2+2);
   rt.drawCircle(s.tailx,s.taily,s.laserwidth/2+2);rt.drawLine(s.x,s.y,s.tailx,s.taily,s.laserwidth+4);
   rt.drawState.color=0xffffff;rt.drawLine(s.x,s.y,s.tailx,s.taily,s.laserwidth);
   rt.drawCircle(s.x,s.y,s.lasertimer>0?s.laserwidth+(s.lasertimer%4>1?3:2):s.laserwidth/2);rt.drawCircle(s.tailx,s.taily,s.laserwidth/2);rt.drawState.color=color;
  },
 }});
 const horizontal=laser(false),vertical=laser(true);
 const balloon:GmObjectDef={...object('obj_werewire_zzt_balloon'),events:{
  create:(s,rt)=>{s.siner=0;s.lettersiner=0;s.letter=[0,0,1,2];for(s.i=0;s.i<3;s.i++)s.letter[s.i]=Math.floor(rt.random.random(5));if(rt.random.choose(0,1,2)!==2)s.letter[0]=0;s.preset=rt.random.choose(0,1,2,3);if(s.preset===0)s.letter=[0,0,1,2];if(s.preset===1)s.letter=[3,0,0,2];s.imageXscale=2;s.imageYscale=2;s.canDestroyTimer=0;},
  draw:(s,rt)=>{rt.drawSelf(s);s.siner++;s.lettersiner+=0.2;if(ge(s.lettersiner,2))s.lettersiner=0;s.y+=Math.sin(s.siner/8)*0.1;
   for(s.i=0;s.i<4;s.i++){const y=s.y-s.i*7+rt.random.random(2)+Math.sin(s.i/2+s.siner/3),x=s.x+s.i*20+rt.random.random(2);rt.drawSprite('spr_werewire_zzt_text',s.letter[s.i]*2+s.lettersiner,x,y,2,2,0,0xffffff,1);}
   s.canDestroyTimer++;if(s.canDestroyTimer>=15&&button1_p(rt))rt.destroy(s);if(s.canDestroyTimer>=120||!isPhase(rt,'enemytalk',s))rt.destroy(s);
  },
 }};
 const enemy=defineEnemy({...object('obj_werewerewire_enemy'),depth:0},{
  create:(s,rt)=>{enemyObjectInit(s,rt);Object.assign(s,{talkmax:90,imageSpeed:0.16,idlesprite:'spr_werewerewire_idle',hurtsprite:'spr_werewerewire_hurt',sparedsprite:'spr_werewerewire_idle',loosenAmount:0,loosencon:0,throwsus:-4,siner:0,siner_timer:0,hangx:26,hangy:-58,init_hangy:-58,remx:s.x,remy:s.y,targetx:0,xmovement_finished:0,shootcount:0,hangcon:0,hangtimer:0,hangsiner:0,shootcon:0,shoottimer:0,shootmode:0,anim_timer_2:0,stop_anim:0,m:2,bx1:[-20,-36,-48,-46,-26],by1:[-54,-46,6,46,72],mercy_act:1,bullet:[]});},
  talk:(s,rt)=>{rt.create(balloon,s.x-102,s.y+18);snd(rt,'snd_electric_talk');},
  endTalk:(s,rt)=>{if(s.talked===1&&isPhase(rt,'enemytalk',s)){s.rtimer=0;if(!rt.exists(balloon))rt.globals.mnfight=2;if(isPhase(rt,'bullets',s)){if(!rt.exists(moveHeart))moveHeartIn(rt);if(!rt.exists(growtangle))rt.create(growtangle,rt.view.x+320,rt.view.y+170);}}},
  attack:(s,rt)=>{s.rr='overrideRr' in s?s.overrideRr:rt.random.choose(0,1);if(s.rr===0){turnTimer(rt,210);s.shootcon=0;s.shootmode=1;s.shoottimer=0;for(const w of rt.all(s.object))w.shootwait=rt.random.random(5);s.werewire_count=monsterPop(rt);}
   else{const d=rt.create(object('obj_dbulletcontroller'),s.x-8,s.y+4);s.d=d.id;d.difficulty=(monsterPop(rt)-1)*1.4;d.damage=rt.globals.monsterat[s.myself]*5;d.target=s.mytarget;d.type=34;}turnTimer(rt,140);},
  statusLine:(s,rt)=>{if(rt.globals.mercymod[s.myself]>=rt.globals.mercymax[s.myself])rt.globals.battlemsg[0]=text('97_0');else{s.rr=rt.random.choose(0,1,2,3,4);rt.globals.battlemsg[0]=text(`${101+s.rr}_0`);}},
  afterAttack:(s,rt)=>shoot(s,rt,object,vertical),
  acts:(s,rt)=>{
   s.xx=rt.view.x;s.yy=rt.view.y;const g=rt.globals;
   if(s.acting===1&&s.actcon===0){s.actcon=1;msgSet(rt,0,text('377_0'));battleTextDefault(rt,s);}
   if(s.acting===2&&s.actcon===0){mercyAdd2(s,rt,s.myself,(s.simultotal===1?12:7)*s.mercy_act);msgSet(rt,0,text(s.simultotal===1?'383_0':'383_1'));simulText(s,rt,'kris');s.actcon=s.simulorderkri===0?20:1;}
   if(s.acting===3&&s.actcon===0){mercyAdd2(s,rt,s.myself,16*s.mercy_act);speaker(s,rt,'no_name');msgSet(rt,0,text('393_0'));msgNext(rt,text('394_0'));battleTextDefault(rt,s);s.actcon=1;}
   if(s.acting===4&&s.actcon===0){mercyAdd2(s,rt,s.myself,5*s.mercy_act);for(const w of rt.all(s.object))w.mercy_act=Math.max(1,Math.min(w.mercy_act+1,10));speaker(s,rt,'no_name');msgSet(rt,0,text('408_0'));msgNext(rt,text('409_0'));battleTextDefault(rt,s);s.actcon=1;}
   for(const [actor,acting,con,order,line] of [['susie','actingsus','actconsus','simulordersus',412],['ralsei','actingral','actconral','simulorderral',424]] as const){
    if(s[acting]===1&&s[con]===1){mercyAdd2(s,rt,s.myself,(s.simultotal===1?12:7)*s.mercy_act);msgSet(rt,0,text(`${line}_${rt.random.choose(0,1)===0?0:1}`));simulText(s,rt,actor);s[con]=s[order]===0?20:0;}}
   if(s.actcon===1&&!rt.exists(writer)){actCharSpriteEnd(s,rt);nextAct(rt,s);}
   if((s.actcon===20||s.actconsus===20||s.actconral===20)&&terminateWriter(s,rt)){s.actconsus=-1;s.actconral=-1;s.actcon=1;}
  },actsDone:()=>{},
  events:{alarm4:s=>{s.actcon++;},draw:(s,rt)=>{if(s.state===3){enemyHurtTiredAfterDamage(s,rt,0.5);enemyDrawHurtGeneric(s,rt);}if(s.stop_anim===0){s.siner_timer+=s.imageSpeed;if(ge(s.siner_timer,1)){s.siner_timer-=1;s.siner+=8;}const add=Math.sin(s.siner/(34/s.m))/(4/s.m);if(ge(Math.abs(add),0.2))s.anim_timer_2+=add;}if(s.state===0){s.fsiner++;if(s.stop_anim===0)drawBodyPart(s,rt,s.idlesprite,s.anim_timer_2,s.x,s.y,2,2,0,s.imageBlend,1);else rt.drawSelf(s);}if(s.becomeflash===0)s.flash=0;s.becomeflash=0;}},
 });
 return [enemy,balloon,horizontal,vertical];
}

function shoot(s:GmInstance,rt:GmRuntime,object:(name:string)=>GmObjectDef,vertical:GmObjectDef){
 const g=rt.globals,pop=()=>monsterPop(rt),circle=object('obj_werewire_bullet_lasercircle'),square=object('obj_werewire_bullet_lasersquare');
 if(s.shootcon===0&&s.shootmode===1){if(g.turntimer>=10)s.shootwait--;if(s.shootwait<=0&&g.turntimer>=40){s.shootwait=(s.werewire_count*6+rt.random.random(7))*s.werewire_count;s.shootwait=0;s.shootcon=1;s.shoottimer=0;}else if(g.turntimer<40)s.shootmode=0;}
 if(s.shootcon===1){randomTarget(s,rt);s.shootcon=rt.random.choose(2,20);s.sprite=s.shootcon===20?'spr_werewerewire_attack_1':'spr_werewerewire_attack_2';s.imageIndex=0;s.imageSpeed=0;s.siner=0;s.siner_timer=0;s.stop_anim=1;s.anim_timer_2=0;s.shootcount=0;}
 if(s.shootcon===2){s.anim_add=0.5;if(lt(s.imageIndex,3))s.imageIndex+=s.anim_add*s.m;if(ge(s.imageIndex,3)){s.shootcon=3;s.shoottimer=0;s.shootcount=0;}}
 if(s.shootcon===3){s.shoottimer--;if(s.shoottimer<=0){for(s.i=0;s.i<3;s.i++){snd(rt,'snd_electric_talk',1.9,0.8);const b=rt.create(circle,s.x-52,s.y+18);s.lasercircle=b.id;b.damage=g.monsterat[s.myself]*5;b.target=s.mytarget;const h=rt.first(object('obj_heart'));if(h)s.laser_angle=pointDirection(b.x,b.y,h.x+8,h.y+8)-2+rt.random.random(4);b.my_angle=s.laser_angle-5+5*s.i;b.my_angle_change=(-1+s.i)*0.8*s.m;b.my_speed=4;b.my_accel=0.2;b.my_length=4;b.my_accel=0.4;}s.shoottimer=10/s.m;s.shootcount++;}if(s.shootcount>=3){s.shootcon=4;s.shootimer=0;}}
 if(s.shootcon===4){s.shoottimer++;s.threshold=2+(pop()-1)*10;if(ge(s.shoottimer,s.threshold/s.m)){s.imageIndex+=0.25*s.m;if(ge(s.imageIndex,9)){s.shootcon=0;s.imageIndex=0;s.sprite='spr_werewerewire_idle';s.imageSpeed=0.16;s.stop_anim=0;}}}
 if(s.shootcon===20){s.bx1=[-24,-40,-48,-46,-26];s.by1=[-54,-30,6,46,72];const h=required(rt,object('obj_heart'));s.bullet_angle=pointDirection(s.x+s.bx1[2],s.y+s.by1[2],h.x+8,h.y+8)-10+rt.random.random(20);s.shootcon=21;}
 if(s.shootcon===21){s.shoottimer++;if(ge(s.shoottimer,15/s.m+(pop()-1)*10)){s.imageIndex+=0.25*s.m;if(eq(s.imageIndex,2))snd(rt,'motor_swing_down',1.2);if(ge(s.imageIndex,2)&&le(s.imageIndex,3)){for(let n=0;n<2;n++){if(s.shootcount<5){const b=rt.create(square,s.x+s.bx1[s.shootcount],s.y+s.by1[s.shootcount]);gmArray(s,'bullet')[s.shootcount]=b.id;b.damage=g.monsterat[s.myself]*5;b.target=s.mytarget;b.sprite='spr_bullet_werewire_spark';b.stretch=0;b.imageSpeed=0.2;b.imageXscale=4;b.imageYscale=4;b.direction=s.bullet_angle-28+s.shootcount*14;b.imageAngle=b.direction;b.speed=9;b.friction=1;s.shootcount++;}}}if(ge(s.imageIndex,4)){for(s.i=0;s.i<5;s.i++){const b=rt.byId(s.bullet[s.i]);if(b){if(le(b.speed,0))b.speed=0.2;b.friction=-0.25;}}s.shootcon=0;s.imageIndex=0;s.sprite='spr_werewerewire_idle';s.imageSpeed=0.16;s.stop_anim=0;}}}
 if(s.hangcon===1){s.hangvspeed-=s.m;s.hangy+=s.hangvspeed;if(s.y+s.hangy<=rt.view.y+60){s.hangcon=2;s.hangtimer=0;}}
 if(s.hangcon===2){s.hangy+=s.hangvspeed;if(Math.abs(s.hangvspeed)>=0)s.hangvspeed*=0.5;if(Math.abs(s.hangvspeed)<=1){s.hangvspeed=0;s.hangcon=3;}}
 if(s.hangcon>=1&&s.hangcon<=3&&s.xmovement_finished===0){s.x-=(s.x-s.targetx)/(6*s.m);if(s.x<=s.targetx+2){s.x=s.targetx;s.xmovement_finished=1;}}
 if(s.hangcon===3&&s.xmovement_finished===1)s.hangcon=4;
 if(s.hangcon>=2&&s.hangcon<5&&g.turntimer>=30){s.hangsparktimer++;if(s.hangsparktimer>=20){s.hangsparktimer=0;s.shootcount=0;const b=rt.create(vertical,s.x+s.hangx,s.y+s.hangy+80);s.d=b.id;b.damage=g.monsterat[s.myself]*5;b.target=s.mytarget;b.attackdirection=rt.random.irandom(2);}}
 if(s.hangcon===4){s.hangsiner+=s.m;s.x+=Math.sin(s.hangsiner/12)*3;if(g.turntimer<=20)s.hangcon=5;}
 if(s.hangcon===5){s.hangy-=(s.hangy-s.init_hangy)/(8/s.m);if(s.hangy>=s.init_hangy-4)s.hangy=s.init_hangy;s.x-=(s.x-s.remx)/(8/s.m)-1;if(s.x>=s.remx-1)s.x=s.remx;if(s.hangy===s.init_hangy&&s.x===s.remx){s.hangcon=0;s.sprite='spr_werewerewire_idle';}}
}
