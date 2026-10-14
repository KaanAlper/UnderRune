// Chapter 2 command extensions. Keep Chapter 1's tables and dispatch in controller.ts unchanged.
import type {GmInstance,GmRuntime} from '../gm/runtime';
import {monsterParent} from './battle';
import {sourceText} from '../host/text';

/** scr_gamestart, without scr_levelup progression or equipment bonuses. Index 0 is the empty slot. */
export function chapter2StartStats(){return {hp:[0,120,140,100],maxhp:[0,120,140,100],at:[0,12,16,10],df:[0,2,2,2],mag:[0,0,1,9]};}
export function sideBPhase(rt:GmRuntime){
 const flag=rt.globals.flag;if(flag[916]!==0)return 0;
 const n=flag[915];return n>=20?4:n>=7?3:n>=4?2:n>0?1:0;
}
// scr_iteminfo's name/description key numbers, target, shop value, battle consumption and replacement.
const ITEMS_CH2:Record<number,[number,number,number,number,number,number?]>={
 1:[15,16,1,25,1],2:[22,23,1,400,1],3:[29,30,0,400,0],4:[36,37,2,1,0],5:[43,44,1,5,1],6:[50,51,2,150,1],7:[58,59,2,5,1],
 8:[65,66,1,70,1],9:[72,73,1,10,1],10:[79,80,1,10,1],11:[86,87,2,70,1],12:[93,94,1,40,1],13:[100,101,1,40,1],14:[107,108,1,10,1],15:[114,115,1,50,1],
 16:[121,122,1,100,1],17:[128,129,0,300,0],18:[135,136,1,10,1],19:[142,143,1,10,1],20:[149,150,1,10,1],21:[156,157,1,10,1],22:[163,164,1,110,1,8],
 23:[171,172,1,200,1],24:[178,179,1,200,1],25:[185,186,2,180,1],26:[192,193,1,160,1],27:[199,200,2,100,1],28:[206,207,2,300,1],29:[213,214,2,1000,1],
 30:[220,221,2,100,1],31:[227,228,2,4000,1],32:[234,235,1,110,1],33:[241,242,0,100,0],
};
export function itemInfoChapter2(s:GmInstance,rt:GmRuntime,id:number){
 Object.assign(s,{usable:0,replaceable:0,value:0,itemtarget:0,itemnameb:' ',itemdescb:' '});
 if(id===0){s.itemdescb='---';return;}
 const item=ITEMS_CH2[id];if(!item)throw Error(`Chapter 2 item ${id} is not in scr_iteminfo`);
 const L=(n:number)=>sourceText(`scr_iteminfo_slash_scr_iteminfo_gml_${n}_0`);
 s.itemnameb=L(item[0]);s.itemdescb=id===7?L(59).replace('~1','140'):L(item[1]);
 s.itemtarget=item[2];s.value=id===33?Math.floor(200/rt.globals.chapter):item[3];s.usable=item[4];s.replaceable=item[5]??0;
}
/** scr_teaamount. Self tea heals only 10 outside battle, 40 minimum during a battle. */
export function teaAmountChapter2(rt:GmRuntime,tea:number,character:number){
 const amounts=[[10,120,120,70],[120,10,120,400],[60,120,10,50],[70,120,50,10]];
 let amount=amounts[tea-1]?.[character-1]??10;
 if(rt.globals.fighting===1&&amount<40)amount=40;
 if(rt.instances.some(i=>i.live&&i.object.name==='o_boxingcontroller'))amount=100;
 return amount;
}
const grid=(value:unknown)=>Array.from({length:3},()=>new Array(6).fill(value));
/** scr_monster_actreset's extra actor-specific tables, before enemy setup event 12. */
export function initChapter2ActTables(rt:GmRuntime){
 const g=rt.globals;
 for(const suffix of ['','sus','ral','noe']){
  for(const key of ['canact','actcost','actsimul'])g[key+suffix]=grid(0);
  for(const key of ['actname','actdesc'])g[key+suffix]=grid(' ');
 }
 g.actactor=grid(1);
}
export function resetChapter2Actors(rt:GmRuntime){
 const g=rt.globals;
 for(const key of ['actingsingle','actingsimul','actingtarget','actingchoice'])g[key]=[0,0,0];
 g.currentactingchar=0;g.monsterattackname=[' ',' ',' '];
 for(const m of rt.all(monsterParent))for(const suffix of ['','sus','ral','noe'])m['acting'+suffix]=0;
}
/** scr_actinfo_temp: the current actor's six ACTs for the selected enemy. */
export function actorActs(rt:GmRuntime,enemy:number,character=rt.globals.char[rt.globals.charturn]){
 const g=rt.globals,suffix=['','','sus','ral','noe'][character]??'';
 return {can:g['canact'+suffix][enemy] as number[],cost:g['actcost'+suffix][enemy] as number[],
  name:g['actname'+suffix][enemy] as string[],desc:g['actdesc'+suffix][enemy] as string[],simul:g['actsimul'+suffix][enemy] as number[]};
}
/** scr_spellmenu_setup: ACTs from enemy slot zero, followed by the actor's twelve spell slots. */
export function spellMenuSetupChapter2(rt:GmRuntime){
 const g=rt.globals;
 g.battleactcount=[0,0,0];
 for(const [key,value] of Object.entries({battlespell:0,battlespellcost:0,battlespellname:' ',battlespelldesc:' ',battlespelltarget:2,battlespellspecial:0}))
  g[key]=Array.from({length:3},()=>new Array(18).fill(value));
 const mixed=g.monster.some((alive:number,i:number)=>i>0&&alive===1&&g.monstertype[i]!==g.monstertype[0]);
 for(let i=0;i<3;i++){
  const char=g.char[i],acts=actorActs(rt,0,char);
  for(let j=0;j<6;j++)if(char>=1&&char<=4&&acts.can[j]===1){
   g.battlespell[i][j]=-1;g.battleactcount[i]=j+1;g.battlespellcost[i][j]=acts.cost[j];
   const generic=char===2?1053:char===3?1057:1061;
   g.battlespellname[i][j]=mixed&&char!==1?sourceText(`scr_monstersetup_slash_scr_monstersetup_gml_${generic}_0`):acts.name[j];
   g.battlespelldesc[i][j]=acts.desc[j];g.battlespelltarget[i][j]=char===1?0:2;g.battlespellspecial[i][j]=char;
  }
  for(let j=0;j<12;j++){
   const index=g.battleactcount[i]+j;
   g.battlespell[i][index]=g.spell[char][j];g.battlespellcost[i][index]=g.spellcost[char][j];
   g.battlespellname[i][index]=g.spellnameb[char][j];g.battlespelldesc[i][index]=g.spelldescb[char][j];g.battlespelltarget[i][index]=g.spelltarget[char][j];
  }
 }
}
/** scr_actselect. Effects belong to the enemy Step, using acting/actcon for each actor. */
export function actSelectChapter2(s:GmInstance,rt:GmRuntime,enemy:number,choice:number){
 const g=rt.globals,t=g.charturn,char=g.char[t],m=rt.byId(g.monsterinstance[enemy]),suffix=['','','sus','ral','noe'][char];
 if(m)m['acting'+suffix]=choice+1;
 g.actingchoice[t]=choice;g.actingtarget[t]=enemy;g.actingsingle[t]=1;g.actingsimul[t]=actorActs(rt,enemy).simul[choice];
 if(char===1){
  g.acting[0]=1;
  const actor=g.actactor[enemy][choice];
  if(actor===2)g.acting[s.charpos[1]]=1;if(actor===3)g.acting[s.charpos[2]]=1;
  if(actor===4){g.acting[1]=1;g.acting[2]=1;}
  for(let i=0;i<3;i++)if(g.acting[i]===1){g.faceaction[i]=6;g.charaction[i]=9;}
 }else{g.faceaction[t]=6;g.charaction[t]=9;}
}
/** scr_act_simul: publish each simultaneous actor's order and state to the enemy. */
export function actSimulChapter2(rt:GmRuntime){
 const g=rt.globals,monsters=rt.all(monsterParent);let count=0;
 for(let i=g.currentactingchar;i<3;i++){
  if(g.actingsingle[i]!==1||monsters.length===0)continue;
  const char=g.char[i],enemy=g.actingtarget[i],choice=g.actingchoice[i],acts=actorActs(rt,enemy,char);
  if(acts.simul[choice]===1){
   const suffix=['','','sus','ral','noe'][char],order=['','','sus','ral','noe'][char];
   for(const m of monsters)m[char===1?'simulorderkri':`simulorder${order}`]=count;
   const m=rt.byId(g.monsterinstance[enemy]);if(m)m['actcon'+suffix]=char===1?0:1;
   g.actingsingle[i]=0;count++;
  }
  for(const m of monsters)m.simultotal=count;
 }
}
/** scr_nextact. Returns true when the caller must enter scr_attackphase. */
export function nextActChapter2(rt:GmRuntime){
 const g=rt.globals;
 g.acting=[0,0,0];g.actingsingle[g.currentactingchar]=0;
 const previous=rt.byId(g.monsterinstance[g.actingtarget[g.currentactingchar]]);
 if(previous){previous.acting=0;for(const suffix of ['','sus','ral','noe'])previous['actcon'+suffix]=0;}
 let singleComplete=false;
 while(g.currentactingchar<3){
  g.currentactingchar++;
  if(g.currentactingchar>=3||g.actingsingle[g.currentactingchar]!==1)continue;
  const char=g.char[g.currentactingchar];
  if(char>=2&&char<=4){
   const m=rt.byId(g.monsterinstance[g.actingtarget[g.currentactingchar]]),suffix=['','','sus','ral','noe'][char];
   if(m)m['actcon'+suffix]=1;
   singleComplete=g.actingsimul[g.currentactingchar]===0;break;
  }
 }
 if(g.currentactingchar>=3){
  for(const m of rt.all(monsterParent))for(const suffix of ['','sus','ral','noe'])m['acting'+suffix]=0;
  g.currentactingchar=0;return true;
 }
 if(!singleComplete)actSimulChapter2(rt);
 return false;
}
