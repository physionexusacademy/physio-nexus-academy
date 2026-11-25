/**
 * Agreement statistics for the posture validation study (docs/posture-validation.md): how closely the phone screen agrees with a reference measurement
 * (a goniometer, an inclinometer, or a plumb-line photograph measured on a computer), and how repeatable it is.
 * Pure functions; scripts/validate-posture.ts checks them against published worked examples.
 */
const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
const sd = (xs: number[]) => {
  const m = mean(xs);
  return Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1));
};

export type Agreement = {
  n: number;
  /** mean of (app - reference): a positive bias means the app reads higher */
  bias: number;
  sdDiff: number;
  /** 95 percent limits of agreement: bias plus or minus 1.96 standard deviations (Bland and Altman 1986) */
  lower: number;
  upper: number;
  /** mean absolute error */
  mae: number;
  /** Pearson correlation of the two methods (shown for completeness; agreement matters more than correlation) */
  r: number;
  /** the share of pairs whose absolute difference is within the stated tolerance */
  withinTolerance: number | null;
};

export function agreement(app: number[], reference: number[], tolerance?: number): Agreement {
  if (app.length !== reference.length) throw new RangeError("the two lists must be the same length");
  if (app.length < 3) throw new RangeError("at least 3 pairs are needed");
  const diffs = app.map((a, i) => a - reference[i]);
  const bias = mean(diffs);
  const sdDiff = sd(diffs);
  const ma = mean(app), mr = mean(reference);
  const num = app.reduce((s, a, i) => s + (a - ma) * (reference[i] - mr), 0);
  const den = Math.sqrt(app.reduce((s, a) => s + (a - ma) ** 2, 0) * reference.reduce((s, b) => s + (b - mr) ** 2, 0));
  return {
    n: app.length,
    bias,
    sdDiff,
    lower: bias - 1.96 * sdDiff,
    upper: bias + 1.96 * sdDiff,
    mae: mean(diffs.map(Math.abs)),
    r: den === 0 ? NaN : num / den,
    withinTolerance: tolerance === undefined ? null : diffs.filter((d) => Math.abs(d) <= tolerance).length / diffs.length,
  };
}

/**
 * Intraclass correlation from a table of n subjects (rows) by k measurements (columns: raters, methods or repeated captures) (Shrout and Fleiss 1979):
 *   icc21: two-way random effects, absolute agreement, single measurement (use when the methods or raters are a sample of all possible ones);
 *   icc31: two-way mixed effects, consistency, single measurement.
 */
export function icc(table: number[][]): { icc21: number; icc31: number } {
  const n = table.length;
  const k = table[0]?.length ?? 0;
  if (n < 2 || k < 2 || table.some((row) => row.length !== k)) throw new RangeError("a rectangular table of at least 2 by 2 is needed");
  const grand = mean(table.flat());
  const rowMeans = table.map(mean);
  const colMeans = Array.from({ length: k }, (_, j) => mean(table.map((row) => row[j])));
  const ssRows = k * rowMeans.reduce((s, m) => s + (m - grand) ** 2, 0);
  const ssCols = n * colMeans.reduce((s, m) => s + (m - grand) ** 2, 0);
  const ssTotal = table.flat().reduce((s, v) => s + (v - grand) ** 2, 0);
  const ssError = ssTotal - ssRows - ssCols;
  const msr = ssRows / (n - 1);
  const msc = ssCols / (k - 1);
  const mse = ssError / ((n - 1) * (k - 1));
  return {
    icc21: (msr - mse) / (msr + (k - 1) * mse + (k * (msc - mse)) / n),
    icc31: (msr - mse) / (msr + (k - 1) * mse),
  };
}

/** Repeatability from two captures of the same people: the standard error of measurement and the smallest change that is more than measurement error (95 percent). */
export function repeatability(first: number[], second: number[]): { sem: number; mdc95: number } {
  if (first.length !== second.length || first.length < 3) throw new RangeError("at least 3 matching pairs are needed");
  const diffs = first.map((a, i) => a - second[i]);
  const sem = sd(diffs) / Math.SQRT2;
  return { sem, mdc95: 1.96 * Math.SQRT2 * sem };
}
