import {gmArray,type GmObjectDef} from '../../gm/runtime';
import {bulletInit} from '../../deltarune/battle';
import {type QueenObject,queenInstance} from './context';

export function createQueenBerdly(object:QueenObject):GmObjectDef[]{
 const tornado:GmObjectDef={...object('obj_berdly_tornadomaker_tornado'),events:{
  create:(s,rt)=>{bulletInit(s);if(!rt.exists(object('obj_heart')))rt.destroy(s);Object.assign(s,{timer:0,con:0,siner:0,maxhspeed:8,accel:1,imageXscale:1.15,imageYscale:1.15,init:0,active:1,damage:1,howlong:20,howfar:0,flipSpeed:4,flipTimer:0});const q=rt.first(object('obj_queen_enemy'));if(q)s.damage=rt.globals.monsterat[q.myself]*5;const c=rt.first(object('obj_queen_bulletcontroller'));if(c)s.target=c.target;s.grazepoints=3;},
  step:(s,rt)=>{
   if(s.init===0){s.remhspeed=s.hspeed;s.remy=s.y;const b=rt.first(object('obj_growtangle'));s.yspot=b?b.y+rt.spriteHeight(s)*s.howfar:240;s.init=1;}
   if(s.con===0){s.timer++;const t=Math.min(1,s.timer/s.howlong);s.y=s.remy+(s.yspot-s.remy)*t;s.hspeed=s.remhspeed+(s.maxhspeed-s.remhspeed)*t;if(s.timer>=s.howlong){s.con=1;s.timer=0;}}
   if(s.con===1){s.hspeed+=Math.sign(s.hspeed)*.25;s.timer++;if(s.timer>=30){s.active=0;s.imageAlpha-=.1;}if(s.imageAlpha<=0)rt.destroy(s);}
  },
  draw:(s,rt)=>{s.xflip=1.1;if(s.flipTimer<0)s.xflip=-1.1;s.flipTimer++;if(s.flipTimer>=s.flipSpeed)s.flipTimer=-s.flipSpeed;rt.drawSprite(s.sprite,0,s.x,s.y,s.xflip,1.1,0,s.imageBlend,s.imageAlpha);},
 }};
 const maker:GmObjectDef={...object('obj_berdly_tornadomaker'),events:{
  create:s=>{Object.assign(s,{timer:0,imageSpeed:0,imageXscale:2,imageYscale:2,con:0,difficulty:1,tornadocount:5,lerpintimer:0,sprite:'spr_berdlyattack_queen'});s.y-=200;},
  destroy:(_s,rt)=>{queenInstance(rt,object,'obj_berdlyplug_enemy').con=2;},
  step:(s,rt)=>{
   if(rt.globals.turntimer<1)rt.destroy(s);
   if(s.difficulty!==3&&s.lerpintimer<16){s.y=s.ystart-200+(s.ystart+20-(s.ystart-200))*s.lerpintimer/15;s.lerpintimer++;}
   if(s.difficulty===3&&s.lerpintimer<11){s.y=s.ystart-200+(s.ystart+20-(s.ystart-200))*s.lerpintimer/10;s.lerpintimer++;}
   if(s.con===0){s.imageIndex=0;s.timer++;s.remx=s.x;s.remy=s.y;s.timerthreshold=s.difficulty===3?10:15;if(s.timer>=s.timerthreshold){s.timer=0;s.con=1;}}
   if(s.con===1){s.x=s.remx+rt.random.randomRange(-2,2);s.y=s.remy+rt.random.randomRange(-2,2);s.imageIndex=1;s.timer++;if(s.timer>=15){s.timer=0;s.x=s.remx;s.y=s.remy;s.con=2;s.imageIndex=2;}}
   if(s.con===2){
    s.con=3;
    const pair=(i:number,variance:number,time:number,far:number)=>{
     const l=rt.create(tornado,s.x,s.y-20+i*20);s.tornadol=l.id;l.maxhspeed=6;l.hspeed=-12+variance;l.howlong=32+i*8+time;l.howfar=far;
     const r=rt.create(tornado,s.x,s.y-20+i*20);s.tornador=r.id;r.maxhspeed=-6;r.hspeed=12+variance;r.howlong=32+i*8+time;r.howfar=far;
    };
    if(s.difficulty===0)for(s.i=0;s.i<3;s.i++)pair(s.i,0,0,-1+s.i);
    if(s.difficulty===1||s.difficulty===3||s.difficulty===2){
     const order=gmArray(s,'yorder');order[0]=0;order[1]=0;order[2]=0;order[rt.random.choose(0,1,2)]=1;s.chosen=0;
     while(s.chosen===0){s.nextyorder=rt.random.choose(0,1,2);if(order[s.nextyorder]===0){order[s.nextyorder]=2;s.chosen=1;}}
     if(s.difficulty===2){for(s.i=0;s.i<3;s.i++){s.hvariance=rt.random.random(2)*rt.random.choose(-1,1);s.timevariance=rt.random.random(4);pair(s.i,s.hvariance,s.timevariance,-1+order[s.i]);}}
     else{s.hvariance=rt.random.randomRange(-1,1);for(s.i=0;s.i<3;s.i++)pair(s.i,s.hvariance,0,-1+order[s.i]);}
    }
   }
   if(s.con===3){s.timer++;s.timerthreshold=s.difficulty===3?24:33;if(s.timer>=2)s.imageIndex=3;if(s.timer>=4)s.imageIndex=4;if(s.timer>=s.timerthreshold){s.imageIndex=0;s.timer=0;s.con=0;}}
  },
 }};
 const wire:GmObjectDef={...object('obj_queen_berdlywireattack'),events:{
  create:(s,rt)=>{Object.assign(s,{imageSpeed:0,m:2,hangx:26,hangy:-58,init_hangy:-58,remx:26,hangsparktimer:0,shootmode:2,xmovement_finished:0,targetx:rt.view.x+260,hangvspeed:0,hanghspeed:0,hangcon:1,hangsiner:0,sprite:'spr_cutscene_25_berdly_plug',imageXscale:2,imageYscale:2,active:false});rt.globals.turntimer=170;},
  destroy:(s,rt)=>{const b=queenInstance(rt,object,'obj_berdlyplug_enemy');b.x=s.x;b.y=s.y;b.xx=s.x;b.yy=s.y;b.con=3;b.visible=true;},
  step:(s,rt)=>{
   if(s.hangcon===1){s.hangvspeed-=s.m;s.hangy+=s.hangvspeed;if(s.y+s.hangy<=rt.view.y+60){s.hangcon=2;s.hangtimer=0;}}
   if(s.hangcon===2){s.hangy+=s.hangvspeed;if(Math.abs(s.hangvspeed)>=0)s.hangvspeed*=.5;if(Math.abs(s.hangvspeed)<=1){s.hangvspeed=0;s.hangcon=3;}}
   if(s.hangcon>=1&&s.hangcon<=3&&s.xmovement_finished===0){s.x-=(s.x-s.targetx)/(6*s.m);if(s.x<=s.targetx+2){s.x=s.targetx;s.xmovement_finished=1;}}
   if(s.hangcon===3&&s.xmovement_finished===1)s.hangcon=4;
   if(s.hangcon>=2&&s.hangcon<5&&rt.globals.turntimer>=30){s.hangsparktimer++;if(s.hangsparktimer>=6){s.hangsparktimer=0;s.shootcount=0;const d=rt.create(object('obj_queen_berdlyfeather'),s.x+s.hangx,s.y+s.hangy+80);gmArray(s,'bullet')[s.shootcount]=d.id;Object.assign(d,{damage:5,stretch:0,imageSpeed:.2,hspeed:-3+rt.random.random(6),depth:s.depth-1,vspeed:-9+rt.random.random(2),gravity:.5});}}
   if(s.hangcon===4){s.hangsiner+=s.m;s.x+=Math.sin(s.hangsiner/12)*3;if(rt.globals.turntimer<=20)s.hangcon=5;}
   if(s.hangcon===5){s.hangy-=(s.hangy-s.init_hangy)/(8/s.m);if(s.hangy>=s.init_hangy-4)s.hangy=s.init_hangy;s.x-=((s.x-s.remx)/(8/s.m))-1;if(s.x>=s.remx-1)s.x=s.remx;if(s.hangy===s.init_hangy&&s.x===s.remx){s.hangcon=0;s.sprite='spr_cutscene_25_berdly_plug';}}
  },
 }};
 return [tornado,maker,wire];
}
