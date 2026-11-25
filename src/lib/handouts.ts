/**
 * Printable patient handouts (English and Roman Urdu). Short lines, simple words, and a "get help" box on every sheet.
 * These are general education for patients of physiotherapists: the treating clinician's own advice always comes first.
 * scripts/validate-handouts.ts checks that every line has both languages and that every sheet has warning signs.
 */
export type Bi = { en: string; ur: string };
export type HandoutSection = { heading: Bi; kind: "steps" | "bullets"; items: Bi[] };
export type Handout = {
  slug: string;
  title: Bi;
  forWhom: Bi;
  intro: Bi;
  sections: HandoutSection[];
  help: Bi[];
};

export const handouts: Handout[] = [
  {
    slug: "low-back-pain",
    title: { en: "Looking After Your Back", ur: "Apni Kamar ki Dekh-bhaal" },
    forWhom: { en: "For people with ordinary low back pain", ur: "Un logon ke liye jinhein aam kamar dard hai" },
    intro: {
      en: "Most back pain gets better in a few weeks. Moving gently is safe and helps you recover faster than resting in bed.",
      ur: "Zyada tar kamar dard kuch haftoon mein behtar ho jata hai. Aahista harkat mehfooz hai aur bistar par aaram se zyada jaldi theek karti hai.",
    },
    sections: [
      {
        heading: { en: "What helps", ur: "Kya madad karta hai" },
        kind: "bullets",
        items: [
          { en: "Keep walking a little, many times a day.", ur: "Din mein kai baar thora thora chalte rahein." },
          { en: "Change position often. Do not sit for a long time.", ur: "Position badalte rahein. Der tak na baithein." },
          { en: "A warm pack for 15 minutes can ease the muscles.", ur: "15 minute ke liye garam pack muscles ko aaram deta hai." },
          { en: "Go back to light work and normal tasks early.", ur: "Halke kaam aur aam kaamon par jaldi wapas aayein." },
          { en: "Sleep on your side with a pillow between your knees.", ur: "Karwat par soyein aur ghutnon ke beech takiya rakhein." },
        ],
      },
      {
        heading: { en: "Easy exercises (do each 10 times, 3 times a day)", ur: "Aasan exercises (har ek 10 baar, din mein 3 baar)" },
        kind: "steps",
        items: [
          { en: "Lie on your back with your knees bent. Slowly roll both knees to one side, then the other.", ur: "Peeth ke bal letein, ghutne modein. Dono ghutnon ko aahista ek taraf, phir doosri taraf lain." },
          { en: "Lie on your back. Pull one knee gently to your chest, then the other.", ur: "Peeth ke bal letein. Ek ghutna aahista seene ki taraf khainchein, phir doosra." },
          { en: "Lie on your back with your knees bent. Lift your hips a little, hold for 5 seconds, lower slowly.", ur: "Peeth ke bal letein, ghutne modein. Kulhay thora oopar uthayein, 5 second rokein, aahista neeche aayein." },
        ],
      },
    ],
    help: [
      { en: "You cannot pass urine or stool, or you do not feel it.", ur: "Peshab ya pakhana nahi hota, ya pata nahi chalta." },
      { en: "Numbness between your legs or in both legs.", ur: "Taangon ke beech ya dono taangon mein sunn hona." },
      { en: "Your leg is getting weaker.", ur: "Taang kamzor hoti ja rahi hai." },
      { en: "Fever, or pain that is worse at night and does not ease.", ur: "Bukhar, ya raat ko barhta dard jo kam na ho." },
      { en: "Pain after a fall or accident.", ur: "Girne ya hadse ke baad dard." },
    ],
  },
  {
    slug: "knee-osteoarthritis",
    title: { en: "Exercises for a Painful Knee (Arthritis)", ur: "Dardnak Knee ke liye Exercises (Arthritis)" },
    forWhom: { en: "For people with knee arthritis", ur: "Knee ki arthritis walon ke liye" },
    intro: {
      en: "Exercise is one of the best treatments for knee arthritis. It makes the knee stronger and less painful. A little ache while you exercise is normal.",
      ur: "Knee ki arthritis mein exercise behtareen ilajon mein se hai. Yeh knee ko mazboot aur kam dardnak banati hai. Exercise ke dauran thora dard normal hai.",
    },
    sections: [
      {
        heading: { en: "Do these 3 or 4 days a week", ur: "Haftay mein 3 ya 4 din karein" },
        kind: "steps",
        items: [
          { en: "Sit on a chair. Straighten one knee, hold for 5 seconds, lower slowly. 10 times each leg.", ur: "Kursi par baithein. Ek ghutna seedha karein, 5 second rokein, aahista neeche. Har taang 10 baar." },
          { en: "Stand up from a chair and sit down again slowly. 10 times. Use your hands only if you need to.", ur: "Kursi se khare hon aur aahista dobara baithein. 10 baar. Zaroorat ho tabhi haath istemal karein." },
          { en: "Stand holding a table. Rise onto your toes, then lower. 10 times.", ur: "Mez pakar kar khare hon. Ungliyon par uthein, phir neeche aayein. 10 baar." },
          { en: "Walk for 10 minutes, then a little longer each week.", ur: "10 minute chalein, phir har haftay thora zyada." },
        ],
      },
      {
        heading: { en: "Good to know", ur: "Jaanna ahem hai" },
        kind: "bullets",
        items: [
          { en: "Pain that settles within an hour after exercise is fine.", ur: "Exercise ke baad ek ghante mein thamne wala dard theek hai." },
          { en: "If the knee is hot and swollen, rest it for a day or two, then restart gently.", ur: "Knee garam aur soojha ho to ek do din aaram karein, phir aahista dobara shuru karein." },
          { en: "Losing a little weight takes pressure off the knee.", ur: "Thora wazan kam karna knee ka dabao kam karta hai." },
        ],
      },
    ],
    help: [
      { en: "The knee is red, very hot and swollen, and you have a fever.", ur: "Knee surkh, bohat garam aur soojha ho aur bukhar bhi ho." },
      { en: "You cannot put weight on the leg after a fall.", ur: "Girne ke baad taang par wazan nahi daal sakte." },
      { en: "The knee locks and will not straighten.", ur: "Knee lock ho jaye aur seedha na ho." },
      { en: "Calf pain with swelling, especially after a long journey.", ur: "Pindli mein dard aur sujan, khaas kar lambay safar ke baad." },
    ],
  },
  {
    slug: "knee-replacement",
    title: { en: "After Your Knee Replacement", ur: "Knee Replacement ke Baad" },
    forWhom: { en: "For the first weeks after the operation. Follow your surgeon's instructions first.", ur: "Operation ke pehle haftoon ke liye. Pehle apne surgeon ki hidayat par chalein." },
    intro: {
      en: "Walking and exercises start soon after the operation. Swelling and some pain are normal for weeks.",
      ur: "Operation ke jaldi baad chalna aur exercises shuru hote hain. Haftoon tak sujan aur thora dard normal hai.",
    },
    sections: [
      {
        heading: { en: "Exercises (several times a day)", ur: "Exercises (din mein kai baar)" },
        kind: "steps",
        items: [
          { en: "Lie down. Press the back of your knee into the bed and tighten the thigh. Hold 5 seconds. 10 times.", ur: "Letein. Ghutne ka peechla hissa bistar mein dabayein aur raan tight karein. 5 second rokein. 10 baar." },
          { en: "Lie down. Slide your heel towards your bottom to bend the knee, then slide it back. 10 times.", ur: "Letein. Eri ko kulhay ki taraf sarkayein taake ghutna mude, phir wapas. 10 baar." },
          { en: "Sit with your heel on a stool. Let the knee relax and straighten by itself for a few minutes.", ur: "Baithein, eri stool par rakhein. Ghutne ko dheela chhorein taake khud seedha ho, kuch minute." },
          { en: "Walk with your frame or sticks. Short walks, many times a day.", ur: "Frame ya chhariyon ke saath chalein. Chhote chakkar, din mein kai baar." },
        ],
      },
      {
        heading: { en: "Looking after yourself", ur: "Apni dekh-bhaal" },
        kind: "bullets",
        items: [
          { en: "Take your pain tablets before exercising.", ur: "Exercise se pehle dard ki goli lein." },
          { en: "Raise your leg to ease swelling.", ur: "Sujan ke liye taang oonchi rakhein." },
          { en: "Keep the wound clean and dry.", ur: "Zakhm saaf aur khushk rakhein." },
        ],
      },
    ],
    help: [
      { en: "Hot, red, swollen knee, fever or fluid from the wound.", ur: "Garam, surkh, soojha knee, bukhar ya zakhm se pani." },
      { en: "Hot, painful, swollen calf.", ur: "Garam, dardnak, soojhi hui pindli." },
      { en: "Chest pain or sudden breathlessness (call for emergency help).", ur: "Seene ka dard ya achanak saans ki tangi (emergency madad bulayein)." },
      { en: "The knee will not bend as it should after two weeks.", ur: "Do haftay baad bhi knee theek se nahi mudta." },
    ],
  },
  {
    slug: "hip-replacement",
    title: { en: "After Your Hip Replacement", ur: "Hip Replacement ke Baad" },
    forWhom: { en: "Follow your surgeon's written precautions first. Ask them if you are unsure.", ur: "Pehle surgeon ki likhi ehtiyatein maanein. Shak ho to unse poochhein." },
    intro: {
      en: "Most people walk the day after surgery. The new hip is strong, but the muscles around it need time to heal.",
      ur: "Zyada tar log surgery ke agle din chalte hain. Naya hip mazboot hai, magar iske gird muscles ko theek hone ka waqt chahiye.",
    },
    sections: [
      {
        heading: { en: "Protect your new hip (your surgeon may change these)", ur: "Naye hip ko bachayein (surgeon inhein badal sakte hain)" },
        kind: "bullets",
        items: [
          { en: "Do not bend your hip far past a right angle.", ur: "Hip ko seedhe zaviye se bohat zyada na modein." },
          { en: "Do not cross your legs.", ur: "Taangein cross na karein." },
          { en: "Do not turn your knee and foot inwards.", ur: "Ghutne aur pair ko andar ki taraf na ghumayein." },
          { en: "Use a raised seat and a reacher to pick up things.", ur: "Oonchi seat aur cheezein uthane ke liye reacher istemal karein." },
        ],
      },
      {
        heading: { en: "Exercises (3 times a day)", ur: "Exercises (din mein 3 baar)" },
        kind: "steps",
        items: [
          { en: "Lie down. Squeeze your buttocks together. Hold 5 seconds. 10 times.", ur: "Letein. Kulhay aapas mein dabayein. 5 second rokein. 10 baar." },
          { en: "Lie down. Slide your leg out to the side and back. 10 times.", ur: "Letein. Taang ko side mein sarkayein aur wapas. 10 baar." },
          { en: "Stand holding a table. Move your leg a little backwards and back. 10 times.", ur: "Mez pakar kar khare hon. Taang ko thora peechay le jayein aur wapas. 10 baar." },
          { en: "Walk short distances, many times a day.", ur: "Chhote faasle chalein, din mein kai baar." },
        ],
      },
    ],
    help: [
      { en: "Sudden severe hip pain, or your leg looks shorter or turned.", ur: "Achanak shadeed hip dard, ya taang chhoti ya mudi hui lage." },
      { en: "Hot, red wound, fever or fluid from the wound.", ur: "Garam, surkh zakhm, bukhar ya zakhm se pani." },
      { en: "Hot, painful, swollen calf.", ur: "Garam, dardnak, soojhi hui pindli." },
      { en: "Chest pain or sudden breathlessness (call for emergency help).", ur: "Seene ka dard ya achanak saans ki tangi (emergency madad bulayein)." },
    ],
  },
  {
    slug: "preventing-falls",
    title: { en: "Staying Steady: Preventing Falls", ur: "Mazboot Rahein: Girne se Bachao" },
    forWhom: { en: "For older adults and their families", ur: "Buzurgon aur un ke gharwalon ke liye" },
    intro: {
      en: "Falls are common but you can lower the risk. Strong legs, good balance and a safe home make a big difference.",
      ur: "Girna aam hai magar khatra kam kiya ja sakta hai. Mazboot taangein, achha balance aur mehfooz ghar bari farq daalte hain.",
    },
    sections: [
      {
        heading: { en: "Exercises (3 or more times a week). Stand near a sturdy table.", ur: "Exercises (haftay mein 3 ya zyada baar). Mazboot mez ke qareeb khare hon." },
        kind: "steps",
        items: [
          { en: "Stand up from a chair and sit down again. 10 times.", ur: "Kursi se khare hon aur dobara baithein. 10 baar." },
          { en: "Stand with your feet close together. Hold the table lightly. Count to 10.", ur: "Pair qareeb qareeb rakh kar khare hon. Mez halki si pakrein. 10 tak ginein." },
          { en: "Walk heel to toe along a wall. 10 steps.", ur: "Deewar ke saath eri se ungli milakar chalein. 10 qadam." },
          { en: "Stand on one leg near the table. 10 seconds each leg.", ur: "Mez ke qareeb ek taang par khare hon. Har taang 10 second." },
        ],
      },
      {
        heading: { en: "Make your home safer", ur: "Ghar mehfooz banayein" },
        kind: "bullets",
        items: [
          { en: "Remove loose rugs and clutter from the floor.", ur: "Dheelay qaleen aur farsh se saman hatayein." },
          { en: "Use good light, including at night.", ur: "Achhi roshni rakhein, raat ko bhi." },
          { en: "Put a rail or grab bar in the bathroom and on the stairs.", ur: "Ghusalkhane aur seedhiyon par rail ya pakarne ki rod lagayein." },
          { en: "Wear shoes with a firm sole. Avoid walking in socks.", ur: "Mazboot talwe wale joote pehnein. Sirf moze pehan kar na chalein." },
          { en: "Have your eyes and your medicines checked by a doctor.", ur: "Doctor se apni nazar aur dawaiyan check karwayein." },
        ],
      },
    ],
    help: [
      { en: "You hit your head and feel sleepy, sick or have a bad headache.", ur: "Sar par chot lagi aur neend, ulti ya shadeed sar dard ho." },
      { en: "You cannot stand up after a fall, or a limb looks wrong.", ur: "Girne ke baad khare nahi ho pa rahe, ya koi hissa ghalat lagta hai." },
      { en: "You fell for no clear reason, or you feel faint.", ur: "Be-wajah gire, ya behoshi jaisi kaifiyat mehsoos hui." },
    ],
  },
  {
    slug: "pelvic-floor",
    title: { en: "Pelvic Floor Exercises for Women", ur: "Khawateen ke liye Pelvic Floor Exercises" },
    forWhom: { en: "For leaking urine and for pregnancy and after birth", ur: "Peshab nikalne, aur hamal aur paidaish ke baad ke liye" },
    intro: {
      en: "The pelvic floor is a group of muscles that holds up the bladder and womb. Training them stops most leaks. Be patient: it takes about 3 months.",
      ur: "Pelvic floor muscles ka woh group hai jo mesana aur bachadani ko sahara deta hai. Inhein train karne se zyada tar leaking ruk jati hai. Sabar karein: takreeban 3 mahine lagte hain.",
    },
    sections: [
      {
        heading: { en: "How to do it", ur: "Kaise karein" },
        kind: "steps",
        items: [
          { en: "Sit or lie comfortably. Breathe normally.", ur: "Aaram se baithein ya letein. Normal saans lein." },
          { en: "Squeeze and lift inside as if you are holding back wind and stopping urine.", ur: "Andar se dabayein aur oopar khainchein jaise hawa aur peshab rok rahi hon." },
          { en: "Hold for 5 seconds, then let go fully for 5 seconds. Repeat 10 times.", ur: "5 second rokein, phir 5 second poori tarah chhor dein. 10 baar dohrayein." },
          { en: "Do this 3 times a day.", ur: "Din mein 3 baar karein." },
          { en: "Squeeze before you cough, sneeze or lift something.", ur: "Khansne, chheenkne ya wazan uthane se pehle dabayein." },
        ],
      },
      {
        heading: { en: "Tips", ur: "Mashware" },
        kind: "bullets",
        items: [
          { en: "Do not hold your breath. Do not squeeze your buttocks or thighs.", ur: "Saans na rokein. Kulhay ya raanein na dabayein." },
          { en: "Do not stop the flow of urine as an exercise.", ur: "Peshab ki dhaar rokne ko exercise na banayein." },
          { en: "After birth, start gently in the first weeks.", ur: "Paidaish ke baad pehle haftoon mein aahista shuru karein." },
        ],
      },
    ],
    help: [
      { en: "Blood in the urine, or a bulge in the vagina.", ur: "Peshab mein khoon, ya vagina mein ubhaar." },
      { en: "Pain, fever or heavy bleeding after birth.", ur: "Paidaish ke baad dard, bukhar ya bhari bleeding." },
      { en: "Pain in the calf, or sudden breathlessness.", ur: "Pindli mein dard, ya achanak saans ki tangi." },
      { en: "No improvement after 3 months.", ur: "3 mahine baad bhi koi behtari nahi." },
    ],
  },
  {
    slug: "carpal-tunnel",
    title: { en: "Numb Hands: Carpal Tunnel", ur: "Sunn Hath: Carpal Tunnel" },
    forWhom: { en: "For tingling in the thumb, index and middle fingers", ur: "Anguthay, shahadat aur beech ki ungli mein jhunjhunahat ke liye" },
    intro: {
      en: "The nerve at the wrist is being squeezed. Most mild cases get better with a night splint and a few changes.",
      ur: "Kalai par nerve dab rahi hai. Zyada tar halke kes night splint aur kuch tabdeeliyon se theek ho jate hain.",
    },
    sections: [
      {
        heading: { en: "What to do", ur: "Kya karein" },
        kind: "bullets",
        items: [
          { en: "Wear a wrist splint at night, with the wrist straight.", ur: "Raat ko kalai ka splint pehnein, kalai seedhi rakhein." },
          { en: "Take breaks from gripping, typing or sewing every 30 minutes.", ur: "Har 30 minute baad pakarne, typing ya silai se break lein." },
          { en: "Keep your wrist straight when you hold things.", ur: "Cheezein pakarte waqt kalai seedhi rakhein." },
          { en: "Shake or stretch your hand if it tingles.", ur: "Jhunjhunahat ho to hath jhatkein ya stretch karein." },
        ],
      },
      {
        heading: { en: "Nerve glide (5 times, twice a day)", ur: "Nerve glide (5 baar, din mein 2 baar)" },
        kind: "steps",
        items: [
          { en: "Make a fist. Then open your fingers and thumb wide.", ur: "Mutthi banayein. Phir ungliyan aur anguthha khol dein." },
          { en: "Bend your wrist back and move your thumb out, gently.", ur: "Kalai ko peechay modein aur anguthha bahar karein, aahista." },
          { en: "Return to a fist and relax. Stop if the tingling gets worse.", ur: "Mutthi par wapas aayein aur dheela hon. Jhunjhunahat barhe to ruk jayein." },
        ],
      },
    ],
    help: [
      { en: "The muscle at the base of your thumb is getting thin.", ur: "Anguthay ke base ka muscle patla ho raha hai." },
      { en: "The numbness is constant, or weakness is getting worse.", ur: "Sunn hona musalsal hai, ya kamzori barh rahi hai." },
      { en: "Both arms tingle and you also have neck pain or weak legs.", ur: "Dono bazu sunn hon aur gardan ka dard ya kamzor taangein bhi hon." },
      { en: "No better after 6 weeks.", ur: "6 haftay mein bhi behtari nahi." },
    ],
  },
  {
    slug: "ankle-sprain",
    title: { en: "Recovering From a Twisted Ankle", ur: "Mure Hue Ankle se Recovery" },
    forWhom: { en: "For a recent ankle sprain", ur: "Haali ankle moch ke liye" },
    intro: {
      en: "Most ankle sprains heal well. Protect the ankle for a short time, then start moving and loading it early.",
      ur: "Zyada tar ankle ki moch achhi tarah theek ho jati hai. Thori der ankle ko bachayein, phir jaldi harkat aur load shuru karein.",
    },
    sections: [
      {
        heading: { en: "First few days", ur: "Pehle kuch din" },
        kind: "bullets",
        items: [
          { en: "Rest from hard activity, but keep walking as much as pain allows.", ur: "Sakht activity se aaram, magar dard ke andar jitna ho chalte rahein." },
          { en: "Raise the foot when you sit. Use a bandage for support.", ur: "Baithte waqt pair oopar rakhein. Sahare ke liye patti istemal karein." },
          { en: "Ice for 10 minutes, with a cloth, can ease the pain.", ur: "Kapre ke saath 10 minute barf dard kam kar sakti hai." },
        ],
      },
      {
        heading: { en: "Exercises (3 times a day)", ur: "Exercises (din mein 3 baar)" },
        kind: "steps",
        items: [
          { en: "Draw the alphabet in the air with your big toe.", ur: "Bare anguthay se hawa mein alphabet likhein." },
          { en: "Sit and pull your foot up and push it down. 15 times.", ur: "Baithein aur pair ko oopar khainchein phir neeche dabayein. 15 baar." },
          { en: "Stand holding a table. Rise onto your toes. 10 times.", ur: "Mez pakar kar khare hon. Ungliyon par uthein. 10 baar." },
          { en: "Stand on the injured leg for 20 seconds near a table.", ur: "Mez ke qareeb zakhmi taang par 20 second khare hon." },
        ],
      },
    ],
    help: [
      { en: "You cannot take four steps, or the bone is tender to touch.", ur: "Chaar qadam nahi le sakte, ya haddi chhoone se dukhti hai." },
      { en: "The foot looks bent out of shape, or is numb, cold or pale.", ur: "Pair ka shakl bigra hua, ya sunn, thanda ya zard hai." },
      { en: "Pain above the ankle when you twist the foot.", ur: "Pair ghumane par ankle ke oopar dard." },
      { en: "Not much better after one to two weeks.", ur: "Ek do haftay baad bhi khaas behtari nahi." },
    ],
  },
  {
    slug: "neck-pain",
    title: { en: "Easing a Stiff, Painful Neck", ur: "Akhri aur Dardnak Gardan ko Aaram" },
    forWhom: { en: "For ordinary neck pain without arm weakness", ur: "Bazu ki kamzori ke baghair aam gardan dard ke liye" },
    intro: {
      en: "Most neck pain eases within a few weeks. Keep your neck moving gently and keep up your normal activities.",
      ur: "Zyada tar gardan dard kuch haftoon mein kam ho jata hai. Gardan ko aahista hilate rahein aur aam activities jaari rakhein.",
    },
    sections: [
      {
        heading: { en: "Gentle exercises (5 times each, every few hours)", ur: "Halki exercises (har ek 5 baar, har kuch ghante baad)" },
        kind: "steps",
        items: [
          { en: "Slowly turn your head to look over one shoulder, then the other.", ur: "Sar ko aahista ek kandhe ki taraf, phir doosre ki taraf ghumayein." },
          { en: "Slowly bring your ear towards your shoulder, one side then the other.", ur: "Kaan ko aahista kandhe ki taraf layein, ek taraf phir doosri." },
          { en: "Tuck your chin in gently, as if making a double chin. Hold 5 seconds.", ur: "Thori ko aahista andar karein jaise dohri thori banani ho. 5 second rokein." },
          { en: "Roll your shoulders backwards in slow circles.", ur: "Kandhon ko aahista peechay ki taraf gol ghumayein." },
        ],
      },
      {
        heading: { en: "Daily habits", ur: "Rozana ki aadatein" },
        kind: "bullets",
        items: [
          { en: "Take a movement break every 30 minutes if you sit at a desk.", ur: "Desk par baithte hon to har 30 minute baad harkat ka break lein." },
          { en: "Keep your screen at eye level.", ur: "Screen aankhon ki satah par rakhein." },
          { en: "A warm pack for 15 minutes can ease stiffness.", ur: "15 minute ka garam pack akhrapan kam kar sakta hai." },
        ],
      },
    ],
    help: [
      { en: "Weakness, numbness or tingling in your arm or hand that is getting worse.", ur: "Bazu ya hath mein kamzori, sunn hona ya jhunjhunahat jo barh rahi ho." },
      { en: "Trouble walking, balance problems or clumsy hands.", ur: "Chalne mein mushkil, balance ke masail ya hathon ka bhaddapan." },
      { en: "Pain after an accident or fall.", ur: "Hadse ya girne ke baad dard." },
      { en: "A sudden severe headache, fever, or pain that wakes you at night.", ur: "Achanak shadeed sar dard, bukhar, ya dard jo raat ko jagaye." },
    ],
  },
];

export const handoutBySlug = (slug: string) => handouts.find((h) => h.slug === slug);
