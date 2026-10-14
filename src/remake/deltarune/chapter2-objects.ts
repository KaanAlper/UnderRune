// Chapter 2's versions of shared battle objects where they differ from Chapter 1's: the speech balloon (which can
// size itself to its text) and the scr_enemyblcon that makes it.
import type {GmInstance,GmObjectDef,GmRuntime} from '../gm/runtime';
import {C} from '../gm/graphics';
import {writer} from './writer';
import {afterimage,battleSolid,heart} from './battle';
import {round} from '../gm/math';
import {mergeColor} from './chapter2-battle';

/** obj_battleblcon (Chapter 2): a balloon with a writer inside; with auto_length it is drawn around the text. */
export const battleBalloon2:GmObjectDef={name:'obj_battleblcon',index:875,sprite:'spr_battleblcon',events:{
 create:(s,rt)=>{
  const w=rt.create(writer,s.x+5,s.y+5);w.depth=9999999;s.mywriter=w.id;
  Object.assign(s,{auto_length:0,side:1,xoffset:0,init:0,reformatted:0,remx:s.x,remy:s.y,remmsgno:-1,initwritingx:-1,initwritingy:-1});
 },
 step:(s,rt)=>{if(!rt.byId(s.mywriter))rt.destroy(s);},
 draw:(s,rt)=>{
  const w=rt.byId(s.mywriter);if(!w)return;
  w.depth=s.depth-5;
  if(s.remmsgno!==rt.first(writer)!.msgno)s.reformatted=0;
  if(s.auto_length===0){s.init=1;s.reformatted=1;}
  if(s.reformatted===0&&w.formatted===1){
   if(s.init===0){s.initwritingx=w.writingx;s.initwritingy=w.writingy;s.init=1;}
   s.writingx=w.writingx;s.writingy=w.writingy;s.stringmax=w.stringmax;s.hspace=w.hspace;s.vspace=w.vspace;s.linecount=w.linecount;
   s.balloonwidth=s.stringmax*s.hspace+10;s.balloonheight=(s.linecount+1)*s.vspace+5;
   if(s.side===1){
    w.writingx=s.initwritingx-(s.balloonwidth+20);w.writingy=s.initwritingy-s.balloonheight/2;
    s.writingx=s.initwritingx-(s.balloonwidth+20);s.writingy=s.initwritingy-s.balloonheight/2;
   }
   if(s.side===-1){
    s.xoffset=20;w.writingx=s.initwritingx;w.writingy=s.initwritingy-s.balloonheight/2;
    s.writingx=s.initwritingx;s.writingy=s.initwritingy-s.balloonheight/2;
   }
  }
  if(s.auto_length===0)rt.drawSelf(s);
  if(s.auto_length===1&&s.init===1){
   s.blconscale=s.balloonheight<40?0.5:1;
   if(s.side===1)rt.drawSprite('spr_battleblcon_parts',4,s.x,s.y,1,s.blconscale,0,C.white,1);
   if(s.side===-1)rt.drawSprite('spr_battleblcon_parts',4,s.x-s.xoffset,s.y,-1,s.blconscale,0,C.white,1);
   rt.drawState.color=C.white;
   rt.drawRect(s.writingx-10,s.writingy-5,s.writingx+s.balloonwidth,s.writingy+s.balloonheight-5,false);
   rt.drawRect(s.writingx-5,s.writingy-10,s.writingx+s.balloonwidth-5,s.writingy+s.balloonheight,false);
  }
  s.remmsgno=w.msgno;
 },
}};
const BALLOONS2:Record<number,[string,number,boolean?]|null>={0:null,1:['spr_battleblcon',-1],2:['spr_battleblcon_v',-1],3:['spr_battleblcon_long',-1],
 4:['spr_battleblcon_clubs',0],5:['spr_battleblcon_clubs',1],6:['spr_battleblcon_clubs',2],7:['spr_battleblcon_long_r',2],8:['spr_battleblcon_long_tall',-1],10:['spr_battleblcon_long',-1,true]};
/** scr_enemyblcon (Chapter 2): kind 0 is a bare writer; kind 10 is the long balloon that sizes itself to its text. */
export function enemyBlcon2(s:GmInstance,rt:GmRuntime,x:number,y:number,kind:number):GmInstance|undefined{
 const b=BALLOONS2[kind];
 if(b===undefined)return undefined;
 if(b===null){const w=rt.create(writer,x,y);s.mywriter=w.id;return w;}
 const bl=rt.create(battleBalloon2,x,y);s.myblcon=bl.id;
 if(b[0]!=='spr_battleblcon')bl.sprite=b[0];
 if(b[1]>=0){bl.imageIndex=b[1];bl.imageSpeed=0;}
 if(b[2])bl.auto_length=1;
 return bl;
}

/** obj_growtangle (Chapter 2): the battle box. A box of another size than the standard one gets its own sprite,
 * stretched from spr_battlebg_stretch on a surface, so its border keeps its width; the afterimages of its growth
 * use that sprite, and obj_battle_cleanup deletes it once they are gone. */
export const growtangle2:GmObjectDef={name:'obj_growtangle',index:877,depth:5,parent:battleSolid,sprite:'spr_battlebg_0',mask:'spr_battlebg_0',events:{
 create:s=>{
  Object.assign(s,{imageXscale:0,imageYscale:0,imageAlpha:0.3,timer:0,maxtimer:15,growcon:1,imageSpeed:0,imageBlend:mergeColor(C.green,C.lime,0.5),target_angle:0,
   fullgrow:0,keep:0,megakeep:0,maxxscale:2,maxyscale:2,customBox:false,init:0});
  s.spr_custom_box=s.sprite;
 },
 step:(s,rt)=>{
  if(!s.init){
   if(s.visible&&(s.maxxscale!==2||s.maxyscale!==2)&&s.sprite==='spr_battlebg_0'){
    s.customBox=true;
    if(s.maxxscale%1!==0)s.maxxscale=round(s.maxxscale*37.5)/37.5;
    if(s.maxyscale%1!==0)s.maxyscale=round(s.maxyscale*37.5)/37.5;
    const tx=s.maxxscale/2,ty=s.maxyscale/2,surfaces=rt.sourceSurfaces!;
    const surf=surfaces.create(75*tx,75*ty);surfaces.target(surf);surfaces.clear(C.black,0);
    rt.drawSprite('spr_battlebg_stretch',0,37*tx,37*ty,tx,ty,0,C.white,1);
    s.spr_custom_box=surfaces.capture(surf,0,0,75*tx,75*ty,round(37.5*tx),round(37.5*ty));
    s.sprite='spr_battlebg_stretch_hitbox';
    surfaces.target(null);surfaces.free(surf);
   }
   s.init=1;
  }
  s.growth=0;
  if(s.timer<s.maxtimer&&s.growcon===1)s.growth=1;
  if(s.timer>0&&s.growcon===3)s.growth=1;
  if(s.growth!==1)return;
  if(s.growcon===1)s.timer+=1;
  if(s.growcon===3)s.timer-=1;
  const k=s.timer/s.maxtimer;
  s.imageXscale=s.maxxscale*k;s.imageYscale=s.maxyscale*k;s.imageAngle=180+180*k+s.target_angle;s.imageAlpha=0.5+k*0.5;
  if(s.visible){
   const d=rt.create(afterimage,s.x,s.y);s.d=d.id;
   d.sprite=s.spr_custom_box;d.imageXscale=s.imageXscale/(s.maxxscale/2);d.imageYscale=s.imageYscale/(s.maxyscale/2);d.imageAngle=s.imageAngle;d.depth=s.depth-1;
   d.imageBlend=s.imageBlend;d.imageAlpha=1-s.imageAlpha+0.1;d.imageSpeed=0;
  }
  if(s.timer>=s.maxtimer&&s.growcon===1){s.growcon=2;s.imageAngle=s.target_angle;}
  if(s.timer<=0&&s.growcon===3)rt.destroy(s);
 },
 draw:(s,rt)=>{
  rt.drawSprite(s.sprite,1,s.x,s.y,s.imageXscale,s.imageYscale,s.imageAngle,s.imageBlend,s.imageAlpha);
  if(s.customBox&&s.growth&&s.growcon!==2)rt.drawSprite(s.spr_custom_box,0,s.x,s.y,s.imageXscale/(s.maxxscale/2),s.imageYscale/(s.maxyscale/2),s.imageAngle,s.imageBlend,s.imageAlpha);
  else rt.drawSelf(s);
 },
 endStep:(s,rt)=>{
  if(s.keep!==1)return;
  const h=rt.first(heart);if(!h)return;
  if(s.speed===0&&s.megakeep!==1)return;
  const w=rt.spriteWidth(s),ht=rt.spriteHeight(s);
  const l=s.x-w/2,r=s.x+w/2,u=s.y-ht/2,d=s.y+ht/2;
  if(h.x<l+5)h.x=l+5;
  if(h.x>r-22)h.x=r-22;
  if(h.y<u+5)h.y=u+5;
  if(h.y>d-22)h.y=d-22;
 },
 // CleanUp: the custom box sprite outlives the box until its afterimages fade.
 destroy:(s,rt)=>{if(s.customBox){const d=rt.create(battleCleanup,s.x,s.y);d.custom_box_sprite=s.spr_custom_box;}},
}};
/** obj_battle_cleanup: deletes the custom box sprite when no afterimage uses it any more (or after a second). */
export const battleCleanup:GmObjectDef={name:'obj_battle_cleanup',index:58,visible:false,events:{
 create:s=>{s.custom_box_sprite=0;s.alarm[0]=30;},
 alarm0:(s,rt)=>{deleteSprite(rt,s.custom_box_sprite);rt.destroy(s);},
 step:(s,rt)=>{if(!rt.exists(afterimage)){deleteSprite(rt,s.custom_box_sprite);rt.destroy(s);}},
}};
function deleteSprite(rt:GmRuntime,name:unknown){if(typeof name==='string'&&rt.dynamicSprites.has(name))rt.sourceSurfaces?.deleteSprite(name);}
