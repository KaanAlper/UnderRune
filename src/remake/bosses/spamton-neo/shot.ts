// Chapter 2's obj_yheart_shot, its two effects, and receiving-object shot handlers.
// There is no parent or collision event on the projectile itself. Targets install the
// handlers below on their own definitions; this module does not create placeholder bosses.
import {resolveEvent,type GmCollision,type GmInstance,type GmObjectDef,type GmRuntime} from '../../gm/runtime';
import {eq,ge,gt,le,lt,pointDirection} from '../../gm/math';

export interface NeoProjectileDependencies{
 neo:GmObjectDef;heart:GmObjectDef;faceAttack:GmObjectDef;finalForm:GmObjectDef;wireheart:GmObjectDef;
}
type ShotCollision=GmCollision['run'];
const required=(rt:GmRuntime,def:GmObjectDef)=>{
 const s=rt.first(def);if(!s)throw Error(`Spamton NEO source requires ${def.name}`);return s;
};
function requiredUser(s:GmInstance,rt:GmRuntime,n:number){
 const h=resolveEvent(s.object,`user${n}`);if(!h)throw Error(`${s.object.name} requires source user${n}`);h(s,rt);
}

/** Must receive the actual battle definitions, including the source wireheart group. */
export function createNeoProjectiles(deps:NeoProjectileDependencies){
 for(const key of ['neo','heart','faceAttack','finalForm','wireheart'] as const)if(!deps[key])throw Error(`Spamton NEO projectiles require ${key}`);
 const impact:GmObjectDef={name:'obj_yshot_anim',index:602,sprite:'spr_yheart_shot_hit',events:{
  create:s=>{s.f=2;s.imageSpeed=.25*s.f;},
  step:(s,rt)=>{if(gt(s.imageIndex,(s.sprite?rt.bank.get(s.sprite)?.frames??0:0)-1))rt.destroy(s);},
 }};
 const trail:GmObjectDef={name:'obj_yheart_shot_afterimage',index:609,events:{
  step:(s,rt)=>{s.imageAlpha-=.1;if(lt(s.imageAlpha,0))rt.destroy(s);},
 }};
 const shot:GmObjectDef={name:'obj_yheart_shot',index:596,sprite:'spr_yheart_shot',events:{
  create:(s,rt)=>{
   Object.assign(s,{f:2,makeanim:1,big:0,damage:1,sucked:0,trail:0,trail_timer:0});s.hspeed=8*s.f;
   const neo=rt.first(deps.neo);
   if(neo&&gt(neo.upgrade,0)){
    s.big=1;s.sprite='spr_yheart_bigshot';s.hspeed=9;s.friction=-.4;s.imageAlpha=.5;s.imageXscale=.1;s.imageYscale=2;s.imageIndex=0;s.damage=4;
    if(eq(rt.globals.chapter,2)&&rt.exists(deps.neo))neo.bigshotused=1;
   }
  },
  step:(s,rt)=>{
   if(eq(s.big,1)){
    s.damage=4;s.imageAlpha+=.1*s.f;
    if(lt(s.imageXscale,1))s.imageXscale+=.1*s.f;
    if(gt(s.imageYscale,1))s.imageYscale-=.1*s.f;
   }
   if(ge(s.x,rt.view.x+700))rt.destroy(s);
   if(ge(s.y,rt.view.y+520))rt.destroy(s);
   if(le(s.y,rt.view.y-40))rt.destroy(s);
   const face=rt.first(deps.faceAttack);
   if(ge(s.x,rt.view.x+500)&&lt(s.x,rt.view.x+530)&&face&&eq(face.init,1)){
    rt.userEvent(s,0);rt.sound?.('snd_bell');
   }
   const form=rt.first(deps.finalForm);
   if(eq(s.sucked,1)&&form){
    // Both independent conditions run. A fractional overshoot can immediately be undone.
    if(lt(s.y,form.y+146))s.y++;
    if(gt(s.y,form.y+146))s.y--;
    s.direction=pointDirection(s.x,s.y,form.x+122,form.y+146);
    s.gravityDirection=pointDirection(s.x,s.y,form.x+122,form.y+146);
   }
   if(eq(s.trail,1)){
    s.trail_timer++;
    if(eq(s.trail_timer,2)){
     s.trail_timer=0;const a=rt.create(trail,s.x-10,s.y);s.after=a.id;
     a.imageSpeed=0;a.sprite='spr_yheart_bigshot_trail';a.imageXscale=.8;a.imageYscale=.5;a.imageIndex=s.imageIndex;a.speed=0;a.friction=0;a.depth=s.depth;a.direction=180;
    }
   }
  },
  user0:(s,rt)=>{
   if(s.makeanim){
    const a=rt.create(impact,s.x,s.y);s.myanim=a.id;a.sprite='spr_yheart_shot_hit';
    if(eq(s.big,1)){a.imageXscale=3;a.imageYscale=3;}
    const h=rt.first(deps.heart);if(h)a.depth=h.depth-100;
   }
   rt.destroy(s);
  },
  user1:(s,rt)=>{const a=rt.create(impact,s.x,s.y);s.myanim=a.id;a.sprite='spr_yheart_shot_hit_noeffect';rt.destroy(s);},
  user2:(s,rt)=>{
   if(eq(s.sucked,0)){
    s.sucked=1;const form=required(rt,deps.finalForm);
    s.direction=pointDirection(s.x,s.y,form.x+122,form.y+146);
    s.gravityDirection=pointDirection(s.x,s.y,form.x+122,form.y+146);
    s.hspeed=0;s.speed=3.5;s.friction=0;s.gravity=.3;
   }
  },
 }};
 /** Identical source handler on obj_basicbullet_sneo and obj_basicbullet_sneo_finale. */
 const basicBullet:ShotCollision=(s,other,rt)=>{
  if(eq(s.destroyable,1)){
   if(eq(other.big,0))rt.userEvent(other,0);
   const a=rt.create(impact,s.x,s.y);s.anim=a.id;a.imageXscale=s.imageXscale;a.imageYscale=s.imageYscale;a.sprite='spr_yheart_shot_hit3';rt.destroy(s);
  }else if(eq(s.destroyable,-1))rt.userEvent(other,0);
 };
 const flyingHead:ShotCollision=(s,other,rt)=>{
  s.hitshot=other.id;requiredUser(s,rt,0);
  // scr_tensionheal is byte-for-byte identical between Chapters 1 and 2, but kept
  // here with gm/math comparisons rather than importing the larger ch1 hierarchy.
  const g=rt.globals;g.tension+=eq(required(rt,deps.neo).difficulty,3)?1:1.3;if(gt(g.tension,g.maxtension))g.tension=g.maxtension;
 };
 const wireheart:ShotCollision=(s,other,rt)=>{
  if(gt(s.invincibility_timer,0)&&eq(other.big,0)){rt.destroy(other);return;}
  s.invincibility_timer=10;const g=rt.globals;
  if(lt(g.turntimer,150)){
   s.hp=0;
   if(eq(s.type,0)||(eq(s.type,1)&&gt(required(rt,deps.neo).difficulty,2)&&gt(g.turntimer,20))){
    g.turntimer=20;for(const w of rt.all(deps.wireheart)){w.hp=0;w.destroyed=1;}
   }
  }else{
   if(eq(s.type,0)||(eq(s.type,1)&&gt(required(rt,deps.neo).difficulty,2))){
    if(eq(other.big,1)){g.turntimer-=80-s.chargeshothitcount*10;if(lt(s.chargeshothitcount,3))s.chargeshothitcount++;}
    else{g.turntimer-=20-s.normalshothitcount;if(lt(s.normalshothitcount,10))s.normalshothitcount++;}
   }else if(eq(other.big,1))s.hp-=5;else s.hp--;
  }
  rt.destroy(other);s.damagetimer=5;rt.sound?.('snd_damage');if(le(s.hp,0))s.destroyed=1;
 };
 const facePart:ShotCollision=(s,other,rt)=>{
  if(eq(s.type,0)||lt(s.imageAlpha,.9))return;
  if(eq(s.broken,1)){rt.sound?.('snd_bell');rt.userEvent(other,0);return;}
  if(gt(s.invincibilitytimer,0)&&eq(other.big,0)){rt.destroy(other);return;}
  s.shake=6;const neo=required(rt,deps.neo);
  const amount=eq(other.big,0)?1:eq(neo.hellmode,1)?2:4;
  if(eq(s.type,1))neo.eyeshp-=amount;if(eq(s.type,2))neo.nosehp-=amount;if(eq(s.type,3))neo.mouthhp-=amount;
  rt.sound?.('snd_damage');s.invincibilitytimer=10;s.hurtflashtimer=3;
  if((eq(s.type,1)&&le(neo.eyeshp,0))||(eq(s.type,2)&&le(neo.nosehp,0))||(eq(s.type,3)&&le(neo.mouthhp,0))){
   s.broken=1;s.imageIndex=2;rt.sound?.('snd_rocket');s.explodetimer=16;
  }
  rt.userEvent(other,0);
 };
 // Source Collision_obj_yheart_shot begins with `exit;`. Unreachable damage/mercy code stays unreachable.
 const hitDetector:ShotCollision=()=>{};
 return {shot,impact,trail,collisions:{basicBullet,flyingHead,wireheart,facePart,hitDetector}};
}
