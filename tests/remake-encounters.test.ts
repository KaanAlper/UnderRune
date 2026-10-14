import {it,expect} from 'vitest';
import {sourceEncounter,availableEncounters,availabilityLabel} from '../src/remake/host/encounters';
it('resolves each playable source battle with its own party, stats and music',()=>{
 expect(sourceEncounter('ch1-2')).toMatchObject({name:'Lancer',party:[1,2],hp:540,attack:5,defense:1,music:'lancerfight',practice:false});
 expect(sourceEncounter('ch1-8')).toMatchObject({name:'Clover',party:[1,3],hp:270,attack:6,defense:1,music:'battle',practice:false});
 expect(sourceEncounter('ch1-12')).toMatchObject({name:'K.Round',party:[1,3,2],auto:[2],hp:1300,attack:7.5,defense:3,music:'checkers',practice:false,heroes:[[80,50],[80,130],[80,210]]});
 expect(sourceEncounter('ch1-27')).toMatchObject({name:'K.Round',party:[1,2,3],hp:1300,attack:8,defense:3,music:'checkers',practice:false,heroes:[[80,65],[80,130],[80,210]]});
 expect(sourceEncounter('ch1-25')).toMatchObject({name:'JEVIL',party:[1,2,3],hp:3500,attack:10,defense:5,music:'joker',practice:true});
 expect(sourceEncounter('ch2-61')).toMatchObject({name:'Spamton NEO',party:[1,2,3],hp:4809,attack:13,defense:0,music:'spamton_neo_mix_ex_wip',practice:false});
});
it('does not unlock attack-only ports or unknown encounters',()=>{
 for(const id of ['ch1-15','ch1-40','ch2-62','missing'])expect(sourceEncounter(id)).toBeUndefined();
 expect(availableEncounters(1).map(p=>p.id)).toEqual(['ch1-2','ch1-8','ch1-12','ch1-25','ch1-27']);expect(availableEncounters(2).map(p=>p.id)).toEqual(['ch2-61']);
});
it('shows availability for the selected chapter rather than other chapters',()=>{
 expect(availabilityLabel(1)).toBe('LANCER + CLOVER + K.ROUND + JEVIL AVAILABLE');expect(availabilityLabel(2)).toBe('SPAMTON NEO AVAILABLE');
});
