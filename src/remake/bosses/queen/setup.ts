import type {GmInstance,GmRuntime} from '../../gm/runtime';
import {sourceText} from '../../host/text';

export const QUEEN_ENCOUNTERS={
 59:{party:[1,2,3],monsters:[['obj_queen_enemy',48,470,120]],intro:'708_0',kind:'story',music:'queen_boss.ogg',storyRoom:'room_dw_mansion_east_4f_d'},
 84:{party:[1,0,0],monsters:[['obj_gigaqueen_enemy',51,150,0]],intro:'1104_0',kind:'boxing',storyRoom:'room_dw_mansion_top'},
} as const;
const text=(n:number,suffix=0)=>sourceText(`scr_monstersetup_slash_scr_monstersetup_gml_${n}_${suffix}`);

/** Source monster types 48 and 51, after shared ACT-table initialization. No HP or party substitutions. */
export function setupQueenMonster(s:GmInstance,rt:GmRuntime,hasBerdlyPlug:boolean):boolean{
 const g=rt.globals,i=s.myself,type=g.monstertype[i];if(type!==48&&type!==51)return false;
 g.monstername[i]=text(type===48?1499:1656);g.monstermaxhp[i]=type===48?1510:4500;g.monsterhp[i]=g.monstermaxhp[i];
 g.monsterat[i]=type===48?10:7.5;g.monsterdf[i]=0;g.monsterexp[i]=0;g.monstergold[i]=0;g.sparepoint[i]=0;g.mercymod[i]=0;g.mercymax[i]=100;
 const act=(slot:number,key:number,actor?:number,desc?:string,cost?:number)=>{
  g.canact[i][slot]=1;g.actname[i][slot]=text(key);if(actor!==undefined)g.actactor[i][slot]=actor;if(desc!==undefined)g.actdesc[i][slot]=desc;if(cost!==undefined)g.actcost[i][slot]=cost;
 };
 if(type===48){
  if(!hasBerdlyPlug)act(0,1524);
  else{act(0,1529,undefined,undefined,0);act(1,1534,4,' ',0);act(2,1540,2,' ',0);act(3,1552,2,text(1553),150);act(4,1558,3,text(1559),125);g.canactsus[i][0]=1;g.actnamesus[i][0]=text(1563);g.canactral[i][0]=1;g.actnameral[i][0]=text(1566);}
 }else{
  g.canact[i][0]=1;
  const head=g.flag[220],key=({0:1732,1:1731,2:1730,3:1733} as Record<number,number>)[head];if(key!==undefined){g.actname[i][0]=text(key);g.actdesc[i][0]=text(key,1);}g.actcost[i][0]=125;
  act(1,1738,undefined,text(1739),62);act(2,1743,undefined,text(1744),50);
 }
 return true;
}
