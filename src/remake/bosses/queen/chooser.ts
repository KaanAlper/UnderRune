// Queen's user events 0 and 2. Keep attack choice separate from the controller that executes it.
import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {eq,ge,lt} from '../../gm/math';

export function advanceQueenPhase(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,i=s.myself;
 // These are consecutive tests: a large hit can cross all three thresholds in this event.
 for(const [phase,mercy,hp,shield,acts,size,target] of [[1,25,.75,400,6,7,50],[2,50,.5,500,8,10,75],[3,75,.25,500,8,12,100]]){
  if(eq(s.phase,phase)&&(ge(s.bardlymercy,mercy)||lt(g.monsterhp[i],g.monstermaxhp[i]*hp))){
   s.usewineattack=1;s.phase=phase+1;s.wirescut=0;s.shieldhp=shield;s.shieldmaxhp=shield;s.shieldacthp=acts;s.shieldactmaxhp=acts;s.targetmercy=target;
   if(phase>1)s.shieldsize=size;
  }
 }
}

export function chooseQueenAttack(s:GmInstance,rt:GmRuntime,berdlyPlug:GmObjectDef){
 s.turn++;s.phaseturn++;s.rr=0;
 if(eq(s.usewineattack,1)&&ge(s.phase,2)&&s.phase<=4){
  s.rr=2;s.difficulty=eq(s.phase,2)?0:eq(s.phase,3)?1:eq(s.beatwine2nodamage,1)?2:1;
  s.usewineattack=0;s.phaseturn--;
 }
 if(eq(s.usefinalattack,1)){s.rr=1;s.difficulty=0;s.usefinalattack=2;s.phaseturn--;}
 if((eq(s.phase,1)||eq(s.phase,2)||eq(s.phase,3)||eq(s.phase,4))&&!eq(s.rr,2)&&!eq(s.rr,1)){
  const later=eq(s.phase,3)||eq(s.phase,4),order=later?[7,3,6,8,4,9,8,4,7,6,9,8]:[7,3,6,8,4,9,8];
  if(ge(s.phaseturn,1)&&s.phaseturn<=order.length){
   s.rr=order[s.phaseturn-1];s.difficulty=s.phaseturn===7?4:s.phaseturn===12?5:s.phaseturn>=8?1:0;
  }
  if(s.phaseturn>order.length){
   if(!later)s.phaseturn=7;
   const rand=rt.random.irandom(later?100:120);
   const choices=later?[[4,1],[7,1],[6,1],[9,1],[8,5]]:[[7,0],[3,0],[6,0],[8,0],[4,0],[8,4]];
   for(let i=0;i<choices.length;i++)if(rand>=i*20)[s.rr,s.difficulty]=choices[i];
  }
 }
 if(!rt.exists(berdlyPlug)&&eq(s.rr,7))s.rr=5;
}
