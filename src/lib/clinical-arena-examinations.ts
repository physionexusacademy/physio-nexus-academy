/**
 * Case-specific assessment decisions for the PNA Clinical Challenge Arena.
 * Each of the four choices represents a real assessment direction. Students
 * must choose the MOST informative and safest initial priority for this case.
 * Educational simulation; not a patient-specific assessment protocol.
 */
export type ExaminationCase = {
  id: string;
  title: string;
  history: string;
  findings: string[];
  safety?: boolean;
};

type FourChoices = [string, string, string, string];
type ThreeReasons = [string, string, string];
type ExaminationBlueprint = {
  options: FourChoices;
  why: string;
  alternatives: ThreeReasons;
  urgent?: boolean;
};
export type ExaminationQuestion = {
  question: string;
  options: FourChoices;
  correct: number;
  why: string;
  alternatives: ThreeReasons;
};

/** Index 0 is the strongest choice; the UI redistributes answer letters by case. */
const exams: Record<string, ExaminationBlueprint> = {
  "Cervical radiculopathy": {
    options: [
      "Compare cervical symptom provocation with dermatomal sensation, myotomal strength and reflexes; assess for progressive or cord signs.",
      "Map median and ulnar nerve sensory territories and test peripheral nerve provocation at the wrist and elbow.",
      "Assess shoulder active and passive range, resisted abduction and rotator cuff load tolerance.",
      "Assess upper-quarter positional symptom changes and vascular findings during arm elevation."
    ],
    why: "Radiating symptoms with segmental sensory, reflex or motor change prioritize a cervical neurological examination. Use a pattern of concordant findings rather than treating one provocation test as definitive; screen for myelopathy.",
    alternatives: [
      "Peripheral entrapment is a valid differential, but it does not test the possible nerve-root pattern as directly.",
      "Shoulder testing helps exclude local pain sources, but it cannot explain a matching segmental neurological deficit on its own.",
      "Thoracic outlet assessment may be relevant, but first map the cervical neurological pattern and urgent deficits."
    ]
  },
  "Cervical myelopathy": {
    urgent: true,
    options: [
      "Briefly assess gait, hand dexterity, upper motor neuron signs and neurological progression, then arrange urgent medical assessment.",
      "Perform a cervical nerve-root provocation cluster and arrange a routine physiotherapy follow-up if arm pain is reproduced.",
      "Assess isolated median and ulnar nerve entrapment at the wrist and elbow before making a referral decision.",
      "Quantify neck range, postural endurance and deep neck flexor function before deciding on escalation."
    ],
    why: "Hand clumsiness, gait disturbance and upper motor neuron signs suggest possible spinal cord involvement. They require prompt medical evaluation, not a prolonged trial of routine rehabilitation.",
    alternatives: [
      "Root provocation investigates radiculopathy, not the time-sensitive possibility of cord dysfunction.",
      "Peripheral neuropathy may coexist, but it cannot safely explain progressive gait and bilateral hand changes without cord screening.",
      "Mechanical neck measures are useful later; they must not delay assessment and escalation of possible myelopathy."
    ]
  },
  "Mechanical neck pain": {
    options: [
      "Screen concerning symptoms and neurology, then assess cervical active movement, symptom response and meaningful daily tasks.",
      "Prioritize upper-limb neurodynamic testing and full peripheral nerve mapping despite no arm symptoms.",
      "Prioritize vestibular and ocular motor examination for an isolated posture-related neck complaint.",
      "Prioritize shoulder apprehension, relocation and rotator cuff load testing."
    ],
    why: "For movement-related local neck pain without objective neurological change, symptom behavior, cervical motion and function establish the most useful baseline after safety screening.",
    alternatives: [
      "Neural testing becomes more important when radiating symptoms or neurological findings are present.",
      "Vestibular testing matters with relevant dizziness or visual symptoms, which are not the leading features here.",
      "Shoulder pathology can mimic neck pain, but shoulder instability testing is not the most informative first priority."
    ]
  },
  "Cervicogenic headache": {
    options: [
      "Screen for secondary-headache red flags, then assess cervical motion and whether neck movement reproduces the familiar headache.",
      "Characterize light sensitivity, aura and migraine-associated nausea before examining neck-provoked symptoms.",
      "Assess temporomandibular loading, jaw motion and chewing-related symptom reproduction.",
      "Assess scalp and upper trapezius tenderness alone as the primary diagnostic examination."
    ],
    why: "A neck-linked, familiar headache with restricted cervical movement calls for cervical movement assessment after headache safety screening. Reproduction of a familiar headache supports reasoning but is not a stand-alone diagnostic test.",
    alternatives: [
      "Migraine features are useful differential questions, but this case's movement-linked cervical features need direct assessment.",
      "TMJ assessment is appropriate if jaw symptoms are present, but it is less targeted here.",
      "Tenderness alone is nonspecific and cannot distinguish cervicogenic headache from other headache disorders."
    ]
  },
  "Thoracic outlet presentation": {
    options: [
      "Screen vascular warning signs and compare positional symptoms with neurological findings; distinguish cervical and peripheral nerve sources.",
      "Perform a cervical radiculopathy screen with segmental sensation, reflexes and myotomes as the sole evaluation.",
      "Perform resisted rotator cuff testing and painful-arc assessment without a neurovascular screen.",
      "Use one arm-elevation provocation test as the definitive confirmation of thoracic outlet syndrome."
    ],
    why: "Overhead-related arm symptoms require careful comparison of neurological and vascular features and mimics. No single positional provocative test is diagnostic; urgent vascular signs warrant immediate escalation.",
    alternatives: [
      "A cervical screen is important, but it should not replace assessment of positional and vascular features.",
      "Rotator cuff symptoms can coexist, but shoulder loading alone misses the key neurovascular differential.",
      "Provocation tests have limited specificity and must not be treated as proof without differential and safety assessment."
    ]
  },
  "Lumbar radiculopathy": {
    options: [
      "Screen cauda equina symptoms and assess lumbar symptom response, leg myotomes, dermatomes, reflexes and appropriate neural tension.",
      "Examine hip flexion/internal rotation and groin symptom reproduction as the primary evaluation.",
      "Use repeated lumbar movement tests alone without assessing motor, sensory or reflex changes.",
      "Prioritize walking-induced calf symptoms and peripheral pulses for vascular claudication."
    ],
    why: "Radiating leg pain with matching neurological changes calls for segmental neurological assessment, symptom response and red-flag screening. Neural tension findings must be interpreted in context.",
    alternatives: [
      "Hip pathology can refer pain, but segmental deficits need to be mapped first.",
      "Directional-preference testing adds information but cannot replace a neurological examination.",
      "Vascular screening may be indicated, but the described nerve-root pattern is more directly assessed neurologically."
    ]
  },
  "Nonspecific low back pain": {
    options: [
      "Screen red flags and neurology, then assess repeated or functional lumbar movements, load tolerance and patient-valued activities.",
      "Prioritize straight-leg raise and segmental sensory mapping as the only primary outcome measures.",
      "Prioritize hip impingement testing and passive hip rotation before observing back-related tasks.",
      "Prioritize sacroiliac provocation tests without first assessing movement behavior or safety."
    ],
    why: "With uncomplicated mechanically sensitive back pain, function, movements and loading behavior are most informative after screening serious and neurological causes.",
    alternatives: [
      "Neural tests are useful for leg-dominant or neurological symptoms, but they are not sufficient as the sole assessment here.",
      "Hip examination may clarify referred symptoms; the main functional lumbar pattern should still be established.",
      "Pelvic provocation may be relevant in selected cases but is not a substitute for broad baseline assessment."
    ]
  },
  "Lumbar spinal stenosis": {
    options: [
      "Compare walking tolerance, symptom relief with sitting/flexion, neurological findings and vascular pulses when indicated.",
      "Prioritize single-leg balance and resisted hip abduction without comparing walking-related leg symptoms.",
      "Prioritize straight-leg raise alone in supine to distinguish all causes of leg pain.",
      "Prioritize lumbar extension range and focal paraspinal tenderness without a walking assessment."
    ],
    why: "Walking-provoked leg symptoms relieved by sitting or lumbar flexion suggest neurogenic claudication. Walking response and vascular differential are central, not one isolated spinal test.",
    alternatives: [
      "Hip strength may affect walking but does not distinguish neurogenic from vascular claudication.",
      "A neural tension test alone cannot characterize the posture-dependent walking pattern.",
      "Movement testing helps, but excluding walking tolerance and circulation misses decisive context."
    ]
  },
  "Cauda equina red flags": {
    urgent: true,
    options: [
      "Clarify new bladder/bowel, saddle and bilateral neurological changes, perform only a brief safe neurological screen and arrange emergency evaluation.",
      "Assess repeated lumbar movements and schedule a routine review after directional-preference exercises.",
      "Complete neural tension testing and lower-limb flexibility measures before deciding if referral is needed.",
      "Assess hip strength and gait endurance and start graded exercise if pain settles."
    ],
    why: "New urinary disturbance with saddle sensory change is a medical emergency concern for possible cauda equina syndrome. Urgent assessment must not wait for routine physiotherapy testing.",
    alternatives: [
      "A lumbar mechanical examination must not delay emergency assessment of bladder and saddle changes.",
      "Neural tension and flexibility do not exclude cauda equina syndrome and are not the first priority.",
      "Exercise tolerance is irrelevant to the immediate safety decision and can dangerously delay referral."
    ]
  },
  "Vertebral fracture concern": {
    urgent: true,
    options: [
      "Review fracture risk, mechanism, focal bony pain and neurological status; avoid provocative loading and arrange timely medical imaging assessment.",
      "Perform repeated end-range lumbar flexion and extension to identify directional preference first.",
      "Apply segmental spring testing and manual overpressure to localize the painful vertebra.",
      "Test trunk endurance, lifting capacity and loaded sit-to-stand repetitions before considering referral."
    ],
    why: "Sudden focal spinal pain after minor trauma in osteoporosis raises concern for compression fracture. Avoid loading/provocation that could worsen injury and seek appropriate medical evaluation.",
    alternatives: [
      "Repeated movements are not the initial priority when a fragility fracture is plausible.",
      "Manual overpressure or spring testing could aggravate an unstable or painful fracture.",
      "Functional capacity may be useful after medical clearance, but should not precede fracture assessment."
    ]
  },
  "Rotator cuff-related shoulder pain": {
    options: [
      "Compare active with passive elevation and assess resisted abduction/external rotation plus meaningful overhead tasks.",
      "Prioritize passive external rotation loss and capsular end-feel across the full shoulder range.",
      "Prioritize apprehension/relocation tests and traumatic dislocation history.",
      "Prioritize cervical nerve-root testing and segmental upper-limb neurology."
    ],
    why: "Painful shoulder loading with relatively preserved passive motion favors rotator cuff-related pain; combine loading, motion and function rather than relying on one test.",
    alternatives: [
      "Capsular assessment helps exclude a stiff shoulder but is less direct for predominant load-provoked pain.",
      "Instability testing matters with dislocation/apprehension, not as the first step for gradual overhead pain.",
      "Cervical examination remains a differential screen but does not directly assess the main load-sensitive shoulder pattern."
    ]
  },
  "Adhesive capsulitis": {
    options: [
      "Compare active and passive glenohumeral movement, especially external rotation, and document functional stiffness.",
      "Prioritize painful arc and resisted supraspinatus loading without comparing passive restriction.",
      "Prioritize apprehension-relocation tests for traumatic anterior instability.",
      "Prioritize cervical provocation and upper-limb neurodynamic tests."
    ],
    why: "Global restriction of both active and passive shoulder motion, particularly external rotation, is a key pattern of adhesive capsulitis. Consider osteoarthritis and other stiff-shoulder causes.",
    alternatives: [
      "Resisted cuff loading may be painful but does not establish the distinguishing passive-motion loss.",
      "Instability testing targets a different clinical pattern and may be unnecessary or uncomfortable here.",
      "Cervical sources merit screening when relevant, but do not explain a consistent capsular motion limitation."
    ]
  },
  "Glenohumeral osteoarthritis": {
    options: [
      "Assess active/passive glenohumeral motion, crepitus and functional rotation; consider imaging based on history and findings.",
      "Prioritize isolated resisted abduction and painful arc to identify rotator cuff load sensitivity.",
      "Prioritize anterior shoulder apprehension and relocation to assess instability.",
      "Prioritize cervical nerve-root provocation and upper-limb reflexes."
    ],
    why: "Progressive deep shoulder pain, crepitus and loss of active/passive motion support joint disease; imaging may be indicated to clarify osteoarthritis versus other causes.",
    alternatives: [
      "Rotator cuff testing is a useful differential, but it will not characterize the prominent joint stiffness.",
      "Apprehension testing targets instability rather than chronic crepitus and motion loss.",
      "Cervical screening can exclude referral but does not prioritize the observed joint pattern."
    ]
  },
  "Acromioclavicular joint injury": {
    options: [
      "Screen fracture/dislocation after trauma, inspect and palpate the AC region, then assess cross-body adduction as tolerated.",
      "Prioritize rotator cuff strength and painful-arc testing while omitting focal AC palpation.",
      "Prioritize glenohumeral apprehension-relocation testing for labral instability.",
      "Prioritize cervical myotomes and nerve-root provocation despite focal post-traumatic AC pain."
    ],
    why: "Direct shoulder impact and focal superior shoulder symptoms prioritize trauma safety screening plus localized AC examination. Cross-body symptoms contribute but are not conclusive alone.",
    alternatives: [
      "Cuff injury is possible, but a post-impact focal AC presentation warrants local and fracture assessment first.",
      "Instability tests assess a different structure and should not precede targeted trauma screening.",
      "Neurological screening can be important after trauma but is not a substitute for AC-specific and bony evaluation."
    ]
  },
  "Shoulder instability": {
    options: [
      "Review episodes and direction of instability, inspect active control and use carefully graded apprehension/relocation testing when safe.",
      "Assess global passive external rotation restriction and capsular stiffness as the chief discriminator.",
      "Prioritize painful arc and resisted abduction without assessing apprehension or instability history.",
      "Prioritize cervical radiculopathy provocation and reflex testing alone."
    ],
    why: "A repeated slipping or apprehension history warrants direction-specific instability assessment while avoiding forceful positions and screening for neurological issues when relevant.",
    alternatives: [
      "Capsular stiffness is important for a stiff shoulder but does not primarily test recurrent slipping.",
      "Cuff function matters in rehab but does not alone clarify the reported instability episodes.",
      "A cervical screen is a differential, not the main instability test."
    ]
  },
  "Lateral epicondylalgia": {
    options: [
      "Localize lateral elbow tenderness, test symptom response to resisted wrist extension/grip and screen nearby nerve or cervical contributors.",
      "Assess resisted wrist flexion/pronation and palpate the medial epicondyle first.",
      "Prioritize repeated elbow flexion and ulnar nerve sensory testing.",
      "Prioritize radiocapitellar joint compression and passive elbow rotation before grip-loading assessment."
    ],
    why: "Outer elbow pain that increases with gripping is best assessed with concordant local tendon loading and function, alongside differential screening.",
    alternatives: [
      "Medial tendon loading is useful for medial epicondylalgia but less directly matches lateral symptoms.",
      "Ulnar neuropathy is a differential when ring/little-finger symptoms occur; it is not the dominant pattern here.",
      "Joint pathology can refer lateral pain, but tendon-related loading should be tested directly."
    ]
  },
  "Medial epicondylalgia": {
    options: [
      "Palpate the medial flexor-pronator origin, test resisted wrist flexion/pronation and screen ulnar nerve and valgus stability.",
      "Prioritize lateral epicondyle palpation and resisted wrist extension.",
      "Assess ulnar nerve sensation and sustained elbow flexion as the sole evaluation.",
      "Prioritize valgus stress testing and throwing instability signs without local tendon loading."
    ],
    why: "Load-related medial elbow pain calls for flexor-pronator tendon testing while checking the ulnar nerve and medial ligament as potential mimics.",
    alternatives: [
      "Lateral tendon assessment targets the opposite elbow region.",
      "Ulnar nerve testing alone could miss a tendon-loading presentation.",
      "Ligament testing can be important in throwers, but cannot replace flexor-pronator assessment here."
    ]
  },
  "Cubital tunnel syndrome": {
    options: [
      "Map ulnar sensation and intrinsic hand strength, assess elbow-flexion symptom response and screen proximal nerve sources.",
      "Assess median sensation, thenar strength and wrist-flexion symptom provocation.",
      "Prioritize resisted wrist flexion and medial epicondyle palpation without a neurological examination.",
      "Prioritize cervical movement testing and nerve-root reflex mapping as the only assessment."
    ],
    why: "Ring and little finger paresthesia with elbow-flexion provocation prioritizes ulnar neuropathy assessment while still considering cervical and other nerve sources.",
    alternatives: [
      "Median nerve tests suit carpal tunnel syndrome rather than ulnar-distribution symptoms.",
      "Medial tendon pain may coexist but does not directly assess the paresthesia.",
      "Cervical assessment is appropriate as a differential but should not replace focused ulnar nerve testing."
    ]
  },
  "Carpal tunnel syndrome": {
    options: [
      "Map median-distribution sensation, thumb abduction/thenar strength and symptom response to appropriate wrist provocation; screen proximal sources.",
      "Assess ulnar nerve sensation and elbow-flexion provocation as the principal tests.",
      "Examine thumb CMC pinch loading and joint tenderness before any nerve assessment.",
      "Prioritize first dorsal compartment tendon loading and radial-styloid palpation."
    ],
    why: "Nocturnal thumb/index/middle-finger symptoms and possible thenar weakness prioritize median-nerve function. Provocation tests add support, but no single sign proves the diagnosis.",
    alternatives: [
      "Ulnar neuropathy has a different predominant sensory distribution.",
      "Thumb CMC pathology causes joint pain with pinch more than classic nocturnal paresthesia.",
      "De Quervain assessment suits radial wrist pain rather than median-nerve tingling."
    ]
  },
  "De Quervain tenosynovitis": {
    options: [
      "Palpate the radial styloid and first dorsal compartment, assess thumb tendon loading and consider bony injury if trauma occurred.",
      "Prioritize thumb CMC tenderness, pinch loading and painful joint compression.",
      "Prioritize median sensation and wrist-provoked paresthesia testing.",
      "Prioritize scaphoid tenderness and trauma assessment alone without evaluating thumb tendon loading."
    ],
    why: "Pain at the radial styloid with thumb movement or lifting is best tested through local tendon loading, while checking other radial wrist diagnoses and any trauma.",
    alternatives: [
      "CMC joint pain is a relevant differential but is centered more proximally at the thumb base.",
      "Median neuropathy usually produces sensory symptoms rather than focal radial tendon pain.",
      "Scaphoid evaluation is crucial with trauma, but the gradual tendon-loading presentation needs first-compartment assessment."
    ]
  },
  "Thumb CMC osteoarthritis": {
    options: [
      "Palpate the first CMC joint, assess pain with functional pinch and thumb-base mobility, and consider appropriate imaging.",
      "Prioritize radial styloid palpation and first dorsal compartment tendon provocation.",
      "Prioritize median nerve sensory mapping and thenar weakness testing.",
      "Prioritize scaphoid snuffbox examination as though there were an acute fall."
    ],
    why: "Thumb-base pain with pinch and jars is most directly assessed at the first carpometacarpal joint, including function and mobility.",
    alternatives: [
      "De Quervain can mimic thumb pain but more typically localizes to the radial wrist tendons.",
      "Carpal tunnel syndrome features sensory symptoms and median nerve findings.",
      "Scaphoid assessment matters with relevant trauma, not as the first discriminator for gradual pinch-related joint pain."
    ]
  },
  "Hip osteoarthritis": {
    options: [
      "Assess gait, functional weight-bearing and passive hip motion, especially internal rotation/flexion, and consider imaging if indicated.",
      "Prioritize trochanteric palpation and resisted hip abduction for lateral tendon-related pain.",
      "Prioritize lumbar repeated movements and lower-limb neurodynamic testing as the sole assessment.",
      "Prioritize single hip-impingement provocation testing without documenting motion loss."
    ],
    why: "Groin pain, stiffness and limited internal rotation make joint movement and function the most useful starting examination, with lumbar/lateral hip differentials considered.",
    alternatives: [
      "Gluteal tendon testing targets lateral rather than groin-dominant hip pain.",
      "Lumbar sources should be considered but do not replace a focused hip-joint examination.",
      "Impingement provocation can be positive in several hip disorders and is insufficient alone."
    ]
  },
  "Greater trochanteric pain syndrome": {
    options: [
      "Assess lateral trochanteric tenderness, pain with hip abductor loading/single-leg stance, and screen lumbar or intra-articular referral.",
      "Prioritize deep hip flexion/internal rotation to reproduce groin-dominant joint pain.",
      "Prioritize repeated lumbar movements and nerve-root reflexes as the only examination.",
      "Prioritize adductor squeeze and pubic-region palpation for groin-related pain."
    ],
    why: "Lateral side-lying pain and load-sensitive hip abduction prioritize gluteal tendon/greater trochanteric pain assessment, not one palpation sign alone.",
    alternatives: [
      "Intra-articular hip disorders are important differentials but more often reproduce groin pain.",
      "Spinal referral should be screened, but it does not directly test abductor load symptoms.",
      "Adductor-related pain generally localizes to a different region."
    ]
  },
  "Femoroacetabular impingement syndrome": {
    options: [
      "Assess hip flexion and rotation range, familiar groin pain with carefully performed FADIR, and activity-specific loading.",
      "Prioritize lateral trochanteric tenderness and resisted abduction.",
      "Prioritize lumbar flexion/extension response and leg neurodynamics as the sole assessment.",
      "Prioritize resisted adduction and pubic-symphysis palpation without evaluating hip joint motion."
    ],
    why: "Deep-flexion-associated groin symptoms need hip joint range and concordant provocation. FADIR is sensitive to hip pain but not specific enough to establish the diagnosis alone.",
    alternatives: [
      "Lateral gluteal tendon tests suit side-lying or outer-hip pain.",
      "Lumbar screening is useful but misses the prominent hip-flexion provocation pattern.",
      "Adductor symptoms can mimic groin pain; hip motion must still be assessed."
    ]
  },
  "Knee osteoarthritis": {
    options: [
      "Assess knee range, effusion, crepitus, quadriceps strength and meaningful tasks such as walking, rising and stairs.",
      "Prioritize Thessaly/McMurray and joint-line testing for an isolated meniscal tear.",
      "Prioritize Lachman and pivot-shift testing for acute ligament instability.",
      "Prioritize focal patellar tendon palpation and jump-related loading tests."
    ],
    why: "Gradual load-related knee pain and brief stiffness are best assessed through joint and functional measures, while screening atypical inflammatory or urgent features.",
    alternatives: [
      "Meniscal tests may contribute in selected cases but are not the central examination for gradual multisymptom joint disease.",
      "ACL tests are important with pivot trauma and giving-way after injury.",
      "Tendon loading matches focal jumping-related pain rather than generalized activity-related joint symptoms."
    ]
  },
  "Patellofemoral pain": {
    options: [
      "Reproduce symptoms with a tolerated squat/step-down, then assess hip/knee strength, training load and movement strategy.",
      "Prioritize patellar tendon palpation and single-leg decline squat for focal tendon-loading pain.",
      "Prioritize joint-line palpation and meniscal provocation for locking after twisting.",
      "Prioritize Lachman and collateral-ligament laxity tests for acute instability."
    ],
    why: "Anterior knee pain on squatting and stairs is assessed most meaningfully with the aggravating functional task and load/strength contributors; no single tracking sign is diagnostic.",
    alternatives: [
      "Patellar tendinopathy usually has more focal tendon pain linked to tendon loading.",
      "Meniscal testing becomes more central with trauma, joint-line symptoms or true locking.",
      "Ligament testing suits acute injury and instability, not this gradual task-provoked presentation."
    ]
  },
  "Patellar tendinopathy": {
    options: [
      "Localize patellar tendon pain and compare symptom response to tolerated tendon-loading tasks, such as a decline squat or hop.",
      "Prioritize a broad squat/step-down assessment and hip strength without localizing tendon pain.",
      "Prioritize meniscal palpation and Thessaly for twisting-related joint-line symptoms.",
      "Prioritize Lachman and anterior drawer to assess ACL translation."
    ],
    why: "Focal pain below the patella linked to jumping and tendon load favors a load-response assessment with local tendon examination. Progress loading according to irritability.",
    alternatives: [
      "Patellofemoral pain assessment is a sensible differential, but the focal tendon site needs direct loading.",
      "Meniscal testing is more informative for a joint-line mechanical presentation.",
      "ACL tests are indicated mainly when instability or injury mechanism suggests ligament damage."
    ]
  },
  "ACL injury": {
    options: [
      "Assess effusion and fracture risk, then compare Lachman/other ACL stability tests as tolerated with collateral and meniscal screening.",
      "Prioritize joint-line palpation, Thessaly or McMurray testing for a meniscal lesion while omitting ACL laxity assessment.",
      "Prioritize valgus stress at 30 degrees to test medial collateral stability as the main discriminator.",
      "Prioritize pain response to squatting, step-down and hip strength to assess patellofemoral loading."
    ],
    why: "A pivot, pop, rapid swelling and soft-endpoint anterior laxity make ACL integrity the priority. Examine associated injuries and protect an acutely irritable knee; no single maneuver excludes all injury.",
    alternatives: [
      "Meniscal injury may coexist, but it does not replace assessment of anterior ligament laxity after a pivoting pop.",
      "MCL stress testing is appropriate for medial injury, yet does not directly test the suspected ACL.",
      "Functional loading is relevant later in rehabilitation but is not the initial discriminator after traumatic instability."
    ]
  },
  "Meniscal injury": {
    options: [
      "Clarify locking and swelling, assess joint-line symptoms and use tolerable meniscal maneuvers while screening ligament injury.",
      "Prioritize Lachman and pivot shift with no joint-line or mechanical symptom assessment.",
      "Prioritize pain response to squatting and hip strength without addressing locking or joint-line symptoms.",
      "Prioritize valgus stress and medial ligament palpation without testing possible intra-articular injury."
    ],
    why: "Twisting, joint-line pain and mechanical symptoms prioritize a meniscal assessment alongside ligament and safety screening. A truly locked knee warrants timely referral.",
    alternatives: [
      "ACL injury can coexist and should be assessed, but isolated ACL tests miss the dominant mechanical symptoms.",
      "Functional loading is informative but insufficient for a suspected mechanical intra-articular injury.",
      "MCL examination is a useful differential after valgus trauma, not the main test for joint-line locking."
    ]
  },
  "MCL sprain": {
    options: [
      "Inspect swelling and medial tenderness, test valgus stability at about 30 degrees and in extension as appropriate, and screen other ligaments.",
      "Prioritize Lachman and anterior translation to assess ACL integrity only.",
      "Prioritize meniscal provocation tests for a twisting-related locked knee as the sole examination.",
      "Prioritize loaded squat and patellofemoral pain testing before medial stability."
    ],
    why: "A valgus mechanism and medial tenderness favor focused medial collateral stress evaluation, comparing laxity/end-feel carefully and screening combined injuries.",
    alternatives: [
      "ACL involvement should be considered but anterior laxity testing alone misses medial stability.",
      "Meniscal injury may coexist, but medial ligament stability is the key mechanism-linked assessment.",
      "Functional load testing may be useful later but does not establish acute valgus instability."
    ]
  },
  "Lateral ankle sprain": {
    options: [
      "Apply appropriate Ottawa fracture screening, assess lateral ligament tenderness/swelling, then test stability as tolerated and consider syndesmosis injury.",
      "Prioritize tibiofibular squeeze and external-rotation stress testing without assessing lateral ligaments.",
      "Prioritize calf-squeeze testing and Achilles tendon gap palpation as the main tests.",
      "Prioritize peroneal strength and balance tasks without excluding fracture or documenting acute ligament findings."
    ],
    why: "An inversion/plantarflexion injury requires fracture screening and focused lateral ligament assessment. Assess instability and functional deficits according to acute irritability.",
    alternatives: [
      "Syndesmosis screening matters when the mechanism or tenderness suggests a high ankle injury, but it is not the leading presentation here.",
      "Achilles rupture has a different typical mechanism and clinical pattern.",
      "Peroneal and balance testing supports later rehab but should not replace early fracture and ligament assessment."
    ]
  },
  "Syndesmotic ankle injury": {
    options: [
      "Screen fracture and weight-bearing safety, localize distal tibiofibular pain, and use appropriate squeeze/external-rotation tests as tolerated.",
      "Prioritize isolated ATFL tenderness and anterior drawer after a plantarflexion-inversion sprain.",
      "Prioritize Achilles tendon calf-squeeze and gap assessment.",
      "Prioritize single-leg heel raises and tendon palpation for gradual Achilles loading pain."
    ],
    why: "Pain above the ankle after external rotation raises concern for syndesmotic injury; examine appropriately without excessive stress, and refer significant instability or suspected fracture.",
    alternatives: [
      "ATFL assessment suits typical inversion injury but may miss a high ankle lesion.",
      "Achilles rupture screening addresses sudden posterior push-off symptoms, not distal tibiofibular pain.",
      "Achilles tendinopathy usually develops gradually with tendon loading."
    ]
  },
  "Achilles tendinopathy": {
    options: [
      "Localize tendon symptoms, assess calf capacity with tolerated heel raises and graded loading, and screen for rupture when indicated.",
      "Prioritize plantar fascia origin palpation and first-step pain provocation.",
      "Prioritize ATFL palpation and ankle inversion ligament stress.",
      "Prioritize tibiofibular squeeze and external-rotation stress to assess a high ankle sprain."
    ],
    why: "Progressive load-related Achilles pain calls for tendon-specific pain and capacity testing; a sudden snap or major weakness changes the priority to rupture exclusion.",
    alternatives: [
      "Plantar heel pain assessment addresses a different tissue and symptom location.",
      "Lateral ligament examination is appropriate after inversion trauma.",
      "Syndesmosis testing is more relevant to an external-rotation ankle injury."
    ]
  },
  "Achilles rupture": {
    urgent: true,
    options: [
      "Check calf-squeeze response, palpable gap and plantarflexion function without forceful loading; protect the limb and arrange urgent specialist assessment.",
      "Perform repeated single-leg heel raises and hopping to grade calf strength before considering referral.",
      "Prioritize ankle anterior drawer and talar tilt to assess lateral ligament laxity.",
      "Prioritize tibiofibular squeeze and external-rotation tests for syndesmotic injury."
    ],
    why: "A sudden snap with marked push-off weakness and a positive Thompson test is concerning for Achilles rupture. Protect the tendon; do not use loading tests to delay urgent assessment.",
    alternatives: [
      "Repeated high-load tasks could aggravate a rupture and are inappropriate before protection and assessment.",
      "Lateral ligament testing addresses inversion sprain, not loss of Achilles continuity.",
      "Syndesmosis testing targets a different injury mechanism and location."
    ]
  },
  "Plantar heel pain": {
    options: [
      "Assess medial plantar calcaneal tenderness, first-step behavior and tolerated plantar fascia loading; screen neural and bony causes.",
      "Prioritize Achilles tendon palpation and repeated calf raises for posterior tendon pain.",
      "Prioritize tarsal tunnel provocation and plantar sensation as the only examination.",
      "Prioritize ankle inversion stress and ATFL laxity testing."
    ],
    why: "First-step medial plantar heel pain is best assessed through its local pain pattern and load response, while ruling out nerve entrapment or stress injury when indicated.",
    alternatives: [
      "Achilles examination targets posterior tendon symptoms rather than plantar heel pain.",
      "Neural assessment matters when burning/tingling is present but should not displace the load-sensitive plantar pattern.",
      "ATFL testing targets lateral ankle instability rather than heel pain."
    ]
  },
  "Septic arthritis concern": {
    urgent: true,
    options: [
      "Review fever/systemic illness and inspect the hot painful joint with minimal provocation; arrange emergency medical assessment for possible joint infection.",
      "Prioritize repeat passive accessory mobilizations to grade stiffness before referral.",
      "Prioritize meniscal and ligament special tests to explain swelling before checking systemic features.",
      "Assess functional squats, walking speed and exercise tolerance before considering urgent review."
    ],
    why: "An acutely hot, swollen and very painful joint with fever requires emergency assessment for septic arthritis, which may need urgent aspiration and treatment. Physiotherapy tests cannot rule it out.",
    alternatives: [
      "Mobilization in a potentially infected joint is not an appropriate initial test or treatment.",
      "Orthopedic special tests cannot safely exclude infection and should not delay referral.",
      "Loading and performance tests are lower priority than potentially limb-threatening infection."
    ]
  },
  "Directional preference low back pain": {
    options: [
      "Repeat tolerated lumbar movements and track whether distal symptoms centralize or peripheralize, with a brief neurological safety screen.",
      "Prioritize hip flexion and internal rotation provocation without comparing lumbar symptom response.",
      "Prioritize slump and straight-leg raise alone without recording change in symptom location.",
      "Prioritize lumbar segmental palpation and passive accessory movement as the only classification tool."
    ],
    why: "The defining finding here is movement-related centralization. Repeated movement response, neurological status and function help guide reasoning; centralization does not prove a specific disc lesion.",
    alternatives: [
      "Hip testing may exclude alternative pain sources, but it does not directly examine centralization.",
      "Neural tension tests assess mechanosensitivity but do not document a directional preference.",
      "Segmental palpation cannot substitute for a repeated-movement symptom response."
    ]
  },
  "Acute traumatic shoulder weakness": {
    urgent: true,
    options: [
      "Screen fracture/dislocation and neurovascular compromise after the fall; document active-passive discrepancy and arrange timely medical evaluation.",
      "Prioritize repeated resisted rotator cuff endurance sets to determine whether weakness resolves with warm-up.",
      "Perform forceful end-range passive stretching to differentiate capsular stiffness from tear.",
      "Prioritize cervical nerve tension testing without examining traumatic shoulder or bony findings."
    ],
    why: "New inability to elevate the arm after trauma with focal bony pain needs fracture/dislocation exclusion and evaluation for acute rotator cuff injury. Do not delay evaluation with loading tests.",
    alternatives: [
      "Repeated resistance could aggravate an acute tear or fracture; heavy loading is not the initial priority.",
      "Forced stretching is inappropriate before excluding significant traumatic pathology.",
      "Cervical symptoms should be screened when indicated, but cannot replace trauma-related shoulder assessment."
    ]
  }
};

const coreCaseTypes: Record<string, string> = {
  "shoulder-01": "Adhesive capsulitis",
  "knee-01": "ACL injury",
  "hand-01": "Carpal tunnel syndrome",
  "back-01": "Directional preference low back pain",
  "ankle-01": "Lateral ankle sprain",
  "hip-01": "Greater trochanteric pain syndrome",
  "neck-01": "Cervical radiculopathy",
  "safety-01": "Cauda equina red flags",
  "knee-oa-01": "Knee osteoarthritis",
  "elbow-01": "Lateral epicondylalgia",
  "achilles-01": "Achilles rupture",
  "shoulder-02": "Rotator cuff-related shoulder pain",
  "neck-03": "Cervical radiculopathy",
  "hip-02": "Greater trochanteric pain syndrome",
  "knee-03": "Patellofemoral pain",
  "ankle-03": "Lateral ankle sprain",
  "wrist-03": "De Quervain tenosynovitis",
  "lumbar-03": "Lumbar spinal stenosis",
  "shoulder-03": "Acute traumatic shoulder weakness",
  "redflag-03": "Septic arthritis concern"
};

export function getClinicalExamination(caseItem: ExaminationCase): ExaminationQuestion {
  const condition = coreCaseTypes[caseItem.id] ?? caseItem.title.split(": Scenario")[0];
  const matched = exams[condition];
  if (!matched) {
    throw new Error("Missing clinically reviewed examination for case: " + caseItem.id);
  }
  return {
    question: matched.urgent || caseItem.safety
      ? "Given this presentation, which examination AND immediate action is the safest priority?"
      : "Which examination plan would MOST effectively test the leading hypothesis in this patient?",
    options: matched.options,
    correct: 0,
    why: matched.why,
    alternatives: matched.alternatives
  };
}

/** All blueprints must be explicitly reviewed; no generic obvious-answer fallback. */
export const clinicalExamConditions = Object.keys(exams);
export const coreExamCaseIds = Object.keys(coreCaseTypes);
