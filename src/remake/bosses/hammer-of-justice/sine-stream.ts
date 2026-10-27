import type {GmObjectDef,GmRuntime} from '../../gm/runtime';
import {createChapter2BulletController,type Chapter2BulletRunner} from '../../deltarune/chapter2-bullets';
import {afterImage} from '../../deltarune/battle';
import {bulletInherit} from '../../deltarune/chapter3-scripts';
/** Chapter 4 dbulletcontroller type 250 and its native sine projectile. */
export function createHammerSineStream(object:(name:string)=>GmObjectDef):GmObjectDef[]{
 const first=(rt:GmRuntime,n:string)=>{const i=rt.first(object(n));if(!i)throw Error('Hammer sine stream needs '+n);return i;};
 const pattern:Chapter2BulletRunner=(s,rt)=>{
  if(s.type!==250)return false;
  if(!s.made){if(!rt.exists(object('obj_hammer_of_justice_enemy'))){first(rt,'obj_growtangle').x=rt.view.x+240;first(rt,'obj_heart').x=rt.view.x+240;}s.btimer=19;s.special=0;s.made=1;}
  if(s.btimer===19){s._yloc=rt.view.y+180+rt.random.randomRange(-60,60);s._xloc=rt.view.x+480+rt.random.randomRange(0,60);s._hsp=rt.random.randomRange(-11,-13);s._basev=rt.random.random(3);const b=rt.first(object('obj_growtangle'));if(b&&s._yloc>=b.y)s._basev*=-1;}
  if(s.btimer>=20&&s.btimer%1===0){s.sinbul??=[];for(let i=0;i<2;i++){const b=rt.create(object('obj_bullet_sin'),s._xloc,s._yloc);s.sinbul[i]=b.id;const size=s.special/10;Object.assign(b,{_afterimages:1,updateangle:0,imageXscale:2-size,imageYscale:2-size,timefactory:.7,hspeed:s._hsp,amplitudex:0,amplitudey:i===1?-25:25,imageAngle:180,basevspeed:s._basev});if(size>=1.6)b.active=0;if(s.special===0)Object.assign(b,{sprite:'spr_spadebullet',updateangle:1,imageXscale:1,imageYscale:1});bulletInherit(s,b);}s.special++;}
  if(s.btimer>=40){s.btimer=0;s.special=0;}return true;
 };
 const controller=createChapter2BulletController(object,[pattern]);
 const sine:GmObjectDef={...object('obj_bullet_sin'),events:{
  create:(s,rt)=>{object('obj_collidebullet').events!.create!(s,rt);Object.assign(s,{sinerx:0,sinery:0,amplitudex:0,amplitudey:20,timefactorx:1,timefactory:1,basehspeed:0,basevspeed:0,updateangle:1,imageAngle:180,_afterimages:0});},
  step:(s,rt)=>{object('obj_collidebullet').events!.step!(s,rt);s.sinerx++;s.sinery++;if(s.amplitudex!==0)s.hspeed=Math.sin(s.sinerx*s.timefactorx)*s.amplitudex+s.basehspeed;if(s.amplitudey!==0)s.vspeed=Math.sin(s.sinery*s.timefactory)*s.amplitudey+s.basevspeed;if(s.updateangle)s.imageAngle=s.direction;if(s._afterimages){const a=afterImage(s,rt);a.imageAlpha=.5;}},
 }};return [controller,sine];
}
