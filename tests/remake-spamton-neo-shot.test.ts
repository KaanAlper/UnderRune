import {describe,it,expect} from 'vitest';
import {GmRuntime,resolveEvent,type GmObjectDef} from '../src/remake/gm/runtime';
import {spriteBank,type RawSprite} from '../src/remake/gm/sprites';

import * as port from '../src/remake/bosses/spamton-neo/shot';
import fs from 'node:fs';
import {neoProjectileSourceCoverage} from '../src/remake/bosses/spamton-neo/coverage';
const defs={neo:{name:'obj_spamton_neo_enemy',index:702},heart:{name:'obj_heart',index:636},faceAttack:{name:'obj_sneo_faceattack',index:634},finalForm:{name:'obj_sneo_final_forme',index:643},wireheart:{name:'obj_sneo_wireheart',index:640}} satisfies Record<string,GmObjectDef>;
const raw=(name:string,frames=1):RawSprite=>({name,width:45,height:28,frames,originX:0,originY:0,bboxMode:1,left:0,right:44,top:0,bottom:27,sepMasks:0,special:false,playbackSpeed:1,playbackType:0});
function setup(){
 expect(port.createNeoProjectiles).toBeTypeOf('function');
 const objects=port.createNeoProjectiles(defs);
 const bank=spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:['spr_yheart_shot','spr_yheart_bigshot','spr_yheart_bigshot_trail'].map(n=>raw(n)).concat([raw('spr_yheart_shot_hit',5),raw('spr_yheart_shot_hit3',5),raw('spr_yheart_shot_hit_noeffect',4)])});
 const rt=new GmRuntime(bank,{seed:11});rt.globals={chapter:2,tension:0,maxtension:250,turntimer:500};
 const neo=rt.create(defs.neo,460,80);Object.assign(neo,{upgrade:0,difficulty:0,hellmode:0,eyeshp:16,nosehp:16,mouthhp:16});
 const sounds:string[]=[];rt.sound=name=>{sounds.push(name);};
 return {rt,neo,objects,sounds,shot:()=>rt.create(objects.shot,300,160)};
}
const event=(s:any,rt:GmRuntime,name='step')=>resolveEvent(s.object,name as any)!(s,rt);
describe('Spamton NEO source yellow projectile',()=>{
 it('creates the native normal projectile without changing RNG or marking bigshot used',()=>{
  const {rt,neo,objects,shot}=setup(),rng=rt.random.snapshot(),s=shot();
  expect(objects.shot.index).toBe(596);expect(objects.shot.parent).toBeUndefined();expect(objects.shot.collisions).toBeUndefined();
  expect([s.f,s.makeanim,s.hspeed,s.big,s.damage,s.sucked,s.trail,s.trail_timer]).toEqual([2,1,16,0,1,0,0,0]);expect(neo.bigshotused).toBeUndefined();expect(rt.random.snapshot()).toEqual(rng);
 });
 it('applies the source upgrade then grows the charged sprite without clamping alpha or scale',()=>{
  const {rt,neo,shot}=setup();neo.upgrade=1;const s=shot();
  expect([s.big,s.hspeed,s.damage,s.imageAlpha,s.imageYscale,neo.bigshotused]).toEqual([1,9,4,.5,2,1]);expect(s.friction).toBeCloseTo(-.4);
  for(let i=0;i<6;i++)event(s,rt);expect(s.imageAlpha).toBeCloseTo(1.7);expect(s.imageXscale).toBeCloseTo(1.1);expect(s.imageYscale).toBeCloseTo(1);
 });
 it('keeps normal/big impact differences, heart-relative depth and suppression',()=>{
  const {rt,objects,shot}=setup();const h=rt.create(defs.heart,0,0);h.depth=12;
  const s=shot();s.big=1;rt.userEvent(s,0);const a=rt.first(objects.impact)!;
  expect(s.live).toBe(false);expect(a.sprite).toBe('spr_yheart_shot_hit');expect([a.imageXscale,a.imageYscale,a.depth,a.imageSpeed]).toEqual([3,3,-88,.5]);
  const t=shot();t.makeanim=0;rt.userEvent(t,0);expect(rt.count(objects.impact)).toBe(1);expect(t.live).toBe(false);
  const u=shot();u.makeanim=0;u.big=1;rt.userEvent(u,1);const b=rt.all(objects.impact)[1];expect([b.sprite,b.imageXscale,b.depth]).toEqual(['spr_yheart_shot_hit_noeffect',1,0]);
 });
 it('destroys impact at the last-frame threshold and fades trails with GML EPS comparisons',()=>{
  const {rt,objects}=setup();const a=rt.create(objects.impact,0,0);a.imageIndex=4;event(a,rt);expect(a.live).toBe(true);a.imageIndex=4.1;event(a,rt);expect(a.live).toBe(false);
  const t=rt.create(objects.trail,0,0);for(let i=0;i<10;i++)event(t,rt);expect(t.live).toBe(true);event(t,rt);expect(t.live).toBe(false);
 });
 it('checks camera-relative boundaries and face barrier before suction/trail in source order',()=>{
  const {rt,objects,shot,sounds}=setup();rt.view.x=100;rt.view.y=50;
  const face=rt.create(defs.faceAttack,0,0);face.init=1;const s=shot();s.x=600;s.trail=1;s.trail_timer=1;event(s,rt);
  expect(s.live).toBe(false);expect(rt.count(objects.impact)).toBe(1);expect(rt.count(objects.trail)).toBe(1);expect(sounds).toEqual(['snd_bell']);
  const at=shot();at.x=630;event(at,rt);expect(at.live).toBe(true);at.x=800;event(at,rt);expect(at.live).toBe(false);
  const below=shot();below.y=570;event(below,rt);expect(below.live).toBe(false);const above=shot();above.y=10;event(above,rt);expect(above.live).toBe(false);
 });
 it('aims suction at the actual final form, remains idempotent, and executes both vertical corrections',()=>{
  const {rt,shot}=setup();const form=rt.create(defs.finalForm,500,30),s=shot();s.y=175.5;
  rt.userEvent(s,2);expect([s.sucked,s.speed,s.friction]).toEqual([1,3.5,0]);expect(s.gravity).toBeCloseTo(.3);
  const dir=s.direction;form.x+=20;rt.userEvent(s,2);expect(s.direction).toBe(dir);event(s,rt);expect(s.y).toBe(175.5);expect(s.direction).not.toBe(dir);expect(s.gravityDirection).toBeCloseTo(s.direction,4);
 });
 it('throws on unguarded missing final-form access instead of inventing a suction target',()=>{
  const {rt,shot}=setup();expect(()=>rt.userEvent(shot(),2)).toThrow(/obj_sneo_final_forme/);
 });
 it('creates a stopped source trail every second Step with copied frame/depth',()=>{
  const {rt,objects,shot}=setup(),s=shot();s.trail=1;s.depth=-4;event(s,rt);expect(rt.count(objects.trail)).toBe(0);event(s,rt);
  const a=rt.first(objects.trail)!;expect([a.x,a.y,a.imageSpeed,a.imageXscale,a.imageYscale,a.speed,a.friction,a.depth,a.direction]).toEqual([290,160,0,Math.fround(.8),.5,0,0,-4,180]);
 });
 it('uses tolerant source comparisons at charged-sprite limits and requires all integration definitions',()=>{
  const {rt,shot}=setup(),s=shot();s.big=1;s.imageXscale=1-2e-6;s.imageYscale=1+2e-6;const before=[s.imageXscale,s.imageYscale];event(s,rt);
  expect([s.imageXscale,s.imageYscale]).toEqual(before);
  expect(()=>port.createNeoProjectiles({...defs,wireheart:undefined} as any)).toThrow(/wireheart/);
 });
});
describe('NEO receiving-object shot collision primitives',()=>{
 it('consumes normal shots but preserves big shots through destroyable ordinary bullets',()=>{
  const {rt,objects,shot}=setup();const def:GmObjectDef={name:'test_bullet',index:623};
  for(const big of [0,1]){const b=rt.create(def,360,170);b.destroyable=1;b.imageXscale=2;b.imageYscale=3;const s=shot();s.big=big;objects.collisions.basicBullet(b,s,rt);expect(b.live).toBe(false);expect(s.live).toBe(big===1);}
  expect(rt.all(objects.impact).filter((a:any)=>a.sprite==='spr_yheart_shot_hit3')).toHaveLength(2);
  const b=rt.create(def,360,170);b.destroyable=-1;const s=shot();s.big=1;objects.collisions.basicBullet(b,s,rt);expect(s.live).toBe(false);expect(b.live).toBe(true);
 });
 it('dispatches flying-head user0 before the original difficulty-dependent TP reward',()=>{
  const {rt,neo,objects,shot}=setup();const def:GmObjectDef={name:'obj_sneo_lilguy',index:607,events:{user0:(s,r)=>{s.seenTension=r.globals.tension;s.seenShot=s.hitshot;}}};
  const b=rt.create(def,0,0),s=shot();objects.collisions.flyingHead(b,s,rt);expect([b.seenTension,b.seenShot,rt.globals.tension]).toEqual([0,s.id,1.3]);neo.difficulty=3;objects.collisions.flyingHead(b,s,rt);expect(rt.globals.tension).toBe(2.3);
  const missing=rt.create({name:'broken_head',index:608},0,0);expect(()=>objects.collisions.flyingHead(missing,s,rt)).toThrow(/user0/);
 });
 it('uses diminishing wireheart timer reductions and bypasses normal invulnerability for big shots',()=>{
  const {rt,objects,shot}=setup();const w=rt.create(defs.wireheart,400,150);Object.assign(w,{type:0,hp:25,invincibility_timer:0,chargeshothitcount:0,normalshothitcount:0});
  const a=shot();objects.collisions.wireheart(w,a,rt);expect([rt.globals.turntimer,w.normalshothitcount,w.invincibility_timer,w.damagetimer]).toEqual([480,1,10,5]);
  const suppressed=shot();objects.collisions.wireheart(w,suppressed,rt);expect(rt.globals.turntimer).toBe(480);expect(suppressed.live).toBe(false);
  const big=shot();big.big=1;objects.collisions.wireheart(w,big,rt);expect([rt.globals.turntimer,w.chargeshothitcount]).toEqual([400,1]);
  rt.globals.turntimer=149;const other=rt.create(defs.wireheart,0,0);other.hp=7;objects.collisions.wireheart(w,shot(),rt);expect(rt.globals.turntimer).toBe(149);w.invincibility_timer=0;objects.collisions.wireheart(w,shot(),rt);expect(rt.globals.turntimer).toBe(20);expect([w.hp,w.destroyed,other.hp,other.destroyed]).toEqual([0,1,0,1]);
 });
 it('damages only visible face parts and breaks the corresponding source HP pool',()=>{
  const {rt,neo,objects,shot,sounds}=setup();const f=rt.create(defs.faceAttack,500,80);Object.assign(f,{type:2,broken:0,invincibilitytimer:0});
  neo.nosehp=4;const s=shot();s.big=1;objects.collisions.facePart(f,s,rt);expect([neo.nosehp,f.broken,f.imageIndex,f.explodetimer,f.invincibilitytimer,f.hurtflashtimer]).toEqual([0,1,2,16,10,3]);expect(s.live).toBe(false);expect(sounds).toEqual(['snd_damage','snd_rocket']);
  f.broken=0;f.imageAlpha=.8;const untouched=shot();objects.collisions.facePart(f,untouched,rt);expect(untouched.live).toBe(true);
 });
 it('keeps the hitdetector shot collision inert because the source immediately exits',()=>{
  const {rt,objects,shot}=setup(),s=shot();objects.collisions.hitDetector(rt.create({name:'obj_sneo_hitdetector',index:601},0,0),s,rt);expect(s.live).toBe(true);expect(rt.globals.tension).toBe(0);
 });
 it('runs the receiving collision through runtime motion/dispatch with the source shot as target',()=>{
  const {rt,objects,shot}=setup();const target:GmObjectDef={name:'obj_basicbullet_sneo',index:597,sprite:'spr_yheart_shot',collisions:[{target:objects.shot,run:objects.collisions.basicBullet}]};
  const b=rt.create(target,316,160);b.destroyable=1;const s=shot();rt.step();
  expect(s.live).toBe(false);expect(b.live).toBe(false);expect(rt.count(objects.impact)).toBe(2);
 });
 it('retains a source-destroyed wireheart for its own defeat animation and eventual Destroy event',()=>{
  const {rt,objects,shot}=setup();let defeats=0,destroys=0;
  const owner:GmObjectDef={...defs.wireheart,events:{step:s=>{if(s.destroyed)defeats++;},destroy:()=>{destroys++;}}};
  const wired=port.createNeoProjectiles({...defs,wireheart:owner});const w=rt.create(owner,400,150);
  Object.assign(w,{type:1,hp:1,invincibility_timer:0,chargeshothitcount:0,normalshothitcount:0});const s=shot();s.big=1;
  wired.collisions.wireheart(w,s,rt);expect(w.destroyed).toBe(1);rt.step();rt.step();expect(defeats).toBe(2);expect(rt.byId(w.id)).toBe(w);
  rt.destroy(w);expect(destroys).toBe(1);expect(w.live).toBe(false);void objects;
 });
});
const sourceRoot='extracted/chapter2_windows';
describe.skipIf(!fs.existsSync(sourceRoot+'/object-parents.json'))('NEO projectile local-source metadata',()=>{
 it('accounts for every own event, parent, collision and source object index',()=>{
  const parents=JSON.parse(fs.readFileSync(sourceRoot+'/object-parents.json','utf8'));
  const files=fs.readdirSync(sourceRoot+'/code');
  for(const object of neoProjectileSourceCoverage.objects){
   const meta=parents.find((o:any)=>o.name===object.name);expect({index:meta.index,parent:meta.parent,sprite:meta.sprite,mask:meta.mask,depth:meta.depth,visible:meta.visible}).toEqual({index:object.index,parent:object.parent,sprite:object.sprite,mask:object.mask,depth:object.depth,visible:object.visible});
   const prefix=`gml_Object_${object.name}_`;expect(files.filter(f=>f.startsWith(prefix)).map(f=>f.slice(prefix.length,-4)).filter(e=>/^(Create|Destroy|CleanUp|Step|Other|Alarm|Draw|Collision|Key|Mouse)_/.test(e)).sort()).toEqual([...object.events].sort());
  }
  expect(neoProjectileSourceCoverage.completeEncounter).toBe(false);
 });
});
