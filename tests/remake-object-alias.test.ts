import {it,expect} from 'vitest';
import {GmRuntime,type GmObjectDef} from '../src/remake/gm/runtime';
import {spriteBank,type RawSprite} from '../src/remake/gm/sprites';
const spr:RawSprite={name:'mask',width:10,height:10,frames:1,originX:0,originY:0,bboxMode:1,left:0,right:9,top:0,bottom:9,sepMasks:0,special:false,playbackSpeed:1,playbackType:0};
const runtime=()=>new GmRuntime(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[spr]}));
it('Chapter 2 canonical definitions are created and queried through shared Chapter 1 references',()=>{
 const original:GmObjectDef={name:'obj_heart',index:313},canonical:GmObjectDef={name:'obj_heart',index:636,sprite:'mask',events:{create:s=>{s.source=2;}}};
 const rt=runtime();rt.installObjectAliases([[original,canonical]]);const h=rt.create(original,20,30);
 expect(h.object).toBe(canonical);expect(h.source).toBe(2);expect(rt.first(original)).toBe(h);expect(rt.first(canonical)).toBe(h);expect(rt.count(original)).toBe(1);expect(rt.exists(original)).toBe(true);
 expect(()=>rt.installObjectAliases([])).toThrow(/before.*instances/);
});
it('collision dispatch resolves old targets to Chapter 2 indices and keeps target-specific handlers',()=>{
 const a:GmObjectDef={name:'targetA',index:10,sprite:'mask'},b:GmObjectDef={name:'targetB',index:20,sprite:'mask'};
 const a2={...a,index:200},b2={...b,index:100};const seen:string[]=[];
 const collider:GmObjectDef={name:'collider',index:300,sprite:'mask',collisions:[{target:a,run:()=>seen.push('a')},{target:b,run:()=>seen.push('b')}]};
 const rt=runtime();rt.installObjectAliases([[a,a2],[b,b2]]);rt.create(collider,0,0);rt.create(a,0,0);rt.create(b,0,0);rt.step();
 expect(seen).toEqual(['b','a']);expect(rt.placeMeeting(rt.first(collider)!,0,0,a)).toBe(true);
});
it('aliases reject incompatible object identities and preserve restoration without running Create',()=>{
 const rt=runtime(),a:GmObjectDef={name:'a',index:1},wrong:GmObjectDef={name:'b',index:2};expect(()=>rt.installObjectAliases([[a,wrong]])).toThrow(/identity/);
 let created=0;const a2:GmObjectDef={name:'a',index:21,events:{create:()=>created++}};rt.installObjectAliases([[a,a2]]);
 const restored=rt.restore(a,100001,1,2,{points:5});expect(restored.object).toBe(a2);expect(rt.all(a)).toEqual([restored]);expect(created).toBe(0);
});
