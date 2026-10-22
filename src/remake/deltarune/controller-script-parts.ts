// Small Chapter 2 script differences. The shared controller still owns turn progression and phase creation.
import {gmArray,type GmInstance,type GmRuntime} from '../gm/runtime';
import {C,mergeColor} from '../gm/graphics';
import {clamp,round} from '../gm/math';
import {monsterParent} from './battle';
import {actSimulChapter2,initChapter2ActTables,resetChapter2Actors,spellMenuSetupChapter2} from './chapter2';
import {nextAct,subst} from './controller';
import {snd} from './sound';
import {withHook} from './rules';
import {sourceText} from '../host/text';

export interface ControllerScripts{
 spellInfoExtra?(s:GmInstance,rt:GmRuntime,id:number):void;
 readonly spellRows:number;
 readonly text:(key:string)=>string;
 readonly healingUsable:number;
 readonly ultimateDescription:number|string;
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
 if(g.actingsingle[0]===1&&g.actingsingle[1]===0&&g.actingsingle[2]===0)for(const [e,h] of withHook(rt,'soleFirstActor'))h(e,rt);
 if(g.acting[0]===1&&g.actingsimul[0]===1)actSimulChapter2(rt,s);
}
function afterCreate(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;resetChapter2Actors(rt);spellMenuSetupChapter2(rt,s);
 Object.assign(s,{spellpage:0,t_siner:0,myfightreturntimer:1,messagepriority:-1,attackpriority:-1,hidemercy:0,gigaqueeny:0,gigaqueentimer:0,gigaqueencon:0});
 g.turntimer=120;
 for(const key of ['charpos','havechar','mmy'])if(s[key][3]===undefined)s[key][3]=key==='charpos'?-1:0;
 s.hpcolor[3]=C.yellow;gmArray(s,'hpcolorsoft');for(s.i=0;s.i<4;s.i++)s.hpcolorsoft[s.i]=mergeColor(s.hpcolor[s.i],C.white,0.5);
 g.flag[36]=0;g.flag[39]=0;g.flag[63]=0;
}
/** obj_battlecontroller's Create, Chapter 3: Chapter 2's ending without GIGA Queen's values, then the Chapter 3 working
 * values (Rouxls's button grid, the dog minigame, Tenna's boards), the board timer and one random pick (rabbickvar),
 * and the trip ticket. Board battles and the trip ticket are other encounters' and are not ported. */
function afterCreate3(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;resetChapter2Actors(rt);spellMenuSetupChapter2(rt,s);
 Object.assign(s,{spellpage:0,t_siner:0,myfightreturntimer:1,messagepriority:-1,attackpriority:-1,hidemercy:0,cantspare:[0,0,0]});
 g.turntimer=120;
 for(const key of ['charpos','havechar','mmy'])if(s[key][3]===undefined)s[key][3]=key==='charpos'?-1:0;
 s.hpcolor[3]=C.yellow;gmArray(s,'hpcolorsoft');for(s.i=0;s.i<4;s.i++)s.hpcolorsoft[s.i]=mergeColor(s.hpcolor[s.i],C.white,0.5);
 g.flag[36]=0;g.flag[39]=0;g.flag[63]=0;
 Object.assign(s,{disablesusieact:0,mercytotal:0,idefendedthisturn:0,ypostenna:0,oopsallacts:0,spadebuttonenabled:false,spadebuttoncount:0,spadebuttontimer:0,
  heartbuttoncount:0,heartbuttontimer:0,heartbuttondirection:270,heartsuccesstimer:0,heartsuccesscon:0,recentlyhighlightingheart:0,recentlyhighlightingheartvalue:0,
  rouxlsbuttontimer:0,rouxlsbuttoncount:-6,rouxlsbuttoncount2:-6,rouxlsbuttoncount_y:0,rouxlsgridenabled:false,recentlyhighlightingspade:0,recentlyhighlightingspadevalue:0,
  gridchangedirections:true,spadebuttondirection:0,rouxlsbuttondirection:270,rouxlsbuttondirection2:270,rouxlserrorcon:0,rouxlserrortimer:0,rouxlstelegraphtimer:0,
  rouxlstelegraphcon:0,spadetelegraphtimer:0,spadetelegraphcon:0,spadesuccesstimer:0,spadesuccesscon:0,rouxlsbuttonendcon:0,buttonorder:0,spadefail:false,buttonspeed:0,
  norouxlsbutton:false,dogtimer:0,dogcon:0,dogselectedcount:0});
 if(BOARD_ROOMS.has(rt.room.name))throw Error('Chapter 3 board battles (obj_tennabattleconvo_controller) are not ported');
 Object.assign(s,{battletimer:0,battleseconds:0,battleminutes:0,boardend:0});g.boardbattleresult='won';s.rabbickvar=rt.random.choose(0,1);
 Object.assign(s,{tripticket:0,tripticketcon:0,triptickettimer:0});
 if([131,126,125].includes(g.encounterno))throw Error('Chapter 3 trip ticket escape (key item 18) is not ported');
}
const BOARD_ROOMS=new Set(['room_board_1','room_board_2','room_board_3']);
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
 g.maxhp[1]=clamp(g.maxhp[1],10,160);g.maxhp[2]=clamp(g.maxhp[2],10,190);g.maxhp[3]=clamp(g.maxhp[3],10,140);g.maxhp[4]=clamp(g.maxhp[4],10,999);
 for(let i=1;i<5;i++)g.hp[i]=Math.min(g.hp[i],g.maxhp[i]);
}
const haveChar=(rt:GmRuntime,n:number)=>[0,1,2].some(i=>rt.globals.char[i]===n);
function afterVictory(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;if(g.gold<0)g.gold=0;
 if(g.flag[38]===1){const w=rt.byId(s.lastbattlewriter);if(w)rt.destroy(w);}
}
/** scr_spellinfo's Noelle and Susie spells after Chapter 1: [name, battle name, short and long description, target,
 * cost] key numbers. */
type SpellRows=(rt:GmRuntime)=>Record<number,[number,number,number,number,number,number]>;
const spellRows2:SpellRows=rt=>({8:[96,97,98,99,0,80],9:[107,108,109,110,2,40],10:[121,122,123,124,0,rt.globals.maxtension*2],11:[147,148,149,150,1,250]});
/** Chapter 3 renames UltimatHeal to UltraHeal, which gets cheaper with each cast (flag 1045). */
const spellRows3:SpellRows=rt=>({...spellRows2(rt),11:[152,153,149,155,1,225-round((rt.globals.flag[1045]??0)*2.5)]});
const spellInfoExtra=(rows:SpellRows)=>(s:GmInstance,rt:GmRuntime,id:number)=>{
 const row=rows(rt)[id];if(!row)return;const [name,battle,desc,long,target,cost]=row,T=(n:number)=>sourceText(`scr_spellinfo_slash_scr_spellinfo_gml_${n}_0`);
 Object.assign(s,{spellname:T(name),spellnameb:T(battle),spelldescb:T(desc),spelldesc:T(long),spelltarget:target,cost,spellusable:0});
 if((id===9||id===10)&&rt.globals.charweapon[4]===13)s.cost*=0.5;
};
export const controllerScripts2:ControllerScripts={
 spellInfoExtra:spellInfoExtra(spellRows2),
 spellRows:6,text:sourceText,healingUsable:0,ultimateDescription:93,replaceItems:true,victoryRows:5,tensionGoldMultiplier:2,
 mergedSpells:rt=>rt.globals.flag[34]===0,
 initActs:(s,rt)=>{s.cantspare=[0,0,0];initChapter2ActTables(rt);},resetActors,undoAct,
 beforeAttack:(s,rt)=>{for(s.__hiti=0;s.__hiti<3;s.__hiti++)rt.globals.hittarget[s.__hiti]=0;},
 hasActors,startActors,afterCreate,reward,afterVictory,
 victoryText:rt=>{
  const g=rt.globals,T=(n:string)=>sourceText('obj_battlecontroller_slash_Step_0_gml_'+n);
  if(g.flag[63]===1)return subst(T(haveChar(rt,4)?'69_0':'46_0'),g.monstergold[3]);
  return g.flag[37]===1?T('43_0'):subst(T('42_0'),g.monsterexp[3],g.monstergold[3]);
 },
 victoryLevelUp:rt=>{if(rt.globals.flag[63]!==1)return;snd(rt,'snd_dtrans_lw',2,0.7);levelUp(rt);},
};
/** Chapter 3's controller parts: Chapter 2's, with its own Create ending. Parts not yet checked against Chapter 3's code
 * stop with a named error. */
export const controllerScripts3:ControllerScripts={
 ...controllerScripts2,
 ultimateDescription:'scr_spellinfo_slash_scr_spellinfo_gml_93_0_b',
 spellInfoExtra:spellInfoExtra(spellRows3),
 afterCreate:afterCreate3,
 victoryText:()=>{throw Error("Chapter 3's victory message is not ported");},
 victoryLevelUp:()=>{throw Error("Chapter 3's victory level-up is not ported");},
};
