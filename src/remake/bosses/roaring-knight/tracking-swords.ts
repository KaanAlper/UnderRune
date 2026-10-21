// Tracking swords (pattern 151): manager cadence/direction history, fading swords and their Draw trails,
// short-lived slash hitboxes, extra graze rewards, and variant one's scattered gravity bullets.
import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {eq,ge,gt,le,lt,lengthdirX,lengthdirY,lerp} from '../../gm/math';
import {C,mergeColor} from '../../gm/graphics';
import {afterimageGrow,bulletInit,growtangle,heart,partyWears,tensionHeal} from '../../deltarune/battle';
import {gtMinx,gtMiny} from '../../deltarune/chapter3-scripts';
import {snd} from '../../deltarune/sound';
import type {Chapter2BulletRunner} from '../../deltarune/chapter2-bullets';

export function createTrackingSwords(object:(name:string)=>GmObjectDef){
 const soul=(rt:GmRuntime)=>{const h=rt.first(heart);if(!h)throw Error('Tracking swords need obj_heart');return h;};
 const box=(rt:GmRuntime)=>{const b=rt.first(growtangle);if(!b)throw Error('Tracking swords need obj_growtangle');return b;};
 const reducedGraze=(rt:GmRuntime)=>rt.exists(object('obj_sword_vortex_manager'))||eq(rt.first(manager)?.variant,1);
 const slash:GmObjectDef={...object('obj_tracking_sword_slash'),events:{
  create:(s,rt)=>{s.timer=0;s.con=0;s.imageXscale=900;s.imageYscale=1;bulletInit(s);s.active=1;s.destroyonhit=0;s.damage=1;s.grazepoints=4;if(reducedGraze(rt))s.grazepoints=2;s.timepoints=11;},
  // The native Step explicitly exits, suppressing the parent's wall/spin/fade handler.
  step:()=>{},
  // This object's lifetime belongs to Draw.
  draw:(s,rt)=>{s.timer++;if(eq(s.timer,3))rt.destroy(s);},
 }};
 const extraGraze:GmObjectDef={...object('obj_tracking_sword_slash_extra_graze'),events:{
  create:(s,rt)=>{
   Object.assign(s,{timer:0,con:0,imageXscale:900,imageYscale:7,imageBlend:C.red,visible:false,grazetpfactor:1,grazetimefactor:1,grazesizefactor:1,grazecount:0});
   s.grazetpfactor+=partyWears(rt,15)*0.1;s.grazetpfactor+=partyWears(rt,24)*0.05;s.grazetimefactor+=partyWears(rt,14)*0.1;
   if(gt(s.grazetimefactor,3))s.grazetimefactor=3;if(gt(s.grazetpfactor,3))s.grazetpfactor=3;
  },
  draw:(s,rt)=>{
   rt.drawSelf(s);
   s.timer++;if(eq(s.timer,3))rt.destroy(s);
  },
  step:(s,rt)=>{
   if(lt(rt.globals.inv,0)&&rt.placeMeeting(s,s.x,s.y,heart)){
    tensionHeal(rt,(reducedGraze(rt)?4:7)*s.grazetpfactor);
    if(ge(rt.globals.turntimer,10))rt.globals.turntimer-=(1/30)*s.grazetimefactor;
    rt.destroy(s);
   }
  },
 }};
 const sword2:GmObjectDef={...object('obj_tracking_sword2'),events:{
  create:(s,rt)=>{
   s.timer=0;s.con=0;s.variant=0;bulletInit(s);s.damage=1;s.destroyonhit=0;s.grazepoints=1;s.active=0;
   s.imageSpeed=0;s.imageIndex=1;s.imageAngle=rt.random.irandom(360);s.direction=s.imageAngle;s.gravityDirection=s.imageAngle;
   s.imageXscale=1;s.imageYscale=1;s.imageAlpha=0.5;s.sprite='spr_ball_small_pixel_hitbox';
  },
  step:(s,rt)=>{
   s.timer++;if(eq(s.timer,30)){s.gravity=0.01;s.active=1;s.imageAlpha=1;}
   const b=box(rt);if(lt(s.x,b.x-200)||gt(s.x,b.x+200)||lt(s.y,b.y-200)||gt(s.y,b.y+200)){
    s.imageAlpha-=0.1;if(lt(s.imageAlpha,0.1))rt.destroy(s);
   }
  },
 }};
 const sword1:GmObjectDef={...object('obj_tracking_sword1'),events:{
  create:s=>{
   Object.assign(s,{timer:0,con:0,afterimagecon:0,targetx:0,targety:0,variant:0,imageAlpha:0});bulletInit(s);s.element=5;
   Object.assign(s,{fadetohalftime:5,waittime:10,fadetofulltime:20,flashtime:4,len:120,lenstart:120});
  },
  step:(s,rt)=>{
   if(lt(s.con,2)){const h=soul(rt);s.x=h.x+10+lengthdirX(s.len,s.direction);s.y=Math.max(rt.view.y+40,Math.min(rt.view.y+320,h.y+10+lengthdirY(s.len,s.direction)));}
   if(eq(s.con,0)){
    s.timer++;if(eq(s.timer,1))snd(rt,'snd_knight_jump_quick',1.3,1);
    s.imageAlpha=lerp(0,0.5,s.timer/s.fadetohalftime);if(eq(s.imageAlpha,0.5)){s.con=1;s.timer=0;}
   }
   if(eq(s.con,1)){
    s.timer++;
    if(ge(s.timer,s.waittime)){
     s.imageAlpha=lerp(0.8,1,(s.timer-s.waittime)/s.fadetofulltime);s.len=lerp(s.len,s.lenstart+10,(s.timer-s.waittime)/s.fadetofulltime);
     s.imageBlend=mergeColor(C.white,C.red,s.timer/30);
    }
    if(eq(s.imageAlpha,1)){
     s.con=2;s.timer=0;const a=rt.create(afterimageGrow,s.x,s.y);s.afterimage=a.id;
     Object.assign(a,{sprite:s.sprite,imageIndex:s.imageIndex,imageBlend:s.imageBlend,imageSpeed:0,depth:s.depth,imageXscale:s.imageXscale,imageYscale:s.imageYscale,imageAngle:s.imageAngle,xrate:0.2,yrate:0.2,fade:0.3});
    }
   }
   if(eq(s.con,2)){s.timer++;if(eq(s.timer,s.flashtime+1)){s.con=3;s.timer=0;}}
   if(eq(s.con,3)){
    s.timer++;
    if(eq(s.timer,1)){s.afterimagecon=1;s.targetx=s.x+lengthdirX(900,s.direction+180);s.targety=s.y+lengthdirY(900,s.direction+180);snd(rt,'snd_knight_cut2',1.3,1);}
    if(eq(s.timer,2)){
     const a=rt.create(slash,s.x,s.y);s.slash=a.id;a.imageAngle=s.imageAngle;a.direction=s.direction;a.damage=s.damage;
     const b=rt.create(extraGraze,s.x,s.y);s.slash2=b.id;b.imageAngle=s.imageAngle;b.direction=s.direction;
     if(eq(s.variant,1))for(s.i=0;lt(s.i,27);s.i++){
      const c=lerp(1,5,s.i/27),x=lerp(s.x,s.targetx,s.i/27),y=lerp(s.y,s.targety,s.i/27),g=box(rt);
      if(lt(x,g.x+200)&&gt(x,g.x-200)&&gt(y,g.y-200)&&lt(y,g.y+200)){
       const d=rt.create(sword2,lerp(s.x,s.targetx,s.i/27*c),lerp(s.y,s.targety,s.i/27*c));s.inst=d.id;d.damage=s.damage;d.target=s.target;
      }
     }
    }
    if(eq(s.timer,5))rt.destroy(s);
   }
  },
  draw:(s,rt)=>{
   if(eq(s.afterimagecon,0)){rt.drawSelf(s);if(eq(s.con,2))rt.drawSpriteFog(s.sprite!,s.imageIndex,s.x,s.y,s.imageXscale,s.imageYscale,s.imageAngle,C.white,s.imageAlpha);}
   const trail=(factor:number)=>{
    rt.drawSprite(s.sprite,s.imageIndex,s.x,s.y,s.imageXscale,s.imageYscale,s.imageAngle,s.imageBlend,0.0025);
    for(s.i=0;lt(s.i,40);s.i++)rt.drawSprite(s.sprite,s.imageIndex,lerp(s.x,s.targetx,s.i/40),lerp(s.y,s.targety,s.i/40),s.imageXscale,s.imageYscale,s.imageAngle,s.imageBlend,(0.2+s.i/80)*factor);
   };
   if(eq(s.afterimagecon,1)){trail(1);s.afterimagecon=2;}else if(eq(s.afterimagecon,2)){trail(0.5);s.afterimagecon=3;}
  },
 }};
 const manager:GmObjectDef={...object('obj_tracking_swords_manager'),events:{
  create:(s,rt)=>{
   Object.assign(s,{timer:0,con:0,variant:0,firstsword:false,multiswordmax:0,multiswordframes:0,multiswordcon:0,multiswordcount:0,setcount:0,setdirection:[]});
   for(s.i=0;lt(s.i,50);s.i++)s.setdirection[s.i]=-1;
   s.creatorid=-1;s.creator=-1;s.hell_surface=-4;bulletInit(s);s.swordcount=0;s.directionprev=[];
   for(s.i=0;lt(s.i,8);s.i++)s.directionprev[s.i]=-1;
   rt.userEvent(s,0);
  },
  user0:(s,rt)=>{
   if(eq(s.variant,0))Object.assign(s,{rate:32,ratedecay:4,rateminimum:16,maxswords:99,multiswordmax:0});
   if(eq(s.variant,1))Object.assign(s,{rate:24,ratedecay:0,rateminimum:24,maxswords:99,multiswordmax:0});
   if(eq(s.variant,2)){
    Object.assign(s,{rate:24,ratedecay:0,rateminimum:24,maxswords:99,multiswordmax:2,multiswordframes:4});
    for(let i=1;i<=10;i++)s.setdirection[i]=((i-1)%8)*45;
   }
   if(eq(s.variant,3))Object.assign(s,{rate:20,ratedecay:4,rateminimum:13,maxswords:99,multiswordmax:0});
   for(const controller of rt.withInstances(object('obj_dbulletcontroller'))){
    if(eq(controller.type,104))for(const m of rt.withInstances(manager))Object.assign(m,{rate:55,ratedecay:0,rateminimum:24,maxswords:99,multiswordmax:0,multiswordframes:0});
    if(eq(controller.type,154))for(const m of rt.withInstances(manager))Object.assign(m,{rate:24,ratedecay:4,rateminimum:16,maxswords:99,multiswordmax:0});
   }
   s.timer=s.rate-5;
  },
  step:(s,rt)=>{
   if(lt(rt.globals.turntimer,70))return;
   s.timer++;
   if((eq(s.timer,s.rate)&&le(s.swordcount,s.maxswords))||(eq(s.timer,s.multiswordframes)&&eq(s.multiswordcon,1))){
    const a=rt.create(sword1,s.x,s.y);s.inst=a.id;a.direction=rt.random.choose(0,45,90,135,180,225,270,315);a.variant=s.variant;a.damage=s.damage;
    for(let repeat=0;repeat<8;repeat++)for(s.i=0;lt(s.i,8);s.i++)if(eq(a.direction,s.directionprev[s.i]))a.direction+=45;
    a.imageAngle=a.direction+180;s.directionprev[s.swordcount]=a.direction;
    for(s.i=1;lt(s.i,4);s.i++){let n=s.i+s.swordcount;if(gt(n,7))n-=7;s.directionprev[n]=-1;}
    s.swordcount++;
    if(gt(s.swordcount,s.maxswords)&&eq(s.variant,0))rt.globals.turntimer=70;
    if(gt(s.swordcount,s.maxswords)&&eq(s.variant,1))rt.globals.turntimer=120;
    if(gt(s.swordcount,7)&&lt(s.swordcount,s.maxswords))s.swordcount=0;
    s.setcount++;if(!eq(s.setdirection[s.setcount],-1))a.direction=s.setdirection[s.setcount];
    if(gt(s.multiswordmax,0))s.multiswordcount++;
    if(eq(s.multiswordcon,0)&&gt(s.multiswordmax,0))s.multiswordcon=1;
    if(eq(s.multiswordcon,1)&&eq(s.multiswordcount,s.multiswordmax)){s.multiswordcon=0;s.multiswordcount=0;}
    const h=soul(rt);a.x=h.x+10+lengthdirX(a.len,a.direction);a.y=h.y+10+lengthdirY(a.len,a.direction);a.ystart=a.y;a.imageAngle=a.direction+180;
    s.rate-=s.ratedecay;if(lt(s.rate,s.rateminimum))s.rate=s.rateminimum;s.timer=0;
   }
  },
  draw:(s,rt)=>{
   const surfaces=rt.sourceSurfaces;if(!surfaces)throw Error('Tracking swords Draw needs source surfaces');
   if(!surfaces.exists(s.hell_surface))s.hell_surface=surfaces.create(150,150);
   surfaces.target(s.hell_surface);surfaces.clear(C.black,0);rt.drawBlendMode('add');
   const left=gtMinx(rt)!,top=gtMiny(rt)!;
   for(const a of rt.withInstances(slash))rt.drawSprite(a.sprite,a.imageIndex,a.x-left,a.y-top,a.imageXscale,a.imageYscale,a.imageAngle,C.white,a.imageAlpha);
   rt.drawBlendMode('normal');surfaces.target(null);surfaces.draw(s.hell_surface,left,top);
  },
  cleanup:(s,rt)=>{if(rt.sourceSurfaces?.exists(s.hell_surface))rt.sourceSurfaces.free(s.hell_surface);},
 }};
 const pattern:Chapter2BulletRunner=(s,rt)=>{
  if(!eq(s.type,151))return false;
  if(!s.made){
   const m=rt.create(manager,box(rt).x,rt.view.y);
   for(const k of ['damage','grazepoints','timepoints','inv','target'])if(s[k]!==-1)m[k]=s[k];
   if(s.grazed!==-1)m.grazed=0;if(s.grazetimer!==-1)m.grazetimer=0;m.creatorid=s.creatorid;m.creator=s.creator;m.element=s.element;
   m.variant=s.difficulty;m.damage=s.damage;rt.userEvent(m,0);s.made=true;
  }
  return true;
 };
 return {objects:[manager,sword1,sword2,slash,extraGraze],pattern};
}
