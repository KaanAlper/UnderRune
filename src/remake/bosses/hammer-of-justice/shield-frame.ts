import type {GmInstance,GmRuntime} from '../../gm/runtime';
import {eq,gt,lt,lerp} from '../../gm/math';
import {C} from '../../gm/graphics';
/** User 2 is called again by flash overlays; its timers and RNG advance on each call, as in the source. */
export function shieldFrame(s:GmInstance,rt:GmRuntime,fog?:number){
 if(s.diagonal_enabled&&lt(s.transformtimer,10))s.transformtimer++;
 const side=lerp(28,33,s.transformtimer/10),progress=lerp(0,17,s.transformtimer/10);let x=0,y=0;
 if(gt(s.shake,0)){x=-10+rt.random.random(20);y=-10+rt.random.random(20);}x+=s.x;y+=s.y;
 const color=rt.drawState.color;if(fog!==undefined)rt.drawState.color=fog;
 const edges=[[x+side,y-side+progress,x+side,y+side-progress],[x-side+progress,y-side,x+side-progress,y-side],[x-side,y-side+progress,x-side,y+side-progress],[x-side+progress,y+side,x+side-progress,y+side]];
 for(const [a,b,c,d] of edges)rt.drawLine(a,b,c,d);
 if(eq(s.diagonal_enabled,1)){
  const corners=[[x+side,y-side+progress,x+side-progress,y-side],[x-side,y-side+progress,x-side+progress,y-side],[x-side,y+side-progress,x-side+progress,y+side],[x+side-progress,y+side,x+side,y+side-progress]];
  for(const [a,b,c,d] of corners)rt.drawLine(a,b,c,d);
  if(gt(s.transformflashtimer,0)){s.transformflashtimer--;rt.drawState.alpha=0;rt.drawState.color=C.white;for(const [a,b,c,d] of corners)rt.drawLine(a,b,c,d);rt.drawState.alpha=0;}
 }
 rt.drawState.color=color;
}
