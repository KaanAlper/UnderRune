// NEO's phone call and the Pipis attack: obj_sneo_phonecall (the phone that drops in, rings, and hands over to the
// attack: "IT'S FOR YOU"), obj_pipis_controller (NEO's arm cannon lobbing Pipis eggs, by variant), obj_pipis_egg_bullet
// (an egg: bounces, cracks under shots, bursts into heads), its pieces and effects, obj_pipis_wall (the green line
// eggs burst on), obj_sneo_pipis_bomb (a bomb among the eggs), and the hard mode's head stream.
import {moveTowardsPoint,type GmInstance,type GmObjectDef,type GmRuntime} from '../../gm/runtime';
import {distanceToObject} from '../../gm/collision';
import {C,mergeColor} from '../../gm/graphics';
import {eq,gt,lengthdirX,lengthdirY,lt,pointDirection,pointDistance} from '../../gm/math';
import {bulletInit,tensionHeal} from '../../deltarune/battle';
import {held,KEY,button1_p} from '../../deltarune/keys';
import {isPhase,moveToRememberXY,msgSet} from '../../deltarune/chapter2-battle';
import {enemyBlcon2} from '../../deltarune/chapter2-objects';
import {easeOut} from '../../deltarune/ease';
import {snd} from '../../deltarune/sound';
import {sourceText} from '../../host/text';
import {scrAfterimageCut} from './support';

const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
/** scr_orbitx / scr_orbity: (x, y) turned by `angle` degrees around (cx, cy). */
function orbit(cx:number,cy:number,x:number,y:number,angle:number):[number,number]{
 if(angle===0)return [x,y];
 const theta=pointDirection(cx,cy,x,y)+angle,r=pointDistance(cx,cy,x,y);
 return [cx+lengthdirX(r,theta),cy+lengthdirY(r,theta)];
}
const button3_h=(rt:GmRuntime)=>held(rt,KEY.c,KEY.ctrl);

export function createNeoPhonecall(object:(name:string)=>GmObjectDef):GmObjectDef[]{
 const neo=(rt:GmRuntime)=>rt.first(object('obj_spamton_neo_enemy'))!;
 const box=(rt:GmRuntime)=>rt.first(object('obj_growtangle'))!;
 const heart=(rt:GmRuntime)=>rt.first(object('obj_heart'));

 const phonecall:GmObjectDef={name:'obj_sneo_phonecall',index:629,parent:object('obj_bulletparent'),sprite:'spr_sneo_phone',depth:0,
  events:{
   create:(s,rt)=>{
    Object.assign(s,{timer:0,seen:0,writeline:false,state:0,talktimer:-15,talking:false,talkmax:45,songtime:0,secondtime:0,skipintro:0,resumeinterval:1.715,
     sneo:object('obj_spamton_neo_enemy'),isattack:0,target:0,peeking:0,siner:0,init:0,visible:false,ydrop:0,ringtimer:0,damage:-1});
    s.target=-1;s.fadealpha=1;s.textboxdistance=20;s.textboxoffsetx=0;s.textboxoffsety=0;
    void rt;
   },
   step:(s,rt)=>{
    const g=rt.globals,n=neo(rt);
    if(s.init===0){s.y=-30;s.visible=true;s.init=1;}
    if(s.state<7){g.turntimer=430;if(n.difficulty===3)g.turntimer=100;}
    if(s.talking){
     s.talktimer+=1;
     const fastHard=n.difficulty===3&&s.state>=5?1:0;
     if(button1_p(rt)&&s.talktimer>5&&fastHard===0)s.talktimer=s.talkmax;
     if(button3_h(rt)&&s.talktimer>1&&fastHard===0)s.talktimer=s.talkmax;
     if(s.talktimer>=s.talkmax){
      n.talktimer=n.talkmax;
      for(const w of rt.all(object('obj_writer')))rt.destroy(w);
      s.talking=false;s.talktimer=-10;s.state+=1;
     }
     return;
    }
    if(s.state===6){
     if(isPhase(rt,'bullets',s)||s.isattack){
      if(!s.secondtime){s.songtime=s.songtime+s.resumeinterval-s.songtime%s.resumeinterval;if(s.songtime>140)s.songtime=0;}
      if(s.isattack){
       if(n.difficulty===3)rt.create(stream,n.x+n.partx[5],n.y+n.party[5]+60);
       else{
        for(const c of rt.all(object('obj_sneo_bulletcontroller')))rt.destroy(c);
        const reach=s.secondtime?30:70;
        const [ox,oy]=orbit(0,0,-26,reach,n.partrot[1]);
        const xx=ox+n.x+n.partx[1]+n.partxoff[1],yy=oy+n.y+n.party[1]+n.partyoff[1];
        g.monsterattackname[n.myself]='FootballPipis';
        const d=rt.create(object('obj_sneo_bulletcontroller'),xx,yy);s.d=d.id;
        d.type=1;d.damage=g.monsterat[n.myself]*5;d.target=s.target;
       }
      }
      s.state=7;
     }
     return;
    }
    if(s.talktimer<0)s.talktimer+=1;
    else if(s.state===0){
     s.ringtimer=12;s.sndphone=snd(rt,'snd_phone')??-1;rt.sourceAudio?.volume(s.sndphone,0.7,0);
     s.talktimer=-10;s.state+=1;
    }else if(s.state===1){
     s.talktimer=-10;s.state+=1;n.partmode=6;
     if(s.skipintro===1)s.state=5;
    }else if(s.state===2){
     if(n.difficulty===3)msgSet(rt,0,sourceText('obj_sneo_phonecall_slash_Step_0_gml_89_0'));
     else{msgSet(rt,0,sourceText('obj_sneo_phonecall_slash_Step_0_gml_96_0'));n.partmode=7;}
     s.writeline=true;
    }else if(s.state===3){
     if(n.difficulty===3)s.state=5;
     else{msgSet(rt,0,sourceText('obj_sneo_phonecall_slash_Step_0_gml_136_0'));n.partmode=7;s.writeline=true;}
    }else if(s.state===4)s.state=5;
    else if(s.state===5){
     if(isPhase(rt,'bullets',s)&&s.skipintro===0){
      s.textboxoffsetx=10;s.textboxoffsety=20;
      if(n.difficulty===3)msgSet(rt,0,sourceText('obj_sneo_phonecall_slash_Step_0_gml_176_0'));
      else{msgSet(rt,0,sourceText('obj_sneo_phonecall_slash_Step_0_gml_138_0'));n.partframe[1]=3;}
      s.textboxdistance=40;s.writeline=true;
     }else s.state=6;
     for(const e of rt.all(object('obj_spamton_neo_enemy'))){
      if(n.difficulty!==3){e.partmode=9;e.partrot[1]=-180;e.partframe[1]=3;}
      else{e.partmode=9;e.partframe[1]=4;}
     }
    }
    if(s.writeline){
     s.writeline=false;
     for(const e of rt.all(object('obj_spamton_neo_enemy'))){
      g.typer=72;
      enemyBlcon2(e,rt,e.x-s.textboxdistance+22-s.textboxoffsetx,e.y+60+s.textboxoffsety,10);
     }
     s.talktimer=0;s.talking=true;
    }
   },
   draw:(s,rt)=>{
    const d=rt.drawState,n=neo(rt);
    d.alpha=s.fadealpha;d.color=C.white;
    if(s.state===0||(s.state===1&&n.partframe[1]===0)){
     s.siner+=1;
     rt.drawSelf(s);
     rt.drawLine(s.x,s.y,n.x+n.partx[5],-20,2);
     s.imageAngle=Math.sin(s.siner/20)*10;
     if(s.ringtimer>0){
      s.imageAngle+=s.ringtimer%2===0?1:-1;
      s.ringtimer-=1;
      if(s.ringtimer<=6)n.partmode=5;
     }
     s.x=s.xstart+Math.sin((s.siner+0)/20)*10;
     if(lt(s.ydrop,1))s.ydrop+=0.02;
     s.y=lerp(-30,s.ystart,easeOut(s.ydrop,-2));
    }else{
     const [ox,oy]=orbit(0,0,20,50,n.partrot[1]);
     s.xx=ox+n.x+n.partx[1]+n.partxoff[1];
     s.yy=oy+n.y+n.party[1]+n.partyoff[1];
     rt.drawLine(s.xx,s.yy,n.x+n.partx[5],-20,2);
    }
    d.alpha=1;
   },
   destroy:(s,rt)=>{
    neo(rt).partmode=1;
    for(const e of rt.all(object('obj_spamton_neo_enemy')))moveToRememberXY(e,rt,8);
    void s;
   },
  },
  // Shots pass through the phone.
  collisions:[{target:object('obj_yheart_shot'),run:()=>{}}],
 };

 /** The hard mode's stream of heads from NEO's mouth. */
 const stream:GmObjectDef={name:'obj_sneo_phonecall_pipis_stream',index:667,parent:object('obj_collidebullet'),depth:0,events:{
  create:s=>{s.timer=0;},
  step:(s,rt)=>{
   // GML evaluates call arguments last first: y's random comes before x's.
   const py=s.y-4+rt.random.random(8),px=s.x-4+rt.random.random(8);
   const part=rt.create(streamHead,px,py);s.part=part.id;
   part.direction=-5+rt.random.random(38);part.speed=7+rt.random.random(13);part.imageAngle=s.direction-180;
  },
 }};
 const streamHead:GmObjectDef={name:'obj_sneo_phonecall_sneohead',index:665,sprite:'spr_sneo_crew',depth:0,events:{
  create:s=>{Object.assign(s,{imageXscale:0.5,imageYscale:-0.5,timer:0,con:0,homingfactor:0,maxhomingfactor:2});},
  step:(s,rt)=>{
   if(lt(rt.globals.turntimer,3))rt.destroy(s);
   s.imageAngle=s.direction-180;
   s.timer+=1;
   if(s.timer>=4+rt.random.irandom(1)){
    rt.destroy(s);
    const fx=rt.create(destroyFx,s.x,s.y);s.fx=fx.id;fx.imageXscale=2;fx.imageYscale=2;fx.imageSpeed=1;
    snd(rt,'snd_rocket_sneo');rt.sourceAudio?.volume('snd_rocket_sneo',0.1,0);
    const n=neo(rt);n.partx[5]=rt.random.random(8);n.party[5]=rt.random.random(8);
   }
  },
 }};

 /** Where the arm cannon's mouth is. */
 const muzzle=(s:GmInstance,xx:number,yy:number):[number,number]=>[xx+5+lengthdirX(50,s.imageAngle+270),yy+lengthdirY(50,s.imageAngle+270)];
 /** An egg (or bomb) fired from the cannon. */
 const fire=(s:GmInstance,rt:GmRuntime,def:GmObjectDef,xx:number,yy:number)=>{
  const [mx,my]=muzzle(s,xx,yy);const b=rt.create(def,mx,my);s.bul=b.id;return b;
 };
 const smoke=(s:GmInstance,rt:GmRuntime,xx:number,yy:number)=>{
  for(let n=0;n<3;n++){const b=fire(s,rt,armcannonSmoke,xx,yy);b.depth=s.depth-2;}
 };
 const pipisController:GmObjectDef={name:'obj_pipis_controller',index:660,sprite:'spr_sneo_arml',depth:0,events:{
  create:(s,rt)=>{
   Object.assign(s,{con:0,timer:0,con2:0,timer2:0,timer3:0,variant:2,eggcount:20,savex:0,firstshot:1});
   s.siner=rt.random.irandom(100);
   Object.assign(s,{timervariance:30,pipiscount:0,speedvar:2,movecon:0,movetimer:0,imageAngle:-170,imageXscale:2,angle_final:-170,damage:0,target:0,sprite:'spr_sneo_arml_egg',maxpipis:10});
  },
  draw:(s,rt)=>{
   const g=rt.globals,R=rt.random,v=rt.view;
   s.siner+=0.25;
   let xx=v.x+v.width-10;
   const yy=v.y+v.height-230+Math.sin(s.siner/6)*21;
   let shake=0;
   if(s.sprite==='spr_sneo_arml_egg')shake=-4+R.random(8);
   if(s.movecon===0){
    s.movetimer+=1;xx=lerp(v.x+v.width+70,v.x+v.width-10,s.movetimer/10);
    if(s.movetimer===10){s.movetimer=0;s.movecon=1;}
   }
   if(lt(g.turntimer,16))s.movecon=2;
   if(s.movecon===2){
    s.movetimer+=1;xx=lerp(v.x+v.width-10,v.x+v.width+70,s.movetimer/10);
    if(s.movetimer===10)rt.destroy(s);
   }
   const eggs=()=>rt.count(eggBullet);
   if(s.variant===3&&s.movecon===1){
    if(s.con===0){
     s.timer+=1;
     if(s.timer>=1){
      if(!rt.exists(pipisWall)){const b=box(rt);const w=rt.create(pipisWall,b.x+200,b.y+rt.spriteHeight(b)/2+60);s.wall=w.id;w.imageXscale=2.5;}
      s.con=1;s.timer=0;
     }
    }
    if(s.con===1){
     for(let n=0;n<3;n++){
      if(R.irandom(10)<6){
       const b=fire(s,rt,pipisBomb,xx,yy);
       b.gravity=0.2+R.random(3)/100;b.vspeed=-6-R.random(2);b.hspeed=-1.8-R.random(1.5);b.target=s.target;b.damage=s.damage;b.depth=s.depth-1;b.directhit=1;
      }else{
       const b=fire(s,rt,eggBullet,xx,yy);
       b.type=3;b.gravity=0.2+R.random(3)/100;b.vspeed=-6-R.random(2);b.hspeed=-1.6-R.random(3);b.target=s.target;b.damage=s.damage;b.depth=s.depth-1;b.directhit=1;
      }
     }
     s.sprite='spr_sneo_arml';s.angle_final=-180+R.random(50);
     smoke(s,rt,xx,yy);
     s.con=2;
    }
    if(s.con===2){
     s.timer+=1;
     if(s.timer<11)s.imageAngle=lerp(s.imageAngle,s.angle_final,s.timer/10);
     if(s.timer<s.timervariance-15&&gt(s.eggcount,0.4))s.imageXscale=lerp(1.8,2.5,s.timer/(s.timervariance-15));
     if(s.timer===s.timervariance-15&&gt(s.eggcount,0.4)){s.sprite='spr_sneo_arml_egg';s.imageXscale=2;}
     if(s.timer>=s.timervariance){s.eggcount-=0.4;s.timervariance=60+R.irandom(15);s.con=1;s.timer=0;}
    }
   }
   if(s.variant===2&&s.movecon===1){
    if(s.con===0){
     s.timer+=1;
     if(s.timer>=1){
      if(!rt.exists(pipisWall)){const b=box(rt);const w=rt.create(pipisWall,b.x+200,b.y+rt.spriteHeight(b)/2);s.wall=w.id;w.imageXscale=2.9;}
      s.con=1;s.timer=0;
     }
    }
    if(s.con===1){
     // Every few eggs one is lobbed low and straight at the soul (aa = 0).
     let aa=1;s.pipiscount+=1;
     if(s.pipiscount===3||s.pipiscount===5||s.pipiscount===9)aa=0;
     if(s.pipiscount===0||s.pipiscount===4||s.pipiscount===8||s.pipiscount===11)aa=1;
     /** A high lob; its hspeed is drawn after its gravity. */
     const lob=(hspeed:()=>number)=>{const b=fire(s,rt,eggBullet,xx,yy);b.type=2;b.gravity=0.5+R.random(10)/100;b.vspeed=-14;b.hspeed=hspeed();b.target=s.target;b.damage=s.damage;b.depth=s.depth-1;return b;};
     const straight=()=>{const b=fire(s,rt,eggBullet,xx,yy);b.type=2;b.gravity=0.063+R.random(4)/100;b.vspeed=-4.25;b.hspeed=-4;b.target=s.target;b.damage=s.damage;b.depth=s.depth-1;b.directhit=1;};
     if(neo(rt).difficulty===0){
      let rand=0.8;if(gt(g.turntimer,380))rand=0.5;
      let rr=0;if(eggs()<2&&lt(g.turntimer,250))rr=1;
      if(eggs()<3&&s.pipiscount<s.maxpipis){
       if(aa===1)lob(()=>-1.55-rr-R.random(rand));
       else straight();
      }
     }else{
      let rr=0;if(eggs()<2&&lt(g.turntimer,250))rr=1;
      if(eggs()<3){
       let a=-1.6-R.random(0.6);
       // a is drawn but never used (as in the original).
       if(aa===1){for(let n=0;n<2;n++){lob(()=>-1.55-rr-R.random(0.8));a=-2.2-R.random(0.6);}}
       else{straight();lob(()=>-1.4-R.random(0.4));a=-2.2-R.random(0.6);}
       void a;
      }
     }
     s.sprite='spr_sneo_arml';s.angle_final=-180+R.random(50);
     smoke(s,rt,xx,yy);
     s.con=2;
    }
    let r=1;if(eggs()<1)r=3;
    for(let n=0;n<r;n++){
     if(s.con===2){
      s.timer+=1;
      if(s.timer<11)s.imageAngle=lerp(s.imageAngle,s.angle_final,s.timer/10);
      if(s.timer<s.timervariance-15&&gt(s.eggcount,0.4))s.imageXscale=lerp(1.8,2.5,s.timer/(s.timervariance-15));
      if(s.timer===s.timervariance-15&&gt(s.eggcount,0.4)&&s.pipiscount<s.maxpipis){s.sprite='spr_sneo_arml_egg';s.imageXscale=2;}
      if(s.timer>=s.timervariance){
       s.eggcount-=0.4;s.timervariance=30+R.irandom(15);
       if(gt(s.eggcount,0)){s.con=0;s.timer=0;}else rt.destroy(s);
      }
     }
    }
   }
   rt.drawSprite('spr_sneo_wingl',0,xx,yy+20,2,2,20,C.white,1);
   rt.drawSprite(s.sprite,1,xx,yy+11+shake/2,s.imageXscale,2,s.imageAngle+shake,C.white,1);
   rt.drawSprite('spr_sneo_body',0,xx,yy+20,2,2,0,C.white,1);
   rt.drawSprite('spr_sneo_head',1,xx+26,yy,2,2,0,C.white,1);
   if(s.pipiscount>=s.maxpipis&&gt(g.turntimer,10)&&!rt.exists(eggBullet))g.turntimer=10;
   if(lt(g.turntimer,1))rt.destroy(s);
   if(s.variant===0){
    const b=box(rt);
    if(s.con===0){
     s.timer+=1;
     if(s.timer===1){s.savex=b.x+220-80+R.random(160);rt.create(pipisWall,s.savex,b.y-R.random(30)+rt.spriteHeight(b)/2);}
     if(s.timer>=10){s.con=1;s.timer=0;}
    }
    if(s.con===1){const e=rt.create(eggBullet,s.savex,v.y-20);s.bul=e.id;e.gravity=0.2+R.random(10)/100;e.target=s.target;e.damage=s.damage;s.con=2;}
    if(s.con===2){
     s.timer+=1;
     if(s.timer>=50){
      s.eggcount-=1;
      if(gt(s.eggcount,0)){s.con=0;s.timer=0;for(const w of rt.all(pipisWall))w.con=1;}
      else rt.destroy(s);
     }
    }
   }
   if(s.variant===1){
    const b=box(rt);
    if(s.con===0){
     s.timer+=1;
     if(s.timer===1){const w=rt.create(pipisWall,b.x+190-50+R.random(100),b.y+rt.spriteHeight(b)/2);s.wall=w.id;w.type=1;}
     if(s.timer>=10){s.con=1;s.timer=0;}
    }
    if(s.con===1){
     const wall=rt.byId(s.wall)!;
     const e=rt.create(eggBullet,wall.x,v.y-20);s.bul=e.id;e.gravity=0.2+R.random(10)/100;e.type=1;e.parent=wall.id;e.target=s.target;e.damage=s.damage;s.con=2;
    }
    if(s.con===2){
     s.timer+=1;
     if(s.timer>=50){
      s.eggcount-=1;
      if(gt(s.eggcount,0)){s.con=0;s.timer=-40;const w=rt.byId(s.wall);if(w)w.con=1;}
      else rt.destroy(s);
     }
    }
    if(s.con2===0){
     s.timer2+=1;
     if(s.timer2===40){const w=rt.create(pipisWall,b.x+280-50+R.random(100),b.y-rt.spriteHeight(b)/2);s.wall2=w.id;w.type=1;}
     if(s.timer2>=50){s.con2=1;s.timer2=0;}
    }
    if(s.con2===1){
     const wall2=rt.byId(s.wall2)!;
     const e=rt.create(eggBullet,wall2.x,v.y+v.height+20);s.bul=e.id;e.gravity=0.2+R.random(10)/100;e.gravityDirection=90;e.type=1;e.parent=wall2.id;e.target=s.target;e.damage=s.damage;s.con2=2;
    }
    if(s.con2===2){
     s.timer2+=1;
     if(s.timer2>=50){
      s.eggcount-=1;
      if(gt(s.eggcount,0)){s.con2=0;s.timer2=0;const w=rt.byId(s.wall2);if(w)w.con=1;}
      else rt.destroy(s);
     }
    }
    s.timer3+=1;
    if(s.timer3===150){
     const e=rt.create(eggBullet,v.x+v.width,b.y);s.bul=e.id;e.gravity=0.6+R.random(10)/100;e.gravityDirection=180;e.target=s.target;e.damage=s.damage;
    }
   }
  },
 }};

 /** The egg breaks: a burst, then (by type) a cone of heads at the soul or a ring of heads, and egg pieces. */
 const burst=(s:GmInstance,rt:GmRuntime)=>{
  const R=rt.random,n=neo(rt);
  const fx=rt.create(destroyFx,s.x,s.y);s.fx=fx.id;fx.imageXscale=1.5;fx.imageYscale=1.5;
  if(n.difficulty!==4){
   const h=heart(rt)!;
   if(s.type===2||s.type===3){
    const spread=s.type===2?[25,50]:[20,40];
    for(s.i=0;s.i<10;s.i+=1){
     const hed=rt.create(pipisBulletCone,s.x,s.y);s.hed=hed.id;
     hed.direction=pointDirection(s.x,s.y,h.x+10,h.y+10)-spread[0]+R.random(spread[1]);
     hed.speed=15+R.random(5);hed.depth=s.depth-100;
     if(s.type===2){hed.sprite='spr_sneo_crew';hed.imageXscale=0.5;hed.imageYscale=0.5;}
     hed.target=s.target;hed.damage=s.damage;hed.grazed=0;hed.element=6;
    }
   }else{const c=rt.create(pipisCenter,s.x,s.y);s.center=c.id;c.target=s.target;c.damage=s.damage;}
  }
  if(n.difficulty===4)throw Error('obj_pipis_egg_bullet: difficulty 4 bursts are not ported');
  for(let k=0;k<3;k++){
   const p=rt.create(eggPiece,s.x,s.y);s.fx=p.id;p.imageIndex=R.random(3);p.imageXscale=2;p.imageYscale=2;p.direction=45+R.random(90);
  }
  rt.destroy(s);
 };
 const shatter=(s:GmInstance,rt:GmRuntime)=>{
  const fx=rt.create(destroyFx,s.x,s.y);s.fx=fx.id;fx.imageXscale=1.5;fx.imageYscale=1.5;
  for(let k=0;k<3;k++){const p=rt.create(eggPiece,s.x,s.y);s.fx=p.id;p.imageXscale=2;p.imageYscale=2;}
  rt.destroy(s);
 };
 const eggBullet:GmObjectDef={name:'obj_pipis_egg_bullet',index:631,parent:object('obj_collidebullet'),sprite:'spr_pipis_egg',depth:0,
  events:{
   create:(s,rt)=>{
    bulletInit(s);
    Object.assign(s,{hp:3,con:0,timer:0,type:0,shake:0,parent:-1,imageSpeed:0,imageXscale:2,imageYscale:2});
    s.imageAngle=rt.random.random(360);
    Object.assign(s,{target:0,damage:1,directhit:0,element:6,bluesiner:0});
    s.image_blend2=mergeColor(0xe8a200,C.aqua,0.25+Math.sin(s.bluesiner/3)*0.25);
    Object.assign(s,{hitstun:0,hitstunenabled:0});s.bouncespeed=-5-rt.random.random(3);s.drawlabel=0;s.grazepoints=2;
   },
   alarm0:()=>{},
   user0:burst,
   draw:(s,rt)=>{
    const R=rt.random,b=box(rt),bw=rt.spriteWidth(b),bh=rt.spriteHeight(b);
    if(s.drawlabel===1){const ly=s.y+rt.spriteHeight(s)/2+12+R.randomRange(0,1),lx=s.x-4+R.randomRange(0,1);rt.drawSprite('spr_pipissign',0,lx,ly,1,1,0,C.white,1);}
    const pastBox=()=>lt(s.x,b.x+bw/2+10)&&gt(s.y,b.y-bh/2+10);
    if(s.type===3){
     if(pastBox()){rt.userEvent(s,0);snd(rt,'snd_bomb');}
     if(gt(s.y,b.y-20+bh)){rt.userEvent(s,0);snd(rt,'snd_bomb');}
     s.imageAngle+=10;
    }else if(s.type===2){
     s.imageAngle+=45;
     if(s.con===0&&gt(s.y,b.y-20+bh/2)&&gt(s.vspeed,0))s.con=1;
     if(s.con===1){snd(rt,'snd_bump');s.imageAngle=-30-R.random(30);s.gravity=0.24;s.vspeed=s.bouncespeed;s.con=2;s.alarm[0]=10;}
     if(pastBox()){rt.userEvent(s,0);snd(rt,'snd_bomb');}
     if(gt(s.y,b.y-20+bh/2)&&gt(s.vspeed,0)&&s.con===2&&s.alarm[0]<1)s.con=1;
    }else{
     if(s.type===1)s.x=rt.byId(s.parent)!.x;
     s.imageAngle+=4;
     if(eq(s.gravityDirection,180)&&lt(s.x,b.x+bw/2+10)){rt.userEvent(s,0);snd(rt,'snd_bomb');}
    }
    let xs=0,ys=0;
    if(s.shake>0){s.shake-=1;xs=4-R.random(8);ys=4-R.random(8);}
    rt.drawSprite(s.sprite,s.imageIndex,s.x+xs,s.y+ys,s.imageXscale,s.imageYscale,s.imageAngle,C.white,s.imageAlpha);
    if(s.type===2&&((s.con===2&&lt(s.y,b.y-bh/2)&&lt(s.x,b.x+bw/2+80))||(s.directhit===1&&lt(s.y,b.y-bh/2))))s.gravity+=0.01;
   },
  },
  collisions:[
   {target:object('obj_yheart_shot'),run:(s,shot,rt)=>{
    s.shake=8;s.hp-=shot.damage;
    if(s.imageIndex<3)s.imageIndex+=1;
    snd(rt,'snd_damage');
    if(shot.big===0)rt.userEvent(shot,0);
    if(lt(s.hp,1)){
     shatter(s,rt);
     tensionHeal(rt,neo(rt).difficulty===1?2:3);
    }else{
     const p=rt.create(eggPiece,s.x,s.y);s.fx=p.id;p.imageIndex=s.imageIndex;
     if(lt(s.x,rt.view.x+500))s.hspeed/=1.05;
    }
   }},
   {target:object('obj_mettaton_bomb_hitbox'),run:(s,_hitbox,rt)=>{
    s.shake=8;s.hp-=3;
    if(s.imageIndex<3)s.imageIndex+=1;
    snd(rt,'snd_damage');
    shatter(s,rt);
    tensionHeal(rt,neo(rt).difficulty===1?3:1.5);
   }},
   {target:object('obj_pipis_wall'),run:(s,_wall,rt)=>{if(s.type!==2&&s.type!==3)rt.userEvent(s,0);}},
  ],
 };

 /** A head of the ring around obj_pipis_center (types 0 and 1). */
 const pipisBullet:GmObjectDef={name:'obj_pipis_bullet',index:632,parent:object('obj_collidebullet'),sprite:'spr_sneo_crew',depth:0,
  events:{
   create:s=>{bulletInit(s);Object.assign(s,{element:6,timer:0,con:0,type:0,target:0,damage:1,hp:0.5,imageXscale:0.5,imageYscale:0.5,length:0,place:0,parent:-1});},
   step:(s,rt)=>{
    const p=rt.byId(s.parent);
    if(!p){rt.destroy(s);return;}
    if(s.length<36)s.length+=2;
    s.x=p.x+lengthdirX(s.length,s.place);s.y=p.y+lengthdirY(s.length,s.place);
    if(s.hp===0)rt.userEvent(s,1);
   },
   destroy:()=>{},
   user1:(s,rt)=>{snd(rt,'snd_bomb',1.1+rt.random.random(0.2));scrAfterimageCut(s,rt,object);rt.destroy(s);},
  },
  collisions:[{target:object('obj_yheart_shot'),run:(s,shot,rt)=>{
   if(neo(rt).difficulty===2)rt.userEvent(shot,0);
   else if(shot.big===0)rt.userEvent(shot,0);
   rt.userEvent(s,1);
  }}],
 };
 /** A head of the cone a type 2 or 3 egg bursts into. Shots pass through it. */
 const pipisBulletCone:GmObjectDef={name:'obj_pipis_bullet_cone',index:1,parent:object('obj_collidebullet'),sprite:'spr_sneo_crew',depth:0,
  events:{
   create:s=>{bulletInit(s);Object.assign(s,{element:6,timer:0,con:0,type:0,target:0,damage:1,hp:0.5,imageXscale:0.4,imageYscale:0.4,length:0,place:0,parent:-1,grazepoints:1});},
   step:(s,rt)=>{if(s.hp===0)rt.userEvent(s,1);},
   destroy:()=>{},
   user1:(s,rt)=>{snd(rt,'snd_bomb',1.1+rt.random.random(0.2));scrAfterimageCut(s,rt,object);rt.destroy(s);},
  },
  collisions:[{target:object('obj_yheart_shot'),run:()=>{}}],
 };
 /** The centre of a ring of six heads, which homes in on the soul after a moment. */
 const pipisCenter:GmObjectDef={name:'obj_pipis_center',index:662,depth:0,events:{
  create:s=>{Object.assign(s,{timer:0,con:0,maxlength:36,init:0,homingfactor:0,maxhomingfactor:5});},
  step:(s,rt)=>{
   const h=heart(rt);
   if(!h){rt.destroy(s);return;}
   if(s.init===0){
    s.init=1;
    [60,120,180,240,300,360].forEach((angle,k)=>{
     const b=rt.create(pipisBullet,s.x,s.y);s['b'+(k+1)]=b.id;b.place=angle+rt.random.random(15);b.parent=s.id;b.damage=s.damage;b.target=s.target;
    });
   }
   if(s.con===0){s.timer+=1;if(s.timer===15){s.con=1;s.timer=0;}}
   if(s.con===1||(s.con>1&&s.con<6)){
    moveTowardsPoint(s,h.x,h.y,13);s.con+=1;
    if(lt(distanceToObject(rt.bank,s,rt.all(object('obj_heart'))),30))s.con=6;
   }
   if(lt(s.x,rt.view.x-50))rt.destroy(s);
  },
 }};
 const destroyFx:GmObjectDef={name:'obj_pipis_destroy_fx',index:663,sprite:'spr_boxing_crescent',depth:0,events:{
  create:s=>{s.imageSpeed=0.25;},
  step:(s,rt)=>{if(lt(rt.globals.turntimer,1))rt.destroy(s);},
  animationEnd:(s,rt)=>rt.destroy(s),
 }};
 /** The green line eggs burst on; it fades in, and out when told (con 1). */
 const pipisWall:GmObjectDef={name:'obj_pipis_wall',index:630,sprite:'spr_pipis_wall',depth:0,events:{
  create:(s,rt)=>{Object.assign(s,{imageAlpha:0,imageBlend:C.lime,imageXscale:1,con:0,timer:0,type:0});s.siner=rt.random.random(100);},
  step:(s,rt)=>{
   if(s.con===0&&lt(s.imageAlpha,1))s.imageAlpha+=0.1;
   if(s.con===1){if(gt(s.imageAlpha,0))s.imageAlpha-=0.1;else rt.destroy(s);}
   if(s.type===1){s.siner+=0.5;s.x=s.xstart+Math.sin(s.siner/6)*48;}
   if(lt(rt.globals.turntimer,1))rt.destroy(s);
  },
 }};
 const eggPiece:GmObjectDef={name:'obj_pipis_egg_bullet_piece',index:661,sprite:'spr_pipis_egg_piece',depth:0,events:{
  create:(s,rt)=>{
   s.timer=0;s.con=0;s.grav=0;s.imageAngle=rt.random.random(360);s.direction=rt.random.random(360);s.speed=3+rt.random.random(7);s.imageAlpha=2.9;
   const h=heart(rt);if(h)s.depth=h.depth-100;else rt.destroy(s);
  },
  step:(s,rt)=>{
   s.imageAlpha-=0.1;s.grav+=0.3;s.y+=s.grav;
   if(gt(s.y,rt.view.y+rt.view.height+10))rt.destroy(s);
   if(lt(rt.globals.turntimer,1))rt.destroy(s);
  },
 }};
 /** A bomb among the eggs (variant 3): a shot or the box sets it off. */
 const pipisBomb:GmObjectDef={name:'obj_sneo_pipis_bomb',index:46,parent:object('obj_collidebullet'),sprite:'spr_mettaton_bomb1',depth:0,
  events:{
   create:(s,rt)=>{
    bulletInit(s);Object.assign(s,{imageXscale:1,imageYscale:1,timer:0,con:0,element:6,destroyable:0,bighitbox:1,imageSpeed:0});
    const n=rt.first(object('obj_spamton_neo_enemy'));if(n)s.damage=rt.globals.monsterat[n.myself]*5;
    const c=rt.first(object('obj_sneo_bulletcontroller'));if(c)s.target=c.target;
    Object.assign(s,{grazepoints:2,wallspeed:-7,wallnumber:0,spawninvincibilitytimer:0});
   },
   alarm0:()=>{},alarm1:()=>{},
   step:(s,rt)=>{
    if(lt(rt.globals.turntimer,1))rt.destroy(s);
    if(s.timer>0)s.timer+=1;
    s.spawninvincibilitytimer+=1;
    if(s.timer===6){
     snd(rt,'snd_bomb');rt.soundStop?.(s.bomsfallsfx);
     s.sprite='spr_mettaton_bomb2';s.imageIndex=0;
     rt.create(object('obj_shake'),s.x,s.y);
     for(const [k,xs,ys] of [[1,5000,0.5],[2,0.2,5000]] as const){
      const h=rt.create(object('obj_mettaton_bomb_hitbox'),s.x,s.y);s['hitbox'+k]=h.id;h.imageXscale=xs;h.imageYscale=ys;h.creator=s.id;
     }
    }
    if(s.timer===12)rt.destroy(s);
    const b=box(rt);
    if(gt(s.y,b.y-81+rt.spriteHeight(b))&&s.alarm[0]<1){
     snd(rt,'snd_bump');s.gravity=0.24;s.vspeed=-5.5-rt.random.random(3);s.con=2;s.alarm[0]=10;
    }
    if(lt(s.x,b.x+rt.spriteWidth(b)/2+10)&&gt(s.y,b.y-rt.spriteHeight(b)/2+10)&&s.timer===0){
     snd(rt,'snd_damage');s.gravity=0;s.speed=0;s.timer=1;s.imageSpeed=1;s.bomsfallsfx=rt.soundLoop?.('snd_bombfall')??-1;
    }
   },
   draw:(s,rt)=>{
    rt.drawSelf(s);
    if(s.sprite==='spr_mettaton_bomb2')for(let i=1;i<24;i++){
     rt.drawSprite('spr_mettaton_bomb3',s.imageIndex,s.x+24*i,s.y,s.imageXscale,s.imageYscale,90,C.white,s.imageAlpha);
     rt.drawSprite('spr_mettaton_bomb3',s.imageIndex,s.x-24*i,s.y,s.imageXscale,s.imageYscale,90,C.white,s.imageAlpha);
     rt.drawSprite('spr_mettaton_bomb3',s.imageIndex,s.x,s.y-24*i,s.imageXscale,s.imageYscale,0,C.white,s.imageAlpha);
     rt.drawSprite('spr_mettaton_bomb3',s.imageIndex,s.x,s.y+24*i,s.imageXscale,s.imageYscale,0,C.white,s.imageAlpha);
    }
   },
   // CleanUp: its falling whistle stops with it.
   destroy:(s,rt)=>{if(s.timer>0)rt.soundStop?.(s.bomsfallsfx);},
  },
  collisions:[{target:object('obj_yheart_shot'),run:(s,shot,rt)=>{
   if(s.timer===0&&s.spawninvincibilitytimer>11){
    snd(rt,'snd_damage');
    if(shot.big===0)rt.userEvent(shot,0);
    s.timer=1;s.imageSpeed=1;s.bomsfallsfx=rt.soundLoop?.('snd_bombfall')??-1;
   }
  }}],
 };
 const armcannonSmoke:GmObjectDef={name:'obj_sneo_armcannon_smoke',index:664,sprite:'spr_boxing_smoke',depth:0,events:{
  create:(s,rt)=>{Object.assign(s,{imageXscale:1,imageYscale:1,speed:4,friction:0.2});s.direction=70+rt.random.random(80);s.imageSpeed=0;s.imageAngle=70+rt.random.random(80);s.timer=0;},
  step:(s,rt)=>{s.imageAlpha-=0.05;if(lt(s.imageAlpha,0))rt.destroy(s);if(lt(rt.globals.turntimer,1))rt.destroy(s);},
 }};
 return [phonecall,stream,streamHead,pipisController,eggBullet,pipisBullet,pipisBulletCone,pipisCenter,destroyFx,pipisWall,eggPiece,pipisBomb,armcannonSmoke];
}
