// Chapter 2's versions of shared battle objects where they differ from Chapter 1's: the speech balloon (which can
// size itself to its text), the scr_enemyblcon that makes it, and the battle box. Chapter 3's changes to them are in
// the BALLOON and GROWTANGLE tables.
import type {GmInstance,GmObjectDef,GmRuntime} from '../gm/runtime';
import {C} from '../gm/graphics';
import {writer} from './writer';
import {afterimage,battleSolid,heart} from './battle';
import {round} from '../gm/math';
import {mergeColor} from './chapter2-battle';
import {forChapter} from './rules';

/** A scr_enemyblcon kind: the balloon's sprite, its fixed frame (-1 animates), whether it sizes itself to its text
 * (auto_length), and its side. null is a bare writer. */
type Balloon=readonly [sprite:string,frame:number,auto?:boolean,side?:number];
interface BalloonRules{
 /** Where the writer starts below the balloon's corner. */
 readonly writerY:number;readonly fourth?:boolean;
 /** A self-sizing balloon has its writer lay out the text at once (the writer's User 5), so it fits from the first frame. */
 readonly formatNow:boolean;
 readonly kinds:Readonly<Record<number,Balloon|null>>;
}
const KINDS2:Readonly<Record<number,Balloon|null>>={0:null,1:['spr_battleblcon',-1],2:['spr_battleblcon_v',-1],3:['spr_battleblcon_long',-1],
 4:['spr_battleblcon_clubs',0],5:['spr_battleblcon_clubs',1],6:['spr_battleblcon_clubs',2],7:['spr_battleblcon_long_r',2],8:['spr_battleblcon_long_tall',-1],10:['spr_battleblcon_long',-1,true]};
/** Chapter 3: kinds 4 and 5 are the long balloon, and 11-14 are new (13 sits above its speaker, 14 points right). */
const KINDS3:Readonly<Record<number,Balloon|null>>={...KINDS2,4:['spr_battleblcon_long',0],5:['spr_battleblcon_long',1],
 11:['spr_battleblcon_v2_left',-1],12:['spr_battleblcon_v2_right',-1],12.1:['spr_battleblcon_v2_right2',-1],12.2:['spr_battleblcon_v2_right3',-1],
 12.3:['spr_battleblcon_v2_right4',-1],12.4:['spr_battleblcon_v2_right5',-1],13:['spr_battleblcon_long',-1,true,2],14:['spr_battleblcon_long',-1,true,-1]};
const BALLOON:Readonly<Record<number,BalloonRules>>={2:{writerY:5,formatNow:false,kinds:KINDS2},3:{writerY:3,formatNow:true,kinds:KINDS3},4:{writerY:3,formatNow:true,fourth:true,kinds:{...KINDS2,4:['spr_battleblcon_long',0],5:['spr_battleblcon_long',1],11:['spr_battleblcon_z',-1]}}};
const balloon=(rt:GmRuntime)=>forChapter(rt,BALLOON,'obj_battleblcon');

/** obj_battleblcon (Chapter 2 on): a balloon with a writer inside; with auto_length it is drawn around the text. */
export const battleBalloon2:GmObjectDef={name:'obj_battleblcon',index:875,sprite:'spr_battleblcon',events:{
 create:(s,rt)=>{
  const w=rt.create(writer,s.x+5,s.y+balloon(rt).writerY);w.depth=9999999;s.mywriter=w.id;
  Object.assign(s,{auto_length:0,side:1,xoffset:0,init:0,reformatted:0,remx:s.x,remy:s.y,remmsgno:-1,initwritingx:-1,initwritingy:-1});
  if(balloon(rt).fourth)s.creator=-1;
 },
 step:(s,rt)=>{if(!rt.byId(s.mywriter))rt.destroy(s);},
 draw:(s,rt)=>{
  const w=rt.byId(s.mywriter);if(!w)return;
  w.depth=s.depth-5;
  if(s.remmsgno!==rt.first(writer)!.msgno)s.reformatted=0;
  if(s.auto_length===0){s.init=1;s.reformatted=1;}
  if(s.reformatted===0&&balloon(rt).formatNow&&w.formatted===0)rt.userEvent(w,5);
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
   // Above the speaker (only Chapter 3's kind 13 makes one).
   if(s.side===2&&!balloon(rt).fourth){
    w.writingx=s.initwritingx-s.balloonwidth/2;w.writingy=s.initwritingy-(s.balloonheight+20);
    s.writingx=s.initwritingx-s.balloonwidth/2;s.writingy=s.initwritingy-(s.balloonheight+20);
   }
  }
  if(s.auto_length===0)rt.drawSelf(s);
  if(s.auto_length===1&&s.init===1){
   s.blconscale=s.balloonheight<40?0.5:1;
   if(s.side===1)rt.drawSprite('spr_battleblcon_parts',4,s.x,s.y,1,s.blconscale,0,C.white,1);
   if(s.side===-1)rt.drawSprite('spr_battleblcon_parts',4,s.x-s.xoffset,s.y,-1,s.blconscale,0,C.white,1);
   if(s.side===2){if(balloon(rt).fourth)rt.drawSprite('spr_battleblcon_parts',6,s.writingx-6+s.balloonwidth/2,s.writingy+s.balloonheight+6,1,s.blconscale,0,C.white,1);else rt.drawSprite('spr_battleblcon_parts',4,s.x,s.y,1,1,-90,C.white,1);}
   rt.drawState.color=C.white;
   rt.drawRect(s.writingx-10,s.writingy-5,s.writingx+s.balloonwidth,s.writingy+s.balloonheight-5,false);
   rt.drawRect(s.writingx-5,s.writingy-10,s.writingx+s.balloonwidth-5,s.writingy+s.balloonheight,false);
  }
  s.remmsgno=w.msgno;
 },
}};
/** scr_enemyblcon (Chapter 2 on): kind 0 is a bare writer; kind 10 is the long balloon that sizes itself to its text. */
export function enemyBlcon2(s:GmInstance,rt:GmRuntime,x:number,y:number,kind:number):GmInstance|undefined{
 const b=balloon(rt).kinds[kind];
 if(b===undefined)return undefined;
 if(b===null){const w=rt.create(writer,x,y);s.mywriter=w.id;return w;}
 const bl=rt.create(battleBalloon2,x,y);s.myblcon=bl.id;
 if(b[0]!=='spr_battleblcon')bl.sprite=b[0];
 if(b[1]>=0){bl.imageIndex=b[1];bl.imageSpeed=0;}
 if(b[2])bl.auto_length=1;
 if(b[3]!==undefined)bl.side=b[3];
 return bl;
}

/** obj_growtangle (Chapter 2): the battle box. A box of another size than the standard one gets its own sprite,
 * stretched from spr_battlebg_stretch on a surface, so its border keeps its width; the afterimages of its growth
 * use that sprite, and obj_battle_cleanup deletes it once they are gone. */
/** obj_growtangle's custom box per chapter. Chapter 2 builds it from 75-pixel units and draws it at the growth scale
 * relative to the full size; Chapter 3 builds it at the size of its stretched hitbox sprite, rounds only odd sizes,
 * and scales it by the growth fraction (sizer) times growscale. */
interface BoxRules{readonly sizer:boolean;}
const GROWTANGLE:Readonly<Record<number,BoxRules>>={2:{sizer:false},3:{sizer:true},4:{sizer:true}};
/** The custom box's drawing scale while it grows. */
const boxScale=(s:GmInstance,rt:GmRuntime):[number,number]=>forChapter(rt,GROWTANGLE,'obj_growtangle').sizer?[s.sizer*s.growscale,s.sizer*s.growscale]:[s.imageXscale/(s.maxxscale/2),s.imageYscale/(s.maxyscale/2)];
export const growtangle2:GmObjectDef={name:'obj_growtangle',index:877,depth:5,parent:battleSolid,sprite:'spr_battlebg_0',mask:'spr_battlebg_0',events:{
 create:(s,rt)=>{
  Object.assign(s,{imageXscale:0,imageYscale:0,imageAlpha:0.3,timer:0,maxtimer:15,growcon:1,imageSpeed:0,imageBlend:mergeColor(C.green,C.lime,0.5),target_angle:0,
   fullgrow:0,keep:0,megakeep:0,maxxscale:2,maxyscale:2,customBox:false,init:0});
  s.spr_custom_box=s.sprite;
  if(forChapter(rt,GROWTANGLE,'obj_growtangle').sizer){s.sizer=0;s.growscale=2;}
 },
 step:(s,rt)=>{
  if(!s.init){
   if(s.visible&&(s.maxxscale!==2||s.maxyscale!==2)&&s.sprite==='spr_battlebg_0'){
    s.customBox=true;const surfaces=rt.sourceSurfaces!;
    if(forChapter(rt,GROWTANGLE,'obj_growtangle').sizer){
     s.sprite='spr_battlebg_stretch_hitbox';
     if(s.maxxscale%2!==0)s.maxxscale=round(s.maxxscale*37.5)/37.5;
     if(s.maxyscale%2!==0)s.maxyscale=round(s.maxyscale*37.5)/37.5;
     s.imageXscale=s.maxxscale/2;s.imageYscale=s.maxyscale/2;
     const w=rt.spriteWidth(s),h=rt.spriteHeight(s),spr=rt.bank.get(s.sprite)!,ox=spr.originX*s.imageXscale,oy=spr.originY*s.imageYscale;
     const surf=surfaces.create(w,h);surfaces.target(surf);surfaces.clear(C.black,0);
     rt.drawSprite('spr_battlebg_stretch',0,ox,oy,s.imageXscale,s.imageYscale,0,C.white,1);
     s.spr_custom_box=surfaces.capture(surf,0,0,w,h,ox,oy);
     surfaces.target(null);surfaces.free(surf);
    }else{
     if(s.maxxscale%1!==0)s.maxxscale=round(s.maxxscale*37.5)/37.5;
     if(s.maxyscale%1!==0)s.maxyscale=round(s.maxyscale*37.5)/37.5;
     const tx=s.maxxscale/2,ty=s.maxyscale/2;
     const surf=surfaces.create(75*tx,75*ty);surfaces.target(surf);surfaces.clear(C.black,0);
     rt.drawSprite('spr_battlebg_stretch',0,37*tx,37*ty,tx,ty,0,C.white,1);
     s.spr_custom_box=surfaces.capture(surf,0,0,75*tx,75*ty,round(37.5*tx),round(37.5*ty));
     s.sprite='spr_battlebg_stretch_hitbox';
     surfaces.target(null);surfaces.free(surf);
    }
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
  if(forChapter(rt,GROWTANGLE,'obj_growtangle').sizer)s.sizer=k;
  s.imageXscale=s.maxxscale*k;s.imageYscale=s.maxyscale*k;s.imageAngle=180+180*k+s.target_angle;s.imageAlpha=0.5+k*0.5;
  if(s.visible){
   const d=rt.create(afterimage,s.x,s.y);s.d=d.id;
   d.sprite=s.spr_custom_box;[d.imageXscale,d.imageYscale]=boxScale(s,rt);d.imageAngle=s.imageAngle;d.depth=s.depth-1;
   d.imageBlend=s.imageBlend;d.imageAlpha=1-s.imageAlpha+0.1;d.imageSpeed=0;
  }
  if(s.timer>=s.maxtimer&&s.growcon===1){s.growcon=2;s.imageAngle=s.target_angle;}
  if(s.timer<=0&&s.growcon===3)rt.destroy(s);
 },
 draw:(s,rt)=>{
  rt.drawSprite(s.sprite,1,s.x,s.y,s.imageXscale,s.imageYscale,s.imageAngle,s.imageBlend,s.imageAlpha);
  if(s.customBox&&s.growth&&s.growcon!==2)rt.drawSprite(s.spr_custom_box,0,s.x,s.y,...boxScale(s,rt),s.imageAngle,s.imageBlend,s.imageAlpha);
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
