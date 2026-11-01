# G-007 — Resmi vakit test referansları

CONFIRMED: 25 şehir × 30 gün × 6 vakit = 4.500 resmi tablo gözlemi.
Dönem: 1–30 Kasım 2026. Türkiye 20, yurt dışı 5 şehir.
Her şehir dosyası Diyanet'in kamuya açık şehir sayfasındaki tablo okunarak
oluşturuldu; API hesabı veya özel uç nokta kullanılmadı.

## Şema ve kaynak izi

Her JSON dosyası `schemaVersion: 1`, `locationId`, resmi `sourceUrl`, UTC
`accessedAt`, `collectionMethod`, `usage`, `permissionBasis` ve `rows` taşır.
Zaman damgası 1 Kasım 2026 toplama oturumunun ortak kayıt zamanıdır.
`rows`: tam 30 benzersiz `YYYY-MM-DD` tarihi ve her tarihte altı `HH:mm` saati.
Saatler şehrin yerel saatidir; UTC değildir.

| Anahtar | Resmi tablo sütunu |
| --- | --- |
| fajr | İmsak / Fajr |
| sunrise | Güneş / Sun |
| dhuhr | Öğle / Dhuhr |
| asr | İkindi / Asr |
| maghrib | Akşam / Maghrib |
| isha | Yatsı / Isha |

Gece yarısından sonraki bir vakit ertesi güne aitse satıra
`dayOffsets: {"isha": 1}` eklenir. Bu örneklemde tüm saatler satırın yerel
tarihinde olduğundan ek alan yoktur; kod eksik alanı 0 kabul eder.
Kod saat farkını 24 saat etrafında döndürmez.

Bazı ilk web yanıtları önceki günlerin önbelleğini gösterdi; eksik Kasım
aralıkları son veri kümesine alınmadı. Sayfa yeniden açılarak 30 günlük dönem
tamamlandı. Türkçe tarih ve `DD.MM.YYYY` biçimleri ISO tarihe çevrildi;
örtüşen haftalık/aylık satırlar aynı tarih/saatteyse tekilleştirildi, çelişki
olursa toplama durduruldu. Hesaplanan saatlerden referans üretilmedi.
Ham HTML/ekran görüntüsü arşivi bulunmadığından kaynakların geçmiş halinin
bağımsız yeniden doğrulanması bu veri kümesinin sınırıdır.

## Kullanım sınırı

Yalnızca test/doğrulama: [plan madde 11](../../01_PLAN_CHANGES.md).
Uygulamaya gömülmez; motor bu dosyaları içe aktarmaz. Kamuya açık sayfa olması
yeniden dağıtım izni sayılmaz; izin durumu [UNKNOWN](../../../docs/LICENSES.md).
Rakip uygulamalardan veya üçüncü taraf vakit API'lerinden veri alınmadı.

Koordinatlar, saat dilimleri ve örneklem gerekçesi
[locations.json](../../../spikes/prayer-calc/locations.json) içindedir.
Koordinatlar yaklaşık deney noktalarıdır (HYPOTHESIS); resmi hesap noktaları
olarak doğrulanmadı. Şehir kimliği/ismi resmi sayfayla eşleştirildi.

## Yeniden üretim

Depo kökünde `npm ci`, `npm test`, `npm run prayer:compare`.
Araç; eksik/tekrarlı günleri, yanlış kaynak şehir kimliğini ve geçersiz saatleri
reddeder. İnternet kullanmadan
[raporu](../../07_PRAYER_TIME_ACCURACY.md),
[makine özetini](../prayer-results/summary.json) ve
[4.500 satırlık fark CSV'sini](../prayer-results/differences.csv) üretir.
`npm run prayer:check` üretilmiş dosyaların güncelliğini doğrular.
