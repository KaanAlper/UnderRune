/** fought: battles played to an end at least once (a secret boss's first party wipe is not a game over). */
export type Preferences={version:number;muted:boolean;reducedEffects:boolean;completed:string[];fought:string[]};
type Store=Pick<Storage,'getItem'|'setItem'>;
export function browserStore():Store{
 try{return window.localStorage;}catch{return {getItem:()=>null,setItem:()=>{}};}
}
const defaults=():Preferences=>({version:1,muted:false,reducedEffects:false,completed:[],fought:[]});
export function loadPrefs(storage:Store):Preferences{
 try{const parsed=JSON.parse(storage.getItem('shadowcrystal.local.v1')??'null');if(!parsed||parsed.version!==1)return defaults();return {version:1,muted:parsed.muted===true,reducedEffects:parsed.reducedEffects===true,completed:Array.isArray(parsed.completed)?parsed.completed.filter((v:unknown)=>typeof v==='string'):[],fought:Array.isArray(parsed.fought)?parsed.fought.filter((v:unknown)=>typeof v==='string'):[]};}catch{return defaults();}
}
export function savePrefs(storage:Store,prefs:Preferences){try{storage.setItem('shadowcrystal.local.v1',JSON.stringify(prefs));}catch{/* Preferences never prevent gameplay. */}}
