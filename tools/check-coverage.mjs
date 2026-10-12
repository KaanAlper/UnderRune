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
console.log('Catalog coverage is asset/source inventory, not battle playability. Available battles are declared in src/remake/host/encounters.ts.');
console.log('Full encounter parity is not established by this asset audit. Source components are checked by the remake/parity test suites.');
if(missing.length)console.error(missing.join('\n'));
if(process.argv.includes('--strict'))console.error('Strict complete-fidelity gate remains unmet; an asset audit cannot establish full encounter parity.');
if(missing.length||process.argv.includes('--strict'))process.exitCode=1;
