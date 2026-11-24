"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Clock3, LogOut, MessageCircle, XCircle } from "lucide-react";
import { memberLogoutAction, memberStatusAction, type MemberStanding } from "@/app/members/actions";
import { whatsappLink } from "@/lib/site-config";
import { T, useRvLang } from "@/components/rehabverse/useLang";

/** Between "I asked for access" and "the clinic approved it" (or declined, or suspended). Notices the decision by itself while open. */
export function MemberWaiting({ name, status: initial, note: initialNote }: { name: string; status: MemberStanding; note: string | null }) {
  const [lang] = useRvLang();
  const router = useRouter();
  const [status, setStatus] = useState<MemberStanding>(initial);
  const [note, setNote] = useState<string | null>(initialNote);
  const [leaving, leave] = useTransition();

  useEffect(() => {
    if (status !== "pending" && status !== "none") return;
    const check = async () => {
      if (document.hidden) return;
      const r = await memberStatusAction();
      if (!r.ok) return;
      setNote(r.note);
      if (r.status === "approved") { router.replace("/members/check?next=/"); router.refresh(); } else setStatus(r.status);
    };
    const timer = window.setInterval(check, 20000);
    return () => window.clearInterval(timer);
  }, [status, router]);

  const blocked = status === "rejected" || status === "suspended";
  const message = lang === "ru" ? `Assalam-o-alaikum, main ${name} hoon. Maine website ke liye access ki request ki hai.` : `Hello, I am ${name}. I asked for access to the website.`;
  return (
    <div className="rv-glass mx-auto w-full max-w-xl space-y-5 p-5 sm:p-8" role="status" aria-live="polite" data-testid="member-waiting" data-status={status}>
      <span className={"grid h-14 w-14 place-items-center rounded-2xl " + (blocked ? "bg-rose-50 text-rose-700" : "bg-teal-50 text-teal-700")}>
        {blocked ? <XCircle className="h-7 w-7" aria-hidden="true" /> : <Clock3 className="h-7 w-7" aria-hidden="true" />}
      </span>
      <div>
        <h1 className="font-heading text-2xl font-bold text-navy-800">
          {status === "suspended" ? <T en="Your access is paused" ru="Aap ka access rok diya gaya hai" /> : status === "rejected" ? <T en="Your request could not be approved" ru="Aap ki request approve nahi ho saki" /> : <T en="Your request is with the clinic" ru="Aap ki request clinic ke paas hai" />}
        </h1>
        <p className="mt-2 text-[16px] leading-7 text-slate-700">
          {blocked ? <T en="Please contact the clinic and we will sort it out together." ru="Clinic se rabta karein, hum mil kar masla hal kar lenge." /> : <T en="Thank you. The clinic checks every new account (usually by phone or WhatsApp) before the website opens. This page moves on by itself when you are approved." ru="Shukriya. Clinic har naye account ko (aam taur par phone ya WhatsApp se) check karta hai, phir website khulti hai. Approve hote hi yeh page khud aage barh jayega." />}
        </p>
        {note ? <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-[15px] text-amber-950"><b><T en="Clinic's note: " ru="Clinic ka note: " /></b>{note}</p> : null}
      </div>
      <div className="flex flex-wrap gap-2">
        <a href={whatsappLink(message)} target="_blank" rel="noopener noreferrer" className="rv-btn rv-btn-primary !min-h-[52px]"><MessageCircle className="h-5 w-5" aria-hidden="true" /> <T en="WhatsApp the clinic" ru="Clinic ko WhatsApp karein" /></a>
        <button type="button" disabled={leaving} onClick={() => leave(async () => { await memberLogoutAction(); router.replace("/members"); router.refresh(); })} className="rv-btn rv-btn-ghost !min-h-[52px]"><LogOut className="h-5 w-5" aria-hidden="true" /> <T en="Sign out" ru="Sign out" /></button>
      </div>
    </div>
  );
}
