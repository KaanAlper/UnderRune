/** Select the dialogue lines referenced by hand ports. A complete key brings only its own line; a key prefix that the
 * port completes with a suffix (a literal ending in `_gml_`) brings every line of that event. */
export function referencedTextKeys(source,language){
 const prefixes=new Set(source.match(/\b(?:scr|obj|o|DEVICE)_[A-Za-z0-9_]+?_gml_(?![0-9])/g)??[]);
 const keys=new Set(source.match(/\b(?:scr|obj|o|DEVICE)_[A-Za-z0-9_]+?_gml_[0-9]+_[0-9]+(?:_[a-z])?\b/g)??[]);
 return new Set(Object.keys(language).filter(key=>typeof language[key]==='string'&&(keys.has(key)||prefixes.has(key.match(/^(?:scr|obj|o|DEVICE)_[A-Za-z0-9_]+?_gml_/)?.[0]))));
}
