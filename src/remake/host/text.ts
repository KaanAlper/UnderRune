// Game dialogue is not kept in this repository. The asset build copies the lines listed in text-keys.json from the
// player's own game language file into the site bundle, and loadRemakeAssets installs them here before a battle.
let lines:Record<string,string>={};
export function setSourceText(text:Record<string,string>){lines=text;}
export const hasSourceText=()=>Object.keys(lines).length>0;
/** A line by its game key; missing lines are an error (the asset build was not run or text-keys.json lacks it). */
export function sourceText(key:string){
 const s=lines[key];if(s===undefined)throw Error(`Missing game text ${key}. Run the asset build with the game installed.`);return s;
}
/** For text a battle can still run without (Jevil and Lancer lines): empty when missing. */
export const optionalSourceText=(key:string)=>lines[key]??'';
