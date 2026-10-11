import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {transformWithOxc} from 'vite';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=await fs.readFile(path.join(root,'src/source-runtime/gml.ts'),'utf8');
const compiled=(await transformWithOxc(source,'gml.ts')).code;
const {parseGml}=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
const chapters=[];
for(let chapter=1;chapter<=5;chapter++){
 const folder=path.join(root,'extracted',`chapter${chapter}_windows`,'code');
 const names=(await fs.readdir(folder)).filter(name=>name.endsWith('.gml'));
 const failures=[],reasons=new Map();let parsed=0;
 for(const name of names){
  try{parseGml(await fs.readFile(path.join(folder,name),'utf8'));parsed++;}
  catch(error){const message=error.message;failures.push({name,message});const reason=message.replace(/ at \d+.*/, '').replace(/, got .*/, '').replace(/: .*/, '');reasons.set(reason,(reasons.get(reason)??0)+1);}
 }
 const record={chapter,total:names.length,parsed,unsupported:failures.length,reasons:Object.fromEntries([...reasons].sort((a,b)=>b[1]-a[1])),failures};chapters.push(record);
 console.log(`Chapter ${chapter}: ${parsed}/${names.length} parse; ${failures.length} require additional language support.`);
}
const report={description:'Syntax coverage only. Parsing does not prove execution, runtime API support or original battle equivalence.',chapters};
await fs.writeFile(path.join(root,'extracted','gml-language-audit.json'),JSON.stringify(report,null,2));
console.log('Detailed audit: extracted/gml-language-audit.json');
