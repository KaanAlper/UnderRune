import fs from 'node:fs';
import {afterEach,beforeEach,describe,expect,it} from 'vitest';
import {GmInstance,GmRuntime} from '../src/remake/gm/runtime';
import {installNeoHost} from '../src/remake/host/neo';
import {tinyRalsei} from '../src/remake/bosses/spamton-neo/pending';
import {loadSprites} from './parity/reference';
import {instancesMeet} from '../src/remake/gm/collision';

const available=fs.existsSync('extracted/chapter2_windows/sprites.json');
let previousStrict:boolean;
beforeEach(()=>{previousStrict=GmInstance.strict;GmInstance.strict=true;});
afterEach(()=>{GmInstance.strict=previousStrict;});

function scene(){
 const rt=new GmRuntime(loadSprites(2),{seed:11});
 rt.globals={chapter:2,flag:Array(1000).fill(0),inv:1000,turntimer:500};
 const {objects}=installNeoHost(rt);
 // A battle snapshot isolates the soul/guard from menus, attack selection and grazing.
 // Keep the installed soul's real movement event and canonical collision ancestry.
 const soul=rt.restore(objects.obj_heart,99999,300,160,{
  wspeed:4,canmove:1,color:0,disableslow:0,remove_slow_z_buffer:40,boundaryup:0,dmgnoise:0,
 });
 const guard=rt.create(tinyRalsei,0,0);
 const frame=(n=1)=>{for(let i=0;i<n;i++)rt.step();};
 return {rt,objects,soul,guard,frame};
}

function exposedScene(){
 const s=scene(),g=s.rt.globals;
 // Contact damage only needs the party HUD anchor; its type does not participate
 // in bullet collision dispatch. Restore a canonical marker instead of running a menu.
 const anchor=s.rt.restore(s.objects.obj_heartmarker,99998,50,200,{myheight:40});
 Object.assign(g,{inv:-1,invc:1,hp:[0,120,140,100],maxhp:[0,120,140,100],char:[1,2,3],
  battledf:[0,0,0],charaction:[0,0,0],charinstance:[anchor.id,anchor.id,anchor.id],
  itemelement:Array.from({length:4},()=>[0,0,0]),itemelementamount:Array.from({length:4},()=>[0,0,0])});
 // Hold cancel to park the actual source orbit on the incoming side of the soul.
 s.rt.input.held.add(88);s.frame(10);s.guard.place=0;s.frame();
 return s;
}

describe.skipIf(!available)('FluffyGuard through the installed Chapter 2 host',()=>{
 it('resolves the ACT stub and follows the moving soul in End Step',()=>{
  const {rt,objects,soul,guard,frame}=scene();
  expect(guard.object).toBe(objects.obj_sneo_tiny_ralsei);
  rt.input.held.add(39);frame();
  expect([soul.x,guard.x,guard.y,guard.visible]).toEqual([304,341,170,true]);
  rt.input.held.clear();rt.input.held.add(40);frame();
  expect(soul.y).toBe(164);
  expect(Math.hypot(guard.x-soul.x-10,guard.y-soul.y-10)).toBeCloseTo(27,4);
  expect(guard.y).toBeLessThan(soul.y+10);
  expect(guard.depth).toBe(soul.depth-1);
 });

 it.each([88,16])('holds the orbit with cancel key %i and resumes after release',key=>{
  const {rt,guard,frame}=scene();rt.input.held.add(key);frame(10);
  const angle=guard.place;expect(guard.myspeed).toBe(0);
  frame(5);expect(guard.place).toBe(angle);
  rt.input.held.clear();frame(9);
  expect(guard.myspeed).toBe(8);expect(guard.place).toBeGreaterThan(angle);
 });

 it('intercepts canonical wall bullets during normal runtime collision dispatch, including cooldown',()=>{
  const {rt,objects,guard,frame}=scene();frame();
  const hit=()=>{
   const bullet=rt.create(objects.obj_sneo_wallbullet_new,guard.x,guard.y);
   bullet.imageXscale=bullet.imageYscale=0.1;
   frame();return bullet;
  };
  expect(hit().live).toBe(false);expect([guard.hp,guard.alarm[0]]).toEqual([27,10]);
  const effect=rt.first(objects.obj_afterimage_cut)!;
  expect(effect).toBeDefined();expect(effect.sprite).toBe('spr_sneo_crew');
  // A second projectile is intercepted even while the guard cannot lose HP again.
  expect(hit().live).toBe(false);expect([guard.hp,guard.alarm[0],guard.visible]).toEqual([27,9,false]);
  frame(9);expect(guard.alarm[0]).toBe(-1);
  expect(hit().live).toBe(false);expect(guard.hp).toBe(24);
 });

 it.each([
  ['spr_spamtonneo_faceAttack_nose_bullet',27],
  ['spr_spamtonneo_faceAttack_wisp',27],
  ['spr_bullet_laser_square',27],
  ['spr_sneo_bullet1',20],
 ])('uses the specific regular-bullet collision for %s rather than its collide-bullet parent', (sprite,hp)=>{
  const {rt,objects,guard,frame}=scene();frame();
  const bullet=rt.create(objects.obj_regularbullet,guard.x,guard.y);
  bullet.sprite=sprite;bullet.imageXscale=bullet.imageYscale=0.1;
  frame();expect(bullet.live).toBe(false);expect(guard.hp).toBe(hp);
 });

 it('ignores inactive large lasers and applies the active laser cooldown without destroying it',()=>{
  const {rt,objects,guard}=scene();
  // A laser's charge/activation is Draw-owned; exercise both source collision states
  // without starting the separate boss/arm choreography needed by its Step event.
  const laser=rt.restore(objects.obj_sneo_biglaser,99998,0,0,{active:0});
  const collision=guard.object.collisions!.find(c=>c.target===objects.obj_sneo_biglaser)!;
  collision.run(guard,laser,rt);expect(guard.hp).toBe(30);
  laser.active=1;collision.run(guard,laser,rt);
  expect([guard.hp,guard.alarm[0],laser.live]).toEqual([20,10,true]);
  collision.run(guard,laser,rt);expect(guard.hp).toBe(20);
 });

 it('fades and destroys a depleted guard without intercepting another projectile',()=>{
  const {rt,objects,guard,frame}=scene();frame();guard.hp=0;frame();
  expect(guard.active).toBe(0);expect(guard.imageAlpha).toBeCloseTo(0.95);
  const bullet=rt.create(objects.obj_regularbullet,guard.x,guard.y);
  bullet.sprite='spr_sneo_bullet1';bullet.imageXscale=bullet.imageYscale=0.1;
  frame();expect(bullet.live).toBe(true);expect(guard.hp).toBe(0);
  frame(18);expect(guard.live).toBe(false);expect(rt.count(tinyRalsei)).toBe(0);
 });

 it.each(['obj_sneo_wallbullet_new','obj_regularbullet'])('intercepts a full-size %s before exposed-heart damage when both overlap',name=>{
  const {rt,objects,soul,guard,frame}=exposedScene();
  const bullet=rt.create(objects[name],soul.x+19,soul.y+10);
  if(name==='obj_regularbullet')bullet.sprite='spr_sneo_bullet1';
  // Both masks overlap before collision dispatch: this fails if heart damage wins
  // the canonical collision-order race even though guard visuals look correct.
  expect(instancesMeet(rt.bank,soul,bullet)).toBe(true);
  expect(instancesMeet(rt.bank,guard,bullet)).toBe(true);
  expect(rt.globals.inv).toBeLessThan(0);
  frame();expect(bullet.live).toBe(false);expect(rt.globals.hp[1]).toBe(120);
  expect(guard.hp).toBe(name==='obj_regularbullet'?20:27);
 });

 it('the unprotected control really damages the exposed soul with the same full-size bullet',()=>{
  const {rt,objects,soul,guard,frame}=exposedScene();rt.destroy(guard);
  const bullet=rt.create(objects.obj_regularbullet,soul.x+19,soul.y+10);bullet.sprite='spr_sneo_bullet1';
  expect(instancesMeet(rt.bank,soul,bullet)).toBe(true);
  frame();expect(rt.globals.hp[1]).toBe(110);expect(bullet.live).toBe(false);
 });

 it('intercepts an incoming full-size flying-head projectile before it reaches the exposed soul',()=>{
  const {rt,objects,soul,guard,frame}=exposedScene();
  const bullet=rt.create(objects.obj_sneo_lilguy_bullet,soul.x+80,soul.y+10);
  bullet.direction=180;bullet.speed=8;
  for(let i=0;i<12&&bullet.live;i++)frame();
  expect(bullet.live).toBe(false);expect(bullet.x).toBeGreaterThan(soul.x+20);
  expect(guard.hp).toBe(20);expect(rt.globals.hp[1]).toBe(120);
 });

 it('preserves the original basic-bullet exception: guard contact costs HP but does not consume this projectile',()=>{
  const {rt,objects,soul,guard,frame}=exposedScene();
  const bullet=rt.create(objects.obj_basicbullet_sneo,soul.x+80,soul.y+10);
  bullet.direction=180;bullet.speed=4;
  for(let i=0;i<20&&guard.hp===30&&bullet.live;i++)frame();
  expect(guard.hp).toBe(20);expect(bullet.live).toBe(true);expect(rt.globals.hp[1]).toBe(120);
  frame(12);expect(rt.globals.hp[1]).toBe(110);expect(bullet.live).toBe(false);
 });
});
