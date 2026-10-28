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
 authors:"Takatoshi Kasai et al.", journal:"Cureus", year:2025, specialty:"Cardiorespiratory",
 tags:["COPD","Pulmonary rehabilitation","Exercise capacity","Psychological wellbeing"], openAccess:true, licenseNote:"Open access under CC BY; attribute the original authors.",
 sourceUrl:"https://pmc.ncbi.nlm.nih.gov/articles/PMC12736919/",
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
 sourceUrl:"https://pmc.ncbi.nlm.nih.gov/articles/PMC11060019/",
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
 sourceUrl:"https://pmc.ncbi.nlm.nih.gov/articles/PMC11293038/",
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
 sourceUrl:"https://pmc.ncbi.nlm.nih.gov/articles/PMC10774834/",
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
 sourceUrl:"https://pmc.ncbi.nlm.nih.gov/articles/PMC8274657/",
 caseSummary:"A 71-year-old man with COPD and COVID-19 pneumonia required mechanical ventilation and deep sedation. The case describes rehabilitation beginning during critical illness, with activities adjusted to respiratory and medical status.",
 clinicalFindings:["Severe pneumonia with mechanical ventilation and deep sedation.","The patient had COPD and several comorbidities, increasing rehabilitation complexity.","Early sessions were constrained by critical-care status and respiratory management."],
 intervention:["The team began with passive range-of-motion work and positioning/mobility activities while the patient was sedated, progressing as his condition allowed.","The report emphasizes coordination with the ICU team and status-driven adjustments."],
 outcomes:["The patient later improved in daily function and was able to walk independently to the toilet without respiratory distress, according to the report."],
 clinicalLessons:["Rehabilitation can start with positioning and passive movement when active participation is not possible, if medically appropriate.","ICU physiotherapy requires continuous coordination with ventilation, oxygenation and hemodynamic status.","Progression should follow stability and tolerance, not a preset timetable."],
 limitations:["Single case from a highly specific clinical context; not a protocol for unsupervised or routine use.","Interventions and recovery occurred alongside intensive medical treatment."]
}
];
export function getPublishedCaseReport(slug:string){return publishedCaseReports.find(item=>item.slug===slug);}
