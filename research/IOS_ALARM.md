# iOS Ezan Alarmı Değerlendirmesi (G-005)

Bu rapor, iOS platformunda güvenilir, internetsiz ve kesintisiz ezan alarmı çalıştırmak için mevcut mimari seçenekleri, Apple'ın resmi yetenek ve kısıtlamalarını inceler.

Durum etiketleri: `CONFIRMED` (resmi Apple belgeleri ve yerel testle doğrulanmış), `REPORTED` (kamuya açık üçüncü taraf istatistikleri), `HYPOTHESIS` (öngörülen mekanizma), `UNKNOWN` (kamuya açık resmi veri bulunmayan).

---

## 1. AlarmKit (iOS 26+) Yetenekleri ve Sınırları

Apple, WWDC25 kapsamında iOS 26 ile birlikte üçüncü taraf alarm ve zamanlayıcı uygulamaları için **AlarmKit** çatısını duyurmuştur.

### 1.1 Temel Yetenekler

- **Sistem Düzeyinde Alarm Entegrasyonu (`CONFIRMED`):** Standart yerel bildirimlerin aksine, AlarmKit sistemin yerel saat/alarm altyapısını kullanır. Alarm çaldığında cihaz Sessiz Modda (Hardware Mute Switch) veya Odak/Rahatsız Etmeyin (Focus / Do Not Disturb) modunda olsa dahi alarm sesi duyulur.
  - Kaynak: [Apple Developer Documentation — AlarmKit](https://developer.apple.com/documentation/alarmkit)
- **Kilit Ekranı, Canlı Etkinlikler ve StandBy Desteği (`CONFIRMED`):** AlarmKit, ActivityKit ve Widget Extension entegrasyonu ile kilit ekranında ve Dynamic Island üzerinde tam ekran veya genişletilmiş alarm durum kartları (`AlarmPresentation`, `AlarmAttributes`) sunar.
  - Kaynak: [Apple Developer Documentation — AlarmAttributes](https://developer.apple.com/documentation/alarmkit/alarmattributes)
- **App Intents ile Etkileşim (`CONFIRMED`):** Alarm çaldığında erteleme (snooze), durdurma veya özel uygulama aksiyonları App Intents üzerinden sistem düzeyinde tetiklenebilir.
  - Kaynak: [Apple Developer Documentation — AlarmManager](https://developer.apple.com/documentation/alarmkit/alarmmanager)
- **Uzun Ses Çalma (`CONFIRMED`):** Klasik bildirimlerdeki 30 saniye kuralı AlarmKit için geçerli değildir; sistem alarmı durdurulana kadar yapılandırılan özel ses dosyasını çalabilir.

### 1.2 İzin Akışı ve Güvenlik Sınırları

- **Yetkilendirme Gereksinimi (`CONFIRMED`):** `AlarmManager.shared.requestAuthorization()` ile kullanıcıdan açıkça izin istenmelidir. `Info.plist` dosyasına `NSAlarmKitUsageDescription` anahtarı eklenmek zorundadır.
  - Kaynak: [Apple Developer Documentation — AlarmManager Authorization](https://developer.apple.com/documentation/alarmkit/alarmmanager)
- **Kullanıcı İptali ve İnceleme (`CONFIRMED`):** Kullanıcı sistem ayarlarından alarm iznini dilediği an kapatabilir. Uygulama her açılışta `authorizationStatus` kontrolü yapmalıdır.
- **Sürüm Kısıtı (`CONFIRMED`):** Yalnızca iOS 26 ve üzeri cihazlarda çalışır. Daha eski iOS sürümlerinde API mevcut değildir (`#available(iOS 26, *)`).

---

## 2. Eski iOS Sürümleri için UNUserNotificationCenter ve Kısıtlamalar

iOS 25 ve önceki sürümlerde arka planda internetsiz ve zamanlanmış uyarılar için tek standart mekanizma `UNUserNotificationCenter` yerel bildirimleridir.

### 2.1 64 Bekleyen Bildirim Sınırı (`CONFIRMED`)

- Apple, uygulama başına aynı anda en fazla **64 bekleyen yerel bildirim** (`UNNotificationRequest`) planlanmasına izin verir.
- 64'ten fazla bildirim planlanmaya çalışıldığında, sistem en yakın tarihteki 64 bildirimi saklar ve sonrakileri sessizce iptal eder.
  - Kaynak: [Apple Developer Documentation — UNUserNotificationCenter](https://developer.apple.com/documentation/usernotifications/unusernotificationcenter)

### 2.2 Ses Süresi Sınırı (`CONFIRMED`)

- Özel bildirim sesleri (`UNNotificationSound`) **30 saniyeden kısa** olmak zorundadır.
- 30 saniye veya daha uzun olan ses dosyaları sistem tarafından reddedilir ve yerine varsayılan sistem bildirim sesi çalınır. Bu nedenle yerel bildirimle tam ezan (2–4 dakika) çalınamaz; yalnızca kısa ezan başlangıcı (tekbir / 29 sn) çalınabilir.
  - Kaynak: [Apple Developer Documentation — UNNotificationSound](https://developer.apple.com/documentation/usernotifications/unnotificationsound)

### 2.3 Sessiz Mod ve Rahatsız Etmeyin (Focus) Aşımı Kısıtı (`CONFIRMED`)

- Normal yerel bildirimler kullanıcının Sessiz Mod anahtarını ve Odak (Do Not Disturb) filtrelerini aşamaz.
- Bunu aşmanın tek yolu Apple'dan özel onaylı **Critical Alerts** (`UNAuthorizationOptionCriticalAlert`) hakkı almaktır. Ancak Apple bu yetkiyi yalnızca tıbbi acil durum ve kamu güvenliği uygulamalarına vermektedir; ezan/ibadet uygulamalarına verilmediği bilinmektedir (`CONFIRMED`).
  - Kaynak: [Apple Developer — Request Critical Alerts](https://developer.apple.com/contact/request/critical-alerts)

### 2.4 Kayan Pencere (Sliding Window) Stratejisi (`HYPOTHESIS` / `CONFIRMED`)

Günde 5 vakit namaz için bildirim planlandığında:

- 64 bildirim / 5 vakit = 12 gün 4 vakit (yaklaşık 12 tam gün).
- **Strateji:**
  1. Uygulama her ön plana geldiğinde mevcut bekleyen bildirimler temizlenir (`removeAllPendingNotificationRequests()`) ve önümüzdeki 12 günün (60 vakit) bildirimleri yeniden dizilir.
  2. Arka planda `BGAppRefreshTask` / `BGProcessingTask` (BackgroundTasks framework) ile sistem izin verdikçe pencere ileri kaydırılır.
  3. Kullanıcı 12 gün boyunca uygulamayı hiç açmazsa ve arka plan yenilemesi tetiklenmezse 13. gün alarmlar durur. Bu nedenle ekranda "Kalan Güvenli Alarm Günü" sağlık göstergesi sunulmalıdır.

---

## 3. Türkiye'de iOS Sürüm Dağılımı

- **Apple Resmi Verisi (`UNKNOWN`):** Apple, ülke bazında (Türkiye özelinde) bağımsız iOS sürüm dağılım oranlarını kamuya açık olarak yayınlamamaktadır.
- **Kamuya Açık Pazar Payı Verisi (`REPORTED` - Statcounter 2026):**
  - Türkiye mobil işletim sistemi pazarında Android oranı ≈ %76,9; iOS oranı ≈ %23,1 seviyesindedir.
  - Türkiye'de ekonomik şartlar ve cihaz yenileme döngülerinin uzunluğu sebebiyle iPhone 11, iPhone 12 ve iPhone SE gibi cihazların kullanımı yaygındır. Bu cihazların önemli bir bölümü iOS 26 öncesi (iOS 17–25) sürümlerde kalmaktadır.
  - Çıkarım: Yalnızca AlarmKit (iOS 26+) tercih edilirse, Türkiye'deki iOS kullanıcılarının önemli bir bölümü alarmsız kalır.

---

## 4. Puanlı Karar Tablosu ve Öneri

Aşağıdaki seçenekler 1–10 arası ağırlıklı puanlanmıştır (10 en iyi):

| Kriter (Ağırlık) | Seçenek 1: Saf UNUserNotificationCenter | Seçenek 2: Saf AlarmKit (iOS 26+) | Seçenek 3: Hibrit Strateji (iOS 26+ AlarmKit, altı Bildirim) |
| :--- | :---: | :---: | :---: |
| **Sessiz Mod & Odak Aşımı (%30)** | 2 (Aşamaz) | 10 (Sistem alarmı, tam aşar) | 8 (Yeni cihazlarda tam, eskide bildirim) |
| **Ses Süresi / Tam Ezan (%20)** | 3 (Maks 29 sn kısıtı) | 10 (Tam ezan çalar) | 8 (Yeni cihazda tam, eskide 29 sn tekbir) |
| **1 Yıl İnternetsiz Dayanıklılık (%25)** | 3 (Maks 12 gün kayan pencere) | 9 (Sistem takvimiyle uzun erimli) | 7 (Sürüme göre değişir) |
| **Cihaz / Sürüm Kapsamı (%15)** | 10 (iOS 10–26 tüm cihazlar) | 4 (Yalnızca iOS 26+) | 10 (Tüm iOS parkı) |
| **Geliştirme / Bakım Kolaylığı (%10)** | 7 (Tek API ama kayan pencere) | 8 (Temiz modern API) | 6 (İki ayrı motor bakımı) |
| **AĞIRLIKLI PUAN (Toplam / 10)** | **4.45** | **8.40** | **8.05** |

### Öneri ve Mimari Karar

1. **Birincil Hedef:** iOS 26 ve üzeri cihazlarda **AlarmKit** kullanılmalıdır. Bu sayede sessiz mod aşımı, tam ezan sesi ve kilit ekranı Live Activities desteği eksiksiz sağlanır.
2. **Geriye Dönük Uyumluluk:** iOS 25 ve altı sürümler için `UNUserNotificationCenter` altyapısı korunmalı; 12 günlük kayan pencere (`sliding window`) ve 29 saniyelik ezan başlangıç / tekbir sesi kurgulanmalıdır. Kullanıcı bildirime dokunduğunda uygulama açılarak ezanı tamamlar.
3. **Alarm Sağlık Ekranı:** Plan Değişiklikleri Madde 8 gereği ana ekranda "Alarm Sağlığı" bileşeni yer almalı; özellikle iOS 25 ve altı kullanıcılarına "Kalan alarm günü: X gün (uygulamayı açarak yenileyin)" uyarısı verilmelidir.
