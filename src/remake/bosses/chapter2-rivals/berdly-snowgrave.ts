import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {msgSet,msgNext} from '../../deltarune/chapter2-battle';
import {battleText,destroyWriters,writer} from '../../deltarune/writer';
import {winCombat} from '../../deltarune/controller';
import {sourceText} from '../../host/text';
import type {RivalDialogue} from './berdly-acts';
const T=(key:string)=>sourceText('obj_berdlyb2_enemy_slash_Step_0_gml_'+key);
function flip(s:GmInstance,rt:GmRuntime){const spr=rt.bank.get(s.sprite!)!;s.x+=(spr.width-spr.originX*2)*s.imageXscale;s.imageXscale=-s.imageXscale;}
/** The enemy's spell-menu refusals and actual post-Snowgrave scene. fn/fb are created by the real spell phase. */
export function berdlySnowgraveScene(s:GmInstance,rt:GmRuntime,d:RivalDialogue,object:(name:string)=>GmObjectDef,loseChar:(s:GmInstance,rt:GmRuntime)=>void){
 const g=rt.globals,set=(key:string)=>msgSet(rt,0,T(key)),next=(key:string)=>msgNext(rt,T(key));
 if(g.bmenuno===99){
  if(s.snowgrave_con===0){
   s.snowgrave_con=2;s.snowgrave_timer=0;
   const n=g.flag[924];d.speaker(s,rt,'noelle');
   if(n===0){set('358_0');next('359_0');d.faceNext(s,rt,'none',0);next('698_0');}
   if(n===1){set('365_0');next('366_0');d.faceNext(s,rt,'none',0);next('707_0');}
   if(n===2){set('372_0');next('373_0');d.faceNext(s,rt,'none',0);next('716_0');}
   if(n>=3){set('722_0');next('379_0');next('380_0');d.faceNext(s,rt,'none',0);next('726_0');}
   g.flag[924]++;destroyWriters(rt);battleText(rt,s);
  }
  if(s.snowgrave_con===2&&!rt.exists(writer)){s.snowgrave_timer++;if(s.snowgrave_timer>=10){s.snowgrave_timer=0;s.snowgrave_con=0;g.bmenuno=2;}}
 }
 if(s.sidebcon<=0)return;
 if(s.sidebcon===1){s.sidebcon=2;s.alarm[5]=30;}
 if(s.sidebcon===3){for(const spell of rt.all(object('obj_spellphase'))){const w=rt.byId(spell.spellwriter);if(w)rt.destroy(w);rt.destroy(spell);}s.sidebcon=4;s.alarm[5]=150;}
 if(s.sidebcon===5){d.speaker(s,rt,'noelle');g.fc=0;set('429_0');battleText(rt,s);s.sidebcon=6;}
 if(s.sidebcon===6&&!rt.exists(writer)){
  const fn=rt.byId(s.fn)!,fb=rt.byId(s.fb)!;flip(fn,rt);fb.imageAlpha=.9;s.sidebcon=7;
  set('441_0');next('442_0');next('443_0');next('444_0');battleText(rt,s);
 }
 if(s.sidebcon===7&&!rt.exists(writer)){const fn=rt.byId(s.fn)!;flip(fn,rt);fn.sprite='spr_noelle_walk_up_dw';fn.imageSpeed=0;s.sidebcon=8;s.fntimer=0;s.alarm[5]=120;}
 if(s.sidebcon===9){s.sidebcon=15;set('463_0');next('464_0');next('465_0');battleText(rt,s);}
 if(s.sidebcon===15&&!rt.exists(writer)){s.sidebcon=29;s.alarm[5]=320;const fn=rt.byId(s.fn)!;fn.imageSpeed=.1;fn.vspeed=-1;}
 if(s.sidebcon===29){s.fntimer++;rt.byId(s.fn)!.x+=Math.sin(s.fntimer/2)*.7;}
 if(s.sidebcon===30&&!rt.exists(writer)){
  g.flag[38]=1;g.specialbattle=1;g.monstergold[3]=0;g.monsterexp[3]=0;const sign=rt.create(object('obj_npc_sign'),607,97);s.berdlysign=sign.id;sign.sprite='spr_berdly_ice';
  rt.destroy(rt.byId(s.fn)!);rt.destroy(rt.byId(s.fb)!);loseChar(s,rt);for(const c of rt.all(object('obj_caterpillarchara')))rt.destroy(c);s.sidebcon=11;g.flag[915]=6;winCombat(rt,s);
 }
}
export function createBerdlyPostBattleNoelle(object:(name:string)=>GmObjectDef):GmObjectDef{
 return {...object('obj_berdlyb2_postBattle_noelle'),events:{
  create:(s,rt)=>{s.inst=s.id;s.imageXscale=2;s.imageYscale=2;s.sprite='spr_noelleb_victory';s.imageSpeed=.25;const noelle=rt.first(object('obj_heronoelle'))!;noelle.sprite='spr_noelle_hand_mouth_dw';noelle.visible=false;},
  step:(s,rt)=>{s.imageIndex=Math.min(4,Math.max(0,s.imageIndex));const back=rt.first(object('obj_battleback'));if(!back||back.destroy===1)rt.destroy(s);},
 }};
}
