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
  deleteSprite:name=>rt.deleteSprite(name),
 };
}
