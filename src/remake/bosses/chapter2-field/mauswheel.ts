import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {defineEnemy} from '../../deltarune/enemy';
import {darkMarker,spareAnim,growtangle,moveHeart,heart,moveHeartIn} from '../../deltarune/battle';
import {nextAct,winCombat,inputName} from '../../deltarune/controller';
import {battleText,battleTextDefault,destroyWriters,writer} from '../../deltarune/writer';
import {enemyBlcon2} from '../../deltarune/chapter2-objects';
import {bulletSpawner,blconSkip,isPhase,mercyAdd2,msgSet,msgNext,turnTimer,snd} from '../../deltarune/chapter2-battle';
import {enemyObjectInit,enemyDrawHurtGeneric,enemyDrawIdleGeneric,simulText,actCharSpriteEnd,terminateWriter,speaker,anyFaceNext,recruitEnemy,spareAnimation} from '../../deltarune/chapter2-enemy';
import {sourceText} from '../../host/text';
const T=(key:string)=>sourceText('obj_mauswheel_enemy_slash_Step_0_gml_'+key);
const living=(rt:GmRuntime,id:number)=>{const i=rt.byId(id);if(!i)throw Error(`Mauswheel requires live instance ${id}`);return i;};
export function createMauswheel(object:(n:string)=>GmObjectDef):GmObjectDef[]{
 const enemy=defineEnemy({...object('obj_mauswheel_enemy'),depth:0},{
  create:(s,rt)=>{enemyObjectInit(s,rt);Object.assign(s,{talkmax:90,imageSpeed:0.5,idlesprite:'spr_mauswheel_idle',hurtsprite:'spr_mauswheel_idle',sparedsprite:'spr_mauswheel_idle',firstturn:1,trappingX:false,remove:false,trappedText:false,basket:-4,trapped:false,tasque_joined:false,nact_count:0,total_cursors:3,cursor_memory:[]});for(s.i=0;s.i<s.total_cursors;s.i++)s.cursor_memory[s.i]=rt.create(object('obj_mauswheel_cursor_memory'),s.x,s.y).id;s.cursor_count=0;s.recording_cursor=0;s.basket_size=1;s.tasque_manager_recruited=1;},
  talk:(s,rt)=>{const g=rt.globals;g.typer=50;s.rr=rt.random.choose(0,1,2,3);msgSet(rt,0,T(`${[18,23,27,31][s.rr]}_0`));if(g.mercymod[s.myself]>=g.mercymax[s.myself])msgSet(rt,0,T('36_0'));enemyBlcon2(s,rt,s.x-20,g.monstery[s.myself],10);},
  endTalk:(s,rt)=>{if(s.talked!==1||!isPhase(rt,'enemytalk',s))return;s.rtimer=0;blconSkip(s,rt,15);if(isPhase(rt,'bullets',s)){if(!rt.exists(moveHeart)&&!rt.exists(heart))moveHeartIn(rt);if(!rt.exists(growtangle))rt.create(growtangle,rt.view.x+320,rt.view.y+170);}},
  attackDelay:16,attack:(s,rt)=>{s.rr=0;rt.userEvent(s,9);turnTimer(rt,140);},
  statusLine:(s,rt)=>{const g=rt.globals;if(g.monsterstatus[s.myself]===1)g.battlemsg[0]=T('112_0');else if(g.mercymod[s.myself]>=g.mercymax[s.myself])g.battlemsg[0]=T('115_0');else{s.rr=rt.random.choose(0,1,2,3);g.battlemsg[0]=T(`${130+s.rr}_0`);}},
  acts:(s,rt)=>acts(s,rt,object),actsDone:()=>{},
  monsterPosition:(s,rt)=>[s.x+rt.spriteWidth(s)/2+60,s.y+rt.spriteHeight(s)/2+60],
  hooks:{flashSprite:s=>s.idlesprite},
  events:{alarm4:s=>{s.actcon++;},user9:(s,rt)=>{rt.globals.turntimer+=120;rt.globals.monsterattackname[s.myself]='MausHoles';const d=bulletSpawner(s,rt,s.x,s.y,object('obj_dbulletcontroller'));s.dc=d.id;d.type=19;d.target=s.mytarget;if(s.cursor_count<s.total_cursors)s.cursor_count++;},
   draw:(s,rt)=>{if(rt.exists(object('obj_maus_split')))return;if(s.state===3)enemyDrawHurtGeneric(s,rt);enemyDrawIdleGeneric(s,rt,s.imageSpeed);if(s.becomeflash===0)s.flash=0;s.becomeflash=0;},
  },
 });return [enemy];
}
function acts(s:GmInstance,rt:GmRuntime,object:(n:string)=>GmObjectDef){
 const g=rt.globals;s.xx=rt.view.x;s.yy=rt.view.y;
 if(s.acting===1&&s.actcon===0){s.actcon=1;msgSet(rt,0,T('157_0'));msgNext(rt,T('132_0_b'));battleTextDefault(rt,s);}
 if((s.acting===2||s.acting===3)&&s.actcon===0){msgSet(rt,0,T(s.acting===2?'163_0':'173_0').replace('~1',inputName(6)));battleTextDefault(rt,s);s.actfailure=1;s.actcon=15;s.basket_size=s.acting===2?0:1;s.alarm[4]=10;}
 if(s.actingsus===1&&s.actconsus===1){msgSet(rt,0,T('183_0'));battleTextDefault(rt,s);mercyAdd2(s,rt,s.myself,5);s.actingsus=0;s.actconsus=0;s.actcon=1;}
 if(s.actingral===1&&s.actconral===1&&!rt.exists(writer)){if(!s.trappedText){s.trappedText=true;g.actsimulral[s.myself][0]=1;msgSet(rt,0,T('202_0'));mercyAdd2(s,rt,s.myself,5);s.actconral=2;battleTextDefault(rt,s);}else{msgSet(rt,0,T(s.simultotal===1?'212_0':'212_1'));mercyAdd2(s,rt,s.myself,5);battleTextDefault(rt,s);s.actingral=0;s.actconral=0;s.actcon=1;}}
 if(s.actconral===2&&!rt.exists(writer)){s.actconral=2.5;const h=rt.first(object('obj_herosusie'));if(!h)throw Error('Mauswheel R-Action requires Susie');s.basket=rt.create(object('obj_maus_basket_susie'),h.x-5,rt.view.y-100).id;for(const hero of rt.all(object('obj_herosusie')))hero.visible=false;const marker=darkMarker(rt,s,h.x+16,h.y-1,'spr_susie_shock_r');s.nise_susie=marker.id;marker.depth=h.depth;speaker(s,rt,'no_name');msgSet(rt,0,T('209_0'));battleTextDefault(rt,s);}
 if(s.actconral===2.5&&living(rt,s.basket).gravity===0){s.actconral=3;for(const id of [s.nise_susie,s.basket]){const target=living(rt,id),shake=rt.create(object('obj_shakeobj'),target.x,target.y);target.shakeobj=shake.id;shake.target=target.id;rt.userEvent(shake,0);}snd(rt,'snd_impact');}
 if(s.actconral===3&&!rt.exists(writer)){s.actcon=1;s.actconral=0;speaker(s,rt,'ralsei');msgSet(rt,0,T('230_0'));anyFaceNext(s,rt,'susie','5');msgNext(rt,T('243_0'));battleText(rt,s);}
 if(s.actcon===10){const b=rt.create(object('obj_maus_basket'),s.x,s.y);s.basket=b.id;b.maker=s.id;s.actcon=11;s.actfailure=1;b.cancatch[s.myself]=1;s.caught=[0,0,0];}
 if(s.actcon===12){s.trappingX=false;destroyWriters(rt);msgSet(rt,0,T(s.actfailure===1?'269_0':'270_0'));battleTextDefault(rt,s);s.actcon=13;s.alarm[4]=20;}
 if(s.actcon===14&&!rt.exists(writer))s.actcon=1;
 if(s.actcon===16){rt.create(object('obj_maus_split'),s.x+60,s.y+64);s.actcon=17;}
 if(s.actcon===18){destroyWriters(rt);msgSet(rt,0,T(s.actfailure===1?'296_0':'297_0'));battleTextDefault(rt,s);s.actcon=13;s.alarm[4]=20;}
 if(s.actcon===19){destroyWriters(rt);if(g.flag[642]===1)s.actcon=22.1;else{msgSet(rt,0,T('312_0'));battleTextDefault(rt,s);s.actcon=21;s.alarm[4]=20;}}
 if(s.actcon===22)rt.userEvent(s,10);
 if(s.actcon===22.1){msgSet(rt,0,T('317_0'));battleTextDefault(rt,s);s.actcon=22.2;}
 if(s.actcon===22.2&&!rt.exists(writer)){msgSet(rt,0,T('324_0'));battleTextDefault(rt,s);s.actcon=22.3;}
 if(s.actcon===22.3&&!rt.exists(writer)){msgSet(rt,0,T('331_0'));battleTextDefault(rt,s);s.actcon=23;}
 if(s.actcon>22&&s.actcon<23&&s.imageSpeed<2)s.imageSpeed+=0.02;
 if(s.actcon===23&&!rt.exists(writer)){rt.create(object('obj_mauswheel_tasquemanager'),rt.view.x+315-76,rt.view.y-138);rt.create(object('obj_mauswheel_tasque'),rt.view.x+435-74,rt.view.y-80);s.actcon=25;s.alarm[4]=25;}
 if(s.actcon===26){msgSet(rt,0,T('337_0'));battleTextDefault(rt,s);s.actcon=27;s.alarm[4]=12;}
 if(s.actcon===28&&!rt.exists(writer)){for(const name of ['obj_mauswheel_tasquemanager','obj_mauswheel_tasque'])for(const m of rt.all(object(name)))m.alarm[0]=30;spareAnimation(s,rt);recruitEnemy(s,rt);s.visible=false;s.actcon=29;s.alarm[4]=60;}
 if(s.actcon===30&&!rt.exists(object('obj_mauswheel_tasquemanager'))){winCombat(rt);rt.destroy(s);}
 if(s.actingnoe===1&&s.actconnoe===1){speaker(s,rt,'no_name');msgSet(rt,0,T('360_0'));mercyAdd2(s,rt,s.myself,50);simulText(s,rt,'noelle');s.actconnoe=s.simulordernoe===0?20:0;}
 if(s.actcon===1&&!rt.exists(writer)){actCharSpriteEnd(s,rt);nextAct(rt,s);if(s.remove){const change=g.changeChapter2Monster;if(typeof change!=='function')throw Error('Mauswheel replacement requires monster_change bridge');for(const m of rt.all(object('obj_maus_enemy')))m.tasque_joined=true;g.monstermakey[s.myself]=s.y-15;g.monstermakex[s.myself]=living(rt,s.tasquemarker).x;s.newtasque=change(s,rt,s.myself,32,object('obj_tasque_enemy'));rt.destroy(living(rt,s.tasquemarker));rt.destroy(s);}
  if(s.basket!==-4){for(const id of [s.nise_susie,s.basket]){const m=rt.byId(id);if(m)rt.destroy(m);}for(const h of rt.all(object('obj_herosusie')))h.visible=true;}
 }
 if((s.actcon===20||s.actconsus===20||s.actconral===20||s.actconnoe===20)&&terminateWriter(s,rt)){s.actconsus=-1;s.actconral=-1;s.actconnoe=-1;s.actcon=1;}
}
