import type {CaseStory} from "./case-lab-story";
import type {CaseLearningGuide} from "./case-lab-learning";

/**
 * Narrative scaffolding, not new clinical evidence.
 * Never assert a measured result, treatment response, new symptom, vital sign,
 * date or outcome that the existing teaching case does not provide.
 */
export type ClinicalEpisode={
  act:string;
  sceneTitle:string;
  narrative:string[];
  tension:string;
  question:string;
  insight:string;
  moment:string;
};

const settings:Record<string,string>={
 "MSK & Sports":"in a movement-focused rehabilitation consultation",
 "Neurological Rehabilitation":"during a rehabilitation review focused on everyday movement",
 "Pediatric Rehabilitation":"in a child- and caregiver-centered consultation",
 "Cardiopulmonary Rehabilitation":"in a medically coordinated rehabilitation setting",
 "Geriatrics & Falls":"during a discussion about safe mobility and independence",
 "Vestibular Rehabilitation":"during an assessment of dizziness and balance",
 "Pelvic Health":"in a private, consent-led rehabilitation consultation",
 "Oncology Rehabilitation":"in a rehabilitation visit coordinated with the cancer-care team",
 "Critical Care & ICU":"with the hospital team checking rehabilitation readiness",
 "Clinical Red Flags":"in a consultation where safety may change the entire plan"
};
const openingFrames=[
 "At first, this looks like a familiar referral. But the person's own words are more useful than the label on any form.",
 "A few lines of clinical history are on the page. The question is which detail will actually change the next decision.",
 "The consultation begins with a person and a problem, not a diagnosis. The most useful evidence is still waiting to be connected.",
 "This is where clinical reasoning begins: listen first, then decide what really needs investigating.",
 "Every condition has a textbook name; every person experiences the problem differently. Start with the latter."
];
const lowRiskPrompts=[
 "Quick plot twist: the most exciting test in your toolkit may not be the most useful one.",
 "The chart is not a crossword. You don't get bonus points for filling every box.",
 "One careful question is worth more than six impressive guesses.",
 "A familiar pattern is a clue, not a permission slip to skip the examination.",
 "The patient did not come for your favourite technique. They came to regain something that matters.",
 "No Hollywood ending here. Reassessment, not wishful thinking, tells you what actually changed.",
 "A good clinical lesson should follow you out of the classroom."
];
const urgentPrompts=[
 "Recognize the pattern and prioritize patient safety.",
 "A concerning response may change the urgency before a routine examination begins.",
 "Do not delay emergency escalation in pursuit of a complete test battery.",
 "The correct decision may be immediate handover, not a confident diagnosis.",
 "A safe plan can mean stopping physiotherapy until appropriate medical evaluation.",
 "Follow-up begins with confirmation that the required escalation occurred.",
 "Remember the warning signs; they may matter more than the eventual diagnostic label."
];
function smallHash(value:string){
 let h=2166136261;
 for(let i=0;i<value.length;i++)h=Math.imul(h^value.charCodeAt(i),16777619);
 return h>>>0;
}
function shorten(value:string,max=230){return value.length>max?value.slice(0,max).replace(/\s+\S*$/,"")+"…":value;}
function first(values:string[]|undefined,index=0,fallback=""){return values?.[index]?.trim()||fallback;}
function extractGoal(story:CaseStory){
 const combined=[...story.scene,story.opening].join(" ");
 const goal=combined.match(/Main functional priority:\s*([^.!?]+)/i)?.[1];
 if(goal)return goal.trim().replace(/\.$/,"");
 const reported=combined.match(/(Returning to [^.]+|Managing a normal workday|Staying independent|Daily function is the main goal)/i)?.[1];
 return reported||"the everyday task or participation goal that matters most";
}
export function buildClinicalEpisodes(story:CaseStory,guide:CaseLearningGuide):ClinicalEpisode[]{
 const h=smallHash(story.id);
 const context=settings[story.category]||"during a rehabilitation consultation";
 const safe=story.urgent||["Critical Care & ICU","Oncology Rehabilitation","Clinical Red Flags"].includes(story.category);
 const lines=safe?urgentPrompts:lowRiskPrompts;
 const thought=(i:number)=>lines[(h+i)%lines.length];
 const goal=extractGoal(story);
 const introduction=openingFrames[h%openingFrames.length];
 const documentedHistory=story.scene.filter(x=>
  x!==story.opening&&!x.startsWith("You are seeing this patient")&&
  !x.startsWith("The patient's goal is not")&&!x.startsWith("At this point")&&
  !x.startsWith("Your next decision")&&!x.startsWith("The patient's initial words")
 ).slice(0,2);
 const differentialNames=story.differentials.map(d=>d.diagnosis).filter(Boolean);
 const examination=first(story.findings,0,"The assessment must still be selected according to the history.");
 const keyHistory=first(story.history,0);
 const strongest=first(guide.chapters.examination,0,"Choose the examination that most safely answers the clinical question.");
 const plan=first(story.management,0,"Choose a patient-specific plan informed by assessment and clinical guidance.");
 const monitoring=first(story.progression,0,"The same meaningful functional goal should be reviewed at follow-up.");
 return [
  {
   act:"ACT I · THE ARRIVAL",sceneTitle:"A story arrives before a diagnosis",
   narrative:[introduction,"Picture this teaching encounter "+context+". "+story.patient+" is the person described in the case notes.",...documentedHistory,
    "What matters is not only the symptoms. The story is also about "+goal+"."],
   tension:thought(0),
   question:"What might change your first impression of this patient's problem?",
   insight:"Separate the person's actual history from the hypothesis you have not tested. Start with the documented complaints and functional priorities.",
   moment:"The file is open. The meaning of the clues is still up for discussion."
  },
  {
   act:"ACT II · THE INTERVIEW",sceneTitle:"The detail hidden in an ordinary answer",
   narrative:["The first question is not a formality. It is the point where the patient gets to tell the story in their own words.",
    "From the interview notes: "+shorten(keyHistory?.[1]||story.opening,430),
    "A careful clinician keeps asking what has changed, what the person can no longer do, and whether any symptom demands a different level of urgency."],
   tension:thought(1),
   question:keyHistory?.[0]||"Which history question should you ask next?",
   insight:first(guide.chapters.subjective,0,"Clarify the relevant symptom behaviour, safety risks and functional goals."),
   moment:"You have more information now. Resist the urge to choose a treatment before you have tested it."
  },
  {
   act:"ACT III · THE EXAMINATION",sceneTitle:"The observations start to matter",
   narrative:["The case record now offers findings that can test your working hypothesis. Nothing needs to be invented to make the situation interesting.",
    "An available finding reads: "+examination,
    "The next examination should target the uncertainty that could change clinical management. Explain the purpose, position and safety considerations before using it."],
   tension:thought(2),
   question:story.examPrompt,
   insight:story.examReason||strongest,
   moment:"The test is only valuable if you know what its result would mean."
  },
  {
   act:"ACT IV · THE CROSSROADS",sceneTitle:"One patient, several explanations",
   narrative:["The evidence is on the page; now you have to weigh competing explanations.",
    differentialNames.length>1?"Other possibilities deserve attention: "+differentialNames.slice(0,3).join("; ")+".":"A safe differential considers both the leading hypothesis and important alternatives.",
    "The teaching interpretation is "+guide.condition+". This remains a working explanation that must fit the observed pattern."],
   tension:thought(3),
   question:"Which finding supports this working explanation—and what would make you reconsider it?",
   insight:story.diagnosisReason,
   moment:"Clinical confidence should rise from evidence, not from recognizing a familiar label."
  },
  {
   act:"ACT V · THE DECISION",sceneTitle:story.urgent?"The moment routine treatment must wait":"The plan has to fit the person",
   narrative:[story.urgent?"This is where an ordinary-looking consultation can become a safety decision. Routine treatment may need to stop.":"The working explanation is only useful if it leads to an appropriate, individualized plan.",
    "The case's proposed action: "+plan,
    story.urgent?"Communicate the warning signs, act within the urgent medical pathway and document the handover.":"The plan must connect the patient's goal with feasible, appropriately monitored intervention."],
   tension:thought(4),
   question:story.urgent?"What must happen before routine physiotherapy could be considered?":"How will you explain the plan and its purpose to this person?",
   insight:first(guide.chapters.management,0,plan),
   moment:"The right clinical decision is sometimes to act—and sometimes to stop."
  },
  {
   act:"ACT VI · THE NEXT CHAPTER",sceneTitle:"A follow-up that has not happened yet",
   narrative:["The story does not offer a made-up happy ending. A simulated case can teach decision-making without pretending treatment succeeded.",
    "The follow-up plan considers: "+monitoring,
    story.urgent?"The team should confirm appropriate medical escalation and only reconsider rehabilitation after clearance.":"Choose a baseline that can be repeated. The next decision depends on response, function, safety and the person's priorities."],
   tension:thought(5),
   question:"What specific change would make you progress, modify or stop the plan?",
   insight:first(guide.chapters.followUp,0,monitoring),
   moment:"The next chapter belongs to reassessment—not a promised recovery."
  },
  {
   act:"EPILOGUE · THE LESSON",sceneTitle:"Close the case, take the reasoning with you",
   narrative:["You now know the teaching interpretation, which questions mattered, the examination priorities and the proposed clinical plan.",
    "The practical lesson is not to memorize this exact patient. It is to recognize what evidence matters when the next patient presents differently.",
    "Return to Clinical Arena when you want to make those decisions without the teaching notes."],
   tension:thought(6),
   question:"Which one mistake would you avoid if this pattern appeared in a new patient?",
   insight:first(guide.chapters.takeaways,0,"Link the patient story with safety, assessment, treatment and reassessment."),
   moment:"End of this file. The next patient's story will be different."
  }
 ];
}
