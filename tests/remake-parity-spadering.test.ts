import {describe,it,expect} from 'vitest';
import fs from 'node:fs';
import {GmRuntime} from '../src/remake/gm/runtime';
import {collideBullet,growtangle,heart} from '../src/remake/deltarune/bullets';
import {spadeRing} from '../src/remake/bosses/jevil/spadering';

// Reference recorded locally from the original battle (npm run oracle -- ch1-25 --dumps=683); skipped without it.
type Line={f:number;rng:number[];o:[number,string,number,number,number,string,boolean][]};
const tracePath='.tools/oracle/ch1-25-s11.ndjson',dumpPath='.tools/oracle/ch1-25-s11-f683.json';
const ready=fs.existsSync(tracePath)&&fs.existsSync(dumpPath);

describe('parity: Jevil spade ring',()=>{
 it.skipIf(!ready)('matches the original frame by frame until the first spade reaches the soul',()=>{
  const trace=new Map<number,Line>(fs.readFileSync(tracePath,'utf8').trim().split('\n').map(l=>{const x=JSON.parse(l) as Line;return [x.f,x];}));
  const dump=JSON.parse(fs.readFileSync(dumpPath,'utf8')) as {instances:{instanceId:number;objectName:string;x:number;y:number;selfVariables:Record<string,unknown>}[]};
  const start=683,spawnFrame=trace.get(start+1)!;
  const bulletIds=spawnFrame.o.filter(o=>o[1]==='obj_collidebullet').map(o=>o[0]);
  const rt=new GmRuntime(()=>undefined,{rng:trace.get(start)!.rng,firstId:Math.min(...bulletIds)});
  const collide=collideBullet(()=>{}),ring=spadeRing(collide);
  for(const i of dump.instances){
   if(i.objectName==='obj_growtangle')rt.restore(growtangle,i.instanceId,i.x,i.y);
   if(i.objectName==='obj_heart')rt.restore(heart,i.instanceId,i.x,i.y);
   if(i.objectName==='obj_spadering')rt.restore(ring,i.instanceId,i.x,i.y,i.selfVariables);
  }
  let compared=0;
  for(let f=start+1;;f++){
   rt.step();
   const ref=trace.get(f)!.o.filter(o=>o[1]==='obj_collidebullet');
   if(ref.length<bulletIds.length)break; // a spade hit the soul: collisions come in the next step
   const ours=rt.instances.filter(i=>i.live&&i.object===collide);
   expect(ours.map(b=>b.id),`frame ${f} ids`).toEqual(ref.map(o=>o[0]));
   for(const [id,,x,y] of ref){
    const b=ours.find(o=>o.id===id)!;
    expect(Math.abs(b.x-x),`frame ${f} spade ${id} x ${b.x} vs ${x}`).toBeLessThan(0.01);
    expect(Math.abs(b.y-y),`frame ${f} spade ${id} y ${b.y} vs ${y}`).toBeLessThan(0.01);
   }
   compared++;
  }
  console.log(`spade ring: ${compared} frames identical`);
  expect(compared).toBeGreaterThan(10);
 });
});
