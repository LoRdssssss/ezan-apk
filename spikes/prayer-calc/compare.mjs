import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { PRAYERS, addDays, civilDate, calculatePrayerTimes, validateLocation, resolveConfig } from './engine.mjs';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const MANIFEST = resolve(ROOT, 'spikes/prayer-calc/locations.json');
const REPORT = resolve(ROOT, 'research/07_PRAYER_TIME_ACCURACY.md');
const RESULTS = resolve(ROOT, 'research/data/prayer-results');
export const LABELS = { fajr: 'İmsak', sunrise: 'Güneş', dhuhr: 'Öğle', asr: 'İkindi', maghrib: 'Akşam', isha: 'Yatsı' };

export function clockMinute(value) {
  if (typeof value !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) {
    throw new RangeError(`Invalid HH:mm: ${value}`);
  }
  return Number(value.slice(0, 2)) * 60 + Number(value.slice(3));
}

export function validateReference(reference, location, manifest) {
  if (reference.schemaVersion !== 1 || reference.locationId !== location.id ||
      reference.usage !== 'test-reference-only') throw new Error('Invalid reference metadata');
  const source = new URL(reference.sourceUrl);
  if (source.protocol !== 'https:' || source.hostname !== 'namazvakitleri.diyanet.gov.tr' ||
      !source.pathname.includes(`/${location.code}/`)) throw new Error('Expected official location page');
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(reference.accessedAt) ||
      !Number.isFinite(Date.parse(reference.accessedAt))) throw new Error('Missing access date');
  if (!Array.isArray(reference.rows) || reference.rows.length !== manifest.days) {
    throw new Error(`Expected ${manifest.days} rows for ${location.id}`);
  }
  const expected = new Set(Array.from({ length: manifest.days }, (_, i) => addDays(manifest.startDate, i)));
  for (const row of reference.rows) {
    if (!expected.delete(row.date)) throw new Error(`Duplicate or out-of-range date: ${row.date}`);
    if (!row.times || Object.keys(row.times).length !== PRAYERS.length) throw new Error('Expected six prayers');
    if (Object.keys(row.dayOffsets ?? {}).some(p => !PRAYERS.includes(p))) throw new Error('Unknown day offset');
    for (const prayer of PRAYERS) {
      clockMinute(row.times[prayer]);
      const offset = row.dayOffsets?.[prayer] ?? 0;
      if (!Number.isInteger(offset) || Math.abs(offset) > 1) throw new Error('Invalid day offset');
    }
  }
}

export function summarize(values) {
  if (values.length === 0) return { count: 0, exact: 0, mean: null, mae: null, maxAbs: null, min: null, max: null };
  return {
    count: values.length, exact: values.filter(n => n === 0).length,
    mean: values.reduce((a, b) => a + b, 0) / values.length,
    mae: values.reduce((a, b) => a + Math.abs(b), 0) / values.length,
    maxAbs: Math.max(...values.map(Math.abs)), min: Math.min(...values), max: Math.max(...values),
  };
}

/** Signed difference keeps the date: 00:05 next day is not 00:05 today. */
export function compareDay(computed, row) {
  return Object.fromEntries(PRAYERS.map(p => [p, computed.times[p] === null ? null
    : computed.times[p].minute - clockMinute(row.times[p]) - (row.dayOffsets?.[p] ?? 0) * 1440]));
}

export function compareDataset(manifest, references, config = {}) {
  config = resolveConfig(config);
  const details = [];
  const locations = [];
  for (const location of manifest.locations) {
    validateLocation(location);
    const reference = references[location.id];
    if (!reference) throw new Error(`Missing reference: ${location.id}`);
    validateReference(reference, location, manifest);
    const differences = Object.fromEntries(PRAYERS.map(p => [p, []]));
    let unavailable = 0;
    for (const row of [...reference.rows].sort((a, b) => a.date.localeCompare(b.date))) {
      const computed = calculatePrayerTimes(row.date, location, config);
      const diff = compareDay(computed, row);
      for (const prayer of PRAYERS) {
        if (diff[prayer] === null) unavailable++;
        else differences[prayer].push(diff[prayer]);
        details.push({ location: location.id, country: location.country, date: row.date, prayer,
          reference: row.times[prayer], referenceDayOffset: row.dayOffsets?.[prayer] ?? 0,
          computed: computed.times[prayer]?.time ?? null,
          computedDayOffset: computed.times[prayer]?.dayOffset ?? null, difference: diff[prayer] });
      }
    }
    const prayers = Object.fromEntries(PRAYERS.map(p => [p, summarize(differences[p])]));
    // Diagnostic fit on these same samples; never fed back into the provider.
    const suggestedExtraMinutes = Object.fromEntries(PRAYERS.map(p => {
      const sorted = [...differences[p]].sort((a, b) => a - b);
      return [p, sorted.length ? -sorted[Math.floor(sorted.length / 2)] || 0 : null];
    }));
    const residuals = PRAYERS.flatMap(p => differences[p].map(n => n + suggestedExtraMinutes[p]));
    locations.push({ id: location.id, name: location.name, country: location.country,
      sourceUrl: reference.sourceUrl, accessedAt: reference.accessedAt, unavailable,
      prayers, total: summarize(Object.values(differences).flat()),
      suggestedExtraMinutes, diagnosticResidual: summarize(residuals) });
  }
  const groups = Object.fromEntries(['TR', 'abroad'].map(group => {
    const rows = details.filter(r => group === 'TR' ? r.country === 'TR' : r.country !== 'TR');
    const measured = rows.filter(r => r.difference !== null);
    return [group, { ...summarize(measured.map(r => r.difference)),
      expected: rows.length, unavailable: rows.length - measured.length,
      prayers: Object.fromEntries(PRAYERS.map(p => [p, summarize(measured.filter(r => r.prayer === p).map(r => r.difference))])) }];
  }));
  return { schemaVersion: 1, startDate: manifest.startDate, days: manifest.days,
    config, groups, locations, details };
}

function fixed(number) { return number === null ? 'UNKNOWN' : number.toFixed(3); }
function matrix(locations) {
  return [
    `| Nokta | ${PRAYERS.map(p => LABELS[p]).join(' | ')} | Toplam MAE | Maks |`,
    `| --- | ${PRAYERS.map(() => '---').join(' | ')} | --- | --- |`,
    ...locations.map(l => `| ${l.name} | ${PRAYERS.map(p => `${fixed(l.prayers[p].mean)} / ${l.prayers[p].maxAbs ?? 'UNKNOWN'}`).join(' | ')} | ${fixed(l.total.mae)} | ${l.total.maxAbs ?? 'UNKNOWN'} |`),
  ].join('\n');
}

export function renderReport(result, manifest) {
  const tr = result.groups.TR;
  const abroad = result.groups.abroad;
  return `# G-007 — Vakit hesaplama doğruluğu

## Sonuç ve kabul kapısı

CONFIRMED: ${result.startDate}–${addDays(result.startDate, result.days - 1)} dönemi için
20 Türkiye + 5 yurt dışı nokta × 30 gün × 6 vakit karşılaştırıldı.
Bu dosya \`npm run prayer:compare\` ile yerel referanslardan üretilir.

| Grup | Ölçülen / beklenen | Tam eşleşme | Ortalama işaretli fark (dk) | MAE (dk) | Maks mutlak fark (dk) |
| --- | --- | --- | --- | --- | --- |
| Türkiye | ${tr.count} / ${tr.expected} | ${tr.exact} | ${fixed(tr.mean)} | ${fixed(tr.mae)} | ${tr.maxAbs} |
| Yurt dışı | ${abroad.count} / ${abroad.expected} | ${abroad.exact} | ${fixed(abroad.mean)} | ${fixed(abroad.mae)} | ${abroad.maxAbs} |

Türkiye sıfır fark hedefi: **${tr.exact === tr.expected ? 'GEÇTİ' : 'GEÇMEDİ'}**.
Eksik/hesaplanamayan vakit: Türkiye ${tr.unavailable}, yurt dışı ${abroad.unavailable}.
Yurt dışı yöntem farkları Türkiye hata ölçütüne katılmaz.
Bu deney, motorun Diyanet ile birebir uyumlu olduğunu veya yayına hazır olduğunu kanıtlamaz.
Plan değişiklikleri madde 7 uyarınca doğruluk kapısı açık kalır.

## Yöntem ve veri kapsamı

- Fark = hesaplanan yerel dakika − resmi yerel dakika; pozitif değer geç, negatif erken.
- Her vakit kendi yerel tarihiyle karşılaştırılır; gece yarısı farkı mod 24 ile gizlenmez.
- Tablolardaki her vakit hücresi: **ortalama işaretli fark / maksimum mutlak fark**, dakika.
- MAE mutlak farkların ortalamasıdır. Altı vakit eşit ağırlıktadır; güneş dahildir.
- Kaynaklar Diyanet'in kamuya açık şehir sayfalarının aylık tablolarıdır; API kaydı yoktur.
- Erişim: 1 Kasım 2026. Bazı ilk okumalar arama önbelleğinden eski tarih aralığı getirdi;
  eksik Kasım günleri olan yanıtlar kullanılmadı, 30 günün tamamı doğrulandı.
- Sayfa içerikleri web bağlayıcısıyla okundu; HTTP yanıt gövdesi/arşiv ekran görüntüsü saklanmadı.
  Gelecekte değişen sayfalar için zaman damgalı JSON gözlemi yeniden üretim girdisidir.
- Koordinatlar deney için seçilen yaklaşık şehir merkezleridir (HYPOTHESIS);
  Diyanet'in hesap noktaları olduğu doğrulanmadı. Resmi il/ilçe kimlikleri kaynak URL'sindedir.
- Rakım/ufuk/topografya modellenmez. Yüksek rakımlı şehir seçimi, rakım düzeltmesi yapıldığı anlamına gelmez.
- Referanslar yalnızca araştırma/test içindir; uygulama modülü bu dosyaları okumaz.
  Plan madde 11 bu kullanımı tanımlar; yeniden dağıtım izni doğrulanmış sayılmaz.
- Bir aylık örneklem mevsimsel doğruluk veya bir yıllık eşleşme iddiasına yetmez.

## Türkiye — nokta × vakit farkları

${matrix(result.locations.filter(l => l.country === 'TR'))}

## Yurt dışı — ayrı değerlendirme

${matrix(result.locations.filter(l => l.country !== 'TR'))}

## Parametreler ve kaynakları

Başlangıç profili \`adhan@4.4.6\` Turkey: imsak ${result.config.fajrAngle}°, yatsı ${result.config.ishaAngle}°;
ikindi \`${result.config.madhab}\` (bir gölge boyu / asr-i evvel); yuvarlama \`${result.config.rounding}\`.
Toplam dakika düzeltmeleri İmsak/Güneş/Öğle/İkindi/Akşam/Yatsı sırasıyla:

\`\`\`json
${JSON.stringify(result.config.adjustments)}
\`\`\`

- REPORTED: [Diyanet açı açıklaması](https://www.diyanet.gov.tr/icerik/8092), 18° / 17°.
- REPORTED: [Diyanet temkin açıklaması](https://vakithesaplama.diyanet.gov.tr/temkin.php),
  güneş −7, öğle +5, ikindi +4, akşam +7; imsak/yatsı 0 dakika.
- CONFIRMED: [adhan paket kaynağı](https://registry.npmjs.org/adhan/4.4.6),
  Turkey profili ve varsayılan tek gölge boyu; paket lisansı depoda korunur.
- Tek gölge boyunun Diyanet için bağımsız dini onayı: UNKNOWN; kaynak burada kütüphane profilidir.
- Yüksek enlem kuralı \`${result.config.highLatitudeRule}\`, kutup çözümü \`${result.config.polarCircleResolution}\`.
  Bunlar Diyanet'in yüksek enlem takdir yöntemi olarak doğrulanmadı (UNKNOWN).
  Güneş olayı oluşmazsa varsayılan motor \`null\` + \`unavailable\` döndürür.
  \`AqrabBalad\` / \`AqrabYaum\` ancak açık parametre seçimiyle kullanılır.

## Sapma nedenleri ve kapanış önerisi

HYPOTHESIS: Şehir merkezi ile resmi hesap koordinatının farkı, dakika yuvarlaması,
astronomik model ve rakım/ufuk düzeltmesinin bulunmaması küçük sapmalara yol açabilir.
Temkinleri ikinci kez eklememek için kütüphanenin yöntem düzeltmeleri sıfırlanır;
yukarıdaki toplam düzeltmeler bir kez uygulanır.

Aşağıdaki vektörler aynı 30 gündeki farkların negatif medyanıdır: başlangıç düzeltmelerine
eklenmesi önerilen **deneysel** dakika değerleri. Otomatik uygulanmaz, bağımsız kalibrasyon
veya gelecekteki doğruluk kanıtı değildir. Son sütun, bu sabit düzeltme yapılsa bile kalan
maksimum mutlak sapmayı gösterir; sıfır değilse sabit dakika parametresi bütün günleri kapatmaz.

| Nokta | Ek dakika: İmsak / Güneş / Öğle / İkindi / Akşam / Yatsı | Kalan maks (dk) |
| --- | --- | --- |
${result.locations.map(l => `| ${l.name} | ${PRAYERS.map(p => l.suggestedExtraMinutes[p] ?? 'UNKNOWN').join(' / ')} | ${l.diagnosticResidual.maxAbs ?? 'UNKNOWN'} |`).join('\n')}

Önerilen sıra: resmi hesap noktasını doğrula; yuvarlama yönünü ayrı deneyde karşılaştır;
konuma bağlı ufuk/rakım etkisini ölç; ardından açı/temkin değişikliğini başka ayda ve
ayrılmış doğrulama günlerinde sınayıp bütün Türkiye vakitlerinde 0 dakika şartını yeniden çalıştır.
Kanıt olmadan tek bir parametrenin bütün farkları kapatacağı söylenemez (UNKNOWN).

## Noktalar ve kaynak sayfaları

Koordinat durumu: ${manifest.coordinateStatus}

| Nokta | Bölge | Enlem | Boylam | IANA saat dilimi | Resmi sayfa |
| --- | --- | --- | --- | --- | --- |
${manifest.locations.map(l => `| ${l.name} | ${l.region} | ${l.latitude} | ${l.longitude} | ${l.timeZone} | [${l.code}](${result.locations.find(r => r.id === l.id).sourceUrl}) |`).join('\n')}

## Yeniden üretim ve test kanıtı

\`\`\`bash
npm ci
npm test
npm run prayer:compare
npm run prayer:check
npm run prayer:gate
npm run lint:md
\`\`\`

\`prayer:check\` kayıtlı rapor, özet ve CSV'nin yeniden üretilebilirliğini denetler.
\`prayer:gate\` Türkiye 0 dakika hedefi geçmezse çıkış kodu 2 verir; bu beklenen
sonuç test başarısı olarak sunulmaz. Çalıştırılan komutların gerçek çıktıları PR'dadır.

Ham referanslar: [veri kılavuzu](data/prayer-ref/README.md).
Makine özeti: [summary.json](data/prayer-results/summary.json).
Her nokta/gün/vakit farkı: [differences.csv](data/prayer-results/differences.csv).
Motor/test sözleşmesi: [spike kılavuzu](../spikes/prayer-calc/README.md).

CONFIRMED: Node.js 24.19.0 ile 17 test ve karşılaştırma yeniden üretimi
[kayıtlı koşuda](evidence/prayer-calc-test-run.txt) geçti.
Aynı koşu \`strace -f -e trace=network\` ile izlendi;
[sistem çağrısı kaydında](evidence/prayer-calc-network.txt) ağ bağlantısı çağrısı yoktur.
Bu gözlem test edilen motor/karşılaştırma yollarını kapsar; paket kurulumu bu koşuya dahil değildir.

Bağlantı kontrolü: bu bulut ortamının HTTP izin listesi Diyanet alan adlarını kapsamıyor.
\`npm run check:links\` bu yüzden 27 resmi kaynak bağlantısında HTTP 403 ile başarısız oldu;
bu, kaynakların ölü olduğunu kanıtlamaz. Sayfalar veri toplama sırasında web bağlayıcısıyla okundu.
[Bağlantı koşusu](evidence/prayer-calc-links.txt) gerçek hata çıktısını korur.
`;
}

function main() {
  const args = process.argv.slice(2);
  if (args.some(arg => !['--check', '--require-zero'].includes(arg))) throw new Error('Unknown argument');
  const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
  civilDate(manifest.startDate);
  if (manifest.schemaVersion !== 1 || manifest.days !== 30 || manifest.locations.length !== 25 ||
      manifest.locations.filter(l => l.country === 'TR').length !== 20 ||
      new Set(manifest.locations.map(l => l.id)).size !== 25 ||
      manifest.locations.some(l => !/^[a-z-]+$/.test(l.id))) throw new Error('Expected unique 20 TR + 5 abroad × 30 days');
  const references = Object.fromEntries(manifest.locations.map(l => [l.id,
    JSON.parse(readFileSync(resolve(ROOT, `research/data/prayer-ref/${l.id}.json`), 'utf8'))]));
  const result = compareDataset(manifest, references);
  const { details, ...summary } = result;
  const keys = Object.keys(details[0]);
  const csv = [keys.join(','), ...details.map(row => keys.map(k => row[k] ?? '').join(','))].join('\n') + '\n';
  const artifacts = [
    [REPORT, renderReport(result, manifest)],
    [resolve(RESULTS, 'summary.json'), JSON.stringify(summary, null, 2) + '\n'],
    [resolve(RESULTS, 'differences.csv'), csv],
  ];
  for (const [path, content] of artifacts) {
    if (args.includes('--check')) {
      if (readFileSync(path, 'utf8') !== content) throw new Error(`Stale generated artifact: ${path}`);
    } else { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, content); }
  }
  for (const [group, stats] of Object.entries(result.groups)) {
    console.log(`${group}: ${stats.count}/${stats.expected}, exact=${stats.exact}, MAE=${fixed(stats.mae)} min, max=${stats.maxAbs} min, unavailable=${stats.unavailable}`);
  }
  if (args.includes('--require-zero') && result.groups.TR.exact !== result.groups.TR.expected) process.exitCode = 2;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
