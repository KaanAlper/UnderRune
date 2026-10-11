import {expect,test} from 'vitest';
import {ActionSession} from '../src/game/action';
import {catalog,getDefinition} from '../src/bosses/registry';
const idle={x:0,y:0,confirm:false,cancel:false,restart:false,pause:false,slow:false,shoot:false};
const make=(id:string)=>new ActionSession(getDefinition(catalog.find(r=>r.id===id)!),7);
test('Mantle preserves source HP and four phase thresholds',()=>{
 const b=make('ch3-mantle');expect(b.totalBossHp).toBe(30);expect(b.phase).toBe('defense');
 for(const [hp,phase]of [[22,2],[13,3],[4,4]]){b.enemies[0].hp=hp;b.step(idle);expect(b.actionPhase).toBe(phase);}
});
test('an action strike requires range and does not activate classic commands',()=>{
 const b=make('ch3-mantle');b.step({...idle,confirm:true});expect(b.totalBossHp).toBe(30);
 b.strikeCooldown=0;b.soul.x=b.opponent.x-30;b.soul.y=b.opponent.y;b.facing=0;
 b.step({...idle,confirm:true});expect(b.totalBossHp).toBeLessThan(30);
 const hp=b.totalBossHp;b.pause(true);b.step({...idle,confirm:true});expect(b.totalBossHp).toBe(hp);
 b.reset(7);expect(b.totalBossHp).toBe(30);expect(b.strikeCooldown).toBe(0);
});
test('Susiezilla uses source kickboxing Tenna HP and stops on victory',()=>{
 const b=make('ch3-susiezilla');expect(b.totalBossHp).toBe(2);
 b.enemies[0].hp=0;b.step(idle);expect(b.phase).toBe('victory');const tick=b.tick;b.step(idle);expect(b.tick).toBe(tick);
});
