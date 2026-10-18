// Spamton's scr_encountersetup (encounter 60) and scr_monstersetup (monster type 49).
import type {GmInstance,GmRuntime} from '../../gm/runtime';
import {sourceText} from '../../host/text';

export const SPAMTON_ENCOUNTERS={
 60:{party:[1],monsters:[['obj_spamton_enemy',49,490,180]],heroes:[[90,170]],intro:'720_0'},
} as const;
const T=(n:number)=>sourceText(`scr_monstersetup_slash_scr_monstersetup_gml_${n}_0`);
/** Called after the shared scr_monster_actreset. */
export function setupSpamtonMonster(s:GmInstance,rt:GmRuntime):boolean{
 const g=rt.globals,me=s.myself;if(g.monstertype[me]!==49)return false;
 g.monstername[me]=T(1564);g.monstermaxhp[me]=600;g.monsterhp[me]=600;g.monsterat[me]=8;g.monsterdf[me]=0;g.monsterexp[me]=0;g.monstergold[me]=-50;
 g.sparepoint[me]=0;g.mercymod[me]=0;g.mercymax[me]=100;
 g.canact[me][0]=1;g.actname[me][0]=T(1576);g.canact[me][1]=1;g.actname[me][1]=T(1579);
 g.canact[me][2]=1;g.actname[me][2]=T(1611);g.actdesc[me][2]=T(1612);g.actcost[me][2]=125;
 return true;
}
