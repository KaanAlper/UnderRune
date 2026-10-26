import type {GmInstance,GmRuntime} from '../../gm/runtime';
import {sourceText} from '../../host/text';

/** scr_encountersetup 160 in the battle test room. The church arena has an explicit position override. */
export const HAMMER_ENCOUNTER={
 number:160,party:[2],monsters:[['obj_hammer_of_justice_enemy',105,460,161]],heroes:[[108,149],[108,149]],intro:'1120_0',
} as const;
export function hammerHeroPositions(room:string):readonly (readonly [number,number])[]{
 return room==='room_dw_church_arena'?[[629,149],[108,149]]:HAMMER_ENCOUNTER.heroes;
}
/** Called after the chapter's ACT reset, exactly as scr_monstersetup's type 105 block. */
export function setupHammerMonster(s:GmInstance,rt:GmRuntime):boolean{
 const g=rt.globals,i=s.myself;if(g.monstertype[i]!==105)return false;
 const T=(n:number)=>sourceText(`scr_monstersetup_slash_scr_monstersetup_gml_${n}_0`);
 g.monstername[i]=T(2301);g.monstermaxhp[i]=1350;g.monsterhp[i]=1350;g.monsterat[i]=14;g.monsterdf[i]=0;
 g.monsterexp[i]=0;g.monstergold[i]=0;g.sparepoint[i]=0;
 g.canactsus[i][0]=1;g.actnamesus[i][0]=T(2311);g.actdesc[i][0]=T(2312);g.canactsus[i][0]=0;
 return true;
}
