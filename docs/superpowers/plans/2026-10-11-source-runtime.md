# DELTARUNE: özgün kodu tarayıcıda çalıştırma

Kullanıcı 11 Ekim 2026 tarihinde savaşın tarayıcı içinde kalmasını ve boss mantığının yeniden yazılmamasını istedi. Öncelik DELTARUNE'dur. Hız, kararlılık ve herkesin kullanabileceği kontroller kabul ölçütlerine eklendi.

Mevcut prototip oynanabilir uyarlamalardır. Özgün oyunla aynı olduğu ileri sürülmez. Yeni çalışma, çözülmüş GML olaylarını resmî GameMaker HTML5 motoruyla çalıştırma yoludur. Çözümleyicinin hata bildirmemesi, kaynak oyuna anlamsal eşdeğerlik kanıtı değildir.

11 Ekim kaynak denetimi: komut sırası, saldırı çubukları/puanlama, hasar, parti istatistikleri, karaktere göre menüler, graze, savunma/düşme ve ruh hareketinde somut farklılıklar doğrulandı. Eski uyarlamalara desen eklemek bu hedefi karşılamaz. `npm run audit:parity` kaynak dosya hash'leriyle bu bulguları kaydeder; tüm karşılaşmalar için tam parite doğrulama sayısı sıfırdır.

Alternatif motor denemesi: Butterscotch WebAssembly motorunun sabitlenmiş `4f01f7bf37479169075eb29e0c96dcf49a7830b2` sürümü, kurulu Bölüm 1 bytecode'unu tarayıcıda çalıştırdı. Yerel test kopyasında yalnız `obj_initializer2` Step olayı başlangıç odasına yönlendirildi ve boş test odasına bir giriş kodu eklendi. Kalan 1.292 mevcut kod kaydının çözülmüş GML hash'leri değişmedi; hiçbir kayıt kaldırılmadı. Kaynak savaş kontrolcüsü, parti komutları, Jevil'in ilk maça mermileri ve hasar gösterimi gözlendi. Bu deneme özgün savaş odasını, ilerleme/ekipman durumunu, bütün fazları veya motor eşdeğerliğini henüz kanıtlamaz. Steam dosyaları değişmedi.

Bu bytecode yolu, tüm GML dilini ayrıca yazma gereğini kaldırabileceği için öncelikle değerlendirilecek. Mevcut hazır WASM derlemesinde unknown/stubbed function tanı kayıtları kapalıdır; sessiz eksik API davranışı olasılığı nedeniyle üretim yoluna bağlanmayacak. Önce tanıların etkin olduğu motor, desteklenmeyen API listesi, kaynak oda/başlangıç durumları, bütün boss fazları ve tarayıcı JSPI uyumluluğu doğrulanmalı. Eski prototip veya GML köprüsü bu kanıtlar olmadan yeniden yazılmayacak/kaldırılmayacak.

## Mevcut sorumlulukların denetimi

BattleSession: parti/HP/TP, oyuncu sıra seçimi, hedef, ACT, eşya, büyü, FIGHT zamanlaması, mermi üretimi/hareketi, çarpışma, hasar bağışıklığı, graze, ruh modları, saldırı sırası, kazanma/kaybetme, reset/pause/dispose ve ses olayları. Bunlar kaynak olayları ve resmî motorla doğrulanmadan kaldırılmayacak. Aynı saldırı rengine dönüşen yaklaşık davranış yeni kaynak yoluna taşınmayacak.

main.ts: giriş/oda/menü/savaş, boss sayfalama, yükleme ve retry, geç yükleme iptali, klavye/dokunma, görünürlük/odak duraklatması, modaller, ayar kaydı, ses ve tamamlanma kaydı. UI köprüsünde korunacak.

Renderer: sabit koordinatlar, özgün font/sprite, cihaz odası, boss önizleme, HUD/menüler, mermi uyarıları, sonuç/pause ekranı ve azaltılmış efekt. Özgün Draw olaylarının tarayıcı çizimine bağlanmasıyla sorumlulukları tek tek değiştirilecek; eski renderer, yeni yol doğrulanana kadar prototip için korunacak.

AssetStore/AudioManager/Input/FixedClock: kaynak kimliği, eksik dosya hata davranışı, sesin kullanıcı etkileşimiyle başlaması, eski seslerin kapanması, tarayıcı kısayolları, basılı tuşların temizliği ve sabit zaman adımı korunacak. Kaynak 30 Hz ise olaylar 30 Hz çalışacak.

## Sıra

1. Tüm bölüm paketlerindeki kod kayıtlarını çöz; dosya ve paket hash'lerini doğrula. Tam kod envanterini tut.
2. Resmî HTML5 motorunu sürüm hash'i ve lisansıyla sabitle; kodu değiştirmeden yükleme ve hareket kontrollerini test et.
3. GML dili için derleme köprüsü: başlangıçta olay ifadeleri, koşul/döngü, with/self/other, script çağrıları ve yerel değişkenler. Desteklenmeyen dil/builtin açık hata üretir; sessiz no-op veya yaklaşık boss fallback yoktur.
4. Küçük özgün Create/Step olaylarını değiştirmeden çalıştır; sonuçları kaynak kareleriyle karşılaştır. Ardından ortak savaş ve bütün boss bağımlılıklarına genişlet.
5. İstatistik, ACT, hasar, faz, hareket, çarpışma ve Draw olaylarını boss başına kaynak/parite listesiyle doğrula. Başarı koşulu tüm ana/gizli/miniboss karşılaşmalarının ve varyantlarının özgün kurallarla çalışmasıdır.
6. Derleme oynanıştan önce yapılır; boss paketleri seçildiğinde yüklenir. Masaüstü/mobil giriş, düşük performans, odak kaybı, eksik varlık, reset ve uzun savaş testleri gerekir.

## Sonraki aşama: UNDERTALE ve tiyatro

DELTARUNE tamamlanmadan uygulanmaz. İlk açılışta tiyatro sahnesinin ortasında gerçekten büyük, özenle tasarlanmış bir televizyon olacak. Solda kırmızı perde, turuncu ışık ve Frisk; sağda mavi perde, hafif yeşilimsi ışık ve Kris bulunacak. Ortada dikey ayrım ve yumuşak geçiş olacak. Televizyon hangi tarafın kumandasıyla başlatılırsa o tarafın teması diğer tarafa yayılacak; oyun kendi fontuyla UNDERTALE veya DELTARUNE başlığını ve ilgili bossları gösterecek.

## Diagnostic bytecode audit update

A project-local Emscripten 6.0.12 build now enables unknown/stubbed API and exception logs. The upstream runtime source is unmodified, build concurrency is limited to 2, and output hashes are recorded. Original room_cc_joker now supplies its own background, cutscene, and encounter transition. Re-decompilation confirms only the initializer Step launch routing differs: 1292 unchanged records, 1 changed, 0 added, 0 removed. This is source preservation evidence, not full engine parity.

Chapter 3's native function census reports 39 unregistered functions of 2238 references; chapter 4 reports 44 of 2595. These counts exclude registered stubs. Concrete gameplay dependencies include chapter 4 darkness attack positional audio (audio_play_sound_at, audio_listener_orientation, audio_falloff_set_model) and halo whirl texture repetition (gpu_set_tex_repeat). Production integration remains pending source-preserving runtime support, audio/rendering verification, complete encounter phase coverage, lifecycle tests and browser JSPI coverage. The approximate main prototype has not been replaced or certified.

## Hazırlık paneli ve kaynak yükleme sözleşmesi

Boss seçimi savaş başlatmadan önce bir dialog açar. Yeni `PreparationPanel`, karakter sekmeleri, silah/iki zırh yuvası, bölümün özgün envanter kataloğu, arama, 12 yuvalı çanta, erişilebilir klavye odağı, mobil düzen ve hata/yükleme davranışlarından sorumludur. main.ts menü sayfalaması, mevcut giriş/oda çizimi, prefs ve ses ayarlarını korur; dialog açıkken oyun tuşları tüketilmez. Ekipman seçimleri bölüm başına ayrı anahtarla saklanır. Başlangıçta kayıtlar kaynak karakter uyumluluğu ve ID'lerle yeniden doğrulanır.

Kaynak `scr_armorinfo`, `scr_weaponinfo`, `scr_iteminfo` kodu değişmeden çalıştırılarak katalog üretilir. UI bonus toplamını gösterir; gerçek temel istatistik/iyileştirme/faz davranışını hesaplamaz. Seçimler sanal `/saves/UnderRune.ini` dosyasına yazılır ve yalnız launcher tarafından native charweapon/chararmor1/chararmor2/item dizilerine aktarılır. `scr_weaponinfo_mine` ve `scr_armorinfo_mine` özgün kodu istatistikleri hesaplar.

Genel kaynak başlatıcı için debug room_battletest içindeki obj_battletester (debug seçim), obj_chaseenemy (otomatik karşılaşma) ve obj_debugload (debug save) instance'ları yalnız test odası kopyasından çıkarılır; nesne kodları korunur. Özgün mainchara ve darkcontroller kaldıkları yerde kalır. Bölüm 1 boş test odasında bu native nesneler oluşturulur. Savaş/mermi/ACT/item/hasar kodları değiştirilmez. Standalone test odası gerçek öykü odasıyla aynı değildir; tam parite işaretlenmez. Jevil özgün room_cc_joker yolunu kullanır. Özel minigame bağlamları ve tüm faz doğrulaması ayrı gereklilik olarak kalır.
