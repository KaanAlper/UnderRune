import type {GmInstance,GmRuntime} from '../../gm/runtime';
import {sourceText} from '../../host/text';
import {haveChar} from '../../deltarune/chapter2-enemy';
export const FIELD_ENCOUNTERS={
 57:{party:[1,2,3],monsters:[['obj_tasque_enemy',32,450,35],['obj_tasque_manager_enemy',42,486,95],['obj_tasque_enemy',32,450,220]],intro:'681_0',kind:'story'},
 65:{party:[1,2,3],monsters:[['obj_werewerewire_enemy',40,502,70],['obj_werewerewire_enemy',40,456,190]],intro:'808_0',kind:'unused'},
 81:{party:[1,2,3],monsters:[['obj_werewerewire_enemy',40,482,164]],intro:'1066_0',kind:'story'},
 83:{party:[1,2,3],monsters:[['obj_mauswheel_enemy',44,450,100]],intro:'1090_0',kind:'story'},
 // The Dojo's rematches stand the party further left and higher (their heromakex/heromakey).
 89:{party:[1,2,3],monsters:[['obj_tasque_manager_enemy',42,487,94]],heroes:[[94,50],[80,122],[72,200]],intro:'1247_0',kind:'dojo'},
 94:{party:[1,2,3],monsters:[['obj_werewerewire_enemy',40,464,68],['obj_werewerewire_enemy',40,494,184]],heroes:[[94,50],[80,122],[72,200]],intro:'1339_0',kind:'dojo-final-round'},
} as const;
const T=(key:string)=>sourceText('scr_monstersetup_slash_scr_monstersetup_gml_'+key);
/** The source scr_monstersetup blocks, after the caller's shared ACT-table reset. */
export function setupFieldMonster(s:GmInstance,rt:GmRuntime):boolean{
 const g=rt.globals,me=s.myself,type=g.monstertype[me];if(![32,33,40,42,44].includes(type))return false;
 // Type 33 asks scr_havechar for Ralsei, then (only if he is absent) Noelle; type 32 asks for Noelle below.
 const strong=type===33&&(haveChar(s,rt,3)||haveChar(s,rt,4));
 const data:Record<number,[number,number,number,number,string]>={32:[240,8,75,20,'859_0'],33:[240,strong?8:5,79,20,'914_0'],40:[1753,11,300,5,'1199_0'],42:[1367,10,200,5,'1259_0'],44:[1753,10,200,0,'1347_0']};
 const [hp,at,gold,spare,name]=data[type];g.monstername[me]=T(name);g.monstermaxhp[me]=hp;g.monsterhp[me]=hp;g.monsterat[me]=at;g.monsterdf[me]=0;g.monsterexp[me]=0;g.monstergold[me]=gold;g.sparepoint[me]=spare;g.mercymod[me]=0;g.mercymax[me]=100;
 const act=(slot:number,key:string,actor?:number,desc?:string,cost?:number)=>{g.canact[me][slot]=1;g.actname[me][slot]=T(key);if(actor!==undefined)g.actactor[me][slot]=actor;if(desc!==undefined)g.actdesc[me][slot]=desc;if(cost!==undefined)g.actcost[me][slot]=cost;};
 const actor=(who:'sus'|'ral'|'noe',key:string,simul=false,desc?:string,cost?:number)=>{g['canact'+who][me][0]=1;g['actname'+who][me][0]=T(key);if(simul)g['actsimul'+who][me][0]=1;if(desc!==undefined)g['actdesc'+who][me][0]=desc;if(cost!==undefined)g['actcost'+who][me][0]=cost;};
 if(type===32){act(0,'871_0');act(1,'874_0');g.actsimul[me][1]=1;if(!haveChar(s,rt,4)){act(2,'881_0',2,' ',0);act(3,'887_0',3,' ',0);}else act(2,'894_0',5,' ',0);actor('sus','900_0',true);actor('ral','904_0',true);actor('noe','908_0',true);}
 if(type===33){act(0,'926_0');act(1,'929_0');g.actsimul[me][1]=1;act(2,'934_0',2,T('935_0'),0);actor('sus','939_0',true);actor('ral','943_0',true);actor('noe','947_0',true);}
 if(type===40){act(0,'1210_0');act(1,'1213_0');g.actsimul[me][1]=1;act(2,'1218_0',2,' ',0);act(3,'1224_0',3,' ',0);actor('sus','1229_0',true);actor('ral','1233_0',true);}
 if(type===42){act(0,'1276_0');act(1,'1280_0',undefined,' ');g.actsimul[me][1]=1;act(2,'1285_0',4,' ');g.actsimul[me][2]=1;actor('sus','1289_0_b',true);actor('ral','1293_0',true);}
 if(type===44){act(0,'1367_0');act(1,'1362_0');act(2,'1366_0',4);actor('sus','1378_0',false,' ',0);actor('ral','1384_0',false,' ',0);}
 return true;
}
