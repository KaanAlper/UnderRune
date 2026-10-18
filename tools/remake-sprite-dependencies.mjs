/** Source ports may inherit their default sprite and mask from the chapter object table. Those assets are needed
 * even when no draw_sprite call mentions their names directly. Keep every name scoped to its source chapter. */
export function remakeSpriteDependencies(source,objects){
 const names=new Set(source.match(/\b(?:spr|bg|IMAGE)_[A-Za-z0-9_]+/g)??[]);
 const referencedObjects=new Set(source.match(/\bobj_[A-Za-z0-9_]+/g)??[]);
 for(const object of objects)if(referencedObjects.has(object.name))for(const field of ['sprite','mask'])if(object[field])names.add(object[field]);
 return names;
}
