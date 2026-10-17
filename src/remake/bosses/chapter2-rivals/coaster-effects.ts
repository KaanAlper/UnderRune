import type {GmObjectDef} from '../../gm/runtime';
import {easeIn} from '../../deltarune/ease';
export function createBerdlyCoasterEffects(object:(name:string)=>GmObjectDef):GmObjectDef[]{
 const feather:GmObjectDef={...object('o_berdly_coaster_feather'),events:{
  create:(s,rt)=>{Object.assign(s,{timer:0,con:0,imageXscale:rt.random.choose(-2,2),imageYscale:2,imageIndex:rt.random.irandom(1),imageSpeed:0,direction:0,speed:rt.random.randomRange(2,3),imageAngle:rt.random.random(360),rot:rt.random.randomRange(-5,5),life:rt.random.irandomRange(30,60)});s.lifeD=s.life;},
  step:(s,rt)=>{s.speed*=.94;if(s.con===0&&s.speed<2)s.con=1;if(s.con===1){s.timer++;s.y+=s.timer/10;s.life--;s.life--;if(s.life<=0)rt.destroy(s);s.imageAlpha=s.life/s.lifeD;}s.imageAngle+=s.rot;s.rot*=.95;},
 }};
 const smoke:GmObjectDef={...object('obj_berdly_smoke'),events:{
  create:(s,rt)=>{Object.assign(s,{imageXscale:1.6,imageYscale:1.6,speed:4,friction:.2,gravityDirection:90,gravity:.2,imageSpeed:0,imageAngle:-50+rt.random.random(50),timer:0,h_speed:0});},
  step:(s,rt)=>{s.imageAlpha-=.02;s.x+=s.h_speed;if(s.imageAlpha<=.8){const lerp=(s.imageAlpha-.8)/-.8;s.h_speed=-8*easeIn(lerp,1);}if(s.imageAlpha<0)rt.destroy(s);
   if(!rt.exists(object('o_coaster_berdly'))){const scene=rt.first(object('obj_ch2_scene11a'));if(scene&&rt.byId(scene.coaster_berdly))s.depth=rt.byId(scene.coaster_berdly)!.depth+1;}
  },
 }};
 const particle:GmObjectDef={...object('obj_berdlyparticle'),events:{
  create:(s,rt)=>{Object.assign(s,{sineon:0,siner:0,timer:0,imageAlpha:2,vspeed:-.2-rt.random.random(.4),hspeed:-4,friction:-.2,imageXscale:2,imageYscale:2,imageAngle:rt.random.random(360)});},
  step:(s,rt)=>{if(s.x<=-100)rt.destroy(s);if(s.y>=rt.room.height+10)rt.destroy(s);s.timer++;if(s.timer>6)s.imageAlpha-=.1;},
 }};
 const coasterSmoke:GmObjectDef={...object('o_coastersmoke'),events:{create:(s,rt)=>{s.imageXscale=2;s.imageSpeed=1;s.hspeed=-2;s.vspeed=-2+rt.random.random(2);s.depth=90000;},step:(s,rt)=>{s.hspeed-=2;if(s.imageIndex>=4)rt.destroy(s);}}};
 const jama:GmObjectDef={...object('o_coaster_jama'),events:{
  create:(s,rt)=>{Object.assign(s,{con:0,contimer:0,flashtimer:0,type:0,bigcar:0,bigcarhp:2,waitamount:20,imageXscale:2,imageYscale:2,active:1,chancer:Math.floor(rt.random.random(200)),moveberd:0,imageSpeed:0});},
  step:(s,rt)=>{
   if(s.type===0){if(s.con===0){if(s.chancer===1)s.sprite='spr_coaster_barricade_alt';s.contimer++;s.flashtimer++;if(s.flashtimer===2){s.imageAlpha=s.imageAlpha===0?1:0;s.flashtimer=0;}if(s.contimer>=s.waitamount&&s.imageAlpha===1)s.con=1;}
    if(s.con===1){s.hspeed=-2;s.gravityDirection=180;s.gravity=.5;s.con=2;}if(s.con===2&&s.x<=-20)rt.destroy(s);
   }if(s.type===1){s.contimer++;if(s.contimer>=s.waitamount){s.active=0;s.imageAlpha-=.1;if(s.imageAlpha<=0)rt.destroy(s);}}
  },
  user1:(s,rt)=>{for(s.i=0;s.i<4;s.i++){const y=s.y-8-rt.random.random(50),x=s.x+rt.random.random(40);s.particle=rt.create(object('obj_berdlyparticle'),x,y).id;}
   if(s.bigcar===1){s.imageIndex=1;s.bigcarhp--;s.hspeed=6;s.x+=8;if(s.bigcarhp<=0){rt.create(object('o_coastersmoke'),s.x+20,s.y-40);rt.create(object('o_coastersmoke'),s.x-20,s.y-40);rt.create(object('o_coastersmoke'),s.x+60,s.y-40);rt.destroy(s);}}
   if(s.bigcar===0){rt.create(object('o_coastersmoke'),s.x+20,s.y-40);rt.destroy(s);}
  },
 },collisions:[
  {target:object('o_coaster_hero'),run:(s,h,rt)=>{if(s.active===1){if(s.type===0){if(s.con>=1){if(h.con===0&&h.disabled===0){h.disabled=1;h.disabledtimer=95;h.xshake=10;h.disabledtype=0;}if(h.con!==0&&h.nitro===0)h.damaged=1;rt.userEvent(s,1);}else if(s.bigcar===0){rt.create(object('o_coastersmoke'),s.x+20,s.y-40);rt.destroy(s);}}if(s.type===1&&h.disabled===0&&h.con===1){h.damaged=1;h.disabled=1;h.disabledtimer=125;h.disabledtype=1;}}}},
  {target:object('o_coaster_berdly'),run:(s,b,rt)=>{if(s.moveberd===1){if(b.movetype===0&&b.movetimer<b.movethreshold-1&&b.movecon===0){b.movebuffer=1;b.movetimer=b.movethreshold-1;}rt.destroy(s);}}},
  {target:object('o_coaster_jama'),run:(s,o,rt)=>{if(s.type===1&&o.type===0&&o.con>=1)rt.userEvent(o,1);}},
 ]};
 const lightning:GmObjectDef={...object('o_coaster_lightning'),events:{
  create:s=>{Object.assign(s,{y:s.ystart-300,imageXscale:2,imageYscale:2,con:-2,imageSpeed:.2,waittime:30,timer:0,fakealpha:0,imageAngle:90,litwaittime:60});},
  step:(s,rt)=>{if(s.con===-2){s.timer++;if(s.timer>=s.waittime){s.con=0;s.x+=50;s.vspeed=10;s.friction=-1;}}
   if(s.con===0&&s.y>=s.ystart-s.vspeed){for(s.i=0;s.i<4;s.i++){const p=rt.create(object('o_coaster_jama'),s.x-40,s.y);s.lit=p.id;Object.assign(p,{sprite:'spr_coaster_lightning',imageSpeed:.25,friction:.2,hspeed:-4+s.i*4,type:1,waitamount:s.litwaittime});if(s.i===3){p.visible=false;p.moveberd=1;}}
    Object.assign(s,{vspeed:0,imageAngle:0,imageIndex:0,imageSpeed:.5,y:s.y-20,sprite:'spr_coaster_explosion',con:1});
   }if(s.con===1&&s.imageIndex>=3)rt.destroy(s);
  },draw:(s,rt)=>{rt.drawSelf(s);if(s.con===-2){s.waitpeak=s.waittime/2;s.fakealpha+=s.timer<s.waitpeak?1/s.waitpeak:-1/s.waitpeak;rt.drawSprite('spr_coaster_lightning_warning',0,s.xstart,s.ystart,2,2,0,0xffffff,s.fakealpha);}},
 }};
 const endFix:GmObjectDef={...object('o_berdly_coaster_end_fix'),events:{create:s=>{s.alarm[0]=10;},step:()=>{},endStep:()=>{},alarm0:(s,rt)=>{for(const i of rt.instances)if(i.live&&i.visible&&['spr_ralsei_walk_right','spr_susie_walk_right_dw','spr_krisr_dark'].includes(i.sprite!))i.visible=false;rt.destroy(s);}}};
 const track:GmObjectDef={...object('o_coaster_bg_track'),events:{create:(s,rt)=>{s.depth=object('obj_heroparent').depth!+2;s.imageAlpha=0;},step:(s,rt)=>{s.hspeed=-8;if(s.x<rt.view.x-144)s.x=rt.view.x+rt.view.width;}}};
 return [feather,smoke,particle,coasterSmoke,jama,lightning,endFix,track];
}
