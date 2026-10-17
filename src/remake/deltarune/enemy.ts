// The standard battle enemy: Chapter 2's obj_baseenemy, the template the game's enemy objects are copied from. Every
// enemy turn runs the same steps in the same order: the talk starts (target, darkness, words), extra balloons, the
// words end and the soul and box come in, a few frames later the attack starts, then ACTs during the party's turn.
//
// An enemy is this template plus a strategy: the steps it does its own way. A step the strategy leaves out runs the
// template's default (obj_baseenemy's code). The order of the steps never changes, so an enemy cannot run them out
// of order, and a difference from the template is always one named step in that enemy's strategy.
import type {GmEvent,GmHandler,GmInstance,GmObjectDef,GmRuntime} from '../gm/runtime';
import {darkener,growtangle,monsterParent,moveHeart,moveHeartIn} from './battle';
import {attackPhase,button1_p,nextAct,randomTarget} from './controller';
import {monsterSetup} from './encounter';
import {blconSkip,isPhase,turnTimer} from './chapter2-battle';
import {destroyWriters,writer} from './writer';
import type {HookedDef,BattleHooks} from './rules';

type Step=(s:GmInstance,rt:GmRuntime)=>void;
export interface EnemyStrategy{
 /** Create: the enemy's fields. */
 create:Step;
 /** Every Step, first. */
 beforeStep?:Step;
 /** The rest of the Step runs only while global.fighting is 1. */
 onlyWhileFighting?:boolean;
 /** Whether it takes its turn (the template: global.monster[myself] is 1). */
 isAlive?:(s:GmInstance,rt:GmRuntime)=>boolean;
 /** While alive, before the talk can start. */
 beforeTalk?:Step;
 /** The enemy turn begins. Default: a random target, the darkness, then talk(), and the talk is under way. */
 startTalk?:Step;
 /** The words of the default startTalk: messages and the balloon. */
 talk?:Step;
 /** While talking, after the first balloon: more balloons. */
 duringTalk?:Step;
 /** The words end and the soul and box come in. Default: scr_blconskip(15), then the soul, then the box. */
 endTalk?:Step;
 /** Frames from the end of the talk to the attack (the template's 12); 0 attacks at once, with no wait. */
 attackDelay?:number;
 /** The attack starts: bullet makers and the turn's length. */
 attack:Step;
 /** While true, the attack step does not run at all (the Roaring Knight's ending). */
 holdsAttack?:(s:GmInstance,rt:GmRuntime)=>boolean;
 /** False when the enemy counts its turns itself in attack() (K.Round counts only the turns he attacks in). */
 countTurn?:boolean;
 /** Each frame before the attack starts: the turn lasts at least this long (the template's scr_turntimer(120)). */
 attackWait?:Step;
 /** The status line once the attack has started (after the turn count, voice and portrait are reset). */
 statusLine?:Step;
 /** While alive, after the attack step. */
 afterAttack?:Step;
 /** After the alive enemy's turn steps, before the ACTs (whether or not it is still alive): battle-ending sequences. */
 afterEnemyTurn?:Step;
 /** The party's ACTs on this enemy (global.myfight 3). */
 acts?:Step;
 /** The ACTs are over. Default: the next act (or the enemy turn) once the writer is gone. */
 actsDone?:Step;
 /** Every Step, last. */
 afterStep?:Step;
 /** Where its HP bar and damage numbers go (scr_monstersetup's monsterx/monstery). Default: its sprite's centre. */
 monsterPosition?:(s:GmInstance,rt:GmRuntime)=>[number,number];
 /** What the shared engine does differently for this enemy (rules.ts). */
 hooks?:BattleHooks;
 /** Its other events (Draw, End Step, alarms, user events), as the enemy defines them. */
 events?:Partial<Record<GmEvent,GmHandler>>;
}

/** obj_baseenemy's talk end: the words can be skipped after 15 frames; then the soul flies in and the box opens. */
function defaultEndTalk(s:GmInstance,rt:GmRuntime){
 if(s.talked!==1||!isPhase(rt,'enemytalk',s))return;
 s.rtimer=0;blconSkip(s,rt,15);
 if(isPhase(rt,'bullets',s)){
  if(!rt.exists(moveHeart))moveHeartIn(rt);
  if(!rt.exists(growtangle))rt.create(growtangle,rt.view.x+320,rt.view.y+170);
 }
}
function defaultActsDone(s:GmInstance,rt:GmRuntime){if(s.actcon===1&&!rt.exists(writer))nextAct(rt,s);}

function templateStep(st:EnemyStrategy):Step{
 const startTalk:Step=st.startTalk??((s,rt)=>{
  randomTarget(s,rt);
  if(!rt.exists(darkener))rt.create(darkener,0,0);
  st.talk?.(s,rt);s.talked=1;s.talktimer=0;
 });
 const endTalk=st.endTalk??defaultEndTalk,actsDone=st.actsDone??defaultActsDone,delay=st.attackDelay??12;
 const attackWait:Step=st.attackWait??((_s,rt)=>turnTimer(rt,120));
 const isAlive=st.isAlive??((s,rt)=>rt.globals.monster[s.myself]===1);
 return (s,rt)=>{
  const g=rt.globals;
  st.beforeStep?.(s,rt);
  if(st.onlyWhileFighting&&g.fighting!==1)return;
  if(isAlive(s,rt)){
   st.beforeTalk?.(s,rt);
   if(isPhase(rt,'enemytalk',s)&&s.talked===0)startTalk(s,rt);
   st.duringTalk?.(s,rt);
   endTalk(s,rt);
   if(isPhase(rt,'bullets',s)&&s.attacked===0&&!st.holdsAttack?.(s,rt)){
    if(delay>0)s.rtimer+=1;
    if(delay===0||s.rtimer===delay){st.attack(s,rt);if(st.countTurn!==false)s.turns+=1;g.typer=6;g.fc=0;st.statusLine?.(s,rt);s.attacked=1;}
    else attackWait(s,rt);
   }
   st.afterAttack?.(s,rt);
  }
  st.afterEnemyTurn?.(s,rt);
  if(g.myfight===3){st.acts?.(s,rt);actsDone(s,rt);}
  st.afterStep?.(s,rt);
 };
}
/** An enemy object: the template's events with the strategy's steps, as a child of obj_monsterparent. The depth is
 * required: instance_create gives new instances their object's depth from the game's table (0 when it has none). */
export function defineEnemy(base:{name:string;index:number;depth:number;sprite?:string;parent?:GmObjectDef},st:EnemyStrategy):HookedDef{
 const position=st.monsterPosition??((s,rt)=>[s.x+rt.spriteWidth(s)/2,s.y+rt.spriteHeight(s)/2]);
 return {...base,parent:base.parent??monsterParent,hooks:st.hooks,events:{
  alarm4:s=>{s.con+=1;},
  ...st.events,
  create:st.create,
  step:templateStep(st),
  user12:(s,rt)=>{const [x,y]=position(s,rt);rt.globals.monsterx[s.myself]=x;rt.globals.monstery[s.myself]=y;monsterSetup(s,rt);},
 }};
}

// ---- Strategy steps several enemies share ----
/** The talk ends after talkmax frames (skippable with Z after `skip` frames): the soul and box come in, the writers go,
 * and the enemy turn starts (the Chapter 1 Lancer fights). */
export const endTalkAfter=(skip:number):Step=>(s,rt)=>{
 const g=rt.globals;
 if(s.talked!==1||g.mnfight!==1)return;
 if(button1_p(rt)&&s.talktimer>skip)s.talktimer=s.talkmax;
 s.talktimer+=1;
 if(s.talktimer>=s.talkmax){
  if(!rt.exists(moveHeart))moveHeartIn(rt);
  if(!rt.exists(growtangle))rt.create(growtangle,rt.view.x+320,rt.view.y+170);
  destroyWriters(rt);g.mnfight=2;
 }
};
/** Chapter 1's end of the ACTs: once the writer is gone, the enemy turn (scr_attackphase). */
export const actsDoneAttackPhase:Step=(s,rt)=>{if(s.actcon===1&&!rt.exists(writer)){s.actcon=0;attackPhase(rt);}};
