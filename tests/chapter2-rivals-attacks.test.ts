import fs from 'node:fs';
import {describe,it,expect} from 'vitest';
import {GmInstance,GmRuntime,type GmObjectDef,type GmEvent} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
import {bulletInit,heart,growtangle} from '../src/remake/deltarune/battle';
import {createRivalAttacks,runBerdlyBulletController} from '../src/remake/bosses/chapter2-rivals/attacks';
import {createRouxlsPowerOrb} from '../src/remake/bosses/chapter2-rivals/rouxls-orb';
import {createBerdlySpearblast} from '../src/remake/bosses/chapter2-rivals/spearblast';
import {executeNeoSource,type NeoSourceHost} from '../src/remake/bosses/spamton-neo/body-source';

function fixture(seed=11){
 const rt=new GmRuntime(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]}),{seed});
 rt.globals={chapter:2,monster:[1,0,0],turntimer:260,flag:Array(1000).fill(0)};
 const defs=new Map<string,GmObjectDef>([[heart.name,heart],[growtangle.name,growtangle]]);
 const object=(name:string)=>{let def=defs.get(name);if(!def){def={name,index:3000+defs.size};defs.set(name,def);}return def;};
 for(const def of createRivalAttacks(object))defs.set(def.name,def);
 const orb=createRouxlsPowerOrb(object);defs.set(orb.name,orb);
 for(const def of createBerdlySpearblast(object))defs.set(def.name,def);
 rt.restore(heart,99998,260,180);rt.restore(growtangle,99997,320,170);
 const host:NeoSourceHost={object,text:k=>k,call:(name,s,r,args)=>{
  switch(name){
   case 'scr_bullet_init':bulletInit(s);return;
   case 'scr_rememberxy':s.___myrememberx=s.x;s.___myremembery=s.y;return;
   case 'scr_bullet_create':{const d=r.create(args[2],args[0],args[1]);d.damage=s.damage;d.target=s.target;if('element' in s)d.element=s.element;return d.id;}
   case 'angle_difference':return ((args[0]-args[1])%360+540)%360-180;
   case 'scr_ease_in':return args[0]**args[1];
   case 'scr_monsterpop':return r.globals.monster.filter((n:number)=>n===1).length;
   case 'path_add':return r.paths.add();
   case 'path_set_kind':return r.paths.setKind(args[0],args[1]);
   case 'path_set_precision':return r.paths.setPrecision(args[0],args[1]);
   case 'path_set_closed':return r.paths.setClosed(args[0],!!args[1]);
   case 'path_add_point':return r.paths.addPoint(args[0],args[1],args[2],args[3]);
   case 'path_get_x':return r.paths.getX(args[0],args[1]);
   case 'path_get_y':return r.paths.getY(args[0],args[1]);
   case 'path_start':return r.paths.start(s,args[0],args[1],args[2],!!args[3]);
   case 'path_end':return r.paths.end(s);
   case 'draw_line_color':return;
   case 'snd_play':case 'snd_play_pitch':return args[0];
   case 'snd_stop':case 'snd_volume':return;
   default:throw Error(`Unexpected source helper ${name}`);
  }
 }};
 return {rt,object,host};
}
function state(s:GmInstance){return Object.fromEntries(Object.entries(s).filter(([k])=>k!=='layerEntry'&&k!=='frameCount').map(([k,v])=>[k,k==='object'?v.name:v]));}
function source(name:string,event:string){return fs.readFileSync(`extracted/chapter2_windows/code/gml_Object_${name}_${event}.gml`,'utf8');}

describe('Chapter 2 rival projectiles',()=>{
 it('keeps Chirashi a twelve-projectile staged volley with inherited caller damage and target',()=>{
  const {rt,object}=fixture(),storm=rt.create(object('obj_berdlyb_chirashistorm'),500,100);
  Object.assign(storm,{damage:47,target:1,grazepoints:4,difficulty:-1,first_set:false});storm.object.events!.step!(storm,rt);
  const flyers=rt.all(object('obj_berdlyb_chirashibullet'));expect(flyers).toHaveLength(12);
  expect(flyers.every(s=>s.damage===47&&s.target===1&&s.grazepoints===4&&s.active===0&&s.imageBlend===0x808080)).toBe(true);
  expect(storm.d).toBe(flyers.at(-1)!.id);expect([storm.ix,storm.iy,storm.init]).toEqual([4,3,1]);
  storm.object.events!.step!(storm,rt);expect(rt.all(object('obj_berdlyb_chirashibullet'))).toHaveLength(12);
 });
 it('alternates the normal rematch Chirashi orientation and marks later waves gray',()=>{
  const {rt,object}=fixture(),controller=rt.restore(object('obj_dbulletcontroller'),99999,470,144,{type:10,init:1,difficulty:0,btimer:50,ratio:1,made:0,damage:45,target:0});
  expect(runBerdlyBulletController(controller,rt,object)).toBe(true);const first=rt.all(object('obj_berdlyb_chirashistorm'))[0];
  controller.btimer=50;runBerdlyBulletController(controller,rt,object);const second=rt.all(object('obj_berdlyb_chirashistorm'))[1];
  expect(first.difficulty+second.difficulty).toBe(-1);expect(first.first_set).toBe(true);expect(second.first_set).toBe(false);expect(controller.made).toBe(2);
 });
 it('does not claim another controller family',()=>{const {rt,object}=fixture();const s=rt.restore(object('obj_dbulletcontroller'),99999,0,0,{type:1});expect(runBerdlyBulletController(s,rt,object)).toBe(false);});
});

describe.skipIf(!fs.existsSync('extracted/chapter2_windows/code/gml_Object_obj_berdlyb_chirashibullet_Create_0.gml'))('rival events compared with read-only installed source',()=>{
 for(const seed of [0,11,9182]){
  for(const name of ['obj_berdlyb_spearblast','obj_berdlyb_spearblast_bullet','obj_berdlyb_spearblaster'])it(`matches ${name} Create/RNG seed ${seed}`,()=>{
   const a=fixture(seed),b=fixture(seed),actual=a.rt.create(a.object(name),500,100),expected=b.rt.restore(b.object(name),actual.id,500,100);
   executeNeoSource(source(name,'Create_0'),expected,b.rt,b.host,undefined,'create');expect(state(actual)).toEqual(state(expected));expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());
  });
  for(const aim of [false,true])for(const special of [0,1,2])it(`matches SpearBlast path geometry and Draw emission aim ${aim}, special ${special}, seed ${seed}`,()=>{
   const a=fixture(seed),b=fixture(seed),actual=a.rt.create(a.object('obj_berdlyb_spearblast'),500,100),expected=b.rt.create(b.object('obj_berdlyb_spearblast'),500,100);
   for(const s of [actual,expected])Object.assign(s,{aim_at_player:aim,special});actual.object.events!.step!(actual,a.rt);executeNeoSource(source(expected.object.name,'Step_0'),expected,b.rt,b.host,undefined,'step');
   for(let i=0;i<=100;i++){expect(a.rt.paths.getX(actual.mypath,i/100)).toBe(b.rt.paths.getX(expected.mypath,i/100));expect(a.rt.paths.getY(actual.mypath,i/100)).toBe(b.rt.paths.getY(expected.mypath,i/100));}
   for(let frame=0;frame<55;frame++){actual.object.events!.draw!(actual,a.rt);executeNeoSource(source(expected.object.name,'Draw_0'),expected,b.rt,b.host,undefined,'draw');expect(a.rt.instances.map(state)).toEqual(b.rt.instances.map(state));expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());}
  });
  for(const thin of [0,1])for(const kind of [0,1])it(`matches Rouxls orb Draw-owned RNG and full lifetime, thin ${thin}, kind ${kind}, seed ${seed}`,()=>{
   const a=fixture(seed),b=fixture(seed),actual=a.rt.create(a.object('obj_rouxls_power_up_orb'),500,100),expected=b.rt.create(b.object('obj_rouxls_power_up_orb'),500,100);
   for(const s of [actual,expected])Object.assign(s,{thin,_type:kind,direction:135,parenttarget:99997,track_target:99998});
   for(let frame=0;frame<32&&actual.live;frame++){
    actual.object.events!.draw!(actual,a.rt);executeNeoSource(source(expected.object.name,'Draw_0'),expected,b.rt,b.host,undefined,'draw');
    expect(state(actual)).toEqual(state(expected));expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());
   }expect(actual.live).toBe(false);
  });
  for(const name of ['obj_berdlyb_tornado','obj_berdlyb_chirashibullet','obj_rouxls_fallingblock','obj_musicalbattlenote'])it(`matches ${name} Create and RNG, seed ${seed}`,()=>{
   const a=fixture(seed),b=fixture(seed),actual=a.rt.create(a.object(name),500,100),expected=b.rt.restore(b.object(name),actual.id,500,100);
   executeNeoSource(source(name,'Create_0'),expected,b.rt,b.host,undefined,'create');expect(state(actual)).toEqual(state(expected));expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());
  });
  it(`matches storm child order, caller fields, child Create RNG and all projectile fields, seed ${seed}`,()=>{
   const a=fixture(seed),b=fixture(seed),actual=a.rt.create(a.object('obj_berdlyb_chirashistorm'),500,100),expected=b.rt.create(b.object('obj_berdlyb_chirashistorm'),500,100);
   for(const s of [actual,expected])Object.assign(s,{grazepoints:4,target:1,damage:47,difficulty:1,first_set:false});
   actual.object.events!.step!(actual,a.rt);executeNeoSource(source(expected.object.name,'Step_0'),expected,b.rt,b.host,undefined,'step');
   expect(a.rt.instances.map(state)).toEqual(b.rt.instances.map(state));expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());
  });
  for(const phase of [0,1,2,3,4])for(const difficulty of [-1,0,1])it(`matches flyer phase ${phase}, difficulty ${difficulty}, seed ${seed}`,()=>{
   const a=fixture(seed),b=fixture(seed),actual=a.rt.create(a.object('obj_berdlyb_chirashibullet'),500,100),expected=b.rt.create(b.object('obj_berdlyb_chirashibullet'),500,100);
   for(const s of [actual,expected])Object.assign(s,{phase,difficulty,timer:20,delay:25,___myrememberx:420,___myremembery:80,lerpPoint:8});
   actual.object.events!.step!(actual,a.rt);executeNeoSource(source(expected.object.name,'Step_0'),expected,b.rt,b.host,undefined,'step');
   expect(state(actual)).toEqual(state(expected));expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());
  });
 }
});
