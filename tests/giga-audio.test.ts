import {expect,it} from 'vitest';
import {GmRuntime,type GmObjectDef} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
import {freeGigaStream} from '../src/remake/bosses/giga-queen/audio';

it('frees the matching chapter-two stream holder and keeps other music streams',()=>{
 const rt=new GmRuntime(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]}),{seed:11}),freed:(number|string)[]=[];
 const holder:GmObjectDef={name:'obj_astream',index:186,events:{destroy:(s)=>{freed.push(s.mystream);}}};
 const caller=rt.restore({name:'obj_bq_baseball_final',index:794},100001,0,0,{});
 const music=rt.restore(holder,100002,0,0,{mystream:101,bstream:0});
 const other=rt.restore(holder,100003,0,0,{mystream:202,bstream:0});
 freeGigaStream(caller,rt,()=>holder,101);
 expect(caller._xstream).toBe(101);expect(music.live).toBe(false);expect(other.live).toBe(true);
 expect(other.bstream).toBe(101);expect(freed).toEqual([101]);
});

it('destroys three matching holders in the native with-instance order',()=>{
 const rt=new GmRuntime(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]})),seen:number[]=[];
 const holder:GmObjectDef={name:'obj_astream',index:186,events:{destroy:s=>{seen.push(s.id);}}};
 const caller=rt.restore({name:'caller',index:999},100001,0,0,{});
 for(const id of [100002,100003,100004])rt.restore(holder,id,0,0,{mystream:101,bstream:0});
 freeGigaStream(caller,rt,()=>holder,101);expect(seen).toEqual([100004,100003,100002]);
});
