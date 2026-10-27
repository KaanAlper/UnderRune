/** scr_gamestart_chapter_override's Chapter 4 base stats, before equipment and story level-up progression. */
export function chapter4StartStats(){
 // scr_gamestart initializes slot zero too; reflected shots intentionally read its derived battle stats.
 return {hp:[200,200,230,180],maxhp:[250,200,230,180],at:[10,17,22,15],df:[2,2,2,2],mag:[0,0,3,14]};
}
