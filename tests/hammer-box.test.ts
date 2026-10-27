import fs from 'node:fs';
import {it,expect} from 'vitest';
import {GmRuntime,type GmObjectDef} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
import {constrainHammerSoul} from '../src/remake/bosses/hammer-of-justice/box';
import {executeNeoSource} from '../src/remake/bosses/spamton-neo/body-source';
const original=fs.readFileSync('extracted/chapter4_windows/code/gml_Object_obj_hammer_of_justice_enemy_Step_2.gml','utf8');
for(const squish of [false,true])for(const [x,y] of [[0,0],[320,170],[999,999],[109,132],[110,133],[515,187],[516,188]])it(`source compressed-box boundary (${x},${y}), enabled ${squish}`,()=>{
 const create=()=>{const rt=new GmRuntime(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]})),defs=new Map<string,GmObjectDef>(),object=(name:string)=>{if(!defs.has(name))defs.set(name,{name,index:defs.size+1});return defs.get(name)!;};const s=rt.create(object('enemy'),460,161);s.squishbox=squish;const soul=rt.create(object('obj_heart'),x,y);rt.create(object('obj_growtangle'),320,170);return {rt,s,soul,object};};
 const a=create(),b=create();constrainHammerSoul(a.s,a.rt,a.object);executeNeoSource(original,b.s,b.rt,{object:b.object,text:k=>k,call:n=>{throw Error(n);}});expect([a.soul.x,a.soul.y]).toEqual([b.soul.x,b.soul.y]);
});
