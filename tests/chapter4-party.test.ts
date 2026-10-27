import fs from 'node:fs';
import {describe,it,expect} from 'vitest';
import {GmRuntime,resolveEvent,type GmObjectDef} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
import {executeNeoSource} from '../src/remake/bosses/spamton-neo/body-source';
import {castSpell,HERO_DEFS,rudeBusterBolt,spellText} from '../src/remake/deltarune/party';
import {afterImage} from '../src/remake/deltarune/battle';
import {setSourceText} from '../src/remake/host/text';
import {chapterText} from './parity/chapter2-runner';
const dir='extracted/chapter4_windows/code/';
const read=(n:string)=>fs.readFileSync(dir+n+'.gml','utf8');
function fixture(){
 const rt=new GmRuntime(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]}));
 const g:Record<string,any>=rt.globals={chapter:4,fighting:1,char:[2,0,0],hp:[0,0,10,0],maxhp:[0,0,230,0],chararmor1:[0,0,26,0],chararmor2:[0,0,26,0],charweapon:[0,0,2,0],chartarget:[0,0,0],battlemag:[8,0,0],flag:Array(9999).fill(0),monster:[1,0,0],faceaction:[0,0,0],charcond:[0,0,0],targeted:[0,0,0],charmove:[1,0,0],charcantarget:[1,0,0],chardead:[0,0,0],charinstance:[] as number[],spell:Array.from({length:5},()=>Array(12).fill(0))};
 const s=rt.restore(HERO_DEFS[1],10001,108,149,{myself:0,char:2,myheight:82,tu:0});g.charinstance=[s.id,0,0];
 return {rt,g,s};
}
describe.skipIf(!fs.existsSync(dir+'gml_GlobalScript_scr_spell.gml'))('Chapter 4 party source paths',()=>{
 for(const [spell,base] of [[201,120],[202,115],[205,20],[206,160],[207,160],[208,70],[209,50],[210,4],[211,70],[212,80],[213,20],[214,500],[215,50],[216,80],[218,10],[219,10],[220,10],[221,10],[222,60],[223,120],[224,100],[225,30],[226,90],[232,40],[234,100],[236,20],[237,80],[238,100],[239,140],[260,40],[261,115],[262,160],[263,240]])it(`item ${spell-200} preserves source healing and equipment path`,()=>{
  const a=fixture(),b=fixture();
  const objects=new Map<string,GmObjectDef>();const object=(name:string)=>{if(!objects.has(name))objects.set(name,{name,index:objects.size+1});return objects.get(name)!;};
  const heals:number[]=[];
  executeNeoSource(read('gml_GlobalScript_scr_spell'),b.s,b.rt,{object,text:k=>k,scripts:{scr_heal_amount_modify_by_equipment:read('gml_GlobalScript_scr_heal_amount_modify_by_equipment')},call:(name,_s,rt,args)=>{if(name==='scr_healitemspell'||name==='scr_healallitemspell'){heals.push(Number(args[0]));return rt.create(object('obj_healanim'),0,0).id;}if(name==='snd_play')return 1;throw Error(name);}},undefined,undefined,[spell,0],'scr_spell');
  castSpell(a.s,a.rt,spell,0);
  expect(heals).toHaveLength(1);expect(heals[0]).toBe(base+([210,232,262].includes(spell)?0:2*Math.ceil(base/8)));
  expect(a.g.hp[2]).toBe(Math.min(230,10+heals[0]));expect(a.rt.byId(a.s.dmgwr)?.damage).toBe(heals[0]);expect(a.g.spelldelay).toBe([206,207,211,225,238].includes(spell)?20:15);
 });
 it('creates the Chapter 4 hero fields and mirrored Draw without resetting the blend',()=>{
  const {rt,s}=fixture();resolveEvent(s.object,'create')!(s,rt);
  expect(s.showdarkness).toBe(true);expect(s.remspellsprite).toBe(s.spellsprite);
  s.thissprite=s.idlesprite;s.imageBlend=0x123456;s.imageXscale=-2;resolveEvent(s.object,'draw')!(s,rt);expect(s.imageBlend).toBe(0x123456);
 });
 it('initializes Chapter 4 Rude Buster locking and flight fields',()=>{
  const {rt}=fixture(),s=rt.create(rudeBusterBolt,100,150);
  expect(s.speedmax).toBe(24);expect(s.lockdamage).toBe(false);expect(s.gersonoffset).toBe(0);expect(s.hurtflashalpha).toBe(0);
 });
 for(const state of [0,1,2,4,6,7,8])for(const hurt of [0,1])it(`hero Step state ${state}, hurt ${hurt} matches Chapter 4 source`,()=>{
  const a=fixture(),b=fixture();
  for(const f of [a,b]){
   resolveEvent(f.s.object,'create')!(f.s,f.rt);Object.assign(f.s,{state,hurt,points:120,maxframes:3,imageIndex:3,imageSpeed:0,gotupcon:0});
   Object.assign(f.g,{myfight:3,faceaction:[6,0,0],mnfight:0});
  }
  resolveEvent(a.s.object,'step')!(a.s,a.rt);
  executeNeoSource(read('gml_Object_obj_heroparent_Step_0'),b.s,b.rt,{object:name=>({name,index:-1}),text:k=>k,call:(name)=>{if(name==='scr_monsterpop')return 1;if(['snd_play','snd_pitch','snd_stop'].includes(name))return 1;throw Error(name);}});
  const values=(s:typeof a.s)=>Object.fromEntries(['state','thissprite','index','siner','hurt','hurttimer','hurtindex','acttimer','attacktimer','attacked','itemed','finishattacktimer','spelltimer','maxframes','imageIndex','imageBlend','poisonamount','poisontimer','force'].map(k=>[k,s[k]]));
  expect(values(a.s)).toEqual(values(b.s));expect(a.g).toEqual(b.g);
 });
 for(const t of [0,1,8])it(`Rude Buster flight Step ${t} matches Chapter 4 source without encounter overrides`,()=>{
  const a=fixture(),b=fixture(),objects=new Map<string,GmObjectDef>();
  const object=(name:string)=>{if(!objects.has(name))objects.set(name,{name,index:objects.size+20});return objects.get(name)!;};
  const bolts=[a,b].map(f=>{const target=f.rt.create(object('obj_target'),450,170);target.myself=0;Object.assign(f.g,{monsterx:[450],monstery:[170]});const bolt=f.rt.create(rudeBusterBolt,100,150);Object.assign(bolt,{t,target:target.id,cx:450,cy:170});return bolt;});
  resolveEvent(rudeBusterBolt,'step')!(bolts[0],a.rt);
  executeNeoSource(read('gml_Object_obj_rudebuster_bolt_Step_0'),bolts[1],b.rt,{object,text:k=>k,call:(name,s,rt,args)=>{if(name==='scr_afterimage')return afterImage(s,rt).id;if(name==='angle_difference')return ((((args[0]-args[1])%360)+540)%360)-180;throw Error(name);}});
  const values=(s:typeof a.s)=>Object.fromEntries(['targetx','targety','cx','cy','direction','speed','friction','imageAngle','bolt_timer','chosen_bolt','lockdamage','imageAlpha','a','t','maxaft','explode'].map(k=>[k,s[k]]));
  expect(values(bolts[0])).toEqual(values(bolts[1]));expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());
 });
 for(const count of [0,4,14,15])for(const better of [0,1])it(`OKHeal cast count ${count}, better ${better} matches Chapter 4 source`,()=>{
  setSourceText(chapterText(4));const a=fixture(),b=fixture(),objects=new Map<string,GmObjectDef>();
  const object=(name:string)=>{if(!objects.has(name))objects.set(name,{name,index:objects.size+20});return objects.get(name)!;};
  for(const f of [a,b]){
   f.g.flag[1045]=count;f.g.flag[852]=better;
   for(const suffix of ['','sus','ral','noe'])for(const key of ['canact','actcost','actname','actdesc','actsimul'])f.g[key+suffix]=[Array(6).fill(0),Array(6).fill(0),Array(6).fill(0)];
  }
  const scripts=Object.fromEntries(['scr_heal','scr_revive','scr_heal_amount_modify_by_equipment'].map(n=>[n,read('gml_GlobalScript_'+n)]));
  executeNeoSource(read('gml_GlobalScript_scr_spell'),b.s,b.rt,{object,text:k=>k,scripts,call:(name,s,rt)=>{if(name==='scr_spellmenu_setup'||name==='snd_stop'||name==='snd_play')return 1;if(name==='scr_dmgwriter_selfchar')return rt.create(object('obj_dmgwriter'),s.x,s.y).id;throw Error(name);}},undefined,undefined,[11,0],'scr_spell');
  castSpell(a.s,a.rt,11,0);
  expect(a.s.healnum).toBe(b.s.healnum);expect(a.g.hp).toEqual(b.g.hp);expect(a.g.flag).toEqual(b.g.flag);expect(a.g.spelldelay).toBe(b.g.spelldelay);expect(a.s.tu).toBe(b.s.tu);
 });
 for(const spell of [4,5,11,201,202,260,261,262,263])for(const better of [0,1])it(`spelltext ${spell}, better ${better} matches Chapter 4 source`,()=>{
  const texts=chapterText(4);setSourceText(texts);const a=fixture(),b=fixture();
  for(const f of [a,b]){Object.assign(f.g,{charname:['','Kris','Susie','Ralsei','Noelle'],msg:['%%'],msgno:0});f.g.flag[852]=better;}
  spellText(a.s,a.rt,spell,0);
  executeNeoSource(read('gml_GlobalScript_scr_spelltext'),b.s,b.rt,{object:name=>({name,index:-1}),text:k=>texts[k],call:name=>{throw Error(name);}},undefined,undefined,[spell,0],'scr_spelltext');
  expect(a.g.msg).toEqual(b.g.msg);expect(a.g.msgno).toEqual(b.g.msgno);
 });
 for(const mirrored of [false,true])for(const hurt of [0,1])it(`hero Draw mirrored ${mirrored}, hurt ${hurt} matches Chapter 4 source`,()=>{
  const a=fixture(),b=fixture(),calls:unknown[][]=[[],[]];
  for(const [i,f] of [a,b].entries()){
   resolveEvent(f.s.object,'create')!(f.s,f.rt);f.g.encounterno=160;f.g.mnfight=0;Object.assign(f.s,{hurt,imageXscale:mirrored?-2:2,imageBlend:0x123456});
   f.rt.drawSprite=(...args)=>{calls[i].push(args);};
  }
  resolveEvent(a.s.object,'draw')!(a.s,a.rt);
  executeNeoSource(read('gml_Object_obj_heroparent_Draw_0'),b.s,b.rt,{object:name=>({name,index:-1}),text:k=>k,call:name=>{throw Error(name);}});
  expect(calls[0]).toEqual(calls[1]);expect(a.s.imageBlend).toBe(b.s.imageBlend);
 });
});
