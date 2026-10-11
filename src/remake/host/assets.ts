import {spriteBank,type RawSpriteFile,type SpriteBank} from '../gm/sprites';
import type {DrawAssets,FontData,FrameRef} from './canvas';
import {assetUrl} from '../../game/url';
import type {SourceSound} from '../../game/audio';
import {setSourceText} from './text';
type Bundle=Omit<RawSpriteFile,'sprites'>&{pages:string[];sprites:(RawSpriteFile['sprites'][number]&{frameRects:(FrameRef|null)[]})[];fonts:Record<string,FontData|{kind:'bitmap';image:string;size:number;glyphs:Record<number,any>}>;sounds?:Record<string,{file:string;volume:number;pitch:number}>;text?:Record<string,string>};
export async function loadRemakeAssets():Promise<{bank:SpriteBank;draw:DrawAssets;sounds:Record<string,SourceSound>} >{
 const base=assetUrl('/generated/remake/ch1/');
 const response=await fetch(base+'bundle.json');if(!response.ok)throw Error('Practice assets could not load. Please retry.');
 const bundle=await response.json() as Bundle;
 const pages=await Promise.all(bundle.pages.map(name=>loadImage(base+name)));
 const fonts=new Map<string,FontData>();
 for(const [name,font] of Object.entries(bundle.fonts)){
  if(font.kind==='bitmap'&&'image' in font){const page=pages.length;pages.push(await loadImage(base+font.image));fonts.set(name,{...font,page,sx:0,sy:0});}
  else fonts.set(name,font as FontData);
 }
 const sprites=new Map(bundle.sprites.map(s=>[s.name,{...s,frames:s.frameRects}]));
 setSourceText(bundle.text??{});
 return {bank:spriteBank(bundle),draw:{pages,sprite:name=>sprites.get(name),font:name=>fonts.get(name)},sounds:Object.fromEntries(Object.entries(bundle.sounds??{}).map(([name,s])=>[name,{url:base+s.file,volume:s.volume,pitch:s.pitch}]))};
}
function loadImage(url:string):Promise<HTMLImageElement>{
 return new Promise((resolve,reject)=>{const image=new Image(),timer=setTimeout(()=>{image.src='';reject(Error('Asset load timed out. Please retry.'));},15000);image.onload=()=>{clearTimeout(timer);resolve(image);};image.onerror=()=>{clearTimeout(timer);reject(Error('Practice image could not load. Please retry.'));};image.src=url;});
}
