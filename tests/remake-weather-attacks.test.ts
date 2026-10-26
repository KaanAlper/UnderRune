import {describe,it,expect} from 'vitest';
import {GmRuntime,resolveEvent,type GmEvent} from '../src/remake/gm/runtime';
import {createChapterRegistry} from '../src/remake/host/chapter2';
import metadata from '../src/remake/host/chapter3-resources.json';
import {doom,lerpvar} from '../src/remake/deltarune/shared-effects';
import {marker} from '../src/remake/deltarune/battle';
import {loadSprites} from './parity/reference';
import {createWeatherAttacks} from '../src/remake/bosses/lanino-elnina/attacks';

function fixture(attacktype=0,favored=0){
 const rt=new GmRuntime(loadSprites(3),{seed:11});
 rt.globals={chapter:3,elninalosscount:0,encounterno:113,turntimer:700,hp:[0,100],maxhp:[0,100],batmusic:[0]};
 const registry=createChapterRegistry(rt,{chapter:3,metadata,room:'room_battletest'}),family=createWeatherAttacks(registry.object);
 registry.register([...family.objects,doom,lerpvar,marker]);registry.finalize();
 rt.restore(registry.object('obj_growtangle'),99990,320,200);rt.restore(registry.object('obj_heart'),99991,100,400);
 const controller=rt.restore(registry.object('obj_elnina_lanino_controller'),99992,0,0,{turns:0,forecasts:[[0,783,4256]]});
 const s=rt.create(registry.object('obj_elnina_mascotattack'),320,200);s.attacktype=attacktype;s.favored=favored;
 const run=(event:GmEvent='step',target=s)=>resolveEvent(target.object,event)!(target,rt);
 const bullets=()=>rt.all(registry.object('obj_regularbullet_elnina'));
 return {rt,s,controller,run,bullets,...registry,...family};
}

describe('normal Lanino and Elnina weather attacks',()=>{
 it('keeps forecasts and sprite arrays numeric, creates two mirrored-facing mascots, and draws no self sprite',()=>{
  const f=fixture();expect(f.s.bs).toEqual([429,3812,4151,4066,4418,1359]);expect(f.s.ms[0][0]).toBe(472);
  f.run();const a=f.rt.byId(f.s.mascot[0])!,b=f.rt.byId(f.s.mascot[1])!;
  expect([a.sprite,b.sprite]).toEqual(['spr_ch3_mascot_moon_normal','spr_ch3_mascot_cloud_normal']);
  expect(a.x).toBeLessThan(392);expect(b.x).toBeGreaterThan(248);expect([a.y,b.y]).toEqual([84,84]);
  const rng=f.rt.random.snapshot();f.run('draw');expect(f.rt.random.snapshot()).toEqual(rng);
 });
 it('fires both forecast sprites on frame eleven, with opposed horizontal acceleration and shared launch RNG',()=>{
  const f=fixture();for(let n=0;n<10;n++)f.run();expect(f.bullets()).toHaveLength(0);f.run();
  const [a,b]=f.bullets();expect([a.sprite,b.sprite]).toEqual(['spr_ch3_bullet_sun','spr_ch3_bullet_raindrop']);
  expect(a.hspeed).toBeCloseTo(-b.hspeed);expect(a.vspeed).toBeCloseTo(b.vspeed);expect([a.gravityDirection,b.gravityDirection]).toEqual([180,0]);
  expect(f.s.shottimer).toEqual([0,0]);expect(f.rt.all(f.object('obj_doom')).map(d=>d.alarm[0])).toEqual([80,80]);
 });
 it.each([0,1])('favored side %i shoots first on frame eight of the second variant',favored=>{
  const f=fixture(2,favored);for(let n=0;n<8;n++)f.run();const [p]=f.bullets();
  expect(f.bullets()).toHaveLength(1);expect(p.imageXscale).toBe(1.5);expect(Math.sign(p.hspeed)).toBe(favored===0?1:-1);
  expect(p.grazepoints).toBe(3);expect(f.s.shotrate).toEqual(favored===0?[8,14]:[14,8]);
 });
 it('changes to kiss poses at162 and emits the short-lived heart marker at168',()=>{
  const f=fixture();f.run();f.s.siner=161;f.run();expect(f.rt.byId(f.s.mascot[0])!.sprite).toBe('spr_ch3_mascot_moon_kiss');
  f.s.siner=167;f.run();const m=f.rt.all(f.object('obj_marker')).find(o=>o.sprite==='spr_ch3_bullet_heart')!;
  expect([m.x,m.y,m.vspeed]).toEqual([320,80,-6]);expect(m.friction).toBeCloseTo(0.334);expect(f.rt.all(f.object('obj_doom')).some(d=>d.target===m.id&&d.alarm[0]===32)).toBe(true);
 });
 it('merges unlike bullets into hearts during early turns and consumes one kiss-pitch RNG value',()=>{
  const f=fixture(),a=f.rt.create(f.object('obj_regularbullet_elnina'),300,200),b=f.rt.create(f.object('obj_regularbullet_elnina'),300,200);
  a.sprite='spr_ch3_bullet_sun';b.sprite='spr_ch3_bullet_raindrop';const rng=f.rt.random.snapshot();f.run('step',a);
  expect([a.sprite,b.sprite]).toEqual(['spr_ch3_bullet_heart','spr_ch3_bullet_heart']);expect(a.live&&b.live).toBe(true);expect(f.rt.random.snapshot()).not.toEqual(rng);
 });
 it('annihilates unlike later bullets with two independently scaled eight-frame shrinking markers',()=>{
  const f=fixture();f.controller.turns=3;const a=f.rt.create(f.object('obj_regularbullet_elnina'),300,200),b=f.rt.create(f.object('obj_regularbullet_elnina'),300,200);
  a.sprite='spr_ch3_bullet_sun';b.sprite='spr_ch3_bullet_raindrop';a.imageXscale=2;b.imageXscale=0.8;f.run('step',a);
  expect([a.live,b.live]).toEqual([false,false]);expect(f.rt.all(f.object('obj_marker'))).toHaveLength(2);
  expect(f.rt.all(f.object('obj_lerpvar')).filter(l=>l.varname==='image_xscale').map(l=>l.pointa)).toEqual([2,Math.fround(0.8)]);
 });
 it('continues image updates after offscreen destruction and cleans up both mascot markers',()=>{
  const f=fixture();f.run();const a=f.rt.create(f.object('obj_regularbullet_elnina'),-100,100);a.spin=1;a.spinspeed=5;f.run('step',a);expect(a.live).toBe(false);expect(a.imageAngle).toBe(5);
  const ids=[...f.s.mascot];f.rt.destroy(f.s);expect(ids.every(id=>!f.rt.byId(id))).toBe(true);
 });
 it('stops firing at two remaining frames and hides both markers without advancing its clock',()=>{
  const f=fixture();f.run();const before=f.s.siner;f.rt.globals.turntimer=2;f.run();expect(f.s.siner).toBe(before);expect(f.s.mascot.map((id:number)=>f.rt.byId(id)!.imageAlpha)).toEqual([0,0]);
 });
 it('creates exactly one mascot from type130 and forwards side, difficulty, creator and hit fields',()=>{
  const f=fixture(),dc=f.rt.restore(f.object('obj_dbulletcontroller'),99993,0,0,{type:130,special:2,side:1,difficulty:3,made:0,damage:55,grazepoints:2,timepoints:1,inv:60,target:2,grazed:0,grazetimer:0,creatorid:9,creator:8,element:5});
  f.pattern(dc,f.rt);f.pattern(dc,f.rt);const all=f.rt.all(f.object('obj_elnina_mascotattack'));expect(all).toHaveLength(2);const m=all[1];expect([m.attacktype,m.favored,m.type,m.damage,m.target,m.creatorid]).toEqual([2,1,3,55,2,9]);
 });
});
