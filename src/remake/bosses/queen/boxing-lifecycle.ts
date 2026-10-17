import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {sourceText} from '../../host/text';
import {enemyObjectInit} from '../../deltarune/chapter2-enemy';
import {sndFree} from '../../deltarune/battle';
import {spellMenuSetupChapter2} from '../../deltarune/chapter2';

export const GIGA_RECRUIT_HP_FLAGS=[254,357,630,631,632,633,634,635,636,640,642,644] as const;
export interface BoxingLifecycleObjects{
 blackBackground:GmObjectDef;cityBackground:GmObjectDef;controller:GmObjectDef;queen:GmObjectDef;battleBackground:GmObjectDef;battleController:GmObjectDef;heart:GmObjectDef;returnHeart:GmObjectDef;
}

/** obj_gigaqueen_enemy Create. Child creation precedes saving HP, as it does in the original. */
export function createGigaQueenState(s:GmInstance,rt:GmRuntime,o:BoxingLifecycleObjects){
 const g=rt.globals;enemyObjectInit(s,rt);
 rt.create(o.blackBackground,-1000,-1000);rt.create(o.cityBackground,s.x,s.y);rt.create(o.controller,s.x,s.y);rt.create(o.queen,s.x,s.y);
 for(const bg of rt.all(o.battleBackground))bg.visible=false;
 Object.assign(s,{init:0,turn:0,battlemsgtimer:0});
 const controller=rt.first(o.battleController);if(controller){controller.cantspare[0]=1;s.cantspareinit=1;}
 s.kris_save_hp=g.hp[1];s.kris_save_max_hp=g.maxhp[1];
 let recruits=0;for(const flag of GIGA_RECRUIT_HP_FLAGS)if(g.flag[flag]===1)recruits+=5;
 g.hp[1]=200+Math.min(recruits,50);g.maxhp[1]=g.hp[1];
 g.charname[1]=sourceText('obj_gigaqueen_enemy_slash_Create_0_gml_19_0');
 Object.assign(s,{balloonorder:0,ballooncon:0,balloonend:1,talkedcon:0,playerhasntdodged:0,playerhasntdodgedorder:0,didntdodgethisturn:0,didntpunchthisturn:0,didntcounterthisturn:0,recentphasetransition:0,healcount:0,haventusedspell:1,finalconvcon:0,missleattack:0,breathattack:0,extradamage:0,actpunchtext:0});
 s.items=[];for(s.j=0;s.j<13;s.j++)s.items[s.j]=g.item[s.j];
}

/** The original Destroy event restores the story character, including when the host exits the battle. */
export function destroyGigaQueenState(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;g.hp[1]=s.kris_save_hp;g.maxhp[1]=s.kris_save_max_hp;g.charname[1]=sourceText('obj_gigaqueen_enemy_slash_Destroy_0_gml_4_0');
}

/** Boxing user3 is a loss transition. It does not invoke the ordinary party game-over path. */
export function loseBoxingRound(s:GmInstance,rt:GmRuntime,o:BoxingLifecycleObjects,enemy:GmObjectDef){
 const g=rt.globals;g.hp[1]=1;s.dead=.5;if(g.flag[526]<10)g.flag[526]++;
 sndFree(rt,s,g.batmusic[0]);s.health_count=0;s.dead_timer=0;g.turntimer=0;
 if(rt.exists(o.heart)||rt.exists(o.returnHeart)){
  rt.userEvent(s,0);for(const c of rt.all(o.battleController)){c.gigaqueencon=5;c.gigaqueentimer=0;}
 }
 for(const e of rt.all(enemy)){e.missleattack=0;e.breathattack=0;}
 for(const q of rt.all(o.queen))q.finalbaseballused=0;
}

/** Boxing user3 also resets the progressively priced SELF-FIX ACT. */
export function resetBoxingHealPrice(s:GmInstance,rt:GmRuntime,enemy:GmObjectDef){
 for(const e of rt.all(enemy)){e.healcount=0;rt.globals.actcost[e.myself][2]=50;spellMenuSetupChapter2(rt,e);}
}
