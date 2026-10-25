import {describe,expect,it} from 'vitest';
import {SceneMachine,SceneWork,ownedScene,type SceneAdapter} from '../src/game/scene-machine';

describe('scene lifecycle',()=>{
 it('exits before clearing cross-scene input and entering; same scene reentry is explicit',()=>{
  const events:string[]=[];
  const adapter=(name:string):SceneAdapter<string>=>({enter:()=>events.push('enter '+name),exit:()=>events.push('exit '+name),input:k=>events.push(name+' '+k),draw:()=>events.push('draw '+name)});
  const scenes=new SceneMachine<'room'|'menu',string>('room',{room:adapter('room'),menu:adapter('menu')},()=>events.push('reset'));
  scenes.start();scenes.transition('menu');scenes.input('confirm');scenes.draw();
  expect(events).toEqual(['enter room','exit room','reset','enter menu','menu confirm','draw menu']);
  scenes.transition('menu');expect(events.at(-1)).toBe('draw menu');
 });
 it('blocks input when busy or modal without preventing the active scene draw',()=>{
  let inputs=0,draws=0;
  const adapter:SceneAdapter<string>={enter(){},exit(){},input(){inputs++;},draw(){draws++;}};
  const scenes=new SceneMachine<'room'|'menu',string>('room',{room:adapter,menu:adapter});scenes.start();
  scenes.input('confirm',true);scenes.draw();expect(inputs).toBe(0);expect(draws).toBe(1);
 });
 it('does not dispatch a frame to the destination after an input transition',()=>{
  const events:string[]=[];
  const scenes=new SceneMachine<'room'|'menu',string>('room',{
   room:{enter(){},exit(){},input(){events.push('room');scenes.transition('menu');},draw(){}},
   menu:{enter(){},exit(){},input(){events.push('menu');},draw(){}},
  });scenes.input('confirm');expect(events).toEqual(['room']);expect(scenes.current).toBe('menu');
 });
});
describe('scene async ownership',()=>{
 it('aborts superseded work and prevents stale completion from clearing current work',()=>{
  const work=new SceneWork(),first=work.begin(),second=work.begin();
  expect(first.signal.aborted).toBe(true);expect(work.current(first)).toBe(false);expect(work.finish(first)).toBe(false);
  expect(work.current(second)).toBe(true);expect(work.pending).toBe(true);expect(work.finish(second)).toBe(true);expect(work.pending).toBe(false);
 });
 it('navigation invalidates pending work and captured route revisions even when no load is pending',()=>{
  const work=new SceneWork(),revision=work.revision,load=work.begin();work.cancel();
  expect(load.signal.aborted).toBe(true);expect(work.current(load)).toBe(false);expect(work.revision).not.toBe(revision);expect(work.pending).toBe(false);
 });
});

it('refreshes replacement resources in the current scene without disposing them',()=>{
 const events:string[]=[];const adapter:SceneAdapter<string>={enter:()=>events.push('enter'),exit:()=>events.push('dispose'),input(){},draw(){}};
 const scenes=new SceneMachine('battle',{battle:adapter},()=>events.push('reset'));scenes.start();scenes.transition('battle',true);
 expect(events).toEqual(['enter','reset','enter']);
});

it('an old scene cannot dispose a destination battle installed before transition',()=>{
 const disposed:string[]=[],oldBattle={id:'native'},nextBattle={id:'remake'};let current:typeof oldBattle|null=oldBattle;
 const adapter=ownedScene(()=>current,{enter(){},exit(){disposed.push(current!.id);current=null;},input(_key:string){},draw(){}});
 const scenes=new SceneMachine<'native'|'remake',string>('native',{native:adapter,remake:{enter(){},exit(){},input(){},draw(){}}});
 scenes.start();current=nextBattle;scenes.transition('remake');expect(current).toBe(nextBattle);expect(disposed).toEqual([]);
});
it('an owning battle scene disposes its own resource on normal navigation',()=>{
 let current:{id:string}|null={id:'remake'};
 const adapter=ownedScene(()=>current,{enter(){},exit(){current=null;},input(_key:string){},draw(){}});
 const scenes=new SceneMachine<'remake'|'menu',string>('remake',{remake:adapter,menu:{enter(){},exit(){},input(){},draw(){}}});
 scenes.start();scenes.transition('menu');expect(current).toBe(null);
});
