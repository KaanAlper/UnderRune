import fs from 'node:fs';
import {describe,it,expect} from 'vitest';
import {GmInstance,GmRuntime,type GmObjectDef} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
import {installChapter3BossHost} from '../src/remake/host/chapter3-bosses';
import {damageMaxHp} from '../src/remake/deltarune/damage-maxhp';
import {executeNeoSource,type NeoSourceHost} from '../src/remake/bosses/spamton-neo/body-source';
import {damageCalculation,elementReduction,gameOver} from '../src/remake/deltarune/battle';
function fixture(seed=0){
 const rt=new GmRuntime(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]}),{seed});const {objects}=installChapter3BossHost(rt,{room:'room_battletest'});
 const heroes=['obj_herokris','obj_herosusie','obj_heroralsei'].map((n,i)=>rt.restore(objects[n],100100+i,50+i*30,200,{myheight:40}));
 rt.globals={chapter:3,inv:-1,invc:1,char:[1,2,3,1],hp:[0,120,140,100],maxhp:[0,120,140,100],battledf:[99,0,0],
  charaction:[0,0,0],charinstance:heroes.map(h=>h.id),charmove:[1,1,1],charcantarget:[1,1,1],chardead:[0,0,0],charspecial:[0,0,0],targeted:[0,0,0]};
 const s=rt.create({name:'source',index:9999},0,0);s.target=0;return {rt,s,objects};
}
it('uses maximum HP, ignores defense and leaves source working fields and feedback',()=>{
 const {rt,s}=fixture();damageMaxHp(s,rt,.66,false,true);
 expect([rt.globals.hp[1],s.tdamage,s.hpdiff,s.chartarget,s.doomtype,s.gameover,rt.globals.inv]).toEqual([40,80,80,1,-1,0,30]);expect(rt.globals.damage_cache).toEqual([120,140,100]);expect(rt.byId(s.dmgwriter)?.damage).toBe(80);
});

const sourceRoot='extracted/chapter3_windows/code/',original=sourceRoot+'gml_GlobalScript_scr_damage_maxhp.gml';
function referenceFixture(seed:number,knight=true){
 const base=GmInstance.layerEntries,f=fixture(seed),g=f.rt.globals;
 g.chararmor1=[0,0,0,0];g.chararmor2=[0,0,0,0];g.faceaction=[0,0,0];
 for(let i=0;i<3;i++)f.rt.byId(g.charinstance[i])!.myself=i;
 const k=knight?f.rt.restore(f.objects.obj_knight_enemy,100500,460,100,{aoedamage:0,myattackchoice:2,damagecounter:0}):undefined;
 f.rt.restore(f.objects.obj_heart,100501,280,170);
 // Existing delayed damage labels must be cancelled when the next hit lands.
 f.rt.restore(f.objects.obj_dmgwriter,100502,50,200,{delaytimer:2,killactive:0,type:0,killtimer:0});
 return {...f,k,base,layerEnd:GmInstance.layerEntries};
}
function referenceHost(f:ReturnType<typeof referenceFixture>):NeoSourceHost{
 const object=(name:string)=>{const d=f.objects[name];if(!d)throw Error(`Missing damage reference object ${name}`);return d;};
 const byIndex=new Map(Object.values(f.objects).map(d=>[d.index,d]));
 const read=(name:string)=>fs.readFileSync(sourceRoot+`gml_GlobalScript_${name}.gml`,'utf8');
 // Object constants in assignments are numeric in the native VM. The adapter keeps definitions as objects;
 // supplying their indices here preserves scr_battle_sprite_set's stored caller variables and with target.
 const sprites=read('scr_battle_sprite_set').replace(/_charinstance = (obj_\w+);/g,(_all,name)=>`_charinstance = ${object(name).index};`);
 return {object,objectIndex:index=>byIndex.get(index),text:key=>key,scripts:{
  scr_damage_cache:read('scr_damage_cache'),scr_damage_check:read('scr_damage_cache'),scr_randomtarget_old:read('scr_randomtarget_old'),scr_party_hpaverage:read('scr_party_hpaverage'),scr_dead:read('scr_dead'),scr_battle_sprite_set:sprites,
 },call:(name,s,rt,a)=>{
  if(name==='variable_instance_exists')return a[1] in (rt.byId(Number(a[0]))??{});
  if(name==='variable_global_exists')return a[0] in rt.globals;
  if(name==='array_length')return a[0].length;
  if(name==='scr_damage_calculation')return damageCalculation(rt,a[0],a[1]);
  if(name==='scr_element_damage_reduction')return elementReduction(rt,a[0],a[1]);
  if(name==='scr_gameover')return gameOver(rt);
  throw Error(`Missing maximum-HP reference helper ${name}`);
 }};
}
function fullState(f:ReturnType<typeof referenceFixture>){return f.rt.instances.map(s=>Object.fromEntries(Object.entries(s).filter(([,v])=>typeof v!=='function').map(([k,v])=>[k,k==='object'?(v as GmObjectDef).name:k==='layerEntry'?v-f.base:v])));}

describe.skipIf(!fs.existsSync(original))('Maximum-HP damage compared with installed original script',()=>{
 type Scenario={name:string;knight?:boolean;ratio?:number;bypass?:boolean;nonlethal?:boolean;setup?:(f:ReturnType<typeof referenceFixture>)=>void};
 const cases:Scenario[]=[
  {name:'ordinary ratio',knight:false},
  {name:'defending',knight:false,setup:f=>{f.rt.globals.charaction[0]=10;}},
  {name:'defend bypass',knight:false,bypass:true,setup:f=>{f.rt.globals.charaction[0]=10;}},
  {name:'nonlethal at two HP',knight:false,nonlethal:true,setup:f=>{f.rt.globals.hp[1]=2;f.rt.globals.charaction[0]=10;}},
  {name:'invincible',setup:f=>{f.rt.globals.inv=0;}},
  {name:'target four chooses and restores',knight:false,setup:f=>{f.s.target=4;f.rt.globals.hp[1]=10;}},
  {name:'downed target retargets',knight:false,setup:f=>{f.rt.globals.hp[1]=-60;f.rt.globals.charcantarget[0]=0;}},
  {name:'Knight avoids Kris'},
  {name:'mantle first counter',setup:f=>{f.rt.globals.chararmor1[2]=23;}},
  {name:'mantle second counter',setup:f=>{f.rt.globals.chararmor1[3]=23;f.k!.damagecounter=1;}},
  {name:'mantle third counter',setup:f=>{f.rt.globals.chararmor1[1]=23;f.k!.damagecounter=2;}},
  {name:'mantle armor two third counter',setup:f=>{f.rt.globals.chararmor2[2]=23;f.k!.damagecounter=2;}},
  {name:'multiple mantles last standing slot wins',setup:f=>{f.rt.globals.chararmor1=[0,23,23,23];}},
  {name:'attack thirteen skips mantle redirect',setup:f=>{f.rt.globals.chararmor2[2]=23;f.k!.myattackchoice=13;}},
  {name:'AOE Knight skips redirect and ratio cut',setup:f=>{f.rt.globals.chararmor1[1]=23;f.k!.aoedamage=1;}},
  {name:'Kris knockout',ratio:1.5,setup:f=>{f.rt.globals.hp[2]=-999;f.rt.globals.hp[3]=-999;}},
  {name:'companion knockout',ratio:1.5,setup:f=>{f.s.target=1;}},
  {name:'ordinary knockout',knight:false,ratio:1.5},
 ];
 for(const scenario of cases)for(const seed of [0,11,9182])it(`${scenario.name}, seed ${seed}: full state and RNG`,()=>{
  const a=referenceFixture(seed,scenario.knight!==false),b=referenceFixture(seed,scenario.knight!==false);
  scenario.setup?.(a);scenario.setup?.(b);
  const ratio=scenario.ratio??.66,bypass=scenario.bypass??false,nonlethal=scenario.nonlethal??false;
  GmInstance.layerEntries=a.layerEnd;damageMaxHp(a.s,a.rt,ratio,bypass,nonlethal);
  // The adapter does not parse default argument syntax; every argument is supplied explicitly below.
  // Native GML compares false with numeric zero; the adapter's mixed boolean/number equality is strict JS.
  const source=fs.readFileSync(original,'utf8').replace('arg0 = 1, arg1 = false, arg2 = false','arg0, arg1, arg2').replace('aoedamage == false','aoedamage == 0');
  GmInstance.layerEntries=b.layerEnd;executeNeoSource(source,b.s,b.rt,referenceHost(b),undefined,undefined,[ratio,bypass,nonlethal],'scr_damage_maxhp');
  expect(fullState(a)).toEqual(fullState(b));expect(a.rt.globals).toEqual(b.rt.globals);expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());expect(a.rt.nextId).toBe(b.rt.nextId);
 });
});
it('defending reduces ratio damage unless bypassed; nonlethal clamps to the remaining HP',()=>{
 const a=fixture();a.rt.globals.charaction[0]=10;damageMaxHp(a.s,a.rt,.66);expect(a.rt.globals.hp[1]).toBe(66);
 const b=fixture();b.rt.globals.hp[1]=2;b.rt.globals.charaction[0]=10;damageMaxHp(b.s,b.rt,.66,true,true);expect(b.rt.globals.hp[1]).toBe(1);expect(b.s.tdamage).toBe(1);
});
it('invincibility exits before caching or allocating feedback',()=>{
 const {rt,s}=fixture();rt.globals.inv=0;const n=rt.instances.length;damageMaxHp(s,rt);expect(rt.instances.length).toBe(n);expect('damage_cache' in rt.globals).toBe(false);expect('tdamage' in s).toBe(false);
});
it('temporarily selects target four and restores it after applying damage',()=>{
 const {rt,s}=fixture();s.target=4;rt.globals.charcantarget=[0,1,0];damageMaxHp(s,rt,.5);expect([s.target,s.mytarget,rt.globals.hp[2]]).toEqual([4,1,70]);
});
it('uses the encounter targeting hook and halves a mantle ratio before rounding',()=>{
 const {rt,s,objects}=fixture(),g=rt.globals;g.chararmor1=[0,0,23,0];g.chararmor2=[0,0,0,0];
 const k=rt.restore(objects.obj_knight_enemy,100500,460,100,{aoedamage:0,myattackchoice:2,damagecounter:0});
 damageMaxHp(s,rt,.66);expect([s.target,s.tdamage,g.hp[2],k.damagecounter]).toEqual([1,47,93,1]);
});
it('keeps Kris at one HP and switches to the fallen sprite on a lethal maximum-HP hit',()=>{
 const {rt,s,objects}=fixture(),g=rt.globals;g.chararmor1=[0,0,0,0];g.chararmor2=[0,0,0,0];g.hp[2]=-999;g.hp[3]=-999;g.faceaction=[1,1,1];
 rt.restore(objects.obj_knight_enemy,100500,460,100,{aoedamage:0,myattackchoice:2,damagecounter:0});
 const h=rt.byId(g.charinstance[0])!;h.myself=0;damageMaxHp(s,rt,1.5);
 expect([g.hp[1],s.hpdiff,s.doomtype,s.gameover,h.state,h.sprite,h.imageSpeed,g.faceaction[0]]).toEqual([1,0,4,0,8,'spr_kris_fallen_dark',.25,0]);
});
it('drops a companion to minus999 and preserves source damage-number arithmetic',()=>{
 const {rt,s,objects}=fixture(),g=rt.globals;g.chararmor1=[0,0,0,0];g.chararmor2=[0,0,0,0];
 rt.restore(objects.obj_knight_enemy,100500,460,100,{aoedamage:0,myattackchoice:2,damagecounter:0});s.target=1;damageMaxHp(s,rt,1.5);
 expect([g.hp[2],s.hpdiff,s.doomtype,g.chardead[1],g.charcantarget[1]]).toEqual([-999,929,12,1,0]);
});
