import {it,expect} from 'vitest';
import {GmRuntime} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
import {initChapter2ActTables} from '../src/remake/deltarune/chapter2';
import {monsterAdd} from '../src/remake/deltarune/chapter2-enemy';
import {setSourceText} from '../src/remake/host/text';
it('resets only the vacant slot, creates its native enemy, and calls setup then post-add events',()=>{
 const rt=new GmRuntime(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]})),g=rt.globals;
 rt.globals.chapter=2;for(const key of ['monster','monstertype','monsterinstancetype','monsterinstance','monstermakex','monstermakey','monsterx','monstery','monsterat','monsterdf','monsterhp','monstermaxhp','monstergold','monsterexp','sparepoint','hittarget','mercymod','mercymax','monsterstatus','monstername','monstercomment','monsterattackname'])g[key]=[99,99,99];
 g.monster=[1,0,1];g.monstermakex[1]=540;g.monstermakey[1]=84;initChapter2ActTables(rt);g.canact[1].fill(1);g.canact[0].fill(1);setSourceText({'scr_monster_statreset_slash_scr_monster_statreset_gml_5_0':' '});
 const seen:string[]=[],def={name:'summon',index:1,events:{create:()=>seen.push('create'),user12:()=>seen.push('setup'),user15:()=>seen.push('added')}};
 const caller=rt.restore({name:'caller',index:2},99999,0,0),slot=monsterAdd(caller,rt,33,def),summon=rt.byId(g.monsterinstance[slot])!;
 expect(slot).toBe(1);expect([summon.x,summon.y,summon.myself]).toEqual([540,84,1]);expect(seen).toEqual(['create','setup','added']);expect(g.canact[1]).toEqual([0,0,0,0,0,0]);expect(g.canact[0]).toEqual([1,1,1,1,1,1]);expect([caller.__mopenslot,caller.__returnid,caller.__fj]).toEqual([1,1,6]);
 expect(monsterAdd(caller,rt,33,def)).toBe(-1);expect(caller.__mopenslot).toBe(3);
});
