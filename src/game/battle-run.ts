import type {Loadout} from './loadout';

/** Increment when scoring semantics or gameplay changes make previous scores incomparable. */
export const BATTLE_RULES_VERSION='battle-v2';
export const scoreBoss=(id:string)=>id.replace(/-enraged$/,'');
export type RunEquipment={character:number;weapon:number;armor:[number,number]};
export type RunRecord={id:string;encounter_id:string;rules_version:string;duration_ms:number;damage:number;equipment:RunEquipment[];bag:number[];used_items:number[];no_armor:boolean;no_item:boolean};

/** Passive host observer: no source working fields, RNG calls, event dispatch or damage rules are changed. */
export class BattleRunTracker{
 private frames=0;private damage=0;private valid=true;private ended=false;private enraged=false;
 private readonly hp:number[];private readonly party:number[];private readonly equipment:RunEquipment[];
 private readonly bag:number[];private readonly used:number[]=[];
 constructor(private encounter:string,loadout:Loadout,globals:Record<string,any>,private id=crypto.randomUUID()){
  this.party=globals.char.filter((id:number)=>id>0);
  this.equipment=this.readEquipment(globals);this.bag=[...loadout.items];
  // Intercept each write, rather than comparing frames: damage and healing can occur in the same frame.
  this.hp=new Proxy(globals.hp as number[],{set:(target,key,value)=>{
   const character=typeof key==='string'&&/^\d+$/.test(key)?Number(key):-1;
   if(this.party.includes(character)&&!this.ended){
    const before=target[character],max=globals.maxhp[character];
    if(!Number.isFinite(before)||!Number.isFinite(value)||!Number.isFinite(max))this.valid=false;
    else this.damage+=Math.max(0,Math.min(max,Math.max(0,before))-Math.min(max,Math.max(0,value)));
   }
   return Reflect.set(target,key,value);
  }});globals.hp=this.hp;
 }
 private readEquipment(g:Record<string,any>):RunEquipment[]{
  return this.party.map(character=>({character,weapon:g.charweapon[character],armor:[g.chararmor1[character],g.chararmor2[character]]}));
 }
 /** Called only after an active 30 Hz simulation step; paused/hidden/browser loading time is excluded. */
 frame(g:Record<string,any>){
  if(this.ended)return;this.frames++;
  const party=g.char.filter((id:number)=>id>0),sameParty=JSON.stringify(party)===JSON.stringify(this.party);
  // A committed source victory may remove a companion before the controller presents its result.
  const endingDeparture=g.myfight===7&&JSON.stringify(party)===JSON.stringify(this.party.filter(c=>party.includes(c)));
  if(g.hp!==this.hp||(!sameParty&&!endingDeparture)||JSON.stringify(this.readEquipment(g))!==JSON.stringify(this.equipment))this.valid=false;
 }
 /** Called when scr_spell actually executes an item, never while browsing/selecting/canceling commands. */
 itemUsed(item:number){if(!this.ended){if(!Number.isInteger(item)||item<=0)this.valid=false;else this.used.push(item);}}
 /** Only the source enrage event calls this, never the leaderboard's mode filter. */
 mode(mode:string){if(!this.ended&&mode==='enraged')this.enraged=true;}
 finish(outcome:string|null,g:Record<string,any>):RunRecord|null{
  if(this.ended||!outcome)return null;
  this.ended=true;
  if(outcome!=='victory'||!this.valid||this.frames===0||g.hp!==this.hp)return null;
  return {id:this.id,encounter_id:this.encounter+(this.enraged?'-enraged':''),rules_version:BATTLE_RULES_VERSION,duration_ms:Math.round(this.frames*1000/30),damage:this.damage,
   equipment:structuredClone(this.equipment),bag:[...this.bag],used_items:[...this.used],no_armor:this.equipment.every(c=>c.armor.every(id=>id===0)),no_item:this.used.length===0};
 }
}
