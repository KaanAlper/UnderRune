import {describe,it,expect} from 'vitest';
import {TheaterState,cubicBezier,STAGE_CENTER,STAGE_WIDTH} from '../src/game/theater';
import type {InputFrame} from '../src/game/input';
const none:InputFrame={x:0,y:0,confirm:false,cancel:false,menu:false,restart:false,pause:false,slow:false,shoot:false};
const run=(s:TheaterState,frames:number,input:Partial<InputFrame>={})=>{let event=null;for(let i=0;i<frames;i++){const e=s.step({...none,...(i===0?input:{})});if(e)event=e;}return event;};
describe('theater intro',()=>{
 it('uses the exact strong curves and stays within 0..1',()=>{
  expect(cubicBezier([0.23,1,0.32,1],0)).toBe(0);expect(cubicBezier([0.23,1,0.32,1],1)).toBe(1);
  expect(cubicBezier([0.23,1,0.32,1],0.5)).toBeGreaterThan(0.9);
  // Reference values from a brute-force solve of the same curves.
  expect(cubicBezier([0.77,0,0.175,1],0.5)).toBeCloseTo(0.595971,5);expect(cubicBezier([0.23,1,0.32,1],0.5)).toBeCloseTo(0.965982,5);
 });
 it('starts split down the middle with the TV off',()=>{
  const s=new TheaterState();expect(s.boundary).toBe(STAGE_CENTER);expect(s.power).toBe(0);expect(s.active).toBeNull();
 });
 it('pressing a remote powers the TV on and spreads that side across the stage',()=>{
  const s=new TheaterState();run(s,1,{x:-1});expect(s.selected).toBe('undertale');
  run(s,120,{confirm:true});expect(s.active).toBe('undertale');expect(s.power).toBe(1);expect(s.boundary).toBe(STAGE_WIDTH);expect(s.logo).toBe(1);
  const d=new TheaterState();run(d,120,{confirm:true});expect(d.active).toBe('deltarune');expect(d.boundary).toBe(0);
 });
 it('the other remote switches channel and sweeps back across',()=>{
  const s=new TheaterState();run(s,120,{confirm:true});run(s,1,{x:-1});run(s,120,{confirm:true});
  expect(s.active).toBe('undertale');expect(s.boundary).toBe(STAGE_WIDTH);
 });
 it('UNDERTALE stays on its coming-soon screen; DELTARUNE connects',()=>{
  const u=new TheaterState();run(u,1,{x:-1});run(u,120,{confirm:true});expect(run(u,120,{confirm:true})).toBeNull();expect(u.active).toBe('undertale');
  const d=new TheaterState();run(d,120,{confirm:true});expect(run(d,120,{confirm:true})).toBe('enter-deltarune');
 });
 it('a second press during power-on is not lost: it connects once the logo is up',()=>{
  const d=new TheaterState();run(d,3,{confirm:true});expect(run(d,120,{confirm:true})).toBe('enter-deltarune');
 });
 it('cancel turns the TV off and restores the split',()=>{
  const s=new TheaterState();run(s,120,{confirm:true});run(s,120,{cancel:true});expect(s.active).toBeNull();expect(s.power).toBe(0);expect(s.boundary).toBe(STAGE_CENTER);
 });
 it('reduced motion skips the sweep and power animation',()=>{
  const s=new TheaterState(true);run(s,1,{confirm:true});expect(s.boundary).toBe(0);expect(s.power).toBe(1);
 });
});
