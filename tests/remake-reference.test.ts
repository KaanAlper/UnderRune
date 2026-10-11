import {describe,it,expect} from 'vitest';
import {GmRuntime} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
import {compareFrame,runParity,type TraceLine} from './parity/reference';
const bank=spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]});
const scene=()=>{const rt=new GmRuntime(bank,{seed:11});rt.create({name:'test',index:1},12,34);return rt;};
const line=(rt:GmRuntime,f=1):TraceLine=>({f,room:'battle',rng:rt.random.snapshot(),g:{},o:rt.instances.map(i=>[i.id,i.object.name,i.x,i.y,i.imageIndex,i.sprite??'',i.visible])});
describe('reference comparison rejects incomplete evidence',()=>{
 it('reports missing frames instead of silently passing a truncated recording',()=>{
  const rt=scene();const result=runParity(rt,new Map(),0,2,new Set(['test']),[]);
  expect(result.mismatch?.what).toMatch(/missing.*frame/i);expect(result.matched).toBe(0);
 });
 it('checks the sprite and visibility as well as position and frame number',()=>{
  const rt=scene(),ref=line(rt);ref.o[0][5]='other';expect(compareFrame(rt,ref,new Set(['test']),[])?.what).toMatch(/sprite/);
  ref.o[0][5]='';ref.o[0][6]=false;expect(compareFrame(rt,ref,new Set(['test']),[])?.what).toMatch(/visible/);
 });
});
