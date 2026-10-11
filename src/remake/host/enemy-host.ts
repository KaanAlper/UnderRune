// What the shared battle host needs from an encounter whose enemy runs its own original events (dialogue, ACTs,
// enemy turn): Clover and K.Round implement this; Jevil and Lancer still use the host's built-in flow.
import type {GmInstance} from '../gm/runtime';

/** The speaker portrait a writer page shows (\F R/S... with emotion \E n); null for none. */
export type PageFace={hero:'ralsei'|'susie'|string;emotion:number}|null;
export interface SourceDialogue{id:number;kind:'battle'|'speech';rawPages:string[];pages:string[];page:number;x:number;y:number;face:number;typer:number;fc:number;fe:number;
 /** Per displayed page, when the writer changes portraits mid-dialogue (K.Round's Ralsei and Susie lines). */
 faces?:PageFace[]}
export type SourceEnemyPhase='idle'|'speech'|'transition'|'attack'|'return';
export interface SourceEnemyEvents{
 onDialogue?:(writers:readonly SourceDialogue[])=>void;
 onActionComplete?:()=>void;
 onPhase?:(phase:SourceEnemyPhase)=>void;
 onDefeat?:(enemy:GmInstance)=>void;
}
/** An ACT as the menu shows it; `participants` are party slots that act together (the actor first). */
export interface SourceActChoice{name:string;value:number;participants:number[];disabled:boolean}
export interface SourceEnemyHost{
 readonly body:GmInstance;
 readonly dialogue:readonly SourceDialogue[];
 readonly mercy:number;
 readonly tired:boolean;
 /** The battle message shown with the command menu, and the one shown when the battle opens. */
 readonly message:string;
 readonly initialText:string;
 readonly choices:readonly SourceActChoice[];
 /** Start an ACT during action resolution; the enemy's own Step produces its dialogue. */
 beginAct(value:number):void;
 /** Advance or close the current dialogue. */
 confirm():void;
 /** After the party's actions: the enemy's own Step creates the soul, box and attack. */
 beginEnemyTurn():void;
 /** Call once after every unpaused runtime step. */
 afterStep():void;
 /** After the enemy turn has been cleaned up, before the command menu reopens. */
 returnToCommands():void;
 syncEnemyStats(hp:number,at:number,df:number):void;
 /** After shared damage effects: the enemy's own hurt and defeat handling. */
 receiveHit(hp:number,amount:number):void;
 /** SPARE at full mercy (2) or Pacify while TIRED (3). */
 spare(outcome:2|3):void;
 /** A SPARE that is not ready (scr_mercyadd). */
 addMercy(amount:number):void;
 /** Spare points this enemy adds per early SPARE. */
 readonly sparePoints:number;
}

/** One writer page: its text without control codes, and the portrait it switches to, if any (undefined = unchanged). */
export function parsePage(raw:string):{text:string;face?:PageFace}{
 let face:PageFace|undefined,emotion=0;
 for(const m of raw.matchAll(/\\([A-Za-z*])([A-Za-z0-9])/g)){
  if(m[1]==='E'){emotion=Number(m[2])||0;if(face)face={...face,emotion};}
  if(m[1]==='F')face=m[2]==='0'?null:{hero:m[2]==='R'?'ralsei':m[2]==='S'?'susie':m[2],emotion};
 }
 const text=raw.replace(/\\[A-Za-z*][A-Za-z0-9]/g,'').replace(/\^\d/g,'').replace(/\/%|\/|%%|%/g,'').replace(/[&#]/g,'\n')
  .split('\n').map(l=>l.trim()).join('\n').trim();
 return face===undefined?{text}:{text,face};
}
/** The battle controller's ACT menu: actactor 1 is Kris alone, 2 with Susie, 3 with Ralsei, 4 with both;
 * an ACT whose partner is absent or down cannot be chosen. Unused slots are left out. */
export function actChoices(g:Record<string,any>,enemy:number):SourceActChoice[]{
 const susie=g.char.indexOf(2),ralsei=g.char.indexOf(3),out:SourceActChoice[]=[];
 g.actname[enemy].forEach((name:string,value:number)=>{
  if(g.canact[enemy][value]!==1)return;
  const actor=g.actactor[enemy][value],needSusie=actor===2||actor===4,needRalsei=actor===3||actor===4,participants=[0];
  if(needSusie&&susie>=0)participants.push(susie);
  if(needRalsei&&ralsei>=0)participants.push(ralsei);
  const disabled=(needSusie&&(susie<0||g.hp[2]<=0))||(needRalsei&&(ralsei<0||g.hp[3]<=0));
  out.push({name,value,participants,disabled});
 });
 return out;
}
