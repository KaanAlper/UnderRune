import {describe,it,expect} from 'vitest';
import {GmRuntime,resolveEvent,type GmEvent,type GmInstance} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
import {installNeoHost} from '../src/remake/host/neo';
import {createNeoLasers} from '../src/remake/bosses/spamton-neo/lasers';
import {moveTowardsPoint} from '../src/remake/gm/runtime';
import {GmRandom} from '../src/remake/gm/random';

const run=(rt:GmRuntime,s:GmInstance,event:GmEvent)=>resolveEvent(s.object,event)!(s,rt);
function scene(){
 const rt=new GmRuntime(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]}),{seed:11});rt.globals={chapter:2,turntimer:500,monsterat:[13]};
 const {objects}=installNeoHost(rt);for(const def of createNeoLasers(n=>objects[n]))objects[def.name]=def;
 const enemy=rt.restore(objects.obj_spamton_neo_enemy,99999,0,0,{myself:0,difficulty:0,partmode:3});
 rt.restore(objects.obj_sneo_bulletcontroller,99998,0,0,{target:2});const soul=rt.restore(objects.obj_heart,99997,230,160);soul.depth=-5;
 return {rt,objects,enemy,soul};
}
describe('NEO lasers and Spamton shot factory behavior',()=>{
 it('creates an inactive beam, telegraph and object-resource follower',()=>{
  const {rt,objects}=scene();const laser=rt.create(objects.obj_sneo_biglaser,400,100);
  expect([laser.damage,laser.target,laser.active,laser.mask,laser.grazepoints]).toEqual([65,2,0,'spr_nothing',10]);
  const follower=rt.first(objects.obj_sneo_biglaser_friendlyhitbox)!;expect([follower.source,follower.visible]).toEqual([637,false]);
  laser.imageYscale=0.5;laser.imageAngle=17;run(rt,follower,'endStep');expect([follower.x,follower.y,follower.imageYscale,follower.imageAngle]).toEqual([400,100,0.25,17]);
 });
 it('follows the first beam resource instance and cleans up only when no beam remains',()=>{
  const {rt,objects}=scene();const a=rt.create(objects.obj_sneo_biglaser,400,100),b=rt.create(objects.obj_sneo_biglaser,500,200);
  const followers=rt.all(objects.obj_sneo_biglaser_friendlyhitbox);run(rt,followers[1],'endStep');expect(followers[1].x).toBe(a.x);
  rt.destroy(a);run(rt,followers[1],'endStep');expect(followers[1].x).toBe(b.x);
  rt.destroy(b);run(rt,followers[1],'endStep');expect(followers[1].live).toBe(false);
 });
 it('charges in Draw and retains orb loop state, resource type and parent target',()=>{
  const {rt,objects}=scene();const laser=rt.create(objects.obj_sneo_biglaser,400,100);laser._type=1;
  run(rt,laser,'draw');const orbs=rt.all(objects.obj_rouxls_power_up_orb);
  expect(orbs.map(s=>[s.lifetime,s.parenttarget,s._type,s.depth])).toEqual([[16,laser.id,1,1],[16,laser.id,1,1],[16,laser.id,1,1]]);
  expect([laser.i,laser.d,laser.effecttimer,laser.siner,laser.orbsize]).toEqual([3,orbs[2].id,1,1,1]);
 });
 it('activates and shrinks in Draw and cleans every telegraph while still drawing after Destroy',()=>{
  const {rt,objects}=scene();const laser=rt.create(objects.obj_sneo_biglaser,400,100);laser.firecon=1;laser.imageYscale=0.4;
  run(rt,laser,'draw');expect([laser.active,laser.mask]).toEqual([true,'spr_sneo_laser']);expect(laser.imageYscale).toBeCloseTo(0.5);
  laser.firecon=2;laser.imageYscale=0.001;const circles:number[]=[];rt.drawCircle=(_x,_y,r)=>{circles.push(r);};run(rt,laser,'draw');
  expect([laser.live,laser.active,rt.count(objects.obj_sneo_arm_laser_telegraph)]).toEqual([false,0,0]);expect(circles[0]).toBeLessThan(0);
 });
 it('deals inherited shared damage when Draw sets the source Boolean active flag',()=>{
  const {rt,objects}=scene();const laser=rt.create(objects.obj_sneo_biglaser,400,100);laser.target=0;laser.firecon=1;run(rt,laser,'draw');
  const hero=rt.restore(objects.obj_herokris,100501,50,200,{myheight:40});
  Object.assign(rt.globals,{inv:-1,invc:1,char:[1,2,3],hp:[0,120,140,100],maxhp:[0,120,140,100],battledf:[0,0,0],charaction:[0,0,0],
   charinstance:[hero.id,-1,-1],itemelement:[[0,0,0],[0,0,0],[0,0,0],[0,0,0]],itemelementamount:[[0,0,0],[0,0,0],[0,0,0],[0,0,0]]});
  rt.userEvent(laser,5);expect(rt.globals.hp[1]).toBe(55);expect(laser.live).toBe(true);
 });
 it('continues telegraph depth assignments after its source destruction condition',()=>{
  const {rt,objects,enemy,soul}=scene();rt.create(objects.obj_sneo_biglaser,400,100);const t=rt.first(objects.obj_sneo_arm_laser_telegraph)!;
  enemy.partmode=0;run(rt,t,'step');expect([t.live,t.depth]).toEqual([false,soul.depth+1]);
 });
 it('aims at the soul then continues pulsing and depth changes after turn-end destruction',()=>{
  const {rt,objects,soul}=scene();const shot=rt.create(objects.obj_spamtonshot,400,100);
  expect([shot.targetx,shot.targety,shot.speed,shot.target]).toEqual([soul.x,soul.y,5,2]);
  rt.globals.turntimer=0;run(rt,shot,'step');expect([shot.live,shot.dontexplode,shot.depth,shot.siner,shot.damage]).toEqual([false,1,soul.depth+2,2,65]);
 });
 it('aims with the movement builtin unrounded angle rather than point_direction rounding',()=>{
  const {rt,objects,soul}=scene();soul.x=413/37;soul.y=73.215;
  const expected=rt.restore(objects.obj_basicbullet_sneo,99995,0,0);moveTowardsPoint(expected,soul.x,soul.y,5);
  const shot=rt.create(objects.obj_spamtonshot,0,0);
  expect([shot.direction,shot.hspeed,shot.vspeed]).toEqual([expected.direction,expected.hspeed,expected.vspeed]);
 });
 it('preserves the externally reachable twenty-bullet burst and instance loop fields',()=>{
  const {rt,objects}=scene();const shot=rt.create(objects.obj_spamtonshot,400,100);shot.con=1;shot.imageXscale=0.05;shot.imageYscale=0.05;
  run(rt,shot,'step');const bullets=rt.all(objects.obj_basicbullet_sneo).filter(s=>s!==shot);
  expect(bullets).toHaveLength(20);expect(bullets.map(s=>s.destroyable)).toEqual(Array.from({length:20},(_,i)=>i%2===0?1:0));
  expect([shot.i,shot.off,shot.live,shot.shot[19],bullets[0].damage,bullets[0].angle_speed]).toEqual([20,0,false,bullets[19].id,65,shot.uniformanglespeed]);
  expect(bullets.every(s=>s.direction===0&&s.sprite==='spr_sneo_bullet_arrow')).toBe(true);
 });
 it('consumes source RNG for every mode-5 burst bullet without assigning the unused angular offset',()=>{
  const {rt,objects}=scene();const shot=rt.create(objects.obj_spamtonshot,400,100);shot.mode=5;shot.con=1;shot.imageXscale=0;shot.imageYscale=0;
  const expected=GmRandom.restore(rt.random.snapshot()),offset=expected.random(360),angular=-1+expected.random(2);
  const angles=Array.from({length:20},()=>-2+expected.random(4));run(rt,shot,'step');
  const bullets=shot.shot.map((id:number)=>rt.byId(id)!);
  expect([shot.uniformangleoff,shot.uniformanglespeed]).toEqual([offset,angular]);expect(bullets.map((b:GmInstance)=>b.angle_speed)).toEqual(angles);
  expect(bullets.every((b:GmInstance)=>b.direction===0)).toBe(true);expect(rt.random.snapshot()).toEqual(expected.snapshot());
 });
 it('exits Create before bullet initialization for a depleted heart-attack',()=>{
  const {rt,objects}=scene();rt.restore(objects.obj_sneo_heartattack,99996,0,0,{heart_health:0});const s=rt.create(objects.obj_spamtonshot,0,0);
  expect(s.live).toBe(false);expect('con' in s).toBe(false);
 });
});
