// The Roaring Knight's Stars (bullet type 98): he points from beside the box, a cone of light opens towards the soul
// and pushes the box back, stars fly out along it, and when the cone closes each star bursts into small stars that
// turn and dart at the soul. Objects: obj_knight_pointing_cone (the Knight pointing, the cone and the push),
// obj_knight_pointing_star, obj_knight_pointing_starchild, obj_heart_follower (a lagging copy of the soul the small
// stars aim at), obj_fake_gt (the box drawn shaking in its place) and obj_afterimage_blend.
import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {C,mergeColor} from '../../gm/graphics';
import {eq,le,lengthdirX,lengthdirY,lerp,lt,pointDirection,round} from '../../gm/math';
import {afterimage,damage,damageAll,growtangle,heart,regularBullet} from '../../deltarune/battle';
import {bulletInit} from '../../deltarune/battle';
import {snd} from '../../deltarune/sound';
import {easeIn,easeOut} from '../../deltarune/ease';
import {angleDifference,angleLerp,childBullet,clamp01,customAfterimage,drawBeamColor,drawOutline,gtMaxx,loopExt,moveTowards,onscreenTolerance,pingpong,preciseHit,remap,rotateTowards,scrAfterimage} from '../../deltarune/chapter3-scripts';
import type {Chapter2BulletRunner} from '../../deltarune/chapter2-bullets';

type Objects=(name:string)=>GmObjectDef;
const GRAY=0x808080,SMALLER_HEART='spr_dodgeheart_smaller_2px';

export function createStars(object:Objects){
 const knight=(rt:GmRuntime)=>rt.first(object('obj_knight_enemy'));
 const soul=(rt:GmRuntime)=>{const h=rt.first(heart);if(!h)throw Error("The Knight's Stars need obj_heart");return h;};
 const roaring=(rt:GmRuntime)=>rt.exists(object('obj_knight_roaring2'));
 const frames=(rt:GmRuntime,sprite:string|null)=>sprite?rt.bank.get(sprite)?.frames??1:1;

 /** obj_heart_follower: follows the soul at an eighth of the distance a frame, 1 to 4 pixels. */
 const follower:GmObjectDef={...object('obj_heart_follower'),events:{
  // target holds obj_heart's object index (the original writes the object, read back as its first instance).
  create:(s,rt)=>{s.target=object('obj_heart').index;s.depth=soul(rt).depth-5;s.smoothing=0.125;s.max_speed=4;},
  step:(s,rt)=>{
   const h=soul(rt);s.xdiff=h.x-s.x;s.ydiff=h.y-s.y;
   const clamp=(v:number)=>Math.max(1,Math.min(s.max_speed,v));
   s.x=moveTowards(s.x,h.x,clamp(Math.abs(s.xdiff)*s.smoothing));s.y=moveTowards(s.y,h.y,clamp(Math.abs(s.ydiff)*s.smoothing));
  },
 }};
 /** obj_fake_gt: the box, hidden and drawn here with a shake offset. */
 const fakeGt:GmObjectDef={...object('obj_fake_gt'),events:{
  create:(s,rt)=>{s.xoffset=0;s.yoffset=0;const b=rt.first(growtangle)!;b.visible=false;s.depth=b.depth;},
  cleanup:(_s,rt)=>{const b=rt.first(growtangle);if(!b)throw Error('obj_fake_gt cleans up without a box');b.visible=true;},
  draw:(s,rt)=>{
   const ox=s.xoffset,oy=s.yoffset;
   for(const b of rt.all(growtangle)){
    rt.drawSprite(b.sprite,1,b.x+ox,b.y+oy,b.imageXscale,b.imageYscale,b.imageAngle,b.imageBlend,b.imageAlpha);
    // As written for Chapter 2's box (the scale relative to its full size).
    if(b.customBox&&b.growth&&b.growcon!==2)rt.drawSprite(b.spr_custom_box,0,b.x+ox,b.y+oy,b.imageXscale/(b.maxxscale/2),b.imageYscale/(b.maxyscale/2),b.imageAngle,b.imageBlend,b.imageAlpha);
    else rt.drawSprite(b.sprite,b.imageIndex,b.x+ox,b.y+oy,b.imageXscale,b.imageYscale,b.imageAngle,b.imageBlend,b.imageAlpha);
   }
  },
  endStep:(s,rt)=>{const b=rt.first(growtangle)!;s.x=b.x;s.y=b.y;s.imageXscale=b.imageXscale;s.imageYscale=b.imageYscale;},
 }};
 /** obj_afterimage_blend: an afterimage drawn in a blend mode (1: additive). */
 const afterimageBlend:GmObjectDef={...object('obj_afterimage_blend'),parent:afterimage,events:{
  create:(s,rt)=>{s.blendmode=1;s.dest_blend=-4;afterimage.events!.create!(s,rt);},
  draw:(s,rt)=>{
   if(s.dest_blend!==-4||s.blendmode!==1)throw Error(`obj_afterimage_blend mode ${s.blendmode}/${s.dest_blend} is not ported`);
   rt.drawBlendMode('add');rt.drawSelf(s);rt.drawBlendMode('normal');
  },
 }};

 /** The cone: frame 2 of spr_knight_bullet_flow as a line from the screen's left to his hand. */
 const flowLine=(s:GmInstance,rt:GmRuntime,left:number,top:number,alpha:number)=>
  rt.drawSpritePart('spr_knight_bullet_flow',2,left,top,(s.x+22-rt.view.x)/2,1,rt.view.x,s.y+54,2,2,GRAY,alpha);
 const cone:GmObjectDef={...object('obj_knight_pointing_cone'),events:{
  create:(s,rt)=>{
   Object.assign(s,{surf:-4,starsurf:-4,angle:0,target_angle:60,bg_x:0,lines_x:0,tween:0,ease:0,angle_lerp:0,imageXscale:2,imageYscale:2,imageSpeed:0});
   const k=knight(rt);if(k){k.visible=false;s.aetimer=k.aetimer;}else s.aetimer=0;
   s.con=0;s.difficulty=0;s.yoff=rt.random.irandom(60)+2;s.timer=0;
   s.fake_gt=rt.create(fakeGt,s.x,s.y).id;s.gt_x=rt.first(growtangle)!.x;
   Object.assign(s,{knockback:0,star_flicker:0,draw_angle:0,starlist:[-1],childlist:[-1],point_frame:0,afterimage_spread:0,image_timer:0,timerb:0,endtimer:120,child_attack:0,count:0});
  },
  cleanup:(s,rt)=>{
   const surfaces=rt.sourceSurfaces;for(const k of ['surf','starsurf'])if(s[k]!==-4&&surfaces?.exists(s[k]))surfaces.free(s[k]);
   const k=knight(rt);if(!k)throw Error('The pointing cone cleans up without the Knight');
   if(!k.visible){k.visible=true;k.aetimer=s.aetimer;}
  },
  step:(s,rt)=>{
   const g=rt.globals,box=()=>rt.first(growtangle)!;
   s.timerb++;
   if(s.timerb===3)for(let i=0;i<3;i++)snd(rt,'snd_knight_drawpower',1.3,1);
   if(s.timerb===120)for(let i=0;i<3;i++)snd(rt,'snd_knight_star_explosion_close',0.7,2);
   if(s.con===4){
    const k=knight(rt)!;s.x=lerp(s.x,k.x,0.15);s.y=lerp(s.y,k.y,0.15);
    if(s.tween===0){s.con=5;k.visible=true;k.aetimer=s.aetimer;}
   }else if(s.tween<1){
    s.tween=moveTowards(s.tween,1,0.05);const e=easeOut(s.tween,4);
    s.x=lerp(s.xstart,box().x+115,e);s.y=lerp(s.ystart,box().y-56,e);
   }
   if(s.con<2)return;
   if(le(g.turntimer,s.endtimer)){
    if(eq(s.angle_lerp,1)){
     let count=0;
     for(const star of rt.withInstances(starDef)){s.starlist[count]=star.id;star.con=1;count++;}
     for(s.i=0;s.i<count;s.i++){const star=rt.byId(s.starlist[s.i]);if(star){star.timer=-s.i;if(s.i%2===1)star.playSound=0;}}
     s.knockback=10;
    }
    if(eq(s.angle_lerp,0)&&s.con<3){s.timer=10;s.con=3;s.yoff=120+rt.random.irandomRange(-60,60);}
    s.angle_lerp=moveTowards(s.angle_lerp,0,0.1);s.angle=lerp(0,s.target_angle,easeIn(s.angle_lerp,6));
   }else if(s.angle<s.target_angle){
    s.angle_lerp=moveTowards(s.angle_lerp,1,0.025);s.angle=lerp(0,s.target_angle,easeOut(s.angle_lerp,6));
   }else s.x+=0.25;
   const fake=rt.byId(s.fake_gt)!;
   if(s.knockback!==0){
    const push=easeIn(s.knockback/10,5)*10;s.gt_x-=push;s.knockback=moveTowards(s.knockback,0,0.5);
    fake.xoffset=rt.random.randomRange(-1,1)*(push/10);fake.yoffset=rt.random.randomRange(-1,1)*(push/10);
   }else{
    s.gt_x-=s.angle/s.target_angle/2;
    fake.xoffset=rt.random.randomRange(-1,1)*(s.angle/s.target_angle);fake.yoffset=rt.random.randomRange(-1,1)*(s.angle/s.target_angle);
   }
   box().x=round(s.gt_x);
   const h=soul(rt);h.x=Math.min(h.x,gtMaxx(rt)!-22);
  },
  draw:(s,rt)=>{
   const last=frames(rt,s.sprite)-1;
   if(s.con>=3){if(eq(s.imageIndex,last))s.imageIndex--;else if(s.imageIndex>0)s.imageIndex-=0.25;}
   else if(s.imageIndex<last)s.imageIndex+=0.5;
   if(s.con<5)rt.drawSelf(s);
   s.aetimer++;
   if(s.con<=4&&s.aetimer%4===0){
    const a=scrAfterimage(s,rt);a.imageAlpha=0.6;a.fadeSpeed=0.02;a.speed=2+s.afterimage_spread/30;a.direction=Math.sin(s.aetimer)*s.angle/2;a.depth=knight(rt)!.depth+1;
    if(s.con===4)s.afterimage_spread=moveTowards(s.afterimage_spread,0,20);
    if(s.con>=1)s.afterimage_spread++;
   }
   if(s.con>=4)return;
   const surfaces=rt.sourceSurfaces!;
   if(!surfaces.exists(s.surf))s.surf=surfaces.create(640,480);
   if(!surfaces.exists(s.starsurf))s.starsurf=surfaces.create(640,480);
   const d=rt.drawState,vx=rt.view.x,vy=rt.view.y;
   if(s.con<=1){
    if(s.con===0)s.con=1;
    if(s.timer<28){
     rt.drawBlendMode('add');
     flowLine(s,rt,s.timer,s.timer*4+s.yoff-2,1);
     if(s.timer%2===0)flowLine(s,rt,s.timer*2,s.timer*4+s.yoff,1);
     rt.drawBlendMode('normal');
    }else{d.color=C.white;rt.drawRect(vx,s.y+54,s.x+22,s.y+56,false);}
    s.timer++;
    if(s.timer>=30){snd(rt,'snd_rocket_long',0.6);s.con=2;}
    return;
   }
   if(s.con===3&&s.timer>0){
    rt.drawBlendMode('add');
    flowLine(s,rt,(10-s.timer)*2,s.yoff-(10-s.timer)*4,s.timer/10);
    flowLine(s,rt,(10-s.timer)*2,s.yoff+(10-s.timer)*4,s.timer/10);
    s.timer--;rt.drawBlendMode('normal');
    if(s.timer===0)s.con=4;
    return;
   }
   // The cone on its surface: a triangle from his hand, the flowing light inside it, the soul cut out.
   surfaces.target(s.surf);surfaces.clear(C.black,0);rt.drawBlendMode('normal');d.alpha=1;d.color=mergeColor(C.white,C.black,s.angle/s.target_angle);
   s.draw_angle=1-s.draw_angle;
   const a=s.angle>0?s.angle+s.draw_angle:0,left=lengthdirX(600,180+a/2),top=lengthdirY(600,180-a/2),bottom=lengthdirY(600,180+a/2);
   const hx=s.x+22-vx;
   // draw_primitive_begin(pr_trianglelist) with four vertices: only the first three make a triangle.
   rt.drawTriangle(hx+left,s.y+56-vy+top,hx,s.y+56-vy,hx+left,s.y+58-vy+bottom,false);
   rt.drawAlphaTest(true);rt.drawBlendMode('add-preserve-alpha');
   rt.drawSprite('spr_knight_bullet_flow',0,s.bg_x,0,2,2,0,C.white,1);rt.drawSprite('spr_knight_bullet_flow',0,s.bg_x+640,0,2,2,0,C.white,1);
   rt.drawSprite('spr_knight_bullet_flow',1,s.lines_x,0,2,2,0,C.white,1);rt.drawSprite('spr_knight_bullet_flow',1,s.lines_x+640,0,2,2,0,C.white,1);
   s.lines_x-=80;s.bg_x-=20;if(s.lines_x<-640)s.lines_x+=640;if(s.bg_x<-640)s.bg_x+=640;
   rt.drawBlendMode('subtract');
   for(const h of rt.all(heart))rt.drawSprite(h.sprite,h.imageIndex,h.x-vx,h.y-vy);
   if(rt.exists(starDef)){
    surfaces.target(s.starsurf);rt.drawBlendMode('normal');surfaces.clear(C.black,0);
    for(const star of rt.all(starDef))if(star.imageXscale>0.5)rt.userEvent(star,0);
    rt.drawBlendMode('subtract');rt.drawSprite('spr_knight_line_grate',0,0,s.star_flicker,2,2,0,C.black,1);s.star_flicker=2-s.star_flicker;
    rt.drawBlendMode('normal');
    for(const star of rt.all(starDef))if(star.imageXscale<=0.5)rt.userEvent(star,0);
    surfaces.target(s.surf);rt.drawAlphaTest(true);rt.drawBlendMode('normal-preserve-alpha');surfaces.draw(s.starsurf,0,0);
   }
   rt.drawAlphaTest(false);rt.drawBlendMode('add');surfaces.target(null);surfaces.draw(s.surf,vx,vy);rt.drawBlendMode('normal');
  },
 }};

 /** obj_knight_pointing_star: grows while flying out, stops with the cone's close, flashes, then bursts. */
 const starDef:GmObjectDef={...object('obj_knight_pointing_star'),events:{
  create:(s,rt)=>{
   bulletInit(s);
   Object.assign(s,{growspeed:0.02,imageXscale:0,imageYscale:0,even:0,destroyonhit:0,timer:0,con:0,growstart:0,playSound:1,beamflicker:0,damage:1,grazepoints:2,element:5,
    difficulty:0,grazetimer:0,side:0,init:0,mask:'spr_knight_bullet_star_mask',rotation:0});
   s.dir=rt.random.choose(-1,1);
  },
  step:(s,rt)=>{
   const vx=rt.view.x,vy=rt.view.y,w=rt.spriteWidth(s),h=rt.spriteHeight(s);
   if(s.x<vx-w/2||s.y<vy-h/2||s.y>vy+480+h/2){rt.destroy(s);return;}
   if(!s.init){if(s.difficulty===0)s.sprite='spr_knight_bullet_star_easy';s.init=1;}
   s.grazetimer++;if(s.grazetimer%4===0)s.grazed=0;
   if(s.con===0){s.imageXscale+=s.growspeed;s.imageYscale+=s.growspeed;}
   else if(s.con===1){s.friction=0.5;s.con++;}
   else if(s.con===2){
    s.mask='spr_knight_bullet_star_mask';
    if(s.speed===0){s.gravity=0.1;s.gravityDirection=s.direction-180;s.friction=0;}
    s.timer++;
    if(s.timer>=40){s.timer=0;s.con++;if(s.playSound)snd(rt,'snd_explosion_firework');}
    s.growstart=s.imageXscale;
   }else if(s.con===3){
    s.timer++;s.imageXscale=s.growstart+clamp01(s.timer/2);s.imageYscale=s.growstart+clamp01(s.timer/2);
    if(s.timer===3){
     let angle=90;if(s.difficulty===2)angle+=s.side;
     for(s.i=0;s.i<6;s.i++){
      const d=childBullet(s,rt,s.x,s.y,starChild);s.d=d.id;d.imageAngle=angle;d.direction=angle;
      if(s.difficulty===0&&s.i%2===1){d.speed=1;d.lifetime=30;}else d.speed=4;
      d.imageXscale=s.imageXscale*0.5;d.imageYscale=s.imageYscale*0.5;d.deceleration=0.15;
      if(s.difficulty===2&&s.i%3>0){
       d.difficulty=-1;d.lifetime=30;d.speed=2;
       if(s.i===1||s.i===4){d.speed/=3;d.minspeed/=3;d.deceleration/=3;}else{d.speed*=2/3;d.minspeed*=2/3;d.deceleration*=2/3;}
       d.sprite='spr_knight_starchild_trail';
      }else d.difficulty=s.difficulty;
      if(s.i===1||s.i===4)angle+=s.difficulty===2?180:48;else angle+=s.difficulty===2?0:66;
     }
     s.active=0;
    }
    if(s.timer>=4){
     const sw=rt.spriteWidth(s),sh=rt.spriteHeight(s),spr=rt.bank.get(s.sprite!)!;
     s.imageXscale=(sw+16)/spr.width;s.imageYscale=(sh+16)/spr.height;
     const a=scrAfterimage(s,rt);a.fadeSpeed*=3;rt.destroy(s);
    }
   }
  },
  draw:(s,rt)=>{
   const spr=rt.bank.get(s.sprite!)!,xs=(rt.spriteWidth(s)+16)/spr.width,ys=(rt.spriteHeight(s)+16)/spr.height;
   const color=mergeColor(GRAY,C.red,clamp01(s.timer/30)),alpha=(Math.sin(s.timer*3)+1)*0.25;
   if(s.con===2||s.con===3){
    let a=1,length=120,prog=clamp01(s.timer/30);
    if(s.con===2){a=clamp01(prog-alpha);length=50*clamp01(prog-(s.timer%2)*0.75)+50;}
    let offset=66;const sub=s.difficulty>=1?length:length/2;
    rt.drawBlendMode('add');
    let beam=s.difficulty>=2?color:C.white;
    const ray=(len:number,angle:number,c:number)=>drawBeamColor(rt,s.x,s.y,len,10,angle,c,C.black,a,false);
    if(s.difficulty===2){
     prog=easeIn(clamp01(s.timer/20),4);offset=s.con===3?5:lerp(66,5,prog);beam=color;
     if(s.timer>=30){prog=easeIn(clamp01((s.timer-30)/10),4);length+=50-prog*50;}
     ray(length,90+s.side,beam);ray(length,-90+s.side,beam);
     ray(sub,90+s.side+offset,beam);ray(sub,90+s.side-offset,beam);ray(sub,-90+s.side+offset,beam);ray(sub,-90+s.side-offset,beam);
    }else{
     ray(length,90,beam);
     ray(sub,156,C.white);ray(sub,24,C.white);ray(sub,270,C.white);
     ray(length,336,beam);ray(length,204,beam);
    }
    rt.drawBlendMode('normal');
   }
   if(s.con===1||s.con===2){
    rt.drawSprite(s.sprite,1,s.x,s.y,xs+0.1,ys+0.1,s.imageAngle,C.white,alpha);
    rt.drawSprite(s.sprite,0,s.x,s.y,xs,ys,s.imageAngle,color,1);
   }
   if(s.con===3||s.con===4){
    rt.drawSprite(s.sprite,2,s.x,s.y,xs+0.1,ys+0.1,s.imageAngle,C.white,(Math.sin(s.timer*6)+1)*0.25);
    rt.drawSprite(s.sprite,2,s.x,s.y,xs,ys,s.imageAngle,C.white,1);
   }
  },
  // User 0: the star in the cone's star surface (screen coordinates).
  user0:(s,rt)=>{
   const spr=rt.bank.get(s.sprite!)!;
   rt.drawSprite(s.sprite,0,s.x-rt.view.x,s.y-rt.view.y,(rt.spriteWidth(s)+16)/spr.width,(rt.spriteHeight(s)+16)/spr.height,0,C.white,1);
  },
  // User 5: a hit hurts the whole party for 75 (the Knight's whole-party flag set around it).
  user5:(s,rt)=>{
   s.target=3;s.damage=75;
   for(const k of rt.all(object('obj_knight_enemy')))k.aoedamage=1;
   if(s.active===1){
    if(!preciseHit(s,rt,3))return;
    if(s.target!==3)damage(s,rt);if(s.target===3)damageAll(s,rt);
    if(s.destroyonhit===1)rt.destroy(s);
   }
   for(const k of rt.all(object('obj_knight_enemy')))k.aoedamage=0;
  },
 }};

 /** obj_knight_pointing_starchild: slows, turns to the soul's follower, then darts at it trailing red. */
 const starChild:GmObjectDef={...object('obj_knight_pointing_starchild'),parent:regularBullet,events:{
  create:(s,rt)=>{
   regularBullet.events!.create!(s,rt);bulletInit(s);
   Object.assign(s,{deceleration:0.1,minspeed:1,timer:0,drawtimer:0,damage:1,element:5,lifetime:60,difficulty:0,con:0,tracking:1,start_angle:0,target_angle:0,rotation:0,
    delay:0,init:0,rotatespeed:10,ease:0,xscale_start:0,yscale_start:0,xprev:s.x,yprev:s.y,outline:0,accel:0.5,sprite:'spr_knight_starchild_parts'});
  },
  step:(s,rt)=>{
   if(!s.init){
    s.init=1;
    if(s.difficulty>=2){
     s.delay=25;
     for(const c of rt.all(object('obj_dbulletcontroller'))){s.delay+=c.delay;if(c.subdelay===4){c.subdelay=0;c.delay+=5;}else{c.subdelay++;c.delay++;}}
    }
   }
   // The inherited step may destroy it off screen; the rest still runs, as in the original.
   regularBullet.events!.step!(s,rt);
   if(roaring(rt))return;
   if(s.con<=2){
    if(s.speed>s.minspeed)s.speed=moveTowards(s.speed,s.minspeed,s.deceleration);
    if(s.con===0&&s.delay>0){
     s.timer++;
     if(s.timer>=s.delay){if(!onscreenTolerance(rt,s,10))rt.destroy(s);s.timer=0;s.con=1;}
    }
   }
   if(s.con>=1&&s.con<=3){
    const f=rt.first(follower);if(!f)throw Error("The Knight's small stars need obj_heart_follower");
    s.target_angle=pointDirection(s.x,s.y,f.x+10,f.y+10);
    if(s.con>=2&&s.tracking){
     const diff=angleDifference(s.target_angle,s.direction);
     if(Math.abs(diff)<90){
      if(s.con<3){s.direction=rotateTowards(s.direction,s.target_angle,2);s.imageAngle=s.direction;}
      else if(Math.abs(diff)<=4)s.rotation=0;
      else if(Math.abs(diff)>30)s.rotation=Math.sign(diff)*2;
      else s.rotation=Math.sign(diff);
     }else if(s.con>=3){s.tracking=0;s.rotation=Math.sign(s.rotation);}
    }else{s.direction+=s.rotation;s.imageAngle+=s.rotation;}
   }
   if(s.con===1){
    s.imageAngle=angleLerp(s.direction,s.target_angle,s.timer/10);s.timer++;
    if(s.timer>=10){s.timer=0;s.con=2;s.direction=s.imageAngle;s.tracking=1;}
    if(s.xscale_start===0)s.xscale_start=s.imageXscale;
    if(s.yscale_start===0)s.yscale_start=s.imageYscale;
    const k=Math.cos(s.timer/5*Math.PI);
    s.imageYscale=s.yscale_start*k;s.imageBlend=mergeColor(C.white,C.black,k);s.outline=mergeColor(C.black,C.red,k);
   }
   if(s.con===2){s.timer++;if(s.timer>=10){s.timer=0;s.con=3;}}
   if(s.con>=1&&s.ease<40){
    const speed=(1-s.ease/40)*2;s.x-=lengthdirX(speed,s.target_angle);s.y-=lengthdirY(speed,s.target_angle);s.ease++;
   }
   if(s.con===3){
    s.speed=moveTowards(s.speed,25,0.5);s.imageXscale=s.xscale_start+s.speed/60;s.imageYscale=s.yscale_start-s.speed/90;
    customAfterimage(s,rt,afterimageBlend);
    const a=customAfterimage(s,rt,afterimageBlend);a.imageBlend=C.red;a.fadeSpeed=0.25;a.imageAlpha=0.5;a.direction=s.imageAngle;a.speed=1;
   }
   if(s.con===4){s.speed=0;s.timer++;if(s.timer>=4)rt.destroy(s);}
  },
  draw:(s,rt)=>{
   if(s.con===4){const scale=(s.imageYscale+s.imageXscale)/2;rt.drawSprite('spr_thrash_missile_explosion',s.timer,s.x,s.y,scale,scale,s.imageAngle-90,C.red,1);return;}
   rt.drawBlendMode('add');
   s.drawtimer++;
   const glow=pingpong(s.drawtimer,2)/4;
   let glowColor=C.white;if(s.con>=1)glowColor=s.con>1?C.red:mergeColor(C.white,C.red,s.timer/10);
   drawOutline(s,rt,s.imageXscale,glowColor,glow*s.imageAlpha);
   if(s.con>0)rt.drawSprite(s.sprite,1,s.x,s.y,s.imageXscale,s.imageYscale,s.imageAngle,s.outline,s.imageAlpha);
   rt.drawBlendMode('normal');
   rt.drawSprite(s.sprite,0,s.x,s.y,s.imageXscale,s.imageYscale,s.imageAngle,s.imageBlend,s.imageAlpha);
   if(s.difficulty<2){
    s.imageAlpha=clamp01(remap(s.lifetime-15,s.lifetime,1,0,s.drawtimer));
    if(lt(s.imageAlpha,1))s.active=0;
    if(eq(s.imageAlpha,0))rt.destroy(s);
   }
  },
  // User 5: during the roar a hit is the Knight's whole-party hit; otherwise the whole party takes 75.
  user5:(s,rt)=>{
   const small=()=>soul(rt).sprite===SMALLER_HEART;
   const hit=(size:number)=>{
    if(!preciseHit(s,rt,size))return false;
    if(roaring(rt))for(const k of rt.all(object('obj_knight_enemy')))rt.userEvent(k,2);
    else{if(s.target!==3)damage(s,rt);if(s.target===3)damageAll(s,rt);}
    if(s.destroyonhit===1)rt.destroy(s);
    return true;
   };
   if(roaring(rt)){if(s.active===1)hit(small()?0:2);return;}
   s.target=3;s.damage=75;
   for(const k of rt.all(object('obj_knight_enemy')))k.aoedamage=1;
   if(s.active===1&&!hit(small()?1:5))return;
   for(const k of rt.all(object('obj_knight_enemy')))k.aoedamage=0;
  },
 }};

 /** Bullet type 98 in the bullet maker: the cone, then a star every 45 frames (every 4 once the first is out) until
  * the turn is down to its last `endtimer` frames. */
 const pattern:Chapter2BulletRunner=(s,rt)=>{
  if(s.type!==98)return false;
  const g=rt.globals;
  if(s.init===1){
   s.init=2;const h=soul(rt);rt.create(follower,h.x,h.y);
   const bm=rt.create(cone,s.x,s.y);s.bulletmaker=bm.id;s.btimer=0;bm.difficulty=s.difficulty;s.endtimer=120;
   if(s.difficulty>=2){s.endtimer+=30;g.turntimer+=60;s.endtimer+=60;}
   bm.endtimer=s.endtimer;s.delay=0;s.subdelay=0;g.turntimer+=30;
   if(s.difficulty===0)s.side=rt.random.choose(-1,1);
  }else if(s.init>=3)return true;
  if(le(g.turntimer,s.endtimer+1))s.init=3;
  else if((s.made!==0&&s.btimer>=4)||s.btimer>=45){
   if(s.difficulty===2)s.side=rt.random.choose(0,66,-66);
   const bm=rt.byId(s.bulletmaker)!;
   const d=childBullet(s,rt,bm.x+22,bm.y+56,starDef);s.d=d.id;d.difficulty=s.difficulty;d.side=s.side;
   s.starsound=snd(rt,'snd_stardrop',0.5);if(s.starsound!==undefined)rt.sourceAudio?.volume(s.starsound,0.5,0);
   if(s.made===0){s.size=rt.random.randomRange(0.5,1);s.special=rt.random.randomRange(-0.5,0.5);}
   else{s.special+=0.5;s.special+=0.5+Math.sin(rt.random.random(1))*0.3;s.special%=1;s.special-=0.5;s.size+=0.5+Math.sin(s.made)*0.5;s.size%=1;}
   let dir=180+s.special*bm.angle;
   if(s.size<=0.1){
    const h=soul(rt),toward=pointDirection(bm.x+22,bm.y+56,h.x+10,h.y+10);
    if(Math.abs(angleDifference(toward,dir))<20){
     dir=dir<toward?toward-20+angleDifference(toward,dir):toward+20+angleDifference(toward,dir);
     dir=loopExt(dir,180-bm.angle,180+bm.angle);
    }
   }
   d.direction=dir;d.speed=lerp(10,5,s.size);d.grow_Speed=lerp(0.1,0.25,s.size);s.made++;s.btimer=0;
  }
  return true;
 };
 return {objects:[follower,fakeGt,afterimageBlend,cone,starDef,starChild],pattern};
}
