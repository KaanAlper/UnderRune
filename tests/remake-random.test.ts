import {describe,it,expect} from 'vitest';
import fs from 'node:fs';
import {GmRandom} from '../src/remake/gm/random';

// Reference trace recorded from the original Jevil battle (tools/oracle-record.mjs); local only.
const tracePath='.tools/oracle/ch1-25-s11.ndjson';
const trace=fs.existsSync(tracePath)?fs.readFileSync(tracePath,'utf8').trim().split('\n').map(l=>JSON.parse(l) as {f:number;rng:number[]}):null;

describe('GameMaker WELL512 random',()=>{
 it('seeds the 16-word state like the runtime',()=>{
  const r=new GmRandom(11);
  expect(r.snapshot()).toEqual([0,11,2756896600,2113564804,3920138620,4090977823,3625524497,368384544,193883815,1123682027,582874203,1865620209,891556027,2638982355,1947076482,3290632637,3397824005]);
 });
 it('maps draws the way random, irandom and choose do',()=>{
  const a=new GmRandom(5),b=new GmRandom(5);
  const n=b.next();expect(a.random(10)).toBeCloseTo(n/0xffffffff*10,12);
  const c=new GmRandom(9),d=new GmRandom(9);expect(c.irandom(6)).toBe(d.next()%7);
  const e=new GmRandom(9),g=new GmRandom(9);expect(e.choose('a','b','c')).toBe(['a','b','c'][g.next()%3]);
  expect(new GmRandom(1).irandom(0)).toBe(0);
 });
 it.skipIf(!trace)('reproduces the reference state from frame to frame',()=>{
  // Find frames where the state changed and check our next() reaches the later state.
  let checked=0;
  for(let i=1;i<trace!.length&&checked<20;i++){
   const before=trace![i-1].rng,after=trace![i].rng;if(before.join()===after.join())continue;
   const r=GmRandom.restore(before);let steps=0;
   while(r.snapshot().join()!==after.join()&&steps<5000){r.next();steps++;}
   expect(r.snapshot()).toEqual(after);checked++;
  }
  expect(checked).toBeGreaterThan(5);
 });
});
