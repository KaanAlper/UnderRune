import {test} from 'node:test';
import assert from 'node:assert/strict';
import {inspectPackage} from '../tools/source-manifest.mjs';
test('rejects truncated FORM',()=>assert.throws(()=>inspectPackage(Buffer.from('FORM')),/truncated/i));
test('rejects unrelated input',()=>assert.throws(()=>inspectPackage(Buffer.from('NOTADATA')),/FORM/i));
test('rejects chunk running beyond file',()=>{
 const b=Buffer.alloc(16); b.write('FORM');b.writeUInt32LE(8,4);b.write('GEN8',8);b.writeUInt32LE(10,12);
 assert.throws(()=>inspectPackage(b),/chunk/i);
});
test('reads valid chunks',()=>{
 const b=Buffer.alloc(20);b.write('FORM');b.writeUInt32LE(12,4);b.write('GEN8',8);b.writeUInt32LE(4,12);
 assert.deepEqual(inspectPackage(b).chunks,['GEN8']);
});
