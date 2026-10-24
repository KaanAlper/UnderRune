import fs from 'node:fs';
import {expect,it} from 'vitest';
import {EngineBattle} from '../src/remake/host/engine';
import {installChapter2BossHost} from '../src/remake/host/chapter2-bosses';
import {defaultLoadout,type EquipmentSource} from '../src/game/loadout';
import {loadSprites,replayInput,type Replay} from './parity/reference';
import {chapterText} from './parity/chapter2-runner';
import {setSourceText} from '../src/remake/host/text';
import type {GmRuntime} from '../src/remake/gm/runtime';
import {KEY} from '../src/remake/deltarune/keys';
const gear={id:0,name:'Default',description:'',attack:0,defense:0,magic:0,allowed:[1,2,3]};
const equipment:EquipmentSource={weapons:[gear],armors:[gear],items:[],bagCapacity:12};
function command(rt:GmRuntime){
 const g=rt.globals,t=g.charturn,m=g.bmenuno,c=g.bmenucoord,sweet=rt.instances.find(i=>i.live&&i.object.name==='obj_sweet_enemy')!;
 if(g.myfight!==0||g.mnfight!==0)return KEY.z;
 const learned=sweet.learnedAct;
 if(m===0){const desired=t===0||learned?1:4;return c[0][t]===desired?KEY.z:KEY.right;}
 if(m===11||m===13){const desired=learned?t:0;return c[m][t]===desired?KEY.z:KEY.down;}
 if(m===9)return c[9][t]===1?KEY.z:KEY.right;
 if(m===2)return c[2][t]===0?KEY.z:KEY.up;
 return KEY.z;
}
function play(rt:GmRuntime,step:()=>void,start:number,replay:Replay,finished:()=>boolean){
 let frames=start,video=false,learned=false;
 for(let f=start;f<18000&&!finished();f++){
  rt.draw();const pressed=f%8===0?[command(rt)]:[],entry={keysPressed:pressed,keysReleased:[...rt.input.held].filter(k=>!pressed.includes(k))};
  replay[f]=entry;replayInput(rt,replay,f);step();frames=f+1;
  video||=rt.instances.some(i=>i.live&&i.object.name==='obj_musical_battle_end');
  learned||=rt.instances.some(i=>i.live&&i.object.name==='obj_sweet_enemy'&&!!i.learnedAct);
 }
 const sw=rt.instances.find(i=>i.live&&i.object.name==='obj_sweet_enemy');
 console.log({frames,video,learned,phase:[rt.globals.myfight,rt.globals.mnfight],sweet:sw&&{endcon:sw.endcon,actCounter:sw.actCounter,learned:sw.learnedAct,dancecon:sw.dancecon},menu:[rt.globals.bmenuno,rt.globals.charturn]});
 expect(learned).toBe(true);expect(video).toBe(true);expect(finished()).toBe(true);return frames;
}
it('fresh band battle reaches the dance lesson and music video through legal commands',()=>{
 setSourceText(chapterText(2));const b=new EngineBattle(loadSprites(2),equipment,defaultLoadout(),'ch2-62',11,{development:true,chapter2Host:installChapter2BossHost});
 for(const c of b.party)b.rt.globals.hp[c]=b.rt.globals.maxhp[c]=99999;
 play(b.rt,()=>b.step(),0,{},()=>b.outcome==='victory');
},180000);
const WIN_RUN='.tools/oracle/ch2-62-s11-god-bandpolicywinlong';
it.skipIf(!fs.existsSync(WIN_RUN+'-f40.json'))('the native legal-key policy recording contains the lesson, complete video and victory',()=>{
 const trace=fs.readFileSync(WIN_RUN+'.ndjson','utf8').trim().split('\n').map(line=>JSON.parse(line));
 expect(trace.some(f=>f.o.some((o:unknown[])=>o[1]==='obj_musical_battle_end'))).toBe(true);
 expect(trace.some(f=>f.g.myfight===7&&f.g.mnfight===-1)).toBe(true);
 const lesson=JSON.parse(fs.readFileSync(WIN_RUN+'-f2800.json','utf8')).instances.find((i:any)=>i.objectName==='obj_sweet_enemy');
 expect(lesson.selfVariables.learnedAct).toBe(1);
 // The full replay lives in remake-chapter2-bosses-parity.test.ts (LONG_PARITY=1).
 // Its clock is the original Step's observed samples, never fitted to remake outcomes.
 expect(Object.keys(JSON.parse(fs.readFileSync(WIN_RUN+'.solo.json','utf8'))).length).toBeGreaterThan(3000);
 expect(Object.keys(JSON.parse(fs.readFileSync(WIN_RUN+'.inputs.json','utf8'))).length).toBeGreaterThan(3000);
});
