// Records every original scr_battle(...) call for the catalogued encounters, with surrounding source,
// so the native launcher can reuse the game's own special-battle mode and battle music.
// Output: extracted/chapterN_windows/battle-calls.json. Usage: node tools/extract-battle-calls.mjs
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const records = JSON.parse(fs.readFileSync(path.join(root, 'src/bosses/catalog.json'), 'utf8'));
for (let chapter = 1; chapter <= 5; chapter++) {
  const dir = path.join(root, `extracted/chapter${chapter}_windows/code`);
  const ids = records.filter(r => r.chapter === chapter && r.encounter >= 0).map(r => r.encounter);
  const call = new RegExp(`scr_battle\\(\\s*(${ids.join('|')})\\s*,[^;]+`, 'g');
  const refs = [];
  for (const file of fs.readdirSync(dir)) {
    const source = fs.readFileSync(path.join(dir, file), 'utf8');
    for (const m of source.matchAll(call)) refs.push({file, call: m[0], offset: m.index, context: source.slice(Math.max(0, m.index - 350), m.index + 150)});
  }
  fs.writeFileSync(path.join(root, `extracted/chapter${chapter}_windows/battle-calls.json`), JSON.stringify(refs, null, 2));
  console.log(`Chapter ${chapter}: ${refs.length} original battle calls`);
}
