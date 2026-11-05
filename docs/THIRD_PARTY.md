# Üçüncü taraf araç ve paket envanteri

## Depoda kullanılan geliştirme araçları

| Araç | Sürüm | Lisans | Kullanım | Kaynak |
| --- | --- | --- | --- | --- |
| markdownlint-cli2 | 0.24.0 | MIT | Markdown lint | [Resmi depo](https://github.com/DavidAnson/markdownlint-cli2) |
| markdown-link-check | 3.15.0 | ISC | Yerel ve dış bağlantı kontrolü | [Resmi depo](https://github.com/tcort/markdown-link-check) |
| actions/checkout | v4.3.1, SHA CI'da sabit | MIT | CI checkout | [Resmi depo](https://github.com/actions/checkout) |
| actions/setup-node | v4, SHA CI'da sabit | MIT | CI Node.js kurulumu | [Resmi depo](https://github.com/actions/setup-node) |

Doğrudan npm sürümleri `package.json` içinde sabittir. Geçişli bağımlılıkların
tam sürüm ve bütünlük kayıtları `package-lock.json` içindedir; güncellemeler
PR ile incelenir. Paketlerin lisans dosyaları kurulum paketlerinde bulunur.

## Laboratuvar araçları

Java, Android platform-tools, scrcpy ve Maestro bu depoyla dağıtılmaz;
[kılavuzdaki](../research/01_LAB_SETUP.md) resmi kaynaklardan ayrıca kurulur.
Her aracın kendi lisans / kullanım koşulları geçerlidir. Araç kurmak,
incelenen uygulamaların içeriklerini yeniden kullanma izni vermez.

## Uygulama bağımlılıkları

Henüz yoktur. Her yeni bağımlılık için ad, tam sürüm, kaynak, lisans kanıtı,
atıf / dağıtım şartı ve gizlilik etkisi bu kayda eklenmelidir.

## Bildirim Kaydedici (G-002)

`CONFIRMED`: Aşağıdaki lisans metinleri / yayımlanmış POM lisans alanları
bu çalışma sırasında okundu. Yeni çalışma zamanı bağımlılıkları Kotlin
standart kitaplığı ve onun JetBrains annotations bağımlılığıdır; Android platform API'leri cihazdan sağlanır. Test ve
CI araçları uygulamanın içine eklenmez. Ağ / reklam / izleme SDK'sı eklenmedi.

| Araç / paket | Sabit sürüm | Lisans ve yazılı kanıt | Kullanım ve şart |
| --- | --- | --- | --- |
| Gradle / Wrapper | 8.13 | [Apache-2.0 ve bileşen metinleri](../tools/notif-logger/third-party/Gradle-LICENSE.txt), [NOTICE](../tools/notif-logger/third-party/Gradle-NOTICE.txt) | Derleme; wrapper dağıtılır, lisans / bildirimler korunur; dağıtım SHA-256 ile doğrulanır |
| Android Gradle Plugin | 8.9.2 | [Resmi POM, Apache-2.0](https://dl.google.com/dl/android/maven2/com/android/tools/build/gradle/8.9.2/gradle-8.9.2.pom) | Derleme, APK'ye eklenmez |
| Kotlin eklentisi / stdlib | 2.1.20 | [Apache-2.0](../tools/notif-logger/third-party/Kotlin-LICENSE.txt), [NOTICE](../tools/notif-logger/third-party/Kotlin-NOTICE.txt), [COPYRIGHT](../tools/notif-logger/third-party/Kotlin-COPYRIGHT.txt) | Kotlin derleme ve stdlib; lisans / bildirimler depoda korunur, yayımlamada APK ile sağlanır |
| JetBrains annotations (stdlib geçişli) | 13.0 | [Yayımlanmış POM, Apache-2.0](https://repo.maven.apache.org/maven2/org/jetbrains/annotations/13.0/annotations-13.0.pom) | JVM ek açıklamaları; Apache lisansı korunur |
| JUnit | 4.13.2 | [Yayımlanmış POM, EPL-1.0](https://repo.maven.apache.org/maven2/junit/junit/4.13.2/junit-4.13.2.pom) | Yalnızca JVM birim testleri; APK'ye eklenmez |
| Hamcrest Core (JUnit geçişli) | 1.3 | [Yayımlanmış parent POM, BSD-3-Clause](https://repo.maven.apache.org/maven2/org/hamcrest/hamcrest-parent/1.3/hamcrest-parent-1.3.pom) | Yalnızca JVM testleri; APK'ye eklenmez |
| actions/setup-java | v4, SHA iş akışında sabit | [MIT](https://github.com/actions/setup-java/blob/cf277c60eb25467037889841efdb72551f06f6c3/LICENSE) | CI Java 17 kurulumu |
| actions/upload-artifact | v4, SHA iş akışında sabit | [MIT](https://github.com/actions/upload-artifact/blob/ea165f8d65b6e75b540449e92b4886f43607fa02/LICENSE) | CI APK ve sentetik test kanıtlarının saklanması |
| ReactiveCircus/android-emulator-runner | v2, SHA iş akışında sabit | [Apache-2.0](https://github.com/ReactiveCircus/android-emulator-runner/blob/a421e43855164a8197daf9d8d40fe71c6996bb0d/LICENSE) | CI emülatör ölçümü; gerçek cihaz kabulü yerine geçmez |

Android SDK / sistem imajları Google'ın SDK koşullarıyla CI veya geliştirici
makinesine kurulur; depoyla dağıtılmaz. Geçişli derleme araçları Gradle
çözümlemesiyle indirilir. APK yanında Kotlin lisans belgeleri de artefakta
konur; standart kitaplığın kendi `META-INF` bildirimleri ayrıca korunur.
Üçüncü taraf dini içerik, vakit verisi veya ses kaydı eklenmedi.
