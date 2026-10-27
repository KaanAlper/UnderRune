import fs from 'node:fs';
import {it,expect} from 'vitest';
import {GmRuntime,resolveEvent,type GmObjectDef,type GmInstance} from '../src/remake/gm/runtime';
import {loadSprites} from './parity/reference';
import {heart,grazebox,growtangle} from '../src/remake/deltarune/battle';
import {createHammerShield} from '../src/remake/bosses/hammer-of-justice/shield';
import {executeNeoSource} from '../src/remake/bosses/spamton-neo/body-source';
const dir='extracted/chapter4_windows/code/';
const state=(s:GmInstance)=>Object.fromEntries(Object.entries(s).filter(([k])=>!['frameCount','layerEntry','object'].includes(k)).map(([k,v])=>[k,typeof v==='boolean'?Number(v):v]));
function fixture(original=false){
 const rt=new GmRuntime(loadSprites(4),{seed:11}),objects=new Map<string,GmObjectDef>([[heart.name,{...heart,events:{...heart.events}}],[grazebox.name,grazebox],[growtangle.name,{name:growtangle.name,index:growtangle.index}]]);
 const object=(n:string)=>{if(!objects.has(n))objects.set(n,{name:n,index:1000+objects.size});return objects.get(n)!;};for(const d of createHammerShield(object))objects.set(d.name,d);
 const hdef=object('obj_heart');if(original)for(const [event,part]of [['create','Create_0'],['step','Step_0']] as const)hdef.events![event]=(s,r)=>executeNeoSource(fs.readFileSync(dir+`gml_Object_obj_heart_${part}.gml`,'utf8'),s,r,{object,text:k=>k,call:(name,_s,r)=>{
  const key=({left:37,up:38,right:39,down:40,button2:88} as Record<string,number>)[name.split('_')[0]];if(key)return r.input.held.has(key);throw Error(name);
 }},undefined,event);
 rt.globals={chapter:4,char:[2,0,0],chararmor1:[0,0,0,0,0],chararmor2:[0,0,0,0,0],flag:Array(9999).fill(0),inv:-1,invc:1,turntimer:500,tension:0,maxtension:250};
 const box=rt.create(object('obj_growtangle'),320,170),h=rt.create(hdef,100,100),shield=rt.create(object('obj_spearblocker'),320,170);return {rt,h,box,shield};
}
it('keeps the green soul at the moving box center while arrows control the shield',()=>{
 const a=fixture(),b=fixture(true);
 for(let f=0;f<80;f++)for(const run of [a,b]){
  run.rt.input.held.clear();run.rt.input.held.add(f<40?39:38);run.box.x=320-f;run.box.y=170+f/4;
  resolveEvent(run.h.object,'step')!(run.h,run.rt);
  if(run===b){expect(state(a.h)).toEqual(state(b.h));expect(a.rt.globals).toEqual(b.rt.globals);expect(a.h.remove_slow_z_buffer).toBe(40);}
 }
 expect(a.h.sprite).toBe('spr_greenheart');expect(a.h.press_r).toBe(0);expect(a.h.press_u).toBe(0);
});
it('restores ordinary movement when the source shield stops locking the soul',()=>{
 const a=fixture(),b=fixture(true);for(const run of [a,b]){run.shield.vanish=1;run.h.x=200;run.h.y=150;run.rt.input.held.add(39);resolveEvent(run.h.object,'step')!(run.h,run.rt);}
 expect(state(a.h)).toEqual(state(b.h));expect(a.h.x).toBe(204);
});
it('keeps Chapter 4 red-soul buffering identical to its source',()=>{
 const a=fixture(),b=fixture(true);for(const run of [a,b]){run.rt.destroy(run.shield);run.h.color=0;run.h.sprite='spr_dodgeheart';run.rt.input.held.add(39);resolveEvent(run.h.object,'step')!(run.h,run.rt);}
 expect(state(a.h)).toEqual(state(b.h));expect(a.h.remove_slow_z_buffer).toBe(40);
});
