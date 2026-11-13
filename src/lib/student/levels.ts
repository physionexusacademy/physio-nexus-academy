/** Student levels, shared by the homepage Student Pass and the My PNA dashboard. */
export const levels = [
  { name: "New Student", min: 0 },
  { name: "Rising Clinician", min: 100 },
  { name: "Case Solver", min: 400 },
  { name: "Clinical Master", min: 1000 },
  { name: "Clinical Legend", min: 2500 },
];

export function levelFor(xp: number) {
  const current = [...levels].reverse().find((level) => xp >= level.min) ?? levels[0];
  const next = levels.find((level) => level.min > xp) ?? null;
  const percent = next ? Math.round(((xp - current.min) / (next.min - current.min)) * 100) : 100;
  return { current, next, percent, toNext: next ? Math.max(0, next.min - xp) : 0, index: levels.indexOf(current) };
}
