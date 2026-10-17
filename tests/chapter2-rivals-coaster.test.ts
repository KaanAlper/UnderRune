import fs from 'node:fs';
import {describe,it,expect} from 'vitest';
import {GmInstance,GmRuntime,type GmObjectDef} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
import {createBerdlyCoaster} from '../src/remake/bosses/chapter2-rivals/coaster';
import {executeNeoSource,type NeoSourceHost} from '../src/remake/bosses/spamton-neo/body-source';
import {mercyAdd2} from '../src/remake/deltarune/chapter2-battle';
import {writer} from '../src/remake/deltarune/writer';
import {loadSprites} from './parity/reference';
const bank=fs.existsSync('extracted/chapter2_windows/sprites.json')?loadSprites(2):spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]});
function fixture(seed=11){
 const rt=new GmRuntime(bank,{seed});
 rt.globals={chapter:2,monster:[1,0,0],monsterhp:[1985],monstermaxhp:[1985],mercymod:[0],mercymax:[100],monsterx:[480],monstery:[100],hittarget:[0]};
 const defs=new Map<string,GmObjectDef>([[writer.name,writer]]);const object=(name:string)=>{let d=defs.get(name);if(!d){d={name,index:5000+defs.size,depth:0};defs.set(name,d);}return d;};
 for(const d of createBerdlyCoaster(object))defs.set(d.name,d);
 let heroId=99000;for(const name of ['obj_herokris','obj_herosusie','obj_heroralsei'])rt.restore(object(name),heroId++,100,100,{hurt:0});
 const enemy=rt.create(object('obj_berdlyb_enemy'),480,100);enemy.myself=0;
 const host:NeoSourceHost={object,text:k=>k,call:(name,s,r,args)=>{
  if(name==='camerax')return r.view.x;if(name==='cameray')return r.view.y;if(name==='camerawidth')return r.view.width;
  if(name==='snd_play'||name==='snd_play_pitch')return args[0];
  if(name==='scr_remapvalue')return args[3]+(args[2]-args[0])/(args[1]-args[0])*(args[4]-args[3]);
  if(name==='lerp_ease_in')return args[0]+(args[1]-args[0])*(-Math.cos(args[2]*Math.PI/2)+1);
  if(name==='scr_mercyadd')return mercyAdd2(s,r,args[0],args[1]);
  throw Error(`Unexpected source helper ${name}`);
 }};
 return {rt,object,host,enemy};
}
function state(s:GmInstance){return Object.fromEntries(Object.entries(s).filter(([k])=>k!=='layerEntry'&&k!=='frameCount').map(([k,v])=>[k,k==='object'?v.name:k==='visible'?!!v:v]));}
const path='extracted/chapter2_windows/code/gml_Object_';
const source=(name:string,event:string)=>fs.readFileSync(path+name+'_'+event+'.gml','utf8');
describe.skipIf(!fs.existsSync(path+'o_coaster_hero_Create_0.gml'))('coaster family source event comparisons',()=>{
 for(const seed of [0,11,9182]){
  for(const name of ['o_coaster_hero','o_coaster_berdly','o_berdly_coaster_feather','obj_berdly_smoke','obj_berdlyparticle','o_coastersmoke','o_coaster_jama','o_coaster_lightning'])it(`matches ${name} Create fields/RNG seed ${seed}`,()=>{
   const a=fixture(seed),b=fixture(seed),actual=a.rt.create(a.object(name),470,203),expected=b.rt.restore(b.object(name),actual.id,470,203);
   executeNeoSource(source(name,'Create_0'),expected,b.rt,b.host,undefined,'create');expect(state(actual)).toEqual(state(expected));expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());
  });
  it(`matches controller Create, nested car Create, references and RNG seed ${seed}`,()=>{
   const a=fixture(seed),b=fixture(seed),actual=a.rt.create(a.object('o_coaster_controller'),480,100),expected=b.rt.restore(b.object('o_coaster_controller'),actual.id,480,100);
   b.rt.nextId=actual.id+1;executeNeoSource(source(expected.object.name,'Create_0'),expected,b.rt,b.host,undefined,'create');expect(a.rt.instances.map(state)).toEqual(b.rt.instances.map(state));expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());
  });
  for(const mode of [0,1,2,3,4,5,6])it(`matches bird movement and targeting mode ${mode}, seed ${seed}`,()=>{
   const a=fixture(seed),b=fixture(seed);for(const f of [a,b])f.rt.create(f.object('o_coaster_controller'),480,100);
   const actual=a.rt.first(a.object('o_coaster_berdly'))!,expected=b.rt.first(b.object('o_coaster_berdly'))!;
   for(const s of [actual,expected])Object.assign(s,{mode,modetimer:59});a.enemy.krisgo=1;b.enemy.krisgo=1;
   // The legacy source adapter exposes camerax but not the equivalent legacy view array.
   for(let frame=0;frame<25;frame++){actual.object.events!.step!(actual,a.rt);executeNeoSource(source(expected.object.name,'Step_0').replaceAll('view_xview[0]','camerax()'),expected,b.rt,b.host,undefined,'step');expect(a.rt.instances.map(state)).toEqual(b.rt.instances.map(state));expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());}
  });
 }
 const heroSprites=fs.existsSync(path+'o_coaster_hero_Step_2.gml')?[...new Set(source('o_coaster_hero','Step_2').match(/spr_[a-z0-9_]+/g))]:[];
 for(const sprite of heroSprites)for(const actor of [0,1,2])it(`matches hero End Step placement for actor ${actor}, sprite ${sprite}`,()=>{
  const a=fixture(),b=fixture();for(const f of [a,b])f.rt.create(f.object('o_coaster_controller'),480,100);
  const actual=a.rt.all(a.object('o_coaster_hero'))[actor],expected=b.rt.all(b.object('o_coaster_hero'))[actor];
  for(const s of [actual,expected])Object.assign(s,{sprite,imageIndex:2});actual.object.events!.endStep!(actual,a.rt);executeNeoSource(source(expected.object.name,'Step_2'),expected,b.rt,b.host,undefined,'endStep');
  expect(a.rt.instances.map(state)).toEqual(b.rt.instances.map(state));
 });
 for(const actor of [0,1,2])for(const stateCode of [0,1,2,5])for(const nitro of [0,1])it(`matches hero Step actor ${actor}, car state ${stateCode}, nitro ${nitro}`,()=>{
  const a=fixture(),b=fixture();for(const f of [a,b])f.rt.create(f.object('o_coaster_controller'),480,100);
  const actual=a.rt.all(a.object('o_coaster_hero'))[actor],expected=b.rt.all(b.object('o_coaster_hero'))[actor];a.enemy.nitro=nitro;b.enemy.nitro=nitro;
  for(const s of [actual,expected])Object.assign(s,{con:stateCode,mykeybuffer:3,visible:true});
  for(let frame=0;frame<30;frame++){actual.object.events!.step!(actual,a.rt);executeNeoSource(source(expected.object.name,'Step_0'),expected,b.rt,b.host,undefined,'step');expect(a.rt.instances.map(state)).toEqual(b.rt.instances.map(state));expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());actual.move();expected.move();}
 });
});
