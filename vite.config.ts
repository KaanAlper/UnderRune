import {defineConfig} from 'vitest/config';
import {underruneNative} from './tools/native-handler.mjs';
export default defineConfig(({mode})=>({base:'./',publicDir:mode==='pages'?false:'public',build:{outDir:mode==='pages'?'dist-pages/play':'dist'},plugins:[underruneNative()],server:{watch:{ignored:['**/extracted/**','**/.tools/**','**/public/generated/**']}},test:{include:['tests/**/*.test.ts','src/**/*.test.ts']}}));
