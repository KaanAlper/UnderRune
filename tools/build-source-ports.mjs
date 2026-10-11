import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const base=path.join(root,'extracted/chapter3_windows');
const names=['obj_knight_stream_Create_0','obj_knight_stream_Step_0','obj_bullet_knight_stream_Create_0','obj_bullet_knight_stream_Step_0','obj_knight_stream_Draw_0','obj_knight_streamline_Step_0'];
const code={};for(const n of names)code[n]=await fs.readFile(path.join(base,'code/gml_Object_'+n+'.gml'),'utf8');
const index=JSON.parse(await fs.readFile(path.join(base,'index.json'),'utf8'));
const number=(text,re,label)=>{const match=text.match(re);if(!match)throw Error('Source layout changed: '+label);return Number(match[1]);};
const controller=code.obj_knight_stream_Step_0,bullet=code.obj_bullet_knight_stream_Step_0;
const spawnFrames=[...controller.matchAll(/if \(timer == (\d+)\)/g)].map(x=>Number(x[1]));
if(spawnFrames.length!==5)throw Error('Unrecognized Knight stream schedule');
const metadata=JSON.parse((await fs.readFile(path.join(root,'extracted/source-manifest.json'),'utf8')).replace(/^\uFEFF/,''));
const data={package:metadata.find(p=>p.id==='chapter3_windows'),fps:index.timing?.GMS2FPS,
 scripts:names.map(name=>({name:'gml_Object_'+name,sha256:createHash('sha256').update(code[name]).digest('hex')})),
 stream:{spawnFrames:spawnFrames.slice(0,4),period:spawnFrames[4],angleBase:number(code.obj_knight_stream_Create_0,/slash_angle = (\d+)/,'angle base'),angleRange:45,
 offsetStep:number(controller,/lengthdir_x\((\d+),/,'offset'),speed:number(bullet,/direction \+ 180, (\d+),/,'speed'),
 lifetime:number(bullet,/if \(timer == (\d+)\)\s*\{\s*instance_destroy/,'lifetime'),hitStart:number(bullet,/timer > (\d+) &&/,'hit start'),hitPeriod:number(bullet,/timer % (\d+)/,'hit period'),hitEnd:number(bullet,/&& timer < (\d+)/,'hit end'),
 lineLength:number(code.obj_knight_stream_Draw_0,/line_length, (\d+),/,'line length'),lineGrowth:number(code.obj_knight_stream_Draw_0,/line_length, \d+, (\d+)/,'line growth'),
 warningLifetime:number(code.obj_knight_streamline_Step_0,/timer >= (\d+)/,'warning lifetime')},
 scope:'Source-derived stream controller timing, offsets, velocities and beam rendering. Arena, damage resolution, encounter phase selection and total turn duration remain adapted.'};
if(data.fps!==30)throw Error('Unsupported source timing: '+data.fps);
await fs.mkdir(path.join(root,'src/bosses/knight'),{recursive:true});
await fs.writeFile(path.join(root,'src/bosses/knight/source-data.json'),JSON.stringify(data,null,2));
console.log('Knight controller 103: 6 source script hashes and 30 FPS timing extracted.');
