import {resolveEvent,type GmInstance,type GmObjectDef,type GmRuntime} from '../../gm/runtime';
import {bulletInit,damage,damageAll} from '../../deltarune/battle';
import {lt,pointDirection} from '../../gm/math';
import {snd} from '../../deltarune/sound';
import {bulletHeal,customAfterimage,drawInBulletBox,getBoxBounds,healAll} from './shared';
import {type QueenObject,queenInstance} from './context';

export function createQueenProjectiles(object:QueenObject):GmObjectDef[]{
 const buffering=(rt:GmRuntime)=>rt.first(object('obj_queen_buffercontroller'))?.buffering===1;
 const inherit=(s:GmInstance,rt:GmRuntime,event:'create'|'step')=>resolveEvent(s.object.parent,event)?.(s,rt);
 const attackStats=(s:GmInstance,rt:GmRuntime)=>{const q=rt.first(object('obj_queen_enemy'));if(q)s.damage=rt.globals.monsterat[q.myself]*5;const c=rt.first(object('obj_queen_bulletcontroller'));if(c)s.target=c.target;};
 const laser:GmObjectDef={...object('obj_queen_laser'),events:{
  create:(s,rt)=>{bulletInit(s);Object.assign(s,{destroyonhit:1,timer:0,imageXscale:0,imageYscale:1,active:1});attackStats(s,rt);s.grazepoints=4;},
  step:(s,rt)=>{if(s.imageXscale<10)s.imageXscale+=.5;if(s.imageXscale>=6){s.speed+=4;if(s.speed>=20){s.active=0;if(s.imageYscale>=1)s.imageYscale+=.2;s.imageAlpha-=.2;if(s.imageAlpha<=0)rt.destroy(s);}}},
 }};
 const gun:GmObjectDef={...object('obj_queen_lasergun'),events:{
  create:(s,rt)=>{Object.assign(s,{con:0,timer:0,imageXscale:0,imageYscale:0,init:0,inittimer:0,shotsize:1,maxsize:1.2,aimx:0,aimy:0,randomshot:1,inittime:0,aimtime:15,waittime:15,depth:queenInstance(rt,object,'obj_heart').depth+1});const d=rt.create(object('obj_queen_search_window'),s.x,s.y);s.d=d.id;d.search=99;d.depth=s.depth+1;d.targetstring='';d.donttypeanything=1;},
  step:(s,rt)=>{
   if(!rt.exists(object('obj_queen_bulletcontroller'))){rt.destroy(s);return;}
   if(s.init===0){const h=rt.first(object('obj_heart'));if(h){s.idealangle=pointDirection(s.x,s.y,h.x+10,h.y+10);s.aimx=h.x;s.aimy=h.y;}else s.idealangle=270;
    if(s.randomshot&&Math.floor(rt.random.random(3)))s.idealangle+=rt.random.randomRange(-20,20);s.currentangle=s.idealangle+360;s.init=1;snd(rt,'snd_spearappear');s.timer=0;s.size=0;}
   s.inittimer++;if(s.inittimer>=s.inittime){
    if(s.con===0){s.timer++;s.size=s.maxsize*(s.timer/s.aimtime);s.currentangle+=(s.idealangle-s.currentangle)*(s.timer/s.aimtime);if(s.timer>=s.aimtime){s.con=1;s.timer=0;}}
    s.imageAngle=s.currentangle;s.imageXscale=s.size;s.imageYscale=s.size;
    if(s.con===1){s.timer++;if(s.timer>=s.waittime){snd(rt,'snd_wallclaw');const l=rt.create(object('obj_queen_laser'),s.x,s.y);s.laser=l.id;l.imageAngle=s.imageAngle;l.direction=s.imageAngle;l.imageYscale=s.shotsize;s.con=2;s.timer=0;}}
    if(s.con===2){s.direction=s.imageAngle;s.speed-=.25;s.timer++;if(s.timer>=10)s.imageAlpha-=.1;if(s.imageAlpha<=0)rt.destroy(s);}
   }
  },
  draw:(s,rt)=>{if(s.con===1){rt.drawState.color=0x0000ff;rt.drawSprite('spr_lasergun_laser_telegraph',0,s.x,s.y,999,1,s.imageAngle,0xffffff,.3);}rt.drawSelf(s);},
 }};
 const bufferBullet:GmObjectDef={...object('obj_queen_bufferbullet'),events:{
  create:(s,rt)=>{bulletInit(s);Object.assign(s,{destroyonhit:1,bufferstate:0,originalspeed:s.speed,imageXscale:.5,imageYscale:.5,afterimage:0,fadeaway:0,slowdown:0,timer:0});attackStats(s,rt);s.grazepoints=3;s.rotate=0;},
  step:(s,rt)=>{
   if(s.bufferstate===0&&buffering(rt)){s.imageBlend=0x808080;s.bufferstate=1;s.originalspeed=s.speed;s.speed=0;s.destroyonhit=0;}
   else if(s.bufferstate===1&&!buffering(rt)){s.imageBlend=0xffffff;s.speed=s.originalspeed;s.bufferstate=0;s.sprite='spr_queen_jpegbullet';s.destroyonhit=1;}
   s.timer++;if(s.fadeaway===1&&s.timer>=60){s.imageAlpha-=.1;if(lt(s.imageAlpha,0))rt.destroy(s);}if(s.slowdown===1&&s.speed>3)s.speed-=.35;if(s.rotate===1)s.imageAngle+=5;
  },
  draw:(s,rt)=>{rt.drawSelf(s);if(s.afterimage)customAfterimage(s,rt,object('obj_buffer_afterimage'));const b=rt.first(object('obj_queen_buffercontroller'));if(b&&buffering(rt))rt.drawSprite('spr_queen_buffering',b.bufferbar%8,s.x,s.y);},
 }};
 const banana:GmObjectDef={...object('obj_queen_bananabullet'),events:{
  step:(s,rt)=>{
   if(s.imageAngle>90&&s.imageAngle<270)s.imageAngle-=180;
   if(s.bufferstate===0&&buffering(rt)){s.imageBlend=0x808080;s.bufferstate=1;s.originalspeed=s.speed;s.speed=0;s.imageSpeed=0;}
   else if(s.bufferstate===1&&!buffering(rt)){s.imageBlend=0xffffff;s.speed=s.originalspeed;s.bufferstate=0;s.sprite='spr_queen_jpegbullet';s.imageSpeed=1;if(s.active===0){bulletHeal(s,rt,s.damage);rt.destroy(s);}}
   s.timer++;if(s.fadeaway===1&&s.timer>=90){s.imageAlpha-=.1;if(lt(s.imageAlpha,0))rt.destroy(s);}if(s.slowdown===1&&s.speed>2)s.speed-=.2;
  },
  user5:(s,rt)=>{if(s.active===1){if(s.bufferstate)s.active=0;else{bulletHeal(s,rt,s.damage);rt.destroy(s);}}},
 }};
 const feather:GmObjectDef={...object('obj_queen_berdlyfeather'),events:{
  create:(s,rt)=>{inherit(s,rt,'create');s.direction=270;s.imageAngle=s.direction;s.timer=rt.random.choose(0,Math.PI);s.updateimageangle=1;s.m=1;},
  step:(s,rt)=>{inherit(s,rt,'step');s.direction=270+Math.cos(s.timer/(10*s.m))*30;s.timer++;s.m+=.05;},
 }};
 const wineDrop:GmObjectDef={...object('obj_queen_wine_attack_droplet'),events:{
  create:s=>{s.destroyonhit=0;},user5:(s,rt)=>{if(s.active!==1)return;const q=queenInstance(rt,object,'obj_queen_enemy');if(q.beatwine2nodamage===1)q.beatwine2nodamage=0;if(s.target!==3)damage(s,rt);if(s.target===3)damageAll(s,rt);if(s.destroyonhit===1)rt.destroy(s);},
 }};
 const social:GmObjectDef={...object('obj_queen_social_media'),events:{
  create:(s,rt)=>{inherit(s,rt,'create');s.handle=0;if(rt.globals.lang==='ja')s.sprite='spr_queen_perapera';},
  beginStep:(s,rt)=>{const f=rt.first(object('obj_queen_finger'));if(f)s.speed=f.scrollSpeed;},
  user5:(s,rt)=>{if(s.active!==1)return;if(s.handle){if(s.target!==3)bulletHeal(s,rt,6);if(s.target===3)healAll(s,rt,6);}else{if(s.target!==3)damage(s,rt);if(s.target===3)damageAll(s,rt);}if(s.destroyonhit===1)rt.destroy(s);},
 }};
 const pfp:GmObjectDef={...object('obj_queen_pfp'),events:{beginStep:(s,rt)=>{const f=rt.first(object('obj_queen_finger'));if(f)s.speed=f.scrollSpeed;}}};
 const after:GmObjectDef={...object('obj_buffer_afterimage'),events:{step:(s,rt)=>{if(buffering(rt))return;s.imageAlpha-=.04;if(lt(s.imageAlpha,0))rt.destroy(s);}}};
 const effect:GmObjectDef={...object('obj_buffer_tempeffect'),events:{
  create:s=>Object.assign(s,{timer:0,endtime:0,animdone:0,init:0,hitbox:0}),
  step:(s,rt)=>{if(buffering(rt)){s.imageSpeed=0;return;}else if(s.imageSpeed===0)s.imageSpeed=1;s.init=1;if(s.animdone){s.timer++;if(s.timer>=s.endtime)rt.destroy(s);}},
  animationEnd:(s,rt)=>{if(s.init===0)return;if(s.endtime===0)rt.destroy(s);else s.imageAlpha=0;},
 }};
 const leg:GmObjectDef={...object('obj_queen_leg'),events:{
  create:(s,rt)=>{bulletInit(s);s.destroyonhit=0;s.direction=270;s.stompwait=15;s.stomphold=0;getBoxBounds(s,rt,object('obj_growtangle'));Object.assign(s,{active:0,stomplerp:0,stompspeed:.1,shootbullets:0,pos:0,special:0,specialcon:0,specialtimer:0,hurttimer:0,hittimer:0,hurtx:s.x,hurty:s.y});attackStats(s,rt);s.grazepoints=4;},
  step:(s,rt)=>{
   if(s.stompwait>0)return;
   if(s.stompspeed>0&&s.stomplerp>=1){s.stomplerp=1;s.stompspeed=0;const existing=rt.first(object('obj_shake')),shake=existing??rt.create(object('obj_shake'),0,0);s.d=existing?object('obj_shake').index:shake.id;shake.shakex=2;shake.shakey=2;snd(rt,'snd_screenshake');if(s.shootbullets===1)rt.userEvent(s,0);}
   else if(s.stompspeed===0&&s.stomphold>=0){s.stomphold--;if(s.stomphold<=0)s.stompspeed=-.1;if(s.special===1)s.stompspeed=0;if(s.special===2)s.stompspeed=0;}
   else if(s.stompspeed<0&&s.stomplerp<=0)rt.destroy(s);
   if(s.hurttimer===0&&s.hittimer===0)s.stomplerp+=s.stompspeed;if(s.special===3&&s.stomplerp>=.5)s.stompspeed=.002;if(s.special===3&&s.stomplerp>=.7)s.stompspeed=.0001;
   const ease=s.stomplerp**2;if(s.direction===270)s.y=s.miny-4+(s.maxy-8-(s.miny-4))*ease;if(s.direction===90)s.y=s.miny-8+(s.maxy-4-(s.miny-8))*ease;
   if(s.direction===180)s.x=s.maxx-8+(s.minx-4-(s.maxx-8))*ease;if(s.direction===0)s.x=s.minx-4+(s.maxx-8-(s.minx-4))*ease;
  },
  draw:(s,rt)=>{
   const b=queenInstance(rt,object,'obj_growtangle');if(s.stompwait>0){s.stompwait--;if(s.stompwait<=0){s.active=1;s.depth++;}
    const mark=(x:number,y:number,color:number)=>rt.drawSprite('spr_exclamation_mark_appear',9,x,y,1,1,0,color,1);
    if(s.direction===270)mark(s.x,b.y,s.stompwait%4<2?0x0000ff:0x00ffff);rt.drawState.color=0x0000ff;rt.drawRect(s.x-23,b.y-69,s.x+23,b.y+69,true);rt.drawRect(s.x-22,b.y-68,s.x+24,b.y+70,true);rt.drawState.color=0xffffff;
    if(s.direction===90)mark(s.x,b.y+40-s.stompwait,s.stompwait%4<2?0x0000ff:0x40a0ff);if(s.direction===0)mark(b.x-40+s.stompwait,s.y,s.stompwait%4<2?0x0000ff:0x40a0ff);if(s.direction===180)mark(b.x+40-s.stompwait,s.y,s.stompwait%4<2?0x0000ff:0x40a0ff);
   }
   drawInBulletBox(s,rt,object('obj_growtangle'));if(s.hurttimer>0){s.hurttimer--;s.x=s.hurtx-4+rt.random.random(8);s.y=s.hurty-4+rt.random.random(8);s.imageBlend=0x0000ff;}if(s.hittimer>0)s.hittimer--;
  },
  user0:()=>{},user1:()=>{},
 },collisions:[{target:object('obj_queen_leg'),run:(s,other,rt)=>{if(s.direction===270&&other.direction===180){s.hurttimer=20;s.hurtx=s.x;s.hurty=s.y;other.stomphold--;other.stompspeed=-.1;other.stomplerp=.8;rt.userEvent(other,0);other.hittimer=28;}}}]};
 return [laser,gun,bufferBullet,banana,feather,wineDrop,social,pfp,after,effect,leg];
}
