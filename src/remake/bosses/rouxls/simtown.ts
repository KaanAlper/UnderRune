// Rouxls's mini-game ("Conquer Houses!"): a 16 by 6 board over the acid where Kris (blue houses) and Rouxls (red)
// claim tiles next to their own. Kris places houses through the BuildHouse ACTs, Rouxls before each of his attacks,
// and the battle ends when either side has nowhere left to build. Objects: obj_rouxls_simtown, obj_simtown_landmaker,
// obj_simtown_acidmaker, obj_house_placed_effect, obj_fx_growsquare; scripts scr_simtown_canbuild_check,
// scr_simtown_reset_cursor, scr_fx_housesquare.
import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {C} from '../../gm/graphics';
import {pointMeets} from '../../gm/collision';
import {darkMarker} from '../../deltarune/battle';
import {msgSet} from '../../deltarune/chapter2-battle';
import {battleTextDefault} from '../../deltarune/writer';
import {KEY,button1_p,pressed} from '../../deltarune/keys';
import {snd} from '../../deltarune/sound';
import {sourceText} from '../../host/text';

const W=16,H=6;
const STEP='obj_rouxls_simtown_slash_Step_0_gml_',DRAW='obj_rouxls_simtown_slash_Draw_0_gml_';
const grid=()=>Array.from({length:W},()=>Array<number>(H).fill(0));
/** The status line under the board for the cursor's tile: [x, y, key] overrides after the general ones. */
const SWAN=[[2,2,'53_0'],[2,3,'54_0'],[3,2,'55_0'],[3,3,'56_0']] as const;

export function createSimtown(object:(name:string)=>GmObjectDef){
 const rouxls=(rt:GmRuntime)=>rt.first(object('obj_rouxls_enemy'));
 /** scr_simtown_canbuild_check: a free land tile next to (or diagonally above or below) a side's house is theirs to
  * take; with none left for either side, the game is over. */
 function canBuildCheck(s:GmInstance){
  const land=s.TileLand as number[][],house=s.TileHasHouse as number[][],you=s.TileYouCanBuild as number[][],him=s.TileRouxlsCanBuild as number[][];
  s.YourAvailableTileTotal=0;s.RouxlsAvailableTileTotal=0;s.GameOver=0;
  for(s.i=0;s.i<W;s.i+=1)for(s.j=0;s.j<H;s.j+=1){
   const i=s.i,j=s.j;you[i][j]=0;him[i][j]=0;
   if(land[i][j]===1&&house[i][j]===0){
    const mark=(v:number)=>{if(v===1)you[i][j]=1;if(v===2)him[i][j]=1;};
    if(j>0)for(s.k=0;s.k<3;s.k+=1)mark(house[i-1+s.k][j-1]);
    if(j<5)for(s.k=0;s.k<3;s.k+=1)mark(house[i-1+s.k][j+1]);
    mark(house[i-1][j]);mark(house[i+1][j]);
   }
   if(you[i][j]===1)s.YourAvailableTileTotal+=1;
   if(him[i][j]===1)s.RouxlsAvailableTileTotal+=1;
  }
  if(s.YourAvailableTileTotal===0)s.GameOver=1;
  if(s.RouxlsAvailableTileTotal===0)s.GameOver=1;
 }
 /** scr_simtown_reset_cursor: on the first tile Kris can take (its visual x from the camera's y, as the script has it). */
 function resetCursor(s:GmInstance,rt:GmRuntime){
  if(s.GameOver!==0)return;
  for(s.i=0;s.i<W;s.i+=1)for(s.j=0;s.j<H;s.j+=1)if(s.TileYouCanBuild[s.i][s.j]===1){
   s.CursorX=s.i;s.CursorY=s.j;s.CursorVisualX=rt.view.y+s.i*40;s.CursorVisualY=rt.view.y+s.j*40+80;return;
  }
 }
 const growSquare:GmObjectDef={...object('obj_fx_growsquare'),events:{
  create:s=>{Object.assign(s,{color:C.red,active:0,timer:0,target:-1,growspeed:4,alpha:1.5,fadespeed:.1,growth:0});s.alarm[0]=1;},
  alarm0:s=>{s.active=1;},
  draw:(s,rt)=>{
   if(s.active!==1)return;
   s.alpha-=s.fadespeed;s.growth+=s.growspeed;
   const d=rt.drawState;d.alpha=s.alpha;d.color=s.color;
   rt.drawRect(s.x-s.growth-2,s.y-s.growth-2,s.x+s.growth+2,s.y+s.growth+2,true);d.alpha=1;
   if(s.alpha<=0)rt.destroy(s);
  },
 }};
 /** scr_fx_housesquare, run by `s`: three squares growing out of a new house, one every three frames. */
 function houseSquare(s:GmInstance,rt:GmRuntime,x:number,y:number,color:number){
  for(s.i=0;s.i<3;s.i++){const gr=rt.create(growSquare,x,y);gr.color=color;gr.alarm[0]=1+s.i*3;gr.depth=s.depth-10;}
 }
 const placedEffect:GmObjectDef={...object('obj_house_placed_effect'),events:{
  create:(s,rt)=>{
   const r=rt.random;
   s.sprite=r.choose('spr_house_placed_effect','spr_house_placed_effect2');s.imageSpeed=.4+r.random(-.1);
   s.imageXscale=r.randomRange(.9,1)*r.choose(-1,1);s.imageYscale=s.imageXscale*r.choose(-1,1);
   s.direction=90+r.randomRange(-45,15);s.speed=r.randomRange(.1,1.5);s.imageAngle=r.random(360);s.imageAlpha=r.random(.9)+.1;
   s.scalerX=r.random(.03)*s.imageXscale;s.scalerY=r.random(.03)*s.imageYscale;s.depth=-1000;s.imageIndex=1;
  },
  animationEnd:(s,rt)=>rt.destroy(s),
  step:s=>{s.speed*=.99;s.imageXscale+=s.scalerX;s.imageYscale+=s.scalerY;},
 }};
 /** A new house: its dust and the squares (Kris's 255 red, Rouxls's 16711680 blue, as GML colours). */
 function burst(s:GmInstance,rt:GmRuntime,left:number,tx:number,ty:number,color:number){
  // GML evaluates a call's arguments right to left: each effect's y is drawn before its x.
  const effect=()=>{const y=rt.view.y+(ty+1)*40+40+rt.random.irandom(40),x=left+tx*40+rt.random.irandom(40);rt.create(placedEffect,x,y);};
  for(let n=0;n<21;n++){
   effect();effect();
   houseSquare(s,rt,left+tx*40+20,rt.view.y+(ty+1)*40+40+20,color);
  }
 }
 /** User event 0: who has more houses. */
 function result(s:GmInstance,rt:GmRuntime){
  let kris=0,him=0;
  for(s.i=0;s.i<W;s.i+=1)for(s.j=0;s.j<H;s.j+=1){if(s.TileHasHouse[s.i][s.j]===1)kris++;if(s.TileHasHouse[s.i][s.j]===2)him++;}
  const g=rt.globals;
  if(kris>him){s.actresult='won';g.flag[435]=2;}else if(kris===him){s.actresult='tie';g.flag[435]=3;}else{s.actresult='lost';g.flag[435]=1;}
 }
 const simtown:GmObjectDef={...object('obj_rouxls_simtown'),events:{
  create:(s,rt)=>{
   s.base_xpos=rt.view.x;s.base_ypos=rt.view.y;s.maker=0;
   const r=rouxls(rt);if(!r)throw Error('obj_rouxls_simtown needs Rouxls');s.depth=r.depth+9997;
   Object.assign(s,{AvailableTension:150,HouseTensionCost:0,HouseCount:0,HouseCountMax:1,RouxlsTurn:0,RouxlsHouseMax:2,RalseiDistract:0,RalseiDistractTwice:0});
   s.TileLand=grid();s.TileHasHouse=grid();s.TileYouCanBuild=grid();s.TileRouxlsCanBuild=grid();s.tileHouseY=grid();
   const lands=rt.all(object('obj_simtown_landmaker'));
   for(s.i=0;s.i<W;s.i+=1)for(s.j=0;s.j<H;s.j+=1){
    const x=s.base_xpos+s.i*40+20,y=rt.view.y+s.j*40+100;
    if(lands.some(l=>l!==s&&pointMeets(rt.bank,l,x,y,false)))s.TileLand[s.i][s.j]=1;
   }
   s.TileHasHouse[4][0]=1;s.TileHasHouse[11][5]=2;
   Object.assign(s,{CursorX:0,CursorY:0,CursorVisualX:0,CursorVisualY:0,YourAvailableTileTotal:0,RouxlsAvailableTileTotal:0,GameOver:0,MyTurn:-1,TurnCon:0,StatusMessage:'* Build a house!'});
   canBuildCheck(s);resetCursor(s,rt);
   s.siner=0;s.actresult='tie';
   const cursor=darkMarker(rt,s,-100,-100,'spr_simtown_selector');s.specialCursor=cursor.id;cursor.depth=-100;cursor.imageSpeed=.2;
   s.flyaway=0;
  },
  destroy:(s,rt)=>{const c=rt.byId(s.specialCursor);if(c)rt.destroy(c);},
  user0:result,
  step:(s,rt)=>{
   const g=rt.globals;
   // Kris's turn: move over the board and claim a tile.
   if(s.MyTurn===1){
    if(pressed(rt,KEY.left)&&s.CursorX>0)s.CursorX-=1;
    if(pressed(rt,KEY.right)&&s.CursorX<15)s.CursorX+=1;
    if(pressed(rt,KEY.up)&&s.CursorY>0)s.CursorY-=1;
    if(pressed(rt,KEY.down)&&s.CursorY<5)s.CursorY+=1;
    if(button1_p(rt)&&s.TileYouCanBuild[s.CursorX][s.CursorY]===1){
     s.HouseCount++;s.TileYouCanBuild[s.CursorX][s.CursorY]=0;s.TileHasHouse[s.CursorX][s.CursorY]=1;snd(rt,'snd_noise');
     const r=rouxls(rt);if(!r)throw Error('obj_rouxls_simtown needs Rouxls');r.hasplayerplacedhouses=1;
     burst(s,rt,s.base_xpos,s.CursorX,s.CursorY,255);
     canBuildCheck(s);
     if(s.GameOver===1||s.HouseCount>=s.HouseCountMax){s.MyTurn=0;s.TurnCon=1;s.HouseCount=0;}
    }
   }
   // Kris is done: the game may be over (Rouxls ends the battle), or the ACT goes on.
   if(s.TurnCon===1){
    canBuildCheck(s);
    const r=rouxls(rt);
    if(s.GameOver===1){
     result(s,rt);
     if(r){g.mnfight=0;g.myfight=3;r.actcon=1;r.acting=-1;r.endbattle=1;r.actresult=s.actresult;}
     s.TurnCon=5;s.MyTurn=0;
     for(const e of rt.withInstances(object('obj_rouxls_enemy')))e.actcon=1;
    }else{
     for(const e of rt.withInstances(object('obj_rouxls_enemy'))){msgSet(rt,0,sourceText(STEP+'93_0'));battleTextDefault(rt,e);e.actcon=1;}
     s.TurnCon=5;s.MyTurn=0;
    }
   }
   // Rouxls's turn: a house every ten frames, on random tiles he can take.
   if(s.TurnCon===2){canBuildCheck(s);s.RouxlsWaitTimer=0;s.RouxlsHousesBuilt=0;s.TurnCon=3;}
   if(s.TurnCon===3){
    s.RouxlsWaitTimer+=1;
    if(s.RouxlsWaitTimer>=10){
     if(s.RouxlsHousesBuilt<s.RouxlsHouseMax-s.RalseiDistract&&s.GameOver===0){
      s.found=0;
      while(s.found===0){
       s.RandomHouseX=Math.floor(rt.random.random(15));s.RandomHouseY=Math.floor(rt.random.random(6));
       if(s.RandomHouseY===6)s.RandomHouseY=5;
       if(s.TileRouxlsCanBuild[s.RandomHouseX][s.RandomHouseY]===1)s.found=1;
      }
      s.TileYouCanBuild[s.RandomHouseX][s.RandomHouseY]=0;s.TileHasHouse[s.RandomHouseX][s.RandomHouseY]=2;
      canBuildCheck(s);s.RouxlsHousesBuilt+=1;s.RouxlsWaitTimer=0;
      burst(s,rt,rt.view.x,s.RandomHouseX,s.RandomHouseY,16711680);
      snd(rt,'snd_noise');
     }else s.TurnCon=4;
    }
   }
   if(s.TurnCon===4){
    if(s.GameOver===1)s.TurnCon=1;
    else{
     const r=rouxls(rt);if(!r)throw Error('obj_rouxls_simtown needs Rouxls');
     r.talked=1;s.TurnCon=5;
     // The source writes Myturn here (a new variable), not MyTurn.
     s.Myturn=0;
     s.RouxlsTurn++;s.HouseTensionCost=0;
     if(s.RalseiDistract===1)s.RalseiDistractTwice=1;
     if(s.RalseiDistract===0&&s.RalseiDistractTwice===1)s.RalseiDistractTwice=0;
     s.RalseiDistract=0;
     if(s.RouxlsTurn>2)s.RouxlsHouseMax=3;
     if(s.RouxlsTurn>5)s.RouxlsHouseMax=4;
     for(const e of rt.withInstances(object('obj_rouxls_enemy')))if(e.buildedblockstimer<50)e.buildedblockstimer=50;
    }
   }
   s.CursorIdealVisualX=s.CursorX*40;s.CursorIdealVisualY=s.CursorY*40+80;
   if(s.CursorVisualX>s.CursorIdealVisualX)s.CursorVisualX-=20;
   if(s.CursorVisualX<s.CursorIdealVisualX)s.CursorVisualX+=20;
   if(s.CursorVisualY>s.CursorIdealVisualY)s.CursorVisualY-=20;
   if(s.CursorVisualY<s.CursorIdealVisualY)s.CursorVisualY+=20;
  },
  draw:(s,rt)=>{
   s.siner+=1;
   const r=rouxls(rt);
   if(r)s.depth=s.MyTurn===1?-50:r.depth+9997;else s.depth=900000;
   const bx=s.base_xpos,by=s.base_ypos,glow=.6+Math.sin(s.siner/8)*.2;
   for(s.i=0;s.i<W;s.i+=1)for(s.j=0;s.j<H;s.j+=1){
    const i=s.i,j=s.j,x=bx+i*40,y=by+j*40+80,house=s.TileHasHouse[i][j],lift=s.tileHouseY[i][j];
    if(house===0&&s.TileLand[i][j]===1)rt.drawSprite('spr_acid_house',2,x,y+lift,1,1,0,C.white,1);
    if(house===1)rt.drawSprite('spr_acid_house',0,x,y+lift,1,1,0,C.white,1);
    if(house===2)rt.drawSprite('spr_acid_house',1,x,y+lift,1,1,0,C.white,1);
    if(s.MyTurn===1&&s.TileYouCanBuild[i][j]===1){
     if(s.CursorX===i&&s.CursorY===j){
      rt.drawSprite('spr_simtown_tile',0,x,y,1,1,0,C.yellow,glow);
      rt.drawSprite('spr_acid_house',0,x,y,1,1,0,C.white,.2+Math.sin(s.siner/8)*.1);
     }else rt.drawSprite('spr_acid_house',0,x,y,1,1,0,C.yellow,glow);
    }
   }
   // The line under the board says what the cursor's tile is.
   const cx=s.CursorX,cy=s.CursorY;
   s.StatusMessage=sourceText(DRAW+'47_0');
   if(s.TileHasHouse[cx][cy]!==0)s.StatusMessage=sourceText(DRAW+'48_0');
   if(s.TileYouCanBuild[cx][cy]===0&&s.TileHasHouse[cx][cy]!==1)s.StatusMessage=sourceText(DRAW+'49_0');
   if(s.TileLand[cx][cy]!==1)s.StatusMessage=sourceText(DRAW+'50_0');
   if(s.TileHasHouse[cx][cy]===2)s.StatusMessage=sourceText(DRAW+'51_0');
   for(const [x,y,key] of SWAN)if(cx===x&&cy===y)s.StatusMessage=sourceText(DRAW+key);
   const thrash=rt.first(object('obj_thrashmachine'));
   const machine=sourceText(DRAW+(thrash&&thrash.part[1]===3?'59_0':'58_0'));
   if(cx>=12&&cy>=1&&cy<=3)s.StatusMessage=machine;
   if(cx===13&&cy===1)s.StatusMessage=sourceText(DRAW+'72_0');
   if(s.MyTurn===0)s.StatusMessage='* Rouxls Turn. TurnCon:'+String(s.TurnCon);
   const cursor=rt.byId(s.specialCursor);
   if(s.MyTurn===1){
    const d=rt.drawState;d.font='fnt_mainbig';d.color=C.white;
    s.StatusMessage=String(s.StatusMessage).split('&').join('#');
    rt.drawText(bx+66,by+415,String(s.StatusMessage).split('#').join('\n'));
    rt.drawText(bx+66,by+387,sourceText(DRAW+'80_0').replace('~1','Z'));
    if(cursor){cursor.x=s.CursorVisualX;cursor.y=s.CursorVisualY;}
   }else if(cursor)cursor.y=-999;
   if(s.flyaway===1){
    const lift=s.tileHouseY as number[][];
    lift[6][2]-=16;lift[7][2]-=17;lift[8][2]-=16;lift[7][3]-=18;lift[8][3]-=15;lift[9][3]-=19;
   }
  },
 }};
 /** The board's land and acid tiles (they place the land; unseen outside the debug build). */
 const land:GmObjectDef={...object('obj_simtown_landmaker'),events:{create:(s,rt)=>{const r=rouxls(rt);if(r)s.depth=r.depth+9998;}}};
 const acid:GmObjectDef={...object('obj_simtown_acidmaker'),events:{create:(s,rt)=>{const r=rouxls(rt);if(!r)throw Error('obj_simtown_acidmaker needs Rouxls');s.depth=r.depth+9999;}}};
 return {objects:[simtown,land,acid,placedEffect,growSquare],simtown,land,acid};
}
