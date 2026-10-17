import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {afterImage,bulletInit} from '../../deltarune/battle';
import {eq,lt,lengthdirX,lengthdirY,pointDirection} from '../../gm/math';
import {snd} from '../../deltarune/sound';
import {customAfterimage} from './shared';
import {type QueenObject,queenInstance} from './context';
const angularDistance=(a:number,b:number)=>Math.abs(((a-b+180)%360+360)%360-180);

export function createQueenExplosions(object:QueenObject):GmObjectDef[]{
 const buffering=(rt:GmRuntime)=>rt.first(object('obj_queen_buffercontroller'))?.buffering===1;
 const intro:GmObjectDef={...object('obj_queen_explodinghead_intro'),events:{
  create:s=>Object.assign(s,{imageSpeed:0,imageAlpha:.5,timer:0,length:70,place:0,place2:0,buffer:0,damage:0,target:0,laugh:0,first:0,bufferattack:0,ultimate:0}),
  step:(s,rt)=>{
   if(rt.globals.turntimer<2)rt.destroy(s);s.x=s.xstart+lengthdirX(s.length,s.place);s.y=s.ystart+lengthdirY(s.length,s.place);
   const count=s.first===1?3:1;for(let i=0;i<count;i++){s.place+=10;s.place2+=10;s.length-=2;}
   if(s.length<=0){rt.destroy(s);const d=rt.create(object('obj_queen_explodinghead'),s.x,s.y);s.d=d.id;d.buffer=s.bufferattack;d.damage=s.damage;d.target=s.target;d.ultimate=s.ultimate;d.laugh=1;}
  },
  draw:(s,rt)=>{rt.drawSelf(s);rt.drawSprite('spr_queen_wireframe',0,s.xstart+lengthdirX(s.length,s.place2+180),s.ystart+lengthdirY(s.length,s.place2+180),1,1,0,0xffffff,.5);},
 }};
 const head:GmObjectDef={...object('obj_queen_explodinghead'),events:{
  create:(s,rt)=>{
   Object.assign(s,{timer:24,imageYscale:1,imageXscale:1,scale:1,laugh:0,buffer:0,spawnbuffer:0,ultimate:0,imageSpeed:0,buffering:false,laughpause:false,laughsound:0});
   s.banana=rt.random.irandom(500)===1?rt.random.irandom(14):500;s.first=0;s.type=0;
   const c=queenInstance(rt,object,'obj_queen_bulletcontroller');if(c.type===6.1)s.type=1;if(c.init===2){s.first=1;c.init=3;}
  },
  step:(s,rt)=>{
   if(rt.globals.turntimer<2)rt.destroy(s);
   if(s.laugh&&buffering(rt)){if(s.laughpause===0&&rt.sourceAudio?.playing(s.laughsound)){s.laughpause=1;rt.sourceAudio.pause(s.laughsound);}return;}
   else if(s.laughpause===1){s.laughpause=0;rt.sourceAudio?.resume(s.laughsound);}
   if(s.timer===20){s.imageSpeed=1;s.sprite='spr_queen_wireframe_laugh';if(s.laugh===1)s.laughsound=snd(rt,'snd_queen_bitcrushlaugh');}
   s.timer--;if(s.first===1)s.timer--;
   if(s.timer===8&&s.buffer&&!rt.exists(object('obj_queen_buffercontroller'))){const bc=rt.create(object('obj_queen_buffercontroller'),0,0);bc.bufferdelay=15;bc.bufferduration=30;}
   if(s.timer===0){
    snd(rt,'snd_explosion_mmx3');const ultimate=s.ultimate===1,count=ultimate?10:s.type===0?14:9,angle=ultimate?36:s.type===0?25.71:40,jitter=ultimate?20:s.type===0?15:25;
    for(s.i=0;s.i<count;s.i++){
     const dir=s.i*angle+rt.random.irandom(jitter),spread=s.i%2===0?3:1,box=queenInstance(rt,object,'obj_growtangle');
     const name=s.i===s.banana&&angularDistance(dir,pointDirection(s.x,s.y,box.x,box.y))<=45?'obj_queen_bananabullet':'obj_queen_bufferbullet';
     const d=rt.create(object(name),s.x+lengthdirX(spread,dir),s.y+lengthdirY(spread,dir));s.d=d.id;d.direction=dir;
     d.speed=ultimate?10+rt.random.random(4):s.type===0?9+rt.random.random(4):s.buffer?12:7+rt.random.random(4);
     const h=queenInstance(rt,object,'obj_heart');if(Math.abs(d.direction-pointDirection(s.x,s.y,h.x,h.y))<22)d.speed/=1.5;
     d.imageXscale=ultimate?2:1.5;d.imageYscale=ultimate?2:1.5;d.fadeaway=1;d.sprite='spr_queen_wireframe_temp_bullet';if(s.buffer===0)d.slowdown=1;
    }
    const d=rt.create(object('obj_buffer_tempeffect'),s.x,s.y);s.d=d.id;d.sprite='spr_queen_wireframe_explode';
   }
  },
  draw:(s,rt)=>{
   if(buffering(rt)){s.buffering=true;s.imageBlend=0x808080;rt.drawSelf(s);return;}else if(s.buffering&&!buffering(rt)){s.buffering=false;s.imageBlend=0xffffff;}
   if(lt(s.scale,1)){s.scale+=.1;s.imageXscale=s.scale;s.imageYscale=s.scale;s.imageAngle=s.scale*360;const a=customAfterimage(s,rt,object('obj_buffer_afterimage'));s.af=a.id;a.imageAlpha=.5;}
   if(s.timer>0)rt.drawSelf(s);
  },
 }};
 const blow:GmObjectDef={...object('obj_queen_spadeblow'),events:{
  create:s=>Object.assign(s,{timer:0,timer2:0,bulletcount:0,bulletcount2:0,con:0,siner:0,imageYscale:0,imageXscale:0,scale:0,blowing:0,imageSpeed:0,blowstate:0,original_image_speed:-1,place1:270,place2:270,difficulty:0}),destroy:(_s,rt)=>{for(const b of rt.withInstances(object('obj_queen_spadeblow_bullet')))rt.destroy(b);},
  draw:(s,rt)=>{
   rt.drawSelf(s);if(lt(s.scale,1)){s.scale+=.1;s.imageXscale=s.scale;s.imageYscale=s.scale;s.imageAngle=s.scale*360;const a=afterImage(s,rt);s.af=a.id;a.imageAlpha=.5;if(eq(s.scale,1))s.imageSpeed=1/6;}
   if(s.sprite==='spr_queen_wireframe_blow'&&s.imageIndex>2){s.imageIndex=2;s.imageSpeed=0;}
   if(eq(s.scale,1)){s.timer++;s.timer2++;s.siner+=.4;if(s.difficulty===0)s.siner+=.1;s.place1=270+Math.sin(s.siner/6)*33.3;s.place2=270+Math.sin((s.siner+50)/6)*33.3;}
   const shot=(type:number)=>{const d=rt.create(object('obj_queen_spadeblow_bullet'),s.x,s.y);s.d=d.id;d.damage=queenInstance(rt,object,'obj_queen_bulletcontroller').damage;d.type=type;d.imageAngle=queenInstance(rt,object,'obj_queen_spadeblow')[type===1?'place1':'place2'];};
   if(s.timer>9){s.bulletcount++;if(s.bulletcount===4){s.timer=3;s.bulletcount=0;}else{shot(1);s.timer=5;}}
   if(s.timer2>9&&s.difficulty===1){s.bulletcount2++;if(s.bulletcount2===4){s.timer2=3;s.bulletcount2=0;}else{shot(2);s.timer2=5;}}
   if(rt.globals.turntimer<3)rt.destroy(s);
  },
 }};
 const spade:GmObjectDef={...object('obj_queen_spadeblow_bullet'),events:{
  create:(s,rt)=>{bulletInit(s);Object.assign(s,{destroyonhit:1,imageXscale:1,imageYscale:1,depth:queenInstance(rt,object,'obj_heart').depth-1,afterimage:0,fadeaway:0,slowdown:0,timer:0,rotator_target:-1,length:2,type:1});const q=rt.first(object('obj_queen_enemy'));if(q)s.damage=rt.globals.monsterat[q.myself]*5;const c=rt.first(object('obj_queen_bulletcontroller'));if(c)s.target=c.target;s.grazepoints=3;},
  step:(s,rt)=>{s.rotator_target=object('obj_queen_spadeblow');s.length+=6;const source=queenInstance(rt,object,'obj_queen_spadeblow');if(s.type===1||s.type===2){const place=source[s.type===1?'place1':'place2'];s.x=source.x+lengthdirX(s.length,place);s.y=source.y+lengthdirY(s.length,place);s.imageAngle=place;}if(s.y>=rt.view.y+300){s.imageAlpha-=.1;if(s.imageAlpha<=0)rt.destroy(s);}},
  draw:(s,rt)=>rt.drawSelf(s),
 }};
 return [intro,head,blow,spade];
}
