import {test} from 'node:test';
import assert from 'node:assert/strict';
import {referencedTextKeys} from '../tools/remake-text-keys.mjs';
test('includes dynamically suffixed event keys without including unrelated dialogue',()=>{
 const text="const T=n=>sourceText('obj_queen_enemy_slash_Step_0_gml_'+n);sourceText('scr_tired_slash_scr_tired_gml_1_0');";
 const lang={'obj_queen_enemy_slash_Step_0_gml_1_0':'a','obj_queen_enemy_slash_Step_0_gml_99_0':'b','scr_tired_slash_scr_tired_gml_1_0':'c','obj_unrelated_slash_Step_0_gml_1_0':'d','obj_queen_enemy_slash_Draw_0_gml_1_0':'e'};
 assert.deepEqual([...referencedTextKeys(text,lang)].sort(),Object.keys(lang).slice(0,3).sort());
});
test('ignores malformed keys, non-string values and an event prefix nested in a different name',()=>{
 const lang={'obj_bad_gml_1_0':4,'xobj_bad_gml_2_0':'x','obj_bad_gml_3_0':'yes'};
 assert.deepEqual([...referencedTextKeys("'obj_bad_gml_'",lang)],['obj_bad_gml_3_0']);
});
