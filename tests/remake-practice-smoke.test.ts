import {it,expect} from 'vitest';
import fs from 'node:fs';
import {defaultLoadout,type EquipmentSource} from '../src/game/loadout';
import {createPracticeBattle,practicePatterns} from '../src/remake/host/practice';
import {setSourceText} from '../src/remake/host/text';
import {installChapter3BossHost} from '../src/remake/host/chapter3-bosses';
import {installChapter2BossHost} from '../src/remake/host/chapter2-bosses';
import {installNeoHost} from '../src/remake/host/neo';
import {loadSprites} from './parity/reference';
const empty={id:0,name:'',description:'',attack:0,defense:0,magic:0,allowed:[1,2,3]};
const source:EquipmentSource={weapons:[empty],armors:[empty],items:[],bagCapacity:12};
const ids=['ch1-2','ch1-8','ch1-12','ch1-20','ch1-25','ch1-27','ch1-31','ch1-40','ch2-57','ch2-58','ch2-59','ch2-60','ch2-61','ch2-62','ch2-63','ch2-71','ch2-81','ch2-82','ch2-83','ch2-84','ch2-89','ch2-94','ch3-115'];
const smoke=process.env.RUN_PRACTICE_SMOKE==='1'?it:it.skip;
smoke.each(ids)('smokes every selected %s attack for 1300 frames or completion',id=>{
 const chapter=Number(id[2]),bank=loadSprites(chapter);
 setSourceText(JSON.parse(fs.readFileSync(`public/generated/remake/ch${chapter}/bundle.json`,'utf8')).text);
 const failures:string[]=[],pending:string[]=[];
 for(const [i,pattern] of practicePatterns(id).entries()){
  try{
   const p=createPracticeBattle(bank,source,defaultLoadout(),id,i,11,{development:true,neoHost:id==='ch2-61'?installNeoHost:undefined,chapterHost:chapter===3?installChapter3BossHost:chapter===2&&id!=='ch2-61'?installChapter2BossHost:undefined});
   for(let f=0;f<1300&&!p.outcome;f++){p.rt.globals.inv=999999;p.step();p.rt.draw();}
   if(!p.outcome)pending.push(pattern.name);
  }catch(error){failures.push(`${i} ${pattern.name}: ${String(error)}`);}
 }
 if(pending.length)console.log(`${id} needs input or more frames: ${pending.join(', ')}`);
 expect(failures).toEqual([]);
},240000);
