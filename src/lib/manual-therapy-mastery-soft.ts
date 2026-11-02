import type { MasteryGuide } from "@/lib/manual-therapy-mastery-types";

export const masterySoftTissue: MasteryGuide[] = [
  {
    slug: "cyriax-deep-transverse-friction",
    oneLine: "Firm, small rubbing strokes across the fibres of a tendon or ligament, applied exactly on the sore spot.",
    whatItIs: "Deep Transverse Friction (DTF) is a technique where you press into a tendon or ligament and rub back and forth across the direction of its fibres, right over the tender area. It is used for tendon and ligament problems after the exact location has been found by examination.",
    analogy: "Like rubbing across the grain of a rope rather than along it. Moving across the fibres reaches the sore spot directly and disturbs the tissue more than gliding along it.",
    coreIdeas: [
      "Location is everything: find the exact tender spot first, then treat that spot only.",
      "Position the tendon so it is stretched slightly or exposed, so the fingers move the tissue underneath rather than sliding over skin.",
      "The first minute is uncomfortable, then the area often becomes numbed, which allows deeper work."
    ],
    terms: [
      { term: "Transverse", meaning: "Across the fibres, at right angles to them." },
      { term: "Tendinopathy", meaning: "A painful, overloaded tendon, not always inflamed." },
      { term: "Selective tension", meaning: "Cyriax's examination method: test resisted movements to find which tissue is hurt." },
      { term: "Analgesia", meaning: "Reduced pain sensation, often occurring after a minute or two of friction." },
      { term: "Mobilize the scar", meaning: "The traditional idea of preventing or breaking adhesions. Evidence for this mechanism is weak." }
    ],
    whenToUse: [
      "A well-located tendon or ligament problem with a clear tender spot, for example tennis elbow.",
      "Sub-acute or persistent problems where the tissue can tolerate pressure.",
      "As an adjunct before or alongside exercise."
    ],
    whenNot: [
      "Open wounds, infection, skin problems or bruising.",
      "Calcified or unstable tissue, or any suspected partial or full tear that needs medical review.",
      "Pain that increases sharply or does not settle after the session."
    ],
    steps: [
      { title: "Locate the lesion", detail: "Use palpation and resisted movements to find the exact tender site." },
      { title: "Position the tendon", detail: "Place the patient so the tendon is accessible, for example elbow bent for the wrist extensor tendon at the outer elbow." },
      { title: "Choose a contact", detail: "Use your index finger reinforced by the middle finger, or thumb, with the finger pad fixed on the skin." },
      { title: "Move across the fibres", detail: "Your whole arm moves the contact finger back and forth across the tendon, keeping the skin and your finger together." },
      { title: "Ask about pain and wait for analgesia", detail: "Tolerable discomfort is expected. Increase depth once it eases." },
      { title: "Retest and follow with movement", detail: "Gently stretch or move the tendon and retest the original painful action." }
    ],
    dose: "Typical teaching range: about 5-10 minutes per session, a few sessions per week, always followed by exercise and load management. Reassess after 3-4 sessions.",
    example: {
      patient: "Hamza, 44, plumber, outer elbow pain when turning wrenches.",
      assessment: "Resisted wrist extension reproduces pain, with a single tender spot at the tendon's attachment.",
      treatment: "You apply transverse friction for six minutes, with brief pauses and the elbow supported.",
      reassess: "Resisted extension is less painful. He then begins graded strengthening, adjusts his grip and returns in a week."
    },
    mistakes: [
      "Rubbing along the fibres rather than across them.",
      "Sliding over the skin instead of moving the tissue beneath.",
      "Skipping exercise afterward."
    ],
    selfTest: [
      { q: "Across or along the fibres?", a: "Across the fibres." },
      { q: "Why wait for analgesia?", a: "Once the area is less sensitive, deeper pressure is tolerable." }
    ],
    recap: "Find the exact spot, rub across the fibres, then load the tendon.",
    evidence: "Research does not show convincing benefit of friction massage over other treatments for tendon problems. It can reduce pain for some patients in the short term, and should be combined with exercise."
  },
  {
    slug: "muscle-energy-technique",
    oneLine: "A gentle muscle contraction by the patient against your precise resistance, followed by a stretch or movement into the new range.",
    whatItIs: "Muscle Energy Technique (MET) uses the patient's own muscle effort. They push lightly in a specific direction against your counterforce for several seconds, then relax, and you take the joint or muscle to a new end of range.",
    analogy: "Like a spring that has just been squeezed gently: after letting go, it stretches more easily. The patient provides the energy; you only guide direction and limits.",
    coreIdeas: [
      "Precise position, direction and gentle force (about 20 percent of maximum effort) matter more than strength.",
      "Post-isometric relaxation: after a gentle hold, the muscle often relaxes and stretches more.",
      "Reciprocal inhibition: contracting the opposite muscle can help the tight one relax."
    ],
    terms: [
      { term: "Barrier", meaning: "The point where movement first meets resistance." },
      { term: "Isometric", meaning: "A contraction without joint movement." },
      { term: "Post-isometric relaxation (PIR)", meaning: "The reduced tension often felt after a gentle hold." },
      { term: "Reciprocal inhibition (RI)", meaning: "Tightening the opposite muscle to ease the tight one." },
      { term: "Counterforce", meaning: "Your resistance matching the patient's effort so nothing moves." }
    ],
    whenToUse: [
      "Muscle tightness limiting range, for example hamstrings or hip muscles.",
      "Joint stiffness where a muscle contributes, such as a restricted neck rotation.",
      "When the patient cannot tolerate forceful stretching."
    ],
    whenNot: [
      "Fracture, acute tear, severe osteoporosis or instability.",
      "Uncontrolled blood pressure problems (avoid breath-holding).",
      "Pain that increases with the contraction."
    ],
    steps: [
      { title: "Find the restriction", detail: "Move the limb or joint to the first resistance. Example: raise the straight leg until the hamstring tightens." },
      { title: "Choose the direction", detail: "For PIR, the patient pushes with the tight muscle. For RI, with the opposite muscle." },
      { title: "Give clear instructions", detail: "'Push gently against my hand, about a fifth of your strength.'" },
      { title: "Hold the contraction", detail: "Hold for about 5-10 seconds while you match their force so nothing moves." },
      { title: "Relax and take up the slack", detail: "Tell them to relax fully, wait a moment, then move to the new barrier." },
      { title: "Repeat and retest", detail: "Repeat 3-5 times and retest range." }
    ],
    dose: "Typical teaching range: contraction of about 20 percent effort held 5-10 seconds, 3-5 repetitions, with a short stretch hold (about 10-30 seconds) after the final repeat.",
    example: {
      patient: "Alina, 29, runner, tight right hamstring; straight leg raise 65 degrees.",
      assessment: "Gentle stretch sensation, no sharp pain, no tear signs.",
      treatment: "At 65 degrees she presses her heel lightly into your shoulder for 8 seconds, relaxes, and you lift the leg further. Repeat 4 times.",
      reassess: "Raise improves to 80 degrees. She repeats the stretch daily and continues hamstring strengthening."
    },
    mistakes: [
      "Asking for a hard contraction that causes shaking and pain.",
      "Not waiting for full relaxation before moving.",
      "Allowing the joint to move during the contraction."
    ],
    selfTest: [
      { q: "How hard should the contraction be?", a: "Gentle, about 20 percent of maximum effort." },
      { q: "What does RI use?", a: "The opposite muscle to help the tight muscle relax." }
    ],
    recap: "Light push, full relax, then move to the new barrier.",
    evidence: "MET can improve flexibility and short-term pain in some conditions, but the original neurological explanations are not well proven. Gains may come from changes in stretch tolerance."
  },
  {
    slug: "strain-counterstrain",
    oneLine: "Finding a tender point, then holding the body in the position of most comfort for about 90 seconds to settle it.",
    whatItIs: "Strain-Counterstrain (also called positional release) uses a tender point on the body as a guide. You gently place the body so the tender point becomes much less sore, hold for about 90 seconds, then return slowly.",
    analogy: "Like loosening a taut guitar string by moving the tuning peg slightly closer: instead of stretching the sore spot, you slacken it.",
    coreIdeas: [
      "Move toward comfort, not into stretch.",
      "Use the patient's tenderness rating as the guide: reduce it by at least about 70 percent.",
      "Return to neutral slowly and recheck the tender point."
    ],
    terms: [
      { term: "Tender point", meaning: "A small, sore spot found by gentle pressure, used as a monitor for positioning." },
      { term: "Position of comfort", meaning: "The position where the tender point hurts least." },
      { term: "Tenderness scale", meaning: "A 0-10 rating the patient gives when you press the point." },
      { term: "Shortening", meaning: "Moving the muscle's two ends closer together." },
      { term: "Fine-tuning", meaning: "Small adjustments of position until tenderness drops." }
    ],
    whenToUse: [
      "Acute or irritable muscle or joint tenderness where stretching hurts.",
      "Patients who cannot tolerate firm treatment.",
      "As a gentle option before movement-based approaches."
    ],
    whenNot: [
      "Unstable fracture or serious joint or spine instability.",
      "Positioning causes pain, dizziness or neurological symptoms.",
      "Cannot achieve a comfortable position."
    ],
    steps: [
      { title: "Find the tender point", detail: "Press gently and ask for a 0-10 rating. Say 10 is the baseline." },
      { title: "Maintain light pressure", detail: "Keep a finger on the point so you can monitor." },
      { title: "Move toward ease", detail: "Slowly bend, rotate or side-bend the body part toward shortening the tissue until the rating falls, aiming for 3/10 or lower." },
      { title: "Fine-tune", detail: "Make tiny adjustments to reach the lowest rating." },
      { title: "Hold", detail: "Hold about 90 seconds while the patient breathes comfortably." },
      { title: "Return slowly and recheck", detail: "Slowly return to neutral and press the point again." }
    ],
    dose: "Typical teaching range: about 90 seconds per tender point, usually a few points per session, with gentle pressure only. Stop if symptoms increase.",
    example: {
      patient: "Grace, 56, tender spot at the front of her neck after a prolonged posture, painful on extending the head.",
      assessment: "Tender point rated 8/10. No red flags.",
      treatment: "You place her head in slight flexion and side-bend until the point is 2/10. Hold 90 seconds, slowly return.",
      reassess: "The point is now 3/10 and extension is less painful. You add posture advice and gentle movement."
    },
    mistakes: [
      "Using heavy pressure on the point.",
      "Moving into stretch instead of toward comfort.",
      "Returning too quickly."
    ],
    selfTest: [
      { q: "Which way do you move the tissue?", a: "Toward comfort, shortening it." },
      { q: "Typical hold time?", a: "About 90 seconds." }
    ],
    recap: "Find the sore point, move toward ease, hold, return slowly.",
    evidence: "Evidence is limited to small studies. Reported benefit may reflect relaxation, pain modulation and positive expectations. The traditional muscle-spindle explanation is not proven."
  },
  {
    slug: "facilitated-positional-release",
    oneLine: "A short, gentle method: find the neutral position of a tight area, add a small compression, then move toward comfort for a few seconds.",
    whatItIs: "Facilitated Positional Release (FPR) brings a tissue into its neutral, relaxed position, adds a light compressive or twisting 'facilitating' force, and then moves it toward ease for a few seconds. It is quicker than Strain-Counterstrain.",
    analogy: "Like gently pressing a stuck button down slightly before releasing it, so it clicks back up to rest.",
    coreIdeas: [
      "Find neutral first, where tissue tension is lowest.",
      "A small compression facilitates the tissue before moving toward ease.",
      "Reassess immediately after the brief hold."
    ],
    terms: [
      { term: "Neutral", meaning: "The position with the least tension in the area." },
      { term: "Facilitating force", meaning: "A light compression added to the neutral position." },
      { term: "Ease", meaning: "The direction in which the tissue feels loosest." },
      { term: "Palpation", meaning: "Feeling the tissue with your fingers." }
    ],
    whenToUse: [
      "Tight, tender muscle areas that are sensitive to firm treatment.",
      "Neck and back muscle tension as part of a larger plan."
    ],
    whenNot: [
      "Fracture, instability or unexplained severe pain.",
      "Compression causes sharp pain or neurological symptoms.",
      "Cannot find a comfortable neutral position."
    ],
    steps: [
      { title: "Locate the tight area", detail: "Palpate the muscle or segment and find the restriction." },
      { title: "Find neutral", detail: "Position the area so the tissue feels softest." },
      { title: "Add light compression", detail: "Apply gentle compression along the area, such as down through the shoulder or spine." },
      { title: "Move toward ease", detail: "Slightly bend or rotate toward the easier direction." },
      { title: "Hold briefly", detail: "Hold about 3 seconds." },
      { title: "Release and recheck", detail: "Slowly return and retest the original movement or tenderness." }
    ],
    dose: "Typical teaching range: a hold of about 3 seconds per attempt, repeated if needed. Keep forces light and stop if symptoms increase.",
    example: {
      patient: "Noor, 35, tight upper trapezius after prolonged laptop use.",
      assessment: "Tender band on the right, neck side-bend limited.",
      treatment: "You find neutral with the arm supported, add light compression through the shoulder, move slightly toward ease and hold for 3 seconds.",
      reassess: "Side-bend improves. She is given posture and movement advice."
    },
    mistakes: [
      "Using strong compression.",
      "Holding far longer than needed.",
      "Skipping reassessment."
    ],
    selfTest: [
      { q: "What do you find first?", a: "The neutral position." },
      { q: "Typical hold time?", a: "About 3 seconds." }
    ],
    recap: "Neutral, light compression, ease, short hold, retest.",
    evidence: "Evidence is limited and mostly small studies. Benefits may relate to relaxation and sensory input rather than a specific tissue change."
  },
  {
    slug: "myofascial-release",
    oneLine: "Slow, sustained pressure or stretch on the tissue envelope (fascia) until it feels like it softens, either into the restriction (direct) or toward ease (indirect).",
    whatItIs: "Myofascial release is a hands-on method using slow, sustained contact on the muscle and fascia (the connective tissue around muscles) to ease tightness and improve movement. Direct technique engages the barrier; indirect moves toward ease first.",
    analogy: "Like slowly warming honey: pressing hard and fast makes it stick; a slow, steady touch lets it flow.",
    coreIdeas: [
      "Go slowly and wait for the tissue to respond. Speed is the enemy.",
      "Direct means into the restriction; indirect means toward ease and then follow.",
      "A 'release' is a felt change, probably due to nervous system and fluid changes, not literal breaking of fascia."
    ],
    terms: [
      { term: "Fascia", meaning: "Connective tissue wrapping muscles, bones and organs." },
      { term: "Barrier", meaning: "The point where tissue first resists." },
      { term: "Direct technique", meaning: "Gently loading tissue into the barrier." },
      { term: "Indirect technique", meaning: "Moving tissue away from the barrier toward ease." },
      { term: "Release", meaning: "The feeling of tissue softening or yielding under your hands." }
    ],
    whenToUse: [
      "Tight, restricted areas where gentle sustained contact is acceptable.",
      "Post-surgical or postural tightness once safe to load.",
      "Patients who prefer a gentle approach."
    ],
    whenNot: [
      "Open wounds, infection, acute inflammation, or fresh surgery.",
      "Suspected clots, fractures or tumour.",
      "Pain that increases or nerve symptoms develop."
    ],
    steps: [
      { title: "Observe and palpate", detail: "Look at posture and movement, then feel for areas of tension." },
      { title: "Make broad, skin-to-skin contact", detail: "No oil. Use a relaxed, flat hand, fingers or forearm." },
      { title: "Take up slack", detail: "Gently move the skin and tissue until you meet resistance." },
      { title: "Hold and wait", detail: "Hold steady, following any softening, for 90-120 seconds or longer." },
      { title: "Follow the tissue", detail: "As it yields, maintain contact and follow its direction slowly." },
      { title: "Retest movement", detail: "Re-check the original range or comfort." }
    ],
    dose: "Typical teaching range: 90 seconds to a few minutes per area. Light to moderate pressure. Stop if pain increases.",
    example: {
      patient: "Marta, 40, tight low back after a caesarean scar healed, difficulty extending fully.",
      assessment: "Tissue around the lower abdomen and hip feels restricted; extension is limited.",
      treatment: "You apply slow, direct pressure to the lower abdominal tissue for two minutes, following any softening.",
      reassess: "She can extend more and feels less pulling. Gentle movement exercises are added."
    },
    mistakes: [
      "Rushing and sliding over the skin.",
      "Using heavy pressure.",
      "Not retesting movement."
    ],
    selfTest: [
      { q: "Direct vs indirect?", a: "Direct goes into the restriction; indirect goes toward ease." },
      { q: "Why go slowly?", a: "The nervous system and tissues respond to patient, sustained input." }
    ],
    recap: "Slow, steady, follow the tissue, retest.",
    evidence: "Reviews suggest short-term improvements in pain and function in some conditions. The idea that fascia is physically stretched or broken by manual pressure is not well supported."
  },
  {
    slug: "soft-tissue-mobilization",
    oneLine: "Hands-on strokes, kneading and pressure on muscle and soft tissue to relax it, improve circulation and improve movement.",
    whatItIs: "Soft-tissue mobilization is the skilled use of strokes, kneading, compression and friction on muscles and tendons. You adjust depth, speed and direction by how the tissue and the patient respond.",
    analogy: "Like working dough. Gentle, steady kneading softens it; harsh pounding just bruises it.",
    coreIdeas: [
      "Match pressure to tissue state and pain level, not to how hard you can push.",
      "Warm up with light strokes before deeper work.",
      "Always check the effect on movement or pain afterward."
    ],
    terms: [
      { term: "Effleurage", meaning: "Long, gliding strokes used to warm up and finish." },
      { term: "Petrissage", meaning: "Kneading or squeezing the muscle." },
      { term: "Friction", meaning: "Small, deeper circular or cross strokes on a specific area." },
      { term: "Compression", meaning: "Steady pressure on a muscle." },
      { term: "Guarding", meaning: "Involuntary tightening of muscles because of pain or fear." }
    ],
    whenToUse: [
      "Muscle tension, soreness or stiffness limiting movement.",
      "Preparing tissue before exercise or stretching.",
      "Recovery after training."
    ],
    whenNot: [
      "Deep vein thrombosis, infection, open wounds, fractures or severe bruising.",
      "Areas of unexplained lumps or swelling.",
      "Pain that rises sharply."
    ],
    steps: [
      { title: "Assess and explain", detail: "Look at the area, ask about pain, and explain what you will do." },
      { title: "Position comfortably", detail: "Support the area so the muscle relaxes." },
      { title: "Warm up", detail: "Use light effleurage in the direction of the muscle." },
      { title: "Deepen gradually", detail: "Add kneading or compression, asking about comfort." },
      { title: "Target tight spots", detail: "Use friction or sustained pressure briefly." },
      { title: "Finish and retest", detail: "Return to light strokes, then retest movement." }
    ],
    dose: "Typical teaching range: 5-15 minutes for an area, with moderate pressure the patient finds 'good-sore', not painful. Adjust frequency to recovery.",
    example: {
      patient: "Tariq, 33, cyclist, tight right calf after a long ride.",
      assessment: "Calf is tender and tight, ankle dorsiflexion limited; no signs of a clot or tear.",
      treatment: "You warm up with long strokes, knead the calf for six minutes, then apply compression to a tight spot.",
      reassess: "Dorsiflexion improves and soreness lessens. He follows with a gentle calf stretch."
    },
    mistakes: [
      "Using the same pressure on every patient.",
      "Pressing on a possible blood clot.",
      "Ignoring pain signals."
    ],
    selfTest: [
      { q: "What is petrissage?", a: "Kneading or squeezing the muscle." },
      { q: "When avoid it?", a: "Suspected clot, infection, open wound or fracture." }
    ],
    recap: "Warm up, deepen gradually, retest.",
    evidence: "Massage and soft-tissue work give short-term relief for pain and tension in several conditions. Benefits are modest and temporary and are best combined with active care."
  },
  {
    slug: "trigger-point-compression",
    oneLine: "Steady pressure held on a tender knot in a muscle until its pain eases, usually followed by stretching.",
    whatItIs: "A trigger point is a sore, tight spot in a muscle band that, when pressed, can reproduce the patient's pain or refer pain elsewhere. Trigger-point pressure release (ischemic compression) means holding steady, tolerable pressure on it until the tenderness drops.",
    analogy: "Like pressing a sore spot on a stiff rubber band until it softens. Gentle persistence works better than a quick jab.",
    coreIdeas: [
      "The goal is to reproduce the familiar pain, which suggests the right spot, not to create new pain.",
      "Pressure should be strong but tolerable, around 5-6 out of 10.",
      "Follow with gentle stretching and movement so the benefit lasts."
    ],
    terms: [
      { term: "Trigger point", meaning: "A tender spot in a taut muscle band that can reproduce or refer pain." },
      { term: "Referred pain", meaning: "Pain felt away from the pressed spot, for example neck knot causing headache." },
      { term: "Taut band", meaning: "A tight, rope-like strip of muscle." },
      { term: "Ischemic compression", meaning: "Sustained pressure that temporarily reduces blood flow before it returns." },
      { term: "Tolerable discomfort", meaning: "A strong feeling that the patient can breathe through and that eases." }
    ],
    whenToUse: [
      "Muscle pain with a clear tender spot that reproduces the patient's pain.",
      "Headaches from neck and shoulder muscles.",
      "Pain with restricted muscle movement."
    ],
    whenNot: [
      "Infection, open wounds, or fragile skin.",
      "People on strong blood thinners or with bleeding disorders, unless discussed with their doctor.",
      "Pressure that causes sharp pain or numbness."
    ],
    steps: [
      { title: "Find the taut band", detail: "Slide across the muscle fibres to feel a rope-like band and a tender spot." },
      { title: "Confirm the spot", detail: "Gentle pressure should reproduce the familiar pain." },
      { title: "Apply steady pressure", detail: "Press to the point where the patient feels strong but tolerable discomfort." },
      { title: "Hold and wait", detail: "Hold 30-90 seconds until the tenderness reduces." },
      { title: "Release gradually", detail: "Reduce pressure slowly." },
      { title: "Stretch and retest", detail: "Gently stretch the muscle and retest pain or range." }
    ],
    dose: "Typical teaching range: 30-90 seconds, repeated 2-3 times per spot, followed by stretching. If tenderness does not reduce after several holds, change the plan.",
    example: {
      patient: "Elena, 37, tension headache with a tender knot at the top of the right shoulder.",
      assessment: "Pressing the upper trapezius reproduces pain behind her eye.",
      treatment: "You hold steady pressure for 60 seconds, twice, then guide a gentle neck stretch.",
      reassess: "Tenderness drops from 7/10 to 3/10 and neck rotation improves. You add posture and shoulder exercises."
    },
    mistakes: [
      "Using fast, repeated jabs.",
      "Pressing far past tolerance.",
      "Not stretching afterward."
    ],
    selfTest: [
      { q: "What is referred pain?", a: "Pain felt away from the pressed spot." },
      { q: "Typical hold time?", a: "30-90 seconds." }
    ],
    recap: "Find the spot, hold steady, stretch, retest.",
    evidence: "Studies suggest short-term relief of pain for some patients, but the existence and exact nature of trigger points are debated. Treat results as pain relief, not proof of a specific structural cause."
  },
  {
    slug: "fascial-manipulation",
    oneLine: "A system (Stecco) that uses tender points along fascial lines, treated with deep friction, to treat pain and movement problems.",
    whatItIs: "Fascial Manipulation uses a structured examination to find particular points in fascia (centers of coordination and perception) linked to the patient's movement and pain. Deep friction is then applied to these points to restore movement.",
    analogy: "Like checking the knots along a net: you find the knot that changes the tension in the area the patient feels, and work there instead of where the net feels tight.",
    coreIdeas: [
      "The painful area may not be the treatment area. Examination links symptoms to movement directions and fascial segments.",
      "Treat specific points rather than broad areas.",
      "Always verify the effect on the patient's movement."
    ],
    terms: [
      { term: "Fascial segment", meaning: "A region of connected fascia and muscles responsible for a movement direction." },
      { term: "Centre of coordination", meaning: "A point believed to coordinate muscle fibres within a segment." },
      { term: "Centre of perception", meaning: "A point linked to the patient's perceived pain." },
      { term: "Movement verification", meaning: "Retesting a movement to confirm the point is relevant." },
      { term: "Deep friction", meaning: "Firm, small movements over the point." }
    ],
    whenToUse: [
      "Persistent musculoskeletal pain where movement patterns are not explained by one local area.",
      "Practitioners trained in the method."
    ],
    whenNot: [
      "Infection, wounds, tumours or fresh injury.",
      "Pain that rises sharply or neurological symptoms.",
      "Patients who cannot tolerate firm pressure."
    ],
    steps: [
      { title: "Take a detailed history", detail: "Where, when and in which movement does it hurt?" },
      { title: "Assess movement", detail: "Test movement in the main directions and note which is limited." },
      { title: "Select the segment", detail: "Choose the fascial segment linked to the limited direction." },
      { title: "Palpate the point", detail: "Find the tender, dense point in that segment." },
      { title: "Apply friction", detail: "Use a knuckle, elbow or finger to create deep friction until heat or reduced tenderness occurs." },
      { title: "Verify", detail: "Retest the movement that was limited." }
    ],
    dose: "Typical teaching range: a few minutes per point and a small number of points per session. Follow the training you receive.",
    example: {
      patient: "Rashid, 47, shoulder pain when lifting his arm, no clear injury.",
      assessment: "Arm lift is limited; a tender point is found along the upper back linked to lifting.",
      treatment: "Friction is applied to the point for 3-4 minutes.",
      reassess: "Lift improves and pain drops. Exercise is added."
    },
    mistakes: [
      "Treating random tender spots without a movement link.",
      "Over-pressing and bruising.",
      "Ignoring red flags."
    ],
    selfTest: [
      { q: "Why verify after treatment?", a: "To confirm the point mattered for the patient's movement or pain." },
      { q: "Is the sore area always the treatment area?", a: "No, the examination may point elsewhere." }
    ],
    recap: "Link the movement to the point, treat, then retest.",
    evidence: "Small studies suggest possible benefit for some musculoskeletal problems. Evidence is limited and the proposed fascial anatomy is still debated."
  },
  {
    slug: "active-release-style-soft-tissue",
    oneLine: "Hold a tight spot with your hand while the patient actively moves the muscle from short to long beneath your contact.",
    whatItIs: "In active-release-style work, you hold a precise contact on a restricted muscle, tendon or nerve interface and ask the patient to move the area from a shortened position into lengthening. The movement under the contact is the treatment.",
    analogy: "Like pinning down a piece of tape while pulling the surface beneath it: the pin and the movement together free the stuck area.",
    coreIdeas: [
      "Shorten, contact, then lengthen actively.",
      "The patient's own movement makes it active and functional.",
      "Use light to moderate contact; the movement does the work."
    ],
    terms: [
      { term: "Shortened position", meaning: "The muscle's two ends brought close together." },
      { term: "Contact tension", meaning: "A gentle press on the target tissue." },
      { term: "Active lengthening", meaning: "The patient slowly moves the muscle to its long position themselves." },
      { term: "Adhesion (concept)", meaning: "A stuck area between tissues, though evidence for physical adhesions is limited." }
    ],
    whenToUse: [
      "Overuse tightness, such as hamstring or forearm muscle restriction.",
      "When you want to combine hands-on work with movement."
    ],
    whenNot: [
      "Acute tear, infection, open wounds or bleeding disorders.",
      "Nerve symptoms that increase.",
      "Pain that rises sharply."
    ],
    steps: [
      { title: "Locate the restriction", detail: "Find the tight spot during movement and palpation." },
      { title: "Shorten the muscle", detail: "Place the area in a shortened position." },
      { title: "Apply contact", detail: "Press firmly but comfortably on the spot." },
      { title: "Ask for slow active lengthening", detail: "The patient actively moves the muscle toward lengthening while you hold." },
      { title: "Repeat a few times", detail: "Repeat 3-5 passes per spot." },
      { title: "Retest and load", detail: "Retest movement and add a strengthening exercise." }
    ],
    dose: "Typical teaching range: 3-5 passes per spot, a few spots per session. Keep contact tolerable and stop if symptoms spread.",
    example: {
      patient: "Ben, 28, runner with tight left hamstring when extending the knee.",
      assessment: "A tender spot mid-hamstring; knee extension limited.",
      treatment: "With the knee bent, you contact the spot; he slowly straightens his knee. Repeat 4 passes.",
      reassess: "Knee extension improves and tenderness drops. Strengthening follows."
    },
    mistakes: [
      "Rushing the active movement.",
      "Pressing too hard.",
      "Not combining with strengthening."
    ],
    selfTest: [
      { q: "What does the patient do?", a: "Slowly lengthens the muscle while you hold the contact." },
      { q: "Starting position?", a: "Shortened." }
    ],
    recap: "Shorten, hold, lengthen actively, retest.",
    evidence: "Studies are limited and low in quality, with some short-term improvements. The idea of breaking adhesions has little direct evidence."
  },
  {
    slug: "iastm",
    oneLine: "Using a smooth hand-held tool to stroke and press the soft tissue to find tight areas and improve movement.",
    whatItIs: "Instrument-Assisted Soft-Tissue Mobilization (IASTM) uses tools (stainless steel or similar) to scan tissue and apply controlled strokes. It is used for tendon, muscle and scar tissue restrictions, with a lubricant.",
    analogy: "Like running a smooth spoon over a bumpy surface: the tool lets you feel and treat irregularities with less effort on your hands.",
    coreIdeas: [
      "The tool is a way to scan and apply force, not a reason to push harder.",
      "Light strokes first; bruising is not the goal.",
      "Pair with movement and loading afterward."
    ],
    terms: [
      { term: "Scanning", meaning: "Gentle strokes to find rough or tender areas." },
      { term: "Stroke angle", meaning: "The angle between tool and skin, often 30-60 degrees." },
      { term: "Petechiae", meaning: "Small red spots from tiny blood vessel leaks. They can occur but are not a goal." },
      { term: "Lubricant", meaning: "Cream or oil to let the tool glide." }
    ],
    whenToUse: [
      "Persistent tendon or muscle tightness where hands-on soft-tissue work is suitable.",
      "As an adjunct before exercise."
    ],
    whenNot: [
      "Open wounds, skin disease, infection, deep vein thrombosis or fragile skin.",
      "Blood-thinning medication or bleeding disorders, unless checked with a doctor.",
      "Severe osteoporosis in the area or recent surgery."
    ],
    steps: [
      { title: "Assess and explain", detail: "Check skin and tissue and explain what the patient will feel." },
      { title: "Apply lubricant", detail: "Use enough so the tool glides." },
      { title: "Scan lightly", detail: "Stroke along the area to find tight, rough or tender spots." },
      { title: "Treat with controlled strokes", detail: "Use short, repeated strokes at 30-60 degrees along or across the tissue." },
      { title: "Monitor skin and pain", detail: "Reduce pressure if skin reddens strongly or pain is sharp." },
      { title: "Follow with movement", detail: "Retest and add loading exercise." }
    ],
    dose: "Typical teaching range: 1-3 minutes per area, light to moderate pressure, usually not more than 2 sessions per week for the same area, followed by exercise.",
    example: {
      patient: "Yusuf, 46, tight Achilles area after training, pain with calf raises.",
      assessment: "Tenderness in the calf and tendon, no tear signs.",
      treatment: "You scan, then stroke the calf for two minutes with a tool, avoiding the skin turning sore.",
      reassess: "Calf raises feel easier. A progressive loading plan is the main treatment."
    },
    mistakes: [
      "Believing bruising means it worked.",
      "Pressing hard without lubricant.",
      "Using the tool without an exercise plan."
    ],
    selfTest: [
      { q: "Do bruises indicate success?", a: "No. They are not the goal." },
      { q: "Stroke angle?", a: "About 30-60 degrees." }
    ],
    recap: "Scan, stroke gently, then load.",
    evidence: "Small trials show possible short-term improvements in pain and range. Evidence quality is low and benefits are not clearly greater than other soft-tissue methods."
  },
  {
    slug: "myofascial-decompression-dry-cupping",
    oneLine: "Using suction cups on the skin to lift the tissue, either held still or moved, to ease tightness and pain.",
    whatItIs: "Myofascial decompression (dry cupping) uses cups that create negative pressure, which lifts the skin and tissue slightly. Cups may be left in place (static) or glided over the area with oil (dynamic).",
    analogy: "Like lifting a sticky sheet of tape off a surface instead of pushing down on it. Pressure goes up, not down.",
    coreIdeas: [
      "It is the opposite of compression: tissue is lifted, not pressed.",
      "Circular marks are from suction and are not a sign that toxins were removed.",
      "Always check skin and recheck movement or pain."
    ],
    terms: [
      { term: "Negative pressure", meaning: "Suction that lifts the tissue." },
      { term: "Static cupping", meaning: "Cups held in place." },
      { term: "Dynamic cupping", meaning: "Cups glided across the skin." },
      { term: "Ecchymosis", meaning: "Bruising caused by suction." }
    ],
    whenToUse: [
      "Muscle tightness or soreness where a patient prefers or tolerates cupping.",
      "As an adjunct before movement exercises."
    ],
    whenNot: [
      "Skin infection, open wounds, sunburn or fragile skin.",
      "Bleeding disorders or blood-thinning medicines.",
      "Over varicose veins, pregnancy abdomen or low back, or deep vein thrombosis."
    ],
    steps: [
      { title: "Check skin and ask about medicines", detail: "Look for wounds, rashes and ask about blood thinners." },
      { title: "Choose cup size and location", detail: "Smaller cups for smaller areas." },
      { title: "Apply light suction", detail: "Start with a mild lift and check comfort." },
      { title: "Static or dynamic", detail: "Hold for several minutes or glide slowly with oil." },
      { title: "Monitor", detail: "Remove if pain, dizziness or excessive redness appears." },
      { title: "Retest and warn about marks", detail: "Retest movement. Explain marks fade in days." }
    ],
    dose: "Typical teaching range: static cupping about 5-10 minutes with mild to moderate suction; dynamic cupping a few minutes. Use mild suction first.",
    example: {
      patient: "Aisha, 31, tight upper back from desk work.",
      assessment: "Tight muscles, no skin issues, no blood thinners.",
      treatment: "Two cups placed for 6 minutes with mild suction.",
      reassess: "Her shoulder movement feels easier. You explain the marks and add stretches."
    },
    mistakes: [
      "Using strong suction at first.",
      "Promising detoxification.",
      "Leaving cups on too long."
    ],
    selfTest: [
      { q: "What do the circular marks mean?", a: "Suction bruising, not toxin removal." },
      { q: "When avoid it?", a: "Skin problems, bleeding disorders, blood-thinning medicines." }
    ],
    recap: "Lift the tissue gently, protect the skin, and measure real change.",
    evidence: "Some studies suggest short-term pain relief, though the quality is low and placebo effects are likely. Claims about detoxification are not supported."
  },
  {
    slug: "manual-lymphatic-drainage",
    oneLine: "Very light, slow skin-stretching strokes that move fluid toward the lymph nodes, done in a set order.",
    whatItIs: "Manual Lymphatic Drainage (MLD) is a very gentle massage that stretches the skin lightly to encourage lymph flow. It starts near the lymph nodes to make room, then works from the body toward the limb ends, directing strokes back toward the nodes. It is part of a bigger lymphedema program.",
    analogy: "Think of emptying a hose: you first clear the drain at the end, then gently squeeze the hose from the far end toward the drain.",
    coreIdeas: [
      "Pressure is very light, because lymph vessels lie just under the skin.",
      "Sequence is key: clear the neck or groin and nodes first, then the limb.",
      "MLD works best with compression bandaging, exercise and skin care."
    ],
    terms: [
      { term: "Lymphedema", meaning: "Swelling caused by lymph fluid not draining properly." },
      { term: "Lymph node", meaning: "A small filter station for lymph fluid (neck, armpit, groin)." },
      { term: "Terminus", meaning: "The area at the base of the neck where lymph drains into the bloodstream." },
      { term: "Complete decongestive therapy", meaning: "MLD plus compression, exercise and skin care." },
      { term: "Cellulitis", meaning: "A skin infection that is a contraindication." }
    ],
    whenToUse: [
      "Lymphedema, usually with medical guidance.",
      "Swelling after some surgeries when cleared by the medical team."
    ],
    whenNot: [
      "Acute infection, such as cellulitis, or acute blood clot.",
      "Uncontrolled heart failure or kidney failure, unless cleared.",
      "Active cancer in the area or unexplained swelling without a diagnosis."
    ],
    steps: [
      { title: "Check medical clearance and skin", detail: "Confirm diagnosis, check for infection and clots." },
      { title: "Prepare the drainage areas", detail: "Use gentle strokes at the base of the neck and the nearest nodes." },
      { title: "Work proximal first", detail: "Start with the part closest to the body, such as upper arm." },
      { title: "Move toward the distal end", detail: "Use light strokes in the direction of the nodes, moving gradually toward the hand." },
      { title: "Keep pressure very light", detail: "The skin should move without redness." },
      { title: "Compress and move", detail: "Apply compression garments or bandages and encourage gentle exercise." }
    ],
    dose: "Typical teaching range: 30-45 minute sessions, frequency set by the lymphedema plan. Pressure is very light, similar to the weight of a hand resting.",
    example: {
      patient: "Fiona, 60, mild swelling in her right arm after breast cancer surgery, cleared by her care team.",
      assessment: "Skin is intact with no infection signs. Arm is mildly swollen.",
      treatment: "You clear the neck and armpit area, then do light strokes from upper arm toward the hand, followed by compression.",
      reassess: "Arm circumference decreases a little and the heavy feeling eases. She does exercises and skin care."
    },
    mistakes: [
      "Pressing too hard.",
      "Starting at the swollen end.",
      "Treating without a medical diagnosis."
    ],
    selfTest: [
      { q: "Why light pressure?", a: "Lymph vessels lie just beneath the skin." },
      { q: "Where do you start?", a: "Near the drainage areas, not at the swollen end." }
    ],
    recap: "Clear the nodes first, then move fluid toward them, very lightly.",
    evidence: "MLD can help some patients with lymphedema as part of a combined program, but evidence that it adds much beyond compression and exercise is mixed."
  },
  {
    slug: "scar-mobilization",
    oneLine: "Gentle massage, skin-rolling and stretching of a healed scar so it moves more freely and feels less tight.",
    whatItIs: "Scar mobilization is hands-on work on a healed scar to improve how the skin and deeper tissues move together. It starts with light technique and progresses once the wound is fully closed and healed.",
    analogy: "A healed scar can be like a tight stitch in a piece of cloth. Gentle stretching helps the cloth move freely again.",
    coreIdeas: [
      "Only start once the wound has closed with no scabs, drainage or infection, and clinical advice allows.",
      "Move the scar in all directions, then follow with stretching.",
      "Combine with movement exercises and self-massage."
    ],
    terms: [
      { term: "Adherence", meaning: "The scar sticking to deeper tissues so movement is limited." },
      { term: "Skin rolling", meaning: "Lifting and rolling the skin between your fingers." },
      { term: "Cross-friction", meaning: "Small rubbing movements across the scar." },
      { term: "Hypertrophic scar", meaning: "A raised, thick scar within the original wound line." },
      { term: "Maturation", meaning: "The months-long phase of remodeling after wound closure." }
    ],
    whenToUse: [
      "Healed scars after surgery or injury that feel tight or limit movement.",
      "Cesarean, abdominal, hand or burn scars once cleared."
    ],
    whenNot: [
      "Open wound, scab, discharge, infection or unhealed sutures.",
      "Recent surgery before clearance.",
      "Unexplained redness, warmth, or increasing pain."
    ],
    steps: [
      { title: "Check healing", detail: "Confirm the scar is closed and ask about surgeon advice." },
      { title: "Observe and palpate", detail: "Note colour, thickness, tenderness and mobility." },
      { title: "Start with light touch", detail: "Gently move the scar and surrounding skin in circles." },
      { title: "Skin roll and glide", detail: "Lift, roll and slide the skin in different directions." },
      { title: "Add gentle stretch", detail: "Hold a gentle stretch across the tight direction." },
      { title: "Teach self-care and retest", detail: "Teach a short routine and check movement and tightness." }
    ],
    dose: "Typical teaching range: 5-10 minutes per session, with self-massage a few times a day. Use light to moderate pressure.",
    example: {
      patient: "Sofia, 33, six months after a cesarean section, tight pulling when leaning back.",
      assessment: "The scar is healed but stuck, with limited skin movement.",
      treatment: "You perform gentle skin rolling and sideways gliding for 6 minutes, then a light stretch.",
      reassess: "Skin glides better and leaning back is more comfortable. She learns a 5-minute home routine."
    },
    mistakes: [
      "Starting before the wound closes.",
      "Pressing too hard and irritating the scar.",
      "Not teaching self-care."
    ],
    selfTest: [
      { q: "When can you start?", a: "Once the wound is fully closed and healed, with clearance if needed." },
      { q: "What is skin rolling?", a: "Lifting and rolling the skin between fingers." }
    ],
    recap: "Wait for healing, move the scar in all directions, teach self-care.",
    evidence: "Evidence is limited and low quality, but scar massage may improve scar softness and movement for some. Combine with silicone or compression where indicated."
  }
];
