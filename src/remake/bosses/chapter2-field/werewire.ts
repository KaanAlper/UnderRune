import {gmArray,type GmInstance,type GmObjectDef,type GmRuntime} from '../../gm/runtime';
import {pointDirection,ge,le,lt,eq} from '../../gm/math';
import {darkener,growtangle,moveHeart,moveHeartIn,monsterParent} from '../../deltarune/battle';
import {defineEnemy} from '../../deltarune/enemy';
import {nextAct,randomTarget,monsterDefeat,inputName} from '../../deltarune/controller';
import {drawBodyPart,isPhase,mercyAdd2,msgSet,turnTimer,snd,rememberXY,moveToPointOverTime,moveToRememberXY} from '../../deltarune/chapter2-battle';
import {enemyObjectInit,enemyHurtTiredAfterDamage,enemyDrawHurtGeneric,monsterPop,monsterMakeTired,simulText,actCharSprite,actCharSpriteEnd,terminateWriter,recruitEnemy} from '../../deltarune/chapter2-enemy';
import {battleTextDefault,writer} from '../../deltarune/writer';
import {sourceText} from '../../host/text';
const T=(key:string)=>sourceText('obj_werewire_enemy_slash_Step_0_gml_'+key);
export function createWerewire(object:(name:string)=>GmObjectDef):GmObjectDef[]{
 const enemy=defineEnemy({...object('obj_werewire_enemy'),depth:0},{
  create:(s,rt)=>{enemyObjectInit(s,rt);Object.assign(s,{talkmax:90,imageSpeed:0.16,idlesprite:'spr_werewire_idle',hurtsprite:'spr_werewire_hurt',sparedsprite:'spr_plugboy_spare',loosenAmount:0,loosencon:0,throwsus:-4,siner:0,siner_timer:0,hangx:26,hangy:-58,init_hangy:-58,remx:s.x,remy:s.y,hangcon:0,hangtimer:0,hangsiner:0,shootcon:0,shoottimer:0,shootwait:4,mercyaccumulated:0,anim_timer_2:0,stop_anim:0,talkwait:0,m:2});
   rt.globals.turntimer=0;s.initid=0;s.werewire_count=rt.count(s.object);s.shootmode=2;s.shootwait=10;
   for(const w of rt.withInstances(s.object))if('initid' in w){w.initid++;w.shootwait=rt.random.random(5)+w.initid*30-15;}
   Object.assign(s,{easymode:0,werewerewire:0,bx1:[-20,-36,-48,-46,-26],by1:[-54,-46,6,46,72]});
  },
  beforeTalk:(s,rt)=>{if(rt.globals.monsterstatus[s.myself]===0)monsterMakeTired(rt,s.myself);},
  startTalk:(s,rt)=>{if(s.talkwait===1)return;randomTarget(s,rt);if(!rt.exists(darkener))rt.create(darkener,0,0);rt.create(object('obj_werewire_zzt_balloon'),s.x-102,s.y+18);snd(rt,'snd_electric_talk');s.talked=1;s.talktimer=0;},
  endTalk:(s,rt)=>{if(s.talked===1&&isPhase(rt,'enemytalk',s)){s.rtimer=0;if(!s.talkwait&&!rt.exists(object('obj_werewire_zzt_balloon'))&&!rt.exists(writer)&&rt.globals.mnfight===1)rt.globals.mnfight=2;
   if(isPhase(rt,'bullets',s)){if(!rt.exists(growtangle)){if(monsterPop(rt)>1)rt.create(growtangle,rt.view.x+320,rt.view.y+170);else{const b=rt.create(growtangle,rt.view.x+320,rt.view.y+240);s.battlebox=b.id;b.maxyscale=1.33;}}if(!rt.exists(moveHeart))moveHeartIn(rt);}}},
  attackDelay:15,
  attack:(s,rt)=>{s.rr=monsterPop(rt)>1?rt.random.choose(0,1):3;if(s.rr===0||s.rr===1){if(!rt.exists(object('obj_berdlyb2_enemy')))turnTimer(rt,210);s.shootcon=0;s.shootmode=1;s.shoottimer=0;for(const w of rt.withInstances(s.object))w.shootwait=rt.random.random(5)+w.initid*30-30;s.werewire_count=monsterPop(rt);}
   else if(s.rr===3){rt.globals.turntimer=170;s.hangsparktimer=0;s.shootmode=2;s.xmovement_finished=0;s.targetx=rt.view.x+260;s.hangvspeed=0;s.hanghspeed=0;s.hangcon=1;s.hangsiner=0;s.sprite='spr_werewire_hang';}},
  attackWait:(_s,rt)=>{if(!rt.exists(object('obj_berdlyb2_enemy')))turnTimer(rt,60);},
  statusLine:(s,rt)=>{const g=rt.globals;if(g.mercymod[s.myself]>=g.mercymax[s.myself])g.battlemsg[0]=T('98_0');else{s.rr=rt.random.choose(0,1,2,3,4);g.battlemsg[0]=T(`${102+s.rr}_0`);}let attacked=0,missed=0;for(let i=0;i<3;i++)if(g.charaction[i]===1)attacked=1;if(attacked===1)for(let i=0;i<3;i++)if(g.monsterhp[i]===g.monstermaxhp[i]&&g.monster[i]===1)missed++;if(missed===monsterPop(rt))g.battlemsg[0]=T('122_0').replace('~1',inputName(4));},
  afterAttack:(s,rt)=>shoot(s,rt,object),
  acts:(s,rt)=>acts(s,rt,object),actsDone:()=>{},
  events:{alarm4:s=>{s.actcon++;},user10:(s,rt)=>{rt.create(object('obj_werewire_spare'),s.x,s.y-42);recruitEnemy(s,rt);monsterDefeat(s,rt);rt.destroy(s);},draw},
 });return [enemy];
}
function shoot(s:GmInstance,rt:GmRuntime,object:(name:string)=>GmObjectDef){
 const g=rt.globals;
 if(!('bullet' in s))s.bullet=[];
 if(s.shootcon===0&&s.shootmode===1){if(g.turntimer>=10)s.shootwait--;if(s.shootwait<=0&&g.turntimer>=40){s.shootwait=(s.werewire_count*6+rt.random.random(7))*s.werewire_count;if(s.easymode===1)s.shootwait=(s.werewire_count*10+rt.random.random(4))*s.werewire_count;if(s.werewire_count===3)s.shootwait=(s.werewire_count*5+rt.random.random(7))*s.werewire_count;if(s.werewerewire===1)s.shootwait=0;let n=0;for(s._sameattacki=0;s._sameattacki<3;s._sameattacki++)if(g.monsterattackname[s._sameattacki]==='Chirashi'&&g.monster[s._sameattacki]===1)n++;s.__sameattack=n;if(n>0)s.shootwait+=10*s.werewire_count;s.shootcon=1;s.shoottimer=0;}else if(g.turntimer<40)s.shootmode=0;}
 if(s.shootcon===1){randomTarget(s,rt);s.damage=g.monsterat[s.myself];s.shootcon=rt.random.choose(2,20);s.sprite=s.shootcon===20?'spr_werewire_attack_1':'spr_werewire_attack_2';s.imageIndex=0;s.imageSpeed=0;s.siner=0;s.siner_timer=0;s.stop_anim=1;s.anim_timer_2=0;s.shootcount=0;}
 if(s.shootcon===2){s.anim_add=s.werewerewire===1?0.5:0.25;if(lt(s.imageIndex,3))s.imageIndex+=s.anim_add*s.m;if(ge(s.imageIndex,3)){s.shootcon=3;s.shoottimer=0;s.shootcount=0;}}
 if(s.shootcon===3){s.shoottimer--;if(s.shoottimer<=0){snd(rt,'snd_electric_talk',1.5);for(let i=0;i<3;i++){const b=rt.create(object('obj_werewire_bullet_lasercircle'),s.x-52,s.y+18);s.lasercircle=b.id;b.damage=g.monsterat[s.myself]*5;b.target=s.mytarget;b.grazepoints=1;const h=rt.first(object('obj_heart'));if(h)s.laser_angle=pointDirection(b.x,b.y,h.x+8,h.y+8)-2+rt.random.random(4);else s.laser_angle+=-2+rt.random.random(4);b.my_angle=s.laser_angle-5+5*i;b.my_angle_change=(-1+i)*0.8*s.m;b.my_speed=4;b.my_accel=0.2;b.my_length=4;b.my_accel=0.2+s.werewerewire*0.2;}s.shoottimer=10/s.m;s.shootcount++;}if(s.shootcount>=3){s.shootcon=4;s.shootimer=0;}}
 if(s.shootcon===4){s.shoottimer++;s.threshold=s.werewerewire===1?2:10;if(ge(s.shoottimer,s.threshold/s.m)){s.imageIndex+=0.25*s.m;if(ge(s.imageIndex,9)){s.shootcon=0;s.imageIndex=0;s.sprite='spr_werewire_idle';s.imageSpeed=0.16;s.stop_anim=0;}}}
 if(s.shootcon===20){s.bx1=[-24,-40,-48,-46,-26];s.by1=[-54,-30,6,46,72];const h=rt.first(object('obj_heart'));if(h)s.bullet_angle=pointDirection(s.x+s.bx1[2],s.y+s.by1[2],h.x+8,h.y+8)-10+rt.random.random(20);else s.bullet_angle+=-10+rt.random.random(20);s.shootcon=21;}
 if(s.shootcon===21){s.shoottimer++;if(ge(s.shoottimer,15/s.m)){s.imageIndex+=0.25*s.m;if(eq(s.imageIndex,2))snd(rt,'motor_swing_down');if(ge(s.imageIndex,2)&&le(s.imageIndex,3))for(let n=0;n<2;n++)if(s.shootcount<5){const b=rt.create(object('obj_werewire_bullet_lasersquare'),s.x+s.bx1[s.shootcount],s.y+s.by1[s.shootcount]);gmArray(s,'bullet')[s.shootcount]=b.id;b.damage=g.monsterat[s.myself]*5;b.target=s.mytarget;b.grazepoints=5;b.sprite='spr_bullet_werewire_spark';b.stretch=0;b.imageSpeed=0.2;b.imageXscale=4;b.imageYscale=4;b.direction=s.bullet_angle-28+s.shootcount*14;b.imageAngle=b.direction;b.speed=9-s.initid-s.werewerewire;b.friction=1;s.shootcount++;}if(ge(s.imageIndex,4)){for(let i=0;i<5;i++){const b=rt.byId(s.bullet[i]);if(b){if(le(b.speed,0))b.speed=0.2;b.friction=-0.25;}}s.shootcon=0;s.imageIndex=0;s.sprite='spr_werewire_idle';s.imageSpeed=0.16;s.stop_anim=0;}}}
 if(s.hangcon===1){randomTarget(s,rt);s.hangvspeed-=s.m;s.hangy+=s.hangvspeed;if(s.y+s.hangy<=rt.view.y+60){s.hangcon=2;s.hangtimer=0;}}
 if(s.hangcon===2){s.hangy+=s.hangvspeed;if(Math.abs(s.hangvspeed)>=0)s.hangvspeed*=0.5;if(Math.abs(s.hangvspeed)<=1){s.hangvspeed=0;s.hangcon=3;}}
 if(s.hangcon>=1&&s.hangcon<=3&&s.xmovement_finished===0){s.x-=(s.x-s.targetx)/(6*s.m);if(s.x<=s.targetx+2){s.x=s.targetx;s.xmovement_finished=1;}}
 if(s.hangcon===3&&s.xmovement_finished===1)s.hangcon=4;
 if(s.hangcon>=2&&s.hangcon<5&&g.turntimer>=30){s.hangsparktimer++;if(s.hangsparktimer>=6){s.hangsparktimer=0;s.shootcount=0;const b=rt.create(object('obj_werewire_bullet_lasersquare'),s.x+s.hangx,s.y+s.hangy+80);gmArray(s,'bullet')[s.shootcount]=b.id;b.damage=g.monsterat[s.myself]*5;b.target=s.mytarget;b.grazepoints=6;b.sprite='spr_bullet_werewire_spark';b.stretch=0;b.imageSpeed=0.2;b.imageXscale=4;b.imageYscale=4;b.hspeed=-3+rt.random.random(6);b.imageAngle=b.direction;b.vspeed=-9+rt.random.random(2);b.gravity=0.5;}}
 if(s.hangcon===4){s.hangsiner+=s.m;s.x+=Math.sin(s.hangsiner/12)*3;if(g.turntimer<=20)s.hangcon=5;}
 if(s.hangcon===5){s.hangy-=(s.hangy-s.init_hangy)/(8/s.m);if(s.hangy>=s.init_hangy-4)s.hangy=s.init_hangy;s.x-=(s.x-s.remx)/(8/s.m)-1;if(s.x>=s.remx-1)s.x=s.remx;if(s.hangy===s.init_hangy&&s.x===s.remx){s.hangcon=0;s.sprite='spr_werewire_idle';}}
}
function acts(s:GmInstance,rt:GmRuntime,object:(name:string)=>GmObjectDef){
 const g=rt.globals;s.xx=rt.view.x;s.yy=rt.view.y;
 if(s.acting===1&&s.actcon===0){s.actcon=1;msgSet(rt,0,T('393_0'));battleTextDefault(rt,s);}
 if(s.acting===2&&s.actcon===0){const txt=T(s.simultotal===1?'399_0':'399_1');actCharSprite(s,rt,'kris','spr_krisb_wiggle',0.25,1);msgSet(rt,0,txt);mercyAdd2(s,rt,s.myself,50);simulText(s,rt,'kris');s.actcon=s.simulorderkri===0?20:-1;}
 if(s.acting===3&&s.actcon===0){s.actcon=12;s.alarm[4]=15;for(const m of rt.withInstances(monsterParent)){rememberXY(m);if(g.monstertype[m.myself]===33)moveToPointOverTime(m,rt,rt.view.x+640-m.initid*100,rt.view.y+206,15);else moveToPointOverTime(m,rt,740,m.y,15);}}
 if(s.actcon===13){msgSet(rt,0,T('425_0').replace('~1',inputName(6)));for(const w of rt.withInstances(s.object)){const t=rt.create(object('obj_werewire_throwtarget'),w.x,w.y);w.target=t.id;t.maker=w.id;}for(const name of ['obj_herokris','obj_herosusie'])for(const h of rt.all(object(name)))h.visible=false;const h=rt.first(object('obj_herosusie'));if(!h)throw Error('ThrowWire requires Susie');s.throwsus=rt.create(object('obj_werewire_throwkris'),h.x,h.y).id;battleTextDefault(rt,s);s.actcon=14;}
 if(s.actcon===15){for(const m of rt.withInstances(monsterParent))moveToRememberXY(m,rt,15);s.actcon=16;s.alarm[4]=15;}
 if(s.actcon===17){s.actcon=1;for(const w of rt.withInstances(s.object)){mercyAdd2(w,rt,w.myself,w.mercyaccumulated);w.mercyaccumulated=0;}}
 for(const [actor,acting,con,order,line,mercy] of [['susie','actingsus','actconsus','simulordersus',457,25],['ralsei','actingral','actconral','simulorderral',469,25],['noelle','actingnoe','actconnoe','simulordernoe',481,50]] as const)if(s[acting]===1&&s[con]===1){msgSet(rt,0,T(`${line}_${s.simultotal===1?0:1}`));mercyAdd2(s,rt,s.myself,mercy);simulText(s,rt,actor);s[con]=s[order]===0?20:0;}
 if(s.actcon===1&&!rt.exists(writer)){actCharSpriteEnd(s,rt);nextAct(rt,s);}
 if((s.actcon===20||s.actconsus===20||s.actconral===20||s.actconnoe===20)&&terminateWriter(s,rt)){s.actconsus=-1;s.actconral=-1;s.actconnoe=-1;s.actcon=1;}
}
function draw(s:GmInstance,rt:GmRuntime){
 if(s.state===3){enemyHurtTiredAfterDamage(s,rt,0.5);enemyDrawHurtGeneric(s,rt);}
 if(s.stop_anim===0){s.siner_timer+=s.imageSpeed;if(ge(s.siner_timer,1)){s.siner_timer-=1;s.siner+=8;}s.anim_timer_2+=Math.sin(s.siner/(34/s.m))/(4/s.m);}
 const part=(sprite:string,frame:number,x:number,y:number)=>rt.drawSprite(sprite,frame,x,y,s.imageXscale,s.imageYscale,s.imageAngle,s.imageBlend,s.imageAlpha),flash=(sprite:string,x:number,y:number)=>rt.drawSpriteFog(sprite,0,x,y,s.imageXscale,s.imageYscale,s.imageAngle,s.imageBlend,-Math.cos(s.fsiner/5)*0.4+0.6);
 if(s.state===0){s.fsiner++;if(s.sprite!=='spr_werewire_hang'){if(s.stop_anim===0)drawBodyPart(s,rt,s.idlesprite,s.anim_timer_2,s.x,s.y,s.imageXscale,s.imageYscale,s.imageAngle,s.imageBlend,s.imageAlpha);else rt.drawSelf(s);part('spr_werewire_wire_curve',0,s.x-16,s.y-12);if(s.flash===1)flash('spr_werewire_wire_curve',s.x-16,s.y-12);for(s.i=0;s.i<32;s.i++){const x=s.x-16+Math.sin(s.i/4+s.siner/16)*s.i/4+s.i*2,y=s.y-20-s.i*8;part('spr_werewire_wire_vertical',0,x,y);if(s.flash===1)flash('spr_werewire_wire_vertical',x,y);}}
  else{part('spr_werewire_hang',s.siner/16,s.x+s.hangx,s.y+s.hangy);for(s.i=0;s.i<32;s.i++)part('spr_werewire_wire_vertical',0,s.x+Math.sin(s.i/4+s.siner/16)*s.i/8+s.hangx,s.y+14-s.i*8+s.hangy);}}
 if(s.becomeflash===0)s.flash=0;s.becomeflash=0;rt.drawState.color=0x0000ff;
}
