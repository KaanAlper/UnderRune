// The Roaring Knight's rotating slash (bullet type 104): he leaps around the box, and at each stop a ring of red
// guide lines turns around the soul's position, then that many slashes cut through it at once. Later rounds add
// lines; on difficulty 2 he ends with a fast spinning flurry. Objects: obj_knight_rotating_slash (the Knight and the
// guides), obj_roaringknight_slash (one cut, drawn through the rotating slash's surface), obj_knight_circle (the red
// ring that marks a stop), obj_particle_generic (the cut marks and sparks) and obj_afterimage_screen.
// The combination attack's hand-overs (next_up 1 to 5, its quick slash, tunnel, sword fall and floor) are named errors.
import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {C} from '../../gm/graphics';
import {eq,lengthdirX,lengthdirY,lt} from '../../gm/math';
import {bulletInit,damage,damageAll,growtangle,heart} from '../../deltarune/battle';
import {approach,bulletInherit,darkSize,destroyScript,getBox,heartClamp,lerpvarScript,makeColorRgb,scrAfterimage} from '../../deltarune/chapter3-scripts';
import {scriptDelayedOn,setVar} from '../../deltarune/chapter2-battle';
import {scrLerpvar} from '../../deltarune/shared-effects';
import {snd} from '../../deltarune/sound';
import type {Chapter2BulletRunner} from '../../deltarune/chapter2-bullets';

type Objects=(name:string)=>GmObjectDef;
/** The turn's length by turn type (and the first timer value, for the shorter ones). */
const TURNS:Readonly<Record<string,readonly [turntimer:number,timer?:number,limit4?:number]>>={
 full:[400],start:[320],end:[300,15],'short start':[270,12,250],'short mid':[260,15,250],'short end':[260,15]};

export function createRotatingSlash(object:Objects){
 const knight=(rt:GmRuntime)=>{const k=rt.first(object('obj_knight_enemy'));if(!k)throw Error('The rotating slash needs the Knight');return k;};
 const soul=(rt:GmRuntime)=>{const h=rt.first(heart);if(!h)throw Error('The rotating slash needs obj_heart');return h;};
 const box=(rt:GmRuntime)=>{const b=rt.first(growtangle);if(!b)throw Error('The rotating slash needs obj_growtangle');return b;};

 /** obj_particle_generic: fades and shrinks at its rates, ends at zero, at its timer, at alarm 0, or out of view. */
 const particle:GmObjectDef={...object('obj_particle_generic'),events:{
  create:s=>{s.fade_rate=0;s.shrink_rate=0;s.timer=-1;},
  step:(s,rt)=>{
   s.imageAlpha=approach(s.imageAlpha,0,s.fade_rate);s.imageXscale=approach(s.imageXscale,0,s.shrink_rate);s.imageYscale=approach(s.imageYscale,0,s.shrink_rate);
   if(eq(s.imageXscale,0)||eq(s.imageYscale,0))rt.destroy(s);
   if(eq(s.imageAlpha,0))rt.destroy(s);
   s.timer--;if(s.timer===0)rt.destroy(s);
  },
  alarm0:(s,rt)=>rt.destroy(s),
  outsideView0:(s,rt)=>rt.destroy(s),
 }};

 /** obj_roaringknight_slash: a cut that thins out after its first frame; it hits for 75 on everyone. */
 const slash:GmObjectDef={...object('obj_roaringknight_slash'),events:{
  create:(s,rt)=>{
   bulletInit(s);
   Object.assign(s,{active:1,element:5,width:24,grazepoints:50,aoe:1});s.alarm[0]=1;s.alarm[1]=3;
   s.imageIndex=2;s.imageSpeed=0;s.imageYscale=0.1;s.slashdir=rt.random.choose(-1,1);s.destroyonhit=0;
  },
  alarm0:()=>{},
  alarm1:s=>{s.mask='spr_nomask';},
  endStep:(s,rt)=>{
   s.damage=206;s.grazepoints=50;
   // !alarm[0]: the alarm has run (it is -1 now).
   if(!(s.alarm[0]>0.5)){s.width*=0.66;s.imageAlpha*=0.66;}
   if(s.width<12)s.active=0;
   if(s.width<0.5)rt.destroy(s);
   if(s.width>4){
    for(const b of rt.all(growtangle)){b.x=b.xstart+rt.random.choose(-2,-1,0,1,2);b.y=b.ystart+rt.random.choose(-2,-1,0,1,2);}
    heartClamp(rt);
   }
  },
  draw:(s,rt)=>{
   const hx=lengthdirX(640,s.direction),hy=lengthdirY(640,s.direction),ox=lengthdirX(s.width,s.direction+90),oy=lengthdirY(s.width,s.direction+90);
   const color=makeColorRgb(255,(1-s.imageAlpha)*255,(1-s.imageAlpha)*255),d=rt.drawState;d.alpha=s.imageAlpha*2;
   if(s.slashdir)rt.drawTriangleColor(s.x-hx*s.imageAlpha,s.y-hy*s.imageAlpha,s.x+hx+ox,s.y+hy+oy,s.x+hx-ox,s.y+hy-oy,color,color,color);
   else rt.drawTriangleColor(s.x+hx*s.imageAlpha,s.y+hy*s.imageAlpha,s.x-hx+ox,s.y-hy+oy,s.x-hx-ox,s.y-hy-oy,color,color,color);
   d.alpha=1;
  },
  user5:(s,rt)=>{
   s.damage=206;
   if(s.aoe===1){s.damage=75;s.target=3;for(const k of rt.all(object('obj_knight_enemy')))k.aoedamage=1;}
   if(s.active===1){if(s.target!==3)damage(s,rt);if(s.target===3)damageAll(s,rt);if(s.destroyonhit===1)rt.destroy(s);}
   for(const k of rt.all(object('obj_knight_enemy')))k.aoedamage=0;
  },
 }};

 /** obj_knight_circle: a red ring that spreads from the aim point inside the box and fades in ten frames. */
 const circle:GmObjectDef={...object('obj_knight_circle'),events:{
  create:s=>{Object.assign(s,{circle_size:0,r:128,g:0,b:0,r_goal:0,g_goal:0,b_goal:0,fade_time:28,size_goal:960,growth:40,my_surface:-4,color_1:0,color_2:255,draw_in_box:1});},
  cleanup:(s,rt)=>{if(rt.sourceSurfaces?.exists(s.my_surface))rt.sourceSurfaces.free(s.my_surface);},
  step:(s,rt)=>{
   if(!rt.exists(object('obj_knight_roaring_fx')))s.imageAlpha-=0.1;
   if(lt(s.imageAlpha,0))rt.destroy(s);
   s.g=approach(s.g,s.g_goal,255/s.fade_time);s.b=approach(s.b,s.b_goal,255/s.fade_time);s.circle_size=approach(s.circle_size,s.size_goal,s.growth);
   if(eq(s.r,0)&&eq(s.b,0)&&eq(s.b,0))rt.destroy(s);
  },
  draw:(s,rt)=>{
   const surfaces=rt.sourceSurfaces!;
   if(s.draw_in_box){
    const b=box(rt);
    if(!surfaces.exists(s.my_surface))s.my_surface=surfaces.create(75*b.imageXscale,75*b.imageYscale);
    surfaces.target(s.my_surface);s.color_2=makeColorRgb(s.r,s.g,s.b);
    rt.drawCircleColor(s.x-getBox(rt,2),s.y-getBox(rt,1),s.circle_size,s.color_1,s.color_2);
    surfaces.target(null);rt.drawBlendMode('add');surfaces.draw(s.my_surface,getBox(rt,2),getBox(rt,1));rt.drawBlendMode('normal');
   }else{
    s.color_2=makeColorRgb(s.r,s.g,s.b);rt.drawBlendMode('add');rt.drawState.alpha=s.imageAlpha;
    rt.drawCircleColor(s.x,s.y,s.circle_size,s.color_1,s.color_2);rt.drawBlendMode('normal');
   }
  },
 }};

 /** obj_afterimage_screen: a growing, fading copy of the screen (drawn at the end of the frame when draw_end). */
 const screenCopy=(s:GmInstance,rt:GmRuntime)=>{
  const surfaces=rt.sourceSurfaces!;
  if(!surfaces.exists(s.my_surface))s.my_surface=surfaces.create(640,480);
  surfaces.copy(s.my_surface,0,0,null);
  surfaces.part(s.my_surface,0,0,640,480,s.x-s.anchor_x*s.xscale,s.y-s.anchor_y*s.yscale,s.xscale,s.yscale,C.white,s.alpha);
 };
 const afterimageScreen:GmObjectDef={...object('obj_afterimage_screen'),events:{
  create:(s,rt)=>{Object.assign(s,{my_surface:-4,xscale:1,yscale:1,alpha:0.5,anchor_x:s.x-rt.view.x,anchor_y:s.y-rt.view.y,xrate:0.01,yrate:0.01,faderate:0.00625,draw_end:0});},
  cleanup:(s,rt)=>{if(rt.sourceSurfaces?.exists(s.my_surface))rt.sourceSurfaces.free(s.my_surface);},
  step:(s,rt)=>{s.xscale+=s.xrate;s.yscale+=s.yrate;s.alpha=approach(s.alpha,0,s.faderate);if(eq(s.alpha,0))rt.destroy(s);},
  draw:(s,rt)=>{if(!s.draw_end)screenCopy(s,rt);},
  endDraw:(s,rt)=>{if(!s.draw_end)return;screenCopy(s,rt);for(const h of rt.all(heart))rt.drawSelf(h);},
 }};

 /** The cut marks (red, then black inside) and sparks along both directions of one slash. */
 const marks=(sl:GmInstance,rt:GmRuntime)=>{
  const mark=(depth:number,blend:number,xs:number,ys:number,time:number)=>{
   const p=rt.create(particle,sl.x,sl.y);p.depth+=depth;p.sprite='spr_knight_slash_mark';p.imageBlend=blend;p.imageAngle=sl.imageAngle;p.imageXscale=xs;p.imageYscale=ys;
   scrLerpvar(p,rt,'image_xscale',p.imageXscale,0,time);scrLerpvar(p,rt,'image_yscale',p.imageYscale,0,time);scriptDelayedOn(p,rt,destroyScript,time);
  };
  const markx=5+rt.random.random(3),marky=2+rt.random.random(1);
  mark(100,C.red,markx,marky,4);
  mark(99,C.black,marky*0.85,marky*0.85,4);
  for(const flip of [0,180]){
   for(let n=0,count=4+rt.random.irandom(3);n<count;n++){
    const time=12+rt.random.irandom(8),offset=-20+rt.random.random(60);
    const p=rt.create(particle,sl.x,sl.y);
    p.speed=6+rt.random.random(4);p.imageAngle=sl.imageAngle+flip+rt.random.randomRange(-10,10);p.direction=p.imageAngle;
    for(let k=0;k<50;k++){
     p.x+=lengthdirX(5,p.direction);p.y+=lengthdirY(5,p.direction);
     if(p.x<getBox(rt,2)||p.x>getBox(rt,0)||p.y<getBox(rt,1)||p.y>getBox(rt,3))break;
    }
    p.x+=lengthdirX(offset,p.direction);p.y+=lengthdirY(offset,p.direction);
    if(flip===0){p.depth+=101;p.sprite='spr_knight_slash_mark';p.imageBlend=C.red;}
    else{p.imageBlend=C.red;p.depth+=101;p.sprite='spr_knight_slash_mark';}
    p.imageXscale=0.3;p.imageYscale=0.15;
    scrLerpvar(p,rt,'image_xscale',p.imageXscale,0,time);scrLerpvar(p,rt,'image_yscale',p.imageYscale,0,time);scriptDelayedOn(p,rt,destroyScript,time);
   }
  }
 };
 const toBoxCorner=(s:GmInstance,rt:GmRuntime)=>{
  scrLerpvar(s,rt,'x',s.x,getBox(rt,0)-20+s.movebox_x,s.slash_base+s.slash_offset-8,1,'out');
  scrLerpvar(s,rt,'y',s.y,getBox(rt,1)-20+s.movebox_y,s.slash_base+s.slash_offset-8,1,'out');
 };
 const moveBox=(s:GmInstance,rt:GmRuntime)=>{
  s.movebox_x+=20+rt.random.irandom(40);s.movebox_y+=30+rt.random.irandom(60);
  return ()=>{if(s.movebox_x>80)s.movebox_x-=80;if(s.movebox_y>120)s.movebox_y-=120;};
 };
 const rotating:GmObjectDef={...object('obj_knight_rotating_slash'),events:{
  create:(s,rt)=>{
   bulletInit(s);darkSize(s);s.imageSpeed=0;
   Object.assign(s,{difficulty:2,slash_number:1,slashes_done:0,rotation:16,rotation_base:16,rotation_change:1,rotation_goal:2,timer:0,state:'intro',turn_type:'full',
    turn_segment:-1,next_up:-1,next_next_up:-1,local_turntimer:0,aim_direction:0});
   s.spin=rt.random.choose(-1,1);s.random_offset=rt.random.irandom(360);
   s.slash_array=[1,2,2,3,3,4];
   Object.assign(s,{slash_counter:0,final_counter:0,slash_base:18,slash_offset:6,speed_gain:16,cooldown_time:6,slash_timer:8,aim_type:0,anchor_x:s.x,anchor_y:s.y,aim_x:s.x,aim_y:s.y,
    r:0,g:0,b:0,line_width:4});
   s.slash_list=rt.dsCreate('list');
   Object.assign(s,{movebox_x:40,movebox_y:60,line2:-1,line3:-1,do_final:1,my_surface:-4,turn_limit_4:270,debug:0});
  },
  user0:s=>{
   if(s.difficulty===1){s.slash_offset=6;s.slash_number=3;s.slash_array=[2,3,4,4,4,4];}
   if(s.difficulty===2){s.slash_offset=0;s.slash_number=3;s.slash_array=[3,4,4,4,4,4];}
   const t=TURNS[s.turn_type];
   if(t){s.local_turntimer=t[0];if(t[1]!==undefined)s.timer=t[1];if(t[2]!==undefined)s.turn_limit_4=t[2];}
  },
  alarm1:s=>{s.line3=0;},
  alarm2:(s,rt)=>{
   if(s.next_up!==-999)throw Error(`The rotating slash's hand-over to attack ${s.next_up} (the combination attack) is not ported`);
   rt.destroy(s);
  },
  alarm3:(s,rt)=>rt.destroy(s),
  cleanup:(s,rt)=>{
   rt.dsDestroy('list',s.slash_list);
   if(rt.sourceSurfaces?.exists(s.my_surface))rt.sourceSurfaces.free(s.my_surface);
   const plain=rt.instances.filter(i=>i.live&&i.object.name==='obj_bulletparent').length;
   if(s.turn_type!=='start'&&s.turn_type!=='short start'&&s.turn_type!=='short mid'&&plain<2){for(const k of rt.all(object('obj_knight_enemy')))k.imageAlpha=1;rt.globals.turntimer=-1;}
   rt.soundStop?.('snd_knight_rotatingslash_line');
  },
  step:(s,rt)=>step(s,rt),
  draw:(s,rt)=>draw(s,rt),
 }};
 function step(s:GmInstance,rt:GmRuntime){
  const g=rt.globals,k=knight(rt);
  k.siner2=0;s.anchor_x=k.x;s.anchor_y=k.y;s.local_turntimer--;
  if((s.local_turntimer<240&&s.next_up===1)||(s.local_turntimer<220&&s.next_up===3)||(s.local_turntimer<s.turn_limit_4&&(s.next_up===4||s.next_up===5)))
   throw Error(`The rotating slash's hand-over to attack ${s.next_up} (the combination attack) is not ported`);
  if(g.time%4===0&&!eq(s.imageAlpha,0)){
   const f=scrAfterimage(s,rt);s.fade=f.id;f.depth=rt.byId(s.creatorid)!.depth+1;f.depth=k.depth+1;f.imageAlpha=0.6;f.fadeSpeed=0.04;f.hspeed=4;
  }
  if(s.line2>-1){s.line2++;s.line2%=8;}
  if(s.line3>-1){s.line3++;s.line3%=8;}
  if(s.imageIndex>=5&&s.aim_type!==2){s.imageIndex=5;s.imageSpeed=0;}
  if(s.state==='intro'){s.timer++;if(s.timer>16){s.state='aim';s.timer=0;}}
  if(s.state==='aim'){
   s.timer++;
   if(s.timer===1){
    rt.soundStop?.('snd_knight_rotatingslash_line');rt.soundLoop?.('snd_knight_rotatingslash_line');
    s.rotation=s.rotation_base;s.spin=rt.random.choose(-1,1);s.circle_size=0;s.r=128;s.g=128;s.b=128;
    moveBox(s,rt)();
    if(s.aim_type!==2)s.imageIndex=1;else{s.sprite='spr_roaringknight_flurry_prepare';s.imageIndex=0;}
    toBoxCorner(s,rt);
   }
   s.aim_direction+=s.rotation*s.spin;s.rotation=approach(s.rotation,s.rotation_goal,s.rotation_change);
   if(s.timer===1){
    if(s.aim_type===0){const h=soul(rt);s.aim_x=h.x+10;s.aim_y=h.y+10;}
    rt.create(circle,s.aim_x,s.aim_y);
   }else{const step=9.142857142857142;s.r=approach(s.r,255,step);s.g=approach(s.g,0,step);s.b=approach(s.b,0,step);}
   if(s.timer===Math.floor((s.slash_base+s.slash_offset)*0.5)&&s.aim_type!==2)s.imageIndex++;
   if(s.timer===s.slash_base+s.slash_offset){
    if(s.aim_type!==2)s.imageSpeed=0.5;
    else{scriptDelayedOn(s,rt,setVar,4,'sprite_index','spr_roaringknight_flurry');scriptDelayedOn(s,rt,setVar,4,'image_speed',1);}
   }
   if(s.timer===s.slash_base+6+s.slash_offset){s.state='slash';s.timer=0;}
  }
  if(s.state==='slash'){
   s.timer++;
   const list=rt.ds('list',s.slash_list) as number[];
   if(s.timer===1){
    rt.soundStop?.('snd_knight_rotatingslash_line');list.length=0;
    for(s.a=0;s.a<s.slash_number;s.a++)list.push(360/(s.slash_number*2)*s.a+s.random_offset+s.aim_direction);
    for(let i=1;i<list.length;i++){const j=rt.random.next()%(i+1);[list[i],list[j]]=[list[j],list[i]];}
    snd(rt,'snd_knight_cut');snd(rt,'snd_explosion_firework');
   }
   if(s.timer-1<list.length){
    const sl=rt.create(slash,s.aim_x,s.aim_y);
    sl.direction=list[s.timer-1];sl.imageXscale=2;sl.imageAngle=sl.direction;sl.visible=false;sl.width*=2;sl.aoe=1;
    marks(sl,rt);
    bulletInherit(s,sl);rt.userEvent(sl,0);
   }
   if(s.timer===s.slash_timer){s.state='cooldown';s.timer=0;}
  }
  if(s.state==='cooldown')cooldown(s,rt);
 }
 function cooldown(s:GmInstance,rt:GmRuntime){
  s.timer++;
  if(!(s.timer===s.cooldown_time||s.local_turntimer<200))return;
  s.slash_counter++;
  if(s.slash_counter<s.slash_array.length){s.slash_number=s.slash_array[s.slash_counter];s.slash_offset=approach(s.slash_offset,0,6);s.slash_base=approach(s.slash_base,15,1);}
  if(s.local_turntimer<200&&!s.slashes_done){s.slashes_done=1;s.local_turntimer=99999;}
  if(s.slashes_done){
   if(s.difficulty===2&&s.turn_type==='full'){
    if(s.do_final){
     snd(rt,'snd_knight_puff');snd(rt,'snd_knight_teleport',0.5,1);
     s.rotation_base=18;s.rotation_change=0.5;s.line_width=4;
     const a=rt.create(afterimageScreen,(getBox(rt,2)+getBox(rt,0))/2,(getBox(rt,1)+getBox(rt,3))/2);a.faderate=0.05;a.draw_end=1;
     Object.assign(s,{slash_number:1,slash_base:24,cooldown_time:2,slash_timer:2});s.aim_type=approach(s.aim_type,2,1);s.do_final=0;
     s.aim_x=(getBox(rt,2)+getBox(rt,0))/2;s.aim_y=(getBox(rt,1)+getBox(rt,3))/2;
    }
   }else{
    if(s.turn_type==='start'||s.turn_type==='short start'||s.turn_type==='short mid')
     throw Error("The rotating slash's warp to the combination attack's next part is not ported");
    s.debug=1;s.state='return';s.timer=0;
    scriptDelayedOn(s,rt,setVar,8,'image_index',0);
    scriptDelayedOn(s,rt,lerpvarScript,8,'x',s.x,s.anchor_x,12,1,'out');
    scriptDelayedOn(s,rt,lerpvarScript,8,'y',s.y,s.anchor_y,12,1,'out');
    s.alarm[3]=22;return;
   }
  }
  if(s.aim_type<2){
   s.state='aim';s.timer=0;
   if(s.aim_type===1){s.line2=0;s.alarm[1]=4;s.aim_type=approach(s.aim_type,2,1);return;}
  }
  if(s.aim_type===2){
   s.state='slash';s.timer=0;s.aim_direction+=s.speed_gain*s.spin;s.speed_gain=approach(s.speed_gain,24,1);s.final_counter++;
   if(s.final_counter===28){
    s.state='return';setVar(s,rt,'sprite_index','spr_roaringknight_attack_ol');setVar(s,rt,'image_index',0);setVar(s,rt,'image_speed',0);
    for(const l of rt.all(object('obj_lerpvar')))if(l.target===s.id)rt.destroy(l);
    scrLerpvar(s,rt,'x',s.x,s.anchor_x,12,1,'out');scrLerpvar(s,rt,'y',s.y,s.anchor_y,12,1,'out');s.alarm[3]=22;s.timer=0;
   }else{
    const wrap=moveBox(s,rt);s.sprite='spr_roaringknight_flurry';s.imageSpeed=1;wrap();toBoxCorner(s,rt);
   }
  }
 }
 function draw(s:GmInstance,rt:GmRuntime){
  const surfaces=rt.sourceSurfaces!,w=getBox(rt,0)-getBox(rt,2)-8,h=getBox(rt,3)-getBox(rt,1)-8;
  if(!surfaces.exists(s.my_surface))s.my_surface=surfaces.create(w,h);
  if(surfaces.exists(s.my_surface))surfaces.resize(s.my_surface,w,h);
  surfaces.target(s.my_surface);surfaces.clear(C.black,0);
  const ox=getBox(rt,2)+5,oy=getBox(rt,1)+5,d=rt.drawState;
  if(s.state==='aim'&&s.timer){
   const dirOf=()=>360/(s.slash_number*2)*s.a+s.random_offset+s.aim_direction;
   const stretch=1+2*(1-s.timer/(s.slash_base+6+s.slash_offset));
   for(s.a=0;s.a<s.slash_number;s.a++)rt.drawSprite('spr_rk_quickslash_marker_gradient',0,s.aim_x-ox,s.aim_y-oy,s.timer*0.2,stretch,dirOf(),makeColorRgb(s.r,s.g,s.b),1);
   for(s.a=0;s.a<s.slash_number;s.a++)rt.drawSprite('spr_rk_quickslash_marker',0,s.aim_x-ox,s.aim_y-oy,s.timer*0.2,stretch,dirOf(),C.black,1);
   for(const line of [s.line2,s.line3]){
    if(!line)continue;
    d.alpha=1-line/7;
    for(s.a=0;s.a<s.slash_number;s.a++){
     const dir=dirOf(),dx=lengthdirX(320,dir),dy=lengthdirY(320,dir),px=lengthdirX(line*6,dir+90),py=lengthdirY(line*6,dir+90);
     d.color=makeColorRgb(s.r,s.g,s.b);
     rt.drawLine(s.aim_x-ox+dx+px,s.aim_y-oy+dy+py,s.aim_x-ox-dx+px,s.aim_y-oy-dy+py,s.line_width);
     rt.drawLine(s.aim_x-ox+dx-px,s.aim_y-oy+dy-py,s.aim_x-ox-dx-px,s.aim_y-oy-dy-py,s.line_width);
    }
    d.alpha=1;
   }
  }
  for(const sl of rt.all(slash)){
   const hx=lengthdirX(640,sl.direction),hy=lengthdirY(640,sl.direction),hxo=lengthdirX(sl.width,sl.direction+90),hyo=lengthdirY(sl.width,sl.direction+90);
   const color=makeColorRgb(255,(1-sl.imageAlpha)*255,(1-sl.imageAlpha)*255),x=sl.x-ox,y=sl.y-oy;
   if(sl.slashdir)rt.drawTriangleColor(x-hx*sl.imageAlpha,y-hy*sl.imageAlpha,x+hx+hxo,y+hy+hyo,x+hx-hxo,y+hy-hyo,color,color,color);
   else rt.drawTriangleColor(x+hx*sl.imageAlpha,y+hy*sl.imageAlpha,x-hx+hxo,y-hy+hyo,x-hx-hxo,y-hy-hyo,color,color,color);
  }
  surfaces.target(null);surfaces.draw(s.my_surface,ox,oy);
  rt.drawSprite(s.sprite,s.imageIndex,s.x,s.y+Math.sin(rt.globals.time*0.1)*2,s.imageXscale,s.imageYscale,s.imageAngle,s.imageBlend,s.imageAlpha);
 }

 /** Bullet type 104 in the bullet maker: the turn is as long as the slash; the Knight hides while it plays. */
 const pattern:Chapter2BulletRunner=(s,rt)=>{
  if(s.type!==104)return false;
  if(!s.made){
   rt.globals.turntimer=999999;s.made=1;
   const k=rt.byId(s.creatorid);if(!k)throw Error('The rotating slash needs its creator');k.imageAlpha=0;
   const r=rt.create(rotating,k.x,k.y);r.difficulty=s.difficulty;rt.userEvent(r,0);bulletInherit(s,r);
  }
  return true;
 };
 return {objects:[particle,slash,circle,afterimageScreen,rotating],pattern};
}
