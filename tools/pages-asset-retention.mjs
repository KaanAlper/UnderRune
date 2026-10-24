import fs from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

/** Follow the active index/import graph, rather than recursively retaining every older release. */
export function referencedPageAssets(html,files){
 const names=new Map([...files.keys()].map(file=>[path.posix.basename(file),file]));
 const kept=new Set(),pending=[html];
 while(pending.length){
  for(const match of pending.pop().matchAll(/\b[A-Za-z0-9_.-]+\.(?:m?js|css)\b/g)){
   const file=names.get(match[0]);if(!file||kept.has(file))continue;
   kept.add(file);pending.push(files.get(file).toString('utf8'));
  }
 }
 return kept;
}

/** An already-open tab can request a lazy chunk after deployment. Keep the preceding two release graphs. */
export async function preservePreviousPageAssets(root,output){
 const git=(...args)=>execFileSync('git',args,{cwd:root,maxBuffer:16*1024*1024,stdio:['ignore','pipe','ignore']});
 try{git('rev-parse','--verify','origin/gh-pages');}catch{return 0;} // First publication / source-only checkout.
 const revisions=git('rev-list','--max-count=2','origin/gh-pages').toString('utf8').trim().split(/\s+/);
 const assetRoot=path.resolve(output,'play/assets');let count=0;
 for(const revision of revisions){
  const html=git('show',revision+':play/index.html').toString('utf8');
  const paths=git('ls-tree','-r','--name-only','--full-tree',revision).toString('utf8').split('\n')
   .filter(file=>/^play\/assets\/[A-Za-z0-9_.-]+\.(?:m?js|css)$/.test(file));
  const files=new Map(paths.map(file=>[file,git('show',revision+':'+file)]));
  for(const file of referencedPageAssets(html,files)){
   const target=path.resolve(output,file);
   if(!target.startsWith(assetRoot+path.sep))throw Error('Retained asset escapes Pages assets');
   try{await fs.access(target);continue;}catch(error){if(error.code!=='ENOENT')throw error;}
   await fs.mkdir(assetRoot,{recursive:true});await fs.writeFile(target,files.get(file));count++;
  }
 }
 return count;
}
