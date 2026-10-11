// Source: Chapter 1 obj_dbulletcontroller Step types 34/35, obj_skychain and obj_fadechain.
import {moveTowardsPoint,type GmObjectDef} from '../../gm/runtime';
import {le,lengthdirX,lengthdirY} from '../../gm/math';
import {C} from '../../gm/graphics';
import {heart,collideBullet,inheritBullet} from '../../deltarune/battle';
import {bulletController} from '../jevil/controller';
export const kingBulletController:GmObjectDef={...bulletController,events:{...bulletController.events,
 step:(s,rt)=>{
  // Types21/23 are the same native controller event already exercised by Jevil parity.
  bulletController.events!.step!(s,rt);
  if(s.type!==34&&s.type!==35)return;
  if(s.btimer<(s.type===34?28:22))return;
  s.typechoice=rt.random.choose(0,1,2,3);s.xx=0;s.yy=0;
  if(s.typechoice===0||s.typechoice===3){s.xx=rt.view.x+320+rt.random.random(300)-rt.random.random(300);s.yy=-60;}
  if(s.typechoice===1){s.xx=rt.view.x-60;s.yy=rt.random.random(320);}
  if(s.typechoice===2){s.xx=rt.view.x+700;s.yy=rt.random.random(320);}
  const c=rt.create(skyChain,s.xx,s.yy);s.chain=c.id;
  // Type34 passes the OBJECT id (255); native object variable writes select its first active instance.
  const recipient=s.type===34?rt.first(skyChain):c;if(recipient)inheritBullet(s,recipient);
  s.btimer=0;
 },
}};
export const fadeChain:GmObjectDef={name:'obj_fadechain',index:250,parent:collideBullet,sprite:'spr_chainpiece',events:{
 create:(s,rt)=>{Object.assign(s,{active:1,timer:0,bdir:rt.random.random(360),inv:60,timepoints:0,grazepoints:3,target:0,damage:50,grazed:0,grazetimer:0});},
 step:(s,rt)=>{s.timer++;if(s.timer>=30){s.active=0;s.imageAlpha-=.1;if(le(s.imageAlpha,0))rt.destroy(s);s.hspeed+=lengthdirX(.2,s.bdir);s.vspeed+=lengthdirY(.2,s.bdir);}},
}};
export const skyChain:GmObjectDef={name:'obj_skychain',index:255,parent:collideBullet,sprite:'spr_chainfront',events:{
 create:(s,rt)=>{s.sons=-1;s.son=[];s.damage=100;s.active=1;const h=rt.first(heart);if(!h)throw new Error('King skychain requires obj_heart');moveTowardsPoint(s,h.x+8,h.y+8,1);s.friction=-.3;Object.assign(s,{timer:0,con:0,inv:60,timepoints:0,grazepoints:3,target:0,damage:50,grazed:0,grazetimer:0,soundcon:0});rt.sound?.('snd_menumove');},
 step:(s,rt)=>{s.imageAngle=s.direction;if(s.con===0){s.timer++;if(s.timer>=2){s.sons++;const f=rt.create(fadeChain,s.x,s.y);s.son[s.sons]=f.id;f.imageAngle=s.imageAngle;f.direction=s.direction;f.speed=s.speed/2.5;f.active=1;f.damage=10;inheritBullet(s,f);s.timer=0;}}if(s.sons>=30)rt.destroy(s);},
 draw:(s,rt)=>{rt.drawSelf(s);s.can=s.y< -20||s.x<rt.view.x-20||s.x>rt.view.x+660?1:0;if(s.can===1){rt.drawState.color=C.red;rt.drawLine(s.x,s.y,s.x+lengthdirX(1000,s.direction),s.y+lengthdirY(1000,s.direction));}if(s.can===0&&s.soundcon===0){rt.sound?.('snd_spearrise');s.soundcon=1;}},
}};
