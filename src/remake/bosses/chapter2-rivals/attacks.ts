// Berdly's wind and flyer projectiles. Event order is significant: the wind accelerates in Begin Step,
// moves in the runner, and only then rotates around the box in Step.
import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {round,pointDirection,pointDistance,lengthdirX,lengthdirY,gt,lt,ge} from '../../gm/math';
import {mergeColor} from '../../gm/graphics';
import {bulletInit,collideBullet,growtangle,heart,shake} from '../../deltarune/battle';
import {snd} from '../../deltarune/sound';

type ObjectLookup=(name:string)=>GmObjectDef;
const angleDifference=(a:number,b:number)=>((a-b)%360+540)%360-180;
function bullet(caller:GmInstance,rt:GmRuntime,def:GmObjectDef,x:number,y:number){
 const d=rt.create(def,x,y);d.damage=caller.damage;d.target=caller.target;
 if('element' in caller)d.element=caller.element;
 return d;
}
export function createRivalAttacks(object:ObjectLookup):GmObjectDef[]{
 const tornado:GmObjectDef={...object('obj_berdlyb_tornado'),parent:collideBullet,events:{
  create:(s,rt)=>{bulletInit(s);s.imageAlpha=0;if(!rt.exists(heart))rt.destroy(s);
   Object.assign(s,{wall_destroy:1,maxSpeed:8,speed:0,destroyonhit:0,flipSpeed:4,flipTimer:0,timer:-10,middespawn:0,traveldistance:0,maxdistance:400,firstwave:0,spindir:0,start_angle:0,init:false});},
  beginStep:s=>{
   if(s.firstwave===1){s.speed=0;for(s.i=0;s.i<50;s.i++)s.speed+=-(-1.75+Math.sin((s.i+15.707963267948966)/10)*1.75);s.firstwave=2;}
   else if(s.firstwave===2){s.speed=0;s.fadetimer=50;s.firstwave=-1;}
   else if(ge(s.timer,0)){s.speed=-(-3.5+Math.sin((s.timer+15.707963267948966)/10)*3.5);if(s.middespawn&&lt(s.traveldistance,110))s.speed/=2;}
   s.traveldistance+=s.speed;s.timer++;
  },
  step:(s,rt)=>{
   if(!s.init){s.init=true;s.start_angle=(s.direction+180)%360+15;}
   if(s.middespawn&&ge(s.traveldistance,s.maxdistance))rt.destroy(s);
   if(s.spindir!==0){const box=rt.first(growtangle)!;const dist=pointDistance(s.x,s.y,box.x,box.y),theta=s.start_angle+dist/103*s.spindir*22.5-s.spindir*s.timer/3;
    s.x=box.x+lengthdirX(dist,theta);s.y=box.y+lengthdirY(dist,theta);s.direction=pointDirection(s.x,s.y,box.x,box.y);
   }else if(s.wall_destroy===1){if(lt(s.x,rt.view.x-80)||gt(s.x,rt.view.x+760)||lt(s.y,rt.view.y-80)||gt(s.y,rt.view.y+580))rt.destroy(s);}
   if(s.updateimageangle===1)s.imageAngle=s.direction;
  },
  draw:(s,rt)=>{
   if(s.init&&lt(s.imageAlpha,1)&&s.firstwave<=0){
    if(s.middespawn&&s.firstwave===0){const to=.25+Math.max(0,Math.min(1,(s.timer-50)/15))*.75;s.imageAlpha+=Math.sign(to-s.imageAlpha)*Math.min(.1,Math.abs(to-s.imageAlpha));}
    else s.imageAlpha+=.1;
   }
   s.xflip=s.flipTimer<0?-1:1;s.flipTimer++;if(ge(s.flipTimer,s.flipSpeed))s.flipTimer-=s.flipSpeed*2;
   if(s.sprite)rt.drawSprite(s.sprite,0,s.x,s.y,s.xflip,1,0,s.imageBlend,s.imageAlpha);
  },
 }};
 const flyer:GmObjectDef={...object('obj_berdlyb_chirashibullet'),parent:collideBullet,events:{
  create:(s,rt)=>{bulletInit(s);Object.assign(s,{active:0,___myrememberx:s.x,___myremembery:s.y,startx:s.x,starty:s.y,phase:0,lerpPoint:0,rotationSpeed:rt.random.irandom(25)+5,rotationDir:1});
   if(rt.random.irandom(1)===0)s.rotationDir=-1;
   Object.assign(s,{fireoffset:rt.random.irandom(5),targetAngle:0,timer:0,delay:0,difficulty:0,color_timer:0,start_angle:-999,imageSpeed:0});},
  step:(s,rt)=>{
   if(s.phase>1&&s.imageBlend!==0xffffff){s.color_timer+=.1;s.imageBlend=mergeColor(0x808080,0xffffff,s.color_timer);}
   switch(s.phase){
    case 0:if(s.delay===0)s.imageAlpha=0;if(ge(s.delay,s.timer)){s.imageAlpha=1;s.phase++;}else s.delay++;break;
    case 1:{const v=s.lerpPoint/15;s.ease=-v*(v-2);s.x=s.startx+(s.___myrememberx-s.startx)*s.ease;s.y=s.starty+(s.___myremembery-s.starty)*s.ease;s.lerpPoint++;s.imageAngle+=s.rotationSpeed*s.rotationDir;if(gt(s.lerpPoint,15))s.phase++;break;}
    case 2:
     if(s.difficulty===1)s.targetAngle=205-(s.targetAngle-205)*.75+rt.random.randomRange(-10,10);
     else if(s.difficulty===0){const h=rt.first(heart)!;s.targetAngle=pointDirection(s.___myrememberx,s.___myremembery,h.x,h.y);s.targetAngle+=rt.random.randomRange(-10,10);}
     else{const b=rt.first(growtangle)!;s.targetAngle=pointDirection(s.___myrememberx,s.___myremembery,b.x,b.y);s.targetAngle=210-(s.targetAngle-210)*1.1;}
     // The source deliberately falls through without incrementing phase here.
    case 3:s.timer++;if(gt(s.rotationSpeed,2))s.rotationSpeed--;s.imageAngle+=s.rotationSpeed*s.rotationDir;
     if(ge(s.timer,6+s.fireoffset/2)){s.timer=0;s.phase++;s.rotationDir=Math.sign(angleDifference(s.imageAngle,s.targetAngle));if(s.rotationDir===0)s.rotationDir=1;}break;
    case 4:s.imageAngle+=Math.min(Math.abs(angleDifference(s.imageAngle,s.targetAngle)),40)*s.rotationDir;s.timer++;
     if(ge(s.timer,4+s.fireoffset/2)){s.direction=s.targetAngle;s.imageAngle=s.targetAngle;s.active=true;s.phase++;s.gravity=rt.random.randomRange(.5,.7);s.gravityDirection=s.targetAngle;s.speed=-2;}break;
    case 5:s.imageIndex=Math.min(Math.max(0,rt.bank.get(s.sprite!)!.frames-1),Math.floor(s.speed/2));break;
   }
  },
 }};
 const storm:GmObjectDef={...object('obj_berdlyb_chirashistorm'),events:{
  create:(s,rt)=>{const b=rt.first(growtangle)!;Object.assign(s,{imageAlpha:0,damage:7,originx:b.x+80,originy:b.y-140,difficulty:0,init:0,target:-1,first_set:true});},
  step:(s,rt)=>{if(s.init!==0)return;for(s.iy=0;s.iy<3;s.iy++)for(s.ix=0;s.ix<4;s.ix++){
   const d=bullet(s,rt,flyer,s.x,s.y);s.d=d.id;s.xx=s.originx+s.ix*40+s.iy*20+rt.random.irandom(35);s.yy=s.originy+s.iy*40+rt.random.irandom(35);
   d.___myrememberx=s.xx;d.___myremembery=s.yy;d.fireoffset+=(s.ix+3-s.iy)*5;d.difficulty=s.difficulty;d.grazepoints=s.grazepoints;
   d.timer=round(angleDifference(135,pointDirection(s.x,s.y,s.xx,s.yy))/10);if(!s.first_set)d.imageBlend=0x808080;
  }s.init=1;},
 }};
 const block:GmObjectDef={...object('obj_rouxls_fallingblock'),parent:collideBullet,events:{
  create:s=>{bulletInit(s);s.destroyonhit=0;s.bottomhit=0;},
  step:(s,rt)=>{const b=rt.first(growtangle)!;if(!s.bottomhit&&gt(s.y+s.vspeed,b.y+rt.spriteWidth(b)/2-20)){
   s.y=b.y+rt.spriteWidth(b)/2-20;b.y+=4;s.direction=rt.random.randomRange(30,150);s.speed=rt.random.random(3);
   const d=rt.first(shake)??rt.create(shake,0,0);s.d=d.id;d.shakex=2;d.shakey=2;snd(rt,'snd_screenshake');s.bottomhit=1;
  }if(gt(s.y,rt.view.y+580))rt.destroy(s);},
 }};
 const note:GmObjectDef={...object('obj_musicalbattlenote'),events:{
  create:(s,rt)=>{s.imageBlend=rt.random.choose(0x808080);s.gravity=.2;s.vspeed=-rt.random.randomRange(1,2);const speed=rt.random.randomRange(.5,1.5);s.hspeed=speed*rt.random.choose(1,-1);s.imageXscale=2;s.imageYscale=2;},
  step:(s,rt)=>{if(gt(s.vspeed,2))rt.destroy(s);},
 }};
 return [tornado,flyer,storm,block,note];
}

/** The body of source obj_dbulletcontroller types 8 and 10, after its shared timer/bounds prelude. */
export function runBerdlyBulletController(s:GmInstance,rt:GmRuntime,object:ObjectLookup):boolean{
 if(s.type===8){
  if(s.init===1&&s.difficulty===1){s.special=1;s.init=2;rt.globals.turntimer=200;}
  if(gt(s.btimer,45*s.ratio)){
   s.pattern=rt.random.irandom(1);s.startDelay=-10;const box=rt.first(growtangle)!;
   if(s.difficulty===0||s.difficulty===1){
    let startDir=s.difficulty===1?rt.random.irandom(360):0;
    let x=s.maxx+30,y=0;s.yshift=rt.spriteHeight(box)/3-14;
    if(rt.random.irandom(1)===0)y=s.miny+22;else{y=s.maxy-22;s.yshift=-s.yshift;}
    const spin=s.difficulty===1?rt.random.choose(-1,1):0;
    for(let i=0;i<(s.difficulty===1?8:4);i++){
     if(s.difficulty===1){s.pattern=1;x=box.x+lengthdirX(240,startDir);y=box.y+lengthdirY(240,startDir);}
     const d=bullet(s,rt,object('obj_berdlyb_tornado'),x,y);s.d=d.id;if(s.difficulty===0)y+=s.yshift;
     d.direction=s.difficulty===1?startDir+180:180;d.maxSpeed=6;d.grazepoints=5;d.timer=s.startDelay;
     if(s.difficulty===1){d.maxdistance=240;d.spindir=spin;}
     d.imageAlpha=0;s.startDelay+=s.pattern&&i%2===1?(s.difficulty===1?15:10):-(s.difficulty===1?15:10);
     if(s.difficulty===1){if(s.special===1)d.firstwave=true;else if(s.special===2)s.startDelay+=12.831853071795862;}
     d.imageAlpha=-i*.1;d.flipTimer=i-4;if(s.difficulty===1){d.middespawn=1;startDir+=45;}
    }
    if(s.difficulty===1)s.side=1-s.side;
   }
   if(s.special===1)s.special=0;else if(s.special===2){s.special=0;s.btimer=0;}else s.btimer=s.pattern&&s.difficulty===0?10:0;
  }return true;
 }
 if(s.type===10){
  if(s.init===1){if(s.difficulty===0)s.difficulty=rt.random.choose(-1,0);s.init=2;s.maxmake=s.difficulty===1?3:2;}
  if(ge(s.btimer,50*s.ratio)&&s.made<s.maxmake){const d=rt.create(object('obj_berdlyb_chirashistorm'),s.x+46,s.y+40);s.d=d.id;
   Object.assign(d,{target:s.target,damage:s.damage,difficulty:s.difficulty,grazepoints:4});if(s.made>0&&rt.globals.monster.filter((v:number)=>v===1).length===1)d.first_set=false;
   s.made++;s.btimer=0;if(s.difficulty<1)s.difficulty=-1-s.difficulty;
  }return true;
 }
 return false;
}
