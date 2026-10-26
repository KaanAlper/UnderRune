import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildCatalog,parseMonsterSetup,parseEncounters} from '../tools/catalog.mjs';
test('preserves different variants and merges duplicate sources',()=>{
 const b={name:'boss',chapter:1,kind:'main',sources:[]};
 assert.equal(buildCatalog([{...b,id:'a',variant:'a'},{...b,id:'b',variant:'b'}]).length,2);
 assert.equal(buildCatalog([{...b,id:'a',variant:'a',sources:[{packageId:'one'}]},{...b,id:'a',variant:'a',sources:[{packageId:'two'}]}])[0].sources.length,2);
});
test('extracts source stats and encounter object connections',()=>{
 const monsters=parseMonsterSetup('if (global.monstertype[myself] == 19) { global.monstername[myself] = stringsetloc("JEVIL", "key"); global.monstermaxhp[myself] = 3500; global.monsterat[myself] = 10; global.monsterdf[myself] = 5; }',{});
 assert.equal(monsters.get(19).hp,3500);
 const entries=parseEncounters('case 20: global.monsterinstancetype[0] = obj_joker; global.monstertype[0] = 19; break;');
 assert.deepEqual(entries,[{encounter:20,enemies:[{object:'obj_joker',type:19,slot:0}]}]);
});
test('conflicting encounter identity is rejected',()=>{
 assert.throws(()=>buildCatalog([{id:'a',name:'x',chapter:1,sources:[]},{id:'a',name:'y',chapter:1,sources:[]}]),/conflict/i);
});
test('omits the removed Dojo final-round card without hiding Werewerewire 81',()=>{
 const record=id=>({id,name:'Werewerewire',chapter:2,variant:id,sources:[]});
 assert.deepEqual(buildCatalog([record('ch2-81'),record('ch2-94')]).map(r=>r.id),['ch2-81']);
});
