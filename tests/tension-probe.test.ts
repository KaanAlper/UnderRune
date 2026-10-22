import {expect,it} from 'vitest';
import {GmRuntime,resolveEvent} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
import {tensionBar} from '../src/remake/deltarune/controller';
it('runs the Chapter 2 TP selection probe on its first visible draw',()=>{
 const rt=new GmRuntime(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]}));rt.globals={chapter:2,tension:0,maxtension:250};
 const s=rt.create(tensionBar,0,0);resolveEvent(s.object,'draw')!(s,rt);expect(s.shit).toBe(1);
});
