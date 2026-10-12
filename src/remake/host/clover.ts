import type {GmInstance,GmRuntime} from '../gm/runtime';
import {createCloverEnemy} from '../bosses/clover';
import {sourceText} from './text';
import {destroyWriters,runtimeDialogue,type SourceDialogue,type SourceEnemyEvents,type SourceEnemyHost,type SourceEnemyPhase} from './enemy-host';
import {battleText,enemyBalloon,writer} from '../deltarune/writer';
import {KEY,monsterParent,spareAnim} from '../deltarune/battle';
/** Clover's lines come from the site bundle (see text.ts); only the lines in text-keys.json are bundled. */
export const cloverText=sourceText;
export const cloverPlain=(s:string)=>s.replace(/\^\d/g,'').replace(/\/%?|%%/g,'').replace(/[&#]/g,'\n').replace(/\\[A-Za-z]\d/g,'').trim();
export type CloverDialogue=SourceDialogue;
export type CloverEnemyPhase=SourceEnemyPhase;
export type CloverHostEvents=SourceEnemyEvents;
export class CloverHost implements SourceEnemyHost {
 readonly body:GmInstance;phase:CloverEnemyPhase='idle';
 /** The root owns rt.step()/draw(), shared party healing, item effects and command timing. */
 constructor(readonly rt:GmRuntime,readonly control:GmInstance,readonly events:CloverHostEvents={}){
  this.installGlobals();
  const def=createCloverEnemy({
   // The game's own writers: scr_enemyblcon balloons for the heads, scr_battletext for the battle box.
   text:cloverText,writerExists:()=>rt.exists(writer),
   enemySpeech:(_rt,x,y,kind)=>{enemyBalloon(rt,x,y,kind);},
   battleText:(_rt,useDefault)=>{if(useDefault){rt.globals.fc=0;rt.globals.typer=4;}battleText(rt);},
   dismissWriters:()=>destroyWriters(rt),attackPhase:()=>this.completeAction(),
   monsterSetup:s=>this.setupMonster(s),
   defeat:(s,runtime)=>{
    const a=runtime.create(cloverDefeat,s.x,s.y);a.sprite=s.hurtsprite;a.imageIndex=0;a.imageXscale=s.imageXscale;a.imageYscale=s.imageYscale;
    runtime.destroy(s);this.control.timeron=0;this.events.onDefeat?.(s);
   },
  });
  this.body=rt.create(def,rt.view.x+400,rt.view.y+120);this.body.myself=0;rt.globals.monsterinstance[0]=this.body.id;
  rt.userEvent(this.body,12);
 }
 get dialogue():readonly CloverDialogue[]{return runtimeDialogue(this.rt);}
 get hp(){return this.rt.globals.monsterhp[0] as number;}
 get mercy(){return this.rt.globals.mercymod[0] as number;}
 get tired(){return this.rt.globals.monsterstatus[0]===1;}
 get sparePoints(){return this.rt.globals.sparepoint[0] as number;}
 get message(){return cloverPlain(this.rt.globals.battlemsg[0]);}
 get initialText(){return cloverPlain(cloverText('scr_encountersetup_slash_scr_encountersetup_gml_139_0'));}
 /** The shared damage formula and equipment effects own these values; Clover reads its native global slots. */
 syncEnemyStats(hp:number,at:number,df:number){const g=this.rt.globals;g.monsterhp[0]=hp;g.monsterat[0]=at;g.monsterdf[0]=df;}
 /** Call after shared damage numbers/effects, instead of starting generic enemy recoil or immediate defeat. */
 receiveHit(hp:number,amount:number){
  if(!this.body.live)return;const g=this.rt.globals;g.monsterhp[0]=hp;
  if(amount>0){this.body.shakex=9;this.body.state=3;this.body.hurttimer=30;this.body.hurtamt=amount;}else this.body.hurtamt=0;
  // The enemy's following Draw runs scr_defeatrun.
  if(hp<=0&&g.monster[0]===1){this.monsterDefeat();this.rt.userEvent(this.body,11);}
 }
 /** scr_monsterdefeat: rewards and the battle outcome flag (1 defeated, 2 spared, 3 pacified), counted once. */
 private monsterDefeat(){
  const g=this.rt.globals;if(g.monster[0]!==1)return;
  g.monstergold[3]+=g.monstergold[0];g.monsterexp[3]+=g.monsterexp[0];g.monster[0]=0;
  if(g.flag[51]===0)g.flag[51]=g.monsterhp[0]<=0?1:2;
  const counters:Record<number,number>={1:40,2:41,3:42,5:43};if(counters[g.flag[51]]!==undefined)g.flag[counters[g.flag[51]]]++;
  if(g.flag[51]===3)g.flag[50]=3;if(g.flag[51]===2)g.flag[50]=2;if(g.flag[51]===1)g.flag[50]=1;
 }
 /** SPARE at full mercy (outcome 2) or Pacify while TIRED (outcome 3): the inherited enemy event 10. */
 spare(outcome:2|3){
  if(!this.body.live||this.rt.globals.monster[0]!==1)return;
  const g=this.rt.globals,s=this.body;g.flag[51]=outcome;
  // scr_spareanim, then scr_monsterdefeat, then instance_destroy.
  const a=this.rt.create(spareAnim,s.x,s.y);a.sprite=s.sparedsprite;a.imageIndex=0;a.imageXscale=s.imageXscale;a.imageYscale=s.imageYscale;
  this.monsterDefeat();this.rt.destroy(s);this.control.timeron=0;
 }
 /** scr_mercyadd: a SPARE that is not ready yet adds the enemy's spare points. */
 addMercy(amount:number){const g=this.rt.globals;g.mercymod[0]=Math.max(0,g.mercymod[0]+amount);}
 get choices(){
  const g=this.rt.globals;
  return g.actname[0].map((name:string,value:number)=>{
   const actor=g.actactor[0][value],participants=[0];
   if(actor===3){const ralsei=g.char.indexOf(3);if(ralsei>=0)participants.push(ralsei);}
   return {name,value,actor,participants,disabled:g.canact[0][value]!==1||g.hp[g.char[0]]<=0||(actor===3&&(!g.char.includes(3)||g.hp[3]<=0))};
  }) as {name:string;value:number;actor:number;participants:number[];disabled:boolean}[];
 }
 /** Command UI reserves the returned participant slots as ACT/assist before resolving other actions. */
 reserveAct(value:number){
  const choice=this.choices[value];if(!choice||choice.disabled)throw Error('Clover ACT is unavailable');
  const g=this.rt.globals;this.body.acting=value+1;
  for(const slot of choice.participants){g.acting[slot]=1;g.faceaction[slot]=6;g.charaction[slot]=9;}
  return [...choice.participants];
 }
 /** Call during action resolution; subsequent native Step events produce the actual dialogue stages. */
 beginAct(value:number){
  if(this.rt.exists(writer))throw Error('Clover dialogue is still active');
  this.reserveAct(value);this.body.actcon=0;this.rt.globals.myfight=3;this.rt.globals.mnfight=0;
 }
 /** UI marks this captured writer gone, matching the source instance_exists gate on the next Step. */
 completeDialogue(id:number){const w=this.rt.byId(id);if(w)this.rt.destroy(w);}
 /** Z for this frame: the writers (and the enemy's speech skip) read it as the game does. */
 confirm(){this.rt.input.pressed.add(KEY.z);}
 /** Called after the shared player attack/magic/item phases have finished. No target or pattern roll here. */
 beginEnemyTurn(){
  if(!this.body.live||this.rt.globals.monster[0]===0)throw Error('Clover has already left the battle');
  destroyWriters(this.rt);const g=this.rt.globals;g.targeted=[0,0,0];g.charturn=3;g.mnfight=1;g.myfight=-1;
  this.control.timeron=1;this.control.reset=0;this.control.noreturn=0;this.setPhase('speech');
 }
 /** Call once immediately after the shared runtime Step; this observes, rather than replaces, native scheduling. */
 afterStep(){
  const g=this.rt.globals;
  if(g.mnfight===2&&this.control.reset===1)this.setPhase('return');
  else if(g.mnfight===2)this.setPhase(this.body.attacked===1?'attack':'transition');
 }
 /** Call after shared return-heart/arena cleanup and downed-party healing, before reopening commands. */
 returnToCommands(){
  destroyWriters(this.rt);const g=this.rt.globals;g.mnfight=0;g.myfight=0;g.bmenuno=0;g.charturn=0;this.control.timeron=0;
  for(const m of this.rt.all(monsterParent)){m.attacked=0;m.talked=0;m.acting=0;}
  for(let i=0;i<3;i++){g.acting[i]=0;g.temptension[i]=g.tension;g.charspecial[i]=0;g.targeted[i]=0;g.charaction[i]=0;g.faceaction[i]=0;}
  this.setPhase('idle');
 }
 private setPhase(phase:CloverEnemyPhase){if(this.phase!==phase){this.phase=phase;this.events.onPhase?.(phase);}}
 private completeAction(){
  const g=this.rt.globals;
  if(g.monster[0]===0){this.control.techwon=1;this.events.onDefeat?.(this.body);return;}
  this.control.techwon=0;this.control.fightphase=g.charaction.some((a:number)=>a===4||a===2)?0:1;
  if(g.myfight===4)this.control.fightphase=1;
  g.charturn=3;g.myfight=this.control.fightphase===1?1:4;this.events.onActionComplete?.();
 }
 private setupMonster(s:GmInstance){
  const g=this.rt.globals,i=s.myself;
  g.monstername[i]=cloverText('scr_monstersetup_slash_scr_monstersetup_gml_449_0');
  g.monstermaxhp[i]=270;g.monsterhp[i]=270;g.monsterat[i]=6;g.monsterdf[i]=1;g.monsterexp[i]=0;g.monstergold[i]=80;g.sparepoint[i]=10;g.mercymod[i]=0;g.mercymax[i]=100;
  for(const [act,line] of [463,465,467,470,473,475].entries()){g.canact[i][act]=1;g.actname[i][act]=cloverText(`scr_monstersetup_slash_scr_monstersetup_gml_${line}_0`);}
  for(const act of [1,2,3])g.actactor[i][act]=3;
  s.myact=this.rt.random.choose(0,1,2);
 }
 private installGlobals(){
  const g=this.rt.globals;
  if(g.char?.[0]!==1||g.char[1]!==3||(g.char[2]??0)!==0)throw Error('Standalone Clover requires Kris and Ralsei from encounter 8');
  // Native encounter setup and battlecontroller Create initialise each monster/ACT slot before user12.
  g.encounterno=8;g.monstertype=[16,0,0];g.monstermakex=[this.rt.view.x+400,0,0];g.monstermakey=[this.rt.view.y+120,0,0];g.monster=[1,0,0];
  for(const key of ['monsterx','monstery','monsterat','monsterdf','monsterhp','monstermaxhp','monstergold','monsterexp','sparepoint','hittarget','mercymod','mercymax','monsterstatus','monsterinstance'])g[key]=[0,0,0];
  g.monstergold.push(0);g.monsterexp.push(0);g.monstername=[' ',' ',' '];g.monstercomment=[' ',' ',' '];
  for(const key of ['act','canact','acttype','actspell','actcost'])g[key]=Array.from({length:3},()=>new Array(6).fill(0));
  for(const key of ['actname','actdesc'])g[key]=Array.from({length:3},()=>new Array(6).fill(' '));g.actactor=Array.from({length:3},()=>new Array(6).fill(1));
  g.msg=new Array(100).fill(' ');g.battlemsg=new Array(100).fill(' ');g.battlemsg[0]=cloverText('scr_encountersetup_slash_scr_encountersetup_gml_139_0');
  g.myfight=0;g.mnfight=0;g.typer=4;g.battletyper=4;g.fc=0;g.fe=0;g.bmenuno=0;g.charturn=0;
  for(let i=50;i<=53;i++)g.flag[i]=0;
  for(const key of ['acting','faceaction','temptension'])g[key]??=[0,0,0];
 }
}

/** Native obj_defeatanim used by scr_defeatrun, including Draw-time deletion and running echoes. */
export const cloverDefeat={name:'obj_defeatanim',index:300,events:{
 create:(s:GmInstance,rt:GmRuntime)=>{Object.assign(s,{t:0,g:0,imageSpeed:0,starcount:0,redup:0,bsize:6});rt.sound?.('snd_defeatrun');},
 step:(s:GmInstance)=>{s.g++;if(s.g>=15)s.t++;},
 draw:(s:GmInstance,rt:GmRuntime)=>{
  if(s.t===0)rt.drawSelf(s);s.sweat=s.g<=5||(s.g>=9&&s.g<=13)?1:0;
  if(s.sweat===1)rt.drawSprite('spr_defeatsweat',0,s.x-6,s.y-6);
  if(s.t>=1){for(let i=0;i<=80;i++){s.i=i;s.alph=.4;rt.drawSprite(s.sprite,s.imageIndex,s.x+4*i,s.y,s.imageXscale,s.imageYscale,0,s.imageBlend,s.alph-s.t/8+i/200);}if(s.t>=15)rt.destroy(s);}
 },
}};

export const cloverHostIntegration={
 calls:['Construct after shared rt/party/control initialisation; use body as enemy instance and initialText for intro','syncEnemyStats(hp,at,df) keeps shared equipment/damage stats in native globals; receiveHit(hp,amount) owns Clover recoil/defeat after shared damage effects','choices/reserveAct(value): reserve source participant slots (Kris + Ralsei for joint topics)','beginAct(value): start source ACT; onDialogue drives message/speech UI; confirm/completeDialogue releases writers','onActionComplete: continue shared action/timing/magic/item phases; respect global.myfight routing','beginEnemyTurn(): replace generic beginTransition/startEnemyAttack; source Step creates heart, box and controller','afterStep(): call after every unpaused rt.step(); onPhase mirrors speech/transition/attack/return','returnToCommands(): after shared return/arena cleanup/healing; preserve acted/argue/mercy and reset transient enemy flags'],
 sharedGlobals:['char','hp','maxhp','charinstance','charcantarget','charmove','chardead','charauto','charaction','charspecial','targeted','acting','faceaction','tension','maxtension','inv','invc','flag','turntimer','battledf'],
 unverified:['Native writer glyph reveal, Alarm/Draw timing, text audio and speech-bubble pixels are delegated to UI callbacks','Full command/FIGHT/item/spare/Pacify and victory/revival choreography needs shared-host integration tests','No Clover/Hathy pair support; constructor enforces standalone encounter 8','Defeat and fog flash visuals are source-derived but require visual parity capture'],
} as const;
