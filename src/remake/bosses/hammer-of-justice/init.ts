/** Hammer of Justice Create: source scratch fields, spell unlock and retry history. */
import type { GmInstance, GmObjectDef, GmRuntime } from '../../gm/runtime';
import { enemyObjectInit } from '../../deltarune/chapter2-enemy';
import { sourceText } from '../../host/text';
import { resetSpearPattern } from './spear-pattern';
/** scr_spellget: append only when absent and a slot among the first twelve is empty. */
function learnSpell(rt: GmRuntime, character: number, spell: number) { const row = rt.globals.spell[character]; let open = -1, have = false; for (let i = 0; i < 12; i++) {
    if (row[i] === spell)
        have = true;
    if (open === -1 && row[i] === 0)
        open = i;
} if (open >= 0 && !have)
    row[open] = spell; }
export function initializeHammer(s: GmInstance, rt: GmRuntime, object: (name: string) => GmObjectDef) {
    const g = rt.globals;
    enemyObjectInit(s, rt);
    g.invc = 0.5;
    s.progress = 0;
    // The arena with-block is empty in the original Create event.
    for (const backdrop of rt.all(object('obj_battleback')))
        rt.destroy(backdrop);
    s.recruitcount = 1;
    s.talkmax = 90;
    s.imageSpeed = 0.16666666666666666;
    s.idlesprite = "spr_gerson_idle";
    s.hurtsprite = "spr_gerson_idle";
    s.sparedsprite = "spr_gerson_idle";
    s.hairindex = 0;
    s.movesiner = 0;
    s.attackpattern = 0;
    s.boxoffset = false;
    s.trueturn = 0;
    s.difficulty = 0;
    s.turn = 0;
    s.phase = 1;
    s.patternstate = 0;
    s.rr = -(1);
    resetSpearPattern(s);
    s.attacktimer = 0;
    s.attackcon = 0;
    s.rtimer = 0;
    s.talked = 0;
    s.talkedcon = 0;
    s.dodgetimer = 0;
    s.attackdebug = -(1);
    s.difficultydebug = -(1);
    s.musicdebug = 0;
    s.songtime = 0;
    s.songplaying = 1;
    s.resumeinterval = 1.715;
    s.diagonal_enabled = 0;
    s.transformsfx = 0;
    s.postenemyturnevent = 0;
    s.postturntimer = 0;
    s.reachedendphase = 0;
    s.balloonorder = 0;
    s.ballooncon = 0;
    s.balloonend = 1;
    s.talkedcon = 0;
    s.susietalks = 0;
    s.rudebusterhitcount = 0;
    s.rudebusterhitcountmax = 1;
    s.susiehitbyrudebustercount = 0;
    s.susiehitbyrudebustercon = 0;
    s.rudebusterdelay = 0;
    s.swingtimer = 0;
    s.swingdown_ex = 0;
    s.swingdown_multitelegraph = 0;
    s.goldalpha = 0;
    s.goldcon = 0;
    s.hitbox_con = 0;
    s.hitbox_timer = 0;
    s.endcon = 0;
    s.endtimer = 0;
    s.end_cutscene_version = 0;
    s.frozentimer = 0;
    s.fasterheart = false;
    s.swingdownbeatspeed = 23;
    s.savebattlecontrollerdepth = rt.first(object('obj_battlecontroller'))!.depth;
    s.rudebusterflashcon = 0;
    s.rudebusterflashtimer = 0;
    s.susieusedultimateheal = 0;
    s.gothitlastturn = 0;
    s.beenhit = false;
    s.introtalkcon = 0;
    s.introballooncon = 0;
    s.firstconversationhappened = 0;
    s.nothitevent = false;
    s.mercylaughcon = 0;
    s.mercylaughtimer = 0;
    s.mercylaughcount = 9;
    s.spinxscale = 1;
    s.spinspeed = 5;
    s.saverudebusterstarcount = 9;
    s.spintimer = 0;
    s.spinindex = 0;
    learnSpell(rt, 2, 11);
    s.init = 0;
    s.squishbox = false;
    s.repeatonce = 0;
    s.have_used_final_attack = false;
    s.laughtimer = 0;
    if (g.flag[853] !== 0) {
        s.trueturn = 1;
        s.turn = 1;
        s.attackpattern = 1;
        s.repeatonce = 1;
    }
    if (!(("justice_reached_25_first_time" in g))) {
        g.justice_reached_25_first_time = 0;
    }
    if (!(("justice_reached_50_first_time" in g))) {
        g.justice_reached_50_first_time = 0;
    }
    if (!(("justice_reached_75_first_time" in g))) {
        g.justice_reached_75_first_time = 0;
    }
    if (!(("justice_attacked_twice" in g))) {
        g.justice_attacked_twice = 0;
    }
    if (!(("justice_healed" in g))) {
        g.justice_healed = 0;
    }
    if (!(("justice_rudebuster" in g))) {
        g.justice_rudebuster = 0;
    }
    if (!(("justice_item" in g))) {
        g.justice_item = 0;
    }
    if (!(("justice_attempts" in g))) {
        g.justice_attempts = 0;
    }
    s.dialogue_string1 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_145_0");
    s.dialogue_string2 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_146_0");
    s.dialogue_string3 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_147_0");
    s.dialogue_string3b = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_148_0");
    s.dialogue_string4 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_150_0");
    s.dialogue_string5 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_151_0");
    s.dialogue_string6 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_152_0");
    s.dialogue_string7 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_153_0");
    s.dialogue_string8 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_155_0");
    s.dialogue_string9 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_157_0");
    s.dialogue_string9b = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_158_0");
    s.dialogue_string12 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_160_0");
    s.dialogue_string12b = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_161_0");
    s.dialogue_string13 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_163_0");
    s.dialogue_string14 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_164_0");
    s.dialogue_string14b = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_165_0");
    s.dialogue_string14c = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_166_0");
    s.dialogue_string15 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_168_0");
    s.dialogue_string16 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_169_0");
    s.dialogue_string18 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_171_0");
    s.dialogue_string18b = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_172_0");
    s.dialogue_string19 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_174_0");
    s.dialogue_string20 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_175_0");
    s.dialogue_string21 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_177_0");
    s.dialogue_string22 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_178_0");
    s.dialogue_string23 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_180_0");
    s.dialogue_string24 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_181_0");
    s.dialogue_string25 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_183_0");
    s.dialogue_string26 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_184_0");
    s.dialogue_string27 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_185_0");
    s.dialogue_string28 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_186_0");
    s.dialogue_string29 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_188_0");
    s.dialogue_string30 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_189_0");
    s.dialogue_string31 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_190_0");
    s.dialogue_string35 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_194_0");
    s.dialogue_string36 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_195_0");
    s.dialogue_string37 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_196_0");
    s.dialogue_string38 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_198_0");
    s.dialogue_string39 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_199_0");
    s.dialogue_string40 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_201_0");
    s.dialogue_string41 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_202_0");
    s.dialogue_string42 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_203_0");
    s.dialogue_string43 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_205_0");
    s.dialogue_string44 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_206_0");
    s.dialogue_string45 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_207_0");
    s.dialogue_string46 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_208_0");
    s.dialogue_string47 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_210_0");
    s.dialogue_string48 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_211_0");
    s.dialogue_string49 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_212_0");
    s.dialogue_string50 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_214_0");
    s.dialogue_string51 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_215_0");
    s.dialogue_string52 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_216_0");
    s.dialogue_string53 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_218_0");
    s.dialogue_string54 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_219_0");
    s.dialogue_string55 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_220_0");
    s.dialogue_string56 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_221_0");
    s.dialogue_string57 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_222_0");
    s.dialogue_string58 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_223_0");
    s.dialogue_string59 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_224_0");
    s.dialogue_string64 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_226_0");
    s.dialogue_string65 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_227_0");
    s.dialogue_string66 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_228_0");
    s.dialogue_string67 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_231_0");
    s.dialogue_string68 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_232_0");
    s.dialogue_string69 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_235_0");
    s.justice_healed = 0;
    s.justice_rudebuster = 0;
    s.justice_item = 0;
    s.dialogue_string70 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_242_0");
    s.dialogue_string71 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_244_0");
    s.dialogue_string72 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_245_0");
    s.dialogue_string73 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_247_0");
    s.dialogue_string74 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_248_0");
    s.dialogue_string75 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_249_0");
    s.dialogue_string76 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_251_0");
    s.dialogue_string77 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_252_0");
    s.dialogue_string78 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_253_0");
    s.dialogue_string79 = sourceText("obj_hammer_of_justice_enemy_slash_Create_0_gml_258_0");
    s.haveattacked = false;
    s.nohairsprite = false;
    s.endshaketimer = 0;
    s.resetsusie = 0;
}
