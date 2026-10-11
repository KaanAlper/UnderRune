import {describe,it,expect} from 'vitest';
import {eq,ge,gt,lt,round} from '../src/remake/gm/math';
describe('reference numeric rules',()=>{
 it('treats float32 fade residuals as equal to zero',()=>{const residual=Math.fround(.4)-.4;expect(eq(residual,0)).toBe(true);expect(gt(residual,0)).toBe(false);expect(lt(-residual,0)).toBe(false);});
 it('stops an accumulated rotation speed at its epsilon-equal cap',()=>{let speed=1.5;for(let i=0;i<200;i++)if(lt(speed,3))speed+=.01;expect(speed).toBeCloseTo(3,12);expect(ge(speed,3)).toBe(true);});
 it('rounds both positive and negative halves to even',()=>{expect([-2.5,-1.5,-.5,.5,1.5,2.5].map(round)).toEqual([-2,-2,0,0,2,2]);});
});
