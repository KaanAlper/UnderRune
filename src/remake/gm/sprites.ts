// Sprite facts the runtime needs: frame count, playback speed, origin, bounding box and precise masks.
export interface SpriteData{
 name:string;width:number;height:number;originX:number;originY:number;
 /** 0 automatic, 1 full image, 2 manual. */
 bboxMode:number;left:number;right:number;top:number;bottom:number;
 /** 0 axis-aligned rectangle, 1 precise per frame, 2 rotated rectangle. */
 sepMasks:number;frames:number;special:boolean;playbackSpeed:number;playbackType:number;
 /** Precise masks: one bit per pixel, MSB first, rows padded to whole bytes, full sprite size. */
 masks?:Uint8Array[]|null;
}
export interface SpriteBank{get(name:string):SpriteData|undefined;collisionCompat:boolean;roomSpeed:number}
export type RawSprite=Omit<SpriteData,'masks'>&{masks?:string[]|null};
export interface RawSpriteFile{atLeast2022_1:boolean;optionsInfo:number;sprites:RawSprite[]}

const decode=(b64:string)=>{const s=atob(b64);const out=new Uint8Array(s.length);for(let i=0;i<s.length;i++)out[i]=s.charCodeAt(i);return out;};
/** Builds a bank from the exported sprite table; masks are decoded on first use. */
export function spriteBank(file:RawSpriteFile,roomSpeed=30):SpriteBank{
 const raw=new Map(file.sprites.map(s=>[s.name,s]));const ready=new Map<string,SpriteData>();
 return {
  // Pre-2022.1 games, and later ones with options bit 27 set, use the old collision rules.
  collisionCompat:!file.atLeast2022_1||((file.optionsInfo>>>27)&1)===1,roomSpeed,
  get(name){
   let s=ready.get(name);if(s)return s;
   const r=raw.get(name);if(!r)return undefined;
   s={...r,masks:r.masks?r.masks.map(decode):null};ready.set(name,s);return s;
  },
 };
}
