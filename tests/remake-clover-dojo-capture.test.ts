import fs from 'node:fs';
import {it,expect} from 'vitest';
import {runChapter2Recording} from './parity/chapter2-runner';
import {restoreCloverTopicLists} from './parity/clover-dojo';
import {installChapter2BossHost} from '../src/remake/host/chapter2-bosses';
import type {GmRuntime} from '../src/remake/gm/runtime';
import {KEY} from '../src/remake/deltarune/keys';
it.skipIf(process.env.CAPTURE_CLOVER!=='1')('generates a legal native Topic-to-spare input sequence from its initial snapshot',()=>{
 let rt:GmRuntime|undefined;
 runChapter2Recording('.tools/oracle/ch2-71-s11-god',r=>installChapter2BossHost(r,{room:'room_battletest'}),{},2,r=>{rt=r;restoreCloverTopicLists(r);},{end:40});
 const r=rt!,inputs:Record<number,{keysPressed:number[];keysReleased:number[]}>=JSON.parse(fs.readFileSync('.tools/oracle/ch2-71-s11-god.inputs.json','utf8'));
 for(const key of Object.keys(inputs))if(Number(key)>=40)delete inputs[Number(key)];
 let previous:number|undefined,last=0;
 for(let f=40;f<14000&&!r.pendingRoom;f++){
  r.draw();const g=r.globals,s=r.instances.find(i=>i.live&&i.object.name==='obj_clubsenemy'),choice=r.instances.find(i=>i.live&&i.object.name==='obj_choicer_neo');let key:number|undefined;
  if(s&&choice&&choice.canchoose===1){if(f%4===0)key=[KEY.left,KEY.right,KEY.up][s.right_answer];else if(f%4===1)key=KEY.z;}
  else if(g.myfight===0&&f%2===0){const t=g.charturn;if(g.bmenuno===0){const target=t===0?(g.mercymod[0]>=100?3:1):4;key=g.bmenucoord[0][t]===target?KEY.z:KEY.right;}else if([11,6,7].includes(g.bmenuno))key=KEY.z;else if(g.bmenuno===9)key=g.bmenucoord[9][t]===1?KEY.z:KEY.right;}
  if(key===undefined&&f%8===0)key=KEY.z;
  const release=previous===undefined?[]:[previous],press=key===undefined?[]:[key];
  for(const k of release){r.input.held.delete(k);r.input.released.add(k);}for(const k of press){r.input.pressed.add(k);r.input.held.add(k);}if(press.length||release.length)inputs[f]={keysPressed:press,keysReleased:release};previous=key;
  g.time=(g.time??0)+1;r.step();last=f;
 }
 fs.writeFileSync('.tools/oracle/clover-topic-inputs.json',JSON.stringify(inputs));console.log('Clover input sequence',last,r.pendingRoom);expect(r.pendingRoom).toBe('battle_end');
},120000);
