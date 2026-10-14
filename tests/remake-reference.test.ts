import {describe,it,expect} from 'vitest';
import {GmRuntime} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
import {compareFrame,compareState,runParity,type Dump,type TraceLine} from './parity/reference';
const bank=spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]});
const scene=()=>{const rt=new GmRuntime(bank,{seed:11});rt.create({name:'test',index:1},12,34);return rt;};
const line=(rt:GmRuntime,f=1):TraceLine=>({f,room:'battle',rng:rt.random.snapshot(),g:{},o:rt.instances.map(i=>[i.id,i.object.name,i.x,i.y,i.imageIndex,i.sprite??'',i.visible])});
function deadReference(rt:GmRuntime,value:number){
 const i=rt.instances[0];i.hitshot=value;
 const dump:Dump={frame:0,room:{name:'battle'},globalVariables:{},instances:[{
  instanceId:i.id,objectName:i.object.name,x:i.x,y:i.y,depth:i.depth,
  sprite:{name:i.sprite,imageIndex:i.imageIndex,imageSpeed:i.imageSpeed},scale:{x:i.imageXscale,y:i.imageYscale},
  angle:i.imageAngle,alpha:i.imageAlpha,blend:i.imageBlend,visible:i.visible,alarms:Object.fromEntries(i.alarm.map((v,k)=>[k,v])),
  selfVariables:{hitshot:-4},
 }]};
 return compareState(rt,dump,new Set(['test']),{sprites:[],sounds:[],fonts:[],objects:[],functions:[]});
}
describe('reference comparison rejects incomplete evidence',()=>{
 it('reports missing frames instead of silently passing a truncated recording',()=>{
  const rt=scene();const result=runParity(rt,new Map(),0,2,new Set(['test']),[]);
  expect(result.mismatch?.what).toMatch(/missing.*frame/i);expect(result.matched).toBe(0);
 });
 it('checks the sprite and visibility as well as position and frame number',()=>{
  const rt=scene(),ref=line(rt);ref.o[0][5]='other';expect(compareFrame(rt,ref,new Set(['test']),[])?.what).toMatch(/sprite/);
  ref.o[0][5]='';ref.o[0][6]=false;expect(compareFrame(rt,ref,new Set(['test']),[])?.what).toMatch(/visible/);
 });
 it('rejects never-allocated and fractional numbers instead of treating them as destroyed instance references',()=>{
  const rt=scene();
  expect(deadReference(rt,999999).join('\n')).toMatch(/hitshot/);
  expect(deadReference(rt,100000.5).join('\n')).toMatch(/hitshot/);
 });
 it('accepts a destroyed allocated reference but rejects a live one',()=>{
  const rt=scene(),shot=rt.create({name:'shot',index:2},0,0);
  expect(deadReference(rt,shot.id).join('\n')).toMatch(/hitshot/);
  rt.destroy(shot);expect(deadReference(rt,shot.id)).toEqual([]);
 });
});
