// The earlier single-monster basket variant is retained by Mauswheel's event, although current Catch uses split.
import {le,lt} from '../../gm/math';
import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {button3_p,monsterPop} from '../../deltarune/controller';
import {rememberXY,moveToPointOverTime,moveToRememberXY,mercyAdd2,snd} from '../../deltarune/chapter2-battle';
const instance=(rt:GmRuntime,id:number)=>{const i=rt.byId(id);if(!i)throw Error(`Maus basket requires instance ${id}`);return i;};
export function createMausBasket(object:(name:string)=>GmObjectDef):GmObjectDef[]{
 const hitbox:GmObjectDef={...object('obj_act_hitbox'),events:{create:s=>{s.monster=0;s.visible=false;},step:(s,rt)=>{const b=rt.first(object('obj_maus_basket'));if(!b)throw Error('Maus ACT hitbox requires basket');const m=instance(rt,b.mymonster[s.which]);s.x=m.x;s.y=m.y+14;}}};
 const fake:GmObjectDef={...object('obj_maus_trapping_fake_idle'),events:{create:s=>{s.imageSpeed=1/6;s.imageXscale=2;s.imageYscale=2;},step:()=>{}}};
 const basket:GmObjectDef={...object('obj_maus_basket'),events:{
  create:(s,rt)=>{Object.assign(s,{maker:0,depth:-10,biggestwidth:1,biggestheight:1,trappingX:false,cancatch:[0,0,0],ismaus:[0,0,0],caught:[0,0,0],init:0,visible:false,mymonster:[],monstersiner:[],monsterhit:[],monsterx:[],monsterhitbox:[]});s.i=3;const w=rt.first(object('obj_mauswheel_enemy'));if(w){rt.create(fake,w.x,w.y);w.idlesprite='spr_maus_idle';w.x+=60;w.y+=66;}},
  alarm4:s=>{s.con++;},
  step:(s,rt)=>{
   if(s.init===0){s.visible=true;for(s.i=0;s.i<3;s.i++){s.mymonster[s.i]=0;const m=rt.byId(rt.globals.monsterinstance[s.i]);if(m&&rt.globals.monster[s.i]===1){s.mymonster[s.i]=m.id;if(s.cancatch[s.i]){if(m.object.name==='obj_maus_enemy')s.ismaus[s.i]=1;if(rt.spriteWidth(m)>s.biggestwidth)s.biggestwidth=rt.spriteWidth(m);if(rt.spriteHeight(m)>s.biggestheight)s.biggestheight=rt.spriteHeight(m);}}}
    s.imageXscale=s.biggestwidth/rt.spriteWidth(s)*1.2;s.imageYscale=s.biggestheight/rt.spriteHeight(s)*1.2;if(le(s.imageXscale,1))s.imageXscale=1;if(le(s.imageYscale,1))s.imageYscale=1;
    s.siner=rt.random.random(100);s.y=rt.view.y-rt.spriteHeight(s);s.x=rt.view.x+rt.view.width/2-rt.spriteWidth(s)/2;s.basketx=s.x;s.x+=Math.sin(s.siner/5)*120;s.magnitude=50;moveToPointOverTime(s,rt,s.x,rt.view.y+10,15);
    for(s.i=0;s.i<3;s.i++){if(s.mymonster[s.i]===0)continue;const m=instance(rt,s.mymonster[s.i]);s.monstersiner[s.i]=s.i*4;s.monsterhit[s.i]=0;m.__baskety=rt.view.y+100+70*s.i;if(monsterPop(rt)===1)m.__baskety=rt.view.y+240;
     if(s.cancatch[s.i]){s.monsterx[s.i]=rt.view.x+rt.view.width/2+rt.spriteWidth(s)/2;m.__monsterx=s.monsterx[s.i]-Math.sin(s.monstersiner[s.i]/7)*s.magnitude;rememberXY(m);moveToPointOverTime(m,rt,m.__monsterx,rt.exists(object('obj_mauswheel_enemy'))?m.y:m.__baskety,15);}
     if(s.cancatch[s.i]===0){s.monsterx[s.i]=rt.view.x+rt.view.width+200;rememberXY(m);moveToPointOverTime(m,rt,rt.view.x+rt.view.width+rt.spriteWidth(m),m.y,15);}
     const h=rt.create(hitbox,m.x+rt.spriteWidth(s)/2-20,m.y+rt.spriteHeight(s));s.monsterhitbox[s.i]=h.id;h.imageXscale=m.object.name==='obj_tasque_enemy'?6:2;h.imageYscale=0.5;h.visible=false;h.which=s.i;h.parentid=m.id;
    }s.dropped=0;s.sineradd=0;s.con=1;s.alarm[4]=16;s.init=1;
   }
   if(s.init===1){if(s.con===2){for(s.i=0;s.i<3;s.i++)if(s.mymonster[s.i]>0)instance(rt,s.mymonster[s.i]).x=s.monsterx[s.i];s.con=3;}
    if(s.con===3){if(lt(s.sineradd,0.8))s.sineradd+=0.05;if(s.dropped===0){s.siner+=s.sineradd;s.x=s.basketx+Math.sin(s.siner/5)*120;if(button3_p(rt)){s.dropped=1;s.vspeed=16;s.gravity=1;snd(rt,'snd_wallclaw');}}
     if(s.magnitude<100)s.magnitude+=5;
     for(s.i=0;s.i<3;s.i++){if(s.mymonster[s.i]<=0)continue;const m=instance(rt,s.mymonster[s.i]);if(s.caught[s.i]===1){m.y=s.y-5;m.x+=(s.x-m.x)*0.1;}if(s.monsterhit[s.i]===0){s.monstersiner[s.i]+=s.sineradd;if(s.cancatch[s.i]===1)m.x=s.monsterx[s.i]-Math.sin(s.monstersiner[s.i]/7)*s.magnitude;const h=instance(rt,s.monsterhitbox[s.i]);h.y=m.y+rt.spriteHeight(s);h.x=m.x+rt.spriteWidth(s)/2-20;if(s.ismaus[s.i]===1)h.x=m.x+rt.spriteWidth(s)/2-40;if(m.object.name==='obj_tasque_enemy'){h.x=m.x+rt.spriteWidth(s)/2-68;h.y=m.y+rt.spriteHeight(s)-22;}}}
     if(s.dropped===1&&s.y>=rt.view.y+300-rt.spriteHeight(s)){s.gravity=0;s.vspeed=0;s.con=4;s.alarm[4]=15;}
    }
   }
   if(s.con===5){s.caughttotal=0;for(s.i=0;s.i<3;s.i++){if(s.mymonster[s.i]<=0)continue;moveToRememberXY(instance(rt,s.mymonster[s.i]),rt,15);if(s.monsterhit[s.i]===1){s.caughttotal++;mercyAdd2(s,rt,s.i,rt.exists(object('obj_mauswheel_enemy'))?5:100);}}
    const m=instance(rt,s.maker);if(s.caughttotal===0)m.actfailure=1;if(s.trappingX&&s.caughttotal<monsterPop(rt))m.actfailure=1;m.actcon=12;for(const h of rt.all(hitbox))rt.destroy(h);s.vspeed=-16;s.con=6;
   }
   if(s.con===6&&le(s.y,-200)){rt.destroy(s);for(const w of rt.all(object('obj_mauswheel_enemy'))){w.idlesprite='spr_mauswheel_idle';w.x-=60;w.y-=66;}for(const f of rt.all(fake))rt.destroy(f);}
  },
 },collisions:[{target:hitbox,run:(s,o,rt)=>{if(s.caught[o.which]===0){s.caught[o.which]=1;const mouse=instance(rt,o.parentid).object.name==='obj_maus_enemy',name=mouse?'snd_squeaky':'snd_noise';rt.soundStop?.(name);snd(rt,name);rt.sourceAudio?.volume(name,mouse?1:0.8,0);}s.monsterhit[o.which]=1;instance(rt,s.maker).caught[o.which]=1;for(const w of rt.all(object('obj_mauswheel_enemy')))w.actfailure=0;}}]};
 return [hitbox,fake,basket];
}
