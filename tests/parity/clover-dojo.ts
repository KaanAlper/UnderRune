/** Native snapshots keep ds handles but omit list storage. Clover's pre-Topic snapshot owns these original lists. */
import type {GmRuntime} from '../../src/remake/gm/runtime';
import {chapterText} from './chapter2-runner';
import fs from 'node:fs';
import type {Dump} from './reference';
/** Native layer enumeration (optional --layer-probe) confirms these two persistent WORLD actors share the dynamic
 * depth-zero layer with battle-created sprites. Their Draw slots affect in-place insertions such as spare stars.
 * The four legacy compatibility-layer WORLD actors at depth zero belong to a separate layer and must stay absent.
 * Keep only the skipped actors' scheduling slots here; their world events remain outside the battle fixture. */
export function restoreCloverDrawSlots(rt:GmRuntime,run:string,start=40){
 const dump=JSON.parse(fs.readFileSync(`${run}-f${start}.json`,'utf8')) as {instances:(Dump['instances'][number]&{objectIndex:number})[]};
 for(const d of dump.instances.filter(i=>['obj_event_manager','obj_event_manager_debug'].includes(i.objectName))){
  const slot=rt.restore({name:d.objectName,index:d.objectIndex,events:{}},d.instanceId,d.x,d.y,{});slot.depth=d.depth;slot.visible=d.visible;
 }
}
export function restoreCloverTopicLists(rt:GmRuntime){
 const text=chapterText(2);
 for(const s of rt.instances.filter(i=>i.object.name==='obj_clubsenemy')){
  if(s.topic_count!==0)throw Error('Clover list restoration requires a snapshot before the first Topic');
  for(const [id,start,end] of [[s.likes_list,69,82],[s.dislikes_list,91,107]]){
   for(let n=0;n<=id;n++){try{rt.ds('list',n);}catch{rt.dsCreate('list');}}
   const list=rt.ds('list',id);for(let n=start;n<=end;n++)list.push(text[`obj_clubsenemy_slash_Create_0_gml_${n}_0`]);
  }
 }
}
