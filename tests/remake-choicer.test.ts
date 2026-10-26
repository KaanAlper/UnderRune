import fs from 'node:fs';
import {describe,it,expect} from 'vitest';
import {GmRuntime,resolveEvent,type GmEvent} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
import {choicerNeo} from '../src/remake/deltarune/choicer';
import {KEY} from '../src/remake/deltarune/keys';
import {createChapterRegistry} from '../src/remake/host/chapter2';
import metadata2 from '../src/remake/host/chapter2-resources.json';
import metadata3 from '../src/remake/host/chapter3-resources.json';
import {executeNeoSource} from '../src/remake/bosses/spamton-neo/body-source';

function fixture(chapter=2,total=1){
 const rt=new GmRuntime(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]}));rt.view.x=20;rt.view.y=30;
 rt.globals={chapter,darkzone:1,fighting:1,fc:7,flag:Array(100).fill(0),lang:'en',choicemsg:['left','right','upper','lower']};
 const drawn:unknown[][]=[];rt.gfx={sprite:(...args)=>{drawn.push(['sprite',...args]);},rect:()=>{},circle:()=>{},text:(x,y,t,style)=>{drawn.push(['text',x,y,t,{...style}]);},textWidth:(_font,t)=>Math.max(...t.split('\n').map(s=>s.length))*16};
 const registry=createChapterRegistry(rt,{chapter,metadata:chapter===2?metadata2:metadata3,room:'room_battletest'});registry.finalize();
 rt.restore(registry.object('obj_battlecontroller'),99990,0,0);
 const c=rt.create(choicerNeo,0,0);c.choicetotal=total;
 const host={...registry.host,call:(name:string,s:typeof c,r:GmRuntime,args:any[])=>name==='string_width'?r.stringWidth(String(args[0])):registry.host.call(name,s,r,args)};
 return {rt,c,...registry,host,drawn};
}
function run(f:ReturnType<typeof fixture>,event:GmEvent){resolveEvent(f.c.object,event)!(f.c,f.rt);}
function state(s:ReturnType<typeof fixture>['c']){return Object.fromEntries(Object.entries(s).filter(([k,v])=>k!=='layerEntry'&&k!=='object'&&typeof v!=='function'));}

describe('shared battle choices',()=>{
 it('uses the Chapter 3 remote controls and keeps the Draw loop local',()=>{
  const f=fixture(3,3);f.c.controlled=false;f.c.remoter=1;run(f,'alarm1');run(f,'step');
  expect(f.c.mychoice).toBe(1);f.c.remote1=1;run(f,'step');expect(f.rt.globals.choice).toBe(1);
  run(f,'draw');expect('i' in f.c).toBe(false);expect(f.c.heartSprite).toBe('spr_heartsmall');expect(f.c.boardwriter).toBe(0);
 });
 it.each([2,3])('uses Chapter %i metadata and the shared object alias',chapter=>{
  const f=fixture(chapter);expect(f.c.object.index).toBe(f.object('obj_choicer_neo').index);expect(f.rt.first(f.object('obj_choicer_neo'))).toBe(f.c);
 });
 it('requires a direction before confirming and delays writer cleanup by an alarm',()=>{
  const f=fixture(),w=f.rt.restore(f.object('obj_writer'),100500,0,0);run(f,'alarm1');
  f.rt.input.pressed.add(KEY.z);run(f,'step');expect(f.rt.globals.choice).toBe(-1);
  f.rt.input.pressed.clear();f.rt.input.held.add(KEY.right);run(f,'step');f.rt.input.held.clear();f.rt.input.pressed.add(KEY.z);run(f,'step');
  expect([f.rt.globals.choice,f.c.alarm[0],w.live,f.c.live]).toEqual([1,1,true,true]);run(f,'alarm0');expect([w.live,f.c.live]).toEqual([false,false]);
 });
 it.each([[1,KEY.up,-1],[1,KEY.down,-1],[2,KEY.up,2],[2,KEY.down,-1],[3,KEY.down,3]])('only offers its configured directions: %i, %i', (total,key,answer)=>{
  const f=fixture(2,total);run(f,'alarm1');f.rt.input.held.add(key);run(f,'step');expect(f.c.mychoice).toBe(answer);
 });
});

const root='extracted/chapter2_windows/code/';
describe.skipIf(!fs.existsSync(root+'gml_Object_obj_choicer_neo_Step_0.gml'))('choices against local original events',()=>{
 for(const [event,suffix] of [['create','Create_0'],['step','Step_0'],['draw','Draw_0'],['alarm1','Alarm_1'],['user0','Other_10'],['alarm0','Alarm_0']] as const){
  for(const total of [1,2,3])it(`${event}, ${total+1} answers: all fields and choice side effects`,()=>{
   const a=fixture(2,total),b=fixture(2,total);
   for(const f of [a,b]){f.c.canchoose=1;f.c.mychoice=total;run(f,'step');}
   // The unused overworld branch declares this engine enum; battle Create never evaluates it.
   const source=fs.readFileSync(root+`gml_Object_obj_choicer_neo_${suffix}.gml`,'utf8').replace(/\nenum e__VW[\s\S]*$/,'');
   run(a,event);executeNeoSource(source,b.c,b.rt,b.host,undefined,event);
   expect(state(a.c)).toEqual(state(b.c));expect(a.rt.globals).toEqual(b.rt.globals);expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());expect(a.drawn).toEqual(b.drawn);expect(a.rt.drawState).toEqual(b.rt.drawState);
  });
 }
});
