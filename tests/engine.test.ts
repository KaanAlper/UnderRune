import {expect,test} from 'vitest';
import {circleHitsRect,segmentHitsCircle} from '../src/game/collision';
import {FixedClock} from '../src/game/clock';
import {randomGenerator} from '../src/game/rng';
import {Input} from '../src/game/input';
test('circle tangency and separation',()=>{
 const box={x:10,y:10,width:10,height:10};
 expect(circleHitsRect({x:9,y:15,radius:1},box)).toBe(true);
 expect(circleHitsRect({x:8,y:15,radius:1},box)).toBe(false);
});
test('fast bullet cannot tunnel through soul',()=>expect(segmentHitsCircle(0,5,100,5,50,5,3)).toBe(true));
test('fixed clock is invariant to rendering frequency',()=>{
 const run=(hz:number)=>{const c=new FixedClock();let n=0;for(let i=0;i<hz*2;i++)c.advance(1/hz,()=>n++);return n;};
 expect(run(30)).toBe(120);expect(run(60)).toBe(120);expect(run(144)).toBe(120);
});
test('resume does not simulate hidden time',()=>{const c=new FixedClock();let n=0;c.advance(10,()=>n++);expect(n).toBeLessThanOrEqual(5);c.reset();c.advance(1/60,()=>n++);expect(n).toBeLessThanOrEqual(6);});
test('seed reproducibility',()=>{const a=randomGenerator(7),b=randomGenerator(7);expect(Array.from({length:30},a)).toEqual(Array.from({length:30},b));});
test('input clears held keys and only confirms on edges',()=>{
 const i=new Input();i.press('z');expect(i.read().confirm).toBe(true);expect(i.read().confirm).toBe(false);i.press('ArrowLeft');expect(i.read().x).toBe(-1);i.clear();expect(i.read().x).toBe(0);
});
