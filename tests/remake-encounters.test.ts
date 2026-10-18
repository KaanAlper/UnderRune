import {it,expect} from 'vitest';
import {sourceEncounter,availableEncounters,availabilityLabel} from '../src/remake/host/encounters';
it('resolves each playable source battle with its own party, stats and music',()=>{
 expect(sourceEncounter('ch1-2')).toMatchObject({name:'Lancer',party:[1,2],hp:540,attack:5,defense:1,music:'lancerfight',practice:false});
 expect(sourceEncounter('ch1-8')).toMatchObject({name:'Clover',party:[1,3],hp:270,attack:6,defense:1,music:'battle',practice:false});
 expect(sourceEncounter('ch1-12')).toMatchObject({name:'K.Round',party:[1,3,2],auto:[2],hp:1300,attack:7.5,defense:3,music:'checkers',practice:false,heroes:[[80,50],[80,130],[80,210]]});
 expect(sourceEncounter('ch1-27')).toMatchObject({name:'K.Round',party:[1,2,3],hp:1300,attack:8,defense:3,music:'checkers',practice:false,heroes:[[80,65],[80,130],[80,210]]});
 expect(sourceEncounter('ch1-25')).toMatchObject({name:'JEVIL',party:[1,2,3],hp:3500,attack:10,defense:5,music:'joker',practice:true});
 expect(sourceEncounter('ch1-20')).toMatchObject({name:'Lancer',party:[1,3],hp:2400,attack:4,defense:-40,music:'lancerfight',practice:false});
 expect(sourceEncounter('ch1-40')).toMatchObject({name:'King',party:[1,2,3],hp:2800,attack:8,defense:0,music:'kingboss',practice:false});
 expect(sourceEncounter('ch2-61')).toMatchObject({name:'Spamton NEO',party:[1,2,3],hp:4809,attack:13,defense:0,music:'spamton_neo_mix_ex_wip',practice:false});
 expect(sourceEncounter('ch2-57')).toMatchObject({name:'Tasque Manager',party:[1,2,3],hp:1367,attack:10,music:'battle'});
 expect(sourceEncounter('ch2-94')).toMatchObject({name:'Werewerewire',party:[1,2,3],hp:1753,attack:11,music:'battle'});
});
it('does not unlock attack-only ports or unknown encounters',()=>{
 for(const id of ['ch1-15','ch2-62','ch2-65','missing'])expect(sourceEncounter(id)).toBeUndefined();
 expect(availableEncounters(1).map(p=>p.id)).toEqual(['ch1-2','ch1-8','ch1-12','ch1-25','ch1-27','ch1-20','ch1-31','ch1-40']);expect(availableEncounters(2).map(p=>p.id)).toEqual(['ch2-61','ch2-57','ch2-81','ch2-83','ch2-60','ch2-89','ch2-94']);
});
it('shows availability for the selected chapter rather than other chapters',()=>{
 expect(availabilityLabel(1)).toBe('LANCER + CLOVER + K.ROUND + JEVIL + SUSIE & LANCER + KING AVAILABLE');expect(availabilityLabel(2)).toBe('SPAMTON NEO + TASQUE MANAGER + WEREWEREWIRE + MAUSWHEEL + SPAMTON AVAILABLE');
});
