import {describe,it,expect} from 'vitest';
import {GmRuntime,resolveEvent,type GmEvent,type GmInstance} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
import {installNeoHost} from '../src/remake/host/neo';
import {bulletInherit2} from '../src/remake/deltarune/chapter2-battle';

const run=(rt:GmRuntime,s:GmInstance,event:GmEvent)=>resolveEvent(s.object,event)!(s,rt);
const names=['obj_sneo_phonehand_master','obj_sneo_phonehand','obj_sneo_phonehand_master_hurtbox','obj_sneo_mmx_spreadshot'];
function scene(difficulty=0){
 const rt=new GmRuntime(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]}),{seed:11});
 rt.globals={chapter:2,monsterat:[13],hp:[0,120,140,100],turntimer:500};
 const {objects}=installNeoHost(rt);
 for(const name of names)expect((objects[name] as {archived?:boolean}).archived,`${name} must run explicit events`).not.toBe(true);
 rt.restore(objects.obj_spamton_neo_enemy,99999,460,160,{myself:0,difficulty});
 rt.restore(objects.obj_sneo_bulletcontroller,99998,0,0,{target:4});
 const soul=rt.restore(objects.obj_heart,99997,600,160);
 const master=rt.create(objects.obj_sneo_phonehand_master,420,160);
 return {rt,objects,master,soul,top:rt.byId(master.phonehand_top)!,bottom:rt.byId(master.phonehand_bottom)!};
}
const shotEvent=(s:GmInstance,rt:GmRuntime,shot:GmInstance)=>s.object.collisions!.find(c=>c.target.name==='obj_yheart_shot')!.run(s,shot,rt);

describe('NEO phone-hand source events',()=>{
 it('creates both hands with inherited damage and controller target before master initialization',()=>{
  const {master,top,bottom,rt}=scene();
  expect([top.x,top.y,top.orientation,top.boss,top.target]).toEqual([350,90,'top',master.id,4]);
  expect([bottom.x,bottom.y,bottom.orientation,bottom.target]).toEqual([350,220,'bottom',4]);
  expect([master.damage,top.damage,master.hp,master.imageAlpha]).toEqual([65,65,200,0]);
  master.target=2;run(rt,master,'step');expect([top.target,bottom.target]).toEqual([2,2]);
 });
 it('charged shots lower master HP, push both hands and are consumed',()=>{
  const {rt,objects,master,top,bottom}=scene();const shot=rt.restore(objects.obj_yheart_shot,100100,420,160,{big:1,makeanim:1});
  shotEvent(master,rt,shot);expect([master.hp,master.hspeed,top.hspeed,bottom.hspeed,shot.live]).toEqual([199,8,6,6,false]);
  expect([master.friction,top.friction,bottom.friction]).toEqual([0.5,0.5,0.5]);
 });
 it('the hurtbox deals shared contact damage while staying alive',()=>{
  const {rt,objects}=scene();const h=rt.create(objects.obj_sneo_phonehand_master_hurtbox,0,0);
  const hero=rt.restore(objects.obj_herokris,100101,50,200,{myheight:40});
  Object.assign(rt.globals,{inv:-1,invc:1,char:[1,2,3],maxhp:[0,120,140,100],battledf:[0,0,0],charaction:[0,0,0],
   charinstance:[hero.id,-1,-1],itemelement:[[0,0,0],[0,0,0],[0,0,0],[0,0,0]],itemelementamount:[[0,0,0],[0,0,0],[0,0,0],[0,0,0]]});
  rt.userEvent(h,5);
  expect(rt.globals.hp).toEqual([0,110,140,100]);expect([h.live,h.grazed,h.destroyonhit,h.element,h.imageXscale,h.imageYscale]).toEqual([true,1,0,6,4,20]);
 });
 it('fades only in Draw after the first invisible draw and restores draw alpha',()=>{
  const {rt,master}=scene();run(rt,master,'step');expect(master.imageAlpha).toBe(0);
  run(rt,master,'draw');expect(master.imageAlpha).toBe(0);
  run(rt,master,'draw');expect(master.imageAlpha).toBeCloseTo(0.1);expect(rt.drawState.alpha).toBe(1);
 });
 it('uses the camera clamp before the soul barrier and propagates difficulty-2 alternate motion',()=>{
  const {rt,master,soul,top,bottom}=scene(2);rt.view.x=100;master.x=700;
  run(rt,master,'step');expect(soul.x).toBe(544);expect(master.x).toBe(579);expect([top.alt,bottom.alt]).toEqual([1,1]);
 });
 it('fires difficulty-2 basic bullets at the source threshold and resets the head pose in alarm 0',()=>{
  const {rt,objects,master}=scene(2);master.btimer=29;master.imageAlpha=1;master.target=2;
  run(rt,master,'step');const b=rt.byId(master.shot)!;
  expect(b.object).toBe(objects.obj_basicbullet_sneo);expect([b.speed,b.friction,b.target,b.imageXscale,b.alarm[0],master.alarm[0]]).toEqual([10,0,2,3,25,10]);
  expect(master.sprite).toBe('spr_sneo_head_open');run(rt,master,'alarm0');expect(master.sprite).toBe('spr_sneo_head');
 });
 it('initializes the bottom joint before mirroring and runs source stretch recovery in the same step',()=>{
  const {rt,bottom}=scene();bottom.btimer=13;bottom.alt=1;run(rt,bottom,'step');
  expect([bottom.remjointy,bottom.init]).toEqual([250,1]);expect(bottom.imageYscale).toBeCloseTo(-1.8);expect(bottom.crawlsiner).toBe(-1);
 });
 it('uses different top and bottom alternate firing thresholds and preserves their restart timers',()=>{
  const {rt,top,bottom}=scene(2);top.alt=1;bottom.alt=1;top.btimer=27;bottom.btimer=17;
  run(rt,top,'step');run(rt,bottom,'step');const a=rt.byId(top.shot)!,b=rt.byId(bottom.shot)!;
  expect([top.btimer,bottom.btimer,a.speed,b.speed,a.sprite,b.sprite,a.target,b.target]).toEqual([10,0,3,3,'spr_sneo_soundbullet','spr_sneo_soundbullet',4,4]);
  expect(a.direction).toBeGreaterThan(268);expect(a.direction).toBeLessThan(272);expect(b.direction).toBeGreaterThan(88);expect(b.direction).toBeLessThan(92);
 });
 it('preserves the hand Draw loop counter and first-frame fade delay',()=>{
  const {rt,top}=scene();run(rt,top,'step');run(rt,top,'draw');expect('i' in top).toBe(false);
  run(rt,top,'draw');expect([top.i,top.visibiliytimer,rt.drawState.alpha]).toEqual([4,2,1]);expect(top.imageAlpha).toBeCloseTo(0.1);
 });
 it('spreads into three regular bullets with source sentinels, element and persistent caller fields',()=>{
  const {rt,objects,master}=scene();master.depth=7;
  const s=rt.create(objects.obj_sneo_mmx_spreadshot,300,160);s.damage=42;s.alarm[0]=1;
  run(rt,s,'alarm0');const bullets=rt.all(objects.obj_regularbullet);
  expect(bullets.map(b=>[b.direction,b.speed,b.friction,b.depth,b.damage,b.target,b.grazepoints,b.element])).toEqual([
   [120,2,Math.fround(-0.6),6,42,0,2,6],[180,2,Math.fround(-0.6),6,42,0,2,6],[240,2,Math.fround(-0.6),6,42,0,2,6],
  ]);expect([s.i,s.shot,s.live]).toEqual([3,bullets[2].id,false]);
 });
 it('continues spread rotation after Destroy and decrements its flash in Draw',()=>{
  const {rt,objects}=scene();const s=rt.create(objects.obj_sneo_mmx_spreadshot,800,160);s.angle_speed=12;s.alarm[0]=8;
  run(rt,s,'step');expect([s.live,s.direction,s.imageAngle,s.flashtimer]).toEqual([false,12,12,5]);
  run(rt,s,'draw');expect(s.flashtimer).toBe(4);
 });
 it('keeps recipient defaults for -1 sentinels within GML comparison tolerance',()=>{
  const {rt,objects,master}=scene();const b=rt.create(objects.obj_regularbullet,0,0);
  for(const name of ['damage','grazepoints','timepoints','inv','target','grazed','grazetimer'])master[name]=-1+0.000004;
  b.grazed=1;b.grazetimer=7;master.element=6;
  bulletInherit2(master,b);
  expect([b.damage,b.grazepoints,b.timepoints,b.inv,b.target,b.grazed,b.grazetimer,b.element]).toEqual([10,1,1,60,0,1,7,6]);
 });

});
