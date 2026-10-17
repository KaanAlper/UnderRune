// Shared obj_battlecontroller and the turn scripts it calls. Create builds the party and the
// enemies from the encounter globals; Step runs the command menus (global.bmenuno) and the victory; Alarm 2 ends
// the enemy turn; Draw draws the bottom panel, the party boxes and the open menu. The heroes, the attack bar and the
// spell phase are their own objects (party.ts); each enemy is its boss module's object. Chapter-specific menu,
// HUD and script parts dispatch through explicit tables alongside this component.
import {gmArray,type GmInstance,type GmObjectDef,type GmRuntime} from '../gm/runtime';
import {C} from '../gm/graphics';
import {eq,gt,le,lt,round} from '../gm/math';
import {KEY,battleController as controllerBase,bulletGenParent,bulletParent,darkener,dmgWriter,heart,heroParent,mergeColor,monsterParent,returnHeart,tensionHeal} from './battle';
import {battleText,face,faceParent,writer} from './writer';
import {optionalSourceText as lang,sourceText} from '../host/text';
import {HERO_DEFS,attackPress,spellPhase,heal,spellText,healAnim} from './party';
import {forChapter,rules,withHook} from './rules';
import {itemInfoChapter2,nextActChapter2} from './chapter2';
import {endBattle} from './battle-end';

import {pressed} from './keys';
import {mercyAdd2} from './chapter2-battle';
import {drawController2} from './controller-chapter2';
import {controllerTail2,stepControllerMenus2} from './controller-menu2';
import {controllerScripts2,type ControllerScripts} from './controller-script-parts';

/** Small script differences alongside the controller; the frame/turn pipeline itself is shared. */
const CONTROLLER_SCRIPTS:Record<number,ControllerScripts>={
 1:{spellRows:4,text:lang,healingUsable:1,ultimateDescription:89,replaceItems:false,mergedSpells:()=>false,
  initActs:()=>{},resetActors:()=>{},undoAct:()=>{},beforeAttack:()=>{},hasActors:(_s,rt)=>rt.globals.acting[0]===1,
  startActors:()=>{},afterCreate:()=>{},victoryRows:4,tensionGoldMultiplier:1,
  victoryText:()=>lang('obj_battlecontroller_slash_Step_0_gml_40_0'),reward:()=>{},afterVictory:()=>{},},
 2:controllerScripts2,
};
const controllerScripts=(rt:GmRuntime)=>forChapter(rt,CONTROLLER_SCRIPTS,'battle controller scripts');
export const left_p=(rt:GmRuntime)=>pressed(rt,KEY.left);
export const right_p=(rt:GmRuntime)=>pressed(rt,KEY.right);
export const up_p=(rt:GmRuntime)=>pressed(rt,KEY.up);
export const down_p=(rt:GmRuntime)=>pressed(rt,KEY.down);
export const button1_p=(rt:GmRuntime)=>pressed(rt,KEY.z,KEY.enter);
export const button2_p=(rt:GmRuntime)=>pressed(rt,KEY.x,KEY.shift);
export const button3_p=(rt:GmRuntime)=>pressed(rt,KEY.c,KEY.ctrl);
/** scr_get_input_name on a keyboard: the key's name in brackets (4 confirm, 5 cancel, 6 menu). */
export const inputName=(n:number)=>'['+['DOWN','RIGHT','UP','LEFT','Z','X','C'][n]+']';
const grid=(rows:number,cols:number,v:unknown)=>Array.from({length:rows},()=>new Array(cols).fill(v));
/** scr_84_get_subst_string: ~1, ~2 ... replaced by the arguments. */
export function subst(str:string,...args:(string|number)[]){args.forEach((a,i)=>{str=str.split('~'+(i+1)).join(String(a));});return str;}
const destroyAll=(rt:GmRuntime,o:GmObjectDef)=>{for(const i of rt.all(o))rt.destroy(i);};
const withId=(rt:GmRuntime,id:number,fn:(i:GmInstance)=>void)=>{const i=rt.byId(id);if(i)fn(i);};
export const findController=(rt:GmRuntime)=>rt.first(controllerBase);

/** scr_monsterpop: how many enemies are still in the battle. */
export const monsterPop=(rt:GmRuntime)=>{const m=rt.globals.monster;return m[0]+m[1]+m[2];};
/** scr_randomtarget, run by an enemy: a random party member who can still be targeted (3 = nobody can be). From
 * Chapter 2 the attack then targets the whole party (mytarget 4). */
export function randomTarget(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;s.abletotarget=1;
 if(g.charcantarget[0]===0&&g.charcantarget[1]===0&&g.charcantarget[2]===0)s.abletotarget=0;
 s.mytarget=rt.random.choose(0,1,2);
 if(s.abletotarget===1){while(g.charcantarget[s.mytarget]===0)s.mytarget=rt.random.choose(0,1,2);}else s.mytarget=3;
 g.targeted[s.mytarget]=1;
 if(rules(rt).enemiesTargetWholeParty&&s.mytarget!==3){for(let i=0;i<3;i++)if(g.charcantarget[i])g.targeted[i]=1;s.mytarget=4;}
}
/** scr_mercyadd per chapter, run by `caller`: Chapter 1 only adds (not below 0); Chapter 2's also caps at 100, rings,
 * and shows the amount over the enemy (mercyAdd2). */
const MERCY_ADD:Record<number,(caller:GmInstance,rt:GmRuntime,enemy:number,amount:number)=>void>={
 1:(_caller,rt,enemy,amount)=>{const g=rt.globals;g.mercymod[enemy]+=amount;if(g.mercymod[enemy]<0)g.mercymod[enemy]=0;},
 2:mercyAdd2,
};
export function mercyAdd(caller:GmInstance,rt:GmRuntime,enemy:number,amount:number){forChapter(rt,MERCY_ADD,'scr_mercyadd')(caller,rt,enemy,amount);}
/** scr_charcan: can this party slot still choose a command? */
function charCan(s:GmInstance,rt:GmRuntime,slot:number){
 const g=rt.globals;s.charcan=1;
 if(g.hp[g.char[slot]]<=0)s.charcan=0;if(g.acting[slot]===1)s.charcan=0;if(g.char[slot]===0)s.charcan=0;if(g.charmove[slot]===0)s.charcan=0;if(g.charauto[g.char[slot]]===1)s.charcan=0;
 return s.charcan===1;
}

/** scr_spellinfo: name, battle name and description, cost and target kind of a spell. */
export function spellInfo(s:GmInstance,rt:GmRuntime,id:number){
 const part=controllerScripts(rt),L=(n:number)=>part.text(`scr_spellinfo_slash_scr_spellinfo_gml_${n}_0`);
 s.cost=-1;s.spelltarget=1;s.spellname=' ';s.spellnameb=' ';s.spelldescb=' ';s.spelldesc=' ';s.spellanim=0;s.spellusable=0;s.spelltext=' ';
 const set=(name:number,nameb:number,descb:number,desc:number|null,target:number,cost:number,usable:number)=>{
  s.spellname=L(name);s.spellnameb=L(nameb);s.spelldescb=L(descb);s.spelldesc=desc===null?' ':L(desc);s.spelltarget=target;s.cost=cost;s.spellusable=usable;
 };
 switch(id){
  case 0:s.spellname=' ';s.spellnameb=' ';s.spelltarget=0;s.cost=-1;s.spelldescb=L(18);break;
  case 1:set(21,22,23,24,2,125,0);break;
  case 2:set(31,32,33,34,1,80,part.healingUsable);s.usable=0;break;
  case 3:set(42,43,44,45,2,40,0);s.usable=0;break;
  case 4:set(52,53,54,55,2,rt.globals.charweapon[2]===7?100:125,0);break;
  case 5:set(64,65,66,null,2,0,0);break;
  case 6:set(75,76,77,null,0,0,0);break;
  case 7:set(86,87,88,part.ultimateDescription,0,0,0);break;
 }
 part.spellInfoExtra?.(s,rt,id);
}
/** scr_spellinfo_all: the spell tables the menus read, for every character's 12 slots. */
export function spellInfoAll(rt:GmRuntime,s:GmInstance){
 const g=rt.globals;
 const rows=controllerScripts(rt).spellRows;
 for(const key of ['spellname','spellnameb','spelldescb','spelldesc','spellcost','spellusable','spelltarget'])g[key]=grid(rows,12,0);
 for(s.j=0;s.j<rows;s.j++)for(s.i=0;s.i<12;s.i++){
  s.spellid=g.spell[s.j]?.[s.i]??0;spellInfo(s,rt,s.spellid);
  g.spellname[s.j][s.i]=s.spellname;g.spellnameb[s.j][s.i]=s.spellnameb;g.spelldescb[s.j][s.i]=s.spelldescb;g.spelldesc[s.j][s.i]=s.spelldesc;
  g.spellcost[s.j][s.i]=s.cost;g.spellusable[s.j][s.i]=s.spellusable;g.spelltarget[s.j][s.i]=s.spelltarget;
 }
}
const ITEMS:Record<number,[number,number,number,number,number]>={
 1:[14,15,1,25,1],2:[21,22,1,400,1],3:[28,29,0,200,0],4:[35,36,2,1,0],5:[42,43,1,5,1],6:[49,50,2,150,1],7:[56,57,2,5,1],8:[63,64,1,70,1],
 9:[70,71,1,10,1],10:[77,78,1,10,1],11:[84,85,2,70,1],12:[91,92,1,40,1],13:[98,99,1,40,1],14:[105,106,1,10,1],15:[112,113,1,50,1],
};
/** scr_iteminfo: an item's battle name and description, its target kind (0 none, 1 one ally, 2 everyone) and use. */
function itemInfo1(s:GmInstance,id:number){
 s.usable=0;s.value=0;s.itemtarget=0;s.itemnameb=' ';s.itemdescb=' ';
 if(id===0){s.itemnameb=' ';s.itemdescb='---';return;}
 const it=ITEMS[id];if(!it)return;
 s.itemnameb=lang(`scr_iteminfo_slash_scr_iteminfo_gml_${it[0]}_0`);s.itemdescb=lang(`scr_iteminfo_slash_scr_iteminfo_gml_${it[1]}_0`);
 s.itemtarget=it[2];s.value=it[3];s.usable=it[4];
}
const ITEM_INFO:Record<number,(s:GmInstance,id:number,rt:GmRuntime)=>void>={1:itemInfo1,2:(s,id,rt)=>itemInfoChapter2(s,rt,id)};
export function itemInfo(s:GmInstance,id:number,rt?:GmRuntime){if(rt)forChapter(rt,ITEM_INFO,'scr_iteminfo')(s,id,rt);else itemInfo1(s,id);}
export function itemInfoTemp(s:GmInstance,slot:number,rt:GmRuntime){
 gmArray(s,'tempitemnameb',()=>grid(13,3,' '));gmArray(s,'tempitemdescb',()=>grid(13,3,' '));gmArray(s,'tempitemvalue',()=>grid(13,3,0));gmArray(s,'tempitemusable',()=>grid(13,3,0));
 for(s.i=0;s.i<12;s.i++){itemInfo(s,s.tempitem[s.i][slot],rt);s.tempitemnameb[s.i][slot]=s.itemnameb;s.tempitemdescb[s.i][slot]=s.itemdescb;s.tempitemvalue[s.i][slot]=s.value;s.tempitemusable[s.i][slot]=s.usable;}
}
/** scr_itemshift_temp: the bag as this character sees it, with the chosen item taken out. */
export function itemShiftTemp(s:GmInstance,index:number,slot:number){s.tempitem[12][slot]=0;for(s.i=index;s.i<12;s.i++)s.tempitem[s.i][slot]=s.tempitem[s.i+1][slot];}
/** scr_itemshift: the real bag loses an item. */
export function itemShift(rt:GmRuntime,index:number){const g=rt.globals;g.item[12]=0;for(let i=index;i<12;i++)g.item[i]=g.item[i+1];}

/** scr_spellconsumeb: the chosen spell (or SPARE's 100) is this character's action. */
export function spellConsume(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,t=g.charturn;
 g.tension-=s.cost;g.faceaction[t]=2;g.charaction[t]=2;
 g.charspecial[t]=controllerScripts(rt).mergedSpells(rt)?g.battlespell[t][g.bmenucoord[2][t]]:g.spell[g.char[t]][g.bmenucoord[2][t]];g.tensionselect=0;
 nextHero(s,rt);
}
/** scr_itemconsumeb: the chosen item, as spell 200 + id. */
export function itemConsume(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,t=g.charturn;
 g.faceaction[t]=3;g.charaction[t]=4;g.charspecial[t]=s.tempitem[g.bmenucoord[4][t]][t]+200;
 if(controllerScripts(rt).replaceItems&&s.replaceable>0)s.tempitem[g.bmenucoord[4][t]][t]=s.replaceable;
 else if(s.usable===1)itemShiftTemp(s,g.bmenucoord[4][t],t);
 nextHero(s,rt);
}
/** scr_nexthero: the next party member who can choose, or the end of choosing. */
export function nextHero(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;s.moveswapped=0;s.prevturn=g.charturn;
 if(g.charturn===0){
  s.moveswapped=1;
  if(g.charmove[1]===1&&charCan(s,rt,1))g.charturn=1;
  else if(g.charmove[2]===1&&charCan(s,rt,2))g.charturn=2;
  else endTurn(s,rt);
 }
 if(g.charturn===1&&s.moveswapped===0){s.moveswapped=1;if(charCan(s,rt,2)&&g.acting[1]===0)g.charturn=2;else endTurn(s,rt);}
 if(g.charturn===2&&s.moveswapped===0)endTurn(s,rt);
 if(s.moveswapped===1)g.bmenuno=0;
 if(g.charturn>0){g.temptension[g.charturn]=g.tension;for(s.i=0;s.i<12;s.i++)s.tempitem[s.i][g.charturn]=s.tempitem[s.i][s.prevturn];}
}
/** scr_prevhero: X goes back to the previous party member and undoes their choice. */
export function prevHero(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;s.prevturn=g.charturn;s.moveswapped=0;
 if(g.charturn===1&&g.charmove[0]===1){g.charturn=0;s.moveswapped=1;}
 if(g.charturn===2){s.moveswapped=1;if(g.charmove[1]===1&&g.acting[1]===0)g.charturn=1;else if(g.charmove[0]===1)g.charturn=0;}
 if(s.moveswapped===1){
  const t=g.charturn;g.bmenuno=0;g.faceaction[t]=0;g.chartarget[t]=0;g.charaction[t]=0;g.charspecial[t]=0;s.movenoise=1;
  controllerScripts(rt).undoAct(s,rt);
 }
 if(g.charturn===0){
  for(const m of rt.all(monsterParent))m.acting=0;
  g.acting[0]=0;g.acting[1]=0;g.acting[2]=0;g.faceaction[1]=0;g.chartarget[1]=0;g.charaction[1]=0;g.charspecial[1]=0;g.faceaction[2]=0;
  g.tension=g.temptension[0];for(s.i=0;s.i<12;s.i++)s.tempitem[s.i][0]=g.item[s.i];
 }else{g.tension=g.temptension[g.charturn];for(s.i=0;s.i<12;s.i++)s.tempitem[s.i][g.charturn]=s.tempitem[s.i][g.charturn-1];}
}
/** scr_endturn: everyone has chosen. Text goes; the ACT (if any) runs first, otherwise the attack phase. */
function endTurn(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;
 for(s.i=0;s.i<12;s.i++)g.item[s.i]=s.tempitem[s.i][g.charturn];
 for(s.i=0;s.i<12;s.i++)for(s.j=0;s.j<3;s.j++)s.tempitem[s.i][s.j]=g.item[s.i];
 s.moveswapped=0;
 destroyAll(rt,writer);destroyAll(rt,face);for(const f of smallFaces(rt))rt.destroy(f);
 g.attacking=0;
 for(let i=0;i<3;i++){
  if(g.charauto[g.char[i]]===1&&g.hp[g.char[i]]>0){if(g.monster[2]===1)g.chartarget[i]=2;if(g.monster[1]===1)g.chartarget[i]=1;if(g.monster[0]===1)g.chartarget[i]=0;}
  if(g.charaction[i]===1)g.attacking=1;
 }
 const part=controllerScripts(rt);
 if(!part.hasActors(s,rt))attackPhase(rt);else{g.charturn=3;g.myfight=3;part.startActors(s,rt);}
 if(part.replaceItems){s.messagepriority=-1;s.attackpriority=-1;}
}
/** scr_nextact: enemies call this after the current ACT's writer/animation completes. */
/** After an ACT, per chapter: Chapter 1 goes on to the attack phase; Chapter 2's scr_nextact first hands over to the
 * next hero's single ACT and says whether the attack phase starts. */
const NEXT_ACT:Record<number,(rt:GmRuntime,caller:GmInstance)=>boolean>={1:()=>true,2:nextActChapter2};
export function nextAct(rt:GmRuntime,caller:GmInstance){if(forChapter(rt,NEXT_ACT,'scr_nextact')(rt,caller))attackPhase(rt);}
/** scr_attackphase: spells and items first (obj_spellphase), then the FIGHT bar (obj_attackpress). */
export function attackPhase(rt:GmRuntime){
 const g=rt.globals,c=findController(rt);if(!c)return;
 c.techwon=0;if(monsterPop(rt)===0)c.techwon=1;
 if(c.techwon===0){
  controllerScripts(rt).beforeAttack(c,rt);
  c.fightphase=1;g.charturn=3;
  for(let i=0;i<3;i++)if(g.charaction[i]===4||g.charaction[i]===2)c.fightphase=0;
  if(g.myfight===4)c.fightphase=1;
  if(c.fightphase===1){g.myfight=1;rt.create(attackPress,rt.view.x+2,rt.view.y+365);}
  else{g.myfight=4;rt.create(spellPhase,0,0);}
 }else winCombat(rt);
}
/** scr_wincombat: the last enemy is gone. */
export function winCombat(rt:GmRuntime){
 const g=rt.globals;g.myfight=7;g.mnfight=-1;
 for(const c of rt.all(controllerBase))c.victory=1;
 for(let i=0;i<3;i++){const m=rt.byId(g.monsterinstance[i]);if(g.monster[i]===1&&m)monsterDefeat(m,rt);}
}
/** scr_monsterdefeat, run by the enemy: rewards, the battle's outcome flags, then the enemy's own event 11. */
export function monsterDefeat(m:GmInstance,rt:GmRuntime){
 const g=rt.globals,i=m.myself;
 if(g.monster[i]===1){
  g.monstergold[3]+=g.monstergold[i];g.monsterexp[3]+=g.monsterexp[i];g.monster[i]=0;
  if(g.flag[51+i]===0){g.flag[51+i]=2;if(g.monsterhp[i]<=0)g.flag[51+i]=1;}
  const counters:Record<number,number>={1:40,2:41,3:42,5:43};if(counters[g.flag[51+i]]!==undefined)g.flag[counters[g.flag[51+i]]]+=1;
  if(monsterPop(rt)===0){
   let violenced=0,spared=0,pacified=0;
   for(let d=0;d<3;d++){if(g.flag[51+d]===1)violenced++;if(g.flag[51+d]===2)spared++;if(g.flag[51+d]===3)pacified++;}
   if(pacified>0)g.flag[50]=3;if(spared>0)g.flag[50]=2;if(violenced>0)g.flag[50]=1;
  }
 }
 rt.userEvent(m,11);
}
/** scr_mnendturn (Alarm 2): back to the command menus, reviving downed members by an eighth of their HP. */
export function mnEndTurn(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;
 for(let slot=0;slot<3;slot++)if(g.char[slot]===2)s.sus=slot;
 s.techwon=0;if(monsterPop(rt)===0)s.techwon=1;
 if(s.techwon!==0){winCombat(rt);return;}
 if(g.flag[14]===0)g.bmenucoord=grid(20,20,0);
 g.mnfight=0;g.myfight=0;g.bmenuno=0;g.charturn=0;s.skip=0;
 for(s.i=0;s.i<3;s.i++){
  const i=s.i;withId(rt,g.charinstance[i],h=>{h.tu=0;});
  s.hptarget=g.char[i];const t=s.hptarget;
  if(t!==0&&g.hp[t]<=0){
   const amount=Math.ceil(g.maxhp[t]/8),h=rt.byId(g.charinstance[i])!;
   const w=rt.create(dmgWriter,h.x,h.y+h.myheight-24);w.delay=1;w.type=3;
   w.damage=heal(s,rt,i,amount);
   if(g.hp[t]>=1)w.specialmessage=4;
  }
 }
 if(g.charmove[0]===0||g.charauto[g.char[0]]===1)g.charturn=1;
 if(g.charturn===1&&(g.charmove[1]===0||g.charauto[g.char[1]]===1))g.charturn=2;
 if(g.charturn===2&&(g.charmove[2]===0||g.charauto[g.char[2]]===1))s.skip=1;
 for(let i=0;i<3;i++){g.acting[i]=0;g.temptension[i]=g.tension;g.charspecial[i]=0;g.targeted[i]=0;g.charaction[i]=0;g.faceaction[i]=0;}
 for(const m of rt.all(monsterParent)){m.attacked=0;m.talked=0;m.acting=0;}
 controllerScripts(rt).resetActors(s,rt);
 if(s.skip===1){if(g.char[0]===2&&g.charauto[2]===1){g.acting[0]=1;g.myfight=3;}endTurn(s,rt);}
 for(s.i=0;s.i<12;s.i++)for(s.j=0;s.j<3;s.j++)s.tempitem[s.i][s.j]=g.item[s.i];
}
/** scr_endcombat: the battle is over; obj_endbattle fades it out, and the host sees room 'battle_end'. */
export function endCombat(s:GmInstance,rt:GmRuntime){
 rt.globals.fighting=0;
 rt.create(endBattle,0,0);
 destroyAll(rt,monsterParent);destroyAll(rt,bulletParent);destroyAll(rt,heroParent);rt.destroy(s);
 rt.pendingRoom='battle_end';
}

function create(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;
 for(const character of g.char)if(character>HERO_DEFS.length)throw Error(`Battle hero ${character} is not ported`);
 Object.assign(s,{victory:0,victoried:0,skipvictory:0,battlewriter:19212912,myface:1913918291,lbuffer:0,rbuffer:0,onebuffer:0,twobuffer:0});
 g.battleend=0;g.darkzone=1;g.fighting=1;g.fe=0;g.fc=0;g.typer=4;g.battletyper=4;g.myfight=0;g.mnfight=0;g.bmenuno=0;g.attacking=0;g.acting=0;g.tension=0;g.spelldelay=10;
 spellInfoAll(rt,s);
 g.tensionselect=0;g.temptension=[0,0,0];s.tempitem=grid(13,3,0);
 for(let j=0;j<3;j++){g.temptension[j]=g.tension;for(let i=0;i<13;i++)s.tempitem[i][j]=g.item[i]??0;}
 for(const key of ['charcond','automiss','charmove','charcantarget','chardead'])g[key]??=[0,0,0];
 for(let i=0;i<3;i++){g.charcond[i]=0;g.automiss[i]=0;if(g.char[i]!==0){g.charmove[i]=1;g.charcantarget[i]=1;g.chardead[i]=0;}else{g.charmove[i]=0;g.charcantarget[i]=0;}}
 s.itempage=0;for(let f=50;f<=53;f++)g.flag[f]=0;
 for(const key of ['monster','monsterx','monstery','monsterat','monsterdf','monsterhp','monstermaxhp','sparepoint','hittarget','mercymod','mercymax','monsterstatus'])g[key]=[0,0,0];
 g.monstername=[' ',' ',' '];g.monstercomment=[' ',' ',' '];g.monsterinstance=[12913921839,12913921839,12913921839];g.monstergold=[0,0,0,0];g.monsterexp=[0,0,0,0];
 for(const key of ['act','canact','acttype','actspell','actcost'])g[key]=grid(3,6,0);
 g.actname=grid(3,6,' ');g.actdesc=grid(3,6,' ');g.actactor=grid(3,6,1);
 controllerScripts(rt).initActs(s,rt);
 for(let i=0;i<3;i++)if(g.monstertype[i]>0){
  g.monster[i]=1;const m=rt.create(g.monsterinstancetype[i],g.monstermakex[i],g.monstermakey[i]);g.monsterinstance[i]=m.id;m.myself=i;rt.userEvent(m,12);
 }
 g.charturn=0;
 for(const key of ['acting','charaction','charspecial','chartarget','faceaction','rembmenuno','targeted','battleat','battledf','battlemag'])g[key]=[0,0,0];
 for(let i=0;i<3;i++){
  const c=g.char[i],sum=(base:number[],item:number[][])=>base[c]+item[c][0]+item[c][1]+item[c][2];
  g.battleat[i]=sum(g.at,g.itemat);g.battledf[i]=sum(g.df,g.itemdf);g.battlemag[i]=sum(g.mag,g.itemmag);
 }
 g.bmenucoord=grid(20,20,0);
 Object.assign(s,{movenoise:0,selnoise:0,laznoise:0,damagenoise:0,grazenoise:0});
 s.bcolor=mergeColor(mergeColor(C.purple,C.black,0.7),0x404040,0.5);
 Object.assign(s,{tp:0,tpy:50,bp:0,bpy:152,intro:1,chartotal:0,charpos:[-1,-1,-1],havechar:[0,0,0],mmy:[0,0,0]});
 g.charinstance=[12129292,12129292,12129292];
 for(let i=0;i<3;i++){
  const c=g.char[i];if(c!==0)s.chartotal+=1;
  if(c>=1&&c<=HERO_DEFS.length){
   s.havechar[c-1]=1;s.charpos[c-1]=i;
   const h=rt.create(HERO_DEFS[c-1],g.heromakex[i],g.heromakey[i]);g.charinstance[i]=h.id;h.myself=i;h.char=c;h.depth=200-i*20;
  }
 }
 s.slmxx=0;s.slmyy=0;s.s_siner=0;
 rt.create(tensionBar,0,0);
 s.reset=0;s.timeron=1;s.noreturn=0;s.hpcolor=[C.aqua,0xff00ff,C.lime];
 controllerScripts(rt).afterCreate(s,rt);
}

/** The writer and portraits sit above the panel (depth 3) on the command row and below it (10) in a submenu. */
export function writerDepth(s:GmInstance,rt:GmRuntime,depth:number,skip:boolean){
 const w=rt.byId(s.battlewriter);if(w){if(skip)w.skipme=1;w.depth=depth;}
 for(const f of rt.all(faceParent))f.depth=depth;
 for(const f of smallFaces(rt))f.depth=depth;
}
function smallFaces(rt:GmRuntime){return rt.instances.filter(i=>{if(!i.live)return false;for(let d:GmObjectDef|undefined=i.object;d;d=d.parent)if(d.name==='obj_smallface')return true;return false;});}
export function commandMenu(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,t=()=>g.charturn as number,coord=g.bmenucoord;
  if(g.bmenuno===0){
   if(!rt.byId(s.battlewriter)){g.msg[0]=g.battlemsg[0];g.typer=g.battletyper;s.battlewriter=battleText(rt,s).id;}
   if(left_p(rt)&&s.lbuffer<0){if(coord[0][t()]===0)coord[0][t()]=4;else coord[0][t()]-=1;s.movenoise=1;s.rbuffer=1;}
   if(right_p(rt)&&s.rbuffer<0){if(coord[0][t()]===4)coord[0][t()]=0;else coord[0][t()]+=1;s.movenoise=1;s.lbuffer=1;}
   if(button1_p(rt)&&s.twobuffer<0){
    s.onebuffer=1;s.selnoise=1;const c=coord[0][t()];
    if(c===0)g.bmenuno=1;
    if(c===1&&g.char[t()]!==1){s.onebuffer=1;g.bmenuno=2;}
    if(c===1&&g.char[t()]===1){s.onebuffer=1;g.bmenuno=11;}
    if(c===2&&s.tempitem[0][t()]!==0){
     s.onebuffer=1;g.bmenuno=4;itemInfoTemp(s,t(),rt);
     for(s.i=0;s.i<12;s.i++)if(s.tempitem[coord[4][t()]][t()]===0&&coord[4][t()]>0)coord[4][t()]-=1;
    }
    if(c===3){s.onebuffer=1;g.bmenuno=12;}
    if(c===4){tensionHeal(rt,40);g.faceaction[t()]=4;g.charaction[t()]=10;nextHero(s,rt);for(const [e,h] of withHook(rt,'onCommandChosen'))h(e,s,rt,'defend');}
   }
   if(button2_p(rt)&&s.onebuffer<0&&g.charturn>0){s.twobuffer=1;s.movenoise=1;prevHero(s,rt);}
   writerDepth(s,rt,3,false);
  }
}
function stepMenus1(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,t=()=>g.charturn as number,coord=g.bmenucoord;
  commandMenu(s,rt);
  if(g.bmenuno===2){
   writerDepth(s,rt,10,true);
   const ch=g.char[t()],sp=g.spell[ch],costs=g.spellcost[ch],C2=()=>coord[2][t()] as number;
   if(right_p(rt)){
    let cango=1;const sc=C2();
    if(sc<11){if(sp[C2()+1]===0){cango=0;if(sc%2===1&&sc>0)coord[2][t()]-=1;}}
    else{coord[2][t()]-=1;cango=0;}
    if(cango===1){if(sc%2===0)coord[2][t()]+=1;else coord[2][t()]-=1;}
   }
   if(left_p(rt)){const sc=C2();if(sp[1]!==0){if(sc%2===0)coord[2][t()]+=1;else coord[2][t()]-=1;}}
   if(down_p(rt)){
    const sc=C2();let cango=1;
    if(sc>=10)cango=0;else{if(sp[sc+2]===0)cango=0;if(sc===5&&sp[6]!==0&&sp[7]===0)cango=2;}
    if(cango===1)coord[2][t()]+=2;if(cango===2)coord[2][t()]=6;
   }
   if(up_p(rt)){const sc=C2();if(sc>1)coord[2][t()]-=2;}
   g.tensionselect=costs[C2()];
   if(button1_p(rt)&&sp[C2()]!==0&&s.onebuffer<0){
    if(costs[C2()]<=g.tension){
     s.onebuffer=2;g.bmenuno=0;s.selnoise=1;
     {
      spellInfo(s,rt,sp[C2()]);
      if(s.spelltarget===0)spellConsume(s,rt);
      if(s.spelltarget===1)g.bmenuno=8;
      if(s.spelltarget===2)g.bmenuno=3;
     }
    }
   }
   if(button2_p(rt)&&s.onebuffer<0){g.tensionselect=0;s.twobuffer=1;g.bmenuno=0;s.movenoise=1;}
  }
  if(g.bmenuno===4){
   writerDepth(s,rt,10,true);
   const ti=s.tempitem,C4=()=>coord[4][t()] as number;
   if(ti[C4()][t()]===0)coord[4][t()]-=1;
   if(right_p(rt)){
    let cango=1;const ic=C4();
    if(ic<11){if(ti[C4()+1][t()]===0){cango=0;if(ic%2===1&&ic>0)coord[4][t()]-=1;}}
    else{coord[4][t()]-=1;cango=0;}
    if(cango===1){if(ic%2===0)coord[4][t()]+=1;else coord[4][t()]-=1;}
   }
   if(left_p(rt)){const ic=C4();if(ti[1][t()]!==0){if(ic%2===0)coord[4][t()]+=1;else coord[4][t()]-=1;}}
   if(down_p(rt)){
    const ic=C4();let cango=1;
    if(ic>=10)cango=0;else{if(ti[ic+2][t()]===0)cango=0;if(ic===5&&ti[6][t()]!==0&&ti[7][t()]===0)cango=2;}
    if(cango===1)coord[4][t()]+=2;if(cango===2)coord[4][t()]=6;
   }
   if(up_p(rt)){const ic=C4();if(ic>1)coord[4][t()]-=2;}
   if(ti[C4()][t()]===0)coord[4][t()]-=1;
   if(button1_p(rt)&&ti[C4()][t()]!==0&&s.onebuffer<0){
    s.onebuffer=2;g.bmenuno=0;s.selnoise=1;itemInfo(s,ti[C4()][t()],rt);
    if(s.itemtarget===0||s.itemtarget===2){
     const item=ti[C4()][t()];
     void item;itemConsume(s,rt);
    }
    if(s.itemtarget===1)g.bmenuno=7;
   }
   if(button2_p(rt)&&s.onebuffer<0){s.twobuffer=1;g.bmenuno=0;s.movenoise=1;}
  }
  if(g.bmenuno===9){
   const enemy=coord[11][t()],C9=()=>coord[9][t()] as number,can=g.canact[enemy],costs=g.actcost[enemy];
   if(right_p(rt)){
    let cango=1;const ac=C9();
    if(ac<5){if(can[C9()+1]===0){cango=0;if(ac%2===1&&ac>0)coord[9][t()]-=1;}}
    else{coord[9][t()]-=1;cango=0;}
    if(cango===1){if(ac%2===0)coord[9][t()]+=1;else coord[9][t()]-=1;}
   }
   if(left_p(rt)){const ac=C9();if(ac%2===0){if(can[ac+1]!==0)coord[9][t()]+=1;}else coord[9][t()]-=1;}
   if(down_p(rt)){const ac=C9();let cango=1;if(ac>=4)cango=0;else if(can[ac+2]===0)cango=0;if(cango===1)coord[9][t()]+=2;}
   if(up_p(rt)){const ac=C9();if(ac>1)coord[9][t()]-=2;}
   g.tensionselect=costs[C9()];
   let canpress=1;const actor=g.actactor[coord[11][t()]][C9()];
   if((actor===2||actor===4)&&(s.havechar[1]===0||g.hp[2]<=0))canpress=0;
   if((actor===3||actor===4)&&(s.havechar[2]===0||g.hp[3]<=0))canpress=0;
   if(canpress===1&&button1_p(rt)&&can[C9()]===1&&g.tension>=g.tensionselect&&s.onebuffer<0){
    s.onebuffer=2;g.bmenuno=0;s.selnoise=1;g.tension-=costs[C9()];g.tensionselect=0;
    {
    withId(rt,g.monsterinstance[enemy],m=>{m.acting=C9()+1;});
    g.acting[0]=1;
    if(actor===2)g.acting[s.charpos[1]]=1;
    if(actor===3)g.acting[s.charpos[2]]=1;
    if(actor===4){g.acting[2]=1;g.acting[1]=1;}
    for(let i=0;i<3;i++)if(g.acting[i]===1){g.faceaction[i]=6;g.charaction[i]=9;}
    }
    nextHero(s,rt);
   }
   if(button2_p(rt)&&s.onebuffer<0){g.tensionselect=0;s.twobuffer=1;g.bmenuno=11;s.movenoise=1;}
  }
  const targetMenu=()=>[7,1,8,3,11,12].includes(g.bmenuno);
  if(targetMenu()){
   writerDepth(s,rt,10,true);
   if(button2_p(rt)&&s.onebuffer<0){
    s.twobuffer=1;
    if(g.bmenuno===1||g.bmenuno===11||g.bmenuno===12)g.bmenuno=0;
    if(g.bmenuno===7)g.bmenuno=4;
    if(g.bmenuno===8||g.bmenuno===3||g.bmenuno===13)g.bmenuno=2;
    s.movenoise=1;
   }
   if(targetMenu()){
    const ht=[0,0,0],m=g.bmenuno;
    if(m===7||m===8)for(let i=0;i<3;i++)ht[i]=g.char[i]>0?1:0;
    if(m===1||m===3||m===11||m===12)for(let i=0;i<3;i++)ht[i]=g.monster[i];
    const cur=()=>coord[m][t()] as number,set=(v:number)=>{coord[m][t()]=v;};
    if(cur()===2&&ht[2]===0)set(0);
    if(cur()===0&&ht[0]===0)set(1);
    if(cur()===1&&ht[1]===0)set(0);
    if(cur()===0&&ht[0]===0)set(2);
    const move=(order:number[])=>{for(const o of order)if(ht[o]===1){s.movenoise=1;set(o);return;}};
    if(down_p(rt)){if(cur()===0)move([1,2]);else if(cur()===1)move([2,0]);else if(cur()===2)move([0,1]);}
    if(up_p(rt)){if(cur()===0)move([2,1]);else if(cur()===1)move([0,2]);else if(cur()===2)move([1,0]);}
    if(button1_p(rt)&&s.onebuffer<0){
     s.onebuffer=1;s.selnoise=1;
     if(m===1){g.chartarget[t()]=cur();g.faceaction[t()]=1;g.charaction[t()]=1;nextHero(s,rt);}
     if(m===7){g.chartarget[t()]=cur();itemConsume(s,rt);}
     if(m===8||m===3){g.chartarget[t()]=cur();spellConsume(s,rt);}
     if(m===11){
      g.bmenuno=9;let ac=coord[9][t()];const enemy=coord[11][t()];
      const can=g.canact[enemy];
      for(let i=0;i<6;i++)if(can[ac]===0&&ac>0){coord[9][t()]-=1;ac-=1;}
      s.onebuffer=1;
     }
     if(m===12){g.faceaction[t()]=10;g.chartarget[t()]=cur();g.charaction[t()]=2;g.charspecial[t()]=100;nextHero(s,rt);}

    }
   }
  }
}
const CONTROLLER_MENUS:Record<number,(s:GmInstance,rt:GmRuntime)=>void>={1:stepMenus1,2:stepControllerMenus2};
const CONTROLLER_TAIL:Record<number,(s:GmInstance,rt:GmRuntime)=>void>={1:()=>{},2:controllerTail2};
function step(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,t=()=>g.charturn as number;
 if(withHook(rt,'blocksControllerStep').some(([e,h])=>h(e,s,rt)))return;
 if(s.victory===1&&s.victoried===0){
  g.faceaction[0]=0;g.faceaction[1]=0;g.faceaction[2]=0;g.battleend=1;g.mnfight=-1;g.myfight=7;
  withId(rt,s.battlewriter,w=>rt.destroy(w));destroyAll(rt,face);for(const f of smallFaces(rt))rt.destroy(f);
  for(s.i=0;s.i<controllerScripts(rt).victoryRows;s.i++)if(g.hp[s.i]<1)g.hp[s.i]=round(g.maxhp[s.i]/8);
  s.lastbattlewriter=32482473284732;
  if(s.skipvictory===0){
   g.monstergold[3]+=Math.floor(g.tension/10)*controllerScripts(rt).tensionGoldMultiplier;if(g.charweapon[1]===8)g.monstergold[3]+=Math.floor(g.monstergold[3]/20);
   controllerScripts(rt).reward(s,rt);g.gold=(g.gold??0)+g.monstergold[3];g.xp=(g.xp??0)+g.monsterexp[3];g.fc=0;g.fe=0;
   g.battlemsg[0]=subst(controllerScripts(rt).victoryText(rt),g.monsterexp[3],g.monstergold[3]);
   g.msg[0]=g.battlemsg[0];g.typer=g.battletyper;s.lastbattlewriter=battleText(rt,s).id;controllerScripts(rt).afterVictory(s,rt);
   for(let i=0;i<3;i++)withId(rt,g.charinstance[i],h=>{h.state=7;h.hurt=0;h.hurttimer=0;});
  }
  s.victoried=1;s.victortimer=0;if(s.skipvictory===1)s.victortimer=-20;
  for(const b of rt.all(tensionBar)){b.alarm[5]=15;b.hspeed=-10;b.friction=-0.4;}
 }
 if(s.victoried===1){s.victortimer+=1;if(!rt.byId(s.lastbattlewriter)&&s.victortimer>=10){s.intro=2;if(s.bp<=0){endCombat(s,rt);return;}}}
 if(g.myfight===0){
  const coord=g.bmenucoord;
  forChapter(rt,CONTROLLER_MENUS,'battle controller menus')(s,rt);
 }
 if(s.movenoise===1){rt.sound?.('snd_menumove');s.movenoise=0;}
 if(s.grazenoise===1){rt.sound?.('snd_graze');s.grazenoise=0;}
 if(s.selnoise===1){rt.sound?.('snd_select');s.selnoise=0;}
 if(s.damagenoise===1){rt.sound?.('snd_damage');s.damagenoise=0;}
 if(s.laznoise===1){rt.sound?.('snd_laz_c');s.laznoise=0;}
 s.onebuffer-=1;s.twobuffer-=1;s.lbuffer-=1;s.rbuffer-=1;
 if(g.mnfight===2&&s.timeron===1){
  g.turntimer-=1;
  if(le(g.turntimer,0)&&s.reset===0){
   destroyAll(rt,bulletParent);destroyAll(rt,bulletGenParent);
   for(const d of rt.all(darkener))d.darken=0;
   for(const h of rt.all(heart)){rt.create(returnHeart,h.x,h.y);rt.destroy(h);}
   s.reset=1;if(s.noreturn===0)s.alarm[2]=15;
  }
 }
 forChapter(rt,CONTROLLER_TAIL,'battle controller turn states')(s,rt);
}

// ---- Draw: the bottom panel (scr_charbox, scr_selectionmatrix) and the open menu ----
let measure:((s:string)=>number)|undefined;
/** string_width in fnt_mainbig, supplied by the host renderer (16 px per character without one). */
export function setHudMeasure(fn:(s:string)=>number){measure=fn;}
const nameWidth=(s:string)=>measure?measure(s.replace(/#/g,'\n')):s.length*16;
const nl=(s:string)=>String(s).replace(/#/g,'\n');

function selectionMatrix(s:GmInstance,rt:GmRuntime,color:number,x:number,y:number){
 const d=rt.drawState;s.slmxx=x;s.slmyy=y;s.s_siner+=2;d.color=color;rt.drawRect(x,y,x+210,y+3);
 for(let i=0;i<12;i++){
  const m=s.s_siner+i*(10*Math.PI);d.alpha=Math.sin(m/60);
  rt.drawLine(x,y,x,y+33,2);rt.drawLine(x+210,y,x+210,y+33,2);
  if(Math.cos(m/60)<0){const o=Math.sin(m/60)*30;rt.drawLine(x-o+30,y,x-o+30,y+33,2);rt.drawLine(x+210+o-30,y,x+210+o-30,y+33,2);}
 }
 d.alpha=1;
}
const HEADS=['spr_headkris','spr_headsusie','spr_headralsei'],NAMES=['spr_bnamekris','spr_bnamesusie','spr_bnameralsei'];
function charBox(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,d=rt.drawState,xx=rt.view.x,yy=rt.view.y,bp=s.bp,bpoff=-bp+s.bpy+yy;
 for(let c=0;c<3;c++){
  if(s.havechar[c]!==1)continue;
  const charcolor=s.hpcolor[c],gc=g.charturn,pos=s.charpos[c];
  let xchunk=0;
  if(s.chartotal===3)xchunk=[0,212,424][pos];
  if(s.chartotal===2)xchunk=[106,326][pos]??0;
  if(s.chartotal===1&&pos===0)xchunk=212;
  if(gc===pos){
   if(g.myfight===0){d.color=charcolor;selectionMatrix(s,rt,charcolor,xx+xchunk,480-bp+yy);}
   if(s.mmy[c]>-32)s.mmy[c]-=2;if(s.mmy[c]>-24)s.mmy[c]-=4;if(s.mmy[c]>-16)s.mmy[c]-=6;if(s.mmy[c]>-8)s.mmy[c]-=8;if(s.mmy[c]<-32)s.mmy[c]=-64;
  }else if(s.mmy[c]<-14)s.mmy[c]+=15;else s.mmy[c]=0;
  const btc=[0,0,0,0,0];if(gc===pos)btc[g.bmenucoord[0][g.charturn]]=1;
  if(g.fighting===1){
   let spareGlow=0,pacifyGlow=0;
   for(let i=0;i<3;i++)if(g.monster[i]===1&&g.mercymod[i]>=100)spareGlow=1;
   if(c===2)for(let i=0;i<3;i++){if(g.monster[i]===1&&g.monsterstatus[i]===1&&g.tension>=40)pacifyGlow=1;if(withHook(rt,'suppressesPacifyHighlight').some(([e,h])=>h(e,rt)))pacifyGlow=0;}
   const by=485-bp+yy;
   rt.drawSprite('spr_btfight',btc[0],xx+xchunk+15,by);
   rt.drawSprite(c===0?'spr_btact':'spr_bttech',btc[1],xx+xchunk+50,by);
   rt.drawSprite('spr_btitem',btc[2],xx+xchunk+85,by);
   rt.drawSprite('spr_btspare',btc[3],xx+xchunk+120,by);
   rt.drawSprite('spr_btdefend',btc[4],xx+xchunk+155,by);
   const glow=0.4+Math.sin((g.time??0)/6)*0.4;
   if(spareGlow===1&&gc===pos)rt.drawSprite('spr_btspare',2,xx+xchunk+120,by,1,1,0,C.white,glow);
   if(pacifyGlow===1&&gc===pos)rt.drawSprite('spr_bttech',2,xx+xchunk+50,by,1,1,0,C.white,glow);
  }
  d.color=gc===pos?charcolor:s.bcolor;if(g.charselect===pos||g.charselect===3)d.color=charcolor;
  rt.drawRect(xx+xchunk,480-bp-2+yy+s.mmy[c],xx+xchunk+212,480-bp+yy);
  d.color=C.black;rt.drawRect(xx+xchunk+2,480-bp+yy+s.mmy[c],xx+xchunk+210,480-bp+yy+s.mmy[c]+33);
  const bo=g.fighting===1?336:g.fighting===0?430:480,mmy=s.mmy[c];
  rt.drawSprite(HEADS[c],g.faceaction[pos],xx+13+xchunk,bpoff+bo+mmy);
  rt.drawSprite(NAMES[c],0,xx+51+xchunk,bpoff+bo+3+mmy);
  rt.drawSprite('spr_hpname',0,xx+109+xchunk,bpoff+bo+11+mmy);
  const hp=g.hp[c+1],max=g.maxhp[c+1];
  d.color=C.white;d.font='hpfont';if(hp/max<=0.25)d.color=C.yellow;if(hp<=0)d.color=C.red;
  d.halign=2;rt.drawText(xx+160+xchunk,bpoff+bo-2+mmy,String(hp));
  rt.drawSprite('spr_hpslash',0,xx+159+xchunk,bpoff+bo-4+mmy);
  rt.drawText(xx+205+xchunk,bpoff+bo-2+mmy,String(max));d.halign=0;
  d.color=0x000080;rt.drawRect(xx+128+xchunk,bpoff+bo+11+mmy,xx+203+xchunk,bpoff+bo+19+mmy);
  if(hp>0&&max>0){d.color=charcolor;rt.drawRect(xx+128+xchunk,bpoff+bo+11+mmy,xx+xchunk+128+Math.ceil(hp/max*75),bpoff+bo+19+mmy);}
 }
}
const flashOn=(i:GmInstance|undefined)=>{if(!i)return;if(i.flash===0)i.fsiner=0;i.flash=1;i.becomeflash=1;};
function draw1(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,d=rt.drawState,xx=rt.view.x,yy=rt.view.y,coord=g.bmenucoord,t=g.charturn;
 if(s.intro===1){if(s.bp<s.bpy-1){if(s.bpy-s.bp<40)s.bp+=round((s.bpy-s.bp)/2.5);else s.bp+=30;}else s.bp=s.bpy;if(s.bp===s.bpy)s.intro=0;}
 if(s.intro===2){if(s.bp>0){if(round((s.bpy-s.bp)/5)>15)s.bp-=round((s.bpy-s.bp)/2.5);else s.bp-=30;}else s.bp=0;}
 const bp=s.bp;d.alpha=1;
 d.color=C.black;rt.drawRect(xx-10,481+yy,xx+700,480-bp+yy);
 d.color=s.bcolor;rt.drawRect(xx-10,480-bp-2+yy,xx+700,480-bp+yy);rt.drawRect(xx-10,480-bp+34+yy,xx+700,480-bp+36+yy);
 charBox(s,rt);
 const text=(x:number,y:number,str:string)=>rt.drawText(x,y,nl(str));
 const m=g.bmenuno;
 if((m===1||m===3||m===11||m===12)&&g.myfight===0){
  rt.drawSprite('spr_heart',0,xx+55,yy+385+coord[m][t]*30);d.font='fnt_mainbig';
  for(let i=0;i<3;i++){
   flashOn(rt.byId(g.monsterinstance[coord[m][t]]));
   if(g.monster[i]!==1)continue;
   d.color=C.white;const aq=mergeColor(C.aqua,0xff0000,0.3);let c1=C.white,c2=C.white;
   const tired=g.monsterstatus[i]===1,mercy=g.mercymod[i]>=g.mercymax[i],w=nameWidth(g.monstername[i]);
   if(tired){if(!withHook(rt,'suppressesPacifyHighlight').some(([e,h])=>h(e,rt))){d.color=aq;c1=aq;c2=aq;}rt.drawSprite('spr_tiredmark',0,xx+80+w+40,yy+385+i*30);}
   if(mercy){d.color=C.yellow;c1=C.yellow;if(!tired)c2=C.yellow;rt.drawSprite('spr_sparestar',0,xx+80+w+20,yy+385+i*30);}
   // draw_text_colour runs left (c1) to right (c2); when they differ the left colour is used here.
   d.color=c1;text(xx+80,yy+375+i*30,g.monstername[i]);void c2;
   d.color=C.gray;text(xx+80+w+60,yy+375+i*30,g.monstercomment[i]);
   d.color=0x000080;rt.drawRect(xx+510,yy+380+i*30,xx+590,yy+380+i*30+15);
   d.color=C.lime;rt.drawRect(xx+510,yy+380+i*30,xx+510+g.monsterhp[i]/g.monstermaxhp[i]*80,yy+380+i*30+15);
  }
 }
 const cursorAt=(c:number,right:number)=>{const cc=c%6;return {x:cc%2===1?right:10,y:cc>3?445:cc>1?415:385};};
 if(m===2&&g.myfight===0){
  const ch=g.char[t],spells=g.spell[ch],costs=g.spellcost[ch],names=g.spellnameb[ch],descs=g.spelldescb[ch];
  let sc=coord[2][t],page=0;if(sc>5){page=1;sc-=6;}
  const h=cursorAt(sc,230);rt.drawSprite('spr_heart',0,xx+h.x,yy+h.y);d.font='fnt_mainbig';
  for(let i=0;i<3;i++){
   const l=page*6+i*2;d.color=C.white;
   if(g.tension<costs[l])d.color=C.gray;
   else if(spells[l]===3){let glow=0;for(let k=0;k<3;k++)if(g.monster[k]===1&&g.monsterstatus[k]===1&&!withHook(rt,'suppressesPacifyHighlight').some(([e,h])=>h(e,rt)))glow=1;if(glow)d.color=mergeColor(C.aqua,0xff0000,0.3);}
   text(xx+30,yy+375+i*30,names[l]);
   d.color=C.white;if(g.tension<costs[l+1])d.color=C.gray;
   text(xx+260,yy+375+i*30,names[l+1]);
  }
  d.color=C.gray;text(xx+500,yy+375,descs[page*6+sc]);
  const costPercent=round(costs[page*6+sc]/g.maxtension*100);
  d.color=C.orange;text(xx+500,yy+440,costPercent+lang('obj_battlecontroller_slash_Draw_0_gml_171_0'));
 }
 if(m===4&&g.myfight===0){
  let ic=coord[4][t],page=0;if(ic>5){page=1;ic-=6;}
  const h=cursorAt(ic,230);rt.drawSprite('spr_heart',0,xx+h.x,yy+h.y);d.font='fnt_mainbig';
  for(let i=0;i<3;i++){d.color=C.white;text(xx+30,yy+375+i*30,s.tempitemnameb[page*6+i*2][t]);text(xx+260,yy+375+i*30,s.tempitemnameb[page*6+i*2+1][t]);}
  if(page===0&&g.item[6]!==0)rt.drawSprite('spr_morearrow',0,xx+470,yy+445+Math.sin(s.s_siner/10)*2);
  if(page===1)rt.drawSprite('spr_morearrow',0,xx+470,yy+395-Math.sin(s.s_siner/10)*2,1,-1,0,C.white,1);
  d.color=C.gray;text(xx+500,yy+375,s.tempitemdescb[page*6+ic][t]);
 }
 if(m===9&&g.myfight===0){
  const ac=coord[9][t],enemy=coord[11][t],costs=g.actcost[enemy];
  const h=cursorAt(ac,240);rt.drawSprite('spr_heart',0,xx+h.x,yy+h.y);d.font='fnt_mainbig';
  for(let i=0;i<6;i++){
   let cant=0,off=0;const who=g.actactor[enemy][i],xo=i%2===1?230:0,yo=i>3?60:i>1?30:0;let susblend=C.white,ralblend=C.white;
   if(who===2||who===4){if(s.havechar[1]===0||g.hp[2]<=0){susblend=C.gray;cant=1;}off=36;}
   if(who===3||who===4){if(s.havechar[2]===0||g.hp[3]<=0){ralblend=C.gray;cant=1;}off=36;}
   if(g.tension<costs[i])cant=1;
   if(who===4)off=round(off*1.8);
   d.color=cant===1?C.gray:C.white;
   // The game tints Ralsei's head with Susie's blend.
   if(who===2)rt.drawSprite('spr_headsusie',0,xx+30+xo,yy+375+yo,1,1,0,susblend,1);
   if(who===3)rt.drawSprite('spr_headralsei',0,xx+30+xo,yy+375+yo,1,1,0,susblend,1);
   if(who===4){rt.drawSprite('spr_headsusie',0,xx+30+xo,yy+375+yo,1,1,0,susblend,1);rt.drawSprite('spr_headralsei',0,xx+60+xo,yy+375+yo,1,1,0,susblend,1);}
   void ralblend;
   text(xx+30+off+xo,yy+375+yo,g.actname[enemy][i]);
  }
  d.color=C.gray;text(xx+500,yy+375,g.actdesc[enemy][ac]);
  if(g.tensionselect>0){d.color=C.orange;text(xx+500,yy+440,round(costs[ac]/g.maxtension*100)+lang('obj_battlecontroller_slash_Draw_0_gml_280_0'));}
  flashOn(rt.byId(g.monsterinstance[enemy]));
 }
 if((m===7||m===8)&&g.myfight===0){
  rt.drawSprite('spr_heart',0,xx+55,yy+385+coord[m][t]*30);d.font='fnt_mainbig';
  for(let i=0;i<3;i++){
   if(g.char[i]===0)continue;
   flashOn(rt.byId(g.charinstance[coord[m][t]]));
   d.color=C.white;text(xx+80,yy+375+i*30,g.charname[g.char[i]]);
   d.color=0x000080;rt.drawRect(xx+400,yy+380+i*30,xx+500,yy+380+i*30+15);
   d.color=C.lime;rt.drawRect(xx+400,yy+380+i*30,xx+400+g.hp[g.char[i]]/g.maxhp[g.char[i]]*100,yy+380+i*30+15);
  }
 }
 d.color=C.white;d.alpha=1;
}
const CONTROLLER_DRAW:Record<number,(s:GmInstance,rt:GmRuntime)=>void>={1:draw1,2:(s,rt)=>drawController2(s,rt,nameWidth)};
function draw(s:GmInstance,rt:GmRuntime){forChapter(rt,CONTROLLER_DRAW,'battle controller HUD')(s,rt);}
/** Alarm 2: the enemy turn is over; the next turn starts, unless an enemy takes over (rules.ts onTurnEnd). */
function alarm2(s:GmInstance,rt:GmRuntime){
 for(const [enemy,end] of withHook(rt,'onTurnEnd'))if(end(enemy,rt))return;
 s.reset=0;mnEndTurn(s,rt);
}

/** The full controller; the battle host creates this one (enemy code finds it as obj_battlecontroller). */
export const battleControllerFull:GmObjectDef={...controllerBase,parent:controllerBase,events:{create,step,draw,alarm2}};

/** obj_tensionbar: slides in from the left; the TP percentage in fnt_mainbig and a fill that eases toward TP. */
/** obj_tensionbar: the TP gauge. Chapter differences are in rules.ts: from Chapter 2 it keeps below the top of the view
 * and is drawn through a surface (its cutout rounds the fill) with the logo and percentage drawn last. */
export const tensionBar:GmObjectDef={name:'obj_tensionbar',index:333,depth:1,sprite:'spr_tensionbar',events:{
 create:(s,rt)=>{
  const g=rt.globals;s.tsiner=0;g.tensionselect=0;s.apparent=g.tension;s.current=g.tension;s.change=0;s.changetimer=15;s.red=0;s.redtimer=0;
  s.xx=rt.view.x;s.yy=rt.view.y;s.y=s.yy+40;s.x=s.xx-40;s.hspeed=13;s.friction=1;s.flashsiner=0;s.maxed=0;
 },
 alarm5:(s,rt)=>rt.destroy(s),
 draw:(s,rt)=>{
  const g=rt.globals,d=rt.drawState,max=g.maxtension,r=rules(rt);
  if(withHook(rt,'hidesTensionBar').some(([e,hide])=>hide(e,rt)))return;
  if(r.tensionBarFollowsView){s.yy=rt.view.y;s.y=s.yy+40;}
  const sw=rt.spriteWidth(s),sh=rt.spriteHeight(s),x=s.x,y=s.y;
  const percent=()=>{
   rt.drawSprite('spr_tplogo',0,x-30,y+30);
   d.color=C.white;d.font='fnt_mainbig';d.halign=0;s.flashsiner+=1;
   s.tamt=Math.floor(s.apparent/max*100);s.maxed=0;
   if(s.tamt<100){rt.drawText(x-30,y+70,String(Math.floor(s.apparent/max*100)));rt.drawText(x-25,y+95,'%');}
   if(s.tamt>=100){s.maxed=1;d.color=C.yellow;rt.drawText(x-28,y+70,'M');rt.drawText(x-24,y+90,'A');rt.drawText(x-20,y+110,'X');}
  };
  if(!r.tensionBarSurface)percent();
  rt.drawSprite('spr_tensionbar',1,x,y);
  // GML compares numbers within 1e-5 (tension has fractions from grazing).
  if(lt(Math.abs(s.apparent-g.tension),20))s.apparent=g.tension;
  if(lt(s.apparent,g.tension))s.apparent+=20;
  if(gt(s.apparent,g.tension))s.apparent-=20;
  if(!eq(s.apparent,s.current)){
   s.changetimer+=1;
   if(s.changetimer>15){
    const diff=()=>s.apparent-s.current;
    if(gt(diff(),0))s.current+=2;if(gt(diff(),10))s.current+=2;if(gt(diff(),25))s.current+=3;if(gt(diff(),50))s.current+=4;if(gt(diff(),100))s.current+=5;
    if(lt(diff(),0))s.current-=2;if(lt(diff(),-10))s.current-=2;if(lt(diff(),-25))s.current-=3;if(lt(diff(),-50))s.current-=4;if(lt(diff(),-100))s.current-=5;
    if(lt(Math.abs(s.apparent-s.current),3))s.current=s.apparent;
   }
  }
  const fill=(v:number,color:number)=>{d.color=color;rt.drawRect(x+3,y+sh-1,x+sw-1,y+sh-v/max*sh);};
  const orange=s.maxed===1?mergeColor(C.yellow,C.orange,0.5):C.orange;
  if(gt(s.current,0)){
   if(lt(s.apparent,s.current)){fill(s.current,C.red);fill(s.apparent,C.orange);}
   if(gt(s.apparent,s.current)){fill(s.apparent,C.white);fill(s.current,orange);}
   if(eq(s.apparent,s.current))fill(s.current,orange);
  }
  if(g.tensionselect>0){
   s.tsiner+=1;d.color=C.white;d.alpha=Math.abs(Math.sin(s.tsiner/8)*0.5)+0.2;
   s.theight=sh-s.current/max*sh;s.theight2=s.theight+g.tensionselect/max*sh;
   if(s.theight2>sh-1){s.theight2=sh-1;d.color=0x404040;d.alpha=0.7;}
   rt.drawRect(x+3,y+s.theight2,x+sw-1,y+s.theight);d.alpha=1;
  }
  if(gt(s.apparent,20)&&lt(s.apparent,max))rt.drawSprite('spr_tensionmarker',0,x+3,y+sh-s.current/max*sh);
  rt.drawSprite('spr_tensionbar',0,x,y);
  if(r.tensionBarSurface)percent();
 },
}};
void spellText;
