import {expect,test} from 'vitest';
import {knightStream} from '../src/bosses/knight/attacks';
import {BattleSession} from '../src/game/battle';
import {catalog,getDefinition} from '../src/bosses/registry';
const idle={x:0,y:0,confirm:false,cancel:false,menu:false,restart:false,pause:false,slow:false,shoot:false};
test('decoded controller103 starts the crossed beams at source frame20 and warning offsets23',()=>{
 const definition=getDefinition(catalog.find(r=>r.id==='ch3-115')!);definition.attacks=[knightStream];definition.sequence=[0];
 const b=new BattleSession(definition,1,true);b.invulnerable=10000;
 for(let i=0;i<38;i++)b.step(idle);expect(b.bullets).toHaveLength(0);
 b.step(idle);expect(b.bullets.filter(x=>x.kind==='knight-stream')).toHaveLength(2);
 for(let i=0;i<6;i++)b.step(idle);expect(b.bullets.filter(x=>x.kind==='knight-warning')).toHaveLength(4);
 for(let i=0;i<27;i++)b.step(idle);
 expect(b.bullets.some(x=>x.kind==='knight-stream-hit'&&Math.abs(Math.hypot(x.vx,x.vy)-7.5)<1e-8)).toBe(true);
});
