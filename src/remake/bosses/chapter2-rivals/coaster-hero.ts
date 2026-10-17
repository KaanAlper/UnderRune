import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {snd} from '../../deltarune/sound';
const HEROES=['obj_herokris','obj_herosusie','obj_heroralsei'];
const HALF_SCALE=new Set(['spr_susieb_actready','spr_susieb_act','spr_susieb_attackready','spr_susieb_attack','spr_susieb_defend','spr_susie_rudebuster','spr_susie_spell','spr_susie_spellready','spr_susie_actready','spr_susie_act','spr_susie_attackready','spr_susie_attack','spr_susie_defend']);
const OFFSETS:Record<string,[number,number]>={spr_krisb_idle:[4,-11],spr_krisb_attack:[0,8],spr_krisb_attackready:[0,8],spr_susie_idle:[0,-9],spr_susieb_idle:[0,-9],spr_susieb_itemready:[0,-9],spr_susieb_item:[0,-9],spr_ralsei_idle:[-12,-9],spr_ralsei_spell:[-12,-9],spr_ralsei_spellready:[-12,-9],spr_ralsei_act:[-12,0],spr_ralsei_walk_right:[0,-16],spr_ralsei_right:[0,-16],spr_krisb_victory:[0,-11],spr_ralsei_victory:[0,-9],spr_krisr_dark:[5,-10],spr_susie_right_dw:[10,-13]};
const REAL_SPRITES=[['spr_krisb_hurt','spr_krisb_defend','spr_krisb_item','spr_krisb_itemready','spr_krisb_actready','spr_krisb_attackready','spr_krisb_attack'],['spr_susie_hurt','spr_susieb_hurt','spr_susieb_defend','spr_susie_rudebuster','spr_susieb_actready','spr_susieb_itemready','spr_susieb_item','spr_susieb_attackready','spr_susieb_attack'],['spr_ralsei_hurt_fixed','spr_ralsei_defend','spr_ralsei_item','spr_ralsei_itemready','spr_ralsei_spell','spr_ralsei_spellready']];
export function createBerdlyCoasterHeroes(object:(name:string)=>GmObjectDef):GmObjectDef[]{
 const get=(rt:GmRuntime,name:string)=>rt.first(object(name))!;
 const draw=(s:GmInstance,rt:GmRuntime,clamp=true)=>{
  const a=HALF_SCALE.has(s.sprite!)||s.sprite==='spr_susieb_spell'?1.5:2;
  let hurt=['spr_krisb_hurt','spr_susie_hurt','spr_susieb_hurt','spr_ralsei_hurt_fixed'].includes(s.sprite!)?1:0;
  const real=rt.first(object(HEROES[s.HeroID]));if(real&&real.hurt>0)hurt=1;
  const back=rt.byId(s.back)!;back.x=s.x;back.y=s.y+8;
  const xx2=s.sprite==='spr_susie_act'?-5:s.sprite==='spr_susieb_act'?-9:0,yy2=s.sprite==='spr_susie_act'?5:s.sprite==='spr_susieb_act'?7:0;
  if(clamp&&s.imageIndex<0)s.imageIndex=0;
  if(s.userealsprite===0)rt.drawSprite(s.sprite!,s.imageIndex,s.x+20+s.xx+xx2,s.y-rt.spriteHeight(s)/s.imageYscale*a+s.yy+yy2+8,s.imageXscale,s.imageYscale,0,0xffffff,s.imageAlpha);
  const susie=rt.first(object('obj_herosusie'));if(susie){if(susie.sprite==='spr_susier_dark')susie.sprite='spr_susie_walk_right_dw';if(susie.sprite==='spr_susie_walk_right_dw')susie.x+=9;}
  const ralsei=rt.first(object('obj_heroralsei'));if(ralsei?.sprite==='spr_ralsei_walk_right'){ralsei.x+=7;ralsei.y+=3;}
  rt.drawSprite(hurt?'spr_coaster_hero_hurt':'spr_coaster_hero',s.HeroID,s.x,s.y+8,s.imageXscale,s.imageYscale,0,0xffffff,s.imageAlpha);
  if(s.hspeed<0||s.disabled===1){if(s.userealsprite===0)rt.drawSprite(s.sprite!,s.imageIndex,s.x+20+s.xx,s.y-rt.spriteHeight(s)/s.imageYscale*a+s.yy+8,s.imageXscale,s.imageYscale,0,0,.4);rt.drawSprite(hurt?'spr_coaster_hero_hurt':'spr_coaster_hero',s.HeroID,s.x,s.y+8,s.imageXscale,s.imageYscale,0,0,.4);}
 };
 const hero:GmObjectDef={...object('o_coaster_hero'),events:{
  create:s=>{Object.assign(s,{HeroID:0,xx:0,yy:0,forceact:1,gooffscreen:0,userealsprite:0,introanim:1,endtargetx:0,endscene:0,endscenetimer:0,imageSpeed:.25,imageXscale:2,imageYscale:2,mask:'spr_coaster_hero',visible:false,siner:0,smoketimer:0,con:0,action:0,mykey:81,damaged:0,mykeybuffer:0,nitro:0,barrier:0,disabled:0,disabledtimer:0,disabledtype:0,flametimer:0,flameindex:0,flameindextimer:0,fsiner:0,actoncondelay:0,dontshowherosprite:0,draw_button_press:0,draw_button_press_timer:0,bump:0});},
  step:(s,rt)=>{
   const enemy=get(rt,'obj_berdlyb_enemy'),c=get(rt,'o_coaster_controller');s.nitro=enemy&&enemy.nitro>0?1:0;
   if(c.actcon===1&&c.timer<c.timermax&&s.bump===1&&s.HeroID>=0&&s.HeroID<=2&&s.gooffscreen===0&&s.visible){
    s.bump=0;s.mykeybuffer=3;c.playerinput=1;const act=['spr_krisb_act','spr_susie_act','spr_ralsei_act'][s.HeroID];
    if(s.sprite!==act||s.imageIndex>[9,8,11][s.HeroID]){s.sprite=act;s.imageIndex=0;s.forceact=1;s.imageSpeed=.5;}
   }
   if(c.actcon!==0)s.actoncondelay=1;if(rt.exists(object('obj_battleblcon')))s.actoncondelay=0;
   if(c.actcon===0&&s.actoncondelay===0&&s.endscene===0&&s.forceact===0){const real=rt.first(object(HEROES[s.HeroID]));if(real){s.sprite=real.sprite;s.imageIndex=real.imageIndex-1;}}
   if(s.sprite==='spr_krisb_act'&&s.imageIndex>10){get(rt,'obj_herokris').sprite='spr_krisb_idle';s.imageSpeed=.25;s.sprite='spr_krisb_idle';}
   if(s.sprite==='spr_susie_act'&&s.imageIndex>9){s.sprite='spr_susieb_idle';s.imageSpeed=.25;}if(s.sprite==='spr_susieb_act'&&s.imageIndex>9)s.sprite='spr_susieb_idle';
   if(s.sprite==='spr_ralsei_act'&&s.imageIndex>11){s.sprite='spr_ralsei_idle';s.imageSpeed=.25;s.forceact=0;}
   for(const [from,to,frame] of [['spr_krisb_attack','spr_krisb_idle',0],['spr_susie_attack','spr_susieb_idle',0],['spr_ralsei_battleintro','spr_ralsei_idle',9]] as const)if(s.sprite===from&&s.forceact===1&&s.introanim===1){s.sprite=to;s.imageSpeed=0;s.imageIndex=frame;s.forceact=0;s.introanim=0;}
   const scene=rt.first(object('obj_ch2_scene11a'));
   if(s.endscene===1&&scene){const actor=rt.byId(scene[['coaster_kris','coaster_susie','coaster_ralsei'][s.HeroID]])!;const x=actor.x+(s.HeroID===2?8:0)+actor.sinerx+actor.coaster_offset_x,y=actor.y+(s.HeroID===2?44:37)+actor.sinery+actor.coaster_offset_y;if(s.endscenetimer<10)s.endscenetimer++;s.x+=(x-s.x)*s.endscenetimer/10;s.y+=(y-s.y)*s.endscenetimer/10;}
   if(s.disabled===1){s.disabledtimer--;if(s.disabledtimer<=0)s.disabled=0;}
   if(s.con===0){s.siner+=.4;if(s.gooffscreen===0&&s.endscene===0)s.x=s.xstart+Math.sin(s.siner/6)*3;if(s.mykeybuffer>0&&s.disabled===0){s.con=1;snd(rt,'snd_drive',1+rt.random.random(.2));s.dashtimer=0;s.damaged=0;c.buttonspressed++;}}
   if(s.con===1){const fast=enemy.bumpactfast===1;s.hspeed=Math.min(s.nitro===1?60:fast?45:30,s.hspeed+(s.nitro===1?8:fast?6:4));s.smoketimer+=2;if(s.smoketimer>=3)s.smoketimer=0;if(s.x>=rt.view.x+200)s.con=2;if(s.damaged===1){s.con=5;s.hspeed=s.nitro===1?-200:-48;}}
   if(s.con===2){if(s.damaged===1)s.con=5;if(s.hspeed>=-6)s.hspeed-=2;if(s.nitro===1){s.hspeed--;if(s.x>=rt.view.x+400&&s.hspeed>0)s.hspeed=-2;}if(s.x<=s.xstart+10){s.damaged=0;s.hspeed=0;s.siner=0;s.con=0;}}
   if(s.con===5){s.hspeed=s.nitro===1?-100:-30;if(s.x<=s.xstart-s.hspeed){s.hspeed=0;s.damaged=0;s.siner=0;s.con=0;}}
   s.mykeybuffer--;if(s.gooffscreen===2&&s.HeroID===0)s.x-=2;
  },
  endStep:(s,rt)=>{
   const real=rt.first(object(HEROES[s.HeroID]));if(real){s.depth=[80,75,70][s.HeroID];real.depth=s.depth+1;}
   const back=rt.byId(s.back)!;back.x=s.x;back.y=s.y+8;
   let [xx,yy]=OFFSETS[s.sprite!]??[0,0];if(s.HeroID===1)xx-=10;const a=HALF_SCALE.has(s.sprite!)?1.5:2,y=s.y-rt.spriteHeight(s)/s.imageYscale*a+yy;s.userealsprite=0;
   if(real){
    let allowed=REAL_SPRITES[s.HeroID].includes(s.sprite!)||s.sprite===['spr_krisb_idle','spr_susieb_idle','spr_ralsei_idle'][s.HeroID]&&s.dontshowherosprite<1,offset=8,xoffset=20;
    if(s.HeroID===1){const rb=rt.first(object('obj_rudebuster_anim'));if(real.hurt>0)allowed=true;else if(!allowed&&rb){rb.x=s.x+20+xx;rb.y=y+64;allowed=true;offset=24;}else if(s.sprite==='spr_susieb_spell'){allowed=true;offset=64;}else if(s.sprite==='spr_susieb_spellready'){allowed=true;offset=27;}}
    if(s.HeroID===2&&s.sprite==='spr_ralsei_defend')xoffset=10;
    if(allowed){real.x=s.x+xoffset+xx;real.y=y+offset;s.userealsprite=1;real.depth=s.depth+1;}else if(s.dontshowherosprite>0){s.dontshowherosprite--;s.userealsprite=0;}else real.x=rt.view.x-300;
    if(s.HeroID===2&&real.sprite==='spr_ralsei_idle'&&s.sprite==='spr_ralsei_spell'){real.x=s.x+20+xx;real.y=y;s.userealsprite=1;real.depth=s.depth+1;}
   }
   for(const [from,to,threshold,frame] of [['spr_krisb_attack','spr_krisb_idle',6.5,0],['spr_susie_attack','spr_susieb_idle',3.5,0],['spr_ralsei_battleintro','spr_ralsei_idle',10,9]] as const)if(s.sprite===from&&s.imageIndex>threshold&&s.forceact===1&&s.introanim===1){s.sprite=to;s.imageSpeed=0;s.imageIndex=frame;s.forceact=0;s.introanim=0;}
  },
  draw:(s,rt)=>draw(s,rt),user15:(s,rt)=>draw(s,rt,false),
  user14:()=>{throw Error('Coaster alternate developer User Event 14 is not ported');},
  destroy:(_s,rt)=>{for(const b of rt.all(object('o_coaster_hero_back')))rt.destroy(b);},
 }};
 const back:GmObjectDef={...object('o_coaster_hero_back'),events:{create:(s,rt)=>{s.depth=get(rt,'o_coaster_hero').depth+20;s.imageSpeed=0;s.imageXscale=2;s.imageYscale=2;},step:()=>{},draw:(s,rt)=>rt.drawSelf(s)}};
 return [hero,back];
}
