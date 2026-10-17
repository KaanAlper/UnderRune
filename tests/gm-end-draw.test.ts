import {it,expect} from 'vitest';
import {GmRuntime} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
it('draws every depth before the separate End Draw pass, with inheritance and visibility',()=>{
 const rt=new GmRuntime(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]})),seen:string[]=[];
 const parent={name:'parent',index:1,events:{endDraw:()=>seen.push('endParent')}};
 rt.create({name:'back',index:2,depth:100,parent,events:{draw:()=>seen.push('back')}},0,0);
 rt.create({name:'front',index:3,depth:0,events:{draw:()=>seen.push('front'),endDraw:()=>seen.push('endFront')}},0,0);
 rt.create({name:'hidden',index:4,visible:false,parent},0,0);rt.draw();expect(seen).toEqual(['back','front','endParent','endFront']);
});
