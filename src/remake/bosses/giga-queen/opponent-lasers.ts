import {eq,ge,gt,le,lt} from '../../gm/math';
import {moveTowardsPoint} from '../../gm/runtime';
import type {OpponentContext} from './opponent';
export function stepGigaLasers(c:OpponentContext){const {s,rt}=c,f=s.f;
 if(s.attackcon===0){s.vertical_laser_amount=3;s.horizontal_laser_amount=2;if(s.punch_type===1)s.horizontal_laser_amount=4;s.blocking=-1;s.sprite='spr_bqueen_splash';s.imageIndex=0;s.invincible_l=1;s.invincible_r=1;s.rand_fix=0;if(s.drawflip===0){s.ff=-1;s.hspeed=-4;s.vspeed=-5;}if(s.drawflip===1){s.ff=1;s.hspeed=4;s.vspeed=-5;}s.attacktimer=0;s.attackcon=1;}
 if(s.attackcon===1){s.attacktimer++;if(eq(s.attacktimer,10/f))s.speed=0;if(eq(s.attacktimer,30/f)){if(s.ff===-1){s.hspeed=2;s.vspeed=-6;s.drawflip=1;}else{s.hspeed=-2;s.vspeed=-6;s.drawflip=0;}}
  if(ge(s.attacktimer,40/f)&&le(s.attacktimer,50/f))s.speed=0;if(eq(s.attacktimer,50/f))s.sprite='spr_bqueen_laser_down';if(eq(s.attacktimer,70/f)){s.sprite='spr_bqueen_laser_down_flash';c.flash();s.sprite='spr_bqueen_laser_down';}if(eq(s.attacktimer,80/f)){s.vertical_laser_amount--;s.sprite='spr_bqueen_laser_down';s.imageIndex=0;s.vspeed=-0.5;c.make('obj_bq_laser_circle',s.x-7,s.y-37);}if(gt(s.attacktimer,80/f)&&lt(s.attacktimer,110/f))s.vspeed=-0.2;if(ge(s.attacktimer,110/f)&&le(s.attacktimer,130/f)){s.speed=0;s.imageIndex=0;s.attacktimer=80;}
  if(eq(s.attacktimer,160/f)){let rand=rt.random.irandom(30);if(s.rand_fix===1)rand=10+rt.random.irandom(20);else if(s.rand_fix===2){rand=20+rt.random.irandom(20);if(gt(rand,30))rand=5;}else if(s.rand_fix===3)rand=rt.random.irandom(20);
   if(s.rand_fix!==0){if(lt(rand,10)){s.hspeed=-20*f;if(gt(s.x,360))s.hspeed=-40*f;}else if(ge(rand,10)&&lt(rand,20)){s.hspeed=20*f;if(lt(s.x,280))s.hspeed=40*f;}else if(ge(rand,20)){s.hspeed=-20*f;if(lt(s.x,320))s.hspeed=20*f;}}
   else if(lt(rand,10)){s.rand_fix=1;s.hspeed=-20*f;s.vspeed=2*f;}else if(ge(rand,10)&&lt(rand,20)){s.rand_fix=2;s.hspeed=20*f;s.vspeed=2*f;}else if(gt(rand,20)){s.rand_fix=3;s.vspeed=3*f;}
  }
  if(ge(s.attacktimer,160/f)&&le(s.attacktimer,166/f)&&s.hspeed!==0)afterimage(c,0.1);
  if(eq(s.attacktimer,166/f)){s.speed=0;s.attacktimer=gt(s.vertical_laser_amount,1)?24:83;}
  if(eq(s.attacktimer,170/f))s.sprite='spr_bqueen_laser_down';if(eq(s.attacktimer,190/f)){s.sprite='spr_bqueen_laser_down_flash';c.flash();s.sprite='spr_bqueen_laser_down';}if(eq(s.attacktimer,200/f)){s.sprite='spr_bqueen_laser_down';s.imageIndex=0;s.vspeed=-0.5;c.make('obj_bq_laser_circle',s.x-7,s.y-37);}if(gt(s.attacktimer,200/f)&&lt(s.attacktimer,260/f))s.vspeed=-0.2;if(eq(s.attacktimer,260/f)){s.speed=0;s.sprite='spr_bqueen_splash';s.imageIndex=0;s.attacktimer=140;}
  if(eq(s.attacktimer,280/f)){const rand=rt.random.irandom(20);if(lt(rand,10)){s.ff=-1;moveTowardsPoint(s,60,415,70);s.drawflip=0;}else{s.ff=1;moveTowardsPoint(s,580,415,70);s.drawflip=1;}}
  if((ge(s.attacktimer,280/f)&&le(s.attacktimer,400/f)&&s.hspeed!==0)||(ge(s.attacktimer,280/f)&&s.vspeed!==0)){rt.random.irandom(20);if(s.ff===-1&&lt(s.x,60)){s.hspeed=0;s.x=60;}if(s.ff===1&&gt(s.x,580)){s.hspeed=0;s.x=580;}if(gt(s.y,415)){s.vspeed=0;s.y=415;}afterimage(c,0.4);s.attacktimer=320/f;}
  if(eq(s.attacktimer,320/f)&&s.vspeed===0&&s.hspeed===0){c.flash();s.attacktimer=328/f;}
  if(eq(s.attacktimer,330/f)&&s.vspeed===0&&s.hspeed===0){s.sprite='spr_bqueen_laser_side';s.imageIndex=0;s.drawflip=s.ff===1?0:1;c.make('obj_bq_laser_horizontal_telegraph',s.x,s.y);}
  if(ge(s.attacktimer,330/f)&&lt(s.attacktimer,374/f)&&!c.exists('obj_bq_laser_horizontal_telegraph')&&!c.exists('obj_bq_laser_circle')){const a=c.make('obj_bq_laser_circle',s.x,s.y);s.circle=a.id;a.horizontal=1;s.horizontal_laser_amount--;s.attacktimer=430/f;}
  if(eq(s.attacktimer,450/f)){s.sprite='spr_bqueen_laugh';s.imageIndex+=0.2;if(rt.paths.exists(s.path))rt.paths.delete(s.path);const endX=lt(s.x,320)?580:60;s.path=rt.paths.add();rt.paths.setKind(s.path,1);rt.paths.setClosed(s.path,false);rt.paths.addPoint(s.path,s.x,s.y,100);rt.paths.addPoint(s.path,320,300,100);rt.paths.addPoint(s.path,endX,s.y,100);rt.paths.start(s,s.path,40,0,true);s.makedizzy=150/f;}
  if(gt(s.attacktimer,450/f)&&lt(s.attacktimer,496/f)){s.blocking=-1;if(gt(s.x,260)&&lt(s.x,380)){s.invincible_l=0;s.invincible_r=0;}else{s.invincible_l=1;s.invincible_r=1;}}
  if(gt(s.attacktimer,470/f)&&lt(s.attacktimer,496/f)&&s.path_index===-1){if(lt(s.x,70)&&s.path_index===-1){s.hspeed=0;s.x=60;s.sprite='spr_bqueen_laser_side';s.imageIndex=0;s.drawflip=lt(s.x,320)?1:0;s.attacktimer=496/f;}if(gt(s.x,570)&&s.path_index===-1){s.hspeed=0;s.x=580;s.sprite='spr_bqueen_laser_side';s.imageIndex=0;s.drawflip=lt(s.x,320)?1:0;s.attacktimer=496/f;}}
  if(eq(s.attacktimer,496/f))c.make('obj_bq_laser_horizontal_telegraph',s.x,s.y);
  if(ge(s.attacktimer,496/f)&&lt(s.attacktimer,545/f)&&!c.exists('obj_bq_laser_horizontal_telegraph')&&!c.exists('obj_bq_laser_circle')){const a=c.make('obj_bq_laser_circle',s.x,s.y);s.circle=a.id;a.horizontal=1;s.horizontal_laser_amount--;if(gt(s.horizontal_laser_amount,0))s.attacktimer=430/f;}
  if(eq(s.attacktimer,570/f))s.hspeed=lt(s.x,320)?-20:20;if(eq(s.attacktimer,576/f)){s.attackcon=3;s.attacktimer=0;}
 }
 if(s.attackcon===3){s.y=s.basey;if(gt(s.hspeed,0)){s.x=-20;s.hspeed=24*f;}if(lt(s.hspeed,0)){s.x=660;s.hspeed=-24*f;}s.vspeed=0;s.depth=s.original_depth;s.attack_succeeded=1;s.attackcon=4;}
 if(s.attackcon===4){if(ge(s.x,s.basex-60)){s.makedizzy=200/f;s.invincible_l=0;s.invincible_r=0;s.blocking=-1;}if(ge(s.x,s.basex-10)&&le(s.x,s.basex+10)){s.makedizzy=200/f;s.vspeed=0;s.hspeed=0;s.imageSpeed=0;s.imageIndex=0;s.sprite='spr_bqueen_leggy';s.x=s.basex;s.invincible_l=0;s.invincible_r=0;s.blocking=-1;s.attacktimer=0;s.attackcon=5;}}
 if(s.attackcon===5){s.attacktimer++;if(ge(s.attacktimer,45/f-s.attack_succeeded*45/f)){s.speed=0;s.imageIndex=0;s.imageSpeed=0;s.attackcon=0;s.attack_succeeded=0;c.idle();}}
}
function afterimage(c:OpponentContext,rate:number){const {s}=c,a=c.make('o_afterimage',s.x,s.y);s.afterimage=a.id;a.sprite=s.sprite;a.hasboss=0;a.rate=rate;a.imageXscale=-2;if(s.drawflip===0)a.imageXscale=2;a.imageYscale=2;}
