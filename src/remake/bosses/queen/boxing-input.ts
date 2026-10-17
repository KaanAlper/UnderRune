// o_boxingcontroller input and action arbitration. Boxing has two punch buttons; X is not a block button.
import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {button1_p,KEY,pressed} from '../../deltarune/keys';
import {snd} from '../../deltarune/sound';

export const GIGA_QUEEN_CONTROLS={leftPunch:[KEY.z,KEY.enter],rightPunch:[KEY.x,KEY.shift],dodgeLeft:KEY.left,dodgeRight:KEY.right,duck:KEY.down} as const;
export interface BoxingInputObjects{queen:GmObjectDef;enemy:GmObjectDef;arcadeBg:GmObjectDef;wireframe:GmObjectDef}

/** Source Step's input sampling; actions remain buffered even while a punch is finishing. */
export function bufferBoxingInput(s:GmInstance,rt:GmRuntime,objects:BoxingInputObjects,disable:number,switchOS=false){
 const q=rt.first(objects.queen),enemy=rt.first(objects.enemy),wire=rt.first(objects.wireframe);
 if(!q)throw Error('Boxing input requires o_boxingqueen');
 if(s.cancontrol!==1||q.phase_transition!==0||s.talking!==0||s.arcaderesettimer!==0||s.dead>=4||disable!==0)return;
 s.canpunch=1;
 if(s.boxingtimer<2&&q.state!==3&&s.wireframe_boxing===0)s.canpunch=0;
 if(wire&&wire.introcon===0&&s.wireframe_boxing===1)s.canpunch=0;
 if(q.phase_transition>0&&s.wireframe_boxing===1)s.canpunch=0;
 if(q.state===3&&s.wireframe_boxing===0&&q.attacktype===9){if(q.attackcon<3)s.canpunch=0;if(q.attacktimer<120/s.f)s.canpunch=0;}
 const amount=s.wireframe_boxing===1?5:2;
 const left=switchOS?pressed(rt,KEY.x,KEY.shift):button1_p(rt),right=switchOS?button1_p(rt):pressed(rt,KEY.x,KEY.shift);
 if(left&&s.canpunch){s.buffer_z=amount;for(const bg of rt.all(objects.arcadeBg))bg.punch_l_timer=5;}
 if(right&&s.canpunch){s.buffer_x=amount;for(const bg of rt.all(objects.arcadeBg))bg.punch_r_timer=5;}
 for(const [key,field,bgField] of [[KEY.down,'buffer_d','dodge_d_timer'],[KEY.right,'buffer_r','dodge_r_timer'],[KEY.left,'buffer_l','dodge_l_timer']] as const){
  if(pressed(rt,key)){s[field]=3;for(const bg of rt.all(objects.arcadeBg))bg[bgField]=5;}
 }
 if(s.boxingtimer<2&&q.state!==3&&s.wireframe_boxing===0){s.buffer_d=0;s.buffer_r=0;s.buffer_l=0;}
 if(enemy&&enemy.playerhasntdodged===0&&pressed(rt,KEY.down,KEY.right,KEY.left))enemy.playerhasntdodged=1;
}

/** Source user1; also used when a late-punch dodge cancels the punch. */
export function resetBoxingAction(s:GmInstance){
 s.x=s.basex;s.y=s.basey;s.drawflip=1;s.imageIndex=0;
 for(const k of ['punchtimer','punchcon','dodging','dodgecon','dodgetimer','hurtcon','hurttimer','ducking','duckcon','ducktimer','jumping','jumpcon','jumptimer'])s[k]=0;
}

/** Input arbitration occurs in source order: left punch, right punch, left dodge, right dodge, duck, jump. */
export function consumeBoxingInput(s:GmInstance,rt:GmRuntime,objects:BoxingInputObjects){
 const enemy=rt.first(objects.enemy),wire=rt.first(objects.wireframe);
 const neutral=()=>s.dodgecon===0&&s.hurtcon===0&&s.duckcon===0&&s.jumpcon===0;
 const punch=(buffer:string,flip:number,side:number)=>{
  if(neutral()&&s[buffer]>0&&(s.punchcon===0||(s.punchcon===6&&!wire)||(s.punchcon===6&&wire&&s.punchtimer>6/s.f))){
   s.drawflip=flip;s.punchcon=1;s.lastpunchside=side;if(enemy)enemy.didntpunchthisturn=0;
  }
 };
 punch('buffer_z',0,-1);punch('buffer_x',1,1);
 const evade=(buffer:string,flip:number|undefined,duck=false)=>{
  if(((s.punchcon===0&&neutral())||(s.punchcon===5&&s.y>370)||s.punchcon===6)&&s[buffer]>0){
   if(s.punchcon>=5){resetBoxingAction(s);s.vspeed=0;s.friction=0;}
   if(flip!==undefined)s.drawflip=flip;
   s[duck?'duckcon':'dodgecon']=1;
   snd(rt,s.arcade?'motor_upper_quick_high_bc':'motor_upper_quick_high');
   if(enemy)enemy.didntdodgethisturn=0;
  }
 };
 evade('buffer_l',1);evade('buffer_r',0);evade('buffer_d',undefined,true);
 if(s.punchcon===0&&neutral()&&s.buffer_u>0)s.jumpcon=1;
}

export function decayBoxingInput(s:GmInstance){for(const k of ['buffer_z','buffer_x','buffer_u','buffer_d','buffer_r','buffer_l'])s[k]-=1;}
