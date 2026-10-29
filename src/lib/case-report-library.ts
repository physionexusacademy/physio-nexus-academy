export type PublishedCaseReport = {
  slug: string; title: string; authors: string; journal: string; year: number; specialty: string;
  tags: string[]; openAccess: boolean; licenseNote: string; sourceUrl: string; doi?: string;
  caseSummary: string; clinicalFindings: string[]; intervention: string[]; outcomes: string[];
  clinicalLessons: string[]; limitations: string[];
};
export const publishedCaseReports: PublishedCaseReport[] = [
{
 slug:"plantar-fasciitis-rehabilitation", title:"Comprehensive Physiotherapy Rehabilitation Protocol of Plantar Fasciitis for a 45-Year-Old Female: A Case Report",
 authors:"Manali A. Boob, Pratik Phansopkar, Kamya J. Somaiya", journal:"Cureus", year:2024, specialty:"Musculoskeletal",
 tags:["Plantar heel pain","Foot and ankle","Exercise rehabilitation"], openAccess:true, licenseNote:"CC BY 4.0; attribution required.",
 sourceUrl:"https://pmc.ncbi.nlm.nih.gov/articles/PMC10835201/", doi:"10.7759/cureus.51585",
 caseSummary:"A 45-year-old nurse reported six months of heel pain, particularly during her first steps in the morning. Her work involved prolonged standing. The report describes an individualized rehabilitation plan rather than a single isolated technique.",
 clinicalFindings:["Medial and posterior heel pain, most noticeable with the first morning steps.","Positive windlass test, heel tenderness and reduced ankle dorsiflexion on the affected side.","Calcaneal squeeze test and Tinel sign were negative in the reported assessment."],
 intervention:["A multimodal physiotherapy programme combining manual therapy, stretching, strengthening and patient education/self-management.","The paper describes an individualized programme; the summary does not assume a universally applicable dose."],
 outcomes:["The authors report gradually reduced discomfort and improved functional mobility during the physiotherapy course."],
 clinicalLessons:["Ask about first-step pain, standing exposure and functional goals.","Use a cluster of history and examination findings; do not diagnose from a heel spur alone.","Pair clinic treatment with a realistic self-management plan."],
 limitations:["Single-patient case report; improvement cannot establish which treatment component caused the change.","The result should not be generalized to every person with plantar heel pain."]
},
{
 slug:"chronic-post-surgical-low-back-pain", title:"How manual therapy provided a gateway to a biopsychosocial management approach in an adult with chronic post-surgical low back pain: a case report",
 authors:"David Toomey, Duncan Reid, Steven White", journal:"Journal of Manual & Manipulative Therapy", year:2021, specialty:"Musculoskeletal",
 tags:["Persistent pain","Lumbar spine","Biopsychosocial care"], openAccess:true, licenseNote:"Full text is available in PubMed Central; check publisher terms before reusing any figures or tables.",
 sourceUrl:"https://pmc.ncbi.nlm.nih.gov/articles/PMC8023601/", doi:"10.1080/10669817.2020.1813472",
 caseSummary:"A 44-year-old woman had persistent pain for 13 years after lumbar fusion. The report explores how manual therapy was used within a broader plan that also addressed exercise, pain understanding and confidence—not as a stand-alone structural fix.",
 clinicalFindings:["Long history of low-back and thigh symptoms after L5/S1 fusion.","Pain-related disability and reduced self-efficacy were important treatment concerns.","The paper discusses the patient within a broader biopsychosocial framework."],
 intervention:["A 12-week multimodal programme combining manual therapy, exercise rehabilitation and pain neuroscience education.","Care was individualized; the case report does not establish a single optimal manual technique or dose."],
 outcomes:["The authors report reductions in pain intensity, Oswestry Disability Index and fear-avoidance beliefs.","The patient returned to running and cycling."],
 clinicalLessons:["Persistent pain after surgery deserves more than an imaging-only explanation.","Manual therapy can be a bridge into active rehabilitation and education rather than the whole treatment plan.","Track participation, confidence and disability alongside pain."],
 limitations:["One case cannot prove manual therapy caused the improvement or determine the best treatment combination.","The findings may not apply to all post-surgical patients."]
},
{
 slug:"chronic-low-back-motor-skill-training", title:"Motor skill training in musculoskeletal pain: a case report in chronic low back pain",
 authors:"Vanessa M. Lanier", journal:"Disability and Rehabilitation", year:2019, specialty:"Musculoskeletal",
 tags:["Chronic low-back pain","Movement retraining","Motor learning"], openAccess:true, licenseNote:"Full text hosted by PubMed Central; review the article's licence before reusing its material.",
 sourceUrl:"https://pmc.ncbi.nlm.nih.gov/articles/PMC7398488/", doi:"10.1080/09638288.2018.1460627",
 caseSummary:"This case report describes a 26-year-old man with a long history of low-back pain and activity-related limitations. The report focuses on motor-skill training as a way to change how meaningful movements are performed, rather than simply adding generic exercises.",
 clinicalFindings:["Low-back pain had persisted for about ten years.","Symptoms affected sitting, desk work, household activities and driving.","The report describes an active person who still experienced substantial interference from pain."],
 intervention:["A motor-skill training approach targeted movement performance in relevant activities.","Use the full article for the exact training progression and session details; this summary does not invent a dose."],
 outcomes:["The article reports the course and outcomes of an individual case; interpret the changes in the context of the full report."],
 clinicalLessons:["Choose movements that matter to the person, not just impairment tests.","Motor learning requires practice, feedback and progression suited to the task.","Avoid treating a single case as proof that one movement strategy works for everyone."],
 limitations:["The intervention and outcome are uncontrolled observations in one person.","The original full text should be consulted for exact outcome values before clinical or academic citation."]
},
{
 slug:"post-stroke-proprioception-gait", title:"Physiotherapy management focusing on proprioceptive impairment in a patient with gait and balance impairments following stroke: A case report",
 authors:"Aisuke Takahashi, Shun Kitsunai, Hikaru Kawana, Naoshi Saito, Akioh Yoshihara, Katsuhiro Furukawa", journal:"Physiotherapy Theory and Practice", year:2025, specialty:"Neurological Rehabilitation",
 tags:["Stroke","Gait","Balance","Proprioception"], openAccess:false, licenseNote:"Publisher/PubMed record available; full text access may depend on institution or subscription.",
 sourceUrl:"https://pubmed.ncbi.nlm.nih.gov/38516762/", doi:"10.1080/09593985.2024.2332792",
 caseSummary:"A 63-year-old man with an acute pontine lacunar infarction had balance and gait difficulties despite relatively preserved strength and selective movement. The team investigated proprioception more quantitatively and tailored treatment to the identified impairment.",
 clinicalFindings:["Berg Balance Scale score was 42 and Gait Assessment and Intervention Tool score was 9 at the described assessment.","Gait showed knee buckling and hip ataxia.","Quantitative testing included threshold to detect passive motion and joint position sense."],
 intervention:["A 13-day programme used sensory-threshold TENS targeting the quadriceps femoris, alongside clinical assessment and rehabilitation.","The report links treatment planning to measured proprioceptive impairment."],
 outcomes:["At discharge, the patient walked independently; Berg Balance Scale improved from 42 to 56 and GAIT score from 9 to 2."],
 clinicalLessons:["Weakness is not the only explanation for post-stroke gait dysfunction.","Measure the impairment you suspect where feasible, then connect findings to function.","Read the full article for the protocol and context before reproducing the intervention."],
 limitations:["A single case cannot establish that TENS or the assessment method caused the recovery.","Stroke recovery and concurrent care may contribute to observed change."]
},
{
 slug:"delayed-patellar-fracture-rehabilitation", title:"Continuous Passive Motion in the Rehabilitation of a Comminuted Patellar Fracture Following Delayed Physiotherapy Initiation: A Case Report",
 authors:"Mohammad Ali, Timothy Miller", journal:"Clinical Case Reports", year:2026, specialty:"Orthopaedic Rehabilitation",
 tags:["Patellar fracture","Post-operative rehabilitation","Knee stiffness"], openAccess:true, licenseNote:"CC BY-NC-ND 4.0; non-commercial redistribution with attribution, no adaptations. This original summary is independently written.",
 sourceUrl:"https://pmc.ncbi.nlm.nih.gov/articles/PMC12757924/", doi:"10.1002/ccr3.71806",
 caseSummary:"A 40-year-old man presented 53 days after fixation of a comminuted patellar fracture with severe knee stiffness. Medical comorbidities had delayed early rehabilitation, making safe progression and monitoring central to the case.",
 clinicalFindings:["Knee flexion was 10 degrees at initial assessment.","Pain was 8/10; Kujala score 19/100 and Lysholm score 7/100.","The fracture had been treated with open reduction and internal fixation."],
 intervention:["Four-week programme combining supervised continuous passive motion for one hour per day, four days per week, with a structured home exercise programme.","CPM settings were progressed according to pain and tolerance; post-operative precautions and surgeon guidance remain essential."],
 outcomes:["After four weeks, knee flexion reached 110 degrees.","Pain was 0/10 at rest and 3/10 with movement; Kujala score rose to 69/100 and Lysholm score to 76/100."],
 clinicalLessons:["Record baseline range, pain and patient-reported function to show change clearly.","Late presentation requires careful coordination with surgical restrictions and comorbidities.","Home exercise and adherence were part of the combined plan."],
 limitations:["One case cannot prove CPM is necessary or superior to other rehabilitation approaches.","Do not copy the protocol without checking fracture stability, surgical instructions and individual risk."]
},
{
 slug:"copd-primary-care-pulmonary-rehab", title:"Pulmonary Rehabilitation in Primary Care: Functional and Emotional Impact in a Patient with COPD: A Case Report",
 authors:"Verónica Esteves, Sara Diogo Gonçalves", journal:"Reports", year:2025, specialty:"Cardiorespiratory",
 tags:["COPD","Pulmonary rehabilitation","Exercise capacity","Psychological wellbeing"], openAccess:true, licenseNote:"Open access under CC BY; attribute the original authors.",
 sourceUrl:"https://pmc.ncbi.nlm.nih.gov/articles/PMC12736919/", doi:"10.3390/reports8040257",
 caseSummary:"A 73-year-old man with moderate COPD experienced breathlessness and functional decline after stopping regular exercise. A structured programme was delivered through a primary-care setting, demonstrating one practical service model.",
 clinicalFindings:["Moderate COPD with exertional dyspnoea and reduced functional capacity.","Baseline six-minute walk distance was 303 metres.","The report also measured lower-limb function, daily activity limitations and anxiety."],
 intervention:["A 16-week pulmonary rehabilitation programme with weekly supervised breathing, aerobic and resistance training, education, and home exercise twice weekly.","The programme was delivered with clinical monitoring and no adverse events were reported in this case."],
 outcomes:["mMRC dyspnoea grade improved from 2 to 1.","Six-minute walk distance increased from 303 to 380 metres; 10-times sit-to-stand increased from 10 to 18 repetitions.","Borg exertion score changed from 7 to 4; anxiety score and activity limitations also improved."],
 clinicalLessons:["Pulmonary rehabilitation can be delivered outside a hospital when appropriate staffing and monitoring are available.","Measure exercise capacity and patient-reported outcomes, not breathlessness alone.","Adherence and emotional wellbeing are clinically relevant parts of the story."],
 limitations:["Single case with no comparison group; it cannot establish effectiveness for all COPD populations.","The programme's safety depends on screening, individualization and appropriate monitoring."]
},
{
 slug:"copd-physiotherapy-older-adult", title:"Novelty of Physiotherapy Management in a Classic Case of Chronic Obstructive Pulmonary Disease in an 84-Year-Old Male Patient with Hypertension and Well-Controlled Hypothyroidism: A Case Report",
 authors:"Radha Nangliya, Vaishnavi Yadav, Sojwal P. Nandanwar", journal:"Cureus", year:2024, specialty:"Cardiorespiratory",
 tags:["COPD","Older adult","Breathing exercises","Exercise tolerance"], openAccess:true, licenseNote:"Open access article; cite the original source and check the article's stated licence.",
 sourceUrl:"https://pmc.ncbi.nlm.nih.gov/articles/PMC11060019/", doi:"10.7759/cureus.57318",
 caseSummary:"An 84-year-old man with COPD and comorbidities was referred with worsening cough and breathlessness. Physiotherapy was provided alongside medical management, with a focus on breathing, relaxation and activity tolerance.",
 clinicalFindings:["COPD with breathlessness and reduced exercise tolerance.","The case included hypertension and well-controlled hypothyroidism.","Clinical monitoring was important because of age, comorbidities and respiratory status."],
 intervention:["A two-week individualized programme including deep-breathing and relaxation techniques, aerobic activities and patient education alongside medical treatment."],
 outcomes:["The authors reported improvement in dyspnoea grading, perceived exertion and thoracic excursion, with follow-up benefits described."],
 clinicalLessons:["Coordinate respiratory physiotherapy with medical management and monitor clinical stability.","Tailor exercise to tolerance rather than applying a fixed intensity to every older adult.","Document function and symptoms before and after the programme."],
 limitations:["One patient cannot show which programme element drove change.","The case should not be used to replace guideline-based COPD assessment or individualized risk screening."]
},
{
 slug:"multiple-joint-fracture-rehabilitation", title:"The Effectiveness of Physiotherapy Rehabilitation in an Adult With Multiple Joint Fractures - A Case Report",
 authors:"Anjali V. Nawkhare, Mitushi Deshmukh, Sakshi Padmawar", journal:"Cureus", year:2024, specialty:"Orthopaedic Rehabilitation",
 tags:["Multiple fractures","Post-operative rehabilitation","Gait training","Range of motion"], openAccess:true, licenseNote:"Open access full text is hosted by PubMed Central; check its article-level licence before reusing material.",
 sourceUrl:"https://pmc.ncbi.nlm.nih.gov/articles/PMC11293038/", doi:"10.7759/cureus.63654",
 caseSummary:"A 35-year-old man sustained fractures involving several joints after a road traffic accident and underwent surgical fixation. Rehabilitation had to address multiple regions and competing functional demands.",
 clinicalFindings:["Fractures involved the proximal tibia, ankle region, metacarpals and proximal phalanges.","Post-operative limitations affected range of motion, strength, mobility and independence.","The plan needed to be individualized to the sites of injury and surgical restrictions."],
 intervention:["An 8–12 week rehabilitation course included passive and active range-of-motion work, isometrics, progressive resistance exercise and gait training.","Progression depended on the injury pattern and post-operative status."],
 outcomes:["The authors reported improvements in pain, range of motion, muscle strength and general function between pre- and post-rehabilitation assessments."],
 clinicalLessons:["With multiple injuries, plan by region but coordinate toward whole-person function.","Respect fixation stability and weight-bearing instructions before progressing loading.","Track mobility, strength and daily function over time."],
 limitations:["Single case; details and outcomes cannot establish a standard protocol for all fracture combinations.","The original paper should be checked for exact outcome values and restrictions."]
},
{
 slug:"ataxic-cerebral-palsy-child", title:"Multiple Approaches of Neuro-Physiotherapy Used for Improving Balance, Normalizing Tone, and Gait Training in a Child With Ataxic Cerebral Palsy: A Case Report",
 authors:"Dhanashree S. Upganlawar, Snehal Samal, Prishita Koul, Jaee P. Kapre", journal:"Cureus", year:2023, specialty:"Paediatric Rehabilitation",
 tags:["Cerebral palsy","Ataxia","Balance","Gait"], openAccess:true, licenseNote:"Open access article; attribute the original authors and confirm the licence on the source page.",
 sourceUrl:"https://pmc.ncbi.nlm.nih.gov/articles/PMC10774834/", doi:"10.7759/cureus.50264",
 caseSummary:"A seven-year-old girl with ataxic cerebral palsy had difficulty walking, standing for longer periods and performing gross and fine motor activities. The report describes a goal-oriented neuro-physiotherapy programme.",
 clinicalFindings:["Difficulty with gait, prolonged standing and gross/fine motor activities.","MRI was reported to show generalized cerebellar atrophy.","The child received medical care alongside physiotherapy."],
 intervention:["A goal-oriented combination of approaches was described, including Rood-based activities, constraint-induced movement therapy, PNF and passive stretching.","The article reports a multimodal plan; it does not isolate the contribution of each component."],
 outcomes:["The authors reported improved balance and gait, with independent walking and a more appropriate gait pattern described after treatment."],
 clinicalLessons:["Set goals around participation and age-relevant activities, not tone alone.","Paediatric rehabilitation should be individualized and coordinated with the family and wider team.","Measure balance, gait and everyday function in a way that fits the child."],
 limitations:["A single case cannot determine which intervention was responsible for the gains.","The findings should not be generalized to all children with cerebral palsy or all ataxic presentations."]
},
{
 slug:"early-icu-rehabilitation-covid-copd", title:"Case Report: A Rehabilitation Practice Report During ICU Management for a Patient With Multiple Disabilities Due to COVID-19 Pneumonia and COPD",
 authors:"Tokio Kinoshita, Ken Kouda, Yasunori Umemoto, Yoshinori Yasuoka, Yuta Minoshima, Yukio Mikami, Yukihide Nishimura, Kyohei Miyamoto, Seiya Kato, Fumihiro Tajima", journal:"Frontiers in Medicine", year:2021, specialty:"Critical Care & ICU",
 tags:["ICU rehabilitation","COVID-19","COPD","Early mobilization"], openAccess:true, licenseNote:"Full text is available in PubMed Central; check the article-level licence before reuse.",
 sourceUrl:"https://pmc.ncbi.nlm.nih.gov/articles/PMC8274657/", doi:"10.3389/fmed.2021.692898",
 caseSummary:"A 71-year-old man with COPD and COVID-19 pneumonia required mechanical ventilation and deep sedation. The case describes rehabilitation beginning during critical illness, with activities adjusted to respiratory and medical status.",
 clinicalFindings:["Severe pneumonia with mechanical ventilation and deep sedation.","The patient had COPD and several comorbidities, increasing rehabilitation complexity.","Early sessions were constrained by critical-care status and respiratory management."],
 intervention:["The team began with passive range-of-motion work and positioning/mobility activities while the patient was sedated, progressing as his condition allowed.","The report emphasizes coordination with the ICU team and status-driven adjustments."],
 outcomes:["The patient later improved in daily function and was able to walk independently to the toilet without respiratory distress, according to the report."],
 clinicalLessons:["Rehabilitation can start with positioning and passive movement when active participation is not possible, if medically appropriate.","ICU physiotherapy requires continuous coordination with ventilation, oxygenation and hemodynamic status.","Progression should follow stability and tolerance, not a preset timetable."],
 limitations:["Single case from a highly specific clinical context; not a protocol for unsupervised or routine use.","Interventions and recovery occurred alongside intensive medical treatment."]
}
,{
 slug:"gbs-structured-functional-rehabilitation", title:"A structured rehabilitation program for functional recovery in Guillain–Barré syndrome: a case report",
 authors:"Authors listed in the original article", journal:"Journal of Medical Case Reports", year:2025, specialty:"Neurological Rehabilitation",
 tags:["Guillain–Barré syndrome","Progressive rehabilitation","Functional independence"], openAccess:true, licenseNote:"Open-access full text on PubMed Central; use the source article's licence for any reuse.",
 sourceUrl:"https://pmc.ncbi.nlm.nih.gov/articles/PMC12465850/", doi:"10.1186/s13256-025-05545-z",
 caseSummary:"A 40-year-old woman with Guillain–Barré syndrome developed profound weakness affecting all four limbs and required extensive assistance with daily activities. The report follows a structured, goal-based rehabilitation programme over four months after acute medical treatment.",
 clinicalFindings:["The patient initially had severe generalized weakness, restricted range in several joints, marked tightness in selected muscle groups and poor supported sitting balance.","She was dependent for basic activities and required substantial help with bed mobility and transfers.","The authors describe recurrent flare-ups during the rehabilitation period, making reassessment and adjustment important."],
 intervention:["The programme combined range-of-motion work, prolonged stretching, active-assisted exercise, trunk control, bed mobility practice, sitting balance, progressive strengthening and functional task training.","Treatment was advanced from passive and assisted activity toward more active movement and assisted sit-to-stand according to the patient's ability.","The published programme includes specific repetitions and techniques; clinicians should consult the original paper and individualize care rather than copy its dose."],
 outcomes:["After four months, the patient could sit unsupported, move from side-lying to sitting with minimal assistance and stand with partial assistance.","The authors reported improved muscle grades, reduced tightness and improvement on the Guillain–Barré disability scale."],
 clinicalLessons:["Severe neurological rehabilitation needs staged goals: positioning and range first when required, then trunk control, bed mobility, transfers and functional strength.","Measure changes in assistance level and everyday function, not just isolated muscle grades.","Guillain–Barré recovery can fluctuate; monitor fatigue, respiratory status and medical stability with the wider team."],
 limitations:["Single case with a complex clinical course; improvement cannot be attributed to one treatment component.","The programme is not a universal protocol for every GBS subtype or severity level."]
},
{
 slug:"stroke-extracapsular-infarct-rehabilitation", title:"Targeted Physiotherapy for an Interesting Case of Spontaneously Resolving Extracapsular Infarct: A Case Report",
 authors:"Neha P. Arya, Nikita H. Seth, Ghanishtha C. Burile, Raghumahanti Raghuveer", journal:"Cureus", year:2024, specialty:"Neurological Rehabilitation",
 tags:["Stroke","Gait and balance","Functional outcome measures"], openAccess:true, licenseNote:"Open access under CC BY 4.0; attribute the original authors.",
 sourceUrl:"https://pmc.ncbi.nlm.nih.gov/articles/PMC10867550/", doi:"10.7759/cureus.52348",
 caseSummary:"An 86-year-old woman experienced a rare extracapsular ischemic stroke and required intensive care during an unstable early phase. Once medically stable, she was referred for physiotherapy because of generalized weakness and impaired balance and walking.",
 clinicalFindings:["The acute presentation included a fall, loss of consciousness and oxygen-saturation instability requiring intubation and ICU care.","After stabilization, weakness contributed to balance and gait limitations.","The report used manual muscle testing, Berg Balance Scale, Dynamic Gait Index and Functional Independence Measure to track change."],
 intervention:["A structured two-week programme included strengthening, bed mobility, balance practice, fine and gross motor tasks and gait training.","Interventions were adjusted to the patient's impairments and functional status; the article also reports a later follow-up assessment."],
 outcomes:["The authors reported improvements in strength, gait pattern, balance and independence in activities of daily living over the rehabilitation period.","The reported gains were captured with functional and impairment-level measures rather than relying only on a general impression."],
 clinicalLessons:["Medical stability and appropriate monitoring come before mobilization intensity after an acute stroke.","Choose outcome measures that match the main problems—balance, gait, strength and independence.","An unusual stroke presentation is a reminder to coordinate with the medical team and avoid assuming all gait impairment is purely musculoskeletal."],
 limitations:["A single case cannot establish that physiotherapy alone caused the improvement, particularly when the stroke was described as spontaneously resolving.","The case does not establish a standard programme for other stroke locations or severities."]
},
{
 slug:"proactive-physical-therapy-parkinson", title:"Using Implementation Frameworks to Provide Proactive Physical Therapy for People With Parkinson Disease: Case Report",
 authors:"Miriam R. Rafferty, Jillian MacDonald, Alexandria Byskosh, Laura Sloan, Santiago Toledo, Christina Marciniak, Tanya Simuni", journal:"Physical Therapy", year:2019, specialty:"Neurological Rehabilitation",
 tags:["Parkinson disease","Early rehabilitation","Service design"], openAccess:true, licenseNote:"Full text is available in PubMed Central; check the publisher's terms before reusing figures or tables.",
 sourceUrl:"https://pmc.ncbi.nlm.nih.gov/articles/PMC7372734/", doi:"10.1093/ptj/pzz129",
 caseSummary:"Rather than describing only one patient's treatment, this implementation case report examines a proactive physiotherapy pathway for people with early Parkinson disease, before major mobility problems emerge. The programme used shared decision-making and flexible care pathways to help people maintain independent exercise.",
 clinicalFindings:["The service was designed for people with early Parkinson disease who might not otherwise be referred until gait or balance problems became more prominent.","The team identified practical barriers such as insurance coverage, travel, time and patients' perceptions of physiotherapy.","The programme used an initial evaluation of physical function, activity habits, exercise confidence and personal goals."],
 intervention:["The pathway offered a one-visit consultation, a short exercise-instruction course, skilled maintenance or traditional restorative physiotherapy, selected jointly with the patient.","The implementation process used knowledge-translation and implementation frameworks and involved neurologists and rehabilitation clinicians.","Follow-up and long-term exercise recommendations were tailored to individual needs and barriers."],
 outcomes:["In the first year, 38 people were referred, 28 evaluated and 20 contributed to the six-month programme evaluation.","After the programme, reported regular participation in aerobic, strengthening and flexibility activities approximately doubled; balance activity participation rose from one person to eight among the evaluated group.","Participants reported a median of 140 minutes of aerobic exercise per week."],
 clinicalLessons:["Physiotherapy can have a preventive and educational role, not only a restorative role after disability becomes obvious.","A good plan must account for access, cost, time, motivation and shared decisions—not just the exercise prescription.","Service-level outcomes such as referrals, attendance and exercise maintenance can matter alongside patient-level clinical measures."],
 limitations:["This is an implementation case study, not a randomized trial proving that the model is superior to usual care.","Results from one specialist center may not transfer directly to every health system."]
},
{
 slug:"parkinson-neurorehabilitation-six-weeks", title:"Effectiveness of Neurorehabilitation in Improving the Functional Recovery and Quality of Life of Patients With Parkinson's Disease: A Case Report",
 authors:"Pinky D. Israni, Vaishnavi Yadav, Anam R. Sasun", journal:"Cureus", year:2024, specialty:"Neurological Rehabilitation",
 tags:["Parkinson disease","Gait and mobility","Quality of life"], openAccess:true, licenseNote:"Open access under CC BY 4.0; attribute the original authors.",
 sourceUrl:"https://pmc.ncbi.nlm.nih.gov/articles/PMC10853604/", doi:"10.7759/cureus.52021",
 caseSummary:"A 56-year-old man with Parkinson disease sought neurorehabilitation because of generalized weakness, slowness of movement, involuntary upper-limb movements and difficulty walking. The report describes a six-week programme with weekly goals and repeated functional assessment.",
 clinicalFindings:["The patient had a history of falls, increasing right-arm tremor, bradykinesia and difficulty with daily activities.","Examination noted a slightly masked facial expression, forward-head/kyphotic posture and increased tone in selected upper-limb muscle groups.","Outcome measures included the Unified Parkinson's Disease Rating Scale, WHO quality-of-life measure and Barthel Index."],
 intervention:["A planned neurorehabilitation programme used goal-based exercise and functional practice over six weeks.","The article discusses virtual-reality and exergame approaches in the broader context of Parkinson rehabilitation; consult the full methods for the exact components and progression delivered to this patient.","The treatment plan was adjusted around the patient's functional deficits and goals."],
 outcomes:["The authors reported improvement across the measured outcomes during the six-week course.","The case emphasizes functional mobility and quality of life alongside motor symptoms."],
 clinicalLessons:["Parkinson rehabilitation should address activity and participation, not only tremor or muscle tone.","Use measurable baseline and follow-up outcomes and set short, meaningful goals.","Falls, bradykinesia, cognition, confidence and the home environment may all affect the plan."],
 limitations:["A single uncontrolled case cannot determine which intervention component drove the observed changes.","The findings should not be interpreted as proof that exergames or one specific protocol works for every person with Parkinson disease."]
},
{
 slug:"acl-rehab-workload-return-to-sport", title:"Incorporating Workload Measures Into Rehabilitation After Anterior Cruciate Ligament Reconstruction: A Case Report",
 authors:"Jeffrey B. Taylor, Elizabeth Owen, Kevin R. Ford", journal:"International Journal of Sports Physical Therapy", year:2020, specialty:"Sports Rehabilitation",
 tags:["ACL reconstruction","Return to sport","External workload"], openAccess:true, licenseNote:"Open-access full text; check the article licence before reusing any figures or tables.",
 sourceUrl:"https://pmc.ncbi.nlm.nih.gov/articles/PMC7575154/", doi:"10.26603/ijspt20200823",
 caseSummary:"This report follows a 12-year-old female soccer player through rehabilitation after ACL reconstruction. In addition to strength and hop testing, the team measured external workload to examine whether the training exposure approached the demands of competitive soccer.",
 clinicalFindings:["The athlete sustained an ACL tear during a cutting manoeuvre and underwent reconstruction with a hamstring autograft.","Rehabilitation tracked quadriceps and hamstring strength, single-leg hop performance, patient-reported outcomes and movement workload using wearable technology.","The case highlights that limb symmetry and isolated test performance do not fully describe the demands of a match."],
 intervention:["Rehabilitation progressed through early range-of-motion and neuromuscular-control work, strengthening, running, jumping, agility and sport-specific training.","The team tracked activity duration, distance-related measures and jump workload alongside traditional return-to-sport measures.","Progression was staged over many months and linked to performance and movement quality."],
 outcomes:["The athlete achieved more than 90% limb-symmetry indices for quadriceps strength and hop performance at different stages of rehabilitation.","Medical clearance occurred at week 39 and unrestricted sport participation was reported at week 49.","At the time of return to sport, the most intense rehabilitation session still involved less frequent movement, shorter distance and less activity duration than match demands."],
 clinicalLessons:["Return-to-sport decisions should consider the athlete's actual sport demands, not only limb symmetry.","Build exposure to running, jumping, cutting and repeated efforts progressively and safely.","Wearable workload measures may add context, but they do not replace clinical assessment, sport-specific testing or shared decision-making."],
 limitations:["One athlete's timeline cannot be used as a universal ACL protocol, especially for different ages, grafts or associated injuries.","Wearable workload estimates depend on the device and the activity measured."]
},
{
 slug:"combined-acl-pcl-reconstruction-rehabilitation", title:"The Integral Role of Physiotherapy in Combined Complete Anterior Cruciate Ligament and Posterior Cruciate Ligament Arthroscopic Reconstruction: A Case Report",
 authors:"Vaishnavi R. Waghe, Priya Tikhile, Deepali S. Patil", journal:"Cureus", year:2024, specialty:"Orthopaedic Rehabilitation",
 tags:["ACL and PCL","Post-operative rehabilitation","Knee function"], openAccess:true, licenseNote:"Open access under CC BY 4.0; attribute the original authors.",
 sourceUrl:"https://pmc.ncbi.nlm.nih.gov/articles/PMC11069625/", doi:"10.7759/cureus.57556",
 caseSummary:"A 30-year-old man developed right knee pain and swelling after a two-wheeler accident. Investigations identified complete ACL and PCL tears, followed by arthroscopic reconstruction and a structured physiotherapy programme.",
 clinicalFindings:["The combined ligament injury created substantial instability and functional limitations.","Surgical management included ACL reconstruction using semitendinosus and gracilis tendons and arthroscopic PCL reconstruction.","The case required rehabilitation to be coordinated with post-operative precautions and the surgical team's instructions."],
 intervention:["A structured post-operative physiotherapy programme was delivered with progression tailored to the patient's recovery.","The original report describes rehabilitation over 12 weeks; the precise exercise selection and loading restrictions should be checked in the full text before clinical application."],
 outcomes:["The authors reported improvements in knee range of motion and muscle strength after 12 weeks.","The patient achieved improved functional mobility and independent ambulation."],
 clinicalLessons:["Combined ligament reconstruction is not the same as an isolated ACL pathway; respect the surgeon's specific precautions.","Track range, strength, gait and functional mobility, while progressing loading only when appropriate.","A published case can illustrate clinical sequencing but cannot establish one protocol as optimal."],
 limitations:["Single case with surgical and rehabilitation interventions combined, so the contribution of physiotherapy cannot be isolated.","Details from one patient should not override procedure-specific guidance."]
},
{
 slug:"transtibial-amputation-prosthetic-rehabilitation", title:"Rehabilitation of a Patient after a Transtibial Amputation: A Case Report",
 authors:"Sayali S. Mahulkar, Priyanka A. Telang, Sakshi P. Arora", journal:"Cureus", year:2022, specialty:"Orthopaedic Rehabilitation",
 tags:["Transtibial amputation","Prosthetic rehabilitation","Gait training"], openAccess:true, licenseNote:"Open access under CC BY 4.0; attribute the original authors.",
 sourceUrl:"https://pmc.ncbi.nlm.nih.gov/articles/PMC9705052/", doi:"10.7759/cureus.30773",
 caseSummary:"A 50-year-old man with a non-healing foot ulcer and gangrene underwent a left transtibial amputation and was referred for pre-prosthetic and prosthetic rehabilitation. Diabetes, hypertension, malnutrition and depression added complexity to recovery.",
 clinicalFindings:["The limb had developed severe infection and gangrene, making amputation a lifesaving intervention.","The patient required assessment of the residual limb, strength, mobility, balance, endurance and readiness for prosthetic use.","Comorbidities and the condition of the remaining limb were relevant to safe rehabilitation."],
 intervention:["The report describes rehabilitation before and after prosthetic fitting, including strengthening, flexibility, balance and dynamic-equilibrium activities.","Prosthetic prescription and gait training were part of the wider rehabilitation process.","Residual-limb care, medical stability and individualized progression are essential; the paper's details should be read before applying any specific exercise plan."],
 outcomes:["The authors describe improved functional mobility and independence through prosthetic rehabilitation.","The report emphasizes the role of exercise and prosthetic training in daily activity performance."],
 clinicalLessons:["Amputation rehabilitation begins with the whole person: residual limb, sound limb, comorbidities, endurance, mood and personal goals.","Pre-prosthetic preparation and gait training are linked stages, not isolated services.","Protect the remaining limb and coordinate wound, vascular and metabolic care with the multidisciplinary team."],
 limitations:["Single case with limited ability to separate the effects of surgery, medical treatment, prosthetic fitting and physiotherapy.","Outcomes depend heavily on vascular status, wound healing, prosthesis fit and social context."]
},
{
 slug:"volleyball-player-scapular-shoulder-pain", title:"Function-Based Diagnosis and Physiotherapeutic Intervention for Shoulder Pain and Scapulothoracic Movement Control Deficits in Volleyball Players: A Case Report",
 authors:"Khan and colleagues (see original article for full author list)", journal:"Cureus", year:2025, specialty:"Sports Rehabilitation",
 tags:["Shoulder pain","Scapular control","Overhead athlete"], openAccess:true, licenseNote:"Open access under CC BY 4.0; attribute the original authors.",
 sourceUrl:"https://pmc.ncbi.nlm.nih.gov/articles/PMC11910189/", doi:"10.7759/cureus.78952",
 caseSummary:"A 26-year-old university-level volleyball player developed right shoulder pain that limited overhead activity. After an early return to play aggravated symptoms, the physiotherapy assessment emphasized scapulothoracic movement control and sport-specific function.",
 clinicalFindings:["Pain recurred during volleyball smashing after a brief period of sling use and conservative care.","Symptoms affected overhead activity, daily tasks and night comfort.","The assessment considered biomechanics, range of motion, strength and scapular mobility and stability rather than treating pain location alone as the diagnosis."],
 intervention:["A six-week conservative physiotherapy programme focused on restoring scapular function and movement control.","The report describes an individualized plan; consult the original article for its detailed exercise sequence and outcome tables."],
 outcomes:["The authors reported relief of shoulder pain and improvement in scapulothoracic movement-control deficits after the six-week programme."],
 clinicalLessons:["In overhead athletes, examine the kinetic chain and sport task—not only the glenohumeral joint.","A return to sport while symptoms are still irritable may provoke recurrence; use progressive, criteria-informed loading.","A function-based diagnosis links examination findings to the actual movement that matters to the athlete."],
 limitations:["A single case cannot prove that the same scapular approach will work for every shoulder-pain presentation.","Sport participation, spontaneous change and other factors may contribute to improvement."]
},
{
 slug:"dizziness-chronic-rhinosinusitis-physical-therapy", title:"Resolution of Dizziness Following Treatment for Chronic Rhinosinusitis: A Case Report From Physical Therapy Outpatient Setting",
 authors:"Shellie Zsoldos, Chia-Cheng Lin", journal:"Case Reports in Otolaryngology", year:2025, specialty:"Vestibular Rehabilitation",
 tags:["Dizziness","Differential diagnosis","Vestibular assessment"], openAccess:true, licenseNote:"Open-access article; attribute the original authors.",
 sourceUrl:"https://pmc.ncbi.nlm.nih.gov/articles/PMC12619684/", doi:"10.1155/crot/6175181",
 caseSummary:"A 59-year-old man was referred to outpatient physiotherapy for episodes of spinning dizziness and was initially considered to have a peripheral vestibular disorder. His history also included ear symptoms and chronic rhinosinusitis, demonstrating why a broad clinical history matters when symptoms do not fit a simple pattern.",
 clinicalFindings:["Dizziness episodes lasted for hours and lacked a consistent positional trigger.","The patient also reported aural fullness, pressure, tinnitus and nausea; medical investigations identified chronic rhinosinusitis with nasal polyposis and sinus disease.","Vestibular-ocular reflex exercises were prescribed, but travel limited adherence."],
 intervention:["The physiotherapy clinician evaluated vestibular signs and prescribed a home vestibular exercise programme.","The patient subsequently underwent ENT-directed medical and surgical management for chronic rhinosinusitis; this was a multidisciplinary diagnostic and management pathway, not a physiotherapy-only intervention."],
 outcomes:["At follow-up, the patient reported that dizziness and vertigo-like symptoms had resolved after sinus-related treatment.","Because he had not consistently performed the prescribed exercises, the improvement should not be attributed to the exercise programme."],
 clinicalLessons:["Dizziness lasting hours without a clear positional trigger deserves careful differential diagnosis rather than automatic treatment as BPPV.","Ask about hearing, tinnitus, aural pressure, sinus symptoms, medication and medical history; refer when the presentation suggests another cause.","Document what treatment was actually received before attributing improvement to physiotherapy."],
 limitations:["One case cannot establish chronic rhinosinusitis as a common cause of dizziness or prove causation.","Symptoms resolved after combined medical/surgical management; the independent contribution of each factor is uncertain."]
},
{
 slug:"longstanding-bppv-vestibular-exercise", title:"Rehabilitation exercise for treatment of vestibular disorder: a case study",
 authors:"Avraham Feazadeh, Eli Carmeli", journal:"TheScientificWorldJournal", year:2006, specialty:"Vestibular Rehabilitation",
 tags:["BPPV","Positional vertigo","Home exercise"], openAccess:true, licenseNote:"Open access under CC BY 3.0; attribute the original authors.",
 sourceUrl:"https://pmc.ncbi.nlm.nih.gov/articles/PMC5917378/", doi:"10.1100/tsw.2006.19",
 caseSummary:"A 56-year-old woman reported a very long history of positional vertigo. The case describes an individualized vestibular rehabilitation and home-exercise approach, with symptom change monitored over several weeks.",
 clinicalFindings:["The report describes positional vertigo persisting for approximately 35 years and a history of head injury after a fall from a bus.","The presentation was described as unilateral horizontal-canal-type benign paroxysmal positional vertigo.","Assessment and treatment were tailored to the patient's symptoms and tolerance."],
 intervention:["The home programme included eye-movement exercises, Brandt–Daroff exercises and general conditioning.","The original report gives details of the positions and gradual exercise progression; use the article rather than this summary for the exact instructions."],
 outcomes:["The authors reported that the patient was symptom-free four weeks after starting physiotherapy, including when the neck was extended."],
 clinicalLessons:["Match vestibular exercises to the clinical presentation and patient tolerance rather than handing out a generic sheet.","Teach safe setup and symptom monitoring for home exercises.","Persistent or atypical dizziness warrants reassessment; do not assume every episode of vertigo is BPPV."],
 limitations:["This is an older single-case report and cannot establish the effectiveness of the programme for all patients.","Modern vestibular assessment and current guidance should inform clinical decisions; do not reproduce a protocol without checking the full paper."]
}

];
export function getPublishedCaseReport(slug:string){return publishedCaseReports.find(item=>item.slug===slug);}
