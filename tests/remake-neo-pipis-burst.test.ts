import fs from 'node:fs';
import {describe,it,expect} from 'vitest';
import {GmInstance,GmRuntime} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
import {installNeoHost} from '../src/remake/host/neo';
import {executeNeoSource} from '../src/remake/bosses/spamton-neo/body-source';
import {pointDirection} from '../src/remake/gm/math';

const original='extracted/chapter2_windows/code/gml_Object_obj_pipis_egg_bullet_Other_10.gml';
function scene(difficulty=4,type=0,seed=11){
 const layerBase=GmInstance.layerEntries;
 const rt=new GmRuntime(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]}),{seed});
 rt.globals={chapter:2,monsterat:[13],turntimer:500};const {objects,host}=installNeoHost(rt);
 rt.restore(objects.obj_spamton_neo_enemy,99999,460,80,{myself:0,difficulty});
 const soul=rt.restore(objects.obj_heart,99998,270,185);soul.depth=60;
 rt.restore(objects.obj_sneo_bulletcontroller,99997,0,0,{target:2});
 const egg=rt.create(objects.obj_pipis_egg_bullet,400,120);Object.assign(egg,{type,target:1,damage:47,depth:31});
 return {rt,objects,host,egg,soul,layerBase,layerEnd:GmInstance.layerEntries};
}
function state(fixture:ReturnType<typeof scene>){
 return fixture.rt.instances.map(instance=>Object.fromEntries(Object.entries(instance).filter(([,value])=>typeof value!=='function').map(([key,value])=>[
  key,key==='object'?value.name:key==='layerEntry'?value-fixture.layerBase:value,
 ])));
}

describe('Pipis difficulty-four burst',()=>{
 it('creates fifteen radial diamonds and three aimed diamonds, preserving source damage and ownership',()=>{
  const {rt,objects,egg,soul}=scene();expect((objects.obj_sneo_heatattack_bullet as {archived?:boolean}).archived).not.toBe(true);
  rt.userEvent(egg,0);const bullets=rt.all(objects.obj_sneo_heatattack_bullet);
  expect(bullets).toHaveLength(18);expect(egg.live).toBe(false);expect(egg.i).toBe(15);expect(egg.radialshot).toBe(bullets[17].id);
  for(const bullet of bullets){expect([bullet.sprite,bullet.active,bullet.depth,bullet.target,bullet.damage,bullet.grazed,bullet.element,bullet.grazepoints]).toEqual(['spr_diamondbullet',1,-69,1,47,0,6,1]);}
  for(let i=0;i<15;i++)expect(bullets[i].dir).toBeGreaterThanOrEqual(i*24-7);
  for(let i=0;i<15;i++)expect(bullets[i].dir).toBeLessThan(i*24+7);
  expect(bullets.slice(15).map(b=>b.dir)).toEqual([0,-40,40].map(offset=>pointDirection(egg.x,egg.y,soul.x+10,soul.y+10+offset)));
  expect(rt.count(objects.obj_pipis_center)).toBe(0);expect(rt.count(objects.obj_pipis_bullet_cone)).toBe(0);
  const pieces=rt.all(objects.obj_pipis_egg_bullet_piece);expect(pieces).toHaveLength(3);expect(egg.fx).toBe(pieces[2].id);
 });
 it('runs canonical heat-bullet motion and ends the volley with the source turn timer',()=>{
  const {rt,objects,egg}=scene();rt.userEvent(egg,0);const bullets=rt.all(objects.obj_sneo_heatattack_bullet);
  const first=bullets[0],start=[first.x,first.y];first.object.events!.step!(first,rt);
  expect(first.f).toBeCloseTo(2.4);expect([first.x,first.y]).not.toEqual(start);expect(first.imageAngle).toBe(first.dir);
  rt.globals.turntimer=0;for(const bullet of bullets)bullet.object.events!.step!(bullet,rt);expect(rt.count(objects.obj_sneo_heatattack_bullet)).toBe(0);
 });
 it.each([0,1])('bursts through the actual wall collision for egg type %i',type=>{
  const {rt,objects,egg}=scene(4,type),wall=rt.restore(objects.obj_pipis_wall,100100,400,120);
  egg.object.collisions!.find(c=>c.target.name==='obj_pipis_wall')!.run(egg,wall,rt);
  expect(egg.live).toBe(false);expect(rt.count(objects.obj_sneo_heatattack_bullet)).toBe(18);
 });
 it.each([2,3])('leaves a type %i egg intact on a wall until its own draw/bounce condition',type=>{
  const {rt,objects,egg}=scene(4,type),wall=rt.restore(objects.obj_pipis_wall,100100,400,120);
  egg.object.collisions!.find(c=>c.target.name==='obj_pipis_wall')!.run(egg,wall,rt);
  expect(egg.live).toBe(true);expect(rt.count(objects.obj_sneo_heatattack_bullet)).toBe(0);
 });
});

describe.skipIf(!fs.existsSync(original))('Pipis burst compared with the installed original event',()=>{
 for(const difficulty of [0,2,4])for(const type of [0,1,2,3])for(const seed of [0,11,9182])it(`matches all entity fields and RNG at difficulty ${difficulty}, type ${type}, seed ${seed}`,()=>{
  const current=scene(difficulty,type,seed),reference=scene(difficulty,type,seed);
  GmInstance.layerEntries=current.layerEnd;current.rt.userEvent(current.egg,0);
  GmInstance.layerEntries=reference.layerEnd;executeNeoSource(fs.readFileSync(original,'utf8'),reference.egg,reference.rt,reference.host,undefined,'user0');
  expect(state(current)).toEqual(state(reference));expect(current.rt.random.snapshot()).toEqual(reference.rt.random.snapshot());
 });
});
