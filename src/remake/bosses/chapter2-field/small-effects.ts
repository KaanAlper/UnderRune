import {le} from '../../gm/math';
import type {GmObjectDef} from '../../gm/runtime';
/** Small native parents used by the field minigames. Their descendants inherit these events. */
export function createFieldEffects(object:(name:string)=>GmObjectDef):GmObjectDef[]{
 const animation:GmObjectDef={...object('obj_animation_dx'),events:{
  create:s=>{Object.assign(s,{timer:0,endtime:0,animdone:0,init:0,hitbox:0});},
  alarm0:(s,rt)=>rt.destroy(s),
  user5:(s,rt)=>rt.destroy(s),
  step:(s,rt)=>{s.init=1;if(s.animdone){s.timer++;if(s.timer>=s.endtime)rt.destroy(s);}},
  animationEnd:(s,rt)=>{if(s.init===0)return;if(s.endtime===0)rt.destroy(s);else s.imageAlpha=0;},
 }};
 const shake:GmObjectDef={...object('obj_shakeobj'),events:{
  create:(s,rt)=>{Object.assign(s,{active:0,target:0,shakeamt:rt.globals.darkzone===0?5:10,shakereduct:rt.globals.darkzone===0?1:2,shakespeed:1,nowx:0,nowy:0,on:1,timer:0});},
  user0:(s,rt)=>{const t=rt.byId(s.target);if(t){s.active=1;s.nowx=t.x;s.nowy=t.y;}else rt.destroy(s);},
  step:(s,rt)=>{if(s.active===0)rt.destroy(s);if(s.active===1){const t=rt.byId(s.target);if(t){s.shakeamt-=s.shakereduct;s.on*=-1;t.x=s.nowx+s.shakeamt*s.on;if(le(s.shakeamt,0))rt.destroy(s);}else rt.destroy(s);}},
 }};
 return [animation,shake];
}
