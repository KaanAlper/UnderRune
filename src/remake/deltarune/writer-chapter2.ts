// The battle writer from Chapter 2 on. Working values stay on the instance because events and scripts share them.
// What later chapters change is in WRITER_CHAPTERS: Chapter 3 adds voices, a speaker and a colour, fading text,
// objects set into the text (\O), a shadowed style (special 5), a sound when the text ends, and Tenna's spacing.
import {gmArray,type GmInstance,type GmRuntime} from '../gm/runtime';
import {C} from '../gm/graphics';
import {lengthdirX,lengthdirY,round,le,lt,ge,gt} from '../gm/math';
import {KEY} from './battle';
import {face,faceParent} from './writer';
import {forChapter} from './rules';
import {choicerNeo} from './choicer';

type Step=(s:GmInstance,rt:GmRuntime)=>void;
export interface WriterPart{create:Step;alarm0:Step;alarm1:Step;alarm2:Step;draw:Step;textType:Step;
 /** User 5: lay the text out now (Chapter 3's balloons ask for it); earlier chapters have no such event. */
 user5:Step;}
type Voice={font:string;color:number;rate:number;sound:string;hspace:number;vspace:number;special:number;charline?:number;shake?:number;yoff?:number;extra?:Record<string,number>};
/** A voice, or one that depends on the game state (the dark world, the room). */
type VoiceOf=Voice|((g:Record<string,any>,rt:GmRuntime)=>Voice);
const main=(sound='snd_text',rate=1,hspace=8,vspace=18,special=0):Voice=>({font:'fnt_main',color:C.white,rate,sound,hspace,vspace,special});
const big=(sound='snd_text',vspace=36,rate=1,hspace=16):Voice=>({...main(sound,rate,hspace,vspace,1),font:'fnt_mainbig'});
const dotum=(sound='snd_text',rate=1):Voice=>({...main(sound,rate,9,20),font:'fnt_dotumche',color:C.black});
const VOICES:Readonly<Record<number,VoiceOf>>={
 1:main(),2:main('snd_nosound',2),3:{...main('snd_text',2),special:1},4:big('snd_text',28),5:main(),6:big(),7:main('snd_txttor'),8:main('snd_txttor',2),
 10:main('snd_txtsus'),11:main('snd_txtsus'),12:main('snd_txtnoe'),13:main('snd_txtber'),14:{...main('snd_txtsans'),font:'fnt_comicsans'},15:main(),17:main('snd_txtund'),18:main('snd_txtasg'),19:main(),20:main('snd_txtal'),21:main('snd_txtal'),
 22:{...main('snd_txtal',1,6),font:'fnt_tinynoelle',yoff:7},23:{...main('snd_txtnoe',1,6),font:'fnt_tinynoelle',yoff:7},30:big('snd_txtsus'),31:big('snd_txtral'),32:big('snd_txtlan'),33:big('snd_dadtxt'),35:big('snd_txtjok'),36:big('snd_nosound'),37:big('snd_txtsus',36,3,18),
 40:main('snd_nosound',2),41:main('snd_nosound',3),42:big('snd_nosound',36,2),45:big('snd_txtral',28),46:big('snd_txtlan',28),47:big('snd_txtsus',28),48:big('snd_dadtxt',28),50:dotum(),51:big('snd_text',36,10),52:big('snd_text',36,6),53:dotum('snd_txtsus'),54:dotum('snd_txtsus',2),55:main('snd_txtrud'),
 56:big('snd_txtnoe'),57:big('snd_txtber'),58:big('snd_txtq'),59:big('snd_txtnoe',28),60:main('snd_txtral',2,12,20),61:main('snd_txtsus',2,12,20),62:big('snd_txtq_2'),63:main('snd_txtnoe',2),64:{...main('snd_txtnoe',2),shake:1},65:big('snd_txtrx1'),66:big('snd_txtspam'),67:big('snd_txtspam2'),68:dotum('snd_txtspam'),69:dotum('snd_txtber'),70:dotum('snd_txtq'),71:dotum('snd_txtq'),72:dotum('snd_txtspam2'),74:dotum('snd_txtral'),75:dotum('snd_txtsus'),76:dotum('snd_txtnoe'),77:big('snd_txtber',28),78:{...big(),charline:36},
 666:main('snd_nosound',4,12,20,2),667:main('snd_nosound',2,12,20,2),999:main('snd_txtecho',4,8,18,3),
};
const at=(text:string,index:number)=>index>0&&index<=text.length?text[index-1]:'';
const confirm=(rt:GmRuntime)=>rt.input.pressed.has(KEY.z)||rt.input.pressed.has(KEY.enter);
const skipHeld=(rt:GmRuntime)=>rt.input.held.has(KEY.x)||rt.input.held.has(KEY.shift);
const SILENT=new Set([' ','^','!','.','?',',',':','/','\\','|','*']);
export function textType2(s:GmInstance,rt:GmRuntime){
 s.textscale=1;const entry=wch(rt).voices[rt.globals.typer];if(!entry)return;const voice=typeof entry==='function'?entry(rt.globals,rt):entry;
 if(rt.globals.lang==='ja')throw Error('Chapter 2 writer Japanese font setup is not ported');
 Object.assign(s,{myfont:voice.font,mycolor:voice.color,writingx:s.x,writingy:s.y+(voice.yoff??0),charline:voice.charline??33,shake:voice.shake??0,rate:voice.rate,textsound:voice.sound,hspace:voice.hspace,vspace:voice.vspace,special:voice.special,colorchange:1,xcolor:voice.color});
 if(voice.extra)Object.assign(s,voice.extra);
}
function playSound(rt:GmRuntime,name:string,pitch=1,volume?:number){
 if(rt.sourceAudio)return rt.sourceAudio.effect(name,pitch,volume)??name;
 rt.sound?.(name,pitch);return name;
}
function textSound2(s:GmInstance,rt:GmRuntime){
 s.playtextsound=skipHeld(rt)?0:1;if(s.skippable===0)s.playtextsound=1;if(s.playtextsound!==1)return;
 s.getchar=at(s.mystring,s.rate<=2?s.pos:s.pos-1);s.play=1;s.playcheck=0;
 if(s.getchar==='&'||s.getchar==='\n'){if(lt(s.rate,3)){s.playcheck=1;s.getchar=at(s.mystring,s.pos+1);}else s.play=0;}
 if(SILENT.has(s.getchar))s.play=0;if(s.play!==1)return;
 if(s.textsound==='snd_txtq'){
  rt.soundStop?.('snd_txtq_2');s.qv=playSound(rt,'snd_txtq_2');s.qp=.9+rt.random.random(.15);rt.soundPitch?.(s.qv,s.qp);s.sound_timer=2;
 }else if(s.textsound==='snd_txtspam'){
  rt.soundStop?.('snd_txtspam2');playSound(rt,'snd_txtspam2',1.2,.8);s.sound_timer=2;
 }else if(s.textsound==='snd_txtsans'){
  rt.soundStop?.('snd_txtsans');s.qv=playSound(rt,'snd_txtsans');s.sound_timer=2;
 }else if(s.textsound==='snd_tv_voice_short'){
  const g=rt.globals,clip=rt.random.irandom(8)+1;if(g.flag[1054]<=0)g.flag[1054]=1;
  const pitch=(.86+rt.random.random(.35))*g.flag[1054],name='snd_tv_voice_short'+(clip>=2?'_'+clip:'');
  for(let i=1;i<=9;i++)rt.soundStop?.('snd_tv_voice_short'+(i>=2?'_'+i:''));
  playSound(rt,name,pitch,.7);s.sound_timer=3;
 }else rt.sound?.(s.textsound);
 for(const f of rt.all(faceParent))f.mouthmove=1;s.miniface_pos++;
}
function nextMessage2(s:GmInstance,rt:GmRuntime){
 const later=wch(rt).later;
 s.msgno++;Object.assign(s,{lineno:0,aster:0,halt:0,pos:1,drawaster:1,autoaster:1,miniface_pos:0,miniface_current_pos:-1,mystring:s.nstring[s.msgno],formatted:0,wxskip:0,sound_played:0,forcebutton1:0});
 if(later){s.reachedend=0;s.reachedend_sound_played=0;}
 s.alarm[0]=1;
 if(lt(s.rate,3)){s.firstnoise=0;s.alarm[2]=1;}
 if(later){for(let i=0;i<9;i++)s.object_made[i]=0;for(const t of rt.instances)if(t.live&&belongsTo(t,'obj_funnytext'))rt.destroy(t);}
}
function create(s:GmInstance,rt:GmRuntime){
 const later=wch(rt).later;
 Object.assign(s,{skipme:0,forcebutton1:0,textsound:'snd_text',charline:33,originalcharline:33,hspace:8,vspace:18,rate:1,mycolor:C.white,myfont:'fnt_main',shake:0,special:0,skippable:rt.globals.flag[6]===1?0:1,automash_timer:0,f:rt.globals.darkzone===1?2:1,prevent_mash_buffer:0,formattext:true});
 // The end sound keeps the original's sound number (only fixed text sets reachedend_sound_play).
 if(later)Object.assign(s,{textalpha:1,textalphagain:0,fadeonend:0,shadcolor:0x6fd213,reachedend_sound:259,reachedend_sound_played:0,reachedend_sound_play:0});
 textType2(s,rt);
 Object.assign(s,{autoaster:1,drawaster:1,pos:2,lineno:0,aster:0,halt:0,reachedend:0,xcolor:C.black,wxskip:0,msgno:0,first_alarm:0,firstnoise:0,noiseskip:0,formatted:0,colorchange:0,fontchange:0,sound_played:0,sound_timer:0,sound_count:0,jpspecial:0,jpused:0,writingx:s.x,writingy:s.y,dialoguer:0,smallface:505050,faced:0,facedever:0,facer:0,siner:0,specfade:1,autocenter:0,miniface_current_pos:-1,miniface_pos:0,miniface_drawn:0});
 for(s.i=0;s.i<7;s.i++){gmArray(s,'specx')[s.i]=s.i*6;gmArray(s,'specy')[s.i]=s.i*6;}
 s.mystring=rt.globals.msg[0];for(s.j=0;s.j<100;s.j++)gmArray(s,'nstring')[s.j]=rt.globals.msg[s.j];s.length=s.mystring.length;s.alarm[0]=s.rate;
 if(lt(s.rate,3))s.alarm[2]=1;else textSound2(s,rt);
 if(later)for(s.i=0;s.i<9;s.i++)gmArray(s,'object_made')[s.i]=0;
}
function alarm0(s:GmInstance,rt:GmRuntime){
 const later=wch(rt).later;let playsound=false;
 if(gt(s.rate,2))s.alarm[1]=1;else {s.sound_timer--;if(s.first_alarm===1&&ge(s.pos,2)&&le(s.sound_timer,0)){if(later)playsound=true;else textSound2(s,rt);}}
 if(le(s.pos,s.length))s.alarm[0]=s.rate;else s.reachedend=1;
 const end=()=>{
  if(later&&s.reachedend_sound_play&&s.reachedend&&!s.reachedend_sound_played)playsound=false;
  if(playsound)textSound2(s,rt);
 };
 if(s.first_alarm===0){s.getchar=at(s.mystring,1);s.pos+=s.getchar==='\\'?3:1;s.first_alarm=1;end();return;}
 s.getchar=at(s.mystring,s.pos);s.nextchar=at(s.mystring,s.pos+1);
 if(s.getchar==='`'){s.pos+=2;return;}
 if(s.getchar==='&'||s.getchar==='\n')s.pos++;
 if(s.getchar==='\\')s.pos+=3;
 if(s.getchar==='/'){s.halt=s.nextchar==='%'?2:1;s.alarm[0]=-1;}
 s.getchar=at(s.mystring,s.pos);s.nextchar=at(s.mystring,s.pos+1);
 if(s.getchar==='|')s.pos+=2;
 if(s.getchar==='^'){s.pos+=2;if(gt(s.alarm[0],0))s.alarm[0]+=[0,5,10,15,20,30,40,60,90,150][Number(s.nextchar)]??0;}
 s.pos++;
 end();
}
const FACES:Readonly<Record<string,number>>={'0':0,S:1,R:2,N:3,T:4,L:5,s:6,U:9,A:10,a:11,B:12,b:19,r:15,u:18,K:20,Q:21};
function expression(s:GmInstance,rt:GmRuntime){
 s.__nextface=s.nextchar2.charCodeAt(0);
 if(s.__nextface>=48&&s.__nextface<=57)rt.globals.fe=Number(s.nextchar2);
 else if(s.__nextface>=65&&s.__nextface<=90)rt.globals.fe=s.__nextface-55;
 else if(s.__nextface>=97&&s.__nextface<=122)rt.globals.fe=s.__nextface-61;
}
function asterSkip(s:GmInstance){if(s.aster===1&&s.autoaster===1){s.length+=2;s.mystring=s.mystring.slice(0,s.i-1)+'||'+s.mystring.slice(s.i-1);}if(s.aster===2)s.aster=1;}
function format(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;
 if(s.dialoguer===1){
  s.charline=g.fc===0?s.originalcharline:26;
  // Chapter 3: Tenna's lines are longer and further apart (30 between lines, as a writer is always there).
  if(wch(rt).later&&g.fc===22){s.charline=30;s.vspace=28;if(rt.instances.some(i=>i.live&&belongsTo(i,'obj_writer')))s.vspace=30;}
  s.writingx=g.fc===0?s.x:s.x+58*s.f;
  const dialoguer=rt.instances.find(i=>i.live&&belongsTo(i,'obj_dialoguer'));
  if(dialoguer?.zurasucon===2)s.writingx=rt.view.x+dialoguer.remwriterx+(g.fc>0?58*s.f:0);
 }
 s.length=s.mystring.length;Object.assign(s,{charpos:-1,remspace:-1,remchar:-1,linecount:0,stringmax:0,aster:0});
 for(s.i=0;lt(s.i,s.length+1);s.i++){
  s.skip=0;s.thischar=at(s.mystring,s.i);
  if(s.thischar==='`')s.i++;
  else if(s.thischar==='/'||s.thischar==='%'){if(gt(s.charpos,-1))s.charpos--;}
  else if(s.thischar==='^'){if(gt(s.charpos,-1))s.charpos-=2;}
  else if(s.thischar==='\\'){
   if(gt(s.charpos,-1))s.charpos-=3;
   if(s.dialoguer===1){s.nextchar=at(s.mystring,s.i+1);s.nextchar2=at(s.mystring,s.i+2);
    if(s.nextchar==='E')expression(s,rt);
    if(s.nextchar==='F'){if(FACES[s.nextchar2]!==undefined&&s.nextchar2!=='b')g.fc=FACES[s.nextchar2];s.charline=g.fc===0?s.originalcharline:26;s.writingx=g.fc===0?s.x:s.x+58*s.f;}
    if(s.nextchar==='m')s.drawaster=0;if(s.nextchar==='s'&&s.nextchar2==='0')s.skippable=0;
    if(s.nextchar==='O'&&wch(rt).later)throw Error('Chapter 3 writer objects (\\O) are not ported');
   }
  }else if(s.thischar==='&'||s.thischar==='\n'){
   if(gt(s.charpos,s.stringmax))s.stringmax=s.charpos;s.remspace=-1;s.charpos=0;s.linecount++;s.skip=1;s.nextchar=at(s.mystring,s.i+1);
   if(s.aster===1&&s.autoaster===1&&s.nextchar!=='*'&&g.lang!=='ja'){s.charpos=2;s.length+=2;s.mystring=s.mystring.slice(0,s.i)+'||'+s.mystring.slice(s.i);s.i+=2;}
  }
  if(s.skip===0){
   if(s.thischar===' '){s.remspace=s.i;s.remchar=s.charpos;}if(s.thischar==='*')s.aster=1;
   if(ge(s.charpos,s.charline)){
    if(gt(s.remspace,2)){
     s.mystring=s.mystring.slice(0,s.remspace-1)+'&'+s.mystring.slice(s.remspace);s.i=s.remspace+1;if(gt(s.remchar,s.stringmax))s.stringmax=s.remchar;s.remspace=-1;s.charpos=1;s.linecount++;asterSkip(s);
    }else{
     if(gt(s.charpos,s.stringmax))s.stringmax=s.charpos;s.mystring=s.mystring.slice(0,s.i-1)+'&'+s.mystring.slice(s.i-1);s.length++;s.charpos=1;s.remspace=-1;s.linecount++;s.i++;asterSkip(s);
    }
   }else s.charpos++;
  }
 }
 if(s.autocenter===1){s.x=rt.view.x+320-s.stringmax*s.hspace/2+5;s.y=rt.view.y+240-(s.writingy+(s.linecount+1)*s.vspace)/2-10;}
 if(gt(s.charpos,s.stringmax))s.stringmax=s.charpos;s.formatted=1;
}
const SPEAKERS:Readonly<Record<string,(g:Record<string,any>)=>number>>={
 '0':g=>g.darkzone===1?6:5,'1':()=>2,A:()=>18,a:()=>20,N:g=>g.fighting===1?59:g.darkzone===1?56:12,n:()=>23,B:g=>g.fighting===1?77:g.darkzone===1?57:13,
 S:g=>g.darkzone===1?(g.fighting===1?47:30):10,R:g=>g.flag[30]===1?6:g.fighting===1?45:31,L:g=>g.fighting===1?46:32,X:()=>40,r:()=>55,T:()=>7,J:()=>35,K:g=>g.fighting===1?48:33,q:()=>62,Q:()=>58,s:()=>14,U:()=>17,p:()=>67,
};
const COLORS:Readonly<Record<string,number>>={R:C.red,B:0xff0000,Y:C.yellow,G:C.lime,W:C.white,X:C.black,P:C.purple,M:0x000080,S:0xff80ff,V:0x80ff80};
function belongsTo(s:GmInstance,name:string){for(let def=s.object;def;def=def.parent!)if(def.name===name)return true;return false;}
function clearSmallFaces(rt:GmRuntime){for(const i of rt.instances)if(i.live&&belongsTo(i,'obj_smallface'))rt.destroy(i);}
function drawCharacter(s:GmInstance,rt:GmRuntime){
 const d=rt.drawState;
 if(s.drawaster===0&&s.mychar==='*')s.mychar=' ';
 if(s.colorchange===1)d.color=s.xcolor;
 if(s.mychar==='#'&&at(s.mystring,s.n-1)!=='`')s.mychar='\n';
 if(s.jpspecial===1)throw Error('Chapter 2 writer Japanese character effect is not ported');
 const shake=()=>{const y=rt.random.random(s.shake),x=rt.random.random(s.shake);return [x,y];};
 if(s.special===0){const [x,y]=shake();rt.drawText(s.wx+x,s.wy+y,s.mychar,s.textscale,s.textscale,0);}
 if(s.special===1){
  if(d.color!==C.white&&d.color!==C.black){let [x,y]=shake();rt.drawTextColor(s.wx+x+1,s.wy+y+1,s.mychar,s.xcolor,s.xcolor,.3);[x,y]=shake();rt.drawTextColor(s.wx+x,s.wy+y,s.mychar,C.white,s.xcolor,1);}
  else {let [x,y]=shake();rt.drawTextColor(s.wx+x+1,s.wy+y+1,s.mychar,0x404040,0x800000,1);[x,y]=shake();rt.drawText(s.wx+x,s.wy+y,s.mychar);}
 }
 if(s.special===2){
  d.alpha=s.specfade;rt.drawText(s.wx,s.wy,s.mychar);d.alpha=(.3+Math.sin(s.siner/14)*.1)*s.specfade;
  for(const [x,y] of [[1,0],[-1,0],[0,1],[0,-1]])rt.drawText(s.wx+x,s.wy+y,s.mychar);
  d.alpha=(.08+Math.sin(s.siner/14)*.04)*s.specfade;for(const [x,y] of [[1,1],[-1,-1],[-1,1],[1,-1]])rt.drawText(s.wx+x,s.wy+y,s.mychar);d.alpha=1;
 }
 if(s.special===5){
  // Arguments run right to left: each shake draws y's offset before x's.
  d.alpha=.25;d.color=s.shadcolor;
  {const [x,y]=shake();rt.drawText(s.wx+x,s.wy+1+y,s.mychar);}
  {const [x,y]=shake();rt.drawText(s.wx+1+x,s.wy+y,s.mychar);}
  {const [x,y]=shake();rt.drawText(s.wx+1+x,s.wy+1+y,s.mychar);}
  d.alpha=1;d.color=C.black;{const [x,y]=shake();rt.drawText(s.wx+x,s.wy+y,s.mychar);}
 }
 if(s.special===3){
  d.color=C.white;d.alpha=1;rt.drawText(s.wx+Math.sin(s.siner/4),s.wy+Math.cos(s.siner/4),s.mychar);d.alpha=.5;
  for(const period of [5,7,9])rt.drawText(s.wx+Math.sin(s.siner/period),s.wy+Math.cos(s.siner/period),s.mychar);
  for(s.i=0;s.i<7;s.i++){
   s.ddir=315+rt.random.random(15);
   if(s.n===1){s.specx[s.i]+=lengthdirX(2,s.ddir);s.specy[s.i]+=lengthdirY(2,s.ddir);if(ge(s.specx[s.i],40)){s.specx[s.i]=0;s.specy[s.i]=0;}}
   d.alpha=(40-s.specx[s.i])/40*.7;rt.drawText(s.wx+s.specx[s.i],s.wy+s.specy[s.i],s.mychar);
  }d.alpha=1;
 }
 s.wx+=s.hspace;if(rt.globals.lang==='en'){
  if(s.myfont==='fnt_comicsans')s.wx+=({w:2,m:3,i:-2,l:-2,s:-1,j:-1} as Record<string,number>)[s.mychar]??0;
  if(s.jpused===1)s.wx+=16;
 }
}
function draw(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,d=rt.drawState;Object.assign(s,{button1:0,button2:0,button3:0,miniface_drawn:-1});
 if(confirm(rt)&&le(s.prevent_mash_buffer,0))s.button1=1;if(skipHeld(rt)&&le(s.prevent_mash_buffer,0))s.button2=1;
 // scr_debug() in the installed game returns 0; automash is enabled by flag 10.
 if(g.flag[10]===1&&rt.input.held.has(KEY.c)){s.prevent_mash_buffer=3;s.automash_timer=s.automash_timer===0?1:0;if(s.automash_timer===0)s.button1=1;else s.button2=1;}
 if(s.forcebutton1)s.button1=1;s.prevent_mash_buffer--;
 const ch=wch(rt);
 if(ch.later&&rt.instances.some(i=>i.live&&belongsTo(i,'obj_rouxls_ch3_enemy')))throw Error("Chapter 3 Rouxls's writer spacing (vspacechange) is not ported");
 if(s.formatted===0)format(s,rt);
 s.accept=0;s.wx=s.writingx;s.wy=s.writingy;s.colorchange=0;d.font=s.myfont;d.color=s.mycolor;
 if(ch.later){
  if(s.fadeonend!==0&&s.reachedend===1){s.textalphagain=-Math.abs(s.fadeonend);if(le(s.textalpha,0))rt.destroy(s);}
  if(s.textalphagain!==0)s.textalpha=Math.max(0,Math.min(1,s.textalpha+s.textalphagain));
  if(s.textalpha!==1)d.alpha=s.textalpha;
 }
 if(s.halt===0&&s.button2===1&&lt(s.pos,s.length)&&s.skippable===1)s.skipme=1;
 if(s.skipme===1){s.pos=s.mystring.length+1;s.reachedend=1;s.alarm[0]=-1;s.alarm[1]=-1;}
 for(s.n=1;lt(s.n,s.pos);s.n++){
  s.accept=1;s.mychar=at(s.mystring,s.n);
  if(s.mychar==='`'){s.n++;s.mychar=at(s.mystring,s.n);}
  else if(s.mychar==='&'||s.mychar==='\n'){s.accept=0;s.wx=s.writingx+(s.wxskip===1?58:0);s.wy+=s.vspace;}
  else if(s.mychar==='|'){s.accept=0;s.wx+=s.hspace;}
  else if(s.mychar==='^'){s.accept=0;s.n++;}
  else if(s.mychar==='/'){s.halt=at(s.mystring,s.n+1)==='%'?2:1;if(ch.later)s.reachedend=1;s.accept=0;}
  else if(s.mychar==='%'){
   s.accept=0;if(at(s.mystring,s.n-1)==='/')s.halt=2;
   if(at(s.mystring,s.n+1)==='%')rt.destroy(s);else if(s.halt!==2)nextMessage2(s,rt);
  }else if(s.mychar==='\\'){
   s.nextchar=at(s.mystring,s.n+1);s.nextchar2=at(s.mystring,s.n+2);
   if(s.nextchar==='E')expression(s,rt);
   if(s.nextchar==='F'){
    if(FACES[s.nextchar2]!==undefined)g.fc=FACES[s.nextchar2];if(s.dialoguer===1){s.charline=g.fc===0?s.originalcharline:26;s.wx=g.fc===0?s.x:s.x+58*s.f;}
   }
   if(s.nextchar==='f'&&s.faced===0){if(!g.onChapter2SmallFace)throw Error('Chapter 2 writer small-face host is not installed');g.onChapter2SmallFace(s,s.nextchar2);}
   if(s.nextchar==='*')throw Error('Chapter 2 writer button sprite resolver is not ported');
   if(s.nextchar==='T'){
    const typer=ch.speakers[s.nextchar2];if(typer){g.typer=typer(g);textType2(s,rt);d.font=s.myfont;}
    if(s.dialoguer===1){if(g.fc===0){s.charline=s.originalcharline;s.wx=s.x;}else s.wxskip=1;}
   }
   if(s.nextchar==='s'){if(s.nextchar2==='0')s.skippable=0;if(s.nextchar2==='1')s.skippable=1;}
   if(s.nextchar==='c'){s.colorchange=1;s.xcolor=s.nextchar2==='0'?s.mycolor:ch.colors[s.nextchar2]??s.xcolor;}
   if(s.nextchar==='O'&&ch.later)throw Error('Chapter 3 writer objects (\\O) are not ported');
   if(s.nextchar==='C'){
    if(s.nextchar2==='1')throw Error('Chapter 2 writer choice object obj_choicer_old (\C1) is not ported');
    // \C2-\C4: two to four answers; the writer waits (halt 5) until one is chosen.
    if(/[2-4]/.test(s.nextchar2)){if(!rt.exists(choicerNeo)){const c=rt.create(choicerNeo,0,0);s.choicer=c.id;c.choicetotal=Number(s.nextchar2)-1;}s.halt=5;}
   }
   if(s.nextchar==='M'&&/^[0-9]$/.test(s.nextchar2))g.flag[20]=Number(s.nextchar2);
   if(s.nextchar==='S'&&s.sound_played===0){for(s.i=0;s.i<10;s.i++)if(s.nextchar2===String(s.i)&&s.sound_played===0){rt.sound?.(g.writersnd[s.i]);s.sound_played=1;}}
   if(s.nextchar==='I'){for(s.i=0;s.i<10;s.i++)if(s.nextchar2===String(s.i))rt.drawSprite(g.writerimg[s.i],0,s.wx,s.wy+4);}
   if(s.nextchar==='m'){
    s.drawaster=0;for(s.i=0;s.i<10;s.i++)if(s.nextchar2===String(s.i)){
     if(ge(s.n,s.miniface_current_pos)){s.miniface_image=s.miniface_pos/4;s.miniface_current_pos=s.n;}else s.miniface_image=0;
     rt.drawSprite(g.writerimg[s.i],s.miniface_image,s.writingx-8,s.wy-4,2,2,0,s.mycolor,1);s.miniface_drawn=s.i;
    }
   }
   s.accept=0;s.n+=2;
  }
  if(s.accept===1)drawCharacter(s,rt);
 }
 if(ch.later&&s.reachedend_sound_play&&s.reachedend===1&&s.reachedend_sound_played===0)throw Error('Chapter 3 writer end sound is not ported');
 if(s.halt!==0&&s.button1===1&&gt(s.siner,0)){
  if(s.halt===1){nextMessage2(s,rt);clearSmallFaces(rt);}
  if(s.halt===2){clearSmallFaces(rt);if(s.facer===1)for(const f of rt.all(face))rt.destroy(f);rt.destroy(s);}
 }
 s.skipme=0;s.siner++;
 if(ch.later&&s.textalpha!==1)d.alpha=1;
}
/** The writer's chapter differences. */
interface WriterChapter{voices:Readonly<Record<number,VoiceOf>>;speakers:Readonly<Record<string,(g:Record<string,any>)=>number>>;colors:Readonly<Record<string,number>>;
 /** Chapter 3's additions: fading text, the end sound, writer objects, special style 5, Tenna's spacing. */
 later:boolean;}
const BOARD_ROOMS=new Set(['room_board_preshadowmantle','room_shadowmantle','room_board_dungeon_2']);
const WRITER_CHAPTERS:Readonly<Record<number,WriterChapter>>={
 2:{voices:VOICES,speakers:SPEAKERS,colors:COLORS,later:false},
 3:{
  voices:{...VOICES,
   17:g=>g.darkzone===1?big('snd_txtund'):main('snd_txtund'),
   79:big('snd_txtsusral'),80:big('snd_tv_voice_short'),81:{...dotum('snd_tv_voice_short'),extra:{extra_ja_vspace:2}},
   100:(_g,rt)=>({...main('snd_text',1,16,20),font:BOARD_ROOMS.has(rt.room.name)?'fnt_8bit_mixed':'fnt_8bit',charline:22}),
   101:{...main('snd_text',1,16,20),font:'fnt_8bit_mixed',charline:22},
  },
  speakers:{...SPEAKERS,v:g=>g.fighting===1?81:80},
  colors:{...COLORS,I:0xffc081},
  later:true,
 },
};
const wch=(rt:GmRuntime)=>forChapter(rt,WRITER_CHAPTERS,'writer');
export const writer2:WriterPart={create,alarm0,alarm1:(s,rt)=>{if(lt(s.pos,s.length+2))textSound2(s,rt);},alarm2:(s,rt)=>{if(s.firstnoise===0){s.firstnoise=1;textSound2(s,rt);}},draw,textType:textType2,
 user5:(s,rt)=>{if(wch(rt).later&&s.formatted===0)format(s,rt);}};
