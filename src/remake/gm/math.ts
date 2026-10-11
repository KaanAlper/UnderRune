// GameMaker math builtins as the Butterscotch runtime computes them (vm_builtins.c, utils.h; AGPL-3.0).
export const f32=Math.fround;
const RAD=Math.PI/180;
/** utils.h clampFloat: truncate to 6 decimals (int64 cast). */
export const clamp6=(v:number)=>Math.trunc(v*1e6)/1e6;
export function lengthdirX(len:number,dir:number){const r=len*Math.cos(dir*RAD);return Math.abs(r)<1e-4?0:r;}
export function lengthdirY(len:number,dir:number){const r=-len*Math.sin(dir*RAD);return Math.abs(r)<1e-4?0:r;}
/** Round half to even, as GMLReal_bankersRound. */
export function bankersRound(v:number){const r=Math.round(v);return Math.abs(v%1)===0.5&&r%2!==0?r-1:r;}
export function pointDirection(x1:number,y1:number,x2:number,y2:number){
 const x=x2-x1,y=y2-y1;
 if(x===0)return y>0?270:y<0?90:0;
 const dd=bankersRound(180*Math.atan2(y,x)/Math.PI*1e6)/1e6;
 return dd<=0?-dd:360-dd;
}
export function pointDistance(x1:number,y1:number,x2:number,y2:number){return Math.hypot(x2-x1,y2-y1);}
