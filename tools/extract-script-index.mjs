// Writes the function names of a chapter's data.win in their reference order (its FUNC chunk) to
// extracted/chapterN_windows/functions.json, for the parity tests: the reference runtime keeps a script in a variable
// (as scr_script_delayed does) as this number, the remake as its name. Reads the local game install only.
// Usage: node tools/extract-script-index.mjs [chapter]
import fs from 'node:fs/promises';
import path from 'node:path';

const chapter=Number(process.argv[2]??1);
if(!Number.isInteger(chapter)||chapter<1||chapter>5)throw Error('Usage: node tools/extract-script-index.mjs [chapter]');
const root=path.resolve(import.meta.dirname,'..');
const gameRoot=process.env.DELTARUNE_DIR??'C:/Program Files (x86)/Steam/steamapps/common/DELTARUNE';
const data=await fs.readFile(path.join(gameRoot,`chapter${chapter}_windows`,'data.win'));
if(data.toString('latin1',0,4)!=='FORM')throw Error('Not a GameMaker data file');
// Chunks: a four-letter name, a 32-bit length, the body.
let at=8,func;
while(at<data.length){const name=data.toString('latin1',at,at+4),length=data.readUInt32LE(at+4);if(name==='FUNC'){func=at+8;break;}at+=8+length;}
if(func===undefined)throw Error('No FUNC chunk');
// FUNC: a count, then 12-byte entries (a pointer to the name, the number of uses, the first use). A name pointer
// points at the string's characters, right after its 32-bit length. Scripts are named gml_Script_<name>.
const count=data.readUInt32LE(func),names=[];
for(let i=0;i<count;i++){
 const name=data.readUInt32LE(func+4+i*12),length=data.readUInt32LE(name-4);
 names.push(data.toString('utf8',name,name+length).replace(/^gml_Script_/,''));
}
const out=path.join(root,'extracted',`chapter${chapter}_windows`,'functions.json');
await fs.writeFile(out,JSON.stringify(names));
console.log(`chapter ${chapter}: ${names.length} functions -> ${path.relative(root,out)}`);
