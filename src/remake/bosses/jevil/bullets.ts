// Jevil's bullets. Where GML passes several random expressions to one call (choose(a + random(..), b + random(..))),
// the reference VM evaluates the arguments right to left; the code below keeps that order.
import {moveTowardsPoint,type GmInstance,type GmObjectDef,type GmRuntime} from '../../gm/runtime';
import {ge,gt,le,lt,lengthdirX,lengthdirY,pointDirection} from '../../gm/math';
import {afterimage,battleSolid,bulletParent,collideBullet,damageAll,heart,inheritBullet,regularBullet,regularBulletPermanent,shake} from '../../deltarune/battle';
import {bulletController} from './controller';

const C_GRAY=0x808080,C_RED=0x0000ff,C_WHITE=0xffffff;
const soul=(rt:GmRuntime)=>rt.first(heart)!;
const solid=(rt:GmRuntime)=>rt.first(battleSolid)!;

/** A suit bomb drops in, ticks faster and faster, then bursts into its suit's pattern. */
export const suitBomb:GmObjectDef={name:'obj_suitbomb',index:270,parent:bulletParent,sprite:'spr_suitsbomb',events:{
 create:(s,rt)=>{
  s.visible=false;s.type=rt.random.choose(0,1,2,3);s.y=-80;s.imageXscale=2;s.imageYscale=2;s.con=0;s.timer=0;s.imageSpeed=0;s.vspeed=10;
  s.maxtimer=20+rt.random.random(16);s.explodedraw=0;
 },
 step:(s,rt)=>{
  if(s.con===0){s.sprite=['spr_bomb_spade','spr_bomb_diamond','spr_bomb_heart','spr_bomb_club'][s.type]??s.sprite;s.visible=true;s.con=1;}
  if(s.con===1){
   s.timer+=1;
   if(s.timer>=10)s.imageSpeed=s.timer/s.maxtimer;
   if(s.timer>=s.maxtimer){s.con=2;s.timer=0;s.speed=0;}
  }
  if(s.con===2){
   if(s.type===0){
    s.dir=rt.random.random(360);s.maxe=12;
    for(let i=0;i<12;i++){
     const b=rt.create(regularBullet,s.x,s.y);inheritBullet(s,b);
     b.active=1;b.direction=s.dir+i*(360/s.maxe);b.speed=8;b.imageAngle=b.direction;b.sprite='spr_spadebullet';
    }
    s.con=3;
   }
   if(s.type===1){
    for(let i=0;i<3;i++){
     const b=rt.create(regularBullet,s.x,s.y);b.damage=100;inheritBullet(s,b);
     const h=soul(rt);moveTowardsPoint(b,h.x+8,h.y+8,11);
     b.speed=b.speed-i;b.imageAngle=b.direction;b.sprite='spr_diamondbullet';
    }
    s.con=3;
   }
   if(s.type===2){const h=rt.create(heartBombBlast,s.x,s.y);inheritBullet(s,h);s.con=3;}
   if(s.type===3){
    const h=soul(rt);s.dir=pointDirection(s.x,s.y,h.x+8,h.y+8);
    for(let i=0;i<3;i++){
     const b=rt.create(regularBullet,s.x,s.y);b.sprite='spr_clubsbullet';b.damage=100;inheritBullet(s,b);
     b.active=1;b.direction=s.dir-20+i*20;b.imageAngle=b.direction;b.speed=8;
    }
    s.con=3;
   }
  }
  if(s.explodedraw>=40)rt.destroy(s);
 },
 draw:(s,rt)=>{
  if(s.con<2)rt.drawSelf(s);
  else{s.explodedraw+=1;const d=rt.drawState;d.color=C_WHITE;d.alpha=1.5-s.explodedraw/10;rt.drawCircle(s.x,s.y,rt.spriteWidth(s)/2+s.explodedraw*2);d.alpha=1;}
 },
}};

/** The heart bomb's burst: four hearts orbiting a point that flies at the soul. */
export const heartBombBlast:GmObjectDef={name:'obj_heartbomb_blast',index:269,parent:bulletParent,sprite:'spr_bomb_heart',events:{
 create:s=>{s.made=0;s.active=0;s.pausetimer=0;s.con=0;s.siner=0;s.maxlength=0;s.visible=false;},
 step:(s,rt)=>{
  const sons:number[]=s.son??=[];
  if(s.made===0){for(let i=0;i<4;i++){const b=rt.create(regularBullet,s.x,s.y);sons[i]=b.id;b.sprite='spr_heartbullet';inheritBullet(s,b);}s.made=1;}
  s.pausetimer+=1;
  if(s.pausetimer>=10&&s.con===0){const h=soul(rt);moveTowardsPoint(s,h.x+8,h.y+8,7);s.con=1;}
  s.siner+=1;
  if(s.maxlength<40)s.maxlength+=4;
  for(let i=0;i<4;i++){const b=rt.byId(sons[i]);if(b){b.x=s.x+lengthdirX(s.maxlength,s.siner*3+i*90);b.y=s.y+lengthdirY(s.maxlength,s.siner*3+i*90);}}
 },
}};

/** Carousel horses: they circle the box (drawn behind it while on the far side, harmless there) and bob up and down. */
export const carouselBullet:GmObjectDef={name:'obj_carouselbullet',index:275,parent:regularBulletPermanent,sprite:'spr_carousel',events:{
 create:s=>{
  s.siner=0;s.siner2=0;s.t=0;s.hspeed=6;s.sinspeed=1;s.altmode=0;s.altsin=0;s.timer=0;s.difficulty=1;s.times=0;s.activetimer=0;
  s.grazed=0;s.grazepoints=10;s.timepoints=10;s.target=0;s.inv=120;s.damage=124;s.active=0;
  s.imageXscale=2;s.imageYscale=2;s.imageAlpha=0;s.imageSpeed=0;s.type=0;s.con=0;s.vsin=0;s.wall_destroy=0;
 },
 step:(s,rt)=>{
  if(s.t<=25)s.imageAlpha=s.imageAlpha+0.04;
  if(s.t===25)s.active=1;
  if(s.t===0){s.maxspeed=Math.abs(s.hspeed);s.hspeed=0;}
  s.t+=1;s.siner+=s.sinspeed;
  s.sinfactor_0=Math.sin((s.siner-1)/20);s.sinfactor=Math.sin(s.siner/20);s.sinsign=s.sinfactor-s.sinfactor_0;
  s.x=solid(rt).x-s.sinfactor*150;
  s.imageXscale=s.sinsign*50;
  if(s.imageXscale>2)s.imageXscale=2;
  if(s.imageXscale<-2)s.imageXscale=-2;
  if(s.sinsign>0){s.depth=21;s.active=0;s.imageBlend=C_GRAY;}
  if(s.sinsign<0){s.depth=0;if(s.imageAlpha>=1)s.active=1;s.imageBlend=C_WHITE;}
  s.vsin+=1;
  if(s.altmode===0||s.altmode===2||s.altmode===3)s.y=s.y+Math.sin(s.vsin/10)*3.5;
  if(s.altmode===1)s.y=s.y-Math.sin(s.vsin/10)*3.5;
  if(s.altmode===99){s.altsin+=1;s.y=s.y+Math.cos(s.altsin/20)*2;s.altsin+=1;s.y=s.y+Math.cos(s.altsin/10)*2;}
 },
}};

/** Jevil blinks in beside the box, throws a diamond (type 0) or a fan of five spades (type 1), and blinks out. */
export const jokerTeleport:GmObjectDef={name:'obj_joker_teleport',index:276,parent:bulletParent,sprite:'spr_joker_teleport',events:{
 create:(s,rt)=>{
  s.fire=0;s.special=0;s.con=0;s.imageXscale=0;s.imageSpeed=0;s.timer=0;s.imageYscale=2;s.type=0;s.damage=100;s.grazed=0;s.grazepoints=4;s.timepoints=2;
  s.inv=60;s.grazetimer=0;s.target=0;s.sndcon=0;
  if(s.x<rt.view.x+rt.view.width/2)s.sprite='spr_joker_teleport_r';
 },
 step:(s,rt)=>{
  if(s.con===0){
   if(s.sndcon===0){rt.sound?.('snd_swing');s.sndcon=1;}
   s.imageIndex=0;
   if(lt(s.imageXscale,2))s.imageXscale=s.imageXscale+0.4;else{s.imageXscale=2;s.con=1;s.timer=0;}
  }
  if(s.con===1){
   s.timer+=1;
   if(s.timer>=8){
    if(s.sndcon===1&&s.type<3){rt.sound?.('snd_joker_oh');s.sndcon=2;}
    s.imageIndex=1;s.con=2;s.timer=0;
    if(s.type===0){
     const b=rt.create(collideBullet,s.x,s.y);s.bullet=b.id;b.sprite='spr_diamondbullet';b.active=1;inheritBullet(s,b);
     const h=soul(rt);moveTowardsPoint(b,h.x+10,h.y+10,8);b.imageAngle=b.direction;b.imageXscale=0.7;b.imageYscale=0.7;
    }
    if(s.type===1){
     for(let i=0;i<5;i++){
      const b=rt.create(collideBullet,s.x,s.y);s.bullet=b.id;b.sprite='spr_spadebullet';b.active=1;b.offset=18*i;inheritBullet(s,b);
      const h=soul(rt);moveTowardsPoint(b,h.x+10,h.y+10,4.5);
      b.direction=b.direction-36+b.offset;b.imageAngle=b.direction;b.imageXscale=0.4;b.imageYscale=0.4;
     }
    }
   }
  }
  if(s.con===2){s.timer+=1;if(s.timer>=10){s.con=4;s.timer=0;}}
  if(s.con===4){
   if(s.sndcon===2){rt.sound?.('snd_swing');s.sndcon=3;}
   if(gt(s.imageXscale,0)){s.imageXscale=s.imageXscale-0.4;s.imageYscale=s.imageYscale+0.2;}
   else{s.imageXscale=0;s.con=0;rt.destroy(s);}
  }
 },
}};

/** A dark club that glides to a stop and fires three volleys of club balls at the soul. */
export const clubsBulletDark:GmObjectDef={name:'obj_clubsbullet_dark',index:236,parent:bulletParent,sprite:'spr_clubsbullet_dark',events:{
 create:s=>{s.difficulty=1;s.times=0;s.activetimer=0;s.grazed=0;s.grazepoints=1;s.timepoints=1;s.target=0;s.dont=1;s.inv=120;s.damage=124;s.active=0;s.dtimer=0;s.type=0;s.initangle=0;},
 step:(s,rt)=>{
  s.dtimer+=1;
  const volley=(spread:number,extra:number,speed:number,inherit:boolean)=>{
   const h=soul(rt);moveTowardsPoint(s,h.x+8,h.y+8,0.1);
   for(const [sprite,off] of [['spr_clubsball_b',0],['spr_clubsball_c',-spread],['spr_clubsball_a',spread]] as const){
    const b=rt.create(regularBullet,s.x,s.y);
    if(!b.live)continue;
    b.sprite=sprite;b.direction=s.direction+off+extra;b.speed=speed;b.imageAngle=s.direction;
    if(inherit)inheritBullet(s,b);else{b.damage=s.damage;b.target=s.target;b.grazepoints=2;b.timepoints=1;}
   }
  };
  const fade=()=>{const a=rt.create(afterimage,s.x,s.y);a.sprite=s.sprite;a.imageAngle=s.imageAngle;rt.destroy(s);};
  if(s.type===0){
   if(s.dtimer===15||s.dtimer===19||s.dtimer===23)volley(17,0,4,false);
   if(s.dtimer===25)fade();
  }
  if(s.type===2){
   if(s.dtimer===20||s.dtimer===22||s.dtimer===24){volley(19,-2+s.initangle,5,true);s.initangle+=2;}
   if(s.dtimer===26)fade();
  }
 },
}};

/** A diamond that rises (type 1) or homes vertically on the soul (type 0); its motion runs in the Draw event. */
export const dbulletVert:GmObjectDef={name:'obj_dbullet_vert',index:238,parent:collideBullet,sprite:'spr_diamondbullet_vert',events:{
 create:(s,rt)=>{
  if(s.y<rt.view.y+20)s.y=rt.view.y+20;
  if(s.y>rt.view.y+460)s.y=rt.view.y+460;
  s.difficulty=1;s.times=0;s.activetimer=0;s.grazed=0;s.grazepoints=5;s.timepoints=5;s.target=0;s.dont=1;s.inv=120;s.damage=124;s.active=0;s.imageAlpha=0;
  if(!rt.exists(heart))rt.destroy(s);
  s.type=0;
 },
 draw:(s,rt)=>{
  if(s.dont===0){
   if(s.active===0){
    rt.drawSprite(s.sprite,0,s.x,s.y,3-s.imageAlpha*2,3-s.imageAlpha*2,0,C_WHITE,s.imageAlpha);
    if(s.imageAlpha<1){s.imageAlpha=s.imageAlpha+0.1;if(s.type===1){s.vspeed=3;s.gravity=-0.5;}}
    else{
     if(s.type===0){if(soul(rt).y+8<s.y){s.vspeed=1;s.gravity=-0.2;}else{s.vspeed=-2;s.gravity=1;}}
     s.active=1;
    }
   }
   rt.drawSprite(s.sprite,0,s.x,s.y,2-s.imageAlpha,2-s.imageAlpha,0,C_WHITE,s.imageAlpha);
   if(s.type===0&&s.speed>8)s.speed=8;
   if(s.y>rt.view.y+500)rt.destroy(s);
   if(s.y<rt.view.y-20)rt.destroy(s);
  }
  s.dont=0;
 },
}};

/** Four scythes swinging around the box (type 1 also throws a red scythe from alternating sides). */
export const centerScythe:GmObjectDef={name:'obj_centerscythe',index:272,parent:regularBulletPermanent,sprite:'spr_joker_scythebody',mask:'spr_joker_scythebody_mask',events:{
 create:(s,rt)=>{
  s.grazed=0;s.grazepoints=3;s.timepoints=2;s.target=0;s.inv=120;s.damage=124;s.grazetimer=0;s.active=0;s.imageAlpha=0;s.imageXscale=1;s.imageYscale=1;
  s.rotspeed=0;s.insanity=1;s.chasecon=1;s.chasetimer=0;s.centerx=320;s.centery=120;
  const box=rt.first(battleSolid);if(box){s.centerx=box.x;s.centery=box.y;}
  s.radius=150;s.sine=0;s.sinespeed=1.4;s.dir=rt.random.random(70);s.dirspeed=1.5*rt.random.choose(1,-1);s.un=0;s.scythetimer=-5;s.scythesidex=1;
  s.swingnoise=0;s.noisebuffer=0;s.type=0;
  const c=rt.first(bulletController);if(c&&c.type===76)s.type=1;
  s.king=0;
  if(s.type===1){s.imageXscale=1;s.imageYscale=1;s.insanity=0;s.sinespeed=1.3;s.scythesidex=rt.random.choose(1,-1);}
  if(rt.count(centerScythe)===1){
   s.king=1;s.x=s.centerx-s.radius;s.y=s.centery;
   const s2=rt.create(centerScythe,s.centerx+s.radius,s.centery);s2.sine=0;s2.dir=180;s2.un=1;s.s2=s2.id;
   const s3=rt.create(centerScythe,s.centerx,s.centery-s.radius);s3.sine=0;s3.dir=90;s3.un=0;s.s3=s3.id;
   const s4=rt.create(centerScythe,s.centerx,s.centery+s.radius);s4.sine=0;s4.dir=270;s4.un=1;s.s4=s4.id;
   for(const o of rt.all(centerScythe)){o.mydir=s.dir;o.sinespeed=s.sinespeed;o.dirspeed=s.dirspeed;o.insanity=s.insanity;}
   for(const o of rt.all(centerScythe)){
    if(o.dir!==o.mydir)o.dir+=o.mydir;
    o.x=o.centerx-lengthdirX(o.radius,o.dir);o.y=o.centery-lengthdirY(o.radius,o.dir);
   }
  }
  s.wall_destroy=0;
 },
 step:(s,rt)=>{
  if(s.chasecon===1){s.imageAlpha=s.imageAlpha+0.04;if(ge(s.imageAlpha,1)){s.imageAlpha=1;s.chasecon=2;s.active=1;}}
  if(s.chasecon===2){
   if(s.un===0&&le(s.rotspeed,10))s.rotspeed+=1;
   if(s.un===1&&ge(s.rotspeed,-10))s.rotspeed-=1;
   s.sine+=s.sinespeed;s.dir+=s.dirspeed;
   if(s.insanity===1){
    if(gt(s.dirspeed,0)&&lt(s.dirspeed,3))s.dirspeed+=0.01;
    if(lt(s.dirspeed,0)&&gt(s.dirspeed,-3))s.dirspeed-=0.01;
   }
   s.length=Math.cos(s.sine/18)*s.radius;
   s.x=s.centerx-lengthdirX(s.length,s.dir);s.y=s.centery-lengthdirY(s.length,s.dir);
   if(s.king===1){s.noisebuffer-=1;if(Math.abs(s.length)<=8&&s.noisebuffer<0){rt.sound?.('snd_swing');s.noisebuffer=10;}}
  }
  if(s.king===1&&s.type===1){
   s.scythetimer+=1;
   if(s.scythetimer===60){
    rt.sound?.('snd_spearappear');
    const b=rt.create(collideBullet,s.centerx+s.radius*s.scythesidex,s.centery+60*s.scythesidex);s.sbul=b.id;
    b.imageXscale=2;b.imageYscale=2;b.imageAlpha=0;b.sprite='spr_joker_scythebody';b.mask='spr_joker_scythebody_mask';b.imageBlend=C_RED;b.active=1;
    inheritBullet(s,b);
   }
   const sb=rt.byId(s.sbul);
   if(s.scythetimer>=60&&s.scythetimer<70&&sb){sb.imageAngle+=10*s.scythesidex;sb.imageAlpha=sb.imageAlpha+0.1;}
   if(s.scythetimer>=85&&s.scythetimer<90&&sb)sb.hspeed=sb.hspeed-3*s.scythesidex;
   if(s.scythetimer>=100&&s.scythetimer<105&&sb)sb.imageAlpha=sb.imageAlpha-0.2;
   if(s.scythetimer>=105){if(sb)rt.destroy(sb);s.scythesidex=s.scythesidex===-1?1:-1;s.scythetimer=59;}
  }
  s.imageAngle+=s.rotspeed;
  if(s.grazed===1){s.grazetimer+=1;if(s.grazetimer>=30){s.grazed=0;s.grazetimer=0;}}
 },
}};

/** A spinning scythe that falls, then bursts into a vertical laser. A hit takes 30% of everyone's HP. */
export const laserScythe:GmObjectDef={name:'obj_laserscythe',index:273,parent:regularBulletPermanent,sprite:'spr_joker_scythebody',events:{
 create:(s,rt)=>{
  s.grazed=0;s.grazepoints=15;s.timepoints=0;s.target=0;s.inv=120;s.damage=124;s.active=1;s.imageXscale=2;s.imageYscale=2;
  s.imageAngle=rt.random.random(360);s.rotspeed=14;s.vspeed=5;s.mask='spr_joker_scythebody_mask';s.gravity=1;s.explode=0;s.explodetimer=0;
  s.remrot=s.imageAngle;s.remy=s.y;s.remx=s.x;s.scale=2;
 },
 step:(s,rt)=>{
  if(s.explode===0){s.remx=s.x;s.remy=s.y;s.imageAngle+=s.rotspeed;s.remrot=s.imageAngle;}
  if(s.y>=rt.room.height-100&&s.explode===0){
   rt.sound?.('snd_scytheburst');
   s.remx=s.x;s.remy=s.y;s.explode=1;s.explodetimer=0;s.remrot=s.imageAngle;s.imageAngle=0;s.speed=0;s.gravity=0;
   s.mask='spr_tallpx';s.sprite='spr_tallpx';s.grazed=0;s.y=0;s.depth+=1;
  }
  if(s.explode===1){s.active=0;s.imageXscale=s.imageXscale+8;if(s.imageXscale>=16)s.active=1;if(s.imageXscale>=32)s.explode=2;}
  if(s.explode===2){
   s.imageXscale=s.imageXscale-4;
   if(s.imageXscale<=16){s.imageAlpha=s.imageAlpha-0.25;s.active=0;}
   if(s.imageXscale<=0)rt.destroy(s);
  }
  if(s.grazed===1){for(const c of rt.all(bulletController))c.made+=0.2;s.grazed=2;}
 },
 user5:(s,rt)=>{
  const g=rt.globals;
  if(s.active!==1||g.inv>=0)return;
  rt.create(shake,0,0);rt.sound?.('snd_hurt1');g.inv=g.invc*40;
  const temp=[0,1,2].map(i=>Math.max(0,g.hp[g.char[i]]));s.temphp=temp;
  if(Math.ceil(temp[0]+temp[1]+temp[2])/3>=10){for(let i=0;i<3;i++)if(temp[i]>0)g.hp[g.char[i]]=Math.ceil(g.hp[g.char[i]]*0.7);}
  else damageAll(s,rt);
 },
 draw:(s,rt)=>{
  if(s.explode<2)rt.drawSprite('spr_joker_scythebody',s.imageIndex,s.remx,s.remy,s.scale,s.scale,s.remrot,C_WHITE,1);
  if(s.explode>=1)rt.drawSelf(s);
 },
}};
export const jevilBullets=[suitBomb,heartBombBlast,carouselBullet,jokerTeleport,clubsBulletDark,dbulletVert,centerScythe,laserScythe];
export {soul,solid};
export type {GmInstance};
