import fs from 'node:fs';
import {describe,it,expect} from 'vitest';
import {GmRuntime,type GmObjectDef,type GmInstance} from '../src/remake/gm/runtime';
import {loadSprites} from './parity/reference';
import {setSourceText} from '../src/remake/host/text';
import {executeNeoSource} from '../src/remake/bosses/spamton-neo/body-source';
import {initializeHammer} from '../src/remake/bosses/hammer-of-justice/init';
import {drawHammer} from '../src/remake/bosses/hammer-of-justice/draw';
import resources from '../src/remake/host/chapter4-resources.json';
const dir='extracted/chapter4_windows/code/',file=dir+'gml_Object_obj_hammer_of_justice_enemy_Draw_0.gml',ready=fs.existsSync(file),original=ready?fs.readFileSync(file,'utf8'):'';
const script=(n:string)=>fs.readFileSync(dir+'gml_GlobalScript_'+n+'.gml','utf8');
function fixture(){
 const packets:any[]=[],sounds:any[]=[],rt=new GmRuntime(loadSprites(4),{seed:45});
 rt.gfx={sprite:(...a:any[])=>packets.push(['sprite',...a]),spriteFog:(...a:any[])=>packets.push(['fog',...a]),rect:()=>{},circle:()=>{},text:()=>{}};
 const defs=new Map(resources.map(d=>[d.name,{...d,parent:undefined,sprite:d.sprite??undefined,mask:d.mask??undefined} as GmObjectDef]));for(const d of resources)if(d.parent)defs.get(d.name)!.parent=defs.get(d.parent);
 const object=(n:string)=>defs.get(n)!;rt.globals={chapter:4,invc:1,spell:[[],[],Array(12).fill(0)],flag:Array(9999).fill(0),mercymod:[0],mercymax:[100],turntimer:500,chartarget:[0],monsterx:[460],monstery:[161]};
 rt.create(object('obj_battlecontroller'),0,0);const s=rt.create(object('obj_hammer_of_justice_enemy'),460,161);setSourceText(new Proxy({},{get:(_o,k)=>String(k)}));initializeHammer(s,rt,object);s.myself=0;
 const scripts={play:(_s:GmInstance,...a:any[])=>{sounds.push(['play',...a]);return 3;},stop:(_s:GmInstance,...a:any[])=>{sounds.push(['stop',...a]);},shakeObject:(s:GmInstance)=>{sounds.push(['shake',s.id]);},tensionHeal:(s:GmInstance,v:number)=>{sounds.push(['tension',s.id,v]);}};
 return {rt,object,s,scripts,packets,sounds};
}
const state=(r:ReturnType<typeof fixture>)=>({g:r.rt.globals,draw:r.rt.drawState,rng:r.rt.random.snapshot(),sounds:r.sounds,packets:r.packets,instances:r.rt.instances.map(s=>Object.fromEntries(Object.entries(s).filter(([k])=>!['frameCount','layerEntry'].includes(k)).map(([k,v])=>[k,k==='object'?v.name:typeof v==='boolean'?Number(v):v])))});
function compare(prepare:(r:ReturnType<typeof fixture>)=>void,frames=75){
 const a=fixture(),b=fixture();prepare(a);prepare(b);
 for(let f=0;f<frames;f++){
  drawHammer(a.s,a.rt,a.object,a.scripts);
  executeNeoSource(original,b.s,b.rt,{object:b.object,text:k=>k,scripts:Object.fromEntries(['scr_enemy_drawhurt_generic','scr_enemy_drawidle_generic','draw_monster_body_part'].map(n=>[n,script(n)])),call:(n,s,_r,args)=>{
   if(n==='snd_play')return b.scripts.play(s,...args);if(n==='snd_stop')return b.scripts.stop(s,...args);if(n==='scr_shakeobj')return b.scripts.shakeObject(s);if(n==='scr_tensionheal')return b.scripts.tensionHeal(s,args[0]);throw Error(n);
  }});
  expect(state(a)).toEqual(state(b));a.packets.length=0;b.packets.length=0;
 }
 return a;
}
describe.skipIf(!ready)('Hammer source Draw and source-owned animation events',()=>{
 for(const state of [0,3,10,11,12,13,14])for(const flash of [0,1])it(`state ${state}, flash ${flash}`,()=>{compare(({s})=>{s.state=state;s.flash=flash;s.becomeflash=flash;s.saverudebusterstarcount=8;s.motor_swing_down=750;});});
 for(const gold of [0,1])for(const timer of [0,100])it(`gold ${gold}, timer ${timer}`,()=>{compare(({s,rt})=>{s.goldcon=gold;rt.globals.turntimer=timer;s.goldalpha=.1;s.rudebusterflashcon=1;s.rudebusterflashtimer=2;});});
 for(const nohair of [false,true])it(`final animation, no hair ${nohair}`,()=>{compare(({s})=>{s.endcon=5;s.endtimer=25;s.nohairsprite=nohair;});});
 it('does not advance Chapter 4 hurt timing in Draw',()=>{const a=compare(({s})=>{s.state=3;s.hurttimer=6;},3);expect(a.s.hurttimer).toBe(6);});
});
