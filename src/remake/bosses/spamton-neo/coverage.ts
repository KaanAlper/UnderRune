/** Responsibility audit and integration gate. Source package: chapter2_windows.
 * These independent primitives do not certify the NEO battle or any attack family. */
export const neoProjectileSourceCoverage={
 completeEncounter:false,completeAttackFamilies:[],encounterIds:['ch2-61'],
 objects:[
  {name:'obj_yheart_shot',index:596,parent:null,sprite:'spr_yheart_shot',mask:null,depth:0,visible:true,
   events:['Create_0','Step_0','Other_10','Other_11','Other_12'],collisions:[],
   responsibilities:['normal/upgraded initialization','charged-sprite growth','camera culling','face barrier','final-form suction','trail creation','normal/suppressed/noeffect impacts'],
   absentEvents:['Destroy','CleanUp','Alarm','Draw override','AnimationEnd'],},
  {name:'obj_yshot_anim',index:602,parent:null,sprite:'spr_yheart_shot_hit',mask:null,depth:0,visible:true,
   events:['Create_0','Step_0'],collisions:[],responsibilities:['half-frame image speed','last-frame threshold destruction'],absentEvents:['Destroy','CleanUp','Alarm','Draw override','AnimationEnd'],},
  {name:'obj_yheart_shot_afterimage',index:609,parent:null,sprite:null,mask:null,depth:0,visible:true,
   events:['Step_0'],collisions:[],responsibilities:['alpha decay and destruction'],absentEvents:['Create','Destroy','CleanUp','Alarm','Draw override','AnimationEnd'],},
 ],
 receivingCollisionPrimitives:[
  'obj_basicbullet_sneo_Collision_obj_yheart_shot','obj_basicbullet_sneo_finale_Collision_obj_yheart_shot',
  'obj_sneo_lilguy_Collision_obj_yheart_shot','obj_sneo_wireheart_Collision_obj_yheart_shot',
  'obj_sneo_faceattack_Collision_obj_yheart_shot','obj_sneo_hitdetector_Collision_obj_yheart_shot',
 ],
 // Only Collision_obj_yheart_shot is implemented for these owners, not their
 // Create/Step/Draw/Alarm/user events or inherited soul-damage behavior.
 receivingOwners:[
  {name:'obj_basicbullet_sneo',index:597,parent:'obj_collidebullet',handler:'basicBullet',responsibilities:['destroyable switch','normal-shot consumption','scaled hit3 effect','owner destruction']},
  {name:'obj_basicbullet_sneo_finale',index:599,parent:'obj_basicbullet_sneo',handler:'basicBullet',responsibilities:['same exact handler as basicbullet_sneo']},
  {name:'obj_sneo_lilguy',index:607,parent:'obj_collidebullet',handler:'flyingHead',responsibilities:['hitshot instance ID','mandatory owner user0 dispatch','difficulty-specific TP reward and cap']},
  {name:'obj_sneo_wireheart',index:640,parent:'obj_basicbullet_sneo',handler:'wireheart',responsibilities:['normal-shot invulnerability','diminishing turn reductions','alternate-heart HP damage','late-turn group defeat','damage flash and sound','literal source destroyed field']},
  {name:'obj_sneo_faceattack',index:634,parent:'obj_basicbullet_sneo',handler:'facePart',responsibilities:['alpha/type gates','broken reflection sound','normal-shot invulnerability','part-specific HP pools','hellmode bigshot damage','break frame/explosion timing','shot impact']},
  {name:'obj_sneo_hitdetector',index:601,parent:null,handler:'hitDetector',responsibilities:['immediate source exit; unreachable damage/mercy remains inactive']},
 ],
 requiredObjectDefinitions:['obj_spamton_neo_enemy','obj_heart','obj_sneo_faceattack','obj_sneo_final_forme','obj_sneo_wireheart'],
 requiredGlobals:['chapter','tension','maxtension','turntimer'],
 requiredTargetEvents:['obj_sneo_lilguy.user0'],
 sourceTextKeys:[],randomCalls:0,
 missingIntegration:['Chapter2 yellow-heart firing/charge events','all complete NEO enemy and receiving-object definitions','source collision handler registration on targets','chapter2 assets/text loader','source oracle recording'],
} as const;
