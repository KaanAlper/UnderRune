// Queen's social media attack: the party and Queen fade out, avatars fall past the box posting words that fly at
// the soul, and in the last version Queen's own avatar posts DRAMA, which turns everyone angry. Objects:
// obj_social_media_attack_fade_heroes, obj_socialmedia_avatar and obj_wordbullet.
import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {bulletInit} from '../../deltarune/battle';
import {ge,gt,le,lt,lerp,pointDirection} from '../../gm/math';
import {C} from '../../gm/graphics';
import {snd} from '../../deltarune/sound';
import {sourceText} from '../../host/text';
import {type QueenObject,queenInstance} from './context';

/** obj_wordbullet's word list, in the order of its array. */
const WORDS=['obj_wordbullet_slash_Create_0_gml_9_0','obj_wordbullet_slash_Create_0_gml_10_0','obj_wordbullet_slash_Create_0_gml_11_0','obj_wordbullet_slash_Create_0_gml_12_0',
 'obj_wordbullet_slash_Create_0_gml_13_0','obj_wordbullet_slash_Create_0_gml_14_0','obj_wordbullet_slash_Create_0_gml_15_0','obj_wordbullet_slash_Create_0_gml_16_0',
 'obj_wordbullet_slash_Create_0_gml_17_0','obj_wordbullet_slash_Create_0_gml_18_0','obj_wordbullet_slash_Create_0_gml_19_0','obj_wordbullet_slash_Create_0_gml_20_0',
 'obj_wordbullet_slash_Create_0_gml_21_0','obj_wordbullet_slash_Create_0_gml_22_0','obj_wordbullet_slash_Create_0_gml_23_0','obj_wordbullet_slash_Create_0_gml_24_0',
 'obj_wordbullet_slash_Create_0_gml_25_0','obj_wordbullet_slash_Create_0_gml_26_0','obj_wordbullet_slash_Create_0_gml_27_0','obj_wordbullet_slash_Create_0_gml_28_0',
 'obj_wordbullet_slash_Create_0_gml_29_0','obj_wordbullet_slash_Create_0_gml_30_0'];
/** An angry word: four of these symbols. */
const CURSES=['obj_wordbullet_slash_Draw_0_gml_15_0','obj_wordbullet_slash_Draw_0_gml_15_1','obj_wordbullet_slash_Draw_0_gml_15_2','obj_wordbullet_slash_Draw_0_gml_15_3','obj_wordbullet_slash_Draw_0_gml_15_4'];

export function createQueenSocial(object:QueenObject):GmObjectDef[]{
 const heart=(rt:GmRuntime)=>queenInstance(rt,object,'obj_heart');
 const box=(rt:GmRuntime)=>queenInstance(rt,object,'obj_growtangle');
 const heroes=()=>object('obj_heroparent');
 /** Above the soul while high on the screen, behind it once low. */
 const layer=(s:GmInstance,rt:GmRuntime,above:number,below:number)=>{
  if(lt(s.y,rt.view.y+290))s.depth=heart(rt).depth+above;
  if(gt(s.y,rt.view.y+290))s.depth=heart(rt).depth+below;
 };
 const fade:GmObjectDef={...object('obj_social_media_attack_fade_heroes'),events:{
  create:s=>{s.con=0;s.timer=0;},
  step:(s,rt)=>{
   const fadeBy=(amount:number)=>{for(const h of rt.withInstances(heroes()))h.imageAlpha+=amount;for(const q of rt.withInstances(object('obj_queen_enemy')))q.imageAlpha+=amount;};
   if(s.con===0){fadeBy(-.1);if(lt(rt.first(heroes())!.imageAlpha,0))s.con=1;}
   if(s.con===1&&rt.globals.turntimer<2)s.con=2;
   if(s.con===2){fadeBy(.1);if(gt(rt.first(heroes())!.imageAlpha,1))rt.destroy(s);}
  },
 }};
 const word:GmObjectDef={...object('obj_wordbullet'),events:{
  create:(s,rt)=>{
   bulletInit(s);
   const q=rt.first(object('obj_queen_enemy'));if(q)s.damage=rt.globals.monsterat[q.myself]*5;
   const c=rt.first(object('obj_queen_bulletcontroller'));if(c)s.target=c.target;
   s.grazepoints=4;s.destroyonhit=1;
   s.word=WORDS.map(k=>sourceText(k));s.wordchoice=s.word[Math.floor(rt.random.random(21))];
   s.active=1;s.timer=0;rt.drawState.font='fnt_main';
   s.stringlength=rt.stringWidth(s.wordchoice);s.stringheight=rt.stringHeight(s.wordchoice);
   s.idealxscale=rt.spriteWidth(s)/s.stringlength;s.idealyscale=rt.spriteHeight(s)/s.stringheight;
   Object.assign(s,{scaleupx:0,queenword:0,init:0,gray:0,angry:0,dramatimer_x:0,dramatimer_y:0});
   layer(s,rt,-1,100.5);
  },
  draw:(s,rt)=>{
   const d=rt.drawState;layer(s,rt,-1,100.5);
   if(s.init===0){
    s.init=1;if(s.queenword===1)s.idealxscale=2;
    if(s.angry&&s.queenword===0){
     s.wordchoice='';for(let n=0;n<4;n++)s.wordchoice+=sourceText(rt.random.choose(...CURSES));
     s.idealxscale=1.5;s.idealyscale=1.5;s.imageXscale=.8;s.imageYscale=.8;
    }
   }
   d.font='fnt_main';
   if(s.queenword===0){
    d.color=C.white;if(s.angry)d.color=C.red;if(s.gray)d.color=C.gray;
    if(s.timer>5&&s.timer<=11)s.scaleupx=lerp(0,s.idealxscale,(s.timer-5)/6);
    if(s.angry===1||lt(s.x,box(rt).x))s.scaleupx=s.idealxscale;
    rt.drawText(s.x,s.y,s.wordchoice,s.scaleupx,s.idealyscale,s.imageAngle);
    s.timer++;if(s.timer>=90)rt.destroy(s);
   }
   // DRAMA: grows and fades at the box's left edge, then everyone turns angry.
   if(s.queenword){
    d.color=C.red;d.alpha=s.imageAlpha;
    const past=le(s.x,box(rt).x-30);
    if(past){s.dramatimer_x-=2;s.dramatimer_y-=1;}
    rt.drawText(s.x+s.dramatimer_x,s.y+s.dramatimer_y,s.wordchoice,s.idealxscale,s.idealyscale,s.imageAngle);d.alpha=1;
    if(past){
     s.active=0;s.hspeed=0;s.imageAlpha-=.05;s.idealxscale+=.1;s.idealyscale+=.1;
     if(le(s.imageAlpha,0)){for(const a of rt.withInstances(avatar))a.angrycon=2;for(const w of rt.withInstances(word))rt.destroy(w);}
    }
   }
  },
 }};
 const avatar:GmObjectDef={...object('obj_socialmedia_avatar'),events:{
  create:(s,rt)=>{
   s.imageSpeed=.25;s.con=0;s.timer=30;s.offset=rt.random.choose(2,3);s.times=0;s.myhspeed=rt.random.choose(5,5,5,5,5,4);
   Object.assign(s,{angrycon:0,isqueen:0,queencon:0,queentimer:0,index_timer:0});
   s.chosen_face=rt.random.irandom(7);if(rt.random.irandom(100)<3)s.chosen_face=8;
  },
  step:(s,rt)=>{
   layer(s,rt,-2,100);
   if(s.isqueen){
    if(s.queencon===0){s.sprite='spr_q_socialface_queen';s.x=rt.view.x+640;s.hspeed=-4;s.queencon=1;}
    if(s.queencon===1&&le(s.x,s.xstart)){
     for(const w of rt.withInstances(word)){w.timer=-900;w.imageAlpha=.5;w.active=0;w.speed=0;w.gray=1;}
     for(const a of rt.withInstances(avatar)){a.hspeed=0;a.vspeed=0;a.imageSpeed=0;a.angrycon=1;}
     s.vspeed=0;s.hspeed=0;snd(rt,'snd_queen_laugh_0');rt.soundStop?.('snd_crowd');
     const red=rt.create(word,s.x-40,s.y-10);s.redword=red.id;red.queenword=1;red.wordchoice=sourceText('obj_socialmedia_avatar_slash_Step_0_gml_36_0');red.destroyonhit=0;red.hspeed=-4;
     s.queencon=2;
    }
    if(s.queencon===2&&s.angrycon===2){
     s.sprite='spr_q_socialface_queen_laugh';s.imageSpeed=.25;snd(rt,'snd_crowd');rt.soundLoop?.('snd_crowd');rt.soundPitch?.('snd_crowd',1);
    }
    s.angrycon=-1;
   }else if(s.chosen_face===8)return;
   // Posting: a word every few frames, toward the box.
   if(s.angrycon===0){
    s.timer++;
    if(s.timer>=19-s.myhspeed){
     s.times++;
     if(s.times>=s.offset)s.times=0;
     else{
      s.side=Math.sign(box(rt).x-s.x);const w=rt.create(word,s.x-20*s.side,s.y-10);s.word=w.id;w.vspeed=s.vspeed;
      if(rt.exists(object('obj_growtangle')))w.hspeed=s.myhspeed*s.side;
     }
     s.timer=0;
    }
    if(gt(s.y,rt.view.y+310)){s.imageAlpha-=.1;if(le(s.imageAlpha,0))rt.destroy(s);}
   }
   if(s.angrycon===2){s.sprite='spr_queen_pfps_mad';s.imageSpeed=.25;s.imageBlend=C.red;s.timer=rt.random.random(30);s.angrycon=3;}
   // Angry: curses straight at the soul.
   if(s.angrycon===3){
    s.timer++;
    if(ge(s.timer,22)){
     const w=rt.create(word,s.x-20*s.side,s.y-10);s.word=w.id;w.depth=s.depth-1;
     const h=heart(rt);w.angry=1;w.direction=pointDirection(w.x,w.y,h.x+10,h.y+10)+rt.random.randomRange(30,-30);w.imageAngle=w.direction;w.speed=7;
     s.timer=-rt.random.random(4);
    }
   }
  },
  draw:(s,rt)=>{
   s.index_timer+=.25;if(ge(s.index_timer,2))s.index_timer=0;
   const open=ge(s.index_timer,1);
   if(s.sprite==='spr_q_socialface_queen'||s.sprite==='spr_q_socialface_queen_laugh')rt.drawSprite(s.sprite,open?1:0,s.x,s.y,1,1,0,C.aqua,1);
   else if(s.sprite==='spr_queen_pfps')rt.drawSprite(open?'spr_queen_pfps_mouth_open':'spr_queen_pfps',s.chosen_face,s.x,s.y);
   else if(s.sprite==='spr_queen_pfps_mad')rt.drawSprite(open?'spr_queen_pfps_mad_mouth_open':'spr_queen_pfps_mad',s.chosen_face,s.x,s.y);
  },
 }};
 return [fade,word,avatar];
}
