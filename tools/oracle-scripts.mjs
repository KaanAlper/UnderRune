// Key scripts for reference recordings: which keys go down and up on which frame. The same script is replayed in
// the original (tools/oracle-record.mjs --script=NAME) and in the remake's parity tests, so a script only needs to be
// deterministic, not to know the battle's state. Frame numbers are replay indices (input at index N affects the
// state traced at N+1).
const Z=90,C=67,LEFT=37,UP=38,RIGHT=39,DOWN=40;

function events(){
 const script={};
 const at=f=>script[f]??={keysPressed:[],keysReleased:[]};
 return {script,press:(f,key)=>at(f).keysPressed.push(key),release:(f,key)=>at(f).keysReleased.push(key)};
}
/** Z pressed for one frame every 8 frames: dialogue advances, FIGHT is chosen, the soul never moves. */
export function zScript(totalFrames,every=8){
 const {script,press,release}=events();
 for(let f=30;f<totalFrames;f+=every){press(f,Z);release(f+1,Z);}
 return script;
}
/** For battles with ACT menus and a shooting soul: a 400-frame cycle that taps arrows and Z through the menus (so each
 * cycle lands on other commands and ACTs), then holds Z for 50 frames and lets go (a charged BIG SHOT), and moves the
 * soul a little. The phases drift against the battle's turns, so a long run reaches most commands. */
export function menuScript(totalFrames){
 const {script,press,release}=events();
 const tap=(f,key)=>{if(f<totalFrames){press(f,key);release(f+1,key);}};
 for(let base=30;base<totalFrames;base+=400){
  // Commands: arrows between the confirms pick different buttons, targets and ACTs.
  const seq=[RIGHT,Z,Z,DOWN,Z,Z,Z,RIGHT,RIGHT,Z,Z,DOWN,DOWN,Z,Z,Z,LEFT,Z,Z,Z,C,Z,Z,Z];
  seq.forEach((key,i)=>tap(base+i*8,key));
  // A charged shot: Z held long enough to charge fully, then released.
  const hold=base+200;if(hold+52<totalFrames){press(hold,Z);release(hold+52,Z);}
  // The soul moves up and down a little.
  if(base+270<totalFrames){press(base+260,UP);release(base+270,UP);}
  if(base+300<totalFrames){press(base+290,DOWN);release(base+300,DOWN);}
  // Then confirms again (text, the next commands).
  for(let f=base+310;f<base+400;f+=8)tap(f,Z);
 }
 return script;
}
export const SCRIPTS={z:zScript,menu:menuScript};
