// Chapter 1 obj_lancerbike Create/Step: the opening race and the spade-firing lap.
// This object is for encounter 2; Susie-and-Lancer scene choreography is handled separately.
import {moveTowardsPoint,type GmObjectDef} from '../../gm/runtime';
import {lengthdirX,lengthdirY,lt,le,ge,gt,eq} from '../../gm/math';
import {regularBullet,afterimageGrow,heart,battleController,dmgWriter,damage} from '../../deltarune/battle';
export const lancerBoss:GmObjectDef={name:'obj_lancerboss',index:244,sprite:'spr_lancerbike',events:{
 create:s=>{Object.assign(s,{turns:0,con:0,compliment:0,imageSpeed:0,imageXscale:2,imageYscale:2,state:0,siner:0,hurttimer:0,hurtshake:0,shakex:0,dodgetimer:0,candodge:1});},
 draw:(s,rt)=>{
  // obj_lancerboss Draw: thirty-frame recoil, alternating shake, and fifteen-frame dodge.
  if(s.state===3){s.hurttimer--;if(s.hurttimer<0)s.state=0;else{s.hurtshake++;if(s.hurtshake>1){if(s.shakex>0)s.shakex--;else if(s.shakex<0)s.shakex++;s.shakex=-s.shakex;s.hurtshake=0;}rt.drawSprite('spr_lancerbike_hurt',s.hurttimer/2,s.x+s.shakex,s.y,2,2,0,s.imageBlend,1);}}
  if(s.state===4){s.dodgetimer++;rt.drawSprite('spr_lancerbike_l',0,s.x,s.y,Math.cos(s.dodgetimer*2*Math.PI/15)*2,2,0,s.imageBlend,1);if(s.dodgetimer>=15)s.state=0;}
  if(s.state===0){s.siner++;rt.drawSprite('spr_lancerbike',s.siner/5,s.x,s.y,2,2,0,s.imageBlend,1);}
 },
}};
export const lancerBike:GmObjectDef={name:'obj_lancerbike',index:211,parent:regularBullet,sprite:'spr_lancerbike',events:{
 user5:(s,rt)=>{if(s.target===0&&le(rt.globals.hp[1],rt.globals.maxhp[1]/2))s.damage=Math.ceil(rt.globals.hp[1]/3);damage(s,rt);},
 create:(s,rt)=>{Object.assign(s,{grazed:0,grazepoints:10,timepoints:0,target:0,dont:1,inv:60,damage:20,spec:0,imageXscale:2,imageYscale:2,loop:0,lcon:0,flip:0,ltimer:0,btimer:0,endcon:0,racecon:0,topy:rt.view.y+120,bottomy:rt.view.y+250});if(le(rt.globals.hp[1],rt.globals.maxhp[1]/2))s.damage=10;if(le(rt.globals.hp[1],rt.globals.maxhp[1]/4))s.damage=5;},
 step:(s,rt)=>{
  const vx=rt.view.x,vy=rt.view.y;
  if(s.lcon===1){s.orx=s.x;s.ory=s.y;s.ang=0;s.ltimer=0;s.shrinktimer=0;s.lcon=1.5;}
  if(s.lcon===1.5){s.ltimer++;if(s.ltimer>=10){s.ltimer=0;s.lcon=2;rt.sound?.('snd_cardrive');}}
  if(s.lcon>=6&&s.lcon<10){s.btimer++;if(s.btimer>=10){
   s.xoff=lengthdirX(40,s.imageAngle-20);s.yoff=lengthdirY(40,s.imageAngle-20);rt.sound?.('snd_spearrise');
   const b=rt.create(regularBullet,s.x-s.xoff,s.y-s.yoff);b.target=s.target;b.damage=s.damage;
   if(b.target===0&&le(rt.globals.hp[1],rt.globals.maxhp[1]/2))b.damage=Math.ceil(rt.globals.hp[1]/3);
   b.timepoints=0;b.sprite='spr_spadebullet';const h=rt.first(heart);if(h)moveTowardsPoint(b,h.x+8,h.y+8,4);
   b.imageAngle=b.direction;b.friction=-.4;b.depth=s.depth+1;s.btimer=0;
  }}
  if(s.lcon===2){s.ltimer++;s.shrinktimer++;s.hspeed=Math.sin(s.ltimer/3)*5;s.imageYscale=2-Math.sin(s.ltimer/5);if(s.shrinktimer>4)s.imageYscale=2-Math.sin(s.ltimer/5)*8/s.shrinktimer;
   if(s.ltimer>7){s.imageAngle-=Math.abs(Math.sin(s.ltimer/5))*4;s.ang=-s.imageAngle;}
   if(s.ltimer>4&&le(Math.abs(Math.sin(s.ltimer/5)),.06)){s.lcon=5;s.imageYscale=2;s.direction=180;s.speed=4;}}
  if(s.lcon===5){if(lt(s.speed,16))s.speed+=2;if(s.ang<45)s.ang+=4;s.imageAngle=-s.ang;if(lt(s.x,vx+80))s.lcon=6;}
  if(s.lcon===6){if(s.ang<135)s.ang+=10;s.imageAngle=-s.ang;if(le(s.x,vx+5)){s.lcon=7;s.direction=90;}}
  if(s.lcon===7){if(lt(s.y,vy+80)){if(s.ang<225)s.ang+=10;if(le(s.y,vy+5)){s.direction=0;s.lcon=8;}}else if(s.ang<135)s.ang+=10;s.imageAngle=-s.ang;}
  if(s.lcon===8){if(ge(s.x,vx+540)){if(s.ang<315)s.ang+=10;if(ge(s.x,vx+630)){s.direction=270;s.lcon=9;}}else if(s.ang<225)s.ang+=10;s.imageAngle=-s.ang;}
  if(s.lcon===9){if(gt(s.y,s.ory-70)){if(s.ang<360)s.ang+=10;if(ge(s.y,s.ory-5)){s.y=s.ory;s.direction=180;s.lcon=10;}}else if(s.ang<315)s.ang+=10;s.imageAngle=-s.ang;}
  if(s.lcon===10){s.ang=0;s.imageAngle=0;if(le(s.x,s.orx)){s.speed=0;s.x=s.orx;s.lcon=11;s.ltimer=0;}}
  if(s.lcon===11){s.sprite='spr_lancerbike_l';s.ltimer++;if(s.ltimer>=25){for(const b of rt.all(regularBullet)){b.active=0;b.imageAlpha-=.2;}s.imageAlpha=1;}if(s.ltimer>=30){s.lcon=0;s.endcon=1;}}
  if(s.racecon===1){s.sy=0;s.s_moveup=0;s.orx=s.x;s.ory=s.y;s.ang=0;s.racecon=2;s.vspeed=-14*rt.random.choose(1,-1);s.rtimer=0;s.maxr=15+rt.random.random(25);}
  if(s.racecon===2){if(lt(s.y,s.topy+10))s.vspeed=12;if(gt(s.y,s.bottomy-10))s.vspeed=-12;s.rtimer++;if(gt(s.rtimer,s.maxr)){s.vspeed=0;s.racecon=3;s.rtimer=0;}}
  if(s.racecon===3){s.rtimer++;if(eq(s.rtimer,5)||eq(s.rtimer,10)){rt.sound?.('snd_lancerhonk');rt.create(afterimageGrow,s.x-60,s.y-40).sprite='spr_lancernoise';}if(s.rtimer>=25){rt.sound?.('snd_drive');s.racecon=4;s.hspeed=-20;s.rtimer=0;s.ang=0;}}
  if(s.racecon===4){s.rtimer++;s.ang+=s.rtimer*2+4;if(s.ang>50)s.ang=50;s.imageAngle=-s.ang;if(le(s.x,vx-40)){s.ang=0;s.imageAngle=0;s.x=vx+740;s.y=s.ory;s.hspeed=-12;s.racecon=5;}}
  if(s.racecon===5&&le(s.x,s.orx+5)){s.hspeed=0;s.x=s.orx;s.racecon=0;s.endcon=1;}
  if(s.endcon===1){rt.globals.turntimer=2;for(const b of rt.all(lancerBoss)){b.visible=true;if(b.turns>=4){b.con=1;for(const c of rt.all(battleController))c.noreturn=1;}}rt.destroy(s);}
  if(rt.first(lancerBoss)?.compliment>=3)for(const d of rt.all(dmgWriter))d.spec=1;
 },
}};
