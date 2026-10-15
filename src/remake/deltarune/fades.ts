// Shared source screen fades: their opacity changes in Draw, including the source fade-out's reversible mode.
import type {GmObjectDef} from '../gm/runtime';
import {eq,le} from '../gm/math';
import {C} from '../gm/graphics';
export const fadeOut:GmObjectDef={name:'obj_fadeout',index:193,depth:-99999,sprite:'spr_pixel_white',events:{
 create:(s,rt)=>{Object.assign(s,{imageBlend:C.black,fadespeed:0.08,imageAlpha:0,length:10+rt.room.width/4,height:10+rt.room.height/4,x:-20,y:-20,fadein:0});},
 draw:(s,rt)=>{
  s.imageAlpha+=s.fadespeed;rt.drawSprite(s.sprite,s.imageIndex,s.x,s.y,s.length,s.height,0,s.imageBlend,s.imageAlpha);
  if(eq(s.fadein,1)&&le(s.imageAlpha,0))rt.destroy(s);
 },
}};
