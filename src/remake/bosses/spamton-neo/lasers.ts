// NEO's arm beam and Spamton shot. Charging, beam activity and shrinking run in Draw.
import {gmArray,moveTowardsPoint,type GmObjectDef,type GmRuntime} from '../../gm/runtime';
import {C} from '../../gm/graphics';
import {eq,ge,gt,le,lt} from '../../gm/math';
import {bulletInit} from '../../deltarune/battle';

const towards=(a:number,b:number,amount:number)=>eq(a,b)?a:gt(a,b)?Math.max(a-amount,b):Math.min(a+amount,b);
export function createNeoLasers(object:(name:string)=>GmObjectDef):GmObjectDef[]{
 const first=(rt:GmRuntime,name:string)=>rt.first(object(name));
 const requireFirst=(rt:GmRuntime,name:string)=>{const s=first(rt,name);if(!s)throw Error(`NEO lasers require live ${name}`);return s;};
 const laser:GmObjectDef={name:'obj_sneo_biglaser',index:637,parent:object('obj_collidebullet'),sprite:'spr_sneo_laser',depth:0,
  events:{
   create:(s,rt)=>{
    bulletInit(s);Object.assign(s,{element:6,destroyonhit:0,active:0,imageYscale:0.05,imageXscale:0,mask:'spr_nothing',firecon:0,effecttimer:0,siner:0,orbsize:0});
    rt.create(friendly,s.x,s.y);rt.create(telegraph,s.x,s.y);
    const n=first(rt,'obj_spamton_neo_enemy');if(n)s.damage=rt.globals.monsterat[n.myself]*5;
    const c=first(rt,'obj_sneo_bulletcontroller');if(c)s.target=c.target;s.grazepoints=10;s.grazed=1;s._type=0;
   },
   // Difficulty 2's source collision_line result has an empty body and no state effect.
   step:(_s,rt)=>{requireFirst(rt,'obj_spamton_neo_enemy').difficulty;},
   draw:(s,rt)=>{
    if(eq(s.firecon,0)){
     s.imageYscale=0.001;s.imageXscale=2;
     if(le(s.effecttimer,42)&&eq(s.effecttimer%6,0)){
      const count=eq(s._type,1)?3:6,spread=eq(s._type,1)?120:60;
      for(s.i=0;s.i<count;s.i+=1){
       const d=rt.create(object('obj_rouxls_power_up_orb'),s.x,s.y);s.d=d.id;d.direction=rt.random.irandom(spread)+s.i*spread;
       d.lifetime=16;d.depth=s.depth+1;d.imageBlend=s.imageBlend;d.parenttarget=s.id;d._type=s._type;
      }
     }
     if(gt(s.effecttimer,50))s.orbsize-=4;else s.orbsize+=1;
     rt.drawState.color=C.white;rt.drawCircle(s.x,s.y,Math.max(2,s.orbsize/2+Math.sin(s.siner/2)*2));s.effecttimer+=1;s.siner+=1;
    }else if(eq(s.firecon,1)){
     s.active=true;s.mask='spr_sneo_laser';
     if(lt(s.imageYscale,0.5))s.imageYscale=towards(s.imageYscale,0.5,0.1);else s.imageYscale-=0.05;
     rt.drawState.color=C.white;rt.drawCircle(s.x,s.y,s.imageYscale*100);rt.drawSelf(s);
    }else if(eq(s.firecon,2)){
     rt.drawState.color=C.white;s.active=0;s.mask='spr_nothing';
     if(le(s.imageYscale,0.01))s.imageYscale-=0.0025;else s.imageYscale=towards(s.imageYscale,0.01,0.1);
     if(le(s.imageYscale,0))rt.destroy(s);rt.drawCircle(s.x,s.y,s.imageYscale*100);rt.drawSelf(s);
    }
   },
   destroy:(_s,rt)=>{for(const t of rt.all(telegraph))rt.destroy(t);},
  },collisions:[{target:object('obj_heart'),run:()=>{}},{target:object('obj_sneo_lilguy'),run:()=>{}}]};
 const friendly:GmObjectDef={name:'obj_sneo_biglaser_friendlyhitbox',index:684,parent:object('obj_bulletparent'),sprite:'spr_sneo_laser_friendly',depth:0,
  events:{
   create:s=>{s.source=637;s.imageBlend=C.red;s.depth=-99999999;s.visible=false;},
   endStep:(s,rt)=>{
    // source is an object resource, and therefore resolves its first live instance, not its creator.
    const def=s.source===637?laser:objectByIndex(rt,s.source),l=def?rt.first(def):rt.byId(s.source);
    if(!l)rt.destroy(s);else{s.x=l.x;s.y=l.y;s.imageXscale=l.imageXscale;s.imageYscale=Math.max(l.imageYscale-0.25,0);s.imageAngle=l.imageAngle;s.direction=l.direction;}
   },
  },collisions:[{target:object('obj_sneo_lilguy'),run:()=>{}}]};
 const telegraph:GmObjectDef={name:'obj_sneo_arm_laser_telegraph',index:671,depth:0,events:{
  create:s=>{s.laserflash=0;},draw:()=>{},
  step:(s,rt)=>{
   if(!eq(requireFirst(rt,'obj_spamton_neo_enemy').partmode,3))rt.destroy(s);
   const l=rt.first(laser);if(l)s.depth=l.depth+1;
   const h=first(rt,'obj_heart');if(h)s.depth=h.depth+1;
  },
 }};
 const shot:GmObjectDef={name:'obj_spamtonshot',index:598,parent:object('obj_basicbullet_sneo'),sprite:'spr_sneo_bullet1',depth:0,events:{
  create:(s,rt)=>{
   const heartattack=first(rt,'obj_sneo_heartattack');if(heartattack&&lt(heartattack.heart_health,1)){rt.destroy(s);return;}
   bulletInit(s);Object.assign(s,{element:6,f:2,con:0,mode:1,dontexplode:0,destroyable:0,imageXscale:1,imageYscale:1,siner:0,fluffyguarddestroysthis:0,
    targetx:rt.view.x+rt.view.width/2,targety:rt.view.y+rt.view.height/4});
   const h=first(rt,'obj_heart');if(h){s.targetx=h.x;s.targety=h.y;}moveTowardsPoint(s,s.targetx,s.targety,5);
   s.angle_speed=0;s.grazepoints=4;const c=first(rt,'obj_sneo_bulletcontroller');if(c)s.target=c.target;
  },
  step:(s,rt)=>{
   const n=first(rt,'obj_spamton_neo_enemy');if(n)s.damage=rt.globals.monsterat[n.myself]*5;
   if(lt(rt.globals.turntimer,1))rt.destroy(s);s.dontexplode=1;
   const h=first(rt,'obj_heart'),guy=first(rt,'obj_sneo_lilguy');
   if(h)s.depth=h.depth+(gt(s.y,rt.view.y+280)?100:2);
   else if(guy)s.depth=guy.depth-1;
   else s.depth=requireFirst(rt,'obj_heart').depth+2;
   if(eq(s.con,0)){
    s.siner+=s.f;s.imageXscale=0.5+Math.sin(s.siner/4)*0.1*s.f;s.imageYscale=0.5+Math.sin(s.siner/4)*0.1*s.f;
    if(ge(s.siner,30)&&eq(s.dontexplode,0))s.con=1;
   }
   if(eq(s.con,1)){
    s.imageXscale-=0.05*s.f;s.imageYscale-=0.05*s.f;
    if(le(s.imageXscale,0)&&le(s.imageYscale,0)){
     s.uniformangleoff=rt.random.random(360);s.uniformanglespeed=-1+rt.random.random(2);s.shotamount=20;s.off=0;
     const shots=gmArray(s,'shot');
     for(s.i=0;s.i<s.shotamount;s.i+=1){
      const b=rt.create(object('obj_basicbullet_sneo'),s.x,s.y);shots[s.i]=b.id;
      if(eq(s.off,0)){b.destroyable=1;b.imageBlend=C.yellow;s.off=1;}else s.off=0;
      b.speed=s.f;b.friction=-0.05*s.f;
      if(eq(s.mode,1))b.angle_speed=s.uniformanglespeed;if(eq(s.mode,5))b.angle_speed=-2+rt.random.random(4);
      b.imageXscale=1.5;b.imageYscale=1.5;b.sprite='spr_sneo_bullet_arrow';
     }rt.destroy(s);
    }
   }
  },
 }};
 // The source initially stores 637; scripts may replace it with another object index or an instance id.
 const objectByIndex=(rt:GmRuntime,index:number)=>rt.instances.find(s=>s.object.index===index)?.object;
 return [laser,friendly,telegraph,shot];
}
