import {it,expect} from 'vitest';
import {sourceEncounter,availableEncounters,availabilityLabel} from '../src/remake/host/encounters';
it('resolves each playable source battle with its own party, stats and music',()=>{
 expect(sourceEncounter('ch1-2')).toMatchObject({name:'Lancer',party:[1,2],hp:540,attack:5,defense:1,music:'lancerfight',practice:false});
 expect(sourceEncounter('ch1-8')).toMatchObject({name:'Clover',party:[1,3],hp:270,attack:6,defense:1,music:'battle',practice:false});
 expect(sourceEncounter('ch1-25')).toMatchObject({name:'JEVIL',party:[1,2,3],hp:3500,attack:10,defense:5,music:'joker',practice:true});
});
it('does not unlock attack-only ports or unknown encounters',()=>{
 for(const id of ['ch1-12','ch1-27','ch1-40','ch2-61','missing'])expect(sourceEncounter(id)).toBeUndefined();
 expect(availableEncounters(1).map(p=>p.id)).toEqual(['ch1-2','ch1-8','ch1-25']);expect(availableEncounters(2)).toEqual([]);
});
it('shows availability for the selected chapter rather than other chapters',()=>{
 expect(availabilityLabel(1)).toBe('LANCER + CLOVER + JEVIL AVAILABLE');expect(availabilityLabel(2)).toBe('NO PLAYABLE BATTLES YET');
});
