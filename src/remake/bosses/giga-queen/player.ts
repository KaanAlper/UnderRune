// Source o_boxingcontroller Create, Step, user0..3 and hitbox collision.
import {type GmHandler,type GmInstance,type GmObjectDef,type GmRuntime} from '../../gm/runtime';
import {makeColorHsv} from '../../gm/graphics';
import {eq,ge,gt,le,lt,round} from '../../gm/math';
import {sourceText} from '../../host/text';
import {inputName} from '../../deltarune/controller';
import {isPhase} from '../../deltarune/chapter2-battle';
import {bufferBoxingInput,consumeBoxingInput,decayBoxingInput,resetBoxingAction} from '../queen/boxing-input';
import {loseBoxingRound,resetBoxingHealPrice,type BoxingLifecycleObjects} from '../queen/boxing-lifecycle';
import {stepGigaPlayerMotion} from './player-motion';
import {punchGigaQueen} from './player-punch';
export type GigaObjects=(name:string)=>GmObjectDef;
export const gigaRequired=(rt:GmRuntime,o:GmObjectDef)=>{const s=rt.first(o);if(!s)throw Error(`GigaPlayerMissingInstance: ${o.name}`);return s;};
const line=(n:number)=>sourceText(`o_boxingcontroller_slash_Step_0_gml_${n}_0`);
export function createGigaPlayer(object:GigaObjects,draw?:GmHandler):GmObjectDef{
 const queen=object('o_boxingqueen'),enemy=object('obj_gigaqueen_enemy'),hud=object('o_boxinghud');
 const input={queen,enemy,wireframe:object('o_boxing_wireframe'),arcadeBg:object('obj_ch2_scene10_arcade_bg')};
 const lifecycle:BoxingLifecycleObjects={queen,controller:object('o_boxingcontroller'),battleController:object('obj_battlecontroller'),blackBackground:object('obj_boxingqueen_black_bg'),cityBackground:object('obj_3d_bg_effect'),battleBackground:object('obj_battleback'),heart:object('obj_heart'),returnHeart:object('obj_returnheart')};
 return {...object('o_boxingcontroller'),events:{
 create:(s,rt)=>{
  const g=rt.globals;s.arcade=rt.room.name==='room_dw_cyber_queen_boxing'?1:0;s.depth=7;s.c=250;s.f=2;s.wireframe_boxing=s.arcade;
  for(let n=1;n<=3;n++)if(lt(g.hp[n],1))g.hp[n]=1;
  s.health_count=s.wireframe_boxing===0?g.hp[1]:500;s.health_count_max=s.wireframe_boxing===0?g.maxhp[1]:500;s.disable_queen_blocking=1;
  s.dodge_string=sourceText('o_boxingcontroller_slash_Create_0_gml_18_0').replace('~1',inputName(3)).replace('~2',inputName(1));
  s.duck_string=sourceText('o_boxingcontroller_slash_Create_0_gml_19_0').replace('~1',inputName(0));s.default_string=sourceText('o_boxingcontroller_slash_Create_0_gml_20_0');
  Object.assign(s,{health_count_prev:200,health_count_prev_timer_set:24,health_count_prev_timer:0,white_flash:0,times_hit_by_boss:0,hit_baseball:0,hit_baseball_check:0,damage_multiplier:1,punch_speed_multiplier:1,color_fade_alpha:0,turbo_fade_alpha:0,turbo_fade_state:0,sword_fade_alpha:0,sword_fade_state:0,miss_timer:0,defend:0,failed_kick_tutorial_counter:1,succeeded_kick_tutorial:0,arcade_loss_count:0,arcade_times_blocked:0,dead:0,dead_timer:0,arcade_mode_last_punched_direction:0});
  if(!('beat_phase1_no_damage_taken' in g))g.beat_phase1_no_damage_taken=0;
  for(const k of ['beat_phase1_no_damage_taken_check','beat_phase2_no_damage_taken','beat_phase2_no_damage_taken_check','phase2_25_percent_health_early','phase3_hit_check','phase3_damage_multiplier','attackintrotimer','attackintrocon','talking','arcaderesettimer','damagereductiononeturn','damageoverride','healoverride','tpoverride','actpunchtimer','acttoenemytalktransition','lastpunchside','damagetakenthisturn'])s[k]=0;
  if(s.wireframe_boxing===1){rt.create(input.wireframe,s.x,s.y);s.sprite='spr_bhero_wireframe';for(const q of rt.all(queen))q.sprite='spr_bqueen_wireframe';}
  for(const k of ['htimer','hcon','hsubcon','qtimer','qcon','qsubcon','punchcon','punchtimer','dodgecon','dodgetimer','dodging','duckcon','ducktimer','ducking','jumpcon','jumptimer','jumping','hurtcon','hurttimer','invincible','invincibility_timer','buffer_punch','buffer_l','buffer_u','buffer_d','buffer_r','buffer_z','buffer_x'])s[k]=0;
  s.hurt_length=22/s.f;s.imageSpeed=0;s.imageXscale=2;s.imageYscale=2;s.x=320;s.y=390;s.basex=s.x;s.basey=s.y;s.drawflip=1;s.headsprite='spr_bhero_head_c';
  // Background layers are host-owned; source scales layer zero to two.
  s.grazer=rt.create(object('o_boxinggraze'),s.x,s.y).id;s.hud=rt.create(hud,0,0).id;g.boxingphase=0;s.cancontrol=0;s.siner=0;s.boxingtimer=0;
  s.specialactive=[];for(s.i=0;s.i<4;s.i++)s.specialactive[s.i]=0;
  s.imagefistx=[];s.imagefisty=[];for(s.i=0;s.i<20;s.i++){s.imagefistx[s.i]=0;s.imagefisty[s.i]=0;}
  for(const k of ['specialcon','specialcontimer','special_punch_count','special_punch_turns','flameactive','flametimer','flamepunch','swordactive','swordtimer','swordpunch','laseractive','lasertimer','laserpunch','duckactive','ducktimer','duckpunch','turboactive','turbotimer','turbopunch','healactive','healtimer','healpunch','laserpunchfadetimer'])s[k]=0;
  s.xspot=88;s.yspot=180;
  for(const [index,x,y] of [[0,50,90],[1,68,98],[3,68,98],[2,74,18],[4,70,70],[6,26,110]]){s.imagefistx[index]=x-s.xspot;s.imagefisty[index]=y-s.yspot;}
  if(g.flag[220]===1)s.headsprite='spr_bhero_head_b';if(g.flag[220]===2)s.headsprite='spr_bhero_head_a';if(g.flag[220]===3)s.headsprite='spr_bhero_head_d';s.headcolor=makeColorHsv(g.flag[223]*8,255,255);s.glow=0;
 },
 user0:(s,rt)=>{rt.globals.boxingphase++;if(rt.globals.boxingphase===1)s.special_punch_turns--;},
 user1:resetBoxingAction,
 user2:(s,rt)=>{if(s.invincible===0){rt.userEvent(s,1);s.hurtcon=1;s.hurttimer=0;s.imageIndex=7;}},
 user3:(s,rt)=>{resetBoxingHealPrice(s,rt,enemy);loseBoxingRound(s,rt,lifecycle,enemy);},
 step:(s,rt)=>stepGigaPlayer(s,rt,object,input),...(draw?{draw}:{}),
 },collisions:[{target:object('o_boxing_hitbox'),run:(s,hit,rt)=>hitGigaPlayer(s,hit,rt,object)}]};
}
function stepGigaPlayer(s:GmInstance,rt:GmRuntime,object:GigaObjects,input:Parameters<typeof bufferBoxingInput>[2]){
 const g=rt.globals,q=gigaRequired(rt,input.queen),e=rt.first(input.enemy),h=gigaRequired(rt,object('o_boxinghud')),wire=rt.first(input.wireframe);
 for(const hero of rt.withInstances(object('obj_heroparent'))){hero.x=-1000;hero.visible=true;}
 const baseball=rt.first(object('obj_bq_baseball')),final=rt.first(object('obj_bq_baseball_final'));
 if((baseball&&baseball.hit===1&&lt(baseball.hit_timer,20))||(final&&final.hit===1)||(gt(q.phase_transition,0)&&lt(q.phase_transition_timer,110/s.f))){s.vspeed=0;return;}
 if(gt(s.actpunchtimer,0)){s.actpunchtimer--;return;}
 if(s.wireframe_boxing===1&&g.boxingphase===0){g.boxingphase++;if(g.boxingphase===1)s.special_punch_turns--;}
 if(g.boxingphase===4)g.boxingphase=0;
 if(s.attackintrocon===2){s.attackintrotimer++;if(s.attackintrotimer===17){s.attackintrocon=0;s.attackintrotimer=0;}}
 if(le(q.health_count,q.health_count_max*.2)&&h.sub_healthbar_count===0&&s.wireframe_boxing===0&&s.attackintrocon===1)s.attackintrocon=0;
 if(s.wireframe_boxing===1)throw Error('GigaPlayerArcadeContinuationNotPorted');
 if(lt(s.health_count,1)&&s.dead===.5){s.health_count=0;s.dead=1;for(const m of rt.all(object('obj_event_manager')))m.trigger_event(0,13);}
 if(s.wireframe_boxing===0&&s.dead===1){s.dead_timer++;s.imageIndex=7;if(gt(s.dead_timer,0)&&lt(s.dead_timer,20/s.f)){s.x=s.basex+20/s.dead_timer-rt.random.irandom(40/s.dead_timer);s.y=s.basey+20/s.dead_timer-rt.random.irandom(40/s.dead_timer);}if(gt(s.dead_timer,20/s.f))s.vspeed=14/s.f;}
 const approach=(axis:'x'|'y',target:number)=>{if(!eq(s[axis],target)){s[axis]+=(target-s[axis])*.5;if(le(Math.abs(s[axis]-target),2))s[axis]=target;}};
 if((e&&gt(e.acting,0)&&s.punchcon===0&&s.dead===0)||(isPhase(rt,'enemytalk',s)&&s.punchcon===0&&s.dead===0)||(s.specialcon!==0&&s.punchcon===0&&s.dead===0)||(s.acttoenemytalktransition===1&&s.punchcon===0&&s.dead===0)){
  if(e&&e.breathattack===0&&e.missleattack===0){q.invincible_l=0;q.invincible_r=0;approach('y',s.basey);approach('x',s.basex);}
 }else if((g.boxingphase===0&&s.punchcon===0)||(g.boxingphase===3&&s.punchcon===0)){
  q.invincible_l=0;q.invincible_r=0;
  if(ge(s.y,s.basey-35)){s.y+=(s.basey-35-s.y)*.5;if(le(Math.abs(s.y-s.basey-35),2))s.y=s.basey-35;}else s.y=s.basey-38;
  if(ge(s.x,s.basex-70)){s.x+=(s.basex-70-s.x)*.5;if(le(Math.abs(s.x-s.basex-70),2))s.x=s.basex-70;}
 }
 if(g.boxingphase===1){
  let begin=rt.exists(object('obj_dbulletcontroller'));
  if(!begin){approach('y',s.basey);approach('x',s.basex);begin=eq(s.x,s.basex)&&eq(s.y,s.basey)&&s.dead===0;}
  if(begin){s.cancontrol=1;g.boxingphase=2;s.boxingtimer=270;rt.userEvent(q,6);q.myturn=1;q.movetimer=90;q.invincible_l=0;q.invincible_r=0;}
 }
 if(g.boxingphase===2){s.nextphase=0;if(s.wireframe_boxing===0)s.boxingtimer--;if(le(s.boxingtimer,0)){s.nextphase=1;if(gt(s.hurttimer,0)||q.state===2||q.state===3||s.punchcon!==0||s.duckcon!==0||s.dodgecon!==0)s.nextphase=0;if(s.nextphase===1&&s.dead===0){g.boxingphase=3;s.special_punch_turns--;}}}
 if(g.boxingphase===3){
  s.cancontrol=0;q.myturn=0;q.dizzytimer=0;g.boxingphase=0;g.turntimer=5;
  for(const en of rt.all(input.enemy)){
   en.talked=0;
   if(en.didntcounterthisturn===1)g.battlemsg[0]=line(170).replace('~1',inputName(4)).replace('~2',inputName(5));
   if(en.didntpunchthisturn===1)g.battlemsg[0]=line(174).replace('~1',inputName(4)).replace('~2',inputName(5));
   if(en.didntdodgethisturn===1)g.battlemsg[0]=line(178).replace('~1',inputName(3)).replace('~2',inputName(1)).replace('~3',inputName(0));
   if(en.recentphasetransition===2)g.battlemsg[0]=line(182);if(en.recentphasetransition===3)g.battlemsg[0]=line(186);
   en.recentphasetransition=0;en.didntdodgethisturn=1;en.didntpunchthisturn=1;if(h.sub_healthbar_count===2)en.didntcounterthisturn=1;
  }
  for(const b of rt.all(object('obj_battlecontroller'))){b.gigaqueencon=2;b.gigaqueentimer=0;}
  s.defend=0;s.damagereductiononeturn=0;s.damagetakenthisturn=0;
 }
 if((rt.room.name!=='room_dw_mansion_top'&&wire&&ge(wire.pacifist_timer,2970))||(lt(s.health_count,1)&&!rt.exists(object('obj_boxing_loss_controller'))))s.cancontrol=0;
 if(gt(s.arcaderesettimer,0))s.arcaderesettimer--;
 let disable=0;if((q.attacktype===9&&lt(q.attackcon,2))||rt.exists(object('obj_vector_explosion'))||rt.exists(object('obj_vector_explosion_big')))disable=1;
 bufferBoxingInput(s,rt,input,disable);
 if(s.dodgecon===0&&s.hurtcon===0&&s.duckcon===0&&s.jumpcon===0&&(lt(s.special_punch_count,1)||lt(s.special_punch_turns,1))&&(gt(s.flameactive,0)||gt(s.swordactive,0)||gt(s.laseractive,0)||gt(s.duckactive,0)||gt(s.turboactive,0))){s.flameactive=0;s.swordactive=0;s.laseractive=0;s.duckactive=0;s.turboactive=0;s.damage_multiplier=1;s.punch_speed_multiplier=1;for(const r of rt.all(object('obj_rotating_sprites_controller')))r.state=1;}
 consumeBoxingInput(s,rt,input);
 punchGigaQueen(s,rt,object);
 stepGigaPlayerMotion(s,rt,object);
 s.invincibility_timer++;if(s.invincibility_timer===0&&s.invincible===1)s.invincible=0;
 decayBoxingInput(s);
}
export function hitGigaPlayer(s:GmInstance,other:GmInstance,rt:GmRuntime,object:GigaObjects){
 const g=rt.globals;if(s.dead===1||(gt(s.dead,0)&&s.wireframe_boxing===1))return;
 if(other.baseball===1){if(lt(gigaRequiredMaker(rt,other.maker_id).y,s.c)&&gt(s.punchcon,0)&&le(s.punchcon,4))return;if(s.invincible===1)return;if(other.graze_only===0)rt.destroy(other);}
 if(other.graze_only!==0)return;
 s.hit_me=1;if((s.ducking===1&&other.hit_ducking===0)||(s.dodging===1&&other.hit_dodging===0)||(s.jumping===1&&other.hit_jumping===0)||s.invincible===1)s.hit_me=0;
 if(s.hit_me!==1)return;
 rt.userEvent(s,2);s.times_hit_by_boss++;for(const graze of rt.all(object('o_boxinggraze')))graze.tpgain=0;
 if(s.wireframe_boxing===0){
  if(other.final_attack===1){if(le(g.hp[1],10))g.hp[1]-=10;else if(s.defend===0)g.hp[1]-=Math.floor(g.hp[1]/2);else g.hp[1]-=Math.floor(g.hp[1]/2*.75);}
  else{
   let reduction=1,damage=0;const threshold=lt(g.flag[526],5)?60:lt(g.flag[526],7)?40:30;
   // The source's >=120/80/50 branches follow >=60/40/30 and are unreachable.
   if(lt(s.damagetakenthisturn,threshold))reduction=1;else if(ge(s.damagetakenthisturn,threshold))reduction=.6;
   damage=Math.floor(other.damage*(s.defend===0?1:.75)*reduction);if(lt(damage,10))damage=10;s.damagetakenthisturn+=damage;g.hp[1]-=damage;
  }
  s.health_count=g.hp[1];s.health_count_max=g.maxhp[1];
 }else s.health_count-=other.damage;
 if(le(s.health_count,0)&&s.dead===0){s.health_count=0;s.dead=.5;}
 if(lt(g.hp[1],1))rt.userEvent(s,3);
 if(other.kick===1&&s.wireframe_boxing===1){s.failed_kick_tutorial_counter++;other.has_tutorial_kick_hit_player=1;}
 const q=gigaRequired(rt,object('o_boxingqueen'));if(other.kick===1&&s.wireframe_boxing===0)q.playerhitbykick=1;
 s.beat_phase1_no_damage_taken_check=1;s.beat_phase2_no_damage_taken_check=1;s.phase3_hit_check=0;q.attack_succeeded=1;s.drawflip=other.hit_direction;
 if(s.wireframe_boxing===0){const d=rt.create(object('obj_shake'),0,0);s.d=d.id;d.shakex=2;d.shakey=2;}
 for(let count=0;count<3;count++){
  const y=s.y-80-rt.random.irandom(40),x=s.x-20+rt.random.irandom(40),fx=rt.create(object('obj_boxing_hit_fx'),x,y);s.hit_fx=fx.id;rt.userEvent(fx,0);
 }
 if(gt(other.give_hurt,0))s.hurt_length=other.give_hurt;
 if(gt(other.give_invincibility,0)){s.invincible=1;s.invincibility_timer=-other.give_invincibility;}
}


function gigaRequiredMaker(rt:GmRuntime,id:number|GmInstance){const maker=typeof id==='number'?rt.byId(id):id;if(!maker)throw Error('GigaPlayerBaseballMakerMissing');return maker;}
