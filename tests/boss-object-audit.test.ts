import {it,expect} from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {EngineBattle} from '../src/remake/host/engine';
import {installChapter2BossHost} from '../src/remake/host/chapter2-bosses';
import {installChapter3BossHost} from '../src/remake/host/chapter3-bosses';
import {installChapter4BossHost} from '../src/remake/host/chapter4-bosses';
import {loadSprites} from './parity/reference';
import {defaultLoadout,type EquipmentSource} from '../src/game/loadout';
import {setSourceText} from '../src/remake/host/text';
import {chapterText} from './parity/chapter2-runner';

/**
 * Every object a boss port can create must be implemented in its chapter host. An unported resource is a stub whose
 * create event throws, which freezes the battle the first time the player reaches that attack (the Hammer Rude Buster
 * hit-back froze on obj_oflash_gerson_buster). This scans each boss folder for objects passed to a create call.
 */
const gear={id:0,name:'Default',description:'',attack:0,defense:0,magic:0,allowed:[1,2,3]};
const equipment:EquipmentSource={weapons:[gear],armors:[gear],items:[],bagCapacity:12};
const BOSSES:{chapter:2|3|4;encounter:string;install:any;folders:string[]}[]=[
 {chapter:3,encounter:'ch3-115',install:installChapter3BossHost,folders:['roaring-knight','lanino-elnina']},
 {chapter:4,encounter:'ch4-160',install:installChapter4BossHost,folders:['hammer-of-justice']},
];
const walk=(dir:string):string[]=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):e.name.endsWith('.ts')?[path.join(dir,e.name)]:[]);
for(const b of BOSSES)it(`${b.encounter}: every object its port creates is implemented`,()=>{
 setSourceText(chapterText(b.chapter));let objects:Record<string,any>={};
 const host=(rt:any,o:any)=>{const r=b.install(rt,o);objects=r.objects;return r;};
 const battle=new EngineBattle(loadSprites(b.chapter),equipment,defaultLoadout(),b.encounter,11,{development:true,chapterHost:host as any});
 for(let f=0;f<5;f++)battle.step();
 const created=new Set<string>();
 for(const folder of b.folders)for(const file of walk(path.join('src/remake/bosses',folder)))for(const line of fs.readFileSync(file,'utf8').split(/\r?\n/))
  if(/create\w*\(/.test(line))for(const m of line.matchAll(/object\(["'](obj_\w+)["']\)/g))created.add(m[1]);
 const missing=[...created].filter(n=>{const d=objects[n];return !d||String(d.events?.create).includes('is not implemented');}).sort();
 expect(missing).toEqual([]);
},60000);
