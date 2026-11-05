import {
  CalculationMethod, Coordinates, HighLatitudeRule, Madhab,
  PolarCircleResolution, PrayerTimes, Rounding,
} from 'adhan';

export const PRAYERS = Object.freeze(['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']);

// Total offsets, not additions to adhan's hidden methodAdjustments.
export const DEFAULT_CONFIG = Object.freeze({
  fajrAngle: 18,
  ishaAngle: 17,
  madhab: 'Shafi', // Single shadow length (asr-i evvel).
  highLatitudeRule: 'MiddleOfTheNight',
  polarCircleResolution: 'Unresolved',
  rounding: 'nearest',
  adjustments: Object.freeze({ fajr: 0, sunrise: -7, dhuhr: 5, asr: 4, maghrib: 7, isha: 0 }),
});

function requireObject(value, label) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object`);
  }
}

export function civilDate(date) {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new RangeError('date must be YYYY-MM-DD');
  }
  const instant = new Date(`${date}T00:00:00Z`);
  const year = Number(date.slice(0, 4));
  if (!Number.isFinite(instant.getTime()) || year < 1900 || year > 2100 ||
      instant.toISOString().slice(0, 10) !== date) {
    throw new RangeError('date must be a real calendar day in 1900..2100');
  }
  return instant;
}

export function addDays(date, days) {
  if (!Number.isInteger(days)) throw new RangeError('days must be an integer');
  const instant = civilDate(date);
  instant.setUTCDate(instant.getUTCDate() + days);
  const result = instant.toISOString().slice(0, 10);
  civilDate(result);
  return result;
}

export function resolveConfig(overrides = {}) {
  requireObject(overrides, 'config');
  for (const key of Object.keys(overrides)) {
    if (!Object.hasOwn(DEFAULT_CONFIG, key)) throw new RangeError(`Unknown config key: ${key}`);
  }
  const config = { ...DEFAULT_CONFIG, ...overrides };
  if (Object.hasOwn(overrides, 'adjustments')) requireObject(overrides.adjustments, 'adjustments');
  config.adjustments = { ...DEFAULT_CONFIG.adjustments, ...overrides.adjustments };
  for (const key of Object.keys(config.adjustments)) {
    if (!PRAYERS.includes(key) || !Number.isFinite(config.adjustments[key]) ||
        Math.abs(config.adjustments[key]) > 120) {
      throw new RangeError(`Invalid minute adjustment: ${key}`);
    }
  }
  for (const key of ['fajrAngle', 'ishaAngle']) {
    if (!Number.isFinite(config[key]) || config[key] <= 0 || config[key] >= 30) {
      throw new RangeError(`${key} must be in (0, 30)`);
    }
  }
  for (const [key, choices] of [
    ['madhab', ['Shafi', 'Hanafi']],
    ['highLatitudeRule', ['MiddleOfTheNight', 'SeventhOfTheNight', 'TwilightAngle']],
    ['polarCircleResolution', ['Unresolved', 'AqrabBalad', 'AqrabYaum']],
    ['rounding', ['nearest', 'up', 'down']],
  ]) {
    if (!choices.includes(config[key])) throw new RangeError(`Invalid ${key}`);
  }
  return config;
}

function formatter(timeZone) {
  if (typeof timeZone !== 'string' || !timeZone) throw new RangeError('timeZone is required');
  return new Intl.DateTimeFormat('en-CA', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  });
}

export function validateLocation(location) {
  requireObject(location, 'location');
  for (const [key, limit] of [['latitude', 90], ['longitude', 180]]) {
    if (!Number.isFinite(location[key]) || Math.abs(location[key]) > limit) {
      throw new RangeError(`Invalid ${key}`);
    }
  }
  formatter(location.timeZone);
}

function localTime(instant, date, fmt) {
  const parts = Object.fromEntries(fmt.formatToParts(instant).map(p => [p.type, p.value]));
  const localDate = `${parts.year}-${parts.month}-${parts.day}`;
  const dayOffset = (civilDate(localDate).getTime() - civilDate(date).getTime()) / 86400000;
  const minute = Number(parts.hour) * 60 + Number(parts.minute);
  return {
    utc: instant.toISOString(), localDate, time: `${parts.hour}:${parts.minute}`,
    dayOffset, minute: dayOffset * 1440 + minute,
    utcOffsetMinutes: (civilDate(localDate).getTime() + minute * 60000 - instant.getTime()) / 60000,
  };
}

/** Pure offline provider. The date is a civil day at the requested location. */
export function calculatePrayerTimes(date, location, overrides = {}) {
  civilDate(date);
  validateLocation(location);
  const config = resolveConfig(overrides);
  const params = CalculationMethod.Turkey();
  params.fajrAngle = config.fajrAngle;
  params.ishaAngle = config.ishaAngle;
  params.madhab = Madhab[config.madhab];
  params.highLatitudeRule = HighLatitudeRule[config.highLatitudeRule];
  params.polarCircleResolution = PolarCircleResolution[config.polarCircleResolution];
  params.rounding = Rounding.None;
  params.methodAdjustments = Object.fromEntries(PRAYERS.map(p => [p, 0]));
  params.adjustments = config.adjustments;
  const coordinates = new Coordinates(location.latitude, location.longitude);
  const fmt = formatter(location.timeZone);
  let solarDate = date;
  let computed;
  for (let attempt = 0; attempt < 3; attempt++) {
    const day = civilDate(solarDate);
    // adhan consumes local calendar components, not the Date's timestamp.
    // Noon avoids host DST gaps around midnight.
    const calendar = new Date(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), 12);
    if (calendar.getFullYear() !== day.getUTCFullYear() || calendar.getMonth() !== day.getUTCMonth() ||
        calendar.getDate() !== day.getUTCDate()) {
      throw new RangeError('Host timezone skips this civil day; use a supported host timezone');
    }
    computed = new PrayerTimes(coordinates, calendar, params);
    // The UTC solar day can differ from the requested civil day across the
    // date line (e.g. Kiritimati, UTC+14). Anchor on unadjusted solar transit.
    const transit = new Date(computed.dhuhr.getTime() - config.adjustments.dhuhr * 60000);
    const offset = localTime(new Date(Math.round(transit.getTime() / 60000) * 60000), date, fmt).dayOffset;
    if (offset === 0) break;
    if (attempt === 2) throw new RangeError('Cannot align solar transit with the requested civil day');
    solarDate = addDays(solarDate, -offset);
  }
  const round = { nearest: Math.round, up: Math.ceil, down: Math.floor }[config.rounding];
  const times = Object.fromEntries(PRAYERS.map(prayer => {
    const instant = computed[prayer];
    return [prayer, Number.isFinite(instant.getTime())
      ? localTime(new Date(round(instant.getTime() / 60000) * 60000), date, fmt)
      : null];
  }));
  const unavailable = PRAYERS.filter(p => times[p] === null);
  return {
    provider: 'adhan-4.4.6', date, timeZone: location.timeZone, config,
    status: unavailable.length ? 'unavailable' : 'calculated',
    accuracyStatus: 'UNVERIFIED',
    reason: unavailable.length ? 'Solar events unavailable under the selected polar policy' : null,
    unavailable, times,
  };
}
