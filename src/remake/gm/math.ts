// GameMaker math builtins as the Butterscotch runtime computes them (vm_builtins.c, utils.h; AGPL-3.0).
export const f32=Math.fround;
const RAD=Math.PI/180;
/** utils.h clampFloat: truncate to 6 decimals (int64 cast). */
export const clamp6=(v:number)=>Math.trunc(v*1e6)/1e6;
export function lengthdirX(len:number,dir:number){const r=len*Math.cos(dir*RAD);return Math.abs(r)<1e-4?0:r;}
export function lengthdirY(len:number,dir:number){const r=-len*Math.sin(dir*RAD);return Math.abs(r)<1e-4?0:r;}
/** Round half to even, as GMLReal_bankersRound. */
export function bankersRound(v:number){
 if(!Number.isFinite(v))return v;
 const lower=Math.floor(v),fraction=v-lower;
 if(fraction<.5)return lower;if(fraction>.5)return lower+1;
 return lower%2===0?lower:lower+1;
}
export function pointDirection(x1:number,y1:number,x2:number,y2:number){
 const x=x2-x1,y=y2-y1;
 if(x===0)return y>0?270:y<0?90:0;
 const dd=bankersRound(180*Math.atan2(y,x)/Math.PI*1e6)/1e6;
 return dd<=0?-dd:360-dd;
}
export function pointDistance(x1:number,y1:number,x2:number,y2:number){const dx=x2-x1,dy=y2-y1;return Math.sqrt(dx*dx+dy*dy);}
/** GML compares numbers with a tolerance: values within 1e-5 count as equal (vm.c OP_CMP), so 6e-8 > 0 is false. */
export const EPS=1e-5;
export const cmp=(a:number,b:number)=>{const d=a-b;return Math.abs(d)<=EPS?0:d<0?-1:1;};
export const lt=(a:number,b:number)=>cmp(a,b)<0;
export const le=(a:number,b:number)=>cmp(a,b)<=0;
export const gt=(a:number,b:number)=>cmp(a,b)>0;
export const ge=(a:number,b:number)=>cmp(a,b)>=0;
export const eq=(a:number,b:number)=>cmp(a,b)===0;
/** GML round(): halves go to the even neighbour. */
export const round=bankersRound;
