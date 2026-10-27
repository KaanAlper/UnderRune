import fs from 'node:fs';
import {describe,it,expect} from 'vitest';
import {GmRuntime,type GmInstance,type GmObjectDef} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
import {executeNeoSource} from '../src/remake/bosses/spamton-neo/body-source';
import {initializeHammer} from '../src/remake/bosses/hammer-of-justice/init';
import {setSourceText} from '../src/remake/host/text';
const dir='extracted/chapter4_windows/code/',file=dir+'gml_Object_obj_hammer_of_justice_enemy_Create_0.gml',ready=fs.existsSync(file);
const original=ready?fs.readFileSync(file,'utf8'):'',read=(name:string)=>fs.readFileSync(dir+'gml_GlobalScript_'+name+'.gml','utf8');
const texts=Object.fromEntries([...original.matchAll(/"(obj_hammer_of_justice_enemy_slash_Create_0_gml_[^"]+)"/g)].map(m=>[m[1],m[1]]));
function fixture(retry:number,known:boolean,spells:number[]){
 const rt=new GmRuntime(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]})),objects=new Map<string,GmObjectDef>(),object=(n:string)=>{if(!objects.has(n))objects.set(n,{name:n,index:objects.size+1});return objects.get(n)!;};
 rt.globals={chapter:4,flag:Array(9999).fill(0),spell:[[],[],[...spells]],invc:1};rt.globals.flag[853]=retry;if(known){rt.globals.justice_reached_25_first_time=1;rt.globals.justice_attempts=4;rt.globals.justice_item=2;}
 const controller=rt.create(object('obj_battlecontroller'),0,0);controller.depth=-27;rt.create(object('obj_battleback'),0,0);return {rt,object,s:rt.create(object('obj_hammer_of_justice_enemy'),460,161)};
}
const state=(s:GmInstance)=>Object.fromEntries(Object.entries(s).filter(([k])=>!['frameCount','layerEntry','object'].includes(k)).map(([k,v])=>[k,typeof v==='boolean'?Number(v):v]));
describe.skipIf(!ready)('Hammer source Create',()=>{
 for(const retry of [0,1])for(const known of [false,true])for(const spells of [[4,...Array(11).fill(0)],[4,11,...Array(10).fill(0)],Array(12).fill(4)])it(`retry ${retry}, persistent ${known}, spell slots ${spells.join(',')}`,()=>{
  setSourceText(texts);const a=fixture(retry,known,spells),b=fixture(retry,known,spells);initializeHammer(a.s,a.rt,a.object);
  executeNeoSource(original,b.s,b.rt,{object:b.object,text:k=>k,scripts:Object.fromEntries(['scr_enemy_object_init','scr_spearpattern_reset','scr_spellget','scr_flag_get'].map(n=>[n,read(n)])),call:(n,_s,rt,args)=>{if(n==='variable_global_exists')return args[0] in rt.globals;throw Error(n);}});
  expect(state(a.s)).toEqual(state(b.s));expect(a.rt.globals).toEqual(b.rt.globals);expect(a.rt.instances.map(i=>[i.object.name,i.live])).toEqual(b.rt.instances.map(i=>[i.object.name,i.live]));expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());
 });
});
