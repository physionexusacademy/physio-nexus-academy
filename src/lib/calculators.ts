/**
 * Clinical calculators used on /health-calculators/clinical. Pure functions: no network, nothing stored.
 * They are teaching and screening aids and never replace a clinician's judgement (the page says so).
 * scripts/validate-calculators.ts checks every formula against worked examples.
 */

/** Estimated maximum heart rate. "tanaka" (208 - 0.7 x age) suits adults better than the older "fox" (220 - age). */
export function maxHeartRate(age: number, formula: "tanaka" | "fox" = "tanaka"): number {
  if (!(age > 0 && age < 121)) throw new RangeError("age must be between 1 and 120");
  return Math.round(formula === "fox" ? 220 - age : 208 - 0.7 * age);
}

/** Karvonen target: ((HRmax - HRrest) x intensity) + HRrest. Intensity is a fraction, for example 0.6. */
export function karvonenTarget(hrMax: number, hrRest: number, intensity: number): number {
  if (!(hrRest > 20 && hrRest < hrMax)) throw new RangeError("resting heart rate must be below the maximum");
  if (!(intensity > 0 && intensity <= 1)) throw new RangeError("intensity must be between 0 and 1");
  return Math.round((hrMax - hrRest) * intensity + hrRest);
}

export type ZoneBand = { label: string; low: number; high: number; lowBpm: number; highBpm: number };

/** The usual training zones by heart rate reserve (light, moderate, vigorous). */
export function heartRateZones(hrMax: number, hrRest: number): ZoneBand[] {
  const zones: [string, number, number][] = [
    ["Light (40 to 59 percent of reserve)", 0.4, 0.59],
    ["Moderate (60 to 79 percent of reserve)", 0.6, 0.79],
    ["Vigorous (80 to 89 percent of reserve)", 0.8, 0.89],
  ];
  return zones.map(([label, low, high]) => ({ label, low, high, lowBpm: karvonenTarget(hrMax, hrRest, low), highBpm: karvonenTarget(hrMax, hrRest, high) }));
}

export type WhrResult = { ratio: number; raised: boolean; threshold: number };

/** Waist to hip ratio. WHO 2008 thresholds for abdominal obesity: 0.90 or more in men, 0.85 or more in women. */
export function waistHipRatio(waist: number, hip: number, sex: "male" | "female"): WhrResult {
  if (!(waist > 20 && waist < 300 && hip > 20 && hip < 300)) throw new RangeError("waist and hip must be sensible measurements in centimetres");
  const ratio = Math.round((waist / hip) * 100) / 100;
  const threshold = sex === "male" ? 0.9 : 0.85;
  return { ratio, raised: waist / hip >= threshold, threshold };
}

/** Estimated one-repetition maximum. Reliable only for 10 repetitions or fewer; above that the estimate drifts. */
export function oneRepMax(weight: number, reps: number, formula: "epley" | "brzycki" = "epley"): number {
  if (!(weight > 0)) throw new RangeError("weight must be positive");
  if (!(Number.isInteger(reps) && reps >= 1 && reps <= 30)) throw new RangeError("repetitions must be a whole number from 1 to 30");
  if (reps === 1) return Math.round(weight * 10) / 10;
  const value = formula === "epley" ? weight * (1 + reps / 30) : (weight * 36) / (37 - reps);
  return Math.round(value * 10) / 10;
}

/** Load for a training percentage of the one-repetition maximum. */
export function loadAtPercent(oneRm: number, percent: number): number {
  if (!(oneRm > 0 && percent > 0 && percent <= 100)) throw new RangeError("invalid input");
  return Math.round(((oneRm * percent) / 100) * 10) / 10;
}

export type EnergyResult = { bmr: number; maintenance: number };
export const activityFactors = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, veryActive: 1.9 } as const;

/** Mifflin-St Jeor resting energy (kcal a day) and maintenance energy at an activity level. */
export function dailyEnergy(sex: "male" | "female", weightKg: number, heightCm: number, age: number, activity: keyof typeof activityFactors): EnergyResult {
  if (!(weightKg > 20 && weightKg < 400 && heightCm > 100 && heightCm < 250 && age >= 15 && age <= 120)) throw new RangeError("inputs outside the range the equation was built for (age 15 and over)");
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + (sex === "male" ? 5 : -161);
  return { bmr: Math.round(bmr), maintenance: Math.round(bmr * activityFactors[activity]) };
}

export type OutcomeMeasure = "nprs" | "rmdq" | "odi";
/** Published minimal important change for low back pain (Ostelo et al., Spine 2008): points and/or percent. Lower scores are better on all three. */
export const mic: Record<OutcomeMeasure, { label: string; max: number; points: number; percent: number }> = {
  nprs: { label: "Numeric pain rating (0 to 10)", max: 10, points: 2, percent: 30 },
  rmdq: { label: "Roland-Morris questionnaire (0 to 24)", max: 24, points: 5, percent: 30 },
  odi: { label: "Oswestry Disability Index (0 to 100)", max: 100, points: 10, percent: 30 },
};

export type ChangeResult = { change: number; percent: number; improved: boolean; worsened: boolean; important: boolean };

/** Change between two scores and whether it reaches the minimal important change (in points, or in percent of the baseline). */
export function outcomeChange(measure: OutcomeMeasure, baseline: number, followUp: number): ChangeResult {
  const spec = mic[measure];
  if (!(baseline >= 0 && baseline <= spec.max && followUp >= 0 && followUp <= spec.max)) throw new RangeError(`scores must be between 0 and ${spec.max}`);
  const change = Math.round((followUp - baseline) * 10) / 10;
  const percent = baseline === 0 ? 0 : Math.round((change / baseline) * 1000) / 10;
  const improved = change < 0;
  const size = Math.abs(change);
  const sizePercent = Math.abs(percent);
  return { change, percent, improved, worsened: change > 0, important: size >= spec.points || (baseline > 0 && sizePercent >= spec.percent) };
}
