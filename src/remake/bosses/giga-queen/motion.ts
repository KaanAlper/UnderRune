import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
/** scr_move_precise records its helper on the caller, then runs the first offset immediately. */
export function movePrecise(s:GmInstance,rt:GmRuntime,object:(name:string)=>GmObjectDef,type:number,x:number,y:number){
 const m=rt.create(object('obj_move_precise'),s.x,s.y);s._moveprecise=m.id;m.target=s.id;m.type=type;if(x!==0)m.xOrientation=x;if(y!==0)m.yOrientation=y;rt.userEvent(m,0);return m;
}
export function createPreciseMovement(object:(name:string)=>GmObjectDef):GmObjectDef{
 const apply=(s:GmInstance,rt:GmRuntime)=>{const target=rt.byId(s.target);if(target){target.x+=s.xx[s.movecount]*s.xOrientation;target.y+=s.yy[s.movecount]*s.yOrientation;if(s.image[s.movecount]!==-1){const c=rt.first(object('o_boxingcontroller'));if(!c)throw Error('Precise boxing movement requires o_boxingcontroller');if(c.wireframe_boxing===0)target.imageIndex=s.image[s.movecount];}}};
 return {...object('obj_move_precise'),events:{
  create:s=>{Object.assign(s,{moved:0,movecount:0,movemax:1,target:348398493,type:0,init:0,remx:0,remy:0,returnToOrigin:0,xOrientation:1,yOrientation:1,xx:[],yy:[],image:[],imagexscale:[],imageyscale:[]});for(s.i=0;s.i<20;s.i++){s.xx[s.i]=0;s.yy[s.i]=0;s.image[s.i]=-1;s.imagexscale[s.i]=1;s.imageyscale[s.i]=1;}},
  user0:(s,rt)=>{
   if(s.init!==0)return;s.init=1;
   if(s.type===0){s.movemax=8;[-12,-6,-2,4,6,10].forEach((v,i)=>s.xx[i]=v);}
   if(s.type===1){s.movemax=8;[-10,5,-3,2,-1,1].forEach((v,i)=>s.xx[i]=v);[-3,-1,1,3].forEach((v,i)=>s.yy[i]=v);}
   if(s.type===2){s.movemax=8;[-6,-2,0,0,1,3,4].forEach((v,i)=>s.yy[i]=v);}
   if([0,1,2].includes(s.type))for(let i=0;i<4;i++)s.image[i*2]=i;
   apply(s,rt);s.movecount++;s.moved=1;
  },
  endStep:(s,rt)=>{if(s.init===0)rt.userEvent(s,0);if(s.movecount>=s.movemax||!rt.byId(s.target))rt.destroy(s);else if(s.moved===0){apply(s,rt);s.movecount++;}s.moved=0;},
 }};
}
