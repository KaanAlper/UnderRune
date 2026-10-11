export const CHARACTERS = [
 {id:1,name:'Kris',color:'#69bcff',sprite:'spr_krisb_idle'},
 {id:2,name:'Susie',color:'#f68bd6',sprite:'spr_susieb_idle'},
 {id:3,name:'Ralsei',color:'#82e4a3',sprite:'spr_ralseib_idle'},
 {id:4,name:'Noelle',color:'#ffd57d',sprite:'spr_noelleb_idle'},
] as const;
export type Gear={id:number;name:string;description:string;attack:number;defense:number;magic:number;allowed:number[];ability?:string};
export type SourceItem={id:number;name:string;description:string;usable:boolean;target:number;replaceable?:number};
export type EquipmentSource={armors:Gear[];weapons:Gear[];items:SourceItem[];bagCapacity:number};
export type Loadout={version:1;characters:Record<number,{weapon:number;armor:[number,number]}>;items:number[]};
export type EquipmentCatalog={version:1;chapters:Record<number,EquipmentSource>};
export function defaultLoadout():Loadout{return {version:1,characters:Object.fromEntries(CHARACTERS.map(c=>[c.id,{weapon:0,armor:[0,0]}])),items:[]};}
export function validateLoadout(loadout:Loadout,source:EquipmentSource):void{
 if(!loadout||loadout.version!==1||!loadout.characters||!Array.isArray(loadout.items))throw Error('Invalid saved preparation.');
 for(const char of CHARACTERS){
  const slots=loadout.characters[char.id];if(!slots||!Array.isArray(slots.armor)||slots.armor.length!==2)throw Error(char.name+' needs two armor slots.');
  for(const [id,kind] of [[slots.weapon,'weapons'],...slots.armor.map(id=>[id,'armors'])] as [number,'weapons'|'armors'][]){
   const gear=source[kind].find(g=>g.id===id);if(!gear)throw Error('Equipment not in this chapter: '+id);
   if(id!==0&&!gear.allowed.includes(char.id))throw Error(char.name+" can't equip "+gear.name);
  }
 }
 if(loadout.items.length>source.bagCapacity)throw Error('The bag holds at most '+source.bagCapacity+' items.');
 for(const id of loadout.items)if(!Number.isInteger(id)||id===0||!source.items.some(i=>i.id===id))throw Error('Item not in this chapter: '+id);
}
export function addItem(loadout:Loadout,id:number,source:EquipmentSource):Loadout{
 const next=structuredClone(loadout);next.items.push(id);validateLoadout(next,source);return next;
}
export function loadoutIni(loadout:Loadout,source:EquipmentSource):string{
 validateLoadout(loadout,source);
 // Weapon 0 means "not chosen": the launcher then keeps the game's own weapon instead of an empty slot.
 return ['[weapon]',...CHARACTERS.filter(c=>loadout.characters[c.id].weapon!==0).map(c=>`${c.id}=${loadout.characters[c.id].weapon}`),'[armor1]',...CHARACTERS.map(c=>`${c.id}=${loadout.characters[c.id].armor[0]}`),'[armor2]',...CHARACTERS.map(c=>`${c.id}=${loadout.characters[c.id].armor[1]}`),'[items]',...Array.from({length:source.bagCapacity},(_,i)=>`${i}=${loadout.items[i]??0}`),''].join('\n');
}
export function readLoadout(storage:Pick<Storage,'getItem'>,chapter:number,source:EquipmentSource):Loadout{
 try{const saved=JSON.parse(storage.getItem('underrune.loadout.'+chapter)??'null');validateLoadout(saved,source);return saved;}catch{return defaultLoadout();}
}
export function writeLoadout(storage:Pick<Storage,'setItem'>,chapter:number,loadout:Loadout,source:EquipmentSource):void{
 validateLoadout(loadout,source);try{storage.setItem('underrune.loadout.'+chapter,JSON.stringify(loadout));}catch{/* A full or unavailable store never blocks the battle. */}
}
