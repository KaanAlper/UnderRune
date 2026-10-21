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
  const src=source.data.buffer===destination.data.buffer?source.data.slice(0,size):source.data,dst=destination.data;
  const src32=new Uint32Array(src.buffer,src.byteOffset,width*height),dst32=new Uint32Array(dst.buffer,dst.byteOffset,width*height);
  const ar=Math.max(0,Math.min(1,alpha)),tr=(color&255)/255,tg=((color>>>8)&255)/255,tb=((color>>>16)&255)/255;
  const tinted0=new Float64Array(256),tinted1=new Float64Array(256),tinted2=new Float64Array(256);
  const alphas=new Float64Array(256),sqAlphas=new Float64Array(256),norm=new Float64Array(256);
  const zero0=new Uint8Array(256),zero1=new Uint8Array(256),zero2=new Uint8Array(256);
  for(let v=0;v<256;v++){
    norm[v]=v/255;const sa=norm[v]*ar;alphas[v]=sa;sqAlphas[v]=sa*sa;
    tinted0[v]=v*tr;tinted1[v]=v*tg;tinted2[v]=v*tb;
    zero0[v]=Math.min(255,Math.round(tinted0[v]*ar));
    zero1[v]=Math.min(255,Math.round(tinted1[v]*ar));
    zero2[v]=Math.min(255,Math.round(tinted2[v]*ar));
  }
  const fullAlpha=Math.min(255,Math.round(255*(sqAlphas[255]+1)));
  for(let y=0;y<height;y++){
    const offset=offsets[y],start=Math.max(0,Math.ceil(offset-.5)),end=Math.min(width,Math.ceil(offset+width-.5)),row=y*width;
    const base=.5-offset,delta=Math.floor(base),frac=base-delta;
    if(frac>1e-9&&frac<1-1e-9){
      for(let x=start,sp=row+start+delta,dp=row+start;x<end;x++,sp++,dp++){
        const sv=src32[sp];if(sv===0)continue;
        const dv=dst32[dp];if((sv&0x00ffffff)===0&&(dv&0xff000000)===0xff000000)continue;
        const s=sp*4,d=dp*4,aByte=sv>>>24;
        if(aByte===255&&dv===0xff000000){
          dst[d]=zero0[sv&255];dst[d+1]=zero1[(sv>>>8)&255];dst[d+2]=zero2[(sv>>>16)&255];dst[d+3]=fullAlpha;continue;
        }
        const sa=alphas[aByte];
        dst[d]=Math.round(tinted0[src[s]]*sa+dst[d]);
        dst[d+1]=Math.round(tinted1[src[s+1]]*sa+dst[d+1]);
        dst[d+2]=Math.round(tinted2[src[s+2]]*sa+dst[d+2]);
        dst[d+3]=Math.round(255*(sqAlphas[aByte]+norm[dst[d+3]]));
      }
      continue;
    }
    for(let x=start;x<end;x++){
      const sx=Math.max(0,Math.min(width-1,Math.floor(x+.5-offset))),sp=row+sx,sv=src32[sp];
      if(sv===0)continue;
      const dp=row+x,dv=dst32[dp];if((sv&0x00ffffff)===0&&(dv&0xff000000)===0xff000000)continue;
      const s=sp*4,d=dp*4,aByte=sv>>>24;
      if(aByte===255&&dv===0xff000000){
        dst[d]=zero0[sv&255];dst[d+1]=zero1[(sv>>>8)&255];dst[d+2]=zero2[(sv>>>16)&255];dst[d+3]=fullAlpha;continue;
      }
      const sa=alphas[aByte];
      dst[d]=Math.round(tinted0[src[s]]*sa+dst[d]);
      dst[d+1]=Math.round(tinted1[src[s+1]]*sa+dst[d+1]);
      dst[d+2]=Math.round(tinted2[src[s+2]]*sa+dst[d+2]);
      dst[d+3]=Math.round(255*(sqAlphas[aByte]+norm[dst[d+3]]));
    }
  }
  return true;
}
