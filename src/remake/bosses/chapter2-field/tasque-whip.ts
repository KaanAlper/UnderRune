import {resolveEvent,type GmInstance,type GmObjectDef,type GmRuntime} from '../../gm/runtime';
import {lengthdirX,lengthdirY,pointDirection,pointDistance} from '../../gm/math';
import {bulletInit} from '../../deltarune/battle';
const partSprites=['spr_tm_head','spr_tm_body','spr_tm_tail','spr_tm_hand_l_attack','spr_tm_hand_r','spr_tm_legs'];
const instance=(rt:GmRuntime,id:number)=>{const i=rt.byId(id);if(!i)throw Error(`Tasque whip requires live instance ${id}`);return i;};
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
export function createTasqueWhip(object:(n:string)=>GmObjectDef):GmObjectDef[]{
 const whip:GmObjectDef={...object('obj_tm_whip'),events:{
  create:(s,rt)=>{bulletInit(s);resolveEvent(s.object.parent!,'create')?.(s,rt);Object.assign(s,{warnoffset:0,destroyonhit:0,timepoints:0,originx:s.x,originy:s.y,dodraw:0,warning:0,quizmode:false,active:false});},
  draw:(s,rt)=>{if(s.warning)rt.drawSprite('spr_tm_whipwarn',((s.warning-1)%9)/3+s.warnoffset,s.origx,s.origy,1,1,0,s.warning%2===0?0x0000ff:0x40a0ff,1);
   if(s.dodraw){const dir=pointDirection(s.origx,s.origy,s.x,s.y);for(s.i=6;s.i<12;s.i++)rt.drawSprite('spr_whitepixel',0,mix(s.origx,s.x,s.i/12),mix(s.origy,s.y,s.i/12),12,2,dir,0xffffff,1);rt.drawSprite('spr_tm_whip_ball',0,s.x,s.y,1,1,s.imageAngle,0xffffff,1);}},
 }};
 const animation:GmObjectDef={...object('obj_tm_whip_animation'),events:{
  create:(s,rt)=>{Object.assign(s,{state:0,lastState:0,creator:0,animConst:Math.PI*3,timer:Math.PI*6,attacktimer:0,truetimer:0,animSpeed:1,element:6,partsprite:[...partSprites],xOffset:[],yOffset:[]});
   for(s.i=0;s.i<6;s.i++){const spr=rt.bank.get(s.partsprite[s.i]);if(!spr)throw Error(`Missing Tasque sprite ${s.partsprite[s.i]}`);s.xOffset[s.i]=spr.originX*2;s.yOffset[s.i]=spr.originY*2;}
   const h=rt.first(object('obj_heart'));if(!h)throw Error('Tasque whip requires soul');s.targetx=h.x;s.targety=h.y;s.rotateCracker=0;s.attackoffset=rt.random.choose(0,45);s.whipball=rt.create(whip,s.x,s.y).id;
   Object.assign(s,{quizmode:false,quizloop:false,init:0,damage:-1,target:-1,difficulty:0,zapping:false,zaptimer:0,looping:false});},
  destroy:()=>{},
  step:(s,rt)=>{
   const w=instance(rt,s.whipball),owner=()=>instance(rt,rt.globals.monsterinstance[s.creator]);
   if(s.init===0){w.quizmode=s.quizmode;if(s.quizmode)w.active=false;w.damage=s.damage;w.target=s.target;w.element=6;s.init=1;s.depth=owner().depth;if(s.quizmode)s.state=-1;}
   if(s.quizloop&&s.state===-1){s.quizloop=false;s.state=0;}
   if(s.state===-1){if(s.lastState!==-1){s.timer=0;s.attacktimer=0;s.visible=false;owner().visible=true;s.lastState=-1;}return;}
   if(s.lastState===-1&&s.state!==-1){s.visible=true;owner().visible=false;s.lastState=s.state;}
   s.truetimer++;if(s.state===2)s.attacktimer=45;else s.attacktimer+=s.animSpeed;
   if(s.state===0&&s.attacktimer>=20)s.attacktimer=19;
   if(s.attacktimer===5){if(!s.quizmode){const h=rt.first(object('obj_heart'))!;s.targetx=h.x+8;s.targety=h.y+8;}w.origx=s.targetx;w.origy=s.targety;s.attackoffset+=45;}
   if(s.zapping&&s.zaptimer%5<1&&(s.quizmode||s.zaptimer<15)){
    let rotation=s.attackoffset;if(s.difficulty===1)rotation+=s.zaptimer/5*15*(s.attackoffset===45?-1:1);
    let dir=0;if(s.rotateCracker)dir=pointDirection(s.targetx,s.targety,s.x+s.xOffset[1],s.y+s.yOffset[1]);
    if(!s.quizmode){const count=s.difficulty===1?8:4;for(s.i=0;s.i<count;s.i++){const b=rt.create(object('obj_regularbullet'),s.targetx,s.targety);b.speed=0.1;b.friction=-0.5;b.sprite='spr_tm_zap_bullet';b.timepoints=0;b.direction=rotation+(s.difficulty===1?45:90)*s.i+dir;b.imageAngle=b.direction+90;b.damage=s.damage;b.element=6;b.target=s.target;}}
    if(!s.quizmode&&s.zaptimer>=15)s.zapping=false;
   }
   if(s.zapping!==w.active&&!s.quizmode)w.active=s.zapping;
   if(s.state===2){if(!s.zapping)s.zaptimer=0;else s.zaptimer+=s.animSpeed;}
   if(s.state!==s.lastState){if(s.state===3){s.zapping=false;s.zaptimer=0;s.attacktimer=56;}s.lastState=s.state;}
   if(s.state===3&&s.attacktimer>=59){s.timer=s.animConst;s.state=s.looping?5:4;s.lastState=4;}
   if(s.state===4&&s.attacktimer>=65){w.dodraw=0;if(!s.quizmode){const h=rt.first(object('obj_heart'))!;s.targetx=h.x+8;s.targety=h.y+8;}w.origx=s.targetx;w.origy=s.targety;
    if(s.quizmode&&!s.quizloop)s.state=-1;else{if(s.quizloop)s.quizloop=false;s.state=0;s.lastState=0;}s.attacktimer=5;s.attackoffset+=45;}
   if(s.state===5&&s.attacktimer>=65)w.dodraw=0;
  },
  draw:drawAnimation,
 }};
 const attack:GmObjectDef={...object('obj_tm_whip_attack'),events:{
  create:(s,rt)=>{Object.assign(s,{state:0,creator:0,animConst:Math.PI*3,timer:Math.PI*6,attacktimer:0,truetimer:0,damage:0,target:0,animSpeed:1,difficulty:0,zaptime:10});s.animator=rt.create(animation,s.x,s.y).id;s.quizmode=false;s.init=0;},
  destroy:(s,rt)=>{instance(rt,rt.globals.monsterinstance[s.creator]).visible=true;},
  step:(s,rt)=>{const a=instance(rt,s.animator);if(s.init===0){s.init=1;a.damage=s.damage;a.target=s.target;a.animSpeed=s.animSpeed;a.creator=s.creator;if(!s.quizmode)a.difficulty=s.difficulty;}
   s.attacktimer+=s.animSpeed;if(s.state===0&&s.attacktimer>=20){if(rt.globals.turntimer>30){s.state=1;a.state=1;}else s.attacktimer=19;}
   if(s.state===1&&s.attacktimer>=35){s.state=2;a.state=2;a.zapping=true;}if(s.state===2&&s.attacktimer>55){a.state=3;s.state=3;}if(s.attacktimer>=65){s.state=0;s.attacktimer=5;}
  },
 }};
 return [whip,animation,attack];
}
function drawAnimation(s:GmInstance,rt:GmRuntime){
 const w=instance(rt,s.whipball),c=s.animConst;
 if(s.state===0){s.timer+=s.timer>=c*2.5?0.25:1.5*s.animSpeed;if(s.timer>=c*3)s.timer=c*3;}
 else if(s.state===1){s.timer+=8*s.animSpeed;if(s.timer>=c*5)s.timer=c*5;}
 else if(s.state===2){if(s.timer>=c*5&&s.zapping)s.timer-=1.5;else s.timer=c*5;}
 else if(s.state===4){s.timer+=s.timer>=c*2.5?0.25*s.animSpeed:1.5*s.animSpeed;if(s.timer>=c*3)s.timer=c*3;}
 const sin=Math.sin(s.timer/6),cos=Math.cos(s.timer/6),draw=(spr:string,x:number,y:number,angle=0,frame=0)=>rt.drawSprite(spr,frame,x,y,2,2,angle,0xffffff,1);
 draw(s.partsprite[4],s.x+s.xOffset[4]+sin*2,s.y+s.yOffset[4]+sin*2);draw(s.partsprite[2],s.x+s.xOffset[2],s.y+s.yOffset[2],-sin*10);
 let hand=s.attacktimer<20?'spr_tm_hand_l':s.partsprite[3];const dir=pointDirection(s.xOffset[1],s.yOffset[1],s.xOffset[3],s.yOffset[3]),len=pointDistance(s.xOffset[1],s.yOffset[1],s.xOffset[3],s.yOffset[3]);
 let hx=s.xOffset[1]+lengthdirX(len,dir-45+sin*50),hy=s.yOffset[1]+lengthdirY(len,dir-45+sin*30),frame=0;
 if(s.state===0){hand='spr_tm_whip_ready';if(s.timer>=c*2.5)frame=4;else if(s.timer>=c*2)frame=2;}
 if(s.state===1){if(s.timer<c*5){hx=s.xOffset[1]+lengthdirX(len,dir-45+Math.sin(c*5/6)*50);hy=s.yOffset[1]+lengthdirY(len,dir-45+Math.sin(c*5/6)*30);}if(s.timer<c*4)hand='spr_tm_whip_smear';
  const x=s.x+hx+Math.cos(c*5/6)*2,y=s.y+hy+Math.sin(c*5/6)*2;draw(hand,x,y,pointDirection(x,y,s.targetx,s.targety)-90);
 }else if(s.state!==2&&!(s.state===3&&s.attacktimer>55))draw(hand,s.x+hx+cos*2,s.y+hy+sin*2,(s.state===0?-45:0)+Math.sin((s.timer-2)/6)*(s.state===0?45:90),frame);
 draw(s.partsprite[5],s.x+s.xOffset[5],s.y+s.yOffset[5]);draw(s.partsprite[1],s.x+s.xOffset[1],s.y+s.yOffset[1]+sin*2);draw(s.partsprite[0],s.x+s.xOffset[0],s.y+s.yOffset[0]+sin*3,sin*10);
 if(!s.quizmode&&s.attacktimer>=5&&s.attacktimer<=20&&rt.globals.turntimer>30){w.warnoffset=s.difficulty===1?6:s.attackoffset%90===0?0:3;w.warning=s.attacktimer-4;}
 if(s.attacktimer>20){w.warning=0;hx=s.x+hx+cos*2;hy=s.y+hy+sin*2;}
 const links=(x:number,y:number)=>{w.origx=hx;w.origy=hy;const angle=pointDirection(hx,hy,s.targetx,s.targety);for(s.i=1;s.i<6;s.i++)rt.drawSprite('spr_whitepixel',0,mix(hx,x,s.i/12),mix(hy,y,s.i/12),12,2,angle,0xffffff,1);};
 if(s.attacktimer>20&&s.attacktimer<30){w.dodraw=1;const t=(s.attacktimer-15)/15,x=mix(hx,s.targetx,t),y=mix(hy,s.targety,t);links(x,y);w.x=x;w.y=y;w.imageAngle=s.attackoffset+t*720;}
 if(s.attacktimer>=30&&s.attacktimer<=55){w.dodraw=1;links(s.targetx,s.targety);if(s.state===2)draw(hand,hx,hy,pointDirection(hx,hy,s.targetx,s.targety)-90);w.x=s.targetx;w.y=s.targety;w.imageAngle=s.attackoffset-45;}
 if(s.attacktimer>55){const t=(s.attacktimer-65)/-10,x=mix(hx,s.targetx,t),y=mix(hy,s.targety,t);links(x,y);if(s.state===2||s.state===3)draw(hand,hx,hy,pointDirection(hx,hy,s.targetx,s.targety)-90);w.x=x;w.y=y;w.imageAngle=s.attackoffset+t*720;}
}
