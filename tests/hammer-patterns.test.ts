import fs from 'node:fs';
import {describe,it,expect} from 'vitest';
import {GmRuntime,type GmInstance} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
import {executeNeoSource} from '../src/remake/bosses/spamton-neo/body-source';
import {resetSpearPattern} from '../src/remake/bosses/hammer-of-justice/spear-pattern';
import {buildHammerPattern} from '../src/remake/bosses/hammer-of-justice/patterns';
const dir='extracted/chapter4_windows/code/',file=dir+'gml_Object_obj_hammer_of_justice_enemy_Other_10.gml',ready=fs.existsSync(file);
const original=ready?fs.readFileSync(file,'utf8'):'',append=ready?fs.readFileSync(dir+'gml_GlobalScript_scr_spearpattern.gml','utf8'):'';
const patterns=[...new Set([...original.matchAll(/attackpattern == ([0-9.]+)/g)].map(m=>Number(m[1])))];
function fixture(pattern:number,turn:number,seed:number){
 const rt=new GmRuntime(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]}),{seed}),s=rt.create({name:'obj_hammer_of_justice_enemy',index:1},460,161);
 Object.assign(s,{attackpattern:pattern,trueturn:turn,turn:turn,boxoffset:false,reachedendphase:0,swingdownbeatspeed:23});resetSpearPattern(s);return {rt,s};
}
const state=(s:GmInstance)=>Object.fromEntries(Object.entries(s).filter(([k])=>!['frameCount','layerEntry','object'].includes(k)).map(([k,v])=>[k,typeof v==='boolean'?Number(v):v]));
function compare(pattern:number,turn:number,seed:number){
 const a=fixture(pattern,turn,seed),b=fixture(pattern,turn,seed),actualLog:string[]=[],expectedLog:string[]=[];
 let actualError:unknown,expectedError:unknown;
 try{buildHammerPattern(a.s,a.rt,t=>actualLog.push(t));}catch(error){actualError=error;}
 try{executeNeoSource(original,b.s,b.rt,{object:n=>({name:n,index:1}),text:k=>k,scripts:{scr_spearpattern:append},call:(name,_s,_rt,args)=>{
  if(name==='scr_debug_print'){expectedLog.push(args[0]);return;}throw Error('Unexpected pattern dependency: '+name);
 }});}catch(error){expectedError=error;}
 if(pattern===5.5&&turn<20){expect(String(actualError)).toContain('prev');expect(String(expectedError)).toContain('prev');}
 else{expect(actualError).toBeUndefined();expect(expectedError).toBeUndefined();}
 expect(state(a.s)).toEqual(state(b.s));expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());expect(actualLog).toEqual(expectedLog);
}
describe.skipIf(!ready)('Hammer source attack scheduling',()=>{
 for(const seed of [1,11,47])for(const pattern of patterns)it(`pattern ${pattern}, seed ${seed}: exact queue, caller state and RNG`,()=>compare(pattern,0,seed));
 for(let turn=0;turn<=23;turn++)it(`source turn progression ${turn}`,()=>compare(0,turn,11));
});
