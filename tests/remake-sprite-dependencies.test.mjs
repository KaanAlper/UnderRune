import {test} from 'node:test';
import assert from 'node:assert/strict';
import {remakeSpriteDependencies} from '../tools/remake-sprite-dependencies.mjs';
test('includes metadata-only sprites and precise masks while excluding unrelated chapter resources',()=>{
 const names=remakeSpriteDependencies("const sword={...object('obj_tracking_sword1')}; draw('spr_effect');",[
  {name:'obj_tracking_sword1',sprite:'spr_sword',mask:'spr_sword_hitbox'},
  {name:'obj_other',sprite:'spr_unrelated',mask:'spr_unrelated_mask'},
 ]);
 assert.deepEqual([...names].sort(),['spr_effect','spr_sword','spr_sword_hitbox']);
});
test('keeps a sprite shared with an explicit draw once and accepts objects without sprites',()=>{
 assert.deepEqual([...remakeSpriteDependencies('obj_a obj_b spr_shared',[{name:'obj_a',sprite:'spr_shared',mask:null},{name:'obj_b',sprite:null}])],['spr_shared']);
});
