import assert from 'node:assert/strict';
import test from 'node:test';
import {probeOptions, probeEngine} from '../tools/probe-options.mjs';

test('opening the probe starts original Jevil without an automatic exit', () => {
  const options = probeOptions('');
  assert.equal(options.mode, 'jevil-room');
  assert.equal(options.engine, 'browser');
  assert.ok(!options.args.includes('--exit-at-frame'));
});
test('the default uses a portable engine when JSPI is unavailable', () => {
  assert.equal(probeEngine(probeOptions(''), false), 'portable');
  assert.equal(probeEngine(probeOptions(''), true), 'browser');
  assert.equal(probeEngine(probeOptions('?engine=diagnostic'), false), 'diagnostic');
  assert.equal(probeEngine(probeOptions('?engine=portable'), true), 'portable');
});
test('playing either Jevil launcher has no automatic exit', () => {
  for (const mode of ['jevil', 'jevil-room']) assert.ok(!probeOptions('?mode=' + mode).args.includes('--exit-at-frame'));
});
test('a bounded test must explicitly request a valid frame count', () => {
  assert.ok(!probeOptions('?mode=baseline').args.includes('--exit-at-frame'));
  const args = probeOptions('?mode=jevil-room&frames=120').args;
  assert.equal(args[args.indexOf('--exit-at-frame') + 1], '120');
  for (const frames of ['0', '-1', '1.5', 'NaN', '99999999999999999999']) assert.throws(() => probeOptions('?frames=' + frames));
});
test('API fixtures are bounded while census retains its source chapter', () => {
  const api = probeOptions('?mode=api-test').args;
  assert.equal(api[api.indexOf('--exit-at-frame') + 1], '120');
  const census = probeOptions('?mode=census&chapter=4&engine=diagnostic');
  assert.equal(census.engine, 'diagnostic');
  assert.equal(census.args[0], '/game/chapter4_windows/data.win');
  assert.ok(census.args.includes('--print-unknown-functions'));
  assert.throws(() => probeOptions('?mode=census&chapter=6'));
});
