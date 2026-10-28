import type {PracticePattern} from './practice';
import {darkener} from '../deltarune/battle';
import {findController} from '../deltarune/controller';
/** Distinct queues selected by the normal source turn progression; debug-only patterns are excluded. */
const sequences:readonly (readonly [number,number,string])[]=[
 [0,0,'Opening shield'],[1,1,'Spear sequence I'],[2,2,'Spear sequence II'],[3,3,'Spear sequence III'],
 [4,4,'Spear sequence IV'],[72,5,'Shell pinball'],[70,6,'Box throw'],[6,7,'Spear sequence V'],
 [7,8,'Spear sequence VI'],[12,9,'Spear sequence VII'],[9,10,'Spear sequence VIII'],[47,11,'Box transformations'],
 [13,13,'Spear sequence IX'],[14,14,'Spear sequence X'],[53,15,'Spear sequence XI'],[55,16,'Spear sequence XII'],
 [56,17,'Spear sequence XIII'],[220,18,'Spear sequence XIV'],[19,20,'Final attack'],
];
export const HAMMER_PATTERNS:readonly PracticePattern[]=sequences.map(([pattern,turn,name])=>({name,setup:(rt,e)=>{
 // Practice enters after dialogue. Keep the native box/heart entrance, frame-12 start,
 // queue timing and controller return; no HP/invincibility changes or synthetic win.
 Object.assign(e,{introtalkcon:-1,firstconversationhappened:1,talked:1,talktimer:0,attacked:0,rtimer:0,
  turn,trueturn:turn,attackpattern:pattern,endcon:0,endtimer:0});
 rt.userEvent(e,0);e.attackpattern=pattern;e.reachedendphase=0;e.have_used_final_attack=false;
 if(!rt.exists(darkener))rt.create(darkener,0,0);
 const c=findController(rt);if(c)c.noreturn=0;rt.globals.mnfight=1.5;
}}));
