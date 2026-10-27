import fs from 'node:fs';
import {executeNeoSource} from '../src/remake/bosses/spamton-neo/body-source';
import {GmRandom} from '../src/remake/gm/random';
import {describe,it,expect} from 'vitest';
import {GmRuntime} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
import {writer,textType,face,enemyBalloon} from '../src/remake/deltarune/writer';
import {gameOverInit,deviceFailure,deviceChoice,endBattle,RETRY_ROOM,GAME_END_ROOM} from '../src/remake/deltarune/battle-end';
import {choicerNeo} from '../src/remake/deltarune/choicer';
import {heroBlcon} from '../src/remake/deltarune/chapter2-enemy';
import {enemyBlcon2} from '../src/remake/deltarune/chapter2-objects';
import {KEY} from '../src/remake/deltarune/keys';
import {setSourceText} from '../src/remake/host/text';
const sourceAvailable=fs.existsSync('extracted/chapter4_windows/code/gml_GlobalScript_scr_texttype.gml');
const bank=spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]});
function scene(message='Test/%',typer=86){
 const rt=new GmRuntime(bank,{seed:3});rt.globals={chapter:4,lang:'en',msg:Array.from({length:100},(_,i)=>i===0?message:''),typer,fc:0,fe:0,darkzone:1,fighting:1,flag:new Array(1700).fill(0),tempflag:new Array(100).fill(0),char:[2,0,0],currentsong:[],heartx:300,hearty:200};return rt;
}
describe('Chapter 4 writer and ending strategies',()=>{
 it.skipIf(!sourceAvailable).each([4,17,47,50,60,61,75,79,80,81,82,83,84,85,86,87,88,667])('matches extracted texttype %s',typer=>{
  const rt=scene('Test/%',typer),w=rt.create(writer,30,376);textType(w,rt);
  const source=fs.readFileSync('extracted/chapter4_windows/code/gml_GlobalScript_scr_texttype.gml','utf8');
  const other=scene('Test/%',typer),o=other.create({name:'voice_test',index:10000},30,376);
  executeNeoSource(source,o,other,{object:n=>({name:n,index:10001}),text:k=>k,call:(name,self,_rt,args)=>{
   if(name==='scr_84_get_font')return 'fnt_'+args[0];
   if(name==='scr_textsetup'){const keys=['myfont','mycolor','writingx','writingy','charline','shake','rate','textsound','hspace','vspace','special'];keys.forEach((k,i)=>{self[k]=args[i];});self.colorchange=1;self.xcolor=self.mycolor;return;}
   throw Error(name);
  }},undefined,undefined,[],'scr_texttype');
  for(const k of ['myfont','mycolor','writingx','writingy','charline','shake','rate','textsound','hspace','vspace','special'])expect(w[k],k).toEqual(o[k]);
 });
 it.skipIf(!sourceAvailable).each([1,29,49,89,139,149])('matches Chapter 4 soul-break source at frame %s',timer=>{
  const rt=scene(),s=rt.create(gameOverInit,320,224);s.timer=timer;rt.globals.screenshot='test';
  const other=scene(),o=other.create(gameOverInit,320,224);o.timer=timer;other.globals.screenshot='test';
  executeNeoSource(fs.readFileSync('extracted/chapter4_windows/code/gml_Object_obj_gameover_init_Step_0.gml','utf8').split('enum UnknownEnum')[0].replace('room_goto(PLACE_FAILURE)','room_goto("PLACE_FAILURE")'),o,other,{object:n=>n==='obj_marker'?{name:n,index:700}:n==='obj_fadeout'?{name:n,index:701}:{name:n,index:702},text:k=>k,call:(name,_s,_rt,args)=>{if(name==='snd_free_all'||name==='snd_play')return;if(name==='room_goto'){other.pendingRoom=args[0];return;}throw Error(name);}});
  rt.step();for(const k of ['timer','timerb','Z_COUNT','x','y','visible','sprite'])expect(k==='visible'?Number(s[k]):s[k],k).toEqual(k==='visible'?Number(o[k]):o[k]);expect(rt.pendingRoom).toBe(other.pendingRoom);expect(rt.random.snapshot()).toEqual(other.random.snapshot());
 });
 it('creates the Chapter 4 battle choice state with local controls',()=>{
  const rt=scene();rt.create({name:'obj_battlecontroller',index:10000},0,0);const c=rt.create(choicerNeo,0,0);expect([c.heartSprite,c.choicerstyle]).toEqual(['spr_heartsmall',0]);expect('controlled' in c).toBe(false);c.canchoose=1;rt.globals.choicemsg=['One','Two','Three','Four'];rt.input.held.add(KEY.right);rt.step();expect(c.mychoice).toBe(1);rt.input.held.clear();rt.input.pressed.add(KEY.enter);rt.step();expect(rt.globals.choice).toBe(1);
 });
 it('places a source Susie hero balloon on the right and follows writer lifetime',()=>{
  const rt=scene(),hero=rt.create({name:'obj_herosusie',index:10000},108,149),caller=rt.create({name:'test',index:10001},0,0),b=heroBlcon(caller,rt,'susie');expect(b).toBeTruthy();if(!b)return;expect([b.x,b.y,b.side]).toEqual([208,189,-1]);const w=rt.byId(b.mywriter)!;rt.draw();rt.destroy(w);rt.step();expect(b.live).toBe(false);rt.destroy(hero);expect(heroBlcon(caller,rt,'susie')).toBe(false);
 });
 it('plays Hammer voice with source random draw order and cooldown',()=>{
  const rt=scene('AB'),w=rt.create(writer,0,0),sounds:any[]=[];rt.sound=(name,pitch)=>sounds.push([name,pitch]);
  const rng=GmRandom.restore(rt.random.snapshot()),pitch=rng.choose(1,1,1-rng.random(.2));rng.choose(82);
  w.firstnoise=0;w.alarm[0]=-1;w.alarm[2]=1;rt.step();expect(sounds).toEqual([['snd_txger',pitch]]);expect(w.sound_timer).toBe(3);expect(rt.random.snapshot()).toEqual(rng.snapshot());
 });

 it.each([[86,'fnt_dotumche','snd_txger',9,20,0],[75,'fnt_dotumche','snd_txtsus',9,20,0],[61,'fnt_main','snd_txtsus',12,20,0],[79,'fnt_mainbig','snd_txtsus',18,36,1],[80,'fnt_main','snd_nosound',8,18,0],[81,'fnt_dotumche','snd_nosound',9,20,0],[84,'fnt_mainbig','snd_tv_voice_short',16,36,1]])('sets original voice %s',(typer,font,sound,hspace,vspace,special)=>{
  const rt=scene('Test/%',Number(typer)),w=rt.create(writer,30,376);expect([w.myfont,w.textsound,w.hspace,w.vspace,w.special]).toEqual([font,sound,hspace,vspace,special]);
 });
 it('initializes Chapter 4 input guards and supports disable/forced confirm',()=>{
  const rt=scene(),w=rt.create(writer,0,0);expect([w.runcheck,w.disablebutton1,w.preventcskip,w.hangonpos,w.reachedend_sound]).toEqual([false,false,false,false,305]);
  w.formatted=1;w.halt=2;w.pos=2;w.siner=5;w.disablebutton1=true;rt.input.pressed.add(KEY.enter);rt.draw();expect(w.live).toBe(true);w.forcebutton1=1;rt.draw();expect(w.live).toBe(false);
 });
 it('keeps runcheck until X is released and then reveals on X',()=>{
  const rt=scene(),w=rt.create(writer,0,0);w.runcheck=true;rt.input.held.add(KEY.x);rt.draw();expect(w.pos).toBe(2);rt.input.held.clear();rt.draw();expect(w.runcheck).toBe(false);rt.input.held.add(KEY.x);rt.draw();expect(w.reachedend).toBe(1);
 });
 it('clears the running guard on the Ctrl menu alias while X remains held',()=>{
  const rt=scene(),w=rt.create(writer,0,0);w.runcheck=true;rt.input.held.add(KEY.x);rt.input.held.add(KEY.ctrl);rt.draw();expect(w.runcheck).toBe(false);expect(w.reachedend).toBe(1);
 });
 it('switches Chapter 4 speaker codes without inheriting Tenna spacing',()=>{
  const rt=scene('\\TC\\FC\\E2Hello/%'),w=rt.create(writer,0,0);w.dialoguer=1;w.pos=w.length+1;rt.draw();expect([rt.globals.typer,rt.globals.fc,rt.globals.fe,w.vspace]).toEqual([87,22,2,18]);
 });
 it('draws Susie later portrait and Carol face without Tenna hand',()=>{
  const rt=scene();rt.globals.fc=1;const f=rt.create(face,26,380);f.facechange=0;rt.draw();expect(f.face).toBe('spr_face_susie_alt');rt.globals.fc=22;f.nowface=22;f.facechange=0;rt.draw();expect(f.face).toBe('spr_face_carol');
 });
 it('uses Chapter 4 Light World Berdly portraits',()=>{
  const rt=scene();rt.globals.fc=12;rt.globals.fe=4;rt.globals.darkzone=0;const f=rt.create(face,26,380);f.facechange=0;rt.draw();expect([f.face,f.face_index]).toEqual(['spr_face_berdly',4]);
 });
 it('draws source Ralsei blood and Toriel church/blush overlays',()=>{
  const rt=scene(),sprites:any[][]=[];rt.drawSprite=(...args)=>{sprites.push(args);};rt.globals.fc=2;rt.globals.fe=48;rt.globals.flag[1591]=1;const f=rt.create(face,26,380);f.facechange=0;rt.draw();expect(sprites.some(s=>s[0]==='spr_face_r_blood'&&s[1]===1)).toBe(true);
  sprites.length=0;rt.globals.fc=4;rt.globals.fe=0;rt.globals.plot=20;rt.globals.flag[778]=1;f.facechange=0;f.nowface=4;rt.draw();expect(sprites.some(s=>s[0]==='spr_face_tbody_church'&&s[2]===18)).toBe(true);expect(sprites.some(s=>s[0]==='spr_face_torielblush')).toBe(true);
 });
 it('creates source Chapter 4 balloon offsets and kind 10 auto sizing',()=>{
  const rt=scene('HELLO/%'),b=enemyBlcon2(rt.create({name:'test',index:10000},0,0),rt,400,80,10)!,w=rt.byId(b.mywriter)!;expect([w.x,w.y,w.depth,b.auto_length,b.side]).toEqual([405,83,9999999,1,1]);rt.draw();expect(w.formatted).toBe(1);expect(b.balloonwidth).toBe(w.stringmax*w.hspace+10);expect(w.writingx).toBe(405-b.balloonwidth-20);
 });
 it('preserves Chapter 4 tension before the source victory fade clears it',()=>{
  const rt=scene();rt.globals.tension=76;rt.globals.specialbattle=1;rt.create(endBattle,0,0);expect(rt.globals.flag[49]).toBe(76);expect(rt.globals.tension).toBe(0);
 });
 it('retains the normal broken soul and white four-confirm retry',()=>{
  const rt=scene();rt.globals.screenshot='test';const s=rt.create(gameOverInit,320,224);expect('knight_mode' in s).toBe(false);s.timer=79;for(let i=0;i<4;i++){rt.input.pressed.add(KEY.enter);rt.step();rt.draw();}expect(s.timer).toBe(-999);for(let i=0;i<38;i++)rt.step();expect(rt.pendingRoom).toBe(RETRY_ROOM);
 });
 it.skipIf(!sourceAvailable).each([0,1])('completes keyboard loss choice %s through the existing web room lifecycle',choice=>{
  const rt=scene();const files=['DEVICE_FAILURE_Step_0','DEVICE_CHOICE_Create_0'];
  const lines:Record<string,string>={};for(const file of files){const source=fs.readFileSync('extracted/chapter4_windows/code/gml_Object_'+file+'.gml','utf8');for(const m of source.matchAll(/"((?:\\.|[^"\\])*)", "([^"\\]+)"/g))lines[m[2]]=JSON.parse('"'+m[1]+'"');}setSourceText(lines);
  rt.create(deviceFailure,288,160);
  for(let frame=0;frame<400&&!rt.pendingRoom;frame++){
   const c=rt.first(deviceChoice);if(c){rt.input.pressed.add(choice===0?KEY.left:KEY.right);if(c.ONEBUFFER<0)rt.input.pressed.add(KEY.enter);}else if(frame%3===0)rt.input.pressed.add(KEY.enter);
   rt.step();rt.draw();
  }
  expect(rt.pendingRoom).toBe(choice===0?RETRY_ROOM:GAME_END_ROOM);if(choice===0)expect(rt.globals.tempflag[3]).toBe(1);setSourceText({});
 });
 it('shows original solo Susie loss prompts and keyboard continue/give-up choices',()=>{
  const rt=scene();setSourceText({'DEVICE_FAILURE_slash_Step_0_gml_39_0':'  Come on^1,&  that all you got!?/','DEVICE_FAILURE_slash_Step_0_gml_40_0':'  Kris^1,&  get up...!/%','DEVICE_CHOICE_slash_Create_0_gml_28_0':'CONTINUE','DEVICE_CHOICE_slash_Create_0_gml_29_0':'GIVE UP','DEVICE_FAILURE_slash_Step_0_gml_103_0_b':'CONTINUE','DEVICE_FAILURE_slash_Step_0_gml_104_0':'GIVE UP'});
  const s=rt.create(deviceFailure,288,160);s.EVENT=1;s.text_timer=0;rt.step();expect(rt.globals.typer).toBe(61);expect(rt.first(writer)?.nstring.slice(0,2)).toEqual(['  Come on^1,&  that all you got!?/','  Kris^1,&  get up...!/%']);for(const w of rt.all(writer))rt.destroy(w);s.EVENT=4;rt.step();const c=rt.first(deviceChoice)!;expect(c.NAME).toEqual([['CONTINUE'],['GIVE UP']]);expect('choice_y_offset' in c).toBe(false);for(let i=0;i<12;i++)rt.step();rt.input.pressed.add(KEY.left);rt.step();rt.input.pressed.add(KEY.enter);rt.step();expect(rt.globals.choice).toBe(0);setSourceText({});
 });
});
