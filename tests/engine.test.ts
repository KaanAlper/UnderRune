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

test('confirm release reaches a frame once even when the tap ends between reads',()=>{
 const input=new Input();input.press('z');input.release('z');
 const tap=input.read();expect(tap.confirm).toBe(true);expect(tap.shoot).toBe(false);expect(tap.shootReleased).toBe(true);
 expect(input.read().shootReleased).toBe(false);
});
test('normal route confirms do not release a charged shot while another confirm stays held',()=>{
 const input=new Input();input.press('z');input.press('Enter');input.read();input.release('z');
 const edge=input.read();expect(edge.shootReleased).toBe(false);expect(edge.shoot).toBe(true);input.release('Enter');expect(input.read().shootReleased).toBe(true);
 input.release('Enter');expect(input.read().shootReleased).toBe(false);
});
test('the staged solo-route input policy retains independent release edges for rapid BIG SHOTs',()=>{
 const input=new Input();input.setConfirmReleaseMode('independent');input.press('z');input.press('Enter');input.read();input.release('Enter');
 const edge=input.read();expect(edge.shoot).toBe(true);expect(edge.shootReleased).toBe(true);
 input.setConfirmReleaseMode('logical');expect(input.read().shootReleased).toBe(false);
});
test('clearing input drops pending release edges on focus and scene changes',()=>{
 const input=new Input();input.press('z');input.release('z');input.clear();expect(input.read().shootReleased).toBe(false);
});
