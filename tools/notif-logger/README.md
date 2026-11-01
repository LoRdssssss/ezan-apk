# Bildirim Kaydedici (G-002)

Kendi Android test cihazlarımızda bildirim teslim zamanını ve ikinci telefonda
isteğe bağlı ses eşiği geçişlerini ölçen Kotlin aracı. Android 8.0 / API 26+
gerektirir. Rakip uygulamalara veya sunucularına müdahale etmez.

## Derleme ve test

JDK 17 veya 21, Android SDK platform 35 ve build-tools 35.0.0 kurulu olmalı.
`ANDROID_HOME` SDK yolunu göstermelidir. Bu klasörde:

```bash
./gradlew --no-daemon testDebugUnitTest lintDebug assembleDebug assembleDebugAndroidTest
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

Windows PowerShell'de `./gradlew` yerine `.\gradlew.bat` kullanın.
Gradle 8.13 dağıtımı SHA-256 ile doğrulanır; araç sürümleri sabittir.
GitHub Actions `Notification logger CI`, debug APK'yi `notif-logger-debug`,
birim testleri / lint raporları ve emülatör kanıtını `notif-logger-verification`
artefaktlarına koyar. Debug APK yalnızca laboratuvar kullanımı içindir.

## Telefonda kullanım

1. Kişisel hesap / bildirim içermeyen, size ait bir test cihazına APK'yi kurun.
2. **Bildirim erişimini aç** düğmesinden yalnızca bu uygulamaya erişim verin.
   Bu Android izni, diğer uygulamalardan gelen bildirimleri okuyabilir.
3. Uygulamaya dönüp **Bildirim kaydını başlat** düğmesine dokunun.
   Durumda `Dinleyici: bağlı` ve `Bildirim kaydı: açık` görünmelidir.
4. **Test bildirimi gönder** düğmesine dokunun. Android 13+ üzerinde uygulamanın
   test bildirimi gönderebilmesi için ayrıca bildirim izni verin.
   Teslim edilen bildirimin `postTime` ve callback cihaz saati ekranda görünür.
5. **CSV dışa aktar** ile Android dosya seçicisinde cihazdaki yerel bir klasörü
   seçin. Dosya seçicisi bulut sağlayıcılarını da gösterebilir; seçim kullanıcıya
   aittir. Uygulama kendiliğinden yükleme veya paylaşım yapmaz.
6. Bitirince **Bildirim kaydını durdur**, gerekirse **Kayıtları sil** düğmelerini
   kullanın ve Android ayarlarından bildirim erişimini kaldırın.

İlk kurulumda kayıt kapalıdır. Bildirim kaydı tercihi yeniden açılışta korunur;
Android dinleyiciyi bağlı tuttuğu sürece ekran kapalıyken de kayıt yapılır.
Süreç kapanması, üretici pil kısıtları, erişimin iptali ve yeniden başlatma
ölçümde boşluk yaratabilir. İlk kilit açılmadan kayıt garantisi yoktur.
Android 15 hassas bildirim başlıklarını maskeleyebilir. Araç kaçırılan
bildirimleri geriye dönük tamamlamaz; yeniden gönderim / güncellemeler ayrı
satırdır. Uzun koşularda CSV büyür; koşular arasında dışa aktarıp silin.

## CSV şeması

Dosya: uygulamaya özel `files/notifications.csv`, UTF-8, virgül ayraçlı,
CRLF satır sonlu ve tüm hücreler çift tırnaklıdır. Başlık / tırnak / satır
sonu RFC 4180 biçiminde kaçırılır. Formül gibi başlayan güvenilmeyen metne
`'` eklenir; sayısal zaman alanları değişmez.

| Alan | Anlamı |
| --- | --- |
| `event` | `notification` veya `audio_threshold` |
| `package_name`, `title` | Kaynak paket ve bildirimin başlığı; ses satırında boş |
| `post_time_ms` | Android `StatusBarNotification.postTime`, Unix ms; ses satırında boş |
| `device_time_ms` | Callback / ses okuması anındaki `System.currentTimeMillis()`, Unix ms |
| `device_time_iso`, `zone_id` | Aynı cihaz saati, ISO 8601 ofset ve o andaki saat dilimi |
| `elapsed_realtime_ms` | `SystemClock.elapsedRealtime()`, yeniden başlatmadan beri ms |
| `channel_id`, `notification_key` | Kanal ve güncellemeleri ilişkilendirmek için sistem anahtarı |
| `sound_uri` | Kanalda yapılandırılmış ses URI'si; sessizse boş, kanal okunamadıysa `unknown` |
| `vibration_enabled`, `vibration_pattern_ms` | Kanal titreşim ayarı ve `;` ayrılmış örüntü |
| `channel_importance` | Android kanal önem değeri; okunamadıysa `unknown` |
| `peak_dbfs`, `threshold_dbfs` | Yalnızca ses eşiği satırları için tepe ve eşik değeri |

Ses / titreşim sütunları **yapılandırmayı** gösterir. DND, ses düzeyi,
kullanıcı ayarı ve cihaz politikaları yüzünden ses gerçekten çalmayabilir.
`post_time_ms` bildirimin yayın zamanıdır; ezanın başladığı an değildir.
Duvar saati elle değişebilir; monoton saat, saat değişimi ve yeniden başlatmayı
ayırt etmeye yardımcı olur. Üç cihazlık / 300 olaylık alarm kabulünün yerine
bu aracın tek bildirim testi geçmez.

## İsteğe bağlı ses modu

İkinci test telefonunda eşik girin (-90..0 dBFS), mikrofon izni verin ve
**Ses ölçümünü başlat** düğmesine yeniden dokunun. Ham ses dosyası üretilmez;
16 kHz mono PCM örnekleri yalnızca geçici bellekte işlenir. Eşiğin altından
üstüne geçişte zaman damgası yazılır; olaylar arasında en az 1 saniye vardır.
Aynı yüksek seviyede sürekli yeni satır üretilmez. Ölçüm açıkken ekran açık tutulur. Ses ölçümünü durdurma,
uygulamadan ayrılma veya ekranın kapanması mikrofonu durdurur; geri dönünce
kendiliğinden başlamaz. Bildirim kaydı ve ses ölçümü bağımsızdır.

Bu ölçüm kalibre edilmiş dB SPL veya ezan tanıma değildir. Diğer sesler de
eşiği aşabilir. PCM tamponu / işletim sistemi gecikmesi ve iki telefonun
saat farkı ölçümü etkiler; koşudan önce saatleri karşılaştırın. Mikrofonun
üretici / gizlilik ayarıyla susturulması sessizlik gibi görünebilir.

## ADB ile CSV alma

Bildirim ve ses ölçümünü önce durdurun. Debug APK'de özel dosya:
`/data/user/0/dev.ezan.notiflogger/files/notifications.csv`.
Özel dosyaya doğrudan `adb pull` erişemez; `run-as` ile geçici yerel dosyaya
çıkarın. Tek test cihazı bağlıyken, depo kökünde:

```bash
adb shell 'run-as dev.ezan.notiflogger cat files/notifications.csv > /data/local/tmp/notif-logger.csv'
adb pull /data/local/tmp/notif-logger.csv ./notifications.csv
adb shell rm /data/local/tmp/notif-logger.csv
```

PowerShell'de de aynı komutlar kullanılabilir. Birden çok cihazda her `adb`
komutuna `-s CIHAZ_SERI_NO` ekleyin; seri numarasını rapora koymayın.
`run-as` release APK'de çalışmaz; dosya seçicisini kullanın. İlk kayıt veya
ilk dışa aktarımdan önce dosya henüz olmayabilir.

## Emülatör kanıtı

Kendi temiz emülatörünüzde APK'leri derledikten sonra:

```bash
bash scripts/emulator-smoke.sh
```

Betik yalnızca test cihazında dinleyici iznini açar ve test bildirim iznini
verir. Platform instrumentation gerçek `NotificationListenerService`
callback'ini bekler; CSV'deki `postTime` değerini sistemin aktif bildirimiyle
birebir, callback zamanını gönderim / gözlem aralığıyla karşılaştırır. Ağ
izinlerini kurulu APK'den denetler. Sonuç, gerçek ekran görüntüsü ve CSV
`evidence/` altına alınır. Test başarısızsa betik başarısız olur. Bu dizin
git tarafından yok sayılır; CI artefaktında bulunur.

Birim testleri CSV kaçırma / formül koruması, eşzamanlı yazma, tekrar açma,
dışa aktarma, disk hataları, milisaniye / saat dilimi / yaz saati dönüşümü,
PCM tepe hesabı ve eşik geçişlerini kapsar. Gerçek cihaz mikrofon / DND /
pil yönetimi doğrulaması ayrıca laboratuvarda yapılmalıdır; emülatör kanıtı
alarm güvenilirliği veya gerçek duyulma kanıtı değildir.

## Gizlilik ve lisans

Manifestte `INTERNET`, konum veya depolama izni yoktur. Mikrofon yalnızca
isteğe bağlı ölçüm için kullanılır. CSV uygulama alanındadır; otomatik
yedekleme ve cihaz aktarımı kapatılmıştır. Kaydı silmek dışa aktarılmış
kopyaları silmez. Test aracı APK'sinde reklam / izleme SDK'sı yoktur.
Üçüncü taraf dini içerik veya ses kaydı içermez.

Sabit sürümler, doğrulanan lisans kaynakları ve dağıtım şartları:
[üçüncü taraf envanteri](../../docs/THIRD_PARTY.md).
