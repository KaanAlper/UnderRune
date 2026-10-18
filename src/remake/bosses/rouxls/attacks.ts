// Rouxls's attacks (bullet types 26-28): the Thrash Machine's head weapon fires (26: ThrashHead), the machine rises
// out of the acid and charges across with its feet's attack (27: ThrashFoot), and puzzle blocks fall into the box
// (28: PuzzleBlocks). The head and feet are the machine's chosen parts; the laser head and the stomping feet are
// ported (the parts the reference recording and the app's start use); the others are named errors.
import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {C} from '../../gm/graphics';
import {ge,le,lengthdirX,lengthdirY,pointDirection,pointDistance} from '../../gm/math';
import {bulletInit,collideBullet,regularBullet,shake} from '../../deltarune/battle';
import {easeOut} from '../../deltarune/ease';
import {gtMaxy,moveTowards} from '../../deltarune/chapter3-scripts';
import {snd} from '../../deltarune/sound';
import type {Chapter2BulletRunner} from '../../deltarune/chapter2-bullets';

/** scr_orbitx / scr_orbity: (x2, y2) turned `angle` degrees around (x1, y1). */
const orbit=(x1:number,y1:number,x2:number,y2:number,angle:number):[number,number]=>{
 if(angle===0)return [x2,y2];
 const t=pointDirection(x1,y1,x2,y2)+angle,r=pointDistance(x1,y1,x2,y2);return [x1+lengthdirX(r,t),y1+lengthdirY(r,t)];
};
const HEADS=['laser','sword','flame','duck'],FEET=['stomp','wheels','missiles','duck'];

export function createRouxlsAttacks(object:(name:string)=>GmObjectDef){
 const rouxls=(rt:GmRuntime)=>{const r=rt.first(object('obj_rouxls_enemy'));if(!r)throw Error("Rouxls's attack needs Rouxls");return r;};
 const box=(rt:GmRuntime)=>{const b=rt.first(object('obj_growtangle'));if(!b)throw Error("Rouxls's attack needs the box");return b;};
 const heart=(rt:GmRuntime)=>{const h=rt.first(object('obj_heart'));if(!h)throw Error("Rouxls's attack needs the soul");return h;};
 /** scr_bullet_create, run by `s`. */
 const bulletCreate=(s:GmInstance,rt:GmRuntime,x:number,y:number,def:GmObjectDef)=>{const d=rt.create(def,x,y);d.damage=s.damage;d.target=s.target;if('element' in s)d.element=s.element;return d;};
 /** The head attacks' parent: the machine's head stops turning when the attack goes. */
 const headParent:GmObjectDef={...object('obj_thrash_headparent'),events:{destroy:(s,rt)=>{const t=rt.byId(s.thrash);if(t)t.headangle=0;}}};
 const laserBullet:GmObjectDef={...object('obj_thrash_laserbullet'),parent:collideBullet,events:{
  create:s=>{bulletInit(s);Object.assign(s,{tailx:s.x,taily:s.y,targetx:s.x,targety:s.y,init:0,attackdirection:0,laserwidth:10,finalpoint:3,nextpoint:1,lasertimer:0,active:0,imageXscale:5,imageYscale:.8,destroyonhit:0,laserspeed:20,grazepoints:4});},
  user5:(s,rt)=>{collideBullet.events!.user5!(s,rt);rouxls(rt).head_difficulty=0;},
  // It runs to the box's top, bottom or right, then (up or down) across to the soul's column and away; the tail follows.
  step:(s,rt)=>{
   if(s.init===0){
    s.active=1;s.init=1;
    if(s.attackdirection===1){s.finalpoint=2;s.targetx=box(rt).x+100;}
    else{s.targety=box(rt).y+100*(s.attackdirection-1);s.direction=s.attackdirection===0?90:270;s.imageAngle=s.direction;}
   }
   const dist=pointDistance(s.x,s.y,s.tailx,s.taily);
   if(s.lasertimer>0||ge(dist,100)){
    s.tailx=moveTowards(s.tailx,s.x,s.laserspeed);s.taily=moveTowards(s.taily,s.y,s.laserspeed);s.lasertimer--;
    if(s.lasertimer<=0&&le(dist,s.laserspeed)){if(s.attackdirection===1)s.targetx=rt.view.x-80;s.nextpoint++;}
   }
   if(s.lasertimer<=0){
    if(s.nextpoint===2&&s.attackdirection!==1){
     const h=heart(rt);
     if(le(s.x-s.laserspeed,h.x+10)){s.x=h.x+10;s.targetx=s.x;s.targety=s.attackdirection===2?rt.view.y-80:rt.view.y+500;s.lasertimer=15;}
     else s.x-=s.laserspeed;
    }else if(s.lasertimer<=0){
     s.x=moveTowards(s.x,s.targetx,s.laserspeed);s.y=moveTowards(s.y,s.targety,s.laserspeed);
     if(le(pointDistance(s.x,s.y,s.targetx,s.targety),0))s.lasertimer=s.attackdirection===1?15:5;
    }
   }
   if(s.grazed===1){if(s.grazetimer===0)s.grazetimer=5;else{s.grazetimer--;if(s.grazetimer===0)s.grazed=0;}}
  },
  draw:(s,rt)=>{
   if(s.nextpoint>s.finalpoint&&le(pointDistance(s.x,s.y,s.tailx,s.taily),0))rt.destroy(s);
   s.imageYscale=Math.max((s.laserwidth-4)/10,0);
   const d=rt.drawState,before=d.color,w=s.laserwidth,flick=s.lasertimer%4>1;
   d.color=C.black;
   if(s.lasertimer>0)rt.drawCircle(s.x,s.y,w+(flick?4:3),false);else rt.drawCircle(s.x,s.y,w/2+2,false);
   rt.drawCircle(s.tailx,s.taily,w/2+2,false);rt.drawLine(s.x,s.y,s.tailx,s.taily,w+2);
   d.color=C.white;rt.drawLine(s.x,s.y,s.tailx,s.taily,w);
   if(s.lasertimer>0)rt.drawCircle(s.x,s.y,w+(flick?3:2),false);else rt.drawCircle(s.x,s.y,w/2,false);
   rt.drawCircle(s.tailx,s.taily,w/2,false);
   d.color=before;
  },
 }};
 /** The laser head: it aims (headangle follows Rouxls's height) and fires a laser at a new side each time. */
 const laserAttack:GmObjectDef={...object('obj_thrash_laserattack'),parent:headParent,events:{
  create:(s,rt)=>{
   const t=rt.byId(rouxls(rt).thrash);if(!t)throw Error('obj_thrash_laserattack needs the Thrash Machine');s.thrash=t.id;t.headangle=0;
   s.lastattack=rt.random.irandom(2);Object.assign(s,{attackangle:s.lastattack*90+90,headangle:180,lastangle:180,btimer:0,damage:-1,target:-1,difficulty:0,grazepoints:4});
  },
  step:(s,rt)=>{
   const t=rt.byId(s.thrash);if(!t)throw Error('obj_thrash_laserattack lost the Thrash Machine');
   s.btimer++;s.headangle=(rouxls(rt).y-40)/1.75;
   const fire=s.difficulty?8:15;
   if(s.btimer===fire){
    const [ox,oy]=orbit(0,0,45,0,s.headangle);
    snd(rt,'snd_spearappear',1.2);
    const d=bulletCreate(s,rt,t.headx-ox,t.heady-oy,laserBullet);s.d=d.id;d.grazepoints=s.grazepoints;d.direction=0;d.attackdirection=s.lastattack;
   }
   if(s.btimer>=(s.difficulty?13:25)){
    s.btimer=0;let next=rt.random.irandom(1);if(next===s.lastattack)next=2;
    s.lastangle=s.attackangle;s.attackangle=next*90+90;s.lastattack=next;
   }
   t.headangle=s.headangle;
  },
 }};
 /** The machine's body hurts while it charges (it follows the machine). */
 const bodyHitbox:GmObjectDef={...object('obj_thrash_bodyhitbox'),parent:collideBullet,events:{
  create:(s,rt)=>{bulletInit(s);s.destroyonhit=0;s.imageXscale=6;s.imageYscale=5;s.depth-=10;s.deathtimer=0;s.duckmode=0;s.thrash=rouxls(rt).thrash;},
  user5:(s,rt)=>{
   collideBullet.events!.user5!(s,rt);
   const t=rt.first(object('obj_thrashmachine'));
   if(s.active&&t?.duckmode)throw Error("The duck Thrash Machine's crash (obj_animation_dx) is not ported");
  },
  endStep:(s,rt)=>{
   const t=rt.byId(s.thrash);if(!t)return;
   if(s.deathtimer>0){s.deathtimer--;if(s.deathtimer<=0){const r=rouxls(rt);r.thrashcon=7;r.x=r.remx;t.a=0;rt.destroy(s);}}
   if(s.duckmode)throw Error("The duck Thrash Machine's squeaks are not ported");
   t.stomp=0;s.x=t.xx-30;s.y=t.yy+t.s*t.walkc+14;
  },
 }};
 /** obj_spinningbullet: a regular bullet that turns its direction (or only its image) by `spin` each frame. */
 const spinning:GmObjectDef={...object('obj_spinningbullet'),parent:regularBullet,events:{
  create:(s,rt)=>{regularBullet.events!.create!(s,rt);s.spin=0;s.imageonly=0;},
  step:(s,rt)=>{
   if(s.wall_destroy===1){
    if(s.x<rt.view.x-80)rt.destroy(s);if(s.x>rt.view.x+760)rt.destroy(s);
    if(s.y<rt.view.y-80)rt.destroy(s);if(s.y>rt.view.y+580)rt.destroy(s);
   }
   if(s.imageonly)s.imageAngle+=s.spin;else s.direction+=s.spin;
   if(s.updateimageangle===1)s.imageAngle=s.direction;
  },
 }};
 /** A star the stomping feet kick up. */
 const stompBullet:GmObjectDef={...object('obj_thrash_stomp_bullet'),parent:spinning,events:{
  user5:(s,rt)=>{collideBullet.events!.user5!(s,rt);rouxls(rt).wheel_difficulty=0;},
 }};
 /** A puzzle block: it falls into the box, knocks it down a little and tumbles out. */
 const fallingBlock:GmObjectDef={...object('obj_rouxls_fallingblock'),parent:collideBullet,events:{
  create:s=>{bulletInit(s);s.destroyonhit=0;s.bottomhit=0;},
  step:(s,rt)=>{
   const b=box(rt),floor=b.y+rt.spriteWidth(b)/2-20;
   if(!s.bottomhit&&s.y+s.vspeed>floor){
    s.y=floor;b.y+=4;s.direction=rt.random.randomRange(30,150);s.speed=rt.random.random(3);
    // With a shake already going, the source's d is obj_shake's object index: every shake gets the values.
    const existing=rt.exists(shake),shakes=existing?rt.withInstances(shake):[rt.create(shake,0,0)];
    s.d=existing?object('obj_shake').index:shakes[0].id;
    for(const d of shakes){d.shakex=Math.ceil(2);d.shakey=Math.ceil(2);}
    snd(rt,'snd_screenshake');s.bottomhit=1;
   }
   if(s.y>rt.view.y+580)rt.destroy(s);
  },
 }};
 const ripple:GmObjectDef={...object('obj_rouxls_ripple'),events:{
  create:s=>{Object.assign(s,{timer:0,scale:0,alpha:0,maxsize:0,imageSpeed:0});},
  draw:(s,rt)=>{
   s.timer+=.1;if(s.timer>1)rt.destroy(s);
   s.scale=easeOut(s.timer,3)*s.maxsize;
   s.alpha=s.timer<.25?s.timer*4:s.timer>.75?1-(s.timer-.75)*4:1;
   rt.drawSprite(s.sprite!,s.imageIndex,s.x,755,s.scale,s.scale,0,C.lime,s.alpha);
  },
 }};
 const splash:GmObjectDef={...object('obj_rouxls_splasheffect'),events:{
  create:(s,rt)=>{s.imageSpeed=0;s.imageIndex=rt.random.irandom(2);Object.assign(s,{imageXscale:.75,imageYscale:0,siner:0,yscale:2,xscale:.75});},
  draw:(s,rt)=>{
   s.siner++;const duration=2.5*s.yscale;
   if(Math.sin(s.siner/duration)<0)rt.destroy(s);
   rt.drawSprite(s.sprite!,s.imageIndex,s.x,s.y,(s.siner/duration+.75)*s.xscale,Math.sin(s.siner/duration)*s.yscale,0,C.white,1);
  },
 }};
 /** Bullet types 26-28 in the bullet maker. */
 const pattern:Chapter2BulletRunner=(s,rt)=>{
  if(s.type===26){
   if(s.init!==1)return true;
   const r=rouxls(rt),t=rt.byId(r.thrash);if(!t)throw Error('ThrashHead needs the Thrash Machine');
   r.head_difficulty=1;const head=t.part[1];r.headattack=1;
   if(head!==3)r.thrashmode=1;
   if(head!==0)throw Error(`The Thrash Machine's ${HEADS[head]??head} head is not ported`);
   const d=rt.create(laserAttack,0,0);s.d=d.id;d.grazepoints=8;d.thrash=t.id;d.damage=s.damage;
   d.difficulty=s.difficulty;d.target=s.target;s.init=2;
   return true;
  }
  if(s.type===27){
   const r=rouxls(rt),t=rt.byId(r.thrash);if(!t)throw Error('ThrashFoot needs the Thrash Machine');
   s.x=r.x;s.y=r.y;const legs=t.part[2],thrashcon=r.thrashcon;r.headattack=0;
   if(s.init===1){
    r.wheel_difficulty=1;r.thrashmode=1;s.init=2;
    const d=rt.create(bodyHitbox,s.x,s.y);s.d=d.id;d.thrash=t.id;d.grazepoints=15;d.damage=s.damage;d.target=s.target;
    if(t.part[0]===3){d.damage=1;if(t.part[1]===3)d.duckmode=1;}
   }
   if(thrashcon<=2)s.btimer=10;
   if(legs!==0)throw Error(`The Thrash Machine's ${FEET[legs]??legs} feet are not ported`);
   r.advancespeed=7;r.returnspeed=7;
   if((thrashcon===3||thrashcon===5)&&t.stomp!==0){
    // (A local counter: `var i` in the source.)
    for(let i=0;i<1;i++){
     if(i===0){const a=rt.create(object('obj_animation'),s.x+30,(gtMaxy(rt)??0)-36);s.d=a.id;a.sprite='spr_thrash_bash';a.imageXscale=rt.random.choose(3,-3);a.imageYscale=3;}
     const b=rt.create(stompBullet,s.x+30,s.y+190);s.d=b.id;const bx=box(rt);
     b.direction=pointDirection(b.x,b.y,bx.x,bx.y-600)+rt.random.randomRange(-30,30);
     b.spin=Math.sign(b.direction-90)*rt.random.randomRange(1,10);b.speed=rt.random.randomRange(8,10);
     Object.assign(b,{sprite:'spr_thrash_star',gravity:.25,grazepoints:8,imageonly:1,damage:s.damage,target:s.target});b.depth=r.depth-1;
    }
    t.stomp=0;
   }
   return true;
  }
  if(s.type===28){
   if(s.btimer<Math.max(10,15-s.made/2))return true;
   let xoffset:number;
   if(s.init===1){rouxls(rt).saberanim=1;xoffset=rt.random.irandom(3);s.btimer=10;s.special=-1;s.init=2;return true;}
   xoffset=rt.random.irandom(2);
   if(xoffset===s.special)xoffset=3;
   const left=box(rt).x-53,d=rt.create(fallingBlock,left+xoffset*36,rt.view.y-20);s.d=d.id;
   d.gravity=.25;d.vspeed=3.5;d.damage=s.damage;d.grazepoints=8;d.target=s.target;
   s.special=xoffset;s.btimer=0;s.made++;
   return true;
  }
  return false;
 };
 // The falling blocks' maker going ends his saber pose.
 pattern.destroy=(s,rt)=>{if(s.type===28)rouxls(rt).saberanim=0;};
 return {objects:[headParent,laserAttack,laserBullet,bodyHitbox,spinning,stompBullet,fallingBlock,ripple,splash],pattern,ripple,splash};
}
