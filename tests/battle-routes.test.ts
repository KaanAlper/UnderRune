import {describe,it,expect} from 'vitest';
import {battleRoutes} from '../src/remake/host/routes';
describe('source encounter route choices',()=>{
 it('offers Berdly city routes before equipment with separate score identities',()=>{
  const routes=battleRoutes('ch2-82');expect(routes.map(r=>r.id)).toEqual(['normal','weird']);
  expect(routes[1]).toMatchObject({encounterId:'ch2-82-weird',party:[1,4],ready:true,rage:false});
 });
 it('distinguishes the two complete NEO routes and their input policies',()=>{
  const routes=battleRoutes('ch2-61');expect(routes.map(r=>r.id)).toEqual(['normal','weird']);
  expect(routes[0]).toMatchObject({encounterId:'ch2-61',ready:true,party:[1,2,3],confirmRelease:'logical',rage:false});
  expect(routes[1]).toMatchObject({encounterId:'ch2-61-weird',ready:true,party:[1],confirmRelease:'independent',rage:true});
 });
 it('does not invent alternate routes for single-route bosses',()=>{
  const routes=battleRoutes('ch1-8');expect(routes).toHaveLength(1);expect(routes[0]).toMatchObject({id:'normal',encounterId:'ch1-8',party:[1,3],ready:true});
 });
});
