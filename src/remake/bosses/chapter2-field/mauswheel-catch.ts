import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {pointDirection,ge,le} from '../../gm/math';
import {button3_p} from '../../deltarune/controller';
import {mercyAdd2,snd} from '../../deltarune/chapter2-battle';
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
export function createMauswheelCatch(object:(n:string)=>GmObjectDef):GmObjectDef[]{
 const little:GmObjectDef={...object('obj_maus_liddle'),events:{
  create:(s,rt)=>{Object.assign(s,{fakegrav:0,fakey:0,fakeyspeed:0,imageXscale:2,imageYscale:2,timer:0,con:0});s.hspeed=rt.random.randomRange(-16,-6);s.vspeed=rt.random.randomRange(-3,3);s.fakeyspeed=-2-rt.random.random(8);s.fakegrav=1;s.sineradd=1;s.siner=rt.random.random(8);s.amplitude=0;s.maxamplitude=9+rt.random.random(5);s.xx=rt.view.x;s.yy=rt.view.y;s.creator=object('obj_maus_split').index;s.captured=0;},
  step:(s,rt)=>{if(s.con===0){s.timer++;if(s.timer>=20){s.timer=0;s.fakey=0;s.con=1;s.hspeed=0;s.vspeed=0;}}
   if(s.con===1){s.siner+=s.sineradd;s.x+=rt.random.randomRange(1,-1);s.y+=rt.random.randomRange(1,-1);s.amplitude=mix(s.amplitude,s.maxamplitude,0.2);s.x+=Math.sin(s.siner/8)*s.amplitude;s.x=Math.max(s.xx+200,Math.min(s.x,s.xx+600));s.y=Math.max(s.yy+40,Math.min(s.y,s.yy+240));s.timer++;s.btimer=0;}
   if(s.captured===1){const b=rt.first(object('obj_maus_split_basket'));if(b){s.imageAlpha=b.imageAlpha;if(le(s.imageAlpha,0.2))rt.destroy(s);}}
   if(s.con===2){const c=rt.first(object('obj_maus_split'));if(!c)rt.destroy(s);else{s.timer++;if(s.timer>=3){s.timer=0;s.setMotion(pointDirection(s.x,s.y,c.x+rt.spriteWidth(c)/2,c.y+rt.spriteHeight(c)/2),10+rt.random.random(6));}s.btimer++;if(s.btimer>=30){if(c.mcon===2)c.mcon=3;s.imageXscale-=0.2;s.imageYscale-=0.2;if(le(s.imageXscale,0))rt.destroy(s);}}}
  },draw:(s,rt)=>{if(s.sprite)rt.drawSprite(s.sprite,s.imageIndex,s.x,s.y+s.fakey,s.imageXscale,s.imageYscale,s.imageAngle,s.imageBlend,s.imageAlpha);},
 }};
 const basket:GmObjectDef={...object('obj_maus_split_basket'),events:{
  create:(s,rt)=>{Object.assign(s,{con:0,notime:0,xx:rt.view.x,yy:rt.view.y,draw_in:0,draw_in_timer:0,caught:0,extra_mode:1,noisevol:1});const w=rt.first(object('obj_mauswheel_enemy'));if(w)s.extra_mode=w.basket_size;},
  step:(s,rt)=>{if(s.con===0){if(s.extra_mode===1)s.imageXscale=1;if(s.extra_mode===0)s.imageXscale=0.6;if(s.y<=s.yy+rt.spriteHeight(s))s.y+=10;else{s.y=s.yy+rt.spriteHeight(s);s.con=1;s.timer=0;s.siner=0;}}
   if(s.con===1){s.siner++;s.x=s.xstart+Math.sin(s.siner/6)*120;if(button3_p(rt)){s.con=2;s.vspeed=20;s.friction=0.5;for(const m of rt.all(little)){m.con=5;m.timer=0;}snd(rt,'snd_wallclaw');}}
   if(s.con===2){if(ge(s.y,s.yy+240))s.imageAlpha-=0.2;if(le(s.imageAlpha,0)){s.con=3;for(const m of rt.all(little))if(m.captured===0)m.con=2;rt.destroy(s);}}
   if(s.con===10&&s.y<=s.yy-100)rt.destroy(s);
  },
  draw:(s,rt)=>{rt.drawSelf(s);if(s.draw_in){rt.drawSprite('spr_maus_intext',0,s.x-40,s.y-s.draw_in_timer,2,2,0,0xffffff,2-s.draw_in_timer/10);s.draw_in_timer++;}},
 },collisions:[{target:little,run:(s,m,rt)=>{if(m.con===5&&m.captured===0){s.caught++;m.depth=s.depth+1;m.captured=1;s.draw_in=1;if(s.draw_in_timer>10)s.draw_in_timer=0;for(const c of rt.all(object('obj_maus_split')))c.mousecount--;m.vspeed=s.vspeed;m.friction=s.friction;for(const c of rt.all(object('obj_maus_split')))c.mercycount+=2;for(const w of rt.all(object('obj_mauswheel_enemy')))w.actfailure=0;rt.soundStop?.('snd_squeaky');const handle=snd(rt,'snd_squeaky');if(handle!==undefined)rt.sourceAudio?.volume(handle,s.noisevol,0);}}}]};
 const split:GmObjectDef={...object('obj_maus_split'),events:{
  create:(s,rt)=>{const w=rt.first(object('obj_mauswheel_enemy'));if(!w)throw Error('Maus split requires Mauswheel');Object.assign(s,{mcon:0,imageXscale:2,imageYscale:2,imageSpeed:1/6,imageIndex:w.imageIndex,mousecount:50,maxmousecount:50,captured:0,draw_in_timer:0,mercycount:0});s.alarm[0]=10;},
  alarm0:s=>{if(s.mcon===0&&s.mousecount>0)s.mcon=1;},
  step:(s,rt)=>{if(s.mcon===1){s.hpart=rt.random.choose(-6,-8,-10,-12);for(s.i=0;s.i<s.mousecount;s.i++){const m=rt.create(little,s.x,s.y);s.mouse=m.id;if(s.i%2===0)m.hspeed=s.hpart+rt.random.random(3);s.factor=s.maxmousecount*1.5/(s.mousecount+s.maxmousecount/2);if(s.mousecount<=5)s.factor=0.8;m.sineradd*=s.factor;m.maxamplitude*=s.factor;}s.basket=rt.create(basket,rt.view.x+340,rt.view.y-160).id;s.mtimer=0;s.mcon=2;}
   if(s.mcon===2){s.imageXscale=mix(s.imageXscale,0,0.1);s.imageYscale=mix(s.imageXscale,0,0.1);s.mtimer++;if(s.mtimer===300){for(const m of rt.all(little))if(m.captured===0)m.con=2;for(const b of rt.all(basket))if(b.con===1){b.con=10;b.vspeed=-6;b.endtimer=0;}}if(s.mtimer>=360||!rt.exists(little))s.mcon=3;}
   if(s.mcon===3){s.imageXscale=mix(s.imageXscale,2,0.2);s.imageYscale=mix(s.imageXscale,2,0.2);if(ge(s.imageXscale,1.95)){if(s.mercycount>0)s.imageXscale=2;s.imageYscale=2;s.mcon=0;for(const w of rt.all(object('obj_mauswheel_enemy'))){w.actcon=18;mercyAdd2(w,rt,w.myself,s.mercycount);if(s.mercycount===0)w.actfailure=1;if(rt.globals.mercymod[w.myself]>=100)w.actcon=19;}rt.destroy(s);for(const c of rt.all(object('obj_maus_split')))rt.destroy(c);}}
  },
 }};
 const rescuers=['obj_mauswheel_tasque','obj_mauswheel_tasquemanager'].map((name,index):GmObjectDef=>({...object(name),events:{
  create:s=>{s.imageXscale=-2;s.imageYscale=2;if(index===0)s.imageSpeed=0.2;s.con=0;s.timer=0;},
  alarm0:s=>{s.hspeed=20;},
  step:(s,rt)=>{if(s.con===0){if(s.timer<10)s.timer++;const t=s.timer/10,e=index===0?1-Math.cos(t*Math.PI/2):Math.sqrt(t);s.y=mix(s.ystart,rt.view.y+(index===0?229:233),e);if(s.timer===10){s.y=rt.view.y+(index===0?229:233);s.con=1;s.timer=0;if(index===1)snd(rt,'snd_impact');}}
   if(s.con===1){if(s.timer<10)s.timer++;if(s.timer===1){s.imageXscale=-2.3;s.imageYscale=1.7;}const e=Math.sqrt(s.timer/10);s.imageXscale=mix(-2.3,-2,e);s.imageYscale=mix(1.7,2,e);}
   if(s.x>rt.view.x+rt.view.width+80||!rt.exists(object('obj_battlecontroller')))rt.destroy(s);
  },
 }}));
 const susieBasket:GmObjectDef={...object('obj_maus_basket_susie'),events:{create:s=>{s.imageXscale=1.6;s.imageYscale=2.5;s.gravity=1.4;},step:(s,rt)=>{const h=rt.first(object('obj_herosusie'));if(!h)throw Error('Susie trap requires Susie');if(s.y>h.y-14-s.speed){s.gravity=0;s.speed=0;s.y=h.y-14;}}}};
 return [little,basket,split,...rescuers,susieBasket];
}
