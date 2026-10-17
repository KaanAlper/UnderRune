/** stringsetloc uses its literal English fallback when the language table has no
 * key. Extract that same fallback from the decoded archive, never invent prose. */
export function localizationDefaults(source){
 const text={};
 for(const match of source.matchAll(/\b(?:c_)?(?:stringset(?:sub)?loc|msgset(?:sub)?loc|msgnextloc)\((?:\d+,\s*)?"((?:[^"\\]|\\.)*)"[^\r\n]*?"((?:scr|obj|o|DEVICE)_[^"]+)"\)/g))text[match[2]]=JSON.parse('"'+match[1].replace(/[\u0000-\u001f]/g,c=>'\\u'+c.charCodeAt(0).toString(16).padStart(4,'0'))+'"');
 return text;
}
