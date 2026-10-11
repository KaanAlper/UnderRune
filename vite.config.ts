import {defineConfig} from 'vitest/config';
export default defineConfig({base:'./',server:{watch:{ignored:['**/extracted/**','**/.tools/**','**/public/generated/**']}},test:{include:['tests/**/*.test.ts','src/**/*.test.ts']}});
