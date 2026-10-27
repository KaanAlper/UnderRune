import type {GmInstance,GmRuntime} from '../gm/runtime';
import {C,mergeColor} from '../gm/graphics';
import {controllerScripts2,type ControllerScripts} from './controller-script-parts';
import {resetChapter2Actors,spellMenuSetupChapter2} from './chapter2';
import {spellInfo4} from './chapter4-menu-info';
import {sourceText} from '../host/text';
import {subst} from './controller';
/** Chapter 4's common Create tail; board/GIGA state belongs to other chapter strategies. */
function afterCreate4(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;resetChapter2Actors(rt);spellMenuSetupChapter2(rt,s);
 Object.assign(s,{spellpage:0,t_siner:0,myfightreturntimer:1,messagepriority:-1,attackpriority:-1,hidemercy:0,cantspare:[0,0,0],
  soundbattle:false,hidestar:0,disablesusieattack:0,disableitembutton:false,incenseturtlegersoncon:0,gueigersoncon:0,
  skipsusieturn:false,skipmonsterselection:false,facevar:0,dancing_jackolantern_con:0,dancing_jackolantern_alpha:1,
  dancing_jackolantern_index:0,dancing_jackolantern_timer:0,gersonend:false,autoselect:false});
 g.turntimer=120;
 for(const key of ['charpos','havechar','mmy'])if(s[key][3]===undefined)s[key][3]=key==='charpos'?-1:0;
 s.hpcolor[3]=C.yellow;s.hpcolorsoft=[];for(s.i=0;s.i<4;s.i++)s.hpcolorsoft[s.i]=mergeColor(s.hpcolor[s.i],C.white,.5);
 g.flag[36]=0;g.flag[39]=0;g.flag[63]=0;
}
export const controllerScripts4:ControllerScripts={...controllerScripts2,
 fullSpellInfo:spellInfo4,ultimateDescription:93,tensionGoldMultiplier:3,
 initActs:(s,rt)=>{controllerScripts2.initActs(s,rt);s.questionmercy=[0,0,0];},
 beforeHeroes:(s,rt)=>{s.rabbickvar=rt.random.choose(0,1,2);},afterCreate:afterCreate4,
 reward:(s,rt)=>{controllerScripts2.reward(s,rt);const g=rt.globals;if(g.charweapon[1]===53)g.monstergold[3]+=Math.floor(g.monstergold[3]/20);let count=0;for(const c of g.char)if(c>0)count+=(g.chararmor1[c]===54?1:0)+(g.chararmor2[c]===54?1:0);g.monstergold[3]-=g.monstergold[3]*count*.1;},
 victoryText:rt=>{rt.globals.battletyper=4;const c=rt.instances.find(i=>i.live&&i.object.name==='obj_battlecontroller');return c?.gersonend?subst(sourceText('obj_battlecontroller_slash_Step_0_gml_101_0'),rt.globals.monsterexp[3],rt.globals.monstergold[3]):controllerScripts2.victoryText(rt);},
 victoryLevelUp:rt=>{if(rt.globals.flag[63]===1)throw Error('Chapter 4 violent-victory level progression requires a story save');},
};
