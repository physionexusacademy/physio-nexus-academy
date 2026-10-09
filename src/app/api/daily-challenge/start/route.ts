import { NextRequest, NextResponse } from "next/server";
import { startDailyChallenge } from "@/lib/daily-challenge-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const headers = {"Cache-Control":"no-store, max-age=0"};
function forbiddenOrigin(request:NextRequest){
 const origin=request.headers.get("origin");
 return !!origin && origin!==request.nextUrl.origin;
}
export async function POST(request:NextRequest){
 if(forbiddenOrigin(request)) return NextResponse.json({ok:false,error:"Invalid request origin."},{status:403,headers});
 if(!request.headers.get("content-type")?.includes("application/json")){
  return NextResponse.json({ok:false,error:"Expected a JSON request."},{status:415,headers});
 }
 if(Number(request.headers.get("content-length")||0)>4096){
  return NextResponse.json({ok:false,error:"Request too large."},{status:413,headers});
 }
 let body:unknown;
 try{body=await request.json();}catch{
  return NextResponse.json({ok:false,error:"Invalid request format."},{status:400,headers});
 }
 if(!body || typeof body!=="object" || Array.isArray(body)){
  return NextResponse.json({ok:false,error:"Invalid participant details."},{status:400,headers});
 }
 const data=body as Record<string,unknown>;
 try{
  const result=await startDailyChallenge({
   fullName:typeof data.fullName==="string"?data.fullName:"",
   email:typeof data.email==="string"?data.email:"",
   consent:data.consent===true
  });
  if(!result.ok){
   const status=result.error.includes("already started")?409:
    result.error.includes("temporarily unavailable")?503:400;
   return NextResponse.json(result,{status,headers});
  }
  return NextResponse.json(result,{status:201,headers});
 }catch(e){
  console.error("PNA_DAILY_API_START_EXCEPTION",e instanceof Error?e.message:"unknown");
  return NextResponse.json({ok:false,error:"Challenge service is temporarily unavailable. Please try again shortly.",code:"START_SERVICE_ERROR"},
   {status:503,headers});
 }
}
