export const validPlayerName=(value:unknown):value is string=>typeof value==='string'&&[...value.trim()].length>=1&&[...value.trim()].length<=24&&!/[\u0000-\u001f\u007f-\u009f]/.test(value);
/** One browser-local display name shared by scores and chat. Auth remains in LeaderboardApi. */
export class PlayerProfile{
 private value='';private listeners=new Set<()=>void>();private storage?:Pick<Storage,'getItem'|'setItem'>;
 constructor(storage?:Pick<Storage,'getItem'|'setItem'>){try{this.storage=storage??(typeof localStorage!=='undefined'?localStorage:undefined);const saved=JSON.parse(this.storage?.getItem('underrune.leaderboard.player.v1')??'null');if(validPlayerName(saved?.name))this.value=saved.name.trim();}catch{/* Keep playing when local storage is denied. */}}
 get name(){return this.value;}
 setName(name:string){if(!validPlayerName(name))throw Error('Use 1–24 characters without control characters.');const next=name.trim();if(next===this.value)return;this.value=next;try{this.storage?.setItem('underrune.leaderboard.player.v1',JSON.stringify({name:next}));}catch{/* The in-memory profile still works. */}for(const listener of this.listeners)listener();}
 subscribe(listener:()=>void):()=>void{this.listeners.add(listener);return ()=>{this.listeners.delete(listener);};}
}
