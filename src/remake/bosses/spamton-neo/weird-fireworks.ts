/** The solo ending's three Pipis, their shootable rings, and controller type 51. */
import {type GmInstance,type GmObjectDef,type GmRuntime} from '../../gm/runtime';
import {growtangle,bulletInit} from '../../deltarune/battle';
import {mergeColor,moveToRememberXY,snd} from '../../deltarune/chapter2-battle';
import {scrAfterimageCut} from './support';

export function createWeirdFireworks(object:(name:string)=>GmObjectDef):GmObjectDef[]{
 const bullet:GmObjectDef={name:'obj_sneo_weird_end_pipis_bullet',index:31,parent:object('obj_collidebullet'),sprite:'spr_sneo_crew',depth:0,events:{
  create:s=>{bulletInit(s);Object.assign(s,{element:6,timer:0,con:0,target:1,damage:16,imageBlend:mergeColor(0xe8a200,0xffff00,.25+Math.sin(1/3)*.25)});},
  step:()=>{},
  user1:(s,rt)=>{snd(rt,'snd_bomb',1.1+rt.random.random(.2));scrAfterimageCut(s,rt,object);rt.destroy(s);},
 },collisions:[{target:object('obj_yheart_shot'),run:(s,shot,rt)=>{if(shot.big===0)rt.userEvent(shot,0);rt.userEvent(s,1);}}]};
 const pipis:GmObjectDef={name:'obj_sneo_weird_end_pipis',index:34,sprite:'spr_pipis_egg',depth:0,events:{
  create:s=>{Object.assign(s,{imageSpeed:0,imageXscale:2,imageYscale:2,imageAlpha:0,damage:2,target:1,grazepoints:1,timepoints:1});},
  step:s=>{s.imageAlpha+=.08;},
  user0:(s,rt)=>{
   let angle=rt.random.random(80),speed=4;
   for(let ring=0;ring<2;ring++){
    for(let i=0;i<9;i++){
     const b=rt.create(bullet,s.x,s.y);s.bullet=b.id;b.sprite='spr_spamtonhead';b.imageIndex=rt.random.choose(0,1,2,3);b.imageSpeed=.25;
     b.direction=angle+rt.random.random(20);b.speed=2+speed;b.depth=s.depth-1;b.target=s.target;angle+=40;
    }
    speed+=4;angle=rt.random.random(50);
   }
   rt.destroy(s);
  },
 },collisions:[{target:object('obj_yheart_shot'),run:(s,shot,rt)=>{
  rt.userEvent(s,0);snd(rt,'snd_damage');if(shot.big===0)rt.userEvent(shot,0);
  const fx=rt.create(object('obj_pipis_destroy_fx'),s.x,s.y);s.fx=fx.id;fx.imageXscale=1.5;fx.imageYscale=1.5;rt.destroy(s);
 }}]};
 const controller:GmObjectDef={name:'obj_dbulletcontroller',index:394,sprite:'spr_grazemask',visible:false,depth:0,events:{
  create:(s,rt)=>{
   Object.assign(s,{type:1,btimer:99,timermax:12,damage:-1,grazepoints:-1,timepoints:-1,inv:-1,grazed:-1,grazetimer:-1,element:'none',target:-1,ratio:1,side:1,difficulty:0,made:0,special:0,roundcount:0,init:0,sameattack:0,sameattacker:0,miny:999,maxy:999,maxx:999,creator:0});
   const n=rt.globals.monster.filter((v:number)=>v===1).length;if(n===2)s.ratio=1.6;if(n===3)s.ratio=2.3;
  },
  step:(s,rt)=>{
   if(s.type!==51)throw Error(`Solo NEO bullet controller type ${s.type} is not ported`);
   const g=rt.globals;
   if(s.init===0){
    s.__sameattack=0;for(s._sameattacki=0;s._sameattacki<3;s._sameattacki++)if(g.monsterattackname[s._sameattacki]===g.monsterattackname[s.creator]&&g.monster[s._sameattacki]===1)s.__sameattack++;
    s.sameattack=s.__sameattack;
    if(s.sameattack>1){if(s.creator===2)s.sameattacker=s.sameattack-1;else if(s.creator===1)s.sameattacker=s.sameattack===3?s.creator:Number(g.monsterattackname[0]===g.monsterattackname[1]);}
    const box=rt.first(growtangle);if(box){s.miny=box.y-rt.spriteHeight(box)/2;s.maxy=box.y+rt.spriteHeight(box)/2;s.minx=box.x-rt.spriteWidth(box)/2;s.maxx=box.x+rt.spriteWidth(box)/2;}s.init=1;
   }
   s.btimer++;
   if(s.btimer>=1&&s.made===0){s.made=1;for(const [x,y] of [[530,100],[448,168],[510,250]]){const egg=rt.create(pipis,rt.view.x+x,rt.view.y+y);s.pip=egg.id;egg.damage=s.damage;egg.target=s.target;}}
   if(s.btimer>=45&&s.btimer<46){snd(rt,'snd_explosion_8bit');for(const egg of rt.withInstances(pipis))rt.userEvent(egg,0);}
   if(s.btimer>=100&&s.btimer<110){s.btimer=120;for(const enemy of rt.withInstances(object('obj_spamton_neo_enemy')))moveToRememberXY(enemy,rt,4);g.turntimer=1;}
  },
 }};
 return [bullet,pipis,controller];
}
