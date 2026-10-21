import {rowPixelKernelBytes} from './row-pixel-kernel-bytes';

export type RowPixelImage = {width:number;height:number;data:Uint8ClampedArray};
type KernelExports = {
  memory:WebAssembly.Memory;
  __heap_base:WebAssembly.Global;
  composite_add_rows:(source:number,destination:number,offsets:number,width:number,height:number,color:number,alpha:number)=>void;
};
let kernel:KernelExports|null|undefined;
let bytes:Uint8Array;
let doubles:Float64Array;

function getKernel():KernelExports|null {
  if(kernel!==undefined) return kernel;
  kernel=null;
  try {
    if(typeof WebAssembly==='undefined') return null;
    const module=new WebAssembly.Module(rowPixelKernelBytes);
    const exports=new WebAssembly.Instance(module).exports as KernelExports;
    bytes=new Uint8Array(exports.memory.buffer);
    doubles=new Float64Array(exports.memory.buffer);
    kernel=exports;
  } catch { /* CSP or browsers without WASM keep the existing pixel path. */ }
  return kernel;
}

/** Same-size unit-scale additive row batch; false leaves destination untouched.
 * Uses one synchronous reusable 8 MiB memory, copying source/destination in once
 * and destination out once. Unsupported inputs retain the caller's fallback. */
export function compositeAddRows(source:RowPixelImage,destination:RowPixelImage,offsets:Float64Array,color:number,alpha:number):boolean {
  const {width,height}=source;
  if(!Number.isSafeInteger(width)||!Number.isSafeInteger(height)||width<=0||height<=0||
     destination.width!==width||destination.height!==height||offsets.length<height||!Number.isFinite(alpha)) return false;
  const size=width*height*4;
  if(!Number.isSafeInteger(size)||source.data.length<size||destination.data.length<size||size*2+height*8>8388608-65536) return false;
  for(let y=0;y<height;y++) if(!Number.isFinite(offsets[y])) return false;
  const active=getKernel();
  if(!active) return false;
  const start=Number(active.__heap_base.value),destinationStart=start+size,offsetStart=destinationStart+size;
  if(offsetStart+height*8>bytes.length) return false;
  try {
    bytes.set(source.data.subarray(0,size),start);
    bytes.set(destination.data.subarray(0,size),destinationStart);
    doubles.set(offsets.subarray(0,height),offsetStart/8);
    active.composite_add_rows(start,destinationStart,offsetStart,width,height,color,Math.max(0,Math.min(1,alpha)));
    destination.data.set(bytes.subarray(destinationStart,destinationStart+size));
    return true;
  } catch { return false; }
}
