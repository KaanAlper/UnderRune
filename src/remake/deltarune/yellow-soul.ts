// The yellow soul (Chapter 2's obj_heart with color 1): Z fires shots (three at most), holding Z charges a BIG SHOT
// that fires on release. It is the heart's soul mode for color 1 (scr_heartcolor); the heart itself is battle.ts's.
// What a shot does when it hits something belongs to what it hits (its collision with obj_yheart_shot). Where the
// original names an object here (NEO's upgraded and super-charged shots, his face attack's bell, his final form's
// pull), that object declares a hook (rules.ts).
import type {GmInstance,GmObjectDef,GmRuntime} from '../gm/runtime';
import {C} from '../gm/graphics';
import {pointDirection} from '../gm/math';
import {button1_h,button1_p,button1_r} from './keys';
import {snd} from './sound';
import {withHook} from './rules';

const superCharged=(rt:GmRuntime)=>withHook(rt,'superCharged').some(([e,h])=>h(e,rt));

/** obj_yheart_shot: flies right; a BIG SHOT grows to full size. Leaving the view destroys it. */
export const yellowShot:GmObjectDef={name:'obj_yheart_shot',index:596,sprite:'spr_yheart_shot',events:{
 create:(s,rt)=>{
  Object.assign(s,{f:2,makeanim:1,big:0,damage:1,sucked:0,trail:0,trail_timer:0});s.hspeed=8*s.f;
  if(withHook(rt,'upgradedShot').some(([e,h])=>h(e,rt))){
   s.big=1;s.sprite='spr_yheart_bigshot';s.hspeed=9;s.friction=-0.4;s.imageAlpha=0.5;s.imageXscale=0.1;s.imageYscale=2;s.imageIndex=0;s.damage=4;
  }
 },
 step:(s,rt)=>{
  if(s.big===1){
   s.damage=4;s.imageAlpha+=0.1*s.f;
   if(s.imageXscale<1)s.imageXscale+=0.1*s.f;
   if(s.imageYscale>1)s.imageYscale-=0.1*s.f;
  }
  if(s.x>=rt.view.x+700)rt.destroy(s);
  if(s.y>=rt.view.y+520)rt.destroy(s);
  if(s.y<=rt.view.y-40)rt.destroy(s);
  if(s.x>=rt.view.x+500&&s.x<rt.view.x+530&&withHook(rt,'ringsShots').some(([e,h])=>h(e,rt))){rt.userEvent(s,0);snd(rt,'snd_bell');}
  if(s.sucked===1){
   const to=pullPoint(rt);
   if(to){
    if(s.y<to[1])s.y+=1;
    if(s.y>to[1])s.y-=1;
    s.direction=pointDirection(s.x,s.y,to[0],to[1]);s.gravityDirection=pointDirection(s.x,s.y,to[0],to[1]);
   }
  }
  if(s.trail===1){
   s.trail_timer+=1;
   if(s.trail_timer===2){
    s.trail_timer=0;
    const a=rt.create(shotAfterimage,s.x-10,s.y);s.after=a.id;
    a.imageSpeed=0;a.sprite='spr_yheart_bigshot_trail';a.imageXscale=0.8;a.imageYscale=0.5;a.imageIndex=s.imageIndex;a.speed=0;a.friction=0;a.depth=s.depth;a.direction=180;
   }
  }
 },
 // Event 0: it hits something (with its burst, in front of the soul).
 user0:(s,rt)=>{
  if(s.makeanim){
   const a=rt.create(shotHit,s.x,s.y);s.myanim=a.id;a.sprite='spr_yheart_shot_hit';
   if(s.big===1){a.imageXscale=3;a.imageYscale=3;}
   const h=rt.instances.find(i=>i.live&&i.object.name==='obj_heart');if(h)a.depth=h.depth-100;
  }
  rt.destroy(s);
 },
 // Event 1: it is stopped without effect.
 user1:(s,rt)=>{const a=rt.create(shotHit,s.x,s.y);s.myanim=a.id;a.sprite='spr_yheart_shot_hit_noeffect';rt.destroy(s);},
 // Event 2: something pulls it in.
 user2:(s,rt)=>{
  if(s.sucked!==0)return;
  const to=pullPoint(rt)!;
  s.sucked=1;s.direction=pointDirection(s.x,s.y,to[0],to[1]);s.gravityDirection=pointDirection(s.x,s.y,to[0],to[1]);
  s.hspeed=0;s.speed=3.5;s.friction=0;s.gravity=0.3;
 },
}};
const pullPoint=(rt:GmRuntime)=>{for(const [e,h] of withHook(rt,'pullsShots')){const p=h(e,rt);if(p)return p;}return undefined;};
/** obj_yheart_shot_afterimage: a BIG SHOT's trail piece. */
export const shotAfterimage:GmObjectDef={name:'obj_yheart_shot_afterimage',index:609,events:{
 step:(s,rt)=>{s.imageAlpha-=0.1;if(s.imageAlpha<0)rt.destroy(s);},
}};
/** obj_yshot_anim: the burst where a shot hits. */
export const shotHit:GmObjectDef={name:'obj_yshot_anim',index:602,sprite:'spr_yheart_shot_hit',events:{
 create:s=>{s.f=2;s.imageSpeed=0.25*s.f;},
 step:(s,rt)=>{if(s.imageIndex>(rt.bank.get(s.sprite!)?.frames??1)-1)rt.destroy(s);},
}};
/** obj_supercharge_end: the flash when the last super-charged shot is fired. */
export const superchargeEnd:GmObjectDef={name:'obj_supercharge_end',index:611,sprite:'spr_supercharge_end',events:{
 create:s=>{s.imageSpeed=0.5;s.timer=0;s.imageXscale=1.5;s.imageYscale=1.5;},
 // Its Draw only times it out (it draws nothing itself), and its animation end does nothing.
 draw:(s,rt)=>{s.timer+=1;if(s.timer===16)rt.destroy(s);if(s.timer>=96)rt.destroy(s);},
 animationEnd:()=>{},
}};
/** obj_yheart_sneo_particle: the sparks of a super-charged shot (or of a shot hitting NEO's head). */
export const soulSpark:GmObjectDef={name:'obj_yheart_sneo_particle',index:610,sprite:'spr_yheart_charge',events:{
 create:(s,rt)=>{s.imageXscale=1+rt.random.random(2);s.imageYscale=1+rt.random.random(2);s.timer=0;},
 step:(s,rt)=>{
  s.timer+=1;s.imageXscale=s.imageXscale+(0-s.imageXscale)*(s.timer/20);s.imageYscale=s.imageYscale+(0-s.imageYscale)*(s.timer/20);
  if(s.timer===20)rt.destroy(s);
 },
}};

/** The yellow soul mode: the end of the heart's Step (shots, the charge, the BIG SHOT) and what Draw adds. */
export const yellowSoul={
 step(s:GmInstance,rt:GmRuntime){
  s.wspeed=5;
  if(s.chargeshot_delay>0)s.chargeshot_delay-=1;
  if(button1_p(rt)||(s.z_hold>=10&&s.z_hold<=39&&button1_r(rt))){
   if(rt.count(yellowShot)<3&&s.chargeshot_delay===0){rt.create(yellowShot,s.x+10,s.y+10);snd(rt,'snd_heartshot_dr_b');}
  }
  if(s.z_hold===20){
   s.chargeshot_sound=rt.soundLoop?.('snd_chargeshot_charge')??-1;rt.soundPitch?.(s.chargeshot_sound,0.1);
   rt.sourceAudio?.volume(s.chargeshot_sound,0,0);rt.sourceAudio?.volume(s.chargeshot_sound,0.3,20);
  }
  if(s.z_hold>=20&&s.z_hold<40)rt.soundPitch?.(s.chargeshot_sound,0.1+(s.z_hold-20)/20);
  if(s.z_hold>=40)s.imageIndex=2;
  if(s.z_charge<15)s.chargeshotcount=0;
  if(s.z_hold>=40&&button1_r(rt)){
   rt.soundStop?.(s.chargeshot_sound);snd(rt,'snd_chargeshot_fire');
   const big=rt.create(yellowShot,s.x+10,s.y+10);s.bigshot=big.id;
   big.big=1;big.sprite='spr_yheart_bigshot';big.hspeed=4*s.f;big.friction=-0.2*s.f;big.imageAlpha=0.5;big.imageXscale=0.1;big.imageYscale=2;
   s.z_hold=0;s.chargeshot_delay=5;s.imageIndex=0;s.chargeshotcount+=1;
   for(const [e,h] of withHook(rt,'onBigShot'))h(e,big,s,rt);
  }
  if(button1_h(rt)){if(superCharged(rt))s.z_hold_f+=1;s.z_hold_f+=1;}
  else{s.z_hold_f=0;rt.soundStop?.(s.chargeshot_sound);}
  s.z_hold=s.z_hold_f*2;
 },
 draw(s:GmInstance,rt:GmRuntime){
  s.z_charge_nolimit=s.z_hold-35;
  if(s.z_charge_nolimit>=0){
   let scale=Math.abs(Math.sin(s.z_charge_nolimit/10));
   rt.drawSprite(s.sprite,0,s.x-scale*10,s.y-scale*10,1+scale,1+scale,s.imageAngle,s.imageBlend,0.3);
   scale=Math.abs(Math.sin(s.z_charge_nolimit/14));
   rt.drawSprite(s.sprite,0,s.x-2-scale*10,s.y-2-scale*10,1.2+scale,1.2+scale,s.imageAngle,s.imageBlend,0.3);
  }
  if(s.z_hold>=15){
   s.z_charge=Math.min(s.z_hold-15,35);
   for(let i=0;i<4;i++){
    s.rotx=i*90+s.z_charge*5;s.xx=Math.sin(s.rotx*Math.PI/180)*(35-s.z_charge);s.yy=Math.cos(s.rotx*Math.PI/180)*(35-s.z_charge);
    rt.drawSprite('spr_yheart_charge',0,s.x+9-s.xx,s.y+10-s.yy,4-s.z_charge*2/35,4-s.z_charge*2/35,0,C.white,s.z_charge/5);
   }
  }
  if(superCharged(rt)){
   s.superchargetimer+=1;
   let scale=Math.abs(Math.sin(s.superchargetimer/10));
   rt.drawSprite(s.sprite,0,s.x-scale*10,s.y-scale*10,1+scale,1+scale,s.imageAngle,C.orange,0.5);
   scale=Math.abs(Math.sin(s.z_charge_nolimit/14));
   rt.drawSprite(s.sprite,0,s.x-2-scale*10,s.y-2-scale*10,1.2+scale,1.2+scale,s.imageAngle,C.orange,0.5);
  }
 },
};
