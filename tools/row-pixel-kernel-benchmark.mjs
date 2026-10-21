// Node-only timing of the batch including all buffer copies; no browser/game launch.
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {stripTypeScriptTypes} from 'node:module';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const bytes=readFileSync(path.join(root,'src/remake/host/row-pixel-kernel-bytes.ts'),'utf8');
const wrapper=readFileSync(path.join(root,'src/remake/host/row-pixel-kernel.ts'),'utf8').replace(/^import[^\n]+\n/,'');
const javascript=stripTypeScriptTypes(bytes+'\n'+wrapper);
const {compositeAddRows}=await import('data:text/javascript;base64,'+Buffer.from(javascript).toString('base64'));
const width=640,height=480;
let seed=0xab983102;
function randomByte() { seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed&255; }
const source={width,height,data:Uint8ClampedArray.from({length:width*height*4},randomByte)};
const destination={width,height,data:Uint8ClampedArray.from({length:width*height*4},randomByte)};
const original=destination.data.slice(),offsets=Float64Array.from({length:height},(_,y)=>Math.sin(y/17)*12);
const color=0xc397eb,alpha=.9807852804032304;
function oracle() {
  for(let y=0;y<height;y++) {
    const offset=offsets[y];
    for(let x=Math.max(0,Math.ceil(offset-.5));x<Math.min(width,Math.ceil(offset+width-.5));x++) {
      const sx=Math.max(0,Math.min(width-1,Math.floor(x+.5-offset)));
      const s=(y*width+sx)*4,d=(y*width+x)*4,sa=source.data[s+3]/255*alpha;
      for(let c=0;c<3;c++) destination.data[d+c]=Math.round(source.data[s+c]*(((color>>>(c*8))&255)/255)*sa+destination.data[d+c]);
      destination.data[d+3]=Math.round(255*(sa*sa+destination.data[d+3]/255));
    }
  }
}
function wasm() {
  if(!compositeAddRows(source,destination,offsets,color,alpha)) throw new Error('WASM kernel unavailable');
}
function measure(fn,iterations) {
  for(let i=0;i<10;i++) { destination.data.set(original);fn(); }
  let elapsed=0;
  for(let i=0;i<iterations;i++) {
    destination.data.set(original);
    const start=performance.now();fn();elapsed+=performance.now()-start;
  }
  return elapsed/iterations;
}
const jsMs=measure(oracle,60),wasmMs=measure(wasm,60);
console.log(JSON.stringify({width,height,iterations:60,jsMs,wasmMs,speedup:jsMs/wasmMs},null,2));
