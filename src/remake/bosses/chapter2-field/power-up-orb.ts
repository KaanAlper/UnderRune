// obj_rouxls_power_up_orb: a mote that appears some distance out along its direction and is drawn into its start
// point (its parent's position, or a tracked instance's) while it shrinks. Rouxls's and Mauswheel's charge-ups make
// them; thin motes are streaks drawn with the object's sprite instead of circles.
import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {C} from '../../gm/graphics';
import {gt,lengthdirX,lengthdirY} from '../../gm/math';
import {lerpEaseIn} from '../../deltarune/ease';

const required=(rt:GmRuntime,id:number,who:string)=>{const i=rt.byId(id);if(!i)throw Error(`obj_rouxls_power_up_orb: ${who} ${id} no longer exists`);return i;};

export function createPowerUpOrb(object:(name:string)=>GmObjectDef):GmObjectDef{
 return {...object('obj_rouxls_power_up_orb'),events:{
  create:s=>{Object.assign(s,{init:0,imageAlpha:0,lifetime:30,xx:s.x,yy:s.y,timer:0,radius:5,parenttarget:-1,thin:0,_type:0,track_target:-4,xoff:0,yoff:0,max_radius:6,distance_multiplier:1});},
  draw:(s,rt)=>{
   if(s.parenttarget!==-1&&!rt.byId(s.parenttarget)){rt.destroy(s);return;}
   if(s.parenttarget!==-1){const p=rt.byId(s.parenttarget)!;s.xstart=p.x;s.ystart=p.y;}
   if(s.init===0){
    s.init=1;if(s.thin)s.lifetime/=2;
    if(s.track_target!==-4){s.xstart=0;s.ystart=0;}
    let distance=rt.random.randomRange(70,90)*s.distance_multiplier;
    if(s._type===1)distance=rt.random.randomRange(40,45);
    s.xx=s.xstart+lengthdirX(distance,s.direction);s.x=s.xx;
    s.yy=s.ystart+lengthdirY(distance,s.direction);s.y=s.yy;
   }
   if(s.track_target!==-4){const t=required(rt,s.track_target,'track_target');s.xoff=t.x;s.yoff=t.y;}
   s.timer++;
   if(gt(s.timer,s.lifetime)){rt.destroy(s);return;}
   const progress=s.timer/s.lifetime,approach=(o:GmInstance)=>{o.x=lerpEaseIn(o.xx,o.xstart,progress,2)+o.xoff;o.y=lerpEaseIn(o.yy,o.ystart,progress,2)+o.yoff;};
   s.imageAlpha=1;
   if(s.thin){s.imageBlend=C.white;s.imageYscale=0.25;s.imageAngle=s.direction;rt.drawSelf(s);approach(s);return;}
   const d=rt.drawState,drawalpha=d.alpha;
   d.color=s.imageBlend;rt.drawCircle(s.x,s.y,s.radius-2,false);
   d.alpha=s.imageAlpha;approach(s);rt.drawCircle(s.x,s.y,s.radius,false);
   if(gt(s.radius-3,0)){d.color=C.white;rt.drawCircle(s.x,s.y,s.radius-2,false);}
   d.alpha=drawalpha;s.radius=s.max_radius+(1-s.max_radius)*progress;
  },
 }};
}
