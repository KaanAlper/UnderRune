import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {defineEnemy} from '../../deltarune/enemy';
import {monsterParent,growtangle,moveHeart,moveHeartIn} from '../../deltarune/battle';
import {nextAct} from '../../deltarune/controller';
import {battleTextDefault,writer} from '../../deltarune/writer';
import {enemyBlcon2} from '../../deltarune/chapter2-objects';
import {bulletSpawner,blconSkip,isPhase,mercyAdd2,msgSet,msgNext,snd,turnTimer} from '../../deltarune/chapter2-battle';
import {enemyObjectInit,enemyHurtTiredAfterDamage,enemyDrawHurtGeneric,enemyDrawIdleGeneric,simulText,terminateWriter,monsterMakeTired,spareEnemy,smallFace,anyFaceNext} from '../../deltarune/chapter2-enemy';
import {sourceText} from '../../host/text';
const T=(key:string)=>sourceText('obj_tasque_enemy_slash_Step_0_gml_'+key);
export function createTasque(object:(n:string)=>GmObjectDef):GmObjectDef[]{
 const enemy=defineEnemy({...object('obj_tasque_enemy'),depth:0},{
  create:(s,rt)=>{enemyObjectInit(s,rt);Object.assign(s,{talkmax:90,imageSpeed:1/6,idlesprite:'spr_tasque_idle',hurtsprite:'spr_tasque_hurt',sparedsprite:'spr_tasque_spared',petted:false,sact_count:0,ract_count:0,nact_count:0});},
  talk:(s,rt)=>{rt.globals.typer=50;s.rr=rt.random.choose(0,1,2,3);msgSet(rt,0,T(`${16+s.rr}_0`));if(s.petted){s.petted=false;msgSet(rt,0,T('24_0'));}enemyBlcon2(s,rt,s.x-10,rt.globals.monstery[s.myself],10);},
  endTalk:(s,rt)=>{if(s.talked===1&&isPhase(rt,'enemytalk',s)){s.rtimer=0;blconSkip(s,rt,15);if(isPhase(rt,'bullets',s)){if(!rt.exists(moveHeart))moveHeartIn(rt);if(!rt.exists(growtangle))rt.create(growtangle,rt.view.x+320,rt.view.y+170);}}if(isPhase(rt,'bullets',s)&&s.attacked===0&&s.rtimer===0)s.rr=rt.random.choose(0,1);},
  attackDelay:15,
  attack:(s,rt)=>{if(s.rr===0){rt.globals.monsterattackname[s.myself]='YarnBalls';const d=bulletSpawner(s,rt,s.x,s.y,object('obj_dbulletcontroller'));s.dc=d.id;d.type=2;d.element=6;}else if(s.rr>0){rt.globals.monsterattackname[s.myself]='MeowWow';const d=bulletSpawner(s,rt,s.x,s.y,object('obj_dbulletcontroller'));s.dc=d.id;d.type=3;d.element=6;if(s.rr===2)d.difficulty=1;}turnTimer(rt,140);},
  statusLine:(s,rt)=>{const g=rt.globals;if(g.monsterstatus[s.myself]===1)g.battlemsg[0]=T('89_0');else if(g.mercymod[s.myself]>=g.mercymax[s.myself])g.battlemsg[0]=T('92_0');else{s.rr=rt.random.choose(0,1,2,3,4);if(s.rr===1)g.battlemsg[0]=T('100_0').replace('~1',T(`99_${rt.random.choose(0,1)===0?0:1}`));else g.battlemsg[0]=T(`${[96,100,102,103,104][s.rr]}_0`);}},
  acts:(s,rt)=>tasqueActs(s,rt),actsDone:()=>{},
  events:{alarm4:s=>{s.actcon++;},
   user10:(s,rt)=>{spareEnemy(s,rt);for(const manager of rt.all(object('obj_tasque_manager_enemy')))if(rt.globals.mercymod[manager.myself]<rt.globals.mercymax[manager.myself])mercyAdd2(manager,rt,manager.myself,35);},
   draw:(s,rt)=>{if(s.state===3){enemyHurtTiredAfterDamage(s,rt,0.5);enemyDrawHurtGeneric(s,rt);if(rt.globals.monster[s.myself]===0)for(const m of rt.all(object('obj_tasque_manager_enemy'))){m.violenceused=1;rt.globals.mercymod[m.myself]=0;}}enemyDrawIdleGeneric(s,rt,1/6);if(s.becomeflash===0)s.flash=0;s.becomeflash=0;},
  },
 });return [enemy];
}
function tasqueActs(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;s.xx=rt.view.x;s.yy=rt.view.y;
 if(s.acting===1&&s.actcon===0){s.actcon=1;msgSet(rt,0,T('126_0'));battleTextDefault(rt,s);}
 if(s.acting===2&&s.actcon===0){s.petted=true;msgSet(rt,0,T(s.simultotal===1?'133_0':'133_1'));if(g.mercymod[s.myself]<g.mercymax[s.myself])mercyAdd2(s,rt,s.myself,100);simulText(s,rt,'kris');s.actcon=s.simulorderkri===0?20:-1;}
 if(s.acting===3&&s.actcon===0){
  if(!g.char.includes(4)){s.sact_count++;if(s.sact_count===1)smallFace(s,rt,0,'ralsei',20,'right','middle',T('150_0'));
   msgSet(rt,0,T('155_0').replace('~1',s.sact_count===1?'/':'/%'));snd(rt,'snd_sussurprise');if(s.sact_count===1){anyFaceNext(s,rt,'susie',2);msgNext(rt,T('160_0'));}
   for(const m of rt.all(monsterParent))if(g.monsterstatus[m.myself]!==1)monsterMakeTired(rt,m.myself);
  }else{s.nact_count++;msgSet(rt,0,T('177_0').replace('~1',s.nact_count===1?'/':'/%'));if(s.nact_count===1){anyFaceNext(s,rt,'noelle',4);msgNext(rt,T('182_0'));}for(const m of rt.all(monsterParent))if(g.mercymod[m.myself]<g.mercymax[m.myself])mercyAdd2(m,rt,m.myself,100);}
  battleTextDefault(rt,s);s.actcon=1;
 }
 if(s.acting===4&&s.actcon===0){s.ract_count++;if(s.ract_count===1)smallFace(s,rt,0,'susie',12,'middle','bottom',T('203_0'));msgSet(rt,0,T('207_0').replace('~1',s.ract_count===1?'/':'/%'));if(s.ract_count===1){anyFaceNext(s,rt,'ralsei',2);msgNext(rt,T('212_0'));}
  for(const m of rt.all(monsterParent))if(g.mercymod[m.myself]<g.mercymax[m.myself])mercyAdd2(m,rt,m.myself,g.monstertype[m.myself]===32?100:g.monstertype[m.myself]===42?5:50);battleTextDefault(rt,s);s.actcon=1;
 }
 for(const [actor,acting,con,order,line] of [['susie','actingsus','actconsus','simulordersus',228],['ralsei','actingral','actconral','simulorderral',240],['noelle','actingnoe','actconnoe','simulordernoe',252]] as const){
  if(s[acting]===1&&s[con]===1){const suffix=actor==='noelle'?(rt.random.choose(0,1)===0?0:1):s.simultotal===1?0:1;msgSet(rt,0,T(`${line}_${suffix}`));if(g.mercymod[s.myself]<g.mercymax[s.myself])mercyAdd2(s,rt,s.myself,50);simulText(s,rt,actor);s[con]=s[order]===0?20:0;}
 }
 if(s.actcon===1&&!rt.exists(writer))nextAct(rt,s);
 if((s.actcon===20||s.actconsus===20||s.actconral===20||s.actconnoe===20)&&terminateWriter(s,rt)){s.actconsus=-1;s.actconral=-1;s.actconnoe=-1;s.actcon=1;}
}
