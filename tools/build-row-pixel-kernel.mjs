// Regenerates the checked-in WASM payload; normal builds need no C compiler.
// Usage: node tools/build-row-pixel-kernel.mjs [path/to/clang]
import {spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const compiler=process.argv[2]??path.join(root,'.tools/emsdk/upstream/bin',process.platform==='win32'?'clang.exe':'clang');
const taskTempRoot=path.resolve(tmpdir()),temp=mkdtempSync(path.join(taskTempRoot,'underrune-row-kernel-'));
try {
  const output=path.join(temp,'row-pixel-kernel.wasm');
  const result=spawnSync(compiler,[
    '--target=wasm32','-O3','-nostdlib','-ffp-contract=off',
    path.join(root,'src/remake/host/row-pixel-kernel.c'),
    '-Wl,--no-entry','-Wl,--export=composite_add_rows','-Wl,--export=__heap_base',
    '-Wl,--export-memory','-Wl,--stack-first','-Wl,-z,stack-size=65536',
    '-Wl,--initial-memory=8388608','-Wl,--max-memory=8388608','-Wl,--strip-all',
    '-o',output,
  ],{encoding:'utf8'});
  if(result.error) throw result.error;
  if(result.status!==0) throw new Error(result.stderr||result.stdout);
  const bytes=readFileSync(output);
  const lines=[];
  for(let i=0;i<bytes.length;i+=24) lines.push('  '+Array.from(bytes.subarray(i,i+24)).join(',')+',');
  writeFileSync(path.join(root,'src/remake/host/row-pixel-kernel-bytes.ts'),
    '// Generated from row-pixel-kernel.c by tools/build-row-pixel-kernel.mjs.\n'+
    '// Checked in so normal builds do not require clang/emsdk.\n'+
    'export const rowPixelKernelBytes = new Uint8Array([\n'+lines.join('\n')+'\n]);\n');
  console.log(`Generated row pixel kernel (${bytes.length} WASM bytes).`);
} finally {
  const resolved=path.resolve(temp);
  if(path.dirname(resolved)!==taskTempRoot||!path.basename(resolved).startsWith('underrune-row-kernel-'))throw new Error('Refusing unexpected kernel temporary path');
  rmSync(resolved,{recursive:true,force:true});
}
