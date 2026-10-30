import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Dumbbell,
  Gauge,
  Hand,
  HeartPulse,
  Search,
  ShieldAlert,
  Stethoscope,
  ClipboardCheck,
  Eye,
} from "lucide-react";
import { mskConditions, type MSKTest } from "@/lib/msk-injury-hub";
import { mskClinicalStories } from "@/lib/msk-clinical-stories";
import { MSKStoryExperience } from "@/components/msk/MSKStoryExperience";
import { getAtlasEntriesForCondition } from "@/lib/clinical-visual-atlas";
import { getCloudinaryUrl } from "@/lib/cloudinary";

const relatedTreatmentPlans: Record<string, { slug: string; label: string }> = {
  "lateral-ankle-sprain": { slug: "lateral-ankle-sprain", label: "Lateral Ankle Sprain" },
  "acl-injury": { slug: "acl-reconstruction-rehabilitation", label: "ACL Reconstruction Rehabilitation" },
  "hamstring-strain": { slug: "hamstring-strain", label: "Hamstring Strain" },
  "knee-osteoarthritis": { slug: "knee-osteoarthritis", label: "Knee Osteoarthritis" },
  "hip-osteoarthritis": { slug: "hip-osteoarthritis", label: "Hip Osteoarthritis" },
  "cervical-radiculopathy": { slug: "cervical-radiculopathy", label: "Cervical Radiculopathy" },
  "carpal-tunnel-syndrome": { slug: "carpal-tunnel-syndrome", label: "Carpal Tunnel Syndrome" },
};

type PageProps = { params: Promise<{ slug: string }> };

export const dynamic = "force-static";
export const dynamicParams = true;
export const revalidate = false;

export function generateStaticParams() {
  return mskConditions.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = mskConditions.find((condition) => condition.slug === slug);
  if (!item) return {};
  return {
    title: item.name + " | MSK Clinical Injury & Rehabilitation",
    description: item.summary,
    alternates: { canonical: "https://physionexusacademy.com/msk-injuries/" + item.slug },
  };
}


const mskVisuals: Record<string, [string,string,string,string]> = {"mechanical-neck-pain":["Cervical spine","Cervical paraspinal region","Non-specific pain; no single lesion implied","spine"],"whiplash-associated-disorder":["Cervical spine","Cervical soft tissues","Acceleration–deceleration mechanism","spine"],"non-specific-low-back-pain":["Lumbar vertebrae","Lumbar paraspinal region","Non-specific pain; no single lesion implied","spine"],"lumbar-radiculopathy":["Lumbar disc and nerve root","Exiting nerve root","One possible mechanism; not universal","nerve"],"thoracic-spine-pain":["Thoracic vertebrae","Costovertebral region","Several structures may contribute","spine"],"adhesive-capsulitis":["Glenohumeral joint","Joint capsule","Capsular thickening simplified","joint"],"acromioclavicular-joint-injury":["Acromion and clavicle","AC ligaments","AC joint injury spectrum","joint"],"long-head-biceps-tendinopathy":["Humeral head","Long-head biceps tendon","Bicipital groove course","tendon"],"medial-epicondylalgia":["Medial humeral epicondyle","Common flexor tendon origin","Tendon origin region","tendon"],"de-quervain-tenosynovitis":["Radial styloid","APL and EPB tendons","First dorsal extensor compartment","hand"],"trigger-finger":["Metacarpal head","A1 pulley and flexor tendon","Tendon catching at A1 pulley","hand"],"greater-trochanteric-pain-syndrome":["Greater trochanter","Gluteal tendon insertions","Bursitis is not assumed","joint"],"gluteal-tendinopathy":["Greater trochanter","Gluteus medius/minimus tendons","Lateral hip tendon insertion","tendon"],"adductor-related-groin-pain":["Pubic region","Proximal adductor longus tendon","Proximal tendon attachment","tendon"],"patellofemoral-pain":["Patella and femoral trochlea","Patellofemoral articulation","Pain condition; no single lesion implied","knee"],"patellar-tendinopathy":["Patella and tibial tuberosity","Proximal patellar tendon","Inferior-pole tendon region","tendon"],"pcl-injury":["Femur and posterior tibia","Posterior cruciate ligament","PCL course within knee","knee"],"mcl-injury":["Medial femoral condyle and tibia","Medial collateral ligament","Medial ligament course","knee"],"plantar-heel-pain":["Calcaneus","Proximal plantar fascia","Medial calcaneal attachment","foot"],"achilles-tendinopathy":["Calcaneus","Achilles tendon","Midportion and insertional patterns differ","foot"],"posterior-tibial-tendon-dysfunction":["Medial malleolus and navicular","Posterior tibial tendon","Passes behind malleolus to navicular","foot"],"tibial-stress-injury":["Tibial shaft","Cortical/periosteal stress region","Stress continuum; no fracture line implied","foot"]};
function MSKConditionVisual({slug,name}:{slug:string;name:string}) {
 const v=mskVisuals[slug]; if(!v)return null;
 const [landmark,focus,note,type]=v;
 const spine=type==="spine", knee=type==="knee", foot=type==="foot", hand=type==="hand";
 return <section className="mt-8 overflow-hidden rounded-3xl border border-cyan-200 bg-gradient-to-br from-cyan-50 via-white to-slate-50">
 <div className="border-b border-cyan-100 p-5 sm:p-7"><p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-700">PNA Condition Visual</p><h2 className="mt-2 text-2xl font-bold text-navy-800">Anatomy & affected structure</h2><p className="mt-2 text-sm leading-6 text-navy-600">Simplified educational schematic of the relevant anatomical region. Not to scale and not for diagnosis.</p></div>
 <div className="p-4 sm:p-6"><svg viewBox="0 0 720 390" role="img" aria-labelledby="msk-v-title msk-v-desc" className="mx-auto h-auto w-full max-w-4xl rounded-2xl bg-gradient-to-br from-cyan-50 to-slate-100">
 <title id="msk-v-title">{name} anatomical schematic</title><desc id="msk-v-desc">{focus} highlighted in relation to {landmark}. {note}.</desc>
 <text x="32" y="38" fill="#0f766e" fontSize="14" fontWeight="700" letterSpacing="2">PNA • CLINICAL ANATOMY</text>
 <g fill="#e2e8f0" stroke="#64748b" strokeWidth="5" strokeLinejoin="round">
 {spine?<><path d="M185 75 Q245 55 305 75 L292 110 Q245 125 198 110Z"/><path d="M198 130 Q245 115 292 130 L290 165 Q245 180 200 165Z"/><path d="M200 185 Q245 170 290 185 L285 220 Q245 235 205 220Z"/><path d="M205 240 Q245 225 285 240 L280 275 Q245 290 210 275Z"/></>:knee?<><path d="M205 70 Q245 45 285 70 L270 175 Q245 195 220 175Z"/><path d="M205 260 Q245 240 285 260 L300 315 Q245 340 190 315Z"/><path d="M190 190 Q245 170 300 190 L295 230 Q245 250 195 230Z"/></>:foot?<><path d="M190 90 Q245 70 280 100 L270 225 Q250 255 225 240 L210 150Z"/><path d="M220 235 Q270 230 320 270 L350 300 Q320 330 270 310 L210 280Z"/></>:hand?<><path d="M220 170 Q245 145 275 170 L280 240 Q250 265 220 240Z"/><path d="M220 165 L205 80 M240 160 L238 65 M260 160 L270 80 M280 175 L305 110" fill="none" strokeWidth="13" strokeLinecap="round"/></>:<><path d="M185 95 Q245 55 305 95 L285 185 Q245 210 205 185Z"/><path d="M205 210 Q245 190 285 210 L300 285 Q245 315 190 285Z"/></>}
 </g><path d={spine?"M245 90 L245 270":knee?"M245 170 Q275 205 245 260":foot?"M240 245 Q285 260 325 300":hand?"M260 180 Q245 210 250 240":"M245 120 Q300 165 265 245"} fill="none" stroke="#0e7490" strokeWidth="12" strokeLinecap="round"/>
 <circle cx={spine?245:knee?260:foot?300:hand?260:265} cy={spine?185:knee?210:foot?280:hand?205:180} r="24" fill="#f97316" fillOpacity=".24" stroke="#ea580c" strokeWidth="5"/>
 <path d="M290 170 Q365 105 420 112" fill="none" stroke="#ea580c" strokeWidth="3" strokeDasharray="7 6"/>
 <rect x="405" y="82" width="280" height="150" rx="18" fill="white" stroke="#0891b2" strokeWidth="2"/><text x="425" y="112" fill="#0e7490" fontSize="12" fontWeight="700">HIGHLIGHTED STRUCTURE</text><text x="425" y="145" fill="#0f172a" fontSize="17" fontWeight="700">{focus}</text><text x="425" y="178" fill="#475569" fontSize="13">{landmark}</text>
 <rect x="32" y="310" width="653" height="52" rx="12" fill="white" stroke="#cbd5e1"/><text x="50" y="333" fill="#0f172a" fontSize="13" fontWeight="700">{name}</text><text x="50" y="351" fill="#475569" fontSize="11">{note}</text></svg></div></section>;
}

function ListSection({
  title,
  items,
  icon: Icon,
  tone,
}: {
  title: string;
  items: string[];
  icon: typeof Stethoscope;
  tone: string;
}) {
  return (
    <section className={"rounded-2xl border p-5 sm:p-6 " + tone}>
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5" />
        <h2 className="text-lg font-bold text-navy-800">{title}</h2>
      </div>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-6 text-navy-600">
            <CheckCircle2 className="mt-1 h-4 w-4 flex-none" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function TestCard({ test }: { test: MSKTest }) {
  return (
    <article className="rounded-2xl border border-cyan-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <ClipboardCheck className="mt-1 h-6 w-6 flex-none text-cyan-700" />
        <div>
          <h3 className="text-xl font-bold text-navy-800">{test.name}</h3>
          <p className="mt-1 text-sm leading-6 text-navy-600">{test.purpose}</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {[
          ["Patient position", test.patientPosition],
          ["Therapist position", test.therapistPosition],
          ["Hand placement", test.handPlacement],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl bg-cyan-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-cyan-800">{label}</p>
            <p className="mt-2 text-sm leading-6 text-navy-600">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-xl border border-grey-200 p-4">
        <p className="text-sm font-bold text-navy-800">How to perform</p>
        <ol className="mt-3 space-y-2">
          {test.procedure.map((step, index) => (
            <li key={step} className="flex gap-3 text-sm leading-6 text-navy-600">
              <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-navy-800 text-xs font-bold text-white">{index + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">Positive sign</p>
          <p className="mt-2 text-sm leading-6 text-navy-700">{test.positive}</p>
        </div>
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-800">Interpretation</p>
          <p className="mt-2 text-sm leading-6 text-navy-700">{test.interpretation}</p>
        </div>
      </div>
      {test.clinicalNote && (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-navy-700">
          <strong>Clinical note:</strong> {test.clinicalNote}
        </p>
      )}
    </article>
  );
}

export default async function MSKConditionPage({ params }: PageProps) {
  const { slug } = await params;
  const item = mskConditions.find((condition) => condition.slug === slug);
  if (!item) notFound();
  const visualEntries = getAtlasEntriesForCondition(item.slug);
  const story = mskClinicalStories[item.slug];

  return (
    <div className="container-content section-padding">
      <a href="/msk-injuries" className="inline-flex items-center gap-1 text-sm font-bold text-orange-700">
        <ArrowLeft className="h-4 w-4" />
        MSK Injury & Rehabilitation Hub
      </a>

      <section className="mt-5 overflow-hidden rounded-3xl bg-gradient-to-br from-rose-700 via-orange-600 to-navy-900 p-7 text-white shadow-xl sm:p-10">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">{item.region}</span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">{item.category}</span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">{item.evidenceLevel} evidence</span>
        </div>
        <h1 className="mt-4 text-3xl font-bold text-white sm:text-5xl">{item.name}</h1>
        <p className="mt-4 max-w-4xl text-base leading-7 text-orange-50">{item.summary}</p>
      </section>

      {story ? <MSKStoryExperience story={story} /> : null}

      {visualEntries.length ? (
        <section className="mt-8 overflow-hidden rounded-3xl border border-cyan-200 bg-gradient-to-br from-cyan-50 via-white to-violet-50/50">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-cyan-100 p-5 sm:p-7">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-700">
                PNA Clinical Visual Atlas
              </p>
              <h2 className="mt-2 text-2xl font-bold text-navy-800">
                See this condition in 3D
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-navy-600">
                Open the related anatomy and pathology visuals.
              </p>
            </div>
            <a
              href="/clinical-visual-atlas"
              className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white px-4 py-2 text-xs font-bold text-cyan-800 shadow-sm"
            >
              <Eye className="h-4 w-4" />
              Open Visual Atlas
            </a>
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-7 lg:grid-cols-3">
            {visualEntries.map((visual) => {
              const thumbnail =
                visual.thumbnailPath
                  ? getCloudinaryUrl(visual.thumbnailPath, { width: 560, quality: 78, format: "auto", crop: visual.crop })
                  : "";
              return (
                <a
                  key={visual.slug}
                  href={"/clinical-visual-atlas/" + visual.slug}
                  className="group overflow-hidden rounded-2xl border border-grey-200 bg-white transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-md"
                >
                  {thumbnail ? (
                    <div className="aspect-[4/3] overflow-hidden bg-grey-50">
                      <img
                        src={thumbnail}
                        alt={visual.shortTitle}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.02]"
                      />
                    </div>
                  ) : null}
                  <div className="p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-700">
                      {visual.category}
                    </p>
                    <h3 className="mt-1 font-bold text-navy-800">{visual.shortTitle}</h3>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      ) : null}

      {visualEntries.length === 0 ? <MSKConditionVisual slug={item.slug} name={item.name} /> : null}

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <ListSection title="Structures Involved" items={item.involvedStructures} icon={Search} tone="border-cyan-100 bg-cyan-50/70" />
        <ListSection title="Mechanism / Why It Happens" items={item.mechanism} icon={Activity} tone="border-orange-100 bg-orange-50/70" />
        <ListSection title="Classification / Grades" items={item.classification} icon={Gauge} tone="border-indigo-100 bg-indigo-50/70" />
        <ListSection title="Symptoms" items={item.symptoms} icon={HeartPulse} tone="border-amber-100 bg-amber-50/70" />
        <ListSection title="Clinical Signs" items={item.signs} icon={Stethoscope} tone="border-emerald-100 bg-emerald-50/70" />
        <ListSection title="Red Flags & Referral Clues" items={item.redFlags} icon={ShieldAlert} tone="border-rose-100 bg-rose-50/70" />
      </div>

      <section id="msk-clinical-tests" className="mt-10 scroll-mt-24">
        <p className="text-sm font-bold uppercase tracking-widest text-cyan-700">Diagnostic Examination</p>
        <h2 className="mt-1 text-2xl font-bold text-navy-800 sm:text-3xl">How to perform the tests — step by step</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-navy-600">
          Each test includes patient setup, therapist position, hand placement, exact performance,
          positive finding and clinical interpretation.
        </p>
        <div className="mt-6 space-y-5">
          {item.tests.map((test) => <TestCard key={test.name} test={test} />)}
        </div>
      </section>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <ListSection title="Differential Diagnosis" items={item.differentials} icon={Search} tone="border-violet-100 bg-violet-50/70" />
        <ListSection title="Investigations / Imaging" items={item.investigations} icon={Stethoscope} tone="border-blue-100 bg-blue-50/70" />
      </div>

      <section id="msk-rehab" className="mt-10 scroll-mt-24 overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-cyan-50">
        <div className="border-b border-emerald-100 p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Complete Rehabilitation Plan</p>
          <h2 className="mt-2 text-2xl font-bold text-navy-800 sm:text-3xl">From protection to full function</h2>
        </div>
        <div className="space-y-5 p-5 sm:p-8">
          {item.treatmentPhases.map((phase) => (
            <article key={phase.phase} className="rounded-2xl border border-emerald-100 bg-white p-5 sm:p-6">
              <h3 className="text-xl font-bold text-navy-800">{phase.phase}</h3>
              <p className="mt-2 text-sm font-semibold text-emerald-800">{phase.goal}</p>
              <div className="mt-5 grid gap-5 lg:grid-cols-3">
                <ListSection title="What to do" items={phase.interventions} icon={Activity} tone="border-grey-200 bg-grey-50/70" />
                <ListSection title="Exercise dosage" items={phase.exerciseDose} icon={Dumbbell} tone="border-emerald-100 bg-emerald-50/70" />
                <ListSection title="Progress when" items={phase.progression} icon={Gauge} tone="border-indigo-100 bg-indigo-50/70" />
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <ListSection title="Manual Therapy — Role & Application" items={item.manualTherapy} icon={Hand} tone="border-violet-100 bg-violet-50/70" />
        <ListSection title="Modalities — Use / Avoid" items={item.modalities} icon={Activity} tone="border-amber-100 bg-amber-50/70" />
        <ListSection title="Return / Discharge Criteria" items={item.returnCriteria} icon={Gauge} tone="border-emerald-100 bg-emerald-50/70" />
        <ListSection title="Common Clinical Mistakes" items={item.commonMistakes} icon={ShieldAlert} tone="border-rose-100 bg-rose-50/70" />
        <ListSection title="Clinical Pearls" items={item.clinicalPearls} icon={HeartPulse} tone="border-teal-100 bg-teal-50/70" />
      </div>

      <section className="mt-10 rounded-3xl border border-cyan-100 bg-gradient-to-br from-white via-cyan-50/50 to-white p-5 sm:p-7">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-700">Continue learning</p>
        <h2 className="mt-2 text-2xl font-bold text-navy-800">Connect assessment with management</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-navy-600">
          Use the related PNA learning pathways to explore examination techniques and structured rehabilitation. A test result should always be interpreted alongside the history, full examination and clinical presentation.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <a href="/msk-special-tests" className="group rounded-2xl border border-cyan-100 bg-white p-5 transition hover:border-cyan-300 hover:shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-cyan-50 p-3 text-cyan-800"><ClipboardCheck className="h-5 w-5" /></div>
              <div>
                <h3 className="font-bold text-navy-800 group-hover:text-cyan-800">MSK Special Tests</h3>
                <p className="mt-1 text-sm text-navy-600">Review test setup, technique and cautious interpretation.</p>
              </div>
            </div>
            <p className="mt-4 text-sm font-bold text-cyan-800">Explore examination tests →</p>
          </a>
          <a href={relatedTreatmentPlans[item.slug] ? "/treatment-plans/" + relatedTreatmentPlans[item.slug].slug : "/treatment-plans"} className="group rounded-2xl border border-emerald-100 bg-white p-5 transition hover:border-emerald-300 hover:shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-800"><Dumbbell className="h-5 w-5" /></div>
              <div>
                <h3 className="font-bold text-navy-800 group-hover:text-emerald-800">{relatedTreatmentPlans[item.slug] ? "Treatment Plan: " + relatedTreatmentPlans[item.slug].label : "Treatment Plans"}</h3>
                <p className="mt-1 text-sm text-navy-600">{relatedTreatmentPlans[item.slug] ? "Open the matching rehabilitation pathway for this condition." : "Connect assessment findings with staged rehabilitation and progression."}</p>
              </div>
            </div>
            <p className="mt-4 text-sm font-bold text-emerald-800">Browse rehabilitation plans →</p>
          </a>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-grey-200 bg-white p-6">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-navy-700" />
          <h2 className="font-bold text-navy-800">Evidence sources</h2>
        </div>
        <p className="mt-3 rounded-xl border border-sky-100 bg-sky-50/70 p-3 text-sm leading-6 text-navy-700">
          Use these sources as a starting point for clinical learning. A reference being listed here does not, by itself, establish that every recommendation on this page is strongly supported. Check the original publication, study design, population and limitations before applying findings to an individual patient.
        </p>
        <ul className="mt-4 space-y-3">
          {item.references.map((reference) => (
            <li key={reference.url}>
              <a className="text-sm font-semibold text-teal-700 hover:underline" href={reference.url} target="_blank" rel="noreferrer">
                {reference.title}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-xs leading-5 text-navy-500">
          Educational resource only. Tests and treatment plans must be adapted to the individual patient,
          irritability, comorbidities, surgical restrictions and local scope-of-practice requirements.
        </p>
      </section>
    </div>
  );
}
