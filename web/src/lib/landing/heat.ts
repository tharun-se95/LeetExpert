/**
 * The landing page's heat map: an example year of practice, one square per
 * day, like a GitHub contribution graph. It illustrates the "earn credits for
 * consistent heat" idea; it is not anyone's real activity, and the page says
 * so ("An example year").
 *
 * The year is seeded, so the drawing is identical on server and client and
 * across builds; only its end date moves (HomePage passes the render date).
 * Every number the section prints — days practised, longest streak — is
 * computed from these counts. landingHeat.test.tsx rebuilds the calendar
 * independently and compares.
 */

const DAY_MS = 86_400_000;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

export const HEAT_WEEKS = 52;
export const HEAT_SEED = 20260914;
/** Problems solved in a day needed for each level above 0; level = thresholds met. */
export const HEAT_THRESHOLDS = [1, 3, 6, 10] as const;

export type HeatDay = { date: string; count: number; level: number };
export type HeatMonth = { week: number; label: string };
export type HeatYear = {
  /** HEAT_WEEKS columns of 7 days, Sunday first; days after the end date are null. */
  weeks: readonly (readonly (HeatDay | null)[])[];
  months: readonly HeatMonth[];
  activeDays: number;
  longestStreak: number;
};

export function heatLevel(count: number): number {
  return HEAT_THRESHOLDS.filter((t) => count >= t).length;
}

/**
 * Problems solved per day for `days` days. Practice gets more regular as the
 * year goes on — sparse early, warm late — because that change is what the
 * section is about.
 */
export function exampleCounts(days: number, seed: number): number[] {
  let state = seed >>> 0;
  // mulberry32: tiny, seedable, identical across JS engines.
  const rand = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return Array.from({ length: days }, (_, i) => {
    const chance = 0.2 + 0.65 * (i / Math.max(1, days - 1));
    const practised = rand() < chance;
    const size = rand();
    return practised ? 1 + Math.floor(size * size * 12) : 0;
  });
}

function parseDay(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y!, m! - 1, d!);
}

const isoDay = (ms: number) => new Date(ms).toISOString().slice(0, 10);

/** The example year ending on `endIso` (YYYY-MM-DD, UTC). */
export function heatYear(endIso: string, seed = HEAT_SEED): HeatYear {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(endIso)) {
    throw new Error(`heatYear: expected YYYY-MM-DD, got "${endIso}"`);
  }
  const end = parseDay(endIso);
  const endWeekday = new Date(end).getUTCDay();
  // Whole weeks back to a Sunday, so every column starts on the same weekday.
  const total = (HEAT_WEEKS - 1) * 7 + endWeekday + 1;
  const start = end - (total - 1) * DAY_MS;
  const counts = exampleCounts(total, seed);

  const weeks = Array.from({ length: HEAT_WEEKS }, (_, w) =>
    Array.from({ length: 7 }, (_, d): HeatDay | null => {
      const i = w * 7 + d;
      if (i >= total) return null;
      const count = counts[i]!;
      return { date: isoDay(start + i * DAY_MS), count, level: heatLevel(count) };
    }),
  );

  const monthOf = (w: number) => new Date(start + w * 7 * DAY_MS).getUTCMonth();
  const months: HeatMonth[] = [];
  for (let w = 0; w < HEAT_WEEKS; w++) {
    if (w === 0 || monthOf(w) !== monthOf(w - 1)) months.push({ week: w, label: MONTHS[monthOf(w)]! });
  }
  // The first column's label would collide with the next month's when that
  // month begins within two columns.
  if (months.length > 1 && months[1]!.week <= 2) months.shift();

  let longestStreak = 0;
  let run = 0;
  for (const count of counts) {
    run = count > 0 ? run + 1 : 0;
    longestStreak = Math.max(longestStreak, run);
  }

  return { weeks, months, activeDays: counts.filter((c) => c > 0).length, longestStreak };
}
