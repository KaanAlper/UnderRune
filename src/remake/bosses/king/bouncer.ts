// Chapter1 obj_growtangle_bouncer Create/Step/Draw/User2. Released King attacks use types5 and3.
import type {GmObjectDef} from '../../gm/runtime';
import {le,lt,ge,gt} from '../../gm/math';
import {C} from '../../gm/graphics';
import {regularBulletPermanent,growtangle,shake} from '../../deltarune/battle';
export const growtangleBouncer:GmObjectDef={name:'obj_growtangle_bouncer',depth:4,index:253,parent:regularBulletPermanent,sprite:'spr_battlebg_2',events:{
 create:(s,rt)=>{s.imageSpeed=0;s.imageXscale=1.96;s.imageYscale=1.96;s.initdir=rt.random.choose(45,135,225,315);s.direction=s.initdir;s.speed=.1;s.active=1;const box=rt.first(growtangle);if(box){s.x=box.x;s.y=box.y;box.megakeep=1;}Object.assign(s,{timer:0,type:0,con:0,xx:rt.view.x,yy:rt.view.y,lx:140+rt.view.x,rx:480+rt.view.x,ux:rt.view.y,dx:320+rt.view.y,fadein:0,spikecount:0,inv:60,timepoints:0,grazepoints:3,target:0,damage:50,grazed:0,grazetimer:0,minitimer:0,bumpnoise:0,timerbonus:0,wall_destroy:0});},
 user2:(s,rt)=>{for(const b of rt.all(growtangle))b.growcon=3;rt.globals.turntimer=3;rt.destroy(s);},
 step:(s,rt)=>{
  if(s.type!==3&&s.type!==5)throw new Error(`Unsupported King debug bouncer type ${s.type}`);
  if(s.con===0){if(s.type===3)s.direction+=rt.random.random(20)-rt.random.random(20);const inset=s.type===3?50:30;s.ux+=inset;s.dx-=inset;s.lx+=inset;s.rx-=inset;s.con=.4;}
  if(s.con===.4){s.minitimer++;if(s.minitimer>=14)s.con=.5;}
  const maximum=s.type===3?4.4:4;
  if(s.con===.5&&lt(s.speed,maximum))s.speed+=.2;
  if(s.con===.5&&ge(s.speed,maximum)){s.timer++;if(s.timer>=170)s.con=1;}
  if(s.con===1){s.speed-=s.type===3?.5:.2;if(le(s.speed,.1))rt.userEvent(s,2);}
  const box=rt.first(growtangle);if(box){box.x=s.x;box.y=s.y;s.lborder=s.x-rt.spriteWidth(s)/2;s.rborder=s.x+rt.spriteWidth(s)/2;s.uborder=s.y-rt.spriteHeight(s)/2;s.dborder=s.y+rt.spriteHeight(s)/2;if(lt(s.lborder,s.lx)&&lt(s.hspeed,0)){s.hspeed=-s.hspeed;s.bumpnoise=1;}if(gt(s.rborder,s.rx)&&gt(s.hspeed,0)){s.hspeed=-s.hspeed;s.bumpnoise=1;}if(lt(s.uborder,s.ux)&&lt(s.vspeed,0)){s.vspeed=-s.vspeed;s.bumpnoise=1;}if(gt(s.dborder,s.dx)&&gt(s.vspeed,0)){s.vspeed=-s.vspeed;s.bumpnoise=1;}if(s.bumpnoise===1){rt.sound?.('snd_bump');rt.sound?.('snd_screenshake');s.bumpnoise=0;if(!rt.exists(shake))rt.create(shake,0,0);}}
  if(s.grazed===1){if(s.timerbonus===0){s.timer+=2;s.timerbonus=1;}s.grazetimer++;if(s.grazetimer>=15){s.timerbonus=0;s.grazetimer=0;s.grazed=0;}}
 },
 draw:(s,rt)=>{rt.drawSelf(s);if(s.fadein<10)s.fadein++;rt.drawState.alpha=s.fadein/10;rt.drawState.color=C.white;rt.drawRect(s.lx,s.ux,s.rx,s.dx,true);rt.drawRect(s.lx+1,s.ux+1,s.rx-1,s.dx-1,true);rt.drawState.alpha=1;s.w=rt.spriteWidth(s);s.h=rt.spriteHeight(s);s.spikecount=Math.floor(s.w/11);for(let i=0;i<s.spikecount;i++){rt.drawSprite('spr_bouncebox_spike',0,s.x-s.w/2+3,s.y-s.h/2+i*11,1,1,0,C.white,s.fadein/10);rt.drawSprite('spr_bouncebox_spike',0,s.x+s.w/2-i*11,s.y-s.h/2+3,1,1,270,C.white,s.fadein/10);rt.drawSprite('spr_bouncebox_spike',0,s.x-s.w/2+i*11,s.y+s.h/2-2,1,1,90,C.white,s.fadein/10);rt.drawSprite('spr_bouncebox_spike',0,s.x+s.w/2-2,s.y-s.h/2+i*11,-1,1,0,C.white,s.fadein/10);}},
}};
