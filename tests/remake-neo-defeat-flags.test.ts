import {describe,it,expect} from 'vitest';
import {GmRuntime} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
import {spamtonNeo} from '../src/remake/bosses/spamton-neo/neo';

function scene(outcomes=[0,0,0],hp=100,fatal=0){
 const rt=new GmRuntime(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]}),{seed:11});
 const flag=Array(1000).fill(0);outcomes.forEach((v,i)=>{flag[51+i]=v;});flag[54]=700;
 rt.globals={flag,monstergold:[10,20,30,100],monsterexp:[3,4,5,50],monsterhp:[hp,100,100]};
 const enemy=rt.restore(spamtonNeo,100000,460,80,{myself:0,fatal});
 return {rt,enemy,flag,run:()=>rt.userEvent(enemy,3)};
}
const working=(s:ReturnType<typeof scene>['enemy'])=>[s._amt_add,s.d_i,s._frozened,s._violenced,s._spared,s._pacified];

describe('NEO defeat event source bookkeeping',()=>{
 it('retains all six working fields and resolves mixed outcomes in source priority order',()=>{
  const {rt,enemy,flag,run}=scene([6,3,2]);run();
  expect(working(enemy)).toEqual([3,3,1,0,1,1]);
  expect([flag[45],flag[50],flag[926],flag[700],flag[54]]).toEqual([1,2,0,2,0]);
  expect([rt.globals.monstergold[3],rt.globals.monsterexp[3]]).toEqual([134,53]);
 });
 it.each([
  {name:'violent fatal',outcomes:[0,3,6],hp:0,fatal:1,fields:[3,3,1,1,0,1],counters:[1,0,0,0,1,0],winner:1,gold:110},
  {name:'spared living',outcomes:[0,0,0],hp:100,fatal:0,fields:[1,3,0,0,1,0],counters:[0,1,0,0,0,0],winner:2,gold:110},
  {name:'pacified',outcomes:[3,0,6],hp:100,fatal:0,fields:[2,3,1,0,0,1],counters:[0,0,1,0,0,0],winner:3,gold:110},
  {name:'Susie finish counts without a category',outcomes:[5,0,0],hp:0,fatal:1,fields:[1,3,0,0,0,0],counters:[0,0,0,1,0,0],winner:0,gold:110},
  {name:'frozen',outcomes:[6,0,0],hp:0,fatal:0,fields:[1,3,1,0,0,0],counters:[0,0,0,0,0,1],winner:6,gold:134},
 ])('$name preserves rewards, counters and deferred result flag',({outcomes,hp,fatal,fields,counters,winner,gold})=>{
  const {rt,enemy,flag,run}=scene(outcomes,hp,fatal);run();
  expect(working(enemy)).toEqual(fields);expect(flag.slice(40,46)).toEqual(counters);
  expect([flag[50],flag[700],flag[54],rt.globals.monstergold[3],rt.globals.monsterexp[3]]).toEqual([winner,winner,0,gold,53]);
  expect(flag[926]).toBe(winner===6?1:0);
 });
 it('resets working fields each invocation and increments existing counters/rewards',()=>{
  const {rt,enemy,flag,run}=scene([1,0,0],0,1);run();flag[51]=6;flag[54]=701;run();
  expect(working(enemy)).toEqual([1,3,1,0,0,0]);expect([flag[40],flag[44],flag[45],flag[926],flag[701]]).toEqual([1,1,1,1,6]);
  expect([rt.globals.monstergold[3],rt.globals.monsterexp[3]]).toEqual([144,56]);
 });
 it('uses tolerant source comparisons for unset outcomes, zero HP, fatal and aggregate categories',()=>{
  const {enemy,flag,run}=scene([0.000004,3.000004,6.000004],0.000004,1.000004);run();
  expect(working(enemy)).toEqual([3,3,1,1,0,1]);expect([flag[40],flag[44],flag[50]]).toEqual([1,1,1]);
 });
});
