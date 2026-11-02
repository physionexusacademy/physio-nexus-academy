import "server-only";

import {createAdminClient} from "@/lib/supabase/admin";
import {challengeQuestions,pakistanChallengeDate,pakistanMidnightUTC,publicDailyQuestions} from "@/lib/daily-challenge";

const QUESTION_SECONDS=30;
const QUESTIONS=5;
const TOTAL_LIMIT_MS=QUESTION_SECONDS*QUESTIONS*1000;
const GRACE_MS=3500;
function normalizeParticipantEmail(value:string){
 const email=value.trim().toLowerCase();
 if(!/^[a-z0-9._%+\-]+@gmail\.com$/.test(email))throw new Error("Enter a valid Gmail address.");
 const local=email.split("@")[0].split("+")[0].replace(/\./g,"");
 if(!local)throw new Error("Enter a valid Gmail address.");
 return {email,emailKey:local+"@gmail.com"};
}
export async function startDailyChallenge(input:{fullName:string;email:string;consent:boolean}){
 const fullName=(input.fullName||"").trim().replace(/\s+/g," ");
 if(fullName.length<2||fullName.length>60) return {ok:false as const,error:"Enter a name between 2 and 60 characters."};
 if(!input.consent) return {ok:false as const,error:"Please agree to displaying your name and score on the leaderboard."};
 let identity:{email:string;emailKey:string};
 try{identity=normalizeParticipantEmail(input.email||"");}
 catch{return {ok:false as const,error:"Please enter a valid Gmail address."};}
 const day=pakistanChallengeDate();
 if(Date.parse(pakistanMidnightUTC(day))-Date.now()<TOTAL_LIMIT_MS+GRACE_MS+2000){
  return {ok:false as const,error:"Today's challenge is closing. A fresh challenge opens at 12:00 AM Pakistan time."};
 }
 const supabase=createAdminClient();
 const {data,error}=await supabase.from("daily_challenge_attempts").insert({
  challenge_date:day,full_name:fullName,email:identity.email,email_key:identity.emailKey,status:"started"
 }).select("id,attempt_token,started_at").single();
 if(error){
  if(error.code==="23505")return {ok:false as const,error:"This Gmail address has already started today's challenge. Come back after 12:00 AM Pakistan time."};
  console.error("PNA_DAILY_START",error.code, error.message);
  return {ok:false as const,error:"Challenge temporarily unavailable. Try again soon."};
 }
 const expiresAt=new Date(Math.min(
  new Date(data.started_at).getTime()+TOTAL_LIMIT_MS+GRACE_MS,
  Date.parse(pakistanMidnightUTC(day))
 )).toISOString();
 return {ok:true as const,challenge:{
  attemptId:String(data.id),token:String(data.attempt_token),date:day,
  expiresAt,resetAt:pakistanMidnightUTC(day),
  questions:publicDailyQuestions(day),timePerQuestionSeconds:QUESTION_SECONDS
 }};
}
export async function submitDailyChallenge(input:{
 attemptId:string;token:string;answers:Record<string,string>
}){
 if(!/^[0-9a-f-]{36}$/i.test(input.attemptId)||!/^[0-9a-f-]{36}$/i.test(input.token)){
  throw new Error("Invalid attempt.");
 }
 const supabase=createAdminClient();
 const {data,error}=await supabase.from("daily_challenge_attempts")
  .select("id,challenge_date,started_at,status")
  .eq("id",input.attemptId).eq("attempt_token",input.token).maybeSingle();
 if(error){console.error("PNA_DAILY_READ",error.code,error.message);throw new Error("Unable to read challenge attempt.");}
 if(!data)throw new Error("Attempt not found.");
 if(data.status!=="started")throw new Error("This attempt has already been submitted.");
 const time=Date.now();
 const elapsed=Math.max(0,time-new Date(data.started_at).getTime());
 const midnight=Date.parse(pakistanMidnightUTC(data.challenge_date));
 const questions=challengeQuestions(data.challenge_date);
 const expired=elapsed>TOTAL_LIMIT_MS+GRACE_MS||time>=midnight;
 const answers=input.answers&&typeof input.answers==="object"?input.answers:{};
 const correctCount=expired?0:questions.reduce((n,q)=>{
  const expected=["A","B","C","D"][q.correct];
  return n+(answers[q.id]===expected?1:0);
 },0);
 const score=correctCount*20;
 const {data:updated,error:updateError}=await supabase.from("daily_challenge_attempts")
  .update({
   status:expired?"expired":"submitted",correct_count:correctCount,score,
   elapsed_ms:Math.min(elapsed,TOTAL_LIMIT_MS),submitted_at:new Date(time).toISOString()
  }).eq("id",input.attemptId).eq("attempt_token",input.token)
   .eq("status","started").select("id").maybeSingle();
 if(updateError){console.error("PNA_DAILY_SAVE",updateError.code,updateError.message);throw new Error("Your attempt could not be saved. Please contact PNA support.");}
 if(!updated)throw new Error("Your attempt was already saved or has expired.");
 return {expired,score,correctCount,total:QUESTIONS,elapsedMs:Math.min(elapsed,TOTAL_LIMIT_MS),
  explanations:questions.map(q=>({
   id:q.id,correctValue:["A","B","C","D"][q.correct],explanation:q.explanation
  }))};
}
