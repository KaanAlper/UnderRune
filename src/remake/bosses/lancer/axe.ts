// obj_axebullet: Susie's thrown axe in the Susie & Lancer battle. It flies left under a sideways pull and spins a
// quarter turn every three frames, leaving once it is past the right edge of the view.
import type {GmObjectDef} from '../../gm/runtime';
import {collideBullet} from '../../deltarune/battle';

export const axeBullet:GmObjectDef={name:'obj_axebullet',index:285,depth:2,parent:collideBullet,sprite:'spr_axebullet_b',events:{
 create:(s,rt)=>{
  s.imageXscale=2;s.imageYscale=2;s.counter=0;s.imageAngle=0;s.seizure=0;
  s.hspeed=-7.6-rt.random.random(1.5);s.vspeed=-2+rt.random.random(4);s.gravity=0.13;s.gravityDirection=0;
  s.active=1;s.timepoints=4;s.grazepoints=4;s.damage=30;s.grazed=0;
 },
 step:(s,rt)=>{
  if(s.seizure===0){s.counter+=1;if(s.counter>=3){s.imageAngle+=45;s.counter=0;}}
  if(s.seizure===1)s.imageAngle+=10;
  if(s.x>=rt.view.x+700)rt.destroy(s);
 },
}};
