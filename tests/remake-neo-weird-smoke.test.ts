import {it,expect} from 'vitest';
import {EngineBattle} from '../src/remake/host/engine';
import {installNeoHost} from '../src/remake/host/neo';
import {SPAMTON_NEO_PATTERNS} from '../src/remake/host/practice';
import {defaultLoadout,type EquipmentSource} from '../src/game/loadout';
import {chapterText} from './parity/chapter2-runner';
import {loadSprites} from './parity/reference';
import {setSourceText} from '../src/remake/host/text';
import {destroyWriters} from '../src/remake/deltarune/writer';

const gear={id:0,name:'',description:'',attack:0,defense:0,magic:0,allowed:[1,2,3]};
const equipment:EquipmentSource={armors:[gear],weapons:[gear],items:[],bagCapacity:12};
const smoke=process.env.RUN_PRACTICE_SMOKE==='1'?it:it.skip;
for(const rage of [false,true])for(const pattern of SPAMTON_NEO_PATTERNS)smoke(`solo ${rage?'enraged':'ordinary'} NEO completes ${pattern.name}`,()=>{
 setSourceText(chapterText(2));const b=new EngineBattle(loadSprites(2),equipment,defaultLoadout(),'ch2-61-weird',11,{neoHost:installNeoHost,rage:true});
 const rt=b.rt,g=rt.globals,e=b.enemy!;
 for(let i=0;i<30;i++){b.step();rt.draw();}
 if(rage)for(let i=0;i<6;i++)rt.userEvent(e,4);
 destroyWriters(rt);g.myfight=-1;g.mnfight=1;pattern.setup?.(rt,e);
 let attacking=false;
 for(let i=0;i<6000;i++){
  g.inv=999999;destroyWriters(rt);b.step();rt.draw();
  if(g.mnfight===2)attacking=true;
  if(attacking&&g.myfight===0&&g.mnfight===0)break;
 }
 expect(attacking).toBe(true);expect([g.myfight,g.mnfight]).toEqual([0,0]);expect(b.outcome).toBeNull();
},60000);
