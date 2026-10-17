// The Roaring Knight's encounter (scr_encountersetup 115) and monster (scr_monstersetup type 104).
import type {GmInstance,GmRuntime} from '../../gm/runtime';
import {sourceText} from '../../host/text';

export const KNIGHT_ENCOUNTER={
 n:115,
 heroes:[[126,104],[80,142],[58,190]],
 monster:{name:'obj_knight_enemy',type:104,x:425,y:78},
 intro:'917_0',
} as const;

const T=(key:string)=>sourceText('scr_monstersetup_slash_scr_monstersetup_gml_'+key);
/** scr_monstersetup's block for the Knight, after the caller's shared ACT-table reset. */
export function setupKnightMonster(s:GmInstance,rt:GmRuntime):boolean{
 const g=rt.globals,me=s.myself;if(g.monstertype[me]!==104)return false;
 g.monstername[me]=T('2165_0');g.monstermaxhp[me]=7300;g.monsterhp[me]=7300;g.monsterat[me]=40;g.monsterdf[me]=0;
 g.monsterexp[me]=0;g.monstergold[me]=0;g.sparepoint[me]=0;g.mercymod[me]=0;g.mercymax[me]=100;
 g.canact[me][0]=1;g.actname[me][0]=T('2177_0');g.actdesc[me][0]=T('1877_0');
 g.canact[me][1]=1;g.actname[me][1]=T('2180_0');
 g.canactsus[me][0]=1;g.actnamesus[me][0]=T('2183_0');g.actsimulsus[me][0]=0;
 g.canactral[me][0]=1;g.actnameral[me][0]=T('2187_0');g.actsimulral[me][0]=0;
 return true;
}
