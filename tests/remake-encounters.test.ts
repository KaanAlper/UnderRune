import {it,expect} from 'vitest';
import {sourceEncounter,developmentEncounter,availableEncounters,availabilityLabel} from '../src/remake/host/encounters';
it('resolves each playable source battle with its own party, stats and music',()=>{
 expect(sourceEncounter('ch1-2')).toMatchObject({name:'Lancer',party:[1,2],hp:540,attack:5,defense:1,music:'lancerfight',practice:true});
 expect(sourceEncounter('ch1-8')).toMatchObject({name:'Clover',party:[1,3],hp:270,attack:6,defense:1,music:'battle',practice:true});
 expect(sourceEncounter('ch1-12')).toMatchObject({name:'K.Round',party:[1,3,2],auto:[2],hp:1300,attack:7.5,defense:3,music:'checkers',practice:true,heroes:[[80,50],[80,130],[80,210]]});
 expect(sourceEncounter('ch1-27')).toMatchObject({name:'K.Round',party:[1,2,3],hp:1300,attack:8,defense:3,music:'checkers',practice:true,heroes:[[80,65],[80,130],[80,210]]});
 expect(sourceEncounter('ch1-25')).toMatchObject({name:'JEVIL',party:[1,2,3],hp:3500,attack:10,defense:5,music:'joker',practice:true});
 expect(sourceEncounter('ch1-20')).toMatchObject({name:'Lancer',party:[1,3],hp:2400,attack:4,defense:-40,music:'lancerfight',practice:true});
 expect(sourceEncounter('ch1-40')).toMatchObject({name:'King',party:[1,2,3],hp:2800,attack:8,defense:0,music:'kingboss',practice:true});
 expect(sourceEncounter('ch2-61')).toMatchObject({name:'Spamton NEO',party:[1,2,3],hp:4809,attack:13,defense:0,music:'spamton_neo_mix_ex_wip',practice:true});
 expect(sourceEncounter('ch2-57')).toMatchObject({name:'Tasque Manager',party:[1,2,3],hp:1367,attack:10,music:'battle',practice:true});
 expect(sourceEncounter('ch2-94')).toBeUndefined();
 expect(sourceEncounter('ch2-63')).toMatchObject({name:'Rouxls',party:[1,3],hp:600,attack:9,music:'rouxls_battle',practice:true});
 expect(sourceEncounter('ch2-59')).toMatchObject({name:'Queen',party:[1,2,3],hp:1510,attack:10,music:'queen_boss',practice:true});
 expect(sourceEncounter('ch2-58')).toMatchObject({name:'Berdly',party:[1,2,3],hp:1985,attack:10,music:'berdly_battle_heartbeat_true',practice:true});
 expect(sourceEncounter('ch2-82')).toMatchObject({name:'Berdly',party:[1,4],hp:900,attack:9,music:'berdly_battle_heartbeat_true',practice:true});
 expect(sourceEncounter('ch2-71')).toMatchObject({name:'Clover',party:[1,2,3],hp:1500,attack:11,music:'battle',practice:true});
 expect(sourceEncounter('ch2-62')).toMatchObject({name:"Sweet & K_K & Cap'n",party:[1,2,3],hp:120,attack:8,music:'cyber_battle',practice:true});
 expect(sourceEncounter('ch2-84')).toMatchObject({name:'GIGA Queen',party:[1],hp:4500,attack:7.5,music:'boxing_boss',practice:true});
 expect(sourceEncounter('ch3-115')).toMatchObject({name:'Roaring Knight',party:[1,2,3],hp:7300,attack:40,music:'knight',practice:true});
});
it('does not unlock attack-only ports or unknown encounters',()=>{
 for(const id of ['ch1-15','ch2-65','missing'])expect(sourceEncounter(id)).toBeUndefined();
 expect(developmentEncounter('ch2-62')).toMatchObject({name:"Sweet & K_K & Cap'n",party:[1,2,3],hp:120,attack:8,music:'cyber_battle',practice:true});
 expect(developmentEncounter('ch2-84')).toMatchObject({name:'GIGA Queen',party:[1],hp:4500,attack:7.5,music:'boxing_boss',practice:true});
 expect(availableEncounters(1).map(p=>p.id)).toEqual(['ch1-2','ch1-8','ch1-12','ch1-25','ch1-27','ch1-20','ch1-31','ch1-40']);expect(availableEncounters(2).map(p=>p.id)).toEqual(['ch2-61','ch2-57','ch2-81','ch2-83','ch2-60','ch2-89','ch2-63','ch2-59','ch2-58','ch2-82','ch2-71','ch2-62','ch2-84']);
});
it('shows availability for the selected chapter rather than other chapters',()=>{
 expect(availabilityLabel(1)).toBe('LANCER + CLOVER + K.ROUND + JEVIL + SUSIE & LANCER + KING AVAILABLE');expect(availabilityLabel(2)).toBe('SPAMTON NEO + TASQUE MANAGER + WEREWEREWIRE + MAUSWHEEL + SPAMTON + ROUXLS + QUEEN + BERDLY + CLOVER + SWEET & K_K & CAP\'N + GIGA QUEEN AVAILABLE');
});
