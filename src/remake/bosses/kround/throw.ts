// Encounter 27's Ralsei throw minigame: Susie aims, sets the power, and throws Ralsei at K.Round's crown.
import type {GmObjectDef,GmInstance,GmRuntime} from '../../gm/runtime';
import {ge,le,lt,gt,lengthdirX,lengthdirY} from '../../gm/math';
import {heroRalsei,heroSusie,KEY} from '../../deltarune/battle';
import {checkersEnemy} from './enemy';
import {inputName} from '../../deltarune/controller';
import {battleTextDefault,destroyWriters} from '../../deltarune/writer';
import {sourceText} from '../../host/text';

/** The throw game's lines: the power instructions, the hits and the miss. */
const LINES={
 'crown-hit':'obj_ralseithrown_slash_Collision_154b9139_8c0d_44d5_b8de_0f03c1a8096c_gml_6_0',
 'body-hit':'obj_ralseithrown_slash_Collision_154b9139_8c0d_44d5_b8de_0f03c1a8096c_gml_29_0',
 'miss':'obj_ralseithrown_slash_Step_0_gml_23_0',
} as const;
function text(rt:GmRuntime,message:keyof typeof LINES|'power-instructions'){
 destroyWriters(rt);
 rt.globals.msg[0]=message==='power-instructions'?sourceText('obj_throwralsei_slash_Step_0_gml_26_0')+inputName(6)+sourceText('obj_throwralsei_slash_Step_0_gml_26_1'):sourceText(LINES[message]);
 battleTextDefault(rt);
}
const press=(rt:GmRuntime)=>rt.input.pressed.has(KEY.c)||rt.input.pressed.has(KEY.ctrl);

export const throwTarget:GmObjectDef={name:'obj_throwtarget',index:263,depth:4,sprite:'spr_checkers_crown',events:{
 create:(s,rt)=>{s.imageXscale=2;s.imageYscale=2;s.imageSpeed=.2;s.good=1;s.offing=0;
  if(rt.count(throwTarget)===1){const body=rt.create(throwTarget,s.x,s.y);s.tt=body.id;body.depth=s.depth+1;body.offing=0;body.good=0;body.sprite='spr_checkers_idle_crownless';}s.con=0;
 },
 step:s=>{
  if(s.con===1)s.imageAngle+=10;
  if(s.con===5){if(lt(s.x,s.xstart+40))s.x+=10;s.con=6;}
  if(s.con===6&&gt(s.x,s.xstart))s.x-=2;
  if(s.con===7){if(lt(s.x,s.xstart+40))s.x+=8;s.con=6;}
 },
}};

export const ralseiThrown:GmObjectDef={name:'obj_ralseithrown',index:264,depth:1,sprite:'spr_ralsei_thrown',events:{
 create:(s,rt)=>{s.con=0;s.yy=rt.view.y;s.xx=rt.view.x;s.timer=0;s.collided=0;s.mypower=10;},
 step:(s,rt)=>{
  if(s.con===0||s.con===2)s.imageAngle=s.direction;
  if((gt(s.x,s.xx+700)||lt(s.y,s.yy-40))&&s.con===0)beginReturn(s,rt);
  if(s.con===10){s.timer+=1;if(ge(s.x,rt.first(heroRalsei)!.x-10)){
   if(s.collided===0)text(rt,'miss');
   for(const h of rt.all(heroRalsei))h.visible=true;for(const h of rt.all(heroSusie))h.visible=true;
   for(const enemy of rt.all(checkersEnemy)){enemy.actcon=1;enemy.visible=true;}
   for(const t of rt.all(throwTarget))rt.destroy(t);for(const t of rt.all(throwRalsei))rt.destroy(t);rt.destroy(s);
  }}
  if(s.con===2&&(lt(s.x,s.xx-40)||gt(s.y,s.yy+520))){s.timer=0;beginReturn(s,rt);}
 },
},collisions:[{target:throwTarget,run:(s,other,rt)=>{
 if(s.collided!==0)return;
 if(other.good===1){for(const e of rt.all(checkersEnemy))e.crown+=35;rt.sound?.('snd_coin');
  if(other.offing===1){other.con=1;other.vspeed=-8;}else other.con=5;text(rt,'crown-hit');
 }else{rt.sound?.('snd_noise');other.con=7;for(const e of rt.all(checkersEnemy))e.crown+=20;
  s.hspeed=-12;s.vspeed=-4;s.gravity=.5;s.con=2;text(rt,'body-hit');
 }s.collided=1;
}}]};
function beginReturn(s:GmInstance,rt:GmRuntime){s.gravity=0;s.speed=0;s.x=s.xx-40;s.y=rt.first(heroRalsei)!.y;s.sprite='spr_ralseib_idle';s.imageAngle=0;s.hspeed=20;s.con=10;}

export const throwRalsei:GmObjectDef={name:'obj_throwralsei',index:265,sprite:'spr_susieb_throwralseiready',events:{
 create:s=>{Object.assign(s,{angle:0,throwcon:1,angledraw:1,imageXscale:2,imageYscale:2,radius:300,anglespeed:2,rx:s.x+70,ry:s.y+30,ralspeed:26,ralgrav:1,fro:0,mypower:15,maxpower:30,minpower:15,powerdir:1,powerspeed:.6,throwready:0,throwalpha:0,activatethrow:0,ralyoff:[]});},
 step:(s,rt)=>{
  if(s.throwcon===1){
   if(s.throwready===0)s.angle+=s.anglespeed;if(s.angle>=30)s.anglespeed=-2;if(s.angle<=-15)s.anglespeed=2;
   if(press(rt)&&ge(s.throwalpha,.9)&&s.throwready===1){s.activatethrow=1;destroyWriters(rt);}
   if(press(rt)&&s.throwready===0){s.throwready=1;text(rt,'power-instructions');}
   if(s.activatethrow===1){s.activatethrow=0;s.throwready=0;s.imageIndex=0;s.imageSpeed=.5;s.sprite='spr_susieb_attack_unarmed';s.angledraw=0;s.throwcon=2;rt.sound?.('snd_ultraswing');
    const ral=rt.create(ralseiThrown,s.rx,s.ry);s.ral=ral.id;ral.speed=s.mypower;ral.mypower=s.mypower;ral.imageXscale=2;ral.imageYscale=2;ral.direction=s.angle;ral.imageAngle=s.angle;ral.gravity=s.ralgrav;
   }
   if(s.throwready===1){s.mypower+=s.powerdir*s.powerspeed;if(s.mypower>=s.maxpower)s.powerdir=-1;if(s.mypower<=s.minpower)s.powerdir=1;}
  }
  if(s.throwcon===2&&ge(s.imageIndex,5))s.imageSpeed=0;
  if(s.angledraw===1){s.lx=lengthdirX(s.mypower,s.angle);s.ly=lengthdirY(s.mypower,s.angle);
   for(s.i=0;s.i<42;s.i+=1){s.ralyadd=s.ralgrav+s.ralgrav*s.i;s.ralyoff[s.i]=s.i>0?s.ralyoff[s.i-1]+s.ralyadd:s.ralyadd;}
  }
 },
 draw:(s,rt)=>{
  rt.drawSelf(s);if(s.angledraw!==1)return;
  if(s.throwready===1){if(lt(s.throwalpha,1))s.throwalpha+=.125;
   const color=0xff7f7f; // GML merge_color(c_blue,c_white,0.5), BGR channels truncated
   rt.drawState.alpha=s.throwalpha;rt.drawState.color=color;
   for(s.i=0;s.i<12;s.i+=1){s.fr=2;const a=s.i*s.fr+s.fro,b=(s.i+1)*s.fr+s.fro;
    const x=s.rx+s.lx*a,y=s.ry+s.ly*a+s.ralyoff[a]-20;
    rt.drawCircle(x,y,4);rt.drawLine(x,y,s.rx+s.lx*b,s.ry+s.ly*b+s.ralyoff[b]-20,2);
    rt.drawSprite('spr_throwarrow',0,s.rx,s.ry-20,2,2,s.angle,0x0000ff,1);
   }rt.drawState.alpha=1;
  }
  if(s.throwready===0){rt.drawState.color=0x0000ff;rt.drawSprite('spr_throwarrow',0,s.rx,s.ry-20,2,2,s.angle,0xffffff,1);}
 },
}};
