import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {heroParent,marker} from '../../deltarune/battle';
import {actCharSprite,simulText,terminateWriter} from '../../deltarune/chapter2-enemy';
import {nextAct} from '../../deltarune/controller';
import {msgSet,msgNext} from '../../deltarune/chapter2-battle';
import {battleTextDefault,writer} from '../../deltarune/writer';
import {sourceText} from '../../host/text';
const TEXT={
 capn:{prefix:'obj_hatguy_enemy_slash_Step_0_gml_',check:'143_0',single:['165_0','166_0'],everyone:'214_0',kris:['177_0','178_0','183_0'],susie:['241_0','242_0','247_0'],ralsei:['279_0','280_0','285_0']},
 kk:{prefix:'obj_kk_enemy_slash_Step_0_gml_',check:'151_0',single:['172_0','173_0'],everyone:'221_0',kris:['184_0','185_0','190_0'],susie:['248_0','249_0','254_0'],ralsei:['287_0','288_0','293_0']},
 // Sweet's first dance with Kris and the ones after it are separate lines (the same words).
 sweet:{prefix:'obj_sweet_enemy_slash_Step_0_gml_',check:'403_0',single:['422_0','423_0'],everyone:'470_0',kris:['435_0','436_0','534_0','441_0'],susie:['495_0','496_0','501_0'],ralsei:['532_0','533_0','538_0']},
} as const;
/** Cap'n and K_K share their ACT protocol, including simultaneous writers and the final all-dancing handoff. */
export function trioDanceActs(s:GmInstance,rt:GmRuntime,object:(name:string)=>GmObjectDef,kind:'capn'|'kk'|'sweet'){
 const g=rt.globals,k=TEXT[kind],T=(key:string)=>sourceText(k.prefix+key),sweet=rt.first(object('obj_sweet_enemy'))!;
 const set=(key:string)=>msgSet(rt,0,T(key)),next=(key:string)=>msgNext(rt,T(key)),text=()=>battleTextDefault(rt,s);
 const dance=(actor:string)=>actCharSprite(s,rt,actor,`spr_${actor}_dance`,.16,1);
 function cleanup(){for(const m of rt.all(marker))if(['spr_kris_dance','spr_susie_dance','spr_ralsei_dance'].includes(m.sprite!)){rt.destroy(m);for(const h of rt.all(heroParent))if(h.imageAlpha===0){h.imageAlpha=1;h.acttimer=0;h.state=0;g.faceaction[h.myself]=0;}}}
 const together=()=>sweet.dancing==true&&rt.first(object('obj_kk_enemy'))!.dancing==true&&rt.first(object('obj_hatguy_enemy'))!.dancing==true&&sweet.endcon===0;
 function solo(actor:'kris'|'susie'|'ralsei',field:string,order:string){
  s.dancing=true;if(actor!=='kris'){s.danceCounter=1;if(actor==='susie'&&kind==='capn')s.dancedwithsusie=1;dance(actor);}
  const keys:readonly string[]=k[actor];if(s.groove===0){if(g.lang==='ja'){set(keys[0]);next(keys[1]);}else set(keys[2]);s.groove=1;}else set(keys[3]??keys[2]);
  if(g.lang==='ja'){text();s[field]=20;}else{simulText(s,rt,actor);s[field]=s[order]===0?20:0;}
 }
 s.xx=rt.view.x;s.yy=rt.view.y;
 if(s.acting===1&&s.actcon===0){s.actcon=1;set(k.check);text();}
 if(s.acting===2&&s.actcon===0){
  if(sweet)sweet.actCounter++;s.danceCounter=1;dance('kris');
  if(s.simultotal===1||g.lang==='ja'&&sweet.simultotal_funny===1){set(k.single[0]);next(k.single[1]);text();s.actcon=4;s.alarm[4]=10;}
  else solo('kris','actcon','simulorderkri');
 }
 if(s.acting===3&&s.actcon===0){if(sweet)sweet.actCounter++;s.danceCounter=2;dance('kris');dance('ralsei');dance('susie');set(k.everyone);text();s.actcon=4;s.alarm[4]=10;}
 if(s.actcon===5){s.dancing=true;s.actcon=1;}
 if(s.actingsus===1&&s.actconsus===1)solo('susie','actconsus','simulordersus');
 if(s.actingral===1&&s.actconral===1)solo('ralsei','actconral','simulorderral');
 if(s.actcon===1&&!rt.exists(writer)){
  if(together())sweet.endcon=1;
  else if(sweet.endcon===0){if(kind==='kk'){s.actcon=0;s.acting=0;}cleanup();nextAct(rt,s);}
 }
 if(s.actcon===20||s.actconsus===20||s.actconral===20)if(terminateWriter(s,rt)){
  if(together())sweet.endcon=1;
  else if(sweet.endcon===0){cleanup();s.actconsus=-1;s.actconral=-1;s.actcon=1;}
 }
}
