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

## Vakit hesaplama denemesi (G-007)

| Paket | Tam sürüm | Lisans / kanıt | Kaynak | Kullanım ve gizlilik |
| --- | --- | --- | --- | --- |
| adhan | 4.4.6 | MIT, [paketle gelen tam lisans](licenses/adhan-4.4.6.txt) | [npm sürüm kaydı](https://registry.npmjs.org/adhan/4.4.6), [resmi depo](https://github.com/batoulapps/adhan-js) | Yerel astronomik hesap; çalışma zamanı geçişli bağımlılığı yok; ağ çağrısı/telemetri yok |

CONFIRMED (1 Kasım 2026): Kurulan npm paketinin `LICENSE` dosyası okunup
yukarıdaki kanıt dosyasına değiştirilmeden alındı. MIT; ticari kullanıma,
değiştirmeye ve dağıtıma izin verir; telif ve izin metni kopyalarda korunur.
Hak sahibi: Copyright (c) 2016 Batoul Apps. İleride uygulama paketine alınırsa
aynı bildirim paketle birlikte dağıtılır. Sürüm/bütünlük `package-lock.json` içindedir.

Bu lisans algoritma paketini kapsar. Diyanet referans tablolarına veya diğer
dini içeriklere lisans vermez. Resmi tabloların test kullanımı
[plan değişiklikleri madde 11](../research/01_PLAN_CHANGES.md) ve
[referans veri kılavuzu](../research/data/prayer-ref/README.md) kapsamında ayrıdır.
