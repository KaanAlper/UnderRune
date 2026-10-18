import fs from 'node:fs';
import {median} from '../src/remake/gm/math';
import {describe,it,expect} from 'vitest';
import {GmInstance,GmRuntime,resolveEvent,type GmObjectDef,type GmEvent} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
import * as battle from '../src/remake/deltarune/battle';
import * as scripts from '../src/remake/deltarune/chapter2-enemy';
import * as ch2 from '../src/remake/deltarune/chapter2-battle';
import {randomTarget,monsterPop} from '../src/remake/deltarune/controller';
import {createChapter2Field,runChapter2FieldBullets} from '../src/remake/bosses/chapter2-field';
import {createChapter2BulletController} from '../src/remake/deltarune/chapter2-bullets';
import {createNeoFace} from '../src/remake/bosses/spamton-neo/face';
import {createNeoSupport} from '../src/remake/bosses/spamton-neo/support';
import {createRouxlsPowerOrb} from '../src/remake/bosses/chapter2-rivals/rouxls-orb';
import {executeNeoSource,type NeoSourceHost} from '../src/remake/bosses/spamton-neo/body-source';
import {setSourceText} from '../src/remake/host/text';
import {easeIn,easeOut,easeInout} from '../src/remake/deltarune/ease';
import {writer,face,battleText,battleTextDefault} from '../src/remake/deltarune/writer';
import {enemyBlcon2,battleBalloon2} from '../src/remake/deltarune/chapter2-objects';

const spriteNames=['spr_battlebg_0','spr_heart','spr_tm_head','spr_tm_body','spr_tm_tail','spr_tm_hand_l','spr_tm_hand_l_attack','spr_tm_hand_r','spr_tm_legs','spr_tm_head_spare','spr_tm_body_spare','spr_tm_tail_spare','spr_tm_hand_l_spare','spr_tm_hand_r_spare','spr_tm_legs_spare','spr_tm_letters','spr_tm_whip_ball','spr_npc_tasquemanager','spr_maus_split','spr_maus_liddle','spr_maus_split_basket','spr_mauswheel_idle','spr_tasque_idle','spr_werewerewire_idle','spr_bullet_laser_circle','spr_bullet_laser_square'];
function fixture(seed=11){
 const sprites=spriteNames.map((name,i)=>({name,width:80,height:80,originX:i===0?40:5,originY:i===0?40:8,bboxMode:0,left:0,right:79,top:0,bottom:79,sepMasks:0,frames:12,special:false,playbackSpeed:1,playbackType:0}));
 const rt=new GmRuntime(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites}),{seed,firstId:100100});
 const g=rt.globals={chapter:2,fighting:1,monster:[1,0,0],monsterat:[11,10,8],monsterx:[450,480,450],monstery:[100,100,220],monsterhp:[1753,1367,240],monstermaxhp:[1753,1367,240],monsterstatus:[0,0,0],monstercomment:['','',''],mercymod:[0,0,0],mercymax:[100,100,100],hittarget:[0,0,0],monsterinstance:[100010,100011,100012],monsterattackname:['','',''],monstertype:[40,42,32],char:[1,2,3],charaction:[0,0,0],charcantarget:[1,1,1],targeted:[0,0,0,0],hp:[0,120,140,100],flag:Array(1000).fill(0),faceaction:[0,0,0],mnfight:0,myfight:0,turntimer:300,inv:0,encounterno:81,darkzone:1,typer:6,fc:0,msg:Array(100).fill(''),msgno:0,battlemsg:[''],chararmor1:[0,0,0,0,0],chararmor2:[0,0,0,0,0],charweapon:[0,0,0,0,0]};
 const defs=new Map<string,GmObjectDef>();let nextIndex=3000;
 for(const def of [battle.monsterParent,battle.heart,battle.growtangle,battle.regularBullet,battle.collideBullet,battle.bulletParent,battle.bulletGenParent,battle.dmgWriter,battle.darkener,writer,face,battleBalloon2])defs.set(def.name,def);
 const object=(name:string):GmObjectDef=>{let d=defs.get(name);if(!d){d={name,index:nextIndex++,events:{create:()=>{throw Error(`Unported test object ${name}`);}}};defs.set(name,d);}return d;};
 const parents:Record<string,string>={obj_tm_whip:'obj_regularbullet',obj_tm_quizzap:'obj_regularbullet',obj_tasque_soundwave:'obj_regularbullet',obj_yarnbullet:'obj_regularbullet',obj_tm_quizletter:'obj_animation_dx',obj_werewerewire_laserbullet:'obj_collidebullet',obj_werewerewire_laserbullet_v:'obj_collidebullet',obj_mauswheel_lightning_orb_ball:'obj_regularbullet'};
 for(const [name,parent] of Object.entries(parents))object(name).parent=object(parent);
 object('obj_tasque_soundwave').index=456;object('obj_tm_whip_animation').index=460;object('obj_maus_split').index=773;
 const spritesByObject:Record<string,string>={obj_tm_whip:'spr_tm_whip_ball',obj_tm_whip_animation:'spr_npc_tasquemanager',obj_tm_quizletter:'spr_tm_letters',obj_werewerewire_enemy:'spr_werewerewire_idle',obj_tasque_enemy:'spr_tasque_idle',obj_tasque_manager_enemy:'spr_npc_tasquemanager',obj_mauswheel_enemy:'spr_nothing',obj_maus_split:'spr_maus_split',obj_maus_liddle:'spr_maus_liddle',obj_maus_split_basket:'spr_maus_split_basket'};
 for(const [name,sprite] of Object.entries(spritesByObject))object(name).sprite=sprite;
 const all=[...createChapter2Field(object),...createNeoFace(object).filter(d=>d.name.startsWith('obj_werewire_bullet')), ...createNeoSupport(object),createRouxlsPowerOrb(object),createChapter2BulletController(object,[(s,r)=>runChapter2FieldBullets(s,r,object)])];
 const aliases:([GmObjectDef,GmObjectDef])[]=[];for(const d of all){const old=object(d.name);aliases.push([old,d]);defs.set(d.name,d);}rt.installObjectAliases(aliases);
 rt.restore(battle.heart,100000,260,180);rt.restore(battle.growtangle,100001,320,170,{imageXscale:2,imageYscale:2});
 for(const [i,name] of ['obj_herokris','obj_herosusie','obj_heroralsei'].entries())rt.restore(object(name),100030+i,90,50+i*72,{imageAlpha:1,myself:i,state:0});
 // Local text is deliberately replaced by keys: assertions never embed game dialogue.
 const lines:Record<string,string>={};for(const prefix of ['obj_werewire_enemy_slash_Step_0_gml_','obj_werewerewire_enemy_slash_Step_0_gml_','obj_tasque_enemy_slash_Step_0_gml_','obj_tasque_manager_enemy_slash_Step_0_gml_','obj_mauswheel_enemy_slash_Step_0_gml_'])for(let i=0;i<500;i++)for(const suffix of ['0','1','0_b'])lines[prefix+i+'_'+suffix]=prefix+i+'_'+suffix;
 lines.scr_monster_make_tired_slash_scr_monster_make_tired_gml_1_0='tired';setSourceText(lines);
 for(const key of ['obj_werewire_kristhrown_slash_Step_0_gml_25_0','obj_werewire_kristhrown_slash_Collision_048192d7_9c3b_472a_adb9_e1f06953ce64_gml_10_0','obj_werewire_kristhrown_slash_Collision_048192d7_9c3b_472a_adb9_e1f06953ce64_gml_75_0'])lines[key]=key;
 const host:NeoSourceHost={object,objectIndex:index=>[...defs.values()].find(d=>d.index===index),text:k=>k,call:(name,s,r,args)=>{
  switch(name){
   case 'scr_bullet_init':return battle.bulletInit(s);
   case 'scr_enemy_object_init':return scripts.enemyObjectInit(s,r);
   case 'scr_isphase':return ch2.isPhase(r,args[0],s);
   case 'scr_monsterpop':return monsterPop(r);
   case 'scr_randomtarget':return randomTarget(s,r);
   case 'scr_monsterattacknamecount':s.__sameattack=0;for(s._sameattacki=0;s._sameattacki<3;s._sameattacki++)if(r.globals.monsterattackname[s._sameattacki]===args[0]&&r.globals.monster[s._sameattacki]===1)s.__sameattack++;return s.__sameattack;
   case 'variable_instance_exists':return args[1] in (r.byId(args[0])??{});
   case 'scr_get_input_name':return '['+['DOWN','RIGHT','UP','LEFT','Z','X','C'][args[0]]+']';
   case 'scr_turntimer':return ch2.turnTimer(r,args[0]);
   case 'scr_movetowards':return args[0]===args[1]?args[0]:args[0]>args[1]?Math.max(args[0]-args[2],args[1]):Math.min(args[0]+args[2],args[1]);
   case 'scr_bullet_inherit':return ch2.bulletInherit2(s,r.byId(args[0])!);
   case 'scr_bullet_create':{const d=r.create(args[2],args[0],args[1]);d.damage=s.damage;d.target=s.target;d.element=s.element;return d.id;}
   case 'scr_bulletspawner':return ch2.bulletSpawner(s,r,args[0],args[1],args[2]).id;
   case 'scr_mercyadd':return ch2.mercyAdd2(s,r,args[0],args[1]);
   case 'scr_simultext':return scripts.simulText(s,r,args[0]);
   case 'scr_terminate_writer':return scripts.terminateWriter(s,r);
   case 'scr_act_charsprite':return scripts.actCharSprite(s,r,args[0],args[1],args[2],args[3]);
   case 'scr_act_charsprite_end':return scripts.actCharSpriteEnd(s,r);
   case 'scr_battletext_default':return battleTextDefault(r,s).id;
   case 'scr_battletext':return battleText(r,s).id;
   case 'scr_enemyblcon':return enemyBlcon2(s,r,args[0],args[1],args[2])?.id;
   case 'scr_blconskip':return ch2.blconSkip(s,r,args[0]);
   case 'scr_speaker':return scripts.speaker(s,r,args[0]);
   case 'scr_anyface_next':return scripts.anyFaceNext(s,r,args[0],args[1]);
   case 'scr_havechar':return r.globals.char.includes(args[0]);
   case 'scr_monster_make_tired':return scripts.monsterMakeTired(r,args[0]);
   case 'scr_enemy_drawidle_generic':return scripts.enemyDrawIdleGeneric(s,r,args[0]);
   case 'scr_enemy_drawhurt_generic':return scripts.enemyDrawHurtGeneric(s,r);
   case 'scr_enemyhurt_tired_after_damage':return scripts.enemyHurtTiredAfterDamage(s,r,args[0]);
   case 'draw_monster_body_part':return ch2.drawBodyPart(s,r,args[0],args[1],args[2],args[3],s.imageXscale,s.imageYscale,s.imageAngle,s.imageBlend,s.imageAlpha);
   case 'draw_monster_body_part_ext':return ch2.drawBodyPart(s,r,...args as [string,number,number,number,number,number,number,number,number]);
   case 'scr_ease_in':return easeIn(args[0],args[1]);case 'scr_ease_out':return easeOut(args[0],args[1]);case 'scr_ease_inout':return easeInout(args[0],args[1]);
   case 'scr_approach':return args[0]<args[1]?Math.min(args[0]+args[2],args[1]):Math.max(args[0]-args[2],args[1]);
   case 'scr_remapvalue':return args[3]+(args[2]-args[0])/(args[1]-args[0])*(args[4]-args[3]);
   case 'scr_getlaunchdirection':return args[0]*args[0]/args[2]<=args[1]?45:90-Math.asin(args[1]*args[2]/(args[0]*args[0]))*180/Math.PI/2;
   // The reference runner returns the upper middle value for an even count (gm/math median).
   case 'median':return median(...args);
   case 'dsin':return Math.sin(args[0]*Math.PI/180);
   case 'scr_lerpvar_instance':{const l=r.create(object('obj_lerpvar'),0,0);s.__lerpvar=l.id;Object.assign(l,{target:args[0],varname:args[1],pointa:args[2],pointb:args[3],maxtime:args[4]});return l.id;}
   case 'snd_play':case 'snd_play_x':case 'snd_stop':case 'snd_volume':case 'snd_loop':case 'snd_pitch':return;
   case 'scr_84_get_sprite':return args[0];
   case 'scr_debug':return 0;
   default:throw Error(`Unexpected field comparison helper ${name}`);
  }
 }};
 return {rt,g,object,host};
}
const run=(s:GmInstance,rt:GmRuntime,e:GmEvent)=>{const f=resolveEvent(s.object,e);if(!f)throw Error(`Missing ${s.object.name}.${e}`);f(s,rt);};
// The comparison adapter reserves sprite as its builtin and recognizes named sounds by prefix.
const eventSource=(name:string,event:string)=>fs.readFileSync(`extracted/chapter2_windows/code/gml_Object_${name}_${event}.gml`,'utf8').replace(/\bsprite\[/g,'gml_sprite[').replace(/\bmotor_swing_down\b/g,'snd_motor_swing_down');
const state=(rt:GmRuntime)=>rt.instances.map(s=>Object.fromEntries(Object.entries(s).filter(([k])=>!['layerEntry','frameCount'].includes(k)).map(([k,v])=>[k,k==='object'?v.name:k==='visible'?!!v:k==='difficulty'&&typeof v==='boolean'?Number(v):v])));

describe('field families have executable combat and minigames',()=>{
 it('registers ordinary Werewire with an actual source enemy and throwing minigame',()=>{const {rt,object}=fixture();const w=rt.create(object('obj_werewire_enemy'),500,140);expect([w.werewerewire,w.mercyaccumulated,w.initid]).toEqual([0,0,1]);expect(resolveEvent(object('obj_werewire_throwkris'),'step')).toBeTypeOf('function');});
 it('creates fifty independent catchable mice, a live basket and source mercy increments',()=>{
  const {rt,object}=fixture();rt.restore(object('obj_mauswheel_enemy'),100010,450,100,{imageIndex:3,basket_size:1,actfailure:1,myself:0});const split=rt.create(object('obj_maus_split'),510,164);split.mcon=1;run(split,rt,'step');
  const mice=rt.all(object('obj_maus_liddle')),basket=rt.first(object('obj_maus_split_basket'))!;expect(mice).toHaveLength(50);expect([split.mcon,split.mtimer,basket.extra_mode]).toEqual([2,1,1]);
  mice[0].con=5;basket.vspeed=20;basket.friction=0.5;basket.object.collisions![0].run(basket,mice[0],rt);expect([mice[0].captured,split.mousecount,split.mercycount,basket.caught]).toEqual([1,49,2,1]);
 });
 it('emits eight source whip zap projectiles at solo difficulty and follows source ownership',()=>{
  const {rt,object}=fixture();rt.restore(object('obj_tasque_manager_enemy'),100010,480,100,{depth:12});const a=rt.create(object('obj_tm_whip_animation'),458,94);Object.assign(a,{damage:55,target:4,difficulty:1,state:2,zapping:true,zaptimer:0,targetx:260,targety:180});run(a,rt,'step');
  const bullets=rt.all(battle.regularBullet).filter(b=>b.sprite==='spr_tm_zap_bullet');expect(bullets).toHaveLength(8);expect(bullets.every(b=>b.damage===55&&b.target===4&&b.element===6&&b.friction===Math.fround(-0.5))).toBe(true);
 });
 it('keeps quitters and unresolved dependencies visible instead of silently accepting a no-op',()=>{const {rt,object}=fixture();expect(()=>rt.create(object('obj_deliberately_unported'),0,0)).toThrow('Unported test object');const s=rt.restore(object('obj_dbulletcontroller'),100090,0,0,{type:88});expect(runChapter2FieldBullets(s,rt,object)).toBe(false);});
 it('runs a live Simon Says turn with letters, three damaging wrong sectors and alarm cleanup',()=>{
  const {rt,object}=fixture();rt.restore(object('obj_tasque_manager_enemy'),100010,480,100,{depth:12,lastQuizLetter:-1,visible:true});const q=rt.create(object('obj_tm_quizzler'),458,94);q.damage=50;q.target=4;
  for(let frame=0;frame<60;frame++){run(q,rt,'beginStep');const a=rt.byId(q.animator)??rt.first(object('obj_tm_whip_animation'))!;run(a,rt,'step');run(a,rt,'draw');if(rt.count(object('obj_tm_quizzap')))break;}
  const zaps=rt.all(object('obj_tm_quizzap'));expect(zaps).toHaveLength(3);expect(zaps.map(z=>z.letter)).not.toContain(q.letters[0]);expect(zaps.every(z=>z.damage===50&&z.target===4&&z.element===6&&z.alarm[0]===20)).toBe(true);run(q,rt,'alarm1');expect(q.live).toBe(false);
 });
 it('runs ThrowWire launch, successful target collision, return and deferred mercy reward',()=>{
  const {rt,g,object}=fixture();const enemy=rt.create(object('obj_werewire_enemy'),500,206);enemy.myself=0;g.monsterinstance[0]=enemy.id;g.monstertype[0]=33;g.myfight=3;Object.assign(g,{currentactingchar:0,actingsingle:[1,0,0],actingsimul:[0,0,0],actingtarget:[0,0,0]});Object.assign(enemy,{acting:3,actcon:0,rtimer:0});run(enemy,rt,'step');expect(enemy.actcon).toBe(12);run(enemy,rt,'alarm4');run(enemy,rt,'step');
  const target=rt.first(object('obj_werewire_throwtarget'))!,aim=rt.first(object('obj_werewire_throwkris'))!;expect([enemy.actcon,target.maker]).toEqual([14,enemy.id]);expect(rt.first(object('obj_herokris'))!.visible).toBe(false);
  rt.input.pressed.add(67);run(aim,rt,'step');rt.input.pressed.clear();const projectile=rt.byId(aim.kris)!;expect([aim.throwcon,projectile.mypower,projectile.gravity,projectile.speed]).toEqual([2,30,1,30]);
  projectile.object.collisions![0].run(projectile,target,rt);expect([target.collided,projectile.collided,enemy.mercyaccumulated,target.con]).toEqual([1,1,50,5]);expect(g.mercymod[0]).toBe(0);
  for(const w of rt.all(writer))rt.destroy(w);projectile.x=rt.view.x+701;run(projectile,rt,'step');projectile.x=rt.first(object('obj_herokris'))!.x;run(projectile,rt,'step');expect([projectile.live,enemy.actcon,aim.live]).toEqual([false,15,false]);
  run(enemy,rt,'step');expect(enemy.actcon).toBe(16);run(enemy,rt,'alarm4');run(enemy,rt,'step');expect([g.mercymod[0],enemy.mercyaccumulated]).toEqual([50,0]);expect(rt.first(object('obj_herokris'))!.visible).toBe(true);
 });
});

describe.skipIf(!fs.existsSync('extracted/chapter2_windows/code/gml_Object_obj_werewerewire_enemy_Step_0.gml'))('field events compared with read-only installed source',()=>{
 for(const seed of [0,11,9182])for(const mode of [0,2,20,3,4,21])it(`matches Werewerewire ordered shooting events, seed ${seed}, mode ${mode}`,()=>{
  const a=fixture(seed),b=fixture(seed);for(const c of [a,b]){const s=c.rt.create(c.object('obj_werewerewire_enemy'),482,164);s.myself=0;Object.assign(s,{rtimer:11,shootmode:mode===0?1:0,shootcon:mode,shootwait:0,werewire_count:1,laser_angle:180,bullet_angle:180});c.g.mnfight=2;}
  const x=a.rt.first(a.object('obj_werewerewire_enemy'))!,y=b.rt.first(b.object('obj_werewerewire_enemy'))!;
  for(let frame=0;frame<35;frame++){run(x,a.rt,'step');executeNeoSource(eventSource(y.object.name,'Step_0'),y,b.rt,b.host,undefined,'step');expect(state(a.rt)).toEqual(state(b.rt));expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());}
 });
 for(const name of ['obj_werewerewire_laserbullet','obj_werewerewire_laserbullet_v'])for(const direction of [0,1,2])it(`matches ${name} direction ${direction} over its complete path`,()=>{
  const a=fixture(),b=fixture();const x=a.rt.create(a.object(name),480,100),y=b.rt.create(b.object(name),480,100);x.attackdirection=direction;y.attackdirection=direction;
  for(let frame=0;frame<85;frame++){run(x,a.rt,'step');executeNeoSource(eventSource(name,'Step_0'),y,b.rt,b.host,undefined,'step');run(x,a.rt,'draw');executeNeoSource(eventSource(name,'Draw_0'),y,b.rt,b.host,undefined,'draw');expect(state(a.rt)).toEqual(state(b.rt));expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());}
 });
 for(const seed of [0,11,9182])it(`matches the catch minigame's fifty mice and RNG, seed ${seed}`,()=>{
  const a=fixture(seed),b=fixture(seed);for(const c of [a,b])c.rt.restore(c.object('obj_mauswheel_enemy'),100010,450,100,{imageIndex:3,basket_size:1,actfailure:1,myself:0});const x=a.rt.create(a.object('obj_maus_split'),510,164),y=b.rt.create(b.object('obj_maus_split'),510,164);x.mcon=1;y.mcon=1;
  run(x,a.rt,'step');executeNeoSource(eventSource(y.object.name,'Step_0'),y,b.rt,b.host,undefined,'step');expect(state(a.rt)).toEqual(state(b.rt));expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());
 });
 for(const name of ['obj_tasque_enemy','obj_tasque_manager_enemy','obj_mauswheel_enemy'])for(const phase of ['firstBullet','launch','status'])it(`matches ${name} ${phase} source state and RNG`,()=>{
  const a=fixture(),b=fixture();for(const c of [a,b]){const s=c.rt.create(c.object(name),480,100);s.myself=0;s.rr=0;s.caught=[];s.rtimer=phase==='firstBullet'?0:phase==='launch'?14:19;c.g.mnfight=2;}
  const x=a.rt.first(a.object(name))!,y=b.rt.first(b.object(name))!;
  run(x,a.rt,'step');executeNeoSource(eventSource(name,'Step_0'),y,b.rt,b.host,undefined,'step');expect(state(a.rt)).toEqual(state(b.rt));expect(a.g).toEqual(b.g);expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());
 });
 for(const name of ['obj_werewerewire_enemy','obj_tasque_enemy'])for(const actor of ['kris','susie','ralsei'])it(`matches ${name} simultaneous ${actor} ACT with real writer and mercy effects`,()=>{
  const a=fixture(),b=fixture();for(const c of [a,b]){const s=c.rt.create(c.object(name),480,100);s.myself=0;s.rtimer=0;s.simultotal=1;s.simulorderkri=0;s.simulordersus=0;s.simulorderral=0;if(actor==='kris')s.acting=2;if(actor==='susie'){s.actingsus=1;s.actconsus=1;}if(actor==='ralsei'){s.actingral=1;s.actconral=1;}c.g.myfight=3;}
  const x=a.rt.first(a.object(name))!,y=b.rt.first(b.object(name))!;
  run(x,a.rt,'step');executeNeoSource(eventSource(name,'Step_0'),y,b.rt,b.host,undefined,'step');expect(state(a.rt)).toEqual(state(b.rt));expect(a.g).toEqual(b.g);expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());
 });
 for(const name of ['obj_tasque_manager_enemy','obj_tm_whip_animation','obj_tm_whip','obj_tm_quizzler','obj_tm_quizzap','obj_maus_split','obj_maus_liddle'])it(`matches ${name} native Create with stored caller fields and RNG`,()=>{
  const a=fixture(),b=fixture();for(const c of [a,b]){c.rt.restore(c.object('obj_tasque_manager_enemy'),100010,480,100,{depth:12,lastQuizLetter:-1,visible:true});c.rt.restore(c.object('obj_mauswheel_enemy'),100020,450,100,{imageIndex:3,basket_size:1,actfailure:1,myself:0});}
  const x=a.rt.create(a.object(name),458,94),y=b.rt.restore(b.object(name),x.id,458,94);b.rt.nextId=x.id+1;
  executeNeoSource(eventSource(name,'Create_0'),y,b.rt,b.host,undefined,'create');expect(state(a.rt)).toEqual(state(b.rt));expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());
 });
 for(const seed of [0,11,9182])it(`matches lightning orb charging, orbiting balls and launch reset over80frames, seed ${seed}`,()=>{
  const a=fixture(seed),b=fixture(seed);for(const c of [a,b])c.rt.restore(c.object('obj_mauswheel_enemy'),100010,450,100,{imageSpeed:0.5,myself:0,mytarget:4});const x=a.rt.create(a.object('obj_maushwheel_lightning_orb'),512,170),y=b.rt.create(b.object('obj_maushwheel_lightning_orb'),512,170);
  for(let frame=0;frame<80;frame++){run(x,a.rt,'step');executeNeoSource(eventSource(y.object.name,'Step_0'),y,b.rt,b.host,undefined,'step');run(x,a.rt,'draw');executeNeoSource(eventSource(y.object.name,'Draw_0'),y,b.rt,b.host,undefined,'draw');
   for(const c of [a,b])for(const ball of c.rt.all(c.object('obj_mauswheel_lightning_orb_ball')))run(ball,c.rt,'draw');
   expect(state(a.rt)).toEqual(state(b.rt));expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());
  }
 });
 for(const name of ['obj_tasque_enemy','obj_tasque_manager_enemy','obj_mauswheel_enemy'])for(const seed of [0,11,9182])it(`matches ${name} balloon, draw and RNG startup seed ${seed}`,()=>{
  const a=fixture(seed),b=fixture(seed);for(const c of [a,b]){const e=c.rt.create(c.object(name),480,100);e.myself=0;e.caught=[];c.g.mnfight=1;}
  const x=a.rt.first(a.object(name))!,y=b.rt.first(b.object(name))!;run(x,a.rt,'step');executeNeoSource(eventSource(name,'Step_0'),y,b.rt,b.host,undefined,'step');run(x,a.rt,'draw');executeNeoSource(eventSource(name,'Draw_0'),y,b.rt,b.host,undefined,'draw');expect(state(a.rt)).toEqual(state(b.rt));expect(a.g).toEqual(b.g);expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());
 });
 for(const type of [2,3,19,20,32,34])for(const seed of [0,11,9182])it(`matches controller pattern${type} initial object/RNG/ownership seed${seed}`,()=>{
  const a=fixture(seed),b=fixture(seed);for(const c of [a,b]){c.rt.restore(c.object('obj_tasque_manager_enemy'),100010,480,100,{depth:12,lastQuizLetter:-1,visible:true});c.rt.restore(c.object('obj_mauswheel_enemy'),100020,450,100,{imageSpeed:0.5,myself:0,mytarget:4,firstturn:1,cursor_count:1});}
  const x=a.rt.create(a.object('obj_dbulletcontroller'),480,100),y=b.rt.create(b.object('obj_dbulletcontroller'),480,100);for(const c of [x,y])Object.assign(c,{type,init:1,miny:90,maxy:250,minx:240,maxx:400,creator:0,damage:55,target:4});
  run(x,a.rt,'step');executeNeoSource(eventSource('obj_dbulletcontroller','Step_0'),y,b.rt,b.host,undefined,'step');expect(state(a.rt)).toEqual(state(b.rt));expect(a.g).toEqual(b.g);expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());
 });
 // The source interpreter reserves the arrays its code writes by index (bullet), so both sides start with it.
 for(const seed of [0,11,9182])for(const mode of [0,2,20,3,4,21])it(`matches ordinary Werewire ordered shooting events seed${seed} mode${mode}`,()=>{
  const a=fixture(seed),b=fixture(seed);for(const c of [a,b]){const s=c.rt.create(c.object('obj_werewire_enemy'),482,164);s.myself=0;c.g.monster=[1,1,0];c.g.charaction=[0,0,0];c.g.turntimer=300;c.g.mnfight=2;Object.assign(s,{bullet:[],rtimer:14,shootmode:mode===0?1:0,shootcon:mode,shootwait:0,werewire_count:2,laser_angle:180,bullet_angle:180});}
  const x=a.rt.first(a.object('obj_werewire_enemy'))!,y=b.rt.first(b.object('obj_werewire_enemy'))!;for(let frame=0;frame<35;frame++){run(x,a.rt,'step');executeNeoSource(eventSource(y.object.name,'Step_0'),y,b.rt,b.host,undefined,'step');expect(state(a.rt)).toEqual(state(b.rt));expect(a.g).toEqual(b.g);expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());}
 });
 for(const name of ['obj_werewire_enemy','obj_werewire_throwkris','obj_werewire_throwtarget','obj_werewire_kristhrown','obj_werewire_spare','obj_werewire_spare2'])it(`matches ${name} source Create including final loop counters and RNG`,()=>{
  const a=fixture(),b=fixture();const x=a.rt.create(a.object(name),480,100),y=b.rt.restore(b.object(name),x.id,480,100);b.rt.nextId=x.id+1;executeNeoSource(eventSource(name,'Create_0'),y,b.rt,b.host,undefined,'create');expect(state(a.rt)).toEqual(state(b.rt));expect(a.g).toEqual(b.g);expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());
 });
 for(const good of [0,1])it(`matches the ThrowWire collision event, weakpoint=${good}`,()=>{
  const a=fixture(),b=fixture();for(const c of [a,b]){const e=c.rt.create(c.object('obj_werewire_enemy'),500,206);e.myself=0;e.acting=3;const target=c.rt.create(c.object('obj_werewire_throwtarget'),500,206);target.maker=e.id;target.good=good;c.rt.create(c.object('obj_werewire_kristhrown'),target.x,target.y);}
  const x=a.rt.first(a.object('obj_werewire_kristhrown'))!,y=b.rt.first(b.object('obj_werewire_kristhrown'))!,xt=a.rt.first(a.object('obj_werewire_throwtarget'))!,yt=b.rt.first(b.object('obj_werewire_throwtarget'))!;
  x.object.collisions![0].run(x,xt,a.rt);executeNeoSource(eventSource(y.object.name,'Collision_obj_werewire_throwtarget'),y,b.rt,b.host,yt);expect(state(a.rt)).toEqual(state(b.rt));expect(a.g).toEqual(b.g);expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());
 });
 for(const name of ['obj_werewire_throwkris','obj_werewire_throwtarget','obj_werewire_spare'])it(`matches ${name} Step/Draw over thirty frames`,()=>{
  const a=fixture(),b=fixture();const x=a.rt.create(a.object(name),480,100),y=b.rt.create(b.object(name),480,100);
  for(let frame=0;frame<30;frame++){run(x,a.rt,'step');executeNeoSource(eventSource(name,'Step_0'),y,b.rt,b.host,undefined,'step');if(name!=='obj_werewire_throwtarget'){run(x,a.rt,'draw');executeNeoSource(eventSource(name,'Draw_0'),y,b.rt,b.host,undefined,'draw');}expect(state(a.rt)).toEqual(state(b.rt));expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());}
 });
});
