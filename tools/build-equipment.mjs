import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {transformWithOxc} from 'vite';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const scratch=path.join(root,'.tools/equipment');await fs.mkdir(scratch,{recursive:true});
const runtime=await transformWithOxc(await fs.readFile(path.join(root,'src/source-runtime/gml.ts'),'utf8'),'gml.ts',{lang:'ts'});
await fs.writeFile(path.join(scratch,'gml.mjs'),runtime.code);
const {parseGml,executeGml}=await import(pathToFileURL(path.join(scratch,'gml.mjs')));
const game=process.env.DELTARUNE_DIR??'C:/Program Files (x86)/Steam/steamapps/common/DELTARUNE';
const catalog={version:1,chapters:{}};
for(let chapter=1;chapter<=5;chapter++){
 const packageId=`chapter${chapter}_windows`,base=path.join(root,'extracted',packageId);let lang={};
 // Same file the game loads (scr_84_lang_load: "lang_" + global.lang + ".json"); stray patch files are ignored.
 for(const name of ['lang_en.json'])try{Object.assign(lang,JSON.parse((await fs.readFile(path.join(game,packageId,'lang',name),'utf8')).replace(/^\uFEFF/,'')));}catch(error){if(error.code!=='ENOENT')throw error;}
 const index=JSON.parse(await fs.readFile(path.join(base,'index.json'),'utf8'));
 const environment={global:{chapter,plot:0,flag:Array(3000).fill(0)}};
 for(const [i,object]of index.objects.entries())environment[object.name]=i;
 const calls={stringsetloc:(_self,text)=>text,stringset:(_self,text)=>text,stringsetsubloc:(_self,text,...subs)=>{subs.pop();return subs.reduce((s,value,i)=>s.replaceAll('~'+(i+1),String(value)),text);},scr_84_get_lang_string:(_self,key)=>{if(!(key in lang))throw Error('Missing source localization: '+key);return lang[key];},string:(_self,value)=>String(value),floor:(_self,value)=>Math.floor(value),instance_exists:()=>false,i_ex:()=>false};
 calls.scr_text=(_self,text,...subs)=>subs.reduce((s,value,i)=>s.replaceAll('~'+(i+1),String(value)),text);
 const data={armors:[],weapons:[],items:[],sources:[],bagCapacity:12};
 for(const [kind,script,prefix]of [['armors','armorinfo','armor'],['weapons','weaponinfo','weapon'],['items','iteminfo','item']]){
  const name=`gml_GlobalScript_scr_${script}`,source=await fs.readFile(path.join(base,'code',name+'.gml'),'utf8');
  const ids=[...new Set([...source.matchAll(/\bcase\s+(\d+)\s*:/g)].map(m=>Number(m[1])))];
  data.sources.push({name,sha256:createHash('sha256').update(source).digest('hex')});
  const program=parseGml(source);
  for(const id of ids){
   const self={};const invocation=parseGml(`scr_${script}(${id});`);
   executeGml({statements:[...program.statements,...invocation.statements]},self,environment,{calls});
   const plain=text=>String(text??'').replaceAll('#','\n').trim();
   if(kind==='items'){data.items.push({id,name:plain(self.itemnameb),description:plain(self.itemdescb),usable:self.usable===1,target:self.itemtarget??0,replaceable:self.replaceable??0});}
   else data[kind].push({id,name:plain(self[prefix+'nametemp']),description:plain(self[prefix+'desctemp']),attack:self[prefix+'attemp'],defense:self[prefix+'dftemp'],magic:self[prefix+'magtemp'],allowed:[1,2,3,4].filter(char=>self[prefix+'char'+char+'temp']===1),ability:plain(self[prefix+'abilitytemp']),icon:self[prefix+'icontemp'],grazeAmount:self[prefix+'grazeamttemp'],grazeSize:self[prefix+'grazesizetemp'],bolts:self[prefix+'boltstemp']});
  }
 }
 for(const key of ['armors','weapons','items'])for(const entry of data[key])if(entry.id!==0&&!entry.name)throw Error(`Unnamed source ${key} ${chapter}:${entry.id}`);
 catalog.chapters[chapter]=data;console.log(`Chapter ${chapter}: ${data.armors.length-1} armors, ${data.weapons.length-1} weapons, ${data.items.length-1} items`);
}
const destination=path.join(root,'public/generated/equipment.json');await fs.mkdir(path.dirname(destination),{recursive:true});await fs.writeFile(destination,JSON.stringify(catalog));
