// The Roaring Knight's battle backdrop and small effects: obj_bgfountaintest (the Dark Fountain behind him, its
// colour and flow quickening as his HP falls), obj_block_vfx (sparks of his block) and obj_afterimage_fade_to_white
// (the afterimages of his charge).
import type {GmObjectDef,GmRuntime} from '../../gm/runtime';
import {C,makeColorHsv,mergeColor} from '../../gm/graphics';
import {eq,ge,gt} from '../../gm/math';
import {shake} from '../../deltarune/battle';
import {findController} from '../../deltarune/controller';
import {scrDoom,scrLerpvar} from '../../deltarune/shared-effects';

/** The fountain's dark blue (#27293F). */
const NIGHT=0x3f2927;
export function createFountain(object:(name:string)=>GmObjectDef):GmObjectDef{
 const knight=(rt:GmRuntime)=>rt.first(object('obj_knight_enemy'));
 return {...object('obj_bgfountaintest'),events:{
  create:(s,rt)=>{Object.assign(s,{siner:0,imageBlend:NIGHT,battleprog:0,alphafactor:0,depth:50000,oceanspeed:1,death:0});scrLerpvar(s,rt,'alphafactor',0,1,120);},
  draw:(s,rt)=>{
   const g=rt.globals,cx=rt.view.x,cy=rt.view.y;s.depth=150000;s.siner++;
   let shakex=0,shakey=0;const sh=rt.first(shake);if(sh){shakex=sh.shakex*sh.shakesign;shakey=sh.shakey*sh.shakesign;}
   const k=knight(rt);
   if(k)s.battleprog=1-(g.monsterhp[k.myself]-g.monstermaxhp[k.myself]*0.8)/g.monstermaxhp[k.myself]*5;
   s.oceanspeed=1;if(gt(s.battleprog,0.65))s.oceanspeed=2;
   s.desicolor=makeColorHsv(127.5+Math.sin(s.siner/90)*255/2,255,255);const a=s.alphafactor,flow=s.siner*s.oceanspeed;
   rt.drawSpriteTiled('spr_bg_fountain1',shakex+cx-flow,shakey+cy+flow,2,2,C.purple,0.5*a*(s.battleprog+0.3));
   rt.drawSpriteTiled('spr_bg_fountain1',shakex+cx-flow/2,shakey+cy-flow/2,2,2,C.purple,0.35*a*(s.battleprog+0.2));
   if(k)rt.drawSprite('spr_bg_knight_gradient',0,shakex+cx+rt.view.width+640,shakey+cy+90,-2,2,0,C.black,a);
   rt.drawSprite('spr_bg_knight_gradient',0,shakex+cx,shakey+cy+90,2,2.05,0,C.black,a);
   rt.drawSprite('spr_pxwhite',0,shakex+cx-40,shakey+cy,720,90,0,C.black,1);
   s.imageBlend=mergeColor(NIGHT,s.desicolor,s.battleprog/2);
   rt.drawSprite('spr_pxwhite',0,shakex+cx+138+50,shakey+cy,240,90,0,mergeColor(s.imageBlend,C.black,0.8),a);
   for(let i=1;i<3;i++){
    rt.drawSprite('spr_cc_fountainbg_white',s.siner/10,shakex+cx+138-Math.sin(s.siner/20)*(i*12),shakey+cy,2,2,0,s.imageBlend,i/12*a);
    rt.drawSprite('spr_cc_fountainbg_white',s.siner/10,shakex+cx+138+Math.sin(s.siner/13)*(i*6),shakey+cy,2,2,0,s.imageBlend,i/12*a);
   }
   rt.drawSprite('spr_cc_fountainbg_white',s.siner/10,shakex+cx+138,shakey+cy,2,2,0,s.imageBlend,1);
   if(k)rt.drawSprite('spr_pxwhite',0,shakex+cx-40,shakey+cy,40,480,0,C.black,1);
   if(k)rt.drawSprite('spr_pxwhite',0,shakex+cx-40,shakey+cy-20,720,20,0,C.black,1);
   if(s.death===0&&!findController(rt)){s.death=1;scrLerpvar(s,rt,'alphafactor',s.alphafactor,0,30);scrDoom(rt,s.id,31);}
  },
 }};
}
/** obj_block_vfx: a spark that slows down, steps behind its sprite's second frame, and ends with its animation. */
export function createBlockVfx(object:(name:string)=>GmObjectDef):GmObjectDef{
 return {...object('obj_block_vfx'),events:{
  create:(s,rt)=>{s.x+=-6+rt.random.random(12);s.y+=-6+rt.random.random(12);s.imageIndex=0;},
  step:s=>{
   if(s.vspeed<0)s.vspeed+=0.4;if(s.vspeed>0)s.vspeed-=0.4;
   if(eq(s.imageIndex,2))s.depth+=1;
   if(eq(s.imageIndex,1)){s.imageXscale=1;s.imageYscale=1;}
  },
  animationEnd:(s,rt)=>rt.destroy(s),
 }};
}
/** obj_afterimage_fade_to_white: the sprite turns white, then fades out. */
export function createFadeToWhite(object:(name:string)=>GmObjectDef):GmObjectDef{
 return {...object('obj_afterimage_fade_to_white'),events:{
  create:s=>{s.fadeSpeed=0.13;s.con=0;s.whitealpha=0;},
  step:()=>{},
  draw:(s,rt)=>{
   rt.drawSelf(s);
   if(s.con===0)s.whitealpha+=s.fadeSpeed;
   if(ge(s.whitealpha,1)){s.con=1;s.whitealpha=1;s.imageAlpha=0;}
   if(s.con===1){s.whitealpha-=s.fadeSpeed;if(s.whitealpha<0)rt.destroy(s);}
   rt.drawSpriteFog(s.sprite!,s.imageIndex,s.x,s.y,s.imageXscale,s.imageYscale,s.imageAngle,C.white,s.whitealpha);
  },
 }};
}
