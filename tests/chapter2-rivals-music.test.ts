import fs from 'node:fs';
import {describe,it,expect} from 'vitest';
import {GmRuntime,type GmObjectDef,type GmInstance} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
import {growtangle,bulletInit,heart,afterImage,afterimageGrow} from '../src/remake/deltarune/battle';
import {lerpEaseOut} from '../src/remake/deltarune/ease';
import {createMusicalBullets} from '../src/remake/bosses/chapter2-rivals/musical-bullets';
import {executeNeoSource,type NeoSourceHost} from '../src/remake/bosses/spamton-neo/body-source';
import {createMusicalScore} from '../src/remake/bosses/chapter2-rivals/musical-score';
const path='extracted/chapter2_windows/code/gml_Object_obj_musicalbullet_controller_';
function fixture(seed=11){
 const rt=new GmRuntime(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]}),{seed});
 const defs=new Map<string,GmObjectDef>([[growtangle.name,growtangle],[heart.name,heart]]),object=(name:string)=>{let d=defs.get(name);if(!d){d={name,index:5000+defs.size};defs.set(name,d);}return d;};
 const score=createMusicalScore(object);defs.set(score.name,score);for(const d of createMusicalBullets(object))defs.set(d.name,d);
 rt.restore(growtangle,99000,320,206);rt.restore(object('obj_sweet_enemy'),99001,460,40,{musical_bullet_difficulty:2,solotimer:0});
 rt.restore(object('obj_musicenemy_boombox'),99002,205,286,{makebullet:0});rt.restore(object('obj_musicenemy_boombox'),99003,435,286,{makebullet:0});
 rt.restore(heart,99004,270,190);
 rt.globals={chapter:2,turntimer:235};
 const host:NeoSourceHost={object,text:k=>k,call:(name,s,r,args)=>{
  if(name==='scr_bullet_init')return bulletInit(s);
  if(name==='scr_afterimage')return afterImage(s,r).id;
  if(name==='lerp_ease_out')return lerpEaseOut(args[0],args[1],args[2],args[3]);
  if(name==='scr_afterimage_grow'){const a=r.create(afterimageGrow,s.x,s.y);s.afterimage=a.id;Object.assign(a,{sprite:s.sprite,imageIndex:s.imageIndex,imageBlend:s.imageBlend,imageSpeed:0,depth:s.depth,imageXscale:s.imageXscale,imageYscale:s.imageYscale,imageAngle:s.imageAngle});return a.id;}
  if(name==='scr_childbullet'){const d=r.create(args[2],args[0],args[1]);for(const k of ['damage','grazepoints','timepoints','inv','target','grazed','grazetimer'])if(s[k]!==-1)d[k]=s[k];d.element=s.element;return d.id;}
  throw Error('Unexpected '+name);
 }};
 return {rt,object,host,score};
}
const state=(s:GmInstance)=>Object.fromEntries(Object.entries(s).filter(([k])=>!['layerEntry','frameCount'].includes(k)).map(([k,v])=>[k,k==='object'?v.name:v]));
describe.skipIf(!fs.existsSync(path+'Create_0.gml'))('music score compared with installed original',()=>{
 for(const seed of [0,11,9182]){
  it(`matches Create and random stream ${seed}`,()=>{
   const a=fixture(seed),b=fixture(seed),actual=a.rt.create(a.score,460,40),expected=b.rt.restore(b.score,actual.id,460,40);
   executeNeoSource(fs.readFileSync(path+'Create_0.gml','utf8'),expected,b.rt,b.host,undefined,'create');
   expect(a.rt.instances.map(state)).toEqual(b.rt.instances.map(state));expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());
  });
  for(const increment of [1,2])it(`matches every authored beat and simultaneous event, increment ${increment}, seed ${seed}`,()=>{
   const a=fixture(seed),b=fixture(seed),actual=a.rt.create(a.score,460,40),expected=b.rt.create(b.score,460,40);
   const step=fs.readFileSync(path+'Step_0.gml','utf8');
   for(let time=increment;time<=3220;time+=increment){
    for(const f of [a,b])f.rt.first(f.object('obj_sweet_enemy'))!.solotimer=time;
    actual.object.events!.step!(actual,a.rt);executeNeoSource(step,expected,b.rt,b.host,undefined,'step');
    expect(a.rt.instances.map(state),`beat ${time}`).toEqual(b.rt.instances.map(state));expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());
   }
  });
 }
});

describe.skipIf(!fs.existsSync(path+'Create_0.gml'))('music projectile events compared with installed source',()=>{
 const read=(name:string,event:string)=>fs.readFileSync(`extracted/chapter2_windows/code/gml_Object_${name}_${event}.gml`,'utf8');
 for(const seed of [0,11,9182]){
  for(const name of ['obj_musicenemy_boombox','obj_musicenemy_dancer','obj_musical_note_bullet','obj_musical_note_bullet_segment'])it(`matches ${name} Create/RNG ${seed}`,()=>{
   const a=fixture(seed),b=fixture(seed),actual=a.rt.create(a.object(name),205,286),expected=b.rt.restore(b.object(name),actual.id,205,286);
   executeNeoSource(read(name,'Create_0'),expected,b.rt,b.host,undefined,'create');expect(a.rt.instances.map(state)).toEqual(b.rt.instances.map(state));expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());
  });
  for(const shot of [0,1,2,3])for(const flip of [1,-1])for(const segments of [0,3])it(`matches speaker shot ${shot} flip ${flip} segments ${segments}, seed ${seed}`,()=>{
   const a=fixture(seed),b=fixture(seed),actual=a.rt.create(a.object('obj_musicenemy_boombox'),205,286),expected=b.rt.create(b.object('obj_musicenemy_boombox'),205,286);
   for(const s of [actual,expected])Object.assign(s,{makebullet:shot,imageXscale:flip,damage:40,target:2,segmentcountmax:segments});
   actual.object.events!.step!(actual,a.rt);executeNeoSource(read(expected.object.name,'Step_0'),expected,b.rt,b.host,undefined,'step');expect(a.rt.instances.map(state)).toEqual(b.rt.instances.map(state));expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());
  });
  for(const type of [0,1])it(`matches dancer Draw gameplay through one animation cycle, type ${type}, seed ${seed}`,()=>{
   const a=fixture(seed),b=fixture(seed),actual=a.rt.create(a.object('obj_musicenemy_dancer'),260,100),expected=b.rt.create(b.object('obj_musicenemy_dancer'),260,100);
   for(const s of [actual,expected])Object.assign(s,{active:1,bultype:type,damage:40,target:2,sprite:'spr_musical_bullet_dancer'});
   for(let i=0;i<15;i++){actual.object.events!.draw!(actual,a.rt);executeNeoSource(read(expected.object.name,'Draw_0'),expected,b.rt,b.host,undefined,'draw');expect(a.rt.instances.map(state)).toEqual(b.rt.instances.map(state));expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());}
  });
 }
});
