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
const plain = (s) => clean(s).replace(/\*\*/g, "");

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
  [/chin tuck with head lift|head lift/, "chin-tuck-head-lift"], [/chin tuck|retraction/, "chin-tuck"], [/craniocervical|deep neck flexor|nod/, "supine-nod"],
  [/scapular (retraction|setting|squeeze)|shoulder blade squeeze|scapular squeeze/, "shoulder-blade-squeeze"], [/row/, "seated-band-row"],
  [/neck rotation|cervical rotation/, "neck-rotation"], [/neck side bend|side flexion of the neck|lateral flexion/, "neck-side-bend"],
  [/upper trapezius stretch/, "upper-trapezius-stretch"], [/levator/, "levator-scapulae-stretch"], [/scalene/, "scalene-stretch"],
  [/pendulum|codman/, "codman-pendulum"], [/wand|assisted (shoulder )?flexion|stick/, "wand-flexion"], [/wall angel|wall slide/, "wall-angel"],
  [/side-?lying external rotation/, "sidelying-external-rotation"], [/external rotation/, "band-external-rotation"], [/internal rotation/, "band-internal-rotation"],
  [/scaption|full can/, "scaption-full-can"], [/cross-body|cross body|posterior capsule stretch|sleeper/, "cross-body-shoulder-stretch"], [/lateral raise|abduction raise/, "lateral-raise"], [/front raise/, "front-raise"],
  [/eccentric wrist extension|wrist extensor (loading|strength)|isometric wrist extension/, "eccentric-wrist-extension"], [/eccentric wrist flexion|wrist flexor (loading|strength)/, "eccentric-wrist-flexion"],
  [/wrist flexor stretch/, "wrist-flexor-stretch"], [/wrist extensor stretch/, "wrist-extensor-stretch"], [/tendon glid/, "tendon-glides"], [/grip/, "grip-squeeze"],
  [/biceps curl/, "biceps-curl"], [/triceps/, "triceps-band-pushdown"], [/median nerve/, "median-nerve-glide"], [/supination|pronation|forearm rotation/, "forearm-rotation"],
  [/wrist (range|bend|flexion and extension|active range)/, "wrist-flexion-extension"], [/radial and ulnar deviation|wrist deviation/, "wrist-deviation"],
  [/clam/, "clamshell"], [/side-?lying hip abduction/, "sidelying-hip-abduction"], [/prone hip extension/, "prone-hip-extension"], [/standing hip abduction|hip abduction/, "standing-hip-abduction"],
  [/standing hip extension/, "standing-hip-extension"], [/hip hinge|deadlift/, "hip-hinge"], [/figure-?4|piriformis/, "figure-4-stretch"], [/hip flexor stretch/, "hip-flexor-stretch-edge"],
  [/adductor (squeeze|ball)/, "adductor-ball-squeeze"], [/hamstring stretch/, "supine-hamstring-stretch"], [/single-leg bridge/, "single-leg-bridge"], [/bridge/, "glute-bridge"],
  [/dead bug/, "dead-bug"], [/bird-?dog/, "bird-dog"], [/plank/, "front-plank"], [/knee[- ]to[- ]chest/, "knee-to-chest"], [/knee rock|lumbar rotation|trunk rotation/, "knee-rock"],
  [/curl-?up/, "mcgill-curl-up"], [/supine marching|marching lying/, "supine-marching"], [/prone on elbows|press-?up|extension in lying|mckenzie/, "prone-on-elbows"],
  [/cat-?camel|cat and camel/, "cat-camel"], [/open book/, "open-book"], [/thoracic rotation/, "seated-thoracic-rotation"], [/thoracic extension/, "thoracic-extension-chair"],
  [/quad(riceps)? set/, "quad-set"], [/heel slide/, "heel-slide"], [/straight[- ]leg raise|slr/, "straight-leg-raise"], [/short[- ]arc/, "short-arc-quad"],
  [/seated knee extension|knee extension in sitting/, "seated-knee-extension"], [/wall squat|wall sit/, "wall-squat"], [/mini[- ]squat|squat/, "mini-squat"],
  [/terminal knee extension/, "terminal-knee-extension"], [/prone hamstring curl/, "prone-hamstring-curl"], [/hamstring curl/, "standing-hamstring-curl"], [/step-?up/, "step-up"],
  [/sit[- ]to[- ]stand|chair rise/, "sit-to-stand"], [/ankle pump|\bpumps\b/, "ankle-pumps"], [/ankle (circle|alphabet)|alphabet/, "ankle-circles"], [/calf stretch|gastrocnemius stretch|soleus stretch/, "supine-calf-stretch"],
  [/single[- ]leg (calf|heel) raise/, "single-heel-raise"], [/eccentric heel drop|heel drop|alfredson/, "eccentric-heel-drop"], [/(calf|heel) raise/, "double-heel-raise"], [/toe raise/, "toe-raise"],
  [/towel (scrunch|curl)|toe curl|short foot/, "towel-scrunch"], [/eversion/, "ankle-eversion-band"], [/inversion/, "ankle-inversion-band"], [/single[- ]leg (stand|stance|balance)|balance/, "single-leg-stance"],
  [/reach/, "single-leg-reach"], [/tandem/, "tandem-stance"], [/marching/, "marching"], [/side bend/, "standing-side-bend"],
];
function exercisesIn(text) {
  const t = ` ${text.toLowerCase()} `;
  const hits = [];
  for (const [re, id] of EX) {
    const m = re.exec(t);
    if (m && !hits.some((h) => h.id === id)) hits.push({ id, at: m.index });
  }
  return hits.sort((a, b) => a.at - b.at).map((h) => h.id);
}

const rowsOf = (blocks, test) => blocks.filter((b) => b.t === "table" && test(b.rows[0].map((c) => clean(c).toLowerCase()))).flatMap((b) => b.rows.slice(1).map((r) => ({ head: b.rows[0].map(clean), cells: r.map(plain) })));
const textOf = (blocks) => blocks.flatMap((b) => (b.t === "p" || b.t === "callout" ? [plain(b.text ?? b.items?.join(" "))] : b.t === "ul" || b.t === "ol" ? b.items.map(plain) : [])).filter(Boolean);

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
  const exercises3d = exercisesIn(exercise.map((r) => Object.values(r).join(" ")).join(" | "));
  /* K: modalities with the book's "Indicated?" verdict. */
  const modalities = rowsOf(S.K ?? [], (h) => h[0] === "modality").map(({ cells }) => ({ name: cells[0], indicated: cells[1], comment: cells[2], anim: animFor(cells[0]) }));
  const modalityNotes = textOf(S.K ?? []);
  /* H and L: the decision pathway and management pathway (education and referral lines). */
  const pathway = [...textOf(S.H ?? []), ...textOf(S.L ?? [])];
  /* N: the case. */
  const N = S.N ?? [];
  const caseText = textOf(N.filter((b) => b.t === "p" || b.t === "callout"));
  const qa = N.filter((b) => b.t === "ol").flatMap((b) => b.items.map(plain));
  return {
    v: 1,
    slug: place.slug,
    area: place.area,
    title: plain(d.title),
    ch: place.file,
    lead: plain(d.lead ?? ""),
    case: caseText,
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
