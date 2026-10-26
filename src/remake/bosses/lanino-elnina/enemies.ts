import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {defineEnemy} from '../../deltarune/enemy';
import {enemyObjectInit,enemyHurt,simulText,terminateWriter} from '../../deltarune/chapter2-enemy';
import {isPhase,blconSkip,msgSet} from '../../deltarune/chapter2-battle';
import {nextAct,randomTarget} from '../../deltarune/controller';
import {battleTextDefault,writer} from '../../deltarune/writer';
import {sourceText} from '../../host/text';
import {weatherSprite} from './controller-support';

type Lookup=(name:string)=>GmObjectDef;
const ENEMY_SPRITES=[
 {marker:'spr_battle_laninomarker',idle:'spr_lanino_idle',head:'spr_enemy_lanino_head_sunglasses',arm:'spr_enemy_lanino_leftarm',hand:'spr_enemy_lanino_lefthand'},
 {marker:'spr_battle_elninamarker',idle:'spr_elnina_idle',head:'spr_enemy_elnina_head_sunglasses',arm:'spr_enemy_elnina_leftarm',hand:'spr_enemy_elnina_lefthand'},
];
const ACT_TEXT:Readonly<Record<string,Readonly<Record<string,string>>>>={
 lanino:{'40_0_b':'obj_lanino_enemy_slash_Step_0_gml_40_0_b','47_0':'obj_lanino_enemy_slash_Step_0_gml_47_0','78_0':'obj_lanino_enemy_slash_Step_0_gml_78_0','107_0_b':'obj_lanino_enemy_slash_Step_0_gml_107_0_b','117_0_b':'obj_lanino_enemy_slash_Step_0_gml_117_0_b'},
 elnina:{'39_0_b':'obj_elnina_enemy_slash_Step_0_gml_39_0_b','46_0':'obj_elnina_enemy_slash_Step_0_gml_46_0','79_0':'obj_elnina_enemy_slash_Step_0_gml_79_0','110_0_b':'obj_elnina_enemy_slash_Step_0_gml_110_0_b','120_0_b':'obj_elnina_enemy_slash_Step_0_gml_120_0_b'},
};
// Audited source events: Create (shared init and multipart sprite fields), Step (controller-led talk,
// ACT/simultaneous writer gates and hurt), Alarm4 (con), Other22 (template monster setup), Draw (all four poses).
export function createWeatherEnemies(object:Lookup):GmObjectDef[]{
 return [false,true].map(elnina=>{
  const who=elnina?'elnina':'lanino';
  const sprites=ENEMY_SPRITES[elnina?1:0];
  return defineEnemy({name:`obj_${who}_enemy`,index:elnina?947:380,depth:0,sprite:sprites.marker},{
   create:(s,rt)=>{
    enemyObjectInit(s,rt);Object.assign(s,{recruitcount:5,talkmax:90,imageSpeed:1/6,idlesprite:sprites.idle,hurtsprite:elnina?'spr_elnina_hurt2':'spr_lanino_hurt',sparedsprite:sprites.idle,custom_draw_example:1,skiptext:false,con:0,animsiner:0,talking:false,talkingframe:0,pose:0,poseindex:0,head:sprites.head,leftarm:sprites.arm,lefthand:sprites.hand,flashcolor:0xffffff});
    if(elnina){Object.assign(s,{hairtufts:'spr_enemy_elnina_hairtufts',waist:'spr_enemy_elnina_torso',rightarm:'spr_enemy_elnina_rightarm',rightarmindex:0,skirt:'spr_enemy_elnina_skirt'});rt.create(object('obj_elnina_lanino_controller'),s.x,s.y);}
    else Object.assign(s,{shoulderflameindex:0,shoulders:'spr_enemy_lanino_shoulderflames',legs:'spr_enemy_lanino_legs',chest:'spr_enemy_lanino_chest',chestindex:0});
   },
   // This pair has no autonomous attack or turn count. The weather controller owns all phase clocks.
   isAlive:()=>false,phase:()=>false,attack:()=>{},countTurn:false,
   beforeStep:(s,rt)=>{
    if(rt.globals.monster[s.myself]===1&&!rt.instances.some(i=>i.live&&i.object.name==='obj_rouxls_ch3_enemy')){
     if(isPhase(rt,'enemytalk',s)&&s.talked===0&&rt.first(object('obj_elnina_lanino_controller'))!.talked===1){randomTarget(s,rt);s.talked=1;s.talktimer=0;s.rtimer=0;}
     if(s.talked===1&&isPhase(rt,'enemytalk',s))blconSkip(s,rt,15);
    }
   },
   acts:(s,rt)=>weatherActs(s,rt,object,elnina),
   actsDone:(s,rt)=>{if(s.actcon===1&&!rt.exists(writer))nextAct(rt,s);},
   afterStep:(s,rt)=>{if(s.state===3)enemyHurt(s,rt);},
   events:{alarm4:s=>{s.con++;},draw:(s,rt)=>drawWeather(s,rt,elnina)},
  });
 });
}
function weatherActs(s:GmInstance,rt:GmRuntime,object:Lookup,elnina:boolean){
 const c=rt.first(object('obj_elnina_lanino_controller'))!,who=elnina?'elnina':'lanino';s.xx=rt.view.x;s.yy=rt.view.y;
 const text=(key:string)=>msgSet(rt,0,sourceText(ACT_TEXT[who][key]));
 if(s.acting===1&&s.actcon===0){s.actcon=1;text(elnina?'39_0_b':'40_0_b');battleTextDefault(rt,s);}
 if(s.acting===2&&s.actcon===0){text(elnina?'46_0':'47_0');battleTextDefault(rt,s);if(elnina?c.sunboost>-3:c.sunboost<3)c.sunboost+=elnina?-1:1;c.ilovetv_increase=1;s.acting=200;}
 if(s.acting===200&&s.actcon===0){
  for(const w of rt.all(writer))if(w.reachedend&&!c.ilovetv_increased)c.ilovetv_increase=3;
  if(!rt.exists(writer)){if(!c.ilovetv_increased)c.ilovetv_increase=3;if(c.ilovetv_increase===0)s.actcon=1;}
 }
 if(s.acting===3&&s.actcon===0){text(elnina?'79_0':'78_0');battleTextDefault(rt,s);if(elnina?c.sunboost>-3:c.sunboost<3)c.sunboost+=elnina?-1:1;s.acting=200;}
 for(const [actor,acting,con,order,key] of [['susie','actingsus','actconsus','simulordersus',elnina?'110_0_b':'107_0_b'],['ralsei','actingral','actconral','simulorderral',elnina?'120_0_b':'117_0_b']] as const){
  if(s[acting]===1&&s[con]===1){text(key);simulText(s,rt,actor);s[con]=s[order]===0?20:0;c.ilovetv_increase++;}
 }
 if((s.actcon===20||s.actconsus===20||s.actconral===20)&&terminateWriter(s,rt)){s.actconsus=-1;s.actconral=-1;s.actcon=1;}
}
function drawWeather(s:GmInstance,rt:GmRuntime,elnina:boolean){
 const draw=(sprite:string|number,frame:number,x:number,y:number,color=s.imageBlend,alpha=s.imageAlpha)=>rt.drawSprite(weatherSprite(sprite),frame,x,y,2,2,0,color,alpha);
 if(elnina&&s.state===3&&s.hurttimer>=0)draw('spr_elnina_hurt2',0,s.x+s.shakex,s.y-7,0xffffff,1);
 s.preset=0;
 if(elnina)Object.assign(s,{hairx:s.x+42,hairy:s.y+50,waistx:s.x+42,waisty:s.y+112,rightarmx:s.x+46,rightarmy:s.y+58,headx:s.x+44,heady:s.y+62,leftarmx:s.x+36,leftarmy:s.y+60,skirtx:s.x+42,skirty:s.y+70});
 else {Object.assign(s,{shouldersx:s.x+40,shouldersy:s.y+56,legsx:s.x+42,legsy:s.y+122,chestx:s.x+40,chesty:s.y+76,headx:s.x+48,heady:s.y+50,leftarmx:s.x+34,leftarmy:s.y+58});s.shoulderflameindex+=0.125;}
 s.animsiner++;const boby=-Math.abs(Math.sin(s.animsiner/6)*-2);
 if(elnina){s.hairx+=Math.sin(s.animsiner/12)*2;s.hairy+=boby*1.5;s.heady+=boby;s.leftarmy+=boby*4;s.rightarmy+=boby*(s.pose===3?1:1.5);s.skirty+=boby;}
 else{s.chesty+=boby*(s.pose===3?0.5:1.5);s.shouldersy+=boby*(s.pose===3?0.5:1.5);s.leftarmy+=-7+boby*4;s.heady+=boby*0.5;}
 s.lefthandx=s.leftarmx-24;s.lefthandy=s.leftarmy+(elnina?4:12);
 if(s.state===0){
  s.fsiner++;if(!s.talking)s.talkingframe=0;else s.talkingframe+=1/6;
  if(s.pose===0||s.pose===3){
   type Part=[string,number,number,number];
   const parts:Part[]=elnina?[[s.hairtufts,0,s.hairx,s.hairy],[s.leftarm,0,s.leftarmx,s.leftarmy],[s.waist,0,s.waistx,s.waisty],[s.skirt,0,s.skirtx,s.skirty]]:[[s.leftarm,0,s.leftarmx,s.leftarmy],[s.legs,0,s.legsx,s.legsy],[s.chest,s.chestindex,s.chestx,s.chesty],[s.shoulders,s.shoulderflameindex,s.shouldersx,s.shouldersy]];
   if(elnina&&s.pose===0)parts.push([s.rightarm,s.rightarmindex,s.rightarmx,s.rightarmy]);
   parts.push([s.head,s.talkingframe,s.headx,s.heady],[s.lefthand,0,s.lefthandx,s.lefthandy]);
   if(elnina&&s.pose===3)parts.push([s.rightarm,s.rightarmindex,s.rightarmx,s.rightarmy]);
   for(const p of parts)draw(...p,elnina&&s.pose===3?0xffffff:s.imageBlend,elnina?1:s.imageAlpha);
   if(s.pose===0&&s.flash===1)for(const p of parts)rt.drawSpriteFog(weatherSprite(p[0]),p[1],p[2],p[3],2,2,0,s.flashcolor,-Math.cos(s.fsiner/5)*0.4+0.6);
   if(!elnina&&s.pose===3)draw('spr_enemy_lanino_removeglasses_front',s.chestindex,s.chestx,s.chesty);
  }
  if(s.pose===1||s.pose===2){if(s.pose===1){if(s.poseindex>=2)s.poseindex=0;if(s.poseindex<1.5)s.poseindex+=0.25;}else{if(s.poseindex<2)s.poseindex=2;if(s.poseindex<3)s.poseindex+=0.25;}draw(s.head,s.talkingframe,s.headx+(elnina?(s.pose===1?2:0):-8),s.heady+(elnina?0:13));draw(elnina?'spr_elnina_cool2':'spr_lanino_cool2',s.poseindex,elnina?s.waistx:s.legsx,elnina?s.waisty:s.legsy);}
 }
 if(!elnina&&s.state===3&&s.hurttimer>=0)draw(s.hurtsprite,0,s.x+s.shakex,s.y,s.imageBlend,1);
 if(s.becomeflash===0)s.flash=0;else{s.becomeflash--;s.flash=1;}
}
