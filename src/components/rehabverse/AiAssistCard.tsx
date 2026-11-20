"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { aiChoiceAction } from "@/app/rehabverse/actions";
import type { AiAssist } from "@/lib/rehabverse/api-types";
import { T } from "./useLang";

/**
 * Where a patient sees (and chooses about) AI assistance. The physiotherapist decides whether it is switched on: the patient can ask for it
 * or withdraw, never switch it on. Until it is on, nothing about RehabVerse changes.
 */
export function AiAssistCard({ value }: { value: AiAssist }) {
  const router = useRouter();
  const [current, setCurrent] = useState<AiAssist>(value);
  const [pending, start] = useTransition();
  const [failed, setFailed] = useState(false);

  const choose = (want: boolean) =>
    start(async () => {
      setFailed(false);
      const result = await aiChoiceAction(want);
      if (!result.ok) return setFailed(true);
      setCurrent(result.ai_assist);
      router.refresh();
    });

  return (
    <section className="rounded-2xl border border-teal-200 bg-teal-50/60 p-4" aria-label="AI assistance" data-pna-ai-card="v1">
      <p className="flex items-center gap-2 text-[13.5px] font-bold text-navy-800">
        <Sparkles className="h-4 w-4 text-teal-700" aria-hidden="true" /> <T en="AI assistant (new)" ru="AI assistant (naya)" />
      </p>
      {current === "off" ? (
        <>
          <p className="mt-1.5 text-[13.5px] leading-6 text-slate-700">
            <T en="An AI assistant can help you fill your forms and understand your exercises. It is switched on by your physiotherapist, and RehabVerse works the same without it."
               ru="AI assistant aap ko forms bharne aur exercises samajhne mein madad de sakta hai. Ise aap ke physiotherapist on karte hain, aur iske baghair RehabVerse waisa hi chalta hai." />
          </p>
          <button type="button" disabled={pending} onClick={() => choose(true)} className="rv-btn rv-btn-primary mt-2"><T en="Ask for AI assistance" ru="AI assistance maangein" /></button>
        </>
      ) : null}
      {current === "requested" ? (
        <>
          <p className="mt-1.5 text-[13.5px] leading-6 text-slate-700">
            <T en="You asked for AI assistance. Your physiotherapist will decide, and you will get a notification. Nothing changes until then."
               ru="Aap ne AI assistance maangi hai. Aap ke physiotherapist faisla karenge aur aap ko notification milegi. Tab tak kuch nahi badalta." />
          </p>
          <button type="button" disabled={pending} onClick={() => choose(false)} className="rv-btn rv-btn-ghost mt-2"><T en="Cancel my request" ru="Meri request wapas lein" /></button>
        </>
      ) : null}
      {current === "on" ? (
        <>
          <p className="mt-1.5 text-[13.5px] leading-6 text-slate-700">
            <T en="Your physiotherapist switched on AI assistance for you. The assistant is being introduced step by step and will appear here when it is ready. You can switch it off at any time."
               ru="Aap ke physiotherapist ne aap ke liye AI assistance on kar di hai. Assistant dheere dheere aa raha hai aur tayyar hone par yahin nazar aayega. Aap jab chahein ise band kar sakte hain." />
          </p>
          <button type="button" disabled={pending} onClick={() => choose(false)} className="rv-btn rv-btn-ghost mt-2"><T en="Turn it off for me" ru="Mere liye band karein" /></button>
        </>
      ) : null}
      {failed ? <p className="mt-1.5 text-[12.5px] font-bold text-rose-700" role="alert"><T en="That did not work. Please try again." ru="Ye nahi hua. Dobara koshish karein." /></p> : null}
    </section>
  );
}
