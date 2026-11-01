import {describe,it,expect} from 'vitest';
import fs from 'node:fs';
/**
 * The battle box keeps its border width at any size only because spr_battlebg_stretch (2 px corners) and its hitbox
 * (4 px) are nine-slice sprites. A sprite export made before nine-slice metadata was kept (Chapters 3 and 4 until
 * 2026-11-01) stretched the Knight's 3x2 sword-tunnel box, with side borders 1.5x thicker than top and bottom.
 * Re-export with tools/utmt/export-sprites.csx and rerun tools/build-remake-assets.mjs if this fails.
 */
const corners=(text:string,name:string)=>{
 const start=text.indexOf(`"name":"${name}"`);if(start<0)return undefined;
 const end=text.indexOf('"masks"',start),entry=text.slice(start,end<0?start+2000:end);
 return /"nineSlice":\{"enabled":true,"left":(\d+)/.exec(entry)?.[1];
};
for(const chapter of [2,3,4]){
 const file=`public/generated/remake/ch${chapter}/bundle.json`;
 describe.skipIf(!fs.existsSync(file))(`Chapter ${chapter} sprite bundle`,()=>{
  it('keeps the battle box nine-slice metadata',()=>{
   const text=fs.readFileSync(file,'utf8');
   expect(corners(text,'spr_battlebg_stretch')).toBe('2');
   expect(corners(text,'spr_battlebg_stretch_hitbox')).toBe('4');
  });
 });
}
