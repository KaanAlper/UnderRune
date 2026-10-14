// NEO's phone-hand family. Shots push the head and hands; contact damage uses the shared battle scripts.
// Fade, joint beads and flash run in Draw. The master Destroy and hurtbox End Step exit immediately.
import {resolveEvent,type GmInstance,type GmObjectDef,type GmRuntime} from '../../gm/runtime';
import {C,mergeColor} from '../../gm/graphics';
import {eq,ge,gt,le,lt} from '../../gm/math';
import {bulletInit,damage,damageAll} from '../../deltarune/battle';
import {bulletInherit2} from '../../deltarune/chapter2-battle';
import {snd} from '../../deltarune/sound';

const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
export function createNeoPhonehands(object:(name:string)=>GmObjectDef):GmObjectDef[]{
 const basic=object('obj_basicbullet_sneo'),regular=object('obj_regularbullet');
 const basicCreate=resolveEvent(basic,'create');
 if(!basicCreate)throw Error('NEO phone hands require obj_basicbullet_sneo Create');
 const first=(rt:GmRuntime,name:string)=>rt.first(object(name));
 const required=(rt:GmRuntime,id:number)=>{
  const i=rt.byId(id);if(!i)throw Error(`NEO phone hands require instance ${id}`);return i;
 };
 const fade=(s:GmInstance)=>{
  s.visibiliytimer+=1;if(lt(s.visibiliytimer,2))return false;
  if(lt(s.imageAlpha,1))s.imageAlpha+=0.1;return true;
 };
 /** A hand's sound bullet; orientation is tested independently, as in the source. */
 const soundBullet=(s:GmInstance,rt:GmRuntime,spread:number,speed:number)=>{
  const b=rt.create(basic,s.x,s.y);s.shot=b.id;
  if(s.orientation==='top')b.direction=270+rt.random.randomRange(-spread,spread);
  if(s.orientation==='bottom')b.direction=90+rt.random.randomRange(-spread,spread);
  b.speed=speed;b.sprite='spr_sneo_soundbullet';b.imageAngle=b.direction;
  b.target=s.target;b.grazepoints=3;return b;
 };
 const hand:GmObjectDef={name:'obj_sneo_phonehand',index:655,parent:basic,sprite:'spr_sneo_phonehand',depth:0,events:{
  create:(s,rt)=>{
   basicCreate(s,rt);
   Object.assign(s,{destroyonhit:0,siner:0,crawlsiner:0,jointx:999,jointy:999,remjointy:999,boss:-1,element:6,
    amplitude:4,period:5,orientation:'top',init:0,difficulty:0,btimer:0,moving:0,wasmoving:0,alt:0,visibiliytimer:0,imageAlpha:0});
  },
  step:(s,rt)=>{
   const boss=()=>rt.byId(s.boss);
   if(s.init===0){
    const b=boss();if(b){
     if(s.orientation==='top'){s.jointx=b.x-10;s.jointy=s.y-30;}
     if(s.orientation==='bottom'){s.imageYscale=-1;s.jointx=b.x-10;s.jointy=s.y+30;}
     s.remjointy=s.jointy;s.init=1;
    }
   }
   if(s.btimer===13){if(gt(s.imageYscale,0))s.imageYscale=2;if(lt(s.imageYscale,0))s.imageYscale=-2;}
   if(gt(s.imageYscale,1))s.imageYscale-=0.2;
   if(lt(s.imageYscale,-1))s.imageYscale+=0.2;
   s.movingcheck=0;
   const joints=()=>{const b=boss();if(b){s.jointx=(s.x+b.x)/2;s.jointy=(s.remjointy+s.y)/2;}};
   if(s.alt===0){
    s.crawlsiner+=1;
    if(s.orientation==='top'&&lt(Math.sin(s.crawlsiner/s.period),0)){
     s.wasmoving=1;s.movingcheck=1;s.y+=Math.cos(s.crawlsiner/s.period)*s.amplitude*2;s.x+=Math.sin(s.crawlsiner/s.period)*s.amplitude;
    }
    if(s.orientation==='bottom'&&lt(Math.cos(s.crawlsiner/s.period+Math.PI/2),0)){
     s.wasmoving=1;s.movingcheck=1;s.y+=Math.sin(s.crawlsiner/s.period+Math.PI/2)*s.amplitude*2;s.x+=Math.cos(s.crawlsiner/s.period+Math.PI/2)*s.amplitude;
    }
    joints();
   }
   if(s.alt===1&&boss()){
    if(s.orientation==='top')s.crawlsiner+=1;else s.crawlsiner-=1;
    s.xx=rt.view.x+200;s.endx=boss()!.x-20;
    s.x=s.xx+(s.endx-s.xx)/2+Math.sin(s.crawlsiner/12)*((s.endx-s.xx)/2);
    s.btimer+=1;s.threshold=s.orientation==='top'?28:18;
    if(ge(s.btimer,s.threshold)){
     soundBullet(s,rt,2,3);s.btimer=0;if(s.orientation==='top')s.btimer=10;else s.btimer=0;
    }
    joints();
   }
   if(s.difficulty===99&&s.movingcheck===0&&s.wasmoving===1){
    s.wasmoving=0;for(let n=0;n<3;n++)soundBullet(s,rt,10,8);
   }
   if(s.difficulty===99&&ge(s.btimer,6)){soundBullet(s,rt,4,4);s.btimer=0;}
  },
  draw:(s,rt)=>{
   if(!fade(s))return;
   rt.drawState.alpha=s.imageAlpha;rt.drawState.color=C.green;
   rt.drawLine(s.x,s.y,s.jointx,s.jointy,4);
   const b=rt.byId(s.boss);
   if(b){
    rt.drawLine(s.jointx,s.jointy,b.x,b.y,4);
    for(s.i=0;s.i<4;s.i+=1){
     rt.drawSprite('spr_sneo_bullet0',0,lerp(s.x,s.jointx,s.i/4),lerp(s.y,s.jointy,s.i/4),2,2,0,C.green,1);
     rt.drawSprite('spr_sneo_bullet0',0,lerp(s.jointx,b.x,s.i/4),lerp(s.jointy,b.y,s.i/4),2,2,0,C.green,1);
    }
   }
   rt.drawSelf(s);rt.drawState.alpha=1;
  },
 }};
 const master:GmObjectDef={name:'obj_sneo_phonehand_master',index:653,parent:basic,sprite:'spr_sneo_head_sad',depth:0,events:{
  create:(s,rt)=>{
   basicCreate(s,rt);
   Object.assign(s,{destroyonhit:0,imageSpeed:0,imageXscale:2,imageYscale:2,siner:0,element:6,xdist:70});
   const top=rt.create(hand,s.x-s.xdist,s.y-70);s.phonehand_top=top.id;top.orientation='top';top.boss=s.id;
   top.target=first(rt,'obj_sneo_bulletcontroller')!.target;
   const bottom=rt.create(hand,s.x-s.xdist,s.y+60);s.phonehand_bottom=bottom.id;bottom.orientation='bottom';bottom.boss=s.id;
   bottom.target=first(rt,'obj_sneo_bulletcontroller')!.target;
   Object.assign(s,{movedx:0,hp:200,difficulty:0});s.difficulty=first(rt,'obj_spamton_neo_enemy')!.difficulty;
   Object.assign(s,{btimer:0,init:0,visibiliytimer:0,imageAlpha:0,bluesiner:0});
   s.imageBlend=mergeColor(0xe8a200,C.aqua,0.25+Math.sin(s.bluesiner/3)*0.25);
  },
  step:(s,rt)=>{
   s.siner+=1;s.bluesiner+=1;s.imageBlend=mergeColor(0xe8a200,C.aqua,0.25+Math.sin(s.bluesiner/3)*0.25);
   if(ge(s.x,rt.view.x+480))s.x=rt.view.x+480;
   if(s.grazed===1){s.grazetimer+=1;if(ge(s.grazetimer,3)){s.grazetimer=0;s.grazed=0;}}
   const h=first(rt,'obj_heart');if(h&&gt(h.x,first(rt,'obj_sneo_phonehand_master')!.x-36))h.x=first(rt,'obj_sneo_phonehand_master')!.x-36;
   if(s.init===0){
    if(s.difficulty===2)for(const h of rt.all(hand))h.alt=1;
    required(rt,s.phonehand_top).target=s.target;required(rt,s.phonehand_bottom).target=s.target;s.init=1;
   }
   if(s.difficulty===0)s.y=s.ystart+Math.sin(s.siner/8)*40;
   if(s.difficulty===1||s.difficulty===2)s.y=s.ystart+Math.sin(s.siner/10)*60;
   const top=rt.byId(s.phonehand_top);
   if(top){if(lt(s.difficulty,2))s.x=lerp(s.x,top.x+s.xdist,0.2);else s.x-=1;}
   if(s.difficulty===0||s.difficulty===1||s.difficulty===2){
    s.btimer+=1;s.threshold=20;if(s.difficulty===1)s.threshold=15;if(s.difficulty===2)s.threshold=30;
    if(ge(s.btimer,s.threshold)&&ge(s.imageAlpha,1)){
     s.btimer=0;const b=rt.create(lt(s.difficulty,2)?spread:basic,s.x,s.y);s.shot=b.id;
     b.speed=12;b.imageXscale=3;b.imageYscale=3;if(lt(s.difficulty,2))b.friction=1;else b.speed=10;
     b.alarm[0]=25;b.direction=180+rt.random.randomRange(-5,5);b.depth=s.depth-1;b.target=s.target;
     s.sprite='spr_sneo_head_open';s.alarm[0]=10;
    }
   }
  },
  draw:(s,rt)=>{if(!fade(s))return;rt.drawState.alpha=s.imageAlpha;rt.drawSelf(s);rt.drawState.alpha=1;},
  alarm0:s=>{s.sprite='spr_sneo_head';},
  destroy:()=>{},
 },collisions:[{target:object('obj_yheart_shot'),run:(s,shot,rt)=>{
  s.hp-=1;
  if(le(s.x,rt.view.x+480)){
   s.friction=0.5;s.hspeed+=shot.big===1?8:4;
   const rembig=shot.big;
   for(const h of rt.all(hand)){h.friction=0.5;h.hspeed+=2;if(rembig)h.hspeed+=4;}
  }
  snd(rt,'snd_damage');if(ge(s.x,rt.view.x+480))s.x=rt.view.x+480;
  rt.userEvent(shot,0);
 }}]};
 const hurtbox:GmObjectDef={name:'obj_sneo_phonehand_master_hurtbox',index:654,parent:regular,sprite:'spr_hitbox_10px',depth:0,events:{
  create:s=>{bulletInit(s);Object.assign(s,{wall_destroy:1,imageAlpha:1,sprite:'spr_hitbox_10px',imageXscale:4,imageYscale:20,visible:true,destroyonhit:0,grazed:1,element:6});},
  endStep:()=>{},
  user5:(s,rt)=>{
   if(s.active===1){
    if(s.target!==3)damage(s,rt);else damageAll(s,rt);
    if(s.destroyonhit===1)rt.destroy(s);
   }
  },
 }};
 const spread:GmObjectDef={name:'obj_sneo_mmx_spreadshot',index:656,parent:basic,sprite:'spr_sneo_bullet0',depth:0,events:{
  create:(s,rt)=>{
   basicCreate(s,rt);Object.assign(s,{element:6,flashtimer:0,grazed:0,grazepoints:2,timepoints:1,target:-1,grazetimer:0,dont:1,inv:120});
   const club=first(rt,'obj_clubsenemy');if(club)s.damage=rt.globals.monsterat[club.myself]*5;
  },
  step:(s,rt)=>{
   if(ge(s.x,rt.room.width+100)||le(s.x,-100)||ge(s.y,rt.room.height+100)||le(s.y,-100))rt.destroy(s);
   s.direction+=s.angle_speed;s.imageAngle=s.direction;
   if(eq(s.alarm[0],8)||eq(s.alarm[0],16))s.flashtimer=5;
  },
  alarm0:(s,rt)=>{
   for(s.i=0;s.i<3;s.i+=1){
    const b=rt.create(regular,s.x,s.y);s.shot=b.id;
    if(b.live){
     b.direction=120+s.i*60;b.speed=2;b.friction=-0.6;b.sprite='spr_sneo_soundbullet';b.imageAngle=b.direction;
     b.depth=first(rt,'obj_sneo_phonehand_master')!.depth-1;b.grazepoints=7;b.element=6;
    }
    bulletInherit2(s,b);
   }
   rt.destroy(s);
  },
  draw:(s,rt)=>{
   rt.drawSelf(s);if(gt(s.flashtimer,0))s.flashtimer-=1;
   rt.drawSpriteFog(s.sprite!,s.imageIndex,s.x-2,s.y-2,s.imageXscale,s.imageYscale,0,C.yellow,s.flashtimer/5);
  },
 }};
 return [master,hand,hurtbox,spread];
}
