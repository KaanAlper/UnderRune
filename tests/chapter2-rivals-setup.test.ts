import fs from 'node:fs';
import {describe,it,expect} from 'vitest';
import {GmRuntime,type GmObjectDef} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
import {setupRivalMonster} from '../src/remake/bosses/chapter2-rivals/setup';
import {setSourceText} from '../src/remake/host/text';
import {executeNeoSource} from '../src/remake/bosses/spamton-neo/body-source';

const file='extracted/chapter2_windows/code/gml_GlobalScript_scr_monstersetup.gml';
const arrays=['monstername','monstermaxhp','monsterhp','monsterat','monsterdf','monsterexp','monstergold','sparepoint','mercymod','mercymax','monstertype'];
const matrices=['canact','actname','actactor','actcost','actdesc','canactsus','actnamesus','actdescsus','actcostsus','canactral','actnameral','actdescral','actcostral','canactnoe','actnamenoe','actsimul','actsimulsus','actsimulral'];
function fixture(type:number,lang:string){
 const rt=new GmRuntime(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]}));rt.globals={chapter:2,lang};
 for(const key of arrays)rt.globals[key]=[0,0,0];for(const key of matrices)rt.globals[key]=Array.from({length:3},()=>new Array(10).fill(0));
 rt.globals.monstertype[1]=type;const def:GmObjectDef={name:'setup_caller',index:9999};return {rt,s:rt.restore(def,100000,470,144,{myself:1}),def};
}
function block(code:string,type:number){const start=code.indexOf(`if (global.monstertype[myself] == ${type})`);let depth=0,opened=false;for(let i=start;i<code.length;i++){if(code[i]==='{'){depth++;opened=true;}if(code[i]==='}'){depth--;if(depth===0&&opened)return code.slice(start,i+1);}}throw Error('Missing setup block');}

describe.skipIf(!fs.existsSync(file))('rival monster setup matches source including actor slots and locale rules',()=>{
 const code=fs.existsSync(file)?fs.readFileSync(file,'utf8'):'';
 const texts=Object.fromEntries([...code.matchAll(/"(scr_monstersetup_slash_scr_monstersetup_gml_[^"]+)"/g)].map(match=>[match[1],match[1]]));
 for(const type of [37,38,39,43,45,46])for(const lang of ['en','ja'])for(const phase of [0,1])it(`matches type ${type}, language ${lang}, route phase ${phase}`,()=>{
  setSourceText(texts);const a=fixture(type,lang),b=fixture(type,lang);expect(setupRivalMonster(a.s,a.rt,phase)).toBe(true);
  // The legacy NEO-only comparison adapter fixes its side-B helper at zero. Supply this source script's
  // independently selected constant result; the setup block and its conditional expressions remain original.
  executeNeoSource(block(code,type).replaceAll('scr_sideb_get_phase()',String(phase)),b.s,b.rt,{object:()=>b.def,text:k=>k,call:name=>{throw Error(name);}});
  expect(a.rt.globals).toEqual(b.rt.globals);
 });
});
