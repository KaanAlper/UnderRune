// Small objects the battles share from Chapter 2 on: obj_doom (destroys its target after a delay), obj_afterimage_cut
// (a copy that splits into four quarters drifting apart) and obj_lerpvar (eases one variable of another instance).
import {gmField,type GmInstance,type GmObjectDef,type GmRuntime} from '../gm/runtime';
import {C} from '../gm/graphics';
import {ge,lt} from '../gm/math';
import {lerpEaseIn,lerpEaseInout,lerpEaseOut} from './ease';
import {forChapter} from './rules';

/** obj_lerpvar's Chapter 3 addition: respectglobalinteract (off unless its creator sets it) holds the clock while
 * global.interact is set. */
const LERPVAR:Record<number,{create(s:GmInstance):void;paused(s:GmInstance,rt:GmRuntime):boolean}>={
 2:{create:()=>{},paused:()=>false},
 3:{create:s=>{s.respectglobalinteract=false;},paused:(s,rt)=>s.respectglobalinteract===true&&rt.globals.interact!==0},
};
export const doom:GmObjectDef={name:'obj_doom',index:1101,depth:0,visible:false,events:{
 alarm0:(s,rt)=>{const t=rt.byId(s.target);if(t)rt.destroy(t);rt.destroy(s);},
}};
/** Event 0: the measurements of its sprite (its height is taken from the width, as in the original). */
const measure=(s:GmInstance,rt:GmRuntime)=>{
 const spr=rt.bank.get(s.sprite!);
 s.width=spr?.width??0;s.height=spr?.width??0;s.xo=spr?.originX??0;s.yo=spr?.originY??0;
};
export const afterimageCut:GmObjectDef={name:'obj_afterimage_cut',index:211,depth:0,events:{
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
export const lerpvar:GmObjectDef={name:'obj_lerpvar',index:929,depth:0,events:{
 create:(s,rt)=>{Object.assign(s,{variable:0,varname:'variable',pointa:0,pointb:0,time:0,maxtime:30,target:-1,init:0,easetype:0,easeinout:'out'});forChapter(rt,LERPVAR,'obj_lerpvar').create(s);},
 step:(s,rt)=>{
  const t=rt.byId(s.target);
  if(!t){rt.destroy(s);return;}
  const field=gmField(s.varname);
  if(s.init===0){if(typeof s.pointa==='string')s.pointa=t[field];s.init=1;}
  if(!forChapter(rt,LERPVAR,'obj_lerpvar').paused(s,rt))s.time+=1;
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
