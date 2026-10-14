// Jevil's bullet controller: one attack pattern per `type`, paced by `btimer`.
// Where one GML call takes several random arguments, they are evaluated right to left, as in the reference VM.
import {gmArray,type GmInstance,type GmObjectDef,type GmRuntime} from '../../gm/runtime';
import {ge,le,lengthdirX,lengthdirY} from '../../gm/math';
import {battleSolid,bulletGenParent,bulletParent,darkMarker,growtangle,heart,inheritBullet,marker,regularBullet} from '../../deltarune/battle';
import {axeBullet} from '../lancer/axe';
import {centerScythe,clubsBulletDark,dbulletVert,jokerTeleport,laserScythe,carouselBullet,suitBomb} from './bullets';
import {spadeRing} from './spadering';

export const bulletController:GmObjectDef={name:'obj_dbulletcontroller',index:241,parent:bulletGenParent,sprite:'spr_grazemask',visible:false,events:{
 create:(s,rt)=>{
  s.btimer=99;s.timermax=12;s.difficulty=1;s.type=1;s.joker=0;s.side=1;s.damage=100;s.grazepoints=1;s.timepoints=1;s.inv=60;
  s.grazed=0;s.grazetimer=0;s.target=0;s.made=0;s.special=0;s.miny=150;s.maxy=280;
  const box=rt.first(growtangle);if(box){s.miny=box.y-rt.spriteHeight(box)/2;s.maxy=box.y+rt.spriteHeight(box)/2;}
  s.ratio=1;const m=rt.globals.monster,pop=m[0]+m[1]+m[2];if(pop===2)s.ratio=1.6;if(pop===3)s.ratio=2.3;
 },
 step:(s,rt)=>{s.btimer+=1;fallingSpades(s,rt);sideSpades(s,rt);spadeRain(s,rt);axeThrow(s,rt);if(s.joker===1)jevilAttack(s,rt);},
}};

const solid=(rt:GmRuntime)=>rt.first(battleSolid)!;
const soul=(rt:GmRuntime)=>rt.first(heart)!;

/** Instances of an object (or its children) by name, for enemies defined in other boss modules. */
const named=(rt:GmRuntime,name:string)=>rt.instances.filter(i=>{if(!i.live)return false;for(let o:GmObjectDef|undefined=i.object;o;o=o.parent)if(o.name===name)return true;return false;});
/** A spade dropping from above around x: it falls under gravity, drifting a little sideways. */
function dropSpade(s:GmInstance,rt:GmRuntime,y:number){
 s.radius=-80+rt.random.random(160)+8;
 const b=rt.create(regularBullet,soul(rt).x+s.radius,y);s.fallspade=b.id;b.damage=s.damage;b.target=s.target;
 b.sprite='spr_spadebullet';b.imageAngle=270;b.gravity=0.3;b.speed=0;b.vspeed=3;b.hspeed=-0.6+rt.random.random(1.2);
 s.side=s.side===1?-1:1;s.btimer=0;
}
/** Types 20/22: Lancer whistles and spades rain down around the soul. */
function fallingSpades(s:GmInstance,rt:GmRuntime){
 if(s.type!==20&&s.type!==22)return;
 const lancers=named(rt,'obj_lancerboss3');
 if(lancers.length){
  if(s.made===0){rt.sound?.('snd_lancerwhistle');s.whistletimer=0;s.made=1;for(const l of lancers)l.idlesprite='spr_lancerbike_l';}
  if(s.made===1){s.whistletimer+=1;if(s.whistletimer>=30){for(const l of named(rt,'obj_lancerboss3'))l.idlesprite='spr_lancerbike';s.made=2;}}
 }
 s.bmax=s.type===20?8:6;
 if(s.btimer>=s.bmax)dropSpade(s,rt,rt.view.y-20);
}
/** Type 24: falling spades that swerve aside when they come near the soul, faster with difficulty. */
function spadeRain(s:GmInstance,rt:GmRuntime){
 if(s.type!==24)return;
 s.bmax=s.difficulty+5;
 for(const b of rt.all(regularBullet)){
  const h=rt.first(heart);if(!h)continue;
  b.xdiff=b.x-(h.x+8);const xd=b.xdiff;
  if(b.y>=h.y-240&&Math.abs(xd)<=30){if(xd>=0&&b.hspeed<5)b.hspeed+=0.4;if(xd<0&&b.hspeed>-5)b.hspeed-=0.4;}
  if(b.y>=h.y-100&&Math.abs(xd)<=60){
   if(xd>=0){if(b.hspeed<2)b.hspeed+=0.25;if(xd<10)b.x+=3;if(xd<20)b.x+=3;if(xd<30)b.x+=3;if(xd<40)b.x+=2;if(xd<60)b.x+=1;}
   else{if(b.hspeed>-2)b.hspeed-=0.25;if(xd>-10)b.x-=3;if(xd>-20)b.x-=3;if(xd>-30)b.x-=3;if(xd>-40)b.x-=2;if(xd>-60)b.x-=1;}
  }
 }
 if(s.btimer>=s.bmax)dropSpade(s,rt,-20);
}
/** Type 85: Susie throws axes across the box while a stand-in Lancer cheers when the soul is hit. */
function axeThrow(s:GmInstance,rt:GmRuntime){
 if(s.type!==85)return;
 const g=rt.globals,box=rt.first(battleSolid);
 const show=(v:boolean)=>{for(const o of [...named(rt,'obj_susieenemy'),...named(rt,'obj_lancerboss3')])o.visible=v;};
 if(s.made===0){
  s.cheer=0;s.cheertimer=0;s.remhp=[g.hp[g.char[0]],g.hp[g.char[1]]];show(false);
  const lan=rt.create(bulletParent,rt.view.x+580,(box?.y??0)+160);s.fakelan=lan.id;
  lan.depth+=1;lan.imageXscale=2;lan.imageYscale=2;lan.visible=true;lan.sprite='spr_lancerbike';lan.active=0;lan.imageSpeed=0.2;
  const sus=rt.create(bulletParent,rt.view.x+530,(box?.y??0)-40);s.fakesus=sus.id;
  sus.imageXscale=2;sus.imageYscale=2;sus.visible=true;sus.sprite='spr_susie_enemy_attack';sus.active=0;sus.imageSpeed=0;
  s.made=1;
 }
 const lan=rt.byId(s.fakelan),sus=rt.byId(s.fakesus);
 if(s.made===1){
  if(lan){
   if(s.cheer===0&&g.inv>10){s.cheer=1;rt.sound?.('snd_lancerwhistle');lan.sprite='spr_lancerbike_l';}
   if(s.cheer===1){s.cheertimer+=1;if(s.cheertimer>=30){s.cheertimer=0;lan.sprite='spr_lancerbike';s.cheer=0;}}
  }
  if(sus&&sus.imageIndex<5)sus.imageIndex+=0.334;
 }
 if(s.made===1&&g.turntimer<=10){if(sus)sus.visible=false;if(lan)lan.visible=false;show(true);}
 if(s.btimer>=27&&box&&g.turntimer>10){
  if(sus){sus.imageIndex=0;rt.sound?.('snd_laz_c');}
  const axe=rt.create(axeBullet,rt.view.x+540,box.y);gmArray(s,'axe')[0]=axe.id;inheritBullet(s,axe);
  s.btimer=0;
 }
}
/** Types 21/23/25: spades slide in from alternating sides of the screen, speeding up. */
function sideSpades(s:GmInstance,rt:GmRuntime){
 if(s.type!==21&&s.type!==23&&s.type!==25)return;
 s.bmax=s.type===21?9:s.type===23?7:4;
 for(const b of rt.all(regularBullet))b.imageAlpha=b.imageAlpha+0.2;
 if(s.btimer<s.bmax)return;
 s.radius=s.side===0?80:560;
 const box=rt.first(growtangle)!,h=rt.spriteHeight(box);
 const b=rt.create(regularBullet,rt.view.x+s.radius,box.y-h/2+rt.random.random(h));
 gmArray(s,'sidespade')[s.side]=b.id;
 if(s.side===0)b.direction=0;
 if(s.side===1)b.direction=180;
 b.imageAlpha=0;b.damage=s.damage;b.target=s.target;
 b.sprite='spr_spadebullet';b.speed=5;b.friction=-0.1;b.imageAngle=b.direction;
 s.side=s.side===1?0:1;s.btimer=0;
}

/** Suit bombs fall at one side of the box. */
function dropBomb(s:GmInstance,rt:GmRuntime,type:number|null){
 s.xx=rt.random.choose(0,1);
 s.basex=rt.view.x+320;const box=rt.first(growtangle);if(box)s.basex=box.x;
 if(s.xx===0)s.idealx=s.basex-180-rt.random.random(100);
 if(s.xx===1)s.idealx=s.basex+180+rt.random.random(100);
 const bomb=rt.create(suitBomb,s.idealx,-20);s.bomb=bomb.id;inheritBullet(s,bomb);
 if(type===null){if(bomb.type===2)bomb.type=rt.random.choose(0,1,2,3);}
 else bomb.type=type;
 s.btimer=0;
}

function teleport(s:GmInstance,rt:GmRuntime,type:number|null){
 const box=solid(rt);
 // choose(x - 100 - random(100), x + 100 + random(100)): the right argument's random call comes first.
 const right=box.x+100+rt.random.random(100),left=box.x-100-rt.random.random(100);
 s.jokerx=rt.random.choose(left,right);
 const below=box.y+rt.random.random(100),above=box.y-rt.random.random(100);
 s.jokery=rt.random.choose(above,below);
 const j=rt.create(jokerTeleport,s.jokerx,s.jokery);s.jokern=j.id;
 if(type!==null)j.type=type;
 inheritBullet(s,j);j.active=0;s.btimer=0;
}

function carousel(s:GmInstance,rt:GmRuntime,x:number,y:number,set:(h:GmInstance)=>void){
 const h=rt.create(carouselBullet,x,y);s.horse1=h.id;set(h);return h;
}

function jevilAttack(s:GmInstance,rt:GmRuntime){
 switch(s.type){
  case 46:if(s.btimer>=12)dropBomb(s,rt,null);break;
  case 47:if(s.btimer>=12)dropBomb(s,rt,1);break;
  case 48:if(s.btimer>=12)dropBomb(s,rt,0);break;
  case 49:if(s.btimer>=20)dropBomb(s,rt,2);break;
  case 50:if(s.btimer>=12)dropBomb(s,rt,3);break;
  case 61:
   if(s.btimer>=40&&s.made===0){
    s.btimer=0;s.made=1;s.horse=0;s.vseed=rt.random.random(300);
    const box=solid(rt);
    for(let j=0;j<3;j++){
     for(let i=0;i<3;i++){
      const y=box.y-80+i*80;
      carousel(s,rt,box.x+150,y,h=>{h.siner=j*42;h.vsin=s.vseed;h.imageIndex=0;h.altmode=2;h.sinspeed=1.1;inheritBullet(s,h);});
      const h=carousel(s,rt,box.x+150,y,h=>{h.siner=j*42+21;h.vsin=s.vseed;h.imageIndex=1;h.altmode=1;h.sinspeed=1.1;inheritBullet(s,h);});
      s.chance=Math.floor(rt.random.random(50));
      if(s.chance===1)h.imageIndex=2;
     }
     s.horse=s.horse===0?1:0;
    }
   }
   break;
  case 62:
   if(s.btimer>=40&&s.made===0){
    s.btimer=0;s.made=1;const box=solid(rt);
    for(let i=0;i<3;i++)for(let j=0;j<7;j++)
     carousel(s,rt,box.x+150,box.y-80+i*80,h=>{h.siner=j*18;h.vsin=j*9;h.sinspeed=1.15;h.altmode=3;inheritBullet(s,h);});
   }
   break;
  case 65:
   if(s.btimer>=60){
    const ring=rt.create(spadeRing,solid(rt).x,solid(rt).y);s.ring=ring.id;
    ring.maxspade=10;ring.grav=0.4;inheritBullet(s,ring);s.btimer=0;
   }
   break;
  case 68:
   for(const h of rt.all(heart))h.wspeed=5;
   if(s.btimer>=54){
    const ring=rt.create(spadeRing,solid(rt).x,solid(rt).y);s.ring=ring.id;
    ring.side=rt.random.choose(0,1);ring.grav=0.45;ring.maxspade=10;inheritBullet(s,ring);s.btimer=0;
   }
   break;
  case 70:if(s.btimer>=20&&rt.globals.turntimer>=30)teleport(s,rt,1);break;
  case 71:if(s.btimer>=9&&rt.globals.turntimer>=20)teleport(s,rt,null);break;
  case 72:
   if(s.btimer>=18){
    s.btimer=0;
    if(s.side===1)s.dir=rt.random.choose(225,315);
    if(s.side===-1)s.dir=rt.random.choose(45,135);
    s.radius=360;s.xx=lengthdirX(s.radius,s.dir);s.yy=lengthdirY(s.radius,s.dir);
    const h=soul(rt),d=rt.create(clubsBulletDark,h.x+8+s.xx,h.y+8+s.yy);s.d=d.id;
    d.direction=s.dir+180;d.speed=20;d.friction=1;d.type=2;d.damage=s.damage;d.target=s.target;d.imageAngle=d.direction;
    s.side=s.side===1?-1:1;
   }
   break;
  case 73:
  case 74:{
   if(s.btimer<(s.type===73?4:9))break;
   s.btimer=0;
   s.radius=140+rt.random.random(40);s.yy=s.radius*s.side;s.xx=-100+rt.random.random(200);
   s.num=rt.random.choose(0,1,2,3);
   if(s.num===3)s.xx=-10+rt.random.random(20);
   if(s.type===73){
    if(rt.exists(battleSolid)){
     const d=rt.create(dbulletVert,soul(rt).x+8+s.xx,solid(rt).y+100);s.db=d.id;
     d.type=1;d.damage=s.damage;d.target=s.target;d.timepoints=2;
    }
   }else{
    const h=soul(rt),d=rt.create(dbulletVert,h.x+8+s.xx,h.y+8+s.yy);s.d=d.id;
    d.grazepoints=12;d.timepoints=2;d.damage=s.damage;d.target=s.target;
   }
   break;
  }
  case 75:
  case 76:
   if(s.btimer>=0&&s.special===0){
    rt.sound?.('snd_spearappear');
    const sc=rt.create(centerScythe,0,0);s.scythe=sc.id;
    for(const o of rt.all(centerScythe)){o.damage=s.damage;o.grazepoints=s.grazepoints;o.timepoints=s.timepoints;o.inv=s.inv;o.target=s.target;o.grazed=0;o.grazetimer=0;}
    s.special=1;
   }
   break;
  case 77:finalChaos(s,rt);break;
 }
}

/** The last attack: the box vanishes, scythes rain down as lasers, then one giant scythe and a white-out end the turn. */
function finalChaos(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,vx=rt.view.x,vy=rt.view.y;
 g.sp=10;for(const h of rt.all(heart))h.wspeed=10;
 if(s.special===0){
  rt.sound?.('snd_joker_byebye');
  s.prevmake=0;s.special=1;s.rank=16;s.realtimer=0;s.chase=0;s.made=0;s.amount=0;s.jokertimer=0;
  const f=darkMarker(rt,vx+320,vy-10,'spr_tallpx');s.darkfader=f.id;
  f.depth=2;f.imageAlpha=0;f.imageBlend=0;f.imageXscale=200;f.imageYscale=2;
 }
 if(s.realtimer>=0&&s.realtimer<10){
  const f=rt.byId(s.darkfader);if(f)f.imageAlpha=f.imageAlpha+0.1;
  for(const b of rt.all(battleSolid))b.imageAlpha=b.imageAlpha-0.1;
  for(const h of rt.all(heart)){h.y=h.y+16;h.boundaryup=160;}
 }
 if(s.realtimer===10)for(const b of rt.all(battleSolid))rt.destroy(b);
 if(s.realtimer===20)rt.create(laserScythe,vx+40,-60);
 if(s.realtimer===40)rt.create(laserScythe,vx+570,-60);
 if(s.realtimer>=60&&s.amount<30&&s.btimer>=s.rank){
  if(s.rank>7)s.rank-=1;
  s.which=Math.floor(rt.random.random(5));
  if(s.which===s.prevmake)s.which=Math.floor(rt.random.random(5));
  if(s.chase===3){s.which=Math.floor((soul(rt).x+8)/90);s.chase=0;}
  s.scythe=rt.create(laserScythe,vx+40+90*s.which,-60).id;
  if(s.which===1)s.scythe2=rt.create(laserScythe,vx+40+450,-60).id;
  if(s.which===0)s.scythe2=rt.create(laserScythe,vx+40+540,-60).id;
  s.prevmake=s.which;s.btimer=0;s.chase+=1;s.amount+=1;
 }
 if(s.amount>=29-s.made&&s.special===1){
  s.jokertimer=0;
  const j=rt.create(jokerTeleport,vx+320,vy+100);s.jokerin=j.id;j.type=66;j.depth=-30;
  s.special=2;s.which2=0;
 }
 if(s.special===2){
  s.jokertimer+=1;const t=s.jokertimer;
  if(t===10)rt.sound?.('snd_joker_neochaos');
  const drop=(...xs:number[])=>{for(const x of xs)s.scythe=rt.create(laserScythe,vx+x,-60).id;};
  if(t===40||t===98)drop(40,580);
  if(t===46||t===86)drop(130,490);
  if(t===52||t===80)drop(220,400);
  if(t===66||t===98)drop(310);
  if(t===130){
   const l=rt.create(laserScythe,vx+320,-320);s.lastscythe=l.id;
   s.p=0;s.vol=0;s.vol2=1;rt.sound?.('snd_rumble');
   l.vspeed=1;l.gravity=0.02;l.imageXscale=16;l.imageYscale=16;l.scale=16;l.rotspeed=0;l.remrot=160;l.imageAngle=160;
   const w=rt.create(marker,vx+320,vy-40);s.fadewhite=w.id;
   w.sprite='spr_tallpx';w.imageXscale=400;w.imageYscale=2;w.depth=-100;w.imageAlpha=-0.3;
  }
  if(t>=131){
   const l=rt.byId(s.lastscythe);if(l)l.x=l.xstart+rt.random.random(8);
   const w=rt.byId(s.fadewhite)!;w.imageAlpha=w.imageAlpha+0.01;s.vol+=0.01;
   if(ge(w.imageAlpha,1)){const f=rt.byId(s.darkfader);if(f)rt.destroy(f);const l2=rt.byId(s.lastscythe);if(l2)rt.destroy(l2);}
   if(ge(w.imageAlpha,1.3))s.special=3;
  }
 }
 if(s.special===3){
  for(const h of rt.all(heart)){h.x=vx+320;h.y=vy+120;}
  s.vol-=0.1;
  const w=rt.byId(s.fadewhite)!;w.imageAlpha=w.imageAlpha-0.1;
  if(le(w.imageAlpha,0)){g.turntimer=11;s.special=4;}
 }
 s.realtimer+=1;
}
