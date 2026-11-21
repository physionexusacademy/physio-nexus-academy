"use client";

/**
 * Applies the site's motion policy (lib/motion.ts):
 *  - every "prefers-reduced-motion" rule of every stylesheet is made to follow the visitor's choice instead of the device setting
 *    (the rules are real CSS media rules, so their media text is rewritten once the sheets are loaded, again when a page adds a sheet,
 *    and again when the visitor flips the switch),
 *  - the first time a device asks for less motion, a small note offers the choice (one tap either way, kept in the browser),
 *  - the footer switch (MotionToggle).
 * Visitors whose device does NOT ask for less motion see no change at all: the rules already say what the policy says.
 */
import { useEffect, useState } from "react";
import { Wind, X } from "lucide-react";
import { MOTION_EVENT, deviceAsksForLessMotion, motionChosen, motionReduced, setMotion } from "@/lib/motion";
import { Ur } from "@/components/Ur";

const TRUE_QUERY = "(min-width: 0px)";
const FALSE_QUERY = "(min-width: 100000px)";
const ORIGINAL = new WeakMap<CSSMediaRule, string>();
/** The choice each sheet was last made to follow, so a sheet is walked once per choice, not on every change of the page. */
const APPLIED = new WeakMap<CSSStyleSheet, boolean>();

function walk(rules: CSSRuleList, reduced: boolean) {
  for (const rule of Array.from(rules)) {
    if (typeof CSSMediaRule !== "undefined" && rule instanceof CSSMediaRule) {
      let original = ORIGINAL.get(rule);
      if (original === undefined) {
        original = rule.media.mediaText;
        ORIGINAL.set(rule, original);
      }
      if (original.includes("prefers-reduced-motion")) {
        const next = original
          .replace(/\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/g, reduced ? TRUE_QUERY : FALSE_QUERY)
          .replace(/\(\s*prefers-reduced-motion\s*:\s*no-preference\s*\)/g, reduced ? FALSE_QUERY : TRUE_QUERY);
        if (rule.media.mediaText !== next) rule.media.mediaText = next;
      }
    }
    const inner = (rule as CSSGroupingRule).cssRules;
    if (inner) walk(inner, reduced);
  }
}

/** Makes every stylesheet follow the choice. Sheets from other sites cannot be read and are skipped. */
function applyToSheets(reduced: boolean) {
  for (const sheet of Array.from(document.styleSheets)) {
    if (APPLIED.get(sheet) === reduced) continue;
    try {
      walk(sheet.cssRules, reduced);
      APPLIED.set(sheet, reduced);
    } catch {
      /* a sheet from another origin */
    }
  }
}

export function MotionGovernor() {
  const [note, setNote] = useState(false);

  useEffect(() => {
    // changes are gathered into one pass, so a burst of added sheets (a page opening, hot reload) costs one walk
    let pending = 0;
    const apply = () => {
      window.clearTimeout(pending);
      pending = window.setTimeout(() => applyToSheets(motionReduced()), 60);
    };
    applyToSheets(motionReduced());
    window.addEventListener("load", apply);
    window.addEventListener(MOTION_EVENT, apply);
    // a page that is opened later adds its own sheets
    const watcher = new MutationObserver((changes) => {
      for (const change of changes) {
        change.addedNodes.forEach((node) => {
          if (node instanceof HTMLLinkElement && node.rel === "stylesheet") node.addEventListener("load", apply, { once: true });
          else if (node instanceof HTMLStyleElement) apply();
        });
      }
    });
    watcher.observe(document.head, { childList: true });
    // the one-time note, only on a device that asks for less motion and only until the visitor has chosen
    const timer = window.setTimeout(() => setNote(deviceAsksForLessMotion() && !motionChosen()), 2500);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(pending);
      window.removeEventListener("load", apply);
      window.removeEventListener(MOTION_EVENT, apply);
      watcher.disconnect();
    };
  }, []);

  if (!note) return null;
  return (
    <div role="region" aria-label="Animation settings" className="mg-note">
      <Wind className="h-5 w-5 flex-none text-[var(--nx-aqua)]" aria-hidden="true" />
      <p>
        <Ur en="Animations and 3D demonstrations are on. Your device asks for less motion — prefer it calm?" ur="Animations aur 3D demonstrations on hain. Aap ka device kam motion maangta hai — kya calm rakhein?" />
      </p>
      <div className="mg-actions">
        <button type="button" onClick={() => { setMotion("reduced"); setNote(false); }}><Ur en="Reduce motion" ur="Motion kam karein" /></button>
        <button type="button" className="mg-keep" onClick={() => { setMotion("full"); setNote(false); }}><Ur en="Keep animations" ur="Animations rakhein" /></button>
      </div>
      <button type="button" className="mg-close" onClick={() => setNote(false)} aria-label="Close"><X className="h-4 w-4" aria-hidden="true" /></button>
    </div>
  );
}

/** Footer switch: the visitor's own choice, kept in the browser. */
export function MotionToggle() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    setReduced(motionReduced());
    const sync = () => setReduced(motionReduced());
    window.addEventListener(MOTION_EVENT, sync);
    return () => window.removeEventListener(MOTION_EVENT, sync);
  }, []);
  return (
    <button
      type="button"
      onClick={() => setMotion(reduced ? "full" : "reduced")}
      aria-pressed={reduced}
      title={reduced ? "Reduced motion is on: animations and 3D demonstrations stay calm. Click to switch them back on." : "Prefer less movement? Switch animations and 3D demonstrations to calm."}
      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--nx-line)] px-3 py-1 text-xs font-semibold !text-[var(--nx-dim)] hover:!text-white"
    >
      <span aria-hidden="true">{reduced ? "◌" : "◉"}</span>
      {reduced ? <Ur en="Reduced motion: on" ur="Reduced motion: on" /> : <Ur en="Animations: on" ur="Animations: on" />}
    </button>
  );
}
