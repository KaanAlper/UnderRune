import type {GmInstance,GmRuntime} from '../../gm/runtime';
import {darkener,growtangle,heart,moveHeart,moveHeartIn} from '../../deltarune/battle';
import {button3_p,randomTarget} from '../../deltarune/controller';
import {sideBPhase} from '../../deltarune/chapter2';
import {heroBlcon} from '../../deltarune/chapter2-enemy';
import {blconSkip,isPhase,msgSet,snd} from '../../deltarune/chapter2-battle';
import {enemyBlcon2} from '../../deltarune/chapter2-objects';
import {destroyWriters,writer} from '../../deltarune/writer';
import {sourceText} from '../../host/text';
import {chooseQueenAttack,advanceQueenPhase} from './chooser';
import {updateQueenActs} from './menu';
import {guardPeek} from '../../deltarune/guard-peek';
import {type QueenObject,queenInstance} from './context';
const text=(key:number|string)=>sourceText(`obj_queen_enemy_slash_Step_0_gml_${key}${typeof key==='number'?'_0':''}`);

/** Source work before the talk state machine. Rewards are delayed until Queen's own ending. */
export function queenBeforeTalk(s:GmInstance,rt:GmRuntime,object:QueenObject){
 const g=rt.globals;
 if(s.intro===2&&!rt.exists(writer)){s.intro=0;g.charturn=0;}
 g.mercymod[s.myself]=0;const c=rt.first(object('obj_battlecontroller'));if(c)s.depth=c.depth+(s.y>rt.view.y+100?1:-1);
 if(rt.exists(object('obj_berdlyplug_enemy')))updateQueenActs(s,rt,object('obj_queenshield_enemy'));
 if(isPhase(rt,'enemytalk',s)&&s.talked===0&&s.turn>14&&g.monsterdf[s.myself]>-25)g.monsterdf[s.myself]-=5;
 if((isPhase(rt,'enemytalk',s)&&s.talked===0&&(g.monsterhp[s.myself]<=0||s.bardlymercy>99))||(s.talked===-1&&s.endcon===0)){
  s.talked=-1;s.wintimer++;if(s.bardlymercy>99){if(s.wintimer===1)s.sprite='spr_queen_chair_1_old';}else if(s.wintimer===30)s.sprite='spr_queen_chair_1_old';if(s.wintimer===90)s.endcon=1;
 }
 if(isPhase(rt,'enemytalk',s)&&s.talked===0)advanceQueenPhase(s,rt);
 if(isPhase(rt,'enemytalk',s)&&s.talked===0&&rt.exists(object('obj_queenshield_enemy'))){
  s.alarm[5]=30;s.talked=.4;
  if(s.shieldhp<=5||s.shieldacthp<1){
   for(const sh of rt.withInstances(object('obj_queenshield_enemy'))){sh.shieldhurt=2;sh.shieldhurttimer=0;}
   for(const wine of rt.withInstances(object('obj_queen_battlesolid_wine')))rt.destroy(wine);
   s.shieldhp=0;s.shieldbrokecon=1;s.shieldjustbroke=1;s.sprite='spr_queen_drunk';snd(rt,'snd_queen_hoot_0');
   if(s.phase===4)s.usefinalattack=1;s.shieldjustwentdown=1;
  }else for(const sh of rt.withInstances(object('obj_queenshield_enemy')))sh.appearcon=2;
 }
 if(isPhase(rt,'enemytalk',s)&&s.talked===0){s.talked=.5;const sh=rt.first(object('obj_queenshield_enemy'));if(sh){sh.turn++;if(sh.turn>1&&s.shieldhp>0)s.shieldhp-=Math.ceil(s.shieldmaxhp*.1);}}
}

const OPEN:[number,number,number?][]=[[131,1,3],[132,0],[133,3],[134,4],[135,5],[136,6],[137,8],[138,9],[139,10],[140,11],[141,0],[142,12,3],[143,13,2],[146,14]];
const FOLLOW:Record<number,[number,number,number?]>={1:[183,2,3],2:[184,0],3:[186,0],4:[188,0],5:[190,0],6:[192,7],7:[193,0],8:[195,0],9:[197,0],10:[199,0],11:[201,0],12:[203,0],13:[205,0],14:[207,0,2],15:[212,16],16:[213,17],17:[214,18],18:[215,19],19:[216,20],20:[218,21,2],21:[219,0,2],22:[432,23],23:[433,24],24:[434,0],25:[436,0]};
function speakBalloon(s:GmInstance,rt:GmRuntime,object:QueenObject,first:boolean){
 rt.globals.typer=sideBPhase(rt)<2?70:71;
 const actor=s.ralseitalks===1?'obj_heroralsei':s.susietalks===1?'obj_herosusie':undefined,hero=actor?rt.first(object(actor)):undefined;
 if(hero){
  rt.globals.typer=actor==='obj_heroralsei'?74:75;
  if(first)enemyBlcon2(s,rt,hero.x+75,hero.y+15,7);else heroBlcon(s,rt,actor==='obj_heroralsei'?'ralsei':'susie');
  guardPeek(s,rt,hero,object('obj_battle_marker'),object('obj_heroralsei'),object('obj_herosusie'));
 }else enemyBlcon2(s,rt,s.x-10,rt.globals.monstery[s.myself],10);
 s.ralseitalks=0;s.susietalks=0;
}

export function queenDialogue(s:GmInstance,rt:GmRuntime,object:QueenObject){
 if(isPhase(rt,'enemytalk',s)&&s.talked===.5){
  randomTarget(s,rt);if(!rt.exists(darkener))rt.create(darkener,0,0);if(s.aimact>0)s.aimact--;
  for(const marker of rt.withInstances(object('obj_heartmarker')))rt.destroy(marker);
  s.sprite='spr_queen_chair_1_old';s.state=0;s.ballooncon=0;s.balloonsubcon=0;s.balloonend=1;s.talkedcon=0;s.ralseitalks=0;s.susietalks=0;s.attackdone=0;
  s.rr=rt.random.choose(0,1,2,3);msgSet(rt,0,text(123+s.rr));
  if(s.usefinalattack>=1&&s.finalattackdialoguecon<5){
   const keys:[number|string,number][]=[[328,22],['329_0_b',0],[329,25],[330,0],[331,0]],line=keys[s.finalattackdialoguecon];
   msgSet(rt,0,text(line[0]));if(line[1]!==0){s.ballooncon=line[1];s.balloonend=0;}s.finalattackdialoguecon++;if(s.balloonorder<14)s.balloonorder=14;
  }else if(s.drunk===1&&s.drunkcount===0&&s.balloonorder>13){s.drunkcount=1;msgSet(rt,0,text(128));}
  else{
   const line=OPEN[s.balloonorder];if(line){msgSet(rt,0,text(line[0]));if(line[1]!==0){s.ballooncon=line[1];s.balloonend=0;}if(line[2]===3)s.ralseitalks=1;if(line[2]===2)s.susietalks=1;}
   if(s.balloonorder===13)for(const x of [200,300,400])rt.create(object('obj_queen_battle_plug'),rt.view.x+x,rt.view.y-30);
   s.balloonorder++;
  }
  speakBalloon(s,rt,object,true);s.drunk=0;s.talked=s.ballooncon===0?1:.6;s.talktimer=0;
 }
 if(s.talked===.6){
  s.talktimer++;
  if((button3_p(rt)&&s.talktimer>15&&s.susieinterrupts===0)||!rt.exists(writer)||(s.susieinterrupts===1&&s.talktimer>15)){
   destroyWriters(rt);const previous=s.ballooncon,line=FOLLOW[previous];
   if(line){msgSet(rt,0,text(line[0]));s.ballooncon=line[1];if(line[1]===0)s.balloonend=1;if(line[2]===3)s.ralseitalks=1;if(line[2]===2)s.susietalks=1;}
   if(previous===14)for(const p of rt.withInstances(object('obj_queen_battle_plug')))p.con=2;
   if(previous===19)s.susieinterrupts=1;if(previous===20)s.susieinterrupts=0;
   s.talked=.7;speakBalloon(s,rt,object,false);s.alarm[6]=1;
  }
 }
}

export function queenEndTalk(s:GmInstance,rt:GmRuntime,object:QueenObject){
 if(s.talked!==1||!isPhase(rt,'enemytalk',s))return;
 s.talktimer++;if((button3_p(rt)&&s.talktimer>15)||!rt.exists(writer)){destroyWriters(rt);s.talkedcon=1;}
 if(s.talkedcon!==1)return;s.rtimer=0;blconSkip(s,rt,-1);
 if(!isPhase(rt,'bullets',s))return;
 if(s.rtimer===0&&s.attackdone===0){
  s.attackdone=1;if(s.attackdebug<0)chooseQueenAttack(s,rt,object('obj_berdlyplug_enemy'));else s.rr=s.attackdebug;if(s.difficultydebug!==0)s.difficulty=s.difficultydebug;
  if(!rt.exists(growtangle)){
   const y=[1,7,9].includes(s.rr)?200:s.rr===5?237:170,b=rt.create(growtangle,rt.view.x+320,rt.view.y+y);
   if(s.rr===7){b.maxxscale=2;b.maxyscale=1.5;}if(s.rr===9&&s.difficulty===1){b.maxxscale=1.5;b.maxyscale=2;}
  }
  if(s.rr===2){const b=rt.first(growtangle)!;b.sprite='spr_nothing';b.visible=false;}
 }
 if(!rt.exists(moveHeart)&&!rt.exists(heart)&&s.rr!==2)moveHeartIn(rt);
}
