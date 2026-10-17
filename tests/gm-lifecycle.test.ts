import {it,expect} from 'vitest';
import {GmRuntime} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
it('ends the room before cleanup, without Destroy for a room exit, and remains idempotent',()=>{
 const rt=new GmRuntime(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]})),seen:string[]=[];
 rt.create({name:'test',index:1,events:{roomEnd:()=>seen.push('room'),destroy:()=>seen.push('destroy'),cleanup:()=>seen.push('cleanup')}},0,0);
 rt.endRoom();rt.endRoom();expect(seen).toEqual(['room','cleanup']);expect(rt.instances).toHaveLength(0);
});
it('runs Destroy then Clean Up exactly once even when destruction is recursive',()=>{
 const rt=new GmRuntime(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]})),seen:string[]=[];
 const s=rt.create({name:'test',index:1,events:{destroy:i=>{seen.push('destroy');rt.destroy(i);},cleanup:()=>seen.push('cleanup')}},0,0);
 rt.destroy(s);rt.destroy(s);expect(seen).toEqual(['destroy','cleanup']);expect(s.live).toBe(false);
});
