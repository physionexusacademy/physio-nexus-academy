import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

/**
 * The one language switch (English / Roman Urdu): every place and wing of the campus map (header menus, mobile menu, footer, search) has a
 * Roman Urdu text, the shell's own words have both languages, and every Skills Lab concept has a Roman Urdu explanation (it is the main text
 * when the visitor chooses Roman Urdu).
 */
const { academyWings, skillPlaces, popularLessons } = await import("../src/lib/academy-map.ts");
const { WING_UR, PLACE_UR, SHELL_TEXT, localizePlace, localizeWing } = await import("../src/lib/shell-ur.ts");

/** descriptions that are a name, the same in both languages */
const NAME_ONLY = new Set(["/founder"]);
const problems: string[] = [];
for (const wing of academyWings) {
  const ur = WING_UR[wing.id];
  if (!ur || !ur.label || !ur.tagline || !ur.intro) problems.push(`wing ${wing.id}: no Roman Urdu`);
  for (const place of wing.places) {
    const entry = PLACE_UR[place.href];
    if (!entry || !entry.description) problems.push(`place ${place.href}: no Roman Urdu description`);
    else if (entry.description === place.description && !NAME_ONLY.has(place.href)) problems.push(`place ${place.href}: the "Roman Urdu" description is the English one`);
  }
}
for (const href of Object.keys(PLACE_UR)) if (!academyWings.some((wing) => wing.places.some((place) => place.href === href))) problems.push(`PLACE_UR has ${href}, which is not on the campus map`);
for (const [key, value] of Object.entries(SHELL_TEXT)) if (!value.en || !value.ur) problems.push(`shell text ${key}: missing a language`);

// the helpers leave English alone and translate Roman Urdu
const sample = academyWings[0].places[0];
assert.equal(localizePlace(sample, "en").description, sample.description);
assert.notEqual(localizePlace(sample, "ur").description, sample.description);
assert.equal(localizeWing(academyWings[0], "en").label, academyWings[0].label);
assert.notEqual(localizeWing(academyWings[1], "ur").tagline, academyWings[1].tagline);
assert.ok(skillPlaces.length > 0 && popularLessons.length > 0);

// Skills Lab concepts
const dir = path.join(process.cwd(), "public/skills-data");
let concepts = 0;
for (const file of fs.readdirSync(dir).filter((name) => name.endsWith(".json"))) {
  const data = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
  for (const concept of data.concepts ?? []) {
    concepts++;
    if (!concept.ur || concept.ur.length < 60 || (concept.body && concept.ur.length < concept.body.length * 0.4)) problems.push(`skill ${file} concept ${concept.id}: no Roman Urdu explanation, or one far shorter than the English (it is the main text in Roman Urdu)`);
  }
}

if (problems.length) {
  console.error(`Language switch: ${problems.length} problem(s)\n - ` + problems.join("\n - "));
  process.exit(1);
}
console.log(`Language switch checks passed (${academyWings.length} wings, ${Object.keys(PLACE_UR).length} places, ${Object.keys(SHELL_TEXT).length} shell texts, ${concepts} Skills Lab concepts, all with Roman Urdu).`);
