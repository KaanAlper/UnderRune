import {gmArray,type GmInstance} from '../../gm/runtime';

/** scr_spearpattern_reset. Writes through the caller, retaining its loop variable and any array tails. */
export function resetSpearPattern(s:GmInstance){
 s.attackcount=0;s.attackcountmax=0;
 for(s.i=0;s.i<100;s.i++){
  for(const field of ['direction','speed','frames','special','special2'])gmArray(s,'list_attack'+field)[s.i]=0;
  gmArray(s,'list_attackwait')[s.i]=5;
 }
}
const ANGLES:Readonly<Record<string,number>>={u:270,d:90,r:180,l:0,dr:135,dl:45,ur:225,ul:315};
/** scr_spearpattern. These overloaded fields are source coordinates in the offset patterns, not just angles/speeds. */
export function appendSpearPattern(s:GmInstance,direction:number|string,speed:number,frames:number,special:number,wait:number,...extra:number[]){
 let a=direction,b=speed,c=frames;
 if(typeof direction==='string'){
  a=ANGLES[direction]??direction;
  switch(direction){
   case 'right1':a=75;b=-36;c=270;break;
   case 'right2':a=75;b=36;c=270;break;
   case 'up1':a=-36;b=-75;break;
   case 'up2':a=50;b=-75;c=-3;break;
   case 'left1':a=-75;b=-36;c=90;break;
   case 'left2':a=-75;b=36;c=90;break;
   case 'down1':a=-36;b=75;c=180;break;
   case 'down2':a=36;b=75;c=180;break;
   case 'diag1':a=90;b=-90;c=315;break;
   case 'diag2':a=-90;b=-90;c=45;break;
   case 'diag3':a=-90;b=90;c=135;break;
   case 'diag4':a=90;b=90;c=225;break;
  }
 }
 const i=s.attackcountmax;
 gmArray(s,'list_attackdirection')[i]=a;gmArray(s,'list_attackspeed')[i]=b;gmArray(s,'list_attackframes')[i]=c;
 gmArray(s,'list_attackspecial')[i]=special;gmArray(s,'list_attackwait')[i]=wait;
 if(extra.length===1)gmArray(s,'list_attackspecial2')[i]=extra[0];
 s.attackcountmax++;
}
