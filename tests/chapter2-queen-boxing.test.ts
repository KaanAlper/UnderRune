import {describe,expect,it} from 'vitest';
import {GmRuntime,type GmObjectDef} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
import {inputName} from '../src/remake/deltarune/controller';
import {bufferBoxingInput,consumeBoxingInput,decayBoxingInput,resetBoxingAction,type BoxingInputObjects} from '../src/remake/bosses/queen/boxing-input';
const definition=(name:string,index:number):GmObjectDef=>({name,index});
const objects:BoxingInputObjects={queen:definition('o_boxingqueen',1),enemy:definition('obj_gigaqueen_enemy',2),wireframe:definition('o_boxing_wireframe',3),arcadeBg:definition('obj_ch2_scene10_arcade_bg',4)};
function setup(){
 const rt=new GmRuntime(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]}),{seed:13});
 const s=rt.create(definition('o_boxingcontroller',0),320,390),q=rt.create(objects.queen,320,300),e=rt.create(objects.enemy,0,0);
 Object.assign(s,{cancontrol:1,talking:0,arcaderesettimer:0,dead:0,boxingtimer:20,wireframe_boxing:0,f:2,basex:320,basey:390,drawflip:1,canpunch:1,arcade:0,lastpunchside:0});
 for(const key of ['buffer_z','buffer_x','buffer_u','buffer_d','buffer_r','buffer_l','punchcon','punchtimer','dodgecon','hurtcon','duckcon','jumpcon','dodging','ducking','jumping','dodgetimer','ducktimer','jumptimer','hurttimer'])s[key]=0;
 Object.assign(q,{phase_transition:0,state:0,attacktype:0,attackcon:0,attacktimer:0});Object.assign(e,{playerhasntdodged:0,didntpunchthisturn:1,didntdodgethisturn:1});
 return {rt,s,q,e};
}
describe('GIGA Queen actual boxing controls',()=>{
 it('uses the native English key labels in its tutorial text',()=>{expect([0,1,2,3,4,5,6].map(inputName)).toEqual(['[Down]','[Right]','[Up]','[Left]','[Z]','[X]','[C]']);});
 it.each([[90,-1],[13,-1],[88,1],[16,1]])('maps key %i to punch side %i', (key,side)=>{
  const {rt,s,e}=setup();rt.input.pressed.add(key);bufferBoxingInput(s,rt,objects,0);consumeBoxingInput(s,rt,objects);
  expect(s.punchcon).toBe(1);expect(s.lastpunchside).toBe(side);expect(e.didntpunchthisturn).toBe(0);
 });
 it.each([[37,1,'dodgecon'],[39,0,'dodgecon'],[40,1,'duckcon']])('maps key %i to the original evasion', (key,flip,con)=>{
  const {rt,s,e}=setup();rt.input.pressed.add(key);bufferBoxingInput(s,rt,objects,0);consumeBoxingInput(s,rt,objects);
  expect(s[con]).toBe(1);expect(s.drawflip).toBe(flip);expect(e.didntdodgethisturn).toBe(0);expect(e.playerhasntdodged).toBe(1);
 });
 it('does not invent an UP jump binding or repeatedly punch from a held key',()=>{
  const {rt,s}=setup();rt.input.pressed.add(38);rt.input.held.add(90);bufferBoxingInput(s,rt,objects,0);consumeBoxingInput(s,rt,objects);
  expect([s.buffer_u,s.punchcon,s.jumpcon]).toEqual([0,0,0]);
 });
 it.each(['cancontrol','talking','arcaderesettimer','dead','transition','disable'])('honors the %s input gate',gate=>{
  const {rt,s,q}=setup();rt.input.pressed.add(90);
  if(gate==='cancontrol')s.cancontrol=0;else if(gate==='talking')s.talking=1;else if(gate==='arcaderesettimer')s.arcaderesettimer=1;else if(gate==='dead')s.dead=4;else if(gate==='transition')q.phase_transition=1;
  bufferBoxingInput(s,rt,objects,gate==='disable'?1:0);expect(s.buffer_z).toBe(0);
 });
 it('buffers only two frames in story boxing and five in arcade boxing',()=>{
  const {rt,s}=setup();rt.input.pressed.add(90);bufferBoxingInput(s,rt,objects,0);expect(s.buffer_z).toBe(2);decayBoxingInput(s);expect(s.buffer_z).toBe(1);
  s.wireframe_boxing=1;bufferBoxingInput(s,rt,objects,0);expect(s.buffer_z).toBe(5);
 });
 it('keeps the first punch when both buttons arrive together, and left dodge precedence',()=>{
  const {rt,s}=setup();rt.input.pressed=new Set([90,88]);bufferBoxingInput(s,rt,objects,0);consumeBoxingInput(s,rt,objects);expect(s.lastpunchside).toBe(-1);
  resetBoxingAction(s);s.buffer_z=0;s.buffer_x=0;s.buffer_l=1;s.buffer_r=1;consumeBoxingInput(s,rt,objects);expect([s.dodgecon,s.drawflip]).toEqual([1,1]);
 });
 it('cancels a finishing punch into an evasion, clearing motion before dodging',()=>{
  const {rt,s}=setup();s.punchcon=5;s.y=380;s.vspeed=4;s.friction=.2;s.buffer_r=2;consumeBoxingInput(s,rt,objects);
  expect([s.punchcon,s.dodgecon,s.drawflip,s.vspeed,s.friction,s.x,s.y]).toEqual([0,1,0,0,0,320,390]);
 });
 it('does not let a punch cancel a hurt animation',()=>{
  const {rt,s}=setup();s.hurtcon=1;s.buffer_z=2;consumeBoxingInput(s,rt,objects);expect(s.punchcon).toBe(0);
 });
});
