// Serves the original-bytecode battle player under /native/ from the local game install.
// Shared by the Vite dev/preview servers (same origin as the app) and tools/native-server.mjs.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const defaultGameDir = () => path.resolve(process.env.DELTARUNE_DIR ?? 'C:/Program Files (x86)/Steam/steamapps/common/DELTARUNE');
// Encounters the native launcher cannot start yet; available source ports remain the browser fallback.
export const NATIVE_UNSUPPORTED = new Set([]);
// Chapter 3 action encounters run in their own original rooms instead of scr_battle (see build-native-launcher.csx).
const ACTION_ROOMS = {'ch3-mantle': {room: 'shadowmantle', code: /shadow_?mantle|board_controller/i}, 'ch3-susiezilla': {room: 'susiezilla', code: /susiezilla|ch3_GSC05/i}};

export async function nativeProfiles(root = projectRoot) {
  const catalog = JSON.parse(await fs.readFile(path.join(root, 'src/bosses/catalog.json'), 'utf8'));
  // Source party per encounter (src/bosses/parties.json, evidence in docs/encounter-parties.json).
  const parties = JSON.parse(await fs.readFile(path.join(root, 'src/bosses/parties.json'), 'utf8'));
  const profiles = {};
  for (let chapter = 1; chapter <= 5; chapter++) {
    const calls = JSON.parse(await fs.readFile(path.join(root, `extracted/chapter${chapter}_windows/battle-calls.json`), 'utf8'));
    for (const record of catalog.filter(r => r.chapter === chapter && !NATIVE_UNSUPPORTED.has(r.id))) {
      const call = calls.find(c => new RegExp(`scr_battle\\(${record.encounter},`).test(c.call));
      const special = Number(call?.call.match(/scr_battle\(\d+,\s*(\d+)/)?.[1] ?? 0);
      const music = [...(call?.context ?? '').matchAll(/snd_init\("([^"]+\.ogg)"\)/g)].at(-1)?.[1] ?? 'battle.ogg';
      const party = parties[record.id]?.party;
      if (!Array.isArray(party) || party.length !== 3 || !party[0]) throw Error('No source party for ' + record.id);
      const action = ACTION_ROOMS[record.id];
      profiles[record.id] = {id: record.id, name: record.name, chapter, encounter: Math.max(record.encounter, 0), special, music, party, ...(action ? {room: action.room} : {}), sourceCall: call?.file ?? null, fullParity: false};
    }
  }
  profiles['ch1-25'] = {...profiles['ch1-25'], special: 3, music: 'joker.ogg', sourceCall: 'gml_Object_obj_con24_Step_0.gml', originalRoom: 'room_cc_joker'};
  return {catalog, profiles};
}

async function listFiles(folder, prefix = '') {
  const result = [];
  for (const entry of await fs.readdir(folder, {withFileTypes: true})) {
    const name = prefix + entry.name;
    if (entry.isDirectory()) { if (entry.name !== 'vid') result.push(...await listFiles(path.join(folder, entry.name), name + '/')); }
    else result.push(name);
  }
  return result;
}

const playerHtml = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>UnderRune native battle</title><style>html,body{margin:0;background:#000;color:#ddd;font:12px monospace;height:100%;overflow:hidden}canvas{display:block;width:100%;height:100%;object-fit:contain;image-rendering:pixelated;outline:0}#state{position:absolute;inset:0;display:grid;place-content:center;text-align:center;background:#000;padding:30px;line-height:1.8}#state[hidden]{display:none}#issues{position:absolute;bottom:0;left:0;right:0;background:#151015e8;color:#ffc791;font-size:10px;padding:5px;max-height:50px;overflow:auto}#issues:empty,#issues[hidden]{display:none}</style></head><body><canvas id="canvas" width="640" height="480" tabindex="0" aria-label="Original DELTARUNE battle"></canvas><div id="state">* PREPARING THE BATTLE LAUNCHER…</div><div id="issues" role="status" hidden></div><script type="module" src="/native/player.mjs"></script></body></html>';
const types = {'.mjs': 'text/javascript; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.wasm': 'application/wasm', '.json': 'application/json; charset=utf-8', '.ogg': 'audio/ogg'};

// Connect-style middleware: handles /native/* and passes everything else to next().
export function createNativeHandler({root = projectRoot, game = defaultGameDir()} = {}) {
  let setup;
  const prepare = () => setup ??= (async () => {
    const {catalog, profiles} = await nativeProfiles(root);
    const fileLists = Object.fromEntries(await Promise.all([1, 2, 3, 4, 5].map(async c => [c, await listFiles(path.join(game, `chapter${c}_windows`))])));
    const musicFiles = new Set(await fs.readdir(path.join(game, 'mus')));
    // Every track a chapter ever assigns as battle music (scr_battle tables, intro objects, parent enemies).
    // They are few (8-25 MB per chapter), so each battle gets all of them and never misses its theme.
    const battleMusic = Object.fromEntries(await Promise.all([1, 2, 3, 4, 5].map(async c => {
      const dir = path.join(root, `extracted/chapter${c}_windows/code`), found = new Set();
      for (const file of await fs.readdir(dir)) {
        const gml = await fs.readFile(path.join(dir, file), 'utf8');
        if (!gml.includes('batmusic')) continue;
        for (const m of gml.matchAll(/batmusic(?:\[0\])?\s*=\s*(?:snd_init\()?"([^"/]+\.ogg)"/g)) found.add(m[1]);
      }
      return [c, found];
    })));
    return {catalog, profiles, fileLists, musicFiles, battleMusic};
  })().catch(error => { setup = undefined; throw error; });
  return async (req, res, next) => {
    const url = new URL(req.url, 'http://127.0.0.1');
    if (!url.pathname.startsWith('/native')) return next?.();
    const send = (body, type, status = 200) => { res.writeHead(status, {'Content-Type': type, 'Cache-Control': 'no-store'}); res.end(body); };
    try {
      if (url.pathname === '/native/' || url.pathname === '/native') return send(playerHtml, 'text/html; charset=utf-8');
      if (url.pathname === '/native/player.mjs') return send(await fs.readFile(path.join(root, 'tools/native-player.mjs')), types['.mjs']);
      const {catalog, profiles, fileLists, musicFiles, battleMusic} = await prepare();
      if (url.pathname === '/native/profiles') return send(JSON.stringify(Object.keys(profiles)), types['.json']);
      if (url.pathname === '/native/config') {
        const profile = profiles[url.searchParams.get('id')];
        if (!profile) return send('No original-engine launcher for this encounter.', 'text/plain; charset=utf-8', 404);
        const music = new Set([profile.music, 'AUDIO_DRONE.ogg', ...battleMusic[profile.chapter]]);
        const dir = path.join(root, `extracted/chapter${profile.chapter}_windows/code`), record = catalog.find(r => r.id === profile.id);
        const objects = record.enemies.map(e => e.object);
        if (profile.originalRoom) objects.push('obj_con24');
        const actionCode = ACTION_ROOMS[profile.id]?.code;
        for (const file of await fs.readdir(dir)) if (objects.some(o => file.startsWith('gml_Object_' + o + '_')) || (actionCode && actionCode.test(file))) {
          const gml = await fs.readFile(path.join(dir, file), 'utf8');
          for (const match of gml.matchAll(/"([^"/]+\.ogg)"/g)) music.add(match[1]);
        }
        return send(JSON.stringify({...profile, files: fileLists[profile.chapter], musicFiles: [...music].filter(m => musicFiles.has(m))}), types['.json']);
      }
      if (url.pathname.startsWith('/native/package/')) {
        const chapter = Number(url.pathname.split('/').at(-1));
        if (!Number.isInteger(chapter) || chapter < 1 || chapter > 5) return send('Invalid chapter.', 'text/plain; charset=utf-8', 404);
        return send(await fs.readFile(path.join(root, `.tools/native-launchers/chapter${chapter}.win`)), 'application/octet-stream');
      }
      const prefixes = {'/native/game/': game, '/native/browser-engine/': path.join(root, '.tools/butterscotch-browser-current-build'), '/native/portable-engine/': path.join(root, '.tools/butterscotch-portable-build')};
      for (const [prefix, base] of Object.entries(prefixes)) if (url.pathname.startsWith(prefix)) {
        const target = path.resolve(base, decodeURIComponent(url.pathname.slice(prefix.length)));
        if (!target.startsWith(base + path.sep)) return send('Invalid path.', 'text/plain; charset=utf-8', 404);
        return send(await fs.readFile(target), types[path.extname(target)] ?? 'application/octet-stream');
      }
      send('Not found.', 'text/plain; charset=utf-8', 404);
    } catch (error) {
      send('Local file not found: ' + (error.code === 'ENOENT' ? path.basename(error.path ?? '') : error.message), 'text/plain; charset=utf-8', 404);
    }
  };
}

// Vite plugin: serves /native/ on the same origin as the app so postMessage origin checks hold.
export function underruneNative(options) {
  const attach = server => { const handler = createNativeHandler(options); server.middlewares.use((req, res, next) => { handler(req, res, next).catch(next); }); };
  return {name: 'underrune-native', configureServer: attach, configurePreviewServer: attach};
}
