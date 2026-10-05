# DELTARUNE yerel boss savaslari - tasarim

Tarih: 2026-10-05
Durum: Kullanici incelemesine hazir; uygulama baslamadi.

## Amac ve basari tanimi

Bilgisayar muhendisligi bitirme projesi icin, shadowcrystal.dev deneyimini referans alan ve DELTARUNE kurulumundaki eksik boss savaslarini tamamlayan yerel bir tarayici uygulamasi gelistirilecek. Kullanici oynanabilir savaslari ve tasarimin ana hatlarini onayladi. Yuksek not bir garanti degildir; proje kendi mimarisi, aciklanabilir algoritmalari ve dogrulama kanitlariyla sunulabilir olacak.

Calistirma hedefi npm run dev komutudur. Uygulama dis servise bagli olmadan localhost uzerinden calisacak. Buluta yayinlama bu kapsamda yoktur. Oyun kurulumu salt okunur kaynaktir; Steam dosyalari degistirilmeyecek.

## Incelemede dogrulananlar

- Referans sitede DEVICE_MENU, DEVICE_JEVIL, DEVICE_KNIGHT ve DEVICE_CONTACT adresleri bulunuyor. HTML, 640x480 canvas, klavye ve dokunmatik kontrolleri tanimliyor. Tarayicida oynanis henuz dogrulanmadi; Playwright mevcut Chrome yolunu bulamadi.
- Yerel kurulum C:/Program Files (x86)/Steam/steamapps/common/DELTARUNE konumunda. chapter1_windows ile chapter5_windows arasinda klasorler ve her birinde FORM baslikli data.win bulunuyor.
- Paketlerde boss, sprite ve olay isimleri goruluyor. Dosya adlari veya isim eslesmeleri tek basina bir bossun oynanabilir, yeni veya tam oldugunu kanitlamaz. Bolumler arasinda eski icerik tekrar bulunabilir.
- UndertaleModTool, GameMaker paketlerini incelemek ve varlik/kod cikarmak icin aday aractir. Bu kurulumla uyumlulugu uygulama oncesi veri cikarim adiminda dogrulanacak.

## Yaklasim ve alternatifler

Secilen yaklasim: Referansin gorunus ve etkilesim dilini yeniden uygulayan, kendi ortak savas motoru olan moduler proje. Yerel varliklar ve incelenen oyun davranislari boss tanimlarina aktarilacak. Bu, boss eklemeyi ve motoru juriye aciklamayi kolaylastirir.

Alternatif 1: Referans sitenin istemci kodunu dogrudan kopyalamak. Mevcut iki savas icin hizli olabilir, ancak kaynak lisansi, genisletilebilirlik ve ogrencinin kendi katkisini aciklamasi acisindan ek inceleme gerektirir. Varsayilan yontem olmayacak.

Alternatif 2: Her bossu ayri bir oyun olarak yazmak. Ozel mekaniklere esneklik verir, ancak carpisma, menu ve kayit mantigini tekrarlar. Ortak motor ile bossa ozel eklentiler tercih edilecek.

## Kullanici deneyimi

Piksel gorunumlu acilis ve boss secim ekrani, bolumlere gore duzenlenmis savas seceneklerine gecis saglayacak. Referansin siyah zemin, piksel grafik, sabit oyun koordinatlari ve klavye odakli deneyimi korunacak. Uygulama referans sitenin resmi surumu gibi tanitilmayacak.

Ok tuslari hareket/menu secimi; Z veya Enter onay; X veya Escape geri; R yeniden baslatma icin kullanilacak. Dokunmatik kontroller ayni giris katmanini kullanacak. Ses ayari, duraklatma ve menuden savasa geri donus bulunacak. Pencere odagi kaybolunca oyun duraklayacak ve basili tuslar sifirlanacak.

Savaslar secim, oyuncu eylemi, dusman saldirisi ve sonuc durumlari arasinda ilerleyecek. FIGHT, ACT, ITEM ve SPARE davranislari, TP, parti uyeleri ve ozel ruh mekanikleri ilgili karsilasmada mevcut olduklari olcude uygulanacak. Her savasa oyunda bulunmayan genel bir menu zorla eklenmeyecek.

## Mimari

TypeScript tabanli canvas oyun cekirdegi ve yerel gelistirme sunucusu kullanilacak. Vite adayidir; kesin paket surumleri uygulama planinda mevcut dokumantasyonla dogrulanacak. Harici veri tabani veya kullanici hesabi gerekmiyor.

- Giris: Klavye ve dokunmatik girdilerini tek arayuze donusturur; tekrar, odak kaybi ve tus birakma davranislarini yonetir.
- Simulasyon: Sabit zaman adimi, sinirli gecikme telafisi, tohumlanabilir rastgelelik ve savas durum makinesi. Ekran cizim hizi saldiri hizini degistirmez.
- Carpisma: Mermi/ruh geometrisi, hasar, gecici hasar bagisikligi ve uygun bosslarda yakin gecis/TP davranisi.
- Sunum: 640x480 mantiksal koordinatlar, piksel olcekleme, sprite atlaslari, efektler, HUD ve menuler. Tarayici boyutu simulasyon koordinatlarini degistirmez.
- Ses: Kullanici etkilesiminden sonra baslatma, ses kapatma, duraklatma ve boss gecisinde eski sesleri temizleme.
- Boss modulleri: Kaynak kayitlari, istatistikler, faz gecisleri, saldiri zaman cizelgeleri ve ozel mekanikler. Tum bosslar ayni saldirinin renk degistirilmis kopyasi olmayacak.
- Yerel kayit: Surumlenmis ayarlar ve tamamlanan savaslar. Bozuk veya kullanilamayan tarayici depolamasi oyunun acilmasini engellemeyecek.
- Cikarim araci: Oyunun kurulumundan varliklari proje tarafindaki uretilmis dizine cikarir; her kaydin kaynak paketini ve hash bilgisini manifestte tutar.

## Boss kapsami ve veri kaynagi

Hedef, kurulumda dogrulanmis tum boss karsilasmalaridir; ana, gizli ve minibosslar ayri siniflanacak. Ayni bossun farkli savas varyantlari, mekanikleri farkliysa ayri karsilasma olarak kaydedilecek. Bolum klasorleri arasinda kopyalanan tanimlar tekillestirilecek.

Kesin isim listesi, nesne/oda/kod incelemesi tamamlanmadan uydurulmayacak. Envanter her karsilasma icin kaynak paket, savas nesneleri, gerekli sprite/sesler, saldirilar, kazanma/kaybetme kosullari ve uyarlama durumunu icerecek.

Varlik cikarmak GML kodunu tarayicida otomatik calistirmaz. Saldiri mantigi incelenip ortak motora uyarlanacak. Kaynaktan dogrulanamayan davranis acikca yaklasik olarak isaretlenecek; yaklasik bir savas birebir aktarim diye sunulmayacak. Kullaniciya bos kart veya genel saldiri verip tamamlandi denmeyecek.

## Hata ve yasam dongusu davranislari

Eksik/uyumsuz paket, bulunamayan atlas veya ses icin anlasilir hata ve yeniden deneme yolu bulunacak. Basarisiz yuklenen boss oynanabilir gibi gosterilmeyecek. Ses eksikligi goruntu ve simulasyonu gereksiz yere durdurmayacak.

Boss degistirme ve yeniden baslatma, eski mermileri, zamanlayicilari, sesleri ve girdi durumunu temizleyecek. Buyuk bir dosya yeniden yazilirsa mevcut sorumluluklar ve tasinacaklari moduller once denetlenecek.

## Dogrulama ve teslim kabul olcutleri

1. Temiz proje kurulumundan sonra npm komutuyla yerel sunucu acilir; uygulama uzak site dosyalarina bagli degildir.
2. Envanterin her bossu kaynak kayitlariyla izlenebilir; tekrarlar ve karsilasma varyantlari gerekcelendirilir.
3. Her boss secilebilir, kendi saldirilarini kullanir ve kazanma/kaybetme/yeniden baslatma akislarini tamamlar.
4. Motor testleri carpisma, hasar bagisikligi, durum gecisleri ve zaman adimindan bagimsiz davranisi dogrular. Tohumlu senaryolar tekrar uretilebilir.
5. Temsilci savaslar klavye ve dokunmatik girdilerle tarayicida kontrol edilir. Odak kaybi, duraklatma, eksik varlik ve bozuk yerel kayit durumlari denenir.
6. Her bossun fazlari ve saldiri zamanlamalari kaynak kod/oynanis kanitlariyla karsilastirilir; kalan farklar teslim kaydinda aciklanir.
7. Kaynak kodu, calistirma/cikarim talimatlari, mimari aciklama ve test sonuclari teslim edilir. Referans site, oyun ve kullanilan araclar icin kaynak kredileri korunur.

## Uygulama sirasi ve acik noktalar

Once veri cikarim uyumlulugu ve boss envanteri dogrulanacak. Sonra kaynaklari tamam olan bir boss ile giristen sonuc ekranina kadar dikey kesit uygulanacak. Ortak motor bu kesitte dogrulandiktan sonra diger bosslarin farkli mekanikleri entegre edilecek. Ara teslimler ilerlemeyi gosterebilir; tum boss hedefinin yerine gecmez.

Acik noktalar: Yerel paketlerin surum ve kokeni, cikarim aracinin uyumlulugu, kesin boss/varyant sayisi ve her mekanigin uyarlama maliyeti. Bu noktalari incelemeden tum bosslar icin sure veya birebir davranis garantisi verilmeyecek.

Sonraki asama: Kullanici bu yazili tasarimi inceledikten sonra uygulanabilir gorevler, araclar, dosya duzeni ve dogrulama adimlarini iceren uygulama plani hazirlanacak.
