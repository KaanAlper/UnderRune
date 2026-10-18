// Queen's wire ACT: Berdly's wires hang from a plug that drops in, and Susie throws Kris (or Ralsei) at the targets on
// them; each cut wire raises Berdly's mercy. Objects: obj_queen_throw_controller, obj_queen_throwtarget,
// obj_queen_throwkris, obj_queen_kristhrown, obj_queen_ralseithrown and obj_boxing_block_star.
import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {f32,ge,gt,le,lt,lengthdirX,lengthdirY,lerp,pointDirection} from '../../gm/math';
import {C,mergeColor} from '../../gm/graphics';
import {button3_p} from '../../deltarune/controller';
import {KEY,held} from '../../deltarune/keys';
import {battleTextDefault,destroyWriters,writer} from '../../deltarune/writer';
import {snd} from '../../deltarune/sound';
import {sourceText} from '../../host/text';
import {type QueenObject,queenInstance} from './context';

/** Where each difficulty hangs its wires: [x offset of the top, x_offset of the target] per wire; the rest are hidden. */
const WIRES:Readonly<Record<number,readonly (readonly [number,number])[]>>={
 0:[[0,0]],1:[[0,-2],[0,-2]],2:[[-200,-8],[0,0],[200,8]],3:[[-180,-7],[-60,1],[60,1],[180,7]],4:[[-260,-10],[-130,-5],[0,0],[130,4],[260,10]]};
/** Mercy each cut wire gives Berdly, by Queen's phase. */
const MERCY:Readonly<Record<number,number>>={1:12.5,2:8.333333333333334,3:6.25,4:5};

export function createQueenThrow(object:QueenObject):GmObjectDef[]{
 const queen=(rt:GmRuntime)=>queenInstance(rt,object,'obj_queen_enemy');
 const hero=(rt:GmRuntime,name:string)=>queenInstance(rt,object,name);
 const star:GmObjectDef={...object('obj_boxing_block_star'),events:{
  create:(s,rt)=>{
   s.imageXscale=2;s.imageYscale=2;s.speed=6;s.timer=0;
   if(rt.exists(object('o_boxingqueen')))throw Error('obj_boxing_block_star around GIGA Queen is not ported');
  },
  endStep:(s,rt)=>{s.timer++;if(gt(s.speed,0))s.speed-=.4;if(s.timer>16)rt.destroy(s);},
 }};
 const target:GmObjectDef={...object('obj_queen_throwtarget'),events:{
  create:(s,rt)=>{
   s.imageXscale=.2;s.imageYscale=.2;s.imageSpeed=.5;s.imageIndex=rt.random.irandom(15);
   Object.assign(s,{good:1,offing:0,con:1,collided:0});s.siner=rt.random.random(500);s.n=rt.random.random(15)/200;
   Object.assign(s,{vineid:-1,stopmoving:0,growstate:0,x_offset:0});
  },
  cleanup:(s,rt)=>{if(rt.paths.exists(s.path))rt.paths.delete(s.path);},
  // The target slides along its wire.
  step:(s,rt)=>{
   if(s.growstate===0&&lt(s.imageXscale,1.4)){s.imageXscale+=.08;s.imageYscale+=.08;}
   if(s.growstate===1){s.imageXscale-=.08;s.imageYscale-=.08;if(lt(s.imageXscale,0))rt.destroy(s);}
   if(s.stopmoving===0)s.siner+=.07+s.n;
   s.path_speed=f32(4);s.path_position=f32(.14+Math.sin(s.siner)/8);
   if(s.con===5){if(lt(s.x,s.xstart+40))s.x+=10;s.con=6;}
   if(s.con===6){if(gt(s.x,s.xstart))s.x-=2;}
   if(s.con===7){if(lt(s.x,s.xstart+40))s.x+=8;s.con=6;}
  },
  draw:(s,rt)=>rt.drawSprite(s.sprite,s.imageIndex,s.x+s.x_offset,s.y,s.imageXscale,s.imageYscale,0,s.imageBlend,s.imageAlpha),
  animationEnd:(s,rt)=>{if(s.sprite==='spr_berdly_plug_target_burst')rt.destroy(s);},
 }};
 const controller:GmObjectDef={...object('obj_queen_throw_controller'),events:{
  create:(s,rt)=>{
   const q=queen(rt);
   Object.assign(s,{timer:0,con:0,variant:0,init:0,siner:0,difficulty:q.phase-q.wirescut,bardlymercy:0,lerpintimer:0,ysave:s.y,imageSpeed:0,imageXscale:2,imageYscale:2});
   s.y-=200;s.depth=q.depth+1;
   s.x1=[];s.x2=[];s.y1=[];s.y2=[];s.x_offset=[];s.visiblevine=[];
   for(s.i=0;s.i<6;s.i+=1){s.x1[s.i]=s.x;s.x2[s.i]=s.x;s.y1[s.i]=s.y-30;s.y2[s.i]=-400;s.x_offset[s.i]=0;s.visiblevine[s.i]=1;}
  },
  step:(s,rt)=>{
   if(s.init!==0)return;s.init=1;
   const wires=WIRES[s.difficulty];if(!wires)throw Error(`obj_queen_throw_controller: no wires for difficulty ${s.difficulty}`);
   wires.forEach(([dx,offset],n)=>{s.x2[n]=s.x+dx;s.y2[n]=-400;if(offset!==0)s.x_offset[n]=offset;});
   for(let n=wires.length;n<6;n++)s.visiblevine[n]=0;
  },
  draw:(s,rt)=>{
   if(s.lerpintimer<16&&s.con===0){s.y=lerp(s.ystart-200,s.ystart+160,s.lerpintimer/15);s.lerpintimer++;}
   if(s.lerpintimer<16&&s.con===2){s.y=lerp(s.ystart+160,s.ystart-200,s.lerpintimer/15);s.lerpintimer++;}
   // Down: the targets go onto the wires.
   if(s.con===0){
    s.timer++;
    if(s.timer>=16){
     s.timer=0;s.con=1;s.ysave=s.y;
     for(s.i=0;s.i<6;s.i+=1)if(s.visiblevine[s.i]===1){
      const t=rt.create(target,s.x,s.y);s.target=t.id;t.maker=s.id;t.x1=s.x1[s.i];t.x2=s.x2[s.i];t.y1=s.y1[s.i];t.y2=s.y2[s.i];t.vineid=s.i;t.x_offset=s.x_offset[s.i];
      t.path=rt.paths.add();rt.paths.setKind(t.path,0);rt.paths.setClosed(t.path,false);rt.paths.addPoint(t.path,t.x1,t.y1,100);rt.paths.addPoint(t.path,t.x2,t.y2,100);rt.paths.start(t,t.path,4,0,true);
      if(s.difficulty===1){if(s.i===0)t.siner=0;if(s.i===1)t.siner=110;t.n=.05;}
     }
    }
   }
   if(s.con===1){s.siner+=.4;s.y=s.ysave+Math.sin(s.siner/6)*3;}
   // Up again: Berdly gets the mercy.
   if(s.con===2){
    const plug=queenInstance(rt,object,'obj_berdlyplug_enemy');
    if(s.lerpintimer===9)plug.con=2;
    if(s.lerpintimer>=15){rt.destroy(s);plug.bardlymercy=s.bardlymercy;plug.alarm[0]=5;}
   }
   rt.drawSelf(s);
   const w=rt.bank.get('spr_berdlyact_queen_wire')?.width??0;
   for(s.i=0;s.i<6;s.i+=1){
    s.x1[s.i]=s.x;s.y1[s.i]=s.y-18;
    const angle=pointDirection(s.x1[s.i],s.y1[s.i],s.x2[s.i],s.y2[s.i]),xx=lengthdirX(w,angle),yy=lengthdirY(w,angle);
    for(let n=0;n<40;n++)if(s.visiblevine[s.i]===1)rt.drawSprite('spr_berdlyact_queen_wire',0,s.x1[s.i]+xx*n,s.y1[s.i]+yy*n,1,1,angle,C.white,1);
   }
  },
 }};
 /** The one thrown (Kris, or Ralsei after Susie picks him up), flying at the targets. */
 const thrown=(name:string,body:string,idle:string,keys:{cut:[string,string];missed:string},starY:number,resetScale:boolean):GmObjectDef=>({...object(name),events:{
  create:(s,rt)=>{
   Object.assign(s,{con:0,yy:rt.view.y,xx:rt.view.x,timer:0,collided:0,mypower:10,bonk:0});
   const shield=rt.first(object('obj_queenshield_enemy'));if(shield)s.depth=shield.depth-1;
  },
  step:(s,rt)=>{
   if((s.con===0&&s.bonk===0)||(s.con===2&&s.bonk===0))s.imageAngle=s.direction;
   const back=()=>{s.gravity=0;s.speed=0;s.x=s.xx-40;s.y=hero(rt,body).y;s.sprite=idle;s.imageAngle=0;s.hspeed=20;s.con=10;};
   if((gt(s.x,s.xx+700)||lt(s.y,s.yy-40))&&s.con===0)back();
   // Back in from the left; done when level with Kris.
   if(s.con===10){
    s.timer+=1;
    if(ge(s.x,hero(rt,'obj_herokris').x-10)){
     if(s.collided===0){rt.globals.msg[0]=sourceText(keys.missed);battleTextDefault(rt,s);}
     for(const k of rt.withInstances(object('obj_herokris')))k.visible=true;
     if(body==='obj_herokris'){
      const thrower=queenInstance(rt,object,'obj_queen_throwkris');
      if(thrower.throwXcon===0){
       for(const h of rt.withInstances(object('obj_herosusie')))h.visible=true;
       s.visible=false;for(const t of rt.withInstances(throwing))rt.destroy(t);for(const t of rt.withInstances(target))rt.destroy(t);s.con=11;
      }else rt.destroy(s);
     }else{
      for(const h of rt.withInstances(object('obj_herosusie')))h.visible=true;
      for(const h of rt.withInstances(object('obj_heroralsei')))h.visible=true;
      s.visible=false;for(const t of rt.withInstances(target))rt.destroy(t);for(const t of rt.withInstances(throwing))rt.destroy(t);s.con=11;
     }
    }
   }
   if(s.con===11&&!rt.exists(writer)){queen(rt).actcon=35;rt.destroy(s);}
   if(s.con===2&&(lt(s.x,s.xx-40)||gt(s.y,rt.view.y+380))){s.timer=0;back();if(resetScale)s.imageXscale=2;}
   // Into the shield: it rings and takes 20.
   const shield=rt.first(object('obj_queenshield_enemy'));
   if(shield&&gt(s.x,shield.x-60)&&s.bonk===0){
    for(const base of [0,90,180,270]){const b=rt.create(star,s.x+60,s.y+starY);s.block_star=b.id;b.direction=base+rt.random.random(90);}
    for(const b of rt.withInstances(star))b.depth=shield.depth-1;
    queen(rt).shieldhp-=20;
    for(const sh of rt.withInstances(object('obj_queenshield_enemy')))sh.con=1;
    for(const sh of rt.withInstances(object('obj_queenshield_enemy')))rt.userEvent(sh,0);
    s.bonk=1;s.con=2;snd(rt,'snd_bell');s.speed*=-.2;s.x+=15;shield.shaketimer=4;
   }
   if(gt(s.y,rt.view.y+240))s.depth=hero(rt,'obj_herokris').depth+1000;
  },
 },collisions:[{target,run:(s,t,rt)=>{
  if(t.collided!==0)return;
  const slash=rt.create(object('obj_slashEffect'),t.x,t.y);s.slash=slash.id;slash.imageAngle=s.imageAngle+45;slash.depth=t.depth-1;slash.imageXscale=1;slash.imageYscale=1;
  const q=queen(rt);q.wirescut++;t.stopmoving=1;t.sprite='spr_berdly_plug_target_burst';t.imageIndex=0;t.imageSpeed=.5;
  const mercy=MERCY[q.phase];if(mercy!==undefined)queenInstance(rt,object,'obj_queen_throw_controller').bardlymercy+=mercy;
  if(t.good===1){rt.globals.msg[0]=sourceText(keys.cut[0]);snd(rt,'snd_coin');t.con=t.offing===1?1:5;}
  else{snd(rt,'snd_noise');t.con=7;rt.globals.msg[0]=sourceText(keys.cut[1]);s.hspeed=-12;s.vspeed=-4;s.gravity=.5;s.con=2;}
  battleTextDefault(rt,s);t.collided=1;s.collided=1;
 }}]});
 const kris=thrown('obj_queen_kristhrown','obj_herokris','spr_krisb_idle',{cut:['obj_queen_kristhrown_slash_Collision_7a76bce8_f6fc_4158_8ce1_58bb74085511_gml_23_0',
  'obj_queen_kristhrown_slash_Collision_7a76bce8_f6fc_4158_8ce1_58bb74085511_gml_42_0'],missed:'obj_queen_kristhrown_slash_Step_0_gml_24_0'},14,true);
 const ralsei=thrown('obj_queen_ralseithrown','obj_heroralsei','spr_ralsei_idle',{cut:['obj_queen_ralseithrown_slash_Collision_22f849ff_cd13_405b_a486_5468f83d4033_gml_23_0',
  'obj_queen_ralseithrown_slash_Collision_22f849ff_cd13_405b_a486_5468f83d4033_gml_42_0'],missed:'obj_queen_ralseithrown_slash_Step_0_gml_23_0'},34,false);
 /** Susie aiming: the arc swings by itself (or follows up and down when aiming is on); C throws. */
 const throwing:GmObjectDef={...object('obj_queen_throwkris'),events:{
  create:(s,rt)=>{
   Object.assign(s,{angle:0,throwcon:1,angledraw:1,imageXscale:2,imageYscale:2,radius:300,anglespeed:2,kx:184+rt.view.x,ky:170+rt.view.y,lx:rt.view.x,ly:rt.view.y});
   s.krisyoff=Array(1000).fill(0);
   Object.assign(s,{krisgrav:1,fro:0,mypower:15,maxpower:30});s.mypower=s.maxpower;
   Object.assign(s,{minpower:15,powerdir:1,powerspeed:.6,throwready:0,throwalpha:0,activatethrow:0,throwXcon:0,throwXtimer:0,ralseiy:50});
  },
  step:(s,rt)=>{
   if(s.throwcon===1){
    if(queen(rt).aimact===0){
     if(s.throwready===0)s.angle+=s.anglespeed;
     if(ge(s.angle,42))s.anglespeed=-2;if(le(s.angle,-2))s.anglespeed=2;
    }else{
     if(held(rt,KEY.up)&&lt(s.angle,42))s.angle+=2;
     if(held(rt,KEY.down)&&gt(s.angle,-2))s.angle-=2;
    }
    if(button3_p(rt)){s.activatethrow=1;destroyWriters(rt);}
    if(s.activatethrow===1){
     Object.assign(s,{throwready:1,activatethrow:0,imageIndex:0,imageSpeed:.5,sprite:'spr_susieb_attack_unarmed',angledraw:0,throwcon:2});
     snd(rt,'snd_ultraswing');
     const one=s.throwXcon!==3?rt.create(kris,s.kx,s.ky):rt.create(ralsei,s.kx-20,s.ky-20);
     if(s.throwXcon!==3)s.kris=one.id;else s.ralsei=one.id;
     one.speed=s.mypower;one.mypower=s.mypower;one.imageXscale=2;one.imageYscale=2;one.direction=s.angle;one.imageAngle=s.angle;one.gravity=s.krisgrav;
     if(s.throwXcon===1)s.throwXcon=2;
    }
   }
   if(s.throwcon===2&&ge(s.imageIndex,5))s.imageSpeed=0;
   if(s.throwXcon===3&&!rt.exists(target)){
    for(const h of rt.withInstances(object('obj_herokris')))h.visible=true;
    for(const h of rt.withInstances(object('obj_herosusie')))h.visible=true;
    for(const o of [throwing,kris,ralsei,target])for(const i of rt.withInstances(o))rt.destroy(i);
    s.throwXcon=5;
   }
   if(s.throwXcon===5&&!rt.exists(writer)){queen(rt).actcon=35;rt.destroy(s);}
   // The arc's drop for each step along it.
   if(s.angledraw===1){
    s.lx=lengthdirX(s.mypower,s.angle);s.ly=lengthdirY(s.mypower,s.angle);
    for(s.i=0;s.i<42;s.i+=1){s.krisyadd=s.krisgrav+s.krisgrav*s.i;s.krisyoff[s.i]=s.i>0?s.krisyoff[s.i-1]+s.krisyadd:s.krisyadd;}
   }
  },
  draw:(s,rt)=>{
   if(s.throwXcon===1)rt.drawSprite('spr_susieb_throwralseiready_setup',0,s.x,s.y-s.ralseiy,2,2,s.imageAngle,C.gray,s.imageAlpha);
   if(s.throwXcon===2){
    rt.drawSprite('spr_susieb_throwralseiready_setup',0,s.x,s.y-s.ralseiy,2,2,s.imageAngle,C.white,s.imageAlpha);
    if(gt(s.ralseiy,0))s.ralseiy-=4;
    if(lt(s.ralseiy,1)&&!rt.exists(writer)&&!rt.exists(kris)){Object.assign(s,{sprite:'spr_susieb_throwralseiready',imageIndex:0,throwXcon:3,throwcon:1,angledraw:1,throwready:0});}
   }
   rt.drawSelf(s);
   if(s.angledraw===0)s.throwalpha=0;
   if(s.throwXcon===3&&!rt.exists(target))return;
   if(s.angledraw===1){
    if(lt(s.throwalpha,1))s.throwalpha+=.125;
    const d=rt.drawState;d.alpha=s.throwalpha;d.color=mergeColor(0xff0000,C.white,.5);
    for(s.i=0;s.i<12;s.i+=1){
     s.fr=2;const n=s.i*s.fr+s.fro,next=(s.i+1)*s.fr+s.fro;
     const x=s.kx+s.lx*n,y=s.ky+s.ly*n+s.krisyoff[n];
     rt.drawCircle(x,y,4);rt.drawLine(x,y,s.kx+s.lx*next,s.ky+s.ly*next+s.krisyoff[next],2);
     rt.drawSprite('spr_werewire_throwarrow',0,s.kx,s.ky,2,2,s.angle,C.red,1);
    }
    d.alpha=1;
   }
  },
 }};
 return [controller,target,throwing,kris,ralsei,star];
}
