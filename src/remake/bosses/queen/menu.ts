import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {spellMenuSetupChapter2} from '../../deltarune/chapter2';
import {sourceText} from '../../host/text';

/** Queen user1: shield break changes both the normal ACT rows and each party member's solo ACT. */
export function updateQueenActs(s:GmInstance,rt:GmRuntime,shield:GmObjectDef){
 const g=rt.globals,i=s.myself,sh=rt.first(shield),open=!sh||sh.shieldhurt===2;
 const text=(n:number)=>sourceText(`obj_queen_enemy_slash_Other_11_gml_${n}_0`);
 const setup=(n:number)=>sourceText(`scr_monstersetup_slash_scr_monstersetup_gml_${n}_0`);
 g.actname[i][0]=text(open?10:15);g.actsimul[i][0]=open?0:1;g.actname[i][1]=text(open?11:16);
 g.actnamesus[i][0]=text(open?22:26);g.actsimulsus[i][0]=open?0:1;
 g.actnameral[i][0]=text(open?32:36);g.actsimulral[i][0]=open?0:1;
 const row=(n:number,actor:number,name:string,desc:string,cost:number)=>{
  g.canact[i][n]=1;g.actactor[i][n]=actor;g.actname[i][n]=name;g.actdesc[i][n]=desc;g.actcost[i][n]=cost;
 };
 let n=2;if(open)row(n++,2,setup(1540),' ',0);
 row(n++,2,setup(1552),setup(1553),150);row(n++,3,setup(1558),setup(1559),125);
 if(open)g.canact[i][5]=0;
 else for(;n<6;n++){g.canact[i][n]=0;g.actactor[i][n]=0;g.actname[i][n]='';g.actdesc[i][n]='';g.actcost[i][n]=0;}
 spellMenuSetupChapter2(rt,s);
}
