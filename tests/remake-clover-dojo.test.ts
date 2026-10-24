import {describe,it,expect} from 'vitest';
import {GmRuntime,resolveEvent,type GmObjectDef} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
import {setSourceText} from '../src/remake/host/text';
import {createCloverDojo,setupCloverDojoMonster,CLOVER_DOJO_ENCOUNTERS} from '../src/remake/bosses/clover-dojo';
import {writer,face} from '../src/remake/deltarune/writer';
import {dmgWriter,spareAnim} from '../src/remake/deltarune/battle';
import {GmRandom} from '../src/remake/gm/random';
const fixture=(room='room_battletest')=>{
 const rt=new GmRuntime(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]}),{seed:11});
 const defs=new Map<string,GmObjectDef>();let index=5000;
 const object=(name:string)=>{let d=defs.get(name);if(!d){d={name,index:index++};defs.set(name,d);}return d;};
 const port=createCloverDojo(object,room);for(const d of port.objects)defs.set(d.name,d);
 object('obj_writer').events={create:s=>{s.originalcharline=33;}};rt.installObjectAliases([[writer,object('obj_writer')],[face,object('obj_face')],[dmgWriter,object('obj_dmgwriter')]]);
 Object.assign(rt.globals,{chapter:2,monster:[1,0,0],monsterhp:[1500,0,0],monstermaxhp:[1500,0,0],monsterat:[11,0,0],monsterstatus:[0,0,0],monstercomment:[' ',' ',' '],mercymod:[0,0,0],mercymax:[100,100,100],monstertype:[47,0,0],mnfight:0,myfight:0,typer:6,fc:0,msg:[],battlemsg:[],choicemsg:[],writerimg:[],flag:[],turntimer:240});
 const text:Record<string,string>={};for(const event of ['Create','Step','Draw'])for(let n=0;n<500;n++)for(const suffix of ['0','0_b']){const k=`obj_clubsenemy_slash_${event}_0_gml_${n}_${suffix}`;text[k]=k;}for(let n=1400;n<1520;n++){const k=`scr_monstersetup_slash_scr_monstersetup_gml_${n}_0`;text[k]=k;}text.scr_monstersetup_slash_scr_monstersetup_gml_1499_0_b='r-action';setSourceText(text);
 const s=rt.create(object('obj_clubsenemy'),400,80);s.myself=0;
 return {rt,s,object,port,step:()=>resolveEvent(s.object,'step')!(s,rt)};
};
describe('Chapter 2 Clover Dojo source events',()=>{
 it('creates the native spare star array lazily and preserves the source loop counter',()=>{
  const {rt}=fixture(),s=rt.create(spareAnim,400,80),draw=()=>resolveEvent(spareAnim,'draw')!(s,rt);expect('star' in s).toBe(false);draw();expect('star' in s).toBe(false);draw();expect(s.star).toHaveLength(2);expect(s.i).toBe(2);s.t=9;draw();expect(s.i).toBe(2);
 });
 it('creates the source room props, owns both markers and moves the discoball out for enemy turns',()=>{
  const {rt,object}=fixture('room_dw_castle_dojo'),fx=rt.create(object('obj_dojofx'),320,0),ball=rt.byId(fx.ball)!,back=rt.byId(fx.ballback)!;
  expect([fx.depth,ball.x,ball.y,ball.depth,ball.imageSpeed,back.sprite]).toEqual([1100000,320,0,5000,Math.fround(.18),'spr_dojo_discoball_back']);expect(rt.first(object('obj_dojofx_front'))?.depth).toBe(202);
  rt.globals.fighting=1;rt.globals.mnfight=2;resolveEvent(fx.object,'draw')!(fx,rt);expect([ball.vspeed,back.depth,fx.siner,fx.bsiner,fx.i]).toEqual([-1,6000,1,1,12]);
  ball.y=-210;resolveEvent(fx.object,'draw')!(fx,rt);expect(ball.vspeed).toBe(0);rt.globals.mnfight=0;resolveEvent(fx.object,'draw')!(fx,rt);expect(ball.y).toBe(-105);
 });
 it('anchors spotlights to source hero/enemy sprite bounds, including Susie and Ralsei offsets',()=>{
  const {rt,s,object}=fixture('room_dw_castle_dojo');rt.globals.fighting=1;rt.globals.char=[1,2,3];rt.globals.encounterno=71;
  const heroes=[0,1,2].map(i=>{const h=rt.create(object('test-hero'),94-i*7,50+i*72);h.idlesprite='test-idle';return h;});rt.globals.charinstance=heroes.map(h=>h.id);rt.globals.monsterinstance=[s.id,0,0];
  const f=rt.create(object('obj_dojofx_front'),0,0),calls:number[][]=[];rt.drawSpritePos=(_name,_frame,...positions)=>{calls.push(positions.map(v=>v??1));};resolveEvent(f.object,'draw')!(f,rt);
  expect(f.myx.slice(0,3)).toEqual([114,122,115]);expect(f.myy.slice(0,3)).toEqual([50,122,194]);expect(f.exists).toEqual([1,1,1,1,0,0]);expect(calls).toHaveLength(4);expect(calls[0]).toEqual([114,-230,114,-230,76,48,154,48,.25]);
 });
 it('draws the source timer around the dojo discoball while a Topic is running',()=>{
  const {rt,s,object}=fixture('room_dw_castle_dojo'),fx=rt.create(object('obj_dojofx'),0,0),ball=rt.create(object('test-ball'),320,0);fx.ball=ball.id;
  Object.assign(s,{actcon:15,topic_con:3,topic_timer:60,topic_timer_total:90});const draws:string[]=[];rt.drawSprite=(name)=>{draws.push(name??'');};const labels:string[]=[];rt.drawText=(_x,_y,line)=>{labels.push(line);};
  resolveEvent(s.object,'draw')!(s,rt);expect(s.progress).toBe(240);expect([s.cx,s.cy]).toEqual([320,65]);expect(labels[0]).toContain('_98_002');expect(draws).toContain('spr_clubs_clock_smallhand');expect(draws).toContain('spr_clubs_clock_bighand');expect(s.clockalpha).toBe(.05);
 });
 it('consumes the native list shuffle draws before choosing the correct answer',()=>{const {rt,s,step}=fixture(),expected=GmRandom.restore(rt.random.snapshot());for(let i=1;i<14;i++)expected.next();for(let i=1;i<17;i++)expected.next();const right=Math.floor(expected.random(3));rt.globals.myfight=3;s.acting=2;step();expect(s.right_answer).toBe(right);expect(rt.random.snapshot()).toEqual(expected.snapshot());});
 it('awards a turn-scaled successful answer and caps its mercy gain at 50',()=>{for(const turns of [0,3,10]){const {rt,s,step}=fixture();Object.assign(rt.globals,{myfight:3,choice:1,monsterx:[450],monstery:[170],hittarget:[0]});Object.assign(s,{topic_con:4,right_answer:1,actcon:15,turns});step();expect(rt.globals.mercymod[0]).toBe(Math.min(50,20+turns*5));expect(rt.globals.msg[0]).toContain('_293_0');}});
 it('does not award mercy for a wrong answer',()=>{const {rt,s,step}=fixture();Object.assign(rt.globals,{myfight:3,choice:0});Object.assign(s,{topic_con:4,right_answer:1,actcon:15});step();expect(rt.globals.mercymod[0]).toBe(0);expect(rt.globals.msg[0]).toContain('_296_0_b');});
 it('spawns native side clubs without leaking local xx and yy fields to the controller',()=>{const {rt,object,port}=fixture(),c=rt.create(object('obj_dbulletcontroller'),400,80);Object.assign(c,{type:30,btimer:14,ratio:.7,side:1,miny:100,maxy:200,damage:55,target:2});expect(port.pattern(c,rt)).toBe(true);const b=rt.first(object('obj_clubsbullet'))!;expect([b.x,b.direction,b.speed,b.damage,b.target,b.grazepoints]).toEqual([660,180,12,55,2,4]);expect('xx' in c).toBe(false);expect(c.btimer).toBe(0);});
 it('alternates the two native dark-club corners and aims their incoming sprite',()=>{const {rt,object,port}=fixture();rt.create(object('obj_heart'),300,170);const c=rt.create(object('obj_dbulletcontroller'),400,80);Object.assign(c,{type:31,btimer:21,ratio:.7,side:1,damage:55,target:2});port.pattern(c,rt);const b=rt.first(object('obj_clubsbullet_dark'))!;expect([c.side,c.dir,b.direction,b.imageAngle,b.speed,b.friction,b.grazepoints]).toEqual([-1,315,135,135,20,1,4]);c.btimer=21;port.pattern(c,rt);expect([c.side,c.dir]).toEqual([1,225]);});
 it('uses direct native phase checks without creating scr_isphase caller fields',()=>{const {s,step}=fixture();step();expect('__isphase' in s).toBe(false);});
 it('uses the rematch stats, ACT tables and native positions',()=>{const {rt,s}=fixture();for(const k of ['monstername','monsterdf','monsterexp','monstergold','sparepoint','canact','actname','actsimul','actdesc','actactor','canactsus','actnamesus','actsimulsus','canactral','actnameral','actsimulral'])rt.globals[k]=[[]];expect(setupCloverDojoMonster(s,rt)).toBe(true);expect([rt.globals.monsterhp[0],rt.globals.monsterat[0],rt.globals.actactor[0][2]]).toEqual([1500,11,4]);expect(CLOVER_DOJO_ENCOUNTERS[71].monsters[0]).toEqual(['obj_clubsenemy',47,400,80]);});
 it('owns shuffled topic lists and releases them on destroy',()=>{const {rt,s}=fixture();expect(rt.ds('list',s.likes_list)).toHaveLength(14);expect(rt.ds('list',s.dislikes_list)).toHaveLength(17);rt.destroy(s);expect(()=>rt.ds('list',s.likes_list)).toThrow(/does not exist/);});
 it('starts Topic with a 90 frame choice clock and consumes both list shuffles before the answer roll',()=>{const {rt,s,step}=fixture();const before=rt.random.snapshot();rt.globals.myfight=3;s.acting=2;step();expect([s.topic_con,s.topic_count,s.topic_timer,s.topic_timer_total,s.actcon]).toEqual([2,1,90,90,15]);expect(rt.globals.choicemsg).toHaveLength(3);expect(rt.globals.choicemsg[s.right_answer]).toContain('Create_0_gml_');expect(rt.random.snapshot()).not.toEqual(before);});
 it('lets Topic(Long) start on its source frame, then shuffles on the next frame',()=>{const {rt,s,step}=fixture();rt.globals.myfight=3;s.acting=3;step();expect([s.topic_con,s.topic_timer,s.topic_count]).toEqual([1,300,0]);step();expect([s.topic_con,s.topic_timer,s.topic_count]).toEqual([2,300,1]);});
 it('times out by destroying both the topic writer and choice object',()=>{const {rt,s,object,step}=fixture();rt.globals.myfight=3;s.topic_con=3;s.topic_timer=1;s.actcon=15;const w=rt.create(object('obj_writer'),0,0),c=rt.create(object('obj_choicer_neo'),0,0);step();expect([w.live,c.live,s.topic_con,s.topic_timeup,s.actcon]).toEqual([false,false,0,false,1]);expect(rt.globals.msg[0]).toContain('_286_0');expect(rt.globals.writerimg[1]).toBe('spr_miniface_clover_happy');});
 it('runs the tail intro, sends the tail away and restores the body',()=>{const {rt,s,object}=fixture();const i=rt.create(object('obj_clovertail_intro'),544,205);i.damage=55;i.target=2;expect([i.x,i.y,s.notail]).toEqual([570,181,1]);for(let n=0;n<10;n++)resolveEvent(i.object,'step')!(i,rt);const tail=rt.first(object('obj_clovertail'))!;expect([tail.damage,tail.target,i.con]).toEqual([55,2,1]);tail.con=1;rt.globals.turntimer=5;resolveEvent(i.object,'step')!(i,rt);expect(tail.con).toBe(2);rt.globals.turntimer=0;for(let n=0;n<10;n++)resolveEvent(i.object,'step')!(i,rt);expect([i.live,s.notail]).toEqual([false,0]);});
});
