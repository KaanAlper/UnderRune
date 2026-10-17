import {resolveEvent,type GmObjectDef} from '../../gm/runtime';
import {pointDirection,lt} from '../../gm/math';
import {bulletInit,damage,damageAll} from '../../deltarune/battle';
import {bulletInherit2} from '../../deltarune/chapter2-battle';
export function createTasqueBullets(object:(n:string)=>GmObjectDef):GmObjectDef[]{
 const soundwave:GmObjectDef={...object('obj_tasque_soundwave'),events:{
  step:(s,rt)=>{resolveEvent(s.object.parent!,'step')?.(s,rt);s.imageYscale+=0.025*(s.speed/7);s.imageXscale+=0.025*(s.speed/7);},
  user5:(s,rt)=>{if(s.active===1){if(rt.globals.inv<0&&rt.exists(object('obj_tm_quizzler'))){const m=rt.first(object('obj_tasque_manager_enemy'));if(m)m.hitbysimonsaysattackcount++;}if(s.target!==3)damage(s,rt);if(s.target===3)damageAll(s,rt);if(s.destroyonhit===1)rt.destroy(s);}},
 }};
 const chain:GmObjectDef={...object('obj_chainbullet'),events:{
  create:(s,rt)=>{bulletInit(s);s.init=0;if(!rt.exists(object('obj_heart')))rt.destroy(s);Object.assign(s,{childSpeed:5,childgravity:0,firingSpeed:3,timer:3,totalBullets:8,bulletsSpawned:0,shotRotation:0,childBullet:object('obj_regularbullet').index,visible:false});},
  step:(s,rt)=>{if(!rt.exists(object('obj_heart')))rt.destroy(s);if(s.init===1){s.timer++;if(s.timer>=s.firingSpeed){s.timer=0;s.bulletsSpawned++;const def=s.childBullet===soundwave.index?soundwave:s.childBullet===object('obj_regularbullet').index?object('obj_regularbullet'):undefined;if(!def)throw Error(`Unported field chain child ${s.childBullet}`);const d=rt.create(def,s.x,s.y);s.d=d.id;bulletInherit2(s,d);if(s.grazed!==-1)d.grazed=s.grazed;if(s.grazetimer!==-1)d.grazetimer=s.grazetimer;if(d.live){d.sprite=s.sprite;d.direction=s.direction;d.speed=s.childSpeed;d.gravity=s.childgravity;s.direction+=s.shotRotation;d.imageAngle=s.direction;}if(s.bulletsSpawned>=s.totalBullets)rt.destroy(s);}}s.init=1;},
 }};
 const yarn:GmObjectDef={...object('obj_yarnbullet'),events:{
  create:(s,rt)=>{resolveEvent(s.object.parent!,'create')?.(s,rt);},
  draw:(s,rt)=>rt.drawSelf(s),
  user5:(s,rt)=>{if(s.active===1){if(s.target!==3)damage(s,rt);if(s.target===3)damageAll(s,rt);if(s.destroyonhit===1)rt.destroy(s);}},
 }};
 const maker:GmObjectDef={...object('obj_yarnmaker'),events:{
  create:(s,rt)=>{Object.assign(s,{grazed:0,target:0,inv:120,damage:124,element:6,grazepoints:5,timepoints:5,dont:1,activetimer:0,difficulty:1,childspeed:6,childgravity:0,scale:0,state:0,imageXscale:0,imageYscale:0});const h=rt.first(object('obj_heart'));if(h)s.futuredir=pointDirection(s.x,s.y,h.x+8,h.y+8);else rt.destroy(s);},
  draw:(s,rt)=>{if(s.dont===0){if(s.state===0){if(s.sprite)rt.drawSprite(s.sprite,0,s.x,s.y,s.scale,s.scale,s.direction+Math.sqrt(s.scale)*720,0xffffff,1);if(lt(s.scale,1))s.scale+=0.1;else{s.state=1;const b=rt.create(yarn,s.x,s.y);s.mybul=b.id;b.damage=s.damage;b.target=s.target;b.element=s.element;b.element=6;b.sprite='spr_yarnbullet';b.direction=s.direction;b.gravity=s.childgravity;b.speed=s.childspeed;b.imageAngle=s.direction;b.grazepoints=s.grazepoints;b.updateimageangle=1;}}else rt.destroy(s);}else s.dont=0;},
 }};
 const meowing:GmObjectDef={...object('obj_tasque_meowing'),events:{
  create:s=>{s.loop=1;s.creator=0;s.imageXscale=2;s.imageYscale=2;},
  destroy:(s,rt)=>{const m=rt.byId(rt.globals.monsterinstance[s.creator]);if(m)m.visible=true;},
  animationEnd:(s,rt)=>{if(s.loop===0){s.imageSpeed=0;s.imageIndex=(s.sprite?rt.bank.get(s.sprite)?.frames??0:0)-1;}},
 }};
 return [soundwave,chain,yarn,maker,meowing];
}
