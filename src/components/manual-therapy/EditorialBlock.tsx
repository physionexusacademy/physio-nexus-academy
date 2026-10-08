import type { LucideIcon } from "lucide-react";

type EditorialBlockProps = {
  title: string;
  items: string[];
  icon: LucideIcon;
  tone?: string;
};

/**
 * Clinical reading card for manual-therapy education.
 *
 * Technical content stays verbatim (aside from stripping the duplicated
 * numeric step prefix). Presentation changes, not the clinical guidance:
 * prose for explanations, a clear sequence for procedures, and prominent
 * readable language for contraindications and red flags.
 */
const sectionIntros: Record<string, string> = {
  "Patient Position": "The treatment begins before the first contact. Comfort, support and a relaxed starting position shape everything that follows.",
  "Therapist Position": "Now consider the person delivering the technique. Control should come from thoughtful body mechanics, not unnecessary force.",
  "Exact Hand Placement": "The details of contact change the quality of the whole technique. This is where precision matters.",
  "Exact Contact / Hand Placement": "The exact contact is not a decorative detail. It determines where the input is delivered.",
  "Direction & Type of Force": "Every input needs a purpose. Watch how direction, pace and pressure shape the patient's response.",
  "Force Direction": "Follow the direction of the planned movement. A precise line of force matters more than raw pressure.",
  "Stabilization": "Before moving one region, make sure the rest of the patient is comfortably supported.",
  "Dosage": "The useful dose is not always the largest dose. Allow the patient's response to guide the decision.",
  "Dosage & Application": "A measured dose makes it easier to understand whether the technique is helping.",
  "How Much Is Enough?": "A measured dose makes it easier to understand whether the technique is helping.",
  "What Would Count as Progress?": "When you release the contact, look for a meaningful change—not simply a dramatic sensation.",
  "Stop / Modify Immediately If…": "Safety is never the final footnote. These responses call for immediate reassessment.",
  "Where Good Intentions Go Wrong": "Even a familiar technique can lose its value when these mistakes enter the room.",
  "See It Through a Patient's Eyes": "Picture this as a hypothetical clinical moment. The real lesson is what happens to the patient's movement afterward.",
  "When to Use It": "The right technique begins with an appropriate clinical presentation, not with a favorite maneuver.",
  "Reassessment": "The final test is the same meaningful movement or symptom you checked at the start.",
  "Did It Make a Meaningful Difference?": "The patient's own movement tells you more than a pleasing sensation under your hands.",
  "Indications": "Consider this approach when the assessment supports the following clinical situations.",
  "Precautions": "These factors invite a more careful decision, a modified approach or additional screening.",
  "Contraindications": "Some presentations mean this technique should not be used. Screen before attempting it.",
  "The Science: What May Explain the Response": "Look beyond a single mechanical explanation. Several interacting responses may contribute.",
  "Under the Surface: The Science": "The science is most useful when it helps explain what we can observe—and what remains uncertain.",
  "The Method: From First Contact to Reassessment": "The quality of the sequence matters as much as any individual hand position.",
  "Small Details That Change Everything": "Sometimes one small clinical decision changes the value of the entire approach.",
};

function kindFor(title: string): "sequence" | "safety" | "case" | "narrative" {
  if (/step.by.step|complete applying method|the method:|application sequence/i.test(title)) return "sequence";
  if (/stop|contraindication|precaution|mistake|what the evidence does not|should not claim/i.test(title)) return "safety";
  if (/patient.s eyes|clinical example/i.test(title)) return "case";
  return "narrative";
}

function paragraphsFor(items: string[]): string[] {
  const clean = items.map((item) => item.trim()).filter(Boolean);
  if (!clean.length) return [];
  // Short clinical labels are not complete sentences (e.g. "Pain", "Range").
  // Present them as a coherent inline thought instead of scattered chips.
  if (clean.every((item) => item.length <= 85 && !/[.!?]$/.test(item))) {
    if (clean.length === 1) return clean;
    const phrase = clean.length === 2
      ? clean.join(" and ")
      : `${clean.slice(0, -1).join(", ")}, and ${clean[clean.length - 1]}`;
    return [phrase.charAt(0).toUpperCase() + phrase.slice(1) + "."];
  }
  // Keep all original sentences intact; grouping removes the staccato
  // checklist presentation while retaining every clinical detail.
  const result: string[] = [];
  for (let i = 0; i < clean.length; i += 2) {
    result.push(clean.slice(i, i + 2).join(" "));
  }
  return result;
}

export function EditorialBlock({ title, items, icon: Icon }: EditorialBlockProps) {
  const kind = kindFor(title);
  const isSafety = kind === "safety";
  const isSequence = kind === "sequence";
  const isCase = kind === "case";
  const lines = items.map((s) => s.trim()).filter(Boolean);
  const intro = sectionIntros[title];

  return (
    <section
      aria-label={title}
      data-pna-editorial="v2"
      className={`h-full overflow-hidden rounded-[1.6rem] border bg-white shadow-sm transition-shadow duration-200 hover:shadow-md ${
        isSafety ? "border-rose-200" : isCase ? "border-violet-200" : "border-slate-200"
      }`}
    >
      <div className={`h-1 w-full ${isSafety ? "bg-rose-400" : isCase ? "bg-violet-500" : isSequence ? "bg-teal-600" : "bg-gradient-to-r from-teal-500 via-cyan-500 to-indigo-400"}`} />
      <div className="px-5 pb-6 pt-6 sm:px-7 sm:pb-8">
        <div className="flex items-start gap-3">
          <span className={`flex h-11 w-11 flex-none items-center justify-center rounded-xl ${
            isSafety ? "bg-rose-50 text-rose-700" : isCase ? "bg-violet-50 text-violet-700" : "bg-teal-50 text-teal-800"
          }`}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isSafety ? "text-rose-700" : "text-teal-700"}`}>
              {isSafety ? "Clinical safety" : isCase ? "Inside the clinic" : isSequence ? "The clinical sequence" : "A closer look"}
            </p>
            <h2 className="mt-1 font-serif text-xl font-bold leading-snug text-slate-900 sm:text-[22px]">
              {title}
            </h2>
          </div>
        </div>

        {intro && (
          <p className="mt-5 text-[15px] italic leading-7 text-slate-600">{intro}</p>
        )}

        {isSequence ? (
          <ol className="relative mt-6 border-l border-teal-200 pl-6">
            {lines.map((line, index) => (
              <li key={index} className="relative pb-5 last:pb-0">
                <span className="absolute -left-[36px] top-0 flex h-6 w-6 items-center justify-center rounded-full border border-teal-200 bg-white text-[10px] font-bold tabular-nums text-teal-800">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="text-[15px] leading-7 text-slate-700">
                  {line.replace(/^\d+[.)]\s*/, "")}
                </p>
              </li>
            ))}
          </ol>
        ) : isCase ? (
          <div className="mt-5 border-l-[3px] border-violet-300 pl-4">
            {paragraphsFor(lines).map((p, index) => (
              <p key={index} className="mt-3 first:mt-0 text-[15px] leading-8 text-slate-700">{p}</p>
            ))}
            <p className="mt-4 text-xs font-medium text-violet-800">Illustrative teaching scenario, not a patient testimonial.</p>
          </div>
        ) : isSafety ? (
          <div className="mt-5 rounded-xl bg-rose-50/60 px-4 py-4">
            {paragraphsFor(lines).map((p, index) => (
              <p key={index} className="mt-3 first:mt-0 text-[15px] leading-7 text-slate-800">{p}</p>
            ))}
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {paragraphsFor(lines).map((p, index) => (
              <p key={index} className="text-[15px] leading-8 text-slate-700">{p}</p>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
