import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
const catalog = JSON.parse(fs.readFileSync(new URL('../src/bosses/catalog.json', import.meta.url), 'utf8'));
const parties = JSON.parse(fs.readFileSync(new URL('../src/bosses/parties.json', import.meta.url), 'utf8'));
const native = catalog;

test('every native encounter has a valid source party with evidence', () => {
  for (const record of native) {
    const entry = parties[record.id];
    assert.ok(entry, 'missing party for ' + record.id);
    assert.equal(entry.party.length, 3, record.id);
    assert.ok(entry.party[0] >= 1 && entry.party[0] <= 4, record.id + ' needs a leader');
    assert.ok(entry.party.every(id => Number.isInteger(id) && id >= 0 && id <= 4), record.id);
    const members = entry.party.filter(Boolean);
    assert.equal(new Set(members).size, members.length, record.id + ' repeats a member');
    assert.ok(['code', 'enemy', 'story'].includes(entry.basis) && entry.note, record.id + ' needs evidence');
  }
});
test('party members never fight on both sides', () => {
  // Susie & Lancer: Susie is the enemy, so she cannot also be in the party.
  assert.ok(!parties['ch1-31'].party.includes(2));
  assert.deepEqual(parties['ch4-160'].party, [2, 0, 0]);
});
