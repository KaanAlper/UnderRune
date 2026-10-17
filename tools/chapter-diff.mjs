// Compares an object's events or a script between two chapters' original code (local extraction), ignoring
// indentation and text-key wording, to tell whether a later chapter can reuse an earlier chapter's port.
// Usage: node tools/chapter-diff.mjs <from> <to> <obj_name|scr_name> [...]
// Prints "same" or each event's differing lines. Reads extracted/chapterN_windows/code only.
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const [from,to,...names]=process.argv.slice(2);
if(!from||!to||!names.length)throw Error('Usage: node tools/chapter-diff.mjs <from> <to> <obj_name|scr_name> [...]');
const dir=c=>path.join(root,'extracted',`chapter${c}_windows`,'code');
const norm=t=>t.replace(/(?:stringsetloc|stringsetsubloc|msgsetloc|msgnextloc|msgsetsubloc)\(([^;]*?)"((?:scr|obj|o|DEVICE)_[^"]+)"\)/g,'LOC($2)')
 .replace(/scr_84_get_lang_string\("([^"]+)"\)/g,'LOC($1)').split('\n').map(l=>l.trim()).filter(Boolean);
for(const name of names){
 const files=name.startsWith('scr_')?[`gml_GlobalScript_${name}.gml`]:
  [...new Set([dir(from),dir(to)].flatMap(d=>fs.readdirSync(d).filter(f=>new RegExp(`^gml_Object_${name}_[A-Za-z]+_\\d+\\.gml$`).test(f))))];
 const report=[];
 for(const f of files){
  const a=fs.existsSync(path.join(dir(from),f))?norm(fs.readFileSync(path.join(dir(from),f),'utf8')):null;
  const b=fs.existsSync(path.join(dir(to),f))?norm(fs.readFileSync(path.join(dir(to),f),'utf8')):null;
  if(a===null||b===null){report.push(`${f}: only in chapter ${a?from:to}`);continue;}
  if(a.join('\n')===b.join('\n'))continue;
  const removed=a.filter(l=>!b.includes(l)),added=b.filter(l=>!a.includes(l));
  report.push(`${f}: ${removed.length} removed, ${added.length} added\n`+[...removed.map(l=>'  - '+l),...added.map(l=>'  + '+l)].slice(0,40).join('\n'));
 }
 console.log(`${name}: ${report.length?'\n'+report.join('\n'):'same'}`);
}
