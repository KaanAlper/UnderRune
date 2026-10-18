import type {GmInstance,GmRuntime} from '../../gm/runtime';
import {msgSet,msgNext,mercyAdd2} from '../../deltarune/chapter2-battle';
import {battleText,battleTextDefault,writer} from '../../deltarune/writer';
import {nextAct,winCombat} from '../../deltarune/controller';
import {sourceText} from '../../host/text';

/** Shared dialogue scripts retain their caller writes. The host supplies their Chapter 2 implementation. */
export interface RivalDialogue{
 speaker(s:GmInstance,rt:GmRuntime,who:string):void;
 faceNext(s:GmInstance,rt:GmRuntime,who:string,emotion:number|string):void;
 terminateWriter(s:GmInstance,rt:GmRuntime):boolean;
}
const T=(key:string)=>sourceText('obj_berdlyb2_enemy_slash_Step_0_gml_'+key);

/** The entire rematch ACT phase. Noelle is battle slot 1, while her character HP/equipment index is 4. */
export function berdlyRematchActs(s:GmInstance,rt:GmRuntime,d:RivalDialogue,sidebPhase:number){
 const g=rt.globals;const set=(key:string)=>msgSet(rt,0,T(key)),next=(key:string)=>msgNext(rt,T(key));s.xx=rt.view.x;s.yy=rt.view.y;
 if(s.acting===1&&s.actcon===0){s.actcon=1;set(sidebPhase===0?'147_0':'371_0');battleTextDefault(rt,s);}
 if(s.acting===2&&s.actcon===0){
  s.kact_count++;
  if(!s.sideb_route){
   s.mercy_add_amount=8;
   if(s.kact_count===1){d.speaker(s,rt,'no_name');set('162_0');d.faceNext(s,rt,'berdly',0);next('164_0');}
   else{
    const rand=!s.spill?rt.random.choose(0,1,2,3):rt.random.choose(0,1,2);
    if(rand===0){d.speaker(s,rt,'no_name');set('175_0');}
    if(rand===1){d.speaker(s,rt,'no_name');set('181_0');}
    if(rand===2){d.speaker(s,rt,'no_name');set('187_0');}
    if(rand===3){s.spill=true;d.speaker(s,rt,'no_name');set('194_0');next('195_0');d.faceNext(s,rt,'noelle',18);next('197_0');}
   }
   s.berdly_last_line=T('201_0');s.actcon=2;battleTextDefault(rt,s);
  }else{
   if(s.kact_count===1){d.speaker(s,rt,'no_name');set('213_0');d.faceNext(s,rt,'berdly',3);next('215_0');next('216_0');s.berdly_last_line=T('218_0');}
   else{d.speaker(s,rt,'no_name');set('222_0');s.berdly_last_line=T('223_0');}
   s.mercy_add_amount=13;g.monsterdf[s.myself]-=5;battleText(rt,s);s.actcon=2;
  }
 }
 if(s.acting===3&&s.actcon===0){
  s.nact_count++;
  if(!s.sideb_route){
   s.mercy_add_amount=16;d.speaker(s,rt,'no_name');set('245_0');
   if(s.nact_count<=2){g.battlemag[1]+=3;s.berdly_last_line=T('252_0');}else s.berdly_last_line=T('484_0');
   battleTextDefault(rt,s);s.actcon=2;
  }else{
   d.speaker(s,rt,'no_name');set('264_0');if(s.nact_count===1){d.faceNext(s,rt,'noelle','W');next('269_0');}
   if(s.nact_count<=10){g.battlemag[1]+=3;d.faceNext(s,rt,'no_name',0);next('278_0');}else next('281_0');
   battleText(rt,s);s.actcon=1;
  }
 }
 if(s.actingnoe===1&&s.actconnoe===1){
  s.naction_count++;s.mercy_add_amount=10;
  if(!s.sideb_route){
   if(s.naction_count===1){d.speaker(s,rt,'no_name');set('299_0');d.faceNext(s,rt,'noelle',18);next('301_0');d.faceNext(s,rt,'berdly',19);next('303_0');battleText(rt,s);}
   s.berdly_last_line=T('305_0');
  }else{s.mercy_add_amount=0;d.speaker(s,rt,'no_name');set('299_0');s.berdly_last_line=T('617_0');}
  s.actconnoe=2;
 }
 if((s.actcon===2||s.actconnoe===2)&&!rt.exists(writer)){
  if(g.mercymod[s.myself]<g.mercymax[s.myself])mercyAdd2(s,rt,s.myself,s.mercy_add_amount);
  d.speaker(s,rt,'no_name');msgSet(rt,0,s.berdly_last_line);battleText(rt,s);s.actconnoe=-1;s.actcon=1;
 }
 if(s.actcon===1&&!rt.exists(writer)){if(g.mercymod[s.myself]>=100)winCombat(rt,s);else nextAct(rt,s);}
 if(s.actcon===20||s.actconsus===20||s.actconral===20||s.actconnoe===20){
  if(g.mercymod[s.myself]>=100)winCombat(rt,s);
  else if(d.terminateWriter(s,rt)){s.actconsus=-1;s.actconral=-1;s.actconnoe=-1;s.actcon=1;}
 }
}
