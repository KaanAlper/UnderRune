import {test} from 'node:test';
import assert from 'node:assert/strict';
import {referencedPageAssets} from '../tools/pages-asset-retention.mjs';

test('retains only chunks reachable from a release index, including its lazy imports',()=>{
 const files=new Map([
  ['play/assets/main-old.js',Buffer.from('import("./knight-old.js"); const deps=["assets/style-old.css"];')],
  ['play/assets/knight-old.js',Buffer.from('import "./shared-old.js";')],
  ['play/assets/shared-old.js',Buffer.from('import "./main-old.js";')],
  ['play/assets/style-old.css',Buffer.from('body{}')],
  ['play/assets/obsolete.js',Buffer.from('unreachable release')],
 ]);
 assert.deepEqual([...referencedPageAssets('<script src="./assets/main-old.js"></script>',files)].sort(),[
  'play/assets/knight-old.js','play/assets/main-old.js','play/assets/shared-old.js','play/assets/style-old.css',
 ]);
});
