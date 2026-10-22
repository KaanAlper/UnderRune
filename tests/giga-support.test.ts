import {describe,it,expect} from 'vitest';
import {GmRuntime,GmInstance,resolveEvent,type GmObjectDef} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
import {createGigaSupport} from '../src/remake/bosses/giga-queen/support';
import {GmRandom} from '../src/remake/gm/random';
function scene(){const rt=new GmRuntime(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]}),{seed:11});rt.globals={chapter:2,boxingphase:1,bmenuno:0,hp:[0,100],maxhp:[0,200],flag:[]};const objects:Record<string,GmObjectDef>={};let index=3000;const object=(n:string)=>objects[n]??(objects[n]={name:n,index:index++});for(const d of createGigaSupport(object))objects[d.name]=d;const c=rt.restore(object('o_boxingcontroller'),99998,320,450,{wireframe_boxing:0,dead:0,drawflip:0,hurttimer:0,invincible:0,boxingtimer:100,punchcon:0});const q=rt.restore(object('o_boxingqueen'),99999,300,220,{drawflip:0,phase_transition:0,health_count:1000,health_count_max:1500,health_count_prev:1100,health_count_prev_timer:2});return {rt,objects,c,q};}
describe('GIGA source support events',()=>{
 it.each([['spr_bqueen_kick_cancan','kick_hitbox','leggy_hitbox',120],['spr_bqueen_leggy_tall','leggy_hitbox','kick_hitbox',110]])('moves and removes only its own %s background hitbox', (sprite,own,other,offset)=>{
  const strict=GmInstance.strict;GmInstance.strict=true;
  try{
   const {rt,objects}=scene(),piece=rt.create(objects.obj_bgattack_piece,320,380);piece.sprite=String(sprite);
   const step=()=>resolveEvent(piece.object,'step')!(piece,rt);step();
   const hitbox=rt.byId(piece[String(own)])!;expect(hitbox.y).toBe(piece.y-Number(offset));expect(String(other) in piece).toBe(false);
   piece.y=400;step();expect(hitbox.live).toBe(false);expect(piece.create_hitbox).toBe(3);
  }finally{GmInstance.strict=strict;}
 });
 it('evaluates dust scale before its random sign in the source multiplication',()=>{
  const {rt,objects}=scene(),r=GmRandom.restore(rt.random.snapshot());r.choose('spr_dust1','spr_dust2');r.random(-.1);
  const scale=Math.fround(r.randomRange(.5,1)*r.choose(-1,1));const dust=rt.create(objects.obj_boxing_closing_block_dust,0,0);expect(dust.imageXscale).toBe(scale);
 });
 it('initializes hit-effect motion before either player or boss impact variant runs',()=>{
  const {rt,objects}=scene(),fx=rt.create(objects.obj_boxing_hit_fx,0,0);
  expect([fx.speed,fx.gravity]).toEqual([12,1]);resolveEvent(fx.object,'user1')!(fx,rt);expect(fx.speed).toBe(12);
 });
 it('keeps breath rotation attached after its target changes from instance id to object index',()=>{
  const {rt,objects}=scene();rt.restore(objects.obj_heart??(objects.obj_heart={name:'obj_heart',index:9990}),99996,0,0);
  const controller=rt.restore(objects.obj_bqueen_breath_controller,99995,0,0,{place1:0,damage:4,target:0});
  const flame=rt.create(objects.obj_bqueen_breath,0,0);flame.rotator_target=controller.id;
  resolveEvent(flame.object,'step')!(flame,rt);resolveEvent(flame.object,'step')!(flame,rt);
  expect(flame.live).toBe(true);expect(flame.rotator_target).toBe(controller.object.index);expect(flame.length).toBe(14);
 });
 it('keeps hitbox lifecycle and source blend precedence',()=>{const {rt,objects}=scene();const h=rt.create(objects.o_boxing_hitbox,0,0);expect([h.timer,h.damage,h.f,h.hit_jumping,h.graze_points]).toEqual([2,10,2,1,5]);resolveEvent(h.object,'step')!(h,rt);expect([h.timer,h.live,h.imageBlend]).toEqual([1,true,0xffff00]);resolveEvent(h.object,'step')!(h,rt);expect(h.live).toBe(false);});
 it('follows the controller with the fist and expires on its eighth step',()=>{const {rt,objects,c}=scene();const h=rt.create(objects.o_boxingcontroller_fist_hitbox,0,0);for(let i=0;i<7;i++)resolveEvent(h.object,'step')!(h,rt);expect([h.x,h.y,h.timer,h.live]).toEqual([c.x,c.y,7,true]);resolveEvent(h.object,'step')!(h,rt);expect(h.live).toBe(false);});
 it('creates both baseball hitboxes and preserves the inner maker id binding',()=>{const {rt,objects}=scene();const b=rt.create(objects.obj_bq_baseball,300,20);const h=rt.byId(b.baseball_hitbox)!;expect([h.maker_id,h.baseball,h.damage,h.imageXscale,h.timer]).toEqual([h.id,1,25,4,200]);expect(rt.byId(b.wheel_hitbox_graze)!.graze_only).toBe(1);});
 it('advances laser timing in Draw and emits source hitbox dimensions',()=>{const {rt,objects}=scene();const l=rt.create(objects.obj_bq_laser,300,120);resolveEvent(l.object,'draw')!(l,rt);const h=rt.first(objects.o_boxing_hitbox)!;expect([l.timer,l.state,h.hit_ducking,h.imageYscale,h.imageXscale,h.damage]).toEqual([40,0,1,20,3,20]);});
});
