/** Public availability is independent of attack-module existence and local reference-test skips. */
export interface SourceEncounter{
 id:string;chapter:number;name:string;party:readonly number[];hp:number;attack:number;defense:number;music:string;practice:boolean;
 /** Character IDs that ignore commands and attack automatically at this story point. */
 auto?:readonly number[];
 /** Party positions (scr_encountersetup heromakex/heromakey) where they differ from the host's defaults. */
 heroes?:readonly (readonly [number,number])[];
}
const playable:readonly SourceEncounter[]=[
 {id:'ch2-61',chapter:2,name:'Spamton NEO',party:[1,2,3],hp:4809,attack:13,defense:0,music:'spamton_neo_mix_ex_wip',practice:false},
 {id:'ch1-2',chapter:1,name:'Lancer',party:[1,2],auto:[2],hp:540,attack:5,defense:1,music:'lancerfight',practice:false},
 {id:'ch1-8',chapter:1,name:'Clover',party:[1,3],hp:270,attack:6,defense:1,music:'battle',practice:false},
 // getsusieevent rejoins Ralsei, then Susie. Her gamestart charauto remains set until prisonevent.
 {id:'ch1-12',chapter:1,name:'K.Round',party:[1,3,2],auto:[2],hp:1300,attack:7.5,defense:3,music:'checkers',practice:false,heroes:[[80,50],[80,130],[80,210]]},
 {id:'ch1-25',chapter:1,name:'JEVIL',party:[1,2,3],hp:3500,attack:10,defense:5,music:'joker',practice:true},
 {id:'ch1-27',chapter:1,name:'K.Round',party:[1,2,3],hp:1300,attack:8,defense:3,music:'checkers',practice:false,heroes:[[80,65],[80,130],[80,210]]},
 // Kris and Ralsei against Lancer, with Susie on his side (obj_lancerbattle2_event).
 {id:'ch1-20',chapter:1,name:'Lancer',party:[1,3],hp:2400,attack:4,defense:-40,music:'lancerfight',practice:false},
 {id:'ch1-40',chapter:1,name:'King',party:[1,2,3],hp:2800,attack:8,defense:0,music:'kingboss',practice:false},
];
export const sourceEncounter=(id:string)=>playable.find(p=>p.id===id);
/** Explicit local verification entry points. Public launches always use sourceEncounter. */
/** Reserved for EngineBattle fixtures that still need end-to-end verification before public launch. */
const development:readonly SourceEncounter[]=[
];
export const developmentEncounter=(id:string)=>sourceEncounter(id)??development.find(p=>p.id===id);
export const availableEncounters=(chapter:number)=>playable.filter(p=>p.chapter===chapter);
export function availabilityLabel(chapter:number){const rows=availableEncounters(chapter);return rows.length?[...new Set(rows.map(p=>p.name.toUpperCase()))].join(' + ')+' AVAILABLE':'NO PLAYABLE BATTLES YET';}
