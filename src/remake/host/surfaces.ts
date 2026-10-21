import type {GmRuntime} from '../gm/runtime';
/** Source-created surfaces and their captured sprites. Headless runs retain the
 * same resource geometry; canvas runs also execute every drawing operation. */
export function installSourceSurfaces(rt:GmRuntime){
 const surfaces=new Map<number,{width:number;height:number}>();let next=1;
 const size=(v:number)=>{if(!Number.isFinite(v)||v<1||v>4096)throw Error('Invalid source surface size');return Math.ceil(v);};
 rt.sourceSurfaces={
  create:(width,height)=>{const id=next++,w=size(width),h=size(height);surfaces.set(id,{width:w,height:h});rt.gfx?.surfaceCreate?.(id,w,h);return id;},
  target:id=>{if(id!==null&&!surfaces.has(id))throw Error('Missing source surface');if(rt.gfx&&!rt.gfx.surfaceTarget)throw Error('Renderer lacks source surfaces');rt.gfx?.surfaceTarget?.(id);},
  clear:(color,alpha)=>rt.gfx?.surfaceClear?.(color,alpha),
  capture:(id,left,top,width,height,originX,originY)=>{
   if(!surfaces.has(id))throw Error('Missing source sprite surface');
   const w=size(width),h=size(height),name=rt.newSprite(w,h,originX,originY);
   rt.gfx?.surfaceSprite?.(id,name,left,top,w,h,originX,originY);return name;
  },
  free:id=>{surfaces.delete(id);rt.gfx?.surfaceFree?.(id);},
  exists:id=>surfaces.has(id),
  resize:(id,width,height)=>{const s=surfaces.get(id);if(!s)throw Error('Missing source surface');s.width=size(width);s.height=size(height);if(rt.gfx&&!rt.gfx.surfaceResize)throw Error('Renderer cannot resize surfaces');rt.gfx?.surfaceResize?.(id,s.width,s.height);},
  draw:(id,x,y,alpha=1,blend=0xffffff)=>{if(!surfaces.has(id))throw Error('Missing source surface');if(rt.gfx&&!rt.gfx.surfaceDraw)throw Error('Renderer cannot draw surfaces');rt.gfx?.surfaceDraw?.(id,x,y,alpha,blend);},
  copy:(id,x,y,source)=>{if(!surfaces.has(id)||(source!==null&&!surfaces.has(source)))throw Error('Missing source surface');if(rt.gfx&&!rt.gfx.surfaceCopy)throw Error('Renderer cannot copy surfaces');rt.gfx?.surfaceCopy?.(id,x,y,source);},
  part:(id,left,top,width,height,x,y,xscale,yscale,blend,alpha)=>{if(!surfaces.has(id))throw Error('Missing source surface');if(rt.gfx&&!rt.gfx.surfacePart)throw Error('Renderer cannot draw surface regions');rt.gfx?.surfacePart?.(id,left,top,width,height,x,y,xscale,yscale,blend,alpha);},
  addRows:(id,offsets,blend,alpha)=>{if(!surfaces.has(id))throw Error('Missing source surface');return rt.gfx?.surfaceAddRows?.(id,offsets,blend,alpha)??false;},
  deleteSprite:name=>rt.deleteSprite(name),
 };
}
