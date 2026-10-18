// Dynamic path geometry and motion following GameMaker's yyPath and runner Adapt_Path.
// Runtime reference: local Butterscotch data_win.c / runner.c (AGPL-3.0).
import {f32} from './math';
import type {GmInstance} from './runtime';
type Point={x:number;y:number;speed:number};
type Node=Point&{l:number};
type Path={kind:number;precision:number;closed:boolean;points:Point[];nodes:Node[];length:number;dirty:boolean};
const point=(x:number,y:number,speed:number):Point=>({x:f32(x),y:f32(y),speed:f32(speed)});
const half=(a:Point,b:Point)=>point(f32(a.x+b.x)/2,f32(a.y+b.y)/2,f32(a.speed+b.speed)/2);
const distance2=(a:Point,b:Point)=>f32(f32(f32(a.x-b.x)**2)+f32(f32(a.y-b.y)**2));
export class GmPaths{
 private paths=new Map<number,Path>();private nextId=0;
 /** path_add numbers new paths after the game's own path resources. */
 reserve(resources:number){this.nextId=Math.max(this.nextId,resources);}
 add(){const id=this.nextId++;this.paths.set(id,{kind:0,precision:4,closed:true,points:[],nodes:[],length:0,dirty:true});return id;}
 exists(id:number){return this.paths.has(id);}
 delete(id:number){this.paths.delete(id);}
 private edit(id:number,fn:(p:Path)=>void){const p=this.paths.get(id);if(p){fn(p);p.dirty=true;}}
 setKind(id:number,kind:number){this.edit(id,p=>{p.kind=kind;});}
 setPrecision(id:number,precision:number){this.edit(id,p=>{p.precision=Math.max(1,Math.min(8,Math.trunc(precision)));});}
 setClosed(id:number,closed:boolean){this.edit(id,p=>{p.closed=closed;});}
 addPoint(id:number,x:number,y:number,speed:number){this.edit(id,p=>p.points.push(point(x,y,speed)));}
 private geometry(id:number){
  const p=this.paths.get(id);if(!p||!p.dirty)return p;p.nodes=[];p.length=0;p.dirty=false;
  const add=(v:Point)=>p.nodes.push({...v,l:0});
  const piece=(depth:number,a:Point,b:Point,c:Point)=>{
   if(!depth)return;
   const mid=point(f32(f32(f32(a.x+b.x)+b.x)+c.x)/4,f32(f32(f32(a.y+b.y)+b.y)+c.y)/4,f32(f32(f32(a.speed+b.speed)+b.speed)+c.speed)/4);
   if(distance2(b,a)>16)piece(depth-1,a,half(b,a),mid);add(mid);
   if(distance2(b,c)>16)piece(depth-1,mid,half(c,b),c);
  };
  const n=p.points.length;if(!n)return p;
  if(p.kind===1){
   if(!p.closed)add(p.points[0]);
   const last=p.closed?n-1:n-3;
   for(let i=0;i<=last;i++){const a=p.points[i%n],b=p.points[(i+1)%n],c=p.points[(i+2)%n];piece(p.precision,half(a,b),b,half(b,c));}
   add(p.closed?p.nodes[0]:p.points[n-1]);
  }else{for(const v of p.points)add(v);if(p.closed)add(p.points[0]);}
  for(let i=1;i<p.nodes.length;i++){p.length=f32(p.length+f32(Math.sqrt(distance2(p.nodes[i],p.nodes[i-1]))));p.nodes[i].l=p.length;}
  return p;
 }
 private sample(p:Path,t:number):Point{
  const a=p.nodes;if(!a.length)return point(0,0,100);if(a.length===1||p.length===0||t<=0)return a[0];if(t>=1)return a[a.length-1];
  const l=f32(p.length*f32(t));let i=0;while(i<a.length-2&&l>=a[i+1].l)i++;
  const r=f32(l-a[i].l),w=f32(a[i+1].l-a[i].l);if(w===0)return a[i];
  const blend=(k:'x'|'y'|'speed')=>f32(a[i][k]+f32(f32(r*f32(a[i+1][k]-a[i][k]))/w));
  return {x:blend('x'),y:blend('y'),speed:blend('speed')};
 }
 getX(id:number,t:number){const p=this.geometry(id);return p?this.sample(p,t).x:0;}
 getY(id:number,t:number){const p=this.geometry(id);return p?this.sample(p,t).y:0;}
 start(s:GmInstance,id:number,speed:number,endAction=0,absolute=false){
  s.path_index=-1;const p=this.geometry(id);if(!p||p.length<=0)return;
  Object.assign(s,{path_index:id,path_speed:f32(speed),path_position:speed>=0?0:1,path_positionprevious:speed>=0?0:1,path_scale:1,path_orientation:0,path_endaction:endAction});
  if(absolute){const at=this.sample(p,s.path_position),origin=this.sample(p,0);s.x=at.x;s.y=at.y;s.path_xstart=origin.x;s.path_ystart=origin.y;}
  else{s.path_xstart=s.x;s.path_ystart=s.y;}
 }
 end(s:GmInstance){s.path_index=-1;}
 /** Called after friction/gravity and before ordinary velocity; returns the Other path-end event condition. */
 advance(s:GmInstance){
  if(!('path_index' in s)||s.path_index<0)return false;
  const p=this.geometry(s.path_index);if(!p||p.length<=0)return false;
  const rad=s.path_orientation*Math.PI/180,cos=Math.cos(rad),sin=Math.sin(rad),origin=this.sample(p,0);
  const factor=this.sample(p,s.path_position).speed/(100*s.path_scale);
  s.path_position=f32(s.path_position+s.path_speed*factor/p.length);let ended=false;
  if(s.path_position>=1||s.path_position<=0){
   ended=s.path_speed!==0;
   switch(s.path_endaction){
    case 0:if(s.path_speed!==0){s.path_position=s.path_speed>=0?1:0;s.path_index=-1;}break;
    case 1:s.path_position=f32(s.path_position+(s.path_position<0?1:-1));break;
    case 2:{const last=this.sample(p,1),dx=last.x-origin.x,dy=last.y-origin.y,sign=s.path_position<0?-1:1;
     s.path_xstart=f32(s.path_xstart+sign*f32(s.path_scale*(dx*cos+dy*sin)));s.path_ystart=f32(s.path_ystart+sign*f32(s.path_scale*(dy*cos-dx*sin)));s.path_position=f32(s.path_position-sign);break;}
    case 3:if(s.path_position<0){s.path_position=f32(-s.path_position);s.path_speed=f32(Math.abs(s.path_speed));}else{s.path_position=f32(2-s.path_position);s.path_speed=f32(-Math.abs(s.path_speed));}break;
    default:s.path_position=1;s.path_index=-1;
   }
  }
  const at=this.sample(p,s.path_position),dx=at.x-origin.x,dy=at.y-origin.y;
  const x=s.path_xstart+s.path_scale*(dx*cos+dy*sin),y=s.path_ystart+s.path_scale*(dy*cos-dx*sin);
  s.hspeed=x-s.x;s.vspeed=y-s.y;s.speed=0;s.x=x;s.y=y;return ended;
 }
}
