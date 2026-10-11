// Jevil's spade ring: spades appear around the box, glide in, then launch one by one toward the soul.
import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {lengthdirX,lengthdirY} from '../../gm/math';
import {battleSolid,bulletParent,collideBullet,inheritBullet} from '../../deltarune/battle';

const C_LTGRAY=0xc0c0c0,C_WHITE=0xffffff;
export const spadeRing:GmObjectDef={name:'obj_spadering',index:277,parent:bulletParent,sprite:'spr_diamondbullet',visible:false,events:{
 create:(s,rt)=>{s.ringno=0;s.maxspade=8;s.t=0;s.con=0;s.startspade=0;s.spadet=0;s.startang=rt.random.random(360);s.grav=0.2;s.size=1;s.special=0;s.side=0;},
 step:(s,rt)=>step(s,rt),
}};
function step(s:GmInstance,rt:GmRuntime){
 const max=s.maxspade,solid=rt.first(battleSolid)!;
 const spades:(GmInstance|undefined)[]=s.spade??=[];
 if(s.t===0){
  if(s.size>1)s.startang=-rt.random.random(180);
  for(let i=0;i<max;i++){
   let ang=360/max*i+s.startang;if(s.side===1)ang=-ang;
   const b=rt.create(collideBullet,lengthdirX(300,ang+180)+solid.x,lengthdirY(300,ang+180)+solid.y);spades[i]=b;
   inheritBullet(s,b);
   b.sprite='spr_spadebullet';b.imageAlpha=0;b.active=1;b.imageBlend=C_LTGRAY;b.direction=ang;b.imageAngle=ang;b.speed=26;b.imageXscale=s.size;b.imageYscale=s.size;
  }
 }
 const live=(i:number)=>{const b=spades[i];return b&&b.live?b:undefined;};
 if(s.t>=1&&s.t<15)for(let i=0;i<max;i++){const b=live(i);if(b){b.speed=b.speed*0.87;b.imageAlpha=b.imageAlpha+0.1;}}
 if(s.t===15)for(let i=0;i<max;i++){const b=live(i);if(b){b.speed=0;b.imageAlpha=b.imageAlpha+0.1;}}
 if(s.t>=15&&s.con===0){
  s.spadet+=1;if(s.special===1)s.spadet+=6;
  if(s.spadet>=4){
   const b=live(s.startspade);
   if(b){b.imageBlend=C_WHITE;b.gravityDirection=b.direction;b.speed=-3.4;b.gravity=s.grav;}
   s.startspade+=1;
   if(s.startspade>=max){s.con=1;rt.destroy(s);}
   s.spadet=0;
  }
 }
 s.t+=1;
}
