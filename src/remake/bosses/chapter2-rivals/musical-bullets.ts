import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {bulletInit,collideBullet,heart,growtangle,afterImage,afterimageGrow} from '../../deltarune/battle';
import {pointDirection} from '../../gm/math';
import {lerpEaseOut} from '../../deltarune/ease';
/** These effects intentionally update in their original event: dancers fire during Draw. */
export function createMusicalBullets(object:(name:string)=>GmObjectDef):GmObjectDef[]{
 const spawn=(s:GmInstance,rt:GmRuntime,name:string,x:number,y:number)=>rt.create(object(name),x,y);
 const note:GmObjectDef={...object('obj_musical_note_bullet'),parent:collideBullet,events:{
  create:s=>{bulletInit(s);Object.assign(s,{destroyable:1,f:2,bultype:0,angle_speed:0,destroypoints:1,timer:0,copymake:0,grow:0,growtimer:0,growb:0});},
  step:(s,rt)=>{
   s.timer++;if(s.timer>90){s.active=0;s.imageAlpha-=.25;if(s.imageAlpha<0)rt.destroy(s);}
   if(s.copymake>0){const child=spawn(s,rt,note.name,s.x,s.y);for(const key of ['damage','grazepoints','timepoints','inv','target','grazed','grazetimer'])if(s[key]!==-1)child[key]=s[key];child.element=s.element;Object.assign(child,{grazepoints:.1,timepoints:.01,timer:87,sprite:s.sprite,depth:s.depth+1,imageAngle:s.imageAngle});s.copymake--;}
   if(s.grow){s.growtimer++;s.imageXscale=lerpEaseOut(.2,1.5,s.growtimer/10,-2);s.imageYscale=lerpEaseOut(.2,1.5,s.growtimer/10,-2);if(s.growtimer>=10)s.grow=0;}
   if(s.growb){s.imageXscale+=Math.sin(s.timer/2)*.04+.012;afterImage(s,rt).imageAlpha=.5;}
  },
 }};
 const segment:GmObjectDef={...object('obj_musical_note_bullet_segment'),parent:collideBullet,events:{
  create:s=>{bulletInit(s);Object.assign(s,{destroyable:1,f:2,angle_speed:0,destroypoints:1,timer:0});},
  step:(s,rt)=>{s.timer++;if(s.timer>90){s.imageAlpha-=.05;if(s.imageAlpha<0)rt.destroy(s);}if(s.imageXscale<.75)s.imageXscale+=.01;},
 }};
 const dancer:GmObjectDef={...object('obj_musicenemy_dancer'),events:{
  create:(s,rt)=>{Object.assign(s,{imageXscale:1,imageYscale:1,siner:0,sinerb:0,frame:0,timer:0,bodyflip:1,headimage:2,buffer:0,bultype:0});const list=rt.all(object(s.object.name));if(list[1]?.id===s.id)s.headimage=5;if(list[2]?.id===s.id)s.headimage=8;Object.assign(s,{headframe:0,active:0,shoottimer:-s.headimage*4});},
  draw:(s,rt)=>{
   if(rt.globals.turntimer<1)rt.destroy(s);
   if(s.sprite){rt.drawSprite(s.sprite,1,s.x,s.y,s.imageXscale*s.bodyflip,s.imageYscale,0,0xffffff,s.imageAlpha);rt.drawSprite(s.sprite,s.headimage+s.headframe,s.x+Math.sin(s.siner/3)*2,s.y,s.imageXscale,s.imageYscale,0,0xffffff,s.imageAlpha);}
   s.siner++;s.x+=Math.sin(s.siner/8)*3;s.timer++;if(s.timer>=11){s.frame=1;s.timer=0;}if(s.frame===1){s.bodyflip*=-1;s.frame=0;}
   if(s.shoottimer>=22){s.active=1;s.shoottimer-=22;}s.buffer--;
   if(s.active===1){if(s.headframe===0&&s.buffer<=0){s.buffer=2;const b=spawn(s,rt,note.name,s.x,s.y-40);s.bul=b.id;b.gravity=.5+rt.random.random(.1);b.imageXscale=1;b.imageYscale=1;b.imageAngle=0;b.vspeed=-3;b.hspeed=rt.random.randomRange(-4,4);b.bultype=s.bultype;
    const solid=rt.first(object('obj_battlesolid'));if(solid)b.hspeed=s.x<solid.x?rt.random.random(4):-rt.random.random(4);if(s.bultype===1)b.hspeed=rt.random.choose(-4,4);
    b.friction=.1;b.depth=rt.first(object('obj_musicenemy_boombox'))!.depth-100;Object.assign(b,{active:1,depth:-100,copymake:90,damage:s.damage,target:s.target,sprite:'spr_bullet_laser_circle'});s.headframe=1;}
    s.headframe+=.25;if(s.headframe>=2.5)s.active=0;
   }else s.headframe=0;
  },
 }};
 const speaker:GmObjectDef={...object('obj_musicenemy_boombox'),events:{
  create:s=>Object.assign(s,{siner:0,buffer:0,makebullet:0,type:0,singlenote:0,segmentcount:0,segmentcountmax:0,angleoffset:0,makelong:0,makelongtimer:9,remlightningy:-100,lightningvary:0}),
  step:(s,rt)=>{
   if(rt.globals.turntimer<1){rt.destroy(s);return;}s.siner++;s.imageYscale=1-Math.abs(Math.sin(s.siner/5))*.1;s.buffer--;
   const shot=()=>{const b=spawn(s,rt,note.name,s.x,s.y-rt.spriteHeight(s)+90);s.bullet=b.id;return b;};
   if(s.makebullet>0){
    if(s.makebullet===1){const b=shot(),h=rt.first(heart)!;b.direction=pointDirection(b.x,b.y,h.x+8,h.y+8);b.speed=3.5;Object.assign(b,{depth:s.depth-10,grow:1,active:1,damage:s.damage,target:s.target});if(rt.random.irandom(100)<50)b.y+=70;}
    if(s.makebullet===2){if(s.segmentcountmax===0){const b=shot(),box=rt.first(growtangle);if(box){if(s.lightningvary===0)b.y=box.y+rt.random.randomRange(-rt.spriteHeight(box)/2,0);if(s.lightningvary===1)b.y=box.y+rt.random.randomRange(0,rt.spriteHeight(box)/2);}
      const a=rt.create(afterimageGrow,b.x,b.y);b.afterimage=a.id;Object.assign(a,{sprite:b.sprite,imageIndex:b.imageIndex,imageBlend:b.imageBlend,imageSpeed:0,depth:b.depth,imageXscale:b.imageXscale,imageYscale:b.imageYscale,imageAngle:b.imageAngle});
      b.imageYscale=1;b.imageXscale=.4;b.speed=s.imageXscale;b.x-=s.imageXscale*13;b.friction=-.15;b.sprite='spr_electricity_wave';b.imageAngle=b.direction;Object.assign(b,{depth:s.depth-10,growb:1,imageAngle:90,copymake:0,active:1,damage:s.damage,target:s.target});s.lightningvary=s.lightningvary===0?1:0;
     }else s.makelong=1;}
    if(s.makebullet===3){const ds=rt.all(dancer);if(s.singlenote===1){for(const d of ds)d.bultype=0;for(const d of ds)if(d.headimage===[2,5,8][s.type])d.active=1;s.type++;if(s.type>2)s.type=0;}else for(const d of ds)Object.assign(d,{active:1,headframe:0,bultype:1});}
    s.buffer=2;
   }s.makebullet=0;
   if(s.makelong===1){s.makelongtimer++;if(s.makelongtimer>=4){let i=0;for(;i<4;i++){
     const b=spawn(s,rt,segment.name,s.x,s.y-rt.spriteHeight(s)+90);s.bullet=b.id;const box=rt.first(growtangle);if(box)b.y=box.y+rt.random.randomRange(-rt.spriteHeight(box)/2,rt.spriteHeight(box)/2);
     b.imageYscale=.75;b.imageXscale=.2;b.speed=s.imageXscale;b.x-=s.imageXscale*13;b.friction=-.2;b.speed=.37;b.y=s.y-45;Object.assign(b,{depth:s.depth-10,active:1,damage:s.damage,target:s.target});
     if(s.imageXscale<0)b.direction=s.direction+180+s.angleoffset+[-80,-40,0,40][i];
     else if(i<3)b.direction=s.direction+s.angleoffset+[-40,0,40][i]; // Source repeats a==0; the fourth bullet retains its default direction.
     b.imageAngle=b.direction;
    }if(s.segmentcount<s.segmentcountmax){s.segmentcount++;s.makelongtimer=0;}else Object.assign(s,{segmentcountmax:0,segmentcount:0,makelong:0,makelongtimer:0});}
   }
  },
 }};
 return [note,segment,dancer,speaker];
}
