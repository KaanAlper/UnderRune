import fs from 'node:fs';
import {describe,it,expect,vi} from 'vitest';
import {GmInstance,GmRuntime,resolveEvent,type GmEvent} from '../src/remake/gm/runtime';
import {afterimageGrow,bulletInit,partyWears,tensionHeal} from '../src/remake/deltarune/battle';
import {createChapterRegistry} from '../src/remake/host/chapter2';
import metadata from '../src/remake/host/chapter3-resources.json';
import {loadSprites} from './parity/reference';
import {createTrackingSwords} from '../src/remake/bosses/roaring-knight/tracking-swords';
import {executeNeoSource} from '../src/remake/bosses/spamton-neo/body-source';
import {installChapter3BossHost} from '../src/remake/host/chapter3-bosses';

function fixture(seed=11){
 const base=GmInstance.layerEntries,rt=new GmRuntime(loadSprites(3),{seed});
 rt.globals={chapter:3,turntimer:500,inv:-1,tension:0,maxtension:250,char:[1,2,3],chararmor1:[0,15,24,14],chararmor2:[0,0,0,0]};
 const registry=createChapterRegistry(rt,{chapter:3,metadata,room:'room_battletest'}),family=createTrackingSwords(registry.object);
 registry.register(family.objects);registry.finalize();
 rt.restore(registry.object('obj_growtangle'),99990,320,170,{imageXscale:2,imageYscale:2});
 rt.restore(registry.object('obj_heart'),99991,280,160);
 const manager=rt.create(registry.object('obj_tracking_swords_manager'),320,0);
 return {rt,...registry,...family,manager,base,layerEnd:GmInstance.layerEntries};
}
function run(f:ReturnType<typeof fixture>,name:string,event:GmEvent,instance=f.manager){resolveEvent(f.object(name),event)!(instance,f.rt);}
function state(f:ReturnType<typeof fixture>){return f.rt.instances.map(s=>Object.fromEntries(Object.entries(s).filter(([,v])=>typeof v!=='function').map(([k,v])=>[k,k==='object'?v.name:k==='layerEntry'?v-f.base:v])));}

describe('Knight tracking swords',()=>{
 it('shares box coordinate lookups while preserving every composited slash and RNG',()=>{
  const f=fixture(),calls:unknown[][]=[];
  f.rt.sourceSurfaces={create:()=>1,target:()=>{},clear:()=>{},capture:()=>'',free:()=>{},deleteSprite:()=>{},draw:()=>{},copy:()=>{},part:()=>{},exists:()=>true,resize:()=>{}};
  for(let n=0;n<3;n++)f.rt.restore(f.object('obj_tracking_sword_slash'),99992+n,300+n,150,{imageIndex:n});
  const first=vi.spyOn(f.rt,'first'),rng=f.rt.random.snapshot();
  vi.spyOn(f.rt,'drawSprite').mockImplementation((...args)=>{calls.push(args);});
  run(f,'obj_tracking_swords_manager','draw');
  expect(calls.map(c=>c.slice(0,4))).toEqual([['spr_pxwhite2',2,57,55],['spr_pxwhite2',1,56,55],['spr_pxwhite2',0,55,55]]);
  expect(f.rt.random.snapshot()).toEqual(rng);
  expect(first.mock.calls.filter(([def])=>def.name==='obj_growtangle')).toHaveLength(2);
 });
 it('shadows regular-bullet Step through the installed host and expires the slash after three Draws',()=>{
  const rt=new GmRuntime(loadSprites(3),{seed:11});rt.globals={chapter:3};
  const {objects}=installChapter3BossHost(rt,{room:'room_battletest'}),s=rt.create(objects.obj_tracking_sword_slash,320,170);
  expect('wall_destroy' in s).toBe(false);
  for(let i=0;i<3;i++){rt.step();expect(s.timer).toBe(i);rt.draw();}
  expect(s.live).toBe(false);expect(s.timer).toBe(3);
 });
 it('spawns after five steps, keeps native loop fields and stops below seventy remaining frames',()=>{
  const f=fixture();for(let i=0;i<4;i++)run(f,'obj_tracking_swords_manager','step');expect(f.rt.count(f.object('obj_tracking_sword1'))).toBe(0);
  run(f,'obj_tracking_swords_manager','step');const sword=f.rt.first(f.object('obj_tracking_sword1'))!;
  expect(sword).toBeDefined();expect(f.manager.i).toBe(4);expect(f.manager.inst).toBe(sword.id);expect(f.manager.rate).toBe(28);
  expect(sword.imageAngle).toBe(sword.direction+180);expect(sword.damage).toBe(f.manager.damage);
  f.rt.globals.turntimer=69;const timer=f.manager.timer;run(f,'obj_tracking_swords_manager','step');expect(f.manager.timer).toBe(timer);
 });
 it('runs fade, flash, slash creation and Draw-driven trail/expiry without inherited Step substitution',()=>{
  const f=fixture(),s=f.rt.create(f.object('obj_tracking_sword1'),400,170);s.direction=180;s.imageAngle=0;
  for(let i=0;i<39;i++)run(f,'obj_tracking_sword1','step',s);
  expect(f.rt.count(f.object('obj_tracking_sword_slash'))).toBe(1);expect(f.rt.count(f.object('obj_tracking_sword_slash_extra_graze'))).toBe(1);
  run(f,'obj_tracking_sword1','draw',s);expect(s.afterimagecon).toBe(2);expect(s.i).toBe(40);
  const slash=f.rt.first(f.object('obj_tracking_sword_slash'))!;for(let i=0;i<3;i++)run(f,'obj_tracking_sword_slash','draw',slash);expect(slash.live).toBe(false);
 });
 it('activates scattered debris after thirty frames and uses one random draw at Create',()=>{
  const f=fixture(),before=f.rt.random.snapshot(),s=f.rt.create(f.object('obj_tracking_sword2'),320,170);
  expect(f.rt.random.snapshot()).not.toEqual(before);expect(s.gravityDirection).toBe(s.imageAngle);
  for(let i=0;i<30;i++)run(f,'obj_tracking_sword2','step',s);expect([s.active,s.imageAlpha]).toEqual([1,1]);expect(s.gravity).toBeCloseTo(0.01);
 });
 it.each([0,1])('awards armor-adjusted TP/time in Step and keeps the lifetime timer in Draw, variant %i',variant=>{
  const f=fixture();f.manager.variant=variant;
  f.rt.restore(f.object('obj_battlecontroller'),99992,0,0,{mercytotal:0});
  const s=f.rt.create(f.object('obj_tracking_sword_slash_extra_graze'),280,170);s.imageAngle=0;s.timer=2;
  run(f,'obj_tracking_sword_slash_extra_graze','step',s);expect(s.timer).toBe(2);
  run(f,'obj_tracking_sword_slash_extra_graze','draw',s);
  expect(s.live).toBe(false);expect(f.rt.globals.tension).toBeCloseTo((variant===1?4:7)*1.15);expect(f.rt.globals.turntimer).toBeCloseTo(500-1.1/30);
 });
 it('preserves controller creator fields and initializes the manager twice in pattern 151',()=>{
  const f=fixture(),c=f.rt.restore(f.object('obj_dbulletcontroller'),99992,0,0,{type:151,made:false,difficulty:2,damage:42,grazepoints:3,timepoints:-1,inv:20,target:2,grazed:9,grazetimer:8,creatorid:99993,creator:1,element:5});
  expect(f.pattern(c,f.rt)).toBe(true);expect(c.made).toBe(true);const m=f.rt.all(f.object('obj_tracking_swords_manager'))[1];
  expect([m.variant,m.rate,m.timer,m.damage,m.grazepoints,m.inv,m.target,m.grazed,m.grazetimer,m.creatorid,m.creator,m.element]).toEqual([2,24,19,42,3,20,2,0,0,99993,1,5]);
  f.pattern(c,f.rt);expect(f.rt.count(f.object('obj_tracking_swords_manager'))).toBe(2);
 });
});

const sourceRoot='extracted/chapter3_windows/code/';
describe.skipIf(!fs.existsSync(sourceRoot+'gml_Object_obj_tracking_swords_manager_Step_0.gml'))('Tracking swords compared with installed original events',()=>{
 for(const seed of [0,11,9182])for(const variant of [0,1,2,3])it(`matches manager Step fields and RNG, seed ${seed}, variant ${variant}`,()=>{
  const a=fixture(seed),b=fixture(seed);for(const f of [a,b]){f.manager.variant=variant;run(f,'obj_tracking_swords_manager','user0');}
  const source=fs.readFileSync(sourceRoot+'gml_Object_obj_tracking_swords_manager_Step_0.gml','utf8');
  for(let frame=0;frame<130;frame++){
   GmInstance.layerEntries=a.layerEnd;run(a,'obj_tracking_swords_manager','step');a.layerEnd=GmInstance.layerEntries;
   GmInstance.layerEntries=b.layerEnd;executeNeoSource(source,b.manager,b.rt,b.host,undefined,'step');b.layerEnd=GmInstance.layerEntries;
   expect(state(a)).toEqual(state(b));expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());
  }
 });
 const events:[string,GmEvent,string][]=[
  ['obj_tracking_swords_manager','create','Create_0'],['obj_tracking_swords_manager','user0','Other_10'],
  ['obj_tracking_swords_manager','draw','Draw_0'],['obj_tracking_swords_manager','cleanup','CleanUp_0'],
  ['obj_tracking_sword1','create','Create_0'],['obj_tracking_sword1','step','Step_0'],['obj_tracking_sword1','draw','Draw_0'],
  ['obj_tracking_sword2','create','Create_0'],['obj_tracking_sword2','step','Step_0'],
  ['obj_tracking_sword_slash','create','Create_0'],['obj_tracking_sword_slash','step','Step_0'],['obj_tracking_sword_slash','draw','Draw_0'],
  ['obj_tracking_sword_slash_extra_graze','create','Create_0'],['obj_tracking_sword_slash_extra_graze','step','Step_0'],['obj_tracking_sword_slash_extra_graze','draw','Draw_0'],
 ];
 function referenceHost(f:ReturnType<typeof fixture>){
  return {...f.host,call:(name:string,s:GmInstance,rt:GmRuntime,args:any[])=>{
   if(name==='scr_bullet_init')return bulletInit(s);
   if(name==='scr_armorcheck_equipped_party')return partyWears(rt,args[0]);
   if(name==='scr_tensionheal')return tensionHeal(rt,args[0]);
   if(name==='surface_exists')return rt.sourceSurfaces!.exists(args[0]);
   if(name==='draw_surface')return rt.sourceSurfaces!.draw(args[0],args[1],args[2]);
   if(name==='draw_set_blend_mode')return rt.drawBlendMode(args[0]===1?'add':'normal');
   if(name==='gt_minx')return rt.first(f.object('obj_growtangle'))!.x-rt.spriteWidth(rt.first(f.object('obj_growtangle'))!)/2;
   if(name==='gt_miny')return rt.first(f.object('obj_growtangle'))!.y-rt.spriteHeight(rt.first(f.object('obj_growtangle'))!)/2;
   if(name==='scr_afterimage_grow'){
    const a=rt.create(afterimageGrow,s.x,s.y);s.afterimage=a.id;
    Object.assign(a,{sprite:s.sprite,imageIndex:s.imageIndex,imageBlend:s.imageBlend,imageSpeed:0,depth:s.depth,imageXscale:s.imageXscale,imageYscale:s.imageYscale,imageAngle:s.imageAngle});return a.id;
   }
   return f.host.call(name,s,rt,args);
  }};
 }
 for(const [name,event,suffix] of events)it(`matches ${name} ${event} full fields and RNG`,()=>{
  const a=fixture(),b=fixture();let sa=a.manager,sb=b.manager;
  if(name!=='obj_tracking_swords_manager'){
   GmInstance.layerEntries=a.layerEnd;sa=a.rt.create(a.object(name),320,170);a.layerEnd=GmInstance.layerEntries;
   GmInstance.layerEntries=b.layerEnd;sb=b.rt.create(b.object(name),320,170);b.layerEnd=GmInstance.layerEntries;
  }
  // The source adapter has no blend-mode constants; provide native numeric constants as event locals.
  const source='var bm_add = 1; var bm_normal = 0;\n'+fs.readFileSync(sourceRoot+`gml_Object_${name}_${suffix}.gml`,'utf8');
  const count=event==='step'?45:event==='draw'?4:1;
  for(let frame=0;frame<count;frame++){
   GmInstance.layerEntries=a.layerEnd;run(a,name,event,sa);a.layerEnd=GmInstance.layerEntries;
   GmInstance.layerEntries=b.layerEnd;executeNeoSource(source,sb,b.rt,referenceHost(b),undefined,event);b.layerEnd=GmInstance.layerEntries;
   expect(state(a)).toEqual(state(b));expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());expect(a.rt.globals).toEqual(b.rt.globals);
  }
 });
 for(const seed of [0,11,9182])for(const direction of [0,45,90,135,180,225,270,315])it(`matches variant-one sword/debris and trail events, seed ${seed}, direction ${direction}`,()=>{
  const a=fixture(seed),b=fixture(seed);const targets=[a,b].map(f=>{
   GmInstance.layerEntries=f.layerEnd;const s=f.rt.create(f.object('obj_tracking_sword1'),320,170);f.layerEnd=GmInstance.layerEntries;
   Object.assign(s,{variant:1,direction,imageAngle:direction+180,damage:37,target:2});return s;
  });
  const step=fs.readFileSync(sourceRoot+'gml_Object_obj_tracking_sword1_Step_0.gml','utf8'),draw=fs.readFileSync(sourceRoot+'gml_Object_obj_tracking_sword1_Draw_0.gml','utf8');
  for(let frame=0;frame<44;frame++){
   GmInstance.layerEntries=a.layerEnd;run(a,'obj_tracking_sword1','step',targets[0]);run(a,'obj_tracking_sword1','draw',targets[0]);a.layerEnd=GmInstance.layerEntries;
   GmInstance.layerEntries=b.layerEnd;executeNeoSource(step,targets[1],b.rt,referenceHost(b),undefined,'step');executeNeoSource(draw,targets[1],b.rt,referenceHost(b),undefined,'draw');b.layerEnd=GmInstance.layerEntries;
   expect(state(a)).toEqual(state(b));expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());
  }
 });
 for(const variant of [0,1,2,3])for(const type of [151,104,154])it(`matches manager variant ${variant} setup with controller ${type}`,()=>{
  const a=fixture(),b=fixture();for(const f of [a,b]){f.manager.variant=variant;GmInstance.layerEntries=f.layerEnd;f.rt.restore(f.object('obj_dbulletcontroller'),99992,0,0,{type});f.layerEnd=GmInstance.layerEntries;}
  run(a,'obj_tracking_swords_manager','user0');
  executeNeoSource(fs.readFileSync(sourceRoot+'gml_Object_obj_tracking_swords_manager_Other_10.gml','utf8'),b.manager,b.rt,referenceHost(b),undefined,'user0');
  expect(state(a)).toEqual(state(b));expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());
 });
 for(const variant of [0,1])for(const inv of [-1,0])for(const timer of [0,2])it(`matches extra graze Step collision and Draw expiry, variant ${variant}, inv ${inv}, timer ${timer}`,()=>{
  const a=fixture(),b=fixture(),targets=[a,b].map(f=>{
   f.manager.variant=variant;f.rt.globals.inv=inv;GmInstance.layerEntries=f.layerEnd;
   f.rt.restore(f.object('obj_battlecontroller'),99992,0,0,{mercytotal:0});
   const s=f.rt.create(f.object('obj_tracking_sword_slash_extra_graze'),280,170);s.timer=timer;f.layerEnd=GmInstance.layerEntries;return s;
  });
  run(a,'obj_tracking_sword_slash_extra_graze','step',targets[0]);run(a,'obj_tracking_sword_slash_extra_graze','draw',targets[0]);
  executeNeoSource(fs.readFileSync(sourceRoot+'gml_Object_obj_tracking_sword_slash_extra_graze_Step_0.gml','utf8'),targets[1],b.rt,referenceHost(b),undefined,'step');
  executeNeoSource(fs.readFileSync(sourceRoot+'gml_Object_obj_tracking_sword_slash_extra_graze_Draw_0.gml','utf8'),targets[1],b.rt,referenceHost(b),undefined,'draw');
  expect(state(a)).toEqual(state(b));expect(a.rt.globals).toEqual(b.rt.globals);expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());
 });
});
