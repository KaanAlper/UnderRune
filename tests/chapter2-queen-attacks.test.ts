import {describe,expect,it} from 'vitest';
import fs from 'node:fs';
import {GmRuntime,type GmObjectDef} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
import {startQueenAttack} from '../src/remake/bosses/queen/attacks';
import {setSourceText} from '../src/remake/host/text';
const queen:GmObjectDef={name:'obj_queen_enemy',index:1},plug:GmObjectDef={name:'obj_berdlyplug_enemy',index:2};
const controller:GmObjectDef={name:'obj_queen_bulletcontroller',index:3,events:{create:(s,rt)=>{s.type=1;s.a=rt.random.irandom(2);}}};
function setup(rr:number,difficulty:number){
 const rt=new GmRuntime(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]}),{seed:13});
 rt.globals={monsterattackname:[''],monsterat:[10],turntimer:0,typer:70,fc:1,battlemsg:['']};
 const s=rt.create(queen,470,120);Object.assign(s,{myself:0,mytarget:4,rr,difficulty,bufferattack:true,ultimateattackused:0,turns:0,shieldjustwentup:0,shieldjustwentdown:0,attacked:0,wineglasscon:0,drink:5});
 const p=rt.create(plug,512,36);p.alphacon=0;return {rt,s,p};
}
function text(){const map:Record<string,string>={};for(const n of [462,463,464,465,467,468]){const key=`obj_queen_enemy_slash_Step_0_gml_${n}_0`;map[key]=key;}setSourceText(map);}
describe('Queen attack dispatch',()=>{
 it('keeps controlled Berdly attacks distinct from shield/Queen attacks',()=>{
  text();const {rt,s,p}=setup(7,1),d=startQueenAttack(s,rt,controller,queen,plug)!;
  expect([d.type,d.target,d.damage,p.alphacon]).toEqual([113,4,50,0]);expect('bufferattack' in d).toBe(false);
  expect([s.dc,s.__dc]).toEqual([d.id,d.id]);
 });
 it('retains the source maximum turn timer rule when the stomp branch asks for 240 then 190',()=>{
  text();const {rt,s}=setup(3,3),d=startQueenAttack(s,rt,controller,queen,plug)!;expect(d.type).toBe(3.3);expect(rt.globals.turntimer).toBe(240);
 });
 it('lets the newly formed shield status override the lowered shield status',()=>{
  text();const {rt,s}=setup(2,2);s.shieldjustwentdown=1;const d=startQueenAttack(s,rt,controller,queen,plug)!;
  expect(d.type).toBe(2.2);expect([s.wineglasscon,s.drink,s.shieldjustwentdown,s.shieldjustwentup]).toEqual([1,0,0,0]);
  expect(rt.globals.battlemsg[0]).toContain('_468_0');
 });
});
const source='extracted/chapter2_windows/code/gml_Object_obj_queen_enemy_Step_0.gml';
describe.skipIf(!fs.existsSync(source))('Queen dispatch against installed source',()=>{
 it('matches every source branch, controller Create RNG, caller and status fields',()=>{
  text();const code=fs.readFileSync(source,'utf8');
  const start=code.indexOf('switch (rr)'),end=code.indexOf('attacked = 1;',start)+'attacked = 1;'.length;
  const body=code.slice(start,end);
  const original=new Function('state','env',`with(env){with(state){${body}}}`);
  for(let rr=0;rr<=11;rr++)for(let difficulty=0;difficulty<=5;difficulty++){
   const a=setup(rr,difficulty),b=setup(rr,difficulty),state=Object.fromEntries(Object.keys(b.s).filter(k=>!k.startsWith('$')).map(k=>[k,b.s[k]]));
   Object.assign(state,{x:b.s.x,y:b.s.y,dc:null});
   const env={global:b.rt.globals,obj_queen_enemy:state,obj_berdlyplug_enemy:b.p,obj_queen_bulletcontroller:controller,
    instance_exists:()=>true,scr_bulletspawner:(x:number,y:number)=>{const d=b.rt.create(controller,x,y);state.__dc=d.id;d.creator=state.myself;d.target=state.mytarget;d.damage=50;return d;},
    scr_turntimer:(n:number)=>{b.rt.globals.turntimer=Math.max(n,b.rt.globals.turntimer);},choose:(...args:number[])=>b.rt.random.choose(...args),stringsetloc:(_value:string,key:string)=>key};
   original(state,env);startQueenAttack(a.s,a.rt,controller,queen,plug);
   for(const key of ['rr','turns','attacked','shieldjustwentup','shieldjustwentdown'])expect(a.s[key],`${rr}/${difficulty} ${key}`).toBe(state[key]);
   expect(a.rt.globals).toEqual(b.rt.globals);expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());
   const ad=a.rt.all(controller),bd=b.rt.all(controller);expect(ad.length).toBe(bd.length);
   for(let i=0;i<ad.length;i++)for(const key of ['type','special','bufferattack','creator','target','damage','a']){
    expect(key in ad[i]).toBe(key in bd[i]);if(key in ad[i])expect(ad[i][key]).toBe(bd[i][key]);
   }
   expect(a.p.alphacon).toBe(b.p.alphacon);
  }
 });
});
