// Chapter 2 objects NEO's ported code refers to but which are not ported yet. Each is a name and object index only;
// the NEO host maps it to the object that still runs it. Remove an entry when its object is ported.
import type {GmObjectDef} from '../../gm/runtime';

const stub=(name:string,index:number):GmObjectDef=>({name,index});
export const sneoBulletController=stub('obj_sneo_bulletcontroller',703);
export const dbulletController=stub('obj_dbulletcontroller',394);
export const sneoPhonecall=stub('obj_sneo_phonecall',629);
export const spamtonCherub=stub('obj_spamton_cherub',595);
export const choicerNeo=stub('obj_choicer_neo',61);
export const sneoSusieAct=stub('obj_sneo_susie_act',697);
export const sneoVineCut=stub('obj_sneo_vine_cut',693);
export const sneoVineTransition=stub('obj_sneo_vine_transition',694);
export const sneoVineWeak=stub('obj_sneo_vine_weak',695);
export const throwKrisVineController=stub('obj_sneo_throwkris_vine_controller',696);
export const throwKris=stub('obj_sneo_throwkris',690);
export const tinyRalsei=stub('obj_sneo_tiny_ralsei',639);
export const sceneEx2=stub('obj_ch2_sceneex2',1004);
export const wireheart=stub('obj_sneo_wireheart',640);
export const bigLaser=stub('obj_sneo_biglaser',637);
export const spamtonShot=stub('obj_spamtonshot',598);
export const pipisDestroyFx=stub('obj_pipis_destroy_fx',663);
export const heartAttack=stub('obj_sneo_heartattack',613);
export const phoneBullet=stub('obj_sneo_phonebullet',600);
