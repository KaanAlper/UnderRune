// Queen's search windows: a window opens, types what she searches for and drops the result into the fight (a gun,
// two flails or junk), or closes again. Object: obj_queen_search_window. The words are the game's own literals
// (`<code file>#<n>` text keys).
import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {lerp} from '../../gm/math';
import {sourceText} from '../../host/text';
import {type QueenObject,queenInstance} from './context';

/** What each search types (the English literals; the Japanese ones are for global.lang "ja"). */
const SEARCH_WORDS:Readonly<Record<number,string>>={0:'gml_Object_obj_queen_search_window_Step_0#2',1:'gml_Object_obj_queen_search_window_Step_0#4',
 2:'gml_Object_obj_queen_search_window_Step_0#6',3:'gml_Object_obj_queen_search_window_Step_0#7',4:'gml_Object_obj_queen_search_window_Step_0#8'};
/** search -1: one of these, picked at random. */
const DECOYS=['gml_Object_obj_queen_search_window_Step_0#15','gml_Object_obj_queen_search_window_Step_0#16','gml_Object_obj_queen_search_window_Step_0#17',
 'gml_Object_obj_queen_search_window_Step_0#18','gml_Object_obj_queen_search_window_Step_0#19','gml_Object_obj_queen_search_window_Step_0#20'];

/** scr_bullet_create, run by `s`: a bullet with its maker's damage, target and element. */
function bulletCreate(s:GmInstance,rt:GmRuntime,x:number,y:number,def:GmObjectDef){
 const d=rt.create(def,x,y);d.damage=s.damage;d.target=s.target;if('element' in s)d.element=s.element;return d;
}

export function createQueenSearch(object:QueenObject):GmObjectDef[]{
 const window:GmObjectDef={...object('obj_queen_search_window'),events:{
  create:s=>{
   Object.assign(s,{search:0,targetstring:sourceText('gml_Object_obj_queen_search_window_Create_0#0'),init:0,imageXscale:0,imageYscale:0,state:0,imageSpeed:0,stringlength:0,timer:0,
    typetimer:0,childdireciton:180,spawndelay:0,firsttime:false,damage:-1,target:-1,quick:false,donttypeanything:0});
  },
  step:(s,rt)=>{
   if(s.init!==0)return;
   const word=SEARCH_WORDS[s.search];
   if(word!==undefined)s.targetstring=sourceText(word);
   else if(s.search===-1)s.targetstring=sourceText(rt.random.choose(...DECOYS)).replace(/#/g,'\n');
   s.init=1;s.depth++;
  },
  draw:(s,rt)=>{
   // Open: a squash, then a stretch to full size.
   if(s.state===0){
    s.imageIndex=11;s.timer+=s.timer+1;s.imageXscale=lerp(4,1,s.timer/30);s.imageYscale=lerp(0,4,s.timer/30);
    if(s.timer>=30){s.state=1;s.timer=0;}
   }
   if(s.state===1){
    s.timer+=s.timer+1;s.imageXscale=lerp(1,2,s.timer/15);s.imageYscale=lerp(4,2,s.timer/15);
    if(s.timer>=15){s.timer=0;s.state=s.quick?3:2;s.imageXscale=2;s.imageYscale=2;}
   }
   rt.drawSelf(s);
   // Typing, with a blinking caret before and after.
   if(s.state===2){
    const d=rt.drawState,text=String(s.targetstring),count=Math.max(0,Math.min(Math.floor(s.timer/2),text.length));
    d.color=0x89d931;d.font='fnt_main';
    let shown=text.slice(0,count);
    if(count===0||count===text.length){
     if(s.donttypeanything===0){s.typetimer++;if(!s.firsttime)s.typetimer++;shown+=s.typetimer%40<20?'|':' ';}
    }else s.typetimer=0;
    const h=d.halign,v=d.valign;d.halign=1;d.valign=1;rt.drawText(s.x,s.y,shown);d.halign=h;d.valign=v;
    s.timer++;if(!s.firsttime&&s.search>-1&&s.search<3)s.timer++;
    if(s.timer>=45+s.spawndelay){s.state=3;s.timer=0;}
   }
   // What was found.
   if(s.state===3){
    if(s.search===1){
     const box=queenInstance(rt,object,'obj_growtangle'),d=bulletCreate(s,rt,s.x-20*Math.sign(box.x-s.x),s.y+12,object('obj_queen_search_gun'));s.d=d.id;d.parentwindow=s.id;s.state=4;
    }else if(s.search===2){
     const length=135+rt.random.random(65);
     for(s.i=0;s.i<2;s.i++){const d=bulletCreate(s,rt,s.x,s.y,object('obj_queen_search_flail'));s.d=d.id;d.maxchainlength=length;d.parentwindow=s.id;d.direction+=s.i*180;}
     s.state=4;
    }else if(s.search===3){const d=bulletCreate(s,rt,s.x,s.y,object('obj_queen_search_junk'));s.d=d.id;d.parentwindow=s.id;s.state=4;}
    else s.state=5;
   }
   // Close.
   if(s.state===5){
    s.timer+=s.timer+1;s.imageXscale=lerp(2,4,s.timer/30);s.imageYscale=lerp(2,0,s.timer/30);
    if(s.timer>=30)rt.destroy(s);
   }
  },
 }};
 return [window];
}
