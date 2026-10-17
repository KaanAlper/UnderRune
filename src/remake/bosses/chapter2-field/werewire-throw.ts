import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {lengthdirX,lengthdirY,lt,gt} from '../../gm/math';
import {spareAnim} from '../../deltarune/battle';
import {button3_p} from '../../deltarune/controller';
import {battleTextDefault,destroyWriters,writer} from '../../deltarune/writer';
import {snd,mergeColor} from '../../deltarune/chapter2-battle';
import {scrAfterimageCut} from '../spamton-neo/support';
import {sourceText} from '../../host/text';
const body=(rt:GmRuntime,object:(name:string)=>GmObjectDef,name:string)=>{const h=rt.first(object(name));if(!h)throw Error(`Werewire throw requires ${name}`);return h;};
export function createWerewireThrow(object:(name:string)=>GmObjectDef):GmObjectDef[]{
 const target:GmObjectDef={...object('obj_werewire_throwtarget'),events:{
  create:(s,rt)=>{Object.assign(s,{imageXscale:2,imageYscale:2,imageSpeed:0.2,good:1,offing:0,con:1,xPos:s.x,yPos:s.y,moveY:0,moveAmount:0,collided:0,timer:0});s.y-=120;s.t=rt.random.random(360);s.yy=s.y;s.increment=rt.random.randomRange(3.8,4.2);s.amplitude=75;for(let n=0;n<2;n++){s.t=(s.t+s.increment)%360;s.shift=s.amplitude*Math.sin(s.t*Math.PI/180);s.y=s.yy+s.shift;}s.x=s.xstart-(s.y-rt.view.y+0.1)/3.375+18;},
  step:(s,rt)=>{s.timer++;if(s.con===1){s.t=(s.t+s.increment)%360;s.shift=s.amplitude*Math.sin(s.t*Math.PI/180);s.y=s.yy+s.shift;s.sprite='spr_berdly_plug_target';s.x=s.xstart-(s.y-rt.view.y+0.1)/3.375+18+rt.spriteWidth(s)/2;}if(s.con===5){const slash=rt.create(object('obj_slashEffect'),s.x,s.y);s.slash=slash.id;slash.imageAngle=s.imageAngle+45;scrAfterimageCut(s,rt,object);rt.destroy(s);}},
 }};
 const kris:GmObjectDef={...object('obj_werewire_kristhrown'),events:{
  create:(s,rt)=>{Object.assign(s,{con:0,yy:rt.view.y,xx:rt.view.x,timer:0,collided:0,mypower:10});},
  step:(s,rt)=>{if(s.con===0||s.con===2)s.imageAngle=s.direction;const h=()=>body(rt,object,'obj_herokris');
   if((s.x>s.xx+700||s.y<s.yy-40)&&s.con===0){s.gravity=0;s.speed=0;s.x=s.xx-40;s.y=h().y;s.sprite='spr_krisb_idle';s.imageAngle=0;s.hspeed=20;s.con=10;}
   if(s.con===10){s.timer++;if(s.x>=h().x-10){if(s.collided===0){rt.globals.msg[0]=sourceText('obj_werewire_kristhrown_slash_Step_0_gml_25_0');battleTextDefault(rt,s);}for(const name of ['obj_herokris','obj_herosusie'])for(const hero of rt.all(object(name)))hero.visible=true;s.visible=false;for(const t of rt.all(target))rt.destroy(t);for(const t of rt.all(object('obj_werewire_throwkris')))rt.destroy(t);s.con=11;}}
   if(s.con===11&&!rt.exists(writer)){const name=rt.exists(object('obj_werewire_enemy'))?'obj_werewire_enemy':'obj_werewerewire_enemy';for(const enemy of rt.withInstances(object(name)))if(enemy.acting===3)enemy.actcon=15;rt.destroy(s);}
   if(s.con===2&&(s.x<s.xx-40||s.y>s.yy+520)){s.timer=0;s.gravity=0;s.speed=0;s.x=s.xx-40;s.y=h().y;s.sprite='spr_krisb_idle';s.imageAngle=0;s.hspeed=20;s.con=10;}
  },
 },collisions:[{target,run:(s,t,rt)=>{if(t.collided!==0)return;
   if(t.good===1){rt.globals.msg[0]=sourceText('obj_werewire_kristhrown_slash_Collision_048192d7_9c3b_472a_adb9_e1f06953ce64_gml_10_0');snd(rt,'snd_laz_c');if(rt.exists(object('obj_werewire_enemy'))){const maker=rt.byId(t.maker);if(maker)maker.mercyaccumulated=50;}if(t.offing===1){t.con=1;t.vspeed=-8;}else t.con=5;}
   else{snd(rt,'snd_noise');t.con=7;const ordinary=rt.exists(object('obj_werewire_enemy')),name=ordinary?'obj_werewire_enemy':'obj_werewerewire_enemy';for(const e of rt.withInstances(object(name)))if(e.acting===3)e.loosenAmount=Math.max(0,Math.min(e.loosenAmount+(ordinary?0.25:0.125),1));rt.globals.msg[0]=sourceText('obj_werewire_kristhrown_slash_Collision_048192d7_9c3b_472a_adb9_e1f06953ce64_gml_75_0');s.hspeed=-12;s.vspeed=-4;s.gravity=0.5;s.con=2;}
   battleTextDefault(rt,s);t.collided=1;s.collided=1;
 }}]};
 const throwing:GmObjectDef={...object('obj_werewire_throwkris'),events:{
  create:(s,rt)=>{Object.assign(s,{angle:0,throwcon:1,angledraw:1,imageXscale:2,imageYscale:2,radius:300,anglespeed:2,kx:184+rt.view.x,ky:170+rt.view.y,lx:rt.view.x,ly:rt.view.y,krisyoff:Array(1000).fill(0),krisgrav:1,fro:0,mypower:30,maxpower:30,minpower:15,powerdir:1,powerspeed:0.6,throwready:0,throwalpha:0,activatethrow:0});},
  step:(s,rt)=>{if(s.throwcon===1){if(s.throwready===0)s.angle+=s.anglespeed;if(s.angle>=42)s.anglespeed=-2;if(s.angle<=-2)s.anglespeed=2;if(button3_p(rt)){s.activatethrow=1;destroyWriters(rt);}if(s.activatethrow===1){s.throwready=1;s.activatethrow=0;s.imageIndex=0;s.imageSpeed=0.5;s.sprite='spr_susieb_attack_unarmed';s.angledraw=0;s.throwcon=2;snd(rt,'snd_ultraswing');const k=rt.create(kris,s.kx,s.ky);s.kris=k.id;k.speed=s.mypower;k.mypower=s.mypower;k.imageXscale=2;k.imageYscale=2;k.direction=s.angle;k.imageAngle=s.angle;k.gravity=s.krisgrav;}}
   if(s.throwcon===2&&s.imageIndex>=5)s.imageSpeed=0;
   if(s.angledraw===1){s.lx=lengthdirX(s.mypower,s.angle);s.ly=lengthdirY(s.mypower,s.angle);for(s.i=0;s.i<42;s.i++){s.krisyadd=s.krisgrav+s.krisgrav*s.i;s.krisyoff[s.i]=s.i>0?s.krisyoff[s.i-1]+s.krisyadd:s.krisyadd;}}
  },
  draw:(s,rt)=>{rt.drawSelf(s);if(s.angledraw===0)s.throwalpha=0;if(s.angledraw===1){if(s.throwalpha<1)s.throwalpha+=0.125;rt.drawState.alpha=s.throwalpha;rt.drawState.color=mergeColor(0xff0000,0xffffff,0.5);for(s.i=0;s.i<12;s.i++){s.fr=2;const n=s.i*s.fr+s.fro,next=(s.i+1)*s.fr+s.fro,x=s.kx+s.lx*n,y=s.ky+s.ly*n+s.krisyoff[n];rt.drawCircle(x,y,4);rt.drawLine(x,y,s.kx+s.lx*next,s.ky+s.ly*next+s.krisyoff[next],2);rt.drawSprite('spr_werewire_throwarrow',0,s.kx,s.ky,2,2,s.angle,0x0000ff,1);}rt.drawState.alpha=1;}},
 }};
 const spare2:GmObjectDef={...object('obj_werewire_spare2'),events:{
  create:(s,rt)=>{s.imageXscale=2;s.imageYscale=2;s.alarm[0]=1;if(lt(rt.random.random(10),5))s.sprite='spr_plugboy_cower';},
  alarm0:(s,rt)=>{s.x-=41;s.y-=35;s.sprite='spr_plugboy_spare';const a=rt.create(spareAnim,s.x,s.y);s.spareanim=a.id;a.sprite=s.sprite;a.imageIndex=s.imageIndex;a.imageXscale=s.imageXscale;a.imageYscale=s.imageYscale;rt.destroy(s);},
 }};
 const spare:GmObjectDef={...object('obj_werewire_spare'),events:{
  create:(s,rt)=>{Object.assign(s,{imageXscale:2,imageYscale:2,imageIndex:23,imageSpeed:0,con:0,timer:0,depth:90-(s.y-rt.view.y)/50});},
  step:(s,rt)=>{if(s.con===0){if(gt(s.imageIndex,17))s.imageIndex-=0.4;else s.con=1;}if(s.con===1){s.timer++;if(s.timer===1){s.sprite='spr_plugboy_plug';s.imageIndex=0;s.imageSpeed=0;s.hspeed=-8;s.friction=0.5;s.gravity=-1.5;const a=rt.create(spare2,s.x-6,s.y+16);s.spare=a.id;a.depth=s.depth+1;s.x+=6;s.y+=8;}if(s.timer===60)rt.destroy(s);}},
  draw:(s,rt)=>{if(s.sprite!=='spr_plugboy_plug')rt.drawSprite('spr_plugboy_plug',1,s.x+2,s.y+5,2,2,0,0xffffff,1);rt.drawSelf(s);},
 }};
 const slash:GmObjectDef={...object('obj_slashEffect'),events:{create:s=>{s.imageXscale=2;s.imageYscale=2;s.imageSpeed=0.25;},step:()=>{},animationEnd:(s,rt)=>rt.destroy(s)}};
 return [target,kris,throwing,spare,spare2,slash];
}
