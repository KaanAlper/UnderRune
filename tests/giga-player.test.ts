import {describe,it,expect} from 'vitest';
import {GmRuntime,type GmObjectDef} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
import {setSourceText} from '../src/remake/host/text';
import {createGigaPlayer} from '../src/remake/bosses/giga-queen/player';
function fixture(){
 setSourceText(Object.fromEntries([18,19,20].map(n=>['o_boxingcontroller_slash_Create_0_gml_'+n+'_0','fixture'])));
 const rt=new GmRuntime(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]}),{seed:11}),defs:Record<string,GmObjectDef>={};let index=6000;
 const object=(name:string)=>defs[name]??(defs[name]={name,index:index++});
 Object.assign(rt.globals,{chapter:2,hp:[0,200,0,-1],maxhp:[0,200,160,140],flag:Array(700).fill(0),boxingphase:0,turntimer:0,maxtension:250,tension:0,batmusic:[0],actcost:[[0,0,50]]});
 const q=rt.create(object('o_boxingqueen'),320,200);Object.assign(q,{phase_transition:0,phase_transition_timer:0,health_count:1500,health_count_max:1500,state:0,attacktype:0,attackcon:0,attacktimer:0,invincible_l:0,invincible_r:0,movetimer:0,attackthreshold:30,attackorderlooping:0,damagetakenincrease:0,pacifist:1,combo:0,bouncetimer:0,times_hit_in_a_row:0,shortcomboend:0,dizzytimer:0,noattack:0,makedizzy:0,basex:320,basey:200,arcade:0,health_count_prev_timer_set:24,blocking:-1});
 const e=rt.create(object('obj_gigaqueen_enemy'),0,0);Object.assign(e,{acting:0,playerhasntdodged:0,breathattack:0,missleattack:0,myself:0,healcount:0,didntcounterthisturn:0,didntpunchthisturn:0,didntdodgethisturn:0,recentphasetransition:0});
 const def=createGigaPlayer(object);const s=rt.create(def,10,20);rt.first(object('o_boxinghud'))!.sub_healthbar_count=2;
 return {rt,s,q,e,def,object,step:()=>def.events!.step!(s,rt)};
}
describe('GIGA player source controller',()=>{
 it('initializes the source geometry, health, counters and fist offsets',()=>{const {s,rt}=fixture();expect([s.x,s.y,s.depth,s.c,s.f,s.health_count,s.i,s.invincibility_timer]).toEqual([320,390,7,250,2,200,20,0]);expect(rt.globals.hp.slice(1)).toEqual([200,1,1]);expect(s.imagefistx.slice(0,7)).toEqual([-38,-20,-14,-20,-18,0,-62]);expect(s.imagefisty[6]).toBe(-70);expect(s.specialactive).toEqual([0,0,0,0]);});
 it('freezes action state and timers while a baseball is hit',()=>{const c=fixture();const b=c.rt.create(c.object('obj_bq_baseball'),0,0);b.hit=1;b.hit_timer=2;c.s.vspeed=4;c.s.buffer_z=3;c.step();expect([c.s.vspeed,c.s.buffer_z,c.s.invincibility_timer]).toEqual([0,3,0]);});
 it('starts a punch and advances its first timer in the same step',()=>{const c=fixture();c.rt.globals.boxingphase=2;c.s.boxingtimer=100;c.s.cancontrol=1;c.rt.input.pressed.add(90);c.step();expect([c.s.punchcon,c.s.punchtimer,c.s.vspeed,c.s.hspeed,c.s.friction,c.s.buffer_z]).toEqual([2,1,-24,-8,4,1]);});
 it('applies source hurt and dodge first-frame physics',()=>{const c=fixture();c.rt.globals.boxingphase=2;c.s.boxingtimer=100;c.s.dodgecon=1;c.s.drawflip=0;c.step();expect(c.s.dodging).toBe(1);expect(c.s.hspeed).toBeCloseTo(23.04);expect(c.s.dodgetimer).toBe(1);c.rt.userEvent(c.s,2);c.step();expect([c.s.hurtcon,c.s.hurttimer,c.s.vspeed,c.s.hspeed]).toEqual([2,1,10,-6]);});
 it('preserves the source reduction branch order and defended minimum damage',()=>{const c=fixture();const hit=c.rt.create(c.object('o_boxing_hitbox'),0,0);Object.assign(hit,{baseball:0,graze_only:0,hit_ducking:1,hit_dodging:1,hit_jumping:1,final_attack:0,damage:60,kick:0,hit_direction:1,give_hurt:9,give_invincibility:5});c.s.damagetakenthisturn=130;c.def.collisions![0].run(c.s,hit,c.rt);expect([c.rt.globals.hp[1],c.s.damagetakenthisturn,c.s.hurt_length,c.s.invincibility_timer]).toEqual([164,166,9,-5]);expect(c.rt.all(c.object('obj_boxing_hit_fx')).length).toBe(3);});
 it('expires invincibility only when its signed timer reaches zero',()=>{const c=fixture();c.s.invincible=1;c.s.invincibility_timer=-2;c.step();expect(c.s.invincible).toBe(1);c.step();expect(c.s.invincible).toBe(0);});
});




describe('GIGA player punch and turn boundaries',()=>{
 it('deals the opening-round damage, writes the opponent reaction, and creates one precise mover',()=>{
  const c=fixture();c.rt.globals.boxingphase=2;c.s.boxingtimer=100;c.s.punchcon=3;c.s.hitattempt=0;c.s.drawflip=0;c.q.drawflip=0;
  c.step();
  expect(c.q.health_count).toBe(1465);expect([c.s.punchcon,c.s.punchtimer,c.s.y,c.q.state,c.q.drawflip,c.q.noattack]).toEqual([4.5,1,350,1,1,1]);expect([-1,-3]).toContain(c.q.hitanim);
  expect(c.rt.all(c.object('obj_move_precise')).length).toBe(1);expect(c.rt.all(c.object('obj_boxing_hit_fx')).length).toBe(1);expect(c.rt.globals.tension).toBe(2.5);
 });
 it('takes no extra hit when the strike side is invincible and starts the miss return',()=>{
  const c=fixture();c.rt.globals.boxingphase=2;c.s.boxingtimer=100;c.s.punchcon=3;c.s.hitattempt=0;c.s.drawflip=0;c.q.invincible_l=1;c.step();expect(c.q.health_count).toBe(1500);expect(c.s.punchcon).toBe(4);expect(c.s.vspeed).toBeCloseTo(-16.2);expect(c.s.miss_timer).toBe(1);
 });
 it('starts a boxing turn, invokes the opponent reset, and decrements its timer in that same step',()=>{
  const c=fixture();c.rt.globals.boxingphase=1;let resets=0;c.q.object.events={user6:()=>resets++};c.step();expect([resets,c.rt.globals.boxingphase,c.s.cancontrol,c.s.boxingtimer,c.q.myturn,c.q.movetimer]).toEqual([1,2,1,269,1,90]);
 });
 it('waits for an active duck before returning to menus at the end of a turn',()=>{
  const c=fixture();c.rt.globals.boxingphase=2;c.s.boxingtimer=0;c.s.duckcon=1;c.step();expect(c.rt.globals.boxingphase).toBe(2);expect(c.s.nextphase).toBe(0);
 });
 it('creates source flame bursts with the instance loop counter and a single random base angle',()=>{
  const c=fixture();c.s.flamepunch=1;c.s.special_punch_turns=1;c.s.special_punch_count=1;c.s.flameactive=1;c.s.flametimer=-10;c.s.imageIndex=2;
  c.step();expect(c.rt.all(c.object('o_boxingflame')).length).toBe(8);expect([c.s.i,c.s.flamepunch,c.s.flametimer]).toEqual([8,0,-10]);const angles=c.rt.all(c.object('o_boxingflame')).map(f=>f.direction);expect(angles[1]-angles[0]).toBeCloseTo(45);
 });
});
