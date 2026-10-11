import type {Attack,AttackContext,BossDefinition,Bullet,BulletInit,EnemyState,PartyMember,BattlePhase,BattleSnapshot} from './types';
import type {InputFrame} from './input';
import {randomGenerator} from './rng';
import {segmentHitsCircle} from './collision';
import {ring} from '../bosses/patterns';
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
export const COMMANDS=['FIGHT','ACT','MAGIC','ITEM','SPARE','DEFEND'];
export const ITEMS=[{name:'Darkburger',heal:70,all:false},{name:'Darkburger',heal:70,all:false},{name:'Top Cake',heal:160,all:true},{name:'Revive Mint',heal:-1,all:false},{name:'Darkburger',heal:70,all:false},{name:'Ralsei Tea',heal:120,all:false}];
export class BattleSession{
 phase:BattlePhase='command';paused=false;tick=0;turn=0;tp=16;actor=0;cursor=0;target=0;invulnerable=0;attackTick=0;timingTick=0;mercyActions=0;message='';messageTick=0;lastDamage=0;flash=0;shotTick=0;hits=0;graze=0;attackIndex=0;practice=false;
 arena={x:235,y:110,width:170,height:150};soul={x:320,y:185,vy:0,shield:0};
 bullets:Bullet[]=[];shots:{x:number;y:number;power:number}[]=[];party:PartyMember[]=[];enemies:EnemyState[]=[];items=ITEMS.map(x=>({...x}));events:string[]=[];
 private random:()=>number;private nextId=1;private attackState:Record<string,number>={};private messageNext:()=>void=()=>{};private disposed=false;private lastMenuInput=0;private pendingCommand='FIGHT';
 constructor(public definition:BossDefinition,public seed:number,practice=false,attackIndex=0){this.random=randomGenerator(seed);this.practice=practice;this.reset(seed);if(practice)this.beginDefense(attackIndex);}
 get activeAttack():Attack{return this.definition.attacks[this.attackIndex];}
 get maxBossHp(){return this.enemies.reduce((s,e)=>s+e.maxHp,0);}
 get totalBossHp(){return this.enemies.reduce((s,e)=>s+e.hp,0);}
 get actNames(){const e=this.enemies[this.target];return [...new Set(['Check',...(e?.record.acts??[])])].filter(a=>!a.includes('scr_'));}
 reset(seed:number){
  this.seed=seed;this.random=randomGenerator(seed);this.phase='command';this.paused=false;this.tick=0;this.turn=0;this.tp=16;this.actor=0;this.cursor=0;this.target=0;this.invulnerable=0;this.attackTick=0;this.timingTick=0;this.mercyActions=0;this.message='';this.messageTick=0;this.lastDamage=0;this.flash=0;this.shotTick=0;this.hits=0;this.graze=0;this.nextId=1;this.attackState={};this.bullets=[];this.shots=[];this.items=ITEMS.map(x=>({...x}));this.events=[];this.disposed=false;this.lastMenuInput=0;
  const level=this.definition.record.chapter;
  const base=[90,110,70].map(h=>h+(level-1)*40);
  this.party=['KRIS','SUSIE','RALSEI'].map((name,i)=>({name,hp:base[i],maxHp:base[i],attack:12+level*4+(i===1?5:0),defense:2+level,color:['#45c6fa','#ff68a9','#80ff91'][i],guard:false}));
  this.enemies=this.definition.record.enemies.map(record=>({record,hp:record.hp,maxHp:record.hp,mercy:0}));
  this.soul={x:320,y:185,vy:0,shield:0};this.messageNext=()=>{};
 }
 pause(value:boolean){this.paused=value;}
 dispose(){this.disposed=true;this.bullets=[];this.shots=[];this.events=[];}
 snapshot():BattleSnapshot{return {phase:this.phase,tick:this.tick,tp:this.tp,turn:this.turn,paused:this.paused,bossHp:this.totalBossHp,hp:this.party.reduce((s,p)=>s+Math.max(p.hp,0),0),maxHp:this.party.reduce((s,p)=>s+p.maxHp,0),bullets:this.bullets};}
 private announce(text:string,next:()=>void,delay=70){this.phase='message';this.message=text;this.messageTick=delay;this.messageNext=next;this.events.push('text');}
 private afterAction(){
  if(this.totalBossHp<=0){this.finish('victory');return;}
  this.actor++;
  while(this.actor<3&&this.party[this.actor].hp<=0)this.actor++;
  this.cursor=0;
  if(this.actor>=3)this.beginDefense();else this.phase='command';
 }
 private finish(phase:'victory'|'defeat'){this.phase=phase;this.bullets=[];this.shots=[];this.events.push(phase);}
 beginDefense(index?:number){
  const sequence=this.definition.sequence;
  this.attackIndex=index??sequence[this.turn%sequence.length];
  this.attackIndex=clamp(this.attackIndex,0,this.definition.attacks.length-1);
  this.attackTick=0;this.attackState={};this.bullets=[];this.shots=[];this.shotTick=0;
  const mode=this.activeAttack.mode;
  this.arena={x:mode==='yellow'?220:235,y:110,width:mode==='yellow'?200:170,height:150};
  this.soul={x:320,y:185,vy:0,shield:0};this.phase='defense';this.events.push('turn');
 }
 private context():AttackContext{return {tick:this.attackTick,random:this.random,arena:this.arena,soul:this.soul,spawn:(b)=>this.spawn(b),state:this.attackState,bossRatio:this.totalBossHp/this.maxBossHp,turn:this.turn};}
 spawn(init:BulletInit){
  const b:Bullet={id:this.nextId++,vx:0,vy:0,radius:5,damage:0,age:0,lifetime:480,kind:'diamond',color:'#fff',angle:0,rotation:0,ax:0,ay:0,scale:1,grazed:false,telegraph:0,hit:true,data:{},...init};this.bullets.push(b);return b;
 }
 takeDamage(amount:number){
  if(this.invulnerable>0||this.phase==='victory'||this.phase==='defeat')return;
  const alive=this.party.map((p,i)=>p.hp>0?i:-1).filter(i=>i>=0);
  if(!alive.length){this.finish('defeat');return;}
  const target=alive[Math.floor(this.random()*alive.length)];const member=this.party[target];
  const damage=Math.max(1,Math.floor(amount*(member.guard?.55:1)));
  member.hp=Math.max(0,member.hp-damage);this.lastDamage=damage;this.invulnerable=55;this.flash=12;this.hits++;this.events.push('hurt');
  if(this.party.every(p=>p.hp<=0))this.finish('defeat');
 }
 private moveSoul(input:InputFrame){
  const mode=this.activeAttack.mode,hasDirection=input.x!==0||input.y!==0;
  if(mode==='shield'){
   if(input.x)this.soul.shield=input.x>0?0:Math.PI;if(input.y)this.soul.shield=input.y>0?Math.PI/2:-Math.PI/2;return;
  }
  const speed=input.slow?1.2:2.3,norm=hasDirection?Math.hypot(input.x,input.y):1;
  this.soul.x+=input.x*speed/norm;
  if(mode==='blue'){this.soul.vy+=.14;if(input.confirm&&this.soul.y>=this.arena.y+this.arena.height-9)this.soul.vy=-3.7;this.soul.y+=this.soul.vy;}
  else this.soul.y+=input.y*speed/norm;
  this.soul.x=clamp(this.soul.x,this.arena.x+8,this.arena.x+this.arena.width-8);this.soul.y=clamp(this.soul.y,this.arena.y+8,this.arena.y+this.arena.height-8);
  if(mode==='yellow'){
   this.shotTick++;if(input.shoot&&this.shotTick>=12){this.shots.push({x:this.soul.x,y:this.soul.y-10,power:1});this.shotTick=0;this.events.push('shot');}
  }
 }
 private defense(input:InputFrame){
  const attack=this.activeAttack;this.moveSoul(input);const c=this.context();attack.step(c);
  if(this.bullets.length>900)this.bullets.splice(0,this.bullets.length-900);
  const active=[...this.bullets];
  for(const b of active){
   const px=b.x,py=b.y;
   if(attack.update)attack.update(b,c);
   if(b.data.wave){b.vx=Math.sin((b.age+(b.data.phase??0))/17)*b.data.wave;}
   if(b.data.decelerate){const s=Math.hypot(b.vx,b.vy);if(s>1){b.vx*=.96;b.vy*=.96;}}
   if(b.kind==='chain'){const a=(b.data.phase??0)+b.age*.026;b.x=b.data.cx+Math.cos(a)*b.data.orbit;b.y=b.data.cy+Math.sin(a)*b.data.orbit;}
   if(b.data.explode&&b.age===b.data.explode&&!attack.update){ring(c,b.x,b.y,8,2.4,b.kind==='pipis'?'head':b.kind==='gift'?'heart':'shard',c.random()*Math.PI*2);b.lifetime=b.age;}
   b.vx+=b.ax;b.vy+=b.ay;b.x+=b.vx;b.y+=b.vy;b.angle+=b.rotation;b.age++;
   const dangerous=b.hit&&b.age>b.telegraph&&b.age<b.lifetime;
   if(!dangerous)continue;
   let hit=false;
   if(b.kind==='laser-h')hit=this.soul.x>=Math.min(b.x,b.x+b.data.length)&&this.soul.x<=Math.max(b.x,b.x+b.data.length)&&Math.abs(this.soul.y-b.y)<b.radius+3;
   else if(b.kind==='laser-v')hit=this.soul.y>=Math.min(b.y,b.y+b.data.length)&&this.soul.y<=Math.max(b.y,b.y+b.data.length)&&Math.abs(this.soul.x-b.x)<b.radius+3;
   else hit=segmentHitsCircle(px,py,b.x,b.y,this.soul.x,this.soul.y,b.radius+3);
   if(attack.mode==='shield'&&hit){const a=Math.atan2(b.y-this.soul.y,b.x-this.soul.x);if(Math.cos(a-this.soul.shield)>.6){b.lifetime=b.age;this.tp=clamp(this.tp+3,0,100);this.events.push('block');continue;}}
   if(hit){const strongest=Math.max(...this.enemies.filter(e=>e.hp>0).map(e=>e.record.at),8);this.takeDamage(b.damage||Math.max(8,strongest*2.1-3));}
   else if(!b.grazed&&Math.hypot(b.x-this.soul.x,b.y-this.soul.y)<b.radius+19){b.grazed=true;this.tp=clamp(this.tp+1.5,0,100);this.graze++;}
  }
  for(const shot of this.shots){shot.y-=5.5;for(const b of this.bullets){if(b.data.shootable&&Math.hypot(b.x-shot.x,b.y-shot.y)<b.radius+5){b.lifetime=b.age;shot.y=-500;this.tp=clamp(this.tp+2,0,100);this.events.push('block');break;}}}
  this.shots=this.shots.filter(s=>s.y>this.arena.y-60);
  this.bullets=this.bullets.filter(b=>b.age<b.lifetime&&b.x>-450&&b.x<1100&&b.y>-400&&b.y<800);
  if(this.phase!=='defense')return;
  this.attackTick++;
  if(this.attackTick>=attack.duration){
   this.bullets=[];this.shots=[];if(this.practice){this.finish('victory');return;}
   this.turn++;this.actor=0;while(this.actor<3&&this.party[this.actor].hp<=0)this.actor++;
   if(this.actor>=3){this.finish('defeat');return;}
   this.party.forEach(p=>p.guard=false);this.phase='command';this.cursor=0;
  }
 }
 private menuMove(input:InputFrame,length:number){
  const d=(this.phase==='command'?input.x:input.y)||(this.phase==='command'?input.y:input.x);
  if(d&&this.tick-this.lastMenuInput>9){this.cursor=(this.cursor+d+length)%length;this.lastMenuInput=this.tick;this.events.push('menu');}
 }
 selectCommand(index:number){if(!this.paused&&!this.disposed&&this.phase==='command'){this.cursor=clamp(index,0,5);this.confirmCommand();}}
 private confirmCommand(){
  this.pendingCommand=COMMANDS[this.cursor];this.cursor=0;this.events.push('menu');
  if(this.pendingCommand==='DEFEND'){this.party[this.actor].guard=true;this.tp=clamp(this.tp+16,0,100);this.afterAction();}
  else if(this.pendingCommand==='ITEM')this.phase='item';else if(this.pendingCommand==='MAGIC')this.phase='magic';else this.phase='target';
 }
 private performAct(index:number){
  const name=this.actNames[index]??'Check',enemy=this.enemies[this.target];
  if(name==='Check'){this.announce(`* ${enemy.record.name}\n* AT ${enemy.record.at}  DF ${enemy.record.df}\n* ${enemy.hp}/${enemy.maxHp} HP`,()=>this.afterAction());return;}
  const jevil=enemy.record.object==='obj_joker';
  const cost=jevil?(name.toLowerCase().includes('hypno')?50:20):0;
  if(this.tp<cost){this.announce('* Not enough TP.',()=>{this.phase='act';});return;}
  this.tp-=cost;this.mercyActions++;
  if(this.definition.canSpare){enemy.mercy=clamp(enemy.mercy+100/this.definition.mercyGoal,0,100);}
  this.announce(`* ${this.party[this.actor].name} used ${name}.\n${this.definition.canSpare?'* The atmosphere softened.':'* The enemy is watching carefully.'}`,()=>this.afterAction());
 }
 private performMagic(index:number){
  const choices=this.magicChoices(),chosen=choices[index];if(!chosen)return;
  if(this.tp<chosen.cost){this.announce('* Not enough TP.',()=>{this.phase='magic';});return;}
  this.tp-=chosen.cost;
  if(chosen.id==='buster'){const target=this.enemies.find(e=>e.hp>0);if(target){target.hp=Math.max(0,target.hp-350-this.definition.record.chapter*70);this.lastDamage=350+this.definition.record.chapter*70;}}
  else if(chosen.id==='heal'){const target=this.party.reduce((a,b)=>a.hp/a.maxHp<b.hp/b.maxHp?a:b);target.hp=Math.min(target.maxHp,target.hp+70);}
  else{const target=this.enemies.find(e=>e.hp>0&&e.mercy>=99.9);if(target)target.hp=0;else{this.tp+=chosen.cost;this.announce('* The enemy is not tired yet.',()=>this.afterAction());return;}}
  this.announce(`* ${chosen.name}!`,()=>this.afterAction());
 }
 magicChoices(){return this.actor===1?[{id:'buster',name:'Rude Buster',cost:50}]:this.actor===2?[{id:'heal',name:'Heal Prayer',cost:32},{id:'pacify',name:'Pacify',cost:16}]:[{id:'heal',name:'Heal Prayer',cost:32}];}
 step(input:InputFrame){
  if(this.disposed)return;if(input.restart){const wasPractice=this.practice,index=this.attackIndex;this.reset(this.seed);if(wasPractice)this.beginDefense(index);return;}
  if(input.pause){this.paused=!this.paused;return;}if(this.paused||this.phase==='victory'||this.phase==='defeat')return;
  this.tick++;this.invulnerable=Math.max(0,this.invulnerable-1);this.flash=Math.max(0,this.flash-1);
  if(this.phase==='defense'){this.defense(input);return;}
  if(this.phase==='message'){this.messageTick--;if(this.messageTick<=0||input.confirm)this.messageNext();return;}
  if(this.phase==='timing'){
   this.timingTick++;if(input.cancel){this.phase='target';return;}
   if(input.confirm||this.timingTick>=90){const precision=Math.max(0,1-Math.abs(this.timingTick-45)/45),e=this.enemies[this.target];
    const dmg=Math.max(1,Math.round((this.party[this.actor].attack*8-e.record.df*3)*(.35+precision*.9)));
    e.hp=Math.max(0,e.hp-dmg);this.lastDamage=dmg;this.tp=clamp(this.tp+5,0,100);this.events.push('fight');
    this.announce(`* ${dmg} damage.${precision>.9?'\n* A perfect strike!':''}`,()=>this.afterAction(),40);
   }return;
  }
  if(input.cancel&&this.phase!=='command'){this.phase=this.phase==='act'?'target':'command';this.cursor=0;return;}
  if(this.phase==='command'){this.menuMove(input,COMMANDS.length);if(input.confirm)this.confirmCommand();return;}
  if(this.phase==='target'){
   const alive=this.enemies.map((e,i)=>e.hp>0?i:-1).filter(i=>i>=0);
   if(!alive.length){this.finish('victory');return;}
   this.menuMove(input,alive.length);this.target=alive[this.cursor%alive.length];
   if(input.confirm){if(this.pendingCommand==='FIGHT'){this.phase='timing';this.timingTick=0;}else if(this.pendingCommand==='ACT'){this.phase='act';this.cursor=0;}else{
    const e=this.enemies[this.target];if(this.definition.canSpare&&e.mercy>=99.9){e.hp=0;this.announce(`* ${e.record.name} was spared.`,()=>this.afterAction());}else this.announce('* The enemy is not ready to be spared.',()=>this.afterAction());
   }}return;
  }
  if(this.phase==='act'){this.menuMove(input,this.actNames.length);if(input.confirm)this.performAct(this.cursor);return;}
  if(this.phase==='magic'){this.menuMove(input,this.magicChoices().length);if(input.confirm)this.performMagic(this.cursor);return;}
  if(this.phase==='item'){
   if(!this.items.length){this.announce('* No items left.',()=>{this.phase='command';});return;}
   this.menuMove(input,this.items.length);if(input.confirm){const item=this.items.splice(this.cursor,1)[0];const members=item.all?this.party:[item.heal<0?(this.party.find(p=>p.hp<=0)??this.party[this.actor]):this.party[this.actor]];
    for(const member of members)member.hp=item.heal<0?Math.round(member.maxHp*.5):Math.min(member.maxHp,member.hp+item.heal);
    this.announce(`* Used ${item.name}.`,()=>this.afterAction());
   }
  }
 }
}
