// Unit tests read game dialogue from the locally built bundle (npm run build:pages or tools/build-remake-assets.mjs);
// the repository itself holds only the line keys.
import fs from 'node:fs';
import {setSourceText} from '../src/remake/host/text';
const bundle='public/generated/remake/ch1/bundle.json';
if(fs.existsSync(bundle))setSourceText(JSON.parse(fs.readFileSync(bundle,'utf8')).text??{});
