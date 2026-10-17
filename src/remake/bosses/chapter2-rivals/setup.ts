// Source setup data only. Encounter availability is owned by the host, after enemy/attack/ending acceptance.
import type {GmInstance,GmRuntime} from '../../gm/runtime';
import {sourceText} from '../../host/text';

export const RIVAL_ENCOUNTERS={
 58:{party:[1,2,3],monsters:[['obj_berdlyb_enemy',43,480,100]],intro:'695_0'},
 62:{party:[1,2,3],monsters:[['obj_sweet_enemy',39,460,40],['obj_kk_enemy',38,500,90],['obj_hatguy_enemy',37,480,200]],intro:'752_0'},
 63:{party:[1,3],monsters:[['obj_rouxls_enemy',45,500,60]],intro:'776_0'},
 82:{party:[1,4],monsters:[['obj_berdlyb2_enemy',46,470,144]],intro:'1076_0'},
} as const;

const T=(key:string)=>sourceText('scr_monstersetup_slash_scr_monstersetup_gml_'+key);
/** Called after the shared scr_monster_actreset. The array slot is the enemy's slot, never the ACT actor's slot. */
export function setupRivalMonster(s:GmInstance,rt:GmRuntime,sidebPhase:number):boolean{
 const g=rt.globals,me=s.myself,type=g.monstertype[me];
 if(![37,38,39,43,45,46].includes(type))return false;
 const stats:Record<number,[number,number,number,string|null]>={37:[120,8,1,'1097_0'],38:[120,8,100,null],39:[120,8,50,'1165_0'],43:[1985,10,100,'1289_0'],45:[600,9,200,'1385_0'],46:[900,9,100,'1433_0']};
 const [hp,attack,gold,name]=stats[type];g.monstername[me]=name?T(name):'K_K';g.monstermaxhp[me]=hp;g.monsterhp[me]=hp;g.monsterat[me]=attack;
 g.monsterdf[me]=0;g.monsterexp[me]=0;g.monstergold[me]=gold;g.sparepoint[me]=0;g.mercymod[me]=0;g.mercymax[me]=100;
 const act=(slot:number,key:string,actor?:number,cost?:number,desc?:string)=>{
  g.canact[me][slot]=1;g.actname[me][slot]=T(key);if(actor!==undefined)g.actactor[me][slot]=actor;
  if(cost!==undefined)g.actcost[me][slot]=cost;if(desc!==undefined)g.actdesc[me][slot]=desc;
 };
 if(type===37||type===38||type===39){
  const keys:Record<number,string[]>={37:['1108_0','1111_0','1116_0','1119_0','1123_0'],38:['1142_0','1145_0','1150_0','1153_0','1157_0'],39:['1176_0','1179_0','1184_0','1187_0','1191_0']};
  const k=keys[type];act(0,k[0]);act(1,k[1]);if(g.lang!=='ja')g.actsimul[me][1]=1;act(2,k[2],4);
  g.canactsus[me][0]=1;g.actnamesus[me][0]=T(k[3]);if(g.lang!=='ja')g.actsimulsus[me][0]=1;
  g.canactral[me][0]=1;g.actnameral[me][0]=T(k[4]);if(g.lang!=='ja')g.actsimulral[me][0]=1;
 }
 if(type===43){
  act(0,'1312_0');act(1,'1315_0',undefined,0,T('1332_0_b'));act(2,'1321_0',4,0,T('1338_0'));
  g.canactsus[me][0]=1;g.actnamesus[me][0]=T('1337_0');g.actdescsus[me][0]=T('1354_0');g.actcostsus[me][0]=0;
  g.canactral[me][0]=1;g.actnameral[me][0]=T('1347_0_b');g.actdescral[me][0]=T('1364_0');g.actcostral[me][0]=0;
 }
 if(type===45){
  act(0,'1405_0');act(1,'1408_0',undefined,0,' ');act(2,'1413_0',undefined,34,' ');act(3,'1419_0',3,59,' ');act(4,'1425_0',3,80,' ');
  g.canactsus[me][0]=1;g.actnamesus[me][0]=T('1430_0');g.canactral[me][0]=1;g.actnameral[me][0]=T('1433_0_b');g.actdescral[me][0]=' ';g.actcostral[me][0]=0;
 }
 if(type===46){
  act(0,'1453_0');act(1,sidebPhase>0?'1456_0':'1456_1');act(2,sidebPhase>0?'1460_0':'1460_1',5,0,' ');
  g.canactnoe[me][0]=1;g.actnamenoe[me][0]=T('1465_0');
 }
 return true;
}
