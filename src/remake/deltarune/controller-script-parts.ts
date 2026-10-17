// Small Chapter 2 script differences. The shared controller still owns turn progression and phase creation.
import {gmArray,type GmInstance,type GmRuntime} from '../gm/runtime';
import {C,mergeColor} from '../gm/graphics';
import {monsterParent} from './battle';
import {actSimulChapter2,initChapter2ActTables,resetChapter2Actors,spellMenuSetupChapter2} from './chapter2';
import {nextAct,subst} from './controller';
import {snd} from './sound';
import {sourceText} from '../host/text';

export interface ControllerScripts{
 spellInfoExtra?(s:GmInstance,rt:GmRuntime,id:number):void;
 readonly spellRows:number;
 readonly text:(key:string)=>string;
 readonly healingUsable:number;
 readonly ultimateDescription:number;
 readonly replaceItems:boolean;
 readonly victoryRows:number;
 readonly tensionGoldMultiplier:number;
 mergedSpells(rt:GmRuntime):boolean;
 initActs(s:GmInstance,rt:GmRuntime):void;
 resetActors(s:GmInstance,rt:GmRuntime):void;
 undoAct(s:GmInstance,rt:GmRuntime):void;
 beforeAttack(s:GmInstance,rt:GmRuntime):void;
 hasActors(s:GmInstance,rt:GmRuntime):boolean;
 startActors(s:GmInstance,rt:GmRuntime):void;
 afterCreate(s:GmInstance,rt:GmRuntime):void;
 /** The victory message, its numbers in place. */
 victoryText(rt:GmRuntime):string;
 /** Once the message is set: Chapter 2's level up when an enemy was beaten for good (flag 63) instead of EXP. */
 victoryLevelUp(rt:GmRuntime):void;
 reward(s:GmInstance,rt:GmRuntime):void;
 afterVictory(s:GmInstance,rt:GmRuntime):void;
}
function resetActors(s:GmInstance,rt:GmRuntime){
 resetChapter2Actors(rt);s.messagepriority=-1;s.attackpriority=-1;
 for(s.i=0;s.i<3;s.i++)rt.globals.hittarget[s.i]=0;
}
function undoAct(_s:GmInstance,rt:GmRuntime){
 const g=rt.globals,t=g.charturn,suffix=['','','sus','ral','noe'][g.char[t]];
 if(g.char[t]>=2)for(const m of rt.all(monsterParent))m['acting'+suffix]=0;
 g.actingsingle[t]=0;g.actingsimul[t]=0;
}
function hasActors(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;
 for(s.i=0;s.i<3;s.i++)g.monsterattackname[s.i]=' ';
 s.__noactors=g.acting[0]===1?0:1;
 for(s.__noactorsi=0;s.__noactorsi<3;s.__noactorsi++)if(g.actingsingle[s.__noactorsi]===1)s.__noactors=0;
 return s.__noactors===0;
}
function startActors(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;g.currentactingchar=0;
 if(g.acting[0]===0)nextAct(rt,s);
 if(g.acting[0]===1&&g.actingsimul[0]===1)actSimulChapter2(rt,s);
}
function afterCreate(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;resetChapter2Actors(rt);spellMenuSetupChapter2(rt,s);
 Object.assign(s,{spellpage:0,t_siner:0,myfightreturntimer:1,messagepriority:-1,attackpriority:-1,hidemercy:0,cantspare:[0,0,0],gigaqueeny:0,gigaqueentimer:0,gigaqueencon:0});
 g.turntimer=120;
 for(const key of ['charpos','havechar','mmy'])if(s[key][3]===undefined)s[key][3]=key==='charpos'?-1:0;
 s.hpcolor[3]=C.yellow;gmArray(s,'hpcolorsoft');for(s.i=0;s.i<4;s.i++)s.hpcolorsoft[s.i]=mergeColor(s.hpcolor[s.i],C.white,0.5);
 g.flag[36]=0;g.flag[39]=0;g.flag[63]=0;
}
function reward(_s:GmInstance,rt:GmRuntime){
 const g=rt.globals;
 const count=(id:number)=>g.char.filter((c:number)=>c>0).reduce((n:number,c:number)=>n+(g.chararmor1[c]===id?1:0)+(g.chararmor2[c]===id?1:0),0);
 g.monstergold[3]=Math.floor(g.monstergold[3]*(1+count(8)*0.05)*(1+count(21)*0.3));
 if(g.flag[37]===1)g.monstergold[3]=0;
}
/** scr_levelup (Chapter 2): every beaten-for-good enemy adds HP to the party, and every tenth adds attack and magic;
 * Noelle grows faster. */
function levelUp(rt:GmRuntime){
 const g=rt.globals;g.flag[65]++;
 for(const c of [1,2,3]){g.maxhp[c]+=2;g.hp[c]+=2;}
 if(g.flag[65]%2===0)g.maxhp[2]+=1;
 if(g.flag[65]%10===0){g.at[1]+=1;g.at[2]+=1;g.mag[2]+=1;g.at[3]+=1;g.mag[3]+=1;g.flag[66]++;}
 if(haveChar(rt,4)){g.flag[919]++;g.maxhp[4]+=4;g.hp[4]+=4;if(g.flag[65]%4===0){g.at[4]+=1;g.mag[4]+=1;}}
 const clamp=(v:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,v));
 g.maxhp[1]=clamp(g.maxhp[1],10,160);g.maxhp[2]=clamp(g.maxhp[2],10,190);g.maxhp[3]=clamp(g.maxhp[3],10,140);g.maxhp[4]=clamp(g.maxhp[4],10,999);
 for(let i=1;i<5;i++)g.hp[i]=Math.min(g.hp[i],g.maxhp[i]);
}
const haveChar=(rt:GmRuntime,n:number)=>[0,1,2].some(i=>rt.globals.char[i]===n);
function afterVictory(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;if(g.gold<0)g.gold=0;
 if(g.flag[38]===1){const w=rt.byId(s.lastbattlewriter);if(w)rt.destroy(w);}
}
export const controllerScripts2:ControllerScripts={
 spellInfoExtra:(s,rt,id)=>{
  const rows:Record<number,[number,number,number,number,number,number]>={8:[96,97,98,99,0,80],9:[107,108,109,110,2,40],10:[121,122,123,124,0,rt.globals.maxtension*2],11:[147,148,149,150,1,250]};
  const row=rows[id];if(!row)return;const [name,battle,desc,long,target,cost]=row,T=(n:number)=>sourceText(`scr_spellinfo_slash_scr_spellinfo_gml_${n}_0`);
  Object.assign(s,{spellname:T(name),spellnameb:T(battle),spelldescb:T(desc),spelldesc:T(long),spelltarget:target,cost,spellusable:0});
  if((id===9||id===10)&&rt.globals.charweapon[4]===13)s.cost*=0.5;
 },
 spellRows:6,text:sourceText,healingUsable:0,ultimateDescription:93,replaceItems:true,victoryRows:5,tensionGoldMultiplier:2,
 mergedSpells:rt=>rt.globals.flag[34]===0,
 initActs:(_s,rt)=>initChapter2ActTables(rt),resetActors,undoAct,
 beforeAttack:(s,rt)=>{for(s.__hiti=0;s.__hiti<3;s.__hiti++)rt.globals.hittarget[s.__hiti]=0;},
 hasActors,startActors,afterCreate,reward,afterVictory,
 victoryText:rt=>{
  const g=rt.globals,T=(n:string)=>sourceText('obj_battlecontroller_slash_Step_0_gml_'+n);
  if(g.flag[63]===1)return subst(T(haveChar(rt,4)?'69_0':'46_0'),g.monstergold[3]);
  return g.flag[37]===1?T('43_0'):subst(T('42_0'),g.monsterexp[3],g.monstergold[3]);
 },
 victoryLevelUp:rt=>{if(rt.globals.flag[63]!==1)return;snd(rt,'snd_dtrans_lw',2,0.7);levelUp(rt);},
};
