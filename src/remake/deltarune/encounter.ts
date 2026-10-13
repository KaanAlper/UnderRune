// Battle setup as Chapter 1 does it before obj_battlecontroller is created: the party's globals (stats, equipment,
// bag, spells), scr_encountersetup (where the heroes and enemies stand, the opening line) and scr_monstersetup
// (each enemy's stats and ACTs, run from the enemy's event 12).
import type {GmInstance,GmObjectDef,GmRuntime} from '../gm/runtime';
import {optionalSourceText as lang} from '../host/text';

/** A party member's equipment in the game's terms: weapon and two armors, each with its AT, DF and MAGIC. */
export interface EquippedStats{weapon:number;itemat:[number,number,number];itemdf:[number,number,number];itemmag:[number,number,number]}
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
/** The globals obj_initializer / scr_gamestart and the save file give a battle. */
export function partyGlobals(rt:GmRuntime,p:PartySetup){
 const g=rt.globals;
 g.char=[...p.char];g.hp=[...p.hp];g.maxhp=[...p.maxhp];g.at=[...p.at];g.df=[...p.df];g.mag=[...p.mag];
 g.itemat=[[0,0,0],[0,0,0],[0,0,0],[0,0,0]];g.itemdf=[[0,0,0],[0,0,0],[0,0,0],[0,0,0]];g.itemmag=[[0,0,0],[0,0,0],[0,0,0],[0,0,0]];g.charweapon=[0,0,0,0];
 for(const [id,e] of Object.entries(p.equipped)){const c=Number(id);g.itemat[c]=[...e.itemat];g.itemdf[c]=[...e.itemdf];g.itemmag[c]=[...e.itemmag];g.charweapon[c]=e.weapon;}
 g.item=new Array(13).fill(0);p.items.slice(0,12).forEach((id,i)=>{g.item[i]=id;});
 // scr_gamestart: Kris has the hidden ACT spell (7), Susie Rude Buster, Ralsei Pacify and Heal Prayer.
 g.spell=Array.from({length:4},()=>new Array(13).fill(0));g.spell[1][0]=7;g.spell[2][0]=4;g.spell[3][0]=3;g.spell[3][1]=2;
 g.charname=[' ',lang('obj_initializer_slash_Create_0_gml_48_0'),lang('obj_initializer_slash_Create_0_gml_49_0'),lang('obj_initializer_slash_Create_0_gml_50_0')];
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
  case 2:one('obj_lancerboss',2,540,200);break;
  case 8:one('obj_clubsenemy',16,400,120,139);break;
  case 12:one('obj_checkers_enemy',10,480,120,172);break;
  case 25:
   g.heromakex=[xx+80,xx+90,xx+100];g.heromakey=[yy+100,yy+150,yy+210];
   one('obj_joker',20,500,160,384);break;
  case 27:one('obj_checkers_enemy',21,480,120,397);g.heromakey[0]=yy+65;break;
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
 }
}
