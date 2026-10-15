import {describe,it,expect} from 'vitest';
import {GmRuntime,resolveEvent,type GmEvent,type GmInstance} from '../src/remake/gm/runtime';
import {GmRandom} from '../src/remake/gm/random';
import {spriteBank} from '../src/remake/gm/sprites';
import {installNeoHost} from '../src/remake/host/neo';
import {hooksOf} from '../src/remake/deltarune/rules';
import {createNeoFace} from '../src/remake/bosses/spamton-neo/face';

const run=(rt:GmRuntime,s:GmInstance,event:GmEvent)=>resolveEvent(s.object,event)!(s,rt);
function scene(){
 const rt=new GmRuntime(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[{
  name:'spr_battlebg_0',width:80,height:80,originX:40,originY:40,bboxMode:0,left:0,right:79,top:0,bottom:79,
  sepMasks:0,frames:2,special:false,playbackSpeed:1,playbackType:0,
 }]}),{seed:11});
 rt.globals={chapter:2,turntimer:500,monsterat:[13]};
 const {objects}=installNeoHost(rt);
 for(const def of createNeoFace(n=>objects[n]))objects[def.name]=def;
 const enemy=rt.restore(objects.obj_spamton_neo_enemy,99999,0,0,{eyeshp:16,nosehp:16,mouthhp:16,facebroken:0,hellmode:0});
 const soul=rt.restore(objects.obj_heart,99998,220,160);
 const box=rt.restore(objects.obj_growtangle,99997,280,160);
 const face=rt.create(objects.obj_sneo_faceattack,400,100);
 return {rt,objects,enemy,soul,box,face};
}
function pieces(){const c=scene();c.face.target=2;c.face.damage=65;c.rt.userEvent(c.face,0);return {...c,eyes:c.rt.byId(c.face.eyes)!,nose:c.rt.byId(c.face.nose)!,mouth:c.rt.byId(c.face.mouth)!};}
const hit=(s:GmInstance,shot:GmInstance,rt:GmRuntime)=>s.object.collisions!.find(c=>c.target.name==='obj_yheart_shot')!.run(s,shot,rt);

describe('NEO face factory source behavior',()=>{
 it('owns the ring hook and creates all pieces with source HP and targeting',()=>{
  const {rt,face,eyes,nose,mouth}=pieces();expect(hooksOf(face).ringsShots?.(face,rt)).toBe(false);
  expect([eyes.type,nose.type,mouth.type,eyes.hp,nose.target,mouth.damage,face.inst]).toEqual([1,2,3,16,2,65,face.id]);
  run(rt,face,'step');expect(hooksOf(face).ringsShots?.(face,rt)).toBe(true);
  rt.userEvent(eyes,0);expect(eyes.boss).toBe(0);
 });
 it('breaks a part with a charged shot while preserving hell-mode damage and reticle cleanup',()=>{
  const {rt,objects,eyes,enemy}=pieces();run(rt,eyes,'step');eyes.imageAlpha=1;enemy.hellmode=1;enemy.eyeshp=2;
  const shot=rt.restore(objects.obj_yheart_shot,100500,0,0,{big:1,makeanim:1});hit(eyes,shot,rt);
  expect([enemy.eyeshp,eyes.broken,eyes.explodetimer,eyes.invincibilitytimer,shot.live]).toEqual([0,1,16,10,false]);
  run(rt,eyes,'step');expect([rt.byId(eyes.targ),eyes.destroytarget]).toEqual([undefined,1]);
 });
 it('uses right-to-left random coordinates for explosion crescents',()=>{
  const {rt,objects,eyes}=pieces();run(rt,eyes,'step');eyes.explodetimer=2;
  const expected=GmRandom.restore(rt.random.snapshot()),y=eyes.y+32-25+expected.random(50),x=eyes.x+58-25+expected.random(50);
  run(rt,eyes,'step');const cres=rt.first(objects.obj_boxing_crescent)!;
  expect([cres.x,cres.y,cres.depth,eyes.explodetimer]).toEqual([Math.fround(x),Math.fround(y),eyes.depth-100,1]);
  expect(rt.random.snapshot()).toEqual(expected.snapshot());
 });
 it('emits eye beams carrying parent damage and source acceleration',()=>{
  const {rt,eyes,nose,mouth}=pieces();nose.broken=1;mouth.broken=1;eyes.timer=29;
  run(rt,eyes,'step');const beam=rt.byId(eyes.laser)!;
  expect([beam.object.name,beam.damage,beam.target,beam.element,beam.my_speed,beam.my_accel,eyes.brokenmod]).toEqual(['obj_werewire_bullet_lasercircle',65,2,6,7,0.5,2]);
 });
 it('emits nose bullets with local loop index and caller dark-size identity',()=>{
  const {rt,nose}=pieces();nose.timer=79;run(rt,nose,'step');
  const bullets=rt.instances.filter(s=>s.sprite==='spr_spamtonneo_faceAttack_nose_bullet');
  expect(bullets.map(s=>[s.vspeed,s.hspeed,s.imageXscale,s.element])).toEqual([[-4,-3,2,6],[0.5,-3,2,6],[5,-3,2,6]]);
  expect(nose.inst).toBe(bullets[2].id);expect('i' in nose).toBe(false);
 });
 it('updates flash and invincibility only in Draw with hurt priority',()=>{
  const {rt,eyes}=pieces();run(rt,eyes,'step');eyes.shootflashtimer=3;eyes.hurtflashtimer=2;eyes.invincibilitytimer=10;
  run(rt,eyes,'draw');expect([eyes.shootflashtimer,eyes.hurtflashtimer,eyes.invincibilitytimer,eyes.imageBlend]).toEqual([2,1,9,255]);
 });
 it('ignores invisible parts and destroys invincible normal shots without a hit effect',()=>{
  const {rt,objects,eyes,enemy}=pieces();run(rt,eyes,'step');
  const shot=rt.restore(objects.obj_yheart_shot,100500,0,0,{big:0,makeanim:1});hit(eyes,shot,rt);
  expect([shot.live,enemy.eyeshp]).toEqual([true,16]);eyes.imageAlpha=1;eyes.invincibilitytimer=3;hit(eyes,shot,rt);
  expect([shot.live,enemy.eyeshp,'myanim' in shot]).toEqual([false,16,false]);
 });
 it('rings and consumes charged shots against a broken part without further damage',()=>{
  const {rt,objects,eyes,enemy}=pieces();eyes.imageAlpha=1;eyes.broken=1;
  const shot=rt.restore(objects.obj_yheart_shot,100500,0,0,{big:1,makeanim:1});const sounds:string[]=[];rt.sourceAudio=undefined;rt.sound=n=>sounds.push(n);
  hit(eyes,shot,rt);expect([enemy.eyeshp,shot.live]).toEqual([16,false]);expect(sounds).toEqual(['snd_bell']);
 });
 it('uses the mouth source RNG order, soul-relative speed and reset timing',()=>{
  const {rt,mouth,soul,box}=pieces();mouth.timer=11;soul.y=box.y;
  const expected=GmRandom.restore(rt.random.snapshot()),hs=expected.randomRange(-4,-7),vs=expected.randomRange(6,-2)+1;
  run(rt,mouth,'step');const b=rt.byId(mouth.bullet)!;
  expect([b.hspeed,b.vspeed,b.gravity,b.sprite,b.damage,b.target]).toEqual([Math.fround(hs),Math.fround(vs),Math.fround(-0.2),'spr_spamtonneo_faceAttack_wisp',65,2]);
  expect(rt.random.snapshot()).toEqual(expected.snapshot());mouth.timer=41;run(rt,mouth,'step');expect([mouth.timer,mouth.imageIndex]).toEqual([-40,1]);
 });
 it('keeps first-entry smash timers separate from attack timers and restores the box',()=>{
  const {rt,face,box}=scene();face.first_time=true;const start=face.x,boxStart=box.x;run(rt,face,'step');
  expect([face.x,face.smashspeed,face.timer,face.init,face.imageAlpha]).toEqual([705,25.5,0,1,1]);
  for(let n=0;n<50&&face.first_time;n++)run(rt,face,'step');
  expect([face.first_time,face.x,box.x,face.timer,face.intro_timer]).toEqual([false,start,boxStart,1,-1]);
 });
 it('applies first-entry soul recoil in End Step and clamps against the scaled box width',()=>{
  const {rt,face,box,soul}=scene();box.imageXscale=2;face.intro_timer=-1;soul.x=203;
  run(rt,face,'endStep');expect([soul.x,face.heart_recoil,face.intro_timer]).toEqual([213,9,0]);
  soul.x=400;face.heart_recoil=1;run(rt,face,'endStep');expect([soul.x,face.heart_recoil]).toEqual([336,0]);
 });
 it('preserves clamp argument order while the box is narrower than the soul margins',()=>{
  const {rt,face,box,soul}=scene();box.imageXscale=0;face.heart_recoil=1;soul.x=220;
  run(rt,face,'endStep');expect(soul.x).toBe(box.x-24);
 });
 it('keeps the circle growth and shrink blocks independent on its initial frame',()=>{
  const {rt,objects}=scene();const c=rt.create(objects.obj_werewire_bullet_lasercircle,0,0);run(rt,c,'step');
  expect([c.timer,c.siner,c.imageXscale,c.imageYscale]).toEqual([1,0.5,Math.fround(Math.fround(0.8)-0.2),Math.fround(Math.fround(0.8)-0.2)]);
 });
 it('propagates facebroken sentinels then restores all HP on master destruction',()=>{
  const {rt,objects,face,enemy}=scene();enemy.facebroken=1;rt.userEvent(face,0);
  expect(rt.byId(face.eyes)!.hp).toBe(-1);enemy.eyeshp=0;enemy.nosehp=0;enemy.mouthhp=0;
  rt.create(objects.obj_sneo_faceattack_target,0,0);rt.destroy(face);
  expect([enemy.eyeshp,enemy.nosehp,enemy.mouthhp,enemy.facebroken,rt.count(objects.obj_sneo_faceattack_target)]).toEqual([16,16,16,2,0]);
 });
 it('creates source beam tail segments and rotates even after offscreen destruction',()=>{
  const {rt,objects}=scene();const c=rt.create(objects.obj_werewire_bullet_lasercircle,0,0);c.timer=3;c.my_speed=7;c.my_accel=0.5;run(rt,c,'step');
  const b=rt.byId(c.laser)!;expect([b.sprite,b.imageIndex,b.speed,b.friction,b.grazepoints]).toEqual(['spr_bullet_laser_front_sneo',1,7,-0.5,3]);
  b.x=-100;b.my_angle_change=12;run(rt,b,'step');expect([b.live,b.direction,b.imageAngle]).toEqual([false,192,192]);
 });
});
