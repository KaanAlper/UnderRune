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
 {id:'ch2-57',chapter:2,name:'Tasque Manager',party:[1,2,3],hp:1367,attack:10,defense:0,music:'battle',practice:false},
 {id:'ch2-81',chapter:2,name:'Werewerewire',party:[1,2,3],hp:1753,attack:11,defense:0,music:'battle',practice:false},
 {id:'ch2-83',chapter:2,name:'Mauswheel',party:[1,2,3],hp:1753,attack:10,defense:0,music:'battle',practice:false},
 // Spamton, before NEO, in Cyber City's alley: Kris alone.
 {id:'ch2-60',chapter:2,name:'Spamton',party:[1],hp:600,attack:8,defense:0,music:'spamton_battle',practice:false},
 // The Dojo's final round: two Werewerewires.
 {id:'ch2-94',chapter:2,name:'Werewerewire',party:[1,2,3],hp:1753,attack:11,defense:0,music:'battle',practice:false},
 {id:'ch1-2',chapter:1,name:'Lancer',party:[1,2],auto:[2],hp:540,attack:5,defense:1,music:'lancerfight',practice:false},
 {id:'ch1-8',chapter:1,name:'Clover',party:[1,3],hp:270,attack:6,defense:1,music:'battle',practice:false},
 // getsusieevent rejoins Ralsei, then Susie. Her gamestart charauto remains set until prisonevent.
 {id:'ch1-12',chapter:1,name:'K.Round',party:[1,3,2],auto:[2],hp:1300,attack:7.5,defense:3,music:'checkers',practice:false,heroes:[[80,50],[80,130],[80,210]]},
 {id:'ch1-25',chapter:1,name:'JEVIL',party:[1,2,3],hp:3500,attack:10,defense:5,music:'joker',practice:true},
 {id:'ch1-27',chapter:1,name:'K.Round',party:[1,2,3],hp:1300,attack:8,defense:3,music:'checkers',practice:false,heroes:[[80,65],[80,130],[80,210]]},
 // Kris and Ralsei against Lancer, with Susie on his side (obj_lancerbattle2_event).
 {id:'ch1-20',chapter:1,name:'Lancer',party:[1,3],hp:2400,attack:4,defense:-40,music:'lancerfight',practice:false},
 // Susie fights on Lancer's side; Kris and Ralsei face them both.
 {id:'ch1-31',chapter:1,name:'Susie & Lancer',party:[1,3],hp:800,attack:6,defense:1,music:'lancer_susie',practice:false},
 {id:'ch1-40',chapter:1,name:'King',party:[1,2,3],hp:2800,attack:8,defense:0,music:'kingboss',practice:false},
 // Chapter 3's secret boss, after the fountain scene (obj_ch3_PTB02).
 {id:'ch3-115',chapter:3,name:'Roaring Knight',party:[1,2,3],hp:7300,attack:40,defense:0,music:'knight',practice:false},
];
export const sourceEncounter=(id:string)=>playable.find(p=>p.id===id);
/** Explicit local verification entry points. Public launches always use sourceEncounter. */
/** Reserved for EngineBattle fixtures that still need end-to-end verification before public launch. */
const development:readonly SourceEncounter[]=[
 // Queen, in her mansion's top floor: being checked against her recordings.
 {id:'ch2-59',chapter:2,name:'Queen',party:[1,2,3],hp:1510,attack:10,defense:0,music:'queen_boss',practice:false},
 // The Dojo's Tasque Manager rematch: its quiz ending still differs from the recordings.
 {id:'ch2-89',chapter:2,name:'Tasque Manager',party:[1,2,3],hp:1367,attack:10,defense:0,music:'battle',practice:false},
];
export const developmentEncounter=(id:string)=>sourceEncounter(id)??development.find(p=>p.id===id);
export const availableEncounters=(chapter:number)=>playable.filter(p=>p.chapter===chapter);
export function availabilityLabel(chapter:number){const rows=availableEncounters(chapter);return rows.length?[...new Set(rows.map(p=>p.name.toUpperCase()))].join(' + ')+' AVAILABLE':'NO PLAYABLE BATTLES YET';}
