export type ManualTherapyMechanism = {
  mechanismMap: string;
  simpleExplanation: string;
  stepByStep: string[];
  physiology: string[];
  clinicalTranslation: string[];
  myths: string[];
  evidenceNote: string;
};

export const manualTherapyMechanisms: Record<string, ManualTherapyMechanism> = {
  "maitland-joint-mobilization": {
    mechanismMap: "Rhythmic joint movement → mechanoreceptor input + altered nociceptive signaling → spinal/supraspinal pain modulation + reduced guarding → easier movement → active loading",
    simpleExplanation:
      "Maitland mobilization probably works through several systems at the same time. The oscillatory movement gives the nervous system repeated non-threatening mechanical input, can reduce pain sensitivity for a period, may reduce protective muscle guarding, and can temporarily improve how easily the joint moves. The important point is that the treatment does not simply 'push a joint back into place'.",
    stepByStep: [
      "1. The therapist applies a controlled accessory movement to the joint.",
      "2. Joint, capsule, skin and muscle mechanoreceptors detect the movement and pressure.",
      "3. This sensory input reaches the spinal cord and brain and can compete with or modify nociceptive input.",
      "4. Segmental spinal mechanisms and descending pain-control pathways may reduce pain sensitivity temporarily.",
      "5. When pain and threat decrease, protective muscle activity can reduce and the patient may tolerate more movement.",
      "6. Repeated loading can also produce small temporary changes in joint/capsular mechanics and stretch tolerance.",
      "7. The new movement window is most useful when it is immediately reinforced with active movement and exercise."
    ],
    physiology: [
      "Peripheral sensory effect: low-threshold mechanoreceptors in skin, capsule, muscle and periarticular tissue respond to pressure and movement.",
      "Spinal effect: altered afferent input can influence dorsal-horn processing and reduce amplification of nociceptive signals.",
      "Supraspinal effect: the brain can change pain perception through descending inhibitory/facilitatory pathways involving brainstem and cortical networks.",
      "Neuromuscular effect: reduced threat and altered sensory input may lower protective co-contraction or muscle guarding.",
      "Mechanical effect: joint surfaces and periarticular tissues are loaded, but evidence that long-lasting structural repositioning is the main mechanism is weak.",
      "Contextual effect: expectation, trust, explanation, therapist contact and perceived safety can change pain and movement responses and are part of the total treatment effect."
    ],
    clinicalTranslation: [
      "Grades I–II are often useful when pain/irritability is dominant because the goal is symptom modulation, not forcing range.",
      "Grades III–IV are used more when stiffness is dominant, but the patient response still decides whether they are appropriate.",
      "A useful sign is an immediate improvement in the comparable movement or task, not simply the therapist feeling more joint play."
    ],
    myths: [
      "Do not claim that the technique permanently 'puts the joint back in place'.",
      "Do not assume a click or large movement is required.",
      "Do not assume one accessory glide mechanically corrects the exact structural cause of pain."
    ],
    evidenceNote:
      "Current evidence supports a complex mix of peripheral, spinal, supraspinal, neurovascular and neuromuscular responses. The exact mechanism that produces the clinical benefit in an individual patient is still uncertain."
  },

  "kaltenborn-evjenth-mobilization": {
    mechanismMap: "Sustained traction/glide → reduced compression + mechanoreceptor input + tissue loading → pain modulation + increased movement tolerance → active use",
    simpleExplanation:
      "Kaltenborn mobilization uses sustained traction or translatoric gliding. The force can temporarily reduce joint compression, load the capsule in a controlled direction and provide strong sensory input. The likely result is a combination of pain modulation, reduced guarding and improved tolerance to movement rather than a permanent change in bone position.",
    stepByStep: [
      "1. Traction or glide changes the mechanical load across the joint.",
      "2. Capsule, ligament, muscle and skin receptors respond to the sustained force.",
      "3. Low-grade traction may decrease compressive stress and make the joint feel more comfortable.",
      "4. Higher-grade sustained loading can increase short-term extensibility and stretch tolerance of periarticular tissues.",
      "5. Sensory input can change spinal and supraspinal pain processing.",
      "6. Reduced pain/guarding allows more active range and better movement confidence.",
      "7. Exercise consolidates the gained range and makes it functionally useful."
    ],
    physiology: [
      "Joint distraction may transiently reduce articular compression and nociceptive input in compression-sensitive presentations.",
      "Sustained tissue loading produces viscoelastic deformation and changes in stretch tolerance, although these changes are often temporary.",
      "Mechanoreceptor input from joint and periarticular tissues can alter nociceptive processing.",
      "Muscle tone may change through altered sensory input and reduced protective response.",
      "There is no strong evidence that a single sustained glide permanently changes joint alignment."
    ],
    clinicalTranslation: [
      "Grade I is mainly a comfort/compression-reduction strategy.",
      "Grade II takes up slack and is commonly used to assess/treat pain without aggressive stretch.",
      "Grade III provides greater capsular loading when stiffness is the main problem."
    ],
    myths: [
      "Convex-concave rules are a useful starting model, not proof that one glide must work.",
      "Traction does not 'open the joint permanently'.",
      "More force does not automatically produce more mobility."
    ],
    evidenceNote:
      "The mechanical model is useful clinically, but contemporary evidence suggests the response is multifactorial and includes neurophysiological as well as mechanical effects."
  },

  "mulligan-mobilization-with-movement": {
    mechanismMap: "Sustained accessory glide + pain-free active movement → altered joint sensory input + motor recalibration + reduced threat → immediate functional change",
    simpleExplanation:
      "MWM combines a manual glide with the patient's own movement. The most useful idea is not that the therapist permanently corrects a 'positional fault'. Instead, the glide changes sensory input and joint loading while the patient successfully performs a previously painful movement. That pain-free success can immediately change pain processing, motor output and confidence.",
    stepByStep: [
      "1. A previously painful/restricted active movement is identified.",
      "2. The therapist adds a sustained accessory glide.",
      "3. The patient repeats the same movement while receiving altered joint and skin sensory input.",
      "4. If the combination reduces pain, the nervous system receives a new 'safe movement' experience.",
      "5. Motor output can change immediately: less guarding, smoother recruitment and greater range.",
      "6. Repeated pain-free repetitions reinforce the new movement pattern.",
      "7. If the benefit remains after the glide is removed, the intervention has produced useful short-term carry-over."
    ],
    physiology: [
      "Changes in afferent input from joint, skin and muscle can alter spinal and supraspinal nociceptive processing.",
      "Active movement adds motor-learning and sensorimotor components that passive mobilization does not provide.",
      "Reduced pain during the task can reduce protective co-contraction and improve movement variability.",
      "Context, expectation and the patient's experience of successful movement can contribute to the analgesic effect.",
      "A pure 'positional fault correction' mechanism has not been established as the main explanation."
    ],
    clinicalTranslation: [
      "The immediate response is the clinical test: if the movement is not better, the glide direction/technique should be reconsidered.",
      "Repeated pain-free movement is more important than the therapist simply holding the glide.",
      "Use the new movement window for strengthening or task practice."
    ],
    myths: [
      "Do not tell the patient a bone was 'out' and is now 'back in'.",
      "Do not accept painful repetitions because the technique is supposed to be pain-free/improving.",
      "Do not assume the same glide direction works for every patient."
    ],
    evidenceNote:
      "Immediate analgesic and movement effects are consistent with neurophysiological, sensorimotor and contextual mechanisms. The original positional-fault explanation remains a clinical hypothesis rather than a proven universal mechanism."
  },

  "mulligan-snags-nags": {
    mechanismMap: "Segmental glide + spinal movement → altered afferent input + pain-free motor experience → reduced guarding + improved spinal motion",
    simpleExplanation:
      "NAGs and SNAGs expose the spine to a comfortable segmental glide while movement occurs. The combination can change sensory input from the joint and surrounding tissues, reduce pain sensitivity and let the patient experience the movement with less threat and less muscle guarding.",
    stepByStep: [
      "1. A restricted or painful spinal movement is identified.",
      "2. A segmental glide changes local mechanical input.",
      "3. During a SNAG, the patient actively performs the movement at the same time.",
      "4. The nervous system receives a different pattern of joint, muscle and skin input.",
      "5. If pain reduces, protective muscle activity can decrease and motion can increase.",
      "6. Repetition reinforces the pain-free movement.",
      "7. Self-SNAGs can extend the same sensory-motor strategy into self-management."
    ],
    physiology: [
      "Segmental mechanoreceptor stimulation can modify spinal nociceptive processing.",
      "Active movement recruits cortical motor and sensorimotor networks.",
      "Descending modulation can contribute to short-term analgesia.",
      "Reduced pain may permit a larger active range without needing a large structural change.",
      "The exact vertebral segment selected clinically may not be the only structure producing the response."
    ],
    clinicalTranslation: [
      "A good SNAG should make the comparable movement easier or pain-free.",
      "If the response is not immediate, reconsider level, direction, force or diagnosis.",
      "Carry-over should be reinforced with active control and endurance."
    ],
    myths: [
      "Do not claim that a specific vertebra is permanently realigned.",
      "Do not use pain during the technique as proof that the 'right level' has been found."
    ],
    evidenceNote:
      "The most plausible explanation is a combined mechanical, neurophysiological and sensorimotor effect rather than a simple positional correction."
  },

  "cyriax-deep-transverse-friction": {
    mechanismMap: "Localized transverse loading → strong sensory input + local tissue shear/loading → temporary analgesia/tolerance change → progressive loading",
    simpleExplanation:
      "Deep transverse friction gives focused mechanical and sensory input to a tendon, ligament or muscle. It may temporarily reduce pain sensitivity and alter local tissue movement, but the traditional idea that friction mechanically 'breaks adhesions' or removes scar tissue is not well supported.",
    stepByStep: [
      "1. Repetitive transverse pressure loads the local tissue and skin.",
      "2. Cutaneous and deep sensory receptors generate strong afferent input.",
      "3. Local nociceptive sensitivity may temporarily reduce through segmental and central pain modulation.",
      "4. Mechanical shear may temporarily change tissue glide and fluid behavior.",
      "5. The patient may then tolerate loading or movement more comfortably.",
      "6. Long-term tendon adaptation still depends mainly on progressive mechanical loading and recovery."
    ],
    physiology: [
      "Sensory gating and descending modulation can contribute to temporary hypoalgesia.",
      "Mechanical shear creates local deformation but does not reliably 'break' mature scar tissue.",
      "Transient local circulation changes can occur with manual contact, but these are not established as the main clinical mechanism.",
      "Tendon remodeling is driven by repeated biologically appropriate loading over time through mechanotransduction, not a single friction session."
    ],
    clinicalTranslation: [
      "Use friction as an adjunct when it improves tolerance to movement/loading.",
      "The real rehabilitation stimulus in chronic tendinopathy is progressive exercise loading."
    ],
    myths: [
      "Do not claim that painful friction is needed to break adhesions.",
      "Do not intentionally create tissue damage or bruising.",
      "Do not replace loading-based rehabilitation with friction."
    ],
    evidenceNote:
      "Evidence for specific structural effects of transverse friction is limited. Short-term sensory and pain-modulatory explanations are more defensible."
  },

  "muscle-energy-technique": {
    mechanismMap: "Gentle voluntary contraction → proprioceptive input + reduced guarding + changed stretch tolerance → greater comfortable range",
    simpleExplanation:
      "MET uses the patient's own muscle contraction against resistance. Traditional teaching often explains it with 'post-isometric relaxation' or 'reciprocal inhibition'. Those reflexes may contribute, but the full response is probably broader: proprioceptive input changes, reduced protective tone, altered pain sensitivity and increased stretch tolerance.",
    stepByStep: [
      "1. The patient produces a low-force voluntary contraction.",
      "2. Muscle spindles, Golgi tendon organs and joint receptors send proprioceptive information to the nervous system.",
      "3. During and after the contraction, motor-neuron excitability and muscle activation strategy can change.",
      "4. The patient relaxes and the therapist moves into the newly tolerated range.",
      "5. Repeated cycles may reduce guarding and increase the amount of stretch the patient can comfortably accept.",
      "6. Active movement after MET helps the nervous system use the new range."
    ],
    physiology: [
      "Autogenic and reciprocal inhibition are useful teaching concepts, but they do not fully explain the clinical effect.",
      "Changes in stretch tolerance often account for more immediate ROM gain than permanent muscle-length change.",
      "Proprioceptive input from muscle/tendon receptors can influence spinal motor output.",
      "Voluntary contraction may also change descending motor control and pain modulation.",
      "Low-force contraction is usually sufficient; maximal force is not necessary."
    ],
    clinicalTranslation: [
      "MET is especially useful when guarding makes passive stretching uncomfortable.",
      "The gain should be tested in active movement, not assumed from the therapist feeling less resistance."
    ],
    myths: [
      "Do not claim that a 5-second contraction permanently lengthens a muscle.",
      "Do not rely on a single reflex explanation for every response.",
      "Do not use high force because the goal is neuromuscular control, not strength testing."
    ],
    evidenceNote:
      "Immediate range changes are likely related to altered stretch tolerance, neuromuscular control and pain modulation more than large structural lengthening."
  },

  "strain-counterstrain": {
    mechanismMap: "Position of maximal comfort → reduced nociceptive/proprioceptive threat → less protective motor activity → lower tenderness + easier movement",
    simpleExplanation:
      "Strain Counterstrain places the painful tissue in a position of ease instead of stretching it. The comfortable position reduces provocative sensory input and may decrease protective muscle activity. The classic 'muscle spindle reset' or gamma-loop explanation is historically important but has not been proven as the single mechanism.",
    stepByStep: [
      "1. A tender point and painful movement are identified.",
      "2. The body part is passively positioned so tenderness drops substantially.",
      "3. The nervous system now receives less threatening nociceptive and proprioceptive input from that region.",
      "4. Protective muscle activity may decrease while the position is held.",
      "5. Slow return to neutral prevents a sudden re-provocation of the system.",
      "6. Tenderness and movement may then be temporarily improved.",
      "7. Active movement reinforces the less-protective motor state."
    ],
    physiology: [
      "Reduced nociceptive input in a position of comfort can change spinal reflex activity and muscle tone.",
      "Muscle spindle sensitivity may change with muscle length and fusimotor activity, but the idea of a precise 'reset' remains theoretical.",
      "Descending pain modulation, expectation and perceived safety can also contribute.",
      "Tender-point reduction does not prove correction of a hidden structural lesion."
    ],
    clinicalTranslation: [
      "The clinical goal is lower irritability so the patient can move more normally.",
      "Use it as a bridge to active movement, not as a hunt for every tender point."
    ],
    myths: [
      "Do not claim that a tender point identifies a vertebra or organ dysfunction with certainty.",
      "Do not present the gamma-loop reset theory as settled fact.",
      "Do not force the patient into a stretch."
    ],
    evidenceNote:
      "A comfort-position, pain-modulation and reduced-guarding model is more defensible than a single unproven reflex-reset explanation."
  },

  "myofascial-release": {
    mechanismMap: "Slow sustained soft-tissue load → cutaneous/deep mechanoreceptor input + tissue deformation + autonomic relaxation → lower pain/threat + increased stretch tolerance",
    simpleExplanation:
      "MFR probably does not work by physically 'melting' or permanently breaking fascia. Slow sustained pressure creates sensory input, temporary tissue deformation and a non-threatening stretch experience. This can reduce pain sensitivity, decrease guarding and improve stretch tolerance and movement.",
    stepByStep: [
      "1. Slow pressure/shear deforms skin, subcutaneous tissue, fascia and muscle.",
      "2. Cutaneous and deep mechanoreceptors detect the sustained load.",
      "3. Sensory input influences spinal and brain pain-processing networks.",
      "4. Slow comfortable contact may also reduce sympathetic arousal and protective muscle activity.",
      "5. Viscoelastic tissues deform temporarily under sustained load and the patient may accept a greater range.",
      "6. Pain and perceived stiffness may reduce.",
      "7. Active exercise uses the new range and provides the longer-term adaptation stimulus."
    ],
    physiology: [
      "Fascia contains sensory nerve endings and participates in force transmission, but it is not simply a sheet that can be manually 'broken apart'.",
      "Immediate ROM changes are more plausibly explained by altered stretch tolerance, pain modulation and temporary tissue deformation than permanent fascial remodeling.",
      "Mechanotransduction is biologically real, but meaningful tissue remodeling requires repeated loading over time.",
      "Autonomic changes such as relaxation may contribute to the patient's perception of reduced stiffness."
    ],
    clinicalTranslation: [
      "Slow pressure and patient comfort matter more than force.",
      "If movement does not improve, more pressure is not automatically the answer.",
      "Follow with active mobility or strength."
    ],
    myths: [
      "Do not say fascia has been permanently 'released', 'melted' or 'broken'.",
      "Do not assume a palpable restriction proves an adhesion.",
      "Do not use bruising or severe pain as the target."
    ],
    evidenceNote:
      "Contemporary evidence favors multisystem sensory, neurophysiological and temporary mechanical effects rather than large permanent structural deformation from one treatment."
  },

  "soft-tissue-mobilization": {
    mechanismMap: "Pressure + movement of skin/muscle → sensory modulation + transient circulation/tissue deformation + reduced guarding → easier active movement",
    simpleExplanation:
      "Soft-tissue mobilization stimulates skin, muscle and fascial receptors while mechanically moving the tissues. The main useful effects are usually temporary reductions in pain and perceived stiffness, changes in muscle guarding and improved movement tolerance.",
    stepByStep: [
      "1. Pressure and tissue movement stimulate cutaneous and deep mechanoreceptors.",
      "2. Sensory input changes the balance of nociceptive and non-nociceptive information entering the spinal cord.",
      "3. Brainstem/cortical pain-control systems can modify the pain experience.",
      "4. Rhythmic contact may reduce sympathetic arousal and protective muscle tone.",
      "5. Tissue compression/shear causes temporary deformation and fluid movement.",
      "6. The patient may move with less pain or resistance.",
      "7. Exercise provides the longer-term functional adaptation."
    ],
    physiology: [
      "Pain modulation can occur without any structural 'knot' being removed.",
      "Local blood flow may change transiently, but improved circulation is not sufficient as a universal explanation.",
      "Perceived muscle tightness is influenced by nervous-system tone and stretch tolerance as well as tissue properties.",
      "The effect is dose- and context-dependent."
    ],
    clinicalTranslation: [
      "Use enough pressure to create a useful response, not to test pain tolerance.",
      "Reassess movement and strength after treatment."
    ],
    myths: [
      "Do not describe every tender band as scar tissue.",
      "Do not assume deeper is always better.",
      "Do not tell patients toxins are being 'flushed out'."
    ],
    evidenceNote:
      "The best-supported model is a mix of neurophysiological, neuromuscular, neurovascular and short-term mechanical responses."
  },

  "trigger-point-compression": {
    mechanismMap: "Sustained tolerable pressure → altered nociceptive input + local mechanoreceptor stimulation → reduced pain sensitivity/guarding → improved movement",
    simpleExplanation:
      "Pressure release can reduce the sensitivity of a painful muscle region, but it does not need to 'destroy a knot'. Sustained tolerable pressure changes sensory input and can temporarily reduce pain sensitivity and protective muscle activity.",
    stepByStep: [
      "1. Pressure stimulates mechanoreceptors and nociceptors in skin and muscle.",
      "2. With tolerable sustained input, the nervous system may reduce the perceived threat from that area.",
      "3. Segmental spinal and descending mechanisms can reduce local pain sensitivity.",
      "4. Protective muscle contraction may decrease.",
      "5. The area feels less tender and movement may become easier.",
      "6. Exercise then addresses strength, endurance and load tolerance."
    ],
    physiology: [
      "Painful trigger-point regions can show local sensitivity, but the idea of a fixed physical 'knot' that must be crushed is oversimplified.",
      "Ischemic-compression theories are not sufficient to explain the full effect.",
      "Central sensitization, sleep, stress and overall load can influence trigger-point sensitivity.",
      "The clinical target is function and symptom modulation, not eliminating every tender point."
    ],
    clinicalTranslation: [
      "Moderate pressure is generally enough.",
      "Stop if the pressure creates nerve-like pain or a prolonged flare.",
      "Use the reduction in sensitivity to progress active treatment."
    ],
    myths: [
      "Do not tell patients you are breaking a knot.",
      "Do not use severe pain as evidence the point is correct.",
      "Do not repeatedly compress points without addressing loading and recovery."
    ],
    evidenceNote:
      "Short-term analgesia and reduced tenderness are plausible through sensory and pain-modulatory mechanisms; a single structural trigger-point mechanism has not been proven."
  },

  "iastm": {
    mechanismMap: "Instrument pressure/shear → strong cutaneous/deep sensory input + local mechanical loading → short-term pain/ROM change → active loading",
    simpleExplanation:
      "IASTM is essentially a way of applying controlled mechanical and sensory input using a tool. It may change pain and range temporarily. It does not need to scrape away scar tissue, and bruising is not proof that treatment worked.",
    stepByStep: [
      "1. The instrument applies pressure and shear to skin and superficial/deeper soft tissues.",
      "2. Mechanoreceptors and nociceptors respond to the mechanical stimulus.",
      "3. Sensory processing in the spinal cord and brain can change pain sensitivity.",
      "4. Local tissue deformation and short-lived circulation changes may occur.",
      "5. The patient may experience greater movement tolerance.",
      "6. Exercise then supplies the progressive loading needed for longer-term adaptation."
    ],
    physiology: [
      "Animal and laboratory work suggests mechanical loading can influence cellular mechanotransduction, but direct translation to clinical tissue remodeling is uncertain.",
      "Petechiae and bruising represent capillary trauma, not a necessary therapeutic mechanism.",
      "Immediate ROM change is more likely related to pain/stretch-tolerance change than rapid scar breakdown.",
      "The instrument mainly changes how force is delivered; it does not create a completely unique biological system."
    ],
    clinicalTranslation: [
      "Use a light-to-moderate dose and reassess.",
      "The tool should make active exercise easier, not become the main treatment."
    ],
    myths: [
      "Do not chase redness or petechiae.",
      "Do not claim the tool can diagnose scar tissue from vibration or sound.",
      "Do not claim visible marks are evidence of toxin release."
    ],
    evidenceNote:
      "Short-term sensory and movement effects are plausible; claims of rapid scar-tissue breakdown or required microtrauma are not well supported."
  },

  "neurodynamic-mobilization": {
    mechanismMap: "Coordinated joint movement → nerve excursion with controlled strain → altered intraneural mechanics + reduced mechanosensitivity → improved neural movement tolerance",
    simpleExplanation:
      "Nerves are not static cables. They normally slide and change length as the limbs and spine move. Neurodynamic techniques use controlled movement to restore tolerance to that normal excursion. Sliders create relatively more movement with less strain; tensioners create more strain and are used later in less irritable presentations.",
    stepByStep: [
      "1. Joint movement changes the length of the neural pathway.",
      "2. The nerve and its interfaces glide relative to surrounding tissues.",
      "3. Sliders increase excursion while one end is loaded and the other is unloaded.",
      "4. Controlled excursion may improve tolerance to mechanical loading and alter mechanosensitivity.",
      "5. Repeated non-threatening movement can reduce nervous-system protective responses.",
      "6. In some settings, movement may also influence intraneural fluid dynamics and pressure, although the clinical importance is still being studied.",
      "7. Function improves when neural movement is integrated into normal limb use."
    ],
    physiology: [
      "Peripheral nerves undergo measurable longitudinal excursion and strain during normal joint movement.",
      "Excessive strain can reduce intraneural blood flow; therefore aggressive stretching is not the goal.",
      "Sliders generally create less neural strain than tensioners.",
      "Changes in mechanosensitivity involve both local nerve/interface mechanics and central pain processing.",
      "A positive neurodynamic test is not simply proof that a nerve is 'stuck'."
    ],
    clinicalTranslation: [
      "Start with sliders in irritable cases.",
      "Use small symptom-free or mild-symptom ranges.",
      "Progress only when distal symptoms remain stable or improve."
    ],
    myths: [
      "Do not call it a nerve stretch in a highly irritable patient.",
      "Do not repeatedly provoke strong tingling because the nerve 'needs stretching'.",
      "Do not assume reduced ROM means the nerve is physically adhered."
    ],
    evidenceNote:
      "Nerve excursion and strain are well-established biomechanical phenomena. The exact pathway by which neurodynamic treatment improves pain is probably a combination of neural mechanics and pain-modulation mechanisms."
  },

  "manual-traction": {
    mechanismMap: "Long-axis distraction → temporary unloading/separation + altered sensory input → symptom reduction in responders → active rehabilitation",
    simpleExplanation:
      "Traction temporarily changes mechanical load across a joint or spinal segment. It may reduce compression-sensitive symptoms and provides a strong sensory stimulus. In spinal conditions, any increase in foraminal/disc space is temporary; the clinical value depends on whether the patient's symptoms actually improve.",
    stepByStep: [
      "1. A gradual distraction force is applied.",
      "2. Joint surfaces and periarticular tissues experience reduced compressive load.",
      "3. Mechanoreceptors respond to the change in load and movement.",
      "4. In some spinal positions, neural/foraminal compression may be reduced transiently.",
      "5. Pain sensitivity and muscle guarding may decrease in a responder.",
      "6. The patient can then move or exercise more comfortably."
    ],
    physiology: [
      "Mechanical separation is temporary and varies with force, position and anatomy.",
      "Pain relief can occur through unloading plus neurophysiological modulation.",
      "Traction does not 'suck a disc back in' in a reliable permanent way.",
      "Peripheralization of symptoms suggests the current traction strategy is not helpful."
    ],
    clinicalTranslation: [
      "Treat traction as a response test, not an automatic diagnosis-based prescription.",
      "Continue only if symptoms centralize, reduce or function improves."
    ],
    myths: [
      "Do not claim traction permanently widens the joint or spine.",
      "Do not claim it reliably repositions a disc.",
      "Do not keep increasing force when symptoms worsen."
    ],
    evidenceNote:
      "The mechanical unloading effect is plausible, but clinical response varies. Neurophysiological and contextual effects also contribute."
  },

  "high-velocity-low-amplitude-thrust": {
    mechanismMap: "Rapid low-amplitude mechanical impulse → intense mechanoreceptor/proprioceptive input + spinal/supraspinal modulation → short-term pain/ROM change; cavitation may occur",
    simpleExplanation:
      "HVLA gives a very fast, small-amplitude mechanical stimulus. The rapid input can produce short-term changes in pain sensitivity, muscle activity and movement. The audible 'pop' is usually joint cavitation related to gas dynamics in synovial fluid; it is not evidence that a bone was put back in place.",
    stepByStep: [
      "1. A controlled pre-thrust position loads the joint within a safe range.",
      "2. The brief thrust creates a rapid mechanical impulse.",
      "3. Joint, muscle, tendon and skin receptors send a large burst of sensory input.",
      "4. Spinal and supraspinal networks can change nociceptive processing and motor output.",
      "5. Muscle tone and pain sensitivity may change immediately.",
      "6. If cavitation occurs, gas/vapor cavity formation and collapse/separation phenomena create the audible sound.",
      "7. The short-term improvement is then reinforced with active movement/exercise."
    ],
    physiology: [
      "Neurophysiological effects can occur with or without cavitation.",
      "The treatment can influence peripheral, spinal and supraspinal systems rather than acting only at one local joint.",
      "Changes in muscle activity are usually transient.",
      "Cavitation is a physical joint-fluid phenomenon, not proof of vertebral correction.",
      "Expectancy and contextual effects can amplify or reduce the response."
    ],
    clinicalTranslation: [
      "The goal is a useful clinical response, not a click.",
      "A thrust should only be used after appropriate screening, consent and formal practical training.",
      "Follow immediately with active rehabilitation."
    ],
    myths: [
      "Do not claim a vertebra was 'put back in'.",
      "Do not repeat thrusts simply to obtain cavitation.",
      "Do not assume a louder pop means a better treatment."
    ],
    evidenceNote:
      "Evidence supports multisystem neurophysiological responses; lasting biomechanical repositioning is not established as the primary mechanism."
  },

  "pnf-manual-techniques": {
    mechanismMap: "Proprioceptive input + graded resistance + diagonal task practice → altered motor-unit recruitment and sensorimotor control → improved coordinated movement",
    simpleExplanation:
      "PNF uses touch, stretch, resistance, verbal commands and functional movement patterns to give the nervous system rich proprioceptive information. The goal is not to activate a mysterious reflex pathway; it is to improve motor control, recruitment, timing and strength through guided practice.",
    stepByStep: [
      "1. Manual contact and limb position provide proprioceptive information.",
      "2. Muscle spindles, tendon receptors, joint receptors and skin receptors contribute to the sensory signal.",
      "3. Voluntary effort recruits motor units while the therapist grades resistance.",
      "4. Repeated diagonal movement improves coordination and sensorimotor mapping.",
      "5. Techniques such as rhythmic initiation reduce complexity first, then increase active participation.",
      "6. Stabilizing reversals train co-contraction and postural control.",
      "7. The pattern becomes useful when transferred into a real task such as reaching, stepping or gait."
    ],
    physiology: [
      "Proprioceptive input helps the CNS estimate joint position, movement and force.",
      "Graded resistance can increase motor-unit recruitment while preserving movement quality.",
      "Repeated successful practice supports motor learning and cortical adaptation.",
      "Traditional reciprocal-inhibition concepts may contribute but are not the only explanation.",
      "Visual and verbal cueing add additional sensory channels."
    ],
    clinicalTranslation: [
      "Resistance should enhance, not stop, the movement.",
      "The diagonal is a tool; the functional task is the real goal."
    ],
    myths: [
      "Do not treat diagonal patterns as magic movements.",
      "Do not assume stronger resistance always creates more facilitation."
    ],
    evidenceNote:
      "The most defensible mechanism is sensorimotor learning plus proprioceptive and resistance-based motor recruitment."
  },

  "fascial-manipulation": {
    mechanismMap: "Focused fascial friction/pressure → local sensory input + tissue shear/deformation → pain-modulation + movement tolerance change",
    simpleExplanation:
      "Fascial Manipulation uses focused treatment at selected fascial points based on a system-specific movement analysis. Local pressure and shear clearly create sensory and mechanical effects. Some theories propose changes in hyaluronan viscosity or fascial gliding, but these mechanisms are still being investigated and should not be presented as settled facts.",
    stepByStep: [
      "1. A movement problem is mapped to a candidate fascial region.",
      "2. Focused friction produces local shear and pressure.",
      "3. Fascial, cutaneous and muscular sensory receptors respond.",
      "4. Local pain sensitivity and protective motor output may change.",
      "5. Tissue temperature/fluid behavior and short-term glide may change.",
      "6. The original movement is retested to decide whether the selected point was clinically meaningful."
    ],
    physiology: [
      "Fascia is innervated and mechanically connected to surrounding tissues.",
      "Hyaluronan-related changes in tissue gliding are biologically plausible, but direct clinical proof that manual friction 'normalizes densification' is limited.",
      "Pain modulation through peripheral/spinal/supraspinal pathways likely contributes.",
      "Mechanical deformation is real but should not be confused with permanent fascial reorganization after one session."
    ],
    clinicalTranslation: [
      "Let movement change validate the point selection.",
      "Use a focused dose and avoid prolonged aggressive tissue trauma."
    ],
    myths: [
      "Do not present system-specific maps as anatomical certainty.",
      "Do not claim that a single point permanently restructures an entire fascial chain."
    ],
    evidenceNote:
      "Sensory and mechanical effects are plausible; several system-specific biochemical explanations remain hypotheses rather than fully established clinical mechanisms."
  },

  "active-release-style-soft-tissue": {
    mechanismMap: "Sustained tissue contact + active excursion → sensory input + relative tissue gliding + stretch-tolerance change → easier functional movement",
    simpleExplanation:
      "Active release-style techniques combine pressure with the patient's active movement. The contact creates a local mechanical/sensory stimulus while the tissue moves underneath it. The active movement adds motor control and graded exposure, so the effect is more than passive massage.",
    stepByStep: [
      "1. The therapist contacts the target tissue in a shortened position.",
      "2. The patient actively lengthens or moves the region.",
      "3. Tissue layers glide relative to each other under the contact.",
      "4. Mechanoreceptors receive changing pressure and stretch information.",
      "5. Pain sensitivity and stretch tolerance may improve.",
      "6. Active participation gives the nervous system a successful movement experience.",
      "7. Strength/loading follows to build long-term capacity."
    ],
    physiology: [
      "Relative tissue excursion is normal and can be trained/tolerated through movement.",
      "The combination of manual pressure and active movement produces rich sensorimotor input.",
      "Immediate ROM gains are more likely related to sensory/stretch-tolerance change than tearing adhesions.",
      "Active movement helps transfer any manual effect into motor control."
    ],
    clinicalTranslation: [
      "Use moderate pressure and slow active movement.",
      "Retest the same functional movement afterward."
    ],
    myths: [
      "Do not claim the therapist is peeling apart adhesions.",
      "Do not use excessive pressure that prevents normal active movement."
    ],
    evidenceNote:
      "The likely mechanism is combined mechanical excursion, sensory modulation and active motor exposure."
  },

  "manual-lymphatic-drainage": {
    mechanismMap: "Gentle skin stretch + external pressure gradient → interstitial fluid movement + lymphatic uptake/pumping support → improved edema management with compression/exercise",
    simpleExplanation:
      "MLD is very different from deep massage. Gentle skin stretch creates small external pressure changes that can encourage superficial interstitial fluid movement toward functioning lymphatic pathways. Lymph is then transported by lymphatic vessel contractions, one-way valves, breathing and skeletal-muscle activity. MLD works best as one part of complete decongestive therapy.",
    stepByStep: [
      "1. Very light skin stretch changes local interstitial pressure and tissue fluid movement.",
      "2. Initial lymphatic capillaries take up interstitial fluid and macromolecules.",
      "3. Fluid enters collecting lymphatic vessels containing one-way valves.",
      "4. Smooth muscle in collecting lymphatics contracts rhythmically and propels lymph centrally.",
      "5. Breathing, arterial pulsation and skeletal-muscle contraction provide additional external pumping forces.",
      "6. Compression helps maintain pressure gradients and prevents rapid fluid reaccumulation.",
      "7. Exercise activates the muscle pump and supports long-term fluid control."
    ],
    physiology: [
      "Collecting lymphatic vessels have intrinsic phasic contractility — a true lymphatic pump.",
      "One-way valves prevent backflow.",
      "Mechanical stretch and flow/shear can influence lymphatic vessel contractile behavior.",
      "Skeletal muscle, respiration and external compression are important extrinsic pumps.",
      "Deep pressure is unnecessary and may be counterproductive in fragile tissues."
    ],
    clinicalTranslation: [
      "MLD is usually an adjunct, not a complete treatment by itself.",
      "Compression, exercise, skin care and self-management are major parts of long-term lymphedema care."
    ],
    myths: [
      "Do not describe MLD as flushing toxins.",
      "Do not use deep massage pressure to 'push lymph'.",
      "Do not treat unexplained unilateral swelling before DVT/infection/medical causes are excluded."
    ],
    evidenceNote:
      "The physiology of lymphatic uptake, intrinsic vessel pumping, valves and extrinsic pumps is well established. The size of additional clinical benefit from MLD varies by condition and should be considered within comprehensive edema management."
  },

  "scar-mobilization": {
    mechanismMap: "Graded healed-scar loading → mechanosensory desensitization + tissue glide + repeated mechanotransduction over time → improved tolerance and mobility",
    simpleExplanation:
      "Scar mobilization does not instantly erase scar tissue. Once a wound is fully healed, gentle multidirectional loading can improve how the scar and surrounding skin move, reduce sensitivity and expose the tissue to graded mechanical stress. Repeated loading over time can influence remodeling through mechanotransduction.",
    stepByStep: [
      "1. Pressure and shear move the healed scar and surrounding skin.",
      "2. Sensory receptors receive repeated non-threatening touch and movement, which can reduce hypersensitivity.",
      "3. Mechanical loading creates cellular mechanotransduction signals in fibroblasts and extracellular matrix.",
      "4. Over repeated sessions and normal movement, collagen and matrix organization continue to remodel.",
      "5. Relative glide between skin, scar and deeper tissues can improve.",
      "6. Adding joint movement exposes the scar to function-specific load.",
      "7. The result can be better comfort, mobility and confidence."
    ],
    physiology: [
      "Scar remodeling naturally continues for months and is influenced by mechanical loading.",
      "Fibroblasts respond to mechanical forces through mechanotransduction pathways.",
      "Immediate mobility change may reflect tissue glide and sensory tolerance, while true remodeling requires time.",
      "Desensitization is a nervous-system adaptation to repeated safe sensory input."
    ],
    clinicalTranslation: [
      "Only mobilize after adequate wound closure and healing.",
      "Progress pressure and direction gradually.",
      "Combine scar work with the movement the scar needs to tolerate."
    ],
    myths: [
      "Do not claim a few minutes of massage removes a scar.",
      "Do not mobilize an unhealed incision.",
      "Do not force fragile or irradiated tissue."
    ],
    evidenceNote:
      "The biological basis of mechanotransduction and scar remodeling is established; the optimal manual dose varies with wound stage, tissue quality and surgery."
  }
};

export const manualTherapyMechanismEvidence = {
  summary:
    "Manual therapy does not have one universal mechanism. Modern evidence supports interacting peripheral, spinal, supraspinal, neurovascular, neuromuscular and contextual responses. The exact mechanism responsible for a patient's clinical improvement is often uncertain.",
  sourceTitle:
    "The mechanisms of manual therapy: A living review of systematic, narrative, and scoping reviews",
  sourceYear: "2025",
  sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/40100908/",
};
