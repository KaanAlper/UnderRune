// GIGA Queen's menu-facing enemy. The real-time ring belongs to the boxing adapter, not shared controller branches.
import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {defineEnemy} from '../../deltarune/enemy';
import {darkener,growtangle,heart,heroParent,moveHeart} from '../../deltarune/battle';
import {button3_p,inputName,nextAct} from '../../deltarune/controller';
import {blconSkip,bulletSpawner,isPhase,msgSet,snd,turnTimer} from '../../deltarune/chapter2-battle';
import {enemyBlcon2} from '../../deltarune/chapter2-objects';
import {battleTextDefault,destroyWriters,writer} from '../../deltarune/writer';
import {spellMenuSetupChapter2} from '../../deltarune/chapter2';
import {round} from '../../gm/math';
import {sourceText} from '../../host/text';
import {createGigaQueenState,destroyGigaQueenState,type BoxingLifecycleObjects} from './boxing-lifecycle';

const text=(key:string|number)=>sourceText(`obj_gigaqueen_enemy_slash_Step_0_gml_${key}${typeof key==='number'?'_0':''}`);
const required=(rt:GmRuntime,o:GmObjectDef)=>{const s=rt.first(o);if(!s)throw Error(`GIGA Queen requires ${o.name}`);return s;};
const FOLLOW:Record<number,[number|string,number]>={1:[106,0],2:[107,0],3:[108,0],4:[109,0],5:[110,0],6:[111,0],7:[113,8],8:['114_0_b',0],9:[116,0],10:[118,0],11:[120,12],12:[121,0],13:[123,0],14:['121_0_b',15],15:[122,16],16:['123_0_b',17],17:['124_0_b',18],18:[125,19],19:[126,0]};

/** The three ACTs preserve their source delays and the commanded-punch override. */
export function gigaQueenActs(s:GmInstance,rt:GmRuntime,controller:GmObjectDef,eventManager:GmObjectDef){
 const g=rt.globals,c=required(rt,controller);s.xx=rt.view.x;s.yy=rt.view.y;
 const trigger=()=>{for(const m of rt.withInstances(eventManager))m.trigger_event(0,19);};
 if(s.acting===1){
  const key=({spr_bhero_head_a:243,spr_bhero_head_b:248,spr_bhero_head_c:253,spr_bhero_head_d:258} as Record<string,number>)[c.headsprite];
  if(key!==undefined)s.actpunchtext=text(key);
  s.acting=1.5;s.haventusedspell=0;msgSet(rt,0,s.actpunchtext);battleTextDefault(rt,s);trigger();
 }
 if(s.acting===1.5&&!rt.exists(writer)){
  s.extradamage=0;
  if(c.headsprite==='spr_bhero_head_a'){c.specialcon=1;s.extradamage=30;}
  if(c.headsprite==='spr_bhero_head_b'){c.specialcon=2;s.extradamage=10;}
  if(c.headsprite==='spr_bhero_head_c')c.specialcon=3;
  if(c.headsprite==='spr_bhero_head_d'){c.specialcon=4;s.extradamage=-30;}
  snd(rt,'snd_cardrive');s.acting=4;s.alarm[5]=30;
 }
 if(s.acting===5&&c.specialcon===0&&!rt.exists(writer)){
  s.acting=7;c.punchcon=1;c.damageoverride=round(g.battleat[0]*300/20)+s.extradamage;
  if(c.headsprite==='spr_bhero_head_d')c.healoverride=35;
 }
 if(s.acting===7&&c.punchcon===0){s.actcon=1;s.acting=0;}
 if(s.acting===2){c.specialcon=5;snd(rt,'snd_cardrive');msgSet(rt,0,text(309));battleTextDefault(rt,s);s.haventusedspell=0;s.acting=0;s.actcon=1;trigger();}
 if(s.acting===3){
  c.specialcon=6;snd(rt,'snd_cardrive');msgSet(rt,0,text(s.healcount>2?320:321));battleTextDefault(rt,s);s.haventusedspell=0;s.healcount++;
  if(s.healcount===1)g.actcost[s.myself][2]=75;if(s.healcount===2)g.actcost[s.myself][2]=100;if(s.healcount===3)g.actcost[s.myself][2]=125;
  spellMenuSetupChapter2(rt,s);s.acting=0;s.actcon=1;
 }
 if(s.actcon===1&&s.acting===0&&!rt.exists(writer)){s.actcon=0;c.acttoenemytalktransition=1;nextAct(rt,s);}
}

export function createGigaQueenProxy(object:(name:string)=>GmObjectDef):GmObjectDef{
 const queen=object('o_boxingqueen'),controller=object('o_boxingcontroller'),hud=object('o_boxinghud'),battleController=object('obj_battlecontroller');
 const o:BoxingLifecycleObjects={queen,controller,battleController,blackBackground:object('obj_boxingqueen_black_bg'),cityBackground:object('obj_3d_bg_effect'),battleBackground:object('obj_battleback'),heart:object('obj_heart'),returnHeart:object('obj_returnheart')};
 const balloon=(s:GmInstance,rt:GmRuntime)=>{const q=required(rt,queen);enemyBlcon2(s,rt,q.x-40,q.y-185,10);};
 return defineEnemy({...object('obj_gigaqueen_enemy'),depth:0},{
  create:(s,rt)=>createGigaQueenState(s,rt,o),
  beforeStep:(s,rt)=>{
   if(s.init===0){for(const h of rt.withInstances(heroParent))h.visible=false;s.init=1;}
   const q=rt.first(queen);if(q){s.x=q.x;s.y=q.y-80;}
   if(rt.exists(hud)){const b=required(rt,queen);rt.globals.monsterhp[s.myself]=Math.max(1,b.health_count+required(rt,hud).sub_healthbar_count*1500);}
  },
  beforeTalk:(s,rt)=>{
   if(!isPhase(rt,'enemytalk',s)||s.talked!==0)return;s.turn++;
   const q=required(rt,queen),g=rt.globals;
   if(s.turn>18&&q.phase_transition<1&&g.monsterdf[s.myself]>-25){g.monsterdf[s.myself]-=5;q.damagetakenincrease+=.166666;}
  },
  startTalk:(s,rt)=>{
   const q=required(rt,queen);if(q.phase_transition>=1)return;
   const c=required(rt,controller),g=rt.globals;g.typer=70;s.ballooncon=0;s.balloonsubcon=0;s.balloonend=1;s.talkedcon=0;c.acttoenemytalktransition=0;
   if(s.playerhasntdodged===0&&s.balloonorder>0&&s.playerhasntdodgedorder<3){
    if(s.playerhasntdodgedorder===0){msgSet(rt,0,text(56));s.ballooncon=11;s.balloonend=0;}
    if(s.playerhasntdodgedorder===1||s.playerhasntdodgedorder===2){msgSet(rt,0,text('57_0_b').replace('~1',inputName(3)).replace('~2',inputName(1)));s.ballooncon=13;s.balloonend=0;}
    s.playerhasntdodgedorder++;s.balloonorder=2;
   }else{
    const table:[number|string,number][]=[[63,1],[64,0],[65,2],[66,3],[67,4],[68,5],[69,6],[70,7],[71,0],[72,9],[73,0]],line=table[s.balloonorder];
    if(line){msgSet(rt,0,text(line[0]));s.ballooncon=line[1];s.balloonend=line[1]===0?1:0;}
    if(s.balloonorder===10)s.balloonorder=-1;s.balloonorder++;
   }
   if(c.wireframe_boxing===0&&required(rt,hud).sub_healthbar_count===0&&q.health_count<=q.health_count_max*.27){
    s.breathattack=0;
    if(s.finalconvcon===0){msgSet(rt,0,text('73_0_b'));s.ballooncon=14;s.balloonend=0;s.finalconvcon=1;}
    else if(s.finalconvcon===1){msgSet(rt,0,text(74));s.ballooncon=0;s.balloonend=1;s.finalconvcon=2;}
    else if(s.finalconvcon===2){msgSet(rt,0,text(75));s.ballooncon=0;s.balloonend=1;}
   }
   balloon(s,rt);s.talked=s.ballooncon===0?1:.6;s.talktimer=0;
  },
  duringTalk:(s,rt)=>{
   if(s.talked!==.6)return;s.talktimer++;
   if((button3_p(rt)&&s.talktimer>15)||!rt.exists(writer)){
    destroyWriters(rt);const line=FOLLOW[s.ballooncon];if(line){
     let message=text(line[0]);if(s.ballooncon===12)message=message.replace('~1',inputName(3)).replace('~2',inputName(1)).replace('~3',inputName(4)).replace('~4',inputName(5));
     if(s.ballooncon===13)message=message.replace('~1',inputName(4)).replace('~2',inputName(5));msgSet(rt,0,message);s.ballooncon=line[1];s.balloonend=line[1]===0?1:0;
    }
    s.talked=.7;rt.globals.typer=70;balloon(s,rt);s.alarm[6]=1;
   }
  },
  endTalk:(s,rt)=>{
   if(s.talked!==1||!isPhase(rt,'enemytalk',s))return;
   s.talktimer++;if((button3_p(rt)&&s.talktimer>15)||!rt.exists(writer)){destroyWriters(rt);s.talkedcon=1;}
   if(s.talkedcon!==1)return;s.rtimer=0;blconSkip(s,rt,-1);
   if(s.attacked===0&&(s.missleattack===1||s.breathattack===1)){
    if(!rt.exists(darkener))rt.create(darkener,0,0);
    if(!rt.exists(growtangle)){const b=rt.create(growtangle,rt.view.x+320,rt.view.y+250);b.maxxscale=s.missleattack===1?2:1.8;b.maxyscale=2;}
    if(!rt.exists(moveHeart)&&!rt.exists(heart)){const c=required(rt,controller);rt.globals.inv=0;rt.create(moveHeart,c.x+4,c.y-120);}
   }
  },
  attackDelay:1,countTurn:false,
  attack:(s,rt)=>{
   const g=rt.globals,c=required(rt,controller);
   if(s.missleattack===1||s.breathattack===1){
    const missile=s.missleattack===1;g.monsterattackname[s.myself]=missile?'gigamissle':'gigabreath';const d=bulletSpawner(s,rt,s.x,s.y,object('obj_dbulletcontroller'));s.dc=d.id;d.type=missile?46:47;d.target=s.mytarget;turnTimer(rt,missile?208:200);
   }else{
    rt.userEvent(c,0);c.attackintrocon=2;for(const b of rt.withInstances(battleController)){b.gigaqueencon=1;b.gigaqueentimer=0;}turnTimer(rt,999999);
   }
   s.missleattack=0;s.breathattack=0;s.turns++;g.typer=6;g.fc=0;s.rr=rt.random.choose(0,1,2,3);
   const key=s.rr===0?213:s.rr===1?required(rt,hud).sub_healthbar_count!==0?214:215:s.rr===2?216:217;
   g.battlemsg[0]=text(key);if(rt.random.irandom(100)<5)g.battlemsg[0]=text(218);
   if(s.haventusedspell===1&&g.tension>=150)g.battlemsg[0]=text(219);if(g.hp[1]<50)g.battlemsg[0]=text(220);
  },
  acts:(s,rt)=>gigaQueenActs(s,rt,controller,object('obj_event_manager')),actsDone:()=>{},
  events:{destroy:destroyGigaQueenState,alarm4:s=>{s.actcon++;},alarm5:s=>{s.acting++;},alarm6:s=>{if(s.balloonend===1)s.talked=1;else{s.talked=.6;s.talktimer=0;}}},
  hooks:{
   catchesKnockout:(_s,rt)=>{rt.userEvent(required(rt,controller),3);return true;},
   soulReturnsTo:(_s,rt)=>{const c=required(rt,controller);return [c.x+4,c.y-120];},
  },
 });
}
