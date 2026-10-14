// K.Round's attacks: his leaps (obj_checkers_leap, four modes) and their shockwave bullets.
import {moveTowardsPoint,type GmObjectDef,type GmInstance,type GmRuntime} from '../../gm/runtime';
import {eq,ge,lt,pointDirection} from '../../gm/math';
import {monsterParent,collideBullet,regularBullet,heart,growtangle,shake,afterimage,damage} from '../../deltarune/battle';
import {checkersEnemy} from './enemy';

/** scr_afterimage copies the current sprite frame and motion-independent appearance. */
export function checkersAfterimage(s:GmInstance,rt:GmRuntime){
 const a=rt.create(afterimage,s.x,s.y);a.sprite=s.sprite;a.imageIndex=s.imageIndex;a.imageBlend=s.imageBlend;a.imageSpeed=0;
 a.depth=s.depth;a.imageXscale=s.imageXscale;a.imageYscale=s.imageYscale;a.imageAngle=s.imageAngle;return a;
}
const impact=(rt:GmRuntime)=>{rt.sound?.('snd_impact');rt.create(shake,0,0);};
const floor=(s:GmInstance,rt:GmRuntime)=>{const box=rt.first(growtangle)!;return box.y+rt.spriteHeight(box)/2-rt.spriteHeight(s);};
const stop=(s:GmInstance)=>{s.vspeed=0;s.gravity=0;s.hspeed=0;s.sprite='spr_checkers_crouch';};
const finish=(s:GmInstance,rt:GmRuntime)=>{rt.globals.turntimer=-1;for(const enemy of rt.all(checkersEnemy))enemy.visible=true;rt.destroy(s);};
const fade=(rt:GmRuntime)=>{for(const b of rt.all(regularBullet)){b.active=0;b.imageAlpha-=.1;}};

export const checkersLeap:GmObjectDef={name:'obj_checkers_leap',index:266,depth:1,parent:collideBullet,sprite:'spr_checkers_idle',events:{
 create:s=>{Object.assign(s,{jumpcon:0,jumptimer:0,s_timer:0,imageXscale:2,imageYscale:2,leapmode:0,active:1,imageSpeed:0,imageIndex:0,damage:100,grazed:0,grazepoints:6,timepoints:2,inv:120,grazetimer:0,target:0,boss:0,amt:0});},
 // Native User Event 5 calls scr_damage and keeps the giant, even when target is 3.
 user5:(s,rt)=>{if(s.active===1)damage(s,rt);},
 // Native Destroy immediately exits; it does not restore visibility or shorten turns.
 destroy:()=>{},
 step:(s,rt)=>{
  if(s.leapmode===0){
   if(s.jumpcon===1&&ge(s.vspeed,0)&&ge(s.y,floor(s,rt))){impact(rt);s.y=floor(s,rt);s.jumptimer=0;stop(s);s.jumpcon=0;}
   if(s.jumpcon===3&&ge(s.vspeed,0)&&ge(s.y,s.floory-2)){impact(rt);s.y=s.floory;s.x=s.xstart;stop(s);s.jumpcon=4;}
   if(s.jumpcon===0){s.sprite='spr_checkers_crouch';s.jumptimer+=1;s.jumpmax=s.amt>=1?10:20;
    if(s.jumptimer>=s.jumpmax){rt.sound?.('snd_jump');s.floory=s.y;s.jumptimer=0;s.jumpcon=1;s.amt+=1;s.sprite='spr_checkers_leap';
     s.targetx=rt.first(heart)!.x+8-rt.spriteWidth(s)/2;s.vspeed=s.amt===1?-17:-15;s.gravity=1;s.hspeed=(s.targetx-s.x)/28;
     if(s.amt>=4){s.active=0;s.jumpcon=3;s.targetx=s.xstart;s.gravity=2;s.hspeed=(s.targetx-s.x)/16;}
    }
   }
   if(s.jumpcon===4){s.jumptimer+=1;if(s.jumptimer>=10)finish(s,rt);}
  }
  if(s.leapmode===1){
   if(s.jumpcon===7){s.jumptimer+=1;if(s.jumptimer>=10)fade(rt);if(s.jumptimer>=20)finish(s,rt);}
   if(s.jumpcon===6&&ge(s.y,s.floory-2)){s.y=s.floory;s.x=s.xstart;stop(s);s.jumpcon=7;}
   if(s.jumpcon===0){s.sprite='spr_checkers_crouch';s.jumptimer+=1;if(s.jumptimer>=20){
    s.floory=s.y;s.jumptimer=0;s.jumpcon=1;s.sprite='spr_checkers_leap';s.targetx=rt.first(heart)!.x+8-rt.spriteWidth(s)/2;
    s.hspeed=(s.targetx-s.x)/17;s.vspeed=-17;rt.sound?.('snd_jump');s.gravity=1;s.amt+=1;
    if(s.amt>=3){s.active=0;s.jumpcon=6;s.targetx=s.xstart;s.gravity=2;s.hspeed=(s.targetx-s.x)/16;}
   }}
   if(s.jumpcon===1&&ge(s.vspeed,0)){s.gravity=0;s.vspeed=0;s.hspeed=0;s.jumpcon=2;rt.sound?.('snd_boost');}
   if(s.jumpcon===2){s.imageSpeed=.25;s.jumptimer+=1;if(s.jumptimer>=15){rt.sound?.('snd_ultraswing');s.imageSpeed=0;s.imageIndex=0;s.vspeed=32;s.jumpcon=3;s.jumptimer=0;}}
   if(s.jumpcon===3){checkersAfterimage(s,rt).imageAlpha=.7;if(ge(s.y,floor(s,rt))){
    s.shrapmax=6;impact(rt);for(s.i=0;s.i<s.shrapmax;s.i+=1){const box=rt.first(growtangle)!;
     const b=rt.create(regularBullet,s.x+rt.spriteWidth(s)/2-15+s.i*5,box.y+rt.spriteHeight(box)/2);s.shrap=b.id;
     b.imageXscale=1.5;b.imageYscale=1.5;b.direction=130-rt.random.random(10)-70*(s.i/(s.shrapmax-1));
     b.sprite='spr_checkershrapnel';b.speed=6+rt.random.random(1);b.gravity=.25;b.target=s.target;b.damage=s.damage;
    }
    s.y=floor(s,rt);stop(s);s.jumpcon=0;
   }}
  }
  if(s.leapmode===2){
   if(s.jumpcon===0){s.sprite='spr_checkers_magnificent';s.imageSpeed=.5;s.jumpcon=1;s.magamt=0;}
   if(s.jumpcon===1){if(eq(s.imageIndex,2))rt.sound?.('snd_ultraswing');if(ge(s.imageIndex,4)){s.imageIndex=4;s.imageSpeed=0;s.hspeed=-4;s.gravity=-.12;s.jumpcon=2;s.siner=0;}}
   if(s.jumpcon===2){s.siner+=1;s.y+=Math.sin(s.siner/3)*4;s.s_timer+=1;if(s.s_timer===20)rt.sound?.('snd_magicsprinkle');
    if(s.s_timer>=24){const b=rt.create(regularBullet,s.x+rt.random.random(rt.spriteWidth(s)/2),s.y+rt.spriteHeight(s)-50);s.bul=b.id;
     b.sprite='spr_checkershrapnel';b.vspeed=3;b.imageXscale=1.5;b.imageYscale=1.5;b.depth=s.depth+1;b.gravityDirection=135+rt.random.random(180);b.gravity=.06;b.target=s.target;b.damage=s.damage;
     if(s.magamt===6||s.magamt===12){b.gravity=0;const h=rt.first(heart)!;moveTowardsPoint(b,h.x+8,h.y+8,3);}s.s_timer=21;s.magamt+=1;
    }
    if(lt(s.y,rt.view.y-200)){s.speed=0;s.gravity=0;s.y=s.ystart-100;s.x=s.xstart+300;s.hspeed=-30;s.vspeed=10;s.jumpcon=3;}
   }
   if(s.jumpcon===3){s.magamt=0;s.jumptimer+=1;if(s.jumptimer>=10){impact(rt);s.amt+=1;s.s_timer=0;s.x=s.xstart;s.y=s.ystart;s.hspeed=0;s.vspeed=0;s.jumpcon=4;s.jumptimer=0;s.sprite='spr_checkers_idle';s.imageIndex=0;s.imageSpeed=0;}}
   if(s.jumpcon===4){s.jumptimer+=1;if(s.jumptimer>=20)fade(rt);if(s.jumptimer>=30)finish(s,rt);}
  }
  if(s.leapmode===3){
   for(const b of rt.all(regularBullet)){b.imageXscale+=.01;b.imageYscale+=.01;}
   if(s.jumpcon===0){s.sprite='spr_checkers_leg';s.imageIndex=0;s.imageSpeed=.5;s.jumpcon=1;}
   if(s.jumpcon===1){if(eq(s.imageIndex,3)){rt.sound?.('snd_swing');rt.sound?.('snd_magicsprinkle');for(s.i=0;s.i<4;s.i+=1){
    const b=rt.create(regularBullet,s.x-40,s.y+100);s.bul=b.id;b.sprite='spr_checkershrapnel';const h=rt.first(heart)!;
    b.direction=pointDirection(b.x,b.y,h.x+8,h.y+8)-10*s.i+rt.random.random(s.i*20);b.speed=3.5+rt.random.random(1.8);b.target=s.target;b.damage=s.damage;
   }}if(ge(s.imageIndex,5)){s.imageIndex=5;s.imageSpeed=0;s.jumpcon=2;}}
   if(s.jumpcon===2){s.jumptimer+=1;if(s.jumptimer>=10){s.sprite='spr_checkers_idle';s.imageIndex=0;}
    if(s.jumptimer>=20){s.jumptimer=0;s.jumpcon=0;s.amt+=1;if(s.amt>=4){s.jumpcon=3;s.jumptimer=0;}}
   }
   if(s.jumpcon===3){s.jumptimer+=1;if(s.jumptimer>=20)fade(rt);if(s.jumptimer>=30)finish(s,rt);}
  }
  if(s.leapmode===4){
   if(s.jumpcon===1&&ge(s.y,s.floory-2)){s.y=s.floory;stop(s);s.jumpcon=0;s.jumptimer=10;}
   if(s.jumpcon===3&&ge(s.y,s.floory-2)){s.y=s.floory;s.x=s.xstart;stop(s);s.jumpcon=4;}
   if(s.jumpcon===0){s.jumptimer+=1;if(s.jumptimer>=16){s.floory=s.y;s.jumptimer=0;s.jumpcon=1;s.sprite='spr_checkers_leap';s.targetx=rt.first(heart)!.x+8-rt.spriteWidth(s)/2;s.vspeed=-12;s.gravity=1;s.hspeed=(s.targetx-s.x)/24;s.amt+=1;
    if(s.amt>=4){s.active=0;s.jumpcon=3;s.jumptimer=0;s.targetx=s.xstart;s.gravity=2;s.hspeed=(s.targetx-s.x)/12;}
   }}
   if(s.jumpcon===4){s.jumptimer+=1;if(s.jumptimer>=10)finish(s,rt);}
  }
  if(s.grazed===1){s.grazetimer+=1;if(s.grazetimer>=10){s.grazetimer=0;s.grazed=0;}}
 },
}};

/** Enemy Step's attack creation branch; call only after its twelve-frame preparation. */
/** His leap for this turn (the four modes in turn), unless one is still under way; either way he leaves his place and
 * the turn counts. */
export function startCheckersAttack(s:GmInstance,rt:GmRuntime):GmInstance|undefined{
 let a:GmInstance|undefined;
 if(!rt.exists(checkersLeap)){
  if(!Number.isInteger(s.attacktype)||s.attacktype<0||s.attacktype>3)throw new Error('Unsupported K.Round attacktype');
  a=rt.create(checkersLeap,s.x,s.y);a.leapmode=[0,3,1,2][s.attacktype];a.target=s.mytarget;a.damage=rt.globals.monsterat[s.myself]*5;
  s.attacktype=(s.attacktype+1)%4;
 }
 s.siner=0;s.visible=false;s.turns+=1;return a;
}
/** The source crown arithmetic. Encounter 27's third ACT must launch the throw game. */
export function bowCrown(s:GmInstance,deep:boolean):number{
 if(deep&&s.secondtime===1)throw new Error('Second K.Round encounter requires the Ralsei throw ACT');
 s.crown+=deep?20:s.secondtime===1?18:15;return s.crown;
}
