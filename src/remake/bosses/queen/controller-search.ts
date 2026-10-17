import type {GmInstance,GmRuntime} from '../../gm/runtime';
import {type QueenObject,queenInstance} from './context';

/** ImageSearch, regular/buffered variants and the original birthday variant. */
export function queenSearchPattern(s:GmInstance,rt:GmRuntime,object:QueenObject){
 const box=queenInstance(rt,object,'obj_growtangle'),rand=(a:number,b:number)=>rt.random.randomRange(a,b),sign=()=>rt.random.irandom(1)*2-1;
 if(s.bufferattack&&!rt.exists(object('obj_queen_buffercontroller'))){
  const b=rt.create(object('obj_queen_buffercontroller'),box.x,rt.view.y+60);s.bc=b.id;
  if(s.type===0){rt.globals.turntimer+=40;s.special=4;s.made=-4;b.bufferdelay=161;b.bufferduration=45;}else if(s.special%2===1){b.bufferdelay=150;b.bufferduration=45;}
 }
 if(s.init===1){
  if(s.special===4){s.side=rt.random.irandom(1)+1;if(s.bufferattack&&s.side===2){const b=rt.byId(s.bc);if(!b)throw Error('Queen search buffering controller missing');b.bufferdelay-=10;}}
  else if(s.special===5)s.side=0;else if(s.special>=2&&s.special%2===0)s.side=rt.random.choose(-2,-1,0);else s.side=rt.random.choose(-2,-1);
  s.lastside=s.side;s.init=2;if(s.special>=2)s.made=-2;
 }
 if(s.special>1&&s.made<=0&&(s.btimer>=7||(s.special===4&&s.btimer>=3))){
  if(s.special===3&&s.bufferattack){if(s.made===-2){s.xx=box.x+150;s.yy=box.y;}if(s.made===-1){s.xx=box.x-150;s.yy=box.y;}if(s.made===0){s.xx=box.x;s.yy=box.y-150;}}
  else if(s.special===4){
   if(s.made===-1){s.xx=box.x+150;s.yy=box.y+(s.made===s.side?rand(20,-40):0);}
   else if(s.made===0){s.xx=box.x-150;s.yy=box.y+(s.made===s.side?rand(20,-40):0);}
   else{s.yy=box.y+rand(-180,70);if(s.yy>box.y-130)s.xx=box.x+rand(200,250)*sign();else s.xx=box.x+rt.random.irandom(250)*sign();}
  }else if(s.special===5){if(s.made===-2){s.xx=box.x+150;s.yy=box.y;}if(s.made===-1){s.xx=box.x-150;s.yy=box.y;}}
  else if(s.special%2===0){if(s.made===-2){s.xx=box.x+150;s.yy=box.y+rand(20,-40);}if(s.made===-1){s.xx=box.x-150;s.yy=box.y+rand(20,-40);}if(s.made===0){s.xx=box.x+rand(-60,60);s.yy=box.y-(s.side===s.made?140:100);}}
  else{if(s.made===-2){s.xx=box.x+150;s.yy=box.y+(s.made===s.side?0:rand(20,-40));}if(s.made===-1){s.xx=box.x-150;s.yy=box.y+(s.made===s.side?0:rand(20,-40));}if(s.made===0){s.xx=box.x+sign()*60;s.yy=box.y-100;}}
 }else if(s.btimer>=(s.special===2?40:60)){
  s.btimer=0;let side;if(s.special===0)side=0;else{side=rt.random.irandom(s.made===0?2:1);if(side===s.lastside)side=2;}
  if(s.special%2===0){if(side===0){s.xx=box.x+150;s.yy=box.y+rand(20,-40);}if(side===1){s.xx=box.x-150;s.yy=box.y+rand(20,-40);}if(side===2){s.xx=box.x+rand(-100,100);s.yy=box.y-140;}}
  else{if(side===0){s.xx=box.x+150;s.yy=box.y;}if(side===1){s.xx=box.x-150;s.yy=box.y;}if(side===2){s.xx=box.x;s.yy=box.y-100;}}
  s.lastside=side;s.side=0;
 }else return;
 const d=rt.create(object(s.special===99?'obj_queen_search_window_bday':'obj_queen_search_window'),s.xx,s.yy);s.d=d.id;
 if(s.special===4)d.search=s.made===s.side?1:s.made>0?2:-1;
 else if(s.special===5){d.search=s.made===s.side?2:3;if(s.made===1)s.made=3;}
 else if(s.special===99){d.search=s.made===-2?3:4;if(s.made===1)s.made=3;}
 else if(s.special%2===0){if(s.made>0)d.quick=true;d.search=s.made===s.side||s.made>0?1:-1;}
 else if(s.special%2===1){if(s.made>0)d.quick=true;d.search=s.made===s.side||s.made>0||s.bufferattack?2:-1;if(s.bufferattack)d.spawndelay=14-s.made*7;}
 d.damage=s.damage;d.target=s.target;
 if(s.special<2&&s.made<3){s.made=3;d.firsttime=true;s.btimer=-30;}else{s.made++;s.btimer=0;}
 if(s.made<3&&s.special===5)s.btimer=-120;
}
