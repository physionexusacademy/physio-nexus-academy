import type { KnowledgeArticle } from "@/lib/knowledge-content";

const common = (assessment: string[], differentials: string[], management: string[], progression: string[], mistakes: string[], pearls: string[], summary: string) => [
  { heading: "Assessment and clinical reasoning", bullets: assessment },
  { heading: "Differential diagnosis and red flags", bullets: differentials },
  { heading: "Management", bullets: management },
  { heading: "Dosage and progression", bullets: progression },
  { heading: "Common mistakes", bullets: mistakes },
  { heading: "Clinical pearls", bullets: pearls },
  { heading: "Concise summary", paragraphs: [summary] },
];

export const dailyKnowledgeArticles20260929: KnowledgeArticle[] = [
  {
    slug: "rotator-cuff-related-shoulder-pain-rehabilitation",
    specialty: "Musculoskeletal (MSK)", title: "Rotator Cuff–Related Shoulder Pain: Assessment, Loading and Clinical Reasoning",
    excerpt: "A practical framework for assessing and progressively loading common non-traumatic shoulder pain without over-relying on special tests or imaging.", category: "Shoulder Rehabilitation", audience: "Students", level: "Advanced", readTime: "15 min read", publishedAt: "2026-09-29", updatedAt: "2026-09-29",
    learningObjectives: ["Recognize a rotator-cuff-related clinical pattern.", "Screen serious and non-MSK causes of shoulder pain.", "Build a progressive exercise plan using symptoms, capacity and function.", "Use imaging and special tests as contextual rather than stand-alone evidence."],
    references: [{ title: "Rotator Cuff Tendinopathy Diagnosis, Nonsurgical Medical Care and Rehabilitation: Clinical Practice Guideline", organization: "JOSPT", year: "2025", url: "https://www.jospt.org/doi/10.2519/jospt.2025.13182" }],
    sections: common(
      ["Clarify traumatic versus gradual onset, night pain, work/sport load and functional goals.", "Assess active and passive range, resisted shoulder strength, symptom response and cervical contribution.", "Use patient-reported function and one or two repeatable functional tasks to track change."],
      ["Acute traumatic weakness or inability to elevate the arm may require timely medical assessment for major cuff injury.", "Screen cervical radiculopathy, glenohumeral stiffness, instability and referred cardiopulmonary/visceral symptoms when the pattern is atypical.", "Unexplained systemic symptoms, rapidly progressive weakness or severe unremitting pain warrant escalation."],
      ["Education should support activity modification without unnecessary avoidance.", "Progressive resistance for rotator cuff and scapular musculature is a central active strategy.", "Manual therapy may be used selectively for short-term symptom modulation but should not replace loading."],
      ["Begin at a tolerable resistance and range, commonly 2–4 sets across key patterns 2–3 days/week, then individualize.", "Progress load, range, speed and overhead demand when symptoms recover predictably and performance improves.", "For sport/work, finish with task-specific exposure rather than stopping at isolated band exercises."],
      ["Diagnosing a single tendon from one painful special test.", "Stopping all overhead activity for prolonged periods.", "Repeating passive treatment without restoring strength and task tolerance."],
      ["Shoulder pain is often best managed as a capacity problem, not a hunt for one damaged structure.", "Measure what the patient needs to do, then progressively train toward it."],
      "Rotator cuff–related shoulder pain is usually managed with contextual assessment, education and progressive loading, while traumatic, neurological and systemic alternatives are screened appropriately."
    )
  },
  {
    slug: "stroke-spasticity-motor-recovery-rehabilitation",
    specialty: "Neurological", title: "Post-Stroke Spasticity: Assessment, Motor Recovery and Function-First Rehabilitation",
    excerpt: "A neurorehabilitation guide to distinguishing spasticity from weakness, contracture and poor motor control, then linking treatment to meaningful function.", category: "Stroke Rehabilitation", audience: "Students", level: "Advanced", readTime: "15 min read", publishedAt: "2026-09-29", updatedAt: "2026-09-29",
    learningObjectives: ["Differentiate spasticity from contracture and weakness.", "Assess the functional impact of altered tone.", "Select active rehabilitation and multidisciplinary options.", "Set reassessment criteria around meaningful activity."],
    references: [{ title: "Stroke rehabilitation in adults (NG236)", organization: "NICE", year: "2023", url: "https://www.nice.org.uk/guidance/ng236/chapter/Recommendations" }],
    sections: common(
      ["Examine passive resistance at different movement speeds, available range, pain, strength and selective motor control.", "Ask whether tone actually interferes with hygiene, positioning, gait, hand use, sleep or care.", "Track function and goals rather than treating a tone score in isolation."],
      ["Differentiate neural overactivity from fixed contracture, joint pain, dystonia and protective muscle activity.", "New neurological deterioration, acute severe headache or sudden functional loss requires medical reassessment."],
      ["Use repetitive task-specific practice, positioning, strengthening and mobility work around the patient’s goals.", "For focal problematic spasticity, coordinate with specialist services when pharmacological or injection-based management is appropriate.", "Prevent secondary complications through movement, skin care, range surveillance and appropriate equipment."],
      ["Dose active practice by quality, fatigue and meaningful repetitions; distribute practice through the day when useful.", "Progress task complexity and independence rather than chasing passive range alone.", "Reassess after any tone-management intervention to exploit the functional window."],
      ["Assuming all post-stroke stiffness is spasticity.", "Trying to eliminate tone without identifying a functional problem.", "Using passive stretching as the entire rehabilitation programme."],
      ["Treat the person’s activity limitation, not the Modified Ashworth score.", "Weakness and poor selective control often matter as much as tone."],
      "Post-stroke spasticity management is goal-led: identify whether altered tone limits function, distinguish it from contracture and weakness, and combine active rehabilitation with specialist interventions when indicated."
    )
  },
  {
    slug: "bronchiectasis-airway-clearance-physiotherapy",
    specialty: "Cardiopulmonary", title: "Bronchiectasis: Airway Clearance, Exercise and Exacerbation-Aware Physiotherapy",
    excerpt: "An evidence-informed approach to airway-clearance selection, exercise, self-management and escalation in adults with bronchiectasis.", category: "Respiratory Physiotherapy", audience: "Students", level: "Advanced", readTime: "15 min read", publishedAt: "2026-09-29", updatedAt: "2026-09-29",
    learningObjectives: ["Assess sputum burden and functional impact.", "Select individualized airway-clearance strategies.", "Integrate exercise and self-management.", "Recognize deterioration requiring medical review."],
    references: [{ title: "European Respiratory Society clinical practice guideline for the management of adult bronchiectasis", organization: "European Respiratory Society", year: "2025", url: "https://publications.ersnet.org/content/erj/early/2025/07/17/13993003.00900-2025" }],
    sections: common(
      ["Ask about sputum volume/colour, haemoptysis, breathlessness, exacerbation frequency and previous cultures.", "Assess cough effectiveness, exercise tolerance and barriers to independent airway clearance.", "Review current technique and adherence before adding complexity."],
      ["Acute large-volume haemoptysis, severe breathlessness, chest pain, hypoxaemia or systemic deterioration requires urgent medical assessment.", "Consider coexisting asthma/COPD, infection, cardiac disease and musculoskeletal limits to exercise."],
      ["Teach an individualized airway-clearance technique that the patient can perform effectively and independently.", "Combine respiratory care with regular physical activity and exercise training when appropriate.", "Coordinate changes during exacerbations with the respiratory team rather than improvising medication advice."],
      ["Technique frequency is individualized to secretion burden and clinical status; increase or modify during exacerbation only within the care plan.", "Progress exercise duration/intensity using symptoms, oxygenation where indicated and recovery.", "Reassess sputum clearance, breathlessness and participation."],
      ["Prescribing one airway-clearance technique to everyone.", "Ignoring haemoptysis or acute deterioration.", "Treating bronchiectasis only with breathing exercises while neglecting conditioning."],
      ["The best airway-clearance technique is one that is effective, safe and sustainable for that person.", "Exercise is part of respiratory rehabilitation, not an optional extra."],
      "Bronchiectasis physiotherapy combines individualized airway clearance, exercise and self-management with clear escalation pathways for exacerbation and haemoptysis."
    )
  },
  {
    slug: "developmental-dysplasia-hip-pediatric-rehab",
    specialty: "Pediatrics", title: "Developmental Dysplasia of the Hip: Physiotherapy Reasoning Across Infancy and Childhood",
    excerpt: "A pediatric guide to recognition, referral, post-treatment mobility and family education in developmental dysplasia of the hip.", category: "Pediatric Orthopaedics", audience: "Students", level: "Clinical", readTime: "14 min read", publishedAt: "2026-09-29", updatedAt: "2026-09-29",
    learningObjectives: ["Recognize DDH risk and clinical concerns.", "Understand physiotherapy’s role alongside orthopaedic management.", "Avoid unsafe positioning advice.", "Plan age-appropriate functional rehabilitation after treatment."],
    references: [{ title: "Developmental Dysplasia of the Hip in Infants up to Six Months of Age", organization: "AAOS", year: "2022", url: "https://www.aaos.org/ddhcpg" }],
    sections: common(
      ["Review birth history, breech presentation, family history and prior screening.", "Observe symmetry, hip motion and age-appropriate gross motor function without forcing provocative maneuvers.", "After treatment, assess mobility, strength, confidence and developmental participation."],
      ["Suspected instability, marked asymmetric abduction or concerning screening findings require paediatric/orthopaedic assessment.", "Pain, fever or acute refusal to bear weight in an older child requires evaluation for other pathology."],
      ["Physiotherapy does not replace orthopaedic reduction or bracing when these are indicated.", "Provide family education on safe handling and developmentally appropriate movement within medical restrictions.", "After immobilization or surgery, restore mobility, strength and function according to the orthopaedic plan."],
      ["Use short, frequent play-based practice for infants and progressive functional tasks for older children.", "Progress weight-bearing and range only within procedure-specific permissions.", "Reassess gait, symmetry and participation as activity increases."],
      ["Aggressively stretching a medically managed infant hip.", "Promising that exercise alone can correct structural instability.", "Ignoring developmental play and family handling."],
      ["Know the boundary between screening, rehabilitation and orthopaedic treatment.", "Family education is a major pediatric intervention."],
      "DDH requires timely recognition and orthopaedic management; physiotherapy supports safe development, family education and restoration of function after treatment."
    )
  },
  {
    slug: "hamstring-strain-return-to-sprint-rehab",
    specialty: "Sports", title: "Hamstring Strain Rehabilitation: From Early Loading to Return-to-Sprint",
    excerpt: "A criterion-based sports rehabilitation pathway integrating lengthened-position strength, running exposure and return-to-sport decision-making.", category: "Muscle Injury", audience: "Students", level: "Advanced", readTime: "16 min read", publishedAt: "2026-09-29", updatedAt: "2026-09-29",
    learningObjectives: ["Classify hamstring strain clinically.", "Progress loading and running by criteria.", "Use eccentric and lengthened-position strength appropriately.", "Reduce recurrence risk through sprint exposure."],
    references: [{ title: "Hamstring Strain Injury in Athletes: Clinical Practice Guidelines", organization: "JOSPT / APTA", year: "2022", url: "https://www.jospt.org/doi/10.2519/jospt.2022.0301" }],
    sections: common(
      ["Clarify sprinting versus stretching mechanism, bruising, walking tolerance and prior injury.", "Assess pain, range, isometric strength and functional tasks; later quantify running and high-speed capacity.", "Use serial reassessment rather than one clearance test."],
      ["Marked weakness, palpable defect, extensive bruising or proximal avulsion suspicion warrants medical imaging/referral.", "Differentiate lumbar/radicular pain and posterior thigh referred pain when the mechanism is unclear."],
      ["Begin tolerable early loading and restore range without aggressive stretching.", "Progress strength through increasing ranges and include eccentric/lengthened-position work.", "Reintroduce running from submaximal to high-speed sprinting and sport-specific demands."],
      ["Increase resistance or running speed when pain is low, technique is controlled and next-day response is acceptable.", "Build repeated high-speed exposures before unrestricted competition.", "Track sprint distance and intensity as part of load management."],
      ["Waiting for zero tenderness before all loading.", "Returning after jogging but before sprint exposure.", "Using stretching as the main recurrence-prevention strategy."],
      ["Running is rehabilitation for a running injury.", "Late-stage rehab must prepare the hamstring for high force at high speed."],
      "Hamstring rehabilitation should restore strength across useful ranges and progressively expose the athlete to running and sprinting before return to sport."
    )
  },
  {
    slug: "osteoporosis-exercise-fracture-prevention",
    specialty: "Geriatrics", title: "Osteoporosis: Exercise Prescription, Fracture Risk and Safe Functional Loading",
    excerpt: "A geriatric rehabilitation framework for resistance, impact, balance and spine-safe exercise in osteoporosis.", category: "Bone Health", audience: "Students", level: "Advanced", readTime: "15 min read", publishedAt: "2026-09-29", updatedAt: "2026-09-29",
    learningObjectives: ["Assess fracture and falls risk.", "Prescribe resistance and balance exercise safely.", "Modify exercise after vertebral fracture.", "Progress toward meaningful daily loading."],
    references: [{ title: "Strong, steady and straight: UK consensus statement on physical activity and exercise for osteoporosis", organization: "Royal Osteoporosis Society / British Journal of Sports Medicine", year: "2022", url: "https://bjsm.bmj.com/content/56/15/837" }],
    sections: common(
      ["Review fracture history, falls, medications, pain, balance, strength and confidence.", "Identify vertebral fracture history and movements that provoke spinal pain.", "Assess functional strength with tasks such as sit-to-stand and stair negotiation."],
      ["New severe spinal pain after minor loading, height loss or neurological symptoms may indicate vertebral fracture and requires medical assessment.", "Differentiate hip/spine pain from routine exercise soreness."],
      ["Use progressive resistance training for major muscle groups and balance training for falls risk.", "Include weight-bearing/impact activity when appropriate to fracture risk and prior capacity.", "Teach spine-sparing strategies for people with vertebral fracture risk while maintaining activity."],
      ["Aim for regular resistance sessions, often 2–3 days/week, individualized to tolerance and medical status.", "Progress load and balance challenge gradually; avoid keeping capable adults permanently on very light exercise.", "Reassess falls, confidence and functional performance."],
      ["Telling people with osteoporosis to avoid all bending or lifting.", "Using only walking and omitting strength/balance training.", "Progressing impact without considering fracture history."],
      ["Bone health needs loading, but loading must match fracture risk.", "Strength and balance protect function even when bone density changes slowly."],
      "Osteoporosis rehabilitation combines progressive resistance, balance and appropriate weight-bearing activity with fracture-aware modification rather than unnecessary movement avoidance."
    )
  },
  {
    slug: "pelvic-organ-prolapse-conservative-rehabilitation",
    specialty: "Women's & Pelvic Health", title: "Pelvic Organ Prolapse: Conservative Physiotherapy, Pressure Management and Progression",
    excerpt: "A pelvic-health guide to symptom assessment, pelvic floor muscle training, activity modification and referral in pelvic organ prolapse.", category: "Pelvic Health", audience: "Students", level: "Advanced", readTime: "15 min read", publishedAt: "2026-09-29", updatedAt: "2026-09-29",
    learningObjectives: ["Recognize common prolapse symptoms.", "Plan supervised pelvic floor muscle training.", "Integrate bowel, lifting and activity strategies.", "Identify referral indications."],
    references: [{ title: "Urinary incontinence and pelvic organ prolapse in women: management", organization: "NICE", year: "2019, updated", url: "https://www.nice.org.uk/guidance/ng123/chapter/recommendations" }],
    sections: common(
      ["Ask about vaginal bulge/heaviness, urinary/bowel symptoms, lifting, constipation and activity goals.", "Assess ability to contract and relax the pelvic floor where within scope and consent.", "Track symptom bother and participation, not anatomy alone."],
      ["Unexplained bleeding, pelvic mass symptoms, severe pain, recurrent infection or neurological change warrants medical assessment.", "Differentiate prolapse symptoms from urinary, bowel and musculoskeletal contributors."],
      ["Offer supervised pelvic floor muscle training when appropriate and address constipation/straining.", "Teach pressure-management strategies without creating fear of normal lifting.", "Coordinate pessary or surgical discussion with appropriate clinicians when symptoms remain bothersome."],
      ["NICE recommends supervised pelvic floor muscle training for at least 16 weeks for symptomatic stage 1 or 2 prolapse.", "Progress from isolated contractions to standing, lifting and goal-specific tasks.", "Review symptoms and adherence before changing strategy."],
      ["Telling patients never to lift again.", "Prescribing contractions without checking technique.", "Ignoring bowel habits and activity goals."],
      ["Conservative care should expand function, not shrink the patient’s life.", "Symptoms and goals guide treatment intensity."],
      "Pelvic organ prolapse physiotherapy combines supervised pelvic floor training, bowel/pressure strategies and graded return to activity, with referral when symptoms or findings require additional care."
    )
  },
  {
    slug: "pain-neuroscience-education-clinical-use",
    specialty: "Pain Science", title: "Pain Neuroscience Education: What to Explain, What to Avoid and How to Link It to Rehabilitation",
    excerpt: "A practical pain-science lesson on using education to reduce threat while keeping exercise and meaningful activity at the center of care.", category: "Pain Education", audience: "Students", level: "Advanced", readTime: "15 min read", publishedAt: "2026-09-29", updatedAt: "2026-09-29",
    learningObjectives: ["Explain pain without dismissing symptoms.", "Avoid inaccurate brain-versus-body narratives.", "Pair education with active rehabilitation.", "Use patient understanding to support graded activity."],
    references: [{ title: "Pain management programmes for adults", organization: "British Pain Society", year: "2021", url: "https://www.britishpainsociety.org/static/uploads/resources/files/PMP_guidelines_2021.pdf" }],
    sections: common(
      ["Explore the patient’s explanation of pain, fears, goals and previous experiences.", "Screen for nociceptive, neuropathic and nociplastic contributors rather than assuming persistent pain is purely central.", "Measure function, confidence and participation alongside pain."],
      ["New progressive neurological deficit, systemic illness or other red flags require medical assessment regardless of pain duration.", "Do not use pain education to explain away new pathology."],
      ["Use simple, individualized explanations that validate pain while separating pain intensity from a direct measure of damage.", "Link education immediately to a behavioral plan: walking, strengthening, sleep routines, pacing or valued activity.", "Use graded exposure when fear is limiting safe activity."],
      ["Keep education brief enough to support action; revisit concepts as new experiences occur.", "Progress activity from a repeatable baseline by small planned increments.", "Use flare plans that modify dose without abandoning activity indefinitely."],
      ["Saying pain is 'all in the brain'.", "Giving a neuroscience lecture without changing rehabilitation behavior.", "Using reassurance to dismiss symptoms instead of screening them."],
      ["Education is useful when it changes what the patient can safely do.", "Validate first, explain second, then build capacity."],
      "Pain neuroscience education is an adjunct to active rehabilitation: it should reduce threat, improve understanding and support graded restoration of meaningful function."
    )
  },
  {
    slug: "aerobic-exercise-prescription-fitt-vp-rehabilitation",
    specialty: "Exercise & Rehabilitation", title: "Aerobic Exercise Prescription: FITT-VP, Intensity Monitoring and Clinical Progression",
    excerpt: "A rehabilitation guide to frequency, intensity, time, type, volume and progression using heart rate, RPE and symptom response.", category: "Exercise Prescription", audience: "Students", level: "Advanced", readTime: "15 min read", publishedAt: "2026-09-29", updatedAt: "2026-09-29",
    learningObjectives: ["Use FITT-VP to structure aerobic exercise.", "Choose intensity measures appropriate to the patient.", "Progress volume safely.", "Recognize stop criteria."],
    references: [{ title: "ACSM's Guidelines for Exercise Testing and Prescription, 12th Edition", organization: "American College of Sports Medicine", year: "2025", url: "https://acsm.org/education-resources/books/guidelines-exercise-testing-prescription/" }],
    sections: common(
      ["Review medical status, baseline activity, exercise tolerance, medications and goals.", "Choose monitoring such as RPE, talk test, heart rate or workload based on context.", "Identify musculoskeletal barriers and environmental constraints."],
      ["New chest pressure, syncope, severe disproportionate breathlessness or acute illness requires stopping and medical assessment.", "Heart-rate targets may be misleading with rate-limiting medication or rhythm disorders."],
      ["Prescribe frequency, intensity, time and type, then consider total volume and progression.", "Use modes the patient can sustain such as walking, cycling or swimming when appropriate.", "Pair aerobic work with resistance and balance training when indicated."],
      ["Start below the patient’s maximum tolerable dose and build duration/weekly volume before large intensity jumps when deconditioned.", "Progress one variable at a time and monitor next-day recovery.", "Use interval formats when continuous exercise is initially poorly tolerated."],
      ["Using 220-age as a precise universal target.", "Progressing intensity and duration simultaneously.", "Ignoring adherence and patient preference."],
      ["The best programme is measurable and repeatable.", "RPE and symptoms can be more useful than heart rate in many clinical settings."],
      "FITT-VP provides a flexible structure for aerobic prescription, but intensity and progression must be individualized using clinical status, exertion, symptoms and recovery."
    )
  },
  {
    slug: "consort-2025-randomized-trial-reporting",
    specialty: "Research & Evidence", title: "CONSORT 2025: How to Read and Report a Randomized Controlled Trial",
    excerpt: "A research-literacy guide to allocation, blinding, outcomes, harms, participant flow and transparent RCT reporting using CONSORT 2025.", category: "Research Methods", audience: "Students", level: "Advanced", readTime: "16 min read", publishedAt: "2026-09-29", updatedAt: "2026-09-29",
    learningObjectives: ["Identify essential RCT reporting elements.", "Separate random sequence generation from allocation concealment.", "Interpret participant flow and missing data.", "Use CONSORT as a reporting guide rather than a trial-quality score."],
    references: [{ title: "CONSORT 2025 statement: updated guideline for reporting randomised trials", organization: "CONSORT / BMJ", year: "2025", url: "https://www.bmj.com/content/389/bmj-2024-081123" }],
    sections: common(
      ["Identify the prespecified primary outcome, time point, intervention/comparator and analysis population.", "Check sequence generation, allocation concealment, blinding where feasible and baseline information.", "Trace recruitment, allocation, follow-up and analysis through the participant flow diagram."],
      ["Distinguish poor reporting from demonstrated high risk of bias; use an appropriate risk-of-bias tool separately.", "Watch for outcome switching, unexplained attrition, selective harms reporting and analyses inconsistent with the protocol."],
      ["Use the CONSORT 2025 checklist while drafting manuscripts and while critically reading trials.", "Compare the report with registration/protocol when available.", "Interpret effect estimates with confidence intervals and clinical relevance, not p values alone."],
      ["For a manuscript, complete reporting prospectively during drafting rather than reconstructing details at submission.", "For appraisal, move item-by-item from methods to results and document uncertainties.", "Reassess conclusions after considering missing data, adherence and harms."],
      ["Calling CONSORT a risk-of-bias score.", "Equating randomization with allocation concealment.", "Reporting only statistically significant outcomes."],
      ["Transparent reporting lets readers judge a trial; it does not guarantee the trial was well conducted.", "Registration, protocol and final report should tell a coherent story."],
      "CONSORT 2025 improves transparent RCT reporting across design, conduct, analysis and interpretation; readers should pair it with dedicated risk-of-bias assessment rather than using it as a quality score."
    )
  }
];
