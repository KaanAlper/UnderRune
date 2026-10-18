// The Thrash Machine Rouxls rides (obj_thrashmachine): the robot the party built earlier in the chapter, drawn from
// its three chosen parts (flags 221 body, 220 head, 222 feet) in their chosen colours (flags 224, 223, 225), each
// part drawn twice (plain, then its colour added on top). The glow and outline scripts it draws with are here too.
import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {C,makeColorHsv,mergeColor} from '../../gm/graphics';
import {lengthdirX,lengthdirY,pointDirection,pointDistance} from '../../gm/math';

type Vec={x:number;y:number};
/** scr_rotatevector: (x, y) turned by `angle` degrees (a new struct, like the script's). */
export function rotateVector(rt:GmRuntime,x:number,y:number,angle:number):Vec{
 const v=rt.createStruct({x,y});
 if(angle===0)return v;
 const dir=pointDirection(0,0,x,y),len=pointDistance(0,0,x,y);
 v.x=lengthdirX(len,dir+angle);v.y=lengthdirY(len,dir+angle);return v;
}
/** draw_sprite_ext_glow, run by `s` (its `glow` mixes the colour in): the sprite, then its glow as fog. */
export function drawGlow(s:GmInstance,rt:GmRuntime,sprite:string,frame:number,x:number,y:number,xs:number,ys:number,angle:number,blend:number,alpha:number,color:number=C.white){
 const tint=color!==C.white?mergeColor(blend,color,s.glow):blend;
 if(s.glow<1)rt.drawSprite(sprite,frame,x,y,xs,ys,angle,tint,alpha);
 if(s.glow>0){
  if(color===C.white)rt.drawBlendMode('add');
  rt.drawSpriteFog(sprite,frame,x,y,xs,ys,angle,color,s.glow);
  if(color===C.white)rt.drawBlendMode('normal');
 }
}
/** draw_sprite_part_ext_glow (its glow half as fog is not ported: only the power-up effect sets glow). */
function drawPartGlow(s:GmInstance,rt:GmRuntime,sprite:string,frame:number,left:number,top:number,w:number,h:number,x:number,y:number,xs:number,ys:number,blend:number,alpha:number,color:number=C.white){
 const tint=color!==C.white?mergeColor(blend,color,s.glow):blend;
 if(s.glow<1)rt.drawSpritePart(sprite,frame,left,top,w,h,x,y,xs,ys,tint,alpha);
 if(s.glow>0)throw Error('draw_sprite_part_ext_glow with glow is not ported');
}
/** scr_draw_outline_ext: the sprite as a silhouette in `color`, shifted by `width` four ways. */
export function drawOutline(rt:GmRuntime,sprite:string,frame:number,x:number,y:number,xs:number,ys:number,angle:number,color:number,alpha:number,width:number){
 let xa=width,xb=0,ya=0,yb=width;
 if(angle%90!==0){xa=lengthdirX(width,angle);xb=lengthdirX(width,angle+90);ya=lengthdirY(width,angle+90);yb=lengthdirY(width,angle);}
 for(const [dx,dy] of [[xa,ya],[-xa,-ya],[xb,yb],[-xb,-yb]])rt.drawSpriteFog(sprite,frame,x+dx,y+dy,xs,ys,angle,color,alpha);
}
/** scr_orbitx / scr_orbity: (x2, y2) turned `angle` degrees around (x1, y1). */
const orbit=(x1:number,y1:number,x2:number,y2:number,angle:number):[number,number]=>{
 if(angle===0)return [x2,y2];
 const t=pointDirection(x1,y1,x2,y2)+angle,r=pointDistance(x1,y1,x2,y2);return [x1+lengthdirX(r,t),y1+lengthdirY(r,t)];
};
/** Each head part: its offset from the body (x, y in s), its sprite, and whether it turns with headangle. */
const HEADS:readonly [number,number,string,boolean][]=[[-8,6,'spr_thrashweapon_laser',false],[-10,6,'spr_thrashweapon_sword',true],[-4,5,'spr_thrashweapon_flame',true],[-8,3,'spr_thrashweapon_duck',true]];

export function createThrashMachine(object:(name:string)=>GmObjectDef):GmObjectDef{
 /** Sets the blend mode and part colours for one of the two passes (plain, then the colours added). */
 function pass(s:GmInstance,rt:GmRuntime){
  const c=s.color as number[],dc=s.dcolor as number[];
  if(s.loop===0){rt.drawBlendMode('normal');c[0]=s.basecolor;c[1]=s.basecolor;c[2]=s.basecolor;}
  if(s.loop===1){rt.drawBlendMode('add');c[0]=dc[0];c[1]=dc[1];c[2]=dc[2];}
 }
 return {...object('obj_thrashmachine'),events:{
  create:(s,rt)=>{
   const g=rt.globals;
   Object.assign(s,{dbselect:0,color:[C.white,C.white,C.white],dcolor:[g.flag[223],g.flag[224],g.flag[225]],part:[g.flag[221],g.flag[220],g.flag[222]],partx:[s.x],party:[s.y],
    defaultsinerrate:.8,wsinerrate:.8,a:1,s:3,xx:s.x,yy:s.y,headangle:0,siner:0,wsiner:0,animate:1,bad:0,value:1,basecolor:C.white,init:0,duckmode:0,headx:s.x,heady:s.y,
    laststep:0,stomp:0,moving:0,drawfeet:1,glow:0,override_color:C.white,launch:false,rim_flash:0,body_flash:0,draw_puddle:false,after_image:false,puddleHeight:220});
  },
  step:(s,rt)=>{
   if(s.init!==0)return;
   const g=rt.globals,p=s.part as number[];p[1]=g.flag[220];p[0]=g.flag[221];p[2]=g.flag[222];
   if(p[0]===3&&p[1]===3&&p[2]===3)s.duckmode=1;
   s.init=1;
  },
  draw:(s,rt)=>{
   const g=rt.globals,p=s.part as number[],c=s.color as number[],sc=s.s,a=s.a,oc=s.override_color;
   s.dcolor[1]=makeColorHsv(g.flag[223]*8,255,255*s.value);s.dcolor[0]=makeColorHsv(g.flag[224]*8,255,255*s.value);s.dcolor[2]=makeColorHsv(g.flag[225]*8,255,255*s.value);
   s.basecolor=mergeColor(C.black,C.white,s.value);s.wsinerrate=.8;
   if(p[2]>=0)s.wsiner+=s.wsinerrate;
   if(s.animate===0){s.siner=0;s.wsiner=0;}
   s.walkc=Math.cos(s.wsiner/3);
   let x2=0,y2=0;
   if(s.launch){
    s.imageAngle-=35;s.yy=s.y;
    if(s.imageAngle%360!==0){const xo=-3*sc,yo=12*sc;x2=s.xx;y2=s.yy;const [ox,oy]=orbit(x2,y2,x2-xo,y2-yo,s.imageAngle);s.xx=ox+xo;s.yy=oy+yo;}
   }
   const angle=s.imageAngle,doFlash=s.rim_flash>0||s.body_flash>0,rim=mergeColor(C.black,C.white,s.rim_flash),flashColor=mergeColor(C.black,C.white,s.body_flash);
   // The far foot, behind the body.
   for(s.loop=0;s.loop<2;s.loop+=1){
    pass(s,rt);const flash=s.loop===1&&doFlash;
    s.walka=-Math.sin(s.wsiner/6);s.walkb=-Math.cos(s.wsiner/6);
    if(s.moving===1&&p[2]===0&&s.walkb<=0)s.walkb*=3;
    let v=rt.createStruct({x:0,y:0});
    if(!s.drawfeet)continue;
    let image=0;
    if(s.bad===0){
     if(p[2]===0){v=rotateVector(rt,-11*sc+sc*s.walka*2,19*sc+sc*s.walkb,angle);image=0;}
     if(p[2]===1){v=rotateVector(rt,-6*sc+sc*s.walka*2,17*sc+sc*s.walkb,angle);image=1;}
     if(p[2]===3){image=4;v=rotateVector(rt,-8*sc+sc*s.walka*2,21*sc+sc*s.walkb,angle);}
     if(p[2]!==2)drawGlow(s,rt,'spr_thrashfoot',image,s.xx+v.x,s.yy+v.y,sc,sc,angle,c[2],a,oc);
     if(flash){drawGlow(s,rt,'spr_thrashfoot',image,s.xx+v.x,s.yy+v.y,sc,sc,angle,C.white,a,flashColor);drawGlow(s,rt,'spr_thrashfoot_flash',image,s.xx+v.x,s.yy+v.y,sc,sc,angle,rim,a);}
    }else{
     const far:Readonly<Record<number,[number,number,number]>>={0:[0,-11,19],1:[1,-6,17],3:[4,-8,21]};const f=far[p[2]];
     if(f)drawGlow(s,rt,'spr_thrashfoot_b',f[0],s.xx+f[1]*sc+sc*s.walka*2,s.yy+f[2]*sc+sc*s.walkb,sc/2,sc/2,0,c[2],a,oc);
    }
   }
   // The body.
   if(p[0]>=0)for(s.loop=0;s.loop<2;s.loop+=1){
    pass(s,rt);const flash=doFlash&&s.loop===1;
    const v=rotateVector(rt,0,sc*s.walkc,angle);
    if(!flash&&doFlash)drawOutline(rt,'spr_thrashbody',p[0],s.xx,s.yy+v.y,sc,sc,angle,C.white,s.rim_flash,2);
    if(s.bad===0)drawGlow(s,rt,'spr_thrashbody',p[0],s.xx,s.yy+v.y,sc,sc,angle,c[0],a,oc);
    else if(s.bad===1)drawGlow(s,rt,'spr_thrashbody_b',p[0],s.xx,s.yy+v.y,sc/2,sc/2,angle,c[0],a,oc);
    if(flash){rt.drawBlendMode('add');rt.drawSprite('spr_thrashbody_flash',p[0],s.xx,s.yy+v.y,sc,sc,angle,mergeColor(c[0],C.white,.5),s.rim_flash);}
   }
   // The head (the weapon).
   for(s.loop=0;s.loop<2;s.loop+=1){
    pass(s,rt);const flash=doFlash&&s.loop===1;
    const head=HEADS[p[1]];
    if(s.bad===0){
     if(head){
      const [hx,hy,sprite,turns]=head,v=rotateVector(rt,hx*sc,hy*sc+sc*s.walkc*2,angle);
      s.headx=s.xx+v.x;s.heady=s.yy+v.y;
      if(!flash&&doFlash)drawOutline(rt,sprite,0,s.headx,s.heady,sc,sc,angle,C.white,s.rim_flash,2);
      drawGlow(s,rt,sprite,0,s.headx,s.heady,sc,sc,(turns?s.headangle:0)+angle,c[1],a,oc);
      if(flash){rt.drawBlendMode('add');drawGlow(s,rt,sprite+'_flash',0,s.headx,s.heady,sc,sc,angle,mergeColor(c[1],C.white,.5),s.rim_flash);}
     }else if(flash)throw Error('obj_thrashmachine flashes a head it has none of');
    }else if(head){
     const [hx,hy,sprite]=head;s.headx=s.xx+hx*sc;s.heady=s.yy+hy*sc+sc*s.walkc*2;
     const duck=p[1]===3;drawGlow(s,rt,duck?sprite:sprite+'_b',0,s.headx,s.heady,duck?sc:sc/2,duck?sc:sc/2,s.headangle,c[1],a,oc);
    }
   }
   // The near foot, in front: its step makes the stomp.
   for(s.loop=0;s.loop<2;s.loop+=1){
    pass(s,rt);const flash=s.rim_flash>0&&s.loop===1;
    s.walka=Math.sin(s.wsiner/6);s.walkb=Math.cos(s.wsiner/6);
    if(s.walkb>=0&&s.laststep<0)s.stomp=1;else if(s.walkb<=0&&s.laststep>0)s.stomp=-1;
    s.laststep=s.walkb;
    if(s.moving===1&&p[2]===0&&s.walkb<=0)s.walkb*=3;
    if(s.bad===0){
     let bottom=6,image=0,v:Vec={x:0,y:0};
     const foot=(dx:number,dy:number,h:number,img:number)=>{
      v=rotateVector(rt,dx,dy,angle);image=img;
      if(!s.drawfeet)drawPartGlow(s,rt,'spr_thrashfoot',img,0,0,34,h,s.xx+dx,s.yy+dy,sc,sc,c[2],a,oc);
      else drawGlow(s,rt,'spr_thrashfoot',img,s.xx+v.x,s.yy+v.y,sc,sc,angle,c[2],a,oc);
     };
     if(p[2]===0){foot(-5*sc+sc*s.walka*2,20*sc+sc*s.walkb,4,0);bottom=4;}
     if(p[2]===1)foot(sc*s.walka*2,18*sc+sc*s.walkb,6,1);
     if(p[2]===2)foot(-15*sc,18*sc,6,2);
     if(p[2]===3){s.walka=Math.sin(s.wsiner/6);s.walkb=Math.cos(s.wsiner/6);foot(sc*s.walka*2,22*sc+sc*s.walkb,2,3);bottom=2;}
     if(flash){
      rt.drawBlendMode('add');const tint=mergeColor(c[2],C.white,.5);
      if(!s.drawfeet)rt.drawSpritePart('spr_thrashfoot_flash',image,0,0,34,bottom,s.xx+v.x,s.yy+v.y,sc,sc,tint,s.rim_flash);
      else rt.drawSprite('spr_thrashfoot_flash',image,s.xx+v.x,s.yy+v.y,sc,sc,angle,tint,s.rim_flash);
     }
    }else{
     if(p[2]===0)drawGlow(s,rt,'spr_thrashfoot_b',0,s.xx-5*sc+sc*s.walka*2,s.yy+20*sc+sc*s.walkb,sc/2,sc/2,0,c[2],a,oc);
     if(p[2]===1)drawGlow(s,rt,'spr_thrashfoot_b',1,s.xx+sc*s.walka*2,s.yy+18*sc+sc*s.walkb,sc/2,sc/2,0,c[2],a,oc);
     if(p[2]===2)drawGlow(s,rt,'spr_thrashfoot_b',2,s.xx-15*sc,s.yy+18*sc,sc/2,sc/2,0,c[2],a,oc);
     if(p[2]===3){s.walka=Math.sin(s.wsiner/6);s.walkb=Math.cos(s.wsiner/6);drawGlow(s,rt,'spr_thrashfoot',3,s.xx+sc*s.walka*2,s.yy+22*sc+sc*s.walkb,sc,sc,0,c[2],a,oc);}
    }
   }
   rt.drawBlendMode('normal');
   if(s.imageAngle%360!==0){s.xx=x2;s.yy=y2;}
  },
 }};
}
