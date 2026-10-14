/** Exact NORMAL attack object/event/dependency audit. This does not certify the encounter. */
export const neoAttackSourceCoverage={
  "completeEncounter": false,
  "normalControllerTypes": [
    0,
    1,
    1.5,
    6,
    8.5,
    9,
    12
  ],
  "excludedControllerTypes": [
    2,
    3,
    4,
    5,
    7,
    10,
    11
  ],
  "objects": [
    {
      "index": 603,
      "name": "obj_sneo_guymaker",
      "parent": "obj_bulletparent",
      "sprite": "spr_sneo_bullet_crew",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": false,
      "events": [
        "Alarm_0",
        "Create_0",
        "Step_0"
      ]
    },
    {
      "index": 607,
      "name": "obj_sneo_lilguy",
      "parent": "obj_collidebullet",
      "sprite": "spr_sneo_crew",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Alarm_0",
        "Alarm_1",
        "Alarm_2",
        "Collision_obj_yheart_shot",
        "Create_0",
        "Draw_0",
        "Other_10",
        "Other_7",
        "Other_8",
        "Step_0"
      ]
    },
    {
      "index": 623,
      "name": "obj_sneo_lilguy_bullet",
      "parent": "obj_basicbullet_sneo",
      "sprite": "spr_sneo_crew_bullet",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Step_0"
      ]
    },
    {
      "index": 637,
      "name": "obj_sneo_biglaser",
      "parent": "obj_collidebullet",
      "sprite": "spr_sneo_laser",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Collision_obj_heart",
        "Collision_obj_sneo_lilguy",
        "Create_0",
        "Destroy_0",
        "Draw_0",
        "Step_0"
      ]
    },
    {
      "index": 684,
      "name": "obj_sneo_biglaser_friendlyhitbox",
      "parent": "obj_bulletparent",
      "sprite": "spr_sneo_laser_friendly",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Collision_obj_sneo_lilguy",
        "Create_0",
        "Step_2"
      ]
    },
    {
      "index": 671,
      "name": "obj_sneo_arm_laser_telegraph",
      "parent": null,
      "sprite": null,
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Create_0",
        "Draw_0",
        "Step_0"
      ]
    },
    {
      "index": 608,
      "name": "obj_sneo_crew_dissolve",
      "parent": "obj_bulletparent",
      "sprite": "spr_sneo_crew_dissolve",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Create_0",
        "Step_0"
      ]
    },
    {
      "index": 668,
      "name": "obj_sneo_wall_controller",
      "parent": "obj_bulletparent",
      "sprite": null,
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Alarm_0",
        "Create_0",
        "Other_10",
        "Step_0"
      ]
    },
    {
      "index": 54,
      "name": "obj_sneo_wall_controller_new",
      "parent": null,
      "sprite": null,
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Create_0",
        "Draw_0",
        "Step_0"
      ]
    },
    {
      "index": 625,
      "name": "obj_sneo_wallbullet",
      "parent": "obj_collidebullet",
      "sprite": "spr_sneo_mail",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Collision_obj_yheart_shot",
        "Create_0",
        "Draw_0",
        "Other_10",
        "Step_0"
      ]
    },
    {
      "index": 40,
      "name": "obj_sneo_wallbullet_new",
      "parent": "obj_collidebullet",
      "sprite": "spr_sneo_crew",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Collision_obj_yheart_shot",
        "Create_0",
        "Draw_0",
        "Other_10",
        "Step_0"
      ]
    },
    {
      "index": 626,
      "name": "obj_sneo_staticwall",
      "parent": "obj_collidebullet",
      "sprite": "spr_sneo_mail",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Collision_obj_yheart_shot",
        "Create_0",
        "Draw_0",
        "Other_10",
        "Step_0"
      ]
    },
    {
      "index": 37,
      "name": "obj_sneo_staticwall_new",
      "parent": "obj_collidebullet",
      "sprite": "spr_sneo_mail",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Collision_obj_yheart_shot",
        "Create_0",
        "Other_10",
        "Step_0"
      ]
    },
    {
      "index": 38,
      "name": "obj_sneo_rotatingwall_bomb",
      "parent": "obj_collidebullet",
      "sprite": "spr_mettaton_bomb1",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "CleanUp_0",
        "Collision_obj_yheart_shot",
        "Create_0",
        "Draw_0",
        "Step_0"
      ]
    },
    {
      "index": 23,
      "name": "obj_sneo_rotatingwall_pipis",
      "parent": "obj_collidebullet",
      "sprite": "spr_pipis_egg",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Collision_obj_yheart_shot",
        "Create_0",
        "Other_10",
        "Step_0"
      ]
    },
    {
      "index": 9,
      "name": "obj_mettaton_bomb_hitbox",
      "parent": "obj_regularbullet",
      "sprite": "spr_hitbox_10px_center",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": false,
      "events": [
        "Create_0",
        "Other_15",
        "Step_0"
      ]
    },
    {
      "index": 640,
      "name": "obj_sneo_wireheart",
      "parent": "obj_basicbullet_sneo",
      "sprite": "spr_sneo_wireheart",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Collision_obj_sneo_tiny_ralsei",
        "Collision_obj_sneo_tiny_susie_axe",
        "Collision_obj_yheart_shot",
        "Create_0",
        "Draw_0",
        "Step_0"
      ]
    },
    {
      "index": 245,
      "name": "obj_sneo_heart_laser",
      "parent": null,
      "sprite": "spr_sneo_bullet1",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Create_0",
        "Draw_0",
        "Step_0"
      ]
    },
    {
      "index": 641,
      "name": "obj_sneo_heart_bomb_explode",
      "parent": null,
      "sprite": "spr_sneo_wireheart_bomb",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Create_0",
        "Step_0"
      ]
    },
    {
      "index": 615,
      "name": "obj_sneo_heatattack_bullet",
      "parent": "obj_basicbullet_sneo",
      "sprite": "spr_neo_heart_bullet",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Create_0",
        "Other_10",
        "Step_0"
      ]
    },
    {
      "index": 561,
      "name": "obj_queen_laser",
      "parent": "obj_collidebullet",
      "sprite": "spr_lasergun_laser",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Create_0",
        "Step_0"
      ]
    },
    {
      "index": 629,
      "name": "obj_sneo_phonecall",
      "parent": "obj_bulletparent",
      "sprite": "spr_sneo_phone",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Collision_obj_yheart_shot",
        "Create_0",
        "Destroy_0",
        "Draw_0",
        "Step_0"
      ]
    },
    {
      "index": 667,
      "name": "obj_sneo_phonecall_pipis_stream",
      "parent": "obj_collidebullet",
      "sprite": null,
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Create_0",
        "Step_0"
      ]
    },
    {
      "index": 665,
      "name": "obj_sneo_phonecall_sneohead",
      "parent": null,
      "sprite": "spr_sneo_crew",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Create_0",
        "Step_0"
      ]
    },
    {
      "index": 660,
      "name": "obj_pipis_controller",
      "parent": null,
      "sprite": "spr_sneo_arml",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Create_0",
        "Draw_0"
      ]
    },
    {
      "index": 631,
      "name": "obj_pipis_egg_bullet",
      "parent": "obj_collidebullet",
      "sprite": "spr_pipis_egg",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Alarm_0",
        "Collision_obj_mettaton_bomb_hitbox",
        "Collision_obj_pipis_wall",
        "Collision_obj_yheart_shot",
        "Create_0",
        "Draw_0",
        "Other_10"
      ]
    },
    {
      "index": 632,
      "name": "obj_pipis_bullet",
      "parent": "obj_collidebullet",
      "sprite": "spr_sneo_crew",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Collision_obj_yheart_shot",
        "Create_0",
        "Destroy_0",
        "Other_11",
        "Step_0"
      ]
    },
    {
      "index": 1,
      "name": "obj_pipis_bullet_cone",
      "parent": "obj_collidebullet",
      "sprite": "spr_sneo_crew",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Collision_obj_yheart_shot",
        "Create_0",
        "Destroy_0",
        "Other_11",
        "Step_0"
      ]
    },
    {
      "index": 662,
      "name": "obj_pipis_center",
      "parent": null,
      "sprite": null,
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Create_0",
        "Step_0"
      ]
    },
    {
      "index": 663,
      "name": "obj_pipis_destroy_fx",
      "parent": null,
      "sprite": "spr_boxing_crescent",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Create_0",
        "Other_7",
        "Step_0"
      ]
    },
    {
      "index": 630,
      "name": "obj_pipis_wall",
      "parent": null,
      "sprite": "spr_pipis_wall",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Create_0",
        "Step_0"
      ]
    },
    {
      "index": 661,
      "name": "obj_pipis_egg_bullet_piece",
      "parent": null,
      "sprite": "spr_pipis_egg_piece",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Create_0",
        "Step_0"
      ]
    },
    {
      "index": 46,
      "name": "obj_sneo_pipis_bomb",
      "parent": "obj_collidebullet",
      "sprite": "spr_mettaton_bomb1",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Alarm_0",
        "Alarm_1",
        "CleanUp_0",
        "Collision_obj_yheart_shot",
        "Create_0",
        "Draw_0",
        "Step_0"
      ]
    },
    {
      "index": 664,
      "name": "obj_sneo_armcannon_smoke",
      "parent": null,
      "sprite": "spr_boxing_smoke",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Create_0",
        "Step_0"
      ]
    },
    {
      "index": 653,
      "name": "obj_sneo_phonehand_master",
      "parent": "obj_basicbullet_sneo",
      "sprite": "spr_sneo_head_sad",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Alarm_0",
        "Collision_obj_yheart_shot",
        "Create_0",
        "Destroy_0",
        "Draw_0",
        "Step_0"
      ]
    },
    {
      "index": 655,
      "name": "obj_sneo_phonehand",
      "parent": "obj_basicbullet_sneo",
      "sprite": "spr_sneo_phonehand",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Create_0",
        "Draw_0",
        "Step_0"
      ]
    },
    {
      "index": 654,
      "name": "obj_sneo_phonehand_master_hurtbox",
      "parent": "obj_regularbullet",
      "sprite": "spr_hitbox_10px",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Create_0",
        "Other_15",
        "Step_2"
      ]
    },
    {
      "index": 656,
      "name": "obj_sneo_mmx_spreadshot",
      "parent": "obj_basicbullet_sneo",
      "sprite": "spr_sneo_bullet0",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Alarm_0",
        "Create_0",
        "Draw_0",
        "Step_0"
      ]
    },
    {
      "index": 634,
      "name": "obj_sneo_faceattack",
      "parent": "obj_basicbullet_sneo",
      "sprite": null,
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Collision_obj_yheart_shot",
        "Create_0",
        "Destroy_0",
        "Draw_0",
        "Other_10",
        "Other_12",
        "Step_0",
        "Step_2"
      ]
    },
    {
      "index": 675,
      "name": "obj_sneo_faceattack_target",
      "parent": null,
      "sprite": "spr_boxing_crescent",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": false,
      "events": [
        "Create_0"
      ]
    },
    {
      "index": 837,
      "name": "obj_boxing_crescent",
      "parent": null,
      "sprite": "spr_boxing_crescent",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Create_0",
        "Step_0"
      ]
    },
    {
      "index": 479,
      "name": "obj_werewire_bullet_lasercircle",
      "parent": "obj_regularbullet",
      "sprite": "spr_bullet_laser_circle",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Create_0",
        "Step_0"
      ]
    },
    {
      "index": 478,
      "name": "obj_werewire_bullet_lasersquare",
      "parent": "obj_regularbullet",
      "sprite": "spr_bullet_laser_square",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Create_0",
        "Step_0"
      ]
    },
    {
      "index": 652,
      "name": "obj_finale_growtangle",
      "parent": "obj_bulletparent",
      "sprite": "spr_battlebg_0",
      "mask": "spr_battlebg_0",
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Create_0",
        "Draw_0",
        "Step_0"
      ]
    },
    {
      "index": 612,
      "name": "obj_sneo_warped_box",
      "parent": "obj_bulletparent",
      "sprite": "spr_battlebg_0",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Create_0",
        "Destroy_0",
        "Draw_0",
        "Other_5",
        "Step_2"
      ]
    },
    {
      "index": 643,
      "name": "obj_sneo_final_forme",
      "parent": "obj_basicbullet_sneo_finale",
      "sprite": "spr_sneo_final_forme",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Collision_obj_yheart_shot",
        "Create_0",
        "Destroy_0",
        "Draw_0",
        "Other_15",
        "Step_0"
      ]
    },
    {
      "index": 644,
      "name": "obj_sneo_final_forme_hitbox",
      "parent": "obj_basicbullet_sneo",
      "sprite": "spr_sneo_final_forme_hitbox",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": false,
      "events": [
        "Collision_obj_yheart_shot",
        "Create_0",
        "Step_2"
      ]
    },
    {
      "index": 41,
      "name": "obj_sneo_final_forme_mouth_back",
      "parent": null,
      "sprite": "spr_sneo_final_forme",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Create_0",
        "Step_2"
      ]
    },
    {
      "index": 645,
      "name": "obj_sneo_dollar",
      "parent": "obj_regularbullet",
      "sprite": "spr_spamton_dollar",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Create_0",
        "Draw_0",
        "Other_15",
        "Step_0"
      ]
    },
    {
      "index": 646,
      "name": "obj_sneo_fakeheart",
      "parent": "obj_bulletparent",
      "sprite": "spr_yellowheart",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Create_0",
        "Destroy_0",
        "Draw_0",
        "Step_2"
      ]
    },
    {
      "index": 648,
      "name": "obj_sneo_lastattack",
      "parent": null,
      "sprite": "spr_sneo_lastattack_head",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Create_0",
        "Destroy_0",
        "Draw_0",
        "Step_0"
      ]
    },
    {
      "index": 649,
      "name": "obj_sneo_lastattack_hitbox",
      "parent": null,
      "sprite": "spr_whitepx_10",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": false,
      "events": [
        "Collision_obj_yheart_shot",
        "Create_0",
        "Step_2"
      ]
    },
    {
      "index": 642,
      "name": "obj_sneo_final_orb",
      "parent": "obj_basicbullet_sneo",
      "sprite": "spr_sneo_neobuster",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Collision_obj_yheart_shot",
        "Create_0",
        "Draw_0",
        "Other_10",
        "Other_15",
        "Step_0"
      ]
    },
    {
      "index": 638,
      "name": "obj_sneo_bigshot",
      "parent": "obj_collidebullet",
      "sprite": "spr_sneo_bigshot_s",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Create_0",
        "Destroy_0",
        "Draw_0",
        "Other_10",
        "Other_15",
        "Step_0"
      ]
    },
    {
      "index": 647,
      "name": "obj_sneo_finale_bullet",
      "parent": "obj_basicbullet_sneo_finale",
      "sprite": "spr_sneo_crew_bullet",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Create_0",
        "Step_0"
      ]
    },
    {
      "index": 565,
      "name": "obj_wreckpausespew",
      "parent": null,
      "sprite": null,
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Create_0",
        "Draw_0"
      ]
    },
    {
      "index": 758,
      "name": "obj_rouxls_power_up_orb",
      "parent": null,
      "sprite": "spr_bullet_laser_circle",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Create_0",
        "Draw_0"
      ]
    },
    {
      "index": 597,
      "name": "obj_basicbullet_sneo",
      "parent": "obj_collidebullet",
      "sprite": "spr_sneo_bullet0",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Collision_obj_yheart_shot",
        "Create_0",
        "Step_0"
      ]
    },
    {
      "index": 599,
      "name": "obj_basicbullet_sneo_finale",
      "parent": "obj_basicbullet_sneo",
      "sprite": "spr_sneo_bullet0",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Collision_obj_yheart_shot",
        "Create_0",
        "Other_15",
        "Step_0"
      ]
    },
    {
      "index": 929,
      "name": "obj_lerpvar",
      "parent": null,
      "sprite": null,
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Create_0",
        "Step_0"
      ]
    },
    {
      "index": 932,
      "name": "obj_script_delayed",
      "parent": null,
      "sprite": null,
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Alarm_0",
        "Create_0",
        "Other_10",
        "Step_0"
      ]
    },
    {
      "index": 1101,
      "name": "obj_doom",
      "parent": null,
      "sprite": null,
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": false,
      "events": [
        "Alarm_0"
      ]
    },
    {
      "index": 211,
      "name": "obj_afterimage_cut",
      "parent": null,
      "sprite": null,
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true,
      "events": [
        "Create_0",
        "Draw_0",
        "Other_10"
      ]
    },
    {
      "index": 703,
      "name": "obj_sneo_bulletcontroller",
      "parent": "obj_bulletgenparent",
      "sprite": "spr_sneo_c_weakpoint_hit",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": false,
      "events": [
        "Create_0",
        "Destroy_0",
        "Step_0"
      ]
    }
  ],
  "requiredExternalObjects": [
    "obj_spamton_neo_enemy",
    "obj_sneo_heartattack",
    "obj_heart",
    "obj_yheart_shot",
    "obj_growtangle",
    "obj_yshot_anim",
    "obj_shake",
    "obj_dmgwriter",
    "obj_collidebullet",
    "obj_queen_enemy",
    "obj_queen_bulletcontroller",
    "obj_writer",
    "obj_regularbullet",
    "obj_clubsenemy",
    "obj_afterimage",
    "obj_battlesolid",
    "obj_sneo_hitdetector",
    "obj_heroparent",
    "obj_fadeout",
    "obj_fadein",
    "obj_sneo_smoke"
  ],
  "requiredCalls": [
    "instance_destroy",
    "instance_exists",
    "__view_get",
    "choose",
    "instance_create",
    "path_start",
    "move_towards_point",
    "event_user",
    "scr_tensionheal",
    "scr_bullet_init",
    "draw_self",
    "snd_play_x",
    "random",
    "abs",
    "scr_doom",
    "snd_volume",
    "scr_afterimage_cut",
    "camerax",
    "cameray",
    "merge_color",
    "sin",
    "collision_rectangle",
    "irandom",
    "draw_set_color",
    "draw_circle",
    "max",
    "scr_movetowards",
    "collision_line",
    "lengthdir_x",
    "lengthdir_y",
    "i_ex",
    "scr_afterimage",
    "floor",
    "scr_sneo_wall_create",
    "camerawidth",
    "draw_sprite",
    "cameraheight",
    "snd_play_pitch",
    "snd_play",
    "cos",
    "clamp",
    "instance_place",
    "instance_nearest",
    "lerp",
    "snd_stop",
    "snd_loop",
    "draw_sprite_ext",
    "point_direction",
    "scr_damage",
    "scr_damage_all",
    "audio_is_playing",
    "scr_debug",
    "scr_marker",
    "scr_script_delayed",
    "scr_sideb_get_phase",
    "ceil",
    "scr_lerpvar",
    "random_range",
    "lerp_ease_out",
    "lerp_ease_in",
    "scr_move_to_rememberxy",
    "draw_set_alpha",
    "draw_line_width",
    "scr_ease_out",
    "scr_orbitx",
    "scr_orbity",
    "button1_p",
    "button3_h",
    "scr_isphase",
    "msgsetloc",
    "scr_enemyblcon",
    "instance_number",
    "distance_to_object",
    "event_inherited",
    "scr_bullet_inherit",
    "d3d_set_fog",
    "scr_darksize",
    "instance_find",
    "scr_shakescreen",
    "keyboard_check_pressed",
    "ord",
    "scr_remapvalue",
    "min",
    "draw_get_color",
    "draw_set_colour",
    "draw_triangle",
    "scr_ease_in",
    "scr_84_get_sprite",
    "scr_inverselerp",
    "snd_pitch",
    "snd_pitch_time",
    "draw_sprite_ext_centerscale",
    "draw_get_alpha",
    "scr_damage_proportional",
    "is_string",
    "variable_instance_get",
    "variable_instance_set",
    "lerp_ease_inout",
    "script_execute",
    "draw_sprite_part_ext",
    "sprite_get_width",
    "sprite_get_xoffset",
    "sprite_get_yoffset",
    "scr_monsterattacknamecount"
  ],
  "textKeys": [
    "obj_sneo_phonecall_slash_Step_0_gml_89_0",
    "obj_sneo_phonecall_slash_Step_0_gml_96_0",
    "obj_sneo_phonecall_slash_Step_0_gml_136_0",
    "obj_sneo_phonecall_slash_Step_0_gml_176_0",
    "obj_sneo_phonecall_slash_Step_0_gml_138_0"
  ],
  "scriptNames": [
    "scr_tensionheal",
    "scr_bullet_init",
    "scr_doom",
    "scr_afterimage_cut",
    "scr_movetowards",
    "scr_afterimage",
    "scr_sneo_wall_create",
    "scr_damage",
    "scr_damage_all",
    "scr_debug",
    "scr_marker",
    "scr_script_delayed",
    "scr_sideb_get_phase",
    "scr_lerpvar",
    "lerp_ease_out",
    "lerp_ease_in",
    "scr_move_to_rememberxy",
    "scr_ease_out",
    "scr_orbitx",
    "scr_orbity",
    "scr_isphase",
    "scr_enemyblcon",
    "scr_bullet_inherit",
    "scr_darksize",
    "scr_shakescreen",
    "scr_remapvalue",
    "scr_ease_in",
    "scr_84_get_sprite",
    "scr_inverselerp",
    "scr_damage_proportional",
    "lerp_ease_inout",
    "scr_monsterattacknamecount",
    "scr_lerpvar_instance",
    "scr_ease_inout",
    "ease_out_back",
    "ease_in_back",
    "scr_damage_cache"
  ]
} as const;
