// Jevil's spade ring: spades appear around the box, glide in, then launch one by one toward the soul.
import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {lengthdirX,lengthdirY} from '../../gm/math';
import {bulletParent,battleSolid} from '../../deltarune/bullets';

const C_LTGRAY=0xc0c0c0,C_WHITE=0xffffff;
/** scr_bullet_inherit: the new bullet takes the spawner's bullet values. */
export function inheritBullet(from:GmInstance,to:GmInstance){
 to.damage=from.damage;to.grazepoints=from.grazepoints;to.timepoints=from.timepoints;to.inv=from.inv;to.target=from.target;to.grazed=0;to.grazetimer=0;
}
export function spadeRing(collide:GmObjectDef):GmObjectDef{
 return {name:'obj_spadering',index:277,parent:bulletParent,sprite:'spr_diamondbullet',visible:false,events:{
  create:(s,rt)=>{s.ringno=0;s.maxspade=8;s.t=0;s.con=0;s.startspade=0;s.spadet=0;s.startang=rt.random.random(360);s.grav=0.2;s.size=1;s.special=0;s.side=0;},
  step:(s,rt)=>step(s,rt,collide),
 }};
}
function step(s:GmInstance,rt:GmRuntime,collide:GmObjectDef){
 const max=s.maxspade as number,solid=rt.first(battleSolid)!;
 const spades=(s.spade??=[]) as (GmInstance|undefined)[];
 if(s.t===0){
  if((s.size as number)>1)s.startang=-rt.random.random(180);
  for(let i=0;i<max;i++){
   let ang=360/max*i+(s.startang as number);if(s.side===1)ang=-ang;
   const b=rt.create(collide,lengthdirX(300,ang+180)+solid.x,lengthdirY(300,ang+180)+solid.y);spades[i]=b;
   inheritBullet(s,b);
   b.sprite='spr_spadebullet';b.imageAlpha=0;b.active=1;b.imageBlend=C_LTGRAY;b.direction=ang;b.imageAngle=ang;b.speed=26;b.imageXscale=s.size as number;b.imageYscale=s.size as number;
  }
 }
 const live=(i:number)=>{const b=spades[i];return b&&b.live?b:undefined;};
 if((s.t as number)>=1&&(s.t as number)<15)for(let i=0;i<max;i++){const b=live(i);if(b){b.speed=b.speed*0.87;b.imageAlpha=b.imageAlpha+0.1;}}
 if(s.t===15)for(let i=0;i<max;i++){const b=live(i);if(b){b.speed=0;b.imageAlpha=b.imageAlpha+0.1;}}
 if((s.t as number)>=15&&s.con===0){
  s.spadet=(s.spadet as number)+1;if(s.special===1)s.spadet=(s.spadet as number)+6;
  if((s.spadet as number)>=4){
   const b=live(s.startspade as number);
   if(b){b.imageBlend=C_WHITE;b.gravityDirection=b.direction;b.speed=-3.4;b.gravity=s.grav as number;}
   s.startspade=(s.startspade as number)+1;
   if((s.startspade as number)>=max){s.con=1;rt.destroy(s);}
   s.spadet=0;
  }
 }
 s.t=(s.t as number)+1;
}
