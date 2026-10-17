import type {GmInstance,GmRuntime} from '../../gm/runtime';
import {darkMarker,sndFree} from '../../deltarune/battle';
import {button3_p} from '../../deltarune/controller';
import {enemyBlcon2} from '../../deltarune/chapter2-objects';
import {msgSet,snd} from '../../deltarune/chapter2-battle';
import {destroyWriters,writer} from '../../deltarune/writer';
import {sourceText} from '../../host/text';
import {type QueenObject,queenInstance} from './context';
const line=(rt:GmRuntime,n:number)=>msgSet(rt,0,sourceText(`obj_queen_enemy_slash_Step_0_gml_${n}_0`));

/** Queen user3 deliberately records rewards without removing the live enemy from the battle. */
export function recordQueenEnding(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,i=s.myself;g.monstergold[3]+=g.monstergold[i];g.monsterexp[3]+=g.monsterexp[i];
 if(g.flag[51+i]===0){g.flag[51+i]=2;if(g.monsterhp[i]<=0)g.flag[51+i]=1;}
 const value=g.flag[51+i];if(value===1){g.flag[40]++;if(s.fatal===1)g.flag[44]++;}
 if(value===2)g.flag[41]++;if(value===3)g.flag[42]++;if(value===5)g.flag[43]++;if(value===6){g.flag[45]++;g.monstergold[3]+=24;}
 s._amt_add=0;s._frozened=0;s._violenced=0;s._spared=0;s._pacified=0;
 for(s.d_i=0;s.d_i<3;s.d_i++){
  const flag=g.flag[51+s.d_i];if(flag!==0)s._amt_add++;if(flag===1)s._violenced++;if(flag===2)s._spared++;if(flag===3)s._pacified++;if(flag===6)s._frozened++;
 }
 if(s._frozened>0)g.flag[50]=6;if(s._pacified>0)g.flag[50]=3;if(s._spared>0)g.flag[50]=2;if(s._violenced>0)g.flag[50]=1;
 if(g.flag[50]===6)g.flag[926]++;if(g.flag[54]!==0){g.flag[g.flag[54]]=g.flag[50];g.flag[54]=0;}
}

/** Both original post-battle scenes, including the story-flag-dependent Berdly freedom variant. */
export function queenEndings(s:GmInstance,rt:GmRuntime,object:QueenObject){
 const g=rt.globals,canAdvance=()=>button3_p(rt)&&s.talktimer>15||!rt.exists(writer);
 const queenBalloon=()=>enemyBlcon2(s,rt,s.x-10,g.monstery[s.myself],10);
 const revive=()=>{g.fighting=0;for(let i=1;i<=3;i++)if(g.hp[i]<1)g.hp[i]=1;};
 if(s.endcon===1){
  sndFree(rt,s,g.batmusic[0]);if(s.defeat_cutscene_version===0){line(rt,1067);s.endcon=2;}else{line(rt,1074);s.endcon=3;}
  g.mercymod[s.myself]=s.bardlymercy;recordQueenEnding(s,rt);s.endtimer=0;s.ballooncon=1;s.balloonend=0;s.talktimer=0;g.typer=70;queenBalloon();
  s.defeat_cutscene_version=[529,550,548].every(i=>g.flag[i]===2||g.flag[i]===3)?1:0;
 }
 if(s.defeat_cutscene_version===0){
  if(s.endcon===2){
   s.talktimer++;if(canAdvance()){
    destroyWriters(rt);
    const key=s.ballooncon===1?(s.bardlymercy>99?1108:1109):s.ballooncon===2?1114:s.ballooncon===3?1118:s.ballooncon===4?1123:s.ballooncon===5?1128:undefined;
    if(key!==undefined){if(s.ballooncon===4||s.ballooncon===5)s.sprite='spr_queen_chair_1_old';line(rt,key);s.ballooncon=s.ballooncon===5?0:s.ballooncon+1;s.balloonend=s.ballooncon===0?1:0;}
    s.endcon=3;g.typer=70;queenBalloon();if(s.ballooncon!==4&&s.ballooncon!==5)s.alarm[6]=1;
   }
  }
  if(s.endcon===3&&!rt.exists(writer)&&(s.ballooncon===4||s.ballooncon===5)){
   s.endtimer++;if(s.endtimer===1){s.sprite='spr_queen_throw_wineglass';snd(rt,'snd_error');}if(s.endtimer===60){s.alarm[6]=1;s.endtimer=0;}
  }
  if(s.endcon===4){s.talktimer++;if(canAdvance()){s.endtimer++;if(s.endtimer===1){revive();const scene=rt.first(object('obj_ch2_scene25'));if(scene)scene.forcend=1;}}}
 }
 if(s.defeat_cutscene_version===1){
  if(s.endcon===2&&s.extracon===0){s.talktimer++;if(canAdvance()){s.extratimer++;if(s.extratimer===1){queenInstance(rt,object,'obj_berdlyplug_enemy').shake2=10;snd(rt,'snd_damage');}if(s.extratimer===50)s.extracon=1;}}
  if(s.endcon===2&&s.extracon===1){
   s.talktimer++;if(canAdvance()){
    destroyWriters(rt);const key=({1:1181,2:1186,3:1190,4:1195,5:1200,6:1204} as Record<number,number>)[s.ballooncon];
    if(key!==undefined){if(s.ballooncon===1)s.idlesprite='spr_cutscene_25_queen_chair_shocked';line(rt,key);s.ballooncon=s.ballooncon===6?0:s.ballooncon+1;s.balloonend=s.ballooncon===0?1:0;}
    s.endcon=3;if(s.ballooncon>4||s.ballooncon===0){const b=queenInstance(rt,object,'obj_berdlyplug_enemy');g.typer=69;const xx=s.ballooncon===0||s.ballooncon===6?75:30;enemyBlcon2(s,rt,b.x+xx,b.ystart+15,7);}else{g.typer=70;queenBalloon();}
    if(s.ballooncon!==2&&s.ballooncon!==5)s.alarm[6]=1;
   }
  }
  if(s.endcon===3&&!rt.exists(writer)){
   if(s.ballooncon===1){s.endtimer++;if(s.endtimer===2||s.endtimer===42){queenInstance(rt,object,'obj_berdlyplug_enemy').shake2=10;snd(rt,'snd_damage');}if(s.endtimer===102){s.alarm[6]=1;s.endtimer=0;}}
   if(s.ballooncon===2){
    s.endtimer++;const b=queenInstance(rt,object,'obj_berdlyplug_enemy');if(s.endtimer===1)b.savey=b.y;
    if(s.endtimer<30){b.x=b.xstart+(rt.view.x+rt.view.width/2.5-b.xstart)*s.endtimer/30;b.ystart=b.savey+(rt.view.y+rt.view.height/3.5-b.savey)*s.endtimer/30;}
    if(s.endtimer===60)b.imageXscale*=-1;if(s.endtimer===90){s.alarm[6]=1;s.endtimer=0;}
   }
   if(s.ballooncon===5){s.endtimer++;if(s.endtimer===1){const b=queenInstance(rt,object,'obj_berdlyplug_enemy');b.sprite='spr_cutscene_25_berdly_grab_plug';b.shake2=10;b.imageXscale*=-1;b.x-=50;snd(rt,'snd_grab');}if(s.endtimer===30){s.alarm[6]=1;s.endtimer=0;}}
  }
  if(s.endcon===4){
   s.talktimer++;if(canAdvance()){
    s.endtimer++;if(s.endtimer===1){snd(rt,'snd_great_shine');const w=darkMarker(rt,s,-10,-10,'spr_pixel_white');s.whiteall=w.id;w.imageXscale=999;w.imageYscale=999;w.depth=-99999;w.imageAlpha=0;}
    if(s.endtimer>0&&s.endtimer<16){const w=rt.byId(s.whiteall);if(!w)throw Error('Queen ending white marker missing');w.imageAlpha=s.endtimer/15;}
    if(s.endtimer>25&&s.endtimer<41){const w=rt.byId(s.whiteall);if(!w)throw Error('Queen ending white marker missing');w.imageAlpha=1-(s.endtimer-25)/15;}
    if(s.endtimer>=42){revive();for(const c of rt.withInstances(object('obj_battlecontroller')))rt.destroy(c);}
   }
  }
 }
}
