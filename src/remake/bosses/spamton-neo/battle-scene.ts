/** Track, cityscape and coaster presentation for the native NEO practice snapshot.
 * World actor sequences stay behind explicit host callbacks. */
import {gmArray,resolveEvent,type GmInstance,type GmObjectDef,type GmRuntime} from '../../gm/runtime';
import {eq,ge,gt,le,lt,lengthdirX,lengthdirY} from '../../gm/math';
import {C} from '../../gm/graphics';
import {KEY,pressed} from '../../deltarune/keys';

export interface NeoBattleSceneHost{
 object(name:string):GmObjectDef;
 room?:string;
 battleBoundary(scene:GmInstance,rt:GmRuntime):void;
 /** Frees battle music, silences/resumes the prior song, then fades it in over 20 frames. */
 finishBattleAudio(scene:GmInstance,rt:GmRuntime):void;
 worldCreate?:(scene:GmInstance,rt:GmRuntime)=>void;
 worldStep?:(scene:GmInstance,rt:GmRuntime)=>void;
 cutsceneLoaded?:(rt:GmRuntime)=>boolean;
}
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
const HERO_NAMES=['obj_herokris','obj_herosusie','obj_heroralsei'];
const COASTER_FIELDS=['coaster_kris','coaster_susie','coaster_ralsei'];
const RETURN_SPRITES=['spr_krisr_dark','spr_susie_walk_right_dw_unhappy','spr_ralsei_walk_right_unhappy'];
const COASTER_TYPES=[
 {character:'spr_krisr_dark'},
 {front:'spr_susie_coaster_front',back:'spr_susie_coaster_back',hurtFront:'spr_susie_coaster_hurt_front',hurtBack:'spr_susie_coaster_hurt_back',hurtCharacter:'spr_susie_hurt',character:'spr_susie_walk_right_dw',x:-20,y:55},
 {front:'spr_ralsei_coaster_front',back:'spr_ralsei_coaster_back',hurtFront:'spr_ralsei_coaster_hurt_front',hurtBack:'spr_ralsei_coaster_hurt_back',hurtCharacter:'spr_ralsei_hurt_overworld',character:'spr_ralsei_walk_right',x:-30,y:45},
 {front:'spr_berdly_coaster_front',back:'spr_berdly_coaster_back',hurtFront:'spr_berdly_coaster_hurt_front',hurtBack:'spr_berdly_coaster_hurt_back',hurtCharacter:'spr_berdlyb_shocked',character:'spr_berdly_walk_left_dw',x:-65,y:30},
 {front:'spr_noelle_coaster_front',character:'spr_noelle_walk_left_dw',x:-65,y:45},
] as const;

/** scr_dark_marker: its working reference belongs to the script's caller. */
export function neoSceneDarkMarker(caller:GmInstance,rt:GmRuntime,object:(name:string)=>GmObjectDef,x:number,y:number,sprite:string){
 const marker=rt.create(object('obj_marker'),x,y);caller.thismarker=marker.id;
 marker.sprite=sprite;marker.imageSpeed=0;marker.imageXscale=2;marker.imageYscale=2;return marker;
}

/** scr_draw_sprite_tiled_area: source part coordinates and inclusive area edges. */
export function neoSceneDrawTiledArea(rt:GmRuntime,sprite:string,frame:number,xx:number,yy:number,x1:number,y1:number,x2:number,y2:number,xscale:number,yscale:number,color=C.white,alpha=1){
 const data=rt.bank.get(sprite);if(!data)return;
 const sw=data.width*xscale,sh=data.height*yscale;
 if(!gt(sw,0)||!gt(sh,0))throw Error('NEO tiled-area drawing requires positive sprite dimensions and scale');
 let i=x1-((x1%sw)-(xx%sw))-sw*Number(lt(x1%sw,xx%sw));
 let j=y1-((y1%sh)-(yy%sh))-sh*Number(lt(y1%sh,yy%sh));const jj=j;
 while(le(i,x2)){
  while(le(j,y2)){
   const left=le(i,x1)?x1-i:0,top=le(j,y1)?y1-j:0;
   const width=le(x2,i+sw)?sw-((i+sw)-x2)+1-left:sw-left;
   const height=le(y2,j+sh)?sh-((j+sh)-y2)+1-top:sh-top;
   rt.drawSpritePart(sprite,frame,left,top,width,height,i+left,j+top,xscale,yscale,color,alpha);j+=sh;
  }
  j=jj;i+=sw;
 }
}

function initializeScene(s:GmInstance){
 Object.assign(s,{drawblack:2,drawtrack:1,trackx:0,tracky0:180,tracky1:240,tracky2:300,fightmode:0,
  trackspeed:0,trackaccel:0,trackspeedmax:0,cityscapefade:0,cityscape_active:false,cityscape_speed:0,cityscape_alpha:0,
  init:0,con:-1,customcon:0,timer:0,sneo_x_save:0,sneo_y_save:0,shortened:false,special_scene:false,
  rudebuster:false,sneo_fly:false,sneo_release:false,forcend:0,shop_spamton_bg_con:0,shop_spamton_bg_timer:0,cityscape_speed_max:5});
}
function world(host:NeoBattleSceneHost,event:'worldCreate'|'worldStep',s:GmInstance,rt:GmRuntime){
 const callback=host[event];if(!callback)throw Error(`NEO world scene ${event} is not ported; source-backed callback required`);
 callback(s,rt);
}

export function createNeoBattleScene(host:NeoBattleSceneHost):GmObjectDef[]{
 const object=host.object;
 const first=(rt:GmRuntime,name:string)=>rt.first(object(name));
 const destroyAll=(rt:GmRuntime,name:string)=>{for(const i of rt.all(object(name)))rt.destroy(i);};
 const coaster=(s:GmInstance,rt:GmRuntime,i:number)=>{const scene=first(rt,'obj_ch2_sceneex2')!;return rt.byId(scene[COASTER_FIELDS[i]])!;};
 const scene:GmObjectDef={name:'obj_ch2_sceneex2',index:1004,sprite:'spr_event',depth:0,events:{
  create:(s,rt)=>{initializeScene(s);if(eq(rt.globals.chapter,2)&&ge(rt.globals.flag[309],8))world(host,'worldCreate',s,rt);},
  alarm0:s=>{s.con++;},
  step:(s,rt)=>{
   if(eq(s.con,13)&&eq(s.forcend,1)){host.battleBoundary(s,rt);return;}
   const loaded=host.cutsceneLoaded?host.cutsceneLoaded(rt):eq(first(rt,'obj_cutscene_master')?.loadedState??0,1);
   if(lt(s.con,8)||gt(s.con,13)||(eq(s.customcon,1)&&gt(s.special_scene,0))||loaded){world(host,'worldStep',s,rt);return;}
   if(eq(s.init,0)){s.trackx=0;s.init=1;}
   if(eq(s.con,9)&&first(rt,'obj_battlecontroller')){
    if(rt.all(object('obj_battlecontroller')).some(c=>eq(c.intro,2))){
     s.con=10;for(const c of rt.all(object('o_coaster_hero_sneo')))c.lerpstate=2;
     for(let i=0;i<3;i++)rt.byId(s[COASTER_FIELDS[i]])!.character_sprite=RETURN_SPRITES[i];s.alarm[0]=5;
    }
   }
   if(eq(s.con,11)){
    s.con=12;s.alarm[0]=10;destroyAll(rt,'obj_bulletparent');
    const back=first(rt,'obj_battleback');if(back)back.destroy=1;
    destroyAll(rt,'obj_battlecontroller');host.finishBattleAudio(s,rt);
   }
   if(eq(s.con,13)&&!first(rt,'obj_battlecontroller')){world(host,'worldStep',s,rt);return;}
   if(s.rudebuster){s.rudebuster=false;const bolt=rt.create(object('obj_rudebuster_bolt'),rt.view.x-60,275);s.rudebusteranim=bolt.id;bolt.target=s.sneo;}
   if(s.sneo_fly){const n=rt.byId(s.sneo)!;n.gravity=-2;if(le(n.y,rt.view.y-200)){s.sneo_fly=false;n.gravity=0;n.x=840;n.y=rt.view.y-200;}}
   if(s.sneo_release){const n=rt.byId(s.sneo)!;if(eq(n.gravity,0)){n.gravity=2;n.facing=1;n.partmode=1;}if(ge(n.y,80)){s.sneo_release=false;n.gravity=0;n.vspeed=0;}}
  },
  draw:(s,rt)=>{
   s.depth=99000;if(first(rt,'obj_encounterbasic'))s.fightmode=1;
   if(eq(s.drawblack,1)&&eq(s.fightmode,0)){rt.drawState.color=C.black;rt.drawRect(1630,-10,2500,500);}
   if(eq(s.drawtrack,1)){
    s.trackx+=s.trackspeed;if(lt(s.trackx+640,rt.view.x))s.trackx+=640;if(gt(s.trackx-640,rt.view.x))s.trackx-=640;
    for(const y of [s.tracky0,s.tracky1,s.tracky2])for(const x of [s.trackx-640,s.trackx,s.trackx+640])rt.drawSprite('spr_sneo_track',0,x,y,2,2,0,C.white,s.imageAlpha);
    rt.drawState.color=C.black;rt.drawRect(0,200,80,420);
   }
   if(eq(s.drawblack,2)&&eq(s.fightmode,0)){rt.drawState.color=C.black;rt.drawRect(1640,-10,2500,500);}
   if(s.cityscape_active){
    if(lt(s.cityscape_alpha,1))s.cityscape_alpha=lerp(s.cityscape_alpha,1,.2);
    if(eq(s.cityscapefade,1))s.cityscape_alpha=0;
    s.cityscape_speed-=s.cityscape_speed_max;
    if(lt(s.cityscape_speed_max,0)&&gt(s.cityscape_speed,-398))s.cityscape_speed-=398;
    const tile=(sprite:string,speed:number,xscale:number,yscale:number,heightSprite=sprite,yoffset=0,alpha=s.cityscape_alpha)=>{
     const x=rt.view.x+speed,y=rt.view.y+yoffset,height=rt.bank.get(heightSprite)?.height??0;
     neoSceneDrawTiledArea(rt,sprite,0,x,rt.view.y,x,y,rt.view.x+rt.view.width,y+height*2,xscale,yscale,C.white,alpha);
    };
    tile('bg_dw_mansion_basement_cityscape_background',s.cityscape_speed,2,2);
    tile('bg_dw_mansion_basement_cityscape_midground',s.cityscape_speed*1.1,2,2);
    tile('bg_dw_mansion_basement_cityscape_foreground',s.cityscape_speed*1.2,2,2);
    if(gt(s.shop_spamton_bg_con,1)){if(eq(s.cityscapefade,1))s.cityscape_alpha=.15;tile('spr_shop_spamton_bg_battle',s.cityscape_speed,1.6708,1.195,'bg_dw_mansion_basement_cityscape');}
    if(eq(s.shop_spamton_bg_con,1)&&!first(rt,'obj_writer')&&!first(rt,'obj_battleblcon')){
     s.shop_spamton_bg_timer++;if(eq(s.shop_spamton_bg_timer,1))rt.sound?.('snd_petrify');if(eq(s.shop_spamton_bg_timer,23))s.shop_spamton_bg_con=2;
    }
    if(eq(s.shop_spamton_bg_con,2)){
     s.shop_spamton_bg_timer--;if(eq(s.shop_spamton_bg_timer,0)){s.shop_spamton_bg_con=3;for(const n of rt.all(object('obj_spamton_neo_enemy')))n.targetbgspeed=5;}
    }
    if(gt(s.shop_spamton_bg_con,0)&&lt(s.shop_spamton_bg_con,3))tile('spr_whitepixel',s.cityscape_speed,396,8,'bg_dw_mansion_basement_cityscape',-2,s.shop_spamton_bg_timer/20);
   }
  },
 }};
 const controller:GmObjectDef={name:'o_coaster_controller_sneo',index:698,sprite:'spr_coaster_explosion',depth:0,visible:false,events:{create:(s,rt)=>{
  Object.assign(s,{timer:0,timermax:180,playerinput:0,playerinputtimer:0,actcon:0,krisgooffscreen:0,susiegooffscreen:0,ralseigooffscreen:0,buttonspressed:0,bumpmercy:0});
  const keys=gmArray(s,'mykey');keys[0]=90;keys[1]=88;keys[2]=67;
  const heroes=gmArray(s,'HeroCoaster'),spots=gmArray(s,'yspot');
  for(s.i=0;lt(s.i,3);s.i++){
   const hero=rt.create(object('o_coaster_hero_sneo'),0,0);heroes[s.i]=hero.id;hero.HeroID=s.i;hero.imageIndex=s.i;hero.depth=hero.y*-100;hero.siner=0;hero.mykey=keys[s.i];
   const back=rt.create(object('o_coaster_hero_back_sneo'),hero.x,hero.y);hero.back=back.id;back.parentid=hero.id;back.depth=hero.depth+2;spots[s.i]=hero.y;
  }
 }}};
 const hero:GmObjectDef={name:'o_coaster_hero_sneo',index:699,sprite:'spr_sneo_car_front',depth:0,events:{
  create:s=>{
   Object.assign(s,{HeroID:0,xx:0,yy:0,forceact:1,gooffscreen:0,userealsprite:0,introanim:1,endtargetx:0,lerpstate:0,lerptimer:0,siner:0,smoketimer:0,con:0,action:0,mykey:81,damaged:0,mykeybuffer:0,nitro:0,barrier:0,disabled:0,disabledtimer:0,disabledtype:0,flametimer:0,flameindex:0,flameindextimer:0,fsiner:0,actoncondelay:0,dontshowherosprite:0,draw_button_press:0,draw_button_press_timer:0});
   s.imageSpeed=.25;s.imageXscale=2;s.imageYscale=2;s.mask='spr_coaster_hero';
  },
  destroy:(_s,rt)=>destroyAll(rt,'o_coaster_hero_back'),
  step:(s,rt)=>{
   const c=first(rt,'o_coaster_controller_sneo')!;
   const button=(eq(s.HeroID,0)&&pressed(rt,KEY.z,KEY.enter))||(eq(s.HeroID,1)&&pressed(rt,KEY.x,KEY.shift))||(eq(s.HeroID,2)&&pressed(rt,KEY.c,KEY.ctrl));
   if(eq(c.actcon,1)&&lt(c.timer,c.timermax)&&button&&eq(s.gooffscreen,0)&&s.visible){s.draw_button_press=0;s.mykeybuffer=3;c.playerinput=1;}
   if(!eq(c.actcon,0))s.actoncondelay=1;if(first(rt,'obj_battleblcon'))s.actoncondelay=0;
   if(eq(s.disabled,1)){s.disabledtimer--;if(le(s.disabledtimer,0))s.disabled=0;}
   if(eq(s.con,0)){s.siner+=.4;if(eq(s.gooffscreen,0))s.x=s.xstart+Math.sin(s.siner/6)*3;if(gt(s.mykeybuffer,0)&&eq(s.disabled,0)){s.con=1;s.dashtimer=0;s.damaged=0;for(const controller of rt.all(object('o_coaster_controller_sneo')))controller.buttonspressed++;}}
   if(eq(s.con,1)){
    if(eq(s.nitro,0)){s.hspeed+=4;if(gt(s.hspeed,30))s.hspeed=30;}if(eq(s.nitro,1)){s.hspeed+=8;if(gt(s.hspeed,60))s.hspeed=60;}
    s.smoketimer+=2;if(ge(s.smoketimer,3)){s.smoke=rt.create(object('o_coastersmoke'),s.x+s.hspeed+8,s.y-10).id;s.smoketimer=0;}
    if(ge(s.x,rt.view.x+200))s.con=2;if(eq(s.damaged,1)){s.con=5;s.hspeed=eq(s.nitro,1)?-200:-48;}
   }
   if(eq(s.con,2)){
    if(eq(s.damaged,1))s.con=5;if(ge(s.hspeed,-6))s.hspeed-=2;
    if(eq(s.nitro,1)){s.hspeed--;if(ge(s.x,rt.view.x+400)&&gt(s.hspeed,0))s.hspeed=-2;}
    if(le(s.x,s.xstart+10)){s.damaged=0;s.hspeed=0;s.siner=0;s.con=0;}
   }
   if(eq(s.con,5)){s.hspeed=eq(s.nitro,1)?-100:-30;if(le(s.x,s.xstart-s.hspeed)){s.hspeed=0;s.damaged=0;s.siner=0;s.con=0;}}
   s.mykeybuffer--;if(eq(s.gooffscreen,2)&&eq(s.HeroID,0))s.x-=2;
  },
  endStep:(s,rt)=>{
   for(let i=0;i<3;i++)if(eq(s.HeroID,i)){s.depth=[80,75,70][i];const h=first(rt,HERO_NAMES[i]);if(h)h.depth=s.depth+1;}
   const encounter=first(rt,'obj_encounterbasic');if(encounter)for(let i=1;i<3;i++)if(eq(s.HeroID,i))rt.byId(encounter.c[i])!.depth=s.depth+1;
  },
  draw:(s,rt)=>{
   const carts=[0,1,2].map(i=>coaster(s,rt,i));
   const positions=carts.map(c=>[c.x+c.sinerx+c.coaster_offset_x+c.target_x_end,c.y+c.sinery+c.coaster_offset_y]);
   const slot=HERO_NAMES.findIndex((_name,i)=>eq(s.HeroID,i)),p=positions[slot],c=carts[slot],h=slot>=0?first(rt,HERO_NAMES[slot]):undefined;
   const endX=[1705,1715,1710][slot],endY=[101,182,260][slot];
   if(eq(s.lerpstate,0)){
    if(lt(s.lerptimer,10))s.lerptimer++;if(slot>=0){s.x=lerp(p[0],endX,s.lerptimer/10);s.y=lerp(p[1],endY,s.lerptimer/10);}
    if(gt(s.lerptimer,9)&&first(rt,'obj_herokris')){s.lerptimer=0;s.lerpstate=1;}
   }
   if(eq(s.lerpstate,1)&&h)s.x=h.x-[15,5,10][slot];
   if(eq(s.lerpstate,2)){
    s.lerptimer++;if(slot>=0){s.x=lerp(endX,p[0],s.lerptimer/5);s.y=lerp(endY,p[1],s.lerptimer/5);}
    if(h)h.x=lerp([1710,1717,1712][slot],c.x+c.sinerx+c.character_offset_x+c.target_x_end,s.lerptimer/5);
    if(eq(slot,2)&&h)h.y+=.5;
    if(eq(s.lerptimer,4))for(const cart of rt.all(object('obj_coaster')))cart.visible=true;
    if(gt(s.lerptimer,4)){
     for(const cart of rt.all(object('obj_coaster')))cart.visible=true;
     destroyAll(rt,'obj_heroparent');destroyAll(rt,'o_coaster_hero_sneo');destroyAll(rt,'o_coaster_hero_back_sneo');destroyAll(rt,'o_coaster_controller_sneo');return;
    }
   }
   const back=rt.byId(s.back)!;back.x=s.x+1;back.y=s.y;
   rt.drawSprite(s.sprite,s.imageIndex,s.x,s.y,s.imageXscale,s.imageYscale,0,C.white,s.imageAlpha);
  },
 }};
 const back:GmObjectDef={name:'o_coaster_hero_back_sneo',index:701,sprite:'spr_sneo_car_back',depth:0,events:{
  create:(s,rt)=>{s.depth=first(rt,'o_coaster_hero_sneo')!.depth+20;s.imageSpeed=0;s.imageXscale=2;s.imageYscale=2;const e=first(rt,'obj_encounterbasic');if(e)s.depth=rt.byId(e.c[0])!.depth+1;},
  step:(s,rt)=>{s.depth=rt.byId(s.parentid)!.depth+2;const e=first(rt,'obj_encounterbasic');if(e)s.depth=rt.byId(e.c[0])!.depth+1;},
  draw:(s,rt)=>rt.drawSelf(s),
 }};
 const worldCoaster:GmObjectDef={name:'obj_coaster',index:1126,sprite:'spr_kris_coaster_hurt_front',depth:0,events:{
  create:(s,rt)=>{
   const spam=(host.room??rt.room.name)==='room_dw_mansion_b_east';
   Object.assign(s,{type:0,init:false,con:0,actor:-1,spam_car:spam,default_sprite_front:spam?'spr_sneo_car_front':'spr_kris_coaster_front',default_sprite_back:spam?'spr_sneo_car_back':'spr_kris_coaster_back',hurt_sprite_front:spam?'spr_sneo_car_front':'spr_kris_coaster_hurt_front',hurt_sprite_back:spam?'spr_sneo_car_back':'spr_kris_coaster_hurt_back',hurt_character_sprite:'spr_krisb_hurt',character_sprite:'spr_krisr_dark',character_offset_x:0,character_offset_y:0,character_speed:.25,coaster_offset_x:-25,coaster_offset_y:40,hurt:false,siner:0,stop_siner:0,target_x:0,target_x_end:0,animate:false,siner0:0,siner_add0:0,siner_amplitude0:10,siner_direction0:0,siner_type0:'sin',siner_visual0:1,sinerx:0,sinery:0,battlecoasterx:0});s.imageSpeed=1;
  },
  step:(s,rt)=>{
   if(!s.init){
    const type=COASTER_TYPES.findIndex((_type,i)=>eq(s.type,i));
    if(eq(type,0))s.character_sprite='spr_krisr_dark';
    if(eq(type,1)||eq(type,2)||eq(type,3)){
     const data=COASTER_TYPES[type as 1|2|3];
     s.default_sprite_front=s.spam_car&&lt(type,3)?'spr_sneo_car_front':data.front;
     s.default_sprite_back=s.spam_car&&lt(type,3)?'spr_sneo_car_back':data.back;
     s.hurt_sprite_front=data.hurtFront;s.hurt_sprite_back=data.hurtBack;s.hurt_character_sprite=data.hurtCharacter;
     s.character_sprite=data.character;s.coaster_offset_x=data.x;s.coaster_offset_y=data.y;
    }
    if(eq(type,4)){s.default_sprite_front='spr_noelle_coaster_front';s.default_sprite_back=-1;s.character_sprite='spr_noelle_walk_left_dw';s.coaster_offset_x=-65;s.coaster_offset_y=45;}
    if(ge(type,0)&&le(type,4)){s.init=true;const actor=neoSceneDarkMarker(s,rt,object,0,0,s.character_sprite);s.actor=actor.id;actor.imageSpeed=0;actor.visible=false;}
   }
   const actor=rt.byId(s.actor)!;
   if(s.character_sprite!==actor.sprite){actor.sprite=s.character_sprite;actor.imageIndex=0;}
   if(eq(s.con,0))actor.imageSpeed=s.animate?.25:0;
   else{s.imageSpeed=0;if(eq(s.type,0)&&lt(actor.imageIndex,6))actor.imageIndex+=.25;if(eq(s.type,1)&&lt(actor.imageIndex,5))actor.imageIndex+=.25;if(eq(s.type,2)&&lt(actor.imageIndex,10))actor.imageIndex+=.5;}
   if(eq(s.stop_siner,1)){
    s.sinerx=0;s.battlecoasterx=rt.view.x+122-s.type*20;if(eq(s.type,3))s.battlecoasterx=rt.view.x+515;if(eq(s.type,0))s.battlecoasterx+=4;
    for(let i=0;i<4;i++){if(lt(s.x,s.battlecoasterx))s.x++;if(gt(s.x,s.battlecoasterx))s.x--;}
   }else{
    s.sinerx=0;s.sinery=0;if(!eq(s.siner_add0,0)){
     s.siner0+=s.siner_add0;s.sinmove=(s.siner_type0==='sin'?Math.sin(s.siner0):Math.cos(s.siner0))*s.siner_amplitude0;
     const x=lengthdirX(s.sinmove,s.siner_direction0),y=lengthdirY(s.sinmove,s.siner_direction0);
     if(eq(s.siner_visual0,1)){s.sinerx+=x;s.sinery+=y;}else{s.x+=x;s.y+=y;}
    }
   }
  },
  draw:(s,rt)=>{
   if(s.animate)s.siner++;
   const draw=(sprite:string,frame:number,x:number,y:number)=>rt.drawSprite(sprite,frame,x,y,2,2,0,C.white,1);
   if(!s.hurt){
    if(s.default_sprite_back!==-1)draw(s.default_sprite_back,s.imageIndex,s.x+s.sinerx+s.coaster_offset_x,s.y+s.sinery+s.coaster_offset_y);
    const actor=rt.byId(s.actor)!;draw(actor.sprite!,actor.imageIndex,s.x+s.sinerx+s.character_offset_x,s.y+s.sinery+s.character_offset_y);
    draw(s.default_sprite_front,s.imageIndex,s.x+s.sinerx+s.coaster_offset_x,s.y+s.sinery+s.coaster_offset_y);
   }else{
    draw(s.hurt_sprite_back,s.imageIndex,s.x+s.coaster_offset_x,s.y+s.coaster_offset_y);
    draw(s.hurt_character_sprite,s.imageIndex,s.x+s.sinerx+s.character_offset_x,s.y+s.sinery+s.character_offset_y);
    draw(s.hurt_sprite_front,s.imageIndex,s.x+s.coaster_offset_x,s.y+s.coaster_offset_y);
   }
  },
 }};
 const smoke:GmObjectDef={name:'o_coastersmoke',index:505,sprite:'spr_coaster_explosion',depth:0,events:{
  create:(s,rt)=>{s.imageXscale=2;s.imageSpeed=1;s.hspeed=-2;s.vspeed=-2+rt.random.random(2);s.depth=90000;},
  step:(s,rt)=>{s.hspeed-=2;if(ge(s.imageIndex,4))rt.destroy(s);},
 }};
 return [scene,controller,hero,back,worldCoaster,smoke];
}

export const NEO_BATTLE_SCENE_SNAPSHOT={viewX:1640,viewY:0,con:8,fightmode:1,trackspeed:-15,trackY:[70,150,230],alarm0:120,coasters:[[1721,60,.1],[1718,125,.08],[1727,215,.09]]} as const;

/** Restores source con7/customcon1's completed battle transition. The host owns battle creation. */
export function enterNeoBattleSnapshot(rt:GmRuntime,host:NeoBattleSceneHost,enemy:GmInstance):GmInstance{
 if(rt.view.x!==1640||rt.view.y!==0)throw Error('Native NEO coaster snapshot requires camera (1640,0)');
 const snapshot=NEO_BATTLE_SCENE_SNAPSHOT,s=rt.restore(host.object('obj_ch2_sceneex2'),rt.nextId++,rt.view.x,0);initializeScene(s);
 Object.assign(s,{con:snapshot.con,customcon:1,fightmode:1,trackspeed:snapshot.trackspeed,tracky0:70,tracky1:150,tracky2:230,cityscape_active:true,sneo:enemy.id,shortened:false,special_scene:false});s.alarm[0]=snapshot.alarm0;
 const sprites=['spr_krisb_defeat','spr_susie_shock_r','spr_ralsei_surprised_down'];
 for(let i=0;i<3;i++){
  const [x,y,sinerAdd]=snapshot.coasters[i],c=rt.create(host.object('obj_coaster'),x,y);c.type=i;
  resolveEvent(c.object,'step')!(c,rt);c.character_sprite=sprites[i];c.siner_add0=sinerAdd;c.visible=false;c.depth=[90000,80000,70000][i];if(i===2)c.character_offset_x=-10;
  s[COASTER_FIELDS[i]]=c.id;
 }
 rt.create(host.object('o_coaster_controller_sneo'),s.x,s.y);rt.globals.tempflag[32]=1;rt.globals.flag[54]=571;rt.globals.flag[9]=1;return s;
}
