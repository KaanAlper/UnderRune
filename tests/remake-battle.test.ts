import {describe,it,expect} from 'vitest';
import {spriteBank} from '../src/remake/gm/sprites';
import {defaultLoadout,type EquipmentSource} from '../src/game/loadout';
import {SourceBattle} from '../src/remake/host/battle';
import {heart,heroParent} from '../src/remake/deltarune/battle';
const empty={id:0,name:'',description:'',attack:0,defense:0,magic:0,allowed:[1,2,3,4]};
const source:EquipmentSource={armors:[empty],weapons:[empty],items:[{id:2,name:'ReviveMint',description:'',usable:true,target:1},{id:9,name:'ChocDiamond',description:'',usable:true,target:1}],bagCapacity:12};
const bank=spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]});
const create=(id='ch1-25')=>new SourceBattle(bank,source,defaultLoadout(),id);
const advance=(b:SourceBattle,n:number)=>{for(let i=0;i<n;i++){b.step();b.rt.draw();}};
describe('shared source battle flow',()=>{
 it('opens with the party and commands, without an active enemy attack',()=>{
  const b=create();expect(b.phase).toBe('intro');expect(b.rt.count(heroParent)).toBe(3);expect(b.rt.count(heart)).toBe(0);
  advance(b,30);expect(b.phase).toBe('command');expect(b.actor).toBe(0);expect(b.choices.map(c=>c.name)).toEqual(['FIGHT','ACT','ITEM','SPARE','DEFEND']);
 });
 it('returns to commands after defending through a pattern instead of declaring victory',()=>{
  const b=create();advance(b,30);for(let i=0;i<3;i++)b.select(4);
  expect(b.phase).toBe('enemyTalk');b.confirm();advance(b,20);expect(b.phase).toBe('enemy');b.rt.globals.chemg_god_mode=true;
  advance(b,270);expect(b.outcome).toBe(null);expect(b.phase).toBe('command');expect(b.turn).toBe(1);expect(b.rt.count(heart)).toBe(0);
 });
 it('strikes immediately on a successful bolt and retains other party bolts',()=>{
  const b=create();advance(b,30);for(let i=0;i<3;i++){b.select(0);b.confirm();}
  expect(b.phase).toBe('timing');advance(b,b.bolts[0].frame);const before=b.enemyHp;b.confirm();expect(b.enemyHp).toBeLessThan(before);
  expect(b.phase).toBe('timing');expect(b.bolts.some(x=>x.alive)).toBe(true);
 });
 it('Lancer equipment confirmation leads to a real two-person battle and bike attack',()=>{
  const b=create('ch1-2');advance(b,30);expect(b.party).toEqual([1,2]);b.select(4);b.confirm();advance(b,20);
  expect(b.phase).toBe('enemy');expect(b.rt.instances.some(i=>i.live&&i.object.name==='obj_lancerbike')).toBe(true);
 });
 it('uses a prepared battle item once with the game battle healing amount',()=>{
  const l=defaultLoadout();l.items=[9];const b=new SourceBattle(bank,source,l,'ch1-25');advance(b,30);b.rt.globals.hp[1]=10;
  b.select(2);b.select(0);b.select(0);b.select(4);b.select(4);
  expect(b.rt.globals.hp[1]).toBe(60);expect(b.bag).toEqual([]);
 });
 it('navigates the two-column ACT grid spatially',()=>{
  const b=create();advance(b,30);b.rt.globals.tension=250;b.select(1);b.confirm();b.move(0,1);expect(b.cursor).toBe(2);
 });
 it('uses each attacker bolt score for TP rather than Lancer auto-Susie points',()=>{
  const b=create('ch1-2');advance(b,30);b.select(0);b.confirm();const tp=b.rt.globals.tension;advance(b,b.bolts[0].frame);b.confirm();expect(b.rt.globals.tension-tp).toBe(15);
 });
 it('cancels a previous defender choice and restores reserved TP',()=>{
  const b=create();advance(b,30);b.select(4);expect(b.actor).toBe(1);expect(b.rt.globals.tension).toBe(40);b.cancel();expect(b.actor).toBe(0);expect(b.rt.globals.tension).toBe(0);expect(b.actions[0]).toBeNull();
 });
 it('battle ReviveMint fully revives a downed member and makes them targetable',()=>{
  const l=defaultLoadout();l.items=[2];const b=new SourceBattle(bank,source,l,'ch1-25');advance(b,30);b.rt.globals.hp[2]=-55;b.rt.globals.charcantarget[1]=0;b.rt.globals.chardead[1]=1;
  b.select(2);b.select(0);b.select(1);b.select(4);expect(b.rt.globals.hp[2]).toBe(110);expect(b.rt.globals.charcantarget[1]).toBe(1);expect(b.rt.globals.chardead[1]).toBe(0);
 });
});
