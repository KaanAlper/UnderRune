import type {GmObjectDef} from '../../gm/runtime';
import {lengthdirX,lengthdirY,gt} from '../../gm/math';
import {easeIn} from '../../deltarune/ease';
/** Rouxls' power orb, also used by Mauswheel. Its Draw event owns movement, lifetime and the initial RNG draw. */
export function createRouxlsPowerOrb(object:(name:string)=>GmObjectDef):GmObjectDef{
 return {...object('obj_rouxls_power_up_orb'),events:{
  create:s=>{Object.assign(s,{init:0,imageAlpha:0,lifetime:30,xx:s.x,yy:s.y,timer:0,radius:5,parenttarget:-1,thin:0,_type:0,track_target:-4,xoff:0,yoff:0,max_radius:6,distance_multiplier:1});},
  draw:(s,rt)=>{
   if(s.parenttarget!==-1&&!rt.byId(s.parenttarget)){rt.destroy(s);return;}
   if(s.parenttarget!==-1){const p=rt.byId(s.parenttarget)!;s.xstart=p.x;s.ystart=p.y;}
   if(s.init===0){s.init=1;if(s.thin)s.lifetime/=2;if(s.track_target!==-4){s.xstart=0;s.ystart=0;}
    let distance=rt.random.randomRange(70,90)*s.distance_multiplier;if(s._type===1)distance=rt.random.randomRange(40,45);
    s.xx=s.xstart+lengthdirX(distance,s.direction);s.x=s.xx;s.yy=s.ystart+lengthdirY(distance,s.direction);s.y=s.yy;
   }
   if(s.track_target!==-4){const t=rt.byId(s.track_target)!;s.xoff=t.x;s.yoff=t.y;}
   s.timer++;if(gt(s.timer,s.lifetime)){rt.destroy(s);return;}
   const progress=s.timer/s.lifetime;s.imageAlpha=1;
   const move=()=>{s.x=s.xx+(s.xstart-s.xx)*easeIn(progress,2)+s.xoff;s.y=s.yy+(s.ystart-s.yy)*easeIn(progress,2)+s.yoff;};
   if(s.thin){s.imageBlend=0xffffff;s.imageYscale=.25;s.imageAngle=s.direction;rt.drawSelf(s);move();}
   else{const alpha=rt.drawState.alpha;rt.drawState.color=s.imageBlend;rt.drawCircle(s.x,s.y,s.radius-2,false);rt.drawState.alpha=s.imageAlpha;move();rt.drawCircle(s.x,s.y,s.radius,false);
    if(gt(s.radius-3,0)){rt.drawState.color=0xffffff;rt.drawCircle(s.x,s.y,s.radius-2,false);}rt.drawState.alpha=alpha;s.radius=s.max_radius+(1-s.max_radius)*progress;
   }
  },
 }};
}
