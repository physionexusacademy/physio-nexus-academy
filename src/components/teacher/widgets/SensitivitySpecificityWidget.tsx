"use client";

import { useState } from "react";
import { User } from "lucide-react";
import type { TeacherLang } from "@/lib/teacher/types";
import { cn } from "@/lib/utils";
import { t } from "../ui";

type TestId = "A" | "B";
type Filter = "all" | "pos" | "neg";

/** Illustrative results for 10 injured + 10 healthy people. true = test positive. */
const results: Record<TestId, { injured: boolean[]; healthy: boolean[] }> = {
  // Sensitivity 9/10, specificity 6/10
  A: {
    injured: [true, true, true, true, true, true, true, true, true, false],
    healthy: [true, true, true, true, false, false, false, false, false, false],
  },
  // Sensitivity 6/10, specificity 9/10
  B: {
    injured: [true, true, true, true, true, true, false, false, false, false],
    healthy: [true, false, false, false, false, false, false, false, false, false],
  },
};

function count(values: boolean[], wanted: boolean) {
  return values.filter((value) => value === wanted).length;
}

function Person({ injured, positive, index, filter }: { injured: boolean; positive: boolean; index: number; filter: Filter }) {
  const hidden = (filter === "pos" && !positive) || (filter === "neg" && positive);
  return (
    <li
      className={cn(
        "relative flex h-11 w-full items-center justify-center rounded-xl border transition",
        injured ? "border-rose-200 bg-rose-50 text-rose-600" : "border-slate-200 bg-slate-50 text-slate-500",
        hidden && "opacity-15",
      )}
      aria-label={`${injured ? "Injured" : "Healthy"} person ${index + 1}: test ${positive ? "positive" : "negative"}`}
    >
      <User className="h-5 w-5" aria-hidden="true" />
      <span
        className={cn(
          "absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-black text-white",
          positive ? "bg-navy-800" : "bg-teal-500",
        )}
        aria-hidden="true"
      >
        {positive ? "+" : "−"}
      </span>
    </li>
  );
}

export function SensitivitySpecificityWidget({ lang }: { lang: TeacherLang }) {
  const [test, setTest] = useState<TestId>("A");
  const [filter, setFilter] = useState<Filter>("all");
  const data = results[test];

  const truePos = count(data.injured, true);
  const falseNeg = count(data.injured, false);
  const falsePos = count(data.healthy, true);
  const trueNeg = count(data.healthy, false);

  const message = (() => {
    if (filter === "all") {
      return test === "A"
        ? t(lang, `Test A caught ${truePos} of 10 injured people (sensitivity 90%) but also flagged ${falsePos} healthy people (specificity 60%).`, `Test A ne 10 mein se ${truePos} injured log pakre (sensitivity 90%) lekin ${falsePos} sehatmand logon ko bhi positive kar diya (specificity 60%).`)
        : t(lang, `Test B caught only ${truePos} of 10 injured people (sensitivity 60%) but cleared ${trueNeg} of 10 healthy people (specificity 90%).`, `Test B ne 10 mein se sirf ${truePos} injured pakre (sensitivity 60%) lekin 10 mein se ${trueNeg} sehatmand logon ko clear kiya (specificity 90%).`);
    }
    if (filter === "neg") {
      return test === "A"
        ? t(lang, `${falseNeg + trueNeg} people tested NEGATIVE — only ${falseNeg} of them is actually injured. A negative on a sensitive test makes injury unlikely → SnNout ✅`, `${falseNeg + trueNeg} log NEGATIVE aaye — un mein se sirf ${falseNeg} asal mein injured hai. Sensitive test ka negative injury ka imkaan kam karta hai → SnNout ✅`)
        : t(lang, `${falseNeg + trueNeg} people tested NEGATIVE — but ${falseNeg} of them ARE injured. With this test, a negative can't rule the injury out ❌`, `${falseNeg + trueNeg} log NEGATIVE aaye — lekin un mein se ${falseNeg} injured HAIN. Is test ka negative injury rule out nahi kar sakta ❌`);
    }
    return test === "A"
      ? t(lang, `${truePos + falsePos} people tested POSITIVE — but ${falsePos} are healthy. A positive on a sensitive (but less specific) test doesn't confirm much ❌`, `${truePos + falsePos} log POSITIVE aaye — lekin ${falsePos} sehatmand hain. Sensitive (kam specific) test ka positive zyada confirm nahi karta ❌`)
      : t(lang, `${truePos + falsePos} people tested POSITIVE — ${truePos} of them are truly injured. A positive on a specific test rules the injury in → SpPin ✅`, `${truePos + falsePos} log POSITIVE aaye — un mein se ${truePos} waqai injured hain. Specific test ka positive injury rule in karta hai → SpPin ✅`);
  })();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4" data-pna-widget="sensitivity-specificity">
      <div className="flex flex-wrap gap-2" role="group" aria-label={t(lang, "Choose a test", "Test chunein")}>
        {(
          [
            ["A", t(lang, "Test A · highly sensitive", "Test A · bohat sensitive")],
            ["B", t(lang, "Test B · highly specific", "Test B · bohat specific")],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={test === value}
            onClick={() => setTest(value)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-bold transition",
              test === value ? "bg-navy-800 text-white" : "bg-slate-100 text-slate-700 hover:bg-teal-50",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <p className="mb-1.5 text-xs font-extrabold uppercase tracking-wider text-rose-700">
            {t(lang, "10 people WITH the injury", "10 log jinhein injury HAI")}
          </p>
          <ul className="grid grid-cols-5 gap-2 sm:grid-cols-10">
            {data.injured.map((positive, index) => (
              <Person key={"i" + index} injured positive={positive} index={index} filter={filter} />
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-600">
            {t(lang, "10 people WITHOUT the injury", "10 log jinhein injury NAHI")}
          </p>
          <ul className="grid grid-cols-5 gap-2 sm:grid-cols-10">
            {data.healthy.map((positive, index) => (
              <Person key={"h" + index} injured={false} positive={positive} index={index} filter={filter} />
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label={t(lang, "Filter results", "Results filter karein")}>
        {(
          [
            ["all", t(lang, "Show everyone", "Sab dikhayein")],
            ["pos", t(lang, "Only POSITIVE results", "Sirf POSITIVE")],
            ["neg", t(lang, "Only NEGATIVE results", "Sirf NEGATIVE")],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-bold transition",
              filter === value ? "border-teal-700 bg-teal-700 text-white" : "border-teal-200 bg-white text-teal-800 hover:bg-teal-50",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="mt-3 rounded-xl bg-sky-50 px-3 py-2.5 text-sm font-semibold leading-6 text-sky-900" aria-live="polite">
        {message}
      </p>
      <p className="mt-2 text-xs text-slate-500">{t(lang, "Numbers are illustrative for teaching, not from a specific test.", "Numbers samjhane ke liye hain, kisi khaas test ke nahi.")}</p>
    </div>
  );
}
