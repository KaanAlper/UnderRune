import {beforeEach,describe,expect,it} from 'vitest';
import fs from 'node:fs';
import {EngineBattle} from '../src/remake/host/engine';
import {installNeoHost} from '../src/remake/host/neo';
import {defaultLoadout,type EquipmentSource} from '../src/game/loadout';
import {loadSprites} from './parity/reference';
import {setSourceText} from '../src/remake/host/text';
import {localizationDefaults} from '../tools/source-localization.mjs';
import {heroParent,heroKris} from '../src/remake/deltarune/battle';
import {findController} from '../src/remake/deltarune/controller';
import {resolveEvent} from '../src/remake/gm/runtime';
import {executeNeoSource} from '../src/remake/bosses/spamton-neo/body-source';
import {destroyWriters} from '../src/remake/deltarune/writer';
import {sneoBulletController} from '../src/remake/bosses/spamton-neo/bullet-controller';
import {dbulletController} from '../src/remake/bosses/spamton-neo/pending';

const folder='extracted/chapter2_windows/code';
const available=fs.existsSync(folder)&&fs.existsSync('extracted/chapter2_windows/sprites.json');
const text=available?Object.assign({},...fs.readdirSync(folder).filter(f=>f.endsWith('.gml')).map(f=>localizationDefaults(fs.readFileSync(`${folder}/${f}`,'utf8')))):{};
const gear={id:0,name:'Default',description:'',attack:0,defense:0,magic:0,allowed:[1,2,3]};
const equipment:EquipmentSource={armors:[gear],weapons:[gear],items:[],bagCapacity:12};
const create=(id='ch2-61-weird')=>new EngineBattle(loadSprites(2),equipment,defaultLoadout(),id,11,{development:true,neoHost:installNeoHost,rage:id.endsWith('weird')});
const frame=(b:EngineBattle,n=1)=>{for(let i=0;i<n;i++){b.step();b.rt.draw();}};
beforeEach(()=>setSourceText(text));

describe.skipIf(!available)('solo Kris NEO route',()=>{
 it('uses the fountain battle, source party and solo ACTs rather than the team coaster scene',()=>{
  const b=create();frame(b,30);const rt=b.rt,g=rt.globals,e=b.enemy!;
  expect(b.party).toEqual([1]);expect(g.char).toEqual([1,0,0]);expect(rt.count(heroParent)).toBe(1);
  expect(rt.first(heroKris)?.y).toBe(173);expect(rt.instances.filter(s=>s.live&&s.object.name==='obj_coaster')).toHaveLength(0);
  expect(g.monsterdf[0]).toBe(-27);expect(g.actcost[0].slice(0,3)).toEqual([0,62,80]);
  expect(g.actname[0].slice(0,3)).toEqual([text.scr_monstersetup_slash_scr_monstersetup_gml_1614_0,text.scr_monstersetup_slash_scr_monstersetup_gml_1643_0,text.scr_monstersetup_slash_scr_monstersetup_gml_1649_0]);
  expect(findController(rt)?.cantspare[0]).toBe(1);expect(e.cantspareinit).toBe(1);
 });
 it('starts the source defense transition at ten percent HP and clamps HP at one',()=>{
  const b=create();frame(b,30);const g=b.rt.globals,e=b.enemy!;
  g.monsterhp[0]=0;g.myfight=-1;g.mnfight=1;e.talked=0;
  frame(b);expect(g.monsterhp[0]).toBe(1);expect(e.weirdpathendtimer).toBe(1);expect(e.talked).toBe(-1);expect(e.endcon).toBe(0);
  frame(b,90);expect(e.weirdpathendcon).toBe(2);expect(e.ballooncon).toBe(28);
 });
 it('enables rage only in its runtime and leaves a later normal battle unchanged',()=>{
  const weird=create();frame(weird,30);const e=weird.enemy!;
  for(let i=0;i<6;i++)weird.rt.userEvent(e,4);
  expect(e.hellmode).toBe(1);expect(weird.rt.globals.monsterat[0]).toBe(13.5);
  const normal=create('ch2-61');frame(normal,30);for(let i=0;i<9;i++)normal.rt.userEvent(normal.enemy!,4);
  expect(normal.enemy!.hellmode).toBe(0);expect(normal.rt.globals.monsterat[0]).toBe(13);expect(normal.party).toEqual([1,2,3]);
 });
 it('lands both source X-Slash hits and restores Kris before ending the ACT',()=>{
  const b=create();frame(b,30);const rt=b.rt,g=rt.globals,e=b.enemy!,before=g.monsterhp[0];
  g.myfight=3;e.acting=2;e.actcon=0;frame(b);
  const first=g.monsterhp[0];expect(first).toBeLessThan(before);expect(e.actcon).toBe(21);
  frame(b,14);expect(before-g.monsterhp[0]).toBe((before-first)*2);expect(e.actcon).toBe(23);
  frame(b,14);expect(rt.first(heroKris)!.imageAlpha).toBe(1);
 });
 it('heals with FriedPipis once, after its full 45-frame animation',()=>{
  const b=create();frame(b,30);const rt=b.rt,g=rt.globals,e=b.enemy!;g.hp[1]=1;g.myfight=3;e.acting=3;e.actcon=0;
  frame(b);expect(e.actcon).toBe(31);const pipis=rt.instances.find(s=>s.live&&s.object.name==='obj_sneo_friedpipis')!;
  expect(pipis.sprite).toBe('spr_pipis_egg');expect(g.hp[1]).toBe(1);
  frame(b,44);expect(g.hp[1]).toBe(1);frame(b);expect(g.hp[1]).toBe(Math.min(121,g.maxhp[1]));expect(pipis.live).toBe(false);
 });
 it('finishes the Noelle call sequence instead of falling into the normal ending',()=>{
  const b=create();frame(b,30);const rt=b.rt,g=rt.globals,e=b.enemy!;
  g.myfight=3;e.acting=1;e.actcon=0;e.savemeactcon=5;e.weirdpathendcon=7;
  frame(b);expect(e.savemeactcon).toBe(6);
  for(let i=0;i<550&&!b.outcome;i++){destroyWriters(rt);frame(b);}
  expect(b.ending??b.outcome).toBe('victory');expect(e.endcon).toBe(0);
 });
 it('uses the high-defense FIGHT amount for HP, the number and enemy recoil alike',()=>{
  const b=create();frame(b,30);const rt=b.rt,g=rt.globals,e=b.enemy!,hero=rt.first(heroKris)!;
  e.weirdpathendcon=2;hero.points=150;g.chartarget[0]=0;const before=g.monsterhp[0];resolveEvent(hero.object,'alarm1')!(hero,rt);
  expect(before-g.monsterhp[0]).toBe(10);expect(hero.damage).toBe(10);expect(e.hurtamt).toBe(10);
 });
 it('uses the solo wireheart target and 80-percent attack multiplier',()=>{
  const b=create();frame(b,30);const rt=b.rt,g=rt.globals,e=b.enemy!;
  const dc=rt.create(sneoBulletController,e.x,e.y);dc.type=1.5;dc.target=0;
  Object.assign(e,{partmode:34,difficulty:0,makeheart:1,makeheartinit:0,heart_release_con:0});g.turntimer=500;
  rt.draw();const wire=rt.instances.find(s=>s.live&&s.object.name==='obj_sneo_wireheart')!;
  expect(wire.target).toBe(0);expect(wire.damage).toBe(52);
 });
 it('draws the source blue and teal defense flames',()=>{
  const b=create();frame(b,30);const e=b.enemy!,flames:number[]=[];
  b.rt.gfx={sprite:(name,_frame,_x,_y,_xs,_ys,_a,color)=>{if(name==='spr_bhero')flames.push(color);},rect:()=>{},line:()=>{},text:()=>{},circle:()=>{}};
  e.specialcon=1;resolveEvent(e.object,'draw')!(e,b.rt);expect(flames).toEqual([0xff0000,0x808000]);
 });
 it('bursts the three ending Pipis into 54 shootable source bullets, retaining their fixed damage',()=>{
  const b=create();frame(b,30);const rt=b.rt,e=b.enemy!;
  const dc=rt.create(dbulletController,e.x,e.y);Object.assign(dc,{type:51,damage:3,target:0,btimer:44});
  resolveEvent(dc.object,'step')!(dc,rt);
  const bullets=rt.instances.filter(s=>s.live&&s.object.name==='obj_sneo_weird_end_pipis_bullet');
  expect(bullets).toHaveLength(54);expect(bullets.every(s=>s.damage===16&&s.target===0)).toBe(true);
  expect(bullets.slice(0,18).map(s=>s.speed)).toEqual([...Array(9).fill(6),...Array(9).fill(10)]);
 });
 for(const state of [{acting:2,actcon:0},{acting:0,actcon:22},{acting:3,actcon:0},{acting:1,actcon:0,savemeactcon:1},{acting:1,actcon:0,savemeactcon:5},{acting:0,actcon:106},{acting:0,actcon:110},{acting:0,actcon:114}])it('matches the installed source Step for '+JSON.stringify(state),()=>{
  const actual=create();let referenceHost!:ReturnType<typeof installNeoHost>;
  const reference=new EngineBattle(loadSprites(2),equipment,defaultLoadout(),'ch2-61-weird',11,{development:true,neoHost:(rt,options)=>referenceHost=installNeoHost(rt,options),rage:true});
  for(const b of [actual,reference]){frame(b,30);b.rt.globals.myfight=3;Object.assign(b.enemy!,state);}
  resolveEvent(actual.enemy!.object,'step')!(actual.enemy!,actual.rt);
  executeNeoSource(fs.readFileSync(`${folder}/gml_Object_obj_spamton_neo_enemy_Step_0.gml`,'utf8'),reference.enemy!,reference.rt,referenceHost.host,undefined,'step');
  for(const key of ['acting','actcon','savemeactcon','weirdpathendcon','talktimer','caster','damage','dm','krs','att','dmgwriter'])expect(key in actual.enemy!?actual.enemy![key]:undefined,key).toEqual(key in reference.enemy!?reference.enemy![key]:undefined);
  for(const key of ['monsterhp','hp','hittarget','battlemsg'])expect(actual.rt.globals[key],key).toEqual(reference.rt.globals[key]);
  expect(actual.rt.random.snapshot()).toEqual(reference.rt.random.snapshot());
 });
 const talkStates=[...Array.from({length:11},(_,balloonorder)=>({talked:0,balloonorder})),...Object.keys({16:1,17:1,18:1,19:1,20:1,21:1,22:1,23:1,24:1,28:1,29:1,30:1,31:1,32:1,33:1,35:1,36:1,37:1,38:1,39:1,40:1,41:1,42:1,43:1,44:1,45:1}).map(ballooncon=>({talked:.6,ballooncon:Number(ballooncon)}))];
 for(const state of talkStates)it('matches all source talk fields for '+JSON.stringify(state),()=>{
  const actual=create();let referenceHost!:ReturnType<typeof installNeoHost>;
  const reference=new EngineBattle(loadSprites(2),equipment,defaultLoadout(),'ch2-61-weird',11,{development:true,neoHost:(rt,options)=>referenceHost=installNeoHost(rt,options),rage:true});
  for(const b of [actual,reference]){frame(b,30);b.rt.globals.myfight=-1;b.rt.globals.mnfight=1;Object.assign(b.enemy!,state);destroyWriters(b.rt);}
  resolveEvent(actual.enemy!.object,'step')!(actual.enemy!,actual.rt);
  executeNeoSource(fs.readFileSync(`${folder}/gml_Object_obj_spamton_neo_enemy_Step_0.gml`,'utf8'),reference.enemy!,reference.rt,referenceHost.host,undefined,'step');
  // The diagnostic interpreter eagerly allocates arrays found in unexecuted ACT branches.
  // Native replay below has no such allocation and compares native instance fields directly.
  for(const key of ['enemy','fluff'])expect(reference.enemy![key]).toEqual([]);
  const fields=(b:EngineBattle)=>Object.fromEntries(Object.entries(b.enemy!).filter(([key,value])=>typeof value!=='function'&&!['object','layerEntry','enemy','fluff'].includes(key)));
  expect(fields(actual)).toEqual(fields(reference));expect(actual.rt.globals.msg).toEqual(reference.rt.globals.msg);expect(actual.rt.random.snapshot()).toEqual(reference.rt.random.snapshot());
 });
});
