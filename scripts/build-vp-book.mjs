/**
 * Virtual Patient from the book: for every condition chapter of "The Complete Physiotherapy Clinical Mastery" (content/book/chapters,
 * the same text as the Conditions & Treatment Guide) this writes public/virtual-patient/book/<slug>.json with the chapter's own words:
 *   case (N), special tests (E), red flags (G), manual therapy plan (I), exercise prescription (J) and physical modalities (K),
 * plus, for each treatment row, which 3D demonstration the PNA Teacher uses for it (`anim`), and the RehabVerse 3D exercises whose names
 * appear in the exercise prescription. public/virtual-patient/book/index.json lists the patients for the waiting room.
 * Static files: the browser fetches them, the Cloudflare Worker never carries them.
 *   node scripts/build-vp-book.mjs          (write)
 *   node scripts/build-vp-book.mjs --check  (fail if the files are stale)
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const CH = path.join(root, "content/book/chapters");
const OUT = path.join(root, "public/virtual-patient/book");
const check = process.argv.includes("--check");

/* Book slug and area of each chapter (content/book/map.ts, read as text so no TypeScript loader is needed). */
const mapText = fs.readFileSync(path.join(root, "content/book/map.ts"), "utf8");
const places = [...mapText.matchAll(/\{ file: "(v\d+c\d+)", kind: "condition", slug: "([a-z0-9-]+)", area: "([a-z-]+)"/g)].map((m) => ({ file: m[1], slug: m[2], area: m[3] }));

const clean = (s) => String(s ?? "").replace(/\s+/g, " ").trim();
// the book's "[Ref – to verify]" marks are dropped: the author has checked every reference (November 2026)
const plain = (s) => clean(clean(s).replace(/\s*\(?\[Ref\s*[–-]\s*to verify[^\]]*\]\)?/gi, "").replace(/\s*\[Ref\s*$/i, "").replace(/^\s*[–-]\s*to verify[^\]]*\]\s*/i, "")).replace(/\*\*/g, ""); // (a mark the PDF split across two table cells too)

/* Which 3D demonstration fits a treatment row (keywords; the row's own words are what he says). */
function animFor(text) {
  const t = text.toLowerCase();
  if (/injection|acupuncture|dry needling|surgery|surgical|medication|drug/.test(t)) return "talk";
  if (/interferential/.test(t)) return "ift";
  if (/tens|electrical nerve/.test(t)) return "tens";
  if (/neuromuscular electrical|nmes|electrical stimulation/.test(t)) return "nmes";
  if (/ultrasound|laser|shockwave|shortwave|diathermy/.test(t)) return "ultrasound";
  if (/ice|cold|cryo|frozen bottle/.test(t)) return "icepack";
  if (/heat|warm|hot pack|thermal/.test(t)) return "hotpack";
  if (/traction|distraction/.test(t)) return "distraction";
  if (/tap(e|ing)|brace|bracing|collar|belt|orthos|splint|insole|heel lift|support|compression|elevation|sling|boot|crutch/.test(t)) return "support";
  if (/neural|nerve|slider|neurodynamic/.test(t)) return "slider";
  if (/soft[- ]tissue|massage|friction|myofascial|trigger|release|lymphatic/.test(t)) return "massage";
  if (/stretch|muscle energy|contract-relax|pnf/.test(t)) return "stretch";
  if (/mobili[sz]|glide|snag|nag|mwm|mulligan|maitland|pa |manipulat|thrust|joint|mobility/.test(t)) return "mobilise";
  return "talk";
}

/* RehabVerse 3D exercises named in the exercise prescription. Order: as the book lists them. */
const EX = [
  [/diaphragmatic breathing|breathing control|abdominal breathing|tummy breathing/, "diaphragmatic-breathing"], [/pursed[- ]lip/, "pursed-lip-breathing"],
  [/thoracic expansion|deep breathing exercise|chest expansion/, "thoracic-expansion-arm-raise"],
  [/pelvic floor (muscle )?(training|exercise|contraction)|kegel|pfmt/, "pelvic-floor-lying"],
  [/(?<!quadruped )weight[- ]shift/, "standing-weight-shift"], [/functional reach test|functional reach\b(?!ing)|forward reach(ing)? in standing/, "functional-reach"],
  [/seated marching|marching in sitting/, "seated-marching"], [/reach(ing)? across|reaching tasks in sitting|trunk control in sitting|sitting balance/, "seated-reach-across"],
  [/forward lean|nose over toes|trunk forward lean/, "sit-forward-lean"],
  [/chin tuck with head lift|head lift/, "chin-tuck-head-lift"], [/chin tuck|retraction/, "chin-tuck"], [/craniocervical|deep neck flexor|\bnod(s|ding)?\b/, "supine-nod"],
  [/scapular (retraction|setting|squeeze)|shoulder blade squeeze|scapular squeeze/, "shoulder-blade-squeeze"], [/\brows?\b|\browing\b/, "seated-band-row"],
  [/neck rotation|cervical rotation/, "neck-rotation"], [/neck side bend|side flexion of the neck|lateral flexion/, "neck-side-bend"],
  [/upper trapezius stretch/, "upper-trapezius-stretch"], [/levator/, "levator-scapulae-stretch"], [/scalene/, "scalene-stretch"],
  [/pendulum|codman/, "codman-pendulum"], [/wand|assisted (shoulder )?flexion|stick/, "wand-flexion"], [/wall angel|wall slide/, "wall-angel"],
  [/side-?lying external rotation/, "sidelying-external-rotation"], [/(band(ed)?|resisted|isometric|cable) external( and internal)? rotation|external rotation (strength\w*|with (a )?band|exercise|at 0)/, "band-external-rotation"], [/(band(ed)?|resisted|isometric|cable) (external and )?internal rotation|internal rotation (strength\w*|with (a )?band|exercise)/, "band-internal-rotation"],
  [/scaption|full can/, "scaption-full-can"], [/cross-body|cross body|posterior capsule stretch|sleeper/, "cross-body-shoulder-stretch"], [/lateral raise|abduction raise/, "lateral-raise"], [/front raise/, "front-raise"],
  [/eccentric wrist extension|wrist extensor (loading|strength)|isometric wrist extension/, "eccentric-wrist-extension"], [/eccentric wrist flexion|wrist flexor (loading|strength)/, "eccentric-wrist-flexion"],
  [/wrist flexor stretch/, "wrist-flexor-stretch"], [/wrist extensor stretch/, "wrist-extensor-stretch"], [/tendon glid/, "tendon-glides"], [/grip/, "grip-squeeze"],
  [/biceps curl/, "biceps-curl"], [/triceps/, "triceps-band-pushdown"], [/median nerve/, "median-nerve-glide"], [/supination|pronation|forearm rotation/, "forearm-rotation"],
  [/wrist (range|bend|flexion and extension|active range)/, "wrist-flexion-extension"], [/radial and ulnar deviation|wrist deviation/, "wrist-deviation"],
  [/clam/, "clamshell"], [/side-?lying hip abduction/, "sidelying-hip-abduction"], [/prone hip extension/, "prone-hip-extension"], [/standing hip abduction|hip abduction/, "standing-hip-abduction"],
  [/standing hip extension/, "standing-hip-extension"], [/hip hinge|deadlift/, "hip-hinge"], [/figure-?4|piriformis/, "figure-4-stretch"], [/hip flexor stretch/, "hip-flexor-stretch-edge"],
  [/adductor (squeeze|ball)/, "adductor-ball-squeeze"], [/hamstring stretch/, "supine-hamstring-stretch"], [/single-leg bridge/, "single-leg-bridge"], [/bridge/, "glute-bridge"],
  [/dead bug/, "dead-bug"], [/bird-?dog/, "bird-dog"], [/plank/, "front-plank"], [/knee[- ]to[- ]chest/, "knee-to-chest"], [/knee rock|lumbar rotation/, "knee-rock"],
  [/curl-?up/, "mcgill-curl-up"], [/supine marching|marching lying/, "supine-marching"], [/prone on elbows|press-?up|extension in lying|mckenzie/, "prone-on-elbows"],
  [/cat-?camel|cat and camel/, "cat-camel"], [/open book/, "open-book"], [/thoracic rotation|trunk rotation/, "seated-thoracic-rotation"], [/thoracic extension/, "thoracic-extension-chair"],
  [/quad(riceps)? set/, "quad-set"], [/heel slide/, "heel-slide"], [/straight[- ]leg raise|slr/, "straight-leg-raise"], [/short[- ]arc/, "short-arc-quad"],
  [/seated knee extension|knee extension in sitting/, "seated-knee-extension"], [/wall squat|wall sit/, "wall-squat"], [/mini[- ]squat|squat/, "mini-squat"],
  [/terminal knee extension/, "terminal-knee-extension"], [/prone hamstring curl/, "prone-hamstring-curl"], [/hamstring curl/, "standing-hamstring-curl"], [/step-?up/, "step-up"],
  [/sit[- ]to[- ]stand|chair rise/, "sit-to-stand"], [/ankle pump|\bpumps\b/, "ankle-pumps"], [/ankle (circle|alphabet)|alphabet/, "ankle-circles"], [/calf stretch|gastrocnemius stretch|soleus stretch/, "supine-calf-stretch"],
  [/single[- ]leg (calf|heel) raise/, "single-heel-raise"], [/eccentric heel drop|alfredson/, "eccentric-heel-drop"], [/(calf|heel) raises?(?! insert)/, "double-heel-raise"], [/toe raise/, "toe-raise"],
  [/towel (scrunch|curl)|toe curl|short foot/, "towel-scrunch"], [/eversion/, "ankle-eversion-band"], [/inversion/, "ankle-inversion-band"], [/single[- ]leg (stand|stance|balance)|balance/, "single-leg-stance"],
  [/single[- ]leg (reach|deadlift)|reach on one leg|reach drills|star excursion|y-balance/, "single-leg-reach"], [/tandem/, "tandem-stance"], [/marching/, "marching"], [/side bend/, "standing-side-bend"],
];
function exercisesIn(text) {
  const t = ` ${text.toLowerCase()} `;
  const hits = [];
  for (const [re, id] of EX) {
    const g = new RegExp(re.source, "g");
    for (const m of t.matchAll(g)) {
      // a movement named as something to avoid ("avoid ... internal rotation", "no squatting") is a precaution, not an exercise
      const before = t.slice(Math.max(0, m.index - 60), m.index);
      if (/\b(avoid|avoiding|no|not|never|without|contraindicat\w*|precautions?)\b[^.;|]*$/.test(before)) continue;
      const after = t.slice(m.index + m[0].length, m.index + m[0].length + 30);
      if (/^[^.;|]*\b(degrees?|test)\b/.test(after) || /\bdegrees?\s*$/.test(before)) continue;
      if (!hits.some((h) => h.id === id)) hits.push({ id, at: m.index });
      break;
    }
  }
  return hits.sort((a, b) => a.at - b.at).map((h) => h.id);
}

const rowsOf = (blocks, test) => blocks.filter((b) => b.t === "table" && test(b.rows[0].map((c) => clean(c).toLowerCase()))).flatMap((b) => b.rows.slice(1).map((r) => ({ head: b.rows[0].map(clean), cells: r.map(plain) })));
const textOf = (blocks) => blocks.flatMap((b) => (b.t === "p" ? [plain(b.text)] : b.t === "callout" ? (Array.isArray(b.body) ? b.body.map(plain) : [plain(b.text ?? b.body ?? "")]) : b.t === "ul" || b.t === "ol" ? b.items.map(plain) : [])).filter(Boolean);

function chapter(place) {
  const d = JSON.parse(fs.readFileSync(path.join(CH, `${place.file}.json`), "utf8"));
  const S = Object.fromEntries(d.sections.map((s) => [s.key, s.blocks ?? []]));
  /* E: special tests — a heading followed by an Item/Detail table, or rows of a Test table. */
  const tests = [];
  const E = S.E ?? [];
  for (let i = 0; i < E.length; i++) {
    const b = E[i];
    if (b.t === "h" && E[i + 1]?.t === "table" && clean(E[i + 1].rows[0][0]).toLowerCase() === "item") {
      const fields = Object.fromEntries(E[i + 1].rows.slice(1).map((r) => [clean(r[0]), plain(r[1])]));
      tests.push({ name: plain(b.text).replace(/^E\d+\.\s*/, ""), fields });
    } else if (b.t === "table" && /^test$/i.test(clean(b.rows[0][0]))) {
      for (const r of b.rows.slice(1)) tests.push({ name: plain(r[0]), fields: Object.fromEntries(b.rows[0].slice(1).map((h, k) => [clean(h), plain(r[k + 1])])) });
    }
  }
  /* G: red flags. */
  const redFlags = rowsOf(S.G ?? [], (h) => h[0] === "finding").map(({ head, cells }) => Object.fromEntries(head.map((h, k) => [h, cells[k]])));
  /* I: manual therapy rows and the preferred starting choice. */
  const manual = rowsOf(S.I ?? [], (h) => h[0] === "technique").map(({ cells }) => ({ name: cells[0], why: cells[1], finding: cells[2], application: cells[3], stop: cells[4], anim: animFor(cells[0]) })).filter((r) => r.name);
  const manualNotes = textOf(S.I ?? []);
  /* J: exercise prescription rows and principles. */
  const exercise = rowsOf(S.J ?? [], () => true).map(({ head, cells }) => Object.fromEntries(head.map((h, k) => [h, cells[k]])));
  const exerciseNotes = textOf(S.J ?? []);
  // Some chapters write the exercise prescription inside I ("I to J. Exercise prescription", "I to K. Treatment"): read I there too.
  const iTitle = d.sections.find((s) => s.key === "I")?.title ?? "";
  const iHoldsExercise = !S.J && /\bto [JK]\b|exercise/i.test(iTitle);
  const iText = iHoldsExercise ? [...rowsOf(S.I ?? [], () => true).map(({ cells }) => cells.join(" ")), ...manualNotes] : [];
  const exercises3d = exercisesIn([...exercise.map((r) => Object.values(r).join(" ")), ...exerciseNotes, ...iText].join(" | "));
  /* K: modalities with the book's "Indicated?" verdict. */
  const modalities = rowsOf(S.K ?? [], (h) => h[0] === "modality").map(({ cells }) => ({ name: cells[0], indicated: cells[1], comment: cells[2], anim: animFor(cells[0]) }));
  const modalityNotes = textOf(S.K ?? []);
  /* H and L: the decision pathway and management pathway (education and referral lines). */
  const pathway = [...textOf(S.H ?? []), ...textOf(S.L ?? [])];
  /* F: differential diagnosis (conditions to tell apart). */
  const differentials = rowsOf(S.F ?? [], (h) => h[0] === "condition").map(({ cells }) => ({ name: cells[0], key: cells[1], next: cells[3] ?? "" })).filter((r) => r.name);
  /* N: the case. */
  const N = S.N ?? [];
  const caseText = textOf(N.filter((b) => b.t === "p" || b.t === "callout"));
  const qa = N.filter((b) => b.t === "ol").flatMap((b) => b.items.map(plain));
  // A chapter with questions only: its first vignette question is the case.
  if (!caseText.length) {
    const vignette = qa.find((q) => /\d+-year-old/.test(q));
    if (vignette) caseText.push(vignette.replace(/\?\s.*$/, "?").replace(/ What do you suspect\?$/, ""));
  }
  // No case at all: the chapter's own presentation (Section B) stands in, labelled as such.
  if (!caseText.length) {
    const presentation = textOf(S.B ?? []).slice(0, 2).join(" ");
    if (presentation) caseText.push(`Presentation (from the chapter): ${presentation}`);
    else {
      const rows = rowsOf(S.B ?? [], () => true).slice(0, 4).map(({ cells }) => cells.filter(Boolean).join(": "));
      const intro = rows.length ? rows.join(". ") : plain(d.lead ?? "") || textOf(S.A ?? []).slice(0, 2).join(" ");
      if (intro) caseText.push(`Presentation (from the chapter): ${intro}`);
    }
  }
  const caseAll = caseText.join(" ");
  const workingRaw = (/Working diagnosis:\s*([^.]*(?:\.[0-9][^.]*)*)\./i.exec(caseAll)?.[1] ?? "").trim();
  const plan = ((/Plan:\s*(.*?)(?=$)/i.exec(caseAll)?.[1] ?? "").replace(/\s*(Questions and answers).*$/i, "").trim()) || (manualNotes.find((n) => /preferred starting choice/i.test(n)) ?? "").replace(/^Preferred starting choice:\s*/i, "") || (textOf(S.L ?? [])[0] ?? "");
  const working = workingRaw || plain(d.title);
  const firstLeft = caseAll.search(/\bleft\b/i);
  const firstRight = caseAll.search(/\bright\b/i);
  const side = firstLeft >= 0 && (firstRight < 0 || firstLeft < firstRight) ? "left" : "right";
  const age = Number(/(\d{1,3})-year-old/.exec(caseAll)?.[1] ?? 0) || null;
  const female = /\b(woman|female|she|her|girl|mother|lady)\b/i.test(caseAll);
  /* Each test's result in this case, from the case text: positive or negative when the case says so; otherwise not recorded. */
  const lower = caseAll.toLowerCase();
  const STOP = new Set(["test", "tests", "sign", "with", "from", "the", "and", "for", "screen", "manoeuvre", "maneuver", "measure", "assessment"]);
  const keysOf = (name) => {
    const n = name.toLowerCase();
    const abbr = [...n.matchAll(/\(([a-z0-9-]{2,8})\)/g)].map((m) => [m[1]]);
    const words = n.replace(/\(.*?\)/g, " ").replace(/[^a-z0-9' -]/g, " ").split(/[\s-]+/).filter((w) => w.length > 3 && !STOP.has(w));
    return [...abbr, words.slice(0, 2), words.slice(0, 1)].filter((k) => k.length && k.join("").length >= 3);
  };
  const POS = /\bpositive\b|reproduc|provok|increases (it|the|her|his)|is painful|painful|limited|reduced|weak|apprehension|clunk|gap/;
  const NEG = /\bnegative\b|\bnormal\b|no pain|does not|did not|full and pain-free|intact/;
  for (const t of tests) {
    let result = "not-recorded";
    search: for (const keys of keysOf(t.name)) {
      for (const sentence of lower.split(/(?<=[.;])\s+/)) {
        const at = keys.every((w) => new RegExp(`\\b${w.replace(/[^a-z0-9]/g, "")}`).test(sentence)) ? sentence.indexOf(keys[0]) : -1;
        if (at < 0) continue;
        const near = sentence.slice(Math.max(0, at - 50), at + 90);
        if (NEG.test(near) && !/\bpositive\b/.test(near)) result = "negative";
        else if (POS.test(near)) result = "positive";
        if (result !== "not-recorded") break search;
      }
    }
    t.result = result;
  }
  return {
    v: 1,
    slug: place.slug,
    area: place.area,
    title: plain(d.title),
    ch: place.file,
    lead: plain(d.lead ?? ""),
    case: caseText,
    working,
    plan,
    side,
    age,
    female,
    differentials,
    qa,
    tests,
    redFlags,
    manual,
    manualNotes,
    exercise,
    exerciseNotes,
    exercises3d,
    modalities,
    modalityNotes,
    pathway: pathway.slice(0, 8),
  };
}

const files = new Map();
const index = [];
for (const place of places) {
  const data = chapter(place);
  files.set(`${place.slug}.json`, JSON.stringify(data));
  index.push({ slug: data.slug, title: data.title, area: data.area, ch: data.ch, case: data.case[0] ?? "", tests: data.tests.length, exercises3d: data.exercises3d.length });
}
files.set("index.json", JSON.stringify({ v: 1, count: index.length, patients: index }));

const declared = Number(/VP_BOOK_COUNT = (\d+)/.exec(fs.readFileSync(path.join(root, "src/lib/virtual-patient/links.ts"), "utf8"))?.[1]);
if (declared !== index.length) {
  console.error(`VP_BOOK_COUNT in src/lib/virtual-patient/links.ts is ${declared}, but the book has ${index.length} condition chapters.`);
  process.exit(1);
}
for (const p of index) {
  if (!p.case) { console.error(`${p.slug}: no clinical case (Section N)`); process.exit(1); }
}
if (check) {
  const stale = [...files].filter(([name, body]) => !fs.existsSync(path.join(OUT, name)) || fs.readFileSync(path.join(OUT, name), "utf8") !== body);
  if (stale.length) {
    console.error(`Virtual Patient book data is stale (${stale.length} files): run node scripts/build-vp-book.mjs`);
    process.exit(1);
  }
  console.log(`Virtual Patient book data fresh: ${index.length} patients.`);
} else {
  fs.mkdirSync(OUT, { recursive: true });
  for (const [name, body] of files) fs.writeFileSync(path.join(OUT, name), body);
  const noEx = index.filter((p) => !p.exercises3d).map((p) => p.slug);
  console.log(`Wrote ${index.length} book patients to public/virtual-patient/book (${[...files.values()].reduce((n, b) => n + b.length, 0)} bytes).`);
  if (noEx.length) console.log(`Chapters with no matching 3D exercise: ${noEx.join(", ")}`);
}
