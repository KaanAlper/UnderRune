// Spamton (Chapter 2, encounter 60), before NEO: a salesman with three attacks (Minitons, WordBullets, MoneyVacuum)
// and a chain of DEALs: answer each the right way to raise his mercy, and the final deal ends the battle.
// Object: obj_spamton_enemy.
import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {defineEnemy} from '../../deltarune/enemy';
import {enemyDrawIdleGeneric,enemyHurtTiredAfterDamage,enemyObjectInit,speaker} from '../../deltarune/chapter2-enemy';
import {darkMarker,growtangle,moveHeart,moveHeartIn,sndFreeAll} from '../../deltarune/battle';
import {monsterDefeat,nextAct} from '../../deltarune/controller';
import {blconSkip,bulletSpawner,isPhase,mercyAdd2,msgNext,msgSet,turnTimer} from '../../deltarune/chapter2-battle';
import {enemyBlcon2} from '../../deltarune/chapter2-objects';
import {healItem} from '../../deltarune/party';
import {battleTextDefault,writer} from '../../deltarune/writer';
import {choicerNeo} from '../../deltarune/choicer';
import {snd} from '../../deltarune/sound';
import {sourceText} from '../../host/text';

const T=(n:number|string)=>sourceText('obj_spamton_enemy_slash_Step_0_gml_'+n+(typeof n==='number'?'_0':''));
/** What flag 20 (set by the writer's \M) shows him as, and how much he shakes. */
const MOODS:Readonly<Record<number,[string,number]>>={0:['spr_spamton_idle',0],1:['spr_spamton_dark',0],2:['spr_spamton_laugh_left',2],3:['spr_cutscene_14_spamton_grab',2],
 4:['spr_cutscene_14_spamton_arms_up',0],5:['spr_cutscene_14_spamton_laugh_right',2],6:['spr_cutscene_14_spamton_laugh_large',2]};
/** The DEALs in order: [answers (choicemsg keys), the right answer, first offer lines, repeated offer line]. */
const DEALS:readonly (readonly [readonly [number,number],number,readonly number[],number])[]=[
 [[164,165],0,[172,173,174],178],
 [[185,186],1,[193,194,196],200],
 [[207,208],1,[215,216,218,220,221,222,224,225],229],
 [[236,237],1,[244,245,246,247],251],
 [[258,259],1,[266,267,268],272],
];
/** The reply to each answer: [right lines, wrong lines, whether a wrong answer costs KROMER (actcon 50)]. */
const REPLIES:readonly (readonly [readonly number[],readonly number[],boolean])[]=[
 [[299,300],[304],false],
 [[317,318],[323,324],true],
 [[346,348],[353,354,356],false],
 [[368,369,370],[374,375],true],
 [[400,401,402,403,404,405,406,407],[413,414],true],
];

export function createSpamtonEnemy(object:(name:string)=>GmObjectDef,help:{cherub:GmObjectDef;callHelp:(s:GmInstance,rt:GmRuntime)=>void}):GmObjectDef{
 const base=object('obj_spamton_enemy');
 const balloon=(s:GmInstance,rt:GmRuntime,dx=0)=>enemyBlcon2(s,rt,s.x-10+dx,rt.globals.monstery[s.myself],10);
 function acts(s:GmInstance,rt:GmRuntime){
  const g=rt.globals,choices=(g.choicemsg??=[]) as string[];s.xx=rt.view.x;s.yy=rt.view.y;
  const lines=(keys:readonly number[])=>{msgSet(rt,0,T(keys[0]));for(const k of keys.slice(1))msgNext(rt,T(k));};
  if(s.acting===1&&s.actcon===0){s.actcon=1;msgSet(rt,0,T(153));battleTextDefault(rt,s);}
  // DEAL: his offer, then the answers (\C2 makes the choice box).
  if(s.acting===2&&s.actcon===0){
   s.actcon=5;
   const deal=DEALS[s.deal_counter];
   if(deal){
    s.correct_answer=deal[1];choices[0]=T(deal[0][0]);choices[1]=T(deal[0][1]);
    speaker(s,rt,'spamton');
    if(s.deal_read===0){s.deal_read++;lines(deal[2]);}else msgSet(rt,0,T(deal[3]));
   }
   balloon(s,rt);
  }
  if(s.actcon===5&&!rt.exists(writer)){s.actcon=10;msgSet(rt,0,'\\C2 ');battleTextDefault(rt,s);}
  if(s.actcon===10&&!rt.exists(writer)&&!rt.exists(choicerNeo)){
   const n=s.deal_counter,reply=REPLIES[n];
   if(reply){
    if(n<4)s.actcon=1;
    if(g.choice===s.correct_answer){
     if(n===4){
      // The final deal is offered.
      s.actcon=20;s.deal_counter++;s.deal_read=0;snd(rt,'snd_great_shine');mercyAdd2(s,rt,s.myself,19);s.correct_answer=1;
      choices[0]=T(396);choices[1]=T(397);speaker(s,rt,'spamton');lines(reply[0]);
     }else{
      if(n===2||n===3){s.deal_counter++;s.deal_read=0;snd(rt,'snd_great_shine');mercyAdd2(s,rt,s.myself,20);}
      else{snd(rt,'snd_great_shine');mercyAdd2(s,rt,s.myself,20);s.deal_counter++;s.deal_read=0;}
      speaker(s,rt,'spamton');lines(reply[0]);
     }
    }else{
     if(n===4)s.actcon=50;
     snd(rt,'snd_error');speaker(s,rt,'spamton');lines(reply[1]);
     if(n===1)s.kromer_message=1;
     if(reply[2])s.actcon=50;
    }
   }
   balloon(s,rt);
  }
  if(s.actcon===20&&!rt.exists(writer)){s.actcon=25;msgSet(rt,0,'\\C2 ');battleTextDefault(rt,s);}
  // The final deal: taking it ends the battle; refusing makes him bigger.
  if(s.actcon===25&&!rt.exists(writer)&&!rt.exists(choicerNeo)){
   if(g.choice===s.correct_answer){
    s.actcon=26;mercyAdd2(s,rt,s.myself,100);g.mercymod[s.myself]=0;snd(rt,'snd_great_shine');sndFreeAll(rt);
    s.imageXscale=2;s.remx+=s.expand_spam;s.alarm[4]=60;
   }else{
    s.actcon=20;speaker(s,rt,'spamton');
    if(s.expand_spam<8){const w=rt.bank.get('spr_spamton_idle')!.width;s.imageXscale+=.25;s.expand_spam+=w*.125;s.remx-=w*.125;}
    msgSet(rt,0,T(452));balloon(s,rt,s.expand_spam);
   }
  }
  if(s.actcon===27){speaker(s,rt,'spamton');lines([464,465]);balloon(s,rt);s.actcon=28;}
  if(s.actcon===28&&!rt.exists(writer)){g.flag[309]=1;monsterDefeat(s,rt);s.actcon=1;}
  // A wrong answer in the KROMER deals: some money goes.
  if(s.actcon===50&&!rt.exists(writer)&&!rt.exists(choicerNeo)){
   snd(rt,'snd_hypnosis');g.msg[0]=T(415);s.actcon=1;g.gold=g.gold>=25?g.gold-25:0;battleTextDefault(rt,s);
  }
  // HealDeal: Kris is healed 60, then it goes on as a DEAL.
  if(s.acting===3&&s.actcon===0){s.star=0;healItem(s,rt,60);s.acting=2;s.actcon=0;}
 }
 return defineEnemy({name:base.name,index:base.index,depth:base.depth??0,sprite:base.sprite},{
  create:(s,rt)=>{
   enemyObjectInit(s,rt);
   Object.assign(s,{talkmax:90,imageSpeed:1/6,idlesprite:'spr_spamton_idle',hurtsprite:'spr_spamton_hurt',sparedsprite:'spr_spamton_spared',bodymode:0,bodycon:0,bodytimer:0});
   const head=darkMarker(rt,s,-999,-999,'spr_spamton_laugh_top');s.headpiece=head.id;head.depth=-10;head.imageSpeed=.1;
   Object.assign(s,{bodyadvance:0,bulletoverride:-1,help_counter:0,vacuum_attack:0,singles_attack:0,enlarge_attack:0,party_heal:false,deal_counter:0,deal_read:0,correct_answer:0,kromer_message:0,remx:s.x,remy:s.y});
   rt.globals.flag[20]=0;s.shakeamt=0;s.expand_spam=0;
  },
  // Each attack is offered once, then advertising or a call for HELP.
  talk:(s,rt)=>{
   const g=rt.globals;g.typer=68;s.rr=rt.random.irandom(2);
   if(s.rr===0&&s.enlarge_attack===0){s.enlarge_attack++;msgSet(rt,0,T(20));s.bulletoverride=1;}
   else if(s.rr===1&&s.vacuum_attack===0){s.vacuum_attack++;msgSet(rt,0,T(26));s.bulletoverride=2;}
   else if(s.rr===2&&s.singles_attack===0){s.singles_attack++;msgSet(rt,0,T(32));s.bulletoverride=0;}
   else{
    const other=rt.random.irandom(1);
    if(other===0)msgSet(rt,0,T(41));else if(s.help_counter===0){s.help_counter++;msgSet(rt,0,T(47));}else msgSet(rt,0,T(50));
    s.bulletoverride=-1;
   }
   balloon(s,rt);
  },
  // While F1's helpers fly, the talk runs out on its own instead of being skippable.
  endTalk:(s,rt)=>{
   if(s.talked!==1||!isPhase(rt,'enemytalk',s))return;
   s.rtimer=0;if(!rt.exists(help.cherub))blconSkip(s,rt,15);else s.talktimer+=1;
   if(isPhase(rt,'bullets',s)){if(!rt.exists(moveHeart))moveHeartIn(rt);if(!rt.exists(growtangle))rt.create(growtangle,rt.view.x+320,rt.view.y+170);}
  },
  attackDelay:16,
  afterAttack:help.callHelp,
  attack:(s,rt)=>{
   const g=rt.globals;s.rr=s.bulletoverride===-1?rt.random.irandom(2):s.bulletoverride;
   const attacks:readonly [string,number][]=[['Minitons',23],['WordBullets',24],['MoneyVacuum',25]];
   const [name,type]=attacks[s.rr];g.monsterattackname[s.myself]=name;
   const dc=bulletSpawner(s,rt,s.x,s.y,object('obj_dbulletcontroller'));s.dc=dc.id;dc.type=type;
   turnTimer(rt,270);
  },
  statusLine:(s,rt)=>{
   const g=rt.globals;
   if(s.turns===1)g.battlemsg[0]=T(120);
   else if(s.turns===2)g.battlemsg[0]=T(123);
   else{s.rr=rt.random.choose(0,1,2,3,4);g.battlemsg[0]=T([127,128,129,130,131][s.rr]);}
  },
  acts,
  actsDone:(s,rt)=>{if(s.actcon===1&&!rt.exists(writer)){rt.globals.flag[20]=0;nextAct(rt,s);}},
  events:{
   alarm4:s=>{s.actcon+=1;},
   draw:(s,rt)=>{
    if(s.bodymode!==0)throw Error('Spamton body mode (a debug key) is not ported');
    if(s.state===3){
     enemyHurtTiredAfterDamage(s,rt,.5);s.hurttimer-=1;
     if(s.hurttimer<0&&rt.globals.monster[s.myself]>0)s.state=0;
     else{
      if(rt.globals.monster[s.myself]===0)s.hurtsprite=s.idlesprite;
      s.hurtshake+=1;if(s.hurtshake>1){if(s.shakex>0)s.shakex-=1;if(s.shakex<0)s.shakex+=1;s.shakex=-s.shakex;s.hurtshake=0;}
      rt.drawSprite(s.hurtsprite,0,s.x+s.shakex+s.hurtspriteoffx,s.y+s.hurtspriteoffy,2,2,0,s.imageBlend,1);
     }
    }
    const mood=MOODS[rt.globals.flag[20]];if(mood){s.idlesprite=mood[0];s.shakeamt=mood[1];}
    if(s.state===0){
     if(s.shakeamt>0){s.x=s.remx+rt.random.randomRange(-s.shakeamt,s.shakeamt);s.y=s.remy+rt.random.randomRange(-s.shakeamt,s.shakeamt);}
     else{s.x=s.remx;s.y=s.remy;}
    }
    enemyDrawIdleGeneric(s,rt,1/6);
    if(s.becomeflash===0)s.flash=0;s.becomeflash=0;
   },
  },
 });
}
