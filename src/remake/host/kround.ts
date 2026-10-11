// Connects K.Round (encounters 12 and 27) to the shared battle host. The enemy's own ported Step owns the turn:
// milk, bows, Susie's idea, the Ralsei throw and the crown-loss transform; this adapter supplies what the game's
// battle controller and writer objects would: monster setup, dialogue pages with faces, attack-phase hand-off.
import type {GmInstance,GmRuntime} from '../gm/runtime';
import {monsterParent,spareAnim} from '../deltarune/battle';
import {checkersEnemy,checkerTransform,type KRoundHost,type KRoundThrowHost,type KRoundThrowMessage} from '../bosses/kround';
import {checkersHealAnim,flashCheckers} from '../bosses/kround/effects';
import {sourceText} from './text';
import {actChoices,parsePage,type SourceActChoice,type SourceDialogue,type SourceEnemyEvents,type SourceEnemyHost,type SourceEnemyPhase} from './enemy-host';

const ROOMS={'ch1-12':'room_field_checkersboss','ch1-27':'room_cc_6f'} as const;
const SETUP={'ch1-12':{type:10,message:'scr_encountersetup_slash_scr_encountersetup_gml_172_0'},'ch1-27':{type:21,message:'scr_encountersetup_slash_scr_encountersetup_gml_397_0'}} as const;
const THROW_TEXT:Record<Exclude<KRoundThrowMessage,'power-instructions'>,string>={
 'crown-hit':'obj_ralseithrown_slash_Collision_154b9139_8c0d_44d5_b8de_0f03c1a8096c_gml_6_0',
 'body-hit':'obj_ralseithrown_slash_Collision_154b9139_8c0d_44d5_b8de_0f03c1a8096c_gml_29_0',
 'miss':'obj_ralseithrown_slash_Step_0_gml_23_0',
};
/** scr_get_input_name(6) on a keyboard: the C (menu) key. */
const INPUT_NAME='C';

export class KRoundBattleHost implements SourceEnemyHost{
 readonly body:GmInstance;phase:SourceEnemyPhase='idle';
 private writers:SourceDialogue[]=[];private writerId=1;
 constructor(readonly rt:GmRuntime,readonly control:GmInstance,readonly id:'ch1-12'|'ch1-27',readonly events:SourceEnemyEvents={}){
  this.installGlobals();
  const callbacks:KRoundHost={
   lang:sourceText,writerExists:()=>this.writers.length>0,clearWriters:()=>this.clearWriters(),
   battleText:useDefault=>{if(useDefault){rt.globals.fc=0;rt.globals.typer=4;}this.openBattleWriter();},
   face:(slot,hero,emotion)=>{rt.globals.msg[slot]=sourceText(hero==='ralsei'?'scr_ralface_slash_scr_ralface_gml_1_0':'scr_susface_slash_scr_susface_gml_1_0').replace('~1',String(emotion));},
   inputName:()=>INPUT_NAME,attackPhase:()=>this.completeAction(),
   flash:actor=>{flashCheckers(actor,rt);},
   healAnimation:checkersHealAnim,checkerTransform,
   monsterSetup:s=>this.setupMonster(s),roomName:()=>ROOMS[this.id],
  };
  const throwHost:KRoundThrowHost={
   text:message=>{
    this.clearWriters();
    rt.globals.msg[0]=message==='power-instructions'?sourceText('obj_throwralsei_slash_Step_0_gml_26_0')+INPUT_NAME+sourceText('obj_throwralsei_slash_Step_0_gml_26_1'):sourceText(THROW_TEXT[message]);
    rt.globals.fc=0;rt.globals.typer=4;this.openBattleWriter();
   },
   clearWriters:()=>this.clearWriters(),
  };
  rt.globals.kroundHost=callbacks;rt.globals.kroundThrowHost=throwHost;
  this.body=rt.create(checkersEnemy,rt.view.x+480,rt.view.y+120);this.body.myself=0;rt.globals.monsterinstance[0]=this.body.id;
  rt.userEvent(this.body,12);
 }
 get dialogue():readonly SourceDialogue[]{return this.writers;}
 get hp(){return this.rt.globals.monsterhp[0] as number;}
 get mercy(){return this.rt.globals.mercymod[0] as number;}
 get tired(){return this.rt.globals.monsterstatus[0]===1;}
 get sparePoints(){return this.rt.globals.sparepoint[0] as number;}
 get message(){return parsePage(this.rt.globals.battlemsg[0]).text;}
 get initialText(){return parsePage(sourceText(SETUP[this.id].message)).text;}
 get choices():readonly SourceActChoice[]{return actChoices(this.rt.globals,0);}
 syncEnemyStats(hp:number,at:number,df:number){const g=this.rt.globals;g.monsterhp[0]=hp;g.monsterat[0]=at;g.monsterdf[0]=df;}
 receiveHit(hp:number,amount:number){
  if(!this.body.live)return;const g=this.rt.globals;g.monsterhp[0]=hp;
  if(amount>0){this.body.shakex=9;this.body.state=3;this.body.hurttimer=30;this.body.hurtamt=amount;}else this.body.hurtamt=0;
  if(hp<=0&&g.monster[0]===1){this.monsterDefeat();this.events.onDefeat?.(this.body);}
 }
 spare(outcome:2|3){
  if(!this.body.live||this.rt.globals.monster[0]!==1)return;
  const g=this.rt.globals,s=this.body;g.flag[51]=outcome;
  // The inherited enemy event 10: scr_spareanim, scr_monsterdefeat, instance_destroy.
  const a=this.rt.create(spareAnim,s.x,s.y);a.sprite=s.sparedsprite??s.sprite;a.imageIndex=0;a.imageXscale=s.imageXscale;a.imageYscale=s.imageYscale;
  this.monsterDefeat();this.rt.destroy(s);this.control.timeron=0;
 }
 addMercy(amount:number){const g=this.rt.globals;g.mercymod[0]=Math.max(0,g.mercymod[0]+amount);}
 beginAct(value:number){
  if(this.writers.length)throw Error('K.Round dialogue is still active');
  const choice=this.choices[value];if(!choice||choice.disabled)throw Error('K.Round ACT is unavailable');
  const g=this.rt.globals;this.body.acting=value+1;
  for(const slot of choice.participants){g.acting[slot]=1;g.faceaction[slot]=6;g.charaction[slot]=9;}
  this.body.actcon=0;g.myfight=3;g.mnfight=0;
 }
 confirm(){
  const battle=this.writers.find(w=>w.kind==='battle');if(!battle)return;
  if(battle.page+1<battle.pages.length){battle.page++;this.publish();}else{this.writers=this.writers.filter(w=>w!==battle);this.publish();}
 }
 beginEnemyTurn(){
  if(!this.body.live||this.rt.globals.monster[0]===0)throw Error('K.Round has already left the battle');
  this.clearWriters();const g=this.rt.globals;g.targeted=[0,0,0];g.charturn=3;g.mnfight=1;g.myfight=-1;
  this.control.timeron=1;this.control.reset=0;this.control.noreturn=0;this.setPhase('transition');
 }
 afterStep(){
  const g=this.rt.globals;
  if(g.mnfight===2&&this.control.reset===1)this.setPhase('return');
  else if(g.mnfight===2)this.setPhase(this.body.attacked===1?'attack':'transition');
 }
 returnToCommands(){
  this.clearWriters();const g=this.rt.globals;g.mnfight=0;g.myfight=0;g.bmenuno=0;g.charturn=0;this.control.timeron=0;
  for(const m of this.rt.all(monsterParent)){m.attacked=0;m.talked=0;m.acting=0;}
  for(let i=0;i<3;i++){g.acting[i]=0;g.temptension[i]=g.tension;g.charspecial[i]=0;g.targeted[i]=0;g.charaction[i]=0;g.faceaction[i]=0;}
  this.setPhase('idle');
 }
 private setPhase(phase:SourceEnemyPhase){if(this.phase!==phase){this.phase=phase;this.events.onPhase?.(phase);}}
 private publish(){this.events.onDialogue?.(this.writers.map(w=>({...w,pages:[...w.pages],rawPages:[...w.rawPages],faces:[...(w.faces??[])]})));}
 private clearWriters(){if(this.writers.length){this.writers=[];this.publish();}}
 /** scr_battletext: the writer reads global.msg from page 0; "/" waits for a key, "%" runs on, "/%" closes. */
 private openBattleWriter(){
  const g=this.rt.globals,raw:string[]=[];
  for(let i=0;i<100;i++){
   const m=g.msg[i];if(typeof m!=='string'||!m.trim())break;raw.push(m);
   const end=m.trimEnd();if(end.endsWith('/%'))break;if(!end.endsWith('/')&&!end.endsWith('%'))break;
  }
  const pages:string[]=[],faces:SourceDialogue['faces']=[];let face:NonNullable<SourceDialogue['faces']>[number]=null;
  for(const r of raw){const p=parsePage(r);if(p.face!==undefined)face=p.face;if(p.text){pages.push(p.text);faces.push(face);}}
  this.writers=[{id:this.writerId++,kind:'battle',rawPages:raw,pages:pages.length?pages:[''],faces,page:0,x:this.rt.view.x+30,y:this.rt.view.y+376,face:0,typer:g.typer,fc:g.fc,fe:g.fe}];
  this.publish();
 }
 private completeAction(){
  const g=this.rt.globals;
  if(g.monster[0]===0){this.control.techwon=1;this.events.onDefeat?.(this.body);return;}
  this.control.techwon=0;this.control.fightphase=g.charaction.some((a:number)=>a===4||a===2)?0:1;
  if(g.myfight===4)this.control.fightphase=1;
  g.charturn=3;g.myfight=this.control.fightphase===1?1:4;this.events.onActionComplete?.();
 }
 /** scr_monsterdefeat: rewards and outcome flags once, then the enemy's event 11. */
 private monsterDefeat(){
  const g=this.rt.globals;if(g.monster[0]!==1)return;
  g.monstergold[3]+=g.monstergold[0];g.monsterexp[3]+=g.monsterexp[0];g.monster[0]=0;
  if(g.flag[51]===0)g.flag[51]=g.monsterhp[0]<=0?1:2;
  const counters:Record<number,number>={1:40,2:41,3:42,5:43};if(counters[g.flag[51]]!==undefined)g.flag[counters[g.flag[51]]]++;
  if(g.flag[51]===3)g.flag[50]=3;if(g.flag[51]===2)g.flag[50]=2;if(g.flag[51]===1)g.flag[50]=1;
  this.rt.userEvent(this.body,11);
 }
 /** scr_monstersetup for monster types 10 (first fight) and 21 (rematch). */
 private setupMonster(s:GmInstance){
  const g=this.rt.globals,i=s.myself,line=(n:number)=>sourceText(`scr_monstersetup_slash_scr_monstersetup_gml_${n}_0`);
  if(g.monstertype[i]===10){
   g.monstername[i]=line(282);g.monstermaxhp[i]=1300;g.monsterhp[i]=1300;g.monsterat[i]=7.5;g.monsterdf[i]=3;g.monsterexp[i]=0;g.monstergold[i]=100;
   g.sparepoint[i]=0;g.mercymod[i]=0;g.mercymax[i]=100;
   g.canact[i][0]=1;g.actname[i][0]=line(294);g.canact[i][1]=1;g.actname[i][1]=line(296);g.canact[i][2]=1;g.actname[i][2]=line(298);g.actactor[i][2]=3;
   if(g.char.includes(2)){g.canact[i][3]=1;g.actname[i][3]=line(307);g.actactor[i][3]=3;}
  }
  if(g.monstertype[i]===21){
   g.monstername[i]=line(594);g.monstermaxhp[i]=1300;g.monsterhp[i]=1300;g.monsterat[i]=8;g.monsterdf[i]=3;g.monsterexp[i]=0;g.monstergold[i]=100;
   g.sparepoint[i]=0;g.mercymod[i]=0;g.mercymax[i]=100;
   g.canact[i][0]=1;g.actname[i][0]=line(g.flag[246]===1?607:606);g.canact[i][1]=1;g.actname[i][1]=line(609);g.canact[i][2]=1;g.actname[i][2]=line(611);g.actactor[i][2]=4;
  }
 }
 private installGlobals(){
  const g=this.rt.globals,setup=SETUP[this.id];
  // scr_encountersetup and battlecontroller Create initialise every monster and ACT slot before event 12.
  g.encounterno=this.id==='ch1-12'?12:27;g.monstertype=[setup.type,0,0];g.monstermakex=[this.rt.view.x+480,0,0];g.monstermakey=[this.rt.view.y+120,0,0];g.monster=[1,0,0];
  for(const key of ['monsterx','monstery','monsterat','monsterdf','monsterhp','monstermaxhp','monstergold','monsterexp','sparepoint','hittarget','mercymod','mercymax','monsterstatus','monsterinstance'])g[key]=[0,0,0];
  g.monstergold.push(0);g.monsterexp.push(0);g.monstername=[' ',' ',' '];g.monstercomment=[' ',' ',' '];
  for(const key of ['act','canact','acttype','actspell','actcost'])g[key]=Array.from({length:3},()=>new Array(6).fill(0));
  for(const key of ['actname','actdesc'])g[key]=Array.from({length:3},()=>new Array(6).fill(' '));g.actactor=Array.from({length:3},()=>new Array(6).fill(1));
  g.msg=new Array(100).fill(' ');g.battlemsg=new Array(100).fill(' ');g.battlemsg[0]=sourceText(setup.message);
  g.myfight=0;g.mnfight=0;g.typer=4;g.battletyper=4;g.fc=0;g.fe=0;g.bmenuno=0;g.charturn=0;
  for(let i=50;i<=53;i++)g.flag[i]=0;
  for(const key of ['acting','faceaction','temptension'])g[key]??=[0,0,0];
 }
}
