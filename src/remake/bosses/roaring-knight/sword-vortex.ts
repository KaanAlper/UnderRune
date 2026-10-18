// The Roaring Knight's sword vortex (bullet type 154, with the tracking swords): swords circle the box's centre on
// a breathing radius, added in pairs, while the centre drifts around the box. Objects: obj_sword_vortex_manager and
// obj_sword_vortex.
import type {GmObjectDef,GmRuntime} from '../../gm/runtime';
import {lengthdirX,lengthdirY,lerp} from '../../gm/math';
import {bulletInit,growtangle} from '../../deltarune/battle';
import {bulletInherit} from '../../deltarune/chapter3-scripts';
import type {Chapter2BulletRunner} from '../../deltarune/chapter2-bullets';

/** The manager's set-up by variant: [rate, maxswords, multiswordmax, multiswordframes, sinpower, sinspeed,
 * startinglen, shrinkrate, centre moves]. The swords after the first alternate right and left. */
const VARIANTS:Readonly<Record<number,readonly [number,number,number,number,number,number,number,number,number]>>={
 0:[1,2,0,0,65,24,70,0,0],1:[10,6,2,1,20,18,90,0.15,0],2:[4,6,2,1,20,26,70,0,0],3:[11,6,2,1,17,22,80,0,1]};

export function createSwordVortex(object:(name:string)=>GmObjectDef){
 const box=(rt:GmRuntime)=>{const b=rt.first(growtangle);if(!b)throw Error('The sword vortex needs obj_growtangle');return b;};
 const sword:GmObjectDef={...object('obj_sword_vortex'),events:{
  create:s=>{
   Object.assign(s,{timer:0,con:0,dir:0,imageAlpha:0});bulletInit(s);
   Object.assign(s,{destroyonhit:0,damage:10,grazepoints:2,timepoints:1,spinspeed:4,speedtowardscenter:0.4,len:70,sinpower:65,sinspeed:24,shrinkrate:0});s.lenstart=s.len;
  },
  step:(s,rt)=>{
   s.imageAlpha+=0.1;s.dir-=s.spinspeed*lerp(2,1,s.len/120);s.imageAngle=s.dir-90;
   const m=rt.first(manager);
   if(m){s.len=s.lenstart+Math.sin(m.siner/s.sinspeed)*s.sinpower;s.x=m.swordcirclecenterx+lengthdirX(s.len,s.dir);s.y=m.swordcirclecentery+lengthdirY(s.len,s.dir);s.lenstart-=s.shrinkrate;}
   s.timer++;if(s.timer%4===0)s.grazed=0;
  },
  draw:(s,rt)=>rt.drawSelf(s),
 }};
 const manager:GmObjectDef={...object('obj_sword_vortex_manager'),events:{
  create:(s,rt)=>{
   const b=box(rt);
   Object.assign(s,{timer:0,siner:0,con:0,variant:3,firstsword:0,swordcount:0,sinpower:65,sinspeed:24,startinglen:70,shrinkrate:0,multiswordmax:0,multiswordframes:0,
    multiswordcon:0,multiswordcount:0,centermoves:0,centermovescon:0,centermovestimer:0,movespeed:60,swordcirclecenterx:b.x,swordcirclecentery:b.y});
   Object.assign(s,{startx:s.swordcirclecenterx,starty:s.swordcirclecentery,targetx:0,targety:0,setcount:0});
   s.setdirection=[];for(s.i=0;s.i<50;s.i++)s.setdirection[s.i]=-1;
   s.creatorid=-1;s.creator=-1;bulletInit(s);
   // The set-up reads variant here, before the bullet maker sets it: every vortex starts as variant 3.
   const v=VARIANTS[s.variant];
   if(v){
    [s.rate,s.maxswords,s.multiswordmax,s.multiswordframes,s.sinpower,s.sinspeed,s.startinglen,s.shrinkrate]=v;s.ratedecay=0;s.rateminimum=1;
    if(s.maxswords===2){s.setdirection[1]=0;s.setdirection[2]=180;}else for(let n=1;n<=6;n++)s.setdirection[n]=n%2===1?0:180;
    if(v[8]){s.centermoves=1;s.movespeed=60;}
   }
   s.timer=s.rate-5;
  },
  step:(s,rt)=>{
   s.timer++;s.siner++;
   if((s.timer===s.rate&&s.swordcount<s.maxswords)||(s.timer===s.multiswordframes&&s.multiswordcon===1)){
    const b=box(rt),w=rt.create(sword,b.x,b.y);s.inst=w.id;
    w.dir=rt.random.choose(0,45,90,135,180,225,270,315);w.variant=s.variant;w.sinpower=s.sinpower;w.sinspeed=s.sinspeed;w.len=s.startinglen;w.lenstart=w.len;w.shrinkrate=s.shrinkrate;
    w.damage=s.damage;w.target=s.target;
    s.swordcount++;s.setcount++;
    if(s.setdirection[s.setcount]!==-1)w.dir=s.setdirection[s.setcount];
    if(s.multiswordmax>0)s.multiswordcount++;
    if(s.multiswordcon===0&&s.multiswordmax>0)s.multiswordcon=1;
    if(s.multiswordcon===1&&s.multiswordcount===s.multiswordmax){s.multiswordcon=0;s.multiswordcount=0;}
    w.x=w.xstart+lengthdirX(w.len,w.dir);w.y=w.ystart+lengthdirY(w.len,w.dir);w.imageAngle=w.dir-90;
    s.rate-=s.ratedecay;if(s.rate<s.rateminimum)s.rate=s.rateminimum;
    s.timer=0;
   }
   if(s.centermoves===1){
    if(s.centermovescon===0){
     const b=box(rt);s.startx=s.swordcirclecenterx;s.starty=s.swordcirclecentery;
     s.targetx=b.x-60+rt.random.irandom(120);s.targety=b.y-60+rt.random.irandom(120);s.centermovescon=1;
    }
    if(s.centermovescon===1){
     s.centermovestimer++;
     s.swordcirclecenterx=lerp(s.startx,s.targetx,s.centermovestimer/s.movespeed);s.swordcirclecentery=lerp(s.starty,s.targety,s.centermovestimer/s.movespeed);
     if(s.centermovestimer===s.movespeed){s.centermovestimer=0;s.centermovescon=0;}
    }
   }
  },
 }};
 /** Bullet type 154 in the bullet maker. */
 const pattern:Chapter2BulletRunner=(s,rt)=>{
  if(s.type!==154)return false;
  if(!s.made){const m=rt.create(manager,box(rt).x,rt.view.y);bulletInherit(s,m);m.variant=s.difficulty;m.damage=s.damage;s.made=1;}
  return true;
 };
 return {objects:[sword,manager],pattern};
}
