# Boss Battles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** shadowcrystal.dev deneyimini referans alan, yerel DELTARUNE kurulumundan dogrulanan tum boss karsilasmalarini oynatabilen bir bitirme projesi.

**Architecture:** Salt okunur veri cikarim hatti, kaynak kanitli boss katalogu ve ortak TypeScript canvas savas motoru. Her boss, ortak motora kendi fazlari ve saldirilariyla baglanir. Kaynaktan dogrulanmamis mekanikler tamamlanmis veya birebir uyarlanmis sayilmaz.

**Tech Stack:** Node.js v24.14.0 (makinede dogrulandi), npm, TypeScript, Vite, Vitest, Canvas 2D; UndertaleModCli 0.9.2.0 uyumluluk adayi. Yeni bagimliliklar uygulamada npm kayitlarindan dogrulanip exact surumlerle package-lock.json dosyasina sabitlenir. Vitest motor testleri, Playwright tarayici kabul testleri icindir.

**Spec:** [Onaylanan tasarim](../specs/2026-10-05-boss-battles-design.md)

## Global Constraints

- Calistirma hedefi npm run dev komutudur.
- Buluta yayinlama bu kapsamda yoktur.
- Oyun kurulumu salt okunur kaynaktir; Steam dosyalari degistirilmeyecek.
- Hedef, kurulumda dogrulanmis tum boss karsilasmalaridir; ana, gizli ve minibosslar ayri siniflanacak.
- Ayni bossun farkli savas varyantlari, mekanikleri farkliysa ayri karsilasma olarak kaydedilecek.
- Kesin isim listesi, nesne/oda/kod incelemesi tamamlanmadan uydurulmayacak.
- Kullaniciya bos kart veya genel saldiri verip tamamlandi denmeyecek.
- Varlik cikarmak GML kodunu tarayicida otomatik calistirmaz.
- Ara teslimler ilerlemeyi gosterebilir; tum boss hedefinin yerine gecmez.
- Kullanici aktifken odak calan ekran testi yapma; agir release derlemeleri calistirma.
- Kaynak aramasinda jcodemunch kullan. Bu yeni proje henuz indeksli degil; indeksleme kullanilamiyorsa rg ve hedefli dosya okuma uygula.
- Belge tesliminde gorunmez Unicode ve gomulu metadata temizligi uygula.

## Review Focus

1. Bozuk, desteklenmeyen veya kesik data.win: hatayi paket bazinda bildir; kaynak dosyayi asla yazma. Gorev 1 testleri.
2. Bolumler arasi ayni nesne adi ve farkli savas varyantlari: isimden tekillestirme yapma; kaynak hash ve karsilasma kanitini kullan. Gorev 2 testleri.
3. Arka plan sekmesi ve geciken frame: yapisik tus, toplu saldiri ve hasar patlamasi olmasin. Gorev 3 testleri.
4. Eksik atlas/ses veya bozuk localStorage: hata ve yeniden deneme gorunur olsun; sessiz mod oyunu engellemesin. Gorev 4 testleri.
5. Tum bosslar tamamlanmadan tamamlandi denmesi: kabul matrisi her boss ve fazi kanitlayana kadar teslim durumu eksik kalsin. Gorev 5 ve 6 testleri.

## Proje yuzeyi ve dosya sorumluluklari

Kok: C:/Users/halis/Projects/shadowcrystal-local

| Dosya/dizin | Sorumluluk |
| --- | --- |
| package.json, package-lock.json, tsconfig.json, vite.config.ts | Yerel calistirma, sabitlenmis bagimliliklar ve derleme |
| index.html, src/main.ts | Uygulamayi baslatma ve sahne gecislerinin sahibi |
| src/style.css, src/ui/ | Piksel sunum, secim menusu, HUD, dokunmatik giris ve hata ekranlari |
| tools/setup-utmt.ps1 | Resmi CLI arsivini proje disindaki yerel araclardan yonetme |
| tools/extract.ps1, tools/utmt/export-index.csx | Paket kesfi, hash kontrolu, obje/oda/sprite/ses/kod indeksleri |
| tools/utmt/export-assets.csx, tools/utmt/export-code.csx | Yalniz gerekli varlik ve olay kodlarini proje tarafina cikarma |
| tools/catalog.mjs, tools/check-coverage.mjs | Dogrulanmis karsilasma manifesti ve teslim kapsam denetimi |
| extracted/ | Yerel ham indeks ve secili GML; git ignore |
| public/generated/ | Yerel sprite atlaslari, sesler ve kaynak manifesti; git ignore |
| src/game/types.ts | Boss ve motor arasindaki ortak sozlesme |
| src/game/clock.ts, rng.ts, collision.ts, battle.ts | Zaman, rastgelelik, geometri ve savas durumlari |
| src/game/input.ts, soul.ts, projectiles.ts | Giris, ruh mekanikleri ve mermi simulasyonu |
| src/game/assets.ts, audio.ts, renderer.ts, storage.ts | Varlik yukleme, ses, cizim ve yerel tercihler |
| src/bosses/catalog.json, registry.ts | Kanitli boss listesi ve modul kaydi |
| src/bosses/<encounter-id>/ | Her gercek karsilasmanin definition.ts, attacks.ts, evidence.json ve replay.test.ts dosyalari |
| tests/fixtures/, tests/ | Sentetik veri ve motor kabul testleri; oyun paketlerinin kopyasi degil |
| docs/boss-inventory.json, docs/acceptance.json | Kaynak kaniti ve karsilasma/faz kabul matrisi |
| README.md, docs/architecture.md, docs/validation.md | Calistirma, cikarim, mimari ve juriye sunulabilir dogrulama kayitlari |

## Gorev 1: Salt okunur paket kesfi ve veri cikarim uyumlulugu

**Files:** Create tools/setup-utmt.ps1, tools/extract.ps1, tools/utmt/export-index.csx, tools/utmt/export-assets.csx, tools/utmt/export-code.csx, tools/source-manifest.mjs, tests/extraction.test.mjs, .gitignore. Kurulum/test scriptlerini bu gorevin package.json dosyasina ekle.

**Interfaces:** `inspectPackage(bytes: Uint8Array): { chunks: string[] }`; `buildSourceManifest(root: string): Promise<SourcePackage[]>`; `SourcePackage = { id: string; relativePath: string; sha256: string; bytes: number }`. `npm run extract -- --game-dir <path>` yalniz bu source root'u okur; hedef extracted/ ve public/generated/ olur. `DELTARUNE_DIR` istege bagli kaynak yoludur. `--index-only` varlik/kod cikarmadan envanter uretir.

- [ ] Resmi CLI 0.9.2.0 Windows arsivini .tools/ altina indir; resmi release asset digest bilgisi varsa dogrula, her durumda indirilen arsivin SHA-256 degerini tools-lock.json dosyasina kaydet. Global kurulum ve sistem dosya iliskilendirmesi yapma. CLI'nin kendisiyle `--help` ve `load --help` davranisini dogrula. Bu surum uyumsuzsa resmi nightly surumunu ayri dizinde dene ve kullanilan surumu kaydet; basarisiz paketi atlayip tam envanter iddiasinda bulunma.
- [ ] Paket kesfi ve kesik FORM girdisi icin once testi yaz:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inspectPackage } from '../tools/source-manifest.mjs';
test('rejects truncated FORM', () => {
  assert.throws(() => inspectPackage(Buffer.from('FORM')), /truncated/i);
});
test('rejects unrelated input', () => {
  assert.throws(() => inspectPackage(Buffer.from('NOTADATA')), /FORM/i);
});
```

- [ ] `node --test tests/extraction.test.mjs` calistir; eksik modul nedeniyle basarisiz oldugunu kaydet. inspectPackage once 8 bayt FORM basligini, sonra bildirilen uzunlugu ve her chunk'in dosya sinirlari icinde kaldigini denetlesin. Kaynak manifest yollarini kaynak root'a gore goreli yap; mutlak Steam yolu sunucuya veya tarayiciye servis edilmesin.
- [ ] Cikarim scripti `System.IO.File.OpenRead` kullanir; kaynak once/sonra hash'lerini karsilastirir. CLI icin kaynaktan dosya okuma komutu:

```powershell
& $cliPath load $dataPath --scripts $indexScriptPath
if ($LASTEXITCODE -ne 0) { throw "Package extraction failed: $dataPath" }
```

`--output` kullanma; oyun paketini yeniden kaydetme. CSX scripti hedef dizini `LL_EXPORT_DIR` ortam degiskeninden alir. Resmi CLI kaynaklarinda `load`, `--scripts` ve `--output` secenekleri kontrol edildi; calisan binary'de yeniden dogrula.
- [ ] Indeks exportunda Data.GameObjects, Data.Rooms, Data.Sprites, Data.Sounds ve Data.Code listelerini kaynak adlariyla yaz. Ornek salt okunur indeks iskeleti:

```csharp
EnsureDataLoaded();
var output = Environment.GetEnvironmentVariable("LL_EXPORT_DIR");
if (String.IsNullOrWhiteSpace(output)) throw new Exception("Missing export directory");
Directory.CreateDirectory(output);
File.WriteAllLines(Path.Combine(output, "objects.txt"),
    Data.GameObjects.Select(x => x.Name.Content));
```

Oda instance referanslari, sprite frame/origin/bounds ve olay-code baglarini da JSON'a yaz. Bunlar katalog kararinin girdileridir; regex isim eslesmesi sadece aday bulur. API ayrintilarini sabitlenmis UndertaleModLib kaynaklarindan hedefli oku.
- [ ] Birinci bolumde aracin paketi acmasini, bir sprite'i PNG olarak cikarmasini ve bir olay kodunu GML olarak decompile etmesini dogrula. Sonra tum bolumleri indeksle. PNG olculeri/originleri atlas manifestinde koru; sadece bossun resmi yetmez, ruh, HUD, parti ve saldiri varliklari da gereklidir. Dis ses dosyalarini ve paket icindeki ses gruplarini ayri kaydet.
- [ ] Kaynak hash degismezligini ve parser testlerini yeniden calistir. Paket okuma hatalari source-manifest icinde hata olarak kaydedilir; boss uyarlamasindan once uyumsuzlugun gercek nedeni cozulecek. Git deposunu kokte baslat; tools, test ve lock dosyalarini commit et, extracted/, public/generated/, .tools/ ve node_modules/ dizinlerini ekleme.

**Deliverable:** Tum kurulum paketlerinin durumunu aciklayan manifest ve uyumlu paketlerden gercek nesne/oda/varlik/kod cikarma hatti.

## Gorev 2: Kanitli karsilasma katalogu

**Files:** Create tools/catalog.mjs, tests/catalog.test.mjs, docs/boss-inventory.json, src/bosses/catalog.json.

**Interfaces:** `EncounterRecord = { id: string; chapter: number; name: string; kind: 'main'|'secret'|'miniboss'; variant: string; sources: {packageId: string; code: string[]; rooms: string[]}[]; status: 'identified'|'implemented'|'verified' }`. `buildCatalog(records: EncounterRecord[]): EncounterRecord[]` ayni encounter id'nin kaynaklarini birlestirir, farkli variantlari korur; eslesen kimlikte celisen isim/bolum/tur varsa hata verir.

- [ ] Ayni isimli ama farkli variantli iki kaydi koruyan test ve ayni encounter id icin iki kaynagi birlestiren test yaz:

```js
test('keeps distinct encounter variants', () => {
  const base = { chapter: 2, name: 'fixture', kind: 'main', sources: [], status: 'identified' };
  const result = buildCatalog([
    { ...base, id: 'fixture-a', variant: 'a' },
    { ...base, id: 'fixture-b', variant: 'b' },
  ]);
  assert.equal(result.length, 2);
});
```

- [ ] `node --test tests/catalog.test.mjs` ile kirmizi sonucu dogrula. Id tabanli Map kullanarak birlestirme ve celiski kontrolu uygula; testleri gecir.
- [ ] Her bolum indeksinde savas baslatan scriptleri, dusman kurulum kodunu ve savas odalarini incele. Aday bossun kaynagini, savas menulerini, parti uyelerini, fazlarini, saldiri secimlerini ve sonuc kosullarini kaydet. Oda/olay bagiyla desteklenmeyen ismi kataloga ekleme. Eski bolum kopyalari, kullanilmayan nesneler ve farkli varyantlar icin karar gerekcesi yaz.
- [ ] Her kayit icin gereken sprite, saldiri sprite'i, ses ve GML adlarini cikarim aracina secim listesi olarak ver. Kullaniciya tum kesin boss listesini ilerleme olarak goster; hayali chapter5 veya yalniz klasor adina dayanan boss varsayimi yapma.
- [ ] `npm run inventory` ayni hash'li girdilerden ayni katalogu uretsin. Katalog ve kaynak kanitini commit et; ham oyun kodunu commit etme.

**Deliverable:** Her bossun kaynak olaylari ve varyantlariyla izlenebilir, tam karsilasma listesi. Bu liste Gorev 5'in somut is kapsamidir.

## Gorev 3: Deterministik savas cekirdegi

**Files:** Create src/game/types.ts, clock.ts, rng.ts, collision.ts, input.ts, soul.ts, projectiles.ts, battle.ts; tests/clock.test.ts, collision.test.ts, battle.test.ts, input.test.ts. package.json icinde `test`, `typecheck`, `build`, `dev`, `preview` scriptlerini ve yerel Vite/TypeScript/Vitest bagimliliklarini ekle.

**Interfaces:**

```ts
export type BattlePhase = 'command' | 'action' | 'defense' | 'victory' | 'defeat';
export type InputFrame = { x: number; y: number; confirm: boolean; cancel: boolean; restart: boolean };
export type Bullet = { id: number; x: number; y: number; vx: number; vy: number;
  radius: number; damage: number; kind: string; age: number; lifetime: number };
export type AttackContext = { elapsed: number; tick: number;
  random: () => number; spawn: (bullet: Omit<Bullet, 'id'|'age'>) => void };
export type Attack = { id: string; durationTicks: number; step(ctx: AttackContext): void };
export type BattleSnapshot = { phase: BattlePhase; tick: number; hp: number;
  maxHp: number; tp: number; bossHp: number; paused: boolean; bullets: readonly Bullet[] };
export interface BossDefinition {
  id: string; name: string; maxHp: number; playerMaxHp: number; sourceFps: number;
  attacks: readonly Attack[];
  chooseAttack(state: BattleSnapshot): Attack;
}
export interface Battle {
  step(input: InputFrame): void;
  snapshot(): BattleSnapshot;
  pause(value: boolean): void;
  reset(seed: number): void;
}
```

Bossun parti ve ruh turu verileri katalog incelemesinde bu sozlesmeye eklenir; degisen arayuz ve kullanan moduller ayni degisiklikte guncellenir. Ozel savaslarin semantigini bu minimal HP modeliyle degistirme.

- [ ] Geometri ve hasar bagisikligi testlerini once yaz:

```ts
import { expect, test } from 'vitest';
import { circleHitsRect } from '../src/game/collision';
test('includes tangent contact', () => {
  expect(circleHitsRect({ x: 9, y: 15, radius: 1 },
    { x: 10, y: 10, width: 10, height: 10 })).toBe(true);
});
test('excludes separated contact', () => {
  expect(circleHitsRect({ x: 8, y: 15, radius: 1 },
    { x: 10, y: 10, width: 10, height: 10 })).toBe(false);
});
```

- [ ] Kirmizi testlerden sonra en yakin nokta geometrisini uygula:

```ts
const nearestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
const nearestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
return (circle.x - nearestX) ** 2 + (circle.y - nearestY) ** 2 <= circle.radius ** 2;
```

Canli oyunda sprite boyutunu dogrudan hitbox olarak kullanma; kaynaktaki hbx/bounds davranisini karsilasma kaydina bagla. Hizli mermiler icin hareket segmenti carpisma testi ekle.
- [ ] Zaman motorunda 60 Hz sabit tick uygula; GameMaker kaynak FPS'i farkliysa alarm/speed degerlerini kaynak FPS'e gore donustur. render icin requestAnimationFrame kullan. Tek frame'de en fazla 5 tick isle; visibilitychange olayinda accumulator ve tus durumunu sifirla. Testte ayni 120 tick girisinin 30/60/144 Hz frame dizilerinde ayni sonuca gittigini kontrol et; duraklatilan 10 saniyenin sonradan islenmedigini dogrula.
- [ ] Tohumlu PRNG'yi ve tek kullanim confirm/cancel kenarlarini uygula. Ayni seed/girdi izi ayni mermi listesini vermeli. Blur, pointercancel ve lostpointercapture her basili tusu temizlemeli.
- [ ] Durum makinesinin izinli gecislerini test et; defeat/victory sonrasi step hasar veya yeni saldiri uretmesin. Hasar bagisikligi suresinde iki carpisma tek hasar uygulasin; reset tum mermileri ve saldiri zamanini temizlesin.
- [ ] `npm test -- --run` ve `npm run typecheck` gecsin; cekirdek ve testleri commit et.

**Deliverable:** Gorselden bagimsiz test edilebilir savas cekirdegi. Sentetik fixture boss yalniz testlerde bulunur; kullaniciya gercek boss diye sunulmaz.

## Gorev 4: Ilk gercek boss ve yerel oyun arayuzu

**Files:** Create index.html, src/main.ts, src/style.css, src/ui/menu.ts, touch.ts, hud.ts, src/game/assets.ts, audio.ts, renderer.ts, storage.ts, src/bosses/registry.ts; ilk karsilasma icin src/bosses/jevil/definition.ts, attacks.ts, evidence.json, replay.test.ts. Create tests/assets.test.ts, storage.test.ts, audio.test.ts, lifecycle.test.ts.

**Interfaces:** `loadAssets(manifestUrl: string): Promise<AssetStore>`; `createBattle(boss: BossDefinition, seed: number): Battle`; `loadPrefs(storage: Pick<Storage,'getItem'|'setItem'>): Preferences`; `Preferences = { version: 1; muted: boolean; reducedEffects: boolean; completed: string[] }`. `AudioManager.dispose(): void` tum ses ve listener'lari kapatir. Sahne sahibi `BattleSession.dispose()` ile input, audio ve raf dongusunu temizler.

- [ ] Jevil'i ilk kesit olarak kullan, ancak kaynak ve gerekli varliklar Gorev 1-2'de dogrulanamadiysa dogrulanabilen bir karsilasmayi sec ve degisiklik gerekcesini kaydet. Once kanit dosyasina saldiri olaylarini, faz esiklerini, eylem/mercy kurallarini, parti verilerini, kaynak frame sayilarini ve hitboxlari yaz. Bunlari okumadan Jevil'e rastgele daire saldirisi baglama.
- [ ] Her saldirinin kaynak olaylarindan checkpoint kaydi uret:

```ts
type AttackCheckpoint = {
  sourceCode: string; sourceFrame: number; tick: number;
  expectedSpawns: number; expectedPositions: readonly [number, number][];
};
```

Source-code hash'lerini evidence.json'a ekle. replay.test.ts, checkpoint tick'ine kadar kayitli seed ile ilerleyip mermi dogumunu/konumunu karsilastirsin. Kaynak koddan hesaplanan degerler testin oracle'idir; test uygulamanin ayni hesabini tekrar etmesin.
- [ ] Checkpoint testini once calistir; bos saldiri modulunde basarisizligini dogrula. Kaynaktaki saldiri surelerini, koordinatlarini, hiz ve alarm zincirlerini Attack modullerine cevir. GML instance lifecycle, gravity, easing ve destroy davranislarini acikca uygula. Fazlari, menuleri ve sonuclari kaynak kosullara gore bagla.
- [ ] UI'da acilis, boss secimi, savas, sonuc ve menuye donus akislarini uygula. 640x480 canvas'i aspect ratio koruyarak olcekle, CSS ile pixelated cizim kullan; HUD ve kontrol aciklamalari okunabilir olsun. Gercek yerel sprite/sesleri kullan; eksik bossta uydurma resim veya genel saldiri kullanma. CRT efektlerini reduced-motion ve ayar tercihine gore sinirla.
- [ ] Onay ve hareket kontrollerini klavye/dokunmatik icin ayni InputFrame uzerine bagla. ACT/ITEM/SPARE ve ozel ruh davranislarini kaynagin gerektirdigi olcude tamamla; yalniz hayatta kalma suresi sonunda kazanma gibi yapay sonuc kurali ekleme.
- [ ] Depolama testi:

```ts
test('corrupt preferences preserve defaults', () => {
  const storage = { getItem: () => '{broken', setItem: () => {} };
  expect(loadPrefs(storage)).toEqual({ version: 1, muted: false,
    reducedEffects: false, completed: [] });
});
```

Depolama okuma/yazma istisnalarini yakala. Atlas fetch 404 icin yeniden deneme sun; ses yukleme hatasinda sessiz oyuna devam et. Gec kalan onceki sahne fetch'i yeni sahneye varlik yazmasin; abort veya session token kullan. Sahne dispose/reset testleri eski saldiri ve sesin calismadigini denetlesin.
- [ ] Ilk anlamli oynanis kesiti hazir olunca `npm run dev -- --host 127.0.0.1 --port 5173 --strictPort` baslat. Kullanici odagini calan test yapmadan yerel onizlemeyi goster. Test tarayicisi Chrome yolu bozuksa izole Playwright Chromium kullan; kisisel tarayici ayarlarini degistirme.
- [ ] Savasin normal sonuc, yenilgi, reset, pause ve menuye donusunu kontrol et; gereken test/typecheck/build komutlarini calistir. Ilk kesiti commit et, tum bosslar tamamlandi deme.

**Deliverable:** Yerelde calisan, kaynak kanitlari ve testleri olan bir gercek boss savasi ve tekrar kullanilabilir UI.

## Gorev 5: Katalogdaki tum bosslari ve farkli mekanikleri tamamlama

**Files:** Modify src/bosses/registry.ts, catalog.json, docs/acceptance.json. Her dogrulanan encounter-id icin definition.ts, attacks.ts, evidence.json ve replay.test.ts olustur. Gerekirse src/game/soul.ts, battle.ts ve hud.ts arayuzlerini ayni committe guncelle. Create tools/check-coverage.mjs, tests/coverage.test.mjs.

**Interfaces:** `AcceptanceRecord = { encounterId: string; sourceHash: string; attacks: { id: string; sourceCode: string; checkpointsPassed: boolean }[]; commandFlowPassed: boolean; winPassed: boolean; losePassed: boolean; resetPassed: boolean; browserChecked: boolean; differences: string[] }`. `checkCoverage(catalog: EncounterRecord[], accepted: AcceptanceRecord[]): { complete: boolean; missing: string[] }` implementasyon ve kaynak dogrulamasini birbirinden ayirir.

- [ ] Kapsam testini once yaz:

```js
test('does not count absent encounters as complete', () => {
  const result = checkCoverage([{ id: 'required-boss' }], []);
  assert.equal(result.complete, false);
  assert.deepEqual(result.missing, ['required-boss']);
});
```

Eksik saldiri checkpoint'i, sonuc testi veya browser kontrolu olan kayit da complete=false vermeli. Yaklasik davranis farklarini silerek verified yapma; farkin etkisini raporla.
- [ ] Her katalog kaydi icin bir kaynak uyarlama calisma karti yaz: olaylar ve kaynak hash, fazlar, ruh turu, parti, saldiri listesinin tamami, ACT/ITEM/SPARE ve sonuc kurallari. Bu kartlar yeni spekulatif tasarim degildir; onayli kapsam icindeki decompile edilen davranisin kaydidir. Kesin saldiri kodu Gorev 1-2'de ortaya cikacagi icin bu planda hayali isim veya zamanlama sabitleri kullanilmadi.
- [ ] Her boss icin Gorev 4'teki AttackCheckpoint seklinde kaynaktan oracle cikar, basarisiz replay testini calistir, gercek saldiriyi uygula ve testleri gecir. Her modulde farkli faz ve sonuc kosullarini ayrica denetle. Registry kaydinin varligi tek basina dogrulama degildir.
- [ ] Sarı ruh/ates etme, mavi ruh/yercekimi, kalkan, platform veya boks gibi katalogda dogrulanan ozel mekanikler varsa ortak ruh/eylem arabirimine bir mod olarak ekle. Her modun kaynak kontrollu giris ve carpisma testini kendi modulunde yaz. Katalogda olmayan mekanik ekleme; kaynakta olanini genel kirmizi ruhla degistirme.
- [ ] Her tamamlanan boss icin kazanma, kaybetme, tekrar baslatma ve menuye donusu kontrol et. Bir bossun varliklari digerine sarkmasin. Kendi kabul kaydi ve checkpoint testleriyle boss bazinda commit et.
- [ ] `npm run coverage:bosses` tum katalogu tarasin. Tamamlanmayan kaynak/mekanik varsa calismaya devam et; engel kullanici girdisi gerektiriyorsa boss ve kod olayini acikca bildir. Kullanici kapsam daraltmadikca yarim katalogu nihai teslim sayma.

**Deliverable:** Her gercek karsilasma icin kendi saldirilari, varyantlari ve sonuc kurallariyla oynanabilir modul; kaynakli kabul matrisi.

## Gorev 6: Tam uygulama kabul testi ve bitirme teslimi

**Files:** Create tests/e2e/menu.spec.ts, battle.spec.ts, offline.spec.ts, README.md, docs/architecture.md, docs/validation.md. Modify docs/acceptance.json.

**Interfaces:** Browser testleri kullanici akislarini gorunen kontrol/adlarla surer. Gelistirme fixture modlari uretim menu/kataloguna eklenmez. `npm run validate` typecheck, motor testleri, boss kapsam denetimi ve build komutlarini sirayla calistirir.

- [ ] Tum bosslar icin veri odakli tarayici kontrolu yaz: secim menusu acilir, boss secilebilir, canvas/varlik yukleme hatasi yoktur ve reset/menuye donus calisir. Iki temsili savasta gercek komut ve hasar akisini klavye ve dokunmatik girdilerle kontrol et. Otomatik kabul ile manuel kaynak oynanis karsilastirmasini ayri raporla.
- [ ] Sabit tohumlu replay testleri her saldirinin checkpoint'lerini kapsasin; kaynak kanitlariyla kazanma/kaybetme kurallarini karsilastir. Tum fazlarin dogrulama durumu acceptance.json icinde yer alsin.
- [ ] Ag testi localhost disindaki tum istekleri engellesin ve uygulamayi gercek uretim build'inden acsin. Uzak site fontu, scripti, goruntusu, analitik veya API bagimliligi olmasin. Paket kurulumunun internet gerektirebilecegi ile uygulamanin cevrimdisi calismasini README'de ayir.
- [ ] Port doluysa rastgele port taramak yerine strictPort hatasini bildir; kullanilabilir alternatif portu acikca sec. Kullaniciya dogru yerel linki ver; gelistirme sunucusunu elde tut. Uzun sureli uyumlu hosting veya sistem baslangic kaydi ekleme.
- [ ] README'de Windows PowerShell icin kok dizine gecis, npm ci, npm run extract, npm run dev, test ve build komutlarini yaz. Mimari dokumaninda GML'den Attack modulune aktarimi, zaman donusumunu, carpisma ve lifecycle secimlerini gercek uygulamaya gore acikla. validation.md icinde komutlar, sonuc, boss kapsam sayisi ve kalan farklari yaz; calistirilmayan teste gecti deme.
- [ ] Referans site, DELTARUNE/Toby Fox ve UndertaleModTool kredilerini belirt. Projeyi kendi uyarlamasi olarak tanit; referans kaynak kodunu veya tum Steam paketini kendi kodu diye teslim etme. Gerekli oyun varliklari cikarim araci ile yeniden uretilir.
- [ ] Belgelerde gorunmez Unicode/varyasyon secicilerini temizle; metadata iceren format kullanildiysa gomulu metadata'yi bosalt. Windows'ta watermarks-remover yoksa elle Layer A uygulandigini ve tam aracin kurulu olmadigini teslimde tek satir belirt.
- [ ] Basarili validate ve tarayici sonuclarini kaydet. Hedefi tam kapsayan proje dosyalari, yerel adres, baslatma komutu ve dogrulama ozetini teslim et. Teslimden onceki incelemeyi secilen yurutme yonteminin skill'i uyarinca yap.

**Deliverable:** Yerel calisan uygulama, tum boss kapsam kaniti, yeniden uretilebilir cikarim ve juriye sunulabilir teknik teslim.

## Oz-denetim ve yurutme secimi

Tasarimin her bolumu Gorev 1-6'ya eslendi: kaynak 1-2, mimari 3-4, tam boss kapsami 5, hata/lifecycle 1/3/4, kabul ve belgeler 6. Review Focus bes girdisinin her biri ilgili test adimina bagli. Ortak adlar InputFrame, BossDefinition, AttackContext, EncounterRecord ve AcceptanceRecord olarak tutarli kullanildi.

En onemli belirsizlik veri cikarim uyumlulugudur. Gorev 1'in ciktilari olmadan boss adlari veya saldiri ayrintilari tamamlanmis kabul edilmeyecek. Bu, tasarim kapsamindan vazgecme degil, kaynak kanitina dayali uygulama siralamasi.

Onerilen yurutme: Native, yani ana ajan bu oturumda gorevleri sirasiyla uygular. Veri cikarim sonucu boss arayuzlerini belirledigi ve motor/UI birbirine bagli oldugu icin baglami tek uygulayicida tutmak uygundur. Alternatif: subagent-driven yurutmede gorev basina ayri uygulayici ve inceleyici kullanilir; daha fazla baglam/maliyet getirir. Kullanici plani inceleyip yontemi sectikten sonra uygulamaya gecilecek.

## Basvurulan resmi kaynaklar

- https://vite.dev/guide/ : yerel dev/build komutlari ve Node gereksinimi. Mevcut Node 24.14.0 gerekli alt sinirin ustunde.
- https://github.com/UnderminersTeam/UndertaleModTool/releases/tag/0.9.2.0 : resmi Windows CLI adayi.
- https://github.com/UnderminersTeam/UndertaleModTool/blob/0.9.2.0/UndertaleModCli/Program.cs : load/scripts/output CLI tanimlari.
- https://github.com/UnderminersTeam/UndertaleModTool/blob/0.9.2.0/UndertaleModTool/Scripts/Technical%20Scripts/ExportAssetOrder.csx : kaynak asset listelerine salt okunur erisim.

Context7 araci bu oturumun kullanilabilir katalogunda bulunmadi; bu nedenle resmi kaynaklar hedefli okundu. Uygulamada katalog degisirse API sorularinda Context7 oncelikli kullanilacak.
