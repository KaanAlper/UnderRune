// Records original Chapter2 yellow soul events and their resource metadata. No game file is modified.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const base=path.resolve('extracted/chapter2_windows'),out=path.resolve('src/remake/bosses/spamton-neo/player-source.ts');
const metadata=JSON.parse(await fs.readFile(path.join(base,'object-parents.json'),'utf8'));
const files=await fs.readdir(path.join(base,'code')),records=[];
for(const name of ['obj_heart','obj_grazebox','obj_yheart_sneo_particle','obj_supercharge_end']){
 const meta=metadata.find(o=>o.name===name);if(!meta)throw Error(`Missing source metadata ${name}`);
 const sources={},sha256={};for(const file of files.filter(f=>f.startsWith(`gml_Object_${name}_`))){
  const key=file.slice(`gml_Object_${name}_`.length,-4),text=await fs.readFile(path.join(base,'code',file),'utf8');
  sources[key]=text;sha256[key]=createHash('sha256').update(text).digest('hex');
 }
 records.push({metadata:meta,sources,sha256});
}
await fs.writeFile(out,'// Generated from the installed Chapter2 source by tools/build-neo-player-source.mjs.\n'+
 'import type {NeoSourceMetadata} from \'./body-source\';\n'+
 'export const neoPlayerSources:readonly {metadata:NeoSourceMetadata;sources:Record<string,string>;sha256:Record<string,string>}[]='+JSON.stringify(records,null,2)+';\n');
console.log(`${records.length} source objects, ${records.reduce((n,r)=>n+Object.keys(r.sources).length,0)} original events`);
