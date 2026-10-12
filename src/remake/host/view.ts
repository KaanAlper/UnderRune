// Jevil's room background (obj_jokerbg_triangle_real Draw/Other_10): the tinted carousel strip and the spinning
// triangles behind the battle. Everything else in a battle is drawn by the game objects themselves.
import type {DrawAssets} from './canvas';
import {lengthdirX,lengthdirY} from '../gm/math';
export class BattleView{
 private rot=0;private rotSpeed=0;private bgx=0;private bgAlpha=0;private black=0;
 private bgTint:HTMLCanvasElement|null=null;
 constructor(readonly ctx:CanvasRenderingContext2D,readonly drawAssets:DrawAssets){}
 background(){
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
}
