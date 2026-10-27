import fs from 'node:fs';
import {describe,it,expect} from 'vitest';
import {GmRuntime,type GmObjectDef,type GmInstance} from '../src/remake/gm/runtime';
import {loadSprites} from './parity/reference';
import {executeNeoSource} from '../src/remake/bosses/spamton-neo/body-source';
import {cleanupHammer} from '../src/remake/bosses/hammer-of-justice/cleanup';
const dir='extracted/chapter4_windows/code/',file=dir+'gml_Object_obj_hammer_of_justice_enemy_CleanUp_0.gml',ready=fs.existsSync(file),original=ready?fs.readFileSync(file,'utf8'):'';
const scripts=Object.fromEntries(['scr_getchar','scr_losechar'].map(n=>[n,ready?fs.readFileSync(dir+'gml_GlobalScript_'+n+'.gml','utf8'):'']));
function fixture(party:number[],controllers:number){
 const rt=new GmRuntime(loadSprites(4)),defs=new Map<string,GmObjectDef>(),object=(name:string)=>{if(!defs.has(name))defs.set(name,{name,index:defs.size+1});return defs.get(name)!;};
 rt.globals={char:[...party],invc:.5,sp:5,charturn:1,submenu:3,charselect:2,submenucoord:Array(40).fill(8),faceaction:[1,2,3]};
 for(let i=0;i<controllers;i++){const dc=rt.create(object('obj_darkcontroller'),0,0);Object.assign(dc,{havechar:[1,1,1,1,17],charpos:[9,9,9,9],chartotal:0});}
 rt.setSpriteOffset('spr_spearblocker',27,27);return {rt,object,s:rt.create(object('obj_hammer_of_justice_enemy'),0,0)};
}
// The test adapter preallocates empty with-block arrays on the caller; native indexed writes do not.
const state=(s:GmInstance)=>Object.fromEntries(Object.entries(s).filter(([k,v])=>!['frameCount','layerEntry','object'].includes(k)&&!(Array.isArray(v)&&!v.length)));
describe.skipIf(!ready)('Hammer source CleanUp party and runtime restoration',()=>{
 for(const party of [[1,2,3],[2,0,0],[0,0,0],[4,2,3]])for(const controllers of [0,1,2])it(`party ${party}, controllers ${controllers}`,()=>{
  const a=fixture(party,controllers),b=fixture(party,controllers);cleanupHammer(a.s,a.rt,a.object);
  executeNeoSource(original,b.s,b.rt,{object:b.object,text:k=>k,scripts,call:(n,_s,r,args)=>{if(n==='sprite_set_offset')return r.setSpriteOffset(args[0],args[1],args[2]);throw Error(n);}});
  expect(a.rt.globals).toEqual(b.rt.globals);expect(a.rt.instances.map(state)).toEqual(b.rt.instances.map(state));expect(a.rt.bank.get('spr_spearblocker')?.originX).toBe(32);
 });
});
