import {BattleSession} from './battle';
import type {BossDefinition,AttackContext} from './types';
import type {InputFrame} from './input';
import {segmentHitsCircle} from './collision';
import {randomGenerator} from './rng';
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
/** Action encounters have their own controller; they never enter FIGHT/ACT menus. */
export class ActionSession extends BattleSession{
 opponent={x:460,y:230,vx:0,vy:0};actionPhase=1;facing=0;strikeCooldown=0;strikeFlash=0;dashTicks=0;dashCooldown=0;
 private alive=true;private actionRandom= randomGenerator(1);
 constructor(definition:BossDefinition,seed:number,practice=false,index=0){super(definition,seed,false);this.practice=practice;this.attackIndex=index;this.reset(seed);}
 override reset(seed:number){
  super.reset(seed);this.actionRandom=randomGenerator(seed);this.alive=true;this.phase='defense';this.actionPhase=1;
  this.arena={x:45,y:80,width:550,height:325};this.soul={x:170,y:245,vy:0,shield:0};this.opponent={x:460,y:230,vx:0,vy:0};
  this.facing=0;this.strikeCooldown=0;this.strikeFlash=0;this.dashTicks=0;this.dashCooldown=0;
  this.party[0]={...this.party[0],name:this.definition.special==='mantle'?'KRIS':'SUSIE',hp:8,maxHp:8};this.party[1].hp=0;this.party[2].hp=0;
 }
 override selectCommand(_index:number){}
 override dispose(){this.alive=false;super.dispose();}
 override step(input:InputFrame){
  if(!this.alive)return;if(input.restart){this.reset(this.seed);return;}if(input.pause){this.paused=!this.paused;return;}
  if(this.paused||this.phase==='victory'||this.phase==='defeat')return;
  if(this.totalBossHp<=0){this.phase='victory';this.bullets=[];this.events.push('victory');return;}
  this.tick++;this.attackTick++;this.invulnerable=Math.max(0,this.invulnerable-1);this.strikeCooldown=Math.max(0,this.strikeCooldown-1);this.strikeFlash=Math.max(0,this.strikeFlash-1);this.dashCooldown=Math.max(0,this.dashCooldown-1);
  const hp=this.enemies[0].hp;this.actionPhase=this.definition.special==='mantle'?(hp<=4?4:hp<=13?3:hp<=22?2:1):1;
  if(input.x||input.y)this.facing=Math.atan2(input.y,input.x);
  if(input.cancel&&this.dashCooldown===0){this.dashTicks=15;this.dashCooldown=65;this.events.push('block');}
  const speed=this.dashTicks>0?7:input.slow?1.5:3,norm=Math.hypot(input.x,input.y)||1;
  this.soul.x=clamp(this.soul.x+(this.dashTicks>0?Math.cos(this.facing):input.x/norm)*speed,55,585);
  this.soul.y=clamp(this.soul.y+(this.dashTicks>0?Math.sin(this.facing):input.y/norm)*speed,90,395);
  if(this.dashTicks>0){this.dashTicks--;this.invulnerable=Math.max(this.invulnerable,2);}
  if(input.confirm&&this.strikeCooldown===0&&!this.practice){
   this.strikeCooldown=24;this.strikeFlash=9;this.events.push('fight');
   const dx=this.opponent.x-this.soul.x,dy=this.opponent.y-this.soul.y;
   if(Math.hypot(dx,dy)<78&&Math.cos(Math.atan2(dy,dx)-this.facing)>.3){
    const damage=this.definition.special==='mantle'?.75:1;this.enemies[0].hp=Math.max(0,this.enemies[0].hp-damage);this.lastDamage=damage;this.events.push('hurt');
   }
  }
  // Timed dashes are telegraphed; their trajectory is locked before movement.
  const period=this.definition.special==='mantle'?150-Math.min(this.actionPhase,4)*15:130;
  const cycle=this.tick%period;
  if(cycle===35){const angle=Math.atan2(this.soul.y-this.opponent.y,this.soul.x-this.opponent.x);this.opponent.vx=Math.cos(angle)*5;this.opponent.vy=Math.sin(angle)*5;}
  if(cycle>35&&cycle<65){this.opponent.x=clamp(this.opponent.x+this.opponent.vx,75,565);this.opponent.y=clamp(this.opponent.y+this.opponent.vy,110,375);}
  else if(cycle>80){this.opponent.x+=(460-this.opponent.x)*.015;this.opponent.y+=(230+Math.sin(this.tick/45)*80-this.opponent.y)*.015;}
  if(Math.hypot(this.opponent.x-this.soul.x,this.opponent.y-this.soul.y)<33)this.takeDamage(2);
  if(this.definition.special==='mantle'){
   this.attackIndex=this.actionPhase===4?2:this.actionPhase>=2?1:0;
   const context:AttackContext={tick:this.attackTick,arena:this.arena,soul:this.soul,random:this.actionRandom,spawn:b=>this.spawn(b),state:{},bossRatio:hp/30,turn:this.actionPhase};
   this.activeAttack.step(context);
  }
  for(const bullet of this.bullets){const px=bullet.x,py=bullet.y;bullet.x+=bullet.vx;bullet.y+=bullet.vy;bullet.age++;if(segmentHitsCircle(px,py,bullet.x,bullet.y,this.soul.x,this.soul.y,bullet.radius+8))this.takeDamage(2);}
  this.bullets=this.bullets.filter(b=>b.age<b.lifetime&&b.x>20&&b.x<620&&b.y>50&&b.y<430);
  if(this.party[0].hp<=0){this.phase='defeat';this.bullets=[];return;}
  if(this.totalBossHp<=0||this.practice&&this.attackTick>=420){this.phase='victory';this.bullets=[];this.events.push('victory');}
 }
}
