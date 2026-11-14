/**
 * Dr. Sajjad teaching data: resolves each choreography's text references into the final bilingual lines, and checks them.
 * Bundled with esbuild by build-avatar-data.mjs / validate-avatar.mjs (the regional guide uses "@/" imports Node cannot load directly).
 */
import { CHOREOS } from "../src/lib/avatar/choreo/index.ts";
import type { Choreo, TextRef, LabeledOverlay } from "../src/lib/avatar/choreo/types.ts";
import type { Line, Note, BuiltStep, BuiltChoreo } from "../src/lib/avatar/choreo/built.ts";
import { manualTherapyTeacherLessons } from "../src/lib/teacher/manual-therapy/index.ts";
import { regionalManualApplications } from "@/lib/manual-therapy-regional";
import { KEY_POINTS } from "../src/lib/virtual-patient/points.ts";
import rig from "../src/lib/virtual-patient/generated/rig.json" with { type: "json" };


const lessonBySlug = new Map((manualTherapyTeacherLessons as any[]).map((l) => [l.slug, l]));
const regionalBySlug = new Map((regionalManualApplications as any[]).map((r) => [r.slug, r]));
const LANDMARKS = new Set(Object.keys((rig as any).landmarks));

/** "1. First. 2. Second." → ["First.", "Second."] (the lessons keep the Roman Urdu steps as one numbered string). */
export function splitNumbered(text: string): string[] {
  const parts = text.split(/(?:^|\s)\d{1,2}\.\s(?=[A-Z])/).map((p) => p.trim()).filter(Boolean);
  return parts;
}

export function resolveRef(ref: TextRef, c: Choreo, problems: string[]): Line {
  const where = `${c.slug}: ${JSON.stringify(ref)}`;
  if (ref.src === "lesson") {
    const lesson: any = lessonBySlug.get(c.lessonSlug);
    const beatIndex = (lesson?.beats ?? []).findIndex((b: any) => b.type === ref.beat);
    const beat = lesson?.beats?.[beatIndex];
    if (!beat) {
      problems.push(`${where} — the lesson has no "${ref.beat}" beat`);
      return { en: "", ur: "", src: "missing" };
    }
    if (ref.step !== undefined) {
      if (beat.type !== "steps") {
        problems.push(`${where} — beat is a "${beat.type}", not "steps"`);
        return { en: "", ur: "", src: "missing" };
      }
      const s = beat.steps[ref.step];
      if (!s) {
        problems.push(`${where} — step ${ref.step} does not exist (${beat.steps.length} steps)`);
        return { en: "", ur: "", src: "missing" };
      }
      const ur = beat.ur ? splitNumbered(beat.ur) : [];
      if (ur.length !== beat.steps.length) problems.push(`${where} — Roman Urdu steps (${ur.length}) do not match English steps (${beat.steps.length})`);
      return { en: `${s.title}. ${s.detail}`, ur: ur[ref.step] ?? "", src: `lesson ${c.lessonSlug} ${ref.beat} step ${ref.step}` };
    }
    const en = beat.text?.en ?? beat.title?.en ?? beat.intro?.en ?? "";
    const ur = beat.text?.ur ?? beat.title?.ur ?? beat.intro?.ur ?? "";
    if (!en || !ur) problems.push(`${where} — beat has no bilingual text`);
    return { en, ur, src: `lesson ${c.lessonSlug} ${ref.beat}` };
  }
  const reg: any = regionalBySlug.get(c.slug);
  const list: string[] | undefined = reg?.[ref.field];
  const en = Array.isArray(list) ? list[ref.index ?? 0] : undefined;
  if (!en) {
    problems.push(`${where} — regional guide has no such line`);
    return { en: "", ur: "", src: "missing" };
  }
  return { en, ur: en, urFallback: true, src: `regional ${c.slug} ${ref.field}[${ref.index ?? 0}]` };
}

/** Landmark ids used in a point spec ("@coracoid{0.03,0,0}", "a+b*0.5"): every "@name" must be a known landmark or face point. */
export function landmarksIn(spec: string): string[] {
  return [...spec.matchAll(/@([a-z0-9-]+)/g)].map((m) => m[1]);
}
const FACE = new Set(["nose", "chin", "forehead", "ear"]);

export function build(): { built: BuiltChoreo[]; problems: string[] } {
  const problems: string[] = [];
  const built: BuiltChoreo[] = [];
  for (const c of CHOREOS) {
    if (!lessonBySlug.has(c.lessonSlug)) problems.push(`${c.slug}: lesson "${c.lessonSlug}" does not exist`);
    if (!regionalBySlug.has(c.slug)) problems.push(`${c.slug}: no regional guide with this slug`);
    if (c.review.status === "reviewed" && !(c.review.by && c.review.date)) problems.push(`${c.slug}: reviewed choreography needs review.by and review.date`);
    const steps: BuiltStep[] = c.steps.map((step, i) => {
      const where = `${c.slug} step ${i} (${step.chip})`;
      if (!step.say.length) problems.push(`${where}: nothing to say`);
      const say = step.say.map((r) => resolveRef(r, c, problems));
      say.forEach((l) => {
        if (!l.en.trim()) problems.push(`${where}: empty English line`);
        if (!l.ur.trim()) problems.push(`${where}: empty Roman Urdu line`);
      });
      const specs = [
        ...(step.contacts ?? []).map((k) => k.at),
        ...(step.stand ? [step.stand.at] : []),
        ...((step.overlays ?? []) as any[]).flatMap((o) => [o.at, o.to, o.from, o.vertex, o.a, o.b, ...(o.pts ?? [])].filter((x) => typeof x === "string")),
      ];
      for (const spec of specs) for (const id of landmarksIn(spec)) if (!LANDMARKS.has(id) && !FACE.has(id)) problems.push(`${where}: unknown landmark "@${id}" in "${spec}"`);
      for (const k of KEY_POINTS.length ? [] : []) void k;
      const notes: Note[] = [];
      const overlays = (step.overlays ?? []).map((o) => {
        const { note, ...rest } = o as LabeledOverlay;
        if (note) notes.push({ tag: note.tag, text: resolveRef(note.ref, c, problems) });
        return rest;
      });
      const { say: _say, overlays: _ov, ...others } = step;
      void _say;
      void _ov;
      return { ...others, say, overlays, notes };
    });
    if (!c.steps.length) problems.push(`${c.slug}: no steps`);
    built.push({ ...c, lessonTitle: (lessonBySlug.get(c.lessonSlug) as any)?.title ?? c.lessonSlug, steps });
  }
  return { built, problems };
}
