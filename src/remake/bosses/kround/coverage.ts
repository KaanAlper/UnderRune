/** Explicit integration gate: independent attack ports do not certify battle flow. */
export const kroundSourceCoverage={
 encounterIds:['ch1-12','ch1-27'],
 completeEncounter:false,
 attackModes:[0,1,2,3,4],
 normalAttackOrder:[0,3,1,2],
 implementedObjects:['obj_checkers_enemy','obj_checkers_leap','obj_throwtarget','obj_throwralsei','obj_ralseithrown'],
 requiredGlobals:['turntimer','hp','maxhp','char','charinstance','battledf','charaction','faceaction','charcantarget','targeted','inv','invc','tension','maxtension','flag','monster','monstertype','monsterhp','monstermaxhp','monsterstatus','monsterat','monsterx','monstery','mercymod','mercymax','battlemsg','msg','myfight','mnfight','actname','battleat','fc','fe','typer'],
 requiredObjects:['obj_heart','obj_growtangle','obj_checkers_enemy','obj_heroralsei','obj_herosusie'],
 sharedDependencies:['obj_collidebullet','obj_regularbullet','obj_afterimage','obj_shake','scr_damage'],
 hostDependencies:['kroundHost.lang','kroundHost.writerExists','kroundHost.clearWriters','kroundHost.battleText','kroundHost.face','kroundHost.inputName','kroundHost.attackPhase','kroundHost.flash','kroundHost.healAnimation','kroundHost.checkerTransform','kroundHost.monsterSetup','kroundHost.roomName','kroundThrowHost.text','kroundThrowHost.clearWriters'],
 unsupportedSourceDependencies:[
  'scr_monstersetup: native monster stats, ACT grid and localization are delegated to the host',
  'obj_checker_animtest: crown removal, shrinking, battle-end and overworld cutscene branches',
  'obj_healanim and obj_oflash: milk and bow visual effects',
  'obj_writer/dialoguer: source localization, writer timing and face expressions (throw text requires a host adapter)',
 ],
} as const;
