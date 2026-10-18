import fs from 'node:fs/promises';
import path from 'node:path';

/** Select the dialogue lines referenced by hand ports. A complete key brings only its own line; a key prefix that the
 * port completes with a suffix (a literal ending in `_gml_`) brings every line of that event. */
export function referencedTextKeys(source,language){
 const prefixes=new Set(source.match(/\b(?:scr|obj|o|DEVICE)_[A-Za-z0-9_]+?_gml_(?![0-9])/g)??[]);
 const keys=new Set(source.match(/\b(?:scr|obj|o|DEVICE)_[A-Za-z0-9_]+?_gml_[0-9]+_[0-9]+(?:_[a-z])?\b/g)??[]);
 return new Set(Object.keys(language).filter(key=>typeof language[key]==='string'&&(keys.has(key)||prefixes.has(key.match(/^(?:scr|obj|o|DEVICE)_[A-Za-z0-9_]+?_gml_/)?.[0]))));
}

/** The string literals of a decompiled code file, in order. */
export function codeLiterals(code){
 return [...code.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map(m=>JSON.parse('"'+m[1].replace(/[\u0000-\u001f]/g,c=>'\\u'+c.charCodeAt(0).toString(16).padStart(4,'0'))+'"'));
}

/** Text the game writes as a plain literal rather than a language key: ports name it `<code file>#<n>`, the n-th
 * string literal of that file in the installed game's code, so the text itself never enters the repository. */
export async function referencedLiterals(source,codeDir){
 const out={},files=new Map();
 for(const [key,file,n] of source.matchAll(/\b(gml_(?:Object|GlobalScript)_[A-Za-z0-9_]+)#(\d+)\b/g)){
  if(!files.has(file))files.set(file,codeLiterals(await fs.readFile(path.join(codeDir,file+'.gml'),'utf8')));
  const literal=files.get(file)[Number(n)];if(literal===undefined)throw Error('No string literal '+key);
  out[key]=literal;
 }
 return out;
}
