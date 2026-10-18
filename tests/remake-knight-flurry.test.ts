import fs from 'node:fs';
import {describe,it,expect} from 'vitest';
import {GmInstance,GmRuntime,resolveEvent,type GmEvent} from '../src/remake/gm/runtime';
import {createChapterRegistry} from '../src/remake/host/chapter2';
import metadata from '../src/remake/host/chapter3-resources.json';
import {loadSprites} from './parity/reference';
import {createFlurry} from '../src/remake/bosses/roaring-knight/flurry';
import {executeNeoSource} from '../src/remake/bosses/spamton-neo/body-source';
import {bulletInit,darkMarker,regularBullet} from '../src/remake/deltarune/battle';
import {angleDifference,clamp01,gtMinx,gtMiny,moveTowards,preciseHit,scrAfterimage} from '../src/remake/deltarune/chapter3-scripts';
import {easeIn,easeOut} from '../src/remake/deltarune/ease';
import {lerpvar} from '../src/remake/deltarune/shared-effects';

function fixture(seed=11){
 const base=GmInstance.layerEntries,rt=new GmRuntime(loadSprites(3),{seed});rt.globals={chapter:3,turntimer:500,inv:100,interact:0};
 const registry=createChapterRegistry(rt,{chapter:3,metadata,room:'room_battletest'}),family=createFlurry(registry.object);registry.register(family.objects);registry.finalize();
 rt.restore(registry.object('obj_growtangle'),99990,320,170,{depth:100,imageXscale:2,imageYscale:2,customBox:false});
 rt.restore(registry.object('obj_heart'),99991,280,160,{depth:50});rt.restore(registry.object('obj_knight_enemy'),99992,460,90);
 const manager=rt.create(registry.object('obj_roaringknight_boxsplitter_attack'),460,90);
 return {rt,...registry,...family,manager,base,layerEnd:GmInstance.layerEntries};
}
const run=(f:ReturnType<typeof fixture>,s:GmInstance,event:GmEvent)=>resolveEvent(s.object,event)?.(s,f.rt);
const state=(f:ReturnType<typeof fixture>)=>f.rt.instances.map(s=>Object.fromEntries(Object.entries(s).filter(([,v])=>typeof v!=='function').map(([k,v])=>[k,k==='object'?v.name:k==='layerEntry'?v-f.base:v])));
describe('Knight Flurry',()=>{
 it('starts the native slash immediately, using the difficulty cadence and RNG',()=>{
  const f=fixture(),before=f.rt.random.snapshot();f.manager.difficulty=2;run(f,f.manager,'step');
  expect(f.manager.spawn_speed).toBe(31);expect(f.manager.slash_count).toBe(1);expect(f.manager.local_turntimer).toBe(329);
  expect(f.rt.count(f.object('obj_roaringknight_splitslash'))).toBe(1);expect(f.rt.random.snapshot()).not.toEqual(before);
 });
 it('opens and closes the box, activates teeth and restores the soul limits',()=>{
  const f=fixture(),b=f.rt.create(f.object('obj_knight_split_growtangle'),320,170);bulletInit(b);b.con=1;
  for(let i=0;i<5;i++){run(f,b,'step');run(f,b,'draw');}
  expect(b.con).toBe(2);expect(f.rt.count(f.object('obj_roaringknight_split_bullet'))).toBe(13);
  for(let i=0;i<7;i++){run(f,b,'step');run(f,b,'endStep');run(f,b,'draw');}
  expect(b.distance).toBeGreaterThan(0);expect(f.rt.first(f.object('obj_growtangle'))!.x).toBe(-9999);
  expect(f.rt.all(f.object('obj_roaringknight_split_bullet')).every(s=>s.active&&s.grazed===0)).toBe(true);
  for(let i=0;i<35;i++){run(f,b,'step');run(f,b,'endStep');run(f,b,'draw');}
  expect([b.con,b.split,b.distance]).toEqual([0,false,0]);expect(f.rt.first(f.object('obj_growtangle'))!.x).toBe(320);
 });
});

const root='extracted/chapter3_windows/code/';
function original(name:string,suffix:string){
 // Constructor syntax is outside the small event adapter; the test constructor retains native handle allocation.
 // instance_create in this adapter requires a definition; native accepts the equivalent object index too.
 return 'var bm_normal=0;var bm_add=1;var bm_subtract=3;var bm_dest_alpha=7;var bm_zero=0;var application_surface=-1;\n'+fs.readFileSync(root+`gml_Object_${name}_${suffix}.gml`,'utf8').replaceAll('new Vector2(', 'scr_test_vector2(').replaceAll(', split_bullet)', ', obj_roaringknight_split_bullet)');
}
function sourceHost(f:ReturnType<typeof fixture>){return {...f.host,call:(name:string,s:GmInstance,rt:GmRuntime,a:any[])=>{
 if(name==='scr_bullet_init')return bulletInit(s);
 if(name==='gt_minx')return gtMinx(rt);if(name==='gt_miny')return gtMiny(rt);
 if(name==='scr_test_vector2')return rt.createStruct({x:a[0],y:a[1]},'Vector2');
 if(name==='scr_afterimage')return scrAfterimage(s,rt).id;
 if(name==='scr_dark_marker')return darkMarker(rt,s,a[0],a[1],a[2]).id;
 if(name==='scr_precise_hit')return preciseHit(s,rt,a[0]);
 if(name==='scr_movetowards'||name==='scr_approach')return moveTowards(a[0],a[1],a[2]);
 if(name==='scr_ease_in')return easeIn(a[0],a[1]);if(name==='scr_ease_out')return easeOut(a[0],a[1]);
 if(name==='clamp01')return clamp01(a[0]);if(name==='inverselerp')return (a[2]-a[0])/(a[1]-a[0]);
 if(name==='angle_difference')return angleDifference(a[0],a[1]);
 if(name==='remap_clamped')return a[2]+(a[3]-a[2])*clamp01((a[4]-a[0])/(a[1]-a[0]));
 if(name==='randomsign')return rt.random.irandom(1)*2-1;
 if(name==='debug_print')return;
 if(name==='safe_delete'){const t=rt.byId(a[0]);if(t)rt.destroy(t);return;}
 if(name==='surface_exists')return rt.sourceSurfaces!.exists(a[0]);
 if(name==='surface_copy')return rt.sourceSurfaces!.copy(a[0],a[1],a[2],a[3]===-1?null:a[3]);
 if(name==='draw_surface_part_ext')return rt.sourceSurfaces!.part(...a as [number,number,number,number,number,number,number,number,number,number,number]);
 if(name==='screenx')return s.x-rt.view.x;if(name==='screeny')return s.y-rt.view.y;
 if(name==='ossafe_fill_rectangle')return rt.drawRect(a[0],a[1],a[2],a[3],false);
 if(name==='draw_sprite_part_ext_rot'){
  const sp=rt.bank.get(a[0])!;return rt.drawSpritePart(a[0],a[1],a[2],a[3],a[4]/a[8]-a[2],a[5]/a[9]-a[3],a[6]+a[2]*a[8]-sp.originX*a[8],a[7]+a[3]*a[9]-sp.originY*a[9],a[8],a[9],a[11],a[12]);
 }
 if(name==='draw_surface')return rt.sourceSurfaces!.draw(a[0],a[1],a[2]);
 if(name==='draw_surface_ext')return rt.sourceSurfaces!.draw(a[0],a[1],a[2],a[7],a[6]);
 if(name==='draw_set_blend_mode'||name==='gpu_set_blendmode')return rt.drawBlendMode(a[0]===1?'add':a[0]===3?'subtract':'normal');
 if(name==='gpu_set_blendmode_ext')return rt.drawBlendMode(a[1]===0?'dest-alpha-copy':'dest-alpha-add');
 if(name==='draw_sprite_tiled_ext')return rt.gfx?.spriteTiled?.(a[0],a[2],a[3],a[4],a[5],a[6],a[7],a[1]);
 if(name==='scr_lerp_var_instance'){
  const l=rt.create(lerpvar,0,0);s.__lerpvar=l.id;Object.assign(l,{target:a[0],varname:a[1],pointa:a[2],pointb:a[3],maxtime:a[4]});return;
 }
 if(name==='scr_bullet_inherit'){
  const b=rt.byId(a[0])!;for(const k of ['damage','grazepoints','timepoints','inv','target'])if(s[k]!==-1)b[k]=s[k];if(s.grazed!==-1)b.grazed=0;if(s.grazetimer!==-1)b.grazetimer=0;b.element=s.element;return;
 }
 if(name==='scr_bulletparent_count')return rt.all(f.object('obj_bulletparent')).filter(i=>i.object.name==='obj_bulletparent').length;
 return f.host.call(name,s,rt,a);
}};}

describe.skipIf(!fs.existsSync(root+'gml_Object_obj_roaringknight_boxsplitter_attack_Step_0.gml'))('Flurry compared with installed original events',()=>{
 for(const seed of [0,11,9182])for(const difficulty of [0,1,2,3])it(`matches manager Step and Draw, difficulty ${difficulty}, seed ${seed}`,()=>{
  const a=fixture(seed),b=fixture(seed);a.manager.difficulty=b.manager.difficulty=difficulty;
  for(let i=0;i<60;i++){
   GmInstance.layerEntries=a.layerEnd;run(a,a.manager,'step');run(a,a.manager,'draw');a.layerEnd=GmInstance.layerEntries;
   GmInstance.layerEntries=b.layerEnd;executeNeoSource(original(a.manager.object.name,'Step_0'),b.manager,b.rt,sourceHost(b),undefined,'step');executeNeoSource(original(a.manager.object.name,'Draw_0'),b.manager,b.rt,sourceHost(b),undefined,'draw');b.layerEnd=GmInstance.layerEntries;
   expect(state(a)).toEqual(state(b));expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());expect(a.rt.nextId).toBe(b.rt.nextId);
  }
 });
 for(const vertical of [false,true])for(const diagonal of [false,true])it(`matches slash Step/Draw with debris, vertical ${vertical}, diagonal ${diagonal}`,()=>{
  const a=fixture(),b=fixture(),targets=[a,b].map(f=>{GmInstance.layerEntries=f.layerEnd;const s=f.rt.create(f.object('obj_roaringknight_splitslash'),320,170);Object.assign(s,{vertical,diagonal});f.manager.slash_count=1;f.layerEnd=GmInstance.layerEntries;return s;});
  for(let i=0;i<35;i++){
   GmInstance.layerEntries=a.layerEnd;run(a,targets[0],'step');run(a,targets[0],'draw');a.layerEnd=GmInstance.layerEntries;
   GmInstance.layerEntries=b.layerEnd;executeNeoSource(original(targets[1].object.name,'Step_0'),targets[1],b.rt,sourceHost(b),undefined,'step');executeNeoSource(original(targets[1].object.name,'Draw_0'),targets[1],b.rt,sourceHost(b),undefined,'draw');b.layerEnd=GmInstance.layerEntries;
   expect(state(a)).toEqual(state(b));expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());expect(a.rt.nextId).toBe(b.rt.nextId);
  }
 });
 for(const name of ['obj_roaringknight_boxsplitter_attack','obj_roaringknight_splitslash','obj_roaringknight_split_bullet','obj_knight_split_growtangle','obj_knight_split_growtangle_effect'])it(`matches ${name} Create full state and RNG`,()=>{
  const a=fixture(),b=fixture(),targets=[a,b].map(f=>{GmInstance.layerEntries=f.layerEnd;const s=f.rt.create(f.object(name),320,170);f.layerEnd=GmInstance.layerEntries;return s;});
  GmInstance.layerEntries=a.layerEnd;run(a,targets[0],'create');a.layerEnd=GmInstance.layerEntries;
  GmInstance.layerEntries=b.layerEnd;executeNeoSource(original(name,'Create_0'),targets[1],b.rt,sourceHost(b),undefined,'create');b.layerEnd=GmInstance.layerEntries;
  expect(state(a)).toEqual(state(b));expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());expect(a.rt.nextId).toBe(b.rt.nextId);
 });
 for(const difficulty of [0,2,3])for(const vertical of [false,true])for(const diagonal of [false,true])it(`matches split-box cycle, difficulty ${difficulty}, vertical ${vertical}, diagonal ${diagonal}`,()=>{
  const a=fixture(),b=fixture(),targets=[a,b].map(f=>{GmInstance.layerEntries=f.layerEnd;const s=f.rt.create(f.object('obj_knight_split_growtangle'),320,170);bulletInit(s);Object.assign(s,{difficulty,vertical,diagonal,con:1});f.layerEnd=GmInstance.layerEntries;return s;});
  const events:[GmEvent,string][]=[['step','Step_0'],['endStep','Step_2'],['draw','Draw_0']];
  for(let i=0;i<50;i++){
   GmInstance.layerEntries=a.layerEnd;for(const [event] of events)run(a,targets[0],event);a.layerEnd=GmInstance.layerEntries;
   GmInstance.layerEntries=b.layerEnd;for(const [event,suffix] of events)executeNeoSource(original(targets[1].object.name,suffix),targets[1],b.rt,sourceHost(b),undefined,event);b.layerEnd=GmInstance.layerEntries;
   expect(state(a)).toEqual(state(b));expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());expect(a.rt.nextId).toBe(b.rt.nextId);
  }
 });
 for(const vertical of [false,true])it(`matches split effect screenshot resource lifecycle, vertical ${vertical}`,()=>{
  const a=fixture(),b=fixture(),targets=[a,b].map(f=>{GmInstance.layerEntries=f.layerEnd;const s=f.rt.create(f.object('obj_knight_split_growtangle_effect'),320,170);Object.assign(s,{vertical,xoffset:4,yoffset:-3,angle:12});f.layerEnd=GmInstance.layerEntries;return s;});
  for(let i=0;i<10;i++){
   run(a,targets[0],'draw');executeNeoSource(original(targets[1].object.name,'Draw_0'),targets[1],b.rt,sourceHost(b),undefined,'draw');
   expect(state(a)).toEqual(state(b));expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());
  }
 });
 for(const seed of [0,11,9182])it(`matches tooth acceleration, animation and two Draw RNG calls, seed ${seed}`,()=>{
  const a=fixture(seed),b=fixture(seed),targets=[a,b].map(f=>{GmInstance.layerEntries=f.layerEnd;const s=f.rt.create(f.object('obj_roaringknight_split_bullet'),320,170);s.top_speed=3.5;s.direction=90;f.layerEnd=GmInstance.layerEntries;return s;});
  for(let i=0;i<15;i++){
   run(a,targets[0],'step');run(a,targets[0],'draw');executeNeoSource(original(targets[1].object.name,'Step_0'),targets[1],b.rt,sourceHost(b),undefined,'step');executeNeoSource(original(targets[1].object.name,'Draw_0'),targets[1],b.rt,sourceHost(b),undefined,'draw');
   expect(state(a)).toEqual(state(b));expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());
  }
 });
 for(const suffix of ['Other_10','Other_11','CleanUp_0'])it(`matches split box ${suffix}, including captured box sprite and resources`,()=>{
  const a=fixture(),b=fixture(),targets=[a,b].map(f=>{GmInstance.layerEntries=f.layerEnd;const s=f.rt.create(f.object('obj_knight_split_growtangle'),320,170);run(f,s,'draw');f.layerEnd=GmInstance.layerEntries;return s;});
  const event:GmEvent=suffix==='Other_10'?'user0':suffix==='Other_11'?'user1':'cleanup';
  run(a,targets[0],event);executeNeoSource(original(targets[1].object.name,suffix),targets[1],b.rt,sourceHost(b),undefined,event);
  expect(state(a)).toEqual(state(b));expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());expect([...a.rt.dynamicSprites.keys()]).toEqual([...b.rt.dynamicSprites.keys()]);
 });
 it('matches precise slash contact fields and delayed split',()=>{
  const a=fixture(),b=fixture(),targets=[a,b].map(f=>{GmInstance.layerEntries=f.layerEnd;f.rt.create(f.object('obj_knight_split_growtangle'),320,170);const s=f.rt.create(f.object('obj_roaringknight_splitslash'),100,170);Object.assign(s,{active:1,sprite:'spr_pxwhite2',imageXscale:900});f.layerEnd=GmInstance.layerEntries;return s;});
  run(a,targets[0],'user5');executeNeoSource(original(targets[1].object.name,'Other_15'),targets[1],b.rt,sourceHost(b),undefined,'user5');
  expect(targets[0].playerstrike).toBe(1);expect(a.rt.globals.inv).toBe(-1);expect(state(a)).toEqual(state(b));expect(a.rt.globals).toEqual(b.rt.globals);
 });
 it('matches slash animation-end cleanup and pinned soul End Step',()=>{
  const a=fixture(),b=fixture(),targets=[a,b].map(f=>{GmInstance.layerEntries=f.layerEnd;const s=f.rt.create(f.object('obj_roaringknight_splitslash'),320,170);run(f,s,'step');Object.assign(s,{slash:true,playerstrike:1,memheartx:279,memhearty:162});f.layerEnd=GmInstance.layerEntries;return s;});
  for(const [event,suffix] of [['endStep','Step_2'],['animationEnd','Other_7']] as const){run(a,targets[0],event);executeNeoSource(original(targets[1].object.name,suffix),targets[1],b.rt,sourceHost(b),undefined,event);expect(state(a)).toEqual(state(b));}
  targets[0].playerstrike=targets[1].playerstrike=0;
  run(a,targets[0],'animationEnd');executeNeoSource(original(targets[1].object.name,'Other_7'),targets[1],b.rt,sourceHost(b),undefined,'animationEnd');expect(state(a)).toEqual(state(b));expect(targets[0].live).toBe(false);
 });
});
