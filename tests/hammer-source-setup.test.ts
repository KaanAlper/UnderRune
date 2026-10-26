import fs from 'node:fs';
import {describe,it,expect} from 'vitest';
import {GmRuntime,type GmInstance} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
import {executeNeoSource} from '../src/remake/bosses/spamton-neo/body-source';
import {resetSpearPattern,appendSpearPattern} from '../src/remake/bosses/hammer-of-justice/spear-pattern';
import {setupHammerMonster,HAMMER_ENCOUNTER,hammerHeroPositions} from '../src/remake/bosses/hammer-of-justice/setup';
import {setSourceText} from '../src/remake/host/text';
import {sourceEncounter} from '../src/remake/host/encounters';
const folder='extracted/chapter4_windows/code/';
const available=fs.existsSync(folder+'gml_GlobalScript_scr_spearpattern.gml');
const source=(name:string)=>fs.readFileSync(folder+name+'.gml','utf8');
function fixture(){const rt=new GmRuntime(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]}));return {rt,s:rt.create({name:'spear_test',index:1},0,0)};}
function execute(name:string,s:GmInstance,rt:GmRuntime,args:unknown[]=[]){executeNeoSource(source('gml_GlobalScript_'+name),s,rt,{object:n=>({name:n,index:100}),text:k=>k,call:n=>{throw Error('Unexpected source dependency: '+n);}},undefined,undefined,args,name);}
const queue=(s:GmInstance)=>Object.fromEntries(Object.entries(s).filter(([k])=>k.startsWith('list_attack')||['attackcount','attackcountmax','i'].includes(k)));
describe.skipIf(!available)('Hammer of Justice source setup',()=>{
 for(const room of ['room_battletest','room_dw_church_arena'])it(`matches source encounter positions in ${room}`,()=>{
  const {rt,s}=fixture();s.xx=17;s.yy=23;rt.globals={monsterinstancetype:[],monstertype:[],monstermakex:[],monstermakey:[],heromakex:[],heromakey:[],battlemsg:[]};
  const code=source('gml_GlobalScript_scr_encountersetup'),start=code.indexOf('case 160:')+'case 160:'.length,end=code.indexOf('case 161:',start);
  executeNeoSource(code.slice(start,end).replace(/break;\s*$/,''),s,rt,{room,object:n=>({name:n,index:100}),text:k=>k,call:n=>{throw Error(n);}});
  const g=rt.globals,[[name,type,x,y]]=HAMMER_ENCOUNTER.monsters;
  expect(g.monsterinstancetype[0].name).toBe(name);expect(g.monstertype[0]).toBe(type);expect([g.monstermakex[0],g.monstermakey[0]]).toEqual([17+x,23+y]);
  expect(hammerHeroPositions(room)).toEqual(g.heromakex.map((x:number,i:number)=>[x,g.heromakey[i]]));expect(g.battlemsg[0]).toBe('scr_encountersetup_slash_scr_encountersetup_gml_'+HAMMER_ENCOUNTER.intro);
 });
 it('resets exactly 100 slots, preserving longer array tails and the source caller loop variable',()=>{
  const a=fixture(),b=fixture();for(const s of [a.s,b.s]){s.list_attackdirection=Array(102).fill(7);s.attackcount=9;s.attackcountmax=12;}
  resetSpearPattern(a.s);execute('scr_spearpattern_reset',b.s,b.rt);expect(queue(a.s)).toEqual(queue(b.s));expect(a.s.i).toBe(100);expect(a.s.list_attackdirection[101]).toBe(7);
 });
 for(const direction of ['u','d','r','l','dr','dl','ur','ul','right1','right2','up1','up2','left1','left2','down1','down2','diag1','diag2','diag3','diag4','unknown',37]){
  for(const extra of [[],[9],[9,10]])it(`appends source alias ${direction} with ${5+extra.length} arguments`,()=>{
   const a=fixture(),b=fixture();for(const s of [a.s,b.s])resetSpearPattern(s);
   appendSpearPattern(a.s,direction,4,30,2,7,...extra);execute('scr_spearpattern',b.s,b.rt,[direction,4,30,2,7,...extra]);expect(queue(a.s)).toEqual(queue(b.s));
  });
 }
 it('preserves the original monster stats and disabled Susie ACT, without publishing an incomplete battle',()=>{
  const a=fixture(),b=fixture(),key=(n:number)=>'scr_monstersetup_slash_scr_monstersetup_gml_'+n+'_0';setSourceText(Object.fromEntries([2301,2311,2312].map(n=>[key(n),key(n)])));
  for(const {s,rt} of [a,b]){s.myself=0;rt.globals={monstertype:[105],monstername:[],monstermaxhp:[],monsterhp:[],monsterat:[],monsterdf:[],monsterexp:[],monstergold:[],sparepoint:[],canactsus:[Array(6).fill(0)],actnamesus:[Array(6).fill('')],actdesc:[Array(6).fill('')]};}
  expect(setupHammerMonster(a.s,a.rt)).toBe(true);const original=source('gml_GlobalScript_scr_monstersetup'),start=original.indexOf('if (global.monstertype[myself] == 105)'),end=original.indexOf('if (global.monstertype[myself] == 106)',start);
  executeNeoSource(original.slice(start,end),b.s,b.rt,{object:n=>({name:n,index:100}),text:k=>k,call:n=>{throw Error(n);}});
  expect(a.rt.globals).toEqual(b.rt.globals);expect(a.rt.globals.canactsus[0][0]).toBe(0);expect(HAMMER_ENCOUNTER.party).toEqual([2]);expect(sourceEncounter('ch4-160')).toBeUndefined();
 });
});
