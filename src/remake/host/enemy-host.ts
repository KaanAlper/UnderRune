// What the shared battle host needs from an encounter whose enemy runs its own original events (dialogue, ACTs,
// enemy turn): Clover and K.Round implement this; Jevil and Lancer still use the host's built-in flow.
import type {GmInstance} from '../gm/runtime';

export interface SourceDialogue{id:number;kind:'battle'|'speech';rawPages:string[];pages:string[];page:number;x:number;y:number;face:number;typer:number;fc:number;fe:number}
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
