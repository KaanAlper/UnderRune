// DELTARUNE's text system, re-implemented: obj_writer (typewriter text with control codes, word wrap, "* "
// indents, page halts), scr_texttype (font, spacing, speed and voice per typer), obj_face (speaker portraits),
// obj_battleblcon (enemy speech balloons) and scr_battletext. Like the original, the writer draws in its Draw
// event and calls random() for every character it draws (its shake offset), so it changes the random sequence.
import type {GmInstance,GmObjectDef,GmRuntime} from '../gm/runtime';
import {C} from '../gm/graphics';
import {KEY} from './battle';
import {optionalSourceText} from '../host/text';
import {forChapter} from './rules';
import {writer2,type WriterPart} from './writer-chapter2';

/** scr_textsetup values per global.typer (English, Chapter 1): font, colour, speed, voice, spacing, effect. */
type Typer={font:string;color:number;rate:number;sound:string|null;hspace:number;vspace:number;special:number;yoff?:number};
const main=(sound:string|null,rate=1,special=0):Typer=>({font:'fnt_main',color:C.white,rate,sound,hspace:8,vspace:18,special});
const big=(sound:string|null,vspace:number,rate=1):Typer=>({font:'fnt_mainbig',color:C.white,rate,sound,hspace:16,vspace,special:1});
const dotum=(sound:string,rate=1):Typer=>({font:'fnt_dotumche',color:C.black,rate,sound,hspace:9,vspace:20,special:0});
export const TYPERS:Record<number,Typer>={
 0:main('snd_text'),1:main('snd_text'),2:main(null,2),3:main('snd_text',2,1),4:big('snd_text',28),5:main('snd_text'),6:big('snd_text',36),
 7:main('snd_txttor'),8:main('snd_txttor',2),10:main('snd_txtsus'),11:main('snd_txtsus'),12:main('snd_txtnoe'),13:main('snd_txtber'),
 14:{...main('snd_txtsans'),font:'fnt_comicsans'},15:main('snd_text'),16:main('snd_txtund'),17:main('snd_txtund'),18:main('snd_txtasg'),19:main('snd_text'),
 20:main('snd_txtal'),21:main('snd_txtal'),22:{...main('snd_txtal'),font:'fnt_tinynoelle',hspace:6,yoff:7},23:{...main('snd_txtnoe'),font:'fnt_tinynoelle',hspace:6,yoff:7},
 30:big('snd_txtsus',36),31:big('snd_txtral',36),32:big('snd_txtlan',36),33:big('snd_dadtxt',36),35:big('snd_txtjok',36),36:big(null,36),
 37:{...big('snd_txtsus',36,3),hspace:18},40:main(null,2),41:main(null,3),42:big(null,36,2),
 45:big('snd_txtral',28),46:big('snd_txtlan',28),47:big('snd_txtsus',28),48:big('snd_dadtxt',28),
 50:dotum('snd_text'),51:big('snd_text',36,10),52:big('snd_text',36,4),53:dotum('snd_txtsus'),54:dotum('snd_txtsus',2),55:main('snd_txtrud'),
 72:dotum('snd_txtspam2'),
 60:main(null,8),666:{...main(null,4,2),hspace:12,vspace:20},667:{...main(null,2,2),hspace:12,vspace:20},999:main('snd_txtecho',4,3),
};
/** scr_texttype: apply the current global.typer (unknown typers keep the writer's settings). */
function textType1(s:GmInstance,rt:GmRuntime){
 s.textscale=1;const t=TYPERS[rt.globals.typer];if(!t)return;
 s.myfont=t.font;s.mycolor=t.color;s.writingx=s.x;s.writingy=s.y+(t.yoff??0);s.charline=33;s.shake=0;s.rate=t.rate;s.textsound=t.sound;
 s.hspace=t.hspace;s.vspace=t.vspace;s.special=t.special;s.colorchange=1;s.xcolor=t.color;
}
const at=(str:string,n:number)=>n>=1&&n<=str.length?str[n-1]:'';
const button1Pressed=(rt:GmRuntime)=>rt.input.pressed.has(KEY.z)||rt.input.pressed.has(KEY.enter);
const button2Held=(rt:GmRuntime)=>rt.input.held.has(KEY.x)||rt.input.held.has(KEY.shift);
const SILENT=new Set([' ','^','!','.','?',',',':','/','\\','|','*']);

/** scr_textsound: the voice blip for the character being revealed, unless it is punctuation or X is held. */
function textSound(s:GmInstance,rt:GmRuntime){
 let play=button2Held(rt)?0:1;if(s.skippable===0)play=1;if(play!==1)return;
 let ch=s.rate<=2?at(s.mystring,s.pos):at(s.mystring,s.pos-1);
 if(ch==='&'){if(s.rate<3)ch=at(s.mystring,s.pos+1);else return;}
 if(SILENT.has(ch))return;
 if(s.textsound)rt.sound?.(s.textsound);
 for(const f of rt.all(faceParent))f.mouthmove=1;
}
function nextMessage(s:GmInstance,rt:GmRuntime){
 s.msgno+=1;s.lineno=0;s.aster=0;s.halt=0;s.pos=1;s.alarm[0]=1;s.autoaster=1;s.mystring=s.nstring[s.msgno]??'';s.formatted=0;s.wxskip=0;s.sound_played=0;
 if(s.rate<3){s.firstnoise=0;s.alarm[2]=1;}
}
/** The formatting pass: face codes, word wrap at charline, "* " continuation indents, centring. */
function format(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;let str:string=s.mystring;
 let charpos=-1,remspace=-1,remchar=-1,stringmax=0,align='';s.aster=0;
 const asterSkip=(i:number)=>{if(s.aster===1&&s.autoaster===1){str=str.slice(0,i-1)+'||'+str.slice(i-1);}if(s.aster===2)s.aster=1;};
 for(let i=0;i<str.length+1;i++){
  let skip=0;const c=at(str,i);
  if((c==='/'||c==='%')&&charpos>-1)charpos-=1;
  if(c==='^'&&charpos>-1)charpos-=2;
  if(c==='\\'){
   if(charpos>-1)charpos-=3;
   const n1=at(str,i+1),n2=at(str,i+2);
   if(s.dialoguer===1){
    if(n1==='E'){const e='0123456789ABCDE'.indexOf(n2);if(e>=0)g.fe=e;}
    if(n1==='F'){const f=FACE_CODES[n2];if(f!==undefined)g.fc=f;
     if(g.fc===0){s.charline=s.originalcharline;s.writingx=s.x;}else{s.charline=26;s.writingx=s.x+58*s.f;}
    }
   }
   if(n1==='a')align=n2;
  }
  if(c==='&'){
   if(charpos>stringmax)stringmax=charpos;remspace=-1;charpos=0;skip=1;
   if(s.aster===1&&s.autoaster===1&&at(str,i+1)!=='*'){charpos=2;str=str.slice(0,i)+'||'+str.slice(i);i+=2;}
  }
  if(skip===0){
   if(c===' '){remspace=i;remchar=charpos;}
   if(c==='*')s.aster=1;
   if(charpos>=s.charline){
    if(remspace>2){
     str=str.slice(0,remspace-1)+'&'+str.slice(remspace);i=remspace+1;
     if(remchar>stringmax)stringmax=remchar;remspace=-1;charpos=1;asterSkip(i);
    }else{
     if(charpos>stringmax)stringmax=charpos;str=str.slice(0,i-1)+'&'+str.slice(i-1);charpos=1;remspace=-1;i+=1;asterSkip(i);
    }
   }else charpos+=1;
  }
 }
 if(charpos>stringmax)stringmax=charpos;
 s.stringmax=stringmax;s.linecount=(str.match(/&/g)??[]).length;
 s.mystring=str;s.length=str.length;s.formatted=1;
 if(align==='c')s.writingx=rt.view.x+320-stringmax*s.hspace/2;
}
/** \F codes: none, Susie, Ralsei, Noelle, Toriel, Lancer, Alphys, Asgore(a), Berdly, Rudy, Rurus, King. */
const FACE_CODES:Record<string,number>={'0':0,S:1,R:2,N:3,T:4,L:5,A:10,a:11,B:12,r:15,u:18,K:20};

const writer1:WriterPart={
 create:(s,rt)=>{
  const g=rt.globals;
  Object.assign(s,{skipme:0,textsound:'snd_text',charline:33,hspace:8,vspace:18,rate:1,mycolor:C.white,myfont:'fnt_main',shake:0,special:0,
   skippable:g.flag?.[6]===1?0:1,automash_timer:0,f:g.darkzone===1?2:1});
  s.originalcharline=s.charline;
  textType1(s,rt);
  Object.assign(s,{autoaster:1,pos:2,lineno:0,aster:0,halt:0,xcolor:C.black,wxskip:0,msgno:0,first_alarm:0,firstnoise:0,noiseskip:0,formatted:0,
   colorchange:0,fontchange:0,sound_played:0,writingx:s.x,writingy:s.y,dialoguer:0,smallface:505050,faced:0,facedever:0,facer:0,siner:0,specfade:1,
   specx:[0,6,12,18,24,30,36],specy:[0,6,12,18,24,30,36]});
  s.nstring=Array.from({length:100},(_,j)=>typeof g.msg?.[j]==='string'?g.msg[j]:'');s.mystring=s.nstring[0];s.length=s.mystring.length;
  s.alarm[0]=s.rate;if(s.rate<3)s.alarm[2]=1;else textSound(s,rt);
 },
 alarm0:(s,rt)=>{
  if(s.rate>2)s.alarm[1]=1;else if(s.first_alarm===1&&s.pos>=2)textSound(s,rt);
  if(s.pos<=s.length)s.alarm[0]=s.rate;
  if(s.first_alarm===0){s.pos+=at(s.mystring,1)==='\\'?3:1;s.first_alarm=1;return;}
  let c=at(s.mystring,s.pos),n=at(s.mystring,s.pos+1);
  if(c==='&')s.pos+=1;
  if(c==='\\')s.pos+=3;
  if(c==='/'){s.halt=n==='%'?2:1;s.alarm[0]=-1;}
  c=at(s.mystring,s.pos);n=at(s.mystring,s.pos+1);
  if(c==='|')s.pos+=2;
  if(c==='^'){s.pos+=2;if(s.alarm[0]>0){const d=[0,5,10,15,20,30,40,60,90,150][Number(n)]??0;s.alarm[0]+=d;}}
  s.pos+=1;
 },
 alarm1:(s,rt)=>{if(s.pos<s.length+2)textSound(s,rt);},
 alarm2:(s,rt)=>{if(s.firstnoise===0){s.firstnoise=1;textSound(s,rt);}},
 draw:(s,rt)=>drawWriter(s,rt),
 textType:textType1,
};

function drawWriter(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;
 const button1=button1Pressed(rt)?1:0,button2=button2Held(rt)?1:0;
 if(s.dialoguer===1&&s.formatted===0){if(g.fc===0){s.charline=s.originalcharline;s.writingx=s.x;}else{s.charline=26;s.writingx=s.x+58*s.f;}}
 if(s.formatted===0)format(s,rt);
 let wx=s.writingx,wy=s.writingy;s.colorchange=0;
 const d=rt.drawState;d.font=s.myfont;d.color=s.mycolor;d.halign=0;d.valign=0;
 if(s.halt===0&&button2===1&&s.pos<s.length&&s.skippable===1)s.skipme=1;
 if(s.skipme===1){s.pos=s.mystring.length+1;s.alarm[0]=-1;s.alarm[1]=-1;}
 // Random shake offsets: the right argument (y) is evaluated first, as in the reference VM.
 const shakeAt=()=>{const y=rt.random.random(s.shake),x=rt.random.random(s.shake);return [x,y];};
 for(let n=1;n<s.pos;n++){
  let accept=1;const ch=at(s.mystring,n);
  if(ch==='&'){accept=0;wx=s.writingx;if(s.wxskip===1)wx=s.writingx+58;wy+=s.vspace;}
  if(ch==='|'){accept=0;wx+=s.hspace;}
  if(ch==='^'){accept=0;n+=1;}
  if(ch==='/'){s.halt=at(s.mystring,n+1)==='%'?2:1;accept=0;}
  if(ch==='%'){
   accept=0;if(at(s.mystring,n-1)==='/')s.halt=2;
   if(at(s.mystring,n+1)==='%'){destroyWriter(s,rt);return;}
   else if(s.halt!==2){nextMessage(s,rt);return;}
  }
  if(ch==='\\'){
   const n1=at(s.mystring,n+1),n2=at(s.mystring,n+2);
   if(n1==='E'){const e='0123456789ABCDE'.indexOf(n2);if(e>=0)g.fe=e;}
   if(n1==='F'){const f=FACE_CODES[n2];if(f!==undefined)g.fc=f;}
   // \* draws a controller button icon; no Chapter 1 battle line uses it.
   if(n1==='T'){
    const t=SPEAKER_TYPERS[n2];if(t!==undefined){g.typer=t(g);textType1(s,rt);d.font=s.myfont;}
    // A voice change in the battle box also returns the line to the left edge (or past the portrait).
    if(s.dialoguer===1){if(g.fc===0){s.charline=s.originalcharline;wx=s.x;}else s.wxskip=1;}
   }
   if(n1==='s'){if(n2==='0')s.skippable=0;if(n2==='1')s.skippable=1;}
   if(n1==='c'){s.colorchange=1;const c=({R:C.red,B:0xff0000,Y:C.yellow,G:C.lime,W:C.white,X:C.black} as Record<string,number>)[n2];s.xcolor=n2==='0'?s.mycolor:c??s.xcolor;}
   if(n1==='M'&&/\d/.test(n2))g.flag[20]=Number(n2);
   accept=0;n+=2;
  }
  if(accept===1){
   if(s.colorchange===1)d.color=s.xcolor;
   if(s.special===0){const [x,y]=shakeAt();rt.drawText(wx+x,wy+y,ch,s.textscale,s.textscale,0);}
   if(s.special===1){
    if(d.color!==C.white&&d.color!==C.black){
     let [x,y]=shakeAt();rt.drawTextColor(wx+x+1,wy+y+1,ch,s.xcolor,s.xcolor,0.3);
     [x,y]=shakeAt();rt.drawTextColor(wx+x,wy+y,ch,C.white,s.xcolor,1);
    }else{
     let [x,y]=shakeAt();rt.drawTextColor(wx+x+1,wy+y+1,ch,0x404040,0x800000,1);
     [x,y]=shakeAt();rt.drawText(wx+x,wy+y,ch);
    }
   }
   if(s.special===2){
    d.alpha=s.specfade;rt.drawText(wx,wy,ch);
    d.alpha=(0.3+Math.sin(s.siner/14)*0.1)*s.specfade;for(const [ox,oy] of [[1,0],[-1,0],[0,1],[0,-1]])rt.drawText(wx+ox,wy+oy,ch);
    d.alpha=(0.08+Math.sin(s.siner/14)*0.04)*s.specfade;for(const [ox,oy] of [[1,1],[-1,-1],[-1,1],[1,-1]])rt.drawText(wx+ox,wy+oy,ch);
    d.alpha=1;
   }
   wx+=s.hspace;
   // Comic Sans (font 11) letters get width corrections.
   if(s.myfont==='fnt_comicsans'){const adj:Record<string,number>={w:2,m:3,i:-2,l:-2,s:-1,j:-1};if(adj[ch])wx+=adj[ch];}
  }
 }
 if(s.halt!==0&&button1===1&&s.siner>0){
  if(s.halt===1)nextMessage(s,rt);
  else if(s.halt===2){destroyWriter(s,rt);return;}
 }
 s.skipme=0;s.siner+=1;
}
function destroyWriter(s:GmInstance,rt:GmRuntime){
 if(s.facer===1)for(const f of rt.all(face))rt.destroy(f);
 rt.destroy(s);
}
/** \T codes: the speaker's typer in battle (global.fighting). */
const SPEAKER_TYPERS:Record<string,(g:Record<string,any>)=>number>={
 '0':g=>g.darkzone===1?(g.fighting===1?4:6):5,'1':()=>2,B:()=>13,
 S:g=>g.darkzone===1?(g.fighting===1?47:30):10,R:g=>g.flag?.[30]===1?6:g.fighting===1?45:31,L:g=>g.fighting===1?46:32,
 X:()=>40,r:()=>55,T:()=>7,J:()=>35,A:()=>18,a:()=>20,N:()=>12,n:()=>23,
 K:g=>g.fighting===1?48:(g.plot??0)<235?36:33,
};

/** Each chapter owns its writer execution, selected once at the shared event boundary. */
const WRITER:Readonly<Record<number,WriterPart>>={1:writer1,2:writer2};
export function textType(s:GmInstance,rt:GmRuntime){forChapter(rt,WRITER,'writer').textType(s,rt);}
export const writer:GmObjectDef={name:'obj_writer',index:10,events:{
 create:(s,rt)=>forChapter(rt,WRITER,'writer').create(s,rt),
 alarm0:(s,rt)=>forChapter(rt,WRITER,'writer').alarm0(s,rt),
 alarm1:(s,rt)=>forChapter(rt,WRITER,'writer').alarm1(s,rt),
 alarm2:(s,rt)=>forChapter(rt,WRITER,'writer').alarm2(s,rt),
 draw:(s,rt)=>forChapter(rt,WRITER,'writer').draw(s,rt),
}};

/** Susie's portrait has one sprite per emotion (the two frames are her mouth). */
const SUSIE_FACES=['','spr_face_s1','spr_face_s2','spr_face_s3','spr_face_s4','spr_face_s5','spr_face_s6','spr_face_s7','spr_face_s8','spr_face_s9','spr_face_sA','spr_face_sB','spr_face_sC','spr_face_sD'];
export const faceParent:GmObjectDef={name:'obj_face_parent',index:6,depth:10};
/** Speaker portraits beside the battle text; Susie's mouth moves with her voice blips. */
export const face:GmObjectDef={name:'obj_face',index:7,parent:faceParent,events:{
 create:(s,rt)=>{Object.assign(s,{mouthmove:0,mouthtimer:0,face_index:0,imageSpeed:0,nowface:rt.globals.fc,facechange:2,rate:1,buffer:4,f:rt.globals.darkzone===1?2:1});},
 step:s=>{
  s.buffer-=1;if(s.buffer<0&&s.mouthmove===1&&s.mouthtimer===0){s.mouthtimer=1;s.face_index=1;}
  if(s.mouthtimer>0)s.mouthtimer+=s.rate;
  s.face_index=s.mouthtimer>=1&&s.mouthtimer<=5?1:0;
  if(s.mouthtimer>=9){s.mouthtimer=0;s.mouthmove=0;}
 },
 draw:(s,rt)=>{
  const g=rt.globals;s.facechange-=1;if(s.nowface!==g.fc)s.facechange=3;
  if(s.facechange<=0){
   const fe=g.fe,f=s.f;
   if(g.fc===1&&(g.flag?.[29]??0)===0&&SUSIE_FACES[fe])rt.drawSprite(SUSIE_FACES[fe],s.face_index,s.x-5,s.y,f,f,0,C.white,1);
   const indexed:Record<number,[string,number,number]>={2:[g.flag?.[30]===1?'spr_face_r_hood':g.flag?.[30]===2?'spr_face_r_nohat':'spr_face_r_dark',-15,-10],
    3:['spr_face_n_matome',-12,-10],5:['spr_face_l0',-15,-10],15:['spr_face_rudy',-12,-10],18:['spr_face_rurus',-10,0],20:['spr_face_king',-5,-5]};
   const e=indexed[g.fc];if(e)rt.drawSprite(e[0],fe,s.x+e[1],s.y+e[2],f,f,0,C.white,1);
  }
  s.nowface=g.fc;
 },
}};

/** An enemy speech balloon (scr_enemyblcon): a fixed balloon sprite with a writer inside; gone with its writer. */
export const battleBalloon:GmObjectDef={name:'obj_battleblcon',index:309,sprite:'spr_battleblcon',events:{
 create:(s,rt)=>{const w=rt.create(writer,s.x+5,s.y+5);s.mywriter=w.id;w.depth=s.depth-5;},
 step:(s,rt)=>{if(!rt.byId(s.mywriter))rt.destroy(s);},
}};
const BALLOONS:Record<number,[string,number]|null>={0:null,1:['spr_battleblcon',0],2:['spr_battleblcon_v',0],3:['spr_battleblcon_long',0],
 4:['spr_battleblcon_clubs',0],5:['spr_battleblcon_clubs',1],6:['spr_battleblcon_clubs',2],7:['spr_battleblcon_long_r',2],8:['spr_battleblcon_long_tall',0]};
/** The scr_enemyblcon kind a balloon was made with, from its sprite and frame. */
export function balloonKind(sprite:string,frame:number){const k=Object.entries(BALLOONS).find(([,b])=>b&&b[0]===sprite&&b[1]===frame);return k?Number(k[0]):-1;}
/** scr_enemyblcon(x, y, kind): kind 0 is a bare writer, the others a balloon of that shape. */
export function enemyBalloon(rt:GmRuntime,x:number,y:number,kind:number):GmInstance{
 const b=BALLOONS[kind];if(b===null)return rt.create(writer,x,y);
 const bl=rt.create(battleBalloon,x,y);if(b){bl.sprite=b[0];bl.imageIndex=b[1];bl.imageSpeed=0;}return bl;
}
/** with (obj_writer) instance_destroy(). */
export function destroyWriters(rt:GmRuntime){for(const w of rt.all(writer))rt.destroy(w);}
/** scr_battletext: the battle box writer at (30, 376) with its portrait at (26, 380). The script works in its caller's
 * variables (the view corner, the writer and the face it makes), so the caller is required. */
export function battleText(rt:GmRuntime,caller:GmInstance):GmInstance{
 caller.xx=rt.view.x;caller.yy=rt.view.y;
 const w=rt.create(writer,caller.xx+30,caller.yy+376);caller.battlewriter=w.id;
 caller.myface=rt.create(face,caller.xx+26,caller.yy+380).id;
 w.dialoguer=1;w.facer=1;if(rt.globals.fc===0&&w.originalcharline===33)w.charline=26;
 return w;
}
/** scr_battletext_default: the plain battle voice and no portrait. */
export function battleTextDefault(rt:GmRuntime,caller:GmInstance):GmInstance{rt.globals.fc=0;rt.globals.typer=4;return battleText(rt,caller);}
/** scr_susface, scr_ralface, scr_lanface, scr_noface: a page that switches the battle text's portrait (and emotion). */
const FACE_SCRIPTS={susie:'scr_susface_slash_scr_susface_gml_1_0',ralsei:'scr_ralface_slash_scr_ralface_gml_1_0',lancer:'scr_lanface_slash_scr_lanface_gml_1_0'} as const;
export function msgFace(rt:GmRuntime,slot:number,who:keyof typeof FACE_SCRIPTS|'none',emotion:number|string=0){
 rt.globals.msg[slot]=who==='none'?optionalSourceText('scr_noface_slash_scr_noface_gml_1_0'):optionalSourceText(FACE_SCRIPTS[who]).split('~1').join(String(emotion));
}
