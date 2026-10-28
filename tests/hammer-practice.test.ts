import {it,expect} from 'vitest';
import {createPracticeBattle,practicePatterns} from '../src/remake/host/practice';
import {loadSprites} from './parity/reference';
import {chapterText} from './parity/chapter2-runner';
import {setSourceText} from '../src/remake/host/text';
import {defaultLoadout} from '../src/game/loadout';
import {installChapter4BossHost} from '../src/remake/host/chapter4-bosses';
const gear={id:0,name:'Default',description:'',attack:0,defense:0,magic:0,allowed:[1,2,3,4]},equipment={weapons:[gear],armors:[gear],items:[],bagCapacity:12};
it('offers every distinct normal Hammer queue and Weather attack options',()=>{expect(practicePatterns('ch4-160')).toHaveLength(19);expect(practicePatterns('ch3-113')).toHaveLength(14);});
for(let i=0;i<19;i++)it(`Hammer practice ${i} starts a real source attack and returns after one queue`,()=>{
 setSourceText(chapterText(4));const p=createPracticeBattle(loadSprites(4),equipment,defaultLoadout(),'ch4-160',i,11,{chapterHost:installChapter4BossHost}),rt=p.rt;let attack=false;
 for(let f=0;f<3000&&!p.outcome;f++){rt.globals.hp[2]=rt.globals.maxhp[2];rt.input.held=new Set([38]);p.step();rt.draw();attack||=rt.instances.some(s=>s.live&&(['obj_spearshot','obj_box_throw_controller','obj_hammer_bounce_controller','obj_gerson_squishes_box','obj_gerson_growtangle_transform','obj_gerson_growtangle'].includes(s.object.name)||s.object.name.startsWith('obj_gerson_')&&s.object.name.endsWith('_controller')));}
 expect(attack,p.patternName).toBe(true);expect(p.outcome,p.patternName).toBe('survived');const frame=rt.frame;p.step();expect(rt.frame).toBe(frame);
});
