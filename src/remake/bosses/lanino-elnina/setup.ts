/** Normal weather battle: scr_encountersetup 113 and scr_monstersetup 60/61. */
import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {sourceText} from '../../host/text';
const T=(key:string)=>sourceText('scr_monstersetup_slash_scr_monstersetup_gml_'+key);

export function setupWeatherMonster(s:GmInstance,rt:GmRuntime):boolean{
 const g=rt.globals,me=s.myself,type=g.monstertype[me];
 if(type!==60&&type!==61)return false;
 const keys=type===60?['2018_0','2030_0','2033_0','2036_0','2044_0','2048_0']:['2054_0','2066_0','2069_0','2072_0','2080_0','2084_0'];
 g.monstername[me]=T(keys[0]);g.monstermaxhp[me]=8880;g.monsterhp[me]=8880;g.monsterat[me]=12;g.monsterdf[me]=0;
 g.monsterexp[me]=0;g.monstergold[me]=160;g.sparepoint[me]=0;g.mercymod[me]=0;g.mercymax[me]=100;
 for(let i=0;i<3;i++){g.canact[me][i]=1;g.actname[me][i]=T(keys[i+1]);}
 g.actdesc[me][0]=T('1877_0');g.actactor[me][2]=4;
 g.canactsus[me][0]=1;g.actnamesus[me][0]=T(keys[4]);g.actsimulsus[me][0]=1;
 g.canactral[me][0]=1;g.actnameral[me][0]=T(keys[5]);g.actsimulral[me][0]=1;
 return true;
}

export function setupWeatherEncounter(rt:GmRuntime,n:number,enemies:Record<string,GmObjectDef>):boolean{
 if(n!==113)return false;
 const g=rt.globals;
 for(const [i,[x,y]] of [[94,50],[80,122],[72,200]].entries()){g.heromakex[i]=rt.view.x+x;g.heromakey[i]=rt.view.y+y;}
 const names=['obj_lanino_enemy','obj_elnina_enemy'];
 for(const [i,[x,y]] of [[480,46],[510,180]].entries()){
  const def=enemies[names[i]];if(!def)throw Error(`Encounter ${n} needs ${names[i]}`);
  g.monsterinstancetype[i]=def;g.monstertype[i]=i===0?61:60;g.monstermakex[i]=rt.view.x+x;g.monstermakey[i]=rt.view.y+y;
 }
 g.monsterinstancetype[2]=0;g.monstertype[2]=0;
 g.rank1time=124;g.rank1turns=7;g.rank1tp=200;g.rank1hurtcount=2;
 // scr_speaker("tenna") sets the writer's type and portrait family before the opening line.
 g.typer=g.fighting===1?81:80;g.fc=22;
 g.battlemsg[0]=sourceText('scr_encountersetup_slash_scr_encountersetup_gml_869_0');
 return true;
}
