import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
/** scr_losechar / scr_getchar's party-index refresh, in native with-instance order. */
function refreshParty(rt:GmRuntime,object:(name:string)=>GmObjectDef){
 const g=rt.globals;
 for(const dc of rt.all(object('obj_darkcontroller'))){
  dc.chartotal=0;for(let i=0;i<4;i++)dc.havechar[i]=0;
  for(dc.i=0;dc.i<3;dc.i++){
   g.faceaction[dc.i]=0;const character=g.char[dc.i];
   if(character!==0)dc.chartotal++;
   if(character>=1&&character<=4){dc.havechar[character-1]=1;dc.charpos[character-1]=dc.i;}
  }
 }
}
/** Source CleanUp. Preserve slot zero; scr_getchar appends without deduplicating characters. */
export function cleanupHammer(s:GmInstance,rt:GmRuntime,object:(name:string)=>GmObjectDef){
 const g=rt.globals;rt.setSpriteOffset('spr_spearblocker',32,32);g.invc=1;g.sp=4;
 g.char[2]=0;g.char[1]=0;refreshParty(rt,object);g.submenu=0;g.charselect=-1;
 // The source indexed write allocates this global even in a fresh battle-only session.
 g.submenucoord??=[];for(s.i=0;s.i<36;s.i++)g.submenucoord[s.i]=0;
 for(const character of [2,3]){
  s.getchar=0;
  for(let slot=0;slot<3;slot++)if(g.char[slot]===0&&s.getchar===0){g.char[slot]=character;s.getchar=1;}
  refreshParty(rt,object);
 }
 g.charturn=3;
}
