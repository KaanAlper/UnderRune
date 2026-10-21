import {expect,it} from 'vitest';
import {FixedClock} from '../src/game/clock';
it('limits a heavy battle presentation to one complete 30 Hz frame instead of accumulating more draws',()=>{
 const clock=new FixedClock();let ticks=0;
 clock.advance(.2,()=>ticks++,2);expect(ticks).toBe(2);
 clock.advance(1/60,()=>ticks++,2);expect(ticks).toBe(3);
});
it('preserves 60 Hz UI ticks and 30 Hz source frames at ordinary display rates',()=>{
 for(const hz of [30,60,120]){const clock=new FixedClock();let ticks=0;for(let n=0;n<hz;n++)clock.advance(1/hz,()=>ticks++,2);expect(ticks).toBe(60);expect(Math.floor(ticks/2)).toBe(30);}
});
it('retains the regular UI catch-up limit and clears debt on reset',()=>{
 const clock=new FixedClock();let ticks=0;clock.advance(.2,()=>ticks++);expect(ticks).toBe(5);clock.advance(1/120,()=>ticks++);clock.reset();clock.advance(1/120,()=>ticks++);expect(ticks).toBe(5);
});
