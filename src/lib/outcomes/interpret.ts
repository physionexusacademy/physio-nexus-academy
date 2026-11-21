import type { Instrument, Interpretation, Score } from "./types.ts";

/**
 * What a change between two scores means, with the threshold and its source written beside the result. These are guides drawn from the published literature,
 * never a verdict: a physiotherapist reads them with the patient. Nothing here is built for the clinician-measured tests (no validated threshold is claimed).
 */
const NOT_COMPARABLE = (basis: string): Interpretation => ({ band: "not_comparable", improvement: null, percent: null, basis });
const r1 = (n: number) => Math.round(n * 10) / 10;

export function interpretChange(instrument: Instrument, earlier: Score | null, later: Score): Interpretation {
  const id = instrument.id;

  if (id === "groc") {
    const v = later.primary ?? 0;
    const band = v >= 6 ? "much_better" : v >= 4 ? "better" : v <= -6 ? "much_worse" : v <= -4 ? "worse" : "no_important_change";
    return { band, improvement: v, percent: null, basis: "Bands follow Jaeschke 1989: 1 to 3 small, 4 to 5 moderate, 6 to 7 large. Studies differ on where an important change starts (+3, +4 or +5): state the one your protocol uses." };
  }

  if (!earlier || earlier.primary === null || later.primary === null) return NOT_COMPARABLE("There is no earlier score to compare with.");

  if (id === "nprs") {
    const improvement = r1(earlier.primary - later.primary);
    const percent = earlier.primary > 0 ? r1((improvement / earlier.primary) * 100) : null;
    const basis = "Important change: at least 2 points and 30% of the starting score; 50% or more is substantial (IMMPACT consensus, Dworkin 2008; Farrar 2001). A guide, not a verdict.";
    let band: Interpretation["band"] = "no_important_change";
    if (improvement >= 2 && (percent === null || percent >= 30)) band = percent !== null && percent >= 50 ? "much_better" : "better";
    else if (improvement <= -2 && (percent === null || percent <= -30)) band = percent !== null && percent <= -50 ? "much_worse" : "worse";
    return { band, improvement, percent, basis };
  }

  if (id === "psfs") {
    const improvement = r1(later.primary - earlier.primary);
    const band = improvement >= 2 ? "better" : improvement <= -2 ? "worse" : "no_important_change";
    return { band, improvement, percent: null, basis: "A change of about 2 points on the average of the activities is beyond measurement error (Stratford 1995; Abbott and Schmitt 2014). A guide, not a verdict." };
  }

  if (id === "rmdq24") {
    const improvement = r1(earlier.primary - later.primary);
    const percent = earlier.primary > 0 ? r1((improvement / earlier.primary) * 100) : null;
    const better = improvement >= 2 && percent !== null && percent >= 30;
    const worse = improvement <= -2 && percent !== null && percent <= -30;
    return { band: better ? (percent! >= 50 ? "much_better" : "better") : worse ? (percent! <= -50 ? "much_worse" : "worse") : "no_important_change", improvement, percent, basis: "At least 30% improvement from the starting score is a commonly used threshold (Ostelo 2008). To be confirmed against the study protocol." };
  }

  return NOT_COMPARABLE("No validated threshold is built in for this measure: judge the change clinically.");
}

/** For the physiotherapist-measured tests: the signed improvement of one field (positive = better) given which direction is better. */
export function measureImprovement(better: "higher" | "lower", earlier: number, later: number): number {
  return r1(better === "higher" ? later - earlier : earlier - later);
}
