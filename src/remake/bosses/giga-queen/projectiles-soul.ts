import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {afterImage,bulletInit,afterimageGrow} from '../../deltarune/battle';
import {snd} from '../../deltarune/sound';
import {ge,gt,lt,lengthdirX,lengthdirY,pointDirection} from '../../gm/math';
type Lookup=(name:string)=>GmObjectDef;
export function createGigaSoulProjectiles(object:Lookup):GmObjectDef[]{
 const req=(rt:GmRuntime,n:string)=>{const a=rt.first(object(n));if(!a)throw Error(`GIGA soul projectile requires ${n}`);return a;};
 const grow=(s:GmInstance,rt:GmRuntime)=>{const a=rt.create(afterimageGrow,s.x,s.y);s.afterimage=a.id;a.sprite=s.sprite;a.imageIndex=s.imageIndex;a.imageBlend=s.imageBlend;a.imageSpeed=0;a.depth=s.depth;a.imageXscale=s.imageXscale;a.imageYscale=s.imageYscale;a.imageAngle=s.imageAngle;return a;};
 const approach=(a:number,b:number,n:number)=>a<b?Math.min(a+n,b):Math.max(a-n,b),bullet=object('obj_collidebullet');
 const breath:GmObjectDef={name:'obj_bqueen_breath',index:807,parent:bullet,sprite:'spr_gigaqueen_firebreath',events:{
  create:(s,rt)=>{bulletInit(s);s.destroyonhit=1;s.imageXscale=0.25;s.imageYscale=0.5;s.sprite='spr_rouxls_fire';s.depth=req(rt,'obj_heart').depth-1;s.imageAngle=req(rt,'obj_bqueen_breath_controller').place1;s.afterimage=0;s.fadeaway=0;s.slowdown=0;s.timer=0;s.rotator_target=-1;s.length=2;s.type=1;s.myspeed=6;s.afterimagetimer=0;const a=rt.first(object('obj_bqueen_breath_controller'));if(a)s.damage=a.damage;if(a)s.target=a.target;s.grazepoints=3;s.siner=0;},
  step:(s,rt)=>{if(!rt.byId(s.rotator_target)&&!(s.rotator_target===object('obj_bqueen_breath_controller').index&&rt.exists(object('obj_bqueen_breath_controller')))){rt.destroy(s);return;}const a=rt.first(object('obj_bqueen_breath_controller'));if(!a){rt.destroy(s);return;}s.siner++;s.rotator_target=a.object.index;s.length+=s.myspeed;s.imageXscale+=0.02;s.imageYscale+=0.02;s.afterimagetimer++;if(ge(s.afterimagetimer,1)){const z=afterImage(s,rt);s.a=z.id;z.imageAlpha=s.imageAlpha/3;z.fadeSpeed=0.1;s.afterimagetimer=0;}if(ge(s.y,rt.view.y+300)){s.imageAlpha-=0.1;if(s.imageAlpha<=0){rt.destroy(s);return;}}if(!rt.exists(object('obj_bqueen_breath_controller'))){rt.destroy(s);return;}if(s.type===1||s.type===2){const angle=s.type===1?a.place1:a.place2;s.x=a.x+lengthdirX(s.length,angle);s.y=a.y+lengthdirY(s.length,angle);s.imageAngle=angle;}},
 }};
 const breathController:GmObjectDef={name:'obj_bqueen_breath_controller',index:806,sprite:'spr_bqueen_leggy',mask:'spr_nothing',events:{
  create:(s,rt)=>{Object.assign(s,{timer:0,timer2:0,bulletcount:0,bulletcount2:0,bulletcountmax:4,bulletcount2max:4,bulletdepth:s.depth,con:0,siner:0.5,imageYscale:2,imageXscale:2,imageSpeed:0,depth:req(rt,'obj_growtangle').depth+1,blowing:0,blowstate:0,original_image_speed:-1,difficulty:0,amplitude:0,maxamplitude:1,introtimer:0});},
  draw:(s,rt)=>{rt.drawSprite(s.sprite,s.imageIndex,s.x,s.y+133,s.imageXscale,s.imageYscale,s.imageAngle,s.imageBlend,s.imageAlpha);s.timer++;s.timer2++;if(s.introtimer===0){for(let i=0;i<34;i++){s.siner+=0.28*s.amplitude;if(s.difficulty===0)s.siner+=0.2;s.amplitude=approach(s.amplitude,s.maxamplitude,0.03);}s.introtimer=34;}s.introtimer++;if(lt(s.introtimer,35)||gt(s.introtimer,70)){s.siner+=0.28*s.amplitude;if(s.difficulty===0)s.siner+=0.2;s.amplitude=approach(s.amplitude,s.maxamplitude,0.03);}s.place1=270+Math.sin(s.siner/6)*40*s.amplitude;s.place2=270+Math.sin((s.siner+50)/6)*40*s.amplitude;if(lt(s.introtimer,35))return;
   if(gt(s.timer,9)){s.bulletcount++;if(s.bulletcount===s.bulletcountmax){s.timer=3;s.bulletcount=0;if(s.difficulty===0)s.bulletcountmax=rt.random.choose(2,3,4);if(s.difficulty===1)s.bulletcountmax=rt.random.choose(2,3,4,5);}else{rt.soundStop?.('snd_rocket');snd(rt,'snd_rocket',0.5+rt.random.random(1));const d=rt.create(breath,s.x,s.y);s.d=d.id;grow(d,rt);d.damage=s.damage;d.target=s.target;d.type=1;d.imageAngle=req(rt,'obj_bqueen_breath_controller').place1;d.depth=s.bulletdepth;d.rotator_target=s.id;s.timer=5;}}
   if(gt(s.timer2,9)&&s.difficulty===1){s.bulletcount2++;if(s.bulletcount2===s.bulletcount2max){s.timer2=3;s.bulletcount2=0;if(s.difficulty===0)s.bulletcountmax=rt.random.choose(1,2,3,4);if(s.difficulty===1)s.bulletcount2max=rt.random.choose(2,3,4,5);}else{rt.soundStop?.('snd_rocket');snd(rt,'snd_rocket',0.5+rt.random.random(1));const d=rt.create(breath,s.x,s.y);s.d=d.id;grow(d,rt);d.damage=s.damage;d.target=s.target;d.type=2;d.imageAngle=req(rt,'obj_bqueen_breath_controller').place2;d.depth=s.bulletdepth;d.rotator_target=s.id;s.timer2=5;}}
   if(lt(rt.globals.turntimer,3))rt.destroy(s);
  },
 }};
 const missile:GmObjectDef={name:'obj_bqueen_missle',index:804,parent:bullet,events:{
  create:(s,rt)=>{bulletInit(s);s.timer=0;s.con=0;s.imageSpeed=0;s.imageXscale=1;s.imageYscale=1;s.depth=req(rt,'obj_heart').depth-1;s.vspeed=10;s.friction=2;s.destroyonhit=1;s.afterimage=0;const a=rt.first(object('obj_bqueen_breath_controller'));if(a)s.damage=a.damage;if(a)s.target=a.target;s.grazepoints=3;},
  step:(s,rt)=>{if(s.con===0&&lt(s.vspeed,0.5)){s.con=1;s.imageSpeed=1;s.vspeed=0;s.friction=0;s.gravityDirection=270;s.gravity=0.7;}if(s.con===1){s.timer++;if(s.timer===60)rt.destroy(s);}},
 }};
 const homing:GmObjectDef={name:'obj_bqueen_missle_homing',index:805,parent:bullet,sprite:'spr_thrash_missile',events:{
  create:(s,rt)=>{bulletInit(s);s.timer=0;s.con=0;s.imageSpeed=0;s.imageXscale=1;s.imageYscale=1;s.depth=req(rt,'obj_heart').depth-1;s.vspeed=10;s.destroyonhit=1;s.afterimage=0;s.hspeed=rt.random.randomRange(2,-2);s.vspeed=rt.random.randomRange(2,-2);s.homingfactor=0;s.maxhomingfactor=2;const a=rt.first(object('obj_bqueen_breath_controller'));if(a)s.damage=a.damage;if(a)s.target=a.target;s.grazepoints=3;},
  destroy:(s,rt)=>{if(gt(rt.globals.turntimer,4)){const a=grow(s,rt);s.bonk=a.id;a.sprite='spr_dogcar_hit';snd(rt,'snd_bomb');}},
  step:(s,rt)=>{s.imageAngle=s.direction-90;const a=rt.first(object('obj_heart'));if(a)s.idealdir=pointDirection(s.x,s.y,a.x+10,a.y+10);else rt.destroy(s);s.vspeed+=lengthdirY(s.homingfactor,s.idealdir);s.hspeed+=lengthdirX(s.homingfactor,s.idealdir);if(gt(s.speed,10))s.speed=10;s.homingfactor=approach(s.homingfactor,s.maxhomingfactor,0.2);s.timer++;if(ge(s.timer,12))s.maxhomingfactor=0.3;if(ge(s.timer,60))rt.destroy(s);if(lt(rt.globals.turntimer,3))rt.destroy(s);},
 }};
 const missileController:GmObjectDef={name:'obj_bqueen_missle_controller',index:803,parent:bullet,sprite:'spr_bqueen_missles',mask:'spr_nothing',events:{
  create:(s,rt)=>{Object.assign(s,{timer:0,bulletcount:0,bulletcountmax:12,bulletdepth:s.depth,difficulty:1,destroyonhit:0,con:0,siner:0,imageYscale:2,imageXscale:2,imageSpeed:0,depth:req(rt,'obj_growtangle').depth+1,oldmode:0,introtimer:0,openmisslechambertimer:0,misslewaittimer:0,volleytimer:0,volleycount:-1,volleytotal:6,missilex:[-30,0,30,-30,0,30],side:1,shotcount:0});},
  draw:(s,rt)=>{rt.drawSprite(s.sprite,s.imageIndex,s.x-2,s.y+135,s.imageXscale,s.imageYscale,s.imageAngle,s.imageBlend,s.imageAlpha);s.introtimer++;if(s.introtimer===15)s.imageSpeed=0.4;if(ge(s.imageIndex,2)){if(s.openmisslechambertimer===0)snd(rt,'snd_grab');if(lt(s.openmisslechambertimer,5)){s.openmisslechambertimer++;s.x=s.xstart+4/s.openmisslechambertimer-rt.random.irandom(8/s.openmisslechambertimer);s.y=s.ystart+4/s.openmisslechambertimer-rt.random.irandom(8/s.openmisslechambertimer);s.imageSpeed=0;}else{s.misslewaittimer++;s.x=s.xstart;s.y=s.ystart;}}if(lt(s.misslewaittimer,1))return;
   if(!s.oldmode){if(s.con===0){s.timer++;if(ge(s.timer,20)){s.timer=0;s.con=1;}}if(s.con===1){let makeshot=0;s.timer--;if(s.timer<=0&&lt(s.shotcount,3+s.difficulty)){s.volleytimer--;if(s.volleytimer<=0){makeshot=1;s.volleycount++;s.volleytimer=5;}if(ge(s.volleycount,s.volleytotal)){makeshot=0;s.side=rt.random.choose(1,-1);s.timer=30;if(s.difficulty===1)s.timer=15;s.volleycount=-1;s.shotcount++;}}if(makeshot&&s.volleycount!==3){let y=0;if(ge(s.volleycount,3))y+=20;rt.soundStop?.('snd_rocket');snd(rt,'snd_rocket');const d=rt.create(homing,s.x+s.missilex[s.volleycount],s.y+16+y);s.d=d.id;d.vspeed=-6;d.hspeed=rt.random.choose(2,-2,4,-4);d.damage=s.damage;d.target=s.target;d.depth=s.bulletdepth;d.imageAngle=d.direction-90;grow(d,rt).sprite='spr_cakesmoke_white';}}if(lt(rt.globals.turntimer,3))rt.destroy(s);}
   else{s.siner+=0.7;s.x=s.xstart+20+Math.sin(s.siner/6)*54;s.timer++;if(gt(s.timer,9)){s.bulletcount++;if(s.bulletcount===s.bulletcountmax){s.timer=-7;s.bulletcount=0;s.bulletcountmax=8;}else{let d=rt.create(missile,s.x-55+rt.random.random(20),s.y+36);s.d=d.id;d.damage=s.damage;d.target=s.target;d.depth=s.bulletdepth;d=rt.create(missile,s.x+55-rt.random.random(20),s.y+36);s.d=d.id;d.damage=s.damage;d.target=s.target;d.depth=s.bulletdepth;s.timer=5;}}if(lt(rt.globals.turntimer,3))rt.destroy(s);}
  },
 }};
 return [breathController,breath,missileController,missile,homing];
}
export function runGigaSoulBulletController(s:GmInstance,rt:GmRuntime,object:Lookup):boolean{
 if(s.type!==46&&s.type!==47)return false;
 if(s.init===1){
  s.init=2;const g=rt.first(object('obj_growtangle'))!;
  const d=rt.create(object(s.type===46?'obj_bqueen_missle_controller':'obj_bqueen_breath_controller'),g.x,s.miny-130);
  s.d=d.id;d.damage=s.damage;d.target=s.target;
 }
 return true;
}
