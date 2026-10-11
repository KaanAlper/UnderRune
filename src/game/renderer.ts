import {AssetStore} from './assets';
import {BattleSession,COMMANDS} from './battle';
import {ActionSession} from './action';
import type {Bullet,EncounterRecord} from './types';
export function pixelHeart(ctx:CanvasRenderingContext2D,x:number,y:number,color='#ff243c',size=1){
 const pattern=['01100110','11111111','11111111','01111110','00111100','00011000'];ctx.fillStyle=color;
 for(let j=0;j<pattern.length;j++)for(let i=0;i<8;i++)if(pattern[j][i]==='1')ctx.fillRect(Math.round(x+(i-4)*size),Math.round(y+(j-3)*size),size,size);
}
export class Renderer{
 constructor(public ctx:CanvasRenderingContext2D,public assets:AssetStore){}
 private box(x:number,y:number,w:number,h:number,color='#fff',line=3){const c=this.ctx;c.fillStyle='#000';c.fillRect(x,y,w,h);c.strokeStyle=color;c.lineWidth=line;c.strokeRect(x+.5,y+.5,w,h);}
 private text(t:string,x:number,y:number,s=2,c='#fff',a:'left'|'center'|'right'='left'){this.assets.text(this.ctx,t,x,y,s,c,a);}
 clear(){this.ctx.imageSmoothingEnabled=false;this.ctx.fillStyle='#000';this.ctx.fillRect(0,0,640,480);}
 intro(frame:number){
  this.clear();const c=this.ctx;c.strokeStyle='#343039';c.lineWidth=2;c.strokeRect(72,62,496,354);this.text('THE DEVICE',320,153,4,'#fff','center');
  this.text('* ARE YOU THERE?',320,224,2,'#bfbac8','center');this.text('[ Z / ENTER ] CONNECT',320,286,2,frame%90<65?'#ffff00':'#b2a941','center');
  this.text('DELTARUNE  /  LOCAL BOSS BATTLES',320,361,1,'#706b79','center');
 }
 room(chapter:number,count:number){
  this.clear();const c=this.ctx,bg=this.assets.images.get('/device-room/bg.png');if(bg)c.drawImage(bg,-10,-10,660,500);
  c.fillStyle='#000';c.fillRect(157,42,306,281);this.text('DEVICE_MENU',310,50,2,'#fff','center');
  this.text('CHOOSE A SIGNAL',310,89,1,'#9a95a3','center');
  for(let i=1;i<=5;i++){const y=116+(i-1)*32;if(chapter===i){pixelHeart(c,184,y+10,'#ffff00',1);c.fillStyle='#191608';c.fillRect(197,y-1,244,27);}this.text('DEVICE_CHAPTER_'+i,207,y,1,chapter===i?'#ffff00':'#cac4cc');}
  this.text(`${count} SOURCE ENCOUNTERS`,310,283,1,'#726b75','center');
  const glow=this.assets.images.get('/device-room/tvglow.png');if(glow){c.globalAlpha=.23;c.drawImage(glow,0,317,640,160);c.globalAlpha=1;}
  const console=this.assets.images.get('/device-room/console.png');if(console)c.drawImage(console,221,342,198,90);
  const vessel=this.assets.images.get('/device-room/vessel_d_0.png');if(vessel)c.drawImage(vessel,301,394,38,76);
 }
 menu(records:EncounterRecord[],selected:number,chapter:number,frame:number,completed:string[]){
  this.clear();const c=this.ctx;this.box(18,19,604,437,'#aaa5b6',2);this.text('DEVICE_CHAPTER_'+chapter,40,33,2);this.text('SELECT A BATTLE',40,68,1,'#797582');
  const start=Math.floor(selected/8)*8,record=records[selected];
  for(let row=0;row<8;row++){
   const r=records[start+row];if(!r)continue;const y=108+row*35,is=start+row===selected;
   if(is){c.fillStyle='#1d1905';c.fillRect(31,y-4,343,31);pixelHeart(c,44,y+8,'#ffff00',1);}
   let name=r.name;if(this.assets.textWidth(name,1)>275)name=name.slice(0,31)+'...';
   this.text(name,62,y,1,is?'#ffff00':completed.includes(r.id)?'#99e5a0':'#cbc7d1');
   this.text('#'+r.encounter,365,y,1,'#716a7a','right');
  }
  c.strokeStyle='#36313e';c.lineWidth=1;c.beginPath();c.moveTo(390,93);c.lineTo(390,397);c.stroke();
  if(record){
   const enemies=record.enemies;for(let i=0;i<enemies.length;i++){
    const e=enemies[i],sprite=this.assets.getSprite(e.sprite,chapter);if(!sprite)continue;
    const scale=Math.min(2,170/sprite.width,(enemies.length>1?120:180)/sprite.height);
    this.assets.draw(c,e.sprite,chapter,503+(enemies.length>1?(i%2?35:-35):0),110+(enemies.length>1?Math.floor(i/2)*80:0),scale,frame/12);
   }
   this.text(record.kind==='secret'?'SECRET ENCOUNTER':record.kind==='main'?'MAIN ENCOUNTER':'BOSS ENCOUNTER',503,310,1,'#c0a4ff','center');
   this.text('HP '+record.enemies.reduce((n,e)=>n+e.hp,0),503,339,1,'#a8a2b0','center');
   this.text('BROWSER ADAPTATION',503,365,1,'#a69876','center');
  }
  this.text(`${selected+1}/${records.length}   UP/DOWN SELECT`,40,410,1,'#807b87');
  if(records.length>8){this.text('< PREV',415,410,1,'#c3bccb');this.text('NEXT >',515,410,1,'#c3bccb');}
  this.text('[Z] BATTLE   [T] PRACTICE',40,432,1,'#c3bccb');this.text('[X] BACK',600,432,1,'#82798b','right');
 }
 drawBosses(b:BattleSession){
  const c=this.ctx,chapter=b.definition.record.chapter;
  for(let i=0;i<b.enemies.length;i++){
   const e=b.enemies[i];if(e.hp<=0)continue;let name=e.record.sprite;
   if(name==='spr_battle_laninomarker')name='spr_lanino_idle';if(name==='spr_battle_elninamarker')name='spr_elnina_idle';
   const sprite=this.assets.getSprite(name,chapter);if(!sprite)continue;
   const scale=Math.min(2,185/sprite.width,(b.enemies.length>1?82:225)/sprite.height);
   const x=b.enemies.length>1?480+(i%2?60:-30):495,y=b.enemies.length>1?47+Math.floor(i/2)*105:35;
   this.assets.draw(c,name,chapter,x,y,scale,b.tick/12);
  }
 }
 private bullet(b:Bullet,session:BattleSession){
  if(b.kind==='knight-stream-hit')return;
  if(b.kind==='knight-stream'||b.kind==='knight-warning'){
   const c=this.ctx,a=session.arena;c.save();c.beginPath();c.rect(a.x,a.y,a.width,a.height);c.clip();c.strokeStyle=b.color;c.lineWidth=Math.max(.1,b.data.width);const x=b.x+Math.cos(b.angle)*200,y=b.y+Math.sin(b.angle)*200;c.beginPath();c.moveTo(x,y);c.lineTo(x-Math.cos(b.angle)*b.data.length,y-Math.sin(b.angle)*b.data.length);c.stroke();c.restore();return;
  }
  const c=this.ctx;const age=b.age,telegraph=age<=b.telegraph;c.save();c.globalAlpha=telegraph?.25:!b.hit?.32:1;
  const flash=telegraph&&Math.floor(age/5)%2===0;if(flash)c.globalAlpha=.55;
  if(b.kind.startsWith('laser-')){
   c.strokeStyle=b.color;c.lineWidth=telegraph?1:b.radius*2;c.setLineDash(telegraph?[8,6]:[]);c.beginPath();c.moveTo(b.x,b.y);c.lineTo(b.kind==='laser-h'?b.x+b.data.length:b.x,b.kind==='laser-v'?b.y+b.data.length:b.y);c.stroke();c.restore();return;
  }
  c.translate(Math.round(b.x),Math.round(b.y));c.rotate(b.angle);const spriteNames:Record<string,string>={spade:'spr_spadebullet','ring-spade':'spr_spadebullet',diamond:'spr_diamondbullet',club:'spr_clubsbullet',scythe:'spr_joker_scythebody',carousel:'spr_carousel',bike:'spr_lancerbike',axe:'spr_axebullet_b',heart:'spr_heart',feather:'spr_titan_feather',darkstar:'spr_knight_bullet_star',bell:'spr_gerson_bell'};
  const sprite=spriteNames[b.kind],asset=sprite?this.assets.getSprite(sprite,session.definition.record.chapter):undefined;
  if(asset&&this.assets.draw(c,sprite,session.definition.record.chapter,0,-asset.height*.23,b.scale*.46,session.attackTick/8)){c.restore();return;}
  c.fillStyle=b.color;c.strokeStyle=b.color;c.lineWidth=2;
  const r=Math.max(4,b.radius);
  if(['star','darkstar','sun','electric'].includes(b.kind)){
   c.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,rad=i%2?r/2:r*1.3;c.lineTo(Math.cos(a)*rad,Math.sin(a)*rad);}c.closePath();c.fill();
  }else if(b.kind==='note'){c.fillRect(-2,-12,2,16);c.fillRect(-2,-12,7,2);c.beginPath();c.ellipse(-5,4,4,3,-.3,0,Math.PI*2);c.fill();}
  else if(['head','cat','tv','box','gift','square','house','pot','bomb'].includes(b.kind)){
   c.fillRect(-r,-r,r*2,r*2);c.fillStyle='#000';c.fillRect(-r+2,-r+2,r*2-4,r*2-4);c.fillStyle=b.color;c.fillRect(-r+3,-2,3,3);c.fillRect(r-6,-2,3,3);if(b.kind==='tv'){c.fillRect(-r,-r-3,r*2,1);}if(b.kind==='gift'){c.fillRect(-1,-r,2,r*2);c.fillRect(-r,-1,r*2,2);}
  }else if(['slash','sword','hammer','spear','halberd'].includes(b.kind)){c.fillRect(-r*2,-2,r*4,4);c.fillRect(r,-r,4,r*2);}
  else if(['heart','petal'].includes(b.kind))pixelHeart(c,0,0,b.color,1.6);
  else if(b.kind==='chain'){c.strokeRect(-r,-r,r*2,r*2);c.beginPath();c.moveTo(0,0);c.lineTo(b.data.cx-b.x,b.data.cy-b.y);c.stroke();}
  else{c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.fill();c.fillStyle='#000';c.fillRect(-1,-r+2,2,r*2-4);}
  c.restore();
 }
 battle(b:BattleSession,reducedEffects=false){
  if(b instanceof ActionSession){this.actionBattle(b);return;}
  this.clear();const c=this.ctx;
  if(!reducedEffects&&b.definition.record.enemies.some(e=>e.object==='obj_joker')){
   c.strokeStyle='#211735';c.lineWidth=2;for(let i=0;i<6;i++){const off=(b.tick/3+i*65)%380;c.beginPath();c.moveTo(0,off);c.lineTo(640,off-250);c.stroke();}
  }
  this.text('DEVICE_'+b.definition.record.id.toUpperCase().replace('-','_'),20,8,1,'#66616d');this.text(b.practice?'PRACTICE':'BATTLE',620,8,1,'#66616d','right');
  const names=['spr_krisb_idle','spr_susieb_idle','spr_ralseib_idle'];
  for(let i=0;i<3;i++)this.assets.draw(c,names[i],1,82,52+i*71,1.5,b.tick/14,b.party[i].hp<=0?.25:1);
  this.drawBosses(b);
  // Enemy defense lives in the upper stage, like DELTARUNE's battle screen.
  if(b.phase==='defense'){
   const a=b.arena;this.box(a.x,a.y,a.width,a.height,'#fff',4);
   this.text(b.activeAttack.name,320,280,1,'#b5a8c9','center');
   for(const bullet of b.bullets)this.bullet(bullet,b);
   for(const shot of b.shots){c.fillStyle='#ffff00';c.fillRect(shot.x-1,shot.y-7,3,10);}
   const blink=b.invulnerable>0&&Math.floor(b.tick/4)%2===0;
   if(!blink){const color=b.activeAttack.mode==='yellow'?'#ffff00':b.activeAttack.mode==='blue'?'#519cfa':b.activeAttack.mode==='shield'?'#68fa8c':'#ff243c';pixelHeart(c,b.soul.x,b.soul.y,color,1.6);}
   if(b.activeAttack.mode==='shield'){c.strokeStyle='#57f787';c.lineWidth=4;c.beginPath();const a=b.soul.shield;c.moveTo(b.soul.x+Math.cos(a)*23-Math.sin(a)*13,b.soul.y+Math.sin(a)*23+Math.cos(a)*13);c.lineTo(b.soul.x+Math.cos(a)*23+Math.sin(a)*13,b.soul.y+Math.sin(a)*23-Math.cos(a)*13);c.stroke();}
   c.fillStyle='#2e2839';c.fillRect(a.x,a.y+a.height+9,a.width,2);c.fillStyle=b.definition.accent;c.fillRect(a.x,a.y+a.height+9,a.width*(1-b.attackTick/b.activeAttack.duration),2);
  }
  this.box(18,302,604,76,'#fff',3);
  if(b.phase==='command'){this.text(`* ${b.party[b.actor].name}, what will you do?`,36,314,2);this.text(b.definition.record.name,36,349,1,'#99919f');}
  else if(['target','act','item','magic'].includes(b.phase)){
   const rows=b.phase==='target'?b.enemies.filter(e=>e.hp>0).map(e=>`${e.record.name}  ${e.hp}HP  ${Math.floor(e.mercy)}%`):b.phase==='act'?b.actNames:b.phase==='item'?b.items.map(i=>i.name):b.magicChoices().map(m=>m.name+'  '+m.cost+'TP');
   const start=Math.floor(b.cursor/4)*4;for(let i=0;i<4;i++){const row=rows[start+i];if(!row)continue;const x=40+(i%2)*285,y=310+Math.floor(i/2)*31;if(start+i===b.cursor)pixelHeart(c,x,y+12,'#ffff00',1.3);this.text(row,x+15,y,1,start+i===b.cursor?'#ffff00':'#fff');}
  }else if(b.phase==='timing'){
   this.text('* Strike at the center!',34,309,1,'#aaa0b5');c.strokeStyle='#ad373f';c.lineWidth=2;c.strokeRect(75,335,490,31);c.fillStyle='#ff394e';c.fillRect(312,336,16,29);c.fillStyle='#fff';c.fillRect(75+490*b.timingTick/90-2,330,4,39);
  }else if(b.phase==='message'){this.text(b.message,36,310,1,'#fff');}
  else if(b.phase==='defense'){this.text('* Move your SOUL. Stay determined.',36,313,1);this.text(b.activeAttack.mode==='yellow'?'[Z] SHOOT   [X/SHIFT] SLOW':b.activeAttack.mode==='shield'?'ARROWS: TURN YOUR SHIELD':'ARROWS / WASD: MOVE    [X/SHIFT] SLOW',36,345,1,'#bdb0cd');}
  const hpWidth=75;
  for(let i=0;i<3;i++){
   const p=b.party[i],x=18+i*204;this.box(x,391,197,37,p.color,2);this.text(p.name,x+9,392,1,p.hp<=0?'#767080':p.color);
   this.text(`${Math.max(0,p.hp)}/${p.maxHp}`,x+187,392,1,'#fff','right');c.fillStyle='#793033';c.fillRect(x+9,413,hpWidth,7);c.fillStyle=p.hp/p.maxHp<.25?'#f44':p.color;c.fillRect(x+9,413,hpWidth*Math.max(0,p.hp)/p.maxHp,7);if(p.guard)this.text('GUARD',x+98,410,1,p.color);
  }
  for(let i=0;i<COMMANDS.length;i++){const x=18+i*102;this.box(x,439,95,27,b.phase==='command'&&b.cursor===i?'#ffff00':'#854821',2);this.text(COMMANDS[i],x+47,442,1,b.phase==='command'&&b.cursor===i?'#ffff00':'#ffa34a','center');}
  const tpX=174;c.fillStyle='#773b20';c.fillRect(tpX,85,10,130);c.fillStyle='#ff8c42';c.fillRect(tpX,215-130*b.tp/100,10,130*b.tp/100);this.text(`${Math.floor(b.tp)}%`,179,59,1,'#ffa052','center');this.text('TP',179,220,1,'#ffad65','center');
  if(!reducedEffects&&b.flash){c.fillStyle='rgba(255,24,50,.09)';c.fillRect(0,0,640,480);}
  if(b.phase==='victory'||b.phase==='defeat'){
   c.fillStyle='rgba(0,0,0,.94)';c.fillRect(0,0,640,480);this.text(b.phase==='victory'?(b.practice?'PATTERN COMPLETE':'VICTORY'):'GAME OVER',320,132,4,b.phase==='victory'?'#ffff00':'#fff','center');
   this.text(b.phase==='victory'?'* A signal worth remembering.':'* Stay determined.',320,229,2,'#b4a8c2','center');
   this.text(`TURNS ${b.turn}   HITS ${b.hits}   GRAZE ${b.graze}`,320,281,1,'#8c8199','center');this.text('[R] TRY AGAIN   [X] DEVICE_MENU',320,339,1,'#d4cadf','center');
  }
  if(b.paused){c.fillStyle='rgba(0,0,0,.86)';c.fillRect(0,0,640,480);this.text('PAUSED',320,190,4,'#fff','center');this.text('[P] RESUME   [X] DEVICE_MENU',320,271,1,'#b6adbf','center');}
 }
 actionBattle(b:ActionSession){
  this.clear();const c=this.ctx;this.box(43,78,554,329,'#777182',3);
  c.strokeStyle='#171423';c.lineWidth=1;for(let x=45;x<595;x+=32){c.beginPath();c.moveTo(x,80);c.lineTo(x,405);c.stroke();}for(let y=80;y<405;y+=32){c.beginPath();c.moveTo(45,y);c.lineTo(595,y);c.stroke();}
  this.text(b.definition.record.name.toUpperCase(),320,12,2,'#eee','center');this.text('ACTION ADAPTATION / PHASE '+b.actionPhase,320,45,1,'#a18cb6','center');
  const sprite=b.definition.record.enemies[0].sprite,asset=this.assets.getSprite(sprite,3);
  if(asset)this.assets.draw(c,sprite,3,b.opponent.x,b.opponent.y-35,Math.min(1.3,100/asset.height),b.tick/10);
  const player=b.definition.special==='mantle'?'spr_krisb_idle':'spr_susiezilla_susie_idle',pa=this.assets.getSprite(player,3);
  if(!(b.invulnerable>0&&Math.floor(b.tick/4)%2===0)){
   if(pa)this.assets.draw(c,player,3,b.soul.x,b.soul.y-27,Math.min(1.2,54/pa.height),b.tick/12);else pixelHeart(c,b.soul.x,b.soul.y,'#ff243c',2);
  }
  if(b.strikeFlash>0){c.strokeStyle='#ffff88';c.lineWidth=4;c.beginPath();c.arc(b.soul.x,b.soul.y,58,b.facing-.65,b.facing+.65);c.stroke();}
  const period=b.definition.special==='mantle'?150-Math.min(b.actionPhase,4)*15:130,cycle=b.tick%period;
  if(cycle>10&&cycle<35){c.strokeStyle='#ed8bd0';c.setLineDash([6,6]);c.beginPath();c.moveTo(b.opponent.x,b.opponent.y);c.lineTo(b.soul.x,b.soul.y);c.stroke();c.setLineDash([]);this.text('DASH!',b.opponent.x,b.opponent.y-55,1,'#ffca7c','center');}
  for(const bullet of b.bullets)this.bullet(bullet,b);
  c.fillStyle='#25172f';c.fillRect(410,60,175,8);c.fillStyle='#c795ed';c.fillRect(410,60,175*b.totalBossHp/b.maxBossHp,8);
  this.text('HP '+b.totalBossHp.toFixed(b.definition.special==='mantle'?2:0)+' / '+b.maxBossHp,585,419,1,'#ccaddf','right');
  this.text('PLAYER '+b.party[0].hp+' / 8',55,419,1,'#6ee8ef');this.text('[Z] STRIKE   [X] DASH   ARROWS MOVE',320,445,1,'#ddd','center');
  this.text(b.practice?'PRACTICE: DODGE ONLY':'GET CLOSE AND FACE THE ENEMY TO STRIKE',320,466,1,'#918898','center');
  if(b.phase==='victory'||b.phase==='defeat'){
   c.fillStyle='rgba(0,0,0,.86)';c.fillRect(0,0,640,480);this.text(b.phase==='victory'?'VICTORY':'SIGNAL LOST',320,200,3,'#fff','center');this.text('[R] RESTART   [X] DEVICE_MENU',320,330,1,'#ddd','center');
  }
  if(b.paused){c.fillStyle='rgba(0,0,0,.86)';c.fillRect(0,0,640,480);this.text('PAUSED',320,200,3,'#fff','center');this.text('[P] RESUME   [X] DEVICE_MENU',320,270,1,'#ddd','center');}
 }
}
