/**
 * The named techniques INSIDE a chapter, explained one by one: what each is, how to recognise when it is the one you want, and how it is
 * performed. Examples: the six distortions of the Fascial Distortion Model, the seven Spencer movements, the Maitland grades.
 * English and Roman Urdu are kept side by side. These are teaching summaries of how each method is commonly taught; hands-on skill needs
 * certified training, and the clinician always adjusts to the patient. A supervisor should review the protocols before clinical use.
 */
export type Bi = { en: string; ur: string };
export type ComponentItem = {
  name: string;
  /** A short tag shown on the card: the clue, the grade, the movement… */
  tag: Bi;
  what: Bi;
  /** How it is performed, as steps. */
  perform: { en: string[]; ur: string[] };
  /** What to watch for. */
  watch?: Bi;
};
export type ChapterComponents = { heading: Bi; intro: Bi; items: ComponentItem[] };

const b = (en: string, ur: string): Bi => ({ en, ur });

export const manualTherapyComponents: Record<string, ChapterComponents> = {
  "fascial-distortion-model": {
    heading: b("The six FDM techniques, one by one", "FDM ki chhe techniques, ek ek karke"),
    intro: b(
      "The model sorts pain into six proposed fascial distortions and pairs each with its own hands-on technique. Below: the clue that points to each, what it is meant to be, and how the technique is performed. These are the model's own ideas, not proven tissue facts, so always screen for red flags first and judge the result by what the patient can do afterwards.",
      "Model dard ko chhe proposed fascial distortions mein baantta hai aur har ek ki apni hands-on technique hai. Neeche: har ek ka clue, woh kya hai aur technique kaise ki jati hai. Yeh model ke apne ideas hain, proven tissue facts nahi, is liye pehle red flags screen karein aur result ko is se judge karein ke patient baad mein kya kar sakta hai.",
    ),
    items: [
      {
        name: "1 · Triggerband",
        tag: b("Clue: traces a line with a finger", "Clue: finger se ek line draw karta hai"),
        what: b("A proposed twist in a band of fascia that runs along a line of pull. Pain and tightness follow that line, often from one joint to another, and movement along the line is limited.", "Fascia ke band ka proposed twist jo khinchao ki line ke saath chalta hai. Dard aur tightness usi line par hoti hai, aksar ek joint se doosre tak, aur us line ki movement limited hoti hai."),
        perform: {
          en: ["Ask the patient to trace the painful line and mark its two ends.", "Place the thumb or fingertips at one end with firm pressure the patient can tolerate.", "Slide slowly along the band toward the other end, staying on the line, until the line feels smoother or tenderness drops.", "Retest the movement that was limited; repeat only if the change is clear."],
          ur: ["Patient se painful line trace karwayein aur uske dono ends mark karein.", "Ek end par thumb ya fingertips se firm pressure rakhein jo patient bardasht kar sake.", "Dheere dheere band ke saath doosre end ki taraf slide karein, line par hi rahein, jab tak line smooth na lage ya tenderness kam na ho.", "Jo movement limited thi use dobara test karein; sirf tab dohrayein jab change wazeh ho."],
        },
        watch: b("Firm pressure can bruise. Stay within tolerance and stop if pain spikes.", "Firm pressure se bruise ho sakta hai. Tolerance ke andar rahein aur pain achanak barhe to rok dein."),
      },
      {
        name: "2 · Herniated trigger point (HTP)",
        tag: b("Clue: points to one spot", "Clue: ek spot par ungli rakhta hai"),
        what: b("A proposed bulge of deeper tissue through a hole in a fascial layer. It feels like one small, very tender spot, often with a sharp or deep ache.", "Fascial layer ke hole se deeper tissue ke ubharne ka proposed concept. Yeh ek chhota, bohat tender spot mehsoos hota hai, aksar tez ya gehra dard."),
        perform: {
          en: ["Find the exact tender spot with the thumb.", "Press steadily over the spot in the direction the model teaches for 'returning' the tissue through the layer.", "Hold the pressure for the time you were trained to use, easing off as tenderness falls.", "Recheck the spot and the movement it limited."],
          ur: ["Thumb se bilkul sahi tender spot dhoondein.", "Spot par steady pressure dein us direction mein jo model tissue ko layer ke through wapas bhejne ke liye sikhata hai.", "Pressure utni der rakhein jitni training mein sikhayi gayi, tenderness kam hone par naram karein.", "Spot aur us se limited movement ko dobara check karein."],
        },
        watch: b("Very tender: warn the patient first and agree a stop signal.", "Bohat tender hota hai: pehle patient ko bataein aur rukne ka signal tay karein."),
      },
      {
        name: "3 · Continuum distortion",
        tag: b("Clue: deep pain at a joint after a sprain", "Clue: sprain ke baad joint mein gehra dard"),
        what: b("A proposed change in the transition zone where ligament or tendon fibres blend into bone. Typically described after a sprain or overload, with deep joint-line pain.", "Us transition zone mein proposed change jahan ligament ya tendon ke fibres bone mein mil jate hain. Aam taur par sprain ya overload ke baad, joint line mein gehre dard ke saath bayan hota hai."),
        perform: {
          en: ["Rule out fracture, instability and other red flags first.", "Locate the tender line where the ligament or tendon meets bone.", "Apply sustained firm thumb or finger pressure along that line, within tolerance.", "Retest range and pain; follow with graded movement and loading."],
          ur: ["Pehle fracture, instability aur doosre red flags rule out karein.", "Woh tender line dhoondein jahan ligament ya tendon bone se milta hai.", "Us line par tolerance ke andar sustained firm thumb ya finger pressure dein.", "Range aur pain dobara test karein; phir graded movement aur loading karwayein."],
        },
        watch: b("A recent injury needs a proper assessment before any firm technique.", "Taaza injury mein kisi bhi firm technique se pehle poora assessment zaroori hai."),
      },
      {
        name: "4 · Cylinder distortion",
        tag: b("Clue: wraps a hand around the limb", "Clue: limb ke gird haath lapetta hai"),
        what: b("Proposed coiled or tangled layers of fascia around a limb or body part. Described as a deep, tight, wrapped ache, sometimes with swelling or a feeling of fullness.", "Limb ya body part ke gird fascia ki layers ke coiled ya uljhe hone ka proposed concept. Gehra, tight, lipta hua dard, kabhi swelling ya bhari-pan ke saath."),
        perform: {
          en: ["Screen for clots, infection and circulation problems first; do not treat a hot, swollen, red limb.", "Wrap both hands around the part.", "Apply slow, firm strokes along its length, the hands moving in opposite directions as trained, to 'uncoil' the layers.", "Recheck movement, tightness and swelling; keep the dose small the first time."],
          ur: ["Pehle clot, infection aur circulation ke masail screen karein; garam, soojha hua, laal limb treat na karein.", "Dono haath part ke gird lapetein.", "Lambai ke rukh slow, firm strokes dein, haath training ke mutabiq ulti directions mein chalein, taake layers 'uncoil' hon.", "Movement, tightness aur swelling dobara check karein; pehli dafa dose chhoti rakhein."],
        },
        watch: b("Hot, red, swollen calf: think DVT and refer, do not treat.", "Garam, laal, soojhi hui pindli: DVT socheen aur refer karein, treat na karein."),
      },
      {
        name: "5 · Folding distortion",
        tag: b("Clue: pain catches as the joint moves", "Clue: joint hilne par dard atakta hai"),
        what: b("A proposed folding of fascial planes at a joint, so that movement is blocked, pinched or clicks, then eases once it passes the fold.", "Joint par fascial planes ke fold hone ka proposed concept, jis se movement ruk jati hai, pinch hoti hai ya click aati hai aur fold guzarne ke baad aasaan ho jati hai."),
        perform: {
          en: ["Find the painful point in the range where the joint catches.", "Take the joint gently to that point while the other hand supports it.", "In the model the fold is reversed with a brief, controlled joint technique; this is taught only on certified FDM courses, so this site does not teach the thrust itself.", "Retest the range and the catch."],
          ur: ["Range mein woh painful point dhoondein jahan joint atakta hai.", "Joint ko dheere us point tak le jayein jabke doosra haath support kare.", "Model mein fold ko ek mukhtasar, controlled joint technique se reverse kiya jata hai; yeh sirf certified FDM courses mein sikhayi jati hai, is liye yeh site thrust khud nahi sikhati.", "Range aur atakne ko dobara test karein."],
        },
        watch: b("Any thrust needs formal training, screening and consent.", "Koi bhi thrust formal training, screening aur consent maangta hai."),
      },
      {
        name: "6 · Tectonic fixation",
        tag: b("Clue: stiff, 'stuck', loss of glide", "Clue: akra hua, 'phansa hua', glide kam"),
        what: b("A proposed loss of gliding between fascial surfaces, often after rest, a cast or an injury. The picture is stiffness and restricted movement more than sharp pain.", "Fascial surfaces ke beech glide ka proposed khatam hona, aksar aaram, cast ya injury ke baad. Tez dard se zyada akrahat aur limited movement nazar aati hai."),
        perform: {
          en: ["Confirm there is no fracture or unhealed tissue.", "Press through the stuck area with the thumb pad, heel of the hand or forearm.", "While pressing, move the part (actively or passively) so the layers slide over each other.", "Retest the range; follow with active movement to keep it."],
          ur: ["Pakka karein ke fracture ya unhealed tissue nahi hai.", "Phansay hue hisse par thumb pad, hatheli ki heel ya forearm se pressure dein.", "Pressure ke saath part ko (active ya passive) hilayein taake layers ek doosre par slide karein.", "Range dobara test karein; phir isay barqarar rakhne ke liye active movement karwayein."],
        },
        watch: b("Not over an unhealed fracture, wound or fresh surgery.", "Unhealed fracture, zakhm ya taaza surgery par nahi."),
      },
    ],
  },

  "spencer-shoulder-sequence": {
    heading: b("The seven Spencer movements, in order", "Spencer ki saat movements, tarteeb se"),
    intro: b(
      "Patient side-lying with the stiff shoulder up. One hand steadies the shoulder girdle; the other guides the arm through each movement to a comfortable end, with a small rhythmic stretch there. Work gently, in the same order every time, and retest after the seventh.",
      "Patient side-lying, akra hua shoulder upar. Ek haath shoulder girdle ko steady rakhta hai; doosra haath arm ko har movement mein comfortable end tak le jata hai aur wahan chhoti rhythmic stretch deta hai. Narmi se, har dafa wahi tarteeb, aur saatvi ke baad retest karein.",
    ),
    items: [
      { name: "1 · Extension", tag: b("Arm goes back", "Arm peeche"), what: b("Takes the shoulder back into extension.", "Shoulder ko peeche extension mein le jata hai."), perform: { en: ["Let the arm hang forward a little.", "Move it back to the comfortable end.", "Add 2 or 3 small rhythmic stretches there."], ur: ["Arm ko thora agay latakne dein.", "Isay comfortable end tak peeche le jayein.", "Wahan 2 ya 3 chhoti rhythmic stretches dein."] } },
      { name: "2 · Flexion", tag: b("Elbow bent, arm forward and up", "Elbow bent, arm agay aur upar"), what: b("Lifts the arm forward and up with the elbow bent.", "Elbow bent rakh kar arm ko agay aur upar uthata hai."), perform: { en: ["Bend the elbow and support it.", "Raise the arm forward toward the head.", "Give small rhythmic stretches at the end."], ur: ["Elbow bend karein aur support dein.", "Arm ko agay sir ki taraf uthayein.", "End par chhoti rhythmic stretches dein."] } },
      { name: "3 · Circumduction with compression", tag: b("Small circles, joint pressed together", "Chhote circles, joint dabaya hua"), what: b("Makes slow circles while gently pressing the joint together.", "Joint ko narmi se dabate hue slow circles banata hai."), perform: { en: ["Hold the bent elbow.", "Press the arm gently into the socket.", "Draw slow circles both ways."], ur: ["Bent elbow pakdein.", "Arm ko narmi se socket ki taraf dabayein.", "Dono taraf slow circles banayein."] } },
      { name: "4 · Circumduction with traction", tag: b("Small circles, joint gently pulled", "Chhote circles, joint halka khincha hua"), what: b("The same circles, now with a gentle pull away from the socket.", "Wahi circles, ab socket se door halke khinchao ke saath."), perform: { en: ["Hold the arm and pull gently along its length.", "Keep the pull light and steady.", "Draw slow circles both ways."], ur: ["Arm pakdein aur lambai ke rukh halka kheinchein.", "Khinchao halka aur steady rakhein.", "Dono taraf slow circles banayein."] } },
      { name: "5 · Abduction", tag: b("Arm out to the side and up", "Arm side se upar"), what: b("Lifts the arm out to the side with the elbow bent.", "Elbow bent rakh kar arm ko side se uthata hai."), perform: { en: ["Support the bent elbow.", "Raise the arm out to the side to the comfortable end.", "Add small rhythmic stretches."], ur: ["Bent elbow ko support dein.", "Arm ko side se comfortable end tak uthayein.", "Chhoti rhythmic stretches dein."] } },
      { name: "6 · Adduction with internal rotation", tag: b("Hand toward the back", "Haath peeth ki taraf"), what: b("Brings the arm across and the hand toward the small of the back.", "Arm ko across aur haath ko kamar ki taraf le jata hai."), perform: { en: ["Place the patient's hand toward the lower back.", "Move gently to the comfortable end.", "Give small rhythmic stretches, never forcing."], ur: ["Patient ka haath kamar ki taraf rakhein.", "Narmi se comfortable end tak le jayein.", "Chhoti rhythmic stretches dein, zabardasti kabhi nahi."] } },
      { name: "7 · Traction and stretch", tag: b("Arm straight, gentle rhythmic pull", "Arm seedha, halka rhythmic khinchao"), what: b("Finishes with a gentle rhythmic pull along the arm, then retest.", "Aakhir mein arm ke rukh halka rhythmic khinchao, phir retest."), perform: { en: ["Hold the forearm with the arm straight.", "Apply a gentle, rhythmic pull.", "Retest reach, pain and function, then give exercises."], ur: ["Arm seedha rakh kar forearm pakdein.", "Halka rhythmic khinchao dein.", "Reach, pain aur function retest karein, phir exercises dein."] }, watch: b("Stop for sharp pain, numbness or a recent fracture or dislocation.", "Tez dard, sunn-pan ya recent fracture/dislocation par ruk jayein.") },
    ],
  },

  "pnf-manual-techniques": {
    heading: b("The PNF techniques, one by one", "PNF ki techniques, ek ek karke"),
    intro: b("Each technique answers a different problem: starting movement, control, flexibility or stability. Choose by the problem, not the name.", "Har technique ek alag masle ka jawab hai: movement shuru karna, control, flexibility ya stability. Naam se nahi, masle se chunein."),
    items: [
      { name: "Rhythmic initiation", tag: b("For slow starts and stiffness", "Slow shuruaat aur akrahat ke liye"), what: b("Moves from passive to active-assisted to light resisted movement, with a steady rhythm, to teach and start the movement.", "Passive se active-assisted aur phir halki resisted movement tak, steady rhythm ke saath, movement sikhane aur shuru karne ke liye."), perform: { en: ["Move the limb passively through the pattern while the patient listens.", "Ask the patient to join in (active-assisted).", "Add light resistance in the same rhythm."], ur: ["Limb ko pattern mein passive hilayein jabke patient sunta rahe.", "Patient se saath dene ko kahein (active-assisted).", "Usi rhythm mein halki resistance shamil karein."] } },
      { name: "Slow reversal", tag: b("Agonist then antagonist, no relaxing", "Agonist phir antagonist, bina relax kiye"), what: b("The patient pushes one way against resistance, then straight away the opposite way, with no rest between.", "Patient resistance ke khilaf ek taraf zor lagata hai, phir foran ulti taraf, beech mein aaram nahi."), perform: { en: ["Resist the movement in one direction.", "Switch at once to resist the opposite direction.", "Repeat smoothly for several cycles."], ur: ["Ek direction mein movement par resistance dein.", "Foran ulti direction mein resistance dein.", "Kai cycles tak smoothly dohrayein."] } },
      { name: "Hold-relax", tag: b("Isometric hold, relax, then gain range", "Isometric hold, relax, phir range barhao"), what: b("The patient holds the tight muscle isometrically at the limit, relaxes, and the new range is taken.", "Patient tight muscle ko limit par isometric hold karta hai, relax karta hai, aur nayi range li jati hai."), perform: { en: ["Take the muscle to the first point of limit.", "Ask for a gentle isometric hold for 5 to 10 seconds.", "Ask the patient to relax fully, then move into the new range."], ur: ["Muscle ko pehli limit tak le jayein.", "5 se 10 second halka isometric hold karwayein.", "Patient ko poora relax karwayein, phir nayi range mein jayein."] } },
      { name: "Contract-relax", tag: b("Isotonic contraction of the tight muscle", "Tight muscle ka isotonic contraction"), what: b("Like hold-relax, but the tight muscle contracts through a small range against resistance before relaxing.", "Hold-relax jaisa, lekin tight muscle relax se pehle chhoti range mein resistance ke khilaf contract karta hai."), perform: { en: ["Take the muscle to its limit.", "Resist a gentle contraction that moves through a small range.", "Relax, then take the new range."], ur: ["Muscle ko limit tak le jayein.", "Halka contraction resist karein jo chhoti range mein chalta hai.", "Relax karwayein, phir nayi range lein."] } },
      { name: "Rhythmic stabilization", tag: b("Alternating holds, no movement", "Baari baari holds, movement nahi"), what: b("Alternating isometric holds of opposing muscle groups, with no movement, to build stability.", "Muqabil muscle groups ki baari baari isometric holds, movement ke baghair, stability banane ke liye."), perform: { en: ["Place the limb in the working position.", "Ask the patient to hold against resistance one way, then the other, without moving.", "Keep the rhythm steady for 20 to 30 seconds."], ur: ["Limb ko working position mein rakhein.", "Patient ko ek taraf phir doosri taraf resistance ke khilaf, bina hile hold karwayein.", "20 se 30 second rhythm steady rakhein."] } },
    ],
  },

  "muscle-energy-technique": {
    heading: b("The muscle energy methods, one by one", "Muscle energy ke tareeqay, ek ek karke"),
    intro: b("All use the patient's own gentle contraction against a precise counterforce. They differ in which muscle contracts.", "Sab patient ke apne halke contraction ko ek durust counterforce ke khilaf use karte hain. Farq yeh hai ke kaunsa muscle contract karta hai."),
    items: [
      { name: "Post-isometric relaxation (PIR)", tag: b("The tight muscle contracts", "Tight muscle contract karta hai"), what: b("The patient gently contracts the tight muscle, then relaxes, and the stretch is taken further.", "Patient tight muscle ko narmi se contract karta hai, phir relax, aur stretch aur aagay li jati hai."), perform: { en: ["Find the first barrier.", "Ask for about 10 to 20 percent effort for 5 to 10 seconds.", "On relaxation, take the stretch to the new barrier; repeat 3 to 5 times."], ur: ["Pehli rukawat (barrier) dhoondein.", "Takreeban 10 se 20 percent zor 5 se 10 second dein.", "Relax hone par stretch nayi rukawat tak lein; 3 se 5 dafa dohrayein."] } },
      { name: "Reciprocal inhibition (RI)", tag: b("The opposite muscle contracts", "Muqabil muscle contract karta hai"), what: b("The patient contracts the muscle on the opposite side of the joint, which lets the tight muscle relax.", "Patient joint ke doosri taraf ka muscle contract karta hai, jis se tight muscle relax hota hai."), perform: { en: ["Take the tight muscle to the barrier.", "Ask the patient to gently push into the direction of the stretch.", "Relax, and take up the new range."], ur: ["Tight muscle ko barrier tak le jayein.", "Patient se stretch ki direction mein narmi se zor lagwayein.", "Relax karwayein aur nayi range lein."] } },
      { name: "Isotonic eccentric (isolytic)", tag: b("The therapist overcomes a contraction", "Therapist contraction par qabu pata hai"), what: b("The patient contracts while the therapist slowly moves the limb the other way. Strong, so used with care and only with training.", "Patient contract karta hai jabke therapist limb ko slowly ulti taraf hilata hai. Taqatwar hai, is liye ehtiyat aur training ke saath."), perform: { en: ["Screen first for tissue that cannot take load.", "Let the patient contract gently while you slowly move against it.", "Keep the force light and stop for any sharp pain."], ur: ["Pehle ghalat load na le sakne wale tissue ko screen karein.", "Patient narmi se contract kare aur aap slowly uske khilaf hilayein.", "Force halki rakhein aur tez dard par rukein."] }, watch: b("Not for recent tears or inflamed tissue.", "Recent tears ya inflamed tissue mein nahi.") },
    ],
  },

  "maitland-joint-mobilization": {
    heading: b("The Maitland grades, one by one", "Maitland ke grades, ek ek karke"),
    intro: b("A grade is a pairing of how big the movement is and where in the range it happens. Pick the grade from pain, irritability and stiffness, then reassess.", "Grade yeh batata hai ke movement kitni badi hai aur range ke kis hisse mein hoti hai. Grade dard, irritability aur stiffness dekh kar chunein, phir reassess karein."),
    items: [
      { name: "Grade I", tag: b("Small movement at the start of range", "Range ke shuru mein chhoti movement"), what: b("Small oscillations at the very start of the range. For pain and high irritability.", "Range ke bilkul shuru mein chhoti oscillations. Dard aur zyada irritability ke liye."), perform: { en: ["Position the joint in a comfortable resting position.", "Oscillate gently, well before any resistance.", "Retest the comparable sign."], ur: ["Joint ko aaramdeh resting position mein rakhein.", "Kisi bhi resistance se kafi pehle narmi se oscillate karein.", "Comparable sign dobara test karein."] } },
      { name: "Grade II", tag: b("Large movement within the range", "Range ke andar badi movement"), what: b("Large oscillations that stay inside the free range and do not reach resistance. For pain.", "Badi oscillations jo free range ke andar rehti hain aur resistance tak nahi pohanchtin. Dard ke liye."), perform: { en: ["Move through a bigger arc.", "Stay short of resistance throughout.", "Reassess the pain and range."], ur: ["Badi arc mein movement dein.", "Poore waqt resistance se pehle rahein.", "Pain aur range reassess karein."] } },
      { name: "Grade III", tag: b("Large movement into resistance", "Resistance mein badi movement"), what: b("Large oscillations that go into the resistance and the tissue limit. For stiffness.", "Badi oscillations jo resistance aur tissue limit mein jati hain. Stiffness ke liye."), perform: { en: ["Take the movement firmly up to the limit.", "Oscillate into the resistance.", "Watch the patient's response and retest."], ur: ["Movement ko limit tak mazbooti se lein.", "Resistance mein oscillate karein.", "Patient ka response dekhein aur retest karein."] } },
      { name: "Grade IV", tag: b("Small movement at the limit", "Limit par chhoti movement"), what: b("Small oscillations at the limit of the range. For stiffness where only the end range is tight.", "Range ki limit par chhoti oscillations. Us stiffness ke liye jahan sirf end range tight ho."), perform: { en: ["Go to the limit.", "Use small, firm oscillations there.", "Retest and avoid provoking pain."], ur: ["Limit tak jayein.", "Wahan chhoti, mazboot oscillations dein.", "Retest karein aur dard provoke na karein."] } },
      { name: "Grade V", tag: b("Small, fast thrust at the end", "End par chhota, tez thrust"), what: b("A small, fast thrust at the end of range (manipulation). Needs specific training and screening.", "Range ke end par chhota, tez thrust (manipulation). Khaas training aur screening maangta hai."), perform: { en: ["Screen for red flags and obtain consent.", "Take up all the slack.", "Deliver the small, fast movement as trained."], ur: ["Red flags screen karein aur consent lein.", "Saari slack le lein.", "Training ke mutabiq chhoti, tez movement dein."] }, watch: b("Only with formal training; do not use in an irritable joint.", "Sirf formal training ke saath; irritable joint mein nahi.") },
    ],
  },

  "kaltenborn-evjenth-mobilization": {
    heading: b("The three traction grades and the glide", "Teen traction grades aur glide"),
    intro: b("Traction is a pull that separates the joint surfaces; the glide slides one surface along the other. The grade says how much load.", "Traction woh khinchao hai jo joint surfaces ko alag karta hai; glide ek surface ko doosri ke saath slide karta hai. Grade batata hai kitna load."),
    items: [
      { name: "Grade I · loosen", tag: b("No stress on the joint", "Joint par koi stress nahi"), what: b("A very small pull that cancels the normal pressure between the joint surfaces. No stretch. Used for pain.", "Bohat chhota khinchao jo joint surfaces ke beech normal pressure khatam karta hai. Stretch nahi. Dard ke liye."), perform: { en: ["Position the joint in resting position.", "Apply a very light pull.", "Hold or oscillate gently."], ur: ["Joint ko resting position mein rakhein.", "Bohat halka khinchao dein.", "Narmi se hold ya oscillate karein."] } },
      { name: "Grade II · tighten", tag: b("Takes up the slack", "Slack le leta hai"), what: b("Pulls until the slack in the capsule and surrounding tissue is taken up. The first sense of resistance.", "Tab tak khinchta hai jab tak capsule aur aas paas ke tissue ki slack khatam na ho. Pehli resistance mehsoos hoti hai."), perform: { en: ["Add pull until you feel the slack come out.", "Stop at the first resistance.", "Hold for a few seconds, then ease."], ur: ["Khinchao barhayein jab tak slack nikalti mehsoos ho.", "Pehli resistance par ruk jayein.", "Kuch second hold karein, phir narm karein."] } },
      { name: "Grade III · stretch", tag: b("Stretches the tight tissue", "Tight tissue ko stretch karta hai"), what: b("Pulls beyond the slack to stretch the tight capsule and ligaments. Used for stiffness.", "Slack se aagay kheench kar tight capsule aur ligaments ko stretch karta hai. Stiffness ke liye."), perform: { en: ["Take up the slack first.", "Add pull into the resistance.", "Hold for a short time and retest."], ur: ["Pehle slack nikalein.", "Resistance mein khinchao barhayein.", "Thori der hold karein aur retest karein."] } },
      { name: "The glide", tag: b("Slides one surface along the other", "Ek surface ko doosri par slide"), what: b("A slide of one joint surface along the other, in the direction the joint shape suggests, to restore gliding.", "Ek joint surface ka doosri par slide, us direction mein jo joint ki shape batati hai, glide wapas laane ke liye."), perform: { en: ["Stabilise one bone.", "Take up the slack with traction.", "Glide the other bone in the treatment direction."], ur: ["Ek bone ko stabilise karein.", "Traction se slack nikalein.", "Doosri bone ko treatment direction mein glide karein."] } },
    ],
  },

  "mulligan-snags-nags": {
    heading: b("SNAG, NAG and self-SNAG, one by one", "SNAG, NAG aur self-SNAG, ek ek karke"),
    intro: b("All three glide a spinal facet along its own plane. The difference is whether the patient moves actively, and who does the work.", "Teeno spinal facet ko uske apne plane par glide karte hain. Farq yeh hai ke patient active move karta hai ya nahi, aur kaam kaun karta hai."),
    items: [
      { name: "SNAG", tag: b("Sustained glide while the patient moves", "Patient ke hilte waqt sustained glide"), what: b("A sustained glide along the facet while the patient actively makes the painful or stiff movement. It must be pain-free.", "Facet ke saath sustained glide jabke patient active taur par dardnak ya akri hui movement karta hai. Pain-free hona zaroori hai."), perform: { en: ["Find the level and the facet plane.", "Hold the glide with the thumb or a belt.", "Ask the patient to make the movement and repeat 6 to 10 times."], ur: ["Level aur facet plane dhoondein.", "Thumb ya belt se glide hold karein.", "Patient se movement karwayein aur 6 se 10 dafa dohrayein."] }, watch: b("Stop for dizziness, nausea or pain.", "Chakkar, matli ya dard par rukein.") },
      { name: "NAG", tag: b("Oscillating glide, patient relaxed", "Oscillating glide, patient relaxed"), what: b("A gentle rhythmic glide along the facet with the patient sitting and relaxed, usually in the neck and upper back.", "Facet ke saath narm rhythmic glide jabke patient baitha aur relaxed ho, aam taur par gardan aur upar ki peeth mein."), perform: { en: ["Sit the patient comfortably.", "Apply the glide with the thumbs on the facet.", "Oscillate gently for a few repetitions and retest."], ur: ["Patient ko aaram se bithayein.", "Thumbs se facet par glide dein.", "Chand dafa narmi se oscillate karein aur retest karein."] }, watch: b("Check dizziness and neurological signs first.", "Pehle chakkar aur neurological signs check karein.") },
      { name: "Self-SNAG", tag: b("The patient does it alone", "Patient khud karta hai"), what: b("The patient applies the glide with a towel, strap or hand and moves actively, as home practice once the clinician has shown the technique.", "Patient towel, strap ya haath se glide lagata hai aur active move karta hai, ghar ki practice ke taur par jab clinician technique dikha chuka ho."), perform: { en: ["Learn the exact position with the therapist.", "Apply the glide with the strap or hand.", "Move actively, a few repetitions, only if pain-free."], ur: ["Therapist ke saath durust position seekhein.", "Strap ya haath se glide lagayein.", "Active move karein, chand dafa, sirf agar pain-free ho."] } },
    ],
  },

  "neurodynamic-mobilization": {
    heading: b("Sliders and tensioners", "Sliders aur tensioners"),
    intro: b("Both move a nerve; they differ in how much strain they add. Choose by how irritable the nerve is.", "Dono nerve ko hilate hain; farq yeh hai ke kitna strain barhate hain. Nerve ki irritability dekh kar chunein."),
    items: [
      { name: "Slider", tag: b("One end loads, the other eases", "Ek end load, doosra naram"), what: b("One end of the nerve bed lengthens while the other shortens, so the nerve glides with little added strain. First choice for an irritable nerve.", "Nerve bed ka ek end lamba hota hai jabke doosra chhota, taake nerve kam strain ke saath glide kare. Irritable nerve ke liye pehli pasand."), perform: { en: ["Place the limb in the starting position.", "Move one joint to lengthen the nerve while another joint moves to shorten it.", "Repeat smoothly 10 to 15 times, symptoms mild."], ur: ["Limb ko starting position mein rakhein.", "Ek joint nerve ko lamba karne ke liye hilayein jabke doosra chhota karne ke liye.", "Smoothly 10 se 15 dafa dohrayein, symptoms halke."] } },
      { name: "Tensioner", tag: b("Both ends lengthen", "Dono ends lambe"), what: b("Both ends lengthen together, adding strain to the nerve. For a less irritable nerve, later in recovery.", "Dono ends ek saath lambe hote hain, jis se nerve par strain barhta hai. Kam irritable nerve ke liye, recovery mein baad mein."), perform: { en: ["Place the limb in the starting position.", "Move the joints so the nerve lengthens from both ends.", "Hold briefly, mild symptoms only, and ease off."], ur: ["Limb ko starting position mein rakhein.", "Joints ko is tarah hilayein ke nerve dono ends se lamba ho.", "Thori der hold karein, sirf halke symptoms, phir naram karein."] }, watch: b("Stop for sharp pain, pins and needles that linger or new weakness.", "Tez dard, der tak rehne wali jhunjhunahat ya nayi kamzori par rukein.") },
    ],
  },

  "myofascial-release": {
    heading: b("Direct and indirect release", "Direct aur indirect release"),
    intro: b("Both load fascia slowly and wait for it to change. They differ in which way you go.", "Dono fascia par slowly load daalte hain aur badalne ka intezar karte hain. Farq yeh hai ke aap kis taraf jate hain."),
    items: [
      { name: "Direct release", tag: b("Into the restriction", "Rukawat ki taraf"), what: b("Slow, sustained load into the barrier, waiting for the tissue to soften.", "Barrier ki taraf slow, sustained load, tissue ke naram hone ka intezar."), perform: { en: ["Find the restricted layer and make a broad, soft contact.", "Sink in slowly to the first barrier.", "Hold with steady pressure for 90 to 120 seconds until it softens, then follow the release."], ur: ["Restricted layer dhoondein aur chora, naram contact banayein.", "Dheere dheere pehle barrier tak jayein.", "90 se 120 second steady pressure se hold karein jab tak naram na ho, phir release ko follow karein."] } },
      { name: "Indirect release", tag: b("Toward the ease", "Aasani ki taraf"), what: b("Guides the tissue the way it moves easily, then waits for the tissue to let go.", "Tissue ko us taraf le jata hai jahan woh aasani se hilta hai, phir tissue ke chhorne ka intezar."), perform: { en: ["Find the direction in which the tissue moves most freely.", "Hold it there in the position of ease.", "Wait, following small changes, until it releases."], ur: ["Woh direction dhoondein jis mein tissue sab se aazadi se hilta hai.", "Isay wahan position of ease mein hold karein.", "Intezar karein, chhoti tabdeeliyon ko follow karte hue, jab tak release na ho."] } },
    ],
  },

  "mckenzie-mdt": {
    heading: b("The three McKenzie problems", "McKenzie ke teen masle"),
    intro: b("McKenzie sorts mechanical spine pain into three syndromes. Each is found with repeated movements and handled differently.", "McKenzie mechanical spine pain ko teen syndromes mein baantta hai. Har ek repeated movements se dhoondi jati hai aur alag tareeqe se handle hoti hai."),
    items: [
      { name: "Derangement", tag: b("Pain moves toward the centre with one direction", "Ek direction se dard center ki taraf"), what: b("Pain changes with repeated movement, and one direction centralises it (pulls it toward the spine). That direction becomes the exercise.", "Repeated movement se dard badalta hai, aur ek direction use centralise karti hai (spine ki taraf khinchti hai). Wahi direction exercise ban jati hai."), perform: { en: ["Test repeated movements one direction at a time.", "Find the direction that centralises or reduces the pain.", "Repeat that direction often, with a plan to maintain posture."], ur: ["Repeated movements ek ek direction mein test karein.", "Woh direction dhoondein jo dard ko centralise ya kam karti hai.", "Wahi direction aksar dohrayein aur posture barqarar rakhne ka plan banayein."] } },
      { name: "Dysfunction", tag: b("Pain only at the end of one movement", "Sirf ek movement ke end par dard"), what: b("Pain appears only when a shortened tissue is stretched at the end of range, and stops when the stretch is released.", "Dard tab aata hai jab chhota hua tissue range ke end par stretch hota hai, aur stretch chhorne par ruk jata hai."), perform: { en: ["Find the end-range movement that reproduces the pain.", "Repeat that movement to the point of mild discomfort.", "Do it often; the tissue remodels over weeks."], ur: ["Woh end-range movement dhoondein jo dard dohrati hai.", "Halki takleef tak us movement ko dohrayein.", "Aksar karein; tissue hafton mein remodel hota hai."] } },
      { name: "Postural", tag: b("Pain from sustained end positions", "Der tak end position se dard"), what: b("Pain only comes from holding an end position for a long time, and goes when the posture changes. Movements themselves are normal.", "Dard sirf ek end position der tak rakhne se aata hai, aur posture badalne par chala jata hai. Movements khud normal hoti hain."), perform: { en: ["Show the position that provokes the pain.", "Correct the posture and the pain eases.", "Teach regular breaks and posture changes."], ur: ["Woh position dikhayein jo dard paida karti hai.", "Posture theek karein to dard kam hota hai.", "Waqfa aur posture ki tabdeeli ki aadat sikhayein."] } },
    ],
  },
};
