# G-007 — Çevrimdışı vakit motoru

Node.js 24 ile çerçeveden bağımsız JavaScript denemesi.
`adhan@4.4.6` MIT; lisans kanıtı [envanterde](../../docs/THIRD_PARTY.md).
Bu deney bir mobil uygulama veya yayın onayı değildir.

## Çalıştırma

Depo kökünde:

```bash
npm ci
npm test
npm run prayer:compare
npm run prayer:check
npm run prayer:gate
```

Hesap ve karşılaştırma internet gerektirmez; ilk `npm ci` paket kurulumu için
ağ kullanır. 17 test; Türkiye UTC+3, yabancı yaz saati geçişleri, altı farklı
host saat dilimi, yıl/ay/artık gün, UTC+14 tarih çizgisi, kutup yaz/kışı,
yüksek enlem kuralları, parametreler ve referans doğrulamasını kapsar.

`prayer:compare` rapor/JSON/CSV üretir; fark bulunması komut hatası değildir.
`prayer:check` aynı çıktıları dosyalarla karşılaştırır; fark/eksiklikte kod 1.
`prayer:gate` ayrıca Türkiye'deki tüm 3.600 vakit 0 dakika değilse kod 2 verir.
CI testleri ve yeniden üretimi çalıştırır; kritik doğruluk kapısının geçmesi
ayrı bir koşuldur ve [sonuç raporunda](../../research/07_PRAYER_TIME_ACCURACY.md)
açıkça görünür. Kritik kapı geçmeden birleştirme/yayın yapılmaz.

## Değiştirilebilir sağlayıcı sözleşmesi

```js
import { calculatePrayerTimes } from './engine.mjs';

const result = calculatePrayerTimes('2026-11-01', {
  latitude: 41.0082,
  longitude: 28.9784,
  timeZone: 'Europe/Istanbul',
}, {
  fajrAngle: 18,
  ishaAngle: 17,
  madhab: 'Shafi',
  adjustments: { asr: 4 },
});
```

Girdi tarih değil, konumun **yerel takvim günü**dür. IANA saat dilimi zorunludur.
1900–2100 gerçek tarihler kabul edilir; yanlış girdi/parametreler hata verir.
Rakım parametresi yoktur; ufuk/rakım etkisi modellenmez.
Sağlayıcı giriş noktası `calculatePrayerTimes(date, location, config)`;
çağıran kod başka sağlayıcıyı aynı sözleşmeyle enjekte edebilir.

Çıktı `provider`, `date`, `timeZone`, tam çözülmüş `config`, `status`,
`accuracyStatus`, `reason`, `unavailable` ve altı `times` alanı taşır.
Her mevcut vakit: ISO `utc`, `localDate`, `time`, `dayOffset`, istenen günden
itibaren mutlak yerel `minute`, olay anındaki `utcOffsetMinutes`.
`dayOffset: 1` ertesi gündür; alarm tüketicisi UTC anını kullanmalıdır.

Güneş olayı oluşmazsa ilgili vakit `null`, genel durum `unavailable` olur;
mevcut vakitler korunur. `accuracyStatus: UNVERIFIED` hesaplanmış bir saatin
resmi Diyanet eşleşmesi veya dini onayı anlamına gelmediğini belirtir.
Host saat dilimi bir takvim gününü tamamen atlıyorsa (tarihsel tarih çizgisi
değişimleri) motor açık hata verir; sessizce başka gün hesaplamaz.

## Parametreler

| Alan | Varsayılan | Seçenek / anlam |
| --- | --- | --- |
| fajrAngle / ishaAngle | 18 / 17 | Derece; 0–30 arası açık aralık |
| madhab | Shafi | Shafi: tek gölge boyu, Hanafi: çift gölge boyu |
| adjustments | 0, −7, +5, +4, +7, 0 | İmsak/güneş/öğle/ikindi/akşam/yatsı toplam dakika düzeltmesi; ±120 sınırı |
| rounding | nearest | nearest, up, down |
| highLatitudeRule | MiddleOfTheNight | MiddleOfTheNight, SeventhOfTheNight, TwilightAngle |
| polarCircleResolution | Unresolved | Unresolved, AqrabBalad, AqrabYaum |

Kısmi `adjustments` yalnızca belirtilen vaktin varsayılanını değiştirir.
Değerler kütüphanenin Turkey düzeltmesine **eklenmez**, toplam değeri belirler.
Dakika yuvarlaması düzeltmeden sonra bir kez yapılır.
Yüksek enlem / kutup seçenekleri Diyanet yöntemi diye onaylanmış değildir;
açık seçim olmadan kutup için yapay vakit üretilmez.
Kaynaklar ve bilinmeyenler [rapordadır](../../research/07_PRAYER_TIME_ACCURACY.md).

## Karşılaştırma girdileri ve lisans

[Noktalar](locations.json) yaklaşık şehir merkezleri olarak seçilmiştir;
resmi hesap koordinatları değildir. Türkiye'de yedi bölge, kıyı/iç ve yüksek
rakım örnekleri; yurt dışında Berlin, Amsterdam, Londra, New York, Mekke.
Resmi referanslar ve kaynak/tarih şeması
[veri kılavuzundadır](../../research/data/prayer-ref/README.md).
Motor yalnızca `adhan` içe aktarır; referanslar motorun çalışma zamanı girdisi değildir.
Koordinatlar dosyaya/ağa yazılmaz; hesap çağrısı I/O yapmaz.
Tam MIT bildirimi [lisans dosyasında](../../docs/licenses/adhan-4.4.6.txt) korunur.

Linux doğrulamasında `strace -f -e trace=network` altında testler ve
karşılaştırma çalıştırıldı; ağ bağlantısı çağrısı görülmedi.
[Koşu çıktısı](../../research/evidence/prayer-calc-test-run.txt) ve
[sistem çağrısı izi](../../research/evidence/prayer-calc-network.txt) kayıtlıdır.
