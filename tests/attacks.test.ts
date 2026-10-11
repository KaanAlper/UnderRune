import {expect,test} from 'vitest';
import {jevilAttacks} from '../src/bosses/jevil/attacks';
import {getDefinition} from '../src/bosses/registry';
import catalog from '../src/bosses/catalog.json';
import {BattleSession} from '../src/game/battle';
import type {AttackContext,Bullet,BulletInit,EncounterRecord} from '../src/game/types';
function simulate(attackIndex:number,ticks:number){
 const bullets:BulletInit[]=[];const c:AttackContext={tick:0,arena:{x:245,y:120,width:150,height:150},soul:{x:320,y:195},random:()=>0.5,spawn:(b)=>{bullets.push(b);return b as Bullet;},state:{},bossRatio:1,turn:0};
 for(let t=0;t<ticks;t++){c.tick=t;jevilAttacks[attackIndex].step(c);}return bullets;
}
test('Jevil teleport fires five source spread spades after its windup',()=>{
 expect(simulate(0,24)).toHaveLength(0);
 const b=simulate(0,25);expect(b).toHaveLength(5);
 expect(b.every(x=>x.kind==='spade')).toBe(true);
});
test('Jevil ring has ten spades from source controller type65',()=>{
 const b=simulate(1,1);expect(b).toHaveLength(10);
});
test('carousel controller type62 has 3 by 7 horses',()=>expect(simulate(4,1)).toHaveLength(21));
test('each source encounter receives explicit attack family and source attribution',()=>{
 for(const r of catalog){const d=getDefinition(r as EncounterRecord);expect(d.attacks.length,r.id).toBeGreaterThan(0);expect(d.attacks.every(a=>!!a.source),r.id).toBe(true);}
});

test('every distinct attack remains finite for its entire defense turn',()=>{
 const seen=new Set<string>();
 const input={x:0,y:0,confirm:false,cancel:false,restart:false,pause:false,slow:false,shoot:true};
 for(const r of catalog){const d=getDefinition(r as EncounterRecord);
  for(const [i,a]of d.attacks.entries()){
   if(seen.has(a.id))continue;seen.add(a.id);
   const b=new BattleSession(d,20261005,true,i);
   for(let t=0;t<a.duration;t++){
    b.invulnerable=2;b.step(input);
    for(const bullet of b.bullets){for(const field of ['x','y','vx','vy','radius','angle']as const)if(!Number.isFinite(bullet[field]))throw Error(`${a.id} tick ${t}: non-finite ${field}`);}
   }
   expect(b.phase,a.id).toBe('victory');
  }
 }
 expect(seen.size).toBeGreaterThan(70);
});
