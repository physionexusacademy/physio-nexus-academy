/** Clinically plausible alternative working hypotheses for Case Lab's 36 MSK teaching presentations.
 * The clinical decision remains a simulated best-fit hypothesis, not a definitive diagnosis.
 */
export const nuancedMskAlternatives:Record<string,[{name:string;why:string},{name:string;why:string},{name:string;why:string}]>={
  "Cervical radiculopathy": [
    {
      "name": "Median or ulnar peripheral nerve entrapment",
      "why": "Distal nerve symptoms may mimic radiating pain, but a consistent nerve-root pattern needs separate testing."
    },
    {
      "name": "Brachial plexopathy",
      "why": "Broader multi-nerve weakness and the mechanism may point toward the plexus instead."
    },
    {
      "name": "Rotator cuff-related shoulder pain",
      "why": "Shoulder loading pain can refer to the upper arm but does not usually explain segmental reflex changes."
    }
  ],
  "Cervical myelopathy": [
    {
      "name": "Cervical radiculopathy",
      "why": "A root lesion may cause arm symptoms but does not adequately explain progressive gait and upper-motor-neuron signs."
    },
    {
      "name": "Peripheral polyneuropathy",
      "why": "Distal sensory changes can impair gait, but cord-related upper-motor-neuron findings require assessment."
    },
    {
      "name": "Normal-pressure hydrocephalus",
      "why": "Gait problems can overlap, although the wider neurological pattern is different."
    }
  ],
  "Mechanical neck pain": [
    {
      "name": "Cervical radiculopathy",
      "why": "Root-related arm pain or neurological changes would alter assessment priorities."
    },
    {
      "name": "Cervicogenic headache",
      "why": "Referred head pain coupled to neck movement may dominate in this alternative."
    },
    {
      "name": "Shoulder-related referred pain",
      "why": "Shoulder loading may reproduce symptoms that appear to come from the neck."
    }
  ],
  "Cervicogenic headache": [
    {
      "name": "Migraine",
      "why": "Recurrent light sensitivity, nausea or typical migraine features favor a different pathway."
    },
    {
      "name": "Tension-type headache",
      "why": "Bilateral pressing pain without consistent neck-motion reproduction may fit better."
    },
    {
      "name": "Occipital neuralgia",
      "why": "Brief stabbing pain in an occipital nerve distribution should be investigated."
    }
  ],
  "Thoracic outlet presentation": [
    {
      "name": "Cervical radiculopathy",
      "why": "Dermatomal, myotomal or reflex changes may better suggest cervical nerve-root involvement."
    },
    {
      "name": "Peripheral nerve entrapment",
      "why": "Distal distribution and nerve provocation may localize a more peripheral problem."
    },
    {
      "name": "Rotator cuff-related shoulder pain",
      "why": "Painful loading can overlap but does not account for concerning vascular findings."
    }
  ],
  "Lumbar radiculopathy": [
    {
      "name": "Hip joint referral",
      "why": "Hip-provoked groin or thigh pain can resemble lumbar referral."
    },
    {
      "name": "Peripheral neuropathy",
      "why": "Distal symmetric sensory change may have a peripheral origin."
    },
    {
      "name": "Nonspecific low-back pain with referral",
      "why": "Referred pain without concordant neurological changes may fit a mechanical pattern."
    }
  ],
  "Nonspecific low back pain": [
    {
      "name": "Lumbar radiculopathy",
      "why": "Radiating symptoms with segmental neurological signs change the hypothesis."
    },
    {
      "name": "Hip-related referred pain",
      "why": "Hip movement restriction and symptom reproduction may direct assessment away from the spine."
    },
    {
      "name": "Vertebral compression fracture",
      "why": "Focal spinal pain with osteoporosis or trauma requires fracture screening."
    }
  ],
  "Lumbar spinal stenosis": [
    {
      "name": "Vascular claudication",
      "why": "Exertional leg symptoms may reflect arterial disease; posture and vascular findings matter."
    },
    {
      "name": "Peripheral neuropathy",
      "why": "Distal sensory symptoms may be present independent of walking posture."
    },
    {
      "name": "Hip osteoarthritis",
      "why": "Hip joint loading and limited rotation can contribute to activity-related pain."
    }
  ],
  "Cauda equina red flags": [
    {
      "name": "Lumbar radiculopathy without cauda equina compromise",
      "why": "Sciatica alone does not account safely for new bladder or saddle changes."
    },
    {
      "name": "Conus medullaris compression",
      "why": "A different spinal emergency can produce overlapping sphincter and neurological signs."
    },
    {
      "name": "Spinal epidural abscess",
      "why": "Infection with neurological deterioration is another urgent possibility."
    }
  ],
  "Vertebral fracture concern": [
    {
      "name": "Lumbar muscle strain",
      "why": "Soft-tissue pain can follow movement, but fracture risk and focal bony tenderness must be weighed."
    },
    {
      "name": "Malignancy-associated spinal pain",
      "why": "Cancer history or systemic signs create a different serious cause of spinal pain."
    },
    {
      "name": "Discogenic low-back pain",
      "why": "Load-sensitive disc-related pain may overlap, but does not exclude fragility fracture."
    }
  ],
  "Rotator cuff-related shoulder pain": [
    {
      "name": "Adhesive capsulitis",
      "why": "A marked loss of passive external rotation would support a stiff-shoulder pattern."
    },
    {
      "name": "Cervical referred pain",
      "why": "Neck-provoked arm symptoms may be misread as primary shoulder pain."
    },
    {
      "name": "Glenohumeral osteoarthritis",
      "why": "Deep joint pain, crepitus and passive restriction suggest joint disease."
    }
  ],
  "Adhesive capsulitis": [
    {
      "name": "Glenohumeral osteoarthritis",
      "why": "Both can limit active and passive movement; onset, age and imaging may help."
    },
    {
      "name": "Rotator cuff-related shoulder pain",
      "why": "Active load pain with relatively preserved passive motion suggests a different problem."
    },
    {
      "name": "Post-traumatic shoulder stiffness",
      "why": "A clear injury and immobilization history can explain secondary stiffness."
    }
  ],
  "Glenohumeral osteoarthritis": [
    {
      "name": "Adhesive capsulitis",
      "why": "Both cause stiffness but the broader clinical and imaging pattern differentiates."
    },
    {
      "name": "Rotator cuff-related shoulder pain",
      "why": "Tendon load provocation differs from predominant joint crepitus and passive restriction."
    },
    {
      "name": "Cervical referred pain",
      "why": "Cervical symptoms can mimic shoulder pain without primary glenohumeral joint restriction."
    }
  ],
  "Acromioclavicular joint injury": [
    {
      "name": "Proximal humeral fracture",
      "why": "A traumatic shoulder presentation must exclude significant bony injury."
    },
    {
      "name": "Traumatic rotator cuff tear",
      "why": "Weak active elevation after trauma requires rotator cuff consideration."
    },
    {
      "name": "Glenohumeral instability",
      "why": "Apprehension and dislocation features suggest a different joint."
    }
  ],
  "Shoulder instability": [
    {
      "name": "Traumatic rotator cuff tear",
      "why": "Acute weakness may reflect tendon injury instead of recurrent joint instability."
    },
    {
      "name": "Acromioclavicular injury",
      "why": "Superior focal tenderness after trauma can localize pain to the AC joint."
    },
    {
      "name": "Cervical referred pain",
      "why": "Cervical or nerve symptoms can mimic shoulder dysfunction without apprehension."
    }
  ],
  "Lateral epicondylalgia": [
    {
      "name": "Radial tunnel syndrome",
      "why": "Deep proximal forearm pain may reflect radial nerve irritation rather than local tendon load."
    },
    {
      "name": "Cervical radiculopathy",
      "why": "Neck-related neurological changes may cause lateral forearm symptoms."
    },
    {
      "name": "Radiocapitellar joint pathology",
      "why": "Joint loading or restriction can contribute to lateral elbow pain."
    }
  ],
  "Medial epicondylalgia": [
    {
      "name": "Ulnar neuropathy at elbow",
      "why": "Ring/little finger paresthesia and nerve provocation favor an ulnar nerve source."
    },
    {
      "name": "Ulnar collateral ligament sprain",
      "why": "Valgus stress and instability may dominate after throwing trauma."
    },
    {
      "name": "Cervical radiculopathy",
      "why": "Matching root symptoms can refer toward the medial elbow."
    }
  ],
  "Cubital tunnel syndrome": [
    {
      "name": "C8/T1 cervical radiculopathy",
      "why": "Root-level symptoms may overlap with ulnar-distribution weakness."
    },
    {
      "name": "Ulnar nerve compression at Guyon's canal",
      "why": "More distal ulnar symptoms can arise at the wrist."
    },
    {
      "name": "Lower brachial plexopathy",
      "why": "Multiple peripheral nerve territories may suggest a proximal lesion."
    }
  ],
  "Carpal tunnel syndrome": [
    {
      "name": "Cervical radiculopathy",
      "why": "Neck-provoked symptoms and segmental deficits may mimic median-distribution tingling."
    },
    {
      "name": "Proximal median neuropathy",
      "why": "Forearm pain and median symptoms may arise proximal to the wrist."
    },
    {
      "name": "Distal symmetric polyneuropathy",
      "why": "Bilateral diffuse sensory loss may reflect generalized nerve involvement."
    }
  ],
  "De Quervain tenosynovitis": [
    {
      "name": "Thumb CMC osteoarthritis",
      "why": "Thumb-base joint pain and pinch loading can overlap with radial styloid symptoms."
    },
    {
      "name": "Intersection syndrome",
      "why": "Pain may localize more proximally over crossing dorsal forearm tendons."
    },
    {
      "name": "Scaphoid injury",
      "why": "Trauma and anatomical snuffbox tenderness warrant bony assessment."
    }
  ],
  "Thumb CMC osteoarthritis": [
    {
      "name": "De Quervain tenosynovitis",
      "why": "Radial styloid tendon provocation is more characteristic than painful thumb-base joint loading."
    },
    {
      "name": "Scaphotrapeziotrapezoid joint osteoarthritis",
      "why": "Neighboring carpal joint degeneration may generate similar radial wrist pain."
    },
    {
      "name": "Scaphoid pathology",
      "why": "History of trauma and focal bony tenderness require consideration."
    }
  ],
  "Hip osteoarthritis": [
    {
      "name": "Lumbar referred pain",
      "why": "Lumbar provocation and neurological distribution can mimic hip discomfort."
    },
    {
      "name": "Greater trochanteric pain syndrome",
      "why": "Predominant lateral tenderness and abductor loading differ from groin-driven joint pain."
    },
    {
      "name": "Femoroacetabular impingement syndrome",
      "why": "Younger activity-related groin symptoms and provocative flexion may suggest impingement."
    }
  ],
  "Greater trochanteric pain syndrome": [
    {
      "name": "Hip osteoarthritis",
      "why": "Restricted hip internal rotation and groin pain suggest joint involvement."
    },
    {
      "name": "Lumbar radiculopathy",
      "why": "Radiating leg symptoms and neurological signs indicate lumbar contribution."
    },
    {
      "name": "Gluteal muscle strain",
      "why": "A distinct acute loading event can produce lateral hip symptoms."
    }
  ],
  "Femoroacetabular impingement syndrome": [
    {
      "name": "Hip osteoarthritis",
      "why": "Marked generalized stiffness and degenerative features favor joint disease."
    },
    {
      "name": "Hip labral pathology",
      "why": "Mechanical catching or instability may accompany intra-articular pathology."
    },
    {
      "name": "Adductor-related groin pain",
      "why": "Resisted adduction and local tenderness may suggest a muscular source."
    }
  ],
  "Knee osteoarthritis": [
    {
      "name": "Inflammatory arthritis",
      "why": "Prolonged morning stiffness, warmth or multiple joint involvement changes the diagnosis."
    },
    {
      "name": "Degenerative meniscal pathology",
      "why": "Mechanical symptoms can overlap; imaging abnormalities alone are not definitive."
    },
    {
      "name": "Hip osteoarthritis with referred knee pain",
      "why": "Restricted painful hip motion may explain knee discomfort."
    }
  ],
  "Patellofemoral pain": [
    {
      "name": "Patellar tendinopathy",
      "why": "Focal tendon tenderness with jumping load is more tendon-specific."
    },
    {
      "name": "Infrapatellar fat-pad irritation",
      "why": "Anterior pain with terminal extension may reflect fat-pad sensitivity."
    },
    {
      "name": "Early knee osteoarthritis",
      "why": "Bony changes and persistent morning stiffness alter the differential."
    }
  ],
  "Patellar tendinopathy": [
    {
      "name": "Patellofemoral pain",
      "why": "Diffuse peri-patellar pain with stairs and squats may differ from focal tendon loading."
    },
    {
      "name": "Quadriceps tendinopathy",
      "why": "Pain above the patella with tendon loading suggests a different structure."
    },
    {
      "name": "Infrapatellar fat-pad irritation",
      "why": "Terminal extension pain or fat-pad tenderness may be relevant."
    }
  ],
  "ACL injury": [
    {
      "name": "Meniscal tear",
      "why": "Twisting pain and swelling can overlap, but ligament laxity changes the priority."
    },
    {
      "name": "Medial collateral ligament sprain",
      "why": "Valgus injury and medial laxity suggest a different ligament."
    },
    {
      "name": "Traumatic patellar dislocation",
      "why": "A displacement episode can cause acute effusion and apprehension."
    }
  ],
  "Meniscal injury": [
    {
      "name": "ACL injury",
      "why": "Rapid effusion and a soft Lachman endpoint would raise cruciate ligament suspicion."
    },
    {
      "name": "Knee osteoarthritis",
      "why": "Degenerative changes can create similar pain and mechanical complaints."
    },
    {
      "name": "Osteochondral lesion",
      "why": "Traumatic joint surface injury can produce swelling and catching."
    }
  ],
  "MCL sprain": [
    {
      "name": "Medial meniscal injury",
      "why": "Joint-line tenderness and mechanical symptoms may favor a meniscal lesion."
    },
    {
      "name": "Pes anserine tendinopathy",
      "why": "Tenderness distal to the joint line can localize a different cause."
    },
    {
      "name": "ACL injury",
      "why": "Associated pivot trauma and anterior laxity warrant cruciate testing."
    }
  ],
  "Lateral ankle sprain": [
    {
      "name": "Lateral malleolar fracture",
      "why": "Bony tenderness and difficulty bearing weight require decision-rule screening."
    },
    {
      "name": "Syndesmotic ankle injury",
      "why": "Pain above the mortise with external rotation mechanism suggests the syndesmosis."
    },
    {
      "name": "Peroneal tendon injury",
      "why": "Posterolateral tendon pain or subluxation can resemble a lateral sprain."
    }
  ],
  "Syndesmotic ankle injury": [
    {
      "name": "Lateral ankle ligament sprain",
      "why": "Inversion injury with ATFL tenderness favors a more distal ligament."
    },
    {
      "name": "Fibular fracture",
      "why": "Bony tenderness after trauma requires fracture evaluation."
    },
    {
      "name": "Deltoid ligament injury",
      "why": "Medial tenderness and eversion/rotation mechanisms suggest medial structures."
    }
  ],
  "Achilles tendinopathy": [
    {
      "name": "Retrocalcaneal bursitis",
      "why": "Pain deep and anterior to the Achilles insertion may involve the bursa."
    },
    {
      "name": "Gastrocnemius strain",
      "why": "Sudden muscle-belly pain with a discrete event differs from chronic tendon loading."
    },
    {
      "name": "Plantar heel pain",
      "why": "Under-heel first-step pain localizes away from the posterior Achilles."
    }
  ],
  "Achilles rupture": [
    {
      "name": "Medial gastrocnemius tear",
      "why": "A sudden calf injury can resemble rupture but tendon continuity testing differs."
    },
    {
      "name": "Partial Achilles tendon tear",
      "why": "Residual tendon continuity may still need urgent specialist evaluation."
    },
    {
      "name": "Severe Achilles tendinopathy",
      "why": "Chronic tendon pain can be severe, but a sudden snap and loss of push-off suggest rupture."
    }
  ],
  "Plantar heel pain": [
    {
      "name": "Tarsal tunnel syndrome",
      "why": "Burning or tingling plantar symptoms may indicate neural entrapment."
    },
    {
      "name": "Heel fat-pad syndrome",
      "why": "Central heel pain with hard-surface compression can have a distinct pattern."
    },
    {
      "name": "Calcaneal stress fracture",
      "why": "Progressive bony pain with loading requires appropriate stress-injury screening."
    }
  ],
  "Septic arthritis concern": [
    {
      "name": "Crystal-induced acute arthritis",
      "why": "A crystal flare can mimic infection and still needs careful medical exclusion."
    },
    {
      "name": "Acute inflammatory arthritis",
      "why": "An inflamed joint may be noninfectious, but systemic illness increases urgency."
    },
    {
      "name": "Cellulitis with periarticular swelling",
      "why": "Soft-tissue infection may produce warmth and swelling around a joint."
    }
  ]
};
export function richerMskDiagnosisOptions(title:string,correctPosition:number){
 const alternatives=nuancedMskAlternatives[title];
 if(!alternatives)return null;
 let alternativeIndex=0;
 const names=Array.from({length:4},(_,i)=>i===correctPosition?title:alternatives[alternativeIndex++].name);
 return {names,alternatives};
}
