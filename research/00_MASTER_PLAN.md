# MASTER PLAN — Yeni Namaz Vakti ve İbadet Uygulaması

Sürüm 1.0 · 1 Kasım 2026 · Sahip: Sercan · Beyin/denetçi: Claude · Geliştirici: Codex

---

## 0. Bu planı okuyan Codex için tek paragraf

Türkiye öncelikli, sonra uluslararası, reklamsız ve ücretsiz bir İslami günlük yardımcı uygulama yapıyoruz: namaz vakitleri, ezan alarmı, Kuran, kıble, zikir, dua, hadis. Önce pazardaki 18 rakibi kanıta dayalı biçimde inceleyeceğiz, kazananların güçlü yanlarını ve kullanıcı şikâyetlerini ölçülebilir gereksinimlere çevireceğiz. Sonra **kendi kodumuzla** Android + iOS uygulaması geliştireceğiz. Hedef: aynı test düzeneğinde bütün rakiplerden yüksek, 100 üzerinden en az 90 puan.

---

## 1. Değişmez kurallar

| # | Kural | Neden |
|---|---|---|
| K1 | Rakip APK'ları decompile edilmez, kaynak koduna / kaynak dosyalarına bakılmaz; REA, JADX, apktool, Frida vb. rakip uygulamalara uygulanmaz | Telif (FSEK), mağaza politikası, gereksiz risk |
| K2 | Rakipler yalnızca **kara kutu** olarak incelenir: mağaza sayfası, kamuya açık raporlar, gerçek cihazda normal kullanıcı gibi kullanım, ekran görüntüsü, kendi cihazımızdaki bildirim zamanları | Meşru ve yeterli |
| K3 | Rakiplerin sunucularına doğrudan istek atılmaz, özel uç noktaları kullanılmaz, ödeme duvarı aşılmaz | ToS ve yasa |
| K4 | Kopyalanmayanlar: kod, ikon, görsel, ezan/kari ses kayıtları, metinler, çeviriler, marka adı, renk kimliği | Özgün ürün |
| K5 | Her içerik (Kuran metni, meal, ses, hadis, dua) lisansı yazılı olarak doğrulanmadan uygulamaya girmez; `docs/LICENSES.md`'de kayıtlı olur | Hukuki güvenlik |
| K6 | Reklam SDK'sı, izleme SDK'sı yok; konum cihazdan çıkmaz | Ürün vaadi |
| K7 | Çalıştırılmamış test, alınmamış ekran görüntüsü, doğrulanmamış iddia raporlanmaz. Her bulgu: CONFIRMED / REPORTED / HYPOTHESIS / UNKNOWN | Kanıt disiplini |
| K8 | Sercan'ın diğer projelerine (dental marketplace, kokostrendi vb.) dokunulmaz | Ayrım |

REA'nın bu projedeki tek yeri: **kendi uygulamamızın** yayın öncesi denetimi (beklenmeyen ağ çağrısı veya SDK var mı?).

---

## 2. "En az 9/10 uygulama" ne demek? (ölçülebilir hedef)

Rakipler ve bizim uygulama **aynı test düzeneğinde** (Bölüm 6) aynı puan kartıyla ölçülür.

| Kriter | Ağırlık | Nasıl ölçülür | Bizim hedefimiz |
|---|---|---|---|
| Vakit doğruluğu | 20 | 20 il/ilçe × 30 gün, Diyanet resmi tablosuyla dakika farkı | %100 eşleşme (0 dk) |
| Ezan bildirimi güvenilirliği | 20 | 2 cihaz × 7 gün × 5 vakit × 8 senaryo; ±60 sn içinde gelen oranı | ≥ %99,5 |
| Kullanılabilirlik (özellikle 60+) | 15 | 10 görev, 8 kullanıcı; başarı oranı, dokunuş sayısı, SUS anketi | Görev başarısı ≥ %95, SUS ≥ 85 |
| Özellik kapsamı | 15 | Özellik matrisi (Bölüm 5.3) — Türk kullanıcının en çok kullandığı 25 özellik | ≥ 23/25 |
| Performans / çevrimdışı | 10 | Soğuk açılış, bellek, pil, internetsiz çalışma | Soğuk açılış < 1,0 sn (orta segment cihaz), 1 yıl internetsiz |
| Reklam / ücret deneyimi | 10 | Reklam sayısı, satış ekranı, kilitli özellik | 0 reklam, 0 kilitli özellik → 10/10 |
| Erişilebilirlik / gizlilik | 10 | TalkBack/VoiceOver denetimi, yazı ölçeği %200, Exodus taraması, veri beyanı | 0 izleyici, tüm ekranlar %200 yazıda bozulmuyor |
| **Toplam** | **100** | | **≥ 90** |

Mağaza hedefi (yayından sonra): ilk 1.000 değerlendirmede ≥ 4,7 ★; 1–2 ★ yorumlarda "bildirim gelmedi" oranı < %5.

---

## 3. Roller ve çalışma döngüsü

| Rol | Kim | Sorumluluk |
|---|---|---|
| Ürün sahibi | Sercan | Kararlar, test cihazları, rakipleri telefonda kullanma, 60+ test kullanıcılarını bulma, Codex'i çalıştırma |
| Beyin / denetçi | Claude | Planı yönetmek, görev kartları, gereksinimler, puanlama, her PR'ın incelenmesi, bulguların doğrulanması |
| Geliştirici | Codex | Araştırma betikleri, analiz, kod, testler, PR |

**Görev döngüsü**

1. Claude bir **görev kartı** yazar (şablon Ek A).
2. Sercan kartı Codex'e verir.
3. Codex çalışır, `research/` veya kod reposuna PR açar.
4. Sercan PR linkini Claude'a verir.
5. Claude inceler, Ek B'deki rubrikle 10 üzerinden puanlar.
6. ≥ 8 → birleştirilir. < 8 → düzeltme kartı, döngü tekrar.
7. Her faz sonunda Claude bir **faz kapısı raporu** yazar; Sercan onaylamadan sonraki faza geçilmez.

**Repo düzeni**

```
namaz-app/                      (özel GitHub reposu)
├── research/                   Faz A çıktıları
│   ├── 00_MASTER_PLAN.md       (bu dosya)
│   ├── 01_LAB_SETUP.md
│   ├── 02_COMPETITORS.md
│   ├── 03_REVIEW_MINING.md
│   ├── 04_SCREEN_INVENTORY.md
│   ├── 05_FEATURE_MATRIX.md
│   ├── 06_RELIABILITY_TESTS.md
│   ├── 07_PRAYER_TIME_ACCURACY.md
│   ├── 08_PRIVACY_AUDIT.md
│   ├── 09_SCORECARD.md
│   ├── 10_REQUIREMENTS.md      (PRD — Faz A'nın asıl çıktısı)
│   ├── data/                   ham yorumlar, ölçümler (CSV/JSON)
│   ├── evidence/<uygulama>/    ekran görüntüleri, kayıtlar (tarihli)
│   └── tools/                  betikler (yorum çekme, analiz, logger)
├── design/                     Faz B çıktıları
├── app/                        Flutter uygulaması (Faz C)
├── native/android/ native/ios/ alarm ve widget modülleri
├── content/                    hadis, dua, esma JSON'ları (lisanslı)
├── server/                     statik vakit tabloları üreticisi
└── docs/LICENSES.md
```

---

## 4. Maliyet: neredeyse tamamen ücretsiz

| Kalem | Araç | Maliyet |
|---|---|---|
| Yorum çekme | `google-play-scraper`, `app-store-scraper` (açık kaynak, Node) | 0 |
| Gizlilik / SDK taraması | Exodus Privacy kamuya açık raporları, AppGoblin, mağaza veri beyanları | 0 |
| Cihaz kontrolü | ADB, scrcpy (ekran yansıtma/kayıt), UI Automator, Maestro CLI | 0 |
| Bildirim zaman ölçümü | Kendi yazacağımız "Bildirim Kaydedici" uygulaması (Bölüm 6.3) | 0 |
| Tasarım | Figma ücretsiz plan veya Penpot (açık kaynak) | 0 |
| Kod | Flutter, Android Studio, VS Code | 0 |
| CI | GitHub Actions (özel repoda aylık ücretsiz dakika; macOS dakikası pahalı) | 0 (sınır içinde) |
| iOS derleme | Codemagic ücretsiz katmanı veya ödünç/ikinci el Mac | 0 – değişken |
| Statik barındırma | GitHub Pages veya Cloudflare Pages | 0 |
| Çökme raporu | Sentry ücretsiz plan (kişisel veri kapalı) | 0 |
| Test telefonu | Redmi (Xiaomi) orta-alt segment — **zorunlu**, alarm sorunlarının en çok çıktığı marka | ~5–8 bin TL (ikinci el daha az) |
| Test telefonu 2 | Samsung A serisi (mevcut aile telefonu da olur) | 0 – ~8 bin TL |
| iPhone | Mevcut bir iPhone (aile içi) | 0 |
| Google Play geliştirici hesabı | Tek seferlik | 25 $ |
| Apple Developer Program | Yıllık | 99 $/yıl |

Kaçınılmaz nakit maliyet: ~25 $ + 99 $/yıl + bir Xiaomi test telefonu. Geri kalan her şey ücretsiz.

Bilgisayar: Fiziksel telefonla çalışıldığı için emülatöre gerek yok; mevcut bilgisayar yeterli. Emülatör yalnızca ek bir yardımcı.

---

## 5. FAZ A — Araştırma (tahmini 6–8 hafta, akşam + hafta sonu)

### A0. Laboratuvar kurulumu (1 hafta)

| Görev | Komut / araç | Başarı ölçütü |
|---|---|---|
| ADB + USB hata ayıklama | `adb devices` | İki telefon listeleniyor |
| scrcpy | `scrcpy --record evidence/x.mp4` | Ekran yansıtılıyor ve kaydediliyor |
| Maestro CLI | `maestro --version`, örnek akış | Ezan Vakti Pro'yu açan 1 akış çalışıyor |
| UI hiyerarşisi | `adb shell uiautomator dump /sdcard/ui.xml && adb pull` | XML alınıyor |
| Bildirim Kaydedici | Bölüm 6.3 | Test bildirimi CSV'ye düşüyor |
| Klasör ve repo | Bölüm 3 | İlk PR birleşti |

Çıktı: `01_LAB_SETUP.md` (adım adım, Windows için).

### A1. Rakip seçimi ve künye (1 hafta)

İncelenecek 18 uygulama (Codex her biri için paket adı, geliştirici, yükleme, puan, son güncelleme, iOS karşılığını mağazadan **doğrular**):

| Grup | Uygulamalar | Derinlik |
|---|---|---|
| Türk vakit uygulamaları (öncelik 1) | Ezan Vakti Pro, e-Diyanet, Diyanet Namaz Vaktim, Namaz Vakti: Ezan Ramazan Pro, Namaz Vakitleri: Alarm & Kıble, Ayet Online | **Derin** (ekran haritası + dayanıklılık + puan kartı) |
| Küresel vakit (öncelik 2) | Muslim Pro, Athan (IslamicFinder), Pillars, Mawaqit | **Derin** (Muslim Pro, Pillars) / Orta (diğerleri) |
| Türk reklamsız küçükler | İsmailağa Ezan Vakti, İslam ve İhsan Namaz Vakti, Vakitlerim | Orta (özellik + yorum) |
| Kuran (öncelik 1) | Al Quran (Greentech), Quran.com, Hayrat Kur'an, Hasenat Uzman, Tarteel | **Derin**: Hayrat, Greentech; Orta: diğerleri |

Seçim kuralı: Türkiye'de en çok indirilenler + reklamsız örnek modeller + farklı yaklaşımlar (cami tabanlı, gizlilik odaklı, yapay zekâ ezber). Codex en az 2 aday daha önerebilir (kanıtla).

Çıktı: `02_COMPETITORS.md` — tablo + kaynak linki + erişim tarihi.

### A2. Yorum madenciliği — "kazananlardan ve şikâyetlerden pay biçmek" (2 hafta)

**Toplama**

- Google Play: her uygulama için Türkiye mağazası, `tr` dili, son 12 ay, yıldız başına en fazla 2.000 yorum (`google-play-scraper`, `sort: NEWEST`, yavaşlatmalı).
- App Store: TR mağazası, son 500 yorum (`app-store-scraper`).
- Şikayetvar: marka sayfaları elle (kopyala-yapıştır değil, başlık + tarih + kategori özeti).
- Kişisel veri: kullanıcı adları kaydedilmez; yalnızca metin, yıldız, tarih, sürüm.

**Sınıflandırma (iki eksenli)**

Şikâyet kategorileri (1–2–3 ★):

| Kod | Kategori |
|---|---|
| N | Bildirim / ezan gelmedi, geç geldi, sessiz |
| V | Yanlış vakit |
| L | Konum / şehir |
| P | Performans, çökme, yavaşlık, boyut |
| R | Reklam (miktar, uygunsuz içerik) |
| S | Abonelik / ücret / iade |
| Q | Kuran (metin, ses, meal, gezinme) |
| D | Veri kaybı (zikir, hatim, ayarlar) |
| U | Arayüz karmaşası, okunabilirlik, yaşlı kullanıcı |
| G | Gizlilik / izinler |
| C | Dayatılan içerik / bildirim tacizi |
| X | Diğer |

Övgü kategorileri (4–5 ★): hangi **özellik** övülüyor (ör. "widget", "hadis bildirimi", "internetsiz", "ezan sesi güzel", "sade").

**Yöntem**

1. Codex her yorumu kategori(ler)e atar (LLM ile, gerekçesiyle).
2. Kalite kontrol: Sercan + Claude rastgele 200 yorumu elle etiketler; uyum ≥ %85 olmazsa kategori tanımları düzeltilip yeniden çalıştırılır.
3. Her uygulama için oran tablosu: kategori başına şikâyet yüzdesi, son 3 ay vs. 12 ay eğilimi.
4. **Pay biçme matrisi**: her şikâyet kategorisi → bizim gereksinimimiz → test.

Örnek satır:

| Rakip | Şikâyet | Oran | Bizim gereksinim | Doğrulama testi |
|---|---|---|---|---|
| Ezan Vakti Pro | R — uygunsuz reklam | (ölçülecek) | Reklam SDK'sı yok (K6) | Exodus taraması 0 izleyici |
| Hayrat Kur'an | Q — ileri/geri sarma yok | (ölçülecek) | Ayet bazında ileri/geri, hız ayarı | UI testi |

5. **Kazananlar matrisi**: en çok indirilen 5 uygulamanın en çok övülen 10 özelliği → "mutlaka olmalı" listesi.

Çıktı: `03_REVIEW_MINING.md` + `data/reviews/*.csv` + `tools/reviews/`.

Başarı ölçütü: en az 20.000 yorum, 200 yorumluk elle kontrolde ≥ %85 uyum, her derin rakip için kategori oranları.

### A3. Ekran envanteri — kara kutu (2 hafta, derin rakipler)

Her derin rakip için gerçek cihazda, normal kullanıcı olarak:

| Alan | Kaynak |
|---|---|
| Ekran adı, erişim yolu (dokunuş sırası) | Maestro akışı + elle |
| Ekran görüntüsü (tarihli dosya adı) | `adb exec-out screencap -p > evidence/...png` |
| Butonlar, menü öğeleri, metin boyutu | `uiautomator dump` XML |
| Ana işe ulaşma dokunuş sayısı | Maestro akış adımı sayımı |
| Reklam / satış ekranı görülme sayısı | Ekran kaydı |
| Ücretli kilitler | Gözlem (aşılmaz) |

Pilot: Ezan Vakti Pro, 15 ekran, 5 işlev (vakit görme, ezan sesi değiştirme, imsakiye, kıble, zikirmatik). Pilot onaylanınca diğer derin rakiplere genişletilir.

Ulaşılamayan ekran tahminle doldurulmaz (K7).

Çıktı: `04_SCREEN_INVENTORY.md`, `automation/maestro/*.yaml`, `05_FEATURE_MATRIX.md` (özellik × uygulama: var/yok, ücretsiz/ücretli, kaç dokunuş, kanıt linki).

### A4. Dayanıklılık testleri (2 hafta, paralel yürütülebilir)

**Bildirim güvenilirliği** — her derin vakit uygulaması için, iki cihazda:

| # | Senaryo |
|---|---|
| S1 | Uygulama ön planda |
| S2 | Arka planda, ekran kapalı, normal kullanım |
| S3 | Telefon kilitli, 8+ saat dokunulmadan (gece → sabah ezanı) |
| S4 | Pil tasarrufu modu açık |
| S5 | Telefon yeniden başlatıldıktan sonra, uygulama açılmadan |
| S6 | İnternet kapalı |
| S7 | Saat dilimi değişimi (elle) |
| S8 | Uygulama son kullanılanlardan kaydırılarak kapatıldı (zorla durdurma değil) |

Her ölçüm satırı: cihaz, Android sürümü, uygulama sürümü, senaryo, beklenen vakit (Diyanet), bildirim düşme zamanı (Kaydedici), sapma (sn), ses çaldı mı (gözlem), not.

Aynı cihazda aynı anda birden fazla rakip test edilebilir (her biri kendi bildirimini atar; Kaydedici paket adına göre ayırır). Bu, testi büyük ölçüde paralel yapar.

**Vakit doğruluğu**

- 20 nokta: 81 ilin çeşitliliğini temsil eden il/ilçeler (doğu-batı, kuzey-güney, yüksek rakım) + 5 yurt dışı (Berlin, Amsterdam, Londra, New York, Mekke).
- Referans: Diyanet resmi tablo. Yurt dışında yöntem farkı **hata sayılmaz**, ayrı raporlanır.

**Performans** (her uygulama, aynı cihaz, 5 tekrar ortalaması)

| Ölçüm | Komut |
|---|---|
| Soğuk açılış | `adb shell am force-stop <pkg>` sonra `adb shell am start -W <pkg>/<activity>` → TotalTime |
| Bellek | `adb shell dumpsys meminfo <pkg>` |
| Uygulama boyutu | Mağaza + `adb shell pm path` / ayarlar |
| 24 saat pil | `adb shell dumpsys batterystats --reset` ... `dumpsys batterystats <pkg>` |

Çıktı: `06_RELIABILITY_TESTS.md`, `07_PRAYER_TIME_ACCURACY.md`, `data/reliability/*.csv`.

### A5. Gizlilik denetimi (2 gün)

- Exodus Privacy raporu (izleyici sayısı, izinler) — her rakip.
- Mağaza veri güvenliği beyanı / iOS gizlilik etiketi.
- Beyan ile Exodus bulgusu çelişiyor mu?

Çıktı: `08_PRIVACY_AUDIT.md`.

### A6. Puan kartı (3 gün)

Bölüm 2'deki kartla her derin rakip puanlanır. Veri yoksa "veri yetersiz", 0 değil. Her puanın yanında kanıt linki.

Çıktı: `09_SCORECARD.md`.

### A7. Gereksinim dokümanı — PRD (1 hafta)

Faz A'nın asıl çıktısı. Her gereksinim:

```
ID: REQ-NTF-003
Başlık: Cihaz yeniden başlatıldığında alarmlar uygulama açılmadan yeniden kurulur
Kaynak: A2 (N kategorisi, Ezan Vakti Pro %x, Muslim Pro %y), A4 S5 sonuçları
Öncelik: MVP / V1 / V2
Kabul kriteri: S5 senaryosunda 2 cihaz × 7 gün, 35/35 bildirim ±60 sn
Test: TEST-NTF-S5
Lisans/risk: yok
```

Çıktı: `10_REQUIREMENTS.md`.

**Faz A kapısı:** Claude raporu + Sercan onayı. Kapı ölçütü: tüm derin rakipler için puan kartı dolu, PRD'de her MVP gereksinimi bir kanıta ve bir teste bağlı.

---

## 6. Test düzeneği ayrıntıları

### 6.1 Cihazlar

| Cihaz | Neden |
|---|---|
| Xiaomi / Redmi (MIUI/HyperOS) | En agresif pil yönetimi; en zor durum |
| Samsung A serisi (One UI) | Türkiye'de en yaygın |
| iPhone (aile) | iOS gözlemi, elle test |
| (İsteğe bağlı) Android emülatör | Ekran haritası için yardımcı, alarm testi için **geçersiz** |

### 6.2 Maestro akış örneği

```yaml
appId: com.mobilexsoft.ezanvakti
---
- launchApp
- takeScreenshot: evidence/ezanvaktipro/01_home
- tapOn: "İmsakiye"          # gerçek metin A3'te doğrulanır
- takeScreenshot: evidence/ezanvaktipro/02_imsakiye
- back
```

Güvenilmez dokunuşlar (reklam açılırsa vb.) için akış başarısız sayılır ve aynı adım elle yapılıp not düşülür.

### 6.3 Bildirim Kaydedici (kendi küçük test uygulamamız)

- Android `NotificationListenerService`; kullanıcı izin verir.
- Her bildirim için: paket adı, başlık, `postTime`, cihaz saati, kanal, ses var mı → yerel CSV.
- `adb pull` ile `data/reliability/` altına alınır.
- Bu araç kendi kodumuzdur; rakip uygulamaya müdahale etmez, yalnızca kendi cihazımıza düşen bildirimleri kaydeder.
- Aynı araç, Faz C'de **bizim** uygulamamızın da testinde kullanılır → karşılaştırma elma-elma olur.

### 6.4 iOS

Windows'ta iOS otomasyonu yok. Rakip iOS uygulamaları: gerçek iPhone'da elle, ekran kaydıyla, aynı senaryo listesiyle. Bizim iOS uygulamamız: Codemagic / Mac üzerinde XCUITest (Faz C).

---

## 7. FAZ B — Ürün ve tasarım (3–4 hafta)

| Adım | Çıktı | Başarı ölçütü |
|---|---|---|
| B1 Bilgi mimarisi | Ekran ağacı; "Ana ekran tek soru" ilkesi; 4 büyük düğme (Kuran, Kıble, Zikir, Dualar) + "Daha fazla" | Her MVP görevi ≤ 2 dokunuş |
| B2 Tasarım sistemi | Renk, yazı (büyük varsayılan), 56 dp hedef, karanlık mod, ikon seti (özgün) | WCAG AA kontrast, %200 yazıda düzen bozulmuyor |
| B3 Tıklanabilir prototip | Figma / Penpot | 10 görevin hepsi prototipte yapılabiliyor |
| B4 60+ kullanıcı testi | 8 kişi (en az 4'ü 60 yaş üstü), 10 görev, sesli düşünme | Görev başarısı ≥ %90, SUS ≥ 80 (prototip aşaması) |
| B5 Revizyon | Prototip v2 | B4 bulguları kapandı |
| B6 Marka | Özgün isim, TÜRKPATENT ön araştırma, logo | Çakışan tescil yok |
| B7 İçerik ve lisans | Lisans tablosu (aşağıda) | Her içerik "izinli" durumda |

**İçerik lisans tablosu (B7'de doldurulur, doğrulanmadan kullanılmaz)**

| İçerik | Aday kaynak | Durum |
|---|---|---|
| Vakitler | Diyanet Awqat Salah API (hesap + kullanım şartları) | Doğrulanacak |
| Kuran Arapça metin | Tanzil (atıf şartı, değiştirmeden kullanım) | Doğrulanacak |
| Türkçe meal | Diyanet meali (izin) veya izin verilen başka meal | İzin gerekli |
| Kari sesleri | Kari/kurum izni veya açık lisanslı kayıtlar | Doğrulanacak |
| Ezan sesleri | Kendi kaydımız (bir müezzinle anlaşma) veya açık lisanslı | Doğrulanacak |
| Hadis metinleri | Kendi seçkimiz + ilahiyatçı kontrolü; yayınevi metni için izin | Doğrulanacak |
| Mushaf hattı (görsel) | Lisanslı hat veya fontla render | Doğrulanacak |

**Faz B kapısı:** prototip B4 ölçütlerini geçti, MVP içeriklerinin lisansı tamam.

---

## 8. FAZ C — Teknik mimari ve geliştirme

### 8.1 Mimari kararı (C0'da Codex karşılaştırma raporuyla teyit edilir)

**Aday: Flutter arayüz + yerel kritik modüller**

| Katman | Teknoloji | Gerekçe |
|---|---|---|
| Arayüz | Flutter (Dart) | Tek kod tabanı, Android + iOS, erişilebilirlik desteği iyi |
| Android alarm | Yerel Kotlin: `AlarmManager.setAlarmClock`, `BOOT_COMPLETED`, `TIME_SET`, `TIMEZONE_CHANGED` alıcıları, foreground service ile ezan çalma | Doze ve üretici pil yöneticilerine karşı en güvenilir yol |
| iOS bildirim | Yerel Swift: `UNUserNotificationCenter`; **en fazla 64 bekleyen bildirim** sınırı → ~12 günlük kayan pencere, uygulama açılışı + arka plan yenileme ile doldurma; ses ≤ 30 sn | iOS kısıtları |
| Widget | Android: Glance/AppWidget (Kotlin); iOS: WidgetKit (Swift) | Widget'lar Flutter ile yazılamaz |
| Yerel veri | SQLite (drift) | Yıllık vakit tablosu, zikir, hatim, ayarlar |
| Kıble | Cihaz manyetometresi + kalibrasyon uyarısı; harita yedeği | |
| Vakit yedeği | `adhan` algoritması (cihazda) | Tablo yoksa |
| Sunucu | Yok. Statik JSON: `server/` betiği Diyanet'ten çeker → GitHub/Cloudflare Pages | Ücretsiz, gizlilik dostu |
| İçerik güncelleme | Hadis havuzu JSON (imzalı, sürümlü) aynı statik barındırmada | Uygulama güncellemesi gerekmeden |
| Çökme | Sentry (PII kapalı) veya hiç | |
| Analitik | Yok (veya cihazda sayılıp kullanıcı onayıyla anonim) | K6 |

Alternatif: React Native. C0'da her iki çerçeve için "alarm + widget + erişilebilirlik" küçük deney (spike) yapılır; karar puanlı tabloyla verilir.

### 8.2 Geliştirme fazları

| Faz | İçerik | Kapı ölçütü |
|---|---|---|
| C0 Teknik deneyler (1–2 hf) | Flutter vs RN spike; Android alarm prototipi Xiaomi'de 72 saat; iOS 64-bildirim penceresi prototipi | Xiaomi'de 72 saat 15/15 alarm; karar tablosu |
| C1 İskelet (1 hf) | Repo, CI (build + test + lint), modül yapısı, tasarım sistemi bileşenleri | CI yeşil |
| C2 Vakit çekirdeği (2 hf) | İl/ilçe, GPS, yıllık tablo indirme, internetsiz, ana ekran + geri sayım, imsakiye, kerahat | A4 vakit testi: 20 nokta %100 |
| C3 Ezan ve bildirim (3 hf) | Vakit başına ayar, önceden hatırlatma, ezan sesleri, sessiz mod davranışı, pil sihirbazı (marka bazlı), "test alarmı", bildirim sağlığı ekranı | A4 bildirim testi S1–S8, 2 cihaz, ≥ %99,5 |
| C4 Widget'lar (1–2 hf) | Android + iOS ana ekran ve kilit ekranı | Dakikalık doğru güncelleme, pil etkisi < %1/gün |
| C5 İbadet araçları (2–3 hf) | Kıble, Namazdayım/sessiz, kaza ve namaz takibi, zikirmatik, Esma, dualar, hadis bildirimi, hicri takvim, dini günler | Her özellik PRD kabul kriterini geçti |
| C6 Kuran (3–4 hf) | Arapça metin, meal, sesli dinleme (arka plan), ayet bazlı ileri/geri, hız, kaldığı yer, hatim takibi, arama, internetsiz indirme | Hayrat ve Greentech şikâyet kategorilerinin her biri karşılandı |
| C7 Erişilebilirlik ve basit mod (1 hf) | Basit mod + kilit, TalkBack/VoiceOver, %200 yazı | Denetim listesi %100 |
| C8 Kendi denetimimiz (3 gün) | REA ile kendi APK'mızı denetleme, Exodus taraması, ağ trafiği gözlemi | Beklenmeyen ağ çağrısı / SDK yok |

Her alt görev bir görev kartıdır (Ek A). Codex aynı anda tek görevde çalışır; Claude her PR'ı inceler.

### 8.3 Kalite güvencesi (sürekli)

- Birim testleri: vakit hesabı, alarm planlama, saat dilimi, hicri tarih (kapsam ≥ %80 çekirdek modüllerde).
- Entegrasyon: alarm yeniden kurma (boot, saat değişimi).
- UI: Maestro akışları (rakiplerde kullanılanın aynısı → karşılaştırılabilir).
- Gerçek cihaz: Bildirim Kaydedici ile 7 günlük koşu her büyük sürümden önce.
- Regresyon: her PR'da CI.

---

## 9. FAZ D — Beta ve yayın

| Adım | Ayrıntı | Ölçüt |
|---|---|---|
| D1 Kapalı beta (4 hf) | Play kapalı test + TestFlight; 30–50 kişi, en az 15'i 60+; farklı marka telefonlar | Çökmesiz oturum ≥ %99,5; kaçan alarm raporu yok |
| D2 Puan kartı — bizim uygulama | Bölüm 2 kartı, aynı düzenek | ≥ 90/100 |
| D3 Mağaza hazırlığı | Özgün ekran görüntüleri, açıklama, veri güvenliği beyanı (gerçeğe uygun), gizlilik politikası | Beyan ile Exodus sonucu birebir |
| D4 Yayın | Aşamalı (%10 → %50 → %100) | İlk hafta 1–2 ★ oranı < %10 |
| D5 Büyüme (ücretsiz) | WhatsApp'ta paylaşılabilir hadis kartı, cami/aile grupları, "yakınım kursun" özelliği | — |

---

## 10. Yol haritası: MVP → V1 → V2

| Seviye | Kapsam |
|---|---|
| **MVP** | Vakitler (Diyanet, internetsiz), ezan alarmı + sağlık ekranı, widget, imsakiye/Ramazan modu, kıble, zikirmatik, Esma, dualar, hadis bildirimi, basit mod |
| **V1** | Kuran modülü (tam), namaz/kaza takibi, hatim takibi, çoklu şehir, seyahat modu, akıllı saat (Wear OS / Apple Watch), çoklu dil (EN, DE, NL, FR — Avrupa'daki Türkler) |
| **V2** | Toplu hatim, aile paylaşımı, sesli komut, yapay zekâ destekli soru-cevap (yalnızca Diyanet fetva kaynaklarına atıfla, kaynaksız cevap yok), cami entegrasyonu |

Her özellik V1/V2'ye ancak A2 yorum verisi veya beta geri bildirimiyle **kanıtlanmış talep** varsa alınır (kapsam şişmesine karşı).

---

## 11. Riskler ve B planları

| Risk | Olasılık | Etki | Önlem / B planı |
|---|---|---|---|
| Diyanet API erişimi verilmez / ticari kullanıma izin yok | Orta | Yüksek | Diyanet'le yazışma; olmazsa cihazda hesap + resmi tabloyla kalibrasyon ve açık etiketleme |
| Meal / kari sesi lisansı alınamaz | Orta | Orta | Kuran modülünü V1'e kaydır; açık lisanslı kaynaklar |
| Xiaomi'de alarm %99,5'e ulaşmaz | Orta | Yüksek | Marka bazlı sihirbaz + "sağlık ekranı" + `setAlarmClock`; yine olmazsa kullanıcıya açık uyarı |
| iOS 64 bildirim sınırı | Kesin | Orta | Kayan pencere + uygulama açılınca yenileme + uyarı |
| Mac / iOS derleme imkânı yok | Orta | Orta | Codemagic ücretsiz katmanı; önce Android yayını |
| Yorum çekme betiği engellenir | Düşük | Düşük | Yavaşlatma; daha küçük örneklem; mağaza arayüzünden elle örnek |
| Maestro rakip uygulamada güvenilir çalışmaz (reklamlar) | Yüksek | Düşük | Elle test + ekran kaydı |
| Kapsam büyür, proje uzar | Yüksek | Orta | Faz kapıları; kanıtsız özellik yok kuralı |
| Hadis metninde hata | Düşük | Yüksek | İlahiyatçı onayı, uzaktan düzeltilebilir içerik |

---

## 12. Toplam takvim (tahmini, akşam + hafta sonu temposu)

| Faz | Süre |
|---|---|
| A — Araştırma | 6–8 hafta |
| B — Tasarım | 3–4 hafta |
| C — Geliştirme | 16–22 hafta |
| D — Beta + yayın | 5–6 hafta |
| **Toplam MVP + Kuran** | **~7–10 ay** |

Ramazan bir hedef tarih değil; kalite kapıları belirleyici.

---

## Ek A — Görev kartı şablonu

```
# G-XXX  <başlık>
Faz: A2 | Bağlı gereksinim: REQ-... | Bağımlılık: G-...
Amaç: <tek cümle>
Girdi: <dosyalar, veriler>
Yapılacaklar:
  1. ...
Çıktılar: <dosya yolları>
Kabul kriterleri:
  - [ ] ...
Yasaklar: K1–K8
Kanıt: her iddia için dosya/link; çalıştırılan komutların çıktısı PR'a eklenir
Tahmini süre: ...
```

## Ek B — PR inceleme rubriği (Claude, 10 puan)

| Kriter | Puan |
|---|---|
| Kabul kriterlerinin hepsi karşılandı ve kanıtlandı | 3 |
| Doğruluk (kod/test/veri hatasız; iddialar kaynağa bağlı) | 2 |
| Testler (anlamlı, yeşil, kritik yollar kapsanıyor) | 2 |
| Kurallara uyum (K1–K8) | 1 (ihlal = otomatik 0, PR reddedilir) |
| Okunabilirlik ve sürdürülebilirlik | 1 |
| Belgeleme (README, PR açıklaması) | 1 |

≥ 8 birleştirilir.

## Ek C — Codex'e ilk 5 görev

1. **G-001 Repo ve klasör yapısı** — Bölüm 3'teki yapı, README, `docs/LICENSES.md` iskeleti, GitHub Actions boş iş akışı.
2. **G-002 Lab kurulum kılavuzu** — `01_LAB_SETUP.md`: Windows'ta ADB, scrcpy, Maestro kurulumu; her adımın doğrulama komutu.
3. **G-003 Rakip künyesi** — `02_COMPETITORS.md`: 18 uygulama, mağaza verileri, kaynak linki, tarih.
4. **G-004 Yorum çekme aracı** — `tools/reviews/`: Play + App Store betikleri, CSV şeması, 1 uygulama için deneme çıktısı (Ezan Vakti Pro, 500 yorum).
5. **G-005 Bildirim Kaydedici** — `tools/notif-logger/`: Kotlin, NotificationListenerService, CSV dışa aktarma, kurulum talimatı.
