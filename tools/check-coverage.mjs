import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const catalog=JSON.parse(await fs.readFile(path.join(root,'src/bosses/catalog.json'),'utf8'));
const manifest=JSON.parse(await fs.readFile(path.join(root,'public/generated/manifest.json'),'utf8'));
const missing=[];
for(const record of catalog){
 for(const enemy of record.enemies){
  const sprite=manifest.sprites[record.chapter+':'+enemy.sprite];
  if(!sprite?.frames?.length)missing.push(record.id+': '+enemy.sprite);
 }
 for(const source of record.sources){
  if(!manifest.sourcePackages.some(p=>p.id===source.packageId&&p.sha256===source.sha256))missing.push(record.id+': source hash mismatch');
 }
}
for(const sprite of Object.values(manifest.sprites))for(const frame of sprite.frames){try{await fs.access(path.join(root,'public',frame.url));}catch{missing.push(frame.url);}}
try{await fs.access(path.join(root,'public',manifest.font.url));}catch{missing.push('font');}
console.log(`${catalog.length} encounter records; ${Object.keys(manifest.sprites).length} sprite animations; ${manifest.music.length} tracks`);
console.log(`Assets and source hash failures: ${missing.length}`);
console.log('Full original-game fidelity verified: 0 encounters. Registry/attack playability is checked by npm test.');
console.log('Includes Shadow Mantle and Susiezilla action adaptations. Room reachability and Chapter 5 source-only records remain unaudited.');
if(missing.length)console.error(missing.join('\n'));
if(missing.length||process.argv.includes('--strict'))process.exitCode=1;
