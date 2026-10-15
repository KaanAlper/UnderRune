// Chapter 2's battle scripts and small helper objects, as Chapter 2 enemies and bullets call them. Where Chapter 2
// changed a Chapter 1 script (scr_randomtarget, scr_mercyadd, scr_enemyblcon), this is the Chapter 2 version.
import {gmArray,gmField,type GmInstance,type GmObjectDef,type GmRuntime} from '../gm/runtime';
import {eq,lengthdirX,lengthdirY,pointDirection,pointDistance} from '../gm/math';
import {C,mergeColor} from '../gm/graphics';
import {dmgWriter,heart,heroKris} from './battle';
import {button1_p} from './keys';
import {snd} from './sound';
import {rules} from './rules';
export {snd};
import {destroyWriters,writer} from './writer';

/** scr_isphase. */
export function isPhase(rt:GmRuntime,phase:'menu'|'acting'|'victory'|'attack'|'fight'|'spell'|'item'|'enemytalk'|'balloon'|'enemyattack'|'bullets',asker?:GmInstance){
 const g=rt.globals;let now=false;
 switch(phase){
  case 'menu':now=g.myfight===0;break;
  case 'acting':now=g.myfight===3;break;
  case 'victory':now=g.myfight===7;break;
  case 'attack':case 'fight':now=g.myfight===1;break;
  case 'spell':case 'item':now=g.myfight===4;break;
  case 'enemytalk':case 'balloon':now=g.mnfight===1;break;
  case 'enemyattack':case 'bullets':now=g.mnfight===2;break;
 }
 if(asker&&rules(rt).phaseScript)asker.__isphase=now?1:0;
 return now;
}
/** msgset / msgnext: battle text pages, remembering the last page written (global.msgno). */
export function msgSet(rt:GmRuntime,n:number,text:string){rt.globals.msgno=n;rt.globals.msg[n]=text;}
export function msgNext(rt:GmRuntime,text:string){msgSet(rt,(rt.globals.msgno??0)+1,text);}
/** merge_colour: each channel mixed, truncated. */
export {mergeColor};
/** scr_mercyadd (Chapter 2): mercy is capped at 100, rings by size, and shows its number over the enemy. */
export function mercyAdd2(caller:GmInstance,rt:GmRuntime,enemy:number,amount:number){
 const g=rt.globals;g.mercymod[enemy]+=amount;
 if(g.mercymod[enemy]<0)g.mercymod[enemy]=0;
 if(g.mercymod[enemy]>=100)g.mercymod[enemy]=100;
 let play=amount>0;
 for(const w of rt.all(dmgWriter))if(w.type===5)play=false;
 if(play){let pitch=0.8;if(amount<99)pitch=1;if(amount<=50)pitch=1.2;if(amount<=25)pitch=1.4;rt.sourceAudio?rt.sourceAudio.effect('snd_mercyadd',pitch,0.8):rt.sound?.('snd_mercyadd',pitch);}
 const w=rt.create(dmgWriter,g.monsterx[enemy],g.monstery[enemy]+20-g.hittarget[enemy]*20);caller.__mercydmgwriter=w.id;w.damage=amount;w.type=5;g.hittarget[enemy]+=1;
}
/** scr_turntimer: the enemy turn lasts at least this long. */
export function turnTimer(rt:GmRuntime,n:number){if(rt.globals.turntimer<n)rt.globals.turntimer=n;}
/** scr_blconskip: when the enemy's words end and the bullets start (-1: once the writers are gone). */
export function blconSkip(s:GmInstance,rt:GmRuntime,wait:number){
 const g=rt.globals;
 if(wait>=0){
  if(button1_p(rt)&&s.talktimer>wait)s.talktimer=s.talkmax;
  s.talktimer+=1;
  if(s.talktimer>=s.talkmax){destroyWriters(rt);g.mnfight=2;}
 }else if(wait===-1){if(!rt.exists(writer))g.mnfight=2;}
 else if(wait===-2){
  s.talktimer+=1;if(s.talktimer>15)s.talktimer=s.talkmax;
  if(s.talktimer>=s.talkmax){destroyWriters(rt);g.mnfight=2;}
 }
}
/** scr_rememberxy, scr_move_to_point_over_time, scr_move_to_rememberxy. */
export function rememberXY(s:GmInstance){s.___myrememberx=s.x;s.___myremembery=s.y;}
export function moveToPointOverTime(s:GmInstance,rt:GmRuntime,x:number,y:number,time:number){
 const m=rt.create(moveToPoint,s.x,s.y);s._mmm=m.id;m.target=s.id;m.movex=x;m.movey=y;m.movemax=time;return m;
}
export function moveToRememberXY(s:GmInstance,rt:GmRuntime,time:number){return moveToPointOverTime(s,rt,s.___myrememberx,s.___myremembery,time);}
/** obj_move_to_point: slides its target to a point over movemax frames. */
export const moveToPoint:GmObjectDef={name:'obj_move_to_point',index:928,events:{
 create:s=>{Object.assign(s,{target:-1,moved:0,movetimer:0,movex:0,movey:0,movemax:10,charmarker:0});},
 step:(s,rt)=>{
  const t=rt.byId(s.target);
  if(!t){rt.destroy(s);return;}
  if(s.moved===0){
   s.x=t.x;s.y=t.y;s.dist=pointDistance(s.x,s.y,s.movex,s.movey);s.dir=pointDirection(s.x,s.y,s.movex,s.movey);
   s.amt=s.dist/s.movemax;s.xadd=lengthdirX(s.amt,s.dir);s.yadd=lengthdirY(s.amt,s.dir);s.moved=1;
  }
  t.x+=s.xadd;t.y+=s.yadd;
  s.movetimer+=1;
  t.x=s.x+(s.movex-s.x)*(s.movetimer/s.movemax);t.y=s.y+(s.movey-s.y)*(s.movetimer/s.movemax);
  if(s.movetimer>=s.movemax)rt.destroy(s);
 },
}};
/** obj_script_delayed: runs a script on its target after a delay (scr_script_delayed). */
/** A script obj_script_delayed runs later, on its target, with the arguments it was given. */
type DelayedScript=((target:GmInstance,rt:GmRuntime,...args:any[])=>void)&{readonly gmlName?:string};
/** Names a delayed script after the GML script it stands for (the original keeps the script's number). */
export function gmlScript<F extends (target:GmInstance,rt:GmRuntime,...args:any[])=>void>(name:string,run:F):F&{readonly gmlName:string}{
 return Object.defineProperty(run,'gmlName',{value:name}) as F&{readonly gmlName:string};
}
/** obj_script_delayed: runs its script on its target after alarm 0 (or every `rate` frames while `constant`). Before
 * each run the target gets the script and its first ten arguments (__scipt, __scipt_arg), as in the original. */
export const scriptDelayed:GmObjectDef={name:'obj_script_delayed',index:932,events:{
 create:s=>{
  s.script=-1;s.target=-1;s.rate=1;s.alarm[0]=1;
  s.script_arg=[];for(s.i=0;s.i<13;s.i+=1)s.script_arg[s.i]=0;
  Object.assign(s,{arg_count:0,constant:0,max_time:0,timer:999,totaltimer:0});
 },
 alarm0:(s,rt)=>{rt.userEvent(s,0);rt.destroy(s);},
 user0:(s,rt)=>{
  const t=rt.byId(s.target);if(!t)return;
  t.__scipt=s.script;
  const args=gmArray(t,'__scipt_arg');for(s.i=0;s.i<10;s.i+=1)args[s.i]=s.script_arg[s.i];
  if(typeof t.__scipt!=='function')throw Error(`obj_script_delayed has no script to run (${String(t.__scipt)})`);
  t.__scipt(t,rt,...args.slice(0,s.arg_count));
 },
 step:(s,rt)=>{
  if(s.constant!==1)return;
  if(s.max_time===-1)s.totaltimer=-10;
  s.timer+=1;
  if(s.timer>=s.rate){if(rt.byId(s.target)&&s.totaltimer<s.max_time){rt.userEvent(s,0);s.timer=0;}else rt.destroy(s);}
  s.totaltimer+=1;
 },
}};
/** scr_script_delayed, run by `s`: the script runs on `s` after `delay` frames with these arguments. */
export function scriptDelayedOn(s:GmInstance,rt:GmRuntime,script:DelayedScript,delay:number,...args:unknown[]){
 const d=rt.create(scriptDelayed,0,0);d.script=script;d.alarm[0]=delay;d.target=s.id;args.forEach((a,i)=>{d.script_arg[i]=a;});d.arg_count=args.length;return d;
}
/** scr_var: sets one of the target's variables. */
export const setVar=gmlScript('scr_var',(t:GmInstance,_rt:GmRuntime,name:string,value:unknown)=>{(t as any)[gmField(name)]=value;});
/** scr_heartcolor: the soul's mode (red or yellow); the yellow soul's graze box has its own sprite. */
export function heartColor(caller:GmInstance,rt:GmRuntime,color:'red'|'yellow'){
 caller.__heartcolor=color;
 if(color==='red')for(const h of rt.all(heart)){h.color=0;h.sprite='spr_heart';}
 if(color==='yellow'){for(const h of rt.all(heart)){h.color=1;h.sprite='spr_yellowheart';}const gb=rt.instances.find(i=>i.live&&i.object.name==='obj_grazebox');if(gb)gb.sprite='spr_grazeappear_yellow';}
}
/** scr_bulletspawner: a bullet maker that knows its enemy, target and damage. */
export function bulletSpawner(s:GmInstance,rt:GmRuntime,x:number,y:number,def:GmObjectDef){
 const d=rt.create(def,x,y);s.__dc=d.id;d.creator=s.myself;d.target=s.mytarget;d.damage=rt.globals.monsterat[s.myself]*5;return d;
}
/** Chapter 2 scr_bullet_inherit: -1 keeps the live recipient's defaults; eligible graze fields reset to zero. */
export function bulletInherit2(caller:GmInstance,recipient:GmInstance){
 if(!recipient.live)return;
 for(const name of ['damage','grazepoints','timepoints','inv','target'])if(!eq(caller[name],-1))recipient[name]=caller[name];
 if(!eq(caller.grazed,-1))recipient.grazed=0;
 if(!eq(caller.grazetimer,-1))recipient.grazetimer=0;
 recipient.element=caller.element;
}
/** obj_lerppitch interpolates the live sound's logical pitch in the game frame loop. */
export const lerpPitch:GmObjectDef={name:'obj_lerppitch',index:933,depth:0,events:{
 create:s=>{Object.assign(s,{sndtarget:-1,targetpitch:1,frames:0,maxframes:10});},
 user0:(s,rt)=>{s.initpitch=rt.soundGetPitch?.(s.sndtarget)??1;},
 step:(s,rt)=>{
  s.frames+=1;const pitch=s.initpitch+(s.targetpitch-s.initpitch)*(s.frames/s.maxframes);
  rt.soundPitch?.(s.sndtarget,pitch);if(s.frames>=s.maxframes)rt.destroy(s);
 },
}};
/** snd_pitch_time replaces every prior tween for that sound, then samples its current pitch. */
export function sndPitchTime(rt:GmRuntime,handle:number|string,pitch:number,frames:number){
 for(const t of rt.all(lerpPitch))if(t.sndtarget===handle)rt.destroy(t);
 const t=rt.create(lerpPitch,0,0);t.sndtarget=handle;t.targetpitch=pitch;t.maxframes=frames;rt.userEvent(t,0);return t;
}
/** draw_monster_body_part_ext: a body part, with the enemy's white flash over it. */
export function drawBodyPart(s:GmInstance,rt:GmRuntime,sprite:string,frame:number,x:number,y:number,xs:number,ys:number,angle:number,blend:number,alpha:number){
 rt.drawSprite(sprite,frame,x,y,xs,ys,angle,blend,alpha);
 if(s.flash===1)rt.drawSpriteFog(sprite,frame,x,y,xs,ys,angle,C.white,-Math.cos(s.fsiner/5)*0.4+0.6);
}
