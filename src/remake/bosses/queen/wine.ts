// Queen's wine attack: the glass the box turns into, the acid that fills it from the droplets, the waves on its
// surface, the hurtbox that rises with it and the push that keeps the soul inside. Objects: obj_queen_wineglass,
// obj_queen_winewave, obj_queen_wineflass_pushin and obj_queen_wine_attack_bottom_hurtbox.
import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {bulletInit,damage,damageAll} from '../../deltarune/battle';
import {gt,ge,le,lt,lengthdirX,lengthdirY,lerp,pointDirection} from '../../gm/math';
import {C} from '../../gm/graphics';
import {snd} from '../../deltarune/sound';
import {drawInBox} from './shared';
import {type QueenObject,queenInstance} from './context';

/** The last threshold the fill is over picks the value (the source's chains of ifs, in order). */
function byFill(fill:number,start:number,steps:readonly (readonly [number,number])[]){
 let v=start;for(const [over,value] of steps)if(gt(fill,over))v=value;return v;
}

export function createQueenWine(object:QueenObject):GmObjectDef[]{
 const glassOf=(rt:GmRuntime)=>queenInstance(rt,object,'obj_queen_wineglass');
 const controllerType=(rt:GmRuntime)=>queenInstance(rt,object,'obj_queen_bulletcontroller').type;
 const hurtbox:GmObjectDef={...object('obj_queen_wine_attack_bottom_hurtbox'),events:{
  create:(s,rt)=>{
   bulletInit(s);Object.assign(s,{wall_destroy:1,imageAlpha:1,sprite:'spr_hitbox_10px',imageXscale:40,imageYscale:20,visible:false,destroyonhit:0,grazed:0});
   const q=rt.first(object('obj_queen_enemy'));if(q)s.damage=rt.globals.monsterat[q.myself]*5;
   const c=rt.first(object('obj_queen_bulletcontroller'));if(c)s.target=c.target;
   s.grazepoints=4;
  },
  step:(s,rt)=>{
   if(s.grazed===1){s.grazetimer+=1;if(s.grazetimer>=30){s.grazetimer=0;s.grazed=0;}}
   if(s.wall_destroy===1){
    const vx=rt.view.x,vy=rt.view.y;
    if(lt(s.x,vx-80))rt.destroy(s);if(gt(s.x,vx+760))rt.destroy(s);if(lt(s.y,vy-80))rt.destroy(s);if(gt(s.y,vy+580))rt.destroy(s);
   }
   if(s.updateimageangle===1)s.imageAngle=s.direction;
  },
  // Touching the acid: a hit loses the no-damage reward of the second wine attack.
  user5:(s,rt)=>{
   if(s.active!==1)return;
   const q=queenInstance(rt,object,'obj_queen_enemy');if(q.beatwine2nodamage===1)q.beatwine2nodamage=0;
   if(s.target!==3)damage(s,rt);if(s.target===3)damageAll(s,rt);
   if(s.destroyonhit===1)rt.destroy(s);
  },
 }};
 const pushin:GmObjectDef={...object('obj_queen_wineflass_pushin'),events:{
  create:(s,rt)=>{
   const w=glassOf(rt);
   Object.assign(s,{imageIndex:1,imageSpeed:0,imageAngle:w.imageAngle,imageXscale:w.imageXscale,imageYscale:w.imageYscale,x:w.x,y:w.y,visible:false});
   s.depth=queenInstance(rt,object,'obj_growtangle').depth+2;
  },
  // Ten one-pixel steps toward the glass's centre while the soul is outside its inside.
  step:(s,rt)=>{
   const w=glassOf(rt);Object.assign(s,{imageAngle:w.imageAngle,imageXscale:w.imageXscale,imageYscale:w.imageYscale,x:w.x,y:w.y});
   const h=rt.first(object('obj_heart'));if(!h)return;
   for(let n=0;n<10;n++)if(!rt.placeMeeting(s,s.x,s.y,object('obj_heart'))){
    h.x+=lengthdirX(1,pointDirection(h.x,h.y,w.x,w.y));h.y+=lengthdirY(1,pointDirection(h.x,h.y,w.x,w.y));
   }
  },
  draw:()=>{},
 }};
 const wave:GmObjectDef={...object('obj_queen_winewave'),events:{
  create:(s,rt)=>{Object.assign(s,{xspeed:4,rise:20,siner:0,alpha2:1});s.depth=queenInstance(rt,object,'obj_growtangle').depth+1;},
  // The wave moves, rises with the acid and wraps around the glass in Draw.
  draw:(s,rt)=>{
   const w=glassOf(rt);
   s.x+=s.xspeed;
   if(lt(s.xspeed,0)){if(gt(w.fill,36)&&gt(s.rise,1))s.rise--;}
   else if(gt(w.fill,36)&&gt(s.rise,3))s.rise--;
   const height=w.starty-w.fill;s.siner++;
   s.y=height+s.rise+Math.sin(s.siner/(Math.abs(s.xspeed)*4))*2;
   if(gt(s.x,w.xstart+75))s.x-=150;else if(lt(s.x,w.xstart-75))s.x+=150;
   const fix=11-w.fill/30,a=w.imageAngle,f=w.fill;s.visible=true;
   if(lt(a,-4)){
    const xx=byFill(f,0,[[30,a*.9],[35,a*.4],[40,a*.94],[45,a*.4],[51,a*-.4],[63,a*-.55],[70,a*-.5]]);
    const xx0=byFill(f,0,[[30,a*1.5],[35,a*.8],[40,a*1.1],[45,a*.8],[51,a*-.2],[63,a*-.21],[70,a*-.2]]);
    drawInBox(s,rt,w.xstart+xx-xx0,height-fix,142+xx,20);
   }else if(gt(a,4)){
    const middle:readonly (readonly [number,number,number])[]=controllerType(rt)===2.1?[[40,-.1,.1],[42,0,0],[49,0,0]]:[[40,-.5,.9],[42,-.6,1],[49,.4,-.2]];
    const steps:readonly (readonly [number,number,number])[]=[[30,-.6,1],...middle,[53,.6,-.5],[63,.6,-.2],[70,.6,0],[75,.6,.1],[77,.6,0],[80,.57,-.12],[84,.6,0]];
    const xx=byFill(f,0,steps.map(([o,k])=>[o,a*k] as const)),xx0=byFill(f,0,steps.map(([o,,k])=>[o,a*k] as const));
    drawInBox(s,rt,w.xstart-xx-xx0,height-fix,142+xx,20);
   }else drawInBox(s,rt,w.xstart,height-9,142,20);
  },
  user0:()=>{},
 }};
 const glass:GmObjectDef={...object('obj_queen_wineglass'),events:{
  create:(s,rt)=>{
   const box=queenInstance(rt,object,'obj_growtangle');
   Object.assign(s,{prefill:0,fill:0,state:0,timer:0,xx:0,yy:-10,starttimer:0});
   s.x=box.x;s.y=box.y+58;s.xstart=s.x;s.ystart=s.y;s.imageBlend=box.imageBlend;s.imageSpeed=0;s.depth=box.depth-1;s.imageXscale=2;s.imageYscale=2;
   s.acidColor=C.white;
   s.hurtbox=rt.create(hurtbox,s.x-100,400).id;
   rt.create(pushin,s.x,s.y);
   s.starty=s.y+53;
   const back=rt.create(wave,s.x,s.starty);s.winewave=back.id;back.depth=s.depth+3;back.xspeed=-3;back.imageBlend=s.acidColor;back.imageAlpha=.5;
   const front=rt.create(wave,s.x,s.starty);s.winewave2=front.id;front.depth=s.depth+1;front.imageBlend=s.acidColor;front.xspeed=4;
  },
  destroy:(s,rt)=>{for(const p of rt.withInstances(pushin))rt.destroy(p);rt.create(object('obj_queenshield_intro'),s.x,s.y);},
  endStep:(s,rt)=>{
   const h=rt.byId(s.hurtbox);if(!h)throw Error('obj_queen_wineglass lost its hurtbox');h.y=s.y+54-s.fill;
   const box=queenInstance(rt,object,'obj_growtangle');box.imageXscale=10;box.imageYscale=10;box.keep=0;
  },
  draw:(s,rt)=>drawGlass(s,rt),
  user0:()=>{},
 }};
 function drawGlass(s:GmInstance,rt:GmRuntime){
  const g=rt.globals,d=rt.drawState;
  s.starty=s.ystart+52;d.color=s.acidColor;s.starttimer++;
  if(s.starttimer===30)snd(rt,'snd_spearappear_choppy');
  if(s.starttimer===43){s.state=1;for(const p of rt.withInstances(pushin))p.visible=true;}
  const back=rt.byId(s.winewave),front=rt.byId(s.winewave2);if(!back||!front)throw Error('obj_queen_wineglass lost its waves');
  back.depth=s.depth+3;front.depth=s.depth+1;
  const mover=rt.first(object('obj_moveheart'));if(mover)mover.depth=s.depth-9999;
  const soul=rt.first(object('obj_heart'));if(soul)soul.depth=s.depth+2;
  if(s.state!==1)return;
  const xs=s.xstart,ys=s.ystart,a=s.imageAngle,abs=Math.abs(a),fill=s.fill;
  const bottom=Math.min(fill,25),top=Math.min(fill,36);
  let tx2=0,tx3=0,ty2=0,ty3=0;
  if(lt(bottom,18)){if(gt(a,5)){tx2=abs/3;tx3=-abs/2;}if(lt(a,-5)){tx3=abs/3;tx2=-abs/2;}}
  else if(lt(bottom,24)){if(gt(a,5)){tx2=abs/6;tx3=-abs/6;}if(lt(a,-5)){tx3=abs/6;tx2=-abs/6;}}
  else if(lt(bottom,26)){if(gt(a,5)){tx2=abs/3;tx3=-abs/6;}else if(lt(a,-5)){tx3=abs/6;tx2=-abs/6;}else{tx2=3;tx3=3;ty2=1;ty3=1;}}
  else if(gt(a,6)){tx2=abs*1.8;tx3=8;ty2=abs/2.04;ty3=abs/4;}
  else if(lt(a,-6)){tx3=abs*.85;tx2=7;ty3=abs/4;ty2=abs/4;}
  else{tx2=14;tx3=10;ty2=3;ty3=2;}
  // The acid in the glass's bowl.
  for(const lift of [0,2])rt.drawTriangle(xs+lengthdirX(52,a+270),ys+lift+lengthdirY(52,a+270),xs-3+tx2+lengthdirX(bottom*3,a+180),ys+50+ty2+lengthdirY(bottom*3,a+150),
   xs-tx3+lengthdirX(bottom*3,a),ys+52+ty3+lengthdirY(bottom*3,a+30));
  // Above the bowl, the surface leans with the glass.
  if(ge(fill,36)){
   if(ge(a,-2)&&le(a,2))rt.drawRect(xs-top*2,s.starty-35,xs+top*2,s.starty-fill);
   if(le(a,-2)){
    const fillA=lerp(36,fill,-a/33),bottomRight=Math.abs(a/5);
    const later:readonly (readonly [number,number])[]=controllerType(rt)===2.1?[[62,abs],[65,abs*1.2],[69,abs]]:[[62,abs*.8],[65,abs*.8],[69,abs*.8]];
    const topRight=byFill(fill,-5,[[40,abs/5],[50,abs/3],[57,abs/2.1],...later,[71,abs*1.1],[75,abs*1.2],[78,abs*1.3],[81,abs*1.5],[84,abs*1.6]]);
    const topLeft=byFill(fill,0,[[36,abs/2.3],[55,abs/8.3],[58,abs*-.24],[69,abs*-.2],[71,abs*-.1],[82,abs*.1]]);
    const bottomLeft=byFill(fill,0,[[36,abs/8],[81,abs/8]]);
    const p1=[xs-bottomLeft+lengthdirX(top*2,a+180),ys+55+lengthdirY(top*2,a+150)] as const,p3=[xs-topRight+lengthdirX(fillA*1.97,a),ys+52-fill] as const;
    rt.drawTriangle(...p1,xs-bottomRight+lengthdirX(top*2,a),ys+55+lengthdirY(top*2,a+30),...p3);
    rt.drawTriangle(...p1,xs+topLeft+lengthdirX(top*2,a+180),ys+52-fill,...p3);
   }
   if(ge(a,2)){
    const fillA=lerp(top,fill,a/33),bottomLeft=Math.abs(a/2.3);
    const topLeft=byFill(fill,0,[[40,abs/5.6],[47,abs/2.6],[50,abs/1.8],[52,abs/1.3],[57,abs/1.3],[63,abs*.99],[66,abs*1.09],[69,abs*1.2],[71,abs*1.35],[74,abs*1.49],[78,abs*1.65],[81,abs*1.76],[84,abs*1.83],[86.5,abs*1.96]]);
    const topRight=byFill(fill,0,[[36,abs/.3],[40,abs/2.3],[50,0],[54,abs/40],[60,abs*-.4],[69,abs*-.4],[71,abs*-.2],[80,abs*.15],[84,abs*.15]]);
    const e=ge(a,2)&&lt(a,7)?4:0;
    const bottomRight=byFill(fill,0,[[36,abs/2],[54,abs/4],[60,abs/4+e],[71,abs/8+e],[80,0]]),bottomRightY=gt(fill,80)?-3:0;
    const p1=[xs-1+bottomLeft+lengthdirX(top*2,a+180),ys+56+lengthdirY(top*2,a+150)] as const,p3=[xs-topRight+lengthdirX(top*2,a),ys+52-fill] as const;
    rt.drawTriangle(...p1,xs-bottomRight+lengthdirX(top*2.2,a),ys+55+bottomRightY+lengthdirY(top*2,a+30),...p3);
    rt.drawTriangle(...p1,xs+topLeft+lengthdirX(fillA*2,a+180),ys+52-fill,...p3);
   }
  }
  // Full: the turn ends.
  if(gt(s.fill,88)&&g.turntimer>2)g.turntimer=2;
  if(lt(s.fill,90)&&s.prefill>0){
   s.prefill--;s.fill++;
   if(s.fill===1){const h=rt.byId(s.hurtbox);if(h){h.damage=s.damage;h.target=s.target;}}
   if(lt(s.fill,36))s.fill+=1-bottom/36;
  }
  // The harder versions mark how high the acid may rise before the glass is safe.
  const difficulty=queenInstance(rt,object,'obj_queen_enemy').difficulty;
  const mark=(frame:number)=>rt.drawSprite('spr_queen_wine_box_fakeittillyoumakeit',frame,s.x,s.y,s.imageXscale,s.imageYscale,s.imageAngle,C.white,1);
  if(difficulty===1&&gt(s.fill,48))mark(0);
  if(difficulty===2){if(gt(s.fill,52))mark(0);if(gt(s.fill,76))mark(1);}
  rt.drawSelf(s);
 }
 return [glass,wave,pushin,hurtbox];
}
