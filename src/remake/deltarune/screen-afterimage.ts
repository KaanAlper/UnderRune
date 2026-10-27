import type {GmObjectDef,GmInstance,GmRuntime} from '../gm/runtime';
import {C} from '../gm/graphics';
import {eq} from '../gm/math';
import {approach} from './chapter3-scripts';
/** Identical Chapter 3/4 source events: capture, grow, fade, free, and optional end-of-frame soul redraw. */
export function createScreenAfterimage(object:(name:string)=>GmObjectDef):GmObjectDef{
 const copy=(s:GmInstance,rt:GmRuntime)=>{const surfaces=rt.sourceSurfaces!;if(!surfaces.exists(s.my_surface))s.my_surface=surfaces.create(rt.view.width,rt.view.height);surfaces.copy(s.my_surface,0,0,null);surfaces.part(s.my_surface,0,0,rt.view.width,rt.view.height,s.x-s.anchor_x*s.xscale,s.y-s.anchor_y*s.yscale,s.xscale,s.yscale,C.white,s.alpha);};
 return {...object('obj_afterimage_screen'),events:{
  create:(s,rt)=>{Object.assign(s,{my_surface:-4,xscale:1,yscale:1,alpha:.5,anchor_x:s.x-rt.view.x,anchor_y:s.y-rt.view.y,xrate:.01,yrate:.01,faderate:.00625,draw_end:0});},
  cleanup:(s,rt)=>{if(rt.sourceSurfaces?.exists(s.my_surface))rt.sourceSurfaces.free(s.my_surface);},
  step:(s,rt)=>{s.xscale+=s.xrate;s.yscale+=s.yrate;s.alpha=approach(s.alpha,0,s.faderate);if(eq(s.alpha,0))rt.destroy(s);},
  draw:(s,rt)=>{if(!s.draw_end)copy(s,rt);},
  endDraw:(s,rt)=>{if(!s.draw_end)return;copy(s,rt);for(const h of rt.all(object('obj_heart')))rt.drawSelf(h);},
 }};
}
