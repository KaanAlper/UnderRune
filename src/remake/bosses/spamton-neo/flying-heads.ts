// NEO's maker, flying head and head bullet. Their own events are hand-written; the basic-bullet parent
// and visual cut effect remain canonical dependencies until their separate migration.
import {moveTowardsPoint,type GmInstance,type GmObjectDef,type GmRuntime} from '../../gm/runtime';
import {rectangleMeets} from '../../gm/collision';
import {ge,le,lt} from '../../gm/math';
import {C,mergeColor} from '../../gm/graphics';
import {bulletInit,tensionHeal} from '../../deltarune/battle';
import {snd} from '../../deltarune/sound';

export function flyingHeadPathEnd(s:GmInstance,rt:GmRuntime){rt.destroy(s);}

export function createFlyingHeads(object:(name:string)=>GmObjectDef):GmObjectDef[]{
 const first=(rt:GmRuntime,name:string)=>rt.first(object(name));
 function afterimageCut(s:GmInstance,rt:GmRuntime){
  const a=rt.create(object('obj_afterimage_cut'),s.x,s.y);s.afterimage=a.id;
  Object.assign(a,{sprite:s.sprite,imageIndex:s.imageIndex,imageBlend:s.imageBlend,imageSpeed:0,depth:s.depth,imageXscale:s.imageXscale,imageYscale:s.imageYscale,imageAngle:s.imageAngle});
  rt.userEvent(a,0);return a;
 }
 function hit(s:GmInstance,rt:GmRuntime){
  if(s.destroyable!==1)return;
  const shot=rt.byId(s.hitshot);if(!shot)throw Error('NEO flying head requires its hitshot');
  if(s.bighead&&shot.big===0){
   snd(rt,'snd_bell',0.7+rt.random.random(0.1),0.8);shot.x-=Math.abs(shot.hspeed);shot.hspeed=-8;shot.vspeed=rt.random.choose(-8,8,10,-10);
   const doom=rt.create(object('obj_doom'),0,0);doom.depth=0;doom.alarm[0]=90;doom.target=shot.id;
  }else{
   if(shot.big===0)rt.userEvent(shot,0);
   rt.sourceAudio?.volume('snd_bomb',0.7,0);snd(rt,'snd_bomb',1.1+rt.random.random(0.2),0.7);
   afterimageCut(s,rt).flash=true;rt.destroy(s);
  }
 }
 const head:GmObjectDef={name:'obj_sneo_lilguy',index:607,parent:object('obj_collidebullet'),sprite:'spr_sneo_crew',depth:0,events:{
  create:(s,rt)=>{
   bulletInit(s);Object.assign(s,{element:6,f:2,destroyable:0,angle_speed:0,yellowsiner:0,loop:0,loopy1:90,loopy2:240,falsevspeed:0,bighitbox:0,bighead:0,
    angleadjust:0,active:1,altdir:0,altspeed:0,altfriction:0,altgravity:0,changedirection:0,bulletspeed:8,imageSpeed:0,cutscene:0});
   const n=first(rt,'obj_spamton_neo_enemy');if(n)s.damage=rt.globals.monsterat[n.myself]*5;
   const c=first(rt,'obj_sneo_bulletcontroller');if(c)s.target=c.target;s.grazepoints=2;
  },
  step:(s,rt)=>{
   if(s.cutscene===0&&(ge(s.x,rt.view.x+1000)||le(s.x,rt.view.x-200)||ge(s.y,rt.view.y+600)||le(s.y,rt.view.y-200)))rt.destroy(s);
   s.direction+=s.angle_speed;if(s.angleadjust===1)s.imageAngle=s.direction;
   if(s.destroyable===1){s.yellowsiner++;s.imageBlend=mergeColor(0xe8a200,C.aqua,0.25+Math.sin(s.yellowsiner/3)*0.25);}
   if(s.loop===1){if(lt(s.y,s.loopy1))s.y=s.loopy2-(s.loopy1-s.y);if(s.y>s.loopy2)s.y=s.loopy1+(s.y-s.loopy2);}
   s.y+=s.falsevspeed;
   if(s.bighitbox===1){s.hitshot=rt.all(object('obj_yheart_shot')).find(o=>rectangleMeets(rt.bank,o,s.x,s.y,s.x+rt.spriteWidth(s),s.y+rt.spriteHeight(s),true))?.id??-4;if(s.hitshot!==-4)rt.userEvent(s,0);}
  },
  draw:(s,rt)=>rt.drawSelf(s),
  alarm0:s=>{if(s.changedirection){s.direction=s.altdirection;s.gravity=s.altgravity;s.friction=s.altfriction;s.speed=s.altspeed;}},
  alarm1:(s,rt)=>{
   const h=first(rt,'obj_heart');if(h){const b=rt.create(object('obj_sneo_lilguy_bullet'),s.x,s.y+12);s.bullet=b.id;b.bulletspeed=s.bulletspeed;b.depth=s.depth-1;moveTowardsPoint(b,h.x+8,h.y+8,b.bulletspeed);}
   s.imageIndex=2;s.imageSpeed=1;
  },
  alarm2:s=>{s.imageIndex=1;},animationEnd:s=>{if(s.cutscene===0)s.imageSpeed=0;},user0:hit,
 },collisions:[{target:object('obj_yheart_shot'),run:(s,shot,rt)=>{
  s.hitshot=shot.id;rt.userEvent(s,0);const n=first(rt,'obj_spamton_neo_enemy');if(!n)throw Error('NEO flying head collision requires its enemy');tensionHeal(rt,n.difficulty===3?1:1.3);
 }}]};
 function configureHead(g:GmInstance,vertical:boolean){
  g.alarm[0]=44;g.alarm[1]=40;g.alarm[2]=32;g.destroyable=1;if(vertical)g.gravityDirection=90;
 }
 const maker:GmObjectDef={name:'obj_sneo_guymaker',index:603,parent:object('obj_bulletparent'),sprite:'spr_sneo_bullet_crew',depth:0,visible:false,events:{
  create:(s,rt)=>{
   const n=first(rt,'obj_spamton_neo_enemy');if(!n)throw Error('NEO head maker requires its enemy');
   s.type=[1,2,3,4][n.difficulty]??4;if(rt.exists(object('obj_sneo_heartattack')))s.type=5;if(n.difficulty===6)s.type=6;if(n.difficulty===7)s.type=7;
   Object.assign(s,{timer:0,prevrow:0,row:0,prevrowy:0,spawncount:0,firstspawn:0});
  },alarm0:(s,rt)=>rt.destroy(s),
  step:(s,rt)=>{
   s.xx=rt.view.x;s.yy=rt.view.y;s.timer++;if(![1,2,3,4,5,6,7].includes(s.type))return;
   if(s.timer===1){
    if(s.type===1){s.row=rt.random.choose(0,1);if(s.prevrow===2)s.row=rt.random.choose(0,1);}
    if(s.type===2){let aa=rt.random.choose(0,1,2);if(s.prevrowy===0)aa=rt.random.choose(1,2);if(s.prevrowy===1)aa=rt.random.choose(0,2);if(s.prevrowy===2)aa=rt.random.choose(0,1);s.rowy=s.yy+210-46*aa;s.prevrowy=aa;s.row=2;}
    if(s.type===3||s.type===4){s.rowy=s.yy+210-40*rt.random.choose(0,1);s.row=rt.random.choose(0,1,3,6);if(s.prevrow===2)s.row=rt.random.choose(0,1,3,6);if(s.prevrow===3)s.row=rt.random.choose(0,1);if(s.row===3&&s.firstspawn===0)s.row=rt.random.choose(0,1);s.firstspawn=1;}
    if(s.type===5){s.rowy=s.yy+210-40*rt.random.choose(0,1,2);s.row=rt.random.choose(0,1,2,2,3,6);if(s.prevrow===2)s.row=rt.random.choose(0,1,3,6);if(s.prevrow===3)s.row=rt.random.choose(0,1,2);}
    if(s.type===6)s.row=6;if(s.type===7)s.row=7;
   }
   if([5,10,15,20].includes(s.timer)){
    if([0,1,2].includes(s.row)){
     const g=rt.create(object('obj_sneo_lilguy'),s.xx+700,s.yy+280);s.guy=g.id;
     g.hspeed=-18;g.friction=-0.1;g.vspeed=-2;configureHead(g,false);g.gravity=0.5;g.gravityDirection=0;
     Object.assign(g,{imageBlend:0xe8a200,changedirection:0,altdirection:0,altspeed:4,altfriction:-0.2,altgravity:0});
     if(s.row===1){g.y-=240;g.vspeed=-g.vspeed;}
     if(s.row===2){g.y-=120;g.vspeed=0;g.hspeed=-21;}
     if(s.row===2&&s.type===2){g.hspeed=-21;g.gravity=0;g.friction=0.5;g.alarm[0]=36;g.changedirection=1;g.altdirection=g.direction;}
     if([2,3,4,5].includes(s.type)&&s.row===2)g.y=s.rowy;
    }
    if(s.row===3&&s.timer!==20){
     if(!('guy' in s)||!Array.isArray(s.guy))s.guy=[];
     for(s.guyi=0;s.guyi<2;s.guyi++){const i=s.guyi,g=rt.create(object('obj_sneo_lilguy'),s.xx+300,s.yy-40+400*i);s.guy[i]=g.id;g.vspeed=18-36*i;configureHead(g,true);g.gravity=0.8-1.6*i;}
    }
    if(s.row===6&&s.timer===5){s.spawncount=2;for(let a=0;a<s.spawncount;a++){
     const top=rt.create(object('obj_sneo_lilguy'),s.xx+410+a*70,s.yy-20);s.guy=top.id;top.vspeed=15;configureHead(top,true);top.alarm[1]=30;top.gravity=0.53;
     const bottom=rt.create(object('obj_sneo_lilguy'),s.xx+445+a*70,s.yy+380);s.guy=bottom.id;bottom.vspeed=-15;configureHead(bottom,true);bottom.gravity=-0.53;
    }}
    if(s.row===7&&s.timer!==20)throw Error('NEO flying head developer path_sneo_head_path1 is not ported');
   }
   if(s.type===2&&s.timer>=41)s.timer=0;if([3,5,6].includes(s.type)&&s.timer>=69)s.timer=0;if(s.type===4&&s.timer>=50)s.timer=0;
   if(s.timer>=50)s.timer=0;if(s.timer===0)s.prevrow=s.row;
  },
 }};
 const bullet:GmObjectDef={name:'obj_sneo_lilguy_bullet',index:623,parent:object('obj_basicbullet_sneo'),sprite:'spr_sneo_crew_bullet',depth:0,events:{
  step:(s,rt)=>{if(ge(s.x,rt.room.width+100)||le(s.x,-100)||ge(s.y,rt.room.height+100)||le(s.y,-100))rt.destroy(s);s.imageAngle+=36;},
 }};
 return [maker,head,bullet];
}
