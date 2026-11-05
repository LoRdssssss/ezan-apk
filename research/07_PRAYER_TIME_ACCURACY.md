# G-007 — Vakit hesaplama doğruluğu

## Sonuç ve kabul kapısı

CONFIRMED: 2026-11-01–2026-11-30 dönemi için
20 Türkiye + 5 yurt dışı nokta × 30 gün × 6 vakit karşılaştırıldı.
Bu dosya `npm run prayer:compare` ile yerel referanslardan üretilir.

| Grup | Ölçülen / beklenen | Tam eşleşme | Ortalama işaretli fark (dk) | MAE (dk) | Maks mutlak fark (dk) |
| --- | --- | --- | --- | --- | --- |
| Türkiye | 3600 / 3600 | 2345 | -0.271 | 0.352 | 2 |
| Yurt dışı | 900 / 900 | 439 | 0.480 | 1.189 | 7 |

Türkiye sıfır fark hedefi: **GEÇMEDİ**.
Eksik/hesaplanamayan vakit: Türkiye 0, yurt dışı 0.
Yurt dışı yöntem farkları Türkiye hata ölçütüne katılmaz.
Bu deney, motorun Diyanet ile birebir uyumlu olduğunu veya yayına hazır olduğunu kanıtlamaz.
Plan değişiklikleri madde 7 uyarınca doğruluk kapısı açık kalır.

## Yöntem ve veri kapsamı

- Fark = hesaplanan yerel dakika − resmi yerel dakika; pozitif değer geç, negatif erken.
- Her vakit kendi yerel tarihiyle karşılaştırılır; gece yarısı farkı mod 24 ile gizlenmez.
- Tablolardaki her vakit hücresi: **ortalama işaretli fark / maksimum mutlak fark**, dakika.
- MAE mutlak farkların ortalamasıdır. Altı vakit eşit ağırlıktadır; güneş dahildir.
- Kaynaklar Diyanet'in kamuya açık şehir sayfalarının aylık tablolarıdır; API kaydı yoktur.
- Erişim: 1 Kasım 2026. Bazı ilk okumalar arama önbelleğinden eski tarih aralığı getirdi;
  eksik Kasım günleri olan yanıtlar kullanılmadı, 30 günün tamamı doğrulandı.
- Sayfa içerikleri web bağlayıcısıyla okundu; HTTP yanıt gövdesi/arşiv ekran görüntüsü saklanmadı.
  Gelecekte değişen sayfalar için zaman damgalı JSON gözlemi yeniden üretim girdisidir.
- Koordinatlar deney için seçilen yaklaşık şehir merkezleridir (HYPOTHESIS);
  Diyanet'in hesap noktaları olduğu doğrulanmadı. Resmi il/ilçe kimlikleri kaynak URL'sindedir.
- Rakım/ufuk/topografya modellenmez. Yüksek rakımlı şehir seçimi, rakım düzeltmesi yapıldığı anlamına gelmez.
- Referanslar yalnızca araştırma/test içindir; uygulama modülü bu dosyaları okumaz.
  Plan madde 11 bu kullanımı tanımlar; yeniden dağıtım izni doğrulanmış sayılmaz.
- Bir aylık örneklem mevsimsel doğruluk veya bir yıllık eşleşme iddiasına yetmez.

## Türkiye — nokta × vakit farkları

| Nokta | İmsak | Güneş | Öğle | İkindi | Akşam | Yatsı | Toplam MAE | Maks |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| İstanbul | 0.000 / 0 | 0.167 / 1 | 0.000 / 0 | -0.967 / 2 | -0.600 / 1 | -0.400 / 1 | 0.356 | 2 |
| Ankara | 0.067 / 1 | 0.133 / 1 | 0.033 / 1 | -0.933 / 2 | -0.667 / 1 | -0.400 / 1 | 0.372 | 2 |
| İzmir | 0.033 / 1 | 0.267 / 1 | 0.033 / 1 | -0.833 / 2 | -0.367 / 1 | -0.433 / 1 | 0.328 | 2 |
| Bursa | 0.033 / 1 | 0.300 / 1 | 0.033 / 1 | -0.900 / 2 | -0.400 / 1 | -0.467 / 1 | 0.356 | 2 |
| Edirne | 0.033 / 1 | 0.200 / 1 | 0.000 / 0 | -0.967 / 2 | -0.600 / 1 | -0.600 / 1 | 0.400 | 2 |
| Çanakkale | 0.133 / 1 | 0.200 / 1 | 0.033 / 1 | -0.933 / 1 | -0.533 / 1 | -0.567 / 1 | 0.400 | 1 |
| Muğla | 0.067 / 1 | 0.400 / 1 | 0.000 / 0 | -0.767 / 2 | -0.567 / 1 | -0.433 / 1 | 0.372 | 2 |
| Antalya | -0.067 / 1 | 0.000 / 0 | 0.000 / 0 | -1.000 / 2 | -0.667 / 1 | -0.567 / 1 | 0.383 | 2 |
| Mersin | 0.033 / 1 | 0.267 / 1 | 0.033 / 1 | -0.833 / 1 | -0.400 / 1 | -0.500 / 1 | 0.344 | 1 |
| Konya | 0.067 / 1 | 0.233 / 1 | 0.033 / 1 | -0.733 / 1 | -0.533 / 1 | -0.467 / 1 | 0.344 | 1 |
| Kayseri | 0.100 / 1 | 0.100 / 1 | 0.000 / 0 | -0.767 / 1 | -0.433 / 1 | -0.533 / 1 | 0.322 | 1 |
| Sivas | 0.067 / 1 | 0.267 / 1 | 0.200 / 1 | -0.833 / 2 | -0.300 / 1 | -0.567 / 1 | 0.372 | 2 |
| Erzurum | 0.033 / 1 | 0.167 / 1 | 0.133 / 1 | -0.767 / 1 | -0.467 / 1 | -0.400 / 1 | 0.328 | 1 |
| Kars | 0.000 / 0 | 0.133 / 1 | 0.067 / 1 | -0.867 / 1 | -0.400 / 1 | -0.567 / 1 | 0.339 | 1 |
| Van | -0.033 / 1 | 0.033 / 1 | -0.067 / 1 | -0.900 / 1 | -0.367 / 1 | -0.533 / 1 | 0.322 | 1 |
| Hakkari | 0.000 / 0 | 0.067 / 1 | 0.000 / 0 | -0.900 / 1 | -0.433 / 1 | -0.367 / 1 | 0.294 | 1 |
| Diyarbakır | 0.000 / 0 | 0.133 / 1 | 0.000 / 0 | -0.767 / 1 | -0.533 / 1 | -0.433 / 1 | 0.311 | 1 |
| Şanlıurfa | 0.033 / 1 | 0.133 / 1 | -0.033 / 1 | -0.833 / 1 | -0.533 / 1 | -0.433 / 1 | 0.333 | 1 |
| Trabzon | 0.000 / 0 | 0.067 / 1 | -0.033 / 1 | -0.933 / 2 | -0.600 / 1 | -0.667 / 1 | 0.383 | 2 |
| Sinop | 0.033 / 1 | 0.200 / 1 | 0.067 / 1 | -0.933 / 1 | -0.600 / 1 | -0.467 / 1 | 0.383 | 1 |

## Yurt dışı — ayrı değerlendirme

| Nokta | İmsak | Güneş | Öğle | İkindi | Akşam | Yatsı | Toplam MAE | Maks |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Berlin | 0.233 / 1 | 0.300 / 1 | 0.000 / 0 | -1.700 / 2 | -0.967 / 2 | 5.600 / 7 | 1.467 | 7 |
| Amsterdam | 0.167 / 1 | 0.433 / 1 | 0.000 / 0 | -1.833 / 2 | -1.067 / 2 | 5.733 / 7 | 1.539 | 7 |
| Londra | 0.433 / 1 | 0.567 / 1 | 0.133 / 1 | -1.433 / 2 | -0.633 / 1 | 5.800 / 7 | 1.500 | 7 |
| New York | 0.333 / 1 | 0.567 / 1 | 0.000 / 0 | -1.300 / 2 | -0.700 / 1 | 4.733 / 6 | 1.272 | 6 |
| Mekke | 0.000 / 0 | 0.000 / 0 | 0.000 / 0 | -0.700 / 1 | -0.133 / 1 | -0.167 / 1 | 0.167 | 1 |

## Parametreler ve kaynakları

Başlangıç profili `adhan@4.4.6` Turkey: imsak 18°, yatsı 17°;
ikindi `Shafi` (bir gölge boyu / asr-i evvel); yuvarlama `nearest`.
Toplam dakika düzeltmeleri İmsak/Güneş/Öğle/İkindi/Akşam/Yatsı sırasıyla:

```json
{"fajr":0,"sunrise":-7,"dhuhr":5,"asr":4,"maghrib":7,"isha":0}
```

- REPORTED: [Diyanet açı açıklaması](https://www.diyanet.gov.tr/icerik/8092), 18° / 17°.
- REPORTED: [Diyanet temkin açıklaması](https://vakithesaplama.diyanet.gov.tr/temkin.php),
  güneş −7, öğle +5, ikindi +4, akşam +7; imsak/yatsı 0 dakika.
- CONFIRMED: [adhan paket kaynağı](https://registry.npmjs.org/adhan/4.4.6),
  Turkey profili ve varsayılan tek gölge boyu; paket lisansı depoda korunur.
- Tek gölge boyunun Diyanet için bağımsız dini onayı: UNKNOWN; kaynak burada kütüphane profilidir.
- Yüksek enlem kuralı `MiddleOfTheNight`, kutup çözümü `Unresolved`.
  Bunlar Diyanet'in yüksek enlem takdir yöntemi olarak doğrulanmadı (UNKNOWN).
  Güneş olayı oluşmazsa varsayılan motor `null` + `unavailable` döndürür.
  `AqrabBalad` / `AqrabYaum` ancak açık parametre seçimiyle kullanılır.

## Sapma nedenleri ve kapanış önerisi

HYPOTHESIS: Şehir merkezi ile resmi hesap koordinatının farkı, dakika yuvarlaması,
astronomik model ve rakım/ufuk düzeltmesinin bulunmaması küçük sapmalara yol açabilir.
Temkinleri ikinci kez eklememek için kütüphanenin yöntem düzeltmeleri sıfırlanır;
yukarıdaki toplam düzeltmeler bir kez uygulanır.

Aşağıdaki vektörler aynı 30 gündeki farkların negatif medyanıdır: başlangıç düzeltmelerine
eklenmesi önerilen **deneysel** dakika değerleri. Otomatik uygulanmaz, bağımsız kalibrasyon
veya gelecekteki doğruluk kanıtı değildir. Son sütun, bu sabit düzeltme yapılsa bile kalan
maksimum mutlak sapmayı gösterir; sıfır değilse sabit dakika parametresi bütün günleri kapatmaz.

| Nokta | Ek dakika: İmsak / Güneş / Öğle / İkindi / Akşam / Yatsı | Kalan maks (dk) |
| --- | --- | --- |
| İstanbul | 0 / 0 / 0 / 1 / 1 / 0 | 1 |
| Ankara | 0 / 0 / 0 / 1 / 1 / 0 | 1 |
| İzmir | 0 / 0 / 0 / 1 / 0 / 0 | 1 |
| Bursa | 0 / 0 / 0 / 1 / 0 / 0 | 1 |
| Edirne | 0 / 0 / 0 / 1 / 1 / 1 | 1 |
| Çanakkale | 0 / 0 / 0 / 1 / 1 / 1 | 1 |
| Muğla | 0 / 0 / 0 / 1 / 1 / 0 | 1 |
| Antalya | 0 / 0 / 0 / 1 / 1 / 1 | 1 |
| Mersin | 0 / 0 / 0 / 1 / 0 / 0 | 1 |
| Konya | 0 / 0 / 0 / 1 / 1 / 0 | 1 |
| Kayseri | 0 / 0 / 0 / 1 / 0 / 1 | 1 |
| Sivas | 0 / 0 / 0 / 1 / 0 / 1 | 1 |
| Erzurum | 0 / 0 / 0 / 1 / 0 / 0 | 1 |
| Kars | 0 / 0 / 0 / 1 / 0 / 1 | 1 |
| Van | 0 / 0 / 0 / 1 / 0 / 1 | 1 |
| Hakkari | 0 / 0 / 0 / 1 / 0 / 0 | 1 |
| Diyarbakır | 0 / 0 / 0 / 1 / 1 / 0 | 1 |
| Şanlıurfa | 0 / 0 / 0 / 1 / 1 / 0 | 1 |
| Trabzon | 0 / 0 / 0 / 1 / 1 / 1 | 1 |
| Sinop | 0 / 0 / 0 / 1 / 1 / 0 | 1 |
| Berlin | 0 / 0 / 0 / 2 / 1 / -6 | 1 |
| Amsterdam | 0 / 0 / 0 / 2 / 1 / -6 | 1 |
| Londra | 0 / -1 / 0 / 1 / 1 / -6 | 1 |
| New York | 0 / -1 / 0 / 1 / 1 / -5 | 1 |
| Mekke | 0 / 0 / 0 / 1 / 0 / 0 | 1 |

Önerilen sıra: resmi hesap noktasını doğrula; yuvarlama yönünü ayrı deneyde karşılaştır;
konuma bağlı ufuk/rakım etkisini ölç; ardından açı/temkin değişikliğini başka ayda ve
ayrılmış doğrulama günlerinde sınayıp bütün Türkiye vakitlerinde 0 dakika şartını yeniden çalıştır.
Kanıt olmadan tek bir parametrenin bütün farkları kapatacağı söylenemez (UNKNOWN).

## Noktalar ve kaynak sayfaları

Koordinat durumu: HYPOTHESIS: approximate city-centre points selected for the experiment; not verified Diyanet calculation coordinates. Elevation and terrain are not modelled.

| Nokta | Bölge | Enlem | Boylam | IANA saat dilimi | Resmi sayfa |
| --- | --- | --- | --- | --- | --- |
| İstanbul | Marmara / kıyı | 41.0082 | 28.9784 | Europe/Istanbul | [9541](https://namazvakitleri.diyanet.gov.tr/tr-TR/9541/istanbul-icin-namaz-vakti) |
| Ankara | İç Anadolu / iç | 39.9334 | 32.8597 | Europe/Istanbul | [9206](https://namazvakitleri.diyanet.gov.tr/tr-TR/9206/ankara-icin-namaz-vakti) |
| İzmir | Ege / kıyı | 38.4237 | 27.1428 | Europe/Istanbul | [9560](https://namazvakitleri.diyanet.gov.tr/tr-TR/9560/izmir-icin-namaz-vakti) |
| Bursa | Marmara / iç | 40.195 | 29.06 | Europe/Istanbul | [9335](https://namazvakitleri.diyanet.gov.tr/tr-TR/9335/bursa-icin-namaz-vakti) |
| Edirne | Marmara / batı | 41.6771 | 26.5557 | Europe/Istanbul | [9419](https://namazvakitleri.diyanet.gov.tr/tr-TR/9419/edirne-icin-namaz-vakti) |
| Çanakkale | Marmara / kıyı | 40.1467 | 26.4086 | Europe/Istanbul | [9352](https://namazvakitleri.diyanet.gov.tr/tr-TR/9352/canakkale-namaz-vakitleri) |
| Muğla | Ege / iç | 37.2153 | 28.3636 | Europe/Istanbul | [9747](https://namazvakitleri.diyanet.gov.tr/tr-TR/9747/mugla-namaz-vakitleri) |
| Antalya | Akdeniz / kıyı | 36.8969 | 30.7133 | Europe/Istanbul | [9225](https://namazvakitleri.diyanet.gov.tr/tr-TR/9225/antalya-icin-namaz-vakti) |
| Mersin | Akdeniz / kıyı | 36.8121 | 34.6415 | Europe/Istanbul | [9737](https://namazvakitleri.diyanet.gov.tr/tr-TR/9737/mersin-namaz-vakitleri) |
| Konya | İç Anadolu / iç | 37.8746 | 32.4932 | Europe/Istanbul | [9676](https://namazvakitleri.diyanet.gov.tr/tr-TR/9676/konya-namaz-vakitleri) |
| Kayseri | İç Anadolu / yüksek | 38.7205 | 35.4826 | Europe/Istanbul | [9620](https://namazvakitleri.diyanet.gov.tr/tr-TR/9620/kayseri-icin-namaz-vakti) |
| Sivas | İç Anadolu / yüksek | 39.7505 | 37.015 | Europe/Istanbul | [9868](https://namazvakitleri.diyanet.gov.tr/tr-TR/9868/sivas-namaz-vakitleri) |
| Erzurum | Doğu Anadolu / yüksek | 39.9043 | 41.2679 | Europe/Istanbul | [9451](https://namazvakitleri.diyanet.gov.tr/tr-TR/9451/erzurum-icin-namaz-vakti) |
| Kars | Doğu Anadolu / yüksek | 40.6013 | 43.0975 | Europe/Istanbul | [9594](https://namazvakitleri.diyanet.gov.tr/tr-TR/9594/kars-namaz-vakitleri) |
| Van | Doğu Anadolu / yüksek | 38.4891 | 43.4089 | Europe/Istanbul | [9930](https://namazvakitleri.diyanet.gov.tr/tr-TR/9930/van-icin-namaz-vakti) |
| Hakkari | Doğu Anadolu / yüksek | 37.5744 | 43.7408 | Europe/Istanbul | [9507](https://namazvakitleri.diyanet.gov.tr/tr-TR/9507/hakkari-namaz-vakitleri) |
| Diyarbakır | Güneydoğu Anadolu / iç | 37.9144 | 40.2306 | Europe/Istanbul | [9402](https://namazvakitleri.diyanet.gov.tr/tr-TR/9402/diyarbakir-icin-namaz-vakti) |
| Şanlıurfa | Güneydoğu Anadolu / iç | 37.1674 | 38.7955 | Europe/Istanbul | [9831](https://namazvakitleri.diyanet.gov.tr/tr-TR/9831/sanliurfa-namaz-vakitleri) |
| Trabzon | Karadeniz / kıyı | 41.0027 | 39.7168 | Europe/Istanbul | [9905](https://namazvakitleri.diyanet.gov.tr/tr-TR/9905/trabzon-namaz-vakitleri) |
| Sinop | Karadeniz / kıyı | 42.0264 | 35.1551 | Europe/Istanbul | [9847](https://namazvakitleri.diyanet.gov.tr/tr-TR/9847/sinop-namaz-vakitleri) |
| Berlin | Yurt dışı | 52.52 | 13.405 | Europe/Berlin | [11002](https://namazvakitleri.diyanet.gov.tr/tr-TR/11002/berlin-icin-namaz-vakti) |
| Amsterdam | Yurt dışı | 52.3676 | 4.9041 | Europe/Amsterdam | [13976](https://namazvakitleri.diyanet.gov.tr/en-US/13976/amsterdam-prayer-times) |
| Londra | Yurt dışı | 51.5074 | -0.1278 | Europe/London | [14096](https://namazvakitleri.diyanet.gov.tr/tr-TR/14096/londra-namaz-vakitleri) |
| New York | Yurt dışı | 40.7128 | -74.006 | America/New_York | [8903](https://namazvakitleri.diyanet.gov.tr/tr-TR/8903/new-york-icin-namaz-vakti) |
| Mekke | Yurt dışı | 21.4225 | 39.8262 | Asia/Riyadh | [16309](https://namazvakitleri.diyanet.gov.tr/en-US/16309/mekke-prayer-times) |

## Yeniden üretim ve test kanıtı

```bash
npm ci
npm test
npm run prayer:compare
npm run prayer:check
npm run prayer:gate
npm run lint:md
```

`prayer:check` kayıtlı rapor, özet ve CSV'nin yeniden üretilebilirliğini denetler.
`prayer:gate` Türkiye 0 dakika hedefi geçmezse çıkış kodu 2 verir; bu beklenen
sonuç test başarısı olarak sunulmaz. Çalıştırılan komutların gerçek çıktıları PR'dadır.

Ham referanslar: [veri kılavuzu](data/prayer-ref/README.md).
Makine özeti: [summary.json](data/prayer-results/summary.json).
Her nokta/gün/vakit farkı: [differences.csv](data/prayer-results/differences.csv).
Motor/test sözleşmesi: [spike kılavuzu](../spikes/prayer-calc/README.md).

CONFIRMED: Node.js 24.19.0 ile 17 test ve karşılaştırma yeniden üretimi
[kayıtlı koşuda](evidence/prayer-calc-test-run.txt) geçti.
Aynı koşu `strace -f -e trace=network` ile izlendi;
[sistem çağrısı kaydında](evidence/prayer-calc-network.txt) ağ bağlantısı çağrısı yoktur.
Bu gözlem test edilen motor/karşılaştırma yollarını kapsar; paket kurulumu bu koşuya dahil değildir.

Bağlantı kontrolü: bu bulut ortamının HTTP izin listesi Diyanet alan adlarını kapsamıyor.
`npm run check:links` bu yüzden 27 resmi kaynak bağlantısında HTTP 403 ile başarısız oldu;
bu, kaynakların ölü olduğunu kanıtlamaz. Sayfalar veri toplama sırasında web bağlayıcısıyla okundu.
[Bağlantı koşusu](evidence/prayer-calc-links.txt) gerçek hata çıktısını korur.
