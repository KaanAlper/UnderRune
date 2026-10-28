import fs from 'node:fs';
import {describe,expect,it} from 'vitest';
import {EngineBattle} from '../src/remake/host/engine';
import {availableEncounters,sourceEncounter} from '../src/remake/host/encounters';
import {installChapter2BossHost} from '../src/remake/host/chapter2-bosses';
import {installChapter3BossHost} from '../src/remake/host/chapter3-bosses';
import {installChapter4BossHost} from '../src/remake/host/chapter4-bosses';
import {installNeoHost} from '../src/remake/host/neo';
import {setSourceText} from '../src/remake/host/text';
import {GmRuntime} from '../src/remake/gm/runtime';
import {executeNeoSource} from '../src/remake/bosses/spamton-neo/body-source';
import {defaultLoadout,type EquipmentSource} from '../src/game/loadout';
import {findController} from '../src/remake/deltarune/controller';
import {loadSprites} from './parity/reference';
import {practicePatterns} from '../src/remake/host/practice';

const gear={id:0,name:'Default',description:'',attack:0,defense:0,magic:0,allowed:[1,2,3,4]};
const equipment:EquipmentSource={weapons:[gear],armors:[gear],items:[],bagCapacity:12};
// Variants are public sourceEncounter routes, but deliberately share their parent menu card.
const encounters=[...([1,2,3,4].flatMap(availableEncounters)),...['ch2-61-weird','ch2-82-weird'].map(id=>sourceEncounter(id)!)];
const fields=['monstername','monstermaxhp','monsterhp','monsterat','monsterdf'] as const;

describe('public boss launch contracts (real chapter resources)',()=>{
 for(const encounter of encounters){
  const {id,chapter}=encounter,folder=`extracted/chapter${chapter}_windows/`,bundle=`public/generated/remake/ch${chapter}/bundle.json`;
  const ready=fs.existsSync(folder+'sprites.json')&&fs.existsSync(folder+'code/gml_GlobalScript_scr_monstersetup.gml')&&fs.existsSync(bundle);
  it.skipIf(!ready)(`${id}: initializes every enemy, target, party member and command state`,()=>{
   const bank=loadSprites(chapter),text=JSON.parse(fs.readFileSync(bundle,'utf8')).text as Record<string,string>;
   setSourceText(text);
   const battle=new EngineBattle(bank,equipment,defaultLoadout(),id,11,{
    neoHost:id.startsWith('ch2-61')?installNeoHost:undefined,
    chapterHost:chapter===4?installChapter4BossHost:chapter===3?installChapter3BossHost:chapter===2?installChapter2BossHost:undefined,
   });
   const rt=battle.rt,g=rt.globals,controller=findController(rt)!;
   if(encounter.practice)expect(practicePatterns(id).length,'advertised practice has real choices').toBeGreaterThan(0);
   expect(controller,'real battle controller').toBeDefined();
   expect(g.char).toEqual([...encounter.party,0,0,0].slice(0,3));
   expect(battle.outcome).toBeNull();
   expect(g.tension).toBe(0);
   expect(g.bmenuno).toBe(0);
   for(const [slot,c] of encounter.party.entries()){
    expect(g.hp[c],`character ${c} HP`).toBeGreaterThan(0);
    expect(g.hp[c]).toBe(g.maxhp[c]);
    expect(g.chardead[slot]).toBe(0);
    expect(g.charcond[slot]).toBe(0);
    expect(g.charauto[c]).toBe(encounter.auto?.includes(c)?1:0);
    expect(rt.byId(g.charinstance[slot]),`character ${c} instance`).toBeDefined();
    for(const field of ['battleat','battledf','battlemag'])expect(Number.isFinite(g[field][slot]),`${field}[${slot}]`).toBe(true);
   }

   const source=fs.readFileSync(folder+'code/gml_GlobalScript_scr_monstersetup.gml','utf8');
   const active=g.monstertype.flatMap((type:number,slot:number)=>type>0?[slot]:[]) as number[];
   expect(active.length).toBeGreaterThan(0);
   for(const slot of active){
    const enemy=rt.byId(g.monsterinstance[slot]);
    expect(enemy,`enemy ${slot}, source type ${g.monstertype[slot]}`).toBeDefined();
    expect(enemy!.myself).toBe(slot);
    expect(g.monster[slot]).toBe(1);
    for(const field of ['monsterx','monstery']){
     expect(Number.isFinite(g[field][slot]),`${field}[${slot}] finite`).toBe(true);
     expect(g[field][slot],`${field}[${slot}] initialized by source Other22/user12`).not.toBe(0);
    }
    // Evaluate only the original source's initial metadata prefix, before rewards/ACTs.
    // This independently checks every member of multi-enemy encounters; card HP is not a team total.
    const marker=new RegExp(`if \\(global\\.monstertype\\[myself\\] == ${g.monstertype[slot]}\\)`),start=source.search(marker);
    expect(start,`source monster type ${g.monstertype[slot]}`).toBeGreaterThanOrEqual(0);
    const tail=source.slice(start),open=tail.indexOf('{'),end=tail.indexOf('global.monsterexp[myself]');
    expect(end).toBeGreaterThan(open);
    const original=new GmRuntime(bank,{seed:11});
    original.globals={...g};
    for(const field of fields)original.globals[field]=[...g[field]];
    const probe=original.create({name:'source_metadata_probe',index:-9000},0,0);probe.myself=slot;
    executeNeoSource(tail.slice(open+1,end),probe,original,{object:name=>({name,index:-9001}),text:key=>text[key],call:(name,_self,_rt,args)=>{if(name==='scr_84_get_lang_string')return text[args[0]];throw Error('Unexpected source metadata dependency: '+name);}});
    for(const field of fields){
     // The weird NEO enemy lowers defense on entry, after scr_monstersetup's base value.
     const expected=id==='ch2-61-weird'&&field==='monsterdf'?encounter.defense:original.globals[field][slot];
     expect(g[field][slot],`${field}[${slot}], type ${g.monstertype[slot]}`).toEqual(expected);
    }
    expect(g.monsterhp[slot]).toBeGreaterThan(0);
    // Knight's source deliberately conceals its name during the opening.
    if(id!=='ch3-115')expect(g.monstername[slot].trim()).not.toBe('');
    expect(g.monstername[slot]).not.toMatch(/_slash_|^scr_/);
   }
   // No input must not accidentally commit an action or damage a party member.
   // Weather, NEO and boxing have source-driven introductions/minigames, so do not
   // force their story state into the ordinary command menu to make this check pass.
   for(let frame=0;frame<60;frame++){battle.step();rt.draw();}
   expect(battle.outcome).toBeNull();
   for(const c of encounter.party){
    // Noelle's route-default ThornRing drains HP even while waiting for commands.
    if(id==='ch2-82-weird'&&c===4){expect(g.hp[c]).toBeGreaterThan(0);expect(g.hp[c]).toBeLessThan(g.maxhp[c]);}
    else expect(g.hp[c],`idle character ${c}`).toBe(g.maxhp[c]);
   }
   expect(g.bmenuno).toBe(0);
  },30000);
 }
});
