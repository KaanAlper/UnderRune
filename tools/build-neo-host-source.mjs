// Read-only extraction of shared Chapter 2 source helpers and canonical resources.
import fs from 'node:fs';
import path from 'node:path';
const base='extracted/chapter2_windows',dir=path.join(base,'code');
const scripts={};
for(const name of ['scr_damage','scr_damage_all','scr_damage_cache','scr_damage_calculation','scr_damage_sneo_final_attack','scr_randomtarget_old','scr_party_hpaverage','scr_element_damage_reduction','scr_dead','scr_tensionheal','scr_heartcolor','scr_moveheart','scr_act_charsprite','scr_act_charsprite_end','scr_smallface','scr_smallface_reset','scr_cutscene_loaded','scr_afterimage','scr_afterimage_cut','scr_afterimage_grow','scr_animate','scr_dark_marker','scr_oflash','scr_armorcheck_equipped_party','scr_armorcheck_equipped','scr_script_delayed','ease_out_elastic']){
 const file=path.join(dir,`gml_GlobalScript_${name}.gml`);
 if(!fs.existsSync(file))throw Error('Missing source helper '+name);
 const code=fs.readFileSync(file,'utf8');scripts[name]=code;
 // Some archives contain more than one global function in a script asset.
 for(const match of code.matchAll(/\bfunction\s+(\w+)\s*\(/g))scripts[match[1]]=code;
}
const metadata=JSON.parse(fs.readFileSync(path.join(base,'object-parents.json'),'utf8'));
// GameMaker 2's instance_create compatibility script reads this source table;
// the object resource's exported depth=0 is not its legacy creation depth.
const depthSource=fs.readFileSync(path.join(dir,'gml_GlobalScript___global_object_depths.gml'),'utf8');
const depths=new Map([...depthSource.matchAll(/global\.__objectDepths\[(\d+)\]\s*=\s*(-?\d+);/g)].map(m=>[m[1],Number(m[2])]));
const byName=new Map([...depthSource.matchAll(/global\.__objectNames\[(\d+)\]\s*=\s*"([^"]+)";/g)].map(m=>[m[2],depths.get(m[1])]));
for(const m of metadata)m.depth=byName.get(m.name)??m.depth;
scripts.snd_pitch_time=fs.readFileSync(path.join(dir,'gml_GlobalScript_snd_pitch_time.gml'),'utf8');
const objectSources={};
for(const name of ['obj_animator','obj_smallface','obj_script_delayed','obj_collidebullet','obj_regularbullet','obj_growtangle','obj_growtangle_spark','obj_battle_cleanup','obj_spamtonshot','obj_lerppitch','obj_fadein','obj_battleblcon']){
 const m=metadata.find(m=>m.name===name);if(!m)throw Error('Missing resource '+name);
 const sources=Object.fromEntries(fs.readdirSync(dir).filter(f=>f.startsWith(`gml_Object_${name}_`)&&f.endsWith('.gml')&&!f.endsWith('Draw_64.gml')).map(f=>[f.slice(`gml_Object_${name}_`.length,-4),fs.readFileSync(path.join(dir,f),'utf8')]));
 objectSources[name]={metadata:m,sources};
}
const writer=fs.readFileSync(path.join(dir,'gml_Object_obj_writer_Draw_0.gml'),'utf8');
const start=writer.indexOf('if (nextchar == "f" && faced == 0)'),brace=writer.indexOf('{',start);let end=brace+1,depth=1;
for(;depth>0;end++){if(writer[end]==='{')depth++;else if(writer[end]==='}')depth--;}
const smallFace=writer.slice(start,end);
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):e.name.endsWith('.ts')&&e.name!=='host-source.ts'?[path.join(dir,e.name)]:[]);
const text=walk('src/remake').map(f=>fs.readFileSync(f,'utf8')).join('\n')+Object.values(scripts).join('\n')+JSON.stringify(objectSources)+smallFace;
const needed=new Set(text.match(/(?:obj|o)_[A-Za-z0-9_]+/g));
for(let size=-1;size!==needed.size;){size=needed.size;for(const m of metadata)if(needed.has(m.name)&&m.parent)needed.add(m.parent);}
const resources=metadata.filter(m=>needed.has(m.name));
fs.writeFileSync('src/remake/bosses/spamton-neo/host-source.ts',`// Generated from installed Chapter 2. Never edit source bodies by hand.\nimport type {NeoSourceMetadata} from './body-source';\nexport const neoHostScripts:Readonly<Record<string,string>>=${JSON.stringify(scripts,null,1)};\nexport const neoHostObjectSources:Readonly<Record<string,{metadata:NeoSourceMetadata;sources:Readonly<Record<string,string>>}>>=${JSON.stringify(objectSources,null,1)};\nexport const neoWriterSmallFaceSource=${JSON.stringify(smallFace)};\nexport const neoResourceMetadata:readonly NeoSourceMetadata[]=${JSON.stringify(resources.map(({name,index,parent,sprite,mask,depth,visible,solid})=>({name,index,parent,sprite,mask,depth,visible,solid})),null,1)};\n`);
console.log(`${Object.keys(scripts).length} source helpers; ${resources.length} canonical resources`);
