// NEO's support objects: the shared small effects (deltarune/shared-effects.ts: obj_doom, obj_afterimage_cut,
// obj_lerpvar) and obj_basicbullet_sneo (the parent of NEO's bullets: graze points, his damage, shot reactions). The
// effects' scripts (scr_doom, scr_afterimage_cut, scr_lerpvar) are here too.
import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {ge,le} from '../../gm/math';
import {bulletInit} from '../../deltarune/battle';
import {afterimageCut,doom,lerpvar} from '../../deltarune/shared-effects';

/** The objects, with lookups through the canonical registry (`object`). */
export function createNeoSupport(object:(name:string)=>GmObjectDef):GmObjectDef[]{
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
