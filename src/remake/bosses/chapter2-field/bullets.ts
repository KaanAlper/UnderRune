import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {pointDirection} from '../../gm/math';
import {darkMarker} from '../../deltarune/battle';
import {bulletInherit2,snd} from '../../deltarune/chapter2-battle';
import {monsterPop} from '../../deltarune/controller';
type Objects=(n:string)=>GmObjectDef;
export const createChapter2FieldBulletRunner=(object:Objects)=>(s:GmInstance,rt:GmRuntime)=>runChapter2FieldBullets(s,rt,object);
/** Run after the shared source prelude, which sets bounds/init and advances btimer. */
export function runChapter2FieldBullets(s:GmInstance,rt:GmRuntime,object:Objects):boolean{
 const first=(name:string)=>{const i=rt.first(object(name));if(!i)throw Error(`Field attack requires ${name}`);return i;};
 const owner=()=>{const i=rt.byId(rt.globals.monsterinstance[s.creator]);if(!i)throw Error('Field controller creator is absent');return i;};
 const make=(name:string,x:number,y:number)=>{const d=rt.create(object(name),x,y);d.damage=s.damage;d.target=s.target;if('element' in s)d.element=s.element;return d;};
 if(s.type===34){if(s.btimer>=14*(s.difficulty+1)){if(s.init===1||s.side===1){s.side=rt.random.irandom(2);s.init=2;}else s.side=(s.side+rt.random.irandom(1))%3;snd(rt,'snd_spearappear',1.2);const d=rt.create(object('obj_werewerewire_laserbullet'),s.x,s.y);s.d=d.id;d.grazepoints=4;d.damage=s.damage;d.target=s.target;d.attackdirection=s.side;s.btimer=0;}return true;}
 if(s.type===2){if(s.btimer>=10*s.ratio){s.btimer=0;s.radius=120+rt.random.random(80);const b=rt.create(object('obj_yarnmaker'),s.x,s.y);s.bm=b.id;bulletInherit2(s,b);const speed=8+(s.y-rt.view.y-40)/160*8,gravity=0.5;
    const distance=s.made%3===2?s.x-first('obj_heart').x+4:rt.random.random(250)+(s.x-s.maxx),angle=speed*speed/gravity<=distance?45:90-Math.asin(distance*gravity/(speed*speed))*180/Math.PI/2;
    b.direction=180-angle;b.damage=s.damage;b.target=s.target;b.childgravity=0.6;b.childspeed=speed;b.grazepoints=7;b.imageAngle=s.direction;s.made++;}return true;}
 if(s.type===3){if(s.init===1){s.init=2;const a=rt.create(object('obj_tasque_meowing'),s.x,s.y);s.special=a.id;a.loop=0;a.imageSpeed=0;a.creator=s.creator;a.depth=owner().depth;owner().visible=false;if(s.sameattacker>=1)s.btimer=rt.random.randomRange(6,18)*s.ratio*(1+s.difficulty);}
   if(s.btimer>=(s.difficulty>=2?40:24)*s.ratio*(1+s.difficulty)){s.btimer=0;const d=rt.create(object('obj_chainbullet'),s.x+28,s.y+34);s.d=d.id;d.childBullet=object('obj_tasque_soundwave').index;snd(rt,'snd_electric_meow',rt.random.randomRange(0.8,1.2),0.8);d.element=6;d.damage=s.damage;d.grazepoints=1.4;const h=first('obj_heart');d.direction=pointDirection(s.x+28,s.y+34,h.x+8,h.y+8);d.childSpeed=s.difficulty===1?4:7;d.firingSpeed=2;d.target=s.target;d.sprite='spr_meow';const a=rt.byId(s.special);if(a){a.imageSpeed=0.5;a.imageIndex=0;}}return true;}
 if(s.type===20){if(s.init===1){const d=rt.create(object('obj_tm_whip_attack'),s.x-22,s.y-6);s.d=d.id;d.depth=owner().depth;owner().visible=false;d.creator=s.creator;d.damage=s.damage;d.target=s.target;d.element=6;d.grazepoints=4;d.difficulty=monsterPop(rt)===1?1:0;d.animSpeed=1;s.init=2;}return true;}
 if(s.type===19){if(s.init===1){const w=rt.first(object('obj_mauswheel_enemy'));if(w){rt.globals.turntimer=w.firstturn===1?120:250;w.firstturn=0;}let d=rt.create(object('obj_maus_cursor_follow'),s.x,s.y);s.d=d.id;d.damage=s.damage;d.target=s.target;d.grazepoints=4;d=rt.create(object('obj_player_trail'),s.x,s.y);s.d=d.id;d.depth=first('obj_heart').depth+1;s.init=2;d.damage=s.damage;d.target=s.target;}
   if([140,200,270].includes(s.btimer)){const w=rt.first(object('obj_mauswheel_enemy'));if(w&&w.cursor_count>1){const d=rt.create(object('obj_maushwheel_lightning_orb'),w.x+62,w.y+70);s.d=d.id;d.damage=s.damage;d.target=s.target;d.grazepoints=4;}}return true;}
 if(s.type!==32)return false;
 const box=first('obj_growtangle');
 if(s.init===1){s.dd=0;s.dd2=0;s.phase=0;s.strikes=0;if(s.special===1)rt.globals.turntimer=5400;
  let d=rt.create(object('obj_bulletparent'),box.x+1,box.y);s.d=d.id;d.sprite='spr_tm_grid';d.imageAngle=45;d.imageBlend=0x808080;d.element=6;d.depth=box.depth-1;
  for(let i=0;i<4;i++){let x=box.x,y=box.y;if(i===0||i===3)y+=i===0?-50:50;else x+=i===1?-50:50;d=rt.create(object('obj_bulletparent'),x,y);s.d=d.id;d.sprite='spr_tm_letters';d.imageSpeed=0;d.imageIndex=i;d.element=6;d.imageBlend=0x808080;d.depth=box.depth-1;}
  box.target_angle=45;box.imageAngle=45;d=make('obj_tm_quizzler',s.x-22,s.y-6);s.d=d.id;s.made++;d.depth=owner().depth;d.controller=s.id;d.element=6;d.dojo=s.special< -2;d.creator=s.creator;owner().lastQuizLetter=-1;d.difficulty=s.difficulty;s.init=2;rt.globals.turntimer+=120;s.btimer=0;
 }
 const attacktimer=s.difficulty>0?s.difficulty===3?40:60:90,ready=!rt.exists(object('obj_tm_quizzler'));
 if((s.made===4||s.special< -2)&&ready&&s.btimer>=0){
  if(s.special===1){s.special=-2;s.btimer=-20;}
  else if(s.special===-2){s.special=-1;s.difficulty++;const d=darkMarker(rt,s,s.x+80,s.y+4,'spr_tm_pleased_effect');s.thismarker=d.id;d.imageSpeed=1;s.dd=d.id;
   const d2=darkMarker(rt,s,s.x+74,s.y+66,'spr_cutscene_26_tasquemanager');s.dd2=d2.id;
   let mark=rt.create(object('obj_bulletparent'),s.x+s.phase*40,s.y+175);mark.sprite='spr_tm_maru';mark.imageXscale=2;mark.imageYscale=2;
   mark=rt.create(object('obj_tm_quiz_result'),box.x,box.y);mark.sprite='spr_tm_maru_big';mark.imageXscale=3;mark.imageYscale=3;mark.depth=first('obj_heart').depth-15;mark.max_time=45;d.depth=d2.depth-1;
   for(const m of rt.all(object('obj_tasque_manager_enemy')))m.visible=false;snd(rt,'snd_coin');s.btimer=-45;s.phase++;
  }else if(s.special===-1){for(const id of [s.dd,s.dd2]){const d=rt.byId(id);if(d)rt.destroy(d);}s.made=0;for(const m of rt.all(object('obj_tasque_manager_enemy')))m.visible=true;
   if(s.strikes===3){rt.globals.flag[36]=1;rt.globals.flag[39]=1;rt.globals.turntimer=10;s.btimer=-40;first('obj_tasque_manager_enemy').hspeed=10;return true;}
   if(s.phase===3){s.special=-5;rt.globals.flag[39]=1;rt.globals.turntimer=10;s.btimer=-40;first('obj_tasque_manager_enemy').hspeed=10;}else{s.special=1;s.btimer=attacktimer-10;}
  }else if(s.special===-4&&rt.globals.encounterno===89){s.special=-3;s.btimer=-20;}
  else if(s.special===-3){s.special=-1;s.made=4;s.dd2=darkMarker(rt,s,s.x,s.y,'spr_tm_hurt').id;for(const m of rt.all(object('obj_tasque_manager_enemy')))m.visible=false;snd(rt,'snd_error');
   if(rt.globals.encounterno===89){let m=rt.create(object('obj_bulletparent'),s.x+s.strikes*40,s.y+215);m.sprite='spr_tm_batsu';m.imageXscale=2;m.imageYscale=2;m.element=6;s.strikes++;s.btimer=-45;m=rt.create(object('obj_tm_quiz_result'),box.x,box.y);m.sprite='spr_tm_batsu_big';m.imageXscale=3;m.imageYscale=3;m.depth=first('obj_heart').depth-15;m.max_time=45;}
  }
 }else if(ready&&s.btimer>attacktimer&&s.special>=0&&s.made<4){if(s.special===1)s.made++;const d=make('obj_tm_quizzler',s.x-22,s.y-6);s.d=d.id;d.element=6;d.creator=s.creator;d.controller=s.id;d.difficulty=s.difficulty;d.turnlength=90;s.btimer=0;if(s.special===1)d.dojo=true;}
 return true;
}
