import {resolveEvent,gmField,type GmInstance,type GmObjectDef,type GmRuntime,type GmEvent} from '../../gm/runtime';
import {clamp,eq,pointDirection,pointDistance,lengthdirX,lengthdirY} from '../../gm/math';
import {pointMeets} from '../../gm/collision';
import {damage,damageAll,afterImage,moveHeartIn,tensionHeal} from '../../deltarune/battle';
import {nextAct,mnEndTurn,winCombat,randomTarget,inputName} from '../../deltarune/controller';
import {speaker,heroBlcon,terminateWriter,enemyHurt} from '../../deltarune/chapter2-enemy';
import {enemyBlcon2} from '../../deltarune/chapter2-objects';
import {spellMenuSetupChapter2} from '../../deltarune/chapter2';
import {isPhase,turnTimer,scriptDelayedOn,gmlScript} from '../../deltarune/chapter2-battle';
import {gtMaxx,gtMinx,gtMaxy,gtMiny,getBox,approach,customAfterimage,bulletInherit} from '../../deltarune/chapter3-scripts';
import {scrFadeout} from '../../deltarune/fades';
import {scrLerpvar} from '../../deltarune/shared-effects';
import {easeIn,easeOut} from '../../deltarune/ease';
import {oflashOf} from '../../deltarune/party';
import {createObjectContext} from './scene-context';
import {createSpearContext} from './spear-context';
import {spawnHammerSpear} from './spear-shot';
import type {HammerSceneScripts} from './scene-context';
import type {HammerProjectileScripts} from './projectile-context';
import type {HammerAttackHost} from './attack-families';

/** Native script/renderer operations used by the statically ported source events. */
export function hammerServices(rt:GmRuntime,object:(name:string)=>GmObjectDef,fallback:(name:string,s:GmInstance,args:any[])=>any){
 let blending=true,alphaOnly=false;
 const audio={play:(s:GmInstance,...a:any[])=>fallback('snd_play',s,a),playAt:(s:GmInstance,...a:any[])=>fallback('snd_play_x',s,a)};
 const call=(s:GmInstance,name:string,...a:any[]):any=>{
  const g=rt.globals,c=createObjectContext(s,rt,object),instance=c.resolve,targets=c.targets;
  switch(name){
   case 'scr_tensionheal':return tensionHeal(rt,a[0]);case 'scr_damage':return damage(s,rt);case 'scr_damage_all':return damageAll(s,rt,a[0]);
   case 'scr_isphase':return isPhase(rt,a[0],s);
   case 'scr_battle_marker':{const b=rt.create(object('obj_battle_marker'),a[0],a[1]);s.thismarker=b.id;Object.assign(b,{sprite:a[2],imageSpeed:1,imageXscale:2,imageYscale:2});return b.id;}
   case 'scr_afterimage':return afterImage(s,rt).id;case 'scr_afterimagefast':{const i=afterImage(s,rt);i.fadeSpeed=.08;return i.id;}
   case 'scr_custom_afterimage_ext':{const i=rt.create(a[0],a[3],a[4]);s.afterimage=i.id;Object.assign(i,{sprite:a[1],imageIndex:a[2],imageBlend:s.imageBlend,imageSpeed:0,depth:s.depth+1,imageAngle:s.imageAngle,imageXscale:a[5],imageYscale:a[6]});return i.id;}
   case 'scr_enemyblcon':return enemyBlcon2(s,rt,a[0],a[1],a[2])?.id;
   case 'scr_darksize':s.imageXscale=2;s.imageYscale=2;return;
   case 'scr_heartcolor':return createSpearContext(s,rt,object,audio,[]).heartColor(s,a[0]);
   case 'scr_at_player':{const h=rt.first(object('obj_heart'))!;return pointDirection(a[0]??s.x,a[1]??s.y,h.x+rt.spriteWidth(h)/2,h.y+rt.spriteHeight(h)/2);}
   case 'scr_fire_bullet':{const b=rt.create(a[2],a[0],a[1]);if(a.length>8&&a[8]!==87135)b.depth=a[8];b.direction=a[3];b.speed=a[4];if(a.length>5&&a[5]!==-4)b.sprite=a[5];b.updateimageangle=a[6]??0;if(a[6])b.imageAngle=a[3];if(a[7])bulletInherit(s,b);return b.id;}
   case 'scr_shakeobj':{const b=rt.create(object('obj_shakeobj'),s.x,s.y);b.target=s.id;if(a.length&&targets(a[0]).length)b.target=instance(a[0]).id;if(a.length>1&&a[1]!==-1)b.shakeamt=a[1];if(a.length>2&&a[2]!==-1)b.shakereduct=a[2];rt.userEvent(b,0);return;}
   case 'scr_shakescreen':{const b=rt.create(object('obj_shake'),s.x,s.y);b.shakex=a[0]??4;b.shakey=a[1]??4;return;}
   case 'scr_battle_sprite_set':case 'scr_battle_sprite_reset':{
    s._charactor=a[0];s._charinstance=object('obj_herokris');const who=({kris:1,susie:2,ralsei:3,noelle:4} as Record<string,number>)[a[0]];
    if(who){s._charnum=who;s._charinstance=object('obj_hero'+a[0]);}
    for(const h of targets(s._charinstance)){if(name==='scr_battle_sprite_reset'){h.state=0;h.hurt=0;h.attacktimer=0;}else{Object.assign(h,{state:8,hurt:0,attacktimer:0,sprite:a[1],imageSpeed:a[2],imageIndex:0});if(!a[3])h.maxframes=rt.bank.get(h.sprite!)!.frames;g.faceaction[h.myself]=0;}}
    return;
   }
   case 'scr_get_box':return getBox(rt,a[0]);case 'gt_maxx':return gtMaxx(rt);case 'gt_minx':return gtMinx(rt);case 'gt_maxy':return gtMaxy(rt);case 'gt_miny':return gtMiny(rt);
   case 'scr_approach':return approach(a[0],a[1],a[2]);case 'clamp01':return clamp(a[0],0,1);case 'inverselerp':return (a[2]-a[0])/(a[1]-a[0]);
   case 'scr_ease_in':return easeIn(a[0],a[1]);case 'scr_ease_out':return easeOut(a[0],a[1]);
   case 'scr_orbitx':case 'scr_orbity':{const dir=pointDirection(a[0],a[1],a[2],a[3])+a[4],r=pointDistance(a[0],a[1],a[2],a[3]);return name==='scr_orbitx'?a[0]+lengthdirX(r,dir):a[1]+lengthdirY(r,dir);}
   case 'scr_wrap':{let v=a[0],old=v+1;const min=a[1],max=a[2];if(eq(v%1,0)){while(v>max||v<min)v=v>max?min+v-max-1:max+v-min+1;}else while(!eq(v,old)){old=v;if(v<min)v=max-(min-v);else if(v>max)v=min+v-max;}return v;}
   case 'scr_jump_arc':{const b=rt.create(object('obj_jump_arc'),0,0);Object.assign(b,{master:a[0]??s.id,origx:a[1]??s.x,origy:a[2]??s.y,goalx:a[3],goaly:a[4],zheight:a[5],time:a[6]});b.jump_start();return b.id;}
   case 'scr_lerpvar':return scrLerpvar(s,rt,a[0],a[1],a[2],a[3],a[4],a[5]);
   case 'scr_var':s[gmField(a[0])]=a[1];return;
   case 'scr_sonic_boom':{const scale=a[1]??1,b=rt.create(object('obj_bulletparent'),s.x,s.y);Object.assign(b,{depth:s.depth+1,imageAngle:a[0]??0,imageXscale:.25*scale,imageYscale:.5*scale,sprite:'spr_finisher_explosion',imageIndex:2,imageSpeed:.5,imageBlend:8421504});scrLerpvar(b,rt,'image_xscale',.25*scale,.5*scale,10);scrLerpvar(b,rt,'image_yscale',.5*scale,scale,10);scriptDelayedOn(b,rt,gmlScript('instance_destroy',(t,r)=>r.destroy(t)),10);return b.id;}
   case 'draw_sprite_ext_centerscale':{const meta=rt.bank.get(a[0]);if(!meta)throw Error('Missing center-scale sprite '+a[0]);return rt.drawSprite(a[0],a[1],a[2]-(meta.width-meta.originX)*s.imageXscale*(a[4]-s.imageXscale)/2,a[3]-(meta.height-meta.originY)*s.imageYscale*(a[5]-s.imageYscale)/2,a[4],a[5],a[6],a[7],a[8]);}
   case 'draw_text_color':if(a[3]!==a[4]||a[5]!==a[6])throw Error('Horizontal source text gradient is not implemented');return rt.drawTextColor(a[0],a[1],String(a[2]),a[3],a[5],a[7]);
   case 'scr_oflash':{const b=oflashOf(s,rt);s.__of=b.id;return b.id;}
   case 'scr_script_delayed':return scriptDelayedOn(s,rt,gmlScript(String(a[0]),(t,_r,...args)=>a[0]==='instance_destroy'?rt.destroy(t):call(t,a[0],...args)),a[1],...a.slice(2)).id;
   case 'button1_p':return rt.input.pressed.has(90)||rt.input.pressed.has(13);case 'button2_p':return rt.input.pressed.has(88)||rt.input.pressed.has(16);
   case 'scr_get_input_name':return inputName(a[0]);
   case 'instance_find':return targets(a[0])[a[1]]?.id??-4;case 'instance_number':return targets(a[0]).length;
   case 'instance_nearest':return targets(a[2]).reduce<GmInstance|undefined>((best,i)=>!best||pointDistance(a[0],a[1],i.x,i.y)<pointDistance(a[0],a[1],best.x,best.y)?i:best,undefined)?.id??-4;
   case 'place_meeting':return rt.placeMeeting(s,a[0],a[1],a[2]);case 'position_meeting':return targets(a[2]).some(i=>pointMeets(rt.bank,i,a[0],a[1],true));
   case 'variable_instance_exists':return a[1] in instance(a[0]);case 'v_ex':return a.length===1?a[0] in s:a[1] in instance(a[0]);
   case 'debug_print':return;
   case 'stringsetsub':return String(a[0]).replace(/~(\d+)/g,(_,n)=>String(a[Number(n)]));
   case 'surface_create':return rt.sourceSurfaces!.create(a[0],a[1]);case 'surface_exists':return rt.sourceSurfaces!.exists(a[0]);case 'surface_free':return rt.sourceSurfaces!.free(a[0]);case 'surface_set_target':return rt.sourceSurfaces!.target(a[0]);case 'surface_reset_target':return rt.sourceSurfaces!.target(null);
   case 'draw_clear_alpha':return rt.sourceSurfaces!.clear(a[0],a[1]);case 'draw_surface':return rt.sourceSurfaces!.draw(a[0],a[1],a[2]);case 'draw_surface_ext':{if(a[3]!==1||a[4]!==1||a[5]!==0)throw Error('Scaled Chapter 4 surface requires source renderer');return rt.sourceSurfaces!.draw(a[0],a[1],a[2],a[7],a[6]);}
   case 'draw_set_alpha':rt.drawState.alpha=a[0];return;case 'draw_get_color':return rt.drawState.color;case 'draw_set_colour':rt.drawState.color=a[0];return;
   case 'd_circle':return rt.drawCircle(a[0],a[1],a[2],!!a[3]);case 'd_triangle':return rt.drawTriangle(a[0],a[1],a[2],a[3],a[4],a[5],!!a[6]);case 'd_line_width':return rt.drawLine(a[0],a[1],a[2],a[3],a[4]);
   case 'ossafe_fill_rectangle':if(!blending&&alphaOnly){if(a[4])throw Error('Alpha mask outline is not implemented');return rt.drawAlphaMaskRect(a[0],a[1],a[2],a[3],rt.drawState.alpha);}return rt.drawRect(a[0],a[1],a[2],a[3],!!a[4]);
   case 'ossafe_fill_rectangle_color':{if(!a.slice(4,8).every(c=>c===a[4]))throw Error('Hammer rectangle gradient needs source renderer');const previous=rt.drawState.color;rt.drawState.color=a[4];rt.drawRect(a[0],a[1],a[2],a[3],!!a[8]);rt.drawState.color=previous;return;}
   case 'gpu_set_blendmode':case 'draw_set_blend_mode':return rt.drawBlendMode(a[0]===0?'normal':a[0]===1?'add':a[0]===3?'subtract':(()=>{throw Error('Unknown source blend mode '+a[0]);})());
   case 'gpu_set_blendenable':blending=!!a[0];return;
   case 'shader_set':if(a[0]!==6)throw Error('Unported Chapter 4 shader '+a[0]);rt.drawLinearAlpha(true);return;
   case 'shader_reset':rt.drawLinearAlpha(false);return;
   case 'gpu_set_colorwriteenable':alphaOnly=!a[0]&&!a[1]&&!a[2]&&!!a[3];if(!alphaOnly&&(!a[0]||!a[1]||!a[2]))throw Error('Partial RGB channel writes are not implemented');return rt.drawAlphaWrite(!!a[3]);case 'gpu_set_alphatestenable':return rt.drawAlphaTest(!!a[0]);
   case 'gpu_set_alphatestref':if(a[0]!==128&&a[0]!==1)throw Error('Unsupported source alpha test threshold');return;
   case 'scr_draw_in_box_end':if(rt.exists(object('obj_growtangle'))){rt.drawAlphaTest(false);rt.drawBlendMode('normal');}return;
   case 'gpu_set_blendmode_ext':{const pair=a.join(',');const mode=({'7,8':'dest-alpha-inverse','5,2':'add','5,6':'normal'} as const)[pair as '7,8'];if(!mode)throw Error('Unported source blend factors '+pair);return rt.drawBlendMode(mode);}
   case 'mus_fade':return rt.sourceAudio?.volume(a[0],0,a[1]);
  }
  if(name in s&&typeof s[name]==='function')return s[name](...a);
  return fallback(name,s,a);
 };
 const attack:HammerAttackHost={call,inherited:(s,r,e)=>{const event=({Step0:'step',Step1:'beginStep',Step2:'endStep',Create0:'create',Draw0:'draw'} as Record<string,GmEvent>)[e]??e as GmEvent;const fn=resolveEvent(s.object.parent,event);fn?.(s,r);}};
 const scene:HammerSceneScripts={spellMenu:s=>spellMenuSetupChapter2(rt,s),heroBalloon:(s,who)=>{const b=heroBlcon(s,rt,who);if(!b)throw Error('Missing source hero balloon '+who);return b.id;},enemyBalloon:(s,x,y,kind)=>enemyBlcon2(s,rt,x,y,kind)!.id,
  phase:(s,p)=>isPhase(rt,p as Parameters<typeof isPhase>[1],s),randomTarget:s=>randomTarget(s,rt),moveHeart:()=>{moveHeartIn(rt);},turnTimer:(_s,n)=>turnTimer(rt,n),speaker:(s,who)=>speaker(s,rt,who),
  shakeObject:(s,...a)=>call(s,'scr_shakeobj',...a),musicVolume:(s,...a)=>call(s,'mus_volume',...a),musicFade:(s,...a)=>call(s,'mus_fade',...a),
  ...audio,loop:(s,...a)=>call(s,'snd_loop',...a),soundVolume:(s,...a)=>call(s,'snd_volume',...a),stop:(s,...a)=>call(s,'snd_stop',...a),pitch:(s,...a)=>call(s,'snd_pitch',...a),
  terminateWriter:s=>terminateWriter(s,rt),nextAct:s=>nextAct(rt,s),hurt:s=>{enemyHurt(s,rt);},spearShot:(s,...a)=>spawnHammerSpear(s,rt,object,audio,...a),
  afterimage:s=>{afterImage(s,rt);},fade:(s,n)=>{scrFadeout(s,rt,n);},endTurn:s=>mnEndTurn(s,rt),battleSpriteSet:(s,...a)=>call(s,'scr_battle_sprite_set',...a),win:s=>winCombat(rt,s)};
 const draw={play:audio.play,stop:scene.stop,shakeObject:scene.shakeObject,tensionHeal:(_s:GmInstance,n:number)=>tensionHeal(rt,n)};
 const projectile:HammerProjectileScripts={...draw,...audio,playPitch:(s,...a)=>call(s,'snd_play_pitch',...a),damage:s=>damage(s,rt),triggerEvent:()=>{throw Error('Hammer event-manager bridge is not installed');},afterimage:s=>afterImage(s,rt).id};
 return {scene,draw,projectile,attack};
}
