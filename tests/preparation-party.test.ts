import {describe,it,expect} from 'vitest';
import {preparationParty} from '../src/game/preparation-party';
import {catalog} from '../src/bosses/catalog';
import {availableEncounters} from '../src/remake/host/encounters';
describe('source preparation party',()=>{
 it('has a defined party for every catalog encounter',()=>{for(const record of catalog){const party=preparationParty(record.id);expect(party.members.length).toBeGreaterThan(0);expect(party.members.length).toBeLessThanOrEqual(3);}});
 it('agrees with every public battle and preserves story order',()=>{for(const chapter of [1,2])for(const battle of availableEncounters(chapter)){expect(preparationParty(battle.id).members).toEqual(battle.party);expect(preparationParty(battle.id).auto).toEqual(battle.auto??[]);}});
 it('uses two members, a replacement member, or a solo character as the encounter requires',()=>{
  expect(preparationParty('ch1-2').members).toEqual([1,2]);expect(preparationParty('ch1-8').members).toEqual([1,3]);
  expect(preparationParty('ch2-82').members).toEqual([1,4]);expect(preparationParty('ch4-160').members).toEqual([2]);
  expect(preparationParty('ch1-2').locked).toEqual([]);
 });
});
