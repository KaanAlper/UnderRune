import {describe,it,expect} from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {GmRuntime,resolveEvent,type GmInstance,type GmObjectDef} from '../src/remake/gm/runtime';
import {GmRandom} from '../src/remake/gm/random';
import {spriteBank,type RawSprite} from '../src/remake/gm/sprites';
import {createNeoAttackObjects,neoAttackSources,endNeoAttackRoom} from '../src/remake/bosses/spamton-neo/controller';
import {executeNeoSource,type NeoSourceHost} from '../src/remake/bosses/spamton-neo/body-source';
import {parseGml} from '../src/source-runtime/gml';
import {createNeoProjectiles} from '../src/remake/bosses/spamton-neo/shot';
import {attackScriptSources} from '../src/remake/bosses/spamton-neo/attack-script-source';
import {collideBullet,regularBullet,bulletParent,bulletGenParent,inheritBullet,mergeColor,heart} from '../src/remake/deltarune/battle';
const root=path.resolve('extracted/chapter2_windows');
const hasArchive=fs.existsSync(path.join(root,'object-parents.json'));
const sourceMetadata:Record<string,any>[]=hasArchive?JSON.parse(fs.readFileSync(path.join(root,'object-parents.json'),'utf8')):[];
const raw=(name:string,width=40,height=40,frames=8):RawSprite=>({name,width,height,frames,originX:width/2,originY:height/2,bboxMode:1,left:0,right:width-1,top:0,bottom:height-1,sepMasks:0,special:false,playbackSpeed:1,playbackType:0});
const event=(s:GmInstance,rt:GmRuntime,n:'step'|'endStep'|'draw'|'create'='step')=>resolveEvent(s.object,n)!(s,rt);
function setup(difficulty=0){
 const external:Record<string,GmObjectDef>={};
 for(const meta of sourceMetadata)external[meta.name]={name:meta.name,index:meta.index};
 Object.assign(external,{obj_collidebullet:collideBullet,obj_regularbullet:regularBullet,obj_bulletparent:bulletParent,obj_bulletgenparent:bulletGenParent});
 const bank=spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[raw('spr_battlebg_0',200,140,1),...['spr_whitepx','spr_sneo_mail','spr_sneo_pipis_egg','spr_pipis_egg','spr_sneo_lilguy','spr_sneo_crew','spr_sneo_wireheart','spr_sneo_wireheart_smaller','spr_sneo_phonehands_phone','spr_sneo_phonehand','spr_yheart_shot','spr_sneo_final_forme','spr_sneo_final_forme_hitbox','spr_sneo_dollar','spr_neo_finalattack_heart','spr_sneo_arm_laser','spr_werewire_bullet_lasersquare','spr_yheart_shot_hit','spr_yheart_shot_hit3'].map(n=>raw(n))]});
 const rt=new GmRuntime(bank,{seed:29});rt.installObjectAliases([[heart,external.obj_heart]]);rt.globals={chapter:2,chemg_sprite_map:new Map([['spr_sneo_playback','spr_sneo_playback']]),mnfight:2,myfight:0,hp:[0,120,140,100],maxhp:[0,120,140,100],monster:[50,0,0],monsterat:[13],monsterattackname:['FlyingHeads','',''],mercymod:[0],turntimer:500,tension:0,maxtension:250,flag:[],msg:Array(100).fill(' '),hittarget:[0],monsterx:[460],monstery:[80]};
 const neo=rt.restore(external.obj_spamton_neo_enemy,99998,460,80,{myself:0,difficulty,hellmode:0,upgrade:0,facebroken:0,partxoff:Array(8).fill(0),partyoff:Array(8).fill(0),partx:Array(8).fill(0),party:Array(8).fill(0),partrot:Array(8).fill(0),partframe:Array(8).fill(0),vinex:0,heart_release_con:0,___myremembery:80,___myrememberx:460,eyeshp:16,nosehp:16,mouthhp:16});
 const box=rt.restore(external.obj_growtangle,99997,300,160,{sprite:'spr_battlebg_0',maxxscale:1,maxyscale:1,spr_custom_box:'spr_battlebg_0'});
 rt.restore(external.obj_battlesolid,99994,300,160);const soul=rt.restore(external.obj_heart,99996,200,160);
 rt.restore(external.obj_sneo_hitdetector,99995,460,80,{active:1});
 const calls:string[]=[];const sounds:string[]=[];
 rt.sound=n=>sounds.push(n);rt.soundStop=n=>sounds.push('stop:'+n);
 let objects:Record<string,GmObjectDef>={};
 const host:NeoSourceHost={scripts:attackScriptSources,object:n=>{const def=objects[n]??external[n];if(!def)throw Error('Missing test object '+n);return def;},text:k=>'Localized:'+k,call:(n,s,_rt,args)=>{
  calls.push(n);
  if(n==='ds_map_find_value')return args[0].get(args[1]);if(n==='merge_color')return mergeColor(args[0],args[1],args[2]);
  if(n==='snd_play_x'){rt.sound?.(args[0],args[2]);return args[0];} if(n==='snd_play'){rt.sound?.(args[0]);return args[0];}
  if(n==='snd_stop'){rt.soundStop?.(args[0]);return;}
  if(n==='snd_volume'||n==='scr_debug')return;
  if(n==='scr_isphase')return args[0]==='bullets';
  if(n==='scr_bullet_inherit'){inheritBullet(s,rt.byId(args[0])!);return;}
  throw Error('Unimplemented test host call '+n);
 }};
 objects=createNeoAttackObjects(host);
 const projectiles=createNeoProjectiles({neo:external.obj_spamton_neo_enemy,heart:external.obj_heart,faceAttack:objects.obj_sneo_faceattack,finalForm:objects.obj_sneo_final_forme,wireheart:objects.obj_sneo_wireheart});
 external.obj_yheart_shot=projectiles.shot;external.obj_yshot_anim=projectiles.impact;
 return {rt,neo,box,soul,objects,host,calls,sounds,projectiles,controller:(type:number)=>{const s=rt.create(objects.obj_sneo_bulletcontroller,0,0);s.type=type;s.damage=65;s.target=3;return s;}};
}

describe.skipIf(!hasArchive)('NORMAL NEO source attack registry',()=>{
 it('parses all retained events and helper functions, without missing source syntax',()=>{
  for(const record of neoAttackSources)for(const source of Object.values(record.sources))expect(()=>parseGml(source),record.metadata.name).not.toThrow();
  for(const [name,source] of Object.entries(attackScriptSources))expect(()=>parseGml(source),name).not.toThrow();
 });
 it('retains actual indices, masks, sprites, visibility and every native event on every attack owner',()=>{
  for(const record of neoAttackSources){const meta=sourceMetadata.find(m=>m.name===record.metadata.name)!;expect(record.metadata).toEqual(meta);
   for(const [key,source] of Object.entries(record.sources))if(record.metadata.name!=='obj_sneo_bulletcontroller'||key!=='Step_0')expect(source).toBe(fs.readFileSync(path.join(root,'code',`gml_Object_${meta.name}_${key}.gml`),'utf8').replace(/\r\n/g,'\n'));
  }
  const {objects}=setup();expect(Object.keys(objects)).toHaveLength(64);expect(objects.obj_sneo_wireheart.parent).toBe(objects.obj_basicbullet_sneo);expect(objects.obj_sneo_final_forme.parent).toBe(objects.obj_basicbullet_sneo_finale);
  for(const n of ['obj_sneo_crusher','obj_sneo_elevator_test','obj_sneo_heartattack'])expect(objects[n]).toBeUndefined();
 });
 it('starts FlyingHeads using the exact difficulty-derived guymaker and source turn time',()=>{
  for(const [difficulty,type,timer] of [[0,1,240],[1,2,240],[2,3,360],[3,4,300]]){const {rt,objects,controller}=setup(difficulty);event(controller(0),rt);const maker=rt.first(objects.obj_sneo_guymaker)!;expect(maker.type).toBe(type);expect(rt.globals.turntimer).toBe(timer);}
 });
 it('consumes source row RNG in order and emits four small heads with native physics/alarms',()=>{
  const {rt,objects}=setup();const maker=rt.create(objects.obj_sneo_guymaker,0,0);const expected=GmRandom.restore(rt.random.snapshot()),row=expected.choose(0,1);
  event(maker,rt);expect(maker.row).toBe(row);expect(rt.random.snapshot()).toEqual(expected.snapshot());
  for(let i=1;i<20;i++)event(maker,rt);const heads=rt.all(objects.obj_sneo_lilguy);expect(heads).toHaveLength(4);
  for(const head of heads){expect([head.x,head.y,head.hspeed,head.vspeed,head.alarm[0],head.alarm[1],head.alarm[2],head.gravityDirection]).toEqual([700,row===0?280:40,-18,row===0?-2:2,44,40,32,0]);expect(head.gravity).toBeCloseTo(.5);expect(head.destroyable).toBe(1);}
 });
 it('reflects regular shots from big heads, preserves head ownership and sets the source90-frame reflected projectile lifetime',()=>{
  const {rt,objects,projectiles}=setup();const head=rt.create(objects.obj_sneo_lilguy,400,160);head.destroyable=1;head.bighead=1;head.target=3;head.damage=65;
  const shot=rt.create(projectiles.shot,390,160);const collision=head.object.collisions!.find(c=>c.target===projectiles.shot)!;collision.run(head,shot,rt);
  expect([head.live,shot.live,shot.hspeed,rt.globals.tension]).toEqual([true,true,-8,1.3]);expect([-8,8,10,-10]).toContain(shot.vspeed);const doom=rt.first(objects.obj_doom)!;expect([doom.target,doom.alarm[0]]).toEqual([shot.id,90]);
 });
 it('sets the current wireheart release flag at source timer110 rather than spawning the old heartattack',()=>{
  const {rt,neo,objects,controller}=setup();const c=controller(1.5);event(c,rt);expect([c.btimer,neo.partmode]).toEqual([100,34]);for(let i=0;i<10;i++)event(c,rt);expect([neo.makeheart,neo.heart_release_con]).toEqual([1,1]);expect(rt.count(objects.obj_sneo_wireheart)).toBe(0);
 });
 it('uses both RECREW source controllers and their original RNG initialization',()=>{
  for(const difficulty of [0,1,9]){const {rt,objects,controller}=setup(difficulty);const expected=GmRandom.restore(rt.random.snapshot());event(controller(6),rt);const def=objects[difficulty===9?'obj_sneo_wall_controller':'obj_sneo_wall_controller_new'];expect(rt.count(def)).toBe(1);if(difficulty===9){expected.irandom(6);expect(rt.random.snapshot()).toEqual(expected.snapshot());}}
 });
 it('dispatches phonecall state6 to pipis type1, with difficulty3 using the actual stream',()=>{
  for(const difficulty of [0,3]){const {rt,objects}=setup(difficulty);const phone=rt.create(objects.obj_sneo_phonecall,400,80);phone.init=1;phone.state=6;phone.isattack=1;phone.talking=0;event(phone,rt);expect(phone.state).toBe(7);if(difficulty===3)expect(rt.count(objects.obj_sneo_phonecall_pipis_stream)).toBe(1);else{const c=rt.first(objects.obj_sneo_bulletcontroller)!;expect([c.type,c.damage,c.target]).toEqual([1,65,-1]);expect(rt.globals.monsterattackname[0]).toBe('FootballPipis');}}
 });
 it('emits phonehands from timer115 and creates both named orientations with canonical master references',()=>{
  const {rt,objects,controller}=setup();const c=controller(8.5);c.btimer=114;event(c,rt);const master=rt.first(objects.obj_sneo_phonehand_master)!;expect(master).toBeDefined();const hands=rt.all(objects.obj_sneo_phonehand);expect(hands.map(h=>h.orientation)).toEqual(['top','bottom']);expect(hands.map(h=>h.boss)).toEqual([master.id,master.id]);expect(master.target).toBe(3);
 });
 it('records phonehands damage only on source Destroy and caps accumulated shooting mercy at99',()=>{
  const {rt,neo,controller}=setup();neo.nothitduringphonehands=1;const c=controller(8.5);rt.globals.hp[2]--;c.mercyaccumulated=120;rt.destroy(c);expect([neo.nothitduringphonehands,rt.globals.mercymod[0],neo.partmode]).toEqual([0,99,1]);
 });
 it('installs the actual wireheart shot handler and keeps source diminishing timer reductions',()=>{
  const {rt,objects,projectiles}=setup();const w=rt.create(objects.obj_sneo_wireheart,400,160);w.type=0;w.invincibility_timer=0;
  const handler=w.object.collisions!.find(c=>c.target===projectiles.shot)!;const shot=rt.create(projectiles.shot,300,160);shot.big=1;handler.run(w,shot,rt);expect([rt.globals.turntimer,w.chargeshothitcount,shot.live]).toEqual([420,1,false]);
 });
 it('initializes finale with source1200 timer, hidden detector and finale growtangle',()=>{
  const {rt,objects,controller}=setup();const c=controller(9);event(c,rt);expect([rt.globals.turntimer,c.special,c.btimer]).toEqual([1200,1,0]);expect(rt.count(objects.obj_finale_growtangle)).toBe(1);
 });
 it('executes source room-end independently of destruction to restore the hidden growtangle',()=>{
  const {rt,box,objects,host}=setup();const warped=rt.restore(objects.obj_sneo_warped_box,100100,300,160);box.imageAlpha=0;endNeoAttackRoom(objects,host,rt);expect(box.imageAlpha).toBe(1);expect(warped.live).toBe(true);
 });
 it('rejects dormant controller types instead of pretending that NORMAL has elevator/crusher attacks',()=>{
  const {rt,controller}=setup();for(const n of [2,3,4,5,7,10,11])expect(()=>event(controller(n),rt)).toThrow(/outside the NORMAL/);
 });
 it('preserves source helper interpolation timing, globals and random state',()=>{
  const {rt,objects,host}=setup();const w=rt.restore(objects.obj_sneo_wireheart,100100,400,160);const rng=rt.random.snapshot();executeNeoSource('scr_lerpvar("image_xscale", 0.5, 1, 20, -1, "out");',w,rt,{...host,scripts:attackScriptSources});const lerp=rt.first(objects.obj_lerpvar)!;expect(lerp.target).toBe(w.id);for(let i=0;i<20;i++)event(lerp,rt);expect(w.imageXscale).toBe(1);expect(lerp.live).toBe(false);expect(rt.random.snapshot()).toEqual(rng);
 });
 it('runs wireheart movement and target RNG with source30-frame interpolation objects',()=>{
  const {rt,objects,neo,controller}=setup();event(controller(1.5),rt);const expected=GmRandom.restore(rt.random.snapshot());expected.random(1.5);const w=rt.create(objects.obj_sneo_wireheart,460,150);w.boss=neo.id;w.damage=65;
  const tx=300+expected.random(70);let ty=145+expected.randomRange(-70,70);if(expected.choose(0,1,2)===0)ty=170;event(w,rt);expect([w.targetx,w.targety]).toEqual([tx,ty]);expect(rt.random.snapshot()).toEqual(expected.snapshot());expect(rt.count(objects.obj_lerpvar)).toBeGreaterThanOrEqual(2);expect([w.init,w.con,w.hp]).toEqual([1,2,300]);
 });
 it('runs RECREW wave setup and leaves source break/empty/pipis schedules populated',()=>{
  const {rt,objects,controller}=setup();event(controller(6),rt);const walls=rt.first(objects.obj_sneo_wall_controller_new)!;for(let i=0;i<100;i++)event(walls,rt);expect(walls.wallsetupcount).toBeGreaterThan(0);expect(rt.count(objects.obj_sneo_wallbullet_new)).toBeGreaterThan(0);
 });
 it('runs face master initialization to canonical eye/nose/mouth targets with16HP pools',()=>{
  const {rt,objects,neo}=setup();const face=rt.create(objects.obj_sneo_faceattack,424,100);rt.userEvent(face,0);event(face,rt);const parts=rt.all(objects.obj_sneo_faceattack);expect(parts.map(p=>p.type)).toEqual([0,1,2,3]);expect([neo.eyeshp,neo.nosehp,neo.mouthhp]).toEqual([16,16,16]);for(const p of parts)if(p!==face){event(p,rt);expect(rt.byId(p.targ)).toBeDefined();}
 });
 it('creates the true warped finale form/hitbox at source45 and opens the suction at70',()=>{
  const {rt,objects,controller}=setup();const c=controller(9);event(c,rt);c.btimer=44;event(c,rt);const form=rt.first(objects.obj_sneo_final_forme)!,hitbox=rt.first(objects.obj_sneo_final_forme_hitbox)!;expect([c.special,c.btimer,form.x,form.intro,form.speed,form.direction]).toEqual([2,0,680,-1,16.75,180]);expect(form.target).toBe(3);c.btimer=69;event(c,rt);expect([c.special,hitbox.destroyable,form.destroyable,rt.first(objects.obj_sneo_warped_box)!.state]).toEqual([3,1,1,1]);
 });

 it('applies actual pipis HP, charged-shot persistence, breakup pieces and difficulty-specific TP',()=>{
  for(const difficulty of [0,1]){const {rt,objects,projectiles}=setup(difficulty);const egg=rt.create(objects.obj_pipis_egg_bullet,400,160),shot=rt.create(projectiles.shot,390,160);shot.big=1;shot.damage=4;egg.object.collisions!.find(c=>c.target===projectiles.shot)!.run(egg,shot,rt);expect([egg.live,shot.live,rt.globals.tension]).toEqual([false,true,difficulty===1?2:3]);expect(rt.count(objects.obj_pipis_egg_bullet_piece)).toBe(3);expect(rt.count(objects.obj_pipis_destroy_fx)).toBe(1);}
 });
 it('consumes small shots on destructible RECREW mail and keeps the charged projectile',()=>{
  for(const big of [0,1]){const {rt,objects,projectiles}=setup();const wall=rt.create(objects.obj_sneo_wallbullet_new,400,160);wall.sprite='spr_sneo_mail';wall.destroyable=1;wall.red=0;const shot=rt.create(projectiles.shot,390,160);shot.big=big;wall.object.collisions!.find(c=>c.target===projectiles.shot)!.run(wall,shot,rt);expect([wall.live,shot.live]).toEqual([false,big===1]);expect(rt.all(projectiles.impact).some(a=>a.sprite==='spr_yheart_shot_hit3')).toBe(true);}
 });
 it('uses source-specific finale hitbox recoil and charged pushback instead of regular bullet destruction',()=>{
  const {rt,objects,projectiles,controller}=setup();const c=controller(9);event(c,rt);c.btimer=44;event(c,rt);const form=rt.first(objects.obj_sneo_final_forme)!,hitbox=rt.first(objects.obj_sneo_final_forme_hitbox)!;form.destroyable=1;hitbox.destroyable=1;const collision=hitbox.object.collisions!.find(c=>c.target===projectiles.shot)!;const first=rt.create(projectiles.shot,390,160);const x=form.x;collision.run(hitbox,first,rt);expect([form.x,form.formtimer,first.live]).toEqual([x+7,5,false]);const charged=rt.create(projectiles.shot,390,160);charged.big=1;collision.run(hitbox,charged,rt);expect([form.pushback,form.formtimer,charged.live]).toEqual([13,18,false]);expect(hitbox.live).toBe(true);
 });

 it('keeps phone stream VM argument RNG order and exact launch acceleration parameters',()=>{
  const {rt,objects}=setup(3);const stream=rt.create(objects.obj_sneo_phonecall_pipis_stream,500,140);const expected=GmRandom.restore(rt.random.snapshot());const y=136+expected.random(8),x=496+expected.random(8),direction=-5+expected.random(38),speed=7+expected.random(13);event(stream,rt);const head=rt.first(objects.obj_sneo_phonecall_sneohead)!;expect(head.x).toBeCloseTo(x,4);expect(head.y).toBeCloseTo(y,4);expect(head.direction).toBeCloseTo(direction,4);expect(head.speed).toBeCloseTo(speed,4);expect(rt.random.snapshot()).toEqual(expected.snapshot());
 });
 it('uses phonehand difficulty-specific spread versus basic shots with actual target and timing',()=>{
  for(const difficulty of [0,1,2]){const {rt,objects,controller}=setup(difficulty);const c=controller(8.5);c.btimer=114;event(c,rt);const master=rt.first(objects.obj_sneo_phonehand_master)!;master.imageAlpha=1;master.btimer=(difficulty===0?20:difficulty===1?15:30)-1;event(master,rt);const shot=rt.byId(master.shot)!;expect(shot).toBeDefined();expect(shot.object).toBe(objects[difficulty<2?'obj_sneo_mmx_spreadshot':'obj_basicbullet_sneo']);expect([shot.target,shot.speed,shot.alarm[0],shot.imageXscale]).toEqual([3,difficulty<2?12:10,25,3]);expect(master.btimer).toBe(0);}
 });

});
