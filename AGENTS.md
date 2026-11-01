# AGENTS.md — Codex ve Gemini için çalışma kuralları

Bu repoda çalışan her ajan bu dosyaya uyar. Ayrıntılı plan: `research/00_MASTER_PLAN.md` + `research/01_PLAN_CHANGES.md`.

## Kurallar
1. Ürün tamamen kendi kodumuzla yazılır. Rakip uygulamalar yalnızca kara kutu olarak (mağaza sayfası, kamuya açık raporlar, gerçek cihazda normal kullanım) incelenir; kodları, dosyaları, görselleri, sesleri, metinleri kullanılmaz.
2. Rakip sunucularına doğrudan istek yok; ödeme veya erişim kısıtı aşılmaz.
3. Reklam ve izleme SDK'sı yok. Konum cihazdan çıkmaz.
4. Lisansı yazılı doğrulanmamış içerik (vakit verisi, Kuran metni, meal, ses, hadis, dua) eklenmez; `docs/LICENSES.md`.
5. Çalıştırılmamış test ya da kanıtsız iddia yazılmaz. Durum etiketleri: CONFIRMED / REPORTED / HYPOTHESIS / UNKNOWN.
6. Bu repo dışındaki projelere dokunulmaz.

## İş akışı
1. İşler GitHub issue olarak açılır (görev kartı). Etiketler: `phase:*`, `critical`, `agent:codex`, `agent:gemini`.
2. Ajan, kendisine atanmış en düşük numaralı açık issue'yu alır; issue'ya "başladım" yorumu yazar.
3. Dal: `g-<issue no>-<kısa-ad>`. İş bitince PR açılır; açıklamada `Closes #<no>`.
4. PR açıklaması şablonu:
   - Ne yapıldı
   - Kabul kriterleri: her biri ✅ / ❌ ve nasıl doğrulandığı
   - Çalıştırılan komutlar ve çıktıları
   - Eklenen üçüncü taraf paket/içerik ve lisansı
5. Claude her gün PR'ları denetler, PR'a puan (10 üzerinden) ve karar yorumu yazar:
   - `APPROVED` → Sercan veya ajan birleştirir.
   - `CHANGES_REQUESTED` → ajan aynı dalda düzeltir.
6. Birleştirme şartı: puan ≥ 8 **ve** kritik kapı ihlali yok (vakit doğruluğu, alarm güvenilirliği, lisans, gizlilik).
7. PR'ı açan ajan kendi PR'ını onaylamaz.
