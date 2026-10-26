import {type GmInstance,type GmObjectDef,type GmRuntime} from '../../gm/runtime';
import {eq,ge,gt,le,lt,clamp,round} from '../../gm/math';
import {C,mergeColor} from '../../gm/graphics';
import {randomTarget,mnEndTurn,monsterDefeat,winCombat} from '../../deltarune/controller';
import {bulletSpawner,moveToPointOverTime} from '../../deltarune/chapter2-battle';
import {moveHeartIn} from '../../deltarune/battle';
import {battleTextDefault} from '../../deltarune/writer';
import {scrLerpvar} from '../../deltarune/shared-effects';
import {moveTowards} from '../../deltarune/chapter3-scripts';
import {snd} from '../../deltarune/sound';
import {sourceText} from '../../host/text';
import {button1_p,pressed,KEY} from '../../deltarune/keys';
import type {HookedDef} from '../../deltarune/rules';
import {weatherEqual,weatherSprite,drawWeatherJitter} from './controller-support';
import {createWeatherSupport,weatherHelpers,type WeatherScriptHost} from './controller-support';
export function createWeatherController(object:(name:string)=>GmObjectDef,host?:WeatherScriptHost):{objects:GmObjectDef[]}{
 const {resolve,targets,balloon,heroBalloon,phase,battleSpriteSet,battleSpriteReset,speaker,peek,delayVar,initMusic,loopMusic,volume}=weatherHelpers(object,host);
const controller:HookedDef={...object('obj_elnina_lanino_controller'),hooks:{blocksControllerStep:s=>lt(s.intro,4),mixedActName:(_s,_rt,char)=>weatherEqual(char, 2)?sourceText('scr_spellmenu_setup_slash_scr_spellmenu_setup_gml_39_0'):weatherEqual(char, 3)?sourceText('scr_spellmenu_setup_slash_scr_spellmenu_setup_gml_54_0'):undefined},events:{
create:(s:GmInstance,rt:GmRuntime)=>{
const g=rt.globals,other=s;
const cameraX=()=>rt.view.x,cameraY=()=>rt.view.y;
const exists=(v:GmObjectDef|number)=>gt(targets(rt,v).length, 0),count=(v:GmObjectDef|number)=>targets(rt,v).length;
const create=(x:number,y:number,d:GmObjectDef)=>rt.create(d,x,y).id;
const createDepth=(x:number,y:number,depth:number,d:GmObjectDef)=>{const i=rt.create(d,x,y);i.depth=depth;return i.id;};
const destroy=(v:GmObjectDef|number=s.id)=>{for(const i of targets(rt,v))rt.destroy(i);},safeDelete=destroy;
const timer=(n:number)=>{if(lt(g.turntimer,n))g.turntimer=n;};
const irandom=(n:number)=>rt.random.irandom(n),irandomRange=(a:number,b:number)=>rt.random.irandomRange(a,b),choose=(...a:number[])=>a[rt.random.irandom(a.length-1)];
const region=()=>g.__region??'US',lower=(v:string)=>v.toLowerCase(),globalExists=(n:string)=>n in g;
const message=(n:number,key:string)=>{g.msgno=n;g.msg[n]=text(key);},text=(key:string)=>sourceText(key),subtext=(key:string,v:unknown)=>text(key).replace('~1',String(v));
const arrayLength=(a:unknown[])=>a.length,debugPrint=(..._args:unknown[])=>{};
const button1=()=>button1_p(rt),button3=()=>pressed(rt,KEY.c,KEY.ctrl);
const setAlpha=(n:number)=>{rt.drawState.alpha=n;},setFont=(v:string)=>{rt.drawState.font=v;},setHalign=(v:0|1|2)=>{rt.drawState.halign=v;};
const drawSprite=(sprite:string|number,...a:[number,number,number,number,number,number,number,number])=>rt.drawSprite(weatherSprite(sprite),...a);
const drawText=(x:number,y:number,v:unknown,xs:number,ys:number,angle:number,c1:number,_c2:number,_c3:number,_c4:number,alpha:number)=>{rt.drawState.color=c1;rt.drawState.alpha=alpha;rt.drawText(x,y,String(v),xs,ys,angle);};
s.rtimer = 0;
s.attacked = 0;
s.turns = 0;
s.rr = 0;
s.mytarget = 0;
s.abletotarget = 0;
s.elnina_attack = 0;
s.lanino_attack = 0;
s.calculated_forecast = false;
s.forecasts = [];
s.forecast_alpha = 0;
s.forecast_turn = 0;
s.use_celsius = !weatherEqual(lower(region()), "us");
s.sunboost = 0;
s.digit_alpha = 0;
s.digit_flash_timer = 0;
s.digit_flash_duration = 10;
s.ilovetv = 0;
s.ilovetv_increase = 0;
s.ilovetv_increased = false;
s.ilovetv_pitch = 1;
s.ilovetvlimit = true;
s.lastchosen = "";
s.umbrella = 0;
s.sunglasses = 0;
s.intro = 0;
s.introtimer = 0;
s.ralseishocked = false;
g.choice = -1;
s.talked = 0;
s.talktimer = 0;
s.balloonorder = 0;
s.ballooncon = 0;
s.balloonend = 1;
s.talkedcon = 0;
s.ralseitalks = 0;
s.susietalks = 0;
s.afterbulletcon = 0;
s.extratimer = 0;
s.extimer = 0;
s.excon = 0;
s.endcon = 0;
s.turn2_turns = 0;
s.tenna = createDepth(cameraX() + 330, cameraY() - 50, -9999999, object("obj_actor_tenna"));
resolve(rt, s.tenna).bounce = 1;
resolve(rt, s.tenna).preset = 2;
resolve(rt, s.tenna).sprite = "spr_tenna_point_left";
speaker(s, rt, "tenna");
g.fc = 22;
s.instafinalattack = false;
if (weatherEqual(s.instafinalattack, true))
{
    s.turns = 6;
}
s.battleresult = 0;
s.battlemsg_set = false;
if (!globalExists("elninalosscount"))
{
    g.elninalosscount = 0;
}
else
{
    g.elninalosscount++;
}
},
step:(s:GmInstance,rt:GmRuntime)=>{
const g=rt.globals,other=s;
const cameraX=()=>rt.view.x,cameraY=()=>rt.view.y;
const exists=(v:GmObjectDef|number)=>gt(targets(rt,v).length, 0),count=(v:GmObjectDef|number)=>targets(rt,v).length;
const create=(x:number,y:number,d:GmObjectDef)=>rt.create(d,x,y).id;
const createDepth=(x:number,y:number,depth:number,d:GmObjectDef)=>{const i=rt.create(d,x,y);i.depth=depth;return i.id;};
const destroy=(v:GmObjectDef|number=s.id)=>{for(const i of targets(rt,v))rt.destroy(i);},safeDelete=destroy;
const timer=(n:number)=>{if(lt(g.turntimer,n))g.turntimer=n;};
const irandom=(n:number)=>rt.random.irandom(n),irandomRange=(a:number,b:number)=>rt.random.irandomRange(a,b),choose=(...a:number[])=>a[rt.random.irandom(a.length-1)];
const region=()=>g.__region??'US',lower=(v:string)=>v.toLowerCase(),globalExists=(n:string)=>n in g;
const message=(n:number,key:string)=>{g.msgno=n;g.msg[n]=text(key);},text=(key:string)=>sourceText(key),subtext=(key:string,v:unknown)=>text(key).replace('~1',String(v));
const arrayLength=(a:unknown[])=>a.length,debugPrint=(..._args:unknown[])=>{};
const button1=()=>button1_p(rt),button3=()=>pressed(rt,KEY.c,KEY.ctrl);
const setAlpha=(n:number)=>{rt.drawState.alpha=n;},setFont=(v:string)=>{rt.drawState.font=v;},setHalign=(v:0|1|2)=>{rt.drawState.halign=v;};
const drawSprite=(sprite:string|number,...a:[number,number,number,number,number,number,number,number])=>rt.drawSprite(weatherSprite(sprite),...a);
const drawText=(x:number,y:number,v:unknown,xs:number,ys:number,angle:number,c1:number,_c2:number,_c3:number,_c4:number,alpha:number)=>{rt.drawState.color=c1;rt.drawState.alpha=alpha;rt.drawText(x,y,String(v),xs,ys,angle);};
if (exists(object("obj_board_event_ninfight")) && weatherEqual(resolve(rt, object("obj_board_event_ninfight")).retry, 1))
{
    if (weatherEqual(s.intro, 0))
{
        s.introtimer++;
        if (weatherEqual(s.introtimer, 10))
{
            resolve(rt, s.tenna).preset = 2;
            resolve(rt, s.tenna).reversal = 0;
            resolve(rt, s.tenna).vspeed = -31;
            resolve(rt, s.tenna).imageXscale = -2;
            resolve(rt, s.tenna).x = cameraX() + 420;
            resolve(rt, s.tenna).y = cameraY() + 620;
            resolve(rt, s.tenna).depth = s.depth - 10;
}
        if (weatherEqual(s.introtimer, 21))
{
            s.introtimer = 0;
            s.intro = 0.1;
            s.talked = 0.1;
            g.charturn = 3;
            resolve(rt, s.tenna).vspeed = 0;
            snd(rt, "snd_impact");
            create(s.x, s.y, object("obj_shake"));
            g.fc = 22;
            g.typer = 81;
            message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_44_0");
for (const __target of targets(rt, balloon(s, rt, resolve(rt, s.tenna).x - 56, resolve(rt, s.tenna).y - 140, 10))) { const __caller = s; { const other = __caller; const s = __target;
}}
            resolve(rt, s.myblcon).depth = s.depth - 10;
}
}
    if (weatherEqual(s.intro, 0.1) && !exists(object("obj_writer")))
{
        g.fc = 22;
        g.typer = 81;
        message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_54_0");
for (const __target of targets(rt, balloon(s, rt, resolve(rt, s.tenna).x - 56, resolve(rt, s.tenna).y - 140, 10))) { const __caller = s; { const other = __caller; const s = __target;
}}
        s.intro = 0.11;
}
    if (weatherEqual(s.intro, 0.11) && !exists(object("obj_writer")))
{
        g.fc = 22;
        g.typer = 81;
        message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_63_0");
for (const __target of targets(rt, balloon(s, rt, resolve(rt, s.tenna).x - 56, resolve(rt, s.tenna).y - 140, 10))) { const __caller = s; { const other = __caller; const s = __target;
}}
        s.intro = 0.12;
}
    if (weatherEqual(s.intro, 0.12) && !exists(object("obj_writer")))
{
        message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_69_0");
for (const __target of targets(rt, balloon(s, rt, resolve(rt, s.tenna).x - 56, resolve(rt, s.tenna).y - 140, 10))) { const __caller = s; { const other = __caller; const s = __target;
}}
        s.intro = 0.13;
}
    if (weatherEqual(s.intro, 0.13) && !exists(object("obj_writer")))
{
        resolve(rt, s.tenna).vspeed = 50;
        s.intro = 1;
}
}
else
{
    if (weatherEqual(s.intro, 0))
{
        s.introtimer++;
        if (weatherEqual(s.introtimer, 10))
{
            resolve(rt, s.tenna).preset = 2;
            resolve(rt, s.tenna).reversal = 0;
            resolve(rt, s.tenna).vspeed = -31;
            resolve(rt, s.tenna).imageXscale = -2;
            resolve(rt, s.tenna).x = cameraX() + 420;
            resolve(rt, s.tenna).y = cameraY() + 620;
            resolve(rt, s.tenna).depth = s.depth - 10;
}
        if (weatherEqual(s.introtimer, 21))
{
            s.introtimer = 0;
            s.intro = 0.1;
            s.talked = 0.1;
            g.charturn = 3;
            resolve(rt, s.tenna).vspeed = 0;
            snd(rt, "snd_impact");
            create(s.x, s.y, object("obj_shake"));
            g.fc = 22;
            g.typer = 81;
            message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_35_0");
for (const __target of targets(rt, balloon(s, rt, resolve(rt, s.tenna).x - 56, resolve(rt, s.tenna).y - 140, 10))) { const __caller = s; { const other = __caller; const s = __target;
}}
            resolve(rt, s.myblcon).depth = s.depth - 10;
}
}
    if (weatherEqual(s.intro, 0.1) && !exists(object("obj_writer")))
{
        g.fc = 22;
        g.typer = 81;
        message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_45_0");
for (const __target of targets(rt, balloon(s, rt, resolve(rt, s.tenna).x - 56, resolve(rt, s.tenna).y - 140, 10))) { const __caller = s; { const other = __caller; const s = __target;
}}
        s.intro = 0.2;
}
    if (ge(s.intro, 0.2) && weatherEqual(s.ralseishocked, false))
{
        s.extimer++;
        if (weatherEqual(s.extimer, 24) || weatherEqual(s.introtimer, 5))
{
            battleSpriteSet(s, rt, "ralsei", "spr_ralsei_shocked_right", 0, 0);
            if (exists(object("obj_heroralsei")))
{
                resolve(rt, object("obj_heroralsei")).x += 30;
}
            s.ralseishocked = true;
}
}
    if (weatherEqual(s.intro, 0.2) && !exists(object("obj_writer")))
{
        s.intro = 0.3;
}
    if (weatherEqual(s.intro, 0.3))
{
        s.introtimer++;
        if (weatherEqual(s.introtimer, 6))
{
            message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_62_0");
            g.typer = 74;
            let heroballoon = balloon(s, rt, resolve(rt, object("obj_heroralsei")).x + 50, resolve(rt, object("obj_heroralsei")).y + 40, 10);
            resolve(rt, heroballoon).side = -1;
            resolve(rt, s.tenna).vspeed = 50;
}
        if (weatherEqual(s.introtimer, 24))
{
            s.intro = 1;
}
}
}
if (weatherEqual(s.intro, 1))
{
    g.batmusic[0] = initMusic(s, rt, "rudebuster_boss.ogg");
    g.batmusic[1] = loopMusic(s, rt, g.batmusic[0], 0.7, 1);
for (const __target of targets(rt, object("obj_writer"))) { const __caller = s; { const other = __caller; const s = __target;
        destroy(s.id);
}}
    g.charturn = 0;
    s.talked = 0;
    s.intro = 4;
    speaker(s, rt, "tenna");
    g.typer = 80;
    g.fc = 22;
    battleSpriteReset(s, rt, "ralsei");
    if (exists(object("obj_heroralsei")))
{
        resolve(rt, object("obj_heroralsei")).x -= 30;
}
}
if (gt(s.ilovetv_increase, 0) && weatherEqual(s.digit_flash_timer, 0))
{
    if (lt(s.ilovetv, 99))
{
        s.ilovetv_increased = true;
        if (lt(s.ilovetv, 98))
{
            snd(rt, "snd_scissorbell", s.ilovetv_pitch);
}
        else
{
            snd(rt, "snd_sparkle_glock");
}
        if (weatherEqual(s.ilovetv_increase, 99))
{
            s.ilovetv += 1;
            s.ilovetv = Math.min(s.ilovetv, 99);
            s.ilovetv_pitch = 1 + (s.ilovetv / 100);
}
        else
{
            s.ilovetv++;
            if (weatherEqual(s.ilovetvlimit, true) && weatherEqual(s.ilovetv, 40))
{
                s.ilovetv = 30;
}
            s.ilovetv_increase--;
            s.ilovetv_pitch += 0.1;
}
        s.digit_flash_timer = s.digit_flash_duration;
}
    if (weatherEqual(s.ilovetv_increase, 0))
{
        s.ilovetv_pitch = 1;
}
}
if (phase(s, rt, "menu"))
{
    if (!s.calculated_forecast)
{
        s.turn2_turns++;
        if (gt(s.ilovetv, 0))
{
            if (gt(s.turn2_turns, 2) && lt(s.turns, 2))
{
                s.turns = 2;
}
}
        else if (gt(s.turns, 1) && weatherEqual(s.ilovetv, 0) && lt(s.turn2_turns, 7))
{
            s.turns = 0;
}
        s.ilovetv_increased = false;
        s.forecast_turn = s.turns;
        let _sun = 783;
        let _moon = 1474;
        let _rain = 4256;
        let _snow = 1650;
        let _hale = 14;
        let _temp_min = 50;
        let _temp_max = 60;
        switch (s.forecast_turn)
{
            case 0:
                s.forecasts[0] = [irandomRange(_temp_min, _temp_max), _moon, _snow];
                s.forecasts[1] = [irandomRange(_temp_min, _temp_max), _moon, _snow];
                s.forecasts[2] = [irandomRange(_temp_min, _temp_max), _moon, _snow];
                break;
            case 1:
                s.forecasts[0] = [irandomRange(_temp_min, _temp_max), _sun, _rain];
                s.forecasts[1] = [irandomRange(_temp_min, _temp_max), _sun, _rain];
                s.forecasts[2] = [irandomRange(_temp_min, _temp_max), _sun, _rain];
                break;
            case 2:
                s.forecasts[0] = [irandomRange(_temp_min, _temp_max), _moon, _rain];
                s.forecasts[1] = [irandomRange(_temp_min, _temp_max), _moon, _rain];
                s.forecasts[2] = [irandomRange(_temp_min, _temp_max), _moon, _rain];
                break;
            default:
                if (weatherEqual(s.lastchosen, "lanino"))
{
                    _temp_min = 80 + ((s.forecast_turn - 3) * 100);
                    _temp_max = 89 + ((s.forecast_turn - 3) * 100);
}
                else
{
                    _temp_min = 40 - ((s.forecast_turn - 3) * 30);
                    _temp_max = 50 - ((s.forecast_turn - 3) * 30);
}
                if (weatherEqual(choose(0, 1), 1))
{
                    s.forecasts[0] = [irandomRange(_temp_min, _temp_max), _sun, _snow];
                    s.forecasts[1] = [irandomRange(_temp_min, _temp_max), _sun, _snow];
                    s.forecasts[2] = [irandomRange(_temp_min, _temp_max), _sun, _snow];
}
                else
{
                    s.forecasts[0] = [irandomRange(_temp_min, _temp_max), _moon, _rain];
                    s.forecasts[1] = [irandomRange(_temp_min, _temp_max), _moon, _rain];
                    s.forecasts[2] = [irandomRange(_temp_min, _temp_max), _moon, _rain];
}
                break;
}
        s.calculated_forecast = true;
}
}
let lanino = object("obj_lanino_enemy");
let elnina = object("obj_elnina_enemy");
let _lanino_favored = (weatherEqual(s.lastchosen, "") && gt(s.sunboost, 0)) || weatherEqual(s.lastchosen, "lanino");
let _sun_atk = 68;
let _moon_atk = 69;
let _snow_atk = 70;
let _rain_atk = 71;
if (phase(s, rt, "enemytalk") && weatherEqual(s.talked, 0) && !exists(object("obj_rouxls_ch3_enemy")))
{
    randomTarget(s, rt);
    if (!exists(object("obj_darkener")))
{
        create(0, 0, object("obj_darkener"));
}
    s.talked = 1;
    s.attacked = 0;
    s.ballooncon = 0;
    s.balloonsubcon = 0;
    s.balloonend = 1;
    s.talkedcon = 0;
    s.ralseitalks = 0;
    s.susietalks = 0;
    s.attackdone = 0;
    s.spadepower = 0;
    s.yarnendturn = 0;
    s.elnina_attack = 0;
    s.lanino_attack = 0;
    s.calculated_forecast = false;
    s.battlemsg_set = false;
    s.turns += 1;
    if (gt(s.ilovetv, 0) && gt(s.turn2_turns, 2) && lt(s.turns, 3))
{
        s.turns = 3;
}
    g.typer = 50;
    if (lt(s.turns, 4))
{
        message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_347_0");
        balloon(s, rt, resolve(rt, lanino).x - 10, g.monstery[resolve(rt, lanino).myself] - 10, 10);
        message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_350_0");
        balloon(s, rt, resolve(rt, elnina).x - 10, g.monstery[resolve(rt, elnina).myself] - 10, 10);
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
            s.talking = true;
            s.pose = 1;
}}
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
            s.talking = true;
            s.pose = 1;
}}
        s.ballooncon = s.turns;
        if (weatherEqual(s.turns, 3))
{
            if (!weatherEqual(s.sunboost, 0))
{
                if (_lanino_favored)
{
                    s.ballooncon = 3;
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                        s.pose = 0;
}}
}
                else
{
                    s.ballooncon = 8;
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                        s.pose = 0;
}}
}
}
            else
{
                s.ballooncon = 2;
}
}
        s.balloonend = 0;
}
    if (weatherEqual(s.turns, 4))
{
        message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_371_0");
        if (_lanino_favored)
{
            balloon(s, rt, resolve(rt, lanino).x - 10, g.monstery[resolve(rt, lanino).myself] - 10, 10);
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                s.pose = 1;
}}
            resolve(rt, lanino).head = 1271;
}
        else
{
            balloon(s, rt, resolve(rt, elnina).x - 10, g.monstery[resolve(rt, elnina).myself] - 10, 10);
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                s.pose = 1;
}}
            resolve(rt, elnina).head = 4846;
}
        message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_375_0");
        if (_lanino_favored)
{
            balloon(s, rt, resolve(rt, elnina).x - 10, g.monstery[resolve(rt, elnina).myself] - 10, 10);
            resolve(rt, elnina).head = 4436;
}
        else
{
            balloon(s, rt, resolve(rt, lanino).x - 10, g.monstery[resolve(rt, lanino).myself] - 10, 10);
            resolve(rt, lanino).head = 3264;
}
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
            s.talking = true;
}}
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
            s.talking = true;
}}
        if (_lanino_favored)
{
            s.ballooncon = 13;
}
        else
{
            s.ballooncon = 14;
}
        s.balloonend = 0;
}
    if (weatherEqual(s.turns, 5))
{
        message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_388_0");
        if (_lanino_favored)
{
            balloon(s, rt, resolve(rt, lanino).x - 10, g.monstery[resolve(rt, lanino).myself] - 10, 10);
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                s.talking = true;
                s.pose = 1;
}}
            resolve(rt, lanino).head = 1271;
}
        else
{
            balloon(s, rt, resolve(rt, elnina).x - 10, g.monstery[resolve(rt, elnina).myself] - 10, 10);
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                s.talking = true;
                s.pose = 1;
}}
            resolve(rt, elnina).head = 4846;
}
        message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_392_0");
        if (_lanino_favored)
{
            balloon(s, rt, resolve(rt, elnina).x - 10, g.monstery[resolve(rt, elnina).myself] - 10, 10);
            resolve(rt, elnina).head = 871;
}
        else
{
            balloon(s, rt, resolve(rt, lanino).x - 10, g.monstery[resolve(rt, lanino).myself] - 10, 10);
            resolve(rt, lanino).head = 4531;
}
        if (_lanino_favored)
{
            s.ballooncon = 15;
}
        else
{
            s.ballooncon = 16;
}
        s.balloonend = 0;
}
    if (weatherEqual(s.turns, 6))
{
        if (_lanino_favored)
{
            message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_403_0");
}
        else
{
            message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_404_0");
}
        if (_lanino_favored)
{
            balloon(s, rt, resolve(rt, lanino).x - 10, g.monstery[resolve(rt, lanino).myself] - 10, 10);
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                s.talking = true;
                s.pose = 1;
}}
            resolve(rt, lanino).head = 679;
}
        else
{
            balloon(s, rt, resolve(rt, elnina).x - 10, g.monstery[resolve(rt, elnina).myself] - 10, 10);
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                s.talking = true;
                s.pose = 1;
}}
            resolve(rt, elnina).head = 1196;
}
        message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_408_0");
        if (_lanino_favored)
{
            balloon(s, rt, resolve(rt, elnina).x - 10, g.monstery[resolve(rt, elnina).myself] - 10, 10);
            resolve(rt, elnina).head = 4436;
}
        else
{
            balloon(s, rt, resolve(rt, lanino).x - 10, g.monstery[resolve(rt, lanino).myself] - 10, 10);
            resolve(rt, lanino).head = 3264;
}
        s.ballooncon = 17;
        s.balloonend = 0;
}
    if (weatherEqual(s.turns, 7))
{
        if (_lanino_favored)
{
            message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_419_0");
            s.lanino_attack = _sun_atk;
            s.elnina_attack = 0;
}
        else
{
            message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_425_0");
            s.lanino_attack = _snow_atk;
            s.elnina_attack = 0;
}
        if (_lanino_favored)
{
            balloon(s, rt, resolve(rt, lanino).x - 10, g.monstery[resolve(rt, lanino).myself] - 10, 10);
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                s.talking = true;
                s.pose = 2;
}}
            resolve(rt, lanino).head = 679;
}
        else
{
            balloon(s, rt, resolve(rt, elnina).x - 10, g.monstery[resolve(rt, elnina).myself] - 10, 10);
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                s.talking = true;
                s.pose = 2;
}}
            resolve(rt, elnina).head = 1196;
}
        s.balloonend = 0;
        s.ballooncon = 1.1;
}
    if (weatherEqual(s.turns, 3) || gt(s.turns, 4))
{
        resolve(rt, object("obj_battlecontroller")).noreturn = 1;
}
    if (weatherEqual(s.ralseitalks, 1) && exists(object("obj_heroralsei")))
{
        g.typer = 74;
        balloon(s, rt, resolve(rt, object("obj_heroralsei")).x + 75, resolve(rt, object("obj_heroralsei")).y + 15, 7);
        peek(s, rt, object("obj_heroralsei"));
}
    else if (weatherEqual(s.susietalks, 1) && exists(object("obj_herosusie")))
{
        g.typer = 75;
        balloon(s, rt, resolve(rt, object("obj_herosusie")).x + 75, resolve(rt, object("obj_herosusie")).y + 15, 7);
        peek(s, rt, object("obj_herosusie"));
}
    s.ralseitalks = 0;
    s.susietalks = 0;
    if (weatherEqual(s.balloonend, 1))
{
        s.talked = 0.5;
        s.talktimer = 0;
        s.alarm[6] = 1;
}
    else
{
        s.talked = 0.6;
        s.talktimer = 0;
}
    s.rtimer = 0;
}
if (weatherEqual(s.talked, 0.5))
{
    s.talktimer++;
    if (((button3() || button1()) && gt(s.talktimer, 15)) || !exists(object("obj_writer")))
{
for (const __target of targets(rt, object("obj_writer"))) { const __caller = s; { const other = __caller; const s = __target;
            destroy(s.id);
}}
        s.alarm[6] = 1;
}
}
if (weatherEqual(s.talked, 0.6))
{
    let _forecast = s.forecasts[0];
    let _laninobulletsprite = _forecast[1];
    let _elninabullesprite = _forecast[2];
    s.talktimer++;
    if ((button3() && gt(s.talktimer, 15)) || (!exists(object("obj_writer")) && !weatherEqual(s.ballooncon, 3.5) && !weatherEqual(s.ballooncon, 8.5)) || (weatherEqual(count(object("obj_writer")), 1) && (weatherEqual(s.ballooncon, 1.2) || weatherEqual(s.ballooncon, 17) || weatherEqual(s.ballooncon, 16) || weatherEqual(s.ballooncon, 15) || weatherEqual(s.ballooncon, 14) || weatherEqual(s.ballooncon, 13))) || (weatherEqual(s.ballooncon, 3.5) && gt(s.talktimer, 60)) || (weatherEqual(s.ballooncon, 8.5) && gt(s.talktimer, 60)))
{
for (const __target of targets(rt, object("obj_writer"))) { const __caller = s; { const other = __caller; const s = __target;
            destroy(s.id);
}}
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
            s.talking = false;
}}
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
            s.talking = false;
}}
        if (weatherEqual(s.ballooncon, 1))
{
            s.lanino_attack = _moon_atk;
            s.elnina_attack = _snow_atk;
            message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_499_0");
            balloon(s, rt, resolve(rt, lanino).x - 40, g.monstery[resolve(rt, lanino).myself] - 10, 10);
            message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_502_0");
            balloon(s, rt, resolve(rt, elnina).x - 40, g.monstery[resolve(rt, elnina).myself] - 10, 10);
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                s.talking = true;
                s.pose = 2;
}}
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                s.talking = true;
                s.pose = 2;
}}
            snd(rt, "snd_impact");
            s.ballooncon = 1.2;
}
        else if (weatherEqual(s.ballooncon, 1.1))
{
            s.ballooncon = 0;
            s.balloonend = 1;
}
        else if (weatherEqual(s.ballooncon, 1.2))
{
            s.ballooncon = 0;
            s.balloonend = 1;
}
        else if (weatherEqual(s.ballooncon, 2))
{
            s.lanino_attack = _sun_atk;
            s.elnina_attack = _rain_atk;
            if (weatherEqual(s.turns, 3))
{
                s.lanino_attack = _moon_atk;
                message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_532_0");
}
            else
{
                message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_534_0");
}
            balloon(s, rt, resolve(rt, lanino).x - 40, g.monstery[resolve(rt, lanino).myself] - 10, 10);
            message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_537_0");
            balloon(s, rt, resolve(rt, elnina).x - 40, g.monstery[resolve(rt, elnina).myself] - 10, 10);
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                s.talking = true;
                s.pose = 2;
}}
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                s.talking = true;
                s.pose = 2;
}}
            snd(rt, "snd_impact");
            s.ballooncon = 1.2;
}
        else if (weatherEqual(s.ballooncon, 3))
{
            s.lanino_attack = _moon_atk;
            s.elnina_attack = _rain_atk;
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                s.pose = 2;
}}
            snd(rt, "snd_impact");
            s.ballooncon = 3.5;
            s.balloonend = 0;
}
        else if (weatherEqual(s.ballooncon, 3.5))
{
            message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_561_0");
            balloon(s, rt, resolve(rt, elnina).x - 10, g.monstery[resolve(rt, elnina).myself] - 10, 10);
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                s.talking = true;
}}
            s.ballooncon = 4;
            s.balloonend = 0;
}
        else if (weatherEqual(s.ballooncon, 4))
{
            message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_572_0");
            balloon(s, rt, resolve(rt, lanino).x - 10, g.monstery[resolve(rt, lanino).myself] - 10, 10);
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                s.talking = true;
                s.pose = 3;
                s.head = 2741;
                s.chest = 1010;
                scrLerpvar(s, rt, "chestindex", 0, 3, 20);
                delayVar(s, rt, "chest", 3079, 30);
                delayVar(s, rt, "pose", 0, 30);
}}
            s.ballooncon = 5;
            s.balloonend = 0;
}
        else if (weatherEqual(s.ballooncon, 5))
{
            message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_589_0");
            balloon(s, rt, resolve(rt, lanino).x - 10, g.monstery[resolve(rt, lanino).myself] - 10, 10);
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                s.talking = true;
}}
            s.ballooncon = 6;
            s.balloonend = 0;
}
        else if (weatherEqual(s.ballooncon, 6))
{
            message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_599_0");
            balloon(s, rt, resolve(rt, elnina).x - 10, g.monstery[resolve(rt, elnina).myself] - 10, 10);
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                s.talking = true;
}}
            s.ballooncon = 7;
            s.balloonend = 0;
}
        else if (weatherEqual(s.ballooncon, 7))
{
            message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_609_0");
            balloon(s, rt, resolve(rt, lanino).x - 10, g.monstery[resolve(rt, lanino).myself] - 10, 10);
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                s.talking = true;
}}
            s.ballooncon = 1.1;
}
        else if (weatherEqual(s.ballooncon, 8))
{
            s.lanino_attack = _moon_atk;
            s.elnina_attack = _rain_atk;
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                s.pose = 2;
}}
            snd(rt, "snd_impact");
            s.ballooncon = 8.5;
            s.balloonend = 0;
}
        else if (weatherEqual(s.ballooncon, 8.5))
{
            message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_633_0");
            balloon(s, rt, resolve(rt, lanino).x - 10, g.monstery[resolve(rt, lanino).myself] - 10, 10);
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                s.talking = true;
}}
            s.ballooncon = 9;
            s.balloonend = 0;
}
        else if (weatherEqual(s.ballooncon, 9))
{
            message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_644_0");
            balloon(s, rt, resolve(rt, elnina).x - 10, g.monstery[resolve(rt, elnina).myself] - 10, 10);
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                s.talking = true;
                s.pose = 3;
                s.head = 4213;
                s.rightarm = 1888;
                scrLerpvar(s, rt, "rightarmindex", 0, 3, 20);
                delayVar(s, rt, "rightarm", 1641, 30);
                delayVar(s, rt, "pose", 0, 30);
}}
            s.ballooncon = 10;
            s.balloonend = 0;
}
        else if (weatherEqual(s.ballooncon, 10))
{
            message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_661_0");
            balloon(s, rt, resolve(rt, elnina).x - 10, g.monstery[resolve(rt, elnina).myself] - 10, 10);
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                s.talking = true;
}}
            s.ballooncon = 11;
            s.balloonend = 0;
}
        else if (weatherEqual(s.ballooncon, 11))
{
            message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_671_0");
            balloon(s, rt, resolve(rt, lanino).x - 10, g.monstery[resolve(rt, lanino).myself] - 10, 10);
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                s.talking = true;
}}
            s.ballooncon = 12;
            s.balloonend = 0;
}
        else if (weatherEqual(s.ballooncon, 12))
{
            message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_681_0");
            balloon(s, rt, resolve(rt, elnina).x - 10, g.monstery[resolve(rt, elnina).myself] - 10, 10);
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                s.talking = true;
}}
            s.ballooncon = 1.1;
}
        else if (weatherEqual(s.ballooncon, 13))
{
            if (weatherEqual(_laninobulletsprite, 1474))
{
                s.lanino_attack = _moon_atk;
                message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_687_0");
}
            if (weatherEqual(_laninobulletsprite, 783))
{
                s.lanino_attack = _sun_atk;
                message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_688_0");
}
            if (weatherEqual(_elninabullesprite, 4256))
{
                s.elnina_attack = _rain_atk;
}
            if (weatherEqual(_elninabullesprite, 1650))
{
                s.elnina_attack = _snow_atk;
}
            balloon(s, rt, resolve(rt, lanino).x - 10, g.monstery[resolve(rt, lanino).myself] - 10, 10);
            resolve(rt, lanino).head = 679;
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                s.talking = true;
                s.pose = 2;
}}
            snd(rt, "snd_impact");
            s.ballooncon = 1.1;
}
        else if (weatherEqual(s.ballooncon, 14))
{
            if (weatherEqual(_laninobulletsprite, 1474))
{
                s.lanino_attack = _moon_atk;
}
            if (weatherEqual(_laninobulletsprite, 783))
{
                s.lanino_attack = _sun_atk;
}
            if (weatherEqual(_elninabullesprite, 4256))
{
                s.elnina_attack = _rain_atk;
                message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_707_0");
}
            if (weatherEqual(_elninabullesprite, 1650))
{
                s.elnina_attack = _snow_atk;
                message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_708_0");
}
            balloon(s, rt, resolve(rt, elnina).x - 10, g.monstery[resolve(rt, elnina).myself] - 10, 10);
            resolve(rt, elnina).head = 1196;
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                s.talking = true;
                s.pose = 2;
}}
            snd(rt, "snd_impact");
            s.ballooncon = 1.1;
}
        else if (weatherEqual(s.ballooncon, 15))
{
            if (weatherEqual(_laninobulletsprite, 1474))
{
                s.lanino_attack = _moon_atk;
                message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_721_0");
}
            if (weatherEqual(_laninobulletsprite, 783))
{
                s.lanino_attack = _sun_atk;
                message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_722_0");
}
            if (weatherEqual(_elninabullesprite, 4256))
{
                s.elnina_attack = _rain_atk;
}
            if (weatherEqual(_elninabullesprite, 1650))
{
                s.elnina_attack = _snow_atk;
}
            balloon(s, rt, resolve(rt, lanino).x - 10, g.monstery[resolve(rt, lanino).myself] - 10, 10);
            resolve(rt, lanino).head = 679;
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                s.talking = true;
                s.pose = 2;
}}
            snd(rt, "snd_impact");
            s.ballooncon = 1.1;
}
        else if (weatherEqual(s.ballooncon, 16))
{
            if (weatherEqual(_laninobulletsprite, 1474))
{
                s.lanino_attack = _moon_atk;
}
            if (weatherEqual(_laninobulletsprite, 783))
{
                s.lanino_attack = _sun_atk;
}
            if (weatherEqual(_elninabullesprite, 4256))
{
                s.elnina_attack = _rain_atk;
                message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_741_0");
}
            if (weatherEqual(_elninabullesprite, 1650))
{
                s.elnina_attack = _snow_atk;
                message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_742_0");
}
            balloon(s, rt, resolve(rt, elnina).x - 10, g.monstery[resolve(rt, elnina).myself] - 10, 10);
            resolve(rt, elnina).head = 1196;
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                s.talking = true;
                s.pose = 2;
}}
            snd(rt, "snd_impact");
            s.ballooncon = 1.1;
}
        else if (weatherEqual(s.ballooncon, 17))
{
            if (_lanino_favored)
{
                s.lanino_attack = _sun_atk;
                s.elnina_attack = 0;
                message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_763_0");
                balloon(s, rt, resolve(rt, lanino).x - 10, g.monstery[resolve(rt, lanino).myself] - 10, 10);
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                    s.talking = true;
                    s.pose = 2;
}}
}
            else
{
                s.lanino_attack = 0;
                s.elnina_attack = _rain_atk;
                message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_771_0");
                balloon(s, rt, resolve(rt, elnina).x - 10, g.monstery[resolve(rt, elnina).myself] - 10, 10);
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                    s.talking = true;
                    s.pose = 2;
}}
}
            s.ballooncon = 1.1;
}
        s.talked = 0.7;
        g.typer = 50;
        if (weatherEqual(s.ralseitalks, 1) && exists(object("obj_heroralsei")))
{
            g.typer = 74;
            heroBalloon(s, rt, "ralsei");
            peek(s, rt, object("obj_heroralsei"));
}
        else if (weatherEqual(s.susietalks, 1) && exists(object("obj_herosusie")))
{
            g.typer = 75;
            heroBalloon(s, rt, "susie");
            peek(s, rt, object("obj_herosusie"));
}
        s.ralseitalks = 0;
        s.susietalks = 0;
        s.alarm[6] = 1;
}
}
if (weatherEqual(s.talked, 1) && phase(s, rt, "enemytalk") && !exists(object("obj_writer")))
{
    g.mnfight = 1.5;
}
if (weatherEqual(g.mnfight, 1.5) && !exists(object("obj_rouxls_ch3_enemy")))
{
    if (!exists(object("obj_growtangle")))
{
        if (lt(s.turns, 7))
{
            create(cameraX() + 320, cameraY() + 170, object("obj_growtangle"));
}
        if (weatherEqual(s.turns, 7))
{
            create(cameraX() + 320, cameraY() + 190, object("obj_growtangle"));
}
}
    if (!exists(object("obj_moveheart")))
{
        moveHeartIn(rt);
}
    g.mnfight = 2;
    timer(90);
    s.ballooncon = -1;
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
        s.talking = false;
        s.pose = 0;
}}
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
        s.talking = false;
        s.pose = 0;
}}
}
if (phase(s, rt, "bullets") && weatherEqual(s.attacked, 0) && !exists(object("obj_rouxls_ch3_enemy")))
{
    s.rtimer += 1;
    if (weatherEqual(s.rtimer, 12))
{
        let sunboost_save = s.sunboost;
        s.sunboost = 0;
        if (weatherEqual(g.choice, 0))
{
            if (weatherEqual(other.turns, 4))
{
                s.sunboost = -1;
}
            if (weatherEqual(other.turns, 5))
{
                s.sunboost = -2;
}
            if (weatherEqual(other.turns, 6))
{
                s.sunboost = -3;
}
            if (weatherEqual(other.turns, 7))
{
                s.sunboost = -4;
}
}
        if (weatherEqual(g.choice, 1))
{
            if (weatherEqual(other.turns, 4))
{
                s.sunboost = 1;
}
            if (weatherEqual(other.turns, 5))
{
                s.sunboost = 2;
}
            if (weatherEqual(other.turns, 6))
{
                s.sunboost = 3;
}
            if (weatherEqual(other.turns, 7))
{
                s.sunboost = 4;
}
}
        let _a = 380;
        if (!exists(object("obj_lanino_enemy")))
{
            _a = 947;
}
for (const __target of targets(rt, _a)) { const __caller = s; { const other = __caller; const s = __target;
            s.dc = bulletSpawner(s, rt, s.x, s.y, object("obj_dbulletcontroller")).id;
            resolve(rt, s.dc).type = 130;
            if (weatherEqual(other.turns, 0))
{
                resolve(rt, s.dc).special = 0;
}
            if (weatherEqual(other.turns, 1))
{
                resolve(rt, s.dc).special = 0;
}
            if (weatherEqual(other.turns, 2))
{
                resolve(rt, s.dc).special = 0;
}
            if (weatherEqual(other.turns, 3))
{
                resolve(rt, s.dc).special = 1;
}
            if (weatherEqual(other.turns, 4))
{
                resolve(rt, s.dc).special = 2;
}
            if (weatherEqual(other.turns, 5))
{
                resolve(rt, s.dc).special = 3;
}
            if (weatherEqual(other.turns, 6))
{
                resolve(rt, s.dc).special = 3;
}
            if (weatherEqual(other.turns, 7))
{
                resolve(rt, s.dc).special = 4;
}
            if (_lanino_favored)
{
                resolve(rt, s.dc).side = 0;
}
            else
{
                resolve(rt, s.dc).side = 1;
}
}}
        s.sunboost = sunboost_save;
        if (lt(s.turns, 5))
{
            timer(260);
}
        if (weatherEqual(s.turns, 5))
{
            timer(275);
}
        if (weatherEqual(s.turns, 6))
{
            timer(275);
}
        if (weatherEqual(s.turns, 7))
{
            timer(850);
}
        g.typer = 6;
        g.fc = 0;
        s.attacked = 1;
        s.talked = 0;
        s.balloonend = 0;
        s.ballooncon = -1;
}
}
if (phase(s, rt, "bullets") && lt(g.turntimer, 1) && weatherEqual(s.battlemsg_set, false))
{
    s.battlemsg_set = true;
    if (weatherEqual(s.turns, 1))
{
        speaker(s, rt, "tenna");
        g.fc = 22;
        g.battlemsg[0] = text("obj_elnina_lanino_controller_slash_Step_0_gml_807_0");
}
    if (weatherEqual(s.turns, 2))
{
        speaker(s, rt, "tenna");
        g.fc = 22;
        g.battlemsg[0] = subtext("obj_elnina_lanino_controller_slash_Step_0_gml_813_0", s.ilovetv);
}
    if (weatherEqual(s.turns, 3))
{
}
    if (weatherEqual(s.turns, 4))
{
        speaker(s, rt, "tenna");
        g.fc = 22;
        g.battlemsg[0] = text("obj_elnina_lanino_controller_slash_Step_0_gml_823_0");
}
    if (weatherEqual(s.turns, 5))
{
        speaker(s, rt, "rouxls");
        g.battlemsg[0] = text("obj_elnina_lanino_controller_slash_Step_0_gml_828_0");
}
    if (weatherEqual(s.turns, 6))
{
        speaker(s, rt, "tenna");
        g.fc = 22;
        g.battlemsg[0] = text("obj_elnina_lanino_controller_slash_Step_0_gml_834_0");
}
}
if (weatherEqual(s.turns, 4) && gt(g.turntimer, 0))
{
    s.extratimer++;
}
if (weatherEqual(s.extratimer, 39))
{
    if (!_lanino_favored)
{
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
            moveToPointOverTime(s, rt, s.xstart + 70, s.y, 10);
}}
}
}
if (weatherEqual(s.extratimer, 50))
{
    g.typer = 50;
    if (_lanino_favored)
{
        message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_914_0");
        balloon(s, rt, resolve(rt, elnina).x - 10, g.monstery[resolve(rt, elnina).myself] + 25, 10);
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
            s.talking = true;
}}
        resolve(rt, elnina).head = 871;
}
    else
{
        message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_919_0");
        balloon(s, rt, resolve(rt, lanino).x - 10, g.monstery[resolve(rt, lanino).myself] - 35, 10);
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
            s.talking = true;
}}
        resolve(rt, lanino).head = 4531;
}
}
if (weatherEqual(s.extratimer, 100))
{
    g.typer = 50;
for (const __target of targets(rt, object("obj_writer"))) { const __caller = s; { const other = __caller; const s = __target;
        destroy(s.id);
}}
    if (_lanino_favored)
{
        message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_929_0");
        balloon(s, rt, resolve(rt, elnina).x - 10, g.monstery[resolve(rt, elnina).myself] + 25, 10);
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
            s.talking = true;
}}
        resolve(rt, elnina).head = 871;
}
    else
{
        message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_934_0");
        balloon(s, rt, resolve(rt, lanino).x - 10, g.monstery[resolve(rt, lanino).myself] - 35, 10);
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
            s.talking = true;
}}
        resolve(rt, lanino).head = 4531;
}
}
if (weatherEqual(s.extratimer, 140))
{
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
        s.talking = false;
}}
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
        s.talking = false;
}}
for (const __target of targets(rt, object("obj_writer"))) { const __caller = s; { const other = __caller; const s = __target;
        destroy(s.id);
}}
    if (!_lanino_favored)
{
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
            moveToPointOverTime(s, rt, s.xstart, s.y, 6);
}}
}
}
if (exists(object("obj_battlecontroller")))
{
    resolve(rt, s.tenna).depth = resolve(rt, object("obj_battlecontroller")).depth + 1;
}
if (lt(s.intro, 4))
{
    resolve(rt, s.tenna).depth = s.depth - 10;
}
if (exists(object("obj_battlecontroller")))
{
    if (weatherEqual(g.mnfight, 2) && le(g.turntimer, 1) && weatherEqual(resolve(rt, object("obj_battlecontroller")).noreturn, 1) && weatherEqual(s.afterbulletcon, 0) && !exists(object("obj_choicer_neo")))
{
        s.talktimer++;
        g.typer = 50;
        if ((button3() && gt(s.talktimer, 15)) || (!exists(object("obj_writer")) && !weatherEqual(s.ballooncon, -1) && !weatherEqual(s.ballooncon, 4) && !weatherEqual(s.ballooncon, 8) && !weatherEqual(s.ballooncon, 10) && !weatherEqual(s.ballooncon, 15) && !weatherEqual(s.ballooncon, 17) && !weatherEqual(s.ballooncon, 17.5) && !weatherEqual(s.ballooncon, 17.6) && !weatherEqual(s.ballooncon, 22.1) && !weatherEqual(s.ballooncon, 24.5) && !weatherEqual(s.ballooncon, 25) && !weatherEqual(s.ballooncon, 26) && !weatherEqual(s.ballooncon, 27) && !weatherEqual(s.ballooncon, 28)) || (weatherEqual(s.ballooncon, -1) && gt(s.talktimer, 15)) || (weatherEqual(s.ballooncon, 4) && gt(s.talktimer, 30)) || (weatherEqual(s.ballooncon, 8) && gt(s.talktimer, 30)) || (weatherEqual(s.ballooncon, 10) && gt(s.talktimer, 5)) || (weatherEqual(s.ballooncon, 15) && gt(s.talktimer, 10)) || (weatherEqual(s.ballooncon, 17) && gt(s.talktimer, 60)) || (weatherEqual(s.ballooncon, 17.5) && gt(s.talktimer, 15)) || (weatherEqual(s.ballooncon, 17.6) && gt(s.talktimer, 15)) || (weatherEqual(s.ballooncon, 22.1) && gt(s.talktimer, 60)) || (weatherEqual(s.ballooncon, 24.5) && gt(s.talktimer, 90)) || (weatherEqual(s.ballooncon, 25) && gt((resolve(rt, s.tenna).y + resolve(rt, s.tenna).speed), (cameraY() + 280))) || weatherEqual(s.ballooncon, 26) || (weatherEqual(s.ballooncon, 27) && gt(s.talktimer, 20)) || (weatherEqual(s.ballooncon, 28) && gt(s.talktimer, 60)))
{
for (const __target of targets(rt, object("obj_writer"))) { const __caller = s; { const other = __caller; const s = __target;
                destroy(s.id);
}}
            if (weatherEqual(s.ballooncon, -1) && weatherEqual(s.turns, 3) && _lanino_favored)
{
                message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_965_0");
                balloon(s, rt, resolve(rt, lanino).x - 10, g.monstery[resolve(rt, lanino).myself] - 10, 10);
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                    s.talking = true;
}}
                resolve(rt, lanino).head = 2741;
                s.ballooncon = 0.5;
                s.balloonend = 0;
}
            else if (weatherEqual(s.ballooncon, 0.5))
{
                message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_975_0_b");
                balloon(s, rt, resolve(rt, lanino).x - 10, g.monstery[resolve(rt, lanino).myself] - 10, 10);
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                    s.talking = true;
}}
                resolve(rt, lanino).head = 2741;
                s.ballooncon = 1;
                s.balloonend = 0;
}
            else if (weatherEqual(s.ballooncon, 1))
{
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                    s.talking = false;
}}
                message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_987_0");
                balloon(s, rt, resolve(rt, elnina).x - 10, g.monstery[resolve(rt, elnina).myself] - 10, 10);
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                    s.talking = true;
                    s.pose = 3;
                    s.head = 871;
                    s.rightarm = 1888;
                    scrLerpvar(s, rt, "rightarmindex", 0, 3, 20);
                    delayVar(s, rt, "rightarm", 1641, 30);
                    delayVar(s, rt, "pose", 0, 30);
}}
                s.ballooncon = 2;
                s.balloonend = 0;
}
            else if (weatherEqual(s.ballooncon, 2))
{
                message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_1004_0");
                balloon(s, rt, resolve(rt, lanino).x - 10, g.monstery[resolve(rt, lanino).myself] - 10, 10);
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                    s.talking = true;
}}
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                    s.talking = false;
}}
                resolve(rt, lanino).head = 4545;
                s.ballooncon = 3;
                s.balloonend = 0;
}
            else if (weatherEqual(s.ballooncon, 3))
{
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                    s.talking = false;
}}
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                    s.talking = false;
}}
                s.ballooncon = 4;
                s.balloonend = 0;
}
            else if (weatherEqual(s.ballooncon, 4))
{
                message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_1022_0");
                balloon(s, rt, resolve(rt, elnina).x - 10, g.monstery[resolve(rt, elnina).myself] - 10, 10);
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                    s.talking = true;
}}
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                    s.talking = false;
}}
                resolve(rt, elnina).head = 4213;
                s.ballooncon = 9;
                s.balloonend = 0;
}
            else if (weatherEqual(s.ballooncon, -1) && weatherEqual(s.turns, 3) && !_lanino_favored)
{
                message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_1033_0");
                balloon(s, rt, resolve(rt, elnina).x - 10, g.monstery[resolve(rt, elnina).myself] - 10, 10);
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                    s.talking = true;
}}
                resolve(rt, elnina).head = 4213;
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                    s.talking = true;
                    s.pose = 3;
                    s.rightarm = 1888;
                    scrLerpvar(s, rt, "rightarmindex", 0, 3, 20);
                    delayVar(s, rt, "rightarm", 1641, 30);
                    delayVar(s, rt, "pose", 0, 30);
}}
                s.ballooncon = 5;
                s.balloonend = 0;
}
            else if (weatherEqual(s.ballooncon, 5))
{
                message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_1052_0_b");
                balloon(s, rt, resolve(rt, elnina).x - 10, g.monstery[resolve(rt, elnina).myself] - 10, 10);
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                    s.talking = true;
}}
                resolve(rt, elnina).head = 4213;
                s.ballooncon = 5.5;
                s.balloonend = 0;
}
            else if (weatherEqual(s.ballooncon, 5.5))
{
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                    s.talking = false;
}}
                message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_1064_0");
                balloon(s, rt, resolve(rt, lanino).x - 10, g.monstery[resolve(rt, lanino).myself] - 10, 10);
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                    s.talking = true;
                    s.pose = 3;
                    s.head = 4531;
                    s.chest = 1010;
                    scrLerpvar(s, rt, "chestindex", 0, 3, 20);
                    delayVar(s, rt, "chest", 3079, 30);
                    delayVar(s, rt, "pose", 0, 30);
}}
                s.ballooncon = 6;
                s.balloonend = 0;
}
            else if (weatherEqual(s.ballooncon, 6))
{
                message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_1081_0");
                balloon(s, rt, resolve(rt, elnina).x - 10, g.monstery[resolve(rt, elnina).myself] - 10, 10);
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                    s.talking = true;
}}
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                    s.talking = false;
}}
                resolve(rt, elnina).head = 3799;
                s.ballooncon = 7;
                s.balloonend = 0;
}
            else if (weatherEqual(s.ballooncon, 7))
{
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                    s.talking = false;
}}
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                    s.talking = false;
}}
                s.ballooncon = 8;
                s.balloonend = 0;
}
            else if (weatherEqual(s.ballooncon, 8))
{
                message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_1099_0");
                balloon(s, rt, resolve(rt, lanino).x - 10, g.monstery[resolve(rt, lanino).myself] - 10, 10);
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                    s.talking = true;
}}
                resolve(rt, lanino).head = 2741;
                s.ballooncon = 9;
                s.balloonend = 0;
}
            else if (weatherEqual(s.ballooncon, 9))
{
                speaker(s, rt, "no_name");
                g.choice = -1;
                g.msc = -99;
                g.choicemsg[0] = text("obj_elnina_lanino_controller_slash_Step_0_gml_1052_0");
                g.choicemsg[1] = text("obj_elnina_lanino_controller_slash_Step_0_gml_1053_0");
                g.choicemsg[2] = String("");
                g.choicemsg[3] = String("");
                message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_1114_0");
                battleTextDefault(rt, s);
                resolve(rt, elnina).head = 4213;
                resolve(rt, lanino).head = 2741;
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                    s.talking = false;
}}
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                    s.talking = false;
}}
                s.ballooncon = 10;
                s.balloonend = 0;
}
            else if (weatherEqual(s.ballooncon, 10))
{
                if (!weatherEqual(g.choice, -1))
{
                    if (weatherEqual(g.choice, 0))
{
                        s.sunboost = -3;
                        s.lastchosen = "elnina";
                        message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_1131_0");
                        balloon(s, rt, resolve(rt, elnina).x - 10, g.monstery[resolve(rt, elnina).myself] - 10, 10);
                        snd(rt, "snd_boost");
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                            s.talking = true;
                            s.becomeflash = 15;
                            s.flashcolor = C.yellow;
}}
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                            s.talking = false;
}}
                        resolve(rt, elnina).head = 1196;
                        resolve(rt, lanino).head = 3264;
}
                    if (weatherEqual(g.choice, 1))
{
                        s.sunboost = 3;
                        s.lastchosen = "lanino";
                        message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_1143_0");
                        balloon(s, rt, resolve(rt, lanino).x - 10, g.monstery[resolve(rt, lanino).myself] - 10, 10);
                        snd(rt, "snd_boost");
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                            s.talking = true;
                            s.becomeflash = 15;
                            s.flashcolor = C.yellow;
}}
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                            s.talking = false;
}}
                        resolve(rt, lanino).head = 679;
                        resolve(rt, elnina).head = 4436;
}
                    g.flag[1017] = g.choice;
                    debugPrint("global.flag[1017]=" + String(g.flag[1017]));
                    if (weatherEqual(g.flag[1017], 0))
{
                        debugPrint("Elnina has been favored");
}
                    else
{
                        debugPrint("Lanino has been favored");
}
                    s.ballooncon = 11;
                    s.balloonend = 0;
}
}
            else if (weatherEqual(s.ballooncon, 11))
{
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                    s.flashcolor = C.white;
}}
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                    s.flashcolor = C.white;
}}
                s.ballooncon = 0;
                s.balloonend = 1;
                s.excon = 1;
}
            else if (weatherEqual(s.ballooncon, -1) && weatherEqual(s.turns, 5))
{
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                    s.talking = false;
}}
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                    s.talking = false;
}}
                if (_lanino_favored)
{
                    message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_1196_0");
                    balloon(s, rt, resolve(rt, elnina).x - 10, g.monstery[resolve(rt, elnina).myself] - 10, 10);
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                        s.talking = true;
}}
                    resolve(rt, elnina).head = 871;
                    resolve(rt, lanino).head = 3264;
}
                else
{
                    message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_1201_0");
                    balloon(s, rt, resolve(rt, lanino).x - 10, g.monstery[resolve(rt, lanino).myself] - 10, 10);
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                        s.talking = true;
}}
                    resolve(rt, lanino).head = 4531;
                    resolve(rt, elnina).head = 4436;
}
                s.ballooncon = 12;
                s.balloonend = 0;
}
            else if (weatherEqual(s.ballooncon, 12))
{
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                    s.talking = false;
}}
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                    s.talking = false;
}}
                if (_lanino_favored)
{
                    message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_1215_0");
                    balloon(s, rt, resolve(rt, elnina).x - 10, g.monstery[resolve(rt, elnina).myself] - 10, 10);
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                        s.talking = true;
}}
}
                else
{
                    message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_1220_0");
                    balloon(s, rt, resolve(rt, lanino).x - 10, g.monstery[resolve(rt, lanino).myself] - 10, 10);
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                        s.talking = true;
}}
}
                s.ballooncon = 13;
                s.balloonend = 0;
}
            else if (weatherEqual(s.ballooncon, 13))
{
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                    s.talking = false;
}}
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                    s.talking = false;
}}
                if (_lanino_favored)
{
                    message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_1234_0");
                    balloon(s, rt, resolve(rt, lanino).x - 10, g.monstery[resolve(rt, lanino).myself] - 10, 10);
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                        s.talking = true;
}}
                    resolve(rt, lanino).head = 2138;
}
                else
{
                    message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_1239_0_b");
                    balloon(s, rt, resolve(rt, elnina).x - 10, g.monstery[resolve(rt, elnina).myself] - 10, 10);
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                        s.talking = true;
}}
                    resolve(rt, elnina).head = 1214;
}
                s.ballooncon = 14;
                s.balloonend = 0;
}
            else if (weatherEqual(s.ballooncon, 14))
{
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                    s.talking = false;
}}
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                    s.talking = false;
}}
                message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_1209_0");
                if (_lanino_favored)
{
                    balloon(s, rt, resolve(rt, elnina).x - 10, g.monstery[resolve(rt, elnina).myself] - 10, 10);
                    resolve(rt, elnina).head = 4436;
}
                else
{
                    balloon(s, rt, resolve(rt, lanino).x - 10, g.monstery[resolve(rt, lanino).myself] - 10, 10);
                    resolve(rt, lanino).head = 3264;
}
                s.ballooncon = 14.5;
                s.balloonend = 0;
}
            else if (weatherEqual(s.ballooncon, 14.5))
{
                resolve(rt, s.tenna).preset = 2;
                resolve(rt, s.tenna).reversal = 1;
                resolve(rt, s.tenna).vspeed = -31;
                resolve(rt, s.tenna).x = cameraX() + 230;
                resolve(rt, s.tenna).y = cameraY() + 620;
                s.ballooncon = 15;
                s.balloonend = 0;
}
            else if (weatherEqual(s.ballooncon, 15))
{
                resolve(rt, s.tenna).vspeed = 0;
                snd(rt, "snd_impact");
                create(s.x, s.y, object("obj_shake"));
                message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_1233_0");
for (const __target of targets(rt, balloon(s, rt, resolve(rt, s.tenna).x + 56, resolve(rt, s.tenna).y - 170, 10))) { const __caller = s; { const other = __caller; const s = __target;
                    s.side = -1;
}}
                s.ballooncon = 16;
                s.balloonend = 0;
}
            else if (weatherEqual(s.ballooncon, 16))
{
                message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_1239_0");
                balloon(s, rt, resolve(rt, lanino).x - 10, g.monstery[resolve(rt, lanino).myself] - 10, 10);
                message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_1241_0");
                balloon(s, rt, resolve(rt, elnina).x - 10, g.monstery[resolve(rt, elnina).myself] - 10, 10);
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                    s.talking = true;
}}
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                    s.talking = true;
}}
                resolve(rt, lanino).head = 4531;
                resolve(rt, elnina).head = 871;
                s.ballooncon = 17;
                s.balloonend = 0;
                resolve(rt, s.tenna).hspeed = -26;
                resolve(rt, s.tenna).vspeed = -18;
                resolve(rt, s.tenna).gravity = 3;
}
            else if (weatherEqual(s.ballooncon, 17))
{
for (const __target of targets(rt, object("obj_writer"))) { const __caller = s; { const other = __caller; const s = __target;
                    destroy(s.id);
}}
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                    s.talking = false;
}}
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                    s.talking = false;
}}
                resolve(rt, s.tenna).preset = 7;
                s.ballooncon = 17.5;
                s.balloonend = 0;
}
            else if (weatherEqual(s.ballooncon, 17.5))
{
                resolve(rt, s.tenna).vspeed = 15;
                s.ballooncon = 17.6;
                s.balloonend = 0;
}
            else if (weatherEqual(s.ballooncon, 17.6))
{
                if (_lanino_favored)
{
                    resolve(rt, elnina).head = 4436;
                    resolve(rt, lanino).head = 1271;
}
                else
{
                    resolve(rt, elnina).head = 4846;
                    resolve(rt, lanino).head = 3264;
}
                resolve(rt, s.tenna).hspeed = 0;
                resolve(rt, s.tenna).vspeed = 0;
                resolve(rt, s.tenna).gravity = 0;
                s.ballooncon = 0;
                s.balloonend = 1;
}
            else if (weatherEqual(s.ballooncon, -1) && weatherEqual(s.turns, 6))
{
                if (_lanino_favored)
{
                    message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_1289_0");
                    balloon(s, rt, resolve(rt, elnina).x - 10, g.monstery[resolve(rt, elnina).myself] - 10, 10);
                    resolve(rt, elnina).head = 1214;
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                        s.talking = true;
}}
}
                else
{
                    message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_1296_0");
                    balloon(s, rt, resolve(rt, lanino).x - 10, g.monstery[resolve(rt, lanino).myself] - 10, 10);
                    resolve(rt, lanino).head = 2138;
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                        s.talking = true;
}}
}
                s.ballooncon = 18;
                s.balloonend = 0;
}
            else if (weatherEqual(s.ballooncon, 18))
{
                message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_1307_0");
                if (_lanino_favored)
{
                    balloon(s, rt, resolve(rt, lanino).x - 10, g.monstery[resolve(rt, lanino).myself] - 10, 10);
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                        s.talking = true;
}}
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                        s.talking = false;
}}
                    resolve(rt, lanino).head = 4545;
}
                else
{
                    balloon(s, rt, resolve(rt, elnina).x - 10, g.monstery[resolve(rt, elnina).myself] - 10, 10);
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                        s.talking = true;
}}
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                        s.talking = false;
}}
                    resolve(rt, elnina).head = 3799;
}
                s.ballooncon = 19;
                s.balloonend = 0;
}
            else if (weatherEqual(s.ballooncon, 19))
{
                if (_lanino_favored)
{
                    message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_1330_0");
                    balloon(s, rt, resolve(rt, elnina).x - 10, g.monstery[resolve(rt, elnina).myself] - 10, 10);
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                        s.talking = false;
}}
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                        s.talking = true;
}}
                    resolve(rt, elnina).head = 871;
}
                else
{
                    message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_1338_0");
                    balloon(s, rt, resolve(rt, lanino).x - 10, g.monstery[resolve(rt, lanino).myself] - 10, 10);
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                        s.talking = false;
}}
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                        s.talking = true;
}}
                    resolve(rt, lanino).head = 4531;
}
                s.ballooncon = 20;
                s.balloonend = 0;
}
            else if (weatherEqual(s.ballooncon, 20))
{
                if (_lanino_favored)
{
                    message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_1352_0");
                    balloon(s, rt, resolve(rt, elnina).x - 10, g.monstery[resolve(rt, elnina).myself] - 10, 10);
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                        s.talking = true;
}}
}
                else
{
                    message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_1358_0_b");
                    balloon(s, rt, resolve(rt, lanino).x - 10, g.monstery[resolve(rt, lanino).myself] - 10, 10);
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                        s.talking = true;
}}
}
                s.ballooncon = 21;
                s.balloonend = 0;
}
            else if (weatherEqual(s.ballooncon, 21))
{
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                    s.talking = false;
}}
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                    s.talking = false;
}}
                message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_1370_0");
                if (_lanino_favored)
{
                    balloon(s, rt, resolve(rt, lanino).x - 10, g.monstery[resolve(rt, lanino).myself] - 10, 10);
                    resolve(rt, elnina).head = 1214;
                    resolve(rt, elnina).hspeed = 8;
}
                else
{
                    balloon(s, rt, resolve(rt, elnina).x - 10, g.monstery[resolve(rt, elnina).myself] - 10, 10);
                    resolve(rt, lanino).head = 2138;
                    resolve(rt, lanino).hspeed = 8;
}
                s.ballooncon = 22;
                s.balloonend = 0;
}
            else if (weatherEqual(s.ballooncon, 22))
{
                if (_lanino_favored)
{
for (const __target of targets(rt, elnina)) { const __caller = s; { const other = __caller; const s = __target;
                        monsterDefeat(s, rt);
                        destroy(s.id);
}}
}
                else
{
for (const __target of targets(rt, lanino)) { const __caller = s; { const other = __caller; const s = __target;
                        monsterDefeat(s, rt);
                        destroy(s.id);
}}
}
                s.ballooncon = 22.1;
                s.balloonend = 0;
}
            else if (weatherEqual(s.ballooncon, 22.1))
{
                if (_lanino_favored)
{
                    message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_1412_0");
                    balloon(s, rt, resolve(rt, lanino).x - 10, g.monstery[resolve(rt, lanino).myself] - 10, 10);
                    resolve(rt, lanino).head = 679;
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                        s.talking = true;
}}
}
                else
{
                    message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_1419_0");
                    balloon(s, rt, resolve(rt, elnina).x - 10, g.monstery[resolve(rt, elnina).myself] - 10, 10);
                    resolve(rt, elnina).head = 1196;
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                        s.talking = true;
}}
}
                s.ballooncon = 22.2;
                s.balloonend = 0;
}
            else if (weatherEqual(s.ballooncon, 22.2))
{
                s.ballooncon = 0;
                s.balloonend = 1;
}
            else if (weatherEqual(s.ballooncon, -1) && weatherEqual(s.turns, 7))
{
                volume(s, rt, g.batmusic[1], 0, 60);
                message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_1436_0");
                if (_lanino_favored)
{
                    balloon(s, rt, resolve(rt, lanino).x - 10, g.monstery[resolve(rt, lanino).myself] - 10, 10);
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                        s.talking = true;
}}
                    resolve(rt, lanino).head = 3264;
}
                else
{
                    balloon(s, rt, resolve(rt, elnina).x - 10, g.monstery[resolve(rt, elnina).myself] - 10, 10);
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                        s.talking = true;
}}
                    resolve(rt, elnina).head = 4436;
}
                s.ballooncon = 23;
                s.balloonend = 0;
}
            else if (weatherEqual(s.ballooncon, 23))
{
                if (_lanino_favored)
{
                    message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_1457_0");
                    balloon(s, rt, resolve(rt, lanino).x - 10, g.monstery[resolve(rt, lanino).myself] - 10, 10);
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                        s.talking = true;
}}
                    resolve(rt, lanino).head = 3264;
}
                else
{
                    message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_1464_0");
                    balloon(s, rt, resolve(rt, elnina).x - 10, g.monstery[resolve(rt, elnina).myself] - 10, 10);
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                        s.talking = true;
}}
                    resolve(rt, elnina).head = 4436;
}
                s.ballooncon = 23.1;
                s.balloonend = 0;
}
            else if (weatherEqual(s.ballooncon, 23.1))
{
                if (_lanino_favored)
{
                    message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_1475_0");
                    balloon(s, rt, resolve(rt, lanino).x - 10, g.monstery[resolve(rt, lanino).myself] - 10, 10);
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                        s.talking = true;
}}
}
                else
{
                    message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_1527_0");
                    balloon(s, rt, resolve(rt, elnina).x - 10, g.monstery[resolve(rt, elnina).myself] - 10, 10);
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                        s.talking = true;
}}
}
                s.ballooncon = 24;
                s.balloonend = 0;
}
            else if (weatherEqual(s.ballooncon, 24))
{
                if (_lanino_favored)
{
                    message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_1494_0");
                    balloon(s, rt, resolve(rt, lanino).x - 10, g.monstery[resolve(rt, lanino).myself] - 10, 10);
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                        s.talking = true;
}}
                    resolve(rt, lanino).head = 2138;
}
                else
{
                    message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_1501_0");
                    balloon(s, rt, resolve(rt, elnina).x - 10, g.monstery[resolve(rt, elnina).myself] - 10, 10);
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                        s.talking = true;
}}
                    resolve(rt, elnina).head = 1214;
}
                s.ballooncon = 24.5;
                s.balloonend = 0;
}
            else if (weatherEqual(s.ballooncon, 24.5))
{
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                    s.talking = false;
}}
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
                    s.talking = false;
}}
                resolve(rt, s.tenna).x = cameraX() + 330;
                resolve(rt, s.tenna).y = cameraY() - 40;
                resolve(rt, s.tenna).hspeed = 0;
                resolve(rt, s.tenna).gravity = 1;
                resolve(rt, s.tenna).preset = 2;
                s.ballooncon = 25;
}
            else if (weatherEqual(s.ballooncon, 25))
{
                resolve(rt, s.tenna).y = cameraY() + 280;
                resolve(rt, s.tenna).vspeed = 0;
                resolve(rt, s.tenna).gravity = 0;
                snd(rt, "snd_impact");
                create(s.x, s.y, object("obj_shake"));
                s.ilovetvlimit = false;
                message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_1531_0");
for (const __target of targets(rt, balloon(s, rt, resolve(rt, s.tenna).x + 56, resolve(rt, s.tenna).y - 140, 10))) { const __caller = s; { const other = __caller; const s = __target;
                    s.side = -1;
}}
                s.ballooncon = 25.5;
                s.balloonend = 0;
}
            else if (weatherEqual(s.ballooncon, 25.5) && !exists(object("obj_writer")))
{
                s.ilovetv_pitch = 1;
                s.ilovetv_increase = 99;
                s.digit_flash_duration = 2;
                s.ballooncon = 26;
                s.balloonend = 0;
                destroy(object("obj_ilovetv"));
}
            else if (weatherEqual(s.ballooncon, 26))
{
                s.balloonend = 0;
                if (weatherEqual(s.ilovetv, 99))
{
                    s.ballooncon = 27;
}
                else
{
                    let _cx = cameraX() + 320;
                    let _cy = cameraY() + 160;
                    let _delay = 3;
                    if (weatherEqual((s.talktimer % _delay), 0))
{
                        let _right = weatherEqual((s.talktimer % (_delay * 2)), 0);
                        let _bx = _cx + (_right ? 150 : -150);
                        let _by = _cy + (Math.sin(Math.trunc(s.talktimer / _delay)) * 50);
                        let _balloon = createDepth(_bx, _by, s.depth, object("obj_ilovetv"));
                        if (_right)
{
                            resolve(rt, _balloon).imageXscale *= -1;
}
}
                    return;
}
}
            else if (weatherEqual(s.ballooncon, 27))
{
                message(0, "obj_elnina_lanino_controller_slash_Step_0_gml_1578_0");
for (const __target of targets(rt, balloon(s, rt, resolve(rt, s.tenna).x + 56, resolve(rt, s.tenna).y - 140, 10))) { const __caller = s; { const other = __caller; const s = __target;
                    s.side = -1;
}}
                s.ilovetv_increase = 0;
                s.balloonend = 0;
                s.ballooncon = 28;
}
            else if (weatherEqual(s.ballooncon, 28))
{
                s.battleresult = 1;
                g.flag[9] = 1;
                if (exists(lanino))
{
                    resolve(rt, lanino).hspeed = 20;
}
                if (exists(elnina))
{
                    resolve(rt, elnina).hspeed = 20;
}
                resolve(rt, s.tenna).hspeed = 20;
                s.ballooncon = 0;
                s.balloonend = 1;
                winCombat(rt, s);
}
            s.afterbulletcon = 1;
            g.typer = 50;
            if (weatherEqual(s.ralseitalks, 1) && exists(object("obj_heroralsei")))
{
                g.typer = 74;
                heroBalloon(s, rt, "ralsei");
                peek(s, rt, object("obj_heroralsei"));
}
            else if (weatherEqual(s.susietalks, 1) && exists(object("obj_herosusie")))
{
                g.typer = 75;
                heroBalloon(s, rt, "susie");
                peek(s, rt, object("obj_herosusie"));
}
            s.ralseitalks = 0;
            s.susietalks = 0;
            s.alarm[6] = 1;
}
}
}
},
draw:(s:GmInstance,rt:GmRuntime)=>{
const g=rt.globals,other=s;
const cameraX=()=>rt.view.x,cameraY=()=>rt.view.y;
const exists=(v:GmObjectDef|number)=>gt(targets(rt,v).length, 0),count=(v:GmObjectDef|number)=>targets(rt,v).length;
const create=(x:number,y:number,d:GmObjectDef)=>rt.create(d,x,y).id;
const createDepth=(x:number,y:number,depth:number,d:GmObjectDef)=>{const i=rt.create(d,x,y);i.depth=depth;return i.id;};
const destroy=(v:GmObjectDef|number=s.id)=>{for(const i of targets(rt,v))rt.destroy(i);},safeDelete=destroy;
const timer=(n:number)=>{if(lt(g.turntimer,n))g.turntimer=n;};
const irandom=(n:number)=>rt.random.irandom(n),irandomRange=(a:number,b:number)=>rt.random.irandomRange(a,b),choose=(...a:number[])=>a[rt.random.irandom(a.length-1)];
const region=()=>g.__region??'US',lower=(v:string)=>v.toLowerCase(),globalExists=(n:string)=>n in g;
const message=(n:number,key:string)=>{g.msgno=n;g.msg[n]=text(key);},text=(key:string)=>sourceText(key),subtext=(key:string,v:unknown)=>text(key).replace('~1',String(v));
const arrayLength=(a:unknown[])=>a.length,debugPrint=(..._args:unknown[])=>{};
const button1=()=>button1_p(rt),button3=()=>pressed(rt,KEY.c,KEY.ctrl);
const setAlpha=(n:number)=>{rt.drawState.alpha=n;},setFont=(v:string)=>{rt.drawState.font=v;},setHalign=(v:0|1|2)=>{rt.drawState.halign=v;};
const drawSprite=(sprite:string|number,...a:[number,number,number,number,number,number,number,number])=>rt.drawSprite(weatherSprite(sprite),...a);
const drawText=(x:number,y:number,v:unknown,xs:number,ys:number,angle:number,c1:number,_c2:number,_c3:number,_c4:number,alpha:number)=>{rt.drawState.color=c1;rt.drawState.alpha=alpha;rt.drawText(x,y,String(v),xs,ys,angle);};
if (gt(s.digit_flash_timer, 0))
{
    s.digit_flash_timer--;
}
if (phase(s, rt, "menu") || phase(s, rt, "acting") || weatherEqual(s.ilovetv_increase, 99))
{
    s.digit_alpha = moveTowards(s.digit_alpha, 1, 0.1);
}
else
{
    s.digit_alpha = moveTowards(s.digit_alpha, 0, 0.1);
}
if (gt(s.digit_alpha, 0))
{
    let _first_digit = Math.trunc(s.ilovetv / 10);
    let _second_digit = s.ilovetv % 10;
    let _col_factor = Math.sin((s.digit_flash_timer / s.digit_flash_duration) * Math.PI);
    let _col2 = mergeColor(C.red, C.white, 0.5);
    if (weatherEqual(s.ballooncon, 26))
{
        _col2 = mergeColor(C.red, C.white, 0.25);
}
    let _col = mergeColor(C.red, _col2, _col_factor);
    if (weatherEqual(s.ilovetv, 99))
{
        _col_factor = (Math.sin((rt.frame * 1000 / 30) / 30) * 0.15) + 0.5;
        _col = mergeColor(C.orange, C.yellow, _col_factor);
}
    let _xx = 280;
    let _yy = 20;
    drawSprite("spr_tv_counter_numbers", _first_digit, _xx, _yy, 2, 2, 0, _col, s.digit_alpha);
    drawSprite("spr_tv_counter_numbers", _second_digit, _xx + 40, _yy, 2, 2, 0, _col, s.digit_alpha);
}
if (ge(s.intro, 4) && phase(s, rt, "menu"))
{
    s.forecast_alpha = moveTowards(s.forecast_alpha, 1, 0.1);
}
else
{
    s.forecast_alpha = moveTowards(s.forecast_alpha, 0, 0.1);
}
if (gt(s.forecast_alpha, 0))
{
    setFont("fnt_main");
    setHalign(1);
    for (let _f = 0; lt(_f, arrayLength(s.forecasts)); _f++)
{
        let _forecast = s.forecasts[_f];
        let _forecast_lanino = _forecast[1];
        let _forecast_elnina = _forecast[2];
        let _xx = 202 + (78 * _f);
        let _yy = 100 - (10 * _f);
        _yy += (Math.sin(((rt.frame * 1000 / 30) / 200) + _f) * 2);
        drawSprite("spr_glass_pane", 0, _xx, _yy, 2, 2, 0, C.white, s.forecast_alpha);
        let _temp = _forecast[0];
        let _temp_color;
        if (weatherEqual(s.forecast_turn, 6))
{
            _temp = (weatherEqual(s.lastchosen, "lanino")) ? 999 : -999;
            _temp_color = (weatherEqual(s.lastchosen, "lanino")) ? mergeColor(C.red, C.orange, (Math.sin((rt.frame * 1000 / 30) / 100) * 0.5) + 0.5) : mergeColor(C.aqua, 0xff0000, (Math.sin((rt.frame * 1000 / 30) / 100) * 0.25) + 0.25);
}
        else
{
            if (lt(_temp, 50))
{
                _temp_color = mergeColor(C.aqua, C.white, clamp(_temp / 50, 0, 1));
}
            else if (lt(_temp, 80))
{
                _temp_color = mergeColor(C.white, C.yellow, clamp((_temp - 50) / 30, 0, 1));
}
            else
{
                _temp_color = mergeColor(C.yellow, C.red, clamp((_temp - 80) / 40, 0, 1));
}
            if (s.use_celsius)
{
                _temp = round((_temp - 32) * 0.5556);
}
}
        drawText(_xx + 27, _yy + 115, _temp, 2, 2, 25, _temp_color, _temp_color, _temp_color, _temp_color, s.forecast_alpha);
        let _w1_x = (_xx + 24) - 10;
        let _w1_y = _yy + 36;
        let _w2_x = _xx + 44 + 10;
        let _w2_y = _yy + 76;
        if (weatherEqual(s.forecast_turn, 6))
{
            if (weatherEqual(s.lastchosen, "lanino"))
{
                drawWeatherJitter(rt, "spr_weather_sun", _w1_x, _w1_y, s.forecast_alpha);
                drawWeatherJitter(rt, "spr_weather_sun", _w2_x, _w1_y, s.forecast_alpha);
                drawWeatherJitter(rt, "spr_weather_sun", _w1_x, _w2_y, s.forecast_alpha);
                drawWeatherJitter(rt, "spr_weather_sun", _w2_x, _w2_y, s.forecast_alpha);
}
            else
{
                drawWeatherJitter(rt, "spr_weather_snow", _w1_x, _w1_y, s.forecast_alpha);
                drawWeatherJitter(rt, "spr_weather_snow", _w2_x, _w1_y, s.forecast_alpha);
                drawWeatherJitter(rt, "spr_weather_snow", _w1_x, _w2_y, s.forecast_alpha);
                drawWeatherJitter(rt, "spr_weather_snow", _w2_x, _w2_y, s.forecast_alpha);
}
}
        else
{
            let _lanino_scale = 2;
            let _elnina_scale = 2;
            if (ge(s.forecast_turn, 3))
{
                if (weatherEqual(s.lastchosen, "lanino"))
{
                    _w1_x += (1 - irandom(2));
                    _w1_y += (1 - irandom(2));
                    _lanino_scale = 2 + ((s.forecast_turn - 2) * 1);
                    _elnina_scale = 2;
}
                else
{
                    _w2_x += (1 - irandom(2));
                    _w2_y += (1 - irandom(2));
                    _lanino_scale = 2;
                    _elnina_scale = 2 + ((s.forecast_turn - 2) * 1);
}
}
            drawSprite(_forecast_lanino, 0, _w1_x, _w1_y, _lanino_scale, _lanino_scale, 0, C.white, s.forecast_alpha);
            drawSprite(_forecast_elnina, 0, _w2_x, _w2_y, _elnina_scale, _elnina_scale, 0, C.white, s.forecast_alpha);
}
}
    setAlpha(1);
    setHalign(0);
}
if (weatherEqual(g.fighting, 0))
{
    debugPrint("battle over");
    volume(s, rt, g.batmusic[1], 0, 60);
    volume(s, rt, g.currentsong[1], 0, 0);
    safeDelete(s.tenna);
    destroy(s.id);
}
},
alarm6:(s:GmInstance,rt:GmRuntime)=>{
const g=rt.globals,other=s;
const cameraX=()=>rt.view.x,cameraY=()=>rt.view.y;
const exists=(v:GmObjectDef|number)=>gt(targets(rt,v).length, 0),count=(v:GmObjectDef|number)=>targets(rt,v).length;
const create=(x:number,y:number,d:GmObjectDef)=>rt.create(d,x,y).id;
const createDepth=(x:number,y:number,depth:number,d:GmObjectDef)=>{const i=rt.create(d,x,y);i.depth=depth;return i.id;};
const destroy=(v:GmObjectDef|number=s.id)=>{for(const i of targets(rt,v))rt.destroy(i);},safeDelete=destroy;
const timer=(n:number)=>{if(lt(g.turntimer,n))g.turntimer=n;};
const irandom=(n:number)=>rt.random.irandom(n),irandomRange=(a:number,b:number)=>rt.random.irandomRange(a,b),choose=(...a:number[])=>a[rt.random.irandom(a.length-1)];
const region=()=>g.__region??'US',lower=(v:string)=>v.toLowerCase(),globalExists=(n:string)=>n in g;
const message=(n:number,key:string)=>{g.msgno=n;g.msg[n]=text(key);},text=(key:string)=>sourceText(key),subtext=(key:string,v:unknown)=>text(key).replace('~1',String(v));
const arrayLength=(a:unknown[])=>a.length,debugPrint=(..._args:unknown[])=>{};
const button1=()=>button1_p(rt),button3=()=>pressed(rt,KEY.c,KEY.ctrl);
const setAlpha=(n:number)=>{rt.drawState.alpha=n;},setFont=(v:string)=>{rt.drawState.font=v;},setHalign=(v:0|1|2)=>{rt.drawState.halign=v;};
const drawSprite=(sprite:string|number,...a:[number,number,number,number,number,number,number,number])=>rt.drawSprite(weatherSprite(sprite),...a);
const drawText=(x:number,y:number,v:unknown,xs:number,ys:number,angle:number,c1:number,_c2:number,_c3:number,_c4:number,alpha:number)=>{rt.drawState.color=c1;rt.drawState.alpha=alpha;rt.drawText(x,y,String(v),xs,ys,angle);};
if (weatherEqual(s.balloonend, 1))
{
    s.talked = 1;
    s.talktimer = 0;
    if (weatherEqual(g.mnfight, 2))
{
        s.talked = 0;
        s.afterbulletcon = 0;
for (const __target of targets(rt, object("obj_battlecontroller"))) { const __caller = s; { const other = __caller; const s = __target;
            s.noreturn = 0;
            s.reset = 0;
            mnEndTurn(s, rt);
}}
for (const __target of targets(rt, object("obj_lanino_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
            s.talking = false;
}}
for (const __target of targets(rt, object("obj_elnina_enemy"))) { const __caller = s; { const other = __caller; const s = __target;
            s.talking = false;
}}
        if (weatherEqual(s.excon, 1))
{
            s.battlemsg_set = true;
            s.excon = 2;
for (const __target of targets(rt, object("obj_face"))) { const __caller = s; { const other = __caller; const s = __target;
                destroy(s.id);
}}
            g.fc = 22;
            if (weatherEqual(g.choice, 0))
{
                g.battlemsg[0] = text("obj_elnina_lanino_controller_slash_Alarm_6_gml_23_0");
}
            if (weatherEqual(g.choice, 1))
{
                g.battlemsg[0] = text("obj_elnina_lanino_controller_slash_Alarm_6_gml_24_0");
}
}
}
}
else
{
    s.talked = 0.6;
    s.talktimer = 0;
    if (weatherEqual(g.mnfight, 2))
{
        s.talked = 0;
        s.afterbulletcon = 0;
}
}
},
cleanup:(s:GmInstance,rt:GmRuntime)=>{
const g=rt.globals,other=s;
const cameraX=()=>rt.view.x,cameraY=()=>rt.view.y;
const exists=(v:GmObjectDef|number)=>gt(targets(rt,v).length, 0),count=(v:GmObjectDef|number)=>targets(rt,v).length;
const create=(x:number,y:number,d:GmObjectDef)=>rt.create(d,x,y).id;
const createDepth=(x:number,y:number,depth:number,d:GmObjectDef)=>{const i=rt.create(d,x,y);i.depth=depth;return i.id;};
const destroy=(v:GmObjectDef|number=s.id)=>{for(const i of targets(rt,v))rt.destroy(i);},safeDelete=destroy;
const timer=(n:number)=>{if(lt(g.turntimer,n))g.turntimer=n;};
const irandom=(n:number)=>rt.random.irandom(n),irandomRange=(a:number,b:number)=>rt.random.irandomRange(a,b),choose=(...a:number[])=>a[rt.random.irandom(a.length-1)];
const region=()=>g.__region??'US',lower=(v:string)=>v.toLowerCase(),globalExists=(n:string)=>n in g;
const message=(n:number,key:string)=>{g.msgno=n;g.msg[n]=text(key);},text=(key:string)=>sourceText(key),subtext=(key:string,v:unknown)=>text(key).replace('~1',String(v));
const arrayLength=(a:unknown[])=>a.length,debugPrint=(..._args:unknown[])=>{};
const button1=()=>button1_p(rt),button3=()=>pressed(rt,KEY.c,KEY.ctrl);
const setAlpha=(n:number)=>{rt.drawState.alpha=n;},setFont=(v:string)=>{rt.drawState.font=v;},setHalign=(v:0|1|2)=>{rt.drawState.halign=v;};
const drawSprite=(sprite:string|number,...a:[number,number,number,number,number,number,number,number])=>rt.drawSprite(weatherSprite(sprite),...a);
const drawText=(x:number,y:number,v:unknown,xs:number,ys:number,angle:number,c1:number,_c2:number,_c3:number,_c4:number,alpha:number)=>{rt.drawState.color=c1;rt.drawState.alpha=alpha;rt.drawText(x,y,String(v),xs,ys,angle);};
safeDelete(s.tenna);
}
}};return {objects:[controller,...createWeatherSupport(object)]};
}
