import {it,expect} from 'vitest';
import {GmRuntime} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';

it('object with snapshots visit two forwards, but three or more backwards',()=>{
 const rt=new GmRuntime(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]}));
 const obj={name:'writer',index:1};
 const a=rt.create(obj,0,0),b=rt.create(obj,0,0);
 expect(rt.withInstances(obj).map(i=>i.id)).toEqual([a.id,b.id]);
 const c=rt.create(obj,0,0);
 expect(rt.withInstances(obj).map(i=>i.id)).toEqual([c.id,b.id,a.id]);
 // Ordinary creation-order queries keep their separate contract.
 expect(rt.all(obj).map(i=>i.id)).toEqual([a.id,b.id,c.id]);
});
