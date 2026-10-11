import {defineConfig} from 'vitest/config';
import {underruneNative} from './tools/native-handler.mjs';
export default defineConfig({base:'./',plugins:[underruneNative()],server:{watch:{ignored:['**/extracted/**','**/.tools/**','**/public/generated/**']}},test:{include:['tests/**/*.test.ts','src/**/*.test.ts']}});
