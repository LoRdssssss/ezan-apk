import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { calculatePrayerTimes as calc, DEFAULT_CONFIG, PRAYERS, addDays } from './engine.mjs';

const istanbul = { latitude: 41.0082, longitude: 28.9784, timeZone: 'Europe/Istanbul' };
const berlin = { latitude: 52.52, longitude: 13.405, timeZone: 'Europe/Berlin' };
const newYork = { latitude: 40.7128, longitude: -74.006, timeZone: 'America/New_York' };
const tromso = { latitude: 69.6492, longitude: 18.9553, timeZone: 'Europe/Oslo' };

test('Turkey stays UTC+3 across both European DST changes', () => {
  for (const date of ['2026-01-01', '2026-03-28', '2026-03-29', '2026-10-24', '2026-10-25', '2026-12-31']) {
    const result = calc(date, istanbul);
    assert.equal(result.status, 'calculated');
    for (const time of Object.values(result.times)) {
      assert.equal(time.utcOffsetMinutes, 180);
      assert.equal(time.localDate, date);
    }
    const tomorrow = calc(addDays(date, 1), istanbul);
    assert.ok(Math.abs(tomorrow.times.dhuhr.minute - result.times.dhuhr.minute) < 3);
  }
});

test('foreign DST uses target IANA zone at the event instant', () => {
  const before = calc('2026-03-28', berlin).times.dhuhr;
  const after = calc('2026-03-29', berlin).times.dhuhr;
  assert.equal(before.utcOffsetMinutes, 60);
  assert.equal(after.utcOffsetMinutes, 120);
  assert.ok(after.minute - before.minute >= 58 && after.minute - before.minute <= 62);
  assert.equal(calc('2026-10-31', newYork).times.dhuhr.utcOffsetMinutes, -240);
  assert.equal(calc('2026-11-01', newYork).times.dhuhr.utcOffsetMinutes, -300);
});

test('civil date arithmetic crosses month/year and leap days without local DST', () => {
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(addDays('2028-02-28', 1), '2028-02-29');
  assert.equal(addDays('2028-02-29', 1), '2028-03-01');
  assert.equal(addDays('2026-03-01', -1), '2026-02-28');
  assert.equal(calc('2027-01-01', istanbul).times.fajr.localDate, '2027-01-01');
});

test('the date line aligns the solar date with Kiritimati civil date (UTC+14)', () => {
  const result = calc('2026-12-31', { latitude: 1.8721, longitude: -157.4278, timeZone: 'Pacific/Kiritimati' });
  for (const time of Object.values(result.times)) {
    assert.equal(time.localDate, '2026-12-31');
    assert.equal(time.dayOffset, 0);
    assert.equal(time.utcOffsetMinutes, 840);
  }
  assert.equal(result.times.fajr.utc.slice(0, 10), '2026-12-30');
});

test('host timezones do not change UTC results, including DST transition days', () => {
  const samples = ['2026-03-08', '2026-03-29', '2026-10-25', '2026-11-01', '2026-12-31'];
  const script = `import { calculatePrayerTimes as calc } from './spikes/prayer-calc/engine.mjs';
    console.log(JSON.stringify(${JSON.stringify(samples)}.map(d => calc(d, ${JSON.stringify(istanbul)}))));`;
  let baseline;
  for (const TZ of ['UTC', 'Europe/Istanbul', 'America/New_York', 'Europe/Berlin', 'Pacific/Auckland', 'Pacific/Kiritimati']) {
    const output = execFileSync(process.execPath, ['--input-type=module', '-e', script], {
      cwd: new URL('../../', import.meta.url), env: { ...process.env, TZ }, encoding: 'utf8',
    });
    baseline ??= output;
    assert.equal(output, baseline, TZ);
  }
});

test('polar day and night expose unavailable events without inventing times', () => {
  for (const date of ['2026-06-21', '2026-12-21']) {
    const result = calc(date, tromso);
    assert.equal(result.status, 'unavailable');
    assert.equal(result.times.sunrise, null);
    assert.equal(result.times.maghrib, null);
    assert.ok(result.unavailable.includes('sunrise'));
    assert.ok(result.times.dhuhr.utc);
    assert.ok(!JSON.stringify(result).includes('NaN'));
  }
});

test('explicit polar estimation keeps next-day Isha visible', () => {
  const result = calc('2026-06-21', tromso, { polarCircleResolution: 'AqrabBalad' });
  assert.equal(result.status, 'calculated');
  assert.equal(result.accuracyStatus, 'UNVERIFIED');
  assert.equal(result.times.isha.dayOffset, 1);
  assert.equal(result.times.isha.localDate, '2026-06-22');
});

test('high-latitude twilight policy is selectable without changing midday', () => {
  const middle = calc('2026-06-21', berlin);
  const seventh = calc('2026-06-21', berlin, { highLatitudeRule: 'SeventhOfTheNight' });
  assert.equal(middle.status, 'calculated');
  assert.equal(seventh.status, 'calculated');
  assert.deepEqual(middle.times.dhuhr, seventh.times.dhuhr);
  assert.ok(seventh.times.fajr.minute > middle.times.fajr.minute);
  assert.ok(seventh.times.isha.minute < middle.times.isha.minute);
});

test('total offsets are applied once; independent calls cannot mutate defaults', () => {
  const normal = calc('2026-11-01', istanbul);
  const zero = calc('2026-11-01', istanbul, { adjustments: Object.fromEntries(PRAYERS.map(p => [p, 0])) });
  for (const prayer of PRAYERS) {
    assert.equal(normal.times[prayer].minute - zero.times[prayer].minute, DEFAULT_CONFIG.adjustments[prayer]);
  }
  const changed = calc('2026-11-01', istanbul, { adjustments: { fajr: 3 } });
  assert.equal(changed.times.fajr.minute - normal.times.fajr.minute, 3);
  assert.deepEqual(calc('2026-11-01', istanbul), normal);
});

test('Asr shadow rule and twilight angles affect only intended events', () => {
  const normal = calc('2026-11-01', istanbul);
  const hanafi = calc('2026-11-01', istanbul, { madhab: 'Hanafi' });
  assert.ok(hanafi.times.asr.minute > normal.times.asr.minute + 20);
  for (const prayer of PRAYERS.filter(p => p !== 'asr')) assert.deepEqual(hanafi.times[prayer], normal.times[prayer]);
  const angles = calc('2026-11-01', istanbul, { fajrAngle: 19, ishaAngle: 18 });
  assert.ok(angles.times.fajr.minute < normal.times.fajr.minute);
  assert.ok(angles.times.isha.minute > normal.times.isha.minute);
});

test('rounding directions bound each event to at most one minute', () => {
  const down = calc('2026-11-01', istanbul, { rounding: 'down' });
  const up = calc('2026-11-01', istanbul, { rounding: 'up' });
  for (const prayer of PRAYERS) {
    assert.ok(up.times[prayer].minute - down.times[prayer].minute >= 0);
    assert.ok(up.times[prayer].minute - down.times[prayer].minute <= 1);
  }
});

test('invalid dates, coordinates, zones and typoed parameters fail explicitly', () => {
  for (const date of ['2026-02-29', '2026-04-31', '2026-13-01', '2026-1-01', '1899-12-31', '2101-01-01', new Date()]) {
    assert.throws(() => calc(date, istanbul), /date/);
  }
  for (const location of [{ ...istanbul, latitude: 91 }, { ...istanbul, longitude: NaN }, { ...istanbul, timeZone: 'not/a-zone' }]) {
    assert.throws(() => calc('2026-11-01', location));
  }
  for (const config of [{ fajrAngle: -18 }, { ishaAngle: '17' }, { madhab: 'typo' },
    { adjustments: { fajir: 1 } }, { adjustments: { fajr: Infinity } }, { adjustmets: {} },
    { rounding: 'typo' }, { polarCircleResolution: 'typo' }, { highLatitudeRule: 'typo' }, { adjustments: null }]) {
    assert.throws(() => calc('2026-11-01', istanbul, config));
  }
});
