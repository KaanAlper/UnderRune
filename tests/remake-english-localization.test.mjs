import {test} from 'node:test';
import assert from 'node:assert/strict';
import {englishLocalization,localizationDefaults} from '../tools/source-localization.mjs';
test('uses the original English fallback when an installed patch replaces the English language file',()=>{
 const key='scr_test_slash_scr_test_gml_1_0';
 const defaults=localizationDefaults(`stringsetloc("Original", "${key}");`);
 const patched={[key]:'Çeviri',onlyInFile:'Legacy'};
 assert.deepEqual(englishLocalization(patched,defaults),{[key]:'Original',onlyInFile:'Legacy'});
 assert.equal(patched[key],'Çeviri');
});
