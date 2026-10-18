// Packs what the remake draws and collides with into a per-chapter bundle for the site:
// every sprite named in src/remake (frames cut from the maintainer's own texture pages into atlas pages,
// plus collision data) and the fonts it uses. Output goes to public/generated/remake/ch<N>/ (git-ignored;
// published only with the Pages build). Usage: node tools/build-remake-assets.mjs [chapter]
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import {fileURLToPath} from 'node:url';
import {parseSounds,embeddedAudio} from './sound-assets.mjs';
import {localizationDefaults} from './source-localization.mjs';
import {referencedLiterals,referencedTextKeys} from './remake-text-keys.mjs';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const chapter = Number(process.argv[2] ?? 1);
const base = path.join(root, 'extracted', `chapter${chapter}_windows`);
const out = path.join(root, 'public', 'generated', 'remake', `ch${chapter}`);
if(!Number.isInteger(chapter)||chapter<1||chapter>5||!out.startsWith(path.join(root,'public','generated','remake')+path.sep))throw Error('Invalid chapter output path.');
const index = JSON.parse(await fs.readFile(path.join(base, 'index.json'), 'utf8'));
const collision = JSON.parse(await fs.readFile(path.join(base, 'sprites.json'), 'utf8'));

async function sources(dir) {
  const files = [];
  for (const e of await fs.readdir(dir, {withFileTypes: true})) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...await sources(p)); else if (p.endsWith('.ts')) files.push(p);
  }
  return files;
}
// Enemy ports belong to a source chapter. New Chapter 2 primitives must not pull their sprites into Chapter 1.
const bossChapters={lancer:1,clover:1,kround:1,jevil:1,king:1,'spamton-neo':2,'chapter2-field':2,'chapter2-rivals':2,queen:2,spamton:2,'roaring-knight':3};
const remakeRoot=path.join(root,'src','remake');
const chapterSources=(await sources(remakeRoot)).filter(file=>{
 const parts=path.relative(remakeRoot,file).split(path.sep);
 return parts[0]!=='bosses'||bossChapters[parts[1]]===undefined||bossChapters[parts[1]]===chapter;
});
const text = (await Promise.all(chapterSources.map(f => fs.readFile(f, 'utf8')))).join('\n');
// GameMaker 2 stores backgrounds (bg_) as sprites too.
const names = new Set(text.match(/\b(?:spr|bg|IMAGE)_[A-Za-z0-9_]+/g) ?? []);
// Sprite fonts the code names through font_add_sprite_ext, and bitmap fonts by name.
// Sprite fonts made with font_add_sprite_ext: damage numbers, and global.hpfont (its map is the digits plus - and +).
const spriteFonts = {damagefont: {sprite: 'spr_numbersfontbig', map: '0123456789', proportional: true, sep: 0}, hpfont: {sprite: 'spr_numbersfontsmall', map: '0123456789-+', proportional: false, sep: 2}};
// From Chapter 2, mercy is shown in gold digits (global.damagefontgold).
if (chapter >= 2) spriteFonts.damagefontgold = {sprite: 'spr_numbersfontbig_gold', map: '0123456789+-%', proportional: true, sep: 0};
for (const f of Object.values(spriteFonts)) names.add(f.sprite);
const fontNames = new Set(text.match(/\bfnt_[A-Za-z0-9_]+/g) ?? []);

// Shelf packing into 2048x2048 pages, tallest frames first.
const SIZE = 2048, PAD = 1;
const pieces = [];
for (const s of index.sprites) {
  if (!names.has(s.name)) continue;
  s.frames.forEach((t, frame) => { if (t && t.sw && t.sh) pieces.push({sprite: s.name, frame, t}); });
}
pieces.sort((a, b) => b.t.sh - a.t.sh || b.t.sw - a.t.sw);
const pages = [];
let page = null;
for (const p of pieces) {
  if (!page || (page.x + p.t.sw > SIZE && page.y + page.row + p.t.sh + PAD > SIZE)) { page = {x: 0, y: 0, row: 0, items: []}; pages.push(page); }
  if (page.x + p.t.sw > SIZE) { page.x = 0; page.y += page.row + PAD; page.row = 0; }
  p.at = {page: pages.length - 1, x: page.x, y: page.y};
  page.items.push(p); page.x += p.t.sw + PAD; page.row = Math.max(page.row, p.t.sh);
}
await fs.rm(out, {recursive: true, force: true});
await fs.mkdir(out, {recursive: true});
for (const [i, pg] of pages.entries()) {
  const height = pg.y + pg.row;
  const layers = await Promise.all(pg.items.map(async p => {
    const frame=sharp(path.join(base,'textures',`${p.t.page}.png`)).extract({left:p.t.sx,top:p.t.sy,width:p.t.sw,height:p.t.sh});
    const rgba=await frame.clone().ensureAlpha().raw().toBuffer();
    // Canvas decoding loses RGB under alpha zero. Only attest black when the original source proves it;
    // atlas compositing alone is not evidence because it can erase nonblack transparent source texels.
    p.alphaZeroRgb='black';
    for(let j=0;j<rgba.length;j+=4)if(rgba[j+3]===0&&(rgba[j]!==0||rgba[j+1]!==0||rgba[j+2]!==0)){p.alphaZeroRgb=undefined;break;}
    return {input:await frame.png().toBuffer(),left:p.at.x,top:p.at.y};
  }));
  await sharp({create: {width: SIZE, height: Math.max(1, height), channels: 4, background: {r: 0, g: 0, b: 0, alpha: 0}}}).composite(layers).png().toFile(path.join(out, `atlas${i}.png`));
}
const frameOf = new Map(pieces.map(p => [`${p.sprite}:${p.frame}`, p]));
const sprites = collision.sprites.filter(s => names.has(s.name)).map(s => {
  const meta = index.sprites.find(x => x.name === s.name);
  return {...s, frames: undefined, frameCount: s.frames, frameRects: (meta?.frames ?? []).map((t, f) => {
    const p = frameOf.get(`${s.name}:${f}`); if (!p) return null;
    return {page: p.at.page, sx: p.at.x, sy: p.at.y, sw: t.sw, sh: t.sh, tx: t.tx, ty: t.ty, tw: t.tw, th: t.th,alphaZeroRgb:p.alphaZeroRgb};
  })};
}).map(({frames, frameCount, ...s}) => ({...s, frames: frameCount}));
// Bitmap fonts get their own page images.
const fonts = {...Object.fromEntries(Object.entries(spriteFonts).map(([k, v]) => [k, {kind: 'sprite', ...v}]))};
for (const name of fontNames) {
  const font = index.fonts.find(f => f.name === name); if (!font) continue;
  const right = Math.max(...font.glyphs.map(g => g.x + g.w)), bottom = Math.max(...font.glyphs.map(g => g.y + g.h));
  const file = `${name}.png`;
  await sharp(path.join(base, 'textures', `${font.page}.png`)).extract({left: font.sx, top: font.sy, width: right, height: bottom}).png().toFile(path.join(out, file));
  fonts[name] = {kind: 'bitmap', image: file, size: font.size, glyphs: Object.fromEntries(font.glyphs.map(g => [g.charCode, {x: g.x, y: g.y, w: g.w, h: g.h, shift: g.shift, offset: g.offset}]))};
}
const missing = [...names].filter(n => !sprites.some(s => s.name === n));
const gameRoot=process.env.DELTARUNE_DIR??'C:/Program Files (x86)/Steam/steamapps/common/DELTARUNE';
const gameChapter=path.join(gameRoot,`chapter${chapter}_windows`),data=await fs.readFile(path.join(gameChapter,'data.win'));
const soundNames=new Set(text.match(/\bsnd_[A-Za-z0-9_]+/g)??[]),sounds={},banks=new Map([[0,data]]);
await fs.mkdir(path.join(out,'sounds'),{recursive:true});
for(const sound of parseSounds(data,soundNames)){
 if(!/^snd_[A-Za-z0-9_]+$/.test(sound.name)||sound.group<0||sound.volume<0||!Number.isFinite(sound.pitch))throw Error('Invalid sound metadata');
 if(sound.audio>=0&&!banks.has(sound.group))banks.set(sound.group,await fs.readFile(path.join(gameChapter,`audiogroup${sound.group}.dat`)));
 const sample=sound.audio===-1?await fs.readFile(path.join(gameChapter,sound.name+'.ogg')):embeddedAudio(banks.get(sound.group),sound.audio),format=sample.toString('ascii',0,4),extension=format==='RIFF'?'wav':format==='OggS'?'ogg':null;if(!extension)throw Error('Unsupported source audio: '+sound.name);
 const file=`sounds/${sound.name}.${extension}`;await fs.writeFile(path.join(out,file),sample);sounds[sound.name]={file,volume:sound.volume,pitch:sound.pitch};
}
// Dialogue lines named in src/remake/host/text-keys.json, from the same language file the game loads.
const keySet=new Set(JSON.parse(await fs.readFile(path.join(root, 'src', 'remake', 'host', 'text-keys.json'), 'utf8'))[`chapter${chapter}`]??[]);
if(chapter===2){for(const key of JSON.parse(await fs.readFile(path.join(root,'src/remake/deltarune/text-keys-ch2.json'),'utf8')).chapter2)keySet.add(key);}
let lang={};
if(chapter>=2){for(const file of await fs.readdir(path.join(base,'code')))if(file.endsWith('.gml'))Object.assign(lang,localizationDefaults(await fs.readFile(path.join(base,'code',file),'utf8')));}
try{Object.assign(lang,JSON.parse((await fs.readFile(path.join(gameChapter,'lang','lang_en.json'),'utf8')).replace(/^\uFEFF/,'')));}catch(error){if(error.code!=='ENOENT'||chapter<2)throw error;}
if(chapter>=2)for(const key of referencedTextKeys(text,lang))keySet.add(key);
const textKeys=[...keySet];
const gameText = {};
for (const key of textKeys) { if (typeof lang[key] !== 'string') throw Error('Game text not found: ' + key); gameText[key] = lang[key]; }
// Plain literals in the game's code (`<code file>#<n>`), read from this chapter's extracted code.
if(chapter>=2)Object.assign(gameText,await referencedLiterals(text,path.join(base,'code')));
await fs.writeFile(path.join(out, 'bundle.json'), JSON.stringify({
  chapter, atLeast2022_1: collision.atLeast2022_1, optionsInfo: collision.optionsInfo,
  pages: pages.map((_, i) => `atlas${i}.png`), sprites, fonts, sounds, text: gameText,
}));
console.log(`chapter ${chapter}: ${sprites.length} sprites, ${pieces.length} frames on ${pages.length} atlas pages, ${Object.keys(fonts).length} fonts` + (missing.length ? `; not found: ${missing.join(' ')}` : ''));
console.log(`${Object.keys(sounds).length} original sound effects extracted from their source audio banks, ${textKeys.length} dialogue lines`);
