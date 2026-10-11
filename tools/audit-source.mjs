import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const game=process.env.DELTARUNE_DIR??'C:/Program Files (x86)/Steam/steamapps/common/DELTARUNE';
const sources=JSON.parse((await fs.readFile(path.join(root,'extracted/source-manifest.json'),'utf8')).replace(/^\uFEFF/,''));
let count=0;const issues=[];
for(const source of sources){
 const base=path.join(root,'extracted',source.id),index=JSON.parse(await fs.readFile(path.join(base,'index.json'),'utf8'));
 const manifest=JSON.parse(await fs.readFile(path.join(base,'full-code-manifest.json'),'utf8'));
 const digest=createHash('sha256').update(await fs.readFile(path.join(game,source.relativePath))).digest('hex');
 if(digest!==source.sha256)issues.push(source.id+': installed package changed');
 const expected=new Set(index.code),seen=new Set();
 for(const record of manifest.records){
  if(record.status!=='decoded'||!expected.has(record.name)||seen.has(record.name)){issues.push(source.id+': invalid record '+record.name);continue;}
  seen.add(record.name);
  const bytes=await fs.readFile(path.join(base,'code',record.name+'.gml'));
  if(createHash('sha256').update(bytes).digest('hex')!==record.sha256)issues.push(source.id+': decoded file changed '+record.name);
 }
 if(expected.size!==seen.size||manifest.failed!==0)issues.push(source.id+': incomplete decode');
 count+=seen.size;console.log(`${source.id}: ${seen.size}/${expected.size} code records; source package ${digest===source.sha256?'unchanged':'CHANGED'}`);
}
console.log(`Total ${count}; integrity failures ${issues.length}. Decode integrity does not establish browser gameplay parity.`);
if(issues.length){console.error(issues.join('\n'));process.exitCode=1;}
