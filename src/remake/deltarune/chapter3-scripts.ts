// Chapter 3's small general scripts, as its bullets and effects call them: number helpers (scr_movetowards,
// scr_loop_ext, scr_pingpong, remap, clamp01), angles (scr_rotatetowards, scr_angle_lerp), the box's edges (gt_*),
// bullets made by bullets (scr_childbullet), afterimages (scr_afterimage, scr_custom_afterimage), the precise soul
// hit (scr_precise_hit), beams (scr_draw_beam_color) and sprite outlines (scr_draw_outline).
import type {GmInstance,GmObjectDef,GmRuntime} from '../gm/runtime';
import {eq,gt,lt,lengthdirX,lengthdirY,lerp} from '../gm/math';
import {rectangleMeets,pointMeets} from '../gm/collision';
import {afterimage,growtangle,heart} from './battle';

/** scr_movetowards: a step of at most `step` from `from` towards `to`. */
export function moveTowards(from:number,to:number,step:number){return eq(from,to)?from:gt(from,to)?Math.max(from-step,to):Math.min(from+step,to);}
/** scr_loop_ext: `value` wrapped into [lo, hi). */
export function loopExt(value:number,lo:number,hi:number){
 const range=hi-lo;if(eq(range,0))return value;
 const amount=value-lo;let out=amount%range;if(lt(amount,0))out+=range;return out+lo;
}
/** scr_loop: `value` wrapped into [0, range). */
export const loop=(value:number,range:number)=>loopExt(value,0,range);
/** scr_pingpong: `value` going 0..range..0. */
export function pingpong(value:number,range:number){if(eq(range,0))return value;let v=loop(value,range*2);if(gt(v,range))v=range*2-v;return v;}
export const clamp01=(v:number)=>Math.max(0,Math.min(1,v));
/** remap: `value`'s place between a and b, carried to between c and d (scr_inverselerp, then lerp). */
export function remap(a:number,b:number,c:number,d:number,value:number){return lerp(c,d,(value-a)/(b-a));}
/** angle_difference: the signed turn from `src` to `dest`, -180 to 180. */
export const angleDifference=(dest:number,src:number)=>((((dest-src)%360)+540)%360)-180;
/** scr_rotatetowards: turn `angle` towards `target` by at most `step` degrees. */
export function rotateTowards(angle:number,target:number,step:number){const d=angleDifference(target,angle);return gt(Math.abs(d),step)?angle+Math.sign(d)*step:target;}
/** scr_angle_lerp: `amount` of the way along the shortest turn from `from` to `to`. */
export function angleLerp(from:number,to:number,amount:number){return from+lerp(0,angleDifference(to,from),amount);}
/** gt_maxx and its kin: the battle box's edges (undefined without a box, as the scripts return nothing). */
export function gtMaxx(rt:GmRuntime){const b=rt.first(growtangle);return b?b.x+rt.spriteWidth(b)/2:undefined;}
export function gtMinx(rt:GmRuntime){const b=rt.first(growtangle);return b?b.x-rt.spriteWidth(b)/2:undefined;}
export function gtMaxy(rt:GmRuntime){const b=rt.first(growtangle);return b?b.y+rt.spriteHeight(b)/2:undefined;}
export function gtMiny(rt:GmRuntime){const b=rt.first(growtangle);return b?b.y-rt.spriteHeight(b)/2:undefined;}
/** scr_onscreen_tolerance: whether the instance's sprite is within `spacer` of the view. */
export function onscreenTolerance(rt:GmRuntime,o:GmInstance,spacer:number){
 const vx=rt.view.x,vy=rt.view.y;
 return !(lt(o.x+rt.spriteWidth(o)+spacer,vx)||gt(o.x-spacer,vx+640)||lt(o.y+rt.spriteHeight(o)+spacer,vy)||gt(o.y-spacer,vy+480));
}
/** scr_childbullet, run by `parent`: a bullet that takes the parent's set (not -1) hit fields and its element. */
export function childBullet(parent:GmInstance,rt:GmRuntime,x:number,y:number,def:GmObjectDef){
 const c=rt.create(def,x,y);
 for(const k of ['damage','grazepoints','timepoints','inv','target','grazed','grazetimer'])if(!eq(parent[k],-1))c[k]=parent[k];
 c.element=parent.element;return c;
}
/** scr_afterimage, run by `s`: a still copy at its depth, kept in s.afterimage. */
export function scrAfterimage(s:GmInstance,rt:GmRuntime){return customAfterimage(s,rt,afterimage,0);}
/** scr_custom_afterimage: the same with another afterimage object, one depth behind. */
export function customAfterimage(s:GmInstance,rt:GmRuntime,def:GmObjectDef,depthOffset=1){
 const a=rt.create(def,s.x,s.y);s.afterimage=a.id;
 a.sprite=s.sprite;a.imageIndex=s.imageIndex;a.imageBlend=s.imageBlend;a.imageSpeed=0;a.depth=s.depth+depthOffset;
 a.imageXscale=s.imageXscale;a.imageYscale=s.imageYscale;a.imageAngle=s.imageAngle;return a;
}
/** scr_precise_hit, run by a bullet: whether its precise mask reaches the soul's middle, as a point (size 0), a circle
 * (not ported: no Knight bullet asks for one) or a square of side `size`. */
export function preciseHit(s:GmInstance,rt:GmRuntime,size=3,circle=false){
 const h=rt.first(heart);if(!h)throw Error('scr_precise_hit needs obj_heart');
 const r=size/2,hx=h.x+10,hy=h.y+10;
 if(r<=0)return pointMeets(rt.bank,s,hx,hy,true);
 if(circle)throw Error('scr_precise_hit with a circle is not ported');
 return rectangleMeets(rt.bank,s,hx-r,hy-r,hx+r,hy+r,true);
}
/** scr_draw_beam_color: a thin triangle from (x, y), `length` long, `width` degrees wide, at `angle`, from colour c1 at
 * the root to c2 at the tip, at `alpha` (with a round tip when `cap`). */
export function drawBeamColor(rt:GmRuntime,x:number,y:number,length:number,width:number,angle:number,c1:number,c2:number,alpha:number,cap:boolean){
 const end=(a:number)=>{
  // Source: scr_rotatevector(new Vector2(length), angle). Vector2 has one constructor static scope.
  const v=rt.createStruct({x:length,y:0},'Vector2');
  v.x=lengthdirX(length,a);v.y=lengthdirY(length,a);v.x+=x;v.y+=y;return [v.x,v.y] as const;
 };
 const [x0,y0]=end(angle),[x1,y1]=end(angle+width/2),[x2,y2]=end(angle-width/2);
 const d=rt.drawState,before=d.alpha;d.alpha=alpha;
 if(cap)rt.drawCircle(x0,y0,width/2,false);
 rt.drawTriangleColor(x,y,x1,y1,x2,y2,c1,c2,c2);
 d.alpha=before;
}
/** scr_draw_outline, run by `s`: its sprite drawn white (fogged in `color`) four times around it, `size` apart. */
export function drawOutline(s:GmInstance,rt:GmRuntime,size:number,color:number,alpha:number){
 let ax=size,bx=0,ay=0,by=size;
 if(!eq(s.imageAngle%90,0)){ax=lengthdirX(size,s.imageAngle);bx=lengthdirX(size,s.imageAngle+90);ay=lengthdirY(size,s.imageAngle+90);by=lengthdirY(size,s.imageAngle);}
 for(const [dx,dy] of [[ax,ay],[-ax,-ay],[bx,by],[-bx,-by]])
  rt.drawSpriteFog(s.sprite!,s.imageIndex,s.x+dx,s.y+dy,s.imageXscale,s.imageYscale,s.imageAngle,color,s.imageAlpha*alpha);
}
