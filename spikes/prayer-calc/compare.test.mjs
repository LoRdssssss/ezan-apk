import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PRAYERS, calculatePrayerTimes } from './engine.mjs';
import { clockMinute, compareDay, compareDataset, summarize, validateReference } from './compare.mjs';

const manifest = JSON.parse(readFileSync(new URL('./locations.json', import.meta.url)));
const references = Object.fromEntries(manifest.locations.map(l => [l.id,
  JSON.parse(readFileSync(new URL(`../../research/data/prayer-ref/${l.id}.json`, import.meta.url)))]));

test('every reference has exactly 30 unique civil days and six official times', () => {
  assert.equal(manifest.locations.filter(l => l.country === 'TR').length, 20);
  assert.equal(manifest.locations.filter(l => l.country !== 'TR').length, 5);
  for (const location of manifest.locations) validateReference(references[location.id], location, manifest);
});

test('comparison preserves signed differences and day rollover without modulo', () => {
  const row = { times: Object.fromEntries(PRAYERS.map(p => [p, '00:05'])) };
  const computed = { times: Object.fromEntries(PRAYERS.map(p => [p, { minute: 1445 }])) };
  assert.equal(compareDay(computed, row).isha, 1440);
  row.dayOffsets = { isha: 1 };
  assert.equal(compareDay(computed, row).isha, 0);
  computed.times.fajr = { minute: 3 };
  assert.equal(compareDay(computed, row).fajr, -2);
  computed.times.sunrise = null;
  assert.equal(compareDay(computed, row).sunrise, null);
});

test('MAE cannot hide early/late cancellation; no data is UNKNOWN, not zero', () => {
  assert.deepEqual(summarize([-2, 2, 0]), { count: 3, exact: 1, mean: 0, mae: 4 / 3, maxAbs: 2, min: -2, max: 2 });
  assert.equal(summarize([]).mae, null);
  for (const value of ['24:00', '5:00', '12:60', null]) assert.throws(() => clockMinute(value));
});

test('missing, duplicate, malformed or misattributed references are rejected', () => {
  const location = manifest.locations[0];
  const original = references[location.id];
  const mutations = [
    r => r.rows.pop(),
    r => { r.rows[1] = r.rows[0]; },
    r => { r.rows[0].date = '2026-12-01'; },
    r => { r.rows[0].times.isha = '25:00'; },
    r => { delete r.rows[0].times.fajr; },
    r => { r.sourceUrl = 'https://example.com/test'; },
    r => { r.sourceUrl = references.ankara.sourceUrl; },
    r => { r.accessedAt = ''; },
    r => { r.usage = 'application-data'; },
    r => { r.rows[0].dayOffsets = { isha: 2 }; },
  ];
  for (const mutate of mutations) {
    const reference = structuredClone(original);
    mutate(reference);
    assert.throws(() => validateReference(reference, location, manifest));
  }
  assert.throws(() => compareDataset(manifest, {}), /Missing reference/);
});

test('real comparison includes 4500 events and separates foreign methodology', () => {
  const result = compareDataset(manifest, references);
  assert.equal(result.details.length, 4500);
  assert.equal(result.groups.TR.expected, 3600);
  assert.equal(result.groups.TR.count, 3600);
  assert.equal(result.groups.abroad.count, 900);
  assert.equal(result.groups.TR.unavailable, 0);
  const istanbul = result.locations.find(l => l.id === 'istanbul');
  const raw = references.istanbul.rows[0];
  const computed = calculatePrayerTimes(raw.date, manifest.locations[0]);
  for (const prayer of PRAYERS) {
    const detail = result.details.find(r => r.location === 'istanbul' && r.date === raw.date && r.prayer === prayer);
    assert.equal(detail.difference, computed.times[prayer].minute - clockMinute(raw.times[prayer]));
    assert.equal(istanbul.prayers[prayer].count, 30);
  }
  // A fitted offset is only diagnostic: the provider profile stays untouched.
  assert.equal(result.config.adjustments.sunrise, -7);
  assert.ok(istanbul.diagnosticResidual.maxAbs <= istanbul.total.maxAbs);
});
