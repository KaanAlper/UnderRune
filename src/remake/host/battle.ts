// Shared browser battle host. Bullet objects retain their GML event order in GmRuntime.
// Command selection is host UI; numerical rules below follow Chapter 1 battle scripts.
import {GmRuntime,type GmInstance} from '../gm/runtime';
import type {SpriteBank} from '../gm/sprites';
import {round} from '../gm/math';
import {validateLoadout,type EquipmentSource,type Loadout} from '../../game/loadout';
import * as b from '../deltarune/battle';
import {bulletController} from '../bosses/jevil/controller';
import {jokerBody} from '../bosses/jevil/body';
import {lancerBoss,lancerBike} from '../bosses/lancer/bike';
import {JEVIL_PATTERNS} from './practice';
import {optionalSourceText} from './text';
import {battleHero,heroSprites,heroSize} from './heroes';
import {burstBolt,basicAttack} from '../deltarune/player-effects';
import {C} from '../gm/graphics';
import {sourceEncounter,developmentEncounter} from './encounters';
import {CloverHost,type CloverDialogue} from './clover';
const text=optionalSourceText;
export const plain=(s:string)=>s.replace(/\^\d/g,'').replace(/\/[%%]?|%%/g,'').replace(/[&#]/g,'\n').replace(/\\[A-Za-z]\d/g,'').trim();
const jtext=(line:number)=>plain(text('obj_joker_slash_Step_0_gml_'+line+'_0'));
const ltext=(line:number)=>plain(text('obj_lancerboss_slash_Step_0_gml_'+line+'_0'));
export type BattlePhase='intro'|'command'|'enemyTarget'|'act'|'magic'|'item'|'allyTarget'|'message'|'timing'|'enemyTalk'|'transition'|'enemy'|'return'|'victory'|'defeat';
export type Choice={name:string;detail?:string;cost?:number;disabled?:boolean;value?:number};
type Action={kind:'fight'|'act'|'magic'|'item'|'spare'|'defend'|'assist';value?:number;target?:number;bagIndex?:number};
export type Bolt={actor:number;frame:number;alive:boolean;points:number};
export class SourceBattle{
 readonly rt:GmRuntime;readonly party:number[];readonly name:string;readonly heroes:GmInstance[];readonly control:GmInstance;readonly body:GmInstance;
 phase:BattlePhase='intro';actor=0;cursor=0;turn=0;paused=false;outcome:'victory'|'defeat'|null=null;frame=0;phaseFrame=0;
 enemyHp:number;readonly enemyMaxHp:number;enemyAt:number;enemyDf:number;mercy=0;tired=false;
 bag:number[];actions:(Action|null)[];bolts:Bolt[]=[];boltTick=0;message='';enemySpeech='';pattern=0;
 jturn=0;hypnosiscounter=0;chaosdance=0;pfactor=1;pirouette=-1;compliment=0;warned=false;
 pressBuffer=[0,0,0];timingFade=0;private autoStruck=false;private enemyHits=0;
 private pending:Action|null=null;private pages:string[]=[];private afterMessage:()=>void=()=>{};private endTiming=0;private commandSnapshots:{tp:number;actions:(Action|null)[]}[]=[];
 private clover?:CloverHost;
 constructor(bank:SpriteBank,readonly equipment:EquipmentSource,readonly loadout:Loadout,readonly id:string,seed=11,options:{development?:boolean}={}){
  const encounter=options.development?developmentEncounter(id):sourceEncounter(id);if(!encounter)throw Error('This battle is not available yet.');validateLoadout(loadout,equipment);
  this.rt=new GmRuntime(bank,{seed});this.party=[...encounter.party];this.name=encounter.name;
  this.enemyHp=this.enemyMaxHp=encounter.hp;this.enemyAt=encounter.attack;this.enemyDf=encounter.defense;
  this.bag=[...loadout.items];this.actions=this.party.map(()=>null);
  const stats=(key:'attack'|'defense'|'magic',base:number[])=>[...this.party,...[1,2,3].filter(id=>!this.party.includes(id))].map(id=>{const s=loadout.characters[id];return base[id]+equipment.weapons.find(g=>g.id===s.weapon)![key]+s.armor.reduce((n,id)=>n+equipment.armors.find(g=>g.id===id)![key],0);});
  this.rt.globals={hp:[0,90,110,70],maxhp:[0,90,110,70],char:[...this.party,...(this.party.length===2?[0]:[])],battleat:stats('attack',[0,10,14,8]),battledf:stats('defense',[0,2,2,2]),battlemag:stats('magic',[0,0,1,7]),charaction:[0,0,0],charcantarget:[1,1,this.party.length===3?1:0],chardead:[0,0,0],charmove:[1,1,this.party.length===3?1:0],charspecial:[0,0,0],targeted:[0,0,0],tension:0,maxtension:250,inv:-1,invc:1,flag:new Array(1000).fill(0),monster:[1,0,0],mnfight:0,turntimer:0,chemg_god_mode:false};
  this.heroes=this.party.map((id,i)=>{const def=battleHero([b.heroKris,b.heroSusie,b.heroRalsei][id-1],()=>this.applyFightHit(i));const h=this.rt.create(def,this.party.length===2?80:80+i*10,this.party.length===2?[100,180][i]:[100,150,210][i]);Object.assign(h,{char:id,myself:i,sprite:heroSprites[id-1][0],imageXscale:2,imageYscale:2,imageSpeed:0,depth:200-i*20,mywidth:heroSize[id-1][0],myheight:heroSize[id-1][1],pose:'idle',faceaction:0,siner:0,attacktimer:0,defendtimer:0,hurt:0,hurttimer:0,points:0});return h;});
  this.rt.globals.charinstance=[...this.heroes.map(h=>h.id),...(this.party.length===2?[0]:[])];const ev=this.rt.create(b.eventManager,0,0);ev.visible=false;
  this.control=this.rt.create(b.battleController,0,0);Object.assign(this.control,{timeron:0,reset:0,noreturn:0,onebuffer:0,twobuffer:0,lbuffer:0,rbuffer:0,grazenoise:0,damagenoise:0});this.control.visible=false;
  if(id==='ch1-8'){
   // Encounter 8 starts like ordinary battles: obj_battleback before the battle objects.
   this.rt.create(b.battleBack,0,0);
   this.clover=new CloverHost(this.rt,this.control,{
    onDialogue:writers=>{const writer=writers.find(w=>w.kind==='battle');if(writer)this.message=writer.pages[writer.page];else this.enemySpeech=writers.map(w=>w.pages[w.page]).join('\n');},
    onActionComplete:()=>{this.mercy=this.clover!.mercy;this.tired=this.clover!.tired;this.resolveRemainingActions();},
    onPhase:phase=>{if(phase==='speech')this.setPhase('enemyTalk');if(phase==='transition')this.setPhase('transition');if(phase==='attack')this.setPhase('enemy');},
    onDefeat:()=>this.victory(),
   });this.body=this.clover.body;this.message=this.clover.initialText;
  }else{this.body=this.rt.create(id==='ch1-25'?jokerBody:lancerBoss,id==='ch1-25'?500:540,id==='ch1-25'?160:200);this.body.depth=15;this.message=id==='ch1-25'?jtext(158):plain(text('scr_monstersetup_slash_scr_monstersetup_gml_51_0'));}
 }
 get tp(){return Math.round(this.rt.globals.tension/this.rt.globals.maxtension*100);}
 get autoSusie(){return this.id==='ch1-2';}
 get sourceDialogue():readonly CloverDialogue[]{return this.clover?.dialogue??[];}
 get choices():Choice[]{
  if(this.phase==='command')return [{name:'FIGHT'},{name:this.party[this.actor]===1?'ACT':'MAGIC'},{name:'ITEM',disabled:this.usableItems().length===0},{name:'SPARE'},{name:'DEFEND'}];
  if(this.phase==='enemyTarget')return [{name:this.name,detail:`HP ${Math.max(0,this.enemyHp)} / ${this.enemyMaxHp}${this.tired?' · TIRED':''}`}];
  if(this.phase==='act')return this.clover?this.clover.choices.map(c=>({...c,detail:c.participants.length>1?'Kris + Ralsei':undefined})):this.id==='ch1-25'?[{name:'Check',value:0},{name:'Pirouette',value:1,cost:50,detail:'Random chaos',disabled:this.rt.globals.tension<50},{name:'Hypnosis',value:2,cost:125,detail:'Induce TIRED · whole party',disabled:this.rt.globals.tension<125||this.party.some(id=>this.rt.globals.hp[id]<=0)}]:[{name:'Check',value:0},{name:'Warning',value:1},{name:'Compliment',value:2}];
  if(this.phase==='magic')return this.party[this.actor]===2?[{name:'Rude Buster',value:4,cost:this.loadout.characters[2].weapon===7?100:125,disabled:this.rt.globals.tension<(this.loadout.characters[2].weapon===7?100:125),detail:'Deals rude damage'}]:[{name:'Pacify',value:3,cost:40,disabled:this.rt.globals.tension<40,detail:'Spare a tired enemy'},{name:'Heal Prayer',value:2,cost:80,disabled:this.rt.globals.tension<80,detail:'Heal one ally'}];
  if(this.phase==='item')return this.usableItems().map(i=>({name:this.equipment.items.find(x=>x.id===this.bag[i])!.name,value:i,detail:this.equipment.items.find(x=>x.id===this.bag[i])!.description}));
  if(this.phase==='allyTarget')return this.party.map((id,i)=>({name:['','Kris','Susie','Ralsei'][id],value:i,detail:`HP ${this.rt.globals.hp[id]} / ${this.rt.globals.maxhp[id]}`}));
  return [];
 }
 private usableItems(){return this.bag.map((_,i)=>i).filter(i=>!this.actions.some(a=>a?.kind==='item'&&a.bagIndex===i)&&this.equipment.items.some(x=>x.id===this.bag[i]&&x.usable));}
 private setPhase(p:BattlePhase){this.phase=p;this.phaseFrame=0;this.cursor=0;}
 private beginCommands(){
  this.clover?.returnToCommands();if(this.clover)this.message=this.clover.message;
  this.rt.globals.mnfight=0;this.control.timeron=0;this.control.reset=0;this.actions=this.party.map(()=>null);this.commandSnapshots=[];
  if(this.autoSusie&&this.rt.globals.hp[2]>0)this.actions[1]={kind:'fight'};
  this.actor=this.party.findIndex((id,i)=>this.rt.globals.hp[id]>0&&!this.actions[i]);if(this.actor<0){this.resolveTurn();return;}
  for(let i=0;i<this.heroes.length;i++){const h=this.heroes[i];h.visible=true;h.imageAlpha=1;h.pose='idle';h.faceaction=0;h.attacktimer=0;h.sprite=heroSprites[this.party[i]-1][this.rt.globals.hp[this.party[i]]<=0?5:0];h.imageIndex=0;}
  this.body.condition=0;this.body.visible=true;this.setPhase('command');
 }
 select(index:number){
  if(this.paused||this.outcome)return;const choice=this.choices[index];if(!choice||choice.disabled)return;this.cursor=index;
  if(this.phase==='command'){
   if(index===4){this.commit({kind:'defend'});return;}
   if(index===2){this.setPhase('item');return;}
   if(index===1&&this.party[this.actor]!==1){this.setPhase('magic');return;}
   this.pending={kind:index===0?'fight':index===1?'act':'spare'};this.setPhase('enemyTarget');return;
  }
  if(this.phase==='enemyTarget'){if(this.pending?.kind==='act')this.setPhase('act');else if(this.pending)this.commit(this.pending);return;}
  if(this.phase==='act'){this.commit({kind:'act',value:choice.value});return;}
  if(this.phase==='magic'){this.pending={kind:'magic',value:choice.value};if(choice.value===2)this.setPhase('allyTarget');else this.commit(this.pending);return;}
  if(this.phase==='item'){this.pending={kind:'item',value:this.bag[choice.value!],bagIndex:choice.value};const item=this.equipment.items.find(i=>i.id===this.pending!.value)!;if(item.target===2)this.commit({...this.pending,target:0});else this.setPhase('allyTarget');return;}
  if(this.phase==='allyTarget'&&this.pending)this.commit({...this.pending,target:index});
 }
 confirm(){if(this.paused||this.outcome)return;if(this.choices.length){this.select(this.cursor);return;}if(this.clover&&(this.clover.dialogue.length||this.phase==='enemyTalk')){this.clover.confirm();return;}if(this.phase==='message'){if(this.pages.length)this.message=this.pages.shift()!;else this.afterMessage();}else if(this.phase==='enemyTalk'){this.beginTransition();}else if(this.phase==='timing')this.strike();}
 cancel(){
  if(this.paused||this.outcome)return;
  if(this.phase==='allyTarget'){this.setPhase(this.pending?.kind==='item'?'item':'magic');return;}
  if(this.phase==='act'){this.pending={kind:'act'};this.setPhase('enemyTarget');return;}
  if(['enemyTarget','magic','item'].includes(this.phase)){this.pending=null;this.setPhase('command');return;}
  if(this.phase==='command'&&this.commandSnapshots.length){const snapshot=this.commandSnapshots.pop()!;this.rt.globals.tension=snapshot.tp;this.actions=snapshot.actions;for(let i=0;i<this.heroes.length;i++){const kind=this.actions[i]?.kind;this.heroes[i].faceaction=kind==='fight'?1:kind==='defend'?4:kind==='item'?3:kind==='magic'?2:kind==='act'?6:0;}this.actor=this.actions.findIndex((a,i)=>!a&&this.rt.globals.hp[this.party[i]]>0);this.cursor=0;}
 }
 move(x:number,y:number){
  const n=this.choices.length;if(!n)return;
  if(this.phase==='command')this.cursor=(this.cursor+(x||y)+n)%n;
  else{const row=Math.floor(this.cursor/2),col=this.cursor%2,rows=Math.ceil(n/2);this.cursor=y?Math.min(n-1,((row+y+rows)%rows)*2+col):Math.min(n-1,row*2+(col+x+2)%2);}
  this.rt.sound?.('snd_menumove');
 }
 private commit(action:Action){
  const g=this.rt.globals;this.commandSnapshots.push({tp:g.tension,actions:structuredClone(this.actions)});
  const cost=action.kind==='act'&&this.id==='ch1-25'?action.value===1?50:action.value===2?125:0:action.kind==='magic'?action.value===2?80:action.value===3?40:this.loadout.characters[2].weapon===7?100:125:0;
  if(cost>g.tension)return;g.tension-=cost;if(action.kind==='defend')g.tension=Math.min(250,g.tension+40);
  this.actions[this.actor]=action;
  this.heroes[this.actor].faceaction=action.kind==='fight'?1:action.kind==='defend'?4:action.kind==='item'?3:action.kind==='magic'?2:action.kind==='act'?6:0;
  if(action.kind==='act'&&action.value===2&&this.id==='ch1-25')for(let i=1;i<this.party.length;i++)this.actions[i]={kind:'assist'};
  if(action.kind==='act'&&this.clover)for(const slot of this.clover.choices[action.value!].participants)if(slot!==this.actor){this.actions[slot]={kind:'assist'};this.heroes[slot].faceaction=6;}
  const next=this.party.findIndex((id,i)=>i>this.actor&&g.hp[id]>0&&!this.actions[i]);this.pending=null;
  if(next<0)this.resolveTurn();else{this.actor=next;this.setPhase('command');}
 }
 private say(pages:string[],next:()=>void){this.pages=pages.filter(Boolean);this.afterMessage=next;if(this.pages.length){this.message=this.pages.shift()!;this.setPhase('message');}else next();}
 private resolveTurn(){
  const g=this.rt.globals,pages:string[]=[];
  g.charaction=[0,0,0];for(let i=0;i<this.party.length;i++)if(this.actions[i]?.kind==='defend')g.charaction[i]=10;
  if(this.clover){const act=this.actions.find(a=>a?.kind==='act');if(act){this.setPhase('message');this.message='';this.clover.beginAct(act.value!);return;}this.resolveRemainingActions();return;}
  for(let i=0;i<this.party.length;i++){const a=this.actions[i];if(a?.kind==='act')pages.push(...this.act(a.value!));}
  this.resolveRemainingActions(pages);
 }
 private resolveRemainingActions(pages:string[]=[]){
  const g=this.rt.globals;
  for(let i=0;i<this.party.length;i++){
   const a=this.actions[i];if(!a)continue;
   if(a.kind==='item'){this.useItem(a.value!,a.target??0);pages.push(`* ${['','Kris','Susie','Ralsei'][this.party[i]]} used the ${this.equipment.items.find(x=>x.id===a.value)!.name}.`);}
   if(a.kind==='magic'){
    if(a.value===2){this.heal(a.target!,g.battlemag[i]*5);pages.push('* Ralsei cast HEAL PRAYER!');}
    if(a.value===3){if(this.tired){this.clover?.spare(3);this.victory();return;}pages.push('* But the enemy was not TIRED...');}
    if(a.value===4){this.hitEnemy(Math.max(0,Math.ceil(g.battlemag[i]*5+g.battleat[i]*11-this.enemyDf*3)),i);pages.push('* Susie cast RUDE BUSTER!');}
   }
   if(a.kind==='spare'){
    if(this.mercy>=(this.id==='ch1-25'?999:100)){this.clover?.spare(2);this.victory();return;}
    pages.push(`* But ${this.name} wasn't ready to be SPARED.`);
    // scr_mercyadd with the enemy's spare points (Clover and Lancer: 10).
    if(this.clover){this.clover.addMercy(g.sparepoint[0]);this.mercy=this.clover.mercy;}else if(this.id==='ch1-2')this.mercy+=10;
   }
  }
  for(const a of this.actions.filter(a=>a?.kind==='item').sort((a,b)=>b!.bagIndex!-a!.bagIndex!))this.bag.splice(a!.bagIndex!,1);
  if(this.outcome||this.phase==='victory')return;this.say(pages,()=>this.beginTiming());
 }
 private beginTiming(){
  const fighters=this.actions.map((a,i)=>a?.kind==='fight'&&!(this.autoSusie&&i===1)?i:-1).filter(i=>i>=0);
  this.bolts=[];this.boltTick=0;this.endTiming=0;this.timingFade=0;this.autoStruck=false;this.enemyHits=0;this.pressBuffer=[0,0,0];let offset=0,last=-1;const order=[...fighters];
  // Create consumes this unused legacy ordering before generating the one-button bolts.
  let legacy=this.rt.random.choose(0,1,2);if(!fighters.includes(1)&&!fighters.includes(2))legacy=0;
  this.rt.random.choose(...([0,1,2].filter(i=>i!==legacy)));if(fighters.includes(1)&&!fighters.includes(2))this.rt.random.choose(0,1);
  // attackpress's selection order and gaps, including the initial -1 frame offset.
  const used=new Set<number>();for(let i=0;i<fighters.length;i++){let actor=this.rt.random.choose(0,1,2);while(!fighters.includes(actor)||used.has(actor))actor=this.rt.random.choose(0,1,2);order[i]=actor;used.add(actor);}
  for(let i=0;i<order.length;i++){offset+=last;this.bolts.push({actor:order[i],frame:30+offset,alive:true,points:0});last=i<order.length-1&&last!==0&&order[i]!==order[i+1]?this.rt.random.choose(0,12,18):this.rt.random.choose(12,18);}
  if(!this.bolts.length&&!this.autoSusie){this.beginEnemy();return;}
  for(const i of fighters){this.heroes[i].faceaction=1;this.heroes[i].imageIndex=0;}
  this.setPhase('timing');
 }
 private strike(){
  // scr_boltcheck_onebutton: nearest qualifying bolt plus one tied bolt.
  this.pressBuffer=[5,5,5];
  const candidates=this.bolts.filter(b=>b.alive&&b.frame-this.boltTick<15&&b.frame-this.boltTick>-5).sort((a,b)=>a.frame-b.frame);if(!candidates.length)return;
  const first=candidates[0],gap=first.frame-this.boltTick,p=Math.abs(gap),points=p===0?150:p===1?120:p===2?110:100-p*2;
  for(const bolt of candidates.filter(b=>b.frame===first.frame).slice(0,2)){bolt.alive=false;bolt.points=points;const burst=this.rt.create(burstBolt,82+gap*8,365+38*bolt.actor);if(p===0){burst.imageBlend=C.yellow;burst.mag=.2;}else if(p>=3)burst.imageBlend=b.mergeColor([C.aqua,0xff00ff,C.lime][bolt.actor],C.white,.5);this.startSwing(bolt.actor,points);}
 }
 private startSwing(actor:number,points:number){
  const h=this.heroes[actor];h.pose='attack';h.points=points;h.attacktimer=0;h.alarm[1]=10;
  this.rt.sound?.('snd_laz_c',h.char===2?.9:h.char===3?1.15:1,true);
  if(points===150){this.rt.sound?.('snd_criticalswing',1,true);for(let i=0;i<3;i++){const a=this.rt.create(b.afterimage,h.x+h.mywidth+this.rt.random.random(50),h.y+30+this.rt.random.random(30));Object.assign(a,{sprite:'spr_lightfairy',imageSpeed:.25,depth:-20,imageXscale:2,imageYscale:2,hspeed:2+this.rt.random.random(4),friction:-.25});}}
 }
 private applyFightHit(actor:number){
  if(this.outcome||this.enemyHp<=0)return;const points=this.heroes[actor].points,amount=Math.max(0,round(this.rt.globals.battleat[actor]*points/20-this.enemyDf*3));this.heroes[actor].faceaction=0;this.hitEnemy(amount,actor,points,true);
 }
 private hitEnemy(amount:number,actor:number,points=0,fight=false){
  this.enemyHp=Math.max(0,this.enemyHp-amount);const g=this.rt.globals;if(amount>0)g.tension=Math.min(250,g.tension+round(points/(this.id==='ch1-25'?15:10)));
  const x=this.body.x+(this.id==='ch1-25'?20:0),y=this.body.y+(this.id==='ch1-25'?20:0);
  const w=this.rt.create(b.dmgWriter,x,y+20-this.enemyHits++*20);w.damage=amount;w.type=this.party[actor]-1;w.delay=fight&&amount>0?8:2;
  if(fight&&amount>0){const a=this.rt.create(basicAttack,x+this.rt.random.random(6),y+this.rt.random.random(6));if(this.party[actor]===2){a.sprite='spr_attack_mash2';a.imageSpeed=.5;a.maxindex=4;this.rt.sound?.('snd_impact');this.rt.create(b.shake,0,0);}if(this.party[actor]===3){a.sprite='spr_attack_slap1';a.imageSpeed=.5;a.maxindex=4;}if(points===150){a.imageXscale=2.5;a.imageYscale=2.5;}}
  if(this.id==='ch1-25'&&amount>0){this.body.condition=1;this.body.siner=0;this.body.maxdist=Math.max(30,this.body.maxdist+20+amount/5);this.body.floatsinerspeed=1+(1-this.enemyHp/this.enemyMaxHp);const laugh=this.rt.random.choose('snd_joker_laugh0','snd_joker_ha1','snd_joker_ha0');this.rt.sound?.(laugh);}
  if(this.id==='ch1-2'){if(amount>0){this.body.state=3;this.body.shakex=9;this.body.hurttimer=30;}else if(this.body.hurttimer<=15){this.body.state=4;this.body.dodgetimer=0;}}
  if(this.clover){this.clover.receiveHit(this.enemyHp,amount);this.tired=this.clover.tired;}
  if(!fight&&amount>0)this.rt.sound?.('snd_damage');if(this.enemyHp<=0&&!this.clover)this.victory();
 }
 private heal(target:number,amount:number){
  const g=this.rt.globals,id=this.party[target],wasDown=g.hp[id]<=0;if(g.hp[id]<=g.maxhp[id])g.hp[id]=Math.min(g.maxhp[id],g.hp[id]+amount);
  if(wasDown&&g.hp[id]>=0){g.hp[id]=Math.max(g.hp[id],Math.ceil(g.maxhp[id]/6));g.chardead[target]=0;g.charcantarget[target]=1;g.charmove[target]=1;}
  this.rt.sound?.('snd_power');
 }
 private useItem(id:number,target:number){
  // scr_spell cases 201..215 (battle), which differ from overworld scr_itemuse.
  const g=this.rt.globals;
  if([6,7,11].includes(id)){for(let i=0;i<this.party.length;i++)this.heal(i,id===6?160:id===7?80:30);return;}
  const amount=id===1?40:id===2?g.hp[this.party[target]]<=0?g.maxhp[this.party[target]]+Math.abs(g.hp[this.party[target]]):Math.ceil(g.maxhp[this.party[target]]/2):id===5?20:id===8?70:id===9?50:id===10?4:id===12?[0,10,90,60][this.party[target]]:id===13?[0,80,30,30][this.party[target]]:id===14?500:id===15?60:0;
  this.heal(target,amount);
 }
 private act(value:number):string[]{
  if(this.id==='ch1-2'){
   if(value===0)return [ltext(118),ltext(119)];
   if(value===1){const line=this.warned?135:130;this.warned=true;return [ltext(line)];}
   const n=this.compliment++;this.body.compliment=this.compliment;if(n>=3)return [ltext(145)];this.mercy+=20;if(n===0)this.enemyAt--;if(n===1)this.enemyAt++;return n===0?[ltext(164),ltext(165)]:n===1?[ltext(157),ltext(158)]:[ltext(150),ltext(151)];
  }
  if(value===0)return [jtext(237)];
  if(value===2){if(this.enemyAt>10)this.enemyAt-=.5;this.pfactor=.7;if(this.hypnosiscounter>=9)this.tired=true;const part=this.rt.random.choose(400,401,402);this.hypnosiscounter++;return [jtext(part)+'\n'+jtext(403)+'\n'+jtext(this.tired?406:404)];}
  const g=this.rt.globals,c=this.chaosdance;this.pirouette=c;
  if(c===0)this.rt.random.choose(0,1,2);
  if(c===1&&this.enemyDf>=-16)this.enemyDf-=4;
  if(c===2)g.invc=.4;if(c===3)this.pfactor=.7;
  if(c===5){const target=this.rt.random.choose(0,1,2);this.heal(target,Math.floor(this.rt.random.random(31)+25));}
  if(c===6){const a=this.rt.random.choose(2,3),z=a===2?3:2,h=[...g.hp],m=[...g.maxhp];g.maxhp[1]=m[a];g.maxhp[a]=m[z];g.maxhp[z]=m[1];g.hp[1]=h[a];g.hp[a]=h[z];g.hp[z]=h[1];for(let i=1;i<=3;i++)if(g.hp[i]<1){for(let j=1;j<=3;j++)g.hp[j]+=Math.floor(g.hp[i]/3);g.hp[i]=1;}for(let i=0;i<3;i++){g.hp[i+1]=Math.max(1,g.hp[i+1]);g.chardead[i]=0;g.charcantarget[i]=1;g.charmove[i]=1;}}
  if(c===7)this.pfactor=1.25;
  if(c===8){const amount=36+Math.floor(this.rt.random.random(15));for(let i=0;i<3;i++)this.heal(i,amount);}
  this.hypnosiscounter+=.5;if(this.hypnosiscounter>=9)this.tired=true;
  return [jtext(247),jtext([276,284,290,296,310,314,320,373,379][c])];
 }
 private beginEnemy(){
  if(this.outcome)return;const g=this.rt.globals;g.targeted=[0,0,0];
  for(const h of this.heroes){h.pose='idle';h.faceaction=this.actions[h.myself]?.kind==='defend'?4:0;}
  if(this.clover){this.clover.syncEnemyStats(this.enemyHp,this.enemyAt,this.enemyDf);this.clover.beginEnemyTurn();return;}
  if(this.id==='ch1-25'){
   if(this.pirouette!==2)g.invc=1;
   const ratio=this.enemyHp/this.enemyMaxHp,h=this.hypnosiscounter;
   if(this.jturn===4&&(ratio<=.8||(h>=2&&this.turn>=5-h))){this.jturn=5;this.body.dancelv=1;}
   if(this.jturn===9&&(ratio<=.6||(h>=4&&this.turn>=11-h)))this.jturn=10;
   if(this.jturn===14&&(ratio<=.4||(h>=6&&this.turn>=17-h))){this.jturn=15;this.body.dancelv=3;}
   if(ratio<=.15&&this.jturn<17){this.jturn=17;this.body.dancelv=2;}
   if(this.jturn>=18)this.body.dancelv=3;
   if(this.jturn>=19&&this.turn>=29-h){this.tired=true;this.body.dancelv=2;}
   const t=this.jturn,lines:Record<number,number>={0:35,1:36,2:37,3:38,5:39,6:40,7:41,8:42,10:43,11:44,12:45,13:46,15:47,16:48,17:49,18:50};
   this.enemySpeech=jtext(lines[t]??this.rt.random.choose(56,57,58,59));
   if(t>=19){if(this.enemyDf>-10)this.enemyDf-=3;if(this.enemyAt<11)this.enemyAt+=.5;this.pattern=this.rt.random.choose(0,4,7,8,10,11,12,13,13,13);}
   if(t>=15&&t<=18){this.pattern=t-3;this.jturn++;}
   if(t===14)this.pattern=this.rt.random.choose(8,9,10,11);
   if(t>=10&&t<=13){this.pattern=t-2;this.jturn++;}
   if(t===9)this.pattern=this.rt.random.choose(4,5,6,7);
   if(t>=5&&t<=8){this.pattern=t-1;this.jturn++;}
   if(t===4)this.pattern=this.rt.random.choose(0,1,2,3);
   if(t<=3){this.pattern=t;this.jturn++;}
  }else{this.enemySpeech=ltext(this.turn===0?17:this.turn===1?18:this.turn===2?19:20);this.pattern=this.turn%2;}
  this.setPhase('enemyTalk');
 }
 private beginTransition(){
  this.rt.create(b.growtangle,320,170).depth=5;const k=this.heroes[0];this.rt.create(b.moveHeart,k.x+10,k.y+40).depth=1;
  this.setPhase('transition');if(this.id==='ch1-2')this.startEnemyAttack();
 }
 private startEnemyAttack(){
  const rt=this.rt,g=rt.globals;g.mnfight=2;g.inv=-1;this.control.timeron=1;this.control.reset=0;this.control.noreturn=0;
  const alive=this.party.map((id,i)=>g.hp[id]>0?i:-1).filter(i=>i>=0),target=rt.random.choose(...alive);g.targeted[target]=1;
  if(this.id==='ch1-25'){
   const p=JEVIL_PATTERNS[this.pattern];this.body.condition=p.body;this.body.timer=0;this.body.size=2;
   const dc=rt.create(bulletController,500,160);Object.assign(dc,{joker:1,type:p.type,target:'all'in p?3:target,damage:this.enemyAt*this.pfactor*p.mult,grazepoints:p.graze,inv:'inv'in p?p.inv:60});g.turntimer='time'in p?p.time:240;
   this.pfactor=1;this.chaosdance=(this.chaosdance+1)%9;
  }else{this.body.visible=false;this.body.turns=this.turn+1;const bike=rt.create(lancerBike,this.body.x,this.body.y);Object.assign(bike,{racecon:this.pattern===0?1:0,lcon:this.pattern===1?1:0,target,damage:this.enemyAt*5});g.turntimer=999;}
  this.setPhase('enemy');
 }
 private finishEnemy(){
  const rt=this.rt;this.control.timeron=0;rt.globals.mnfight=0;
  for(const o of [b.growtangle,b.battleSolid])for(const i of rt.all(o))rt.destroy(i);
  this.body.condition=0;this.body.visible=true;for(const h of this.heroes)h.imageAlpha=1;
  this.setPhase('return');
 }
 private victory(){this.setPhase('victory');this.message='* YOU WON!';this.body.visible=false;this.control.timeron=0;}
 step(){
  if(this.paused||this.outcome)return;this.frame++;this.phaseFrame++;const rt=this.rt,g=rt.globals;
  rt.step();
  this.clover?.afterStep();if(this.clover){this.mercy=this.clover.mercy;this.tired=this.clover.tired;}
  if(this.phase==='victory'){if(!rt.count(b.dmgWriter)&&!rt.count(basicAttack))this.outcome='victory';return;}
  if(rt.pendingRoom==='room_gameover'){this.outcome='defeat';this.setPhase('defeat');return;}
  if(this.phase==='intro'&&this.phaseFrame>=24)this.beginCommands();
  else if(!this.clover&&this.phase==='enemyTalk'&&this.phaseFrame>=90)this.beginTransition();
  else if(!this.clover&&this.phase==='transition'&&this.phaseFrame>=12)this.startEnemyAttack();
  else if(this.phase==='timing'){
   this.boltTick++;
   for(const bolt of this.bolts)if(bolt.alive&&bolt.frame-this.boltTick<-5){bolt.alive=false;bolt.points=0;this.startSwing(bolt.actor,0);}
   if(this.bolts.every(b=>!b.alive)){
    this.endTiming++;
    if(this.autoSusie&&this.actions[1]?.kind==='fight'&&!this.autoStruck&&this.endTiming>15){this.autoStruck=true;this.endTiming-=25;this.startSwing(1,this.warned?0:160);}
    if(this.endTiming>50){this.timingFade+=.08;if(this.timingFade>1)this.beginEnemy();}
   }
  }else if(this.phase==='enemy'&&this.control.reset===1)this.finishEnemy();
  else if(this.phase==='return'&&this.phaseFrame>=15){
   this.turn++;for(let i=0;i<this.party.length;i++)if(g.hp[this.party[i]]<=0)this.heal(i,Math.ceil(g.maxhp[this.party[i]]/8));
   if(this.autoSusie&&this.turn>=4)this.say(Array.from({length:7},(_,i)=>ltext(196+i)),()=>this.victory());else this.beginCommands();
  }
 }
}
