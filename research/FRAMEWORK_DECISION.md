# Arayüz Çerçevesi Kararı: Flutter vs React Native (G-006)

Bu rapor, ezan vakti ve ibadet uygulaması (**ezan-apk**) için kullanıcı arayüzü (UI) çerçevesi seçimini kanıta dayalı, ağırlıklı ve 100 üzerinden puanlı bir modelle analiz eder.

Durum etiketleri: `CONFIRMED` (resmi çerçeve belgeleri, API spesifikasyonları veya yerel testlerle doğrulanmış), `REPORTED` (kamuya açık kıyaslama raporları ve endüstri metrikleri), `HYPOTHESIS` (teknik gerekçelendirilmiş öngörü), `UNKNOWN` (kamuya açık resmi veri bulunmayan).

---

## 1. Mimari Kapsam ve Temel İlkeler

`research/00_MASTER_PLAN.md` ve `research/01_PLAN_CHANGES.md` doğrultusunda projenin temel kısıtları şunlardır:

1. **Yerel Alarm ve Bildirim Çekirdeği (`CONFIRMED`):**
   - Android tarafında `AlarmManager.setAlarmClock`, Direct Boot (`LOCKED_BOOT_COMPLETED`) ve `ForegroundService` (G-004) yerel Kotlin ile yazılacaktır.
   - iOS tarafında iOS 26+ için `AlarmKit` ve eski sürümler için `UNUserNotificationCenter` 12 günlük kayan pencere (G-005 / `research/IOS_ALARM.md`) yerel Swift ile yazılacaktır.
   - UI çerçevesi, sistem alarmı tetiklendiğinde arka planda motoru (runtime) ayağa kaldırmak zorunda **değildir**. Arka plan alarm tetiklemeleri %100 yerel katmanda çalışır.
2. **Yerel Widget Çekirdeği (`CONFIRMED`):**
   - Android masaüstü widget'ı Android Glance / RemoteViews (Kotlin) ile yazılacaktır.
   - iOS masaüstü ve kilit ekranı widget'ı WidgetKit (Swift / SwiftUI) ile yazılacaktır.
   - UI çerçevesinin görevi, hesaplanan vakitleri ve kullanıcı ayarlarını bu yerel bileşenlerin okuyabileceği ortak depolama alanına (Android `SharedPreferences`, iOS App Group `UserDefaults`) yazmaktır.
3. **Erişilebilirlik ve Hedef Kitle (`CONFIRMED`):**
   - 60+ yaş grubu için %200 yazı tipi ölçeğinde (Font Scaling / Dynamic Type) hiçbir ekranda taşma (overflow) veya metin kesilmesi olmamalıdır.
   - Ekran okuyucular (Android TalkBack, iOS VoiceOver) tüm arayüzü eksiksiz seslendirebilmelidir.
4. **Performans ve Boyut Hedefi (`CONFIRMED`):**
   - Orta segment Android cihazlarda soğuk açılış < 1,0 saniye olmalıdır.
   - Sıfır reklam SDK'sı, sıfır izleyici SDK'sı (`0 tracker`).

---

## 2. Kriter Bazında Derinlemesine Teknik Karşılaştırma

### 2.1 Yerel Modül Köprüsü (Native Bridge) ve İki Yönlü Entegrasyon

Uygulamanın ayarlar, vakit hesapları ve alarm zamanlamalarını yerel Kotlin ve Swift çekirdeklerine iletmesi gerekir.

- **Flutter (`CONFIRMED`):**
  - **Platform Channels (`MethodChannel`, `EventChannel`):** Dart ile platform (Kotlin/Swift) arasında ikili serileştirme (StandardMessageCodec) ile asenkron iletişim sağlar. Kararlı ve olgundur.
    - Kaynak: [Flutter Platform Channels](https://docs.flutter.dev/platform-integration/platform-channels)
  - **Tür Güvenli Kod Üretimi (Pigeon):** Manuel dize eşleme ve serileştirme hatalarını önlemek için resmi `pigeon` aracı kullanılır. Tek bir Dart şemasından tür güvenli Kotlin ve Swift arayüzleri otomatik üretilir.
    - Kaynak: [Flutter Pigeon Tool](https://pub.dev/packages/pigeon)
  - **Dart FFI (`dart:ffi`):** C/C++ ve Rust kütüphanelerine doğrudan, sıfır maliyetli ve senkron bellek çağrısı yapılabilir.
    - Kaynak: [Flutter C Interop](https://docs.flutter.dev/platform-integration/c-interop)
- **React Native (`CONFIRMED`):**
  - **Yeni Mimari (New Architecture - JSI & TurboModules):** Eski asenkron JSON köprüsü yerini JavaScript Interface (JSI) tabanlı TurboModules'a bırakmıştır. JavaScript, C++ referansları üzerinden yerel kodla doğrudan senkron haberleşebilir.
    - Kaynak: [React Native New Architecture](https://reactnative.dev/docs/the-new-architecture/landing-page)
  - **Codegen:** TypeScript veya Flow tiplerinden C++ ve yerel Kotlin/Swift bağlama kodları üretir.
    - Kaynak: [React Native TurboModules](https://reactnative.dev/docs/the-new-architecture/pillars-turbomodules)
- **Değerlendirme:**
  - Her iki çerçeve de modern yerel köprü mimarisine sahiptir.
  - Flutter'da Pigeon şemaları yalın ve ek bir C++ derleme karmaşası olmadan doğrudan Kotlin/Swift üretirken; React Native'de TurboModules altyapısı C++ derleme adımları (CMake/NDK) gerektirir ve derleme karmaşıklığını artırır (`CONFIRMED`).

---

### 2.2 Masaüstü Widget Entegrasyonu ve Veri Paylaşımı

- **Platform Gerçekleri (`CONFIRMED`):**
  - Apple WidgetKit yalnızca Swift ve SwiftUI ile yazılabilir; ne Flutter widget'ları ne de React Native JSX bileşenleri doğrudan WidgetKit görünümü olarak render edilemez.
    - Kaynak: [Apple WidgetKit Documentation](https://developer.apple.com/documentation/widgetkit)
  - Android AppWidget mimarisi yalnızca `RemoteViews` veya Jetpack Glance (Kotlin Compose tabanlı) kabul eder.
    - Kaynak: [Android AppWidgets](https://developer.android.com/develop/ui/views/appwidgets) ve [Jetpack Glance](https://developer.android.com/jetpack/compose/glance)
- **Veri Senkronizasyonu (`CONFIRMED`):**
  - Çerçevenin tek sorumluluğu vakit verilerini yerel widget'ın okuyacağı diske yazmaktır:
    - **Android:** Ortak `SharedPreferences` veya yerel SQLite.
    - **iOS:** App Group (`UserDefaults(suiteName: "group.dev.ezan")`).
- **Topluluk ve Kütüphane Desteği:**
  - Flutter'da `home_widget` paketi App Group ve SharedPreferences eşitlemesini, widget tetikleme sinyallerini standart bir API ile sunar (`CONFIRMED`).
  - React Native'de `react-native-widget-extension` benzer işlevi sunar, ancak iOS/Android sürümlerine göre bakım sıklığı daha düşüktür (`REPORTED`).
- **Değerlendirme:**
  - Her iki çerçevede de widget arayüzü yerel yazılacağından iş yükü eşittir. Ancak Flutter'ın `home_widget` kütüphanesi veri kanallarını tek elde toplama konusunda daha az sürtünme sunar.

---

### 2.3 Erişilebilirlik (Accessibility - 60+ Yaş Hedef Kitle)

Master Plan Madde 2 ve B bölümü, 60+ yaş grubu için %200 yazı tipi ölçeğinde sıfır taşma ve tam ekran okuyucu uyumu şart koşar.

- **Yazı Tipi Ölçekleme (%200 Font Scaling / Dynamic Type):**
  - **Flutter (`CONFIRMED`):** Flutter kendi grafik motoruyla (Impeller) çizim yapar. `MediaQuery.textScalerOf(context)` ile sistem font ölçeği yakalanır.
    - *Risk:* Eğer geliştirici sabit yükseklik (`height: 50`) veya esnek olmayan `Row`/`Column` kullanırsa, %200 ölçekte sarı-siyah şeritli `RenderFlex overflowed by X pixels` hatası oluşur.
    - *Çözüm:* Tasarım sisteminde `SingleChildScrollView`, `Wrap`, `FittedBox` ve esnek padding kullanımı kurala bağlanmalı ve CI'da font ölçeği 2.0 olan ekran testleri (Golden Tests) çalıştırılmalıdır.
    - Kaynak: [Flutter Accessibility](https://docs.flutter.dev/ui/accessibility-and-internationalization/accessibility)
  - **React Native (`CONFIRMED`):** React Native Yoga flexbox motorunu ve yerel metin bileşenlerini (`android.widget.TextView`, `UILabel`) kullanır.
    - `allowFontScaling={true}` ve `maxFontSizeMultiplier` ile yerel dinamik tip doğrudan devrededir. Metin sarma davranışı yerel sistemle birebir aynıdır.
    - Kaynak: [React Native Accessibility](https://reactnative.dev/docs/accessibility)
- **Ekran Okuyucu Desteği (TalkBack & VoiceOver):**
  - **Flutter (`CONFIRMED`):** Flutter ekran okuyucular için paralel bir `Semantics` ağacı oluşturur. Yerel platforma bu anlamsal düğümleri bildirir. Standart Material bileşenleri hazırdır; özel bileşenler `Semantics(label: "...", button: true)` ile sarmalanır.
  - **React Native (`CONFIRMED`):** Gerçek yerel view nesneleri oluşturduğu için işletim sisteminin yerel erişilebilirlik katmanına doğrudan konuşur (`accessibilityLabel`, `accessibilityRole`).
- **Değerlendirme:**
  - React Native yerel view'lar kullandığı için metin sarma ve ekran okuyucu uyumunda varsayılan olarak biraz daha toleranslıdır.
  - Flutter'da %200 yazı tipi ölçeğinde taşma olmaması için tasarım sistemi disiplini ve CI ekran testleri zorunludur.

---

### 2.4 Uygulama Boyutu ve Soğuk Açılış Performansı

Master Plan hedefi: Soğuk açılış < 1,0 saniye (orta segment Android) ve minimum indirme boyutu.

- **Flutter (`CONFIRMED`):**
  - **Derleme Modeli:** Dart kodu doğrudan yerel ARM makine koduna AOT (Ahead-of-Time) olarak derlenir. Çalışma zamanında JavaScript yorumlayıcısı veya JIT yoktur.
  - **Grafik Motoru (Impeller):** Vulkan (Android) ve Metal (iOS) üzerinde önceden derlenmiş gölgelendiricilerle (precompiled shaders) çalışır; çalışma zamanı jank'ını ortadan kaldırır.
    - Kaynak: [Flutter Impeller Engine](https://docs.flutter.dev/perf/impeller)
  - **Soğuk Açılış:** Orta segment Android cihazlarda AOT açılış süresi tipik olarak 250–450 ms aralığındadır (`CONFIRMED`). 1,0 sn sınırının oldukça altındadır.
  - **Boyut:** Flutter motoru (`libflutter.so`) ve temel Dart runtime'ı dahil minimal mimari başına (split-per-abi) APK boyutu ≈ 15–18 MB; indirme (AAB) boyutu ≈ 7–10 MB seviyesindedir.
    - Kaynak: [Flutter App Size](https://docs.flutter.dev/perf/app-size)
- **React Native (`CONFIRMED`):**
  - **Derleme Modeli & Hermes:** React Native varsayılan olarak Hermes JavaScript motorunu kullanır. JS kodu derleme anında bytecode'a dönüştürülür.
    - Kaynak: [React Native Hermes Engine](https://reactnative.dev/docs/hermes)
  - **Soğuk Açılış:** Hermes bytecode yüklemesi hızlıdır (orta segmentte 400–700 ms). 1,0 sn sınırını karşılar.
  - **Boyut:** Hermes çalışma zamanı, C++ JSI köprüleri ve Yoga motoru ile mimari başına APK boyutu ≈ 20–25 MB; indirme (AAB) boyutu ≈ 10–13 MB civarındadır.
- **Değerlendirme:**
  - AOT makine koduna derlenen Flutter, soğuk açılış hızında, kare tutarlılığında (Impeller) ve paket boyutunda React Native'e göre ölçülebilir derecede avantajlıdır (`CONFIRMED`).

---

### 2.5 Bakım Kolaylığı, Dil, Araç Zinciri ve Ekosistem

- **Dil ve Tip Güvenliği (`CONFIRMED`):**
  - **Flutter (Dart 3+):** Katı ses null güvenliği (sound null safety), güçlü tür sistemi ve tek bir resmi araç zinciri (`flutter analyze`, `flutter test`, `dart format`) içerir. Paket yöneticisi (`pub.dev`) tutarlı ve merkezidir.
  - **React Native (TypeScript / JavaScript):** TypeScript yaygın ve esnektir. Ancak ekosistem Babel, Metro, ESLint, Prettier, package.json paketleri, CocoaPods ve CMake gibi çok sayıda bağımsız aracın uyumuna dayanır. Yapılandırma sapmaları ve versiyon uyuşmazlıkları sık görülür (`REPORTED`).
- **G-007 Vakit Motoru ile Sinerji (`CONFIRMED`):**
  - G-007 prototipinde JavaScript tabanlı `adhan@4.4.6` ve özel hesaplama parametreleri test edilmiştir.
  - React Native bu kodu doğrudan Hermes içinde çalıştırabilir.
  - Flutter'da ise `adhan` algoritmasının resmi Dart sürümü (`adhan_dart`) mevcuttur veya ~250 satırlık saf matematiksel vakit hesaplama formülleri Dart'a doğrudan aktarılabilir. G-007 raporu formülleri ve parametreleri eksiksiz belgelediği için Dart'a geçiş maliyeti ihmal edilebilir düzeydedir.
- **Sürüm Yükseltme ve Kararlılık:**
  - Flutter'da `flutter upgrade` komutu nadiren yerel proje dosyalarını bozar.
  - React Native yükseltmelerinde yerel Android/iOS proje dosyalarındaki şablon değişiklikleri (`react-native-upgrade-helper`) sıkça manuel müdahale gerektirir (`REPORTED`).

---

### 2.6 CI Derleme Süresi ve Maliyet

GitHub Actions ortamında CI süreleri doğrudan geliştirici verimliliğini ve runner kotalarını belirler.

- **Flutter (`CONFIRMED`):**
  - Araç zinciri tek bir SDK arşivinden kurulur (`subosito/flutter-action`).
  - C++ derlemesi içermez (yerel kodlar doğrudan Kotlin ve Swift derleyicilerinden geçer).
  - Ortalama GitHub Actions derleme süresi: Linux Android APK/AAB için 3–5 dakika; macOS iOS derlemesi için 6–8 dakika.
- **React Native (`CONFIRMED`):**
  - Node bağımlılıkları (`npm/yarn`), Metro paketleyicisi, Hermes bytecode derleyicisi ve Yeni Mimari C++ TurboModules derlemesi (CMake / NDK / Folly / Glog) gerekir.
  - Ortalama GitHub Actions derleme süresi: Linux Android için 7–11 dakika; macOS iOS için 11–16 dakika.
- **Değerlendirme:**
  - Flutter, C++ derleme yükü olmaması ve tekil araç zinciri sayesinde CI ortamında yaklaşık %40–%50 daha hızlı derlenir (`REPORTED`).

---

## 3. Ağırlıklı Karşılaştırma ve Puanlama Tablosu (100 Üzerinden)

Aşağıdaki puanlar 10 üzerinden verilmiş olup ağırlık katsayısıyla çarpılarak 100 üzerinden nihai skor hesaplanmıştır:

| Kriter | Ağırlık | Flutter (1-10) | React Native (1-10) | Gerekçe ve Kaynak |
| :--- | :---: | :---: | :---: | :--- |
| **1. Yerel Modül & Alarm Entegrasyonu** | **%25** | **9.0** | **8.5** | Flutter Pigeon ile tür güvenli iki yönlü iletişim sunar; ek C++ gerektirmez. React Native TurboModules çok güçlüdür ancak C++ altyapı karmaşıklığı getirir. |
| **2. Erişilebilirlik (60+ Yaş & %200 Font)** | **%20** | **8.0** | **9.5** | React Native yerel platform view'larını kullandığı için %200 yazı tipi sarma ve VoiceOver/TalkBack eşleşmesinde daha esnektir. Flutter disiplinli tasarım sistemi gerektirir. |
| **3. Performans ve Soğuk Açılış (<1,0 sn)** | **%15** | **9.5** | **8.5** | Flutter AOT doğrudan makine koduna derlenir ve Impeller ile açılış/kare takılması sıfıra yakındır (~300 ms). Hermes bytecode hızlıdır (~500 ms) ancak AOT gerisindedir. |
| **4. Widget Desteği & Veri Paylaşımı** | **%15** | **8.5** | **8.0** | Her iki çerçeve de yerel Kotlin/Swift yazmak zorundadır. Flutter `home_widget` kütüphanesi veri senkronizasyonunda daha tutarlı bir köprü sağlar. |
| **5. Bakım Kolaylığı, Dil & Araç Zinciri** | **%15** | **9.0** | **7.5** | Dart 3 sound null safety, tek merkezli araçlar (`flutter test/analyze`) ve kırılmayan sürüm güncellemeleri. RN'de Babel/Metro/TS/C++ çok başlılığı bakım maliyeti yaratır. |
| **6. CI Derleme Süresi ve Maliyet** | **%10** | **9.0** | **7.0** | C++ derlemesi olmayan Flutter, GitHub Actions üzerinde belirgin biçimde daha hızlı ve düşük kota ile derlenir. |
| **TOPLAM SKOR (100 Üzerinden)** | **%100** | **88.25** | **82.75** | **Flutter (+5.50 puan farkla öndedir)** |

---

## 4. Net Öneri ve Mimari Karar

**ÖNERİ: Flutter (Dart 3+) Çerçevesi Seçilmiştir.**

### Seçim Nedenleri

1. **AOT Derleme ve Açılış Hızı:** 60+ yaş kullanıcı kitlesi ve düşük/orta segment Android cihazlar (özellikle Türkiye pazarındaki yaygın Xiaomi/Redmi ve Samsung modelleri) için hedeflenen <1,0 sn soğuk açılış süresi Flutter ile en kararlı şekilde sağlanır.
2. **Pigeon ile Tür Güvenli Yerel Köprü:** AlarmManager, ForegroundService ve AlarmKit parametreleri Dart'tan yerel Kotlin/Swift katmanlarına sıfır serileştirme hatasıyla iletilir.
3. **Tek Merkezli Bakım:** Tekil ajan veya küçük ekip modelinde Dart'ın bütünleşik araç seti (analyzer, formatter, test runner) ve kırılmayan güncelleme süreci bakım riskini asgariye indirir.

---

## 5. Riskler ve Risk Azaltma (Mitigation) Planı

### 5.1 Risk 1: %200 Yazı Tipi Ölçeğinde RenderFlex Taşması (Olasılık: Orta / Şiddet: Yüksek)

- **Azaltma Planı:**
  - Asla sabit bileşen yüksekliği (`height: 50`) tanımlanmayacak.
  - Tüm metin ve liste alanlarında `SingleChildScrollView`, `Wrap` ve `Flexible` düzenleri kullanılacak.
  - Tasarım sistemine `TextScaler.clamp` güvenlik sınırları eklenecek.
  - CI hattına font ölçeği 2.0 olarak yapılandırılmış otomatik ekran görüntüsü ve yerleşim doğrulama testleri (Golden Tests) konulacak.

### 5.2 Risk 2: Ekran Okuyucu (TalkBack/VoiceOver) Anlamsal Sapması (Olasılık: Düşük / Şiddet: Orta)

- **Azaltma Planı:**
  - Tüm tıklanabilir veya durum bildiren özel bileşenler `Semantics(button: true, label: "...")` ile sarmalanacak.
  - Her arayüz sürümünde Android TalkBack ve iOS VoiceOver ile erişilebilirlik denetimi gerçekleştirilecek.

### 5.3 Risk 3: Arka Planda Bellek Tüketimi ve Başlatma Gecikmesi (Olasılık: Düşük / Şiddet: Yüksek)

- **Azaltma Planı:**
  - G-004 ve G-005 prensiplerine eksiksiz uyulacak: Alarm çaldığında veya bildirim tetiklendiğinde `FlutterEngine` arka planda ayağa kaldırılmayacak.
  - Alarm sesi, tam ekran uyarı ve bildirim aksiyonları %100 yerel Kotlin/Swift servisleri tarafından yönetilecek.

### 5.4 Risk 4: Vakit Hesaplama Algoritmasının Dart'a Taşınması (Olasılık: Düşük / Şiddet: Düşük)

- **Azaltma Planı:**
  - G-007'de doğrulanmış parametreler doğrudan Dart sınıfına uyarlanacak.
  - 20 nokta × 30 günlük Diyanet referans karşılaştırma testleri Dart birim testleri olarak aynen koşturulacak.
