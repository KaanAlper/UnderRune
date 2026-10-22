import type {GmObjectDef} from '../../gm/runtime';
import {C} from '../../gm/graphics';
import {gt,le} from '../../gm/math';

/** Native shared intro dependencies; the stream Draw event exits immediately in Chapter 2. */
export function createGigaIntroEffects():GmObjectDef[]{
 const afterimage:GmObjectDef={name:'o_afterimage',index:822,events:{create:s=>{s.imageSpeed=0;s.depth=9;s.boss=8329839283;s.hasboss=1;s.rate=0.2;s.punch_telegraph=0;s.black_silhouette=0;s.white_silhouette=0;},step:(s,rt)=>{
  s.imageAlpha-=s.rate;if(le(s.imageAlpha,0))rt.destroy(s);
  if(s.hasboss===1){const boss=rt.byId(s.boss);if(!boss)throw Error(`GigaAfterimageBossMissing:${s.boss}`);s.x=boss.x;s.y=boss.y;}
  if(gt(s.imageAlpha,1)&&s.punch_telegraph===1){s.punch_telegraph=1;s.rate=-0.4;}
 },draw:(s,rt)=>{
  if(s.sprite&&(s.black_silhouette===1||s.white_silhouette===1))rt.drawSpriteFog(s.sprite,s.imageIndex,s.x,s.y,s.imageXscale,s.imageYscale,s.imageAngle,s.white_silhouette===1?C.white:C.black,s.imageAlpha);
  else rt.drawSelf(s);
 }}};
 const stream:GmObjectDef={name:'obj_astream',index:186,sprite:'spr_heart',visible:false,events:{create:s=>{s.mystream=999;s.bstream=0;s.songname='nosong.ogg';},destroy:(s,rt)=>{if(rt.soundFree)rt.soundFree(s.mystream);else rt.sourceAudio?.free(s.mystream);},draw:()=>{}}};
 return [afterimage,stream];
}
