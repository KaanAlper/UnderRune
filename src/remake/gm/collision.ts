// Instance collision as the Butterscotch runtime does it (collision.h; AGPL-3.0): bounding boxes from the
// sprite margins (rounded in compatibility mode), then per-pixel masks or rotated-rectangle tests.
import {bankersRound} from './math';
import type {SpriteBank,SpriteData} from './sprites';

export interface Collidable{x:number;y:number;imageAngle:number;imageXscale:number;imageYscale:number;imageIndex:number;sprite:string|null;mask:string|null}
export interface BBox{left:number;right:number;top:number;bottom:number}

export const collisionSprite=(bank:SpriteBank,i:Collidable)=>{const n=i.mask??i.sprite;return n?bank.get(n):undefined;};
const margins=(s:SpriteData)=>s.bboxMode===1?{l:0,r:s.width,t:0,b:s.height}:{l:s.left,r:s.right+1,t:s.top,b:s.bottom+1};
const rotated=(i:Collidable)=>Math.abs(i.imageAngle)>0.0001;

export function bbox(bank:SpriteBank,i:Collidable):BBox|undefined{
 const s=collisionSprite(bank,i);if(!s)return undefined;
 const m=margins(s);let left:number,right:number,top:number,bottom:number;
 if(rotated(i)){
  const rad=i.imageAngle*Math.PI/180,cs=Math.cos(rad),sn=Math.sin(rad);
  const lx=[i.imageXscale*(m.l-s.originX),i.imageXscale*(m.r-s.originX)],ly=[i.imageYscale*(m.t-s.originY),i.imageYscale*(m.b-s.originY)];
  const cx:number[]=[],cy:number[]=[];
  for(const y of ly)for(const x of lx){cx.push(cs*x+sn*y);cy.push(-sn*x+cs*y);}
  // Corner order as the reference: (x0,y0) (x1,y0) (x0,y1) (x1,y1); min/max is order independent.
  left=i.x+Math.min(...cx);right=i.x+Math.max(...cx);top=i.y+Math.min(...cy);bottom=i.y+Math.max(...cy);
 }else{
  left=i.x+i.imageXscale*(m.l-s.originX);right=i.x+i.imageXscale*(m.r-s.originX);
  top=i.y+i.imageYscale*(m.t-s.originY);bottom=i.y+i.imageYscale*(m.b-s.originY);
  if(left>right)[left,right]=[right,left];
  if(top>bottom)[top,bottom]=[bottom,top];
 }
 if(bank.collisionCompat){left=bankersRound(left);top=bankersRound(top);right=bankersRound(right);bottom=bankersRound(bottom);}
 return {left,right,top,bottom};
}
const precise=(s:SpriteData)=>s.sepMasks===1&&!!s.masks&&s.masks.length>0;
const needsSat=(s:SpriteData,i:Collidable)=>s.sepMasks===2&&rotated(i);

function pointIn(s:SpriteData,i:Collidable,px:number,py:number){
 if(Math.abs(i.imageXscale)<0.0001||Math.abs(i.imageYscale)<0.0001)return false;
 let dx=px-i.x,dy=py-i.y;
 if(rotated(i)){const rad=i.imageAngle*Math.PI/180,cs=Math.cos(rad),sn=Math.sin(rad);[dx,dy]=[cs*dx-sn*dy,sn*dx+cs*dy];}
 const ix=Math.trunc(dx/i.imageXscale+s.originX),iy=Math.trunc(dy/i.imageYscale+s.originY);
 if(ix<0||iy<0||ix>=s.width||iy>=s.height)return false;
 if(precise(s)){
  const mask=s.masks![(i.imageIndex>>>0)%s.masks!.length],row=(s.width+7)>>3;
  return (mask[iy*row+(ix>>3)]&(1<<(7-(ix&7))))!==0;
 }
 return true;
}
function obbCorners(s:SpriteData,i:Collidable){
 const m=margins(s);let lx0=i.imageXscale*(m.l-s.originX),lx1=i.imageXscale*(m.r-s.originX),ly0=i.imageYscale*(m.t-s.originY),ly1=i.imageYscale*(m.b-s.originY);
 if(lx0>lx1)[lx0,lx1]=[lx1,lx0];
 if(ly0>ly1)[ly0,ly1]=[ly1,ly0];
 const r=rotated(i),rad=i.imageAngle*Math.PI/180,cs=r?Math.cos(rad):1,sn=r?Math.sin(rad):0;
 const xs:number[]=[],ys:number[]=[];
 for(const ly of [ly0,ly1])for(const lx of [lx0,lx1]){xs.push(i.x+cs*lx+sn*ly);ys.push(i.y-sn*lx+cs*ly);}
 return {xs,ys,axes:[[cs,-sn],[sn,cs]]};
}
/** Collision_instancesOverlapPrecise: true when the two instances' shapes overlap. */
export function overlap(bank:SpriteBank,a:Collidable,b:Collidable,ba:BBox,bb:BBox):boolean{
 const iLeft=Math.max(ba.left,bb.left),iRight=Math.min(ba.right,bb.right),iTop=Math.max(ba.top,bb.top),iBottom=Math.min(ba.bottom,bb.bottom);
 if(iLeft>=iRight||iTop>=iBottom)return false;
 const sa=collisionSprite(bank,a),sb=collisionSprite(bank,b);if(!sa||!sb)return false;
 if(!precise(sa)&&!precise(sb)){
  if(!needsSat(sa,a)&&!needsSat(sb,b))return true;
  const A=obbCorners(sa,a),B=obbCorners(sb,b);
  for(const [nx,ny] of [...A.axes,...B.axes]){
   let aMin=A.xs[0]*nx+A.ys[0]*ny,aMax=aMin,bMin=B.xs[0]*nx+B.ys[0]*ny,bMax=bMin;
   for(let j=1;j<4;j++){
    const pa=A.xs[j]*nx+A.ys[j]*ny,pb=B.xs[j]*nx+B.ys[j]*ny;
    if(pa<aMin)aMin=pa;else if(pa>aMax)aMax=pa;
    if(pb<bMin)bMin=pb;else if(pb>bMax)bMax=pb;
   }
   if(aMax<=bMin||bMax<=aMin)return false;
  }
  return true;
 }
 const compat=bank.collisionCompat;
 const sx=compat?Math.trunc(iLeft):Math.floor(iLeft),ex=compat?Math.trunc(iRight):Math.ceil(iRight);
 const sy=compat?Math.trunc(iTop):Math.floor(iTop),ey=compat?Math.trunc(iBottom):Math.ceil(iBottom);
 const off=compat?0:0.5;
 for(let py=sy;compat?py<=ey:py<ey;py++)for(let px=sx;compat?px<=ex:px<ex;px++){
  if(pointIn(sa,a,px+off,py+off)&&pointIn(sb,b,px+off,py+off))return true;
 }
 return false;
}
/** Shared check for a collision event or a place_meeting test between two instances. */
export function instancesMeet(bank:SpriteBank,a:Collidable,b:Collidable){
 const ba=bbox(bank,a),bb=bbox(bank,b);if(!ba||!bb)return false;
 if(ba.left>=bb.right||bb.left>=ba.right||ba.top>=bb.bottom||bb.top>=ba.bottom)return false;
 const sa=collisionSprite(bank,a)!,sb=collisionSprite(bank,b)!;
 if(precise(sa)||precise(sb)||needsSat(sa,a)||needsSat(sb,b))return overlap(bank,a,b,ba,bb);
 return true;
}
/** Rectangle query against the same native sprite margins and per-pixel masks. */
export function rectangleMeets(bank:SpriteBank,i:Collidable,x1:number,y1:number,x2:number,y2:number,usePrecise:boolean){
 const b=bbox(bank,i),s=collisionSprite(bank,i);if(!b||!s)return false;
 const left=Math.max(b.left,Math.min(x1,x2)),right=Math.min(b.right,Math.max(x1,x2)+1),top=Math.max(b.top,Math.min(y1,y2)),bottom=Math.min(b.bottom,Math.max(y1,y2)+1);
 if(left>=right||top>=bottom)return false;if(!usePrecise||(!precise(s)&&!needsSat(s,i)))return true;
 const offset=bank.collisionCompat?0:.5;
 for(let y=Math.floor(top);y<Math.ceil(bottom);y++)for(let x=Math.floor(left);x<Math.ceil(right);x++)if(pointIn(s,i,x+offset,y+offset))return true;
 return false;
}
/** distance_to_object: the gap between `self`'s box and the nearest of `others`' boxes (0 when `self` has no sprite;
 * 1e10 when none of the others has a box). */
export function distanceToObject(bank:SpriteBank,self:Collidable,others:readonly Collidable[]){
 const a=bbox(bank,self);if(!a)return 0;
 let min=1e20;
 for(const o of others){
  if(o===self)continue;
  const b=bbox(bank,o);if(!b)continue;
  let xd=0,yd=0;
  if(b.left>a.right)xd=b.left-a.right;
  if(a.left>b.right)xd=a.left-b.right;
  if(b.top>a.bottom)yd=b.top-a.bottom;
  if(a.top>b.bottom)yd=a.top-b.bottom;
  const d=xd*xd+yd*yd;if(min>d)min=d;
 }
 return Math.sqrt(min);
}
