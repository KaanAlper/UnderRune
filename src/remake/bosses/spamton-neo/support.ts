// Small Chapter 2 objects NEO's attacks share: obj_doom (destroys its target after a delay), obj_afterimage_cut (a
// copy that splits into four quarters drifting apart), obj_lerpvar (eases one variable of another instance) and
// obj_basicbullet_sneo (the parent of NEO's bullets: graze points, his damage, shot reactions). Their scripts
// (scr_doom, scr_afterimage_cut, scr_lerpvar) are here too.
import {gmField,type GmInstance,type GmObjectDef,type GmRuntime} from '../../gm/runtime';
import {C} from '../../gm/graphics';
import {ge,le,lt} from '../../gm/math';
import {bulletInit} from '../../deltarune/battle';
import {lerpEaseIn,lerpEaseInout,lerpEaseOut} from '../../deltarune/ease';

/** The objects, with lookups through the canonical registry (`object`). */
export function createNeoSupport(object:(name:string)=>GmObjectDef):GmObjectDef[]{
 const doom:GmObjectDef={name:'obj_doom',index:1101,depth:0,visible:false,events:{
  alarm0:(s,rt)=>{const t=rt.byId(s.target);if(t)rt.destroy(t);rt.destroy(s);},
 }};
 /** Event 0: the measurements of its sprite (its height is taken from the width, as in the original). */
 const measure=(s:GmInstance,rt:GmRuntime)=>{
  const spr=rt.bank.get(s.sprite!);
  s.width=spr?.width??0;s.height=spr?.width??0;s.xo=spr?.originX??0;s.yo=spr?.originY??0;
 };
 const afterimageCut:GmObjectDef={name:'obj_afterimage_cut',index:211,depth:0,events:{
  create:(s,rt)=>{s.faderate=0.1;s.siner=0;s.sprite='spr_whitepx';s.imageSpeed=0;rt.userEvent(s,0);s.flash=false;},
  user0:measure,
  draw:(s,rt)=>{
   if(s.flash){
    rt.drawSpriteFog(s.sprite!,s.imageIndex,s.x,s.y,s.imageXscale,s.imageYscale,s.imageAngle,C.white,s.imageAlpha);
    s.flash=false;return;
   }
   s.siner+=1;
   const hw=s.width/2,hh=s.height/2,m=lerpEaseOut(0,rt.spriteHeight(s)/2,(s.siner+2)/10,1);
   s.imageAlpha-=s.faderate;
   const ox=s.xo*s.imageXscale/2,oy=s.yo*s.imageYscale/2;
   const part=(left:number,top:number,dx:number,dy:number)=>rt.drawSpritePart(s.sprite!,s.imageIndex,left,top,hw,hh,s.x+dx-ox,s.y+dy-oy,s.imageXscale,s.imageYscale,s.imageBlend,s.imageAlpha);
   part(0,0,-m,-m);part(hw,0,m,-m);part(0,hh,-m,m);part(hw,hh,m,m);
   if(lt(s.imageAlpha,0))rt.destroy(s);
  },
 }};
 const lerpvar:GmObjectDef={name:'obj_lerpvar',index:929,depth:0,events:{
  create:s=>{Object.assign(s,{variable:0,varname:'variable',pointa:0,pointb:0,time:0,maxtime:30,target:-1,init:0,easetype:0,easeinout:'out'});},
  step:(s,rt)=>{
   const t=rt.byId(s.target);
   if(!t){rt.destroy(s);return;}
   const field=gmField(s.varname);
   if(s.init===0){if(typeof s.pointa==='string')s.pointa=t[field];s.init=1;}
   s.time+=1;
   const k=s.time/s.maxtime;
   if(s.easetype===0)t[field]=s.pointa+(s.pointb-s.pointa)*k;
   else{
    if(s.easeinout==='out')t[field]=lerpEaseOut(s.pointa,s.pointb,k,s.easetype);
    if(s.easeinout==='in')t[field]=lerpEaseIn(s.pointa,s.pointb,k,s.easetype);
    if(s.easeinout==='inout')t[field]=lerpEaseInout(s.pointa,s.pointb,k,s.easetype);
   }
   if(ge(s.time,s.maxtime))rt.destroy(s);
  },
 }};
 const basicBullet:GmObjectDef={name:'obj_basicbullet_sneo',index:597,parent:object('obj_collidebullet'),sprite:'spr_sneo_bullet0',depth:0,
  events:{
   create:(s,rt)=>{
    bulletInit(s);s.element=6;s.fluffyguarddestroysthis=1;s.f=2;s.destroyable=0;s.angle_speed=0;s.destroypoints=1;
    const n=rt.first(object('obj_spamton_neo_enemy'));if(n)s.damage=rt.globals.monsterat[n.myself]*5;
    s.grazepoints=3;
   },
   step:(s,rt)=>{
    if(ge(s.x,rt.room.width+100)||le(s.x,-100)||ge(s.y,rt.room.height+100)||le(s.y,-100))rt.destroy(s);
    s.direction+=s.angle_speed;s.imageAngle=s.direction;
   },
  },
  collisions:[{target:object('obj_yheart_shot'),run:(s,shot,rt)=>{
   if(s.destroyable===1){
    if(shot.big===0)rt.userEvent(shot,0);
    const anim=rt.create(object('obj_yshot_anim'),s.x,s.y);s.anim=anim.id;
    anim.imageXscale=s.imageXscale;anim.imageYscale=s.imageYscale;anim.sprite='spr_yheart_shot_hit3';
    rt.destroy(s);
   }else if(s.destroyable===-1)rt.userEvent(shot,0);
  }}],
 };
 return [doom,afterimageCut,lerpvar,basicBullet];
}

/** scr_doom, run by `caller`: the target is destroyed after `delay` frames. */
export function scrDoom(rt:GmRuntime,object:(name:string)=>GmObjectDef,target:number,delay:number){
 const d=rt.create(object('obj_doom'),0,0);d.depth=0;d.alarm[0]=delay;d.target=target;return d;
}
/** scr_afterimage_cut, run by `s`: a copy of it that splits into quarters, kept in its afterimage variable. */
export function scrAfterimageCut(s:GmInstance,rt:GmRuntime,object:(name:string)=>GmObjectDef){
 const a=rt.create(object('obj_afterimage_cut'),s.x,s.y);s.afterimage=a.id;
 a.sprite=s.sprite;a.imageIndex=s.imageIndex;a.imageBlend=s.imageBlend;a.imageSpeed=0;a.depth=s.depth;
 a.imageXscale=s.imageXscale;a.imageYscale=s.imageYscale;a.imageAngle=s.imageAngle;
 rt.userEvent(a,0);return a;
}
/** scr_lerpvar, run by `s`: eases s[varname] from a to b over `time` frames, kept in s.___lerpvar (the instance
 * script keeps it in __lerpvar too). */
export function scrLerpvar(s:GmInstance,rt:GmRuntime,object:(name:string)=>GmObjectDef,varname:string,a:number|string,b:number,time:number,easetype?:number,easeinout?:string){
 const l=rt.create(object('obj_lerpvar'),0,0);s.__lerpvar=l.id;
 l.target=s.id;l.varname=varname;l.pointa=a;l.pointb=b;l.maxtime=time;
 if(easetype!==undefined)l.easetype=easetype;
 if(easeinout!==undefined)l.easeinout=easeinout;
 s.___lerpvar=l.id;return l;
}
