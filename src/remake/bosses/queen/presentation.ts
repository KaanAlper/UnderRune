import type {GmInstance,GmRuntime} from '../../gm/runtime';
import {afterimage} from '../../deltarune/battle';
import {snd} from '../../deltarune/sound';
import {sideBPhase} from '../../deltarune/chapter2';
import {enemyDrawIdleGeneric} from '../../deltarune/chapter2-enemy';
import {drawBodyPart} from '../../deltarune/chapter2-battle';
import {lengthdirX,lengthdirY} from '../../gm/math';
import {msgSet} from '../../deltarune/chapter2-battle';
import {enemyBlcon2} from '../../deltarune/chapter2-objects';
import {sourceText} from '../../host/text';
import {type QueenObject,queenInstance} from './context';

/** The visual motion at the start of Queen Step; each source if can enter the next state in the same frame. */
export function queenPresentation(s:GmInstance,rt:GmRuntime,object:QueenObject){
 if(s.actcon===36&&s.alarm[4]>17)s.siner2=0;else{s.siner2++;s.y+=Math.sin(s.siner2/8);}
 if(s.endcon===0)s.idlesprite=['obj_queen_battlesolid_wine','obj_queen_wineglass','obj_queenshield_intro'].some(n=>rt.exists(object(n)))?'spr_queen_chair_1_battle':'spr_queen_chair_1_old';
 if(s.init===0){s.init=1;rt.globals.typer=70;rt.globals.charturn=3;msgSet(rt,0,sourceText('obj_queen_enemy_slash_Step_0_gml_12_0'));enemyBlcon2(s,rt,s.x-10,rt.globals.monstery[s.myself],10);s.ballooncon=15;s.balloonend=0;s.talked=.6;s.talktimer=0;}
 const shield=rt.first(object('obj_queenshield_enemy'));if(shield){shield.queenhandx=s.x+32;shield.queenhandy=s.y+10;}
 if(s.shieldbrokecon===1){
  if(sideBPhase(rt)<1)snd(rt,`snd_queen_hoot_${rt.random.choose(0,1,2)}`);
  if(s.shieldjustbroke===1)s.shieldjustbroke=0;s.sprite='spr_queen_hurt';
  if(s.hspeed===0){s.hspeed=20;s.x=s.xstart;s.remx=s.x;}else{if(s.hspeed<0)s.hspeed=0;s.hspeed+=20;if(s.hspeed>28)s.hspeed=28;}
  s.imageSpeed=.4;s.shieldbrokecon=2;
 }
 if(s.shieldbrokecon===2){s.hspeed-=2;if(s.x<=s.remx-s.hspeed&&s.hspeed<-5){s.x=s.remx;s.shieldbrokecon=0;s.hspeed=0;s.sprite='spr_queen_drunk';s.imageSpeed=1/6;}}
 if(s.wineglasscon===1){
  for(const sh of rt.withInstances(object('obj_queenshield_enemy')))sh.appearcon=2;
  for(const glass of rt.withInstances(object('obj_queen_battlesolid_wine')))rt.destroy(glass);
  const w=rt.create(object('obj_queen_battlesolid_wine'),s.x+29,s.y+10);s.wineglass=w.id;queenInstance(rt,object,'obj_queen_battlesolid_wine').nofill=1;
  rt.create(object('obj_queen_wine_shine'),s.x+10,s.y);s.winetimer=0;s.wineglasscon=2;s.sprite='spr_queen_throw_wineglass';
 }
 if(s.wineglasscon===2){
  const w=rt.byId(s.wineglass);if(!w)throw Error('Queen wineglass disappeared during throw');w.y+=Math.sin(s.siner2/8);s.winetimer++;
  if(s.winetimer>=30){w._idealx=rt.view.x+320;w._idealy=rt.view.y+228;w._remx=w.x;w._remy=w.y;s.sprite='spr_queen_drunk';s.imageSpeed=1/6;s.wineglasscon=3;s.winetimer=0;}
 }
 if(s.wineglasscon===3){
  s.winetimer++;const w=rt.byId(s.wineglass);if(!w)throw Error('Queen wineglass disappeared during throw');
  const a=rt.create(afterimage,w.x,w.y);w.after=a.id;Object.assign(a,{x:w.x,y:w.y,imageSpeed:0,imageXscale:w.imageXscale,imageYscale:w.imageYscale,sprite:w.sprite,depth:w.depth+1,imageBlend:0x00ff00});
  const t=s.winetimer/15;w.x=w._remx+(w._idealx-w._remx)*t;w.y=w._remy+(w._idealy-w._remy)*t;w.imageXscale=.4+1.6*t;w.imageYscale=.6+1.4*t;
  if(s.winetimer>=15){s.wineglasscon=0;for(const c of rt.withInstances(object('obj_queen_bulletcontroller')))c.init=3;for(const glass of rt.withInstances(object('obj_queen_wineglass')))glass.visible=true;for(const glass of rt.withInstances(object('obj_queen_battlesolid_wine')))rt.destroy(glass);}
 }
 if(s.wineglasscon===10){
  s.winetimer++;s.sprite='spr_queen_throw_wineglass';if(s.winetimer===1){if(!rt.exists(object('obj_queen_battlesolid_wine')))s.wineglass=rt.create(object('obj_queen_battlesolid_wine'),s.x+35,s.y+13).id;queenInstance(rt,object,'obj_queen_battlesolid_wine').imageAngle=-20;}
  if(s.winetimer<=15){rt.create(object('obj_queen_drink_droplet'),s.x+35,s.y+13);const d=rt.create(object('obj_queen_drink_droplet'),s.x+35,s.y+13);s.droplet=d.id;d.offset=.033;}
  if(s.winetimer===25){s.wineglasscon=0;queenInstance(rt,object,'obj_queen_battlesolid_wine').imageAngle=0;s.sprite='spr_queen_chair_1_old';}
 }
}

export function drawQueen(s:GmInstance,rt:GmRuntime,object:QueenObject){
 const g=rt.globals;
 for(const name of ['obj_berdlyplug_enemy','obj_herokris','obj_herosusie','obj_heroralsei'])for(const t of rt.withInstances(object(name)))t.flash=0;
 let flash=0;const shield=rt.exists(object('obj_queenshield_enemy'));
 if(g.bmenuno===9){
  const row=g.bmenucoord[9][g.charturn];if(row!==4&&row!==5&&(s.shieldacthp<=0||s.shieldhp<=0))flash=1;
  if(!shield&&row===3)flash=0;
  if((row===4&&!shield)||(row===3&&shield)){for(const name of ['obj_herokris','obj_herosusie','obj_heroralsei'])for(const h of rt.withInstances(object(name)))h.flash=1;s.flash=0;}
 }
 if(g.bmenuno===13&&g.bmenucoord[2][g.charturn]===0&&(s.shieldacthp<=0||s.shieldhp<=0))flash=1;
 if(g.charturn===2&&g.bmenuno===13&&g.bmenucoord[2][g.charturn]===1&&(s.shieldacthp<=0||s.shieldhp<=0))flash=1;
 if(flash===1){const b=rt.first(object('obj_berdlyplug_enemy'));if(b)b.flash=1;s.flash=0;}
 if(s.sprite==='spr_queen_drunk'||s.sprite==='spr_queen_throw_wineglass'||s.sprite==='spr_queen_hurt'||(s.sprite===s.idlesprite&&s.state===3)){
  s.imageIndex+=1/6;rt.drawSelf(s);s.fsiner++;if(s.flash===1)rt.drawSpriteFog(s.sprite!,s.imageIndex,s.x,s.y,s.imageXscale,s.imageYscale,s.imageAngle,s.imageBlend,-Math.cos(s.fsiner/5)*.4+.6);
  if(s.endcon>0&&s.sprite==='spr_queen_throw_wineglass')rt.drawSprite('spr_queen_wine_box1',0,s.x+29,s.y+10,.4,.6,0,0xffffff,1);
 }else{
  const b=rt.first(object('obj_queen_buffercontroller'));
  if(b&&b.buffering===1){rt.drawSprite(s.thissprite,s.siner,s.x,s.y,s.imageXscale,s.imageYscale,s.imageAngle,0x808080,s.imageAlpha);rt.drawSprite('spr_queen_buffering',b.bufferbar%8,s.x+66,s.y+76,1,1,0,0xffffff,1);}
  else enemyDrawIdleGeneric(s,rt,1/6);
 }
 if(s.becomeflash===0)s.flash=0;s.becomeflash=0;
}
