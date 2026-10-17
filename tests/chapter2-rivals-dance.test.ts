import fs from 'node:fs';
import {describe,it,expect} from 'vitest';
import {GmRuntime,type GmObjectDef,type GmInstance} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
import {enemyObjectInit,actCharSprite,simulText,terminateWriter} from '../src/remake/deltarune/chapter2-enemy';
import {battleTextDefault,writer} from '../src/remake/deltarune/writer';
import {msgSet,msgNext} from '../src/remake/deltarune/chapter2-battle';
import {nextAct} from '../src/remake/deltarune/controller';
import {setSourceText} from '../src/remake/host/text';
import {executeNeoSource,type NeoSourceHost} from '../src/remake/bosses/spamton-neo/body-source';
import {trioDanceActs} from '../src/remake/bosses/chapter2-rivals/trio-dance';
const path='extracted/chapter2_windows/code/gml_Object_';
const state=(s:GmInstance)=>Object.fromEntries(Object.entries(s).filter(([k])=>!['layerEntry','frameCount'].includes(k)).map(([k,v])=>[k,k==='object'?v.name:v]));
function fixture(name:string,lang:string){
 const rt=new GmRuntime(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]}),{seed:11});
 rt.globals={chapter:2,flag:Array(1000).fill(0),darkzone:1,monster:[0,0,0],monstercomment:[' '],myfight:3,lang,msg:Array(100).fill(''),typer:4,fc:0,fe:0,faceaction:[0,0,0]};
 // Isolate ACT branching from the shared writer's explicitly unported Japanese font selection.
 // Both actual and original events still create/run the same real English writer implementation.
 const create=rt.create.bind(rt);rt.create=((object,...args)=>{const old=rt.globals.lang;if(object.name==='obj_writer')rt.globals.lang='en';try{return create(object,...args);}finally{rt.globals.lang=old;}}) as typeof rt.create;
 const defs=new Map<string,GmObjectDef>([[writer.name,writer]]),object=(n:string)=>{let d=defs.get(n);if(!d){d={name:n,index:5000+defs.size};defs.set(n,d);}return d;};
 const s=rt.restore(object(name),99000,480,100);enemyObjectInit(s,rt);Object.assign(s,{myself:0,danceCounter:0,groove:0,dancing:false,dancedwithsusie:0});
 for(const n of ['obj_sweet_enemy','obj_hatguy_enemy','obj_kk_enemy'])if(n!==name)rt.restore(object(n),99001+defs.size,460,40,{dancing:false,endcon:0,actCounter:0,simultotal_funny:0});
 const host:NeoSourceHost={object,text:k=>k,call:(n,c,r,args)=>{
  if(n==='scr_act_charsprite')return actCharSprite(c,r,args[0],args[1],args[2],args[3]);
  if(n==='scr_battletext_default')return battleTextDefault(r,c).id;
  if(n==='scr_simultext')return simulText(c,r,args[0]).id;
  if(n==='scr_terminate_writer')return terminateWriter(c,r);
  if(n==='scr_nextact')return nextAct(r,c);
  if(n==='msgset')return msgSet(r,args[0],args[1]);if(n==='msgnext')return msgNext(r,args[0]);throw Error('Unexpected '+n);
 }};
 return {rt,object,s,host};
}
describe.skipIf(!fs.existsSync(path+'obj_hatguy_enemy_Step_0.gml'))('trio dance ACT source comparison',()=>{
 for(const name of ['obj_hatguy_enemy','obj_kk_enemy'])for(const lang of ['en','ja'])for(const command of ['check','kris','all','susie','ralsei'])for(const simul of [0,1])for(const groove of [0,1])it(`${name} ${lang} ${command} simultaneous ${simul} groove ${groove}`,()=>{
  const code=fs.readFileSync(path+name+'_Step_0.gml','utf8'),texts=Object.fromEntries([...code.matchAll(/"((?:obj|scr)_[^"]+_gml_[^"]+)"/g)].map(m=>[m[1],m[1]]));setSourceText(texts);
  try{
   const a=fixture(name,lang),b=fixture(name,lang);
   for(const f of [a,b])Object.assign(f.s,{groove,simultotal:simul,acting:command==='check'?1:command==='kris'?2:command==='all'?3:0,actingsus:command==='susie'?1:0,actconsus:command==='susie'?1:0,actingral:command==='ralsei'?1:0,actconral:command==='ralsei'?1:0});
   trioDanceActs(a.s,a.rt,a.object,name==='obj_hatguy_enemy'?'capn':'kk');executeNeoSource(code,b.s,b.rt,b.host,undefined,'step');
   expect(a.rt.instances.map(state)).toEqual(b.rt.instances.map(state));expect(a.rt.globals).toEqual(b.rt.globals);
  }finally{setSourceText({});}
 });
});


