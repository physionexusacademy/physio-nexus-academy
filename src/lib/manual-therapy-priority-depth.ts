import type { ManualRegion } from "@/lib/manual-therapy-regional";
import type { RegionalSubTechnique } from "@/lib/manual-therapy-subtechniques";

type PriorityMap = Partial<
  Record<string, Partial<Record<ManualRegion, RegionalSubTechnique[]>>>
>;

function item(
  name: string,
  target: string,
  clinicalGoal: string,
  patientSetup: string,
  contact: string,
  direction: string,
  dosage: string,
  reassess: string,
  clinicalPearl?: string,
  safetyNote?: string,
): RegionalSubTechnique {
  return {
    name,
    target,
    clinicalGoal,
    patientSetup,
    contact,
    direction,
    dosage,
    reassess,
    clinicalPearl,
    safetyNote,
  };
}

export const priorityRegionalSubTechniques: PriorityMap = {
  "muscle-energy-technique": {
    Cervical: [
      item(
        "Upper Trapezius — MET",
        "Upper trapezius",
        "Reduce painful guarding or improve a side-bending restriction when the upper trapezius is clinically relevant.",
        "Supine or supported sitting. Gently side-bend the head away from the treated side until the first comfortable resistance is reached; keep the shoulder girdle relaxed.",
        "One hand supports the occiput/head. The other hand controls the superior shoulder so the scapula does not simply elevate.",
        "Ask the patient to gently elevate the shoulder or side-bend the head toward the treated side against matched resistance. After 5–10 seconds, relax fully and take up only the new pain-free range.",
        "3–5 low-effort contractions, usually about 10–20% effort. Reposition after each relaxation rather than forcing a stretch.",
        "Cervical side-bending, rotation, familiar neck pain and shoulder-elevation comfort.",
        "If the shoulder is not stabilized, the patient can compensate with scapular elevation instead of producing a useful cervical-muscle contraction.",
        "Stop if dizziness, unusual headache, distal neurological symptoms or marked symptom escalation appears."
      ),
      item(
        "Levator Scapulae — MET",
        "Levator scapulae",
        "Improve painful cervical rotation/flexion restriction associated with levator scapulae guarding.",
        "Supported sitting or supine. Move the neck gently into flexion, rotation away and slight side-bending away from the treated side until the first comfortable barrier.",
        "Support the head while the other hand controls the superior-medial scapular border/shoulder girdle.",
        "Ask the patient to gently elevate the shoulder blade toward the ear against resistance. Relax, then take up the new comfortable neck/scapular position.",
        "3–5 contractions of 5–10 seconds at low effort.",
        "Cervical rotation, flexion and the patient's familiar upper-medial scapular pain.",
        "Think 'scapula plus neck'—if only the neck is moved, the levator may not be specifically loaded.",
        "Avoid aggressive positioning in acute cervical injury or when neurological/vascular screening is not reassuring."
      ),
      item(
        "Scalene Group — MET",
        "Anterior/middle scalene region",
        "Reduce selected scalene guarding and improve comfortable cervical side-bending/respiratory movement.",
        "Supine with the head supported. Place the neck in a small amount of extension or neutral and side-bend away only to the first comfortable barrier.",
        "Support the occiput and stabilize the upper thorax/clavicular region without compressing the anterior neck.",
        "Ask for a very gentle side-bending effort toward the treated side or a controlled inspiratory effort, then relax and take up the new comfortable range.",
        "2–4 gentle cycles; use less force than for larger limb muscles.",
        "Cervical side-bending, first-rib/upper-chest comfort and symptom response with breathing.",
        "The anterior neck is not a place for heavy manual force. Precision and low effort matter more than strength.",
        "Do not compress the carotid region; stop with dizziness, visual symptoms, dysphagia or neurological change."
      )
    ],
    Lumbar: [
      item(
        "Quadratus Lumborum — MET",
        "Quadratus lumborum",
        "Improve painful side-bending restriction or lumbopelvic guarding when QL involvement is supported by examination.",
        "Side-lying with the treated side uppermost. The trunk and pelvis are positioned to gently lengthen the waist on the treated side without provoking pain.",
        "Stabilize the lower rib cage/trunk with one hand and control the iliac crest/pelvis with the other.",
        "Ask the patient to gently 'hike' the pelvis toward the ribs against resistance. After relaxation, increase the distance between the iliac crest and rib cage only to the new comfortable barrier.",
        "3–5 contractions of 5–10 seconds at low-to-moderate effort.",
        "Lumbar side-bending, standing trunk shift and the functional movement that originally reproduced symptoms.",
        "Pelvic hiking is the key contraction; do not turn it into a forceful lumbar side-bend.",
        "Avoid if the position worsens leg symptoms, produces neurological change or there is concern for fracture/systemic pathology."
      )
    ],
    Shoulder: [
      item(
        "Pectoralis Minor — MET",
        "Pectoralis minor / anterior shoulder girdle",
        "Improve selected anterior shoulder-girdle tightness and scapular posterior-tilt/retraction tolerance.",
        "Supine with the arm supported comfortably. The shoulder girdle is allowed to settle toward the table without forcing the anterior shoulder.",
        "One hand monitors/stabilizes the coracoid-anterior shoulder region broadly; the other supports the arm or scapular position.",
        "Ask the patient to gently protract the shoulder blade or press the shoulder forward against resistance. Relax, then allow a small increase in posterior tilt/retraction.",
        "3–5 cycles of 5–10 seconds at low effort.",
        "Scapular position, comfortable shoulder elevation and the patient's reaching task.",
        "Do not confuse a visually rounded shoulder with a mandatory treatment target—keep the technique only if function improves.",
        "Avoid aggressive anterior pressure in acute shoulder injury or after surgery unless cleared."
      ),
      item(
        "Latissimus Dorsi / Teres Major — MET",
        "Latissimus dorsi and teres major",
        "Improve selected shoulder flexion/elevation restriction when these tissues limit overhead motion.",
        "Supine. Flex the arm overhead to the first comfortable barrier while keeping the rib cage and lumbar spine from compensating.",
        "Stabilize the lower rib cage/trunk with one hand and control the distal humerus with the other.",
        "Ask the patient to gently pull the arm downward toward extension/adduction against resistance. Relax, then move slightly farther into flexion if the rib cage remains controlled.",
        "3–5 contractions of 5–10 seconds at low effort.",
        "Shoulder flexion, rib flare during elevation and functional overhead reach.",
        "If the ribs lift and lumbar spine extends, the apparent shoulder gain may be compensation rather than true shoulder motion.",
        "Respect postoperative restrictions and acute painful shoulder presentations."
      )
    ],
    "Hip & Pelvis": [
      item(
        "Iliopsoas — MET",
        "Iliopsoas / hip flexor complex",
        "Improve hip-extension tolerance when hip-flexor guarding or shortness is clinically relevant.",
        "Modified Thomas-style position or side-lying with the pelvis stabilized. Move the treated hip gently toward extension until the first comfortable barrier.",
        "Stabilize the pelvis to prevent anterior tilt; support the distal thigh.",
        "Ask the patient to gently flex the hip toward the ceiling against resistance. Relax, then allow a small increase in hip extension without lumbar extension.",
        "3–5 contractions of 5–10 seconds at about 10–20% effort.",
        "Hip extension, walking stride and Thomas-position response.",
        "The pelvis is the reference point. If it anteriorly tilts, the technique becomes a lumbar-extension movement.",
        "Avoid forcing hip extension in acute anterior hip pain or after surgery without clearance."
      ),
      item(
        "Hip Adductors — MET",
        "Adductor muscle group",
        "Improve painful/restricted hip abduction when adductor tone is clinically relevant.",
        "Supine with the opposite leg stable. Abduct the treated hip to the first comfortable barrier while keeping the pelvis level.",
        "Support the distal thigh/leg and stabilize the opposite pelvis.",
        "Ask the patient to gently pull the leg inward into adduction against resistance. Relax, then take up a small amount of additional abduction.",
        "3–5 contractions of 5–10 seconds at low effort.",
        "Hip abduction, adductor-related pain and side-step/squat tolerance.",
        "Keep the pelvis from rolling toward the treated side; otherwise the apparent gain is pelvic motion.",
        "Avoid aggressive abduction with acute groin injury or adductor tear."
      ),
      item(
        "Piriformis / Deep External Rotators — MET",
        "Posterior hip external rotators",
        "Improve selected hip internal-rotation/adduction tolerance when posterior hip guarding is relevant.",
        "Supine with the hip flexed comfortably. Move gently toward internal rotation/adduction until the first non-painful barrier.",
        "Stabilize the pelvis and control the knee/distal thigh.",
        "Ask the patient to gently push the knee outward toward external rotation/abduction against resistance. Relax, then take up the new comfortable range.",
        "3–5 low-effort contractions of 5–10 seconds.",
        "Hip internal rotation, seated figure-four tolerance and the patient's functional task.",
        "Posterior hip pain has many possible sources; do not label all of it 'piriformis syndrome.'",
        "Stop if the position reproduces strong distal neural symptoms."
      )
    ],
    Knee: [
      item(
        "Hamstrings — MET",
        "Hamstring muscle group",
        "Improve hamstring-related posterior-thigh restriction and straight-leg-raise tolerance when muscle length is clinically relevant.",
        "Supine. Flex the hip with the knee near extension until the first comfortable hamstring barrier; keep the pelvis neutral and the opposite leg supported.",
        "One hand supports the distal leg/heel. The other stabilizes the thigh or pelvis so the patient cannot posteriorly tilt the pelvis to escape the barrier.",
        "Ask the patient to gently push the heel downward into hip extension against the therapist's resistance. After 5–10 seconds, relax completely and move only to the new comfortable SLR barrier.",
        "3–5 contractions at roughly 10–20% effort. No bouncing and no painful end-range stretch.",
        "Straight-leg raise angle, active knee extension and a functional bend/reach task.",
        "A stronger contraction is not better. Low-load contraction plus a clean pelvic position usually gives a more useful response.",
        "Stop if symptoms feel neural rather than muscular or if pain radiates distally."
      ),
      item(
        "Quadriceps / Rectus Femoris — MET",
        "Quadriceps, especially rectus femoris",
        "Improve knee-flexion tolerance and anterior-thigh tightness when quadriceps/rectus femoris restriction is clinically relevant.",
        "Prone or side-lying. Flex the knee to the first comfortable anterior-thigh barrier while keeping the pelvis neutral; add only a small amount of hip extension if rectus femoris is the target.",
        "Stabilize the pelvis/hip with one hand and control the distal tibia/ankle with the other.",
        "Ask the patient to gently straighten the knee against resistance. Relax fully, then increase knee flexion only to the new comfortable barrier without lumbar extension or pelvic lift.",
        "3–5 contractions of 5–10 seconds at low effort.",
        "Knee flexion ROM, prone knee bend/Ely-type response and squat or stair comfort.",
        "Pelvic stabilization is essential. If the pelvis tips forward or the lumbar spine extends, the technique loses specificity.",
        "Avoid forceful knee flexion after acute knee injury or when postoperative flexion limits are present."
      ),
      item(
        "Gastrocnemius — MET",
        "Gastrocnemius",
        "Improve ankle dorsiflexion with the knee extended when gastrocnemius length is a limiting factor.",
        "Supine or long sitting with the knee straight. Move the ankle into dorsiflexion to the first comfortable calf barrier.",
        "Stabilize the tibia and hold the calcaneus/forefoot so the movement occurs at the ankle rather than through midfoot collapse.",
        "Ask the patient to gently plantarflex against resistance. Relax, then take up the new dorsiflexion range with the knee still extended.",
        "3–5 contractions of 5–10 seconds.",
        "Weight-bearing lunge with knee straight, ankle dorsiflexion and gait push-off/stride.",
        "Compare knee-straight and knee-bent dorsiflexion; that helps separate gastrocnemius from soleus limitation.",
        "Do not apply calf manual techniques when DVT is suspected."
      )
    ],
    "Ankle & Foot": [
      item(
        "Soleus — MET",
        "Soleus",
        "Improve dorsiflexion with the knee flexed when soleus restriction is clinically relevant.",
        "Supine, long sitting or half-kneeling with the knee flexed. Bring the ankle into dorsiflexion to the first comfortable barrier while controlling the foot.",
        "Stabilize the distal tibia and calcaneus/forefoot.",
        "Ask the patient to gently plantarflex against resistance. Relax, then move into the new dorsiflexion barrier while keeping the knee flexed.",
        "3–5 contractions of 5–10 seconds.",
        "Weight-bearing lunge with knee flexed, squat depth and ankle dorsiflexion.",
        "Knee flexion reduces gastrocnemius influence, making the test/treatment more soleus-focused.",
        "Avoid if there is acute calf injury, marked swelling or DVT concern."
      ),
      item(
        "Peroneal / Fibularis Group — MET",
        "Fibularis longus/brevis",
        "Improve selected inversion/adduction restriction or lateral-leg guarding when the fibularis group is clinically relevant.",
        "Long sitting with the foot supported. Move gently toward inversion/adduction only to the first comfortable barrier.",
        "Stabilize the distal leg and control the lateral forefoot.",
        "Ask the patient to gently evert the foot against resistance. Relax, then take up the new comfortable inversion range.",
        "3–5 contractions of 5–10 seconds at low effort.",
        "Inversion/eversion ROM, lateral-ankle comfort and single-leg stance.",
        "This is not a treatment for an acute unstable lateral ankle sprain; stability and healing stage come first.",
        "Avoid aggressive inversion when lateral-ligament injury is acute or unstable."
      )
    ]
  },

  "strain-counterstrain": {
    Cervical: [
      item(
        "Upper Trapezius Tender Point — Positional Release",
        "Upper trapezius tender point",
        "Reduce tenderness and protective guarding before active neck/shoulder movement.",
        "Supine or supported sitting. Elevate the shoulder slightly and fine-tune cervical side-bending/rotation toward the position that reduces tenderness by roughly 70% or more.",
        "Maintain a light monitoring contact over the tender point; do not press harder during the hold.",
        "Hold the position of maximal comfort without stretching. Make very small adjustments if tenderness begins to return.",
        "Usually about 60–90 seconds, then return slowly to neutral.",
        "Tenderness, cervical side-bending/rotation and shoulder-elevation comfort.",
        "The treatment is guided by the drop in tenderness, not by forcing a memorized angle.",
        "Return to neutral slowly; sudden repositioning can reproduce guarding."
      ),
      item(
        "Levator Scapulae Tender Point — Positional Release",
        "Levator scapulae / superior-medial scapular region",
        "Reduce focal tenderness and guarding associated with painful neck rotation or scapular elevation.",
        "Supported sitting or supine. Elevate the shoulder and position the neck through small flexion/rotation/side-bending changes until the tender point becomes markedly more comfortable.",
        "Lightly monitor the superior-medial scapular/levator tender point while supporting the head and shoulder.",
        "Maintain the position of ease; do not add a stretch during the hold.",
        "60–90 seconds followed by a slow return to neutral.",
        "Local tenderness, neck rotation and functional shoulder movement.",
        "If tenderness does not clearly reduce in the setup, abandon that position instead of holding it by habit.",
        "Avoid uncomfortable end-range cervical positioning."
      )
    ],
    Shoulder: [
      item(
        "Pectoralis Minor Tender Point — Positional Release",
        "Pectoralis minor / coracoid-adjacent tender region",
        "Reduce anterior shoulder-girdle guarding and improve comfortable scapular movement.",
        "Supine. Support the arm and bring the shoulder girdle gently into the position that shortens/unloads pectoralis minor—typically slight protraction/anterior positioning—until tenderness falls substantially.",
        "Use a broad, gentle monitoring contact near the tender region; avoid sharp pressure directly on the coracoid or neurovascular structures.",
        "Maintain the position of ease without forcing the shoulder into stretch.",
        "60–90 seconds, then return the shoulder slowly toward neutral.",
        "Tenderness, scapular retraction/posterior tilt and shoulder elevation.",
        "The point is comfort and unloading, not digging into the anterior chest.",
        "Avoid heavy pressure in the axillary/anterior neurovascular region."
      ),
      item(
        "Posterior Cuff Tender Point — Positional Release",
        "Infraspinatus/teres minor tender region",
        "Reduce posterior shoulder tenderness and guarding before active rotation/loading.",
        "Side-lying or supine with the arm fully supported. Fine-tune shoulder abduction/rotation until the posterior cuff tender point becomes markedly less tender.",
        "Light monitoring contact over the posterior cuff; the arm is supported so the muscle can relax.",
        "Hold the comfortable shortened/unloaded position with no stretch force.",
        "60–90 seconds, then slowly return to neutral.",
        "Posterior cuff tenderness, external/internal rotation and reaching.",
        "If the position reproduces familiar referred pain strongly rather than reducing tenderness, reassess the diagnosis and technique choice.",
        "Respect acute rotator-cuff injury and postoperative restrictions."
      )
    ],
    Lumbar: [
      item(
        "Quadratus Lumborum Tender Point — Positional Release",
        "Quadratus lumborum tender region",
        "Reduce local lumbopelvic tenderness/guarding to create a window for active movement.",
        "Side-lying or prone with the trunk/pelvis supported. Move the pelvis and lower trunk through small side-bending/hip-position changes until the tender point is at least substantially more comfortable.",
        "Lightly monitor the QL tender point while supporting the pelvis and lower rib cage.",
        "Maintain the position of ease; do not stretch the waist during the hold.",
        "60–90 seconds, individualized to comfort.",
        "QL tenderness, lumbar side-bending and the patient's functional bend or sit-to-stand.",
        "A good setup should feel easier within seconds. If not, search for a different position of ease rather than increasing pressure.",
        "Stop if leg symptoms peripheralize or neurological symptoms appear."
      )
    ],
    "Hip & Pelvis": [
      item(
        "Piriformis / Deep Gluteal Tender Point — Positional Release",
        "Posterior hip deep rotator tender region",
        "Reduce focal posterior-hip tenderness and guarding before mobility or strengthening.",
        "Supine or side-lying with the hip supported. Adjust hip flexion, abduction/adduction and rotation until the tender point becomes markedly less sensitive.",
        "Use a comfortable monitoring contact over the posterior hip; avoid excessive deep pressure.",
        "Hold the position of ease without stretching the deep rotators.",
        "60–90 seconds, then return slowly to neutral.",
        "Tenderness, hip rotation and sitting/walking tolerance.",
        "Do not assume every posterior-hip tender point represents piriformis syndrome; use the response only as one clinical clue.",
        "Stop if strong distal neural symptoms are reproduced."
      ),
      item(
        "Adductor Tender Point — Positional Release",
        "Adductor muscle tender region",
        "Reduce adductor guarding and improve comfortable hip abduction.",
        "Supine with the leg supported. Move the hip slightly toward adduction and flexion/rotation as needed until the point is clearly more comfortable.",
        "Light monitoring contact over the symptomatic adductor area while the limb is fully supported.",
        "Maintain the shortened/unloaded position; no stretching during the hold.",
        "60–90 seconds.",
        "Adductor tenderness, hip abduction and side-step/squat tolerance.",
        "The leg should feel supported enough that the patient can stop guarding.",
        "Avoid acute adductor tear or hematoma."
      )
    ],
    Knee: [
      item(
        "Hamstring Tender Point — Positional Release",
        "Distal or mid-hamstring tender region",
        "Reduce focal posterior-thigh/knee tenderness and guarding before active loading.",
        "Supine or prone. Flex the knee and adjust hip position until the tender point becomes substantially less sensitive.",
        "Light monitoring contact over the symptomatic hamstring area; support the limb fully.",
        "Maintain the shortened position with no stretch force.",
        "60–90 seconds, then slowly lengthen the limb back to neutral.",
        "Tenderness, knee extension tolerance and active knee flexion.",
        "This is a comfort-based technique; it should not feel like a hamstring stretch.",
        "Avoid acute muscle tear or significant bruising."
      ),
      item(
        "Popliteus Region — Positional Release",
        "Posterolateral knee/popliteus region",
        "Reduce selected posterolateral knee guarding after serious pathology has been excluded.",
        "Supine with the knee comfortably flexed. Fine-tune small tibial rotation and knee-flexion position until the tender region becomes easier.",
        "Use a gentle posterolateral monitoring contact and avoid deep pressure into the popliteal fossa.",
        "Hold the position of ease without compressing posterior neurovascular structures.",
        "About 60 seconds with close symptom monitoring.",
        "Posterolateral tenderness, knee extension/flexion and gait.",
        "The popliteal fossa contains vulnerable structures—contact should stay broad and superficial.",
        "Do not use with suspected DVT, acute vascular symptoms or unexplained calf swelling."
      )
    ],
    "Ankle & Foot": [
      item(
        "Gastrocnemius / Soleus Tender Point — Positional Release",
        "Calf muscle tender region",
        "Reduce local calf guarding and improve comfortable ankle motion when a muscular tender point is present.",
        "Prone or supine with the knee and ankle supported. Shorten the involved muscle by adjusting knee flexion and ankle plantarflexion until tenderness reduces clearly.",
        "Light monitoring contact over the muscle belly—never deep pressure into a swollen or vascularly suspicious calf.",
        "Maintain the comfortable shortened position without stretching.",
        "60–90 seconds.",
        "Tenderness, ankle dorsiflexion and walking/calf-raise comfort.",
        "Use knee position to bias gastrocnemius versus soleus, but let tenderness reduction guide the final setup.",
        "Do not treat a calf manually when DVT is suspected."
      )
    ]
  },

  "myofascial-release": {
    Cervical: [
      item(
        "Suboccipital Myofascial Release",
        "Suboccipital fascia and short upper-cervical extensors",
        "Reduce upper-cervical soft-tissue guarding and improve comfortable head/neck movement.",
        "Supine with the head fully supported in neutral.",
        "Finger pads or knuckles rest gently beneath the occiput without pressing the anterior neck.",
        "Use a slow sustained traction/lift and allow the tissues to soften; direct work can gently engage the felt restriction while indirect work follows the direction of ease.",
        "60–120 seconds of sustained low-load contact, repeated only if the comparable sign improves.",
        "Upper-cervical rotation, headache-related comparable sign and comfort with chin nod.",
        "Avoid chasing a dramatic 'release' sensation; a useful change in movement or symptoms is the real outcome.",
        "Stop if dizziness, unusual headache, visual symptoms or neurological change occurs."
      ),
      item(
        "Upper Trapezius Fascial Release",
        "Upper trapezius / cervicoscapular fascia",
        "Improve comfortable side-bending and shoulder-girdle movement when fascial tenderness/restriction is clinically relevant.",
        "Supine or sitting with the shoulder supported and neck relaxed.",
        "Broad hand contact over the upper trapezius between shoulder and neck.",
        "Engage the tissue slowly in the direction of greatest restriction for direct MFR, or follow the easiest direction for indirect MFR.",
        "60–120 seconds, then reassess before repeating.",
        "Cervical side-bending, shoulder elevation and local pain.",
        "Use broad contact—pinching the upper trapezius is not the same as myofascial release.",
        "Avoid direct pressure over the anterior/lateral neurovascular neck."
      )
    ],
    Shoulder: [
      item(
        "Pectoral Fascial Release",
        "Pectoralis major/minor and anterior shoulder fascia",
        "Improve selected anterior chest/shoulder soft-tissue mobility before active scapular and shoulder work.",
        "Supine with the arm supported in a comfortable amount of abduction.",
        "Broad contact over the pectoral fascia, staying away from breast tissue, axillary neurovascular structures and sensitive surgical regions.",
        "Sustain a gentle diagonal or lateral tissue load toward the restriction; do not force end-range shoulder stretch.",
        "60–120 seconds per contact with immediate reassessment.",
        "Shoulder elevation, scapular posterior tilt/retraction and reach.",
        "The goal is not to 'break adhesions'; use the technique to change movement tolerance and then reinforce with active exercise.",
        "Respect postoperative and oncological precautions."
      ),
      item(
        "Posterior Shoulder / Latissimus Fascial Release",
        "Posterior cuff, latissimus and posterior axillary fascia",
        "Improve selected overhead/elevation tolerance where posterior/lateral soft-tissue restriction is relevant.",
        "Side-lying or supine with the arm supported in a comfortable elevated position.",
        "Broad contact over the posterior-lateral shoulder and latissimus region.",
        "Apply slow sustained tissue loading along the restricted fascial direction while keeping the rib cage controlled.",
        "60–120 seconds, 1–3 contacts.",
        "Shoulder flexion, internal rotation and overhead reach.",
        "Control rib flare so a change in trunk position is not mistaken for a shoulder mobility gain.",
        "Avoid aggressive pressure in acute rotator-cuff injury."
      )
    ],
    Lumbar: [
      item(
        "Thoracolumbar Fascial Release",
        "Thoracolumbar fascia and lumbar paraspinal interface",
        "Reduce painful guarding and improve tolerance to lumbar flexion/rotation when soft-tissue restriction is clinically relevant.",
        "Prone or side-lying with the abdomen/pelvis supported for comfort.",
        "Broad crossed-hand or parallel-hand contact over the lumbar/thoracolumbar fascia.",
        "Take up skin/fascial slack slowly and sustain the load in the most restricted direction; avoid heavy downward compression.",
        "60–120 seconds per direction, then reassess.",
        "Lumbar flexion/rotation and the patient's bending or sit-to-stand task.",
        "The technique should feel like a slow tissue load, not a deep massage.",
        "Do not use routine manual treatment when serious spinal pathology is suspected."
      )
    ],
    "Hip & Pelvis": [
      item(
        "Gluteal Fascial Release",
        "Gluteal fascia and lateral/posterior hip soft tissue",
        "Improve selected hip movement tolerance and reduce local myofascial sensitivity.",
        "Side-lying or prone with the hip supported and pelvis neutral.",
        "Broad hand/forearm contact over the gluteal region, avoiding direct pressure on the greater trochanter.",
        "Use slow sustained multidirectional fascial loading matched to the restriction and symptom response.",
        "60–120 seconds, 1–3 contacts.",
        "Hip rotation, flexion and walking/squat tolerance.",
        "Treat the region, then immediately use active hip movement so any short-term gain becomes functional.",
        "Avoid aggressive pressure over acute bursitis, bruising or postoperative tissue."
      )
    ],
    Knee: [
      item(
        "Quadriceps / Anterior Thigh Fascial Release",
        "Quadriceps fascia",
        "Improve knee-flexion tolerance and anterior-thigh comfort when soft-tissue restriction is relevant.",
        "Supine with the knee supported in slight flexion or prone if comfortable.",
        "Broad hand/forearm contact along the quadriceps muscle bellies; avoid direct pressure on the patella.",
        "Apply slow longitudinal or diagonal fascial loading while the knee remains relaxed.",
        "60–120 seconds per region, then reassess.",
        "Knee flexion, squat and stair tolerance.",
        "If knee flexion improves, follow immediately with active knee flexion/strengthening rather than repeatedly treating the tissue.",
        "Avoid acute muscle tear or significant swelling."
      )
    ],
    "Ankle & Foot": [
      item(
        "Calf Myofascial Release",
        "Gastrocnemius–soleus fascia",
        "Improve comfortable dorsiflexion and calf movement tolerance when myofascial restriction is clinically relevant.",
        "Prone or supine with the ankle free and the calf fully supported.",
        "Broad contact over gastrocnemius/soleus muscle bellies, avoiding deep pressure in the popliteal fossa.",
        "Sustain a gentle longitudinal or oblique fascial load; ankle movement may be added slowly if it remains comfortable.",
        "60–120 seconds per contact, then reassess.",
        "Weight-bearing dorsiflexion, gait and calf raise.",
        "A calf technique should never substitute for screening unexplained swelling or vascular symptoms.",
        "Do not apply when DVT is suspected."
      ),
      item(
        "Plantar Fascial / Intrinsic Foot Release",
        "Plantar fascia and intrinsic foot soft tissue",
        "Improve local plantar soft-tissue comfort and foot-loading tolerance.",
        "Supine or sitting with the foot supported.",
        "Thumb or broad knuckle contact along the plantar soft tissue, avoiding excessive focal pressure at the heel.",
        "Use slow longitudinal or transverse tissue loading; combine with gentle toe extension only if comfortable.",
        "30–90 seconds per area, followed by active foot loading.",
        "First-step pain, toe extension and walking tolerance.",
        "Follow manual work with calf/foot strengthening and graded loading rather than relying on tissue pressure alone.",
        "Avoid open skin, acute bruising or severe sensory loss."
      )
    ]
  },

  "trigger-point-compression": {
    Cervical: [
      item(
        "Upper Trapezius Trigger-Point Pressure Release",
        "Upper trapezius",
        "Reduce familiar local/referred pain and guarding when a clinically relevant trigger point is reproduced.",
        "Supported sitting or supine with the shoulder relaxed.",
        "Use a broad thumb/finger pad or pincer-style contact over the taut/tender area without compressing the lateral neck.",
        "Increase pressure gradually until the patient's familiar discomfort is reproduced at a tolerable level; maintain without chasing severe pain.",
        "20–60 seconds, then release gradually. Reassess before repeating.",
        "Local tenderness, cervical side-bending and the patient's familiar referred-pain pattern.",
        "Familiar symptom reproduction is more meaningful than finding a random tender spot.",
        "Avoid anterior neck pressure and stop with neurological or vascular-type symptoms."
      ),
      item(
        "Levator Scapulae Trigger-Point Pressure Release",
        "Levator scapulae",
        "Reduce medial-scapular/neck referral and improve comfortable rotation.",
        "Supported sitting or side-lying with the arm and head relaxed.",
        "Broad sustained contact near the superior-medial scapular/levator muscle belly.",
        "Gradually increase to tolerable pressure and hold while monitoring the familiar symptom response.",
        "20–60 seconds per clinically relevant point.",
        "Neck rotation, scapular tenderness and reaching.",
        "Do not dig on the superior angle of the scapula; contact the muscle, not the bone.",
        "Respect acute cervical injury."
      )
    ],
    Shoulder: [
      item(
        "Infraspinatus Trigger-Point Pressure Release",
        "Infraspinatus",
        "Reduce posterior-shoulder tenderness/referred pain and improve rotation tolerance.",
        "Side-lying or prone with the arm supported.",
        "Thumb/knuckle contact over the infraspinous fossa, avoiding the scapular border and excessive bony pressure.",
        "Sustain tolerable pressure on a point that reproduces the patient's familiar symptoms.",
        "20–60 seconds, 1–3 points maximum before reassessment.",
        "Shoulder rotation, posterior-shoulder pain and reach.",
        "Infraspinatus trigger points may refer toward the anterior shoulder/arm; confirm the pain feels familiar rather than simply intense.",
        "Avoid heavy pressure after acute rotator-cuff injury."
      ),
      item(
        "Pectoralis Minor Trigger-Point Pressure Release",
        "Pectoralis minor",
        "Reduce selected anterior shoulder/chest-wall myofascial tenderness before active scapular work.",
        "Supine with the arm supported and shoulder girdle relaxed.",
        "Use a broad finger-pad contact near the pectoralis minor muscle belly, staying away from the axillary neurovascular bundle.",
        "Apply gentle sustained pressure only if it reproduces familiar muscular symptoms and remains comfortable.",
        "20–45 seconds, then reassess.",
        "Scapular movement, shoulder elevation and local tenderness.",
        "This region requires lighter pressure than posterior shoulder muscles because important neurovascular structures are nearby.",
        "Do not use deep pressure if vascular/neurological symptoms are present."
      )
    ],
    Lumbar: [
      item(
        "Quadratus Lumborum Trigger-Point Pressure Release",
        "Quadratus lumborum",
        "Reduce familiar flank/low-back referred pain and improve side-bending tolerance.",
        "Side-lying with the waist exposed and supported.",
        "Broad thumb/knuckle contact over the QL muscle belly between iliac crest and lower rib, avoiding direct rib pressure.",
        "Build pressure slowly to a tolerable level that reproduces the familiar muscular pain.",
        "20–60 seconds per relevant point.",
        "Lumbar side-bending, standing tolerance and local tenderness.",
        "Use broad contact and stabilize the patient; deep uncontrolled pressure can be uncomfortable and nonspecific.",
        "Avoid if visceral/systemic pathology is suspected."
      )
    ],
    "Hip & Pelvis": [
      item(
        "Gluteus Medius Trigger-Point Pressure Release",
        "Gluteus medius",
        "Reduce lateral/posterolateral hip myofascial pain and improve single-leg loading tolerance.",
        "Side-lying with the treated side uppermost and hip supported.",
        "Broad thumb/knuckle or ball-assisted clinical contact over the gluteus medius muscle belly, not directly on the greater trochanter.",
        "Apply tolerable sustained pressure to a point that reproduces familiar symptoms.",
        "20–60 seconds, then reassess.",
        "Single-leg stance, hip abduction and walking.",
        "Differentiate muscle tenderness from greater-trochanteric tendon/bursal sensitivity before treating.",
        "Avoid aggressive pressure directly over the greater trochanter."
      ),
      item(
        "Piriformis / Deep Gluteal Trigger-Point Release",
        "Posterior hip deep rotator region",
        "Reduce selected posterior-hip myofascial tenderness and improve sitting/rotation tolerance.",
        "Side-lying or prone with the hip relaxed.",
        "Broad supported contact over the deep gluteal muscle region; avoid uncontrolled deep compression.",
        "Gradually apply pressure only if symptoms remain local/familiar and do not become strongly neural.",
        "20–45 seconds, then reassess.",
        "Hip rotation, sitting tolerance and local tenderness.",
        "If pressure reproduces sharp distal paresthesia, treat it as a neural warning—not a 'good trigger point.'",
        "Stop with strong distal neurological symptoms."
      )
    ],
    Knee: [
      item(
        "Vastus Lateralis Trigger-Point Pressure Release",
        "Vastus lateralis",
        "Reduce lateral/anterior thigh myofascial tenderness and improve knee-flexion/load tolerance.",
        "Supine or side-lying with the knee supported.",
        "Broad thumb/knuckle contact over the vastus lateralis muscle belly, avoiding the lateral femoral condyle.",
        "Sustain tolerable pressure on a familiar symptomatic point.",
        "20–60 seconds.",
        "Knee flexion, squat and stair tolerance.",
        "Treat muscle belly sensitivity, not the IT band as if it were a muscle.",
        "Avoid acute contusion or muscle tear."
      )
    ],
    "Ankle & Foot": [
      item(
        "Gastrocnemius Trigger-Point Pressure Release",
        "Gastrocnemius",
        "Reduce focal calf myofascial tenderness and improve dorsiflexion/loading tolerance.",
        "Prone or supine with the calf relaxed and supported.",
        "Broad thumb/knuckle contact over the gastrocnemius muscle belly, away from the popliteal fossa.",
        "Apply tolerable sustained pressure to a familiar muscular point.",
        "20–60 seconds, then reassess.",
        "Calf tenderness, dorsiflexion and calf raise.",
        "Calf pain requires vascular screening when the history or swelling pattern is suspicious.",
        "Do not perform manual calf pressure when DVT is suspected."
      ),
      item(
        "Soleus Trigger-Point Pressure Release",
        "Soleus",
        "Reduce deep calf muscular tenderness and improve knee-bent dorsiflexion tolerance.",
        "Prone or side-lying with the knee slightly flexed to relax gastrocnemius.",
        "Broad contact along the medial/lateral soleus region, avoiding deep posterior neurovascular compression.",
        "Sustain tolerable pressure while the ankle remains relaxed.",
        "20–60 seconds.",
        "Knee-bent dorsiflexion, squat and walking.",
        "Flexing the knee can help bias soleus by reducing gastrocnemius tension.",
        "Do not use with suspected DVT or unexplained calf swelling."
      )
    ]
  },

  "cyriax-deep-transverse-friction": {
    Shoulder: [
      item(
        "Supraspinatus Tendon — Deep Transverse Friction",
        "Supraspinatus tendon region",
        "Use as a short-term adjunct in a selected, localized chronic tendon presentation after the symptomatic structure has been clinically identified.",
        "Sitting or supine with the arm positioned so the tendon can be palpated accurately and the shoulder remains relaxed.",
        "Use a fingertip or reinforced-finger contact directly across the confirmed symptomatic tendon region; stabilize the skin so the movement occurs across the tissue rather than rubbing the surface.",
        "Move strictly transverse to the tendon fibers with a small controlled excursion.",
        "Short tolerable bouts only; stop before significant irritation. Follow with graded rotator-cuff loading.",
        "Pain with resisted abduction/elevation, local tenderness and functional reaching.",
        "Friction is an adjunct—not the primary treatment for chronic tendinopathy. Progressive loading remains central.",
        "Avoid in acute tear, hot inflammatory presentation, significant bruising or unhealed surgery."
      ),
      item(
        "Long-Head Biceps Tendon — Deep Transverse Friction",
        "Long-head biceps tendon in the bicipital groove",
        "Selected adjunct for localized anterior-shoulder tendon symptoms when the tendon is clearly implicated.",
        "Supine or sitting with the arm relaxed and the tendon palpated in the groove.",
        "Use a small precise contact over the tendon while avoiding excessive pressure into the anterior shoulder.",
        "Apply short transverse strokes across the tendon, not longitudinal massage along it.",
        "Brief tolerable bouts followed by active shoulder/biceps loading as appropriate.",
        "Resisted elbow flexion/supination, anterior-shoulder tenderness and reach.",
        "If the pain is diffuse or deep intra-articular rather than clearly tendon-localized, do not force a tendon diagnosis.",
        "Avoid acute tendon tear or unstable shoulder injury."
      )
    ],
    Elbow: [
      item(
        "Common Extensor Tendon — Deep Transverse Friction",
        "Common wrist-extensor tendon",
        "Adjunct for selected chronic lateral-elbow tendon pain when the common extensor origin is the familiar symptomatic structure.",
        "Sitting with the forearm supported and elbow flexed comfortably.",
        "Stabilize the skin over the lateral epicondylar tendon region and place a fingertip/reinforced finger across the tendon fibers.",
        "Use a small transverse movement across the tendon; avoid sliding over the skin or pressing directly on bone.",
        "Short tolerable bouts only, then progress to wrist-extensor loading.",
        "Pain-free grip, resisted wrist extension and local tendon tenderness.",
        "The key outcome is improved loading tolerance, not how sore the tendon becomes during friction.",
        "Avoid acute tear or highly irritable inflammatory presentation."
      ),
      item(
        "Common Flexor Tendon — Deep Transverse Friction",
        "Common wrist-flexor tendon",
        "Adjunct for selected chronic medial-elbow tendon pain.",
        "Sitting with forearm supported and the medial elbow relaxed.",
        "Precise transverse contact over the flexor-pronator tendon region while protecting the ulnar nerve posterior to the medial epicondyle.",
        "Small transverse movement across the tendon fibers.",
        "Short symptom-guided bouts followed by graded flexor/pronator loading.",
        "Resisted wrist flexion/pronation, grip and local tenderness.",
        "Know where the ulnar nerve is before applying pressure around the medial elbow.",
        "Stop with tingling/electric symptoms."
      )
    ],
    "Hip & Pelvis": [
      item(
        "Gluteal Tendon — Deep Transverse Friction",
        "Gluteus medius/minimus tendon region",
        "Selected adjunct for localized lateral-hip tendon symptoms after careful differentiation from bursal and referred pain.",
        "Side-lying with the treated hip uppermost and supported so compression is minimized.",
        "Use a precise contact over the clinically identified tendon region near the greater trochanter while avoiding direct aggressive pressure on the bony prominence.",
        "Apply small transverse movement across the tendon fibers.",
        "Short tolerable bouts only; follow with progressive hip-abductor loading.",
        "Single-leg stance, step-down and lateral-hip pain response.",
        "Compression sensitivity is common in gluteal tendinopathy, so more pressure is not better.",
        "Avoid highly irritable lateral-hip pain where compression itself is strongly provocative."
      ),
      item(
        "Proximal Hamstring Tendon — Deep Transverse Friction",
        "Proximal hamstring tendon",
        "Selected adjunct for localized proximal-hamstring tendon pain when symptoms are clearly tendon-related.",
        "Prone or side-lying with the hip positioned comfortably and the tendon region accessible.",
        "Precise transverse contact over the tendon region near the ischial tuberosity while respecting patient comfort and privacy.",
        "Small transverse strokes across the tendon fibers.",
        "Brief tolerable bouts followed by progressive hamstring loading.",
        "Pain with sitting, resisted knee flexion/hip extension and functional loading.",
        "Avoid prolonged compressive treatment at the proximal hamstring in a compression-sensitive tendinopathy.",
        "Do not use if symptoms suggest acute avulsion or significant tear."
      )
    ],
    Knee: [
      item(
        "Patellar Tendon — Deep Transverse Friction",
        "Patellar tendon",
        "Use only as a short-term adjunct for a localized, chronic patellar-tendon presentation; it is not the main treatment for patellar tendinopathy.",
        "Supine or long sitting with the knee supported in slight flexion so the quadriceps can relax and the tendon is easy to palpate.",
        "Identify the familiar symptomatic portion of the tendon—often near the inferior patellar pole. Use a fingertip or reinforced-finger contact across the tendon while stabilizing the overlying skin.",
        "Move strictly side-to-side across the tendon fibers with a small excursion. Do not rub longitudinally up and down the tendon.",
        "Use a short, tolerable trial rather than prolonged painful friction. Reassess, then prioritize progressive tendon loading such as isometric/slow resistance according to irritability.",
        "Pain during decline squat or other tendon-loading task, local tendon tenderness and loading tolerance.",
        "The treatment target is a clinically identified tendon, not simply 'pain below the kneecap.' Loading progression matters far more than aggressive friction.",
        "Avoid acute tendon tear, marked swelling/heat, recent surgery or a highly irritable reactive presentation."
      ),
      item(
        "Quadriceps Tendon — Deep Transverse Friction",
        "Quadriceps tendon",
        "Selected adjunct for localized chronic quadriceps-tendon symptoms above the patella.",
        "Supine with the knee supported in slight flexion and quadriceps relaxed.",
        "Use precise transverse contact over the symptomatic tendon just superior to the patella while avoiding direct patellar pressure.",
        "Small side-to-side movement across the tendon fibers.",
        "Short tolerable bouts followed by graded quadriceps loading.",
        "Pain with squat/step, resisted knee extension and local tendon tenderness.",
        "Differentiate quadriceps tendon pain from patellofemoral pain before treating the tendon.",
        "Avoid acute tear or reactive inflammatory flare."
      )
    ],
    "Ankle & Foot": [
      item(
        "Achilles Tendon — Deep Transverse Friction",
        "Achilles tendon",
        "Selected adjunct for localized chronic Achilles tendon symptoms; progressive loading remains the primary rehabilitation strategy.",
        "Prone with the foot over the end of the table and ankle relaxed.",
        "Stabilize the tendon gently between finger/thumb or use a reinforced fingertip contact at the symptomatic portion.",
        "Apply a small transverse movement across tendon fibers rather than rubbing longitudinally.",
        "Brief tolerable bouts followed by calf-loading progression.",
        "Pain with calf raise/hop, tendon tenderness and walking/running tolerance.",
        "Do not use aggressive friction in a reactive, thickened, highly irritable tendon simply because it is tender.",
        "Avoid suspected partial/full tear or acute inflammatory presentation."
      )
    ]
  },

  "neurodynamic-mobilization": {
    "Upper Limb Neural": [
      item(
        "Median Nerve Slider",
        "Median nerve pathway / ULNT1 bias",
        "Improve neural movement tolerance while minimizing sustained neural strain.",
        "Supine with the scapula controlled and the arm supported in a median-biased neurodynamic position below the symptom threshold.",
        "Support the shoulder, elbow, wrist and hand; no direct pressure is applied to the nerve.",
        "For a slider, increase load distally with wrist/finger extension while simultaneously unloading proximally with ipsilateral cervical side-bending; then reverse the pair. The movement should be smooth and symptom-limited.",
        "5–10 slow repetitions for 1–3 sets. Start with sliders before tensioners in irritable presentations.",
        "Median-biased ULNT response, symptom distribution, grip/reach and the patient's familiar task.",
        "A slider should move symptoms gently, not provoke a lingering flare.",
        "Stop with progressive weakness, persistent numbness, rapidly increasing symptoms or other neurological red flags."
      ),
      item(
        "Radial Nerve Slider",
        "Radial nerve pathway",
        "Improve tolerance to radial-biased upper-limb movement without sustained tension.",
        "Supine with the shoulder girdle supported; position the arm below the symptom threshold using the radial-bias components.",
        "Support the elbow/wrist and control the scapula; avoid focal pressure over the radial nerve.",
        "Alternate distal loading (wrist/finger flexion and forearm position consistent with radial bias) with proximal unloading using cervical movement, then reverse.",
        "5–10 slow repetitions for 1–3 sets.",
        "Radial-biased neurodynamic response, lateral arm/forearm symptoms and functional reach.",
        "Use the minimum combination of components needed to reproduce the relevant response; more tension is not automatically better.",
        "Avoid aggressive tensioning in acute nerve injury."
      ),
      item(
        "Ulnar Nerve Slider",
        "Ulnar nerve pathway",
        "Improve ulnar-biased neural movement tolerance.",
        "Supine with the arm supported and elbow/shoulder positioned below the symptom threshold.",
        "Support the hand, elbow and scapula; do not compress the cubital tunnel.",
        "Alternate distal/proximal loading so one end is loaded while the other unloads—for example, elbow/wrist positioning with cervical side-bending in opposite phases.",
        "5–10 slow repetitions for 1–3 sets.",
        "Ulnar-biased neurodynamic response, hand symptoms and grip/function.",
        "If the elbow itself is irritable, reduce elbow flexion and work from a less provocative starting position.",
        "Stop if hand numbness/weakness increases or symptoms persist after the set."
      )
    ],
    "Lower Limb Neural": [
      item(
        "Sciatic Nerve Slider — Slump-Based",
        "Sciatic nerve pathway",
        "Improve posterior-chain neural movement tolerance without prolonged end-range tension.",
        "Seated slump position modified so symptoms are mild or absent at baseline.",
        "Therapist supports the leg/foot as needed; there is no direct nerve pressure.",
        "Pair knee extension with cervical extension to unload proximally, then knee flexion with cervical flexion to reverse the slider. Keep ankle position neutral initially and add it only if needed.",
        "5–10 smooth repetitions for 1–3 sets.",
        "Slump/SLR response, leg symptom distribution and sitting/walking tolerance.",
        "The hallmark of a slider is opposite-end movement—one end loads while the other unloads.",
        "Stop with progressive neurological loss, severe irritability or red-flag spinal symptoms."
      ),
      item(
        "Tibial Nerve Slider",
        "Tibial nerve pathway",
        "Improve neural movement tolerance into the posterior calf/plantar foot distribution.",
        "Supine with the hip/knee positioned below the neural symptom threshold.",
        "Support the limb; ankle/foot motion is controlled without direct pressure behind the medial malleolus.",
        "Use dorsiflexion/eversion as the distal loading component while unloading proximally with knee flexion or reduced hip flexion; then reverse.",
        "5–10 slow repetitions for 1–3 sets.",
        "Tibial-biased symptoms, ankle/foot neural response and walking tolerance.",
        "Keep the movement below a lingering symptom threshold; the goal is excursion, not stretch intensity.",
        "Avoid aggressive loading with acute nerve injury or progressive sensory/motor loss."
      ),
      item(
        "Common Fibular Nerve Slider",
        "Common fibular nerve pathway",
        "Improve lateral-leg/dorsal-foot neural movement tolerance.",
        "Supine or side-lying with the knee supported and the limb below the symptom threshold.",
        "Avoid direct compression around the fibular head; control the ankle/foot gently.",
        "Use plantarflexion/inversion as the distal bias while unloading proximally with knee flexion or reduced hip flexion; then reverse the sequence.",
        "5–10 slow repetitions for 1–3 sets.",
        "Fibular-biased symptoms, ankle/foot sensation and functional walking.",
        "Because the common fibular nerve is superficial at the fibular head, avoid local pressure there.",
        "Stop with worsening foot-drop-type weakness or persistent sensory change."
      ),
      item(
        "Femoral Nerve Slider",
        "Femoral nerve pathway",
        "Improve anterior-thigh neural movement tolerance.",
        "Side-lying or prone with the hip and knee positioned below the symptom threshold.",
        "Support the pelvis and distal leg; avoid forcing lumbar extension.",
        "Increase distal load with knee flexion while simultaneously reducing proximal load by decreasing hip extension; then reverse the pair.",
        "5–10 smooth repetitions for 1–3 sets.",
        "Femoral-biased neurodynamic response, anterior-thigh symptoms and walking/stair tolerance.",
        "Differentiate neural symptoms from simple quadriceps stretch by changing spinal/hip components and observing the response.",
        "Avoid aggressive tensioning with acute femoral neuropathy or progressive weakness."
      )
    ]
  },

  "maitland-joint-mobilization": {
    Shoulder: [
      item(
        "Glenohumeral Posterior Glide",
        "Humeral head on glenoid",
        "Improve a painful/restricted flexion or internal-rotation comparable sign when a posterior glide produces a useful response.",
        "Supine with the scapula supported and the shoulder near a comfortable resting position; progress arm position only as irritability allows.",
        "Stabilize the scapula/acromial region. Use a broad contact over the anterior proximal humerus close to the joint line.",
        "Apply a posterior translation of the humeral head. Use Grade I–II for pain-dominant presentations and Grade III–IV only when stiffness dominates and irritability is low.",
        "30–60 seconds of oscillation for 2–4 bouts, with immediate re-test after each bout.",
        "Shoulder flexion, internal rotation, painful arc and functional reach.",
        "If the scapula moves with the humerus, you are no longer isolating a glenohumeral glide.",
        "Avoid in acute dislocation, fracture or unstable postoperative states."
      ),
      item(
        "Glenohumeral Inferior Glide",
        "Humeral head on glenoid",
        "Improve elevation/abduction when inferior joint play is clinically relevant.",
        "Supine with the arm supported in a comfortable amount of abduction.",
        "Stabilize the scapula. Contact the proximal humerus close to the joint line with a broad comfortable grip.",
        "Direct the humeral head inferiorly relative to the glenoid using the selected Maitland grade.",
        "30–60 seconds × 2–4 bouts, reassessing elevation after each set.",
        "Abduction/elevation and overhead reach.",
        "Do not pull from the distal arm; keep the force close to the joint so the glide is controlled.",
        "Respect inferior instability and postoperative precautions."
      ),
      item(
        "Glenohumeral Anterior Glide",
        "Humeral head on glenoid",
        "Selected trial for extension/external-rotation restriction when an anterior glide improves the comparable sign.",
        "Prone or supine in a position that permits safe stabilization without stressing the anterior capsule.",
        "Stabilize the scapula; contact the posterior proximal humerus broadly.",
        "Apply a controlled anterior glide. Begin with low grade and confirm the response before progressing.",
        "30–45 seconds × 2–3 bouts initially.",
        "Extension/external rotation and the exact functional restriction.",
        "Anterior glide is not automatically appropriate just because external rotation is limited—use symptom response and stability testing.",
        "Avoid when anterior instability is suspected."
      )
    ],
    Knee: [
      item(
        "Posterior Tibial Glide for Knee Flexion",
        "Tibia on femur",
        "Improve knee flexion when posterior tibial glide is restricted and the treatment changes the comparable sign.",
        "Supine with the knee flexed to a comfortable angle and the foot supported.",
        "Stabilize the distal femur and use a broad contact over the proximal tibia, avoiding fibular-head nerve compression.",
        "Glide the tibia posteriorly on the femur with the selected oscillatory grade.",
        "30–60 seconds × 2–4 bouts.",
        "Knee flexion, squat and stair descent.",
        "Match the glide to the motion you are trying to improve; for open-chain tibial flexion, the concave tibia glides posteriorly.",
        "Avoid acute instability, fracture, DVT or uncleared postoperative restriction."
      ),
      item(
        "Anterior Tibial Glide for Knee Extension",
        "Tibia on femur",
        "Improve terminal extension when anterior tibial glide is clinically relevant.",
        "Supine with the knee near extension and comfortably supported.",
        "Stabilize the femur and contact the proximal posterior tibia broadly while protecting the popliteal region.",
        "Glide the tibia anteriorly relative to the femur with a low-to-moderate oscillatory grade.",
        "30–60 seconds × 2–4 bouts.",
        "Terminal knee extension, gait and step-down.",
        "Do not push directly into the popliteal fossa; use broad proximal-tibial control.",
        "Avoid acute posterior knee pathology or vascular concerns."
      ),
      item(
        "Patellar Inferior Glide",
        "Patellofemoral joint",
        "Improve knee flexion when inferior patellar mobility is a relevant limiter.",
        "Supine with the quadriceps relaxed and knee supported in slight flexion.",
        "Use both thumbs or broad finger pads on the superior patellar border without compressing the tendon.",
        "Translate the patella inferiorly in a smooth oscillatory or sustained manner.",
        "20–40 seconds × 2–4 bouts.",
        "Knee flexion and squat depth.",
        "A relaxed quadriceps makes patellar mobility easier to assess and treat.",
        "Respect recent surgery and acute patellofemoral irritation."
      )
    ],
    "Ankle & Foot": [
      item(
        "Posterior Talar Glide for Dorsiflexion",
        "Talocrural joint",
        "Improve ankle dorsiflexion when posterior talar glide is restricted.",
        "Supine/long sitting or weight-bearing depending on the technique. Keep the foot close to neutral and the tibia controlled.",
        "Stabilize the distal tibia/fibula. Use a broad contact over the anterior talus/neck of talus without compressing the dorsalis-pedis region.",
        "Glide the talus posteriorly relative to the mortise using the selected Maitland grade.",
        "30–60 seconds × 2–4 bouts.",
        "Weight-bearing lunge distance, squat and gait.",
        "Measure the weight-bearing lunge before and after—the change should be obvious enough to justify keeping the technique.",
        "Avoid acute syndesmotic instability or fracture."
      ),
      item(
        "Anterior Talar Glide for Plantarflexion",
        "Talocrural joint",
        "Improve plantarflexion when anterior talar glide is clinically relevant.",
        "Prone or supine with the ankle supported and the leg relaxed.",
        "Stabilize the distal tibia/fibula and contact the posterior talus/calcaneal region in a way that avoids Achilles compression.",
        "Guide the talus anteriorly in a controlled oscillatory glide.",
        "30–45 seconds × 2–3 bouts initially.",
        "Plantarflexion and functional push-off.",
        "Confirm that the limitation is talocrural rather than simply soft-tissue or pain-limited.",
        "Avoid acute posterior ankle injury."
      )
    ],
    "Wrist & Hand": [
      item(
        "Radiocarpal Dorsal Glide for Wrist Flexion",
        "Proximal carpal row on radius",
        "Improve wrist flexion when dorsal carpal glide is restricted.",
        "Sitting with forearm supported and wrist just off the table.",
        "Stabilize the distal radius/ulna and grasp the proximal carpal row broadly.",
        "Glide the carpals dorsally while the forearm remains stable.",
        "20–40 seconds × 2–4 bouts.",
        "Wrist flexion and grip/task tolerance.",
        "Keep the force at the radiocarpal joint rather than pulling the whole hand.",
        "Avoid acute carpal instability or fracture."
      ),
      item(
        "Radiocarpal Volar Glide for Wrist Extension",
        "Proximal carpal row on radius",
        "Improve wrist extension when volar carpal glide is clinically relevant.",
        "Sitting with forearm supported and wrist accessible.",
        "Stabilize distal radius/ulna and contact the proximal carpal row.",
        "Glide the carpal row volarly relative to the radius.",
        "20–40 seconds × 2–4 bouts.",
        "Wrist extension and weight-bearing through the hand.",
        "Re-test a meaningful task such as push-up position or getting up from a chair if that was the original limitation.",
        "Respect ligament injury and postoperative precautions."
      )
    ]
  },

  "kaltenborn-evjenth-mobilization": {
    Shoulder: [
      item(
        "Glenohumeral Grade I–III Traction",
        "Glenohumeral joint",
        "Use Grade I to reduce compression, Grade II to take up slack and Grade III to stretch a restricted capsule when irritability permits.",
        "Supine with the shoulder near its resting position and the arm supported.",
        "Stabilize the scapula and grasp the proximal humerus close to the joint line; a belt may be used by a trained clinician.",
        "Apply traction perpendicular to the glenoid treatment plane. The grade is defined by slack/tissue resistance, not by arbitrary force.",
        "10–30 second sustained holds repeated 3–5 times with reassessment.",
        "Pain, flexion/abduction and joint-play response.",
        "The treatment plane determines the direction. Pulling on the distal arm without controlling the joint is not precise traction.",
        "Avoid acute dislocation, fracture or unstable repair."
      ),
      item(
        "Posterior Translatoric Glide",
        "Humeral head",
        "Improve selected flexion/internal-rotation restriction when posterior translatoric glide is indicated.",
        "Supine with the scapula stabilized and humerus supported near the treatment position.",
        "Broad contact over the anterior proximal humerus close to the joint.",
        "Glide the humeral head posteriorly parallel to the treatment plane after appropriate traction/slack is taken up.",
        "10–30 second sustained bouts × 3–5.",
        "Flexion/internal rotation and functional reach.",
        "Kaltenborn glides are sustained translatoric movements—not rhythmic Maitland oscillations.",
        "Avoid anterior/posterior instability as appropriate."
      )
    ],
    "Hip & Pelvis": [
      item(
        "Hip Lateral Traction",
        "Femoral head in acetabulum",
        "Reduce joint compression and improve flexion/rotation tolerance in selected stiff/painful hips.",
        "Supine with the hip flexed slightly into a comfortable resting position.",
        "Stabilize the pelvis. Use a belt or broad proximal-thigh contact to control the femur close to the joint.",
        "Distract the femoral head laterally, perpendicular to the acetabular treatment plane.",
        "10–30 second sustained holds × 3–5.",
        "Hip flexion/internal rotation, squat and walking.",
        "A belt can reduce therapist effort but does not replace precise pelvic stabilization.",
        "Respect hip replacement precautions and fracture risk."
      ),
      item(
        "Posterior Hip Translatoric Glide",
        "Femoral head",
        "Improve selected flexion/internal-rotation restriction.",
        "Supine with the hip flexed to the treatment position and pelvis stabilized.",
        "Broad contact through the proximal femur/knee line while preventing pelvic rotation.",
        "Apply a sustained posterior glide parallel to the treatment plane after taking up slack.",
        "10–30 second holds × 3–5.",
        "Hip flexion/internal rotation and squat.",
        "If the pelvis rotates backward, the movement is no longer isolated at the hip.",
        "Avoid in acute hip injury or unstable postoperative state."
      )
    ],
    Knee: [
      item(
        "Tibiofemoral Traction",
        "Tibiofemoral joint",
        "Reduce compression sensitivity or stretch the capsule according to the traction grade.",
        "Sitting or supine with the knee positioned so the joint is relaxed.",
        "Stabilize the femur and grasp the proximal tibia/leg securely without compressing the fibular head.",
        "Apply sustained distraction perpendicular to the tibial treatment plane.",
        "10–30 second holds × 3–5.",
        "Pain, flexion/extension and weight-bearing tolerance.",
        "Grade choice should match irritability; a stiff joint does not automatically require a high-grade stretch.",
        "Avoid acute instability, fracture or DVT."
      )
    ],
    "Ankle & Foot": [
      item(
        "Talocrural Traction",
        "Talocrural joint",
        "Reduce compression sensitivity and prepare for translatoric glides.",
        "Supine or long sitting with the ankle near its resting position.",
        "Stabilize the distal tibia/fibula and grasp the talus/calcaneus close to the joint.",
        "Apply sustained distraction perpendicular to the talocrural treatment plane.",
        "10–30 second holds × 3–5.",
        "Pain, dorsiflexion/plantarflexion and lunge.",
        "Keep the traction at the talocrural joint rather than simply pulling the forefoot.",
        "Avoid fracture or acute syndesmotic instability."
      ),
      item(
        "Posterior Talar Translatoric Glide",
        "Talus",
        "Improve dorsiflexion when posterior translatoric motion is limited.",
        "Supine/long sitting or weight-bearing as appropriate with the tibia stabilized.",
        "Broad contact over the anterior talus, avoiding neurovascular compression.",
        "Apply a sustained posterior glide parallel to the treatment plane.",
        "10–30 second holds × 3–5.",
        "Weight-bearing dorsiflexion and squat.",
        "Use the weight-bearing lunge as the main quick re-test.",
        "Avoid acute ankle instability or fracture."
      )
    ]
  },

  "mulligan-mobilization-with-movement": {
    Shoulder: [
      item(
        "Lateral Glide + Active Elevation",
        "Glenohumeral joint",
        "Restore a painful/restricted elevation movement when a sustained lateral glide makes the motion immediately easier.",
        "Standing or sitting with the shoulder girdle relaxed and the movement to be re-tested clearly defined.",
        "Use a belt or broad manual contact to sustain a lateral glide of the humeral head while the patient controls the arm.",
        "Maintain the pain-free glide while the patient actively elevates the arm. Adjust the glide direction until the movement is clearly improved or abandon the technique.",
        "6–10 repetitions for 2–3 sets if the PILL response is present.",
        "Pain-free flexion/abduction and the exact reaching task.",
        "Mulligan's practical rule is PILL: Pain-free, Immediate improvement, Long-lasting effect. If the first two are absent, change or stop the technique.",
        "Do not push through pain to complete repetitions."
      )
    ],
    Elbow: [
      item(
        "Lateral Elbow Glide + Pain-Free Grip",
        "Elbow complex / lateral elbow",
        "Reduce pain during gripping in selected lateral-elbow presentations when the glide produces an immediate change.",
        "Sitting or standing with the elbow positioned exactly as in the painful grip test.",
        "Apply a sustained lateral glide across the elbow with a belt or manual contact while the forearm is stabilized.",
        "Maintain the glide while the patient performs the previously painful grip or wrist-extension task.",
        "6–10 repetitions or repeated pain-free grips for 2–3 sets if the response is clearly positive.",
        "Pain-free grip strength and familiar functional grip task.",
        "Use the painful grip itself as the comparable sign before and after every set.",
        "Stop if the glide cannot make the movement comfortable."
      )
    ],
    Knee: [
      item(
        "Tibial Glide + Active Knee Flexion/Extension",
        "Tibiofemoral joint",
        "Improve painful active knee movement when a sustained tibial correction produces immediate improvement.",
        "Standing, sitting or supine depending on the patient's painful movement; choose the position that reproduces the comparable sign.",
        "Use a belt or broad contact to sustain the tibial glide while controlling femoral/pelvic alignment.",
        "Maintain the pain-free accessory glide while the patient repeatedly performs flexion/extension or the relevant functional movement.",
        "6–10 repetitions × 2–3 sets if each repetition stays pain-free/easier.",
        "Knee ROM, squat, step or sit-to-stand.",
        "Do not choose the glide by theory alone—choose the one that immediately improves the patient's movement.",
        "Avoid unstable acute ligament injury."
      )
    ],
    "Ankle & Foot": [
      item(
        "Weight-Bearing Ankle MWM",
        "Talocrural joint",
        "Improve limited weight-bearing dorsiflexion when a sustained glide produces an immediate increase in lunge range.",
        "Half-kneeling or standing lunge with the heel fully down and foot pointing forward.",
        "Stabilize the foot. Use a belt/manual contact to sustain an anterior tibial glide or posterior talar correction according to the trained setup.",
        "Maintain the glide while the patient actively drives the knee forward over the foot without heel lift.",
        "6–10 pain-free repetitions × 2–3 sets.",
        "Weight-bearing lunge distance, squat depth and gait.",
        "If the heel lifts or the arch collapses, the apparent dorsiflexion gain may be compensation.",
        "Avoid in acute unstable ankle injury or fracture."
      )
    ],
    "Hip & Pelvis": [
      item(
        "Belt-Assisted Lateral Hip Glide + Active Flexion",
        "Femoroacetabular joint",
        "Improve painful/restricted hip flexion when a sustained lateral glide makes the movement easier.",
        "Supine with the hip and knee flexed comfortably; belt positioned by a trained clinician for a lateral glide.",
        "Stabilize the pelvis while the belt/manual contact provides a sustained lateral glide close to the hip joint.",
        "Maintain the glide while the patient actively flexes the hip through the improved pain-free range.",
        "6–10 repetitions × 2–3 sets if the response is positive.",
        "Hip flexion, squat and sit-to-stand.",
        "The pelvis should remain quiet; pelvic rotation can create a false impression of hip improvement.",
        "Respect hip replacement and acute injury precautions."
      )
    ]
  },

  "mulligan-snags-nags": {
    Cervical: [
      item(
        "Cervical SNAG for Rotation",
        "Selected cervical segment",
        "Improve a painful/restricted cervical rotation when a sustained segmental glide makes rotation immediately easier.",
        "Sitting upright with the head in neutral and the painful rotation measured first.",
        "Apply the trained facet-directed contact at the selected segment; the patient's head remains under their own active control.",
        "Maintain the segmental glide while the patient actively rotates into the previously limited direction. The movement should be pain-free or clearly improved.",
        "6–10 repetitions; repeat 1–3 sets only if improvement is maintained.",
        "Cervical rotation and the patient's look-over-shoulder task.",
        "A SNAG is movement plus glide; if the patient is passive, it is not a SNAG.",
        "Cervical screening and clinician training are required."
      ),
      item(
        "Self-SNAG for Cervical Rotation",
        "Cervical self-management",
        "Allow the patient to reproduce a helpful pain-free glide independently when they can control the technique safely.",
        "Sitting with a towel/strap positioned exactly as taught by the clinician.",
        "The towel supports the selected segment while the hands guide the direction of the self-glide.",
        "Maintain the gentle glide while actively rotating; stop before pain, dizziness or neurological symptoms.",
        "5–10 repetitions, symptom-guided.",
        "Pain-free rotation immediately after the self-SNAG.",
        "Teach self-SNAG only after a clinician has confirmed the direction is helpful and the patient can reproduce it correctly.",
        "Stop with dizziness, unusual headache, visual symptoms or distal neurological change."
      )
    ],
    Thoracic: [
      item(
        "Thoracic SNAG for Extension / Rotation",
        "Selected thoracic segment",
        "Improve a painful/restricted thoracic movement when a sustained segmental glide produces immediate improvement.",
        "Supported sitting with the trunk movement to be treated clearly identified.",
        "Use a trained segmental contact at the selected thoracic level while the trunk is controlled.",
        "Maintain the glide while the patient actively extends or rotates through the improved range.",
        "6–10 repetitions × 1–3 sets if pain-free.",
        "Thoracic extension/rotation and linked neck/shoulder task.",
        "Re-test the exact movement that justified the technique rather than assuming more mobility is always better.",
        "Use caution with osteoporosis/rib fracture risk."
      )
    ]
  }
};



Object.assign(priorityRegionalSubTechniques["maitland-joint-mobilization"]!, {
  Cervical: [
    item(
      "Cervical Central PA Mobilization",
      "Selected cervical spinous process",
      "Pain modulation or segmental extension tolerance when a central PA changes the patient's comparable sign.",
      "Prone with the forehead supported and cervical spine close to neutral. Keep shoulders relaxed.",
      "Use a broad supported-thumb or hypothenar contact over the selected spinous process; avoid sharp fingertip pressure.",
      "Apply a smooth posterior-to-anterior oscillation through the selected segment. Grade I–II for pain-dominant presentations; Grade III–IV only when stiffness dominates and irritability is low.",
      "30–60 seconds × 2–4 bouts with immediate re-test after each bout.",
      "Cervical extension/rotation, local pain and the patient's look-up/look-over-shoulder task.",
      "A central PA should create a local accessory movement—not rock the whole neck.",
      "Stop with dizziness, unusual headache, neurological change or disproportionate symptom increase."
    ),
    item(
      "Cervical Unilateral PA Mobilization",
      "Cervical articular pillar on the selected side",
      "Improve a painful/restricted rotation or extension comparable sign when unilateral segmental loading is helpful.",
      "Prone with head supported and neck relaxed near neutral.",
      "Broad thumb/hypothenar contact over the articular pillar while the opposite hand supports the contact and head position.",
      "Apply a controlled posterior-to-anterior oscillation on the selected articular pillar.",
      "30–60 seconds × 2–4 bouts, response-guided.",
      "Cervical rotation to the symptomatic side, extension and referred symptom behavior.",
      "Re-test after the first short bout. If the comparable sign does not change, do not simply increase force.",
      "Use contemporary cervical vascular/neurological/instability screening."
    ),
    item(
      "Lower-Cervical Side Glide",
      "Mid/lower cervical segment",
      "Improve selected lateral translation restriction or modify a radicular/mechanical comparable sign.",
      "Supine with the head fully supported in neutral or slight flexion.",
      "Cradle the neck and contact the lateral articular pillar/segment with a broad hand surface.",
      "Translate the selected cervical segment gently sideways while minimizing rotation and flexion/extension.",
      "20–40 seconds × 2–4 bouts or small oscillations, staying below symptom aggravation.",
      "Cervical side-bending/rotation and upper-limb symptom distribution.",
      "A useful side glide often changes the arm symptom or neck movement immediately; if not, reconsider the hypothesis.",
      "Do not continue if arm symptoms peripheralize or neurological findings worsen."
    )
  ],
  Thoracic: [
    item(
      "Thoracic Central PA Mobilization",
      "Selected thoracic spinous process",
      "Improve thoracic extension tolerance and local stiffness when clinically relevant.",
      "Prone with head supported and breathing unrestricted.",
      "Hypothenar or supported-thumb contact over the spinous process; stack shoulders over hands to avoid excessive arm effort.",
      "Apply a posterior-to-anterior oscillation approximately perpendicular to the local thoracic contour.",
      "30–60 seconds × 2–4 bouts.",
      "Thoracic extension/rotation and any linked neck/shoulder comparable sign.",
      "Use the lowest force that changes the comparable sign; more spring does not equal better treatment.",
      "Use caution with osteoporosis, rib fracture history and recent trauma."
    ),
    item(
      "Thoracic Unilateral PA Mobilization",
      "Thoracic transverse-process / facet region",
      "Address side-specific thoracic stiffness when a unilateral PA improves rotation or a linked upper-quarter sign.",
      "Prone with chest and head supported.",
      "Broad contact over the selected transverse-process/articular region while the trunk remains stable.",
      "Apply a unilateral posterior-to-anterior oscillation on the selected side.",
      "30–60 seconds × 2–4 bouts.",
      "Thoracic rotation and linked neck/shoulder movement.",
      "Prevent trunk rolling; if the body rotates under your hand, the local glide is lost.",
      "Avoid painful direct loading over suspected rib injury."
    )
  ],
  Lumbar: [
    item(
      "Lumbar Central PA Mobilization",
      "Selected lumbar spinous process",
      "Pain modulation or extension tolerance in selected mechanical low-back presentations.",
      "Prone with a pillow under the abdomen if it improves comfort.",
      "Broad hypothenar/supported-thumb contact over the selected spinous process with wrists neutral.",
      "Apply a controlled posterior-to-anterior oscillation through the selected level.",
      "30–60 seconds × 2–4 bouts with re-test after each bout.",
      "Lumbar extension/flexion, sit-to-stand and symptom distribution.",
      "Treat the comparable sign, not the imaging level. A stiff-feeling segment is not automatically the pain source.",
      "Do not use routine manual therapy when cauda equina, fracture, infection or malignancy is suspected."
    ),
    item(
      "Lumbar Unilateral PA Mobilization",
      "Lumbar posterior element on the selected side",
      "Improve selected rotation/side-bending restriction or local pain when unilateral loading is helpful.",
      "Prone with pelvis level and trunk relaxed.",
      "Broad contact over the posterior element while the opposite hand supports the mobilizing hand.",
      "Apply a unilateral posterior-to-anterior oscillation, avoiding global lumbar extension.",
      "30–60 seconds × 2–4 bouts.",
      "Rotation/side-bending and the functional movement that reproduced pain.",
      "If leg symptoms spread farther distally, stop and reassess rather than progressing the grade.",
      "Avoid progressive neurological loss or red-flag spinal presentations."
    )
  ],
  Elbow: [
    item(
      "Ulnohumeral Distraction",
      "Ulnohumeral joint",
      "Reduce compression sensitivity and prepare flexion/extension in a stiff or painful elbow.",
      "Supine or sitting with the arm supported and elbow in a comfortable loose-packed position.",
      "Stabilize the distal humerus and grasp the proximal ulna/forearm securely while protecting the ulnar nerve.",
      "Apply gentle long-axis distraction through the ulnohumeral joint.",
      "10–30 second holds or Grade I–II oscillatory distraction × 3–5 trials.",
      "Elbow flexion/extension and functional reach/grip.",
      "Keep the traction close to the joint; pulling the wrist mainly tensions the forearm.",
      "Avoid acute dislocation, fracture or unstable ligament injury."
    ),
    item(
      "Radial Head AP / PA Glide",
      "Proximal radioulnar / radiocapitellar region",
      "Improve pronation/supination when radial-head accessory motion is restricted.",
      "Sitting or supine with elbow supported in slight flexion.",
      "Stabilize the ulna/humerus and contact the radial head precisely, avoiding excessive pressure on the posterior interosseous nerve region.",
      "Apply a small anterior or posterior glide chosen from the restricted forearm rotation and immediate response.",
      "20–40 seconds × 2–4 bouts.",
      "Pronation/supination and grip/task tolerance.",
      "The radial head is small—precision matters more than force.",
      "Stop with nerve-type pain, tingling or acute lateral-elbow instability."
    )
  ],
  "Hip & Pelvis": [
    item(
      "Hip Long-Axis Distraction",
      "Femoroacetabular joint",
      "Reduce compression sensitivity and improve global hip movement tolerance.",
      "Supine with hip near neutral or slight flexion/abduction as comfortable.",
      "Stabilize the pelvis and hold the distal femur/leg with a secure broad grip.",
      "Apply smooth long-axis traction along the femoral shaft without jerking.",
      "10–30 second holds × 3–5 or low-grade oscillatory traction.",
      "Hip flexion/rotation, gait and sit-to-stand.",
      "If the pelvis slides on the table, you are losing the joint-specific distraction.",
      "Respect fracture risk and hip-replacement precautions."
    ),
    item(
      "Hip Posterior Glide",
      "Femoral head on acetabulum",
      "Improve selected hip flexion/internal-rotation restriction when posterior glide is helpful.",
      "Supine with hip flexed to a comfortable treatment angle and pelvis stabilized.",
      "Control the proximal femur through the distal thigh/knee while preventing pelvic rotation.",
      "Glide the femoral head posteriorly relative to the acetabulum using the selected Maitland grade.",
      "30–60 seconds × 2–4 bouts.",
      "Hip flexion/internal rotation and squat.",
      "A quiet pelvis is essential; pelvic rolling can create a false ROM gain.",
      "Avoid acute intra-articular injury or unstable postoperative state."
    )
  ]
});

Object.assign(priorityRegionalSubTechniques["kaltenborn-evjenth-mobilization"]!, {
  Elbow: [
    item(
      "Ulnohumeral Traction — Kaltenborn",
      "Ulnohumeral joint",
      "Grade I for decompression, Grade II to take up slack and Grade III for sustained capsular stretch when appropriate.",
      "Sitting or supine with the elbow in a relaxed treatment position.",
      "Stabilize the humerus and grasp the proximal ulna/forearm close to the joint.",
      "Apply sustained traction perpendicular to the joint treatment plane.",
      "10–30 second holds × 3–5, grade matched to irritability.",
      "Elbow pain, flexion/extension and joint-play feel.",
      "Kaltenborn traction is sustained and translatoric; do not turn it into large rhythmic oscillations.",
      "Avoid acute instability or fracture."
    ),
    item(
      "Radial Head Translatoric Glide",
      "Proximal radioulnar joint",
      "Improve forearm rotation when a specific radial-head glide is restricted.",
      "Elbow supported in slight flexion with forearm relaxed.",
      "Stabilize ulna and contact the radial head close to the joint line.",
      "Apply a sustained AP or PA glide parallel to the treatment plane, selected from the motion restriction.",
      "10–20 second holds × 3–5.",
      "Pronation/supination.",
      "Use small precise movement; the radial head should glide, not the entire forearm.",
      "Stop with nerve-type symptoms."
    )
  ],
  "Wrist & Hand": [
    item(
      "Radiocarpal Traction — Kaltenborn",
      "Radiocarpal joint",
      "Reduce compression and prepare the wrist for translatoric glides.",
      "Sitting with forearm supported and wrist just off the table.",
      "Stabilize distal radius/ulna and grasp the proximal carpal row/hand close to the joint.",
      "Apply sustained distraction perpendicular to the radiocarpal treatment plane.",
      "10–20 second holds × 3–5.",
      "Pain, flexion/extension and weight-bearing tolerance.",
      "Traction should occur at the joint, not by pulling the fingers.",
      "Avoid acute fracture or carpal instability."
    ),
    item(
      "Radiocarpal Dorsal / Volar Translatoric Glide",
      "Proximal carpal row",
      "Improve flexion or extension using a sustained translatoric glide.",
      "Forearm supported with the wrist relaxed.",
      "Stabilize radius/ulna and contact the proximal carpal row.",
      "Use dorsal glide for flexion restriction or volar glide for extension restriction, then verify with re-test.",
      "10–20 second holds × 3–5.",
      "Wrist flexion/extension and the patient's task.",
      "Biomechanical direction is a starting hypothesis—the patient's response confirms whether the glide is worth keeping.",
      "Respect ligament injury and postoperative precautions."
    )
  ]
});

Object.assign(priorityRegionalSubTechniques["mulligan-mobilization-with-movement"]!, {
  "Wrist & Hand": [
    item(
      "Wrist MWM + Active Extension",
      "Radiocarpal / midcarpal region",
      "Improve a painful wrist-extension comparable sign when an accessory glide makes the movement immediately easier.",
      "Sitting with forearm supported and wrist free to move.",
      "Apply the selected pain-free accessory glide across the wrist while stabilizing the forearm.",
      "Maintain the glide while the patient actively extends the wrist or performs the exact painful weight-bearing movement.",
      "6–10 repetitions × 2–3 sets only while the PILL response is present.",
      "Wrist extension and weight-bearing through the hand.",
      "The glide direction is chosen by immediate improvement—not by habit.",
      "Avoid acute carpal instability or fracture."
    )
  ]
});

Object.assign(priorityRegionalSubTechniques["strain-counterstrain"]!, {
  Thoracic: [
    item(
      "Thoracic Paraspinal Tender Point — Positional Release",
      "Thoracic paraspinal tender region",
      "Reduce focal thoracic guarding before active extension/rotation.",
      "Prone, side-lying or supported sitting. Adjust thoracic flexion/extension, rotation and side-bending until tenderness falls markedly.",
      "Light monitoring contact over the tender paraspinal point.",
      "Maintain the position of maximal comfort without adding stretch.",
      "60–90 seconds, then return slowly to neutral.",
      "Thoracic rotation/extension and local tenderness.",
      "The correct position is the one that reduces tenderness—not the one that looks most dramatic.",
      "Use caution with osteoporosis and rib fracture risk."
    )
  ],
  "Ribs & Chest Wall": [
    item(
      "Intercostal / Rib-Angle Tender Point — Positional Release",
      "Intercostal or posterior rib-angle tender region",
      "Reduce selected chest-wall guarding after cardiopulmonary and rib-fracture red flags have been excluded.",
      "Side-lying or supported sitting with breathing comfortable. Fine-tune trunk rotation/side-bending to unload the tender region.",
      "Very light monitoring contact over the tender rib/intercostal region; never use focal force on a suspected fracture.",
      "Maintain the position of ease and allow relaxed breathing.",
      "45–90 seconds.",
      "Pain with deep breath, thoracic rotation and local tenderness.",
      "Breathing should become easier, not more restricted, during the hold.",
      "Do not manually treat unexplained chest pain, dyspnea or suspected rib fracture."
    )
  ],
  "Wrist & Hand": [
    item(
      "Forearm Flexor Tender Point — Positional Release",
      "Forearm flexor muscle belly",
      "Reduce focal forearm guarding before grip or wrist movement.",
      "Sitting with forearm supported. Flex the wrist/fingers and adjust forearm rotation until tenderness reduces clearly.",
      "Light monitoring contact over the tender muscle point.",
      "Maintain the shortened position without pressure escalation.",
      "60–90 seconds.",
      "Grip, wrist extension and local tenderness.",
      "Support the hand fully so the patient is not actively holding the position.",
      "Stop with nerve-type symptoms."
    )
  ]
});

Object.assign(priorityRegionalSubTechniques["myofascial-release"]!, {
  Thoracic: [
    item(
      "Thoracic Paraspinal Fascial Release",
      "Thoracic paraspinal fascia",
      "Improve extension/rotation tolerance when thoracic soft-tissue restriction is relevant.",
      "Prone with chest/head supported and breathing unrestricted.",
      "Broad bilateral or unilateral hand contact over paraspinal soft tissue.",
      "Take up fascial slack slowly in longitudinal/diagonal directions and sustain the most restricted comfortable direction.",
      "60–120 seconds per contact, then re-test.",
      "Thoracic extension/rotation and linked neck/shoulder movement.",
      "Do not compress the rib cage heavily; think shear and sustained tissue load.",
      "Use caution with osteoporosis or rib injury."
    )
  ],
  "Ribs & Chest Wall": [
    item(
      "Pectoral / Anterior Chest Fascial Release",
      "Pectoral fascia and anterior chest wall",
      "Improve comfortable shoulder-girdle movement and chest-wall mobility when local soft-tissue restriction is clinically relevant.",
      "Supine with the arm supported and breathing relaxed.",
      "Broad respectful contact over pectoral fascia, avoiding breast tissue and vulnerable axillary structures.",
      "Use a slow sustained diagonal or lateral fascial load while allowing normal breathing.",
      "60–120 seconds, then re-test shoulder elevation and chest-wall comfort.",
      "Shoulder elevation, scapular movement and breathing-related discomfort.",
      "Use consent and draping carefully; the anterior chest requires especially clear boundaries.",
      "Avoid unexplained chest pain or acute cardiopulmonary symptoms."
    )
  ],
  Elbow: [
    item(
      "Forearm Extensor Fascial Release",
      "Common extensor muscle mass",
      "Improve forearm soft-tissue tolerance before grip and progressive loading.",
      "Sitting with forearm supported and wrist relaxed.",
      "Broad hand/thumb/forearm contact along extensor muscle bellies rather than directly on the lateral epicondyle.",
      "Apply slow longitudinal or oblique fascial load; wrist movement may be added gently if comfortable.",
      "45–90 seconds, then re-test.",
      "Grip, wrist motion and local forearm pain.",
      "Avoid spending the whole session on manual work—follow with graded extensor loading.",
      "Avoid acute muscle tear."
    )
  ],
  "Wrist & Hand": [
    item(
      "Thenar / Palmar Fascial Release",
      "Thenar and palmar soft tissue",
      "Improve selected thumb/hand movement tolerance and local soft-tissue comfort.",
      "Sitting with hand supported palm-up.",
      "Small broad thumb/finger contact over thenar/palmar soft tissue, avoiding direct nerve compression.",
      "Use slow transverse/longitudinal tissue loading while fingers/thumb remain relaxed.",
      "30–60 seconds per small area.",
      "Thumb opposition/abduction, grip and local tenderness.",
      "The hand needs precision, not deep pressure.",
      "Stop with numbness/tingling."
    )
  ]
});

Object.assign(priorityRegionalSubTechniques["trigger-point-compression"]!, {
  Thoracic: [
    item(
      "Rhomboid Trigger-Point Pressure Release",
      "Rhomboid muscle region",
      "Reduce familiar medial-scapular myofascial pain before active scapular control work.",
      "Prone or side-lying with the arm supported so the scapula is relaxed.",
      "Broad thumb/knuckle contact medial to the scapula over muscle, not directly on ribs.",
      "Build tolerable sustained pressure on a point that reproduces the patient's familiar pain.",
      "20–60 seconds, then re-test.",
      "Scapular retraction, thoracic rotation and local pain.",
      "Do not treat every medial-scapular ache as a trigger point; cervical referral should be considered.",
      "Avoid direct heavy rib pressure."
    )
  ],
  "Ribs & Chest Wall": [
    item(
      "Pectoralis Major Trigger-Point Pressure Release",
      "Pectoralis major",
      "Reduce selected anterior chest/shoulder myofascial pain when it is clearly muscular.",
      "Supine with the arm supported and patient consent/draping maintained.",
      "Broad finger-pad contact over pectoralis major muscle belly away from breast tissue and axillary neurovascular structures.",
      "Apply gentle sustained pressure only if it reproduces familiar muscular symptoms.",
      "20–45 seconds, then re-test.",
      "Shoulder horizontal movement, elevation and local tenderness.",
      "Unexplained chest pain is not a trigger-point diagnosis.",
      "Do not manually treat acute or unexplained cardiopulmonary symptoms."
    )
  ],
  Elbow: [
    item(
      "Common Wrist Extensor Trigger-Point Release",
      "Wrist extensor muscle mass",
      "Reduce familiar forearm/lateral-elbow myofascial pain before grip/loading.",
      "Sitting with forearm supported.",
      "Broad thumb/knuckle contact over the extensor muscle belly rather than the tendon origin.",
      "Sustain tolerable pressure on a point that reproduces familiar symptoms.",
      "20–60 seconds.",
      "Grip, wrist extension and local pain.",
      "Differentiate muscle trigger-point tenderness from tendon pain at the lateral epicondyle.",
      "Stop with radial-nerve-type symptoms."
    )
  ],
  "Wrist & Hand": [
    item(
      "Thenar Trigger-Point Pressure Release",
      "Thenar muscle group",
      "Reduce selected local thenar tenderness and improve thumb movement comfort.",
      "Hand supported palm-up with thumb relaxed.",
      "Small broad contact over thenar muscle belly, avoiding excessive pressure toward the carpal tunnel.",
      "Apply gentle sustained pressure at a familiar tender point.",
      "15–30 seconds per point.",
      "Thumb opposition, pinch and local tenderness.",
      "Small hand muscles require much less force than larger proximal muscles.",
      "Stop with numbness/tingling."
    )
  ]
});

Object.assign(priorityRegionalSubTechniques["cyriax-deep-transverse-friction"]!, {
  "Wrist & Hand": [
    item(
      "De Quervain-Region Tendon — Deep Transverse Friction",
      "First dorsal-compartment tendon region",
      "Selected adjunct only when the symptomatic tendon region is clearly identified and irritability is low enough to tolerate manual loading.",
      "Sitting with forearm supported and thumb/wrist relaxed.",
      "Use a small precise transverse contact over the symptomatic tendon region near the radial styloid while protecting superficial sensory structures.",
      "Apply very small transverse movement across the tendon fibers; do not scrape along the skin.",
      "Brief tolerable trial only, followed by graded thumb/wrist loading and activity modification.",
      "Pain with thumb movement/grip and local tendon tenderness.",
      "This region is small and irritable—precision matters more than duration or force.",
      "Avoid acute inflammatory flare, marked swelling or sensory symptoms."
    )
  ]
});

export function getPriorityRegionalSubTechniques(
  techniqueSlug: string,
  region: ManualRegion,
): RegionalSubTechnique[] | null {
  const items = priorityRegionalSubTechniques[techniqueSlug]?.[region];
  return items?.length ? items : null;
}
