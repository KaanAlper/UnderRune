import fs from 'node:fs';
import {describe,it,expect} from 'vitest';
import {GmRuntime,type GmObjectDef} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
import {setupFieldMonster,FIELD_ENCOUNTERS} from '../src/remake/bosses/chapter2-field/setup';
import {setSourceText} from '../src/remake/host/text';
import {executeNeoSource} from '../src/remake/bosses/spamton-neo/body-source';
const file='extracted/chapter2_windows/code/gml_GlobalScript_scr_monstersetup.gml';
const prefix='scr_monstersetup_slash_scr_monstersetup_gml_';
function fixture(type:number,party:number[]){
 const rt=new GmRuntime(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]}));rt.globals={chapter:2,char:party};
 for(const k of ['monstername','monstermaxhp','monsterhp','monsterat','monsterdf','monsterexp','monstergold','sparepoint','mercymod','mercymax','monstertype'])rt.globals[k]=[0,0,0];
 for(const suffix of ['','sus','ral','noe'])for(const k of ['canact','actname','actdesc','actcost','actactor','actsimul'])rt.globals[k+suffix]=Array.from({length:3},()=>Array(10).fill(0));
 rt.globals.monstertype[1]=type;const def:GmObjectDef={name:'setup_caller',index:9000};return {rt,s:rt.restore(def,100000,450,100,{myself:1}),def};
}
function texts(){const result:Record<string,string>={};for(let i=0;i<1500;i++)for(const suffix of ['0','0_b','1'])result[prefix+i+'_'+suffix]=prefix+i+'_'+suffix;setSourceText(result);}
function block(code:string,type:number){const start=code.indexOf(`if (global.monstertype[myself] == ${type})`);let depth=0,opened=false;for(let i=start;i<code.length;i++){if(code[i]==='{'){depth++;opened=true;}if(code[i]==='}'){depth--;if(depth===0&&opened)return code.slice(start,i+1);}}throw Error('Missing field setup block');}
describe('field source setup is portable and distinguishes real modes',()=>{
 it('sets source combat stats and ACT actor choices for all five field monster types',()=>{texts();for(const [type,hp,at,gold,spare] of [[32,240,8,75,20],[33,240,8,79,20],[40,1753,11,300,5],[42,1367,10,200,5],[44,1753,10,200,0]]){const {rt,s}=fixture(type,[1,2,3]);expect(setupFieldMonster(s,rt)).toBe(true);expect([rt.globals.monsterhp[1],rt.globals.monsterat[1],rt.globals.monstergold[1],rt.globals.sparepoint[1]]).toEqual([hp,at,gold,spare]);expect(rt.globals.canact[1][0]).toBe(1);}});
 it('changes Tasque and Werewire ACT/stat setup for actual Noelle/early-story parties',()=>{texts();const noelle=fixture(32,[1,4,0]);setupFieldMonster(noelle.s,noelle.rt);expect([noelle.rt.globals.actactor[1][2],noelle.rt.globals.canact[1][3]]).toEqual([5,0]);const early=fixture(33,[1,2,0]);setupFieldMonster(early.s,early.rt);expect(early.rt.globals.monsterat[1]).toBe(5);});
 it('does not treat the unused double copy or the Dojo final round as story encounters',()=>{expect(FIELD_ENCOUNTERS[65].kind).toBe('unused');expect(FIELD_ENCOUNTERS[94].kind).toBe('dojo-final-round');expect(FIELD_ENCOUNTERS[89].kind).toBe('dojo');expect(FIELD_ENCOUNTERS[81].monsters).toEqual([['obj_werewerewire_enemy',40,482,164]]);});
});
describe.skipIf(!fs.existsSync(file))('field setup compared with local original blocks',()=>{
 for(const type of [32,33,40,42,44])for(const party of [[1,2,3],[1,4,0],[1,2,0]])it(`matches type ${type}, party ${party}`,()=>{
  texts();const a=fixture(type,party),b=fixture(type,party);expect(setupFieldMonster(a.s,a.rt)).toBe(true);executeNeoSource(block(fs.readFileSync(file,'utf8'),type),b.s,b.rt,{object:()=>b.def,text:k=>k,call:(name,_s,r,args)=>{if(name==='scr_havechar')return r.globals.char.includes(args[0]);throw Error(name);}});expect(a.rt.globals).toEqual(b.rt.globals);
 });
});
