/** Public availability is independent of attack-module existence and local reference-test skips. */
export interface SourceEncounter{
 id:string;chapter:number;name:string;party:readonly number[];hp:number;attack:number;defense:number;music:string;practice:boolean;
 /** Character IDs that ignore commands and attack automatically at this story point. */
 auto?:readonly number[];
 /** Party positions (scr_encountersetup heromakex/heromakey) where they differ from the host's defaults. */
 heroes?:readonly (readonly [number,number])[];
 /** Story state supplied at route entry, before encounter and hero creation. */
 storyFlags?:Readonly<Record<number,number>>;
 spells?:Readonly<Record<number,readonly number[]>>;
 defaultWeapons?:Readonly<Record<number,number>>;
}
const playable:readonly SourceEncounter[]=[
 {id:'ch2-61',chapter:2,name:'Spamton NEO',party:[1,2,3],hp:4809,attack:13,defense:0,music:'spamton_neo_mix_ex_wip',practice:true},
 {id:'ch2-57',chapter:2,name:'Tasque Manager',party:[1,2,3],hp:1367,attack:10,defense:0,music:'battle',practice:true},
 {id:'ch2-81',chapter:2,name:'Werewerewire',party:[1,2,3],hp:1753,attack:11,defense:0,music:'battle',practice:true},
 {id:'ch2-83',chapter:2,name:'Mauswheel',party:[1,2,3],hp:1753,attack:10,defense:0,music:'battle',practice:true},
 // Spamton, before NEO, in Cyber City's alley: Kris alone.
 {id:'ch2-60',chapter:2,name:'Spamton',party:[1],hp:600,attack:8,defense:0,music:'spamton_battle',practice:true},
 // The Dojo's Tasque Manager rematch: her quiz decides it (three strikes or the last phase end the battle).
 {id:'ch2-89',chapter:2,name:'Tasque Manager',party:[1,2,3],hp:1367,attack:10,defense:0,music:'battle',practice:true},
 // Rouxls's river battle, with the laser head and stomping feet of the default Thrash Machine.
 {id:'ch2-63',chapter:2,name:'Rouxls',party:[1,3],hp:600,attack:9,defense:0,music:'rouxls_battle',practice:true},
 // Queen, in her mansion's top floor.
 {id:'ch2-59',chapter:2,name:'Queen',party:[1,2,3],hp:1510,attack:10,defense:0,music:'queen_boss',practice:true},
 // Berdly on the rollercoaster in Cyber Field.
 {id:'ch2-58',chapter:2,name:'Berdly',party:[1,2,3],hp:1985,attack:10,defense:0,music:'berdly_battle_heartbeat_true',practice:true},
 // Berdly in Cyber City's alley, with Kris and Noelle.
 {id:'ch2-82',chapter:2,name:'Berdly',party:[1,4],hp:900,attack:9,defense:0,music:'berdly_battle_heartbeat_true',practice:true},
 // Native full-battle and browser acceptance completed for the Dojo, band and boxing finale.
 {id:'ch2-71',chapter:2,name:'Clover',party:[1,2,3],hp:1500,attack:11,defense:0,music:'battle',practice:true},
 {id:'ch2-62',chapter:2,name:"Sweet & K_K & Cap'n",party:[1,2,3],hp:120,attack:8,defense:0,music:'cyber_battle',practice:true},
 {id:'ch2-84',chapter:2,name:'GIGA Queen',party:[1],hp:4500,attack:7.5,defense:0,music:'boxing_boss',practice:true},
 {id:'ch1-2',chapter:1,name:'Lancer',party:[1,2],auto:[2],hp:540,attack:5,defense:1,music:'lancerfight',practice:true},
 {id:'ch1-8',chapter:1,name:'Clover',party:[1,3],hp:270,attack:6,defense:1,music:'battle',practice:true},
 // getsusieevent rejoins Ralsei, then Susie. Her gamestart charauto remains set until prisonevent.
 {id:'ch1-12',chapter:1,name:'K.Round',party:[1,3,2],auto:[2],hp:1300,attack:7.5,defense:3,music:'checkers',practice:true,heroes:[[80,50],[80,130],[80,210]]},
 {id:'ch1-25',chapter:1,name:'JEVIL',party:[1,2,3],hp:3500,attack:10,defense:5,music:'joker',practice:true},
 {id:'ch1-27',chapter:1,name:'K.Round',party:[1,2,3],hp:1300,attack:8,defense:3,music:'checkers',practice:true,heroes:[[80,65],[80,130],[80,210]]},
 // Kris and Ralsei against Lancer, with Susie on his side (obj_lancerbattle2_event).
 {id:'ch1-20',chapter:1,name:'Lancer',party:[1,3],hp:2400,attack:4,defense:-40,music:'lancerfight',practice:true},
 // Susie fights on Lancer's side; Kris and Ralsei face them both.
 {id:'ch1-31',chapter:1,name:'Susie & Lancer',party:[1,3],hp:800,attack:6,defense:1,music:'lancer_susie',practice:true},
 {id:'ch1-40',chapter:1,name:'King',party:[1,2,3],hp:2800,attack:8,defense:0,music:'kingboss',practice:true},
 // Chapter 3's secret boss, after the fountain scene (obj_ch3_PTB02).
 {id:'ch3-115',chapter:3,name:'Roaring Knight',party:[1,2,3],hp:7300,attack:40,defense:0,music:'knight',practice:true},
 // First weather duo fight; original introduction, choices and the 99-TV ending are accepted.
 {id:'ch3-113',chapter:3,name:'Lanino & Elnina',party:[1,2,3],hp:8880,attack:12,defense:0,music:'battle',practice:false},
];
/** Route variants share their parent's card; readiness does not add a duplicate menu encounter. */
const variants:readonly SourceEncounter[]=[
 {id:'ch2-82-weird',chapter:2,name:'Berdly',party:[1,4],hp:900,attack:9,defense:0,music:'berdly_battle_heartbeat_true',practice:false,storyFlags:{915:5,916:0,924:0},spells:{4:[2,8,9,10]},defaultWeapons:{4:13}},
 {id:'ch2-61-weird',chapter:2,name:'Spamton NEO',party:[1],hp:4809,attack:13,defense:-27,music:'spamton_neo_mix_ex_wip',practice:false},
];
export const sourceEncounter=(id:string)=>playable.find(p=>p.id===id)??variants.find(p=>p.id===id);
/** Explicit local verification entry points. Public launches always use sourceEncounter. */
/** Reserved for EngineBattle fixtures that still need end-to-end verification before public launch. */
const development:readonly SourceEncounter[]=[];
export const developmentEncounter=(id:string)=>sourceEncounter(id)??development.find(p=>p.id===id);
export const availableEncounters=(chapter:number)=>playable.filter(p=>p.chapter===chapter);
export function availabilityLabel(chapter:number){const rows=availableEncounters(chapter);return rows.length?[...new Set(rows.map(p=>p.name.toUpperCase()))].join(' + ')+' AVAILABLE':'NO PLAYABLE BATTLES YET';}
