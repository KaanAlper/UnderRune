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
for(let chapter=1;chapter<=5;chapter++){
 const packageId=`chapter${chapter}_windows`,base=path.join(root,'extracted',packageId);
 const index=JSON.parse(await fs.readFile(path.join(base,'index.json'),'utf8'));
 const names=new Set(catalog.filter(r=>r.chapter===chapter).flatMap(r=>r.enemies.map(e=>e.sprite)));
 for(const s of index.sprites)if((chapter===1&&common.test(s.name))||extra.test(s.name))names.add(s.name);
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
const tracks=['nightmare_boss_heavy','joker','kingboss','lancerfight','lancer_susie','checkers','battle','cyber_battle','queen_boss','berdly_battle','berdly_battle_heartbeat_true','spamton_battle','spamton_neo_mix_ex_wip','ruruskaado','rouxls_battle','smart_race','knight','tenna_battle','gerson_theme_nointro','titan_battle','titan_spawn','ch4_battle','pink','flowery','flowery_iog','battle_vapor'];
await fs.mkdir(path.join(output,'music'),{recursive:true});
for(const name of tracks){const file=name+'.ogg';try{await fs.copyFile(path.join(game,'mus',file),path.join(output,'music',file));manifest.music.push(name);}catch{}}
const sourceManifest=JSON.parse((await fs.readFile(path.join(root,'extracted/source-manifest.json'),'utf8')).replace(/^\uFEFF/,''));
manifest.sourcePackages=sourceManifest;
await fs.writeFile(path.join(output,'manifest.json'),JSON.stringify(manifest));
console.log(`${Object.keys(manifest.sprites).length} sprite animations, ${manifest.music.length} local tracks`);
