/**
 * Educational Clinical Arena patient dialogue.
 * Clinical facts are always preserved. Light, non-diagnostic humor is added only
 * to low-risk stories; urgent/red-flag presentations remain serious.
 * 4 distinct patient voices x 12 remarks. Each routine expanded case can
 * deliver 12 different replies to the same question across repeat encounters.
 */
export type PatientReplyInput = {
  caseId: string;
  questionKey: string;
  clinicalAnswer: string;
  encounter: number;
  urgent?: boolean;
  allowHumor?: boolean;
};

const voices = [
  // Dry wit: short, deadpan reactions.
  [
    "I would give this week one star, and that's being generous.",
    "My body clearly did not read today's schedule.",
    "This was not on my list of weekend plans.",
    "Apparently my routine enjoys surprise episodes.",
    "I asked for a quiet week. My body voted against it.",
    "I have questions for whoever designed this plot twist.",
    "No, I didn't order the deluxe discomfort package.",
    "It seems my body missed the instruction manual.",
    "My daily routine would like to file a complaint.",
    "I was hoping for a boring story to tell today.",
    "The timing has been spectacularly inconvenient.",
    "I'd like to unsubscribe from this experience, please.",
  ],
  // Chatty and playful, without adding clinical clues.
  [
    "You know how people say every day is an adventure? I'd like fewer adventures.",
    "I told my family I'm collecting stories, but this one is not my favorite.",
    "If this were a movie, I'd ask for a better second half.",
    "Doctor, I came for advice, not another plot twist.",
    "The funny part? My plans were actually quite sensible.",
    "My to-do list is staring at me in disappointment.",
    "I have a lot to say about this, but I'll keep it family-friendly.",
    "Even my calendar seems annoyed with the situation.",
    "I tried to ignore the drama. The drama did not ignore me.",
    "Please tell me ordinary days are still available.",
    "I would complain to customer support, if my body had one.",
    "My friends say I need a hobby. This is not the hobby I chose.",
  ],
  // Quiet and gentle: small, human smiles.
  [
    "I can laugh about the timing, even if it has been frustrating.",
    "I keep telling myself to take things one day at a time.",
    "I suppose this is one way to learn patience.",
    "I'd be very happy with a perfectly ordinary day again.",
    "I didn't think I'd be discussing this over my morning plans.",
    "At least I finally have an excuse to ask better questions.",
    "I'm trying to stay cheerful, although the timing isn't great.",
    "I've been practicing my patient face. How am I doing?",
    "I thought 'take it easy' sounded simple until now.",
    "I was going to tell a better joke, but my timing is poor.",
    "I do appreciate you listening; I've repeated the story a lot.",
    "I'm ready for this chapter to become a little less interesting.",
  ],
  // Lightly dramatic, still believable.
  [
    "My body has chosen a very dramatic way to get my attention.",
    "I'm not saying it's a soap opera, but there have been episodes.",
    "Can we get a less dramatic script for next week?",
    "The plot has thickened, and I did not approve the rewrite.",
    "I wasn't planning on starring in a medical mystery.",
    "If the universe wanted my attention, message received.",
    "I feel like my calendar and my body are in an argument.",
    "This would be a fun mystery if it were happening to someone fictional.",
    "Today's episode is called 'Please, Just One Normal Day.'",
    "Someone tell the director we don't need a sequel.",
    "I have performed my dramatic sigh for the day.",
    "It's a surprising amount of drama for a regular Tuesday.",
  ],
] as const;

function hashText(value:string):number {
 let result=2166136261;
 for(const character of value)result=Math.imul(result^character.charCodeAt(0),16777619);
 return result>>>0;
}

const sensitivePattern=/\b(bladder|bowel|saddle|cauda equina|fever|septic|infection|hot swollen|emergency|urgent|progressive weakness|new weakness|loss of control|unable to breathe|chest pain|stroke|suicid|red flags?)\b/i;

export function naturalPatientSpeech(text:string):string {
 return text.trim()
  .replace(/^The patient reports /,"I've been dealing with ")
  .replace(/^The patient has /,"I've had ")
  .replace(/Symptoms became troublesome during /g,"It started interfering during ")
  .replace(/Symptoms interfere with /g,"It's affecting ")
  .replace(/Symptoms have limited /g,"It's made it harder to manage ")
  .replace(/Symptoms have made /g,"It's made ")
  .replace(/Returning to sport safely is the main goal\./g,"I'd like to return to sport safely.")
  .replace(/Managing a normal workday is the main goal\./g,"I'd like to manage a normal workday.")
  .replace(/Daily function is the main goal\./g,"I'd like to manage my daily routine.")
  .replace(/Staying independent is the main goal\./g,"I'd like to stay independent.")
  .replace(/Returning to comfortable duties is the main goal\./g,"I'd like to get back to my normal duties comfortably.");
}

/** Return a patient's complete answer, not just a standalone joke. */
export function patientAnswer(input:PatientReplyInput):string {
 const facts=naturalPatientSpeech(input.clinicalAnswer);
 if(!input.allowHumor || input.urgent || sensitivePattern.test(facts))return facts;
 const voice=voices[hashText(input.caseId)%voices.length];
 // Every new encounter advances by one remark for each patient/question.
 const start=hashText(input.caseId+"|"+input.questionKey)%voice.length;
 const index=(start+Math.max(0,Math.floor(input.encounter)))%voice.length;
 return facts+" "+voice[index];
}

/** Only reports the case's existing functional story; never exposes clinician-only hints. */
export function everydayImpact(history:string):string {
 const parts=history.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map(s=>s.trim())||[];
 const impact=parts.slice(1).join(" ");
 return naturalPatientSpeech(impact || "I want to get back to my normal daily activities.");
}

/** For audit/tests. Patient jokes are deliberately excluded from emergency cases. */
export const PATIENT_DIALOGUE_VARIANTS_PER_CASE=12;
