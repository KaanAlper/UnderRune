import type {AssetStore} from '../../game/assets';
import type {DrawAssets} from './canvas';
import {SourceBattle} from './battle';
import {lengthdirX,lengthdirY} from '../gm/math';
import {pixelHeart} from '../../game/renderer';
import {C} from '../gm/graphics';
import {mergeColor,afterimage} from '../deltarune/battle';
// scr_charbox positions, original command/head/name/HP sprites and attackpress lanes.
const heads=['spr_headkris','spr_headsusie','spr_headralsei'];
const names=['spr_bnamekris','spr_bnamesusie','spr_bnameralsei'];
const icons=['spr_btfight','spr_btact','spr_btitem','spr_btspare','spr_btdefend'];
const colors=['#00ffff','#ff00ff','#00ff00'];
export class BattleView{
 private rot=0;private rotSpeed=0;private bgx=0;private bgAlpha=0;private black=0;
 private bgTint:HTMLCanvasElement|null=null;
 private trailTick=-1;
 constructor(readonly ctx:CanvasRenderingContext2D,readonly assets:AssetStore,readonly drawAssets:DrawAssets){}
 private text(s:string,x:number,y:number,color='#fff',scale=1,align:'left'|'center'|'right'='left'){this.assets.text(this.ctx,s,x,y,scale,color,align);}
 background(b:SourceBattle){
  if(b.id!=='ch1-25')return;
  // obj_jokerbg_triangle_real Draw/Other_10, cropped to the battle view by the HUD.
  this.bgAlpha=Math.min(1,this.bgAlpha+.02);const c=this.ctx,s=this.drawAssets.sprite('spr_carouselbg'),f=s?.frames[0];
  if(f){
   if(!this.bgTint){this.bgTint=document.createElement('canvas');this.bgTint.width=s!.width;this.bgTint.height=s!.height;const g=this.bgTint.getContext('2d')!;g.drawImage(this.drawAssets.pages[f.page],f.sx,f.sy,f.sw,f.sh,f.tx,f.ty,f.tw,f.th);g.globalCompositeOperation='multiply';g.fillStyle='#1a1a4d';g.fillRect(0,0,s!.width,s!.height);}
   let curx=0,curl=this.bgx,scale=1;c.save();c.globalAlpha=this.bgAlpha;
   for(let i=0;i<16;i++){c.drawImage(this.bgTint,curl,0,5,300,curx,-i,5*scale,300);scale=Math.floor(1+.5*i);curl=(curl+5)%640;curx+=5*scale-5;}
   for(let i=16;i>0;i--){c.drawImage(this.bgTint,curl,0,5,380,curx,-i,5*scale,380);scale=Math.ceil(1+.5*i);curl=(curl+5)%640;curx+=5*scale-5;}c.restore();
  }
  const tri=(i:number)=>{const a=this.rot+45*i,z=this.rot+45*(i+1);const x1=lengthdirX(360,a),x2=lengthdirX(360,z);let y1=lengthdirY(180,a),y2=lengthdirY(180,z);if(y1<=0)y1*=.6;if(y2<=0)y2*=.6;this.black=1-this.black;c.fillStyle=this.black?'#060679':'#202060';return {x1,x2,y1,y2};};
  const polygon=(ax:number,ay:number,bx:number,by:number,cx:number,cy:number)=>{c.beginPath();c.moveTo(ax,ay);c.lineTo(bx,by);c.lineTo(cx,cy);c.closePath();c.fill();};
  for(let i=0;i<8;i++){const p=tri(i);polygon(320,240,320+p.x1,240+p.y1,320+p.x2,240+p.y2);}
  for(let i=0;i<8;i++){const p=tri(i);if((p.y1>0||p.y2>0)&&p.x2>p.x1-48)polygon(320,160,320+p.x1/6,240+p.y1/6,320+p.x2/6,240+p.y2/6);}
  for(let i=8;i>=0;i--){const p=tri(i);if(p.y1>0||p.y2>0)polygon(320,160,320+p.x1/4,p.y1-140,320+p.x2/4,p.y2-140);}
  for(let i=0;i<8;i++){const p=tri(i);polygon(320,-80,320+p.x1,p.y1-80,320+p.x2,p.y2-80);}
  this.rotSpeed=Math.min(1,this.rotSpeed+.1);this.bgx=(this.bgx+1)%640;this.rot+=2.5*this.rotSpeed;
 }
 draw(b:SourceBattle){
  const c=this.ctx,g=b.rt.globals,rt=b.rt;const menu=['command','enemyTarget','act','magic','item','allyTarget'].includes(b.phase);
  const sprite=(name:string,frame:number,x:number,y:number,alpha=1)=>rt.drawSprite(name,frame,x+rt.view.x,y+rt.view.y,1,1,0,C.white,alpha);
  // TP is out of 250 internally; the original bar shows percent.
  sprite('spr_tplogo',0,8,70);sprite('spr_tensionbar',1,38,40);c.fillStyle='#ff9900';c.fillRect(41,Math.round(40+195*(1-b.tp/100)),21,Math.round(195*b.tp/100));this.text(b.tp>=100?'MAX':String(b.tp),8,110,b.tp>=100?'#ff0':'#fff');if(b.tp<100)this.text('%',13,135);
  c.fillStyle='#000';c.fillRect(0,328,640,152);c.fillStyle='#403347';c.fillRect(0,326,640,2);c.fillRect(0,362,640,2);
  for(let i=0;i<b.party.length;i++){
   const id=b.party[i],chunk=b.party.length===3?i*212:106+i*220,active=menu&&b.actor===i,color=colors[id-1],y=active?296:328;
   for(let k=0;k<5;k++)sprite(k===1&&id!==1?'spr_bttech':icons[k],b.phase==='command'&&active&&b.cursor===k?1:0,chunk+15+k*35,333,b.autoSusie&&i===1?.35:1);
   c.fillStyle=active?color:'#403347';c.fillRect(chunk,y-2,212,36);c.fillStyle='#000';c.fillRect(chunk+2,y,208,33);
   sprite(heads[id-1],0,chunk+13,y+8);sprite(names[id-1],0,chunk+51,y+11);sprite('spr_hpname',0,chunk+109,y+19);sprite('spr_hpslash',0,chunk+159,y+4);
   const hp=g.hp[id],max=g.maxhp[id];this.text(String(hp),chunk+160,y+6,hp<=0?'#f00':hp/max<=.25?'#ff0':'#fff',1,'right');this.text(String(max),chunk+205,y+6,'#fff',1,'right');
   c.fillStyle='#800000';c.fillRect(chunk+128,y+19,75,8);c.fillStyle=color;c.fillRect(chunk+128,y+19,Math.max(0,Math.ceil(hp/max*75)),8);
  }
  if(b.phase==='timing'){
   for(let i=0;i<3;i++){
    const y=365+38*i;rt.drawState.color=0x800000;if(i>0)rt.drawRect(2,y,302,y+2);
    if(!b.bolts.some(x=>x.actor===i))continue;
    rt.drawState.color=mergeColor([0xff0000,C.purple,C.green][b.party[i]-1],C.white,b.pressBuffer[i]/5);
    rt.drawRect(80,y,202,y+36,true);rt.drawRect(81,y+1,201,y+35,true);
    sprite('spr_pressfront',b.party[i]-1,2,y);sprite('spr_pressfront_b',0,2,y);sprite('spr_pressspot',b.party[i]-1,82,y);
    for(const bolt of b.bolts.filter(x=>x.actor===i&&x.alive)){const gap=bolt.frame-b.boltTick,x=82+gap*8;sprite('spr_attackspot',0,x,y,Math.min(1,1+gap/3));if(gap>=0&&b.boltTick%2===0&&this.trailTick!==b.boltTick){const trail=rt.create(afterimage,x+rt.view.x,y+rt.view.y);trail.sprite='spr_attackspot';trail.imageAlpha=.4;}}
   }
   this.trailTick=b.boltTick;b.pressBuffer=b.pressBuffer.map(n=>Math.max(0,n-1));
   // These sprites live in the GM scene, but the HUD's black fill is above the scene.
   // Draw their sprite once more above the lanes without running their Step/Draw events again.
   for(const effect of rt.instances)if(effect.live&&(effect.object.name==='obj_burstbolt'||effect.object===afterimage&&effect.sprite==='spr_attackspot'))rt.drawSelf(effect);
   if(b.timingFade>0){c.save();c.globalAlpha=Math.min(1,b.timingFade);c.fillStyle='#000';c.fillRect(1,364,640,116);c.restore();}
  }else if(menu&&b.phase!=='command'){
   const choices=b.choices,start=Math.floor(b.cursor/6)*6;
   for(let i=start;i<Math.min(choices.length,start+6);i++){const row=i-start,col=row%2,x=30+col*290,y=375+Math.floor(row/2)*30;const item=choices[i];if(i===b.cursor)pixelHeart(c,x-15,y+11,'#ff243c',1);this.text(item.name,x,y,item.disabled?'#777':i===b.cursor?'#ff0':'#fff');}
   const selected=choices[b.cursor];if(selected?.cost)this.text(`${Math.round(selected.cost/250*100)}% TP`,600,450,'#ff9900',1,'right');
   this.text('[X] BACK',620,460,'#807b87',1,'right');if(choices.length>6){this.text('< PREV',30,460,'#807b87');this.text('NEXT >',135,460,'#807b87');}
   if(b.phase==='enemyTarget'){c.fillStyle='#800000';c.fillRect(510,380,80,15);c.fillStyle='#0f0';c.fillRect(510,380,b.enemyHp/b.enemyMaxHp*80,15);if(b.tired)this.text('TIRED',510,409,'#00ffff');}
  }else if(b.phase==='enemyTalk'){
   c.fillStyle='#000';c.fillRect(270,75,185,120);c.fillStyle='#fff';c.fillRect(273,78,179,114);this.text(b.enemySpeech,283,86,'#000');
   this.text('* '+b.name+' prepares an attack.',30,375);this.text('[Z] CONTINUE',600,446,'#807b87',1,'right');
  }else{
   const message=b.phase==='command'?b.message:b.phase==='message'?b.message:b.phase==='victory'?'* YOU WON!':b.phase==='defeat'?'* The party fell.':b.message;
   const lines=this.wrap(message,560);this.text(lines.slice(0,3).join('\n'),30,375);if(b.phase==='message')this.text('[Z] CONTINUE',600,446,'#807b87',1,'right');
  }
 }
 private wrap(s:string,width:number){const lines:string[]=[];for(const paragraph of s.split('\n')){let line='';for(const word of paragraph.split(' ')){const next=line?line+' '+word:word;if(this.assets.textWidth(next,1)>width&&line){lines.push(line);line=word;}else line=next;}lines.push(line);}return lines;}
}
