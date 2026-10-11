import type {Attack,AttackContext} from '../../game/types';
import {attack,shot,aim,ring,TAU} from '../patterns';
const source='chapter1_windows:gml_Object_obj_joker_Other_15 + obj_dbulletcontroller_Step_0';
function teleport(id:string,fast=false):Attack{
 return attack(id,fast?'DIAMOND TELEPORT':'SPADE TELEPORT',source,c=>{
  const period=fast?18:40;
  if(c.tick%period===0){const sign=c.random()<.5?-1:1;c.state.x=c.arena.x+c.arena.width/2+sign*(100+c.random()*100);c.state.y=c.arena.y+c.arena.height/2+(c.random()<.5?-1:1)*c.random()*100;}
  // Source obj_joker_teleport grows to scale 2 then waits 8 source frames.
  if(fast?c.tick%period===6:c.tick%period===24){const x=c.state.x,y=c.state.y;if(fast)aim(c,x,y,4,'diamond');else for(let i=0;i<5;i++)aim(c,x,y,2.25,'spade',(i-2)*Math.PI/10);}
 },{duration:360});
}
function spadeRing(id:string,period=120,grav=.4):Attack{
 return attack(id,'SPADE RING',source,c=>{
  if(c.tick%period!==0)return;
  const centerX=c.arena.x+c.arena.width/2,centerY=c.arena.y+c.arena.height/2,start=c.random()*TAU;
  for(let i=0;i<10;i++){
   const a=start+i*TAU/10;
   c.spawn({x:centerX-Math.cos(a)*300,y:centerY-Math.sin(a)*300,vx:Math.cos(a)*13,vy:Math.sin(a)*13,angle:a,kind:'ring-spade',radius:5,data:{a,release:30+(i+1)*8,grav},lifetime:300});
  }
 },{duration:420,update:(b)=>{
  if(b.age<30){b.vx*=Math.sqrt(.87);b.vy*=Math.sqrt(.87);}
  if(b.age===30){b.vx=0;b.vy=0;}
  if(b.age===b.data.release){b.vx=-Math.cos(b.data.a)*1.7;b.vy=-Math.sin(b.data.a)*1.7;}
  if(b.age>b.data.release){b.vx+=Math.cos(b.data.a)*b.data.grav/4;b.vy+=Math.sin(b.data.a)*b.data.grav/4;}
 }});
}
function bombs(id:string,bombType:number,period=24):Attack{
 return attack(id,['SPADE BOMBS','DIAMOND BOMBS','HEART BOMBS','CLUB BOMBS'][bombType],source,c=>{
  if(c.tick%period===0){const cx=c.arena.x+c.arena.width/2,x=cx+(c.random()<.5?-1:1)*(180+c.random()*100);
   c.spawn({x,y:c.arena.y-210,vy:5,kind:'bomb',radius:10,scale:1.25,data:{explode:40+Math.floor(c.random()*32),bombType},lifetime:160});}
 },{duration:bombType===3?600:bombType===0?540:420,update:(b,c)=>{
  if(b.kind!=='bomb'||b.age!==b.data.explode)return;
  b.lifetime=b.age;
  if(b.data.bombType===0)ring(c,b.x,b.y,12,4,'spade',c.random()*TAU);
  if(b.data.bombType===1)for(let i=0;i<3;i++)aim(c,b.x,b.y,(11-i)/2,'diamond');
  if(b.data.bombType===2)ring(c,b.x,b.y,8,2.8,'heart',0,{color:'#ff6b96'});
  if(b.data.bombType===3)for(let i=0;i<3;i++)aim(c,b.x,b.y,4,'club',(i-1)*Math.PI/9);
 }});
}
function carousel(id:string,alt=3):Attack{
 return attack(id,'CAROUSEL',source,c=>{
  if(c.tick!==0)return;
  const [cx,cy]=[c.arena.x+c.arena.width/2,c.arena.y+c.arena.height/2];
  for(let i=0;i<3;i++)for(let j=0;j<7;j++)c.spawn({x:cx+150,y:cy-80+i*80,kind:'carousel',radius:9,data:{cx,cy:cy-80+i*80,siner:j*18,vsin:j*9,alt},telegraph:50,lifetime:520,color:'#ffffff'});
 },{duration:480,update:(b)=>{
  if(b.kind!=='carousel')return;
  const prev=Math.sin(b.data.siner/20);b.data.siner+=(b.data.alt===3?1.15:1.1)/2;
  const value=Math.sin(b.data.siner/20);b.x=b.data.cx-value*150;
  b.hit=value<prev&&b.age>50;b.data.vsin+=.5;b.y+=Math.sin(b.data.vsin/10)*1.75*(b.data.alt===1?-1:1);
 }});
}
function scythe(id:string,insane=false):Attack{
 return attack(id,'DEVILSKNIFE',source,c=>{
  if(c.tick===0){const [cx,cy]=[c.arena.x+c.arena.width/2,c.arena.y+c.arena.height/2];for(let i=0;i<4;i++)c.spawn({x:cx,y:cy,kind:'scythe',radius:10,rotation:.08,telegraph:50,lifetime:500,data:{cx,cy,phase:i*TAU/4,insane:insane?1:0}});}
 },{duration:480,update:b=>{if(b.kind!=='scythe')return;const a=b.data.phase+b.age*(b.data.insane?.025:.018),r=Math.cos(b.age/36)*125;b.x=b.data.cx+Math.cos(a)*r;b.y=b.data.cy+Math.sin(a)*r;}});
}
export const jevilAttacks:Attack[]=[teleport('j0'),spadeRing('j1'),bombs('j2',2,40),scythe('j3'),carousel('j4'),bombs('j5',3),attack('j6','DIAMOND FOUNTAIN',source,c=>{if(c.tick%8===0)shot(c,c.soul.x-100+c.random()*200,c.arena.y+c.arena.height+35,-Math.PI/2,3.5,'diamond');}),spadeRing('j7',108,.45),carousel('j8',2),bombs('j9',0),attack('j10','DARK CLUBS',source,c=>{if(c.tick%36===0){const a=(c.random()<.5?Math.PI/4:Math.PI*3/4)+(c.tick%72===0?Math.PI:0);shot(c,c.soul.x+Math.cos(a)*360,c.soul.y+Math.sin(a)*360,a+Math.PI,6,'club',{data:{decelerate:1},rotation:.04});}}),scythe('j11',true),teleport('j12',true),bombs('j13',0),attack('j14','DIAMOND STORM',source,c=>{if(c.tick%18===0)shot(c,c.soul.x-100+c.random()*200,c.arena.y-45,Math.PI/2,3.5,'diamond');}),attack('j15','FINAL CHAOS',source,c=>{if(c.tick%50===0){const [x,y]=[c.arena.x+c.arena.width/2,c.arena.y+c.arena.height/2];ring(c,x,y-150,12,3.1,'scythe',c.tick/80,{rotation:.05});}if(c.tick%110===0)ring(c,c.soul.x,c.soul.y,8,-2.2,'spade',c.tick/80,{telegraph:30});},{duration:1500})];
