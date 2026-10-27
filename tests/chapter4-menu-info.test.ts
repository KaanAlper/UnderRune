import fs from 'node:fs';
import {it,expect,describe} from 'vitest';
import {GmRuntime} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
import {executeNeoSource} from '../src/remake/bosses/spamton-neo/body-source';
import {spellInfo4,itemInfo4} from '../src/remake/deltarune/chapter4-menu-info';
import {setSourceText} from '../src/remake/host/text';
const dir='extracted/chapter4_windows/code/',ready=fs.existsSync(dir+'gml_GlobalScript_scr_spellinfo.gml');
function fixture(count:number,better:number,locked:boolean){const rt=new GmRuntime(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]}));rt.globals={chapter:4,plot:locked?110:0,flag:Array(9999).fill(0),charweapon:[0,0,7,0,13],maxtension:250};rt.globals.flag[1045]=count;rt.globals.flag[852]=better;const s=rt.create({name:'caller',index:1},0,0);return {s,rt};}
describe.skipIf(!ready)('Chapter 4 source menu information',()=>{
 for(const id of Array.from({length:12},(_,i)=>i))for(const count of [0,1,4,7,10,13,15])for(const better of [0,1])for(const locked of [false,true])it(`spell${id} count${count} better${better} locked${locked}`,()=>{
  setSourceText(new Proxy({},{get:(_o,k)=>String(k)}));const a=fixture(count,better,locked),b=fixture(count,better,locked);spellInfo4(a.s,a.rt,id);executeNeoSource(fs.readFileSync(dir+'gml_GlobalScript_scr_spellinfo.gml','utf8'),b.s,b.rt,{object:n=>({name:n,index:99}),text:k=>k,call:(n,_s,_r,args)=>{if(n==='scr_text')return args[0]===1458?'scr_text_slash_scr_text_gml_11462_0':'scr_text_slash_scr_text_gml_11467_0';throw Error(n);}},undefined,undefined,[id],'scr_spellinfo');
  for(const key of ['cost','spelltarget','spellname','spellnameb','spelldescb','spelldesc','spellanim','spellusable','spelltext'])expect(a.s[key]).toEqual(b.s[key]);
 });
 for(const id of [...Array.from({length:40},(_,i)=>i),60,61,62,63])it(`item${id}`,()=>{
  setSourceText(new Proxy({},{get:(_o,k)=>String(k)}));const a=fixture(0,0,false),b=fixture(0,0,false);itemInfo4(a.s,a.rt,id);executeNeoSource(fs.readFileSync(dir+'gml_GlobalScript_scr_iteminfo.gml','utf8'),b.s,b.rt,{object:n=>({name:n,index:99}),text:k=>k,call:(n,_s,_r,args)=>{if(n==='scr_text')return args[0]===1458?'scr_text_slash_scr_text_gml_11462_0':'scr_text_slash_scr_text_gml_11467_0';throw Error(n);}},undefined,undefined,[id],'scr_iteminfo');
  for(const key of ['usable','replaceable','value','itemtarget','itemnameb','itemdescb'])expect(a.s[key]).toEqual(b.s[key]);
 });
});
