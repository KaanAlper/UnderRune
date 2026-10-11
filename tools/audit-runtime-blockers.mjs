import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
// Counts observed using the diagnostic WASM runner's --print-unknown-functions.
// This census excludes registered stubs, and is not an equivalence test.
const observed=[
 {chapter:3,unknown:39,referenced:2238,review:['audio_emitter_gain','application_get_position','sprite_prefetch']},
 {chapter:4,unknown:44,referenced:2595,review:['audio_play_sound_at','audio_listener_orientation','audio_falloff_set_model','gpu_set_tex_repeat','sprite_duplicate']}
];
for(const chapter of observed){
 chapter.sourceReferences=[];
 const folder=path.join(root,`extracted/chapter${chapter.chapter}_windows/code`);
 for(const file of await fs.readdir(folder)){
  if(!file.endsWith('.gml'))continue;
  const lines=(await fs.readFile(path.join(folder,file),'utf8')).split(/\r?\n/);
  lines.forEach((line,index)=>{for(const api of chapter.review)if(new RegExp('\\b'+api+'\\s*\\(').test(line))chapter.sourceReferences.push({api,file,line:index+1});});
 }
}
const build=JSON.parse((await fs.readFile(path.join(root,'.tools/butterscotch-diagnostic-build/diagnostic-manifest.json'),'utf8')).replace(/^\uFEFF/,''));
const report={status:'blocked-for-production-integration',runtimeBuild:build,observedCensus:observed,limitations:['Unknown-function counts omit registered stubs.','Call references require encounter reachability and runtime checks.','JSPI browser support and complete battle behavior remain unverified.'],fullGameplayParityVerified:false};
await fs.writeFile(path.join(root,'extracted/runtime-blockers.json'),JSON.stringify(report,null,2)+'\n');
console.log(observed.map(item=>`Chapter ${item.chapter}: ${item.unknown} unregistered functions / ${item.referenced} references; ${item.sourceReferences.length} review call sites`).join('\n'));
