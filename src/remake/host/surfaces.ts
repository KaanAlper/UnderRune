import type {GmRuntime} from '../gm/runtime';
/** Source-created surfaces and their captured sprites. Headless runs retain the
 * same resource geometry; canvas runs also execute every drawing operation. */
export function installSourceSurfaces(rt:GmRuntime){
 const surfaces=new Map<number,{width:number;height:number}>();let next=1;
 // sprite_create_from_surface names a new sprite "__newsprite<index>": the first deleted slot after the game's own
 // sprites, or a new one at the end (the runner reuses freed slots, keeping their names).
 const base=[...(rt.bank.names?.()??[])].length,slots:boolean[]=[];
 const size=(v:number)=>{if(!Number.isFinite(v)||v<1||v>4096)throw Error('Invalid source surface size');return Math.ceil(v);};
 rt.sourceSurfaces={
  create:(width,height)=>{const id=next++,w=size(width),h=size(height);surfaces.set(id,{width:w,height:h});rt.gfx?.surfaceCreate?.(id,w,h);return id;},
  target:id=>{if(id!==null&&!surfaces.has(id))throw Error('Missing source surface');if(rt.gfx&&!rt.gfx.surfaceTarget)throw Error('Renderer lacks source surfaces');rt.gfx?.surfaceTarget?.(id);},
  clear:(color,alpha)=>rt.gfx?.surfaceClear?.(color,alpha),
  capture:(id,left,top,width,height,originX,originY)=>{
   if(!surfaces.has(id))throw Error('Missing source sprite surface');
   let slot=slots.indexOf(false);if(slot<0)slot=slots.length;slots[slot]=true;
   const name=`__newsprite${base+slot}`,w=size(width),h=size(height);
   rt.dynamicSprites.set(name,{name,width:w,height:h,originX,originY,bboxMode:1,left:0,right:w-1,top:0,bottom:h-1,sepMasks:0,frames:1,special:false,playbackSpeed:1,playbackType:1});
   rt.gfx?.surfaceSprite?.(id,name,left,top,w,h,originX,originY);return name;
  },
  free:id=>{surfaces.delete(id);rt.gfx?.surfaceFree?.(id);},
  deleteSprite:name=>{const m=/^__newsprite(\d+)$/.exec(name);if(m)slots[Number(m[1])-base]=false;rt.dynamicSprites.delete(name);rt.gfx?.spriteDelete?.(name);},
 };
}
