import {sourceEncounter} from './encounters';

export type BattleRoute={id:string;title:string;encounterId:string;party:readonly number[];ready:boolean;description:string;confirmRelease:'logical'|'independent';rage:boolean};
/** Route presentation and browser policies belong to host setup, never to shared combat branches. */
export function battleRoutes(encounterId:string):BattleRoute[]{
 const normal:BattleRoute={id:'normal',title:'Normal route',encounterId,party:sourceEncounter(encounterId)?.party??[],ready:!!sourceEncounter(encounterId),description:'Prepare the party for this encounter.',confirmRelease:'logical',rage:false};
 if(encounterId!=='ch2-61')return [normal];
 normal.description='Kris, Susie and Ralsei. Standard charged shots; rapid-fire Rage / Hell Mode is disabled.';
 return [normal,{id:'weird',title:'Weird / Snowgrave route',encounterId:'ch2-61-weird',party:[1],ready:!!sourceEncounter('ch2-61-weird'),description:'Kris only. Route-specific ACTs, attacks and ending. Rage / Hell Mode is reserved for this route.',confirmRelease:'independent',rage:true}];
}
