/**
 * Evidence references for RehabVerse exercises. Only widely cited clinical practice guidelines and
 * studies are listed; the supervising physiotherapist should confirm each reference before relying
 * on it. An exercise lists the keys that support its use for the relevant condition.
 */
export type Reference = { key: string; text: string };

export const REFERENCES: Record<string, Reference> = {
  blanpied2017: {
    key: "blanpied2017",
    text: "Blanpied PR, et al. Neck Pain: Revision 2017. Clinical Practice Guidelines. J Orthop Sports Phys Ther. 2017;47(7):A1–A83.",
  },
  george2021: {
    key: "george2021",
    text: "George SZ, et al. Interventions for the Management of Acute and Chronic Low Back Pain: Revision 2021. J Orthop Sports Phys Ther. 2021;51(11):CPG1–CPG60.",
  },
  willy2019: {
    key: "willy2019",
    text: "Willy RW, et al. Patellofemoral Pain: Revision 2019. Clinical Practice Guidelines. J Orthop Sports Phys Ther. 2019;49(9):CPG1–CPG95.",
  },
  logerstedt2018: {
    key: "logerstedt2018",
    text: "Logerstedt DS, et al. Knee Pain and Mobility Impairments: Meniscal and Articular Cartilage Lesions Revision 2018. J Orthop Sports Phys Ther. 2018;48(2):A1–A50.",
  },
  martin2018: {
    key: "martin2018",
    text: "Martin RL, et al. Achilles Pain, Stiffness, and Muscle Power Deficits: Midportion Achilles Tendinopathy Revision 2018. J Orthop Sports Phys Ther. 2018;48(5):A1–A38.",
  },
  martin2021: {
    key: "martin2021",
    text: "Martin RL, et al. Ankle Stability and Movement Coordination Impairments: Lateral Ankle Ligament Sprains Revision 2021. J Orthop Sports Phys Ther. 2021;51(4):CPG1–CPG80.",
  },
  cibulka2017: {
    key: "cibulka2017",
    text: "Cibulka MT, et al. Hip Pain and Mobility Deficits—Hip Osteoarthritis: Revision 2017. J Orthop Sports Phys Ther. 2017;47(6):A1–A37.",
  },
  kelley2013: {
    key: "kelley2013",
    text: "Kelley MJ, et al. Shoulder Pain and Mobility Deficits: Adhesive Capsulitis. J Orthop Sports Phys Ther. 2013;43(5):A1–A31.",
  },
  alfredson1998: {
    key: "alfredson1998",
    text: "Alfredson H, et al. Heavy-load eccentric calf muscle training for the treatment of chronic Achilles tendinosis. Am J Sports Med. 1998;26(3):360–366.",
  },
  tyler2010: {
    key: "tyler2010",
    text: "Tyler TF, et al. Addition of isolated wrist extensor eccentric exercise to standard treatment for chronic lateral epicondylosis: a prospective randomized trial. J Shoulder Elbow Surg. 2010;19(6):917–922.",
  },
  thomee1997: {
    key: "thomee1997",
    text: "Thomeé R. A comprehensive treatment approach for patellofemoral pain syndrome in young women. Phys Ther. 1997;77(12):1690–1703. (Pain-monitoring model.)",
  },
  silbernagel2007: {
    key: "silbernagel2007",
    text: "Silbernagel KG, et al. Continued sports activity, using a pain-monitoring model, during rehabilitation in patients with Achilles tendinopathy. Am J Sports Med. 2007;35(6):897–906.",
  },
  smith2017: {
    key: "smith2017",
    text: "Smith BE, et al. Should exercises be painful in the management of chronic musculoskeletal pain? A systematic review and meta-analysis. Br J Sports Med. 2017;51(23):1679–1687.",
  },
  wehbe1985: {
    key: "wehbe1985",
    text: "Wehbé MA, Hunter JM. Flexor tendon gliding in the hand. Part I. In vivo excursions. J Hand Surg Am. 1985;10(4):570–574.",
  },
  acsm2009: {
    key: "acsm2009",
    text: "American College of Sports Medicine. Position stand: Progression models in resistance training for healthy adults. Med Sci Sports Exerc. 2009;41(3):687–708.",
  },
};
