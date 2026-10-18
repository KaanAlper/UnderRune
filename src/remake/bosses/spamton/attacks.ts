// Spamton's attacks (bullet types 23-25): his laughing head comes out and fires Minitons that run and jump along the
// box's edges, words of dollar letters that wave toward the soul, or sucks money in while the box is pulled toward
// him. Objects: obj_spamton_attack_mode, obj_spamton_jumper, obj_spamton_wordbullet, obj_spamton_warped_box and
// obj_spamton_dollar.
import {resolveEvent,type GmInstance,type GmObjectDef,type GmRuntime} from '../../gm/runtime';
import {clamp,eq,gt,le,lengthdirX,lengthdirY,lerp,lt,pointDirection} from '../../gm/math';
import {C} from '../../gm/graphics';
import {easeIn,easeOut} from '../../deltarune/ease';
import {angleDifference,moveTowards} from '../../deltarune/chapter3-scripts';
import {sndPitchTime} from '../../deltarune/chapter2-battle';
import {shake} from '../../deltarune/battle';
import {snd} from '../../deltarune/sound';
import {sourceText} from '../../host/text';
import type {Chapter2BulletRunner} from '../../deltarune/chapter2-bullets';

/** What the word bullets spell, one letter a bullet. */
const WORDS=['obj_spamton_attack_mode_slash_Step_0_gml_69_0','obj_spamton_attack_mode_slash_Step_0_gml_69_1','obj_spamton_attack_mode_slash_Step_0_gml_69_2',
 'obj_spamton_attack_mode_slash_Step_0_gml_69_3','obj_spamton_attack_mode_slash_Step_0_gml_69_4','obj_spamton_attack_mode_slash_Step_0_gml_69_5','obj_spamton_attack_mode_slash_Step_0_gml_69_6'];

export function createSpamtonAttacks(object:(name:string)=>GmObjectDef){
 const box=(rt:GmRuntime)=>{const b=rt.first(object('obj_growtangle'));if(!b)throw Error("Spamton's attack needs obj_growtangle");return b;};
 const mode=(rt:GmRuntime)=>rt.first(attackMode);
 const heart=(rt:GmRuntime)=>{const h=rt.first(object('obj_heart'));if(!h)throw Error("Spamton's attack needs obj_heart");return h;};
 const inherit=(s:GmInstance,rt:GmRuntime,event:'create'|'step')=>resolveEvent(s.object.parent,event)?.(s,rt);
 /** scr_drawpart_crop: the sprite cut to a rectangle (the width passed is the right edge, as the script does). */
 function drawPartCrop(s:GmInstance,rt:GmRuntime,x1:number,y1:number,x2:number,y2:number){
  const spr=rt.bank.get(s.sprite!);if(!spr)throw Error('scr_drawpart_crop needs sprite '+s.sprite);
  const xo=spr.originX*s.imageXscale,yo=spr.originY*s.imageYscale,w=rt.spriteWidth(s),h=rt.spriteHeight(s);
  const ax=s.x-Math.abs(xo),ay=s.y-Math.abs(yo);
  if(ax>x1&&ax+w<x2&&ay>y1&&ay+h<y2){rt.drawSelf(s);return;}
  const left=clamp(x1-ax,0,Math.abs(w)),top=clamp(y1-ay,0,Math.abs(h)),right=clamp(x2-ax,0,Math.abs(w)),bottom=clamp(y2-ay,0,Math.abs(h));
  rt.drawSpritePart(s.sprite!,s.imageIndex,left,top,right,bottom,s.x-xo+left,s.y-yo+top,s.imageXscale,s.imageYscale,s.imageBlend,s.imageAlpha);
 }
 const attackMode:GmObjectDef={...object('obj_spamton_attack_mode'),events:{
  create:(s,rt)=>{
   s.timer=0;s.btimer=rt.random.irandom(10);
   Object.assign(s,{state:0,attack:0,firingspeed:20,mouthx:46,mouthy:97,creator:0,flip:0,imageXscale:2,imageYscale:2,pieceoffset_x:12,pieceoffset_y:94});
   const top=rt.create(object('obj_bulletparent'),s.x-s.pieceoffset_x,s.y-s.pieceoffset_y);s.headtop=top.id;
   Object.assign(top,{imageSpeed:.1,sprite:'spr_spamton_laugh_top',imageAlpha:0,imageXscale:2,imageYscale:2});top.depth=s.depth-2;
   s.reposition=0;s.jumpy=rt.random.irandom(1);s.init=0;s.made=rt.random.choose(0,1);s.doublecount=0;s.inhalesfx=0;s.effecttimer=0;
  },
  destroy:(s,rt)=>{const m=rt.byId(rt.globals.monsterinstance[s.creator]);if(m)m.visible=true;},
  animationEnd:s=>{if(s.state===0)s.state=1;},
  step:(s,rt)=>{
   const g=rt.globals;
   if(s.init===0){if(s.attack===1)s.firingspeed=25;else s.btimer=s.firingspeed-rt.random.irandom(10);s.init=1;}
   // Out of his body: the head rises.
   if(s.state===1){
    if(s.reposition===0){s.reposition=1;s.x-=s.pieceoffset_x;s.y-=s.pieceoffset_y;}
    s.timer++;if(s.timer>=10){s.timer=0;s.state=2;}
   }
   if(s.state===2){
    s.timer++;s.btimer++;
    if(s.attack!==0)s.y=s.ystart-s.pieceoffset_y+Math.sin(s.timer/10)*50;
    if(s.btimer>=s.firingspeed&&s.attack<2){
     if(s.attack===0)fireMiniton(s,rt);else fireWord(s,rt);
     s.btimer=0;
    }else if(s.btimer>=s.firingspeed&&s.attack===2&&!lt(g.turntimer,40)){
     // Inhaling: the sound rises and orbs gather at his mouth.
     if(s.inhalesfx===0){s.inhalesfx=1;rt.soundLoop?.('snd_sneo_overpower');rt.soundPitch?.('snd_sneo_overpower',3);sndPitchTime(rt,'snd_sneo_overpower',5,30);rt.sourceAudio?.volume('snd_sneo_overpower',.5,0);}
     s.effecttimer++;
     if(s.effecttimer%6===0)for(s.i=0;s.i<3;s.i++){
      const d=rt.create(object('obj_rouxls_power_up_orb'),s.x+s.mouthx,s.y+s.mouthy);s.d=d.id;
      d.direction=rt.random.irandom(40)+s.i*40+120;d.distance_multiplier=.75;d.lifetime=12;d.max_radius=3;d.depth=s.depth-1;d.imageBlend=s.imageBlend;
     }
    }
    if(le(g.turntimer,30)&&s.btimer>8){s.timer=10;s.state=3;}
   }
   // Back into his body.
   if(s.state===3){
    if(s.inhalesfx){s.inhalesfx=0;rt.soundStop?.('snd_sneo_overpower');}
    s.timer--;if(s.timer===0){s.imageIndex=4;s.imageSpeed=-1;s.x=s.xstart;s.y=s.ystart;s.state=4;}
   }
   if(s.state===4&&s.imageIndex<=0)s.imageSpeed=0;
  },
  draw:(s,rt)=>{
   const top=rt.byId(s.headtop);if(!top)throw Error("Spamton's attack lost its head");
   if(s.state===0||s.state===4){top.imageAlpha=0;rt.drawSelf(s);}
   else if(s.state===1||s.state===3){
    top.imageAlpha=1;const ease=easeOut(s.timer/10,1);
    rt.drawSprite('spr_spamton_laugh_bottom',0,s.x,s.y,2,2,0,C.white,1);rt.drawSprite('spr_spamton_laugh_middle',0,s.x,lerp(s.y-10,s.y,ease),2,2,0,C.white,1);
    top.y=lerp(s.y+20,s.y-4,ease);
   }else{
    rt.drawSprite('spr_spamton_laugh_bottom',0,s.x,s.y,2,2,0,C.white,1);rt.drawSprite('spr_spamton_laugh_middle',0,s.x,s.y+Math.cos(s.timer)*4-10,2,2,0,C.white,1);
    top.y=s.y-Math.cos(s.timer)*4;
   }
  },
 }};
 /** A Miniton: runs left along the box's edge; every other one jumps at the soul. */
 function fireMiniton(s:GmInstance,rt:GmRuntime){
  const d=rt.create(jumper,s.x+s.mouthx,s.y+s.mouthy);s.d=d.id;
  d.direction=180;d.speed=5;d.target=s.target;d.damage=s.damage;d.grazepoints=s.grazepoints;
  if(s.jumpy===0){
   d.jumper=1;
   if(s.doublecount===2){s.jumpy=2;s.doublecount=0;}
   else{s.jumpy=rt.random.choose(1,2,2);if(s.jumpy===1)s.doublecount++;else s.doublecount=0;}
  }else s.jumpy--;
  d.gravity=s.flip?.12:-.19;s.flip=1-s.flip;
 }
 /** A word: one bullet per letter, waving out of his mouth. */
 function fireWord(s:GmInstance,rt:GmRuntime){
  let word=sourceText(rt.random.choose(...WORDS));
  if(word===sourceText('obj_spamton_attack_mode_slash_Step_0_gml_70_0')&&rt.random.irandom(19)===0)word=sourceText('obj_spamton_attack_mode_slash_Step_0_gml_70_1');
  let xoff=s.mouthx;
  for(s.i=0;s.i<word.length;s.i++){
   const d=rt.create(wordBullet,s.x+xoff,s.y+s.mouthy-10+Math.sin((s.timer+20)/10)*50);s.d=d.id;
   d.direction=180;d.speed=10;d.timer=-xoff/2;d.offset=s.y+s.mouthy-10-d.ystart;d.mouthx=s.x+s.mouthx;d.creator=s.id;
   d.bulletletter=word[s.i];d.target=s.target;d.damage=s.damage;d.grazepoints=s.grazepoints;xoff+=15;d.type=s.made;
  }
  s.made=1-s.made;
 }
 const jumper:GmObjectDef={...object('obj_spamton_jumper'),events:{
  create:(s,rt)=>{inherit(s,rt,'create');Object.assign(s,{flip:0,jumper:0,init:0,jumpstate:1,timer:0,truegravity:0,destroyonhit:0});},
  step:(s,rt)=>{
   inherit(s,rt,'step');
   if(s.truegravity===0){s.destroyonhit=0;s.truegravity=s.gravity*2;}
   if(s.init===0){s.flip=Math.sign(s.gravity);if(s.gravity<0)s.imageYscale=-1;if(s.jumper)s.depth--;s.yscale=s.imageYscale;s.init=1;}
   const h=heart(rt),b=box(rt),bh=rt.spriteHeight(b)/2;
   // A jumper stops below the soul, crouches, and leaps at it.
   if(s.jumpstate===0&&s.jumper&&le(h.x+8,s.x)&&gt(h.x+8,s.x-40)){
    s.gravity=clamp(s.gravity,-.1,.1);s.jumpstate=-1;s.jumper=0;s.speed=0;s.timer=10;s.imageSpeed=0;s.imageIndex=0;
   }
   if(s.jumpstate===-1){
    s.timer--;
    if(s.timer<=0){
     s.vspeed=Math.sqrt(2*Math.abs(s.truegravity)*clamp(Math.abs(h.y+8-s.y)+10,20,100))*-Math.sign(s.truegravity);
     s.gravity=s.truegravity;s.hspeed=clamp((h.x+8-s.x)/40,-5,-1);s.jumpstate=1;s.imageIndex=1;
    }
   }
   if(s.jumpstate===1){
    if(s.imageSpeed===0&&gt(s.vspeed*s.gravity,0))s.imageSpeed=1;
    const top=b.y-bh+24,bottom=b.y+bh-24;
    if(lt(s.y,top)){s.y=top;s.gravity=0;s.vspeed=0;s.hspeed=-4;s.imageSpeed=.5;s.jumpstate=0;}
    else if(gt(s.y,bottom)){s.y=bottom;s.gravity=0;s.vspeed=0;s.hspeed=-4;s.imageSpeed=.5;s.jumpstate=0;}
   }
  },
  draw:(s,rt)=>{
   const b=box(rt),m=mode(rt);if(!m)throw Error('obj_spamton_jumper needs obj_spamton_attack_mode');
   const minx=b.x-rt.spriteWidth(b)/2+5,maxx=m.x+m.mouthx;
   if(s.timer>0){
    const scale=easeOut(1-Math.abs(s.timer-5)/5,7);
    const y=lerp(s.y,b.y+(rt.spriteHeight(b)/2-4)*s.flip,scale/2);
    rt.drawSprite(s.sprite!,s.imageIndex,s.x,y,1+scale/2,(1-scale/2)*s.yscale,0,C.white,1);
    rt.drawSpriteFog(s.sprite!,s.imageIndex,s.x,y,1+scale/2,(1-scale/2)*s.yscale,0,C.white,(10-s.timer)/10);
   }else drawPartCrop(s,rt,minx,0,maxx,800);
   if(lt(s.x+20,minx))rt.destroy(s);
  },
 }};
 const wordBullet:GmObjectDef={...object('obj_spamton_wordbullet'),events:{
  create:(s,rt)=>{
   inherit(s,rt,'create');const b=box(rt),h=heart(rt);
   Object.assign(s,{bulletletter:'$',sinesize:Math.abs(s.ystart-b.y),sinesign:Math.sign(b.y-s.ystart),mouthx:0,creator:0,type:0,scale:1,init:0,rawspeed:0,
    targetx:h.x+8,targety:h.y+8,timer:0,truey:s.y,fauxdirection:180,tracked:false});
  },
  step:(s,rt)=>{
   inherit(s,rt,'step');
   if(s.init===0){s.rawspeed=s.speed;s.init=1;}
   const creator=rt.byId(s.creator);
   if(!lt(s.x,s.mouthx-16)&&creator)s.offset=creator.y+creator.mouthy-4-s.ystart;
   else if(lt(s.x,s.mouthx-16))s.offset=moveTowards(s.offset,0,3);
   // The second kind turns toward where the soul was, then flies straight.
   if(s.type===1&&lt(s.x,s.mouthx)){
    s.speed=0;
    if(!s.tracked){
     const dir=pointDirection(s.x,s.truey,s.targetx,s.targety),diff=angleDifference(s.fauxdirection,dir);
     if(gt(Math.abs(diff),10))s.fauxdirection-=Math.sign(diff)*10;else{s.tracked=true;s.fauxdirection=dir;}
    }
    const dx=lengthdirX(5,s.fauxdirection);s.x+=dx*Math.abs(5/dx);s.truey+=lengthdirY(5,s.fauxdirection)*Math.abs(5/dx);
   }
   s.y=s.truey+Math.cos(s.x/(gt(s.x,s.mouthx-16)?12:clamp(s.sinesize,10,20)))*10*s.sinesign+s.offset;
   if(s.type===0||!lt(s.x,s.mouthx))s.speed=moveTowards(s.speed,5,.25);
  },
  // The letter, outlined in black, grows as it leaves his mouth.
  draw:(s,rt)=>{
   const spr=rt.bank.get(s.sprite!),xo=(spr?.originX??0)*s.imageXscale;
   if(!lt(s.x-xo,s.mouthx))return;
   const d=rt.drawState;d.color=C.black;d.font='fnt_main';
   if(lt(s.scale,3))s.scale+=.025;s.imageXscale=s.scale*.5;s.imageYscale=s.scale*.8;
   s.xx=s.x-3*s.scale;s.yy=s.y-9*s.scale;
   for(const [dx,dy] of [[s.scale,0],[0,s.scale],[-s.scale,0],[0,-s.scale]])rt.drawText(s.xx+dx,s.yy+dy,s.bulletletter,s.scale,s.scale,0);
   d.color=C.white;rt.drawText(s.xx,s.yy,s.bulletletter,s.scale,s.scale,0);
  },
 }};
 const warpedBox:GmObjectDef={...object('obj_spamton_warped_box'),events:{
  create:(s,rt)=>{
   const b=box(rt);s.depth=b.depth;b.imageAlpha=0;
   const w=rt.spriteWidth(b)/2,h=rt.spriteHeight(b)/2;
   Object.assign(s,{minx:b.x-w,maxx:b.x+w,miny:b.y-h,maxy:b.y+h,suckx:b.x+100,upper_sucky:b.y-40,lower_sucky:b.y+40,suckpower:0,timer:0,snapback:0,target:0,wait:false});
   for(const solid of rt.withInstances(object('obj_battlesolid'))){solid.imageXscale=3;solid.imageYscale=3;}
  },
  destroy:(_s,rt)=>{
   for(const b of rt.withInstances(object('obj_growtangle'))){b.imageAlpha=1;b.keep=1;}
   for(const solid of rt.withInstances(object('obj_battlesolid'))){solid.imageXscale=2;solid.imageYscale=2;}
  },
  roomEnd:(_s,rt)=>{for(const b of rt.withInstances(object('obj_growtangle')))b.imageAlpha=1;},
  // The box pulled toward him: a green triangle pair with a black inside.
  draw:(s,rt)=>{
   const d=rt.drawState,before=d.color,p=s.suckpower,rx=lerp(s.maxx,s.suckx,p);
   d.color=0x00c000;
   rt.drawTriangle(s.minx,s.miny,rx,lerp(s.miny,s.upper_sucky,p),rx,lerp(s.maxy,s.lower_sucky,p));
   rt.drawTriangle(s.minx,s.miny,s.minx,s.maxy,rx,lerp(s.maxy,s.lower_sucky,p));
   d.color=C.black;const rx4=lerp(s.maxx-4,s.suckx-4,p);
   rt.drawTriangle(s.minx+4,s.miny+4,rx4,lerp(s.miny+4,s.upper_sucky+3,p),rx4,lerp(s.maxy-4,s.lower_sucky-3,p));
   rt.drawTriangle(s.minx+4,s.miny+4,s.minx+4,s.maxy-4,rx4,lerp(s.maxy-4,s.lower_sucky-3,p));
   d.color=before;
   if(gt(rt.globals.turntimer,30)){
    if(s.timer<60)s.timer++;else s.timer--;
    s.suckpower=s.timer>=59?s.timer/60:easeIn(s.timer/60,3);
   }else{
    if(s.timer>30)s.timer=30;if(eq(s.snapback,0))s.snapback=-1;if(s.timer>0)s.timer--;
    s.suckpower=easeIn(s.timer/30,-2);
   }
  },
  // The soul is pulled with the box, kept inside its sloping sides, and snaps back when it lets go.
  endStep:(s,rt)=>{
   const h=rt.first(object('obj_heart'));if(!h)return;
   s.rborder=lerp(s.maxx,s.suckx,s.suckpower);s.uborder=s.miny;s.dborder=s.maxy;
   if(eq(s.snapback,0))h.x+=s.suckpower;
   if(le(s.snapback,0)&&le(rt.globals.turntimer,30)&&!lt(h.x,s.rborder-22)){
    s.snapback=s.suckpower;
    if(gt(s.suckpower,.5)&&!rt.exists(shake)){const d=rt.create(shake,0,0);s.d=d.id;d.shakex=Math.ceil(s.suckpower*4);d.shakey=Math.ceil(s.suckpower*4);}
   }
   if(gt(s.snapback,0)){h.x-=20*easeIn(s.snapback,2);s.snapback-=.1;}
   if(lt(h.x,s.minx+3))h.x=s.minx+3;
   if(gt(h.x,s.rborder-20))h.x=s.rborder-20;
   const across=(h.x-(s.minx+3))/(s.rborder-20-(s.minx+3)),up=(s.upper_sucky-s.miny)*across*s.suckpower,down=(s.maxy-s.lower_sucky)*across*s.suckpower;
   if(lt(h.y,s.uborder+3+up))h.y=s.uborder+3+up;
   if(gt(h.y,s.dborder-20-down))h.y=s.dborder-20-down;
   if(lt(h.y,s.uborder+3))h.y=s.uborder+3;
   if(gt(h.y,s.dborder-20))h.y=s.dborder-20;
  },
 }};
 const dollar:GmObjectDef={...object('obj_spamton_dollar'),events:{
  create:(s,rt)=>{inherit(s,rt,'create');s.imageAlpha=0;},
  // Drawn toward his mouth while he inhales.
  step:(s,rt)=>{
   inherit(s,rt,'step');const m=mode(rt);if(!m)return;
   if(m.state===2){
    if(gt(s.x,m.x+m.mouthx-50))s.y+=clamp(m.y+m.mouthy-s.y,-5,5);
    if(lt(s.x,m.x+m.mouthx-10)){s.direction=pointDirection(s.x,s.y,m.x+m.mouthx,m.y+m.mouthy);s.friction=-.1;}
   }else s.friction=0;
  },
  draw:(s,rt)=>{
   const m=mode(rt);if(!m)throw Error('obj_spamton_dollar needs obj_spamton_attack_mode');
   if(lt(s.imageAlpha,1)&&m.state<=2)s.imageAlpha+=.1;
   else if(m.state>2){s.imageAlpha-=.1;s.active=0;if(le(s.imageAlpha,0))rt.destroy(s);}
   const maxx=m.x+m.mouthx;
   if(m.state===2){drawPartCrop(s,rt,0,0,maxx,800);const spr=rt.bank.get(s.sprite!);if(gt(s.x-(spr?.originX??0)*s.imageXscale,maxx))rt.destroy(s);}
   else rt.drawSelf(s);
  },
 }};
 /** Bullet types 23-25 in the bullet maker: his head (and, for the vacuum, the warped box), then dollars. */
 const pattern:Chapter2BulletRunner=(s,rt)=>{
  if(s.type<23||s.type>25)return false;
  const g=rt.globals;
  if(s.init===1){
   const m=rt.byId(g.monsterinstance[s.creator]);if(m)m.visible=false;
   const d=rt.create(attackMode,s.x,s.y);s.d=d.id;d.creator=s.creator;d.attack=s.type-23;d.depth++;s.init=2;s.btimer=-10;
   if(s.type===25){const b=box(rt);rt.create(warpedBox,b.x,b.y);}
   if(s.type===23){d.bullettype=590;d.firingspeed=10;}else if(s.type===24){d.bullettype=591;d.firingspeed=28;s.btimer=10;}
   d.damage=s.damage;d.target=s.target;d.grazepoints=4;
  }else if(s.type===25&&s.btimer>=8&&gt(g.turntimer,50)){
   const b=box(rt),x=s.minx-rt.random.random(30)-20,y=b.y-rt.random.random(200)+100;
   const d=rt.create(dollar,x,y);s.d=d.id;d.damage=s.damage;d.target=s.target;d.grazepoints=4;d.speed=.1;s.btimer=0;
  }
  return true;
 };
 return {objects:[attackMode,jumper,wordBullet,warpedBox,dollar],pattern};
}
