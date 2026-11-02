import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic="force-dynamic";
export const revalidate=0;
// Read-only health probe. No emails, participant counts or credentials are exposed.
export async function GET(){
 const headers={"Cache-Control":"no-store, max-age=0"};
 try{
  const client=createAdminClient();
  const {error}=await client.from("daily_challenge_attempts").select("id").limit(0);
  if(error){
   console.error("PNA_DAILY_STATUS_DB",error.code,error.message);
   return NextResponse.json({ok:false,service:"daily-challenge",code:"DB_UNAVAILABLE"},{status:503,headers});
  }
  return NextResponse.json({ok:true,service:"daily-challenge",database:"ready"},{status:200,headers});
 }catch(e){
  console.error("PNA_DAILY_STATUS_EXCEPTION",e instanceof Error?e.message:"unknown");
  return NextResponse.json({ok:false,service:"daily-challenge",code:"CONFIG_UNAVAILABLE"},{status:503,headers});
 }
}
