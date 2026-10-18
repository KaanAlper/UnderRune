// Queen's electric box: plugs slide in, the box is wired and sways (or spins), shooting sparks from its sides while
// the soul is kept inside. Objects: obj_growtangle_electric, obj_growtangle_electric_pushin and obj_growtangle_spark.
import {motionAdd,resolveEvent,type GmInstance,type GmObjectDef,type GmRuntime} from '../../gm/runtime';
import {bulletInit} from '../../deltarune/battle';
import {bulletInherit2} from '../../deltarune/chapter2-battle';
import {ge,le,gt,lt,lengthdirX,lengthdirY,lerp,pointDirection} from '../../gm/math';
import {C} from '../../gm/graphics';
import {type QueenObject} from './context';

export function createQueenElectric(object:QueenObject):GmObjectDef[]{
 const boxDef=()=>object('obj_growtangle');
 const inherit=(s:GmInstance,rt:GmRuntime,event:'create'|'step')=>resolveEvent(s.object.parent,event)?.(s,rt);
 const spark:GmObjectDef={...object('obj_growtangle_spark'),events:{
  create:(s,rt)=>{inherit(s,rt,'create');s.timer=0;},
  // Flickers between two sizes at random angles.
  step:(s,rt)=>{
   inherit(s,rt,'step');s.timer++;
   if(s.timer===4){s.imageXscale=1.5;s.imageYscale=1.5;s.imageAngle=rt.random.random(360);}
   if(s.timer===8){s.timer=1;s.imageXscale=2;s.imageYscale=2;s.imageAngle=rt.random.random(360);}
  },
 }};
 const pushin:GmObjectDef={...object('obj_growtangle_electric_pushin'),events:{
  create:(s,rt)=>{const b=rt.first(boxDef())!;Object.assign(s,{imageIndex:1,imageSpeed:0,imageXscale:b.imageXscale-.4,imageYscale:b.imageYscale-.4,imageAngle:b.imageAngle,x:b.x,y:b.y,visible:false});},
  // Six one-pixel steps toward the box's centre while the soul is outside its inside.
  step:(s,rt)=>{
   const b=rt.first(boxDef())!;Object.assign(s,{imageXscale:b.imageXscale-.4,imageYscale:b.imageYscale-.4,imageAngle:b.imageAngle,x:b.x,y:b.y,visible:false});
   const h=rt.first(object('obj_heart'));if(!h)throw Error('obj_growtangle_electric_pushin needs obj_heart');
   for(let n=0;n<6;n++)if(!rt.placeMeeting(s,s.x,s.y,object('obj_heart'))){
    h.x+=lengthdirX(1,pointDirection(h.x,h.y,b.x,b.y));h.y+=lengthdirY(1,pointDirection(h.x,h.y,b.x,b.y));
   }
  },
 }};
 const electric:GmObjectDef={...object('obj_growtangle_electric'),events:{
  create:(s,rt)=>{
   bulletInit(s);s.destroyonhit=0;s.imageSpeed=.2;s.imageAlpha=0;s.active=0;
   const b=rt.first(boxDef());if(b){s.imageXscale=b.imageXscale;s.imageYscale=b.imageYscale;s.imageAngle=b.imageAngle;}else rt.destroy(s);
   rt.create(pushin,s.x,s.y);
   Object.assign(s,{timer:0,type:0,con:0,amplitude:0,maxamplitude:60,spinamplitude:0,plugx:120,plugalpha:0,shottimer:0,speedmode:1,xx:0,yy:0});
   const q=rt.first(object('obj_queen_enemy'));if(q)s.damage=rt.globals.monsterat[q.myself]*5;
   const c=rt.first(object('obj_queen_bulletcontroller'));if(c)s.target=c.target;
   s.grazepoints=4;
  },
  destroy:(s,rt)=>{for(const p of rt.withInstances(pushin))rt.destroy(p);},
  step:(s,rt)=>{
   if(s.grazed===1){s.grazetimer+=1;if(s.grazetimer>=30){s.grazetimer=0;s.grazed=0;}}
   const b=rt.first(boxDef());if(!b){rt.destroy(s);return;}
   // Plugging in: the plugs slide in, the box shakes, the current fades in.
   if(s.con===0){
    s.timer++;
    if(s.type===1){s.plugxend=-23;s.plugx=lerp(s.plugx,s.plugxend,.2);}else{s.plugxend=0;s.plugx=lerp(s.plugx,s.plugxend,.15);}
    s.plugalpha=lerp(s.plugalpha,1,.1);
    if(s.timer>=15&&s.timer<=25){
     b.x=b.xstart+rt.random.randomRange((-35+s.timer)/2,(35-s.timer)/2);b.y=b.ystart+rt.random.randomRange((-35+s.timer)/2,(35-s.timer)/2);
    }
    if(s.timer>=15){s.plugalpha=1;s.plugx=s.plugxend;s.imageAlpha+=.1;s.active=ge(s.imageAlpha,1)?1:0;}
    if(s.timer>=25){s.con=1;s.timer=0;s.plugx=0;}
   }
   // Live: the box sways (type 0) or spins (type 1) and sparks fly from its side.
   if(s.con===1){
    s.timer++;s.shottimer++;
    if(s.type===0)s.moveamount=Math.sin(s.timer/20)*s.amplitude;
    if(s.type===1)s.moveamount=1;
    s.shotthreshold=s.type===1?15:8;
    if(s.shottimer>=s.shotthreshold){
     s.shottimer=0;
     const l=rt.create(spark,-100,s.y);s.lightning=l.id;bulletInit(l);l.destroyonhit=1;
     if(s.speedmode===1){
      s.wx=lengthdirX(rt.spriteWidth(b)/2,s.imageAngle);s.wy=lengthdirY(rt.spriteWidth(b)/2,s.imageAngle);
      if(gt(s.moveamount,0)){l.x=s.x+s.xx+s.wx;l.y=s.y+s.yy+s.wy;l.gravityDirection=180+s.imageAngle;}
      if(lt(s.moveamount,0)){l.x=s.x+s.xx-s.wx;l.y=s.y+s.yy+s.wy;l.gravityDirection=s.imageAngle;}
      l.direction=l.gravityDirection+180;l.speed=5+rt.random.random(1);l.depth=s.depth-5;
      if(s.type===1)l.speed=6+rt.random.random(1);
      // Call arguments are evaluated right to left: the push's size, then its side.
      const push=rt.random.random(1.5);motionAdd(l,l.direction+rt.random.choose(90,270),push);
     }
     l.gravity=.3;l.imageXscale=1.5;l.imageYscale=1.5;
     const q=rt.first(object('obj_queen_enemy'));if(q)l.damage=rt.globals.monsterat[q.myself]*5;
     bulletInherit2(s,l);l.active=1;l.sprite='spr_growtangle_elecbullet';
    }
    if(s.timer>=150){if(gt(s.amplitude,0))s.amplitude-=2;}
    else s.amplitude=lerp(s.amplitude,s.maxamplitude,.1);
    if(s.type===0)b.x=b.xstart+s.moveamount;
    if(s.type===1){s.moveamount=Math.sin(s.timer/20)*s.amplitude;b.x=b.xstart+s.moveamount;b.imageAngle+=1.9565217391304348;}
    if(le(s.amplitude,0)&&s.timer>=230&&rt.globals.turntimer>2)rt.globals.turntimer=2;
   }
   s.x=b.x-s.xx;s.y=b.y-s.yy;s.imageXscale=b.imageXscale;s.imageYscale=b.imageYscale;s.imageAngle=b.imageAngle;
  },
  // The plugs, on either side (one for the spinning box).
  draw:(s,rt)=>{
   const b=rt.first(boxDef());
   if(b){
    s.plugangle=0;s.wy=0;s.wx=75;
    if(s.con>=1){s.plugangle=s.imageAngle;s.wx=lengthdirX(rt.spriteWidth(b)/2,s.imageAngle);s.wy=lengthdirY(rt.spriteWidth(b)/2,s.imageAngle);}
    if(s.type!==1)rt.drawSprite('spr_growtangle_electric_plug',0,s.x+s.xx-s.wx-s.plugx,s.y+s.xx-s.wy,2,2,s.plugangle,C.white,s.plugalpha);
    rt.drawSprite('spr_growtangle_electric_plug',0,s.x+s.xx+s.wx+s.plugx,s.y+s.xx+s.wy,2,2,s.plugangle+180,C.white,s.plugalpha);
   }
   rt.drawSelf(s);
  },
 }};
 return [electric,pushin,spark];
}
