import {resolveEvent,type GmInstance,type GmObjectDef,type GmRuntime} from '../../gm/runtime';
import {pointDirection,lengthdirX,lengthdirY} from '../../gm/math';
import {damage,damageAll} from '../../deltarune/battle';
import {snd} from '../../deltarune/sound';
export function createTasqueQuiz(object:(n:string)=>GmObjectDef):GmObjectDef[]{
 const get=(rt:GmRuntime,id:number)=>{const a=rt.byId(id)??(id===object('obj_tm_whip_animation').index?rt.first(object('obj_tm_whip_animation')):undefined);if(!a)throw Error(`Tasque quiz requires live instance ${id}`);return a;};
 const zap:GmObjectDef={...object('obj_tm_quizzap'),events:{
  create:(s,rt)=>{resolveEvent(s.object.parent!,'create')?.(s,rt);Object.assign(s,{destroyonhit:0,letter:-1,xx:s.x,yy:s.y,active:0,imageAlpha:0,rotated:false});},
  step:s=>{if(!s.rotated){s.imageAngle=[0,90,-90,180][s.letter];s.imageAlpha=1;s.imageXscale=2;s.imageYscale=2;s.active=1;s.rotated=true;}},
  alarm0:(s,rt)=>rt.destroy(s),
  user5:(s,rt)=>{if(s.active===1){if(rt.globals.inv<0&&rt.exists(object('obj_tm_quizzler'))){const tm=rt.first(object('obj_tasque_manager_enemy'));if(tm)tm.hitbysimonsaysattackcount++;}if(s.target!==3)damage(s,rt);if(s.target===3)damageAll(s,rt);if(s.destroyonhit===1)rt.destroy(s);}},
  draw:(s,rt)=>{rt.drawSprite('spr_tm_zapbox',0,s.x,s.y,1,1,s.imageAngle+45,0xffffff,1);rt.drawSelf(s);if(s.letter===0||s.letter===3)s.yy=s.y+(s.letter===0?-50:50);else s.xx=s.x+(s.letter===1?-50:50);
   const y=s.yy+rt.random.randomRange(-2,2),x=s.xx+rt.random.randomRange(-2,2);rt.drawSprite('spr_tm_letters',s.letter,x,y,1,1,0,0,1);},
 }};
 const letter:GmObjectDef={...object('obj_tm_quizletter'),events:{
  create:(s,rt)=>{resolveEvent(s.object.parent!,'create')?.(s,rt);s.imageBlend=0;s.outline=false;},
  draw:(s,rt)=>{s.ol=s.outline?2:0;rt.drawState.color=s.outline?0:0xffffff;rt.drawCircle(s.x,s.y,24+s.ol);if(s.ol===2)s.ol++;s.tailx=s.x+lengthdirX(36+s.ol,s.direction+180);s.taily=s.y+lengthdirY(36+s.ol,s.direction+180);s.tailbx=lengthdirX(16+s.ol,s.direction+90);s.tailby=lengthdirY(16+s.ol,s.direction+90);s.tailcx=lengthdirX(16+s.ol,s.direction-90);s.tailcy=lengthdirY(16+s.ol,s.direction-90);rt.drawTriangle(s.tailx,s.taily,s.x+s.tailbx,s.y+s.tailby,s.x+s.tailcx,s.y+s.tailcy);},
  endDraw:(s,rt)=>{if(!s.outline)rt.drawSelf(s);},
 }};
 const result:GmObjectDef={...object('obj_tm_quiz_result'),events:{create:s=>{s.timer=0;s.max_time=45;},step:(s,rt)=>{s.timer++;if(s.timer<=2){s.imageXscale=3-s.timer/2;s.imageYscale=3-s.timer/2;}if(s.timer>=s.max_time)rt.destroy(s);}}};
 const quiz:GmObjectDef={...object('obj_tm_quizzler'),events:{
  create:(s,rt)=>{Object.assign(s,{init:0,difficulty:0,currentturn:0,turns:1,manualturns:false,letters:[0],turnspeed:30,lastletter:-1,state:0,timer:0,voiceclips:['snd_tm_quiz_a','snd_tm_quiz_b','snd_tm_quiz_c','snd_tm_quiz_d'],canrepeat:true,creator:0,damage:-1,target:-1,element:6,tm:0,animator:-4,nextdifficulty:false,dojo:false,restart:false,rounds:0,hit:false,controller:0});
   const a=rt.first(object('obj_tm_whip_animation'));if(a)s.animator=object('obj_tm_whip_animation').index;else{const b=rt.create(object('obj_tm_whip_animation'),s.x,s.y);s.animator=b.id;b.visible=false;b.state=-1;}},
  destroy:(s,rt)=>{get(rt,rt.globals.monsterinstance[s.creator]).visible=true;},
  alarm0:(s,rt)=>{const a=get(rt,s.animator);a.zapping=false;if(s.hit){a.state=3;rt.destroy(s);}},
  alarm1:(s,rt)=>{const a=get(rt,s.animator);a.zapping=false;a.state=3;rt.destroy(s);},
  beginStep:(s,rt)=>{
   const a=get(rt,s.animator),box=rt.first(object('obj_growtangle'));if(!box)throw Error('Tasque quiz requires arena');s.canrepeat=false;
   if(rt.globals.encounterno===89&&rt.globals.inv>0&&s.hit===false){get(rt,s.controller).special=-4;s.hit=true;}
   if(s.init===0||s.restart){if(s.init===0){a.creator=s.creator;a.quizmode=1;}if(s.difficulty>=4){s.turnspeed=40-(s.difficulty-4)*5;s.turns=s.difficulty-3;}else if(s.difficulty===5){s.turnspeed=30;s.turns=5;}else if(s.difficulty===4){s.turnspeed=40;s.turns=4;}
    s.tm=rt.globals.monsterinstance[s.creator];s.init=1;s.restart=false;const tm=s.tm===-4?undefined:get(rt,s.tm);
    for(s.i=0;s.i<s.turns;s.i++){if(tm&&tm.lastQuizLetter!==-1){let next=rt.random.irandom(2);if(next===tm.lastQuizLetter)next=3;s.letters[s.i]=next;tm.lastQuizLetter=next;}else{s.letters[s.i]=rt.random.irandom(3);if(tm)tm.lastQuizLetter=s.letters[s.i];}}
   }
   s.timer--;if(s.state===-1&&s.timer<=0){s.timer=0;s.state=0;}
   if(s.state===0){if(s.currentturn===s.turns){a.targetx=box.x+100;a.targety=box.y;s.state=1;a.quizloop=true;s.currentturn=0;s.timer=s.turnspeed+10;}
    else if(s.timer<=0){let dir=180;if(s.turns>1){const bottom=s.turns===2?170:s.turns===3?155:140,top=s.turns===2?190:s.turns===3?205:220;dir=bottom+(top-bottom)*s.currentturn/(s.turns-1);}
     const x=s.x+80+lengthdirX(36,dir),y=s.y+40+lengthdirY(36,dir);let n=0;
     for(s.i=0;s.i<2;s.i++){const l=rt.create(letter,x,y);s.temp=l.id;l.sprite='spr_tm_letters';l.imageSpeed=0;n=s.letters[s.currentturn];l.imageIndex=n;l.direction=dir;l.speed=10;l.friction=1;s.timer=s.turnspeed-20;if(s.i===1){l.outline=1;l.depth++;}l.alarm[0]=20*(s.turns-s.currentturn)-(s.turns-1-s.currentturn)*2;}s.currentturn++;snd(rt,s.voiceclips[n]);
    }
   }else if(s.state===1){if(a.state===0&&s.timer<20)a.state=1;if(s.timer<=0){a.zapping=true;let time=s.difficulty>=4?Math.max(10,Math.min(s.turnspeed-20,20)):20;if(s.difficulty===1||s.difficulty===2)time=15;
     for(s.i=0;s.i<4;s.i++){if(s.i===s.letters[s.currentturn])continue;const d=rt.create(zap,box.x+1,box.y);s.d=d.id;d.damage=s.damage;d.target=s.target;d.element=s.element;d.alarm[0]=time;d.letter=s.i;}s.currentturn++;a.state=2;s.timer=s.turnspeed;if(s.currentturn===s.turns){s.alarm[1]=time;s.state=2;s.timer=20;}else s.alarm[0]=time;}}
  },
 }};
 return [zap,letter,result,quiz];
}
