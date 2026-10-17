import {gmArray,type GmInstance,type GmRuntime} from '../../gm/runtime';
import {bulletInit,moveHeartIn} from '../../deltarune/battle';
import {lengthdirX,lengthdirY} from '../../gm/math';
import {button1_p,held,KEY} from '../../deltarune/keys';
import {type QueenObject,queenInstance} from './context';
export function queenWinePattern(s:GmInstance,rt:GmRuntime,object:QueenObject){
 const box=()=>queenInstance(rt,object,'obj_growtangle'),glass=()=>queenInstance(rt,object,'obj_queen_wineglass');
 if(s.init===1){
  s.init=2;s.btimer=30;const d=rt.create(object('obj_queen_wineglass'),s.x,s.y);s.d=d.id;d.damage=s.damage;d.target=s.target;if('element' in s)d.element=s.element;d.xx=s.x+20;d.yy=s.y+37;
  if(s.type===2.1){s.threshold=8;s.wineadd=4;s.turnamount*=1.2;queenInstance(rt,object,'obj_queen_enemy').beatwine2nodamage=1;}
  if(s.type===2.2){s.threshold=6;s.wineadd=3;s.turnamount*=2;}
 }
 if(s.init!==3&&s.init!==4)return;
 if(s.init===3){s.init=4;for(const m of rt.withInstances(object('obj_heartmarker')))rt.destroy(m);rt.create(object('obj_heartmarker'),box().x-8,box().y+30);moveHeartIn(rt);}
 if((s.btimer>=s.threshold+s.wineadded/12&&s.winedebug===0)||(s.winedebug===1&&button1_p(rt))){
  const d=rt.create(object('obj_queen_wine_attack_droplet'),s.x,s.y);gmArray(s,'droplet')[s.dropletcount]=d.id;bulletInit(d);d.destroyonhit=0;
  const heart=rt.first(object('obj_heart'));if(heart)d.depth=heart.depth;
  Object.assign(d,{sprite:'spr_dropletbullet',ydist:280,active:1,xdist:-65+rt.random.random(130),timefrommade:0,fakespeed:2,boss:glass().id});
  const q=rt.first(object('obj_queen_enemy'));if(q)d.damage=rt.globals.monsterat[q.myself]*5;
  const c=rt.first(object('obj_queen_bulletcontroller'));if(c)d.target=c.target;d.grazepoints=4;s.dropletcount++;s.btimer=0;
 }
 for(s.i=0;s.i<s.dropletcount;s.i++){
  const d=rt.byId(s.droplet[s.i]);if(!d)continue;const w=glass();d.fakespeed+=.2;d.timefrommade+=d.fakespeed;d.imageAngle=w.imageAngle;
  d.x2=w.x+lengthdirX(d.ydist-d.timefrommade,d.imageAngle+90);d.y2=w.y+lengthdirY(d.ydist-d.timefrommade,d.imageAngle+90);
  d.x3=d.x2+lengthdirX(d.xdist,d.imageAngle);d.y3=d.y2+lengthdirY(d.xdist,d.imageAngle);d.y=d.y3;d.x=d.x3;
  if(d.y3>=w.y+70+(75-Math.abs(d.xdist))/1.7){w.prefill+=queenInstance(rt,object,'obj_queen_bulletcontroller').wineadd;queenInstance(rt,object,'obj_queen_bulletcontroller').wineadded++;rt.destroy(d);}
 }
 s.ctimer++;if(s.type===2.1||s.type===2.2||s.type===2.3){
  if(s.winedebug===0)glass().imageAngle=Math.sin(s.ctimer/s.turnperiod)*s.turnamount;
  else{if(held(rt,KEY.x,KEY.shift))glass().imageAngle+=.5;if(held(rt,KEY.c,KEY.ctrl))glass().imageAngle-=.5;}
  s.imageAngle=glass().imageAngle;
 }
 if(s.winedebug===1)rt.globals.turntimer=100;
}
