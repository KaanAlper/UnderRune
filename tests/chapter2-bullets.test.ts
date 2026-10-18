import {it,expect} from 'vitest';
import {GmRuntime} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
import {createChapter2BulletController} from '../src/remake/deltarune/chapter2-bullets';
it('shares the native controller prelude and dispatches type handlers without guessing an attack',()=>{
 const rt=new GmRuntime(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]}));rt.globals={chapter:2,monster:[1,1,0],monsterattackname:['same','same','']};const calls:number[]=[];
 const def=createChapter2BulletController(name=>({name,index:1000}),[(s)=>{calls.push(s.btimer);return s.type===8;}]);
 const s=rt.create(def,0,0);s.type=8;s.creator=1;def.events!.step!(s,rt);expect([s.ratio,s.sameattack,s.sameattacker,s.init,s.btimer]).toEqual([1.6,2,true,1,100]);expect(calls).toEqual([100]);
 s.type=991;expect(()=>def.events!.step!(s,rt)).toThrow('Chapter 2 bullet pattern 991');
});
