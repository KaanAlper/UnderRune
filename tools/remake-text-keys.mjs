/** Select complete dialogue events referenced by hand ports, including keys assembled from suffixes. */
export function referencedTextKeys(source,language){
 const prefixes=new Set(source.match(/\b(?:scr|obj|o|DEVICE)_[A-Za-z0-9_]+?_gml_/g)??[]);
 return new Set(Object.keys(language).filter(key=>typeof language[key]==='string'&&prefixes.has(key.match(/^(?:scr|obj|o|DEVICE)_[A-Za-z0-9_]+?_gml_/)?.[0])));
}
