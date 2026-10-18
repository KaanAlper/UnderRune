// The Roaring Knight's roar (bullet type 107, his last attack before the ending): the box grows past the screen, he
// rises as a giant over a pulsing pit that pulls the soul in, stars stream in and burst while the pull builds, then
// he roars, flinging stars outwards, holds them, and cuts the screen in two. Objects: obj_knight_roaring2 (the scene)
// and obj_knight_roaring_star. Hits during the roar are his whole-party hit (true damage, scr_damage's dealsTrueDamage).
// Its User 0, an older copy of its Step that nothing calls, is a named error.
import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {C,makeColorHsv,mergeColor} from '../../gm/graphics';
import {eq,lengthdirX,lengthdirY,lt,pointDirection,pointDistance} from '../../gm/math';
import {afterimage,afterimageGrow,bulletInit,damage,damageAll,growtangle,heart,marker} from '../../deltarune/battle';
import {afterimageGrowOf,approach,bulletInherit,childBullet,clamp01,darkSize,destroyScript,drawBeamColor,lerpvarScript,makeColorRgb,remap,pingpong,preciseHit,scrAfterimage} from '../../deltarune/chapter3-scripts';
import {easeOut} from '../../deltarune/ease';
import {gmlScript,scriptDelayed,scriptDelayedOn,setVar} from '../../deltarune/chapter2-battle';
import {scrLerpvar} from '../../deltarune/shared-effects';
import {snd} from '../../deltarune/sound';
import type {Chapter2BulletRunner} from '../../deltarune/chapter2-bullets';
import type {HookedDef} from '../../deltarune/rules';
import type {SlashEffects} from './slash-effects';

const GRAY=0x808080,DKGRAY=0x404040,PIT=0x595959;

export function createRoar(object:(name:string)=>GmObjectDef,effects:SlashEffects){
 const {particle,slash,circle,afterimageScreen}=effects;
 const knight=(rt:GmRuntime)=>{const k=rt.first(object('obj_knight_enemy'));if(!k)throw Error('The roar needs the Knight');return k;};
 const starchild=()=>object('obj_knight_pointing_starchild');
 /** scr_fire_bullet: a bullet with a direction, speed and sprite (updateimageangle 0). */
 const fire=(rt:GmRuntime,x:number,y:number,dir:number,speed:number)=>{const b=rt.create(star,x,y);b.direction=dir;b.speed=speed;b.sprite='spr_knight_bullet_star';b.updateimageangle=0;return b;};
 /** instance_create run by obj_script_delayed (scr_script_repeat): only the screen afterimage (object 46) here. */
 const createScript=gmlScript('instance_create',(_t:GmInstance,rt:GmRuntime,x:number,y:number,index:number)=>{
  if(index!==afterimageScreen.index&&index!==object('obj_afterimage_screen').index)throw Error(`The roar's repeated instance_create of object ${index} is not ported`);
  rt.create(afterimageScreen,x,y);
 });

 /** obj_knight_roaring_star: flies in (or out), slows when told (con 1), drifts back, flashes and bursts into small
  * stars; a split star separates into halves first. */
 const star:GmObjectDef={...object('obj_knight_roaring_star'),events:{
  create:s=>{
   bulletInit(s);
   Object.assign(s,{imageXscale:0,imageYscale:0,even:0,destroyonhit:0,timer:0,con:0,growstart:0,playSound:1,beamflicker:0,split:0,outbound:0,splitmax:14,splitease:0,finalx:0,damage:206,element:5});
  },
  step:(s,rt)=>{
   const vx=rt.view.x,vy=rt.view.y,w=rt.spriteWidth(s),h=rt.spriteHeight(s);
   if(s.x<vx-w||s.x>vx+rt.view.width+w||s.y<vy-h||s.y>vy+480+h){if(s.outbound){rt.destroy(s);return;}}
   else s.outbound=1;
   if(s.con===1){s.friction=0.5;s.con++;}
   else if(s.con===2){
    if(s.speed===0&&s.gravity===0){
     s.gravity=0.1;s.gravityDirection=s.direction-180;s.friction=0;
     if(s.split){
      const time=54-s.timer,len=0.5*s.gravity*time*time;
      const fx=s.x-vx+lengthdirX(len,s.gravityDirection),fy=s.y-vy+lengthdirY(len,s.gravityDirection);s.finalx=fx-fy/2;
     }
    }
    s.timer++;
    if(s.timer>=40&&!s.split){s.timer=0;s.con++;if(s.playSound)snd(rt,'snd_explosion_firework');}
    s.growstart=s.imageXscale;
   }else if(s.con===2.5){
    if(s.split===1){s.speed=0;s.gravity=0;s.sprite='spr_knight_bullet_star_top';s.timer=-10;s.split=2;}
    s.timer++;s.splitease=easeOut(clamp01(s.timer/20),4)*s.splitmax*s.imageXscale;
    if(s.timer===20){s.con=3;s.timer=0;}
   }else if(s.con===3){
    s.timer++;s.imageXscale=s.growstart+clamp01(s.timer/2);s.imageYscale=s.growstart+clamp01(s.timer/2);
    if(s.timer===3){
     let angle=90;
     for(s.i=0;s.i<6;s.i++){
      const d=childBullet(s,rt,s.x,s.y,starchild());s.d=d.id;
      d.imageAngle=angle;d.direction=angle;d.speed=1;d.friction=-0.1;d.imageXscale=s.imageXscale*0.5;d.imageYscale=s.imageYscale*0.5;d.deceleration=0.15;
      angle+=s.i===1||s.i===4?57:66;
     }
    }
    if(s.timer>=4){
     const spr=rt.bank.get(s.sprite!)!;s.imageXscale=(rt.spriteWidth(s)+16)/spr.width;s.imageYscale=(rt.spriteHeight(s)+16)/spr.height;
     const a=scrAfterimage(s,rt);a.fadeSpeed*=3;rt.destroy(s);
    }
   }
  },
  // User 0: the star (or its halves) in the roar's surface.
  user0:(s,rt)=>{
   const spr=rt.bank.get(s.sprite!)!,xs=(rt.spriteWidth(s)+16)/spr.width,ys=(rt.spriteHeight(s)+16)/spr.height,sx=s.x-rt.view.x,sy=s.y-rt.view.y;
   if(s.split<2)rt.drawSprite(s.sprite,0,sx,sy,xs,ys,s.imageAngle,s.imageBlend,s.imageAlpha);
   else{
    rt.drawSprite('spr_knight_bullet_star_top',0,sx+s.splitease/2,sy+s.splitease,xs,ys,s.imageAngle,s.imageBlend,s.imageAlpha);
    rt.drawSprite('spr_knight_bullet_star_bottom',0,sx-s.splitease/2,sy-s.splitease,xs,ys,s.imageAngle,s.imageBlend,s.imageAlpha);
   }
  },
  // User 1: the held star, its beams and flash.
  user1:(s,rt)=>{
   const spr=rt.bank.get(s.sprite!)!,xs=(rt.spriteWidth(s)+16)/spr.width,ys=(rt.spriteHeight(s)+16)/spr.height,alpha=(Math.sin(s.timer*3)+1)*0.25;
   const tx=s.x-rt.view.x+s.splitease/2,ty=s.y-rt.view.y+s.splitease,bx=s.x-rt.view.x-s.splitease/2,by=s.y-rt.view.y-s.splitease;
   if(s.con===2||s.con===2.5||s.con===3){
    let a=1,length=120;
    if(s.con===2){a=clamp01(s.timer/30-alpha);length=50*clamp01(s.timer/30-(s.timer%2)*0.75)+50;}
    rt.drawBlendMode('add');
    for(const [x,y,angle] of [[tx,ty,90],[bx,by,156],[tx,ty,24],[bx,by,270],[tx,ty,336],[bx,by,204]])drawBeamColor(rt,x,y,length,10,angle,C.white,0,a,false);
    rt.drawBlendMode('normal');
   }
   if(s.con===1||s.con===2||s.con===2.5){
    const color=mergeColor(GRAY,C.red,clamp01(s.timer/30));
    rt.drawSprite(s.sprite,1,tx,ty,xs+0.1,ys+0.1,0,C.white,alpha);rt.drawSprite(s.sprite,0,tx,ty,xs,ys,0,color,1);
    if(s.split>=2){rt.drawSprite('spr_knight_bullet_star_bottom',1,bx,by,xs+0.1,ys+0.1,0,C.white,alpha);rt.drawSprite('spr_knight_bullet_star_bottom',0,bx,by,xs,ys,0,color,1);}
   }
   if(s.con===3||s.con===4){
    const flash=(Math.sin(s.timer*6)+1)*0.25;
    rt.drawSprite(s.sprite,2,tx,ty,xs+0.1,ys+0.1,0,C.white,flash);rt.drawSprite(s.sprite,2,tx,ty,xs,ys,0,C.white,1);
    if(s.split>=2){rt.drawSprite('spr_knight_bullet_star_bottom',2,bx,by,xs+0.1,ys+0.1,0,C.white,flash);rt.drawSprite('spr_knight_bullet_star_bottom',2,bx,by,xs,ys,0,C.white,1);}
   }
  },
  user5:(s,rt)=>{
   if(s.active!==1)return;
   const size=rt.first(heart)?.sprite==='spr_dodgeheart_smaller_2px'?0:2;
   if(!preciseHit(s,rt,size))return;
   if(rt.exists(roaring))for(const k of rt.all(object('obj_knight_enemy')))rt.userEvent(k,2);
   else{if(s.target!==3)damage(s,rt);if(s.target===3)damageAll(s,rt);}
   if(s.destroyonhit===1)rt.destroy(s);
  },
 }};

 /** A star streaming in from far out towards the pit. */
 const streamIn=(s:GmInstance,rt:GmRuntime,angle:number,speed:number)=>{
  const vx=rt.view.x,vy=rt.view.y,b=fire(rt,vx+s.fake_x+lengthdirX(s.rand_dist,angle),vy+s.fake_y+lengthdirY(s.rand_dist,angle),0,0);
  Object.assign(b,{wall_destroy:0,destroyonhit:0,bottomfade:0,spinspeed:1,visible:false,imageIndex:0,imageSpeed:0,imageXscale:2,imageYscale:2});
  b.direction=pointDirection(b.x,b.y,vx+s.fake_x,vy+s.fake_y+55);b.speed=speed;b.friction=-0.1;
 };
 /** A star flung out of the pit, growing as it goes. */
 const flingOut=(s:GmInstance,rt:GmRuntime,angle:number,speed:number,size:number)=>{
  const b=fire(rt,rt.view.x+s.fake_x,rt.view.y+s.fake_y+55,angle,speed);
  Object.assign(b,{visible:false,wall_destroy:0,bottomfade:0,destroyonhit:0,imageXscale:0.1,imageYscale:0.1});
  scrLerpvar(b,rt,'image_xscale',0.1,size,32);scrLerpvar(b,rt,'image_yscale',0.1,size,32);
 };
 /** A screen afterimage near the pit (instance_create's y argument is evaluated first). */
 const screenEcho=(s:GmInstance,rt:GmRuntime)=>{
  const y=rt.view.y+s.fake_y+55+rt.random.irandomRange(-30,30),x=rt.view.x+s.fake_x+rt.random.irandomRange(-30,30);
  return rt.create(afterimageScreen,x,y);
 };

 const roaring:HookedDef={...object('obj_knight_roaring2'),hooks:{dealsTrueDamage:()=>true},events:{
  create:(s,rt)=>{
   darkSize(s);bulletInit(s);s.imageSpeed=0;
   Object.assign(s,{jumpimages:0,my_surface:-4,ball_surface:-4,star_surface:-4,terrible_surface:-4,darkness:0,ball_darkness:0,timer:0,fake_x:rt.view.width*0.5,fake_y:24,fake_alpha:0});
   s.rand_angle=rt.random.irandom(360);
   Object.assign(s,{rand_dist:320,star_flicker:2,intensity:1.5,intensify:1.5,attack_timer:0,attack_timer_goal:-2,attack_token:1,roaring_timer:0,line_timer:-1,r:128,g:128,b:128,
    knight_sprite:'spr_roaringknight_front',knight_sprite_image:0,knight_sprite_speed:0.5,bobble_count:0,bobble_freq:1,bobble_amp:4,ball_counter:0,ball_speed:2,player_suck:0.5,
    hsv:128,hsv_switch:0,sound:-4});
   s.bullet_list=rt.dsCreate('list');
   Object.assign(s,{do_fake_screen:0,fakey_screen:-4,fakey_screen_2:-4,stop:0});
   for(const h of rt.all(heart))h.boundaryup=160;
   s.y-=320;const k=knight(rt);k.chargeupcon=2;k.chargeuptimer=0;
   scriptDelayedOn(s,rt,lerpvarScript,20,'darkness',0,1,32);
   Object.assign(s,{starcount_p1:0,starcount_p2:0,starvar:0});
  },
  cleanup:(s,rt)=>{
   const surfaces=rt.sourceSurfaces;
   for(const k of ['my_surface','ball_surface','star_surface','terrible_surface'])if(surfaces?.exists(s[k]))surfaces.free(s[k]);
   rt.dsDestroy('list',s.bullet_list);
   for(const k of ['fakey_screen','fakey_screen_2'])if(typeof s[k]==='string')rt.deleteSprite(s[k]);
   for(const k of rt.all(object('obj_knight_enemy'))){k.imageAlpha=1;k.siner2=0;k.chargeupcon=0;}
   for(const n of ['snd_knight_stretch','snd_knight_roar','snd_stardrop','snd_knight_cut'])rt.soundStop?.(n);
   for(const b of rt.all(growtangle))rt.destroy(b);
  },
  user0:()=>{throw Error("The roar's User 0 (an older copy of its Step) is not ported: nothing in the game calls it");},
  step:(s,rt)=>step(s,rt),
  draw:(s,rt)=>draw(s,rt),
 }};

 function step(s:GmInstance,rt:GmRuntime){
  const vx=rt.view.x,vy=rt.view.y,vw=rt.view.width,vh=rt.view.height,cx=()=>vx+s.fake_x,cy=()=>vy+s.fake_y+55;
  for(const h of rt.all(heart)){if(h.x<vx)h.x=vx;if(h.x>vx+vw-20)h.x=vx+vw-20;if(h.y<vy)h.y=vy;if(h.y>vy+vh)h.y=vy+vh-20;}
  if(s.jumpimages){const a=scrAfterimage(s,rt);a.fadeSpeed=0.08;}
  s.timer++;if(s.line_timer>-1)s.line_timer++;s.bobble_count+=s.bobble_freq;
  if(s.timer===30)for(const b of rt.all(growtangle)){
   scrLerpvar(b,rt,'image_xscale',b.imageXscale,2560/rt.spriteWidth(b),160,1,'out');scrLerpvar(b,rt,'image_yscale',b.imageYscale,1920/rt.spriteHeight(b),160,1,'out');
  }
  if(s.timer===80){scrLerpvar(s,rt,'fake_alpha',0,1,48,1,'out');scrLerpvar(s,rt,'fake_y',24,88,48,2,'out');}
  if(s.timer>=120&&lt(s.intensity,3.75)&&s.timer%3===0){
   const a=afterimageGrowOf(s,rt),size=2.2+Math.min(s.timer-116,18)*0.15;
   Object.assign(a,{sprite:'spr_roaringknight_front_filled',imageAlpha:0.01,imageXscale:size,imageYscale:size,visible:false,xrate:0,yrate:0,fade:0});
   scrLerpvar(a,rt,'image_xscale',a.imageXscale,a.imageXscale*1.2,2,1,'out');scrLerpvar(a,rt,'image_yscale',a.imageYscale,a.imageYscale*1.2,2,1,'out');
   scriptDelayedOn(a,rt,lerpvarScript,2,'image_xscale',a.imageXscale*1.2,2,14,1,'out');scriptDelayedOn(a,rt,lerpvarScript,2,'image_yscale',a.imageYscale*1.2,2,14,1,'out');
   scrLerpvar(a,rt,'image_alpha',0.01,0.35,16,1,'in');a.destroytime=24;
  }
  for(const a of rt.all(afterimageGrow)){a.x=cx();a.y=vy+s.fake_y+Math.sin(s.bobble_count*0.1)*s.bobble_amp-10+55;}
  if(s.timer===118)scriptDelayedOn(s,rt,lerpvarScript,16,'ball_darkness',0,1,32,1,'out');
  if(s.timer===132)s.sound=snd(rt,'snd_knight_stretch',0.1)??-4;
  if(s.timer>132&&s.sound!==-4)rt.soundPitch?.(s.sound,(rt.soundGetPitch?.(s.sound)??1)+0.000535);
  if(s.timer>128){
   s.intensity=approach(s.intensity,4,0.008);
   if(s.roaring_timer<1&&lt(s.intensity,4)){s.ball_speed=s.intensity*3;if(lt(s.intensity,3.75))s.player_suck=approach(s.player_suck,1,0.1625);}
   s.player_suck=approach(s.player_suck,0,0.15);
   const h=rt.first(heart);
   if(h){const dir=pointDirection(h.x+10,h.y+10,cx(),cy());h.x+=lengthdirX(s.player_suck,dir);h.y+=lengthdirY(s.player_suck,dir);}
   s.attack_timer++;
   if(s.timer%3===0&&lt(s.intensity,3.9)){const a=screenEcho(s,rt);a.faderate=0.1/s.intensity;a.draw_end=1;a.xrate=-0.01;a.yrate=-0.01;}
   if(eq(s.intensity,3.66)){
    scriptDelayedOn(s,rt,lerpvarScript,16,'ball_darkness',1,0,32,1,'out');
    const c=rt.create(circle,cx(),cy());c.depth=s.depth;
    Object.assign(c,{r:0,g:0,b:0,r_goal:255,g_goal:255,b_goal:255,fade_time:48,circle_size:480,size_goal:0,growth:10});
    // The original passes the goals' values (255), not their names, as the variable to ease.
    const goal=(v:number)=>v as unknown as string;
    scrLerpvar(c,rt,goal(c.r_goal),0,255,48,0,'out');scrLerpvar(c,rt,goal(c.g_goal),0,255,48);scrLerpvar(c,rt,goal(c.b_goal),0,255,48,1,'out');
    scriptDelayedOn(c,rt,destroyScript,48);c.draw_in_box=0;c.visible=false;
   }
   if(eq(s.intensity,3.74)&&s.knight_sprite==='spr_roaringknight_front'){
    s.knight_sprite='spr_roaringknight_front_flourish';s.knight_sprite_image=0;s.knight_sprite_speed=0;
    scriptDelayedOn(s,rt,lerpvarScript,8,'knight_sprite_image',0,4,16);scriptDelayedOn(s,rt,lerpvarScript,8,'fake_alpha',1,0,32);
   }
   if(s.timer>=136&&lt(s.intensity,3.75)){
    const ang=rt.random.irandom(360),dist=480+rt.random.irandom(80);
    const p=rt.create(particle,cx()+lengthdirX(dist,ang),cy()+lengthdirY(dist,ang));
    p.not_outbound=0;p.sprite='spr_pixel_white_front';p.direction=pointDirection(p.x,p.y,cx(),cy());p.imageAngle=p.direction;p.imageXscale=16;p.imageYscale=0.5;
    scrLerpvar(p,rt,'image_xscale',320,2,16);scrLerpvar(p,rt,'image_yscale',2,0.1,16);scrLerpvar(p,rt,'image_alpha',1,0.5,16);
    scrLerpvar(p,rt,'x',p.x,cx(),8,1,'out');scrLerpvar(p,rt,'y',p.y,cy(),8,1,'out');p.timer=18;
   }
   if(s.attack_timer===4){
    s.rand_dist=600;s.starcount_p1++;
    rt.random.choose(-1,1);
    if(s.starcount_p1===1&&lt(s.intensity,3.7)){
     if(!lt(s.intensity,2.7)){
      s.rand_angle+=9;const a1=s.rand_angle;
      for(let o=0;o<360;o+=180)streamIn(s,rt,a1+o,16);
     }else{
      s.rand_angle+=32;
      for(let n=0;n<6;n++){s.rand_angle+=60;streamIn(s,rt,s.rand_angle,8+s.intensity);}
     }
    }
    if(s.starcount_p1===3||!lt(s.intensity,2.7))s.starcount_p1=0;
    if(!lt(s.intensity,3)&&lt(s.intensity,4))for(const b of rt.all(star)){
     if(b.x<vx-60)b.x=vx-60;if(b.x>vx+vw+60)b.x=vx+vw+60;if(b.y<vy-60)b.y=vy-60;if(b.y>vy+vh+60)b.y=vy+vh+60;
    }
    s.attack_timer=Math.floor(-1+s.intensity);
   }
  }
  if(eq(s.intensity,4))roar(s,rt);
  if(s.roaring_timer<1)for(const b of rt.all(star)){
   if(s.roaring_timer<180){
    const scale=Math.max(0.2,0.0058823529411764705*pointDistance(b.x,b.y,cx(),cy()));b.imageXscale=scale;b.imageYscale=scale;
    b.direction=pointDirection(b.x,b.y,cx(),cy());
    b.x+=lengthdirX(b.speed*0.625*(1/s.intensity),b.direction+90*b.spinspeed);b.y+=lengthdirY(b.speed*0.625*(1/s.intensity),b.direction+90*b.spinspeed);
   }
   if(pointDistance(b.x,b.y,cx(),cy())<12)rt.destroy(b);
  }
 }
 function roar(s:GmInstance,rt:GmRuntime){
  const vx=rt.view.x,vy=rt.view.y,cx=vx+s.fake_x,cy=vy+s.fake_y+55;
  s.roaring_timer++;
  if(s.roaring_timer<169){
   if(s.roaring_timer===9){
    scrLerpvar(s,rt,'knight_sprite_image',4,6,4);s.fake_alpha=1;s.player_suck=Math.min(s.player_suck,-6);s.ball_speed=-32;s.ball_darkness=1;
    scrLerpvar(s,rt,'bobble_freq',1,3,8);snd(rt,'snd_knight_roar');
    // scr_script_repeat: obj_script_delayed runs instance_create every 2 frames for 8 frames.
    const d=rt.create(scriptDelayed,0,0);d.script=createScript;d.alarm[0]=-2;d.max_time=8;d.rate=2;d.constant=1;d.target=s.id;
    for(const [i,v] of [cx,cy,afterimageScreen.index].entries())d.script_arg[i]=v;d.arg_count=3;
    const c=rt.create(circle,cx,cy);c.depth=s.depth;Object.assign(c,{r:255,g:255,b:255,draw_in_box:0,visible:false});
    for(s.a=0;s.a<8;s.a++){
     const b=fire(rt,cx,cy,s.a*45,8.5+rt.random.random(2));
     Object.assign(b,{visible:false,wall_destroy:0,bottomfade:0,destroyonhit:0,imageXscale:0.1,imageYscale:0.1});
     scrLerpvar(b,rt,'image_xscale',0.1,1.2,32);scrLerpvar(b,rt,'image_yscale',0.1,1.2,32);
    }
   }
   if(s.roaring_timer===15){s.sprite='spr_roaringknight_front_roar';s.imageSpeed=0.5;s.knight_sprite='spr_roaringknight_front_roar';s.knight_sprite_image=0;s.knight_sprite_speed=0.5;}
   if(s.roaring_timer>=9)s.player_suck=Math.min(s.player_suck,-3);
   if(s.roaring_timer%3===0){const a=screenEcho(s,rt);a.xrate=0.015;a.yrate=0.015;a.faderate=0.025;a.draw_end=1;}
   if(s.roaring_timer>15&&s.roaring_timer%5===0){
    const sound=snd(rt,'snd_stardrop',0.5);if(sound!==undefined)rt.sourceAudio?.volume(sound,0.5,0);
    s.rand_angle+=60+rt.random.irandom(10);s.starcount_p2++;
    flingOut(s,rt,s.rand_angle,6.5+rt.random.random(2),1.6);
    flingOut(s,rt,s.rand_angle+20,8.5+rt.random.random(2),1.6);
    flingOut(s,rt,s.rand_angle-20,8.5+rt.random.random(2),1.6);
   }
  }
  if(s.roaring_timer===181){
   s.colorize=6;scrLerpvar(s,rt,'player_suck',s.player_suck,0,24);scrLerpvar(s,rt,'ball_speed',s.ball_speed,1,24);scrLerpvar(s,rt,'bobble_freq',3,1,16);
   s.sprite='spr_roaringknight_front_flourish';s.imageIndex=0;s.imageSpeed=0;s.knight_sprite='spr_roaringknight_front_flourish';s.knight_sprite_speed=0;
   scrLerpvar(s,rt,'knight_sprite_image',5.99,0,12);
   const list=rt.ds('list',s.bullet_list) as number[];for(const b of rt.all(star)){b.friction=0.5;list.push(b.id);}
  }
  if(s.roaring_timer>=182){
   const list=rt.ds('list',s.bullet_list) as number[];
   if(list.length){const b=rt.byId(list[0]);if(b)b.con=1;list.shift();}
  }
  if(s.roaring_timer===275){
   s.sprite='spr_roaringknight_front_slash';s.knight_sprite='spr_roaringknight_front_slash';
   scrLerpvar(s,rt,'knight_sprite_image',0,2,8);scrLerpvar(s,rt,'image_index',0,2,8);scrLerpvar(s,rt,'bobble_amp',4,0,24);s.line_timer=0;
   scrLerpvar(s,rt,'r',128,255,16);scrLerpvar(s,rt,'g',128,0,16);scrLerpvar(s,rt,'b',128,0,16);
  }
  if(s.roaring_timer===299){
   s.x=cx;s.y=vy+s.fake_y+20;
   for(const b of rt.all(growtangle)){b.imageXscale=0;b.imageYscale=0;}
   scrLerpvar(s,rt,'knight_sprite_image',2,5,6);scrLerpvar(s,rt,'image_index',2,5,6);s.do_fake_screen=1;snd(rt,'snd_knight_cut');
   const sl=rt.create(slash,vx+rt.view.width*0.5-lengthdirX(-160,117),vy+rt.view.height*0.5-lengthdirY(-160,117));
   sl.direction=117;sl.imageXscale=4;sl.imageAngle=sl.direction;sl.width*=4;sl.slashdir=-1;
   bulletInherit(s,sl);rt.userEvent(sl,0);
   s.jumpimages=1;scrLerpvar(s,rt,'y',s.y,s.y+40,16,1,'out');scriptDelayedOn(s,rt,lerpvarScript,16,'y',s.y+40,s.y-320,24,1,'in');
  }
  if(s.roaring_timer===363){
   const k=knight(rt);s.jumpimages=0;s.x=rt.byId(s.creatorid)!.x;k.siner2=0;k.y=k.ystart+Math.cos(k.siner2/8)*8;s.y=k.y;
   s.sprite='spr_knight_warp';s.imageIndex=5;s.imageSpeed=0;scrLerpvar(s,rt,'image_index',5,8,8);
  }
  if(s.roaring_timer===375){
   for(const k of rt.all(object('obj_knight_enemy')))k.imageAlpha=1;
   for(const b of rt.all(growtangle)){b.growcon=3;b.timer=0;}
   rt.globals.turntimer=-1;
  }
 }
 function draw(s:GmInstance,rt:GmRuntime){
  const surfaces=rt.sourceSurfaces!,vw=rt.view.width,vh=rt.view.height,vx=rt.view.x,vy=rt.view.y,d=rt.drawState,time=rt.globals.time;
  for(const k of ['my_surface','ball_surface','star_surface','terrible_surface'])if(!surfaces.exists(s[k]))s[k]=surfaces.create(vw,vh);
  rt.drawSelf(s);
  if(s.stop)return;
  // The pit: flowing light, darkened by rings rushing in (or out, as he roars).
  surfaces.target(s.ball_surface);surfaces.clear(C.black,0);
  rt.drawSpriteTiled('spr_knight_bullet_flow',s.fake_x+time*2,s.fake_y);
  rt.drawBlendMode('add');for(let n=0;n<4;n++)rt.drawSpriteTiled('spr_knight_bullet_flow',s.fake_x+time*2,s.fake_y);rt.drawBlendMode('normal');
  s.ball_counter+=s.ball_speed;if(s.ball_counter<0)s.ball_counter+=1800;if(s.ball_counter>1800)s.ball_counter-=1800;
  rt.drawBlendMode('multiply');
  for(s.a=0;s.a<6;s.a++)rt.drawCircleColor(s.fake_x,s.fake_y+57,1800-(s.ball_counter+300*s.a)%1800,C.white,PIT);
  rt.drawCircleColor(s.fake_x,s.fake_y+57,640,C.white,C.black);
  rt.drawBlendMode('normal');
  // The stars and their bursts.
  surfaces.target(s.star_surface);surfaces.clear(C.black,0);
  const each=(test:(b:GmInstance)=>boolean)=>{for(const b of rt.all(star)){if(test(b))continue;rt.userEvent(b,b.con===0?0:1);}};
  each(b=>b.imageBlend===C.white);
  each(b=>b.imageBlend===DKGRAY);
  rt.drawAlphaWrite(false);rt.drawSprite('spr_knight_line_grate',0,0,s.star_flicker,2,2,0,C.black,1);s.star_flicker=2-s.star_flicker;rt.drawAlphaWrite(true);
  each(b=>(b.imageBlend===DKGRAY||b.imageXscale>1)&&b.con<1);
  for(const c of rt.all(starchild())){
   rt.drawBlendMode('add');
   const glow=pingpong(c.timer,2)/4,cxs=c.x-vx,cys=c.y-vy;
   outlineExt(rt,c.sprite!,c.imageIndex,cxs,cys,c.imageXscale,c.imageYscale,c.imageAngle,C.white,glow*c.imageAlpha,c.imageXscale);
   rt.drawSprite(c.sprite,c.imageIndex,cxs,cys,c.imageXscale,c.imageYscale,c.imageAngle,C.white,c.imageAlpha);
   rt.drawBlendMode('normal');
   c.imageAlpha=clamp01(remap(45,60,1,0,c.timer));if(lt(c.imageAlpha,1))c.active=0;if(eq(c.imageAlpha,0))rt.destroy(c);
  }
  for(const a of rt.all(afterimage))rt.drawSprite(a.sprite,a.imageIndex,a.x-vx,a.y-vy,a.imageXscale,a.imageYscale,a.imageAngle,C.white,a.imageAlpha);
  // The giant Knight over the pit, rippling as the pull builds.
  surfaces.target(s.my_surface);surfaces.clear(C.black,0);d.color=C.black;rt.drawRect(0,0,vw,vh,false);
  if(!s.hsv_switch)s.hsv++;else s.hsv--;
  if(s.hsv>=288)s.hsv_switch=1;if(s.hsv<=128)s.hsv_switch=0;
  rt.drawBlendMode('add');
  for(s.a=0;s.a<vh;s.a++){
   const color=makeColorHsv(s.hsv%255,255,255),offset=Math.sin((s.a+time)*0.1)*4*s.intensity+Math.sin((s.a+time)*0.35)*0.5*s.intensity;
   surfaces.part(s.ball_surface,0,s.a,vw,1,offset,s.a,1,1,color,s.ball_darkness);
  }
  surfaces.draw(s.star_surface,0,0);
  rt.drawBlendMode('normal');
  for(const a of rt.all(afterimageGrow))rt.drawSprite(a.sprite,a.imageIndex,a.x-vx,a.y-vy,a.imageXscale,a.imageYscale,a.imageAngle,C.white,a.imageAlpha);
  if(s.line_timer>-1){
   rt.drawAlphaWrite(false);
   const x=vw*0.5-lengthdirX(280,-63),y=vh*0.5-lengthdirY(280,-63),stretch=4+8*(1-Math.min(s.line_timer,16)/16);
   rt.drawSprite('spr_rk_quickslash_marker_gradient',0,x,y,s.line_timer,stretch,-63,makeColorRgb(s.r,s.g,s.b),1);
   rt.drawSprite('spr_rk_quickslash_marker',0,x,y,s.line_timer,stretch,-63,C.black,1);
   rt.drawAlphaWrite(true);
  }
  s.knight_sprite_image+=s.knight_sprite_speed;
  if(lt(s.intensity,3.75))s.intensify=s.intensity;else s.intensify=approach(s.intensify,0,0.1);
  if(!s.do_fake_screen)giant(s,rt,0,0);
  surfaces.target(null);surfaces.part(s.my_surface,0,0,vw,vh,vx,vy,1,1,C.white,s.darkness);
  for(const h of rt.all(heart))rt.drawSelf(h);
  if(s.do_fake_screen)splitScreen(s,rt);
 }
 /** The giant Knight, row by row: the rows waver while he gathers power (intensify over 1.5 adds a shifted copy). */
 function giant(s:GmInstance,rt:GmRuntime,ox:number,oy:number){
  const spr=rt.bank.get(s.knight_sprite);if(!spr)throw Error(`Missing sprite ${s.knight_sprite}`);
  const bl=spr.left,bt=spr.top,time=rt.globals.time,rowY=(a:number)=>oy+s.fake_y+a*2+Math.sin(s.bobble_count*0.1)*s.bobble_amp-10-bt*2;
  if(s.intensify>1.5)for(s.a=0;s.a<spr.height;s.a+=1){
   const wave=Math.sin((s.a+time*4)*0.15)*(s.intensify-1.5)*8;
   rt.drawSpritePart(s.knight_sprite,s.knight_sprite_image,bl,s.a,70,1,ox+s.fake_x-70+(s.a%2===0?wave:-wave),rowY(s.a),2,2,s.imageBlend,s.fake_alpha*0.75);
  }
  for(s.a=0;s.a<spr.height;s.a+=1)
   rt.drawSpritePart(s.knight_sprite,s.knight_sprite_image,bl,s.a,70,1,ox+s.fake_x-70+Math.sin((s.a+time*4)*0.2)*s.intensify*0.3,rowY(s.a),2,2,s.imageBlend,s.fake_alpha);
 }
 /** His last cut: the screen splits into two halves that slide apart, and the soul is gone from the box. */
 function splitScreen(s:GmInstance,rt:GmRuntime){
  const surfaces=rt.sourceSurfaces!,vw=rt.view.width,vh=rt.view.height,vx=rt.view.x,vy=rt.view.y,mid=vw*0.5;
  for(const c of rt.all(starchild()))rt.destroy(c);
  giant(s,rt,vx,vy);
  const half=(clear:()=>void,originX:number)=>{
   surfaces.target(s.terrible_surface);surfaces.clear(C.black,0);surfaces.part(s.my_surface,0,0,vw,vh,0,0,1,1,C.white,s.darkness);
   for(const h of rt.all(heart))rt.drawSprite(h.sprite,h.imageIndex,h.x-vx,h.y-vy,h.imageXscale,h.imageYscale,h.imageAngle,h.imageBlend,h.imageAlpha);
   clear();
   return surfaces.capture(s.terrible_surface,0,0,vw,vh,originX,vh*0.5);
  };
  s.fakey_screen=half(()=>{rt.drawEraseRect(mid+120,-1,vw,vh);rt.drawEraseTriangle(mid-120,-1,mid+120,vh,mid+120,-1);},vw*0.25);
  s.fakey_screen_2=half(()=>{rt.drawEraseRect(mid-119,0,-1,vh);rt.drawEraseTriangle(mid-120,0,mid-120,vh,mid+120,vh);},vw*0.75);
  surfaces.target(null);s.stop=1;
  for(const h of rt.all(heart))rt.destroy(h);
  for(const [x,sprite,dir,speed] of [[vx+vw*0.25,s.fakey_screen,180,15],[vx+vw*0.75,s.fakey_screen_2,0,14]] as const){
   const m=rt.create(marker,x,vy+vh*0.5);s.thismarker=m.id;m.sprite=sprite;m.imageSpeed=0;
   m.direction=dir;scrLerpvar(m,rt,'speed',speed,0.5,12,1,'out');scriptDelayedOn(m,rt,setVar,12,'gravity',1);m.gravityDirection=dir;
  }
 }

 /** Bullet type 107 in the bullet maker: the roar takes the whole turn (it ends the turn itself). */
 const pattern:Chapter2BulletRunner=(s,rt)=>{
  if(s.type!==107)return false;
  if(!s.made){
   rt.globals.turntimer=999999;s.made=1;
   const k=rt.byId(s.creatorid);if(!k)throw Error('The roar needs its creator');k.imageAlpha=0;
   const r=rt.create(roaring,k.x,k.y);r.target=3;bulletInherit(s,r);
  }
  return true;
 };
 return {objects:[star,roaring],pattern};
}
/** scr_draw_outline_ext: a sprite drawn fogged in `color` four times around a point, `size` apart. */
function outlineExt(rt:GmRuntime,sprite:string,frame:number,x:number,y:number,xs:number,ys:number,angle:number,color:number,alpha:number,size:number){
 let ax=size,bx=0,ay=0,by=size;
 if(angle%90!==0){ax=lengthdirX(size,angle);bx=lengthdirX(size,angle+90);ay=lengthdirY(size,angle+90);by=lengthdirY(size,angle);}
 for(const [dx,dy] of [[ax,ay],[-ax,-ay],[bx,by],[-bx,-by]])rt.drawSpriteFog(sprite,frame,x+dx,y+dy,xs,ys,angle,color,alpha);
}
