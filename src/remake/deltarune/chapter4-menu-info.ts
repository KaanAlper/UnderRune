import type { GmInstance, GmRuntime } from '../gm/runtime';
import { eq, lt, gt, le, ge, round } from '../gm/math';
import { sourceText } from '../host/text';
const substitute = (text: string, ...args: any[]) => text.replace(/~(\d+)/g, (_, n) => String(args[Number(n) - 1]));
/** scr_spellinfo, Chapter 4. Text fallback literals stay in the local extraction. */
export function spellInfo4(s: GmInstance, rt: GmRuntime, id: number) {
    const g = rt.globals, v: Record<string, any> = { arg0: id };
    {
        (s.cost = (-1));
        (s.spelltarget = 1);
        (s.spellname = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_3_0"));
        (s.spellnameb = " ");
        (s.spelldescb = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_5_0"));
        (s.spelldesc = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_6_0"));
        (s.spellanim = 0);
        (s.spellusable = 0);
        (s.spelltext = " ");
        switch (v.arg0) {
            case 0:
                (s.spellname = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_14_0"));
                (s.spellnameb = " ");
                (s.spelltarget = 0);
                (s.cost = (-1));
                (s.spelldescb = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_18_0"));
                break;
            case 1:
                (s.spellname = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_21_0"));
                (s.spellnameb = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_22_0"));
                (s.spelldescb = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_24_0_b"));
                (s.spelldesc = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_24_0"));
                (s.spelltarget = 2);
                (s.cost = 125);
                (s.spellusable = 0);
                break;
            case 2:
                (s.spellname = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_31_0"));
                (s.spellnameb = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_32_0"));
                (s.spelldescb = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_34_0_b"));
                (s.spelldesc = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_34_0"));
                (s.spelltarget = 1);
                (s.cost = 80);
                (s.usable = 0);
                (s.spellusable = 0);
                break;
            case 3:
                (s.spellname = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_42_0"));
                (s.spellnameb = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_43_0"));
                (s.spelldescb = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_45_0_b"));
                (s.spelldesc = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_45_0"));
                (s.spelltarget = 2);
                (s.cost = 40);
                (s.usable = 0);
                (s.spellusable = 0);
                break;
            case 4:
                (s.spellname = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_52_0"));
                (s.spellnameb = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_53_0"));
                (s.spelldescb = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_55_0_b"));
                (s.spelldesc = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_55_0"));
                (s.spelltarget = 2);
                (s.cost = 125);
                if (eq(g.charweapon[2], 7)) {
                    (s.cost = 100);
                }
                (s.spellusable = 0);
                break;
            case 5:
                (s.spellname = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_64_0"));
                (s.spellnameb = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_65_0"));
                (s.spelldescb = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_67_0_b"));
                (s.spelldesc = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_67_0"));
                (s.spelltarget = 2);
                (s.cost = 0);
                (s.spellusable = 0);
                break;
            case 6:
                (s.spellname = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_75_0"));
                (s.spellnameb = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_76_0"));
                (s.spelldescb = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_77_0"));
                (s.spelldesc = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_78_0"));
                (s.spelltarget = 0);
                (s.cost = 0);
                (s.spellusable = 0);
                break;
            case 7:
                (s.spellname = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_86_0"));
                (s.spellnameb = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_87_0"));
                (s.spelldescb = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_88_0"));
                (s.spelldesc = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_89_0"));
                if (eq(g.chapter, 4)) {
                    (s.spelldesc = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_93_0"));
                }
                (s.spelltarget = 0);
                (s.cost = 0);
                (s.spellusable = 0);
                break;
            case 8:
                (s.spellname = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_96_0"));
                (s.spellnameb = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_97_0"));
                (s.spelldescb = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_98_0"));
                (s.spelldesc = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_99_0"));
                (s.spelltarget = 0);
                (s.cost = 80);
                (s.spellusable = 0);
                break;
            case 9:
                (s.spellname = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_107_0"));
                (s.spellnameb = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_108_0"));
                (s.spelldescb = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_109_0"));
                (s.spelldesc = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_110_0"));
                (s.spelltarget = 2);
                (s.cost = 40);
                if (eq(g.charweapon[4], 13)) {
                    (s.cost *= 0.5);
                }
                (s.spellusable = 0);
                break;
            case 10:
                (s.spellname = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_121_0"));
                (s.spellnameb = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_122_0"));
                (s.spelldescb = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_123_0"));
                (s.spelldesc = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_124_0"));
                (s.spelltarget = 0);
                (s.cost = (g.maxtension * 2));
                if (eq(g.charweapon[4], 13)) {
                    (s.cost *= 0.5);
                }
                (s.spellusable = 0);
                break;
            case 11:
                (s.spellname = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_152_0_b"));
                (s.spellnameb = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_153_0_b"));
                (s.spelldescb = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_154_0"));
                (s.spelldesc = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_155_0_b"));
                (s.spelltarget = 1);
                (s.spellusable = 0);
                if (eq(g.flag[1045], 0)) {
                    (s.cost = 212.5);
                }
                if (eq(g.flag[1045], 1)) {
                    (s.cost = 210);
                }
                if (eq(g.flag[1045], 2)) {
                    (s.cost = 210);
                }
                if (eq(g.flag[1045], 3)) {
                    (s.cost = 210);
                }
                if (eq(g.flag[1045], 4)) {
                    (s.cost = 207.5);
                }
                if (eq(g.flag[1045], 5)) {
                    (s.cost = 207.5);
                }
                if (eq(g.flag[1045], 6)) {
                    (s.cost = 207.5);
                }
                if (eq(g.flag[1045], 7)) {
                    (s.cost = 205);
                }
                if (eq(g.flag[1045], 8)) {
                    (s.cost = 205);
                }
                if (eq(g.flag[1045], 9)) {
                    (s.cost = 205);
                }
                if (eq(g.flag[1045], 10)) {
                    (s.cost = 202.5);
                }
                if (eq(g.flag[1045], 11)) {
                    (s.cost = 202.5);
                }
                if (eq(g.flag[1045], 12)) {
                    (s.cost = 202.5);
                }
                if (eq(g.flag[1045], 13)) {
                    (s.cost = 200);
                }
                if (eq(g.flag[1045], 14)) {
                    (s.cost = 200);
                }
                if (ge(g.flag[1045], 15)) {
                    (s.cost = 200);
                }
                if ((ge(g.plot, 110) && lt(g.flag[850], 6))) {
                    (s.spellname = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_161_0"));
                    (s.spellnameb = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_162_0"));
                    (s.spelldescb = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_163_0"));
                    (s.spelldesc = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_164_0"));
                    (s.cost = 255);
                }
                if (eq(g.flag[852], 1)) {
                    if (eq(g.flag[1045], 0)) {
                        (s.cost = 200);
                    }
                    if (eq(g.flag[1045], 1)) {
                        (s.cost = 197.5);
                    }
                    if (eq(g.flag[1045], 2)) {
                        (s.cost = 197.5);
                    }
                    if (eq(g.flag[1045], 3)) {
                        (s.cost = 197.5);
                    }
                    if (eq(g.flag[1045], 4)) {
                        (s.cost = 195);
                    }
                    if (eq(g.flag[1045], 5)) {
                        (s.cost = 195);
                    }
                    if (eq(g.flag[1045], 6)) {
                        (s.cost = 195);
                    }
                    if (eq(g.flag[1045], 7)) {
                        (s.cost = 192.5);
                    }
                    if (eq(g.flag[1045], 8)) {
                        (s.cost = 192.5);
                    }
                    if (eq(g.flag[1045], 9)) {
                        (s.cost = 192.5);
                    }
                    if (eq(g.flag[1045], 10)) {
                        (s.cost = 190);
                    }
                    if (eq(g.flag[1045], 11)) {
                        (s.cost = 190);
                    }
                    if (eq(g.flag[1045], 12)) {
                        (s.cost = 190);
                    }
                    if (eq(g.flag[1045], 13)) {
                        (s.cost = 187.5);
                    }
                    if (eq(g.flag[1045], 14)) {
                        (s.cost = 187.5);
                    }
                    if (ge(g.flag[1045], 15)) {
                        (s.cost = 187.5);
                    }
                    (s.spellname = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_169_0"));
                    (s.spellnameb = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_170_0"));
                    (s.spelldescb = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_171_0"));
                    (s.spelldesc = sourceText("scr_spellinfo_slash_scr_spellinfo_gml_172_0"));
                }
                break;
        }
    }
}
/** scr_iteminfo, Chapter 4. Text fallback literals stay in the local extraction. */
export function itemInfo4(s: GmInstance, rt: GmRuntime, id: number) {
    const g = rt.globals, v: Record<string, any> = { arg0: id };
    {
        (s.usable = 0);
        (s.replaceable = 0);
        (s.value = 0);
        (s.itemtarget = 0);
        (s.itemnameb = " ");
        (s.itemdescb = " ");
        switch (v.arg0) {
            case 0:
                (s.itemnameb = " ");
                (s.itemdescb = "---");
                break;
            case 1:
                (s.itemnameb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_16_0_b"));
                (s.itemdescb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_17_0"));
                (s.itemtarget = 1);
                (s.value = 120);
                (s.usable = 1);
                break;
            case 2:
                (s.itemnameb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_22_0"));
                (s.itemdescb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_23_0"));
                (s.itemtarget = 1);
                (s.value = 400);
                (s.usable = 1);
                break;
            case 3:
                (s.itemnameb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_29_0"));
                (s.itemdescb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_30_0"));
                (s.itemtarget = 0);
                (s.value = (200 + (g.chapter * 100)));
                (s.usable = 0);
                break;
            case 4:
                (s.itemnameb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_36_0"));
                (s.itemdescb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_37_0"));
                (s.itemtarget = 2);
                (s.value = 1);
                (s.usable = 0);
                break;
            case 5:
                (s.itemnameb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_43_0"));
                (s.itemdescb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_44_0"));
                (s.itemtarget = 1);
                (s.value = 5);
                (s.usable = 1);
                break;
            case 6:
                (s.itemnameb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_50_0"));
                (s.itemdescb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_51_0"));
                (s.itemtarget = 2);
                (s.value = 150);
                (s.usable = 1);
                break;
            case 7:
                v.healamount = (eq(g.chapter, 1) ? 80 : 140);
                if (eq(g.chapter, 3)) {
                    (v.healamount = 150);
                }
                if (ge(g.chapter, 4)) {
                    (v.healamount = 160);
                }
                (s.itemnameb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_58_0"));
                (s.itemdescb = substitute(sourceText("scr_iteminfo_slash_scr_iteminfo_gml_59_0"), String(v.healamount)));
                (s.itemtarget = 2);
                (s.value = 5);
                (s.usable = 1);
                break;
            case 8:
                (s.itemnameb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_65_0"));
                (s.itemdescb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_66_0"));
                (s.itemtarget = 1);
                (s.value = 70);
                (s.usable = 1);
                break;
            case 9:
                (s.itemnameb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_72_0"));
                (s.itemdescb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_73_0"));
                (s.itemtarget = 1);
                (s.value = 10);
                (s.usable = 1);
                break;
            case 10:
                (s.itemnameb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_79_0"));
                (s.itemdescb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_80_0"));
                (s.itemtarget = 1);
                (s.value = 10);
                (s.usable = 1);
                break;
            case 11:
                (s.itemnameb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_86_0"));
                (s.itemdescb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_87_0"));
                (s.itemtarget = 2);
                (s.value = 70);
                (s.usable = 1);
                break;
            case 12:
                (s.itemnameb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_93_0"));
                (s.itemdescb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_94_0"));
                (s.itemtarget = 1);
                (s.value = 40);
                (s.usable = 1);
                break;
            case 13:
                (s.itemnameb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_100_0"));
                (s.itemdescb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_101_0"));
                (s.itemtarget = 1);
                (s.value = 40);
                (s.usable = 1);
                break;
            case 14:
                (s.itemnameb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_107_0"));
                (s.itemdescb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_108_0"));
                (s.itemtarget = 1);
                (s.value = 10);
                (s.usable = 1);
                break;
            case 15:
                (s.itemnameb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_114_0"));
                (s.itemdescb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_115_0"));
                (s.itemtarget = 1);
                (s.value = 50);
                (s.usable = 1);
                break;
            case 16:
                (s.itemnameb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_121_0"));
                (s.itemdescb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_122_0"));
                (s.itemtarget = 1);
                (s.value = 100);
                (s.usable = 1);
                break;
            case 17:
                (s.itemnameb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_128_0"));
                (s.itemdescb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_129_0"));
                (s.itemtarget = 0);
                (s.value = 300);
                (s.usable = 0);
                break;
            case 18:
                (s.itemnameb = sourceText("scr_text_slash_scr_text_gml_11462_0"));
                (s.itemdescb = sourceText("scr_text_slash_scr_text_gml_11467_0"));
                (s.itemtarget = 1);
                (s.value = 2);
                (s.usable = 1);
                break;
            case 19:
                (s.itemnameb = sourceText("scr_text_slash_scr_text_gml_11462_0"));
                (s.itemdescb = sourceText("scr_text_slash_scr_text_gml_11467_0"));
                (s.itemtarget = 1);
                (s.value = 2);
                (s.usable = 1);
                break;
            case 20:
                (s.itemnameb = sourceText("scr_text_slash_scr_text_gml_11462_0"));
                (s.itemdescb = sourceText("scr_text_slash_scr_text_gml_11467_0"));
                (s.itemtarget = 1);
                (s.value = 2);
                (s.usable = 1);
                break;
            case 21:
                (s.itemnameb = sourceText("scr_text_slash_scr_text_gml_11462_0"));
                (s.itemdescb = sourceText("scr_text_slash_scr_text_gml_11467_0"));
                (s.itemtarget = 1);
                (s.value = 2);
                (s.usable = 1);
                break;
            case 22:
                (s.itemnameb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_163_0"));
                (s.itemdescb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_164_0"));
                (s.itemtarget = 1);
                (s.value = 110);
                (s.usable = 1);
                (s.replaceable = 8);
                break;
            case 23:
                (s.itemnameb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_171_0"));
                (s.itemdescb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_172_0"));
                (s.itemtarget = 1);
                (s.value = 200);
                (s.usable = 1);
                break;
            case 24:
                (s.itemnameb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_178_0"));
                (s.itemdescb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_179_0"));
                (s.itemtarget = 1);
                (s.value = 200);
                (s.usable = 1);
                break;
            case 25:
                (s.itemnameb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_185_0"));
                (s.itemdescb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_186_0"));
                (s.itemtarget = 2);
                (s.value = 180);
                (s.usable = 1);
                break;
            case 26:
                (s.itemnameb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_192_0"));
                (s.itemdescb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_193_0"));
                (s.itemtarget = 1);
                (s.value = 160);
                (s.usable = 1);
                break;
            case 27:
                (s.itemnameb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_199_0"));
                (s.itemdescb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_200_0"));
                (s.itemtarget = 2);
                (s.value = 100);
                (s.usable = 1);
                break;
            case 28:
                (s.itemnameb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_206_0"));
                (s.itemdescb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_207_0"));
                (s.itemtarget = 2);
                (s.value = 300);
                (s.usable = 1);
                break;
            case 29:
                (s.itemnameb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_213_0"));
                (s.itemdescb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_214_0"));
                (s.itemtarget = 2);
                (s.value = 1000);
                (s.usable = 1);
                break;
            case 30:
                (s.itemnameb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_220_0"));
                (s.itemdescb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_221_0"));
                (s.itemtarget = 2);
                (s.value = 100);
                (s.usable = 1);
                break;
            case 31:
                (s.itemnameb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_227_0"));
                (s.itemdescb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_228_0"));
                (s.itemtarget = 2);
                (s.value = 4000);
                (s.usable = 1);
                break;
            case 32:
                (s.itemnameb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_234_0"));
                (s.itemdescb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_235_0"));
                (s.itemtarget = 1);
                (s.value = 110);
                (s.usable = 1);
                break;
            case 33:
                (s.itemnameb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_241_0"));
                (s.itemdescb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_242_0"));
                (s.itemtarget = 0);
                (s.value = Math.floor((200 / g.chapter)));
                (s.usable = 0);
                break;
            case 34:
                (s.itemnameb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_249_0"));
                (s.itemdescb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_250_0"));
                (s.itemtarget = 1);
                (s.value = 200);
                (s.usable = 1);
                break;
            case 35:
                (s.itemnameb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_256_0"));
                (s.itemdescb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_257_0"));
                (s.itemtarget = 1);
                (s.value = 0);
                (s.usable = 1);
                break;
            case 36:
                (s.itemnameb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_263_0"));
                (s.itemdescb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_264_0"));
                (s.itemtarget = 1);
                (s.value = 2);
                (s.usable = 1);
                break;
            case 37:
                (s.itemnameb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_270_0"));
                (s.itemdescb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_271_0"));
                (s.itemtarget = 1);
                (s.value = 200);
                (s.usable = 1);
                break;
            case 38:
                (s.itemnameb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_277_0"));
                (s.itemdescb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_278_0"));
                (s.itemtarget = 2);
                (s.value = 600);
                (s.usable = 1);
                break;
            case 39:
                (s.itemnameb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_284_0"));
                (s.itemdescb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_285_0"));
                (s.itemtarget = 1);
                (s.value = 600);
                (s.usable = 1);
                break;
            case 60:
                (s.itemnameb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_291_0"));
                (s.itemdescb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_292_0"));
                (s.itemtarget = 1);
                (s.value = 1000);
                (s.usable = 1);
                break;
            case 61:
                (s.itemnameb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_298_0"));
                (s.itemdescb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_299_0"));
                (s.itemtarget = 1);
                (s.value = 250);
                (s.usable = 1);
                break;
            case 62:
                (s.itemnameb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_305_0"));
                (s.itemdescb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_306_0"));
                (s.itemtarget = 1);
                (s.value = 450);
                (s.usable = 1);
                break;
            case 63:
                (s.itemnameb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_312_0"));
                (s.itemdescb = sourceText("scr_iteminfo_slash_scr_iteminfo_gml_313_0"));
                (s.itemtarget = 1);
                (s.value = 0);
                (s.usable = 1);
                break;
        }
    }
}
