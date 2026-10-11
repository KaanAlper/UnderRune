import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseSounds,embeddedAudio} from '../tools/sound-assets.mjs';
function form(name,payload){const b=Buffer.alloc(16+payload.length);b.write('FORM');b.writeUInt32LE(b.length-8,4);b.write(name,8);b.writeUInt32LE(payload.length,12);payload.copy(b,16);return b;}
function sounds(){const p=Buffer.alloc(60);p.writeUInt32LE(1);p.writeUInt32LE(24,4);p.writeUInt32LE(60,8);p.writeUInt32LE(101,12);p.writeFloatLE(.75,28);p.writeFloatLE(0,32);p.writeInt32LE(1,36);p.writeInt32LE(0,40);p.write('snd_hit\0',44);return form('SOND',p);}
test('sound metadata retains the external audio group and treats zero pitch as unity',()=>{assert.deepEqual(parseSounds(sounds(),new Set(['snd_hit'])),[{name:'snd_hit',volume:.75,pitch:1,group:1,audio:0}]);});
test('only explicitly selected sound resources are exported',()=>{assert.deepEqual(parseSounds(sounds(),new Set(['snd_other'])),[]);});
test('embedded audio uses the selected bank AUDO bytes, without the package header',()=>{const payload=Buffer.alloc(16);payload.writeUInt32LE(1);payload.writeUInt32LE(24,4);payload.writeUInt32LE(4,8);payload.write('RIFF',12);assert.equal(embeddedAudio(form('AUDO',payload),0).toString(),'RIFF');});
test('invalid audio pointers and truncated samples are rejected',()=>{const payload=Buffer.alloc(16);payload.writeUInt32LE(1);payload.writeUInt32LE(24,4);payload.writeUInt32LE(40,8);payload.write('RIFF',12);assert.throws(()=>embeddedAudio(form('AUDO',payload),0),/outside/);assert.throws(()=>embeddedAudio(form('AUDO',payload),1),/index/);});
