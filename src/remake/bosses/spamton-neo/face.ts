// NEO's face pieces, reticles and segmented eye beams. Logic in Draw and caller fields follow the original events.
import {type GmInstance,type GmObjectDef,type GmRuntime} from '../../gm/runtime';
import {C,mergeColor} from '../../gm/graphics';
import {eq,ge,gt,le,lt,pointDirection} from '../../gm/math';
import {bulletInit} from '../../deltarune/battle';
import {bulletInherit2} from '../../deltarune/chapter2-battle';
import {snd} from '../../deltarune/sound';
import type {HookedDef} from '../../deltarune/rules';

const towards=(a:number,b:number,amount:number)=>eq(a,b)?a:gt(a,b)?Math.max(a-amount,b):Math.min(a+amount,b);
/** scr_darksize writes its caller's inst as well as the recipient's built-in scale. */
function darkSize(caller:GmInstance,recipient:GmInstance){caller.inst=recipient.id;recipient.imageXscale=2;recipient.imageYscale=2;}

export function createNeoFace(object:(name:string)=>GmObjectDef):GmObjectDef[]{
 const first=(rt:GmRuntime,name:string)=>rt.first(object(name));
 const requireFirst=(rt:GmRuntime,name:string)=>{const s=first(rt,name);if(!s)throw Error(`NEO face requires live ${name}`);return s;};
 const enemy=(rt:GmRuntime)=>requireFirst(rt,'obj_spamton_neo_enemy');
 const face:HookedDef={name:'obj_sneo_faceattack',index:634,parent:object('obj_basicbullet_sneo'),depth:0,
  hooks:{ringsShots:s=>eq(s.init,1)},events:{
  create:s=>{
   bulletInit(s);Object.assign(s,{element:6,type:0,timer:0,hp:16,init:0,imageSpeed:0,imageIndex:0,imageAlpha:0,broken:0});
   darkSize(s,s);Object.assign(s,{blend:mergeColor(C.green,C.lime,0.5),invincibilitytimer:0,hurtflashtimer:0,shootflashtimer:0,
    explodetimer:0,laserinit:0,noseinit:0,eyesinit:0,boss:1,destroytarget:0,blue_col:mergeColor(0xe8a200,C.aqua,0.25),
    intro_timer:0,first_time:false,smashspeed:25,growtangle_x:0,heart_recoil:0,special:0});
  },
  user0:(s,rt)=>{
   if(rt.first(face)?.id!==s.id){s.boss=0;return;}
   s.boss=1;const n=first(rt,'obj_spamton_neo_enemy');
   if(n){s.eyeshp=n.eyeshp;s.nosehp=n.nosehp;s.mouthhp=n.mouthhp;if(eq(n.facebroken,1)){s.eyeshp=-1;s.nosehp=-1;s.mouthhp=-1;}}
   else{s.eyeshp=16;s.nosehp=16;s.mouthhp=16;}
   for(const [name,hp,type] of [['eyes','eyeshp',1],['nose','nosehp',2],['mouth','mouthhp',3]] as const){
    const p=rt.create(face,s.x,s.y);s[name]=p.id;p.hp=s[hp];p.type=type;p.target=s.target;p.damage=s.damage;p.first_time=s.first_time;
   }
  },
  user2:(s,rt)=>{
   let xx=0,yy=0;if(eq(s.type,1)){xx=62;yy=32;}if(eq(s.type,2)){xx=34;yy=64;}if(eq(s.type,3)){xx=52;yy=102;}
   if(!eq(s.type,0)){const t=rt.create(target,s.x+xx,s.y+yy);s.targ=t.id;t.depth=s.depth-999;}
  },
  step:(s,rt)=>{
   if(eq(s.init,0)){
    if(eq(s.type,0))s.sprite='spr_spamtonneo_faceAttack_face';
    if(eq(s.type,1))s.sprite='spr_spamtonneo_faceAttack_eyes';
    if(eq(s.type,2))s.sprite='spr_spamtonneo_faceAttack_nose';
    if(eq(s.type,3))s.sprite='spr_spamtonneo_faceAttack_mouth';
    if(!s.first_time)rt.userEvent(s,2);
    if(ge(s.type,1)){s.imageIndex=1;if(le(s.hp,0)){s.broken=1;s.imageIndex=2;}}
    if(eq(s.type,0))s.depth+=10;s.init=1;
    if(s.first_time){s.imageAlpha=1;s.xstart=s.x;s.growtangle_x=requireFirst(rt,'obj_growtangle').x;s.x=rt.view.x+730;}
   }
   if(s.first_time){
    if(eq(s.intro_timer,0)){
     s.x-=s.smashspeed;s.smashspeed+=0.5;
     if(lt(s.x,s.xstart)){s.intro_timer=15;if(eq(s.type,0)){rt.create(object('obj_shake'),s.x,s.y);snd(rt,'snd_closet_impact');}}
    }
    if(gt(s.intro_timer,0)){
     s.intro_timer-=1;
     if(eq(s.intro_timer,0)){
      s.first_time=false;s.x=s.xstart;
      if(eq(s.type,0)){s.intro_timer=-1;for(const b of rt.all(object('obj_growtangle')))b.x=s.growtangle_x;}
      rt.userEvent(s,2);
     }else{
      s.x=s.xstart-Math.sin(Math.PI*(s.intro_timer/15))*20;
      if(eq(s.type,0))for(const b of rt.all(object('obj_growtangle')))b.x=s.growtangle_x-Math.sin(Math.PI*(s.intro_timer/15))*20;
     }
    }
    if(s.first_time)return;
   }
   if(eq(s.broken,1)&&!eq(s.type,0)&&eq(s.destroytarget,0)){const t=rt.byId(s.targ);if(t)rt.destroy(t);s.destroytarget=1;}
   s.timer+=1;if(lt(s.imageAlpha,1)&&gt(rt.globals.turntimer,21))s.imageAlpha+=0.1;
   if(gt(s.explodetimer,0)){
    let xx=0,yy=0;if(eq(s.type,1)){xx=58;yy=32;}if(eq(s.type,2)){xx=30;yy=64;}if(eq(s.type,3)){xx=48;yy=102;}
    if(eq(s.explodetimer%2,0)){
     const y=s.y+yy-25+rt.random.random(50),x=s.x+xx-25+rt.random.random(50);
     const c=rt.create(crescent,x,y);s.cres=c.id;c.depth=s.depth-100;
    }s.explodetimer-=1;
   }
   let brokencounter=0;for(const f of rt.all(face))if(eq(f.broken,1))brokencounter+=1;
   if(eq(s.type,1)&&eq(s.broken,0)){
    if(eq(s.timer,30)||eq(s.laserinit,0)){
     s.brokenmod=brokencounter;s.lasex=-10+s.x+56;s.lasey=s.y+32;
     const h=requireFirst(rt,'obj_heart');s.laserdir=pointDirection(s.lasex,s.lasey,h.x+10,h.y+10);s.laserinit=1;
    }
    if(ge(s.timer,30)&&eq(s.timer%3,0)&&gt(rt.globals.turntimer,21)){
     const l=rt.create(circle,s.lasex,s.lasey);s.laser=l.id;bulletInherit2(s,l);l.my_angle=s.laserdir;
     if(eq(s.brokenmod,2))l.my_angle=s.laserdir+s.brokenmod*rt.random.randomRange(-8,8);
     l.my_speed=7;l.my_accel=s.brokenmod*0.25;l.imageYscale=2;l.my_angle_change=0;l.target=s.target;l.damage=s.damage;l.element=6;s.shootflashtimer=3;
    }
    if(eq(s.timer,50))s.timer=s.brokenmod*5;
   }
   if(eq(s.type,2)&&eq(s.broken,0)){
    if(ge(s.timer,70)&&eq(s.noseinit,0)){s.brokenmod=brokencounter;s.noseinit=1;}
    if(ge(s.timer,80)&&eq(s.timer%5,0)){
     const randomvspeed=rt.random.randomRange(-2,2);
     for(let i=0;i<3;i++){
      const b=rt.create(object('obj_regularbullet'),s.x,s.y);s.bullet=b.id;bulletInherit2(s,b);
      b.sprite='spr_spamtonneo_faceAttack_nose_bullet';b.mask='spr_spamtonneo_faceAttack_nose_bullet_mask';darkSize(s,b);
      b.gravity=0.6;b.gravityDirection=180;b.friction=0.4;b.vspeed=-4+i*4.5;if(eq(s.brokenmod,2))b.vspeed+=randomvspeed;
      b.hspeed=-3;b.target=s.target;b.damage=s.damage;b.element=6;s.shootflashtimer=3;
     }
    }if(eq(s.timer,90))s.timer=26+s.brokenmod*10;
   }
   if(eq(s.type,3)&&eq(s.broken,0)){
    if(ge(s.timer,10)&&eq(s.eyesinit,0)){s.eyesinit=1;s.brokenmod=brokencounter;}
    if(ge(s.timer,10))s.imageIndex=3;
    if(ge(s.timer,10)&&eq(s.timer%6,0)){
     const b=rt.create(object('obj_regularbullet'),s.x+30,s.y+98);s.bullet=b.id;b.sprite='spr_spamtonneo_faceAttack_wisp';bulletInherit2(s,b);
     b.hspeed=rt.random.randomRange(-4,-7);b.vspeed=rt.random.randomRange(6,-2);
     if(ge(requireFirst(rt,'obj_heart').y,requireFirst(rt,'obj_growtangle').y))b.vspeed+=1;
     b.gravity=-0.2;b.target=s.target;b.damage=s.damage;b.element=6;s.shootflashtimer=3;
    }if(eq(s.timer,42)){s.imageIndex=1;s.timer=-40+s.brokenmod*20;}
   }
   // The installed scr_debug returns zero: its U/I/O shortcut branch is unreachable.
   if((eq(s.type,1)||eq(s.type,2))&&eq(s.broken,1))s.imageIndex=2;
   if(eq(s.type,3)&&eq(s.broken,1))s.imageIndex=4;
  },
  endStep:(s,rt)=>{
   if(!eq(s.type,0)||(eq(s.intro_timer,0)&&eq(s.heart_recoil,0)))return;
   const h=requireFirst(rt,'obj_heart'),b=requireFirst(rt,'obj_growtangle'),w=rt.spriteWidth(b);
   if(eq(s.intro_timer,-1)){if(le(h.x,b.x-w/2+4))s.heart_recoil=10;s.intro_timer=0;}
   else if(gt(s.intro_timer,0)&&eq(s.heart_recoil,0)&&gt(s.intro_timer,7)&&ge(h.x,b.x+w/2-24))s.heart_recoil=(s.intro_timer-8)/7*-10;
   if(!eq(s.heart_recoil,0)){h.x+=s.heart_recoil;s.heart_recoil=towards(s.heart_recoil,0,1);}
   // The builtin clamps the lower bound first, then the upper, including an inverted interval.
   h.x=Math.min(Math.max(h.x,b.x-w/2+2),b.x+w/2-24);
  },
  draw:(s,rt)=>{
   if(!eq(s.init,1))return;
   for(const [type,field,brokenFrame] of [[1,'eyeshp',2],[2,'nosehp',2],[3,'mouthhp',4]] as const){
    if(eq(s.type,type)&&gt(enemy(rt)[field],0))s.imageBlend=mergeColor(C.purple,s.blue_col,enemy(rt)[field]/16);
    if(eq(s.type,type)&&(lt(enemy(rt)[field],1)||eq(s.imageIndex,brokenFrame)))s.imageBlend=C.white;
   }
   if(gt(s.shootflashtimer,0)){s.imageBlend=C.yellow;s.shootflashtimer-=1;}
   if(gt(s.hurtflashtimer,0)){s.imageBlend=C.red;s.hurtflashtimer-=1;}
   let hidesprite=0;
   if(gt(s.invincibilitytimer,0)){
    if([10,9,6,5,3,2].some(n=>eq(s.invincibilitytimer,n)))hidesprite=1;
    s.invincibilitytimer-=1;s.imageBlend=C.red;
   }
   if(eq(hidesprite,0))rt.drawSelf(s);rt.drawSprite('spr_battlebg_0',0,s.x-3,s.y+70,2.4,2,0,s.blend,1);
  },
  destroy:(s,rt)=>{
   if(eq(s.boss,1)){
    const n=enemy(rt);if(le(n.eyeshp,0)&&le(n.nosehp,0)&&le(n.mouthhp,0)&&first(rt,'obj_spamton_neo_enemy'))
     for(const n of rt.all(object('obj_spamton_neo_enemy')))Object.assign(n,{eyeshp:16,nosehp:16,mouthhp:16,facebroken:2});
   }
   for(const t of rt.all(target))rt.destroy(t);
  },
 },collisions:[{target:object('obj_yheart_shot'),run:(s,shot,rt)=>{
  if(eq(s.type,0)||lt(s.imageAlpha,0.9))return;
  if(eq(s.broken,1)){snd(rt,'snd_bell');rt.userEvent(shot,0);return;}
  if(gt(s.invincibilitytimer,0)&&eq(shot.big,0)){rt.destroy(shot);return;}
  s.shake=6;let amount=1;if(!eq(shot.big,0))amount=eq(enemy(rt).hellmode,1)?2:4;
  const n=enemy(rt);if(eq(s.type,1))n.eyeshp-=amount;if(eq(s.type,2))n.nosehp-=amount;if(eq(s.type,3))n.mouthhp-=amount;
  snd(rt,'snd_damage');s.invincibilitytimer=10;s.hurtflashtimer=3;
  if((eq(s.type,1)&&le(n.eyeshp,0))||(eq(s.type,2)&&le(n.nosehp,0))||(eq(s.type,3)&&le(n.mouthhp,0))){
   s.broken=1;s.imageIndex=2;snd(rt,'snd_rocket');s.explodetimer=16;
  }rt.userEvent(shot,0);
 }}]};
 const target:GmObjectDef={name:'obj_sneo_faceattack_target',index:675,sprite:'spr_boxing_crescent',visible:false,depth:0,
  events:{create:s=>{s.imageSpeed=0;s.imageXscale=0.4;s.imageYscale=0.4;s.imageBlend=C.red;}}};
 const crescent:GmObjectDef={name:'obj_boxing_crescent',index:837,sprite:'spr_boxing_crescent',depth:0,
  events:{create:s=>{s.imageSpeed=0.5;s.imageXscale=2;s.imageYscale=2;s.timer=0;},step:(s,rt)=>{if(ge(s.imageIndex,3))rt.destroy(s);}}};
 const circle:GmObjectDef={name:'obj_werewire_bullet_lasercircle',index:479,parent:object('obj_regularbullet'),sprite:'spr_bullet_laser_circle',depth:0,
  events:{
   create:s=>{bulletInit(s);Object.assign(s,{grazepoints:3,destroyonhit:0,imageXscale:0,imageYscale:0,timer:0,tri:1,tri_angle:20,my_angle:180,
    my_speed:4,my_accel:0,my_length:1,my_angle_change:0,part_count:0,siner:0,m:2,parent:-1});},
   step:(s,rt)=>{
    if(!eq(s.parent,-1)){const p=rt.byId(s.parent);if(p){s.x=p.x-32;s.y=p.y;}}
    s.siner+=0.5;s.timer+=1;
    if(le(s.timer,6/s.m)){s.imageXscale+=0.4*s.m;s.imageYscale+=0.4*s.m;}
    if(gt(s.timer,6/s.m)&&le(s.timer,s.my_length+3)){
     const l=rt.create(square,s.x,s.y);s.laser=l.id;bulletInherit2(s,l);
     s.imageXscale-=Math.sin(s.siner*1.3*s.m)*0.2;s.imageYscale-=Math.sin(s.siner*1.3*s.m)*0.2;
     l.imageAngle=s.my_angle;l.speed=s.my_speed;l.direction=s.my_angle;l.friction=-s.my_accel;l.imageYscale=1;l.my_angle_change=s.my_angle_change;
     const neo=!!first(rt,'obj_spamton_neo_enemy');l.sprite=neo?'spr_bullet_laser_square_sneo':'spr_bullet_laser_square';
     if(eq(s.timer,3))l.sprite=neo?'spr_bullet_laser_front_sneo':'spr_bullet_laser_front';
     if(eq(s.timer,s.my_length+3)){l.sprite=neo?'spr_bullet_laser_front_sneo':'spr_bullet_laser_front';l.imageIndex=1;}
    }else{
     s.imageXscale-=0.1*s.m;s.imageYscale-=0.1*s.m;
     if(le(s.imageXscale,0)&&le(s.imageYscale,0))rt.destroy(s);
    }
   },
  }};
 const square:GmObjectDef={name:'obj_werewire_bullet_lasersquare',index:478,parent:object('obj_regularbullet'),sprite:'spr_bullet_laser_square',depth:0,
  events:{
   create:s=>{bulletInit(s);Object.assign(s,{destroyonhit:0,grazepoints:2,init_con:0,init_timer:0,circle_size:1,imageXscale:2,imageYscale:3,
    imageSpeed:0,my_angle_change:0,m:2,stretch:1});},
   step:(s,rt)=>{if(eq(s.stretch,1))s.imageXscale=2+s.speed/(10*s.m);if(le(s.x,-100))rt.destroy(s);s.direction+=s.my_angle_change;s.imageAngle=s.direction;},
  }};
 return [face,target,crescent,circle,square];
}
