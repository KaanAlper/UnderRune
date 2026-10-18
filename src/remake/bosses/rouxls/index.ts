// Rouxls Kaard (encounter 63): his enemy, the Thrash Machine, his mini-game and his attacks' objects, and the bullet
// maker's patterns for them.
import type {GmObjectDef} from '../../gm/runtime';
import {createRouxlsEnemy} from './enemy';
import {createThrashMachine} from './thrash';
import {createSimtown} from './simtown';
import {createRouxlsAttacks} from './attacks';

export function createRouxls(object:(name:string)=>GmObjectDef){
 const thrash=createThrashMachine(object),town=createSimtown(object),attacks=createRouxlsAttacks(object);
 const enemy=createRouxlsEnemy(object,{thrash,simtown:town.simtown,land:town.land,acid:town.acid,splash:attacks.splash,ripple:attacks.ripple});
 return {objects:[enemy,thrash,...town.objects,...attacks.objects],pattern:attacks.pattern};
}
