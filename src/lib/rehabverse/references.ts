/**
 * Evidence references for RehabVerse exercises. Only widely cited clinical practice guidelines and
 * studies are listed; the supervising physiotherapist should confirm each reference before relying
 * on it. An exercise lists the keys that support its use for the relevant condition.
 */
export type Reference = { key: string; text: string };

export const REFERENCES: Record<string, Reference> = {
  spruit2013: {
    key: "spruit2013",
    text: "Spruit MA, et al. An official American Thoracic Society/European Respiratory Society statement: key concepts and advances in pulmonary rehabilitation. Am J Respir Crit Care Med. 2013;188(8):e13–e64.",
  },
  dumoulin2018: {
    key: "dumoulin2018",
    text: "Dumoulin C, Cacciari LP, Hay-Smith EJC. Pelvic floor muscle training versus no treatment, or inactive control treatments, for urinary incontinence in women. Cochrane Database Syst Rev. 2018;10:CD005654.",
  },
  sherrington2019: {
    key: "sherrington2019",
    text: "Sherrington C, et al. Exercise for preventing falls in older people living in the community. Cochrane Database Syst Rev. 2019;1:CD012424.",
  },
  french2016: {
    key: "french2016",
    text: "French B, et al. Repetitive task training for improving functional ability after stroke. Cochrane Database Syst Rev. 2016;11:CD006073.",
  },
  veerbeek2014: {
    key: "veerbeek2014",
    text: "Veerbeek JM, et al. What is the evidence for physical therapy poststroke? A systematic review and meta-analysis. PLoS One. 2014;9(2):e87987.",
  },
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
  basson2017: {
    key: "basson2017",
    text: "Basson A, et al. The Effectiveness of Neural Mobilization for Neuromusculoskeletal Conditions: A Systematic Review and Meta-analysis. J Orthop Sports Phys Ther. 2017;47(9):593–615.",
  },
  mcgill2001: {
    key: "mcgill2001",
    text: "McGill SM. Low back stability: from formal description to issues for performance and rehabilitation. Exerc Sport Sci Rev. 2001;29(1):26–31.",
  },
  acsm2009: {
    key: "acsm2009",
    text: "American College of Sports Medicine. Position stand: Progression models in resistance training for healthy adults. Med Sci Sports Exerc. 2009;41(3):687–708.",
  },
};
