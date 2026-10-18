import {it,expect} from 'vitest';
import {GmRuntime,resolveEvent} from '../src/remake/gm/runtime';
import {afterimageGrow} from '../src/remake/deltarune/battle';
import type {SpriteBank} from '../src/remake/gm/sprites';
const bank:SpriteBank={get:()=>undefined,collisionCompat:false,roomSpeed:30};
it('follows a live Chapter 3 target and expires on the configured frame',()=>{
 const rt=new GmRuntime(bank);rt.globals.chapter=3;const target=rt.create({name:'target',index:1},20,30),a=rt.create(afterimageGrow,0,0);
 expect(a.target).toBe(-4);expect(a.destroytime).toBe(-1);a.target=target.id;a.destroytime=2;a.fade=0;
 resolveEvent(a.object,'step')!(a,rt);expect([a.x,a.y,a.destroytime,a.live]).toEqual([20,30,1,true]);
 target.x=40;resolveEvent(a.object,'step')!(a,rt);expect([a.x,a.y,a.destroytime,a.live]).toEqual([40,30,0,false]);
});
it.each([1,2])('retains Chapter %i fading without target or expiry variables',chapter=>{
 const rt=new GmRuntime(bank);rt.globals.chapter=chapter;const a=rt.create(afterimageGrow,20,30);
 expect(Object.hasOwn(a,'target')).toBe(false);expect(Object.hasOwn(a,'destroytime')).toBe(false);
 resolveEvent(a.object,'step')!(a,rt);expect([a.x,a.y,a.imageXscale,a.imageYscale,a.imageAlpha,a.live]).toEqual([20,30,Math.fround(1.2),Math.fround(1.2),Math.fround(.9),true]);
});
