// Effects the Knight's slashing attacks share (the rotating slash and the roar): obj_particle_generic (marks and
// sparks), obj_roaringknight_slash (one cut across the box), obj_knight_circle (a spreading ring) and
// obj_afterimage_screen (a growing, fading copy of the screen).
import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {C} from '../../gm/graphics';
import {eq,lengthdirX,lengthdirY,lt} from '../../gm/math';
import {bulletInit,damage,damageAll,growtangle,heart} from '../../deltarune/battle';
import {approach,getBox,heartClamp,makeColorRgb} from '../../deltarune/chapter3-scripts';

export type SlashEffects=ReturnType<typeof createSlashEffects>;
export function createSlashEffects(object:(name:string)=>GmObjectDef){
 const box=(rt:GmRuntime)=>{const b=rt.first(growtangle);if(!b)throw Error("The Knight's slash effects need obj_growtangle");return b;};
 /** obj_particle_generic: fades and shrinks at its rates, ends at zero, at its timer, at alarm 0, or out of view. */
 const particle:GmObjectDef={...object('obj_particle_generic'),events:{
  create:s=>{s.fade_rate=0;s.shrink_rate=0;s.timer=-1;},
  step:(s,rt)=>{
   s.imageAlpha=approach(s.imageAlpha,0,s.fade_rate);s.imageXscale=approach(s.imageXscale,0,s.shrink_rate);s.imageYscale=approach(s.imageYscale,0,s.shrink_rate);
   if(eq(s.imageXscale,0)||eq(s.imageYscale,0))rt.destroy(s);
   if(eq(s.imageAlpha,0))rt.destroy(s);
   s.timer--;if(s.timer===0)rt.destroy(s);
  },
  alarm0:(s,rt)=>rt.destroy(s),
  outsideView0:(s,rt)=>rt.destroy(s),
 }};

 /** obj_roaringknight_slash: a cut that thins out after its first frame; it hits for 75 on everyone. */
 const slash:GmObjectDef={...object('obj_roaringknight_slash'),events:{
  create:(s,rt)=>{
   bulletInit(s);
   Object.assign(s,{active:1,element:5,width:24,grazepoints:50,aoe:1});s.alarm[0]=1;s.alarm[1]=3;
   s.imageIndex=2;s.imageSpeed=0;s.imageYscale=0.1;s.slashdir=rt.random.choose(-1,1);s.destroyonhit=0;
  },
  alarm0:()=>{},
  alarm1:s=>{s.mask='spr_nomask';},
  endStep:(s,rt)=>{
   s.damage=206;s.grazepoints=50;
   // !alarm[0]: the alarm has run (it is -1 now).
   if(!(s.alarm[0]>0.5)){s.width*=0.66;s.imageAlpha*=0.66;}
   if(s.width<12)s.active=0;
   if(s.width<0.5)rt.destroy(s);
   if(s.width>4){
    for(const b of rt.all(growtangle)){b.x=b.xstart+rt.random.choose(-2,-1,0,1,2);b.y=b.ystart+rt.random.choose(-2,-1,0,1,2);}
    heartClamp(rt);
   }
  },
  draw:(s,rt)=>{
   const hx=lengthdirX(640,s.direction),hy=lengthdirY(640,s.direction),ox=lengthdirX(s.width,s.direction+90),oy=lengthdirY(s.width,s.direction+90);
   const color=makeColorRgb(255,(1-s.imageAlpha)*255,(1-s.imageAlpha)*255),d=rt.drawState;d.alpha=s.imageAlpha*2;
   if(s.slashdir)rt.drawTriangleColor(s.x-hx*s.imageAlpha,s.y-hy*s.imageAlpha,s.x+hx+ox,s.y+hy+oy,s.x+hx-ox,s.y+hy-oy,color,color,color);
   else rt.drawTriangleColor(s.x+hx*s.imageAlpha,s.y+hy*s.imageAlpha,s.x-hx+ox,s.y-hy+oy,s.x-hx-ox,s.y-hy-oy,color,color,color);
   d.alpha=1;
  },
  user5:(s,rt)=>{
   s.damage=206;
   if(s.aoe===1){s.damage=75;s.target=3;for(const k of rt.all(object('obj_knight_enemy')))k.aoedamage=1;}
   if(s.active===1){if(s.target!==3)damage(s,rt);if(s.target===3)damageAll(s,rt);if(s.destroyonhit===1)rt.destroy(s);}
   for(const k of rt.all(object('obj_knight_enemy')))k.aoedamage=0;
  },
 }};

 /** obj_knight_circle: a red ring that spreads from the aim point inside the box and fades in ten frames. */
 const circle:GmObjectDef={...object('obj_knight_circle'),events:{
  create:s=>{Object.assign(s,{circle_size:0,r:128,g:0,b:0,r_goal:0,g_goal:0,b_goal:0,fade_time:28,size_goal:960,growth:40,my_surface:-4,color_1:0,color_2:255,draw_in_box:1});},
  cleanup:(s,rt)=>{if(rt.sourceSurfaces?.exists(s.my_surface))rt.sourceSurfaces.free(s.my_surface);},
  step:(s,rt)=>{
   if(!rt.exists(object('obj_knight_roaring_fx')))s.imageAlpha-=0.1;
   if(lt(s.imageAlpha,0))rt.destroy(s);
   s.g=approach(s.g,s.g_goal,255/s.fade_time);s.b=approach(s.b,s.b_goal,255/s.fade_time);s.circle_size=approach(s.circle_size,s.size_goal,s.growth);
   if(eq(s.r,0)&&eq(s.b,0)&&eq(s.b,0))rt.destroy(s);
  },
  draw:(s,rt)=>{
   const surfaces=rt.sourceSurfaces!;
   if(s.draw_in_box){
    const b=box(rt);
    if(!surfaces.exists(s.my_surface))s.my_surface=surfaces.create(75*b.imageXscale,75*b.imageYscale);
    surfaces.target(s.my_surface);s.color_2=makeColorRgb(s.r,s.g,s.b);
    rt.drawCircleColor(s.x-getBox(rt,2),s.y-getBox(rt,1),s.circle_size,s.color_1,s.color_2);
    surfaces.target(null);rt.drawBlendMode('add');surfaces.draw(s.my_surface,getBox(rt,2),getBox(rt,1));rt.drawBlendMode('normal');
   }else{
    s.color_2=makeColorRgb(s.r,s.g,s.b);rt.drawBlendMode('add');rt.drawState.alpha=s.imageAlpha;
    rt.drawCircleColor(s.x,s.y,s.circle_size,s.color_1,s.color_2);rt.drawBlendMode('normal');
   }
  },
 }};

 /** obj_afterimage_screen: a growing, fading copy of the screen (drawn at the end of the frame when draw_end). */
 const screenCopy=(s:GmInstance,rt:GmRuntime)=>{
  const surfaces=rt.sourceSurfaces!;
  if(!surfaces.exists(s.my_surface))s.my_surface=surfaces.create(640,480);
  surfaces.copy(s.my_surface,0,0,null);
  surfaces.part(s.my_surface,0,0,640,480,s.x-s.anchor_x*s.xscale,s.y-s.anchor_y*s.yscale,s.xscale,s.yscale,C.white,s.alpha);
 };
 const afterimageScreen:GmObjectDef={...object('obj_afterimage_screen'),events:{
  create:(s,rt)=>{Object.assign(s,{my_surface:-4,xscale:1,yscale:1,alpha:0.5,anchor_x:s.x-rt.view.x,anchor_y:s.y-rt.view.y,xrate:0.01,yrate:0.01,faderate:0.00625,draw_end:0});},
  cleanup:(s,rt)=>{if(rt.sourceSurfaces?.exists(s.my_surface))rt.sourceSurfaces.free(s.my_surface);},
  step:(s,rt)=>{s.xscale+=s.xrate;s.yscale+=s.yrate;s.alpha=approach(s.alpha,0,s.faderate);if(eq(s.alpha,0))rt.destroy(s);},
  draw:(s,rt)=>{if(!s.draw_end)screenCopy(s,rt);},
  endDraw:(s,rt)=>{if(!s.draw_end)return;screenCopy(s,rt);for(const h of rt.all(heart))rt.drawSelf(h);},
 }};

 return {particle,slash,circle,afterimageScreen,objects:[particle,slash,circle,afterimageScreen]};
}
