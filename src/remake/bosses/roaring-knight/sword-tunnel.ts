// The Roaring Knight's sword tunnel (bullet type 153): he vanishes into the box's right side (obj_knight_swordtunnelanim)
// while pairs of swords fly in from the right above and below a gap that drifts up and down; at the end every sword
// stops, turns towards the soul and lunges. Objects: obj_sword_tunnel_manager, obj_sword_tunnel_sword,
// obj_sword_tunnel_hitbox (the lunge's one-frame line across the soul) and obj_knight_swordtunnelanim.
import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {C,mergeColor} from '../../gm/graphics';
import {gt,lengthdirX,lengthdirY,lerp,lt,pointDirection} from '../../gm/math';
import {lineMeets} from '../../gm/collision';
import {bulletInit,growtangle,heart,regularBullet} from '../../deltarune/battle';
import {afterimageGrowOf,angleChange,bulletInherit,darkSize,scrAfterimage} from '../../deltarune/chapter3-scripts';
import {scrLerpvar} from '../../deltarune/shared-effects';
import {snd} from '../../deltarune/sound';
import type {Chapter2BulletRunner} from '../../deltarune/chapter2-bullets';
import type {HookedDef} from '../../deltarune/rules';

/** By difficulty: frames between pairs, the gap's half height, how far it drifts per pair, and the pattern (tobymode:
 * 0 straight pairs, 1 pairs at a waving speed, 2 and 3 pairs turning around the box). */
const TUNNELS:Readonly<Record<number,readonly [rate:number,gap:number,drift:number,mode:number]>>={0:[4,45,10,0],1:[4,45,10,1],2:[4,45,7,2],3:[4,45,7,3],4:[4,40,10,0]};

export function createSwordTunnel(object:(name:string)=>GmObjectDef){
 const soul=(rt:GmRuntime)=>{const h=rt.first(heart);if(!h)throw Error('The sword tunnel needs obj_heart');return h;};
 const box=(rt:GmRuntime)=>{const b=rt.first(growtangle);if(!b)throw Error('The sword tunnel needs obj_growtangle');return b;};
 const knight=(rt:GmRuntime)=>{const k=rt.first(object('obj_knight_enemy'));if(!k)throw Error('The sword tunnel needs the Knight');return k;};
 const playing=(rt:GmRuntime,name:string)=>rt.sourceAudio?.playing(name)??false;

 /** obj_sword_tunnel_hitbox: live on its second frame, gone on its third. */
 const hitbox:GmObjectDef={...object('obj_sword_tunnel_hitbox'),events:{
  create:s=>{bulletInit(s);Object.assign(s,{grazepoints:0.8,destroyonhit:0,timer:0,con:0,damage:160,active:0,visible:false});},
  step:(s,rt)=>{s.timer++;if(s.timer===2)s.active=1;if(s.timer===3)rt.destroy(s);},
  destroy:()=>{},
 }};

 const sword:HookedDef={...object('obj_sword_tunnel_sword'),hooks:{grazedWhileInactive:true},events:{
  create:(s,rt)=>{
   bulletInit(s);
   // _speed and _gravity are set twice in the original; the second values stand.
   Object.assign(s,{grazepoints:0.8,destroyonhit:0,timer:0,con:0,_speed:6,_gravity:1,_maxspeed:30,active:0,create_2nd_hitbox:0,imageIndex:2,imageSpeed:0,mydirection:180});
   s.imageYscale=0;
   s.randx=-20+rt.random.irandom(40);s.randy=-20+rt.random.irandom(40);
   Object.assign(s,{targetangle:0,anglespeed:8,telegraph:0,telegraphalpha:0});
  },
  step:(s,rt)=>{
   s._speed+=s._gravity;if(s._speed>s._maxspeed)s._speed=s._maxspeed;
   let xadd=lengthdirX(1,s.mydirection),yadd=lengthdirY(1,s.mydirection);
   if(s.con===1){
    s.timer++;const c=10;
    if(s.timer===1){s._gravity=0;s.telegraph=1;}
    if(s.timer<10+c/2){
     const h=soul(rt);s.anglespeed=lerp(8,0,s.timer/(10+c/2));
     s.imageAngle+=angleChange(s.imageAngle,pointDirection(s.x,s.y,h.x+10+s.randx,h.y+10+s.randy),s.anglespeed);s.targetangle+=s.anglespeed;
    }
    s.direction=s.imageAngle;
    if(s.timer<10+c)s._speed=lerp(s._speed,0,s.timer/10);
    if(s.timer>=11+c&&s.timer<15+c){
     if(!playing(rt,'snd_knight_jump'))snd(rt,'snd_knight_jump',0.8,1);
     s._speed=2;xadd=lengthdirX(2,s.imageAngle+180);yadd=lengthdirY(2,s.imageAngle+180);
    }
    if(s.timer>=15+c&&s.timer<20+c){xadd=0;yadd=0;}
    if(s.timer===20+c){const a=afterimageGrowOf(s,rt);s.inst=a.id;a.xrate=0.4;a.yrate=0.4;a.fade=0.2;}
    if(s.timer>=20+c){
     if(!playing(rt,'snd_knight_cut'))snd(rt,'snd_knight_cut',0.8,1);
     s.telegraph=0;s.damage=160;s._speed=80;xadd=lengthdirX(1,s.imageAngle);yadd=lengthdirY(1,s.imageAngle);
    }
   }
   s.imageBlend=C.white;
   const h=soul(rt);
   // Near the soul it moves in steps of 8, testing the soul at each.
   if(s.x>h.x-80&&s.x<h.x+80&&s.y<h.y+80&&s.y>h.y-80){
    s.imageBlend=C.red;const rx=s.x,ry=s.y;
    for(let n=0,count=Math.max(Math.floor(s._speed/8),1);n<count;n++){
     s.x+=xadd*8;s.y+=yadd*8;s.active=1;
     if(s.con===1&&s._speed===80&&!s.create_2nd_hitbox){
      const b=rt.create(hitbox,s.x,s.y);b.depth=s.depth-1;s.hitbox=b.id;b.imageAngle=s.imageAngle;b.imageYscale=0.4;b.imageXscale=999;
      for(const soulInstance of rt.all(heart))soulInstance.mask='spr_dodgeheart_smallmask';
      s.create_2nd_hitbox=1;
     }else if(!s.create_2nd_hitbox&&rt.all(heart).some(o=>lineMeets(rt.bank,o,s.x,s.y,s.x+lengthdirX(37,s.imageAngle),s.y+lengthdirY(37,s.imageAngle),false)))rt.userEvent(s,5);
     s.active=0;
    }
    s.x=rx;s.y=ry;
   }
   s.x+=xadd*s._speed;s.y+=yadd*s._speed;
   const a=scrAfterimage(s,rt);a.imageAlpha=0.4;a.x=(s.x+s.xprevious)/2;a.y=(s.y+s.yprevious)/2;if(s.con>0)a.imageBlend=C.white;
   const vx=rt.view.x,vy=rt.view.y;
   if(s.x<=vx-100)rt.destroy(s);if(s.x>=vx+740)rt.destroy(s);if(s.y>=vy+600)rt.destroy(s);if(s.y<=vy-250)rt.destroy(s);
   if(s.con===0)s.imageYscale=lerp(s.imageYscale,s._speed/20,0.1);
  },
  draw:(s,rt)=>{
   if(s.telegraph===0&&gt(s.telegraphalpha,0))s.telegraphalpha-=0.1;
   if(s.telegraph===1&&lt(s.telegraphalpha,0.5))s.telegraphalpha+=0.05;
   if(gt(s.telegraphalpha,0))rt.drawSprite('spr_lasergun_laser_telegraph',0,s.x,s.y,999,0.4,s.imageAngle,C.red,s.telegraphalpha);
   if(s.con>0){const t=Math.min(s.timer,10);if(s.imageBlend===C.red)s.imageBlend=mergeColor(C.red,C.white,t/10);}
   for(s.i=0;s.i<10;s.i++)rt.drawSprite(s.sprite,s.imageIndex,lerp(s.xprevious,s.x,s.i/10),lerp(s.yprevious,s.y,s.i/10),s.imageXscale,s.imageYscale,s.imageAngle,s.imageBlend,s.i/10);
   rt.drawSelf(s);
  },
 }};

 /** A pair of swords around the gap at (swordy), and the gap's drift. */
 const pair=(s:GmInstance,rt:GmRuntime,xx:number,yy:number)=>{
  const make=(x:number,y:number)=>{const w=rt.create(sword,x,y);s.sword=w.id;return w;};
  if(s.tobymode===0){
   let w=make(s.swordx,s.swordy-50-s.gapsize/2);w.imageAngle=270;w.damage=s.damage;
   w=make(s.swordx,s.swordy+50+s.gapsize/2);w.imageAngle=90;w.damage=s.damage;
  }else if(s.tobymode===1){
   s.tobytimer++;
   let w=make(s.swordx,s.swordy-50-s.gapsize/2);w.imageAngle=270;w._speed+=Math.sin(s.tobytimer/6)*16+rt.random.random(1);w.damage=s.damage;
   w=make(s.swordx,s.swordy+50+s.gapsize/2);w.imageAngle=90;w._speed+=Math.sin(s.tobytimer/6)*16+rt.random.random(1);
   s.timer=Math.max(0,Math.sin(s.tobytimer/6)*2);w.damage=s.damage;
  }else if(s.tobymode===2||s.tobymode===3){
   s.tobytimer++;
   if(s.tobymode===3&&!s.tobyvolleymode){s.verticalchange=Math.abs(Math.sin(s.tobytimer/8))*5;s.gapsize=34+s.verticalchange*1.4;}
   const by=box(rt).y,dir=s.sworddirection;
   const sx=lengthdirX(s.swordxrel,dir+180),sy=lengthdirY(s.swordxrel,dir+180);
   const syaddy=lengthdirY(s.swordy-by,dir+270),syaddx=lengthdirX(s.swordy-by,dir+270);
   const sgapy=lengthdirY(s.gapsize,dir+270)*2,sgapx=lengthdirX(s.gapsize,dir+270)*2;
   if(s.tobymode===3)s.tobytimer++;
   const proportion=lerp(1,0.8,Math.abs(lengthdirY(1,dir+180)));
   const gravity=()=>s.tobymode===3?(2*proportion-s.verticalchange/15)*s.tobyvolleymodeinitspeed:2*proportion;
   let w=make(xx+sx-sgapx+syaddx,yy+sy-sgapy+syaddy);w.imageAngle=dir+270;w.mydirection=dir;w.damage=s.damage;w._speed=-8*proportion;w._gravity=gravity();w.damage=s.damage;
   w=make(xx+sx+sgapx+syaddx,yy+sy+sgapy+syaddy);w.imageAngle=dir+90;w.mydirection=dir;w._speed=-8*proportion;w._gravity=gravity();w.damage=s.damage;
   s.sworddirection+=s.tobymode===3?8:4;
  }
 };
 const manager:GmObjectDef={...object('obj_sword_tunnel_manager'),events:{
  create:(s,rt)=>{
   const k=knight(rt);
   s.timer=-40+rt.random.irandom(10);s.finishtimer=0;s.finishtimermax=k.difficulty===3?250:230;
   s.con=0;s.swordx=rt.view.x+rt.view.width+20;s.swordy=box(rt).y;s.swordxrel=340;s.swordyrel=0;s.sworddirection=180;s.swordcount=0;
   s.setcount=rt.random.choose(2,3,4);s.waitsetcount=rt.random.choose(1,2,3);s.movedirection=rt.random.choose('up','down');
   Object.assign(s,{tobymode:0,difficulty:0,tobyvolleymode:0,tobyvolleycount:0});
   s.tobyvolleyamount=10+rt.random.irandom(6);s.tobyvolleymodeinitspeed=1;s.stopsfxtimer=0;
   rt.userEvent(s,0);
   rt.create(anim,k.x,k.y);
  },
  user0:s=>{
   Object.assign(s,{rate:6,gapsize:50,verticalchange:15,tobymode:0,maxswords:999});
   const t=TUNNELS[s.difficulty];
   if(t){[s.rate,s.gapsize,s.verticalchange,s.tobymode]=t;if(t[3]!==0)s.tobytimer=0;s.maxswords=999;}
  },
  step:(s,rt)=>{
   s.timer++;s.finishtimer++;
   let xx=rt.view.x+320,yy=rt.view.y+180;const b=rt.first(growtangle);if(b){xx=b.x;yy=b.y;}
   if(s.finishtimer===s.finishtimermax){s.con=1;for(const w of rt.all(sword))w.con=1;}
   if(s.timer>=s.rate&&s.con===0){
    pair(s,rt,xx,yy);
    if(s.movedirection==='up')s.swordy-=s.verticalchange;
    if(s.movedirection==='down')s.swordy+=s.verticalchange;
    s.swordcount++;
    if((s.setcount===s.swordcount&&(s.movedirection==='down'||s.movedirection==='up'))||(s.waitsetcount===s.swordcount&&s.movedirection==='none')){
     s.swordcount=0;s.setcount=rt.random.choose(2,3,4);s.waitsetcount=rt.random.choose(1,2,3);
     if(s.tobymode===2){
      s.setcount=rt.random.choose(4,6,8);s.waitsetcount=rt.random.choose(2,4,6);
      if(s.tobyvolleymode){s.setcount=rt.random.choose(6,10,12);s.waitsetcount=rt.random.choose(6,8,12);}
     }
     s.movedirection=s.movedirection==='none'?rt.random.choose('up','down'):'none';
     const by=box(rt).y;
     if(s.movedirection==='up'&&s.swordy<by-20)s.movedirection='down';
     if(s.movedirection==='down'&&s.swordy>by+20)s.movedirection='up';
    }
   }
   if(s.timer>=s.rate&&s.stopsfxtimer<3){if(s.con===1)s.stopsfxtimer++;snd(rt,'snd_heavy_passing',1.2,0.3);s.timer=0;}
   if(s.swordcount>=s.maxswords)rt.destroy(s);
  },
  cleanup:(_s,rt)=>{rt.soundStop?.('snd_object_passing');rt.soundStop?.('snd_heavy_passing');},
 }};

 /** obj_knight_swordtunnelanim: the Knight points, rushes left out of sight with a trail, and returns at the turn's end. */
 const anim:GmObjectDef={...object('obj_knight_swordtunnelanim'),events:{
  create:(s,rt)=>{
   Object.assign(s,{con:0,timer:0,siner:0,animindex:0});darkSize(s);s.sprite='spr_roaringknight_point_ol';s.imageSpeed=0;
   const b=rt.first(growtangle);if(b)s.depth=b.depth-1;
   Object.assign(s,{drawtrail:1,shadowtimer:0,dir:4,fadeaudio:0,fadeaudio2:0,shinkafade:0,leafpitch:1,endtimer:0});
  },
  step:(s,rt)=>{
   const leaves=(pitch:()=>number,volume:number)=>{for(let n=0;n<2;n++)snd(rt,'snd_leaf_dodge',pitch(),volume);};
   if(s.con===0){
    if(s.timer<60&&s.timer%3===0)leaves(()=>1+rt.random.random(0.2),0.8*s.fadeaudio);
    s.timer++;
    if(s.timer===1){scrLerpvar(s,rt,'image_index',0,4,10);scrLerpvar(s,rt,'dir',4,-18,40,2,'in');}
    if(s.timer===15)scrLerpvar(s,rt,'fadeaudio',0,1,5);
    if(s.timer===20){scrLerpvar(s,rt,'fadeaudio',s.fadeaudio,0,20);scrLerpvar(s,rt,'image_alpha',1,0,10);s.hspeed=-4;}
    if(s.timer===26)s.drawtrail=0;
    if(s.timer===60){s.timer=0;s.con=1;}
   }
   if(s.con===1){
    s.timer++;
    if(s.timer===1){scrLerpvar(s,rt,'shinkafade',0,1,20);scrLerpvar(s,rt,'leafpitch',0.4,1,120);}
    if(s.timer%3===0)leaves(()=>s.leafpitch+rt.random.randomRange(0,0.2),0.4*s.shinkafade+s.leafpitch/10);
    if(s.timer%11===0)snd(rt,'snd_shinka_ambience',1,1*s.shinkafade);
    if(s.timer===120)scrLerpvar(s,rt,'shinkafade',1,0,5);
   }
   if(lt(rt.globals.turntimer,10)){
    s.endtimer++;s.imageAlpha=1;s.x=knight(rt).x;
    if(s.endtimer===1){s.sprite='spr_roaringknight_ball_transition_sword';s.imageIndex=5;s.imageSpeed=0.5;}
    if(s.endtimer===8)rt.destroy(s);
   }
   s.siner++;s.y=s.ystart+Math.sin(s.siner/16)*8;
   if(s.drawtrail){
    s.shadowtimer++;
    if(s.shadowtimer%2===0){
     const a=scrAfterimage(s,rt);a.imageAlpha=1;a.hspeed=s.dir;const b=rt.first(growtangle);if(b)a.depth=b.depth-1000;a.depth+=s.shadowtimer;
    }
   }
  },
  draw:(s,rt)=>rt.drawSelf(s),
 }};

 /** Bullet type 153 in the bullet maker: one tunnel at the box's x, on the view's top. */
 const pattern:Chapter2BulletRunner=(s,rt)=>{
  if(s.type!==153)return false;
  if(!s.made){
   const m=rt.create(manager,box(rt).x,rt.view.y);bulletInherit(s,m);m.difficulty=s.difficulty;m.damage=s.damage;rt.userEvent(m,0);s.made=1;
  }
  return true;
 };
 return {objects:[hitbox,sword,manager,anim],pattern};
}
