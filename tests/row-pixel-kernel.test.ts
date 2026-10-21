import {expect, it, vi} from 'vitest';
import {compositeAddRows} from '../src/remake/host/row-pixel-kernel';

type Pixels = {width:number;height:number;data:Uint8ClampedArray};
function oracle(source:Pixels,destination:Pixels,offsets:Float64Array,color:number,alpha:number) {
  const {width,height}=source;
  for(let y=0;y<height;y++) {
    const offset=offsets[y];
    for(let x=Math.max(0,Math.ceil(offset-.5));x<Math.min(width,Math.ceil(offset+width-.5));x++) {
      const sx=Math.max(0,Math.min(width-1,Math.floor(x+.5-offset)));
      const s=(y*width+sx)*4,d=(y*width+x)*4;
      const sa=source.data[s+3]/255*Math.max(0,Math.min(1,alpha));
      for(let c=0;c<3;c++) destination.data[d+c]=Math.round(source.data[s+c]*(((color>>>(c*8))&255)/255)*sa+destination.data[d+c]);
      destination.data[d+3]=Math.round(255*(sa*sa+destination.data[d+3]/255));
    }
  }
}
let seed=0x93a84f21;
function random() { seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296; }
function pixels(width:number,height:number):Pixels {
  return {width,height,data:Uint8ClampedArray.from({length:width*height*4},()=>Math.floor(random()*256))};
}
function compare(width:number,height:number,offsets:Float64Array,color:number,alpha:number) {
  const source=pixels(width,height),destination=pixels(width,height);
  const expected={...destination,data:destination.data.slice()};
  oracle(source,expected,offsets,color,alpha);
  expect(compositeAddRows(source,destination,offsets,color,alpha)).toBe(true);
  expect(destination.data).toEqual(expected.data);
}
it('matches the JS additive row oracle with fractional offsets, tints, clipping and saturation',()=>{
  for(let i=0;i<100;i++) {
    const width=1+Math.floor(random()*67),height=1+Math.floor(random()*17);
    compare(width,height,Float64Array.from({length:height},()=>random()*width*4-width*2),Math.floor(random()*0x1000000),random()*1.6-.3);
  }
});
it('preserves deterministic roar alpha and half-pixel coverage boundaries',()=>{
  for(const alpha of [0,1,.9807852804032304,.5,1/255]) {
    for(const color of [0,0xffffff,0x123456,0xff0080]) {
      compare(17,14,Float64Array.from([0,.5,-.5,.49999999999999994,-.5000000000000001,.5000000000000001,-.49999999999999994,1,-1,17,-17,1e100,-1e100,2.25]),color,alpha);
      compare(1,5,Float64Array.from([0,.5,-.5,.2,-.2]),color,alpha);
    }
  }
});
it('matches exact RGB half boundaries and their adjacent double values',()=>{
  const source={width:256,height:256,data:new Uint8ClampedArray(256*256*4)};
  for(let y=0;y<256;y++) for(let x=0;x<256;x++) {
    const s=(y*256+x)*4;source.data.set([x,y,255-x,255],s);
  }
  for(const alpha of [.5,.5-Number.EPSILON,.5+Number.EPSILON,.9807852804032304]) {
    const destination={width:256,height:256,data:new Uint8ClampedArray(source.data.length)};
    const expected={...destination,data:destination.data.slice()},offsets=new Float64Array(256);
    oracle(source,expected,offsets,0xf1a453,alpha);
    expect(compositeAddRows(source,destination,offsets,0xf1a453,alpha)).toBe(true);
    expect(destination.data).toEqual(expected.data);
  }
});
it('treats transparent pixels as no-ops and keeps source bytes unchanged',()=>{
  const source=pixels(8,3),destination=pixels(8,3),original=destination.data.slice();
  for(let i=3;i<source.data.length;i+=4) source.data[i]=0;
  const before=source.data.slice();
  expect(compositeAddRows(source,destination,new Float64Array(3),0xffffff,.9807852804032304)).toBe(true);
  expect(destination.data).toEqual(original);expect(source.data).toEqual(before);
});
it('snapshots source and destination independently when the caller aliases them',()=>{
  const image=pixels(19,7),source={...image,data:image.data.slice()},expected={...image,data:image.data.slice()};
  const offsets=Float64Array.from([1,-1,.5,-.5,2.25,-2.25,0]);
  oracle(source,expected,offsets,0xd038ab,.9807852804032304);
  expect(compositeAddRows(image,image,offsets,0xd038ab,.9807852804032304)).toBe(true);
  expect(image.data).toEqual(expected.data);
});
it('declines unsupported dimensions, offsets, alpha and memory sizes without touching destination',()=>{
  const source=pixels(2,2),destination=pixels(2,2),original=destination.data.slice();
  expect(compositeAddRows({...source,width:1},destination,new Float64Array(2),0,1)).toBe(false);
  expect(compositeAddRows(source,destination,new Float64Array(1),0,1)).toBe(false);
  expect(compositeAddRows(source,destination,Float64Array.of(0,NaN),0,1)).toBe(false);
  expect(compositeAddRows(source,destination,new Float64Array(2),0,NaN)).toBe(false);
  const large=pixels(1100,1000);
  expect(compositeAddRows(large,large,new Float64Array(1000),0,1)).toBe(false);
  expect(destination.data).toEqual(original);
});
it('returns false without touching destination when WASM is unavailable',async()=>{
  vi.resetModules();vi.stubGlobal('WebAssembly',undefined);
  try {
    const {compositeAddRows:unavailable}=await import('../src/remake/host/row-pixel-kernel');
    const source=pixels(2,2),destination=pixels(2,2),original=destination.data.slice();
    expect(unavailable(source,destination,new Float64Array(2),0xffffff,1)).toBe(false);
    expect(destination.data).toEqual(original);
  } finally { vi.unstubAllGlobals();vi.resetModules(); }
});
