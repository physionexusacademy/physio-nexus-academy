import { Sparkles } from "lucide-react";
import type { AiAssist } from "@/lib/rehabverse/api-types";
import { T } from "./useLang";

/**
 * Shown only to a patient whose physiotherapist has switched the AI assistant on. It has no controls: the patient cannot turn the assistant on
 * or off (that is the physiotherapist's decision), and a patient without it sees nothing about it at all.
 */
export function AiAssistCard({ value }: { value: AiAssist }) {
  if (value !== "on") return null;
  return (
    <section className="rounded-2xl border border-teal-200 bg-teal-50/60 p-4" aria-label="AI assistant" data-pna-ai-card="v2">
      <p className="flex items-center gap-2 text-[13.5px] font-bold text-navy-800">
        <Sparkles className="h-4 w-4 text-teal-700" aria-hidden="true" /> <T en="Your AI assistant" ru="Aap ka AI assistant" />
      </p>
      <p className="mt-1.5 text-[13.5px] leading-6 text-slate-700">
        <T
          en="Your physiotherapist has made an AI assistant available to you. It is not a clinician and it does not diagnose or prescribe. It helps you tell your story clearly, and your physiotherapist reads everything and stays in charge of your care."
          ru="Aap ke physiotherapist ne aap ke liye AI assistant faraham kiya hai. Ye clinician nahi hai aur diagnose ya prescribe nahi karta. Ye aap ko apni baat saaf batane mein madad karta hai, aur aap ka physiotherapist sab kuch parhta hai aur aap ke ilaaj ka zimmedar rehta hai."
        />
      </p>
    </section>
  );
}
