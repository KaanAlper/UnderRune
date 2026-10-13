import {describe,it,expect} from 'vitest';
import fs from 'node:fs';
import {GmRuntime,type GmObjectDef} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
import {chooseNeoAttack} from '../src/remake/bosses/spamton-neo/chooser';
const enemy:GmObjectDef={name:'obj_spamton_neo_enemy',index:702};
function setup(hp=4809,mercy=0){
 const rt=new GmRuntime(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]}),{seed:11});
 rt.globals={monsterhp:[hp],monstermaxhp:[4809],mercymod:[mercy]};
 const s=rt.create(enemy,460,80);Object.assign(s,{myself:0,phase:1,turn:0,phaseturn:0,rr:-1,difficulty:-1,hellmode:0,nothitduringphonehands:0,haveusedfinalattack:0,weirdpathendcon:0});
 return {rt,s};
}
describe('NEO source attack chooser',()=>{
 it('uses the actual normal route order, then repeats from the eighth turn without consuming RNG',()=>{
  const {rt,s}=setup(),rng=rt.random.snapshot(),sequence=[];
  for(let i=0;i<17;i++){chooseNeoAttack(s,rt);sequence.push([s.rr,s.difficulty]);}
  expect(sequence).toEqual([[0,1],[6,0],[2,0],[8,0],[8.5,0],[7,0],[2,2],[0,3],[7,0],[8.5,2],[8,1],[6,1],[0,3],[7,0],[8.5,2],[8,1],[6,1]]);
  expect(s.turn).toBe(17);expect(rt.random.snapshot()).toEqual(rng);
 });
 it('cascades HP phase changes in one event, resets only phase four, and follows its six-turn loop',()=>{
  const {rt,s}=setup(1200),sequence=[];
  for(let i=0;i<9;i++){chooseNeoAttack(s,rt);sequence.push([s.rr,s.difficulty]);}
  expect(s.phase).toBe(4);expect(sequence).toEqual([[2,1],[8,3],[9,0],[2,1],[7,0],[9,0],[2,1],[7,0],[9,0]]);
  expect(s.haveusedfinalattack).toBe(1);
 });
 it('preserves phonehands difficulty changes, strict finale thresholds and weird-route override',()=>{
  const {rt,s}=setup();s.hellmode=1;s.phaseturn=4;chooseNeoAttack(s,rt);expect([s.rr,s.difficulty]).toEqual([8.5,2]);
  s.phaseturn=9;chooseNeoAttack(s,rt);expect([s.rr,s.difficulty]).toEqual([8.5,1]);
  s.hellmode=0;s.nothitduringphonehands=1;s.phaseturn=9;chooseNeoAttack(s,rt);expect(s.difficulty).toBe(1);
  const low=setup(480,0);chooseNeoAttack(low.s,low.rt);expect([low.s.rr,low.s.difficulty,low.s.haveusedfinalattack,low.s.phaseturn]).toEqual([9,0,1,3]);
  low.s.weirdpathendcon=1;chooseNeoAttack(low.s,low.rt);expect(low.s.rr).toBe(5);
  const edge=setup(4809*.1,90);chooseNeoAttack(edge.s,edge.rt);expect(edge.s.haveusedfinalattack).toBe(0);
 });
 it('uses GameMaker comparison tolerance at the mercy phase boundary',()=>{
  const {rt,s}=setup(4809,25+2e-6);chooseNeoAttack(s,rt);expect(s.phase).toBe(1);
  rt.globals.mercymod[0]=25+.00002;chooseNeoAttack(s,rt);expect(s.phase).toBe(2);expect(s.phaseturn).toBe(2);
 });
});
const source='extracted/chapter2_windows/code/gml_Object_obj_spamton_neo_enemy_Other_10.gml';
describe.skipIf(!fs.existsSync(source))('NEO chooser against the installed source event',()=>{
 it('matches all native event statements through phase transitions and route overrides',()=>{
  // This source event uses only assignments and JS-compatible conditionals. Execute its unchanged text;
  // ordinary integer HP/mercy inputs avoid JS-versus-GML floating comparison differences.
  const native=new Function('global','state',`with(state){${fs.readFileSync(source,'utf8')}}`);
  for(const [hp,mercy] of [[4809,0],[3500,26],[2300,51],[1400,71],[400,91]]){
   const {rt,s}=setup(hp,mercy);const state=Object.fromEntries(['myself','phase','turn','phaseturn','rr','difficulty','hellmode','nothitduringphonehands','haveusedfinalattack','weirdpathendcon'].map(k=>[k,s[k]]));
   for(let i=0;i<25;i++){
    s.hellmode=state.hellmode=i%2;s.nothitduringphonehands=state.nothitduringphonehands=i%3===0?1:0;s.weirdpathendcon=state.weirdpathendcon=i===24?1:0;
    native(rt.globals,state);chooseNeoAttack(s,rt);
    for(const k of Object.keys(state))expect(s[k],`HP ${hp}, mercy ${mercy}, event ${i}, field ${k}`).toBe(state[k]);
   }
  }
 });
});
