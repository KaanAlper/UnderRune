import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {C} from '../../gm/graphics';
import {ge,gt,le} from '../../gm/math';
import {KEY,button1_p,pressed} from '../../deltarune/keys';
import {snd} from '../../deltarune/sound';
import {sourceText} from '../../host/text';
import {resetGigaAttackList} from './plans';

type Objects=(name:string)=>GmObjectDef;
const requireInstance=(rt:GmRuntime,object:Objects,name:string)=>{const s=rt.first(object(name));if(!s)throw Error(`GigaLossMissingInstance: ${name}`);return s;};
function resolveTrophies(rt:GmRuntime,object:Objects){
 for(const manager of rt.withInstances(object('obj_event_manager'))){
  if(!('resolve_trophies' in manager)||typeof manager.resolve_trophies!=='function')throw Error('GigaLossTrophyResolutionNotPorted: obj_event_manager.resolve_trophies');
  manager.resolve_trophies();
 }
}
/** The source loss controller retries the existing ring; it does not recreate the encounter. */
function retry(s:GmInstance,rt:GmRuntime,object:Objects){
 const g=rt.globals,enemy=requireInstance(rt,object,'obj_gigaqueen_enemy'),battle=requireInstance(rt,object,'obj_battlecontroller');
 resolveTrophies(rt,object);
 for(s.j=0;s.j<13;s.j++)g.item[s.j]=enemy.items[s.j];
 for(s.j=0;s.j<3;s.j++)for(s.i=0;s.i<13;s.i++)battle.tempitem[s.i][s.j]=g.item[s.i];
 g.battlemsg[0]=sourceText('scr_encountersetup_slash_scr_encountersetup_gml_1104_0');
 rt.create(object('o_bq_whitefade_persistent'),0,0);
 s.initsongvar='mus/boxing_boss.ogg';s._mystream=rt.sourceAudio?.music('boxing_boss')??'boxing_boss';
 const stream=rt.create(object('obj_astream'),0,0);s._astream=stream.id;stream.mystream=s._mystream;stream.songname='boxing_boss.ogg';g.batmusic[0]=s._mystream;
 rt.sourceAudio?.volume(g.batmusic[0],g.flag[16],0);rt.soundPitch?.(g.batmusic[0],1);
 s._xsndinstance=g.batmusic[0];rt.sourceAudio?.loop(s._xsndinstance);rt.sourceAudio?.volume(s._xsndinstance,g.flag[16],0);
 g.boxingphase=3;
 for(const e of rt.withInstances(object('obj_gigaqueen_enemy')))Object.assign(e,{balloonorder:0,ballooncon:0,balloonend:1,talkedcon:0,playerhasntdodged:0,playerhasntdodgedorder:0,init:0,didntcounterthisturn:0,didntpunchthisturn:0,didntdodgethisturn:0,recentphasetransition:0});
 for(const c of rt.withInstances(object('o_boxingcontroller'))){
  g.hp[1]=g.maxhp[1];g.tension=0;c.specialcon=0;c.health_count=200;c.dead=0;c.cancontrol=1;c.drawflip=1;c.imageXscale=2;c.dead=0;c.x=c.xstart;c.y=c.ystart;c.sprite='spr_bhero';c.imageIndex=0;c.vspeed=0;
  for(const key of ['specialcon','specialcontimer','special_punch_count','special_punch_turns','flameactive','flametimer','flamepunch','swordactive','swordtimer','swordpunch','laseractive','lasertimer','laserpunch','duckactive','ducktimer','duckpunch','turboactive','turbotimer','turbopunch','healactive','healtimer','healpunch'])c[key]=0;
 }
 for(const h of rt.withInstances(object('o_boxinghud')))Object.assign(h,{sub_healthbar_count:2,healthbar_flash:0,hide_ui:0,hide_ui_quick:0});
 for(const w of rt.withInstances(object('o_boxing_wireframe')))Object.assign(w,{pacifist_timer:0,pacifist_state:0,draw_draw_timer:0});
 for(const q of rt.withInstances(object('o_boxingqueen'))){
  Object.assign(q,{health_count:1500,phase_transition:0,attackcount:0,attackcountmax:0,useattacklist:1,pattern_state:0,player_dead_timer:0,attackpattern:0,attackcon:0,attacktype:1,punch_amount:1,state:0});q.sprite='spr_bqueen_idle';q.x=q.xstart;q.y=q.ystart;
  resetGigaAttackList(q);
  for(const c of rt.withInstances(object('o_boxingcontroller')))c.boxingtimer=270;
  rt.userEvent(q,1);
 }
 for(const name of ['obj_closing_block_left','obj_closing_block_right','obj_rotating_sprite','obj_rotating_sprites_controller'])for(const i of rt.withInstances(object(name)))rt.destroy(i);
 rt.destroy(s);
}
function drawLoss(s:GmInstance,rt:GmRuntime,object:Objects){
 s.timer++;
 if(s.state===0&&gt(s.timer,200/s.f))s.state=1;
 if(s.state===1){
  if(gt(s.imageAlpha,2.2)){
   if(button1_p(rt)||pressed(rt,KEY.x,KEY.shift,KEY.c,KEY.ctrl)){
    s.state=2;rt.create(object('o_bq_whitefade'),s.x,s.y);for(const fade of rt.withInstances(object('o_bq_whitefade')))fade.depth=-150;
   }
   if(pressed(rt,KEY.right))s.con=1;if(pressed(rt,KEY.left))s.con=0;
  }else s.imageAlpha+=.02;
 }
 if(s.state===2){
  s.imageAlpha+=.01;
  if(gt(s.imageAlpha,2.6)&&s.con===1){resolveTrophies(rt,object);const gameend=rt.create(object('DEVICE_FAILURE'),0,0);s.gameend=gameend.id;gameend.EVENT=8;}
  if(gt(s.imageAlpha,2.6)&&s.con===0)retry(s,rt,object);
 }
 // instance_destroy does not exit the event: the final retry frame still draws the loss prompt.
 rt.drawState.color=C.white;rt.drawState.halign=1;rt.drawState.alpha=s.imageAlpha;
 rt.drawText(340,150,sourceText('obj_boxing_loss_controller_slash_Draw_0_gml_116_0'),2,2,0);
 const controller=requireInstance(rt,object,'o_boxingcontroller');
 const bench=()=>{
  rt.drawSprite('spr_bhero_bench',0,320,320,1,1,0,C.white,rt.drawState.alpha);
  const positions:Record<string,[number,number]>={spr_bhero_head_a:[322,305],spr_bhero_head_b:[320,306],spr_bhero_head_c:[321,303],spr_bhero_head_d:[321,300]};
  const at=positions[controller.headsprite];if(at)rt.drawSprite(controller.headsprite,9,at[0],at[1],1,1,0,C.white,rt.drawState.alpha);
 };
 bench();rt.drawState.alpha=s.imageAlpha-1;bench();rt.drawState.halign=0;rt.drawState.alpha=1;
 rt.drawSprite('spr_acrade_fightagain',s.con===0?1:0,190,400,1,1,0,C.white,s.imageAlpha);
 const retire=rt.globals.chemg_sprite_map?.spr_acrade_retire;
 if(typeof retire!=='string')throw Error('GigaLossMissingSprite: spr_acrade_retire');
 rt.drawSprite(retire,s.con===1?1:0,370,400,1,1,0,C.white,s.imageAlpha);
}
/** obj_closing_block_left/right and obj_boxing_loss_controller, including logic in Draw. */
export function createGigaLoss(object:Objects):GmObjectDef[]{
 const closer=(left:boolean):GmObjectDef=>({...object(left?'obj_closing_block_left':'obj_closing_block_right'),events:{
  create:s=>{s.state=0;s.timer=0;s.imageBlend=C.black;s.imageXscale=left?-330:330;s.imageYscale=650;s.depth=-50;s.grav=0;},
  step:(s,rt)=>{
   s.x+=s.grav;s.grav+=left?.6:-.6;
   if(left?ge(s.x,320):le(s.x,320)){
    s.speed=0;s.gravity=0;s.x=320;s.grav=0;
    if(s.state===0){
     if(left)snd(rt,'snd_closet_impact');s.state=1;
     if(left)for(let n=0;n<24;n++){
      let y=rt.random.irandom(240),x=320+rt.random.randomRange(-4,14);rt.create(object('obj_boxing_closing_block_dust'),x,y);
      y=240+rt.random.irandom(240);x=320+rt.random.randomRange(-4,14);rt.create(object('obj_boxing_closing_block_dust'),x,y);
     }
    }
   }
  },
  draw:(s,rt)=>{
   rt.drawSelf(s);
   if(s.state===0)rt.drawSprite('spr_sparks',s.imageIndex,s.x+(left?-10:10),s.y,1,left?-1:1,270,C.white,1);
   if(s.state===0)rt.drawSprite('spr_sparks',s.imageIndex,s.x+(left?-10:10),s.y+480,1,left?1:-1,90,C.white,1);
   s.imageIndex++;
  },
 }});
 return [closer(true),closer(false),{...object('obj_boxing_loss_controller'),events:{create:s=>{s.f=2;s.state=0;s.timer=0;s.con=0;s.imageAlpha=0;s.depth=-100;},draw:(s,rt)=>drawLoss(s,rt,object)}}];
}
