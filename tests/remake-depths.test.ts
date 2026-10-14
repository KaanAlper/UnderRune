import {it,expect} from 'vitest';
import fs from 'node:fs';
import type {GmObjectDef} from '../src/remake/gm/runtime';

// DELTARUNE's instance_create gives every new instance its object's depth from the game's depth table
// (__global_object_depths). Every ported object must declare that depth, or anything that creates it without
// setting depth by hand draws in the wrong order (e.g. the box fill covering the soul).
// The table comes from the maintainer's local extraction; the test is skipped without it.
const table='extracted/chapter1_windows/code/gml_GlobalScript___global_object_depths.gml';
const modules=import.meta.glob(['../src/remake/deltarune/*.ts','../src/remake/bosses/*/*.ts','!../src/remake/bosses/spamton-neo/*.ts'],{eager:true}) as Record<string,Record<string,unknown>>;
const isDef=(v:unknown):v is GmObjectDef=>!!v&&typeof v==='object'&&typeof (v as GmObjectDef).name==='string'&&typeof (v as GmObjectDef).index==='number';

it.skipIf(!fs.existsSync(table))('every ported Chapter 1 object declares its source creation depth',()=>{
 const src=fs.readFileSync(table,'utf8'),names=new Map<number,string>(),depths=new Map<number,number>();
 for(const m of src.matchAll(/__objectNames\[(\d+)\] = "([^"]+)"/g))names.set(Number(m[1]),m[2]);
 for(const m of src.matchAll(/__objectDepths\[(\d+)\] = (-?\d+)/g))depths.set(Number(m[1]),Number(m[2]));
 const depthOf=new Map([...names].map(([slot,name])=>[name,depths.get(slot)!]));
 const defs=new Map<string,GmObjectDef>();
 for(const mod of Object.values(modules))for(const v of Object.values(mod)){
  if(isDef(v))defs.set(v.name,v);
  if(Array.isArray(v))for(const d of v)if(isDef(d))defs.set(d.name,d);
 }
 const wrong=[...defs.values()].filter(d=>depthOf.has(d.name)&&(d.depth??0)!==depthOf.get(d.name)).map(d=>`${d.name}: ${d.depth??0}, source ${depthOf.get(d.name)}`);
 expect(defs.size).toBeGreaterThan(40);
 expect(wrong).toEqual([]);
});
