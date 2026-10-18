/** Source ports may inherit their default sprite and mask from the chapter object table. Those assets are needed
 * even when no draw_sprite call mentions their names directly. Keep every name scoped to its source chapter. */
export function remakeSpriteDependencies(source,objects,spriteNames=new Set()){
 const names=new Set(source.match(/\b(?:spr|bg|IMAGE)_[A-Za-z0-9_]+/g)??[]);
 // Sprites named otherwise (K_K's s_kk parts): any quoted name the chapter's sprite table has.
 for(const [,name] of source.matchAll(/'([A-Za-z0-9_]+)'/g))if(spriteNames.has(name))names.add(name);
 const referencedObjects=new Set(source.match(/\bobj_[A-Za-z0-9_]+/g)??[]);
 for(const object of objects)if(referencedObjects.has(object.name))for(const field of ['sprite','mask'])if(object[field])names.add(object[field]);
 return names;
}
