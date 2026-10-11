// Jevil's bullet controller: one attack pattern per `type`, timed by `btimer`.
import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {battleSolid,bulletGenParent,growtangle,inheritBullet} from '../../deltarune/battle';
import {spadeRing} from './spadering';

export const bulletController:GmObjectDef={name:'obj_dbulletcontroller',index:241,parent:bulletGenParent,sprite:'spr_grazemask',visible:false,events:{
 create:(s,rt)=>{
  s.btimer=99;s.timermax=12;s.difficulty=1;s.type=1;s.joker=0;s.side=1;s.damage=100;s.grazepoints=1;s.timepoints=1;s.inv=60;
  s.grazed=0;s.grazetimer=0;s.target=0;s.made=0;s.special=0;s.miny=150;s.maxy=280;
  const box=rt.first(growtangle);if(box){s.miny=box.y-rt.spriteHeight(box)/2;s.maxy=box.y+rt.spriteHeight(box)/2;}
  s.ratio=1;const m=rt.globals.monster,pop=m[0]+m[1]+m[2];if(pop===2)s.ratio=1.6;if(pop===3)s.ratio=2.3;
 },
 step:(s,rt)=>{s.btimer+=1;if(s.joker===1)jevilAttack(s,rt);},
}};
function jevilAttack(s:GmInstance,rt:GmRuntime){
 const solid=()=>rt.first(battleSolid)!;
 switch(s.type){
  case 65:
   if(s.btimer>=60){
    const ring=rt.create(spadeRing,solid().x,solid().y);s.ring=ring.id;
    ring.maxspade=10;ring.grav=0.4;inheritBullet(s,ring);s.btimer=0;
   }
   break;
 }
}
