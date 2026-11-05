# ezan-apk

Reklamsız, ücretsiz, Diyanet uyumlu namaz vakti ve ibadet uygulaması (Android + iOS).

- Plan: [`research/00_MASTER_PLAN.md`](research/00_MASTER_PLAN.md)
- Plan değişiklikleri: [`research/01_PLAN_CHANGES.md`](research/01_PLAN_CHANGES.md)
- Ajan kuralları (Codex, Gemini): [`AGENTS.md`](AGENTS.md)
- Windows test laboratuvarı: [kurulum kılavuzu](research/01_LAB_SETUP.md)
- İçerik izinleri: [lisans kayıtları](docs/LICENSES.md)
- Araçlar ve paketler: [üçüncü taraf envanteri](docs/THIRD_PARTY.md)
- Vakit motoru denemesi: [kod ve kullanım](spikes/prayer-calc/README.md),
  [Diyanet karşılaştırması](research/07_PRAYER_TIME_ACCURACY.md)

## Geliştirme durumu

Henüz uygulama iskeleti yoktur. `research/01_PLAN_CHANGES.md` uyarınca ilk
çalışma risk denemesidir; Flutter / React Native kararı bu denemede verilir.
`app/` ve yerel modül klasörleri bu aşamada yalnızca yer tutucudur.

## Belge kontrolleri

Node.js 24 ve npm ile depo kökünde:

```bash
npm ci
npm run lint:md
npm run check:links
```

Bağlantı kontrolü Bash gerektirir (Windows'ta Git Bash kullanılabilir).
Yerel dosyalar ve dış bağlantılar denetlenir; dış bağlantılar için ağ erişimi
gerekir. CI aynı komutları her pull request ve `main` güncellemesinde çalıştırır.

## Klasörler

| Yol | Amaç |
| --- | --- |
| [research/](research/README.md) | Araştırma, veri, kanıt ve yardımcı araçlar |
| [design/](design/README.md) | Tasarım ve erişilebilirlik çalışmaları |
| [app/](app/README.md) | Çerçeve kararı sonrası mobil uygulama |
| [native/android/](native/android/README.md) | Android alarm ve widget modülleri |
| [native/ios/](native/ios/README.md) | iOS bildirim ve widget modülleri |
| [content/](content/README.md) | İzni doğrulanmış içerik |
| [server/](server/README.md) | Hakları doğrulandıktan sonra statik veri üretimi |
| [docs/](docs/README.md) | Lisans ve bağımlılık kayıtları |

Roller: Sercan (ürün sahibi) · Claude (plan, görev kartları, denetim) · Codex / Gemini (geliştirme).
