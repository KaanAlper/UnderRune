import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import {fileURLToPath} from 'node:url';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const game=process.env.DELTARUNE_DIR??'C:/Program Files (x86)/Steam/steamapps/common/DELTARUNE';
const catalog=JSON.parse(await fs.readFile(path.join(root,'src/bosses/catalog.json'),'utf8'));
const output=path.join(root,'public/generated');await fs.mkdir(output,{recursive:true});
const manifest={version:1,sprites:{},font:null,music:[],sourcePackages:[]};
const common=/^spr_(krisb_idle|susieb_idle|ralseib_idle|heart|heartsmall|spadebullet|diamondbullet|clubsbullet|joker_scythebody|carousel|suitsbomb|bomb_heart|smallbullet|axebullet_b|lancerbike|kris_d|kris_walkdown|kris_down|star|bullet|sneo_body|sneo_wings|sneo_legs|sneo_head|spamton_neo|tenna_pose_podium|queen_chair_1|queen_idle|checker|knight_bullet_star|gerson_bell|titan_feather)/;
const extra=/^spr_(shadow_mantle_idle|susiezilla_susie_idle|tenna_point_up|kris_board|kris_sword|berdlyb_idle|rurus_pirate|tasque_idle|lanino_idle|elnina_idle|mauswheel|sneo_face|sneo_body|sneo_wings|sneo_head|sneo_legs|smallbullet|heart_centered)/;
// Theater intro, DELTARUNE side: logo, dark-world Kris, the Chapter 2 TV remote, Tenna's stage curtain and spotlight.
const theater={1:['IMAGE_LOGO','spr_krisd_dark','spr_krisu_dark'],2:['spr_cutscene_16_remote_control'],3:['spr_dw_tv_curtain','spr_tenna_spotlight']};
for(let chapter=1;chapter<=5;chapter++){
 const packageId=`chapter${chapter}_windows`,base=path.join(root,'extracted',packageId);
 const index=JSON.parse(await fs.readFile(path.join(base,'index.json'),'utf8'));
 const names=new Set(catalog.filter(r=>r.chapter===chapter).flatMap(r=>r.enemies.map(e=>e.sprite)));
 for(const s of index.sprites)if((chapter===1&&common.test(s.name))||extra.test(s.name)||theater[chapter]?.includes(s.name))names.add(s.name);
 const dir=path.join(output,'sprites',String(chapter));await fs.mkdir(dir,{recursive:true});
 let count=0;
 for(const s of index.sprites.filter(s=>names.has(s.name))){
  if(!/^[a-zA-Z0-9_]+$/.test(s.name))throw Error('Unsafe sprite name');
  const frames=[];
  for(let f=0;f<Math.min(s.frames.length,32);f++){
   const t=s.frames[f];if(!t||!t.sw||!t.sh)continue;
   const input=path.join(base,'textures',t.page+'.png'),file=`sprites/${chapter}/${s.name}_${f}.png`;
   await sharp(input).extract({left:t.sx,top:t.sy,width:t.sw,height:t.sh}).png().toFile(path.join(output,file));
   frames.push({url:'/generated/'+file,width:t.sw,height:t.sh,x:t.tx,y:t.ty,targetWidth:t.tw,targetHeight:t.th});
  }
  if(frames.length){manifest.sprites[`${chapter}:${s.name}`]={name:s.name,width:s.width,height:s.height,originX:s.originX,originY:s.originY,frames};count++;}
 }
 if(chapter===1){
  const font=index.fonts.find(f=>f.name==='fnt_main');
  if(font){const p=path.join(base,'textures',font.page+'.png');
   // Glyph coordinates in the texture page are font-relative.
   const right=Math.max(...font.glyphs.map(g=>g.x+g.w)),bottom=Math.max(...font.glyphs.map(g=>g.y+g.h));
   await sharp(p).extract({left:font.sx,top:font.sy,width:right,height:bottom}).png().toFile(path.join(output,'font.png'));
   manifest.font={...font,url:'/generated/font.png'};
  }
 }
 console.log(`Chapter ${chapter}: ${count} sprite animations`);
}
// Theater intro, UNDERTALE side (sprite key "0:"), from the user's own install via tools/extract-undertale.ps1. Optional.
try{
 const base=path.join(root,'extracted/undertale'),index=JSON.parse(await fs.readFile(path.join(base,'index.json'),'utf8'));
 await fs.mkdir(path.join(output,'sprites','0'),{recursive:true});
 const exportFrame=async(t,file,crop)=>{
  const region=crop?{left:t.sx+crop.x,top:t.sy+crop.y,width:crop.w,height:crop.h}:{left:t.sx,top:t.sy,width:t.sw,height:t.sh};
  await sharp(path.join(base,'textures',t.page+'.png')).extract(region).png().toFile(path.join(output,file));
  return crop?{url:'/generated/'+file,width:crop.w,height:crop.h,x:0,y:0,targetWidth:crop.w,targetHeight:crop.h}:{url:'/generated/'+file,width:t.sw,height:t.sh,x:t.tx,y:t.ty,targetWidth:t.tw,targetHeight:t.th};
 };
 const frisk=index.sprites.find(s=>s.name==='spr_maincharad');
 if(frisk){const frames=[];for(const [f,t] of frisk.frames.entries())frames.push(await exportFrame(t,`sprites/0/spr_maincharad_${f}.png`));
  manifest.sprites['0:spr_maincharad']={name:'spr_maincharad',width:frisk.width,height:frisk.height,originX:frisk.originX,originY:frisk.originY,frames};}
 // The installed title is the "Bits and Pieces" logo: keep only the UNDERTALE(TM) wordmark (rows 88-118, x 17-303; row 119 is already the subtitle outline).
 const title=index.sprites.find(s=>s.name==='spr_undertaletitle');
 if(title){const crop={x:17,y:88,w:287,h:31};
  manifest.sprites['0:ut_wordmark']={name:'ut_wordmark',width:crop.w,height:crop.h,originX:0,originY:0,frames:[await exportFrame(title.frames[0],'sprites/0/ut_wordmark_0.png',crop)]};}
 const font=index.fonts.find(f=>f.name==='fnt_main');
 if(font){const right=Math.max(...font.glyphs.map(g=>g.x+g.w)),bottom=Math.max(...font.glyphs.map(g=>g.y+g.h));
  await sharp(path.join(base,'textures',font.page+'.png')).extract({left:font.sx,top:font.sy,width:right,height:bottom}).png().toFile(path.join(output,'ut-font.png'));
  manifest.utFont={...font,url:'/generated/ut-font.png'};}
 console.log('UNDERTALE: theater sprites and font');
}catch(error){if(error.code!=='ENOENT')throw error;console.log('UNDERTALE not extracted; the theater uses its text fallback.');}
const tracks=['nightmare_boss_heavy','joker','kingboss','lancerfight','lancer_susie','checkers','battle','cyber_battle','queen_boss','berdly_battle','berdly_battle_heartbeat_true','spamton_battle','spamton_neo_mix_ex_wip','ruruskaado','rouxls_battle','smart_race','knight','tenna_battle','gerson_theme_nointro','titan_battle','titan_spawn','ch4_battle','pink','flowery','flowery_iog','battle_vapor'];
await fs.mkdir(path.join(output,'music'),{recursive:true});
for(const name of tracks){const file=name+'.ogg';try{await fs.copyFile(path.join(game,'mus',file),path.join(output,'music',file));manifest.music.push(name);}catch{}}
const sourceManifest=JSON.parse((await fs.readFile(path.join(root,'extracted/source-manifest.json'),'utf8')).replace(/^\uFEFF/,''));
manifest.sourcePackages=sourceManifest;
await fs.writeFile(path.join(output,'manifest.json'),JSON.stringify(manifest));
console.log(`${Object.keys(manifest.sprites).length} sprite animations, ${manifest.music.length} local tracks`);
