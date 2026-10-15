import {describe,it,expect} from 'vitest';
import {GmRuntime,resolveEvent,type GmEvent,type GmInstance} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
import {installNeoHost} from '../src/remake/host/neo';
import {createNeoFinale} from '../src/remake/bosses/spamton-neo/finale';
import {hooksOf} from '../src/remake/deltarune/rules';
import {GmRandom} from '../src/remake/gm/random';

const run=(rt:GmRuntime,s:GmInstance,event:GmEvent)=>resolveEvent(s.object,event)!(s,rt);
function scene(){
 const rt=new GmRuntime(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[{
  name:'spr_battlebg_0',width:240,height:240,originX:120,originY:120,bboxMode:1,left:0,right:239,top:0,bottom:239,
  sepMasks:0,frames:1,special:false,playbackSpeed:0,playbackType:0,
 }]}),{seed:11});
 rt.globals={chapter:2,monsterat:[13],monsterhp:[100],monstermaxhp:[100],hp:[0,120,140,100],turntimer:500,inv:0};
 const {objects}=installNeoHost(rt);
 const defs=createNeoFinale(n=>objects[n]);expect(defs).toHaveLength(14);for(const d of defs)objects[d.name]=d;
 rt.restore(objects.obj_spamton_neo_enemy,99999,460,160,{myself:0,difficulty:0});
 const controller=rt.restore(objects.obj_sneo_bulletcontroller,99998,0,0,{target:4,special:0,mercyaccumulated:0});
 const soul=rt.restore(objects.obj_heart,99997,300,160,{color:1});
 const box=rt.restore(objects.obj_growtangle,99996,320,240,{sprite:'spr_battlebg_0',maxxscale:2,maxyscale:2,spr_custom_box:'spr_battlebg_0',keep:0});
 const solid=rt.restore(objects.obj_battlesolid,99995,0,0);
 const detector=rt.restore(objects.obj_sneo_hitdetector,99994,0,0,{active:false});
 const warped=rt.create(objects.obj_sneo_warped_box,320,240);
 const form=rt.create(objects.obj_sneo_final_forme,420,80);
 return {rt,objects,controller,soul,box,solid,detector,warped,form};
}
const hit=(s:GmInstance,rt:GmRuntime,shot:GmInstance)=>s.object.collisions!.find(c=>c.target.name==='obj_yheart_shot')!.run(s,shot,rt);
function party(rt:GmRuntime,objects:ReturnType<typeof installNeoHost>['objects']){
 const heroes=['obj_herokris','obj_herosusie','obj_heroralsei'].map((n,i)=>rt.restore(objects[n],100200+i,50+i*40,200,{myheight:40}));
 Object.assign(rt.globals,{inv:-1,invc:1,char:[1,2,3],maxhp:[0,120,140,100],battledf:[0,0,0],charaction:[0,0,0],charinstance:heroes.map(h=>h.id),
  itemelement:[[0,0,0],[0,0,0],[0,0,0],[0,0,0]],itemelementamount:[[0,0,0],[0,0,0],[0,0,0],[0,0,0]]});
 const n=rt.first(objects.obj_spamton_neo_enemy)!;n.damage=65;n.target=4;n.element=6;
}

describe('NEO finale explicit events',()=>{
 it('owns the shot attraction hook and creates head/mouth descendants with controller damage',()=>{
  const {rt,objects,form,soul}=scene();
  expect(hooksOf(form).pullsShots!(form,rt)).toEqual([542,226]);
  expect([form.damage,form.target,form.grazepoints,form.destroyonhit]).toEqual([21,4,4,0]);
  expect(rt.all(objects.obj_sneo_final_forme_hitbox)).toHaveLength(1);
  expect(rt.byId(form.back)!.depth).toBe(soul.depth+1);
 });
 it('the shared charged-shot event uses the final-form hook to accelerate toward its mouth',()=>{
  const {rt,objects}=scene();const shot=rt.restore(objects.obj_yheart_shot,100100,500,220,{big:1,sucked:0,trail:0,f:2,makeanim:1});
  rt.userEvent(shot,2);expect([shot.sucked,shot.speed,shot.friction]).toEqual([1,3.5,0]);expect(shot.gravity).toBeCloseTo(0.3);
  run(rt,shot,'step');expect(shot.y).toBe(221);expect(shot.gravityDirection).toBeCloseTo(353.211026);
 });
 it('final-form Draw draws with right-to-left jitter RNG, reveals the mouth and finishes intro there',()=>{
  const {rt,objects,form}=scene();Object.assign(form,{state:3,imageIndex:5});
  const expected=GmRandom.restore(rt.random.snapshot()),ry=expected.randomRange(-2,2),rx=expected.randomRange(-2,2);
  const draws:unknown[][]=[];rt.drawSprite=(...args)=>{draws.push(args);};run(rt,form,'draw');
  expect(rt.random.snapshot()).toEqual(expected.snapshot());expect(draws[1][2]).toBeCloseTo(420+rx);
  expect(draws[1][3]).toBeCloseTo(80-Math.abs(Math.sin(0.05)*40+ry));
  expect(rt.all(objects.obj_sneo_final_forme_mouth_back)[0].visible).toBe(true);
  form.intro=1;form.introtimer=67;run(rt,form,'draw');expect([form.intro,form.imageIndex,form.imageAlpha,form.imageBlend]).toEqual([0,4,1,0xffffff]);
 });
 it('clamps the soul in the original box, then warped edges and snapback',()=>{
  const {rt,warped,soul}=scene();expect([warped.minx,warped.maxx,warped.miny,warped.maxy]).toEqual([200,440,120,360]);
  soul.x=900;soul.y=900;run(rt,warped,'endStep');
  expect([soul.x,soul.y]).toEqual([420,340]);
  Object.assign(warped,{state:1,suckpower:1,suckx:500,upper_sucky:200,lower_sucky:280});
  soul.x=900;soul.y=-100;run(rt,warped,'endStep');expect([soul.x,soul.y,warped.rborder]).toEqual([480,203,500]);
  rt.globals.turntimer=30;soul.x=480;run(rt,warped,'endStep');expect(soul.x).toBe(461);expect(warped.snapback).toBeCloseTo(0.9);
 });
 it('updates suction and inhalation in Draw and restores the box/solid on Destroy',()=>{
  const {rt,warped,box,solid}=scene();Object.assign(warped,{state:1,timer:60,inhalespeed:0.25});
  run(rt,warped,'draw');expect([warped.timer,warped.inhale]).toEqual([59,0.25]);expect(warped.suckpower).toBeCloseTo(59/60);
  warped.state=2;warped.timer=40;run(rt,warped,'draw');expect([warped.timer,warped.snapback]).toEqual([29,-1]);
  rt.destroy(warped);expect([box.imageAlpha,box.keep,solid.imageXscale,solid.imageYscale]).toEqual([1,1,2,2]);
 });
 it('keeps the original box hidden when the warped-box sprite finishes animating',()=>{
  const {rt,warped,box}=scene();expect(box.imageAlpha).toBe(0);
  resolveEvent(warped.object,'animationEnd')?.(warped,rt);expect(box.imageAlpha).toBe(0);
 });
 it('consumes charged shots and distinguishes direct-head and hitbox push/timer changes',()=>{
  const {rt,objects,form}=scene();form.destroyable=1;
  const a=rt.restore(objects.obj_yheart_shot,100100,420,80,{big:1,makeanim:1});hit(form,rt,a);
  expect([a.live,form.pushback,form.formtimer,form.hurtalpha]).toEqual([false,10,10,1]);
  const hb=rt.all(objects.obj_sneo_final_forme_hitbox)[0];hb.destroyable=1;
  const b=rt.restore(objects.obj_yheart_shot,100101,420,80,{big:1,makeanim:1});hit(hb,rt,b);
  expect([b.live,form.pushback,form.formtimer]).toEqual([false,13,23]);
  form.state=3;const c=rt.restore(objects.obj_yheart_shot,100102,420,80,{big:0,makeanim:1});hit(hb,rt,c);
  expect([c.live,form.formtimer]).toEqual([false,23]);
 });
 it('triggers swallowed-soul finale and later launches the hidden soul back into the box',()=>{
  const {rt,objects,form,soul,controller,warped}=scene();soul.x=500;run(rt,form,'step');
  expect([form.state,form.formtimer,controller.special,soul.imageAlpha,soul.color,rt.globals.inv]).toEqual([10,0,1,0,0,300]);
  const fake=rt.byId(form.fakeheart)!;expect(fake.object).toBe(objects.obj_sneo_fakeheart);
  form.formtimer=45;run(rt,form,'step');expect([form.state,form.hidemouthback,fake.state,warped.imageAlpha]).toEqual([11,1,1,0]);
  form.x=439;form.formtimer=65;run(rt,form,'step');expect([form.state,fake.state,form.imageIndex]).toEqual([12,2,5]);
  form.formtimer=29;form.movetimer=1;run(rt,form,'step');expect(form.live).toBe(false);expect(rt.all(objects.obj_sneo_lastattack)).toHaveLength(1);
 });
 it('takes the defended timeout route and preserves the last attack created after Destroy',()=>{
  const {rt,objects,form,controller,detector}=scene();form.formtimer=319;run(rt,form,'step');
  expect([form.state,form.formtimer,controller.special]).toEqual([1,45,1]);run(rt,form,'step');expect(form.state).toBe(2);
  run(rt,form,'step');expect([form.state,rt.globals.turntimer]).toEqual([3,360]);
  Object.assign(form,{x:438,movecon:2,timer3:20,movetimer:11/12,timer2:99});run(rt,form,'step');
  expect([form.live,detector.active,rt.globals.turntimer]).toEqual([false,true,300]);
  const last=rt.byId(form.aa)!;expect(last.object).toBe(objects.obj_sneo_lastattack);expect(rt.all(objects.obj_sneo_final_forme_mouth_back)).toHaveLength(0);
 });
 it('the swallowed-soul hurt phase invokes enemy final damage once while progressing the timer',()=>{
  const {rt,objects,form}=scene();party(rt,objects);Object.assign(form,{state:11,formtimer:29,x:400});
  run(rt,form,'step');expect(rt.globals.hp).toEqual([0,96,112,80]);expect([form.formtimer,form.dmgcon,rt.globals.inv]).toEqual([30,1,40]);
  form.formtimer=34;run(rt,form,'step');expect(rt.globals.hp).toEqual([0,96,112,80]);
 });
 it('hurt sound pitch consumes RNG even with no audio backend',()=>{
  const {rt,form}=scene();Object.assign(form,{state:11,formtimer:29,x:400,dmgcon:1});rt.soundPitch=undefined;
  const expected=GmRandom.restore(rt.random.snapshot());expected.randomRange(1.4,2);run(rt,form,'step');
  expect(rt.random.snapshot()).toEqual(expected.snapshot());
 });
 it('the finale parent deals max-HP proportional contact damage rather than the bullet attack stat',()=>{
  const {rt,objects}=scene();party(rt,objects);const b=rt.create(objects.obj_sneo_finale_bullet,300,200);b.target=0;b.damage=65;
  rt.userEvent(b,5);expect(rt.globals.hp).toEqual([0,96,140,100]);expect([b.target,b.tdamage,b.live]).toEqual([0,24,false]);
 });
 it('normal and charged shots deplete orb HP and keep the explosion timer in user0',()=>{
  const {rt,objects}=scene();const orb=rt.create(objects.obj_sneo_final_orb,400,220);orb.hp=4;
  const a=rt.restore(objects.obj_yheart_shot,100100,400,220,{big:1,makeanim:1});hit(orb,rt,a);
  expect([orb.hp,orb.timer,orb.speed,a.live]).toEqual([1,-1,0,false]);
  const b=rt.restore(objects.obj_yheart_shot,100101,400,220,{big:0,makeanim:1});hit(orb,rt,b);
  expect([orb.hp,orb.timer,orb.destroyable,orb.speed,b.live]).toEqual([0,1,0,0,false]);
  run(rt,orb,'draw');expect(orb.i).toBe(12);orb.timer=60;run(rt,orb,'step');
  expect([orb.live,rt.globals.turntimer]).toEqual([false,1]);
 });
 it('the last-attack hitbox consumes shots, skips the first stage and fires the large shot',()=>{
  const {rt,objects}=scene();const last=rt.create(objects.obj_sneo_lastattack,438,80);
  const hb=rt.all(objects.obj_sneo_lastattack_hitbox)[0];
  const shot=rt.restore(objects.obj_yheart_shot,100100,500,175,{big:1,damage:12,makeanim:1});hit(hb,rt,shot);
  expect([shot.live,last.endattack,last.skip_1st_part_hp,last.hurtalpha]).toEqual([false,1,0,1]);
  run(rt,last,'step');expect([last.con,last.timer,last.endattack]).toEqual([1,1,1]);
  last.timer=10;run(rt,last,'step');const big=rt.byId(last.bigshot)!;
  expect([big.sprite,big.imageXscale,big.imageYscale]).toEqual(['spr_sneo_bigshot_l',0,0]);
 });
 it('large explosion rewards full-health mercy and removes the last attack/hitbox',()=>{
  const {rt,objects,controller}=scene();Object.assign(rt.globals,{flag:[],monsterx:[460],monstery:[160],hittarget:[0]});rt.globals.flag[26]=0;
  const last=rt.create(objects.obj_sneo_lastattack,438,80);const big=rt.create(objects.obj_sneo_bigshot,500,215);big.sprite='spr_sneo_bigshot_l';
  rt.destroy(big);expect([last.live,rt.globals.turntimer,controller.mercyaccumulated,rt.globals.hittarget[0]]).toEqual([false,1,5,1]);
  expect(rt.all(objects.obj_sneo_lastattack_hitbox)).toHaveLength(0);
 });
 it('large explosion lowers damaged enemy HP but keeps a negative result at one',()=>{
  const {rt,objects}=scene();Object.assign(rt.globals,{monsterhp:[4],monstermaxhp:[100],flag:[]});
  const big=rt.create(objects.obj_sneo_bigshot,500,215);big.sprite='spr_sneo_bigshot_l';rt.destroy(big);expect(rt.globals.monsterhp[0]).toBe(1);
 });
 it('large shot crossing its threshold first marks contact, then starts explosion next Step',()=>{
  const {rt,objects}=scene();const last=rt.create(objects.obj_sneo_lastattack,438,80),big=rt.create(objects.obj_sneo_bigshot,390,215);big.sprite='spr_sneo_bigshot_l';
  run(rt,big,'step');expect([big.playerhit,big.timer,big.damage,last.endattack]).toEqual([1,0,0,2]);
  run(rt,big,'step');expect([big.timer,big.attackisdone,big.destroyable,big.hspeed,last.endattack]).toEqual([2,1,0,0,2]);
  run(rt,big,'draw');expect([last.endattack,big.explodesfx]).toEqual([3,1]);
 });
 it('the fake soul hides off-box and restores the actual soul on cleanup',()=>{
  const {rt,objects,soul}=scene();const f=rt.create(objects.obj_sneo_fakeheart,310,190);f.state=1;run(rt,f,'endStep');
  expect([f.x,f.imageAlpha,f.speed]).toEqual([720,0,0]);f.x=210;f.y=170;rt.globals.turntimer=0;rt.destroy(f);
  expect([soul.x,soul.y,soul.color,soul.imageAlpha,rt.globals.inv]).toEqual([210,170,1,1,-1]);
 });
 it('the finale afterimage starts at exact full size then the shrinking box ends the turn',()=>{
  const {rt,objects,box}=scene();const g=rt.create(objects.obj_finale_growtangle,320,240);run(rt,g,'step');
  const a=rt.byId(g.d)!;expect([g.timer,g.imageXscale,a.sprite,a.imageXscale,a.imageAlpha,a.imageBlend]).toEqual([15,2,box.sprite,2,1,0xffffff]);
  g.growcon=3;g.timer=16;run(rt,g,'step');expect([g.live,rt.globals.turntimer]).toEqual([false,0]);
 });
 it('dollars keep inherited offscreen cleanup during fade and turn toward the moving mouth',()=>{
  const {rt,objects,form}=scene();const d=rt.create(objects.obj_sneo_dollar,300,150);d.startscale=2;
  run(rt,d,'step');expect(d.friction).toBeCloseTo(-0.1);expect(d.imageXscale).toBe(2);
  d.x=form.x+form.mouthx-30;d.y=100;run(rt,d,'step');expect(d.y).toBe(105);expect(d.imageXscale).toBe(1);
  d.fade=1;d.imageAlpha=0.05;d.x=800;run(rt,d,'step');expect([d.live,d.speed]).toEqual([false,0]);
 });
 it('finale projectiles retain rotation after offscreen Destroy and charged shots only destroy their target',()=>{
  const {rt,objects}=scene();const b=rt.create(objects.obj_sneo_finale_bullet,800,200);b.destroyable=1;run(rt,b,'step');
  expect([b.live,b.imageAngle,b.flashsiner]).toEqual([false,36,1]);
  const c=rt.create(objects.obj_sneo_finale_bullet,300,200);c.destroyable=1;
  const shot=rt.restore(objects.obj_yheart_shot,100100,300,200,{big:1,makeanim:1});
  const parent=c.object.parent!;parent.collisions![0].run(c,shot,rt);expect([c.live,shot.live]).toEqual([false,true]);
 });
});
