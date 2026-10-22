import type {GmInstance,GmRuntime} from '../../gm/runtime';
import {eq,ge,gt,le,lt} from '../../gm/math';
import {tensionHeal} from '../../deltarune/battle';
import {snd} from '../../deltarune/sound';
import {gigaRequired,type GigaObjects} from './player';
import {movePrecise} from './motion';

/** Source punch state machine, including the reaction written into the opponent by the hit. */
export function punchGigaQueen(s:GmInstance,rt:GmRuntime,object:GigaObjects){
 const q=gigaRequired(rt,object('o_boxingqueen')),e=rt.first(object('obj_gigaqueen_enemy')),h=gigaRequired(rt,object('o_boxinghud')),g=rt.globals;
 let arcadeEnd=0;
 if(gt(q.phase_transition,0)&&s.wireframe_boxing===1&&s.punchcon===1){s.buffer_z=0;s.buffer_x=0;s.punch_l_timer=0;s.punch_l_timer=0;arcadeEnd=1;}
 if(!ge(s.punchcon,1)||arcadeEnd!==0)return;
 if(s.punchcon===1){
  s.hit_baseball_check=0;s.special_punch_count--;s.hitattempt=0;s.x=s.basex;s.y=s.basey;s.imageIndex=1;if(s.swordactive===1)s.imageIndex=14;
  s.vspeed=-12*s.f*s.punch_speed_multiplier;if(e&&gt(e.acting,0))s.vspeed=-10*s.f;
  if(s.drawflip===0)s.hspeed=-4*s.f;if(s.drawflip===1)s.hspeed=4*s.f;s.friction=2*s.f;s.punchcon=2;s.punchtimer=0;
  snd(rt,'motor_upper_quick_high',1.25);
 }
 if(s.punchcon===2){
  s.punchtimer+=s.punch_speed_multiplier;if(s.laseractive===1)s.punchtimer++;
  if((ge(s.punchtimer,7/s.f)&&e&&e.acting===0)||(ge(s.punchtimer,14/s.f)&&e&&gt(e.acting,0))||(ge(s.punchtimer,7/s.f)&&!e)){s.hspeed=0;s.punchtimer=0;s.punchcon=3;}
 }
 if(s.punchcon===3){
  s.missnoise=0;s.imageIndex=2;if(s.swordactive===1)s.imageIndex=12;s.friction=.6*s.f;s.y-=40;s.vspeed=-10*s.f;s.punchcon=4;
  if(rt.exists(object('obj_bq_baseball'))||rt.exists(object('obj_bq_baseball_final'))){const hit=rt.create(object('o_boxingcontroller_fist_hitbox'),s.x,s.y);s.hitbox=hit.id;if(s.drawflip===0)hit.imageXscale=2;if(s.drawflip===1)hit.imageXscale=-2;hit.imageYscale=2;}
  if(s.hitattempt===0){
   s.hitattempt=1;s.q_miss=0;if(s.drawflip===0&&q.invincible_l===1)s.q_miss=1;if(s.drawflip===1&&q.invincible_r===1)s.q_miss=1;

   if(s.laseractive===1){
    s.y-=30;s.laserpunchfadetimer=10;const oldy=s.y+70;
    for(let l=0;l<8;l++){
     const a=rt.create(object('o_afterimage'),s.x,s.y+(oldy-s.y)*l/8);s.afterimage=a.id;a.sprite='spr_bhero_white';a.imageIndex=s.imageIndex;a.depth=s.depth-1;a.imageAlpha=(10-l)/10;a.boss=s.id;a.imageXscale=2;if(s.drawflip===1)a.imageXscale=-2;a.imageYscale=2;if(s.q_miss===1)s.vspeed=-3;
    }
   }
   if(rt.exists(object('obj_vector_explosion'))||rt.exists(object('obj_vector_explosion_big')))s.q_miss=1;
   // Source contains two empty pre-attack checks here. They intentionally do not modify q_miss.
   if(s.q_miss===0){
    if((q.blocking===s.drawflip&&s.swordactive===0&&s.wireframe_boxing===0&&s.disable_queen_blocking===0)){
     s.y+=20;s.punchcon=4.7;s.arcade_times_blocked++;s.punchtimer=0;s.hshake=6;s.x-=6;s.shaketimer=0;s.hspeed=0;s.vspeed=0;s.friction=0;
     q.x=q.basex;q.y=q.basey;rt.create(object('obj_boxing_wine_shield'),q.x,q.y);
     for(let n=0;n<4;n++){const star=rt.create(object('obj_boxing_block_star'),q.x,q.y);q.block_star=star.id;star.direction=n*90+rt.random.random(90);}
     snd(rt,q.arcade?'snd_bell_bc':'snd_bell');q.drawflip=s.drawflip;q.savex=q.x;q.savey=q.y;q.speed=0;q.gravity=0;q.friction=0;q.blocktimer=0;q.state=2;q.imageIndex=0;q.sprite='spr_bqueen_block';q.invincible_l=0;q.invincible_r=0;
    }else{
     let multiplier=1;
     if(g.beat_phase1_no_damage_taken===0&&h.sub_healthbar_count===2)multiplier=1.25;
     if(g.beat_phase1_no_damage_taken===1&&h.sub_healthbar_count===2)multiplier=2.5;
     if(s.beat_phase2_no_damage_taken===1&&h.sub_healthbar_count===0)multiplier=1.5;
     if(q.attackorderlooping===1)multiplier+=.5;
     multiplier+=s.phase3_damage_multiplier;multiplier=multiplier-1+s.damage_multiplier;
     let d=1;if(s.defend===1)d=.8;let whiteflash=0;d+=q.damagetakenincrease;
     if(s.wireframe_boxing===0){
      if(s.damageoverride!==0){
       if(s.damageoverride!==1)s.damageoverride=Math.ceil(s.damageoverride*multiplier);
       q.health_count-=s.damageoverride;q.actpunchtimer=1;const dm=rt.create(object('obj_dmgwriter'),s.x,s.y-150);s.dm=dm.id;dm.delay=2;dm.damage=s.damageoverride;s.damageoverride=0;s.actpunchtimer=15;whiteflash=1;
       if(s.healoverride!==0){
        s.health_count+=s.healoverride;const wr=rt.create(object('obj_dmgwriter'),s.x-30,s.y-75);s.dmgwr=wr.id;wr.delay=8;wr.type=3;wr.damage=s.healoverride;
        if(gt(g.hp[1]+s.healoverride,g.maxhp[1]))s.damage=g.maxhp[1]-g.hp[1];
        if(gt(s.health_count,s.health_count_max))s.health_count=s.health_count_max;
        g.hp[1]+=s.healoverride;if(gt(g.hp[1],g.maxhp[1]))g.hp[1]=g.maxhp[1];snd(rt,s.arcade?'snd_power_bc':'snd_power');
       }
      }else if(q.sprite==='spr_bqueen_hurt')q.health_count-=Math.ceil(14*multiplier*d);
      else q.health_count-=Math.ceil(28*multiplier*d);
     }
     h.healthbar_flash=100;q.pacifist=0;q.health_count_prev_timer=q.health_count_prev_timer_set;
     if(s.drawflip===0)q.drawflip=1;rt.paths.end(q);
     if(s.tpoverride!==0){tensionHeal(rt,s.tpoverride);snd(rt,s.arcade?'snd_criticalswing_bc':'snd_criticalswing');}
     tensionHeal(rt,2.5);s.tpoverride=0;
     if(q.state!==0&&q.state!==1&&s.wireframe_boxing===0){q.combo=1;if(e)e.didntcounterthisturn=0;}
     if(q.state===0&&gt(q.bouncetimer,1)&&s.wireframe_boxing===0&&g.boxingphase===2){q.shortcomboend=1;q.combo=1;if(e)e.didntcounterthisturn=0;q.times_hit_in_a_row=2;}
     if(q.combo===1)q.times_hit_in_a_row++;
     if(s.swordactive===1){if(eq(s.damage_multiplier,1.2))s.damage_multiplier=1.3;else if(lt(s.damage_multiplier,1.6))s.damage_multiplier+=.05;else s.damage_multiplier+=.02;}
     q.hurt_fx1_timer=0;q.hurt_fx1_timer2=0;q.hurt_fx1_state=1;s.arcade_mode_last_punched_direction=s.drawflip;
     if(s.drawflip===1)q.drawflip=0;
     reactGigaQueen(s,q,rt,object,whiteflash);
     s.x=s.basex;s.vspeed=0;s.punchcon=4.5;s.punchtimer=0;
     const fx=rt.create(object('obj_boxing_hit_fx'),s.x,s.y);s.hit_fx=fx.id;rt.userEvent(fx,1);
     if(s.flameactive===1){snd(rt,s.arcade?'snd_punchheavythunder_bc':'snd_punchheavythunder');s.flamepunch=1;s.flametimer=10;}
     if(s.laseractive===1){snd(rt,s.arcade?'snd_punchheavythunder_bc':'snd_punchheavythunder');s.laserpunch=1;s.lasertimer=10;}
     if(s.duckactive===1){
      // random pitch follows sound allocation in the source.
      const sound=snd(rt,s.arcade?'snd_squeaky_bc':'snd_squeaky');const pitch=.75+rt.random.random(.5);if(sound!==undefined)rt.soundPitch?.(sound,pitch);
      s.color_fade_alpha=1;if(s.healoverride===0){g.hp[1]+=2;if(gt(g.hp[1],g.maxhp[1]))g.hp[1]=g.maxhp[1];}s.healoverride=0;
     }
    }
   }
  }
 }
 if(s.punchcon===4){
  if(s.missnoise===0){snd(rt,s.arcade?'motor_upper_quick_bc':'motor_upper_quick');s.missnoise=1;}
  s.vspeed*=.81;s.miss_timer++;if(s.miss_timer===5&&s.swordactive===1)s.imageIndex=13;
  if(ge(s.vspeed,-s.f)&&s.punchcon===4){s.punchcon=5;s.miss_timer=0;s.vspeed=3*s.f;}
 }
 if(eq(s.punchcon,4.5)){
  s.punchtimer++;if(s.punchtimer===5&&s.swordactive===1)s.imageIndex=13;s.vspeed=0;s.hspeed=0;s.gravity=0;s.friction=0;
  if(s.f===1){if(s.punchtimer===1)s.y-=30;if(s.punchtimer===2)s.y-=15;if(s.punchtimer===3)s.y-=8;}
  if(ge(s.punchtimer,10/s.f)){s.punchcon=5;s.punchtimer=0;}
 }
 if(eq(s.punchcon,4.7)){
  s.hspeed=0;s.vspeed=0;s.friction=0;s.punchtimer++;s.shaketimer++;if(s.shaketimer===5&&s.swordactive===1)s.imageIndex=13;
  if(ge(s.shaketimer,2/s.f)){s.x+=s.hshake;if(gt(s.hshake,0))s.hshake--;if(lt(s.hshake,0))s.hshake++;s.hshake=-s.hshake;if(s.hshake===1||s.hshake===-1)s.hshake=0;s.shaketimer=0;}
  if(ge(s.punchtimer,22/s.f)){s.punchtimer=0;s.punchcon=5;}
 }
 if(s.punchcon===5){s.vspeed+=3*s.f*s.punch_speed_multiplier;if(ge(s.y,s.basey)){s.vspeed=0;s.friction=0;s.y=s.basey;s.punchcon=6;s.punchtimer=0;}}
 if(s.punchcon===6){s.imageIndex=3;s.punchtimer+=s.punch_speed_multiplier;if(ge(s.punchtimer,10/s.f))rt.userEvent(s,1);}
}
function reactGigaQueen(s:GmInstance,q:GmInstance,rt:GmRuntime,object:GigaObjects,whiteflash:number){
 q.hitanim=0;
 // The source's heavy-hit condition requires laseractive == 0 AND == 1, so its else always runs.
 q.punchnoise=snd(rt,q.arcade?'punch_ish_1_bc':'snd_queen_punched_lower');
 let count=q.times_hit_in_a_row;if(lt(count,0))count=0;if(q.punchnoise!==undefined)rt.soundPitch?.(q.punchnoise,q.shortcomboend===1?1:1+(count-1)*.3);
 if(s.wireframe_boxing===0){if(lt(q.times_hit_in_a_row,3)&&s.laseractive===0)q.movetimer=1;if(lt(q.times_hit_in_a_row,4)&&s.laseractive===1)q.movetimer=1;if(q.combo===0)q.movetimer=q.attackthreshold;if(q.combo===1&&q.attackthreshold===0)q.attackthreshold=30;}
 if(le(q.dizzytimer,0))q.noattack++;else snd(rt,q.arcade?'snd_metalhit_bc':'snd_metalhit');
 q.blocking=-1;q.imageIndex=0;q.sprite='spr_bqueen_hurt_effect';q.speed=0;q.gravity=0;q.invincible_l=0;q.invincible_r=0;q.enddizzy=0;
 if(s.wireframe_boxing===0){
  if(gt(q.makedizzy,0)){q.dizzytimer=q.makedizzy;if(s.flameactive===1)q.dizzytimer=q.makedizzy*1.5;if(s.laseractive===1)q.dizzytimer=q.makedizzy*1.5;q.makedizzy=0;}
  else{if(s.laseractive===0)q.dizzytimer-=20;if(s.laseractive===1)q.dizzytimer-=10;}
  if(gt(q.dizzytimer,0)&&le(q.dizzytimer,60)){q.dizzytimer=0;q.enddizzy=1;}if(gt(q.dizzytimer,0))q.sprite='spr_bqueen_dizzy_hurt';
 }
 if(whiteflash===1){rt.userEvent(q,5);for(const a of rt.all(object('o_afterimage')))a.white_silhouette=1;}
 if(q.drawflip===0||q.drawflip===-1){if(ge(q.dizzytimer,60))q.hitanim=1;else q.hitnaim=2;if(q.enddizzy===1)q.hitanim=3;}
 if(q.drawflip===1){if(ge(q.dizzytimer,60))q.hitanim=-1;else q.hitanim=-2;if(q.enddizzy===1)q.hitanim=-3;}
 const move=(type:number,x:number,y:number)=>movePrecise(q,rt,object,type,x,y);
 if(s.wireframe_boxing===0&&((lt(q.times_hit_in_a_row,3)&&s.laseractive===0)||(lt(q.times_hit_in_a_row,4)&&s.laseractive===1))){
  if(q.hitanim===-2)q.hitanim=rt.random.choose(-1,-3);
  if(q.hitanim===3||q.hitanim===-3)move(2,2*q.hitanim/3,2);
  if(q.hitanim===1||q.hitanim===-1)move(1,2*q.hitanim,2);
  if(q.hitanim===2||q.hitanim===-2)move(0,q.hitanim,2);
  if(q.hitanim===0)move(1,2,2);
 }
 q.hurttimer=0;q.state=1;q.x=q.basex;q.y=q.basey;
}
