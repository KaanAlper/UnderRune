import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=async file=>JSON.parse((await fs.readFile(path.join(root,file),'utf8')).replace(/^\uFEFF/,''));
const original=await read('extracted/chapter1_windows/full-code-manifest.json');
const probe=await read('.tools/source-probe/export-room/full-code-manifest.json');
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const verify=async(folder,manifest)=>{
 if(manifest.failed!==0||manifest.pattern!=='.')throw Error('A complete, successful decompilation is required.');
 for(const record of manifest.records){
  if(record.status!=='decoded')throw Error('Undecoded source: '+record.name);
  const filename=record.name.replace(/[<>:"/\\|?*]/g,'_')+'.gml';
  if(sha(await fs.readFile(path.join(root,folder,'code',filename)))!==record.sha256)throw Error('Source manifest mismatch: '+record.name);
 }
};
await verify('extracted/chapter1_windows',original);
await verify('.tools/source-probe/export-room',probe);
const before=new Map(original.records.map(record=>[record.name,record.sha256]));
const after=new Map(probe.records.map(record=>[record.name,record.sha256]));
const changed=[...before.keys()].filter(name=>after.has(name)&&before.get(name)!==after.get(name));
const removed=[...before.keys()].filter(name=>!after.has(name));
const added=[...after.keys()].filter(name=>!before.has(name));
if(changed.length!==1||changed[0]!=='gml_Object_obj_initializer2_Step_0'||removed.length||added.length)throw Error('Probe changes exceed the launcher-only allowance.');
const report={status:'launcher-only-source-change-verified',changed,removed,added,unchanged:before.size-changed.length,sourceScripts:before.size,probeSha256:sha(await fs.readFile(path.join(root,'.tools/source-probe/ch1-jevil-room.win'))),fullGameplayParityVerified:false};
await fs.writeFile(path.join(root,'extracted/bytecode-probe-audit.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
