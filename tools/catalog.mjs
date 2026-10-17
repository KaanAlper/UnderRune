import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const hash=code=>createHash('sha256').update(code).digest('hex');
import {fileURLToPath} from 'node:url';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
export function buildCatalog(records){
 const map=new Map();
 // Encounter 15 is an unused Clover/Hathy pairing, excluded from the playable boss selection.
 for(const r of records){if(r.id==='ch1-15')continue;const prev=map.get(r.id);if(!prev){map.set(r.id,structuredClone(r));continue;}
  if(prev.name!==r.name||prev.chapter!==r.chapter||prev.variant!==r.variant)throw Error('Encounter identity conflict');
  prev.sources.push(...r.sources.filter(s=>!prev.sources.some(p=>JSON.stringify(p)===JSON.stringify(s))));
 }
 return [...map.values()];
}
function blockAt(text,start){
 let depth=0,quote='',escape=false;
 for(let i=start;i<text.length;i++){
  const c=text[i];if(quote){if(escape)escape=false;else if(c==='\\')escape=true;else if(c===quote)quote='';continue;}
  if(c==='"'||c==="'"){quote=c;continue;}
  if(c==='{')depth++;if(c==='}'&&--depth===0)return text.slice(start,i+1);
 }
 return '';
}
export function parseMonsterSetup(text,lang){
 const out=new Map();
 for(const m of text.matchAll(/if\s*\(global\.monstertype\[myself\]\s*==\s*(\d+)\)\s*\{/g)){
  const block=blockAt(text,m.index+m[0].lastIndexOf('{'));
  const nameLine=block.match(/global\.monstername\[myself\]\s*=\s*([^;]+);/)?.[1]??'';
  const strings=[...nameLine.matchAll(/"([^"\n]*)"/g)].map(x=>x[1]);
  let name=nameLine.includes('scr_84_get_lang_string')?(lang[strings[0]]??strings[0]):strings[0];
  const stat=k=>Number(block.match(new RegExp(`global\\.${k}\\[myself\\]\\s*=\\s*([\\d.]+)`))?.[1]??0);
  const acts=[...block.matchAll(/global\.actname\[myself\]\[\d+\]\s*=\s*([^;]+);/g)].map(m=>{
   const ss=[...m[1].matchAll(/"([^"\n]*)"/g)].map(x=>x[1]);return m[1].includes('scr_84_get_lang_string')?(lang[ss[0]]??ss[0]):ss[0];
  }).filter(Boolean);
  out.set(Number(m[1]),{type:Number(m[1]),name,hp:stat('monstermaxhp'),at:stat('monsterat'),df:stat('monsterdf'),acts:[...new Set(acts)],sourceBlockHash:createHash('sha256').update(block).digest('hex')});
 }
 return out;
}
export function parseEncounters(text){
 const entries=[];const cases=[...text.matchAll(/case\s+(\d+)\s*:/g)];
 for(let i=0;i<cases.length;i++){
  const block=text.slice(cases[i].index,cases[i+1]?.index??text.length);const enemies=[];
  for(const m of block.matchAll(/global\.monsterinstancetype\[(\d+)\]\s*=\s*(obj_\w+)\s*;/g)){
   const type=block.match(new RegExp(`global\\.monstertype\\[${m[1]}\\]\\s*=\\s*(\\d+)`));
   if(type&&Number(type[1])>0)enemies.push({slot:Number(m[1]),object:m[2],type:Number(type[1])});
  }
  if(enemies.length)entries.push({encounter:Number(cases[i][1]),enemies});
 }
 return entries;
}
// Reviewed boss objects; encountersetup is the source of variants and parties.
const bosses=new Set(['obj_lancerboss','obj_lancerboss2','obj_lancerboss3','obj_susieenemy','obj_clubsenemy','obj_checkers_enemy','obj_joker','obj_king_boss',
 'obj_tasque_manager_enemy','obj_werewerewire_enemy','obj_mauswheel_enemy','obj_berdlyb_enemy','obj_berdlyb2_enemy','obj_queen_enemy','obj_spamton_enemy','obj_spamton_neo_enemy','obj_gigaqueen_enemy','obj_rouxls_enemy','obj_sweet_enemy','obj_hatguy_enemy','obj_kk_enemy',
 'obj_tenna_enemy','obj_tenna_board4_enemy','obj_knight_enemy','obj_shadow_mantle_enemy','obj_susiezilla_enemy','obj_lanino_enemy','obj_elnina_enemy','obj_lanino_rematch_enemy','obj_elnina_rematch_enemy','obj_rouxls_ch3_enemy',
 'obj_hammer_of_justice_enemy','obj_titan_enemy','obj_titan_spawn_enemy','obj_jackenstein_enemy','obj_holywatercooler_enemy',
 'obj_orange_enemy','obj_green_enemy','obj_blue_enemy','obj_yellow_enemy','obj_purple_enemy','obj_pink_enemy','obj_flowery_enemy','obj_aqua_enemy','obj_ball_enemy','obj_nubert_enemy','obj_netskie_enemy','obj_terracota_enemy']);
export async function generateCatalog(){
 const game=process.env.DELTARUNE_DIR??'C:/Program Files (x86)/Steam/steamapps/common/DELTARUNE';
 const sources=JSON.parse((await fs.readFile(path.join(root,'extracted/source-manifest.json'),'utf8')).replace(/^\uFEFF/,''));
 const records=[],signatures=new Map(),all=[];
 for(const source of sources){
  const chapter=Number(source.id.match(/\d+/)[0]),base=path.join(root,'extracted',source.id);
  const index=JSON.parse(await fs.readFile(path.join(base,'index.json'),'utf8'));
  let lang={};for(const name of ['lang_en.json','lang_en_ch1.json']){try{lang={...lang,...JSON.parse(await fs.readFile(path.join(game,source.id,'lang',name),'utf8'))};}catch{}}
  const monsters=parseMonsterSetup(await fs.readFile(path.join(base,'code/gml_GlobalScript_scr_monstersetup.gml'),'utf8'),lang);
  const entries=parseEncounters(await fs.readFile(path.join(base,'code/gml_GlobalScript_scr_encountersetup.gml'),'utf8'));
  for(const entry of entries){
   if(entry.encounter>=500||!entry.enemies.some(e=>bosses.has(e.object)))continue;
   if(entry.enemies.some(e=>!index.objects.some(o=>o.name===e.object)))continue;
   const enemies=entry.enemies.map(e=>({...e,...monsters.get(e.type),sprite:index.objects.find(o=>o.name===e.object)?.sprite}));
   for(const enemy of enemies){
    if(enemy.object==='obj_knight_enemy'&&!enemy.name)enemy.name='Roaring Knight';
    if(enemy.object==='obj_aqua_enemy'&&enemy.name==='???'){enemy.sourceDisplayName=enemy.name;enemy.name='Aqua';}
   }
   if(enemies.some(e=>!e.name||!e.hp||/Example|Enemy$|\?\?\?/.test(e.name)))continue;
   const signature=entry.encounter+':'+enemies.map(e=>e.object+':'+e.type).join('|');
   const sourceRecord={packageId:source.id,sha256:source.sha256,encounter:entry.encounter,code:['gml_GlobalScript_scr_monstersetup','gml_GlobalScript_scr_encountersetup'],rooms:[]};
   if(signatures.has(signature)){signatures.get(signature).sources.push(sourceRecord);continue;}
   const name=[...new Set(enemies.map(e=>e.name))].join(' & ');
   const id=`ch${chapter}-${entry.encounter}`;
   const secret=enemies.some(e=>/joker|spamton_neo|knight|shadow_mantle|hammer_of_justice/.test(e.object));
   const main=enemies.some(e=>/king_boss|queen_enemy|gigaqueen|tenna|titan_enemy|pink|flowery/.test(e.object));
   const record={id,name,chapter,encounter:entry.encounter,variant:String(entry.encounter),kind:secret?'secret':main?'main':'miniboss',sources:[sourceRecord],enemies,status:'identified',adaptation:'browser-adaptation'};
   signatures.set(signature,record);records.push(record);
  }
  all.push({chapter,monsterTypes:[...monsters.values()],encounters:entries});
 }
 const specialSource=sources.find(s=>s.id==='chapter3_windows');
 if(specialSource){
  const index=JSON.parse(await fs.readFile(path.join(root,'extracted',specialSource.id,'index.json'),'utf8'));
  for(const [object,name,hpField]of [['obj_shadow_mantle_enemy','ERAM','hp'],['obj_susiezilla_singlescreen_kickboxin_tenna','Susiezilla: Tenna','maxhp']]){
   const codeName=`gml_Object_${object}_Create_0`,stepName=`gml_Object_${object}_Step_${object==='obj_shadow_mantle_enemy'?2:0}`;
   const code=await fs.readFile(path.join(root,'extracted',specialSource.id,'code',codeName+'.gml'),'utf8');
   const hp=Number(code.match(new RegExp(`\\b${hpField}\\s*=\\s*(\\d+)`))?.[1]);
   if(!hp)throw Error('Missing action boss HP: '+object);
   records.push({id:object==='obj_shadow_mantle_enemy'?'ch3-mantle':'ch3-susiezilla',name,chapter:3,encounter:-1,variant:'action',kind:'secret',combatSystem:'action',sources:[{packageId:specialSource.id,sha256:specialSource.sha256,encounter:-1,code:[codeName,stepName],rooms:[]}],enemies:[{slot:0,object,type:-1,name,hp,at:0,df:0,acts:[],sprite:index.objects.find(o=>o.name===object)?.sprite,sourceBlockHash:hash(code)}],status:'identified',adaptation:'browser-action-adaptation'});
  }
 }
 await fs.mkdir(path.join(root,'src/bosses'),{recursive:true});
 await fs.writeFile(path.join(root,'src/bosses/catalog.json'),JSON.stringify(buildCatalog(records),null,2));
 await fs.writeFile(path.join(root,'docs/boss-inventory.json'),JSON.stringify({packages:sources,encounters:records,allSourceEncounters:all},null,2));
 console.log(`Source-confirmed boss encounters: ${records.length}`);
 console.log(records.map(r=>`${r.id}: ${r.name} (${r.enemies.map(e=>e.hp).join('+')} HP)`).join('\n'));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await generateCatalog();
