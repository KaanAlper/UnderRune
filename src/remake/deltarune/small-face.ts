import type {GmInstance,GmObjectDef,GmRuntime} from '../gm/runtime';
import {C} from '../gm/graphics';
/** Source obj_smallface. Its animation deliberately advances in Draw, alongside the writer. */
export function createSmallFace(object:(name:string)=>GmObjectDef):GmObjectDef{
 return {...object('obj_smallface'),events:{
  create:(s,rt)=>{Object.assign(s,{stringpos:0,mystring:' ',part:1,partstring:' ',type:0,rate:1,active:0,finished:0,mycolor:C.purple,getrid:0,writergod:object('obj_writer'),nowdir:90,facealpha:0});s.alarm[0]=1;},
  alarm0:s=>{s.nowdir=s.direction;s.speed=0;s.active=1;if(s.type!==2&&s.type!==4)s.finished=1;},
  draw:(s,rt)=>{
   if(rt.globals.darkzone!==1)return;
   if(s.facealpha<1)s.facealpha+=0.2;rt.drawSprite(s.sprite,s.imageIndex,s.x,s.y,s.imageXscale,s.imageYscale,s.imageAngle,s.imageBlend,s.facealpha);rt.drawState.alpha=s.facealpha;
   const text=(y:number,value:string,x=s.x+70)=>{rt.drawState.font='fnt_main';rt.drawState.color=s.mycolor;rt.drawText(x,y,value.replace(/#/g,'\n'));};
   if(s.type===0||s.type===3)text(s.y+10,s.mystring);
   if(s.type===1&&s.active===1&&s.getrid===0){text(s.y+15,s.mystring);s.finished=1;}
   if((s.type===2||s.type===4)&&s.active===1){
    rt.drawState.font='fnt_main';rt.drawState.color=s.mycolor;
    if(s.finished===0){s.partstring+=s.mystring[s.part-1]??'';s.part++;if(s.part>=s.mystring.length+1)s.finished=1;}
    const x=s.x+70+rt.random.random(1),y=s.y+15+rt.random.random(1);text(y,s.partstring,x);
   }
   const writer=typeof s.writergod==='number'?rt.byId(s.writergod):rt.first(s.writergod);
   if(writer){if(s.finished===1&&s.getrid===0)s.finished=2;}else rt.destroy(s);
   if(s.getrid===1){s.direction=-s.nowdir;s.speed+=2;if(s.type===3||s.type===4)rt.destroy(s);}rt.drawState.alpha=1;
  },
 }};
}
/** The writer's \\fN command instantiates a configured miniature portrait once. */
export function installSmallFaceWriter(rt:GmRuntime,object:(name:string)=>GmObjectDef){
 rt.globals.onChapter2SmallFace=(s:GmInstance,code:string)=>{
  s.nextchar='f';s.nextchar2=code;s.faced=0;s.fam=0;s.fam=Number(code);const g=rt.globals,index=s.fam;
  if(rt.byId(g.sminstance[index]))return;
  const face=rt.create(object('obj_smallface'),g.smxx[index],g.smyy[index]);g.sminstance[index]=face.id;s.smallface=face.id;
  face.x+=s.x;face.y+=s.y;face.speed=g.smspeed[index];face.direction=g.smdir[index];face.type=g.smtype[index];face.sprite=g.smsprite[index];face.imageSpeed=g.smimagespeed[index];face.imageIndex=g.smimage[index];face.alarm[0]=g.smalarm[index];face.mystring=g.smstring[index];face.mycolor=g.smcolor[index];face.writergod=s.id;
 };
}
