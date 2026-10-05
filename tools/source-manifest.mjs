import {readFile,readdir} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
export function inspectPackage(bytes){
 const b=Buffer.from(bytes);
 if(b.length<8)throw Error('truncated FORM header');
 if(b.toString('ascii',0,4)!=='FORM')throw Error('Expected FORM');
 if(b.readUInt32LE(4)+8!==b.length)throw Error('truncated FORM content');
 const chunks=[];let pos=8;
 while(pos<b.length){
  if(pos+8>b.length)throw Error('truncated chunk header');
  const length=b.readUInt32LE(pos+4);
  if(pos+8+length>b.length)throw Error('chunk outside package');
  chunks.push(b.toString('ascii',pos,pos+4));pos+=8+length;
 }
 return {chunks};
}
export async function buildSourceManifest(root){
 const dirs=(await readdir(root,{withFileTypes:true})).filter(d=>d.isDirectory()&&/^chapter\d+_windows$/.test(d.name));
 const records=[];
 for(const dir of dirs.sort((a,b)=>a.name.localeCompare(b.name))){
  const relativePath=dir.name+'/data.win';const b=await readFile(path.join(root,relativePath));
  records.push({id:dir.name,relativePath,sha256:createHash('sha256').update(b).digest('hex'),bytes:b.length,...inspectPackage(b)});
 }
 return records;
}
