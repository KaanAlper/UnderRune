// Read-only Chapter 1 SOND/AUDO extraction. Layout follows the pinned data_win.c parser.
import {inspectPackage} from './source-manifest.mjs';
function chunks(bytes){const b=Buffer.from(bytes);inspectPackage(b);const result=new Map();for(let p=8;p<b.length;){const size=b.readUInt32LE(p+4);result.set(b.toString('ascii',p,p+4),{start:p+8,end:p+8+size});p+=8+size;}return {b,result};}
function table(b,c){if(!c||c.start+4>c.end)throw Error('Missing resource chunk');const count=b.readUInt32LE(c.start);if(c.start+4+count*4>c.end)throw Error('Pointer table outside chunk');return count;}
export function parseSounds(bytes,wanted){
 const {b,result}=chunks(bytes),c=result.get('SOND'),count=table(b,c),sounds=[];
 const gen=result.get('GEN8');if(gen&&b[gen.start+1]<14)throw Error('Unsupported legacy sound layout');
 for(let i=0;i<count;i++){const p=b.readUInt32LE(c.start+4+4*i);if(p<c.start||p+36>c.end)throw Error('Sound outside chunk');const sp=b.readUInt32LE(p),end=b.indexOf(0,sp);if(sp>=b.length||end<0)throw Error('Invalid sound name');const name=b.toString('utf8',sp,end);if(!wanted.has(name))continue;
  if((b.readUInt32LE(p+4)&0x64)!==0x64)throw Error('Unsupported sound flags');
  sounds.push({name,volume:b.readFloatLE(p+20),pitch:b.readFloatLE(p+24)||1,group:b.readInt32LE(p+28),audio:b.readInt32LE(p+32)});
 }
 return sounds;
}
export function embeddedAudio(bytes,index){
 const {b,result}=chunks(bytes),c=result.get('AUDO'),count=table(b,c);if(!Number.isInteger(index)||index<0||index>=count)throw Error('Invalid audio index');
 const p=b.readUInt32LE(c.start+4+4*index);if(p<c.start||p+4>c.end)throw Error('Audio outside chunk');const size=b.readUInt32LE(p);if(p+4+size>c.end)throw Error('Audio sample outside chunk');return Buffer.from(b.subarray(p+4,p+4+size));
}
