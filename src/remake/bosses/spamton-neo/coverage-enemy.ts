// Audit before implementation: each responsibility remains in its archived ordered source event.
export const NEO_ENEMY_RESPONSIBILITIES={
 Create_0:['source enemy fields','hitdetector','eight sprite origin anchors','18 background strings','vine/ACT/ending/phase state','voice/music timing'],
 Step_0:['normal talk balloons and exact localization keys','box/heart transitions','rr-specific controller type/difficulty/timing','Snap/SnapAll actor staging','Supercharge 20 shots','two FluffyGuard shields (limit four)','source damage/hurt/TP state','normal pacifist and violent ending branches','final scr_wincombat boundary'],
 Step_2:['single-shot mercy batching','head anchor restoration','incremental foreground/background wire cuts','transition effects','weakening shake'],
 Draw_0:['eight independently anchored body parts','all source poses and aim/recoil','foreground/background/last string drawing','Draw-driven wireheart creation/timing','flash/fog overlays','ending fall/head/smoke progression'],
 Alarm_4:['ACT stage advance'],Alarm_6:['balloon end routing'],
 Other_10:['tested canonical chooseNeoAttack'],Other_11:['post-finale ACT menu replacement and spell menu refresh'],
 Other_12:['proportional alive-party finale damage and invincibility'],Other_13:['source defeat gold/EXP and outcome flags'],
 Other_14:['shoot spam escalation by death count'],Other_22:['actual setup event12'],
 CleanUp_0:['stop overpower','restore soul speed','stop and reset rumble volume'],
} as const;
export const NEO_ENEMY_EXCLUDED_SOURCE_EVENTS=['KeyPress_89','Mouse_60','Mouse_61','Other_20'] as const;
export const NEO_ENEMY_ROUTE='normal ch2-61 only; side-B requires its separate battle/ending host and is unavailable' as const;
