import type {GmInstance,GmRuntime} from '../../gm/runtime';
import {enemyObjectInit} from '../../deltarune/chapter2-enemy';
import {sideBPhase} from '../../deltarune/chapter2';
import {type QueenObject,queenInstance} from './context';

/** Queen Create: the plug actor is created before Queen's boss-specific fields. */
export function createQueenState(s:GmInstance,rt:GmRuntime,object:QueenObject){
 enemyObjectInit(s,rt);
 if(sideBPhase(rt)<2&&!rt.exists(object('obj_berdlyplug_enemy')))rt.create(object('obj_berdlyplug_enemy'),s.x+42,s.y-84);
 for(const b of rt.withInstances(object('obj_berdlyplug_enemy')))b.depth=s.depth+1;
 Object.assign(s,{talkmax:90,imageSpeed:1/6,depth:queenInstance(rt,object,'obj_battlecontroller').depth-1,
  idlesprite:'spr_queen_chair_1_old',hurtsprite:'spr_queen_chair_1_old',sparedsprite:'spr_queen_chair_1_old',
  lastsearch:0,difficulty:0,difficultydebug:0,attackdebug:-1,bufferattack:false,whiteAcid:true,shieldjustbroke:0,jp:rt.globals.lang==='ja'?1:0,
  turn:0,phaseturn:0,phase:1,finalphaseturns:0,usefinalattack:0,haveusedfinalattack:0,attackdone:0,wirescut:0,bardlymercy:0,shieldhp:0,shieldmaxhp:0,shieldacthp:0,shieldactmaxhp:0,
  throwX:0,targetmercy:25,aimact:0,intro:0,endcon:0,endtimer:0,defeat_cutscene_version:0,siner2:0,shieldbrokecon:0,hurtcon:0,wineglasscon:0,drink:0,shield_damage_buffer:0,
  beatwine2nodamage:0,usewineattack:0,ultimateattackused:0,shieldsize:7,balloonorder:0,ballooncon:0,balloonend:1,talkedcon:0,ralseitalks:0,susietalks:0,susieinterrupts:0,init:1,
  drunk:0,drunkcount:0,shieldjustwentup:0,shieldjustwentdown:0,finalattackdialoguecon:0,krisflattercount:0,susieflattercount:0,ralseiflattercount:0,groupflattercount:0,
  waitnextactsusie:0,waitnextactralsei:0,changesimulorder:0,wintimer:0,extracon:0,extratimer:0,
  krismaxhp:rt.globals.maxhp[1],susiemaxhp:rt.globals.maxhp[2],ralseimaxhp:rt.globals.maxhp[3]});
}
