import catalogData from './catalog.json';
import type {BossDefinition,EncounterRecord} from '../game/types';
import {nativePatterns,attack,ring,shot} from './patterns';
import {jevilAttacks} from './jevil/attacks';
import {knightStream} from './knight/attacks';
export const catalog=catalogData as EncounterRecord[];
const profiles:Record<string,{family:string;music:string;accent:string}>={
 obj_lancerboss:{family:'lancer',music:'lancerfight',accent:'#55aaff'},obj_lancerboss2:{family:'lancer',music:'lancerfight',accent:'#55aaff'},obj_lancerboss3:{family:'lancer',music:'lancer_susie',accent:'#55aaff'},obj_susieenemy:{family:'susie',music:'lancer_susie',accent:'#db77cb'},obj_clubsenemy:{family:'clover',music:'battle',accent:'#dbf275'},obj_checkers_enemy:{family:'round',music:'checkers',accent:'#ef4a56'},obj_king_boss:{family:'king',music:'kingboss',accent:'#5788eb'},
 obj_tasque_manager_enemy:{family:'tasque',music:'cyber_battle',accent:'#e5ba51'},obj_werewerewire_enemy:{family:'wire',music:'cyber_battle',accent:'#fcdf39'},obj_berdlyb_enemy:{family:'berdly',music:'smart_race',accent:'#6fe9fb'},obj_berdlyb2_enemy:{family:'berdly',music:'smart_race',accent:'#6fe9fb'},obj_queen_enemy:{family:'queen',music:'queen_boss',accent:'#b3a4ff'},obj_spamton_enemy:{family:'spamton',music:'spamton_battle',accent:'#fca8f1'},obj_spamton_neo_enemy:{family:'neo',music:'spamton_neo_mix_ex_wip',accent:'#fff500'},obj_sweet_enemy:{family:'sweet',music:'cyber_battle',accent:'#ed6ccc'},obj_hatguy_enemy:{family:'sweet',music:'cyber_battle',accent:'#6cf3f4'},obj_kk_enemy:{family:'sweet',music:'cyber_battle',accent:'#63f985'},obj_rouxls_enemy:{family:'rouxls',music:'rouxls_battle',accent:'#7eb7fb'},obj_mauswheel_enemy:{family:'mauswheel',music:'cyber_battle',accent:'#e5e7f8'},obj_gigaqueen_enemy:{family:'giga',music:'queen_boss',accent:'#bb99ff'},
 obj_tenna_enemy:{family:'tenna',music:'tenna_battle',accent:'#b0ff48'},obj_tenna_board4_enemy:{family:'tenna',music:'tenna_battle',accent:'#b0ff48'},obj_rouxls_ch3_enemy:{family:'rouxls',music:'ruruskaado',accent:'#76bbff'},obj_knight_enemy:{family:'knight',music:'knight',accent:'#b0a3e5'},obj_lanino_enemy:{family:'weather',music:'tenna_battle',accent:'#ffe898'},obj_elnina_enemy:{family:'weather',music:'tenna_battle',accent:'#75ccf5'},obj_lanino_rematch_enemy:{family:'weather',music:'ch4_battle',accent:'#ffe898'},obj_elnina_rematch_enemy:{family:'weather',music:'ch4_battle',accent:'#75ccf5'},
 obj_hammer_of_justice_enemy:{family:'hammer',music:'gerson_theme_nointro',accent:'#fdcd74'},obj_titan_enemy:{family:'titan',music:'titan_battle',accent:'#d8d2ee'},obj_titan_spawn_enemy:{family:'titan',music:'titan_spawn',accent:'#d8d2ee'},obj_jackenstein_enemy:{family:'jackenstein',music:'ch4_battle',accent:'#ed7949'},obj_holywatercooler_enemy:{family:'water',music:'ch4_battle',accent:'#a4eaff'},
 obj_netskie_enemy:{family:'netskie',music:'battle_vapor',accent:'#99e596'},obj_terracota_enemy:{family:'terracotta',music:'battle_vapor',accent:'#ca9469'},obj_aqua_enemy:{family:'aqua',music:'battle_vapor',accent:'#8fdeff'},obj_orange_enemy:{family:'orange',music:'battle_vapor',accent:'#ff9f5d'},obj_green_enemy:{family:'orange',music:'battle_vapor',accent:'#85fd8c'},obj_blue_enemy:{family:'blue',music:'battle_vapor',accent:'#9fc6ff'},obj_yellow_enemy:{family:'blue',music:'battle_vapor',accent:'#fcfa84'},obj_purple_enemy:{family:'seth',music:'battle_vapor',accent:'#dc9af7'},obj_pink_enemy:{family:'pink',music:'pink',accent:'#fe84c4'},obj_flowery_enemy:{family:'flowery',music:'flowery',accent:'#fff081'},
};
export function getDefinition(record:EncounterRecord):BossDefinition{
 if(record.id==='ch3-mantle'||record.id==='ch3-susiezilla'){
  const special=record.id==='ch3-mantle'?'mantle':'susiezilla';
  const source=record.sources[0].packageId+':'+record.sources[0].code.join(' / ');
  const attacks=special==='mantle'?[
   attack('mantle-burst','BURST WAVE',source,c=>{if(c.tick%100===0)ring(c,460,230,12,2.1,'star',c.tick/60,{damage:2});}),
   attack('mantle-flames','FLAME WAVE',source,c=>{if(c.tick%45===0)for(let i=0;i<5;i++)shot(c,c.arena.x+i*c.arena.width/4,c.arena.y+c.arena.height,Math.PI*1.5,2,'sun',{damage:2});}),
   attack('mantle-ultimate','FINAL DASH',source,c=>{if(c.tick%60===0)ring(c,460,230,16,2.6,'star',c.tick/45,{damage:2});})
  ]:[attack('susiezilla-kick','KICK / ZIP / TWIRL',source,()=>{})];
  return {record,special,attacks,sequence:attacks.map((_,i)=>i),music:special==='mantle'?'nightmare_boss_heavy':'tenna_battle',accent:'#d7a0fc',canSpare:false,mercyGoal:0,description:'ACTION ENCOUNTER',differences:['Ayrı aksiyon uyarlaması: kaynak HP ve Shadow Mantle faz eşikleri korunur. Arena, hareket dengesi, saldırı seçimleri ve final sekansları tarayıcıya uyarlanmıştır; özgün oyuna birebir eşdeğer değildir. AT/DF bu aksiyon modunda kullanılmaz.']};
 }
 const jevil=record.enemies.some(e=>e.object==='obj_joker');
 if(jevil)return {record,attacks:jevilAttacks,sequence:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],music:'joker',accent:'#b899ff',canSpare:true,mercyGoal:10,description:'CHAOS, CHAOS! I CAN DO ANYTHING!',differences:['Saldiri secimi ve temel zamanlamalar kaynaktan aktarildi. Son saldiri, kalp bombasi, parti dengesi ve Pirouette etkileri henuz birebir dogrulanmadi.']};
 const chosen=record.enemies.filter(e=>profiles[e.object]);
 if(!chosen.length)throw Error('No explicit boss adaptation: '+record.id);
 const p=profiles[chosen[0].object];
 const attacks=chosen.flatMap(e=>{const patterns=nativePatterns(profiles[e.object].family,`${record.sources[0].packageId}:gml_Object_${e.object}_Step_0 / Other_15`,record.encounter);return profiles[e.object].family==='knight'?[knightStream,...patterns]:patterns;}).filter((a,i,arr)=>arr.findIndex(x=>x.id===a.id)===i);
 return {record,attacks,sequence:attacks.map((_,i)=>i),music:p.music,accent:p.accent,canSpare:!['king','knight','titan','hammer','giga','flowery'].includes(p.family),mercyGoal:p.family==='round'?5:6,description:record.kind==='secret'?'A SECRET SIGNAL. A FAMILIAR CHALLENGE.':`* ${record.name} stands in your way.`,differences:['Gorseller ve istatistikler kurulumdan cikarildi. Saldirilar bossa ozel tarayici uyarlamalaridir; tum faz, eylem ve sonuc kosullari orijinal oynanisla henuz birebir dogrulanmadi.']};
}
