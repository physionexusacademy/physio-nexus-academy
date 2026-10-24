import type { TechniqueUrduContent } from "@/components/manual-therapy/UnderstandThisTechnique";

/**
 * Roman Urdu translation is stored separately so published English source text stays untouched.
 * Keep examples explicitly labelled and do not present them as evidence or prescriptions.
 */
export const manualTherapyUrduContent: Record<string, TechniqueUrduContent> = {
  "maitland-joint-mobilization": {
    short: "Maitland Joint Mobilization mein therapist joint ko patient ki taraf se relax halat mein chhoti, narm aur rhythm ke sath aagay-peechay harkat deta hai. Harkat ka grade patient ke dard, sensitivity aur stiffness ke mutabiq chuna jata hai. Maqsad sirf joint ko move karna nahi, balkay dekhna hai ke patient ki asal takleef wali movement ya function mein behtari aati hai ya nahi.",
    details: [
      { heading: "Yeh technique kya hai?", text: "Is approach mein therapist joint ki passive movement karta hai, yani patient apni muscles se movement produce nahi karta. Maitland grades movement ki amplitude aur joint ke range mein us ki position ko describe karte hain. Chhoti oscillations pain-dominant ya zyada sensitive presentation mein use ki ja sakti hain; bari aur resistance ke qareeb oscillations stiffness-dominant presentation mein consider ki ja sakti hain. Grade ka faisla sirf naam ya diagnosis se nahi, patient ki halat aur response se hota hai." },
      { heading: "Comparable sign aur reassessment", text: "Comparable sign woh movement ya activity hai jo patient ki pehchani hui takleef ko dikhati hai—misal ke taur par gardan ghumane par dard ya shoulder uthane mein rukawat. Treatment se pehle isay note karein, phir technique ke baad dobara check karein. Agar meaningful behtari na ho, to wahi technique bas aadat ki wajah se jari na rakhein; apni clinical reasoning dobara dekhein." },
      { heading: "Grades ko asaan alfaaz mein samjhein", text: "Grades I–II aam tor par chhoti amplitude ki oscillations hoti hain aur pain-sensitive halat mein consider ki ja sakti hain. Grades III–IV mein movement zyada range tak jati hai aur stiffness ko target karne ke liye consider hoti hai, jab patient ki irritability munasib ho. Yeh rigid rule nahi; dose aur grade ko patient ke symptoms, safety aur response ke mutabiq adjust karna hota hai." },
      { heading: "Misal — sirf samjhane ke liye", text: "Farz karein ek patient ko shoulder upar uthate waqt dard aur restriction hoti hai. Therapist pehle us movement ki range aur dard note karta hai. Agar assessment ke baad gentle mobilization ka trial munasib samjha jaye, to therapist usay apply karke shoulder elevation dobara check karta hai. Yeh fictional teaching example hai, kisi patient ke liye treatment recommendation ya guaranteed outcome nahi." },
      { heading: "Yaad rakhne wali baat", text: "Manual mobilization ko active movement aur rehabilitation ka badal na banayein. Agar symptoms tezi se barhein, naye neurological signs hon, ya response ghair-mamooli ho, to technique rok kar presentation ko dobara assess karein. Fracture, instability, infection ya doosri serious concern ka shak ho to routine mobilization se pehle appropriate medical assessment zaroori hai." }
    ]
  }
};
