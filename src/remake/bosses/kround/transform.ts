// obj_checker_animtest, battle part (type 1): once Susie's idea knocks K.Round's crown off in encounter 27, the
// crown flies away, he shrinks back into a small checker, tucks his legs and rolls off screen, and the battle ends.
// The overworld cutscene parts (types 0 and 2) are not part of a battle and are not ported.
import type {GmObjectDef,GmRuntime} from '../../gm/runtime';
import {eq,ge} from '../../gm/math';
import {marker,monsterParent} from '../../deltarune/battle';
import {requireKRoundHost} from './controller';

/** The crown left on the floor becomes an (invisible) interactable that drifts along with it. */
export const readableCrown:GmObjectDef={name:'obj_readable_room1',index:88,sprite:'spr_interactable',visible:false};

export const checkerTransform:GmObjectDef={name:'obj_checker_animtest',index:262,sprite:'spr_smallchecker_idle',events:{
 create:(s,rt)=>{
  s.type=0;s.con=0;s.subcon=0;s.secondtime=0;
  const room=requireKRoundHost(rt).roomName();
  if(room==='room_field_checkersboss'){if((rt.globals.plot??0)<60){s.con=1;s.imageXscale=2;s.imageYscale=2;s.subcon=0;}else rt.destroy(s);}
  if(room==='room_cc_6f'){s.secondtime=1;s.con=1;s.imageXscale=2;s.imageYscale=2;s.subcon=0;}
 },
 alarm4:s=>{s.con+=1;},
 step:(s,rt)=>{if(s.type===1)shrinkAway(s,rt);},
}};

function shrinkAway(s:ReturnType<GmRuntime['create']>,rt:GmRuntime){
 const second=s.secondtime===1;
 const crown=()=>rt.byId(s.crown)!;
 if(eq(s.con,1)){
  s.imageSpeed=0;s.imageIndex=0;
  const c=rt.create(marker,s.x+24,s.y+10);s.crown=c.id;c.imageXscale=2;c.imageYscale=2;c.sprite='spr_smallchecker_crown';c.depth=s.depth-1;
  s.sprite='spr_smallchecker_transform3';s.con=0.4;s.windsound=0;s.alarm[4]=30;
 }
 if(eq(s.con,1.4)){
  if(s.windsound===0){rt.sound?.('snd_whistlebreath');s.windsound=1;}
  const c=crown();c.hspeed=c.hspeed+(second?0.4:0.2);
  if(ge(c.hspeed,3))s.con=1.5;
 }
 if(eq(s.con,1.5)){
  const c=crown();c.maxy=s.y+rt.spriteHeight(s);c.imageAngle=-45;c.y=c.y-10;c.gravity=0.5;c.hspeed=5;c.friction=0.2;
  s.con=1.6;
 }
 if(eq(s.con,1.6)){
  const c=crown();
  if(ge(c.y,c.maxy-rt.spriteHeight(c)-10)){
   c.y=c.y+10;c.imageAngle=0;c.gravity=0;c.vspeed=0;c.friction=0;c.hspeed=1;s.con=0.9;s.alarm[4]=30;
   if(second){
    s.alarm[4]=10;
    const r=rt.create(readableCrown,c.x,c.y);s.interactcrown=r.id;r.hspeed=1;r.imageXscale=1.6;r.imageYscale=1;
   }
  }
 }
 if(eq(s.con,1.9)){s.imageSpeed=0.25;rt.sound?.('snd_crownshrink');s.con=2.1;}
 if(eq(s.con,2.1)){
  s.imageSpeed=s.imageSpeed+0.01;if(second)s.imageSpeed=s.imageSpeed+0.01;
  if(ge(s.imageSpeed,0.4)){
   s.imageIndex=1;s.imageSpeed=0;s.con=3;s.maxy=s.y+rt.spriteHeight(s)-30;s.alarm[4]=second?10:30;
  }
 }
 if(eq(s.con,4)){
  s.x=s.x+40;s.y=s.y+46;s.sprite='spr_smallchecker_legtuck';s.imageIndex=0;s.imageSpeed=0.25;s.vspeed=-3;s.gravity=1;
  if(second){s.vspeed=-6;s.gravity=2;s.imageSpeed=0.5;}
  s.con=5;
 }
 if(eq(s.con,5)){
  if(ge(s.imageIndex,2))s.imageSpeed=0;
  if(ge(s.y,s.maxy-4)){s.y=s.maxy;s.gravity=0;s.vspeed=0;s.con=6;s.alarm[4]=second?10:30;}
 }
 if(eq(s.con,7)){
  s.imageAngle-=5;s.hspeed=3;
  if(second){s.hspeed=6;s.imageAngle-=5;}
  if(ge(s.x,rt.view.x+720)){
   s.con=8;const g=rt.globals;g.monster[0]=0;g.monster[1]=0;g.monster[2]=0;
   requireKRoundHost(rt).attackPhase();
   for(const m of rt.all(monsterParent))rt.destroy(m);
   rt.destroy(s);
  }
 }
}
