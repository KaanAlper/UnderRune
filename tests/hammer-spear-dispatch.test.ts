import fs from 'node:fs';
import {describe,it,expect} from 'vitest';
import {GmRuntime,type GmInstance,type GmObjectDef} from '../src/remake/gm/runtime';
import {loadSprites} from './parity/reference';
import {executeNeoSource} from '../src/remake/bosses/spamton-neo/body-source';
import {spawnHammerSpear} from '../src/remake/bosses/hammer-of-justice/spear-shot';
import resources from '../src/remake/host/chapter4-resources.json';
const dir='extracted/chapter4_windows/code/',file=dir+'gml_GlobalScript_scr_spearshot.gml',ready=fs.existsSync(file),original=ready?fs.readFileSync(file,'utf8'):'';
const script=(n:string)=>fs.readFileSync(dir+'gml_GlobalScript_'+n+'.gml','utf8');
function fixture(alternate=false){
 const rt=new GmRuntime(loadSprites(4),{seed:12}),defs=new Map(resources.map(d=>[d.name,{...d,parent:undefined,sprite:d.sprite??undefined,mask:d.mask??undefined} as GmObjectDef]));for(const d of resources)if(d.parent)defs.get(d.name)!.parent=defs.get(d.parent);
 const object=(n:string)=>{const d=defs.get(n);if(!d)throw Error(n);return d;};
 rt.globals={chapter:4,turntimer:500,monsterattackname:[''],monsterat:[14]};
 for(const [n,x,y]of [['obj_heart',320,180],['obj_growtangle',320,180],['obj_spearblocker',320,180],['obj_gerson_darken',320,180],['obj_gerson_darkness_overlay',0,0]] as const)rt.create(object(n),x,y);
 object('obj_gerson_speen').events={user0:s=>{s.verifiedUser0=1;}};
 const s=rt.create(object(alternate?'obj_sound_of_justice_enemy':'obj_hammer_of_justice_enemy'),460,161);Object.assign(s,{myself:0,mytarget:1,introtalkcon:0,susiedown:false,swingdown_ex:0});
 const sounds:any[]=[];return {rt,object,s,sounds,audio:{play:(_s:GmInstance,...args:any[])=>{sounds.push(['play',...args]);return 3;},playAt:(_s:GmInstance,...args:any[])=>{sounds.push(['playAt',...args]);return 4;}}};
}
const state=(r:ReturnType<typeof fixture>)=>({g:r.rt.globals,sounds:r.sounds,rng:r.rt.random.snapshot(),instances:r.rt.instances.map(s=>Object.fromEntries(Object.entries(s).filter(([k])=>!['frameCount','layerEntry'].includes(k)).map(([k,v])=>[k,k==='object'?v.name:typeof v==='boolean'?Number(v):v])))});
function compare(args:number[],alternate=false){
 const a=fixture(alternate),b=fixture(alternate);
 spawnHammerSpear(a.s,a.rt,a.object,a.audio,...args);
 executeNeoSource(original,b.s,b.rt,{object:b.object,text:k=>k,scripts:{scr_bulletspawner:script('scr_bulletspawner'),scr_heartcolor:script('scr_heartcolor')},call:(n,s,_r,args)=>{if(n==='snd_play')return b.audio.play(s,...args);if(n==='snd_play_x')return b.audio.playAt(s,...args);throw Error(n);}},undefined,undefined,args,'scr_spearshot');
 expect(state(a)).toEqual(state(b));return a;
}
describe.skipIf(!ready)('source spear dispatcher at explicit child-actor boundaries',()=>{
 const special=[-1,0,1,2,3,4,5,6,7,8,9,10,10.5,11,12,13,14,16,17,18,19,20,20.1,21,21.6,21.65,21.66,21.9,22,23,24,25,26,27,28,29,30,31,32,33,34,35,355,36,37,38,39,40,40.4,40.5,40.6,40.75,41,41.1,42,42.1,42.2,43,50,51,52,53,54,55,400];
 for(const kind of special)for(const count of [4,5,6])it(`special ${kind}, ${count} arguments`,()=>{compare([90,5,20,kind,...count>=5?[.75]:[],...count===6?[.25]:[]]);});
 for(const type of [-5,-4,-3,-2,-1,0,2,3,4,5,6,7,8,9,10,11])it(`swing placement ${type}`,()=>{compare([35,5,type,4]);});
 for(const angle of [0,90,180,270])it(`alternate battle telegraph ${angle}`,()=>{compare([angle,5,20,0,.75],true);});
});
