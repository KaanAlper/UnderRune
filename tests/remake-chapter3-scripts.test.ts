import {it,expect} from 'vitest';
import {moveTowards,loopExt,pingpong,rotateTowards} from '../src/remake/deltarune/chapter3-scripts';
it('preserves epsilon-equal input in movetowards instead of snapping it to the target',()=>{expect(moveTowards(1e-7,0,1)).toBe(1e-7);expect(moveTowards(5,0,2)).toBe(3);expect(moveTowards(1,0,2)).toBe(0);});
it('uses GML comparisons for negative wrapping and the pingpong turning point',()=>{
 expect(loopExt(-1e-7,0,360)).toBe(-1e-7);expect(loopExt(-360,0,360)).toBe(360);expect(loopExt(-10,0,360)).toBe(350);
 expect(pingpong(2+1e-7,2)).toBe(2+1e-7);
});
it('finishes an epsilon-equal rotation step at its target',()=>{expect(rotateTowards(0,10+1e-7,10)).toBe(10+1e-7);});
