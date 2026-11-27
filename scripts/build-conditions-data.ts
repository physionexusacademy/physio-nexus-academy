/**
 * Builds the Conditions & Treatment Guide from the owner's book, "The Complete Physiotherapy Clinical Mastery" (Dr. Sajjad Raza PT).
 *
 * Source (committed, extracted word for word from the PDF by scripts/book/extract-book.py and checked by scripts/book/check-verbatim.py):
 *   content/book/chapters/vXXcYY.json   one chapter each
 *   content/book/map.ts                 where each chapter lives (condition guide or Clinical Foundations), body area, type, old addresses
 *   content/book/help/<slug>.json       Roman Urdu help written for the site (optional per chapter; never the author's text)
 * Output (static assets, NOT bundled into the Cloudflare worker, except the two small generated files):
 *   public/conditions-data/<slug>.json              a guide: the whole chapter ("book") + short fields other features read (AI explanations, search)
 *   public/conditions-data/foundations/<slug>.json  a Clinical Foundations chapter
 *   src/lib/conditions/generated/catalog.json       small catalogue for lists, SEO, sitemap (in the worker)
 *   src/lib/conditions/generated/foundations.json   the Clinical Foundations list (in the worker)
 *   src/lib/conditions/generated/keywords.json      search words for Physio Nexus AI (server only)
 * Every short field is copied from the chapter's own words (a sentence, a list item, a table cell); nothing is written here.
 * Run after changing the book data:  npm run build:conditions-data    (validate:conditions fails the deploy if the output is stale)
 */
import fs from "node:fs";
import path from "node:path";
import { chapterMap, retired } from "../content/book/map.ts";
import { areas, areaLabel, typeLabel, type AreaId } from "../src/lib/conditions/taxonomy.ts";
import { licensedMSKIllustrations, getLicensedMSKImageUrl } from "../src/lib/licensed-msk-illustrations.ts";
import { getAtlasEntriesForCondition } from "../src/lib/clinical-visual-atlas.ts";
import type { BookBlock, BookChapter, BookHelp, BookSection } from "../src/lib/conditions/book-types.ts";
import type { CatalogItem, ConditionDetail, FoundationItem, Stage, TestFull, TestShort } from "../src/lib/conditions/types.ts";

const root = process.cwd();
const chapterDir = path.join(root, "content/book/chapters");
const helpDir = path.join(root, "content/book/help");
const dataDir = path.join(root, "public/conditions-data");
const foundationDir = path.join(dataDir, "foundations");
const catalogFile = path.join(root, "src/lib/conditions/generated/catalog.json");
const foundationsFile = path.join(root, "src/lib/conditions/generated/foundations.json");
const keywordsFile = path.join(root, "src/lib/conditions/generated/keywords.json");
const redirectsFile = path.join(root, "src/lib/conditions/generated/redirects.json");

const plain = (s: string) => s.replace(/\*\*/g, "").replace(/\s*\[Ref\s*[–-]\s*to verify[^\]]*\]/g, "").replace(/\s+/g, " ").trim();
const uniq = (items: (string | undefined | null)[]) => {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of items) {
    const v = raw?.trim();
    if (!v || seen.has(v.toLowerCase())) continue;
    seen.add(v.toLowerCase());
    out.push(v);
  }
  return out;
};
/** The first n sentences of a text (a sentence ends with . ? or ! followed by a space and a capital letter). */
const sentences = (s: string, n: number) => {
  const parts = plain(s).split(/(?<=[.?!])\s+(?=[A-Z])/);
  return parts.slice(0, n).join(" ");
};

const read = (file: string) => JSON.parse(fs.readFileSync(file, "utf8"));
const LETTER_ORDER = "ABCDEFGHIJKLMN";
/** "F to G. Differential diagnosis and red flags" → ["F", "G"]. */
const sectionLetters = (s: BookSection) => {
  const m = s.title.match(/^([A-N])(?:\s+to\s+([A-N]))?\./);
  if (!m) return [] as string[];
  return LETTER_ORDER.slice(LETTER_ORDER.indexOf(m[1]), LETTER_ORDER.indexOf(m[2] ?? m[1]) + 1).split("");
};
const section = (c: BookChapter, key: string) => c.sections.find((s) => s.key === key);
const listItems = (s: BookSection | undefined) => (s?.blocks ?? []).flatMap((b) => (b.t === "ul" || b.t === "ol" ? b.items : []));
const paras = (s: BookSection | undefined) => (s?.blocks ?? []).flatMap((b) => (b.t === "p" ? [b.text] : []));
const tables = (s: BookSection | undefined) => (s?.blocks ?? []).filter((b): b is Extract<BookBlock, { t: "table" }> => b.t === "table");
const summarySection = (c: BookChapter) => c.sections.find((s) => s.key.startsWith("chapter-summary"));

/** The "Item | Detail" card that follows each E1, E2 ... heading in Section E. */
function testsOf(c: BookChapter): TestFull[] {
  const e = section(c, "E");
  if (!e) return [];
  const out: TestFull[] = [];
  for (let i = 0; i < e.blocks.length; i++) {
    const b = e.blocks[i];
    if (b.t !== "h" || !/^E\d+\.\s/.test(b.text)) continue;
    const card = e.blocks.slice(i + 1).find((x) => x.t === "table" || x.t === "h");
    if (!card || card.t !== "table" || card.rows[0]?.length !== 2) continue;
    const get = (...names: string[]) => plain(card.rows.find((r) => names.some((n) => plain(r[0]).toLowerCase().startsWith(n)))?.[1] ?? "");
    out.push({
      name: b.text.replace(/^E\d+\.\s*/, ""),
      purpose: get("purpose"),
      positive: get("positive"),
      patientPosition: get("patient position", "position", "patient"),
      therapistPosition: get("therapist position", "therapist"),
      handPlacement: get("hand placement", "hands"),
      procedure: uniq([get("action", "procedure", "method")]),
      interpretation: uniq([get("supports", "meaning", "interpretation"), get("next step")]).join(" "),
    });
  }
  return out;
}

/** Bold lead ("**First visit:** screen, examine ...") → label + text. */
function leadSplit(item: string) {
  const m = item.match(/^\*\*([^*]+?):?\*\*:?\s*(.*)$/);
  return m ? { label: m[1].replace(/:$/, ""), text: m[2] } : { label: "", text: item };
}

function stagesOf(c: BookChapter): Stage[] {
  return listItems(section(c, "L")).map((item, i) => {
    const { label, text } = leadSplit(item);
    return { label: plain(label || `Step ${i + 1}`), goal: sentences(text || item, 1), when: [], do: [plain(text || item)], dose: [], moveOn: [] };
  });
}

/** The section that holds the red flags: "G. ..." or a combined one such as "F to G. Differential diagnosis and red flags". */
function redFlagSection(c: BookChapter): BookSection | undefined {
  return section(c, "G") ?? c.sections.find((s) => sectionLetters(s).includes("G"));
}

function redFlagsOf(c: BookChapter): string[] {
  const g = redFlagSection(c);
  if (!g) return [];
  const isFlagTable = (t: Extract<BookBlock, { t: "table" }>) => t.head && t.rows[0].some((h) => /urgency/i.test(plain(h)));
  const flagTables = tables(g).filter(isFlagTable);
  const fromTable = (flagTables.length ? flagTables : g.key === "G" ? tables(g) : []).flatMap((t) => t.rows.slice(t.head ? 1 : 0).map((r) => plain(r[0])));
  return uniq([...fromTable, ...(g.key === "G" ? listItems(g).map(plain) : [])]).filter(Boolean);
}

function looksOf(c: BookChapter): string[] {
  const b = section(c, "B");
  const items = listItems(b).map(plain);
  if (items.length) return uniq(items);
  const p = paras(b);
  if (p.length) return uniq(plain(p[0]).split(/(?<=[.?!])\s+(?=[A-Z])/));
  return uniq(tables(b).flatMap((t) => t.rows.slice(t.head ? 1 : 0).map((r) => plain(r[0]))));
}

function firstStepsOf(c: BookChapter): string[] {
  const sum = listItems(summarySection(c));
  if (sum.length) return uniq(sum.slice(0, 3).map((x) => { const { label, text } = leadSplit(x); return plain(label ? `${label}: ${text}` : x); }));
  const l = listItems(section(c, "L"));
  if (l.length) return uniq(l.slice(0, 3).map((x) => { const { label, text } = leadSplit(x); return plain(label ? `${label}: ${text}` : x); }));
  const i = section(c, "I");
  const p = paras(i)[0];
  if (p) return [sentences(p, 2)];
  const h = section(c, "H");
  const flow = (h?.blocks ?? []).flatMap((b) => (b.t === "flow" ? b.steps : []));
  const fromH = uniq([...listItems(h), ...flow].slice(-2).map(plain));
  if (fromH.length) return fromH;
  // a phase table (after surgery): "1: Protection: About 0 to 6 weeks"
  const phase = tables(h)[0];
  if (phase) return uniq(phase.rows.slice(phase.head ? 1 : 0, (phase.head ? 1 : 0) + 2).map((r) => plain(`${r[0]}: ${r.slice(1).filter(Boolean).join("; ")}`)));
  const j = paras(section(c, "J"))[0];
  return j ? [sentences(j, 1)] : [];
}

function summaryOf(c: BookChapter): string {
  const a = section(c, "A");
  // a chapter that opens with a table of conditions: "Trigger finger: Thickened flexor tendon ..."
  if (!paras(a).length && tables(a)[0]) {
    const t = tables(a)[0];
    return t.rows.slice(t.head ? 1 : 0, (t.head ? 1 : 0) + 2).map((r) => `${plain(r[0])}: ${plain(r[1] ?? "")}`.replace(/([^.])$/, "$1.")).join(" ");
  }
  const p = paras(a)[0] ?? paras(c.sections[0])[0] ?? c.lead;
  const s = sentences(p ?? "", 2);
  return s.length >= 60 ? s : sentences(p ?? "", 3) || plain(c.lead);
}

const calloutBodies = (c: BookChapter, kind: string) =>
  c.sections.flatMap((s) => s.blocks).flatMap((b) => (b.t === "callout" && b.kind === kind ? b.body.map(plain) : []));

// (kept for reference: every line of a chapter)
function allText(c: BookChapter): string[] {
  const out: string[] = [c.title, c.lead];
  for (const s of c.sections) {
    out.push(s.title);
    for (const b of s.blocks) {
      if (b.t === "p" || b.t === "h") out.push(b.text);
      else if (b.t === "ul" || b.t === "ol") out.push(...b.items);
      else if (b.t === "table") out.push(...b.rows.flat());
      else if (b.t === "callout") out.push(b.label, ...b.body);
      else if (b.t === "flow") out.push(...b.steps);
    }
  }
  return out.map(plain);
}

// ---- build
const details: ConditionDetail[] = [];
const foundations: { item: FoundationItem; chapter: BookChapter; help: BookHelp | null }[] = [];
const keywords: Record<string, string> = {};
const seenFiles = new Set<string>();
const files = fs.readdirSync(chapterDir).filter((f) => /^v\d\dc\d\d\.json$/.test(f));

for (const place of chapterMap) {
  if (seenFiles.has(place.file)) throw new Error(`content/book/map.ts lists ${place.file} twice`);
  seenFiles.add(place.file);
  const file = path.join(chapterDir, `${place.file}.json`);
  if (!fs.existsSync(file)) throw new Error(`content/book/map.ts: ${place.file} has no chapter file`);
  const chapter = read(file) as BookChapter;
  // Rows the PDF split at a page bottom (kept in content/ only so the word check can count them) never reach the site.
  for (const sec of chapter.sections) for (const b of sec.blocks) if (b.t === "table") delete b.clipped;
  const helpFile = path.join(helpDir, `${place.slug}.json`);
  const help = fs.existsSync(helpFile) ? (read(helpFile) as BookHelp) : null;
  if (help && help.chapter !== place.file) throw new Error(`${path.relative(root, helpFile)} is for ${help.chapter}, not ${place.file}`);

  if (place.kind === "foundation") {
    const first = chapter.sections.flatMap((s) => s.blocks).find((b) => b.t === "p") as { text: string } | undefined;
    foundations.push({
      item: { slug: place.slug, title: chapter.title, vol: chapter.vol, ch: chapter.ch, lead: plain(chapter.lead || sentences(first?.text ?? "", 1)) },
      chapter,
      help,
    });
    continue;
  }

  const slugs = [place.slug, ...(place.was ?? [])];
  const illustrationSlug = slugs.find((s) => licensedMSKIllustrations[s]);
  const illustration = illustrationSlug ? licensedMSKIllustrations[illustrationSlug] : undefined;
  const atlas = uniq(slugs.flatMap((s) => getAtlasEntriesForCondition(s).map((e) => `${e.shortTitle || e.title}|/clinical-visual-atlas/${e.slug}`)))
    .slice(0, 4)
    .map((x) => ({ label: x.split("|")[0], href: x.split("|")[1] }));
  const tests = testsOf(chapter);
  const f = section(chapter, "F");
  const differentials = uniq(tables(f).flatMap((t) => t.rows.slice(t.head ? 1 : 0).map((r) => plain(r[0]))));
  const m = section(chapter, "M");
  const measures = uniq([...paras(m).map((p) => sentences(p, 1)), ...listItems(m).map(plain)]).slice(0, 6);
  const testShort: TestShort[] = tests.map((t) => ({ name: t.name, purpose: t.purpose, positive: t.positive }));

  const detail: ConditionDetail = {
    v: 1,
    slug: place.slug,
    name: chapter.title,
    area: place.area,
    type: place.type,
    evidence: "",
    summary: summaryOf(chapter),
    ...(illustration && illustrationSlug ? { image: { url: getLicensedMSKImageUrl(illustrationSlug), title: illustration.title, credit: `${illustration.source} (${illustration.license})` } } : {}),
    quick: { lookLabel: "What you should expect", looksLike: looksOf(chapter).slice(0, 6), redFlags: redFlagsOf(chapter).slice(0, 8), firstSteps: firstStepsOf(chapter), selfCare: [] },
    clinical: {
      assess: listItems(section(chapter, "D")).map(plain),
      tests: testShort,
      differentials,
      measures,
      stages: stagesOf(chapter),
      returnCriteria: [],
    },
    expert: {
      logic: [], structures: [], mechanism: [], classification: [], investigations: [], manual: [], modalities: [], dosing: [], progression: [],
      mistakes: calloutBodies(chapter, "trap"),
      pearls: calloutBodies(chapter, "teacher"),
      education: [], escalation: [], tests, refs: [],
    },
    links: atlas,
    related: [],
    book: chapter,
    ...(help ? { help } : {}),
  };
  details.push(detail);
  // Search words: the condition's names, what it looks like, the tests, differentials and treatments it names (not the generic section headings).
  const firstCol = (key: string) => tables(section(chapter, key)).flatMap((t) => t.rows.slice(t.head ? 1 : 0).map((r) => plain(r[0])));
  keywords[place.slug] = uniq([
    chapter.title, place.aka, place.slug.replace(/-/g, " "), ...(place.was ?? []).map((s) => s.replace(/-/g, " ")), areaLabel(place.area), typeLabel(place.type),
    ...detail.quick.looksLike, ...differentials, ...tests.map((t) => t.name), ...firstCol("I"), ...firstCol("J"), ...detail.clinical.assess.slice(0, 4),
  ])
    .join(" ")
    .slice(0, 1600);
}
for (const f of files) if (!seenFiles.has(f.replace(/\.json$/, ""))) throw new Error(`content/book/chapters/${f} is not placed in content/book/map.ts`);

for (const d of details) {
  const sameArea = details.filter((o) => o.slug !== d.slug && o.area === d.area);
  const sameType = details.filter((o) => o.slug !== d.slug && o.type === d.type && o.area !== d.area);
  d.related = [...sameArea.filter((o) => o.type === d.type), ...sameArea.filter((o) => o.type !== d.type), ...sameType].slice(0, 4).map((o) => o.slug);
}

const catalog: CatalogItem[] = details
  .map((d) => {
    const place = chapterMap.find((p) => p.slug === d.slug)!;
    return {
      slug: d.slug,
      name: d.name,
      area: d.area,
      type: d.type,
      evidence: "",
      summary: d.summary,
      kind: "book",
      stages: d.clinical.stages.length,
      redFlags: d.quick.redFlags.slice(0, 3),
      firstSteps: d.quick.firstSteps.slice(0, 3),
      aka: place.kind === "condition" ? place.aka ?? "" : "",
      vol: d.book!.vol,
      ch: d.book!.ch,
      letters: [...new Set(d.book!.sections.flatMap(sectionLetters))].sort().join(""),
      tests: d.expert.tests.length,
    } satisfies CatalogItem;
  })
  .sort((a, b) => areas.findIndex((x) => x.id === a.area) - areas.findIndex((x) => x.id === (b.area as AreaId)) || a.vol - b.vol || a.ch - b.ch);

// ---- write (or, with --check, compare with what is on disk)
const outputs = new Map<string, string>();
for (const d of details) outputs.set(path.join(dataDir, `${d.slug}.json`), JSON.stringify(d));
for (const f of foundations) outputs.set(path.join(foundationDir, `${f.item.slug}.json`), JSON.stringify({ v: 1, ...f.item, book: f.chapter, ...(f.help ? { help: f.help } : {}) }));
outputs.set(catalogFile, JSON.stringify(catalog));
outputs.set(foundationsFile, JSON.stringify(foundations.map((f) => f.item)));
outputs.set(keywordsFile, JSON.stringify(keywords));
// Older guide addresses: a chapter that replaced them, or (for guides that are not in the book) the closest page. next.config.js reads this list.
const redirects = [
  ...chapterMap.flatMap((p) => (p.kind === "condition" ? (p.was ?? []).map((old) => ({ source: `/conditions/${old}`, destination: `/conditions/${p.slug}` })) : [])),
  ...Object.entries(retired).map(([old, destination]) => ({ source: `/conditions/${old}`, destination })),
];
for (const r of redirects) if (details.some((d) => `/conditions/${d.slug}` === r.source)) throw new Error(`${r.source} is both a guide and a redirect`);
outputs.set(redirectsFile, JSON.stringify(redirects, null, 1) + "\n");

const onDisk = (dir: string) => (fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => path.join(dir, f)) : []);

if (process.argv.includes("--check")) {
  const stale: string[] = [];
  for (const [file, text] of outputs) if (!fs.existsSync(file) || fs.readFileSync(file, "utf8") !== text) stale.push(path.relative(root, file));
  for (const file of [...onDisk(dataDir), ...onDisk(foundationDir)]) if (!outputs.has(file)) stale.push(`${path.relative(root, file)} (no longer a chapter)`);
  if (stale.length) {
    console.error(`Conditions guide data is stale (${stale.length} files). Run: npm run build:conditions-data\n  ` + stale.slice(0, 10).join("\n  "));
    process.exit(1);
  }
  console.log(`Conditions guide data is up to date (${details.length} conditions, ${foundations.length} foundation chapters).`);
} else {
  fs.mkdirSync(foundationDir, { recursive: true });
  for (const file of [...onDisk(dataDir), ...onDisk(foundationDir)]) if (!outputs.has(file)) fs.rmSync(file);
  let bytes = 0;
  for (const [file, text] of outputs) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, text);
    if (file.startsWith(dataDir)) bytes += Buffer.byteLength(text);
  }
  console.log(
    `Conditions guide: ${details.length} conditions + ${foundations.length} foundation chapters → public/conditions-data/ (${(bytes / 1024).toFixed(0)} KiB), catalogue ${(Buffer.byteLength(JSON.stringify(catalog)) / 1024).toFixed(0)} KiB (in worker).`,
  );
}
