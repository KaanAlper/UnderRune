import {describe,it,expect} from 'vitest';
import {GmRuntime,type GmObjectDef} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
import {createChapter2Registry} from '../src/remake/host/chapter2';
import {neoResourceMetadata} from '../src/remake/bosses/spamton-neo/host-source';
import {heroKris} from '../src/remake/deltarune/battle';
import {deviceFailure,gameOverBg} from '../src/remake/deltarune/battle-end';
import chapter2Metadata from '../src/remake/host/chapter2-resources.json';

describe('Chapter 2 common registry',()=>{
 const fixture=()=>{const rt=new GmRuntime(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]}));rt.globals.chapter=2;return {rt,...createChapter2Registry(rt,{metadata:neoResourceMetadata,room:'room_test',scripts:{}})};};
 it('preserves resource identity, named unsupported boundaries and shared engine aliases',()=>{
  const {rt,object,finalize}=fixture();finalize();
  expect(object('obj_herokris').index).toBe(neoResourceMetadata.find(m=>m.name==='obj_herokris')!.index);
  const hero=rt.restore(object('obj_herokris'),100101,0,0);expect(rt.first(heroKris)).toBe(hero);
  expect(()=>rt.create(object('obj_queen_enemy'),400,120)).toThrow(/unavailable|not implemented/i);
  expect(()=>object('obj_missing')).toThrow('Chapter 2 resource not registered');
 });
 it('registers explicit factories against native ancestry and aliases pre-registration references',()=>{
  const {rt,object,register,finalize}=fixture(),old=object('obj_queen_enemy');
  const definition:GmObjectDef={name:'obj_queen_enemy',index:old.index,events:{create:s=>{s.tested=1;}}};register([definition]);finalize();
  const enemy=rt.create(object('obj_queen_enemy'),400,120);expect(enemy.tested).toBe(1);expect(rt.first(old)).toBe(enemy);expect(rt.first(definition)).toBe(enemy);
 });
 it('registers the canonical failure scene when GIGA retires inside the battle room',()=>{
  const rt=new GmRuntime(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]}));rt.globals.chapter=2;
  const {object,finalize}=createChapter2Registry(rt,{metadata:chapter2Metadata,room:'room_test'});rt.globals.flag=Array(700).fill(0);finalize();
  const screen=rt.create(object('DEVICE_FAILURE'),0,0);
  expect(screen.EVENT).toBe(0);expect(screen.text_timer).toBe(30);
  expect(rt.first(deviceFailure)).toBe(screen);expect(rt.first(gameOverBg)?.object).toBe(object('obj_gameoverbg'));
  expect(screen.object.index).toBe(chapter2Metadata.find(m=>m.name==='DEVICE_FAILURE')!.index);
 });
 it('stores camera coordinates as native float32 values at every view write',()=>{
  const {rt}=fixture();rt.view.y=-200.123456789;
  expect(rt.view.y).toBe(Math.fround(-200.123456789));
  rt.view.y+=.07123456789;
  expect(rt.view.y).toBe(Math.fround(Math.fround(-200.123456789)+.07123456789));
 });
 it('keeps virtual audio stream maps and pitch independent across battles',()=>{
  const a=fixture(),b=fixture();const self=a.rt.restore(a.object('obj_marker'),100100,0,0);
  const handle=a.host.call('snd_init',self,a.rt,['test.ogg']);a.host.call('snd_pitch',self,a.rt,[handle,0.7]);
  expect(a.rt.soundGetPitch!(handle)).toBe(0.7);expect(b.rt.soundGetPitch!(handle)).toBe(1);
 });
 it('changes the pitch of the playing voice as well as its deterministic registry value',()=>{
  const a=fixture(),seen:unknown[]=[];a.rt.sourceAudio={pitch:(...args:unknown[])=>seen.push(args)} as any;
  const self=a.rt.restore(a.object('obj_marker'),100100,0,0),handle=a.host.call('snd_init',self,a.rt,['test.ogg']);
  a.host.call('snd_pitch',self,a.rt,[handle,.65]);expect(seen).toEqual([['test',.65]]);expect(a.rt.soundGetPitch!(handle)).toBe(.65);
 });
 it('resolves inherited events and old aliases after later parent replacements',()=>{
  const {rt,object,register,finalize}=fixture(),old=object('obj_monsterparent');
  register([{name:'obj_test_child',index:99999,parent:old}]);
  register([{name:old.name,index:old.index,events:{create:s=>{s.inherited=1;}}}]);
  const intermediate=object(old.name);
  register([{name:old.name,index:old.index,events:{create:s=>{s.inherited=2;}}}]);finalize();
  expect(rt.create(object('obj_test_child'),0,0).inherited).toBe(2);
  expect(rt.create(old,0,0).inherited).toBe(2);expect(rt.create(intermediate,0,0).inherited).toBe(2);
 });
});
