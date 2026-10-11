/** Public availability is independent of attack-module existence and local reference-test skips. */
export interface SourceEncounter{
 id:string;chapter:number;name:string;party:readonly number[];hp:number;attack:number;defense:number;music:string;practice:boolean;
}
const playable:readonly SourceEncounter[]=[
 {id:'ch1-2',chapter:1,name:'Lancer',party:[1,2],hp:540,attack:5,defense:1,music:'lancerfight',practice:false},
 {id:'ch1-8',chapter:1,name:'Clover',party:[1,3],hp:270,attack:6,defense:1,music:'battle',practice:false},
 {id:'ch1-25',chapter:1,name:'JEVIL',party:[1,2,3],hp:3500,attack:10,defense:5,music:'joker',practice:true},
];
export const sourceEncounter=(id:string)=>playable.find(p=>p.id===id);
/** Explicit local verification entry points. Public launches always use sourceEncounter. */
export const developmentEncounter=(id:string)=>sourceEncounter(id);
export const availableEncounters=(chapter:number)=>playable.filter(p=>p.chapter===chapter);
export function availabilityLabel(chapter:number){const rows=availableEncounters(chapter);return rows.length?rows.map(p=>p.name.toUpperCase()).join(' + ')+' AVAILABLE':'NO PLAYABLE BATTLES YET';}
