import {gmArray,type GmObjectDef} from '../../gm/runtime';
import {mercyAdd2} from '../../deltarune/chapter2-battle';
import {destroyWriters} from '../../deltarune/writer';
/** The original Bump minigame controller. Input and the three independent car states are owned by the cars. */
export function createBerdlyCoasterController(object:(name:string)=>GmObjectDef):GmObjectDef{
 return {...object('o_coaster_controller'),events:{
  create:(s,rt)=>{
   Object.assign(s,{timer:0,timermax:180,playerinput:0,playerinputtimer:0,actcon:0,krisgooffscreen:0,susiegooffscreen:0,ralseigooffscreen:0,buttonspressed:0,bumpmercy:0,endcoaster:0,endcoastertimer:0,mykey:[90,88,67],HeroCoaster:[],yspot:[]});
   const bird=rt.create(object('o_coaster_berdly'),rt.view.x+470,rt.view.y+203);s.BerdlyCoaster=bird.id;
   const scene=rt.first(object('obj_ch2_scene11a'));if(scene)bird.x=rt.byId(scene.coaster_berdly)!.x+16;
   for(s.i=0;s.i<3;s.i++){
    const h=rt.create(object('o_coaster_hero'),rt.view.x+100-s.i*20,rt.view.y+149+60*s.i);s.HeroCoaster[s.i]=h.id;
    Object.assign(h,{HeroID:s.i,imageIndex:s.i,depth:h.y*-100,siner:0,mykey:s.mykey[s.i]});
    const back=rt.create(object('o_coaster_hero_back'),h.x,h.y);h.back=back.id;back.imageIndex=h.HeroID;back.parentid=h.id;
    s.yspot[s.i]=h.y;gmArray(bird,'yspot')[s.i]=h.y;
    rt.first(object('obj_herokris'))!.x=rt.view.x-200;
    for(const name of ['obj_herosusie','obj_heroralsei']){const hero=rt.first(object(name));if(hero)hero.x=rt.view.x-200;}
    h.sprite=['spr_krisb_idle','spr_susieb_idle','spr_ralsei_idle'][h.HeroID];
    if(scene){h.x=rt.byId(scene[['coaster_kris','coaster_susie','coaster_ralsei'][s.i]])!.x-22;h.sprite=['spr_krisb_attack','spr_susie_attack','spr_ralsei_battleintro'][s.i];}
   }
   Object.assign(s,{jamatime:90,jamatimer:0,littime:120,littimer:0});
  },
  step:(s,rt)=>{
   const enemy=rt.first(object('obj_berdlyb_enemy'))!,bird=rt.first(object('o_coaster_berdly'))!;
   if(s.endcoaster===1)for(const id of s.HeroCoaster){const h=rt.byId(id)!;if(h.x<h.xstart&&h.gooffscreen===1)h.x+=30;if(h.x>h.xstart&&h.gooffscreen===1)h.x=h.xstart;}
   if(s.playerinputtimer<12||s.actcon===1)s.playerinputtimer++;if(s.playerinputtimer===150)s.playerinput=1;
   if(enemy.bumpactstarted===1&&enemy.ralseigo===0&&enemy.susiego===0&&enemy.krisgo===0&&bird.movecon===0)s.endcoaster=1;
   if(s.endcoaster===1){
    for(const smoke of rt.all(object('o_coastersmoke')))rt.destroy(smoke);destroyWriters(rt);s.endcoastertimer=20;
    if(s.endcoastertimer===20){
     Object.assign(s,{endcoaster:0,endcoastertimer:0,krisgooffscreen:0,susiegooffscreen:0,ralseigooffscreen:0});
     for(const id of s.HeroCoaster)rt.byId(id)!.gooffscreen=0;for(const h of rt.all(object('o_coaster_hero')))h.forceact=0;
     if(s.HeroCoaster.every((id:number)=>rt.byId(id)!.con===0)){
      s.buttonspressed=0;Object.assign(enemy,{bumpwait:1,acting:0,actcon:1,actconsus:0,actconral:0,rideactgo:0,bumpactstarted:0,bumpactfast:0});enemy.alarm[7]=10;
      for(const h of rt.all(object('o_coaster_hero')))h.draw_button_press=0;
      if(rt.globals.mercymod[enemy.myself]<rt.globals.mercymax[enemy.myself])mercyAdd2(enemy,rt,enemy.myself,s.bumpmercy);
      if(rt.globals.mercymod[enemy.myself]>=100)enemy.endcon=1;
      s.bumpmercy=0;s.actcon=0;
     }
    }
   }
  },
 }};
}
