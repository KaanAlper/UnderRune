import fs from 'node:fs';
import {describe,it,expect} from 'vitest';
import {GmRuntime,resolveEvent,type GmInstance,type GmObjectDef,type GmEvent} from '../src/remake/gm/runtime';
import {loadSprites} from './parity/reference';
import {executeNeoSource} from '../src/remake/bosses/spamton-neo/body-source';
import {createHammerProjectile} from '../src/remake/bosses/hammer-of-justice/projectile';
import {spawnHammerSpear} from '../src/remake/bosses/hammer-of-justice/spear-shot';
import resources from '../src/remake/host/chapter4-resources.json';
const dir='extracted/chapter4_windows/code/',ready=fs.existsSync(dir+'gml_Object_obj_spearshot_Create_0.gml');
const events={create:'Create_0',step:'Step_0',draw:'Draw_0',user0:'Other_10',user1:'Other_11',cleanup:'CleanUp_0'} as const;
const sourceEvents=Object.fromEntries(Object.entries(events).map(([ev,part])=>[ev,ready?fs.readFileSync(dir+`gml_Object_obj_spearshot_${part}.gml`,'utf8'):'']));
const bulletScript=ready?fs.readFileSync(dir+'gml_GlobalScript_scr_bullet_init.gml','utf8'):'';
function fixture(source:boolean,diagonal=false){
 const rt=new GmRuntime(loadSprites(4),{seed:14}),packets:any[]=[],calls:any[]=[],defs=new Map(resources.map(d=>[d.name,{...d,parent:undefined,sprite:d.sprite??undefined,mask:d.mask??undefined} as GmObjectDef]));for(const d of resources)if(d.parent)defs.get(d.name)!.parent=defs.get(d.parent);
 const object=(n:string)=>{const d=defs.get(n);if(!d)throw Error(n);return d;};
 const scripts={play:(_s:GmInstance,...a:any[])=>{calls.push(['play',...a]);return 3;},playAt:(_s:GmInstance,...a:any[])=>{calls.push(['playAt',...a]);return 4;},playPitch:(_s:GmInstance,...a:any[])=>{calls.push(['playPitch',...a]);return 5;},stop:(_s:GmInstance,...a:any[])=>calls.push(['stop',...a]),shakeObject:()=>{throw Error('Unexpected shake helper');},tensionHeal:(s:GmInstance,n:number)=>calls.push(['tension',s.id,n]),damage:(s:GmInstance)=>calls.push(['damage',s.id,s.damage,s.target]),triggerEvent:(s:GmInstance,n:number)=>calls.push(['event',s.id,n]),afterimage:(s:GmInstance)=>rt.create(object('obj_afterimage'),s.x,s.y).id};
 const d=createHammerProjectile(object,scripts);defs.set(d.name,d);
 if(source)d.events=Object.fromEntries(Object.entries(events).map(([ev])=>[ev,(s:GmInstance,r:GmRuntime)=>executeNeoSource(sourceEvents[ev],s,r,{object,text:k=>k,scripts:{scr_bullet_init:bulletScript},call:(name,self,_r,args)=>{
  if(name==='debug_message')return;
  if(name==='angle_difference')return (((args[0]-args[1])%360+540)%360)-180;
  const key=({snd_play:'play',snd_play_x:'playAt',snd_play_pitch:'playPitch',snd_stop:'stop',scr_tensionheal:'tensionHeal',scr_damage:'damage',scr_afterimage:'afterimage',trigger_event:'triggerEvent'} as Record<string,keyof typeof scripts>)[name];if(!key)throw Error(name);return (scripts[key] as any)(self,...args);
 }},undefined,ev as GmEvent)]));
 rt.gfx={sprite:(...a:any[])=>packets.push(['sprite',...a]),spriteFog:(...a:any[])=>packets.push(['fog',...a]),rect:()=>{},circle:()=>{},text:()=>{}};
 rt.globals={chapter:4,hp:[0,0,230],turntimer:500,inv:0,monsterat:[14],monsterattackname:['']};
 rt.create(object('obj_heart'),310,160);rt.create(object('obj_growtangle'),320,170);
 // Shield input/particle behavior has its own source tests. Here its event boundaries are recorded.
 const shield=rt.create(object('obj_spearblocker'),320,170);Object.assign(shield,{diagonal_enabled:Number(diagonal),just:0,imageAngle:0,idealdir:0,vanish:0});shield.object.events={user0:s=>calls.push(['shield0',s.id]),user1:s=>calls.push(['shield1',s.id])};
 const owner=rt.create(object('obj_hammer_of_justice_enemy'),460,161);Object.assign(owner,{myself:0,mytarget:1});
 return {rt,object,owner,shield,scripts,packets,calls};
}
const state=(r:ReturnType<typeof fixture>)=>({g:r.rt.globals,rng:r.rt.random.snapshot(),packets:r.packets,calls:r.calls,instances:r.rt.instances.map(s=>Object.fromEntries(Object.entries(s).filter(([k,v])=>!['frameCount','layerEntry'].includes(k)&&!(Array.isArray(v)&&!v.length)).map(([k,v])=>[k,k==='object'?v.name:typeof v==='boolean'?Number(v):v])))});
describe.skipIf(!ready)('source spear movement, blocking and rendering at child-script boundaries',()=>{
 for(const special of [0,14,16,17,18,19,20,21,22,25,30,35,355,40,40.6,41,41.1,42,42.2])for(const dir of [0,90,180,270])it(`special ${special}, direction ${dir}`,()=>{
  const a=fixture(false),b=fixture(true);for(const r of [a,b]){r.shield.imageAngle=dir===0?0:dir-180;r.shield.idealdir=r.shield.imageAngle;spawnHammerSpear(r.owner,r.rt,r.object,r.scripts,dir,5,special===14?90:25,special,.75);}
  for(let f=0;f<140;f++){for(const r of [a,b]){r.rt.step();r.rt.draw();}expect(state(a)).toEqual(state(b));a.packets.length=0;b.packets.length=0;}
 });
 for(const angle of [0,45,90,135,180,225,270,315])for(const just of [0,4])it(`direct collision angle ${angle}, parry ${just}`,()=>{
  const a=fixture(false,angle%90!==0),b=fixture(true,angle%90!==0);
  for(const r of [a,b]){r.shield.imageAngle=(angle+180)%360;r.shield.idealdir=r.shield.imageAngle;r.shield.just=just;const s=r.rt.create(r.object('obj_spearshot'),320,170);Object.assign(s,{len:20,direction:angle,imageAngle:angle});resolveEvent(s.object,'user0')!(s,r.rt);}
  expect(state(a)).toEqual(state(b));expect(a.calls.some(c=>c[0]==='shield0')).toBe(true);
 });
 it('unblocked spear uses the source HP-dependent damage and target',()=>{
  const a=fixture(false),b=fixture(true);for(const r of [a,b]){const s=r.rt.create(r.object('obj_spearshot'),310,160);Object.assign(s,{len:0,direction:90,imageAngle:90});resolveEvent(s.object,'user0')!(s,r.rt);}expect(state(a)).toEqual(state(b));expect(a.calls.some(c=>c[0]==='damage')).toBe(true);
 });
});
