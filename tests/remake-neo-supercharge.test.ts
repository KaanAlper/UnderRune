import fs from 'node:fs';
import {afterEach,beforeEach,describe,expect,it} from 'vitest';
import {GmInstance,GmRuntime,resolveEvent} from '../src/remake/gm/runtime';
import type {GmGraphics} from '../src/remake/gm/graphics';
import {C} from '../src/remake/gm/graphics';
import {installNeoHost} from '../src/remake/host/neo';
import {executeNeoSource} from '../src/remake/bosses/spamton-neo/body-source';
import {loadSprites} from './parity/reference';

const originalDraw='extracted/chapter2_windows/code/gml_Object_obj_heart_Draw_0.gml';
const available=fs.existsSync(originalDraw)&&fs.existsSync('extracted/chapter2_windows/sprites.json');
let previousStrict:boolean;
beforeEach(()=>{previousStrict=GmInstance.strict;GmInstance.strict=true;});
afterEach(()=>{GmInstance.strict=previousStrict;});

function scene(shots=20){
 const rt=new GmRuntime(loadSprites(2),{seed:11});
 rt.globals={chapter:2,fighting:0,flag:Array(1000).fill(0),inv:1000,turntimer:500};
 const {objects,host}=installNeoHost(rt);
 const neo=rt.restore(objects.obj_spamton_neo_enemy,99998,460,80,{
  bigshot:0,upgrade:0,bigshotcount:shots,bigshotused:0,myself:0,singleshotmercy:0,
  partsiner:[],partrot:[],partx:[],party:[],partxoff:[],partyoff:[],partsprite:Array(8).fill('spr_sneo_example'),
 });
 neo.visible=false;
 const soul=rt.restore(objects.obj_heart,99999,300,160,{
  wspeed:5,canmove:1,color:1,disableslow:0,remove_slow_z_buffer:40,boundaryup:0,dmgnoise:0,
  z_hold:0,z_hold_f:0,z_charge:0,chargeshot_sound:-1,chargeshot_delay:0,chargeshotcount:0,superchargetimer:0,f:2,
 });
 soul.sprite='spr_yellowheart';
 const draws:unknown[][]=[];
 rt.gfx={sprite:(...args:unknown[])=>draws.push(args)} as unknown as GmGraphics;
 const frame=(n=1)=>{for(let i=0;i<n;i++){rt.step();rt.draw();}};
 return {rt,objects,host,neo,soul,draws,frame};
}

describe.skipIf(!available)('Susie Supercharge through the installed Chapter 2 host',()=>{
 it('records enrage only after the source rapid-shot threshold actually raises NEO attack',()=>{
  const {rt,neo}=scene(0);neo.funnycheat=0;rt.globals.tempflag=Array(100).fill(0);rt.globals.monsterat=[13,0,0];const modes:string[]=[];rt.onBattleMode=mode=>modes.push(mode);
  for(let i=0;i<5;i++)rt.userEvent(neo,4);expect(modes).toEqual([]);expect(rt.globals.monsterat[0]).toBe(13);
  rt.userEvent(neo,4);expect(modes).toEqual(['enraged']);expect(rt.globals.monsterat[0]).toBe(13.5);expect(neo.hellmode).toBe(1);
 });
 it.each([0,16,36,40,52,200])('draws the original charge rings and orange pulses at hold %i',hold=>{
  const current=scene(),reference=scene();
  current.soul.z_hold=reference.soul.z_hold=hold;
  current.soul.superchargetimer=reference.soul.superchargetimer=17;
  resolveEvent(current.soul.object,'draw')!(current.soul,current.rt);
  executeNeoSource(fs.readFileSync(originalDraw,'utf8'),reference.soul,reference.rt,reference.host,undefined,'draw');
  expect(current.draws).toEqual(reference.draws);
  expect(current.soul.superchargetimer).toBe(reference.soul.superchargetimer);
 });

 it('advances the orange pulse without firing and releases a fast shot with eight temporary sparks',()=>{
  const {rt,objects,neo,soul,draws,frame}=scene();frame(3);
  expect(soul.superchargetimer).toBe(3);expect(neo.bigshotcount).toBe(20);
  rt.input.held.add(90);frame(10);expect(soul.z_hold).toBe(40);
  rt.input.held.clear();rt.input.released.add(90);draws.length=0;frame();
  const shot=rt.all(objects.obj_yheart_shot).find(s=>s.big===1)!;
  // Newly created projectiles also receive this frame's normal motion/friction pass.
  expect(shot.hspeed).toBeCloseTo(20.4);
  expect([shot.trail,neo.bigshotcount,soul.z_hold]).toEqual([1,19,0]);
  const sparks=rt.all(objects.obj_yheart_sneo_particle);
  expect(sparks).toHaveLength(8);for(const spark of sparks)expect(spark.speed).toBeCloseTo(7.2);
  expect(draws.filter(d=>d[7]===C.orange)).toHaveLength(2);
  frame(20);expect(sparks.every(s=>!s.live)).toBe(true);
  expect(soul.superchargetimer).toBe(34);expect(neo.bigshotcount).toBe(19);
 });

 it('ends the orange pulse on the last released shot, then cleans up its source-owned effect',()=>{
  const {rt,objects,neo,soul,draws,frame}=scene(1);
  rt.input.held.add(90);frame(10);
  rt.input.held.clear();rt.input.released.add(90);draws.length=0;frame();
  expect(neo.bigshotcount).toBe(0);expect(soul.superchargetimer).toBe(10);
  expect(draws.filter(d=>d[7]===C.orange)).toHaveLength(0);
  const end=rt.first(objects.obj_supercharge_end)!;
  expect(end).toBeDefined();expect(end.timer).toBe(1);
  expect(rt.all(objects.obj_yheart_sneo_particle)).toHaveLength(8);
  frame(15);expect(end.live).toBe(false);
  frame(5);expect(rt.count(objects.obj_yheart_sneo_particle)).toBe(0);
 });
});
