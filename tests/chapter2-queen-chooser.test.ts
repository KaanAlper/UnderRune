import {describe,expect,it} from 'vitest';
import fs from 'node:fs';
import {GmRuntime,type GmObjectDef} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
import {advanceQueenPhase,chooseQueenAttack} from '../src/remake/bosses/queen/chooser';
const enemy:GmObjectDef={name:'obj_queen_enemy',index:1},plug:GmObjectDef={name:'obj_berdlyplug_enemy',index:2};
function setup(phase=1,withPlug=true){
 const rt=new GmRuntime(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]}),{seed:13});
 rt.globals={monsterhp:[1510],monstermaxhp:[1510]};
 const s=rt.create(enemy,470,120);Object.assign(s,{myself:0,phase,turn:0,phaseturn:0,rr:0,difficulty:0,usewineattack:0,usefinalattack:0,beatwine2nodamage:0,bardlymercy:0,wirescut:0,shieldhp:0,shieldmaxhp:0,shieldacthp:0,shieldactmaxhp:0,shieldsize:7,targetmercy:25});
 if(withPlug)rt.create(plug,512,36);return {rt,s};
}
describe('Queen phase and attack events',()=>{
 it('uses the original seven-turn early sequence without random draws',()=>{
  const {rt,s}=setup(),rng=rt.random.snapshot(),sequence=[];
  for(let i=0;i<7;i++){chooseQueenAttack(s,rt,plug);sequence.push([s.rr,s.difficulty]);}
  expect(sequence).toEqual([[7,0],[3,0],[6,0],[8,0],[4,0],[9,0],[8,4]]);expect(rt.random.snapshot()).toEqual(rng);
 });
 it('uses the longer late-phase sequence then draws from the later five choices',()=>{
  const {rt,s}=setup(3),sequence=[];for(let i=0;i<12;i++){chooseQueenAttack(s,rt,plug);sequence.push([s.rr,s.difficulty]);}
  expect(sequence.slice(7)).toEqual([[4,1],[7,1],[6,1],[9,1],[8,5]]);
  chooseQueenAttack(s,rt,plug);expect(s.phaseturn).toBe(13);expect(s.difficulty).toBeGreaterThan(0);
 });
 it('replaces the controlled Berdly attack when his plug actor is absent',()=>{
  const {rt,s}=setup(1,false);chooseQueenAttack(s,rt,plug);expect(s.rr).toBe(5);
 });
 it('does not count wine/finale insertions as scheduled turns and final attack overrides wine',()=>{
  const {rt,s}=setup(4);s.usewineattack=1;s.beatwine2nodamage=1;chooseQueenAttack(s,rt,plug);
  expect([s.rr,s.difficulty,s.phaseturn,s.turn]).toEqual([2,2,0,1]);
  s.usewineattack=1;s.usefinalattack=1;chooseQueenAttack(s,rt,plug);
  expect([s.rr,s.difficulty,s.phaseturn,s.usefinalattack,s.usewineattack]).toEqual([1,0,-1,2,0]);
 });
 it('cascades phase transitions, retaining phaseturn and selecting the last shield size',()=>{
  const {rt,s}=setup();s.bardlymercy=75;s.phaseturn=5;advanceQueenPhase(s,rt);
  expect([s.phase,s.shieldhp,s.shieldacthp,s.shieldsize,s.targetmercy,s.phaseturn]).toEqual([4,500,8,12,100,5]);
 });
 it('uses inclusive mercy thresholds and strict HP thresholds with GameMaker tolerance',()=>{
  const {rt,s}=setup();rt.globals.monsterhp[0]=1510*.75;advanceQueenPhase(s,rt);expect(s.phase).toBe(1);
  s.bardlymercy=25-2e-6;advanceQueenPhase(s,rt);expect(s.phase).toBe(2);
 });
});
const folder='extracted/chapter2_windows/code/';
describe.skipIf(!fs.existsSync(folder+'gml_Object_obj_queen_enemy_Other_10.gml'))('Queen events against installed source',()=>{
 it.each([1,2,3,4])('matches chooser fields and RNG at phase %i through inserted attacks',phase=>{
  const original=new Function('state','instance_exists','irandom',`with(state){${fs.readFileSync(folder+'gml_Object_obj_queen_enemy_Other_10.gml','utf8')}}`);
  for(const exists of [false,true]){
   const a=setup(phase,exists),b=setup(phase,exists),state:Record<string,any>={...Object.fromEntries(Object.keys(a.s).filter(k=>!k.startsWith('$')).map(k=>[k,a.s[k]])),obj_berdlyplug_enemy:plug};
   for(let turn=0;turn<40;turn++){
    for(const s of [a.s,state]){s.usewineattack=turn%7===0?1:0;s.usefinalattack=turn%11===0?1:0;s.beatwine2nodamage=turn%2;}
    original(state,()=>exists,(n:number)=>b.rt.random.irandom(n));chooseQueenAttack(a.s,a.rt,plug);
    for(const key of ['turn','phaseturn','rr','difficulty','usewineattack','usefinalattack'])expect(a.s[key],`${phase}, ${exists}, ${turn}, ${key}`).toBe(state[key]);
    expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());
   }
  }
 });
 it('matches phase event through HP and mercy boundaries',()=>{
  const original=new Function('state','global',`with(state){${fs.readFileSync(folder+'gml_Object_obj_queen_enemy_Other_12.gml','utf8')}}`);
  for(const hp of [1510,1132,755,754,378,377])for(const mercy of [0,24,25,49,50,74,75,100]){
   const {rt,s}=setup();rt.globals.monsterhp[0]=hp;s.bardlymercy=mercy;
   const state=Object.fromEntries(Object.keys(s).filter(k=>!k.startsWith('$')).map(k=>[k,s[k]]));original(state,rt.globals);advanceQueenPhase(s,rt);
   for(const k of ['phase','usewineattack','wirescut','shieldhp','shieldmaxhp','shieldacthp','shieldactmaxhp','shieldsize','targetmercy'])expect(s[k],`${hp}, ${mercy}, ${k}`).toBe(state[k]);
  }
 });
});
