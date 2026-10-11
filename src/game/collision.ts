export type Rect={x:number;y:number;width:number;height:number};
export function circleHitsRect(c:{x:number;y:number;radius:number},r:Rect){
 const nx=Math.max(r.x,Math.min(c.x,r.x+r.width)),ny=Math.max(r.y,Math.min(c.y,r.y+r.height));
 return (c.x-nx)**2+(c.y-ny)**2<=c.radius**2;
}
export function segmentHitsCircle(ax:number,ay:number,bx:number,by:number,cx:number,cy:number,r:number){
 const dx=bx-ax,dy=by-ay,l=dx*dx+dy*dy;
 const t=l?Math.max(0,Math.min(1,((cx-ax)*dx+(cy-ay)*dy)/l)):0;
 return (cx-ax-t*dx)**2+(cy-ay-t*dy)**2<=r*r;
}
