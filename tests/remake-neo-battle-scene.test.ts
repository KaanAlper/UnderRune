import {describe,it,expect} from 'vitest';
import {GmRuntime,resolveEvent,type GmEvent,type GmInstance,type GmObjectDef} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
import {GmRandom} from '../src/remake/gm/random';
import type {SpriteData} from '../src/remake/gm/sprites';
import {createNeoBattleScene,enterNeoBattleSnapshot,neoSceneDarkMarker,neoSceneDrawTiledArea,type NeoBattleSceneHost} from '../src/remake/bosses/spamton-neo/battle-scene';

const run=(rt:GmRuntime,s:GmInstance,event:GmEvent)=>resolveEvent(s.object,event)!(s,rt);
function fixture(){
 const rt=new GmRuntime(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]}),{seed:11});
 rt.view.x=1640;rt.room.name='room_dw_mansion_b_east';rt.globals={chapter:2,flag:[],tempflag:[],batmusic:[1],currentsong:[2,3]};
 const objects:Record<string,GmObjectDef>={};let index=2000;
 const calls:string[]=[];
 const host:NeoBattleSceneHost={object:name=>objects[name]??=({name,index:index++}),room:rt.room.name,
  battleBoundary:()=>{calls.push('boundary');rt.pendingRoom='battle_end';},finishBattleAudio:()=>{calls.push('audio');}};
 for(const o of createNeoBattleScene(host))objects[o.name]=o;
 const enemy=rt.restore(host.object('obj_spamton_neo_enemy'),99999,2040,80);
 return {rt,objects,host,calls,enemy};
}

describe('NEO battle scene hand port',()=>{
 it('restores the native battle snapshot without world-intro creation or RNG',()=>{
  const {rt,host,enemy,objects}=fixture(),before=rt.random.snapshot();
  const s=enterNeoBattleSnapshot(rt,host,enemy);
  expect([s.con,s.customcon,s.fightmode,s.trackspeed,s.tracky0,s.tracky1,s.tracky2,s.alarm[0],s.sneo]).toEqual([8,1,1,-15,70,150,230,120,enemy.id]);
  expect([s.drawblack,s.drawtrack,s.trackx,s.cityscape_active,s.cityscape_speed,s.cityscape_alpha,s.init,s.forcend]).toEqual([2,1,0,true,0,0,0,0]);
  const coasters=[s.coaster_kris,s.coaster_susie,s.coaster_ralsei].map(id=>rt.byId(id)!);
  expect(coasters.map(c=>[c.x,c.y,c.type,c.siner_add0,c.depth,c.visible,c.coaster_offset_x,c.coaster_offset_y])).toEqual([
   [1721,60,0,.1,90000,false,-25,40],[1718,125,1,.08,80000,false,-20,55],[1727,215,2,.09,70000,false,-30,45],
  ]);
  expect(coasters.map(c=>[rt.byId(c.actor)!.visible,c.thismarker,c.actor])).toEqual(coasters.map(c=>[false,c.actor,c.actor]));
  const controller=rt.first(objects.o_coaster_controller_sneo)!;
  expect([controller.i,controller.mykey,controller.yspot]).toEqual([3,[90,88,67],[0,0,0]]);
  expect(controller.HeroCoaster.map((id:number)=>{const c=rt.byId(id)!;return [c.HeroID,c.mykey,rt.byId(c.back)!.parentid];})).toEqual(controller.HeroCoaster.map((id:number,i:number)=>[i,[90,88,67][i],id]));
  expect(rt.random.snapshot()).toEqual(before);expect([rt.globals.tempflag[32],rt.globals.flag[54],rt.globals.flag[9]]).toEqual([1,571,1]);
 });
 it('runs tracks and cityscape in Draw in source order without RNG consumption',()=>{
  const {rt,host,enemy}=fixture(),s=enterNeoBattleSnapshot(rt,host,enemy),before=rt.random.snapshot();
  const calls:Array<[string|null,number,number]>=[];
  rt.drawSprite=(name,_frame,x,y)=>{calls.push([name,x,y]);};
  run(rt,s,'step');expect(s.trackx).toBe(0);run(rt,s,'draw');
  expect(s.trackx).toBe(625);expect(s.cityscape_speed).toBe(-5);expect(s.cityscape_alpha).toBeCloseTo(.2);
  expect(calls.slice(0,9)).toEqual([70,150,230].flatMap(y=>[-15,625,1265].map(x=>['spr_sneo_track',x,y])));
  expect(rt.random.snapshot()).toEqual(before);expect([s.depth,rt.drawState.color]).toEqual([99000,0]);
 });
 it('uses a single smoke RNG draw and keeps dash state transitions in the same step',()=>{
  const {rt,host,enemy,objects}=fixture();enterNeoBattleSnapshot(rt,host,enemy);
  const c=rt.first(objects.o_coaster_hero_sneo)!,controller=rt.first(objects.o_coaster_controller_sneo)!;
  controller.actcon=1;rt.input.pressed.add(90);c.x=1840;c.xstart=1840;c.smoketimer=1;
  const expected=GmRandom.restore(rt.random.snapshot()),v=-2+expected.random(2);run(rt,c,'step');
  expect([c.con,c.hspeed,c.mykeybuffer,c.dashtimer,controller.buttonspressed,controller.playerinput]).toEqual([0,0,2,0,1,1]);
  const smoke=rt.byId(c.smoke)!;expect([smoke.x,smoke.y,smoke.hspeed,smoke.vspeed,smoke.imageXscale,smoke.depth]).toEqual([c.x+12,c.y-10,-2,Math.fround(v),2,90000]);
  expect(rt.random.snapshot()).toEqual(expected.snapshot());smoke.imageIndex=4;run(rt,smoke,'step');expect([smoke.live,smoke.hspeed]).toEqual([false,-4]);
 });
 it('finishes coaster return in Draw and cleans battle party/controller/back objects',()=>{
  const {rt,host,enemy,objects}=fixture(),s=enterNeoBattleSnapshot(rt,host,enemy);
  const hero=rt.first(objects.o_coaster_hero_sneo)!;hero.lerpstate=2;hero.lerptimer=4;
  const party=rt.create(host.object('obj_heroparent'),0,0);
  run(rt,hero,'draw');expect(hero.live).toBe(false);expect(party.live).toBe(false);
  expect(rt.all(objects.o_coaster_hero_back_sneo)).toHaveLength(0);expect(rt.all(objects.o_coaster_controller_sneo)).toHaveLength(0);
  expect([s.coaster_kris,s.coaster_susie,s.coaster_ralsei].map(id=>rt.byId(id)!.visible)).toEqual([true,true,true]);
 });
 it('keeps victory con9/11 cleanup then reports the forcend con13 practice boundary',()=>{
  const {rt,host,enemy,objects,calls}=fixture(),s=enterNeoBattleSnapshot(rt,host,enemy);
  const controller=rt.restore(host.object('obj_battlecontroller'),100500,0,0,{intro:2});
  const bullet=rt.create(host.object('obj_bulletparent'),0,0),back=rt.restore(host.object('obj_battleback'),100501,0,0);
  s.con=9;run(rt,s,'step');expect([s.con,s.alarm[0],rt.first(objects.o_coaster_hero_sneo)!.lerpstate]).toEqual([10,5,2]);
  s.con=11;run(rt,s,'step');expect([s.con,s.alarm[0],controller.live,bullet.live,back.destroy]).toEqual([12,10,false,false,1]);expect(calls).toEqual(['audio']);
  s.con=13;s.forcend=1;run(rt,s,'step');expect(calls).toEqual(['audio','boundary']);expect(rt.pendingRoom).toBe('battle_end');expect(s.con).toBe(13);
 });
 it('delegates world intro and postbattle routes explicitly',()=>{
  const {rt,host,enemy}=fixture();const calls:number[]=[];host.worldStep=s=>{calls.push(s.con);};
  const s=enterNeoBattleSnapshot(rt,host,enemy);s.con=7;run(rt,s,'step');s.con=50;run(rt,s,'step');expect(calls).toEqual([7,50]);
 });
 it('dark-marker script preserves its caller field and the actual marker Create event',()=>{
  const {rt,host,enemy}=fixture();let created=0;
  host.object('obj_marker').events={create:s=>{created++;s.creation_field=7;}};
  const marker=neoSceneDarkMarker(enemy,rt,host.object,20,30,'spr_krisr_dark');
  expect([created,enemy.thismarker,marker.creation_field,marker.x,marker.y,marker.sprite,marker.imageSpeed,marker.imageXscale,marker.imageYscale]).toEqual([1,marker.id,7,20,30,'spr_krisr_dark',0,2,2]);
 });
 it('clips tiled-area parts at inclusive edges and visits each column before the next row',()=>{
  const rt=new GmRuntime({collisionCompat:true,roomSpeed:30,get:()=>({width:10,height:8} as SpriteData)});
  const calls:Array<Array<number|undefined>>=[];rt.drawSpritePart=(_sprite,_frame,...args)=>{calls.push(args);};
  neoSceneDrawTiledArea(rt,'test',0,5,3,7,4,21,15,1,1,123,.5);
  expect(calls).toEqual([
   [2,1,8,7,7,4,1,1,123,.5],[2,0,8,5,7,11,1,1,123,.5],
   [0,1,7,7,15,4,1,1,123,.5],[0,0,7,5,15,11,1,1,123,.5],
  ]);
 });
 it('updates shop flash in Draw and runs transition decrements in the same draw',()=>{
  const {rt,host,enemy}=fixture(),s=enterNeoBattleSnapshot(rt,host,enemy);const sounds:string[]=[];rt.sound=n=>{sounds.push(n);};
  s.shop_spamton_bg_con=1;run(rt,s,'draw');expect(sounds).toEqual(['snd_petrify']);
  s.shop_spamton_bg_timer=22;run(rt,s,'draw');expect([s.shop_spamton_bg_con,s.shop_spamton_bg_timer]).toEqual([2,22]);
  s.shop_spamton_bg_timer=1;s.cityscapefade=1;run(rt,s,'draw');expect([s.shop_spamton_bg_con,s.shop_spamton_bg_timer,s.cityscape_alpha,enemy.targetbgspeed]).toEqual([3,0,.15,5]);
  s.cityscape_speed=0;s.cityscape_speed_max=-5;run(rt,s,'draw');expect(s.cityscape_speed).toBe(-393);
 });
 it('keeps the source Destroy target distinct from the NEO back until Draw cleanup',()=>{
  const {rt,host,enemy,objects}=fixture();enterNeoBattleSnapshot(rt,host,enemy);
  const sourceBack=rt.create(host.object('o_coaster_hero_back'),0,0),hero=rt.first(objects.o_coaster_hero_sneo)!,neoBack=rt.byId(hero.back)!;
  rt.destroy(hero);expect(sourceBack.live).toBe(false);expect(neoBack.live).toBe(true);
 });
 it('preserves world-coaster sine movement, alignment and hurt Draw ordering',()=>{
  const {rt,host,enemy}=fixture(),s=enterNeoBattleSnapshot(rt,host,enemy),c=rt.byId(s.coaster_kris)!;
  c.siner_visual0=0;c.siner_direction0=90;c.siner_amplitude0=10;const y=c.y;run(rt,c,'step');
  expect(c.y).toBeCloseTo(y-Math.sin(.1)*10);expect(c.sinery).toBe(0);
  c.stop_siner=1;c.x=1767;run(rt,c,'step');expect([c.x,c.battlecoasterx,c.sinerx]).toEqual([1766,1766,0]);
  c.hurt=true;c.sinerx=3;c.sinery=4;const calls:Array<[string|null,number,number]>=[];rt.drawSprite=(name,_frame,x,y)=>{calls.push([name,x,y]);};
  run(rt,c,'draw');expect(calls.map(a=>a[0])).toEqual(['spr_sneo_car_back','spr_krisb_hurt','spr_sneo_car_front']);
  expect(calls.map(a=>a.slice(1))).toEqual([[c.x-25,c.y+40],[c.x+3,c.y+4],[c.x-25,c.y+40]]);
 });
 it('restores source hero/encounter depths and back positions in their own events',()=>{
  const {rt,host,enemy,objects}=fixture();enterNeoBattleSnapshot(rt,host,enemy);
  const heroes=HERO_NAMES_TEST.map((name,i)=>rt.restore(host.object(name),100600+i,1730,100,{depth:0}));
  const encounter=rt.restore(host.object('obj_encounterbasic'),100603,0,0,{c:heroes.map(h=>h.id)});
  const carts=rt.all(objects.o_coaster_hero_sneo);
  for(const c of carts){run(rt,c,'endStep');c.lerpstate=1;run(rt,c,'draw');run(rt,rt.byId(c.back)!,'step');}
  expect(carts.map(c=>[c.depth,c.x,rt.byId(c.back)!.x,rt.byId(c.back)!.depth])).toEqual([[80,1715,1716,82],[75,1725,1726,82],[70,1720,1721,82]]);
  expect(heroes.map(h=>h.depth)).toEqual([81,76,71]);expect(encounter.c).toEqual(heroes.map(h=>h.id));
 });
 it('selects source world-coaster types with GML numeric tolerance',()=>{
  const {rt,host,objects}=fixture(),c=rt.create(objects.obj_coaster,0,0);c.type=1.000004;run(rt,c,'step');
  expect([c.character_sprite,c.coaster_offset_x,c.coaster_offset_y,rt.byId(c.actor)!.sprite]).toEqual(['spr_susie_walk_right_dw',-20,55,'spr_susie_walk_right_dw']);
 });
 it('selects source hero Draw positions with GML numeric tolerance',()=>{
  const {rt,host,enemy,objects}=fixture();enterNeoBattleSnapshot(rt,host,enemy);
  const c=rt.all(objects.o_coaster_hero_sneo)[1];c.HeroID=1.000004;c.lerpstate=1;
  rt.restore(host.object('obj_herosusie'),100700,1730,100);run(rt,c,'draw');expect(c.x).toBe(1725);
 });
 it('keeps active-scene bolt, flying and release flags faithful to their source fields',()=>{
  const {rt,host,enemy}=fixture(),s=enterNeoBattleSnapshot(rt,host,enemy);
  s.rudebuster=true;s.sneo_fly=true;enemy.y=-200;run(rt,s,'step');
  expect([s.rudebuster,rt.byId(s.rudebusteranim)!.x,rt.byId(s.rudebusteranim)!.target,s.sneo_fly,enemy.gravity,enemy.x,enemy.y]).toEqual([false,1580,enemy.id,false,0,840,-200]);
  s.sneo_release=true;enemy.y=80;run(rt,s,'step');expect([s.sneo_release,enemy.gravity,enemy.vspeed,enemy.facing,enemy.partmode]).toEqual([false,0,0,1,1]);
 });
 it('fails with a named world dependency instead of silently ignoring an unsupported route',()=>{
  const {rt,host,enemy}=fixture(),s=enterNeoBattleSnapshot(rt,host,enemy);s.con=50;
  expect(()=>run(rt,s,'step')).toThrow('NEO world scene worldStep is not ported; source-backed callback required');
  expect(()=>{rt.view.x=0;enterNeoBattleSnapshot(rt,host,enemy);}).toThrow('Native NEO coaster snapshot requires camera (1640,0)');
 });
});
const HERO_NAMES_TEST=['obj_herokris','obj_herosusie','obj_heroralsei'];
