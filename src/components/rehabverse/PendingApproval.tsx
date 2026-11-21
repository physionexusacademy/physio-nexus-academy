"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock3, LogOut, MessageCircle, PhoneCall, ShieldCheck, XCircle } from "lucide-react";
import { logoutAction, myAccountStatusAction } from "@/app/rehabverse/actions";
import type { AccountStatus } from "@/lib/rehabverse/api-types";
import { siteConfig, whatsappLink } from "@/lib/site-config";
import { T, useRvLang } from "./useLang";

/**
 * The screen between "I asked for an account" and "the clinic approved it". There is no confirmation e-mail: the clinic checks the request
 * (usually by phone or WhatsApp) and approves it, and this page notices by itself while it is open.
 */
export function PendingApproval({ name, reference, status: initial, note: initialNote }: { name: string; reference: string; status: AccountStatus; note: string | null }) {
  const [lang] = useRvLang();
  const router = useRouter();
  const [status, setStatus] = useState<AccountStatus>(initial);
  const [note, setNote] = useState<string | null>(initialNote);
  const [leaving, leave] = useTransition();

  // Ask again every 20 seconds while the page is open and visible; the moment the clinic approves, move on to the assessment.
  useEffect(() => {
    if (status !== "pending") return;
    const check = async () => {
      if (document.hidden) return;
      const result = await myAccountStatusAction();
      if (!result.ok) return;
      setNote(result.note);
      if (result.status === "active") {
        router.push("/rehabverse/start");
        router.refresh();
      } else setStatus(result.status);
    };
    const timer = window.setInterval(check, 20000);
    return () => window.clearInterval(timer);
  }, [status, router]);

  const waiting = status === "pending";
  const declined = status === "rejected";
  const message = lang === "ru" ? `Assalam-o-alaikum, main ${name} hoon (${reference}). Maine RehabVerse account ki request ki hai.` : `Hello, I am ${name} (${reference}). I requested a RehabVerse account.`;

  return (
    <div className="rv-glass mx-auto w-full max-w-xl space-y-5 p-5 sm:p-8" role="status" aria-live="polite">
      <span className={"grid h-14 w-14 place-items-center rounded-2xl " + (declined ? "bg-rose-50 text-rose-700" : "bg-teal-50 text-teal-700")}>
        {declined ? <XCircle className="h-7 w-7" aria-hidden="true" /> : <Clock3 className="h-7 w-7" aria-hidden="true" />}
      </span>
      <div>
        <p className="rv-h"><T en={`Request ${reference}`} ru={`Request ${reference}`} /></p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-navy-800">
          {declined ? <T en="Your request could not be approved" ru="Aap ki request approve nahi ho saki" /> : <T en="Your request is with the clinic" ru="Aap ki request clinic ke paas hai" />}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          {declined ? (
            <T en="The clinic could not approve this account. Please contact us and we will sort it out together." ru="Clinic is account ko approve nahi kar saka. Hum se rabta karein, hum mil kar masla hal kar lenge." />
          ) : (
            <T
              en="Thank you. The clinic checks every new account by phone or WhatsApp before it starts, so your records stay private. We will approve it as soon as we can (usually within a day). No email confirmation is needed."
              ru="Shukriya. Clinic har naya account shuru hone se pehle phone ya WhatsApp par check karta hai, taake aap ka record mehfooz rahe. Hum jaldi se jaldi approve karenge (aam taur par ek din ke andar). Email confirm karne ki zaroorat nahi."
            />
          )}
        </p>
        {declined && note ? <p className="mt-3 rounded-xl bg-rose-50 px-3.5 py-2.5 text-[13.5px] leading-5 text-rose-900"><b><T en="Clinic note: " ru="Clinic ka note: " /></b>{note}</p> : null}
      </div>

      {waiting ? (
        <ol className="space-y-2 text-[13.5px] leading-6 text-slate-700">
          <li className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-teal-600" aria-hidden="true" /><span><T en="Request sent" ru="Request bhej di gayi" /></span></li>
          <li className="flex gap-2"><Clock3 className="mt-1 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" /><span><T en="The clinic checks it (phone or WhatsApp)" ru="Clinic check karta hai (phone ya WhatsApp)" /></span></li>
          <li className="flex gap-2 text-slate-500"><ShieldCheck className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" /><span><T en="You can then start the short symptom assessment" ru="Phir aap chhota sa symptom assessment shuru kar sakte hain" /></span></li>
        </ol>
      ) : null}
      {waiting ? <p className="text-[12.5px] text-slate-500"><T en="You can leave this page open (it moves on by itself) or sign in again later." ru="Is page ko khula chhor sakte hain (ye khud aage barh jata hai) ya baad mein dobara sign in karein." /></p> : null}

      <div className="flex flex-wrap gap-2">
        <a href={whatsappLink(message)} target="_blank" rel="noopener noreferrer" className="rv-btn rv-btn-primary"><MessageCircle className="h-4 w-4" aria-hidden="true" /> <T en="WhatsApp the clinic" ru="Clinic ko WhatsApp karein" /></a>
        <a href={`tel:+${siteConfig.contact.phoneRaw.replace(/\D/g, "")}`} className="rv-btn rv-btn-ghost"><PhoneCall className="h-4 w-4" aria-hidden="true" /> {siteConfig.contact.phoneDisplay}</a>
        <button type="button" disabled={leaving} className="rv-btn rv-btn-ghost" onClick={() => leave(async () => { await logoutAction(); router.push("/rehabverse"); router.refresh(); })}>
          <LogOut className="h-4 w-4" aria-hidden="true" /> <T en="Sign out" ru="Sign out" />
        </button>
      </div>
    </div>
  );
}
