// obj_choicer_neo (Chapter 2 on): the two to four answers a writer offers with \C2, \C3 or \C4. Left and right pick
// the first two, up and down the others; Z takes it into global.choice. In battle it closes the writer with it.
import {gmArray,type GmObjectDef} from '../gm/runtime';
import {C} from '../gm/graphics';
import {KEY,button1_p,held} from './keys';

export const choicerNeo:GmObjectDef={name:'obj_choicer_neo',index:0,depth:-600,events:{
 create:(s,rt)=>{
  const g=rt.globals;
  s.alarm[1]=3;s.canchoose=0;s.dar=g.darkzone+1;g.flag[33]=0;
  s.fighting=g.fighting===1&&rt.instances.some(i=>i.live&&i.object.name==='obj_battlecontroller')?1:0;
  s.imageXscale=s.dar;s.imageYscale=s.dar;s.remfc=g.fc;g.fc=0;s.xx=rt.view.x;s.yy=rt.view.y;
  s.d=-1;
  if(rt.instances.some(i=>i.live&&i.object.name==='obj_dialoguer'))throw Error('obj_choicer_neo beside an overworld dialoguer is not ported');
  if(s.fighting===1)s.d=1;
  s.d_add=0;
  if(s.d===-1)throw Error('obj_choicer_neo outside battle (placed by the player character) is not ported');
  else if(s.d!==0)s.d_add=155;
  s.chx=140*s.dar+s.xx;s.chy=(36+s.d_add)*s.dar+s.yy+s.fighting*30;s.hx=s.chx;s.hy=s.chy;
  s.mychoice=-1;g.choice=-1;s.choiced=0;s.choicetotal=3;
  s.textposx=[0,0,0,0];s.textposy=[0,0,0,0];
 },
 // Alarm 1: choosing opens three frames in (the heart moves for three answers in the Dark World).
 alarm1:(s,rt)=>{s.canchoose=1;if(rt.globals.darkzone===1&&s.choicetotal===2){s.hy+=39;s.hx+=31;}},
 // Alarm 0: chosen.
 alarm0:(s,rt)=>{
  if(s.fighting===1)for(const w of rt.instances.filter(i=>i.live&&i.object.name==='obj_writer'))rt.destroy(w);
  for(const c of rt.withInstances(choicerNeo))rt.destroy(c);
 },
 user0:(s,rt)=>{if(s.canchoose===1&&s.choiced===0){s.choiced=1;rt.globals.choice=s.mychoice;s.alarm[0]=1;}},
 step:(s,rt)=>{
  const g=rt.globals,dar=s.dar,f=s.fighting;
  g.flag[33]+=1;
  if(!('textinit' in s)){if(s.choicetotal===1){if(g.darkzone===0)s.yy-=2;if(g.darkzone===1){s.yy-=3;if(g.lang==='ja')s.yy-=2;}}s.textinit=1;}
  if(s.canchoose===1){
   if(s.mychoice>=0&&button1_p(rt))rt.userEvent(s,0);
   if(s.choiced===0){
    if(held(rt,KEY.left))s.mychoice=0;
    if(s.choicetotal>=1&&held(rt,KEY.right))s.mychoice=1;
    if(s.choicetotal>=2&&held(rt,KEY.up))s.mychoice=2;
    if(s.choicetotal>=3&&held(rt,KEY.down))s.mychoice=3;
   }
  }
  rt.drawState.font=dar===1?'fnt_main':'fnt_mainbig';
  const text=(n:number)=>String(g.choicemsg[n]).replace(/#/g,'\n');
  gmArray(s,'heartposx');gmArray(s,'heartposy');
  s.heartposx[0]=s.xx+30*dar;s.heartposy[0]=s.yy+(34+s.d_add)*dar+f*30;
  s.textposx[0]=s.heartposx[0]+16*dar;s.textposy[0]=s.yy+(13+s.d_add)*dar+f*30;
  if(s.choicetotal>=1){
   s.heartposx[1]=s.xx+276*dar-rt.stringWidth(text(1));s.heartposy[1]=s.yy+(34+s.d_add)*dar+f*30;
   s.textposx[1]=s.heartposx[1]+16*dar;s.textposy[1]=s.yy+(13+s.d_add)*dar+f*30;
  }
  if(s.choicetotal>=2){
   const right0=s.heartposx[0]+16*dar+rt.stringWidth(text(0)),left1=s.heartposx[1];
   let width2=rt.stringWidth(text(2))+16*dar;
   if(s.choicetotal===3){const width3=rt.stringWidth(text(3))+16*dar;if(width3>width2)width2=width3;}
   s.heartposx[2]=right0+(left1-right0)/2-width2/2;s.heartposy[2]=s.yy+(16+s.d_add)*dar+f*30;
   s.textposx[2]=s.heartposx[2]+16*dar;s.textposy[2]=s.yy+(13+s.d_add)*dar+f*30;
  }
  if(s.choicetotal>=3){
   s.heartposx[3]=s.heartposx[2];s.heartposy[3]=s.yy+(60+s.d_add)*dar+f*30;
   s.textposx[3]=s.heartposx[3]+16*dar;s.textposy[3]=s.yy+(56+s.d_add)*dar+f*30;
  }
  if(s.mychoice>=0){s.hx=s.heartposx[s.mychoice];s.hy=s.heartposy[s.mychoice];}
 },
 draw:(s,rt)=>{
  if(s.canchoose!==1)return;
  const g=rt.globals,d=rt.drawState;d.font=s.dar===1?'fnt_main':'fnt_mainbig';s.textx=s.xx;s.texty=s.yy;
  for(s.i=0;s.i<s.choicetotal+1;s.i+=1){
   d.color=s.mychoice===s.i?C.yellow:C.white;s.textx=s.textposx[s.i];s.texty=s.textposy[s.i];
   rt.drawText(s.textx,s.texty,String(g.choicemsg[s.i]).replace(/#/g,'\n'));
  }
  rt.drawSprite('spr_heartsmall',0,s.hx,s.hy,s.imageXscale,s.imageYscale,0,C.white,1);
 },
}};
