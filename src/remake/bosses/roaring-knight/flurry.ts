// Flurry (pattern 99): the Knight's slash animation, telegraphed slashes, split battle box and soul limits,
// alternating tooth bullets, screenshot split effect and resource cleanup. Legacy box User2/3 fountain attacks
// have explicit boundaries; the normal split state machine uses User0 and User1 only.
import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {C,mergeColor} from '../../gm/graphics';
import {eq,ge,gt,le,lt,lengthdirX,lengthdirY,lerp,pointDirection,round} from '../../gm/math';
import {afterimage,bulletInit,darkMarker,growtangle,heart,marker,regularBullet} from '../../deltarune/battle';
import {angleDifference,clamp01,gtMinx,gtMiny,moveTowards,preciseHit,remap,scrAfterimage} from '../../deltarune/chapter3-scripts';
import {easeIn,easeOut} from '../../deltarune/ease';
import {lerpvar} from '../../deltarune/shared-effects';
import {snd} from '../../deltarune/sound';
import {damageMaxHp} from '../../deltarune/damage-maxhp';
import type {Chapter2BulletRunner} from '../../deltarune/chapter2-bullets';

export function createFlurry(object:(name:string)=>GmObjectDef){
 const first=(rt:GmRuntime,def:GmObjectDef)=>{const s=rt.first(def);if(!s)throw Error(`Flurry needs ${def.name}`);return s;};
 const soul=(rt:GmRuntime)=>first(rt,heart),box=(rt:GmRuntime)=>first(rt,growtangle);
 const instance=(rt:GmRuntime,id:number)=>{
  const live=rt.byId(id);if(live)return live;
  const definition=[object('obj_knight_enemy'),object('obj_growtangle'),splitBox].find(d=>d.index===id);
  if(!definition)throw Error(`Flurry object or instance ${id} is not ported`);return first(rt,definition);
 };
 const inherit=(s:GmInstance,b:GmInstance)=>{
  for(const k of ['damage','grazepoints','timepoints','inv','target'])if(s[k]!==-1)b[k]=s[k];
  if(s.grazed!==-1)b.grazed=0;if(s.grazetimer!==-1)b.grazetimer=0;
  if(s.object.name==='obj_dbulletcontroller'){b.creatorid=s.creatorid;b.creator=s.creator;}b.element=s.element;
 };
 const surfaces=(rt:GmRuntime)=>{if(!rt.sourceSurfaces)throw Error('Flurry needs source surfaces');return rt.sourceSurfaces;};
 const free=(rt:GmRuntime,id:number)=>{const sf=surfaces(rt);if(sf.exists(id))sf.free(id);};
 const pinSoul=(s:GmInstance,rt:GmRuntime)=>{
  if(eq(s.playerstrike,1)){const h=soul(rt);if(!eq(h.x,s.memheartx))h.x=s.memheartx+Math.sign(h.x-s.memheartx);if(!eq(h.y,s.memhearty))h.y=s.memhearty+Math.sign(h.y-s.memhearty);s.memheartx=h.x;s.memhearty=h.y;}
 };
 const splitBullet:GmObjectDef={...object('obj_roaringknight_split_bullet'),events:{
  create:(s,rt)=>{regularBullet.events!.create!(s,rt);Object.assign(s,{element:5,speed_mult:0,top_speed:0,imageXscale:1,imageYscale:1,active:false,destroy_on_hit:false,grazepoints:0,turn_timer:0,turn_dir:0,grazed:1,turn_start:false,distance:0,anim_timer:0,imageSpeed:0});},
  step:(s,rt)=>{
   regularBullet.events!.step!(s,rt);s.grazepoints=3;
   if(lt(s.speed_mult,1)){s.speed_mult+=0.2;if(!s.active&&ge(s.speed_mult,0.1))s.active=true;s.speed=s.speed_mult*s.top_speed;}
   s.imageXscale=1;s.imageYscale=1;if(!eq(s.imageXscale,1))s.imageXscale=moveTowards(s.imageXscale,1,0.1);if(!eq(s.imageYscale,1))s.imageYscale=moveTowards(s.imageYscale,1,0.1);s.distance+=s.speed;
  },
  draw:(s,rt)=>{
   s.imageIndex=Math.floor(easeIn(s.anim_timer,2)*(rt.bank.get(s.sprite!)?.frames??1));if(lt(s.anim_timer,1))s.anim_timer+=0.1;
   const ys=s.imageYscale+rt.random.randomRange(-0.1,0.1),xs=s.imageXscale+rt.random.randomRange(-0.1,0.1);
   rt.drawSprite(s.sprite,s.imageIndex,s.x,s.y,xs,ys,s.imageAngle,s.imageBlend,s.imageAlpha);
  },
 }};
 const effect:GmObjectDef={...object('obj_knight_split_growtangle_effect'),events:{
  create:(s,rt)=>{const b=box(rt);Object.assign(s,{timer:0,imageBlend:b.imageBlend,imageXscale:b.imageXscale,imageYscale:b.imageYscale,surf:-4,vertical:false,angle:0,xmul:1,ymul:1,diagonal:false});},
  cleanup:(s,rt)=>free(rt,s.surf),
  draw:(s,rt)=>{
   const sf=surfaces(rt);if(!sf.exists(s.surf)){s.surf=sf.create(640,480);sf.copy(s.surf,0,0,null);s.xmul=lengthdirX(1,s.angle);s.ymul=lengthdirY(1,s.angle);}
   s.timer++;const fade=(10-s.timer)/10,ht=(s.vertical?0:s.timer)*s.xmul,vt=(s.vertical?s.timer:0)*s.ymul;
   let w=rt.spriteWidth(s),h=rt.spriteHeight(s),left=0,top=0;if(s.vertical){left=w/2;w/=2;}else{top=h/2;h/=2;}
   const sp=rt.bank.get(s.sprite!)!;
   const part=(l:number,t:number,dx:number,dy:number,a:number)=>rt.drawSpritePart(s.sprite!,0,l,t,w/s.imageXscale-l,h/s.imageYscale-t,s.x+dx+l*s.imageXscale-sp.originX*s.imageXscale,s.y+dy+t*s.imageYscale-sp.originY*s.imageYscale,s.imageXscale,s.imageYscale,s.imageBlend,a);
   for(const n of [8,6,4])part(0,0,-ht*n,-vt*n,n===4?fade:clamp01(fade));
   for(const n of [8,6,4])part(left,top,ht*n,vt*n,n===4?fade:clamp01(fade));
   const sx=s.x-rt.view.x,sy=s.y-rt.view.y;
   if(s.vertical){sf.part(s.surf,0,0,sx,480,rt.view.x,rt.view.y-s.timer*8,1,1,C.white,fade/2);sf.part(s.surf,sx,0,640-sx,480,s.x,rt.view.y+s.timer*8,1,1,C.white,fade/2);}
   else{sf.part(s.surf,0,0,640,sy,rt.view.x-s.timer*8,rt.view.y,1,1,C.white,fade/2);sf.part(s.surf,0,sy,640,480-sy,rt.view.x+s.timer*8,s.y,1,1,C.white,fade/2);}
   rt.drawState.color=C.white;let angle=s.angle;if(s.vertical)angle+=90;if(s.diagonal)angle+=45;
   rt.drawSprite('spr_pxwhite10_center',0,s.x+s.xoffset,s.y+s.yoffset,50,fade,angle,C.white,1);
   rt.drawSprite('spr_pxwhite10_center',0,s.x+s.xoffset,s.y+s.yoffset,50,fade*1.4,angle,C.white,0.5);
   if(eq(s.timer,10))rt.destroy(s);
  },
 }};
 const splitBox:GmObjectDef={...object('obj_knight_split_growtangle'),events:{
  create:(s,rt)=>{
   const b=box(rt);Object.assign(s,{imageBlend:b.imageBlend,imageXscale:b.imageXscale,imageYscale:b.imageYscale,effect:-4,depth:b.depth+100,con:0,timer:0,distance:0,old_distance:0,heart_y:0,heart_x:0,sprite:b.sprite,split_dist:50,slow:4,fast:8,child_bullet:[-4],count:0,flame_index:0,marker:[]});b.visible=false;
   for(let i=0;i<2;i++){const m=rt.create(marker,s.x+(i===0?2:0),s.y+(i===0?-1:2));s.marker[i]=m.id;Object.assign(m,{sprite:'spr_rk_split_flame_big',imageSpeed:0.5,imageXscale:2,imageYscale:2,imageAngle:i===0?180:0,imageBlend:C.gray,depth:s.depth+10});}
   Object.assign(s,{split:false,vertical:false,diagonal:false,launch_force:0,launch_dir:rt.createStruct({x:0,y:0},'Vector2'),open_time:45,boxgone:false,max_distance:70,split_delay:0,vshift:0,hshift:0,xoffset:0,yoffset:0,angle:0,h_change:0,v_change:0,update_box:false,source_surf:-4,box_sprite:-4,half_box_a:-4,half_box_b:-4,difficulty:0,split_wait:5,split_hold:30,init:false,split_bullet:splitBullet.index,bullet_count:13,bullet_range:144,disable_on_close:true});
  },
  user0:s=>{s.timer=0;s.con++;},
  user1:(s,rt)=>{
   s.boxgone=true;const b=box(rt);if(b.customBox)return;
   const sf=surfaces(rt);sf.target(s.source_surf);rt.drawState.color=C.black;rt.drawRect(0,169,1,170,false);rt.drawState.color=C.white;sf.target(null);
   for(const g of rt.withInstances(growtangle)){g.visible=true;g.x=g.xstart;g.y=g.ystart;g.customBox=true;g.spr_custom_box=sf.capture(s.source_surf,0,0,170,170,85,85);g.growscale=1;}
  },
  user2:()=>{throw Error('Flurry split box legacy fountain User2 is not ported');},user3:()=>{throw Error('Flurry split box legacy fountain User3 is not ported');},
  cleanup:(s,rt)=>{rt.userEvent(s,1);for(const id of s.marker){const m=rt.byId(id);if(m)rt.destroy(m);}for(const k of ['source_surf','half_box_a','half_box_b'])free(rt,s[k]);},
  step:(s,rt)=>{
   const h=soul(rt);if(!s.init){if(eq(s.difficulty,2)){s.split_wait=4;s.split_hold=26;}s.init=true;}
   s.timer++;s.old_distance=s.distance;
   if(eq(s.con,1)){
    if(le(s.timer,1)){const e=rt.create(effect,s.x,s.y);s.effect=e.id;Object.assign(e,{angle:s.angle,diagonal:s.diagonal,xoffset:s.xoffset,yoffset:s.yoffset,depth:s.depth-100,vertical:s.vertical});}
    if(ge(s.timer,s.split_wait+s.split_delay)){
     if(s.split_bullet!==splitBullet.index)throw Error(`Flurry split bullet object ${s.split_bullet} is not ported`);
     if(s.disable_on_close){for(const b of rt.withInstances(splitBullet))b.active=false;s.child_bullet=[];s.count=0;}
     snd(rt,'snd_knight_boxbreak',1.1,1);rt.userEvent(s,0);
     if(s.diagonal){const hd=pointDirection(s.x+s.xoffset,s.y+s.yoffset,h.x+10,h.y+10),angle=s.angle+(s.vertical?45:-45);if(lt(Math.abs(angleDifference(angle,hd)),90)){s.heart_x=1;s.heart_y=s.vertical?-1:1;}else{s.heart_x=-1;s.heart_y=s.vertical?1:-1;}}
     else{s.heart_x=lt(h.x+10,s.x+s.xoffset)?-1:1;s.heart_y=lt(h.y+10,s.y+s.yoffset)?-1:1;}
     if(gt(s.split_delay,0))snd(rt,'snd_chargeshot_fire',0.5);snd(rt,'snd_chargeshot_fire');s.split_delay=0;
     const range=s.bullet_range,total=s.bullet_count+(s.bullet_count%2===1?1:0),odd=s.bullet_count%2===1;
     let flip=rt.random.choose(true,false),weight=0,dir=0;const angle=s.vertical?s.angle+90:s.angle,xrange=lengthdirX(range,angle),yrange=lengthdirY(range,angle),xs=xrange/(total/2-1),ys=yrange/(total/2-1);let x=s.x-xrange/2,y=s.y-yrange/2;
     for(let i=0;i<s.bullet_count;i++){
      if(!s.diagonal&&eq(i,total/2)){x=s.x-xrange/2;y=s.y-yrange/2;if(odd){x+=xs/2;y+=ys/2;}weight=0;flip=!flip;}
      if(eq(weight,0))weight=rt.random.choose(-2,-1,1,2);const speed=(Math.sign(-weight)+1)/2;
      const b=rt.create(splitBullet,s.diagonal?s.x:x,s.diagonal?s.y:y);s._b=b.id;b.friction=eq(speed,1)?-0.2:-0.05;
      b.top_speed=(eq(speed,1)?4:2)+rt.random.randomRange(-0.2,0.2);Object.assign(b,{imageSpeed:0.5,depth:s.depth+1,imageXscale:2,imageYscale:2,active:false,speed:0});
      if(s.diagonal)dir+=360/s.bullet_count;else if(s.vertical)dir=flip?180:0;else dir=flip?90:-90;b.direction=dir;b.imageAngle=dir;inherit(s,b);b.grazed=-1;s.child_bullet[s.count]=b.id;s.count++;
      if(eq(Math.abs(weight),1))weight=rt.random.choose(1,2)*Math.sign(-weight);else weight=moveTowards(weight,0,1);x+=xs;y+=ys;
     }
    }
   }
   const hold=s.diagonal?s.split_hold+2:s.split_hold;
   if(eq(s.con,2)){
    s.split=true;if(eq(s.timer,7))for(s.i=0;s.i<s.count;s.i++){const b=rt.byId(s.child_bullet[s.i]);if(b){b.depth=s.depth-10;b.active=true;b.grazed=0;}}
    if(le(s.timer,hold/2)){s.distance=easeOut(s.timer/(s.split_hold/2),3)*s.max_distance;if(s.diagonal){h.x+=(s.distance-s.old_distance)*s.heart_x;h.y+=(s.distance-s.old_distance)*s.heart_y;}else if(s.vertical)h.x+=(s.distance-s.old_distance)*s.heart_x*1.25;else h.y+=(s.distance-s.old_distance)*s.heart_y*1.25;}
    else rt.userEvent(s,0);
   }
   if(eq(s.con,3)){s.distance=s.max_distance-easeIn(s.timer/(s.split_hold/2),3)*s.max_distance;if(ge(s.timer,hold/2)){if(s.vertical||s.diagonal)s.vshift=rt.random.irandomRange(-3,3);else s.hshift=rt.random.irandomRange(-3,3);if(s.diagonal)s.hshift=s.vshift;rt.userEvent(s,0);}}
   if(eq(s.con,4)){s.distance=moveTowards(s.distance,0,12);if(eq(s.distance,0)){s.con=0;s.split=false;if(eq(s.difficulty,3)){if(gt(s.split_wait,3))s.split_wait--;if(gt(s.split_hold,26))s.split_hold-=2;}else{if(gt(s.split_wait,5))s.split_wait--;if(gt(s.split_hold,30))s.split_hold-=2;}snd(rt,'snd_locker');}}
   const dist=round(s.distance),a=rt.byId(s.marker[0])!,b=rt.byId(s.marker[1])!;
   if(s.diagonal){a.imageAngle=s.vertical?-45:225;b.imageAngle=s.vertical?135:45;const d=Math.sqrt(0.5)*dist;a.x=s.x-d-1+s.xoffset;b.x=s.x+d+3+s.xoffset;a.y=s.y-d-1+s.yoffset;b.y=s.y+d+3+s.yoffset;}
   else if(s.vertical){a.imageAngle=-90;b.imageAngle=90;a.x=s.x-dist-1+s.xoffset;b.x=s.x+dist+3+s.xoffset;a.y=s.y-1+s.yoffset;b.y=s.y+3+s.yoffset;}
   else{a.imageAngle=180;b.imageAngle=0;a.y=s.y-dist-1+s.yoffset;b.y=s.y+dist+3+s.yoffset;a.x=s.x-1+s.xoffset;b.x=s.x+3+s.xoffset;}
   box(rt).x=gt(s.distance,0)?-9999:box(rt).xstart;
  },
  endStep:(s,rt)=>{
   const b=box(rt),h=soul(rt),dist=eq(s.con,0)?0:round(s.distance);let sw=s.vertical?dist:0,sh=s.vertical?0:dist;if(s.diagonal)sw=sh=Math.sqrt(0.5)*dist;
   const tl=rt.createStruct({x:b.xstart-70-sw,y:b.ystart-70-sh},'Vector2'),br=rt.createStruct({x:b.xstart+52+sw,y:b.ystart+52+sh},'Vector2'),change=Math.sqrt(0.5)*(dist-round(s.old_distance));
   const start=s.diagonal&&!eq(change,0)?rt.createStruct({x:h.x,y:h.y},'Vector2'):undefined;
   if(lt(h.x,tl.x))h.x=tl.x;if(gt(h.x,br.x))h.x=br.x;if(lt(h.y,tl.y))h.y=tl.y;if(gt(h.y,br.y))h.y=br.y;
   if(start){start.x=Math.max(-Math.abs(change),Math.min(Math.abs(change),h.x-start.x));start.y=Math.max(-Math.abs(change),Math.min(Math.abs(change),h.y-start.y));if(!eq(start.x,0))h.y+=s.vertical?-start.x:start.x;if(!eq(start.y,0))h.x+=s.vertical?-start.y:start.y;}
   h.x=round(h.x);h.y=round(h.y);
  },
  draw:(s,rt)=>drawSplitBox(s,rt),
 }};
 const slash:GmObjectDef={...object('obj_roaringknight_splitslash'),events:{
  create:(s,rt)=>{
   bulletInit(s);Object.assign(s,{active:false,timer:0,imageAlpha:1,imageSpeed:0,slash:false,destroyonhit:false,thickness:10,imageBlend:C.black,trailthickness:10,xdir:0,ydir:0,xdraw:250,ydraw:250,init:false,flip:rt.random.choose(-1,1),damage:206,element:5,grazepoints:10,slashmarker:-4,vertical:false,memheartx:0,memhearty:0,playerstrike:false,xoffset:0,yoffset:0,angleoffset:0,startdepth:s.depth,difficulty:0,slice_delay:5,hurt_delay:15,diagonal:false});
  },
  cleanup:(s,rt)=>{const m=rt.byId(s.slashmarker);if(m)rt.destroy(m);},
  animationEnd:(s,rt)=>{if(s.slash&&s.visible){if(!s.playerstrike)rt.destroy(s);else s.imageAlpha=0;}},
  endStep:pinSoul,
  user5:(s,rt)=>{
   if(eq(s.active,1)&&preciseHit(s,rt,3)){const h=soul(rt),b=first(rt,splitBox),m=first(rt,manager);s.playerstrike=1;s.active=0;s.memheartx=h.x;s.memhearty=h.y;h.imageAlpha=0;rt.globals.inv=-1;s.cuty=round(lerp(1,14,clamp01((h.y-(s.y-8)+16)/32)));b.split_delay=5;m.timer-=5;m.local_turntimer+=5;s.hurt_delay=b.split_wait;}
  },
  step:(s,rt)=>{
   s.timer++;const m=first(rt,manager),b=box(rt);
   if(!s.init){s.startdepth=s.depth;s.depth=b.depth+10;s.init=true;const mark=darkMarker(rt,s,s.x,s.y,'spr_rk_quickslash_upper');s.slashmarker=mark.id;Object.assign(mark,{depth:b.depth+50,imageSpeed:0,imageAlpha:0});s.angleoffset=rt.random.randomRange(-12,12);
    if(s.diagonal){s.direction=m.slash_count%2===1?-45:45;s.vertical=m.slash_count%2===1;s.imageAngle=s.direction;s.xoffset=rt.random.randomRange(-2,2)*2;s.yoffset=rt.random.randomRange(-2,2)*2;}
    else if(s.vertical){s.direction=m.slash_count%2===1?-90:90;s.imageAngle=s.direction;s.xoffset=rt.random.randomRange(-8,8)*2;}else s.yoffset=rt.random.randomRange(-8,8)*2;mark.imageAngle=s.imageAngle;
   }
   if(lt(s.imageAlpha,1)&&!s.slash)s.imageAlpha+=0.05;if(!s.slash)s.imageBlend=mergeColor(C.black,C.red,clamp01(s.timer/20));
   const mark=rt.byId(s.slashmarker)!;if(!s.slash)mark.imageAlpha=0;else Object.assign(mark,{x:s.x,y:s.y,imageIndex:s.imageIndex,imageBlend:s.imageBlend,imageAlpha:s.imageAlpha});
   if(le(s.timer,15))s.thickness=lerp(10,1,easeOut(s.timer/15,4));if(eq(s.timer,29))s.depth=s.startdepth;
   if(eq(s.timer,30)){
    s.x=s.xstart;s.y=s.ystart;if(eq(s.imageAngle,90))s.imageYscale*=-1;s.imageAngle+=s.angleoffset;s.x+=s.xoffset;s.y+=s.yoffset;s.imageBlend=C.white;s.active=true;s.slash=true;
    let split=rt.first(splitBox);if(!split){split=rt.create(splitBox,b.x,b.y);inherit(s,split);split.grazepoints=5;for(const attack of rt.withInstances(manager)){attack.growtangle=split.id;split.difficulty=attack.difficulty;}}
    Object.assign(split,{xoffset:s.xoffset,yoffset:s.yoffset,angle:s.angleoffset,vertical:s.vertical,diagonal:s.diagonal,con:1,timer:0});
    s.sprite='spr_rk_quickslash';s.imageSpeed=1;s.imageIndex=0;s.imageYscale*=2;for(const attack of rt.withInstances(manager)){attack.imageIndex=ge(attack.imageIndex,4)?1:4;attack.animtimer=0;}
    rt.soundStop?.('snd_wideslash_low');rt.soundStop?.('snd_knight_hurtb');snd(rt,'snd_wideslash_low',0.9+rt.random.random(4)/10,0.8);
    const angle=s.imageAngle+(lt(s.imageXscale,0)?180:0),dx=lengthdirX(60,angle),dy=lengthdirY(60,angle);
    for(let i=0;i<16;i++){
     const d=rt.create(afterimage,s.xstart+s.xoffset,s.ystart+s.yoffset);d.speed=rt.random.randomRange(10,20);d.direction=s.imageAngle+(20-d.speed)*(rt.random.irandom(1)*2-1)/2+180;d.speed+=rt.random.randomRange(-2,2);
     if(i%2===0){d.direction-=180;d.speed*=0.75;d.x+=dx;d.y+=dy;}else{d.x-=dx;d.y-=dy;}
     Object.assign(d,{imageAngle:d.direction,sprite:'spr_knight_slash_mark',imageAlpha:1,imageBlend:C.white,imageXscale:d.speed/10,imageYscale:0.1,friction:0.5});d.fadeSpeed+=rt.random.random(0.02);
     const l=rt.create(lerpvar,0,0);d.__lerpvar=l.id;Object.assign(l,{target:d.id,varname:'image_xscale',pointa:d.imageXscale,pointb:0.05,maxtime:5});
    }
   }
   if(eq(s.timer,34))s.active=false;
   if(eq(s.timer,35+s.hurt_delay)&&eq(s.playerstrike,1)){
    s.playerstrike=0;soul(rt).imageAlpha=1;if(!eq(s.target,3))damageMaxHp(s,rt,0.66,false,true);rt.globals.inv=rt.globals.invc*30;rt.destroy(s);
   }
   pinSoul(s,rt);
  },
  draw:(s,rt)=>{
   if(s.slash)rt.drawSelf(s);else{rt.drawBlendMode('add');const e=easeOut(clamp01(s.timer/30),3),spin=(e*15-15)*s.flip,g=instance(rt,first(rt,manager).growtangle);rt.drawSprite('spr_pxwhite10_center',0,g.x+s.xoffset,g.y+s.yoffset,e*180,lerp(4,0,e),spin+s.imageAngle+s.angleoffset,mergeColor(C.black,C.red,0.5),1);rt.drawBlendMode('normal');}
   if(eq(s.playerstrike,1))for(const h of rt.withInstances(heart)){const x=rt.random.irandom(2)-1,y=rt.random.irandom(2)-1,fade=1-clamp01((s.timer-45)/10);rt.drawSprite(h.sprite,h.imageIndex,h.x+x,h.y+y);rt.drawSprite('spr_rk_slash_heartslice',s.cuty,h.x+x,h.y+y,1,1,0,C.white,fade);}
  },
 }};
 const manager:GmObjectDef={...object('obj_roaringknight_boxsplitter_attack'),events:{
  create:(s,rt)=>{
   bulletInit(s);Object.assign(s,{hell_surface:-4,spawn_speed:40,spawn_range:4,min_angle:145,max_angle:215,timer:200,slash_count:0,imageAlpha:1,imageXscale:2,imageYscale:2,depth:soul(rt).depth+1,imageSpeed:0,imageIndex:1,animtimer:5,count:3,aetimer:0,recoil:0,final_slash_anim:false,slash_anim_count:0,flip:false,flipped:-1,forward:0,auto:true,flip_mode:true,knight:rt.exists(object('obj_knight_enemy'))?object('obj_knight_enemy').index:-4,turn_segment:-1,local_turntimer:330,next_up:-1,next_next_up:-1,splitbox:-4,anchor_x:s.x,anchor_y:s.y,done:false,omae_wa_con:0,omae_wa_timer:0,vertical:false,difficulty:2,growtangle:object('obj_growtangle').index,init:false,force_swap:-1,first_vertical:false,diagonal:false,force_oneside:rt.random.irandom(1)});
  },
  cleanup:(s,rt)=>{free(rt,s.hell_surface);if(!['start','short start','short mid'].includes(s.turn_type)&&rt.all(object('obj_bulletparent')).filter(b=>b.object.name==='obj_bulletparent').length<2){instance(rt,s.knight).imageAlpha=1;rt.globals.turntimer=-1;}},
  step:(s,rt)=>{
   s.local_turntimer--;if(!s.init){if(eq(s.difficulty,0))s.spawn_speed=50;else if(eq(s.difficulty,1)){s.spawn_speed=46;s.force_swap=rt.random.irandom(2)+1;}else if(eq(s.difficulty,2))s.spawn_speed=31;s.init=true;s.vertical=rt.random.irandom(1);}
   if(!s.auto)return;if(eq(s.knight,-4))s.knight=object('obj_knight_enemy').index;const k=instance(rt,s.knight);
   if(le(s.local_turntimer,30)){
    if(le(s.local_turntimer,10)&&s.sprite!=='spr_roaringknight_idle'){if(lt(s.imageXscale,0))s.x-=220;s.imageXscale=Math.abs(s.imageXscale);s.sprite='spr_roaringknight_idle';s.imageIndex=0;}else if(lt(s.local_turntimer,22)&&lt(s.imageXscale,0))s.imageIndex=4;
    if(lt(s.x,first(rt,object('obj_knight_enemy')).x))s.x++;s.y=lerp(s.y,k.y,(50-Math.max(0,s.local_turntimer))/50);
    if(lt(s.local_turntimer,0)&&!first(rt,splitBox).split){rt.globals.turntimer=0;rt.destroy(s);}return;
   }
   s.timer++;if(ge(s.timer,s.spawn_speed)){s.timer=0;s.vertical=rt.random.irandom(1);if(eq(s.difficulty,0))s.vertical=s.force_oneside;const g=instance(rt,s.growtangle),a=rt.create(slash,g.x,g.y);a.vertical=s.vertical;
    if(eq(s.difficulty,3)){a.diagonal=s.diagonal;if(s.diagonal){s.timer=-4;s.diagonal=false;}else s.diagonal=rt.random.irandom(1);}
    s.slash_count++;if(le(s.difficulty,2)&&gt(s.spawn_speed,40))s.spawn_speed=moveTowards(s.spawn_speed,40,3);s.spawn_range=moveTowards(s.spawn_range,60,3);
   }
  },
  draw:(s,rt)=>{
   if(eq(s.imageAlpha,1)){if(lt(s.animtimer,4))s.animtimer++;else if(eq(s.imageIndex,1)||eq(s.imageIndex,4))s.imageIndex++;rt.drawSelf(s);s.aetimer++;if(eq(s.aetimer%4,0)&&!eq(s.imageAlpha,0)){const a=scrAfterimage(s,rt);s.fade=a.id;Object.assign(a,{sprite:s.sprite,imageAlpha:0.6,fadeSpeed:0.02,hspeed:2*Math.sign(s.x-box(rt).x),depth:s.depth+(lt(s.x,box(rt).x)?50:100)});}}
   const sf=surfaces(rt);if(!sf.exists(s.hell_surface))s.hell_surface=sf.create(142,142);rt.drawBlendMode('normal');sf.target(s.hell_surface);sf.clear(C.black,0);
   for(const a of rt.withInstances(slash))if(!a.slash){const e=easeOut(clamp01(a.timer/30),3);rt.drawSprite('spr_pxwhite10_center',0,71+a.xoffset,71+a.yoffset,clamp01(a.timer/30)*90,lerp(4,0,e),(e*15-15)*a.flip+a.imageAngle+a.angleoffset,mergeColor(C.black,a.imageBlend,0.5),1);rt.drawBlendMode('dest-alpha-add');
    if(rt.gfx){if(!rt.gfx.spriteTiled)throw Error('Flurry needs tiled sprites');rt.gfx.spriteTiled('spr_knight_bullet_flow',a.timer,a.timer,0.25,0.25,a.imageBlend,1,2);rt.gfx.spriteTiled('spr_knight_bullet_flow',-a.timer+40,-a.timer+40,0.25,0.25,a.imageBlend,1,2);}
    rt.drawBlendMode('normal');}
   sf.target(null);rt.drawBlendMode('add');sf.draw(s.hell_surface,box(rt).x-71,box(rt).y-71);rt.drawBlendMode('normal');
  },
 }};
 function drawSplitBox(s:GmInstance,rt:GmRuntime){
  let splid=s.vertical?round(s.distance):0,dist=s.vertical?0:round(s.distance),angle=s.angle+(s.vertical?90:0);if(s.diagonal){splid=dist=Math.sqrt(0.5)*s.distance;angle+=45;}
  const jitter=()=>gt(s.distance,0)?rt.random.irandomRange(-1,1):0,x=jitter(),y=jitter(),x2=jitter(),y2=jitter(),sf=surfaces(rt);
  if(!sf.exists(s.source_surf)){s.source_surf=sf.create(170,170);sf.target(s.source_surf);sf.clear(C.black,0);for(const i of [1,0])rt.drawSprite(s.sprite,i,85,85,2,2,0,C.white,1);sf.target(null);s.half_box_a=sf.create(170,170);s.half_box_b=sf.create(170,170);}
  if(eq(s.distance,0)){sf.draw(s.source_surf,s.x-85,s.y-85,1,s.imageBlend);s.update_box=true;}
  if(!eq(s.distance,0)&&s.update_box){
   const xm=lengthdirX(1,angle),ym=lengthdirY(1,angle),xc=xm*400,yc=ym*400,xe=s.vertical?400:0,ye=s.vertical?0:400,xn=s.vertical?1:0,yn=s.vertical?0:1;
   rt.drawState.color=C.white;sf.target(s.half_box_a);sf.clear(C.black,0);sf.draw(s.source_surf,0,0);rt.drawBlendMode('subtract');rt.drawTriangle(85+s.xoffset-xc,85+s.yoffset-yc,85+s.xoffset+xc,85+s.yoffset+yc,85+s.xoffset+xe,85+s.yoffset+ye,false);rt.drawBlendMode('normal');sf.target(null);
   sf.target(s.half_box_b);sf.clear(C.black,0);sf.draw(s.source_surf,0,0);rt.drawBlendMode('subtract');rt.drawTriangle(85+s.xoffset-xc-xn,85+s.yoffset-yc-yn,85+s.xoffset+xc-xn,85+s.yoffset+yc-yn,85+s.xoffset-xe,85+s.yoffset-ye,false);rt.drawBlendMode('normal');sf.target(null);
   const change=rt.random.choose(-2,-1,1,2),deviation=change-(s.vertical?s.v_change:s.h_change);if(s.vertical)s.v_change=change;else s.h_change=change;
   sf.target(s.source_surf);sf.clear(C.black,0);sf.draw(s.half_box_a,-xm*deviation,-ym*deviation);sf.draw(s.half_box_b,xm*deviation,ym*deviation);rt.drawState.color=mergeColor(C.black,C.white,0.25);const abs=85+Math.abs(deviation);rt.drawBlendMode('dest-alpha-copy');rt.drawLine(85+s.xoffset-xm*abs,85+s.yoffset-ym*abs,85+s.xoffset+xm*abs,85+s.yoffset+ym*abs);rt.drawBlendMode('normal');sf.target(null);s.update_box=false;
  }
  if(gt(s.distance,0)){sf.draw(s.half_box_a,s.x-splid-85+x,(s.diagonal&&s.vertical?s.y+dist:s.y-dist)-85+y,1,s.imageBlend);sf.draw(s.half_box_b,s.x+splid-85+x2,(s.diagonal&&s.vertical?s.y-dist:s.y+dist)-85+y2,1,s.imageBlend);}
  rt.drawState.color=C.white;if(gt(s.con,0)){if(eq(round(s.distance),0)){if(s.vertical)rt.drawSprite('spr_whitepixel',0,s.x+s.xoffset,s.y-74,dist*2,splid*2,s.angle,C.white,1);else rt.drawSprite('spr_whitepixel',0,s.x-74,s.y+s.yoffset,splid*2,dist*2,s.angle,C.white,1);}
   else if(s.vertical){rt.drawSprite('spr_rk_split_flame_edge',s.flame_index,s.x-dist-1,s.y+2,2,2,angle,C.gray,1);rt.drawSprite('spr_rk_split_flame_edge',s.flame_index,s.x+dist+2,s.y,2,2,angle,C.gray,1);}else{rt.drawSprite('spr_rk_split_flame_edge',s.flame_index,s.x+2,s.y-dist-1,2,2,angle+185,C.gray,1);rt.drawSprite('spr_rk_split_flame_edge',s.flame_index,s.x,s.y+dist+2,2,2,angle,C.gray,1);}}
  s.flame_index+=0.5;
 }
 const pattern:Chapter2BulletRunner=(s,rt)=>{if(!eq(s.type,99))return false;if(!s.made){const k=instance(rt,s.creatorid);k.imageAlpha=0;const a=rt.create(manager,k.x,k.y);inherit(s,a);a.difficulty=s.difficulty;a.turn_type='full';rt.userEvent(a,0);s.made=true;}return true;};
 return {objects:[manager,slash,splitBox,splitBullet,effect],pattern};
}
