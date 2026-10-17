// Writes src/remake/host/chapter<N>-resources.json: every object's number, name, parent, sprite, mask, visibility and
// creation depth in that chapter. The depth is the one instance_create gives (the game's __global_object_depths
// table, as tools/build-neo-host-source.mjs reads it), not the object definition's own depth field, which is 0.
// Reads the local extraction only (extracted/chapter<N>_windows); the result holds no code or text.
// Usage: node tools/build-chapter-resources.mjs <chapter>
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const chapter=Number(process.argv[2]);
if(![2,3,4,5].includes(chapter))throw Error('Usage: node tools/build-chapter-resources.mjs <chapter 2-5>');
const base=path.join(root,'extracted',`chapter${chapter}_windows`);
const objects=JSON.parse(fs.readFileSync(path.join(base,'object-parents.json'),'utf8'));
const depthSource=fs.readFileSync(path.join(base,'code','gml_GlobalScript___global_object_depths.gml'),'utf8');
const depths=new Map([...depthSource.matchAll(/global\.__objectDepths\[(\d+)\]\s*=\s*(-?\d+);/g)].map(m=>[m[1],Number(m[2])]));
const byName=new Map([...depthSource.matchAll(/global\.__objectNames\[(\d+)\]\s*=\s*"([^"]+)";/g)].map(m=>[m[2],depths.get(m[1])]));
if(!byName.size)throw Error('No object depths found in __global_object_depths');
const out=objects.map(o=>({index:o.index,name:o.name,parent:o.parent,sprite:o.sprite,mask:o.mask,depth:byName.get(o.name)??0,visible:o.visible}));
fs.writeFileSync(path.join(root,'src','remake','host',`chapter${chapter}-resources.json`),JSON.stringify(out));
console.log(`${out.length} objects, ${out.filter(o=>o.depth!==0).length} with a creation depth`);
