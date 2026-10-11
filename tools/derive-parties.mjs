// Derives the party of every catalogued encounter from the original game code.
// Deltarune fixes the party for a story segment in room Create code (so saves load consistently)
// and changes it in cutscenes; the battle's party is the state when its trigger runs.
// Output: docs/encounter-parties.json with the derived party and the source lines it came from.
// Usage: node tools/derive-parties.mjs
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'src/bosses/catalog.json'), 'utf8'));
const NAMES = {1: 'Kris', 2: 'Susie', 3: 'Ralsei', 4: 'Noelle'};
const statement = /scr_losechar\(\)|scr_getchar\((\d+)\)|global\.char\[([0-2])\]\s*=\s*(\d+)|scr_setparty\(([^)]*)\)/g;

function apply(party, match) {
  const [text, get, slot, value, setArgs] = match;
  if (text.startsWith('scr_losechar')) return [party[0] || 1, 0, 0];
  if (get !== undefined) { const p = [...party]; const free = p.indexOf(0); if (free >= 0 && !p.includes(Number(get))) p[free] = Number(get); return p; }
  if (slot !== undefined) { const p = [...party]; p[Number(slot)] = Number(value); return p; }
  // scr_setparty(susie, ralsei, noelle): losechar, then each truthy member in that order.
  const flags = setArgs.split(',').map(s => /^\s*(true|1)\s*$/.test(s));
  const members = [2, 3, 4].filter((_, i) => flags[i]);
  return [1, members[0] ?? 0, members[1] ?? 0];
}
// A party is fully known after losechar/setparty, or once both companion slots were assigned explicitly.
const determines = (text, assigned) => text.startsWith('scr_losechar') || text.startsWith('scr_setparty') || (assigned.has('1') && assigned.has('2'));
function partyStatements(lines, until = lines.length) {
  const found = [];
  for (let i = 0; i < until; i++) for (const m of lines[i].matchAll(statement)) found.push({line: i + 1, text: m[0], match: m});
  return found;
}

const result = {};
for (let chapter = 1; chapter <= 5; chapter++) {
  const base = path.join(root, `extracted/chapter${chapter}_windows`);
  const codeDir = path.join(base, 'code');
  const code = Object.fromEntries(fs.readdirSync(codeDir).map(f => [f.replace(/\.gml$/, ''), fs.readFileSync(path.join(codeDir, f), 'utf8').split('\n')]));
  const rooms = JSON.parse(fs.readFileSync(path.join(base, 'room-layout.json'), 'utf8'));
  for (const record of catalog.filter(r => r.chapter === chapter && r.encounter >= 0)) {
    const trigger = new RegExp('scr_battle\\(\\s*' + record.encounter + '\\b|encounterno\\s*=\\s*' + record.encounter + '\\s*;');
    const triggers = [];
    for (const [name, lines] of Object.entries(code)) {
      if (name.includes('scr_encountersetup') || name.includes('battletester') || name.includes('debug')) continue;
      const index = lines.findIndex(l => trigger.test(l));
      if (index >= 0) triggers.push({name, line: index + 1});
    }
    // Room creation code first, then each instance's Create event in placement order.
    const roomCreates = room => [...new Set([room.creation, ...room.instances.flatMap(i => [i.creation, 'gml_Object_' + i.name + '_Create_0'])])].filter(n => n && code[n]);
    const evidence = [];let party = null,source = null;
    for (const t of triggers) {
      const object = t.name.match(/^gml_Object_(.+)_[A-Za-z]+_\d+$/)?.[1];
      const roomIndex = rooms.findIndex(r => r.instances.some(i => i.name === object) || r.creation === t.name);
      const room = rooms[roomIndex];
      let state = [1, 0, 0],determined = false;const assigned = new Set();
      const run = (s, where) => {
        state = apply(state, s.match);if (s.match[2] !== undefined) assigned.add(s.match[2]);
        determined ||= determines(s.text, assigned);evidence.push(`${where}:${s.line} ${s.text}`);
      };
      if (room) for (const c of roomCreates(room)) for (const s of partyStatements(code[c])) run(s, `${room.name}: ${c}`);
      // Changes earlier in the triggering event (same cutscene) apply before the battle starts.
      for (const s of partyStatements(code[t.name], t.line)) run(s, t.name);
      evidence.push(`trigger ${t.name}:${t.line}${room ? ' in ' + room.name : ''}`);
      if (determined && !party) {party = state;source = 'battle room or trigger';}
      // Otherwise the party carries over: take the nearest earlier room (data order follows the story) that fixes it.
      if (!determined && !party && roomIndex > 0) {
        for (let i = roomIndex - 1; i >= 0 && !party; i--) {
          let inherited = [1, 0, 0],fixed = false;const lines = [];const slots = new Set();
          for (const c of roomCreates(rooms[i])) for (const s of partyStatements(code[c])) {
            inherited = apply(inherited, s.match);if (s.match[2] !== undefined) slots.add(s.match[2]);fixed ||= determines(s.text, slots);lines.push(`${rooms[i].name}: ${c}:${s.line} ${s.text}`);
          }
          if (fixed) {
            // Cutscene changes before the trigger still apply on top of the inherited party.
            for (const s of partyStatements(code[t.name], t.line)) inherited = apply(inherited, s.match);
            party = inherited;source = 'inherited from ' + rooms[i].name;evidence.push(...lines.map(l => 'inherited ' + l));
          }
        }
      }
    }
    result[record.id] = {name: record.name, party: party && party.slice(0), members: party?.filter(Boolean).map(id => NAMES[id]), source: source ?? 'undetermined', evidence};
  }
}
const out = path.join(root, 'docs/encounter-parties.json');
fs.writeFileSync(out, JSON.stringify(result, null, 1) + '\n');
for (const [id, r] of Object.entries(result)) console.log(id.padEnd(9), (r.members?.join('+') ?? 'UNDETERMINED').padEnd(22), r.name.padEnd(26), r.source);
