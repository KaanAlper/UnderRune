import type {GmInstance,GmRuntime} from '../../gm/runtime';
import {eq,ge,gt,le,lt,round} from '../../gm/math';
import {snd} from '../../deltarune/sound';
import {KEY} from '../../deltarune/keys';
import type {GigaObjects} from './player';

/** Source Step's evade, jump, hurt and fist-particle states. Independent ifs intentionally cascade. */
export function stepGigaPlayerMotion(s:GmInstance,rt:GmRuntime,object:GigaObjects){
 const held=(key:number)=>rt.input.held.has(key);
 if(gt(s.dodgecon,0)){
  s.long_dodge=0;if(s.drawflip===0&&held(KEY.right))s.long_dodge=1;if(s.drawflip===1&&held(KEY.left))s.long_dodge=1;
  const dodgeSpeed=s.turboactive===1?2:1;
  if(s.dodgecon===1){s.x=s.basex;s.y=s.basey;s.imageIndex=4;if(s.drawflip===0)s.hspeed=18*s.f*dodgeSpeed;if(s.drawflip===1)s.hspeed=-18*s.f*dodgeSpeed;s.dodgetimer=0;s.dodgecon=2;}
  if(s.dodgecon===2){
   s.dodgetimer++;if(s.dodgetimer===1)s.dodging=1;
   if(ge(s.dodgetimer,16/s.f)&&s.turboactive===0)s.dodging=0;if(ge(s.dodgetimer,32/s.f)&&s.turboactive===1)s.dodging=0;
   if(dodgeSpeed===1)s.hspeed*=.6400000000000001;
   if(dodgeSpeed===2)for(let n=0;n<dodgeSpeed;n++)s.hspeed*=.698896;
   if(le(Math.abs(s.hspeed),5*s.f)&&s.long_dodge===0)s.dodgecon=3;if(le(Math.abs(s.hspeed),.2*s.f))s.dodgecon=3;
  }
  if(s.dodgecon===3){if(s.turboactive===0)s.dodging=0;s.x=round(s.x);s.dodgecon=4;}
  if(s.dodgecon===4){
   s.dodgetimer++;if(ge(s.dodgetimer,32/s.f)&&s.turboactive===1)s.dodging=0;
   if(s.drawflip===0){
    if(s.turboactive===1&&s.long_dodge===1)s.hspeed-=.1*s.f*dodgeSpeed;
    else{s.hspeed-=.5*s.f*dodgeSpeed;if(s.long_dodge===0)s.hspeed-=.3*s.f;}
    if(le(s.x,s.basex+8*s.f)){s.speed=0;s.x=s.basex;s.dodgecon=5;s.dodging=0;s.dodgetimer=0;}
   }
   if(s.drawflip===1){
    if(s.turboactive===1&&s.long_dodge===1)s.hspeed+=.1*s.f*dodgeSpeed;
    else{s.hspeed+=.5*s.f*dodgeSpeed;if(s.long_dodge===0)s.hspeed+=.3*s.f*dodgeSpeed;}
    if(ge(s.x,s.basex-8*s.f)){s.speed=0;s.x=s.basex;s.dodgecon=5;s.dodging=0;s.dodgetimer=0;}
   }
  }
  if(s.dodgecon===5)rt.userEvent(s,1);
 }
 if(gt(s.duckcon,0)){
  s.long_duck=0;if(held(KEY.down))s.long_duck=1;const duckSpeed=s.turboactive===1?2:1;
  if(s.duckcon===1){s.x=s.basex;s.y=s.basey;s.ducking=1;s.imageIndex=6;s.vspeed=5*s.f*duckSpeed;s.duckcon=2;}
  if(s.duckcon===2){
   for(let n=0;n<duckSpeed;n++)s.vspeed*=.81;
   if(le(Math.abs(s.vspeed),s.f)&&s.long_duck===0)s.duckcon=3;
   if(le(Math.abs(s.vspeed),6*s.f)&&s.long_duck===0&&s.turboactive===1)s.duckcon=3;
   if(le(Math.abs(s.vspeed),.3*s.f))s.duckcon=3;
  }
  if(s.duckcon===3){s.y=round(s.y);s.duckcon=4;s.ducktimer=0;}
  if(s.duckcon===4){
   s.ducktimer++;if(ge(s.ducktimer,6/s.f)&&s.turboactive===0)s.ducking=0;if(ge(s.ducktimer,12/s.f)&&s.turboactive===1)s.ducking=0;
   if(s.turboactive===1&&s.long_duck===1)s.vspeed-=.05*s.f;else s.vspeed-=.5*s.f*duckSpeed;
   if(le(s.y,s.basey+6*s.f)){s.speed=0;s.y=s.basey;s.duckcon=5;}
  }
  if(s.duckcon===5)rt.userEvent(s,1);
 }
 if(gt(s.jumpcon,0)){
  s.long_jump=0;if(held(KEY.up))s.long_jump=1;
  // Source tests long_jump == 2 despite only assigning 0 and 1. Keep the dormant paths.
  if(s.jumpcon===1&&s.long_jump===2){s.x=s.basex;s.y=s.basey;s.jumping=1;s.imageIndex=5;s.vspeed=-5;s.jumpcon=2;}
  if(s.jumpcon===2&&s.long_jump===2){s.vspeed*=.9;if(ge(s.vspeed,-1)&&s.long_jump===0)s.jumpcon=3;if(ge(s.vspeed,-.5))s.jumpcon=3;}
  if(s.jumpcon===1){s.x=s.basex;s.y=s.basey;s.jumping=1;s.imageIndex=5;s.vspeed=-7;s.jumpcon=2;}
  if(s.jumpcon===2){s.vspeed+=.3;if(s.long_jump===0)s.vspeed+=.2;if(gt(s.vspeed,0)&&ge(s.y,s.basey-6)){s.speed=0;s.y=s.basey;s.jumpcon=3;}}
  if(s.jumpcon===3){s.y=round(s.y);s.jumpcon=4;s.jumptimer=0;}
  if(s.jumpcon===4){s.vspeed+=.5;if(ge(s.y,s.basey-6)){s.speed=0;s.y=s.basey;s.jumpcon=5;}}
  if(s.jumpcon===5){s.jumping=0;rt.userEvent(s,1);}
 }
 if(gt(s.hurtcon,0)){
  if(s.hurtcon===1){for(const sound of ['snd_hurt1','snd_punchmed','snd_metalhit'])snd(rt,s.arcade?`${sound}_bc`:sound);s.imageIndex=7;s.vspeed=5*s.f;s.friction=s.f;s.hspeed=s.drawflip===0?3*s.f:-3*s.f;s.hurtcon=2;}
  if(s.hurtcon===2){s.hurttimer++;if(ge(s.hurttimer,s.hurt_length)){s.speed=0;s.friction=0;rt.userEvent(s,1);}}
 }
 if(ge(s.specialcon,1))s.imageIndex=1;
 if(s.swordactive===0){
  if(lt(s.imagefisty[Math.floor(s.imageIndex)],0)){
   s.flametimer++;
   if(s.flameactive===1&&ge(s.flametimer,3)){
    s.flametimer=0;s.flippo=1;if(s.drawflip===1)s.flippo=-1;
    const flame=rt.create(object('o_boxingflame'),s.x+s.imagefistx[Math.floor(s.imageIndex)]*s.flippo,s.y+s.imagefisty[Math.floor(s.imageIndex)]);s.flame=flame.id;flame.direction=rt.random.random(360);flame.speed=2;flame.friction=.1;
   }
   if(s.flamepunch===1){
    s.flippo=1;if(s.drawflip===1)s.flippo=-1;s.randdir=rt.random.random(360);
    for(s.i=0;s.i<8;s.i++){const flame=rt.create(object('o_boxingflame'),s.x+s.imagefistx[Math.floor(s.imageIndex)]*s.flippo,s.y+s.imagefisty[Math.floor(s.imageIndex)]);s.flame=flame.id;flame.direction=s.randdir+s.i*45;flame.speed=6;flame.friction=.2;}
    s.flamepunch=0;s.flametimer=-10;
   }
  }
  if(lt(s.imagefisty[Math.floor(s.imageIndex)],0)){
   s.lasertimer++;
   if(s.laseractive===1&&ge(s.lasertimer,3)){
    s.lasertimer=0;s.flippo=1;if(s.drawflip===1)s.flippo=-1;
    const flame=rt.create(object('o_boxingflame'),s.x+s.imagefistx[Math.floor(s.imageIndex)]*s.flippo,s.y+s.imagefisty[Math.floor(s.imageIndex)]);s.flame=flame.id;flame.direction=rt.random.random(360);flame.speed=2;flame.friction=.1;flame.sprite='spr_boxing_laser_square';flame.dustmode=1;
   }
   if(s.laserpunch===1){
    s.flippo=1;if(s.drawflip===1)s.flippo=-1;s.randdir=rt.random.random(360);
    for(s.i=0;s.i<8;s.i++){const flame=rt.create(object('o_boxingflame'),s.x+s.imagefistx[Math.floor(s.imageIndex)]*s.flippo,s.y+s.imagefisty[Math.floor(s.imageIndex)]);s.flame=flame.id;flame.direction=s.randdir+s.i*45;flame.speed=6;flame.friction=.2;flame.sprite='spr_boxing_laser_square';flame.dustmode=1;}
    s.laserpunch=0;s.lasertimer=-10;
   }
  }
 }
}
