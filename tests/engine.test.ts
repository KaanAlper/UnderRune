import {expect,test} from 'vitest';
import {FixedClock} from '../src/game/clock';
import {Input} from '../src/game/input';
test('fixed clock is invariant to rendering frequency',()=>{
 const run=(hz:number)=>{const c=new FixedClock();let n=0;for(let i=0;i<hz*2;i++)c.advance(1/hz,()=>n++);return n;};
 expect(run(30)).toBe(120);expect(run(60)).toBe(120);expect(run(144)).toBe(120);
});
test('resume does not simulate hidden time',()=>{const c=new FixedClock();let n=0;c.advance(10,()=>n++);expect(n).toBeLessThanOrEqual(5);c.reset();c.advance(1/60,()=>n++);expect(n).toBeLessThanOrEqual(6);});
test('input clears held keys and only confirms on edges',()=>{
 const i=new Input();i.press('z');expect(i.read().confirm).toBe(true);expect(i.read().confirm).toBe(false);i.press('ArrowLeft');expect(i.read().x).toBe(-1);i.clear();expect(i.read().x).toBe(0);
});
