export type WorldManualApproach = {
  slug: string;
  title: string;
  category: "Orthopedic reasoning" | "Osteopathic methods" | "Fascial and bodywork" | "Emerging and disputed";
  kind: string;
  evidenceLabel: string;
  origin: string;
  summary: string;
  headline: string;
  scene: string;
  dialogue: string;
  clue: string;
  plotTwist: string;
  aha: string;
  approach: string;
  clinicFlow: string[];
  patientExplanation: string;
  evidence: string;
  myth: string;
  stop: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  sources: { label: string; url: string }[];
};

/** Distinct author-written teaching cases. Historical models are not presented as proven mechanisms. */
export const worldManualApproaches: WorldManualApproach[] = [
  {
    "slug": "paris-approach",
    "title": "Paris Approach to Orthopedic Manual Therapy",
    "category": "Orthopedic reasoning",
    "kind": "Assessment-led manual therapy framework",
    "evidenceLabel": "Framework; components vary in evidence",
    "origin": "Associated with Stanley V. Paris and orthopedic manual physical therapy.",
    "summary": "A systematic orthopedic examination before choosing joint-specific treatment, with safety, functional reassessment and active rehabilitation.",
    "headline": "The shoulder that refused to follow the anatomy diagram",
    "scene": "An architect arrives after weeks of shoulder stiffness. He lifts his arm, winces and waves a printed joint-glide diagram. 'Doctor, the arrow points left, so please push left.' His shoulder has apparently hired its own navigation team.",
    "dialogue": "Patient: 'Can't we just follow the arrow?' Therapist: 'The diagram gets a vote. Your examination gets the deciding vote.'",
    "clue": "Clinical history, irritability, active and passive movement, symptom behavior, accessory motion and functional comparison come before choosing any joint input.",
    "plotTwist": "A joint that feels stiff is not proof that one named arthrokinematic glide is the cause. Neural, inflammatory, traumatic and systemic presentations must be considered first.",
    "aha": "The assessment is not the prequel you skip. It IS the main character.",
    "approach": "The Paris tradition emphasizes orthopedic assessment, joint mechanics and selective treatment. Named-school identity does not establish superiority; the useful transferable principle is test → reason → trial → retest.",
    "clinicFlow": [
      "Clarify the patient's task, history, consent, red flags and a repeatable baseline such as reaching to a shelf.",
      "Compare active and passive motion, irritability, neurologic status when indicated and relevant joint-play findings.",
      "If manual treatment is appropriate and the clinician is trained, choose a comfortable, low-risk input and pair it with active movement.",
      "Immediately retest the original task; progress or change the hypothesis based on meaningful response."
    ],
    "patientExplanation": "We do not choose a technique because a textbook arrow looks convincing. We examine the actual movement problem and test whether treatment helps something that matters to you.",
    "evidence": "Joint mobilization can be an adjunct for selected musculoskeletal presentations; research on joint mobilization in general should not be mislabeled as proof for every Paris-branded protocol.",
    "myth": "'One perfect glide fixes every stiff joint.' Joint findings and symptom responses are more variable than that.",
    "stop": "Avoid forceful mobilization with instability, suspected fracture, infection, significant neurologic deficit or unexplained serious symptoms.",
    "question": "A patient reports a restricted overhead reach but the chosen glide makes no meaningful difference. What next?",
    "options": [
      "Increase force until the textbook glide works.",
      "Reassess the hypothesis and choose a better-supported plan.",
      "Label the patient non-compliant."
    ],
    "answer": 1,
    "explanation": "A meaningful comparable-sign response and safety guide treatment. Do not defend a technique against the patient's findings.",
    "sources": [
      {
        "label": "APTA/JOSPT: clinical practice guidelines",
        "url": "https://www.orthopt.org/content/practice/clinical-practice-guidelines"
      }
    ]
  },
  {
    "slug": "mckenzie-mdt",
    "title": "McKenzie Method — Mechanical Diagnosis & Therapy (MDT)",
    "category": "Orthopedic reasoning",
    "kind": "Active assessment and self-management system",
    "evidenceLabel": "Established assessment system; effects vary by presentation",
    "origin": "Developed by New Zealand physiotherapist Robin McKenzie.",
    "summary": "A classification and self-management framework using symptom response to repeated movements or sustained positions; primarily active care, not a standalone hands-on technique.",
    "headline": "The leg pain that changed its address",
    "scene": "A commuter points to lower-back pain spreading into the calf. 'I think my sciatica has a permanent subscription to my leg.' During a carefully selected movement assessment, the far-away symptoms may change. The postcode matters more than the dramatic name.",
    "dialogue": "Patient: 'My calf is quieter but my back still aches—is that weird?' Therapist: 'It may be useful information. Symptoms sometimes change their mailing address.'",
    "clue": "MDT examines repeated-movement response, directional preference and sometimes centralization, while first screening serious pathology and neurologic changes.",
    "plotTwist": "Extension is not everybody's answer. Peripheralization, new deficits, serious pathology or a non-mechanical pattern are reasons to reconsider the classification.",
    "aha": "The point is not to memorize one famous exercise. It's to discover whether a movement response is repeatable and relevant.",
    "approach": "MDT integrates assessment, classification, education and self-management. Manual forces may sometimes complement it, but patient independence is central.",
    "clinicFlow": [
      "Screen red flags, neurologic changes, irritability, posture, behavior over time and a functional baseline.",
      "Observe and carefully test relevant repeated movements or sustained positions when appropriate, noting symptom location, intensity and after-effects.",
      "Use the response to guide classification and an individualized, tolerable self-management trial; do not force a preconceived direction.",
      "Reassess distal symptoms, mobility and daily activity after the trial and through follow-up."
    ],
    "patientExplanation": "Sometimes a specific movement makes your symptoms better; sometimes it does not. The aim is to find a safe, repeatable movement strategy you can manage yourself.",
    "evidence": "MDT has a body of research as an assessment and management system; outcomes are condition- and subgroup-dependent. Avoid claiming that any one exercise fixes all discs.",
    "myth": "'McKenzie means back extensions for everyone.' It actually means individualized mechanical assessment and classification.",
    "stop": "Stop and seek appropriate evaluation for progressive weakness, bowel or bladder dysfunction, saddle symptoms, major trauma or other concerning neurologic changes.",
    "question": "What best captures MDT's distinguishing feature?",
    "options": [
      "Give lumbar extension to every back-pain patient.",
      "Classify and tailor care to repeated-movement response.",
      "Use manual thrusts as the main treatment."
    ],
    "answer": 1,
    "explanation": "MDT is an assessment-led, active, self-management approach; direction and classification depend on each person's response.",
    "sources": [
      {
        "label": "McKenzie Institute: What is the McKenzie Method?",
        "url": "https://mckenzieinstitute.org/patients/what-is-the-mckenzie-method"
      }
    ]
  },
  {
    "slug": "mennell-joint-play",
    "title": "Mennell Joint-Play Approach",
    "category": "Orthopedic reasoning",
    "kind": "Accessory joint movement assessment concept",
    "evidenceLabel": "Historical framework; modern evidence is joint-specific",
    "origin": "Based on joint-play work described by John M. Mennell.",
    "summary": "Accessory movement, distraction and gliding concepts used to investigate restrictions that voluntary muscle action cannot reproduce directly.",
    "headline": "The door hinge that wasn't actually the door",
    "scene": "A patient bends the wrist and says, 'It moves, so the joint must be perfect.' The clinician explains that visible movement and tiny accessory movements are related—but not identical. The wrist declines to comment.",
    "dialogue": "Patient: 'Can my wrist do an invisible dance?' Therapist: 'More like tiny joint movements. No choreography certificate needed.'",
    "clue": "Accessory joint play helps clinicians reason about motion, but perceived end-feel and translation cannot diagnose a tissue lesion by themselves.",
    "plotTwist": "A joint-play finding is one part of an assessment, not an X-ray built into the therapist's thumbs.",
    "aha": "Visible motion is only part of the mechanics; useful treatment still depends on measurable functional change.",
    "approach": "Mennell emphasized normal mechanical play and its role in joint movement. Present it alongside modern understanding of measurement reliability, symptom response and clinical uncertainty.",
    "clinicFlow": [
      "Document the problematic functional movement and screen fracture, instability, inflammation and neurologic concerns.",
      "Examine relevant active and passive motion, then gently compare selected accessory movements if clinically appropriate.",
      "Choose a low-risk mobility trial only when restrictions, patient goals and safety findings justify it.",
      "Retest the same meaningful movement; move toward active strengthening and self-management."
    ],
    "patientExplanation": "Your wrist can look mobile in one direction while some supporting motions feel limited. We check whether that matters to the action you want back.",
    "evidence": "This is an influential historical manual therapy concept. Do not infer that a palpated restriction identifies exact pathology or that a Mennell-branded manipulation is superior.",
    "myth": "'My thumbs can tell you exactly which microscopic joint surface is wrong.' No reliable magic microscope exists.",
    "stop": "Avoid accessory stress where acute fracture, dislocation, significant instability or active inflammatory joint pathology is suspected.",
    "question": "Which statement is sound clinical reasoning?",
    "options": [
      "Joint-play assessment contributes to a broader examination.",
      "Any reduced glide proves an adhesion.",
      "Larger force always produces more permanent change."
    ],
    "answer": 0,
    "explanation": "Joint-play findings are hypotheses to integrate with examination and functional reassessment, not definitive structural diagnoses.",
    "sources": [
      {
        "label": "Mennell (1970), Rationale of Joint Manipulation",
        "url": "https://academic.oup.com/ptj/article/50/2/181/4596239"
      }
    ]
  },
  {
    "slug": "fascial-distortion-model",
    "title": "Fascial Distortion Model (FDM)",
    "category": "Fascial and bodywork",
    "kind": "Symptom-pattern manual treatment model",
    "evidenceLabel": "Some trials; no demonstrated clinically meaningful superiority",
    "origin": "Developed by physician Stephen Typaldos.",
    "summary": "Uses characteristic descriptions and pain gestures to select model-specific manual techniques for proposed fascial distortion patterns.",
    "headline": "The shoulder pain that came with its own hand-drawn map",
    "scene": "A warehouse worker draws a long line down the arm with one finger: 'It hurts exactly here.' FDM teaches practitioners to notice such gestures. But a patient's gesture is a clue, not a fascia scan from the future.",
    "dialogue": "Patient: 'My finger drew the diagnosis!' Therapist: 'Excellent sketch. Now we still need to do an examination.'",
    "clue": "FDM describes six proposed distortion categories. Treatment can involve firm or focused manual contacts, but its explanatory tissue model is not established by a gesture alone.",
    "plotTwist": "A 2026 systematic review reported some pain reduction in comparisons, yet the pooled advantage over alternatives did not reach a clinically meaningful threshold.",
    "aha": "A compelling map is useful communication—not proof that fascia is physically folded, torn or snapped back into place.",
    "approach": "Describe gesture-led classification, patient goals and modeled interventions, separating the practitioner's hypothesis from demonstrated physiology.",
    "clinicFlow": [
      "Elicit history, symptom location, function, relevant red flags and the patient's spontaneous pain description.",
      "Treat gestures as communication cues; examine musculoskeletal and neurologic differentials rather than assuming a distortion.",
      "If a trained clinician offers a consented, tolerable trial, avoid excessive pressure and explain uncertainties.",
      "Measure pain and meaningful function immediately and on follow-up; prioritize graded activity and self-management."
    ],
    "patientExplanation": "The way you describe and point to pain can guide our questions. It cannot, by itself, tell us which tissue is damaged.",
    "evidence": "A July 2026 review of 14 studies (644 participants) found no clinically meaningful benefit over alternative interventions despite a modest pooled statistical difference.",
    "myth": "'Each hand gesture proves one exact fascial distortion.' Proposed classifications are not a substitute for differential diagnosis.",
    "stop": "Avoid intense pressure with acute tissue injury, bleeding risk, thrombosis suspicion, skin infection, cancer-related tissue concerns or impaired sensation.",
    "question": "A patient traces a long painful line with one finger. What should you infer?",
    "options": [
      "A specific fascial distortion is definitely present.",
      "The gesture is irrelevant to the interview.",
      "The gesture may guide inquiry but cannot confirm tissue pathology."
    ],
    "answer": 2,
    "explanation": "Patient gesture can be useful symptom information; it does not validate an unverified tissue mechanism or replace screening.",
    "sources": [
      {
        "label": "2026 systematic review and meta-analysis of FDM",
        "url": "https://pubmed.ncbi.nlm.nih.gov/42441315/"
      }
    ]
  },
  {
    "slug": "balanced-ligamentous-tension",
    "title": "Balanced Ligamentous Tension (BLT)",
    "category": "Osteopathic methods",
    "kind": "Indirect / balanced positioning technique",
    "evidenceLabel": "Limited direct technique-specific clinical evidence",
    "origin": "An osteopathic approach linked to ligamentous-articular tension models.",
    "summary": "Uses subtle positioning and clinician monitoring in an attempt to find a comfortable balance of periarticular tension.",
    "headline": "The wrist that wanted a ceasefire, not a tug-of-war",
    "scene": "A keyboard user arrives with a sore wrist and asks for a hard stretch. The therapist explains an indirect osteopathic idea: sometimes the first experiment is finding a position that stops arguing with the tissues.",
    "dialogue": "Patient: 'No pulling?' Therapist: 'Not every negotiation needs a wrestling match.'",
    "clue": "BLT models position and ligamentous tension around a joint. The proposed proprioceptive explanation is a model—not proof of literal ligament realignment.",
    "plotTwist": "A comfortable manual experience can occur without demonstrating that ligaments have been mechanically reset.",
    "aha": "Less force can be an intentional choice, not evidence of less clinical reasoning.",
    "approach": "Learn the conceptual language of disengagement, exaggeration of ease and balance while recognizing that hands-on application requires trained supervision.",
    "clinicFlow": [
      "Screen injury mechanism, instability, inflammation, neurovascular status and consent.",
      "Determine whether mild indirect positioning might be tolerated better than direct stretch; avoid forced end ranges.",
      "With appropriate training, monitor comfort and movement rather than chasing a promised palpable 'release.'",
      "Recheck a meaningful joint task and integrate self-management exercises."
    ],
    "patientExplanation": "This style of hands-on care explores gentle positions rather than forcing through pain. Improvement is judged by what you can do afterward, not by a claim that your ligaments were 'put back.'",
    "evidence": "Osteopathic texts describe BLT, but high-quality clinical comparisons specific to BLT remain limited; theoretical explanations should not be presented as established tissue corrections.",
    "myth": "'A tiny position change proves a ligament has been reset.' Comfort and re-measured function are more credible outcomes.",
    "stop": "Do not use manual stress with suspected fracture, dislocation, major instability, active infection or unexplained neurologic symptoms.",
    "question": "Which explanation is scientifically responsible after a comfortable BLT session?",
    "options": [
      "A ligament certainly snapped into its correct anatomical place.",
      "A change in comfort may occur; reassess function without claiming structural correction.",
      "A painless session guarantees long-term cure."
    ],
    "answer": 1,
    "explanation": "Comfort or symptom change is observable; exact ligament 'reset' mechanisms are not established.",
    "sources": [
      {
        "label": "NCBI Bookshelf: BLT/LAS in osteopathic practice",
        "url": "https://www.ncbi.nlm.nih.gov/books/NBK560775/"
      }
    ]
  },
  {
    "slug": "spencer-shoulder-sequence",
    "title": "Spencer Shoulder Technique",
    "category": "Osteopathic methods",
    "kind": "Articulatory shoulder sequence",
    "evidenceLabel": "Traditional technique; limited isolated outcome evidence",
    "origin": "Classical osteopathic sequence associated with C. H. Spencer.",
    "summary": "A structured sequence of guided shoulder movements historically taught for mobility and symptom-focused articulatory care.",
    "headline": "The shoulder that wanted seven buttons on the remote",
    "scene": "A tailor can reach forward but struggles behind the back. 'My shoulder has six personalities,' he says. The Spencer tradition approaches shoulder mobility through a sequence rather than one dramatic movement.",
    "dialogue": "Patient: 'Can we do the whole routine in one go?' Therapist: 'Only if your shoulder has read the safety instructions.'",
    "clue": "Shoulder mobility is multidirectional. A systematic sequence can help organize assessment, but no sequence replaces diagnosis of traumatic tears, fractures or neurologic disease.",
    "plotTwist": "A smoother shoulder after guided movement does not establish one unique osteopathic mechanism or prove superiority over exercise.",
    "aha": "A sequence helps you remember options; the patient response decides which are worth using.",
    "approach": "Teach the historical shoulder articulatory concept, movement directions and clinician reasoning—not a one-size-fits-all fixed-dose prescription.",
    "clinicFlow": [
      "Screen traumatic weakness, instability, fracture risk, severe inflammation and neurologic symptoms.",
      "Document active elevation, external rotation, hand-behind-back ability and painful limits.",
      "For suitable cases and trained clinicians, trial gentle guided movement only within tolerable ranges; do not force a full historical sequence.",
      "Retest function and supplement with progressive strength and active mobility."
    ],
    "patientExplanation": "We can explore the shoulder's different movement directions carefully and see which ones help. We avoid painful forcing and focus on your real activities.",
    "evidence": "The Spencer sequence is a documented osteopathic approach, but high-quality trials isolating this exact sequence are sparse. General shoulder mobility evidence cannot be equated with technique-specific proof.",
    "myth": "'Seven movements means seven times the benefit.' More steps are not automatically better.",
    "stop": "Avoid forceful shoulder movement after recent dislocation, fracture, acute cuff tear, marked instability or unexplained severe weakness.",
    "question": "A patient has acute traumatic inability to raise the arm. What should happen before any Spencer sequence?",
    "options": [
      "Complete all directions rapidly.",
      "Check for serious structural injury and consider timely referral.",
      "Assume stiffness from posture."
    ],
    "answer": 1,
    "explanation": "New major weakness after trauma needs examination and potential imaging/referral before guided mobilization.",
    "sources": [
      {
        "label": "APTA/JOSPT: rotator cuff tendinopathy guideline",
        "url": "https://doi.org/10.2519/jospt.2025.13182"
      }
    ]
  },
  {
    "slug": "still-technique",
    "title": "Still Technique",
    "category": "Osteopathic methods",
    "kind": "Positional / guided movement osteopathic method",
    "evidenceLabel": "Historical description; clinical evidence sparse",
    "origin": "Named for osteopathic physician Andrew Taylor Still.",
    "summary": "A historical osteopathic approach using facilitated positioning and guided movement; safe use depends on precise clinical training and assessment.",
    "headline": "The stiff neck that did not need an action-movie ending",
    "scene": "A designer turns the head carefully and whispers, 'Please don't do a dramatic neck crack; I have a meeting afterward.' A historical osteopathic idea offers a quieter storyline: gentle positioning followed by guided motion.",
    "dialogue": "Patient: 'No superhero neck twist?' Therapist: 'The goal is movement, not sound effects.'",
    "clue": "Traditional Still methods combine positioning toward ease with a guided arc; implementations vary with body region and training tradition.",
    "plotTwist": "The absence of a 'pop' does not tell you success or failure. Equally, a pop does not prove that anatomy was corrected.",
    "aha": "Technique theater is not an outcome measure.",
    "approach": "Separate the historical principles from clinical results. Use only clinically justified and properly trained techniques; in the neck, vascular and neurologic screening are especially important.",
    "clinicFlow": [
      "Screen for serious cervical pathology, vascular and neurologic symptoms, trauma and instability.",
      "Establish comfortable active range and a functional comparable sign.",
      "If appropriate within specialist training, choose low-force positioning; do not teach high-risk cervical movement from text alone.",
      "Reassess symptoms and movement; transition to safe patient-led mobility work."
    ],
    "patientExplanation": "There are gentle historical hands-on approaches that explore comfortable positioning and movement, but we use them only when examination shows it is sensible.",
    "evidence": "Still technique is established as a named historical osteopathic method; clinical outcome claims specific to the maneuver are not robustly established.",
    "myth": "'A click means the vertebra went back.' Joint noises are not evidence of anatomical repositioning.",
    "stop": "Avoid manipulation with vascular red flags, new neurologic deficit, suspected myelopathy, cervical instability, infection or recent trauma.",
    "question": "Why is an audible pop a poor treatment goal?",
    "options": [
      "It does not reliably prove better function or corrected anatomy.",
      "It is always essential for pain relief.",
      "It confirms the original diagnosis."
    ],
    "answer": 0,
    "explanation": "Clinical success is judged by safety, meaningful function and symptom response rather than joint noise.",
    "sources": [
      {
        "label": "NCBI Bookshelf: osteopathic cervical safety considerations",
        "url": "https://www.ncbi.nlm.nih.gov/books/NBK565847/"
      }
    ]
  },
  {
    "slug": "osteopathic-articulatory",
    "title": "Osteopathic Articulatory Techniques",
    "category": "Osteopathic methods",
    "kind": "Repetitive guided joint movement family",
    "evidenceLabel": "Broader manual evidence; isolated family evidence variable",
    "origin": "Part of traditional osteopathic manipulative treatment.",
    "summary": "Repeated guided joint movements used to explore and improve tolerable mobility rather than performing one high-velocity thrust.",
    "headline": "The stiff thoracic spine and the world's least exciting dance partner",
    "scene": "A university lecturer says twisting to write on the classroom board feels like moving a filing cabinet. Gentle guided joint movement may help explore range. The therapist promises one thing: nobody must dance salsa.",
    "dialogue": "Patient: 'Will I be bounced like a trampoline?' Therapist: 'No. We're exploring a movement, not testing the clinic furniture.'",
    "clue": "Rhythmic guided joint movement can be graded by irritability, patient control and functional response. Joint noises and palpable 'releases' are not required.",
    "plotTwist": "A stiff-feeling region can coexist with pain sensitivity, deconditioning or protective behavior. The plan must go beyond passive movement.",
    "aha": "Hands-on movement is a bridge to moving yourself, not a subscription to the treatment table.",
    "approach": "Understand repeated articulatory movements as one family of manual interventions and relate them to mobility impairment, clinical screening and exercise.",
    "clinicFlow": [
      "Identify a meaningful movement limit and screen instability, fracture risk, inflammatory disease and neurologic warning signs.",
      "Select a comfortable position and a small graded movement trial only within clinician competence.",
      "Watch irritability, guarding and symptom behavior; avoid forced or high-velocity movements.",
      "Reassess trunk rotation, breathing tolerance or the relevant task, then build active mobility and strength."
    ],
    "patientExplanation": "We may use gentle guided movement to make an uncomfortable movement feel easier, then help you practise it yourself so the change is useful.",
    "evidence": "Research on broader manual therapy may support short-term symptom relief for some conditions, but does not prove superiority of this exact named osteopathic family.",
    "myth": "'If it moves passively, it will stay improved forever.' Long-term gains usually require active participation.",
    "stop": "Avoid forceful articulation with instability, suspected fracture, infection, acute inflammatory pathology or severe neurologic findings.",
    "question": "A thoracic movement is easier after gentle guidance. Best next step?",
    "options": [
      "Repeat passive treatment indefinitely.",
      "Tell the patient the joint is now permanently aligned.",
      "Integrate active motion and exercise, and retest a relevant task."
    ],
    "answer": 2,
    "explanation": "A short-term response can create an opportunity for active rehabilitation; it is not proof of permanent structural change.",
    "sources": [
      {
        "label": "APTA Orthopedic Section: clinical practice guidelines",
        "url": "https://www.orthopt.org/content/practice/clinical-practice-guidelines"
      }
    ]
  },
  {
    "slug": "osteopathic-lymphatic-pump",
    "title": "Osteopathic Lymphatic Pump Methods",
    "category": "Osteopathic methods",
    "kind": "Specialized rhythmic techniques / circulatory claims",
    "evidenceLabel": "Physiological rationale; condition-specific clinical outcomes uncertain",
    "origin": "Osteopathic traditions including thoracic and pedal pump variants.",
    "summary": "Specialized osteopathic approaches intended to influence fluid movement; not interchangeable with evidence-based management of edema, infection or systemic illness.",
    "headline": "When the patient asked the therapist to unclog the body's plumbing",
    "scene": "A man with swelling after an ankle injury asks, 'Can you pump all the bad fluid out like a bicycle tire?' The therapist appreciates the analogy—and immediately checks whether this swelling could signal something that must not be massaged.",
    "dialogue": "Patient: 'So you're a human drainage machine?' Therapist: 'No, and your veins would like a proper medical history first.'",
    "clue": "Swelling requires diagnostic thinking: trauma, venous disease, DVT risk, cardiac illness, infection and medication effects can demand different pathways.",
    "plotTwist": "There is no license to apply rhythmic pressure to any swollen limb. A possible DVT is a stop-and-refer situation, not a technique-selection puzzle.",
    "aha": "Before discussing fluid movement, find out why the fluid is there.",
    "approach": "Teach the historical osteopathic principles and safety screen without treating unproven immune or infection benefits as established clinical facts.",
    "clinicFlow": [
      "Determine swelling onset, distribution, temperature, pain, risk factors, systemic symptoms and patient status.",
      "Exclude urgent causes such as suspected DVT and serious infection; obtain appropriate referral when needed.",
      "Use evidence-based management of the underlying condition; any specialized manual adjunct requires training, consent and clinician oversight.",
      "Monitor relevant swelling and function without claiming generalized immune-system stimulation."
    ],
    "patientExplanation": "Swelling can have several causes. First we identify the cause and make sure manual pressure would be safe. No pumping technique replaces that assessment.",
    "evidence": "Lymphatic techniques are described in osteopathic literature, but effects on immune outcomes or broad medical conditions should not be claimed without strong condition-specific evidence.",
    "myth": "'If you press rhythmically, you can safely drain any swollen limb.' Absolutely not.",
    "stop": "Do not perform with suspected DVT, unstable heart failure, acute fracture, necrotizing infection or other major circulatory/systemic instability.",
    "question": "A hot, swollen calf appears after prolonged immobilization. What is the priority?",
    "options": [
      "Perform an intense pump session.",
      "Assess urgently for DVT and do not massage the limb.",
      "Assume normal post-exercise soreness."
    ],
    "answer": 1,
    "explanation": "DVT is a potentially serious condition; manual pumping is inappropriate until a safe diagnosis and care plan are established.",
    "sources": [
      {
        "label": "NCBI Bookshelf: Osteopathic Lymphatic Treatments",
        "url": "https://www.ncbi.nlm.nih.gov/books/NBK559051/"
      }
    ]
  },
  {
    "slug": "rolfing-structural-integration",
    "title": "Rolfing / Structural Integration",
    "category": "Fascial and bodywork",
    "kind": "Bodywork and movement education system",
    "evidenceLabel": "Limited high-quality condition-specific evidence",
    "origin": "Associated with Ida Rolf's approach to structural integration.",
    "summary": "A bodywork tradition combining soft-tissue contact and awareness of posture, balance and movement; structural 'realignment' claims require caution.",
    "headline": "The posture police are off duty",
    "scene": "A graphic designer enters pointing to the forward-head photo on her phone. 'My posture app says I'm a disaster.' The therapist is more interested in whether she can work, turn and move comfortably than issuing a posture ticket.",
    "dialogue": "Patient: 'Can you iron my fascia straight?' Therapist: 'You're a person, not a shirt.'",
    "clue": "Posture varies across tasks and people. Pain and structural alignment do not follow a simple one-to-one relationship.",
    "plotTwist": "A meaningful change in comfort or movement does not prove that fascia has been permanently reshaped or that a 'perfect' posture exists.",
    "aha": "The goal is better movement options—not winning a still-photo competition.",
    "approach": "Explain the bodywork and movement-awareness framework, distinguish subjective experience from demonstrated tissue remodeling and avoid promising lasting alignment correction.",
    "clinicFlow": [
      "Ask which movements and daily tasks matter and screen relevant systemic or neurologic red flags.",
      "Explore comfortable movement options, strength and endurance rather than diagnosing someone by a posture photograph.",
      "If a qualified provider offers bodywork, use consent and tolerable pressure, making no permanent-remodeling promise.",
      "Retest function, build individualized exercises and encourage varied, comfortable postures."
    ],
    "patientExplanation": "Posture is not a pass-or-fail exam. Changing positions, moving more often and building strength may matter more than chasing a photograph of perfection.",
    "evidence": "There is limited robust, condition-specific evidence that this branded structural integration method outperforms established active care or permanently alters bodily alignment.",
    "myth": "'We can mechanically straighten your fascia into a permanently perfect posture.' The human body is not a pressed suit.",
    "stop": "Avoid aggressive soft-tissue pressure with fragile tissues, acute injury, anticoagulation concerns, infection or unexplained neurologic symptoms.",
    "question": "After a bodywork session the patient stands taller. What is justified?",
    "options": [
      "The fascia was permanently reshaped.",
      "Their skeletal alignment is now cured.",
      "Reassess comfort and activity rather than asserting permanent structural change."
    ],
    "answer": 2,
    "explanation": "An observed postural or symptom change does not establish long-term tissue remodeling or superiority.",
    "sources": [
      {
        "label": "Overview of current physical therapy practice guidelines",
        "url": "https://www.orthopt.org/content/practice/clinical-practice-guidelines"
      }
    ]
  },
  {
    "slug": "bowen-technique",
    "title": "Bowen Technique / Bowenwork",
    "category": "Emerging and disputed",
    "kind": "Gentle bodywork with pauses",
    "evidenceLabel": "Insufficient high-quality effectiveness evidence",
    "origin": "Bodywork method associated with Australian practitioner Tom Bowen.",
    "summary": "A series of gentle rolling contacts interspersed with pauses; claims of whole-body resetting are not established by credible clinical evidence.",
    "headline": "The treatment where even the therapist takes a coffee break",
    "scene": "A patient expects nonstop squeezing and is surprised by brief soft-tissue contacts followed by pauses. 'Did you forget what you were doing?' he asks. The treatment tradition intentionally includes waiting.",
    "dialogue": "Patient: 'Why did your hands leave?' Therapist: 'The method includes pauses. The science still asks what benefit that actually adds.'",
    "clue": "Bowenwork is distinct in its rhythm and rest periods, but pleasant treatment experiences cannot establish unique physiological resets.",
    "plotTwist": "A 2011 systematic review found a small, methodologically limited evidence base. This is not proof of broad clinical effectiveness.",
    "aha": "A pause can be part of the method; that doesn't mean it secretly reboots the nervous system.",
    "approach": "Describe the method historically and evaluate claims critically. Do not suggest it replaces rehabilitation, medical assessment or proven treatment pathways.",
    "clinicFlow": [
      "Explain limited evidence, screen symptoms and get consent for any touch.",
      "Agree on a measurable target such as pain, movement or daily activity before discussing any adjunct.",
      "If a trained practitioner provides gentle bodywork, use comfortable contact and avoid grand claims.",
      "Review patient-reported change against natural symptom variability and maintain evidence-based care."
    ],
    "patientExplanation": "This gentle method uses brief contacts and pauses. Some people find it relaxing, but scientific evidence for treating specific conditions remains limited.",
    "evidence": "A systematic review identified very few rigorous studies, so convincing condition-specific effectiveness claims are not warranted.",
    "myth": "'The pause proves the nervous system has been reset.' No validated reset test exists.",
    "stop": "Do not postpone referral for red-flag symptoms or replace established care for significant injury or neurologic disease.",
    "question": "Someone claims Bowen pauses permanently reset the nervous system. Which response is best?",
    "options": [
      "That mechanism is not established; judge evidence and meaningful outcomes.",
      "It must be true because the session was relaxing.",
      "That claim eliminates the need for medical evaluation."
    ],
    "answer": 0,
    "explanation": "The claimed neurological reset is not an established physiological finding and relaxation alone is not efficacy evidence.",
    "sources": [
      {
        "label": "Bowenwork systematic review (PubMed)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/22087611/"
      }
    ]
  },
  {
    "slug": "visceral-manipulation",
    "title": "Visceral Manipulation / Visceral Fascial Therapy",
    "category": "Emerging and disputed",
    "kind": "Hands-on approach directed at visceral mobility concepts",
    "evidenceLabel": "Poor-quality evidence; not established for internal disease",
    "origin": "Promoted in several osteopathic and bodywork traditions.",
    "summary": "Techniques proposed to influence internal-organ or surrounding fascial mobility; serious medical causes of abdominal or pelvic symptoms must be excluded.",
    "headline": "The abdomen that was not asking for a superhero rescue",
    "scene": "A patient with abdominal discomfort says a friend told him his organs are 'stuck' and need pushing back into alignment. The physiotherapist checks for fever, bleeding, bowel changes and medical red flags before anyone talks about touch.",
    "dialogue": "Patient: 'Can you move my liver back?' Therapist: 'First let's make sure nothing medically important is happening. Organs don't come with a reset button.'",
    "clue": "Abdominal, pelvic and referred pain have broad differentials. Palpation alone cannot prove an organ is mechanically misplaced or confirm disease.",
    "plotTwist": "A systematic review of 11 trials judged the evidence for visceral fascial therapy poor, with substantial risk-of-bias concerns.",
    "aha": "The more mysterious the body part, the more important the ordinary medical history becomes.",
    "approach": "Treat visceral manipulation as an approach to study critically, not a substitute for medical investigation or established pelvic/gastrointestinal care.",
    "clinicFlow": [
      "Screen abdominal pain for onset, severity, fever, bleeding, bowel and urinary symptoms, weight loss and systemic warning signs.",
      "Refer promptly where acute or unexplained medical pathology is possible; do not assume a fascial cause.",
      "Discuss uncertainty openly; avoid forceful abdominal contact and offer appropriate evidence-based rehabilitation when relevant.",
      "Measure the patient's actual functional goals and coordinate with medical providers."
    ],
    "patientExplanation": "Your organs are not loose furniture. Pain in the abdomen can have many causes, some serious, and must be assessed before any manual approach is considered.",
    "evidence": "A systematic review of randomized trials concluded that evidence for visceral fascial treatment efficacy is poor; several included studies had high risk of bias.",
    "myth": "'A practitioner can palpate and push an internal organ back into its correct position.' This is not a validated diagnosis or treatment claim.",
    "stop": "Never use as a substitute for urgent evaluation of severe abdominal pain, gastrointestinal bleeding, fever, suspected pregnancy complication or acute surgical abdomen.",
    "question": "A patient with new severe abdominal pain asks for visceral manipulation. Best action?",
    "options": [
      "Use firm abdominal pressure to break fascial restrictions.",
      "Consider urgent medical assessment and defer manual treatment.",
      "Promise that an organ release will correct the problem."
    ],
    "answer": 1,
    "explanation": "New severe abdominal pain is a medical assessment issue. Manual bodywork should not delay appropriate urgent care.",
    "sources": [
      {
        "label": "Systematic review of visceral fascial therapy trials",
        "url": "https://pubmed.ncbi.nlm.nih.gov/37525195/"
      }
    ]
  },
  {
    "slug": "craniosacral-therapy",
    "title": "Craniosacral Therapy",
    "category": "Emerging and disputed",
    "kind": "Very light-touch craniosacral bodywork",
    "evidenceLabel": "No convincing benefit in assessed conditions",
    "origin": "A craniosacral bodywork system used in some complementary care traditions.",
    "summary": "A light-touch approach linked to proposed craniosacral rhythms; reproducible detection and broad therapeutic claims are not established.",
    "headline": "Can you tune the skull like a radio?",
    "scene": "A patient arrives with recurring headaches after reading that someone can tune the rhythm of the skull. The therapist smiles at the metaphor but does not let the metaphor write the treatment plan.",
    "dialogue": "Patient: 'Is there a dial behind my ear?' Therapist: 'No hidden radio. We should check the headache pattern and warning signs first.'",
    "clue": "Headaches require assessment for dangerous secondary causes, neurological findings and appropriate condition-specific management.",
    "plotTwist": "A systematic review/meta-analysis of craniosacral therapy found no clinically relevant benefits for the musculoskeletal and non-musculoskeletal conditions assessed.",
    "aha": "An elegant story about anatomy is not evidence that a treatment works.",
    "approach": "Introduce the historical craniosacral concept as part of an evidence-literacy chapter. Avoid portraying proposed rhythms as verified clinical measurements.",
    "clinicFlow": [
      "Clarify the actual symptom problem and screen headache, neurologic and systemic red flags.",
      "Explain the limited rationale and negative clinical evidence for CST as a treatment.",
      "Prioritize assessment-led, evidence-based headache or MSK care instead of making craniosacral correction claims.",
      "If discussing touch, emphasize consent and patient preference without misrepresenting efficacy."
    ],
    "patientExplanation": "Some approaches use very light touch on the head or body, but current research has not shown convincing improvement for the conditions assessed. We should choose care that matches your symptoms and evidence.",
    "evidence": "A systematic review/meta-analysis of 15 randomized trials in qualitative synthesis and seven in meta-analysis reported no significant or clinically relevant benefit for the assessed conditions.",
    "myth": "'Therapists can feel and reset a proven skull-fluid rhythm to cure disease.' The mechanism and clinical efficacy are not established.",
    "stop": "New sudden severe headache, neurological symptoms, infection signs or head injury require medical assessment rather than bodywork.",
    "question": "Which evidence statement best describes craniosacral therapy for the conditions assessed in a 2024 review?",
    "options": [
      "Strong proven benefits for all headache and spine disorders.",
      "It physically repositions skull bones in adults.",
      "No convincing clinically relevant benefits were demonstrated."
    ],
    "answer": 2,
    "explanation": "The systematic review did not show clinically relevant benefit for its assessed outcomes; claims beyond the evidence should not be made.",
    "sources": [
      {
        "label": "Systematic review/meta-analysis of craniosacral therapy",
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC10970181/"
      }
    ]
  }
];
