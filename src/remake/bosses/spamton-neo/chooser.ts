// obj_spamton_neo_enemy Other_10 (user event 0), Chapter 2.
// Chooses the enemy's rr, not bulletcontroller.type. This event alone does not make NEO playable.
import type {GmInstance,GmRuntime} from '../../gm/runtime';
import {eq,gt,lt} from '../../gm/math';

export function chooseNeoAttack(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,i=s.myself;
 if((gt(g.mercymod[i],25)&&eq(s.phase,1))||(lt(g.monsterhp[i],g.monstermaxhp[i]*.75)&&eq(s.phase,1)))s.phase=2;
 if((gt(g.mercymod[i],50)&&eq(s.phase,2))||(lt(g.monsterhp[i],g.monstermaxhp[i]*.5)&&eq(s.phase,2)))s.phase=3;
 if((gt(g.mercymod[i],70)&&eq(s.phase,3))||(lt(g.monsterhp[i],g.monstermaxhp[i]*.3)&&eq(s.phase,3))){s.phaseturn=0;s.phase=4;}
 s.turn++;s.phaseturn++;
 if(eq(s.phaseturn,1)){s.rr=0;s.difficulty=1;}
 if(eq(s.phaseturn,2)){s.rr=6;s.difficulty=0;}
 if(eq(s.phaseturn,3)){s.rr=2;s.difficulty=0;}
 if(eq(s.phaseturn,4)){s.rr=8;s.difficulty=0;}
 if(eq(s.phaseturn,5)){s.rr=8.5;s.difficulty=0;if(eq(s.hellmode,1))s.difficulty=2;}
 if(eq(s.phaseturn,6)){s.rr=7;s.difficulty=0;}
 if(eq(s.phaseturn,7)){s.rr=2;s.difficulty=2;}
 if(eq(s.phaseturn,8)){s.rr=0;s.difficulty=3;}
 if(eq(s.phaseturn,9)){s.rr=7;s.difficulty=0;}
 if(eq(s.phaseturn,10)){s.rr=8.5;s.difficulty=2;if(eq(s.nothitduringphonehands,1)||eq(s.hellmode,1)){s.rr=8.5;s.difficulty=1;}}
 if(eq(s.phaseturn,11)){s.rr=8;s.difficulty=1;}
 if(eq(s.phaseturn,12)){s.rr=6;s.difficulty=1;s.phaseturn=7;}
 if(eq(s.phase,4)){
  if(eq(s.phaseturn,1)){s.rr=2;s.difficulty=1;}
  if(eq(s.phaseturn,2)){s.rr=8;s.difficulty=3;}
  if(eq(s.phaseturn,3)){s.rr=9;s.difficulty=0;s.haveusedfinalattack=1;}
  if(eq(s.phaseturn,4)){s.rr=2;s.difficulty=1;}
  if(eq(s.phaseturn,5)){s.rr=7;s.difficulty=0;}
  if(eq(s.phaseturn,6)){s.rr=9;s.difficulty=0;s.phaseturn=3;}
 }
 if((lt(g.monsterhp[i],g.monstermaxhp[i]*.1)&&eq(s.haveusedfinalattack,0))||(gt(g.mercymod[i],90)&&eq(s.haveusedfinalattack,0))){s.rr=9;s.difficulty=0;s.haveusedfinalattack=1;s.phaseturn=3;}
 if(gt(s.weirdpathendcon,0))s.rr=5;
}
