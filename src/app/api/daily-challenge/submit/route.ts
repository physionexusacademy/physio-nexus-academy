import { NextRequest, NextResponse } from "next/server";
import { submitDailyChallenge } from "@/lib/daily-challenge-service";

export const dynamic="force-dynamic";
export const revalidate=0;
const headers={"Cache-Control":"no-store, max-age=0"};
export async function POST(request:NextRequest){
 const origin=request.headers.get("origin");
 if(origin&&origin!==request.nextUrl.origin)return NextResponse.json({error:"Invalid request origin."},{status:403,headers});
 if(!request.headers.get("content-type")?.includes("application/json")){
  return NextResponse.json({error:"Expected a JSON request."},{status:415,headers});
 }
 if(Number(request.headers.get("content-length")||0)>4096)
  return NextResponse.json({error:"Request too large."},{status:413,headers});
 let body:unknown;
 try{body=await request.json();}catch{
  return NextResponse.json({error:"Invalid request format."},{status:400,headers});
 }
 if(!body||typeof body!=="object"||Array.isArray(body)){
  return NextResponse.json({error:"Invalid attempt."},{status:400,headers});
 }
 const data=body as Record<string,unknown>;
 if(typeof data.attemptId!=="string"||typeof data.token!=="string"||
  !data.answers||typeof data.answers!=="object"||Array.isArray(data.answers)){
  return NextResponse.json({error:"Invalid attempt."},{status:400,headers});
 }
 try{
  const saved=await submitDailyChallenge({
   attemptId:data.attemptId,token:data.token,answers:data.answers as Record<string,string>
  });
  return NextResponse.json(saved,{status:200,headers});
 }catch(e){
  const message=e instanceof Error?e.message:"unknown";
  console.error("PNA_DAILY_API_SUBMIT_EXCEPTION",message);
  if(message==="Invalid attempt."||message==="Attempt not found."){
   return NextResponse.json({error:"This challenge attempt was not found."},{status:400,headers});
  }
  if(message.includes("already submitted")||message.includes("already saved")){
   return NextResponse.json({error:"This attempt was already submitted. Check your score on the leaderboard."},{status:409,headers});
  }
  return NextResponse.json({error:"Unable to save your score right now. Please retry before your attempt expires.",code:"SUBMIT_SERVICE_ERROR"},{status:503,headers});
 }
}
