import {NextRequest,NextResponse} from "next/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {pakistanChallengeDate,pakistanMidnightUTC} from "@/lib/daily-challenge";
export const dynamic="force-dynamic";
export const revalidate=0;
export async function GET(request:NextRequest){
 const params=request.nextUrl.searchParams;
 const period=params.get("period")||"today";
 if(!["today","month","year"].includes(period)){
  return NextResponse.json({error:"Invalid leaderboard period."},{status:400});
 }
 const currentDate=pakistanChallengeDate();
 const requested=params.get("anchor")||currentDate;
 if(!/^\d{4}-\d{2}-\d{2}$/.test(requested)||Number.isNaN(Date.parse(requested+"T00:00:00Z"))||requested>currentDate){
  return NextResponse.json({error:"Invalid date range."},{status:400});
 }
 const anchor=period==="today"?currentDate:requested;
 const limit=Math.min(100,Math.max(1,Number(params.get("limit"))||50));
 const offset=Math.min(50000,Math.max(0,Number(params.get("offset"))||0));
 const supabase=createAdminClient();
 const {data,error}=await supabase.rpc("pna_daily_challenge_leaderboard",{
  p_period:period,p_anchor:anchor,p_limit:limit,p_offset:offset
 });
 if(error){
  console.error("PNA_DAILY_LEADERBOARD",error.code);
  return NextResponse.json({error:"Leaderboard temporarily unavailable."},{status:503,headers:{"Cache-Control":"no-store"}});
 }
 const rows=(data||[]).map((r:{
  place:number;display_name:string;points:number;challenges:number
 })=>({
  place:Number(r.place),name:String(r.display_name),points:Number(r.points),challenges:Number(r.challenges)
 }));
 return NextResponse.json({
  period,anchor,challengeDate:currentDate,resetAt:pakistanMidnightUTC(currentDate),
  rows,hasMore:rows.length===limit
 },{headers:{"Cache-Control":"no-store, max-age=0"}});
}
