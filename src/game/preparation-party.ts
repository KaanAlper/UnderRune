import parties from '../bosses/parties.json';
import {CHARACTERS} from './loadout';
type PartyProfile={party:number[];auto?:number[];equipmentLocked?:number[]};
/** Same source party table used by the original-engine launchers. Command autonomy does not lock equipment. */
export function preparationParty(id:string){
 const profile=(parties as unknown as Record<string,PartyProfile>)[id];
 if(!profile?.party)throw Error('Battle party is not defined for '+id);
 const members=profile.party.filter(n=>n!==0);
 if(members.some(n=>!CHARACTERS.some(c=>c.id===n)))throw Error('Unknown party member for '+id);
 return {members,auto:profile.auto??[],locked:profile.equipmentLocked??[]};
}
