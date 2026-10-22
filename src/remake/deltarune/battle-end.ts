// How a battle ends. A win: scr_endcombat makes obj_endbattle, which fades the battle background (and the battle
// music) out. A loss: scr_gameover goes to room_gameover, where obj_gameover_init breaks the soul where it was, then to
// PLACE_FAILURE, where DEVICE_FAILURE asks whether to try again (DEVICE_CHOICE). Chapter 2 shows the GAME OVER title
// (obj_gameoverbg) and has a party member call Kris back first.
// What lies outside the game is the host's: loading the save (scr_tempload) and closing the game become the room
// changes RETRY_ROOM and GAME_END_ROOM, which the host turns into a new battle or the menu.
import type {GmInstance,GmObjectDef,GmRuntime} from '../gm/runtime';
import {C} from '../gm/graphics';
import {le,lt} from '../gm/math';
import {battleBack,marker,partyWears,sndFreeAll} from './battle';
import {KEY,button1_p,held,pressed} from './keys';
import {writer} from './writer';
import {forChapter} from './rules';
import {scrLerpvar} from './shared-effects';
import {scrFadeout} from './fades';
import {scriptDelayed,scriptDelayedOn,setVar} from './chapter2-battle';
import {sourceText} from '../host/text';

/** scr_tempload: the game reloads where it last saved; for the host, the battle starts again. */
export const RETRY_ROOM='scr_tempload';
/** ossafe_game_end: the game closes; for the host, back to the menu. */
export const GAME_END_ROOM='game_end';
/** The game over's rooms: their views (PLACE_FAILURE shows a 320x240 view, drawn twice as large) and first object. */
const GAME_OVER_ROOMS:Record<string,{view:{width:number;height:number};at:[number,number];object:()=>GmObjectDef}>={
 room_gameover:{view:{width:640,height:480},at:[320,224],object:()=>gameOverInit},
 PLACE_FAILURE:{view:{width:320,height:240},at:[288,160],object:()=>deviceFailure},
};
export const isGameOverRoom=(room:string|null)=>room!==null&&room in GAME_OVER_ROOMS;

/** room_goto into one of the game over's rooms. scr_gameover's screenshot is taken here, at the room change: nothing
 * is drawn between scr_gameover and the room's first step, so it is the same frame. */
export function gotoGameOverRoom(rt:GmRuntime,room:string){
 const r=GAME_OVER_ROOMS[room];if(!r)throw Error(`${room} is not a game over room`);
 if(room==='room_gameover')rt.globals.screenshot=rt.spriteFromScreen();
 rt.endRoom();rt.room={name:room,width:640,height:480};Object.assign(rt.view,{x:0,y:0},r.view);
 rt.create(r.object(),...r.at);
}

const button2_p=(rt:GmRuntime)=>pressed(rt,KEY.x,KEY.shift),button3_p=(rt:GmRuntime)=>pressed(rt,KEY.c,KEY.ctrl);
const destroyAll=(rt:GmRuntime,o:GmObjectDef)=>{for(const i of rt.all(o))rt.destroy(i);};
const haveChar=(rt:GmRuntime,n:number)=>[0,1,2].some(i=>rt.globals.char[i]===n);
/** snd_init + mus_loop / mus_play: the music by its file name; the handle is what currentsong[1] keeps. */
function music(rt:GmRuntime,name:string,loop:boolean){
 const g=rt.globals;g.currentsong??=[-1,-1];g.currentsong[0]=name;g.currentsong[1]=rt.sourceAudio?.music(name)??name;if(loop)rt.sourceAudio?.loop(g.currentsong[1]);
}

/** obj_endbattle. The original also sends the heroes, as running markers, back to where they stand in the overworld
 * (obj_mainchara, global.cinstance) and shows the overworld again; the remake's battles have no overworld, so there is
 * nobody to run back to: the heroes stay gone (scr_endcombat removed them) and the alarm is the 15 frames it is
 * without them. */
export const endBattle:GmObjectDef={name:'obj_endbattle',index:310,events:{
 create:(s,rt)=>{
  const g=rt.globals;s.alarm[0]=15;s.con=0;
  for(const b of rt.withInstances(battleBack))b.destroy=1;
  s.count=0;g.tension=0;
  if(g.flag[9]===1)rt.sourceAudio?.volume(g.batmusic[1],0,s.alarm[0]);
 },
 alarm0:(s,rt)=>{const g=rt.globals;if(g.specialbattle===0||g.specialbattle===2)g.interact=0;rt.destroy(s);},
}};

/** obj_fadeout: the screen fades to black; it goes with the room. */
export const fadeOut:GmObjectDef={name:'obj_fadeout',index:143,depth:-99999,sprite:'spr_pixel_white',events:{
 create:(s,rt)=>{s.imageBlend=C.black;s.fadespeed=0.08;s.imageAlpha=0;s.length=10+rt.room.width/4;s.height=10+rt.room.height/4;s.x=-20;s.y=-20;},
 draw:(s,rt)=>{s.imageAlpha+=s.fadespeed;rt.drawSprite(s.sprite,s.imageIndex,s.x,s.y,s.length,s.height,0,s.imageBlend,s.imageAlpha);},
 roomEnd:(s,rt)=>rt.destroy(s),
}};

/** obj_gameover_init per chapter: from Chapter 3 the 4-Z skip fades to white before the retry, and in the Knight's
 * battle (tempflag 93) the soul does not break: it floats up to the top of the screen. */
const GAME_OVER_INIT:Readonly<Record<number,{later:boolean}>>={1:{later:false},2:{later:false},3:{later:true}};
/** Where the soul's six shards start, from its top left corner. */
const SHARDS=[[-2,0],[0,3],[2,6],[8,0],[10,3],[12,6]];
/** obj_gameover_init: the last battle frame for a second, then the soul alone in the dark; it cracks, then shatters.
 * Four presses of Z while it breaks skip to the retry. */
export const gameOverInit:GmObjectDef={name:'obj_gameover_init',index:135,depth:-40000,sprite:'spr_heart',events:{
 create:(s,rt)=>{
  const g=rt.globals;s.imageSpeed=0;s.visible=false;
  const bg=rt.create(marker,0,0);bg.sprite=g.screenshot;bg.imageSpeed=0;s.bg=bg.id;
  s.timer=0;s.Z_COUNT=0;
  if(forChapter(rt,GAME_OVER_INIT,'obj_gameover_init').later){s.special=0;s.timerb=0;s.knight_mode=g.tempflag[93]===1?1:0;}
  g.interact=0;
 },
 step:(s,rt)=>{
  const g=rt.globals;s.timer+=1;
  if(s.timer===1)sndFreeAll(rt);
  // Early confirm hurries the presentation into the normal retry/give-up dialogue. Once the
  // soul is breaking, retain the source's four-press retry below, counting each press once.
  if(s.timer>=2&&s.timer<80&&button1_p(rt)){
   rt.deleteSprite(g.screenshot);rt.pendingRoom='PLACE_FAILURE';return;
  }
  if(s.timer===30){const bg=rt.byId(s.bg);if(bg)rt.destroy(bg);s.visible=true;s.x=g.heartx;s.y=g.hearty;}
  if(s.timer===31)rt.deleteSprite(g.screenshot);
  const later=forChapter(rt,GAME_OVER_INIT,'obj_gameover_init').later;
  if(later&&s.knight_mode){
   if(s.timer===80){scrLerpvar(s,rt,'x',s.x,312,30,2,'out');scrLerpvar(s,rt,'y',s.y,rt.view.y+80,30,2,'out');}
  }else{
  if(s.timer===50){rt.sound?.('snd_break1');s.sprite='spr_heartbreak';s.x-=2;}
  if(s.timer===90){
   rt.sound?.('snd_break2');s.visible=false;
   s.sh=SHARDS.map(([dx,dy])=>rt.create(marker,s.x+dx,s.y+dy).id);
   for(const id of s.sh){const m=rt.byId(id);if(!m)continue;m.direction=rt.random.random(360);m.speed=7;m.gravityDirection=270;m.gravity=0.2;m.sprite='spr_heartshards';m.imageSpeed=0.2;}
   if(g.tempflag[3]>=1)s.timer+=15;
  }
  if(s.timer===140)rt.create(fadeOut,0,0);
  if(s.timer>=80&&s.timer<150){
   if(button1_p(rt))s.Z_COUNT+=1;
   if(s.Z_COUNT>=4){
    if(!later)rt.pendingRoom=RETRY_ROOM;
    else{s.timer=-999;s.timerb++;const f=scrFadeout(s,rt,30);f.imageBlend=C.white;f.depth=-99999999;rt.sourceAudio?rt.sourceAudio.effect('snd_dtrans_lw',1,0.7):rt.sound?.('snd_dtrans_lw');}
   }
  }
  }
  if(later&&s.timerb>0){s.timerb++;if(s.timerb===40)rt.pendingRoom=RETRY_ROOM;}
  if(s.timer===150&&(!later||s.special===0))rt.pendingRoom='PLACE_FAILURE';
 },
}};

/** obj_gameoverbg (Chapter 2): the GAME OVER title, fading in behind the failure screen. */
export const gameOverBg:GmObjectDef={name:'obj_gameoverbg',index:1317,sprite:'spr_gameoverbg_neo',events:{
 create:s=>{s.imageAlpha=0;},
 step:s=>{if(lt(s.imageAlpha,1))s.imageAlpha+=0.02;},
}};

/** What DEVICE_FAILURE does differently per chapter. Chapter 1's voice says the end has come and asks whether to try
 * again, over a drone; Chapter 2 puts up the GAME OVER title, plays its game over theme, has Susie or Ralsei call
 * Kris back, and offers the choice without the question. */
interface FailureRules{
 create(s:GmInstance,rt:GmRuntime):void;
 /** EVENT 1: what is said first, and the music. */
 open(s:GmInstance,rt:GmRuntime):void;
 /** EVENT 4: Chapter 2 waits until its lines are read, and names the choices itself. */
 choiceWaitsForText:boolean;
 labelChoice(c:GmInstance,rt:GmRuntime):void;
 /** DEVICE_CHOICE's own two labels. */
 choiceKeys:[string,string];
 /** EVENT 6, after YES: Chapter 1's voice answers before the white fade. */
 retry(s:GmInstance,rt:GmRuntime):void;
 /** EVENT 8: the white fade's sound, the first time. */
 whiteFadeSound:string|null;
 /** EVENT 26, after NO, before the last line. */
 giveUp(s:GmInstance,rt:GmRuntime):void;
 /** Chapter 3: the choice's words slide up into place (choice_y_offset). */
 readonly choiceSlides?:boolean;
 /** Chapter 3: the Knight's own failure screen, which runs instead of the usual one (knight_mode). */
 step?(s:GmInstance,rt:GmRuntime):void;
}
const FAILURE:Record<number,FailureRules>={
 1:{
  create:()=>{},
  open:(s,rt)=>{
   const g=rt.globals;sndFreeAll(rt);music(rt,'AUDIO_DRONE',true);g.typer=667;g.fc=0;
   g.msg[0]=sourceText('DEVICE_FAILURE_slash_Step_0_gml_10_0');s.EVENT=2;s.W=rt.create(writer,70,80).id;
   if(g.tempflag[3]>=1)destroyAll(rt,writer);
  },
  choiceWaitsForText:false,labelChoice:()=>{},
  choiceKeys:['DEVICE_CHOICE_slash_Create_0_gml_22_0','DEVICE_CHOICE_slash_Create_0_gml_23_0'],
  retry:(s,rt)=>{
   const g=rt.globals;g.flag[6]=1;g.msg[0]=sourceText('DEVICE_FAILURE_slash_Step_0_gml_68_0');s.W=rt.create(writer,50,80).id;
   if(g.tempflag[3]>=1){destroyAll(rt,writer);s.alarm[4]=1;}
  },
  whiteFadeSound:null,
  giveUp:()=>{},
 },
 2:{
  create:(s,rt)=>{s.text_timer=30;gameOverTitle(rt);},
  open:(s,rt)=>{
   const g=rt.globals;sndFreeAll(rt);
   if(s.text_timer>0){s.text_timer--;return;}
   s.EVENT=3;s.alarm[4]=30;music(rt,'AUDIO_DEFEAT',true);
   let voice=rt.random.choose(0,1);
   if(!haveChar(rt,2))voice=1;else if(!haveChar(rt,3))voice=0;
   if(haveChar(rt,2)||haveChar(rt,3)){
    // scr_speaker("no_name"): no portrait (its typer is set right after).
    g.fc=0;g.fe=0;
    const [first,second,typer]=voice===0?['39_0','40_0',61]:['47_0','48_0',60];
    g.msgno=0;g.msg[0]=sourceText('DEVICE_FAILURE_slash_Step_0_gml_'+first);g.msgno=1;g.msg[1]=sourceText('DEVICE_FAILURE_slash_Step_0_gml_'+second);
    g.typer=typer;g.fc=0;s.W=rt.create(writer,50,150).id;
   }
  },
  choiceWaitsForText:true,
  labelChoice:c=>{
   c.NAME[0][0]=sourceText('DEVICE_FAILURE_slash_Step_0_gml_103_0_b');c.NAME[1][0]=sourceText('DEVICE_FAILURE_slash_Step_0_gml_104_0');
   c.NAMEX[0][0]=80;c.NAMEX[1][0]=190;c.NAMEY[0][0]=180;c.NAMEY[1][0]=180;c.XMAX=1;c.CURX=-1;c.IDEALX=190;c.IDEALY=180;
  },
  choiceKeys:['DEVICE_CHOICE_slash_Create_0_gml_28_0','DEVICE_CHOICE_slash_Create_0_gml_29_0'],
  retry:()=>{},
  whiteFadeSound:'snd_dtrans_lw',
  giveUp:(_s,rt)=>{destroyAll(rt,gameOverBg);rt.globals.typer=667;},
 },
};
FAILURE[3]={...FAILURE[2],choiceSlides:true,
 create:(s,rt)=>{s.text_timer=30;knightFailureCreate(s,rt);if(!s.knight_mode)gameOverTitle(rt);},
 step:(s,rt)=>{if(s.knight_mode)knightFailureStep(s,rt);},
};
const failure=(rt:GmRuntime)=>forChapter(rt,FAILURE,'DEVICE_FAILURE');
function gameOverTitle(rt:GmRuntime){const bg=rt.create(gameOverBg,0,20);bg.depth=100000-(bg.y*10+rt.spriteHeight(bg)*10);}
/** Chapter 3's failure screen after losing to the Roaring Knight (tempflag 93): a small soul at the top, and when he
 * has been fought before (scr_get_knight_total_attempts), his own screen instead of the usual one: advice that
 * depends on how many times he has won (knight_battle_losses; whether the Shadow Mantle was worn; once, after the
 * party had him to 80%), then GO BACK (fight again) or GO FORWARD (move on). */
function knightFailureCreate(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;s.knight_mode=0;s.knight_mode_con=-1;
 if(g.tempflag[93]!==1)return;
 const m=rt.create(marker,156,40);s.thismarker=m.id;m.sprite='spr_heart';m.imageSpeed=0;s.heart_marker=m.id;m.depth=s.depth-1000;m.imageXscale=0.5;m.imageYscale=0.5;
 if(!(g.secretbossattempts>0))return;
 s.EVENT=-1;s.knight_mode=1;s.knight_mode_con=0;sndFreeAll(rt);music(rt,'AUDIO_DRONE',true);g.typer=667;g.fc=0;g.flag[6]=0;
 if('knight_battle_losses' in g){
  g.knight_battle_losses++;
  if(g.knight_battle_losses>=2){s.knight_mode_con=20;if(partyWears(rt,23)===0)s.knight_mode_con=40;}
  if(g.knight_battle_losses>=3){
   let unique=false;
   if(g.tempflag[96]===1){g.tempflag[96]=0;unique=(g.flag[1263]??0)===0;}
   if(unique){g.flag[1263]=1;s.knight_mode_con=30;}else s.knight_mode_con=50;
  }
 }else g.knight_battle_losses=1;
 g.flag[1264]=g.knight_battle_losses;
}
/** Each line at (70, 80) after the last is read; some wait 30 frames more (scr_delay_var). */
const KNIGHT_LINES:Readonly<Record<number,readonly [needsQuiet:boolean,next:number,key:string,delayTo?:number]>>={
 0:[false,1,'290_0'],1:[true,2,'300_0',3],3:[true,4,'310_0',5],5:[true,6,'320_0',7],7:[true,8,'330_0',50],
 20:[false,21,'341_0'],21:[true,50,'350_0'],30:[true,32,'362_0'],32:[true,33,'371_0'],33:[true,34,'380_0'],34:[true,50,'389_0'],
 40:[true,41,'400_0'],41:[true,42,'409_0'],42:[true,43,'418_0'],43:[true,50,'427_0']};
function knightFailureStep(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,quiet=()=>!rt.exists(writer);
 const line=KNIGHT_LINES[s.knight_mode_con];
 if(line&&(!line[0]||quiet())){
  s.knight_mode_con=line[1];if(line[3]!==undefined)scriptDelayedOn(s,rt,setVar,30,'knight_mode_con',line[3]);
  g.msg[0]=sourceText('DEVICE_FAILURE_slash_Step_0_gml_'+line[2]);rt.create(writer,70,80);
 }
 if(s.knight_mode_con===50&&quiet()){
  s.knight_mode_con=51;scriptDelayedOn(s,rt,setVar,30,'knight_mode_con',52);
  const m=rt.byId(s.heart_marker);if(m)scrLerpvar(m,rt,'image_alpha',1,0,15);
  const c=rt.create(deviceChoice,100,120);
  c.NAME[0][0]=sourceText('DEVICE_FAILURE_slash_Step_0_gml_406_0').replace(/#/g,'\n');c.NAME[1][0]=sourceText('DEVICE_FAILURE_slash_Step_0_gml_407_0').replace(/#/g,'\n');
  c.NAMEX[0][0]=70;c.NAMEX[1][0]=190;c.NAMEY[0][0]=180;c.NAMEY[1][0]=180;c.XMAX=1;c.CURX=-1;c.IDEALX=190;c.IDEALY=180;c.fadebuffer=20;
  scrLerpvar(c,rt,'choice_y_offset',20,0,20);
 }
 if(s.knight_mode_con===52&&quiet()){
  g.flag[6]=0;
  if(g.choice===0){s.knight_mode_con=53;destroyAll(rt,writer);}
  if(g.choice===1){s.knight_mode_con=55;destroyAll(rt,writer);}
 }
 // GO BACK: a white fade, and the fight again with everyone healed.
 if(s.knight_mode_con===53&&quiet()){
  s.knight_mode_con=54;scriptDelayedOn(s,rt,setVar,30,'knight_mode_con',60);sndFreeAll(rt);
  const f=scrFadeout(s,rt,30);f.imageBlend=C.white;g.darkzone=1;g.plot=320;g.interact=0;g.tempflag[90]=4;
  for(let i=0;i<4;i++)g.hp[i]=g.maxhp[i];
 }
 // GO FORWARD: a black fade, and the story goes on without the fight.
 if(s.knight_mode_con===55&&quiet()){
  s.knight_mode_con=56;scriptDelayedOn(s,rt,setVar,30,'knight_mode_con',60);scrFadeout(s,rt,30);
  g.darkzone=1;g.plot=320;g.interact=0;g.tempflag[90]=1;sndFreeAll(rt);g.flag[1047]=2;for(let i=0;i<4;i++)g.hp[i]=1;
 }
 // room_goto(room_dw_snow_zone): the host retries the battle, or leaves it.
 if(s.knight_mode_con===60)rt.pendingRoom=g.tempflag[90]===4?RETRY_ROOM:GAME_END_ROOM;
}

/** DEVICE_FAILURE: the failure screen's script, one EVENT after another (alarm 4 moves to the next). */
export const deviceFailure:GmObjectDef={name:'DEVICE_FAILURE',index:319,depth:10,events:{
 create:(s,rt)=>{
  const g=rt.globals;
  Object.assign(s,{EVENT:0,TIMER:0,HEARTMADE:0,HSINER:0,OBMADE:0});
  g.flag[20]=0;g.flag[6]=1;g.typer=667;
  Object.assign(s,{FADEFACTOR:0,WHITEFADE:0,FADEUP:0,DARK_WAIT:0,restart:false,restart_timer:0});
  s.gamepad_controls=[32769,32770,32771,32772,32773,32775,32774,32776,32777,32778,32779,32780,32781,32782,32783,32784];
  failure(rt).create(s,rt);
 },
 alarm4:s=>{s.EVENT+=1;},
 step:(s,rt)=>{
  const g=rt.globals,r=failure(rt);
  if(button1_p(rt)){
   let skipped=false;
   for(const w of rt.withInstances(writer))if(w.pos<w.length){w.skippable=1;w.skipme=1;skipped=true;}
   if(!skipped&&!rt.exists(deviceChoice)){
    if('text_timer' in s&&s.text_timer>1)s.text_timer=1;
    if(s.alarm[4]>1)s.alarm[4]=1;
    for(const d of rt.all(scriptDelayed))if(d.target===s.id&&d.alarm[0]>1)d.alarm[0]=1;
   }
  }
  if(s.EVENT===1)r.open(s,rt);
  if(s.EVENT===0)s.EVENT=1;
  if(s.EVENT===2&&!rt.exists(writer)){
   s.EVENT=3;s.alarm[4]=30;
   g.msg[0]=sourceText(g.tempflag[3]>=1?'DEVICE_FAILURE_slash_Step_0_gml_32_0':'DEVICE_FAILURE_slash_Step_0_gml_28_0');
   if(g.tempflag[3]>=1)s.alarm[4]=15;
   s.W=rt.create(writer,40,80).id;
  }
  if(s.EVENT===4&&(!r.choiceWaitsForText||!rt.exists(writer))){const c=rt.create(deviceChoice,100,120);s.choice=c.id;r.labelChoice(c,rt);s.EVENT=5;}
  if(s.EVENT===5){
   if(g.choice===0){destroyAll(rt,writer);s.EVENT=6;}
   if(g.choice===1){destroyAll(rt,writer);s.EVENT=26;}
  }
  if(s.EVENT===6){sndFreeAll(rt);s.EVENT=7;s.alarm[4]=30;r.retry(s,rt);}
  if(s.EVENT===8){
   s.WHITEFADE=1;s.FADEUP=0.01;s.EVENT=9;s.alarm[4]=120;
   if(g.tempflag[3]>=1){s.FADEUP=0.03;s.alarm[4]=45;}else if(r.whiteFadeSound)rt.sound?.(r.whiteFadeSound);
   g.tempflag[3]+=1;
  }
  if(s.EVENT===10){rt.pendingRoom=RETRY_ROOM;s.EVENT=11;}
  r.step?.(s,rt);
  if(s.EVENT===26){sndFreeAll(rt);r.giveUp(s,rt);g.msg[0]=sourceText('DEVICE_FAILURE_slash_Step_0_gml_103_0');s.EVENT=27;s.W=rt.create(writer,60,80).id;}
  if(s.EVENT===27&&!rt.exists(writer)){music(rt,'AUDIO_DARKNESS',false);s.EVENT=28;s.DARK_WAIT=0;}
  if(s.EVENT===28){
   s.DARK_WAIT+=1;
   if(s.DARK_WAIT>=2040)rt.pendingRoom=GAME_END_ROOM;
   if(!rt.sourceAudio?.playing(g.currentsong[1]))rt.pendingRoom=GAME_END_ROOM;
   // The console version's way out, as a browser page is not closed by the game: a button after three seconds
   // fades the music and leaves 100 frames later.
   if(s.DARK_WAIT>=90&&!s.restart&&(button1_p(rt)||button2_p(rt)||button3_p(rt))){rt.sourceAudio?.volume(g.currentsong[1],0,80);s.restart=true;}
   if(s.restart){s.restart_timer++;if(s.restart_timer>=100)rt.pendingRoom=GAME_END_ROOM;}
  }
  // Holding X hurries the voice along.
  if(s.EVENT>=0&&s.EVENT<=4&&held(rt,KEY.x,KEY.shift))for(const w of rt.withInstances(writer)){
   if(w.pos<w.length-3)w.pos+=2;
   if(le(w.specfade,0.9))w.specfade-=0.1;
   if(le(w.rate,1))w.rate=1;
  }
 },
 draw:(s,rt)=>{
  const d=rt.drawState;d.alpha=s.FADEFACTOR;d.color=s.WHITEFADE===0?C.black:C.white;rt.drawRect(-10,-10,999,999);d.alpha=1;
  if(s.FADEUP>0&&lt(s.FADEFACTOR,1))s.FADEFACTOR+=s.FADEUP;
 },
}};

/** DEVICE_CHOICE as the failure screen uses it (TYPE 0): two words side by side, chosen with left and right; the
 * soul glides to the chosen one. Its other types (numbers, lists, name entry) belong to other screens. */
export const deviceChoice:GmObjectDef={name:'DEVICE_CHOICE',index:317,sprite:'IMAGE_SOUL_BLUR',events:{
 create:(s,rt)=>{
  const g=rt.globals,[yes,no]=failure(rt).choiceKeys;
  Object.assign(s,{CURX:0,CURY:0,XMAX:0,YMAX:0,PLAYERNAMEY:40,TYPE:0,NAMESTRING:'',STRINGMAX:12,xoff:0,yoff:0,LANGSUBTYPE:0});
  g.choice=-1;
  s.NAME=[[sourceText(yes)],[sourceText(no)]];s.NAMEX=[[110],[190]];s.NAMEY=[[180],[180]];
  s.XMAX=1;s.CURX=-1;s.IDEALX=150;s.IDEALY=180;
  s.HEARTX=150;s.HEARTY=s.NAMEY[0][0];
  Object.assign(s,{DRAWHEART:1,ONEBUFFER:0,TWOBUFFER:0,FINISH:0,fadebuffer:10});
  if(failure(rt).choiceSlides)s.choice_y_offset=0;
 },
 step:(s,rt)=>{
  const g=rt.globals;
  if(s.TYPE!==0)throw Error(`DEVICE_CHOICE type ${s.TYPE} is not ported`);
  if(s.fadebuffer>0)s.ONEBUFFER=1;
  if(s.fadebuffer<0&&s.FINISH===0){if(pressed(rt,KEY.right))s.CURX=1;if(pressed(rt,KEY.left))s.CURX=0;}
  s.DRAWHEART=1;
  if(s.CURX>=0){
   s.IDEALX=s.NAMEX[s.CURX][s.CURY];s.IDEALY=s.NAMEY[s.CURX][s.CURY];
   rt.drawState.font='fnt_main';s.IDEALX+=rt.stringWidth(s.NAME[s.CURX][s.CURY])/2-10;
  }else{s.IDEALX=150;s.IDEALY=180;}
  if(Math.abs(s.HEARTX-s.IDEALX)<=2)s.HEARTX=s.IDEALX;
  if(Math.abs(s.HEARTY-s.IDEALY)<=2)s.HEARTY=s.IDEALY;
  s.HEARTDIFF=(s.IDEALX-s.HEARTX)*0.3;s.HEARTX+=s.HEARTDIFF;
  s.HEARTDIFF=(s.IDEALY-s.HEARTY)*0.3;s.HEARTY+=s.HEARTDIFF;
  if(s.FINISH===0&&button1_p(rt)&&s.CURX>=0&&s.ONEBUFFER<0){g.choice=s.CURX;s.FINISH=1;s.ONEBUFFER=99;}
  s.ONEBUFFER-=1;
  if(s.FINISH===0)s.fadebuffer-=1;
  if(s.FINISH===1){g.flag[20]=1;if(s.fadebuffer<0)s.fadebuffer=0;s.fadebuffer+=1;if(s.fadebuffer>=10)rt.destroy(s);}
 },
 draw:(s,rt)=>{
  const d=rt.drawState;d.font='fnt_main';
  s.xfade=Math.min(1,(10-s.fadebuffer)/10);
  if(s.DRAWHEART===1)rt.drawSprite('IMAGE_SOUL_BLUR',0,s.HEARTX+s.xoff,s.HEARTY+s.yoff,1,1,0,C.white,0.6*s.xfade);
  d.alpha=s.xfade;
  for(let i=0;i<=s.XMAX;i++){d.color=s.CURX===i?C.yellow:C.white;rt.drawText(s.NAMEX[i][0],s.NAMEY[i][0]+(failure(rt).choiceSlides?s.choice_y_offset:0),s.NAME[i][0].replace(/#/g,'\n'));}
  d.alpha=1;
 },
}};

/** For pointers (the host): which of the failure screen's choices is at (x, y) in the 320x240 view, if any. */
export function choiceAt(rt:GmRuntime,x:number,y:number):number|null{
 const c=rt.first(deviceChoice);if(!c||c.FINISH!==0)return null;
 rt.drawState.font='fnt_main';
 for(let i=0;i<=c.XMAX;i++){const left=c.NAMEX[i][0]-12,right=c.NAMEX[i][0]+rt.stringWidth(c.NAME[i][0])+12;if(x>=left&&x<=right&&y>=c.NAMEY[i][0]-10&&y<=c.NAMEY[i][0]+26)return i;}
 return null;
}
/** The pointer's choice: the soul moves there, and a click takes it (DEVICE_CHOICE reads it as a Z press). */
export function pointChoice(rt:GmRuntime,choice:number,take:boolean){
 const c=rt.first(deviceChoice);if(!c||c.FINISH!==0)return;c.CURX=choice;if(take)rt.input.pressed.add(KEY.z);
}
