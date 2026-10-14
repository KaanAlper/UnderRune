// Battle setup as Chapter 1 does it before obj_battlecontroller is created: the party's globals (stats, equipment,
// bag, spells), scr_encountersetup (where the heroes and enemies stand, the opening line) and scr_monstersetup
// (each enemy's stats and ACTs, run from the enemy's event 12).
import type {GmInstance,GmObjectDef,GmRuntime} from '../gm/runtime';
import {optionalSourceText as lang} from '../host/text';
import {sourceText} from '../host/text';
import {sideBPhase} from './chapter2';
import {forChapter} from './rules';

/** A party member's equipment in the game's terms: weapon and two armors, each with its AT, DF and MAGIC. */
export interface EquippedStats{weapon:number;armor?:readonly [number,number];itemat:[number,number,number];itemdf:[number,number,number];itemmag:[number,number,number]}
export interface PartySetup{
 /** global.char: the three slots (1 Kris, 2 Susie, 3 Ralsei, 0 empty). */
 char:readonly number[];
 hp:readonly number[];maxhp:readonly number[];at:readonly number[];df:readonly number[];mag:readonly number[];
 /** Per character id 1..3. */
 equipped:Record<number,EquippedStats>;
 /** global.item: the bag (item ids, 0 for empty). */
 items:readonly number[];
 /** global.charauto: characters the game plays itself (Susie before her prison rejoin). */
 auto?:readonly number[];
}
/** Where each chapter keeps Kris's, Susie's and Ralsei's names (obj_initializer, then scr_gamestart). */
const CHAR_NAMES:Record<number,string[]>={
 1:['obj_initializer_slash_Create_0_gml_48_0','obj_initializer_slash_Create_0_gml_49_0','obj_initializer_slash_Create_0_gml_50_0'],
 2:['scr_gamestart_slash_scr_gamestart_gml_99_0','scr_gamestart_slash_scr_gamestart_gml_100_0','scr_gamestart_slash_scr_gamestart_gml_101_0'],
};
/** The globals obj_initializer / scr_gamestart and the save file give a battle. */
export function partyGlobals(rt:GmRuntime,p:PartySetup){
 const g=rt.globals;
 g.char=[...p.char];g.hp=[...p.hp];g.maxhp=[...p.maxhp];g.at=[...p.at];g.df=[...p.df];g.mag=[...p.mag];
 g.itemat=[[0,0,0],[0,0,0],[0,0,0],[0,0,0]];g.itemdf=[[0,0,0],[0,0,0],[0,0,0],[0,0,0]];g.itemmag=[[0,0,0],[0,0,0],[0,0,0],[0,0,0]];g.charweapon=[0,0,0,0];
 g.chararmor1=new Array(5).fill(0);g.chararmor2=new Array(5).fill(0);
 for(const [id,e] of Object.entries(p.equipped)){const c=Number(id);g.itemat[c]=[...e.itemat];g.itemdf[c]=[...e.itemdf];g.itemmag[c]=[...e.itemmag];g.charweapon[c]=e.weapon;g.chararmor1[c]=e.armor?.[0]??0;g.chararmor2[c]=e.armor?.[1]??0;}
 g.item=new Array(13).fill(0);p.items.slice(0,12).forEach((id,i)=>{g.item[i]=id;});
 // scr_gamestart: Kris has the hidden ACT spell (7), Susie Rude Buster, Ralsei Pacify and Heal Prayer.
 g.spell=Array.from({length:4},()=>new Array(13).fill(0));g.spell[1][0]=7;g.spell[2][0]=4;g.spell[3][0]=3;g.spell[3][1]=2;
 g.charname=[' ',...forChapter(rt,CHAR_NAMES,'party names').map(key=>lang(key))];
 g.charauto=[0,0,0,0];for(const c of p.auto??[])g.charauto[c]=1;
 g.flag??=new Array(1000).fill(0);g.tempflag??=new Array(100).fill(0);
 g.maxtension=250;g.inv=-1;g.invc=1;g.time=0;g.lang='en';g.charselect=-1;g.chemg_god_mode=false;g.gold??=0;g.xp??=0;
 g.msg=new Array(100).fill(' ');g.battlemsg=new Array(100).fill(' ');g.turntimer=0;
 g.targeted=[0,0,0];g.charaction=[0,0,0];g.charspecial=[0,0,0];g.acting=[0,0,0];g.faceaction=[0,0,0];g.temptension=[0,0,0];
 g.monster=[0,0,0];g.monsterinstance=[0,0,0];g.monstertype=[0,0,0];
}

/** scr_encountersetup for the encounters the remake runs. `enemies` maps the enemy object name to its definition. */
export function encounterSetup(rt:GmRuntime,n:number,enemies:Record<string,GmObjectDef>){
 const g=rt.globals,xx=rt.view.x,yy=rt.view.y;
 g.encounterno=n;g.heromakex=[];g.heromakey=[];g.monsterinstancetype=[];g.monstertype=[];g.monstermakex=[];g.monstermakey=[];
 for(let i=0;i<3;i++){g.heromakex[i]=xx+80;g.heromakey[i]=yy+50+80*i;g.monsterinstancetype[i]=enemies.obj_lancerboss;g.monstertype[i]=1;g.monstermakex[i]=xx+540;g.monstermakey[i]=yy+160+80*i;}
 if(g.char[0]!==0&&g.char[1]===0&&g.char[2]===0)g.heromakey[0]=yy+140;
 if(g.char[0]!==0&&g.char[1]!==0&&g.char[2]===0){g.heromakey[0]=yy+100;g.heromakey[1]=yy+180;}
 const one=(object:string,type:number,x:number,y:number,message?:number)=>{
  const def=enemies[object];if(!def)throw Error(`Encounter ${n} needs ${object}`);
  g.monsterinstancetype[0]=def;g.monstertype[0]=type;g.monstermakex[0]=xx+x;g.monstermakey[0]=yy+y;g.monstertype[1]=0;g.monstertype[2]=0;
  if(message!==undefined)g.battlemsg[0]=lang(`scr_encountersetup_slash_scr_encountersetup_gml_${message}_0`);
 };
 switch(n){
  case 61:
   if(g.chapter!==2)throw Error('Encounter 61 requires Chapter 2');
   if(sideBPhase(rt)>2)throw Error('Encounter 61 side-B commands are not ported');
   one('obj_spamton_neo_enemy',50,460,80);g.heromakex[0]=xx+80;g.heromakey[0]=yy+60;
   g.battlemsg[0]=sourceText('scr_encountersetup_slash_scr_encountersetup_gml_732_0');break;
  case 2:one('obj_lancerboss',2,540,200);break;
  case 8:one('obj_clubsenemy',16,400,120,139);break;
  case 12:one('obj_checkers_enemy',10,480,120,172);break;
  case 20:one('obj_lancerboss2',12,480,160,292);g.heromakex[0]=xx+120;break;
  case 31:{
   one('obj_susieenemy',19,520,80,463);
   const lan=enemies.obj_lancerboss3;if(!lan)throw Error('Encounter 31 needs obj_lancerboss3');
   g.monsterinstancetype[1]=lan;g.monstertype[1]=18;g.monstermakex[1]=xx+540;g.monstermakey[1]=yy+240;g.monstertype[2]=0;break;
  }
  case 25:
   g.heromakex=[xx+80,xx+90,xx+100];g.heromakey=[yy+100,yy+150,yy+210];
   one('obj_joker',20,500,160,384);break;
  case 27:one('obj_checkers_enemy',21,480,120,397);g.heromakey[0]=yy+65;break;
  case 40:one('obj_king_boss',25,460,70,517);break;
  default:throw Error(`Encounter ${n} is not set up in the remake`);
 }
}

/** scr_monstersetup, run by the enemy (from its event 12): name, stats, rewards, mercy and ACTs. */
export function monsterSetup(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,i=s.myself as number,L=(n:number)=>lang(`scr_monstersetup_slash_scr_monstersetup_gml_${n}_0`);
 const stats=(name:number,hp:number,at:number,df:number,gold:number,spare:number,mercymax:number)=>{
  g.monstername[i]=L(name);g.monstermaxhp[i]=hp;g.monsterhp[i]=hp;g.monsterat[i]=at;g.monsterdf[i]=df;g.monsterexp[i]=0;g.monstergold[i]=gold;
  g.sparepoint[i]=spare;g.mercymod[i]=0;g.mercymax[i]=mercymax;
 };
 const act=(slot:number,name:number,actor?:number)=>{g.canact[i][slot]=1;g.actname[i][slot]=L(name);if(actor!==undefined)g.actactor[i][slot]=actor;};
 switch(g.monstertype[i]){
  case 50:{
   if(g.chapter!==2)throw Error('Monster 50 requires Chapter 2');
   if(sideBPhase(rt)>2)throw Error('Spamton NEO side-B ACTs are not ported');
   const L2=(n:number)=>sourceText(`scr_monstersetup_slash_scr_monstersetup_gml_${n}_0`);
   g.monstername[i]=L2(1591);g.monstermaxhp[i]=4809;g.monsterhp[i]=4809;g.monsterat[i]=13;g.monsterdf[i]=0;
   g.monsterexp[i]=0;g.monstergold[i]=0;g.sparepoint[i]=0;g.mercymod[i]=0;g.mercymax[i]=100;
   for(let j=0;j<3;j++){g.canact[i][j]=1;g.actname[i][j]=L2([1614,1664,1670][j]);}
   g.actactor[i][2]=4;g.actdesc[i][1]='';g.actdesc[i][2]='';g.actcost[i][1]=0;g.actcost[i][2]=0;
   for(const [suffix,names,desc,cost] of [['sus',[1682,1687],1685,80],['ral',[1698,1703],1701,40]] as const){
    for(let j=0;j<2;j++){g['canact'+suffix][i][j]=1;g['actname'+suffix][i][j]=L2(names[j]);}
    g['actdesc'+suffix][i][0]='';g['actdesc'+suffix][i][1]=L2(desc);g['actcost'+suffix][i][0]=0;g['actcost'+suffix][i][1]=cost;
   }
   break;
  }
  case 2:stats(32,540,5,1,20,10,100);act(0,44);act(1,47);act(2,50);g.battlemsg[0]=L(51);break;
  case 10:
   stats(282,1300,7.5,3,100,0,100);act(0,294);act(1,296);act(2,298,3);
   if(g.char.includes(2))act(3,307,3);
   break;
  case 16:
   stats(449,270,6,1,80,10,100);act(0,463);act(1,465,3);act(2,467,3);act(3,470,3);act(4,473);act(5,475);
   s.myact=rt.random.choose(0,1,2);break;
  case 20:
   stats(562,3500,10,5,0,0,999);act(0,574);act(1,579,1);g.actdesc[i][1]=L(580);g.actcost[i][1]=50;act(2,585,4);g.actdesc[i][2]=L(586);g.actcost[i][2]=125;break;
  case 21:
   stats(594,1300,8,3,100,0,100);act(0,g.flag[246]===1?607:606);act(1,609);act(2,611,4);break;
  case 12:stats(346,2400,4,-40,0,0,100);act(0,358);break;
  case 18:stats(512,800,6,1,0,0,100);act(0,524);act(1,527);act(2,530,3);break;
  case 19:{
   // Susie's defense follows the armor she wears in the party.
   const armordf=g.itemdf[2][0]+g.itemdf[2][1]+g.itemdf[2][2];
   stats(538,120,7,-5+armordf,0,0,100);act(0,550);act(1,553);act(2,556,3);break;
  }
  case 25:{
   stats(665,2800,8,0,0,0,999);act(0,677);
   const special=(slot:number,actor:number,flag:number,name:number,desc:number,cost:number,first:number)=>{
    act(slot,first,actor);g.actdesc[i][slot]=' ';g.actcost[i][slot]=0;
    if(g.tempflag[flag]===1){act(slot,name,actor);g.actdesc[i][slot]=L(desc);g.actcost[i][slot]=cost;}
   };
   special(1,1,5,704,705,62,682);special(2,2,6,714,715,150,688);special(3,3,7,724,725,125,694);break;
  }
 }
}
