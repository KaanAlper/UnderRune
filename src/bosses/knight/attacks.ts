import sourceData from './source-data.json';
import {attack,shot} from '../patterns';
import type {AttackContext,Bullet} from '../../game/types';
const s=sourceData.stream,tickRatio=60/sourceData.fps;
const rad=(degrees:number)=>-degrees*Math.PI/180;
const approach=(value:number,target:number,amount:number)=>value<target?Math.min(target,value+amount):Math.max(target,value-amount);
const source=sourceData.package!.id+':'+sourceData.scripts.map(s=>s.name).join(' / ');
function beam(c:AttackContext,x:number,y:number,direction:number,warning=false){
 return c.spawn({x,y,angle:rad(direction),kind:warning?'knight-warning':'knight-stream',hit:false,color:warning?'#808080':'#ff0000',lifetime:(warning?s.warningLifetime:s.lifetime)*tickRatio,data:{width:warning?4:8,length:0,direction}});
}
/** Controller 103 translated from decoded GML; updates retain the source 30 Hz clock. */
export const knightStream=attack('knight-source-103','X ATTACK / SOURCE 103',source,c=>{
 if(c.tick%tickRatio!==0)return;
 const frame=Math.floor(c.tick/tickRatio)+1,timer=(frame-1)%s.period+1;
 if(frame===1)c.state.angle=s.angleBase+Math.floor(c.random()*(s.angleRange*2+1))-s.angleRange;
 if(timer===s.spawnFrames[0]){
  const shift=Math.floor(c.random()*81)-40,plane=c.random()<.5;
  c.state.x=c.arena.x+c.arena.width/2+(plane?shift:0);c.state.y=c.arena.y+c.arena.height/2+(plane?0:shift);
  beam(c,c.state.x,c.state.y,c.state.angle);beam(c,c.state.x,c.state.y,180-c.state.angle);
 }
 for(let j=1;j<s.spawnFrames.length;j++)if(timer===s.spawnFrames[j]){
  for(const direction of [c.state.angle,180-c.state.angle])for(const sign of [-1,1]){
   const a=rad(direction+270),offset=j*s.offsetStep*sign;
   beam(c,c.state.x+Math.cos(a)*offset,c.state.y+Math.sin(a)*offset,direction,true);
  }
 }
 if(timer===s.period){c.state.angle+=25+Math.floor(c.random()*26);if(c.state.angle>70)c.state.angle-=40;}
},{duration:540,update:(b:Bullet,c)=>{
 if(!['knight-stream','knight-warning'].includes(b.kind)||b.age%tickRatio!==0)return;
 const timer=Math.floor(b.age/tickRatio)+1,warning=b.kind==='knight-warning';
 let goal=warning?(timer>=6?0:4):timer>=20&&timer<40?(timer<24?64:32)+Math.sin(timer*2.35)*16:timer>8?0:8;
 b.data.width=approach(b.data.width,goal,Math.min(Math.abs(goal-b.data.width)*.5,16));
 b.data.length=approach(b.data.length,s.lineLength,s.lineGrowth);
 if(!warning&&timer>s.hitStart&&timer%s.hitPeriod===0&&timer<s.hitEnd){
  const direction=b.data.direction;
  for(const sign of [-1,1])for(let i=1;i<4;i++){
   const a=rad(direction+270),offset=s.offsetStep*i*sign;
   shot(c,b.x+Math.cos(a)*offset,b.y+Math.sin(a)*offset,rad(direction+180),s.speed/tickRatio,'knight-stream-hit',{radius:5,angle:rad(direction),color:'#ff0000'});
  }
 }
}});
